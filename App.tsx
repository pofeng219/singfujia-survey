
import { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyType } from './types';
import { ModeSelectionPage } from './components/ModeSelectionPage';
import { InterfaceContext, InterfaceMode } from './components/InterfaceContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LogIn, LogOut, RefreshCw, User as UserIcon } from 'lucide-react';
import {
    applyVersionReload,
    checkServerBuildVersion,
    cleanupVersionQueryParam,
    clearStaleBrowserCaches,
} from './utils/versionCheck';

const TopAuthBar = () => {
    const { user, loading, login, logout } = useAuth();
    
    if (loading) return null;

    return (
        <div className="bg-sky-600 text-white px-4 py-2 flex justify-between items-center text-sm lg:text-base font-bold shadow-md z-50 relative">
            <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                {user ? (
                    <span>跨平台同步中 - 哈囉，{user.displayName?.split(' ')[0] || '使用者'}</span>
                ) : (
                    <span>手機存檔後，回辦公室用電腦登入即可接續填寫</span>
                )}
            </div>
            {user ? (
                <button onClick={logout} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>登出</span>
                </button>
            ) : (
                <button onClick={login} className="flex items-center gap-1 bg-white text-sky-700 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                    <LogIn className="w-4 h-4" />
                    <span>Google 登入同步</span>
                </button>
            )}
        </div>
    );
};

const AppContent = () => {
    const [interfaceMode, setInterfaceMode] = useState<InterfaceMode | null>(null);
    const [systemType, setSystemType] = useState<SurveyType | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [pendingBuildId, setPendingBuildId] = useState<string | null>(null);
    const systemTypeRef = useRef<SurveyType | null>(null);

    useEffect(() => {
        systemTypeRef.current = systemType;
    }, [systemType]);

    // Clean legacy caches & automatically check for newly deployed builds
    useEffect(() => {
        cleanupVersionQueryParam();
        void clearStaleBrowserCaches();

        let active = true;
        const verifyLatestVersion = async () => {
            const remoteBuildId = await checkServerBuildVersion();
            if (!active || !remoteBuildId) return;
            // If user is not currently editing a form, auto-reload immediately to apply the new version
            if (!systemTypeRef.current) {
                const reloaded = await applyVersionReload(remoteBuildId, false);
                if (!reloaded && active) {
                    setPendingBuildId(remoteBuildId);
                }
            } else {
                setPendingBuildId(remoteBuildId);
            }
        };

        void verifyLatestVersion();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void verifyLatestVersion();
            }
        };
        const handleFocus = () => {
            void verifyLatestVersion();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        return () => {
            active = false;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

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

    const updateBanner = pendingBuildId ? (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between gap-3 text-sm lg:text-base font-bold shadow-md z-50 relative no-print">
            <span>偵測到系統已更新至最新版本，請先存檔後點擊立即更新以載入最新內容。</span>
            <button
                type="button"
                onClick={() => void applyVersionReload(pendingBuildId, true)}
                className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
                <RefreshCw className="w-4 h-4" />
                <span>立即更新</span>
            </button>
        </div>
    ) : null;

    if (!interfaceMode) {
        return (
            <div className="flex flex-col h-[100dvh]">
                <TopAuthBar />
                {updateBanner}
                <div className="flex-1 overflow-hidden">
                    <ModeSelectionPage onSelect={setInterfaceMode} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                </div>
            </div>
        );
    }

    if (!systemType) {
        return (
            <div className="flex flex-col h-[100dvh]">
                <TopAuthBar />
                {updateBanner}
                <div className="flex-1 overflow-hidden">
                    <InterfaceContext.Provider value={interfaceMode}>
                        <LandingPage onSelect={setSystemType} isDarkMode={isDarkMode} toggleTheme={toggleTheme} onBack={() => setInterfaceMode(null)} />
                    </InterfaceContext.Provider>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh]">
            <TopAuthBar />
            {updateBanner}
            <div className="flex-1 overflow-hidden relative">
                <InterfaceContext.Provider value={interfaceMode}>
                    <SurveyForm 
                        key={systemType} 
                        type={systemType} 
                        onBack={() => setSystemType(null)} 
                        isDarkMode={isDarkMode} 
                        toggleTheme={toggleTheme} 
                    />
                </InterfaceContext.Provider>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;