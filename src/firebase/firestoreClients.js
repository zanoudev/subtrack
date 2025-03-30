// firestoreClients.js
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
 * Fetch all clients from /clients
 * @returns {Promise<Array>} Array of client objects
 */
export const fetchAllClients = async () => {
  const colRef = collection(db, "clients");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/**
 * Fetch a single client by ID
 * @param {string} clientId
 * @returns {Promise<Object|null>} Client object or null
 */
export const fetchClientById = async (clientId) => {
  const docRef = doc(db, "clients", clientId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Creates (or overwrites) a client document at /clients/<clientId>
 * @param {string} clientId - Usually user.uid
 * @param {object} clientData - e.g. { firstName, lastName, email, preferences, subscriptions }
 */
export const createClient = async (clientId, clientData) => {
  await setDoc(doc(db, "clients", clientId), clientData);
};

/**
 * Overwrite or merge client data in Firestore
 * @param {string} clientId
 * @param {Object} clientData
 * @param {Object} [options] - e.g. { merge: true }
 */
export const updateClient = async (clientId, clientData, options = {}) => {
  const docRef = doc(db, "clients", clientId);
  await setDoc(docRef, clientData, options);
};

/**
 * Partially update a client using updateDoc
 * @param {string} clientId
 * @param {Object} fieldsToUpdate
 */
export const patchClient = async (clientId, fieldsToUpdate) => {
  const docRef = doc(db, "clients", clientId);
  await updateDoc(docRef, fieldsToUpdate);
};

/**
 * Delete a client by its document ID
 * @param {string} clientId
 */
export const deleteClient = async (clientId) => {
  const docRef = doc(db, "clients", clientId);
  await deleteDoc(docRef);
};

/**
 * Add a planId to a client's subscriptions array
 * @param {string} clientId
 * @param {string} planId
 */
export const addSubscriptionToClient = async (clientId, planId) => {
  const docRef = doc(db, "clients", clientId);
  await updateDoc(docRef, {
    subscriptions: arrayUnion(planId),
  });
};

/**
 * Remove a planId from a client's subscriptions array
 * @param {string} clientId
 * @param {string} planId
 */
export const removeSubscriptionFromClient = async (clientId, planId) => {
  const docRef = doc(db, "clients", clientId);
  await updateDoc(docRef, {
    subscriptions: arrayRemove(planId),
  });
};
