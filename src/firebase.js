// ============================================================
//  firebase.js  –  Firestore integration
//  Replace the firebaseConfig object with your actual project
//  credentials from the Firebase Console.
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
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── ✏️  PASTE YOUR FIREBASE CONFIG HERE ──────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDrbdjppWzTiDaWiAagO0cha2sX_hthXXw",
  authDomain: "csnight-e86c7.firebaseapp.com",
  projectId: "csnight-e86c7",
  storageBucket: "csnight-e86c7.firebasestorage.app",
  messagingSenderId: "697686912207",
  appId: "1:697686912207:web:e4a5deea7a5108ed48dbba",
};

// ─────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Firestore document shape (doc ID = userID e.g. "0001"):
 * {
 *   name:                "Abela, Niño, S",
 *   paymentStatus:       "Installment – Completed",
 *   dietaryRestrictions: "Seafood Allergy",
 *   cipherText:          "MNQXM, ZUAA, E",
 *   searchKey:           "MNQXM, ZUAA, E"   ← same as cipherText, uppercased
 * }
 *
 * QR codes encode the cipherText value directly.
 * Scanning decodes it back to the name via Caesar cipher (shift 12).
 * Lookup is done by matching the raw scanned value against searchKey.
 */

/**
 * Fetch a guest by the raw scanned cipher text.
 * This is the primary lookup — O(1) Firestore query.
 */
export async function fetchGuestByCipher(cipherText) {
  const key = cipherText.trim().toUpperCase();

  const q = query(collection(db, "guests"), where("searchKey", "==", key));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { docId: d.id, ...d.data() };
  }
  return null;
}

/**
 * Keep fetchGuestByName as an alias so scanner.js needs no changes.
 * decodedName is unused — we re-use the raw cipher passed via closure in scanner.js.
 * (scanner.js passes the raw QR value to handleScan; we shadow it here.)
 */
export async function fetchGuestByName(decodedName) {
  // decodedName is the Caesar-decoded string. We can't reverse-lookup by it
  // efficiently, so fall back to a full scan and match on the name field.
  const nameKey = decodedName.trim().toUpperCase();

  const allSnap = await getDocs(collection(db, "guests"));
  const found = allSnap.docs.find((d) => {
    return (d.data().name ?? "").toUpperCase() === nameKey;
  });
  return found ? { docId: found.id, ...found.data() } : null;
}

/** Fetch a guest by Firestore document ID (userID, e.g. "0001"). */
export async function fetchGuestById(guestId) {
  const id = String(guestId).padStart(4, "0");
  const ref = doc(db, "guests", id);
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
