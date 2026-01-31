import { initializeApp, getApps, getApp } from 'https://esm.sh/firebase@12.8.0/app';
import { getFirestore } from 'https://esm.sh/firebase@12.8.0/firestore';
import { getAuth, GoogleAuthProvider } from 'https://esm.sh/firebase@12.8.0/auth';
import { getAnalytics, isSupported } from 'https://esm.sh/firebase@12.8.0/analytics'; // 1. Add this import

const firebaseConfig = {
  apiKey: "AIzaSyA68P3VpuWud0bXq3Ef0Drx5kTQZ2l-8gs",
  authDomain: "conan-tot.firebaseapp.com",
  projectId: "conan-tot",
  storageBucket: "conan-tot.firebasestorage.app",
  messagingSenderId: "108765433840",
  appId: "1:108765433840:web:67b606bf982343b402d735",
  measurementId: "G-CMCG327H6R"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics with a safety check
export let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;