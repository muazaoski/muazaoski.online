/**
 * VIDEO & MOTION STUDIO
 * Interactive Cinema Screening Deck, Broadcast Channel Switcher & Tactile Audio FX
 */

import './video-studio.css'

// Web Audio API Synthesizer for tactile broadcast / channel tuner sounds
class VideoAudio {
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

  // Analog tuner channel switch click (highpass noise burst + relay click)
  playChannelSwitch() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime

      // Fast noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(1800, t)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.12, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noise.start(t)

      // Crisp mechanical relay click
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(750, t)
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.035)

      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.04)
    } catch (_) {}
  }

  // Tape deck play engage sound
  playTapeDeck() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, t)
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.06)

      gain.gain.setValueAtTime(0.15, t)
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.065)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(t)
      osc.stop(t + 0.065)
    } catch (_) {}
  }
}

export function getVideoCategory(category) {
  if (category === 'Shoes Promo') return { key: 'promo', label: 'Product Promo', badge: 'PROMO', color: '#04D9FF' }
  if (category === 'motion') return { key: 'motion', label: 'Motion Graphic', badge: 'MOTION', color: '#a29bfe' }
  if (category === 'montage' || category === 'collab') return { key: 'montage', label: 'Montage', badge: 'MONTAGE', color: '#fdcb6e' }
  if (category === 'meme') return { key: 'engagement', label: 'Engagement', badge: 'ENGAGE', color: '#ff7675' }
  if (category === 'ugc edit') return { key: 'ugc', label: 'UGC Edit', badge: 'UGC', color: '#00b894' }
  if (category === 'wedding hafiz') return { key: 'wedding', label: 'Wedding Film', badge: 'WEDDING', color: '#fd79a8' }
  return { key: 'other', label: 'Video', badge: 'VIDEO', color: '#04D9FF' }
}

const CHANNELS = [
  { key: 'all', num: 'CH 00', label: 'ALL REELS' },
  { key: 'promo', num: 'CH 01', label: 'PRODUCT PROMO' },
  { key: 'motion', num: 'CH 02', label: 'MOTION GRAPHIC' },
  { key: 'montage', num: 'CH 03', label: 'MONTAGES' },
  { key: 'engagement', num: 'CH 04', label: 'ENGAGEMENT' },
  { key: 'ugc', num: 'CH 05', label: 'UGC EDITS' },
  { key: 'wedding', num: 'CH 06', label: 'WEDDING FILM' }
]

