import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
    getFirestore,
    doc,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    deleteField,
    serverTimestamp,
    getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, onAuthStateChanged, signOut };
export type { User };

export interface CaseDraftRecord {
    id: string;
    type: 'house' | 'land' | 'factory' | 'parking';
    caseName: string;
    address: string;
    data: any;
    updatedAt: number;
    source: 'cloud' | 'local';
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export function createSafeCaseId(): string {
    const rand = Math.random().toString(36).slice(2, 8);
    return `case_${Date.now()}_${rand}`;
}

function sanitizeCaseId(caseId?: string): string {
    if (caseId && VALID_ID_REGEX.test(caseId)) return caseId;
    return createSafeCaseId();
}

function sanitizeCaseName(name?: string, fallbackName?: string): string {
    const raw = (name ?? fallbackName ?? '').trim();
    const cleaned = raw.slice(0, 120);
    return cleaned || '未命名案件';
}

function sanitizeAddress(address?: string): string {
    return String(address ?? '').trim().slice(0, 200);
}

enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId?: string | null;
        email?: string | null;
        emailVerified?: boolean | null;
        isAnonymous?: boolean | null;
        tenantId?: string | null;
        providerInfo?: {
            providerId?: string | null;
            email?: string | null;
        }[];
    };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData?.map(provider => ({
                providerId: provider.providerId,
                email: provider.email,
            })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
    try {
        await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error('Please check your Firebase configuration.');
        }
    }
}
testConnection();

// Helper function to save survey draft with per-type server timestamp
export async function saveSurveyDraft(userId: string, type: string, data: any) {
    if (!userId) return;
    const path = `userDrafts/${userId}`;
    const docRef = doc(db, 'userDrafts', userId);
    try {
        await setDoc(
            docRef,
            {
                [type]: data,
                [`${type}UpdatedAt`]: serverTimestamp(),
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
    }
}

// Helper function to load survey draft along with its timestamp in ms
export async function loadSurveyDraftWithMeta(userId: string, type: string): Promise<{ data: any | null; updatedAt: number }> {
    if (!userId) return { data: null, updatedAt: 0 };
    const path = `userDrafts/${userId}`;
    const docRef = doc(db, 'userDrafts', userId);
    try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const docData = snap.data();
            const draft = docData[type] || null;
            const typeTs = docData[`${type}UpdatedAt`];
            const fallbackTs = docData.updatedAt;
            const tsObj = typeTs || fallbackTs;
            const updatedAt = tsObj && typeof tsObj.toMillis === 'function' ? tsObj.toMillis() : 0;
            return { data: draft, updatedAt };
        }
        return { data: null, updatedAt: 0 };
    } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
    }
}

// Helper function to load survey draft (kept for backward compatibility)
export async function loadSurveyDraft(userId: string, type: string) {
    const result = await loadSurveyDraftWithMeta(userId, type);
    return result.data;
}

// Helper function to clear a specific survey type draft in cloud
export async function clearSurveyDraft(userId: string, type: string) {
    if (!userId) return;
    const path = `userDrafts/${userId}`;
    const docRef = doc(db, 'userDrafts', userId);
    try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            await updateDoc(docRef, {
                [type]: deleteField(),
                [`${type}UpdatedAt`]: deleteField(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
    }
}

// --- Multi-Case Draft Management (Firestore Subcollection: userDrafts/{userId}/cases/{caseId}) ---

export async function listSurveyCases(
    userId: string,
    type: 'house' | 'land' | 'factory' | 'parking'
): Promise<CaseDraftRecord[]> {
    if (!userId) return [];
    const path = `userDrafts/${userId}/cases`;
    const colRef = collection(db, 'userDrafts', userId, 'cases');
    try {
        // Query by ownerId to satisfy security rule without requiring a composite index
        const q = query(colRef, where('ownerId', '==', userId));
        const snap = await getDocs(q);
        const items: CaseDraftRecord[] = [];
        snap.forEach(docSnap => {
            const d = docSnap.data();
            if (d.type !== type) return;
            const tsObj = d.updatedAt || d.createdAt;
            const updatedAt = tsObj && typeof tsObj.toMillis === 'function' ? tsObj.toMillis() : 0;
            items.push({
                id: docSnap.id,
                type: d.type,
                caseName: typeof d.caseName === 'string' && d.caseName ? d.caseName : '未命名案件',
                address: typeof d.address === 'string' ? d.address : '',
                data: d.data,
                updatedAt,
                source: 'cloud'
            });
        });
        items.sort((a, b) => b.updatedAt - a.updatedAt);
        return items;
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
    }
}

export async function saveSurveyCase(
    userId: string,
    type: 'house' | 'land' | 'factory' | 'parking',
    data: any,
    options?: { caseId?: string; caseName?: string }
): Promise<CaseDraftRecord> {
    const safeId = sanitizeCaseId(options?.caseId);
    const caseName = sanitizeCaseName(options?.caseName, data?.caseName);
    const address = sanitizeAddress(data?.address);
    const path = `userDrafts/${userId}/cases/${safeId}`;
    const docRef = doc(db, 'userDrafts', userId, 'cases', safeId);

    try {
        const existingSnap = await getDoc(docRef);
        if (existingSnap.exists()) {
            await updateDoc(docRef, {
                caseName,
                address,
                data,
                updatedAt: serverTimestamp()
            });
        } else {
            await setDoc(docRef, {
                ownerId: userId,
                type,
                caseName,
                address,
                data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
        return {
            id: safeId,
            type,
            caseName,
            address,
            data,
            updatedAt: Date.now(),
            source: 'cloud'
        };
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
    }
}

export async function deleteSurveyCase(userId: string, caseId: string): Promise<void> {
    if (!userId || !VALID_ID_REGEX.test(caseId)) return;
    const path = `userDrafts/${userId}/cases/${caseId}`;
    const docRef = doc(db, 'userDrafts', userId, 'cases', caseId);
    try {
        await deleteDoc(docRef);
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
    }
}
