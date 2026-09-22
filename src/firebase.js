import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, onSnapshot, limit
} from 'firebase/firestore'

// ============================================================
// PASTE YOUR FIREBASE CONFIG HERE (see the guide, Step 6)
// The guide will show you exactly where to copy this from.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDVwwTiiNm3bFutEDYbbDJEdvoyxC_XiLQ",
  authDomain: "kips-trading-desk.firebaseapp.com",
  projectId: "kips-trading-desk",
  storageBucket: "kips-trading-desk.firebasestorage.app",
  messagingSenderId: "373666629317",
  appId: "1:373666629317:web:4f9353d1acf47ab2cd52ac"
};
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export const usersCol = collection(db, 'users')
export const userDoc = (id) => doc(db, 'users', id)

// Security rules you should paste into Firebase (Step 6 of the guide):
export const SUGGESTED_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if true;   // simulator game - open access
    }
  }
}`

export {
  collection, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, onSnapshot, limit
}
