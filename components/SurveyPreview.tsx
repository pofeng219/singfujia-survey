
import { SurveyData, SurveyType } from '../types';
import { PreviewResult } from './SharedUI';
import { formatDateROC } from './ROCDatePicker';
import { 
    ACCESS_SUB_OPTIONS, 
    ACCESS_SUB_OPTIONS_LAND, 
    ACCESS_SUB_OPTIONS_PARKING, 
    PARK_TYPES, 
} from '../constants';
import React, { useMemo } from 'react';

interface SurveyPreviewProps {
    data: SurveyData;
    type: SurveyType;
    exporting: boolean;
    previewScale: number;
    previewPage: number;
    page1Ref: React.RefObject<HTMLDivElement>;
    page2Ref: React.RefObject<HTMLDivElement>;
    onParkingOverflowChange?: (hasOverflow: boolean) => void;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ data, type, exporting, previewScale, previewPage, page1Ref, page2Ref, onParkingOverflowChange }) => {
    
    const [parkingOverflow, setParkingOverflow] = React.useState(false);

    React.useEffect(() => {
        if (type === 'parking') {
            setParkingOverflow(false);
            onParkingOverflowChange?.(false);
        }
    }, [type, onParkingOverflowChange]);

    React.useEffect(() => {
        if (type === 'parking' && !parkingOverflow && page1Ref.current) {
             if (page1Ref.current.scrollHeight > 1125) {
                 setParkingOverflow(true);
                 onParkingOverflowChange?.(true);
             }
        }
    }, [data, type, parkingOverflow, onParkingOverflowChange, page1Ref]);

    const parkingSummary = useMemo(() => {
        const isNoParking = data?.q10_noParking === true;
        const pts = data?.q10_parkTypes || [];
        const isOtherPt = data?.q10_hasParkTypeOther === true;

        return {
            isNoParking,
            showMethod: !isNoParking,
            showNumber: !isNoParking && !isOtherPt && (data?.q10_parkingNumberType === 'number' || data?.q10_parkingNumberType === 'none'),
            showCarStatus: !isNoParking && !isOtherPt && ((data?.q10_carUsage || []).length > 0 || data?.q10_hasCarUsageOther),
            showCarSize: !isNoParking && !isOtherPt && (data?.q10_dimL || data?.q10_dimW || data?.q10_dimH),
            showWeight: !isNoParking && !isOtherPt && !pts.includes("坡道平面") && !pts.includes("一樓平面") && data?.q10_mechWeight,
            showHeight: !isNoParking && !isOtherPt && !pts.includes("一樓平面") && data?.q10_entryHeight,
            showCharging: !isNoParking,
            showAbnormal: !isNoParking && data?.q11_hasIssue === '是',
            showSupplement: !isNoParking && data?.q12_hasNote === '是'
        };
    }, [data]);

    const renderYesValue = (val: string, detail: string) => {
        if (val === '是') {
            return detail ? `是：${detail}` : '是';
        }
        // Fix for "其他/疑似" or "其他" not showing details
        if (val && detail && val !== '否' && val !== '否，無異常' && val !== '無') {
             return `${val}：${detail}`;
        }
        return val;
    };

    const getHouseQ1Label = () => {
        const labels = data?.q1_items?.map(i => i === "地下室增建" && data.q1_basementPartition ? "地下室增建(內含隔間)" : i) || [];
        if (data?.q1_hasOther && data.q1_other) labels.push(`其他: ${data.q1_other}`);
        return labels.join(', ');
    };

    const getHouseQ3Label = () => {
        const labels = [...(data?.q3_locations || [])];
        if (data?.q3_ceilingWrapped) labels.push("全屋天花板包覆");
        if (data?.q3_suspected && data.q3_suspectedDesc) labels.push(`疑似: ${data.q3_suspectedDesc}`);
        if (data?.q3_hasOther && data.q3_other) labels.push(`其他: ${data.q3_other}`);
        return labels.join(', ');
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

    const getParkingTypeLabel = (pt: string) => {
        if (pt === "坡道機械" && data?.q10_rampMechLoc) return `${pt}(${data.q10_rampMechLoc})`;
        if (pt === "升降機械" && data?.q10_liftMechLoc) return `${pt}(${data.q10_liftMechLoc})`;
        if (pt === "塔式車位" && data?.q10_liftMechLoc) return `${pt}(${data.q10_liftMechLoc})`;
        return pt;
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

    const getLandCropsSummary = () => {
        if (data?.land_q7_crops === '無') return '無';
        if (data?.land_q7_crops === '有農作物/植栽') {
            let res = `有 (待${data.land_q7_crops_month}月收成, ${data.land_q7_crops_type}`;
            if (data.land_q7_crops_type === '其他') res += `: ${data.land_q7_crops_other})`;
            else res += ` - ${data.land_q7_crops_detail})`;
            return res;
        }
        return data?.land_q7_crops || '';
    };

    const getLandBuildSummary = () => {
        if (data?.land_q7_build === '無') return '無';
        if (data?.land_q7_build === '有建築物/工作物') {
            let res = `有 (${data.land_q7_build_type}`;
            if (data.land_q7_build_type === '有保存登記' || data.land_q7_build_type === '未保存登記') {
                const ownership = data?.land_q7_build_ownership ? ` - ${data.land_q7_build_ownership}` : '';
                res += `${ownership})`;
            }
            else if (data.land_q7_build_type === '宗教/殯葬設施') res += ` - ${data.land_q7_build_rel_detail})`;
            else if (data.land_q7_build_type === '其他') res += `: ${data.land_q7_build_other})`;
            else res += ')';
            return res;
        }
        return data?.land_q7_build || '';
    };

    const getLandUserSummary = () => {
        if (!data?.land_q7_user || data?.land_q7_user === '無') return '';
        if (data.land_q7_user === '非所有權人使用') {
            const detail = data.land_q7_user_detail || '';
            let detailStr = detail;
            if (detail === '其他') {
                detailStr = `其他：${data.land_q7_user_desc || ''}`;
            } else if (data.land_q7_user_desc) {
                detailStr = `${detail} (${data.land_q7_user_desc})`;
            }
            return `非所有權人使用(${detailStr})`;
        }
        return data.land_q7_user;
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

    const Footer = ({ withDisclaimer }: { withDisclaimer: boolean }) => (
        <div className="mt-auto w-full pt-4 border-t-4 border-black flex flex-col">
            {withDisclaimer && (
                <div className="w-full text-right mb-1">
                    <span className="text-[12px] font-bold text-slate-500 tracking-wider">※本調查內容僅供公司內部參考，實際應以權狀及產調為準</span>
                </div>
            )}
            <div className="flex justify-between items-end">
                <div className="space-y-4 font-black text-xl">調查業務人員簽章：<div className="w-[200px] h-6 border-b-2 border-slate-300"></div></div>
                <div className="text-3xl font-black italic text-sky-500">幸福家不動產</div>
            </div>
        </div>
    );

    const renderPage1 = () => (
        <div ref={page1Ref} className="a4-page shadow-2xl shrink-0" style={{ transform: `scale(${exporting ? 1 : previewScale})`, marginBottom: `${exporting ? 0 : (1 - previewScale) * -1123}px` }}>
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
                <div className="bg-black text-white px-3 py-1 text-sm font-black mb-1 self-start">【調查情況 - 1】</div>
                <table className="excel-table mb-2 w-full">
                    <tbody>
                        <tr>
                            <td colSpan={10} className="py-2 px-4 text-left">
                                <div className="flex items-center space-x-6 mb-1">
                                    <span className="font-black text-[15px]">本物件現況：</span>
                                    <PreviewResult checked={data?.access === '可進入'} label="可進入" />
                                    <PreviewResult checked={data?.access === '不可進入'} label="不可進入：" />
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 pl-14">
                                    {(type === 'land' ? ACCESS_SUB_OPTIONS_LAND : (type === 'parking' ? ACCESS_SUB_OPTIONS_PARKING : ACCESS_SUB_OPTIONS)).map(opt => (
                                        <PreviewResult key={opt} checked={data?.accessType?.includes(opt)} label={opt + (opt === "其他" ? '：' : '')} suffix={opt === "其他" && data?.accessType?.includes("其他") ? data.accessOther : ""} />
                                    ))}
                                </div>
                            </td>
                        </tr>
                        
                        {type === 'land' ? (
                            <>
                                <tr><td className="w-10 text-center bg-gray-50 font-black">否</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>
                                
                                <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">1. 有電力、水力與其他設施？</td></tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q1_elec === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">是否電力供應？：</span>
                                            <PreviewResult checked={data?.land_q1_elec !== '否' && !!data?.land_q1_elec} label={getLandElecSummary()} />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q1_water === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">是否水源供應？：</span>
                                            <PreviewResult checked={data?.land_q1_water !== '否' && !!data?.land_q1_water} label={getLandWaterSummary()} />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q1_other_new === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">是否其他設施？：</span>
                                            <PreviewResult checked={data?.land_q1_other_new === '是'} label={data.land_q1_other_desc} />
                                        </div>
                                    </td>
                                </tr>

                                <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">2. 土地進出通行與臨路的情況？</td></tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q2_access === '否，無異常' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">土地進出通行是否有異常？：</span>
                                            <PreviewResult checked={data?.land_q2_access === '是，有阻礙'} label={`是，有阻礙 (${data.land_q2_access_desc})`} />
                                            <PreviewResult checked={data?.land_q2_access === '袋地'} label="袋地" />
                                        </div>
                                    </td>
                                </tr>
                                {data?.land_q2_owner && (<tr>
                                    <td className="w-10 text-center bg-gray-50 font-black"></td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <PreviewResult checked={!!data.land_q2_owner} label="臨路的歸屬權？：" suffix={data?.land_q2_owner === '私人' ? `私人 (${data.land_q2_owner_desc})` : data?.land_q2_owner} />
                                        </div>
                                    </td>
                                </tr>)}
                                {data?.land_q2_material && (<tr>
                                    <td className="w-10 text-center bg-gray-50 font-black"></td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <PreviewResult checked={!!data.land_q2_material} label="臨路的路面材質？：" suffix={data?.land_q2_material === '其他' ? `其他 (${data.land_q2_material_other})` : data?.land_q2_material} />
                                        </div>
                                    </td>
                                </tr>)}
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q2_ditch === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">周圍是否有排水溝？：</span>
                                            <PreviewResult checked={data?.land_q2_ditch !== '否' && !!data?.land_q2_ditch} label={data?.land_q2_ditch === '其他' ? `其他 (${data.land_q2_ditch_other})` : data?.land_q2_ditch} />
                                        </div>
                                    </td>
                                </tr>

                                <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">3. 曾在兩年內進行土地鑑界/目前是否有糾紛？</td></tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q3_survey === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">曾在兩年內進行土地鑑界？：</span>
                                            <PreviewResult checked={data?.land_q3_survey === '是'} label={`是 (${data.land_q3_survey_detail})`} />
                                            <PreviewResult checked={data?.land_q3_survey === '其他'} label={`其他 (${data.land_q3_survey_other})`} />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q3_dispute === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">目前是否有糾紛？：</span>
                                            <PreviewResult checked={data?.land_q3_dispute === '是'} label={`是 (${data.land_q3_dispute_desc})`} />
                                            <PreviewResult checked={data?.land_q3_dispute === '其他'} label={`其他 (${data.land_q3_dispute_other})`} />
                                        </div>
                                    </td>
                                </tr>

                                <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">4. 徵收地預定地/重測區域範圍內？</td></tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q4_expro === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">位於政府徵收地預定地？：</span>
                                            <PreviewResult checked={data?.land_q4_expro === '是' || data?.land_q4_expro === '其他'} label={`${data?.land_q4_expro} (${data.land_q4_expro_other})`} />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q4_resurvey === '否' ? 'V' : ''}</td>
                                    <td colSpan={9} className="py-1 text-left">
                                        <div className="pl-4">
                                            <span className="font-black mr-2">位於重測區域範圍內？：</span>
                                            <PreviewResult checked={data?.land_q4_resurvey === '是' || data?.land_q4_resurvey === '其他'} label={`${data?.land_q4_resurvey} (${data.land_q4_resurvey_other})`} />
                                        </div>
                                    </td>
                                </tr>
                            </>
                        ) : (<tr><td className="w-10 text-center bg-gray-50 font-black">否</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>)}

                        {type === 'house' && (<>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q1_hasExt === '否' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">1. 是否有增建情況？</div><PreviewResult checked={data?.q1_hasExt === '是'} label={getHouseQ1Label()} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{(data?.q2_hasOccupancy === '否') ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">2. 建物或增建部分是否有占用鄰地、道路用地或他人建物占用本案之土地？</div><PreviewResult checked={data?.q2_hasOccupancy !== '否' && !!data?.q2_hasOccupancy} label={data?.q2_hasOccupancy + (data?.q2_desc ? ': ' + data.q2_desc : '')} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q3_hasLeak === '否' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">3. 是否有滲漏水、壁癌等情況？</div><PreviewResult checked={data?.q3_hasLeak === '是'} label={getHouseQ3Label()} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q4_hasIssue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">4. 結構牆面是否有結構安全之虞的瑕疵</div><PreviewResult checked={data?.q4_hasIssue === '是'} label={getHouseQ4Label()} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q5_hasTilt === '否' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">5. 是否有傾斜情況？</div><PreviewResult checked={data?.q5_hasTilt !== '否' && !!data?.q5_hasTilt} label={data?.q5_hasTilt + (data?.q5_desc ? ': ' + data.q5_desc : '') + (data?.q5_suspectedDesc ? ': ' + data.q5_suspectedDesc : '')} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q6_hasIssue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">6. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？</div><PreviewResult checked={data?.q6_hasIssue !== '否' && !!data?.q6_hasIssue} label={data?.q6_hasIssue + (data?.q6_desc ? ': ' + data.q6_desc : '')} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q7_hasIssue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">7. 水、電、瓦斯使用是否有異常？</div><PreviewResult checked={data?.q7_hasIssue === '是'} label={getHouseQ7Label()} /></td></tr>
                            <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.publicFacilities === '無公共設施' ? 'V' : ''}</td><td colSpan={9} className="py-1 text-left"><div className="font-black">公共設施情況</div><PreviewResult checked={data?.publicFacilities !== '' && data?.publicFacilities !== '無公共設施'} label={data?.publicFacilities || ''} suffix={data?.publicFacilitiesReason ? ': ' + data.publicFacilitiesReason : ''} /><PreviewResult checked={data?.publicFacilities === '無公共設施'} label="無公共設施" /></td></tr>
                        </>)}

                        {type === 'parking' && (<>
                            <tr><td className="w-8 text-center bg-gray-50 font-black">{data?.q10_noParking ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black underline mb-2">1. 車位資訊</div><div className="space-y-1">
                                {parkingSummary.showMethod && (<div><span className="font-bold mr-2">停車方式:</span>{PARK_TYPES.map(pt => (<PreviewResult key={pt} checked={data?.q10_parkTypes?.includes(pt)} label={getParkingTypeLabel(pt)} />))}<PreviewResult checked={data?.q10_hasParkTypeOther} label="其他" suffix={': ' + (data?.q10_parkTypeOther || '')} /></div>)}
                                {parkingSummary.showNumber && (<div><span className="font-bold mr-2">車位編號:</span><PreviewResult checked={data?.q10_parkingNumberType === 'number'} label="編號" suffix={': ' + (data?.q10_parkingNumberVal || '')} /><PreviewResult checked={data?.q10_parkingNumberType === 'none'} label="無車位編號" /></div>)}
                                {parkingSummary.showCarStatus && getParkingCarUsageLabel() && (<div><span className="font-bold mr-2">汽車車位使用情況:</span><span className="font-medium">{getParkingCarUsageLabel()}</span></div>)}
                                {getParkingMotoUsageLabel() && <div><span className="font-bold mr-2">機車車位使用情況:</span><span className="font-medium">{getParkingMotoUsageLabel()}</span></div>}
                                {(parkingSummary.showCarSize || parkingSummary.showWeight || parkingSummary.showHeight) && (<div className="flex flex-wrap gap-x-4"><span className="font-bold">汽車車位尺寸 (公尺):</span>{parkingSummary.showCarSize && (<><span>長:{data?.q10_dimL || '_'}</span><span>寬:{data?.q10_dimW || '_'}</span><span>高:{data?.q10_dimH || '_'}</span></>)}{parkingSummary.showWeight && <span>機械載重:{data?.q10_mechWeight || '_'}kg</span>}{parkingSummary.showHeight && <span>車道出入口高度:{data?.q10_entryHeight || '_'}m</span>}</div>)}
                                {parkingSummary.showCharging && (<div><span className="font-bold mr-2">社區是否有充電樁？:</span><PreviewResult checked={data?.q10_charging === '是'} label="是" /><PreviewResult checked={data?.q10_charging === '否'} label="否" /><PreviewResult checked={data?.q10_charging === '其他'} label="其他" suffix={': ' + (data?.q10_chargingOther || '')} /></div>)}
                                {parkingSummary.isNoParking && (<div><span className="font-bold mr-2">停車方式:</span><PreviewResult checked={true} label="無車位" /></div>)}
                            </div></td></tr>
                            <tr><td className="w-8 text-center bg-gray-50 font-black">{(data?.q11_hasIssue === '否' || data?.q10_noParking) ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black mb-1">2. 車位使用是否異常？</div>{parkingSummary.showAbnormal && <PreviewResult checked={data?.q11_hasIssue === '是'} label={getQ11Label()} />}</td></tr>
                            <tr><td className="w-8 text-center bg-gray-50 font-black">{(data?.q12_hasNote === '否' || data?.q10_noParking) ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black mb-1">3. 車位現況補充</div>{parkingSummary.showSupplement && <PreviewResult checked={true} label={renderYesValue('是', data.q12_note)} />}</td></tr>
                            {!parkingOverflow && (<>
                                <tr><td className="w-8 text-center bg-gray-50 font-black">{data?.q16_noFacilities ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black mb-1">4. 重要環境設施</div><PreviewResult checked={data?.q16_noFacilities} label="無重要環境設施" /><div className="flex flex-wrap gap-y-1">{(data?.q16_items || []).map(i => <PreviewResult key={i} checked={true} label={i} />)}{data?.q16_hasOther && <PreviewResult checked={true} label="其他" suffix={': ' + (data?.q16_other || '')} />}</div></td></tr>
                                <tr><td className="w-8 text-center bg-gray-50 font-black">{data?.q17_issue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black mb-1">5. 本案或本社區是否有須注意的事項？</div><PreviewResult checked={data?.q17_issue === '是'} label={renderYesValue('是', data.q17_desc)} /></td></tr>
                            </>)}
                        </>)}
                    </tbody>
                </table>
                {(type !== 'parking' || !parkingOverflow) && (type === 'parking' ? <Footer withDisclaimer={true} /> : null)}
            </div>
        </div>
    );

    const renderPage2 = () => {
        if (type === 'parking' && !parkingOverflow) return null;
        return (
            <div ref={page2Ref} className="a4-page shadow-2xl shrink-0" style={{ transform: `scale(${exporting ? 1 : previewScale})`, marginBottom: `${exporting ? 0 : (1 - previewScale) * -1123}px` }}>
                <div className="flex-grow flex flex-col h-full">
                    <div className="flex justify-center items-end border-b-4 border-black pb-4 mb-4 relative w-full"><h1 className="text-3xl font-black tracking-[0.2em] text-center w-full">幸福家不動產－業務版現況調查表</h1><div className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-400">【背面】{data?.version}</div></div>
                    <div className="bg-black text-white px-3 py-1 text-sm font-black mb-1 self-start">【調查情況 - 2】</div>
                    <table className="excel-table w-full">
                        <tbody>
                            {type === 'land' ? (
                                <>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">否</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>
                                    
                                    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">5. 被越界佔用/佔用鄰地情況？</td></tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q5_encroached === '否' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">是否有被越界佔用？：</span>
                                                <PreviewResult checked={data?.land_q5_encroached !== '否' && !!data?.land_q5_encroached} label={renderYesValue(data.land_q5_encroached, data.land_q5_encroached_desc)} />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q5_encroaching === '否' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">是否有佔用鄰地情況？：</span>
                                                <PreviewResult checked={data?.land_q5_encroaching !== '否' && !!data?.land_q5_encroaching} label={renderYesValue(data.land_q5_encroaching, data.land_q5_encroaching_desc)} />
                                            </div>
                                        </td>
                                    </tr>

                                    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">6. 目前是否有禁建、限建的情況？</td></tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q6_limit === '否' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">目前是否有禁建、限建的情況？：</span>
                                                <PreviewResult checked={data?.land_q6_limit !== '否' && !!data?.land_q6_limit} label={renderYesValue(data.land_q6_limit, data.land_q6_limit_desc)} />
                                            </div>
                                        </td>
                                    </tr>

                                    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">7. 土地使用現況與地上物</td></tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q7_user === '無' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">現況使用人？：</span>
                                                <PreviewResult checked={data?.land_q7_user !== '無' && !!data?.land_q7_user} label={getLandUserSummary()} />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q7_crops === '無' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">地上定著物-農作物：</span>
                                                <PreviewResult checked={data?.land_q7_crops !== '無' && !!data?.land_q7_crops} label={getLandCropsSummary()} />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q7_build === '無' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">地上定著物-建物：</span>
                                                <PreviewResult checked={data?.land_q7_build !== '無' && !!data?.land_q7_build} label={getLandBuildSummary()} />
                                            </div>
                                        </td>
                                    </tr>

                                    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">8. 重要環境設施</td></tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.q16_noFacilities ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                {data?.q16_noFacilities ? '無重要環境設施' : (
                                                    <div className="flex flex-wrap gap-y-1">
                                                        {(data?.q16_items || []).map(i => <PreviewResult key={i} checked={true} label={i} />)}
                                                        {data?.q16_hasOther && <PreviewResult checked={true} label="其他" suffix={': ' + (data?.q16_other || '')} />}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    <tr><td colSpan={10} className="py-1 text-left font-black bg-gray-50">9. 本案或周圍是否有須注意的事項？</td></tr>
                                    <tr>
                                        <td className="w-10 text-center bg-gray-50 font-black">{data?.land_q8_special === '否' ? 'V' : ''}</td>
                                        <td colSpan={9} className="py-1 text-left">
                                            <div className="pl-4">
                                                <span className="font-black mr-2">本案或周圍是否有須注意的事項？：</span>
                                                <PreviewResult checked={data?.land_q8_special !== '否' && !!data?.land_q8_special} label={renderYesValue(data.land_q8_special, data.land_q8_special_desc)} />
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            ) : (type === 'house' ? (
                                <><tr><td className="w-10 text-center bg-gray-50 font-black">否</td><td colSpan={9} className="py-1 font-bold bg-gray-100 text-center">說明 / 檢查項目</td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q8_stairIssue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">8. 電(樓)梯間、公共地下室等現況是否有龜裂、鋼筋外露、水泥塊剝落等情況？</div><PreviewResult checked={data?.q8_stairIssue === '是'} label="是: " suffix={data?.q8_stairDesc || ''} /></td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q9_hasIssue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">9. 本案或本社區是否有須注意的設施？</div><PreviewResult checked={data?.q9_hasIssue === '是'} label={getHouseQ9Label()} /></td></tr>
                                    
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q10_noParking ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">10. 車位資訊</div>
                                    <div className="flex flex-col gap-1">
                                        {data?.q10_noParking && <PreviewResult checked={true} label="無車位" />}
                                        {!data?.q10_noParking && (
                                            <>
                                                {parkingSummary.showMethod && (
                                                    <PreviewResult 
                                                        checked={true} 
                                                        label="停車方式：" 
                                                        suffix={
                                                            [
                                                                ...(data?.q10_parkTypes || []).map(getParkingTypeLabel),
                                                                data?.q10_hasParkTypeOther ? `其他${data.q10_parkTypeOther ? ': ' + data.q10_parkTypeOther : ''}` : null
                                                            ].filter(Boolean).join('、')
                                                        } 
                                                    />
                                                )}
                                                {parkingSummary.showNumber && (
                                                    <div className="mt-1">
                                                        <span className="font-bold mr-2">車位編號：</span>
                                                        {data?.q10_parkingNumberType === 'number' ? data.q10_parkingNumberVal : '無車位編號'}
                                                    </div>
                                                )}
                                                {parkingSummary.showCarStatus && getParkingCarUsageLabel() && <div className="mt-1"><span className="font-bold mr-2">汽車使用：</span>{getParkingCarUsageLabel()}</div>}
                                            </>
                                        )}
                                        {getParkingMotoUsageLabel() && <div className="mt-1"><span className="font-bold mr-2">機車使用：</span>{getParkingMotoUsageLabel()}</div>}
                                        {(parkingSummary.showCarSize || parkingSummary.showWeight || parkingSummary.showHeight) && (<div className="flex flex-wrap gap-x-4 mt-1"><span className="font-bold">尺寸 (公尺):</span>{parkingSummary.showCarSize && (<><span>長:{data?.q10_dimL || '_'}</span><span>寬:{data?.q10_dimW || '_'}</span><span>高:{data?.q10_dimH || '_'}</span></>)}{parkingSummary.showWeight && <span>機械載重:{data?.q10_mechWeight || '_'}kg</span>}{parkingSummary.showHeight && <span>車道出入口高度:{data?.q10_entryHeight || '_'}m</span>}</div>)}
                                        {parkingSummary.showCharging && (<div className="mt-1"><span className="font-bold mr-2">充電樁：</span><PreviewResult checked={data?.q10_charging === '是'} label="是" /><PreviewResult checked={data?.q10_charging === '否'} label="否" /><PreviewResult checked={data?.q10_charging === '其他'} label="其他" suffix={': ' + (data?.q10_chargingOther || '')} /></div>)}
                                    </div>
                                    </td></tr>
                                    
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q11_hasIssue === '否') || data?.q10_noParking ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">11. 車位使用是否異常？</div>{parkingSummary.showAbnormal && <PreviewResult checked={data?.q11_hasIssue === '是'} label={getQ11Label()} />}</td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{(!data?.q10_noParking && data?.q12_hasNote === '否') || data?.q10_noParking ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">12. 車位現況補充</div>{parkingSummary.showSupplement && <PreviewResult checked={true} label={renderYesValue('是', data.q12_note)} />}</td></tr>
                                    
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.isNotFirstFloor || data?.q13_occupancy === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">13. 一樓前方空地、後方空地(防火巷)或騎樓部分是否有被佔用情況？</div>{data?.isNotFirstFloor ? <PreviewResult checked={true} label="並非一樓，無需填寫" /> : <PreviewResult checked={data?.q13_occupancy === '是'} label={renderYesValue('是', data.q13_desc)} />}</td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.isNotFirstFloor || data?.q14_access === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">14. 進出須經他人土地</div>{data?.isNotFirstFloor ? <PreviewResult checked={true} label="並非一樓，無需填寫" /> : <PreviewResult checked={data?.q14_access === '是'} label={`${data?.q14_section || ''}段 ${data?.q14_subSection || ''}小段 ${data?.q14_number || ''}地號`} />}</td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.isNotFirstFloor || data?.q15_occupy === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">15. 增建佔用他人土地</div>{data?.isNotFirstFloor ? <PreviewResult checked={true} label="並非一樓，無需填寫" /> : <PreviewResult checked={data?.q15_occupy === '是'} label={`${data?.q15_section || ''}段 ${data?.q15_subSection || ''}小段 ${data?.q15_number || ''}地號`} />}</td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q16_noFacilities ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">16. 重要環境設施</div><PreviewResult checked={data?.q16_noFacilities} label="無重要環境設施" />{!data?.q16_noFacilities && (<div className="flex flex-wrap gap-y-1">{(data?.q16_items || []).map(i => <PreviewResult key={i} checked={true} label={i} />)}<PreviewResult checked={data?.q16_hasOther} label="其他" suffix={': ' + (data?.q16_other || '')} /></div>)}</td></tr>
                                    <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q17_issue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 text-left"><div className="font-black">17. 本案或本社區是否有須注意的事項？</div><PreviewResult checked={data?.q17_issue === '是'} label={renderYesValue('是', data.q17_desc)} /></td></tr></>
                            ) : (
                                <><tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q16_noFacilities ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black mb-1">4. 重要環境設施</div><PreviewResult checked={data?.q16_noFacilities} label="無重要環境設施" /><div className="flex flex-wrap gap-y-1">{(data?.q16_items || []).map(i => <PreviewResult key={i} checked={true} label={i} />)}{data?.q16_hasOther && <PreviewResult checked={true} label="其他" suffix={': ' + (data?.q16_other || '')} />}</div></td></tr>
                                <tr><td className="w-10 text-center bg-gray-50 font-black">{data?.q17_issue === '否' ? 'V' : ''}</td><td colSpan={9} className="py-2 px-4 text-left"><div className="font-black mb-1">5. 本案或本社區是否有須注意的事項？</div><PreviewResult checked={data?.q17_issue === '是'} label={renderYesValue('是', data.q17_desc)} /></td></tr></>
                            ))}
                        </tbody>
                    </table>
                    <Footer withDisclaimer={true} />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className={`transition-all duration-300 ${previewPage === 1 || exporting ? 'block' : 'hidden'} ${exporting ? 'opacity-100' : ''}`}>{renderPage1()}</div>
            <div className={`transition-all duration-300 ${previewPage === 2 || exporting ? 'block' : 'hidden'} ${exporting ? 'opacity-100' : ''}`}>{renderPage2()}</div>
        </div>
    );
};
