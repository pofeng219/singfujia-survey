import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    EXT_LIST, LEAK_LOCATIONS, STRUCTURAL_ISSUES, UTILITY_ISSUES, FACILITY_OPTIONS, 
    ACCESS_SUB_OPTIONS, ACCESS_SUB_OPTIONS_LAND, ACCESS_SUB_OPTIONS_PARKING, ACCESS_SUB_OPTIONS_FACTORY, 
    PROPERTY_TYPE_OPTIONS, FACTORY_FLOOR_OPTS, FACTORY_FIRE_OPTS, FACTORY_WASTE_OPTS, FACTORY_DOCK_OPTS, FACTORY_TRUCK_OPTS
} from '../constants';
import { 
    CheckBox, RadioGroup, SurveySection, SubItemHighlight, DetailInput, InlineWarning, 
    AccordionRadio, QuestionBlock, BooleanReveal, UnitInput, FormInput, LandNumberInputs
} from './SharedUI';
import { UtilitiesSection, ParkingSection, EnvironmentSection, NotesSection } from './ComplexSections';
import { ROCDatePicker } from './ROCDatePicker';

interface StepProps {
    data: SurveyData;
    setData: React.Dispatch<React.SetStateAction<SurveyData>>;
    update: (key: keyof SurveyData, val: any) => void;
    toggleArr: (key: keyof SurveyData, val: string) => void;
    type: SurveyType;
    highlightedField: string | null;
    themeText: string;
    themeBorder: string;
    parkingLogic?: any;
}

