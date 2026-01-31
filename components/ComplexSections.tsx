import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    PARK_TYPES, CAR_USAGE_OPTS, Q11_OPTS, ENV_CATEGORIES 
} from '../constants';
import { 
    CheckBox, RadioGroup, SurveySection, SubItemHighlight, DetailInput, 
    InlineWarning, AccordionRadio, UnitInput, QuestionBlock, BooleanReveal 
} from './SharedUI';

export const UtilitiesSection = ({ 
    data, 
    setData, 
    questionNum,
    type,
    id,
    highlightedId
}: { 
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>, 
    questionNum: string,
    type: SurveyType,
    id: string,
    highlightedId: string | null
}) => {
    const update = (key: keyof SurveyData, val: any) => setData(p => ({ ...p, [key]: val }));

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={`${questionNum}. ${type === 'factory' ? '電、水與其他設施資訊' : '有電力、水力與其他設施？'}`}>
            <div className="space-y-8">
                <QuestionBlock>
                    <p className="text-3xl font-black mb-6 text-slate-800">
                        {type === 'factory' ? '供電類型' : '是否有電力供應？'}
                        {type === 'land' && <span className="block text-xl text-slate-500 font-bold mt-2">(請詳見台電電費單)</span>}
                    </p>
                    {type === 'factory' ? (
                        <div className="space-y-6">
                            <RadioGroup 
                                options={['無電力(需自行申請)', '一般用電(單相 110V/220V，僅供照明冷氣)', '動力用電(三相電)', '其他']} 
                                value={data?.land_q1_elec || ''} 
                                onChange={v => {
                                    setData(prev => {
                                        const isPower = v.includes('一般用電') || v.includes('動力用電');
                                        return {
                                            ...prev,
                                            land_q1_elec: v,
                                            land_q1_elec_other: v === '其他' ? prev.land_q1_elec_other : '',
                                            land_q1_elec_meter: isPower ? prev.land_q1_elec_meter : '',
                                            land_q1_elec_voltage: v.includes('動力用電') ? prev.land_q1_elec_voltage : '',
                                            land_q1_elec_capacity: isPower ? prev.land_q1_elec_capacity : ''
                                        };
                                    });
                                }} 
                                layout="grid"
                                cols={1}
                            />
                            {data?.land_q1_elec === '其他' && (
                                <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：發電機、太陽能" /></SubItemHighlight>
                            )}
                            
                            {(data.land_q1_elec === '一般用電(單相 110V/220V，僅供照明冷氣)' || data.land_q1_elec === '動力用電(三相電)') && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <SubItemHighlight>
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-xl font-black text-slate-700 mb-3">電錶型態？</p>
                                                <RadioGroup options={['獨立電錶', '共用電錶']} value={data.land_q1_elec_meter || ''} onChange={v => update('land_q1_elec_meter', v)} />
                                            </div>
                                            
                                            {data.land_q1_elec === '動力用電(三相電)' && (
                                                <div>
                                                    <p className="text-xl font-black text-slate-700 mb-3">電壓規格</p>
                                                    <RadioGroup options={['三相 220V', '三相 380V/三相四線式', '高壓電供電', '其他/不確定']} value={data.land_q1_elec_voltage || ''} onChange={v => update('land_q1_elec_voltage', v)} layout="grid" cols={2} />
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-xl font-black text-slate-700 mb-3">契約容量(馬力數)</p>
                                                <RadioGroup options={['一般用電(無契約容量)', '99馬力(HP)以下(無須設置配電室)', '100馬力(HP)以上(可能需設置高壓變電站或聘請電氣技術人員)', '不知道/需調閱電費單']} value={data.land_q1_elec_capacity || ''} onChange={v => update('land_q1_elec_capacity', v)} layout="grid" cols={1} />
                                            </div>
                                        </div>
                                    </SubItemHighlight>
                                </div>
                            )}
                        </div>
                    ) : (
                        <AccordionRadio 
                            options={['無', '有', '其他']} 
                            value={data?.land_q1_elec === '否' ? '無' : (data?.land_q1_elec === '是' ? '有' : (data?.land_q1_elec || ''))}
                            onChange={v => {
                                const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                                setData(prev => ({
                                    ...prev,
                                    land_q1_elec: val,
                                    land_q1_elec_detail: val === '是' ? prev.land_q1_elec_detail : '',
                                    land_q1_elec_other: val === '其他' ? prev.land_q1_elec_other : ''
                                }));
                            }} 
                            renderDetail={(opt) => (
                                <>
                                    {opt === '有' && <SubItemHighlight><div className="p-6 bg-white rounded-[1.5rem] border-3 border-slate-200"><RadioGroup options={['獨立電錶', '共有電錶']} value={data.land_q1_elec_detail || ''} onChange={v => update('land_q1_elec_detail', v)} /></div></SubItemHighlight>}
                                    {opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：太陽能、發電機等" /></SubItemHighlight>}
                                </>
                            )} 
                        />
                    )}
                </QuestionBlock>
                
                <QuestionBlock>
                    <p className="text-3xl font-black mb-6 text-slate-800">是否有水源供應？</p>
                    <AccordionRadio 
                        options={['無', '有', '其他']} 
                        value={data?.land_q1_water === '否' ? '無' : (data?.land_q1_water === '是' ? '有' : (data?.land_q1_water || ''))}
                        onChange={v => {
                            const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                            setData(prev => ({
                                ...prev,
                                land_q1_water: val,
                                land_q1_water_cat: val === '是' ? prev.land_q1_water_cat : '',
                                land_q1_water_tap_detail: val === '是' ? prev.land_q1_water_tap_detail : '',
                                land_q1_water_ground_detail: val === '是' ? prev.land_q1_water_ground_detail : '',
                                land_q1_water_irr_detail: val === '是' ? prev.land_q1_water_irr_detail : '',
                                land_q1_water_other: val === '其他' ? prev.land_q1_water_other : ''
                            }));
                        }} 
                        renderDetail={(opt) => (
                            <>
                                {opt === '有' && (
                                    <SubItemHighlight>
                                        <div className="space-y-6">
                                            <RadioGroup 
                                                options={['自來水', '地下水', '水利溝渠', '湖水/池塘']} 
                                                value={data.land_q1_water_cat || ''} 
                                                onChange={v => setData(prev => ({ ...prev, land_q1_water_cat: v, land_q1_water_tap_detail: v === '自來水' ? prev.land_q1_water_tap_detail : '', land_q1_water_ground_detail: v === '地下水' ? prev.land_q1_water_ground_detail : '', land_q1_water_irr_detail: v === '水利溝渠' ? prev.land_q1_water_irr_detail : '' }))} 
                                                layout="grid" cols={2} 
                                            />
                                            {data.land_q1_water_cat === '自來水' && <div className="p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 animate-in fade-in slide-in-from-top-2"><RadioGroup options={['獨立水錶', '共有水錶', '無水錶，但管線已臨路', '無水錶，且管線距離遙遠']} value={data.land_q1_water_tap_detail || ''} onChange={v => update('land_q1_water_tap_detail', v)} layout="grid" cols={1} /></div>}
                                            {data.land_q1_water_cat === '地下水' && <div className="p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 animate-in fade-in slide-in-from-top-2"><RadioGroup options={['自然湧出流動', '合法水井', '私設水井']} value={data.land_q1_water_ground_detail || ''} onChange={v => update('land_q1_water_ground_detail', v)} layout="grid" cols={1} /></div>}
                                            {data.land_q1_water_cat === '水利溝渠' && <div className="p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 animate-in fade-in slide-in-from-top-2"><RadioGroup options={['公有', '私人']} value={data.land_q1_water_irr_detail || ''} onChange={v => update('land_q1_water_irr_detail', v)} /></div>}
                                        </div>
                                    </SubItemHighlight>
                                )}
                                {opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q1_water_other || ''} onChange={v => update('land_q1_water_other', v)} placeholder="如：山泉水、接鄰居水等" /></SubItemHighlight>}
                            </>
                        )} 
                    />
                </QuestionBlock>
                
                <QuestionBlock>
                    <p className="text-3xl font-black mb-6 text-slate-800">是否有其他設施？</p>
                    <AccordionRadio options={['無', '有']} value={data?.land_q1_other_new === '否' ? '無' : (data?.land_q1_other_new === '是' ? '有' : '')} onChange={v => { const val = v === '無' ? '否' : '是'; setData(prev => ({ ...prev, land_q1_other_new: val, land_q1_other_desc: val === '是' ? prev.land_q1_other_desc : '' })); }} renderDetail={(opt) => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q1_other_desc || ''} onChange={v => update('land_q1_other_desc', v)} placeholder="如：天然瓦斯、熱水器等" /></SubItemHighlight> : null)} />
                </QuestionBlock>
            </div>
        </SurveySection>
    );
};

