
import React, { useEffect } from 'react';
import { Info, Save, FileInput, Trash2, AlertCircle } from 'lucide-react';

// === CheckBox ===
interface CheckBoxProps {
    checked: boolean;
    label: string;
    onClick: () => void;
    labelColor?: string;
    size?: string; 
    disabled?: boolean;
}
export const CheckBox: React.FC<CheckBoxProps> = ({ checked, label, onClick, disabled = false }) => (
    <div 
        onClick={() => !disabled && onClick()} 
        className={`w-full p-5 rounded-2xl border-2 font-bold text-2xl cursor-pointer transition-all flex items-center justify-center text-center select-none shadow-sm active:scale-[0.98]
        ${checked ? 'bg-sky-600 border-sky-600 text-white shadow-md ring-2 ring-sky-200' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400 hover:bg-sky-50'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
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
    showIcon?: boolean; // Icon removal requested, parameter kept for compatibility but logic removed
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, layout = 'flex', cols = 2, disabled = false }) => (
    <div className={`${layout === 'flex' ? 'flex flex-col md:flex-row gap-4' : `grid grid-cols-1 md:grid-cols-${cols} gap-4`}`}>
        {options.map(v => (
            <button
                key={v}
                type="button"
                onClick={() => !disabled && onChange(v)}
                className={`flex-1 py-5 px-4 rounded-2xl font-bold text-2xl text-center flex items-center justify-center transition-all select-none shadow-sm active:scale-[0.98] gap-3
                ${value === v ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-200' : 'bg-white border-2 border-slate-300 text-slate-600 hover:bg-sky-50 hover:border-sky-400'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span>{v}</span>
            </button>
        ))}
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
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800/95 text-white px-8 py-5 rounded-2xl shadow-2xl z-[200] flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300 max-w-[90vw] border border-slate-600/50 backdrop-blur-md">
            <Info className="w-8 h-8 text-sky-400 shrink-0" />
            <p className="font-black text-xl whitespace-pre-wrap leading-relaxed tracking-wide">{message}</p>
        </div>
    );
};

// === Modals ===
export const DraftFoundModal: React.FC<{ isOpen: boolean; onLoad: () => void; onClear: () => void; onClose: () => void }> = ({ isOpen, onLoad, onClear, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border-4 border-sky-100" onClick={e => e.stopPropagation()}>
                <div className="bg-sky-500 p-6 flex items-center gap-4">
                    <Save className="text-white w-8 h-8" />
                    <h3 className="text-white font-black text-2xl">發現暫存檔</h3>
                </div>
                <div className="p-8">
                    <p className="text-slate-700 mb-8 font-bold text-xl leading-relaxed">系統偵測到您上次有未完成的填寫紀錄。<br />您想要讀取暫存檔繼續填寫嗎？</p>
                    <div className="space-y-4">
                        <button onClick={onLoad} className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-sky-700 transition flex items-center justify-center gap-3 active:scale-95">
                            <FileInput className="w-6 h-6" /> 讀取暫存檔
                        </button>
                        <button onClick={onClear} className="w-full py-5 bg-rose-100 text-rose-700 rounded-2xl font-black text-xl hover:bg-rose-200 transition flex items-center justify-center gap-3 active:scale-95 border-2 border-rose-200">
                            <Trash2 className="w-6 h-6" /> 清空暫存檔
                        </button>
                        <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold text-lg hover:text-slate-600 mt-2">暫不處理</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AlertModal: React.FC<{ isOpen: boolean; message: string; onClose: () => void }> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl max-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-red-100" onClick={e => e.stopPropagation()}>
                <div className="bg-red-500 p-5 flex items-center gap-4">
                    <AlertCircle className="text-white w-8 h-8" />
                    <h3 className="text-white font-black text-2xl">提醒：尚有題目未填寫</h3>
                </div>
                <div className="p-8">
                    <p className="text-slate-600 mb-4 font-bold text-xl">為了確保調查表完整性，請完成以下項目：</p>
                    <ul className="list-disc pl-6 space-y-2 text-red-600 font-bold text-lg max-h-[40vh] overflow-y-auto marker:text-red-400 text-left">
                        {message.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                    </ul>
                </div>
                <div className="p-6 bg-slate-50 border-t flex justify-end">
                    <button onClick={onClose} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition active:scale-95 shadow-lg w-full sm:w-auto text-xl">
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ImagePreviewModal: React.FC<{ isOpen: boolean; imageUrl: string; onClose: () => void }> = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 z-[150] flex flex-col items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white p-6 rounded-[2rem] max-w-lg w-full text-center space-y-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">圖片已產生</h3>
                    <p className="text-rose-600 font-bold text-xl animate-pulse">請長按下方圖片<br/>選擇「加入照片」或「儲存圖片」</p>
                </div>
                <div className="overflow-auto max-h-[50vh] rounded-xl border-4 border-slate-200 shadow-inner bg-slate-50">
                    <img src={imageUrl} alt="Generated Survey" className="w-full h-auto" />
                </div>
                <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition">關閉視窗</button>
            </div>
        </div>
    );
};
