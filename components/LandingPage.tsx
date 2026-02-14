
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
        bg: 'bg-[#0ea5e9]', // Sky-500
        border: 'border-[#0369a1]', // Sky-700
        shadow: 'shadow-sky-200',
        darkBg: 'dark:bg-sky-900/40',
        darkBorder: 'dark:border-sky-500',
        darkText: 'dark:text-sky-300'
    },
    { 
        type: 'land', 
        label: '土地調查', 
        icon: MapIcon, 
        bg: 'bg-[#22c55e]', // Green-500
        border: 'border-[#15803d]', // Green-700
        shadow: 'shadow-green-200',
        darkBg: 'dark:bg-green-900/40',
        darkBorder: 'dark:border-green-500',
        darkText: 'dark:text-green-300'
    },
    { 
        type: 'factory', 
        label: '廠房調查', 
        icon: Factory, 
        bg: 'bg-[#f97316]', // Orange-500
        border: 'border-[#c2410c]', // Orange-700
        shadow: 'shadow-orange-200',
        darkBg: 'dark:bg-orange-900/40',
        darkBorder: 'dark:border-orange-500',
        darkText: 'dark:text-orange-300'
    },
    { 
        type: 'parking', 
        label: '車位調查', 
        icon: Car, 
        bg: 'bg-[#f43f5e]', // Rose-500
        border: 'border-[#be123c]', // Rose-700
        shadow: 'shadow-rose-200',
        darkBg: 'dark:bg-rose-900/40',
        darkBorder: 'dark:border-rose-500',
        darkText: 'dark:text-rose-300'
    },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSelect, isDarkMode, toggleTheme }) => {
    return (
        // Changed container to allow scrolling: h-full, overflow-y-auto ensures content is reachable
        <div className="h-full w-full bg-[#FDFBF7] dark:bg-slate-950 overflow-y-auto overflow-x-hidden relative transition-colors duration-300">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={toggleTheme}
                    className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full shadow-lg border-2 border-white dark:border-slate-700 transition-all active:scale-95"
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? (
                        <Sun className="w-8 h-8 text-amber-400 fill-amber-400" />
                    ) : (
                        <Moon className="w-8 h-8 text-slate-600 fill-slate-600" />
                    )}
                </button>
            </div>

            {/* Decorative Background Elements - Fixed position to prevent scrolling issues */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100 dark:bg-sky-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
            
            {/* Content Container - min-h-full for vertical centering when content fits, scrolling when it doesn't */}
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8 md:p-6 relative z-10">
                <div className="w-full max-w-xl flex flex-col gap-5 md:gap-8">
                    {/* Header Card - Adjusted padding and font sizes for mobile */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-4 border-white dark:border-slate-700 ring-4 ring-slate-100 dark:ring-slate-900 text-center space-y-3 md:space-y-4 animate-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            幸福家不動產
                        </h1>
                        <div className="w-16 md:w-24 h-2 bg-orange-400 mx-auto rounded-full shadow-sm shadow-orange-200 dark:shadow-none"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xl md:text-2xl tracking-widest">
                            物件現況調查系統
                        </p>
                    </div>

                    {/* Options Grid - Optimized spacing for smaller screens */}
                    <div className="grid gap-4 md:gap-5 animate-in slide-in-from-bottom-8 duration-700 delay-150">
                        {OPTIONS.map((opt) => (
                            <button 
                                key={opt.type}
                                onClick={() => onSelect(opt.type)} 
                                className={`group relative w-full py-5 md:py-6 px-6 md:px-8 rounded-[1.5rem] md:rounded-[2rem] text-white transition-all duration-200 
                                border-4 border-transparent border-b-[6px] md:border-b-[8px] 
                                hover:brightness-110 active:scale-[0.98] active:border-b-4 active:translate-y-[4px]
                                flex items-center justify-between shadow-xl 
                                ${opt.bg} ${opt.border} ${opt.shadow} 
                                ${opt.darkBg} ${opt.darkBorder} dark:shadow-none`}
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={`bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300`}>
                                        <opt.icon className={`w-8 h-8 md:w-12 md:h-12 text-white ${opt.darkText}`} strokeWidth={3} />
                                    </div>
                                    <span className={`text-2xl md:text-4xl font-black tracking-wide drop-shadow-md ${opt.darkText} dark:text-opacity-100 dark:drop-shadow-none`}>
                                        {opt.label}
                                    </span>
                                </div>
                                <div className={`bg-white/20 rounded-full p-1.5 md:p-2 opacity-0 group-hover:opacity-100 transition-opacity ${opt.darkText}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-2 md:mt-0">
                        <p className="text-slate-400 dark:text-slate-600 font-bold text-xs md:text-sm tracking-wider uppercase">
                            Singfujia Realty Inc. © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};