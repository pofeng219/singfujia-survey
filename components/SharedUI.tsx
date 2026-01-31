
import React, { useEffect, useRef, useState } from 'react';
import { Info, Save, FileInput, Trash2, AlertCircle, ChevronRight, AlertTriangle, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { ValidationError } from '../types';

// Helper to determine color based on label content (Heuristic for Safety/Danger)
const getButtonColorClass = (checked: boolean, label: string, disabled: boolean) => {
    if (disabled) return 'bg-white border-slate-300 text-slate-300 opacity-50 cursor-not-allowed grayscale';
    if (!checked) return 'bg-slate-50 border-slate-400 border-b-slate-500 text-slate-600 hover:bg-white hover:border-slate-500 hover:text-slate-900';

    // Safe keywords (Green)
    if (label.includes('否') || label.includes('正常') || label.includes('相符') || label === '可進入' || label === '無' || label === '無糾紛') {
        return 'bg-emerald-600 border-emerald-700 border-b-emerald-800 text-white shadow-xl shadow-emerald-100';
    }
    // Danger keywords (Red/Rose)
    if (label.includes('是') || label.includes('異常') || label.includes('不符') || label === '不可進入' || label === '有' || label === '有糾紛' || label === '疑似') {
        return 'bg-rose-600 border-rose-700 border-b-rose-800 text-white shadow-xl shadow-rose-100';
    }
    // Neutral/Active Default (Dark Slate/Blue)
    return 'bg-slate-800 border-slate-900 border-b-black text-white shadow-xl shadow-slate-200';
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
        className={`w-full p-6 rounded-[2rem] border-4 border-b-[8px] font-black text-2xl cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none active:scale-[0.98] active:border-b-4 active:translate-y-[4px]
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
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, layout = 'flex', cols = 2, disabled = false }) => (
    <div className={`${layout === 'flex' ? 'flex flex-col md:flex-row gap-4' : `grid grid-cols-1 md:grid-cols-${cols} gap-4`}`}>
        {options.map(v => (
            <button
                key={v}
                type="button"
                onClick={() => !disabled && onChange(value === v ? '' : v)}
                className={`flex-1 py-6 px-5 rounded-[1.75rem] font-black text-2xl text-center flex items-center justify-center transition-all duration-200 select-none active:scale-[0.98] active:border-b-4 active:translate-y-[4px] gap-3 border-4 border-b-[8px]
                ${getButtonColorClass(value === v, v, disabled)}`}
            >
                <span>{v}</span>
            </button>
        ))}
    </div>
);

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
    return (
        <div className="flex flex-col gap-6">
            <div className={`flex flex-col md:flex-row md:flex-wrap gap-4 ${cols > 0 ? `grid grid-cols-1 md:grid-cols-${cols}` : ''}`}>
                {options.map(opt => (
                    <button 
                        key={opt}
                        type="button" 
                        disabled={disabled} 
                        onClick={() => onChange(value === opt ? '' : opt)} 
                        className={`flex-1 min-w-[120px] py-6 px-6 rounded-[1.75rem] font-black text-2xl text-center flex justify-center items-center transition-all duration-200 select-none active:scale-[0.98] active:border-b-4 active:translate-y-[4px] gap-4 border-4 border-b-[8px]
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
            className={`warm-card rounded-[2.5rem] shadow-sm transition-all duration-500 border-3 border-slate-200 ${highlighted ? 'ring-8 ring-amber-300/50 bg-amber-50 border-amber-300' : 'bg-white'} overflow-hidden ${className.replace(/space-y-\d+/g, '')}`} // Remove outer spacing logic to handle internally
        >
            {title ? (
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-8 md:p-10 flex justify-between items-start gap-6 cursor-pointer select-none transition-colors duration-200 ${isOpen ? '' : 'hover:bg-slate-50/80'}`}
                >
                    <div className="flex-grow pt-1">
                        {typeof title === 'string' 
                            ? <p className="text-3xl md:text-4xl font-black text-slate-800 text-left leading-tight tracking-tight">{title}</p> 
                            : title
                        }
                    </div>
                    {/* Accordion Arrow Icon & Hint */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isOpen ? 'bg-slate-100 border-slate-200 text-slate-600 rotate-0' : 'bg-slate-800 border-slate-900 text-white -rotate-90'}`}>
                            <ChevronDown className="w-7 h-7" strokeWidth={3} />
                        </div>
                        <span className={`text-[11px] font-black text-slate-400 transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                            點擊收合
                        </span>
                    </div>
                </div>
            ) : (
                // Spacer if no title exists
                <div className="h-4"></div>
            )}
            
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'hidden opacity-0'}`}>
                <div className="px-8 md:px-10 pb-8 md:pb-10 pt-0">
                    {/* Divider Line */}
                    {title && <div className="border-b-4 border-slate-100 mb-8 -mt-2" />}
                    
                    {/* Content */}
                    <div className={className.includes('space-y') ? className : `space-y-10 ${className}`}>
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
    <div className={`bg-slate-50 p-8 rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors ${className}`}>
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
    options = ['否', '是'], 
    trigger = '是', 
    disabled = false,
    children,
    cols = 2
}) => {
    const isTriggered = Array.isArray(trigger) ? trigger.includes(value) : value === trigger;
    
    return (
        <QuestionBlock className={disabled ? 'opacity-40 grayscale pointer-events-none' : ''}>
            <div className="mb-6">
                {typeof label === 'string' ? <p className="text-2xl font-black text-slate-700">{label}</p> : label}
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
    <div id={id} className={`transition-all duration-500 rounded-2xl p-2 -m-2 ${highlighted ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''} ${className}`}>
        <label className="block text-slate-800 font-black mb-3 text-2xl text-left">{label}</label>
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
            className={`full-width-input pr-16 ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : ''}`}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className={`text-xl font-black ${disabled ? 'text-gray-400' : 'text-slate-400'}`}>{unit}</span>
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
    <div className="flex flex-wrap items-end gap-2">
        <span className="font-bold text-xl mb-2">地號：</span>
        <input type="number" inputMode="numeric" className="border-b-2 border-slate-400 bg-transparent text-xl font-bold w-24 text-center px-1" value={section || ''} onChange={e => onChangeSection(e.target.value)} placeholder="段" />
        <span className="font-bold text-xl mb-2">段</span>
        <input type="number" inputMode="numeric" className="border-b-2 border-slate-400 bg-transparent text-xl font-bold w-20 text-center px-1" value={subSection || ''} onChange={e => onChangeSubSection(e.target.value)} placeholder="小段" />
        <span className="font-bold text-xl mb-2">小段</span>
        <input type="number" inputMode="numeric" className="border-b-2 border-slate-400 bg-transparent text-xl font-bold w-24 text-center px-1" value={number || ''} onChange={e => onChangeNumber(e.target.value)} placeholder="地號" />
        <span className="font-bold text-xl mb-2">號</span>
    </div>
);

// === UI Helpers ===
export const SubItemHighlight: React.FC<{ children: React.ReactNode, disabled?: boolean }> = ({ children, disabled = false }) => (
    <div className={`mt-6 mb-8 p-8 bg-orange-50/80 rounded-[2rem] border-l-[12px] border-orange-400 shadow-inner animate-in slide-in-from-top-4 fade-in duration-300 ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="pl-2">{children}</div>
    </div>
);

export const DetailInput = ({ value, onChange, placeholder = "請詳細說明情況...", disabled = false }: { value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (!disabled && inputRef.current) {
            // Small timeout ensures the expand animation doesn't conflict with scrolling behavior
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [disabled]);

    return (
        <div className={`space-y-3 w-full ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <input 
                ref={inputRef}
                type="text" 
                className="full-width-input !mt-0 !bg-white focus:!bg-white" 
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
    <div className="bg-yellow-100 p-8 rounded-[2rem] border-4 border-red-500 text-center shadow-lg mb-10 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-4 text-red-800">
            <AlertTriangle className="w-16 h-16" strokeWidth={3} />
            <p className="text-3xl font-black leading-relaxed tracking-wide">{children}</p>
        </div>
    </div>
);

export const InlineWarning: React.FC<{ children: React.ReactNode, center?: boolean, className?: string }> = ({ children, center = false, className = "" }) => (
    <div className={`warning-box text-xl w-full p-6 bg-yellow-300 border-4 border-red-600 rounded-2xl text-red-900 font-black shadow-md ${center ? 'text-center' : ''} ${className}`}>
        {children}
    </div>
);

// === Preview Result ===
interface PreviewResultProps {
    checked: boolean;
    label: string;
    suffix?: string;
    forceShow?: boolean;
    isLandStyle?: boolean; // New prop for Land category V-icon
}
export const PreviewResult: React.FC<PreviewResultProps> = ({ checked, label, suffix = "", forceShow = false, isLandStyle = false }) => {
    if (!checked && !forceShow) return null;
    return (
        <div className="preview-checkbox-wrapper inline-flex items-center">
            <div className={`preview-checkbox-box ${checked ? 'checked' : ''}`}>
                {checked ? 'V' : ''}
            </div>
            <span className="preview-label">{label}{suffix}</span>
        </div>
    );
};

// === Toast ===
export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-10 py-6 rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] z-[200] flex items-center gap-5 animate-in slide-in-from-top-4 fade-in duration-300 max-w-[90vw] border-2 border-slate-700">
            <Info className="w-8 h-8 text-sky-400 shrink-0" strokeWidth={3} />
            <p className="font-black text-2xl whitespace-pre-wrap leading-relaxed tracking-wide">{message}</p>
        </div>
    );
};

// === Modals ===
export const DraftFoundModal: React.FC<{ isOpen: boolean; onLoad: () => void; onClear: () => void; onClose: () => void }> = ({ isOpen, onLoad, onClear, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border-4 border-white ring-4 ring-black/5" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-800 p-8 flex items-center gap-5">
                    <Save className="text-white w-10 h-10" />
                    <h3 className="text-white font-black text-3xl">發現暫存檔</h3>
                </div>
                <div className="p-8 space-y-8">
                    <p className="text-slate-600 font-bold text-xl leading-relaxed">系統偵測到您上次有未完成的填寫紀錄。<br />您想要讀取暫存檔繼續填寫嗎？</p>
                    <div className="space-y-4">
                        <button onClick={onLoad} className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black text-2xl hover:bg-sky-700 transition-all duration-150 flex items-center justify-center gap-3 border-b-[6px] border-sky-800 active:border-b-2 active:translate-y-[4px]">
                            <FileInput className="w-7 h-7" /> 讀取暫存檔
                        </button>
                        <button onClick={onClear} className="w-full py-5 bg-rose-100 text-rose-700 rounded-2xl font-black text-2xl hover:bg-rose-200 transition-all duration-150 flex items-center justify-center gap-3 border-2 border-rose-200 border-b-[6px] border-b-rose-300 active:border-b-2 active:translate-y-[4px]">
                            <Trash2 className="w-7 h-7" /> 清空暫存檔
                        </button>
                        <button onClick={onClose} className="w-full py-4 text-slate-400 font-bold text-xl hover:text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors">暫不處理</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AlertModalProps {
    isOpen: boolean;
    errors?: ValidationError[]; // Changed from message string
    message?: string; // Backwards compatibility if needed, though we'll switch
    onClose: () => void;
    onJumpTo?: (id: string, step: number) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, errors = [], message = '', onClose, onJumpTo }) => {
    if (!isOpen) return null;

    // Use string split for legacy support if errors array is empty but message exists
    const displayErrors = errors.length > 0 
        ? errors 
        : message.split('\n').filter(Boolean).map((msg, i) => ({ id: '', message: msg, step: 1 }));

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-rose-100 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-rose-600 p-6 flex items-center gap-5 shrink-0">
                    <AlertCircle className="text-white w-10 h-10" />
                    <h3 className="text-white font-black text-3xl">提醒：尚有題目未填寫</h3>
                </div>
                <div className="p-8 overflow-y-auto">
                    <p className="text-slate-500 mb-6 font-bold text-xl">為了確保調查表完整性，請完成以下項目（點擊可跳轉）：</p>
                    <div className="space-y-4">
                        {displayErrors.map((err, i) => (
                            <button 
                                key={i}
                                onClick={() => {
                                    if (onJumpTo && err.id) onJumpTo(err.id, err.step);
                                    else onClose();
                                }}
                                className="w-full text-left p-5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-100 hover:border-rose-300 rounded-2xl transition-all duration-150 flex items-start justify-between group active:scale-[0.99]"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-rose-500 font-black mt-0.5 text-xl">•</span>
                                    <span className="text-slate-800 font-bold text-xl">{err.message}</span>
                                </div>
                                {err.id && <ChevronRight className="w-6 h-6 text-rose-300 group-hover:text-rose-500 shrink-0 mt-1" />}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t flex justify-end shrink-0">
                    <button onClick={onClose} className="bg-slate-800 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-700 transition-all duration-150 border-b-[6px] border-slate-950 active:border-b-2 active:translate-y-[4px] w-full sm:w-auto text-2xl shadow-lg shadow-slate-300">
                        關閉視窗
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ImagePreviewModal: React.FC<{ isOpen: boolean; imageUrl: string; onClose: () => void }> = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/95 z-[150] flex flex-col items-center justify-center p-4 backdrop-blur-xl" onClick={onClose}>
            <div className="bg-white p-8 rounded-[2.5rem] max-w-lg w-full text-center space-y-8 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">圖片已產生</h3>
                    <p className="text-rose-600 font-bold text-xl animate-pulse">請長按下方圖片<br/>選擇「加入照片」或「儲存圖片」</p>
                </div>
                <div className="overflow-auto max-h-[50vh] rounded-2xl border-4 border-slate-200 shadow-inner bg-slate-100 p-2">
                    <img src={imageUrl} alt="Generated Survey" className="w-full h-auto rounded-xl shadow-sm" />
                </div>
                <button onClick={onClose} className="w-full py-5 bg-slate-800 text-white rounded-2xl font-bold text-2xl transition-all duration-150 border-b-[6px] border-slate-950 active:border-b-2 active:translate-y-[4px] hover:bg-slate-700">關閉視窗</button>
            </div>
        </div>
    );
};

export const ExportSuccessModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[140] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border-4 border-white ring-4 ring-black/5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="bg-emerald-600 p-8 flex items-center gap-5">
                    <CheckCircle2 className="text-white w-10 h-10" strokeWidth={3} />
                    <h3 className="text-white font-black text-3xl">檔案已順利產出！</h3>
                </div>
                <div className="p-8 space-y-8">
                    <p className="text-slate-600 font-bold text-xl leading-relaxed">
                        請問您是否要<span className="text-rose-600 font-black">清空</span>剛才填寫的資料，以便填寫下一筆案件？
                    </p>
                    <div className="space-y-4">
                        <button onClick={onConfirm} className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black text-2xl hover:bg-sky-700 transition-all duration-150 flex items-center justify-center gap-3 border-b-[6px] border-sky-800 active:border-b-2 active:translate-y-[4px] shadow-lg">
                            <Trash2 className="w-6 h-6" strokeWidth={3} /> 是，清空資料 (填寫下一筆)
                        </button>
                        <button onClick={onCancel} className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-2xl hover:bg-slate-200 transition-all duration-150 flex items-center justify-center gap-3 border-2 border-slate-200 border-b-[6px] border-b-slate-300 active:border-b-2 active:translate-y-[4px]">
                            <X className="w-6 h-6" strokeWidth={3} /> 否，保留資料 (還要修改)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
