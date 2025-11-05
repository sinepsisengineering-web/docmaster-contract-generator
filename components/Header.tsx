
import React from 'react';
import type { View } from '../App';
import { FileText, PlusCircle, Archive, Settings } from './icons/Icons';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'generator', label: 'Генератор', icon: <PlusCircle /> },
        { view: 'templates', label: 'Шаблоны', icon: <FileText /> },
        { view: 'archive', label: 'Архив', icon: <Archive /> },
        { view: 'settings', label: 'Настройки', icon: <Settings /> },
    ];

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6zm3 4a1 1 0 011-1h2a1 1 0 110 2H10a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-xl font-bold text-slate-800">ДокМастер</h1>
                    </div>
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map(({ view, label, icon }) => (
                            <button
                                key={view}
                                onClick={() => setView(view)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                                    currentView === view
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {icon}
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
             <div className="md:hidden border-t border-slate-200">
                <nav className="flex justify-around p-2">
                    {navItems.map(({ view, label, icon }) => (
                        <button
                            key={view}
                            onClick={() => setView(view)}
                             className={`flex flex-col items-center w-full p-2 rounded-md text-xs font-medium transition-colors duration-150 ${
                                    currentView === view
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            {icon}
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;