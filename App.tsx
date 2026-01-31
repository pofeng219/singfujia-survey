import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyType } from './types';

const App = () => {
    const [systemType, setSystemType] = useState<SurveyType | null>(null);

    if (!systemType) {
        return <LandingPage onSelect={setSystemType} />;
    }

    return <SurveyForm key={systemType} type={systemType} onBack={() => setSystemType(null)} />;
};

export default App;