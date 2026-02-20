
import React, { useState, useEffect, useRef, ReactNode, useMemo, useDeferredValue, useCallback } from 'react';
import { Save, FileInput, Image as ImageIcon, FileText, Edit3, Eye, ArrowLeft, Trash2, Download, X, Sun, Moon } from 'lucide-react';

import { SurveyData, SurveyType, MobileTab, ValidationError } from '../types';
import { INITIAL_STATE } from '../constants';

import { Toast, DraftFoundModal, AlertModal, ImagePreviewModal, ExportSuccessModal, ConfirmModal } from './SharedUI';
import { SurveyPreview } from './SurveyPreview';
import { validateForm } from '../utils/validators';
import { exportToJPG, exportToPDF } from '../utils/exporter';
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
                <div className="flex items-center justify-center h-full bg-red-50 p-10 flex-col text-center dark:bg-red-900/20">
                    <h1 className="text-4xl font-black text-red-600 mb-6 dark:text-red-400">⚠️ 畫面暫時中斷</h1>
                    <button onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} className="bg-red-600 text-white px-10 py-6 rounded-2xl font-black text-2xl border-b-[6px] border-red-800 active:border-b-2 active:translate-y-[4px] transition-all duration-150 dark:bg-red-700 dark:border-red-900">重新整理頁面</button>
                </div>
            );
        }
        return (this as any).props.children;
    }
}

