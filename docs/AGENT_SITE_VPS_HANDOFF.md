# muazaoski.site and VPS agent handoff

Verified read-only on **7 November 2026 (MYT)** against this repository, DNS/HTTP, and the VPS. Treat the commands below as a map, then inspect current state before changing production. No password, private key, or API token belongs in this file.

## What lives where

| Component | Public address | Source / deployment | Current runtime |
| --- | --- | --- | --- |
| Main portfolio | `https://www.muazaoski.site` | This repository (`muazaoski.online` on GitHub); `npm run build` produces `dist/` | **Netlify**, not the VPS. Apex `muazaoski.site` redirects to `www`. |
| Unfrog game and shared gateway | `https://frog.muazaoski.site` | Separate `muazaoski/froggame` repository at `/opt/apps/froggame` | Docker Compose: `froggame` and the main `caddy` container |
| Visitor radar, room, guestbook API | `https://frog.muazaoski.site/api/radar/*` | This repository's `vps-radar/`, copied to `/opt/apps/radar` | Docker Compose: `muazaoski-radar`, attached to `froggame_web` |
| Size chart frontend | `https://chart.muazaoski.site` | Separate `muazaoski/SizeChartGenerator` repository at `/opt/apps/ocr/SizeChartGenerator` | Docker Compose: `size-chart-generator`, host port 3005 |
| OCR API | `https://ocr.muazaoski.site` | `/opt/apps/ocr` | Docker Compose: `ocr-api`, host port 8000; **unhealthy at inspection time** |

The same VPS also hosts unrelated applications (DownloadJe, workout, RPG, monitoring). Scope Docker and Caddy commands to the intended service. The main website is a static, multi-page Vite build; changing files in this repository does **not** update the frog game or other VPS source automatically.

## Connect to the VPS

From PowerShell on a machine with an authorized SSH key:

```powershell
ssh -o BatchMode=yes debian@51.79.161.63
```

This command worked from the owner's workstation on the verification date. It requires that workstation's existing SSH authorization; this repository does not contain credentials. On the server, `debian` has working `sudo` access:

```bash
sudo -i
hostname
docker compose version
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
```

Use `docker compose` (Compose v2). Read-only starting checks:

```bash
sudo docker ps
sudo docker network ls
sudo ls -la /opt/apps/froggame /opt/apps/radar
sudo git -C /opt/apps/froggame status --short --branch
```

Do not print or copy `.env`, key files, database contents, or logs containing user data into a chat or commit.

## Main portfolio: build and deploy

Local root: `D:\Projects\muazaoski.online`. Git remote: `https://github.com/muazaoski/muazaoski.online.git`; current branch at inspection: `master`.

- `package.json`: Vite 7, `npm run dev`, `npm run build`, `npm run preview`.
- `vite.config.js`: three HTML entries: `index.html`, `portfolio.html`, `resume.html`. Dev/preview also rewrite clean `/portfolio` and `/resume` URLs.
- `netlify.toml`: Netlify runs `npm run build`, publishes `dist`, and defines redirects, CSP, and cache/security headers.
- `.gitignore` ignores `dist/`; Netlify builds from source. Do not upload this site's `dist/` to `/opt/apps/froggame`.

Safe local sequence:

```powershell
cd D:\Projects\muazaoski.online
git status --short --branch
npm ci
npm run build
npm run preview
```

Check the actual pages, clean URLs, browser console, and changed assets. Review `git diff` and commit only intended files. Publishing happens through the Netlify site, not Docker. This repo contains the Netlify build configuration, and HTTP/DNS confirm Netlify serves production; **the exact Netlify account, site ID, and automatic deploy trigger were not verified here**. Before publishing, inspect the connected Netlify site's deploy settings/history. If Git deploys are enabled for `master`, push the reviewed commit and verify its Netlify deploy; otherwise use that site's established deployment method. Check `https://www.muazaoski.site/`, `/portfolio`, and `/resume` afterward. Never assume a successful Git push means the live site changed.

## VPS architecture

`/opt/apps/froggame/docker-compose.yml` defines the game, main Caddy gateway, and a DownloadJe API service. Caddy owns public ports **80/443**. Its active config is bind-mounted from **`/opt/apps/froggame/Caddyfile`** into `/etc/caddy/Caddyfile` in the `caddy` container. Do not edit `/etc/caddy/Caddyfile` on the host and expect it to work.

The active Caddyfile routes:

- `frog.muazaoski.site` and `.online` to `froggame:3000`; `/api/radar/*` to `muazaoski-radar:3050` on shared Docker network `froggame_web`.
- `chart.muazaoski.site` and `.online` to VPS port 3005.
- `ocr.muazaoski.site` and `.online` to VPS port 8000, with `/local/*` routed to a workstation tunnel at port 18091 when origin is allowed.
- Workout, RPG, DownloadJe, and older `.online` domains too. A gateway edit can affect all of them.

For a scoped Caddy change, first back up the active Caddyfile, edit only the needed block, then validate and reload without taking down unrelated containers:

```bash
cd /opt/apps/froggame
sudo cp -a Caddyfile "Caddyfile.bak-$(date +%Y%m%d-%H%M%S)"
sudo docker exec caddy caddy validate --config /etc/caddy/Caddyfile
sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile
sudo docker logs --tail 100 caddy
```

The validation command reads the current bind-mounted file; run it **after** the edit. If validation fails, restore the backup before reloading. For Dockerized Caddy, `localhost` means the Caddy container; use a service name on a shared network or a verified reachable host address.

