
import React, { useEffect, useRef, useState } from 'react';
import { Info, Save, FileInput, Trash2, AlertCircle, ChevronRight, AlertTriangle, ChevronDown, CheckCircle2, X, Eraser, Check, HelpCircle, Mic } from 'lucide-react';
import { ValidationError } from '../types';
import { useInterface } from './InterfaceContext';

// Helper to determine color based on label content (Heuristic for Safety/Danger)
const getButtonColorClass = (checked: boolean, label: string, disabled: boolean, isStandard: boolean = false) => {
    if (disabled) {
        if (isStandard) return 'border-2 border-b-[4px] bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500';
        return 'border-4 border-b-[6px] md:border-b-[8px] bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500';
    }
    
    if (isStandard) {
        if (!checked) return 'border-2 border-b-[4px] active:border-b-2 active:translate-y-[2px] bg-white border-slate-400 border-b-slate-500 text-slate-700 hover:bg-slate-50 hover:border-slate-500 hover:border-b-slate-600 shadow-sm dark:bg-slate-800/80 dark:border-slate-600 dark:border-b-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/80';
        return 'border-2 border-b-2 translate-y-[2px] bg-sky-100 border-sky-300 border-b-sky-400 text-sky-800 shadow-inner dark:bg-sky-900/40 dark:border-sky-700 dark:text-sky-200';
    }

    // Unchecked state (Physical feel - Thick border, shadow)
    if (!checked) return 'border-4 border-b-[6px] md:border-b-[8px] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] bg-white border-slate-300 border-b-slate-400 text-slate-600 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 shadow-sm dark:bg-slate-800/80 dark:border-slate-600 dark:border-b-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/80 dark:hover:text-slate-200';

    // Selected State (Warm Light Blue - Replaces Traffic Light)
    return 'border-4 border-b-[6px] md:border-b-[8px] active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] bg-sky-100 border-sky-300 border-b-sky-400 text-sky-800 shadow-md dark:bg-sky-900/40 dark:border-sky-700 dark:border-b-sky-800 dark:text-sky-200';
};

// === CheckBox ===
interface CheckBoxProps {
    checked: boolean;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}
