<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ESP32 Dual Pulse Monitor</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg:        #050c10;
      --surface:   #0a1820;
      --border:    #0d3040;
      --pulse-a:   #00e5ff;   /* INPUT  — cyan  */
      --pulse-b:   #ff6b35;   /* OUTPUT — orange */
      --green:     #00ff88;
      --red:       #ff3355;
      --text:      #c8dce6;
      --text-dim:  #4a7085;
      --mono:      'Share Tech Mono', monospace;
      --sans:      'Rajdhani', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg); color: var(--text);
      font-family: var(--sans); min-height: 100vh; overflow-x: hidden;
    }
    body::after {
      content: ''; position: fixed; inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
      pointer-events: none; z-index: 999;
    }

    /* ── HEADER ── */
    header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 28px; border-bottom: 1px solid var(--border);
      background: linear-gradient(90deg, #070f17, #0a1820);
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 36px; height: 36px; border: 2px solid var(--pulse-a);
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
    }
    .logo-icon svg { width: 22px; height: 22px; }
    .logo-text { font-size: 1.2rem; font-weight: 700; letter-spacing: 2px; color: var(--pulse-a); }
    .logo-sub  { font-family: var(--mono); font-size: 0.6rem; color: var(--text-dim); letter-spacing: 1px; }
    .conn-badge {
      display: flex; align-items: center; gap: 8px;
      font-family: var(--mono); font-size: 0.72rem;
      padding: 6px 14px; border: 1px solid var(--border);
      border-radius: 20px; background: rgba(0,229,255,0.04);
    }
    .conn-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); transition: background 0.3s; }
    .conn-dot.live { background: var(--green); box-shadow: 0 0 8px var(--green); animation: blink 1.4s infinite; }
    @keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }

    /* ── TWO CHANNEL LAYOUT ── */
    .channels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      padding: 14px 28px 28px;
    }

    .channel { display: flex; flex-direction: column; gap: 12px; }

    /* ── CHANNEL HEADER BADGE ── */
    .ch-badge {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 18px;
      border-radius: 8px;
      border: 1px solid;
      font-family: var(--mono);
    }
    .ch-badge.input  { border-color: var(--pulse-a); background: rgba(0,229,255,0.05); }
    .ch-badge.output { border-color: var(--pulse-b); background: rgba(255,107,53,0.05); }
    .ch-dot { width: 10px; height: 10px; border-radius: 50%; animation: blink 1.2s infinite; }
    .input  .ch-dot { background: var(--pulse-a); box-shadow: 0 0 8px var(--pulse-a); }
    .output .ch-dot { background: var(--pulse-b); box-shadow: 0 0 8px var(--pulse-b); }
    .ch-title { font-size: 1rem; font-weight: 700; letter-spacing: 2px; }
    .input  .ch-title { color: var(--pulse-a); }
    .output .ch-title { color: var(--pulse-b); }
    .ch-sub { font-size: 0.62rem; color: var(--text-dim); margin-top: 1px; }

    /* ── STAT CARDS ── */
    .stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 12px 14px; position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 0;
      width: 3px; height: 100%;
    }
    .input  .stat-card::before { background: var(--pulse-a); }
    .output .stat-card::before { background: var(--pulse-b); }
    .stat-label { font-family: var(--mono); font-size: 0.6rem; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
    .stat-val   { font-family: var(--mono); font-size: 1.4rem; line-height: 1; }
    .input  .stat-val { color: var(--pulse-a); }
    .output .stat-val { color: var(--pulse-b); }
    .stat-unit { font-size: 0.6rem; color: var(--text-dim); margin-top: 2px; }

    /* ── PANEL ── */
    .panel {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; overflow: hidden;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; border-bottom: 1px solid var(--border);
      background: rgba(0,229,255,0.02);
    }
    .panel-title {
      font-size: 0.72rem; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; display: flex; align-items: center; gap: 8px;
    }
    .input  .panel-title { color: var(--pulse-a); }
    .output .panel-title { color: var(--pulse-b); }
    .panel-tag { font-family: var(--mono); font-size: 0.6rem; color: var(--text-dim); }

    /* ── SCOPE ── */
    .scope-wrap {
      position: relative; padding: 10px 0; background: #030a0e;
    }
    .scope-wrap::before {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 50px 36px; opacity: 0.45;
    }
    .scope-canvas { display: block; width: 100%; height: 150px; }

    /* ── TABLE ── */
    .bucket-wrap { height: 240px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
    .bucket-table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 0.72rem; }
    .bucket-table thead { position: sticky; top: 0; background: #0a1820; z-index: 1; }
    .bucket-table th {
      padding: 8px 14px; text-align: left; color: var(--text-dim);
      font-size: 0.6rem; letter-spacing: 1px; text-transform: uppercase;
      border-bottom: 1px solid var(--border);
    }
    .bucket-table th.right { text-align: right; }
    .bucket-table td { padding: 8px 14px; border-bottom: 1px solid rgba(13,48,64,0.4); }
    .bucket-table tr:hover td { background: rgba(0,229,255,0.03); }
    .bucket-table tr:last-child td { border-bottom: none; }
    .bucket-count { font-size: 0.95rem; font-weight: bold; }
    .bucket-count.high { color: #00ff88; }
    .bucket-count.mid  { color: #00e5ff; }
    .bucket-count.low  { color: #ff6b35; }
    .bucket-count.zero { color: var(--text-dim); }
    .output .bucket-count.mid { color: var(--pulse-b); }
    .bucket-bar { width: 100%; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 3px; }
    .input  .bucket-bar-fill { height: 100%; border-radius: 2px; background: var(--pulse-a); transition: width 0.4s; }
    .output .bucket-bar-fill { height: 100%; border-radius: 2px; background: var(--pulse-b); transition: width 0.4s; }

    /* ── LOG ── */
    .log-wrap {
      height: 130px; overflow-y: auto; padding: 8px 16px;
      font-family: var(--mono); font-size: 0.68rem;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    }
    .log-line { display: flex; gap: 12px; padding: 3px 0; border-bottom: 1px solid rgba(13,48,64,0.35); animation: fadeIn 0.3s ease; }
    .log-line:last-child { border-bottom: none; }
    .log-time { color: var(--text-dim); min-width: 82px; }
    .input  .log-pulse { color: var(--pulse-a); }
    .output .log-pulse { color: var(--pulse-b); }
    @keyframes fadeIn { from { opacity:0; transform:translateY(-3px); } to { opacity:1; transform:none; } }

    /* ── TABS ── */
    .tabs { display: flex; gap: 4px; }
    .tab {
      font-family: var(--mono); font-size: 0.6rem; padding: 3px 8px;
      border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-dim); cursor: pointer; transition: all 0.2s; letter-spacing: 1px;
    }
    .input  .tab:hover, .input  .tab.active { border-color: var(--pulse-a); color: var(--pulse-a); background: rgba(0,229,255,0.07); }
    .output .tab:hover, .output .tab.active { border-color: var(--pulse-b); color: var(--pulse-b); background: rgba(255,107,53,0.07); }

    /* ── PWM BADGE ── */
    .pwm-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      background: rgba(255,107,53,0.06);
      border: 1px solid rgba(255,107,53,0.3);
      border-radius: 8px;
      font-family: var(--mono); font-size: 0.7rem; color: var(--pulse-b);
    }
    .pwm-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--pulse-b); box-shadow: 0 0 6px var(--pulse-b); animation: blink 0.6s infinite; }

    @media (max-width: 900px) {
      .channels { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<header>
  <div class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round">
        <polyline points="2,12 6,12 7,4 9,20 11,10 13,14 15,12 22,12"/>
      </svg>
    </div>
    <div>
      <div class="logo-text">DUAL PULSE MONITOR</div>
      <div class="logo-sub">ESP32 INPUT (GPIO2) · ESP32 OUTPUT (GPIO2) · 500kHz GEN (GPIO4)</div>
    </div>
  </div>
  <div class="conn-badge">
    <div class="conn-dot" id="connDot"></div>
    <span id="connLabel">CONNECTING...</span>
  </div>
</header>

<div class="channels">

  <!-- ══ CHANNEL A — INPUT ══════════════════════════════════════════ -->
  <div class="channel input" id="chA">

    <div class="ch-badge input">
      <div class="ch-dot"></div>
      <div>
        <div class="ch-title">ESP32 #1 — INPUT</div>
        <div class="ch-sub">GPIO 2 · 0.1Hz · Monitoring system INPUT pulse</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-label">Total (5d)</div>
        <div class="stat-val" id="aTotalPulses">—</div>
        <div class="stat-unit">pulses</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last 10 Min</div>
        <div class="stat-val" id="aLast10">—</div>
        <div class="stat-unit">pulses</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last Pulse</div>
        <div class="stat-val" id="aLastTime" style="font-size:0.9rem;margin-top:4px">—</div>
        <div class="stat-unit">time</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">⬤ LIVE WAVEFORM</div>
        <div class="panel-tag">LAST 10 MIN</div>
      </div>
      <div class="scope-wrap">
        <canvas class="scope-canvas" id="scopeA"></canvas>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">10-MIN COUNT</div>
        <div class="tabs">
          <button class="tab active" data-ch="A" data-days="0.0417">1H</button>
          <button class="tab" data-ch="A" data-days="0.25">6H</button>
          <button class="tab" data-ch="A" data-days="1">1D</button>
          <button class="tab" data-ch="A" data-days="5">5D</button>
        </div>
      </div>
      <div class="bucket-wrap">
        <table class="bucket-table">
          <thead><tr>
            <th>#</th><th>TIME INTERVAL</th><th>BAR</th><th class="right">COUNT</th>
          </tr></thead>
          <tbody id="bucketsA"><tr><td colspan="4" style="text-align:center;color:var(--text-dim);padding:24px;letter-spacing:2px">NO DATA YET</td></tr></tbody>
        </table>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">⬤ PULSE LOG</div>
        <div class="panel-tag">LIVE STREAM</div>
      </div>
      <div class="log-wrap" id="logA"><div style="color:var(--text-dim);padding:10px;font-family:var(--mono);font-size:0.7rem">Waiting...</div></div>
    </div>

  </div><!-- end channel A -->

  <!-- ══ CHANNEL B — OUTPUT ═════════════════════════════════════════ -->
  <div class="channel output" id="chB">

    <div class="ch-badge output">
      <div class="ch-dot"></div>
      <div>
        <div class="ch-title">ESP32 #2 — OUTPUT</div>
        <div class="ch-sub">GPIO 2 · 0.1Hz monitor · GPIO 4 · 500kHz generator</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-label">Total (5d)</div>
        <div class="stat-val" id="bTotalPulses">—</div>
        <div class="stat-unit">pulses</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last 10 Min</div>
        <div class="stat-val" id="bLast10">—</div>
        <div class="stat-unit">pulses</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last Pulse</div>
        <div class="stat-val" id="bLastTime" style="font-size:0.9rem;margin-top:4px">—</div>
        <div class="stat-unit">time</div>
      </div>
    </div>

    <!-- PWM status badge -->
    <div class="pwm-badge">
      <div class="pwm-dot"></div>
      <span>500 kHz SQUARE WAVE · GPIO 4 · HARDWARE PWM · 50% DUTY CYCLE</span>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">⬤ LIVE WAVEFORM</div>
        <div class="panel-tag">LAST 10 MIN</div>
      </div>
      <div class="scope-wrap">
        <canvas class="scope-canvas" id="scopeB"></canvas>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">10-MIN COUNT</div>
        <div class="tabs">
          <button class="tab active" data-ch="B" data-days="0.0417">1H</button>
          <button class="tab" data-ch="B" data-days="0.25">6H</button>
          <button class="tab" data-ch="B" data-days="1">1D</button>
          <button class="tab" data-ch="B" data-days="5">5D</button>
        </div>
      </div>
      <div class="bucket-wrap">
        <table class="bucket-table">
          <thead><tr>
            <th>#</th><th>TIME INTERVAL</th><th>BAR</th><th class="right">COUNT</th>
          </tr></thead>
          <tbody id="bucketsB"><tr><td colspan="4" style="text-align:center;color:var(--text-dim);padding:24px;letter-spacing:2px">NO DATA YET</td></tr></tbody>
        </table>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">⬤ PULSE LOG</div>
        <div class="panel-tag">LIVE STREAM</div>
      </div>
      <div class="log-wrap" id="logB"><div style="color:var(--text-dim);padding:10px;font-family:var(--mono);font-size:0.7rem">Waiting...</div></div>
    </div>

  </div><!-- end channel B -->

</div><!-- end channels -->

<script>
const WS_URL = `${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws`;
const WINDOW_MS = 10 * 60 * 1000;
const COLOR_A = '#00e5ff';
const COLOR_B = '#ff6b35';

// ── State per channel ──────────────────────────────────────────────
const state = {
  A: { buf: [], logs: [], total: 0, days: 0.0417 },
  B: { buf: [], logs: [], total: 0, days: 0.0417 }
};

// ── Oscilloscope ───────────────────────────────────────────────────
function setupScope(id) {
  const canvas = document.getElementById(id);
  const ctx    = canvas.getContext('2d');
  function resize() {
    canvas.width  = canvas.offsetWidth  * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  window.addEventListener('resize', resize);
  resize();
  return { canvas, ctx };
}

const scopeA = setupScope('scopeA');
const scopeB = setupScope('scopeB');

function drawScope({ canvas, ctx }, buf, color) {
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  ctx.clearRect(0, 0, W, H);

  const now   = Date.now();
  const start = now - WINDOW_MS;
  const pts   = buf.filter(t => t >= start);
  const PULSE_W_MS = 500;
  const HIGH_Y = H * 0.2, LOW_Y = H * 0.75;
  const tx = t => ((t - start) / WINDOW_MS) * W;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 10;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(0, LOW_Y);

  if (pts.length === 0) {
    ctx.lineTo(W, LOW_Y);
  } else {
    pts.forEach(pt => {
      const px  = tx(pt);
      const px2 = tx(pt + PULSE_W_MS);
      ctx.lineTo(px, LOW_Y);
      ctx.lineTo(px, HIGH_Y);
      ctx.lineTo(Math.min(px2, W), HIGH_Y);
      if (px2 <= W) ctx.lineTo(px2, LOW_Y);
    });
    const last = pts[pts.length - 1];
    if (tx(last + PULSE_W_MS) < W) ctx.lineTo(W, LOW_Y);
  }
  ctx.stroke();

  // Pulse dots
  ctx.shadowBlur = 14;
  ctx.fillStyle  = color;
  pts.forEach(pt => {
    const px = tx(pt);
    if (px >= 0 && px <= W) {
      ctx.beginPath(); ctx.arc(px, HIGH_Y, 3.5, 0, Math.PI*2); ctx.fill();
    }
  });

  ctx.restore();
  ctx.fillStyle = '#4a7085';
  ctx.font = `9px 'Share Tech Mono'`;
  ctx.textAlign = 'center';
  for (let m = 0; m <= 10; m += 2) {
    ctx.fillText(m === 10 ? 'NOW' : `-${10-m}m`, (m/10)*W, H-3);
  }
  ctx.textAlign = 'left';
  ctx.fillText('HIGH', 4, HIGH_Y - 5);
  ctx.fillText('LOW',  4, LOW_Y  - 5);
}

setInterval(() => {
  drawScope(scopeA, state.A.buf, COLOR_A);
  drawScope(scopeB, state.B.buf, COLOR_B);
}, 1000/30);

// ── Bucket table ───────────────────────────────────────────────────
function colorClass(count, max) {
  if (count === 0)         return 'zero';
  if (count >= max * 0.75) return 'high';
  if (count >= max * 0.4)  return 'mid';
  return 'low';
}
function fmtInterval(ms) {
  const s = new Date(ms), e = new Date(ms + 600000);
  const today = new Date().toDateString();
  const date  = s.toDateString() === today ? '' : s.toLocaleDateString([],{month:'short',day:'numeric'}) + ' ';
  return `${date}${s.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} → ${e.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
}

async function loadBuckets(ch) {
  const s     = state[ch];
  const tbId  = ch === 'A' ? 'bucketsA' : 'bucketsB';
  const l10Id = ch === 'A' ? 'aLast10'  : 'bLast10';
  const device = ch === 'A' ? 'INPUT' : 'OUTPUT';

  try {
    const res     = await fetch(`/api/buckets?days=${s.days}&device=${device}`);
    const data    = await res.json();
    const buckets = (data.buckets || []).reverse();
    const max     = Math.max(...buckets.map(b => b.count), 1);
    const tbody   = document.getElementById(tbId);

    if (buckets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-dim);padding:24px;letter-spacing:2px">NO DATA YET</td></tr>`;
      return;
    }

    tbody.innerHTML = buckets.map((b, i) => {
      const pct = Math.round((b.count / max) * 100);
      const cls = colorClass(b.count, max);
      return `<tr>
        <td style="color:var(--text-dim)">${buckets.length - i}</td>
        <td style="color:var(--text-dim);font-size:0.65rem">${fmtInterval(b.bucket_ms)}</td>
        <td><div class="bucket-bar"><div class="bucket-bar-fill" style="width:${pct}%"></div></div></td>
        <td style="text-align:right"><span class="bucket-count ${cls}">${b.count}</span></td>
      </tr>`;
    }).join('');

    if (buckets[0]) document.getElementById(l10Id).textContent = buckets[0].count;
  } catch(e) { console.error(e); }
}

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const ch = tab.dataset.ch;
    document.querySelectorAll(`[data-ch="${ch}"]`).forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state[ch].days = parseFloat(tab.dataset.days);
    loadBuckets(ch);
  });
});