export function initVideoStudio(sectionSelector, { mediaDescriptions = {}, showMedia = () => {}, mix = [] } = {}) {
  const section = document.querySelector(sectionSelector)
  if (!section) return

  const flow = section.querySelector('.collection-flow')
  if (!flow) return

  const audio = new VideoAudio()

  // Collect video cards inside the section flow
  const cards = [...flow.querySelectorAll('.mix-card')]
  if (cards.length === 0) return

  // Extract media items associated with the cards
  const videoItems = cards.map(card => {
    const workId = card.dataset.workId
    const index = Number(card.dataset.index)
    const item = (workId ? mix.find(m => String(m.id) === workId) : null) || mix[index]
    const info = mediaDescriptions[item?.id] || {}
    const title = info.title || (item?.source?.split('/')?.pop()?.replace(/\.[^.]+$/, '') ?? `Video ${item?.id}`)
    const desc = info.description || 'Commercial video & motion graphics project.'
    const cat = getVideoCategory(item?.category)
    return {
      card,
      item,
      workId: item?.id,
      index,
      title,
      desc,
      cat
    }
  }).filter(entry => entry.item)

  // Calculate counts per channel
  const counts = { all: videoItems.length }
  videoItems.forEach(v => {
    counts[v.cat.key] = (counts[v.cat.key] || 0) + 1
  })

  // 1. Insert section intro
  const intro = document.createElement('p')
  intro.className = 'collection-intro'
  intro.textContent = 'A comprehensive reel of motion design and video editing—spanning commercial footwear promos, kinetic motion graphics, high-energy event montages, viral engagement shorts, creator UGC edits, and cinematic documentary storytelling.'
  flow.before(intro)

  // 2. Build Studio Wrapper & Channel Bar
  const studioWrap = document.createElement('div')
  studioWrap.className = 'video-studio'

  const channelBar = document.createElement('div')
  channelBar.className = 'video-channels-bar'
  channelBar.setAttribute('role', 'tablist')
  channelBar.setAttribute('aria-label', 'Video categories')

  channelBar.innerHTML = CHANNELS.map(ch => {
    const count = counts[ch.key] || 0
    return `
      <button type="button" class="video-channel-tab${ch.key === 'all' ? ' is-active' : ''}" data-channel="${ch.key}" role="tab" aria-selected="${ch.key === 'all'}">
        <span class="channel-num">${ch.num}</span>
        <span class="channel-label">${ch.label}</span>
        <span class="channel-count">${count}</span>
      </button>
    `
  }).join('') + `
    <div class="video-sound-toggle">
      <button type="button" class="video-sound-btn is-sound-on" data-action="sound" title="Toggle Sound FX">
        <span class="sound-icon">🔊</span>
        <span class="sound-text">FX ON</span>
      </button>
    </div>
  `

  studioWrap.append(channelBar)

  // 3. Build Cinema Screening Theater Stage
  const theater = document.createElement('div')
  theater.className = 'video-theater'

  const initialIdx = videoItems.findIndex(v => String(v.workId) === '048')
  const initialVideo = (initialIdx !== -1 ? videoItems[initialIdx] : videoItems[0]) || videoItems[0]

  theater.innerHTML = `
    <div class="theater-screen-box">
      <div class="theater-hud-top">
        <span class="theater-live-tag"><span class="theater-rec-dot"></span>SCREENING NOW</span>
        <div class="theater-hud-meta">
          <span class="theater-cat-pill" data-theater-cat>${initialVideo.cat.label.toUpperCase()}</span>
          <span class="theater-counter" data-theater-pos>01 / ${videoItems.length}</span>
        </div>
      </div>
      <div class="theater-viewport">
        <video src="${initialVideo.item.src}?audio=1" poster="${initialVideo.item.poster || ''}" playsinline preload="metadata" controls></video>
      </div>
    </div>
    <div class="theater-info-panel">
      <div class="theater-info-head">
        <span class="theater-channel-badge" data-theater-channel>[ ${initialVideo.cat.badge} // WORK ${initialVideo.workId} ]</span>
        <h3 class="theater-title" data-theater-title>${initialVideo.title}</h3>
        <p class="theater-desc" data-theater-desc>${initialVideo.desc}</p>
      </div>
      <div class="theater-controls-row">
        <div class="theater-nav-btns">
          <button type="button" class="theater-nav-btn" data-action="prev" aria-label="Previous reel">◀ PREV</button>
          <button type="button" class="theater-nav-btn" data-action="next" aria-label="Next reel">NEXT ▶</button>
        </div>
        <button type="button" class="theater-enlarge-btn" data-action="enlarge">
          <span>WATCH IN THEATER MODAL</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  `

  studioWrap.append(theater)
  flow.before(studioWrap)

  // Enhance each card in the grid with category badge & title overlay
  videoItems.forEach(v => {
    v.card.dataset.channel = v.cat.key

    const badge = document.createElement('span')
    badge.className = 'video-card-badge'
    badge.style.color = v.cat.color
    badge.style.borderColor = `${v.cat.color}50`
    badge.textContent = v.cat.badge
    v.card.append(badge)

    const titleBar = document.createElement('div')
    titleBar.className = 'video-card-title-bar'
    titleBar.innerHTML = `
      <span class="video-card-name">${v.title}</span>
      <span class="video-card-meta">${v.cat.label}</span>
    `
    v.card.append(titleBar)
  })

  // State management
  let activeIndex = 0
  let activeChannel = 'all'

  const theaterVideo = theater.querySelector('video')
  const theaterCatPill = theater.querySelector('[data-theater-cat]')
  const theaterPos = theater.querySelector('[data-theater-pos]')
  const theaterChannelBadge = theater.querySelector('[data-theater-channel]')
  const theaterTitle = theater.querySelector('[data-theater-title]')
  const theaterDesc = theater.querySelector('[data-theater-desc]')
  const soundBtn = channelBar.querySelector('[data-action="sound"]')

  function getVisibleVideoItems() {
    return activeChannel === 'all'
      ? videoItems
      : videoItems.filter(v => v.cat.key === activeChannel)
  }

  function loadVideoIntoTheater(index, autoPlay = true) {
    const list = getVisibleVideoItems()
    if (list.length === 0) return

    if (index < 0) index = list.length - 1
    if (index >= list.length) index = 0

    activeIndex = index
    const videoData = list[activeIndex]

    // Update theater DOM
    theaterCatPill.textContent = videoData.cat.label.toUpperCase()
    theaterCatPill.style.color = videoData.cat.color
    theaterCatPill.style.borderColor = `${videoData.cat.color}60`

    theaterPos.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`
    theaterChannelBadge.textContent = `[ ${videoData.cat.badge} // WORK ${videoData.workId} ]`
    theaterTitle.textContent = videoData.title
    theaterDesc.textContent = videoData.desc

    theaterVideo.poster = videoData.item.poster || ''
    theaterVideo.src = `${videoData.item.src}?audio=1`

    // Update active highlight on card in grid
    videoItems.forEach(v => v.card.classList.remove('is-active-screening'))
    videoData.card.classList.add('is-active-screening')

    if (autoPlay) {
      audio.playTapeDeck()
      theaterVideo.play().catch(() => {})
    }
  }

  const CHANNEL_HEROES = {
    all: '048',
    promo: '048',
    motion: '060',
    montage: '186',
    engagement: '182',
    ugc: '262'
  }

  // Load initial product promo hero WORK 048 without autoplay sound
  loadVideoIntoTheater(initialIdx !== -1 ? initialIdx : 0, false)

  // Filter Channel Tab Clicks
  const channelTabs = [...channelBar.querySelectorAll('.video-channel-tab')]
  channelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const channel = tab.dataset.channel
      if (channel === activeChannel) return

      audio.playChannelSwitch()
      activeChannel = channel

      channelTabs.forEach(t => {
        t.classList.toggle('is-active', t === tab)
        t.setAttribute('aria-selected', String(t === tab))
      })

      // Show/hide cards in grid
      videoItems.forEach(v => {
        const matches = activeChannel === 'all' || v.cat.key === activeChannel
        v.card.classList.toggle('is-filtered-out', !matches)
      })

      // Load designated hero video of this category
      const list = getVisibleVideoItems()
      const heroId = CHANNEL_HEROES[channel]
      const heroIdx = heroId ? list.findIndex(v => String(v.workId) === heroId) : 0
      loadVideoIntoTheater(heroIdx !== -1 ? heroIdx : 0, true)
    })
  })

  // Sound toggle button
  soundBtn.addEventListener('click', () => {
    audio.muted = !audio.muted
    soundBtn.classList.toggle('is-sound-on', !audio.muted)
    const icon = soundBtn.querySelector('.sound-icon')
    const text = soundBtn.querySelector('.sound-text')
    if (audio.muted) {
      icon.textContent = '🔇'
      text.textContent = 'MUTED'
    } else {
      icon.textContent = '🔊'
      text.textContent = 'FX ON'
      audio.playChannelSwitch()
    }
  })

  // Prev / Next buttons
  theater.querySelector('[data-action="prev"]').addEventListener('click', () => {
    audio.playChannelSwitch()
    loadVideoIntoTheater(activeIndex - 1, true)
  })

  theater.querySelector('[data-action="next"]').addEventListener('click', () => {
    audio.playChannelSwitch()
    loadVideoIntoTheater(activeIndex + 1, true)
  })

  // Enlarge button (opens in modal viewer)
  theater.querySelector('[data-action="enlarge"]').addEventListener('click', () => {
    const list = getVisibleVideoItems()
    const current = list[activeIndex]
    if (current) {
      theaterVideo.pause()
      showMedia(current.index)
    }
  })

  // Clicking any card in the grid: Loads into theater monitor
  videoItems.forEach(v => {
    v.card.title = `Click to screen ${v.title} · Double-click to open full modal`
    v.card.addEventListener('click', event => {
      event.stopPropagation()
      const list = getVisibleVideoItems()
      const targetIdx = list.findIndex(item => item.workId === v.workId)
      if (targetIdx !== -1) {
        audio.playChannelSwitch()
        loadVideoIntoTheater(targetIdx, true)

        // Smooth scroll towards theater if theater is scrolled past
        const theaterRect = theater.getBoundingClientRect()
        if (theaterRect.top < -100 || theaterRect.bottom < 0) {
          theater.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
    })

    v.card.addEventListener('dblclick', event => {
      event.stopPropagation()
      theaterVideo.pause()
      showMedia(v.index)
    })
  })

  // IntersectionObserver to pause theater video when out of viewport
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) {
      theaterVideo.pause()
    }
  }).observe(theater)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) theaterVideo.pause()
  })
}
