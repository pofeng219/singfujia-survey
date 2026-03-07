import React from 'react';
import { Sun, Moon, User, Users } from 'lucide-react';
import { InterfaceMode } from './InterfaceContext';

interface ModeSelectionPageProps {
    onSelect: (mode: InterfaceMode) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const ModeSelectionPage: React.FC<ModeSelectionPageProps> = ({ onSelect, isDarkMode, toggleTheme }) => {
    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto overflow-x-hidden relative transition-colors duration-300">
            {/* Theme Toggle */}
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

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-20 w-96 h-96 bg-sky-100/50 dark:bg-sky-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8 md:p-6 relative z-10">
                <div className="w-full max-w-xl flex flex-col gap-6 md:gap-8">
                    {/* Header Card */}
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-3 md:space-y-4 animate-in slide-in-from-bottom-4 duration-700">
                        <img 
                            src="https://lh3.googleusercontent.com/d/1kibsmrcTX_fDtniNVqWDQXkVP3ZNwGwI" 
                            alt="幸福家不動產 Logo" 
                            className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-4" 
                            referrerPolicy="no-referrer"
                        />
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            幸福家不動產
                        </h1>
                        <div className="w-12 h-1.5 bg-sky-500 mx-auto rounded-full my-6"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg md:text-xl tracking-[0.2em] uppercase">
                            物件現況調查系統
                        </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-150">
                        <button 
                            onClick={() => onSelect('standard')} 
                            className="group relative w-full py-6 px-6 rounded-2xl transition-all duration-200 border-[3px] border-b-[6px] active:border-b-[3px] active:translate-y-[3px] hover:brightness-105 active:scale-[0.99] flex items-center justify-between bg-sky-100 border-sky-600 text-sky-900 shadow-sm dark:bg-sky-900 dark:border-sky-500 dark:text-sky-50"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-sky-200/50 dark:bg-sky-800/50 p-3 rounded-xl group-hover:scale-105 transition-transform duration-300">
                                    <Users className="w-7 h-7 text-sky-700 dark:text-sky-300" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xl md:text-2xl font-black tracking-wide">
                                        標準介面
                                    </span>
                                    <span className="text-sm md:text-base font-bold text-sky-700 dark:text-sky-300 mt-1">
                                        適合一般大眾，版面緊湊資訊量大
                                    </span>
                                </div>
                            </div>
                            <div className="bg-sky-200/50 dark:bg-sky-800/50 rounded-full p-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <button 
                            onClick={() => onSelect('friendly')} 
                            className="group relative w-full py-6 px-6 rounded-2xl transition-all duration-200 border-[3px] border-b-[6px] active:border-b-[3px] active:translate-y-[3px] hover:brightness-105 active:scale-[0.99] flex items-center justify-between bg-amber-100 border-amber-600 text-amber-900 shadow-sm dark:bg-amber-900 dark:border-amber-500 dark:text-amber-50"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-amber-200/50 dark:bg-amber-800/50 p-3 rounded-xl group-hover:scale-105 transition-transform duration-300">
                                    <User className="w-7 h-7 text-amber-700 dark:text-amber-300" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xl md:text-2xl font-black tracking-wide">
                                        友善介面
                                    </span>
                                    <span className="text-sm md:text-base font-bold text-amber-700 dark:text-amber-300 mt-1">
                                        適合長輩或平板，大字體大按鈕
                                    </span>
                                </div>
                            </div>
                            <div className="bg-amber-200/50 dark:bg-amber-800/50 rounded-full p-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
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
