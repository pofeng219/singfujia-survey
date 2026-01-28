
import React from 'react';
import { Home, Map as MapIcon, Car } from 'lucide-react';
import { SurveyType } from '../types';

interface LandingPageProps {
    onSelect: (type: SurveyType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelect }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center space-y-10 animate-in fade-in zoom-in duration-500">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">幸福家不動產</h1>
                    <p className="text-slate-500 font-bold text-lg tracking-widest">物件現況調查系統</p>
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-700">請選擇物件種類</h2>
                    <div className="grid gap-4">
                        <button onClick={() => onSelect('house')} className="relative w-full py-6 rounded-2xl bg-sky-600 text-white text-2xl font-black shadow-lg hover:bg-sky-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center text-center">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center"><Home className="w-8 h-8" /></div>
                            <span>成屋</span>
                        </button>
                        <button onClick={() => onSelect('land')} className="relative w-full py-6 rounded-2xl bg-emerald-600 text-white text-2xl font-black shadow-lg hover:bg-emerald-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center text-center">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center"><MapIcon className="w-8 h-8" /></div>
                            <span>土地</span>
                        </button>
                        <button onClick={() => onSelect('parking')} className="relative w-full py-6 rounded-2xl bg-rose-500 text-white text-2xl font-black shadow-lg hover:bg-rose-600 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center text-center">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center"><Car className="w-8 h-8" /></div>
                            <span>車位</span>
                        </button>
                    </div>
                </div>
                <p className="text-slate-400 text-sm font-bold">SINGFUJIA REALTY INC.</p>
            </div>
        </div>
    );
};
