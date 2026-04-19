// ============================================================
//  cipher.js  –  Caesar cipher encode / decode
//  Shift is fixed at 12. Only shifts A–Z letters.
//  Numbers, punctuation, spaces, and accented characters
//  (e.g. Ñ) pass through unchanged.
// ============================================================

export const CAESAR_SHIFT = 12;

function shiftChar(ch, shift) {
  const isUpper = ch >= "A" && ch <= "Z";
  const isLower = ch >= "a" && ch <= "z";
  if (!isUpper && !isLower) return ch;
  const base = isUpper ? 65 : 97;
  return String.fromCharCode(
    ((ch.charCodeAt(0) - base + shift + 26) % 26) + base,
  );
}

/**
 * Encode a plaintext name into a cipher string.
 * Input is uppercased before shifting so the QR value
 * is always uppercase.
 */
export function encode(name) {
  return name
    .toUpperCase()
    .split("")
    .map((ch) => shiftChar(ch, CAESAR_SHIFT))
    .join("");
}

/**
 * Decode a cipher string back to the original name (uppercase).
 */
export function decode(cipher) {
  return cipher
    .toUpperCase()
    .split("")
    .map((ch) => shiftChar(ch, -CAESAR_SHIFT))
    .join("");
}
