import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SurveyData, SurveyType } from '../types';
import { 
    EXT_LIST, LEAK_LOCATIONS, STRUCTURAL_ISSUES, UTILITY_ISSUES, FACILITY_OPTIONS, 
    ACCESS_SUB_OPTIONS, ACCESS_SUB_OPTIONS_LAND, ACCESS_SUB_OPTIONS_PARKING, ACCESS_SUB_OPTIONS_FACTORY, 
    PROPERTY_TYPE_OPTIONS, FACTORY_FLOOR_OPTS, FACTORY_FIRE_OPTS, FACTORY_WASTE_OPTS, FACTORY_DOCK_OPTS, FACTORY_TRUCK_OPTS,
    STAIR_ISSUES, HOUSE_PROPERTY_TYPE_OPTIONS
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
    if (pType === "立體化廠辦大樓" || pType === "標準廠房(工業園區內)") return "樑下淨高 / 樓層高度";
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

export const Step1: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText, themeBorder }) => (
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
            <div className="space-y-3"><label className="block text-slate-800 font-black mb-2 text-[1.5rem] md:text-[1.75rem] text-left">填寫日期</label><div className="mt-1"><ROCDatePicker value={data?.fillDate || ''} onChange={(d) => update('fillDate', d)} /></div></div>
            <FormInput id="field-address" label={type === 'land' ? '坐落位置' : (type === 'parking' ? '標的位置' : '標的地址')} value={data?.address || ''} onChange={v => update('address', v)} placeholder={type === 'land' ? "輸入坐落位置或相關位置" : "輸入地址/位置"} highlighted={highlightedField === 'field-address'} />
        </div>
        <SurveySection id="section-access" highlighted={highlightedField === 'section-access'} title={type === 'factory' || type === 'house' ? "本物件型態與現況" : "本物件現況"} className={themeBorder}>
            {type === 'factory' && (
                <div id="section-propertyType" className={`flex flex-col gap-6 mb-8 border-b-2 border-slate-100 pb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'ring-4 ring-yellow-400 bg-yellow-50 transition-all duration-500' : 'transition-all duration-500'}`}>
                    <RadioGroup options={PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v, propertyTypeOther: v === '其他' ? prev.propertyTypeOther : '' })); }} />
                    {data?.propertyType === '其他' && (<SubItemHighlight><DetailInput value={data.propertyTypeOther || ''} onChange={v => update('propertyTypeOther', v)} placeholder="請說明物件型態" /></SubItemHighlight>)}
                </div>
            )}
            {type === 'house' && (
                 <div id="section-propertyType" className={`flex flex-col gap-6 mb-8 border-b-2 border-slate-100 pb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'ring-4 ring-yellow-400 bg-yellow-50 transition-all duration-500' : 'transition-all duration-500'}`}>
                    <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 text-left">本物件型態</p>
                    <RadioGroup options={HOUSE_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v })); }} />
                </div>
            )}
            <BooleanReveal 
                label={type === 'house' ? "本物件現況" : ""}
                value={data?.access || ''}
                onChange={(v) => { setData(prev => ({ ...prev, access: v, accessType: v === '不可進入' ? prev.accessType : [], accessOther: v === '不可進入' ? prev.accessOther : '' })); }}
                options={['可進入', '不可進入']}
                trigger="不可進入"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-6 place-items-stretch">{(type === 'land' ? ACCESS_SUB_OPTIONS_LAND : (type === 'parking' ? ACCESS_SUB_OPTIONS_PARKING : (type === 'factory' ? ACCESS_SUB_OPTIONS_FACTORY : ACCESS_SUB_OPTIONS))).map(opt => (<CheckBox key={opt} checked={data?.accessType?.includes(opt) || false} label={opt} onClick={() => toggleArr('accessType', opt)} />))}</div>
                {data?.accessType?.includes('其他') && (<div className="space-y-4 w-full"><input type="text" className="full-width-input !mt-0" value={data?.accessOther || ''} onChange={v => update('accessOther', v.target.value)} placeholder="請說明現況" autoComplete="off" /></div>)}
                {type !== 'parking' && <div className="mt-8"><InlineWarning>{type === 'land' ? '若為上述情況，建議待找可進行調查時間點時再進行完整調查' : '若為上述情況，建議待整屋搬空/清空後再進行完整調查'}</InlineWarning></div>}
            </BooleanReveal>
        </SurveySection>
    </StepContainer>
);

