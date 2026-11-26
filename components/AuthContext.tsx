import React, { createContext, useContext, useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { onAuthStateChanged, User, signInWithPopup, googleProvider, auth, signOut } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async () => {
        try {
            setAuthError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Login error", error);
            if (error.code === 'auth/popup-closed-by-user') {
                return;
            }
            if (error.code === 'auth/popup-blocked') {
                setAuthError("登入視窗被瀏覽器阻擋了，請允許開啟彈出視窗，或者嘗試「在新分頁開啟」此網站。");
            } else if (error.code === 'auth/unauthorized-domain') {
                setAuthError("登入失敗：此網域未獲授權。\n\n請前往 Firebase 控制台 (Authentication -> Settings -> Authorized domains) 將此網頁的網址加入授權清單中。");
            } else {
                setAuthError("登入失敗，請重試。詳細錯誤：" + (error?.message || "未知錯誤"));
            }
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
            {authError && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAuthError(null)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg p-6 md:p-8 border-4 border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <button
                            type="button"
                            onClick={() => setAuthError(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
                            aria-label="關閉提示"
                        >
                            <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </button>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6 pr-8">登入提示</h3>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border-2 border-rose-100 dark:border-rose-800 flex gap-4 items-start mb-6">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
                            <p className="text-rose-800 dark:text-rose-200 font-bold text-lg whitespace-pre-line">{authError}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAuthError(null)}
                            className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-xl active:scale-95 transition-transform dark:bg-slate-700 shadow-lg"
                        >
                            我知道了
                        </button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
