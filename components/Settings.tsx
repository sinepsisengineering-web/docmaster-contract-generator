
import React, { useState } from 'react';
import type { MarkerValue } from '../types';

interface SettingsProps {
    settings: { logo: string | null; defaultMarkers: MarkerValue[] };
    setSettings: React.Dispatch<React.SetStateAction<{ logo: string | null; defaultMarkers: MarkerValue[] }>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
    const [newMarker, setNewMarker] = useState<MarkerValue>({ name: '', value: '' });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddMarker = () => {
        if (newMarker.name && !settings.defaultMarkers.some(m => m.name === newMarker.name)) {
            setSettings(prev => ({ ...prev, defaultMarkers: [...prev.defaultMarkers, newMarker] }));
            setNewMarker({ name: '', value: '' });
        }
    };
    
    const handleRemoveMarker = (name: string) => {
        setSettings(prev => ({ ...prev, defaultMarkers: prev.defaultMarkers.filter(m => m.name !== name) }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Логотип компании</h2>
                <div className="flex items-center space-x-6">
                    {settings.logo && <img src={settings.logo} alt="Company Logo" className="h-20 w-auto border p-1 rounded-md" />}
                    <div>
                        <input type="file" id="logo-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
                        <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            {settings.logo ? 'Изменить логотип' : 'Загрузить логотип'}
                        </label>
                         {settings.logo && <button onClick={() => setSettings(prev => ({...prev, logo: null}))} className="ml-2 text-red-500 hover:text-red-700">Удалить</button>}
                        <p className="text-sm text-gray-500 mt-2">Рекомендуется .png с прозрачным фоном.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Значения по умолчанию для маркеров</h2>
                <p className="text-sm text-gray-500 mb-4">Сохраните часто используемые значения (например, реквизиты вашей компании), чтобы они подставлялись автоматически.</p>

                <div className="space-y-2 mb-6">
                    {settings.defaultMarkers.map(marker => (
                        <div key={marker.name} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                            <span className="font-semibold text-gray-700 w-1/3">{`{{${marker.name}}}`}</span>
                            <span className="text-gray-900 w-2/3 truncate">{marker.value}</span>
                            <button onClick={() => handleRemoveMarker(marker.name)} className="text-red-500 hover:text-red-700 ml-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-2 p-4 border-t">
                    <div className="flex-grow w-full">
                        <label className="block text-sm font-medium text-gray-700">Название маркера (без скобок)</label>
                        <input
                            type="text"
                            placeholder="напр., РЕКВИЗИТЫ_ИСПОЛНИТЕЛЯ"
                            value={newMarker.name}
                            onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                        />
                    </div>
                    <div className="flex-grow w-full">
                         <label className="block text-sm font-medium text-gray-700">Значение по умолчанию</label>
                        <input
                            type="text"
                            placeholder="напр., ИП Иванов И.И., ИНН 123456..."
                            value={newMarker.value}
                            onChange={(e) => setNewMarker({ ...newMarker, value: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                        />
                    </div>
                    <button onClick={handleAddMarker} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
