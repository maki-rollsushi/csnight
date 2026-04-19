// ============================================================
//  firebase.js  –  Firestore integration
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrbdjppWzTiDaWiAagO0cha2sX_hthXXw",
  authDomain: "csnight-e86c7.firebaseapp.com",
  projectId: "csnight-e86c7",
  storageBucket: "csnight-e86c7.firebasestorage.app",
  messagingSenderId: "697686912207",
  appId: "1:697686912207:web:e4a5deea7a5108ed48dbba",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Firestore document shape (doc ID = zero-padded # e.g. "0001"):
 * {
 *   name:                "Abela, Niño, S",
 *   paymentStatus:       "Installment – Completed",
 *   dietaryRestrictions: "Seafood Allergy",
 *   hash:                "f129323c1e3a61794860beed385c025c",  ← MD5
 * }
 * searchKey == hash (exact match, lowercase)
 */

/** Fetch a guest by their MD5 hash (scanned from QR code). */
export async function fetchGuestByCipher(hash) {
  const key = hash.trim().toLowerCase();
  const q = query(collection(db, "guests"), where("hash", "==", key));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { docId: d.id, ...d.data() };
  }
  return null;
}

/** Fetch a guest by Firestore document ID (zero-padded #, e.g. "0001"). */
export async function fetchGuestById(id) {
  const padded = String(id).padStart(4, "0");
  const ref = doc(db, "guests", padded);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { docId: snap.id, ...snap.data() };
}

/** Log an entry or exit event. */
export async function logAccess(guestDocId, action) {
  return addDoc(collection(db, "access_log"), {
    guestId: String(guestDocId),
    action,
    timestamp: serverTimestamp(),
  });
}

/** Last access action for a guest (to toggle enter ↔ exit). */
export async function getLastAction(guestDocId) {
  const q = query(
    collection(db, "access_log"),
    where("guestId", "==", String(guestDocId)),
    orderBy("timestamp", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data().action;
}

/** Count guests currently inside. */
export async function countInside() {
  const [enters, exits] = await Promise.all([
    getDocs(
      query(collection(db, "access_log"), where("action", "==", "enter")),
    ),
    getDocs(query(collection(db, "access_log"), where("action", "==", "exit"))),
  ]);
  return Math.max(0, enters.size - exits.size);
}
