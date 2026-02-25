
import React, { useEffect, useRef, useState } from 'react';
import { Info, Save, FileInput, Trash2, AlertCircle, ChevronRight, AlertTriangle, ChevronDown, CheckCircle2, X, Eraser, Check, HelpCircle, Mic } from 'lucide-react';
import { ValidationError } from '../types';

// Helper to determine color based on label content (Heuristic for Safety/Danger)
const getButtonColorClass = (checked: boolean, label: string, disabled: boolean) => {
    if (disabled) return 'bg-white border-slate-300 text-slate-300 opacity-50 cursor-not-allowed grayscale dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600';
    
    // Unchecked state (Physical feel - Thick border, shadow)
    if (!checked) return 'bg-white border-slate-300 border-b-slate-400 text-slate-600 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:border-b-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white';

    // Selected State (Warm Light Blue - Replaces Traffic Light)
    return 'bg-[#E0F2FE] border-[#7DD3FC] border-b-[#0EA5E9] text-[#0369A1] shadow-md dark:bg-sky-900/40 dark:border-sky-500 dark:border-b-sky-600 dark:text-sky-100';
};

// === CheckBox ===
interface CheckBoxProps {
    checked: boolean;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}
export const CheckBox: React.FC<CheckBoxProps> = ({ checked, label, onClick, disabled = false }) => (
    <div 
        onClick={() => !disabled && onClick()} 
        className={`w-full p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-4 border-b-[6px] md:border-b-[8px] font-black text-2xl md:text-4xl cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none active:scale-[0.98] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] relative overflow-hidden
        ${getButtonColorClass(checked, label, disabled)}`}
    >
        <span className="relative z-10 flex items-center justify-center gap-2">
            {checked && <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 fill-white" strokeWidth={2.5} />}
            {label}
        </span>
    </div>
);

// === Radio Button Group ===
interface RadioGroupProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    layout?: 'flex' | 'grid';
    cols?: number;
    disabled?: boolean;
    spanFullOption?: string; // New prop: which option text should span full width
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, layout = 'flex', cols = 0, disabled = false, spanFullOption }) => {
    // Stage 2: Intelligent Layout Detection
    // Default force vertical (1 column). Only switch to horizontal (2 columns) if:
    // 1. Exactly 2 options
    // 2. Both options are very short (<= 4 chars)
    const isShortAndSimple = options.length === 2 && options.every(o => o.length <= 4);
    const gridCols = isShortAndSimple ? 'grid-cols-2' : 'grid-cols-1';
    
    // Helper to render label with subtitle if parentheses exist
    const renderLabel = (text: string, isSelected: boolean) => {
        const match = text.match(/^(.*?)(\s*[\(（].*?[\)）])$/);
        const mainText = match ? match[1] : text;
        const subText = match ? match[2].trim() : null;

        const mainContent = <span>{mainText}</span>;

        if (subText) {
            return (
                <div className="flex flex-col items-center justify-center w-full py-3 min-h-[5rem]">
                    <div className="mb-4 flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-white" strokeWidth={2.5} />}
                        {mainContent}
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900/40 px-3 py-2 rounded-lg w-full max-w-[95%] shadow-sm flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200 block leading-normal break-words whitespace-normal">
                            {subText}
                        </span>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-2">
                {isSelected && <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 fill-white" strokeWidth={2.5} />}
                {mainContent}
            </div>
        );
    };

    return (
        <div className={`grid ${gridCols} gap-3 md:gap-4`}>
            {options.map((v, idx) => {
                const isSelected = value === v;
                return (
                    <button
                        key={v}
                        type="button"
                        onClick={() => !disabled && onChange(value === v ? '' : v)}
                        className={`flex-1 py-4 px-3 md:py-5 md:px-4 rounded-[1.5rem] md:rounded-[1.75rem] font-black text-2xl md:text-3xl text-center flex items-center justify-center transition-all duration-200 select-none active:scale-[0.98] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] gap-2 md:gap-3 border-4 border-b-[6px] md:border-b-[8px] relative overflow-hidden
                        ${getButtonColorClass(isSelected, v, disabled)}`}
                    >
                        {renderLabel(v, isSelected)}
                    </button>
                );
            })}
        </div>
    );
};

// === Accordion Radio ===
interface AccordionRadioProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    renderDetail: (opt: string) => React.ReactNode;
    disabled?: boolean;
    cols?: number;
}
export const AccordionRadio: React.FC<AccordionRadioProps> = ({ options, value, onChange, renderDetail, disabled = false, cols = 0 }) => {
    // Stage 2: Intelligent Layout Detection
    const isShortAndSimple = options.length === 2 && options.every(o => o.length <= 4);
    const gridClass = isShortAndSimple ? 'grid grid-cols-2' : 'grid grid-cols-1';

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div className={`${gridClass} gap-3 md:gap-4`}>
                {options.map((opt, idx) => {
                    const isSelected = value === opt;
                    return (
                        <button 
                            key={opt}
                            type="button" 
                            disabled={disabled} 
                            onClick={() => onChange(value === opt ? '' : opt)} 
                            className={`flex-1 min-w-[100px] md:min-w-[120px] py-4 px-3 md:py-6 md:px-6 rounded-[1.5rem] md:rounded-[1.75rem] font-black text-2xl md:text-4xl text-center flex justify-center items-center transition-all duration-200 select-none active:scale-[0.98] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] gap-2 md:gap-4 border-4 border-b-[6px] md:border-b-[8px] relative overflow-hidden
                            ${getButtonColorClass(isSelected, opt, disabled)}`}
                        >
                            <span className="flex items-center gap-2">
                                {isSelected && <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 fill-white" strokeWidth={2.5} />}
                                <span>{opt}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            {value && renderDetail(value) && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 w-full">
                    {renderDetail(value)}
                </div>
            )}
        </div>
    );
};

// === Accordion Option (New) ===
interface AccordionOptionProps {
    label: string;
    subLabel?: string;
    checked: boolean;
    onClick: () => void;
}

export const AccordionOption: React.FC<AccordionOptionProps> = ({ label, subLabel, checked, onClick }) => (
    <div
        onClick={onClick}
        className={`w-[90%] mx-auto min-h-[65px] flex items-center justify-between px-5 py-3 rounded-xl border transition-all duration-200 cursor-pointer select-none mb-3
        ${checked
            ? 'bg-sky-50 border-sky-200 shadow-sm dark:bg-sky-900/30 dark:border-sky-700'
            : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'
        }`}
    >
        <div className="flex flex-col text-left">
            <span className={`text-xl font-bold leading-tight ${checked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                {label}
            </span>
            {subLabel && (
                <span className="text-lg text-slate-500 mt-1 leading-normal dark:text-slate-400">
                    {subLabel}
                </span>
            )}
        </div>
        
        {/* Icon Area */}
        <div className="flex-shrink-0 ml-4">
            {checked && (
                <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm dark:bg-slate-800 dark:border-emerald-400">
                    <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" strokeWidth={3} />
                </div>
            )}
        </div>
    </div>
);

// === Survey Section Wrapper (Accordion Style) ===
export type SectionStatus = 'incomplete' | 'complete' | 'neutral';

export const SurveySection: React.FC<{ 
    id?: string; 
    title?: React.ReactNode; 
    children: React.ReactNode; 
    highlighted?: boolean; 
    className?: string;
    hasActiveContent?: boolean; // Deprecated in favor of status, but kept for backward compatibility if needed
    status?: SectionStatus;
}> = ({ id, title, children, highlighted = false, className = '', hasActiveContent = false, status = 'neutral' }) => {
    // Default open, allowing users to collapse manually
    const [isOpen, setIsOpen] = useState(true);

    // Auto-expand if the section is highlighted (has error)
    useEffect(() => {
        if (highlighted) {
            setIsOpen(true);
        }
    }, [highlighted]);

    // Determine styles based on status
    const getStatusStyles = () => {
        if (highlighted) return 'error-highlight-anim border-3 border-slate-200'; // Error takes precedence
        
        switch (status) {
            case 'complete':
                return 'bg-[#ECFDF5] border-3 border-[#A7F3D0] dark:bg-emerald-900/30 dark:border-emerald-800'; // Soft bean paste green
            case 'incomplete':
                return 'bg-[#FFF1F2] border-3 border-[#FECDD3] dark:bg-rose-900/30 dark:border-rose-800'; // Low saturation warm red
            default:
                return 'bg-white border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
        }
    };

    const getTitleColor = () => {
        if (status === 'complete') return 'text-emerald-800 dark:text-emerald-300';
        if (status === 'incomplete') return 'text-rose-800 dark:text-rose-300';
        return hasActiveContent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100';
    };

    return (
        <div 
            id={id} 
            className={`warm-card rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all duration-500 ${getStatusStyles()} overflow-hidden ${className.replace(/space-y-\d+/g, '')}`} 
        >
            {title ? (
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-6 md:p-10 flex justify-between items-start gap-4 md:gap-6 cursor-pointer select-none transition-colors duration-200 ${isOpen ? '' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/50'}`}
                >
                    <div className="flex-grow pt-1 flex flex-col gap-2">
                        {typeof title === 'string' 
                            ? <p className={`text-[1.75rem] md:text-[2rem] font-black text-left leading-tight tracking-tight transition-colors duration-300 ${getTitleColor()}`}>{title}</p> 
                            : title
                        }
                        
                        {/* Prompt Text for Incomplete State */}
                        {status === 'incomplete' && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-base md:text-lg font-bold text-rose-500/90">
                                    尚有未填項目
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Accordion Arrow Icon & Hint */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isOpen ? 'bg-slate-100 border-slate-200 text-slate-600 rotate-0 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300' : 'bg-slate-800 border-slate-900 text-white -rotate-90 dark:bg-sky-600 dark:border-sky-500'}`}>
                            <ChevronDown className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
                        </div>
                        <span className={`text-[11px] md:text-[13px] font-black text-slate-400 transition-all duration-300 whitespace-nowrap dark:text-slate-500 ${isOpen ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                            點擊收合
                        </span>
                    </div>
                </div>
            ) : (
                // Spacer if no title exists
                <div className="h-4"></div>
            )}
            
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 md:px-10 pb-6 md:pb-10 pt-0">
                        {/* Divider Line */}
                        {title && <div className={`border-b-4 mb-6 md:mb-8 -mt-2 ${status === 'complete' ? 'border-emerald-100 dark:border-emerald-800' : (status === 'incomplete' ? 'border-rose-100 dark:border-rose-800' : 'border-slate-100 dark:border-slate-700')}`} />}
                        
                        {/* Content */}
                        <div className={className.includes('space-y') ? className : `space-y-8 md:space-y-10 ${className}`}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// === New Reusable Components for Phase 2 Refactor ===

// Standard visual block for questions (Gray bg, rounded)
export const QuestionBlock: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600 ${className}`}>
        {children}
    </div>
);

// "Yes/No" style question that reveals details when a specific option is chosen
interface BooleanRevealProps {
    label: React.ReactNode;
    value: string;
    onChange: (val: string) => void;
    options?: string[];
    trigger?: string | string[]; // Which value(s) triggers the reveal (default '是')
    disabled?: boolean;
    children?: React.ReactNode; // The content to reveal
    cols?: number;
}

export const BooleanReveal: React.FC<BooleanRevealProps> = ({ 
    label, 
    value, 
    onChange, 
    options = ['無', '有'], // Default updated to '無' / '有'
    trigger = '有', 
    disabled = false,
    children,
    cols = 2
}) => {
    const isTriggered = Array.isArray(trigger) ? trigger.includes(value) : value === trigger;
    
    return (
        <QuestionBlock className={disabled ? 'opacity-40 grayscale pointer-events-none' : ''}>
            <div className="mb-4 md:mb-6">
                {typeof label === 'string' ? <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 dark:text-slate-200">{label}</p> : label}
            </div>
            <RadioGroup 
                options={options} 
                value={value || ''} 
                onChange={onChange} 
                disabled={disabled}
                cols={cols}
                layout="grid"
            />
            {isTriggered && children && (
                <SubItemHighlight disabled={disabled}>
                    {children}
                </SubItemHighlight>
            )}
        </QuestionBlock>
    );
};

// Standard Text Input Field
export const FormInput: React.FC<{ 
    id: string; 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    placeholder?: string; 
    highlighted?: boolean;
    className?: string;
}> = ({ id, label, value, onChange, placeholder, highlighted = false, className = '' }) => (
    <div id={id} className={`transition-all duration-500 rounded-2xl p-2 -m-2 ${highlighted ? 'error-highlight-anim' : ''} ${className}`}>
        <label className="block text-slate-800 font-black mb-3 text-[1.5rem] md:text-[1.75rem] text-left dark:text-slate-100">{label}</label>
        <input 
            type="text" 
            className="full-width-input text-xl border-2 border-slate-500 focus:border-slate-800" 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
            autoComplete="off" 
        />
    </div>
);

// Unit Input with numeric keypad support
export const UnitInput = ({ value, onChange, unit, placeholder, disabled = false }: { value: string, onChange: (val: string) => void, unit: string, placeholder?: string, disabled?: boolean }) => (
    <div className="relative w-full">
        <input 
            type="number" 
            inputMode="decimal"
            disabled={disabled}
            className={`full-width-input text-xl pr-16 border-2 border-slate-500 focus:border-slate-800 ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700' : ''}`}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className={`text-xl font-black ${disabled ? 'text-gray-400 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{unit}</span>
        </div>
    </div>
);

// Reusable Land Number Input Group (Section/SubSection/Number)
export const LandNumberInputs: React.FC<{
    section: string;
    subSection: string;
    number: string;
    onChangeSection: (val: string) => void;
    onChangeSubSection: (val: string) => void;
    onChangeNumber: (val: string) => void;
}> = ({ section, subSection, number, onChangeSection, onChangeSubSection, onChangeNumber }) => (
    <div className="flex flex-wrap items-end gap-3 md:gap-4 w-full dark:text-slate-200 pt-2">
        <div className="flex items-center">
            <input 
                type="text" 
                className="border-b-[6px] border-slate-500 bg-transparent text-xl md:text-2xl font-black w-24 md:w-32 text-center px-1 pb-1 focus:border-slate-900 outline-none transition-colors dark:border-slate-500 dark:text-white dark:focus:border-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-none" 
                value={section || ''} 
                onChange={e => onChangeSection(e.target.value)} 
                placeholder="段" 
            />
            <span className="font-black text-xl md:text-2xl ml-2 mb-1 text-slate-700 dark:text-slate-300">段</span>
        </div>
        
        <div className="flex items-center">
            <input 
                type="text" 
                className="border-b-[6px] border-slate-500 bg-transparent text-xl md:text-2xl font-black w-20 md:w-24 text-center px-1 pb-1 focus:border-slate-900 outline-none transition-colors dark:border-slate-500 dark:text-white dark:focus:border-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-none" 
                value={subSection || ''} 
                onChange={e => onChangeSubSection(e.target.value)} 
                placeholder="小段" 
            />
            <span className="font-black text-xl md:text-2xl ml-2 mb-1 text-slate-700 dark:text-slate-300">小段</span>
        </div>
        
        <div className="flex items-center flex-grow md:flex-grow-0">
            <input 
                type="text" 
                className="border-b-[6px] border-slate-500 bg-transparent text-xl md:text-2xl font-black w-32 md:w-40 text-center px-1 pb-1 focus:border-slate-900 outline-none transition-colors dark:border-slate-500 dark:text-white dark:focus:border-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-none" 
                value={number || ''} 
                onChange={e => onChangeNumber(e.target.value)} 
                placeholder="地號" 
            />
            <span className="font-black text-xl md:text-2xl ml-2 mb-1 text-slate-700 dark:text-slate-300">號</span>
        </div>
    </div>
);

// === Signature Pad Component ===
export const SignaturePad: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    // Reset hasDrawn state when switching back to edit mode (value becomes empty)
    useEffect(() => {
        if (!value) {
            setHasDrawn(false);
        }
    }, [value]);

    useEffect(() => {
        // Only initialize if in edit mode
        if (value) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            // High DPI support
            const dpr = window.devicePixelRatio || 1;
            
            // Set display size
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            // Set actual size in memory (scaled to account for extra pixel density)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Normalize coordinate system to use css pixels
            ctx.scale(dpr, dpr);
            
            // Setup lines
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
        };

        // Initialize size immediately and also after delay to ensure layout is stable
        resize();
        const timer = setTimeout(resize, 100);
        
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            clearTimeout(timer);
        };
    }, [value]); // Depend on value to re-init when clearing

    const getPos = (e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: any) => {
        e.preventDefault(); // Prevent scrolling on touch
        setIsDrawing(true);
        setHasDrawn(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e.nativeEvent);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e.nativeEvent);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (e: any) => {
        e.preventDefault();
        if (isDrawing) {
            setIsDrawing(false);
            // Removed automatic onChange call here to allow multi-stroke signatures
        }
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            onChange(canvas.toDataURL());
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            setHasDrawn(false);
        }
    };

    // If a value exists, show preview and a "Clear" button to resign
    if (value) {
        return (
            <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full h-48 md:h-64 border-4 border-slate-300 rounded-2xl bg-white overflow-hidden flex items-center justify-center relative shadow-inner dark:bg-slate-100">
                    <img src={value} alt="Signature" className="max-w-full max-h-full" />
                </div>
                <button 
                    onClick={() => onChange('')} 
                    className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold border-2 border-red-200 hover:bg-red-200 transition-colors"
                >
                    <Eraser className="w-5 h-5" /> 重新簽名
                </button>
            </div>
        );
    }

    return (
        <div className="w-full relative">
            <div className="w-full h-64 md:h-80 bg-white border-4 border-slate-300 rounded-[1.5rem] touch-none overflow-hidden relative shadow-inner cursor-crosshair hover:border-slate-400 transition-colors dark:border-slate-600 dark:bg-slate-100">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block touch-none"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <div className="absolute bottom-3 right-3 pointer-events-none text-slate-300 font-bold select-none text-sm">
                    請在此區域簽名
                </div>
            </div>
            
            {/* Toolbar for Signature Pad */}
            <div className="mt-4 flex justify-end gap-4">
                <button 
                    onClick={handleClear}
                    className="flex items-center gap-2 px-6 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold border-2 border-slate-200 transition-colors"
                >
                    <Eraser className="w-5 h-5" /> 清除重簽
                </button>
                <button 
                    onClick={handleConfirm}
                    disabled={!hasDrawn}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                        hasDrawn 
                            ? 'bg-sky-600 text-white border-sky-800 hover:bg-sky-700 shadow-lg' 
                            : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                    }`}
                >
                    <Check className="w-5 h-5" strokeWidth={3} /> 確認完成
                </button>
            </div>
        </div>
    );
};

// === UI Helpers ===
export const SubItemHighlight: React.FC<{ children: React.ReactNode, disabled?: boolean }> = ({ children, disabled = false }) => (
    <div className={`mt-6 mb-8 p-6 md:p-8 bg-orange-50/80 rounded-[1.5rem] md:rounded-[2rem] border-l-[8px] md:border-l-[12px] border-orange-400 shadow-inner animate-in slide-in-from-top-4 fade-in duration-300 dark:bg-orange-900/20 dark:border-orange-500 ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="pl-1 md:pl-2">{children}</div>
    </div>
);

