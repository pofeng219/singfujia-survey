









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
            <div className="pl-4 text-black">
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
        <td className="w-28 text-center bg-gray-50 font-black whitespace-nowrap text-black">否/無異常</td>
        <td colSpan={9} className="py-1 font-bold bg-gray-100 text-center text-black">說明 / 檢查項目</td>
    </tr>
);

const BulletItem: React.FC<{ label: string, value: string, variant?: 'mobile' | 'a4' }> = ({ label, value, variant = 'a4' }) => (
    <div className={`font-bold text-[17px] mt-0.5 flex items-start leading-tight ${variant === 'mobile' ? 'text-slate-800 dark:text-slate-200' : 'text-black'}`}>
        <span className="mr-2 shrink-0">•</span>
        <span className="mr-1 shrink-0">{label}：</span>
        <span>{value}</span>
    </div>
);

const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden">
        <div className="transform -rotate-45 text-slate-300 text-[100px] font-black whitespace-nowrap tracking-widest opacity-25" style={{ textShadow: '0 0 5px rgba(0,0,0,0.05)' }}>
            幸福家不動產
        </div>
    </div>
);

// --- CONTENT HELPER COMPONENTS ---

const ParkingContent: React.FC<{ data: SurveyData, parkingSummary: any, activeMode: 'a4' | 'mobile', isFactory?: boolean }> = ({ data, parkingSummary, activeMode, isFactory }) => {
    const prVariant = activeMode === 'mobile' ? 'mobile' : 'default';
    const textColor = activeMode === 'mobile' ? 'text-slate-800 dark:text-slate-200' : 'text-black';

    if (isFactory && data.propertyType && ['透天獨棟廠房', '倉儲物流廠房', '其他'].includes(data.propertyType)) {
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
            {parkingSummary.showCarStatus && getParkingCarUsageLabel() && (<div><span className="font-bold mr-2">汽車車位使用情況:</span><span className="font-medium">{getParkingCarUsageLabel()}</span></div>)}
            {getParkingMotoUsageLabel() && <div><span className="font-bold mr-2">機車車位使用情況:</span><span className="font-medium">{getParkingMotoUsageLabel()}</span></div>}
            {(parkingSummary.showCarSize || parkingSummary.showWeight || parkingSummary.showHeight) && (
                <div className="flex flex-wrap gap-x-4">
                    <span className="font-bold">汽車車位尺寸:</span>
                    {data?.q10_measureType === '依謄本登記' && <span className="font-medium">[依謄本登記]</span>}
                    {data?.q10_measureType === '無法測量' && <span className="font-medium">[無法測量]</span>}
                    {data?.q10_measureType === '實際測量' && parkingSummary.showCarSize && (<><span>長:{data?.q10_dimL || '_'}m</span><span>寬:{data?.q10_dimW || '_'}m</span><span>高:{data?.q10_dimH || '_'}m</span></>)}
                    {parkingSummary.showWeight && !isFactory && <span>機械載重:{data?.q10_mechWeight || '_'}kg</span>}
                    {parkingSummary.showHeight && <span>車道出入口高度:{data?.q10_entryHeight || '_'}m</span>}
                </div>
            )}
            {(data?.q10_laneSection || data?.q10_laneNumber) && (
                <div><span className="font-bold mr-2">車道經過地號:</span><span className="font-medium">{formatAccessLandAddress(data.q10_laneSection, data.q10_laneSubSection, data.q10_laneNumber).replace('地號: ', '')}</span></div>
            )}
            {parkingSummary.showCharging && (<div><span className="font-bold mr-2">社區是否有充電樁？:</span><PreviewResult checked={data?.q10_charging === '是'} label="有" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '否'} label="無" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '僅預留管線/孔位'} label="僅預留管線/孔位" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '需經管委會同意'} label="需經管委會同意" variant={prVariant} /><PreviewResult checked={data?.q10_charging === '其他'} label="其他" suffix={': ' + (data?.q10_chargingOther || '')} variant={prVariant} /></div>)}
            {parkingSummary.isNoParking && (<div><span className="font-bold mr-2">停車方式:</span><PreviewResult checked={true} label="無車位" variant={prVariant} /></div>)}
        </div>
    );
};

const LandDisputeExproPreview = ({ data, titles }: { data: SurveyData, titles: { q3: string, q4: string } }) => (
    <>
        <SectionHeader title={titles.q3} />
        <CheckRow checked={data?.land_q3_survey === '否' || data?.land_q3_survey === '否 (未鑑界)'}>
            <span className="font-black mr-2">曾在兩年內進行土地鑑界？：</span>
            <PreviewResult checked={data?.land_q3_survey === '是' || data?.land_q3_survey === '是 (曾鑑界)'} label={`是 (${data.land_q3_survey_detail})`} />
            <PreviewResult checked={data?.land_q3_survey === '不確定 / 不知道'} label="不確定 / 不知道" />
            <PreviewResult checked={data?.land_q3_survey === '是 (但界釘已不明顯/須重新鑑界)'} label="是 (但界釘已不明顯/須重新鑑界)" />
            <PreviewResult checked={data?.land_q3_survey === '其他'} label={`其他 (${data.land_q3_survey_other})`} />
        </CheckRow>
        <CheckRow checked={data?.land_q3_dispute === '否' || data?.land_q3_dispute === '無糾紛'}>
            <span className="font-black mr-2">目前是否有糾紛？：</span>
            <PreviewResult checked={data?.land_q3_dispute === '是' || data?.land_q3_dispute === '有糾紛'} label={`是 (${data.land_q3_dispute_desc})`} />
            <PreviewResult checked={data?.land_q3_dispute === '疑似 / 處理中'} label={`疑似 / 處理中 (${data.land_q3_dispute_other})`} />
        </CheckRow>

        <SectionHeader title={titles.q4} />
        <CheckRow checked={data?.land_q4_expro === '否' || data?.land_q4_expro === '否 (非範圍內)'}>
            <span className="font-black mr-2">位於政府徵收地預定地？：</span>
            <PreviewResult checked={data?.land_q4_expro === '是' || data?.land_q4_expro === '是 (位於範圍內)'} label={`是 (位於範圍內) ${data.land_q4_expro_other}`} />
            <PreviewResult checked={data?.land_q4_expro === '查詢中 / 不確定'} label={`查詢中 / 不確定 ${data.land_q4_expro_other}`} />
        </CheckRow>
        <CheckRow checked={data?.land_q4_resurvey === '否' || data?.land_q4_resurvey === '否 (非範圍內)'}>
            <span className="font-black mr-2">位於重測區域範圍內？：</span>
            <PreviewResult checked={data?.land_q4_resurvey === '是' || data?.land_q4_resurvey === '是 (位於範圍內)'} label={`是 (位於範圍內) ${data.land_q4_resurvey_other}`} />
            <PreviewResult checked={data?.land_q4_resurvey === '查詢中 / 不確定'} label={`查詢中 / 不確定 ${data.land_q4_resurvey_other}`} />
        </CheckRow>
    </>
);

