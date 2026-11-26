import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Cloud, HardDrive, X, Save, Clock, FilePlus2, Check, FileInput } from 'lucide-react';
import { CaseDraftRecord } from '../firebase';

export interface QuickDraftMeta {
    exists: boolean;
    caseName?: string;
    updatedAt: number;
    source?: 'cloud' | 'local';
}

interface CaseManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    cases: CaseDraftRecord[];
    loading: boolean;
    activeCaseId: string | null;
    defaultCaseName: string;
    isSignedIn: boolean;
    quickDraftMeta: QuickDraftMeta | null;
    onLoadQuickDraft: () => Promise<void>;
    onSaveAsNew: (caseName: string) => Promise<void>;
    onUpdateActive: (caseName: string) => Promise<void>;
    onLoadCase: (record: CaseDraftRecord) => void;
    onDeleteCase: (record: CaseDraftRecord) => Promise<void>;
    onNewBlankCase: () => void;
}

function formatUpdatedAt(ts: number): string {
    if (!ts) return '剛剛';
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

export const CaseManagerModal: React.FC<CaseManagerModalProps> = ({
    isOpen,
    onClose,
    cases,
    loading,
    activeCaseId,
    defaultCaseName,
    isSignedIn,
    quickDraftMeta,
    onLoadQuickDraft,
    onSaveAsNew,
    onUpdateActive,
    onLoadCase,
    onDeleteCase,
    onNewBlankCase
}) => {
    const [caseNameInput, setCaseNameInput] = useState(defaultCaseName);
    const [saving, setSaving] = useState(false);
    const [loadingQuickDraft, setLoadingQuickDraft] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCaseNameInput(defaultCaseName);
            setConfirmDeleteId(null);
            setLoadingQuickDraft(false);
        }
    }, [isOpen, defaultCaseName]);

    if (!isOpen) return null;

    const activeCase = cases.find(c => c.id === activeCaseId) || null;

    const handleLoadQuick = async () => {
        if (loadingQuickDraft) return;
        setLoadingQuickDraft(true);
        try {
            await onLoadQuickDraft();
        } finally {
            setLoadingQuickDraft(false);
        }
    };

    const handleSaveNew = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await onSaveAsNew(caseNameInput.trim() || defaultCaseName || '未命名案件');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateCurrent = async () => {
        if (saving || !activeCaseId) return;
        setSaving(true);
        try {
            await onUpdateActive(caseNameInput.trim() || activeCase?.caseName || defaultCaseName || '未命名案件');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/70 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-sky-600 dark:bg-sky-800 px-5 py-4 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-2.5">
                        <FolderOpen className="w-6 h-6" />
                        <div>
                            <h3 className="text-lg md:text-xl font-black leading-tight">案件庫（含快速讀檔）</h3>
                            <p className="text-xs text-sky-100 font-medium">
                                {isSignedIn ? '已登入 Google：自動同步雲端與本機' : '未登入模式：儲存於本機瀏覽器'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                        aria-label="關閉"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Quick Draft Recovery Area (Top) */}
                <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 shrink-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <FileInput className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="text-sm font-black text-amber-900 dark:text-amber-200">
                                    快速暫存（自動／手動存檔）
                                </span>
                                {quickDraftMeta?.exists && quickDraftMeta.source && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-600 border border-amber-200 dark:bg-slate-800 dark:text-slate-300 dark:border-amber-800">
                                        {quickDraftMeta.source === 'cloud' ? (
                                            <><Cloud className="w-3 h-3 text-sky-500" /> 雲端</>
                                        ) : (
                                            <><HardDrive className="w-3 h-3 text-amber-500" /> 本機</>
                                        )}
                                    </span>
                                )}
                            </div>
                            {loading && !quickDraftMeta ? (
                                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-medium">
                                    正在檢查快速暫存紀錄...
                                </p>
                            ) : quickDraftMeta?.exists ? (
                                <p className="text-xs text-amber-900/85 dark:text-amber-200/90 font-medium truncate">
                                    {quickDraftMeta.caseName ? `案名：${quickDraftMeta.caseName} · ` : ''}
                                    最後儲存：{formatUpdatedAt(quickDraftMeta.updatedAt)}
                                </p>
                            ) : (
                                <p className="text-xs text-amber-800/75 dark:text-amber-300/75 font-medium">
                                    目前沒有快速暫存紀錄（點擊底部「存檔」或自動備份後將顯示於此）
                                </p>
                            )}
                        </div>
                        {quickDraftMeta?.exists && (
                            <button
                                type="button"
                                disabled={loadingQuickDraft}
                                onClick={handleLoadQuick}
                                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
                            >
                                <FileInput className="w-4 h-4" />
                                {loadingQuickDraft ? '讀取中...' : '載入快速暫存'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Save / New Action Area */}
                <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-3 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            將目前填寫內容存為案件
                        </label>
                        {activeCase && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 truncate max-w-[200px]">
                                編輯中：{activeCase.caseName}
                            </span>
                        )}
                    </div>
                    <input
                        type="text"
                        maxLength={120}
                        value={caseNameInput}
                        onChange={e => setCaseNameInput(e.target.value)}
                        placeholder="輸入案件名稱（預設使用案名）"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex flex-wrap gap-2">
                        {activeCaseId && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleUpdateCurrent}
                                className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                更新目前案件
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={saving}
                            onClick={handleSaveNew}
                            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            另存為新案件
                        </button>
                        <button
                            type="button"
                            onClick={onNewBlankCase}
                            className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                            <FilePlus2 className="w-4 h-4" />
                            開新空白表單
                        </button>
                    </div>
                </div>

                {/* Saved Cases List */}
                <div className="p-4 md:p-5 overflow-y-auto flex-grow space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>已儲存案件清單（共 {cases.length} 筆）</span>
                        <span>依最後更新時間排序</span>
                    </div>

                    {loading ? (
                        <div className="py-10 text-center text-slate-500 dark:text-slate-400 font-bold">
                            正在載入案件清單...
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 space-y-1">
                            <p className="font-bold text-base">目前尚無已儲存的案件</p>
                            <p className="text-xs">點擊上方「另存為新案件」即可建立多筆獨立草稿</p>
                        </div>
                    ) : (
                        cases.map(item => {
                            const isActive = item.id === activeCaseId;
                            const isConfirmingDelete = confirmDeleteId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`p-3.5 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                        isActive
                                            ? 'bg-sky-50/80 border-sky-400 dark:bg-sky-900/30 dark:border-sky-500'
                                            : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800/70 dark:border-slate-700 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-base text-slate-800 dark:text-slate-100 truncate">
                                                {item.caseName}
                                            </span>
                                            {isActive && (
                                                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-600 text-white">
                                                    <Check className="w-3 h-3" /> 目前載入
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                {item.source === 'cloud' ? (
                                                    <><Cloud className="w-3 h-3 text-sky-500" /> 雲端</>
                                                ) : (
                                                    <><HardDrive className="w-3 h-3 text-amber-500" /> 本機</>
                                                )}
                                            </span>
                                        </div>
                                        {item.address && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                {item.address}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1 font-medium">
                                            <Clock className="w-3 h-3" /> {formatUpdatedAt(item.updatedAt)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {isConfirmingDelete ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        await onDeleteCase(item);
                                                        setConfirmDeleteId(null);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all"
                                                >
                                                    確認刪除
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                                                >
                                                    取消
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => onLoadCase(item)}
                                                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                                                >
                                                    載入
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteId(item.id)}
                                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 transition-all"
                                                    aria-label="刪除案件"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
