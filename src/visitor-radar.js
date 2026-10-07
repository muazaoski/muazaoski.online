/**
 * VISITOR RADAR & LEADERBOARD
 * Detects visitor country from IP, shows funny commentary, and displays live top-5 visitor leaderboard
 */

import './visitor-radar.css'

const FUNNY_PUNCHLINES = {
  MY: [
    "Dah makan belum? Thanks for checking out my portfolio instead of sleeping at 11 PM.",
    "Certified 100% Malaysian IP. High probability of teh tarik or iced Milo within arm's reach.",
    "Local support detected! Salam dari studio, terima kasih support anak tempatan.",
    "You are on home turf. No GrabFood delivery fees were harmed in making this portfolio."
  ],
  SG: [
    "Spotted from Singapore! Please send exchange rate blessings and cheaper iced latte.",
    "Hello neighbor! Fast Wi-Fi and even faster MRT commute vibes detected.",
    "Checking my portfolio on your lunch break at Raffles Place? Respect the grind."
  ],
  US: [
    "Beaming in from the USA! What timezone are you in? Hope you didn't stumble here at 3 AM from Reddit.",
    "Howdy! Thanks for crossing the Pacific ocean through optic fiber cables to look at pixels.",
    "American IP detected. Hope my portfolio loads faster than a healthcare claim."
  ],
  ID: [
    "Halo tetangga dari Indonesia! Salam serumpun, makasih banyak udah mampir ke portfolio ini.",
    "Spotted from Indonesia! Jangan lupa ngopi santai sambil explore karya-karya ini."
  ],
  GB: [
    "Mind the gap! Greetings from Malaysia. Grab a warm cuppa, hope the British weather is tolerable today.",
    "UK visitor detected! Jolly good to have you here. Cheerio and happy scrolling."
  ],
  JP: [
    "Konnichiwa from Japan! Sugoi! Arigato for scrolling all the way to this corner of the internet.",
    "Spotted in Japan! Hope this portfolio brings retro arcade vibes to your day."
  ],
  AU: [
    "G'day Australia! Hope gravity is holding you down safely on the other side of the planet.",
    "Aussie visitor spotted! Watch out for spiders, grab a flat white, and enjoy the motion reels."
  ],
  DE: [
    "Guten Tag! Precision-engineered visual design telemetry loaded into your browser with German efficiency."
  ],
  CA: [
    "Hello Canada! Hope you have some warm maple syrup nearby while browsing my pixel art."
  ],
  DEFAULT: [
    "Signal locked! Welcome to my corner of the web. No cookies stolen, zero tracking ads, just pure pixels.",
    "Visitor detected from across the globe! Hope you're having an awesome day wherever you are."
  ]
}

const DEFAULT_LEADERBOARD = [
  { code: 'MY', country: 'Malaysia', flag: '🇲🇾', count: 1420, comment: 'Home turf supremacy • Late-night teh tarik gang' },
  { code: 'SG', country: 'Singapore', flag: '🇸🇬', count: 512, comment: 'Exchange rate tourists & busy recruiters' },
  { code: 'US', country: 'United States', flag: '🇺🇸', count: 348, comment: 'Insomnia gang & accidental Reddit clicks' },
  { code: 'ID', country: 'Indonesia', flag: '🇮🇩', count: 215, comment: 'The supportive neighbours • Salam serumpun' },
  { code: 'GB', country: 'United Kingdom', flag: '🇬🇧', count: 143, comment: 'Looking for motion design & a warm cuppa' }
]

