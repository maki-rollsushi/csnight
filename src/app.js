export function renderApp() {
  document.getElementById("app").innerHTML = `
    <div class="bg-cards">
      <div class="card" style="left:81%;animation-duration:30.6s;animation-delay:-3.1s;--rot-start:-15deg;--rot-end:-16deg;"><div class="c-top">A<br>♠</div><div class="c-mid">♠</div><div class="c-bot">A<br>♠</div></div>
      <div class="card red-card" style="left:17%;animation-duration:29.5s;animation-delay:-20.6s;--rot-start:27deg;--rot-end:4deg;"><div class="c-top">K<br>♥</div><div class="c-mid">♥</div><div class="c-bot">K<br>♥</div></div>
      <div class="card red-card" style="left:11%;animation-duration:18.5s;animation-delay:-16.5s;--rot-start:-25deg;--rot-end:-17deg;"><div class="c-top">Q<br>♦</div><div class="c-mid">♦</div><div class="c-bot">Q<br>♦</div></div>
      <div class="card" style="left:29%;animation-duration:18.5s;animation-delay:-14.1s;--rot-start:-18deg;--rot-end:15deg;"><div class="c-top">J<br>♣</div><div class="c-mid">♣</div><div class="c-bot">J<br>♣</div></div>
      <div class="card red-card" style="left:83%;animation-duration:25.1s;animation-delay:-19.6s;--rot-start:-2deg;--rot-end:7deg;"><div class="c-top">A<br>♥</div><div class="c-mid">♥</div><div class="c-bot">A<br>♥</div></div>
      <div class="card" style="left:35%;animation-duration:18.1s;animation-delay:-22.7s;--rot-start:21deg;--rot-end:-20deg;"><div class="c-top">10<br>♠</div><div class="c-mid">♠</div><div class="c-bot">10<br>♠</div></div>
      <div class="card" style="left:89%;animation-duration:22.7s;animation-delay:-11.8s;--rot-start:-17deg;--rot-end:18deg;"><div class="c-top">K<br>♣</div><div class="c-mid">♣</div><div class="c-bot">K<br>♣</div></div>
      <div class="card" style="left:43%;animation-duration:24.5s;animation-delay:-2.9s;--rot-start:-8deg;--rot-end:24deg;"><div class="c-top">Q<br>♠</div><div class="c-mid">♠</div><div class="c-bot">Q<br>♠</div></div>
      <div class="card red-card" style="left:44%;animation-duration:31.7s;animation-delay:-16.9s;--rot-start:16deg;--rot-end:-1deg;"><div class="c-top">J<br>♦</div><div class="c-mid">♦</div><div class="c-bot">J<br>♦</div></div>
      <div class="card red-card" style="left:68%;animation-duration:33.7s;animation-delay:-3.5s;--rot-start:-25deg;--rot-end:5deg;"><div class="c-top">A<br>♦</div><div class="c-mid">♦</div><div class="c-bot">A<br>♦</div></div>
      <div class="card" style="left:37%;animation-duration:28.5s;animation-delay:-23.2s;--rot-start:25deg;--rot-end:-7deg;"><div class="c-top">7<br>♠</div><div class="c-mid">♠</div><div class="c-bot">7<br>♠</div></div>
      <div class="card red-card" style="left:73%;animation-duration:19.2s;animation-delay:-5.4s;--rot-start:12deg;--rot-end:-16deg;"><div class="c-top">8<br>♥</div><div class="c-mid">♥</div><div class="c-bot">8<br>♥</div></div>
      <div class="card" style="left:37%;animation-duration:32.5s;animation-delay:-27.6s;--rot-start:25deg;--rot-end:-24deg;"><div class="c-top">9<br>♣</div><div class="c-mid">♣</div><div class="c-bot">9<br>♣</div></div>
      <div class="card red-card" style="left:48%;animation-duration:28.8s;animation-delay:-7.8s;--rot-start:-7deg;--rot-end:-20deg;"><div class="c-top">5<br>♦</div><div class="c-mid">♦</div><div class="c-bot">5<br>♦</div></div>
      <div class="card" style="left:47%;animation-duration:29.4s;animation-delay:-9.9s;--rot-start:14deg;--rot-end:29deg;"><div class="c-top">A<br>♣</div><div class="c-mid">♣</div><div class="c-bot">A<br>♣</div></div>
      <div class="card red-card" style="left:87%;animation-duration:28.4s;animation-delay:-18.1s;--rot-start:-20deg;--rot-end:4deg;"><div class="c-top">K<br>♦</div><div class="c-mid">♦</div><div class="c-bot">K<br>♦</div></div>
      <div class="card red-card" style="left:93%;animation-duration:25.9s;animation-delay:-6.9s;--rot-start:-13deg;--rot-end:29deg;"><div class="c-top">Q<br>♥</div><div class="c-mid">♥</div><div class="c-bot">Q<br>♥</div></div>
      <div class="card" style="left:81%;animation-duration:21.7s;animation-delay:-19.3s;--rot-start:-10deg;--rot-end:23deg;"><div class="c-top">J<br>♠</div><div class="c-mid">♠</div><div class="c-bot">J<br>♠</div></div>
    </div>
    <div class="bg-noise"></div>

    <!-- HEADER -->
    <header class="header">
      <div class="header-left">
        <span class="suit black-suit">♠</span>
        <span class="suit gold-suit">♥</span>
      </div>
      <div class="header-center">
        <div class="crown">♛</div>
        <h1 class="title">CS <span class="gold">NIGHT</span></h1>
        <div class="reboot-tag">&lt; THE REBOOT /&gt;</div>
        <p class="subtitle">Event Access Terminal</p>
      </div>
      <div class="header-right">
        <span class="suit gold-suit">♦</span>
        <span class="suit black-suit">♣</span>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="main">

      <!-- SCANNER PANEL -->
      <section class="scanner-panel">
        <div class="panel-label">
          <span class="dot"></span> SCANNER ACTIVE
        </div>
        <div class="scanner-frame" id="scanner-frame">
          <div id="reader"></div>
          <div class="scan-line"></div>
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>
        </div>
        <p class="scan-hint">Point camera at guest QR code</p>
        <button id="switch-camera-btn" style="
          background:transparent; border:1px solid #555; color:#aaa;
          border-radius:6px; padding:0.3rem 0.8rem; font-size:0.72rem;
          letter-spacing:1px; cursor:pointer; margin-top:0.4rem;
        ">⇄ SWITCH CAMERA</button>

        <!-- Manual input fallback -->
        <div class="manual-input-wrap">
          <div class="divider"><span>or enter cipher manually</span></div>
          <div class="manual-row">
            <input type="text" id="manual-id" class="manual-input" placeholder="Paste cipher text or guest ID" autocomplete="off" />
            <button id="manual-btn" class="btn-manual">SCAN</button>
          </div>
        </div>
      </section>

      <!-- LOG PANEL -->
      <section class="log-panel">
        <div class="log-header">
          <h2 class="log-title">ACCESS LOG</h2>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="live-badge">● LIVE</div>
            <!-- RESET BUTTON -->
            <button id="reset-btn" style="
              background: transparent;
              border: 1px solid #4a0000;
              color: #7a3030;
              border-radius: 5px;
              padding: 3px 10px;
              font-size: 9px;
              letter-spacing: 2px;
              cursor: pointer;
              font-family: 'DM Mono', monospace;
              transition: border-color 0.2s, color 0.2s;
            " onmouseover="this.style.borderColor='#cc0000';this.style.color='#cc0000';"
               onmouseout="this.style.borderColor='#4a0000';this.style.color='#7a3030';">
              ⟳ RESET
            </button>
          </div>
        </div>
        <div class="log-stats" id="log-stats">
          <div class="stat">
            <span class="stat-val" id="stat-inside">0</span>
            <span class="stat-label">INSIDE</span>
          </div>
          <div class="stat-divider">|</div>
          <div class="stat">
            <span class="stat-val" id="stat-total">0</span>
            <span class="stat-label">TOTAL SCANS</span>
          </div>
        </div>
        <!-- SUMMARY BUTTON -->
        <button id="summary-btn" style="
          width:100%;
          background: linear-gradient(135deg, #0a0a1a, #100020);
          border: 1px solid #2a1a4a;
          color: #8a70c0;
          border-radius: 8px;
          padding: 9px 0;
          font-size: 10px;
          letter-spacing: 3px;
          cursor: pointer;
          font-family: \'Cinzel\', serif;
          margin-bottom: 12px;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        " onmouseover="this.style.borderColor=\'#7a50c0\';this.style.color=\'#c0a0ff\';this.style.background=\'linear-gradient(135deg,#12082a,#1a0835)\';"
           onmouseout="this.style.borderColor=\'#2a1a4a\';this.style.color=\'#8a70c0\';this.style.background=\'linear-gradient(135deg,#0a0a1a,#100020)\';">
          ♟ VIEW ATTENDEE SUMMARY
        </button>

        <div class="log-list" id="log-list">
          <div class="log-empty">
            <span class="empty-icon">🃏</span>
            <span>Awaiting first scan…</span>
          </div>
        </div>
      </section>

    </main>

    <!-- MODAL OVERLAY (Guest info) -->
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal" id="modal">
        <button class="modal-close" id="modal-close">✕</button>

        <div class="modal-header">
          <div class="modal-suits">
            <span id="modal-suit-icon" class="modal-suit-big">♠</span>
          </div>
          <div class="modal-title-block">
            <div class="modal-guest-label">GUEST</div>
            <div class="modal-name" id="modal-name">—</div>
            <div class="modal-cipher-row">
              <span class="modal-id" id="modal-id">Cipher: —</span>
              <span class="modal-decoded" id="modal-decoded">→ —</span>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <div class="modal-row">
            <span class="modal-field">Task Number</span>
            <span class="modal-value" id="modal-task-number" style="font-family:'DM Mono',monospace;font-size:18px;color:#c9a84c;">—</span>
          </div>
          <div class="modal-row">
            <span class="modal-field">Table Number</span>
            <span class="modal-value" id="modal-table-number" style="font-family:'DM Mono',monospace;font-size:18px;color:#70b0ff;">—</span>
          </div>
          <div class="modal-row">
            <span class="modal-field">Payment Status</span>
            <span class="modal-value" id="modal-payment">—</span>
          </div>
          <div class="modal-row">
            <span class="modal-field">Section</span>
            <span class="modal-value" id="modal-section">—</span>
          </div>
          <div class="modal-row">
            <span class="modal-field">Dietary Note</span>
            <span class="modal-value" id="modal-dietary">—</span>
          </div>
          <div class="modal-row">
            <span class="modal-field">Verification</span>
            <span class="modal-value" id="modal-status-text">—</span>
          </div>
          <div class="modal-row">
            <span class="modal-field">Timestamp</span>
            <span class="modal-value" id="modal-time">—</span>
          </div>
        </div>

        <div class="modal-action" id="modal-action">
          <div class="action-badge" id="action-badge">ENTERING</div>
        </div>
      </div>
    </div>

    <!-- TASK NUMBER ASSIGNMENT MODAL -->
    <div class="modal-overlay" id="task-modal-overlay">
      <div class="modal" id="task-modal" style="max-width:420px;">
        <!-- No close button — task must be assigned or skipped -->

        <div class="modal-header" style="background:linear-gradient(135deg,#0a1a00,#121f00);">
          <div class="modal-suits">
            <span class="modal-suit-big" style="color:#c9a84c;">🎴</span>
          </div>
          <div class="modal-title-block">
            <div class="modal-guest-label" style="color:#7a9a60;">TASK ASSIGNMENT</div>
            <div class="modal-name" id="task-guest-name" style="color:#e8f0d8;font-size:clamp(13px,3.5vw,16px);">—</div>
            <div style="font-family:'DM Mono',monospace;font-size:10px;color:#4a7a40;margin-top:4px;" id="task-availability">
              Loading availability…
            </div>
          </div>
        </div>

        <div class="modal-body" style="background:#080a00;">
          <p style="
            font-family:'DM Mono',monospace;
            font-size:11px;
            color:#7a9a60;
            letter-spacing:1px;
            margin-bottom:14px;
            line-height:1.5;
          ">
            Enter a task number <strong style="color:#c9a84c;">1 – 107</strong> for this guest,<br>
            or <strong style="color:#c9a84c;">00</strong> for a wildcard slot.<br>
            <span style="color:#4a8a60;font-size:10px;">Table is pre-assigned from the seat plan.</span>
          </p>
          <div class="manual-row" style="gap:10px;margin-bottom:14px;">
            <input
              type="text"
              id="task-number-input"
              class="manual-input"
              placeholder="Task # (e.g. 42 or 00)"
              autocomplete="off"
              inputmode="numeric"
              style="font-size:1.1rem;letter-spacing:3px;text-align:center;"
            />
          </div>
          <div class="manual-row" style="gap:10px;justify-content:center;">
            <button id="task-confirm-btn" class="btn-manual" style="
              background:linear-gradient(135deg,#1a4a00,#2a6a00);
              border-color:#3a7a20;
              color:#c8fce0;
              min-width:120px;
            ">ASSIGN</button>
          </div>
          <p id="task-error" style="
            color:#ff6060;
            font-size:10px;
            font-family:'DM Mono',monospace;
            letter-spacing:1px;
            margin-top:10px;
            display:none;
          "></p>
        </div>

        <div class="modal-action" style="background:#050800;border-top:1px solid #1a2a00;padding:10px 20px;display:flex;justify-content:center;">
          <button id="task-skip-btn" style="
            background:transparent;
            border:1px solid #2a1a00;
            color:#5a4030;
            border-radius:6px;
            padding:6px 20px;
            font-size:9px;
            letter-spacing:2px;
            cursor:pointer;
            font-family:'DM Mono',monospace;
          ">SKIP FOR NOW</button>
        </div>
      </div>
    </div>

    <!-- RESET CONFIRMATION MODAL -->
    <div class="modal-overlay" id="reset-modal-overlay">
      <div class="modal" id="reset-modal" style="max-width:380px;">
        <button class="modal-close" id="reset-modal-close">✕</button>

        <div class="modal-header" style="background:linear-gradient(135deg,#1a0000,#2a0000);">
          <div class="modal-suits">
            <span class="modal-suit-big" style="color:#cc0000;font-size:36px;">⚠</span>
          </div>
          <div class="modal-title-block">
            <div class="modal-guest-label">SYSTEM RESET</div>
            <div class="modal-name" style="color:#ff6060;font-size:clamp(13px,3.5vw,16px);">DANGER ZONE</div>
            <div style="font-family:'DM Mono',monospace;font-size:10px;color:#7a3030;margin-top:4px;">
              This will erase ALL scan logs &amp; task assignments
            </div>
          </div>
        </div>

        <div class="modal-body">
          <p style="
            font-family:'DM Mono',monospace;
            font-size:11px;
            color:#9a5050;
            letter-spacing:1px;
            margin-bottom:14px;
          ">Enter the reset code to proceed:</p>
          <div class="manual-row" style="gap:10px;">
            <input
              type="password"
              id="reset-code-input"
              class="manual-input"
              placeholder="Reset code"
              autocomplete="off"
            />
            <button id="reset-confirm-btn" class="btn-manual" style="
              background:linear-gradient(135deg,#6a0000,#aa0000);
              border-color:#cc0000;
              color:#ffd0d0;
              min-width:80px;
            ">RESET</button>
          </div>
          <p id="reset-error" style="
            color:#ff6060;
            font-size:10px;
            font-family:'DM Mono',monospace;
            letter-spacing:1px;
            margin-top:10px;
            display:none;
          "></p>
        </div>
      </div>
    </div>

    <!-- ATTENDEE SUMMARY MODAL -->
    <div class="modal-overlay" id="summary-modal-overlay" style="align-items:flex-start;padding-top:0;">
      <div class="modal" style="
        max-width:520px;
        width:100%;
        border-radius:0 0 var(--radius-lg) var(--radius-lg);
        max-height:92vh;
        display:flex;
        flex-direction:column;
        overflow:hidden;
      ">
        <button class="modal-close" id="summary-modal-close" style="top:14px;right:14px;">✕</button>

        <!-- Header -->
        <div class="modal-header" style="
          background:linear-gradient(135deg,#080012,#120028);
          border-bottom:1px solid #2a1a4a;
          flex-shrink:0;
        ">
          <div class="modal-suits">
            <span class="modal-suit-big" style="color:#9a70e0;font-size:36px;">♟</span>
          </div>
          <div class="modal-title-block" style="flex:1;">
            <div class="modal-guest-label" style="color:#5a3a8a;">ATTENDEE SUMMARY</div>
            <div style="display:flex;gap:16px;align-items:center;margin-top:4px;">
              <span style="font-family:\'DM Mono\',monospace;font-size:13px;color:#4ecb8a;">
                ▶ INSIDE: <strong id="summary-inside-count">—</strong>
              </span>
              <span style="color:#3a1a5a;">|</span>
              <span style="font-family:\'DM Mono\',monospace;font-size:13px;color:#ff6060;">
                ◀ OUTSIDE: <strong id="summary-outside-count">—</strong>
              </span>
            </div>
          </div>
          <button id="summary-refresh-btn" style="
            background:transparent;
            border:1px solid #3a2a5a;
            color:#7a50c0;
            border-radius:6px;
            padding:5px 10px;
            font-size:11px;
            cursor:pointer;
            font-family:\'DM Mono\',monospace;
            flex-shrink:0;
          ">⟳</button>
        </div>

        <!-- Filter tabs + search -->
        <div style="
          background:#080012;
          border-bottom:1px solid #1a0a30;
          padding:10px 16px;
          display:flex;
          gap:8px;
          align-items:center;
          flex-shrink:0;
        ">
          <div style="display:flex;gap:4px;flex-shrink:0;">
            <button class="sum-tab active" data-filter="all" id="sum-tab-all">ALL</button>
            <button class="sum-tab" data-filter="enter" id="sum-tab-enter">INSIDE</button>
            <button class="sum-tab" data-filter="exit" id="sum-tab-exit">OUTSIDE</button>
          </div>
          <input
            type="text"
            id="summary-search"
            placeholder="Search name or task #…"
            style="
              flex:1;
              background:#0c0020;
              border:1px solid #2a1a4a;
              border-radius:6px;
              padding:6px 10px;
              font-family:\'DM Mono\',monospace;
              font-size:11px;
              color:#c0a0ff;
              letter-spacing:1px;
              outline:none;
            "
          />
        </div>

        <!-- List -->
        <div id="summary-list" style="
          flex:1;
          overflow-y:auto;
          padding:10px 12px;
          display:flex;
          flex-direction:column;
          gap:6px;
          background:#060010;
        ">
          <div style="
            text-align:center;
            padding:40px 0;
            font-family:\'DM Mono\',monospace;
            font-size:11px;
            color:#3a2a5a;
            letter-spacing:2px;
          ">Loading…</div>
        </div>

        <style>
          .sum-tab {
            background: transparent;
            border: 1px solid #2a1a4a;
            color: #5a3a8a;
            border-radius: 5px;
            padding: 4px 10px;
            font-size: 9px;
            letter-spacing: 2px;
            cursor: pointer;
            font-family: \'Cinzel\', serif;
            transition: all 0.15s;
          }
          .sum-tab.active {
            background: #2a1a4a;
            color: #c0a0ff;
            border-color: #7a50c0;
          }
          .sum-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            border-radius: 8px;
            background: #0c0020;
            border-left: 3px solid transparent;
            animation: slide-in 0.22s ease-out;
          }
          .sum-row.inside { border-left-color: #2ea86a; }
          .sum-row.outside { border-left-color: #cc0000; }
          .sum-row-name {
            flex: 1;
            font-size: 11px;
            font-family: \'Cinzel\', serif;
            color: #e0d0f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sum-row-task {
            font-family: \'DM Mono\', monospace;
            font-size: 10px;
            background: rgba(201,168,76,0.12);
            border: 1px solid rgba(201,168,76,0.3);
            color: #c9a84c;
            border-radius: 4px;
            padding: 2px 7px;
            letter-spacing: 1px;
            flex-shrink: 0;
          }
          .sum-row-task.wildcard {
            background: rgba(204,0,0,0.12);
            border-color: rgba(204,0,0,0.35);
            color: #ff6060;
          }
          .sum-row-badge {
            font-size: 9px;
            font-family: \'Cinzel\', serif;
            letter-spacing: 1px;
            padding: 2px 7px;
            border-radius: 4px;
            flex-shrink: 0;
          }
          .sum-row-badge.inside {
            background: rgba(26,122,74,0.2);
            color: #4ecb8a;
            border: 1px solid rgba(26,122,74,0.4);
          }
          .sum-row-badge.outside {
            background: rgba(204,0,0,0.15);
            color: #ff6060;
            border: 1px solid rgba(204,0,0,0.35);
          }
          .sum-row-ts {
            font-size: 9px;
            font-family: \'DM Mono\', monospace;
            color: #3a2a5a;
            flex-shrink: 0;
          }
          #summary-list::-webkit-scrollbar { width: 3px; }
          #summary-list::-webkit-scrollbar-track { background: #060010; }
          #summary-list::-webkit-scrollbar-thumb { background: #3a1a6a; border-radius: 4px; }
        </style>
      </div>
    </div>

        <!-- TOAST -->
    <div class="toast" id="toast"></div>
  `;
}