const LandAccessPreviewBuildingStyle = ({ data, title }: { data: SurveyData, title: string }) => {
    const access = data?.land_q2_access?.includes('正常') ? '正常' : (data?.land_q2_access?.includes('異常') ? '異常' : data?.land_q2_access);
    const ownership = data?.land_q2_owner;
    const protection = data?.land_q2_protection;
    const abnormalDesc = data?.land_q2_access_desc;
    
    const roadMat = data?.land_q2_material;
    const roadMatOther = data?.land_q2_material_other;
    const roadWidth = data?.land_q2_roadWidth;
    const ditch = data?.land_q2_ditch;
    const ditchOther = data?.land_q2_ditch_other;

    const isNormal = access === '正常';
    const isAbnormal = access === '異常';
    const isLandlocked = access?.includes('袋地');

    return (
        <>
            <SectionHeader title={title} />
            <CheckRow checked={isNormal}>
                <PreviewResult checked={isNormal} label={`正常 [${ownership || ''}${protection ? `/${protection}` : ''}] ${formatAccessLandAddress(data.land_q2_access_section, data.land_q2_access_subSection, data.land_q2_access_number)}`} />
                <PreviewResult checked={isAbnormal} label={`異常 (${abnormalDesc})`} />
                <PreviewResult checked={!!isLandlocked} label="袋地" />
            </CheckRow>
            {(isNormal || isAbnormal) && (
                <CheckRow checked={false}>
                    <PreviewResult checked={!!roadMat} label="路面材質" suffix={roadMat === '其他' ? `: ${roadMatOther}` : `: ${roadMat}`} />
                    {roadWidth && <span className="mx-2">/</span>}
                    {roadWidth && <span className="font-bold">路寬:{roadWidth}米</span>}
                    <span className="mx-2">/</span>
                    <PreviewResult checked={!!ditch} label="排水溝" suffix={ditch === '其他' ? `: ${ditchOther}` : `: ${ditch}`} />
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
                    <div className="text-3xl font-black italic text-sky-500">幸福家不動產</div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider mt-1 block leading-tight">※本調查內容僅供公司內部參考，實際應以權狀及產調為準</span>
                    <span className="text-[9px] text-gray-400 mt-1 font-mono tracking-tighter">Exported: {timestamp}</span>
                </div>
            )}
        </div>
    );
};

// --- LOGIC EXTRACTORS ---

const getEnvFacilitiesLabel = (data: SurveyData) => {
    if (data?.q16_noFacilities) return "無重要環境設施";
    const labels = [...(data?.q16_items || [])];
    if (data?.q16_hasOther && data.q16_other) labels.push(`其他: ${data.q16_other}`);
    return labels.join('、');
};

const getHouseLabels = (data: SurveyData) => {
    const q1 = () => {
        const labels = data?.q1_items?.map(i => i === "地下室增建" && data.q1_basementPartition ? "地下室增建(內含隔間)" : i) || [];
        if (data?.q1_hasOther && data.q1_other) labels.push(`其他: ${data.q1_other}`);
        return labels.join(', ');
    };
    const q3 = () => {
        if (data?.q3_ceilingWrapped || data?.q3_leakType === '全屋天花板包覆') return "全屋天花板包覆";
        const locations = [...(data?.q3_locations || [])];
        if (data?.q3_suspected && data.q3_suspectedDesc) locations.push(`疑似: ${data.q3_suspectedDesc}`);
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
        if (data?.q4_ceilingWrapped) labels.push("全屋天花板包覆");
        if (data?.q4_suspected && data.q4_suspectedDesc) labels.push(`疑似: ${data.q4_suspectedDesc}`);
        if (data?.q4_hasOther && data.q4_otherDesc) labels.push(`其他: ${data.q4_otherDesc}`);
        return labels.join(', ');
    };
    const q6 = () => {
        const labels = [...(data?.q8_stairItems || [])];
        if (data?.q8_stairItems?.includes('其他') && data.q8_stairOther) labels.push(data.q8_stairOther);
        return labels.join(', ');
    };
    const q7 = () => {
        const labels = [...(data?.q7_items || [])];
        if (data?.q7_hasOther && data.q7_otherDesc) labels.push(`其他: ${data.q7_otherDesc}`);
        return labels.join(', ');
    };
    const q9 = () => {
        const labels = data?.q9_items?.map(i => i === "太陽能光電發電設備" && data.q9_solar_maintenance ? `太陽能光電發電設備(${data.q9_solar_maintenance})` : i) || [];
        if (data?.q9_hasOther && data.q9_otherDesc) labels.push(`其他: ${data.q9_otherDesc}`);
        return labels.join(', ');
    };
    return { q1, q3, q4, q6, q7, q9 };
};

// --- PRINT PAGE SUB-COMPONENTS ---

