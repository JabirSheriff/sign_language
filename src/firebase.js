// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyA3B_gwlqQx9eLpRpesumsZm0k9Z3iNSas",
    authDomain: "signlanguageapp-2d069.firebaseapp.com",
    projectId: "signlanguageapp-2d069",
    storageBucket: "signlanguageapp-2d069.firebasestorage.app",
    messagingSenderId: "1005311515427",
    appId: "1:1005311515427:web:1c4c9d78d585035b08ca96"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);