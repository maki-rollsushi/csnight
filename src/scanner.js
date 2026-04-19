// ============================================================
//  scanner.js  –  QR scanning + Base64 decode + modal + log
// ============================================================

import {
  fetchGuestByCipher,
  fetchGuestById,
  logAccess,
  getLastAction,
  countInside,
} from "./firebase.js";
// cipher.js not needed for MD5 — hashes are matched directly in Firestore

// ── State ─────────────────────────────────────────────────────
let totalScans = 0;
let insideCount = 0;
let scanning = true;
const SUITS = ["♠", "♥", "♦", "♣"];
let html5QrCode = null;
let availableCameras = [];
let currentCamIndex = 0;

// ── Helpers ───────────────────────────────────────────────────
function randomSuit() {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function fmt(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast toast-${type} show`;
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ── Stats bar ─────────────────────────────────────────────────
async function refreshStats() {
  try {
    insideCount = await countInside();
  } catch (_) {}
  document.getElementById("stat-inside").textContent = insideCount;
  document.getElementById("stat-total").textContent = totalScans;
}

// ── Log list ──────────────────────────────────────────────────
function appendLog(guest, action, ts, cipherText) {
  const list = document.getElementById("log-list");
  const empty = list.querySelector(".log-empty");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = `log-item ${action === "enter" ? "log-enter" : "log-exit"}`;
  item.innerHTML = `
    <span class="log-suit">${randomSuit()}</span>
    <div class="log-info">
      <span class="log-name">${guest.name}</span>
      <span class="log-id">id: ${guest.docId}</span>
    </div>
    <div class="log-right">
      <span class="log-action-badge ${action}">${action === "enter" ? "▶ IN" : "◀ OUT"}</span>
      <span class="log-ts">${fmt(ts)}</span>
    </div>
  `;
  list.prepend(item);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(guest, action, ts, cipherText, decodedName) {
  document.getElementById("modal-suit-icon").textContent = randomSuit();
  document.getElementById("modal-name").textContent = guest.name;
  document.getElementById("modal-id").textContent = `ID: ${guest.docId}`;
  document.getElementById("modal-decoded").textContent = `→ ${decodedName}`;
  document.getElementById("modal-payment").textContent =
    guest.paymentStatus ?? "—";
  document.getElementById("modal-dietary").textContent =
    guest.dietaryRestrictions || "None";
  document.getElementById("modal-status-text").textContent = guest.paymentStatus
    ?.toLowerCase()
    .includes("complet")
    ? "✅ Verified"
    : "⚠️ Pending";
  document.getElementById("modal-time").textContent = fmt(ts);

  const badge = document.getElementById("action-badge");
  badge.textContent = action === "enter" ? "▶ ENTERING" : "◀ EXITING";
  badge.className = `action-badge ${action}`;

  document.getElementById("modal-overlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active");
  setTimeout(() => {
    scanning = true;
  }, 1200);
}

// ── Core scan handler ─────────────────────────────────────────
async function handleScan(rawValue) {
  if (!scanning) return;
  scanning = false;

  const cipherText = rawValue.trim();
  if (!cipherText) {
    scanning = true;
    return;
  }

  showToast(`Looking up guest…`, "info");

  try {
    const isNumeric = /^\d+$/.test(cipherText);
    let guest = isNumeric
      ? await fetchGuestById(cipherText)
      : await fetchGuestByCipher(cipherText);

    if (!guest) {
      showToast(`No guest found`, "error");
      scanning = true;
      return;
    }

    const lastAction = await getLastAction(guest.docId);
    const action = lastAction === "enter" ? "exit" : "enter";

    await logAccess(guest.docId, action);
    totalScans++;

    const now = new Date();
    appendLog(guest, action, now, cipherText);
    openModal(guest, action, now, cipherText, guest.name);
    await refreshStats();

    const firstName =
      (guest.name ?? "").split(",")[1]?.trim().split(" ")[0] ?? guest.name;
    showToast(
      action === "enter"
        ? `Welcome, ${firstName}! ♠`
        : `Goodbye, ${firstName}! ♦`,
      action === "enter" ? "enter" : "exit",
    );
  } catch (err) {
    console.error(err);
    showToast("Error: " + (err.message ?? "Unknown error"), "error");
    scanning = true;
  }
}

// ── Camera switching ──────────────────────────────────────────
async function switchCamera() {
  if (availableCameras.length < 2) {
    showToast("No other camera found", "info");
    return;
  }
  currentCamIndex = (currentCamIndex + 1) % availableCameras.length;
  const cam = availableCameras[currentCamIndex];

  try {
    await html5QrCode.stop();
    await html5QrCode.start(
      cam.id,
      { fps: 10, qrbox: { width: 200, height: 200 } },
      (decodedText) => {
        handleScan(decodedText);
      },
      () => {},
    );
    showToast(
      `Camera: ${cam.label || `Camera ${currentCamIndex + 1}`}`,
      "info",
    );
  } catch (err) {
    console.warn("Camera switch error:", err);
    showToast("Could not switch camera", "error");
  }
}

// ── QR Scanner init ───────────────────────────────────────────
export function initScanner() {
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.getElementById("manual-btn").addEventListener("click", () => {
    const val = document.getElementById("manual-id").value.trim();
    document.getElementById("manual-id").value = "";
    if (val) handleScan(val);
  });
  document.getElementById("manual-id").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("manual-btn").click();
  });

  document
    .getElementById("switch-camera-btn")
    .addEventListener("click", switchCamera);

  const tryStart = () => {
    if (typeof Html5Qrcode === "undefined") {
      setTimeout(tryStart, 300);
      return;
    }

    html5QrCode = new Html5Qrcode("reader");
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras?.length) return;
        availableCameras = cameras;

        // Prefer the main rear camera — on phones the wide angle is usually index 0,
        // and the standard/main camera matches "back" or comes second.
        // We skip index 0 if there are multiple rear cameras to avoid wide angle.
        const rearCams = cameras.filter((c) =>
          /back|rear|environment/i.test(c.label),
        );
        let startCam;
        if (rearCams.length > 1) {
          // Pick the second rear camera — usually the standard lens, not ultra-wide
          startCam = rearCams[1];
          currentCamIndex = cameras.indexOf(startCam);
        } else {
          startCam = rearCams[0] ?? cameras[0];
          currentCamIndex = cameras.indexOf(startCam);
        }

        return html5QrCode.start(
          startCam.id,
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            handleScan(decodedText);
          },
          () => {},
        );
      })
      .catch((err) => console.warn("Camera error:", err));
  };

  tryStart();
  refreshStats();
}
