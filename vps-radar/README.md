# 📡 Live Visitor Radar Telemetry Backend (VPS)

Zero-dependency Node.js telemetry server for tracking 100% real global visits per country and community Teh Tarik cheers on `muazaoski.online`.

---

## 🚀 Quick Setup on your VPS (`51.79.161.63`)

### Option A: Direct with PM2 or Node (Recommended, fastest)

1. **Copy `vps-radar/` folder to VPS**:
   ```bash
   scp -r vps-radar root@51.79.161.63:/opt/apps/radar
   ```

2. **SSH into your VPS**:
   ```bash
   ssh root@51.79.161.63
   cd /opt/apps/radar
   ```

3. **Start the server with PM2**:
   ```bash
   pm2 start server.mjs --name muazaoski-radar
   pm2 save
   ```
   *(Or run directly: `node server.mjs &`)*

---

### Option B: Run with Docker Compose

```bash
cd /opt/apps/radar
docker compose up -d --build
```

---

## 🌐 Route Traffic in Caddy

Add this snippet inside your Caddyfile (e.g. inside `frog.muazaoski.online` or `muazaoski.online`):

```caddy
handle /api/radar/* {
    reverse_proxy 127.0.0.1:3050
}
```

Then reload Caddy:
```bash
caddy reload
# or
docker compose exec caddy caddy reload
```

---

## 🧪 Testing the API

Recent Teh Tarik activity is stored in the existing database, with no fabricated starter events.
The latest 30 country groups are retained; clicks from the same country within five minutes
of its last click increment that group. `POST /api/radar/cheer` accepts `{ "code": "SG" }`
and still supports older clients sending no body. `GET /api/radar/cheers` returns the total
and recent `cheerEvents` (country, count and last-click timestamp, never visitor IPs).
Deploy/rebuild this backend as well as the frontend to enable the shared activity log;
the old API does not contain historical click locations.

Run the isolated integration test locally with `node --test vps-radar/server.test.mjs`.

The little room uses `POST /api/radar/room` with an anonymous per-page UUID and a
15-second heartbeat. `GET /api/radar/room` lists active sessions; `POST /api/radar/room/leave`
removes a departing session. Sessions expire after 45 seconds and are kept in memory
only (maximum 200), without names, IPs or country information. Foreground tabs are
counted as sessions, not guaranteed unique people. Restarting clears the room, not the stats.
Run both checks with `node --test vps-radar/server.test.mjs vps-radar/room-presence.test.mjs`.

```bash
# Check health:
curl https://frog.muazaoski.online/api/radar/health

# Check live leaderboard:
curl https://frog.muazaoski.online/api/radar/leaderboard
```