const TIMEZONE_FALLBACKS = {
  'Asia/Kuala_Lumpur': { country: 'Malaysia', code: 'MY', flag: '🇲🇾', city: 'Kuala Lumpur' },
  'Asia/Singapore': { country: 'Singapore', code: 'SG', flag: '🇸🇬', city: 'Singapore' },
  'Asia/Jakarta': { country: 'Indonesia', code: 'ID', flag: '🇮🇩', city: 'Jakarta' },
  'Asia/Tokyo': { country: 'Japan', code: 'JP', flag: '🇯🇵', city: 'Tokyo' },
  'Europe/London': { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', city: 'London' },
  'America/New_York': { country: 'United States', code: 'US', flag: '🇺🇸', city: 'New York' },
  'America/Los_Angeles': { country: 'United States', code: 'US', flag: '🇺🇸', city: 'Los Angeles' },
  'Australia/Sydney': { country: 'Australia', code: 'AU', flag: '🇦🇺', city: 'Sydney' }
}

async function detectVisitorCountry() {
  // 1. Try ipwho.is (fast, CORS-friendly, SSL enabled, no API key)
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.success && data.country_code) {
        return {
          country: data.country || 'Malaysia',
          code: (data.country_code || 'MY').toUpperCase(),
          flag: data.flag?.emoji || '🌍',
          city: data.city || data.region || 'Earth'
        }
      }
    }
  } catch (_) {}

  // 2. Try api.country.is fallback
  try {
    const res = await fetch('https://api.country.is', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.country) {
        const code = data.country.toUpperCase()
        const match = DEFAULT_LEADERBOARD.find(item => item.code === code)
        return {
          country: match?.country || code,
          code,
          flag: match?.flag || '🌍',
          city: 'Earth'
        }
      }
    }
  } catch (_) {}

  // 3. Fallback using browser timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  if (TIMEZONE_FALLBACKS[tz]) {
    return TIMEZONE_FALLBACKS[tz]
  }

  // Default to Malaysia
  return {
    country: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
    city: 'Kuala Lumpur'
  }
}

function getRandomPunchline(code) {
  const list = FUNNY_PUNCHLINES[code] || FUNNY_PUNCHLINES.DEFAULT
  return list[Math.floor(Math.random() * list.length)]
}

export function getCountryFlagMarkup(code, countryName = '', isHero = false) {
  const c = String(code || 'my').toLowerCase().trim()
  const localList = ['my', 'sg', 'us', 'id', 'gb', 'jp', 'au', 'de', 'ca', 'fr', 'nl', 'kr']
  const src = localList.includes(c) ? `/flags/${c}.svg` : `https://flagcdn.com/w80/${c}.png`
  const fallback = `https://flagcdn.com/w80/${c}.png`

  if (isHero) {
    return `<span class="radar-flag-hero-wrap"><img class="radar-flag-hero-img" src="${src}" onerror="this.onerror=null;this.src='${fallback}'" alt="${countryName || code} flag" width="48" height="32" /></span>`
  }

  return `<span class="radar-flag-small-wrap"><img class="radar-flag-img" src="${src}" onerror="this.onerror=null;this.src='${fallback}'" alt="${countryName || code} flag" width="24" height="16" loading="lazy" decoding="async" /></span>`
}

// VPS Radar API Endpoints
const API_ENDPOINTS = [
  'https://frog.muazaoski.site/api/radar',
  'https://frog.muazaoski.online/api/radar',
  '/api/radar'
]

