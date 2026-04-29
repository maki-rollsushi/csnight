// ============================================================
//  firebase.js  –  Firestore integration + local cache layer
//
//  CACHING STRATEGY:
//  - Guest data is cached in localStorage (key: "csnight_guests")
//    with a TTL of 30 minutes. Reads always try cache first.
//  - Access log, task/table assignments are NOT cached locally
//    because they change frequently and must stay accurate.
//  - Any device that writes (logAccess, assignTaskNumber, etc.)
//    still writes directly to Firestore so all devices see it.
//  - Call invalidateGuestCache() after any guest-data change.
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

// ── Local cache helpers ───────────────────────────────────────
const CACHE_KEY = "csnight_guests";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null; // expired
    return data; // array of guest objects
  } catch {
    return null;
  }
}

function writeCache(guestsArray) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), data: guestsArray }),
    );
  } catch {
    // Storage quota exceeded or private browsing — ignore
  }
}

export function invalidateGuestCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

/** Fetch ALL guests from Firestore and refresh the cache. */
async function fetchAndCacheAllGuests() {
  const snap = await getDocs(collection(db, "guests"));
  const guests = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
  writeCache(guests);
  return guests;
}

/**
 * Get the full guest list — from cache if fresh, else Firestore.
 * This is the only function that should be used internally for
 * guest lookups so every read benefits from the cache.
 */
async function getAllGuests() {
  const cached = readCache();
  if (cached) return cached;
  return fetchAndCacheAllGuests();
}

// ── Public guest lookup functions ─────────────────────────────

/** Fetch a guest by their MD5 hash (scanned from QR code). */
export async function fetchGuestByCipher(hash) {
  const key = hash.trim().toLowerCase();
  const guests = await getAllGuests();
  return guests.find((g) => g.hash === key) ?? null;
}

/** Fetch a guest by Firestore document ID (zero-padded #, e.g. "0001"). */
export async function fetchGuestById(id) {
  const padded = String(id).padStart(4, "0");
  const guests = await getAllGuests();
  return guests.find((g) => g.docId === padded) ?? null;
}

/**
 * Force a fresh pull from Firestore, bypassing the cache.
 * Call this from a "Refresh Cache" button if you need it.
 */
export async function refreshGuestCache() {
  return fetchAndCacheAllGuests();
}

// ── Access log ────────────────────────────────────────────────

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

// ── Task & Table Assignment ───────────────────────────────────

/**
 * Firestore doc shape for task_assignments (doc ID = guestDocId):
 * {
 *   taskNumber:  "42",   ← "1"–"107" or "00" (wildcard)
 *   tableNumber: "5",    ← table the guest is seated at
 *   timestamp: serverTimestamp(),
 * }
 */

/** Get a guest's assigned task + table numbers (returns null fields if none). */
export async function getAssignment(guestDocId) {
  const ref = doc(db, "task_assignments", String(guestDocId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return { taskNumber: null, tableNumber: null };
  const { taskNumber = null, tableNumber = null } = snap.data();
  return { taskNumber, tableNumber };
}

/** @deprecated Use getAssignment instead */
export async function getTaskNumber(guestDocId) {
  const { taskNumber } = await getAssignment(guestDocId);
  return taskNumber;
}

/**
 * Get all currently taken task numbers as an array of strings.
 * e.g. ["1", "7", "00", "00", "42"]
 */
export async function getTakenTaskNumbers() {
  const snap = await getDocs(collection(db, "task_assignments"));
  return snap.docs.map((d) => d.data().taskNumber).filter(Boolean);
}

/** Assign a task number AND table number to a guest. */
export async function assignTaskAndTable(guestDocId, taskNumber, tableNumber) {
  await setDoc(doc(db, "task_assignments", String(guestDocId)), {
    taskNumber: String(taskNumber),
    tableNumber: tableNumber ? String(tableNumber) : null,
    timestamp: serverTimestamp(),
  });
}

/** @deprecated Use assignTaskAndTable instead */
export async function assignTaskNumber(guestDocId, taskNumber) {
  return assignTaskAndTable(guestDocId, taskNumber, null);
}

/**
 * Fetch a full attendee summary in three parallel Firestore reads.
 * Returns an array sorted by guest name:
 * [{ guest, status: "enter"|"exit", taskNumber, tableNumber, lastTimestamp }]
 *
 * Only guests with at least one access_log entry are included.
 */
export async function getSummary() {
  const [logsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, "access_log")),
    getDocs(collection(db, "task_assignments")),
  ]);

  // guest map from cache:  docId → guest data
  const allGuests = await getAllGuests();
  const guestMap = {};
  allGuests.forEach((g) => {
    guestMap[g.docId] = g;
  });

  // task/table map:  guestDocId → { taskNumber, tableNumber }
  const assignMap = {};
  tasksSnap.docs.forEach((d) => {
    assignMap[d.id] = {
      taskNumber: d.data().taskNumber ?? null,
      tableNumber: d.data().tableNumber ?? null,
    };
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
      status: action,
      taskNumber: assignMap[guestId]?.taskNumber ?? null,
      tableNumber: assignMap[guestId]?.tableNumber ?? null,
      lastTimestamp: timestamp,
    }),
  );

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