export const Step2: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText, parkingLogic }) => {
    return (
        <StepContainer title={type === 'land' ? '第二步：使用現況-1' : (type === 'parking' ? '第二步：車位資訊與現況' : '第二步：內部情況')} type={type} themeText={themeText}>
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
                    <UtilitiesSection data={data} setData={setData} title="1. 電、水與其他設施使用情況" type={type} id="section-land-q1" highlightedId={highlightedField} />
                    <LandQuestionsGroup 
                        data={data} setData={setData} update={update}
                        // Q2 moved to Step 4. Q3->Q2, Q4->Q3.
                        titles={{ q2: '', q3: '2. 曾在兩年內進行土地鑑界/目前是否有糾紛？', q4: '3. 徵收地預定地/重測區域範圍內？' }}
                        ids={{ q2: 'section-land-q2-hidden', q3: 'section-land-q3', q4: 'section-land-q4' }}
                        highlightedId={highlightedField}
                        hideQ2={true}
                    />
                    {/* Q5 -> Q4 */}
                    <SurveySection id="section-land-q5" highlighted={highlightedField === 'section-land-q5'} title="4. 被越界占用/占用鄰地情況？">
                        <div className="space-y-8">
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">本案是否有被 <span className="text-red-600 text-2xl md:text-3xl font-black">[他人]</span> 越界占用？</p>
                                <AccordionRadio options={['否', '是']} value={data?.land_q5_encroached || ''} onChange={v => { setData(prev => ({...prev, land_q5_encroached: v, land_q5_encroached_desc: v === '否' ? '' : prev.land_q5_encroached_desc })); }} renderDetail={opt => (opt === '是' ? <SubItemHighlight><DetailInput value={data.land_q5_encroached_desc || ''} onChange={v => update('land_q5_encroached_desc', v)} placeholder="如：鄰居圍牆占用" /></SubItemHighlight> : null)} />
                            </QuestionBlock>
                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">本案是否有 <span className="text-red-600 text-2xl md:text-3xl font-black">[占用他人]</span> 鄰地情況？</p>
                                <AccordionRadio options={['否', '是']} value={data?.land_q5_encroaching || ''} onChange={v => { setData(prev => ({...prev, land_q5_encroaching: v, land_q5_encroaching_desc: v === '否' ? '' : prev.land_q5_encroaching_desc })); }} renderDetail={opt => (opt === '是' ? <SubItemHighlight><DetailInput value={data.land_q5_encroaching_desc || ''} onChange={v => update('land_q5_encroaching_desc', v)} placeholder="如：增建占用水利地" /></SubItemHighlight> : null)} />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                </div>
            )}
            {(type === 'house' || type === 'factory') && (
                <div className="space-y-8 md:space-y-12">
                    <SurveySection id="section-q1" highlighted={highlightedField === 'section-q1'} title="1. 增建情況與占用/被占用情況">
                        <div className="space-y-8 md:space-y-10 pl-0 md:pl-2">
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">是否有增建情況 (含違建)？</p>
                                        <InlineWarning>※如有增建請繪製格局圖時，標示增建情況及位置</InlineWarning>
                                    </>
                                }
                                value={data?.q1_hasExt || ''}
                                onChange={(v) => { setData(prev => ({ ...prev, q1_hasExt: v, q1_items: v === '是' ? prev.q1_items : [], q1_basementPartition: v === '是' ? prev.q1_basementPartition : false, q1_hasOther: v === '是' ? prev.q1_hasOther : false, q1_other: v === '是' ? prev.q1_other : '' })); }}
                            >
                                <div className="space-y-6 md:space-y-8 pt-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{EXT_LIST.map(i => (<div key={i} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 hover:border-slate-300 transition-colors"><CheckBox checked={data?.q1_items?.includes(i) || false} label={i} onClick={() => toggleArr('q1_items', i)} />{i === "地下室增建" && data?.q1_items?.includes("地下室增建") && (<div className="mt-4 text-left"><CheckBox checked={data?.q1_basementPartition || false} label="內含隔間" onClick={() => update('q1_basementPartition', !data.q1_basementPartition)} /></div>)}</div>))}</div>
                                    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q1_hasOther || false} label="其他" onClick={() => update('q1_hasOther', !data.q1_hasOther)} />{data?.q1_hasOther && <DetailInput value={data.q1_other || ''} onChange={v => update('q1_other', v)} placeholder="如：頂樓加蓋、露台外推" />}</div>
                                </div>
                            </BooleanReveal>

                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 leading-snug">建物或增建部分，是否有占用</p>
                                <div className="mt-4 mb-6"><InlineWarning>※如鄰地、道路用地、他戶空間</InlineWarning></div>
                                <p className="text-lg md:text-xl font-bold text-slate-600 mb-4">建物或增建部分是否有 <span className="text-red-600 text-2xl md:text-3xl font-black">[占用他人]</span> 鄰地、道路用地？</p>
                                <RadioGroup options={['否', '疑似', '是']} value={data?.q2_hasOccupancy || ''} onChange={(v) => { setData(prev => ({ ...prev, q2_hasOccupancy: v, q2_desc: v === '否' ? '' : prev.q2_desc })); }} cols={3} layout="grid" />
                                {data?.q2_hasOccupancy !== '' && data?.q2_hasOccupancy !== '否' && <SubItemHighlight><DetailInput value={data.q2_desc || ''} onChange={v => update('q2_desc', v)} placeholder="如：占用鄰地約2坪" /></SubItemHighlight>}
                            </QuestionBlock>

                            <QuestionBlock>
                                <p className="text-lg md:text-xl font-bold text-slate-600 mb-4">是否有 <span className="text-red-600 text-2xl md:text-3xl font-black">「他戶建物」</span> 占用 <span className="text-sky-600 text-2xl md:text-3xl font-black">「本案」</span> 之土地/本戶空間？</p>
                                <RadioGroup options={['否', '疑似', '是']} value={data?.q2_other_occupancy || ''} onChange={(v) => { setData(prev => ({ ...prev, q2_other_occupancy: v, q2_other_occupancy_desc: v === '否' ? '' : prev.q2_other_occupancy_desc })); }} cols={3} layout="grid" />{(data?.q2_other_occupancy === '是' || data?.q2_other_occupancy === '疑似') && <SubItemHighlight><DetailInput value={data.q2_other_occupancy_desc || ''} onChange={v => update('q2_other_occupancy_desc', v)} placeholder="如：隔壁冷氣室外機占用本戶外牆" /></SubItemHighlight>}
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    
                    <SurveySection id="section-q6" highlighted={highlightedField === 'section-q6'} title={<p className="text-[1.75rem] md:text-[2rem] font-black text-slate-800 leading-snug text-left">{type === 'factory' ? '2. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？' : '2. 建物測量成果圖是否與現場長寬不符？建物面積是否有明顯短少之情況？'}</p>}>
                        <InlineWarning>※可簡易測量最長/短/寬/窄之距離 (因牆面厚度，測量的長/寬，與建物成果圖尺寸落差 30 公分內為合理範圍內)</InlineWarning><RadioGroup options={['相符 (無明顯差異)', '無法測量/其他', '不符 (有明顯差異)']} value={data?.q6_hasIssue || ''} onChange={(v) => { setData(prev => ({ ...prev, q6_hasIssue: v, q6_desc: (v === '相符 (無明顯差異)') ? '' : prev.q6_desc })); }} cols={3} layout="grid" />{(data?.q6_hasIssue === '不符 (有明顯差異)' || data?.q6_hasIssue === '無法測量/其他') && (<SubItemHighlight><DetailInput value={data.q6_desc || ''} onChange={v => update('q6_desc', v)} placeholder="請說明情況" /></SubItemHighlight>)}
                    </SurveySection>

                    <SurveySection id="section-q3" highlighted={highlightedField === 'section-q3'} title={type === 'factory' ? '3. 是否有滲漏水、壁癌等情況？' : '3. 是否有滲漏水、壁癌等情況？'} className="border-red-400 ring-4 ring-red-50">
                        <InlineWarning>※請特別檢查窗框角落、陽台天花板與頂樓狀況</InlineWarning>
                        <RadioGroup 
                            options={['否', '全屋天花板包覆', '是']} 
                            value={data.q3_ceilingWrapped ? '全屋天花板包覆' : (data?.q3_hasLeak || '')} 
                            onChange={(v) => { 
                                if (v === '全屋天花板包覆') {
                                    setData(prev => ({ ...prev, q3_hasLeak: '是', q3_leakType: '全屋天花板包覆', q3_ceilingWrapped: true, q3_locations: [], q3_hasOther: false, q3_other: '', q3_suspected: false, q3_suspectedDesc: '' })); 
                                } else {
                                    setData(prev => ({ ...prev, q3_hasLeak: v, q3_leakType: v === '是' ? prev.q3_leakType : '', q3_ceilingWrapped: false, q3_locations: v === '是' ? prev.q3_locations : [], q3_hasOther: v === '是' ? prev.q3_hasOther : false, q3_other: v === '是' ? prev.q3_other : '', q3_suspected: v === '是' ? prev.q3_suspected : false, q3_suspectedDesc: v === '是' ? prev.q3_suspectedDesc : '' })); 
                                }
                            }} 
                            cols={3}
                            layout="grid"
                        />
                        {data?.q3_hasLeak === '是' && !data.q3_ceilingWrapped && (
                            <SubItemHighlight>
                                <div className="space-y-6 md:space-y-8">
                                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200">
                                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">狀況類別 (請確認現場狀況)</p>
                                        <RadioGroup 
                                            options={['滲漏水', '壁癌', '兩者皆有']} 
                                            value={data.q3_leakType === '全屋天花板包覆' ? '' : (data.q3_leakType || '')} 
                                            onChange={v => setData(prev => ({ ...prev, q3_leakType: v }))} 
                                            cols={3} 
                                            layout="grid" 
                                        />
                                    </div>
                                    
                                    {(data.q3_leakType && data.q3_leakType !== '全屋天花板包覆') && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6 md:space-y-8">
                                            <div>
                                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6">發生位置：</p>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{LEAK_LOCATIONS.map(i => <CheckBox key={i} checked={data?.q3_locations?.includes(i) || false} label={i} onClick={() => toggleArr('q3_locations', i)} />)}</div>
                                            </div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 space-y-4 text-left"><CheckBox checked={data?.q3_hasOther || false} label="其他" onClick={() => update('q3_hasOther', !data.q3_hasOther)} />{data?.q3_hasOther && <DetailInput value={data.q3_other || ''} onChange={v => update('q3_other', v)} placeholder="請說明位置與情況" />}</div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 space-y-4 text-left"><CheckBox checked={data?.q3_suspected || false} label={data.q3_leakType === '滲漏水' ? "疑似有滲漏水，位置說明：" : (data.q3_leakType === '壁癌' ? "疑似有壁癌，位置說明：" : "疑似有滲漏水、壁癌，位置說明：")} onClick={() => update('q3_suspected', !data.q3_suspected)} />{data?.q3_suspected && <DetailInput value={data.q3_suspectedDesc || ''} onChange={v => update('q3_suspectedDesc', v)} placeholder="如：牆面變色、油漆剝落" />}</div>
                                        </div>
                                    )}
                                </div>
                            </SubItemHighlight>
                        )}
                        
                        {/* REPAIR HISTORY - SEPARATED LOGIC */}
                        <div className="mt-8 pt-6 border-t-2 border-slate-100">
                             <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4">是否曾有滲漏水修繕紀錄？</p>
                                <RadioGroup 
                                    options={['有修繕紀錄', '無修繕紀錄']} 
                                    value={data.q3_repairHistory || ''} 
                                    onChange={v => update('q3_repairHistory', v)} 
                                />
                                {data.q3_repairHistory === '有修繕紀錄' && (
                                    <SubItemHighlight>
                                         <DetailInput value={data.q3_repairDesc || ''} onChange={v => update('q3_repairDesc', v)} placeholder="請說明修繕時間、方式或保固情形" />
                                    </SubItemHighlight>
                                )}
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    
                    <SurveySection id="section-q4" highlighted={highlightedField === 'section-q4'} title={type === 'factory' ? '4. 建物結構情況' : '4. 建物結構情況'}>
                        <div className="space-y-8 md:space-y-10">
                            <QuestionBlock>
                                <div className="mb-6">
                                    <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-1 leading-snug">結構牆面是否有結構安全之虞的瑕疵</p>
                                    <p className="text-lg text-slate-500 font-bold mb-6">(非單純壁癌或油漆剝落)</p>
                                    <InlineWarning>※可從浴廁、廚房通風孔/維修孔、輕鋼架推開檢查</InlineWarning>
                                </div>
                                <RadioGroup 
                                    options={['否', '全屋天花板包覆', '是']} 
                                    value={data.q4_ceilingWrapped ? '全屋天花板包覆' : (data?.q4_hasIssue || '')} 
                                    onChange={(v) => { 
                                        if (v === '全屋天花板包覆') {
                                            setData(prev => ({ ...prev, q4_hasIssue: '是', q4_ceilingWrapped: true, q4_items: [], q4_hasOther: false, q4_otherDesc: '', q4_suspected: false, q4_suspectedDesc: '' })); 
                                        } else {
                                            setData(prev => ({ ...prev, q4_hasIssue: v, q4_ceilingWrapped: false, q4_items: v === '是' ? prev.q4_items : [], q4_hasOther: v === '是' ? prev.q4_hasOther : false, q4_otherDesc: v === '是' ? prev.q4_otherDesc : '', q4_suspected: v === '是' ? prev.q4_suspected : false, q4_suspectedDesc: v === '是' ? prev.q4_suspectedDesc : '' })); 
                                        }
                                    }}
                                    cols={3}
                                    layout="grid"
                                />
                                {data?.q4_hasIssue === '是' && !data.q4_ceilingWrapped && (
                                    <SubItemHighlight>
                                        <div className="space-y-8 pt-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{STRUCTURAL_ISSUES.map(i => <CheckBox key={i} checked={data?.q4_items?.includes(i) || false} label={i} onClick={() => toggleArr('q4_items', i)} />)}</div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_hasOther || false} label="其他" onClick={() => update('q4_hasOther', !data.q4_hasOther)} />{data?.q4_hasOther && <DetailInput value={data.q4_otherDesc || ''} onChange={v => update('q4_otherDesc', v)} placeholder="請說明情況" />}</div>
                                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q4_suspected || false} label="疑似須注意" onClick={() => update('q4_suspected', !data.q4_suspected)} />{data?.q4_suspected && <DetailInput value={data.q4_suspectedDesc || ''} onChange={v => update('q4_suspectedDesc', v)} placeholder="請說明位置與情況" />}</div>
                                        </div>
                                    </SubItemHighlight>
                                )}
                            </QuestionBlock>

                            <QuestionBlock>
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-2">是否有 <span className="text-red-600">目視有明顯傾斜</span> 情況？</p>
                                <div className="mb-4"><InlineWarning>※僅依目視觀察，精確數據須由專業技師鑑定</InlineWarning></div>
                                <RadioGroup options={['否', '疑似', '是']} value={data?.q5_hasTilt || ''} onChange={(v) => { setData(prev => ({ ...prev, q5_hasTilt: v, q5_desc: v === '是' ? prev.q5_desc : '', q5_suspectedDesc: v === '疑似' ? prev.q5_suspectedDesc : '' })); }} cols={3} layout="grid" />
                                {data?.q5_hasTilt === '是' && <SubItemHighlight><DetailInput value={data.q5_desc || ''} onChange={v => update('q5_desc', v)} placeholder="如：經單位檢測提供報告書" /></SubItemHighlight>}
                                {data?.q5_hasTilt === '疑似' && <SubItemHighlight><DetailInput value={data.q5_suspectedDesc || ''} onChange={v => update('q5_suspectedDesc', v)} placeholder="如：目視有傾斜感" /></SubItemHighlight>}
                            </QuestionBlock>
                        </div>
                    </SurveySection>

                    {type === 'house' && (
                        <SurveySection id="section-q7" highlighted={highlightedField === 'section-q7'} title="5. 電、水與瓦斯使用情況">
                            <QuestionBlock className="mb-8">
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4">瓦斯供應類型</p>
                                <RadioGroup options={['天然瓦斯', '桶裝瓦斯', '無']} value={data.q7_gasType || ''} onChange={v => update('q7_gasType', v)} cols={3} layout="grid" />
                            </QuestionBlock>

                            <QuestionBlock className="mb-8">
                                <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-4">是否設置用戶加壓受水設備</p>
                                <RadioGroup options={['無', '有', '其他']} value={data.water_booster || ''} onChange={v => setData(prev => ({...prev, water_booster: v, water_booster_desc: v === '其他' ? prev.water_booster_desc : ''}))} cols={3} layout="grid" />
                                {data.water_booster === '其他' && <SubItemHighlight><DetailInput value={data.water_booster_desc || ''} onChange={v => update('water_booster_desc', v)} placeholder="請說明" /></SubItemHighlight>}
                            </QuestionBlock>

                            <BooleanReveal 
                                label="設備是否異常"
                                value={data?.q7_hasIssue === '否' ? '正常 (無異常)' : (data?.q7_hasIssue === '是' ? '異常 (須說明)' : '')}
                                onChange={(v) => { const val = v === '正常 (無異常)' ? '否' : '是'; setData(prev => ({ ...prev, q7_hasIssue: val, q7_items: val === '是' ? prev.q7_items : [], q7_hasOther: val === '是' ? prev.q7_hasOther : false, q7_otherDesc: val === '是' ? prev.q7_otherDesc : '' })); }}
                                options={['正常 (無異常)', '異常 (須說明)']}
                                trigger="異常 (須說明)"
                            >
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{UTILITY_ISSUES.map(i => <CheckBox key={i} checked={data?.q7_items?.includes(i) || false} label={i} onClick={() => toggleArr('q7_items', i)} />)}</div>
                                    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q7_hasOther || false} label="其他" onClick={() => update('q7_hasOther', !data.q7_hasOther)} />{data?.q7_hasOther && <DetailInput value={data.q7_otherDesc || ''} onChange={v => update('q7_otherDesc', v)} placeholder="如：瓦斯管線老舊" />}</div>
                                </div>
                            </BooleanReveal>
                        </SurveySection>
                    )}
                </div>
            )}
        </StepContainer>
    );
};

