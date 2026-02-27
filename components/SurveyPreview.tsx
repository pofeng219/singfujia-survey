
import { SurveyData, SurveyType } from '../types';
import { PreviewResult } from './SharedUI';
import { formatDateROC } from './ROCDatePicker';
import React, { useMemo, useState, useEffect } from 'react';
import { FileText, Smartphone, Check } from 'lucide-react';
import { GROUP_A_TYPES } from '../constants';

interface SurveyPreviewProps {
    data: SurveyData;
    type: SurveyType;
    exporting: boolean;
    previewScale: number;
    previewPage: number;
    setPreviewPage: (page: number) => void;
    page1Ref: React.RefObject<HTMLDivElement | null>;
    page2Ref: React.RefObject<HTMLDivElement | null>;
    page3Ref?: React.RefObject<HTMLDivElement | null>;
    isMobile?: boolean;
}

// --- SHARED HELPER COMPONENTS ---

const formatAccessLandAddress = (section?: string, subSection?: string, number?: string) => {
    if (!section && !number) return '';
    const sub = subSection ? ` ${subSection}小段` : '';
    return `地號: ${section || ''}段${sub} ${number || ''}號`;
};

const CheckRow: React.FC<{ checked: boolean; children: React.ReactNode }> = ({ checked, children }) => (
    <tr className="text-black">
        <td className="w-28 text-center bg-gray-50 font-black text-black">{checked ? 'V' : ''}</td>
        <td colSpan={9} className="py-1 px-4 text-left text-black">
            <div className="text-black">
                {children}
            </div>
        </td>
    </tr>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50 text-black">{title}</td></tr>
);

const TableHeaderRow: React.FC = () => (
    <tr className="text-black">
        <td className="w-28 text-center bg-gray-50 font-black whitespace-nowrap text-black">確認無誤</td>
        <td colSpan={9} className="py-1 font-bold bg-gray-100 text-center text-black">說明／檢查項目</td>
    </tr>
);

const BulletItem: React.FC<{ label: string, value?: string, variant?: 'mobile' | 'a4' }> = ({ label, value, variant = 'a4' }) => (
    <div className={`font-bold text-[19px] mt-0.5 flex items-start leading-tight ${variant === 'mobile' ? 'text-slate-800 dark:text-slate-200' : 'text-black'}`}>
        <span className="mr-2 shrink-0">•</span>
        <span className="mr-1 shrink-0">{label}：</span>
        <span>{value || ''}</span>
    </div>
);

const SingfujiaLogo = ({ className = "", textClassName = "", subTextClassName = "" }: { className?: string, textClassName?: string, subTextClassName?: string }) => (
    <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`font-black tracking-widest text-[#009FE3] leading-none whitespace-nowrap ${textClassName}`} style={{ fontFamily: '"Microsoft JhengHei", "Heiti TC", sans-serif' }}>
            幸福家不動產
        </div>
        <div className={`font-bold tracking-[0.1em] text-[#009FE3] leading-none mt-[2px] whitespace-nowrap ${subTextClassName}`}>
            SINGFUJIA REALTY INC.
        </div>
    </div>
);

const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden">
        <div className="transform -rotate-45 opacity-[0.05] grayscale-0">
            <SingfujiaLogo className="scale-150" textClassName="text-[100px]" subTextClassName="text-[32px] mt-4" />
        </div>
    </div>
);

// --- CONTENT HELPER COMPONENTS ---

const ParkingContent: React.FC<{ data: SurveyData, parkingSummary: any, activeMode: 'a4' | 'mobile', isFactory?: boolean }> = ({ data, parkingSummary, activeMode, isFactory }) => {
    const prVariant = activeMode === 'mobile' ? 'mobile' : 'default';
    const textColor = activeMode === 'mobile' ? 'text-slate-800 dark:text-slate-200' : 'text-black';

    if (isFactory && data.propertyType && ['獨棟自建廠房', '倉儲物流廠房', '其他特殊工業設施'].includes(data.propertyType)) {
        return (
            <div className={`space-y-1 ${textColor}`}>
                <span className="font-bold mr-2">車位資訊：</span>{data.factory_parking_desc || ''}
            </div>
        );
    }

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
        <div className={`space-y-1 ${textColor}`}>
            {parkingSummary.showMethod && (<div><span className="font-bold mr-2">停車方式:</span>{(data?.q10_parkTypes || []).map(pt => (<PreviewResult key={pt} checked={true} label={getParkingTypeLabel(pt)} variant={prVariant} />))}<PreviewResult checked={data?.q10_hasParkTypeOther} label="其他" suffix={': ' + (data?.q10_parkTypeOther || '')} variant={prVariant} /></div>)}
            {parkingSummary.showNumber && (<div><span className="font-bold mr-2">車位編號:</span><PreviewResult checked={data?.q10_parkingNumberType === 'number'} label="有車位編號" suffix={': ' + (data?.q10_parkingNumberVal || '')} variant={prVariant} /><PreviewResult checked={data?.q10_parkingNumberType === 'none'} label="無車位編號" variant={prVariant} /></div>)}
            {parkingSummary.showCarStatus && getParkingCarUsageLabel() && (<div><span className="font-bold mr-2">汽車車位使用現況:</span><span className="font-medium">{getParkingCarUsageLabel()}</span></div>)}
            {getParkingMotoUsageLabel() && <div><span className="font-bold mr-2">機車車位使用現況:</span><span className="font-medium">{getParkingMotoUsageLabel()}</span></div>}
            {(parkingSummary.showCarSize || parkingSummary.showWeight || parkingSummary.showHeight) && (
                <div className="flex flex-wrap gap-x-4">
                    <span className="font-bold">汽車車位尺寸:</span>
                    {/* NEW TYPES */}
                    {data?.q10_measureType === '依謄本登記' && <span className="font-medium">[依謄本登記]</span>}
                    {data?.q10_measureType === '依車位資訊告示牌' && <span className="font-medium">[依車位資訊告示牌]</span>}
                    {(data?.q10_measureType === '無法測量' || data?.q10_measureType === '無法測量也無相關資訊') && <span className="font-medium">[無法測量也無相關資訊]</span>}
                    
                    {data?.q10_measureType === '實際測量' && parkingSummary.showCarSize && (<><span>長:{data?.q10_dimL || '_'}m</span><span>寬:{data?.q10_dimW || '_'}m</span><span>高:{data?.q10_dimH || '_'}m</span></>)}
                    {parkingSummary.showWeight && !isFactory && <span>機械載重:{data?.q10_mechWeight || '_'}kg</span>}
                    {parkingSummary.showHeight && <span>車道出入口高度:{data?.q10_entryHeight || '_'}m</span>}
                </div>
            )}
            {(data?.q10_laneSection || data?.q10_laneNumber) && (
                <div><span className="font-bold mr-2">車道經過地號:</span><span className="font-medium">{formatAccessLandAddress(data.q10_laneSection, data.q10_laneSubSection, data.q10_laneNumber).replace('地號: ', '')}</span></div>
            )}
            {parkingSummary.showCharging && (<div><span className="font-bold mr-2">車位充電設備配置:</span><PreviewResult checked={data?.q10_charging === '有' || data?.q10_charging === '是'} label="有" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '無' || data?.q10_charging === '否'} label="無" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '僅預留管線／孔位'} label="僅預留管線／孔位" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '須經管委會同意'} label="須經管委會同意" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '其他' || data?.q10_charging === '其他未列項目'} label="其他" suffix={': ' + (data?.q10_chargingOther || '')} variant={prVariant} /></div>)}
            {parkingSummary.isNoParking && (<div><span className="font-bold mr-2">停車方式:</span><PreviewResult checked={true} label="無車位" variant={prVariant} /></div>)}
        </div>
    );
};

