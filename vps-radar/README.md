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

```bash
# Check health:
curl https://frog.muazaoski.online/api/radar/health

# Check live leaderboard:
curl https://frog.muazaoski.online/api/radar/leaderboard
```
