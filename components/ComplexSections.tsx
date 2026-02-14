



import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    PARK_TYPES, CAR_USAGE_OPTS, Q11_OPTS, ENV_CATEGORIES 
} from '../constants';
import { 
    CheckBox, RadioGroup, SurveySection, SubItemHighlight, DetailInput, 
    InlineWarning, AccordionRadio, UnitInput, QuestionBlock, BooleanReveal, LandNumberInputs 
} from './SharedUI';

export const UtilitiesSection = ({ 
    data, 
    setData, 
    title, 
    type,
    id,
    highlightedId
}: { 
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>, 
    title: string,
    type: SurveyType,
    id: string,
    highlightedId: string | null
}) => {
    const update = (key: keyof SurveyData, val: any) => setData(p => ({ ...p, [key]: val }));

    const waterOptions = ['自來水', '地下水', '水利溝渠', '湖水/池塘'];
    const filteredWaterOptions = type === 'factory' 
        ? waterOptions.filter(o => o !== '水利溝渠' && o !== '湖水/池塘') 
        : waterOptions;

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title}>
            <div className="space-y-8">
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[2rem] font-black mb-2 text-slate-800 dark:text-slate-100 leading-snug">
                        {type === 'factory' ? '供電類型' : '是否有電力供應？'}
                    </p>
                    {type === 'factory' ? (
                         <div className="mb-6"><InlineWarning>※請務必拍照電費單或電盤再行確認</InlineWarning></div>
                    ) : (
                         <p className="text-xl font-bold text-rose-600 mb-6 dark:text-rose-400">(請務必索取並詳見台電電費單)</p>
                    )}

                    {type === 'factory' ? (
                        <div className="space-y-6">
                            <RadioGroup 
                                options={['無電力(需自行申請)', '一般用電(單相 110V/220V，僅供照明冷氣)', '動力用電(三相電)', '高壓電供電', '現場無法判斷 (需詳閱電費單)', '其他']} 
                                value={data?.land_q1_elec || ''} 
                                onChange={v => {
                                    setData(prev => {
                                        const isPower = v.includes('一般用電') || v.includes('動力用電') || v.includes('高壓電供電');
                                        const needsVoltage = v.includes('動力用電') || v.includes('高壓電供電');
                                        return {
                                            ...prev,
                                            land_q1_elec: v,
                                            land_q1_elec_other: v === '其他' ? prev.land_q1_elec_other : '',
                                            land_q1_elec_meter: isPower ? prev.land_q1_elec_meter : '',
                                            land_q1_elec_voltage: needsVoltage ? prev.land_q1_elec_voltage : '',
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
                            
                            {(data.land_q1_elec?.includes('一般用電') || data.land_q1_elec?.includes('動力用電') || data.land_q1_elec === '高壓電供電') && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <SubItemHighlight>
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-3 dark:text-slate-200">電錶型態？</p>
                                                <RadioGroup options={['獨立電錶', '共用電錶']} value={data.land_q1_elec_meter || ''} onChange={v => update('land_q1_elec_meter', v)} />
                                            </div>
                                            
                                            {(data.land_q1_elec?.includes('動力用電') || data.land_q1_elec === '高壓電供電') && (
                                                <div>
                                                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-3 dark:text-slate-200">電壓規格</p>
                                                    <RadioGroup options={['三相 220V', '三相 380V/三相四線式', '高壓電供電', '其他/不確定']} value={data.land_q1_elec_voltage || ''} onChange={v => update('land_q1_elec_voltage', v)} layout="grid" cols={2} />
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-2 dark:text-slate-200">契約容量 (馬力數)</p>
                                                <p className="text-slate-500 text-sm font-bold mb-4 dark:text-slate-400">提示：若看到變壓器通常為高壓電；若電錶有倍數標示通常為大馬力</p>
                                                <RadioGroup options={['一般用電(無契約容量)', '99馬力(HP)以下(無須設置配電室)', '100馬力(HP)以上(可能需設置高壓變電站)', '現場無法判斷 (需詳閱電費單)']} value={data.land_q1_elec_capacity || ''} onChange={v => update('land_q1_elec_capacity', v)} layout="grid" cols={1} />
                                            </div>
                                        </div>
                                    </SubItemHighlight>
                                </div>
                            )}
                        </div>
                    ) : (
                        <AccordionRadio 
                            options={['無', '其他', '有']} 
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
                                    {opt === '有' && <SubItemHighlight><div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-600"><RadioGroup options={['獨立電錶', '共有電錶']} value={data.land_q1_elec_detail || ''} onChange={v => update('land_q1_elec_detail', v)} /></div></SubItemHighlight>}
                                    {opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：發電機、太陽能" /></SubItemHighlight>}
                                </>
                            )} 
                        />
                    )}
                </QuestionBlock>
                
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[2rem] font-black mb-6 text-slate-800 dark:text-slate-100 leading-snug">是否有水源供應？</p>
                    <AccordionRadio 
                        options={['無', '其他', '有']} 
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
                                                options={filteredWaterOptions} 
                                                value={data.land_q1_water_cat || ''} 
                                                onChange={v => setData(prev => ({ ...prev, land_q1_water_cat: v, land_q1_water_tap_detail: v === '自來水' ? prev.land_q1_water_tap_detail : '', land_q1_water_ground_detail: v === '地下水' ? prev.land_q1_water_ground_detail : '', land_q1_water_irr_detail: v === '水利溝渠' ? prev.land_q1_water_irr_detail : '' }))} 
                                                layout="grid" cols={2} 
                                            />
                                            {data.land_q1_water_cat === '自來水' && <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 animate-in fade-in slide-in-from-top-2 dark:bg-slate-900/50 dark:border-slate-600"><RadioGroup options={['獨立水錶', '共有水錶', '無水錶，但管線已臨路', '無水錶，且管線距離遙遠']} value={data.land_q1_water_tap_detail || ''} onChange={v => update('land_q1_water_tap_detail', v)} /></div>}
                                            {data.land_q1_water_cat === '地下水' && <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 animate-in fade-in slide-in-from-top-2 dark:bg-slate-900/50 dark:border-slate-600"><RadioGroup options={['自然湧出流動', '合法水井', '私設水井']} value={data.land_q1_water_ground_detail || ''} onChange={v => update('land_q1_water_ground_detail', v)} /></div>}
                                            {data.land_q1_water_cat === '水利溝渠' && <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 animate-in fade-in slide-in-from-top-2 dark:bg-slate-900/50 dark:border-slate-600"><RadioGroup options={['公有', '私人']} value={data.land_q1_water_irr_detail || ''} onChange={v => update('land_q1_water_irr_detail', v)} /></div>}
                                        </div>
                                    </SubItemHighlight>
                                )}
                                {opt === '其他' && <SubItemHighlight><DetailInput value={data.land_q1_water_other || ''} onChange={v => update('land_q1_water_other', v)} placeholder="如：山泉水、接鄰居水等" /></SubItemHighlight>}
                            </>
                        )} 
                    />
                </QuestionBlock>

                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[2rem] font-black mb-6 text-slate-800 dark:text-slate-100 leading-snug">是否設置用戶加壓受水設備？</p>
                    <AccordionRadio 
                        options={['無', '其他', '有']} 
                        value={data.water_booster || ''} 
                        onChange={v => setData(prev => ({ ...prev, water_booster: v, water_booster_desc: v === '其他' ? prev.water_booster_desc : '' }))} 
                        renderDetail={(opt) => (opt === '其他' ? <SubItemHighlight><DetailInput value={data.water_booster_desc || ''} onChange={v => update('water_booster_desc', v)} placeholder="請說明" /></SubItemHighlight> : null)} 
                    />
                </QuestionBlock>
                
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[2rem] font-black mb-6 text-slate-800 dark:text-slate-100 leading-snug">是否有其他設施？</p>
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
    includeExtras = true,
    isFactory = false
}: { 
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>,
    update: (key: keyof SurveyData, val: any) => void, 
    toggleArr: (key: keyof SurveyData, val: string) => void,
    parkingLogic: any,
    startNum?: number,
    ids: { main: string; abnormal: string; supplement: string },
    highlightedId: string | null,
    includeExtras?: boolean,
    isFactory?: boolean
}) => {
    const isHouseOrFactory = startNum === 8 || startNum === 11 || startNum === 9; // Factory typically starts late
    const handleCarUsageToggle = (val: string) => {
        setData(prev => {
            let arr: string[] = prev.q10_carUsage || [];
            if (val === "固定位置使用") { if (!arr.includes(val)) arr = arr.filter(x => x !== "每日先到先停" && x !== "須固定抽籤"); } 
            else if (val === "每日先到先停" || val === "須固定抽籤") { if (!arr.includes(val)) arr = arr.filter(x => x !== "固定位置使用"); }
            return { ...prev, q10_carUsage: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] };
        });
    };

    const hasCarMethod = (data.q10_parkTypes && data.q10_parkTypes.length > 0) || data.q10_hasParkTypeOther;

    return (
        <SurveySection id={ids.main} highlighted={highlightedId === ids.main}>
            <div className="flex justify-between items-center border-b-2 pb-6 mb-2 dark:border-slate-700">
                <p className="text-[1.5rem] md:text-[2rem] font-black text-slate-800 text-left dark:text-slate-100 leading-snug">{isHouseOrFactory ? `${startNum}. 車位資訊 (若無車位請略過)` : `${startNum}. 車位資訊`}</p>
            </div>
            {startNum !== 1 && <div className="mb-8"><CheckBox checked={data?.q10_noParking || false} label="若無車位，點選此處" onClick={() => update('q10_noParking', !data.q10_noParking)} /></div>}
            
            <div className="space-y-12">
                <QuestionBlock className={parkingLogic.disableMethod ? 'opacity-40 grayscale pointer-events-none' : ''}>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-snug">停車方式 (單選)：</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                        {PARK_TYPES.map(pt => (
                            <div key={pt} className={`relative overflow-hidden transition-all duration-300 ${data?.q10_parkTypes?.[0] === pt ? 'bg-sky-50 rounded-[2rem] transform scale-[1.01] dark:bg-sky-900/30' : 'bg-white rounded-[2rem] dark:bg-slate-800'}`}>
                                <div onClick={() => { if (parkingLogic.disableMethod) return; setData(prev => ({ ...prev, q10_parkTypes: [pt], q10_rampMechLoc: pt !== '坡道機械' ? '' : prev.q10_rampMechLoc, q10_liftMechLoc: pt !== '升降機械' ? '' : prev.q10_liftMechLoc })); }} className={`cursor-pointer w-full p-4 md:p-6 flex items-center gap-2 md:gap-4 rounded-[1.5rem] md:rounded-[2rem] border-4 border-b-[6px] md:border-b-[8px] transition-all duration-150 active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] ${data?.q10_parkTypes?.[0] === pt ? 'border-sky-600 border-b-sky-800 bg-sky-50 dark:bg-sky-900 dark:border-sky-500' : 'border-slate-300 border-b-slate-400 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:border-b-slate-700 dark:hover:bg-slate-700'}`}>
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-3 flex items-center justify-center flex-shrink-0 transition-colors ${data?.q10_parkTypes?.[0] === pt ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-500' : 'border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-500'}`}>{data?.q10_parkTypes?.[0] === pt && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />}</div>
                                        <span className={`font-black text-lg md:text-2xl ${data?.q10_parkTypes?.[0] === pt ? 'text-sky-800 dark:text-sky-100' : 'text-slate-600 dark:text-slate-300'}`}>{pt}</span>
                                </div>
                                {((pt === "坡道機械" || pt === "升降機械") && data?.q10_parkTypes?.[0] === pt) && (
                                    <div className="p-4 md:p-6 pt-2 animate-in slide-in-from-top-4 duration-300 mt-2"><p className="text-lg md:text-xl font-bold text-slate-500 mb-3 text-center dark:text-slate-400">請選擇所在層置：</p><div className="flex flex-wrap gap-2 md:gap-4 justify-center">{['上層', '中層', '下層'].map(loc => (<button key={loc} type="button" onClick={(e) => { e.stopPropagation(); update(pt === "坡道機械" ? 'q10_rampMechLoc' : 'q10_liftMechLoc', loc); }} className={`flex-1 items-center justify-center px-4 py-3 md:px-5 md:py-4 rounded-2xl font-black text-lg md:text-xl transition-all duration-150 border-3 border-b-[6px] active:border-b-3 active:translate-y-[3px] ${(pt === "坡道機械" ? data.q10_rampMechLoc : data.q10_liftMechLoc) === loc ? 'bg-sky-500 text-white border-sky-500 border-b-sky-700 dark:bg-sky-600 dark:border-sky-400' : 'bg-white border-slate-300 border-b-slate-400 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'}`}>{loc}</button>))}</div></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={`bg-white p-4 md:p-6 rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 mt-6 dark:bg-slate-800 dark:border-slate-700`}><CheckBox checked={data?.q10_hasParkTypeOther || false} label="其他" onClick={() => update('q10_hasParkTypeOther', !data.q10_hasParkTypeOther)} disabled={parkingLogic.disableMethod} />{data?.q10_hasParkTypeOther && (<SubItemHighlight disabled={parkingLogic.disableMethod}><DetailInput value={data.q10_parkTypeOther || ''} onChange={v => update('q10_parkTypeOther', v)} placeholder="如：庭院停車、騎樓停車" /></SubItemHighlight>)}</div>
                </QuestionBlock>
                
                {hasCarMethod && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-12">
                        <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableNumber ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-snug">車位編號：</p>
                            <RadioGroup options={['有車位編號', '無車位編號']} value={data?.q10_parkingNumberType === 'number' ? '有車位編號' : (data?.q10_parkingNumberType === 'none' ? '無車位編號' : '')} onChange={(v) => { if (v === '有車位編號') update('q10_parkingNumberType', 'number'); else { update('q10_parkingNumberType', 'none'); update('q10_parkingNumberVal', ''); } }} disabled={parkingLogic.disableNumber} />
                            {data?.q10_parkingNumberType === 'number' && <SubItemHighlight disabled={parkingLogic.disableNumber}><DetailInput value={data.q10_parkingNumberVal || ''} onChange={v => update('q10_parkingNumberVal', v)} placeholder="如：B1-123" /></SubItemHighlight>}
                        </QuestionBlock>

                        <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableCarStatus ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-snug">汽車車位使用情況：</p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {CAR_USAGE_OPTS.map(u => <div key={u} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_carUsage?.includes(u) || false} label={u} onClick={() => handleCarUsageToggle(u)} disabled={parkingLogic.disableCarStatus} /></div>)}
                                <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_carUsage?.includes("須固定抽籤") || false} label="須固定抽籤" onClick={() => handleCarUsageToggle("須固定抽籤")} disabled={parkingLogic.disableCarStatus} />{data?.q10_carUsage?.includes("須固定抽籤") && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><div className="ml-0 md:ml-4 flex items-center justify-center gap-4 mt-2 font-black text-xl md:text-2xl text-slate-700 dark:text-slate-200">每 <input type="number" inputMode="numeric" disabled={parkingLogic.disableCarStatus} className="w-20 md:w-28 border-3 rounded-2xl p-2 md:p-4 text-center bg-white shadow-inner dark:bg-slate-900 dark:border-slate-600" value={data.q10_carLotteryMonth || ''} onChange={e => update('q10_carLotteryMonth', e.target.value)} /> 月抽籤一次</div></SubItemHighlight>)}</div>
                                <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 text-center dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_hasCarUsageOther || false} label="其他" onClick={() => update('q10_hasCarUsageOther', !data.q10_hasCarUsageOther)} disabled={parkingLogic.disableCarStatus} />{data?.q10_hasCarUsageOther && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><DetailInput value={data.q10_carUsageOther || ''} onChange={v => update('q10_carUsageOther', v)} placeholder="如：僅夜間使用" /></SubItemHighlight>)}</div>
                            </div>
                        </QuestionBlock>

                        <div className={`bg-blue-50 p-6 md:p-10 rounded-[2.5rem] space-y-8 border-4 border-blue-100 transition-all duration-500 shadow-sm dark:bg-blue-900/20 dark:border-blue-800 ${parkingLogic.disableCarSize ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <p className="font-black text-[1.5rem] md:text-[2rem] text-slate-800 text-left dark:text-blue-100 leading-snug">汽車車位尺寸 (公尺)</p>
                            
                            <div className="mb-4">
                                <RadioGroup options={['實際測量', '依謄本登記', '無法測量']} value={data?.q10_measureType || '實際測量'} onChange={v => update('q10_measureType', v)} disabled={parkingLogic.disableCarSize} layout="flex" />
                            </div>

                            {data?.q10_measureType !== '無法測量' && data?.q10_measureType !== '依謄本登記' && (
                                <div className="flex gap-4 md:gap-6 animate-in slide-in-from-top-4 flex-wrap md:flex-nowrap">
                                    <UnitInput unit="米" placeholder="長" value={data?.q10_dimL || ''} onChange={v => update('q10_dimL', v)} disabled={parkingLogic.disableCarSize} />
                                    <UnitInput unit="米" placeholder="寬" value={data?.q10_dimW || ''} onChange={v => update('q10_dimW', v)} disabled={parkingLogic.disableCarSize} />
                                    <UnitInput unit="米" placeholder="高" value={data?.q10_dimH || ''} onChange={v => update('q10_dimH', v)} disabled={parkingLogic.disableCarSize} />
                                </div>
                            )}

                            {!isFactory && (
                                <div className="border-t-2 border-blue-200/50 pt-4 dark:border-blue-700/50">
                                    <p className="font-black text-[1.5rem] md:text-[2rem] text-slate-800 mt-4 text-left mb-4 dark:text-blue-100 leading-snug">機械載重 (公斤)</p>
                                    <UnitInput unit="kg" value={data?.q10_mechWeight || ''} onChange={v => update('q10_mechWeight', v)} disabled={parkingLogic.disableWeight} placeholder={parkingLogic.disableWeight ? "無須填寫" : "查閱機械車位資訊告示牌"} />
                                </div>
                            )}
                            <div className="border-t-2 border-blue-200/50 pt-4 dark:border-blue-700/50">
                                <p className="font-black text-[1.5rem] md:text-[2rem] text-slate-800 mt-4 text-left mb-4 dark:text-blue-100 leading-snug">車道出入口高度 (公尺)</p>
                                <UnitInput unit="米" value={data?.q10_entryHeight || ''} onChange={v => update('q10_entryHeight', v)} disabled={parkingLogic.disableHeight} placeholder={parkingLogic.disableHeight ? "無須填寫" : "輸入高度"} />
                            </div>
                        </div>

                        {/* Moved Lane Land Number Inputs out of Dimensions Block to here */}
                        <QuestionBlock className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors space-y-6 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600">
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-snug">車道經過地號</p>
                            <LandNumberInputs section={data.q10_laneSection || ''} subSection={data.q10_laneSubSection || ''} number={data.q10_laneNumber || ''} onChangeSection={v => update('q10_laneSection', v)} onChangeSubSection={v => update('q10_laneSubSection', v)} onChangeNumber={v => update('q10_laneNumber', v)} />
                        </QuestionBlock>
                    </div>
                )}

                <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors space-y-6 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600">
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-snug">機車車位使用情況：</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_motoUsage?.includes("固定位置使用") || false} label="固定位置使用" onClick={() => toggleArr('q10_motoUsage', "固定位置使用")} /></div>
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_motoUsage?.includes("無") || false} label="無" onClick={() => toggleArr('q10_motoUsage', "無")} /></div>
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 text-left dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_hasMotoUsageOther || false} label="其他" onClick={() => update('q10_hasMotoUsageOther', !data.q10_hasMotoUsageOther)} />{data?.q10_hasMotoUsageOther && (<SubItemHighlight><DetailInput value={data.q10_motoUsageOther || ''} onChange={v => update('q10_motoUsageOther', v)} placeholder="如：隨到隨停、一年一抽" /></SubItemHighlight>)}</div>
                    </div>
                </div>
                
                <div className={`space-y-10 ${parkingLogic.disableCharging ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[2rem] font-black text-slate-700 mb-8 dark:text-slate-200 leading-snug">社區是否有充電樁？</p>
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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{Q11_OPTS.map(i => <CheckBox key={i} checked={data?.q11_items?.includes(i) || false} label={i} onClick={() => toggleArr('q11_items', i)} disabled={parkingLogic.disableAbnormal} />)}</div>
                                    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
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
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-800 mb-6 text-left dark:text-slate-200">車位現況補充</p>
                                        <div className="mb-6"><InlineWarning>※如車格位置有其他孔蓋、排風機、電箱、租期租金等</InlineWarning></div>
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
    highlightedId,
    warningText // New prop for custom warning
}: {
    data: SurveyData,
    update: (key: keyof SurveyData, val: any) => void,
    toggleArr: (key: keyof SurveyData, val: string) => void,
    id: string,
    title: string,
    highlightedId: string | null,
    warningText?: string
}) => {
    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title}>
            <div className="space-y-6">
                {warningText && <InlineWarning className="mb-6">{warningText}</InlineWarning>}
                <div className="mb-4"><CheckBox checked={data?.q16_noFacilities || false} label="周邊無重要環境設施 (若無點此)" onClick={() => update('q16_noFacilities', !data.q16_noFacilities)} /></div>
                {!data?.q16_noFacilities && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
                        {ENV_CATEGORIES.map((cat, idx) => (
                            <div key={idx} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
                                <h4 className="text-xl font-black text-slate-700 mb-4 border-b-2 border-slate-100 pb-2 dark:text-slate-200 dark:border-slate-600">{cat.title}</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                                    {cat.items.map(item => (
                                        <CheckBox key={item} checked={data?.q16_items?.includes(item) || false} label={item} onClick={() => toggleArr('q16_items', item)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
                            <CheckBox checked={data?.q16_hasOther || false} label="其他應注意設施" onClick={() => update('q16_hasOther', !data.q16_hasOther)} />
                            {data?.q16_hasOther && <SubItemHighlight><DetailInput value={data.q16_other || ''} onChange={v => update('q16_other', v)} placeholder="如抽水站、監獄、軍營等" /></SubItemHighlight>}
                        </div>
                    </div>
                )}
            </div>
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
    type,
    warningText // New prop for custom warning
}: {
    data: SurveyData,
    setData: React.Dispatch<React.SetStateAction<SurveyData>>,
    update: (key: keyof SurveyData, val: any) => void,
    id: string,
    title: string,
    highlightedId: string | null,
    type: SurveyType,
    warningText?: string
}) => {
    const isLandQ8 = id === 'section-land-q8'; 
    const issueKey = isLandQ8 ? 'land_q8_special' : 'q17_issue';
    const descKey = isLandQ8 ? 'land_q8_special_desc' : 'q17_desc';
    const hasIssue = (data as any)[issueKey] === '是';
    const isNoIssue = (data as any)[issueKey] === '否';

    const handleChange = (val: string) => {
        const v = val === '無 (無須補充)' ? '否' : '是';
        setData(prev => ({
            ...prev,
            [issueKey]: v,
            [descKey]: v === '否' ? '' : (prev as any)[descKey]
        }));
    };

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title}>
            {warningText && <InlineWarning className="mb-6">{warningText}</InlineWarning>}
            <BooleanReveal
                label=""
                value={isNoIssue ? '無 (無須補充)' : (hasIssue ? '有 (須補充說明)' : '')}
                onChange={handleChange}
                options={['無 (無須補充)', '有 (須補充說明)']}
                trigger="有 (須補充說明)"
            >
                <div className="space-y-4">
                    <p className="text-xl font-bold text-slate-600 mb-2 dark:text-slate-400">請說明詳細情況：</p>
                    <DetailInput 
                        value={(data as any)[descKey] || ''} 
                        onChange={v => update(descKey as keyof SurveyData, v)} 
                        placeholder={type === 'land' ? "請說明情況" : "如：凶宅、輻射屋..."} 
                    />
                </div>
            </BooleanReveal>
        </SurveySection>
    );
};

// Reusable Land Questions Component
export const LandQuestionsGroup = ({
    data, setData, update, 
    titles,
    ids,
    highlightedId,
    hideDetails = false,
    hideQ2 = false
}: {
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>, 
    update: (key: keyof SurveyData, val: any) => void, 
    titles: { q2: string, q3: string, q4: string },
    ids: { q2: string, q3: string, q4: string },
    highlightedId: string | null,
    hideDetails?: boolean,
    hideQ2?: boolean
}) => {
    // Logic for determining which details to show
    const showDetails = !hideDetails && (data?.land_q2_access !== '袋地 (無路可通)' && data?.land_q2_access !== '');
    
    return (
        <>
            {!hideQ2 && (
            <SurveySection id={ids.q2} highlighted={highlightedId === ids.q2} title={titles.q2}>
                <div className="space-y-8">
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">土地進出通行是否有異常？</p>
                        <AccordionRadio 
                            options={['正常 (可自由通行)', '異常 (有阻礙)', '袋地 (無路可通)']} 
                            value={data?.land_q2_access || ''} 
                            onChange={v => { 
                                setData(prev => ({ 
                                    ...prev, 
                                    land_q2_access: v, 
                                    land_q2_access_desc: v === '異常 (有阻礙)' ? prev.land_q2_access_desc : '',
                                    // Clear physical/ownership fields if landlocked
                                    land_q2_material: v === '袋地 (無路可通)' ? '' : prev.land_q2_material,
                                    land_q2_ditch: v === '袋地 (無路可通)' ? '' : prev.land_q2_ditch,
                                })); 
                            }} 
                            renderDetail={(opt) => (
                                <>
                                    {opt === '異常 (有阻礙)' && <SubItemHighlight><DetailInput value={data.land_q2_access_desc || ''} onChange={v => update('land_q2_access_desc', v)} placeholder="如：路寬不足、有障礙物" /></SubItemHighlight>}
                                    {opt === '袋地 (無路可通)' && <div className="mt-6"><InlineWarning>※注意：袋地可能面臨無法申請建築執照或貸款困難之問題，請務必確認通行權</InlineWarning></div>}
                                </>
                            )} 
                        />
                    </QuestionBlock>
                    
                    {showDetails && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                            
                            {/* Ownership Info Group */}
                            <SubItemHighlight>
                                <div className="space-y-8">
                                    <h4 className="text-xl font-black text-slate-500 border-b-2 border-orange-200 pb-2 mb-4 dark:text-slate-300 dark:border-orange-800">權屬資訊</h4>
                                    
                                    <div className="space-y-3">
                                        <p className="font-bold text-xl text-slate-700 dark:text-slate-200">臨路的歸屬權？</p>
                                        <AccordionRadio 
                                            options={['公有', '私人']} 
                                            value={data.land_q2_owner || ''} 
                                            onChange={v => { setData(prev => ({ ...prev, land_q2_owner: v, land_q2_owner_desc: v === '私人' ? prev.land_q2_owner_desc : '' })); }} 
                                            renderDetail={(opt) => (opt === '私人' ? <SubItemHighlight><DetailInput value={data.land_q2_owner_desc || ''} onChange={v => update('land_q2_owner_desc', v)} placeholder="如：持分共有" /></SubItemHighlight> : null)} 
                                        />
                                    </div>
                                    
                                    {data.land_q2_access === '正常 (可自由通行)' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <p className="font-bold text-xl text-slate-700 dark:text-slate-200">出入地號</p>
                                            <LandNumberInputs section={data.land_q2_access_section || ''} subSection={data.land_q2_access_subSection || ''} number={data.land_q2_access_number || ''} onChangeSection={v => update('land_q2_access_section', v)} onChangeSubSection={v => update('land_q2_access_subSection', v)} onChangeNumber={v => update('land_q2_access_number', v)} />
                                        </div>
                                    )}
                                </div>
                            </SubItemHighlight>

                            {/* Physical Status Group */}
                            <SubItemHighlight>
                                <div className="space-y-8">
                                    <h4 className="text-xl font-black text-slate-500 border-b-2 border-sky-200 pb-2 mb-4 dark:text-slate-300 dark:border-sky-800">物理現況</h4>
                                    
                                    <div className="space-y-4">
                                        <p className="font-bold text-xl text-slate-700 dark:text-slate-200">臨路的路面材質？</p>
                                        <RadioGroup 
                                            options={['柏油路', '水泥路', '泥巴路', '其他']} 
                                            value={data.land_q2_material || ''} 
                                            onChange={v => setData(p => ({...p, land_q2_material: v, land_q2_material_other: v === '其他' ? p.land_q2_material_other : ''}))}
                                            layout="grid"
                                            cols={2} // 2x2 grid on mobile
                                        />
                                        {data.land_q2_material === '其他' && (
                                            <DetailInput value={data.land_q2_material_other || ''} onChange={v => update('land_q2_material_other', v)} placeholder="如：碎石路" />
                                        )}
                                    </div>

                                    {/* Added Road Width Field */}
                                    <div className="space-y-4">
                                        <p className="font-bold text-xl text-slate-700 dark:text-slate-200">臨路寬度 (約幾米)？</p>
                                        <UnitInput unit="米" value={data.land_q2_roadWidth || ''} onChange={v => update('land_q2_roadWidth', v)} placeholder="請輸入路寬" />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="font-bold text-xl text-slate-700 dark:text-slate-200">周圍是否有排水溝？</p>
                                        <RadioGroup 
                                            options={['無', '其他', '有']} 
                                            value={data.land_q2_ditch === '否' ? '無' : (data.land_q2_ditch === '是' ? '有' : (data.land_q2_ditch || ''))}
                                            onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(p => ({...p, land_q2_ditch: val, land_q2_ditch_other: val === '其他' ? p.land_q2_ditch_other : ''})); }}
                                            layout="flex" // Horizontal buttons
                                        />
                                        {data.land_q2_ditch === '其他' && (
                                            <DetailInput value={data.land_q2_ditch_other || ''} onChange={v => update('land_q2_ditch_other', v)} placeholder="如：預計施作" />
                                        )}
                                    </div>
                                </div>
                            </SubItemHighlight>
                        </div>
                    )}
                </div>
            </SurveySection>
            )}

            {!hideDetails && (
                <>
                    <SurveySection id={ids.q3} highlighted={highlightedId === ids.q3} title={titles.q3}>
                        <div className="space-y-8">
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">曾在兩年內進行土地鑑界？</p>
                                {/* Added "Unclear Markers" Option */}
                                <AccordionRadio options={['否 (未鑑界)', '不確定 / 不知道', '是 (曾鑑界)', '是 (但界釘已不明顯/須重新鑑界)']} value={data?.land_q3_survey === '否' ? '否 (未鑑界)' : (data?.land_q3_survey === '是' ? '是 (曾鑑界)' : (data?.land_q3_survey || ''))} onChange={v => { const val = v === '否 (未鑑界)' ? '否' : (v === '是 (曾鑑界)' ? '是' : v); setData(prev => ({ ...prev, land_q3_survey: val, land_q3_survey_detail: val === '是' ? prev.land_q3_survey_detail : '', land_q3_survey_other: val === '其他' ? prev.land_q3_survey_other : '' })); }} renderDetail={(opt) => (<>{opt === '是 (曾鑑界)' && <SubItemHighlight><div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200"><RadioGroup options={['界址與現在相符', '界址與現在不符', '不確定鑑界結果']} value={data.land_q3_survey_detail || ''} onChange={v => update('land_q3_survey_detail', v)} /></div></SubItemHighlight>}{opt === '不確定 / 不知道' && <div className="mt-4"><InlineWarning className="text-red-700 bg-red-100 border-red-400">建議備註：請買方自行鑑界</InlineWarning></div>}</>)} />
                            </QuestionBlock>
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">目前是否有糾紛？</p>
                                <AccordionRadio options={['無糾紛', '疑似 / 處理中', '有糾紛']} value={data?.land_q3_dispute === '否' ? '無糾紛' : (data?.land_q3_dispute === '是' ? '有糾紛' : (data?.land_q3_dispute || ''))} onChange={v => { const val = v === '無糾紛' ? '否' : (v === '有糾紛' ? '是' : v); setData(prev => ({ ...prev, land_q3_dispute: val, land_q3_dispute_desc: val === '是' ? prev.land_q3_dispute_desc : '', land_q3_dispute_other: val === '疑似 / 處理中' ? prev.land_q3_dispute_other : '' })); }} renderDetail={(opt) => (<>{opt === '有糾紛' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_desc || ''} onChange={v => update('land_q3_dispute_desc', v)} placeholder="如：界址爭議" /></SubItemHighlight>}{opt === '疑似 / 處理中' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_other || ''} onChange={v => update('land_q3_dispute_other', v)} placeholder="如：鄰居主張..." /></SubItemHighlight>}</>)} />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    <SurveySection id={ids.q4} highlighted={highlightedId === ids.q4} title={titles.q4}>
                        <div className="space-y-8">
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">位於政府徵收地預定地？</p>
                                <AccordionRadio options={['否 (非範圍內)', '查詢中 / 不確定', '是 (位於範圍內)']} value={data?.land_q4_expro === '否' ? '否 (非範圍內)' : (data?.land_q4_expro === '是' ? '是 (位於範圍內)' : (data?.land_q4_expro || ''))} onChange={v => { const val = v.startsWith('否') ? '否' : (v.startsWith('是') ? '是' : v); setData(prev => ({ ...prev, land_q4_expro: val, land_q4_expro_other: (val === '是' || val === '查詢中 / 不確定') ? prev.land_q4_expro_other : '' })); }} renderDetail={(opt) => ((opt.startsWith('是') || opt === '查詢中 / 不確定') ? <SubItemHighlight><DetailInput value={data.land_q4_expro_other || ''} onChange={v => update('land_q4_expro_other', v)} placeholder="如：道路拓寬預定地" /></SubItemHighlight> : null)} />
                            </QuestionBlock>
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">位於重測區域範圍內？</p>
                                <AccordionRadio options={['否 (非範圍內)', '查詢中 / 不確定', '是 (位於範圍內)']} value={data?.land_q4_resurvey === '否' ? '否 (非範圍內)' : (data?.land_q4_resurvey === '是' ? '是 (位於範圍內)' : (data?.land_q4_resurvey || ''))} onChange={v => { const val = v.startsWith('否') ? '否' : (v.startsWith('是') ? '是' : v); setData(prev => ({ ...prev, land_q4_resurvey: val, land_q4_resurvey_other: (val === '是' || val === '查詢中 / 不確定') ? prev.land_q4_resurvey_other : '' })); }} renderDetail={(opt) => ((opt.startsWith('是') || opt === '查詢中 / 不確定') ? <SubItemHighlight><DetailInput value={data.land_q4_resurvey_other || ''} onChange={v => update('land_q4_resurvey_other', v)} placeholder="如：重測公告期間" /></SubItemHighlight> : null)} />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                </>
            )}
        </>
    );
};

// Reusable Component for Building Land Access (House Q9 / Factory Q10)
export const BuildingLandAccessSection = ({
    data, 
    setData, 
    update,
    prefix,
    title,
    id,
    highlightedId
}: {
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>, 
    update: (key: keyof SurveyData, val: any) => void,
    prefix: 'q14' | 'land_q2',
    title: string,
    id: string,
    highlightedId: string | null
}) => {
    // Map prefix to actual keys
    const accessKey = prefix === 'q14' ? 'q14_access' : 'land_q2_access';
    const ownershipKey = prefix === 'q14' ? 'q14_ownership' : 'land_q2_owner';
    const protectionKey = prefix === 'q14' ? 'q14_protection' : 'land_q2_protection';
    
    // Abnormal desc key mapping
    const abnormalDescKey = prefix === 'q14' ? 'q14_abnormalDesc' : 'land_q2_access_desc';

    // Land Number key mapping
    const sectionKey = prefix === 'q14' ? 'q14_section' : 'land_q2_access_section';
    const subSectionKey = prefix === 'q14' ? 'q14_subSection' : 'land_q2_access_subSection';
    const numberKey = prefix === 'q14' ? 'q14_number' : 'land_q2_access_number';

    // Physical Status key mapping
    const matKey = prefix === 'q14' ? 'q14_roadMaterial' : 'land_q2_material';
    const matOtherKey = prefix === 'q14' ? 'q14_roadMaterialOther' : 'land_q2_material_other';
    const widthKey = prefix === 'q14' ? 'q14_roadWidth' : 'land_q2_roadWidth';
    const ditchKey = prefix === 'q14' ? 'q14_ditch' : 'land_q2_ditch';
    const ditchOtherKey = prefix === 'q14' ? 'q14_ditchOther' : 'land_q2_ditch_other';

    const accessValue = (data as any)[accessKey];
    const ownershipValue = (data as any)[ownershipKey];
    const protectionValue = (data as any)[protectionKey];

    const isNormal = accessValue === '正常' || accessValue === '正常 (可自由通行)';
    const isAbnormal = accessValue === '異常' || accessValue === '異常 (有阻礙)';
    const isLandlocked = accessValue === '袋地' || accessValue === '袋地 (無路可通)';
    
    const handleAccessChange = (val: string) => {
        const fullVal = prefix === 'land_q2' 
            ? (val === '正常' ? '正常 (可自由通行)' : (val === '異常' ? '異常 (有阻礙)' : '袋地 (無路可通)'))
            : val;

        setData(prev => ({
            ...prev,
            [accessKey]: fullVal,
            // Reset dependent fields if switching away
            [ownershipKey]: val === '正常' ? (prev as any)[ownershipKey] : '',
            [protectionKey]: val === '正常' ? (prev as any)[protectionKey] : '',
            [sectionKey]: val === '正常' ? (prev as any)[sectionKey] : '',
            [subSectionKey]: val === '正常' ? (prev as any)[subSectionKey] : '',
            [numberKey]: val === '正常' ? (prev as any)[numberKey] : '',
            [abnormalDescKey]: val === '異常' ? (prev as any)[abnormalDescKey] : '',
            // Clear physical fields if Landlocked
            [matKey]: val === '袋地' ? '' : (prev as any)[matKey],
            [matOtherKey]: val === '袋地' ? '' : (prev as any)[matOtherKey],
            [widthKey]: val === '袋地' ? '' : (prev as any)[widthKey],
            [ditchKey]: val === '袋地' ? '' : (prev as any)[ditchKey],
            [ditchOtherKey]: val === '袋地' ? '' : (prev as any)[ditchOtherKey],
        }));
    };

    let protectionOptions: string[] = [];
    if (ownershipValue === '公有' || ownershipValue === '公有地') protectionOptions = ['現狀通行', '已向政府承租', '計畫道路'];
    else if (ownershipValue === '私人' || ownershipValue === '私有地') protectionOptions = ['已設定地役權', '地主書面同意', '地主口頭同意'];

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title}>
            <QuestionBlock>
                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 dark:text-slate-200 leading-snug">進出通行是否有異常？</p>
                <RadioGroup 
                    options={['正常', '袋地', '異常']}
                    value={isNormal ? '正常' : (isAbnormal ? '異常' : (isLandlocked ? '袋地' : ''))}
                    onChange={handleAccessChange}
                    layout="flex"
                />

                {/* Normal Block */}
                {isNormal && (
                    <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                        <SubItemHighlight>
                            <div className="space-y-8">
                                <h4 className="text-xl font-black text-slate-500 border-b-2 border-sky-200 pb-2 mb-4 dark:text-slate-300 dark:border-sky-800">權利資訊</h4>
                                
                                <div className="space-y-3">
                                    <p className="font-bold text-xl text-slate-700 dark:text-slate-200">通行權屬</p>
                                    <RadioGroup 
                                        options={prefix === 'q14' ? ['公有地', '私有地'] : ['公有', '私人']} 
                                        value={ownershipValue || ''} 
                                        onChange={v => {
                                            setData(p => ({
                                                ...p, 
                                                [ownershipKey]: v,
                                                [protectionKey]: '' // Reset protection on ownership change
                                            }));
                                        }} 
                                    />
                                </div>
                                
                                {ownershipValue && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <p className="font-bold text-xl text-slate-700 dark:text-slate-200">保障類型</p>
                                        <div className="relative">
                                            <select 
                                                className="full-width-input appearance-none bg-white pr-10 cursor-pointer dark:bg-slate-900"
                                                value={protectionValue || ''}
                                                onChange={(e) => update(protectionKey as keyof SurveyData, e.target.value)}
                                            >
                                                <option value="" disabled>請選擇保障類型</option>
                                                {protectionOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <p className="font-bold text-xl text-slate-700 dark:text-slate-200">出入地段號</p>
                                    <LandNumberInputs 
                                        section={(data as any)[sectionKey] || ''} 
                                        subSection={(data as any)[subSectionKey] || ''} 
                                        number={(data as any)[numberKey] || ''} 
                                        onChangeSection={v => update(sectionKey as keyof SurveyData, v)} 
                                        onChangeSubSection={v => update(subSectionKey as keyof SurveyData, v)} 
                                        onChangeNumber={v => update(numberKey as keyof SurveyData, v)} 
                                    />
                                </div>
                            </div>
                        </SubItemHighlight>
                    </div>
                )}

                {/* Abnormal Block */}
                {isAbnormal && (
                    <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <SubItemHighlight>
                            <p className="font-bold text-xl text-slate-700 mb-2 dark:text-slate-200">異常描述</p>
                            <DetailInput 
                                value={(data as any)[abnormalDescKey] || ''} 
                                onChange={v => update(abnormalDescKey as keyof SurveyData, v)} 
                                placeholder="請填寫現況（如他戶建物、路寬不足等）" 
                            />
                        </SubItemHighlight>
                    </div>
                )}

                {/* Physical Status (Normal OR Abnormal) */}
                {(isNormal || isAbnormal) && (
                    <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <SubItemHighlight>
                            <div className="space-y-8">
                                <h4 className="text-xl font-black text-slate-500 border-b-2 border-slate-200 pb-2 mb-4 dark:text-slate-300 dark:border-slate-700">物理現況</h4>
                                
                                <div className="space-y-4">
                                    <p className="font-bold text-xl text-slate-700 dark:text-slate-200">路面材質</p>
                                    <RadioGroup 
                                        options={['柏油路', '水泥路', '泥巴路', '其他']} 
                                        value={(data as any)[matKey] || ''} 
                                        onChange={v => setData(p => ({...p, [matKey]: v, [matOtherKey]: v === '其他' ? (p as any)[matOtherKey] : ''}))}
                                        layout="grid"
                                        cols={2} // 2x2 grid
                                    />
                                    {(data as any)[matKey] === '其他' && (
                                        <DetailInput value={(data as any)[matOtherKey] || ''} onChange={v => update(matOtherKey as keyof SurveyData, v)} placeholder="請說明材質" />
                                    )}
                                </div>

                                {/* Added Road Width Field */}
                                <div className="space-y-4">
                                    <p className="font-bold text-xl text-slate-700 dark:text-slate-200">臨路寬度 (約幾米)？</p>
                                    <UnitInput unit="米" value={(data as any)[widthKey] || ''} onChange={v => update(widthKey as keyof SurveyData, v)} placeholder="請輸入路寬" />
                                </div>

                                <div className="space-y-4">
                                    <p className="font-bold text-xl text-slate-700 dark:text-slate-200">周圍是否有排水溝？</p>
                                    <RadioGroup 
                                        options={['無', '其他', '有']} 
                                        value={(data as any)[ditchKey] || ''} 
                                        onChange={v => {
                                            setData(p => ({...p, [ditchKey]: v, [ditchOtherKey]: v === '其他' ? (p as any)[ditchOtherKey] : ''}))
                                        }}
                                        layout="flex" 
                                    />
                                    {(data as any)[ditchKey] === '其他' && (
                                        <DetailInput value={(data as any)[ditchOtherKey] || ''} onChange={v => update(ditchOtherKey as keyof SurveyData, v)} placeholder="請說明情況" />
                                    )}
                                </div>
                            </div>
                        </SubItemHighlight>
                    </div>
                )}

                {isLandlocked && (
                    <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <InlineWarning>※注意：袋地可能面臨無法申請建築執照或貸款困難之問題，請務必確認通行權</InlineWarning>
                    </div>
                )}
            </QuestionBlock>
        </SurveySection>
    );
};