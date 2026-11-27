import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { SurveyData } from '../../types';
import { 
    SurveySection, SubItemHighlight, DetailInput, 
    AccordionRadio, QuestionBlock, SignaturePad,
    SectionStatus, ImageModal
} from '../SharedUI';
import { EnvironmentSection, LandQuestionsGroup, BuildingLandAccessSection } from '../ComplexSections';
import { StepProps, StepContainer } from './StepShared';

export const Step4 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText }) => {
    const [showHomicideGuide, setShowHomicideGuide] = useState(false);
    
    // Factory logic variables
    const isHiRise = (data.propertyType === "立體化廠辦大樓");
    const hideLandDetails = (data.propertyType === "立體化廠辦大樓" || data.propertyType === "連棟／分組式標準廠房");
    const hideSoil = isHiRise;

    let accessNum = 11;
    let landQ3Num = 12;
    let landQ4Num = 13;
    let soilNum = hideLandDetails ? 12 : 14;
    let envNum = hideSoil ? 12 : (hideLandDetails ? 13 : 15);
    let noteNum = envNum + 1;
    let sigNum = noteNum + 1;

    // --- Status Logic Helpers for Step 4 ---
    const getAccessStatus = (): SectionStatus => {
        const isHouse = type === 'house';
        const accessKey = isHouse ? 'q14_access' : 'land_q2_access';
        const abnormalDescKey = isHouse ? 'q14_abnormalDesc' : 'land_q2_access_desc';
        const ownerKey = isHouse ? 'q14_ownership' : 'land_q2_owner';
        const protectionKey = isHouse ? 'q14_protection' : 'land_q2_protection';
        const materialKey = isHouse ? 'q14_roadMaterial' : 'land_q2_material';
        const roadWidthKey = isHouse ? 'q14_roadWidth' : 'land_q2_roadWidth';
        const sectionKey = isHouse ? 'q14_section' : 'land_q2_access_section';
        const numberKey = isHouse ? 'q14_number' : 'land_q2_access_number';
        const buildingLineKey = isHouse ? 'q14_buildingLine' : 'land_q2_buildingLine';
        const ditchKey = isHouse ? 'q14_ditch' : 'land_q2_ditch';
        
        const accessVal = data[accessKey as keyof SurveyData] as string;
        
        if (!accessVal) return 'incomplete';
        
        if (accessVal.includes('順暢')) {
            if (!data[ownerKey as keyof SurveyData]) return 'incomplete';
            if (!data[protectionKey as keyof SurveyData]) return 'incomplete';
            
            const protectionVal = data[protectionKey as keyof SurveyData] as string;
            const needsDesc = ['分管協議約定', '取得地主同意書', '法院判決通行', '現狀通行／既成道路', '現況未明／無保障'].includes(protectionVal);
            const protectionDescKey = isHouse ? 'q14_protectionDesc' : 'land_q2_protectionDesc';
            if (needsDesc && !data[protectionDescKey as keyof SurveyData]) return 'incomplete';
            
            // Land Numbers
            if (!data[sectionKey as keyof SurveyData] || !data[numberKey as keyof SurveyData]) return 'incomplete';

            if (type === 'land' && !data[materialKey as keyof SurveyData]) return 'incomplete';
            if (!data[roadWidthKey as keyof SurveyData]) return 'incomplete';

            if (type === 'land') {
                const hideBuildingLine = data.propertyType === '農地';
                const hideDitch = false;
                const buildingLineOtherKey = isHouse ? 'q14_buildingLineOther' : 'land_q2_buildingLine_other';
                if (!hideBuildingLine) {
                    if (!data[buildingLineKey as keyof SurveyData]) return 'incomplete';
                    if (data[buildingLineKey as keyof SurveyData] === '其他未列項目' && !data[buildingLineOtherKey as keyof SurveyData]) return 'incomplete';
                }
                if (!hideDitch && !data[ditchKey as keyof SurveyData]) return 'incomplete';
            }
        } else if (accessVal.includes('受限') || accessVal === '其他未列項目' || accessVal.includes('袋地')) {
            if (!data[abnormalDescKey as keyof SurveyData]) return 'incomplete';
        }
        
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

    const getSoilStatus = (): SectionStatus => {
        if (!data.soil_q1_status) return 'incomplete';
        if ((data.soil_q1_status === '有' || data.soil_q1_status === '待查證') && !data.soil_q1_desc) return 'incomplete';
        return 'complete';
    };

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
            if ((data.q17_homicide === '有' || data.q17_homicide === '是' || data.q17_homicide === '待查證') && !data.q17_homicide_desc) return 'incomplete';
        }
        return 'complete';
    };

    return (
        <StepContainer title={type === 'land' ? '第四步：環境／其他' : '第四步：外觀／環境'} type={type} themeText={themeText}>
            {/* Access Section */}
            <BuildingLandAccessSection 
                data={data} setData={setData} update={update}
                prefix={type === 'house' ? 'q14' : 'land_q2'} 
                title={type === 'house' ? "10. 進出通行與臨路現況" : (type === 'land' ? "8. 進出通行與臨路現況" : `${accessNum}. 廠房進出通行與臨路的現況`)}
                id={type === 'house' ? "section-q14" : "section-land-q2"}
                highlightedId={highlightedField}
                type={type}
                status={getAccessStatus()}
            />

            {/* Factory Land Details (Q3/Q4) */}
            {type === 'factory' && !hideLandDetails && (
                 <LandQuestionsGroup 
                    data={data} setData={setData} update={update}
                    titles={{ q3: `${landQ3Num}. 土地鑑界與界標現況與產權與使用糾紛現況`, q4: `${landQ4Num}. 土地徵收預定地與重測區現況` }}
                    ids={{ q3: "section-land-q3", q4: "section-land-q4" }}
                    highlightedId={highlightedField}
                    hideQ2={true}
                    statusQ3={getLandQ3Status()}
                    statusQ4={getLandQ4Status()}
                 />
            )}

            {/* Soil */}
            {(type === 'land' || (type === 'factory' && !hideSoil)) && (
                 <SurveySection id="section-soil" highlighted={highlightedField === 'section-soil'} title={type === 'land' ? "9. 土壤與地下埋設物現況" : `${soilNum}. 土壤與地下埋設物現況`} status={getSoilStatus()}> 
                    <QuestionBlock>
                        <p className="dynamic-text-h2 font-black text-slate-700 mb-6 dark:text-slate-200">土壤汙染與地下掩埋物現況</p>
                        <AccordionRadio 
                            options={['無', '有', '待查證']} 
                            value={data.soil_q1_status || ''} 
                            onChange={v => setData(prev => ({ ...prev, soil_q1_status: v, soil_q1_desc: (v === '有' || v === '待查證') ? prev.soil_q1_desc : '' }))} 
                            renderDetail={(opt) => (opt === '有' || opt === '待查證') ? <SubItemHighlight><DetailInput value={data.soil_q1_desc || ''} onChange={v => update('soil_q1_desc', v)} placeholder="說明現況" /></SubItemHighlight> : null}
                        />
                    </QuestionBlock>
                 </SurveySection>
            )}

            {/* Environment */}
            <EnvironmentSection 
                data={data} update={update} toggleArr={toggleArr} id="section-q16" 
                title={type === 'house' ? "11. 重要環境設施與常見環境抗性設施" : (type === 'land' ? "10. 重要環境設施與常見環境抗性設施" : `${envNum}. 重要環境設施與常見環境抗性設施`)} 
                highlightedId={highlightedField} 
                warningText="※內政部於 104 年 10 月新版不動產說明書中，房仲業者須對於受託銷售之不動產，應調查周邊半徑 300 公尺範圍內之重要環境設施"
                status={getEnvStatus()}
            />

            {/* Notes */}
            <SurveySection 
                id="section-q17" 
                highlighted={highlightedField === 'section-q17'} 
                title={type === 'house' ? "12. 本案與社區特殊或影響交易事項" : (type === 'land' ? "11. 本案或周圍特殊或影響交易事項" : `${noteNum}. 本案與社區特殊或影響交易事項`)} 
                status={getNotesStatus()}
            >
                <ImageModal 
                    isOpen={showHomicideGuide} 
                    onClose={() => setShowHomicideGuide(false)} 
                    imageSrc="https://lh3.googleusercontent.com/d/1UIxr5rrpkp3GZDgW8Qk-1bryZASQvwGq" 
                    title="重大事故與非自然身故紀錄參考圖例" 
                />
                <div className="space-y-10">
                    {/* Sub-question 1: Homicide */}
                    {type !== 'land' && (
                        <QuestionBlock>
                            <p className="dynamic-text-h2 font-black text-slate-700 mb-4 leading-normal">重大事故與非自然身故紀錄</p>
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowHomicideGuide(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-base font-bold shrink-0 shadow-sm border border-sky-200 w-fit"
                                    type="button"
                                >
                                    <ImageIcon size={20} />
                                    參考圖例
                                </button>
                            </div>
                            <div className="mb-4">
                                 <div className="w-full py-4 px-5 md:py-5 md:px-6 bg-[#FDE047] rounded-xl md:rounded-2xl flex items-start gap-3 shadow-sm dark:bg-yellow-900/40">
                                     <p className="text-xl md:text-2xl text-red-700 font-bold leading-normal dark:text-red-300 w-full text-left">
                                         ※兇殺、自殺、一氧化碳中毒或其他非自然死亡之情事
                                     </p>
                                 </div>
                            </div>
                            <AccordionRadio 
                                options={['無', '有', '待查證']} 
                                value={data.q17_homicide || ''} 
                                onChange={v => setData(prev => ({ ...prev, q17_homicide: v, q17_homicide_desc: (v === '有' || v === '待查證') ? prev.q17_homicide_desc : '' }))} 
                                renderDetail={(opt) => (opt === '有' || opt === '待查證') ? (
                                    <SubItemHighlight>
                                        <DetailInput 
                                            value={data.q17_homicide_desc || ''} 
                                            onChange={v => update('q17_homicide_desc', v)} 
                                            placeholder="如本戶曾發生或樓下鄰居曾發生" 
                                        />
                                    </SubItemHighlight>
                                ) : null}
                            />
                        </QuestionBlock>
                    )}

                    {/* Sub-question 2: Other Notes */}
                    <QuestionBlock>
                         {type !== 'land' && <p className="dynamic-text-h2 font-black text-slate-700 mb-4 leading-normal">其他特殊或影響交易狀況補充</p>}
                         <div className="mb-4">
                             <div className="w-full py-4 px-5 md:py-5 md:px-6 bg-[#FDE047] rounded-xl md:rounded-2xl flex items-start gap-3 shadow-sm dark:bg-yellow-900/40">
                                 <p className="text-xl md:text-2xl text-red-700 font-bold leading-normal dark:text-red-300 w-full text-left">
                                     {type === 'house' ? "※氯離子過高、海砂屋、危險建築、新聞事件、糾紛等" :
                                     (type === 'land' ? "※前身為亂葬崗、環保議題、新聞事件、開發現況等" :
                                     "※危險建築、新聞事件、糾紛等")}
                                 </p>
                             </div>
                        </div>
                        
                        <AccordionRadio 
                            options={['無', '有', '待查證']} 
                            value={type === 'land' ? (data.land_q8_special === '是' ? '有' : (data.land_q8_special === '否' ? '無' : (data.land_q8_special === '待查證' ? '待查證' : ''))) : (data.q17_issue === '是' ? '有' : (data.q17_issue === '否' ? '無' : (data.q17_issue === '待查證' ? '待查證' : '')))} 
                            onChange={v => {
                                const val = v === '無' ? '否' : (v === '有' ? '是' : (v === '待查證' ? '待查證' : ''));
                                if (type === 'land') {
                                    setData(prev => ({ ...prev, land_q8_special: val, land_q8_special_desc: (val === '是' || val === '待查證') ? prev.land_q8_special_desc : '' }));
                                } else {
                                    setData(prev => ({ ...prev, q17_issue: val, q17_desc: (val === '是' || val === '待查證') ? prev.q17_desc : '' }));
                                }
                            }} 
                            renderDetail={(opt) => (opt === '有' || opt === '待查證') ? (
                                <SubItemHighlight>
                                    <DetailInput 
                                        value={type === 'land' ? (data.land_q8_special_desc || '') : (data.q17_desc || '')} 
                                        onChange={v => update(type === 'land' ? 'land_q8_special_desc' : 'q17_desc', v)} 
                                        placeholder="說明現況" 
                                    />
                                </SubItemHighlight>
                            ) : null}
                        />
                    </QuestionBlock>
                </div>
            </SurveySection>

            {/* Camera Reminder */}
            <div className="bg-sky-100 border-l-8 border-sky-500 p-6 rounded-r-xl shadow-md mb-8 animate-in slide-in-from-left-2">
                <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                        <span className="text-3xl">📸</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-sky-800 mb-1">離開前請確認拍攝</h3>
                        <p className="text-sky-700 font-bold text-lg">建物外觀、門牌、電箱、內部現況</p>
                    </div>
                </div>
            </div>

            {/* Signature */}
            <SurveySection id="section-signature" highlighted={highlightedField === 'section-signature'} title={type === 'house' ? "13. 調查人員簽章" : (type === 'land' ? "12. 調查人員簽章" : `${sigNum}. 調查人員簽章`)} status={data.signatureImage ? 'complete' : 'incomplete'}>
                <SignaturePad value={data.signatureImage} onChange={(v) => update('signatureImage', v)} />
            </SurveySection>
        </StepContainer>
    );
});