export const Step1: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText, themeBorder }) => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300 pb-20">
        <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-green-400' : (type === 'factory' ? 'border-orange-400' : 'border-sky-400'))} pl-6 text-left`}>第一步：基本資料</h3>
        <div className={`space-y-8 warm-card p-10 rounded-[2.5rem] shadow-sm ${themeBorder}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput id="field-caseName" label="物件案名" value={data?.caseName || ''} onChange={v => update('caseName', v)} placeholder="輸入案名" highlighted={highlightedField === 'field-caseName'} />
                <FormInput id="field-authNumber" label="委託書編號" value={data?.authNumber || ''} onChange={v => update('authNumber', v)} placeholder="輸入編號" highlighted={highlightedField === 'field-authNumber'} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput id="field-storeName" label="所屬店名" value={data?.storeName || ''} onChange={v => update('storeName', v)} placeholder="輸入店名" highlighted={highlightedField === 'field-storeName'} />
                <FormInput id="field-agentName" label="調查業務" value={data?.agentName || ''} onChange={v => update('agentName', v)} placeholder="輸入姓名" highlighted={highlightedField === 'field-agentName'} />
            </div>
            <div className="space-y-3"><label className="block text-slate-800 font-black mb-2 text-2xl text-left">填寫日期</label><div className="mt-1"><ROCDatePicker value={data?.fillDate || ''} onChange={(d) => update('fillDate', d)} /></div></div>
            <FormInput id="field-address" label={type === 'land' ? '坐落位置' : (type === 'parking' ? '標的位置' : '標的地址')} value={data?.address || ''} onChange={v => update('address', v)} placeholder={type === 'land' ? "輸入坐落位置或相關位置" : "輸入地址/位置"} highlighted={highlightedField === 'field-address'} />
        </div>
        <SurveySection id="section-access" highlighted={highlightedField === 'section-access'} title="本物件現況" className={themeBorder}>
            {type === 'factory' && (
                <div id="section-propertyType" className={`flex flex-col gap-6 mb-8 border-b-2 border-slate-100 pb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'ring-4 ring-yellow-400 bg-yellow-50 transition-all duration-500' : 'transition-all duration-500'}`}>
                    <span className="text-3xl font-black text-slate-800 text-left">本物件型態</span>
                    <RadioGroup options={PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v, propertyTypeOther: v === '其他' ? prev.propertyTypeOther : '' })); }} layout="grid" cols={1} />
                    {data?.propertyType === '其他' && (<SubItemHighlight><DetailInput value={data.propertyTypeOther || ''} onChange={v => update('propertyTypeOther', v)} placeholder="請說明物件型態" /></SubItemHighlight>)}
                </div>
            )}
            <BooleanReveal 
                label="" 
                value={data?.access || ''}
                onChange={(v) => { setData(prev => ({ ...prev, access: v, accessType: v === '不可進入' ? prev.accessType : [], accessOther: v === '不可進入' ? prev.accessOther : '' })); }}
                options={['可進入', '不可進入']}
                trigger="不可進入"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 place-items-stretch">{(type === 'land' ? ACCESS_SUB_OPTIONS_LAND : (type === 'parking' ? ACCESS_SUB_OPTIONS_PARKING : (type === 'factory' ? ACCESS_SUB_OPTIONS_FACTORY : ACCESS_SUB_OPTIONS))).map(opt => (<CheckBox key={opt} checked={data?.accessType?.includes(opt) || false} label={opt} onClick={() => toggleArr('accessType', opt)} />))}</div>
                {data?.accessType?.includes('其他') && (<div className="space-y-4 w-full"><input type="text" className="full-width-input !mt-0" value={data?.accessOther || ''} onChange={v => update('accessOther', v.target.value)} placeholder="如：裝潢中、有狗" autoComplete="off" /></div>)}
                {type !== 'parking' && <div className="mt-8"><InlineWarning>{type === 'land' ? '若為上述情況，建議待找可進行調查時間點時再進行完整調查' : '若為上述情況，建議待整屋搬空/清空後再進行完整調查'}</InlineWarning></div>}
            </BooleanReveal>
        </SurveySection>
    </div>
);

export const Step2: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText, parkingLogic }) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300 pb-20">
        <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-green-400' : (type === 'factory' ? 'border-orange-400' : 'border-sky-400'))} pl-6 text-left`}>{type === 'land' ? '第二步 使用現況' : (type === 'parking' ? '第二步：車位資訊與現況' : '第二步：內部情況')}</h3>
        {(type === 'house' || type === 'factory') && <InlineWarning>※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，再判斷是否須調閱土地使用分區</InlineWarning>}
        {type === 'land' && <InlineWarning>※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，並判斷是否須調閱土地使用分區</InlineWarning>}
        {type === 'parking' && <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={1} ids={{ main: 'section-parking-main', abnormal: 'section-parking-abnormal', supplement: 'section-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} />}
        {type === 'land' && (
            <div className="space-y-12">
                <UtilitiesSection data={data} setData={setData} questionNum="1" type={type} id="section-land-q1" highlightedId={highlightedField} />
                <SurveySection id="section-land-q2" highlighted={highlightedField === 'section-land-q2'} title="2. 土地進出通行與臨路的情況？">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">土地進出通行是否有異常？</p>
                            <AccordionRadio options={['正常 (可自由通行)', '異常 (有阻礙)', '袋地 (無路可通)']} value={data?.land_q2_access || ''} onChange={v => { setData(prev => ({ ...prev, land_q2_access: v, land_q2_access_desc: v === '異常 (有阻礙)' ? prev.land_q2_access_desc : '' })); }} renderDetail={(opt) => (opt === '異常 (有阻礙)' ? <SubItemHighlight><DetailInput value={data.land_q2_access_desc || ''} onChange={v => update('land_q2_access_desc', v)} placeholder="如：路寬不足、有障礙物" /></SubItemHighlight> : (opt === '袋地 (無路可通)' ? <div className="mt-6"><InlineWarning>※注意：袋地可能面臨無法申請建築執照或貸款困難之問題，請務必確認通行權</InlineWarning></div> : null))} />
                        </QuestionBlock>
                        {data?.land_q2_access !== '袋地 (無路可通)' && data?.land_q2_access !== '' && (
                            <div className="animate-in fade-in space-y-8 text-left">
                                <QuestionBlock>
                                    <p className="text-2xl font-black mb-6">臨路的歸屬權？</p>
                                    <AccordionRadio options={['公有', '私人']} value={data.land_q2_owner || ''} onChange={v => { setData(prev => ({ ...prev, land_q2_owner: v, land_q2_owner_desc: v === '私人' ? prev.land_q2_owner_desc : '' })); }} renderDetail={(opt) => (opt === '私人' ? <SubItemHighlight><DetailInput value={data.land_q2_owner_desc || ''} onChange={v => update('land_q2_owner_desc', v)} placeholder="如：持分共有" /></SubItemHighlight> : null)} />
                                </QuestionBlock>
                                <QuestionBlock>
                                    <p className="text-2xl font-black mb-6">臨路的路面材質？</p>
                                    <AccordionRadio options={['柏油路', '水泥路', '泥巴路', '其他']} value={data.land_q2_material || ''} onChange={v => { setData(prev => ({ ...prev, land_q2_material: v, land_q2_material_other: v === '其他' ? prev.land_q2_material_other : '' })); }} renderDetail={(opt) => (opt === '其他' ? <SubItemHighlight><DetailInput value={data.land_q2_material_other || ''} onChange={v => update('land_q2_material_other', v)} placeholder="如：碎石路" /></SubItemHighlight> : null)} />
                                </QuestionBlock>
                            </div>
                        )}
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">周圍是否有排水溝？</p>
                            <AccordionRadio options={['無', '有', '其他']} value={data?.land_q2_ditch === '否' ? '無' : (data?.land_q2_ditch === '是' ? '有' : (data?.land_q2_ditch || ''))} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({ ...prev, land_q2_ditch: val, land_q2_ditch_other: val === '其他' ? prev.land_q2_ditch_other : '' })); }} renderDetail={(opt) => (opt === '其他' ? <SubItemHighlight><DetailInput value={data.land_q2_ditch_other || ''} onChange={v => update('land_q2_ditch_other', v)} placeholder="如：預計施作" /></SubItemHighlight> : null)} />
                        </QuestionBlock>
                    </div>
                </SurveySection>
                <SurveySection id="section-land-q3" highlighted={highlightedField === 'section-land-q3'} title="3. 曾在兩年內進行土地鑑界/目前是否有糾紛？">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">曾在兩年內進行土地鑑界？</p>
                            <AccordionRadio options={['否 (未鑑界)', '是 (曾鑑界)', '不確定 / 不知道']} value={data?.land_q3_survey === '否' ? '否 (未鑑界)' : (data?.land_q3_survey === '是' ? '是 (曾鑑界)' : (data?.land_q3_survey || ''))} onChange={v => { const val = v === '否 (未鑑界)' ? '否' : (v === '是 (曾鑑界)' ? '是' : v); setData(prev => ({ ...prev, land_q3_survey: val, land_q3_survey_detail: val === '是' ? prev.land_q3_survey_detail : '', land_q3_survey_other: val === '其他' ? prev.land_q3_survey_other : '' })); }} renderDetail={(opt) => (<>{opt === '是 (曾鑑界)' && <SubItemHighlight><div className="p-6 bg-white rounded-[1.5rem] border-3 border-slate-200"><RadioGroup options={['界址與現在相符', '界址與現在不符', '不確定鑑界結果']} value={data.land_q3_survey_detail || ''} onChange={v => update('land_q3_survey_detail', v)} /></div></SubItemHighlight>}{opt === '不確定 / 不知道' && <div className="mt-4"><InlineWarning className="text-red-700 bg-red-100 border-red-400">建議備註：請買方自行鑑界</InlineWarning></div>}</>)} />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">目前是否有糾紛？</p>
                            <AccordionRadio options={['無糾紛', '有糾紛', '疑似 / 處理中']} value={data?.land_q3_dispute === '否' ? '無糾紛' : (data?.land_q3_dispute === '是' ? '有糾紛' : (data?.land_q3_dispute || ''))} onChange={v => { const val = v === '無糾紛' ? '否' : (v === '有糾紛' ? '是' : v); setData(prev => ({ ...prev, land_q3_dispute: val, land_q3_dispute_desc: val === '是' ? prev.land_q3_dispute_desc : '', land_q3_dispute_other: val === '疑似 / 處理中' ? prev.land_q3_dispute_other : '' })); }} renderDetail={(opt) => (<>{opt === '有糾紛' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_desc || ''} onChange={v => update('land_q3_dispute_desc', v)} placeholder="如：界址爭議" /></SubItemHighlight>}{opt === '疑似 / 處理中' && <SubItemHighlight><DetailInput value={data.land_q3_dispute_other || ''} onChange={v => update('land_q3_dispute_other', v)} placeholder="如：鄰居主張..." /></SubItemHighlight>}</>)} />
                        </QuestionBlock>
                    </div>
                </SurveySection>
                <SurveySection id="section-land-q4" highlighted={highlightedField === 'section-land-q4'} title="4. 徵收地預定地/重測區域範圍內？">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">位於政府徵收地預定地？</p>
                            <AccordionRadio options={['否 (非範圍內)', '是 (位於範圍內)', '查詢中 / 不確定']} value={data?.land_q4_expro === '否' ? '否 (非範圍內)' : (data?.land_q4_expro === '是' ? '是 (位於範圍內)' : (data?.land_q4_expro || ''))} onChange={v => { const val = v.startsWith('否') ? '否' : (v.startsWith('是') ? '是' : v); setData(prev => ({ ...prev, land_q4_expro: val, land_q4_expro_other: (val === '是' || val === '查詢中 / 不確定') ? prev.land_q4_expro_other : '' })); }} renderDetail={(opt) => ((opt.startsWith('是') || opt === '查詢中 / 不確定') ? <SubItemHighlight><DetailInput value={data.land_q4_expro_other || ''} onChange={v => update('land_q4_expro_other', v)} placeholder="如：道路拓寬預定地" /></SubItemHighlight> : null)} />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">位於重測區域範圍內？</p>
                            <AccordionRadio options={['否 (非範圍內)', '是 (位於範圍內)', '查詢中 / 不確定']} value={data?.land_q4_resurvey === '否' ? '否 (非範圍內)' : (data?.land_q4_resurvey === '是' ? '是 (位於範圍內)' : (data?.land_q4_resurvey || ''))} onChange={v => { const val = v.startsWith('否') ? '否' : (v.startsWith('是') ? '是' : v); setData(prev => ({ ...prev, land_q4_resurvey: val, land_q4_resurvey_other: (val === '是' || val === '查詢中 / 不確定') ? prev.land_q4_resurvey_other : '' })); }} renderDetail={(opt) => ((opt.startsWith('是') || opt === '查詢中 / 不確定') ? <SubItemHighlight><DetailInput value={data.land_q4_resurvey_other || ''} onChange={v => update('land_q4_resurvey_other', v)} placeholder="如：重測公告期間" /></SubItemHighlight> : null)} />
                        </QuestionBlock>
                    </div>
                </SurveySection>
            </div>
        )}
        {(type === 'house' || type === 'factory') && (
            <div className="space-y-12">
                <SurveySection id="section-q1" highlighted={highlightedField === 'section-q1'} title="1. 增建情況與占用/被占用情況">
                    <div className="space-y-10 pl-0 md:pl-2">
                        <BooleanReveal 
                            label={
                                <>
                                    <p className="text-2xl font-black text-slate-700 mb-6">是否有增建情況 (含違建)？</p>
                                    <InlineWarning>※如有增建請繪製格局圖時，標示增建情況及位置</InlineWarning>
                                </>
                            }
                            value={data?.q1_hasExt || ''}
                            onChange={(v) => { setData(prev => ({ ...prev, q1_hasExt: v, q1_items: v === '是' ? prev.q1_items : [], q1_basementPartition: v === '是' ? prev.q1_basementPartition : false, q1_hasOther: v === '是' ? prev.q1_hasOther : false, q1_other: v === '是' ? prev.q1_other : '' })); }}
                        >
                            <div className="space-y-8 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{EXT_LIST.map(i => (<div key={i} className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 hover:border-slate-300 transition-colors"><CheckBox checked={data?.q1_items?.includes(i) || false} label={i} onClick={() => toggleArr('q1_items', i)} />{i === "地下室增建" && data?.q1_items?.includes("地下室增建") && (<div className="mt-4 text-left"><CheckBox checked={data?.q1_basementPartition || false} label="內含隔間" onClick={() => update('q1_basementPartition', !data.q1_basementPartition)} /></div>)}</div>))}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q1_hasOther || false} label="其他" onClick={() => update('q1_hasOther', !data.q1_hasOther)} />{data?.q1_hasOther && <DetailInput value={data.q1_other || ''} onChange={v => update('q1_other', v)} placeholder="如：頂樓加蓋、露台外推" />}</div>
                            </div>
                        </BooleanReveal>

                        <QuestionBlock>
                            <p className="text-2xl font-black text-slate-700 leading-snug">建物或增建部分，是否有占用</p>
                            <div className="mt-4 mb-6"><InlineWarning className="text-red-900 font-bold bg-yellow-300">※如鄰地、道路用地、他戶空間</InlineWarning></div>
                            <p className="text-xl font-bold text-slate-600 mb-4">建物或增建部分是否有 <span className="text-red-600">[占用他人]</span> 鄰地、道路用地？</p>
                            <RadioGroup options={['否', '是', '疑似']} value={data?.q2_hasOccupancy || ''} onChange={(v) => { setData(prev => ({ ...prev, q2_hasOccupancy: v, q2_desc: v === '否' ? '' : prev.q2_desc })); }} cols={3} layout="grid" />
                            {data?.q2_hasOccupancy !== '' && data?.q2_hasOccupancy !== '否' && <SubItemHighlight><DetailInput value={data.q2_desc || ''} onChange={v => update('q2_desc', v)} placeholder="如：占用鄰地約2坪" /></SubItemHighlight>}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-xl font-bold text-slate-600 mb-4">是否有 <span className="text-red-600">「他戶建物」</span> 占用 <span className="text-sky-600">「本案」</span> 之土地/本戶空間？</p>
                            <RadioGroup options={['否', '是', '疑似']} value={data?.q2_other_occupancy || ''} onChange={(v) => { setData(prev => ({ ...prev, q2_other_occupancy: v, q2_other_occupancy_desc: v === '否' ? '' : prev.q2_other_occupancy_desc })); }} cols={3} layout="grid" />{(data?.q2_other_occupancy === '是' || data?.q2_other_occupancy === '疑似') && <SubItemHighlight><DetailInput value={data.q2_other_occupancy_desc || ''} onChange={v => update('q2_other_occupancy_desc', v)} placeholder="如：隔壁冷氣室外機占用本戶外牆" /></SubItemHighlight>}
                        </QuestionBlock>
                    </div>
                </SurveySection>
                {type === 'factory' && (
                    <SurveySection id="section-factory-struct" highlighted={highlightedField === 'section-factory-struct'} title="2. 廠房結構與消防安全">
                        <QuestionBlock className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div><p className="text-xl font-black text-slate-700 mb-3">滴水高度</p><UnitInput unit="米" placeholder="梁下高度" value={data.factory_height || ''} onChange={v => update('factory_height', v)} /></div>
                                <div><p className="text-xl font-black text-slate-700 mb-3">柱距</p><UnitInput unit="米" placeholder="柱子間距" value={data.factory_column_spacing || ''} onChange={v => update('factory_column_spacing', v)} /></div>
                                <div><p className="text-xl font-black text-slate-700 mb-3">樓板載重</p><input type="text" inputMode="decimal" className="full-width-input" placeholder="(需詳閱建築藍圖或詢問所有權人)" value={data.factory_floor_load || ''} onChange={e => update('factory_floor_load', e.target.value)} /></div>
                            </div>
                        <div><p className="text-xl font-black text-slate-700 mb-3">地坪狀況</p><RadioGroup options={FACTORY_FLOOR_OPTS} value={data.factory_floor_condition || ''} onChange={v => update('factory_floor_condition', v)} layout="grid" cols={2} />{data.factory_floor_condition === '其他' && (<SubItemHighlight><DetailInput value={data.factory_floor_condition_other || ''} onChange={v => update('factory_floor_condition_other', v)} placeholder="請說明地坪狀況" /></SubItemHighlight>)}</div>
                            <div><p className="text-xl font-black text-slate-700 mb-3">消防設施</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{FACTORY_FIRE_OPTS.map(i => <CheckBox key={i} checked={data?.factory_fire_safety?.includes(i) || false} label={i} onClick={() => toggleArr('factory_fire_safety', i)} />)}</div>{data?.factory_fire_safety?.includes('其他') && (<SubItemHighlight><DetailInput value={data.factory_fire_safety_other || ''} onChange={v => update('factory_fire_safety_other', v)} placeholder="請說明其他設施" /></SubItemHighlight>)}</div>
                        </QuestionBlock>
                    </SurveySection>
                )}
                {/* Highlighted Leak Section */}
                <SurveySection id="section-q3" highlighted={highlightedField === 'section-q3'} title={type === 'factory' ? '3. 是否有滲漏水、壁癌等情況？' : '2. 是否有滲漏水、壁癌等情況？'} className="border-red-400 ring-4 ring-red-50">
                    <InlineWarning>※請特別檢查窗框角落、陽台天花板與頂樓狀況</InlineWarning>
                    <RadioGroup options={['否', '是']} value={data?.q3_hasLeak || ''} onChange={(v) => { setData(prev => ({ ...prev, q3_hasLeak: v, q3_leakType: v === '是' ? prev.q3_leakType : '', q3_locations: v === '是' ? prev.q3_locations : [], q3_hasOther: v === '是' ? prev.q3_hasOther : false, q3_other: v === '是' ? prev.q3_other : '', q3_ceilingWrapped: v === '是' ? prev.q3_ceilingWrapped : false, q3_suspected: v === '是' ? prev.q3_suspected : false, q3_suspectedDesc: v === '是' ? prev.q3_suspectedDesc : '' })); }} />
                    {data?.q3_hasLeak === '是' && (
                        <SubItemHighlight>
                            <div className="space-y-8">
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200">
                                    <p className="text-xl font-black mb-4">狀況類別 (請確認現場狀況)</p>
                                    <RadioGroup options={['滲漏水', '壁癌', '兩者皆有']} value={data.q3_leakType || ''} onChange={v => update('q3_leakType', v)} cols={3} layout="grid" />
                                </div>
                                <p className="text-xl font-black mb-2">發生位置：</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{LEAK_LOCATIONS.map(i => <CheckBox key={i} checked={data?.q3_locations?.includes(i) || false} label={i} onClick={() => toggleArr('q3_locations', i)} />)}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 space-y-4 text-left"><CheckBox checked={data?.q3_hasOther || false} label="其他" onClick={() => update('q3_hasOther', !data.q3_hasOther)} />{data?.q3_hasOther && <DetailInput value={data.q3_other || ''} onChange={v => update('q3_other', v)} placeholder="如：浴室門檻滲水" />}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 space-y-4 text-left"><CheckBox checked={data?.q3_suspected || false} label="疑似有滲漏水、壁癌，位置說明：" onClick={() => update('q3_suspected', !data.q3_suspected)} />{data?.q3_suspected && <DetailInput value={data.q3_suspectedDesc || ''} onChange={v => update('q3_suspectedDesc', v)} placeholder="如：牆面變色、油漆剝落" />}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q3_ceilingWrapped || false} label="全屋天花板包覆 (若包覆則免填無法觀察之項目)" onClick={() => update('q3_ceilingWrapped', !data.q3_ceilingWrapped)} /></div>
                            </div>
                        </SubItemHighlight>
                    )}
                </SurveySection>
                <SurveySection id="section-q4" highlighted={highlightedField === 'section-q4'} title={type === 'factory' ? '4. 建物結構情況' : '3. 建物結構情況'}>
                    <div className="space-y-10">
                        <BooleanReveal 
                            label={
                                <>
                                    <p className="text-2xl font-black mb-1 leading-snug">結構牆面是否有結構安全之虞的瑕疵</p>
                                    <p className="text-lg text-slate-500 font-bold mb-6">(非單純壁癌或油漆剝落)</p>
                                    <InlineWarning>※可從浴廁、廚房通風孔/維修孔、輕鋼架推開檢查</InlineWarning>
                                </>
                            }
                            value={data?.q4_hasIssue || ''}
                            onChange={(v) => { setData(prev => ({ ...prev, q4_hasIssue: v, q4_items: v === '是' ? prev.q4_items : [], q4_hasOther: v === '是' ? prev.q4_hasOther : false, q4_otherDesc: v === '是' ? prev.q4_otherDesc : '', q4_suspected: v === '是' ? prev.q4_suspected : false, q4_suspectedDesc: v === '是' ? prev.q4_suspectedDesc : '', q4_ceilingWrapped: v === '是' ? prev.q4_ceilingWrapped : false })); }}
                        >
                            <div className="space-y-8 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{STRUCTURAL_ISSUES.map(i => <CheckBox key={i} checked={data?.q4_items?.includes(i) || false} label={i} onClick={() => toggleArr('q4_items', i)} />)}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_hasOther || false} label="其他" onClick={() => update('q4_hasOther', !data.q4_hasOther)} />{data?.q4_hasOther && <DetailInput value={data.q4_otherDesc || ''} onChange={v => update('q4_otherDesc', v)} placeholder="如：樑柱裂縫" />}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_suspected || false} label="疑似須注意，位置說明：" onClick={() => update('q4_suspected', !data.q4_suspected)} />{data?.q4_suspected && <DetailInput value={data.q4_suspectedDesc || ''} onChange={v => update('q4_suspectedDesc', v)} placeholder="如：地板傾斜感" />}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_ceilingWrapped || false} label="全屋天花板包覆，無法觀察" onClick={() => update('q4_ceilingWrapped', !data.q4_ceilingWrapped)} /></div>
                            </div>
                        </BooleanReveal>

                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">是否有傾斜情況？</p>
                            <RadioGroup options={['否', '是', '疑似']} value={data?.q5_hasTilt || ''} onChange={(v) => { setData(prev => ({ ...prev, q5_hasTilt: v, q5_desc: v === '是' ? prev.q5_desc : '', q5_suspectedDesc: v === '疑似' ? prev.q5_suspectedDesc : '' })); }} cols={3} layout="grid" />
                            {data?.q5_hasTilt === '是' && <SubItemHighlight><DetailInput value={data.q5_desc || ''} onChange={v => update('q5_desc', v)} placeholder="如：經測量傾斜率1/50" /></SubItemHighlight>}
                            {data?.q5_hasTilt === '疑似' && <SubItemHighlight><DetailInput value={data.q5_suspectedDesc || ''} onChange={v => update('q5_suspectedDesc', v)} placeholder="如：目視有傾斜感" /></SubItemHighlight>}
                        </QuestionBlock>
                    </div>
                </SurveySection>
                <SurveySection id="section-q6" highlighted={highlightedField === 'section-q6'} title={<p className="text-3xl font-black text-slate-800 leading-snug text-left">{type === 'factory' ? '5. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？' : '4. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？'}</p>}>
                    <InlineWarning>※可簡易測量最長/短/寬/窄之距離 (因牆面厚度，測量的長/寬，與建物成果圖尺寸落差 30 公分內為合理範圍內)</InlineWarning><RadioGroup options={['相符 (無明顯差異)', '不符 (有明顯差異)', '無法測量/其他']} value={data?.q6_hasIssue || ''} onChange={(v) => { setData(prev => ({ ...prev, q6_hasIssue: v, q6_desc: (v === '相符 (無明顯差異)') ? '' : prev.q6_desc })); }} cols={3} layout="grid" />{(data?.q6_hasIssue === '不符 (有明顯差異)' || data?.q6_hasIssue === '無法測量/其他') && (<SubItemHighlight><DetailInput value={data.q6_desc || ''} onChange={v => update('q6_desc', v)} placeholder="如：寬度短少30公分" /></SubItemHighlight>)}
                </SurveySection>
                {type === 'house' && (
                    <SurveySection id="section-q7" highlighted={highlightedField === 'section-q7'} title="5. 水、電、瓦斯使用情況">
                        <QuestionBlock className="mb-8">
                            <p className="text-xl font-black text-slate-700 mb-4">瓦斯供應類型</p>
                            <RadioGroup options={['天然瓦斯', '桶裝瓦斯', '無']} value={data.q7_gasType || ''} onChange={v => update('q7_gasType', v)} cols={3} layout="grid" />
                        </QuestionBlock>
                        <BooleanReveal 
                            label="" // No extra label
                            value={data?.q7_hasIssue === '否' ? '正常 (無異常)' : (data?.q7_hasIssue === '是' ? '異常 (須說明)' : '')}
                            onChange={(v) => { const val = v === '正常 (無異常)' ? '否' : '是'; setData(prev => ({ ...prev, q7_hasIssue: val, q7_items: val === '是' ? prev.q7_items : [], q7_hasOther: val === '是' ? prev.q7_hasOther : false, q7_otherDesc: val === '是' ? prev.q7_otherDesc : '' })); }}
                            options={['正常 (無異常)', '異常 (須說明)']}
                            trigger="異常 (須說明)"
                        >
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{UTILITY_ISSUES.map(i => <CheckBox key={i} checked={data?.q7_items?.includes(i) || false} label={i} onClick={() => toggleArr('q7_items', i)} />)}</div>
                                <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q7_hasOther || false} label="其他" onClick={() => update('q7_hasOther', !data.q7_hasOther)} />{data?.q7_hasOther && <DetailInput value={data.q7_otherDesc || ''} onChange={v => update('q7_otherDesc', v)} placeholder="如：瓦斯管線老舊" />}</div>
                            </div>
                        </BooleanReveal>
                    </SurveySection>
                )}
                {type === 'factory' && <UtilitiesSection data={data} setData={setData} questionNum="6" type={type} id="section-factory-q6" highlightedId={highlightedField} />}
                <SurveySection id="section-publicFacilities" highlighted={highlightedField === 'section-publicFacilities'} title="公共設施情況">
                    <RadioGroup options={['有公共設施', '無公共設施', '無法進入']} value={data?.publicFacilities || ''} onChange={(v) => { setData(prev => ({ ...prev, publicFacilities: v, publicFacilitiesReason: v === '無法進入' ? prev.publicFacilitiesReason : '' })); }} cols={3} layout="grid" />{data?.publicFacilities === '無法進入' && <SubItemHighlight><DetailInput value={data.publicFacilitiesReason || ''} onChange={v => update('publicFacilitiesReason', v)} placeholder="如：需磁扣感應" /></SubItemHighlight>}
                </SurveySection>
            </div>
        )}
    </div>
);

