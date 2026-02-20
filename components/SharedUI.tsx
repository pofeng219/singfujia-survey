
import React, { useEffect, useRef, useState } from 'react';
import { Info, Save, FileInput, Trash2, AlertCircle, ChevronRight, AlertTriangle, ChevronDown, CheckCircle2, X, Eraser, Check, HelpCircle } from 'lucide-react';
import { ValidationError } from '../types';

// Helper to determine color based on label content (Heuristic for Safety/Danger)
const getButtonColorClass = (checked: boolean, label: string, disabled: boolean) => {
    if (disabled) return 'bg-white border-slate-300 text-slate-300 opacity-50 cursor-not-allowed grayscale dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600';
    
    // Unchecked state (Phase 3: Increased contrast)
    if (!checked) return 'bg-white border-slate-500 border-b-slate-600 text-slate-700 hover:bg-slate-50 hover:border-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-500 dark:border-b-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white';

    // Checked States
    // Safe keywords (Green)
    if (
        label.includes('否') || 
        label.includes('正常') || 
        label.includes('相符') || 
        label === '可進入' || 
        label === '無' || 
        label === '無設置' ||
        label === '無機車車位' ||
        label === '無車位' ||
        label === '無異常' ||
        label === '無重要環境設施' ||
        label === '實測相符' ||
        label === '界標完整' ||
        label === '已鑑界 (標完好)' ||
        label === '非範圍內' ||
        label.startsWith('無 (') || 
        label === '無糾紛' || 
        label === '無修繕紀錄' || 
        label.includes('確認無誤') || 
        label === '確認無異常' ||
        label === '依車位資訊告示牌' // Added new safe keyword
    ) {
        return 'bg-emerald-600 border-emerald-700 border-b-emerald-800 text-white shadow-xl shadow-emerald-100 dark:bg-emerald-600 dark:border-emerald-500 dark:border-b-emerald-700 dark:shadow-none';
    }
    // Danger keywords (Red/Rose)
    if (
        label.includes('是') || 
        label.includes('有') || 
        label.includes('異常') || 
        label.includes('不符') || 
        label === '不可進入' || 
        label === '有纠纷' || 
        label.includes('疑似') || 
        label.includes('疑慮') ||
        label === '全屋天花板包覆' || 
        label.includes('需說明') ||
        label === '屬範圍內' ||
        label === '需重新鑑界' ||
        label === '標位不明 (需重測)' ||
        label === '待查證' ||
        label === '袋地' ||
        label === '有異常' ||
        label === '實測不符' ||
        label.includes('無法測量') // Covers '無法測量' and '無法測量也無相關資訊'
    ) {
        return 'bg-rose-600 border-rose-700 border-b-rose-800 text-white shadow-xl shadow-rose-100 dark:bg-rose-600 dark:border-rose-500 dark:border-b-rose-700 dark:shadow-none';
    }
    // Neutral/Active Default (Dark Slate/Blue)
    return 'bg-slate-800 border-slate-900 border-b-black text-white shadow-xl shadow-slate-200 dark:bg-sky-600 dark:border-sky-500 dark:border-b-sky-700 dark:shadow-none';
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
        className={`w-full p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-4 border-b-[6px] md:border-b-[8px] font-black text-xl md:text-3xl cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none active:scale-[0.98] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px]
        ${getButtonColorClass(checked, label, disabled)}`}
    >
        <span>{label}</span>
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
    // Force vertical layout (1 column) on ALL devices as per user request
    // This simplifies the logic significantly and ensures consistency
    const gridCols = 'grid-cols-1';
    
    // Helper to render label with subtitle if parentheses exist
    const renderLabel = (text: string) => {
        const match = text.match(/^(.*?)(\s*[\(（].*?[\)）])$/);
        const mainText = match ? match[1] : text;
        const subText = match ? match[2].trim() : null;

        let mainContent;
        // If main text is longer than 4 chars, split after the 2nd char for better vertical rhythm
        if (mainText.length > 4) {
            const firstPart = mainText.slice(0, 2);
            const secondPart = mainText.slice(2);
            mainContent = (
                <div className="flex flex-col items-center justify-center leading-normal">
                    <span>{firstPart}</span>
                    <span>{secondPart}</span>
                </div>
            );
        } else {
            mainContent = <span>{mainText}</span>;
        }

        if (subText) {
            return (
                <div className="flex flex-col items-center justify-center w-full py-3 min-h-[5rem]">
                    <div className="mb-4">
                        {mainContent}
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900/40 px-3 py-2 rounded-lg w-full max-w-[95%] shadow-sm flex items-center justify-center">
                        <span className="text-base font-bold text-slate-700 dark:text-slate-200 block leading-normal break-words whitespace-normal">
                            {subText}
                        </span>
                    </div>
                </div>
            );
        }
        
        return mainContent;
    };

    return (
        <div className={`grid ${gridCols} gap-3 md:gap-4`}>
            {options.map((v, idx) => {
                return (
                    <button
                        key={v}
                        type="button"
                        onClick={() => !disabled && onChange(value === v ? '' : v)}
                        className={`flex-1 py-4 px-3 md:py-5 md:px-4 rounded-[1.5rem] md:rounded-[1.75rem] font-black text-xl md:text-2xl text-center flex items-center justify-center transition-all duration-200 select-none active:scale-[0.98] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] gap-2 md:gap-3 border-4 border-b-[6px] md:border-b-[8px]
                        ${getButtonColorClass(value === v, v, disabled)}`}
                    >
                        {renderLabel(v)}
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
    // Force vertical layout (1 column) on ALL devices as per user request
    const gridClass = 'grid grid-cols-1';

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div className={`${gridClass} gap-3 md:gap-4`}>
                {options.map((opt, idx) => (
                    <button 
                        key={opt}
                        type="button" 
                        disabled={disabled} 
                        onClick={() => onChange(value === opt ? '' : opt)} 
                        className={`flex-1 min-w-[100px] md:min-w-[120px] py-4 px-3 md:py-6 md:px-6 rounded-[1.5rem] md:rounded-[1.75rem] font-black text-xl md:text-3xl text-center flex justify-center items-center transition-all duration-200 select-none active:scale-[0.98] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] gap-2 md:gap-4 border-4 border-b-[6px] md:border-b-[8px]
                        ${getButtonColorClass(value === opt, opt, disabled)}`}
                    >
                        <span>{opt}</span>
                    </button>
                ))}
            </div>
            {value && renderDetail(value) && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 w-full">
                    {renderDetail(value)}
                </div>
            )}
        </div>
    );
};

// === Survey Section Wrapper (Accordion Style) ===
export const SurveySection: React.FC<{ 
    id?: string; 
    title?: React.ReactNode; 
    children: React.ReactNode; 
    highlighted?: boolean; 
    className?: string;
}> = ({ id, title, children, highlighted = false, className = '' }) => {
    // Default open, allowing users to collapse manually
    const [isOpen, setIsOpen] = useState(true);

    // Auto-expand if the section is highlighted (has error)
    useEffect(() => {
        if (highlighted) {
            setIsOpen(true);
        }
    }, [highlighted]);

    return (
        <div 
            id={id} 
            className={`warm-card rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all duration-500 border-3 border-slate-200 ${highlighted ? 'error-highlight-anim' : 'bg-white dark:bg-slate-800 dark:border-slate-700'} overflow-hidden ${className.replace(/space-y-\d+/g, '')}`} 
        >
            {title ? (
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-6 md:p-10 flex justify-between items-start gap-4 md:gap-6 cursor-pointer select-none transition-colors duration-200 ${isOpen ? '' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/50'}`}
                >
                    <div className="flex-grow pt-1">
                        {typeof title === 'string' 
                            ? <p className="text-[1.75rem] md:text-[2rem] font-black text-slate-800 dark:text-slate-100 text-left leading-tight tracking-tight">{title}</p> 
                            : title
                        }
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
            
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'hidden opacity-0'}`}>
                <div className="px-6 md:px-10 pb-6 md:pb-10 pt-0">
                    {/* Divider Line */}
                    {title && <div className="border-b-4 border-slate-100 dark:border-slate-700 mb-6 md:mb-8 -mt-2" />}
                    
                    {/* Content */}
                    <div className={className.includes('space-y') ? className : `space-y-8 md:space-y-10 ${className}`}>
                        {children}
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
            className="full-width-input" 
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
            className={`full-width-input pr-16 ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700' : ''}`}
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
                className="border-b-4 border-slate-300 bg-transparent text-xl md:text-2xl font-black w-24 md:w-32 text-center px-1 pb-1 focus:border-slate-800 outline-none transition-colors dark:border-slate-600 dark:text-white dark:focus:border-slate-300 placeholder-slate-300 dark:placeholder-slate-600 rounded-none" 
                value={section || ''} 
                onChange={e => onChangeSection(e.target.value)} 
                placeholder="段" 
            />
            <span className="font-black text-xl md:text-2xl ml-2 mb-1 text-slate-700 dark:text-slate-300">段</span>
        </div>
        
        <div className="flex items-center">
            <input 
                type="text" 
                className="border-b-4 border-slate-300 bg-transparent text-xl md:text-2xl font-black w-20 md:w-24 text-center px-1 pb-1 focus:border-slate-800 outline-none transition-colors dark:border-slate-600 dark:text-white dark:focus:border-slate-300 placeholder-slate-300 dark:placeholder-slate-600 rounded-none" 
                value={subSection || ''} 
                onChange={e => onChangeSubSection(e.target.value)} 
                placeholder="小段" 
            />
            <span className="font-black text-xl md:text-2xl ml-2 mb-1 text-slate-700 dark:text-slate-300">小段</span>
        </div>
        
        <div className="flex items-center flex-grow md:flex-grow-0">
            <input 
                type="text" 
                className="border-b-4 border-slate-300 bg-transparent text-xl md:text-2xl font-black w-32 md:w-40 text-center px-1 pb-1 focus:border-slate-800 outline-none transition-colors dark:border-slate-600 dark:text-white dark:focus:border-slate-300 placeholder-slate-300 dark:placeholder-slate-600 rounded-none" 
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
    
    useEffect(() => {
        if (!disabled && autoFocus && inputRef.current) {
            // Small timeout ensures the expand animation doesn't conflict with scrolling behavior
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [disabled, autoFocus]);

    return (
        <div className={`space-y-3 w-full ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <input 
                ref={inputRef}
                type="text" 
                className="full-width-input !mt-0 !bg-white focus:!bg-white dark:!bg-slate-900 dark:focus:!bg-slate-950" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                autoComplete="off"
                disabled={disabled}
            />
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
        const timer = setTimeout(onClose, 3000);
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
                <p className="text-amber-800 font-bold dark:text-amber-200">
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
                <p className={`${type === 'danger' ? 'text-rose-800 dark:text-rose-200' : 'text-sky-800 dark:text-sky-200'} font-bold`}>
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
