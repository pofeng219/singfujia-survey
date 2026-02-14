
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyType } from './types';

const App = () => {
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

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    if (!systemType) {
        return <LandingPage onSelect={setSystemType} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }

    return (
        <SurveyForm 
            key={systemType} 
            type={systemType} 
            onBack={() => setSystemType(null)} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
        />
    );
};

export default App;