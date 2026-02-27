# ESP32 Pulse Monitor

Real-time pulse waveform dashboard for ESP32 — shows live oscilloscope waveform + 10-minute aggregated counts.

## Architecture

```
ESP32 (GPIO 2, 0.1Hz)
  └─ HTTP POST every pulse ──► Node.js + Express + SQLite
                                   └─ WebSocket ──► Browser Dashboard
                                                        ├─ Oscilloscope waveform
                                                        └─ 10-min bar chart
```

## Project Structure

```
esp32-pulse-monitor/
├── esp32_pulse_sender.ino   # Arduino sketch for ESP32
├── server.js                # Node.js backend
├── package.json
├── render.yaml              # Render deployment config
└── public/
    └── index.html           # Dashboard
```

---

## 1. ESP32 Setup

### Hardware
- Connect your 0.1Hz pulse signal to **GPIO 2**
- If signal is active-HIGH from sensor: use `INPUT_PULLUP` (default)
- If signal is active-LOW: change `RISING` to `FALLING` in `attachInterrupt()`

### Software
1. Install **Arduino IDE** with ESP32 board support
2. Install libraries via Library Manager:
   - `ArduinoJson` by Benoit Blanchon
3. Open `esp32_pulse_sender.ino`
4. Edit these lines:
   ```cpp
   const char* WIFI_SSID  = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* SERVER_URL = "https://your-app-name.onrender.com/api/pulse";
   ```
5. Select board: `ESP32 Dev Module` → Upload

---

## 2. Local Development

```bash
npm install
npm run dev        # uses nodemon for auto-restart
# Open http://localhost:3000
```

Simulate a pulse from terminal:
```bash
curl -X POST http://localhost:3000/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"device_id":"ESP32-001","pulse_number":1,"uptime_ms":1000}'
```

---

## 3. Deploy to Render

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/esp32-pulse-monitor.git
git push -u origin main
```

### Step 2 — Create Render Web Service
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` — click **Apply**
4. Wait for build (~2 min)
5. Your URL: `https://esp32-pulse-monitor.onrender.com`

### Step 3 — Update ESP32
Replace `SERVER_URL` in the `.ino` file with your Render URL, re-upload to ESP32.

---

## 4. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pulse` | ESP32 sends each pulse here |
| `GET` | `/api/recent?minutes=10` | Raw pulses for waveform |
| `GET` | `/api/buckets?days=1` | 10-min aggregated counts |
| `GET` | `/api/stats` | Summary statistics |
| `GET` | `/health` | Health check |
| `WS` | `/ws` | WebSocket for real-time push |

### POST /api/pulse Body
```json
{
  "device_id":    "ESP32-001",
  "pulse_number": 42,
  "uptime_ms":    420000
}
```

---

## 5. Dashboard Features

- **Live Waveform** — Oscilloscope view, last 10 minutes, auto-scrolling
- **10-Min Bar Chart** — Aggregated pulse counts, switchable: 1H / 6H / 1D / 5D
- **Pulse Log** — Real-time event stream with timestamps
- **Stats** — Total pulses (5d), last 10-min count, last pulse time
- **WebSocket** — Sub-second latency from ESP32 to browser

---

## 6. Render Free Tier Notes

- Free tier spins down after 15 min inactivity → first pulse after sleep may be slow
- Upgrade to **Starter ($7/mo)** to prevent spin-down
- Persistent disk is included in the `render.yaml` config to preserve SQLite data across deploys

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| ESP32 HTTP timeout | Check WiFi signal, increase `http.setTimeout()` |
| Waveform not showing | Verify WebSocket connects (green dot in header) |
| Pulses missing after deploy | Check DB_PATH env var points to `/data/pulse.db` |
| Render deploy fails | Run `npm install` locally first to verify package.json |
