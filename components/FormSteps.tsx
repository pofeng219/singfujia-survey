
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    EXT_LIST, LEAK_LOCATIONS, STRUCTURAL_ISSUES, UTILITY_ISSUES, FACILITY_OPTIONS, 
    ACCESS_SUB_OPTIONS, ACCESS_SUB_OPTIONS_LAND, ACCESS_SUB_OPTIONS_PARKING, ACCESS_SUB_OPTIONS_FACTORY, 
    PROPERTY_TYPE_OPTIONS, FACTORY_FLOOR_OPTS, FACTORY_FIRE_OPTS, FACTORY_WASTE_OPTS, FACTORY_DOCK_OPTS, FACTORY_TRUCK_OPTS,
    STAIR_ISSUES, HOUSE_PROPERTY_TYPE_OPTIONS, LAND_PROPERTY_TYPE_OPTIONS, FACTORY_PROPERTY_TYPE_OPTIONS,
    WATER_BOOSTER_ITEMS_B, FACILITIES_GROUP_A, FACILITIES_LAND_BASE, FACILITIES_LAND_FARM_EXTRA, FACILITIES_LAND_BUILD_IND_EXTRA,
    LAND_WATER_BOOSTER_ITEMS, GROUP_A_TYPES, WATER_BOOSTER_ITEMS_A,
    GAS_SUPPLY_OPTIONS
} from '../constants';
import { 
    CheckBox, RadioGroup, SurveySection, SubItemHighlight, DetailInput, InlineWarning, 
    AccordionRadio, QuestionBlock, BooleanReveal, UnitInput, FormInput, LandNumberInputs, SignaturePad
} from './SharedUI';
import { UtilitiesSection, ParkingSection, EnvironmentSection, NotesSection, LandQuestionsGroup, BuildingLandAccessSection } from './ComplexSections';
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

const getFactoryHeightLabel = (pType: string) => {
    if (pType === "立體化廠辦大樓" || pType === "標準廠房(工業園區內)") return "樑下淨高／樓層高度";
    return "滴水高度";
};

// Reusable Step Container to remove duplication of layout and header styles
const StepContainer: React.FC<{
    title: string;
    type: SurveyType;
    themeText: string;
    children: React.ReactNode;
}> = ({ title, type, themeText, children }) => {
    const borderColor = type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-green-400' : (type === 'factory' ? 'border-orange-400' : 'border-sky-400'));
    
    return (
        <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right duration-300 pb-10">
            <h3 className={`text-[1.75rem] md:text-[2rem] font-black ${themeText} border-l-8 ${borderColor} pl-4 md:pl-6 text-left`}>
                {title}
            </h3>
            {children}
        </div>
    );
};