export const Step3: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText, parkingLogic }) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300 pb-20">
        <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-green-400' : (type === 'factory' ? 'border-orange-400' : 'border-sky-400'))} pl-6 text-left`}>{type === 'land' ? '第三步 使用權利與地上物' : (type === 'parking' ? '第三步：環境與注意事項' : '第三步：公共設施(瑕疵)與車位')}</h3>
        {type === 'factory' && (
            <div className="space-y-12">
                <SurveySection id="section-factory-hardware" highlighted={highlightedField === 'section-factory-hardware'} title="7. 廠房硬體設施">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border-3 border-slate-200 space-y-8 hover:border-slate-300 transition-colors">
                        <div><p className="text-xl font-black text-slate-700 mb-3">貨梯/升降機</p><AccordionRadio options={['無', '有']} value={data.factory_elevator || ''} onChange={v => { setData(prev => ({ ...prev, factory_elevator: v, factory_elevator_capacity: v === '有' ? prev.factory_elevator_capacity : '', factory_elevator_dim: v === '有' ? prev.factory_elevator_dim : '' })); }} renderDetail={(opt) => (opt === '有' && (<SubItemHighlight><div className="space-y-6"><CheckBox checked={data.factory_elevator_working || false} label="目前是否可正常運作？" onClick={() => update('factory_elevator_working', !data.factory_elevator_working)} /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><p className="font-bold mb-2">載重</p><UnitInput unit="噸" value={data.factory_elevator_capacity || ''} onChange={v => update('factory_elevator_capacity', v)} placeholder="例：2噸" /></div><div><p className="font-bold mb-2">車廂尺寸 (寬x深x高)</p><input type="text" className="full-width-input" value={data.factory_elevator_dim || ''} onChange={e => update('factory_elevator_dim', e.target.value)} placeholder="例：200x250x220 cm" /></div></div></div></SubItemHighlight>))} /></div>
                        <div><p className="text-xl font-black text-slate-700 mb-3">天車 (起重機)</p><AccordionRadio options={['無', '有', '僅預留牛腿']} value={data.factory_crane || ''} onChange={v => { setData(prev => ({ ...prev, factory_crane: v, factory_crane_tonnage: v === '有' ? prev.factory_crane_tonnage : '', factory_crane_quantity: v === '有' ? prev.factory_crane_quantity : '' })); }} renderDetail={(opt) => (opt === '有' && (<SubItemHighlight><div className="space-y-6"><CheckBox checked={data.factory_crane_working || false} label="目前是否可正常運作？" onClick={() => update('factory_crane_working', !data.factory_crane_working)} /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><p className="font-bold mb-2">噸數</p><UnitInput unit="噸" value={data.factory_crane_tonnage || ''} onChange={v => update('factory_crane_tonnage', v)} placeholder="例：5噸" /></div><div><p className="font-bold mb-2">數量</p><UnitInput unit="台" value={data.factory_crane_quantity || ''} onChange={v => update('factory_crane_quantity', v)} placeholder="例：2台" /></div></div></div></SubItemHighlight>))} /></div>
                        <div><p className="text-xl font-black text-slate-700 mb-3">工業排水/廢氣處理</p><RadioGroup options={FACTORY_WASTE_OPTS} value={data.factory_waste || ''} onChange={v => { setData(prev => ({ ...prev, factory_waste: v, factory_waste_desc: v === '其他' ? prev.factory_waste_desc : '' })); }} layout="grid" cols={2} />{data.factory_waste === '其他' && <SubItemHighlight><DetailInput value={data.factory_waste_desc || ''} onChange={v => update('factory_waste_desc', v)} placeholder="請說明處理方式" /></SubItemHighlight>}</div>
                    </div>
                </SurveySection>
                <SurveySection id="section-factory-logistics" highlighted={highlightedField === 'section-factory-logistics'} title="8. 物流動線">
                    <div className="space-y-8">
                        <div><p className="text-xl font-black text-slate-700 mb-3">卸貨碼頭</p><RadioGroup options={FACTORY_DOCK_OPTS} value={data.factory_loading_dock || ''} onChange={v => update('factory_loading_dock', v)} layout="grid" cols={1} /></div>
                        <div><p className="text-xl font-black text-slate-700 mb-3">大車進出</p><RadioGroup options={FACTORY_TRUCK_OPTS} value={data.factory_truck_access || ''} onChange={v => update('factory_truck_access', v)} layout="grid" cols={2} /></div>
                    </div>
                </SurveySection>
            </div>
        )}
        {(type === 'house' || type === 'factory') && (
            <div className="space-y-12">
                <SurveySection id="section-q8" highlighted={highlightedField === 'section-q8'} title={<p className="text-3xl font-black text-slate-800 leading-snug">{type === 'factory' ? '9. 電(樓)梯間、公共地下室等現況是否有龜裂、鋼筋外露、水泥塊剝落等情況？' : '6. 電(樓)梯間、公共地下室等現況是否有龜裂、鋼筋外露、水泥塊剝落等情況？'}</p>}>
                    <BooleanReveal 
                        label=""
                        value={data?.q8_stairIssue === '否' ? '正常 (無明顯瑕疵)' : (data?.q8_stairIssue === '是' ? '異常 (有龜裂/剝落等)' : '')}
                        onChange={(v) => { const val = v === '正常 (無明顯瑕疵)' ? '否' : '是'; setData(prev => ({ ...prev, q8_stairIssue: val, q8_stairDesc: val === '是' ? prev.q8_stairDesc : '' })); }}
                        options={['正常 (無明顯瑕疵)', '異常 (有龜裂/剝落等)']}
                        trigger="異常 (有龜裂/剝落等)"
                    >
                        <DetailInput value={data.q8_stairDesc || ''} onChange={v => update('q8_stairDesc', v)} placeholder="如：樓梯間牆面龜裂" />
                    </BooleanReveal>
                </SurveySection>
                <SurveySection id="section-q9" highlighted={highlightedField === 'section-q9'} title={type === 'factory' ? '10. 本案或本社區是否有須注意的設施？' : '7. 本案或本社區是否有須注意的設施？'}>
                    <BooleanReveal 
                        label=""
                        value={data?.q9_hasIssue === '否' ? '無' : (data?.q9_hasIssue === '是' ? '有' : '')}
                        onChange={(v) => { const val = v === '無' ? '否' : '是'; setData(prev => ({ ...prev, q9_hasIssue: val, q9_items: val === '是' ? prev.q9_items : [], q9_hasOther: val === '是' ? prev.q9_hasOther : false, q9_otherDesc: val === '是' ? prev.q9_otherDesc : '' })); }}
                        options={['無', '有']}
                        trigger="有"
                    >
                        <div className="space-y-8 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{FACILITY_OPTIONS.map(i => <CheckBox key={i} checked={data?.q9_items?.includes(i) || false} label={i} onClick={() => toggleArr('q9_items', i)} />)}</div>
                            <div className="bg-white p-6 rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q9_hasOther || false} label="其他" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />{data?.q9_hasOther && <DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder="如：中繼水箱在同層" />}</div>
                        </div>
                    </BooleanReveal>
                </SurveySection>
                <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={type === 'factory' ? 11 : 8} ids={{ main: 'section-house-parking-main', abnormal: 'section-house-parking-abnormal', supplement: 'section-house-parking-supplement' }} highlightedId={highlightedField} />
            </div>
        )}
        {type === 'land' && (
            <div className="space-y-12">
                <SurveySection id="section-land-q5" highlighted={highlightedField === 'section-land-q5'} title="5. 被越界占用/占用鄰地情況？">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">本案是否有被 [他人] 越界占用？</p>
                            <RadioGroup options={['否', '是', '疑似']} value={data?.land_q5_encroached || ''} onChange={(v) => { setData(prev => ({ ...prev, land_q5_encroached: v, land_q5_encroached_desc: v === '否' ? '' : prev.land_q5_encroached_desc })); }} cols={3} layout="grid" />
                            {data?.land_q5_encroached !== '否' && data?.land_q5_encroached !== '' && <SubItemHighlight><DetailInput value={data.land_q5_encroached_desc || ''} onChange={v => update('land_q5_encroached_desc', v)} placeholder="如：鄰房圍牆越界" /></SubItemHighlight>}
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">本案是否有 [占用他人] 鄰地情況？</p>
                            <RadioGroup options={['否', '是', '疑似']} value={data?.land_q5_encroaching || ''} onChange={(v) => { setData(prev => ({ ...prev, land_q5_encroaching: v, land_q5_encroaching_desc: v === '否' ? '' : prev.land_q5_encroaching_desc })); }} cols={3} layout="grid" />
                            {data?.land_q5_encroaching !== '否' && data?.land_q5_encroaching !== '' && <SubItemHighlight><DetailInput value={data.land_q5_encroaching_desc || ''} onChange={v => update('land_q5_encroaching_desc', v)} placeholder="如：本案圍牆越界" /></SubItemHighlight>}
                        </QuestionBlock>
                    </div>
                </SurveySection>
                <SurveySection id="section-land-q6" highlighted={highlightedField === 'section-land-q6'} title="6. 目前是否有禁建、限建的情況？">
                    <BooleanReveal 
                        label=""
                        value={data?.land_q6_limit === '否' ? '否' : (data?.land_q6_limit === '是' ? '是' : (data?.land_q6_limit === '無' ? '無' : ''))}
                        onChange={(v) => { setData(prev => ({ ...prev, land_q6_limit: v, land_q6_limit_desc: (v === '是' || v === '疑似') ? prev.land_q6_limit_desc : '' })); }}
                        options={['否', '是', '無']}
                        trigger="是"
                        cols={3}
                    >
                        <DetailInput value={data.land_q6_limit_desc || ''} onChange={v => update('land_q6_limit_desc', v)} placeholder="如：行水區、保護區" />
                    </BooleanReveal>
                </SurveySection>
                <SurveySection id="section-land-q7" highlighted={highlightedField === 'section-land-q7'} title="7. 土地使用現況與地上物">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">現況使用人？</p>
                            <AccordionRadio options={['無', '所有權人自用', '非所有權人使用']} value={data?.land_q7_user || ''} onChange={v => { setData(prev => ({ ...prev, land_q7_user: v, land_q7_user_detail: v === '非所有權人使用' ? prev.land_q7_user_detail : '', land_q7_user_desc: v === '非所有權人使用' ? prev.land_q7_user_desc : '' })); }} renderDetail={(opt) => (opt === '非所有權人使用' ? <SubItemHighlight><div className="space-y-6"><RadioGroup options={['承租中', '無償借用', '被占用', '共有分管']} value={data.land_q7_user_detail || ''} onChange={v => update('land_q7_user_detail', v)} />{data.land_q7_user_detail !== '共有分管' && <DetailInput value={data.land_q7_user_desc || ''} onChange={v => update('land_q7_user_desc', v)} placeholder={data.land_q7_user_detail === '承租中' ? "如租金/押金、期限等" : (data.land_q7_user_detail === '無償借用' ? "如借用對象、約定事項" : (data.land_q7_user_detail === '被占用' ? "如占用人資訊、已提告/協調中等" : "如：親戚借用"))} />}</div></SubItemHighlight> : null)} />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">地上定著物-農作物？</p>
                            <AccordionRadio options={['無', '有農作物/植栽']} value={data?.land_q7_crops || ''} onChange={v => { setData(prev => ({ ...prev, land_q7_crops: v })); }} renderDetail={(opt) => (opt === '有農作物/植栽' ? <SubItemHighlight><div className="space-y-6"><RadioGroup options={['經濟作物', '景觀植栽', '雜樹/荒廢', '其他']} value={data.land_q7_crops_type || ''} onChange={v => update('land_q7_crops_type', v)} layout="grid" cols={2} />{data.land_q7_crops_type === '經濟作物' && <div className="text-xl font-bold flex items-center gap-2">預計收成月份：<UnitInput unit="月" value={data.land_q7_crops_month || ''} onChange={v => update('land_q7_crops_month', v)} /></div>}{(data.land_q7_crops_type === '經濟作物' || data.land_q7_crops_type === '景觀植栽') && <div className="bg-white p-4 rounded-xl border-2"><p className="mb-2 font-bold">處理方式：</p><RadioGroup options={['賣方移除', '列冊點交', '協議補貼']} value={data.land_q7_crops_detail || ''} onChange={v => update('land_q7_crops_detail', v)} layout="grid" cols={1} /></div>}{data.land_q7_crops_type === '其他' && <DetailInput value={data.land_q7_crops_other || ''} onChange={v => update('land_q7_crops_other', v)} placeholder="如：禁伐補償、造林等" />}</div></SubItemHighlight> : null)} />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-2xl font-black mb-6">地上定著物-建物？</p>
                            <AccordionRadio options={['無', '有建築物/工作物']} value={data?.land_q7_build || ''} onChange={v => { setData(prev => ({ ...prev, land_q7_build: v })); }} renderDetail={(opt) => (opt === '有建築物/工作物' ? <SubItemHighlight><div className="space-y-6"><RadioGroup options={['有保存登記', '未保存登記', '宗教/殯葬設施', '其他']} value={data.land_q7_build_type || ''} onChange={v => update('land_q7_build_type', v)} layout="grid" cols={2} />{(data.land_q7_build_type === '有保存登記' || data.land_q7_build_type === '未保存登記') && <div className="bg-white p-4 rounded-xl border-2"><p className="mb-2 font-bold">現況權屬：</p><RadioGroup options={['所有權人自用', '出租中', '被佔用', '不堪使用']} value={data.land_q7_build_ownership || ''} onChange={v => update('land_q7_build_ownership', v)} /></div>}{data.land_q7_build_type === '宗教/殯葬設施' && <div className="bg-white p-4 rounded-xl border-2"><p className="mb-2 font-bold">設施類型：</p><RadioGroup options={['小廟', '墳墓']} value={data.land_q7_build_rel_detail || ''} onChange={v => update('land_q7_build_rel_detail', v)} /></div>}{data.land_q7_build_type === '其他' && <DetailInput value={data.land_q7_build_other || ''} onChange={v => update('land_q7_build_other', v)} placeholder="如：貨櫃屋" />}</div></SubItemHighlight> : null)} />
                        </QuestionBlock>
                    </div>
                </SurveySection>
            </div>
        )}
        {type === 'parking' && (
            <>
                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} 
                    id="section-q16" 
                    title="2. 重要環境設施" 
                    highlightedId={highlightedField} 
                />
                <NotesSection 
                    data={data} setData={setData} update={update} 
                    id="section-q17" 
                    title="3. 本案或本社區是否有須注意的事項？" 
                    highlightedId={highlightedField}
                    type={type} 
                />
                <div className="p-12 bg-rose-50 border-4 border-rose-200 rounded-[2rem] text-center shadow-lg mt-10"><div className="mb-8"><CheckCircle2 className="w-28 h-28 text-rose-600 mx-auto" /></div><p className="text-4xl font-black text-rose-800 leading-relaxed mb-4">車位現況調查表填寫完成！</p><p className="text-2xl text-rose-700 font-bold">請檢查右側預覽畫面是否正確，確認無誤後即可匯出檔案。</p></div>
            </>
        )}
    </div>
);

