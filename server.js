/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ESP32 Pulse Monitor — Backend Server                    ║
 * ║  - Receives every pulse via POST /api/pulse              ║
 * ║  - Stores in SQLite (5-day rolling window)               ║
 * ║  - Broadcasts to dashboard via WebSocket in real-time    ║
 * ║  - Serves pre-aggregated 10-min counts via REST          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const express  = require('express');
const http     = require('http');
const { WebSocketServer } = require('ws');
const sqlite3  = require('sqlite3').verbose();
const cors     = require('cors');
const path     = require('path');

// ─── INIT ─────────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/ws' });
const PORT   = process.env.PORT || 3000;

// Local temp storage — resets on redeploy but fine for 5-day runs
const DB_PATH = './pulse.db';
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[DB] Failed to open:', err.message);
  } else {
    console.log('[DB] Connected to SQLite at', DB_PATH);
    initDB();
  }
});

// ─── DATABASE SETUP ───────────────────────────────────────────────────────────
function initDB() {
  db.serialize(() => {
    db.run(`PRAGMA journal_mode = WAL`);
    db.run(`PRAGMA synchronous  = NORMAL`);

    db.run(`
      CREATE TABLE IF NOT EXISTS pulses (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id    TEXT    NOT NULL DEFAULT 'ESP32-001',
        pulse_number INTEGER,
        uptime_ms    INTEGER,
        server_time  INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') * 1000 AS INTEGER))
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_server_time ON pulses(server_time)`);

    console.log('[DB] Schema ready');
  });

  // Auto-purge old records every hour
  setInterval(() => {
    const cutoff = Date.now() - (5 * 24 * 60 * 60 * 1000);
    db.run(`DELETE FROM pulses WHERE server_time < ?`, [cutoff], function(err) {
      if (!err && this.changes > 0) {
        console.log(`[DB] Purged ${this.changes} old records`);
      }
    });
  }, 60 * 60 * 1000);
}

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);

  // Send last 10 minutes of pulses on connect
  const since10m = Date.now() - 10 * 60 * 1000;
  db.all(
    `SELECT id, device_id, pulse_number, uptime_ms, server_time
     FROM pulses WHERE server_time >= ? ORDER BY server_time ASC`,
    [since10m],
    (err, rows) => {
      if (!err && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'HISTORY', pulses: rows || [] }));
      }
    }
  );

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
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

  const server_time = Date.now();

  db.run(
    `INSERT INTO pulses (device_id, pulse_number, uptime_ms, server_time)
     VALUES (?, ?, ?, ?)`,
    [device_id, pulse_number, uptime_ms, server_time],
    function(err) {
      if (err) {
        console.error('[ERROR] Insert failed:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      const record = {
        id: this.lastID,
        device_id,
        pulse_number,
        uptime_ms,
        server_time
      };

      // Broadcast to all dashboard clients instantly
      broadcast({ type: 'PULSE', pulse: record });

      console.log(`[PULSE] #${pulse_number} from ${device_id} | DB id ${this.lastID}`);
      return res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

/**
 * GET /api/buckets?days=5
 * Returns 10-minute aggregated pulse counts
 */
app.get('/api/buckets', (req, res) => {
  const days  = Math.min(parseFloat(req.query.days) || 5, 5);
  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  db.all(
    `SELECT
       (server_time / 600000) * 600000 AS bucket_ms,
       COUNT(*)                         AS count,
       MIN(server_time)                 AS first_pulse_ms,
       MAX(server_time)                 AS last_pulse_ms
     FROM pulses
     WHERE server_time >= ?
     GROUP BY bucket_ms
     ORDER BY bucket_ms ASC`,
    [since],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ buckets: rows || [] });
    }
  );
});

/**
 * GET /api/recent?minutes=10
 * Returns raw pulses for waveform
 */
app.get('/api/recent', (req, res) => {
  const minutes = Math.min(parseInt(req.query.minutes) || 10, 60);
  const since   = Date.now() - minutes * 60 * 1000;

  db.all(
    `SELECT id, device_id, pulse_number, uptime_ms, server_time
     FROM pulses WHERE server_time >= ? ORDER BY server_time ASC`,
    [since],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ pulses: rows || [] });
    }
  );
});

/**
 * GET /api/stats
 * Summary statistics
 */
app.get('/api/stats', (req, res) => {
  const since = Date.now() - 5 * 24 * 60 * 60 * 1000;

  db.get(
    `SELECT
       COUNT(*)         AS total_pulses,
       MIN(server_time) AS first_ms,
       MAX(server_time) AS last_ms
     FROM pulses WHERE server_time >= ?`,
    [since],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || { total_pulses: 0, first_ms: null, last_ms: null });
    }
  );
});

/**
 * GET /health
 * Render health check
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Fallback — serve dashboard
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
