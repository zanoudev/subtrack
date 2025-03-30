// firestoreProviders.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Fetch all providers from the /providers collection
 * @returns {Promise<Array>} Array of provider objects
 */
export const fetchAllProviders = async () => {
  const colRef = collection(db, "providers");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/**
 * Fetch a single provider by its document ID
 * @param {string} providerId
 * @returns {Promise<Object|null>} Provider object or null if not found
 */
export const fetchProviderById = async (providerId) => {
  const docRef = doc(db, "providers", providerId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Creates (or overwrites) a provider document at /providers/<providerId>
 * @param {string} providerId - Usually user.uid
 * @param {object} providerData - e.g. { businessName, category, email, bio, "business-plans" }
 */
export const createProvider = async (providerId, providerData) => {
  await setDoc(doc(db, "providers", providerId), providerData);
};

/**
 * Overwrite or merge a provider's data in Firestore
 * (If you want to merge instead of overwrite, pass { merge: true } in options)
 * @param {string} providerId
 * @param {Object} providerData
 * @param {Object} [options] - e.g. { merge: true }
 */
export const updateProvider = async (
  providerId,
  providerData,
  options = {}
) => {
  const docRef = doc(db, "providers", providerId);
  await setDoc(docRef, providerData, options); // setDoc overwrites by default
};

/**
 * Partially update a provider (only certain fields) using updateDoc
 * @param {string} providerId
 * @param {Object} fieldsToUpdate
 */
export const patchProvider = async (providerId, fieldsToUpdate) => {
  const docRef = doc(db, "providers", providerId);
  await updateDoc(docRef, fieldsToUpdate);
};

/**
 * Delete a provider by its document ID
 * @param {string} providerId
 */
export const deleteProvider = async (providerId) => {
  const docRef = doc(db, "providers", providerId);
  await deleteDoc(docRef);
};

/**
 * Add a planId to a provider's `business-plans` array field
 * (assuming `business-plans` is an array)
 * @param {string} providerId
 * @param {string} planId
 */
export const addPlanToProvider = async (providerId, planId) => {
  const docRef = doc(db, "providers", providerId);
  await updateDoc(docRef, {
    "business-plans": arrayUnion(planId),
  });
};

/**
 * Remove a planId from a provider's `business-plans` array field
 * @param {string} providerId
 * @param {string} planId
 */
export const removePlanFromProvider = async (providerId, planId) => {
  const docRef = doc(db, "providers", providerId);
  await updateDoc(docRef, {
    "business-plans": arrayRemove(planId),
  });
};