export const DetailInput = ({ value, onChange, placeholder = "說明現況", disabled = false, autoFocus = true }: { value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean, autoFocus?: boolean }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showMicHint, setShowMicHint] = useState(false);
    
    useEffect(() => {
        if (!disabled && autoFocus && inputRef.current) {
            // Small timeout ensures the expand animation doesn't conflict with scrolling behavior
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [disabled, autoFocus]);

    return (
        <div className={`relative w-full ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <input 
                ref={inputRef}
                type="text" 
                className="full-width-input text-xl !mt-0 !bg-white focus:!bg-white dark:!bg-slate-900 dark:focus:!bg-slate-950 pr-24 border-2 border-slate-500 focus:border-slate-800" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                autoComplete="off"
                disabled={disabled}
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Voice Input Hint */}
                <div className="relative">
                    <button 
                        type="button"
                        onClick={() => {
                            setShowMicHint(true);
                            setTimeout(() => setShowMicHint(false), 3000);
                        }}
                        className="text-slate-400 dark:text-slate-500 animate-pulse hover:text-sky-500 transition-colors p-1" 
                        title="可使用鍵盤語音輸入"
                    >
                        <Mic className="w-6 h-6" />
                    </button>
                    {showMicHint && (
                        <div className="absolute bottom-full right-0 mb-3 w-56 bg-slate-800 text-white text-sm font-bold p-3 rounded-xl shadow-xl z-20 text-center animate-in fade-in zoom-in-95 border border-slate-600">
                            請點擊下方鍵盤上的<br/>麥克風按鈕進行語音輸入
                            <div className="absolute top-full right-3 border-8 border-transparent border-t-slate-800"></div>
                        </div>
                    )}
                </div>

                {/* Clear Button */}
                {value && (
                    <button 
                        type="button"
                        onClick={() => {
                            onChange('');
                            inputRef.current?.focus();
                        }}
                        className="p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition-colors dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
                        title="清除內容"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-yellow-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-4 border-red-500 text-center shadow-lg mb-8 md:mb-10 animate-in zoom-in-95 duration-300 dark:bg-yellow-900/30 dark:border-red-400">
        <div className="flex flex-col items-center gap-3 md:gap-4 text-red-800 dark:text-red-300">
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16" strokeWidth={3} />
            <p className="text-2xl md:text-3xl font-black leading-relaxed tracking-wide">{children}</p>
        </div>
    </div>
);

export const InlineWarning: React.FC<{ children: React.ReactNode, center?: boolean, className?: string }> = ({ children, center = false, className = "" }) => (
    <div className={`w-full py-4 px-5 md:py-5 md:px-6 bg-[#FDE047] rounded-xl md:rounded-2xl flex items-start gap-3 shadow-sm dark:bg-yellow-900/40 ${className}`}>
        <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-[#78350F] shrink-0 mt-0.5 dark:text-yellow-200" strokeWidth={2.5} />
        <div className={`text-xl md:text-2xl text-[#78350F] font-bold leading-snug dark:text-yellow-200 ${center ? 'text-center w-full' : 'text-left'}`}>
            {children}
        </div>
    </div>
);

// === Preview Result ===
interface PreviewResultProps {
    checked: boolean;
    label: string;
    suffix?: string;
    forceShow?: boolean;
    isLandStyle?: boolean; // New prop for Land category V-icon
    variant?: 'default' | 'mobile'; // New prop to control dark mode behavior
}
export const PreviewResult: React.FC<PreviewResultProps> = ({ checked, label, suffix = "", forceShow = false, isLandStyle = false, variant = 'default' }) => {
    if (!checked && !forceShow) return null;
    
    // In mobile mode, we use Tailwind classes for dark mode support.
    // In default (A4/Print) mode, we rely on the global CSS (black) which is correct for printing.
    // MODIFICATION: For default mode, remove 'checked' class to keep white bg, and use Icon.
    const boxClass = variant === 'mobile' 
        ? `w-7 h-7 border-[3px] flex items-center justify-center font-black text-xl mr-2 shrink-0 ${checked ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-transparent border-slate-800 text-slate-800 dark:border-white dark:text-white'}`
        : `preview-checkbox-box translate-y-[2px]`; // Added translate-y to align visually

    return (
        <div className="preview-checkbox-wrapper inline-flex items-center">
            {variant === 'mobile' ? (
                <div className={boxClass}>
                    {checked ? 'V' : ''}
                </div>
            ) : (
                <div className={boxClass}>
                    {checked ? <Check className="w-5 h-5 text-black" strokeWidth={3} /> : ''}
                </div>
            )}
            <span className={`preview-checkbox-label ${variant === 'mobile' ? 'text-slate-800 dark:text-slate-200' : 'text-black'}`}>
                {label}{suffix}
            </span>
        </div>
    );
};

// --- NEW MODAL AND TOAST COMPONENTS ---

// Toast
export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4500);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-4 rounded-full shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border-2 border-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:border-white">
            <CheckCircle2 className="w-6 h-6 text-green-400 dark:text-green-600" />
            <span className="font-bold text-lg">{message}</span>
        </div>
    );
};

// Modal Wrapper
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200 border-4 border-slate-100 dark:border-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors dark:bg-slate-800 dark:hover:bg-slate-700">
                    <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </button>
                {title && <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6 pr-8">{title}</h3>}
                {children}
            </div>
        </div>
    );
};

// DraftFoundModal
export const DraftFoundModal: React.FC<{ isOpen: boolean; onLoad: () => void; onClear: () => void; onClose: () => void }> = ({ isOpen, onLoad, onClear, onClose }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="發現未完成的草稿">
        <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 flex gap-4 items-start dark:bg-amber-900/20 dark:border-amber-800">
                <Info className="w-6 h-6 text-amber-600 shrink-0 mt-1 dark:text-amber-400" />
                <p className="text-amber-800 font-bold text-xl dark:text-amber-200">
                    系統偵測到您上次有一份未完成的調查表，是否要載入繼續填寫？
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <button onClick={onLoad} className="w-full py-4 bg-sky-600 text-white rounded-xl font-black text-xl shadow-lg border-b-4 border-sky-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 dark:bg-sky-700 dark:border-sky-900">
                    <FileInput className="w-5 h-5" /> 載入草稿
                </button>
                <button onClick={onClear} className="w-full py-4 bg-white text-slate-500 rounded-xl font-bold text-lg border-2 border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700">
                    <Trash2 className="w-5 h-5" /> 捨棄並開始新表單
                </button>
            </div>
        </div>
    </Modal>
);

// AlertModal
export const AlertModal: React.FC<{ isOpen: boolean; errors: ValidationError[]; onClose: () => void; onJumpTo: (id: string, step: number) => void }> = ({ isOpen, errors, onClose, onJumpTo }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="請檢查以下欄位">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-rose-50 p-4 md:p-6 rounded-2xl border-2 border-rose-100 mb-4 flex items-center gap-3 dark:bg-rose-900/20 dark:border-rose-800">
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-rose-600 dark:text-rose-400" strokeWidth={3} />
                <span className="font-black text-xl md:text-2xl text-rose-800 dark:text-rose-200">共有 {errors.length} 個項目需要修正</span>
            </div>
            {errors.map((err, idx) => (
                <button 
                    key={idx}
                    onClick={() => onJumpTo(err.id, err.step)}
                    className="w-full text-left p-4 md:p-6 rounded-2xl border-2 border-slate-100 hover:border-sky-300 hover:bg-sky-50 transition-all group flex justify-between items-center bg-white dark:bg-slate-800 dark:border-slate-700 dark:hover:border-sky-600 dark:hover:bg-slate-700"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5 group-hover:bg-sky-200 group-hover:text-sky-700 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-sky-900 dark:group-hover:text-sky-300">
                            {idx + 1}
                        </div>
                        <span className="font-black text-lg md:text-xl text-slate-700 group-hover:text-sky-800 dark:text-slate-300 dark:group-hover:text-sky-200">{err.message}</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-sky-400 dark:text-slate-600" />
                </button>
            ))}
        </div>
        <div className="mt-6 pt-4 border-t-2 border-slate-100 dark:border-slate-800">
             <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-xl active:scale-95 transition-transform dark:bg-slate-700 shadow-lg">
                我知道了
            </button>
        </div>
    </Modal>
);

// ImagePreviewModal
export const ImagePreviewModal: React.FC<{ isOpen: boolean; imageUrl: string; onClose: () => void }> = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50">
                <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white rounded-lg shadow-2xl custom-scrollbar dark:bg-slate-900">
                <img src={imageUrl} alt="Generated Preview" className="w-full h-auto block" />
            </div>
            <p className="text-white/80 mt-6 font-bold text-lg animate-pulse flex items-center gap-2">
                <Save className="w-5 h-5" />
                長按上方圖片即可儲存至手機相簿
            </p>
        </div>
    );
};

