import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Cloud, HardDrive, X, Save, Clock, FilePlus2, Check, FileInput, Pencil } from 'lucide-react';
import { CaseDraftRecord } from '../firebase';
import { useInterface } from './InterfaceContext';

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
    isSignedIn: boolean;
    quickDraftMeta: QuickDraftMeta | null;
    onLoadQuickDraft: () => Promise<void>;
    onLoadCase: (record: CaseDraftRecord) => void;
    onRenameCase: (record: CaseDraftRecord, newName: string) => Promise<void>;
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
    isSignedIn,
    quickDraftMeta,
    onLoadQuickDraft,
    onLoadCase,
    onRenameCase,
    onDeleteCase,
    onNewBlankCase
}) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const [loadingQuickDraft, setLoadingQuickDraft] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [renaming, setRenaming] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfirmDeleteId(null);
            setLoadingQuickDraft(false);
            setEditingId(null);
            setEditingName('');
            setRenaming(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLoadQuick = async () => {
        if (loadingQuickDraft) return;
        setLoadingQuickDraft(true);
        try {
            await onLoadQuickDraft();
        } finally {
            setLoadingQuickDraft(false);
        }
    };

    const startEditTitle = (item: CaseDraftRecord) => {
        setConfirmDeleteId(null);
        setEditingId(item.id);
        setEditingName(item.caseName);
    };

    const cancelEditTitle = () => {
        if (renaming) return;
        setEditingId(null);
        setEditingName('');
    };

    const handleConfirmRename = async (item: CaseDraftRecord) => {
        if (renaming) return;
        const trimmed = editingName.trim().slice(0, 120);
        if (!trimmed) return;
        if (trimmed === item.caseName) {
            setEditingId(null);
            setEditingName('');
            return;
        }
        setRenaming(true);
        try {
            await onRenameCase(item, trimmed);
            setEditingId(null);
            setEditingName('');
        } finally {
            setRenaming(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/70 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className={`bg-white dark:bg-slate-800 w-full ${isStandard ? 'max-w-xl' : 'max-w-2xl'} rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[88vh]`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`bg-sky-600 dark:bg-sky-800 ${isStandard ? 'px-5 py-4' : 'px-6 py-5'} flex items-center justify-between text-white shrink-0`}>
                    <div className="flex items-center gap-3">
                        <FolderOpen className={isStandard ? 'w-6 h-6' : 'w-8 h-8 shrink-0'} />
                        <div>
                            <h3 className={`${isStandard ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-black leading-tight`}>
                                案件庫（含快速讀檔）
                            </h3>
                            <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg mt-0.5'} text-sky-100 font-medium`}>
                                {isSignedIn ? '已登入 Google：自動同步雲端與本機' : '未登入模式：儲存於本機瀏覽器'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${isStandard ? 'p-2' : 'p-2.5'} rounded-xl bg-white/15 hover:bg-white/25 transition-colors shrink-0`}
                        aria-label="關閉"
                    >
                        <X className={isStandard ? 'w-5 h-5' : 'w-7 h-7'} />
                    </button>
                </div>

                {/* Quick Draft Recovery Area (Top) */}
                <div className={`${isStandard ? 'px-4 py-3 md:px-5 md:py-3.5' : 'px-5 py-4 md:px-6 md:py-5'} border-b border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 shrink-0`}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className={`min-w-0 flex-1 ${isStandard ? 'space-y-0.5' : 'space-y-1.5'}`}>
                            <div className="flex items-center gap-2 flex-wrap">
                                <FileInput className={`${isStandard ? 'w-4 h-4' : 'w-6 h-6'} text-amber-600 dark:text-amber-400 shrink-0`} />
                                <span className={`${isStandard ? 'text-sm' : 'text-xl md:text-2xl'} font-black text-amber-900 dark:text-amber-200`}>
                                    快速暫存（自動備份）
                                </span>
                                {quickDraftMeta?.exists && quickDraftMeta.source && (
                                    <span className={`inline-flex items-center gap-1 ${isStandard ? 'text-[11px] px-2 py-0.5' : 'text-sm md:text-base px-2.5 py-1'} font-bold rounded-md bg-white/90 text-slate-600 border border-amber-200 dark:bg-slate-800 dark:text-slate-300 dark:border-amber-800`}>
                                        {quickDraftMeta.source === 'cloud' ? (
                                            <><Cloud className={`${isStandard ? 'w-3 h-3' : 'w-4 h-4'} text-sky-500`} /> 雲端</>
                                        ) : (
                                            <><HardDrive className={`${isStandard ? 'w-3 h-3' : 'w-4 h-4'} text-amber-500`} /> 本機</>
                                        )}
                                    </span>
                                )}
                            </div>
                            {loading && !quickDraftMeta ? (
                                <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg'} text-amber-800/80 dark:text-amber-300/80 font-medium`}>
                                    正在檢查自動備份紀錄...
                                </p>
                            ) : quickDraftMeta?.exists ? (
                                <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg'} text-amber-900/85 dark:text-amber-200/90 font-medium truncate`}>
                                    {quickDraftMeta.caseName ? `案名：${quickDraftMeta.caseName} · ` : ''}
                                    最後備份：{formatUpdatedAt(quickDraftMeta.updatedAt)}
                                </p>
                            ) : (
                                <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg leading-snug'} text-amber-800/75 dark:text-amber-300/75 font-medium`}>
                                    目前沒有自動備份紀錄（系統每分鐘會自動備份填寫進度）
                                </p>
                            )}
                        </div>
                        {quickDraftMeta?.exists && (
                            <button
                                type="button"
                                disabled={loadingQuickDraft}
                                onClick={handleLoadQuick}
                                className={`${isStandard ? 'px-3.5 py-2 text-sm' : 'px-5 py-3 text-lg md:text-xl'} rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0`}
                            >
                                <FileInput className={isStandard ? 'w-4 h-4' : 'w-5 h-5'} />
                                {loadingQuickDraft ? '讀取中...' : '載入快速暫存'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Saved Cases List */}
                <div className={`${isStandard ? 'p-4 md:p-5 space-y-2.5' : 'p-5 md:p-6 space-y-3.5'} overflow-y-auto flex-grow`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex flex-col">
                            <span className={`${isStandard ? 'text-sm' : 'text-xl md:text-2xl'} font-black text-slate-700 dark:text-slate-200`}>
                                已儲存案件清單（共 {cases.length} 筆）
                            </span>
                            <span className={`${isStandard ? 'text-[11px]' : 'text-sm md:text-base mt-0.5'} font-medium text-slate-500 dark:text-slate-400`}>
                                依最後更新時間排序
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onNewBlankCase}
                            className={`${isStandard ? 'py-1.5 px-3 text-xs sm:text-sm' : 'py-2.5 px-4 text-base md:text-lg'} rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0`}
                        >
                            <FilePlus2 className={isStandard ? 'w-4 h-4' : 'w-5 h-5'} />
                            開新空白表單
                        </button>
                    </div>

                    {loading ? (
                        <div className={`py-10 text-center text-slate-500 dark:text-slate-400 font-bold ${isStandard ? 'text-base' : 'text-xl md:text-2xl'}`}>
                            正在載入案件清單...
                        </div>
                    ) : cases.length === 0 ? (
                        <div className={`py-10 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 ${isStandard ? 'space-y-1' : 'space-y-2'}`}>
                            <p className={`font-bold ${isStandard ? 'text-base' : 'text-xl md:text-2xl'}`}>目前尚無已儲存的案件</p>
                            <p className={isStandard ? 'text-xs' : 'text-base md:text-lg'}>點擊底部「存檔」按鈕即可設定名稱並建立獨立存檔</p>
                        </div>
                    ) : (
                        cases.map(item => {
                            const isActive = item.id === activeCaseId;
                            const isConfirmingDelete = confirmDeleteId === item.id;
                            const isEditing = editingId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`${isStandard ? 'p-3.5 gap-3' : 'p-4 md:p-5 gap-4'} rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between ${
                                        isActive
                                            ? 'bg-sky-50/80 border-sky-400 dark:bg-sky-900/30 dark:border-sky-500'
                                            : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800/70 dark:border-slate-700 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {isEditing ? (
                                        <form
                                            className="w-full flex flex-col sm:flex-row sm:items-center gap-2.5"
                                            onSubmit={e => {
                                                e.preventDefault();
                                                handleConfirmRename(item);
                                            }}
                                        >
                                            <input
                                                type="text"
                                                autoFocus
                                                maxLength={120}
                                                value={editingName}
                                                disabled={renaming}
                                                onChange={e => setEditingName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Escape') cancelEditTitle();
                                                }}
                                                placeholder="請輸入新的案件標題"
                                                className={`flex-1 min-w-0 ${isStandard ? 'px-3 py-1.5 text-sm md:text-base' : 'px-4 py-2.5 text-lg md:text-xl'} rounded-lg border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-sky-600`}
                                            />
                                            <div className="flex items-center gap-2 shrink-0 justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={renaming || !editingName.trim()}
                                                    className={`${isStandard ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-base md:text-lg'} rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50`}
                                                >
                                                    {renaming ? '儲存中...' : '儲存標題'}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={renaming}
                                                    onClick={cancelEditTitle}
                                                    className={`${isStandard ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-base md:text-lg'} rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold`}
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className={`min-w-0 flex-1 ${isStandard ? 'space-y-1' : 'space-y-1.5'}`}>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-black ${isStandard ? 'text-base' : 'text-xl md:text-2xl'} text-slate-800 dark:text-slate-100 truncate`}>
                                                        {item.caseName}
                                                    </span>
                                                    {isActive && (
                                                        <span className={`inline-flex items-center gap-1 ${isStandard ? 'text-[11px] px-2 py-0.5' : 'text-sm md:text-base px-2.5 py-1'} font-bold rounded-md bg-sky-600 text-white`}>
                                                            <Check className={isStandard ? 'w-3 h-3' : 'w-4 h-4'} /> 目前載入
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center gap-1 ${isStandard ? 'text-[11px] px-2 py-0.5' : 'text-sm md:text-base px-2.5 py-1'} font-bold rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300`}>
                                                        {item.source === 'cloud' ? (
                                                            <><Cloud className={`${isStandard ? 'w-3 h-3' : 'w-4 h-4'} text-sky-500`} /> 雲端</>
                                                        ) : (
                                                            <><HardDrive className={`${isStandard ? 'w-3 h-3' : 'w-4 h-4'} text-amber-500`} /> 本機</>
                                                        )}
                                                    </span>
                                                </div>
                                                {item.address && (
                                                    <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg'} text-slate-600 dark:text-slate-300 truncate`}>
                                                        {item.address}
                                                    </p>
                                                )}
                                                <p className={`${isStandard ? 'text-[11px]' : 'text-sm md:text-base'} text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium`}>
                                                    <Clock className={isStandard ? 'w-3 h-3' : 'w-4 h-4'} /> {formatUpdatedAt(item.updatedAt)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                                {isConfirmingDelete ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                await onDeleteCase(item);
                                                                setConfirmDeleteId(null);
                                                            }}
                                                            className={`${isStandard ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-base md:text-lg'} rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all`}
                                                        >
                                                            確認刪除
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className={`${isStandard ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-base md:text-lg'} rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold`}
                                                        >
                                                            取消
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => onLoadCase(item)}
                                                            className={`${isStandard ? 'px-3.5 py-1.5 text-xs' : 'px-5 py-2.5 text-lg md:text-xl'} rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-sm transition-all active:scale-95`}
                                                        >
                                                            載入
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditTitle(item)}
                                                            className={`${isStandard ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-lg md:text-xl'} rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 font-bold inline-flex items-center gap-1.5 transition-all active:scale-95`}
                                                            aria-label="修改標題"
                                                        >
                                                            <Pencil className={isStandard ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
                                                            改名
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingId(null);
                                                                setConfirmDeleteId(item.id);
                                                            }}
                                                            className={`${isStandard ? 'p-1.5' : 'p-2.5'} rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 transition-all`}
                                                            aria-label="刪除案件"
                                                        >
                                                            <Trash2 className={isStandard ? 'w-4 h-4' : 'w-6 h-6'} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

interface SaveCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeCaseId: string | null;
    activeCaseName?: string;
    defaultCaseName: string;
    isSignedIn: boolean;
    onSaveAsNew: (caseName: string) => Promise<void>;
    onUpdateActive: (caseName: string) => Promise<void>;
}

export const SaveCaseModal: React.FC<SaveCaseModalProps> = ({
    isOpen,
    onClose,
    activeCaseId,
    activeCaseName,
    defaultCaseName,
    isSignedIn,
    onSaveAsNew,
    onUpdateActive
}) => {
    const mode = useInterface();
    const isStandard = mode === 'standard';
    const [caseNameInput, setCaseNameInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCaseNameInput((defaultCaseName || '').trim() || activeCaseName || '');
            setSaving(false);
        }
    }, [isOpen, defaultCaseName, activeCaseName]);

    if (!isOpen) return null;

    const resolvedName = () =>
        caseNameInput.trim() || (defaultCaseName || '').trim() || activeCaseName || '未命名案件';

    const handleSaveNew = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await onSaveAsNew(resolvedName());
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleOverwriteCurrent = async () => {
        if (saving || !activeCaseId) return;
        setSaving(true);
        try {
            await onUpdateActive(resolvedName());
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeCaseId) {
            handleOverwriteCurrent();
        } else {
            handleSaveNew();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/70 z-[125] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className={`bg-white dark:bg-slate-800 w-full ${isStandard ? 'max-w-md' : 'max-w-xl'} rounded-2xl shadow-2xl border-2 border-orange-200 dark:border-slate-700 overflow-hidden flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`bg-orange-500 dark:bg-orange-700 ${isStandard ? 'px-5 py-4' : 'px-6 py-5'} flex items-center justify-between text-white`}>
                    <div className="flex items-center gap-3">
                        <Save className={isStandard ? 'w-6 h-6' : 'w-8 h-8 shrink-0'} />
                        <div>
                            <h3 className={`${isStandard ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-black leading-tight`}>
                                儲存案件（存檔）
                            </h3>
                            <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg mt-0.5'} text-orange-50 font-medium`}>
                                {isSignedIn ? '已登入 Google：存檔將同步至雲端與本機' : '未登入模式：存檔將儲存於本機瀏覽器'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${isStandard ? 'p-2' : 'p-2.5'} rounded-xl bg-white/15 hover:bg-white/25 transition-colors shrink-0`}
                        aria-label="關閉"
                    >
                        <X className={isStandard ? 'w-5 h-5' : 'w-7 h-7'} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className={`${isStandard ? 'p-5 space-y-4' : 'p-6 space-y-5'}`}>
                    {activeCaseId && activeCaseName && (
                        <div className={`${isStandard ? 'px-3.5 py-2 text-xs md:text-sm' : 'px-4 py-3 text-base md:text-lg'} rounded-xl bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 flex items-center gap-2 font-bold text-sky-800 dark:text-sky-200`}>
                            <FolderOpen className={`${isStandard ? 'w-4 h-4' : 'w-5 h-5'} shrink-0 text-sky-600 dark:text-sky-400`} />
                            <span className="truncate">目前編輯中的存檔：{activeCaseName}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="save-case-name-input"
                            className={`block ${isStandard ? 'text-sm md:text-base' : 'text-xl md:text-2xl'} font-black text-slate-800 dark:text-slate-100`}
                        >
                            請輸入存檔名稱
                        </label>
                        <input
                            id="save-case-name-input"
                            type="text"
                            autoFocus
                            maxLength={120}
                            value={caseNameInput}
                            onChange={e => setCaseNameInput(e.target.value)}
                            placeholder="例如：東區透天-林先生（留白將使用預設名稱）"
                            className={`w-full ${isStandard ? 'px-4 py-3 text-base md:text-lg' : 'px-4 py-4 text-xl md:text-2xl'} rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-orange-500`}
                        />
                        <p className={`${isStandard ? 'text-xs' : 'text-base md:text-lg leading-snug'} text-slate-500 dark:text-slate-400 font-medium`}>
                            存檔後，下次點選底部「案件庫（含讀檔）」即可直接選取讀取。
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-1">
                        {activeCaseId ? (
                            <>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full ${isStandard ? 'py-3.5 text-base md:text-lg' : 'py-4 text-xl md:text-2xl'} px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50`}
                                >
                                    <Save className={isStandard ? 'w-5 h-5' : 'w-6 h-6'} />
                                    {saving ? '存檔中...' : '覆蓋目前存檔'}
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={handleSaveNew}
                                    className={`w-full ${isStandard ? 'py-3 text-base' : 'py-4 text-xl md:text-2xl'} px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50`}
                                >
                                    <Plus className={isStandard ? 'w-5 h-5' : 'w-6 h-6'} />
                                    {saving ? '存檔中...' : '另存為新存檔'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full ${isStandard ? 'py-3.5 text-base md:text-lg' : 'py-4 text-xl md:text-2xl'} px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50`}
                            >
                                <Save className={isStandard ? 'w-5 h-5' : 'w-6 h-6'} />
                                {saving ? '存檔中...' : '確認存檔'}
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={saving}
                            onClick={onClose}
                            className={`w-full ${isStandard ? 'py-2.5 text-sm md:text-base' : 'py-3.5 text-lg md:text-xl'} px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition-all active:scale-95`}
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
