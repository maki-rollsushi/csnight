// ============================================================
//  scanner.js  –  QR scanning + Base64 decode + modal + log
// ============================================================

import {
  fetchGuestByCipher,
  fetchGuestById,
  logAccess,
  getLastAction,
  countInside,
  getTaskNumber,
  getTakenTaskNumbers,
  assignTaskNumber,
  resetAll,
  getSummary,
} from "./firebase.js";

// ── State ─────────────────────────────────────────────────────
let totalScans = 0;
let insideCount = 0;
let scanning = true;
const SUITS = ["♠", "♥", "♦", "♣"];
let html5QrCode = null;
let availableCameras = [];
let currentCamIndex = 0;

// Holds scan result while waiting for task number assignment
let pendingTask = null;

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
function appendLog(guest, action, ts, taskNumber) {
  const list = document.getElementById("log-list");
  const empty = list.querySelector(".log-empty");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = `log-item ${action === "enter" ? "log-enter" : "log-exit"}`;

  const taskLabel = taskNumber
    ? `<span style="
        font-family:'DM Mono',monospace;
        font-size:9px;
        background:rgba(201,168,76,0.15);
        border:1px solid rgba(201,168,76,0.3);
        color:#c9a84c;
        border-radius:4px;
        padding:1px 6px;
        margin-left:4px;
        letter-spacing:1px;
      ">#${taskNumber}</span>`
    : "";

  item.innerHTML = `
    <span class="log-suit">${randomSuit()}</span>
    <div class="log-info">
      <span class="log-name">${guest.name}${taskLabel}</span>
      <span class="log-id">id: ${guest.docId}</span>
    </div>
    <div class="log-right">
      <span class="log-action-badge ${action}">${action === "enter" ? "▶ IN" : "◀ OUT"}</span>
      <span class="log-ts">${fmt(ts)}</span>
    </div>
  `;
  list.prepend(item);
}

// ── Main guest modal ───────────────────────────────────────────
function openModal(guest, action, ts, cipherText, decodedName, taskNumber) {
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

  // Task number display
  const taskEl = document.getElementById("modal-task-number");
  if (taskNumber) {
    taskEl.textContent = `#${taskNumber}`;
    taskEl.style.color = taskNumber === "00" ? "#cc0000" : "#c9a84c";
  } else {
    taskEl.textContent = "—";
    taskEl.style.color = "#5a3535";
  }

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

// ── Task Number Modal ─────────────────────────────────────────
async function openTaskModal(guest, action, ts, cipherText) {
  pendingTask = { guest, action, ts, cipherText };

  document.getElementById("task-guest-name").textContent = guest.name;
  document.getElementById("task-number-input").value = "";
  document.getElementById("task-error").style.display = "none";

  // Load and display availability
  try {
    const taken = await getTakenTaskNumbers();
    const wildUsed = taken.filter((n) => n === "00").length;
    const regularUsed = taken.filter((n) => n !== "00").length;
    const regularLeft = 107 - regularUsed;
    const wildLeft = 4 - wildUsed;
    document.getElementById("task-availability").textContent =
      `Regular: ${regularLeft}/107 left  ·  Wildcards (00): ${wildLeft}/4 left`;
  } catch (_) {
    document.getElementById("task-availability").textContent =
      "Could not load availability";
  }

  document.getElementById("task-modal-overlay").classList.add("active");
  setTimeout(() => document.getElementById("task-number-input").focus(), 300);
}

function closeTaskModal() {
  document.getElementById("task-modal-overlay").classList.remove("active");
  pendingTask = null;
}

async function handleTaskConfirm() {
  if (!pendingTask) return;

  const raw = document.getElementById("task-number-input").value.trim();
  const errorEl = document.getElementById("task-error");

  const showErr = (msg) => {
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  };

  // ── Validate input ────────────────────────────────────────
  if (!raw) {
    showErr("Please enter a task number.");
    return;
  }

  let taskNumber;

  if (raw === "00" || raw === "0") {
    taskNumber = "00";
  } else {
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 1 || num > 107 || String(num) !== raw) {
      showErr("Enter a whole number 1–107, or 00 for a wildcard.");
      return;
    }
    taskNumber = String(num);
  }

  // ── Check availability ────────────────────────────────────
  errorEl.style.display = "none";
  document.getElementById("task-confirm-btn").textContent = "…";
  document.getElementById("task-confirm-btn").disabled = true;

  try {
    const taken = await getTakenTaskNumbers();

    if (taskNumber === "00") {
      const wildUsed = taken.filter((n) => n === "00").length;
      if (wildUsed >= 4) {
        showErr("All 4 wildcard (00) slots are already taken.");
        return;
      }
    } else {
      if (taken.includes(taskNumber)) {
        showErr(`Task #${taskNumber} is already assigned to another guest.`);
        return;
      }
    }

    // ── Assign ────────────────────────────────────────────
    await assignTaskNumber(pendingTask.guest.docId, taskNumber);

    const { guest, action, ts, cipherText } = pendingTask;
    closeTaskModal();

    // Show the regular modal with the newly assigned task number
    openModal(guest, action, ts, cipherText, guest.name, taskNumber);

    const firstName =
      (guest.name ?? "").split(",")[1]?.trim().split(" ")[0] ?? guest.name;
    showToast(
      `Task #${taskNumber} → ${firstName} ${action === "enter" ? "♠" : "♦"}`,
      action === "enter" ? "enter" : "exit",
    );
    await refreshStats();
  } catch (err) {
    showErr("Error: " + (err.message ?? "Unknown error"));
  } finally {
    document.getElementById("task-confirm-btn").textContent = "ASSIGN";
    document.getElementById("task-confirm-btn").disabled = false;
  }
}

