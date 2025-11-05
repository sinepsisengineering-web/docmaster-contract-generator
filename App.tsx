
import React, { useState, useCallback } from 'react';
import { Template, Contract, Category, MarkerValue } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import TemplateManager from './components/TemplateManager';
import ContractGenerator from './components/ContractGenerator';
import ContractArchive from './components/ContractArchive';
import Settings from './components/Settings';

export type View = 'templates' | 'generator' | 'archive' | 'settings';

const App: React.FC = () => {
    const [view, setView] = useState<View>('generator');
    const [templates, setTemplates] = useLocalStorage<Template[]>('templates', []);
    const [contracts, setContracts] = useLocalStorage<Contract[]>('contracts', []);
    const [categories, setCategories] = useLocalStorage<Category[]>('categories', []);
    const [settings, setSettings] = useLocalStorage<{ logo: string | null; defaultMarkers: MarkerValue[] }>('settings', { logo: null, defaultMarkers: [] });

    const handleSetView = useCallback((newView: View) => {
        setView(newView);
    }, []);
    
    const renderView = () => {
        switch (view) {
            case 'templates':
                return <TemplateManager 
                            templates={templates} 
                            setTemplates={setTemplates} 
                            categories={categories} 
                            setCategories={setCategories} 
                        />;
            case 'archive':
                return <ContractArchive contracts={contracts} />;
            case 'settings':
                return <Settings settings={settings} setSettings={setSettings} />;
            case 'generator':
            default:
                return <ContractGenerator 
                            templates={templates} 
                            contracts={contracts} 
                            setContracts={setContracts}
                            settings={settings}
                        />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Header currentView={view} setView={handleSetView} />
            <main className="p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
        </div>
    );
};

export default App;