const LandDisputeExproPreview = ({ data, titles }: { data: SurveyData, titles: { q3: string, q4: string } }) => (
    <>
        <SectionHeader title={titles.q3} />
        <CheckRow checked={
            data?.land_q3_survey === '已鑑界 (標完好)' || 
            data?.land_q3_survey === '是' || 
            data?.land_q3_survey === '界標完整' || 
            data?.land_q3_survey === '從未鑑界' || 
            data?.land_q3_survey === '否'
        }>
            <span className="font-black mr-2">土地鑑界與界標現況</span>
            
            <PreviewResult 
                checked={data?.land_q3_survey === '已鑑界 (標完好)' || data?.land_q3_survey === '是' || data?.land_q3_survey === '界標完整'} 
                label={`已鑑界 (標完好) ${data.land_q3_survey_detail ? '(' + data.land_q3_survey_detail + ')' : ''}`} 
            />
            
            <PreviewResult checked={data?.land_q3_survey === '待查證' || data?.land_q3_survey === '不確定／不知道'} label="待查證" />
            
            <PreviewResult 
                checked={data?.land_q3_survey === '標位不明 (需重測)' || data?.land_q3_survey === '須重新鑑界' || data?.land_q3_survey === '是 (但界釘已不明顯／須重新鑑界)'} 
                label="標位不明 (需重測)" 
            />
            
            <PreviewResult checked={data?.land_q3_survey === '從未鑑界' || data?.land_q3_survey === '否'} label="從未鑑界" />
        </CheckRow>
        <CheckRow checked={data?.land_q3_dispute === '否' || data?.land_q3_dispute === '無'}>
            <span className="font-black mr-2">產權與使用糾紛現況</span>
            <PreviewResult checked={data?.land_q3_dispute === '是' || data?.land_q3_dispute === '有'} label={`有 (${data.land_q3_dispute_desc})`} />
            <PreviewResult checked={data?.land_q3_dispute === '待查證' || data?.land_q3_dispute === '疑似／處理中'} label={`待查證 (${data.land_q3_dispute_other})`} />
        </CheckRow>

        <SectionHeader title={titles.q4} />
        <CheckRow checked={data?.land_q4_expro === '否' || data?.land_q4_expro === '非範圍內'}>
            <span className="font-black mr-2">土地徵收與保留地現況</span>
            <PreviewResult checked={data?.land_q4_expro === '是' || data?.land_q4_expro === '屬範圍內'} label={`屬範圍內 ${data.land_q4_expro_other}`} />
            <PreviewResult checked={data?.land_q4_expro === '待查證' || data?.land_q4_expro === '查詢中／不確定'} label={`待查證 ${data.land_q4_expro_other}`} />
        </CheckRow>
        <CheckRow checked={data?.land_q4_resurvey === '否' || data?.land_q4_resurvey === '非範圍內'}>
            <span className="font-black mr-2">重劃與區段徵收現況</span>
            <PreviewResult checked={data?.land_q4_resurvey === '是' || data?.land_q4_resurvey === '屬範圍內'} label={`屬範圍內 ${data.land_q4_resurvey_other}`} />
            <PreviewResult checked={data?.land_q4_resurvey === '待查證' || data?.land_q4_resurvey === '查詢中／不確定'} label={`待查證 ${data.land_q4_resurvey_other}`} />
        </CheckRow>
    </>
);

const LandAccessPreviewBuildingStyle = ({ data, title }: { data: SurveyData, title: string }) => {
    // New Logic: Check for '正常' instead of '正常 (可自由通行)'
    const access = data?.land_q2_access;
    const ownership = data?.land_q2_owner;
    const protection = data?.land_q2_protection;
    const protectionDesc = data?.land_q2_protectionDesc;
    const abnormalDesc = data?.land_q2_access_desc;
    
    const roadMat = data?.land_q2_material;
    const roadMatOther = data?.land_q2_material_other;
    const roadWidth = data?.land_q2_roadWidth;
    const buildingLine = data?.land_q2_buildingLine;
    const ditch = data?.land_q2_ditch;
    const ditchOther = data?.land_q2_ditch_other;

    const isNormal = access === '通行順暢' || access?.includes('順暢');
    const isAbnormal = access === '通行受限' || access?.includes('受限');
    const isLandlocked = access === '袋地' || access?.includes('袋地');

    return (
        <>
            <SectionHeader title={title} />
            <CheckRow checked={isNormal}>
                <PreviewResult checked={isNormal} label={`通行順暢 [${ownership || ''}${protection ? `/${protection}` : ''}${protectionDesc ? ` (${protectionDesc})` : ''}] ${formatAccessLandAddress(data.land_q2_access_section, data.land_q2_access_subSection, data.land_q2_access_number)}`} />
                <PreviewResult checked={isAbnormal} label={`通行受限 (${abnormalDesc})`} />
                <PreviewResult checked={isLandlocked} label="袋地" />
            </CheckRow>
            {(isNormal || isAbnormal) && (
                <CheckRow checked={false}>
                    <PreviewResult checked={!!roadMat} label="路面材質" suffix={(roadMat === '其他未列項目' || roadMat === '其他') ? `: ${roadMatOther}` : `: ${roadMat}`} />
                    {roadWidth && <span className="mx-2">/</span>}
                    {roadWidth && <span className="font-bold">路寬:{roadWidth}米</span>}
                    {buildingLine && <span className="mx-2">/</span>}
                    {buildingLine && <span className="font-bold">建築線:{buildingLine}</span>}
                    <span className="mx-2">/</span>
                    <PreviewResult checked={!!ditch} label="排水溝" suffix={(ditch === '其他未列項目' || ditch === '其他') ? `: ${ditchOther}` : `: ${ditch}`} />
                </CheckRow>
            )}
        </>
    );
};

const Footer = ({ showSignature, hideBranding = false, signatureImage }: { showSignature: boolean; hideBranding?: boolean; signatureImage?: string }) => {
    const timestamp = new Date().toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    
    return (
        <div className="mt-auto w-full pt-4 border-t-4 border-black flex justify-between items-end text-black relative z-10">
            {showSignature ? (
                <div className="space-y-4 font-black text-xl text-black">
                    調查業務人員簽章：
                    <div className="w-[200px] h-12 border-b-2 border-slate-300 flex items-end">
                        {signatureImage ? (
                            <img src={signatureImage} alt="Signature" className="max-h-12 max-w-full" />
                        ) : (
                            <div className="w-full h-full" />
                        )}
                    </div>
                </div>
            ) : (
                <div></div>
            )}
            {!hideBranding && (
                <div className="flex flex-col items-end flex-shrink-0 text-right max-w-[60%]">
                    <div className="flex flex-col items-center select-none">
                         <SingfujiaLogo className="h-16" textClassName="text-[2.2rem]" subTextClassName="text-[0.75rem]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider block leading-tight mt-[2px]">※本調查內容僅供公司內部參考，實際應以權狀及產調為準</span>
                    <span className="text-[9px] text-gray-400 font-mono tracking-tighter mt-[2px] leading-none">Exported: {timestamp}</span>
                </div>
            )}
        </div>
    );
};

// --- LOGIC EXTRACTORS ---

const getEnvFacilitiesLabel = (data: SurveyData) => {
    const major = data?.q16_noFacilities ? "無重大環境設施" : (data?.q16_items || []).join('、');
    
    const resistanceItems = [...(data?.q16_2_items || [])];
    if (data?.q16_2_hasOther && data.q16_2_other) {
        resistanceItems.push(`其他: ${data.q16_2_other}`);
    }
    
    const resistance = data?.q16_2_noFacilities ? "無常見環境抗性設施" : resistanceItems.join('、');
    
    if (major && resistance) return `${major}；${resistance}`;
    return major || resistance || '';
};

const getHouseLabels = (data: SurveyData) => {
    const q1 = () => {
        const labels = data?.q1_items?.map(i => i === "地下室增建" && data.q1_basementPartition ? "地下室增建 (內含隔間)" : i) || [];
        if (data?.q1_hasOther && data.q1_other) labels.push(`其他: ${data.q1_other}`);
        return labels.join(', ');
    };
    const q3 = () => {
        if (data?.q3_ceilingWrapped || data?.q3_leakType === '全屋天花板包覆' || data?.q3_leakType === '全屋天花板包覆 (無法檢查)') return "全屋天花板包覆 (無法檢查) - 因裝潢包覆無法檢視內部，需特別留意";
        const locations = [...(data?.q3_locations || [])];
        if (data?.q3_suspected && data.q3_suspectedDesc) locations.push(`待查證: ${data.q3_suspectedDesc}`);
        if (data?.q3_hasOther && data.q3_other) locations.push(`其他: ${data.q3_other}`);
        const locStr = locations.join('、');
        let result = '';
        if (data?.q3_leakType === "兩者皆有") result = `滲漏水與壁癌${locStr ? '：' + locStr : ''}`;
        else if (data?.q3_leakType) result = `${data.q3_leakType}${locStr ? '：' + locStr : ''}`;
        else result = locStr;
        return result;
    };
    const q4 = () => {
        const labels = [...(data?.q4_items || [])];
        if (data?.q4_ceilingWrapped) labels.push("全屋天花板包覆 (無法檢查) - 因裝潢包覆無法檢視內部，需特別留意");
        if (data?.q4_suspected && data.q4_suspectedDesc) labels.push(`待查證: ${data.q4_suspectedDesc}`);
        if (data?.q4_hasOther && data.q4_otherDesc) labels.push(`其他: ${data.q4_otherDesc}`);
        return labels.join(', ');
    };
    const q6 = () => {
        const labels = [...(data?.q8_stairItems || [])];
        if (data?.q8_stairItems?.includes('其他') || data?.q8_stairItems?.includes('其他未列項目')) {
             if (data.q8_stairOther) labels.push(data.q8_stairOther);
        }
        return labels.filter(i => i !== '其他未列項目' && i !== '其他').join(', ');
    };
    const q7 = () => {
        const labels = [...(data?.q7_items || [])];
        if (data?.q7_hasOther && data.q7_otherDesc) labels.push(`其他: ${data.q7_otherDesc}`);
        return labels.join(', ');
    };
    const q9 = () => {
        const labels = data?.q9_items?.map(i => {
            if (i === "太陽能光電發電設備" && data.q9_solar_maintenance) return `太陽能光電發電設備(${data.q9_solar_maintenance})`;
            // Updated logic for Group B water booster items display
            if (i === "加壓受水設備" && data.q9_water_booster_items && data.q9_water_booster_items.length > 0) return `加壓受水設備(${data.q9_water_booster_items.join('、')})`;
            return i;
        }) || [];
        if (data?.q9_hasOther && data.q9_otherDesc) labels.push(`其他: ${data.q9_otherDesc}`);
        return labels.join(', ');
    };
    return { q1, q3, q4, q6, q7, q9 };
};