export const ParkingSection = ({ 
    data, 
    setData,
    update, 
    toggleArr,
    parkingLogic,
    startNum = 10,
    ids,
    highlightedId,
    includeExtras = true
}: { 
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>,
    update: (key: keyof SurveyData, val: any) => void, 
    toggleArr: (key: keyof SurveyData, val: string) => void,
    parkingLogic: any,
    startNum?: number,
    ids: { main: string; abnormal: string; supplement: string },
    highlightedId: string | null,
    includeExtras?: boolean
}) => {
    const isHouseOrFactory = startNum === 8 || startNum === 11;
    const handleCarUsageToggle = (val: string) => {
        setData(prev => {
            let arr: string[] = prev.q10_carUsage || [];
            if (val === "固定位置使用") { if (!arr.includes(val)) arr = arr.filter(x => x !== "每日先到先停" && x !== "須固定抽籤"); } 
            else if (val === "每日先到先停" || val === "須固定抽籤") { if (!arr.includes(val)) arr = arr.filter(x => x !== "固定位置使用"); }
            return { ...prev, q10_carUsage: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] };
        });
    };

    return (
        <SurveySection id={ids.main} highlighted={highlightedId === ids.main}>
            <div className="flex justify-between items-center border-b-2 pb-6 mb-2">
                <p className="text-3xl font-black text-slate-800 text-left">{isHouseOrFactory ? `${startNum}. 車位資訊 (若無車位請略過)` : `${startNum}. 車位資訊`}</p>
            </div>
            {startNum !== 1 && <div className="mb-8"><CheckBox checked={data?.q10_noParking || false} label="若無車位，點選此處" onClick={() => update('q10_noParking', !data.q10_noParking)} /></div>}
            
            <div className="space-y-12">
                <QuestionBlock className={parkingLogic.disableMethod ? 'opacity-40 grayscale pointer-events-none' : ''}>
                    <p className="text-2xl font-black text-slate-700 mb-6 text-left">停車方式 (單選)：</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PARK_TYPES.map(pt => (
                            <div key={pt} className={`relative overflow-hidden transition-all duration-300 ${data?.q10_parkTypes?.[0] === pt ? 'bg-sky-50 rounded-[2rem] transform scale-[1.01]' : 'bg-white rounded-[2rem]'}`}>
                                <div onClick={() => { if (parkingLogic.disableMethod) return; setData(prev => ({ ...prev, q10_parkTypes: [pt], q10_rampMechLoc: pt !== '坡道機械' ? '' : prev.q10_rampMechLoc, q10_liftMechLoc: (pt !== '升降機械' && pt !== '塔式車位') ? '' : prev.q10_liftMechLoc })); }} className={`cursor-pointer w-full p-6 flex items-center gap-4 rounded-[2rem] border-4 border-b-[8px] transition-all duration-150 active:border-b-4 active:translate-y-[4px] ${data?.q10_parkTypes?.[0] === pt ? 'border-sky-600 border-b-sky-800 bg-sky-50' : 'border-slate-300 border-b-slate-400 bg-white hover:bg-slate-50'}`}>
                                        <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center flex-shrink-0 transition-colors ${data?.q10_parkTypes?.[0] === pt ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white'}`}>{data?.q10_parkTypes?.[0] === pt && <CheckCircle2 className="w-6 h-6" />}</div>
                                        <span className={`font-black text-2xl ${data?.q10_parkTypes?.[0] === pt ? 'text-sky-800' : 'text-slate-600'}`}>{pt}</span>
                                </div>
                                {((pt === "坡道機械" || pt === "升降機械" || pt === "塔式車位") && data?.q10_parkTypes?.[0] === pt) && (
                                    <div className="p-6 pt-2 animate-in slide-in-from-top-4 duration-300 mt-2"><p className="text-xl font-bold text-slate-500 mb-3 text-center">請選擇所在層置：</p><div className="flex flex-wrap gap-4 justify-center">{['上層', '中層', '下層'].map(loc => (<button key={loc} type="button" onClick={(e) => { e.stopPropagation(); update(pt === "坡道機械" ? 'q10_rampMechLoc' : 'q10_liftMechLoc', loc); }} className={`flex-1 items-center justify-center px-5 py-4 rounded-2xl font-black text-xl transition-all duration-150 border-3 border-b-[6px] active:border-b-3 active:translate-y-[3px] ${(pt === "坡道機械" ? data.q10_rampMechLoc : data.q10_liftMechLoc) === loc ? 'bg-sky-500 text-white border-sky-500 border-b-sky-700' : 'bg-white border-slate-300 border-b-slate-400 text-slate-600 hover:bg-slate-50'}`}>{loc}</button>))}</div></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={`bg-white p-6 rounded-[2rem] border-3 border-slate-200 col-span-2 mt-6`}><CheckBox checked={data?.q10_hasParkTypeOther || false} label="其他" onClick={() => update('q10_hasParkTypeOther', !data.q10_hasParkTypeOther)} disabled={parkingLogic.disableMethod} />{data?.q10_hasParkTypeOther && (<SubItemHighlight disabled={parkingLogic.disableMethod}><DetailInput value={data.q10_parkTypeOther || ''} onChange={v => update('q10_parkTypeOther', v)} placeholder="如：庭院停車、騎樓停車" /></SubItemHighlight>)}</div>
                </QuestionBlock>
                
                <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableNumber ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    <p className="text-2xl font-black text-slate-700 mb-6 text-left">車位編號：</p>
                    <RadioGroup options={['有車位編號', '無車位編號']} value={data?.q10_parkingNumberType === 'number' ? '有車位編號' : (data?.q10_parkingNumberType === 'none' ? '無車位編號' : '')} onChange={(v) => { if (v === '有車位編號') update('q10_parkingNumberType', 'number'); else { update('q10_parkingNumberType', 'none'); update('q10_parkingNumberVal', ''); } }} disabled={parkingLogic.disableNumber} />
                    {data?.q10_parkingNumberType === 'number' && <SubItemHighlight disabled={parkingLogic.disableNumber}><DetailInput value={data.q10_parkingNumberVal || ''} onChange={v => update('q10_parkingNumberVal', v)} placeholder="如：B1-123" /></SubItemHighlight>}
                </QuestionBlock>

                <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableCarStatus ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    <p className="text-2xl font-black text-slate-700 mb-6 text-left">汽車車位使用情況：</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CAR_USAGE_OPTS.map(u => <div key={u} className="bg-white p-6 rounded-[2rem] border-3 border-slate-200"><CheckBox checked={data?.q10_carUsage?.includes(u) || false} label={u} onClick={() => handleCarUsageToggle(u)} disabled={parkingLogic.disableCarStatus} /></div>)}
                        <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 col-span-1 md:col-span-2"><CheckBox checked={data?.q10_carUsage?.includes("須固定抽籤") || false} label="須固定抽籤" onClick={() => handleCarUsageToggle("須固定抽籤")} disabled={parkingLogic.disableCarStatus} />{data?.q10_carUsage?.includes("須固定抽籤") && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><div className="ml-0 md:ml-4 flex items-center justify-center gap-4 mt-2 font-black text-2xl text-slate-700">每 <input type="number" inputMode="numeric" disabled={parkingLogic.disableCarStatus} className="w-28 border-3 rounded-2xl p-4 text-center bg-white shadow-inner" value={data.q10_carLotteryMonth || ''} onChange={e => update('q10_carLotteryMonth', e.target.value)} /> 月抽籤一次</div></SubItemHighlight>)}</div>
                        <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 col-span-1 md:col-span-2 text-center"><CheckBox checked={data?.q10_hasCarUsageOther || false} label="其他" onClick={() => update('q10_hasCarUsageOther', !data.q10_hasCarUsageOther)} disabled={parkingLogic.disableCarStatus} />{data?.q10_hasCarUsageOther && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><DetailInput value={data.q10_carUsageOther || ''} onChange={v => update('q10_carUsageOther', v)} placeholder="如：僅夜間使用" /></SubItemHighlight>)}</div>
                    </div>
                </QuestionBlock>

                <div className={`bg-blue-50 p-10 rounded-[2.5rem] space-y-8 border-4 border-blue-100 transition-all duration-500 shadow-sm ${parkingLogic.disableCarSize ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    <p className="font-black text-3xl text-slate-800 text-left">汽車車位尺寸 (公尺)</p>
                    
                    <div className="mb-4">
                        <RadioGroup options={['實際測量', '依謄本登記', '無法測量']} value={data?.q10_measureType || '實際測量'} onChange={v => update('q10_measureType', v)} disabled={parkingLogic.disableCarSize} layout="flex" />
                    </div>

                    {data?.q10_measureType !== '無法測量' && (
                        <div className="flex gap-6 animate-in slide-in-from-top-4">
                            <UnitInput unit="米" placeholder="長" value={data?.q10_dimL || ''} onChange={v => update('q10_dimL', v)} disabled={parkingLogic.disableCarSize} />
                            <UnitInput unit="米" placeholder="寬" value={data?.q10_dimW || ''} onChange={v => update('q10_dimW', v)} disabled={parkingLogic.disableCarSize} />
                            <UnitInput unit="米" placeholder="高" value={data?.q10_dimH || ''} onChange={v => update('q10_dimH', v)} disabled={parkingLogic.disableCarSize} />
                        </div>
                    )}

                    <div className="border-t-2 border-blue-200/50 pt-4">
                        <p className="font-black text-3xl text-slate-800 mt-4 text-left mb-4">機械載重 (公斤)</p>
                        <UnitInput unit="kg" value={data?.q10_mechWeight || ''} onChange={v => update('q10_mechWeight', v)} disabled={parkingLogic.disableWeight} placeholder={parkingLogic.disableWeight ? "無須填寫" : "輸入重量 (或依權狀)"} />
                    </div>
                    <div className="border-t-2 border-blue-200/50 pt-4">
                        <p className="font-black text-3xl text-slate-800 mt-4 text-left mb-4">車道出入口高度 (公尺)</p>
                        <UnitInput unit="米" value={data?.q10_entryHeight || ''} onChange={v => update('q10_entryHeight', v)} disabled={parkingLogic.disableHeight} placeholder={parkingLogic.disableHeight ? "無須填寫" : "輸入高度"} />
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors text-left space-y-6">
                    <p className="text-2xl font-black text-slate-700 mb-4">機車車位使用情況：</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200"><CheckBox checked={data?.q10_motoUsage?.includes("固定位置使用") || false} label="固定位置使用" onClick={() => toggleArr('q10_motoUsage', "固定位置使用")} /></div>
                        <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200"><CheckBox checked={data?.q10_motoUsage?.includes("無") || false} label="無" onClick={() => toggleArr('q10_motoUsage', "無")} /></div>
                        <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 col-span-1 md:col-span-2 text-left"><CheckBox checked={data?.q10_hasMotoUsageOther || false} label="其他" onClick={() => update('q10_hasMotoUsageOther', !data.q10_hasMotoUsageOther)} />{data?.q10_hasMotoUsageOther && (<SubItemHighlight><DetailInput value={data.q10_motoUsageOther || ''} onChange={v => update('q10_motoUsageOther', v)} placeholder="如：隨到隨停、一年一抽" /></SubItemHighlight>)}</div>
                    </div>
                </div>
                
                <div className={`space-y-10 ${parkingLogic.disableCharging ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    <QuestionBlock>
                        <p className="text-2xl font-black text-slate-700 mb-8">社區是否有充電樁？</p>
                        <RadioGroup options={['無', '有', '僅預留管線/孔位', '需經管委會同意']} value={data?.q10_charging === '否' ? '無' : (data?.q10_charging === '是' ? '有' : (data?.q10_charging || ''))} onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); if (val === '僅預留管線/孔位' || val === '需經管委會同意') { update('q10_charging', val); update('q10_chargingOther', ''); } else { setData(p => ({ ...p, q10_charging: val, q10_chargingOther: '' })); } }} cols={2} layout="grid" disabled={parkingLogic.disableCharging} />
                    </QuestionBlock>
                </div>
                
                {includeExtras && (
                    <>
                        <div className={`${parkingLogic.disableAbnormal ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <BooleanReveal 
                                label="車位使用是否異常？" 
                                value={data?.q11_hasIssue === '否' ? '正常 (無異常)' : (data?.q11_hasIssue === '是' ? '異常 (須說明)' : '')}
                                onChange={(v) => { const val = v === '正常 (無異常)' ? '否' : '是'; if (val === '否') setData(p => ({ ...p, q11_hasIssue: val, q11_items: [], q11_hasOther: false, q11_other: '' })); else update('q11_hasIssue', val); }} 
                                disabled={parkingLogic.disableAbnormal}
                                options={['正常 (無異常)', '異常 (須說明)']}
                                trigger="異常 (須說明)"
                            >
                                <div className="space-y-6 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{Q11_OPTS.map(i => <CheckBox key={i} checked={data?.q11_items?.includes(i) || false} label={i} onClick={() => toggleArr('q11_items', i)} disabled={parkingLogic.disableAbnormal} />)}</div>
                                    <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200">
                                        <CheckBox checked={data?.q11_hasOther || false} label="其他" onClick={() => update('q11_hasOther', !data.q11_hasOther)} disabled={parkingLogic.disableAbnormal} />
                                        {data?.q11_hasOther && <DetailInput value={data.q11_other || ''} onChange={v => update('q11_other', v)} disabled={parkingLogic.disableAbnormal} placeholder="如：機械故障、高度受限" />}
                                    </div>
                                </div>
                            </BooleanReveal>
                        </div>

                        <div className={`${parkingLogic.disableSupplement ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="text-2xl font-black text-slate-800 mb-6 text-left">車位現況補充</p>
                                        <div className="mb-6"><InlineWarning>※如車格位置有其他孔蓋、排風機、電箱、租期租金或其他注意事項？</InlineWarning></div>
                                    </>
                                }
                                value={data?.q12_hasNote === '否' ? '無' : (data?.q12_hasNote === '是' ? '有補充說明' : '')}
                                onChange={(v) => { const val = v === '無' ? '否' : '是'; if (val === '否') setData(p => ({ ...p, q12_hasNote: val, q12_note: '' })); else update('q12_hasNote', val); }}
                                disabled={parkingLogic.disableSupplement}
                                options={['無', '有補充說明']}
                                trigger="有補充說明"
                            >
                                <DetailInput value={data.q12_note || ''} onChange={v => update('q12_note', v)} disabled={parkingLogic.disableSupplement} placeholder="如：上方有風管、消防管線" />
                            </BooleanReveal>
                        </div>
                    </>
                )}
            </div>
        </SurveySection>
    );
};

export const EnvironmentSection = ({
    data,
    update,
    toggleArr,
    id,
    title,
    highlightedId
}: {
    data: SurveyData,
    update: (key: keyof SurveyData, val: any) => void,
    toggleArr: (key: keyof SurveyData, val: string) => void,
    id: string,
    title: string,
    highlightedId: string | null
}) => {
    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title}>
            <QuestionBlock>
                <div className="flex flex-col items-start gap-6 border-b-2 pb-8 mb-6">
                    <CheckBox checked={data?.q16_noFacilities || false} label="無重要環境設施" onClick={() => update('q16_noFacilities', !data.q16_noFacilities)} />
                </div>
                <InlineWarning center>※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施</InlineWarning>
                <div className={`space-y-8 mt-6 ${data?.q16_noFacilities ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    {ENV_CATEGORIES.map((cat, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] border-3 border-slate-200">
                            <p className="font-black text-slate-600 mb-6 border-b pb-4 text-2xl">{cat.title}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cat.items.map(item => (
                                    <CheckBox key={item} checked={data?.q16_items?.includes(item) || false} label={item} onClick={() => toggleArr('q16_items', item)} />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="bg-white p-8 rounded-[2rem] border-3 border-sky-100 text-left">
                        <CheckBox checked={data?.q16_hasOther || false} label="其他" onClick={() => update('q16_hasOther', !data.q16_hasOther)} />
                        {data?.q16_hasOther && <SubItemHighlight><DetailInput value={data.q16_other || ''} onChange={v => update('q16_other', v)} placeholder="如：變電所、加油站" /></SubItemHighlight>}
                    </div>
                </div>
            </QuestionBlock>
        </SurveySection>
    );
};

export const NotesSection = ({
    data,
    setData,
    update,
    id,
    title,
    highlightedId,
    type
}: {
    data: SurveyData,
    setData: React.Dispatch<React.SetStateAction<SurveyData>>,
    update: (key: keyof SurveyData, val: any) => void,
    id: string,
    title: string,
    highlightedId: string | null,
    type: SurveyType
}) => {
    const isLand = type === 'land';
    const issueKey = isLand ? 'land_q8_special' : 'q17_issue';
    const descKey = isLand ? 'land_q8_special_desc' : 'q17_desc';

    const issueValue = data?.[issueKey] as string;
    const descValue = data?.[descKey] as string;

    const warningText = isLand 
        ? '※如前身為亂葬崗、環保議題、開發情況、新聞事件等' 
        : (type === 'factory' 
            ? '※如凶宅、氯離子過高、海砂屋、危險建築、新聞事件、糾紛等' 
            : (type === 'parking'
                ? '※車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等'
                : '※如凶宅、氯離子過高、海砂屋、車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等'));

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title}>
            <QuestionBlock>
                <InlineWarning center>{warningText}</InlineWarning>
                <div className="mt-6">
                    <BooleanReveal 
                        label=""
                        value={issueValue === '否' ? '無' : (issueValue === '是' ? '有' : '')}
                        onChange={(v) => { 
                            const val = v === '無' ? '否' : '是'; 
                            if (val === '否') {
                                setData(p => ({ ...p, [issueKey]: val, [descKey]: '' }));
                            } else {
                                update(issueKey, val);
                            }
                        }}
                        options={['無', '有']}
                        trigger="有"
                    >
                        <DetailInput value={descValue || ''} onChange={v => update(descKey, v)} placeholder="如：曾發生非自然身故" />
                    </BooleanReveal>
                </div>
            </QuestionBlock>
        </SurveySection>
    );
};