import React from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { signIn, signOut } from '../utils/firebase';

export const UserMenu: React.FC = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="text-sm px-4 py-2 opacity-50">載入中...</div>;
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 shadow-inner">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600" referrerPolicy="no-referrer" />
                    ) : (
                        <UserIcon className="w-5 h-5 opacity-70" />
                    )}
                    <span className="font-medium text-sm pr-1">{user.displayName || user.email?.split('@')[0]}</span>
                </div>
                <button 
                    onClick={signOut}
                    className="flex items-center gap-2 px-3 py-2 sm:py-1.5 bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-700 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-full font-bold transition-all shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
                >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm">登出</span>
                </button>
            </div>
        );
    }

    const handleSignIn = async () => {
        try {
            await signIn();
        } catch (error: any) {
            console.error('Sign in error:', error);
            alert('登入失敗，可能是因為瀏覽器隱私權設定阻擋了彈出視窗（例如在預覽畫面中）。\n\n解決方法：\n請點擊預覽畫面右上角的「Open in new tab」按鈕，在新分頁中重新開啟應用程式再進行登入。');
        }
    };

    return (
        <button 
            onClick={handleSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-[#009FE3] hover:bg-sky-600 text-white rounded-full font-bold transition-all shadow-md active:scale-95"
        >
            <LogIn className="w-5 h-5" />
            <span className="text-sm">雲端登入</span>
        </button>
    );
};
