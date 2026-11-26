import React from 'react';
import { 
    FACILITY_OPTIONS, 
    FACTORY_FLOOR_OPTS, FACTORY_FIRE_OPTS, FACTORY_WASTE_OPTS, FACTORY_DOCK_OPTS, FACTORY_TRUCK_OPTS,
    STAIR_ISSUES, WATER_BOOSTER_ITEMS_B, FACILITIES_GROUP_A, FACILITIES_LAND_BASE, FACILITIES_LAND_FARM_EXTRA, FACILITIES_LAND_BUILD_IND_EXTRA,
    LAND_WATER_BOOSTER_ITEMS, GROUP_A_TYPES
} from '../../constants';
import { 
    CheckBox, SurveySection, SubItemHighlight, DetailInput, InlineWarning, 
    AccordionRadio, QuestionBlock, BooleanReveal, UnitInput, SignaturePad, SectionStatus
} from '../SharedUI';
import { UtilitiesSection, ParkingSection, EnvironmentSection, NotesSection } from '../ComplexSections';
import { StepProps, StepContainer, getFactoryHeightLabel } from './StepShared';

export const Step3 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText, parkingLogic }) => {
    
    const isGroupA = GROUP_A_TYPES.includes(data.propertyType);

    // --- Status Logic Helpers for Step 3 ---
    const getEnvStatus = (): SectionStatus => {
        if (!data.q16_noFacilities) {
            if ((!data.q16_items || data.q16_items.length === 0) && !data.q16_hasOther) return 'incomplete';
            if (data.q16_hasOther && !data.q16_other) return 'incomplete';
        }

        if (!data.q16_2_noFacilities) {
            if ((!data.q16_2_items || data.q16_2_items.length === 0) && !data.q16_2_hasOther) return 'incomplete';
            if (data.q16_2_hasOther && !data.q16_2_other) return 'incomplete';
        }

        return 'complete';
    };

    const getNotesStatus = (): SectionStatus => {
        const issueKey = type === 'land' ? 'land_q8_special' : 'q17_issue';
        const descKey = type === 'land' ? 'land_q8_special_desc' : 'q17_desc';
        if (!data[issueKey]) return 'incomplete';
        if ((data[issueKey] === '是' || data[issueKey] === '待查證') && !data[descKey]) return 'incomplete';
        if (type !== 'land' && type !== 'parking') {
            if (!data.q17_homicide) return 'incomplete';
            if ((data.q17_homicide === '是' || data.q17_homicide === '待查證') && !data.q17_homicide_desc) return 'incomplete';
        }
        return 'complete';
    };

    const getPublicFacilitiesStatus = (): SectionStatus => {
        if (!data.publicFacilities) return 'incomplete';
        if (data.publicFacilities === '無法進入' && !data.publicFacilitiesReason) return 'incomplete';
        return 'complete';
    };

    const getStairStatus = (): SectionStatus => {
        if (!data.q8_stairIssue) return 'incomplete';
        if (data.q8_stairIssue === '是') {
            if (!data.q8_stairItems || data.q8_stairItems.length === 0) return 'incomplete';
            if (data.q8_stairItems.includes('其他未列項目') && !data.q8_stairOther) return 'incomplete';
        }
        return 'complete';
    };

    const getFacilityStatus = (): SectionStatus => {
        if (!data.q9_hasIssue) return 'incomplete';
        if (data.q9_hasIssue === '是') {
            if ((!data.q9_items || data.q9_items.length === 0) && !data.q9_hasOther) return 'incomplete';
            if (data.q9_items?.includes('太陽能光電發電設備') && !data.q9_solar_maintenance) return 'incomplete';
            if (data.q9_items?.includes('加壓受水設備')) {
                if (!data.q9_water_booster_items || data.q9_water_booster_items.length === 0) return 'incomplete';
                if (type === 'factory' && !isGroupA && !data.q9_water_booster_maintenance) return 'incomplete';
            }
            if (data.q9_hasOther && !data.q9_otherDesc) return 'incomplete';
        }
        return 'complete';
    };

    const getLandQ6Status = (): SectionStatus => {
        if (!data.land_q6_limit) return 'incomplete';
        if (data.land_q6_limit === '是' && !data.land_q6_limit_desc) return 'incomplete';
        return 'complete';
    };

    const getLandQ7Status = (): SectionStatus => {
        if (!data.land_q7_user) return 'incomplete';
        if (data.land_q7_user === '非所有權人使用') {
            if (!data.land_q7_user_detail) return 'incomplete';
            if (['承租中', '無償借用', '被占用', '其他未列項目'].includes(data.land_q7_user_detail) && !data.land_q7_user_desc) return 'incomplete';
        }
        
        if (!data.land_q7_crops) return 'incomplete';
        if (data.land_q7_crops === '有農作物／植栽') {
            if (!data.land_q7_crops_type || data.land_q7_crops_type.length === 0) return 'incomplete';
            if (data.land_q7_crops_type.includes('經濟作物')) {
                if (!data.land_q7_crops_econ_detail) return 'incomplete';
                if (data.land_q7_crops_econ_detail === '其他未列項目' && !data.land_q7_crops_econ_detail_other) return 'incomplete';
            }
            if (data.land_q7_crops_type.includes('景觀植栽')) {
                if (!data.land_q7_crops_land_detail) return 'incomplete';
                if (data.land_q7_crops_land_detail === '其他未列項目' && !data.land_q7_crops_land_detail_other) return 'incomplete';
            }
            if (data.land_q7_crops_type.includes('其他未列項目') && !data.land_q7_crops_other) return 'incomplete';
        }

        if (!data.land_q7_build) return 'incomplete';
        if (data.land_q7_build === '有建築物／工作物') {
            if (!data.land_q7_build_type || data.land_q7_build_type.length === 0) return 'incomplete';
            if (data.land_q7_build_type.includes('有保存登記')) {
                if (!data.land_q7_build_reg_ownership) return 'incomplete';
                if (data.land_q7_build_reg_ownership === '其他未列項目' && !data.land_q7_build_reg_detail) return 'incomplete';
            }
            if (data.land_q7_build_type.includes('未保存登記')) {
                if (!data.land_q7_build_unreg_ownership) return 'incomplete';
                if (data.land_q7_build_unreg_ownership === '其他未列項目' && !data.land_q7_build_unreg_detail) return 'incomplete';
            }
            if (data.land_q7_build_type.includes('其他未列項目') && !data.land_q7_build_other) return 'incomplete';
        }

        if (!data.land_q7_solar) return 'incomplete';
        if (!data.land_water_booster) return 'incomplete';
        if (data.land_water_booster === '有設置' && (!data.land_water_booster_items || data.land_water_booster_items.length === 0)) return 'incomplete';

        if (!data.land_q7_fire_setback && data.propertyType === '工業地') return 'incomplete';
        if (!data.land_q7_road_opened && data.propertyType === '其他未列項目') return 'incomplete';

        return 'complete';
    };

    const getLandQ7FacilitiesStatus = (): SectionStatus => {
        if (!data.land_q7_facilities) return 'incomplete';
        if (data.land_q7_facilities === '是') {
            if ((!data.land_q7_facilities_items || data.land_q7_facilities_items.length === 0)) return 'incomplete';
            if (data.land_q7_facilities_items.includes('其他未列項目') && !data.land_q7_facilities_other) return 'incomplete';
        }
        return 'complete';
    };

    const getParkingStatus = (): SectionStatus => {
        if (data.q10_noParking) return 'complete';
        
        // 1. Parking Method
        if ((!data.q10_parkTypes || data.q10_parkTypes.length === 0) && !data.q10_hasParkTypeOther) return 'incomplete';
        if (data.q10_hasParkTypeOther && !data.q10_parkTypeOther) return 'incomplete';

        if (data.q10_parkTypes?.includes("坡道機械") && !data.q10_rampMechLoc) return 'incomplete';
        if (data.q10_parkTypes?.includes("升降機械") && !data.q10_liftMechLoc) return 'incomplete';

        // 2. Parking Number
        if (!parkingLogic.disableNumber) {
            if (!data.q10_parkingNumberType) return 'incomplete';
            if (data.q10_parkingNumberType === 'number' && !data.q10_parkingNumberVal) return 'incomplete';
        }

        // 3. Car Usage
        if (!parkingLogic.disableCarStatus) {
            if ((!data.q10_carUsage || data.q10_carUsage.length === 0) && !data.q10_hasCarUsageOther) return 'incomplete';
            if (data.q10_carUsage?.includes("須固定抽籤") && !data.q10_carLotteryMonth) return 'incomplete';
            if (data.q10_hasCarUsageOther && !data.q10_carUsageOther) return 'incomplete';
        }

        // 4. Car Dimensions
        if (!parkingLogic.disableCarSize) {
             if (!data.q10_measureType) return 'incomplete';
             if (data.q10_measureType !== '無法測量' && data.q10_measureType !== '無法測量也無相關資訊') {
                 if (!data.q10_dimL || !data.q10_dimW || !data.q10_dimH) return 'incomplete';
             }
        }
        
        // Mechanical Weight
        if (type !== 'factory' && !parkingLogic.disableWeight && !data.q10_mechWeight) return 'incomplete';
        
        // Entry Height
        if (!parkingLogic.disableHeight) {
            if (!data.q10_entryHeight) return 'incomplete';
            if (data.q10_entryHeight === '無資訊告示牌' && !data.q10_entryHeight_desc) return 'incomplete';
        }

        // 5. Lane Land Number
        if (!data.q10_laneSection || !data.q10_laneNumber) return 'incomplete';

        // 6. Motorcycle Usage
        if ((!data.q10_motoUsage || data.q10_motoUsage.length === 0) && !data.q10_hasMotoUsageOther) return 'incomplete';
        if (data.q10_hasMotoUsageOther && !data.q10_motoUsageOther) return 'incomplete';

        // 7. Charging Equipment
        if (!data.q10_charging) return 'incomplete';

        // 8. Parking Usage Status (Abnormalities)
        if (!data.q11_hasIssue) return 'incomplete';
        if (data.q11_hasIssue === '是') {
            if ((!data.q11_items || data.q11_items.length === 0) && !data.q11_hasOther) return 'incomplete';
            if (data.q11_hasOther && !data.q11_other) return 'incomplete';
        }

        // 9. Parking Notes
        if (!data.q12_hasNote) return 'incomplete';
        if (data.q12_hasNote === '是' && !data.q12_note) return 'incomplete';

        return 'complete';
    };

    if (type === 'parking') {
        return (
            <StepContainer title="第三步：環境與其他" type={type} themeText={themeText}>
                <EnvironmentSection 
                    data={data} update={update} toggleArr={toggleArr} id="section-q16" title="2. 重要環境設施／常見環境抗性設施" highlightedId={highlightedField} 
                    warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                    status={getEnvStatus()}
                />
                <NotesSection 
                    data={data} setData={setData} update={update} id="section-q17" title="3. 本案或本社區須注意的事項" highlightedId={highlightedField} type={type}
                    warningText="※車道出入周圍有菜市場/夜市須注意、危險建築、新聞事件、糾紛等" 
                    status={getNotesStatus()}
                />
                <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title="4. 調查人員簽章" status={data.signatureImage ? 'complete' : 'incomplete'}>
                    <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
                </SurveySection>
            </StepContainer>
        );
    }
    
    if (type === 'house') {
        return (
             <StepContainer title="第三步：公設／車位" type={type} themeText={themeText}>
                <SurveySection id="section-publicFacilities" highlighted={highlightedField === 'section-publicFacilities'} title="6. 大樓與社區公共設施（可否進入／使用）" status={getPublicFacilitiesStatus()}>
                    <AccordionRadio 
                        options={['無公共設施', '有公共設施', '無法進入']} 
                        value={data?.publicFacilities || ''} 
                        onChange={(v) => { setData(prev => ({ ...prev, publicFacilities: v, publicFacilitiesReason: v === '無法進入' ? prev.publicFacilitiesReason : '' })); }}   
                        renderDetail={(opt) => {
                            if (opt === '無法進入') {
                                return (
                                    <SubItemHighlight>
                                        <DetailInput 
                                            value={data.publicFacilitiesReason || ''} 
                                            onChange={v => update('publicFacilitiesReason', v)} 
                                            placeholder="如：需磁扣感應" 
                                        />
                                    </SubItemHighlight>
                                );
                            }
                            return null;
                        }}
                    />
                </SurveySection>

                <SurveySection id="section-q8" highlighted={highlightedField === 'section-q8'} title="7. 公設空間（梯間／地下室）" status={getStairStatus()}>
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
                            <div className="space-y-3 text-left">
                                <CheckBox checked={data?.q8_stairItems?.includes('其他未列項目') || false} label="其他未列項目" onClick={() => toggleArr('q8_stairItems', '其他未列項目')} />
                                {data?.q8_stairItems?.includes('其他未列項目') && <SubItemHighlight><DetailInput value={data.q8_stairOther || ''} onChange={v => update('q8_stairOther', v)} placeholder="說明現況與位置" /></SubItemHighlight>}
                            </div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
                <SurveySection id="section-q9" highlighted={highlightedField === 'section-q9'} title="8. 物件與社區內須注意的設施" status={getFacilityStatus()}>
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
                                                        {isGroupA ? '設置現況：' : '維護方式：'}
                                                    </p>
                                                    <AccordionRadio 
                                                        options={isGroupA ? ['合法設置', '私人設置'] : ['管委會維護', '全體住戶維護']} 
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
                             <div className="space-y-3 text-left">
                                <CheckBox checked={data?.q9_hasOther || false} label="其他未列項目" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />
                                {data?.q9_hasOther && <SubItemHighlight><DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder={isGroupA ? "說明現況" : "如：發電機"} /></SubItemHighlight>}
                             </div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
                <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={9} ids={{ main: 'section-house-parking-main', abnormal: 'section-house-parking-abnormal', supplement: 'section-house-parking-supplement' }} highlightedId={highlightedField} includeExtras={true} status={getParkingStatus()} />
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
                <SurveySection id="section-land-q6" highlighted={highlightedField === 'section-land-q6'} title="5. 土地禁建、限建現況" status={getLandQ6Status()}>
                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black mb-6 leading-normal">土地禁建、限建現況</p>
                        <AccordionRadio 
                            options={['無', '有']} 
                            value={data.land_q6_limit === '否' ? '無' : (data.land_q6_limit === '是' ? '有' : '')} 
                            onChange={v => {
                                // Fix: Use ternary to allow empty string (deselect)
                                const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                setData(p => ({...p, land_q6_limit: val, land_q6_limit_desc: val === '是' ? p.land_q6_limit_desc : ''}))
                            }} 
                            renderDetail={(opt) => opt === '有' ? (
                                <SubItemHighlight>
                                    <DetailInput value={data.land_q6_limit_desc || ''} onChange={v => update('land_q6_limit_desc', v)} placeholder="說明現況" />
                                </SubItemHighlight>
                            ) : null}
                        />
                    </QuestionBlock>
                </SurveySection>

                <SurveySection id="section-land-q7" highlighted={highlightedField === 'section-land-q7'} title="6. 土地使用現況與地上物" status={getLandQ7Status()}>
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">現況使用人</p>
                            <AccordionRadio 
                                options={['無', '所有權人自用', '非所有權人使用']} 
                                value={data.land_q7_user === '無' ? '無' : (data.land_q7_user || '')} 
                                onChange={v => setData(p => ({...p, land_q7_user: v === '無' ? '無' : v, land_q7_user_detail: v === '非所有權人使用' ? p.land_q7_user_detail : '', land_q7_user_desc: v === '非所有權人使用' ? p.land_q7_user_desc : ''}))} 
                                renderDetail={(opt) => opt === '非所有權人使用' ? (
                                    <SubItemHighlight>
                                        <div className="space-y-4">
                                            <AccordionRadio 
                                                options={['承租中', '無償借用', '被占用', '共有分管', '其他未列項目']} 
                                                value={data.land_q7_user_detail || ''} 
                                                onChange={v => {
                                                    setData(prev => ({...prev, land_q7_user_detail: v, land_q7_user_desc: ''})); // Reset desc on change
                                                }} 
                                                renderDetail={(opt2) => {
                                                    if (['承租中', '無償借用', '被占用', '其他未列項目'].includes(opt2)) {
                                                        return (
                                                            <DetailInput 
                                                                value={data.land_q7_user_desc || ''} 
                                                                onChange={v => update('land_q7_user_desc', v)} 
                                                                placeholder={
                                                                    opt2 === '承租中' ? "如租金／押金、期限等" :
                                                                    opt2 === '無償借用' ? "如借用對象、約定事項等" :
                                                                    opt2 === '被占用' ? "說明現況" :
                                                                    "說明現況"
                                                                } 
                                                            />
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </div>
                                    </SubItemHighlight>
                                ) : null}
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">地上定著物-農作物</p>
                            <AccordionRadio 
                                options={['無', '有農作物／植栽']} 
                                value={data.land_q7_crops === '無' ? '無' : (data.land_q7_crops || '')} 
                                onChange={v => setData(p => ({...p, land_q7_crops: v === '無' ? '無' : v}))} 
                                renderDetail={(opt) => opt === '有農作物／植栽' ? (
                                    <SubItemHighlight>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {['經濟作物', '景觀植栽', '雜樹／荒廢', '其他未列項目'].map(opt2 => (
                                                    <CheckBox 
                                                        key={opt2} 
                                                        checked={data.land_q7_crops_type?.includes(opt2) || false} 
                                                        label={opt2} 
                                                        onClick={() => {
                                                            const arr = Array.isArray(data.land_q7_crops_type) ? data.land_q7_crops_type : [];
                                                            if (arr.includes(opt2)) {
                                                                setData(prev => ({ 
                                                                    ...prev, 
                                                                    land_q7_crops_type: arr.filter(i => i !== opt2),
                                                                    land_q7_crops_econ_detail: opt2 === '經濟作物' ? '' : prev.land_q7_crops_econ_detail,
                                                                    land_q7_crops_land_detail: opt2 === '景觀植栽' ? '' : prev.land_q7_crops_land_detail
                                                                }));
                                                            } else {
                                                                setData(prev => ({ ...prev, land_q7_crops_type: [...arr, opt2] }));
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            
                                            {data.land_q7_crops_type?.includes('經濟作物') && (
                                                <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                    <p className="font-bold text-xl mb-3">經濟作物處理方式：</p>
                                                    <AccordionRadio 
                                                        options={['隨同移轉', '賣方清除', '其他未列項目']} 
                                                        value={data.land_q7_crops_econ_detail || ''} 
                                                        onChange={v => { update('land_q7_crops_econ_detail', v); if (v !== '其他未列項目') update('land_q7_crops_econ_detail_other', ''); }} 
                                                        renderDetail={o => o === '其他未列項目' ? <DetailInput value={data.land_q7_crops_econ_detail_other || ''} onChange={v => update('land_q7_crops_econ_detail_other', v)} placeholder="說明現況" /> : null}
                                                    />
                                                </div>
                                            )}

                                            {data.land_q7_crops_type?.includes('景觀植栽') && (
                                                <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                                                    <p className="font-bold text-xl mb-3">景觀植栽處理方式：</p>
                                                    <AccordionRadio 
                                                        options={['隨同移轉', '賣方清除', '其他未列項目']} 
                                                        value={data.land_q7_crops_land_detail || ''} 
                                                        onChange={v => { update('land_q7_crops_land_detail', v); if (v !== '其他未列項目') update('land_q7_crops_land_detail_other', ''); }} 
                                                        renderDetail={o => o === '其他未列項目' ? <DetailInput value={data.land_q7_crops_land_detail_other || ''} onChange={v => update('land_q7_crops_land_detail_other', v)} placeholder="說明現況" /> : null}
                                                    />
                                                </div>
                                            )}

                                            {data.land_q7_crops_type?.includes('其他未列項目') && (
                                                <SubItemHighlight><DetailInput value={data.land_q7_crops_other || ''} onChange={v => update('land_q7_crops_other', v)} placeholder="說明現況" /></SubItemHighlight>
                                            )}
                                        </div>
                                    </SubItemHighlight>
                                ) : null}
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">地上定著物-建築物／工作物</p>
                            <AccordionRadio 
                                options={['無', '有建築物／工作物']} 
                                value={data.land_q7_build === '無' ? '無' : (data.land_q7_build || '')} 
                                onChange={v => setData(p => ({...p, land_q7_build: v === '無' ? '無' : v}))} 
                                renderDetail={(opt) => opt === '有建築物／工作物' ? (
                                    <SubItemHighlight>
                                        <div className="space-y-4">
                                            {['有保存登記', '未保存登記', '小廟', '墳墓', '其他未列項目'].map(bType => (
                                                <div key={bType} className="space-y-3">
                                                    <CheckBox 
                                                        checked={data.land_q7_build_type?.includes(bType) || false} 
                                                        label={bType} 
                                                        onClick={() => toggleArr('land_q7_build_type', bType)} 
                                                    />
                                                    {data.land_q7_build_type?.includes(bType) && (
                                                        <div className="pl-6 md:pl-8 animate-in fade-in zoom-in-95 duration-200">
                                                            {bType === '有保存登記' && (
                                                                <div className="p-4 bg-white rounded-xl border-2 border-slate-200"><AccordionRadio options={['所有權人擁有', '出租中', '其他未列項目']} value={data.land_q7_build_reg_ownership || ''} onChange={v => update('land_q7_build_reg_ownership', v)} renderDetail={(opt3) => opt3 === '其他未列項目' ? <DetailInput value={data.land_q7_build_reg_detail || ''} onChange={v => update('land_q7_build_reg_detail', v)} placeholder="說明現況" /> : null} /></div>
                                                            )}
                                                            {bType === '未保存登記' && (
                                                                <div className="p-4 bg-white rounded-xl border-2 border-slate-200"><AccordionRadio options={['擁有稅籍(有稅籍證明)', '出租中', '其他未列項目']} value={data.land_q7_build_unreg_ownership || ''} onChange={v => update('land_q7_build_unreg_ownership', v)} renderDetail={(opt3) => opt3 === '其他未列項目' ? <DetailInput value={data.land_q7_build_unreg_detail || ''} onChange={v => update('land_q7_build_unreg_detail', v)} placeholder="說明現況" /> : null} /></div>
                                                            )}
                                                            {bType === '其他未列項目' && (
                                                                <DetailInput value={data.land_q7_build_other || ''} onChange={v => update('land_q7_build_other', v)} placeholder="說明現況" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </SubItemHighlight>
                                ) : null}
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6 leading-normal">太陽能光電發電設備</p>
                            <AccordionRadio 
                                options={['無', '合法設置', '私人設置']} 
                                value={data.land_q7_solar === '無' ? '無' : (data.land_q7_solar || '')} 
                                onChange={v => setData(p => ({...p, land_q7_solar: v === '無' ? '無' : v}))} 
                                 
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black mb-4 text-slate-800 dark:text-slate-100 leading-normal">加壓受水設備</p>
                            <div className="mb-6">
                                <InlineWarning>※本項由使用者自行管理維護，若物件型態為道路用地／公設地，確認是否為自來水公司之公共設施，或鄰地非法佔用</InlineWarning>
                            </div>
                            <AccordionRadio 
                                options={['無設置', '有設置']} 
                                value={data.land_water_booster === '無設置' || data.land_water_booster === '無' ? '無設置' : (data.land_water_booster === '有設置' || data.land_water_booster === '有' ? '有設置' : '')} 
                                onChange={v => {
                                    setData(prev => ({ 
                                        ...prev, 
                                        land_water_booster: v, 
                                        land_water_booster_items: (v === '無設置' || v === '') ? [] : prev.land_water_booster_items 
                                    }));
                                }} 
                                renderDetail={(opt) => opt === '有設置' ? (
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
                                ) : null}
                            />
                        </QuestionBlock>

                        {data.propertyType === '工業地' && (
                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black text-slate-700 mb-2 leading-normal">防火間隔與區劃現況</p>
                                <div className="mb-4"><InlineWarning>※須符合消防法規，更直接關係到這塊地能否合法進行「工廠登記」以及未來的營運安全</InlineWarning></div>
                                <AccordionRadio 
                                    options={['無', '有']} 
                                    value={data.land_q7_fire_setback === '否' ? '無' : (data.land_q7_fire_setback === '是' ? '有' : '')} 
                                    onChange={v => {
                                        // Fix: Use ternary to allow empty string (deselect)
                                        const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                        update('land_q7_fire_setback', val);
                                    }} 
                                     
                                />
                            </QuestionBlock>
                        )}

                        {data.propertyType === '其他未列項目' && (
                            <QuestionBlock>
                                <p className="dynamic-text-h2 font-black text-slate-700 mb-4 leading-normal">計畫道路開闢現況</p>
                                <AccordionRadio 
                                    options={['無', '有']} 
                                    value={data.land_q7_road_opened === '否' ? '無' : (data.land_q7_road_opened === '是' ? '有' : '')} 
                                    onChange={v => {
                                        // Fix: Use ternary to allow empty string (deselect)
                                        const val = v === '無' ? '否' : (v === '有' ? '是' : '');
                                        update('land_q7_road_opened', val);
                                    }} 
                                     
                                />
                            </QuestionBlock>
                        )}
                    </div>
                </SurveySection>

                {/* NEW Q7 for Land */}
                <SurveySection id="section-land-q7-facilities" highlighted={highlightedField === 'section-land-q7-facilities'} title="7. 本案或周圍須注意設施" status={getLandQ7FacilitiesStatus()}>
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
                             <div className="space-y-3 text-left">
                                <CheckBox checked={data?.land_q7_facilities_items?.includes('其他未列項目') || false} label="其他未列項目" onClick={() => toggleArr('land_q7_facilities_items', '其他未列項目')} />
                                {data?.land_q7_facilities_items?.includes('其他未列項目') && <SubItemHighlight><DetailInput value={data.land_q7_facilities_other || ''} onChange={v => update('land_q7_facilities_other', v)} placeholder="說明現況" /></SubItemHighlight>}
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
         const showWaterBooster = GROUP_A_TYPES.includes(data.propertyType);

         const getLandQ1Status = (): SectionStatus => {
            if (!data.land_q1_elec) return 'incomplete';
            if (data.land_q1_elec.includes('一般用電') || data.land_q1_elec.includes('動力用電')) {
                 if (!data.land_q1_elec_meter) return 'incomplete';
                 if (!data.land_q1_elec_capacity) return 'incomplete';
                 if (data.land_q1_elec.includes('動力用電') && !data.land_q1_elec_voltage) return 'incomplete';
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
            }
            if (data.land_q1_water === '其他未列項目' && !data.land_q1_water_other) return 'incomplete';
            if (!data.land_q1_gas) return 'incomplete';
            if (type === 'factory' && showWaterBooster && !data.house_solar_status) return 'incomplete';
            if (showWaterBooster && !data.water_booster) return 'incomplete';
            if (!data.land_q1_other_new) return 'incomplete';
            if (data.land_q1_other_new === '是' && !data.land_q1_other_desc) return 'incomplete';
            return 'complete';
        };
         
    const getFactoryStructStatus = (): SectionStatus => {
        if (!data.factory_spec_unknown) {
            if (!data.factory_height || !data.factory_width || !data.factory_depth || !data.factory_floor_height) return 'incomplete';
        }
        if (!data.factory_floor_condition || data.factory_floor_condition.length === 0) return 'incomplete';
        if (data.factory_floor_condition.includes('其他未列項目') && !data.factory_floor_condition_other) return 'incomplete';
        if (!data.factory_fire_inspection) return 'incomplete';
        if (!data.factory_fire_safety || data.factory_fire_safety.length === 0) return 'incomplete';
        if (data.factory_fire_safety.includes('其他未列項目') && !data.factory_fire_safety_other) return 'incomplete';
        return 'complete';
    };

        const getFactoryHardwareStatus = (): SectionStatus => {
            if (!data.factory_elevator) return 'incomplete';
            if (data.factory_elevator !== '無') {
                if (!data.factory_elevator_status || !data.factory_elevator_capacity || !data.factory_elevator_dim || !data.factory_elevator_door_dim) return 'incomplete';
            }
            if (!data.factory_crane) return 'incomplete';
            if (data.factory_crane === '有') {
                if (!data.factory_crane_desc) return 'incomplete';
            }
            if (!data.factory_waste) return 'incomplete';
            if (data.factory_waste === '有' && !data.factory_waste_has_detail) return 'incomplete';
            if (data.factory_waste === '其他未列項目' && !data.factory_waste_desc) return 'incomplete';
            return 'complete';
        };

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
            // Factory: Skip weight check as it is hidden
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

        const getFactoryLogisticsStatus = (): SectionStatus => {
            if (!data.factory_loading_dock || !data.factory_truck_access) return 'incomplete';
            return 'complete';
        };

         return (
             <StepContainer title="第三步：設備現況" type={type} themeText={themeText}>
                 {/* 5. Structure */}
                 <SurveySection id="section-factory-struct" highlighted={highlightedField === 'section-factory-struct'} title="5. 廠房結構與消防安全" status={getFactoryStructStatus()}>
                    <div className="space-y-8">
                        <QuestionBlock>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
                                <p className="dynamic-text-h2 font-black text-slate-700 m-0 leading-none">廠房規格</p>
                                <div className="mt-2 sm:mt-0">
                                    <CheckBox 
                                        checked={data.factory_spec_unknown || false} 
                                        label="無法確認／依使照為準" 
                                        onClick={() => {
                                            const newVal = !data.factory_spec_unknown;
                                            setData(p => ({
                                                ...p, 
                                                factory_spec_unknown: newVal,
                                                factory_height: newVal ? '' : p.factory_height,
                                                factory_width: newVal ? '' : p.factory_width,
                                                factory_depth: newVal ? '' : p.factory_depth,
                                                factory_floor_height: newVal ? '' : p.factory_floor_height 
                                            }));
                                        }} 
                                    />
                                </div>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start transition-opacity duration-300 ${data.factory_spec_unknown ? 'opacity-40 pointer-events-none' : ''}`}>
                                <div className="w-full">
                                    <UnitInput 
                                        unit="米" 
                                        value={data.factory_height || ''} 
                                        onChange={v => update('factory_height', v)} 
                                        placeholder={getFactoryHeightLabel(data.propertyType)} 
                                        disabled={data.factory_spec_unknown} 
                                    />
                                    <p className="text-red-500 text-sm mt-1 font-bold">※滴水高度：屋頂最低緣至地面</p>
                                </div>
                                <UnitInput 
                                    unit="米" 
                                    value={data.factory_width || ''} 
                                    onChange={v => update('factory_width', v)} 
                                    placeholder="面寬" 
                                />
                                <UnitInput 
                                    unit="米" 
                                    value={data.factory_depth || ''} 
                                    onChange={v => update('factory_depth', v)} 
                                    placeholder="深度" 
                                />
                                <UnitInput 
                                    unit="米" 
                                    value={data.factory_floor_height || ''} 
                                    onChange={v => update('factory_floor_height', v)} 
                                    placeholder="樓板高度" 
                                />
                            </div>
                            
                            <div className="mt-8 space-y-4">
                                <p className="dynamic-text-h2 font-black text-slate-700 dark:text-slate-200">地板狀況</p>
                                <div className="space-y-3 pt-2">
                                    {FACTORY_FLOOR_OPTS.map(opt => (
                                        <div key={opt} className="space-y-3">
                                            <CheckBox 
                                                checked={data.factory_floor_condition?.includes(opt) || false} 
                                                label={opt} 
                                                onClick={() => toggleArr('factory_floor_condition', opt)} 
                                            />
                                            {opt === '其他未列項目' && data.factory_floor_condition?.includes(opt) && (
                                                <div className="pl-6 md:pl-8 animate-in fade-in zoom-in-95 duration-200">
                                                    <DetailInput value={data.factory_floor_condition_other || ''} onChange={v => update('factory_floor_condition_other', v)} placeholder="說明現況" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">定期做消防檢測</p>
                            <AccordionRadio 
                                options={['是', '否']} 
                                value={data.factory_fire_inspection || ''} 
                                onChange={v => update('factory_fire_inspection', v)} 
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">消防設施</p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {FACTORY_FIRE_OPTS.map(opt => <CheckBox key={opt} checked={data.factory_fire_safety?.includes(opt) || false} label={opt} onClick={() => toggleArr('factory_fire_safety', opt)} />)}
                            </div>
                            <div className="mt-4">
                                 <CheckBox checked={data.factory_fire_safety?.includes('其他未列項目') || false} label="其他未列項目" onClick={() => toggleArr('factory_fire_safety', '其他未列項目')} />
                                 {data.factory_fire_safety?.includes('其他未列項目') && <SubItemHighlight><DetailInput value={data.factory_fire_safety_other || ''} onChange={v => update('factory_fire_safety_other', v)} placeholder="說明現況" /></SubItemHighlight>}
                            </div>
                        </QuestionBlock>
                    </div>
                </SurveySection>

                {/* 6. Utilities */}
                <UtilitiesSection data={data} setData={setData} title="6. 電、水、瓦斯與其他設施現況" type={type} id="section-factory-q6" highlightedId={highlightedField} status={getLandQ1Status()} />
                
                {/* 7. Hardware */}
                <SurveySection id="section-factory-hardware" highlighted={highlightedField === 'section-factory-hardware'} title="7. 廠房硬體設施" status={getFactoryHardwareStatus()}>
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">貨梯設施</p>
                            <AccordionRadio 
                                options={['無', '純貨梯', '客貨兩用梯', '客貨梯分離']} 
                                value={data.factory_elevator || ''} 
                                onChange={v => setData(p => ({...p, factory_elevator: v}))} 
                                renderDetail={(opt) => (opt === '純貨梯' || opt === '客貨兩用梯' || opt === '客貨梯分離') ? (
                                    <SubItemHighlight>
                                        <div className="space-y-6">
                                            <AccordionRadio options={['可運作', '故障／停用']} value={data.factory_elevator_status || ''} onChange={v => update('factory_elevator_status', v)} />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <span className="font-bold mb-2 block text-slate-700">載重</span>
                                                    <UnitInput unit="噸/kg" value={data.factory_elevator_capacity || ''} onChange={v => update('factory_elevator_capacity', v)} placeholder="輸入載重" />
                                                </div>
                                                <div>
                                                    <span className="font-bold mb-2 block text-slate-700">車廂尺寸</span>
                                                    <UnitInput unit="公分" value={data.factory_elevator_dim || ''} onChange={v => update('factory_elevator_dim', v)} placeholder="長x寬x高" />
                                                </div>
                                                <div>
                                                    <span className="font-bold mb-2 block text-slate-700">開門尺寸</span>
                                                    <UnitInput unit="公分" value={data.factory_elevator_door_dim || ''} onChange={v => update('factory_elevator_door_dim', v)} placeholder="長x寬x高" />
                                                </div>
                                            </div>
                                        </div>
                                    </SubItemHighlight>
                                ) : null}
                            />
                        </QuestionBlock>
                        
                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">天車設施</p>
                            <AccordionRadio 
                                options={['無', '有']} 
                                value={data.factory_crane || ''} 
                                onChange={v => setData(p => ({...p, factory_crane: v}))} 
                                renderDetail={(opt) => {
                                    if (opt === '有') return (
                                        <SubItemHighlight>
                                            <DetailInput value={data.factory_crane_desc || ''} onChange={v => update('factory_crane_desc', v)} placeholder="如：天車噸數" />
                                        </SubItemHighlight>
                                    );
                                    return null;
                                }}
                            />
                        </QuestionBlock>

                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">廢水／廢氣排放</p>
                            <AccordionRadio 
                                options={FACTORY_WASTE_OPTS} 
                                value={data.factory_waste || ''} 
                                onChange={v => update('factory_waste', v)} 
                                renderDetail={(opt) => {
                                    if (opt === '有') {
                                        return (
                                            <SubItemHighlight>
                                                <AccordionRadio 
                                                    options={['已納管', '自有處理']} 
                                                    value={data.factory_waste_has_detail || ''} 
                                                    onChange={v => update('factory_waste_has_detail', v)} 
                                                />
                                            </SubItemHighlight>
                                        );
                                    }
                                    if (opt === '其他未列項目') {
                                        return (
                                            <SubItemHighlight>
                                                <DetailInput value={data.factory_waste_desc || ''} onChange={v => update('factory_waste_desc', v)} placeholder="說明現況" />
                                            </SubItemHighlight>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </QuestionBlock>
                    </div>
                </SurveySection>
                
                {/* 8. Logistics */}
                <SurveySection id="section-factory-logistics" highlighted={highlightedField === 'section-factory-logistics'} title="8. 物流動線" status={getFactoryLogisticsStatus()}>
                    <div className="space-y-8">
                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">卸貨碼頭</p>
                            <AccordionRadio options={FACTORY_DOCK_OPTS} value={data.factory_loading_dock || ''} onChange={v => update('factory_loading_dock', v)}   />
                        </QuestionBlock>
                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-6">大車進出</p>
                            <AccordionRadio options={FACTORY_TRUCK_OPTS} value={data.factory_truck_access || ''} onChange={v => update('factory_truck_access', v)}   />
                            <div className="mt-4">
                                <p className="dynamic-text-h2 font-black text-slate-700 mb-4 dark:text-slate-200">迴轉空間／緩衝區</p>
                                <DetailInput value={data.factory_truck_buffer || ''} onChange={v => update('factory_truck_buffer', v)} placeholder="說明狀況..." />
                            </div>
                        </QuestionBlock>
                    </div>
                </SurveySection>

                {/* 9. Parking */}
                {simpleParking ? (
                    <SurveySection id="section-factory-parking" highlighted={highlightedField === 'section-factory-parking'} title="9. 車位資訊" status={data.factory_parking_desc ? 'complete' : 'incomplete'}>
                         <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-4">停車資訊說明</p>
                            <DetailInput value={data.factory_parking_desc || ''} onChange={v => update('factory_parking_desc', v)} placeholder="如：門口可停3台車" />
                         </QuestionBlock>
                    </SurveySection>
                ) : (
                    <ParkingSection data={data} setData={setData} update={update} toggleArr={toggleArr} parkingLogic={parkingLogic} startNum={9} ids={{ main: 'section-factory-parking', abnormal: 'section-factory-parking-abn', supplement: 'section-factory-parking-sup' }} highlightedId={highlightedField} includeExtras={true} isFactory={true} status={getParkingStatus()} />
                )}

                {/* 10. Facilities (Similar to House Q9) */}
                <SurveySection id="section-factory-q10" highlighted={highlightedField === 'section-factory-q10'} title="10. 本案或周圍須注意設施" status={getFacilityStatus()}>
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
                                                        {isGroupA ? '設置現況：' : '維護方式：'}
                                                    </p>
                                                    <AccordionRadio 
                                                        options={isGroupA ? ['合法設置', '私人設置'] : ['管委會維護', '全體住戶維護', '使用者自行管理維護']} 
                                                        value={data.q9_solar_maintenance || ''} 
                                                        onChange={v => update('q9_solar_maintenance', v)} 
                                                    />
                                                </SubItemHighlight>
                                            </div>
                                        )}
                                        {i === '加壓受水設備' && data?.q9_items?.includes(i) && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                <SubItemHighlight>
                                                    <p className="font-bold text-xl text-slate-700 mb-3 dark:text-slate-200">維護方式：</p>
                                                    <AccordionRadio 
                                                        options={['管委會維護', '全體住戶維護', '使用者自行管理維護']} 
                                                        value={data.q9_water_booster_maintenance || ''} 
                                                        onChange={v => update('q9_water_booster_maintenance', v)} 
                                                    />
                                                    
                                                    <div className="mt-8">
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
                                                    </div>
                                                </SubItemHighlight>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                             <div className="space-y-3 text-left"><CheckBox checked={data?.q9_hasOther || false} label="其他未列項目" onClick={() => update('q9_hasOther', !data.q9_hasOther)} />{data?.q9_hasOther && <SubItemHighlight><DetailInput value={data.q9_otherDesc || ''} onChange={v => update('q9_otherDesc', v)} placeholder={isGroupA ? "說明現況" : "如：發電機"} /></SubItemHighlight>}</div>
                        </div>
                     </BooleanReveal>
                </SurveySection>
             </StepContainer>
         );
    }

    return null;
});
