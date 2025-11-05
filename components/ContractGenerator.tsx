
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Template, Contract, MarkerValue, MarkerInfo } from '../types';
import { extractMarkers, getCounterpartyMarkers } from '../utils/markerUtils';
import { generateContractNumber } from '../utils/numberingUtils';
import { generatePdf, generateDocx } from '../services/documentService';
import { getMarkerInputType } from '../services/geminiService';
import { LoadingIcon, DownloadIcon } from './icons/Icons';

interface ContractGeneratorProps {
    templates: Template[];
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    settings: { logo: string | null; defaultMarkers: MarkerValue[] };
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({ templates, contracts, setContracts, settings }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedAppendixIds, setSelectedAppendixIds] = useState<string[]>([]);
    const [markers, setMarkers] = useState<MarkerInfo[]>([]);
    const [markerValues, setMarkerValues] = useState<MarkerValue[]>([]);
    const [generatedContract, setGeneratedContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);

    const mainTemplates = templates.filter(t => !t.isAppendix);
    const appendixTemplates = templates.filter(t => t.isAppendix);

    useEffect(() => {
        const fetchMarkerInfo = async () => {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (!template) {
                setMarkers([]);
                setMarkerValues([]);
                return;
            }

            let combinedContent = template.header + '\n' + template.body;
            selectedAppendixIds.forEach(id => {
                const appendix = templates.find(t => t.id === id);
                if (appendix) combinedContent += `\n${appendix.body}`;
            });

            // Get markers from template body
            const userMarkerNames = extractMarkers(combinedContent);
            // Get system-generated markers based on template settings
            const counterpartyMarkerNames = getCounterpartyMarkers(template.counterpartyType);
            
            // Always add a marker for the city for the preamble
            const allMarkerNames = ['ГОРОД', ...userMarkerNames, ...counterpartyMarkerNames];
            if (!template.autoDate) allMarkerNames.push('ДАТА_ДОГОВОРА');
            if (!template.autoNumbering) allMarkerNames.push('НОМЕР_ДОГОВОРА');

            const uniqueMarkerNames = Array.from(new Set(allMarkerNames));

            if(uniqueMarkerNames.length === 0) {
                 setMarkers([]);
                 setMarkerValues([]);
                 return;
            }
            
            setIsLoading(true);
            try {
                const markerInfoPromises = uniqueMarkerNames.map(name => getMarkerInputType(name));
                const results = await Promise.all(markerInfoPromises);
                setMarkers(results);
                
                const initialValues: MarkerValue[] = results.map(marker => {
                    const defaultMarker = settings.defaultMarkers.find(dm => dm.name === marker.name);
                    return { name: marker.name, value: defaultMarker ? defaultMarker.value : '' };
                });
                
                setMarkerValues(initialValues);
            } catch (error) {
                console.error("Error fetching marker types from Gemini:", error);
                const fallbackMarkers = uniqueMarkerNames.map(name => ({ name, type: 'text' as 'text' }));
                setMarkers(fallbackMarkers);
                setMarkerValues(fallbackMarkers.map(m => ({ name: m.name, value: '' })));
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedTemplateId) {
            fetchMarkerInfo();
        } else {
            setMarkers([]);
            setMarkerValues([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTemplateId, selectedAppendixIds, templates, settings.defaultMarkers]);
    
    const handleAppendixChange = (appendixId: string) => {
        setSelectedAppendixIds(prev =>
            prev.includes(appendixId)
                ? prev.filter(id => id !== appendixId)
                : [...prev, appendixId]
        );
    };

    const handleMarkerChange = (name: string, value: string) => {
        setMarkerValues(prev =>
            prev.map(mv => (mv.name === name ? { ...mv, value } : mv))
        );
    };

    const handleGenerate = () => {
        const template = templates.find(t => t.id === selectedTemplateId);
        if (!template) return;

        // --- Contract Assembly ---
        let finalContent = '';
        
        // 1. Get Date, Number, and City
        const contractDate = template.autoDate 
            ? new Date().toLocaleDateString('ru-RU')
            : markerValues.find(m => m.name === 'ДАТА_ДОГОВОРА')?.value || '[ДАТА НЕ УКАЗАНА]';
        const contractNumber = template.autoNumbering 
            ? generateContractNumber(template.abbreviation, contracts)
            : markerValues.find(m => m.name === 'НОМЕР_ДОГОВОРА')?.value || '[НОМЕР НЕ УКАЗАН]';
        const city = markerValues.find(m => m.name === 'ГОРОД')?.value || '[Город не указан]';

        // 2. Header
        finalContent += `<div style="text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 20px;">${template.header.toUpperCase()} № ${contractNumber}</div>`;

        // 3. Preamble
        const { companyName, representative, basis, roleName } = template.partyOneDetails;
        const counterpartyNameValue = (template.counterpartyType === 'individual' 
            ? markerValues.find(m => m.name === 'ФИО_КОНТРАГЕНТА')?.value 
            : markerValues.find(m => m.name === 'НАИМЕНОВАНИЕ_КОМПАНИИ')?.value) || '[Контрагент не указан]';
        const counterpartyRole = "Заказчик";

        const preamble = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <p>г. ${city}</p>
                <p>${contractDate}</p>
            </div>
            <p style="margin-bottom: 20px; text-indent: 2em;">
                ${companyName}, в лице ${representative}, действующего(ей) на основании ${basis}, именуемое в дальнейшем «${roleName}», с одной стороны, и 
                ${counterpartyNameValue}, именуемый(ая) в дальнейшем «${counterpartyRole}», с другой стороны, совместно именуемые «Стороны», заключили настоящий договор о нижеследующем:
            </p>
        `;
        finalContent += preamble;

        // 4. Body
        let processedBody = template.body;
        markerValues.forEach(({ name, value }) => {
            const regex = new RegExp(`{{${name}}}`, 'g');
            processedBody = processedBody.replace(regex, value);
        });
        const bodyParagraphs = processedBody.split('\n').map(p => `<p style="text-indent: 2em;">${p}</p>`).join('');
        finalContent += `<div>${bodyParagraphs}</div>`;


        // 5. Appendices
        selectedAppendixIds.forEach(id => {
            const appendix = templates.find(t => t.id === id);
            if (appendix) {
                let processedAppendixBody = appendix.body;
                markerValues.forEach(({ name, value }) => {
                    const regex = new RegExp(`{{${name}}}`, 'g');
                    processedAppendixBody = processedAppendixBody.replace(regex, value);
                });
                 finalContent += `<div class="page-break" style="page-break-before: always;"></div><div style="text-align: center; font-weight: bold; margin-bottom: 20px;">${appendix.header}</div><div>${processedAppendixBody}</div>`;
            }
        });

        // 6. Footer (Parties)
        const counterpartyMarkers = getCounterpartyMarkers(template.counterpartyType);
        const counterpartyDetails = counterpartyMarkers.map(markerName => {
            const markerValue = markerValues.find(m => m.name === markerName)?.value || '';
            const cleanName = markerName.replace(/_/g, ' ');
            return `<strong>${cleanName}:</strong> ${markerValue}`;
        }).join('<br>');

        finalContent += `
            <h3 style="text-align: center; margin-top: 40px; page-break-before: auto;">РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h3>
            <div style="display: flex; justify-content: space-between; margin-top: 20px; gap: 40px;">
                <div style="width: 48%;">
                    <h4>${roleName.toUpperCase()}</h4>
                    <p>${template.partyOneDetails.fullDetails.replace(/\n/g, '<br>')}</p>
                    <br/><br/>
                    <p>___________________ / ${representative.split(' ').slice(-2).join(' ')} /</p>
                    <p style="font-size: 0.8em; text-align: center;">(подпись)</p>
                </div>
                <div style="width: 48%;">
                    <h4>${counterpartyRole.toUpperCase()}</h4>
                    <p>${counterpartyDetails}</p>
                    <br/><br/>
                    <p>___________________</p>
                    <p style="font-size: 0.8em; text-align: center;">(подпись)</p>
                </div>
            </div>
        `;
        // --- End Assembly ---

        const customerMarkerValue = counterpartyNameValue;
        
        const newContract: Contract = {
            id: crypto.randomUUID(),
            contractNumber: contractNumber,
            templateName: template.name,
            customerName: customerMarkerValue,
            content: finalContent,
            createdAt: new Date().toISOString(),
            markers: markerValues,
        };

        setGeneratedContract(newContract);
    };
    
    const handleSaveAndReset = () => {
        if (generatedContract) {
            setContracts([...contracts, generatedContract]);
            setGeneratedContract(null);
            setSelectedTemplateId('');
            setSelectedAppendixIds([]);
            setMarkers([]);
            setMarkerValues([]);
        }
    };
    
    if (generatedContract) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Предпросмотр: {generatedContract.contractNumber}</h2>
                 <div className="flex flex-wrap gap-4 mb-6">
                    <button onClick={() => generatePdf(previewRef.current, settings.logo, generatedContract.contractNumber)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"><DownloadIcon/> Скачать PDF</button>
                    <button onClick={() => generateDocx(previewRef.current, settings.logo, generatedContract.contractNumber)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><DownloadIcon/> Скачать DOCX</button>
                </div>
                <div ref={previewRef} id="contract-preview" className="prose max-w-none border p-8 rounded-md bg-gray-50 h-[60vh] overflow-y-auto">
                    {settings.logo && <img src={settings.logo} alt="logo" className="max-h-20 mb-8" />}
                    <style>{`
                        .page-break { page-break-before: always; }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: generatedContract.content }} />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setGeneratedContract(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Назад к редактированию</button>
                    <button onClick={handleSaveAndReset} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Сохранить в архив и создать новый</button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
                <h2 className="text-xl font-semibold mb-2">1. Выбор шаблона и приложений</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Основной договор</label>
                    <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    >
                        <option value="">-- Выберите основной договор --</option>
                        {mainTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {selectedTemplateId && appendixTemplates.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Приложения</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                            {appendixTemplates.map(t => (
                                <div key={t.id} className="flex items-center">
                                    <input
                                        id={`appendix-${t.id}`}
                                        type="checkbox"
                                        checked={selectedAppendixIds.includes(t.id)}
                                        onChange={() => handleAppendixChange(t.id)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`appendix-${t.id}`} className="ml-2 block text-sm text-gray-900">{t.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg row-span-2">
                <h2 className="text-xl font-semibold mb-4">2. Заполните данные</h2>
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <LoadingIcon />
                        <span className="ml-2">Анализ маркеров...</span>
                    </div>
                )}
                {!isLoading && markers.length > 0 && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {markers.map(marker => (
                            <div key={marker.name}>
                                <label className="block text-sm font-medium text-gray-700">{marker.name.replace(/_/g, ' ')}</label>
                                {marker.type === 'textarea' ? (
                                    <textarea
                                        value={markerValues.find(mv => mv.name === marker.name)?.value || ''}
                                        onChange={(e) => handleMarkerChange(marker.name, e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                        rows={3}
                                    />
                                ) : marker.type === 'select' ? (
                                    <select
                                        value={markerValues.find(mv => mv.name === marker.name)?.value || ''}
                                        onChange={(e) => handleMarkerChange(marker.name, e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                    >
                                        <option value="">-- Выберите --</option>
                                        {marker.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={marker.type}
                                        value={markerValues.find(mv => mv.name === marker.name)?.value || ''}
                                        onChange={(e) => handleMarkerChange(marker.name, e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
                 {!isLoading && selectedTemplateId && markers.length === 0 && (
                    <p className="text-gray-500">В выбранном шаблоне не найдено маркеров для заполнения.</p>
                )}
                 {!selectedTemplateId && (
                     <p className="text-gray-500">Выберите шаблон, чтобы начать.</p>
                 )}
                 {markers.length > 0 && (
                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedTemplateId}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            Сгенерировать договор
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ContractGenerator;