
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyType } from './types';
import { ModeSelectionPage } from './components/ModeSelectionPage';
import { InterfaceContext, InterfaceMode } from './components/InterfaceContext';

const App = () => {
    const [interfaceMode, setInterfaceMode] = useState<InterfaceMode | null>(null);
    const [systemType, setSystemType] = useState<SurveyType | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize Dark Mode based on system preference or local storage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
    }, []);

    // Apply Dark Mode class to html element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Apply Interface Mode class to html element
    useEffect(() => {
        if (interfaceMode === 'standard') {
            document.documentElement.classList.add('mode-standard');
            document.documentElement.classList.remove('mode-friendly');
        } else if (interfaceMode === 'friendly') {
            document.documentElement.classList.add('mode-friendly');
            document.documentElement.classList.remove('mode-standard');
        } else {
            document.documentElement.classList.remove('mode-standard', 'mode-friendly');
        }
    }, [interfaceMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    if (!interfaceMode) {
        return <ModeSelectionPage onSelect={setInterfaceMode} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }

    if (!systemType) {
        return (
            <InterfaceContext.Provider value={interfaceMode}>
                <LandingPage onSelect={setSystemType} isDarkMode={isDarkMode} toggleTheme={toggleTheme} onBack={() => setInterfaceMode(null)} />
            </InterfaceContext.Provider>
        );
    }

    return (
        <InterfaceContext.Provider value={interfaceMode}>
            <SurveyForm 
                key={systemType} 
                type={systemType} 
                onBack={() => setSystemType(null)} 
                isDarkMode={isDarkMode} 
                toggleTheme={toggleTheme} 
            />
        </InterfaceContext.Provider>
    );
};

export default App;