
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const formatDateROC = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear() - 1911;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

interface ROCDatePickerProps {
    value: string;
    onChange: (date: string) => void;
}

export const ROCDatePicker: React.FC<ROCDatePickerProps> = ({ value, onChange }) => {
    const [show, setShow] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dateValue = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(dateValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShow(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { if (show && value) setViewDate(new Date(value)); }, [show, value]);

    const handlePrevMonth = (e: React.MouseEvent) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); };
    const handleNextMonth = (e: React.MouseEvent) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); };

    const handleSelectDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        setShow(false);
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        handleSelectDate(today);
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const rocYear = year - 1911;
    const displayValue = value ? formatDateROC(value) : '請點擊選擇日期';

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setShow(!show)} 
                className={`full-width-input cursor-pointer flex items-center justify-between bg-white transition-all duration-300 ${show ? 'ring-4 ring-sky-200 border-sky-400' : ''}`}
            >
                <span className={`font-black text-2xl ${value ? 'text-slate-800' : 'text-slate-400'}`}>
                    {displayValue}
                </span>
                <div className={`p-3 rounded-xl transition-colors ${show ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Calendar className="w-8 h-8" strokeWidth={2.5} />
                </div>
            </div>
            
            {show && (
                <div className="absolute top-full left-0 z-50 mt-4 w-full sm:w-[420px] bg-white rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] border-4 border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ring-4 ring-black/5">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 bg-slate-50 p-2 rounded-3xl border-2 border-slate-100">
                        <button onClick={handlePrevMonth} className="p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90 border-2 border-transparent hover:border-slate-200 group">
                            <ChevronLeft className="w-8 h-8 text-slate-400 group-hover:text-slate-800" strokeWidth={3} />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="font-black text-2xl text-slate-800 tracking-wider">民國 {rocYear} 年</span>
                            <span className="font-bold text-lg text-slate-400">{month + 1} 月</span>
                        </div>
                        <button onClick={handleNextMonth} className="p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90 border-2 border-transparent hover:border-slate-200 group">
                            <ChevronRight className="w-8 h-8 text-slate-400 group-hover:text-slate-800" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                        {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                            <div key={d} className={`text-lg font-black ${i === 0 || i === 6 ? 'text-orange-500' : 'text-slate-400'}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-6">
                        {days.map((d, i) => {
                            if (!d) return <div key={i} className="aspect-square"></div>;
                            
                            const isSelected = value && d.toDateString() === new Date(value).toDateString();
                            const isToday = d.toDateString() === new Date().toDateString();
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            
                            return (
                                <div key={i} className="aspect-square">
                                    <button 
                                        onClick={() => handleSelectDate(d)} 
                                        className={`w-full h-full rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-200 active:scale-90 border-2 relative
                                        ${isSelected 
                                            ? 'bg-slate-800 text-white border-slate-900 shadow-lg scale-105 z-10' 
                                            : `bg-white hover:bg-slate-50 ${isWeekend ? 'text-orange-600 border-orange-100 hover:border-orange-200' : 'text-slate-700 border-slate-100 hover:border-slate-300'}`
                                        }
                                        ${isToday && !isSelected ? 'ring-2 ring-sky-300 ring-offset-1 bg-sky-50' : ''}`}
                                    >
                                        {d.getDate()}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <button 
                        onClick={handleToday}
                        className="w-full py-5 bg-sky-50 text-sky-700 font-black text-xl rounded-2xl border-2 border-sky-100 hover:bg-sky-100 hover:border-sky-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-b-4 active:border-b-2 active:translate-y-[2px]"
                    >
                        <Check className="w-6 h-6" strokeWidth={3} />
                        選擇今天 ({formatDateROC(new Date().toISOString())})
                    </button>
                </div>
            )}
        </div>
    );
};
