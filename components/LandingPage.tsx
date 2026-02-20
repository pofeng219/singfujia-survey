
import React from 'react';
import { Home, Map as MapIcon, Car, Factory, LucideIcon, Sun, Moon } from 'lucide-react';
import { SurveyType } from '../types';

interface LandingPageProps {
    onSelect: (type: SurveyType) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

interface MenuOption {
    type: SurveyType;
    label: string;
    icon: LucideIcon;
    bg: string;
    border: string;
    shadow: string;
    // New dark mode colors
    darkBg: string;
    darkBorder: string;
    darkText: string;
}

const OPTIONS: MenuOption[] = [
    { 
        type: 'house', 
        label: '成屋調查', 
        icon: Home, 
        bg: 'bg-sky-600', 
        border: 'border-sky-800', 
        shadow: 'shadow-lg shadow-sky-900/20',
        darkBg: 'dark:bg-sky-900/60',
        darkBorder: 'dark:border-sky-600',
        darkText: 'dark:text-sky-200'
    },
    { 
        type: 'land', 
        label: '土地調查', 
        icon: MapIcon, 
        bg: 'bg-emerald-600', 
        border: 'border-emerald-800', 
        shadow: 'shadow-lg shadow-emerald-900/20',
        darkBg: 'dark:bg-emerald-900/60',
        darkBorder: 'dark:border-emerald-600',
        darkText: 'dark:text-emerald-200'
    },
    { 
        type: 'factory', 
        label: '廠房調查', 
        icon: Factory, 
        bg: 'bg-orange-600', 
        border: 'border-orange-800', 
        shadow: 'shadow-lg shadow-orange-900/20',
        darkBg: 'dark:bg-orange-900/60',
        darkBorder: 'dark:border-orange-600',
        darkText: 'dark:text-orange-200'
    },
    { 
        type: 'parking', 
        label: '車位調查', 
        icon: Car, 
        bg: 'bg-rose-600', 
        border: 'border-rose-800', 
        shadow: 'shadow-lg shadow-rose-900/20',
        darkBg: 'dark:bg-rose-900/60',
        darkBorder: 'dark:border-rose-600',
        darkText: 'dark:text-rose-200'
    },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSelect, isDarkMode, toggleTheme }) => {
    return (
        // Changed container to allow scrolling: h-full, overflow-y-auto ensures content is reachable
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto overflow-x-hidden relative transition-colors duration-300">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={toggleTheme}
                    className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-800"
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? (
                        <Sun className="w-6 h-6 text-amber-400 fill-amber-400" />
                    ) : (
                        <Moon className="w-6 h-6 text-slate-600 fill-slate-600" />
                    )}
                </button>
            </div>

            {/* Decorative Background Elements - Fixed position to prevent scrolling issues */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-20 w-96 h-96 bg-sky-100/50 dark:bg-sky-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Content Container - min-h-full for vertical centering when content fits, scrolling when it doesn't */}
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8 md:p-6 relative z-10">
                <div className="w-full max-w-xl flex flex-col gap-6 md:gap-8">
                    {/* Header Card - Adjusted padding and font sizes for mobile */}
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-3 md:space-y-4 animate-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            幸福家不動產
                        </h1>
                        <div className="w-12 h-1.5 bg-sky-500 mx-auto rounded-full"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg md:text-xl tracking-wider">
                            物件現況調查系統
                        </p>
                    </div>

                    {/* Options Grid - Optimized spacing for smaller screens */}
                    <div className="grid gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-150">
                        {OPTIONS.map((opt) => (
                            <button 
                                key={opt.type}
                                onClick={() => onSelect(opt.type)} 
                                className={`group relative w-full py-5 px-6 rounded-2xl text-white transition-all duration-200 
                                border-b-[4px] active:border-b-0 active:translate-y-[4px]
                                hover:brightness-105 active:scale-[0.99]
                                flex items-center justify-between
                                ${opt.bg} ${opt.border} ${opt.shadow} 
                                ${opt.darkBg} ${opt.darkBorder} dark:shadow-none`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:scale-105 transition-transform duration-300`}>
                                        <opt.icon className={`w-7 h-7 text-white ${opt.darkText}`} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-xl md:text-2xl font-bold tracking-wide ${opt.darkText} dark:text-opacity-100`}>
                                        {opt.label}
                                    </span>
                                </div>
                                <div className={`bg-white/10 rounded-full p-2 opacity-60 group-hover:opacity-100 transition-opacity ${opt.darkText}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-4">
                        <p className="text-slate-400 dark:text-slate-600 font-medium text-xs tracking-wider uppercase">
                            Singfujia Realty Inc. © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};