// firebaseAuth.js
import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * Sign up a new user in Firebase Auth and create a corresponding document
 * in /clients or /providers. Returns the user object.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} accountType - either "client" or "provider"
 */
export const signUpUser = async (email, password, accountType) => {
  try {
    // 1) Create Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const uid = user.uid;

    // 2) Create doc in Firestore based on account type
    if (accountType === "client") {
      await setDoc(doc(db, "clients", uid), {
        email,
        createdAt: new Date(),
        // any other initial fields for a client
      });
    } else if (accountType === "provider") {
      await setDoc(doc(db, "providers", uid), {
        email,
        createdAt: new Date(),
        // any other initial fields for a provider
      });
    }

    return user; // Return the Firebase Auth user object
  } catch (error) {
    throw error; // Re-throw so the calling code can handle it
  }
};

/**
 * Log in an existing user with email/password. Returns the user object.
 *
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
