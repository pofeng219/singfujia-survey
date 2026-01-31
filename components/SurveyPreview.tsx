import { SurveyData, SurveyType } from '../types';
import { PreviewResult } from './SharedUI';
import { formatDateROC } from './ROCDatePicker';
import React, { useMemo, useState, useEffect } from 'react';
import { FileText, Smartphone } from 'lucide-react';

interface SurveyPreviewProps {
    data: SurveyData;
    type: SurveyType;
    exporting: boolean;
    previewScale: number;
    previewPage: number;
    setPreviewPage: (page: number) => void;
    // 修改處：為了避免 TS2322 錯誤，這裡稍微放寬定義
    page1Ref: React.RefObject<HTMLDivElement>;
    page2Ref: React.RefObject<HTMLDivElement>;
    isMobile?: boolean;
}

// Helper Components for A4 Table
const CheckRow: React.FC<{ checked: boolean; children: React.ReactNode }> = ({ checked, children }) => (
    <tr>
        <td className="w-28 text-center bg-gray-50 font-black">{checked ? 'V' : ''}</td>
        <td colSpan={9} className="py-1 px-4 text-left">
            <div className="pl-4">
                {children}
            </div>
        </td>
    </tr>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">{title}</td></tr>
);

const BulletItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="text-slate-800 font-bold text-[17px] mt-0.5 flex items-start leading-tight">
        <span className="mr-2 shrink-0">•</span>
        <span className="mr-1 shrink-0">{label}：</span>
        <span>{value}</span>
    </div>
);

// Extracted Parking Content
const ParkingContent: React.FC<{ data: SurveyData, parkingSummary: any }> = ({ data, parkingSummary }) => {
    const getParkingTypeLabel = (pt: string) => {
        if (pt === "坡道機械" && data?.q10_rampMechLoc) return `${pt}(${data.q10_rampMechLoc})`;
        if (pt === "升降機械" && data?.q10_liftMechLoc) return `${pt}(${data.q10_liftMechLoc})`;
        if (pt === "塔式車位" && data?.q10_liftMechLoc) return `${pt}(${data.q10_liftMechLoc})`;
        return pt;
    };
    
    const getParkingCarUsageLabel = () => {
        let labels = (data?.q10_carUsage || []).map(u => u === "須固定抽籤" ? `須固定抽籤(每${data.q10_carLotteryMonth}月)` : u);
        if (data?.q10_hasCarUsageOther && data.q10_carUsageOther) labels.push(`其他: ${data.q10_carUsageOther}`);
        return labels.join('、');
    };
    const getParkingMotoUsageLabel = () => {
        let labels = [...(data?.q10_motoUsage || [])];
        if (data?.q10_hasMotoUsageOther && data.q10_motoUsageOther) labels.push(`其他: ${data.q10_motoUsageOther}`);
        return labels.join('、');
    };

    return (
        <div className="space-y-1">
            {parkingSummary.showMethod && (<div><span className="font-bold mr-2">停車方式:</span>{(data?.q10_parkTypes || []).map(pt => (<PreviewResult key={pt} checked={true} label={getParkingTypeLabel(pt)} />))}<PreviewResult checked={data?.q10_hasParkTypeOther} label="其他" suffix={': ' + (data?.q10_parkTypeOther || '')} /></div>)}
            {parkingSummary.showNumber && (<div><span className="font-bold mr-2">車位編號:</span><PreviewResult checked={data?.q10_parkingNumberType === 'number'} label="有車位編號" suffix={': ' + (data?.q10_parkingNumberVal || '')} /><PreviewResult checked={data?.q10_parkingNumberType === 'none'} label="無車位編號" /></div>)}
            {parkingSummary.showCarStatus && getParkingCarUsageLabel() && (<div><span className="font-bold mr-2">汽車車位使用情況:</span><span className="font-medium">{getParkingCarUsageLabel()}</span></div>)}
            {getParkingMotoUsageLabel() && <div><span className="font-bold mr-2">機車車位使用情況:</span><span className="font-medium">{getParkingMotoUsageLabel()}</span></div>}
            {(parkingSummary.showCarSize || parkingSummary.showWeight || parkingSummary.showHeight) && (
                <div className="flex flex-wrap gap-x-4">
                    <span className="font-bold">汽車車位尺寸 (公尺):</span>
                    {data?.q10_measureType === '依謄本登記' && <span className="font-medium">[依謄本登記]</span>}
                    {data?.q10_measureType === '無法測量' && <span className="font-medium">[無法測量]</span>}
                    {parkingSummary.showCarSize && (<><span>長:{data?.q10_dimL || '_'}</span><span>寬:{data?.q10_dimW || '_'}</span><span>高:{data?.q10_dimH || '_'}</span></>)}
                    {parkingSummary.showWeight && <span>機械載重:{data?.q10_mechWeight || '_'}kg</span>}
                    {parkingSummary.showHeight && <span>車道出入口高度:{data?.q10_entryHeight || '_'}m</span>}
                </div>
            )}
            {parkingSummary.showCharging && (<div><span className="font-bold mr-2">社區是否有充電樁？:</span><PreviewResult checked={data?.q10_charging === '是'} label="有" /><PreviewResult checked={data?.q10_charging === '否'} label="無" /><PreviewResult checked={data?.q10_charging === '僅預留管線/孔位'} label="僅預留管線/孔位" /><PreviewResult checked={data?.q10_charging === '需經管委會同意'} label="需經管委會同意" /><PreviewResult checked={data?.q10_charging === '其他'} label="其他" suffix={': ' + (data?.q10_chargingOther || '')} /></div>)}
            {parkingSummary.isNoParking && (<div><span className="font-bold mr-2">停車方式:</span><PreviewResult checked={true} label="無車位" /></div>)}
        </div>
    );
};

