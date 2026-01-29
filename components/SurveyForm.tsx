import React, { useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Save, FileInput, Trash2, Image as ImageIcon, FileText, Edit3, Eye, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

import { SurveyData, SurveyType, MobileTab } from '../types';
import { INITIAL_STATE, EXT_LIST, LEAK_LOCATIONS, STRUCTURAL_ISSUES, UTILITY_ISSUES, ENV_CATEGORIES, FACILITY_OPTIONS, ACCESS_SUB_OPTIONS, ACCESS_SUB_OPTIONS_LAND, ACCESS_SUB_OPTIONS_PARKING, PARK_TYPES, CAR_USAGE_OPTS, Q11_OPTS } from '../constants';

import { CheckBox, RadioGroup, Toast, DraftFoundModal, AlertModal, ImagePreviewModal } from './SharedUI';
import { ROCDatePicker } from './ROCDatePicker';
import { SurveyPreview } from './SurveyPreview';

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    
    public state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(_: Error): ErrorBoundaryState { return { hasError: true }; }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full bg-red-50 p-10 flex-col text-center">
                    <h1 className="text-4xl font-black text-red-600 mb-6">⚠️ 畫面暫時中斷</h1>
                    <button onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} className="bg-red-600 text-white px-10 py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition">重新整理頁面</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const SubItemHighlight: React.FC<{ children: React.ReactNode, disabled?: boolean }> = ({ children, disabled = false }) => (
    <div className={`mt-4 mb-6 p-6 bg-sky-50 rounded-[1.5rem] border-l-8 border-sky-500 shadow-sm animate-in slide-in-from-top-2 fade-in duration-300 ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="pl-2">{children}</div>
    </div>
);

const DetailInput = ({ value, onChange, placeholder = "請說明情況", disabled = false }: { value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean }) => (
    <div className={`space-y-2 w-full ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <input 
            type="text" 
            className="full-width-input !mt-0" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
            autoComplete="off"
            disabled={disabled}
        />
    </div>
);

const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-red-50 p-6 rounded-[1.5rem] border-4 border-red-200 text-center shadow-md mb-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-3 text-red-600">
            <AlertTriangle className="w-10 h-10" />
            <p className="text-2xl font-black leading-relaxed">{children}</p>
        </div>
    </div>
);

interface SurveyFormProps {
    type: SurveyType;
    onBack: () => void;
}