setInterval(() => { loadBuckets('A'); loadBuckets('B'); }, 60000);

// ── Stats ──────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const resA = await fetch('/api/stats?device=INPUT');
    const resB = await fetch('/api/stats?device=OUTPUT');
    const dA   = await resA.json();
    const dB   = await resB.json();
    document.getElementById('aTotalPulses').textContent = dA.total_pulses || 0;
    document.getElementById('bTotalPulses').textContent = dB.total_pulses || 0;
    if (dA.last_ms) document.getElementById('aLastTime').textContent = new Date(dA.last_ms).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if (dB.last_ms) document.getElementById('bLastTime').textContent = new Date(dB.last_ms).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  } catch(e) {}
}

// ── Log ────────────────────────────────────────────────────────────
function addLog(ch, pulse) {
  const s   = state[ch];
  const t   = new Date(pulse.server_time || Date.now());
  const ts  = t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  s.logs.unshift({ ts, num: pulse.pulse_number || '?' });
  if (s.logs.length > 60) s.logs.pop();

  const wrap = document.getElementById(ch === 'A' ? 'logA' : 'logB');
  wrap.innerHTML = s.logs.map(l =>
    `<div class="log-line"><span class="log-time">${l.ts}</span><span class="log-pulse">▲ PULSE #${l.num}</span></div>`
  ).join('');
}