// Extracted Footer
const Footer = ({ showSignature }: { showSignature: boolean }) => (
    <div className="mt-auto w-full pt-4 border-t-4 border-black flex justify-between items-end">
        {showSignature ? (
            <div className="space-y-4 font-black text-xl">調查業務人員簽章：<div className="w-[200px] h-6 border-b-2 border-slate-300"></div></div>
        ) : (
            <div></div>
        )}
        <div className="flex flex-col items-end">
            <div className="text-3xl font-black italic text-sky-500">幸福家不動產</div>
            <span className="text-[12px] font-bold text-slate-500 tracking-wider mt-1">※本調查內容僅供公司內部參考，實際應以權狀及產調為準</span>
        </div>
    </div>
);

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ data, type, exporting, previewScale, previewPage, setPreviewPage, page1Ref, page2Ref, isMobile = false }) => {
    // Default to 'mobile' view if on mobile device, unless exporting
    const [viewMode, setViewMode] = useState<'a4' | 'mobile'>('a4');

    useEffect(() => {
        if (isMobile) {
            setViewMode('mobile');
        } else {
            setViewMode('a4');
        }
    }, [isMobile]);

    // Force A4 mode when exporting
    const activeMode = exporting ? 'a4' : viewMode;

    const parkingSummary = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;

        return {
            isNoParking,
            showMethod: !isNoParking,
            showNumber: !isNoParking && !isOtherPt && (data?.q10_parkingNumberType === 'number' || data?.q10_parkingNumberType === 'none'),
            showCarStatus: !isNoParking && !isOtherPt && ((data?.q10_carUsage || []).length > 0 || data?.q10_hasCarUsageOther),
            showCarSize: !isNoParking && !isOtherPt && data?.q10_measureType !== '無法測量',
            showWeight: !isNoParking && !isOtherPt && !pts.includes("坡道平面") && !pts.includes("一樓平面") && data?.q10_mechWeight,
            showHeight: !isNoParking && !isOtherPt && !pts.includes("一樓平面") && data?.q10_entryHeight,
            showCharging: !isNoParking,
            showAbnormal: !isNoParking && data?.q11_hasIssue === '是',
            showSupplement: !isNoParking && data?.q12_hasNote === '是'
        };
    }, [data]);

    const getHouseQ1Label = () => {
        const labels = data?.q1_items?.map(i => i === "地下室增建" && data.q1_basementPartition ? "地下室增建(內含隔間)" : i) || [];
        if (data?.q1_hasOther && data.q1_other) labels.push(`其他: ${data.q1_other}`);
        return labels.join(', ');
    };

    const getHouseQ3Label = () => {
        let prefix = "";
        if (data?.q3_leakType && data?.q3_leakType !== "兩者皆有") prefix = `[${data.q3_leakType}] `;
        if (data?.q3_leakType === "兩者皆有") prefix = `[滲漏水與壁癌] `;
        
        const labels = [...(data?.q3_locations || [])];
        if (data?.q3_ceilingWrapped) labels.push("全屋天花板包覆");
        if (data?.q3_suspected && data.q3_suspectedDesc) labels.push(`疑似: ${data.q3_suspectedDesc}`);
        if (data?.q3_hasOther && data.q3_other) labels.push(`其他: ${data.q3_other}`);
        return prefix + labels.join(', ');
    };

    const getHouseQ4Label = () => {
        const labels = [...(data?.q4_items || [])];
        if (data?.q4_ceilingWrapped) labels.push("全屋天花板包覆");
        if (data?.q4_suspected && data.q4_suspectedDesc) labels.push(`疑似: ${data.q4_suspectedDesc}`);
        if (data?.q4_hasOther && data.q4_otherDesc) labels.push(`其他: ${data.q4_otherDesc}`);
        return labels.join(', ');
    };

    const getHouseQ7Label = () => {
        const labels = [...(data?.q7_items || [])];
        if (data?.q7_hasOther && data.q7_otherDesc) labels.push(`其他: ${data.q7_otherDesc}`);
        return labels.join(', ');
    };

    const getHouseQ9Label = () => {
        const labels = [...(data?.q9_items || [])];
        if (data?.q9_hasOther && data.q9_otherDesc) labels.push(`其他: ${data.q9_otherDesc}`);
        return labels.join(', ');
    };

    const getQ11Label = () => {
        const labels = [...(data?.q11_items || [])];
        if (data?.q11_hasOther && data.q11_other) labels.push(`其他: ${data.q11_other}`);
        return labels.join(', ');
    };

    const getEnvFacilitiesLabel = () => {
        if (data?.q16_noFacilities) return "無重要環境設施";
        const labels = [...(data?.q16_items || [])];
        if (data?.q16_hasOther && data.q16_other) labels.push(`其他: ${data.q16_other}`);
        return labels.join('、');
    };

    const getLandElecSummary = () => {
        if (data?.land_q1_elec === '是') return `是 (${data.land_q1_elec_detail})`;
        if (data?.land_q1_elec === '其他') return `其他: ${data.land_q1_elec_other}`;
        return data?.land_q1_elec || '';
    };

    const getLandWaterSummary = () => {
        if (data?.land_q1_water === '否' || !data?.land_q1_water) return data?.land_q1_water || '';
        if (data?.land_q1_water === '其他') return `其他: ${data.land_q1_water_other}`;
        if (data?.land_q1_water === '是') {
            let res = `是 (${data.land_q1_water_cat}`;
            if (data.land_q1_water_cat === '自來水') res += ` - ${data.land_q1_water_tap_detail}`;
            else if (data.land_q1_water_cat === '地下水') res += ` - ${data.land_q1_water_ground_detail}`;
            else if (data.land_q1_water_cat === '水利溝渠') res += ` - ${data.land_q1_water_irr_detail}`;
            return res + ')';
        }
        return '';
    };

    // Helper for Land Q7
    const getLandUserSummary = () => {
        if (data?.land_q7_user === '無') return '無';
        if (data?.land_q7_user === '所有權人自用') return '所有權人自用';
        if (data?.land_q7_user === '非所有權人使用') {
            return `非所有權人使用 (${data.land_q7_user_detail}${data.land_q7_user_desc ? ': ' + data.land_q7_user_desc : ''})`;
        }
        return '';
    };

    const getLandCropsSummary = () => {
        if (data?.land_q7_crops === '無') return '無';
        if (data?.land_q7_crops === '有農作物/植栽') {
            let parts = [data.land_q7_crops_type];
            if (data.land_q7_crops_type === '經濟作物' && data.land_q7_crops_month) parts.push(`收成:${data.land_q7_crops_month}月`);
            if (data.land_q7_crops_detail) parts.push(`處理:${data.land_q7_crops_detail}`);
            if (data.land_q7_crops_other) parts.push(data.land_q7_crops_other);
            return `有 (${parts.join(', ')})`;
        }
        return '';
    };

    const getLandBuildSummary = () => {
        if (data?.land_q7_build === '無') return '無';
        if (data?.land_q7_build === '有建築物/工作物') {
            let parts = [data.land_q7_build_type];
            if (data.land_q7_build_ownership) parts.push(`權屬:${data.land_q7_build_ownership}`);
            if (data.land_q7_build_rel_detail) parts.push(data.land_q7_build_rel_detail);
            if (data.land_q7_build_other) parts.push(data.land_q7_build_other);
            return `有 (${parts.join(', ')})`;
        }
        return '';
    };

    const getFactoryFireLabel = () => {
        const labels = [...(data?.factory_fire_safety || [])];
        if (data?.factory_fire_safety?.includes("其他") && data.factory_fire_safety_other) labels.push(data.factory_fire_safety_other);
        return labels.join('、');
    };

    const renderCommonExtraQuestions = (startIdx: number) => (
        <>
            <SectionHeader title={`${startIdx}. 本案標的須經由他人土地出入？`} />
            <CheckRow checked={data?.q14_access === '否'}>
                <PreviewResult checked={data?.q14_access === '是'} label={`是 (地號: ${data.q14_section}段 ${data.q14_subSection}小段 ${data.q14_number}號)`} />
                <PreviewResult checked={data?.q14_access === '否'} label="否" />
            </CheckRow>

            <SectionHeader title={`${startIdx + 1}. 增建部分是否占用他人土地？`} />
            <CheckRow checked={data?.q15_occupy === '否'}>
                <PreviewResult checked={data?.q15_occupy === '是'} label={`是 (地號: ${data.q15_section}段 ${data.q15_subSection}小段 ${data.q15_number}號)`} />
                <PreviewResult checked={data?.q15_occupy === '否'} label="否" />
            </CheckRow>

            <SectionHeader title={`${startIdx + 2}. 重要環境設施`} />
            <CheckRow checked={data?.q16_noFacilities}>
                <span className="font-medium">{getEnvFacilitiesLabel()}</span>
            </CheckRow>

            <SectionHeader title={`${startIdx + 3}. 本案或本社區是否有須注意的事項？`} />
            <CheckRow checked={data?.q17_issue === '否'}>
                <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
                <PreviewResult checked={data?.q17_issue === '否'} label="無" />
            </CheckRow>
        </>
    );

    const PageSwitcher = () => (
        type !== 'parking' ? (
            <div className="flex bg-white rounded-2xl shadow-md p-2 gap-2 border border-slate-200 no-print w-full">
                <button onClick={() => setPreviewPage(1)} className={`flex-1 py-4 rounded-xl font-black text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 1 ? 'bg-slate-800 text-white border-slate-950' : 'text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50'}`}>第一頁 (正面)</button>
                <button onClick={() => setPreviewPage(2)} className={`flex-1 py-4 rounded-xl font-black text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 2 ? 'bg-slate-800 text-white border-slate-950' : 'text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50'}`}>第二頁 (背面)</button>
            </div>
        ) : null
    );

    // === Wrapper for Scaling A4 Pages Properly ===
    const ScaledA4Wrapper = ({ children, pageNum }: { children?: React.ReactNode, pageNum: number }) => (
        <div style={{
            width: exporting ? '210mm' : `${210 * previewScale}mm`,
            height: exporting ? 'auto' : `${297 * previewScale}mm`,
            flexShrink: 0,
            boxShadow: exporting ? 'none' : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            backgroundColor: 'white',
            marginBottom: exporting ? 0 : '2rem',
            overflow: exporting ? 'visible' : 'hidden', // Hide overflow when scaling to prevent scrollbars
            display: (previewPage === pageNum || exporting) ? 'block' : 'none'
        }}>
            {/* The Inner Page is always 210mm x 297mm but scaled down */}
            {/* 修改處：這裡加上 as any 來強制忽略 TS2322 錯誤 */}
            <div ref={(pageNum === 1 ? page1Ref : page2Ref) as any} className="a4-page" style={{
                transform: `scale(${exporting ? 1 : previewScale})`,
                transformOrigin: 'top left', // CRITICAL: Scale from top-left to fit into wrapper
                width: '210mm',
                minHeight: '297mm',
                margin: 0 // Reset margins as the wrapper handles spacing
            }}>
                {children}
            </div>
        </div>
    );

    // === Mobile Specific Layout ===
    if (activeMode === 'mobile') {
        return (
            <div className="w-full max-w-2xl px-4 py-6 bg-slate-50 min-h-full">
                {/* View Toggle */}
                {isMobile && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                        <p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm">
                            💡 手機版：可左右拖曳，亦可雙指放大縮小檢視
                        </p>
                    </div>
                )}
                {isMobile && (
                    <div className="flex bg-white p-2 rounded-2xl shadow-sm mb-6 border border-slate-200">
                        <button onClick={() => setViewMode('mobile')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'mobile' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}>
                            <Smartphone className="w-5 h-5" /> 手機好讀版
                        </button>
                        <button onClick={() => setViewMode('a4')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'a4' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}>
                            <FileText className="w-5 h-5" /> A4 列印版
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
                        <h3 className="text-2xl font-black text-slate-800 mb-4 border-b-4 border-orange-200 pb-2 inline-block">基本資料</h3>
                        <div className="space-y-3">
                            <BulletItem label="案名" value={data?.caseName || '-'} />
                            <BulletItem label="編號" value={data?.authNumber || '-'} />
                            <BulletItem label="地址" value={data?.address || '-'} />
                            <BulletItem label="業務" value={data?.agentName || '-'} />
                            <BulletItem label="日期" value={formatDateROC(data?.fillDate || '')} />
                        </div>
                    </div>

                    {/* Logic to render mobile cards based on type */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
                        <h3 className="text-2xl font-black text-slate-800 mb-4 border-b-4 border-sky-200 pb-2 inline-block">調查重點</h3>
                        <div className="space-y-6 divide-y divide-slate-100">
                            {/* Example Mobile Rows for House */}
                            {(type === 'house' || type === 'factory') && (<>
                                <div className="pt-4 first:pt-0">
                                    <p className="font-black text-lg text-slate-500 mb-1">1. 增建情況</p>
                                    <p className="text-xl font-bold text-slate-800">{data?.q1_hasExt === '是' ? `有：${getHouseQ1Label()}` : '無'}</p>
                                </div>
                                <div className="pt-4">
                                    <p className="font-black text-lg text-slate-500 mb-1">2. 滲漏水</p>
                                    <p className="text-xl font-bold text-slate-800">{data?.q3_hasLeak === '是' ? `有：${getHouseQ3Label()}` : '無'}</p>
                                </div>
                                {type === 'house' && (
                                    <div className="pt-4">
                                        <p className="font-black text-lg text-slate-500 mb-1">5. 水電瓦斯</p>
                                        <p className="text-xl font-bold text-slate-800">{data?.q7_hasIssue === '是' ? `異常：${getHouseQ7Label()}` : '正常'}</p>
                                    </div>
                                )}
                            </>)}
                            
                            {/* Parking Block */}
                            {(type === 'house' || type === 'factory' || type === 'parking') && (
                                <div className="pt-4">
                                    <p className="font-black text-lg text-slate-500 mb-1">車位資訊</p>
                                    <div className="text-lg text-slate-800"><ParkingContent data={data} parkingSummary={parkingSummary} /></div>
                                </div>
                            )}

                            {/* Land Block */}
                            {type === 'land' && (
                                <>
                                    <div className="pt-4 first:pt-0">
                                        <p className="font-black text-lg text-slate-500 mb-1">土地通行</p>
                                        <p className="text-xl font-bold text-slate-800">{data?.land_q2_access === '正常 (可自由通行)' ? '正常' : data?.land_q2_access}</p>
                                    </div>
                                    <div className="pt-4">
                                        <p className="font-black text-lg text-slate-500 mb-1">鑑界/糾紛</p>
                                        <p className="text-xl font-bold text-slate-800">{data?.land_q3_dispute === '否' ? '無糾紛' : '有糾紛/疑似'}</p>
                                    </div>
                                </>
                            )}

                            <div className="pt-4">
                                <p className="font-black text-lg text-slate-500 mb-1">環境設施</p>
                                <p className="text-xl font-bold text-slate-800">{getEnvFacilitiesLabel()}</p>
                            </div>
                            <div className="pt-4">
                                <p className="font-black text-lg text-slate-500 mb-1">注意事項 (凶宅等)</p>
                                <p className={`text-xl font-bold ${data?.q17_issue === '是' || data?.land_q8_special === '是' ? 'text-red-600' : 'text-slate-800'}`}>
                                    {(data?.q17_issue === '是' || data?.land_q8_special === '是') ? (data?.q17_desc || data?.land_q8_special_desc) : '無'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 text-center text-slate-400 font-bold text-sm">
                    此為好讀預覽，匯出時將產生正式 A4 格式
                </div>
            </div>
        );
    }

    // === A4 Print Layout ===
    return (
        <div className="flex flex-col items-center w-full">
            {isMobile ? (
                // Mobile Control Bar
                <div className="w-full max-w-[210mm] flex flex-col gap-4 mb-6 no-print">
                    <div className="mb-0 animate-in fade-in slide-in-from-top-2">
                        <p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm">
                            💡 手機版：可左右拖曳，亦可雙指放大縮小檢視
                        </p>
                    </div>
                    <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-full">
                        <button onClick={() => setViewMode('mobile')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'mobile' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}>
                            <Smartphone className="w-5 h-5" /> 手機好讀版
                        </button>
                        <button onClick={() => setViewMode('a4')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'a4' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}>
                            <FileText className="w-5 h-5" /> A4 列印版
                        </button>
                    </div>
                    {/* Page switcher only visible if A4 is selected */}
                    <PageSwitcher />
                </div>
            ) : (
                // Desktop Control Bar (Only Page Switcher needed)
                <div className="w-full max-w-[210mm] mb-8 no-print">
                    <PageSwitcher />
                </div>
            )}

            <ScaledA4Wrapper pageNum={1}>
                <div className="flex-grow flex flex-col h-full">
                    <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full">
                        <h1 className="text-3xl font-black tracking-[0.2em] text-center w-full">幸福家不動產－業務版現況調查表</h1>
                        <div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【正面】{data?.version}</div>
                    </div>
                    <table className="excel-table mb-4 w-full">
                        <tbody>
                            <tr>
                                <td className="bg-gray-label w-[10%]">案名</td>
                                <td className="w-[30%] font-black">{data?.caseName}</td>
                                <td className="bg-gray-label w-[15%]">編號</td>
                                <td className="w-[20%] font-black">{data?.authNumber}</td>
                                <td className="bg-gray-label w-[8%]">店名</td>
                                <td className="w-[17%]">{data?.storeName}</td>
                            </tr>
                            <tr>
                                <td className="bg-gray-label">{type === 'land' ? '坐落' : (type === 'parking' ? '位置' : '地址')}</td>
                                <td className="font-bold">{data?.address}</td>
                                <td className="bg-gray-label">業務</td>
                                <td className="font-bold">{data?.agentName}</td>
                                <td className="bg-gray-label">日期</td>
                                <td className="text-left font-mono pl-2">{formatDateROC(data?.fillDate || '')}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="bg-black text-white px-3 py-1 text-sm font-black mb-1 self-start">【調查情況】</div>
                    <table className="excel-table mb-2 w-full">
                        <tbody>
                            {type === 'factory' && (
                                <tr>
                                    <td colSpan={10} className="py-2 px-4 text-left">
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                                            <span className="font-black text-[15px]">本物件型態：</span>
                                            <PreviewResult checked={!!data?.propertyType} label={data?.propertyType} suffix={data?.propertyType === '其他' ? `: ${data.propertyTypeOther}` : ''} />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan={10} className="py-2 px-4 text-left">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                                        <span className="font-black text-[15px]">本物件現況：</span>
                                        <PreviewResult checked={data?.access === '可進入'} label="可進入" />
                                        {data?.access === '不可進入' && (
                                            <>
                                                <PreviewResult checked={true} label="不可進入：" />
                                                {(data?.accessType || []).map(opt => (
                                                    <PreviewResult key={opt} checked={true} label={opt + (opt === "其他" ? '：' : '')} suffix={opt === "其他" ? data.accessOther : ""} />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            
                            {type === 'land' ? (
                                <>
                                    <tr><td className="w-28 text-center bg-gray-50 font-black whitespace-nowrap">否/無異常</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>
                                    
                                    <SectionHeader title="1. 有電力、水力與其他設施？" />
                                    <CheckRow checked={data?.land_q1_elec === '否'}>
                                        <span className="font-black mr-2">是否電力供應？：</span>
                                        <PreviewResult checked={data?.land_q1_elec !== '否' && !!data?.land_q1_elec} label={getLandElecSummary()} />
                                    </CheckRow>
                                    <CheckRow checked={data?.land_q1_water === '否'}>
                                        <span className="font-black mr-2">是否水源供應？：</span>
                                        <PreviewResult checked={data?.land_q1_water !== '否' && !!data?.land_q1_water} label={getLandWaterSummary()} />
                                    </CheckRow>
                                    <CheckRow checked={data?.land_q1_other_new === '否'}>
                                        <span className="font-black mr-2">是否其他設施？：</span>
                                        <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
                                    </CheckRow>

                                    <SectionHeader title="2. 土地進出通行與臨路的情況？" />
                                    <CheckRow checked={data?.land_q2_access === '正常 (可自由通行)'}>
                                        <span className="font-black mr-2">土地進出通行是否有異常？：</span>
                                        <PreviewResult checked={data?.land_q2_access === '異常 (有阻礙)'} label={`異常 (${data.land_q2_access_desc})`} />
                                        <PreviewResult checked={data?.land_q2_access === '袋地 (無路可通)'} label="袋地 (無路可通)" />
                                    </CheckRow>
                                    {data?.land_q2_owner && (<CheckRow checked={false}>
                                        <PreviewResult checked={!!data.land_q2_owner} label="臨路的歸屬權？：" suffix={data?.land_q2_owner === '私人' ? `私人 (${data.land_q2_owner_desc})` : data?.land_q2_owner} />
                                    </CheckRow>)}
                                    {data?.land_q2_material && (<CheckRow checked={false}>
                                        <PreviewResult checked={!!data.land_q2_material} label="臨路的路面材質？：" suffix={data?.land_q2_material === '其他' ? `其他 (${data.land_q2_material_other})` : data?.land_q2_material} />
                                    </CheckRow>)}
                                    <CheckRow checked={data?.land_q2_ditch === '否'}>
                                        <span className="font-black mr-2">周圍是否有排水溝？：</span>
                                        <PreviewResult checked={data?.land_q2_ditch !== '否' && !!data?.land_q2_ditch} label={data?.land_q2_ditch === '其他' ? `其他 (${data.land_q2_ditch_other})` : data?.land_q2_ditch} />
                                    </CheckRow>

                                    <SectionHeader title="3. 曾在兩年內進行土地鑑界/目前是否有糾紛？" />
                                    <CheckRow checked={data?.land_q3_survey === '否'}>
                                        <span className="font-black mr-2">曾在兩年內進行土地鑑界？：</span>
                                        <PreviewResult checked={data?.land_q3_survey === '是'} label={`是 (${data.land_q3_survey_detail})`} />
                                        <PreviewResult checked={data?.land_q3_survey === '不確定 / 不知道'} label="不確定 / 不知道" />
                                        <PreviewResult checked={data?.land_q3_survey === '其他'} label={`其他 (${data.land_q3_survey_other})`} />
                                    </CheckRow>
                                    <CheckRow checked={data?.land_q3_dispute === '否'}>
                                        <span className="font-black mr-2">目前是否有糾紛？：</span>
                                        <PreviewResult checked={data?.land_q3_dispute === '是'} label={`是 (${data.land_q3_dispute_desc})`} />
                                        <PreviewResult checked={data?.land_q3_dispute === '疑似 / 處理中'} label={`疑似 / 處理中 (${data.land_q3_dispute_other})`} />
                                        <PreviewResult checked={data?.land_q3_dispute === '其他'} label={`其他 (${data.land_q3_dispute_other})`} />
                                    </CheckRow>

                                    <SectionHeader title="4. 徵收地預定地/重測區域範圍內？" />
                                    <CheckRow checked={data?.land_q4_expro === '否'}>
                                        <span className="font-black mr-2">位於政府徵收地預定地？：</span>
                                        <PreviewResult checked={data?.land_q4_expro === '是'} label={`是 (位於範圍內) ${data.land_q4_expro_other}`} />
                                        <PreviewResult checked={data?.land_q4_expro === '查詢中 / 不確定'} label={`查詢中 / 不確定 ${data.land_q4_expro_other}`} />
                                        <PreviewResult checked={data?.land_q4_expro === '其他'} label={`其他 (${data.land_q4_expro_other})`} />
                                    </CheckRow>
                                    <CheckRow checked={data?.land_q4_resurvey === '否'}>
                                        <span className="font-black mr-2">位於重測區域範圍內？：</span>
                                        <PreviewResult checked={data?.land_q4_resurvey === '是'} label={`是 (位於範圍內) ${data.land_q4_resurvey_other}`} />
                                        <PreviewResult checked={data?.land_q4_resurvey === '查詢中 / 不確定'} label={`查詢中 / 不確定 ${data.land_q4_resurvey_other}`} />
                                        <PreviewResult checked={data?.land_q4_resurvey === '其他'} label={`其他 (${data.land_q4_resurvey_other})`} />
                                    </CheckRow>
                                </>
                            ) : (<tr><td className="w-28 text-center bg-gray-50 font-black whitespace-nowrap">否/無異常</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>)}

                            {(type === 'house' || type === 'factory') && (<>
                                <SectionHeader title="1. 增建情況與占用/被占用情況" />
                                <CheckRow checked={data?.q1_hasExt === '否'}>
                                    <span className="font-black mr-2">是否有增建情況？：</span>
                                    <PreviewResult checked={data?.q1_hasExt === '是'} label={getHouseQ1Label()} />
                                </CheckRow>
                                <CheckRow checked={data?.q2_hasOccupancy === '否'}>
                                    <span className="font-black mr-2">建物或增建部分是否有占用鄰地、道路用地？：</span>
                                    <PreviewResult checked={data?.q2_hasOccupancy !== '否' && !!data?.q2_hasOccupancy} label={data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '')} />
                                </CheckRow>
                                <CheckRow checked={data?.q2_other_occupancy === '否'}>
                                    <span className="font-black mr-2">是否他戶建物占用本案之土地/本戶空間？：</span>
                                    <PreviewResult checked={data?.q2_other_occupancy !== '否' && !!data?.q2_other_occupancy} label={data?.q2_other_occupancy + (data?.q2_other_occupancy_desc ? ': ' + data.q2_other_occupancy_desc : '')} />
                                </CheckRow>
                                
                                {type === 'factory' && (
                                    <>
                                        <SectionHeader title="2. 廠房結構與消防安全" />
                                        <CheckRow checked={false}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><span className="font-black">滴水高度：</span>{data.factory_height}米</div>
                                                <div><span className="font-black">柱距：</span>{data.factory_column_spacing}米</div>
                                                <div><span className="font-black">樓板載重：</span>{data.factory_floor_load}</div>
                                                <div><span className="font-black">地坪狀況：</span>{data.factory_floor_condition + (data.factory_floor_condition === '其他' ? `(${data.factory_floor_condition_other})` : '')}</div>
                                            </div>
                                            <div className="mt-2"><span className="font-black">消防設施：</span>{getFactoryFireLabel()}</div>
                                        </CheckRow>
                                    </>
                                )}

                                <SectionHeader title="3. 是否有滲漏水、壁癌等情況？" />
                                <CheckRow checked={data?.q3_hasLeak === '否'}>
                                    <PreviewResult checked={data?.q3_hasLeak === '是'} label={getHouseQ3Label()} />{!data?.q3_hasLeak && <span className="text-transparent">.</span>}
                                </CheckRow>
                                
                                <SectionHeader title="4. 建物結構情況" />
                                <CheckRow checked={data?.q4_hasIssue === '否'}>
                                    <span className="font-black mr-2">結構牆面是否有結構安全之虞的瑕疵：</span>
                                    <PreviewResult checked={data?.q4_hasIssue === '是'} label={getHouseQ4Label()} />
                                </CheckRow>
                                <CheckRow checked={data?.q5_hasTilt === '否'}>
                                    <span className="font-black mr-2">是否有傾斜情況？：</span>
                                    <PreviewResult checked={data?.q5_hasTilt !== '否' && !!data?.q5_hasTilt} label={data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '')} />
                                </CheckRow>

                                <SectionHeader title={type === 'factory' ? '5. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？' : '4. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？'} />
                                <CheckRow checked={data?.q6_hasIssue === '相符 (無明顯差異)'}>
                                    <PreviewResult checked={data?.q6_hasIssue !== '相符 (無明顯差異)' && !!data?.q6_hasIssue} label={data?.q6_hasIssue + (data?.q6_desc ? ': ' + data.q6_desc : '')} />{!data?.q6_hasIssue && <span className="text-transparent">.</span>}
                                </CheckRow>
                                
                                {type === 'factory' ? (
                                    <>
                                        <SectionHeader title="6. 電、水與其他設施資訊" />
                                        <CheckRow checked={!!(data?.land_q1_elec?.startsWith("無電力"))}>
                                            <div className="flex items-center">
                                                <span className="font-black mr-2">供電類型：</span>
                                                <PreviewResult checked={!!data?.land_q1_elec} label={data?.land_q1_elec} />
                                                {data?.land_q1_elec === '其他' && data?.land_q1_elec_other && ` (${data.land_q1_elec_other})`}
                                            </div>
                                            
                                            {(data?.land_q1_elec?.includes("一般用電") || data?.land_q1_elec?.includes("動力用電")) && (
                                                <>
                                                    {data?.land_q1_elec_meter && <BulletItem label="電錶型態" value={data.land_q1_elec_meter} />}
                                                    {data?.land_q1_elec_voltage && <BulletItem label="電壓規格" value={data.land_q1_elec_voltage} />}
                                                    {data?.land_q1_elec_capacity && <BulletItem label="契約容量" value={data.land_q1_elec_capacity} />}
                                                </>
                                            )}
                                        </CheckRow>
                                        <CheckRow checked={data?.land_q1_water === '否'}>
                                            <span className="font-black mr-2">是否水源供應？：</span>
                                            <PreviewResult checked={data?.land_q1_water !== '否' && !!data?.land_q1_water} label={getLandWaterSummary()} />
                                        </CheckRow>
                                        <CheckRow checked={data?.land_q1_other_new === '否'}>
                                            <span className="font-black mr-2">是否其他設施？：</span>
                                            <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
                                        </CheckRow>
                                    </>
                                ) : (
                                    <>
                                        <SectionHeader title="5. 水、電、瓦斯使用情況" />
                                        <CheckRow checked={data?.q7_hasIssue === '否'}>
                                            {data?.q7_gasType && <div className="mb-1"><span className="font-bold">瓦斯類型：</span>{data.q7_gasType}</div>}
                                            <span className="font-black mr-2">水電瓦斯是否有異常：</span>
                                            <PreviewResult checked={data?.q7_hasIssue === '是'} label={getHouseQ7Label() || '異常'} />
                                        </CheckRow>
                                        
                                        <SectionHeader title="公共設施情況" />
                                        <CheckRow checked={false}>
                                            <PreviewResult checked={data?.publicFacilities === '有公共設施'} label="有公共設施" />
                                            <PreviewResult checked={data?.publicFacilities === '無公共設施'} label="無公共設施" />
                                            <PreviewResult checked={data?.publicFacilities === '無法進入'} label="無法進入" suffix={data?.publicFacilitiesReason ? `: ${data.publicFacilitiesReason}` : ''} />
                                        </CheckRow>
                                    </>
                                )}
                            </>)}

                            {type === 'parking' && (
                                <>
                                    <SectionHeader title="1. 車位資訊" />
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{data?.q10_noParking ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left"><ParkingContent data={data} parkingSummary={parkingSummary} /></td>
                                    </tr>
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q11_hasIssue === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位使用是否異常？：</span>
                                                <PreviewResult checked={data?.q11_hasIssue === '是'} label={getQ11Label() || '異常'} />
                                                <PreviewResult checked={data?.q11_hasIssue === '否'} label="正常 (無異常)" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位現況補充：</span>
                                                <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                                                <PreviewResult checked={data?.q12_hasNote === '否'} label="無" />
                                            </div>
                                        </td>
                                    </tr>

                                    <SectionHeader title="2. 重要環境設施" />
                                    <CheckRow checked={data?.q16_noFacilities}>
                                        <span className="font-medium">{getEnvFacilitiesLabel()}</span>
                                    </CheckRow>

                                    <SectionHeader title="3. 本案或本社區是否有須注意的事項？" />
                                    <CheckRow checked={data?.q17_issue === '否'}>
                                        <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
                                        <PreviewResult checked={data?.q17_issue === '否'} label="無" />
                                    </CheckRow>
                                </>
                            )}
                        </tbody>
                    </table>
                    
                    <Footer showSignature={type === 'parking'} />
                </div>
            </ScaledA4Wrapper>

            {(type !== 'parking' || previewPage === 2) && (
                <ScaledA4Wrapper pageNum={2}>
                    <div className="flex-grow flex flex-col h-full">
                        <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full">
                            <h1 className="text-3xl font-black tracking-[0.2em] text-center w-full">幸福家不動產－業務版現況調查表</h1>
                            <div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【背面】</div>
                        </div>
                        <table className="excel-table mb-2 w-full">
                            <tbody>
                                <tr><td className="w-28 text-center bg-gray-50 font-black whitespace-nowrap">否/無異常</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>
                                
                                {type === 'land' && (
                                    <>
                                        <SectionHeader title="5. 被越界占用/占用鄰地情況？" />
                                        <CheckRow checked={data?.land_q5_encroached === '否'}>
                                            <span className="font-black mr-2">本案是否有被 [他人] 越界占用？：</span>
                                            <PreviewResult checked={data?.land_q5_encroached !== '否' && !!data?.land_q5_encroached} label={data?.land_q5_encroached + (data.land_q5_encroached_desc ? `: ${data.land_q5_encroached_desc}` : '')} />
                                        </CheckRow>
                                        <CheckRow checked={data?.land_q5_encroaching === '否'}>
                                            <span className="font-black mr-2">本案是否有 [占用他人] 鄰地情況？：</span>
                                            <PreviewResult checked={data?.land_q5_encroaching !== '否' && !!data?.land_q5_encroaching} label={data?.land_q5_encroaching + (data.land_q5_encroaching_desc ? `: ${data.land_q5_encroaching_desc}` : '')} />
                                        </CheckRow>

                                        <SectionHeader title="6. 目前是否有禁建、限建的情況？" />
                                        <CheckRow checked={data?.land_q6_limit === '否'}>
                                            <PreviewResult checked={data?.land_q6_limit === '是'} label={`是 (${data.land_q6_limit_desc})`} />
                                            <PreviewResult checked={data?.land_q6_limit === '無'} label="無" />
                                        </CheckRow>

                                        <SectionHeader title="7. 土地使用現況與地上物" />
                                        <CheckRow checked={false}>
                                            <div className="space-y-1">
                                                <BulletItem label="現況使用人" value={getLandUserSummary()} />
                                                <BulletItem label="地上定著物-農作物" value={getLandCropsSummary()} />
                                                <BulletItem label="地上定著物-建物" value={getLandBuildSummary()} />
                                            </div>
                                        </CheckRow>

                                        <SectionHeader title="8. 重要環境設施" />
                                        <CheckRow checked={data?.q16_noFacilities}>
                                            <span className="font-medium">{getEnvFacilitiesLabel()}</span>
                                        </CheckRow>

                                        <SectionHeader title="9. 本案或周圍是否有須注意的事項？" />
                                        <CheckRow checked={data?.land_q8_special === '否'}>
                                            <PreviewResult checked={data?.land_q8_special === '是'} label={data?.land_q8_special_desc} />
                                        </CheckRow>
                                    </>
                                )}

                                {type === 'house' && (<>
                                    <SectionHeader title="6. 電(樓)梯間、公共地下室等現況是否有龜裂、鋼筋外露、水泥塊剝落等情況？" />
                                    <CheckRow checked={data?.q8_stairIssue === '否'}>
                                        <PreviewResult checked={data?.q8_stairIssue === '是'} label={data?.q8_stairDesc} />{!data?.q8_stairIssue && <span className="text-transparent">.</span>}
                                    </CheckRow>
                                    
                                    <SectionHeader title="7. 本案或本社區是否有須注意的設施？" />
                                    <CheckRow checked={data?.q9_hasIssue === '否'}>
                                        <PreviewResult checked={data?.q9_hasIssue === '是'} label={getHouseQ9Label()} />{!data?.q9_hasIssue && <span className="text-transparent">.</span>}
                                    </CheckRow>
                                    
                                    <SectionHeader title="8. 車位資訊" />
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{data?.q10_noParking ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left"><ParkingContent data={data} parkingSummary={parkingSummary} /></td>
                                    </tr>
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q11_hasIssue === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位使用是否異常？：</span>
                                                <PreviewResult checked={data?.q11_hasIssue === '是'} label={getQ11Label() || '異常'} />
                                                <PreviewResult checked={data?.q11_hasIssue === '否'} label="正常 (無異常)" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位現況補充：</span>
                                                <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                                                <PreviewResult checked={data?.q12_hasNote === '否'} label="無" />
                                            </div>
                                        </td>
                                    </tr>

                                    {renderCommonExtraQuestions(9)}
                                </>)}

                                {type === 'factory' && (<>
                                    <SectionHeader title="7. 廠房硬體設施" />
                                    <CheckRow checked={data?.factory_elevator === '無'}>
                                        <span className="font-black mr-2">貨梯/升降機：</span>
                                        <PreviewResult checked={data?.factory_elevator === '有'} label={`有 (${data.factory_elevator_working ? '可運作' : '故障'}) - 載重${data.factory_elevator_capacity} / 尺寸${data.factory_elevator_dim}`} />
                                    </CheckRow>
                                    <CheckRow checked={data?.factory_crane === '無'}>
                                        <span className="font-black mr-2">天車 (起重機)：</span>
                                        <PreviewResult checked={data?.factory_crane === '有'} label={`有 (${data.factory_crane_working ? '可運作' : '故障'}) - ${data.factory_crane_tonnage} / ${data.factory_crane_quantity}`} />
                                        <PreviewResult checked={data?.factory_crane === '僅預留牛腿'} label="僅預留牛腿" />
                                    </CheckRow>
                                    <CheckRow checked={data?.factory_waste === '無'}>
                                        <span className="font-black mr-2">工業排水/廢氣：</span>
                                        <PreviewResult checked={data?.factory_waste !== '無' && !!data?.factory_waste} label={data?.factory_waste + (data?.factory_waste === '其他' ? `: ${data.factory_waste_desc}` : '')} />
                                    </CheckRow>
                                    
                                    <SectionHeader title="8. 物流動線" />
                                    <CheckRow checked={false}>
                                        <BulletItem label="卸貨碼頭" value={data?.factory_loading_dock || '未填寫'} />
                                        <BulletItem label="大車進出" value={data?.factory_truck_access || '未填寫'} />
                                    </CheckRow>

                                    <SectionHeader title="9. 電(樓)梯間、公共地下室等現況是否有龜裂、鋼筋外露、水泥塊剝落等情況？" />
                                    <CheckRow checked={data?.q8_stairIssue === '否'}>
                                        <PreviewResult checked={data?.q8_stairIssue === '是'} label={data?.q8_stairDesc} />{!data?.q8_stairIssue && <span className="text-transparent">.</span>}
                                    </CheckRow>
                                    
                                    <SectionHeader title="10. 本案或本社區是否有須注意的設施？" />
                                    <CheckRow checked={data?.q9_hasIssue === '否'}>
                                        <PreviewResult checked={data?.q9_hasIssue === '是'} label={getHouseQ9Label()} />{!data?.q9_hasIssue && <span className="text-transparent">.</span>}
                                    </CheckRow>
                                    
                                    <SectionHeader title="11. 車位資訊" />
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{data?.q10_noParking ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left"><ParkingContent data={data} parkingSummary={parkingSummary} /></td>
                                    </tr>
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q11_hasIssue === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位使用是否異常？：</span>
                                                <PreviewResult checked={data?.q11_hasIssue === '是'} label={getQ11Label() || '異常'} />
                                                <PreviewResult checked={data?.q11_hasIssue === '否'} label="正常 (無異常)" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="w-28 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位現況補充：</span>
                                                <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                                                <PreviewResult checked={data?.q12_hasNote === '否'} label="無" />
                                            </div>
                                        </td>
                                    </tr>

                                    {renderCommonExtraQuestions(12)}
                                </>)}
                            </tbody>
                        </table>
                        <Footer showSignature={true} />
                    </div>
                </ScaledA4Wrapper>
            )}
        </div>
    );
};
