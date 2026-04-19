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
          <div class="live-badge">● LIVE</div>
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
        <div class="log-list" id="log-list">
          <div class="log-empty">
            <span class="empty-icon">🃏</span>
            <span>Awaiting first scan…</span>
          </div>
        </div>
      </section>

    </main>

    <!-- MODAL OVERLAY -->
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
            <span class="modal-field">Payment Status</span>
            <span class="modal-value" id="modal-payment">—</span>
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

    <!-- TOAST -->
    <div class="toast" id="toast"></div>
  `;
}
