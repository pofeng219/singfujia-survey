import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, onAuthStateChanged, signOut };
export type { User };

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
