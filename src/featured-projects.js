import projects from './featured-projects.json'

export const FEATURED_STORAGE_KEY = 'muazaoski-featured-raya-ids-v1'

export function createFeaturedProjects({ media, openMedia, devMode, isAiLabeled }) {
  const container = document.querySelector('.featured-spotlight-container') || document.querySelector('.featured-grid')
  if (!container) return { render() {}, getSelection: () => [], setSelection() {}, setPicker() {} }

  const byId = new Map(media.map(item => [String(item.id), item]))
  let rayaIds = projects[4].itemIds
  let activeIndex = 0
  let openPicker = () => {}

  if (devMode) {
    try {
      const saved = JSON.parse(localStorage.getItem(FEATURED_STORAGE_KEY))
      if (Array.isArray(saved)) rayaIds = saved.filter(id => byId.has(String(id))).map(String)
    } catch { /* Published selection remains default */ }
  }

  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

  function getProjectData(index) {
    const project = projects[index]
    const ids = index === 4 ? rayaIds : project.itemIds
    const cover = byId.get(project.coverId || ids?.[0])
    const covers = project.coverIds ? project.coverIds.map(id => byId.get(id)).filter(Boolean) : (cover ? [cover] : [])
    const items = ids ? ids.map(id => byId.get(id)).filter(Boolean) : (cover ? [cover] : [])
    const isVideo = cover?.kind === 'video'
    const hasMedia = covers.length > 0
    const copy = index === 4 && cover
      ? `${rayaIds.length} selected ${rayaIds.length === 1 ? 'piece' : 'pieces'} from the Hari Raya store decoration project.`
      : project.description

    let actionLabel = 'Selection coming soon'
    if (project.collectionId) actionLabel = 'Explore project'
    else if (isVideo) actionLabel = 'Play film'
    else if (hasMedia) actionLabel = 'View artwork'
    else if (devMode) actionLabel = 'Pick artwork'

    return {
      index,
      project,
      ids,
      cover,
      covers,
      items,
      isVideo,
      hasMedia,
      copy,
      actionLabel
    }
  }

  function pauseAllVideos() {
    container.querySelectorAll('video').forEach(video => {
      try {
        video.pause()
        if (video.classList.contains('strip-video-preview')) {
          video.currentTime = 0
        }
      } catch { /* Ignore pause errors */ }
    })
  }

  function setActive(newIndex) {
    if (newIndex < 0) newIndex = projects.length - 1
    if (newIndex >= projects.length) newIndex = 0
    pauseAllVideos()
    activeIndex = newIndex
    render()

    const activeTab = container.querySelector(`.strip-card[data-index="${activeIndex}"]`)
    if (activeTab && document.activeElement && container.contains(document.activeElement)) {
      activeTab.focus()
    }
  }

  function renderStage() {
    const data = getProjectData(activeIndex)
    const { project, cover, covers, isVideo, hasMedia, copy, actionLabel } = data
    const projectNum = String(activeIndex + 1).padStart(2, '0')
    const totalNum = String(projects.length).padStart(2, '0')

    let mediaHtml = ''
    if (!hasMedia) {
      mediaHtml = `
        <div class="stage-empty-state">
          <span class="stage-empty-glyph">[?]</span>
          <p class="stage-empty-title">SELECTION PENDING</p>
          <p class="stage-empty-sub">${devMode ? 'Click to open dev artwork picker' : 'Curated artwork coming soon'}</p>
          ${devMode ? '<button class="stage-empty-btn" type="button" data-action="pick">Open Picker +</button>' : ''}
        </div>`
    } else if (project.coverIds && covers.length > 1) {
      // 4-tile character grid for Vertikal
      mediaHtml = `
        <div class="stage-multi-grid">
          ${covers.slice(0, 4).map((c, i) => `
            <div class="stage-multi-tile">
              ${c.kind === 'video'
                ? `<video src="${c.src}" poster="${c.poster || ''}" muted loop playsinline autoplay preload="metadata"></video>`
                : `<img src="${c.src}" alt="${escape(project.title)} character ${i + 1}" width="${c.width}" height="${c.height}" loading="eager" decoding="async" />`
              }
              <span class="stage-tile-badge">CHAR_${String(i + 1).padStart(2, '0')}</span>
            </div>
          `).join('')}
        </div>`
    } else if (isVideo) {
      mediaHtml = `
        <div class="stage-media-wrap stage-media-wrap--video">
          <video class="stage-media-video" src="${cover.src}" poster="${cover.poster || ''}" muted loop playsinline preload="metadata"></video>
          <div class="stage-video-overlay" aria-hidden="true">
            <span class="stage-play-badge">
              <span class="stage-play-icon">▶</span>
              <span>PLAY FILM (FULL VIEW)</span>
            </span>
          </div>
          ${isAiLabeled(cover.id) ? '<span class="ai-label-badge" aria-label="AI-assisted"><img src="/icon/ai-label.webp" alt="" /></span>' : ''}
        </div>`
    } else {
      mediaHtml = `
        <div class="stage-media-wrap stage-media-wrap--image">
          <img src="${cover.src}" alt="${escape(project.title)}" width="${cover.width}" height="${cover.height}" loading="eager" decoding="async" />
          ${isAiLabeled(cover.id) ? '<span class="ai-label-badge" aria-label="AI-assisted"><img src="/icon/ai-label.webp" alt="" /></span>' : ''}
        </div>`
    }

    const actionTag = project.collectionId ? 'a' : 'button'
    const actionHref = project.collectionId ? `href="#${project.collectionId}"` : ''
    const actionType = actionTag === 'button' ? 'type="button"' : ''

    return `
      <div class="featured-stage" data-index="${activeIndex}">
        <div class="stage-hud">
          <div class="stage-hud-left">
            <span class="stage-rec-dot" aria-hidden="true"></span>
            <span class="stage-hud-sys">STAGE // 0${activeIndex + 1} OF 05</span>
            <span class="stage-hud-cat">[ ${escape(project.category)} ]</span>
          </div>
          <div class="stage-hud-nav">
            <button class="stage-nav-btn stage-nav-btn--prev" type="button" aria-label="Previous featured project">
              <span aria-hidden="true">◀</span><span>PREV</span>
            </button>
            <span class="stage-nav-counter">${projectNum} / ${totalNum}</span>
            <button class="stage-nav-btn stage-nav-btn--next" type="button" aria-label="Next featured project">
              <span>NEXT</span><span aria-hidden="true">▶</span>
            </button>
          </div>
        </div>

        <div class="stage-main">
          <div class="stage-monitor" tabindex="0" role="button" aria-label="${escape(actionLabel)}: ${escape(project.title)}">
            <span class="stage-reticle stage-reticle--tl" aria-hidden="true"></span>
            <span class="stage-reticle stage-reticle--tr" aria-hidden="true"></span>
            <span class="stage-reticle stage-reticle--bl" aria-hidden="true"></span>
            <span class="stage-reticle stage-reticle--br" aria-hidden="true"></span>
            <div class="stage-monitor-inner">
              ${mediaHtml}
            </div>
          </div>

          <div class="stage-details">
            <div class="stage-details-body">
              <div class="stage-lead-index">
                <span>PROJECT // ${projectNum}</span> · <em>${escape(project.category)}</em>
              </div>
              <h3 class="stage-title">${escape(project.title)}</h3>
              <p class="stage-desc">${escape(copy)}</p>
            </div>
            <div class="stage-action-wrap">
              <${actionTag} ${actionType} ${actionHref} class="stage-action-btn" data-action="main" aria-label="${escape(actionLabel)}: ${escape(project.title)}">
                <span>${escape(actionLabel)}</span>
                <span aria-hidden="true">${project.collectionId ? '↗' : isVideo ? '▶' : hasMedia ? '↗' : '+'}</span>
              </${actionTag}>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function renderStrip() {
    return `
      <div class="featured-strip" role="tablist" aria-label="Featured projects strip">
        ${projects.map((project, index) => {
          const data = getProjectData(index)
          const isActive = index === activeIndex
          const projectNum = String(index + 1).padStart(2, '0')
          const cover = data.cover
          const isVideo = data.isVideo

          return `
            <button
              class="strip-card ${isActive ? 'is-active' : ''} ${isVideo ? 'has-video' : ''} ${!data.hasMedia ? 'is-empty' : ''}"
              type="button"
              role="tab"
              aria-selected="${isActive ? 'true' : 'false'}"
              data-index="${index}"
              aria-label="Select project ${projectNum}: ${escape(project.title)}"
              tabindex="${isActive ? '0' : '-1'}"
            >
              <div class="strip-media-frame">
                <span class="strip-index-tag">${projectNum}</span>
                ${cover ? `
                  <img src="${cover.poster || cover.src}" alt="" width="${cover.width || 480}" height="${cover.height || 270}" loading="lazy" decoding="async" />
                  ${isVideo ? `
                    <video class="strip-video-preview" src="${cover.src}" poster="${cover.poster || ''}" muted loop playsinline preload="none" tabindex="-1"></video>
                    <span class="strip-media-type" aria-hidden="true">VIDEO ▶</span>
                  ` : ''}
                  ${isAiLabeled(cover.id) ? '<span class="ai-label-badge" aria-label="AI-assisted"><img src="/icon/ai-label.webp" alt="" /></span>' : ''}
                ` : `
                  <div class="strip-empty-poster" aria-hidden="true">
                    <span>${projectNum}</span>
                  </div>
                `}
              </div>
              <div class="strip-meta">
                <span class="strip-cat">${escape(project.category.split('/')[0].trim())}</span>
                <strong class="strip-title">${escape(project.title)}</strong>
              </div>
            </button>
          `
        }).join('')}
      </div>
    `
  }

  function render() {
    container.innerHTML = `
      <div class="featured-spotlight-inner">
        ${renderStage()}
        ${renderStrip()}
      </div>
    `
    attachEvents()
  }

  function executeActiveProjectAction() {
    const data = getProjectData(activeIndex)
    if (data.project.collectionId) {
      const target = document.getElementById(data.project.collectionId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        history.pushState(null, '', `#${data.project.collectionId}`)
      }
    } else if (data.items.length) {
      openMedia(data.items)
    } else if (devMode) {
      openPicker()
    }
  }

  function attachEvents() {
    // Nav buttons
    const prevBtn = container.querySelector('.stage-nav-btn--prev')
    const nextBtn = container.querySelector('.stage-nav-btn--next')
    if (prevBtn) prevBtn.addEventListener('click', () => setActive(activeIndex - 1))
    if (nextBtn) nextBtn.addEventListener('click', () => setActive(activeIndex + 1))

    // Stage Monitor click
    const monitor = container.querySelector('.stage-monitor')
    if (monitor) {
      monitor.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="pick"]')) {
          if (devMode) openPicker()
          return
        }
        executeActiveProjectAction()
      })

      // Hover playback for active stage video
      const stageVideo = monitor.querySelector('.stage-media-video')
      if (stageVideo) {
        monitor.addEventListener('mouseenter', () => {
          stageVideo.play().catch(() => {})
        })
        monitor.addEventListener('mouseleave', () => {
          stageVideo.pause()
        })
      }
    }

    // Main action button click
    const actionBtn = container.querySelector('.stage-action-btn')
    if (actionBtn && actionBtn.tagName === 'BUTTON') {
      actionBtn.addEventListener('click', executeActiveProjectAction)
    }

    // Empty state dev pick button
    const pickBtn = container.querySelector('[data-action="pick"]')
    if (pickBtn) {
      pickBtn.addEventListener('click', () => {
        if (devMode) openPicker()
      })
    }

    // Strip cards selection & hover video playback
    const stripCards = container.querySelectorAll('.strip-card')
    stripCards.forEach(card => {
      const index = Number(card.dataset.index)

      card.addEventListener('click', () => {
        setActive(index)
      })

      // Hover video preview inside thumbnail card
      const stripVideo = card.querySelector('.strip-video-preview')
      if (stripVideo) {
        card.addEventListener('mouseenter', () => {
          stripVideo.play().catch(() => {})
        })
        card.addEventListener('mouseleave', () => {
          stripVideo.pause()
          stripVideo.currentTime = 0
        })
      }

      // Keyboard navigation
      card.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          setActive((index + 1) % projects.length)
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          setActive((index - 1 + projects.length) % projects.length)
        }
      })
    })
  }

  render()

  return {
    render,
    getSelection: () => [...rayaIds],
    setSelection(ids) {
      rayaIds = [...new Set(ids.map(String))].filter(id => byId.has(id))
      try { localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(rayaIds)) } catch { /* Preview works without storage */ }
      render()
    },
    setPicker(callback) { openPicker = callback }
  }
}