// ── WebSocket ──────────────────────────────────────────────────────
const connDot   = document.getElementById('connDot');
const connLabel = document.getElementById('connLabel');
let ws, reconnTimer;

function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    connDot.classList.add('live');
    connLabel.textContent = 'LIVE';
    clearTimeout(reconnTimer);
  };

  ws.onclose = ws.onerror = () => {
    connDot.classList.remove('live');
    connLabel.textContent = 'RECONNECTING...';
    reconnTimer = setTimeout(connect, 3000);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'HISTORY') {
      msg.pulses.forEach(p => {
        const ch = p.device_id === 'INPUT' ? 'A' : 'B';
        state[ch].buf.push(p.server_time);
      });
      loadStats();
    }

    if (msg.type === 'PULSE') {
      const p  = msg.pulse;
      const ch = p.device_id === 'INPUT' ? 'A' : 'B';
      const s  = state[ch];

      // Add to waveform buffer
      s.buf.push(p.server_time);
      const cutoff = Date.now() - WINDOW_MS;
      while (s.buf.length > 0 && s.buf[0] < cutoff) s.buf.shift();

      // Update last pulse time
      const d = new Date(p.server_time);
      const timeStr = d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      document.getElementById(ch === 'A' ? 'aLastTime' : 'bLastTime').textContent = timeStr;

      // Increment total
      s.total++;
      loadStats();

      addLog(ch, p);
    }
  };
}

// ── Init ───────────────────────────────────────────────────────────
loadStats();
loadBuckets('A');
loadBuckets('B');
connect();
</script>
</body>
</html>
