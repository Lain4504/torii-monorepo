// Firebase configuration for web-admin
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBf1C07sTTTSysn-xd6EWDCVHrnsjnuAqw",
    authDomain: "wajlc-e1fee.firebaseapp.com",
    projectId: "wajlc-e1fee",
    storageBucket: "wajlc-e1fee.firebasestorage.app",
    messagingSenderId: "885312839706",
    appId: "1:885312839706:web:04e6974890c033f71ef1a3",
    measurementId: "G-RRN6BJNBYR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
