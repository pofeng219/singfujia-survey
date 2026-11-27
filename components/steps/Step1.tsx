import React from 'react';
import { 
    ACCESS_SUB_OPTIONS, ACCESS_SUB_OPTIONS_LAND, ACCESS_SUB_OPTIONS_PARKING, ACCESS_SUB_OPTIONS_FACTORY, 
    HOUSE_PROPERTY_TYPE_OPTIONS, LAND_PROPERTY_TYPE_OPTIONS, FACTORY_PROPERTY_TYPE_OPTIONS, GROUP_A_TYPES
} from '../../constants';
import { 
    CheckBox, SurveySection, SubItemHighlight, DetailInput, InlineWarning, 
    AccordionRadio, QuestionBlock, BooleanReveal, FormInput, SectionStatus
} from '../SharedUI';
import { ROCDatePicker } from '../ROCDatePicker';
import { StepProps, StepContainer } from './StepShared';

export const Step1 = React.memo<StepProps>(({ data, setData, update, toggleArr, type, highlightedField, themeText, themeBorder }) => {
    // Status Logic for Step 1
    const getAccessStatus = (): SectionStatus => {
        if (type !== 'parking') {
            if (!data.propertyType) return 'incomplete';
            if (type === 'factory' && data.propertyType === '其他特殊工業設施' && !data.propertyTypeOther) return 'incomplete';
            if (type === 'house' && data.propertyType === '其他未列項目' && !data.propertyTypeOther) return 'incomplete';
            if (type === 'land' && data.propertyType === '其他未列項目' && !data.propertyTypeOther) return 'incomplete';
        }

        if (!data.access) return 'incomplete';
        if (data.access === '不可進入') {
            if (!data.accessType || data.accessType.length === 0) return 'incomplete';
            if (data.accessType.includes('其他未列項目') && !data.accessOther) return 'incomplete';
        }
        return 'complete';
    };

    return (
        <StepContainer title="第一步：基本資料" type={type} themeText={themeText}>
            <div className={`space-y-4 md:space-y-6 warm-card p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm ${themeBorder}`}>
                <FormInput id="field-caseName" label="物件案名" value={data?.caseName || ''} onChange={v => update('caseName', v)} placeholder="輸入案名" highlighted={highlightedField === 'field-caseName'} />
                <FormInput id="field-address" label={type === 'land' ? '坐落位置' : (type === 'parking' ? '標的位置' : '標的地址')} value={data?.address || ''} onChange={v => update('address', v)} placeholder={type === 'land' ? "輸入坐落位置或相關位置" : "輸入地址／位置"} highlighted={highlightedField === 'field-address'} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <FormInput id="field-storeName" label="所屬店名" value={data?.storeName || ''} onChange={v => update('storeName', v)} placeholder="輸入店名" highlighted={highlightedField === 'field-storeName'} />
                    <FormInput id="field-agentName" label="調查業務" value={data?.agentName || ''} onChange={v => update('agentName', v)} placeholder="輸入姓名" highlighted={highlightedField === 'field-agentName'} />
                </div>
                <div className="space-y-3"><label className="block text-slate-800 font-black mb-2 dynamic-text-h2 text-left leading-normal">填寫日期</label><div className="mt-1"><ROCDatePicker value={data?.fillDate || ''} onChange={(d) => update('fillDate', d)} /></div></div>
            </div>
            <SurveySection id="section-access" highlighted={highlightedField === 'section-access'} title={type === 'factory' || type === 'house' || type === 'land' ? "本物件型態與現況" : "本物件現況"} className={themeBorder} status={getAccessStatus()}>
                {type === 'factory' && (
                    <>
                        <QuestionBlock id="section-propertyType" className={`flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'error-highlight-anim transition-all duration-500' : 'transition-all duration-500'}`}>
                            <p className="dynamic-text-h2 font-black text-slate-700 text-left leading-normal">本物件型態</p>
                            <AccordionRadio options={FACTORY_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => { const nextIsGroupA = GROUP_A_TYPES.includes(v); return { ...prev, propertyType: v, propertyTypeOther: v === '其他特殊工業設施' ? prev.propertyTypeOther : '', house_solar_status: nextIsGroupA ? prev.house_solar_status : '', water_booster: nextIsGroupA ? prev.water_booster : '', water_booster_items: nextIsGroupA ? prev.water_booster_items : [], water_booster_desc: nextIsGroupA ? prev.water_booster_desc : '' }; }); }} renderDetail={opt => opt === '其他特殊工業設施' ? <SubItemHighlight><DetailInput value={data.propertyTypeOther || ''} onChange={v => update('propertyTypeOther', v)} placeholder="說明物件型態" /></SubItemHighlight> : null} />
                        </QuestionBlock>
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <BooleanReveal 
                                label="本物件現況"
                                value={data?.access || ''}
                                onChange={(v) => { setData(prev => ({ ...prev, access: v, accessType: v === '不可進入' ? prev.accessType : [], accessOther: v === '不可進入' ? prev.accessOther : '' })); }}
                                options={['可進入', '不可進入']}
                                trigger="不可進入"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-6 place-items-stretch">{ACCESS_SUB_OPTIONS_FACTORY.map(opt => (<CheckBox key={opt} checked={data?.accessType?.includes(opt) || false} label={opt} onClick={() => toggleArr('accessType', opt)} />))}</div>
                                {data?.accessType?.includes('其他未列項目') && (<SubItemHighlight className="w-full"><DetailInput value={data?.accessOther || ''} onChange={v => update('accessOther', v)} placeholder="說明現況" /></SubItemHighlight>)}
                                <div className="mt-4 md:mt-6"><InlineWarning>若為上述現況，建議待整屋搬空/清空後再進行完整調查</InlineWarning></div>
                            </BooleanReveal>
                        </div>
                    </>
                )}
                {type === 'house' && (
                     <QuestionBlock id="section-propertyType" className={`flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'error-highlight-anim transition-all duration-500' : 'transition-all duration-500'}`}>
                        <p className="dynamic-text-h2 font-black text-slate-700 text-left leading-normal">本物件型態</p>
                        <AccordionRadio options={HOUSE_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => { const nextIsGroupA = GROUP_A_TYPES.includes(v); return { ...prev, propertyType: v, propertyTypeOther: v === '其他未列項目' ? prev.propertyTypeOther : '', house_solar_status: nextIsGroupA ? prev.house_solar_status : '', water_booster: nextIsGroupA ? prev.water_booster : '', water_booster_items: nextIsGroupA ? prev.water_booster_items : [], water_booster_desc: nextIsGroupA ? prev.water_booster_desc : '' }; }); }} renderDetail={opt => opt === '其他未列項目' ? (
                             <SubItemHighlight>
                                 <DetailInput value={data.propertyTypeOther || ''} onChange={v => update('propertyTypeOther', v)} placeholder="說明現況" />
                             </SubItemHighlight>
                        ) : null} />
                    </QuestionBlock>
                )}
                {type === 'land' && (
                     <QuestionBlock id="section-propertyType" className={`flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 animate-in fade-in slide-in-from-top-2 ${highlightedField === 'section-propertyType' ? 'error-highlight-anim transition-all duration-500' : 'transition-all duration-500'}`}>
                        <p className="dynamic-text-h2 font-black text-slate-700 text-left leading-normal">本物件型態</p>
                        <AccordionRadio options={LAND_PROPERTY_TYPE_OPTIONS} value={data?.propertyType || ''} onChange={(v) => { setData(prev => ({ ...prev, propertyType: v, propertyTypeOther: v === '其他未列項目' ? prev.propertyTypeOther : '', land_q7_fire_setback: v === '工業地' ? prev.land_q7_fire_setback : '', land_q7_road_opened: v === '其他未列項目' ? prev.land_q7_road_opened : '' })); }} renderDetail={opt => opt === '其他未列項目' ? (
                             <SubItemHighlight>
                                 <DetailInput value={data.propertyTypeOther || ''} onChange={v => update('propertyTypeOther', v)} placeholder="如：道路用地、公設地" />
                             </SubItemHighlight>
                        ) : null} />
                    </QuestionBlock>
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
                        {data?.accessType?.includes('其他未列項目') && (<SubItemHighlight className="w-full"><DetailInput value={data?.accessOther || ''} onChange={v => update('accessOther', v)} placeholder="說明現況" /></SubItemHighlight>)}
                        {type !== 'parking' && <div className="mt-4 md:mt-6"><InlineWarning>{type === 'land' ? '若為上述現況，建議待找可進行調查時間點時再進行完整調查' : '若為上述現況，建議待整屋搬空/清空後再進行完整調查'}</InlineWarning></div>}
                    </BooleanReveal>
                )}
            </SurveySection>
        </StepContainer>
    );
});