// ExportSuccessModal
export const ExportSuccessModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, onConfirm, onCancel }) => (
    <Modal isOpen={isOpen} onClose={onCancel} title="匯出成功！">
        <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                檔案已成功產生。是否要清空目前表單，準備填寫下一筆？
            </p>
            <div className="flex gap-4">
                <button onClick={onConfirm} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-black text-lg shadow-lg border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all dark:bg-slate-700 dark:border-slate-900">
                    是，清空表單
                </button>
                <button onClick={onCancel} className="flex-1 py-4 bg-white text-slate-600 rounded-xl font-bold text-lg border-2 border-slate-200 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700">
                    否，保留內容
                </button>
            </div>
        </div>
    </Modal>
);

// ConfirmModal
export const ConfirmModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; type?: 'danger' | 'info'; confirmText?: string; cancelText?: string }> = ({ isOpen, title, message, onConfirm, onCancel, type = 'info', confirmText = '確定', cancelText = '取消' }) => (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
        <div className="space-y-6">
            <div className={`p-4 rounded-2xl border-2 flex gap-4 items-start ${type === 'danger' ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:border-sky-800'}`}>
                {type === 'danger' ? <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-1 dark:text-rose-400" /> : <Info className="w-6 h-6 text-sky-600 shrink-0 mt-1 dark:text-sky-400" />}
                <p className={`${type === 'danger' ? 'text-rose-800 dark:text-rose-200' : 'text-sky-800 dark:text-sky-200'} font-bold text-xl`}>
                    {message}
                </p>
            </div>
            <div className="flex gap-4">
                <button onClick={onConfirm} className={`flex-1 py-4 rounded-xl font-black text-lg shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all ${type === 'danger' ? 'bg-rose-600 text-white border-rose-800 dark:bg-rose-700 dark:border-rose-900' : 'bg-sky-600 text-white border-sky-800 dark:bg-sky-700 dark:border-sky-900'}`}>
                    {confirmText}
                </button>
                <button onClick={onCancel} className="flex-1 py-4 bg-white text-slate-600 rounded-xl font-bold text-lg border-2 border-slate-200 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700">
                    {cancelText}
                </button>
            </div>
        </div>
    </Modal>
);
