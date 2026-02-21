
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    PARK_TYPES, CAR_USAGE_OPTS, Q11_OPTS, ENV_CATEGORIES,
    PROTECTION_OPTS_PUBLIC, PROTECTION_OPTS_PRIVATE,
    GROUP_A_TYPES, WATER_BOOSTER_ITEMS_A, WATER_BOOSTER_ITEMS_B,
    FACILITIES_GROUP_A, FACILITY_OPTIONS, FACILITIES_LAND_BASE, FACILITIES_LAND_FARM_EXTRA, FACILITIES_LAND_BUILD_IND_EXTRA,
    LAND_WATER_BOOSTER_ITEMS,
    ACCESS_STATUS_OPTIONS, BUILDING_LINE_OPTIONS, DRAINAGE_OPTIONS
} from '../constants';
import { 
    CheckBox, RadioGroup, SurveySection, SubItemHighlight, DetailInput, 
    InlineWarning, AccordionRadio, UnitInput, QuestionBlock, BooleanReveal, LandNumberInputs,
    SectionStatus
} from './SharedUI';

export const UtilitiesSection = ({ 
    data, 
    setData, 
    title, 
    type,
    id,
    highlightedId,
    status = 'neutral'
}: { 
    data: SurveyData, 
    setData: React.Dispatch<React.SetStateAction<SurveyData>>, 
    title: string,
    type: SurveyType,
    id: string,
    highlightedId: string | null,
    status?: SectionStatus
}) => {
    const update = (key: keyof SurveyData, val: any) => setData(p => ({ ...p, [key]: val }));
    
    // Helper for toggling array items (New needed for Water Booster items)
    const toggleArr = (key: keyof SurveyData, val: string) => setData(p => { 
        const arr = Array.isArray(p[key]) ? p[key] as string[] : []; 
        return { ...p, [key]: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] }; 
    });

    const waterOptions = ['自來水', '地下水', '水利溝渠', '湖水／池塘'];
    const filteredWaterOptions = type === 'factory' 
        ? waterOptions.filter(o => o !== '水利溝渠' && o !== '湖水／池塘') 
        : waterOptions;

    const getOtherFacilityPlaceholder = () => {
        if (type === 'land') {
            if (data.propertyType === '農地') return "如：化糞池、抽水馬達等";
            if (data.propertyType === '建地') return "如：瓦斯、電信箱等";
            if (data.propertyType === '工業地') return "如：高壓電、工業排水等";
        }
        return "如：監視器、熱水器等";
    };

    // Determine if we show Water Booster in Step 2 (Group A)
    // UPDATE: Explicitly exclude 'land' type because Land Survey has its own Water Booster section in Step 3
    const showWaterBooster = type !== 'land' && GROUP_A_TYPES.includes(data.propertyType);

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title} status={status}>
            <div className="space-y-8">
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-2 text-slate-800 dark:text-slate-100 leading-normal">
                        {type === 'factory' ? '供電類型' : '電力供應現況'}
                    </p>
                    {type === 'factory' ? (
                         <div className="mb-6"><InlineWarning>※請務必拍照電費單或電盤再行確認</InlineWarning></div>
                    ) : (
                         <p className="text-xl font-bold text-rose-600 mb-6 dark:text-rose-400">(請務必索取並詳見台電電費單)</p>
                    )}

                    {type === 'factory' ? (
                        <div className="space-y-6">
                            <RadioGroup 
                                options={['無電力(需自行申請)', '一般用電(單相 110V／220V，僅供照明冷氣)', '動力用電(三相電)', '高壓電供電', '現場無法判斷 (需詳閱電費單)', '其他未列項目']} 
                                value={data?.land_q1_elec || ''} 
                                onChange={v => {
                                    setData(prev => {
                                        const isPower = v.includes('一般用電') || v.includes('動力用電') || v.includes('高壓電供電');
                                        const needsVoltage = v.includes('動力用電') || v.includes('高壓電供電');
                                        return {
                                            ...prev,
                                            land_q1_elec: v,
                                            land_q1_elec_other: v === '其他未列項目' ? prev.land_q1_elec_other : '',
                                            land_q1_elec_meter: isPower ? prev.land_q1_elec_meter : '',
                                            land_q1_elec_voltage: needsVoltage ? prev.land_q1_elec_voltage : '',
                                            land_q1_elec_capacity: isPower ? prev.land_q1_elec_capacity : ''
                                        };
                                    });
                                }} 
                                layout="grid"
                                cols={1}
                            />
                            {data?.land_q1_elec === '其他未列項目' && (
                                <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：發電機、太陽能" /></SubItemHighlight>
                            )}
                            
                            {(data.land_q1_elec?.includes('一般用電') || data.land_q1_elec?.includes('動力用電') || data.land_q1_elec === '高壓電供電') && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <SubItemHighlight>
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-3 dark:text-slate-200 leading-normal">電錶型態？</p>
                                                <RadioGroup options={['獨立電錶', '共用電錶']} value={data.land_q1_elec_meter || ''} onChange={v => update('land_q1_elec_meter', v)} />
                                            </div>
                                            
                                            {(data.land_q1_elec?.includes('動力用電') || data.land_q1_elec === '高壓電供電') && (
                                                <div>
                                                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-3 dark:text-slate-200 leading-normal">電壓規格</p>
                                                    <RadioGroup options={['三相 220V', '三相 380V／三相四線式', '高壓電供電', '其他/待查證']} value={data.land_q1_elec_voltage || ''} onChange={v => update('land_q1_elec_voltage', v)} layout="grid" cols={2} />
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-2 dark:text-slate-200 leading-normal">契約容量 (馬力數)</p>
                                                <p className="text-slate-500 text-sm font-bold mb-4 dark:text-slate-400">提示：若看到變壓器通常為高壓電；若電錶有倍數標示通常為大馬力</p>
                                                <RadioGroup options={['一般用電(無契約容量)', '99馬力(HP)以下(無須設置配電室)', '100馬力(HP)以上(可能需設置高壓變電站)', '現場無法判斷 (需詳閱電費單)', '其他未列項目']} value={data.land_q1_elec_capacity || ''} onChange={v => update('land_q1_elec_capacity', v)} layout="grid" cols={1} />
                                            </div>
                                        </div>
                                    </SubItemHighlight>
                                </div>
                            )}
                        </div>
                    ) : (
                        <AccordionRadio 
                            options={['無', '有', '其他未列項目']} 
                            value={data?.land_q1_elec === '否' ? '無' : (data?.land_q1_elec === '是' ? '有' : (data?.land_q1_elec || ''))}
                            onChange={v => {
                                const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                                setData(prev => ({
                                    ...prev,
                                    land_q1_elec: val,
                                    land_q1_elec_detail: val === '是' ? prev.land_q1_elec_detail : '',
                                    land_q1_elec_other: val === '其他未列項目' ? prev.land_q1_elec_other : ''
                                }));
                            }} 
                            renderDetail={(opt) => (
                                <>
                                    {opt === '有' && <SubItemHighlight><div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-600"><RadioGroup options={['獨立電錶', '共有電錶']} value={data.land_q1_elec_detail || ''} onChange={v => update('land_q1_elec_detail', v)} /></div></SubItemHighlight>}
                                    {opt === '其他未列項目' && <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：發電機、太陽能" /></SubItemHighlight>}
                                </>
                            )} 
                            cols={2}
                        />
                    )}
                </QuestionBlock>
                
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 text-slate-800 dark:text-slate-100 leading-normal">水源供應現況</p>
                    <AccordionRadio 
                        options={['無', '有', '其他未列項目']} 
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
                                land_q1_water_other: val === '其他未列項目' ? prev.land_q1_water_other : ''
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
                                {opt === '其他未列項目' && <SubItemHighlight><DetailInput value={data.land_q1_water_other || ''} onChange={v => update('land_q1_water_other', v)} placeholder="如：山泉水、接鄰居水等" /></SubItemHighlight>}
                            </>
                        )} 
                        cols={2}
                    />
                </QuestionBlock>

                {/* Solar Equipment for Factory - New Requirement */}
                {type === 'factory' && (
                     <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4 text-slate-800 dark:text-slate-100 leading-normal">太陽能光電發電設備</p>
                        <div className="mb-6"><InlineWarning>※本項由使用者自行管理維護</InlineWarning></div>
                        <RadioGroup 
                            options={['無設置', '合法設置', '私下設置']} 
                            value={data.house_solar_status || ''} 
                            onChange={v => update('house_solar_status', v)} 
                            cols={3}
                        />
                     </QuestionBlock>
                )}

                {showWaterBooster && (
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4 text-slate-800 dark:text-slate-100 leading-normal">加壓受水設備</p>
                        <div className="mb-6">
                            <InlineWarning>※本項由使用者自行管理維護，若物件型態為道路用地／公設地，確認是否為自來水公司之公共設施，或鄰地非法佔用</InlineWarning>
                        </div>
                        
                        <RadioGroup 
                            options={['無設置', '有設置']} 
                            value={data.water_booster === '無設置' || data.water_booster === '無' ? '無設置' : (data.water_booster === '有設置' || data.water_booster === '有' ? '有設置' : '')} 
                            onChange={v => {
                                const val = v === '無設置' ? '無設置' : '有設置';
                                setData(prev => ({ 
                                    ...prev, 
                                    water_booster: val, 
                                    water_booster_items: val === '無設置' ? [] : prev.water_booster_items 
                                }));
                            }} 
                            cols={2}
                        />

                        {data.water_booster === '有設置' && (
                            <SubItemHighlight>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {WATER_BOOSTER_ITEMS_A.map(item => (
                                        <CheckBox 
                                            key={item} 
                                            checked={data.water_booster_items?.includes(item) || false} 
                                            label={item} 
                                            onClick={() => toggleArr('water_booster_items', item)} 
                                        />
                                    ))}
                                </div>
                            </SubItemHighlight>
                        )}
                    </QuestionBlock>
                )}
                
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 text-slate-800 dark:text-slate-100 leading-normal">其他設施現況</p>
                    <AccordionRadio 
                        options={['無', '有']} 
                        value={data?.land_q1_other_new === '否' ? '無' : (data?.land_q1_other_new === '是' ? '有' : '')} 
                        onChange={v => { 
                            // Fix: Use ternary to allow empty string (deselect)
                            const val = v === '無' ? '否' : (v === '有' ? '是' : ''); 
                            setData(prev => ({ ...prev, land_q1_other_new: val, land_q1_other_desc: val === '是' ? prev.land_q1_other_desc : '' })); 
                        }} 
                        renderDetail={(opt) => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q1_other_desc || ''} onChange={v => update('land_q1_other_desc', v)} placeholder={getOtherFacilityPlaceholder()} /></SubItemHighlight> : null)} 
                        cols={2}
                    />
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
    isFactory = false,
    status = 'neutral'
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
    isFactory?: boolean,
    status?: SectionStatus
}) => {
    const isHouseOrFactory = startNum === 8 || startNum === 11 || startNum === 9; 
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
        <SurveySection id={ids.main} highlighted={highlightedId === ids.main} status={status}>
            <div className="flex justify-between items-center border-b-2 pb-6 mb-2 dark:border-slate-700">
                <p className="text-[1.5rem] md:text-[2rem] font-black text-slate-800 text-left dark:text-slate-100 leading-normal">{isHouseOrFactory ? `${startNum}. 車位資訊` : `${startNum}. 車位資訊`}</p>
            </div>
            {startNum !== 1 && <div className="mb-8"><CheckBox checked={data?.q10_noParking || false} label="無車位" onClick={() => update('q10_noParking', !data.q10_noParking)} /></div>}
            
            <div className="space-y-12">
                <QuestionBlock className={parkingLogic.disableMethod ? 'opacity-40 grayscale pointer-events-none' : ''}>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-normal">停車方式 (單選)：</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                        {PARK_TYPES.map(pt => (
                            <div key={pt} className={`relative overflow-hidden transition-all duration-300 ${data?.q10_parkTypes?.[0] === pt ? 'bg-sky-50 rounded-[2rem] transform scale-[1.01] dark:bg-sky-900/30' : 'bg-white rounded-[2rem] dark:bg-slate-800'}`}>
                                <div onClick={() => { 
                                    if (parkingLogic.disableMethod) return; 
                                    setData(prev => {
                                        const isSelected = prev.q10_parkTypes?.[0] === pt;
                                        return {
                                            ...prev,
                                            q10_parkTypes: isSelected ? [] : [pt], // Toggle logic: Clear if selected, else set new
                                            // Clear sub-options if switching away or deselecting relevant type
                                            q10_rampMechLoc: (isSelected || pt !== '坡道機械') ? '' : prev.q10_rampMechLoc,
                                            q10_liftMechLoc: (isSelected || pt !== '升降機械') ? '' : prev.q10_liftMechLoc
                                        };
                                    }); 
                                }} className={`cursor-pointer w-full p-4 md:p-6 flex items-center gap-2 md:gap-4 rounded-[1.5rem] md:rounded-[2rem] border-4 border-b-[6px] md:border-b-[8px] transition-all duration-150 active:border-b-4 active:translate-y-[2px] md:active:translate-y-[4px] ${data?.q10_parkTypes?.[0] === pt ? 'border-sky-600 border-b-sky-800 bg-sky-50 dark:bg-sky-900 dark:border-sky-500' : 'border-slate-300 border-b-slate-400 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:border-b-slate-700 dark:hover:bg-slate-700'}`}>
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-3 flex items-center justify-center flex-shrink-0 transition-colors ${data?.q10_parkTypes?.[0] === pt ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-500' : 'border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-500'}`}>{data?.q10_parkTypes?.[0] === pt && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />}</div>
                                        <span className={`font-black text-lg md:text-2xl ${data?.q10_parkTypes?.[0] === pt ? 'text-sky-800 dark:text-sky-100' : 'text-slate-600 dark:text-slate-300'}`}>{pt}</span>
                                </div>
                                {((pt === "坡道機械" || pt === "升降機械") && data?.q10_parkTypes?.[0] === pt) && (
                                    <div className="p-4 md:p-6 pt-2 animate-in slide-in-from-top-4 duration-300 mt-2">
                                        <p className="text-lg md:text-xl font-bold text-slate-500 mb-3 text-center dark:text-slate-400">請選擇所在層置：</p>
                                        <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                                            {['上層', '中層', '下層'].map(loc => (
                                                <button 
                                                    key={loc} 
                                                    type="button" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        const targetKey = pt === "坡道機械" ? 'q10_rampMechLoc' : 'q10_liftMechLoc';
                                                        const currentVal = pt === "坡道機械" ? data.q10_rampMechLoc : data.q10_liftMechLoc;
                                                        // Toggle logic for sub-options
                                                        update(targetKey, currentVal === loc ? '' : loc); 
                                                    }} 
                                                    className={`flex-1 items-center justify-center px-4 py-3 md:px-5 md:py-4 rounded-2xl font-black text-lg md:text-xl transition-all duration-150 border-3 border-b-[6px] active:border-b-3 active:translate-y-[3px] ${(pt === "坡道機械" ? data.q10_rampMechLoc : data.q10_liftMechLoc) === loc ? 'bg-sky-500 text-white border-sky-500 border-b-sky-700 dark:bg-sky-600 dark:border-sky-400' : 'bg-white border-slate-300 border-b-slate-400 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'}`}
                                                >
                                                    {loc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={`bg-white p-4 md:p-6 rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 mt-6 dark:bg-slate-800 dark:border-slate-700`}><CheckBox checked={data?.q10_hasParkTypeOther || false} label="其他未列項目" onClick={() => update('q10_hasParkTypeOther', !data.q10_hasParkTypeOther)} disabled={parkingLogic.disableMethod} />{data?.q10_hasParkTypeOther && (<SubItemHighlight disabled={parkingLogic.disableMethod}><DetailInput value={data.q10_parkTypeOther || ''} onChange={v => update('q10_parkTypeOther', v)} placeholder="如：庭院停車、騎樓停車" /></SubItemHighlight>)}</div>
                </QuestionBlock>
                
                {hasCarMethod && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-12">
                        <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableNumber ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-normal">車位編號：</p>
                            <RadioGroup 
                                options={['無車位編號', '有車位編號']} 
                                value={data?.q10_parkingNumberType === 'number' ? '有車位編號' : (data?.q10_parkingNumberType === 'none' ? '無車位編號' : '')} 
                                onChange={(v) => { 
                                    if (v === '有車位編號') update('q10_parkingNumberType', 'number'); 
                                    else if (v === '無車位編號') { update('q10_parkingNumberType', 'none'); update('q10_parkingNumberVal', ''); }
                                    else { update('q10_parkingNumberType', ''); update('q10_parkingNumberVal', ''); } // Deselect logic
                                }} 
                                disabled={parkingLogic.disableNumber} 
                            />
                            {data?.q10_parkingNumberType === 'number' && <SubItemHighlight disabled={parkingLogic.disableNumber}><DetailInput value={data.q10_parkingNumberVal || ''} onChange={v => update('q10_parkingNumberVal', v)} placeholder="如：B1-123" /></SubItemHighlight>}
                        </QuestionBlock>

                        <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableCarStatus ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-normal">汽車車位使用現況：</p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {CAR_USAGE_OPTS.map(u => <div key={u} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_carUsage?.includes(u) || false} label={u} onClick={() => handleCarUsageToggle(u)} disabled={parkingLogic.disableCarStatus} /></div>)}
                                <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_carUsage?.includes("須固定抽籤") || false} label="須固定抽籤" onClick={() => handleCarUsageToggle("須固定抽籤")} disabled={parkingLogic.disableCarStatus} />{data?.q10_carUsage?.includes("須固定抽籤") && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><div className="ml-0 md:ml-4 flex items-center justify-center gap-4 mt-2 font-black text-xl md:text-2xl text-slate-700 dark:text-slate-200">每 <input type="number" inputMode="numeric" disabled={parkingLogic.disableCarStatus} className="w-20 md:w-28 border-3 rounded-2xl p-2 md:p-4 text-center bg-white shadow-inner dark:bg-slate-900 dark:border-slate-600" value={data.q10_carLotteryMonth || ''} onChange={e => update('q10_carLotteryMonth', e.target.value)} /> 月抽籤一次</div></SubItemHighlight>)}</div>
                                <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 text-center dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_hasCarUsageOther || false} label="其他未列項目" onClick={() => update('q10_hasCarUsageOther', !data.q10_hasCarUsageOther)} disabled={parkingLogic.disableCarStatus} />{data?.q10_hasCarUsageOther && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><DetailInput value={data.q10_carUsageOther || ''} onChange={v => update('q10_carUsageOther', v)} placeholder="如：僅夜間使用" /></SubItemHighlight>)}</div>
                            </div>
                        </QuestionBlock>

                        <div className={`bg-blue-50 p-6 md:p-10 rounded-[2.5rem] space-y-8 border-4 border-blue-100 transition-all duration-500 shadow-sm dark:bg-blue-900/20 dark:border-blue-800 ${parkingLogic.disableCarSize ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <p className="font-black text-[1.5rem] md:text-[1.75rem] text-slate-800 text-left dark:text-blue-100 leading-normal">汽車車位尺寸 (公尺)</p>
                            
                            <div className="mb-4">
                                <RadioGroup 
                                    options={['實際測量', '依車位資訊告示牌', '無法測量也無相關資訊']} 
                                    value={data?.q10_measureType || ''} 
                                    onChange={v => update('q10_measureType', v)} 
                                    disabled={parkingLogic.disableCarSize} 
                                    layout="grid"
                                    cols={2}
                                    spanFullOption="無法測量也無相關資訊" // New prop usage
                                />
                            </div>

                            {data?.q10_measureType !== '無法測量也無相關資訊' && data?.q10_measureType !== '依車位資訊告示牌' && (
                                <div className="flex gap-4 md:gap-6 animate-in slide-in-from-top-4 flex-wrap md:flex-nowrap">
                                    <UnitInput unit="米" placeholder="長" value={data?.q10_dimL || ''} onChange={v => update('q10_dimL', v)} disabled={parkingLogic.disableCarSize} />
                                    <UnitInput unit="米" placeholder="寬" value={data?.q10_dimW || ''} onChange={v => update('q10_dimW', v)} disabled={parkingLogic.disableCarSize} />
                                    <UnitInput unit="米" placeholder="高" value={data?.q10_dimH || ''} onChange={v => update('q10_dimH', v)} disabled={parkingLogic.disableCarSize} />
                                </div>
                            )}

                            {!isFactory && !parkingLogic.disableWeight && (
                                <div className="border-t-2 border-blue-200/50 pt-4 dark:border-blue-700/50">
                                    <p className="font-black text-[1.5rem] md:text-[1.75rem] text-slate-800 mt-4 text-left mb-4 dark:text-blue-100 leading-normal">機械載重 (公斤)</p>
                                    <UnitInput unit="kg" value={data?.q10_mechWeight || ''} onChange={v => update('q10_mechWeight', v)} placeholder={"查閱機械車位資訊告示牌"} />
                                </div>
                            )}
                            <div className="border-t-2 border-blue-200/50 pt-4 dark:border-blue-700/50">
                                <p className="font-black text-[1.5rem] md:text-[1.75rem] text-slate-800 mt-4 text-left mb-4 dark:text-blue-100 leading-normal">車道出入口高度 (公尺)</p>
                                <UnitInput unit="米" value={data?.q10_entryHeight || ''} onChange={v => update('q10_entryHeight', v)} disabled={parkingLogic.disableHeight} placeholder={parkingLogic.disableHeight ? "無須填寫" : "輸入高度"} />
                            </div>
                        </div>

                        <QuestionBlock className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors space-y-6 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600">
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">車道經過地號</p>
                            <LandNumberInputs section={data.q10_laneSection || ''} subSection={data.q10_laneSubSection || ''} number={data.q10_laneNumber || ''} onChangeSection={v => update('q10_laneSection', v)} onChangeSubSection={v => update('q10_laneSubSection', v)} onChangeNumber={v => update('q10_laneNumber', v)} />
                        </QuestionBlock>
                    </div>
                )}

                <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left hover:border-slate-300 transition-colors space-y-6 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600">
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">機車車位使用現況</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_motoUsage?.includes("固定位置使用") || false} label="固定位置使用" onClick={() => toggleArr('q10_motoUsage', "固定位置使用")} /></div>
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_motoUsage?.includes("無機車車位") || false} label="無機車車位" onClick={() => toggleArr('q10_motoUsage', "無機車車位")} /></div>
                        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 col-span-1 lg:col-span-2 text-left dark:bg-slate-800 dark:border-slate-700"><CheckBox checked={data?.q10_hasMotoUsageOther || false} label="其他未列項目" onClick={() => update('q10_hasMotoUsageOther', !data.q10_hasMotoUsageOther)} />{data?.q10_hasMotoUsageOther && (<SubItemHighlight><DetailInput value={data.q10_motoUsageOther || ''} onChange={v => update('q10_motoUsageOther', v)} placeholder="如：隨到隨停、一年一抽" /></SubItemHighlight>)}</div>
                    </div>
                </div>
                
                <div className={`space-y-10 ${parkingLogic.disableCharging ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-8 dark:text-slate-200 leading-normal">車位充電設備配置</p>
                        <RadioGroup options={['無', '有', '僅預留管線／孔位', '須經管委會同意']} value={data?.q10_charging === '否' ? '無' : (data?.q10_charging === '是' ? '有' : (data?.q10_charging || ''))} onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); if (val === '僅預留管線／孔位' || val === '須經管委會同意') { update('q10_charging', val); update('q10_chargingOther', ''); } else { setData(p => ({ ...p, q10_charging: val, q10_chargingOther: '' })); } }} cols={2} layout="grid" disabled={parkingLogic.disableCharging} />
                    </QuestionBlock>
                </div>
                
                {includeExtras && (
                    <>
                        <div className={`${parkingLogic.disableAbnormal ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <BooleanReveal 
                                label="車位使用現況" 
                                value={data?.q11_hasIssue === '否' ? '無異常' : (data?.q11_hasIssue === '是' ? '有異常' : '')}
                                onChange={(v) => { 
                                    // Fix: Allow deselection by preserving empty string
                                    const val = v === '無異常' ? '否' : (v === '有異常' ? '是' : ''); 
                                    if (val === '否' || val === '') setData(p => ({ ...p, q11_hasIssue: val, q11_items: [], q11_hasOther: false, q11_other: '' })); 
                                    else update('q11_hasIssue', val); 
                                }} 
                                disabled={parkingLogic.disableAbnormal}
                                options={['無異常', '有異常']}
                                trigger="有異常"
                            >
                                <div className="space-y-6 pt-2">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{Q11_OPTS.map(i => <CheckBox key={i} checked={data?.q11_items?.includes(i) || false} label={i} onClick={() => toggleArr('q11_items', i)} disabled={parkingLogic.disableAbnormal} />)}</div>
                                    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        <CheckBox checked={data?.q11_hasOther || false} label="其他未列項目" onClick={() => update('q11_hasOther', !data.q11_hasOther)} disabled={parkingLogic.disableAbnormal} />
                                        {data?.q11_hasOther && <DetailInput value={data.q11_other || ''} onChange={v => update('q11_other', v)} disabled={parkingLogic.disableAbnormal} placeholder="如：機械故障、高度受限" />}
                                    </div>
                                </div>
                            </BooleanReveal>
                        </div>

                        <div className={`${parkingLogic.disableSupplement ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-800 mb-6 text-left dark:text-slate-200 leading-normal">車位與車道其他備註</p>
                                        <div className="mb-6"><InlineWarning>※如車格位置有其他孔蓋、排風機、消防管道、租期租金、車道出入外通道狹窄等</InlineWarning></div>
                                    </>
                                }
                                value={data?.q12_hasNote === '否' ? '無' : (data?.q12_hasNote === '是' ? '有' : '')}
                                onChange={(v) => { 
                                    // Fix: Allow deselection by preserving empty string
                                    const val = v === '無' ? '否' : (v === '有' ? '是' : ''); 
                                    if (val === '否' || val === '') setData(p => ({ ...p, q12_hasNote: val, q12_note: '' })); 
                                    else update('q12_hasNote', val); 
                                }}
                                disabled={parkingLogic.disableSupplement}
                                options={['無', '有']}
                                trigger="有"
                            >
                                <DetailInput value={data.q12_note || ''} onChange={v => update('q12_note', v)} disabled={parkingLogic.disableSupplement} placeholder="說明現況" />
                            </BooleanReveal>
                        </div>
                    </>
                )}
            </div>
        </SurveySection>
    );
};

export const EnvironmentSection = ({ data, update, toggleArr, id, title, highlightedId, warningText, status = 'neutral' }: any) => {
    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title} status={status}>
            {warningText && <InlineWarning>{warningText}</InlineWarning>}
            
            <div className="mb-8">
                <CheckBox checked={data?.q16_noFacilities || false} label="無重要環境設施" onClick={() => { if (!data.q16_noFacilities) { update('q16_items', []); update('q16_hasOther', false); update('q16_other', ''); } update('q16_noFacilities', !data.q16_noFacilities); }} />
            </div>

            <div className={`space-y-12 transition-all duration-500 ${data?.q16_noFacilities ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                {ENV_CATEGORIES.map((cat: any) => (
                    <div key={cat.title}>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 dark:text-slate-200 leading-normal">{cat.title}</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{cat.items.map((i: string) => <CheckBox key={i} checked={data?.q16_items?.includes(i) || false} label={i} onClick={() => toggleArr('q16_items', i)} disabled={data?.q16_noFacilities} />)}</div>
                    </div>
                ))}
            </div>
        </SurveySection>
    );
};

export const NotesSection = ({ data, setData, update, id, title, highlightedId, type, warningText, status = 'neutral' }: any) => {
    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title} status={status}>
            {warningText && <InlineWarning>{warningText}</InlineWarning>}
            
            <BooleanReveal 
                label={type === 'factory' || type === 'land' ? "是否有須注意事項" : ""}
                value={data?.q17_issue === '否' ? '無' : (data?.q17_issue === '是' ? '有' : '')} 
                onChange={v => { 
                    // Fix: Use ternary to allow empty string (deselect)
                    const val = v === '無' ? '否' : (v === '有' ? '是' : ''); 
                    setData((p: any) => ({
                        ...p, 
                        [type === 'land' ? 'land_q8_special' : 'q17_issue']: val, 
                        [type === 'land' ? 'land_q8_special_desc' : 'q17_desc']: val === '是' ? (type === 'land' ? p.land_q8_special_desc : p.q17_desc) : '' 
                    })); 
                }} 
                options={['無', '有']} 
                trigger="有"
            >
                <DetailInput value={type === 'land' ? (data.land_q8_special_desc || '') : (data.q17_desc || '')} onChange={v => update(type === 'land' ? 'land_q8_special_desc' : 'q17_desc', v)} placeholder="說明現況" />
            </BooleanReveal>
        </SurveySection>
    );
};

export const LandQuestionsGroup = ({ data, setData, update, titles, ids, highlightedId, hideQ2, statusQ3 = 'neutral', statusQ4 = 'neutral' }: any) => {
    return (
        <>
            {!hideQ2 && (
                <SurveySection id={ids.q2} highlighted={highlightedId === ids.q2} title={titles.q2}>
                    {/* Implementation for Land Q2 if needed separately, currently mostly handled in Access Section or suppressed */}
                    <div />
                </SurveySection>
            )}

            <SurveySection id={ids.q3} highlighted={highlightedId === ids.q3} title={titles.q3} status={statusQ3}>
                <div className="space-y-8">
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal">土地鑑界與界標現況</p>
                        <RadioGroup 
                            options={['已鑑界 (標完好)', '待查證', '標位不明 (需重測)', '從未鑑界']} 
                            value={
                                data?.land_q3_survey === '否' ? '從未鑑界' : 
                                (data?.land_q3_survey === '是' ? '已鑑界 (標完好)' : 
                                (data?.land_q3_survey === '須重新鑑界' ? '標位不明 (需重測)' : 
                                (data?.land_q3_survey || '')))
                            } 
                            onChange={v => { 
                                const val = v === '從未鑑界' ? '否' : v; 
                                setData((prev: any) => ({...prev, land_q3_survey: val})); 
                            }} 
                            layout="grid" cols={2}
                        />
                        {(data?.land_q3_survey === '是' || data?.land_q3_survey === '已鑑界 (標完好)') && <SubItemHighlight><DetailInput value={data.land_q3_survey_detail || ''} onChange={v => update('land_q3_survey_detail', v)} placeholder="如：界標完整" /></SubItemHighlight>}
                        {data?.land_q3_survey === '待查證' && <SubItemHighlight><DetailInput value={data.land_q3_survey_other || ''} onChange={v => update('land_q3_survey_other', v)} placeholder="如：不確定界標位置" /></SubItemHighlight>}
                    </QuestionBlock>

                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal">產權與使用糾紛現況</p>
                        <RadioGroup 
                            options={['無', '有', '待查證']} 
                            value={data?.land_q3_dispute === '否' ? '無' : (data?.land_q3_dispute === '是' ? '有' : (data?.land_q3_dispute || ''))} 
                            onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData((prev: any) => ({...prev, land_q3_dispute: val})); }} 
                            layout="grid" cols={2}
                        />
                        {data?.land_q3_dispute === '是' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_desc || ''} onChange={v => update('land_q3_dispute_desc', v)} placeholder="說明現況" /></SubItemHighlight>}
                        {data?.land_q3_dispute === '待查證' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_other || ''} onChange={v => update('land_q3_dispute_other', v)} placeholder="說明現況" /></SubItemHighlight>}
                    </QuestionBlock>
                </div>
            </SurveySection>

            <SurveySection id={ids.q4} highlighted={highlightedId === ids.q4} title={titles.q4} status={statusQ4}>
                <div className="space-y-8">
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">徵收預定地現況</p>
                        <RadioGroup 
                            options={['非範圍內', '屬範圍內', '待查證']} 
                            value={data?.land_q4_expro === '否' ? '非範圍內' : (data?.land_q4_expro === '是' ? '屬範圍內' : (data?.land_q4_expro || ''))} 
                            onChange={v => { const val = v === '非範圍內' ? '否' : (v === '屬範圍內' ? '是' : v); setData((prev: any) => ({...prev, land_q4_expro: val})); }} 
                            layout="grid" cols={2}
                        />
                        {(data?.land_q4_expro === '是' || data?.land_q4_expro === '待查證') && <SubItemHighlight><DetailInput value={data.land_q4_expro_other || ''} onChange={v => update('land_q4_expro_other', v)} placeholder="說明現況" /></SubItemHighlight>}
                    </QuestionBlock>

                    <QuestionBlock>
                         <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal">重劃與區段徵收現況</p>
                        <RadioGroup 
                            options={['非範圍內', '屬範圍內', '待查證']} 
                            value={data?.land_q4_resurvey === '否' ? '非範圍內' : (data?.land_q4_resurvey === '是' ? '屬範圍內' : (data?.land_q4_resurvey || ''))} 
                            onChange={v => { const val = v === '非範圍內' ? '否' : (v === '屬範圍內' ? '是' : v); setData((prev: any) => ({...prev, land_q4_resurvey: val})); }} 
                            layout="grid" cols={2}
                        />
                        {(data?.land_q4_resurvey === '是' || data?.land_q4_resurvey === '待查證') && <SubItemHighlight><DetailInput value={data.land_q4_resurvey_other || ''} onChange={v => update('land_q4_resurvey_other', v)} placeholder="說明現況" /></SubItemHighlight>}
                    </QuestionBlock>
                </div>
            </SurveySection>
        </>
    );
};

export const BuildingLandAccessSection = ({ data, setData, update, prefix, title, id, highlightedId, type, status = 'neutral' }: any) => {
    const isHouse = type === 'house';
    const accessKey = isHouse ? 'q14_access' : 'land_q2_access';
    const abnormalDescKey = isHouse ? 'q14_abnormalDesc' : 'land_q2_access_desc';
    const ownerKey = isHouse ? 'q14_ownership' : 'land_q2_owner';
    const protectionKey = isHouse ? 'q14_protection' : 'land_q2_protection';
    const materialKey = isHouse ? 'q14_roadMaterial' : 'land_q2_material';
    const materialOtherKey = isHouse ? 'q14_roadMaterialOther' : 'land_q2_material_other';
    const roadWidthKey = isHouse ? 'q14_roadWidth' : 'land_q2_roadWidth';
    const buildingLineKey = isHouse ? 'q14_buildingLine' : 'land_q2_buildingLine';
    const ditchKey = isHouse ? 'q14_ditch' : 'land_q2_ditch';
    const ditchOtherKey = isHouse ? 'q14_ditchOther' : 'land_q2_ditch_other';
    
    // Land Address Keys
    const sectionKey = isHouse ? 'q14_section' : 'land_q2_access_section';
    const subSectionKey = isHouse ? 'q14_subSection' : 'land_q2_access_subSection';
    const numberKey = isHouse ? 'q14_number' : 'land_q2_access_number';

    // Hiding Logic
    const hideBuildingLine = type === 'factory' ? ['立體化廠辦大樓', '園區標準廠房（集合式／分租型）'].includes(data.propertyType) : (type === 'house' ? ['大樓華廈', '公寓'].includes(data.propertyType) : false);
    const hideDitch = type === 'factory' ? ['立體化廠辦大樓'].includes(data.propertyType) : (type === 'house' ? ['大樓華廈', '公寓'].includes(data.propertyType) : false);

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title} status={status}>
            <div className="space-y-10">
                <QuestionBlock>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">{isHouse ? '進出現況' : '進出通行現況'}</p>
                    <RadioGroup 
                        options={ACCESS_STATUS_OPTIONS} 
                        value={data[accessKey]?.includes('順暢') ? '通行順暢' : (data[accessKey]?.includes('受限') ? '通行受限（如狹窄、有障礙物）' : (data[accessKey]?.includes('袋地') ? '袋地（無合法出入口）' : ''))} 
                        onChange={v => {
                            const val = v.includes('順暢') ? '通行順暢' : (v.includes('受限') ? '通行受限' : (v.includes('袋地') ? '袋地' : v));
                            setData((prev: any) => ({...prev, [accessKey]: val}));
                        }} 
                        cols={1} layout="grid" 
                    />
                    
                    {data[accessKey]?.includes('順暢') && (
                        <SubItemHighlight>
                            <div className="space-y-8">
                                <div>
                                    <p className="font-bold text-xl text-slate-700 mb-4 dark:text-slate-200">通行權屬與保障</p>
                                    <RadioGroup 
                                        options={['公有', '私人']} 
                                        value={data[ownerKey] || ''} 
                                        onChange={v => {
                                            setData((prev: any) => ({...prev, [ownerKey]: v, [protectionKey]: ''}));
                                        }} 
                                        layout="grid" cols={2}
                                    />
                                    {data[ownerKey] === '公有' && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <RadioGroup 
                                                options={PROTECTION_OPTS_PUBLIC} 
                                                value={data[protectionKey] || ''} 
                                                onChange={v => update(protectionKey, v)} 
                                                layout="grid" cols={2}
                                            />
                                        </div>
                                    )}
                                    {data[ownerKey] === '私人' && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 space-y-4">
                                            <RadioGroup 
                                                options={PROTECTION_OPTS_PRIVATE} 
                                                value={data[protectionKey] || ''} 
                                                onChange={v => update(protectionKey, v)} 
                                                layout="grid" cols={2}
                                            />
                                            {/* For Land Q2, if private, ask for owner description if needed, or re-use existing field? 
                                                The types say `land_q2_owner_desc`.
                                            */}
                                            {!isHouse && <DetailInput value={data.land_q2_owner_desc || ''} onChange={v => update('land_q2_owner_desc', v)} placeholder="說明歸屬人" />}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-6 border-t-2 border-slate-200">
                                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">臨路地號</p>
                                    <LandNumberInputs section={data[sectionKey] || ''} subSection={data[subSectionKey] || ''} number={data[numberKey] || ''} onChangeSection={v => update(sectionKey, v)} onChangeSubSection={v => update(subSectionKey, v)} onChangeNumber={v => update(numberKey, v)} />
                                </div>

                                <div className="pt-6 border-t-2 border-slate-200">
                                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">路面材質</p>
                                    <RadioGroup options={['柏油', '水泥', '泥土/石子', '其他未列項目']} value={data[materialKey] || ''} onChange={v => update(materialKey, v)} layout="grid" cols={2} />
                                    {data[materialKey] === '其他未列項目' && <div className="mt-4"><DetailInput value={data[materialOtherKey] || ''} onChange={v => update(materialOtherKey, v)} placeholder="說明現況" /></div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                                         <p className="font-bold text-lg mb-2 text-slate-600">現況路寬</p>
                                         <UnitInput unit="米" value={data[roadWidthKey] || ''} onChange={v => update(roadWidthKey, v)} placeholder="輸入寬度" />
                                    </div>
                                    {!hideBuildingLine && (
                                        <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                                             <p className="font-bold text-lg mb-2 text-slate-600">建築線指定狀況</p>
                                             <RadioGroup options={BUILDING_LINE_OPTIONS} value={data[buildingLineKey] || ''} onChange={v => update(buildingLineKey, v)} />
                                        </div>
                                    )}
                                </div>

                                {!hideDitch && (
                                    <div className="pt-6 border-t-2 border-slate-200">
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">臨路排水溝現況</p>
                                        <RadioGroup options={DRAINAGE_OPTIONS} value={data[ditchKey] || ''} onChange={v => update(ditchKey, v)} layout="grid" cols={1} />
                                        {data[ditchKey] === '其他未列項目' && <div className="mt-4"><DetailInput value={data[ditchOtherKey] || ''} onChange={v => update(ditchOtherKey, v)} placeholder="說明現況" /></div>}
                                    </div>
                                )}
                            </div>
                        </SubItemHighlight>
                    )}

                    {data[accessKey]?.includes('受限') && (
                        <SubItemHighlight>
                            <DetailInput value={data[abnormalDescKey] || ''} onChange={v => update(abnormalDescKey, v)} placeholder="如：遭他人阻擋、路寬不足" />
                        </SubItemHighlight>
                    )}
                </QuestionBlock>
            </div>
        </SurveySection>
    );
};
