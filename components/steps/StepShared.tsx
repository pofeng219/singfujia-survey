import React from 'react';
import { SurveyData, SurveyType } from '../../types';

export interface StepProps {
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


export const getFactoryHeightLabel = (pType: string) => {
    if (pType === "立體化廠辦大樓" || pType === "標準廠房(工業園區內)") return "樑下淨高／樓層高度";
    return "滴水高度";
};


// Reusable Step Container to remove duplication of layout and header styles
export const StepContainer: React.FC<{
    title: string;
    type: SurveyType;
    themeText: string;
    children: React.ReactNode;
}> = ({ title, type, themeText, children }) => {
    const borderColor = type === 'parking' ? 'border-rose-400' : (type === 'land' ? 'border-green-400' : (type === 'factory' ? 'border-orange-400' : 'border-sky-400'));
    
    return (
        <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right duration-300 pb-10">
            <h3 className={`dynamic-text-h1 font-black ${themeText} border-l-8 ${borderColor} pl-4 md:pl-6 text-left`}>
                {title}
            </h3>
            {children}
        </div>
    );
};