// ── Reset Modal ────────────────────────────────────────────────
function openResetModal() {
  document.getElementById("reset-code-input").value = "";
  document.getElementById("reset-error").style.display = "none";
  document.getElementById("reset-modal-overlay").classList.add("active");
  setTimeout(() => document.getElementById("reset-code-input").focus(), 300);
}

function closeResetModal() {
  document.getElementById("reset-modal-overlay").classList.remove("active");
}

async function handleResetConfirm() {
  const code = document.getElementById("reset-code-input").value;
  const errorEl = document.getElementById("reset-error");

  if (code !== "CSNight2026") {
    errorEl.textContent = "Incorrect reset code.";
    errorEl.style.display = "block";
    return;
  }

  const btn = document.getElementById("reset-confirm-btn");
  btn.textContent = "…";
  btn.disabled = true;
  errorEl.style.display = "none";

  try {
    showToast("Resetting system…", "info");
    await resetAll();

    // Reset local counters
    totalScans = 0;
    insideCount = 0;
    scanning = true;
    pendingTask = null;

    // Clear the log list
    document.getElementById("log-list").innerHTML = `
      <div class="log-empty">
        <span class="empty-icon">🃏</span>
        <span>Awaiting first scan…</span>
      </div>
    `;

    closeResetModal();
    await refreshStats();
    showToast("System reset complete ♦", "info");
  } catch (err) {
    errorEl.textContent = "Reset failed: " + (err.message ?? "Unknown error");
    errorEl.style.display = "block";
  } finally {
    btn.textContent = "RESET";
    btn.disabled = false;
  }
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

  showToast("Looking up guest…", "info");

  try {
    const isNumeric = /^\d+$/.test(cipherText);
    let guest = isNumeric
      ? await fetchGuestById(cipherText)
      : await fetchGuestByCipher(cipherText);

    if (!guest) {
      showToast("No guest found", "error");
      scanning = true;
      return;
    }

    const lastAction = await getLastAction(guest.docId);
    const action = lastAction === "enter" ? "exit" : "enter";

    // Fetch existing task number (may already be assigned from a prior entry)
    const taskNumber = await getTaskNumber(guest.docId);

    await logAccess(guest.docId, action);
    totalScans++;

    const now = new Date();
    appendLog(guest, action, now, taskNumber);

    const firstName =
      (guest.name ?? "").split(",")[1]?.trim().split(" ")[0] ?? guest.name;

    if (action === "enter" && !taskNumber) {
      // ── First entry: must assign a task number ────────────
      showToast(`Welcome, ${firstName}! Assign task # ♠`, "enter");
      await refreshStats();
      // Open the task assignment modal (it will open the guest modal on confirm)
      await openTaskModal(guest, action, now, cipherText);
    } else {
      // ── Re-entry or exit: show modal directly ─────────────
      openModal(guest, action, now, cipherText, guest.name, taskNumber);
      await refreshStats();

      showToast(
        action === "enter"
          ? `Welcome back, ${firstName}! ♠`
          : `Goodbye, ${firstName}! ♦`,
        action === "enter" ? "enter" : "exit",
      );
    }
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

// ── Summary Modal ─────────────────────────────────────────────

let summaryData = []; // cached results
let summaryFilter = "all"; // "all" | "enter" | "exit"
let summarySearch = "";

function fmtSummaryTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function renderSummaryList() {
  const container = document.getElementById("summary-list");
  const SUITS = ["♠", "♥", "♦", "♣"];
  const rnd = () => SUITS[Math.floor(Math.random() * SUITS.length)];

  const filtered = summaryData.filter((row) => {
    if (summaryFilter !== "all" && row.status !== summaryFilter) return false;
    if (summarySearch) {
      const q = summarySearch.toLowerCase();
      const nameMatch = (row.guest.name ?? "").toLowerCase().includes(q);
      const taskMatch = row.taskNumber && row.taskNumber.includes(q);
      if (!nameMatch && !taskMatch) return false;
    }
    return true;
  });

  if (!filtered.length) {
    container.innerHTML = `<div style="
      text-align:center;padding:40px 0;
      font-family:'DM Mono',monospace;font-size:11px;
      color:#3a2a5a;letter-spacing:2px;">No results</div>`;
    return;
  }

  container.innerHTML = filtered
    .map((row) => {
      const isInside = row.status === "enter";
      const taskBadge = row.taskNumber
        ? `<span class="sum-row-task ${row.taskNumber === "00" ? "wildcard" : ""}">#${row.taskNumber}</span>`
        : `<span style="font-family:'DM Mono',monospace;font-size:9px;color:#3a2a5a;padding:0 4px;">—</span>`;
      return `
        <div class="sum-row ${isInside ? "inside" : "outside"}">
          <span style="font-size:14px;color:#4a2a7a;flex-shrink:0;">${rnd()}</span>
          <span class="sum-row-name">${row.guest.name ?? row.guest.docId}</span>
          ${taskBadge}
          <span class="sum-row-badge ${isInside ? "inside" : "outside"}">${isInside ? "▶ IN" : "◀ OUT"}</span>
          <span class="sum-row-ts">${fmtSummaryTime(row.lastTimestamp)}</span>
        </div>`;
    })
    .join("");
}

function updateSummaryCounts() {
  const inside = summaryData.filter((r) => r.status === "enter").length;
  const outside = summaryData.filter((r) => r.status === "exit").length;
  document.getElementById("summary-inside-count").textContent = inside;
  document.getElementById("summary-outside-count").textContent = outside;
}

async function loadSummary() {
  const container = document.getElementById("summary-list");
  container.innerHTML = `<div style="
    text-align:center;padding:40px 0;
    font-family:'DM Mono',monospace;font-size:11px;
    color:#5a3a8a;letter-spacing:2px;
    animation:blink 1.2s step-end infinite;">Loading…</div>`;
  try {
    summaryData = await getSummary();
    updateSummaryCounts();
    renderSummaryList();
  } catch (err) {
    container.innerHTML = `<div style="
      text-align:center;padding:40px 0;
      font-family:'DM Mono',monospace;font-size:11px;
      color:#ff6060;">Error: ${err.message}</div>`;
  }
}

function openSummaryModal() {
  summaryFilter = "all";
  summarySearch = "";
  // Reset tab UI
  ["all", "enter", "exit"].forEach((f) => {
    document
      .getElementById(`sum-tab-${f}`)
      ?.classList.toggle("active", f === "all");
  });
  document.getElementById("summary-search").value = "";
  document.getElementById("summary-modal-overlay").classList.add("active");
  loadSummary();
}

function closeSummaryModal() {
  document.getElementById("summary-modal-overlay").classList.remove("active");
}

// ── QR Scanner init ───────────────────────────────────────────
export function initScanner() {
  // ── Guest modal ──────────────────────────────────────────
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // ── Manual input ─────────────────────────────────────────
  document.getElementById("manual-btn").addEventListener("click", () => {
    const val = document.getElementById("manual-id").value.trim();
    document.getElementById("manual-id").value = "";
    if (val) handleScan(val);
  });
  document.getElementById("manual-id").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("manual-btn").click();
  });

  // ── Camera switch ─────────────────────────────────────────
  document
    .getElementById("switch-camera-btn")
    .addEventListener("click", switchCamera);

  // ── Task assignment modal ─────────────────────────────────
  document
    .getElementById("task-confirm-btn")
    .addEventListener("click", handleTaskConfirm);

  document
    .getElementById("task-number-input")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleTaskConfirm();
    });

  document.getElementById("task-skip-btn").addEventListener("click", () => {
    if (!pendingTask) return;
    const { guest, action, ts, cipherText } = pendingTask;
    closeTaskModal();
    openModal(guest, action, ts, cipherText, guest.name, null);
    scanning = true;
  });

  // ── Reset modal ───────────────────────────────────────────
  document
    .getElementById("reset-btn")
    .addEventListener("click", openResetModal);

  document
    .getElementById("reset-modal-close")
    .addEventListener("click", closeResetModal);

  document
    .getElementById("reset-modal-overlay")
    .addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeResetModal();
    });

  document
    .getElementById("reset-confirm-btn")
    .addEventListener("click", handleResetConfirm);

  document
    .getElementById("reset-code-input")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleResetConfirm();
    });

  // ── Summary modal ─────────────────────────────────────────────
  document
    .getElementById("summary-btn")
    .addEventListener("click", openSummaryModal);
  document
    .getElementById("summary-modal-close")
    .addEventListener("click", closeSummaryModal);
  document
    .getElementById("summary-modal-overlay")
    .addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeSummaryModal();
    });
  document
    .getElementById("summary-refresh-btn")
    .addEventListener("click", loadSummary);

  document.querySelectorAll(".sum-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      summaryFilter = tab.dataset.filter;
      document
        .querySelectorAll(".sum-tab")
        .forEach((t) => t.classList.toggle("active", t === tab));
      renderSummaryList();
    });
  });

  document.getElementById("summary-search").addEventListener("input", (e) => {
    summarySearch = e.target.value.trim();
    renderSummaryList();
  });

  // ── QR Scanner ────────────────────────────────────────────
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
        const rearCams = cameras.filter((c) =>
          /back|rear|environment/i.test(c.label),
        );
        let startCam;
        if (rearCams.length > 1) {
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