export const Step1 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText, themeBorder }) => (
    <StepContainer title="第一步：基本資料" type={type} themeText={themeText}>
        <div className={`space-y-6 md:space-y-8 warm-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm ${themeBorder}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <FormInput id="field-caseName" label="物件案名" value={data?.caseName || ''} onChange={v => update('caseName', v)} placeholder="輸入案名" highlighted={highlightedField === 'field-caseName'} />
                <FormInput id="field-authNumber" label="委託書編號" value={data?.authNumber || ''} onChange={v => update('authNumber', v)} placeholder="輸入編號" highlighted={highlightedField === 'field-authNumber'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <FormInput id="field-storeName" label="所屬店名" value={data?.storeName || ''} onChange={v => update('storeName', v)} placeholder="輸入店名" highlighted={highlightedField === 'field-storeName'} />
                <FormInput id="field-agentName" label="調查業務" value={data?.agentName || ''} onChange={v => update('agentName', v)} placeholder="輸入姓名" highlighted={highlightedField === 'field-agentName'} />
            </div>
            <div className="space-y-3"><label className="block text-slate-800 font-black mb-2 text-[1.5rem] md:text-[1.75rem] text-left leading-normal">填寫日期</label><div className="mt-1"><ROCDatePicker value={data?.fillDate || ''} onChange={(d) => update('fillDate', d)} /></div></div>
            <FormInput id="field-address" label={type === 'land' ? '坐落位置' : (type === 'parking' ? '標的位置' : '標的地址')} value={data?.address || ''} onChange={v => update('address', v)} placeholder={type === 'land' ? "輸入坐落位置或相關位置" : "輸入地址／位置"} highlighted={highlightedField === 'field-address'} />
        </div>
        <SurveySection id="section-access" highlighted={highlightedField === 'section-access'} title={type === 'factory' || type === 'house' || type === 'land' ? "本物件型態與現況" : "本物件現況"} className={themeBorder}>
            {type === 'factory' && (
                <>
                    <div id="section-propertyType" className={`flex flex-col gap-6 mb-8 border-b-2 border-slate-100 pb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'ring-4 ring-yellow-400 bg-yellow-50 transition-all duration-500' : 'transition-all duration-500'}`}>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 text-left leading-normal">本物件型態</p>
                        <RadioGroup options={FACTORY_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v, propertyTypeOther: v === '其他特殊工業設施' ? prev.propertyTypeOther : '' })); }} />
                        {data?.propertyType === '其他特殊工業設施' && (<SubItemHighlight><DetailInput value={data.propertyTypeOther || ''} onChange={v => update('propertyTypeOther', v)} placeholder="說明物件型態" /></SubItemHighlight>)}
                    </div>
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <BooleanReveal 
                            label="本物件現況"
                            value={data?.access || ''}
                            onChange={(v) => { setData(prev => ({ ...prev, access: v, accessType: v === '不可進入' ? prev.accessType : [], accessOther: v === '不可進入' ? prev.accessOther : '' })); }}
                            options={['可進入', '不可進入']}
                            trigger="不可進入"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-6 place-items-stretch">{ACCESS_SUB_OPTIONS_FACTORY.map(opt => (<CheckBox key={opt} checked={data?.accessType?.includes(opt) || false} label={opt} onClick={() => toggleArr('accessType', opt)} />))}</div>
                            {data?.accessType?.includes('其他未列項目') && (<div className="space-y-4 w-full"><input type="text" className="full-width-input !mt-0" value={data?.accessOther || ''} onChange={v => update('accessOther', v.target.value)} placeholder="說明現況" autoComplete="off" /></div>)}
                            <div className="mt-8"><InlineWarning>若為上述現況，建議待整屋搬空/清空後再進行完整調查</InlineWarning></div>
                        </BooleanReveal>
                    </div>
                </>
            )}
            {type === 'house' && (
                 <div id="section-propertyType" className={`flex flex-col gap-6 mb-8 border-b-2 border-slate-100 pb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'ring-4 ring-yellow-400 bg-yellow-50 transition-all duration-500' : 'transition-all duration-500'}`}>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 text-left leading-normal">本物件型態</p>
                    <RadioGroup options={HOUSE_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v })); }} />
                </div>
            )}
            {type === 'land' && (
                 <div id="section-propertyType" className={`flex flex-col gap-6 mb-8 border-b-2 border-slate-100 pb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'ring-4 ring-yellow-400 bg-yellow-50 transition-all duration-500' : 'transition-all duration-500'}`}>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 text-left leading-normal">本物件型態</p>
                    <RadioGroup options={LAND_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v })); }} />
                </div>
            )}
            {type !== 'factory' && (
                <BooleanReveal 
                    label={type === 'house' || type === 'land' ? "本物件現況" : ""}
                    value={data?.access || ''}
                    onChange={(v) => { setData(prev => ({ ...prev, access: v, accessType: v === '不可進入' ? prev.accessType : [], accessOther: v === '不可進入' ? prev.accessOther : '' })); }}
                    options={['可進入', '不可進入']}
                    trigger="不可進入"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-6 place-items-stretch">{(type === 'land' ? ACCESS_SUB_OPTIONS_LAND : (type === 'parking' ? ACCESS_SUB_OPTIONS_PARKING : ACCESS_SUB_OPTIONS)).map(opt => (<CheckBox key={opt} checked={data?.accessType?.includes(opt) || false} label={opt} onClick={() => toggleArr('accessType', opt)} />))}</div>
                    {data?.accessType?.includes('其他未列項目') && (<div className="space-y-4 w-full"><input type="text" className="full-width-input !mt-0" value={data?.accessOther || ''} onChange={v => update('accessOther', v.target.value)} placeholder="說明現況" autoComplete="off" /></div>)}
                    {type !== 'parking' && <div className="mt-8"><InlineWarning>{type === 'land' ? '若為上述現況，建議待找可進行調查時間點時再進行完整調查' : '若為上述現況，建議待整屋搬空/清空後再進行完整調查'}</InlineWarning></div>}
                </BooleanReveal>
            )}
        </SurveySection>
    </StepContainer>
));

export const Step2 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText, parkingLogic }) => {
    
    // Check if property type belongs to Group A
    const isGroupA = GROUP_A_TYPES.includes(data.propertyType);

    return (
        <StepContainer title={type === 'land' ? '第二步：使用現況-1' : (type === 'parking' ? '第二步：車位資訊與現況' : '第二步：內部現況')} type={type} themeText={themeText}>
            {(type === 'house' || type === 'factory' || type === 'land') && (
                <InlineWarning>
                    {type === 'land' 
                        ? '※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，並判斷是否須調閱土地使用分區' 
                        : '※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，再判斷是否須調閱土地使用分區'}
                </InlineWarning>
            )}
            
            {type === 'parking' && <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={1} ids={{ main: 'section-parking-main', abnormal: 'section-parking-abnormal', supplement: 'section-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} />}
            {type === 'land' && (
                <div className="space-y-8 md:space-y-12">
                    <UtilitiesSection data={data} setData={setData} title="1. 電、水與其他設施使用現況" type={type} id="section-land-q1" highlightedId={highlightedField} />
                    <LandQuestionsGroup 
                        data={data} setData={setData} update={update}
                        titles={{ q2: '', q3: '2. 土地鑑界與界標現況／產權與使用糾紛現況', q4: '3. 土地徵收與保留地現況／重劃與區段徵收現況' }}
                        ids={{ q2: 'section-land-q2-hidden', q3: 'section-land-q3', q4: 'section-land-q4' }}
                        highlightedId={highlightedField}
                        hideQ2={true}
                    />
                    <SurveySection id="section-land-q5" highlighted={highlightedField === 'section-land-q5'} title="4. 被越界占用／占用鄰地現況？">
                        <div className="space-y-8">
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal"><span className="text-red-600">遭</span>他人<span className="text-red-600">占用</span>現況</p>
                                <AccordionRadio options={['無', '有']} value={data?.land_q5_encroached === '否' ? '無' : (data?.land_q5_encroached === '是' ? '有' : (data?.land_q5_encroached || ''))} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({...prev, land_q5_encroached: val, land_q5_encroached_desc: val === '否' ? '' : prev.land_q5_encroached_desc })); }} renderDetail={opt => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q5_encroached_desc || ''} onChange={v => update('land_q5_encroached_desc', v)} placeholder="如：鄰居圍牆占用" /></SubItemHighlight> : null)} cols={2} />
                            </QuestionBlock>
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal"><span className="text-red-600">占用</span>鄰地現況</p>
                                <AccordionRadio options={['無', '有']} value={data?.land_q5_encroaching === '否' ? '無' : (data?.land_q5_encroaching === '是' ? '有' : (data?.land_q5_encroaching || ''))} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({...prev, land_q5_encroaching: val, land_q5_encroaching_desc: val === '否' ? '' : prev.land_q5_encroaching_desc })); }} renderDetail={opt => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q5_encroaching_desc || ''} onChange={v => update('land_q5_encroaching_desc', v)} placeholder="如：增建占用水利地" /></SubItemHighlight> : null)} cols={2} />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                </div>
            )}
            {(type === 'house' || type === 'factory') && (
                <div className="space-y-8 md:space-y-12">
                    <SurveySection id="section-q1" highlighted={highlightedField === 'section-q1'} title="1. 增建與占用／被占用現況">
                        <div className="space-y-8 md:space-y-10 pl-0 md:pl-2">
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">增建 (含違建)現況</p>
                                        <InlineWarning>※如有增建請繪製格局圖時，標示增建現況及位置</InlineWarning>
                                    </>
                                }
                                value={data?.q1_hasExt === '否' ? '無' : (data?.q1_hasExt === '是' ? '有' : '')}
                                onChange={(v) => { 
                                    // Fix: Use ternary to allow empty string (deselect)
                                    const val = v === '無' ? '否' : (v === '有' ? '是' : ''); 
                                    setData(prev => ({ ...prev, q1_hasExt: val, q1_items: val === '是' ? prev.q1_items : [], q1_basementPartition: val === '是' ? prev.q1_basementPartition : false, q1_hasOther: val === '是' ? prev.q1_hasOther : false, q1_other: val === '是' ? prev.q1_other : '' })); 
                                }}
                                options={['無', '有']}
                                trigger="有"
                            >
                                <div className="space-y-6 md:space-y-8 pt-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{EXT_LIST.map(i => (<div key={i} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 hover:border-slate-300 transition-colors"><CheckBox checked={data?.q1_items?.includes(i) || false} label={i} onClick={() => toggleArr('q1_items', i)} />{i === "地下室增建" && data?.q1_items?.includes("地下室增建") && (<div className="mt-4 text-left"><CheckBox checked={data?.q1_basementPartition || false} label="內含隔間" onClick={() => update('q1_basementPartition', !data.q1_basementPartition)} /></div>)}</div>))}</div>
                                    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q1_hasOther || false} label="其他未列項目" onClick={() => update('q1_hasOther', !data.q1_hasOther)} />{data?.q1_hasOther && <DetailInput value={data.q1_other || ''} onChange={v => update('q1_other', v)} placeholder="如：平台外推、露台外推" />}</div>
                                </div>
                            </BooleanReveal>

                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-2 leading-normal">
                                    <span className="text-red-600 text-2xl md:text-3xl font-black">占用</span>他人土地或空間現況
                                </p>
                                <div className="mb-6"><InlineWarning>※如鄰地、道路用地、他戶空間</InlineWarning></div>
                                <RadioGroup 
                                    options={['無', '有', '待查證']} 
                                    value={data?.q2_hasOccupancy === '否' ? '無' : (data?.q2_hasOccupancy === '是' ? '有' : (data?.q2_hasOccupancy === '待查證' || data?.q2_hasOccupancy === '疑似' ? '待查證' : (data?.q2_hasOccupancy || '')))} 
                                    onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({ ...prev, q2_hasOccupancy: val, q2_desc: val === '否' ? '' : prev.q2_desc })); }} 
                                    cols={2} layout="grid" 
                                />
                                {data?.q2_hasOccupancy !== '' && data?.q2_hasOccupancy !== '否' && <SubItemHighlight><DetailInput value={data.q2_desc || ''} onChange={v => update('q2_desc', v)} placeholder="如：占用鄰地約2坪" /></SubItemHighlight>}
                            </QuestionBlock>

                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4">
                                    <span className="text-red-600 text-2xl md:text-3xl font-black">遭</span>鄰房或鄰地<span className="text-red-600 text-2xl md:text-3xl font-black">占用</span>現況
                                </p>
                                <RadioGroup 
                                    options={['無', '有', '待查證']} 
                                    value={data?.q2_other_occupancy === '否' ? '無' : (data?.q2_other_occupancy === '是' ? '有' : (data?.q2_other_occupancy === '待查證' || data?.q2_other_occupancy === '疑似' ? '待查證' : (data?.q2_other_occupancy || '')))} 
                                    onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({ ...prev, q2_other_occupancy: val, q2_other_occupancy_desc: val === '否' ? '' : prev.q2_other_occupancy_desc })); }} 
                                    cols={2} layout="grid" 
                                />{(data?.q2_other_occupancy === '是' || data?.q2_other_occupancy === '待查證' || data?.q2_other_occupancy === '疑似') && <SubItemHighlight><DetailInput value={data.q2_other_occupancy_desc || ''} onChange={v => update('q2_other_occupancy_desc', v)} placeholder="如：隔壁冷氣室外機占用本戶外牆" /></SubItemHighlight>}
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    
                    <SurveySection id="section-q6" highlighted={highlightedField === 'section-q6'} title={<p className="text-[1.75rem] md:text-[2rem] font-black text-slate-800 leading-snug text-left">{type === 'factory' ? '2. 現場長寬與建物測量成果圖比對／建物面積現況評估' : '2. 現場長寬與建物測量成果圖比對／建物面積現況評估'}</p>}>
                        <InlineWarning>※可簡易測量最長／短／寬／窄之距離 (因牆面厚度，測量的長／寬，與建物成果圖尺寸落差 30 公分內為合理範圍內)</InlineWarning>
                        <RadioGroup 
                            options={['實測相符', '實測不符', '無法測量']} 
                            value={data?.q6_hasIssue === '相符 (無明顯差異)' ? '實測相符' : (data?.q6_hasIssue === '不符 (有明顯差異)' ? '實測不符' : (data?.q6_hasIssue === '無法測量／其他' || data?.q6_hasIssue === '無法測量／現況說明' ? '無法測量' : (data?.q6_hasIssue || '')))} 
                            onChange={(v) => { 
                                setData(prev => ({ ...prev, q6_hasIssue: v, q6_desc: (v === '實測相符') ? '' : prev.q6_desc })); 
                            }} 
                            layout="grid" 
                        />{(data?.q6_hasIssue === '實測不符' || data?.q6_hasIssue === '無法測量') && (<SubItemHighlight><DetailInput value={data.q6_desc || ''} onChange={v => update('q6_desc', v)} placeholder="說明現況" /></SubItemHighlight>)}
                    </SurveySection>

                    <SurveySection id="section-q3" highlighted={highlightedField === 'section-q3'} title={type === 'factory' ? '3. 滲漏水與壁癌現況' : '3. 滲漏水與壁癌現況'} className="border-red-400 ring-4 ring-red-50">
                        <InlineWarning>※檢查窗框角落、陽台天花板與頂樓狀況</InlineWarning>
                        <RadioGroup 
                            options={['無', '有', '全屋天花板包覆']} 
                            value={data.q3_ceilingWrapped ? '全屋天花板包覆' : (data?.q3_hasLeak === '否' ? '無' : (data?.q3_hasLeak === '是' ? '有' : (data?.q3_hasLeak ? '' : '')))} 
                            onChange={(v) => { 
                                if (v === '全屋天花板包覆') {
                                    setData(prev => ({ ...prev, q3_hasLeak: '是', q3_leakType: '全屋天花板包覆', q3_ceilingWrapped: true, q3_locations: [], q3_hasOther: false, q3_other: '', q3_suspected: false, q3_suspectedDesc: '' })); 
                                } else {
                                    const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                                    setData(prev => ({ ...prev, q3_hasLeak: val, q3_leakType: val === '是' ? prev.q3_leakType : '', q3_ceilingWrapped: false, q3_locations: val === '是' ? prev.q3_locations : [], q3_hasOther: val === '是' ? prev.q3_hasOther : false, q3_other: val === '是' ? prev.q3_other : '', q3_suspected: val === '是' ? prev.q3_suspected : false, q3_suspectedDesc: val === '是' ? prev.q3_suspectedDesc : '' })); 
                                }
                            }} 
                            layout="grid"
                        />
                        {data?.q3_hasLeak === '是' && !data.q3_ceilingWrapped && (
                            <SubItemHighlight>
                                <div className="space-y-6 md:space-y-8">
                                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200">
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4 leading-normal">狀況類別 <span className="text-xl font-normal text-slate-500 block md:inline md:ml-2">(請確認現場狀況)</span></p>
                                        <RadioGroup 
                                            options={['滲漏水', '壁癌', '兩者皆有']} 
                                            value={data.q3_leakType === '全屋天花板包覆' ? '' : (data.q3_leakType || '')} 
                                            onChange={v => setData(prev => ({ ...prev, q3_leakType: v }))} 
                                            layout="grid" 
                                        />
                                    </div>
                                    
                                    {(data.q3_leakType && data.q3_leakType !== '全屋天花板包覆') && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6 md:space-y-8">
                                            <div>
                                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal">發生位置：</p>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">{LEAK_LOCATIONS.map(i => <CheckBox key={i} checked={data?.q3_locations?.includes(i) || false} label={i} onClick={() => toggleArr('q3_locations', i)} />)}</div>
                                            </div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 space-y-4 text-left"><CheckBox checked={data?.q3_hasOther || false} label="其他未列項目" onClick={() => update('q3_hasOther', !data.q3_hasOther)} />{data?.q3_hasOther && <DetailInput value={data.q3_other || ''} onChange={v => update('q3_other', v)} placeholder="說明位置與現況" />}</div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 space-y-4 text-left"><CheckBox checked={data?.q3_suspected || false} label={data.q3_leakType === '滲漏水' ? "疑似有滲漏水，位置說明：" : (data.q3_leakType === '壁癌' ? "疑似有壁癌，位置說明：" : "疑似有滲漏水、壁癌，位置說明：")} onClick={() => update('q3_suspected', !data.q3_suspected)} />{data?.q3_suspected && <DetailInput value={data.q3_suspectedDesc || ''} onChange={v => update('q3_suspectedDesc', v)} placeholder="如：牆面變色、油漆剝落" />}</div>
                                        </div>
                                    )}
                                </div>
                            </SubItemHighlight>
                        )}
                        <div className="mt-8 pt-6 border-t-2 border-slate-100">
                             <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 leading-normal">確認過往滲漏水修繕紀錄</p>
                                <RadioGroup 
                                    options={['無修繕紀錄', '有修繕紀錄']} 
                                    value={data.q3_repairHistory || ''} 
                                    onChange={v => update('q3_repairHistory', v)} 
                                    cols={2}
                                />
                                {data.q3_repairHistory === '有修繕紀錄' && (
                                    <SubItemHighlight>
                                         <DetailInput value={data.q3_repairDesc || ''} onChange={v => update('q3_repairDesc', v)} placeholder="說明修繕時間、方式或保固情形" />
                                    </SubItemHighlight>
                                )}
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    
                    <SurveySection id="section-q4" highlighted={highlightedField === 'section-q4'} title={type === 'factory' ? '4. 建物結構現況' : '4. 建物結構現況'}>
                        <div className="space-y-8 md:space-y-10">
                            <QuestionBlock>
                                <div className="mb-6">
                                    <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-1 leading-normal">結構牆面與樑柱現況</p>
                                    <p className="text-lg text-slate-500 font-bold mb-6">(非單純壁癌或油漆剝落)</p>
                                    <InlineWarning>※可從浴廁、廚房通風孔／維修孔、輕鋼架推開檢查</InlineWarning>
                                </div>
                                <RadioGroup 
                                    options={['無', '有', '全屋天花板包覆']} 
                                    value={data.q4_ceilingWrapped ? '全屋天花板包覆' : (data?.q4_hasIssue === '否' ? '無' : (data?.q4_hasIssue === '是' ? '有' : (data?.q4_hasIssue ? '' : '')))} 
                                    onChange={(v) => { 
                                        if (v === '全屋天花板包覆') {
                                            setData(prev => ({ ...prev, q4_hasIssue: '是', q4_ceilingWrapped: true, q4_items: [], q4_hasOther: false, q4_otherDesc: '', q4_suspected: false, q4_suspectedDesc: '' })); 
                                        } else {
                                            const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                                            setData(prev => ({ ...prev, q4_hasIssue: val, q4_ceilingWrapped: false, q4_items: val === '是' ? prev.q4_items : [], q4_hasOther: val === '是' ? prev.q4_hasOther : false, q4_otherDesc: val === '是' ? prev.q4_otherDesc : '', q4_suspected: val === '是' ? prev.q4_suspected : false, q4_suspectedDesc: val === '是' ? prev.q4_suspectedDesc : '' })); 
                                        }
                                    }}
                                    cols={2}
                                    layout="grid"
                                />
                                {data?.q4_hasIssue === '是' && !data.q4_ceilingWrapped && (
                                    <SubItemHighlight>
                                        <div className="space-y-8 pt-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{STRUCTURAL_ISSUES.map(i => <CheckBox key={i} checked={data?.q4_items?.includes(i) || false} label={i} onClick={() => toggleArr('q4_items', i)} />)}</div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_hasOther || false} label="其他未列項目" onClick={() => update('q4_hasOther', !data.q4_hasOther)} />{data?.q4_hasOther && <DetailInput value={data.q4_otherDesc || ''} onChange={v => update('q4_otherDesc', v)} placeholder="說明現況" />}</div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_suspected || false} label="現況需待查證" onClick={() => update('q4_suspected', !data.q4_suspected)} />{data?.q4_suspected && <DetailInput value={data.q4_suspectedDesc || ''} onChange={v => update('q4_suspectedDesc', v)} placeholder="說明位置與現況" />}</div>
                                        </div>
                                    </SubItemHighlight>
                                )}
                            </QuestionBlock>

                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-2 leading-normal">建物傾斜現況</p>
                                <div className="mb-4"><InlineWarning>※僅依目視觀察，精確數據須由專業技師鑑定</InlineWarning></div>
                                <RadioGroup 
                                    options={['無', '有', '待查證 (待測量)']} 
                                    value={data?.q5_hasTilt === '否' ? '無' : (data?.q5_hasTilt === '是' ? '有' : (data?.q5_hasTilt === '待查證' || data?.q5_hasTilt === '疑似' ? '待查證 (待測量)' : (data?.q5_hasTilt || '')))} 
                                    onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v === '待查證 (待測量)' ? '待查證' : v); setData(prev => ({ ...prev, q5_hasTilt: val, q5_desc: val === '是' ? prev.q5_desc : '', q5_suspectedDesc: val === '待查證' ? prev.q5_suspectedDesc : '' })); }} 
                                    cols={2} layout="grid" 
                                />
                                {data?.q5_hasTilt === '是' && <SubItemHighlight><DetailInput value={data.q5_desc || ''} onChange={v => update('q5_desc', v)} placeholder="如：經單位檢測提供報告書" /></SubItemHighlight>}
                                {data?.q5_hasTilt === '待查證' && <SubItemHighlight><DetailInput value={data.q5_suspectedDesc || ''} onChange={v => update('q5_suspectedDesc', v)} placeholder="如：目視有傾斜感" /></SubItemHighlight>}
                            </QuestionBlock>
                        </div>
                    </SurveySection>

                    {type === 'house' && (
                        <>
                            <SurveySection id="section-q7" highlighted={highlightedField === 'section-q7'} title="5. 電、水、瓦斯與其他設施使用現況">
                                 <div className="space-y-8">
                                     {/* 1. Gas Supply Type - Top */}
                                     <QuestionBlock>
                                         <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">瓦斯供應類型</p>
                                         <RadioGroup 
                                             options={GAS_SUPPLY_OPTIONS} 
                                             value={data.q7_gasType || ''} 
                                             onChange={v => update('q7_gasType', v)} 
                                             layout="grid" cols={1} 
                                         />
                                     </QuestionBlock>

                                     {/* 2. Equipment Status - Moved below Gas Type */}
                                     <QuestionBlock>
                                         <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">電、水、瓦斯與其他設施使用現況</p>
                                         <BooleanReveal 
                                             label=""
                                             value={data.q7_hasIssue === '否' ? '無異常' : (data.q7_hasIssue === '是' ? '有異常' : '')}
                                             onChange={v => {
                                                 // Adjusted logic: Map '' back to '' correctly
                                                 const val = v === '無異常' ? '否' : (v === '有異常' ? '是' : '');
                                                 setData(prev => ({
                                                     ...prev, 
                                                     q7_hasIssue: val,
                                                     q7_items: val === '是' ? prev.q7_items : [],
                                                     q7_hasOther: val === '是' ? prev.q7_hasOther : false,
                                                     q7_otherDesc: val === '是' ? prev.q7_otherDesc : ''
                                                 }));
                                             }}
                                             options={['無異常', '有異常']}
                                             trigger="有異常"
                                         >
                                             <div className="space-y-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                                    {UTILITY_ISSUES.map(i => <CheckBox key={i} checked={data?.q7_items?.includes(i) || false} label={i} onClick={() => toggleArr('q7_items', i)} />)}
                                                </div>
                                                <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left">
                                                    <CheckBox checked={data?.q7_hasOther || false} label="其他未列項目" onClick={() => update('q7_hasOther', !data.q7_hasOther)} />
                                                    {data?.q7_hasOther && <DetailInput value={data.q7_otherDesc || ''} onChange={v => update('q7_otherDesc', v)} placeholder="說明現況" />}
                                                </div>
                                             </div>
                                         </BooleanReveal>
                                     </QuestionBlock>

                                     {/* 3. Solar Photovoltaic Equipment (Group A Only) */}
                                     {isGroupA && (
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

                                     {/* 4. Water Booster - Group A handled in logic, Group B not modified */}
                                     {isGroupA && (
                                         <QuestionBlock>
                                             <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 text-left dark:text-slate-100 leading-normal">加壓受水設備</p>
                                             <div className="mb-6">
                                                <InlineWarning>※本項由使用者自行管理維護</InlineWarning>
                                             </div>
                                             <RadioGroup 
                                                options={['無設置', '有設置']} 
                                                value={data.water_booster === '無設置' || data.water_booster === '無' ? '無設置' : (data.water_booster === '有設置' || data.water_booster === '有' ? '有設置' : '')} 
                                                onChange={v => {
                                                    // Allow deselection logic by keeping v if empty
                                                    setData(prev => ({ 
                                                        ...prev, 
                                                        water_booster: v, 
                                                        water_booster_items: (v === '無設置' || v === '') ? [] : prev.water_booster_items 
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
                                 </div>
                            </SurveySection>

                            {/* NEW: Garbage Treatment Section - Moved to Step 2 Q6 */}
                            <SurveySection id="section-garbage" highlighted={highlightedField === 'section-garbage'} title="6. 垃圾處理方式">
                                <RadioGroup 
                                    options={['社區統一處理 (有環保室)', '自行處理 (需等垃圾車)', '其他未列項目']} 
                                    value={data.garbageTreatment || ''} 
                                    onChange={v => setData(p => ({ ...p, garbageTreatment: v, garbageTreatmentOther: v === '其他未列項目' ? p.garbageTreatmentOther : '' }))} 
                                    layout="grid" 
                                />
                                {data.garbageTreatment === '其他未列項目' && (
                                    <SubItemHighlight>
                                        <DetailInput value={data.garbageTreatmentOther || ''} onChange={v => update('garbageTreatmentOther', v)} placeholder="說明現況" />
                                    </SubItemHighlight>
                                )}
                            </SurveySection>
                        </>
                    )}
                </div>
            )}
        </StepContainer>
    );
});

export const Step3 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText, themeBorder, parkingLogic }) => {
    
    const isGroupA = GROUP_A_TYPES.includes(data.propertyType);

    if (type === 'parking') {
        return (
            <StepContainer title="第三步：環境與其他" type={type} themeText={themeText}>
                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} id="section-q16" title="2. 重要環境設施" highlightedId={highlightedField} 
                    warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                />
                <NotesSection 
                    data={data} setData={setData} update={update} id="section-q17" title="3. 本案或本社區須注意的事項" highlightedId={highlightedField} type={type}
                    warningText="※車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等" 
                />
                <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title="4. 調查人員簽章">
                    <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
                </SurveySection>
            </StepContainer>
        );
    }
    
    if (type === 'house') {
        return (
             <StepContainer title="第三步：公設／車位" type={type} themeText={themeText}>
                <SurveySection id="section-publicFacilities" highlighted={highlightedField === 'section-publicFacilities'} title="7. 大樓／社區公共設施 (可否進入／使用)">
                    <RadioGroup options={['無公共設施', '有公共設施', '無法進入']} value={data?.publicFacilities || ''} onChange={(v) => { setData(prev => ({ ...prev, publicFacilities: v, publicFacilitiesReason: v === '無法進入' ? prev.publicFacilitiesReason : '' })); }} cols={2} layout="grid" />{data?.publicFacilities === '無法進入' && <SubItemHighlight><DetailInput value={data.publicFacilitiesReason || ''} onChange={v => update('publicFacilitiesReason', v)} placeholder="如：需磁扣感應" /></SubItemHighlight>}
                </SurveySection>

                <SurveySection id="section-q8" highlighted={highlightedField === 'section-q8'} title="8. 公設空間（梯間/地下室）現況">
                     <BooleanReveal 
                        label="" 
                        value={data?.q8_stairIssue === '否' ? '無異常' : (data?.q8_stairIssue === '是' ? '有異常' : '')} 
                        onChange={v => { const val = v === '無異常' ? '否' : (v === '有異常' ? '是' : v); setData(p => ({...p, q8_stairIssue: val, q8_stairItems: val === '否' ? [] : p.q8_stairItems, q8_stairOther: val === '否' ? '' : p.q8_stairOther })); }} 
                        options={['無異常', '有異常']} 
                        trigger="有異常"
                     >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {STAIR_ISSUES.map(i => <CheckBox key={i} checked={data?.q8_stairItems?.includes(i) || false} label={i} onClick={() => toggleArr('q8_stairItems', i)} />)}
                            </div>
                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left">
                                <CheckBox checked={data?.q8_stairItems?.includes('其他未列項目') || false} label="其他未列項目" onClick={() => toggleArr('q8_stairItems', '其他未列項目')} />
                                {data?.q8_stairItems?.includes('其他未列項目') && <DetailInput value={data.q8_stairOther || ''} onChange={v => update('q8_stairOther', v)} placeholder="說明現況" />}
                            </div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
                <SurveySection id="section-q9" highlighted={highlightedField === 'section-q9'} title="9. 本案或本社區須注意的設施">
                     <BooleanReveal label="" value={data?.q9_hasIssue === '否' ? '無' : (data?.q9_hasIssue === '是' ? '有' : '')} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(p => ({...p, q9_hasIssue: val, q9_items: val === '是' ? p.q9_items : [], q9_hasOther: val === '是' ? p.q9_hasOther : false, q9_otherDesc: val === '是' ? p.q9_otherDesc : '' })); }} options={['無', '有']} trigger="有">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {(isGroupA ? FACILITIES_GROUP_A : FACILITY_OPTIONS).map(i => (
                                    <div key={i} className={`flex flex-col ${(i === '太陽能光電發電設備' || i === '加壓受水設備') && data?.q9_items?.includes(i) ? 'col-span-1 md:col-span-2' : ''}`}>
                                        <div className="h-full">
                                            <CheckBox checked={data?.q9_items?.includes(i) || false} label={i} onClick={() => toggleArr('q9_items', i)} />
                                        </div>
                                        {/* Original Logic for Solar/Water Booster maintenance (Group B/Apartments) */}
                                        {i === '太陽能光電發電設備' && data?.q9_items?.includes(i) && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                <SubItemHighlight>
                                                    <p className="font-bold text-xl text-slate-700 mb-3 dark:text-slate-200">
                                                        {['透天別墅', '透天店面'].includes(data.propertyType) ? '設置現況：' : '維護方式：'}
                                                    </p>
                                                    <RadioGroup 
                                                        options={['透天別墅', '透天店面'].includes(data.propertyType) ? ['合法設置', '私下設置'] : ['管委會維護', '全體住戶維護']} 
                                                        value={data.q9_solar_maintenance || ''} 
                                                        onChange={v => update('q9_solar_maintenance', v)} 
                                                    />
                                                </SubItemHighlight>
                                            </div>
                                        )}
                                        {i === '加壓受水設備' && data?.q9_items?.includes(i) && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                <SubItemHighlight>
                                                    <div className="mb-4">
                                                        <div className="w-full py-4 px-5 md:py-5 md:px-6 bg-[#FDE047] rounded-xl md:rounded-2xl flex items-start gap-3 shadow-sm dark:bg-yellow-900/40">
                                                            <p className="text-xl md:text-2xl text-red-700 font-bold leading-normal dark:text-red-300 w-full text-left">
                                                                ※加壓受水設備由管委會／全體住戶共同管理維護
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-xl text-slate-700 mb-3 dark:text-slate-200">設置現況：</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {WATER_BOOSTER_ITEMS_B.map(item => (
                                                            <CheckBox 
                                                                key={item} 
                                                                checked={data.q9_water_booster_items?.includes(item) || false} 
                                                                label={item} 
                                                                onClick={() => toggleArr('q9_water_booster_items', item)} 
                                                            />
                                                        ))}
                                                    </div>
                                                </SubItemHighlight>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                             <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left">
                                <CheckBox checked={data?.q9_hasOther || false} label="其他未列項目" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />
                                {data?.q9_hasOther && <DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder={isGroupA ? "說明現況" : "如：發電機"} />}
                             </div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
                <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={10} ids={{ main: 'section-house-parking-main', abnormal: 'section-house-parking-abnormal', supplement: 'section-house-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} />
             </StepContainer>
        );
    }

    if (type === 'land') {
        // Construct Facilities options dynamically for Land
        let landFacilitiesOptions = [...FACILITIES_LAND_BASE];
        if (data.propertyType === '農地') {
            landFacilitiesOptions = [...landFacilitiesOptions, ...FACILITIES_LAND_FARM_EXTRA];
        } else if (data.propertyType === '建地' || data.propertyType === '工業地') {
            landFacilitiesOptions = [...landFacilitiesOptions, ...FACILITIES_LAND_BUILD_IND_EXTRA];
        }

        return (
            <StepContainer title="第三步：使用現況-2" type={type} themeText={themeText}>
                <SurveySection id="section-land-q6" highlighted={highlightedField === 'section-land-q6'} title="5. 目前禁建與限建現況">
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-normal">目前禁建與限建現況</p>
                        <RadioGroup 
                            options={['無', '有']} 
                            value={data.land_q6_limit === '否' ? '無' : (data.land_q6_limit === '是' ? '有' : '')} 
                            onChange={v => {
                                // Fix: Use ternary to allow empty string (deselect)
                                const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                setData(p => ({...p, land_q6_limit: val, land_q6_limit_desc: val === '是' ? p.land_q6_limit_desc : ''}))
                            }} 
                            layout="grid"
                            cols={2}
                        />
                        {data.land_q6_limit === '是' && (
                            <SubItemHighlight>
                                <DetailInput value={data.land_q6_limit_desc || ''} onChange={v => update('land_q6_limit_desc', v)} placeholder="說明現況" />
                            </SubItemHighlight>
                        )}
                    </QuestionBlock>
                </SurveySection>

                <SurveySection id="section-land-q7" highlighted={highlightedField === 'section-land-q7'} title="6. 土地使用現況與地上物">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">現況使用人</p>
                            <RadioGroup 
                                options={['無', '所有權人自用', '非所有權人使用']} 
                                value={data.land_q7_user === '無' ? '無' : (data.land_q7_user || '')} 
                                onChange={v => setData(p => ({...p, land_q7_user: v === '無' ? '無' : v, land_q7_user_detail: v === '非所有權人使用' ? p.land_q7_user_detail : '', land_q7_user_desc: v === '非所有權人使用' ? p.land_q7_user_desc : ''}))} 
                                layout="grid" cols={2}
                            />
                            {data.land_q7_user === '非所有權人使用' && (
                                <SubItemHighlight>
                                    <div className="space-y-4">
                                        <RadioGroup 
                                            options={['承租中', '無償借用', '被占用', '共有分管', '其他未列項目']} 
                                            value={data.land_q7_user_detail || ''} 
                                            onChange={v => {
                                                setData(prev => ({...prev, land_q7_user_detail: v, land_q7_user_desc: ''})); // Reset desc on change
                                            }} 
                                            layout="grid" cols={2}
                                        />
                                        {['承租中', '無償借用', '被占用', '其他未列項目'].includes(data.land_q7_user_detail) && (
                                            <DetailInput 
                                                value={data.land_q7_user_desc || ''} 
                                                onChange={v => update('land_q7_user_desc', v)} 
                                                placeholder={
                                                    data.land_q7_user_detail === '承租中' ? "如租金／押金、期限等" :
                                                    data.land_q7_user_detail === '無償借用' ? "如借用對象、約定事項等" :
                                                    data.land_q7_user_detail === '被占用' ? "說明現況" :
                                                    "說明現況"
                                                } 
                                            />
                                        )}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">地上定著物-農作物</p>
                            <RadioGroup 
                                options={['無', '有農作物／植栽']} 
                                value={data.land_q7_crops === '無' ? '無' : (data.land_q7_crops || '')} 
                                onChange={v => setData(p => ({...p, land_q7_crops: v === '無' ? '無' : v}))} 
                                layout="grid" cols={2}
                            />
                            {data.land_q7_crops === '有農作物／植栽' && (
                                <SubItemHighlight>
                                    <div className="space-y-6">
                                        <RadioGroup options={['經濟作物', '景觀植栽', '雜樹／荒廢', '其他未列項目']} value={data.land_q7_crops_type || ''} onChange={v => update('land_q7_crops_type', v)} layout="grid" cols={2} />
                                        
                                        {(data.land_q7_crops_type === '經濟作物' || data.land_q7_crops_type === '景觀植栽') && (
                                            <div className="p-4 bg-white rounded-xl border-2 border-slate-200 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-xl shrink-0">預計收成月份：</span>
                                                    <div className="w-32"><input type="number" className="full-width-input !mt-0 text-center" value={data.land_q7_crops_month || ''} onChange={e => update('land_q7_crops_month', e.target.value)} placeholder="輸入月份" /></div>
                                                    <span className="font-bold text-xl shrink-0">月</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xl mb-2">處理方式：</p>
                                                    <RadioGroup options={['賣方移除', '列冊點交', '協議補貼']} value={data.land_q7_crops_detail || ''} onChange={v => update('land_q7_crops_detail', v)} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {data.land_q7_crops_type === '其他未列項目' && <DetailInput value={data.land_q7_crops_other || ''} onChange={v => update('land_q7_crops_other', v)} placeholder="說明現況" />}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">地上定著物-建築物／工作物</p>
                            <RadioGroup 
                                options={['無', '有建築物／工作物']} 
                                value={data.land_q7_build === '無' ? '無' : (data.land_q7_build || '')} 
                                onChange={v => setData(p => ({...p, land_q7_build: v === '無' ? '無' : v}))} 
                                layout="grid" cols={2}
                            />
                            {data.land_q7_build === '有建築物／工作物' && (
                                <SubItemHighlight>
                                    <div className="space-y-6">
                                        <RadioGroup options={['有保存登記', '未保存登記', '宗教／殯葬設施', '其他未列項目']} value={data.land_q7_build_type || ''} onChange={v => update('land_q7_build_type', v)} layout="grid" cols={2} />
                                        
                                        {data.land_q7_build_type === '有保存登記' && (
                                            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                <RadioGroup options={['所有權人擁有', '出租中', '其他未列項目']} value={data.land_q7_build_ownership || ''} onChange={v => update('land_q7_build_ownership', v)} />
                                                {data.land_q7_build_ownership === '其他未列項目' && (
                                                    <div className="mt-3"><DetailInput value={data.land_q7_build_reg_detail || ''} onChange={v => update('land_q7_build_reg_detail', v)} placeholder="說明現況" /></div>
                                                )}
                                            </div>
                                        )}

                                        {data.land_q7_build_type === '未保存登記' && (
                                            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                <RadioGroup options={['擁有稅籍(有稅籍證明)', '出租中', '其他未列項目']} value={data.land_q7_build_ownership || ''} onChange={v => update('land_q7_build_ownership', v)} layout="grid" cols={1} />
                                                {data.land_q7_build_ownership === '其他未列項目' && (
                                                    <div className="mt-3"><DetailInput value={data.land_q7_build_unreg_detail || ''} onChange={v => update('land_q7_build_unreg_detail', v)} placeholder="說明現況" /></div>
                                                )}
                                            </div>
                                        )}

                                        {data.land_q7_build_type === '宗教／殯葬設施' && (
                                             <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                <RadioGroup options={['小廟', '墳墓']} value={data.land_q7_build_rel_detail || ''} onChange={v => update('land_q7_build_rel_detail', v)} />
                                             </div>
                                        )}

                                        {data.land_q7_build_type === '其他未列項目' && <DetailInput value={data.land_q7_build_other || ''} onChange={v => update('land_q7_build_other', v)} placeholder="說明現況" />}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 leading-normal">太陽能光電發電設備</p>
                            <RadioGroup 
                                options={['無', '合法設置', '私下設置']} 
                                value={data.land_q7_solar === '無' ? '無' : (data.land_q7_solar || '')} 
                                onChange={v => setData(p => ({...p, land_q7_solar: v === '無' ? '無' : v}))} 
                                layout="grid" cols={2}
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4 text-slate-800 dark:text-slate-100 leading-normal">加壓受水設備</p>
                            <div className="mb-6">
                                <InlineWarning>※本項由使用者自行管理維護，若物件型態為道路用地／公設地，確認是否為自來水公司之公共設施，或鄰地非法佔用</InlineWarning>
                            </div>
                            <RadioGroup 
                                options={['無設置', '有設置']} 
                                value={data.land_water_booster === '無設置' || data.land_water_booster === '無' ? '無設置' : (data.land_water_booster === '有設置' || data.land_water_booster === '有' ? '有設置' : '')} 
                                onChange={v => {
                                    setData(prev => ({ 
                                        ...prev, 
                                        land_water_booster: v, 
                                        land_water_booster_items: (v === '無設置' || v === '') ? [] : prev.land_water_booster_items 
                                    }));
                                }} 
                                cols={2}
                            />
                            {data.land_water_booster === '有設置' && (
                                <SubItemHighlight>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {LAND_WATER_BOOSTER_ITEMS.map(item => (
                                            <CheckBox 
                                                key={item} 
                                                checked={data.land_water_booster_items?.includes(item) || false} 
                                                label={item} 
                                                onClick={() => toggleArr('land_water_booster_items', item)} 
                                            />
                                        ))}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        {data.propertyType === '農地' && (
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-2 leading-normal">土地鋪面現況</p>
                                <div className="mb-4"><InlineWarning>※私自鋪設水泥、柏油或填土，違者將面臨罰鍰並被勒令拆除、恢復原狀（如罰鍰 6 至 30 萬元或 3 至 15 萬元不等）</InlineWarning></div>
                                <RadioGroup 
                                    options={['無', '有']} 
                                    value={data.land_q7_illegal_paving === '否' ? '無' : (data.land_q7_illegal_paving === '是' ? '有' : '')} 
                                    onChange={v => {
                                        // Fix: Use ternary to allow empty string (deselect)
                                        const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                        update('land_q7_illegal_paving', val);
                                    }} 
                                    layout="grid" cols={2}
                                />
                            </QuestionBlock>
                        )}

                        {data.propertyType === '工業地' && (
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-2 leading-normal">防火間隔與區劃現況</p>
                                <div className="mb-4"><InlineWarning>※須符合消防法規，更直接關係到這塊地能否合法進行「工廠登記」以及未來的營運安全</InlineWarning></div>
                                <RadioGroup 
                                    options={['無', '有']} 
                                    value={data.land_q7_fire_setback === '否' ? '無' : (data.land_q7_fire_setback === '是' ? '有' : '')} 
                                    onChange={v => {
                                        // Fix: Use ternary to allow empty string (deselect)
                                        const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                        update('land_q7_fire_setback', val);
                                    }} 
                                    layout="grid" cols={2}
                                />
                            </QuestionBlock>
                        )}

                        {data.propertyType === '其他(道路用地／公設地)' && (
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 leading-normal">計畫道路開闢現況</p>
                                <RadioGroup 
                                    options={['無', '有']} 
                                    value={data.land_q7_road_opened === '否' ? '無' : (data.land_q7_road_opened === '是' ? '有' : '')} 
                                    onChange={v => {
                                        // Fix: Use ternary to allow empty string (deselect)
                                        const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                        update('land_q7_road_opened', val);
                                    }} 
                                    layout="grid" cols={2}
                                />
                            </QuestionBlock>
                        )}
                    </div>
                </SurveySection>

                {/* NEW Q7 for Land */}
                <SurveySection id="section-land-q7-facilities" highlighted={highlightedField === 'section-land-q7-facilities'} title="7. 本案或周圍須注意設施">
                     <BooleanReveal label="" value={data?.land_q7_facilities === '否' ? '無' : (data?.land_q7_facilities === '是' ? '有' : '')} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(p => ({...p, land_q7_facilities: val, land_q7_facilities_items: val === '是' ? p.land_q7_facilities_items : [], land_q7_facilities_other: val === '是' ? p.land_q7_facilities_other : '' })); }} options={['無', '有']} trigger="有">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {landFacilitiesOptions.map(i => (
                                    <div key={i} className="flex flex-col">
                                        <div className="h-full">
                                            <CheckBox checked={data?.land_q7_facilities_items?.includes(i) || false} label={i} onClick={() => toggleArr('land_q7_facilities_items', i)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left">
                                <CheckBox checked={data?.land_q7_facilities_items?.includes('其他未列項目') || false} label="其他未列項目" onClick={() => toggleArr('land_q7_facilities_items', '其他未列項目')} />
                                {data?.land_q7_facilities_items?.includes('其他未列項目') && <DetailInput value={data.land_q7_facilities_other || ''} onChange={v => update('land_q7_facilities_other', v)} placeholder="說明現況" />}
                             </div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
            </StepContainer>
        );
    }
    
    if (type === 'factory') {
         // Determine simple vs complex parking
         const simpleParking = ['獨棟自建廠房', '倉儲物流廠房', '其他特殊工業設施'].includes(data.propertyType);
         
         return (
             <StepContainer title="第三步：設備現況" type={type} themeText={themeText}>
                 {/* 5. Structure */}
                 <SurveySection id="section-factory-struct" highlighted={highlightedField === 'section-factory-struct'} title="5. 廠房結構與消防安全">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">廠房規格</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                                <UnitInput unit="米" value={data.factory_height || ''} onChange={v => update('factory_height', v)} placeholder={getFactoryHeightLabel(data.propertyType)} />
                                <UnitInput unit="米" value={data.factory_column_spacing || ''} onChange={v => update('factory_column_spacing', v)} placeholder="柱距" />
                                <div className="space-y-3">
                                    <UnitInput 
                                        unit="kg/m²" 
                                        value={data.factory_floor_load || ''} 
                                        onChange={v => update('factory_floor_load', v)} 
                                        placeholder="樓板載重" 
                                        disabled={data.factory_floor_load_unknown}
                                    />
                                    <CheckBox 
                                        checked={data.factory_floor_load_unknown || false} 
                                        label="無法確認／依使照為準" 
                                        onClick={() => {
                                            const newVal = !data.factory_floor_load_unknown;
                                            setData(p => ({
                                                ...p, 
                                                factory_floor_load_unknown: newVal,
                                                factory_floor_load: newVal ? '' : p.factory_floor_load 
                                            }));
                                        }} 
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-8 space-y-4">
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 dark:text-slate-200">地坪狀況</p>
                                <RadioGroup options={FACTORY_FLOOR_OPTS} value={data.factory_floor_condition || ''} onChange={v => setData(p => ({...p, factory_floor_condition: v, factory_floor_condition_other: v === '其他未列項目' ? p.factory_floor_condition_other : ''}))} />
                                {data.factory_floor_condition === '其他未列項目' && <DetailInput value={data.factory_floor_condition_other || ''} onChange={v => update('factory_floor_condition_other', v)} placeholder="說明現況" />}
                            </div>
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">消防設施</p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {FACTORY_FIRE_OPTS.map(opt => <CheckBox key={opt} checked={data.factory_fire_safety?.includes(opt) || false} label={opt} onClick={() => toggleArr('factory_fire_safety', opt)} />)}
                            </div>
                            <div className="mt-4">
                                 <CheckBox checked={data.factory_fire_safety?.includes('其他未列項目') || false} label="其他未列項目" onClick={() => toggleArr('factory_fire_safety', '其他未列項目')} />
                                 {data.factory_fire_safety?.includes('其他未列項目') && <div className="mt-2"><DetailInput value={data.factory_fire_safety_other || ''} onChange={v => update('factory_fire_safety_other', v)} placeholder="說明現況" /></div>}
                            </div>
                        </QuestionBlock>
                    </div>
                </SurveySection>

                {/* 6. Utilities */}
                <UtilitiesSection data={data} setData={setData} title="6. 電、水與其他設施現況" type={type} id="section-factory-q6" highlightedId={highlightedField} />
                
                {/* 7. Hardware */}
                <SurveySection id="section-factory-hardware" highlighted={highlightedField === 'section-factory-hardware'} title="7. 廠房硬體設施">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">貨梯設施</p>
                            <RadioGroup options={['無', '有']} value={data.factory_elevator || ''} onChange={v => setData(p => ({...p, factory_elevator: v}))} />
                            {data.factory_elevator === '有' && (
                                <SubItemHighlight>
                                    <div className="space-y-6">
                                        <RadioGroup options={['可運作', '故障／停用']} value={data.factory_elevator_status || ''} onChange={v => update('factory_elevator_status', v)} />
                                        <div className="bg-white p-4 rounded-xl border-2 border-slate-200"><CheckBox checked={data.factory_elevator_separate || false} label="客貨梯分離" onClick={() => update('factory_elevator_separate', !data.factory_elevator_separate)} /></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <UnitInput unit="噸/kg" value={data.factory_elevator_capacity || ''} onChange={v => update('factory_elevator_capacity', v)} placeholder="載重" />
                                            <UnitInput unit="公分" value={data.factory_elevator_dim || ''} onChange={v => update('factory_elevator_dim', v)} placeholder="尺寸(長x寬x高)" />
                                        </div>
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>
                        
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">天車設施</p>
                            <RadioGroup options={['無', '有', '僅預留牛腿', '有軌道／樑，無主機']} value={data.factory_crane || ''} onChange={v => setData(p => ({...p, factory_crane: v}))} layout="grid" cols={2} />
                            {data.factory_crane === '有' && (
                                <SubItemHighlight>
                                    <div className="space-y-6">
                                        <RadioGroup options={['可運作', '故障／停用']} value={data.factory_crane_status || ''} onChange={v => update('factory_crane_status', v)} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <UnitInput unit="噸" value={data.factory_crane_tonnage || ''} onChange={v => update('factory_crane_tonnage', v)} placeholder="噸數" />
                                            <UnitInput unit="台" value={data.factory_crane_quantity || ''} onChange={v => update('factory_crane_quantity', v)} placeholder="數量" />
                                        </div>
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">廢水／廢氣排放</p>
                            <RadioGroup options={FACTORY_WASTE_OPTS} value={data.factory_waste || ''} onChange={v => update('factory_waste', v)} layout="grid" cols={1} />
                            {data.factory_waste === '其他未列項目' && <SubItemHighlight><DetailInput value={data.factory_waste_desc || ''} onChange={v => update('factory_waste_desc', v)} placeholder="說明現況" /></SubItemHighlight>}
                        </QuestionBlock>
                    </div>
                </SurveySection>
                
                {/* 8. Logistics */}
                <SurveySection id="section-factory-logistics" highlighted={highlightedField === 'section-factory-logistics'} title="8. 物流動線">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">卸貨碼頭</p>
                            <RadioGroup options={FACTORY_DOCK_OPTS} value={data.factory_loading_dock || ''} onChange={v => update('factory_loading_dock', v)} layout="grid" cols={1} />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">大車進出</p>
                            <RadioGroup options={FACTORY_TRUCK_OPTS} value={data.factory_truck_access || ''} onChange={v => update('factory_truck_access', v)} layout="grid" cols={2} />
                            <div className="mt-4">
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4 dark:text-slate-200">迴轉空間／緩衝區</p>
                                <DetailInput value={data.factory_truck_buffer || ''} onChange={v => update('factory_truck_buffer', v)} placeholder="說明狀況..." />
                            </div>
                        </QuestionBlock>
                    </div>
                </SurveySection>

                {/* 9. Parking */}
                {simpleParking ? (
                    <SurveySection id="section-factory-parking" highlighted={highlightedField === 'section-factory-parking'} title="9. 車位資訊">
                         <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4">停車資訊說明</p>
                            <DetailInput value={data.factory_parking_desc || ''} onChange={v => update('factory_parking_desc', v)} placeholder="如：門口可停3台車" />
                         </QuestionBlock>
                    </SurveySection>
                ) : (
                    <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={9} ids={{ main: 'section-factory-parking', abnormal: 'section-factory-parking-abn', supplement: 'section-factory-parking-sup' }} highlightedId={highlightedField} includeExtras={true} isFactory={true} />
                )}

                {/* 10. Facilities (Similar to House Q9) */}
                <SurveySection id="section-factory-q10" highlighted={highlightedField === 'section-factory-q10'} title="10. 本案或本社區須注意的設施">
                     <BooleanReveal label="" value={data?.q9_hasIssue === '否' ? '無' : (data?.q9_hasIssue === '是' ? '有' : '')} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(p => ({...p, q9_hasIssue: val, q9_items: val === '是' ? p.q9_items : [], q9_hasOther: val === '是' ? p.q9_hasOther : false, q9_otherDesc: val === '是' ? p.q9_otherDesc : '' })); }} options={['無', '有']} trigger="有">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {(isGroupA ? FACILITIES_GROUP_A : FACILITY_OPTIONS).map(i => (
                                    <div key={i} className={`flex flex-col ${(i === '太陽能光電發電設備' || i === '加壓受水設備') && data?.q9_items?.includes(i) ? 'col-span-1 md:col-span-2' : ''}`}>
                                        <div className="h-full">
                                            <CheckBox checked={data?.q9_items?.includes(i) || false} label={i} onClick={() => toggleArr('q9_items', i)} />
                                        </div>
                                        {i === '太陽能光電發電設備' && data?.q9_items?.includes(i) && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                <SubItemHighlight>
                                                    <p className="font-bold text-xl text-slate-700 mb-3 dark:text-slate-200">
                                                        {['透天獨棟廠房', '倉儲物流廠房'].includes(data.propertyType) ? '設置現況：' : '維護方式：'}
                                                    </p>
                                                    <RadioGroup 
                                                        options={['透天獨棟廠房', '倉儲物流廠房'].includes(data.propertyType) ? ['合法設置', '私下設置'] : ['管委會維護', '全體住戶維護']} 
                                                        value={data.q9_solar_maintenance || ''} 
                                                        onChange={v => update('q9_solar_maintenance', v)} 
                                                    />
                                                </SubItemHighlight>
                                            </div>
                                        )}
                                        {i === '加壓受水設備' && data?.q9_items?.includes(i) && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                <SubItemHighlight>
                                                    <div className="mb-4">
                                                        <div className="w-full py-4 px-5 md:py-5 md:px-6 bg-[#FDE047] rounded-xl md:rounded-2xl flex items-start gap-3 shadow-sm dark:bg-yellow-900/40">
                                                            <p className="text-xl md:text-2xl text-red-700 font-bold leading-normal dark:text-red-300 w-full text-left">
                                                                ※加壓受水設備由管委會／全體住戶共同管理維護
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-xl text-slate-700 mb-3 dark:text-slate-200">設置現況：</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {WATER_BOOSTER_ITEMS_B.map(item => (
                                                            <CheckBox 
                                                                key={item} 
                                                                checked={data.q9_water_booster_items?.includes(item) || false} 
                                                                label={item} 
                                                                onClick={() => toggleArr('q9_water_booster_items', item)} 
                                                            />
                                                        ))}
                                                    </div>
                                                </SubItemHighlight>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                             <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q9_hasOther || false} label="其他未列項目" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />{data?.q9_hasOther && <DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder={isGroupA ? "說明現況" : "如：發電機"} />}</div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
             </StepContainer>
         );
    }

    return null;
});

export const Step4 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText }) => {
    
    // Factory logic variables
    const isHiRise = (data.propertyType === "立體化廠辦大樓");
    const hideLandDetails = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "園區標準廠房（集合式／分租型）");
    const hideSoil = isHiRise;

    let accessNum = 11;
    let landQ3Num = 12;
    let landQ4Num = 13;
    let soilNum = hideLandDetails ? 12 : 14;
    let envNum = hideSoil ? 12 : (hideLandDetails ? 13 : 15);
    let noteNum = envNum + 1;
    let sigNum = noteNum + 1;

    return (
        <StepContainer title={type === 'land' ? '第四步：環境／其他' : '第四步：外觀／環境'} type={type} themeText={themeText}>
            {/* Access Section */}
            <BuildingLandAccessSection 
                data={data} setData={setData} update={update}
                prefix={type === 'house' ? 'q14' : 'land_q2'} 
                title={type === 'house' ? "11. 進出通行與臨路現況" : (type === 'land' ? "8. 進出通行與臨路現況" : `${accessNum}. 廠房進出通行與臨路的現況`)}
                id={type === 'house' ? "section-q14" : "section-land-q2"}
                highlightedId={highlightedField}
                type={type}
            />

            {/* Factory Land Details (Q3/Q4) */}
            {type === 'factory' && !hideLandDetails && (
                 <LandQuestionsGroup 
                    data={data} setData={setData} update={update}
                    titles={{ q3: `${landQ3Num}. 土地鑑界與界標現況／產權與使用糾紛現況`, q4: `${landQ4Num}. 土地徵收與保留地現況／重劃與區段徵收現況` }}
                    ids={{ q3: "section-land-q3", q4: "section-land-q4" }}
                    highlightedId={highlightedField}
                    hideQ2={true}
                 />
            )}

            {/* Soil */}
            {(type === 'land' || (type === 'factory' && !hideSoil)) && (
                 <SurveySection id="section-soil" highlighted={highlightedField === 'section-soil'} title={type === 'land' ? "9. 土壤與地下埋設物" : `${soilNum}. 土壤與地下埋設物`}> 
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6 dark:text-slate-200">土壤汙染與地下掩埋物現況</p>
                        <RadioGroup 
                            options={['無', '有', '不確定', '待查證']} 
                            value={data.soil_q1_status || ''} 
                            onChange={v => update('soil_q1_status', v)} 
                            layout="grid" cols={2}
                        />
                        {data.soil_q1_status === '有' && <SubItemHighlight><DetailInput value={data.soil_q1_desc || ''} onChange={v => update('soil_q1_desc', v)} placeholder="說明現況" /></SubItemHighlight>}
                    </QuestionBlock>
                 </SurveySection>
            )}

            {/* Environment */}
            <EnvironmentSection 
                data={data} update={update} toggleArr={toggleArr} id="section-q16" 
                title={type === 'house' ? "12. 重要環境設施" : (type === 'land' ? "10. 重要環境設施" : `${envNum}. 重要環境設施`)} 
                highlightedId={highlightedField} 
                warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
            />

            {/* Notes */}
            <NotesSection 
                data={data} setData={setData} update={update} id="section-q17" 
                title={type === 'house' ? "13. 本案或本社區須注意的事項" : (type === 'land' ? "11. 本案或周圍須注意的事項" : `${noteNum}. 本案或本社區須注意的事項`)} 
                highlightedId={highlightedField} type={type}
                warningText={
                    type === 'house' ? "※身故事件、氯離子過高、海砂屋、危險建築、新聞事件、糾紛等" :
                    (type === 'land' ? "※前身為亂葬崗、環保議題、新聞事件、開發現況等" :
                    "※危險建築、新聞事件、糾紛等")
                }
            />

            {/* Signature */}
            <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title={type === 'house' ? "14. 調查人員簽章" : (type === 'land' ? "12. 調查人員簽章" : `${sigNum}. 調查人員簽章`)}>
                <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
            </SurveySection>
        </StepContainer>
    );
});
