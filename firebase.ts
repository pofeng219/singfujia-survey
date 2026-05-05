import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, onSnapshot, collection } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, onAuthStateChanged, signOut };
export type { User };

// Helper function to save survey draft
export async function saveSurveyDraft(userId: string, type: string, data: any) {
    if (!userId) return;
    const docRef = doc(db, 'userDrafts', userId);
    await setDoc(docRef, { [type]: data, updatedAt: serverTimestamp() }, { merge: true });
}

// Helper function to load survey draft
export async function loadSurveyDraft(userId: string, type: string) {
    if (!userId) return null;
    const docRef = doc(db, 'userDrafts', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        const data = snap.data();
        return data[type] || null;
    }
    return null;
}
