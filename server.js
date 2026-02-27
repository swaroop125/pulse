/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ESP32 Pulse Monitor — Backend Server                    ║
 * ║  - Receives every pulse via POST /api/pulse              ║
 * ║  - Stores in SQLite (5-day rolling window)               ║
 * ║  - Broadcasts to dashboard via WebSocket in real-time    ║
 * ║  - Serves pre-aggregated 10-min counts via REST          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const express    = require('express');
const http       = require('http');
const { WebSocketServer } = require('ws');
const Database   = require('better-sqlite3');
const cors       = require('cors');
const path       = require('path');

// ─── INIT ─────────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/ws' });
const PORT   = process.env.PORT || 3000;

// Render Disk: set DB_PATH env var to /data/pulse.db for persistence
const DB_PATH = process.env.DB_PATH || './pulse.db';
const db = new Database(DB_PATH);

// ─── DATABASE SCHEMA ─────────────────────────────────────────────────────────
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous  = NORMAL;

  CREATE TABLE IF NOT EXISTS pulses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id    TEXT    NOT NULL DEFAULT 'ESP32-001',
    pulse_number INTEGER,
    uptime_ms    INTEGER,
    server_time  INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );

  -- Auto-purge records older than 5 days on every insert
  CREATE TRIGGER IF NOT EXISTS purge_old
  AFTER INSERT ON pulses
  BEGIN
    DELETE FROM pulses
    WHERE server_time < (strftime('%s','now') - 432000) * 1000;
  END;

  CREATE INDEX IF NOT EXISTS idx_server_time ON pulses(server_time);
`);

// Prepared statements
const stmtInsert = db.prepare(`
  INSERT INTO pulses (device_id, pulse_number, uptime_ms)
  VALUES (@device_id, @pulse_number, @uptime_ms)
`);

// Recent raw pulses for waveform (last 10 minutes = last 60 pulses at 0.1Hz)
const stmtRecent = db.prepare(`
  SELECT id, device_id, pulse_number, uptime_ms, server_time
  FROM pulses
  WHERE server_time >= ?
  ORDER BY server_time ASC
`);

// 10-minute bucketed counts for bar chart (last 5 days)
const stmtBuckets = db.prepare(`
  SELECT
    (server_time / 600000) * 600000   AS bucket_ms,
    COUNT(*)                           AS count,
    MIN(server_time)                   AS first_pulse_ms,
    MAX(server_time)                   AS last_pulse_ms
  FROM pulses
  WHERE server_time >= ?
  GROUP BY bucket_ms
  ORDER BY bucket_ms ASC
`);

const stmtStats = db.prepare(`
  SELECT
    COUNT(*)           AS total_pulses,
    MIN(server_time)   AS first_ms,
    MAX(server_time)   AS last_ms
  FROM pulses
  WHERE server_time >= (strftime('%s','now') - 432000) * 1000
`);

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);

  // Send last 10 minutes of pulses on connect for waveform history
  const since10m = Date.now() - 10 * 60 * 1000;
  const recent   = stmtRecent.all(since10m);
  ws.send(JSON.stringify({ type: 'HISTORY', pulses: recent }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  }
}

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── API ROUTES ──────────────────────────────────────────────────────────────

/**
 * POST /api/pulse
 * ESP32 calls this on EVERY pulse
 * Body: { device_id, pulse_number, uptime_ms }
 */
app.post('/api/pulse', (req, res) => {
  const {
    device_id    = 'ESP32-001',
    pulse_number = null,
    uptime_ms    = null
  } = req.body;

  try {
    const result = stmtInsert.run({ device_id, pulse_number, uptime_ms });
    const record = {
      id:           result.lastInsertRowid,
      device_id,
      pulse_number,
      uptime_ms,
      server_time:  Date.now()
    };

    // Broadcast new pulse to all dashboard clients instantly
    broadcast({ type: 'PULSE', pulse: record });

    console.log(`[PULSE] #${pulse_number} from ${device_id} | DB id ${result.lastInsertRowid}`);

    return res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('[ERROR] Insert failed:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/buckets?days=5
 * Returns 10-minute aggregated pulse counts
 */
app.get('/api/buckets', (req, res) => {
  const days  = Math.min(parseFloat(req.query.days) || 5, 5);
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const rows  = stmtBuckets.all(since);
  res.json({ buckets: rows });
});

/**
 * GET /api/recent?minutes=10
 * Returns raw pulses from the last N minutes (for waveform)
 */
app.get('/api/recent', (req, res) => {
  const minutes = Math.min(parseInt(req.query.minutes) || 10, 60);
  const since   = Date.now() - minutes * 60 * 1000;
  const pulses  = stmtRecent.all(since);
  res.json({ pulses });
});

/**
 * GET /api/stats
 * Summary statistics
 */
app.get('/api/stats', (req, res) => {
  const stats = stmtStats.get();
  res.json(stats);
});

/**
 * GET /health
 * Render health check
 */
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Fallback — serve dashboard for any unknown route
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  Pulse Monitor Server running         ║`);
  console.log(`║  http://localhost:${PORT}                ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  db.close();
  server.close();
});
