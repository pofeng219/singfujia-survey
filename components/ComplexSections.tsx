
import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    PARK_TYPES, CAR_USAGE_OPTS, Q11_OPTS, ENV_CATEGORIES,
    PROTECTION_OPTS_PUBLIC, PROTECTION_OPTS_PRIVATE,
    GROUP_A_TYPES, WATER_BOOSTER_ITEMS_A,
    RESISTANCE_FACILITIES_OPTIONS,
    BUILDING_LINE_OPTIONS, DRAINAGE_OPTIONS
} from '../constants';
import { 
    CheckBox, SurveySection, SubItemHighlight, DetailInput, 
    InlineWarning, AccordionRadio, UnitInput, QuestionBlock, BooleanReveal, LandNumberInputs,
    SectionStatus, ImageModal
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
                    <p className="dynamic-text-h2 font-black mb-2 text-slate-800 dark:text-slate-100 leading-normal">
                        {type === 'factory' ? '供電類型' : '電力供應現況'}
                    </p>
                    {type === 'factory' ? (
                         <div className="mb-6"><InlineWarning>※請務必拍照電費單或電盤再行確認</InlineWarning></div>
                    ) : type === 'land' ? null : (
                         <p className="text-xl font-bold text-rose-600 mb-6 dark:text-rose-400">(請務必索取並詳見台電電費單)</p>
                    )}

                    {type === 'factory' ? (
                        <div className="space-y-6">
                            <AccordionRadio 
                                options={['無電力(需自行申請)', '一般用電(單相 110V／220V，僅供照明冷氣)', '動力用電(三相電)', '現場無法判斷 (需詳閱電費單)', '其他未列項目']} 
                                value={data?.land_q1_elec || ''} 
                                onChange={v => {
                                    setData(prev => {
                                        const isPower = v.includes('一般用電') || v.includes('動力用電');
                                        const needsVoltage = v.includes('動力用電');
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
                                renderDetail={(opt) => {
                                    if (opt === '其他未列項目') {
                                        return <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：發電機、太陽能" /></SubItemHighlight>;
                                    }
                                    if (opt.includes('一般用電') || opt.includes('動力用電')) {
                                        return (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <SubItemHighlight>
                                                    <div className="space-y-8">
                                                        <div>
                                                            <p className="dynamic-text-h2 font-black text-slate-700 mb-3 dark:text-slate-200 leading-normal">電錶型態？</p>
                                                            <AccordionRadio 
                                                                options={['獨立電錶', '共用電錶']} 
                                                                value={data.land_q1_elec_meter || ''} 
                                                                onChange={v => update('land_q1_elec_meter', v)} 
                                                            />
                                                        </div>
                                                        
                                                        {(opt.includes('動力用電')) && (
                                                            <div>
                                                                <p className="dynamic-text-h2 font-black text-slate-700 mb-3 dark:text-slate-200 leading-normal">電壓規格</p>
                                                                <AccordionRadio 
                                                                    options={['三相 220V', '三相 380V', '三相四線式', '其他／待查證']} 
                                                                    value={data.land_q1_elec_voltage || ''} 
                                                                    onChange={v => update('land_q1_elec_voltage', v)} 
                                                                />
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="dynamic-text-h2 font-black text-slate-700 mb-2 dark:text-slate-200 leading-normal">契約容量 (馬力數)</p>
                                                            <p className="text-slate-600 text-xl font-bold mb-4 dark:text-slate-300">提示：若看到變壓器通常為高壓電；若電錶有倍數標示通常為大馬力</p>
                                                            <AccordionRadio 
                                                                options={['一般用電(無契約容量)', '99馬力(HP)以下(無須設置配電室)', '100馬力(HP)以上(可能需設置高壓變電站)', '現場無法判斷 (需詳閱電費單)', '其他未列項目']} 
                                                                value={data.land_q1_elec_capacity || ''} 
                                                                onChange={v => update('land_q1_elec_capacity', v)} 
                                                            />
                                                        </div>
                                                    </div>
                                                </SubItemHighlight>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
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
                                    {opt === '有' && (
                                        <SubItemHighlight>
                                            <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-600">
                                                <AccordionRadio 
                                                    options={data.propertyType === '農地' ? ['民生用電', '農業用電', '其他未列項目'] : ['獨立電錶', '共有電錶']} 
                                                    value={data.land_q1_elec_detail || ''} 
                                                    onChange={v => { update('land_q1_elec_detail', v); if (v !== '其他未列項目') update('land_q1_elec_detail_other', ''); }} 
                                                    renderDetail={
                                                        data.propertyType === '農地' ? (opt2) => (
                                                            opt2 === '其他未列項目' ? <DetailInput value={data.land_q1_elec_detail_other || ''} onChange={v => update('land_q1_elec_detail_other', v)} placeholder="說明現況" /> : null
                                                        ) : undefined
                                                    }
                                                />
                                            </div>
                                        </SubItemHighlight>
                                    )}
                                    {opt === '其他未列項目' && <SubItemHighlight><DetailInput value={data.land_q1_elec_other || ''} onChange={v => update('land_q1_elec_other', v)} placeholder="如：發電機、太陽能" /></SubItemHighlight>}
                                </>
                            )} 
                            
                        />
                    )}
                </QuestionBlock>
                
                <QuestionBlock>
                    <p className="dynamic-text-h2 font-black mb-6 text-slate-800 dark:text-slate-100 leading-normal">水源供應現況</p>
                    <AccordionRadio 
                        options={['無', '有', '其他未列項目']} 
                        value={data?.land_q1_water === '否' ? '無' : (data?.land_q1_water === '是' ? '有' : (data?.land_q1_water || ''))} 
                        onChange={v => {
                            const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                            setData(prev => ({
                                ...prev,
                                land_q1_water: val,
                                land_q1_water_cat: val === '是' ? prev.land_q1_water_cat : [],
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredWaterOptions.map(opt2 => (
                                                    <CheckBox 
                                                        key={opt2} 
                                                        checked={data.land_q1_water_cat?.includes(opt2) || false} 
                                                        label={opt2} 
                                                        onClick={() => {
                                                            const arr = Array.isArray(data.land_q1_water_cat) ? data.land_q1_water_cat : [];
                                                            if (arr.includes(opt2)) {
                                                                setData(prev => ({ 
                                                                    ...prev, 
                                                                    land_q1_water_cat: arr.filter(i => i !== opt2),
                                                                    land_q1_water_tap_detail: opt2 === '自來水' ? '' : prev.land_q1_water_tap_detail,
                                                                    land_q1_water_ground_detail: opt2 === '地下水' ? '' : prev.land_q1_water_ground_detail,
                                                                    land_q1_water_irr_detail: opt2 === '水利溝渠' ? '' : prev.land_q1_water_irr_detail
                                                                }));
                                                            } else {
                                                                setData(prev => ({ ...prev, land_q1_water_cat: [...arr, opt2] }));
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            {data.land_q1_water_cat?.includes('自來水') && (
                                                <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 space-y-4">
                                                    <p className="font-bold">自來水：</p>
                                                    <AccordionRadio 
                                                        options={['獨立水錶', '共有水錶', '其他未列項目']} 
                                                        value={data.land_q1_water_tap_detail || ''} 
                                                        onChange={v => { update('land_q1_water_tap_detail', v); if (v !== '其他未列項目') update('land_q1_water_tap_other', ''); }} 
                                                        renderDetail={o => o === '其他未列項目' ? <DetailInput value={data.land_q1_water_tap_other || ''} onChange={v => update('land_q1_water_tap_other', v)} placeholder="說明現況" /> : null}
                                                    />
                                                </div>
                                            )}
                                            {data.land_q1_water_cat?.includes('地下水') && (
                                                <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 space-y-4">
                                                    <p className="font-bold">地下水：</p>
                                                    <AccordionRadio options={['自然湧出流動', '合法水井', '私設水井']} value={data.land_q1_water_ground_detail || ''} onChange={v => update('land_q1_water_ground_detail', v)} />
                                                </div>
                                            )}
                                            {data.land_q1_water_cat?.includes('水利溝渠') && (
                                                <div className="p-4 md:p-6 bg-white rounded-[1.5rem] border-3 border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 space-y-4">
                                                    <p className="font-bold">水利溝渠：</p>
                                                    <AccordionRadio options={['公有', '私人']} value={data.land_q1_water_irr_detail || ''} onChange={v => update('land_q1_water_irr_detail', v)} />
                                                </div>
                                            )}
                                        </div>
                                    </SubItemHighlight>
                                )}
                                {opt === '其他未列項目' && <SubItemHighlight><DetailInput value={data.land_q1_water_other || ''} onChange={v => update('land_q1_water_other', v)} placeholder="說明現況" /></SubItemHighlight>}
                            </>
                        )} 
                        
                    />
                </QuestionBlock>
                
                {type !== 'land' && (
                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black mb-6 text-slate-800 dark:text-slate-100 leading-normal">瓦斯供應現況</p>
                        <AccordionRadio 
                            options={type === 'factory' ? ['一般瓦斯 (如桶裝瓦斯、天然瓦斯)', '工業用氣 (如大容量儲氣槽)', '完全無設置'] : ['無', '有', '其他未列項目']} 
                            value={data.land_q1_gas || ''} 
                            onChange={v => update('land_q1_gas', v)} 
                        />
                    </QuestionBlock>
                )}

                {/* Solar Equipment for Factory - Hide for Group B (multistory buildings) as they move to section 10 */}
                {type === 'factory' && GROUP_A_TYPES.includes(data.propertyType) && (
                     <QuestionBlock>
                        <p className="dynamic-text-h2 font-black mb-4 text-slate-800 dark:text-slate-100 leading-normal">太陽能光電發電設備</p>
                        <div className="mb-6"><InlineWarning>※本項由使用者自行管理維護</InlineWarning></div>
                        <AccordionRadio 
                            options={['無設置', '合法設置', '私人設置']} 
                            value={data.house_solar_status || ''} 
                            onChange={v => update('house_solar_status', v)} 
                            
                        />
                     </QuestionBlock>
                )}

                {showWaterBooster && (
                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black mb-4 text-slate-800 dark:text-slate-100 leading-normal">加壓受水設備</p>
                        <div className="mb-6">
                            <InlineWarning>※本項由使用者自行管理維護，若物件型態為道路用地／公設地，確認是否為自來水公司之公共設施，或鄰地非法佔用</InlineWarning>
                        </div>
                        
                        <AccordionRadio 
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
                            renderDetail={(opt) => opt === '有設置' ? (
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
                            ) : null}
                        />
                    </QuestionBlock>
                )}
                
                <QuestionBlock>
                    <p className="dynamic-text-h2 font-black mb-6 text-slate-800 dark:text-slate-100 leading-normal">其他設施現況</p>
                    <AccordionRadio 
                        options={['無', '有']} 
                        value={data?.land_q1_other_new === '否' ? '無' : (data?.land_q1_other_new === '是' ? '有' : '')} 
                        onChange={v => { 
                            // Fix: Use ternary to allow empty string (deselect)
                            const val = v === '無' ? '否' : (v === '有' ? '是' : ''); 
                            setData(prev => ({ ...prev, land_q1_other_new: val, land_q1_other_desc: val === '是' ? prev.land_q1_other_desc : '' })); 
                        }} 
                        renderDetail={(opt) => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q1_other_desc || ''} onChange={v => update('land_q1_other_desc', v)} placeholder={getOtherFacilityPlaceholder()} /></SubItemHighlight> : null)} 
                        
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
    const [showParkingGuide, setShowParkingGuide] = useState(false);
    const [showParkingUsageGuide, setShowParkingUsageGuide] = useState(false);
    const [showEntryHeightGuide, setShowEntryHeightGuide] = useState(false);
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
                <p className="dynamic-text-h1 font-black text-slate-800 text-left dark:text-slate-100 leading-normal">{isHouseOrFactory ? `${startNum}. 車位資訊` : `${startNum}. 車位資訊`}</p>
            </div>
            {startNum !== 1 && <div className="mb-8"><CheckBox checked={data?.q10_noParking || false} label="無車位" onClick={() => update('q10_noParking', !data.q10_noParking)} /></div>}
            
            <div className="space-y-12">
                <QuestionBlock className={parkingLogic.disableMethod ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}>
                    <p className="dynamic-text-h2 font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-normal">停車方式 (單選)：</p>
                    <AccordionRadio 
                        options={PARK_TYPES} 
                        value={data?.q10_parkTypes?.[0] || ''} 
                        onChange={(v) => {
                            setData(prev => {
                                const isSelected = prev.q10_parkTypes?.[0] === v;
                                return {
                                    ...prev,
                                    q10_parkTypes: isSelected ? [] : [v],
                                    q10_rampMechLoc: (isSelected || v !== '坡道機械') ? '' : prev.q10_rampMechLoc,
                                    q10_liftMechLoc: (isSelected || v !== '升降機械') ? '' : prev.q10_liftMechLoc
                                };
                            });
                        }}
                        renderDetail={(opt) => {
                            if (opt === '坡道機械' || opt === '升降機械') {
                                return (
                                    <div className="p-2 md:p-4 pt-0">
                                        <p className="text-lg md:text-xl font-bold text-slate-600 mb-3 text-center dark:text-slate-300">請選擇所在層置：</p>
                                        <AccordionRadio 
                                            options={['上層', '中層', '下層']} 
                                            value={opt === '坡道機械' ? data.q10_rampMechLoc || '' : data.q10_liftMechLoc || ''} 
                                            onChange={(v) => {
                                                const targetKey = opt === '坡道機械' ? 'q10_rampMechLoc' : 'q10_liftMechLoc';
                                                update(targetKey, v);
                                            }} 
                                        />
                                    </div>
                                );
                            }
                            return null;
                        }}
                        
                        disabled={parkingLogic.disableMethod}
                    />
                    <div className={`space-y-3 col-span-1 lg:col-span-2 mt-6`}><CheckBox checked={data?.q10_hasParkTypeOther || false} label="其他未列項目" onClick={() => update('q10_hasParkTypeOther', !data.q10_hasParkTypeOther)} disabled={parkingLogic.disableMethod} />{data?.q10_hasParkTypeOther && (<SubItemHighlight disabled={parkingLogic.disableMethod}><DetailInput value={data.q10_parkTypeOther || ''} onChange={v => update('q10_parkTypeOther', v)} placeholder="騎樓停車" /></SubItemHighlight>)}</div>
                </QuestionBlock>
                
                {hasCarMethod && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-12">
                        <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableNumber ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}`}>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-normal">車位編號：</p>
                            <AccordionRadio 
                                options={['無車位編號', '有車位編號']} 
                                value={data?.q10_parkingNumberType === 'number' ? '有車位編號' : (data?.q10_parkingNumberType === 'none' ? '無車位編號' : '')} 
                                onChange={(v) => { 
                                    if (v === '有車位編號') update('q10_parkingNumberType', 'number'); 
                                    else if (v === '無車位編號') { update('q10_parkingNumberType', 'none'); update('q10_parkingNumberVal', ''); }
                                    else { update('q10_parkingNumberType', ''); update('q10_parkingNumberVal', ''); } // Deselect logic
                                }} 
                                disabled={parkingLogic.disableNumber} 
                                renderDetail={(opt) => {
                                    if (opt === '有車位編號') return <SubItemHighlight disabled={parkingLogic.disableNumber}><DetailInput value={data.q10_parkingNumberVal || ''} onChange={v => update('q10_parkingNumberVal', v)} placeholder="如：B1-123" /></SubItemHighlight>;
                                    return null;
                                }}
                            />
                        </QuestionBlock>

                        <QuestionBlock className={`transition-all duration-500 ${parkingLogic.disableCarStatus ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}`}>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6 text-left dark:text-slate-200 leading-normal">汽車車位使用現況：</p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                                {CAR_USAGE_OPTS.map(u => <CheckBox key={u} checked={data?.q10_carUsage?.includes(u) || false} label={u} onClick={() => handleCarUsageToggle(u)} disabled={parkingLogic.disableCarStatus} />)}
                                <div className="col-span-1 lg:col-span-2 space-y-3">
                                    <CheckBox checked={data?.q10_carUsage?.includes("須固定抽籤") || false} label="須固定抽籤" onClick={() => handleCarUsageToggle("須固定抽籤")} disabled={parkingLogic.disableCarStatus} />
                                    {data?.q10_carUsage?.includes("須固定抽籤") && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><div className="ml-0 md:ml-4 flex items-center justify-center gap-4 mt-2 font-black text-xl md:text-2xl text-slate-700 dark:text-slate-200">每幾 <input type="number" inputMode="numeric" disabled={parkingLogic.disableCarStatus} className="w-20 md:w-28 border-3 rounded-2xl p-2 md:p-4 text-center bg-white shadow-inner dark:bg-slate-900 dark:border-slate-600" value={data.q10_carLotteryMonth || ''} onChange={e => update('q10_carLotteryMonth', e.target.value)} /> 個月抽籤一次</div></SubItemHighlight>)}
                                </div>
                                <div className="col-span-1 lg:col-span-2 text-center space-y-3">
                                    <CheckBox checked={data?.q10_hasCarUsageOther || false} label="其他未列項目" onClick={() => update('q10_hasCarUsageOther', !data.q10_hasCarUsageOther)} disabled={parkingLogic.disableCarStatus} />
                                    {data?.q10_hasCarUsageOther && (<SubItemHighlight disabled={parkingLogic.disableCarStatus}><DetailInput value={data.q10_carUsageOther || ''} onChange={v => update('q10_carUsageOther', v)} placeholder="說明現況" /></SubItemHighlight>)}
                                </div>
                            </div>
                        </QuestionBlock>

                        <div className={`bg-blue-50 p-6 md:p-10 rounded-[2.5rem] space-y-8 border-4 border-blue-100 transition-all duration-500 shadow-sm dark:bg-blue-900/20 dark:border-blue-800 ${parkingLogic.disableCarSize ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}`}>
                            <p className="font-black dynamic-text-h2 text-slate-800 text-left dark:text-blue-100 leading-normal">汽車車位尺寸 (公尺)</p>
                            
                            <div className="mb-4">
                                <AccordionRadio 
                                    options={['實際測量', '依車位資訊告示牌', '無法測量也無相關資訊']} 
                                    value={data?.q10_measureType || ''} 
                                    onChange={v => update('q10_measureType', v)} 
                                    disabled={parkingLogic.disableCarSize} 
                                    spanFullOption="無法測量也無相關資訊"
                                    renderDetail={(opt) => {
                                        if (opt === '實際測量' || opt === '依車位資訊告示牌') {
                                            return (
                                                <SubItemHighlight>
                                                    <div className="flex gap-4 md:gap-6 flex-wrap md:flex-nowrap">
                                                        <UnitInput unit="米" placeholder="長" value={data?.q10_dimL || ''} onChange={v => update('q10_dimL', v)} disabled={parkingLogic.disableCarSize} />
                                                        <UnitInput unit="米" placeholder="寬" value={data?.q10_dimW || ''} onChange={v => update('q10_dimW', v)} disabled={parkingLogic.disableCarSize} />
                                                        <UnitInput unit="米" placeholder="高" value={data?.q10_dimH || ''} onChange={v => update('q10_dimH', v)} disabled={parkingLogic.disableCarSize} />
                                                    </div>
                                                </SubItemHighlight>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </div>

                            {!isFactory && !parkingLogic.disableWeight && (
                                <div className="border-t-2 border-blue-200/50 pt-4 dark:border-blue-700/50">
                                    <p className="font-black dynamic-text-h2 text-slate-800 mt-4 text-left mb-4 dark:text-blue-100 leading-normal">機械載重 (公斤)</p>
                                    <UnitInput unit="kg" value={data?.q10_mechWeight || ''} onChange={v => update('q10_mechWeight', v)} placeholder={"若無標示填『無』"} />
                                </div>
                            )}
                            <div className="border-t-2 border-blue-200/50 pt-4 dark:border-blue-700/50">
                                <p className="font-black dynamic-text-h2 text-slate-800 mt-4 text-left mb-4 dark:text-blue-100 leading-normal">車道出入口高度</p>
                                <div className="mb-4 flex flex-col items-start gap-2">
                                    <InlineWarning>※如目視可供大型／七人座休旅車（高度約1.75米～1.9米）通行</InlineWarning>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowEntryHeightGuide(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                        type="button"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                        參考圖例
                                    </button>
                                </div>
                                <AccordionRadio  
                                    options={['有資訊告示牌', '無資訊告示牌']} 
                                    value={data?.q10_entryHeight || ''} 
                                    onChange={v => update('q10_entryHeight', v)} 
                                    renderDetail={(opt) => 
                                        opt === '無資訊告示牌' ? (
                                            <DetailInput 
                                                value={data?.q10_entryHeight_desc || ''} 
                                                onChange={v => update('q10_entryHeight_desc', v)} 
                                                placeholder="說明現況" 
                                            />
                                        ) : null
                                    }
                                />
                            </div>
                        </div>

                        <QuestionBlock className="space-y-4 md:space-y-6">
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">車道經過地號</p>
                            <LandNumberInputs section={data.q10_laneSection || ''} subSection={data.q10_laneSubSection || ''} number={data.q10_laneNumber || ''} onChangeSection={v => update('q10_laneSection', v)} onChangeSubSection={v => update('q10_laneSubSection', v)} onChangeNumber={v => update('q10_laneNumber', v)} />
                        </QuestionBlock>
                    </div>
                )}

                <QuestionBlock className="space-y-4 md:space-y-6">
                    <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">機車車位使用現況</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                        <CheckBox checked={data?.q10_motoUsage?.includes("固定位置使用") || false} label="固定位置使用" onClick={() => {
                            setData(p => {
                                let arr = Array.isArray(p.q10_motoUsage) ? [...p.q10_motoUsage] : [];
                                if (arr.includes("固定位置使用")) arr = arr.filter(i => i !== "固定位置使用");
                                else {
                                    arr.push("固定位置使用");
                                    arr = arr.filter(i => i !== "無機車車位");
                                }
                                return { ...p, q10_motoUsage: arr };
                            });
                        }} />
                        <CheckBox checked={data?.q10_motoUsage?.includes("無機車車位") || false} label="無機車車位" onClick={() => {
                            setData(p => {
                                let arr = Array.isArray(p.q10_motoUsage) ? [...p.q10_motoUsage] : [];
                                if (arr.includes("無機車車位")) arr = arr.filter(i => i !== "無機車車位");
                                else {
                                    arr.push("無機車車位");
                                    arr = arr.filter(i => i !== "固定位置使用");
                                }
                                return { ...p, q10_motoUsage: arr };
                            });
                        }} />
                        <div className="col-span-1 lg:col-span-2 text-left space-y-3">
                            <CheckBox checked={data?.q10_hasMotoUsageOther || false} label="其他未列項目" onClick={() => update('q10_hasMotoUsageOther', !data.q10_hasMotoUsageOther)} />
                            {data?.q10_hasMotoUsageOther && (<SubItemHighlight><DetailInput value={data.q10_motoUsageOther || ''} onChange={v => update('q10_motoUsageOther', v)} placeholder="如：隨到隨停、一年一抽" /></SubItemHighlight>)}
                        </div>
                    </div>
                </QuestionBlock>
                
                <div className={`space-y-10 ${parkingLogic.disableCharging ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400' : ''}`}>
                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black text-slate-700 mb-8 dark:text-slate-200 leading-normal">車位充電設備配置</p>
                        <AccordionRadio options={['無', '有', '僅預留管線／孔位', '須經管委會同意']} value={data?.q10_charging === '否' ? '無' : (data?.q10_charging === '是' ? '有' : (data?.q10_charging || ''))} onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); if (val === '僅預留管線／孔位' || val === '須經管委會同意') { update('q10_charging', val); update('q10_chargingOther', ''); } else { setData(p => ({ ...p, q10_charging: val, q10_chargingOther: '' })); } }}   disabled={parkingLogic.disableCharging} />
                    </QuestionBlock>
                </div>
                
                {includeExtras && (
                    <>
                        <div className={`${parkingLogic.disableAbnormal ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400 p-4 rounded-2xl' : ''}`}>
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="dynamic-text-h2 font-black text-slate-800 mb-4 text-left dark:text-slate-200 leading-normal">車位使用現況</p>
                                        <div className="mb-4 flex flex-col gap-3">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowParkingUsageGuide(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                            >
                                                <ImageIcon size={20} />
                                                真實案例
                                            </button>
                                        </div>
                                    </>
                                }
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
                                    <div className="space-y-3">
                                        <CheckBox checked={data?.q11_hasOther || false} label="其他未列項目" onClick={() => update('q11_hasOther', !data.q11_hasOther)} disabled={parkingLogic.disableAbnormal} />
                                        {data?.q11_hasOther && <SubItemHighlight disabled={parkingLogic.disableAbnormal}><DetailInput value={data.q11_other || ''} onChange={v => update('q11_other', v)} disabled={parkingLogic.disableAbnormal} placeholder="如：機械故障、高度受限" /></SubItemHighlight>}
                                    </div>
                                </div>
                            </BooleanReveal>
                        </div>

                        <div className={`${parkingLogic.disableSupplement ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400 p-4 rounded-2xl' : ''}`}>
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="dynamic-text-h2 font-black text-slate-800 mb-4 text-left dark:text-slate-200 leading-normal">車位與車道其他備註</p>
                                        <div className="mb-4 flex flex-col gap-3">
                                            <InlineWarning>※如車格位置有其他孔蓋、排風機、消防管道、租期租金、車道出入外通道狹窄等</InlineWarning>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowParkingGuide(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                            >
                                                <ImageIcon size={20} />
                                                真實案例
                                            </button>
                                        </div>
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

            <ImageModal 
                isOpen={showParkingGuide} 
                onClose={() => setShowParkingGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1uGe_fPzNK1QTat5PSR6SmkHEtMIF39lo" 
                title="車位與車道其他備註真實案例" 
            />
            <ImageModal 
                isOpen={showParkingUsageGuide} 
                onClose={() => setShowParkingUsageGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/12nlowzk-k3qp8KtfVbh7lDsjIQhhNPjV" 
                title="車位使用現況真實案例" 
            />
            <ImageModal 
                isOpen={showEntryHeightGuide} 
                onClose={() => setShowEntryHeightGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1dhQVMQeDo1kIEq5z_mGKrwlWsC-WHEbm" 
                title="車道出入口高度參考圖例" 
            />
        </SurveySection>
    );
};

export const EnvironmentSection = ({ data, update, toggleArr, id, title, highlightedId, warningText, status = 'neutral' }: any) => {
    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title} status={status}>
            {warningText && <InlineWarning>{warningText}</InlineWarning>}
            
            <div className={`space-y-12 transition-all duration-500 ${data?.q16_noFacilities ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400 p-4 rounded-2xl' : ''}`}>
                {ENV_CATEGORIES.map((cat: any) => (
                    <div key={cat.title}>
                        <p className="dynamic-text-h2 font-black text-slate-700 mb-6 dark:text-slate-200 leading-normal">{cat.title}</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{cat.items.map((i: string) => <CheckBox key={i} checked={data?.q16_items?.includes(i) || false} label={i} onClick={() => toggleArr('q16_items', i)} disabled={data?.q16_noFacilities} />)}</div>
                    </div>
                ))}
                
                <div className="space-y-3">
                    <CheckBox 
                        checked={data?.q16_hasOther || false} 
                        label="其他未列項目" 
                        onClick={() => update('q16_hasOther', !data.q16_hasOther)} 
                        disabled={data?.q16_noFacilities} 
                    />
                    {data?.q16_hasOther && (
                        <SubItemHighlight disabled={data?.q16_noFacilities}>
                            <DetailInput 
                                value={data.q16_other || ''} 
                                onChange={v => update('q16_other', v)} 
                                placeholder="說明現況" 
                                disabled={data?.q16_noFacilities}
                            />
                        </SubItemHighlight>
                    )}
                </div>
            </div>

            <div className="mt-8 mb-8 flex flex-col items-center w-full">
                <div className="w-full text-center mb-4">
                    <span className="inline-block px-4 py-2 bg-yellow-300 text-xl md:text-2xl text-slate-900 font-bold leading-normal dark:bg-yellow-800 dark:text-slate-100 rounded text-center">
                        物件已確認周邊半徑300公尺內
                        <br/>
                        無重要環境設施
                        <br/>
                        可點選以下按鈕完成此題<span className="text-red-600 ml-1">⬇</span>
                    </span>
                </div>
                <div className="w-full">
                    <CheckBox checked={data?.q16_noFacilities || false} label="無重要環境設施" onClick={() => { if (!data.q16_noFacilities) { update('q16_items', []); update('q16_hasOther', false); update('q16_other', ''); } update('q16_noFacilities', !data.q16_noFacilities); }} />
                </div>
            </div>

            {/* New Section for Resistance Facilities */}
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
                <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">常見環境抗性設施</p>
                <div className="mb-6">
                    <div className="w-full py-4 px-5 md:py-5 md:px-6 bg-[#FDE047] rounded-xl md:rounded-2xl flex items-start gap-3 shadow-sm dark:bg-yellow-900/40">
                        <p className="text-xl md:text-2xl text-red-700 font-bold leading-normal dark:text-red-300 w-full text-left">
                            ※未在重要環境設施內，但仍會影響房價的設施
                        </p>
                    </div>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 transition-all duration-500 ${data?.q16_2_noFacilities ? '!bg-slate-100 !text-slate-500 pointer-events-none dark:!bg-slate-800 dark:!text-slate-400 p-4 rounded-2xl' : ''}`}>
                    {RESISTANCE_FACILITIES_OPTIONS.map((i: string) => (
                        <CheckBox key={i} checked={data?.q16_2_items?.includes(i) || false} label={i} onClick={() => toggleArr('q16_2_items', i)} disabled={data?.q16_2_noFacilities} />
                    ))}
                    <div className="col-span-1 lg:col-span-2">
                        <CheckBox 
                            checked={data?.q16_2_hasOther || false} 
                            label="其他未列項目" 
                            onClick={() => update('q16_2_hasOther', !data.q16_2_hasOther)} 
                            disabled={data?.q16_2_noFacilities} 
                        />
                        {data?.q16_2_hasOther && (
                            <SubItemHighlight>
                                <DetailInput 
                                    value={data.q16_2_other || ''} 
                                    onChange={v => update('q16_2_other', v)} 
                                    placeholder="說明現況" 
                                />
                            </SubItemHighlight>
                        )}
                    </div>
                </div>
                
                <div className="mt-8 flex flex-col items-center w-full">
                    <div className="w-full text-center mb-4">
                        <span className="inline-block px-4 py-2 bg-yellow-300 text-xl md:text-2xl text-slate-900 font-bold leading-normal dark:bg-yellow-800 dark:text-slate-100 rounded text-center">
                            物件已確認周邊半徑300公尺內
                            <br/>
                            無常見環境抗性設施
                            <br/>
                            可點選以下按鈕完成此題<span className="text-red-600 ml-1">⬇</span>
                        </span>
                    </div>
                    <div className="w-full">
                        <CheckBox checked={data?.q16_2_noFacilities || false} label="無常見環境抗性設施" onClick={() => { if (!data.q16_2_noFacilities) { update('q16_2_items', []); update('q16_2_hasOther', false); update('q16_2_other', ''); } update('q16_2_noFacilities', !data.q16_2_noFacilities); }} />
                    </div>
                </div>
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
                value={
                    (type === 'land' ? data?.land_q8_special : data?.q17_issue) === '否' ? '無' : 
                    ((type === 'land' ? data?.land_q8_special : data?.q17_issue) === '是' ? '有' : '')
                } 
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

            {type !== 'land' && type !== 'parking' && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <BooleanReveal 
                        label="是否曾發生非自然身故（凶宅）"
                        value={data?.q17_homicide === '否' ? '無' : (data?.q17_homicide === '是' ? '有' : '')} 
                        onChange={v => { 
                            const val = v === '無' ? '否' : (v === '有' ? '是' : ''); 
                            setData((p: any) => ({
                                ...p, 
                                q17_homicide: val, 
                                q17_homicide_desc: val === '是' ? p.q17_homicide_desc : '' 
                            })); 
                        }} 
                        options={['無', '有']} 
                        trigger="有"
                    >
                        <DetailInput value={data.q17_homicide_desc || ''} onChange={v => update('q17_homicide_desc', v)} placeholder="說明現況" />
                    </BooleanReveal>
                </div>
            )}
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
                        <p className="dynamic-text-h2 font-black mb-6 leading-normal">近兩年內土地鑑界與界標現況</p>
                        <AccordionRadio 
                            options={['近期已鑑界 (附土地複丈成果圖)', '待查證 (標位不明／須重測)', '否 (或年代久遠)']} 
                            value={
                                data?.land_q3_survey === '否' ? '否 (或年代久遠)' : 
                                (data?.land_q3_survey === '是' ? '近期已鑑界 (附土地複丈成果圖)' : 
                                (data?.land_q3_survey === '待查證' ? '待查證 (標位不明／須重測)' : 
                                (data?.land_q3_survey || '')))
                            } 
                            onChange={v => { 
                                const val = v === '否 (或年代久遠)' ? '否' : (v === '近期已鑑界 (附土地複丈成果圖)' ? '是' : (v === '待查證 (標位不明／須重測)' ? '待查證' : v)); 
                                setData((prev: any) => ({...prev, land_q3_survey: val})); 
                            }} 
                            renderDetail={(opt) => {
                                if (opt === '近期已鑑界 (附土地複丈成果圖)') return (
                                    <SubItemHighlight>
                                        <div className="space-y-4">
                                            <DetailInput value={data.land_q3_survey_detail || ''} onChange={v => update('land_q3_survey_detail', v)} placeholder="如：界標完整" />
                                            <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                                                <p className="font-bold text-lg mb-2">最近一次鑑界時間 (年份)：</p>
                                                <input 
                                                    type="text" 
                                                    className="full-width-input !text-xl" 
                                                    value={data.land_q3_survey_date || ''} 
                                                    onChange={e => update('land_q3_survey_date', e.target.value)} 
                                                    placeholder="如：112年 (若不確定可填不詳)" 
                                                />
                                            </div>
                                        </div>
                                    </SubItemHighlight>
                                );
                                if (opt === '待查證 (標位不明／須重測)') return <SubItemHighlight><DetailInput value={data.land_q3_survey_other || ''} onChange={v => update('land_q3_survey_other', v)} placeholder="如：不確定界標位置" /></SubItemHighlight>;
                                return null;
                            }}
                        />
                    </QuestionBlock>

                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black mb-6 leading-normal">產權與使用糾紛現況</p>
                        <AccordionRadio 
                            options={['無', '有', '待查證']} 
                            value={data?.land_q3_dispute === '否' ? '無' : (data?.land_q3_dispute === '是' ? '有' : (data?.land_q3_dispute || ''))} 
                            onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData((prev: any) => ({...prev, land_q3_dispute: val})); }} 
                            renderDetail={(opt) => {
                                if (opt === '有') return <SubItemHighlight><DetailInput value={data.land_q3_dispute_desc || ''} onChange={v => update('land_q3_dispute_desc', v)} placeholder="說明現況" /></SubItemHighlight>;
                                if (opt === '待查證') return <SubItemHighlight><DetailInput value={data.land_q3_dispute_other || ''} onChange={v => update('land_q3_dispute_other', v)} placeholder="說明現況" /></SubItemHighlight>;
                                return null;
                            }}
                        />
                    </QuestionBlock>
                </div>
            </SurveySection>

            <SurveySection id={ids.q4} highlighted={highlightedId === ids.q4} title={titles.q4} status={statusQ4}>
                <div className="space-y-8">
                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">位於政府徵收預定地</p>
                        <AccordionRadio 
                            options={['非範圍內', '屬範圍內', '待查證']} 
                            value={data?.land_q4_expro === '否' ? '非範圍內' : (data?.land_q4_expro === '是' ? '屬範圍內' : (data?.land_q4_expro || ''))} 
                            onChange={v => { const val = v === '非範圍內' ? '否' : (v === '屬範圍內' ? '是' : v); setData((prev: any) => ({...prev, land_q4_expro: val})); }} 
                            renderDetail={(opt) => {
                                if (opt === '屬範圍內' || opt === '待查證') return <SubItemHighlight><DetailInput value={data.land_q4_expro_other || ''} onChange={v => update('land_q4_expro_other', v)} placeholder="說明現況" /></SubItemHighlight>;
                                return null;
                            }}
                        />
                    </QuestionBlock>

                    <QuestionBlock>
                         <p className="dynamic-text-h2 font-black mb-6 leading-normal">位於重測區域範圍</p>
                        <AccordionRadio 
                            options={['非範圍內', '屬範圍內', '待查證']} 
                            value={data?.land_q4_resurvey === '否' ? '非範圍內' : (data?.land_q4_resurvey === '是' ? '屬範圍內' : (data?.land_q4_resurvey || ''))} 
                            onChange={v => { const val = v === '非範圍內' ? '否' : (v === '屬範圍內' ? '是' : v); setData((prev: any) => ({...prev, land_q4_resurvey: val})); }} 
                            renderDetail={(opt) => {
                                if (opt === '屬範圍內' || opt === '待查證') return <SubItemHighlight><DetailInput value={data.land_q4_resurvey_other || ''} onChange={v => update('land_q4_resurvey_other', v)} placeholder="說明現況" /></SubItemHighlight>;
                                return null;
                            }}
                        />
                    </QuestionBlock>
                </div>
            </SurveySection>
        </>
    );
};

export const BuildingLandAccessSection = ({ data, setData, update, title, id, highlightedId, type, status = 'neutral' }: any) => {
    const isHouse = type === 'house';
    const accessKey = isHouse ? 'q14_access' : 'land_q2_access';
    const abnormalDescKey = isHouse ? 'q14_abnormalDesc' : 'land_q2_access_desc';
    const ownerKey = isHouse ? 'q14_ownership' : 'land_q2_owner';
    const protectionKey = isHouse ? 'q14_protection' : 'land_q2_protection';
    const protectionDescKey = isHouse ? 'q14_protectionDesc' : 'land_q2_protectionDesc';
    const materialKey = isHouse ? 'q14_roadMaterial' : 'land_q2_material';
    const materialOtherKey = isHouse ? 'q14_roadMaterialOther' : 'land_q2_material_other';
    const roadWidthKey = isHouse ? 'q14_roadWidth' : 'land_q2_roadWidth';
    const buildingLineKey = isHouse ? 'q14_buildingLine' : 'land_q2_buildingLine';
    const buildingLineOtherKey = isHouse ? 'q14_buildingLineOther' : 'land_q2_buildingLine_other';
    const ditchKey = isHouse ? 'q14_ditch' : 'land_q2_ditch';
    const ditchOtherKey = isHouse ? 'q14_ditchOther' : 'land_q2_ditch_other';
    
    // Land Address Keys
    const sectionKey = isHouse ? 'q14_section' : 'land_q2_access_section';
    const subSectionKey = isHouse ? 'q14_subSection' : 'land_q2_access_subSection';
    const numberKey = isHouse ? 'q14_number' : 'land_q2_access_number';

    // Hiding Logic
    const hideBuildingLine = type === 'factory' ? ['立體化廠辦大樓', '連棟／分組式標準廠房'].includes(data.propertyType) : (type === 'house' ? ['大樓（10樓以上有電梯）', '華廈（10樓以下有電梯）', '公寓（5樓以下無電梯）'].includes(data.propertyType) : (type === 'land' && data.propertyType === '農地'));
    const hideDitch = type === 'factory' ? ['立體化廠辦大樓'].includes(data.propertyType) : (type === 'house' ? ['大樓（10樓以上有電梯）', '華廈（10樓以下有電梯）', '公寓（5樓以下無電梯）'].includes(data.propertyType) : false);

    return (
        <SurveySection id={id} highlighted={highlightedId === id} title={title} status={status}>
            <div className="space-y-10">
                <QuestionBlock>
                    <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">{isHouse ? '進出現況' : '進出通行現況'}</p>
                    <AccordionRadio 
                        options={type === 'land' ? ['通行順暢', '通行受限（如狹窄、有障礙物）', '袋地（無合法出入口）'] : ['通行順暢', '通行受限（如狹窄、有障礙物）', '其他未列項目']} 
                        value={data[accessKey]?.includes('順暢') ? '通行順暢' : (data[accessKey]?.includes('受限') ? '通行受限（如狹窄、有障礙物）' : (data[accessKey]?.includes('袋地') ? '袋地（無合法出入口）' : (data[accessKey] === '其他未列項目' ? '其他未列項目' : '')))} 
                        onChange={v => {
                            const val = v.includes('順暢') ? '通行順暢' : (v.includes('受限') ? '通行受限' : (v.includes('袋地') ? '袋地' : v));
                            setData((prev: any) => ({...prev, [accessKey]: val}));
                            if (v !== '其他未列項目' && v !== '通行受限（如狹窄、有障礙物）') update(abnormalDescKey, '');
                        }} 
                        renderDetail={(opt) => {
                            if (opt === '其他未列項目') {
                                return (
                                    <SubItemHighlight>
                                        <DetailInput value={data[abnormalDescKey] || ''} onChange={v => update(abnormalDescKey, v)} placeholder="如：袋地等" />
                                    </SubItemHighlight>
                                );
                            }
                            if (opt === '通行順暢') {
                                return (
                                    <SubItemHighlight>
                                        <div className="space-y-8">
                                            <div>
                                                <p className="font-bold text-xl text-slate-700 mb-4 dark:text-slate-200">通行權屬與保障</p>
                                                <AccordionRadio 
                                                    options={['公有', '私人']} 
                                                    value={data[ownerKey] || ''} 
                                                    onChange={v => {
                                                        setData((prev: any) => ({...prev, [ownerKey]: v, [protectionKey]: ''}));
                                                    }} 
                                                    renderDetail={(opt2) => {
                                                        if (opt2 === '公有') return <div className="mt-4"><AccordionRadio options={PROTECTION_OPTS_PUBLIC} value={data[protectionKey] || ''} onChange={v => update(protectionKey, v)} /></div>;
                                                        if (opt2 === '私人') return <div className="mt-4 space-y-4"><AccordionRadio options={PROTECTION_OPTS_PRIVATE} value={data[protectionKey] || ''} onChange={v => { update(protectionKey, v); update(protectionDescKey, ''); }} renderDetail={(opt3) => { if (['分管協議約定', '取得地主同意書', '法院判決通行', '現狀通行／既成道路'].includes(opt3)) return <DetailInput value={data[protectionDescKey] || ''} onChange={v => update(protectionDescKey, v)} placeholder="是否已取得相關書面證明文件 / 判決書" />; if (['現況未明／無保障'].includes(opt3)) return <DetailInput value={data[protectionDescKey] || ''} onChange={v => update(protectionDescKey, v)} placeholder="填寫目前的通行狀況" />; return null; }} /></div>;
                                                        return null;
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="pt-6 border-t-2 border-slate-200">
                                                <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">通行進出地號</p>
                                                <LandNumberInputs section={data[sectionKey] || ''} subSection={data[subSectionKey] || ''} number={data[numberKey] || ''} onChangeSection={v => update(sectionKey, v)} onChangeSubSection={v => update(subSectionKey, v)} onChangeNumber={v => update(numberKey, v)} />
                                            </div>

                                            {type === 'land' && (
                                                <div className="pt-6 border-t-2 border-slate-200">
                                                    <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">路面材質</p>
                                                    <AccordionRadio options={['柏油', '水泥', '泥土／石子', '其他未列項目']} value={data[materialKey] || ''} onChange={v => update(materialKey, v)} renderDetail={(opt2) => opt2 === '其他未列項目' ? <DetailInput value={data[materialOtherKey] || ''} onChange={v => update(materialOtherKey, v)} placeholder="說明現況" /> : null} />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                                                     <p className="font-bold text-lg mb-2 text-slate-600">現況路寬</p>
                                                     <UnitInput unit="米" value={data[roadWidthKey] || ''} onChange={v => update(roadWidthKey, v)} placeholder="輸入寬度" />
                                                </div>
                                                {type === 'land' && !hideBuildingLine && (
                                                    <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                                                         <p className="font-bold text-lg mb-2 text-slate-600">建築線指定狀況</p>
                                                         <AccordionRadio options={BUILDING_LINE_OPTIONS} value={data[buildingLineKey] || ''} onChange={v => update(buildingLineKey, v)} renderDetail={(opt2) => opt2 === '其他未列項目' ? <DetailInput value={data[buildingLineOtherKey] || ''} onChange={v => update(buildingLineOtherKey, v)} placeholder="如：申請中、未核定" /> : null} />
                                                    </div>
                                                )}
                                            </div>

                                            {type === 'land' && !hideDitch && (
                                                <div className="pt-6 border-t-2 border-slate-200">
                                                    <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200 leading-normal">臨路排水溝現況</p>
                                                    <AccordionRadio options={DRAINAGE_OPTIONS} value={data[ditchKey] || ''} onChange={v => update(ditchKey, v)} renderDetail={(opt2) => opt2 === '其他未列項目' ? <DetailInput value={data[ditchOtherKey] || ''} onChange={v => update(ditchOtherKey, v)} placeholder="說明現況" /> : null} />
                                                </div>
                                            )}
                                        </div>
                                    </SubItemHighlight>
                                );
                            }
                            
                            if (opt === '通行受限（如狹窄、有障礙物）' || opt === '袋地（無合法出入口）') {
                                return (
                                    <SubItemHighlight>
                                        <DetailInput value={data[abnormalDescKey] || ''} onChange={v => update(abnormalDescKey, v)} placeholder={opt === '袋地（無合法出入口）' ? "說明現況（如：目前仍由鄰地通行）" : "如：遭他人阻擋、路寬不足"} />
                                    </SubItemHighlight>
                                );
                            }
                            
                            return null;
                        }}
                    />
                </QuestionBlock>
            </div>
        </SurveySection>
    );
};
