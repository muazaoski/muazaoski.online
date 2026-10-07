/**
 * FESTIVE STICKER STUDIO — RAYA & CHINESE NEW YEAR
 * Interactive Cutting Mat, Die-Cut Vinyl Stickers, Sound FX & Collector Sheet
 */

import './festive-stickers.css'

// Web Audio API Synthesizer for tactile sticker interactions
class StickerAudio {
  constructor() {
    this.ctx = null
    this.muted = false
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  // Realistic adhesive vinyl peel sound (bandpass noise sweep)
  playPeel() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.1)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4))
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1200, t)
      filter.frequency.exponentialRampToValueAtTime(3400, t + 0.09)
      filter.Q.value = 1.4

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.18, t)
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.095)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)
      noise.start(t)
    } catch (_) {}
  }

  // Satisfying tactile slap / pop sound (downward pitch drop)
  playSlap() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(340, t)
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.075)

      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.008, t + 0.08)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.08)
    } catch (_) {}
  }

  // Crisp micro blip for UI buttons
  playBlip() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(580, t)
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.05)

      gain.gain.setValueAtTime(0.14, t)
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.055)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.055)
    } catch (_) {}
  }

  // Playful multi-pop cascade for scatter/bomb
  playScatter() {
    if (this.muted) return
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.playSlap(), i * 65)
    }
  }
}

// Curated starting placements for the signature collage
const CURATED_STICKERS = [
  // Top Row (alternating Raya & CNY)
  { id: '125', x: 6, y: 8, rot: -12, cat: 'raya' },
  { id: '078', x: 23, y: 6, rot: 8, cat: 'cny' },
  { id: '128', x: 40, y: 9, rot: -7, cat: 'raya' },
  { id: '081', x: 57, y: 7, rot: 13, cat: 'cny' },
  { id: '133', x: 74, y: 10, rot: -9, cat: 'raya' },

  // Middle Row
  { id: '084', x: 12, y: 38, rot: 11, cat: 'cny' },
  { id: '130', x: 28, y: 35, rot: -6, cat: 'raya' },
  { id: '086', x: 46, y: 37, rot: 10, cat: 'cny' },
  { id: '137', x: 63, y: 39, rot: -14, cat: 'raya' },
  { id: '089', x: 80, y: 37, rot: 9, cat: 'cny' },

  // Bottom Row
  { id: '126', x: 8, y: 66, rot: -10, cat: 'raya' },
  { id: '080', x: 24, y: 67, rot: 12, cat: 'cny' },
  { id: '132', x: 42, y: 65, rot: -8, cat: 'raya' },
  { id: '091', x: 60, y: 68, rot: 11, cat: 'cny' },
  { id: '140', x: 76, y: 66, rot: -7, cat: 'raya' }
]

