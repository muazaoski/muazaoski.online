/**
 * VISITOR RADAR API SERVER (VPS)
 * Lightweight, zero-dependency Node.js telemetry microservice.
 * Stores real country visits and community cheers on disk.
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createRoomPresence } from './room-presence.mjs'
import { createGuestbook } from './guestbook.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3050
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'radar-stats.json')
const roomPresence = createRoomPresence()

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Country metadata & initial starter counts
const COUNTRY_NAMES = {
  MY: 'Malaysia',
  SG: 'Singapore',
  US: 'United States',
  ID: 'Indonesia',
  GB: 'United Kingdom',
  JP: 'Japan',
  AU: 'Australia',
  DE: 'Germany',
  CA: 'Canada',
  FR: 'France',
  NL: 'Netherlands',
  KR: 'South Korea',
  IN: 'India',
  PH: 'Philippines',
  VN: 'Vietnam',
  TH: 'Thailand'
}

const COUNTRY_FLAGS = {
  MY: '🇲🇾',
  SG: '🇸🇬',
  US: '🇺🇸',
  ID: '🇮🇩',
  GB: '🇬🇧',
  JP: '🇯🇵',
  AU: '🇦🇺',
  DE: '🇩🇪',
  CA: '🇨🇦',
  FR: '🇫🇷',
  NL: '🇳🇱',
  KR: '🇰🇷',
  IN: '🇮🇳',
  PH: '🇵🇭',
  VN: '🇻🇳',
  TH: '🇹🇭'
}

const COUNTRY_COMMENTS = {
  MY: 'Home turf supremacy • Late-night teh tarik gang',
  SG: 'Exchange rate tourists & busy recruiters',
  US: 'Insomnia gang & accidental Reddit clicks',
  ID: 'The supportive neighbours • Salam serumpun',
  GB: 'Looking for motion design & a warm cuppa',
  JP: 'Tokyo arcade & aesthetic visual scouts',
  AU: 'Upside-down flat white design connoisseurs',
  DE: 'Precision pixel telemetry inspection',
  CA: 'Maple syrup motion reel enjoyers',
  DEFAULT: 'Special scout visitor from across the globe!'
}

// In-memory cache loaded from disk
let store = {
  totalVisits: 0,
  cheers: 1842,
  cheerEvents: [],
  countries: {},
  lastUpdated: new Date().toISOString()
}

// IP Deduplication Cache (IP hash -> timestamp) to prevent F5 spam
// Keeps visits clean: 1 visit recorded per visitor IP every 2 hours
const recentVisitors = new Map()
const guestbook = createGuestbook(path.join(DATA_DIR, 'guestbook.json'))
const VISITOR_COOLDOWN_MS = 2 * 60 * 60 * 1000 // 2 hours

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      store = { ...store, ...parsed }
      console.log(`[RADAR] Loaded stats from disk. Total visits: ${store.totalVisits}, Cheers: ${store.cheers}`)
      return
    }
  } catch (err) {
    console.error('[RADAR] Error reading DB file, initializing clean stats:', err.message)
  }

  // Initial seed if file is brand new
  store = {
    totalVisits: 2638,
    cheers: 1842,
    countries: {
      MY: { count: 1420, country: 'Malaysia', flag: '🇲🇾' },
      SG: { count: 512, country: 'Singapore', flag: '🇸🇬' },
      US: { count: 348, country: 'United States', flag: '🇺🇸' },
      ID: { count: 215, country: 'Indonesia', flag: '🇮🇩' },
      GB: { count: 143, country: 'United Kingdom', flag: '🇬🇧' }
    },
    lastUpdated: new Date().toISOString()
  }
  saveDatabase()
}

function saveDatabase() {
  try {
    store.lastUpdated = new Date().toISOString()
    const tempFile = `${DB_FILE}.tmp`
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8')
    fs.renameSync(tempFile, DB_FILE)
  } catch (err) {
    console.error('[RADAR] Failed to save DB to disk:', err.message)
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers['x-real-ip'] || req.socket.remoteAddress || '127.0.0.1'
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + '-muazaoski-radar-salt').digest('hex').slice(0, 16)
}

function getLeaderboard() {
  const list = Object.entries(store.countries).map(([code, item]) => {
    return {
      code,
      country: item.country || COUNTRY_NAMES[code] || code,
      flag: item.flag || COUNTRY_FLAGS[code] || '🌍',
      count: item.count || 0,
      comment: COUNTRY_COMMENTS[code] || COUNTRY_COMMENTS.DEFAULT
    }
  })

  // Sort descending by count
  list.sort((a, b) => b.count - a.count)
  return list.slice(0, 5)
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Cache-Control': 'no-store'
  })
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    })
    return res.end()
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  if (req.method === 'GET' && pathname === '/api/radar/guestbook') {
    return sendJson(res, 200, { success: true, entries: guestbook.list() })
  }
  if (req.method === 'POST' && pathname === '/api/radar/guestbook') {
    let body = ''
    req.on('data', chunk => { body += chunk; if (Buffer.byteLength(body) > 8192) req.destroy() })
    req.on('end', () => {
      let payload
      try { payload = JSON.parse(body) } catch (_) { return sendJson(res, 400, { success: false, error: 'Invalid submission.' }) }
      // Reuse the site's country detection; it is approximate, not identity verification.
      const code = typeof payload?.code === 'string' ? payload.code.toUpperCase() : 'ZZ'
      const result = guestbook.post(payload, hashIp(getClientIp(req)), code)
      sendJson(res, result.status, { success: result.status === 201, entry: result.entry, error: result.error })
    })
    return
  }

  // Health check
  if (pathname === '/health' || pathname === '/api/radar/health') {
    return sendJson(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })
  }

  // Anonymous live-room presence (memory only).
  if (req.method === 'GET' && pathname === '/api/radar/room') {
    return sendJson(res, 200, { success: true, visitors: roomPresence.snapshot() })
  }
  if (req.method === 'POST' && ['/api/radar/room', '/api/radar/room/leave'].includes(pathname)) {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 1024) req.destroy()
    })
    req.on('end', () => {
      let payload
      try { payload = JSON.parse(body) } catch (_) { return sendJson(res, 400, { success: false }) }
      if (pathname.endsWith('/leave')) {
        roomPresence.leave(payload?.id)
      } else if (!roomPresence.heartbeat(payload?.id)) {
        return sendJson(res, 400, { success: false })
      }
      return sendJson(res, 200, { success: true, visitors: roomPresence.snapshot() })
    })
    return
  }

  // GET Leaderboard: Return Top 5 and Totals
  if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/api/radar/leaderboard' || pathname === '/api/radar')) {
    return sendJson(res, 200, {
      success: true,
      leaderboard: getLeaderboard(),
      totalVisits: store.totalVisits,
      cheers: store.cheers,
      cheerEvents: store.cheerEvents || [],
      lastUpdated: store.lastUpdated
    })
  }

  // POST Cheer: Send Teh Tarik
  if (req.method === 'GET' && pathname === '/api/radar/cheers') {
    return sendJson(res, 200, { success: true, cheers: store.cheers, cheerEvents: store.cheerEvents || [] })
  }
  if (req.method === 'POST' && pathname === '/api/radar/cheer') {
    let bodyText = ''
    req.on('data', chunk => {
      bodyText += chunk
      if (bodyText.length > 4096) req.destroy()
    })
    req.on('end', () => {
      let payload = {}
      try { payload = JSON.parse(bodyText || '{}') || {} } catch (_) {}
      const requestedCode = String(payload.code || '').toUpperCase()
      const code = /^[A-Z]{2}$/.test(requestedCode) ? requestedCode : 'ZZ'
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
      const country = /^[A-Z]{2}$/.test(code) && code !== 'ZZ'
        ? (code === 'US' ? 'USA' : regionNames.of(code)) : 'Unknown location'
      const now = Date.now()
      const events = Array.isArray(store.cheerEvents) ? store.cheerEvents : []
      const existing = events.find(event => event.code === code && now - event.updatedAt < 5 * 60 * 1000)
      if (existing) {
        existing.count += 1
        existing.updatedAt = now
        events.splice(events.indexOf(existing), 1)
        events.unshift(existing)
      } else {
        events.unshift({ code, country, count: 1, updatedAt: now })
      }
      store.cheerEvents = events.slice(0, 30)
      store.cheers = (store.cheers || 0) + 1
      saveDatabase()
      return sendJson(res, 200, { success: true, cheers: store.cheers, cheerEvents: store.cheerEvents })
    })
    return
  }

  // POST Visit: Record Real Visitor Location
  if (req.method === 'POST' && pathname === '/api/radar/visit') {
    let bodyText = ''
    req.on('data', chunk => {
      bodyText += chunk
      if (bodyText.length > 1e5) req.destroy() // Guard against large payloads
    })

    req.on('end', () => {
      let payload = {}
      try {
        if (bodyText) payload = JSON.parse(bodyText)
      } catch (_) {}

      const ip = getClientIp(req)
      const ipHash = hashIp(ip)
      const now = Date.now()

      // Rate limiting / deduplication check
      const lastSeen = recentVisitors.get(ipHash)
      const isNewSession = !lastSeen || (now - lastSeen > VISITOR_COOLDOWN_MS)

      let code = (payload.code || 'MY').toUpperCase().slice(0, 3)
      let country = payload.country || COUNTRY_NAMES[code] || 'Malaysia'
      let flag = payload.flag || COUNTRY_FLAGS[code] || '🌍'

      if (isNewSession) {
        recentVisitors.set(ipHash, now)
        store.totalVisits = (store.totalVisits || 0) + 1

        if (!store.countries[code]) {
          store.countries[code] = { count: 0, country, flag }
        }
        store.countries[code].count = (store.countries[code].count || 0) + 1
        store.countries[code].country = country
        store.countries[code].flag = flag

        saveDatabase()
        console.log(`[RADAR] +1 Real visit recorded from ${country} (${code}). Total: ${store.totalVisits}`)
      } else {
        console.log(`[RADAR] Returning visitor from ${country} (${code}) within cooldown. Real stats returned.`)
      }

      // Cleanup old IP hashes from memory periodically
      if (recentVisitors.size > 10000) {
        for (const [key, timestamp] of recentVisitors.entries()) {
          if (now - timestamp > VISITOR_COOLDOWN_MS) recentVisitors.delete(key)
        }
      }

      return sendJson(res, 200, {
        success: true,
        recorded: isNewSession,
        visitor: { code, country, flag },
        leaderboard: getLeaderboard(),
        totalVisits: store.totalVisits,
        cheers: store.cheers,
        cheerEvents: store.cheerEvents || []
      })
    })
    return
  }

  // 404 Fallback
  return sendJson(res, 404, { error: 'Route not found' })
})

loadDatabase()

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[RADAR] Live Visitor Radar Telemetry server running on http://0.0.0.0:${server.address().port}`)
})
