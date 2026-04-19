// ============================================================
//  cipher.js  –  MD5 hash (one-way)
//  The hash is stored in Firestore and matched on scan.
//  decode() returns the hash itself — the real name comes
//  from the Firestore document after lookup.
// ============================================================

/**
 * encode() is only used by the QR generator, not the web app.
 * Kept here for reference — actual MD5 is generated in Python.
 */
export function encode(name) {
  // MD5 is generated server-side in Python (hashlib.md5)
  // This is a no-op placeholder in the browser app.
  return name;
}

/**
 * For MD5, there is no decode — return the raw hash.
 * The scanner uses this only for the toast/modal before
 * the Firestore lookup resolves the real name.
 */
export function decode(hash) {
  return hash; // real name resolved via Firestore lookup
} // ============================================================
//  cipher.js  –  MD5 hash (one-way)
//  The hash is stored in Firestore and matched on scan.
//  decode() returns the hash itself — the real name comes
//  from the Firestore document after lookup.
// ============================================================

/**
 * encode() is only used by the QR generator, not the web app.
 * Kept here for reference — actual MD5 is generated in Python.
 */
export function encode(name) {
  // MD5 is generated server-side in Python (hashlib.md5)
  // This is a no-op placeholder in the browser app.
  return name;
}

/**
 * For MD5, there is no decode — return the raw hash.
 * The scanner uses this only for the toast/modal before
 * the Firestore lookup resolves the real name.
 */
export function decode(hash) {
  return hash; // real name resolved via Firestore lookup
}