export function initFestiveStickers(sectionSelector = '#festive-stickers') {
  const section = document.querySelector(sectionSelector)
  if (!section) return

  const originalFlow = section.querySelector('.collection-flow')
  if (!originalFlow) return

  // Hide the standard collection cards but keep them in DOM for lightbox inspection
  originalFlow.style.display = 'none'

  // Add section description
  const intro = document.createElement('p')
  intro.className = 'collection-intro'
  intro.textContent = 'An expressive set of character stickers designed for festive social media campaigns and messaging—bringing playful reactions and celebratory greetings to Hari Raya and Chinese New Year.'
  originalFlow.before(intro)

  // Extract all 33 cards from original DOM
  const cards = [...originalFlow.querySelectorAll('.mix-card')]
  const stickerData = cards.map(card => {
    const id = card.dataset.workId || ''
    const img = card.querySelector('img')
    const isCny = Number(id) >= 78 && Number(id) <= 91
    return {
      id,
      card,
      src: img?.src || '',
      alt: img?.alt || `Festive Sticker ${id}`,
      cat: isCny ? 'cny' : 'raya',
      catLabel: isCny ? 'CNY' : 'Raya',
      num: isCny ? Number(id) - 77 : Number(id) - 124
    }
  })

  // Sound instance
  const audio = new StickerAudio()

  // Track state of stickers on mat
  let topZIndex = 20
  let activeFilter = 'all' // 'all', 'raya', 'cny'

  // Map of active board sticker state: id -> { el, x, y, rot, zIndex, cat }
  const boardStickers = new Map()

  // Create Festive Studio Container
  const studio = document.createElement('div')
  studio.className = 'festive-studio'

  // 1. Toolbar HTML
  studio.innerHTML = `
    <div class="festive-toolbar">
      <div class="festive-filters" role="tablist" aria-label="Festive sticker categories">
        <button type="button" class="festive-tab is-active" data-filter="all">
          <span class="tab-icon">✨</span>
          <span class="tab-name">All Festive</span>
          <span class="tab-badge">${stickerData.length}</span>
        </button>
        <button type="button" class="festive-tab" data-filter="raya">
          <span class="tab-icon">🌙</span>
          <span class="tab-name">Hari Raya</span>
          <span class="tab-badge">${stickerData.filter(s => s.cat === 'raya').length}</span>
        </button>
        <button type="button" class="festive-tab" data-filter="cny">
          <span class="tab-icon">🧧</span>
          <span class="tab-name">Chinese New Year</span>
          <span class="tab-badge">${stickerData.filter(s => s.cat === 'cny').length}</span>
        </button>
      </div>

      <div class="festive-actions">
        <button type="button" class="festive-btn" data-action="scatter" title="Scatter stickers dynamically across the board">
          <span>🎲</span>
          <span>Sticker Bomb</span>
        </button>
        <button type="button" class="festive-btn" data-action="grid" title="Arrange stickers in a clean stamp sheet">
          <span>📐</span>
          <span>Neat Sheet</span>
        </button>
        <button type="button" class="festive-btn" data-action="reset" title="Reset to curated collage">
          <span>↺</span>
          <span>Curated</span>
        </button>
        <button type="button" class="festive-btn festive-btn--sound is-sound-on" data-action="sound" title="Toggle tactile sound effects">
          <span class="sound-icon">🔊</span>
          <span class="sound-label">Audio On</span>
        </button>
      </div>
    </div>

    <div class="festive-stage-wrap">
      <div class="festive-mat" tabindex="0" aria-label="Festive sticker cutting mat. Drag, peel or double-click stickers.">
        <div class="mat-corner mat-corner-tl"></div>
        <div class="mat-corner mat-corner-tr"></div>
        <div class="mat-corner mat-corner-bl"></div>
        <div class="mat-corner mat-corner-br"></div>
        <div class="mat-emboss-left">KASUT U · HARI RAYA AIDILFITRI</div>
        <div class="mat-emboss-right">KONGSI RAYA · GONG XI FA CAI</div>
        
        <div class="festive-board-stickers"></div>
      </div>
    </div>

    <div class="festive-tray-panel">
      <div class="festive-tray-header">
        <div class="festive-tray-title">
          <span class="tray-dot"></span>
          <strong>Sticker Sheet & Palette</strong>
          <span class="festive-tray-counter">(${stickerData.length} stickers)</span>
        </div>
      </div>
      <div class="festive-tray-scroll" tabindex="0" aria-label="Available festive stickers palette">
        ${stickerData.map(s => `
          <div class="festive-tray-card" data-id="${s.id}" data-cat="${s.cat}" title="${s.alt} (Click to slap on board)">
            <div class="tray-card-thumb">
              <img src="${s.src}" alt="${s.alt}" loading="lazy" decoding="async" />
            </div>
            <span class="tray-card-tag">${s.cat === 'cny' ? '🧧 CNY #' + s.num : '🌙 Raya #' + s.num}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `

  originalFlow.after(studio)

  const matEl = studio.querySelector('.festive-mat')
  const boardEl = studio.querySelector('.festive-board-stickers')
  const trayCards = [...studio.querySelectorAll('.festive-tray-card')]

  // Helper to sync tray card status checkmarks
  function syncTrayStatus() {
    trayCards.forEach(card => {
      const id = card.dataset.id
      card.classList.toggle('is-on-mat', boardStickers.has(id))
    })
  }

  // Create a sticker element on the mat
  function addStickerToBoard(item, x, y, rot, triggerAnimation = false) {
    if (boardStickers.has(item.id)) {
      const existing = boardStickers.get(item.id)
      bringToFront(existing)
      if (triggerAnimation) bounceSticker(existing)
      return existing
    }

    const el = document.createElement('div')
    el.className = 'festive-sticker-item'
    el.dataset.id = item.id
    el.dataset.cat = item.cat
    el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', `${item.alt}. Drag to move, scroll wheel to rotate, click button to view.`)

    el.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" draggable="false" />
      <button type="button" class="sticker-control-btn" title="View in full lightbox">🔍</button>
    `

    const state = {
      id: item.id,
      item,
      el,
      x: Math.max(2, Math.min(88, x)),
      y: Math.max(3, Math.min(82, y)),
      rot: rot || 0,
      zIndex: ++topZIndex,
      cat: item.cat
    }

    updateStickerTransform(state)
    boardEl.appendChild(el)
    boardStickers.set(item.id, state)
    attachStickerEvents(state)

    if (triggerAnimation) {
      bounceSticker(state)
      audio.playSlap()
    }

    syncFilterVisibility()
    syncTrayStatus()
    return state
  }

  // Update position & transform of sticker
  function updateStickerTransform(state) {
    state.el.style.left = `${state.x}%`
    state.el.style.top = `${state.y}%`
    state.el.style.zIndex = state.zIndex
    const transformStr = `rotate(${state.rot}deg)`
    state.el.style.setProperty('--current-transform', transformStr)
    state.el.style.transform = transformStr
  }

  function bringToFront(state) {
    state.zIndex = ++topZIndex
    state.el.style.zIndex = state.zIndex
  }

  function bounceSticker(state) {
    state.el.classList.remove('is-slapped')
    void state.el.offsetWidth // reflow
    state.el.classList.add('is-slapped')
    setTimeout(() => state.el.classList.remove('is-slapped'), 450)
  }

  // Attach drag, wheel rotate, and lightbox events
  function attachStickerEvents(state) {
    let isDragging = false
    let startX = 0
    let startY = 0
    let origLeft = 0
    let origTop = 0
    let hasMoved = false

    // Lightbox zoom button
    const zoomBtn = state.el.querySelector('.sticker-control-btn')
    zoomBtn.addEventListener('click', e => {
      e.stopPropagation()
      audio.playBlip()
      state.item.card.click()
    })

    // Pointer down (start drag / peel)
    state.el.addEventListener('pointerdown', e => {
      if (e.target === zoomBtn) return
      if (e.button !== 0 && e.pointerType === 'mouse') return

      bringToFront(state)
      isDragging = true
      hasMoved = false
      startX = e.clientX
      startY = e.clientY

      const rect = matEl.getBoundingClientRect()
      origLeft = (state.x / 100) * rect.width
      origTop = (state.y / 100) * rect.height

      state.el.classList.add('is-peeling', 'is-dragging')
      state.el.setPointerCapture(e.pointerId)
      audio.playPeel()
      e.preventDefault()
    })

    // Pointer move (dragging)
    state.el.addEventListener('pointermove', e => {
      if (!isDragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      if (!hasMoved && Math.hypot(dx, dy) > 4) {
        hasMoved = true
      }

      const rect = matEl.getBoundingClientRect()
      const newPixelX = origLeft + dx
      const newPixelY = origTop + dy

      const stickerWidth = state.el.offsetWidth || 100
      const stickerHeight = state.el.offsetHeight || 100

      // Clamp inside mat
      const clampedX = Math.max(0, Math.min(rect.width - stickerWidth, newPixelX))
      const clampedY = Math.max(0, Math.min(rect.height - stickerHeight, newPixelY))

      state.x = (clampedX / rect.width) * 100
      state.y = (clampedY / rect.height) * 100

      state.el.style.left = `${state.x}%`
      state.el.style.top = `${state.y}%`
    })

    // Pointer up (drop / slap)
    function onPointerEnd(e) {
      if (!isDragging) return
      isDragging = false
      state.el.classList.remove('is-peeling', 'is-dragging')
      try {
        state.el.releasePointerCapture(e.pointerId)
      } catch (_) {}

      audio.playSlap()
      bounceSticker(state)
    }

    state.el.addEventListener('pointerup', onPointerEnd)
    state.el.addEventListener('pointercancel', onPointerEnd)

    // Wheel to rotate sticker
    state.el.addEventListener('wheel', e => {
      e.preventDefault()
      e.stopPropagation()
      state.rot += e.deltaY > 0 ? 8 : -8
      updateStickerTransform(state)
      audio.playPeel()
    }, { passive: false })

    // Double click / tap to rotate 20 degrees
    state.el.addEventListener('dblclick', e => {
      e.preventDefault()
      state.rot += 20
      updateStickerTransform(state)
      audio.playSlap()
      bounceSticker(state)
    })
  }

  // Populate curated starting stickers
  CURATED_STICKERS.forEach(cur => {
    const item = stickerData.find(s => s.id === cur.id)
    if (item) {
      addStickerToBoard(item, cur.x, cur.y, cur.rot, false)
    }
  })

  // Sync filter visibility between mat and tray
  function syncFilterVisibility() {
    // 1. Board stickers
    boardStickers.forEach(state => {
      const isVisible = activeFilter === 'all' || state.cat === activeFilter
      state.el.classList.toggle('is-hidden', !isVisible)
    })

    // 2. Tray cards
    trayCards.forEach(card => {
      const isVisible = activeFilter === 'all' || card.dataset.cat === activeFilter
      card.classList.toggle('is-filtered-out', !isVisible)
    })
  }

  // ------------------------------------------------------------
  // TOOLBAR ACTION HANDLERS
  // ------------------------------------------------------------

  // Tab Filtering
  const filterTabs = [...studio.querySelectorAll('.festive-tab')]
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('is-active'))
      tab.classList.add('is-active')
      activeFilter = tab.dataset.filter
      audio.playBlip()
      syncFilterVisibility()
    })
  })

  // Sticker Bomb / Scatter
  const scatterBtn = studio.querySelector('[data-action="scatter"]')
  scatterBtn.addEventListener('click', () => {
    audio.playScatter()

    // Ensure all stickers of current filter are placed on the board
    const targetItems = stickerData.filter(s => activeFilter === 'all' || s.cat === activeFilter)
    targetItems.forEach(item => {
      if (!boardStickers.has(item.id)) {
        addStickerToBoard(item, 40, 40, 0, false)
      }
    })

    // Scatter active stickers
    let delay = 0
    boardStickers.forEach(state => {
      if (activeFilter === 'all' || state.cat === activeFilter) {
        state.x = 4 + Math.random() * 78
        state.y = 6 + Math.random() * 72
        state.rot = Math.round((Math.random() * 44) - 22)
        state.zIndex = ++topZIndex

        setTimeout(() => {
          updateStickerTransform(state)
          bounceSticker(state)
        }, delay)
        delay += 25
      }
    })
  })

  // Neat Sheet (Grid alignment)
  const gridBtn = studio.querySelector('[data-action="grid"]')
  gridBtn.addEventListener('click', () => {
    audio.playBlip()

    const activeList = [...boardStickers.values()].filter(s => activeFilter === 'all' || s.cat === activeFilter)
    if (activeList.length === 0) return

    const cols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(activeList.length * 1.5))))
    const rows = Math.ceil(activeList.length / cols)
    const cellW = 86 / cols
    const cellH = 80 / rows

    activeList.forEach((state, i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      state.x = 6 + c * cellW
      state.y = 8 + r * cellH
      state.rot = 0
      state.zIndex = i + 10

      setTimeout(() => {
        updateStickerTransform(state)
      }, i * 20)
    })
    setTimeout(() => audio.playSlap(), 200)
  })

  // Reset to Curated
  const resetBtn = studio.querySelector('[data-action="reset"]')
  resetBtn.addEventListener('click', () => {
    audio.playBlip()

    // Reset curated items
    CURATED_STICKERS.forEach((cur, i) => {
      const state = boardStickers.get(cur.id)
      if (state) {
        state.x = cur.x
        state.y = cur.y
        state.rot = cur.rot
        state.zIndex = i + 10
        setTimeout(() => updateStickerTransform(state), i * 15)
      } else {
        const item = stickerData.find(s => s.id === cur.id)
        if (item) addStickerToBoard(item, cur.x, cur.y, cur.rot, true)
      }
    })

    // Move any other stickers off or tuck them away
    boardStickers.forEach(state => {
      if (!CURATED_STICKERS.some(c => c.id === state.id)) {
        state.el.remove()
        boardStickers.delete(state.id)
      }
    })

    syncFilterVisibility()
    syncTrayStatus()
    setTimeout(() => audio.playSlap(), 250)
  })

  // Sound Toggle
  const soundBtn = studio.querySelector('[data-action="sound"]')
  soundBtn.addEventListener('click', () => {
    audio.muted = !audio.muted
    soundBtn.classList.toggle('is-sound-on', !audio.muted)
    const icon = soundBtn.querySelector('.sound-icon')
    const label = soundBtn.querySelector('.sound-label')
    if (audio.muted) {
      icon.textContent = '🔇'
      label.textContent = 'Muted'
    } else {
      icon.textContent = '🔊'
      label.textContent = 'Audio On'
      audio.playBlip()
    }
  })

  // Tray Card Click: Slap onto Mat
  trayCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id
      const item = stickerData.find(s => s.id === id)
      if (!item) return

      if (boardStickers.has(id)) {
        const existing = boardStickers.get(id)
        bringToFront(existing)
        bounceSticker(existing)
        audio.playSlap()
      } else {
        // Drop in center with small random variation
        const rx = 38 + (Math.random() * 20 - 10)
        const ry = 36 + (Math.random() * 20 - 10)
        const rrot = Math.round(Math.random() * 30 - 15)
        addStickerToBoard(item, rx, ry, rrot, true)
      }
    })
  })
}
