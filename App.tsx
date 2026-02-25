
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
        <>
            <SurveyForm 
                key={systemType} 
                type={systemType} 
                onBack={() => setSystemType(null)} 
                isDarkMode={isDarkMode} 
                toggleTheme={toggleTheme} 
            />
            <ScrollToTopButton />
        </>
    );
};

// Scroll to Top Button Component
const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Lower threshold to 100px to make it appear sooner
            if (window.pageYOffset > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-[9999] p-4 rounded-full bg-sky-600 text-white shadow-xl hover:bg-sky-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 border-4 border-white dark:border-slate-800"
                    aria-label="Scroll to top"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                    </svg>
                </button>
            )}
        </>
    );
};

export default App;