// --- PRINT PAGE SUB-COMPONENTS ---

const HousePrintPage1Factory = ({ data, hideUtilities = false }: { data: SurveyData, hideUtilities?: boolean }) => {
    const labels = getHouseLabels(data);
    return (
        <>
            <SectionHeader title="1. 增建與占用／被占用現況" />
            <CheckRow checked={data?.q1_hasExt === '否'}>
                <span className="font-black mr-2">增建 (含違建)現況</span>
                <PreviewResult checked={data?.q1_hasExt === '是'} label={labels.q1()} />
            </CheckRow>
            
            <CheckRow checked={data?.q2_hasOccupancy === '否'}>
                <span className="font-black mr-2">占用鄰地</span>
                <PreviewResult checked={data?.q2_hasOccupancy !== '否' && !!data?.q2_hasOccupancy} label={data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '')} />
            </CheckRow>
            <CheckRow checked={data?.q2_other_occupancy === '否'}>
                <span className="font-black mr-2">被占用</span>
                <PreviewResult checked={data?.q2_other_occupancy !== '否' && !!data?.q2_other_occupancy} label={data?.q2_other_occupancy + (data?.q2_other_occupancy_desc ? ': ' + data.q2_other_occupancy_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="2. 現場長寬與建物測量成果圖比對／建物面積現況評估" />
            <CheckRow checked={data?.q6_hasIssue === '實測相符' || data?.q6_hasIssue === '相符 (無明顯差異)'}>
                <span className="font-black mr-2">面積測量：</span>
                <PreviewResult checked={data?.q6_hasIssue === '實測不符' || data?.q6_hasIssue === '無法測量／現況說明' || data?.q6_hasIssue === '不符 (有明顯差異)'} label={data?.q6_hasIssue + (data?.q6_desc ? ': ' + data.q6_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="3. 滲漏水或壁癌狀況" />
            <CheckRow checked={data?.q3_hasLeak === '否'}>
                <span className="font-black mr-2">滲漏水／壁癌：</span>
                <PreviewResult checked={data?.q3_hasLeak === '是'} label={labels.q3()} />
                <PreviewResult checked={data?.q3_hasLeak === '否'} label="無" />
                <PreviewResult checked={data?.q3_repairHistory === '無修繕紀錄'} label="(無修繕紀錄)" />
                {data?.q3_repairHistory === '有修繕紀錄' && (
                    <span className="font-bold ml-2 text-slate-600">
                        (曾有修繕: {data.q3_repairDesc})
                    </span>
                )}
            </CheckRow>
            
            <SectionHeader title="4. 建物結構安全評估 (含瑕疵與傾斜)" />
            <CheckRow checked={data?.q4_hasIssue === '否'}>
                <span className="font-black mr-2">結構瑕疵</span>
                <PreviewResult checked={data?.q4_hasIssue === '是'} label={labels.q4()} />
                <PreviewResult checked={data?.q4_hasIssue === '否'} label="無" />
            </CheckRow>
            <CheckRow checked={data?.q5_hasTilt === '否'}>
                <span className="font-black mr-2">傾斜現況</span>
                <PreviewResult checked={data?.q5_hasTilt !== '否' && !!data?.q5_hasTilt} label={data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '')} />
                <PreviewResult checked={data?.q5_hasTilt === '否'} label="無" />
            </CheckRow>

            {!hideUtilities && (
                <>
                    <SectionHeader title="5. 電、水、瓦斯與其他設施使用現況" />
                    <CheckRow checked={data?.q7_hasIssue === '否'}>
                        {data?.q7_gasType && <div className="mb-1 text-black"><span className="font-bold">瓦斯類型</span>{data.q7_gasType}</div>}
                        <span className="font-black mr-2">電、水與瓦斯設備現況</span>
                        <PreviewResult checked={data?.q7_hasIssue === '是'} label={labels.q7() || '異常'} />
                    </CheckRow>
                </>
            )}
        </>
    );
};

const CommonExtraQuestions = ({ data, startIdx, type }: { data: SurveyData, startIdx: number, type: SurveyType }) => (
    <>
        {type === 'house' && (
            <>
                <SectionHeader title={`${startIdx}. 進出通行與臨路現況`} />
                <CheckRow checked={data?.q14_access === '通行順暢' || data?.q14_access?.includes('順暢')}>
                    <span className="font-black mr-2">進出現況</span>
                    <PreviewResult checked={data?.q14_access === '通行順暢' || data?.q14_access?.includes('順暢')} label={`通行順暢 [${data.q14_ownership || ''}${data.q14_protection ? `/${data.q14_protection}` : ''}${data.q14_protectionDesc ? ` (${data.q14_protectionDesc})` : ''}] ${formatAccessLandAddress(data.q14_section, data.q14_subSection, data.q14_number)}`} />
                    <PreviewResult checked={data?.q14_access === '通行受限' || data?.q14_access?.includes('受限')} label={`通行受限 (${data.q14_abnormalDesc})`} />
                    <PreviewResult checked={data?.q14_access === '袋地' || data?.q14_access?.includes('袋地')} label="袋地" />
                </CheckRow>
                {(data.q14_access === '通行順暢' || data.q14_access?.includes('順暢') || data.q14_access === '通行受限' || data.q14_access?.includes('受限')) && (
                    <CheckRow checked={false}>
                        <PreviewResult checked={!!data.q14_roadMaterial} label="路面材質" suffix={(data.q14_roadMaterial === '其他' || data.q14_roadMaterial === '其他未列項目') ? `: ${data.q14_roadMaterialOther}` : `: ${data.q14_roadMaterial}`} />
                        {data.q14_roadWidth && <span className="mx-2">/</span>}
                        {data.q14_roadWidth && <span className="font-bold">路寬:{data.q14_roadWidth}米</span>}
                        {data.q14_buildingLine && <span className="mx-2">/</span>}
                        {data.q14_buildingLine && <span className="font-bold">建築線:{data.q14_buildingLine}</span>}
                        <span className="mx-2">/</span>
                        <PreviewResult checked={!!data.q14_ditch} label="排水溝" suffix={(data.q14_ditch === '其他' || data.q14_ditch === '其他未列項目') ? `: ${data.q14_ditchOther}` : `: ${data.q14_ditch}`} />
                    </CheckRow>
                )}
            </>
        )}
        
        <SectionHeader title={type === 'house' ? `${startIdx + 1}. 重大環境設施／常見環境抗性設施` : `${type === 'factory' ? startIdx : startIdx + 1}. 重大環境設施／常見環境抗性設施`} />
        <CheckRow checked={data?.q16_noFacilities && data?.q16_2_noFacilities}>
             <span className="font-black mr-2">重大環境設施／常見環境抗性設施</span>
             <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>
        </CheckRow>

        <SectionHeader title={type === 'house' ? `${startIdx + 2}. 本案或本社區須注意的事項` : `${type === 'factory' ? startIdx + 1 : startIdx + 2}. 本案或本區須注意的事項`} />
        <tr className="text-black">
            <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q17_homicide === '無' ? 'V' : ''}</td>
            <td colSpan={9} className="py-1 px-4 text-left text-black">
                <div className="flex flex-wrap items-center">
                    <span className="font-black mr-2">是否曾發生非自然死亡情事：</span>
                    <span className="font-medium">{data?.q17_homicide || ''}</span>
                </div>
            </td>
        </tr>
        <CheckRow checked={data?.q17_issue === '否'}>
             <span className="font-black mr-2">其他應注意事項</span>
            <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
        </CheckRow>
    </>
);

const HousePrintPage1 = ({ data }: { data: SurveyData }) => {
    const labels = getHouseLabels(data);
    const showSolar = data.propertyType && ['透天別墅', '透天店面'].includes(data.propertyType);

    return (
        <>
            <TableHeaderRow />
            <SectionHeader title="1. 增建與占用／被占用現況" />
            <CheckRow checked={data?.q1_hasExt === '否'}>
                <span className="font-black mr-2">增建 (含違建)現況</span>
                <PreviewResult checked={data?.q1_hasExt === '是'} label={labels.q1()} />
            </CheckRow>
            
            <CheckRow checked={data?.q2_hasOccupancy === '否'}>
                <span className="font-black mr-2">占用鄰地</span>
                <PreviewResult checked={data?.q2_hasOccupancy !== '否' && !!data?.q2_hasOccupancy} label={data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '')} />
            </CheckRow>
            <CheckRow checked={data?.q2_other_occupancy === '否'}>
                <span className="font-black mr-2">被占用</span>
                <PreviewResult checked={data?.q2_other_occupancy !== '否' && !!data?.q2_other_occupancy} label={data?.q2_other_occupancy + (data?.q2_other_occupancy_desc ? ': ' + data.q2_other_occupancy_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="2. 現場長寬與建物測量成果圖比對／建物面積現況評估" />
            <CheckRow checked={data?.q6_hasIssue === '實測相符' || data?.q6_hasIssue === '相符 (無明顯差異)'}>
                <span className="font-black mr-2">面積測量</span>
                <PreviewResult checked={data?.q6_hasIssue !== '實測相符' && data?.q6_hasIssue !== '相符 (無明顯差異)' && !!data?.q6_hasIssue} label={data?.q6_hasIssue + (data?.q6_desc ? ': ' + data.q6_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="3. 滲漏水與壁癌現況" />
            <CheckRow checked={data?.q3_hasLeak === '否'}>
                <span className="font-black mr-2">滲漏水／壁癌</span>
                <PreviewResult checked={data?.q3_hasLeak === '是'} label={labels.q3()} />
                <PreviewResult checked={data?.q3_repairHistory === '無修繕紀錄'} label="(無修繕紀錄)" />
                {data?.q3_repairHistory === '有修繕紀錄' && (
                    <span className="font-bold ml-2 text-slate-600">
                        (曾有修繕: {data.q3_repairDesc})
                    </span>
                )}
            </CheckRow>
            
            <SectionHeader title="4. 建物結構安全評估 (含瑕疵與傾斜)" />
            <CheckRow checked={data?.q4_hasIssue === '否'}>
                 <span className="font-black mr-2">結構瑕疵</span>
                 <PreviewResult checked={data?.q4_hasIssue === '是'} label={labels.q4()} />
            </CheckRow>
            <CheckRow checked={data?.q5_hasTilt === '否'}>
                 <span className="font-black mr-2">傾斜現況</span>
                 <PreviewResult checked={data?.q5_hasTilt !== '否' && !!data?.q5_hasTilt} label={data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '')} />
            </CheckRow>

            <SectionHeader title="5. 電、水、瓦斯與其他設施使用現況" />
            
            <CheckRow checked={!!data?.q7_gasType}>
                <span className="font-black mr-2">瓦斯供應類型</span>
                <PreviewResult checked={!!data?.q7_gasType} label={data.q7_gasType} />
            </CheckRow>

            <CheckRow checked={data?.q7_hasIssue === '否'}>
                <span className="font-black mr-2">電、水、瓦斯與其他設施使用現況</span>
                <PreviewResult checked={data?.q7_hasIssue === '是'} label={labels.q7() || '異常'} />
            </CheckRow>

            {showSolar && (
                <CheckRow checked={data?.house_solar_status === '無設置' || data?.house_solar_status === '無'}>
                    <span className="font-black mr-2">太陽能光電發電設備</span>
                    <PreviewResult checked={data?.house_solar_status === '合法設置'} label="合法設置" />
                    <PreviewResult checked={data?.house_solar_status === '私下設置'} label="私下設置" />
                    <PreviewResult checked={data?.house_solar_status === '無設置' || data?.house_solar_status === '無'} label="無" />
                </CheckRow>
            )}

            {data?.water_booster && (
                <CheckRow checked={data?.water_booster === '無' || data?.water_booster === '無設置'}>
                    <span className="font-black mr-2">用戶加壓受水設備現況</span>
                    <PreviewResult 
                        checked={data.water_booster === '有設置' || data.water_booster === '有'} 
                        label={`有設置${(data.water_booster_items && data.water_booster_items.length > 0) ? ` (${data.water_booster_items.join('、')})` : ''}`} 
                    />
                    <PreviewResult checked={data?.water_booster === '其他未列項目'} label={`其他 (${data.water_booster_desc})`} />
                    <PreviewResult checked={data?.water_booster === '無' || data?.water_booster === '無設置'} label="無" />
                </CheckRow>
            )}

            <SectionHeader title="6. 大樓／社區公共設施 (可否進入／使用)" />
            <CheckRow checked={data?.publicFacilities === '有公共設施' || data?.publicFacilities === '無公共設施'}>
                <span className="font-black mr-2">公共設施</span>
                <PreviewResult checked={data?.publicFacilities === '無法進入'} label={`無法進入 (${data.publicFacilitiesReason})`} />
            </CheckRow>
        </>
    );
};

const HousePrintPage2 = ({ data, parkingSummary, activeMode }: { data: SurveyData, parkingSummary: any, activeMode: any }) => {
    const labels = getHouseLabels(data);
    return (
        <>
            <SectionHeader title="7. 公設空間（梯間/地下室）現況" />
            <CheckRow checked={data?.q8_stairIssue === '否' || data?.q8_stairIssue === '無異常'}>
                <span className="font-black mr-2">梯間／地下室異常</span>
                <PreviewResult checked={data?.q8_stairIssue === '是' || data?.q8_stairIssue === '有異常'} label={labels.q6()} />
            </CheckRow>
            
            <SectionHeader title="8. 物件與社區內須注意的社區" />
            <CheckRow checked={data?.q9_hasIssue === '否'}>
                 <span className="font-black mr-2">須注意社區</span>
                <PreviewResult checked={data?.q9_hasIssue === '是'} label={labels.q9()} />
            </CheckRow>

            <SectionHeader title="9. 車位資訊" />
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q10_noParking ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <span className="font-bold mr-2">車位資訊:</span>
                    {!data?.q10_noParking && <ParkingContent data={data} parkingSummary={parkingSummary} activeMode={activeMode} />}
                </td>
            </tr>
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && (data?.q11_hasIssue === '否' || data?.q11_hasIssue === '無異常')) ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <div className="flex flex-wrap items-center">
                        <span className="font-black mr-2">車位使用現況</span>
                        <PreviewResult checked={data?.q11_hasIssue === '是' || data?.q11_hasIssue === '有異常'} label={[...(data?.q11_items || []), data?.q11_hasOther ? `其他: ${data.q11_other}` : ''].filter(Boolean).join(', ') || '異常'} />
                    </div>
                </td>
            </tr>
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <div className="flex flex-wrap items-center">
                        <span className="font-black mr-2">車位與車道其他備註</span>
                        <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                    </div>
                </td>
            </tr>
            
            <CommonExtraQuestions data={data} startIdx={10} type="house" />
        </>
    );
};

const LandPrintPage1 = ({ data }: { data: SurveyData }) => {
    const getLandElecSummary = () => {
        if (data?.land_q1_elec === '是' || data?.land_q1_elec?.includes('一般用電') || data?.land_q1_elec?.includes('動力用電')) {
             if (data?.land_q1_elec?.includes('用電')) return data.land_q1_elec; 
             return `是 (${data.land_q1_elec_detail})`; 
        }
        if (data?.land_q1_elec === '其他' || data?.land_q1_elec === '其他未列項目') return `其他: ${data.land_q1_elec_other}`;
        return data?.land_q1_elec || '';
    };
    const getLandWaterSummary = () => {
        if (data?.land_q1_water === '否' || !data?.land_q1_water || data?.land_q1_water === '無') return data?.land_q1_water || '';
        if (data?.land_q1_water === '其他' || data?.land_q1_water === '其他未列項目') return `其他: ${data.land_q1_water_other}`;
        if (data?.land_q1_water === '是') {
            let res = `是 (${data.land_q1_water_cat}`;
            if (data.land_q1_water_cat === '自來水') res += ` - ${data.land_q1_water_tap_detail}`;
            else if (data.land_q1_water_cat === '地下水') res += ` - ${data.land_q1_water_ground_detail}`;
            else if (data.land_q1_water_cat === '水利溝渠') res += ` - ${data.land_q1_water_irr_detail}`;
            return res + ')';
        }
        return '';
    };

    return (
        <>
            <TableHeaderRow />
            <SectionHeader title="1. 電、水與其他設施使用現況" />
            <CheckRow checked={data?.land_q1_elec === '否' || data?.land_q1_elec?.startsWith('無電力')}>
                <span className="font-black mr-2">電力供應現況</span>
                <PreviewResult checked={data?.land_q1_elec !== '否' && !data?.land_q1_elec?.startsWith('無電力') && !!data?.land_q1_elec} label={getLandElecSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q1_water === '否' || data?.land_q1_water === '無'}>
                <span className="font-black mr-2">水源供應現況</span>
                <PreviewResult checked={data?.land_q1_water !== '否' && data?.land_q1_water !== '無' && !!data?.land_q1_water} label={getLandWaterSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q1_other_new === '否'}>
                <span className="font-black mr-2">其他設施</span>
                <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
            </CheckRow>

            <LandDisputeExproPreview data={data} titles={{ q3: '2. 土地鑑界與界標現況／產權與使用糾紛現況', q4: '3. 土地徵收與保留地現況／重劃與區段徵收現況' }} />
            
            <SectionHeader title="4. 被越界占用／占用鄰地現況" />
            <CheckRow checked={data?.land_q5_encroached === '否'}>
                <span className="font-black mr-2">本案遭他人越界占用</span>
                <PreviewResult checked={data?.land_q5_encroached !== '否' && !!data?.land_q5_encroached} label={data?.land_q5_encroached + (data.land_q5_encroached_desc ? `: ${data.land_q5_encroached_desc}` : '')} />
            </CheckRow>
            <CheckRow checked={data?.land_q5_encroaching === '否'}>
                <span className="font-black mr-2">本案占用鄰地現況</span>
                <PreviewResult checked={data?.land_q5_encroaching !== '否' && !!data?.land_q5_encroaching} label={data?.land_q5_encroaching + (data.land_q5_encroaching_desc ? `: ${data.land_q5_encroaching_desc}` : '')} />
            </CheckRow>
        </>
    );
};

const LandPrintPage2 = ({ data }: { data: SurveyData }) => {
    const getLandUserSummary = () => {
        if (!data?.land_q7_user) return '';
        if (data?.land_q7_user === '無') return '無';
        if (data?.land_q7_user === '所有權人自用') return '所有權人自用';
        if (data?.land_q7_user === '非所有權人使用') {
            let res = data.land_q7_user_detail;
            if (data.land_q7_user_desc) res += `: ${data.land_q7_user_desc}`;
            return `非所有權人使用 (${res})`;
        }
        return '';
    };
    const getLandCropsSummary = () => {
        if (!data?.land_q7_crops) return '';
        if (data?.land_q7_crops === '無') return '無';
        if (data?.land_q7_crops === '有農作物／植栽') {
            let parts = [data.land_q7_crops_type];
            if ((data.land_q7_crops_type === '經濟作物' || data.land_q7_crops_type === '景觀植栽') && data.land_q7_crops_month) parts.push(`收成:${data.land_q7_crops_month}月`);
            if (data.land_q7_crops_detail) parts.push(`處理:${data.land_q7_crops_detail}`);
            if (data.land_q7_crops_other) parts.push(data.land_q7_crops_other);
            return `有 (${parts.join(', ')})`;
        }
        return '';
    };
    const getLandBuildSummary = () => {
        if (!data?.land_q7_build) return '';
        if (data?.land_q7_build === '無') return '無';
        if (data?.land_q7_build === '有建築物／工作物') {
            let parts = [data.land_q7_build_type];
            if (data.land_q7_build_type === '有保存登記' || data.land_q7_build_type === '未保存登記') {
                if (data.land_q7_build_ownership) {
                    let status = data.land_q7_build_ownership;
                    if (status === '其他未列項目' || status === '其他') {
                        const detail = data.land_q7_build_type === '有保存登記' ? data.land_q7_build_reg_detail : data.land_q7_build_unreg_detail;
                        if (detail) status += `: ${detail}`;
                    }
                    parts.push(status);
                }
            } else if (data.land_q7_build_type === '宗教／殯葬設施' && data.land_q7_build_rel_detail) parts.push(data.land_q7_build_rel_detail);
            else if (data.land_q7_build_type === '其他未列項目' && data.land_q7_build_other) parts.push(data.land_q7_build_other);
            return `有 (${parts.join(', ')})`;
        }
        return '';
    };

    // Get Land Facilities Summary
    const getLandFacilitiesSummary = () => {
        const labels = [...(data?.land_q7_facilities_items || [])];
        if (data.land_q7_facilities_other) labels.push(`其他: ${data.land_q7_facilities_other}`);
        return labels.filter(i => i !== '其他未列項目').join('、');
    };

    return (
        <>
            <SectionHeader title="5. 土地禁建、限建現況" />
            <CheckRow checked={data?.land_q6_limit === '否'}>
                <PreviewResult checked={data?.land_q6_limit === '是'} label={`是 (${data.land_q6_limit_desc})`} />
                <PreviewResult checked={data?.land_q6_limit === '無'} label="無" />
            </CheckRow>

            <SectionHeader title="6. 土地使用現況與地上物" />
            <CheckRow checked={data?.land_q7_user === '無'}>
                <span className="font-black mr-2">現況使用人</span>
                <PreviewResult checked={data?.land_q7_user !== '無' && !!data?.land_q7_user} label={getLandUserSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q7_crops === '無'}>
                <span className="font-black mr-2">地上定著物-農作物</span>
                <PreviewResult checked={data?.land_q7_crops !== '無' && !!data?.land_q7_crops} label={getLandCropsSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q7_build === '無'}>
                <span className="font-black mr-2">地上定著物-建物</span>
                <PreviewResult checked={data?.land_q7_build !== '無' && !!data?.land_q7_build} label={getLandBuildSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q7_solar === '無'}>
                <span className="font-black mr-2">太陽能光電發電設備</span>
                <PreviewResult checked={data?.land_q7_solar === '合法設置'} label="合法設置" />
                <PreviewResult checked={data?.land_q7_solar === '私下設置'} label="私下設置" />
                <PreviewResult checked={data?.land_q7_solar === '無'} label="無" />
            </CheckRow>
            
            {/* Land Water Booster */}
            {data?.land_water_booster && (
                <CheckRow checked={data?.land_water_booster === '無' || data?.land_water_booster === '無設置'}>
                    <span className="font-black mr-2">用戶加壓受水設備現況</span>
                    <PreviewResult 
                        checked={data.land_water_booster === '有設置' || data.land_water_booster === '有'} 
                        label={`有設置${(data.land_water_booster_items && data.land_water_booster_items.length > 0) ? ` (${data.land_water_booster_items.join('、')})` : ''}`} 
                    />
                    <PreviewResult checked={data?.land_water_booster === '無' || data?.land_water_booster === '無設置'} label="無" />
                </CheckRow>
            )}

            {data?.propertyType === '農地' && (
                <CheckRow checked={false}>
                    <span className="font-black mr-2">土地鋪面現況</span>
                    <PreviewResult checked={data?.land_q7_illegal_paving === '是'} label="是" />
                    <PreviewResult checked={data?.land_q7_illegal_paving === '否'} label="否" />
                </CheckRow>
            )}
            
            {data?.propertyType === '工業地' && (
                <CheckRow checked={false}>
                    <span className="font-black mr-2">防火間隔與區劃現況</span>
                    <PreviewResult checked={data?.land_q7_fire_setback === '是'} label="是" />
                    <PreviewResult checked={data?.land_q7_fire_setback === '否'} label="否" />
                </CheckRow>
            )}

            {data?.propertyType === '其他(道路用地／公設地)' && (
                <CheckRow checked={false}>
                    <span className="font-black mr-2">計畫道路開闢現況</span>
                    <PreviewResult checked={data?.land_q7_road_opened === '是'} label="是" />
                    <PreviewResult checked={data?.land_q7_road_opened === '否'} label="否" />
                </CheckRow>
            )}
            
            {/* New Q7 Facilities Section for Land */}
            <SectionHeader title="7. 本案或周圍須注意設施" />
            <CheckRow checked={data?.land_q7_facilities === '否'}>
                <PreviewResult checked={data?.land_q7_facilities === '是'} label={getLandFacilitiesSummary()} />
                <PreviewResult checked={data?.land_q7_facilities === '否'} label="無" />
            </CheckRow>

            <LandAccessPreviewBuildingStyle data={data} title="8. 進出通行與臨路" />

            <SectionHeader title="9. 土壤與地下埋設物" />
            <CheckRow checked={data?.soil_q1_status === '無'}>
                <span className="font-black mr-2">土壤汙染與地下掩埋物現況</span>
                <PreviewResult checked={data?.soil_q1_status === '有'} label={`有 (${data.soil_q1_desc})`} />
                <PreviewResult checked={data?.soil_q1_status === '無'} label="無" />
                <PreviewResult checked={data?.soil_q1_status === '不確定' || data?.soil_q1_status === '待查證'} label="待查證" />
            </CheckRow>

            <SectionHeader title="10. 重大環境設施／常見環境抗性設施" />
            <CheckRow checked={data?.q16_noFacilities && data?.q16_2_noFacilities}>
                <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>
            </CheckRow>

            <SectionHeader title="11. 本案或周圍須注意的事項" />
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q17_homicide === '無' ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <div className="flex flex-wrap items-center">
                        <span className="font-black mr-2">是否曾發生非自然死亡情事：</span>
                        <span className="font-medium">{data?.q17_homicide || ''}</span>
                    </div>
                </td>
            </tr>
            <CheckRow checked={data?.land_q8_special === '否'}>
                <PreviewResult checked={data?.land_q8_special === '是'} label={data?.land_q8_special_desc} />
            </CheckRow>
        </>
    );
};

const FactoryPrintPage1 = ({ data }: { data: SurveyData }) => {
    return (
        <>
            <TableHeaderRow />
            <HousePrintPage1Factory data={data} hideUtilities={true} />
        </>
    );
};
const FactoryPrintPage2 = ({ data, parkingSummary, activeMode, hasPage3 = false }: { data: SurveyData, parkingSummary: any, activeMode: any, hasPage3?: boolean }) => {
    // UPDATED LOGIC TO MATCH NEW FACTORY PROPERTY TYPES
    const isHiRise = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "園區標準廠房（集合式／分租型）");
    const showSolar = GROUP_A_TYPES.includes(data.propertyType);

    // Compact Helpers
    const getElevatorStr = () => {
        if (!data.factory_elevator) return '';
        if (data.factory_elevator === '無') return '無';
        const status = data.factory_elevator_working ? '可運作' : '故障';
        // Use the actual value (純貨梯/客貨兩用梯) instead of hardcoded "有"
        let s = `${data.factory_elevator} (${status}`;
        if (data.factory_elevator_separate) s += '/客貨分';
        s += ')';
        const parts = [];
        if (data.factory_elevator_capacity) parts.push(`${data.factory_elevator_capacity}噸/kg`);
        if (data.factory_elevator_dim) parts.push(data.factory_elevator_dim);
        if (parts.length > 0) s += ` ${parts.join(' ')}`;
        return s;
    };
    const getCraneStr = () => {
        if (!data.factory_crane) return '';
        if (data.factory_crane === '無') return '無';
        if (data.factory_crane === '僅預留牛腿') return '預留牛腿';
        if (data.factory_crane === '有軌道／樑，無主機') return '有軌道無主機';
        const status = data.factory_crane_working ? '可運作' : '故障';
        let s = `有 (${status}`;
        const parts = [];
        if (data.factory_crane_tonnage) parts.push(`${data.factory_crane_tonnage}噸`);
        if (data.factory_crane_quantity) parts.push(data.factory_crane_quantity);
        if (parts.length > 0) s += ` ${parts.join('/')}`;
        return s;
    };
    const getWasteStr = () => {
         if (!data.factory_waste) return '';
         if (data.factory_waste === '無') return '無';
         return data.factory_waste + ((data.factory_waste === '其他未列項目' || data.factory_waste === '其他') ? `: ${data.factory_waste_desc}` : '');
    };
    const getFactoryFireLabel = () => {
        const labels = [...(data?.factory_fire_safety || [])];
        if ((data?.factory_fire_safety?.includes("其他未列項目") || data?.factory_fire_safety?.includes("其他")) && data.factory_fire_safety_other) labels.push(data.factory_fire_safety_other);
        return labels.join('、');
    };
    const getLandWaterSummary = () => {
        if (data?.land_q1_water === '否' || !data?.land_q1_water) return data?.land_q1_water || '';
        if (data?.land_q1_water === '其他未列項目' || data?.land_q1_water === '其他') return `其他: ${data.land_q1_water_other}`;
        if (data?.land_q1_water === '是') {
            let res = `是 (${data.land_q1_water_cat}`;
            if (data.land_q1_water_cat === '自來水') res += `-${data.land_q1_water_tap_detail}`;
            else if (data.land_q1_water_cat === '地下水') res += `-${data.land_q1_water_ground_detail}`;
            return res + ')';
        }
        return '';
    };

    return (
        <>
            <SectionHeader title="5. 廠房結構與消防安全" />
            <CheckRow checked={false}>
                <div className="flex flex-col gap-2 text-black">
                    <div className="flex flex-wrap gap-x-8 gap-y-1">
                        <div><span className="font-black">{isHiRise ? "樑下淨高／樓層高度" : "滴水高度"}：</span>{data.factory_height}米</div>
                        <div><span className="font-black">柱距</span>{data.factory_column_spacing}米</div>
                        <div>
                            <span className="font-black">樓板載重</span>
                            {data.factory_floor_load_unknown 
                                ? '依使照為準' 
                                : (data.factory_floor_load ? `${data.factory_floor_load} kg/m²` : '')
                            }
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-1">
                        <div><span className="font-black">地坪狀況</span>{data.factory_floor_condition + ((data.factory_floor_condition === '其他' || data.factory_floor_condition === '其他未列項目') ? `(${data.factory_floor_condition_other})` : '')}</div>
                        <div><span className="font-black">消防設施</span>{getFactoryFireLabel()}</div>
                    </div>
                </div>
            </CheckRow>

            <SectionHeader title="6. 電、水、瓦斯與其他設施使用現況" />
            <CheckRow checked={!!data?.land_q1_elec?.startsWith("無電力")}>
                <div className="flex flex-wrap items-start text-black">
                    <span className="font-black mr-2 shrink-0">供電類型：</span>
                    <PreviewResult checked={!!data?.land_q1_elec} label={data?.land_q1_elec} />
                    {(data?.land_q1_elec === '其他' || data?.land_q1_elec === '其他未列項目') && data?.land_q1_elec_other && ` (${data.land_q1_elec_other})`}
                    {(data?.land_q1_elec?.includes("一般用電") || data?.land_q1_elec?.includes("動力用電") || data?.land_q1_elec?.includes("高壓電供電")) && (
                        <span className="ml-2 text-sm font-bold">
                            [{[data.land_q1_elec_meter, data.land_q1_elec_voltage, data.land_q1_elec_capacity].filter(Boolean).join('/')}]
                        </span>
                    )}
                </div>
            </CheckRow>
            <CheckRow checked={data?.land_q1_water === '否'}>
                <div className="flex items-center text-black">
                    <span className="font-black mr-2">水源供應：</span>
                    <PreviewResult checked={data?.land_q1_water !== '否' && !!data?.land_q1_water} label={getLandWaterSummary()} />
                    <PreviewResult checked={data?.land_q1_water === '否'} label="無" />
                </div>
            </CheckRow>
            {/* Solar for Factory */}
            {showSolar && (
                <CheckRow checked={data?.house_solar_status === '無設置' || data?.house_solar_status === '無'}>
                    <div className="flex items-center text-black">
                        <span className="font-black mr-2">太陽能光電發電設備</span>
                        <PreviewResult checked={data?.house_solar_status === '合法設置'} label="合法設置" />
                        <PreviewResult checked={data?.house_solar_status === '私下設置'} label="私下設置" />
                        <PreviewResult checked={data?.house_solar_status === '無設置' || data?.house_solar_status === '無'} label="無" />
                    </div>
                </CheckRow>
            )}
            {/* Conditional Render for Water Booster */}
            {data?.water_booster && (
                <CheckRow checked={data?.water_booster === '無' || data?.water_booster === '無設置'}>
                    <div className="flex items-center text-black">
                        <span className="font-black mr-2">加壓受水設備</span>
                        <PreviewResult 
                            checked={!!data?.water_booster && data.water_booster !== '無' && data.water_booster !== '無設置' && data.water_booster !== '其他未列項目'} 
                            label={`有設置${(data.water_booster_items && data.water_booster_items.length > 0) ? ` (${data.water_booster_items.join('、')})` : ''}`} 
                        />
                        <PreviewResult checked={data?.water_booster === '其他未列項目'} label={`其他 (${data.water_booster_desc})`} />
                        <PreviewResult checked={data?.water_booster === '無' || data?.water_booster === '無設置'} label="無" />
                    </div>
                </CheckRow>
            )}
            <CheckRow checked={data?.land_q1_other_new === '否'}>
                <div className="flex items-center text-black">
                    <span className="font-black mr-2">其他設施</span>
                    <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
                    <PreviewResult checked={data?.land_q1_other_new === '否'} label="無" />
                </div>
            </CheckRow>
            
            <SectionHeader title="7. 廠房硬體設施" />
            <CheckRow checked={data.factory_elevator === '無'}>
                 <span className="font-black mr-2">貨梯</span>{getElevatorStr()}
            </CheckRow>
            <CheckRow checked={data.factory_crane === '無'}>
                 <span className="font-black mr-2">天車</span>{getCraneStr()}
            </CheckRow>
            <CheckRow checked={data.factory_waste === '無'}>
                 <span className="font-black mr-2">廢水／氣</span>{getWasteStr()}
            </CheckRow>

            <SectionHeader title="8. 物流動線" />
            <CheckRow checked={data.factory_loading_dock === '無'}>
                 <span className="font-black mr-2">卸貨碼頭</span>{data.factory_loading_dock || ''}
            </CheckRow>
            <CheckRow checked={false}>
                 <span className="font-black mr-2">大車進出</span>{data.factory_truck_access || ''} {data.factory_truck_buffer ? `(${data.factory_truck_buffer})` : ''}
            </CheckRow>
            
            <SectionHeader title="9. 車位資訊" />
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q10_noParking ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black"><ParkingContent data={data} parkingSummary={parkingSummary} activeMode={activeMode} isFactory={true} /></td>
            </tr>
        </>
    );
};

// NEW: Page 3 for ALL factory types now
const FactoryPrintPage3 = ({ data }: { data: SurveyData }) => {
    // Determine numbering based on what is shown/hidden
    // UPDATED LOGIC TO MATCH NEW FACTORY PROPERTY TYPES
    const hideLandDetails = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "園區標準廠房（集合式／分租型）");
    const isHiRise = (data.propertyType === "立體化廠辦大樓");
    const hideSoil = isHiRise;
    const labels = getHouseLabels(data); // Reuse house labels logic for q9 facilities

    let idx = 10;

    return (
        <>
            <SectionHeader title={`${idx}. 本案或本社區須注意的設施`} />
            <CheckRow checked={data?.q9_hasIssue === '否'}>
                 <span className="font-black mr-2">須注意設施</span>
                <PreviewResult checked={data?.q9_hasIssue === '是'} label={labels.q9()} />
            </CheckRow>

            <SectionHeader title={`${++idx}. 廠房進出通行與臨路的現況`} />
            <CheckRow checked={data.land_q2_access?.includes('順暢')}>
                {(() => {
                    const acc = data.land_q2_access;
                    if (acc?.includes('順暢')) {
                        const mat = (data.land_q2_material === '其他' || data.land_q2_material === '其他未列項目') ? data.land_q2_material_other : data.land_q2_material;
                        const ditch = (data.land_q2_ditch === '其他' || data.land_q2_ditch === '其他未列項目') ? data.land_q2_ditch_other : data.land_q2_ditch;
                        const ditchStr = ditch === '有' ? '有水溝' : (ditch === '無' ? '無水溝' : ditch);
                        const roadWidth = data.land_q2_roadWidth ? `路寬:${data.land_q2_roadWidth}米` : '';
                        const buildingLine = data.land_q2_buildingLine ? `建築線:${data.land_q2_buildingLine}` : '';
                        
                        return (
                            <div>
                                通行順暢 
                                {data.land_q2_owner ? ` (${data.land_q2_owner}${data.land_q2_protection ? '/' + data.land_q2_protection : ''})` : ''} 
                                {mat || ditchStr ? ` [${mat || '-'}/${ditchStr || '-'}]` : ''}
                                {roadWidth ? ` [${roadWidth}]` : ''}
                                {buildingLine ? ` [${buildingLine}]` : ''}
                                {formatAccessLandAddress(data.land_q2_access_section, data.land_q2_access_subSection, data.land_q2_access_number)}
                            </div>
                        );
                    } else {
                            return (
                            <div>
                                {acc || ''} 
                                {data.land_q2_access_desc ? ` (${data.land_q2_access_desc})` : ''}
                            </div>
                            );
                    }
                })()}
            </CheckRow>

            {!hideLandDetails && (
                 <LandDisputeExproPreview data={data} titles={{ q3: `${++idx}. 土地鑑界與界標現況／產權與使用糾紛現況`, q4: `${++idx}. 土地徵收與保留地現況／重劃與區段徵收現況` }} />
            )}

            {!hideSoil && (
                <>
                    <SectionHeader title={`${++idx}. 土壤與地下埋設物`} />
                    <CheckRow checked={data?.soil_q1_status === '無'}>
                        <span className="font-black mr-2">土壤汙染與地下掩埋物現況</span>
                        <PreviewResult checked={data?.soil_q1_status === '有'} label={`有 (${data.soil_q1_desc})`} />
                        <PreviewResult checked={data?.soil_q1_status === '無'} label="無" />
                        <PreviewResult checked={data?.soil_q1_status === '不確定' || data?.soil_q1_status === '待查證'} label="待查證" />
                    </CheckRow>
                </>
            )}

            <CommonExtraQuestions data={data} startIdx={data.propertyType === '立體化廠辦大樓' ? 12 : (['園區標準廠房（集合式／分租型）'].includes(data.propertyType) ? 13 : 15)} type="factory" />
        </>
    );
};

