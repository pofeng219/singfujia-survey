
import React, { useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Save, FileInput, Image as ImageIcon, FileText, Edit3, Eye, ArrowLeft, Trash2 } from 'lucide-react';

import { SurveyData, SurveyType, MobileTab, ValidationError } from '../types';
import { INITIAL_STATE } from '../constants';

import { Toast, DraftFoundModal, AlertModal, ImagePreviewModal, ExportSuccessModal } from './SharedUI';
import { SurveyPreview } from './SurveyPreview';
import { validateForm } from '../utils/validators';
import { Step1, Step2, Step3, Step4 } from './FormSteps';

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };
    
    static getDerivedStateFromError(_: Error): ErrorBoundaryState { return { hasError: true }; }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full bg-red-50 p-10 flex-col text-center">
                    <h1 className="text-4xl font-black text-red-600 mb-6">⚠️ 畫面暫時中斷</h1>
                    <button onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} className="bg-red-600 text-white px-10 py-6 rounded-2xl font-black text-2xl border-b-[6px] border-red-800 active:border-b-2 active:translate-y-[4px] transition-all duration-150">重新整理頁面</button>
                </div>
            );
        }
        return (this as any).props.children;
    }
}

interface SurveyFormProps {
    type: SurveyType;
    onBack: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ type, onBack }) => {
    const [data, setData] = useState<SurveyData>(INITIAL_STATE);
    const [activeStep, setActiveStep] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [mobileTab, setMobileTab] = useState<MobileTab>('edit');
    const [previewPage, setPreviewPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [draftFoundModalOpen, setDraftFoundModalOpen] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string>('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [highlightedField, setHighlightedField] = useState<string | null>(null);
    const [showExportSuccessModal, setShowExportSuccessModal] = useState(false);

    const DRAFT_KEY = `survey_draft_${type}`;
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const formScrollRef = useRef<HTMLDivElement>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef(data);

    // Synchronize colors with LandingPage
    const themeBg = type === 'parking' ? 'bg-[#BE123C]' : (type === 'land' ? 'bg-[#15803D]' : (type === 'factory' ? 'bg-[#C2410C]' : 'bg-[#0369A1]'));
    const themeBorder = type === 'parking' ? 'border-rose-200' : (type === 'land' ? 'border-green-200' : (type === 'factory' ? 'border-orange-200' : 'border-sky-200'));
    const themeText = type === 'parking' ? 'text-rose-700' : (type === 'land' ? 'text-green-700' : (type === 'factory' ? 'text-orange-700' : 'text-sky-700'));

    useEffect(() => { dataRef.current = data; }, [data]);

    const parkingLogic = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;
        return { isNoParking, isOtherPt, disableMethod: isNoParking, disableNumber: isNoParking || isOtherPt, disableCarStatus: isNoParking || isOtherPt, disableCarSize: isNoParking || isOtherPt, disableWeight: isNoParking || isOtherPt || pts.includes("坡道平面") || pts.includes("一樓平面"), disableHeight: isNoParking || isOtherPt || pts.includes("一樓平面"), disableCharging: isNoParking, disableAbnormal: isNoParking, disableSupplement: isNoParking, disableMoto: false };
    }, [data.q10_noParking, data.q10_parkTypes, data.q10_hasParkTypeOther]);

    useEffect(() => {
        const updates: Partial<SurveyData> = {};
        const d = dataRef.current;
        const shouldUpdate = (key: keyof SurveyData, newValue: any) => {
            if (Array.isArray(newValue)) return ((d[key] as any[]) || []).length > 0;
            return d[key] !== newValue;
        };
        if (parkingLogic.isNoParking) {
            if (shouldUpdate('q10_parkTypes', [])) updates.q10_parkTypes = [];
            if (shouldUpdate('q10_parkingNumberType', '')) updates.q10_parkingNumberType = '';
            if (shouldUpdate('q10_parkingNumberVal', '')) updates.q10_parkingNumberVal = '';
            if (shouldUpdate('q10_carUsage', [])) updates.q10_carUsage = [];
            if (shouldUpdate('q10_dimL', '')) updates.q10_dimL = ''; 
            if (shouldUpdate('q10_dimW', '')) updates.q10_dimW = ''; 
            if (shouldUpdate('q10_dimH', '')) updates.q10_dimH = '';
            if (shouldUpdate('q10_mechWeight', '')) updates.q10_mechWeight = '';
            if (shouldUpdate('q10_entryHeight', '')) updates.q10_entryHeight = '';
            if (shouldUpdate('q10_charging', '')) updates.q10_charging = '';
            if (shouldUpdate('q11_hasIssue', '否')) updates.q11_hasIssue = '否';
            if (shouldUpdate('q12_hasNote', '否')) updates.q12_hasNote = '否';
        } else if (parkingLogic.isOtherPt) {
            if (shouldUpdate('q10_parkingNumberType', '')) updates.q10_parkingNumberType = '';
            if (shouldUpdate('q10_parkingNumberVal', '')) updates.q10_parkingNumberVal = '';
            if (shouldUpdate('q10_carUsage', [])) updates.q10_carUsage = [];
            if (shouldUpdate('q10_dimL', '')) updates.q10_dimL = ''; 
            if (shouldUpdate('q10_dimW', '')) updates.q10_dimW = ''; 
            if (shouldUpdate('q10_dimH', '')) updates.q10_dimH = '';
            if (shouldUpdate('q10_mechWeight', '')) updates.q10_mechWeight = '';
            if (shouldUpdate('q10_entryHeight', '')) updates.q10_entryHeight = '';
        } else {
            if (parkingLogic.disableWeight && shouldUpdate('q10_mechWeight', '')) updates.q10_mechWeight = '';
            if (parkingLogic.disableHeight && shouldUpdate('q10_entryHeight', '')) updates.q10_entryHeight = '';
        }
        if (Object.keys(updates).length > 0) setData(prev => ({ ...prev, ...updates }));
    }, [parkingLogic.isNoParking, parkingLogic.isOtherPt, parkingLogic.disableWeight, parkingLogic.disableHeight]);

    useEffect(() => {
        const checkMobile = () => { if (typeof window !== 'undefined') setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 1024); };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const performSave = (silent: boolean = false) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(dataRef.current)); if (!silent) setToastMsg("✅ 文字已儲存成功！"); } catch (e) { if (!silent) setToastMsg("儲存失敗：瀏覽器限制存取"); } };
    const saveDraft = () => performSave(false);
    useEffect(() => { const timer = setInterval(() => { if (JSON.stringify(dataRef.current) !== JSON.stringify(INITIAL_STATE)) performSave(true); }, 5000); return () => clearTimeout(timer); }, []);
    const loadDraft = () => { try { const saved = localStorage.getItem(DRAFT_KEY); if (saved) { setData(JSON.parse(saved)); setToastMsg("已讀取暫存檔"); } setDraftFoundModalOpen(false); } catch (e) { } };
    
    // Extracted reset logic to be used by both manual clear and post-export clear
    const performReset = () => {
        try {
            localStorage.removeItem(DRAFT_KEY);
            setData(JSON.parse(JSON.stringify(INITIAL_STATE)));
            setActiveStep(1);
            setToastMsg("暫存檔已清空，畫面已重置");
        } catch (e) { }
    };

    const clearDraft = () => { 
        if (typeof window !== 'undefined' && window.confirm("確定要清空嗎？此動作會移除所有已填寫內容。")) { 
            performReset();
            setDraftFoundModalOpen(false); 
        } 
    };
    
    useEffect(() => { try { const saved = localStorage.getItem(DRAFT_KEY); if (saved && saved !== JSON.stringify(INITIAL_STATE)) setDraftFoundModalOpen(true); } catch (e) { } }, [DRAFT_KEY]);

    useEffect(() => {
        let inactivityTimer: ReturnType<typeof setTimeout>;
        const resetInactivityTimer = () => { clearTimeout(inactivityTimer); inactivityTimer = setTimeout(() => { const currentData = JSON.stringify(dataRef.current); if (currentData !== JSON.stringify(INITIAL_STATE)) performSave(true); }, 5 * 60 * 1000); };
        let lastActivity = 0;
        const handleActivity = () => { const now = Date.now(); if (now - lastActivity > 1000) { resetInactivityTimer(); lastActivity = now; } };
        const handleBeforeUnload = (e: BeforeUnloadEvent) => { const currentStr = JSON.stringify(dataRef.current); const savedStr = localStorage.getItem(DRAFT_KEY); const initialStr = JSON.stringify(INITIAL_STATE); if (currentStr !== initialStr && currentStr !== (savedStr || initialStr)) { e.preventDefault(); e.returnValue = '確定尚未存檔就離開分頁嗎？'; return '確定尚未存檔就離開分頁嗎？'; } };
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, handleActivity));
        window.addEventListener('beforeunload', handleBeforeUnload);
        resetInactivityTimer();
        return () => { events.forEach(event => window.removeEventListener(event, handleActivity)); window.removeEventListener('beforeunload', handleBeforeUnload); clearTimeout(inactivityTimer); };
    }, []);

    useEffect(() => {
        const handleResize = () => { if (exporting || typeof window === 'undefined') return; const A4_WIDTH = 794; let newScale = 1; if (window.innerWidth >= 1024) { if (previewWrapperRef.current) { const containerWidth = previewWrapperRef.current.clientWidth; const availableWidth = containerWidth - 100; newScale = Math.min(1, availableWidth / A4_WIDTH); } } else { if (mobileTab === 'preview') { const availableWidth = window.innerWidth - 32; newScale = Math.min(1, availableWidth / A4_WIDTH); } } setPreviewScale(newScale > 0.1 ? newScale : 0.1); };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileTab, exporting]);

    const update = (key: keyof SurveyData, val: any) => setData(p => ({ ...p, [key]: val }));
    const toggleArr = (key: keyof SurveyData, val: string) => setData(p => { const arr = Array.isArray(p[key]) ? p[key] as string[] : []; return { ...p, [key]: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] }; });

    useEffect(() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' }); if (formScrollRef.current) formScrollRef.current.scrollTo({ top: 0, behavior: 'auto' }); }, [activeStep]);

    const handleJumpToError = (id: string, step: number) => {
        setAlertModalOpen(false);
        setActiveStep(step);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlightedField(id);
                setTimeout(() => setHighlightedField(null), 2000);
            }
        }, 150);
    };

    const handleExport = async (fmt: 'jpg' | 'pdf') => {
        const errors = validateForm(data, type); 
        if (errors.length > 0) { setValidationErrors(errors); setAlertModalOpen(true); return; }
        setExporting(true);
        if (typeof window !== 'undefined') { if (window.innerWidth < 1024) setMobileTab('preview'); window.scrollTo(0, 0); }
        await new Promise(resolve => setTimeout(resolve, 800));
        try {
            const options = { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200, scrollY: 0, logging: false, ignoreElements: (el: Element) => el.classList.contains('no-print') };
            if (!page1Ref.current) throw new Error("Preview elements not found");
            const canvas1 = await html2canvas(page1Ref.current, options);
            const filenameBase = `現況調查表_${data.caseName || '未命名'}`;
            if (fmt === 'jpg') {
                const dataUrl = canvas1.toDataURL('image/jpeg', 0.9);
                if (isMobile) { setGeneratedImage(dataUrl); setShowImageModal(true); setToastMsg("✅ 圖片已產生，請長按圖片儲存"); } 
                else { const link1 = document.createElement('a'); link1.download = `正面_${filenameBase}.jpg`; link1.href = dataUrl; document.body.appendChild(link1); link1.click(); document.body.removeChild(link1); if (type !== 'parking' && page2Ref.current) { const canvas2 = await html2canvas(page2Ref.current, options); const link2 = document.createElement('a'); link2.download = `背面_${filenameBase}.jpg`; link2.href = canvas2.toDataURL('image/jpeg', 0.9); document.body.appendChild(link2); setTimeout(() => { link2.click(); document.body.removeChild(link2); }, 500); } setToastMsg("✅ 圖片下載中..."); }
            } else {
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
                const addScaledImage = (canvas: HTMLCanvasElement) => { const imgData = canvas.toDataURL('image/jpeg', 0.9); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = pdf.internal.pageSize.getHeight(); pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST'); };
                addScaledImage(canvas1);
                if (type !== 'parking' && page2Ref.current) { const canvas2 = await html2canvas(page2Ref.current, options); pdf.addPage(); addScaledImage(canvas2); }
                const pdfBlob = pdf.output('blob'); const filename = `${filenameBase}.pdf`;
                if (isMobile) { const file = new File([pdfBlob], filename, { type: 'application/pdf' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: '幸福家現況調查表', text: `案名：${data.caseName}` }); setToastMsg("✅ 已喚起分享選單"); } catch (shareErr) { if ((shareErr as Error).name !== 'AbortError') { pdf.save(filename); setToastMsg("✅ PDF 已開始下載"); } } } else { pdf.save(filename); setToastMsg("✅ PDF 已開始下載"); } } else { pdf.save(filename); setToastMsg("✅ PDF 已下載至電腦"); }
            }
            // Trigger success modal after export completes
            setShowExportSuccessModal(true);
        } catch (e) { console.error("Export Error:", e); alert("匯出失敗，可能原因：案名包含特殊字元或裝置記憶體不足。請嘗試縮短案名再試。"); } finally { setExporting(false); }
    };

    const stepsToShow = (type === 'land') ? 4 : (type === 'parking' ? 3 : 4);
    const stepLabels = useMemo(() => { const labels = ["基本資料"]; if (type === 'land') { labels.push("使用現況", "權利/地上物", "環境/其他"); } else if (type === 'parking') { labels.push("車位資訊", "環境與其他"); } else { labels.push("內部情況", "公設/車位", "外觀/環境"); } return labels; }, [type]);

    const stepProps = {
        data,
        setData,
        update,
        toggleArr,
        type,
        highlightedField,
        themeText,
        themeBorder,
        parkingLogic
    };

    return (
        <div className="flex flex-col lg:flex-row h-full bg-[#fdfbf7] overflow-hidden text-base">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
            <DraftFoundModal isOpen={draftFoundModalOpen} onLoad={loadDraft} onClear={clearDraft} onClose={() => setDraftFoundModalOpen(false)} />
            <AlertModal isOpen={alertModalOpen} errors={validationErrors} onClose={() => setAlertModalOpen(false)} onJumpTo={handleJumpToError} />
            <ImagePreviewModal isOpen={showImageModal} imageUrl={generatedImage} onClose={() => setShowImageModal(false)} />
            <ExportSuccessModal isOpen={showExportSuccessModal} onConfirm={() => { performReset(); setShowExportSuccessModal(false); }} onCancel={() => setShowExportSuccessModal(false)} />

            <div className={`w-full lg:w-[600px] bg-[#fdfbf7] shadow-2xl flex flex-col no-print z-40 border-r-4 border-slate-200 transition-transform duration-300 absolute inset-0 lg:relative ${mobileTab === 'edit' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className={`p-5 ${themeBg} flex flex-col gap-4 shadow-md shrink-0 relative overflow-hidden`}>
                    {/* Header: Action Buttons */}
                    <div className="flex justify-between items-center relative z-10">
                        <button onClick={onBack} className="bg-white text-slate-800 border-b-4 border-slate-300 px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-150 active:border-b-0 active:translate-y-1 flex items-center gap-2 shadow-lg">
                            <ArrowLeft className="w-6 h-6" strokeWidth={3} />
                            <span className="font-black text-xl">回首頁</span>
                        </button>
                        <span className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-sm font-black tracking-wide shadow-sm border border-white/10">{data?.version}</span>
                    </div>
                    {/* Updated Layout: Harmonious Colors based on Type - Buttons changed to Teal/Rose as requested */}
                    <div className="flex justify-between gap-8 w-full relative z-10">
                        <button onClick={() => setDraftFoundModalOpen(true)} className={`flex-1 bg-[#ecfdf5] text-[#115e59] border-[#99f6e4] border-b-4 py-4 rounded-2xl transition-all duration-150 flex justify-center items-center gap-3 font-black text-xl active:border-b-0 active:translate-y-[4px] shadow-lg hover:bg-[#ccfbf1]`}>
                            <FileInput className="w-7 h-7" strokeWidth={3} /> 讀檔
                        </button>
                        <button onClick={saveDraft} className={`flex-1 bg-[#fff1f2] text-[#9f1239] border-[#fecdd3] border-b-4 py-4 rounded-2xl transition-all duration-150 flex justify-center items-center gap-3 font-black text-xl active:border-b-0 active:translate-y-[4px] shadow-lg hover:bg-[#ffe4e6]`}>
                            <Save className="w-6 h-6" strokeWidth={3} /> 存檔
                        </button>
                    </div>
                </div>

                <div ref={formScrollRef} className="flex-grow overflow-y-auto p-6 space-y-12 pb-40 lg:pb-24 bg-[#fdfbf7] relative">
                    <ErrorBoundary>
                        {activeStep === 1 && <Step1 {...stepProps} />}
                        {activeStep === 2 && <Step2 {...stepProps} />}
                        {activeStep === 3 && <Step3 {...stepProps} />}
                        {activeStep === 4 && type !== 'parking' && <Step4 {...stepProps} />}
                    </ErrorBoundary>

                    {/* Bottom Footer Action Area */}
                    <div className="no-print bg-white border-t-4 border-slate-200 p-6 pb-40 lg:pb-10 flex flex-col items-center justify-center shrink-0 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                        {/* Step Navigation - Moved to Top of Footer */}
                        <div className="w-full max-w-5xl grid gap-4 mb-10" style={{ gridTemplateColumns: `repeat(${stepsToShow}, minmax(0, 1fr))` }}>
                            {stepLabels.slice(0, stepsToShow).map((label, idx) => {
                                const stepNum = idx + 1;
                                const isActive = activeStep === stepNum;
                                
                                return (
                                    <button 
                                        key={stepNum} 
                                        type="button" 
                                        onClick={() => setActiveStep(stepNum)} 
                                        className={`relative flex flex-col items-center justify-center py-5 px-2 rounded-2xl transition-all duration-200 border-b-[6px] active:border-b-2 active:translate-y-[4px]
                                        ${isActive 
                                            ? 'bg-slate-800 text-white border-slate-950 shadow-inner translate-y-[2px] border-b-4' // Active State: Pressed In Dark
                                            : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 shadow-md' // Inactive State: Pop Out Light
                                        }`}
                                    >
                                        <span className={`text-sm font-black mb-1 tracking-widest uppercase ${isActive ? 'opacity-100 text-sky-300' : 'opacity-60'}`}>STEP {stepNum}</span>
                                        <span className={`text-lg md:text-xl font-black whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Clear Button - Moved to Bottom of Footer */}
                        <button onClick={clearDraft} className="w-full py-6 bg-rose-50 border-4 border-rose-200 text-rose-600 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 hover:bg-rose-100 hover:text-rose-700 transition-all duration-200 shadow-sm active:scale-[0.98]">
                            <Trash2 className="w-8 h-8" />
                            <span>清空所有填寫內容 (重填)</span>
                        </button>
                    </div>
                </div>
            </div>

            <div ref={previewWrapperRef} className={`flex-grow bg-slate-200 p-4 lg:p-10 overflow-y-auto flex flex-col items-center absolute lg:relative inset-0 z-30 transition-transform duration-300 ${mobileTab === 'preview' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} pb-32 lg:pb-10`}>
                <SurveyPreview data={data} type={type} exporting={exporting} previewScale={previewScale} previewPage={previewPage} setPreviewPage={setPreviewPage} page1Ref={page1Ref} page2Ref={page2Ref} isMobile={isMobile} />

                {/* Fixed the button container style to prevent overlapping */}
                <div className="shrink-0 w-full flex flex-col gap-4 justify-center mt-10 mb-32 lg:mb-0 lg:flex-row text-left relative z-20">
                    <button onClick={() => handleExport('jpg')} className="w-full lg:w-auto px-10 py-5 bg-sky-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all duration-150 border-b-[6px] border-sky-800 active:border-b-2 active:translate-y-[4px] active:scale-95 shadow-xl"><ImageIcon className="w-8 h-8" /> 匯出 JPG 圖片</button>
                    <button onClick={() => handleExport('pdf')} className="w-full lg:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all duration-150 border-b-[6px] border-red-800 active:border-b-2 active:translate-y-[4px] active:scale-95 shadow-xl"><FileText className="w-8 h-8" /> 匯出 PDF 文件</button>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 flex justify-around items-center pb-safe pt-2 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                <button onClick={() => setMobileTab('edit')} className={`flex flex-col items-center justify-center w-full py-4 transition-colors duration-200 ${mobileTab === 'edit' ? 'text-slate-900 bg-slate-50' : 'text-slate-400'}`}>
                    <Edit3 className={`w-8 h-8 mb-1 ${mobileTab === 'edit' ? 'fill-slate-900' : ''}`} strokeWidth={mobileTab === 'edit' ? 2.5 : 2} />
                    <span className="text-lg font-black">填寫資料</span>
                </button>
                <div className="w-[2px] h-12 bg-slate-100"></div>
                <button onClick={() => setMobileTab('preview')} className={`flex flex-col items-center justify-center w-full py-4 transition-colors duration-200 ${mobileTab === 'preview' ? 'text-slate-900 bg-slate-50' : 'text-slate-400'}`}>
                    <Eye className={`w-8 h-8 mb-1 ${mobileTab === 'preview' ? 'fill-slate-900' : ''}`} strokeWidth={mobileTab === 'preview' ? 2.5 : 2} />
                    <span className="text-lg font-black">預覽/匯出</span>
                </button>
            </div>

            {exporting && (
                <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center backdrop-blur-md text-left">
                    <div className="bg-white p-16 rounded-[3rem] flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-24 h-24 border-8 border-sky-600 border-t-transparent rounded-full animate-spin mb-8"></div>
                        <p className="text-4xl font-black text-slate-800 mb-4">檔案產生中...</p>
                        <p className="text-2xl text-slate-500 font-bold">請稍候，系統正在處理畫面</p>
                    </div>
                </div>
            )}
        </div>
    );
};
