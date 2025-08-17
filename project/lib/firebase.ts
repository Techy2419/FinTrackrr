import { initializeApp, getApps, getApp, FirebaseError } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Function to log Firebase errors
export const logFirebaseError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    console.error("Firebase Error:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error("Unknown Firebase Error:", error);
  }
};

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config
const validateConfig = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error("Missing Firebase configuration keys:", missingKeys);
    throw new Error(`Missing Firebase configuration: ${missingKeys.join(", ")}`);
  }
};

// Initialize Firebase only if it's not already initialized
validateConfig();
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Enable local persistence (only in the browser)
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    logFirebaseError(error);
  });
}

export { app, auth, db };