## Frog game: build and deploy

The frog game is a **separate repo** and its Dockerfile does **not** run Vite. It copies an already built `dist/`, `server/`, and `public/`, then starts `node server/index.js` on port 3000. The Compose service bind-mounts persistent `data/`, selected `server_data/*.json`, and `.env`. Preserve these. The Caddy Compose service and DownloadJe are defined in the same file, so avoid `docker compose down` or an unqualified `docker compose up --build` for a game-only change.

As of verification, `/opt/apps/froggame` has many modified and untracked live source/build files. Some are newer than the Git checkout. **Do not run `git reset --hard`, `git clean`, or blindly `git pull` there.** First compare the exact files with the owning repo and record/backup any production-only changes. The old `/opt/apps/froggame/DEPLOY.md` suggests a hard reset and broad restart; that recipe is unsafe for the observed state.

For a reviewed, scoped game change, build the matching frog source with `npm ci && npm run build` in an isolated local checkout. Back up the exact production files and relevant data, transfer only intended source and build artifacts, then on the VPS:

```bash
cd /opt/apps/froggame
sudo docker compose build froggame
sudo docker compose up -d --no-deps froggame
sudo docker compose ps froggame
sudo docker compose logs --tail 100 froggame
```

The Dockerfile uses `node:20-slim` and `npm ci --only=production`; it expects `dist/` to exist before the image build. Verify the home page, current hashed JS/CSS assets, relevant WebSocket/game behavior, and persistent user data after a change. Keep a known previous image or backup for rollback.

## Radar API: build and deploy

This repo owns `vps-radar/`. Its `Dockerfile` copies `server.mjs`, `room-presence.mjs`, `guestbook.mjs`, and `avatar-options.mjs` into a Node 20 Alpine image. The Compose file builds this directory, sets port 3050, mounts `./data:/app/data`, and joins the **external** `froggame_web` network. The public API is routed by the main Caddy container, not exposed as a host port.

Run local tests before sending code:

```powershell
cd D:\Projects\muazaoski.online
node --test vps-radar/*.test.mjs
```

The `data/` directory on the VPS contains persistent statistics and `guestbook.json`. Back it up before backend changes, preserve its ownership, and **never overwrite it with a local copy**. The VPS `/opt/apps/radar` is a copied deployment directory, not a Git checkout. Review the diff and compare the VPS files first; do not overwrite production-only changes. For a change that truly includes the whole radar service, a scoped transfer from PowerShell is:

```powershell
ssh debian@51.79.161.63 'sudo tar -C /opt/apps/radar -czf /opt/apps/radar/backups/radar-data-$(date +%Y%m%d-%H%M%S).tgz data'
scp vps-radar/server.mjs vps-radar/room-presence.mjs vps-radar/guestbook.mjs vps-radar/avatar-options.mjs vps-radar/Dockerfile vps-radar/docker-compose.yml debian@51.79.161.63:/opt/apps/radar/
```

Record the backup filename. For a smaller patch, copy only the changed files plus any Dockerfile changes needed to include them. Compare transferred file hashes if possible. Then on the VPS:

```bash
cd /opt/apps/radar
sudo docker compose build radar
sudo docker compose up -d --no-deps radar
sudo docker compose ps radar
sudo docker compose logs --tail 100 radar
curl -fsS https://frog.muazaoski.site/api/radar/health
```

Avoid POST smoke tests against production guestbook/cheer endpoints unless a real write is intended. Check the existing API behavior with read-only GETs. A radar restart clears in-memory room presence, while disk-backed stats and guestbook should survive.

## Size chart and OCR

The chart generator is managed from its **separate** repository. Its Compose file maps host `3005` to Caddy port 80 in the chart container. Its multi-stage Dockerfile builds React/Vite with `node:22-alpine` and serves `dist` with `caddy:2-alpine`; `Caddyfile.container` handles SPA fallback. See `SizeChartGenerator/DEPLOYMENT.md` in this repo for fuller architecture, but verify it against the live VPS first because parts are dated.

The OCR API lives under `/opt/apps/ocr`. On 7 November 2026 its `ocr-api` container reported **unhealthy**, although `https://chart.muazaoski.site/` returned 200. Before changing OCR, inspect `sudo docker logs --tail 100 ocr-api`, its Compose file and healthcheck, and the workstation tunnel state. Do not claim end-to-end OCR is healthy from the chart homepage alone.

## Operational rules and verification

1. Identify the owning repository/service and inspect `git status`, Compose config, bind mounts, and current container before editing.
2. Keep changes surgical. Back up exact files and persistent data before replacing them; record the backup path and previous image ID.
3. Build and test locally, transfer only intended artifacts, and rebuild only the affected Compose service.
4. Compare deployed file hashes or image identity with the tested build. Check container status/logs and the public endpoint. For game/client work, check the exact hashed asset the page references.
5. If a check fails, restore the backup or prior image, restart only the affected service, and verify the public endpoint again.

Useful read-only checks:

```bash
sudo docker inspect froggame --format '{{.Image}}'
sudo docker inspect muazaoski-radar --format '{{.Image}}'
sudo docker compose -f /opt/apps/froggame/docker-compose.yml ps
sudo docker compose -f /opt/apps/radar/docker-compose.yml ps
curl -I https://frog.muazaoski.site/
curl -I https://chart.muazaoski.site/
```

The website, game, and backend can be deployed independently. Record which one was actually changed and tested; do not report a local build as a live deployment.
