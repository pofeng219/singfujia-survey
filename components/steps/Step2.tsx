import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { 
    EXT_LIST, LEAK_LOCATIONS, STRUCTURAL_ISSUES, UTILITY_ISSUES, 
    GROUP_A_TYPES, WATER_BOOSTER_ITEMS_A, GAS_SUPPLY_OPTIONS
} from '../../constants';
import { 
    CheckBox, SurveySection, SubItemHighlight, DetailInput, InlineWarning, 
    AccordionRadio, QuestionBlock, BooleanReveal, SectionStatus, ImageModal
} from '../SharedUI';
import { UtilitiesSection, ParkingSection, LandQuestionsGroup } from '../ComplexSections';
import { StepProps, StepContainer } from './StepShared';

export const Step2 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText, parkingLogic }) => {
    
    // Check if property type belongs to Group A
    const isGroupA = GROUP_A_TYPES.includes(data.propertyType);

    // --- Status Logic Helpers ---
    const [showMeasurementGuide, setShowMeasurementGuide] = useState(false);
    const [showLeakageGuide, setShowLeakageGuide] = useState(false);
    const [showLeakageGuide1, setShowLeakageGuide1] = useState(false);
    const [showStructureGuide, setShowStructureGuide] = useState(false);
    const [showStructureGuide1, setShowStructureGuide1] = useState(false);
    const [showStructureGuide2, setShowStructureGuide2] = useState(false);
    const [showTiltGuide, setShowTiltGuide] = useState(false);
    const [showOccupyGuide, setShowOccupyGuide] = useState(false);

    const getQ1Status = (): SectionStatus => {
        if (!data.q1_hasExt) return 'incomplete';
        if (data.q1_hasExt === '是') {
            const hasItems = data.q1_items && data.q1_items.length > 0;
            if (!hasItems && !data.q1_hasOther) return 'incomplete';
            if (data.q1_hasOther && !data.q1_other) return 'incomplete';
        }
        if (!data.q2_hasOccupancy) return 'incomplete';
        if (data.q2_hasOccupancy !== '否' && data.q2_hasOccupancy !== '無' && !data.q2_desc) return 'incomplete';
        if (!data.q2_other_occupancy) return 'incomplete';
        if (data.q2_other_occupancy !== '否' && data.q2_other_occupancy !== '無' && !data.q2_other_occupancy_desc) return 'incomplete';
        return 'complete';
    };

    const getQ6Status = (): SectionStatus => {
        if (!data.q6_hasIssue) return 'incomplete';
        const q6Issue = data.q6_hasIssue && data.q6_hasIssue !== '相符 (無明顯差異)' && data.q6_hasIssue !== '實測相符';
        if (q6Issue && !data.q6_desc) return 'incomplete';
        return 'complete';
    };

    const getQ3Status = (): SectionStatus => {
        if (!data.q3_hasLeak && !data.q3_ceilingWrapped) return 'incomplete';
        if (data.q3_hasLeak === '是' && !data.q3_ceilingWrapped) {
            if (!data.q3_leakType) return 'incomplete';
            if (data.q3_leakType !== '全屋天花板包覆' && data.q3_leakType !== '全屋天花板包覆（無法檢查）') {
                const hasLocations = data.q3_locations && data.q3_locations.length > 0;
                if (!hasLocations && !data.q3_hasOther && !data.q3_suspected) return 'incomplete';
                if (data.q3_hasOther && !data.q3_other) return 'incomplete';
                if (data.q3_suspected && !data.q3_suspectedDesc) return 'incomplete';
            }
            if (!data.q3_repairHistory) return 'incomplete';
        }
        if (data.q3_repairHistory === '有修繕紀錄' && !data.q3_repairDesc) return 'incomplete';
        return 'complete';
    };

    const getQ4Status = (): SectionStatus => {
        if (!data.q4_hasIssue && !data.q4_ceilingWrapped) return 'incomplete';
        if (data.q4_hasIssue === '是' && !data.q4_ceilingWrapped) {
            const hasItems = data.q4_items && data.q4_items.length > 0;
            if (!hasItems && !data.q4_hasOther && !data.q4_suspected) return 'incomplete';
            if (data.q4_hasOther && !data.q4_otherDesc) return 'incomplete';
            if (data.q4_suspected && !data.q4_suspectedDesc) return 'incomplete';
        }
        if (!data.q5_hasTilt) return 'incomplete';
        if (data.q5_hasTilt === '是' && !data.q5_desc) return 'incomplete';
        if ((data.q5_hasTilt === '待查證' || data.q5_hasTilt === '待查證（待測量）') && !data.q5_suspectedDesc) return 'incomplete';
        return 'complete';
    };

    const getQ7Status = (): SectionStatus => {
        if (!data.q7_gasType) return 'incomplete';
        if (!data.q7_hasIssue) return 'incomplete';
        if (data.q7_hasIssue === '是') {
            if ((!data.q7_items || data.q7_items.length === 0) && !data.q7_hasOther) return 'incomplete';
            if (data.q7_hasOther && !data.q7_otherDesc) return 'incomplete';
        }
        if (isGroupA) {
            if (!data.house_solar_status) return 'incomplete';
            if (!data.water_booster) return 'incomplete';
            if (data.water_booster === '其他未列項目' && !data.water_booster_desc) return 'incomplete';
            if ((data.water_booster === '有' || data.water_booster === '有設置') && (!data.water_booster_items || data.water_booster_items.length === 0)) return 'incomplete';
        }
        return 'complete';
    };

    const getLandQ1Status = (): SectionStatus => {
        if (!data.land_q1_elec) return 'incomplete';
        if (data.land_q1_elec === '是') {
             if (!data.land_q1_elec_detail) return 'incomplete';
             if (data.land_q1_elec_detail === '其他未列項目' && !data.land_q1_elec_detail_other) return 'incomplete';
        }
        if (data.land_q1_elec === '其他未列項目' && !data.land_q1_elec_other) return 'incomplete';
        if (!data.land_q1_water) return 'incomplete';
        if (data.land_q1_water === '是' && (!data.land_q1_water_cat || data.land_q1_water_cat.length === 0)) return 'incomplete';
        if (data.land_q1_water === '是') {
             if (data.land_q1_water_cat?.includes('自來水')) {
                 if (!data.land_q1_water_tap_detail) return 'incomplete';
                 if (data.land_q1_water_tap_detail === '其他未列項目' && !data.land_q1_water_tap_other) return 'incomplete';
             }
             if (data.land_q1_water_cat?.includes('地下水') && !data.land_q1_water_ground_detail) return 'incomplete';
             if (data.land_q1_water_cat?.includes('水利溝渠') && !data.land_q1_water_irr_detail) return 'incomplete';
        }
        if (data.land_q1_water === '其他未列項目' && !data.land_q1_water_other) return 'incomplete';
        if (type !== 'land' && !data.land_q1_gas) return 'incomplete';
        if (type === 'factory' && isGroupA && !data.house_solar_status) return 'incomplete';
        if (showWaterBooster && isGroupA && !data.water_booster) return 'incomplete';
        if (!data.land_q1_other_new) return 'incomplete';
        if (data.land_q1_other_new === '是' && !data.land_q1_other_desc) return 'incomplete';
        return 'complete';
    };

    const getLandQ5Status = (): SectionStatus => {
        if (!data.land_q5_encroached || !data.land_q5_encroaching) return 'incomplete';
        if (data.land_q5_encroached === '是' && !data.land_q5_encroached_desc) return 'incomplete';
        if (data.land_q5_encroaching === '是' && !data.land_q5_encroaching_desc) return 'incomplete';
        return 'complete';
    };

    const getLandQ3Status = (): SectionStatus => {
        if (!data.land_q3_survey) return 'incomplete';
        if (data.land_q3_survey === '是' && (!data.land_q3_survey_detail || !data.land_q3_survey_date)) return 'incomplete';
        if (data.land_q3_survey === '待查證' && !data.land_q3_survey_other) return 'incomplete';
        if (!data.land_q3_dispute) return 'incomplete';
        if (data.land_q3_dispute === '是' && !data.land_q3_dispute_desc) return 'incomplete';
        if (data.land_q3_dispute === '待查證' && !data.land_q3_dispute_other) return 'incomplete';
        return 'complete';
    };

    const getLandQ4Status = (): SectionStatus => {
        if (!data.land_q4_expro) return 'incomplete';
        if ((data.land_q4_expro === '是' || data.land_q4_expro === '待查證') && !data.land_q4_expro_other) return 'incomplete';
        if (!data.land_q4_resurvey) return 'incomplete';
        if ((data.land_q4_resurvey === '是' || data.land_q4_resurvey === '待查證') && !data.land_q4_resurvey_other) return 'incomplete';
        return 'complete';
    };

    const showWaterBooster = type !== 'land' && GROUP_A_TYPES.includes(data.propertyType);

    const getParkingStatus = (): SectionStatus => {
        if (data.q10_noParking) return 'complete';
        if ((!data.q10_parkTypes || data.q10_parkTypes.length === 0) && !data.q10_hasParkTypeOther) return 'incomplete';
        if (data.q10_hasParkTypeOther && !data.q10_parkTypeOther) return 'incomplete';
        if (data.q10_parkTypes?.includes("坡道機械") && !data.q10_rampMechLoc) return 'incomplete';
        if (data.q10_parkTypes?.includes("升降機械") && !data.q10_liftMechLoc) return 'incomplete';
        if (!parkingLogic.disableNumber) {
            if (!data.q10_parkingNumberType) return 'incomplete';
            if (data.q10_parkingNumberType === 'number' && !data.q10_parkingNumberVal) return 'incomplete';
        }
        if (!parkingLogic.disableCarStatus) {
            if ((!data.q10_carUsage || data.q10_carUsage.length === 0) && !data.q10_hasCarUsageOther) return 'incomplete';
            if (data.q10_carUsage?.includes("須固定抽籤") && !data.q10_carLotteryMonth) return 'incomplete';
            if (data.q10_hasCarUsageOther && !data.q10_carUsageOther) return 'incomplete';
        }
        if (!parkingLogic.disableCarSize) {
             if (!data.q10_measureType) return 'incomplete';
             if (data.q10_measureType !== '無法測量' && data.q10_measureType !== '無法測量也無相關資訊') {
                 if (!data.q10_dimL || !data.q10_dimW || !data.q10_dimH) return 'incomplete';
             }
        }
        if (!parkingLogic.disableWeight && !data.q10_mechWeight) return 'incomplete';
        if (!parkingLogic.disableHeight) {
            if (!data.q10_entryHeight) return 'incomplete';
            if (data.q10_entryHeight === '無資訊告示牌' && !data.q10_entryHeight_desc) return 'incomplete';
        }
        if (!data.q10_laneSection || !data.q10_laneNumber) return 'incomplete';
        if ((!data.q10_motoUsage || data.q10_motoUsage.length === 0) && !data.q10_hasMotoUsageOther) return 'incomplete';
        if (data.q10_hasMotoUsageOther && !data.q10_motoUsageOther) return 'incomplete';
        if (!data.q10_charging) return 'incomplete';
        if (!data.q11_hasIssue) return 'incomplete';
        if (data.q11_hasIssue === '是') {
            if ((!data.q11_items || data.q11_items.length === 0) && !data.q11_hasOther) return 'incomplete';
            if (data.q11_hasOther && !data.q11_other) return 'incomplete';
        }
        if (!data.q12_hasNote) return 'incomplete';
        if (data.q12_hasNote === '是' && !data.q12_note) return 'incomplete';
        return 'complete';
    };

    return (
        <StepContainer title={type === 'land' ? '第二步：使用現況-1' : (type === 'parking' ? '第二步：車位資訊與現況' : '第二步：內部現況')} type={type} themeText={themeText}>
            {(type === 'house' || type === 'factory' || type === 'land') && (
                <InlineWarning>
                    {type === 'land' 
                        ? '※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，並判斷是否須調閱土地使用分區' 
                        : '※請先至全國土地使用分區資訊查詢系統確認本案分區與周邊，再判斷是否須調閱土地使用分區'}
                </InlineWarning>
            )}
            
            {type === 'parking' && <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={1} ids={{ main: 'section-parking-main', abnormal: 'section-parking-abnormal', supplement: 'section-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} status={getParkingStatus()} />}
            
            <ImageModal 
                isOpen={showMeasurementGuide} 
                onClose={() => setShowMeasurementGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1wAmc238i_LOlWdJa7KjE5RFWH05G44LG" 
                title="測量參考圖例" 
            />
            <ImageModal 
                isOpen={showLeakageGuide} 
                onClose={() => setShowLeakageGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1s1ErxnSDgdNTWLUnGAQ53_9dqeeMiWNb" 
                title="滲漏水與壁癌參考圖例" 
            />
            <ImageModal 
                isOpen={showLeakageGuide1} 
                onClose={() => setShowLeakageGuide1(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1P8s5Evk8ECU4ywYHi-xWeQnfJV6Ov_N0" 
                title="滲漏水與壁癌參考圖例 (1)" 
            />
            <ImageModal 
                isOpen={showStructureGuide} 
                onClose={() => setShowStructureGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1s96VDVuXH7zlz-7osRXoeCK6LO4BMPHw" 
                title="建物結構安全評估參考圖例" 
            />
            <ImageModal 
                isOpen={showStructureGuide1} 
                onClose={() => setShowStructureGuide1(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1i23-q7QEYC2YNd1gCg-6zc0pwEDEJF2S" 
                title="建物結構安全評估參考圖例 (1)" 
            />
            <ImageModal 
                isOpen={showStructureGuide2} 
                onClose={() => setShowStructureGuide2(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/1KMJwYPW6IwnPEmrpbY5hlk32B5HKt9cf" 
                title="建物結構安全評估參考圖例 (2)" 
            />
            <ImageModal 
                isOpen={showTiltGuide} 
                onClose={() => setShowTiltGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/173MWcVrNWsHw3Zk61LKRtw6aUh9SxnEn" 
                title="建物傾斜現況參考圖例" 
            />
            <ImageModal 
                isOpen={showOccupyGuide} 
                onClose={() => setShowOccupyGuide(false)} 
                imageSrc="https://lh3.googleusercontent.com/d/12EY9u7gm8oIuGpRWFlzqoAK_RrEuOupQ" 
                title="增建、占用與被占用現況真實案例" 
            />
            {type === 'land' && (
                <div className="space-y-8 md:space-y-12">
                    <UtilitiesSection data={data} setData={setData} title="1. 電、水與其他設施使用現況" type={type} id="section-land-q1" highlightedId={highlightedField} status={getLandQ1Status()} />
                    <LandQuestionsGroup 
                        data={data} setData={setData} update={update}
                        titles={{ q2: '', q3: '2. 土地鑑界與界標現況與產權與使用糾紛現況', q4: '3. 土地徵收預定地與重測區現況' }}
                        ids={{ q2: 'section-land-q2-hidden', q3: 'section-land-q3', q4: 'section-land-q4' }}
                        highlightedId={highlightedField}
                        hideQ2={true}
                        statusQ3={getLandQ3Status()}
                        statusQ4={getLandQ4Status()}
                    />
                    <SurveySection id="section-land-q5" highlighted={highlightedField === 'section-land-q5'} title="4. 被越界占用與占用鄰地現況" status={getLandQ5Status()}>
                        <div className="space-y-8">
                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black mb-6 leading-normal"><span className="text-red-600">本案遭</span>他人越界<span className="text-red-600">占用</span>現況</p>
                                <AccordionRadio options={['無', '有']} value={data?.land_q5_encroached === '否' ? '無' : (data?.land_q5_encroached === '是' ? '有' : (data?.land_q5_encroached || ''))} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({...prev, land_q5_encroached: val, land_q5_encroached_desc: val === '是' ? prev.land_q5_encroached_desc : '' })); }} renderDetail={opt => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q5_encroached_desc || ''} onChange={v => update('land_q5_encroached_desc', v)} placeholder="如：鄰居圍牆占用" /></SubItemHighlight> : null)}  />
                            </QuestionBlock>
                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black mb-6 leading-normal"><span className="text-red-600">本案占用</span>鄰地現況</p>
                                <AccordionRadio options={['無', '有']} value={data?.land_q5_encroaching === '否' ? '無' : (data?.land_q5_encroaching === '是' ? '有' : (data?.land_q5_encroaching || ''))} onChange={v => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({...prev, land_q5_encroaching: val, land_q5_encroaching_desc: val === '是' ? prev.land_q5_encroaching_desc : '' })); }} renderDetail={opt => (opt === '有' ? <SubItemHighlight><DetailInput value={data.land_q5_encroaching_desc || ''} onChange={v => update('land_q5_encroaching_desc', v)} placeholder="如：增建占用水利地" /></SubItemHighlight> : null)}  />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                </div>
            )}
            {(type === 'house' || type === 'factory') && (
                <div className="space-y-8 md:space-y-12">
                    <SurveySection id="section-q1" highlighted={highlightedField === 'section-q1'} title="1. 增建、占用與被占用現況" status={getQ1Status()}>
                        <div className="mb-4">
                            <button
                                onClick={() => setShowOccupyGuide(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                type="button"
                            >
                                <ImageIcon size={20} />
                                真實案例
                            </button>
                        </div>
                        <div className="space-y-8 md:space-y-10 pl-0 md:pl-2">
                            <BooleanReveal 
                                label={
                                    <>
                                        <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">增建（含違建）現況</p>
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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">{EXT_LIST.map(i => (<div key={i} className="space-y-3"><CheckBox checked={data?.q1_items?.includes(i) || false} label={i} onClick={() => { if (i === "地下室增建" && data?.q1_items?.includes(i)) update('q1_basementPartition', false); toggleArr('q1_items', i); }} />{i === "地下室增建" && data?.q1_items?.includes("地下室增建") && (<SubItemHighlight className="mt-4"><CheckBox checked={data?.q1_basementPartition || false} label="內含隔間" onClick={() => update('q1_basementPartition', !data.q1_basementPartition)} /></SubItemHighlight>)}</div>))}</div>
                                    <div className="space-y-3 text-left"><CheckBox checked={data?.q1_hasOther || false} label="其他未列項目" onClick={() => setData(prev => ({ ...prev, q1_hasOther: !prev.q1_hasOther, q1_other: prev.q1_hasOther ? '' : prev.q1_other }))} />{data?.q1_hasOther && <SubItemHighlight><DetailInput value={data.q1_other || ''} onChange={v => update('q1_other', v)} placeholder="如遮雨棚增建、平台外推" /></SubItemHighlight>}</div>
                                </div>
                            </BooleanReveal>

                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black text-slate-700 mb-2 leading-normal">
                                    <span className="text-red-600 text-2xl md:text-3xl font-black">占用</span>他人土地或空間現況
                                </p>
                                <div className="mb-6"><InlineWarning>※如鄰地、道路用地、他戶空間</InlineWarning></div>
                                <AccordionRadio 
                                    options={['無', '有', '待查證']} 
                                    value={data?.q2_hasOccupancy === '否' ? '無' : (data?.q2_hasOccupancy === '是' ? '有' : (data?.q2_hasOccupancy === '待查證' || data?.q2_hasOccupancy === '疑似' ? '待查證' : (data?.q2_hasOccupancy || '')))} 
                                    onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({ ...prev, q2_hasOccupancy: val, q2_desc: (val === '是' || val === '待查證') ? prev.q2_desc : '' })); }} 
                                    renderDetail={(opt) => (opt === '有' || opt === '待查證') ? <SubItemHighlight><DetailInput value={data.q2_desc || ''} onChange={v => update('q2_desc', v)} placeholder="如：占用鄰地約2坪" /></SubItemHighlight> : null}
                                />
                            </QuestionBlock>

                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black text-slate-700 mb-4">
                                    <span className="text-red-600 text-2xl md:text-3xl font-black">遭</span>鄰房或鄰地<span className="text-red-600 text-2xl md:text-3xl font-black">占用</span>現況
                                </p>
                                <AccordionRadio 
                                    options={['無', '有', '待查證']} 
                                    value={data?.q2_other_occupancy === '否' ? '無' : (data?.q2_other_occupancy === '是' ? '有' : (data?.q2_other_occupancy === '待查證' || data?.q2_other_occupancy === '疑似' ? '待查證' : (data?.q2_other_occupancy || '')))} 
                                    onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v); setData(prev => ({ ...prev, q2_other_occupancy: val, q2_other_occupancy_desc: (val === '是' || val === '待查證') ? prev.q2_other_occupancy_desc : '' })); }} 
                                      
                                    renderDetail={(opt) => (opt === '有' || opt === '待查證') ? <SubItemHighlight><DetailInput value={data.q2_other_occupancy_desc || ''} onChange={v => update('q2_other_occupancy_desc', v)} placeholder="如：隔壁冷氣室外機占用本戶外牆" /></SubItemHighlight> : null}
                                />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    
                    <SurveySection id="section-q6" highlighted={highlightedField === 'section-q6'} title={type === 'factory' ? '2. 現場長寬和建物測量成果圖比對，與建物面積現況評估' : '2. 現場長寬和建物測量成果圖比對，與建物面積現況評估'} status={getQ6Status()}>
                        <div className="flex flex-col gap-3 mb-4">
                            <InlineWarning>※可簡易測量最長／短／寬／窄之距離（因牆面厚度，測量的長／寬，與建物成果圖尺寸落差 30 公分內為合理範圍內）</InlineWarning>
                            <button
                                onClick={() => setShowMeasurementGuide(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                type="button"
                            >
                                <ImageIcon size={20} />
                                參考圖例
                            </button>
                        </div>
                        <AccordionRadio 
                            options={['實測相符', '實測不符', '無法測量']} 
                            value={data?.q6_hasIssue === '相符 (無明顯差異)' ? '實測相符' : (data?.q6_hasIssue === '不符 (有明顯差異)' ? '實測不符' : (data?.q6_hasIssue === '無法測量／其他' || data?.q6_hasIssue === '無法測量／現況說明' ? '無法測量' : (data?.q6_hasIssue || '')))} 
                            onChange={(v) => { 
                                setData(prev => ({ ...prev, q6_hasIssue: v, q6_desc: (v === '實測不符' || v === '無法測量') ? prev.q6_desc : '' })); 
                            }} 
                            renderDetail={(opt) => {
                                if (opt === '實測不符' || opt === '無法測量') return <SubItemHighlight><DetailInput value={data.q6_desc || ''} onChange={v => update('q6_desc', v)} placeholder="說明現況" /></SubItemHighlight>;
                                return null;
                            }}
                        />
                    </SurveySection>

                    <SurveySection id="section-q3" highlighted={highlightedField === 'section-q3'} title={type === 'factory' ? '3. 滲漏水與壁癌現況' : '3. 滲漏水與壁癌現況'} className="border-red-400 ring-4 ring-red-50" status={getQ3Status()}>
                        <div className="flex flex-col gap-3 mb-4">
                            <InlineWarning>※檢查窗框角落、陽台天花板與頂樓狀況</InlineWarning>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setShowLeakageGuide(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                    type="button"
                                >
                                    <ImageIcon size={20} />
                                    參考圖例
                                </button>
                                <button
                                    onClick={() => setShowLeakageGuide1(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                    type="button"
                                >
                                    <ImageIcon size={20} />
                                    參考圖例 1
                                </button>
                            </div>
                        </div>
                        <AccordionRadio 
                            options={['無（現況乾燥）', '有（含壁癌／水漬／修繕痕跡）', '全屋天花板包覆（無法檢查）']} 
                            value={data.q3_ceilingWrapped ? '全屋天花板包覆（無法檢查）' : (data?.q3_hasLeak === '否' ? '無（現況乾燥）' : (data?.q3_hasLeak === '是' ? '有（含壁癌／水漬／修繕痕跡）' : (data?.q3_hasLeak ? '' : '')))} 
                            onChange={(v) => { 
                                if (v === '全屋天花板包覆（無法檢查）') {
                                    setData(prev => ({ ...prev, q3_hasLeak: '是', q3_leakType: '全屋天花板包覆（無法檢查）', q3_ceilingWrapped: true, q3_locations: [], q3_hasOther: false, q3_other: '因裝潢包覆無法檢視內部，需特別留意', q3_suspected: false, q3_suspectedDesc: '' })); 
                                } else {
                                    const val = v === '無（現況乾燥）' ? '否' : (v === '有（含壁癌／水漬／修繕痕跡）' ? '是' : v);
                                    setData(prev => {
                                        const wasWrapped = prev.q3_ceilingWrapped || prev.q3_leakType === '全屋天花板包覆' || prev.q3_leakType === '全屋天花板包覆 (無法檢查)' || prev.q3_leakType === '全屋天花板包覆（無法檢查）';
                                        return {
                                            ...prev,
                                            q3_hasLeak: val,
                                            q3_leakType: (val === '是' && !wasWrapped) ? prev.q3_leakType : '',
                                            q3_ceilingWrapped: false,
                                            q3_locations: val === '是' ? prev.q3_locations : [],
                                            q3_hasOther: val === '是' ? prev.q3_hasOther : false,
                                            q3_other: (val === '是' && !wasWrapped) ? prev.q3_other : '',
                                            q3_suspected: val === '是' ? prev.q3_suspected : false,
                                            q3_suspectedDesc: val === '是' ? prev.q3_suspectedDesc : ''
                                        };
                                    }); 
                                }
                            }} 
                            renderDetail={(opt) => {
                                if (opt === '有（含壁癌／水漬／修繕痕跡）') return (
                                    <SubItemHighlight>
                                        <div className="space-y-6 md:space-y-8">
                                            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-3 border-slate-200">
                                                <p className="dynamic-text-h2 font-black mb-4 leading-normal">狀況類別 <span className="text-xl font-normal text-slate-600 block md:inline md:ml-2 dark:text-slate-300">（請確認現場狀況）</span></p>
                                                <AccordionRadio 
                                                    options={['滲漏水', '壁癌', '兩者皆有']} 
                                                    value={data.q3_leakType === '全屋天花板包覆' || data.q3_leakType === '全屋天花板包覆 (無法檢查)' || data.q3_leakType === '全屋天花板包覆（無法檢查）' ? '' : (data.q3_leakType || '')} 
                                                    onChange={v => setData(prev => ({ ...prev, q3_leakType: v }))} 
                                                    renderDetail={opt => {
                                                        if (!data.q3_leakType || data.q3_leakType === '全屋天花板包覆' || data.q3_leakType === '全屋天花板包覆（無法檢查）') return null;
                                                        if (opt !== data.q3_leakType) return null;
                                                        return (
                                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6 md:space-y-8 mt-6">
                                                                <div>
                                                                    <p className="dynamic-text-h2 font-black mb-6 leading-normal text-left">發生位置：</p>
                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">{LEAK_LOCATIONS.map(i => <CheckBox key={i} checked={data?.q3_locations?.includes(i) || false} label={i} onClick={() => toggleArr('q3_locations', i)} />)}</div>
                                                                </div>
                                                                <div className="space-y-3 text-left"><CheckBox checked={data?.q3_hasOther || false} label="其他未列項目" onClick={() => setData(prev => ({ ...prev, q3_hasOther: !prev.q3_hasOther, q3_other: prev.q3_hasOther ? '' : prev.q3_other }))} />{data?.q3_hasOther && <SubItemHighlight><DetailInput value={data.q3_other || ''} onChange={v => update('q3_other', v)} placeholder="如窗框、增建處" /></SubItemHighlight>}</div>
                                                                <div className="space-y-3 text-left"><CheckBox checked={data?.q3_suspected || false} label={data.q3_leakType === '滲漏水' ? "疑似有滲漏水，位置說明：" : (data.q3_leakType === '壁癌' ? "疑似有壁癌，位置說明：" : "疑似有滲漏水、壁癌，位置說明：")} onClick={() => setData(prev => ({ ...prev, q3_suspected: !prev.q3_suspected, q3_suspectedDesc: prev.q3_suspected ? '' : prev.q3_suspectedDesc }))} />{data?.q3_suspected && <SubItemHighlight><DetailInput value={data.q3_suspectedDesc || ''} onChange={v => update('q3_suspectedDesc', v)} placeholder="如：牆面變色、油漆剝落" /></SubItemHighlight>}</div>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </SubItemHighlight>
                                );
                                return null;
                            }}
                        />
                        <div className="mt-8 pt-6 border-t-2 border-slate-100">
                             <QuestionBlock>
                                <p className="dynamic-text-h2 font-black text-slate-700 mb-4 leading-normal">確認過往滲漏水修繕紀錄</p>
                                <AccordionRadio 
                                    options={['無修繕紀錄', '有修繕紀錄']} 
                                    value={data.q3_repairHistory || ''} 
                                    onChange={v => setData(prev => ({ ...prev, q3_repairHistory: v, q3_repairDesc: v === '有修繕紀錄' ? prev.q3_repairDesc : '' }))} 
                                    
                                    renderDetail={(opt) => opt === '有修繕紀錄' ? (
                                        <SubItemHighlight>
                                             <DetailInput value={data.q3_repairDesc || ''} onChange={v => update('q3_repairDesc', v)} placeholder="說明修繕時間、方式或保固情形" />
                                        </SubItemHighlight>
                                    ) : null}
                                />
                            </QuestionBlock>
                        </div>
                    </SurveySection>
                    
                    <SurveySection id="section-q4" highlighted={highlightedField === 'section-q4'} title={type === 'factory' ? '4. 建物結構安全評估（含瑕疵與傾斜）' : '4. 建物結構安全評估（含瑕疵與傾斜）'} status={getQ4Status()}>
                        <div className="space-y-8 md:space-y-10">
                            <QuestionBlock>
                                <div className="mb-6">
                                    <p className="dynamic-text-h2 font-black mb-1 leading-normal">結構牆面與樑柱現況</p>
                                    <p className="text-xl text-slate-600 font-bold mb-6 dark:text-slate-300">（非單純壁癌或油漆剝落）</p>
                                    <div className="flex flex-col gap-3">
                                        <InlineWarning>※可從浴廁、廚房通風孔／維修孔、輕鋼架推開檢查</InlineWarning>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => setShowStructureGuide(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                                type="button"
                                            >
                                                <ImageIcon size={20} />
                                                參考圖例
                                            </button>
                                            <button
                                                onClick={() => setShowStructureGuide1(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                                type="button"
                                            >
                                                <ImageIcon size={20} />
                                                參考圖例 1
                                            </button>
                                            <button
                                                onClick={() => setShowStructureGuide2(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                                type="button"
                                            >
                                                <ImageIcon size={20} />
                                                參考圖例 2
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <AccordionRadio 
                                    options={['無', '有', '全屋天花板包覆（無法檢查）']} 
                                    value={data.q4_ceilingWrapped ? '全屋天花板包覆（無法檢查）' : (data?.q4_hasIssue === '否' ? '無' : (data?.q4_hasIssue === '是' ? '有' : (data?.q4_hasIssue ? '' : '')))} 
                                    onChange={(v) => { 
                                        if (v === '全屋天花板包覆（無法檢查）') {
                                            setData(prev => ({ ...prev, q4_hasIssue: '是', q4_ceilingWrapped: true, q4_items: [], q4_hasOther: false, q4_otherDesc: '因裝潢包覆無法檢視內部，需特別留意', q4_suspected: false, q4_suspectedDesc: '' })); 
                                        } else {
                                            const val = v === '無' ? '否' : (v === '有' ? '是' : v);
                                            setData(prev => ({
                                                ...prev,
                                                q4_hasIssue: val,
                                                q4_ceilingWrapped: false,
                                                q4_items: val === '是' ? prev.q4_items : [],
                                                q4_hasOther: val === '是' ? prev.q4_hasOther : false,
                                                q4_otherDesc: (val === '是' && !prev.q4_ceilingWrapped) ? prev.q4_otherDesc : '',
                                                q4_suspected: val === '是' ? prev.q4_suspected : false,
                                                q4_suspectedDesc: val === '是' ? prev.q4_suspectedDesc : ''
                                            })); 
                                        }
                                    }}
                                    renderDetail={(opt) => {
                                        if (opt === '有') return (
                                            <SubItemHighlight>
                                                    <div className="space-y-8 pt-4">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">{STRUCTURAL_ISSUES.map(i => <CheckBox key={i} checked={data?.q4_items?.includes(i) || false} label={i} onClick={() => toggleArr('q4_items', i)} />)}</div>
                                                        <div className="space-y-3 text-left"><CheckBox checked={data?.q4_hasOther || false} label="其他未列項目" onClick={() => setData(prev => ({ ...prev, q4_hasOther: !prev.q4_hasOther, q4_otherDesc: prev.q4_hasOther ? '' : prev.q4_otherDesc }))} />{data?.q4_hasOther && <SubItemHighlight><DetailInput value={data.q4_otherDesc || ''} onChange={v => update('q4_otherDesc', v)} placeholder="說明現況與位置" /></SubItemHighlight>}</div>
                                                        <div className="space-y-3 text-left"><CheckBox checked={data?.q4_suspected || false} label="現況需待查證" onClick={() => setData(prev => ({ ...prev, q4_suspected: !prev.q4_suspected, q4_suspectedDesc: prev.q4_suspected ? '' : prev.q4_suspectedDesc }))} />{data?.q4_suspected && <SubItemHighlight><DetailInput value={data.q4_suspectedDesc || ''} onChange={v => update('q4_suspectedDesc', v)} placeholder="說明位置與現況" /></SubItemHighlight>}</div>
                                                    </div>
                                            </SubItemHighlight>
                                        );
                                        return null;
                                    }}
                                />
                            </QuestionBlock>

                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black mb-2 leading-normal">建物傾斜現況</p>
                                <div className="mb-4 flex flex-col gap-3">
                                    <InlineWarning>※僅依目視觀察，精確數據須由專業技師鑑定</InlineWarning>
                                    <button
                                        onClick={() => setShowTiltGuide(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                        type="button"
                                    >
                                        <ImageIcon size={20} />
                                        參考圖例
                                    </button>
                                </div>
                                <AccordionRadio 
                                    options={['無', '有', '待查證（待測量）']} 
                                    value={data?.q5_hasTilt === '否' ? '無' : (data?.q5_hasTilt === '是' ? '有' : (data?.q5_hasTilt === '待查證' || data?.q5_hasTilt === '疑似' ? '待查證（待測量）' : (data?.q5_hasTilt || '')))} 
                                    onChange={(v) => { const val = v === '無' ? '否' : (v === '有' ? '是' : v === '待查證（待測量）' ? '待查證' : v); setData(prev => ({ ...prev, q5_hasTilt: val, q5_desc: val === '是' ? prev.q5_desc : '', q5_suspectedDesc: val === '待查證' ? prev.q5_suspectedDesc : '' })); }} 
                                      
                                    renderDetail={(opt) => opt === '有' ? <SubItemHighlight><DetailInput value={data.q5_desc || ''} onChange={v => update('q5_desc', v)} placeholder="如：經單位檢測提供報告書" /></SubItemHighlight> : (opt === '待查證（待測量）' ? <SubItemHighlight><DetailInput value={data.q5_suspectedDesc || ''} onChange={v => update('q5_suspectedDesc', v)} placeholder="如：目視有傾斜感" /></SubItemHighlight> : null)}
                                />
                            </QuestionBlock>
                        </div>
                    </SurveySection>

                    {type === 'house' && (
                        <>
                            <SurveySection id="section-q7" highlighted={highlightedField === 'section-q7'} title="5. 電、水、瓦斯與其他設施使用現況" status={getQ7Status()}>
                                 <div className="space-y-8">
                                     {/* 1. Gas Supply Type - Top */}
                                     <QuestionBlock>
                                         <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">瓦斯供應類型</p>
                                         <AccordionRadio 
                                             options={GAS_SUPPLY_OPTIONS} 
                                             value={data.q7_gasType || ''} 
                                             onChange={v => update('q7_gasType', v)} 
                                               
                                         />
                                     </QuestionBlock>

                                     {/* 2. Equipment Status - Moved below Gas Type */}
                                     <QuestionBlock>
                                         <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">電、水、瓦斯與其他設施使用現況</p>
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
                                                <div className="space-y-3 text-left">
                                                    <CheckBox checked={data?.q7_hasOther || false} label="其他未列項目" onClick={() => setData(prev => ({ ...prev, q7_hasOther: !prev.q7_hasOther, q7_otherDesc: prev.q7_hasOther ? '' : prev.q7_otherDesc }))} />
                                                    {data?.q7_hasOther && <SubItemHighlight><DetailInput value={data.q7_otherDesc || ''} onChange={v => update('q7_otherDesc', v)} placeholder="說明現況" /></SubItemHighlight>}
                                                </div>
                                             </div>
                                         </BooleanReveal>
                                     </QuestionBlock>

                                     {/* 3. Solar Photovoltaic Equipment (Group A Only) */}
                                     {isGroupA && (
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

                                     {/* 4. Water Booster - Group A handled in logic, Group B not modified */}
                                     {isGroupA && (
                                         <QuestionBlock>
                                             <p className="dynamic-text-h2 font-black text-slate-700 mb-4 text-left dark:text-slate-100 leading-normal">加壓受水設備</p>
                                             <div className="mb-6">
                                                <InlineWarning>※本項由使用者自行管理維護</InlineWarning>
                                             </div>
                                             <AccordionRadio 
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
                                 </div>
                            </SurveySection>

                            {/* Garbage Treatment Section Removed */}
                        </>
                    )}
                </div>
            )}
        </StepContainer>
    );
});