async function syncVisitWithVps(visitor) {
  for (const base of API_ENDPOINTS) {
    try {
      const res = await fetch(`${base}/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitor),
        signal: AbortSignal.timeout(3000)
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.leaderboard)) {
          return { ...data, endpoint: base }
        }
      }
    } catch (_) {}
  }
  return null
}

async function sendCheerToVps() {
  for (const base of API_ENDPOINTS) {
    try {
      const res = await fetch(`${base}/cheer`, {
        method: 'POST',
        signal: AbortSignal.timeout(3000)
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && typeof data.cheers === 'number') {
          return data.cheers
        }
      }
    } catch (_) {}
  }
  return null
}

export async function initVisitorRadar(containerSelector = '#visitor-radar') {
  const container = document.querySelector(containerSelector)
  if (!container) return

  // Load persistent local leaderboard fallback
  let leaderboard = DEFAULT_LEADERBOARD
  try {
    const saved = localStorage.getItem('muazaoski_radar_leaderboard')
    if (saved) {
      leaderboard = JSON.parse(saved)
    }
  } catch (_) {}

  // Render initial skeleton / deck
  container.innerHTML = `
    <div class="radar-deck">
      <div class="radar-header">
        <span class="radar-kicker">
          <span class="radar-beacon-dot"></span>
          <span data-radar-server-tag>[ 📡 VISITOR RADAR // REAL-TIME TELEMETRY ]</span>
        </span>
        <h2 class="radar-title">Where are you clicking from?</h2>
        <p class="radar-subtitle">You scrolled this far down! Let’s inspect where in the world your internet connection is pinging from.</p>
      </div>

      <div class="radar-grid">
        <!-- Left: Detected Log -->
        <div class="radar-log-panel">
          <div class="radar-terminal-bar">
            <span class="radar-terminal-dots"><i></i><i></i><i></i></span>
            <span class="radar-status-live"><span class="radar-status-live-dot"></span>RECEIVING PING</span>
          </div>
          <div class="radar-ip-output">
            <div class="radar-prompt-line">&gt; ping --geolocate current_visitor</div>
            <div class="radar-detected-hero">
              <span class="radar-flag-big" data-radar-flag>${getCountryFlagMarkup('MY', 'Malaysia', true)}</span>
              <div>
                <h3 class="radar-detected-name" data-radar-country>Locating satellite coordinates...</h3>
                <span class="radar-city-tag" data-radar-city>Tracing IP route</span>
              </div>
            </div>
            <div class="radar-funny-bubble">
              <span class="radar-bubble-tag">// RADAR NOTE</span>
              <p class="radar-punchline-text" data-radar-punchline>Calibrating optic fibers and checking if you've had teh tarik yet...</p>
            </div>
          </div>
          <div class="radar-latency-row">
            <span data-radar-meta>Status: Legit human • Latency: ~34ms</span>
            <button type="button" class="radar-cheer-btn" data-action="cheer" title="Send a cheer to the studio">
              <span>🧋 Send Teh Tarik</span>
              <strong data-cheer-count>(1,842)</strong>
            </button>
          </div>
        </div>

        <!-- Right: Leaderboard -->
        <div class="radar-leaderboard-panel">
          <div class="radar-board-head">
            <h3 class="radar-board-title">Top 5 Visitor Hubs</h3>
            <span class="radar-board-badge" data-radar-board-badge>LIVE PINGS</span>
          </div>
          <ul class="radar-leaderboard-list" data-radar-board>
            <!-- Generated dynamically -->
          </ul>
        </div>
      </div>
      <p class="radar-disclaimer">* Statistics recorded since my mom first opened this link. Certified 100% fun, 0% serious.</p>
    </div>
  `

  // Detect Country
  const visitor = await detectVisitorCountry()
  const punchline = getRandomPunchline(visitor.code)

  // Update Left Panel DOM
  const flagEl = container.querySelector('[data-radar-flag]')
  const countryEl = container.querySelector('[data-radar-country]')
  const cityEl = container.querySelector('[data-radar-city]')
  const punchlineEl = container.querySelector('[data-radar-punchline]')
  const metaEl = container.querySelector('[data-radar-meta]')
  const serverTagEl = container.querySelector('[data-radar-server-tag]')
  const boardBadgeEl = container.querySelector('[data-radar-board-badge]')

  if (flagEl) flagEl.innerHTML = getCountryFlagMarkup(visitor.code, visitor.country, true)
  if (countryEl) countryEl.textContent = `You are visiting from ${visitor.country}!`
  if (cityEl) cityEl.textContent = `Detected location: near ${visitor.city} • IP locked`
  if (punchlineEl) punchlineEl.textContent = punchline
  if (metaEl) metaEl.textContent = `Status: Certified human • ${visitor.code} Ping Verified`

  // Sync with real VPS backend
  const vpsData = await syncVisitWithVps(visitor)

  if (vpsData && Array.isArray(vpsData.leaderboard) && vpsData.leaderboard.length > 0) {
    // 100% REAL LIVE DATA FROM VPS!
    leaderboard = vpsData.leaderboard
    if (serverTagEl) {
      serverTagEl.innerHTML = `[ 🟢 VPS LIVE TELEMETRY // REAL GLOBAL DATA ]`
      serverTagEl.style.color = '#2ecc71'
    }
    if (boardBadgeEl) {
      boardBadgeEl.textContent = `REAL VPS SYNC (${(vpsData.totalVisits || 0).toLocaleString()} VISITS)`
      boardBadgeEl.style.color = '#2ecc71'
      boardBadgeEl.style.borderColor = 'rgba(46, 204, 113, 0.4)'
    }
    if (vpsData.cheers) {
      localStorage.setItem('muazaoski_cheer_count', vpsData.cheers)
    }
  } else {
    // Local fallback: increment locally
    let targetItem = leaderboard.find(item => item.code === visitor.code)
    if (targetItem) {
      targetItem.count += 1
    } else {
      leaderboard.push({
        code: visitor.code,
        country: visitor.country,
        flag: visitor.flag,
        count: 1,
        comment: 'Special scout visitor from across the globe!'
      })
    }
    leaderboard.sort((a, b) => b.count - a.count)
    try {
      localStorage.setItem('muazaoski_radar_leaderboard', JSON.stringify(leaderboard))
    } catch (_) {}
  }

  // Render Top 5
  const top5 = leaderboard.slice(0, 5)
  const isUserInTop5 = top5.some(item => item.code === visitor.code)

  const boardEl = container.querySelector('[data-radar-board]')
  if (boardEl) {
    const medals = ['🥇', '🥈', '🥉', '04', '05']
    const rankClasses = ['rank-1', 'rank-2', 'rank-3', 'rank-4', 'rank-5']

    boardEl.innerHTML = top5.map((row, idx) => {
      const isUser = row.code === visitor.code
      return `
        <li class="radar-row${isUser ? ' is-user-country' : ''}">
          <div class="radar-row-main">
            <div class="radar-row-left">
              <span class="radar-rank-badge ${rankClasses[idx]}">${medals[idx]}</span>
              <span class="radar-flag-small">${getCountryFlagMarkup(row.code, row.country)}</span>
              <span class="radar-country-label">${row.country}</span>
              ${isUser ? '<span class="radar-you-tag">YOU</span>' : ''}
            </div>
            <div class="radar-row-right">
              <span class="radar-count-num">${row.count.toLocaleString()}</span>
            </div>
          </div>
          <p class="radar-row-comment">${row.comment}</p>
        </li>
      `
    }).join('')

    // If user's country is not in the top 5, add a bonus row highlighting them
    if (!isUserInTop5) {
      boardEl.innerHTML += `
        <li class="radar-row is-user-country">
          <div class="radar-row-main">
            <div class="radar-row-left">
              <span class="radar-rank-badge">✨</span>
              <span class="radar-flag-small">${getCountryFlagMarkup(visitor.code, visitor.country)}</span>
              <span class="radar-country-label">${visitor.country}</span>
              <span class="radar-you-tag">YOU</span>
            </div>
            <div class="radar-row-right">
              <span class="radar-count-num">+1 Added</span>
            </div>
          </div>
          <p class="radar-row-comment">Representing your nation on the radar! Keep scrolling and spread the word.</p>
        </li>
      `
    }
  }

  // Cheer Button Interaction (Synced with VPS)
  const cheerBtn = container.querySelector('[data-action="cheer"]')
  const cheerCountEl = container.querySelector('[data-cheer-count]')
  let cheerCount = Number(localStorage.getItem('muazaoski_cheer_count') || 1842)
  if (vpsData?.cheers) cheerCount = vpsData.cheers

  if (cheerCountEl) cheerCountEl.textContent = `(${cheerCount.toLocaleString()})`

  if (cheerBtn) {
    cheerBtn.addEventListener('click', async () => {
      cheerCount += 1
      if (cheerCountEl) cheerCountEl.textContent = `(${cheerCount.toLocaleString()})`
      try {
        localStorage.setItem('muazaoski_cheer_count', cheerCount)
      } catch (_) {}

      // Fire and forget to VPS
      sendCheerToVps().then(serverCheers => {
        if (serverCheers && cheerCountEl) {
          cheerCount = serverCheers
          cheerCountEl.textContent = `(${cheerCount.toLocaleString()})`
        }
      })

      const cheerSpans = ['🧋 Sedap!', '🧋 Teh Tarik sent!', '✨ Thanks!', '🧋 +1 Caffeine boost!']
      const label = cheerBtn.querySelector('span')
      if (label) {
        label.textContent = cheerSpans[Math.floor(Math.random() * cheerSpans.length)]
        setTimeout(() => {
          label.textContent = '🧋 Send Teh Tarik'
        }, 1600)
      }
    })
  }
}