// LEGACY COMPONENTS FOR FACTORY (Updated for vertical split)
const HousePrintPage1Factory = ({ data, hideUtilities = false }: { data: SurveyData, hideUtilities?: boolean }) => {
    const labels = getHouseLabels(data);
    return (
        <>
            <SectionHeader title="1. 增建情況與占用/被占用情況" />
            <CheckRow checked={data?.q1_hasExt === '否'}>
                <span className="font-black mr-2">是否有增建情況？：</span>
                <PreviewResult checked={data?.q1_hasExt === '是'} label={labels.q1()} />
            </CheckRow>
            
            {/* Split Q2 into vertical rows */}
            <CheckRow checked={data?.q2_hasOccupancy === '否'}>
                <span className="font-black mr-2">占用鄰地：</span>
                <PreviewResult checked={data?.q2_hasOccupancy !== '否' && !!data?.q2_hasOccupancy} label={data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '')} />
            </CheckRow>
            <CheckRow checked={data?.q2_other_occupancy === '否'}>
                <span className="font-black mr-2">被占用：</span>
                <PreviewResult checked={data?.q2_other_occupancy !== '否' && !!data?.q2_other_occupancy} label={data?.q2_other_occupancy + (data?.q2_other_occupancy_desc ? ': ' + data.q2_other_occupancy_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="2. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？" />
            <CheckRow checked={data?.q6_hasIssue === '相符 (無明顯差異)'}>
                <span className="font-black mr-2">面積測量：</span>
                <PreviewResult checked={data?.q6_hasIssue !== '相符 (無明顯差異)' && !!data?.q6_hasIssue} label={data?.q6_hasIssue + (data?.q6_desc ? ': ' + data.q6_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="3. 是否有滲漏水、壁癌等情況？" />
            <CheckRow checked={data?.q3_hasLeak === '否'}>
                <span className="font-black mr-2">滲漏水/壁癌：</span>
                <PreviewResult checked={data?.q3_hasLeak === '是'} label={labels.q3()} />
                <PreviewResult checked={data?.q3_hasLeak === '否'} label="無" />
                {data?.q3_repairHistory === '有修繕紀錄' && (
                    <span className="font-bold ml-2 text-slate-600">
                        (曾有修繕: {data.q3_repairDesc})
                    </span>
                )}
            </CheckRow>
            
            <SectionHeader title="4. 建物結構安全評估 (含瑕疵與傾斜)" />
            {/* Split Q4/Q5 into vertical rows */}
            <CheckRow checked={data?.q4_hasIssue === '否'}>
                <span className="font-black mr-2">結構瑕疵：</span>
                <PreviewResult checked={data?.q4_hasIssue === '是'} label={labels.q4()} />
                <PreviewResult checked={data?.q4_hasIssue === '否'} label="無" />
            </CheckRow>
            <CheckRow checked={data?.q5_hasTilt === '否'}>
                <span className="font-black mr-2">傾斜情況：</span>
                <PreviewResult checked={data?.q5_hasTilt !== '否' && !!data?.q5_hasTilt} label={data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '')} />
                <PreviewResult checked={data?.q5_hasTilt === '否'} label="無" />
            </CheckRow>

            {!hideUtilities && (
                <>
                    <SectionHeader title="5. 電、水與瓦斯使用情況" />
                    <CheckRow checked={data?.q7_hasIssue === '否'}>
                        {data?.q7_gasType && <div className="mb-1 text-black"><span className="font-bold">瓦斯類型：</span>{data.q7_gasType}</div>}
                        <span className="font-black mr-2">水電瓦斯是否有異常：</span>
                        <PreviewResult checked={data?.q7_hasIssue === '是'} label={labels.q7() || '異常'} />
                    </CheckRow>
                </>
            )}
        </>
    );
};

// COMMON EXTRA - Modified for flexibility
const CommonExtraQuestionsFactory = ({ data, startIdx, type, hasPage3 = false }: { data: SurveyData, startIdx: number, type: SurveyType, hasPage3?: boolean }) => (
    <>
        {type === 'house' && (
            <>
                <SectionHeader title={`${startIdx}. 本案進出情況`} />
                <CheckRow checked={data?.q14_access === '正常'}>
                    <PreviewResult checked={data?.q14_access === '正常'} label={`正常 [${data.q14_ownership || ''}${data.q14_protection ? `/${data.q14_protection}` : ''}] ${formatAccessLandAddress(data.q14_section, data.q14_subSection, data.q14_number)}`} />
                    <PreviewResult checked={data?.q14_access === '異常'} label={`異常 (${data.q14_abnormalDesc})`} />
                    <PreviewResult checked={data?.q14_access === '袋地'} label="袋地" />
                </CheckRow>
                {(data.q14_access === '正常' || data.q14_access === '異常') && (
                    <CheckRow checked={false}>
                        <PreviewResult checked={!!data.q14_roadMaterial} label="路面材質" suffix={data.q14_roadMaterial === '其他' ? `: ${data.q14_roadMaterialOther}` : `: ${data.q14_roadMaterial}`} />
                        {data.q14_roadWidth && <span className="mx-2">/</span>}
                        {data.q14_roadWidth && <span className="font-bold">路寬:{data.q14_roadWidth}米</span>}
                        <span className="mx-2">/</span>
                        <PreviewResult checked={!!data.q14_ditch} label="排水溝" suffix={data.q14_ditch === '其他' ? `: ${data.q14_ditchOther}` : `: ${data.q14_ditch}`} />
                    </CheckRow>
                )}
            </>
        )}
        
        {/* If Page 3 exists, Env and Notes are moved there. Only show here if NO Page 3. */}
        {!hasPage3 && (
            <>
                <SectionHeader title={type === 'house' ? '10. 重要環境設施' : `${type === 'factory' ? startIdx : startIdx + 1}. 重要環境設施`} />
                <CheckRow checked={data?.q16_noFacilities}>
                    <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>
                </CheckRow>

                <SectionHeader title={type === 'house' ? `${startIdx + 2}. 本案或本社區是否有須注意的設施？` : `${type === 'factory' ? startIdx + 1 : startIdx + 2}. 本案或本區是否有特別注意的事項？`} />
                <CheckRow checked={data?.q17_issue === '否'}>
                    <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
                    <PreviewResult checked={data?.q17_issue === '否'} label="無" />
                </CheckRow>
            </>
        )}
    </>
);

// NEW COMPONENTS FOR HOUSE (LAND STYLE)

const CommonExtraQuestions = ({ data, startIdx, type }: { data: SurveyData, startIdx: number, type: SurveyType }) => (
    <>
        {type === 'house' && (
            <>
                <SectionHeader title={`${startIdx}. 本案進出情況`} />
                <CheckRow checked={data?.q14_access === '正常'}>
                    <span className="font-black mr-2">進出情況？：</span>
                    <PreviewResult checked={data?.q14_access === '正常'} label={`正常 [${data.q14_ownership || ''}${data.q14_protection ? `/${data.q14_protection}` : ''}] ${formatAccessLandAddress(data.q14_section, data.q14_subSection, data.q14_number)}`} />
                    <PreviewResult checked={data?.q14_access === '異常'} label={`異常 (${data.q14_abnormalDesc})`} />
                    <PreviewResult checked={data?.q14_access === '袋地'} label="袋地" />
                </CheckRow>
                {(data.q14_access === '正常' || data.q14_access === '異常') && (
                    <CheckRow checked={false}>
                        <PreviewResult checked={!!data.q14_roadMaterial} label="路面材質" suffix={data.q14_roadMaterial === '其他' ? `: ${data.q14_roadMaterialOther}` : `: ${data.q14_roadMaterial}`} />
                        {data.q14_roadWidth && <span className="mx-2">/</span>}
                        {data.q14_roadWidth && <span className="font-bold">路寬:{data.q14_roadWidth}米</span>}
                        <span className="mx-2">/</span>
                        <PreviewResult checked={!!data.q14_ditch} label="排水溝" suffix={data.q14_ditch === '其他' ? `: ${data.q14_ditchOther}` : `: ${data.q14_ditch}`} />
                    </CheckRow>
                )}
            </>
        )}
        
        <SectionHeader title={type === 'house' ? '10. 重要環境設施' : `${type === 'factory' ? startIdx : startIdx + 1}. 重要環境設施`} />
        <CheckRow checked={data?.q16_noFacilities}>
             <span className="font-black mr-2">重要環境設施？：</span>
             {!data?.q16_noFacilities && <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>}
        </CheckRow>

        <SectionHeader title={type === 'house' ? `${startIdx + 2}. 本案或本社區是否有須注意的事項？` : `${type === 'factory' ? startIdx + 1 : startIdx + 2}. 本案或本區是否有特別注意的事項？`} />
        <CheckRow checked={data?.q17_issue === '否'}>
             <span className="font-black mr-2">注意事項？：</span>
            <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
        </CheckRow>
    </>
);

const HousePrintPage1 = ({ data }: { data: SurveyData }) => {
    const labels = getHouseLabels(data);
    return (
        <>
            <TableHeaderRow />
            <SectionHeader title="1. 增建情況與占用/被占用情況" />
            <CheckRow checked={data?.q1_hasExt === '否'}>
                <span className="font-black mr-2">是否有增建情況？：</span>
                <PreviewResult checked={data?.q1_hasExt === '是'} label={labels.q1()} />
            </CheckRow>
            
            <CheckRow checked={data?.q2_hasOccupancy === '否'}>
                <span className="font-black mr-2">占用鄰地？：</span>
                <PreviewResult checked={data?.q2_hasOccupancy !== '否' && !!data?.q2_hasOccupancy} label={data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '')} />
            </CheckRow>
            <CheckRow checked={data?.q2_other_occupancy === '否'}>
                <span className="font-black mr-2">被占用？：</span>
                <PreviewResult checked={data?.q2_other_occupancy !== '否' && !!data?.q2_other_occupancy} label={data?.q2_other_occupancy + (data?.q2_other_occupancy_desc ? ': ' + data.q2_other_occupancy_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="2. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？" />
            <CheckRow checked={data?.q6_hasIssue === '相符 (無明顯差異)'}>
                <span className="font-black mr-2">面積測量？：</span>
                <PreviewResult checked={data?.q6_hasIssue !== '相符 (無明顯差異)' && !!data?.q6_hasIssue} label={data?.q6_hasIssue + (data?.q6_desc ? ': ' + data.q6_desc : '')} />
            </CheckRow>
            
            <SectionHeader title="3. 是否有滲漏水、壁癌等情況？" />
            <CheckRow checked={data?.q3_hasLeak === '否'}>
                <span className="font-black mr-2">滲漏水/壁癌？：</span>
                <PreviewResult checked={data?.q3_hasLeak === '是'} label={labels.q3()} />
                {data?.q3_repairHistory === '有修繕紀錄' && (
                    <span className="font-bold ml-2 text-slate-600">
                        (曾有修繕: {data.q3_repairDesc})
                    </span>
                )}
            </CheckRow>
            
            <SectionHeader title="4. 建物結構安全評估 (含瑕疵與傾斜)" />
            <CheckRow checked={data?.q4_hasIssue === '否'}>
                 <span className="font-black mr-2">結構瑕疵？：</span>
                 <PreviewResult checked={data?.q4_hasIssue === '是'} label={labels.q4()} />
            </CheckRow>
            <CheckRow checked={data?.q5_hasTilt === '否'}>
                 <span className="font-black mr-2">傾斜情況？：</span>
                 <PreviewResult checked={data?.q5_hasTilt !== '否' && !!data?.q5_hasTilt} label={data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '')} />
            </CheckRow>

            <SectionHeader title="5. 電、水與瓦斯使用情況" />
            
            <CheckRow checked={data?.water_booster === '無'}>
                <span className="font-black mr-2">是否設置用戶加壓受水設備：</span>
                <PreviewResult checked={data?.water_booster === '有'} label="有" />
                <PreviewResult checked={data?.water_booster === '其他'} label={`其他 (${data.water_booster_desc})`} />
            </CheckRow>

            <CheckRow checked={data?.q7_hasIssue === '否'}>
                {data?.q7_gasType && <div className="mb-1 text-black"><span className="font-bold">瓦斯類型：</span>{data.q7_gasType}</div>}
                
                <span className="font-black mr-2">水電瓦斯是否有異常：</span>
                <PreviewResult checked={data?.q7_hasIssue === '是'} label={labels.q7() || '異常'} />
            </CheckRow>
        </>
    );
};

const HousePrintPage2 = ({ data, parkingSummary, activeMode }: { data: SurveyData, parkingSummary: any, activeMode: any }) => {
    const labels = getHouseLabels(data);
    return (
        <>
            <SectionHeader title="大樓/社區公共設施 (可否進入/使用)" />
            {/* Note: If has public facilities, it's NOT NO, NOT UNABLE. It's Normal. */}
            <CheckRow checked={data?.publicFacilities === '有公共設施' || data?.publicFacilities === '無公共設施'}>
                <span className="font-black mr-2">公共設施？：</span>
                <PreviewResult checked={data?.publicFacilities === '無法進入'} label={`無法進入 (${data.publicFacilitiesReason})`} />
                {/* Hide text for normal cases as per land style if checked */}
            </CheckRow>

            <SectionHeader title="6. 電(樓)梯間、公共地下室等有無異常" />
            <CheckRow checked={data?.q8_stairIssue === '否'}>
                <span className="font-black mr-2">梯間/地下室異常？：</span>
                <PreviewResult checked={data?.q8_stairIssue === '是'} label={labels.q6()} />
            </CheckRow>
            
            <SectionHeader title="7. 本案或本社區是否有須注意的設施？" />
            <CheckRow checked={data?.q9_hasIssue === '否'}>
                 <span className="font-black mr-2">須注意設施？：</span>
                <PreviewResult checked={data?.q9_hasIssue === '是'} label={labels.q9()} />
            </CheckRow>

            <SectionHeader title="8. 車位資訊" />
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{data?.q10_noParking ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <span className="font-bold mr-2">車位資訊:</span>
                    {!data?.q10_noParking && <ParkingContent data={data} parkingSummary={parkingSummary} activeMode={activeMode} />}
                </td>
            </tr>
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && data?.q11_hasIssue === '否') ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <div className="flex flex-wrap items-center">
                        <span className="font-black mr-2">車位使用是否異常？：</span>
                        <PreviewResult checked={data?.q11_hasIssue === '是'} label={[...(data?.q11_items || []), data?.q11_hasOther ? `其他: ${data.q11_other}` : ''].filter(Boolean).join(', ') || '異常'} />
                    </div>
                </td>
            </tr>
            <tr className="text-black">
                <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                <td colSpan={9} className="py-1 px-4 text-left text-black">
                    <div className="flex flex-wrap items-center">
                        <span className="font-black mr-2">車位現況補充：</span>
                        <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                    </div>
                </td>
            </tr>
            
            <CommonExtraQuestions data={data} startIdx={9} type="house" />
        </>
    );
};

const LandPrintPage1 = ({ data }: { data: SurveyData }) => {
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

    return (
        <>
            <TableHeaderRow />
            <SectionHeader title="1. 電、水與其他設施使用情況" />
            <CheckRow checked={data?.land_q1_elec === '否'}>
                <span className="font-black mr-2">是否電力供應？：</span>
                <PreviewResult checked={data?.land_q1_elec !== '否' && !!data?.land_q1_elec} label={getLandElecSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q1_water === '否'}>
                <span className="font-black mr-2">是否水源供應？：</span>
                <PreviewResult checked={data?.land_q1_water !== '否' && !!data?.land_q1_water} label={getLandWaterSummary()} />
            </CheckRow>
            <CheckRow checked={data?.water_booster === '無'}>
                <span className="font-black mr-2">是否設置用戶加壓受水設備：</span>
                <PreviewResult checked={data?.water_booster === '有'} label="有" />
                <PreviewResult checked={data?.water_booster === '其他'} label={`其他 (${data.water_booster_desc})`} />
            </CheckRow>
            <CheckRow checked={data?.land_q1_other_new === '否'}>
                <span className="font-black mr-2">是否其他設施？：</span>
                <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
            </CheckRow>

            <LandDisputeExproPreview data={data} titles={{ q3: '2. 曾在兩年內進行土地鑑界/目前是否有糾紛？', q4: '3. 徵收地預定地/重測區域範圍內？' }} />
            
            <SectionHeader title="4. 被越界占用/占用鄰地情況？" />
            <CheckRow checked={data?.land_q5_encroached === '否'}>
                <span className="font-black mr-2">本案是否有被 [他人] 越界占用？：</span>
                <PreviewResult checked={data?.land_q5_encroached !== '否' && !!data?.land_q5_encroached} label={data?.land_q5_encroached + (data.land_q5_encroached_desc ? `: ${data.land_q5_encroached_desc}` : '')} />
            </CheckRow>
            <CheckRow checked={data?.land_q5_encroaching === '否'}>
                <span className="font-black mr-2">本案是否有 [占用他人] 鄰地情況？：</span>
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
        if (data?.land_q7_crops === '有農作物/植栽') {
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
        if (data?.land_q7_build === '有建築物/工作物') {
            let parts = [data.land_q7_build_type];
            if (data.land_q7_build_type === '有保存登記' || data.land_q7_build_type === '未保存登記') {
                if (data.land_q7_build_ownership) {
                    let status = data.land_q7_build_ownership;
                    if (status === '其他') {
                        const detail = data.land_q7_build_type === '有保存登記' ? data.land_q7_build_reg_detail : data.land_q7_build_unreg_detail;
                        if (detail) status += `: ${detail}`;
                    }
                    parts.push(status);
                }
            } else if (data.land_q7_build_type === '宗教/殯葬設施' && data.land_q7_build_rel_detail) parts.push(data.land_q7_build_rel_detail);
            else if (data.land_q7_build_type === '其他' && data.land_q7_build_other) parts.push(data.land_q7_build_other);
            return `有 (${parts.join(', ')})`;
        }
        return '';
    };

    return (
        <>
            <SectionHeader title="5. 目前是否有禁建、限建的情況？" />
            <CheckRow checked={data?.land_q6_limit === '否'}>
                <PreviewResult checked={data?.land_q6_limit === '是'} label={`是 (${data.land_q6_limit_desc})`} />
                <PreviewResult checked={data?.land_q6_limit === '無'} label="無" />
            </CheckRow>

            <SectionHeader title="6. 土地使用現況與地上物" />
            <CheckRow checked={data?.land_q7_user === '無'}>
                <span className="font-black mr-2">現況使用人？：</span>
                <PreviewResult checked={data?.land_q7_user !== '無' && !!data?.land_q7_user} label={getLandUserSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q7_crops === '無'}>
                <span className="font-black mr-2">地上定著物-農作物？：</span>
                <PreviewResult checked={data?.land_q7_crops !== '無' && !!data?.land_q7_crops} label={getLandCropsSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q7_build === '無'}>
                <span className="font-black mr-2">地上定著物-建物？：</span>
                <PreviewResult checked={data?.land_q7_build !== '無' && !!data?.land_q7_build} label={getLandBuildSummary()} />
            </CheckRow>
            <CheckRow checked={data?.land_q7_solar === '無'}>
                <span className="font-black mr-2">太陽能光電發電設備？：</span>
                <PreviewResult checked={data?.land_q7_solar === '合法設置'} label="合法設置" />
                <PreviewResult checked={data?.land_q7_solar === '私下設置'} label="私下設置" />
            </CheckRow>
            
            <LandAccessPreviewBuildingStyle data={data} title="7. 土地進出通行與臨路的情況？" />

            <SectionHeader title="8. 土壤與地下埋設物" />
            <CheckRow checked={data?.soil_q1_status === '無'}>
                <span className="font-black mr-2">本案土地是否有被公告為汙染控制場址或有地下埋設物？：</span>
                <PreviewResult checked={data?.soil_q1_status === '有'} label={`有 (${data.soil_q1_desc})`} />
                <PreviewResult checked={data?.soil_q1_status === '無'} label="無" />
                <PreviewResult checked={data?.soil_q1_status === '不確定'} label="不確定" />
            </CheckRow>

            <SectionHeader title="9. 重要環境設施" />
            <CheckRow checked={data?.q16_noFacilities}>
                <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>
            </CheckRow>

            <SectionHeader title="10. 本案或周圍是否有須注意的事項？" />
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
    const isHiRise = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "標準廠房(工業園區內)");
    
    // Compact Helpers
    const getElevatorStr = () => {
        if (!data.factory_elevator) return '';
        if (data.factory_elevator === '無') return '無';
        const status = data.factory_elevator_working ? '可運作' : '故障';
        let s = `有 (${status}`;
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
        if (data.factory_crane === '有軌道/樑，無主機') return '有軌道無主機';
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
         return data.factory_waste + (data.factory_waste === '其他' ? `: ${data.factory_waste_desc}` : '');
    };
    const getFactoryFireLabel = () => {
        const labels = [...(data?.factory_fire_safety || [])];
        if (data?.factory_fire_safety?.includes("其他") && data.factory_fire_safety_other) labels.push(data.factory_fire_safety_other);
        return labels.join('、');
    };
    const getLandWaterSummary = () => {
        if (data?.land_q1_water === '否' || !data?.land_q1_water) return data?.land_q1_water || '';
        if (data?.land_q1_water === '其他') return `其他: ${data.land_q1_water_other}`;
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
                        <div><span className="font-black">{isHiRise ? "樑下淨高 / 樓層高度" : "滴水高度"}：</span>{data.factory_height}米</div>
                        <div><span className="font-black">柱距：</span>{data.factory_column_spacing}米</div>
                        <div><span className="font-black">樓板載重：</span>{data.factory_floor_load ? `${data.factory_floor_load} kg/m²` : ''}</div>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-1">
                        <div><span className="font-black">地坪狀況：</span>{data.factory_floor_condition + (data.factory_floor_condition === '其他' ? `(${data.factory_floor_condition_other})` : '')}</div>
                        <div><span className="font-black">消防設施：</span>{getFactoryFireLabel()}</div>
                    </div>
                </div>
            </CheckRow>

            <SectionHeader title="6. 電、水與其他設施使用情況" />
            <CheckRow checked={!!data?.land_q1_elec?.startsWith("無電力")}>
                <div className="flex flex-wrap items-start text-black">
                    <span className="font-black mr-2 shrink-0">供電類型：</span>
                    <PreviewResult checked={!!data?.land_q1_elec} label={data?.land_q1_elec} />
                    {data?.land_q1_elec === '其他' && data?.land_q1_elec_other && ` (${data.land_q1_elec_other})`}
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
            <CheckRow checked={data?.water_booster === '無'}>
                <div className="flex items-center text-black">
                    <span className="font-black mr-2">加壓受水設備：</span>
                    <PreviewResult checked={data?.water_booster === '有'} label="有" />
                    <PreviewResult checked={data?.water_booster === '其他'} label={`其他 (${data.water_booster_desc})`} />
                    <PreviewResult checked={data?.water_booster === '無'} label="無" />
                </div>
            </CheckRow>
            <CheckRow checked={data?.land_q1_other_new === '否'}>
                <div className="flex items-center text-black">
                    <span className="font-black mr-2">其他設施：</span>
                    <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
                    <PreviewResult checked={data?.land_q1_other_new === '否'} label="無" />
                </div>
            </CheckRow>
            
            <SectionHeader title="7. 廠房硬體設施" />
            <CheckRow checked={data.factory_elevator === '無'}>
                 <span className="font-black mr-2">貨梯：</span>{getElevatorStr()}
            </CheckRow>
            <CheckRow checked={data.factory_crane === '無'}>
                 <span className="font-black mr-2">天車：</span>{getCraneStr()}
            </CheckRow>
            <CheckRow checked={data.factory_waste === '無'}>
                 <span className="font-black mr-2">廢水/氣：</span>{getWasteStr()}
            </CheckRow>

            <SectionHeader title="8. 物流動線" />
            <CheckRow checked={data.factory_loading_dock === '無'}>
                 <span className="font-black mr-2">卸貨碼頭：</span>{data.factory_loading_dock || ''}
            </CheckRow>
            <CheckRow checked={false}>
                 <span className="font-black mr-2">大車進出：</span>{data.factory_truck_access || ''} {data.factory_truck_buffer ? `(${data.factory_truck_buffer})` : ''}
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
    const hideLandDetails = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "標準廠房(工業園區內)");
    const isHiRise = (data.propertyType === "立體化廠辦大樓");
    const hideSoil = isHiRise;
    const labels = getHouseLabels(data); // Reuse house labels logic for q9 facilities

    let idx = 10;

    return (
        <>
            <SectionHeader title={`${idx}. 本案或本社區是否有須注意的設施？`} />
            <CheckRow checked={data?.q9_hasIssue === '否'}>
                 <span className="font-black mr-2">須注意設施？：</span>
                <PreviewResult checked={data?.q9_hasIssue === '是'} label={labels.q9()} />
            </CheckRow>

            <SectionHeader title={`${++idx}. 廠房進出通行與臨路的情況？`} />
            <CheckRow checked={data.land_q2_access?.includes('正常')}>
                {(() => {
                    const acc = data.land_q2_access;
                    if (acc?.includes('正常')) {
                        const mat = data.land_q2_material === '其他' ? data.land_q2_material_other : data.land_q2_material;
                        const ditch = data.land_q2_ditch === '其他' ? data.land_q2_ditch_other : data.land_q2_ditch;
                        const ditchStr = ditch === '有' ? '有水溝' : (ditch === '無' ? '無水溝' : ditch);
                        const roadWidth = data.land_q2_roadWidth ? `路寬:${data.land_q2_roadWidth}米` : '';
                        
                        return (
                            <div>
                                正常 
                                {data.land_q2_owner ? ` (${data.land_q2_owner}${data.land_q2_protection ? '/' + data.land_q2_protection : ''})` : ''} 
                                {mat || ditchStr ? ` [${mat || '-'}/${ditchStr || '-'}]` : ''}
                                {roadWidth ? ` [${roadWidth}]` : ''}
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
                 <LandDisputeExproPreview data={data} titles={{ q3: `${++idx}. 曾在兩年內進行土地鑑界/目前是否有糾紛？`, q4: `${++idx}. 徵收地預定地/重測區域範圍內？` }} />
            )}

            {!hideSoil && (
                <>
                    <SectionHeader title={`${++idx}. 土壤與地下埋設物`} />
                    <CheckRow checked={data?.soil_q1_status === '無'}>
                        <span className="font-black mr-2">本案土地是否有被公告為汙染控制場址或有地下埋設物？：</span>
                        <PreviewResult checked={data?.soil_q1_status === '有'} label={`有 (${data.soil_q1_desc})`} />
                        <PreviewResult checked={data?.soil_q1_status === '無'} label="無" />
                        <PreviewResult checked={data?.soil_q1_status === '不確定'} label="不確定" />
                    </CheckRow>
                </>
            )}

            <SectionHeader title={`${++idx}. 重要環境設施`} />
            <CheckRow checked={data?.q16_noFacilities}>
                <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>
            </CheckRow>

            <SectionHeader title={`${++idx}. 本案或本區是否有特別注意的事項？`} />
            <CheckRow checked={data?.q17_issue === '否'}>
                <PreviewResult checked={data?.q17_issue === '是'} label={data?.q17_desc} />
                <PreviewResult checked={data?.q17_issue === '否'} label="無" />
            </CheckRow>
        </>
    );
};

// --- MAIN COMPONENT ---

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ data, type, exporting, previewScale, previewPage, setPreviewPage, page1Ref, page2Ref, page3Ref, isMobile = false }) => {
    const [viewMode, setViewMode] = useState<'a4' | 'mobile'>('a4');

    useEffect(() => {
        if (isMobile) {
            setViewMode('mobile');
        } else {
            setViewMode('a4');
        }
    }, [isMobile]);

    const activeMode = exporting ? 'a4' : viewMode;

    // Detect if we need page 3 (All factory types now use 3 pages)
    const hasPage3 = type === 'factory';

    const parkingSummary = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;
        const isPlaneType = pts.includes("坡道平面") || pts.includes("一樓平面") || pts.includes("法定空地/自家門前");

        return {
            isNoParking,
            showMethod: !isNoParking,
            showNumber: !isNoParking && !isOtherPt && (data?.q10_parkingNumberType === 'number' || data?.q10_parkingNumberType === 'none'),
            showCarStatus: !isNoParking && !isOtherPt && ((data?.q10_carUsage || []).length > 0 || data?.q10_hasCarUsageOther),
            showCarSize: !isNoParking && !isOtherPt && data?.q10_measureType !== '無法測量' && !pts.includes("法定空地/自家門前"),
            showWeight: !isNoParking && !isOtherPt && !isPlaneType && data?.q10_mechWeight,
            showHeight: !isNoParking && !isOtherPt && !pts.includes("法定空地/自家門前") && data?.q10_entryHeight,
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
                            <span className="font-black text-[15px]">{(type === 'factory' || type === 'house') ? '本物件型態與現況：' : '本物件現況：'}</span>
                            {(type === 'factory' || type === 'house') && (
                                <PreviewResult checked={!!data?.propertyType} label={data?.propertyType} suffix={data?.propertyType === '其他' ? `: ${data.propertyTypeOther}` : ''} />
                            )}
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
            </tbody>
        </table>
    );

    // --- RENDER ---

    if (activeMode === 'mobile') {
        const labels = getHouseLabels(data); 
        
        // Helper for consistent Mobile Section rendering
        const MobileSection = ({ title, content, isAlert = false }: any) => (
             <div className="pt-4 first:pt-0 border-t border-slate-100 dark:border-slate-800 first:border-0">
                <p className="font-black text-lg text-slate-500 mb-1 dark:text-slate-400">{title}</p>
                <p className={`text-xl font-bold ${isAlert ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {content || '無'}
                </p>
            </div>
        );

        return (
            <div className="w-full max-w-2xl px-4 py-6 bg-slate-50 min-h-full dark:bg-slate-950 transition-colors duration-300">
                {isMobile && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                        <p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">
                            💡 手機版：可左右拖曳，亦可雙指放大縮小檢視
                        </p>
                    </div>
                )}
                {isMobile && (
                    <div className="flex bg-white p-2 rounded-2xl shadow-sm mb-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <button onClick={() => setViewMode('mobile')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'mobile' ? 'bg-orange-500 text-white shadow-md dark:bg-orange-600' : 'text-slate-400 dark:text-slate-500'}`}>
                            <Smartphone className="w-5 h-5" /> 手機好讀版
                        </button>
                        <button onClick={() => setViewMode('a4')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'a4' ? 'bg-slate-800 text-white shadow-md dark:bg-slate-700' : 'text-slate-400 dark:text-slate-500'}`}>
                            <FileText className="w-5 h-5" /> A4 列印版
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                        <h3 className="text-2xl font-black text-slate-800 mb-4 border-b-4 border-orange-200 pb-2 inline-block dark:text-slate-100 dark:border-orange-800">基本資料</h3>
                        <div className="space-y-3">
                            <BulletItem label="案名" value={data?.caseName || '-'} variant="mobile" />
                            <BulletItem label="編號" value={data?.authNumber || '-'} variant="mobile" />
                            <BulletItem label="地址" value={data?.address || '-'} variant="mobile" />
                            <BulletItem label="業務" value={data?.agentName || '-'} variant="mobile" />
                            <BulletItem label="日期" value={formatDateROC(data?.fillDate || '')} variant="mobile" />
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                        <h3 className="text-2xl font-black text-slate-800 mb-4 border-b-4 border-sky-200 pb-2 inline-block dark:text-slate-100 dark:border-sky-800">調查內容</h3>
                        <div className="space-y-6">
                            
                            {(type === 'house' || type === 'factory') && (<>
                                <MobileSection title="1. 增建情況" content={data?.q1_hasExt === '是' ? `有：${labels.q1()}` : '無'} />
                                <MobileSection title="2. 占用鄰地" content={data?.q2_hasOccupancy !== '否' && data?.q2_hasOccupancy ? data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '') : '無'} />
                                <MobileSection title="3. 被占用" content={data?.q2_other_occupancy !== '否' && data?.q2_other_occupancy ? data?.q2_other_occupancy + (data?.q2_other_occupancy_desc ? ': ' + data.q2_other_occupancy_desc : '') : '無'} />
                                <MobileSection title="4. 面積測量" content={data?.q6_hasIssue === '相符 (無明顯差異)' ? '相符' : (data.q6_hasIssue ? `異常: ${data.q6_desc}` : '-')} />
                                <MobileSection title="5. 滲漏水/壁癌" content={data?.q3_hasLeak === '是' ? `有：${labels.q3()}${data?.q3_repairHistory === '有修繕紀錄' ? ` (修繕:${data.q3_repairDesc})` : ''}` : '無'} />
                                <MobileSection title="6. 結構瑕疵" content={data?.q4_hasIssue === '是' ? `異常：${labels.q4()}` : '正常'} />
                                <MobileSection title="7. 傾斜情況" content={data?.q5_hasTilt !== '否' && data?.q5_hasTilt ? data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '') : '無'} />
                                
                                {type === 'house' && (
                                    <>
                                        <MobileSection title="8. 水電瓦斯" content={data?.q7_hasIssue === '是' ? `異常：${labels.q7()}` : `正常 (${data.q7_gasType || '-'})`} />
                                        <MobileSection title="9. 公共設施" content={data?.publicFacilities === '無法進入' ? `無法進入 (${data.publicFacilitiesReason})` : '正常 (可進入)'} />
                                        <MobileSection title="10. 梯間/地下室" content={data?.q8_stairIssue === '是' ? `異常：${labels.q6()}` : '正常'} />
                                        <MobileSection title="11. 須注意設施" content={data?.q9_hasIssue === '是' ? `有：${labels.q9()}` : '無'} />
                                    </>
                                )}
                            </>)}

                            {type === 'factory' && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="font-black text-lg text-slate-500 mb-2 dark:text-slate-400">工廠規格</p>
                                    <div className="space-y-2">
                                        <BulletItem label="高度" value={data.factory_height ? `${data.factory_height} 米` : '-'} variant="mobile" />
                                        <BulletItem label="柱距" value={data.factory_column_spacing ? `${data.factory_column_spacing} 米` : '-'} variant="mobile" />
                                        <BulletItem label="載重" value={data.factory_floor_load ? `${data.factory_floor_load} kg/m²` : '-'} variant="mobile" />
                                        <BulletItem label="地坪" value={data.factory_floor_condition || '-'} variant="mobile" />
                                        <BulletItem label="貨梯" value={data.factory_elevator === '有' ? `有 (${data.factory_elevator_capacity})` : '無'} variant="mobile" />
                                        <BulletItem label="天車" value={data.factory_crane === '有' ? `有 (${data.factory_crane_tonnage}噸)` : (data.factory_crane || '-')} variant="mobile" />
                                        <BulletItem label="廢水" value={data.factory_waste || '-'} variant="mobile" />
                                        <BulletItem label="碼頭" value={data.factory_loading_dock || '-'} variant="mobile" />
                                        <BulletItem label="大車" value={data.factory_truck_access || '-'} variant="mobile" />
                                    </div>
                                    <MobileSection title="須注意設施" content={data?.q9_hasIssue === '是' ? `有：${labels.q9()}` : '無'} />
                                </div>
                            )}

                            {type === 'land' && (
                                <>
                                    <MobileSection title="1. 電力供應" content={data?.land_q1_elec !== '否' ? data?.land_q1_elec : '無'} />
                                    <MobileSection title="2. 水源供應" content={data?.land_q1_water !== '否' ? data?.land_q1_water : '無'} />
                                    <MobileSection title="3. 土地鑑界" content={data?.land_q3_survey || '-'} />
                                    <MobileSection title="4. 糾紛情況" content={data?.land_q3_dispute === '否' ? '無' : (data?.land_q3_dispute || '-')} />
                                    <MobileSection title="5. 徵收預定" content={data?.land_q4_expro === '否' ? '否' : (data?.land_q4_expro || '-')} />
                                    <MobileSection title="6. 重測區域" content={data?.land_q4_resurvey === '否' ? '否' : (data?.land_q4_resurvey || '-')} />
                                    <MobileSection title="7. 被越界占用" content={data?.land_q5_encroached === '否' ? '否' : (data?.land_q5_encroached || '-')} />
                                    <MobileSection title="8. 占用鄰地" content={data?.land_q5_encroaching === '否' ? '否' : (data?.land_q5_encroaching || '-')} />
                                    <MobileSection title="9. 禁建/限建" content={data?.land_q6_limit === '否' ? '否' : (data?.land_q6_limit || '-')} />
                                    <MobileSection title="10. 現況使用" content={data?.land_q7_user || '-'} />
                                    <MobileSection title="11. 土壤/地下物" content={data?.soil_q1_status === '有' ? `有 (${data.soil_q1_desc})` : (data?.soil_q1_status || '-')} />
                                </>
                            )}
                            
                            {(type === 'house' || type === 'factory') && (
                                <MobileSection title="進出情況" content={
                                    data?.q14_access === '正常' 
                                    ? `正常 ${data.q14_roadWidth ? `(路寬${data.q14_roadWidth}米)` : ''}` 
                                    : (data?.q14_access || '-')
                                } />
                            )}
                            
                            {type === 'land' && (
                                <MobileSection title="進出情況" content={
                                    data?.land_q2_access?.includes('正常')
                                    ? `正常 ${data.land_q2_roadWidth ? `(路寬${data.land_q2_roadWidth}米)` : ''}`
                                    : (data?.land_q2_access || '-')
                                } />
                            )}

                            {type !== 'parking' && (
                                <MobileSection title="停車資訊" content={
                                    data.q10_noParking ? '無車位' : 
                                    (type === 'factory' && ['透天獨棟廠房', '倉儲物流廠房', '其他'].includes(data.propertyType) 
                                        ? data.factory_parking_desc 
                                        : `${(data.q10_parkTypes || []).join(', ')}`
                                    )
                                } />
                            )}

                            {type === 'parking' && (
                                <>
                                    <MobileSection title="1. 停車方式" content={(data?.q10_parkTypes || []).join(', ') || (data?.q10_noParking ? '無車位' : '-')} />
                                    <MobileSection title="2. 車位編號" content={data?.q10_parkingNumberType === 'number' ? `有 (${data.q10_parkingNumberVal})` : '無'} />
                                    <MobileSection title="3. 使用異常" content={data?.q11_hasIssue === '是' ? '異常' : '正常'} />
                                </>
                            )}
                            
                            <MobileSection title="環境設施" content={!data?.q16_noFacilities ? getEnvFacilitiesLabel(data) : '無重要環境設施'} />
                            <MobileSection title="注意事項" isAlert={data?.q17_issue === '是' || data?.land_q8_special === '是'} content={(data?.q17_issue === '是' || data?.land_q8_special === '是') ? (data?.q17_desc || data?.land_q8_special_desc) : '無'} />
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center text-slate-400 font-bold text-sm dark:text-slate-500">此為好讀預覽，匯出時將產生正式 A4 格式</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            {isMobile ? (
                <div className="w-full max-w-[210mm] flex flex-col gap-4 mb-6 no-print">
                    <div className="mb-0 animate-in fade-in slide-in-from-top-2"><p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">💡 手機版：可左右拖曳，亦可雙指放大縮小檢視</p></div>
                    <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-full dark:bg-slate-800 dark:border-slate-700">
                        <button onClick={() => setViewMode('mobile')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'mobile' ? 'bg-orange-500 text-white shadow-md dark:bg-orange-600' : 'text-slate-400 dark:text-slate-500'}`}>
                            <Smartphone className="w-5 h-5" /> 手機好讀版
                        </button>
                        <button onClick={() => setViewMode('a4')} className={`flex-1 py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'a4' ? 'bg-slate-800 text-white shadow-md dark:bg-slate-700' : 'text-slate-400 dark:text-slate-500'}`}>
                            <FileText className="w-5 h-5" /> A4 列印版
                        </button>
                    </div>
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
                    <div className="bg-black text-white px-3 py-1 text-sm font-black mb-1 self-start">【調查情況】</div>
                    
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
                                        <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && data?.q11_hasIssue === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left text-black">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位使用是否異常？：</span>
                                                <PreviewResult checked={data?.q11_hasIssue === '是'} label={[...(data?.q11_items || []), data?.q11_hasOther ? `其他: ${data.q11_other}` : ''].filter(Boolean).join(', ') || '異常'} />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="text-black">
                                        <td className="w-28 text-center bg-gray-50 font-black text-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 px-4 text-left text-black">
                                            <div className="flex flex-wrap items-center">
                                                <span className="font-black mr-2">車位現況補充：</span>
                                                <PreviewResult checked={data?.q12_hasNote === '是'} label={data?.q12_note} />
                                            </div>
                                        </td>
                                    </tr>
                                    <SectionHeader title="2. 重要環境設施" />
                                    <CheckRow checked={data?.q16_noFacilities}>
                                             <span className="font-black mr-2">重要環境設施？：</span>
                                             {!data?.q16_noFacilities && <span className="font-medium">{getEnvFacilitiesLabel(data)}</span>}
                                    </CheckRow>
                                    <SectionHeader title="3. 本案或本社區是否有須注意的事項？" />
                                    <CheckRow checked={data?.q17_issue === '否'}>
                                             <span className="font-black mr-2">注意事項？：</span>
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
                                {type === 'factory' && <FactoryPrintPage2 data={data} parkingSummary={parkingSummary} activeMode={activeMode} hasPage3={hasPage3} />}
                            </tbody>
                        </table>
                        <Footer showSignature={!hasPage3} signatureImage={data.signatureImage} />
                    </div>
                </ScaledA4Wrapper>
            )}

            {hasPage3 && (
                <ScaledA4Wrapper pageNum={3}>
                    <div className="flex-grow flex flex-col h-full text-black">
                        <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full">
                            <h1 className="text-3xl font-black tracking-[0.2em] text-center w-full text-black">幸福家不動產－業務版現況調查表</h1>
                            <div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【第三頁】</div>
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
};