export const CheckBox: React.FC<CheckBoxProps> = ({ checked, label, onClick, disabled = false }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const paddingClass = isStandard ? 'py-1.5 px-3 md:py-2 md:px-3' : 'py-3 px-4 md:py-4 md:px-5';
    const roundedClass = isStandard ? 'rounded-md md:rounded-lg' : 'rounded-[1.25rem] md:rounded-[1.5rem]';
    const textClass = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl md:text-3xl';
    const iconSize = isStandard ? 'w-4 h-4' : 'w-6 h-6 md:w-8 md:h-8';

    return (
        <div 
            onClick={() => {
                if (!disabled) {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                    onClick();
                }
            }} 
            className={`w-full ${paddingClass} ${roundedClass} font-bold tracking-wide ${textClass} cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none relative overflow-hidden
            ${getButtonColorClass(checked, label, disabled, isStandard)}`}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {checked && <CheckCircle2 className={`${iconSize} text-emerald-500 fill-white`} strokeWidth={2.5} />}
                {label}
            </span>
        </div>
    );
};

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
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const paddingClass = isStandard ? 'py-1.5 px-3 md:py-2 md:px-3' : 'py-3 px-4 md:py-4 md:px-5';
    const roundedClass = isStandard ? 'rounded-md md:rounded-lg' : 'rounded-[1.25rem] md:rounded-[1.5rem]';
    const textClass = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl md:text-2xl';
    const iconSize = isStandard ? 'w-4 h-4' : 'w-6 h-6 md:w-8 md:h-8';
    const subTextSize = isStandard ? 'text-[14px]' : 'text-lg';

    // Stage 2: Intelligent Layout Detection
    // 題目的選項按鈕若只有兩個且字數短(不超過5個字)，例如 無 有 ，則維持水平排序；超過三個以上的選項則改為垂直排序
    const isShortAndSimple = options.length === 2 && options.every(o => o.length <= 5);
    
    let finalLayout = layout;
    let finalCols = cols || 2;

    if (options.length >= 3) {
        finalLayout = 'grid';
        finalCols = 1;
    } else if (isShortAndSimple) {
        finalLayout = 'grid';
        finalCols = 2;
    } else if (options.length === 2) {
        finalLayout = 'grid';
        finalCols = 1;
    } else {
        finalLayout = 'grid';
        finalCols = 1;
    }

    const isGrid = finalLayout === 'grid';
    const gridCols = finalCols === 1 ? 'grid-cols-1' : (finalCols === 2 ? 'grid-cols-2' : (finalCols === 3 ? 'grid-cols-3' : `grid-cols-${finalCols}`));
    
    // Helper to render label with subtitle if parentheses exist
    const renderLabel = (text: string, isSelected: boolean) => {
        const match = text.match(/^(.*?)(\s*[\(（].*?[\)）])$/);
        const mainText = match ? match[1] : text;
        const subText = match ? match[2].trim() : null;

        const mainContent = <span>{mainText}</span>;

        if (subText) {
            return (
                <div className={`flex flex-col items-center justify-center w-full ${isStandard ? 'py-1 min-h-[3rem]' : 'py-3 min-h-[5rem]'}`}>
                    <div className={`${isStandard ? 'mb-1' : 'mb-4'} flex items-center gap-2`}>
                        {isSelected && <CheckCircle2 className={`${iconSize} text-emerald-500 fill-white`} strokeWidth={2.5} />}
                        {mainContent}
                    </div>
                    <div className={`${isStandard && isSelected ? 'bg-sky-500 dark:bg-sky-700' : 'bg-orange-100 dark:bg-orange-900/40'} ${isStandard ? 'px-2 py-0.5' : 'px-3 py-2'} rounded-md w-full max-w-[95%] shadow-sm flex items-center justify-center`}>
                        <span className={`${subTextSize} font-bold ${isStandard && isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'} block leading-normal break-words whitespace-normal`}>
                            {subText}
                        </span>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-2">
                {isSelected && <CheckCircle2 className={`${iconSize} text-emerald-500 fill-white`} strokeWidth={2.5} />}
                {mainContent}
            </div>
        );
    };

    return (
        <div className={`${isGrid ? `grid ${gridCols}` : 'flex flex-wrap'} gap-2 md:gap-3`}>
            {options.map((v, idx) => {
                const isSelected = value === v;
                return (
                    <button
                        key={v}
                        type="button"
                        onClick={() => {
                            if (!disabled) {
                                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                                onChange(value === v ? '' : v);
                            }
                        }}
                        className={`${isGrid ? 'flex-1' : 'flex-auto min-w-[120px]'} ${paddingClass} ${roundedClass} font-bold tracking-wide ${textClass} text-center flex items-center justify-center transition-all duration-200 select-none gap-2 md:gap-3 relative overflow-hidden
                        ${getButtonColorClass(isSelected, v, disabled, isStandard)}
                        ${spanFullOption === v ? 'col-span-full w-full' : ''}`}
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
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const paddingClass = isStandard ? 'py-1.5 px-3 md:py-2 md:px-3' : 'py-3 px-4 md:py-4 md:px-5';
    const roundedClass = isStandard ? 'rounded-md md:rounded-lg' : 'rounded-[1.25rem] md:rounded-[1.5rem]';
    const textClass = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl md:text-2xl';
    const iconSize = isStandard ? 'w-4 h-4' : 'w-6 h-6 md:w-8 md:h-8';

    // Stage 2: Intelligent Layout Detection
    // 題目的選項按鈕若只有兩個且字數短(不超過5個字)，例如 無 有 ，則維持水平排序；超過三個以上的選項則改為垂直排序
    const isShortAndSimple = options.length === 2 && options.every(o => o.length <= 5);
    
    let finalCols = cols || 2;

    if (options.length >= 3) {
        finalCols = 1;
    } else if (isShortAndSimple) {
        finalCols = 2;
    } else if (options.length === 2) {
        finalCols = 1;
    } else {
        finalCols = 1;
    }

    const isGrid = true;
    const gridClass = finalCols === 1 ? 'grid grid-cols-1' : (finalCols === 2 ? 'grid grid-cols-2' : `grid grid-cols-${finalCols}`);

    return (
        <div className="flex flex-col gap-3 md:gap-4">
            <div className={`${gridClass} gap-2 md:gap-3`}>
                {options.map((opt, idx) => {
                    const isSelected = value === opt;
                    return (
                        <button 
                            key={opt}
                            type="button" 
                            disabled={disabled} 
                            onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                                onChange(value === opt ? '' : opt);
                            }} 
                            className={`${isGrid ? 'flex-1' : 'flex-auto min-w-[120px]'} ${paddingClass} ${roundedClass} font-bold tracking-wide ${textClass} text-center flex justify-center items-center transition-all duration-200 select-none gap-2 md:gap-4 relative overflow-hidden
                            ${getButtonColorClass(isSelected, opt, disabled, isStandard)}`}
                        >
                            <span className="flex items-center gap-2">
                                {isSelected && <CheckCircle2 className={`${iconSize} text-emerald-500 fill-white`} strokeWidth={2.5} />}
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

export const AccordionOption: React.FC<AccordionOptionProps> = ({ label, subLabel, checked, onClick }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const titleSize = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl';
    const subSize = isStandard ? 'text-[14px]' : 'text-lg';
    const minHeight = isStandard ? 'min-h-[36px]' : 'min-h-[65px]';

    return (
        <div
            onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                onClick();
            }}
            className={`w-[90%] mx-auto ${minHeight} flex items-center justify-between ${isStandard ? 'px-3 py-1.5' : 'px-5 py-3'} rounded-lg transition-all duration-200 cursor-pointer select-none mb-2
            ${isStandard 
                ? (checked 
                    ? 'border-2 border-b-2 translate-y-[2px] bg-sky-100 border-sky-300 border-b-sky-400 text-sky-800 shadow-inner dark:bg-sky-900/40 dark:border-sky-700 dark:text-sky-200' 
                    : 'border-2 border-b-[4px] active:border-b-2 active:translate-y-[2px] bg-white border-slate-400 border-b-slate-500 text-slate-700 hover:bg-slate-50 hover:border-slate-500 hover:border-b-slate-600 shadow-sm dark:bg-slate-800/80 dark:border-slate-600 dark:border-b-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/80')
                : (checked
                    ? 'border bg-sky-100 border-sky-300 text-sky-800 shadow-sm dark:bg-sky-900/40 dark:border-sky-700 dark:text-sky-200'
                    : 'border bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:bg-slate-700/80')
            }`}
        >
            <div className="flex flex-col text-left">
                <span className={`${titleSize} font-bold leading-tight ${isStandard ? (checked ? 'text-white' : 'text-slate-700 dark:text-slate-300') : (checked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-400')}`}>
                    {label}
                </span>
                {subLabel && (
                    <span className={`${subSize} mt-1 leading-normal ${isStandard ? (checked ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400') : 'text-slate-500 dark:text-slate-500'}`}>
                        {subLabel}
                    </span>
                )}
            </div>
            
            {/* Icon Area */}
            <div className="flex-shrink-0 ml-4">
                {checked && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isStandard ? 'bg-sky-500 border-2 border-sky-400 dark:bg-sky-700/80 dark:border-sky-600' : 'bg-white border-2 border-emerald-500 dark:bg-slate-800 dark:border-emerald-600'}`}>
                        <Check className={`w-5 h-5 ${isStandard ? 'text-white' : 'text-emerald-500 dark:text-emerald-500'}`} strokeWidth={3} />
                    </div>
                )}
            </div>
        </div>
    );
};

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
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const titleSize = isStandard ? 'text-[22px] md:text-[24px]' : 'text-[1.75rem] md:text-[2.25rem]';
    const hintSize = isStandard ? 'text-[16px] md:text-[18px]' : 'text-lg md:text-xl';
    const titlePaddingClass = isStandard ? 'px-4 pt-4 pb-2' : 'p-5 md:p-6';
    const roundedClass = isStandard ? 'rounded-xl md:rounded-2xl' : 'rounded-[1.5rem] md:rounded-[2rem]';
    const contentPaddingClass = isStandard ? 'px-4 pb-3 pt-0' : 'px-5 md:px-6 pb-5 md:pb-6 pt-0';
    const dividerMarginClass = isStandard ? 'mb-2 -mt-1' : 'mb-5 md:mb-6 -mt-2';
    const spaceYClass = isStandard ? 'space-y-3 md:space-y-4' : 'space-y-6 md:space-y-8';
    const collapseMarginClass = isStandard ? 'mt-3' : 'mt-8 md:mt-10';
    const collapseBtnClass = isStandard ? 'px-6 py-2.5 rounded-xl text-lg' : 'px-8 py-4 rounded-2xl text-xl';

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
        if (highlighted) return 'error-highlight-anim border-2 border-slate-200'; // Error takes precedence
        
        switch (status) {
            case 'complete':
                return 'bg-[#ECFDF5] border-2 border-[#A7F3D0] dark:bg-emerald-900/30 dark:border-emerald-800'; // Soft bean paste green
            case 'incomplete':
                return 'bg-[#FFF1F2] border-2 border-[#FECDD3] dark:bg-rose-900/30 dark:border-rose-800'; // Low saturation warm red
            default:
                return 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
        }
    };

    const getTitleColor = () => {
        // Prominent but gentle color suitable for elderly (Ocean Blue / Sky 700)
        return 'text-[#0369a1] dark:text-sky-300';
    };

    return (
        <div 
            id={id} 
            className={`warm-card ${roundedClass} shadow-sm hover:shadow-md transition-all duration-500 ${getStatusStyles()} overflow-hidden ${className.replace(/space-y-\d+/g, '')}`} 
        >
            {title ? (
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${titlePaddingClass} flex justify-between items-start gap-4 md:gap-6 cursor-pointer select-none transition-colors duration-200 ${isOpen ? '' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/50'}`}
                >
                    <div className={`flex-grow pt-1 flex flex-col ${isStandard ? 'gap-1' : 'gap-2'}`}>
                        {typeof title === 'string' 
                            ? <p className={`${titleSize} font-black text-left leading-tight tracking-tight transition-colors duration-300 ${getTitleColor()}`}>{title}</p> 
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
                        {!isOpen && (
                            <span className={`${hintSize} font-black text-emerald-600 transition-all duration-300 whitespace-nowrap dark:text-emerald-400 animate-in fade-in bg-emerald-50/60 px-4 py-2 rounded-xl dark:bg-emerald-900/20 border-2 border-emerald-100/50 dark:border-emerald-800/50`}>
                                點我展開
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                // Spacer if no title exists
                <div className="h-4"></div>
            )}
            
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className={contentPaddingClass}>
                        {/* Divider Line */}
                        {title && <div className={`border-b-4 ${dividerMarginClass} ${status === 'complete' ? 'border-emerald-100 dark:border-emerald-800' : (status === 'incomplete' ? 'border-rose-100 dark:border-rose-800' : 'border-slate-100 dark:border-slate-700')}`} />}
                        
                        {/* Content */}
                        <div className={className.includes('space-y') ? className : `${spaceYClass} ${className}`}>
                            {children}
                        </div>

                        {/* Bottom Collapse Button */}
                        <div className={`${collapseMarginClass} flex justify-center`}>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    // Optional: Scroll back to header slightly if needed, but usually not required if just collapsing
                                    const el = document.getElementById(id || '');
                                    if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                                className={`flex items-center gap-2 md:gap-3 ${collapseBtnClass} bg-orange-50 text-orange-600 font-black hover:bg-orange-100 transition-colors shadow-sm border-2 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-800 dark:hover:bg-orange-900/60`}
                            >
                                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 rotate-180" strokeWidth={3} />
                                <span>點我縮小</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// === New Reusable Components for Phase 2 Refactor ===

// Standard visual block for questions (Gray bg, rounded)
export const QuestionBlock: React.FC<{ children: React.ReactNode, className?: string, id?: string }> = ({ children, className = '', id }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const paddingClass = isStandard ? 'p-2 md:p-3' : 'p-4 md:p-5';
    const roundedClass = isStandard ? 'rounded-lg md:rounded-xl' : 'rounded-[1.25rem] md:rounded-[1.5rem]';
    const borderClass = isStandard ? 'border' : 'border-2';

    return (
        <div id={id} className={`bg-slate-50 ${paddingClass} ${roundedClass} ${borderClass} border-slate-200 text-left hover:border-slate-300 hover:shadow-md transition-all dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600 ${className}`}>
            {children}
        </div>
    );
};

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
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const labelSize = isStandard ? 'text-[18px] md:text-[20px]' : 'dynamic-text-h2';
    const labelMarginClass = isStandard ? 'mb-1.5 md:mb-2' : 'mb-3 md:mb-4';

    const isTriggered = Array.isArray(trigger) ? trigger.includes(value) : value === trigger;
    
    return (
        <QuestionBlock className={disabled ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}>
            {label && (
                <div className={labelMarginClass}>
                    {typeof label === 'string' ? <p className={`${labelSize} font-black text-slate-700 dark:text-slate-200`}>{label}</p> : label}
                </div>
            )}
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
}> = ({ id, label, value, onChange, placeholder, highlighted = false, className = '' }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const labelSize = isStandard ? 'text-[18px] md:text-[20px]' : 'dynamic-text-h2';
    const inputSize = isStandard ? '!text-[18px] md:!text-[20px]' : '!text-xl';

    return (
        <div id={id} className={`transition-all duration-500 rounded-xl p-2 -m-2 ${highlighted ? 'error-highlight-anim' : ''} ${className}`}>
            <label className={`block text-slate-800 font-black mb-2 ${labelSize} text-left dark:text-slate-100`}>{label}</label>
            <input 
                type="text" 
                className={`full-width-input ${inputSize} border-2 border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-[#E0F2FE] focus:bg-white dark:focus:bg-yellow-900/20`} 
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                autoComplete="off" 
            />
        </div>
    );
};

// Unit Input with numeric keypad support
export const UnitInput = ({ value, onChange, unit, placeholder, disabled = false }: { value: string, onChange: (val: string) => void, unit: string, placeholder?: string, disabled?: boolean }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const inputSize = isStandard ? '!text-[18px] md:!text-[20px]' : '!text-xl';
    const unitSize = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl';

    return (
        <div className="relative w-full">
            <input 
                type="number" 
                inputMode="decimal"
                disabled={disabled}
                className={`full-width-input ${inputSize} pr-16 border-2 border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-[#E0F2FE] focus:bg-white dark:focus:bg-yellow-900/20 ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700' : ''}`}
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className={`${unitSize} font-black ${disabled ? 'text-gray-400 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{unit}</span>
            </div>
        </div>
    );
};

// Reusable Land Number Input Group (Section/SubSection/Number)
export const LandNumberInputs: React.FC<{
    section: string;
    subSection: string;
    number: string;
    onChangeSection: (val: string) => void;
    onChangeSubSection: (val: string) => void;
    onChangeNumber: (val: string) => void;
}> = ({ section, subSection, number, onChangeSection, onChangeSubSection, onChangeNumber }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const inputSize = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl md:text-2xl';

    return (
        <div className="flex flex-wrap items-end gap-3 md:gap-4 w-full dark:text-slate-200 pt-2">
            <div className="flex items-center">
                <input 
                    type="text" 
                    className={`border-b-[4px] border-slate-300 bg-transparent ${inputSize} font-black w-24 md:w-32 text-center px-1 pb-1 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-[#E0F2FE] dark:focus:bg-yellow-900/20 outline-none transition-colors dark:border-slate-500 dark:text-white dark:focus:border-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-none`} 
                    value={section || ''} 
                    onChange={e => onChangeSection(e.target.value)} 
                    placeholder="段" 
                />
                <span className={`font-black ${inputSize} ml-2 mb-1 text-slate-700 dark:text-slate-300`}>段</span>
            </div>
            
            <div className="flex items-center">
                <input 
                    type="text" 
                    className={`border-b-[4px] border-slate-300 bg-transparent ${inputSize} font-black w-20 md:w-24 text-center px-1 pb-1 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-[#E0F2FE] dark:focus:bg-yellow-900/20 outline-none transition-colors dark:border-slate-500 dark:text-white dark:focus:border-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-none`} 
                    value={subSection || ''} 
                    onChange={e => onChangeSubSection(e.target.value)} 
                    placeholder="小段" 
                />
                <span className={`font-black ${inputSize} ml-2 mb-1 text-slate-700 dark:text-slate-300`}>小段</span>
            </div>
            
            <div className="flex items-center flex-grow md:flex-grow-0">
                <input 
                    type="text" 
                    className={`border-b-[4px] border-slate-300 bg-transparent ${inputSize} font-black w-32 md:w-40 text-center px-1 pb-1 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-[#E0F2FE] dark:focus:bg-yellow-900/20 outline-none transition-colors dark:border-slate-500 dark:text-white dark:focus:border-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-none`} 
                    value={number || ''} 
                    onChange={e => onChangeNumber(e.target.value)} 
                    placeholder="地號" 
                />
                <span className={`font-black ${inputSize} ml-2 mb-1 text-slate-700 dark:text-slate-300`}>號</span>
            </div>
        </div>
    );
};

export const Select: React.FC<{
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}> = ({ value, onChange, options, placeholder = "請選擇", className = '' }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const inputSize = isStandard ? 'text-[18px] md:text-[20px] py-2' : 'text-xl py-4';

    return (
        <div className={`relative ${className}`}>
            <select
                className={`w-full appearance-none bg-white border-2 border-slate-300 text-slate-900 ${inputSize} rounded-xl px-4 pr-10 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-[#E0F2FE] transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/30`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 dark:text-slate-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
        </div>
    );
};

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
                <div className="w-full h-64 md:h-80 border-4 border-slate-300 rounded-2xl bg-white overflow-hidden flex items-center justify-center relative shadow-inner dark:bg-slate-100">
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
            <div className="w-full h-80 md:h-96 bg-white border-4 border-slate-300 rounded-[1.5rem] touch-none overflow-hidden relative shadow-inner cursor-crosshair hover:border-slate-400 transition-colors dark:border-slate-600 dark:bg-slate-100">
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
export const SubItemHighlight: React.FC<{ children: React.ReactNode, disabled?: boolean }> = ({ children, disabled = false }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const paddingClass = isStandard ? 'p-2 md:p-3' : 'p-4 md:p-5';
    const roundedClass = isStandard ? 'rounded-lg md:rounded-xl' : 'rounded-[1.25rem] md:rounded-[1.5rem]';
    const borderClass = isStandard ? 'border-l-[3px] md:border-l-[4px]' : 'border-l-[6px] md:border-l-[8px]';
    const marginClass = isStandard ? 'mt-2 mb-2' : 'mt-2 mb-3';

    return (
        <div className={`${marginClass} ${paddingClass} ${isStandard ? 'bg-slate-100/80 border-sky-400 dark:bg-slate-800/80 dark:border-sky-500' : 'bg-orange-50/80 border-orange-400 dark:bg-orange-900/20 dark:border-orange-500'} ${roundedClass} ${borderClass} shadow-inner animate-in slide-in-from-top-4 fade-in duration-300 ${disabled ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}`}>
            <div className="pl-1 md:pl-2">{children}</div>
        </div>
    );
};

export const DetailInput = ({ value, onChange, placeholder = "說明現況", disabled = false, autoFocus = true }: { value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean, autoFocus?: boolean }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showMicHint, setShowMicHint] = useState(false);
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const inputSize = isStandard ? '!text-[18px] md:!text-[20px]' : '!text-xl';
    
    useEffect(() => {
        if (!disabled && autoFocus && inputRef.current) {
            // Small timeout ensures the expand animation doesn't conflict with scrolling behavior
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [disabled, autoFocus]);

    return (
        <div className={`relative w-full ${disabled ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}`}>
            <input 
                ref={inputRef}
                type="text" 
                className={`full-width-input ${inputSize} !mt-0 !bg-white focus:!bg-white dark:!bg-slate-900 dark:focus:!bg-yellow-900/20 pr-24 border-2 border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-[#E0F2FE]`} 
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

export const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const textSize = isStandard ? 'text-[18px] md:text-[20px]' : 'text-2xl md:text-3xl';
    const iconSize = isStandard ? 'w-6 h-6 md:w-8 md:h-8' : 'w-12 h-12 md:w-16 md:h-16';

    return (
        <div className={`bg-yellow-100 ${isStandard ? 'p-4 md:p-5 rounded-xl md:rounded-2xl border-2' : 'p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-4'} border-red-500 text-center shadow-lg mb-6 md:mb-8 animate-in zoom-in-95 duration-300 dark:bg-yellow-900/30 dark:border-red-400`}>
            <div className="flex flex-col items-center gap-3 md:gap-4 text-red-800 dark:text-red-300">
                <AlertTriangle className={`${iconSize}`} strokeWidth={3} />
                <p className={`${textSize} font-black leading-relaxed tracking-wide`}>{children}</p>
            </div>
        </div>
    );
};

export const InlineWarning: React.FC<{ children: React.ReactNode, center?: boolean, className?: string }> = ({ children, center = false, className = "" }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const textSize = isStandard ? 'text-[18px] md:text-[20px]' : 'text-xl md:text-2xl';
    const iconSize = isStandard ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8';

    return (
        <div className={`w-full ${isStandard ? 'py-2 px-3 md:py-3 md:px-4 rounded-lg md:rounded-xl' : 'py-4 px-5 md:py-5 md:px-6 rounded-xl md:rounded-2xl'} bg-[#FDE047] flex items-start gap-2 shadow-sm dark:bg-yellow-900/40 ${className}`}>
            <AlertTriangle className={`${iconSize} text-[#78350F] shrink-0 mt-0.5 dark:text-yellow-200`} strokeWidth={2.5} />
            <div className={`${textSize} text-[#78350F] font-bold leading-snug dark:text-yellow-200 ${center ? 'text-center w-full' : 'text-left'}`}>
                {children}
            </div>
        </div>
    );
};

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

    // Highlight "有" (Yes/Has issue) options in red for quick scanning
    // Also include common issue keywords to ensure they are caught even without "有/是" prefix
    const warningKeywords = [
        '滲漏水', '壁癌', '瑕疵', '異常', '不符', '占用', '剝落', '外露', '龜裂', 
        '傾斜', '待查證', '受限', '袋地', '糾紛', '越界', '海砂', '輻射', '非自然', 
        '事故', '違建', '私下', '不明', '不確定', '無法', '外推', '加蓋', '夾層', 
        '增建', '改建', '損壞', '危險', '破壞', '漏水', '阻塞', '不通'
    ];
    const hasWarningKeyword = warningKeywords.some(kw => label.includes(kw));
    const isWarningOption = checked && (hasWarningKeyword || 
        ((label.includes('有') || label.includes('是')) && 
         !label.includes('有保存登記') && 
         !label.includes('有車位編號') && 
         !label.includes('有公共設施') && 
         !label.includes('所有權人自用') && 
         !label.includes('合法') && 
         !label.includes('正常') &&
         !label.includes('有農作物') &&
         !label.includes('有建築物') &&
         !label.includes('有設置')));
    
    const labelClass = isWarningOption 
        ? `preview-checkbox-label font-black underline underline-offset-4 decoration-2 text-red-600 dark:text-red-400`
        : `preview-checkbox-label ${variant === 'mobile' ? 'text-slate-800 dark:text-slate-200' : 'text-black'}`;

    return (
        <div className="preview-checkbox-wrapper inline-flex items-center">
            {variant === 'mobile' ? (
                <div className={boxClass}>
                    {checked ? 'V' : ''}
                </div>
            ) : (
                <div className={boxClass}>
                    {checked ? <Check className={`w-5 h-5 ${isWarningOption ? 'text-red-600' : 'text-black'}`} strokeWidth={3} /> : ''}
                </div>
            )}
            <span className={labelClass}>
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
export const AlertModal: React.FC<{ isOpen: boolean; errors: ValidationError[]; onClose: () => void; onJumpTo: (id: string, step: number) => void }> = ({ isOpen, errors, onClose, onJumpTo }) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const textSize = isStandard ? 'text-base md:text-lg' : 'text-xl md:text-2xl';
    
    return (
    <Modal isOpen={isOpen} onClose={onClose} title="請檢查以下欄位">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-rose-50 p-4 md:p-6 rounded-2xl border-2 border-rose-100 mb-4 flex items-center gap-3 dark:bg-rose-900/20 dark:border-rose-800">
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-rose-600 dark:text-rose-400" strokeWidth={3} />
                <span className={`font-black ${textSize} text-rose-800 dark:text-rose-200`}>共有 {errors.length} 個項目需要修正</span>
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
                        <span className={`font-black ${isStandard ? 'text-base md:text-lg' : 'text-lg md:text-xl'} text-slate-700 group-hover:text-sky-800 dark:text-slate-300 dark:group-hover:text-sky-200`}>{err.message}</span>
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
};

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

export const ImageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    title?: string;
    fallbackUrl?: string;
}> = ({ isOpen, onClose, imageSrc, title, fallbackUrl }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasError(false);
        }
    }, [isOpen, imageSrc]);

    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={onClose}
        >
            <div 
                className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">{title || '參考圖例'}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="p-4 bg-slate-100 flex justify-center overflow-auto flex-1">
                    {hasError && fallbackUrl ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <p className="text-slate-600 mb-4 text-lg">圖片無法載入，請點擊下方按鈕查看。</p>
                            <a 
                                href={fallbackUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
                            >
                                開啟參考圖例
                            </a>
                        </div>
                    ) : (
                        <img 
                            src={imageSrc} 
                            alt={title} 
                            className="max-w-full h-auto object-contain rounded-lg shadow-sm" 
                            referrerPolicy="no-referrer"
                            onError={() => setHasError(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
