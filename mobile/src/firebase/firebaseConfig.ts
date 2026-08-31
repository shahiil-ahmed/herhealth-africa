import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
// @ts-ignore - Required because firebase@10.14.1 types for Expo sometimes fail to resolve the React Native persistence export cleanly
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase configuration.
 * Uses environment variables for Development/Production separation.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate app initialization on Expo hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Auth ─────────────────────────────────────────────────────────────────────
// IMPORTANT: Use initializeAuth with getReactNativePersistence instead of
// getAuth(). getAuth() defaults to the browser IndexedDB/localStorage
// persistence which is not available in React Native / Hermes and causes
// the "URL.protocol is not implemented" crash.
//
// getReactNativePersistence wraps AsyncStorage so auth state survives
// app restarts without triggering browser-only APIs.
let auth: ReturnType<typeof getAuth>;
if (getApps().length === 1 && getApps()[0] === app) {
  // First initialization — set up with RN persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e: any) {
    // initializeAuth throws if called twice on the same app instance
    // (can happen with fast refresh). Fall back to getAuth() safely.
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

// ─── Firestore ────────────────────────────────────────────────────────────────
const db = getFirestore(app);

export { auth, db };
export default app;