interface SurveyFormProps {
    type: SurveyType;
    onBack: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

// Helper to check for real changes, ignoring date
const isDataDirty = (current: SurveyData, initial: SurveyData): boolean => {
    try {
        const c = { ...current };
        const i = { ...initial };
        // Ignore date differences
        delete (c as any).fillDate;
        delete (i as any).fillDate;
        return JSON.stringify(c) !== JSON.stringify(i);
    } catch (e) {
        return false;
    }
};

export const SurveyForm: React.FC<SurveyFormProps> = ({ type, onBack, isDarkMode, toggleTheme }) => {
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
    const [showHomeConfirm, setShowHomeConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const DRAFT_KEY = `survey_draft_${type}`;
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const page3Ref = useRef<HTMLDivElement>(null); // Added Page 3 Ref
    const formScrollRef = useRef<HTMLDivElement>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef(data);

    // Use deferred value for preview to prevent typing lag
    const deferredData = useDeferredValue(data);

    // Synchronize colors with LandingPage - Added Dark Mode variants
    const themeBg = useMemo(() => type === 'parking' ? 'bg-rose-600 dark:bg-rose-900' : (type === 'land' ? 'bg-emerald-600 dark:bg-emerald-900' : (type === 'factory' ? 'bg-orange-600 dark:bg-orange-900' : 'bg-sky-600 dark:bg-sky-900')), [type]);
    // Theme borders for cards are handled in FormSteps via props
    const themeBorder = useMemo(() => type === 'parking' ? 'border-rose-200 dark:border-rose-800' : (type === 'land' ? 'border-emerald-200 dark:border-emerald-800' : (type === 'factory' ? 'border-orange-200 dark:border-orange-800' : 'border-sky-200 dark:border-sky-800')), [type]);
    // Text colors
    const themeText = useMemo(() => type === 'parking' ? 'text-rose-700 dark:text-rose-300' : (type === 'land' ? 'text-emerald-700 dark:text-emerald-300' : (type === 'factory' ? 'text-orange-700 dark:text-orange-300' : 'text-sky-700 dark:text-sky-300')), [type]);

    useEffect(() => { dataRef.current = data; }, [data]);

    const parkingLogic = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;
        
        // Defines types that don't need weight
        const isPlaneType = pts.includes("坡道平面") || pts.includes("一樓平面") || pts.includes("法定空地／自家門前");
        
        // Only disable size/height for Legal Vacant Land (Front of House), 
        // User requested Ramp Plane and 1F Plane to SHOW dimensions and height.
        const isVacantLand = pts.includes("法定空地／自家門前");

        // NEW: Check if 'Unable to measure' is selected to disable weight
        const isUnableToMeasure = data.q10_measureType === '無法測量也無相關資訊';

        return { 
            isNoParking, 
            isOtherPt, 
            disableMethod: isNoParking, 
            disableNumber: isNoParking || isOtherPt, 
            disableCarStatus: isNoParking || isOtherPt, 
            disableCarSize: isNoParking || isOtherPt || isVacantLand, 
            // Update: Disable weight if plane type OR unable to measure
            disableWeight: isNoParking || isOtherPt || isPlaneType || isUnableToMeasure, 
            disableHeight: isNoParking || isOtherPt || isVacantLand, 
            disableCharging: isNoParking, 
            disableAbnormal: isNoParking, 
            disableSupplement: isNoParking, 
            disableMoto: false 
        };
    }, [data.q10_noParking, data.q10_parkTypes, data.q10_hasParkTypeOther, data.q10_measureType]);

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
            // Updated Phase 2: Clear dimensions if disabled by logic
            if (parkingLogic.disableCarSize) {
                if (shouldUpdate('q10_dimL', '')) updates.q10_dimL = ''; 
                if (shouldUpdate('q10_dimW', '')) updates.q10_dimW = ''; 
                if (shouldUpdate('q10_dimH', '')) updates.q10_dimH = '';
            }
            if (parkingLogic.disableWeight && shouldUpdate('q10_mechWeight', '')) updates.q10_mechWeight = '';
            if (parkingLogic.disableHeight && shouldUpdate('q10_entryHeight', '')) updates.q10_entryHeight = '';
        }
        if (Object.keys(updates).length > 0) setData(prev => ({ ...prev, ...updates }));
    }, [parkingLogic.isNoParking, parkingLogic.isOtherPt, parkingLogic.disableWeight, parkingLogic.disableHeight, parkingLogic.disableCarSize]);

    useEffect(() => {
        const checkMobile = () => { if (typeof window !== 'undefined') setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 1024); };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const performSave = (silent: boolean = false) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(dataRef.current)); if (!silent) setToastMsg("✅ 文字已儲存成功！"); } catch (e) { if (!silent) setToastMsg("儲存失敗：瀏覽器限制存取"); } };
    const saveDraft = () => performSave(false);
    useEffect(() => { const timer = setInterval(() => { if (isDataDirty(dataRef.current, INITIAL_STATE)) performSave(true); }, 5000); return () => clearTimeout(timer); }, []);
    const loadDraft = () => { try { const saved = localStorage.getItem(DRAFT_KEY); if (saved) { setData(JSON.parse(saved)); setToastMsg("已讀取暫存檔"); } setDraftFoundModalOpen(false); } catch (e) { } };
    
    const performReset = () => {
        try {
            localStorage.removeItem(DRAFT_KEY);
            setData(JSON.parse(JSON.stringify(INITIAL_STATE)));
            setActiveStep(1);
            setToastMsg("暫存檔已清空，畫面已重置");
        } catch (e) { }
    };

    const clearDraft = () => { 
        setShowClearConfirm(true);
    };
    
    useEffect(() => { 
        try { 
            const saved = localStorage.getItem(DRAFT_KEY); 
            if (saved) {
                const savedObj = JSON.parse(saved);
                if (isDataDirty(savedObj, INITIAL_STATE)) {
                    setDraftFoundModalOpen(true); 
                }
            }
        } catch (e) { } 
    }, [DRAFT_KEY]);

    useEffect(() => {
        let inactivityTimer: ReturnType<typeof setTimeout>;
        const resetInactivityTimer = () => { clearTimeout(inactivityTimer); inactivityTimer = setTimeout(() => { if (isDataDirty(dataRef.current, INITIAL_STATE)) performSave(true); }, 5 * 60 * 1000); };
        let lastActivity = 0;
        const handleActivity = () => { const now = Date.now(); if (now - lastActivity > 1000) { resetInactivityTimer(); lastActivity = now; } };
        const handleBeforeUnload = (e: BeforeUnloadEvent) => { 
            if (isDataDirty(dataRef.current, INITIAL_STATE)) { 
                e.preventDefault(); e.returnValue = '確定尚未存檔就離開分頁嗎？'; return '確定尚未存檔就離開分頁嗎？'; 
            } 
        };
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

    const update = useCallback((key: keyof SurveyData, val: any) => setData(p => ({ ...p, [key]: val })), []);
    const toggleArr = useCallback((key: keyof SurveyData, val: string) => setData(p => { const arr = Array.isArray(p[key]) ? p[key] as string[] : []; return { ...p, [key]: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] }; }), []);

    useEffect(() => { 
        const scrollToTop = () => {
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' }); 
            if (formScrollRef.current) formScrollRef.current.scrollTo({ top: 0, behavior: 'auto' }); 
        };
        scrollToTop();
        const t = setTimeout(scrollToTop, 100); 
        return () => clearTimeout(t);
    }, [activeStep]);

    const handleJumpToError = (id: string, step: number) => {
        setAlertModalOpen(false);
        setMobileTab('edit'); // Ensure we switch to edit mode on mobile
        setActiveStep(step);
        // Increase timeout to 350ms to allow mobile transition (300ms) to finish
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlightedField(id);
                setTimeout(() => setHighlightedField(null), 2000);
            }
        }, 350);
    };

    const handleBackHome = () => {
        if (isDataDirty(data, INITIAL_STATE)) {
            setShowHomeConfirm(true);
        } else {
            onBack();
        }
    };

    // Refactored handleExport to use the utility
    const handleExport = async (fmt: 'jpg' | 'pdf') => {
        const errors = validateForm(data, type); 
        if (errors.length > 0) { setValidationErrors(errors); setAlertModalOpen(true); return; }
        
        setExporting(true);
        if (typeof window !== 'undefined') { if (window.innerWidth < 1024) setMobileTab('preview'); window.scrollTo(0, 0); }
        await new Promise(resolve => setTimeout(resolve, 800)); // Wait for render

        if (!page1Ref.current) {
            console.error("Preview elements not found");
            setExporting(false);
            return;
        }

        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const fileName = `現況調查表_${data.caseName || '未命名'}_${dateStr}`;
        const exportOpts = {
            fileName,
            page1Ref: page1Ref.current,
            page2Ref: (type !== 'parking' && page2Ref.current) ? page2Ref.current : null,
            page3Ref: (type === 'factory' && page3Ref.current) ? page3Ref.current : null, // Added Page 3 Support
            isMobile,
            onSuccess: (msg: string) => setToastMsg(msg),
            onError: (e: any) => { console.error("Export Error:", e); alert("匯出失敗，請重試或縮短案名。"); }
        };

        if (fmt === 'jpg') {
            const resultUrl = await exportToJPG(exportOpts);
            if (resultUrl) {
                setGeneratedImage(resultUrl);
                setShowImageModal(true);
            }
        } else {
            await exportToPDF(exportOpts);
        }
        
        setExporting(false);
        if (!isMobile || fmt !== 'jpg') setShowExportSuccessModal(true);
    };

    const stepsToShow = (type === 'land') ? 4 : (type === 'parking' ? 3 : 4);
    const stepLabels = useMemo(() => { 
        const labels = ["基本資料"]; 
        if (type === 'land') { 
            labels.push("使用現況-1", "使用現況-2", "環境／其他"); 
        } else if (type === 'parking') { 
            labels.push("車位資訊", "環境與其他"); 
        } else if (type === 'factory') {
            labels.push("內部現況", "設備現況", "外觀／環境");
        } else { 
            labels.push("內部現況", "公設／車位", "外觀／環境"); 
        } 
        return labels; 
    }, [type]);

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
        <div className="flex flex-col lg:flex-row h-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-base transition-colors duration-300">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
            
            <ConfirmModal 
                isOpen={showHomeConfirm}
                title="確定要返回首頁嗎？"
                message="您尚未儲存資料，未儲存的內容將會遺失。"
                onConfirm={() => { setShowHomeConfirm(false); onBack(); }}
                onCancel={() => setShowHomeConfirm(false)}
                type="danger"
                confirmText="確定返回 (不儲存)"
                cancelText="留在頁面"
            />

            <ConfirmModal 
                isOpen={showClearConfirm}
                title="確定要清空所有內容嗎？"
                message="此動作無法復原，所有已填寫的內容將被移除。"
                onConfirm={() => { setShowClearConfirm(false); setDraftFoundModalOpen(false); performReset(); }}
                onCancel={() => setShowClearConfirm(false)}
                type="danger"
                confirmText="確定清空 (重填)"
                cancelText="取消"
            />

            <DraftFoundModal isOpen={draftFoundModalOpen} onLoad={loadDraft} onClear={() => { setDraftFoundModalOpen(false); clearDraft(); }} onClose={() => setDraftFoundModalOpen(false)} />
            <AlertModal isOpen={alertModalOpen} errors={validationErrors} onClose={() => setAlertModalOpen(false)} onJumpTo={handleJumpToError} />
            <ImagePreviewModal isOpen={showImageModal} imageUrl={generatedImage} onClose={() => setShowImageModal(false)} />
            <ExportSuccessModal isOpen={showExportSuccessModal} onConfirm={() => { performReset(); setShowExportSuccessModal(false); }} onCancel={() => setShowExportSuccessModal(false)} />

            <div className={`w-full lg:w-[600px] bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col no-print z-40 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 absolute inset-0 lg:relative ${mobileTab === 'edit' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className={`p-5 ${themeBg} flex flex-col gap-4 shadow-md shrink-0 relative overflow-hidden transition-colors duration-300`}>
                    <div className="flex justify-between items-center relative z-10">
                        <button type="button" onClick={handleBackHome} className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-150 active:scale-95 flex items-center gap-2 shadow-sm">
                            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                            <span className="font-bold text-lg">回首頁</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wider shadow-sm border border-white/10">{data?.version}</span>
                            <button onClick={toggleTheme} className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 active:scale-95 hover:bg-white/20 transition-colors" aria-label="Toggle Theme">
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between gap-4 w-full relative z-10">
                        <button onClick={() => setDraftFoundModalOpen(true)} className={`flex-1 bg-white/90 text-emerald-700 border-b-4 border-emerald-600/20 py-3 rounded-xl transition-all duration-150 flex justify-center items-center gap-2 font-bold text-lg active:border-b-0 active:translate-y-[2px] shadow-lg hover:bg-white dark:bg-slate-800 dark:text-emerald-400`}>
                            <FileInput className="w-5 h-5" strokeWidth={2.5} /> 讀檔
                        </button>
                        <button onClick={saveDraft} className={`flex-1 bg-white/90 text-rose-700 border-b-4 border-rose-600/20 py-3 rounded-xl transition-all duration-150 flex justify-center items-center gap-2 font-bold text-lg active:border-b-0 active:translate-y-[2px] shadow-lg hover:bg-white dark:bg-slate-800 dark:text-rose-400`}>
                            <Save className="w-5 h-5" strokeWidth={2.5} /> 存檔
                        </button>
                    </div>
                </div>

                <div ref={formScrollRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 pb-40 lg:pb-24 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
                    <ErrorBoundary>
                        {activeStep === 1 && <Step1 {...stepProps} />}
                        {activeStep === 2 && <Step2 {...stepProps} />}
                        {activeStep === 3 && <Step3 {...stepProps} />}
                        {activeStep === 4 && type !== 'parking' && <Step4 {...stepProps} />}
                    </ErrorBoundary>

                    <div className="no-print bg-white border-t-4 border-slate-200 p-6 pb-40 lg:pb-10 flex flex-col items-center justify-center shrink-0 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:bg-slate-900 dark:border-slate-800">
                        <div className="w-full max-w-5xl grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${stepsToShow}, minmax(0, 1fr))` }}>
                            {stepLabels.slice(0, stepsToShow).map((label, idx) => {
                                const stepNum = idx + 1;
                                const isActive = activeStep === stepNum;
                                return (
                                    <button key={stepNum} type="button" onClick={() => setActiveStep(stepNum)} className={`relative flex flex-col items-center justify-center py-5 px-2 rounded-2xl transition-all duration-200 border-b-[6px] active:border-b-2 active:translate-y-[4px] ${isActive ? 'bg-slate-800 text-white border-slate-950 shadow-inner translate-y-[2px] border-b-4 dark:bg-slate-700 dark:border-slate-900' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 shadow-md dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}>
                                        <span className={`text-sm font-black mb-1 tracking-widest uppercase ${isActive ? 'opacity-100 text-sky-300' : 'opacity-60'}`}>STEP {stepNum}</span>
                                        <span className={`text-lg md:text-xl font-black whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={clearDraft} className="w-full py-6 bg-rose-50 border-4 border-rose-200 text-rose-600 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 hover:bg-rose-100 hover:text-rose-700 transition-all duration-200 shadow-sm active:scale-[0.98] dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
                            <Trash2 className="w-8 h-8" />
                            <span>清空所有填寫內容 (重填)</span>
                        </button>
                    </div>
                </div>
            </div>

            <div ref={previewWrapperRef} className={`flex-grow bg-slate-200 p-4 lg:p-10 overflow-y-auto flex flex-col items-center absolute lg:relative inset-0 z-30 transition-transform duration-300 ${mobileTab === 'preview' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} pb-32 lg:pb-10 dark:bg-slate-900`}>
                <SurveyPreview data={deferredData} type={type} exporting={exporting} previewScale={previewScale} previewPage={previewPage} setPreviewPage={setPreviewPage} page1Ref={page1Ref} page2Ref={page2Ref} page3Ref={page3Ref} isMobile={isMobile} />

                <div className="hidden lg:flex shrink-0 w-full gap-4 justify-center mt-10 lg:flex-row text-left relative z-20">
                    <button onClick={() => handleExport('jpg')} className="w-full lg:w-auto px-10 py-5 bg-sky-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all duration-150 border-b-[6px] border-sky-800 active:border-b-2 active:translate-y-[4px] active:scale-95 shadow-xl dark:bg-sky-700 dark:border-sky-900"><ImageIcon className="w-8 h-8" /> 匯出 JPG 圖片</button>
                    <button onClick={() => handleExport('pdf')} className="w-full lg:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all duration-150 border-b-[6px] border-red-800 active:border-b-2 active:translate-y-[4px] active:scale-95 shadow-xl dark:bg-red-700 dark:border-red-900"><FileText className="w-8 h-8" /> 匯出 PDF 文件</button>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 flex justify-around items-center pb-safe pt-2 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:bg-slate-900 dark:border-slate-800">
                <button onClick={() => setMobileTab('edit')} className={`flex flex-col items-center justify-center w-full py-4 transition-colors duration-200 ${mobileTab === 'edit' ? 'text-slate-900 bg-slate-50 dark:text-white dark:bg-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                    <Edit3 className={`w-8 h-8 mb-1 ${mobileTab === 'edit' ? 'fill-slate-900 dark:fill-white' : ''}`} strokeWidth={mobileTab === 'edit' ? 2.5 : 2} />
                    <span className="text-lg font-black">填寫資料</span>
                </button>
                <div className="w-[2px] h-12 bg-slate-100 dark:bg-slate-800"></div>
                <button onClick={() => setMobileTab('preview')} className={`flex flex-col items-center justify-center w-full py-4 transition-colors duration-200 ${mobileTab === 'preview' ? 'text-slate-900 bg-slate-50 dark:text-white dark:bg-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                    <Eye className={`w-8 h-8 mb-1 ${mobileTab === 'preview' ? 'fill-slate-900 dark:fill-white' : ''}`} strokeWidth={mobileTab === 'preview' ? 2.5 : 2} />
                    <span className="text-lg font-black">預覽/匯出</span>
                </button>
            </div>

            {isMobile && mobileTab === 'preview' && !exporting && (
                <>
                    {mobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-[35] backdrop-blur-[1px]" onClick={() => setMobileMenuOpen(false)} />}
                    <div className="fixed bottom-24 right-5 z-[40] flex flex-col items-end gap-4">
                        <div className={`flex flex-col gap-3 transition-all duration-200 origin-bottom-right ${mobileMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10 pointer-events-none'}`}>
                            <button onClick={() => { setMobileMenuOpen(false); handleExport('jpg'); }} className="flex items-center gap-3 bg-white text-slate-800 px-5 py-3 rounded-full shadow-lg border-2 border-sky-100 active:scale-95 transition-transform dark:bg-slate-800 dark:text-white dark:border-slate-700">
                                <span className="font-bold whitespace-nowrap">匯出 JPG</span>
                                <div className="bg-sky-100 p-2 rounded-full dark:bg-sky-900"><ImageIcon className="w-5 h-5 text-sky-600 dark:text-sky-300" /></div>
                            </button>
                            <button onClick={() => { setMobileMenuOpen(false); handleExport('pdf'); }} className="flex items-center gap-3 bg-white text-slate-800 px-5 py-3 rounded-full shadow-lg border-2 border-red-100 active:scale-95 transition-transform dark:bg-slate-800 dark:text-white dark:border-slate-700">
                                <span className="font-bold whitespace-nowrap">匯出 PDF</span>
                                <div className="bg-red-100 p-2 rounded-full dark:bg-red-900"><FileText className="w-5 h-5 text-red-600 dark:text-red-300" /></div>
                            </button>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-4 rounded-full shadow-2xl transition-all duration-200 border-4 border-white dark:border-slate-800 flex items-center justify-center active:scale-95 ${mobileMenuOpen ? 'bg-slate-800 text-white rotate-45 dark:bg-slate-600' : 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600'}`}>
                            {mobileMenuOpen ? <X className="w-8 h-8" strokeWidth={3} /> : <Download className="w-8 h-8" strokeWidth={3} />}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
