

import React, { useState, useMemo } from 'react';
import type { Template, Category } from '../types';

interface TemplateManagerProps {
    templates: Template[];
    setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const TemplateEditor: React.FC<{
    template: Template | null;
    onSave: (template: Template) => void;
    onCancel: () => void;
    categories: Category[];
}> = ({ template, onSave, onCancel, categories }) => {
    const [editedTemplate, setEditedTemplate] = useState<Template>(
        template || { 
            id: '', 
            name: '', 
            categoryId: null, 
            isAppendix: false, 
            abbreviation: '',
            header: '',
            body: '',
            autoDate: true,
            autoNumbering: true,
            partyOneDetails: { 
                roleName: 'Исполнитель', 
                companyName: '', 
                representative: '', 
                basis: '', 
                fullDetails: '' 
            },
            counterpartyType: 'individual'
        }
    );

    const handleSave = () => {
        if (editedTemplate.name && editedTemplate.body) {
            onSave({ ...editedTemplate, id: editedTemplate.id || crypto.randomUUID() });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{template ? 'Редактировать шаблон' : 'Новый шаблон'}</h3>
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    
                    {/* Basic Info */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold px-2">Основная информация</legend>
                        <div className="space-y-4">
                             <input
                                type="text"
                                placeholder="Название шаблона (напр., Договор о приемке квартиры)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                value={editedTemplate.name}
                                onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Аббревиатура (макс. 7 симв., напр., ПРИЕМ)"
                                maxLength={7}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                value={editedTemplate.abbreviation}
                                onChange={(e) => setEditedTemplate({ ...editedTemplate, abbreviation: e.target.value.toUpperCase() })}
                            />
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                value={editedTemplate.categoryId || ''}
                                onChange={(e) => setEditedTemplate({ ...editedTemplate, categoryId: e.target.value || null })}
                            >
                                <option value="">Без категории</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="flex items-center">
                                <input
                                    id="isAppendix"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    checked={editedTemplate.isAppendix}
                                    onChange={(e) => setEditedTemplate({ ...editedTemplate, isAppendix: e.target.checked })}
                                />
                                <label htmlFor="isAppendix" className="ml-2 block text-sm text-gray-900">Это приложение к договору</label>
                            </div>
                        </div>
                    </fieldset>

                    {/* Content */}
                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold px-2">Содержимое договора</legend>
                        <div className="space-y-4">
                             <textarea
                                placeholder="Шапка договора (напр., ДОГОВОР ОКАЗАНИЯ УСЛУГ)"
                                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                value={editedTemplate.header}
                                onChange={(e) => setEditedTemplate({ ...editedTemplate, header: e.target.value })}
                            ></textarea>
                            <textarea
                                placeholder="Начните ввод с пункта 1 (напр., '1. Предмет договора...'). Преамбула (город, дата, стороны) будет добавлена автоматически."
                                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                value={editedTemplate.body}
                                onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
                            ></textarea>
                            <p className="text-xs text-gray-500 -mt-2">
                                <strong>Важно:</strong> Не вводите здесь город, дату или преамбулу. Программа сформирует их автоматически на основе настроек и маркеров.
                            </p>
                        </div>
                    </fieldset>
                    
                     {/* Settings */}
                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold px-2">Настройки документа</legend>
                         <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="autoNumbering"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    checked={editedTemplate.autoNumbering}
                                    onChange={(e) => setEditedTemplate({ ...editedTemplate, autoNumbering: e.target.checked })}
                                />
                                <label htmlFor="autoNumbering" className="ml-2 block text-sm text-gray-900">
                                    Автоматически генерировать номер договора
                                    <span className="text-xs text-gray-500 block">Если отключено, будет добавлен маркер {'{{НОМЕР_ДОГОВОРА}}'}</span>
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="autoDate"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    checked={editedTemplate.autoDate}
                                    onChange={(e) => setEditedTemplate({ ...editedTemplate, autoDate: e.target.checked })}
                                />
                                <label htmlFor="autoDate" className="ml-2 block text-sm text-gray-900">
                                    Автоматически подставлять текущую дату
                                    <span className="text-xs text-gray-500 block">Если отключено, будет добавлен маркер {'{{ДАТА_ДОГОВОРА}}'}</span>
                                </label>
                            </div>
                        </div>
                    </fieldset>

                     {/* Parties */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold px-2">Реквизиты сторон</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Party One */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-800">Ваша сторона (Сторона 1)</h4>
                                <input type="text" placeholder="Роль в договоре (напр., Исполнитель)" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" value={editedTemplate.partyOneDetails.roleName} onChange={(e) => setEditedTemplate(t => ({...t, partyOneDetails: {...t.partyOneDetails, roleName: e.target.value}}))} />
                                <input type="text" placeholder="Наименование компании / ФИО" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" value={editedTemplate.partyOneDetails.companyName} onChange={(e) => setEditedTemplate(t => ({...t, partyOneDetails: {...t.partyOneDetails, companyName: e.target.value}}))} />
                                <input type="text" placeholder="Представитель (напр., в лице...)" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" value={editedTemplate.partyOneDetails.representative} onChange={(e) => setEditedTemplate(t => ({...t, partyOneDetails: {...t.partyOneDetails, representative: e.target.value}}))} />
                                <input type="text" placeholder="Основание (напр., действующего на...)" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" value={editedTemplate.partyOneDetails.basis} onChange={(e) => setEditedTemplate(t => ({...t, partyOneDetails: {...t.partyOneDetails, basis: e.target.value}}))} />
                                <textarea placeholder="Полные реквизиты для подвала (ИНН, ОГРН...)" className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" value={editedTemplate.partyOneDetails.fullDetails} onChange={(e) => setEditedTemplate(t => ({...t, partyOneDetails: {...t.partyOneDetails, fullDetails: e.target.value}}))} ></textarea>
                            </div>
                            {/* Counterparty */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-800">Контрагент (Сторона 2)</h4>
                                <select 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                    value={editedTemplate.counterpartyType}
                                    onChange={(e) => setEditedTemplate({ ...editedTemplate, counterpartyType: e.target.value as 'individual' | 'legal' })}
                                >
                                    <option value="individual">Физическое лицо</option>
                                    <option value="legal">Юридическое лицо</option>
                                </select>
                                <p className="text-xs text-gray-500">Программа автоматически добавит необходимые маркеры (например, {'{{ФИО}}'} или {'{{НАИМЕНОВАНИЕ_КОМПАНИИ}}'}) при генерации договора.</p>
                            </div>
                        </div>
                    </fieldset>

                </div>
                 {/* Actions */}
                <div className="pt-5 mt-auto">
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Отмена
                        </button>
                        <button type="button" onClick={handleSave} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, setTemplates, categories, setCategories }) => {
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSaveTemplate = (template: Template) => {
        setTemplates(prev => {
            const existing = prev.find(t => t.id === template.id);
            if (existing) {
                return prev.map(t => t.id === template.id ? template : t);
            }
            return [...prev, template];
        });
        setIsCreating(false);
        setEditingTemplate(null);
    };

    const handleDeleteTemplate = (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот шаблон?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Управление шаблонами</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Создать шаблон
                </button>
            </div>

            {(isCreating || editingTemplate) && (
                <TemplateEditor
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={() => { setIsCreating(false); setEditingTemplate(null); }}
                    categories={categories}
                />
            )}
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аббревиатура</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Действия</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {templates.map(template => (
                            <tr key={template.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.abbreviation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.isAppendix ? 'Приложение' : 'Договор'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => setEditingTemplate(template)} className="text-indigo-600 hover:text-indigo-900">Редактировать</button>
                                    <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-600 hover:text-red-900">Удалить</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {templates.length === 0 && <p className="text-center text-gray-500 py-4">Шаблоны не найдены.</p>}
            </div>
        </div>
    );
};

export default TemplateManager;
