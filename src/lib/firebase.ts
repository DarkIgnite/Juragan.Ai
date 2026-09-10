import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with specific databaseId and long-polling transport for iframe sandbox reliability
if (typeof window !== 'undefined' && getApps().length <= 1) {
  try {
    initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId || undefined
    );
  } catch {
    // Already initialized
  }
}

// Export db instance with databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Operation types for standard error handling per Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test Firestore Connection as required by skill guidelines with timeout protection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const fetchPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection test timeout')), 4000)
    );
    await Promise.race([fetchPromise, timeoutPromise]);
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    if (
      (error instanceof Error && error.message.includes('the client is offline')) ||
      error?.code === 'unavailable' ||
      error?.message?.includes('timeout')
    ) {
      console.info('Firebase Firestore is operating in offline-cached mode until initial sync completes.');
    } else {
      console.warn('Firebase Firestore connection test notice:', error?.message || error);
    }
    return false;
  }
}

// Sign in with Google via Firebase Auth
export async function loginWithGoogleFirebase(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save or update user profile in Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Juragan UMKM',
          photoUrl: user.photoURL,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (dbErr) {
      console.warn('Could not sync user profile to Firestore (proceeding with auth session):', dbErr);
    }

    return user;
  } catch (err: any) {
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request'
    ) {
      console.info('Firebase Google Sign-In popup was closed by user.');
    } else {
      console.warn('Firebase Google Sign-In notice:', err?.message || err);
    }
    throw err;
  }
}

// Sign out from Firebase Auth
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}
