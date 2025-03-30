// firestorePlans.js
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
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Fetch all plans from /plans
 * @returns {Promise<Array>} Array of plan objects
 */
export const fetchAllPlans = async () => {
  const colRef = collection(db, "plans");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/**
 * Fetch a single plan by ID
 * @param {string} planId
 * @returns {Promise<Object|null>} Plan object or null
 */
export const fetchPlanById = async (planId) => {
  const docRef = doc(db, "plans", planId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Create a new plan (auto-generate ID)
 * @param {Object} planData - e.g. { title, providerId, price, billingCycle, subscriberList }
 * @returns {Promise<string>} The newly created doc ID
 */
export const createPlan = async (planData) => {
  const colRef = collection(db, "plans");
  const docRef = await addDoc(colRef, planData);
  return docRef.id;
};

/**
 * Overwrite or merge plan data in Firestore
 * @param {string} planId
 * @param {Object} planData
 * @param {Object} [options] - e.g. { merge: true }
 */
export const updatePlan = async (planId, planData, options = {}) => {
  const docRef = doc(db, "plans", planId);
  await setDoc(docRef, planData, options);
};

/**
 * Partially update a plan using updateDoc
 * @param {string} planId
 * @param {Object} fieldsToUpdate
 */
export const patchPlan = async (planId, fieldsToUpdate) => {
  const docRef = doc(db, "plans", planId);
  await updateDoc(docRef, fieldsToUpdate);
};

/**
 * Delete a plan by ID
 * @param {string} planId
 */
export const deletePlan = async (planId) => {
  const docRef = doc(db, "plans", planId);
  await deleteDoc(docRef);
};

/**
 * Add a client to a plan's subscriberList
 * @param {string} planId
 * @param {string} clientId
 */
export const addSubscriberToPlan = async (planId, clientId) => {
  const docRef = doc(db, "plans", planId);
  await updateDoc(docRef, {
    subscriberList: arrayUnion(clientId),
  });
};

/**
 * Remove a client from a plan's subscriberList
 * @param {string} planId
 * @param {string} clientId
 */
export const removeSubscriberFromPlan = async (planId, clientId) => {
  const docRef = doc(db, "plans", planId);
  await updateDoc(docRef, {
    subscriberList: arrayRemove(clientId),
  });
};

// Fetch plans matching user's preferences
export const getPlansByPreferences = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.error("No user found with the given userId:", userId);
      return [];
    }

    const preferences = userDoc.data().preferences || [];

    if (preferences.length === 0) return [];

    const plansQuery = query(
      collection(db, "plans"),
      where("category", "in", preferences)
    );

    const plansSnapshot = await getDocs(plansQuery);
    return plansSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching plans by preferences:", error);
    return [];
  }
};

// Fetch plans for a specific provider
export const getProviderPlans = async (providerId) => {
  try {
    const plansQuery = query(
      collection(db, "plans"),
      where("providerId", "==", providerId)
    );

    const plansSnapshot = await getDocs(plansQuery);
    return plansSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching provider plans:", error);
    return [];
  }
};
