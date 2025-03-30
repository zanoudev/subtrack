import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqpWWPirJE50JS0-QtueEmsyaNB3H5Z7g",
  authDomain: "subtrack-0055.firebaseapp.com",
  projectId: "subtrack-0055",
  storageBucket: "subtrack-0055.firebasestorage.app",
  messagingSenderId: "277226012176",
  appId: "1:277226012176:web:921e22b74470b00d3d5495",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