// --- MAIN PREVIEW COMPONENT ---

export const SurveyPreview = React.memo<SurveyPreviewProps>(({ data, type, exporting, previewScale, previewPage, setPreviewPage, page1Ref, page2Ref, page3Ref, isMobile = false }) => {
    // Removed viewMode state as we are defaulting to A4 view for consistency
    const activeMode = 'a4';

    // Detect if we need page 3 (All factory types now use 3 pages)
    const hasPage3 = type === 'factory';

    const parkingSummary = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;
        const isPlaneType = pts.includes("坡道平面") || pts.includes("一樓平面") || pts.includes("法定空地／自家門前");

        return {
            isNoParking,
            showMethod: !isNoParking,
            showNumber: !isNoParking && !isOtherPt && (data?.q10_parkingNumberType === 'number' || data?.q10_parkingNumberType === 'none'),
            showCarStatus: !isNoParking && !isOtherPt && ((data?.q10_carUsage || []).length > 0 || data?.q10_hasCarUsageOther),
            showCarSize: !isNoParking && !isOtherPt && !pts.includes("法定空地／自家門前"),
            showWeight: !isNoParking && !isOtherPt && !isPlaneType && data?.q10_mechWeight && data?.q10_measureType !== '無法測量也無相關資訊',
            showHeight: !isNoParking && !isOtherPt && !pts.includes("法定空地／自家門前") && data?.q10_entryHeight,
            showCharging: !isNoParking,
            showAbnormal: !isNoParking && data?.q11_hasIssue === '是',
            showSupplement: !isNoParking && data?.q12_hasNote === '是'
        };
    }, [data]);

    const PageSwitcher = () => (
        type !== 'parking' ? (
            <div className="flex bg-white rounded-2xl shadow-md p-2 gap-2 border border-slate-200 no-print w-full dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
                <button onClick={() => setPreviewPage(1)} className={`flex-1 min-w-[80px] py-4 rounded-xl font-black text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 1 ? 'bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900' : 'text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}`}>第一頁</button>
                <button onClick={() => setPreviewPage(2)} className={`flex-1 min-w-[80px] py-4 rounded-xl font-black text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 2 ? 'bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900' : 'text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}`}>第二頁</button>
                {hasPage3 && (
                    <button onClick={() => setPreviewPage(3)} className={`flex-1 min-w-[80px] py-4 rounded-xl font-black text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 3 ? 'bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900' : 'text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}`}>第三頁</button>
                )}
            </div>
        ) : null
    );

    // FIX: Added 'as React.RefObject<HTMLDivElement>' to resolve TS2322
    const ScaledA4Wrapper = ({ children, pageNum }: { children?: React.ReactNode, pageNum: number }) => (
        <div style={{
            width: exporting ? '210mm' : `${210 * previewScale}mm`,
            height: exporting ? 'auto' : `${297 * previewScale}mm`,
            flexShrink: 0,
            boxShadow: exporting ? 'none' : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            backgroundColor: 'white',
            marginBottom: exporting ? 0 : '2rem',
            overflow: exporting ? 'visible' : 'hidden', 
            display: (previewPage === pageNum || exporting) ? 'block' : 'none'
        }}>
            <div 
                ref={(pageNum === 1 ? page1Ref : (pageNum === 2 ? page2Ref : page3Ref)) as React.RefObject<HTMLDivElement>} 
                className="a4-page relative" 
                style={{
                    transform: `scale(${exporting ? 1 : previewScale})`,
                    transformOrigin: 'top left',
                    width: '210mm',
                    minHeight: '297mm',
                    margin: 0
                }}
            >
                <Watermark />
                <div className="relative z-10 h-full flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );

    const BasicInfoTable = () => (
        <table className="excel-table mb-2 w-full text-black">
            <tbody>
                <tr>
                    <td colSpan={10} className="py-2 px-4 text-left text-black">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-black">
                            <span className="font-black text-[15px]">{(type === 'factory' || type === 'house' || type === 'land') ? '本物件型態與現況：' : '本物件現況：'}</span>
                            {(type === 'factory' || type === 'house' || type === 'land') && (
                                <PreviewResult checked={!!data?.propertyType} label={data?.propertyType} suffix={(data?.propertyType === '其他特殊工業設施' || data?.propertyType === '其他' || data?.propertyType === '其他未列項目') ? `: ${data.propertyTypeOther}` : ''} />
                            )}
                            <PreviewResult checked={data?.access === '可進入'} label="可進入" />
                            {data?.access === '不可進入' && (
                                <>
                                    <PreviewResult checked={true} label="不可進入：" />
                                    {(data?.accessType || []).map(opt => (
                                        <PreviewResult key={opt} checked={true} label={opt + (opt === "其他" || opt === "其他未列項目" ? '：' : '')} suffix={opt === "其他" || opt === "其他未列項目" ? data.accessOther : ""} />
                                    ))}
                                </>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );

    // --- RENDER ---
    // (Mobile view skipped for brevity as logic mostly impacts A4 layout rendering of Water Booster)

    return (
        <div className="flex flex-col items-center w-full">
            {isMobile ? (
                <div className="w-full max-w-[210mm] flex flex-col gap-4 mb-6 no-print">
                    <div className="mb-0 animate-in fade-in slide-in-from-top-2"><p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">💡 手機版：可左右拖曳，亦可雙指放大縮小檢視</p></div>
                    <PageSwitcher />
                </div>
            ) : (<div className="w-full max-w-[210mm] mb-8 no-print"><PageSwitcher /></div>)}

            <ScaledA4Wrapper pageNum={1}>
                <div className="flex-grow flex flex-col h-full text-black">
                    <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full">
                        <h1 className="text-3xl font-black tracking-[0.2em] text-center w-full text-black">幸福家不動產－業務版現況調查表</h1>
                        <div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【正面】{data?.version}</div>
                    </div>
                    <table className="excel-table mb-4 w-full text-black">
                        <tbody>
                            <tr>
                                <td className="bg-gray-label w-[10%] text-black">案名</td><td className="w-[30%] font-black text-black">{data?.caseName}</td>
                                <td className="bg-gray-label w-[15%] text-black">編號</td><td className="w-[20%] font-black text-black">{data?.authNumber}</td>
                                <td className="bg-gray-label w-[8%] text-black">店名</td><td className="w-[17%] text-black">{data?.storeName}</td>
                            </tr>
                            <tr>
                                <td className="bg-gray-label text-black">{type === 'land' ? '坐落' : (type === 'parking' ? '位置' : '地址')}</td><td className="font-bold text-black">{data?.address}</td>
                                <td className="bg-gray-label text-black">業務</td><td className="font-bold text-black">{data?.agentName}</td>
                                <td className="bg-gray-label text-black">日期</td><td className="text-left font-mono pl-2 text-black">{formatDateROC(data?.fillDate || '')}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="bg-black text-white px-3 py-1 text-sm font-black mb-1 self-start">【調查現況】</div>
                    
                    <BasicInfoTable />

                    <table className="excel-table mb-2 w-full text-black">
                        <tbody>
                            {type === 'house' && <HousePrintPage1 data={data} />}
                            {type === 'land' && <LandPrintPage1 data={data} />}
                            {type === 'factory' && <FactoryPrintPage1 data={data} />}
                            {type === 'parking' && (
                                <>
                                    <TableHeaderRow />
                                    <SectionHeader title="1. 車位資訊" />
                                    <tr className="text-black">
                                        <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q10_noParking ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left text-black">
                                            <span className="font-bold mr-2">車位資訊:</span>
                                            {!data?.q10_noParking && <ParkingContent data={data} parkingSummary={parkingSummary} activeMode={activeMode} />}
                                        </td>
                                    </tr>
                                    <tr className="text-black">
                                        <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && (data?.q11_hasIssue === '否' || data?.q11_hasIssue === '無異常')) ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left text-black">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位使用現況</span>
                                                <PreviewResult checked={data?.q11_hasIssue === '是' || data?.q11_hasIssue === '有異常'} label={[...(data?.q11_items || []), data?.q11_hasOther ? `其他: ${data.q11_other}` : ''].filter(Boolean).join(', ') || '異常'} />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="text-black">
                                        <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left text-black">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位與車道其他備註</span>
                                                <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                                            </div>
                                        </td>
                                    </tr>
                                    <SectionHeader title="2. 重要環境設施" />
                                    <CheckRow checked={data?.q16_noFacilities}>
                                             <span className="font-black mr-2">重要環境設施</span>
                                             {!data?.q16_noFacilities && <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>}
                                    </CheckRow>
                                    <SectionHeader title="3. 本案或本社區須注意的事項" />
                                    <tr className="text-black">
                                        <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q17_homicide === '無' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left text-black">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">是否曾發生非自然死亡情事：</span>
                                                <span className="font-medium">{data?.q17_homicide || ''}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <CheckRow checked={data?.q17_issue === '否'}>
                                             <span className="font-black mr-2">其他應注意事項</span>
                                            <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
                                    </CheckRow>
                                </>
                            )}
                        </tbody>
                    </table>
                    
                    <Footer showSignature={type === 'parking'} signatureImage={data.signatureImage} />
                </div>
            </ScaledA4Wrapper>

            {(type !== 'parking' || previewPage === 2) && (
                <ScaledA4Wrapper pageNum={2}>
                    <div className="flex-grow flex flex-col h-full text-black">
                        <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full">
                            <h1 className="text-3xl font-black tracking-[0.2em] text-center w-full text-black">幸福家不動產－業務版現況調查表</h1>
                            <div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【背面】</div>
                        </div>
                        <table className="excel-table mb-2 w-full text-black">
                            <tbody>
                                <TableHeaderRow />
                                {type === 'house' && <HousePrintPage2 data={data} parkingSummary={parkingSummary} activeMode={activeMode} />}
                                {type === 'land' && <LandPrintPage2 data={data} />}
                                {type === 'factory' && <FactoryPrintPage2 data={data} parkingSummary={parkingSummary} activeMode={activeMode} />}
                            </tbody>
                        </table>
                        <Footer showSignature={true} signatureImage={data.signatureImage} />
                    </div>
                </ScaledA4Wrapper>
            )}

            {(hasPage3 && (previewPage === 3 || exporting)) && (
                <ScaledA4Wrapper pageNum={3}>
                    <div className="flex-grow flex flex-col h-full text-black">
                         <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full">
                            <h1 className="text-3xl font-black tracking-[0.2em] text-center w-full text-black">幸福家不動產－業務版現況調查表</h1>
                            <div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【附件】</div>
                        </div>
                        <table className="excel-table mb-2 w-full text-black">
                            <tbody>
                                <TableHeaderRow />
                                <FactoryPrintPage3 data={data} />
                            </tbody>
                        </table>
                        <Footer showSignature={true} signatureImage={data.signatureImage} />
                    </div>
                </ScaledA4Wrapper>
            )}
        </div>
    );
});
                