export const Step3: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText, themeBorder, parkingLogic }) => {
    if (type === 'parking') {
        return (
            <StepContainer title="第三步：環境與其他" type={type} themeText={themeText}>
                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} id="section-q16" title="2. 重要環境設施" highlightedId={highlightedField} 
                    warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                />
                <NotesSection 
                    data={data} setData={setData} update={update} id="section-q17" title="3. 本案或本社區是否有須注意的事項？" highlightedId={highlightedField} type={type}
                    warningText="※車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等" 
                />
                
                {/* Added Signature Section for Parking */}
                <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title="4. 調查人員簽章">
                    <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
                </SurveySection>
            </StepContainer>
        );
    }
    
    if (type === 'house') {
        return (
             <StepContainer title="第三步：公設/車位" type={type} themeText={themeText}>
                {/* Public Facilities (Moved to Top) */}
                <SurveySection id="section-publicFacilities" highlighted={highlightedField === 'section-publicFacilities'} title="大樓/社區公共設施 (可否進入/使用)">
                    <RadioGroup options={['無公共設施', '無法進入', '有公共設施']} value={data?.publicFacilities || ''} onChange={(v) => { setData(prev => ({ ...prev, publicFacilities: v, publicFacilitiesReason: v === '無法進入' ? prev.publicFacilitiesReason : '' })); }} cols={3} layout="grid" />{data?.publicFacilities === '無法進入' && <SubItemHighlight><DetailInput value={data.publicFacilitiesReason || ''} onChange={v => update('publicFacilitiesReason', v)} placeholder="如：需磁扣感應" /></SubItemHighlight>}
                </SurveySection>

                {/* Q6 - Stairs (Moved from Q8 logic and renamed) */}
                <SurveySection id="section-q8" highlighted={highlightedField === 'section-q8'} title="6. 電(樓)梯間、公共地下室等有無異常">
                     <BooleanReveal 
                        label="" 
                        value={data?.q8_stairIssue === '否' ? '否' : (data?.q8_stairIssue === '是' ? '是' : '')} 
                        onChange={v => { setData(p => ({...p, q8_stairIssue: v, q8_stairItems: v === '否' ? [] : p.q8_stairItems, q8_stairOther: v === '否' ? '' : p.q8_stairOther })); }} 
                        options={['否', '是']} 
                        trigger="是"
                     >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {STAIR_ISSUES.map(i => <CheckBox key={i} checked={data?.q8_stairItems?.includes(i) || false} label={i} onClick={() => toggleArr('q8_stairItems', i)} />)}
                            </div>
                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left">
                                <CheckBox checked={data?.q8_stairItems?.includes('其他') || false} label="其他" onClick={() => toggleArr('q8_stairItems', '其他')} />
                                {data?.q8_stairItems?.includes('其他') && <DetailInput value={data.q8_stairOther || ''} onChange={v => update('q8_stairOther', v)} placeholder="請說明情況" />}
                            </div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
                {/* Q7 */}
                <SurveySection id="section-q9" highlighted={highlightedField === 'section-q9'} title="7. 本案或本社區是否有須注意的設施？">
                     <BooleanReveal label="" value={data?.q9_hasIssue === '否' ? '否' : (data?.q9_hasIssue === '是' ? '是' : '')} onChange={v => { const val = v; setData(p => ({...p, q9_hasIssue: val, q9_items: val === '是' ? p.q9_items : [], q9_hasOther: val === '是' ? p.q9_hasOther : false, q9_otherDesc: val === '是' ? p.q9_otherDesc : '' })); }} options={['否', '是']} trigger="是">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {FACILITY_OPTIONS.map(i => (
                                    <div key={i} className={`flex flex-col ${i === '太陽能光電發電設備' && data?.q9_items?.includes(i) ? 'col-span-1 md:col-span-2' : ''}`}>
                                        <div className="h-full">
                                            <CheckBox checked={data?.q9_items?.includes(i) || false} label={i} onClick={() => toggleArr('q9_items', i)} />
                                        </div>
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
                                    </div>
                                ))}
                            </div>
                             <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q9_hasOther || false} label="其他" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />{data?.q9_hasOther && <DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder="如：發電機" />}</div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
                
                {/* Parking */}
                <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={8} ids={{ main: 'section-house-parking-main', abnormal: 'section-house-parking-abnormal', supplement: 'section-house-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} />
             </StepContainer>
        );
    }

    if (type === 'land') {
        return (
            <StepContainer title="第三步：使用現況-2" type={type} themeText={themeText}>
                <SurveySection id="section-land-q6" highlighted={highlightedField === 'section-land-q6'} title="5. 目前是否有禁建、限建的情況？">
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6">目前是否有禁建、限建的情況？</p>
                        <RadioGroup 
                            options={['無', '是']} 
                            value={data.land_q6_limit === '否' ? '無' : (data.land_q6_limit === '是' ? '是' : '')} 
                            onChange={v => setData(p => ({...p, land_q6_limit: v === '無' ? '否' : '是', land_q6_limit_desc: v === '無' ? '' : p.land_q6_limit_desc}))} 
                            layout="grid"
                            cols={2}
                        />
                        {data.land_q6_limit === '是' && (
                            <SubItemHighlight>
                                <DetailInput value={data.land_q6_limit_desc || ''} onChange={v => update('land_q6_limit_desc', v)} placeholder="請說明情況" />
                            </SubItemHighlight>
                        )}
                    </QuestionBlock>
                </SurveySection>

                <SurveySection id="section-land-q7" highlighted={highlightedField === 'section-land-q7'} title="6. 土地使用現況與地上物">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">現況使用人</p>
                            <RadioGroup 
                                options={['無', '所有權人自用', '非所有權人使用']} 
                                value={data.land_q7_user || ''} 
                                onChange={v => setData(p => ({...p, land_q7_user: v, land_q7_user_detail: v === '非所有權人使用' ? p.land_q7_user_detail : '', land_q7_user_desc: v === '非所有權人使用' ? p.land_q7_user_desc : ''}))} 
                                layout="grid" cols={1}
                            />
                            {data.land_q7_user === '非所有權人使用' && (
                                <SubItemHighlight>
                                    <div className="space-y-4">
                                        <RadioGroup 
                                            options={['承租中', '無償借用', '被占用', '共有分管', '其他']} 
                                            value={data.land_q7_user_detail || ''} 
                                            onChange={v => {
                                                setData(prev => ({...prev, land_q7_user_detail: v, land_q7_user_desc: ''})); // Reset desc on change
                                            }} 
                                            layout="grid" cols={2}
                                        />
                                        {['承租中', '無償借用', '被占用', '其他'].includes(data.land_q7_user_detail) && (
                                            <DetailInput 
                                                value={data.land_q7_user_desc || ''} 
                                                onChange={v => update('land_q7_user_desc', v)} 
                                                placeholder={
                                                    data.land_q7_user_detail === '承租中' ? "如租金/押金、期限等" :
                                                    data.land_q7_user_detail === '無償借用' ? "如借用對象、約定事項等" :
                                                    data.land_q7_user_detail === '被占用' ? "請說明情況" :
                                                    "請說明情況"
                                                } 
                                            />
                                        )}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">地上定著物-農作物</p>
                            <RadioGroup 
                                options={['無', '有農作物/植栽']} 
                                value={data.land_q7_crops || ''} 
                                onChange={v => setData(p => ({...p, land_q7_crops: v}))} 
                            />
                            {data.land_q7_crops === '有農作物/植栽' && (
                                <SubItemHighlight>
                                    <div className="space-y-6">
                                        <RadioGroup options={['經濟作物', '景觀植栽', '雜樹/荒廢', '其他']} value={data.land_q7_crops_type || ''} onChange={v => update('land_q7_crops_type', v)} layout="grid" cols={2} />
                                        
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
                                        
                                        {data.land_q7_crops_type === '其他' && <DetailInput value={data.land_q7_crops_other || ''} onChange={v => update('land_q7_crops_other', v)} placeholder="請說明情況" />}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">地上定著物-建築物/工作物</p>
                            <RadioGroup 
                                options={['無', '有建築物/工作物']} 
                                value={data.land_q7_build || ''} 
                                onChange={v => setData(p => ({...p, land_q7_build: v}))} 
                            />
                            {data.land_q7_build === '有建築物/工作物' && (
                                <SubItemHighlight>
                                    <div className="space-y-6">
                                        <RadioGroup options={['有保存登記', '未保存登記', '宗教/殯葬設施', '其他']} value={data.land_q7_build_type || ''} onChange={v => update('land_q7_build_type', v)} layout="grid" cols={2} />
                                        
                                        {data.land_q7_build_type === '有保存登記' && (
                                            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                <RadioGroup options={['所有權人擁有', '出租中', '其他']} value={data.land_q7_build_ownership || ''} onChange={v => update('land_q7_build_ownership', v)} />
                                                {data.land_q7_build_ownership === '其他' && (
                                                    <div className="mt-3"><DetailInput value={data.land_q7_build_reg_detail || ''} onChange={v => update('land_q7_build_reg_detail', v)} placeholder="請說明現況" /></div>
                                                )}
                                            </div>
                                        )}

                                        {data.land_q7_build_type === '未保存登記' && (
                                            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                <RadioGroup options={['擁有稅籍(有稅籍證明)', '出租中', '其他']} value={data.land_q7_build_ownership || ''} onChange={v => update('land_q7_build_ownership', v)} layout="grid" cols={1} />
                                                {data.land_q7_build_ownership === '其他' && (
                                                    <div className="mt-3"><DetailInput value={data.land_q7_build_unreg_detail || ''} onChange={v => update('land_q7_build_unreg_detail', v)} placeholder="請說明現況" /></div>
                                                )}
                                            </div>
                                        )}

                                        {data.land_q7_build_type === '宗教/殯葬設施' && (
                                             <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                <RadioGroup options={['小廟', '墳墓']} value={data.land_q7_build_rel_detail || ''} onChange={v => update('land_q7_build_rel_detail', v)} />
                                             </div>
                                        )}

                                        {data.land_q7_build_type === '其他' && <DetailInput value={data.land_q7_build_other || ''} onChange={v => update('land_q7_build_other', v)} placeholder="請說明現況" />}
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black text-slate-700 mb-6">太陽能光電發電設備</p>
                            <RadioGroup 
                                options={['無', '合法設置', '私下設置']} 
                                value={data.land_q7_solar || ''} 
                                onChange={v => setData(p => ({...p, land_q7_solar: v}))} 
                            />
                        </QuestionBlock>
                    </div>
                </SurveySection>
            </StepContainer>
        );
    }

    if (type === 'factory') {
         const isHiRise = (data.propertyType === "立體化廠辦大樓"); 

         return (
             <StepContainer title="第三步：設備情況" type={type} themeText={themeText}>
                <SurveySection id="section-factory-struct" highlighted={highlightedField === 'section-factory-struct'} title="5. 廠房結構">
                    <div className="space-y-8">
                        <div className="flex gap-4 md:gap-6 flex-wrap md:flex-nowrap">
                            <UnitInput unit="米" placeholder={getFactoryHeightLabel(data.propertyType)} value={data.factory_height || ''} onChange={v => update('factory_height', v)} />
                            <UnitInput unit="米" placeholder="柱距" value={data.factory_column_spacing || ''} onChange={v => update('factory_column_spacing', v)} />
                            <UnitInput unit="kg/m²" placeholder="樓板載重" value={data.factory_floor_load || ''} onChange={v => update('factory_floor_load', v)} />
                        </div>
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">地坪狀況</p>
                            <RadioGroup options={FACTORY_FLOOR_OPTS} value={data.factory_floor_condition || ''} onChange={v => update('factory_floor_condition', v)} layout="grid" />
                            {data.factory_floor_condition === '其他' && <SubItemHighlight><DetailInput value={data.factory_floor_condition_other || ''} onChange={v => update('factory_floor_condition_other', v)} placeholder="請說明" /></SubItemHighlight>}
                        </QuestionBlock>
                        <QuestionBlock>
                             <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">消防設施</p>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {FACTORY_FIRE_OPTS.map(i => <CheckBox key={i} checked={data.factory_fire_safety?.includes(i) || false} label={i} onClick={() => toggleArr('factory_fire_safety', i)} />)}
                             </div>
                             {data.factory_fire_safety?.includes('其他') && <SubItemHighlight><DetailInput value={data.factory_fire_safety_other || ''} onChange={v => update('factory_fire_safety_other', v)} placeholder="請說明" /></SubItemHighlight>}
                        </QuestionBlock>
                    </div>
                </SurveySection>

                <UtilitiesSection data={data} setData={setData} title="6. 電、水與其他設施使用情況" type={type} id="section-factory-q6" highlightedId={highlightedField} />

                <SurveySection id="section-factory-hardware" highlighted={highlightedField === 'section-factory-hardware'} title="7. 廠房硬體設施">
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">貨梯</p>
                            <RadioGroup options={['無', '有']} value={data.factory_elevator || ''} onChange={v => setData(p => ({...p, factory_elevator: v}))} />
                            {data.factory_elevator === '有' && (
                                <SubItemHighlight>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <CheckBox checked={data.factory_elevator_working} label="可運作" onClick={() => update('factory_elevator_working', true)} />
                                            <CheckBox checked={!data.factory_elevator_working} label="故障" onClick={() => update('factory_elevator_working', false)} />
                                        </div>
                                        <CheckBox checked={data.factory_elevator_separate} label="客貨梯分離" onClick={() => update('factory_elevator_separate', !data.factory_elevator_separate)} />
                                        <div className="flex gap-4">
                                            <FormInput id="fe_cap" label="載重(噸/kg)" value={data.factory_elevator_capacity || ''} onChange={v => update('factory_elevator_capacity', v)} placeholder="如: 2噸" />
                                            <FormInput id="fe_dim" label="尺寸(長x寬x高)" value={data.factory_elevator_dim || ''} onChange={v => update('factory_elevator_dim', v)} placeholder="如: 2x2x2m" />
                                        </div>
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">天車 (吊車)</p>
                            <RadioGroup options={['無', '有', '僅預留牛腿', '有軌道/樑，無主機']} value={data.factory_crane || ''} onChange={v => setData(p => ({...p, factory_crane: v}))} layout="grid" cols={1} />
                            {data.factory_crane === '有' && (
                                <SubItemHighlight>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <CheckBox checked={data.factory_crane_working} label="可運作" onClick={() => update('factory_crane_working', true)} />
                                            <CheckBox checked={!data.factory_crane_working} label="故障" onClick={() => update('factory_crane_working', false)} />
                                        </div>
                                        <div className="flex gap-4">
                                            <FormInput id="fc_ton" label="噸數" value={data.factory_crane_tonnage || ''} onChange={v => update('factory_crane_tonnage', v)} placeholder="如: 5噸" />
                                            <FormInput id="fc_qty" label="台數" value={data.factory_crane_quantity || ''} onChange={v => update('factory_crane_quantity', v)} placeholder="如: 2台" />
                                        </div>
                                    </div>
                                </SubItemHighlight>
                            )}
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">工業排水 / 廢氣</p>
                            <RadioGroup options={FACTORY_WASTE_OPTS} value={data.factory_waste || ''} onChange={v => setData(p => ({...p, factory_waste: v}))} layout="grid" cols={1} />
                            {data.factory_waste === '其他' && <SubItemHighlight><DetailInput value={data.factory_waste_desc || ''} onChange={v => update('factory_waste_desc', v)} placeholder="請說明" /></SubItemHighlight>}
                        </QuestionBlock>
                    </div>
                </SurveySection>

                <SurveySection id="section-factory-logistics" highlighted={highlightedField === 'section-factory-logistics'} title="8. 物流動線">
                    <div className="space-y-8">
                         <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">卸貨碼頭</p>
                            <RadioGroup options={FACTORY_DOCK_OPTS} value={data.factory_loading_dock || ''} onChange={v => update('factory_loading_dock', v)} layout="grid" cols={1} />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">大車進出 (可進出之最大車輛)</p>
                            <RadioGroup options={FACTORY_TRUCK_OPTS} value={data.factory_truck_access || ''} onChange={v => update('factory_truck_access', v)} layout="grid" cols={1} />
                            <div className="mt-4">
                                <p className="font-bold text-lg mb-2">迴轉空間/緩衝區</p>
                                <DetailInput value={data.factory_truck_buffer || ''} onChange={v => update('factory_truck_buffer', v)} placeholder="如: 40呎貨櫃可迴轉" />
                            </div>
                        </QuestionBlock>
                    </div>
                </SurveySection>

                {['透天獨棟廠房', '倉儲物流廠房', '其他'].includes(data.propertyType) ? (
                     <SurveySection id="section-factory-parking" highlighted={highlightedField === 'section-factory-parking'} title="9. 車位資訊">
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-4">請描述車位情況 (空地停車/劃線車位)</p>
                            <DetailInput value={data.factory_parking_desc || ''} onChange={v => update('factory_parking_desc', v)} placeholder="如: 門口可停3台車、側院有劃線車位5格" />
                        </QuestionBlock>
                     </SurveySection>
                ) : (
                    <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={9} ids={{ main: 'section-factory-parking', abnormal: 'section-factory-parking-abnormal', supplement: 'section-factory-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} isFactory={true} />
                )}

                <SurveySection id="section-factory-q10" highlighted={highlightedField === 'section-factory-q10'} title="10. 本案或本社區是否有須注意的設施？">
                    <BooleanReveal label="" value={data?.q9_hasIssue === '否' ? '否' : (data?.q9_hasIssue === '是' ? '是' : '')} onChange={v => { const val = v; setData(p => ({...p, q9_hasIssue: val, q9_items: val === '是' ? p.q9_items : [], q9_hasOther: val === '是' ? p.q9_hasOther : false, q9_otherDesc: val === '是' ? p.q9_otherDesc : '' })); }} options={['否', '是']} trigger="是">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                {FACILITY_OPTIONS.map(i => (
                                    <div key={i} className={`flex flex-col ${i === '太陽能光電發電設備' && data?.q9_items?.includes(i) ? 'col-span-1 md:col-span-2' : ''}`}>
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
                                    </div>
                                ))}
                            </div>
                             <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200 text-left"><CheckBox checked={data?.q9_hasOther || false} label="其他" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />{data?.q9_hasOther && <DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder="如：發電機" />}</div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
             </StepContainer>
         );
    }
    return null;
};

export const Step4: React.FC<StepProps> = ({ data, setData, update, toggleArr, type, highlightedField, themeText }) => {
    
    // HOUSE
    if (type === 'house') {
        return (
            <StepContainer title="第四步：外觀/環境" type={type} themeText={themeText}>
                <BuildingLandAccessSection 
                    data={data} setData={setData} update={update} 
                    prefix="q14" 
                    title="9. 本案進出情況" 
                    id="section-q14" 
                    highlightedId={highlightedField} 
                />
                
                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} 
                    id="section-q16" 
                    title="10. 重要環境設施" 
                    highlightedId={highlightedField} 
                    warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                />

                <NotesSection 
                    data={data} setData={setData} update={update} 
                    id="section-q17" 
                    title="11. 本案或本社區是否有須注意的事項？" 
                    highlightedId={highlightedField} 
                    type={type}
                    warningText="※身故事件、氯離子過高、海砂屋、危險建築、新聞事件、糾紛等"
                />

                <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title="12. 調查人員簽章">
                    <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
                </SurveySection>
            </StepContainer>
        );
    }

    // LAND
    if (type === 'land') {
        return (
            <StepContainer title="第四步：環境/其他" type={type} themeText={themeText}>
                <BuildingLandAccessSection 
                    data={data} setData={setData} update={update} 
                    prefix="land_q2" 
                    title="7. 土地進出通行與臨路的情況？" 
                    id="section-land-q2" 
                    highlightedId={highlightedField} 
                />

                <SurveySection id="section-soil" highlighted={highlightedField === 'section-soil'} title="8. 土壤與地下埋設物">
                    <QuestionBlock>
                        <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">本案土地是否有被公告為汙染控制場址或有地下埋設物？</p>
                        <RadioGroup options={['無', '有', '不確定']} value={data.soil_q1_status || ''} onChange={v => setData(p => ({...p, soil_q1_status: v, soil_q1_desc: v === '有' ? p.soil_q1_desc : ''}))} />
                        {data.soil_q1_status === '有' && <SubItemHighlight><DetailInput value={data.soil_q1_desc || ''} onChange={v => update('soil_q1_desc', v)} placeholder="請說明情況" /></SubItemHighlight>}
                    </QuestionBlock>
                </SurveySection>

                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} 
                    id="section-q16" 
                    title="9. 重要環境設施" 
                    highlightedId={highlightedField} 
                    warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                />

                <NotesSection 
                    data={data} setData={setData} update={update} 
                    id="section-land-q8" 
                    title="10. 本案或周圍是否有須注意的事項？" 
                    highlightedId={highlightedField} 
                    type={type}
                    warningText="※前身為亂葬崗、環保事件、新聞事件、開發情況等"
                />

                <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title="11. 調查人員簽章">
                    <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
                </SurveySection>
            </StepContainer>
        );
    }

    // FACTORY
    if (type === 'factory') {
        const hideLandDetails = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "標準廠房(工業園區內)");
        const isHiRise = (data.propertyType === "立體化廠辦大樓");
        const hideSoil = isHiRise;

        // Numbering adjusted for Q10 insertion in Step 3
        let accessNum = 11;
        let landQ3Num = 12;
        let landQ4Num = 13;

        let soilNum = hideLandDetails ? 12 : 14;
        let envNum = hideSoil ? 12 : (hideLandDetails ? 13 : 15);
        let noteNum = envNum + 1;
        let sigNum = noteNum + 1;

        return (
            <StepContainer title="第四步：外觀/環境" type={type} themeText={themeText}>
                 <BuildingLandAccessSection 
                    data={data} setData={setData} update={update} 
                    prefix="land_q2" 
                    title={`${accessNum}. 廠房進出通行與臨路的情況？`}
                    id="section-land-q2" 
                    highlightedId={highlightedField} 
                />

                {!hideLandDetails && (
                    <LandQuestionsGroup 
                        data={data} setData={setData} update={update} 
                        titles={{ q2: '', q3: `${landQ3Num}. 曾在兩年內進行土地鑑界/目前是否有糾紛？`, q4: `${landQ4Num}. 徵收地預定地/重測區域範圍內？` }}
                        ids={{ q2: '', q3: 'section-land-q3', q4: 'section-land-q4' }}
                        highlightedId={highlightedField} 
                        hideQ2={true}
                    />
                )}

                {!hideSoil && (
                    <SurveySection id="section-soil" highlighted={highlightedField === 'section-soil'} title={`${soilNum}. 土壤與地下埋設物`}>
                        <QuestionBlock>
                            <p className="text-[1.5rem] md:text-[1.75rem] font-black mb-6 leading-snug">本案土地是否有被公告為汙染控制場址或有地下埋設物？</p>
                            <RadioGroup options={['無', '有', '不確定']} value={data.soil_q1_status || ''} onChange={v => setData(p => ({...p, soil_q1_status: v, soil_q1_desc: v === '有' ? p.soil_q1_desc : ''}))} />
                            {data.soil_q1_status === '有' && <SubItemHighlight><DetailInput value={data.soil_q1_desc || ''} onChange={v => update('soil_q1_desc', v)} placeholder="請說明情況" /></SubItemHighlight>}
                        </QuestionBlock>
                    </SurveySection>
                )}

                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} 
                    id="section-q16" 
                    title={`${envNum}. 重要環境設施`} 
                    highlightedId={highlightedField} 
                    warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                />

                <NotesSection 
                    data={data} setData={setData} update={update} 
                    id="section-q17" 
                    title={`${noteNum}. 本案或本區是否有特別注意的事項？`} 
                    highlightedId={highlightedField} 
                    type={type}
                    warningText="※危險建築、新聞事件、糾紛等"
                />

                <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title={`${sigNum}. 調查人員簽章`}>
                    <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
                </SurveySection>

            </StepContainer>
        );
    }

    return null;
};