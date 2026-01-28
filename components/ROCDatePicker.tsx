import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
            <div onClick={() => setShow(!show)} className="full-width-input cursor-pointer flex items-center justify-between bg-white">
                <span className="font-bold text-xl">{displayValue}</span>
                <Calendar className="w-6 h-6 text-slate-500" />
            </div>
            {show && (
                <div className="absolute top-full left-0 z-50 mt-2 w-full sm:w-80 bg-white rounded-xl shadow-2xl border-2 border-sky-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4 bg-sky-50 p-2 rounded-lg">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-sky-200 rounded-full transition"><ChevronLeft className="w-6 h-6 text-sky-700" /></button>
                        <span className="font-black text-xl text-sky-800 tracking-wider">民國 {rocYear} 年 {month + 1} 月</span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-sky-200 rounded-full transition"><ChevronRight className="w-6 h-6 text-sky-700" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="text-sm text-slate-400 font-black">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((d, i) => (
                            <div key={i} className="aspect-square">
                                {d && (
                                    <button onClick={() => handleSelectDate(d)} className={`w-full h-full rounded-lg flex items-center justify-center font-bold text-lg transition-all active:scale-90 ${value && d.toDateString() === new Date(value).toDateString() ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-100 text-slate-700'} ${d.getDay() === 0 || d.getDay() === 6 ? 'text-red-500' : ''} ${value && d.toDateString() === new Date(value).toDateString() ? '!text-white' : ''}`}>{d.getDate()}</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};