const AccordionRadio = ({ options, value, onChange, renderDetail, disabled = false }: { options: string[]; value: string; onChange: (val: string) => void; renderDetail: (opt: string) => React.ReactNode, disabled?: boolean }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                {options.map(opt => (
                    <button 
                        key={opt}
                        type="button" 
                        disabled={disabled} 
                        onClick={() => onChange(opt)} 
                        className={`flex-1 min-w-[120px] py-5 px-6 rounded-2xl font-bold text-2xl text-center flex justify-center items-center transition-all select-none shadow-sm active:scale-[0.99] gap-4 
                        ${value === opt ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200' : 'bg-white border-2 border-slate-300 text-slate-600 hover:bg-emerald-50 hover:border-emerald-400'}
                        ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                    >
                        <span>{opt}</span>
                    </button>
                ))}
            </div>
            {value && renderDetail(value) && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200 w-full">
                    {renderDetail(value)}
                </div>
            )}
        </div>
    );
};

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
    const [alertMessage, setAlertMessage] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string>('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [hasParkingPage2, setHasParkingPage2] = useState(false);

    const DRAFT_KEY = `survey_draft_${type}`;
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const formScrollRef = useRef<HTMLDivElement>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef(data);

    const themeBg = type === 'parking' ? 'bg-rose-500' : (type === 'land' ? 'bg-emerald-600' : 'bg-sky-500');
    const themeBorder = type === 'parking' ? 'border-rose-200' : (type === 'land' ? 'border-emerald-200' : 'border-sky-200');
    const themeText = type === 'parking' ? 'text-rose-700' : (type === 'land' ? 'text-emerald-700' : 'text-sky-700');

    useEffect(() => { dataRef.current = data; }, [data]);

    const parkingLogic = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;

        return {
            isNoParking,
            isOtherPt,
            disableMethod: isNoParking,
            disableNumber: isNoParking || isOtherPt,
            disableCarStatus: isNoParking || isOtherPt,
            disableCarSize: isNoParking || isOtherPt,
            disableWeight: isNoParking || isOtherPt || pts.includes("坡道平面") || pts.includes("一樓平面"),
            disableHeight: isNoParking || isOtherPt || pts.includes("一樓平面"),
            disableCharging: isNoParking,
            disableAbnormal: isNoParking,
            disableSupplement: isNoParking,
            disableMoto: false
        };
    }, [data.q10_noParking, data.q10_parkTypes, data.q10_hasParkTypeOther]);

    // Use a reference to data to prevent infinite loops in the effect
    useEffect(() => {
        const updates: Partial<SurveyData> = {};
        const d = dataRef.current;

        // Comparison helper to avoid redundant state updates which cause loops
        const shouldUpdate = (key: keyof SurveyData, newValue: any) => {
            if (Array.isArray(newValue)) {
                return (d[key] as any[]).length > 0; // Assuming we only clear arrays to empty
            }
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
        
        if (Object.keys(updates).length > 0) {
            setData(prev => ({ ...prev, ...updates }));
        }
    }, [parkingLogic.isNoParking, parkingLogic.isOtherPt, parkingLogic.disableWeight, parkingLogic.disableHeight]);

    useEffect(() => {
        const checkMobile = () => { 
            if (typeof window !== 'undefined') {
                setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 1024);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const performSave = (silent: boolean = false) => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dataRef.current));
            if (!silent) setToastMsg("✅ 文字已儲存成功！");
        } catch (e) { if (!silent) setToastMsg("儲存失敗：瀏覽器限制存取"); }
    };
    const saveDraft = () => performSave(false);
    useEffect(() => { const timer = setInterval(() => { if (JSON.stringify(dataRef.current) !== JSON.stringify(INITIAL_STATE)) performSave(true); }, 60000); return () => clearInterval(timer); }, []);
    const loadDraft = () => { try { const saved = localStorage.getItem(DRAFT_KEY); if (saved) { setData(JSON.parse(saved)); setToastMsg("已讀取暫存檔"); } setDraftFoundModalOpen(false); } catch (e) { } };
    const clearDraft = () => { if (typeof window !== 'undefined' && window.confirm("確定要清空嗎？此動作會移除所有已填寫內容。")) { try { localStorage.removeItem(DRAFT_KEY); setData(JSON.parse(JSON.stringify(INITIAL_STATE))); setActiveStep(1); setToastMsg("暫存檔已清空，畫面已重置"); } catch (e) { } setDraftFoundModalOpen(false); } };
    useEffect(() => { try { const saved = localStorage.getItem(DRAFT_KEY); if (saved && saved !== JSON.stringify(INITIAL_STATE)) setDraftFoundModalOpen(true); } catch (e) { } }, [DRAFT_KEY]);

    // NEW: 5-minute Inactivity Auto-save & Unsaved Changes Guard
    useEffect(() => {
        let inactivityTimer: ReturnType<typeof setTimeout>;

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                const currentData = JSON.stringify(dataRef.current);
                // Only save if data is not empty
                if (currentData !== JSON.stringify(INITIAL_STATE)) {
                    performSave(true);
                    console.log('Inactivity auto-save triggered');
                }
            }, 5 * 60 * 1000); // 5 minutes
        };

        let lastActivity = 0;
        const handleActivity = () => {
            const now = Date.now();
            // Throttle reset to once per second
            if (now - lastActivity > 1000) {
                resetInactivityTimer();
                lastActivity = now;
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const currentStr = JSON.stringify(dataRef.current);
            const savedStr = localStorage.getItem(DRAFT_KEY);
            const initialStr = JSON.stringify(INITIAL_STATE);

            // Trigger warning if:
            // 1. Current data is not empty
            // 2. Current data differs from what is saved in localStorage (i.e. unsaved changes)
            if (currentStr !== initialStr && currentStr !== (savedStr || initialStr)) {
                e.preventDefault();
                e.returnValue = '確定尚未存檔就離開分頁嗎？';
                return '確定尚未存檔就離開分頁嗎？';
            }
        };

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, handleActivity));
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Initial start of the timer
        resetInactivityTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearTimeout(inactivityTimer);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (exporting || typeof window === 'undefined') return;
            const A4_WIDTH = 794; let newScale = 1;
            if (window.innerWidth >= 1024) { if (previewWrapperRef.current) { const containerWidth = previewWrapperRef.current.clientWidth; const availableWidth = containerWidth - 100; newScale = Math.min(1, availableWidth / A4_WIDTH); } }
            else { if (mobileTab === 'preview') { const availableWidth = window.innerWidth - 32; newScale = Math.min(1, availableWidth / A4_WIDTH); } }
            setPreviewScale(newScale > 0.1 ? newScale : 0.1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileTab, exporting]);

    const update = (key: keyof SurveyData, val: any) => setData(p => ({ ...p, [key]: val }));
    const toggleArr = (key: keyof SurveyData, val: string) => setData(p => { const arr = Array.isArray(p[key]) ? p[key] as string[] : []; return { ...p, [key]: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] }; });

    useEffect(() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' }); if (formScrollRef.current) formScrollRef.current.scrollTo({ top: 0, behavior: 'auto' }); }, [activeStep]);

    const validateForm = () => {
        const errors: string[] = []; const d = data;
        const checkEmpty = (val: string | undefined | null) => !val || !val.trim();

        if (checkEmpty(d?.caseName)) errors.push("基本資料：物件案名");
        if (checkEmpty(d?.authNumber)) errors.push("基本資料：委託書編號");
        if (checkEmpty(d?.storeName)) errors.push("基本資料：所屬店名");
        if (checkEmpty(d?.agentName)) errors.push("基本資料：調查業務");
        if (checkEmpty(d?.address)) errors.push(type === 'land' ? "基本資料：坐落位置" : (type === 'parking' ? "基本資料：標的位置" : "基本資料：標的地址"));
        if (!d?.access) errors.push("基本資料：本物件現況 (可進入/不可進入)");
        if (d?.access === '不可進入') {
            if (!d?.accessType || d.accessType.length === 0) errors.push("基本資料：請勾選不可進入原因");
            if (d.accessType?.includes('其他') && checkEmpty(d.accessOther)) errors.push("基本資料：請填寫不可進入之「其他」詳細內容");
        }

        if (type === 'house') {
            if (!d?.q1_hasExt) errors.push("1. 是否有增建情況？"); 
            else if (d.q1_hasExt === '是') {
                if ((d.q1_items?.length || 0) === 0 && !d.q1_hasOther) errors.push("1. 增建情況：請至少勾選一項增建項目");
                if (d.q1_hasOther && checkEmpty(d.q1_other)) errors.push("1. 增建情況：請填寫「其他」說明內容");
            }
            if (!d?.q2_hasOccupancy) errors.push("2. 建物占用調查未填寫"); 
            else if (d.q2_hasOccupancy !== '否' && checkEmpty(d.q2_desc)) errors.push("2. 建物占用：請填寫說明內容");

            if (!d?.q3_hasLeak) errors.push("3. 滲漏水調查未填寫"); 
            else if (d.q3_hasLeak === '是') {
                if ((d.q3_locations?.length || 0) === 0 && !d.q3_hasOther && !d.q3_suspected && !d.q3_ceilingWrapped) errors.push("3. 滲漏水：請至少勾選一項位置或說明情況");
                if (d.q3_hasOther && checkEmpty(d.q3_other)) errors.push("3. 滲漏水：請填寫「其他」位置說明");
                if (d.q3_suspected && checkEmpty(d.q3_suspectedDesc)) errors.push("3. 滲漏水：請填寫「疑似」說明內容");
            }

            if (!d?.q4_hasIssue) errors.push("4. 結構安全調查未填寫"); 
            else if (d.q4_hasIssue === '是') {
                if ((d.q4_items?.length || 0) === 0 && !d.q4_hasOther && !d.q4_suspected && !d.q4_ceilingWrapped) errors.push("4. 結構安全：請至少勾選一項項目或說明情況");
                if (d.q4_hasOther && checkEmpty(d.q4_otherDesc)) errors.push("4. 結構安全：請填寫「其他」說明內容");
                if (d.q4_suspected && checkEmpty(d.q4_suspectedDesc)) errors.push("4. 結構安全：請填寫「疑似」說明內容");
            }

            if (!d?.q5_hasTilt) errors.push("5. 傾斜情況調查未填寫"); 
            else if (d.q5_hasTilt === '是' && checkEmpty(d.q5_desc)) errors.push("5. 傾斜情況：請填寫說明內容");
            else if (d.q5_hasTilt === '疑似' && checkEmpty(d.q5_suspectedDesc)) errors.push("5. 傾斜情況：請填寫疑似原因說明");

            if (!d?.q6_hasIssue) errors.push("6. 面積與圖面相符調查未填寫"); 
            else if ((d.q6_hasIssue === '是' || d.q6_hasIssue === '其他/無法測量') && checkEmpty(d.q6_desc)) errors.push("6. 面積調查：請填寫詳細說明內容");

            if (!d?.q7_hasIssue) errors.push("7. 水電瓦斯調查未填寫"); 
            else if (d.q7_hasIssue === '是') {
                if ((d.q7_items?.length || 0) === 0 && !d.q7_hasOther) errors.push("7. 水電瓦斯：請勾選異常項目");
                if (d.q7_hasOther && checkEmpty(d.q7_otherDesc)) errors.push("7. 水電瓦斯：請填寫「其他」說明內容");
            }

            if (!d?.publicFacilities) errors.push("公共設施情況未填寫"); 
            else if (d.publicFacilities === '無法進入' && checkEmpty(d.publicFacilitiesReason)) errors.push("公共設施：請填寫「無法進入」之原因");

            if (!d?.q8_stairIssue) errors.push("8. 公共區域瑕疵調查未填寫"); 
            else if (d.q8_stairIssue === '是' && checkEmpty(d.q8_stairDesc)) errors.push("8. 公共區域：請填寫瑕疵說明內容");

            if (!d?.q9_hasIssue) errors.push("9. 須注意設施調查未填寫");
            else if (d.q9_hasIssue === '是') {
                if ((d.q9_items?.length || 0) === 0 && !d.q9_hasOther) errors.push("9. 須注意設施：請勾選設施項目");
                if (d.q9_hasOther && checkEmpty(d.q9_otherDesc)) errors.push("9. 須注意設施：請填寫「其他」說明內容");
            }

            if (d.q10_noParking) {
                if ((d.q10_motoUsage?.length || 0) === 0 && !d.q10_hasMotoUsageOther) errors.push("10. 機車車位：請至少勾選一項使用情況");
                if (d.q10_hasMotoUsageOther && checkEmpty(d.q10_motoUsageOther)) errors.push("10. 機車使用：請填寫「其他」說明內容");
            } else {
                if ((d.q10_parkTypes?.length || 0) === 0 && !d.q10_hasParkTypeOther) errors.push("10. 停車方式未填寫");
                if (d.q10_hasParkTypeOther && checkEmpty(d.q10_parkTypeOther)) errors.push("10. 停車方式：請填寫「其他」說明內容");
                if (d.q10_parkTypes?.includes("坡道機械") && !d.q10_rampMechLoc) errors.push("10. 停車方式：請選擇「坡道機械」之層位");
                if (d.q10_parkTypes?.includes("升降機械") && !d.q10_liftMechLoc) errors.push("10. 停車方式：請選擇「升降機械」之層位");
                
                if (!parkingLogic.disableNumber) {
                    if (!d.q10_parkingNumberType) errors.push("10. 車位編號未填寫");
                    else if (d.q10_parkingNumberType === 'number' && checkEmpty(d.q10_parkingNumberVal)) errors.push("10. 車位編號：請填寫編號內容");
                }

                if (!parkingLogic.disableCarStatus) {
                    if ((d.q10_carUsage?.length || 0) === 0 && !d.q10_hasCarUsageOther) errors.push("10. 汽車使用情況未填寫");
                    if (d.q10_carUsage?.includes("須固定抽籤") && !d.q10_carLotteryMonth) errors.push("10. 汽車使用：請填寫抽籤月數");
                    if (d.q10_hasCarUsageOther && checkEmpty(d.q10_carUsageOther)) errors.push("10. 汽車使用：請填寫「其他」說明內容");
                }

                if ((d.q10_motoUsage?.length || 0) === 0 && !d.q10_hasMotoUsageOther) errors.push("10. 機車使用情況未填寫");
                if (d.q10_hasMotoUsageOther && checkEmpty(d.q10_motoUsageOther)) errors.push("10. 機車使用：請填寫「其他」說明內容");

                if (!parkingLogic.disableCharging) {
                    if (!d.q10_charging) errors.push("10. 充電樁調查未填寫");
                    else if (d.q10_charging === '其他' && checkEmpty(d.q10_chargingOther)) errors.push("10. 充電樁：請填寫「其他」說明內容");
                }

                if (!parkingLogic.disableAbnormal) {
                    if (!d.q11_hasIssue) errors.push("11. 車位異常調查未填寫");
                    else if (d.q11_hasIssue === '是') {
                        if ((d.q11_items?.length || 0) === 0 && !d.q11_hasOther) errors.push("11. 車位異常：請勾選異常原因");
                        if (d.q11_hasOther && checkEmpty(d.q11_other)) errors.push("11. 車位異常：請填寫「其他」說明內容");
                    }
                }

                if (!parkingLogic.disableSupplement) {
                    if (!d.q12_hasNote) {
                        errors.push("12. 車位現況補充調查未填寫");
                    } else if (d.q12_hasNote === '是' && checkEmpty(d.q12_note)) {
                        errors.push("12. 車位現況補充：請填寫說明內容");
                    }
                }
            }

            if (!d?.isNotFirstFloor) { 
                if (!d?.q13_occupancy) errors.push("13. 空地佔用調查未填寫"); 
                else if (d.q13_occupancy === '是' && checkEmpty(d.q13_desc)) errors.push("13. 空地佔用：請填寫說明內容");

                if (!d?.q14_access) errors.push("14. 進出經他人土地調查未填寫"); 
                else if (d.q14_access === '是' && (checkEmpty(d.q14_section) || checkEmpty(d.q14_number))) errors.push("14. 進出經他人土地：請填寫完整的地號資訊 (段、地號)");

                if (!d?.q15_occupy) errors.push("15. 增建佔用他人土地調查未填寫"); 
                else if (d.q15_occupy === '是' && (checkEmpty(d.q15_section) || checkEmpty(d.q15_number))) errors.push("15. 增建佔用：請填寫完整的地號資訊 (段、地號)");
            }

            if (!d?.q16_noFacilities && (d?.q16_items?.length || 0) === 0 && !d?.q16_hasOther) errors.push("16. 重要環境設施未填寫"); 
            if (d?.q16_hasOther && checkEmpty(d.q16_other)) errors.push("16. 重要環境設施：請填寫「其他」設施說明");

            if (!d?.q17_issue) errors.push("17. 注意事項調查未填寫");
            else if (d.q17_issue === '是' && checkEmpty(d.q17_desc)) errors.push("17. 注意事項：請填寫詳細說明內容");
        }

        if (type === 'land') {
            if (!d?.land_q1_elec) errors.push("1. 電力供應調查未填寫"); 
            else if (d.land_q1_elec === '是' && !d.land_q1_elec_detail) errors.push("1. 電力供應：請選擇電力類型");
            else if (d.land_q1_elec === '其他' && checkEmpty(d.land_q1_elec_other)) errors.push("1. 電力供應：請填寫「其他」說明內容");

            if (!d?.land_q1_water) errors.push("1. 水源供應調查未填寫"); 
            else if (d.land_q1_water === '是') {
                if (!d.land_q1_water_cat) errors.push("1. 水源供應：請選擇水源細節");
                else {
                    if (d.land_q1_water_cat === '自來水' && !d.land_q1_water_tap_detail) errors.push("1. 水源供應：請選擇自來水細節");
                    if (d.land_q1_water_cat === '地下水' && !d.land_q1_water_ground_detail) errors.push("1. 水源供應：請選擇地下水細節");
                    if (d.land_q1_water_cat === '水利溝渠' && !d.land_q1_water_irr_detail) errors.push("1. 水源供應：請選擇水利溝渠歸屬");
                }
            } else if (d.land_q1_water === '其他' && checkEmpty(d.land_q1_water_other)) errors.push("1. 水源供應：請填寫「其他」說明內容");

            if (!d?.land_q1_other_new) errors.push("1. 其他設施調查未填寫"); 
            else if (d.land_q1_other_new === '是' && checkEmpty(d.land_q1_other_desc)) errors.push("1. 其他設施：請填寫說明內容");

            if (!d?.land_q2_access) errors.push("2. 通行異常調查未填寫"); 
            else if (d.land_q2_access === '是，有阻礙' && checkEmpty(d.land_q2_access_desc)) errors.push("2. 通行異常：請填寫阻礙原因說明");
            if (d.land_q2_access !== '袋地' && d.land_q2_access !== '') {
                if (!d.land_q2_owner) errors.push("2. 臨路歸屬權未填寫");
                else if (d.land_q2_owner === '私人' && checkEmpty(d.land_q2_owner_desc)) errors.push("2. 臨路歸屬：請填寫權屬詳細內容");
                if (!d.land_q2_material) errors.push("2. 路面材質未填寫");
                else if (d.land_q2_material === '其他' && checkEmpty(d.land_q2_material_other)) errors.push("2. 路面材質：請填寫「其他」說明");
            }

            if (!d?.land_q2_ditch) errors.push("2. 排水溝調查未填寫"); 
            else if (d.land_q2_ditch === '其他' && checkEmpty(d.land_q2_ditch_other)) errors.push("2. 排水溝：請填寫說明內容");

            if (!d?.land_q3_survey) errors.push("3. 土地鑑界調查未填寫"); 
            else if (d.land_q3_survey === '是' && !d.land_q3_survey_detail) errors.push("3. 土地鑑界：請選擇鑑界結果");
            else if (d.land_q3_survey === '其他' && checkEmpty(d.land_q3_survey_other)) errors.push("3. 土地鑑界：請填寫說明內容");

            if (!d?.land_q3_dispute) errors.push("3. 糾紛調查未填寫"); 
            else if (d.land_q3_dispute === '是' && checkEmpty(d.land_q3_dispute_desc)) errors.push("3. 糾紛調查：請填寫糾紛說明內容");
            else if (d.land_q3_dispute === '其他' && checkEmpty(d.land_q3_dispute_other)) errors.push("3. 糾紛調查：請填寫「其他」說明內容");

            if (!d?.land_q4_expro) errors.push("4. 徵收地預定地調查未填寫"); 
            else if ((d.land_q4_expro === '是' || d.land_q4_expro === '其他') && checkEmpty(d.land_q4_expro_other)) errors.push("4. 徵收地預定地：請填寫詳細說明");

            if (!d?.land_q4_resurvey) errors.push("4. 重測區域調查未填寫"); 
            else if ((d.land_q4_resurvey === '是' || d.land_q4_resurvey === '其他') && checkEmpty(d.land_q4_resurvey_other)) errors.push("4. 重測區域：請填寫詳細說明");

            if (!d?.land_q5_encroached) errors.push("5. 被越界佔用調查未填寫"); 
            else if (d.land_q5_encroached !== '否' && checkEmpty(d.land_q5_encroached_desc)) errors.push("5. 被越界佔用：請填寫說明內容");

            if (!d?.land_q5_encroaching) errors.push("5. 佔用鄰地調查未填寫"); 
            else if (d.land_q5_encroaching !== '否' && checkEmpty(d.land_q5_encroaching_desc)) errors.push("5. 佔用鄰地：請填寫說明內容");

            if (!d?.land_q6_limit) errors.push("6. 禁建限建調查未填寫"); 
            else if (d.land_q6_limit !== '否' && checkEmpty(d.land_q6_limit_desc)) errors.push("6. 禁建限建：請填寫說明內容");

            if (!d?.land_q7_user) errors.push("7. 現況使用人調查未填寫"); 
            else if (d.land_q7_user === '非所有權人使用') {
                if (!d.land_q7_user_detail) errors.push("7. 使用人：請選擇使用詳情項目");
                else if (d.land_q7_user_detail !== '共有分管' && checkEmpty(d.land_q7_user_desc)) errors.push("7. 使用人：請填寫詳細說明內容");
            }

            if (!d?.land_q7_crops) errors.push("7. 地上定著物-農作物調查未填寫"); 
            else if (d.land_q7_crops === '有農作物/植栽') {
                if (!d.land_q7_crops_month) errors.push("7. 農作物：請填寫收成月份");
                if (!d.land_q7_crops_type) errors.push("7. 農作物：請選擇作物細節類型");
                else {
                    if ((d.land_q7_crops_type === '經濟作物' || d.land_q7_crops_type === '景觀植栽') && !d.land_q7_crops_detail) errors.push("7. 農作物：請選擇處理方式項目");
                    if (d.land_q7_crops_type === '其他' && checkEmpty(d.land_q7_crops_other)) errors.push("7. 農作物：請填寫「其他」詳細內容");
                }
            }

            if (!d?.land_q7_build) errors.push("7. 地上定著物-建物調查未填寫");
            else if (d.land_q7_build === '有建築物/工作物') {
                if (!d.land_q7_build_type) errors.push("7. 建物詳情：請選擇建物類型項目");
                else {
                    if ((d.land_q7_build_type === '有保存登記' || d.land_q7_build_type === '未保存登記') && !d.land_q7_build_ownership) errors.push("7. 建物詳情：請選擇現況權屬");
                    if (d.land_q7_build_type === '宗教/殯葬設施' && !d.land_q7_build_rel_detail) errors.push("7. 建物詳情：請選擇設施類型");
                    if (d.land_q7_build_type === '其他' && checkEmpty(d.land_q7_build_other)) errors.push("7. 建物詳情：請填寫「其他」說明內容");
                }
            }

            if (!d?.q16_noFacilities && (d?.q16_items?.length || 0) === 0 && !d?.q16_hasOther) errors.push("8. 重要環境設施未填寫"); 
            if (d?.q16_hasOther && checkEmpty(d.q16_other)) errors.push("8. 重要環境設施：請填寫「其他」設施說明");

            if (!d?.land_q8_special) errors.push("9. 注意事項調查未填寫");
            else if (d.land_q8_special === '是' && checkEmpty(d.land_q8_special_desc)) errors.push("9. 注意事項：請填寫詳細說明內容");
        }

        if (type === 'parking') {
            if (!d?.q10_noParking) {
                if ((d.q10_parkTypes?.length || 0) === 0 && !d.q10_hasParkTypeOther) errors.push("1. 停車方式未填寫");
                if (d.q10_hasParkTypeOther && checkEmpty(d.q10_parkTypeOther)) errors.push("1. 停車方式：請填寫「其他」說明內容");
            }
            if ((d.q10_motoUsage?.length || 0) === 0 && !d.q10_hasMotoUsageOther) errors.push("1. 機車使用情況未填寫");
            if (d.q10_hasMotoUsageOther && checkEmpty(d.q10_motoUsageOther)) errors.push("1. 機車使用：請填寫「其他」說明內容");

            if (!parkingLogic.disableAbnormal) {
                if (!d.q11_hasIssue) errors.push("2. 車位異常調查未填寫");
                else if (d.q11_hasIssue === '是') {
                    if ((d.q11_items?.length || 0) === 0 && !d.q11_hasOther) errors.push("2. 車位異常：請勾選異常原因");
                    if (d.q11_hasOther && checkEmpty(d.q11_other)) errors.push("2. 車位異常：請填寫「其他」說明內容");
                }
            }

            if (!parkingLogic.disableSupplement) {
                if (!d.q12_hasNote) {
                    errors.push("3. 車位現況補充調查未填寫");
                } else if (d.q12_hasNote === '是' && checkEmpty(d.q12_note)) {
                    errors.push("3. 車位現況補充：請填寫說明內容");
                }
            }

            if (!d?.q16_noFacilities && (d?.q16_items?.length || 0) === 0 && !d?.q16_hasOther) errors.push("4. 重要環境設施未填寫");
            if (d?.q16_hasOther && checkEmpty(d.q16_other)) errors.push("4. 重要環境設施：請填寫「其他」設施說明");

            if (!d?.q17_issue) errors.push("5. 注意事項調查未填寫");
            else if (d.q17_issue === '是' && checkEmpty(d.q17_desc)) errors.push("5. 注意事項：請填寫詳細說明內容");
        }

        return errors;
    };

    const handleExport = async (fmt: 'jpg' | 'pdf') => {
        const errors = validateForm(); if (errors.length > 0) { setAlertMessage(errors.join("\n")); setAlertModalOpen(true); return; }
        setExporting(true);
        
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 1024) setMobileTab('preview');
            window.scrollTo(0, 0);
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const options = { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff', 
                windowWidth: 1200, 
                scrollY: 0, 
                logging: false,
                ignoreElements: (el: Element) => el.classList.contains('no-print') 
            };

            if (!page1Ref.current) throw new Error("Preview elements not found");
            const canvas1 = await html2canvas(page1Ref.current, options);
            const filenameBase = `現況調查表_${data.caseName || '未命名'}`;

            if (fmt === 'jpg') {
                const dataUrl = canvas1.toDataURL('image/jpeg', 0.9);
                if (isMobile) { 
                    setGeneratedImage(dataUrl); 
                    setShowImageModal(true); 
                    setToastMsg("✅ 圖片已產生，請長按圖片儲存"); 
                } else {
                    const link1 = document.createElement('a');
                    link1.download = `正面_${filenameBase}.jpg`;
                    link1.href = dataUrl;
                    document.body.appendChild(link1);
                    link1.click();
                    document.body.removeChild(link1);

                    if ((type !== 'parking' || hasParkingPage2) && page2Ref.current) { 
                        const canvas2 = await html2canvas(page2Ref.current, options);
                        const link2 = document.createElement('a');
                        link2.download = `背面_${filenameBase}.jpg`;
                        link2.href = canvas2.toDataURL('image/jpeg', 0.9);
                        document.body.appendChild(link2);
                        setTimeout(() => {
                            link2.click();
                            document.body.removeChild(link2);
                        }, 500);
                    }
                    setToastMsg("✅ 圖片下載中...");
                }
            } else {
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });

                const addScaledImage = (canvas: HTMLCanvasElement) => { 
                    const imgData = canvas.toDataURL('image/jpeg', 0.9);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                };

                addScaledImage(canvas1);
                if ((type !== 'parking' || hasParkingPage2) && page2Ref.current) { 
                    const canvas2 = await html2canvas(page2Ref.current, options); 
                    pdf.addPage(); 
                    addScaledImage(canvas2); 
                }

                const pdfBlob = pdf.output('blob');
                const filename = `${filenameBase}.pdf`;

                if (isMobile) {
                    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: '幸福家現況調查表',
                                text: `案名：${data.caseName}`
                            });
                            setToastMsg("✅ 已喚起分享選單");
                        } catch (shareErr) {
                            if ((shareErr as Error).name !== 'AbortError') {
                                pdf.save(filename);
                                setToastMsg("✅ PDF 已開始下載");
                            }
                        }
                    } else {
                         pdf.save(filename);
                         setToastMsg("✅ PDF 已開始下載");
                    }
                } else {
                    // Computer: Direct download
                    pdf.save(filename);
                    setToastMsg("✅ PDF 已下載至電腦");
                }
            }
        } catch (e) { 
            console.error("Export Error:", e);
            alert("匯出失敗，可能原因：案名包含特殊字元或裝置記憶體不足。請嘗試縮短案名再試。"); 
        } finally { 
            setExporting(false); 
        }
    };

    const stepsToShow = (type === 'land') ? 4 : (type === 'parking' ? 3 : 4);

    return (
        <div className="flex flex-col lg:flex-row h-full bg-[#fdfbf7] overflow-hidden text-base">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
            <DraftFoundModal isOpen={draftFoundModalOpen} onLoad={loadDraft} onClear={clearDraft} onClose={() => setDraftFoundModalOpen(false)} />
            <AlertModal isOpen={alertModalOpen} message={alertMessage} onClose={() => setAlertModalOpen(false)} />
            <ImagePreviewModal isOpen={showImageModal} imageUrl={generatedImage} onClose={() => setShowImageModal(false)} />

            <div className={`w-full lg:w-[600px] bg-white shadow-2xl flex flex-col no-print z-40 border-r border-sky-100 transition-transform duration-300 absolute inset-0 lg:relative ${mobileTab === 'edit' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className={`p-5 ${themeBg} text-white flex flex-col gap-4 shadow-md shrink-0`}>
                    <div className="flex justify-between items-center">
                        <button onClick={onBack} className="bg-white text-slate-800 border-2 border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition active:scale-95 flex items-center gap-2 shadow-lg"><ArrowLeft className="w-5 h-5" /><span className="font-black text-lg">回首頁</span></button>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold tracking-wide shadow-sm">{data?.version}</span>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button onClick={saveDraft} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition flex justify-center items-center gap-2 font-bold text-lg border-2 border-white/80 active:scale-95 shadow-md"><Save className="w-5 h-5" /> 存檔</button>
                        <button onClick={() => setDraftFoundModalOpen(true)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl transition flex justify-center items-center gap-2 font-bold text-lg border-2 border-white/80 active:scale-95 shadow-md"><FileInput className="w-6 h-6" /> 讀檔</button>
                        <button onClick={clearDraft} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition flex justify-center items-center gap-2 font-bold text-lg border-2 border-white/80 active:scale-95 shadow-md"><Trash2 className="w-5 h-5" /> 清空</button>
                    </div>
                </div>

                <div ref={formScrollRef} className="flex-grow overflow-y-auto p-6 space-y-10 pb-40 lg:pb-24 bg-[#fdfbf7] relative">
                    <ErrorBoundary>
                        {activeStep === 1 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-emerald-400' : 'border-sky-400')} pl-6 text-left`}>第一步：基本資料</h3>
                                <div className={`space-y-8 warm-card p-8 rounded-[2rem] shadow-sm ${themeBorder}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-slate-800 font-black mb-3 text-2xl text-left">物件案名</label><input type="text" className="full-width-input" value={data?.caseName || ''} onChange={e => update('caseName', e.target.value)} placeholder="輸入案名" autoComplete="off" /></div>
                                        <div><label className="block text-slate-800 font-black mb-3 text-2xl text-left">委託書編號</label><input type="text" className="full-width-input" value={data?.authNumber || ''} onChange={e => update('authNumber', e.target.value)} placeholder="輸入編號" autoComplete="off" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-slate-800 font-black mb-3 text-2xl text-left">所屬店名</label><input type="text" className="full-width-input" value={data?.storeName || ''} onChange={e => update('storeName', e.target.value)} placeholder="輸入店名" autoComplete="off" /></div>
                                        <div><label className="block text-slate-800 font-black mb-3 text-2xl text-left">調查業務</label><input type="text" className="full-width-input" value={data?.agentName || ''} onChange={e => update('agentName', e.target.value)} placeholder="輸入姓名" autoComplete="off" /></div>
                                    </div>
                                    <div><label className="block text-slate-800 font-black mb-3 text-2xl text-left">填寫日期</label><div className="mt-1"><ROCDatePicker value={data?.fillDate || ''} onChange={(d) => update('fillDate', d)} /></div></div>
                                    <div><label className="block text-slate-800 font-black mb-3 text-2xl text-left">{type === 'land' ? '坐落位置' : (type === 'parking' ? '標的位置' : '標的地址')}</label><input type="text" className="full-width-input" value={data?.address || ''} onChange={e => update('address', e.target.value)} placeholder={type === 'land' ? "輸入坐落位置或相關位置" : "輸入地址/位置"} autoComplete="off" /></div>
                                </div>
                                <div className={`warm-card p-8 rounded-[2rem] shadow-sm ${themeBorder}`}>
                                    <div className="flex flex-col gap-6">
                                        <span className="text-3xl font-black text-slate-800 text-left">本物件現況</span>
                                        <RadioGroup options={['可進入', '不可進入']} value={data?.access || ''} onChange={(v) => update('access', v)} />
                                    </div>
                                    {data?.access === '不可進入' && (
                                        <SubItemHighlight>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 place-items-stretch">
                                                {(type === 'land' ? ACCESS_SUB_OPTIONS_LAND : (type === 'parking' ? ACCESS_SUB_OPTIONS_PARKING : ACCESS_SUB_OPTIONS)).map(opt => (
                                                    <CheckBox key={opt} checked={data?.accessType?.includes(opt) || false} label={opt} onClick={() => toggleArr('accessType', opt)} />
                                                ))}
                                            </div>
                                            {data?.accessType?.includes('其他') && (
                                                <div className="space-y-2 w-full">
                                                    <input 
                                                        type="text" 
                                                        className="full-width-input !mt-0" 
                                                        value={data?.accessOther || ''} 
                                                        onChange={v => update('accessOther', v.target.value)} 
                                                        placeholder="請說明不可進入原因" 
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            )}
                                            {type !== 'parking' && <div className="warning-box text-xl p-4 bg-white shadow-md border-l-8 border-red-500 rounded-r-xl w-full text-center mt-6 leading-relaxed font-bold">{type === 'land' ? '若為上述情況，建議待找可進行調查時間點時再進行完整調查' : '若為上述情況，建議待整屋搬空/清空後再進行完整調查'}</div>}
                                        </SubItemHighlight>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-emerald-400' : 'border-sky-400')} pl-6 text-left`}>
                                    {type === 'land' ? '第二步 使用現況' : (type === 'parking' ? '第二步：車位資訊與現況' : '第二步：內部情況')}
                                </h3>
                                {type === 'house' && <WarningBox>※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，再判斷是否須調閱土地使用分區</WarningBox>}
                                {type === 'land' && <WarningBox>※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，並判斷是否須調閱土地使用分區</WarningBox>}
                                
                                {type === 'parking' && (
                                    <div className="space-y-10">
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8">
                                            <div className="flex justify-between items-center border-b-2 pb-6"><p className="text-3xl font-black text-slate-800 text-left">1. 車位資訊</p></div>
                                            <div className="space-y-10">
                                                <div className={`${parkingLogic.disableMethod ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                    <p className="text-2xl font-black text-slate-700 mb-4 text-left">停車方式：</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {PARK_TYPES.map(pt => (
                                                            <div key={pt} className={`bg-white p-5 rounded-2xl border-2 border-slate-100`}>
                                                                <CheckBox checked={data?.q10_parkTypes?.includes(pt) || false} label={pt} onClick={() => toggleArr('q10_parkTypes', pt)} disabled={parkingLogic.disableMethod} />
                                                                {(pt === "坡道機械" || pt === "升降機械") && data?.q10_parkTypes?.includes(pt) && (
                                                                    <div className="flex flex-wrap gap-3 mt-5 ml-1">
                                                                        {['上層', '中層', '下層'].map(loc => (
                                                                            <button key={loc} type="button" onClick={() => update(pt === "坡道機械" ? 'q10_rampMechLoc' : 'q10_liftMechLoc', loc)} className={`flex items-center justify-center px-6 py-3 rounded-xl border-2 font-black text-xl shadow-sm active:scale-[0.99] transition ${(pt === "坡道機械" ? data.q10_rampMechLoc : data.q10_liftMechLoc) === loc ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-slate-300 text-slate-600'}`}>{loc}</button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className={`bg-white p-5 rounded-2xl border-2 border-slate-100 col-span-2 mt-4`}>
                                                        <CheckBox checked={data?.q10_hasParkTypeOther || false} label="其他" onClick={() => update('q10_hasParkTypeOther', !data.q10_hasParkTypeOther)} disabled={parkingLogic.disableMethod} />
                                                        {data?.q10_hasParkTypeOther && (
                                                            <SubItemHighlight disabled={parkingLogic.disableMethod}>
                                                                <DetailInput value={data.q10_parkTypeOther || ''} onChange={v => update('q10_parkTypeOther', v)} />
                                                            </SubItemHighlight>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`transition-all duration-300 ${parkingLogic.disableNumber ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                    <p className="text-2xl font-black text-slate-700 mb-4 text-left">車位編號：</p>
                                                    <RadioGroup options={['編號', '無車位編號']} value={data?.q10_parkingNumberType === 'number' ? '編號' : (data?.q10_parkingNumberType === 'none' ? '無車位編號' : '')} onChange={(v) => { if (v === '編號') update('q10_parkingNumberType', 'number'); else { update('q10_parkingNumberType', 'none'); update('q10_parkingNumberVal', ''); } }} disabled={parkingLogic.disableNumber} />
                                                    {data?.q10_parkingNumberType === 'number' && (
                                                        <SubItemHighlight disabled={parkingLogic.disableNumber}>
                                                            <DetailInput value={data.q10_parkingNumberVal || ''} onChange={v => update('q10_parkingNumberVal', v)} />
                                                        </SubItemHighlight>
                                                    )}
                                                </div>
                                                <div className={`transition-all duration-300 ${parkingLogic.disableCarStatus ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                    <p className="text-2xl font-black text-slate-700 mb-4 text-left">汽車車位使用情況：</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {CAR_USAGE_OPTS.map(u => <div key={u} className="bg-white p-5 rounded-2xl border-2 border-slate-100"><CheckBox checked={data?.q10_carUsage?.includes(u) || false} label={u} onClick={() => toggleArr('q10_carUsage', u)} disabled={parkingLogic.disableCarStatus} /></div>)}
                                                        <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 col-span-1 md:col-span-2"><CheckBox checked={data?.q10_carUsage?.includes("須固定抽籤") || false} label="須固定抽籤" onClick={() => toggleArr('q10_carUsage', "須固定抽籤")} disabled={parkingLogic.disableCarStatus} />{data?.q10_carUsage?.includes("須固定抽籤") && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><div className="ml-0 md:ml-4 flex items-center justify-center gap-3 mt-4 font-black text-2xl text-slate-700">每 <input type="number" disabled={parkingLogic.disableCarStatus} className="w-24 border-2 rounded-xl p-3 text-center bg-white" value={data.q10_carLotteryMonth || ''} onChange={e => update('q10_carLotteryMonth', e.target.value)} /> 月抽籤一次</div></SubItemHighlight>)}</div>
                                                        <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 col-span-1 md:col-span-2 text-center"><CheckBox checked={data?.q10_hasCarUsageOther || false} label="其他" onClick={() => update('q10_hasCarUsageOther', !data.q10_hasCarUsageOther)} disabled={parkingLogic.disableCarStatus} />{data?.q10_hasCarUsageOther && (
                                                            <SubItemHighlight disabled={parkingLogic.disableCarStatus}>
                                                                <DetailInput value={data.q10_carUsageOther || ''} onChange={v => update('q10_carUsageOther', v)} />
                                                            </SubItemHighlight>
                                                        )}</div>
                                                    </div>
                                                </div>
                                                <div className={`bg-blue-50 p-8 rounded-[2rem] space-y-6 border-2 border-blue-100 transition-all duration-300 ${parkingLogic.disableCarSize ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                    <p className="font-black text-2xl text-slate-800 text-left">汽車車位尺寸 (公尺)</p>
                                                    <div className="flex gap-4"><input type="text" disabled={parkingLogic.disableCarSize} placeholder="長" className="w-1/3 p-4 rounded-xl border-2 text-xl font-bold" value={data?.q10_dimL || ''} onChange={e => update('q10_dimL', e.target.value)} /><input type="text" disabled={parkingLogic.disableCarSize} placeholder="寬" className="w-1/3 p-4 rounded-xl border-2 text-xl font-bold" value={data?.q10_dimW || ''} onChange={e => update('q10_dimW', e.target.value)} /><input type="text" disabled={parkingLogic.disableCarSize} placeholder="高" className="w-1/3 p-4 rounded-xl border-2 text-xl font-bold" value={data?.q10_dimH || ''} onChange={e => update('q10_dimH', e.target.value)} /></div>
                                                    <p className="font-black text-2xl text-slate-800 mt-4 text-left">機械載重 (公斤)</p><input type="text" disabled={parkingLogic.disableWeight} className={`w-full p-4 rounded-xl border-2 text-xl font-bold text-center ${parkingLogic.disableWeight ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : ''}`} value={data?.q10_mechWeight || ''} onChange={e => update('q10_mechWeight', e.target.value)} placeholder={parkingLogic.disableWeight ? "無須填寫" : ""} />
                                                    <p className="font-black text-2xl text-slate-800 mt-4 text-left">車道出入口高度 (公尺)</p><input type="text" disabled={parkingLogic.disableHeight} className={`w-full p-4 rounded-xl border-2 text-xl font-bold text-center ${parkingLogic.disableHeight ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : ''}`} value={data?.q10_entryHeight || ''} onChange={e => update('q10_entryHeight', e.target.value)} placeholder={parkingLogic.disableHeight ? "無須填寫" : ""} />
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-2xl font-black text-slate-700 mb-4">機車車位使用情況：</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-100"><CheckBox checked={data?.q10_motoUsage?.includes("固定位置使用") || false} label="固定位置使用" onClick={() => toggleArr('q10_motoUsage', "固定位置使用")} /></div>
                                                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-100"><CheckBox checked={data?.q10_motoUsage?.includes("無") || false} label="無" onClick={() => toggleArr('q10_motoUsage', "無")} /></div>
                                                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 col-span-1 md:col-span-2 text-left"><CheckBox checked={data?.q10_hasMotoUsageOther || false} label="其他" onClick={() => update('q10_hasMotoUsageOther', !data.q10_hasMotoUsageOther)} />{data?.q10_hasMotoUsageOther && (
                                                        <SubItemHighlight>
                                                            <DetailInput value={data.q10_motoUsageOther || ''} onChange={v => update('q10_motoUsageOther', v)} />
                                                        </SubItemHighlight>
                                                    )}</div>
                                                </div>
                                            </div>
                                            <div className={`space-y-10 ${parkingLogic.disableCharging ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                <div className="border-t-2 pt-8 text-left"><p className="text-2xl font-black text-slate-700 mb-6">社區是否有充電樁？</p><RadioGroup options={['否', '是', '其他']} value={data?.q10_charging || ''} onChange={(v) => update('q10_charging', v)} cols={3} layout="grid" disabled={parkingLogic.disableCharging} />{data?.q10_charging === '其他' && (
                                                    <SubItemHighlight disabled={parkingLogic.disableCharging}>
                                                        <DetailInput value={data.q10_chargingOther || ''} onChange={v => update('q10_chargingOther', v)} />
                                                    </SubItemHighlight>
                                                )}</div>
                                            </div>
                                        </div>
                                        <div className={`warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left ${parkingLogic.disableAbnormal ? 'opacity-40 grayscale pointer-events-none' : ''}`}><p className="text-3xl font-black text-slate-800">2. 車位使用是否異常？</p><RadioGroup options={['否', '是']} value={data?.q11_hasIssue || ''} onChange={(v) => update('q11_hasIssue', v)} disabled={parkingLogic.disableAbnormal} />{data?.q11_hasIssue === '是' && (<SubItemHighlight><div className="space-y-6 pt-2"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Q11_OPTS.map(i => <CheckBox key={i} checked={data?.q11_items?.includes(i) || false} label={i} onClick={() => toggleArr('q11_items', i)} disabled={parkingLogic.disableAbnormal} />)}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100"><CheckBox checked={data?.q11_hasOther || false} label="其他" onClick={() => update('q11_hasOther', !data.q11_hasOther)} disabled={parkingLogic.disableAbnormal} />{data?.q11_hasOther && <DetailInput value={data.q11_other || ''} onChange={v => update('q11_other', v)} disabled={parkingLogic.disableAbnormal} />}</div></div></SubItemHighlight>)}</div>
                                        <div className={`warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left ${parkingLogic.disableSupplement ? 'opacity-40 grayscale pointer-events-none' : ''}`}><p className="text-3xl font-black text-slate-800">3. 車位現況補充</p><div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※如車格位置有其他孔蓋、排風機、電箱、租期租金或其他注意事項？</div><RadioGroup options={['否', '是']} value={data?.q12_hasNote || ''} onChange={(v) => update('q12_hasNote', v)} disabled={parkingLogic.disableSupplement} />{data?.q12_hasNote === '是' && (<SubItemHighlight disabled={parkingLogic.disableSupplement}>
                                            <DetailInput value={data.q12_note || ''} onChange={v => update('q12_note', v)} disabled={parkingLogic.disableSupplement} />
                                        </SubItemHighlight>)}</div>
                                    </div>
                                )}

                                {type === 'land' && (
                                    <div className="space-y-10">
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">1. 有電力、水力與其他設施？</p><div className="space-y-6"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">是否有電力供應？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q1_elec || ''} onChange={v => update('land_q1_elec', v)} renderDetail={(opt) => (<>{opt === '是' && <SubItemHighlight><div className="p-4 bg-white rounded-xl border-2"><RadioGroup options={['獨立電錶', '共有電錶']} value={data.land_q1_elec_detail || ''} onChange={v => update('land_q1_elec_detail', v)} /></div></SubItemHighlight>}{opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} /></SubItemHighlight>}</>)} /></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">是否有水源供應？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q1_water || ''} onChange={v => update('land_q1_water', v)} renderDetail={(opt) => (<>{opt === '是' && (<SubItemHighlight><div className="space-y-4"><RadioGroup options={['自來水', '地下水', '水利溝渠', '湖水/池塘']} value={data.land_q1_water_cat || ''} onChange={v => update('land_q1_water_cat', v)} layout="grid" cols={2} />{data.land_q1_water_cat === '自來水' && <div className="p-4 bg-white rounded-xl border-2 animate-in fade-in"><RadioGroup options={['獨立水錶', '共有水錶', '無水錶，但管線已臨路', '無水錶，且管線距離遙遠']} value={data.land_q1_water_tap_detail || ''} onChange={v => update('land_q1_water_tap_detail', v)} layout="grid" cols={1} /></div>}{data.land_q1_water_cat === '地下水' && <div className="p-4 bg-white rounded-xl border-2 animate-in fade-in"><RadioGroup options={['自然湧出流動', '合法水井', '私設水井']} value={data.land_q1_water_ground_detail || ''} onChange={v => update('land_q1_water_ground_detail', v)} layout="grid" cols={1} /></div>}{data.land_q1_water_cat === '水利溝渠' && <div className="p-4 bg-white rounded-xl border-2 animate-in fade-in"><RadioGroup options={['公有', '私人']} value={data.land_q1_water_irr_detail || ''} onChange={v => update('land_q1_water_irr_detail', v)} /></div>}</div></SubItemHighlight>)}{opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q1_water_other || ''} onChange={v => update('land_q1_water_other', v)} /></SubItemHighlight>}</>)} /></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">是否有其他設施？</p><AccordionRadio options={['否', '是']} value={data?.land_q1_other_new || ''} onChange={v => update('land_q1_other_new', v)} renderDetail={(opt) => (opt === '是' && <SubItemHighlight><DetailInput value={data.land_q1_other_desc || ''} onChange={v => update('land_q1_other_desc', v)} placeholder="如瓦斯等" /></SubItemHighlight>)} /></div></div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">2. 土地進出通行與臨路的情況？</p><div className="space-y-6"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">土地進出通行是否有異常？</p><AccordionRadio options={['否，無異常', '是，有阻礙', '袋地']} value={data?.land_q2_access || ''} onChange={v => update('land_q2_access', v)} renderDetail={(opt) => (opt === '是，有阻礙' && <SubItemHighlight><DetailInput value={data.land_q2_access_desc || ''} onChange={v => update('land_q2_access_desc', v)} placeholder="如他人建物阻擋、地勢因素等" /></SubItemHighlight>)} /></div>{data?.land_q2_access !== '袋地' && data?.land_q2_access !== '' && (<div className="animate-in fade-in space-y-6 text-left"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100"><p className="text-2xl font-black mb-4">臨路的歸屬權？</p><AccordionRadio options={['公有', '私人']} value={data.land_q2_owner || ''} onChange={v => update('land_q2_owner', v)} renderDetail={(opt) => (opt === '私人' && <SubItemHighlight><DetailInput value={data.land_q2_owner_desc || ''} onChange={v => update('land_q2_owner_desc', v)} /></SubItemHighlight>)} /></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100"><p className="text-2xl font-black mb-4">臨路的路面材質？</p><AccordionRadio options={['柏油路', '水泥路', '泥巴路', '其他']} value={data.land_q2_material || ''} onChange={v => update('land_q2_material', v)} renderDetail={(opt) => (opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q2_material_other || ''} onChange={v => update('land_q2_material_other', v)} /></SubItemHighlight>)} /></div></div>)}<div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">周圍是否有排水溝？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q2_ditch || ''} onChange={v => update('land_q2_ditch', v)} renderDetail={(opt) => (opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q2_ditch_other || ''} onChange={v => update('land_q2_ditch_other', v)} placeholder="如預計未來有" /></SubItemHighlight>)} /></div></div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">3. 曾在兩年內進行土地鑑界/目前是否有糾紛？</p><div className="space-y-6"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">曾在兩年內進行土地鑑界？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q3_survey || ''} onChange={v => update('land_q3_survey', v)} renderDetail={(opt) => (<>{opt === '是' && <SubItemHighlight><div className="p-4 bg-white rounded-xl border-2"><RadioGroup options={['界址與現在相符', '界址與現在不符']} value={data.land_q3_survey_detail || ''} onChange={v => update('land_q3_survey_detail', v)} /></div></SubItemHighlight>}{opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q3_survey_other || ''} onChange={v => update('land_q3_survey_other', v)} /></SubItemHighlight>}</>)} /></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">目前是否有糾紛？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q3_dispute || ''} onChange={v => update('land_q3_dispute', v)} renderDetail={(opt) => (<>{opt === '是' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_desc || ''} onChange={v => update('land_q3_dispute_desc', v)} /></SubItemHighlight>}{opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_other || ''} onChange={v => update('land_q3_dispute_other', v)} /></SubItemHighlight>}</>)} /></div></div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">4. 徵收地預定地/重測區域範圍內？</p><div className="space-y-6"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">位於政府徵收地預定地？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q4_expro || ''} onChange={v => update('land_q4_expro', v)} renderDetail={(opt) => ((opt === '是' || opt === '其他') && <SubItemHighlight><DetailInput value={data.land_q4_expro_other || ''} onChange={v => update('land_q4_expro_other', v)} /></SubItemHighlight>)} /></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left"><p className="text-2xl font-black mb-4">位於重測區域範圍內？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q4_resurvey || ''} onChange={v => update('land_q4_resurvey', v)} renderDetail={(opt) => ((opt === '是' || opt === '其他') && <SubItemHighlight><DetailInput value={data.land_q4_resurvey_other || ''} onChange={v => update('land_q4_resurvey_other', v)} /></SubItemHighlight>)} /></div></div></div>
                                    </div>
                                )}

                                {type === 'house' && (
                                    <div className="space-y-10">
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">1. 是否有增建情況？</p><div className="warning-box text-xl w-full p-4 bg-red-50 rounded-xl">※如有增建請繪製格局圖時，標示增建情況及位置</div><RadioGroup options={['否', '是']} value={data?.q1_hasExt || ''} onChange={(v) => update('q1_hasExt', v)} />{data?.q1_hasExt === '是' && (<SubItemHighlight><div className="space-y-6 pt-2"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{EXT_LIST.map(i => (<div key={i} className="bg-white p-5 rounded-2xl border-2 border-slate-100"><CheckBox checked={data?.q1_items?.includes(i) || false} label={i} onClick={() => toggleArr('q1_items', i)} />{i === "地下室增建" && data?.q1_items?.includes("地下室增建") && (<div className="mt-4 text-left"><CheckBox checked={data?.q1_basementPartition || false} label="內含隔間" onClick={() => update('q1_basementPartition', !data.q1_basementPartition)} /></div>)}</div>))}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q1_hasOther || false} label="其他" onClick={() => update('q1_hasOther', !data.q1_hasOther)} />{data?.q1_hasOther && <DetailInput value={data.q1_other || ''} onChange={v => update('q1_other', v)} />}</div></div></SubItemHighlight>)}</div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 leading-snug text-left">2. 建物或增建部分是否有占用鄰地、道路用地或他人建物占用本案之土地？</p><RadioGroup options={['否', '是', '疑似']} value={data?.q2_hasOccupancy || ''} onChange={(v) => update('q2_hasOccupancy', v)} cols={3} layout="grid" />{data?.q2_hasOccupancy !== '' && data?.q2_hasOccupancy !== '否' && <SubItemHighlight><DetailInput value={data.q2_desc || ''} onChange={v => update('q2_desc', v)} /></SubItemHighlight>}</div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">3. 是否有滲漏水、壁癌等情況？</p><RadioGroup options={['否', '是']} value={data?.q3_hasLeak || ''} onChange={(v) => update('q3_hasLeak', v)} />{data?.q3_hasLeak === '是' && (<SubItemHighlight><div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{LEAK_LOCATIONS.map(i => <CheckBox key={i} checked={data?.q3_locations?.includes(i) || false} label={i} onClick={() => toggleArr('q3_locations', i)} />)}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 space-y-4 text-left"><CheckBox checked={data?.q3_hasOther || false} label="其他" onClick={() => update('q3_hasOther', !data.q3_hasOther)} />{data?.q3_hasOther && <DetailInput value={data.q3_other || ''} onChange={v => update('q3_other', v)} />}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 space-y-4 text-left"><CheckBox checked={data?.q3_suspected || false} label="疑似有滲漏水、壁癌，位置說明：" onClick={() => update('q3_suspected', !data.q3_suspected)} />{data?.q3_suspected && <DetailInput value={data.q3_suspectedDesc || ''} onChange={v => update('q3_suspectedDesc', v)} />}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q3_ceilingWrapped || false} label="全屋天花板包覆" onClick={() => update('q3_ceilingWrapped', !data.q3_ceilingWrapped)} /></div></div></SubItemHighlight>)}</div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">4. 結構牆面是否有結構安全之虞的瑕疵</p><div className="warning-box text-xl w-full p-4 bg-red-50 rounded-xl">※可從浴廁、廚房通風孔/維修孔、輕鋼架推開檢查</div><RadioGroup options={['否', '是']} value={data?.q4_hasIssue || ''} onChange={(v) => update('q4_hasIssue', v)} />{data?.q4_hasIssue === '是' && (<SubItemHighlight><div className="space-y-6 pt-2"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{STRUCTURAL_ISSUES.map(i => <CheckBox key={i} checked={data?.q4_items?.includes(i) || false} label={i} onClick={() => toggleArr('q4_items', i)} />)}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q4_hasOther || false} label="其他" onClick={() => update('q4_hasOther', !data.q4_hasOther)} />{data?.q4_hasOther && <DetailInput value={data.q4_otherDesc || ''} onChange={v => update('q4_otherDesc', v)} />}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q4_suspected || false} label="疑似須注意，位置說明：" onClick={() => update('q4_suspected', !data.q4_suspected)} />{data?.q4_suspected && <DetailInput value={data.q4_suspectedDesc || ''} onChange={v => update('q4_suspectedDesc', v)} />}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q4_ceilingWrapped || false} label="全屋天花板包覆，無法觀察" onClick={() => update('q4_ceilingWrapped', !data.q4_ceilingWrapped)} /></div></div></SubItemHighlight>)}</div><div className="grid grid-cols-1 gap-8"><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-6"><p className="text-3xl font-black text-slate-800 text-left">5. 是否有傾斜情況？</p><RadioGroup options={['否', '是', '疑似']} value={data?.q5_hasTilt || ''} onChange={(v) => update('q5_hasTilt', v)} cols={3} layout="grid" />{data?.q5_hasTilt === '是' && <SubItemHighlight><DetailInput value={data.q5_desc || ''} onChange={v => update('q5_desc', v)} /></SubItemHighlight>}{data?.q5_hasTilt === '疑似' && <SubItemHighlight><DetailInput value={data.q5_suspectedDesc || ''} onChange={v => update('q5_suspectedDesc', v)} /></SubItemHighlight>}</div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-6"><p className="text-3xl font-black text-slate-800 leading-snug text-left">6. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？</p><div className="warning-box text-xl w-full p-4 bg-red-50 rounded-xl">※可簡易測量最長/短/寬/窄之距離 (因牆面厚度，測量的長/寬，與建物成果圖尺寸落差 30 公分內為合理範圍內)</div><RadioGroup options={['否', '是', '其他/無法測量']} value={data?.q6_hasIssue || ''} onChange={(v) => update('q6_hasIssue', v)} cols={3} layout="grid" />{(data?.q6_hasIssue === '是' || data?.q6_hasIssue === '其他/無法測量') && (<SubItemHighlight><DetailInput value={data.q6_desc || ''} onChange={v => update('q6_desc', v)} /></SubItemHighlight>)}</div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8"><p className="text-3xl font-black text-slate-800 text-left">7. 水、電、瓦斯使用是否有異常？</p><RadioGroup options={['否', '是']} value={data?.q7_hasIssue || ''} onChange={(v) => update('q7_hasIssue', v)} />{data?.q7_hasIssue === '是' && (<SubItemHighlight><div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{UTILITY_ISSUES.map(i => <CheckBox key={i} checked={data?.q7_items?.includes(i) || false} label={i} onClick={() => toggleArr('q7_items', i)} />)}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q7_hasOther || false} label="其他" onClick={() => update('q7_hasOther', !data.q7_hasOther)} />{data?.q7_hasOther && <DetailInput value={data.q7_otherDesc || ''} onChange={v => update('q7_otherDesc', v)} />}</div></div></SubItemHighlight>)}</div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800">公共設施情況</p><RadioGroup options={['有公共設施', '無公共設施', '無法進入']} value={data?.publicFacilities || ''} onChange={(v) => update('publicFacilities', v)} cols={3} layout="grid" />{data?.publicFacilities === '無法進入' && <SubItemHighlight><DetailInput value={data.publicFacilitiesReason || ''} onChange={v => update('publicFacilitiesReason', v)} /></SubItemHighlight>}</div></div>
                                )}
                            </div>
                        )}
                        {activeStep === 3 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-emerald-400' : 'border-sky-400')} pl-6 text-left`}>
                                    {type === 'land' ? '第三步 使用權利與地上物' : (type === 'parking' ? '第三步：環境與注意事項' : '第三步：公共設施(瑕疵)與車位')}
                                </h3>
                                
                                {type === 'house' && (
                                    <div className="space-y-10">
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800 leading-snug">8. 電(樓)梯間、公共地下室等現況是否有龜裂、鋼筋外露、水泥塊剝落等情況？</p><RadioGroup options={['否', '是']} value={data?.q8_stairIssue || ''} onChange={(v) => update('q8_stairIssue', v)} />{data?.q8_stairIssue === '是' && <SubItemHighlight><DetailInput value={data.q8_stairDesc || ''} onChange={v => update('q8_stairDesc', v)} /></SubItemHighlight>}</div>
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800">9. 本案或本社區是否有須注意的設施？</p><RadioGroup options={['否', '是']} value={data?.q9_hasIssue || ''} onChange={(v) => update('q9_hasIssue', v)} />{data?.q9_hasIssue === '是' && (<SubItemHighlight><div className="space-y-6 pt-2"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{FACILITY_OPTIONS.map(i => <CheckBox key={i} checked={data?.q9_items?.includes(i) || false} label={i} onClick={() => toggleArr('q9_items', i)} />)}</div><div className="bg-white p-5 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q9_hasOther || false} label="其他" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />{data?.q9_hasOther && <DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} />}</div></div></SubItemHighlight>)}</div>
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left">
                                            <p className="text-3xl font-black text-slate-800">10. 車位資訊</p>
                                            <div className="mb-6">
                                                <CheckBox checked={data?.q10_noParking || false} label="若無車位，點選此處" onClick={() => update('q10_noParking', !data.q10_noParking)} />
                                            </div>
                                            <div className={`space-y-10 ${parkingLogic.disableMethod ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                <p className="text-2xl font-black text-slate-700 mb-4">停車方式：</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {PARK_TYPES.map(pt => (
                                                        <div key={pt} className="bg-white p-5 rounded-2xl border-2 border-slate-100">
                                                            <CheckBox checked={data?.q10_parkTypes?.includes(pt) || false} label={pt} onClick={() => toggleArr('q10_parkTypes', pt)} disabled={parkingLogic.disableMethod} />
                                                            {(pt === "坡道機械" || pt === "升降機械") && data?.q10_parkTypes?.includes(pt) && (
                                                                <div className="flex flex-wrap gap-3 mt-5 ml-1">
                                                                    {['上層', '中層', '下層'].map(loc => (
                                                                        <button key={loc} type="button" onClick={() => update(pt === "坡道機械" ? 'q10_rampMechLoc' : 'q10_liftMechLoc', loc)} className={`flex items-center justify-center px-6 py-3 rounded-xl border-2 font-black text-xl shadow-sm active:scale-[0.99] transition ${(pt === "坡道機械" ? data.q10_rampMechLoc : data.q10_liftMechLoc) === loc ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-slate-300 text-slate-600'}`}>{loc}</button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4">
                                                    <CheckBox checked={data?.q10_hasParkTypeOther || false} label="其他" onClick={() => update('q10_hasParkTypeOther', !data.q10_hasParkTypeOther)} disabled={parkingLogic.disableMethod} />
                                                    {data?.q10_hasParkTypeOther && <SubItemHighlight disabled={parkingLogic.disableMethod}><DetailInput value={data.q10_parkTypeOther || ''} onChange={v => update('q10_parkTypeOther', v)} /></SubItemHighlight>}
                                                </div>
                                                <div className={`mt-10 transition-all duration-300 ${parkingLogic.disableNumber ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                    <p className="text-2xl font-black text-slate-700 mb-4">車位編號：</p>
                                                    <RadioGroup options={['編號', '無車位編號']} value={data?.q10_parkingNumberType === 'number' ? '編號' : (data?.q10_parkingNumberType === 'none' ? '無車位編號' : '')} onChange={(v) => { if (v === '編號') update('q10_parkingNumberType', 'number'); else { update('q10_parkingNumberType', 'none'); update('q10_parkingNumberVal', ''); } }} disabled={parkingLogic.disableNumber} />
                                                    {data?.q10_parkingNumberType === 'number' && <SubItemHighlight disabled={parkingLogic.disableNumber}><DetailInput value={data.q10_parkingNumberVal || ''} onChange={v => update('q10_parkingNumberVal', v)} /></SubItemHighlight>}
                                                </div>

                                                <div className={`mt-10 transition-all duration-300 ${parkingLogic.disableCarStatus ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                    <p className="text-2xl font-black text-slate-700 mb-4 text-left">汽車車位使用情況：</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {CAR_USAGE_OPTS.map(u => <div key={u} className="bg-white p-5 rounded-2xl border-2 border-slate-100"><CheckBox checked={data?.q10_carUsage?.includes(u) || false} label={u} onClick={() => toggleArr('q10_carUsage', u)} disabled={parkingLogic.disableCarStatus} /></div>)}
                                                        <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 col-span-1 md:col-span-2"><CheckBox checked={data?.q10_carUsage?.includes("須固定抽籤") || false} label="須固定抽籤" onClick={() => toggleArr('q10_carUsage', "須固定抽籤")} disabled={parkingLogic.disableCarStatus} />{data?.q10_carUsage?.includes("須固定抽籤") && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><div className="ml-0 md:ml-4 flex items-center justify-center gap-3 mt-4 font-black text-2xl text-slate-700">每 <input type="number" disabled={parkingLogic.disableCarStatus} className="w-24 border-2 rounded-xl p-3 text-center bg-white" value={data.q10_carLotteryMonth || ''} onChange={e => update('q10_carLotteryMonth', e.target.value)} /> 月抽籤一次</div></SubItemHighlight>)}</div>
                                                        <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 col-span-1 md:col-span-2 text-center"><CheckBox checked={data?.q10_hasCarUsageOther || false} label="其他" onClick={() => update('q10_hasCarUsageOther', !data.q10_hasCarUsageOther)} disabled={parkingLogic.disableCarStatus} />{data?.q10_hasCarUsageOther && (
                                                            <SubItemHighlight disabled={parkingLogic.disableCarStatus}>
                                                                <DetailInput value={data.q10_carUsageOther || ''} onChange={v => update('q10_carUsageOther', v)} />
                                                            </SubItemHighlight>
                                                        )}</div>
                                                    </div>
                                                </div>

                                                <div className={`bg-blue-50 p-8 rounded-[2rem] space-y-6 border-2 border-blue-100 transition-all duration-300 ${parkingLogic.disableCarSize ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                    <p className="font-black text-2xl text-slate-800 text-left">汽車車位尺寸 (公尺)</p>
                                                    <div className="flex gap-4"><input type="text" disabled={parkingLogic.disableCarSize} placeholder="長" className="w-1/3 p-4 rounded-xl border-2 text-xl font-bold" value={data?.q10_dimL || ''} onChange={e => update('q10_dimL', e.target.value)} /><input type="text" disabled={parkingLogic.disableCarSize} placeholder="寬" className="w-1/3 p-4 rounded-xl border-2 text-xl font-bold" value={data?.q10_dimW || ''} onChange={e => update('q10_dimW', e.target.value)} /><input type="text" disabled={parkingLogic.disableCarSize} placeholder="高" className="w-1/3 p-4 rounded-xl border-2 text-xl font-bold" value={data?.q10_dimH || ''} onChange={e => update('q10_dimH', e.target.value)} /></div>
                                                    <p className="font-black text-2xl text-slate-800 mt-4 text-left">機械載重 (公斤)</p><input type="text" disabled={parkingLogic.disableWeight} className={`w-full p-4 rounded-xl border-2 text-xl font-bold text-center ${parkingLogic.disableWeight ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : ''}`} value={data?.q10_mechWeight || ''} onChange={e => update('q10_mechWeight', e.target.value)} placeholder={parkingLogic.disableWeight ? "無須填寫" : ""} />
                                                    <p className="font-black text-2xl text-slate-800 mt-4 text-left">車道出入口高度 (公尺)</p><input type="text" disabled={parkingLogic.disableHeight} className={`w-full p-4 rounded-xl border-2 text-xl font-bold text-center ${parkingLogic.disableHeight ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : ''}`} value={data?.q10_entryHeight || ''} onChange={e => update('q10_entryHeight', e.target.value)} placeholder={parkingLogic.disableHeight ? "無須填寫" : ""} />
                                                </div>
                                            </div>
                                            <div className="mt-10">
                                                <p className="text-2xl font-black text-slate-700 mb-4">機車車位使用情況：</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                    <CheckBox checked={data?.q10_motoUsage?.includes("固定位置使用") || false} label="固定位置使用" onClick={() => toggleArr('q10_motoUsage', "固定位置使用")} />
                                                    <CheckBox checked={data?.q10_motoUsage?.includes("無") || false} label="無" onClick={() => toggleArr('q10_motoUsage', "無")} />
                                                </div>
                                                <div className="mt-4 text-left">
                                                    <CheckBox checked={data?.q10_hasMotoUsageOther || false} label="其他" onClick={() => update('q10_hasMotoUsageOther', !data.q10_hasMotoUsageOther)} />
                                                    {data?.q10_hasMotoUsageOther && (
                                                        <SubItemHighlight>
                                                            <DetailInput value={data.q10_motoUsageOther || ''} onChange={v => update('q10_motoUsageOther', v)} />
                                                        </SubItemHighlight>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`space-y-10 ${parkingLogic.disableCharging ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                <div className="border-t-2 pt-8 text-left"><p className="text-2xl font-black text-slate-700 mb-6">社區是否有充電樁？</p><RadioGroup options={['否', '是', '其他']} value={data?.q10_charging || ''} onChange={(v) => update('q10_charging', v)} cols={3} layout="grid" disabled={parkingLogic.disableCharging} />{data?.q10_charging === '其他' && (
                                                    <SubItemHighlight disabled={parkingLogic.disableCharging}>
                                                        <DetailInput value={data.q10_chargingOther || ''} onChange={v => update('q10_chargingOther', v)} />
                                                    </SubItemHighlight>
                                                )}</div>
                                            </div>
                                        </div>
                                        
                                        <div className={`warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left ${parkingLogic.disableAbnormal ? 'opacity-40 grayscale pointer-events-none' : ''}`}><p className="text-3xl font-black text-slate-800">11. 車位使用是否異常？</p><RadioGroup options={['否', '是']} value={data?.q11_hasIssue || ''} onChange={(v) => update('q11_hasIssue', v)} disabled={parkingLogic.disableAbnormal} />
                                            {data?.q11_hasIssue === '是' && (
                                                <SubItemHighlight>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Q11_OPTS.map(i => <CheckBox key={i} checked={data?.q11_items?.includes(i) || false} label={i} onClick={() => toggleArr('q11_items', i)} disabled={parkingLogic.disableAbnormal} />)}
                                                    </div>
                                                    <div className="mt-4">
                                                        <CheckBox checked={data?.q11_hasOther || false} label="其他" onClick={() => update('q11_hasOther', !data.q11_hasOther)} disabled={parkingLogic.disableAbnormal} />
                                                        {data?.q11_hasOther && <DetailInput value={data.q11_other || ''} onChange={v => update('q11_other', v)} disabled={parkingLogic.disableAbnormal} />}
                                                    </div>
                                                </SubItemHighlight>
                                            )}
                                        </div>
                                        <div className={`warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left ${parkingLogic.disableSupplement ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                            <p className="text-3xl font-black text-slate-800">12. 車位現況補充</p>
                                            <div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※如車格位置有其他孔蓋、排風機、電箱、租期租金或其他注意事項？</div>
                                            <RadioGroup options={['否', '是']} value={data?.q12_hasNote || ''} onChange={(v) => update('q12_hasNote', v)} disabled={parkingLogic.disableSupplement} />
                                            {data?.q12_hasNote === '是' && (
                                                <SubItemHighlight disabled={parkingLogic.disableSupplement}>
                                                    <DetailInput value={data.q12_note || ''} onChange={v => update('q12_note', v)} disabled={parkingLogic.disableSupplement} />
                                                </SubItemHighlight>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {type === 'land' && (
                                    <div className="space-y-10">
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800">5. 被越界佔用/佔用鄰地情況？</p><div className="space-y-6"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100"><p className="text-2xl font-black mb-4">是否有被越界佔用？</p><AccordionRadio options={['否', '是', '其他/疑似']} value={data?.land_q5_encroached || ''} onChange={v => update('land_q5_encroached', v)} renderDetail={(opt) => (opt !== '否' && <SubItemHighlight>
                                            <DetailInput value={data.land_q5_encroached_desc || ''} onChange={v => update('land_q5_encroached_desc', v)} />
                                        </SubItemHighlight>)} /></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100"><p className="text-2xl font-black mb-4">是否有佔用鄰地情況？</p><AccordionRadio options={['否', '是', '其他/疑似']} value={data?.land_q5_encroaching || ''} onChange={v => update('land_q5_encroaching', v)} renderDetail={(opt) => (opt !== '否' && <SubItemHighlight>
                                            <DetailInput value={data.land_q5_encroaching_desc || ''} onChange={v => update('land_q5_encroaching_desc', v)} />
                                        </SubItemHighlight>)} /></div></div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800">6. 目前是否有禁建、限建的情況？</p><AccordionRadio options={['否', '是', '其他']} value={data?.land_q6_limit || ''} onChange={v => update('land_q6_limit', v)} renderDetail={(opt) => (opt !== '否' && <SubItemHighlight>
                                            <DetailInput value={data.land_q6_limit_desc || ''} onChange={v => update('land_q6_limit_desc', v)} />
                                        </SubItemHighlight>)} /></div>
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left">
                                            <p className="text-3xl font-black text-slate-800">7. 土地使用現況與地上物</p>
                                            <div className="space-y-8">
                                                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                                                    <p className="text-2xl font-black mb-4">現況使用人？</p>
                                                    <AccordionRadio options={['無', '所有權人自用', '非所有權人使用']} value={data?.land_q7_user || ''} onChange={v => update('land_q7_user', v)} renderDetail={(opt) => (opt === '非所有權人使用' && (<SubItemHighlight><div className="space-y-6 text-left"><RadioGroup options={['有租約', '無償出借', '無權佔用', '共有分管', '其他']} value={data.land_q7_user_detail || ''} onChange={v => update('land_q7_user_detail', v)} layout="grid" cols={2} />{data.land_q7_user_detail !== '共有分管' && <input className="full-width-input placeholder-slate-400" placeholder={
                                                            data.land_q7_user_detail === '有租約' ? "如租金/押金，期限、有書面或公證等" :
                                                            data.land_q7_user_detail === '無償出借' ? "說明借用對象、約定返還條件等" :
                                                            data.land_q7_user_detail === '無權佔用' ? "說明佔用人身分、已提告/協調中等" :
                                                            "請輸入說明內容"
                                                        } value={data.land_q7_user_desc || ''} onChange={e => update('land_q7_user_desc', e.target.value)} />}</div></SubItemHighlight>))} />
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                                                    <p className="text-2xl font-black mb-4">地上定著物-農作物</p>
                                                    <AccordionRadio 
                                                        options={['無', '有農作物/植栽']} 
                                                        value={data?.land_q7_crops || ''} 
                                                        onChange={v => update('land_q7_crops', v)} 
                                                        renderDetail={(opt) => (opt === '有農作物/植栽' && (
                                                            <SubItemHighlight>
                                                                <div className="space-y-6 text-left">
                                                                    <div className="flex items-center justify-start gap-4 text-2xl font-black">
                                                                        <span>待</span>
                                                                        <input type="number" className="w-24 border-b-4 border-slate-300 text-center outline-none bg-transparent" value={data.land_q7_crops_month || ''} onChange={e => update('land_q7_crops_month', e.target.value)} />
                                                                        <span>月收成</span>
                                                                    </div>
                                                                    <RadioGroup 
                                                                        options={['經濟作物', '景觀植栽', '其他']} 
                                                                        value={data.land_q7_crops_type || ''} 
                                                                        onChange={v => update('land_q7_crops_type', v)} 
                                                                        layout="grid" 
                                                                        cols={3} 
                                                                    />
                                                                    {(data.land_q7_crops_type === '經濟作物' || data.land_q7_crops_type === '景觀植栽') && (
                                                                        <div className="animate-in fade-in slide-in-from-top-2">
                                                                            <p className="text-lg font-bold text-slate-500 mb-2">處理方式：</p>
                                                                            <RadioGroup 
                                                                                options={['列冊點交', '賣方補償', '賣方移除']} 
                                                                                value={data.land_q7_crops_detail || ''} 
                                                                                onChange={v => update('land_q7_crops_detail', v)} 
                                                                                layout="grid" 
                                                                                cols={3} 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {data.land_q7_crops_type === '其他' && (
                                                                        <div className="animate-in fade-in slide-in-from-top-2">
                                                                            <input className="full-width-input placeholder-slate-400" placeholder="如禁伐補償、造林等" value={data.land_q7_crops_other || ''} onChange={e => update('land_q7_crops_other', e.target.value)} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </SubItemHighlight>
                                                        ))} 
                                                    />
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                                                    <p className="text-2xl font-black mb-4">地上定著物-建物</p>
                                                    <AccordionRadio 
                                                        options={['無', '有建築物/工作物']} 
                                                        value={data?.land_q7_build || ''} 
                                                        onChange={v => update('land_q7_build', v)} 
                                                        renderDetail={(opt) => (opt === '有建築物/工作物' && (
                                                            <SubItemHighlight>
                                                                <div className="space-y-6 text-left">
                                                                    <RadioGroup 
                                                                        options={['有保存登記', '未保存登記', '宗教/殯葬設施', '廢棄物', '其他']} 
                                                                        value={data.land_q7_build_type || ''} 
                                                                        onChange={v => update('land_q7_build_type', v)} 
                                                                        layout="grid" 
                                                                        cols={2} 
                                                                    />
                                                                    {(data.land_q7_build_type === '有保存登記' || data.land_q7_build_type === '未保存登記') && (
                                                                        <div className="mt-4 border-t-2 pt-4 border-sky-200 animate-in fade-in">
                                                                            <p className="text-xl font-black text-slate-700 mb-3">現況權屬：</p>
                                                                            <RadioGroup 
                                                                                options={['現有租客/佔有人', '所有權人擁有', '他人無權佔有']} 
                                                                                value={data.land_q7_build_ownership || ''} 
                                                                                onChange={v => update('land_q7_build_ownership', v)} 
                                                                                layout="grid" 
                                                                                cols={1} 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {data.land_q7_build_type === '宗教/殯葬設施' && (
                                                                        <div className="mt-4 border-t-2 pt-4 border-sky-200 animate-in fade-in">
                                                                            <p className="text-xl font-black text-slate-700 mb-3">設施類型：</p>
                                                                            <RadioGroup 
                                                                                options={['墳墓', '小廟']} 
                                                                                value={data.land_q7_build_rel_detail || ''} 
                                                                                onChange={v => update('land_q7_build_rel_detail', v)} 
                                                                                layout="grid" 
                                                                                cols={2} 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {data.land_q7_build_type === '廢棄物' && (
                                                                        <div className="mt-4 animate-in fade-in">
                                                                            <div className="bg-red-50 text-red-600 font-black p-4 rounded-xl border-2 border-red-200 text-lg">
                                                                                ※有無被回填不明土壤(顏色怪異、有化學味)？若埋有毒廢棄物，需做土壤檢測
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {data.land_q7_build_type === '其他' && (
                                                                        <div className="mt-4 animate-in fade-in">
                                                                            <input className="full-width-input placeholder-slate-400" placeholder="請說明情況" value={data.land_q7_build_other || ''} onChange={e => update('land_q7_build_other', e.target.value)} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </SubItemHighlight>
                                                        ))} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {type === 'parking' && (
                                    <div className="space-y-10">
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-6 text-left">
                                            <div className="flex flex-col items-start gap-6 border-b-2 pb-6">
                                                <p className="text-3xl font-black text-slate-800">4. 重要環境設施</p>
                                                <CheckBox checked={data?.q16_noFacilities || false} label="無重要環境設施" onClick={() => update('q16_noFacilities', !data.q16_noFacilities)} />
                                            </div>
                                            <div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施</div>
                                            <div className={`space-y-8 ${data?.q16_noFacilities ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                {ENV_CATEGORIES.map((cat, idx) => (
                                                    <div key={idx} className="bg-white p-6 rounded-2xl border-2 border-slate-100">
                                                        <p className="font-black text-slate-600 mb-6 border-b pb-3 text-2xl">{cat.title}</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {cat.items.map(item => (
                                                                <CheckBox key={item} checked={data?.q16_items?.includes(item) || false} label={item} onClick={() => toggleArr('q16_items', item)} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="bg-white p-6 rounded-2xl border-2 border-sky-100 text-left">
                                                    <CheckBox checked={data?.q16_hasOther || false} label="其他" onClick={() => update('q16_hasOther', !data.q16_hasOther)} />
                                                    {data?.q16_hasOther && (
                                                        <SubItemHighlight>
                                                            <DetailInput value={data.q16_other || ''} onChange={v => update('q16_other', v)} />
                                                        </SubItemHighlight>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left">
                                            <p className="text-3xl font-black text-slate-800">5. 本案或本社區是否有須注意的事項？</p>
                                            <div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※如凶宅、氯離子過高、海砂屋、車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等</div>
                                            <RadioGroup options={['否', '是']} value={data?.q17_issue || ''} onChange={(v) => update('q17_issue', v)} />
                                            {data?.q17_issue === '是' && <SubItemHighlight><DetailInput value={data.q17_desc || ''} onChange={v => update('q17_desc', v)} /></SubItemHighlight>}
                                        </div>

                                        <div className="p-10 bg-rose-50 border-4 border-rose-200 rounded-[2rem] text-center shadow-lg mt-8">
                                            <div className="mb-6"><CheckCircle2 className="w-24 h-24 text-rose-600 mx-auto" /></div>
                                            <p className="text-3xl font-black text-rose-800 leading-relaxed mb-4">車位現況調查表填寫完成！</p>
                                            <p className="text-xl text-rose-700 font-bold">請檢查右側預覽畫面是否正確，確認無誤後即可匯出檔案。</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeStep === 4 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-emerald-400' : 'border-sky-400')} pl-6 text-left`}>
                                    {type === 'land' ? '第四步 外在環境及其他' : '第四步：外觀、環境與其他須注意事項確認'}
                                </h3>
                                {type === 'house' && (
                                    <>
                                        <div className="bg-blue-50 p-8 rounded-[2rem] border-4 border-blue-100 text-left"><CheckBox checked={data?.isNotFirstFloor || false} label="並非一樓、透天、店面、別墅等" onClick={() => update('isNotFirstFloor', !data.isNotFirstFloor)} /></div>
                                        <div className={`space-y-10 ${data?.isNotFirstFloor ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                            <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800 leading-snug">13. 一樓前方空地、後方空地(防火巷)或騎樓部分是否有被佔用情況？</p><RadioGroup options={['否', '是']} value={data?.q13_occupancy || ''} onChange={(v) => update('q13_occupancy', v)} />{data?.q13_occupancy === '是' && <SubItemHighlight><DetailInput value={data.q13_desc || ''} onChange={v => update('q13_desc', v)} /></SubItemHighlight>}</div>
                                            <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800 leading-snug">14. 進出須經他人土地</p><RadioGroup options={['否', '是']} value={data?.q14_access || ''} onChange={(v) => update('q14_access', v)} />{data?.q14_access === '是' && (<SubItemHighlight><div className="flex flex-col md:flex-row gap-4 items-center bg-[#f8fafc] p-6 rounded-2xl border-2 border-sky-100 justify-center"><div className="flex items-center gap-2 w-full justify-start"><input className="w-24 p-3 border-2 rounded-xl text-xl font-bold text-center" placeholder="段" value={data.q14_section || ''} onChange={e => update('q14_section', e.target.value)} /><span className="text-xl font-bold">段</span><input className="w-24 p-3 border-2 rounded-xl text-xl font-bold text-center" placeholder="小段" value={data.q14_subSection || ''} onChange={e => update('q14_subSection', e.target.value)} /><span className="text-xl font-bold">小段</span></div><div className="flex items-center gap-2 w-full justify-start"><input className="w-full p-3 border-2 rounded-xl text-xl font-bold text-left" placeholder="地號" value={data.q14_number || ''} onChange={e => update('q14_number', e.target.value)} /><span className="text-xl font-bold shrink-0">地號</span></div></div></SubItemHighlight>)}</div>
                                            <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800 leading-snug">15. 增建佔用他人土地</p><RadioGroup options={['否', '是']} value={data?.q15_occupy || ''} onChange={(v) => update('q15_occupy', v)} />{data?.q15_occupy === '是' && (<SubItemHighlight><div className="flex flex-col md:flex-row gap-4 items-center bg-[#f8fafc] p-6 rounded-2xl border-2 border-sky-100 justify-center"><div className="flex items-center gap-2 w-full justify-start"><input className="w-24 p-3 border-2 rounded-xl text-xl font-bold text-center" placeholder="段" value={data.q15_section || ''} onChange={e => update('q15_section', e.target.value)} /><span className="text-xl font-bold">段</span><input className="w-24 p-3 border-2 rounded-xl text-xl font-bold text-center" placeholder="小段" value={data.q15_subSection || ''} onChange={e => update('q15_subSection', e.target.value)} /><span className="text-xl font-bold">小段</span></div><div className="flex items-center gap-2 w-full justify-start"><input className="w-full p-3 border-2 rounded-xl text-xl font-bold text-left" placeholder="地號" value={data.q15_number || ''} onChange={e => update('q15_number', e.target.value)} /><span className="text-xl font-bold shrink-0">地號</span></div></div></SubItemHighlight>)}</div>
                                        </div>
                                        <div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-6 text-left"><div className="flex flex-col items-start gap-6 border-b-2 pb-6"><p className="text-3xl font-black text-slate-800">16. 重要環境設施</p><CheckBox checked={data?.q16_noFacilities || false} label="無重要環境設施" onClick={() => update('q16_noFacilities', !data.q16_noFacilities)} /></div><div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施</div><div className={`space-y-8 ${data?.q16_noFacilities ? 'opacity-40 grayscale pointer-events-none' : ''}`}>{ENV_CATEGORIES.map((cat, idx) => (<div key={idx} className="bg-white p-6 rounded-2xl border-2 border-slate-100"><p className="font-black text-slate-600 mb-6 border-b pb-3 text-2xl">{cat.title}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{cat.items.map(item => (<CheckBox key={item} checked={data?.q16_items?.includes(item) || false} label={item} onClick={() => toggleArr('q16_items', item)} />))}</div></div>))}<div className="bg-white p-6 rounded-2xl border-2 border-sky-100 text-left"><CheckBox checked={data?.q16_hasOther || false} label="其他" onClick={() => update('q16_hasOther', !data.q16_hasOther)} />{data?.q16_hasOther && <SubItemHighlight><DetailInput value={data.q16_other || ''} onChange={v => update('q16_other', v)} /></SubItemHighlight>}</div></div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800">17. 本案或本社區是否有須注意的事項？</p><div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※如凶宅、氯離子過高、海砂屋、車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等</div><RadioGroup options={['否', '是']} value={data?.q17_issue || ''} onChange={(v) => update('q17_issue', v)} />{data?.q17_issue === '是' && <SubItemHighlight><DetailInput value={data.q17_desc || ''} onChange={v => update('q17_desc', v)} /></SubItemHighlight>}</div><div className="p-10 bg-green-50 border-4 border-green-200 rounded-[2rem] text-center shadow-lg mt-8"><div className="mb-6"><CheckCircle2 className="w-24 h-24 text-green-600 mx-auto" /></div><p className="text-3xl font-black text-green-800 leading-relaxed mb-4">成屋現況調查表填寫完成！</p><p className="text-xl text-green-700 font-bold">請檢查右側預覽畫面是否正確，確認無誤後即可匯出檔案。</p></div></>
                                )}
                                {type === 'land' && (
                                    <><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-6 text-left"><div className="flex flex-col items-start gap-6 border-b-2 pb-6"><p className="text-3xl font-black text-slate-800">8. 重要環境設施</p><CheckBox checked={data?.q16_noFacilities || false} label="無重要環境設施" onClick={() => update('q16_noFacilities', !data.q16_noFacilities)} /></div><div className="warning-box text-xl w-full text-center p-4 bg-red-50 rounded-xl">※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施</div><div className={`space-y-8 ${data?.q16_noFacilities ? 'opacity-40 grayscale pointer-events-none' : ''}`}>{ENV_CATEGORIES.map((cat, idx) => (<div key={idx} className="bg-white p-6 rounded-2xl border-2 border-slate-100"><p className="font-black text-slate-600 mb-6 border-b pb-3 text-2xl">{cat.title}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{cat.items.map(item => (<CheckBox key={item} checked={data?.q16_items?.includes(item) || false} label={item} onClick={() => toggleArr('q16_items', item)} />))}</div></div>))}<div className="bg-white p-6 rounded-2xl border-2 border-slate-100 text-left"><CheckBox checked={data?.q16_hasOther || false} label="其他" onClick={() => update('q16_hasOther', !data.q16_hasOther)} />{data?.q16_hasOther && (<SubItemHighlight><DetailInput value={data.q16_other || ''} onChange={v => update('q16_other', v)} /></SubItemHighlight>)}</div></div></div><div className="warm-card p-8 rounded-[2rem] shadow-sm space-y-8 text-left"><p className="text-3xl font-black text-slate-800">9. 本案或周圍是否有須注意的事項？</p><RadioGroup options={['否', '是']} value={data?.land_q8_special || ''} onChange={(v) => update('land_q8_special', v)} />{data?.land_q8_special === '是' && <SubItemHighlight><DetailInput value={data.land_q8_special_desc || ''} onChange={v => update('land_q8_special_desc', v)} /></SubItemHighlight>}</div><div className="p-10 bg-emerald-50 border-4 border-emerald-200 rounded-[2rem] text-center shadow-lg mt-8"><div className="mb-6"><CheckCircle2 className="w-24 h-24 text-emerald-600 mx-auto" /></div><p className="text-3xl font-black text-emerald-800 leading-relaxed mb-4">土地現況調查表填寫完成！</p><p className="text-xl text-emerald-700 font-bold">請檢查右側預覽畫面是否正確，確認無誤後即可匯出檔案。</p></div></>
                                )}
                            </div>
                        )}
                    </ErrorBoundary>

                    <div className="no-print bg-white border-t border-slate-200 p-6 pb-32 lg:pb-6 flex flex-col items-center justify-center shrink-0 z-20 shadow-inner">
                        <div className="w-full max-w-md flex items-center gap-4 h-8">
                            {[1, 2, 3, 4].slice(0, stepsToShow).map(s => (
                                <button key={s} type="button" onClick={() => setActiveStep(s)} className={`h-4 flex-1 rounded-full transition-all duration-300 relative group ${activeStep >= s ? themeBg : 'bg-slate-200 hover:bg-slate-300'}`}><div className="absolute inset-0 -m-4"></div></button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div ref={previewWrapperRef} className={`flex-grow bg-slate-300 p-4 lg:p-10 overflow-y-auto flex flex-col items-center absolute lg:relative inset-0 z-30 transition-transform duration-300 ${mobileTab === 'preview' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} pb-32 lg:pb-10`}>
                <div className="w-full max-w-[210mm] bg-sky-100 text-sky-900 px-6 py-4 rounded-2xl mb-6 text-center font-bold shadow-md border-2 border-sky-200 text-xl">
                    {isMobile ? "💡 手機板：可左右拖曳畫面檢視完整內容" : "💡 電腦板：可隨著卷軸移動檢視完整內容"}
                </div>
                <div className="w-full max-w-[210mm] flex mb-8 bg-white rounded-2xl shadow-md p-2 gap-2">
                    <button onClick={() => setPreviewPage(1)} className={`flex-1 py-4 rounded-xl font-bold text-xl transition-all ${previewPage === 1 ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>第一頁 (正面)</button>
                    {(type !== 'parking' || hasParkingPage2) && (
                        <button onClick={() => setPreviewPage(2)} className={`flex-1 py-4 rounded-xl font-bold text-xl transition-all ${previewPage === 2 ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>第二頁 (背面)</button>
                    )}
                </div>

                <SurveyPreview data={data} type={type} exporting={exporting} previewScale={previewScale} previewPage={previewPage} page1Ref={page1Ref} page2Ref={page2Ref} onParkingOverflowChange={setHasParkingPage2} />

                <div className="w-full flex flex-col gap-4 justify-center mt-10 mb-24 lg:mb-0 lg:flex-row text-left">
                    <button onClick={() => handleExport('jpg')} className="w-full lg:w-auto px-10 py-5 bg-sky-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-sky-700 transition active:scale-95"><ImageIcon className="w-8 h-8" /> 匯出 JPG 圖片</button>
                    <button onClick={() => handleExport('pdf')} className="w-full lg:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-red-700 transition active:scale-95"><FileText className="w-8 h-8" /> 匯出 PDF 文件</button>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pb-safe z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                <button onClick={() => setMobileTab('edit')} className={`flex flex-col items-center justify-center w-full py-4 ${mobileTab === 'edit' ? 'text-sky-600' : 'text-slate-400'}`}><Edit3 className="w-8 h-8 mb-1" /><span className="text-base font-bold">填寫資料</span></button>
                <div className="w-[1px] h-10 bg-slate-200"></div>
                <button onClick={() => setMobileTab('preview')} className={`flex flex-col items-center justify-center w-full py-4 ${mobileTab === 'preview' ? 'text-sky-600' : 'text-slate-400'}`}><Eye className="w-8 h-8 mb-1" /><span className="text-base font-bold">預覽/匯出</span></button>
            </div>

            {exporting && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-md text-left">
                    <div className="bg-white p-16 rounded-[3rem] flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-24 h-24 border-8 border-sky-600 border-t-transparent rounded-full animate-spin mb-8"></div>
                        <p className="text-3xl font-black text-slate-800 mb-4">檔案產生中...</p>
                        <p className="text-xl text-slate-500 font-bold">請稍候片刻，系統正在為您封裝資料</p>
                    </div>
                </div>
            )}
        </div>
    );
};
