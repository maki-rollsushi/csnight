// ============================================================
//  firebase.js  –  Firestore integration
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
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
 *
 * task_assignments doc (doc ID = guestDocId):
 * {
 *   taskNumber: "42",   ← "1"–"107" or "00" (wildcard)
 *   timestamp: serverTimestamp(),
 * }
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

// ── Task Number Functions ─────────────────────────────────────

/** Get a guest's assigned task number (returns null if none). */
export async function getTaskNumber(guestDocId) {
  const ref = doc(db, "task_assignments", String(guestDocId));
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().taskNumber : null;
}

/**
 * Get all currently taken task numbers as an array of strings.
 * e.g. ["1", "7", "00", "00", "42"]
 */
export async function getTakenTaskNumbers() {
  const snap = await getDocs(collection(db, "task_assignments"));
  return snap.docs.map((d) => d.data().taskNumber);
}

/** Assign a task number to a guest. */
export async function assignTaskNumber(guestDocId, taskNumber) {
  await setDoc(doc(db, "task_assignments", String(guestDocId)), {
    taskNumber: String(taskNumber),
    timestamp: serverTimestamp(),
  });
}

/**
 * Fetch a full attendee summary in three parallel Firestore reads.
 * Returns an array sorted by guest name:
 * [{ guest, status: "enter"|"exit", taskNumber, lastTimestamp }]
 *
 * Only guests with at least one access_log entry are included.
 */
export async function getSummary() {
  const [logsSnap, tasksSnap, guestsSnap] = await Promise.all([
    getDocs(collection(db, "access_log")),
    getDocs(collection(db, "task_assignments")),
    getDocs(collection(db, "guests")),
  ]);

  // guest map:  docId → guest data
  const guestMap = {};
  guestsSnap.docs.forEach((d) => {
    guestMap[d.id] = { docId: d.id, ...d.data() };
  });

  // task map:  guestDocId → taskNumber
  const taskMap = {};
  tasksSnap.docs.forEach((d) => {
    taskMap[d.id] = d.data().taskNumber;
  });

  // last-action map:  guestId → { action, timestamp, ms }
  const lastActions = {};
  logsSnap.docs.forEach((d) => {
    const { guestId, action, timestamp } = d.data();
    const ms = timestamp?.toMillis?.() ?? 0;
    if (!lastActions[guestId] || ms > lastActions[guestId].ms) {
      lastActions[guestId] = { action, timestamp, ms };
    }
  });

  const summary = Object.entries(lastActions).map(
    ([guestId, { action, timestamp }]) => ({
      guest: guestMap[guestId] ?? { docId: guestId, name: `Guest ${guestId}` },
      status: action, // "enter" = currently inside, "exit" = outside
      taskNumber: taskMap[guestId] ?? null,
      lastTimestamp: timestamp,
    }),
  );

  // Sort alphabetically by name
  summary.sort((a, b) =>
    (a.guest.name ?? "").localeCompare(b.guest.name ?? ""),
  );
  return summary;
}

/**
 * Reset all data: deletes every document in access_log and
 * task_assignments. Works in batches of 500 (Firestore limit).
 */
export async function resetAll() {
  const [logs, tasks] = await Promise.all([
    getDocs(collection(db, "access_log")),
    getDocs(collection(db, "task_assignments")),
  ]);

  const allDocs = [...logs.docs, ...tasks.docs];
  if (!allDocs.length) return;

  for (let i = 0; i < allDocs.length; i += 500) {
    const b = writeBatch(db);
    allDocs.slice(i, i + 500).forEach((d) => b.delete(d.ref));
    await b.commit();
  }
}