export const Step4: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText }) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300">
        <h3 className={`text-3xl font-black ${themeText} border-l-8 ${type === 'land' ? 'border-green-400' : (type === 'factory' ? 'border-orange-400' : 'border-sky-400')} pl-6 text-left`}>
            {type === 'land' ? '第四步：環境與其他' : '第四步：外觀與環境'}
        </h3>

        {(type === 'house' || type === 'factory') && (
            <>
                <SurveySection id="section-q14" highlighted={highlightedField === 'section-q14'} title={type === 'factory' ? '12. 本案標的須經由他人土地出入？' : '9. 本案標的須經由他人土地出入？'}>
                    <QuestionBlock>
                        <RadioGroup options={['否', '是']} value={data?.q14_access || ''} onChange={(v) => { setData(prev => ({ ...prev, q14_access: v, q14_section: v === '否' ? '' : prev.q14_section, q14_subSection: v === '否' ? '' : prev.q14_subSection, q14_number: v === '否' ? '' : prev.q14_number })); }} />
                        {data?.q14_access === '是' && (
                            <SubItemHighlight>
                                <LandNumberInputs 
                                    section={data.q14_section || ''}
                                    subSection={data.q14_subSection || ''}
                                    number={data.q14_number || ''}
                                    onChangeSection={(v) => update('q14_section', v)}
                                    onChangeSubSection={(v) => update('q14_subSection', v)}
                                    onChangeNumber={(v) => update('q14_number', v)}
                                />
                            </SubItemHighlight>
                        )}
                    </QuestionBlock>
                </SurveySection>

                <SurveySection id="section-q15" highlighted={highlightedField === 'section-q15'} title={type === 'factory' ? '13. 增建部分是否占用他人土地？' : '10. 增建部分是否占用他人土地？'}>
                    <QuestionBlock>
                        <RadioGroup options={['否', '是']} value={data?.q15_occupy || ''} onChange={(v) => { setData(prev => ({ ...prev, q15_occupy: v, q15_section: v === '否' ? '' : prev.q15_section, q15_subSection: v === '否' ? '' : prev.q15_subSection, q15_number: v === '否' ? '' : prev.q15_number })); }} />
                        {data?.q15_occupy === '是' && (
                            <SubItemHighlight>
                                <LandNumberInputs 
                                    section={data.q15_section || ''}
                                    subSection={data.q15_subSection || ''}
                                    number={data.q15_number || ''}
                                    onChangeSection={(v) => update('q15_section', v)}
                                    onChangeSubSection={(v) => update('q15_subSection', v)}
                                    onChangeNumber={(v) => update('q15_number', v)}
                                />
                            </SubItemHighlight>
                        )}
                    </QuestionBlock>
                </SurveySection>
            </>
        )}

        <EnvironmentSection 
            data={data} update={update} toggleArr={toggleArr}
            id="section-q16"
            title={type === 'factory' ? '14. 重要環境設施' : (type === 'land' ? '8. 重要環境設施' : '11. 重要環境設施')}
            highlightedId={highlightedField}
        />

        <NotesSection 
            data={data} setData={setData} update={update}
            id={type === 'land' ? "section-land-q8" : "section-q17"}
            title={type === 'factory' ? '15. 本案或本社區是否有須注意的事項？' : (type === 'land' ? '9. 本案或周圍是否有須注意的事項？' : '12. 本案或本社區是否有須注意的事項？')}
            highlightedId={highlightedField}
            type={type}
        />

        <div className={`p-12 border-4 rounded-[2rem] text-center shadow-lg mt-10 ${type === 'land' ? 'bg-green-50 border-green-200' : (type === 'factory' ? 'bg-orange-50 border-orange-200' : 'bg-sky-50 border-sky-200')}`}>
            <div className="mb-8">
                <CheckCircle2 className={`w-28 h-28 mx-auto ${type === 'land' ? 'text-green-600' : (type === 'factory' ? 'text-orange-600' : 'text-sky-600')}`} />
            </div>
            <p className={`text-4xl font-black leading-relaxed mb-4 ${type === 'land' ? 'text-green-800' : (type === 'factory' ? 'text-orange-800' : 'text-sky-800')}`}>
                {type === 'land' ? '土地' : (type === 'factory' ? '廠房' : '成屋')}現況調查表填寫完成！
            </p>
            <p className={`text-2xl font-bold ${type === 'land' ? 'text-green-700' : (type === 'factory' ? 'text-orange-700' : 'text-sky-700')}`}>
                請檢查右側預覽畫面是否正確，確認無誤後即可匯出檔案。
            </p>
        </div>
    </div>
);