/**
 * 3D Isometric Sticker Room Simulator
 * Interactive diorama playset for the Kasut U 3D isometric store
 */

const DEFAULT_STICKERS = [
  // Centerpiece
  { id: 'giant-shoe', name: 'Giant G-Max Sneaker', file: 'asset-453.webp', x: 41.5, y: 47.5, w: 14.5, h: 17.5 },

  // Architecture & Back Shelves
  { id: 'bnc-shelf', name: 'BNC Wall Shelf', file: 'asset-335.webp', x: 40.2, y: 22.8, w: 12.8, h: 25.5 },
  { id: 'eviea-shelf', name: 'Eviea Wall Shelf', file: 'asset-341.webp', x: 50.4, y: 22.8, w: 12.8, h: 25.5 },
  { id: 'orange-table-1', name: 'Display Table (Left)', file: 'asset-363.webp', x: 43.0, y: 39.0, w: 8.8, h: 14.8 },
  { id: 'orange-table-2', name: 'Display Table (Right)', file: 'asset-364.webp', x: 50.4, y: 39.0, w: 8.8, h: 14.8 },

  // Left Wall Posters & Displays
  { id: 'poster-bnc-sit', name: 'BNC Models Poster', file: 'asset-442.webp', x: 21.5, y: 30.5, w: 8.5, h: 22.5, isWall: true },
  { id: 'poster-bnc-stand', name: 'BNC Shoes Poster', file: 'asset-441.webp', x: 29.5, y: 25.5, w: 8.5, h: 22.5, isWall: true },

  // Right Wall Poster & Van
  { id: 'poster-gmax', name: 'G-Max Kids Shoes Poster', file: 'asset-320.webp', x: 68.5, y: 25.5, w: 10.5, h: 15.0, isWall: true },
  { id: 'toy-van', name: 'Yellow School Van', file: 'asset-394.webp', x: 78.5, y: 32.5, w: 5.8, h: 8.8 },

  // Cashier Counter & Cashier
  { id: 'cashier-desk', name: 'Kasut U Cashier Counter', file: 'asset-388.webp', x: 15.0, y: 53.0, w: 9.5, h: 13.0 },
  { id: 'char-cashier', name: 'Cashier', file: 'asset-340.webp', x: 13.8, y: 49.5, w: 5.2, h: 11.5 },
  { id: 'char-shopper-desk-1', name: 'Shopper at Counter', file: 'asset-378.webp', x: 20.0, y: 55.5, w: 6.0, h: 11.2 },
  { id: 'char-shopper-desk-2', name: 'Girl at Counter', file: 'asset-350.webp', x: 23.5, y: 57.5, w: 5.5, h: 11.0 },

  // Right Floor Racks & Displays
  { id: 'black-tower-1', name: 'Shoe Display Tower (1)', file: 'asset-440.webp', x: 63.2, y: 44.5, w: 6.6, h: 16.0 },
  { id: 'black-tower-2', name: 'Shoe Display Tower (2)', file: 'asset-451.webp', x: 71.0, y: 50.8, w: 6.6, h: 16.0 },
  { id: 'hanging-rack', name: 'Shoe Rack Stand', file: 'asset-436.webp', x: 78.5, y: 41.5, w: 4.8, h: 15.0 },

  // Benches
  { id: 'bench-left', name: 'Blue Bench (Center)', file: 'asset-456.webp', x: 38.0, y: 49.8, w: 5.2, h: 4.8 },
  { id: 'bench-right', name: 'Blue Bench (Right)', file: 'asset-456.webp', x: 62.5, y: 55.0, w: 5.2, h: 4.8 },
  { id: 'char-sitting', name: 'Customer Trying Shoes', file: 'asset-334.webp', x: 63.5, y: 52.2, w: 6.5, h: 10.0 },

  // Center Shoppers
  { id: 'char-couple-boy', name: 'Customer Browsing Bags', file: 'asset-349.webp', x: 47.5, y: 32.0, w: 5.5, h: 11.5 },
  { id: 'char-couple-girl', name: 'Customer in Coat', file: 'asset-348.webp', x: 43.5, y: 32.5, w: 5.5, h: 11.5 },
  { id: 'char-boy-shoe', name: 'Boy Touching Sneaker', file: 'asset-346.webp', x: 50.5, y: 55.8, w: 4.8, h: 9.2 },
  { id: 'char-hijab-shoe', name: 'Girl in Hijab', file: 'asset-347.webp', x: 36.2, y: 56.5, w: 5.5, h: 11.2 },

  // Foreground Pedestals & Backpacks
  { id: 'pedestal-left', name: 'Display Pedestal (Left)', file: 'asset-439.webp', x: 35.5, y: 63.5, w: 8.6, h: 8.2 },
  { id: 'pedestal-right', name: 'Display Pedestal (Right)', file: 'asset-376.webp', x: 51.5, y: 62.5, w: 8.6, h: 9.6 },
  { id: 'bag-blue', name: 'Blue Backpack', file: 'asset-404.webp', x: 40.5, y: 64.0, w: 2.7, h: 2.7 },
  { id: 'bag-pink', name: 'Pink Backpack', file: 'asset-447.webp', x: 44.5, y: 64.5, w: 2.7, h: 2.7 },
  { id: 'bag-yellow', name: 'Yellow Backpack', file: 'asset-401.webp', x: 53.5, y: 63.5, w: 2.7, h: 2.7 },

  // Foreground Customers
  { id: 'char-dad-green', name: 'Dad with Child', file: 'asset-410.webp', x: 32.5, y: 62.0, w: 5.8, h: 11.8 },
  { id: 'char-kid-green', name: 'Child in Teal', file: 'asset-411.webp', x: 36.5, y: 66.5, w: 4.2, h: 8.5 },
  { id: 'char-dad-front', name: 'Family Walking to Exit', file: 'asset-362.webp', x: 44.5, y: 71.0, w: 7.5, h: 11.5 },

  // Props
  { id: 'giant-pencil', name: 'Giant Pencil', file: 'asset-400.webp', x: 86.2, y: 50.0, w: 1.8, h: 11.0 },
  { id: 'welcome-mat', name: 'Welcome Mat', file: 'asset-438.webp', x: 49.5, y: 79.5, w: 4.2, h: 3.5 },
  { id: 'balloon-yellow-1', name: 'G-Max Balloon (Yellow)', file: 'asset-395.webp', x: 23.5, y: 47.0, w: 3.2, h: 11.8 },
  { id: 'balloon-blue-1', name: 'G-Max Balloon (Blue)', file: 'asset-389.webp', x: 58.5, y: 48.0, w: 3.2, h: 11.8 },
  { id: 'balloon-yellow-2', name: 'G-Max Balloon (Gold)', file: 'asset-397.webp', x: 68.5, y: 55.5, w: 3.2, h: 11.8 }
]

// Extra stickers available in the drawer to drag into the room
const DRAWER_ITEMS = [
  { name: 'Shopper with Box', file: 'asset-330.webp', w: 7.0, h: 13.5 },
  { name: 'Hijab Customer', file: 'asset-382.webp', w: 7.0, h: 9.5 },
  { name: 'Active Boy', file: 'asset-344.webp', w: 4.2, h: 6.4 },
  { name: 'Happy Kid', file: 'asset-351.webp', w: 4.2, h: 6.4 },
  { name: 'Shopper Looking Right', file: 'asset-343.webp', w: 7.5, h: 10.8 },
  { name: 'Walking Customer', file: 'asset-452.webp', w: 5.6, h: 10.8 },
  { name: 'Teal Backpack', file: 'asset-399.webp', w: 3.2, h: 3.2 },
  { name: 'Black Backpack', file: 'asset-402.webp', w: 3.2, h: 3.2 },
  { name: 'Shoe Box', file: 'asset-386.webp', w: 5.2, h: 5.5 },
  { name: 'Blue G-Max Balloon', file: 'asset-384.webp', w: 3.2, h: 11.8 },
  { name: 'Yellow G-Max Balloon', file: 'asset-396.webp', w: 3.2, h: 11.8 },
  { name: 'Mirror Stand', file: 'asset-337.webp', w: 3.5, h: 4.8 }
]

function calculateDepthZIndex(yPercent, hPercent, isWall = false) {
  if (isWall) return 10
  // Isometric depth corresponds to the feet/bottom contact point on the floor
  const footY = yPercent + (hPercent || 0)
  return Math.max(20, Math.min(9990, Math.round(footY * 100)))
}

export function initRoomSimulator(sectionSelector = '#landscaping') {
  const section = document.querySelector(sectionSelector)
  if (!section) return

  // Replace default flow with interactive isometric stage
  const flow = section.querySelector('.collection-flow')
  if (!flow) return

  // Hide the original cards but keep them accessible for the lightbox viewer
  const originalCards = [...flow.querySelectorAll('.mix-card')]
  originalCards.forEach(c => c.style.display = 'none')

  // Build the simulator interface
  const simWrapper = document.createElement('div')
  simWrapper.className = 'room-simulator'
  simWrapper.innerHTML = `
    <div class="room-sim-header">
      <div class="room-sim-info">
        <span class="room-sim-badge">INTERACTIVE SIMULATION</span>
        <p class="room-sim-desc">Click or touch any character, furniture, or sneaker to rearrange the 3D isometric shop. Drag items from the tray below to populate the store!</p>
      </div>
      <div class="room-sim-actions">
        <button type="button" class="room-sim-btn room-sim-reset" aria-label="Reset stickers to default positions">
          <span aria-hidden="true">↺</span> Reset Room
        </button>
        <button type="button" class="room-sim-btn room-sim-view-artwork" aria-label="View original artwork">
          <span aria-hidden="true">🖼</span> View Final Art
        </button>
      </div>
    </div>

    <div class="room-stage-container">
      <div class="room-stage" style="aspect-ratio: 4 / 3;">
        <img class="room-stage-bg" src="/3d-stickers/room-base.webp" alt="3D Isometric Room Base" draggable="false" />
        <div class="room-stickers-layer"></div>
      </div>
    </div>

    <div class="room-tray">
      <div class="room-tray-label">
        <span>STICKER TRAY</span>
        <small>Click to add onto floor</small>
      </div>
      <div class="room-tray-items"></div>
    </div>
  `

  flow.before(simWrapper)

  const stage = simWrapper.querySelector('.room-stage')
  const layer = simWrapper.querySelector('.room-stickers-layer')
  const trayItemsContainer = simWrapper.querySelector('.room-tray-items')
  const resetBtn = simWrapper.querySelector('.room-sim-reset')
  const viewArtBtn = simWrapper.querySelector('.room-sim-view-artwork')

  const stickersMap = new Map()
  let nextExtraId = 1

  function createStickerElement(item, isDefault = true) {
    const el = document.createElement('div')
    el.className = `room-sticker${isDefault ? ' is-default' : ' is-custom'}`
    el.dataset.stickerId = item.id
    el.title = `${item.name} · Drag anywhere`
    el.tabIndex = 0

    el.style.left = `${item.x}%`
    el.style.top = `${item.y}%`
    el.style.width = `${item.w}%`
    el.style.height = item.h ? `${item.h}%` : 'auto'
    el.style.zIndex = calculateDepthZIndex(item.y, item.h, item.isWall)

    el.innerHTML = `
      <img src="/3d-stickers/sprites/${item.file}" alt="${item.name}" draggable="false" decoding="async" fetchpriority="high" />
      <span class="sticker-highlight"></span>
    `

    // Drag handling via Pointer Events
    let activeDrag = null

    el.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return
      event.preventDefault()
      event.stopPropagation()

      const rect = stage.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()

      activeDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeftPercent: item.x,
        startTopPercent: item.y,
        stageW: rect.width,
        stageH: rect.height,
        offsetX: event.clientX - elRect.left,
        offsetY: event.clientY - elRect.top
      }

      el.setPointerCapture(event.pointerId)
      el.classList.add('is-dragging')
      el.style.zIndex = '99999'
    })

    el.addEventListener('pointermove', event => {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return
      event.preventDefault()

      const dx = event.clientX - activeDrag.startX
      const dy = event.clientY - activeDrag.startY

      const dxPercent = (dx / activeDrag.stageW) * 100
      const dyPercent = (dy / activeDrag.stageH) * 100

      let newX = activeDrag.startLeftPercent + dxPercent
      let newY = activeDrag.startTopPercent + dyPercent

      // Keep within bounds
      newX = Math.max(1, Math.min(99 - item.w, newX))
      newY = Math.max(1, Math.min(99 - (item.h || 10), newY))

      el.style.left = `${newX}%`
      el.style.top = `${newY}%`
      item.x = newX
      item.y = newY
    })

    function endDrag(event) {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return
      el.classList.remove('is-dragging')
      el.style.zIndex = calculateDepthZIndex(item.y, item.h, item.isWall)
      if (el.hasPointerCapture(activeDrag.pointerId)) {
        el.releasePointerCapture(activeDrag.pointerId)
      }
      activeDrag = null
    }

    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)

    // Keyboard accessibility (Arrow keys)
    el.addEventListener('keydown', event => {
      const step = event.shiftKey ? 3.0 : 1.0
      let moved = false
      if (event.key === 'ArrowLeft') { item.x = Math.max(1, item.x - step); moved = true }
      if (event.key === 'ArrowRight') { item.x = Math.min(99 - item.w, item.x + step); moved = true }
      if (event.key === 'ArrowUp') { item.y = Math.max(1, item.y - step); moved = true }
      if (event.key === 'ArrowDown') { item.y = Math.min(99 - (item.h || 10), item.y + step); moved = true }
      if (moved) {
        event.preventDefault()
        el.style.left = `${item.x}%`
        el.style.top = `${item.y}%`
        el.style.zIndex = calculateDepthZIndex(item.y, item.h, item.isWall)
      }
    })

    return el
  }

  // Populate default room stickers
  DEFAULT_STICKERS.forEach(item => {
    const copy = { ...item }
    const el = createStickerElement(copy, true)
    layer.appendChild(el)
    stickersMap.set(item.id, { el, item: copy, defaultX: item.x, defaultY: item.y })
  })

  // Populate drawer
  DRAWER_ITEMS.forEach(drawerItem => {
    const itemCard = document.createElement('button')
    itemCard.type = 'button'
    itemCard.className = 'room-tray-card'
    itemCard.title = `Add ${drawerItem.name} to room`
    itemCard.innerHTML = `
      <img src="/3d-stickers/sprites/${drawerItem.file}" alt="${drawerItem.name}" decoding="async" />
      <span>${drawerItem.name}</span>
    `

    itemCard.addEventListener('click', () => {
      const id = `extra-${nextExtraId++}`
      // Drop in center floor with slight random offset
      const x = 45 + (Math.random() * 16 - 8)
      const y = 52 + (Math.random() * 16 - 8)
      const newItem = {
        id,
        name: drawerItem.name,
        file: drawerItem.file,
        x,
        y,
        w: drawerItem.w || 6.0,
        h: drawerItem.h || 10.0
      }
      const el = createStickerElement(newItem, false)
      el.classList.add('is-newly-added')
      layer.appendChild(el)
      setTimeout(() => el.classList.remove('is-newly-added'), 400)
    })

    trayItemsContainer.appendChild(itemCard)
  })

  // Reset Button
  resetBtn.addEventListener('click', () => {
    // Remove custom spawned stickers
    layer.querySelectorAll('.room-sticker.is-custom').forEach(el => el.remove())

    // Smoothly animate default stickers back to position
    stickersMap.forEach(({ el, item, defaultX, defaultY }) => {
      el.classList.add('is-resetting')
      item.x = defaultX
      item.y = defaultY
      el.style.left = `${defaultX}%`
      el.style.top = `${defaultY}%`
      el.style.zIndex = calculateDepthZIndex(defaultY, item.h, item.isWall)
      setTimeout(() => el.classList.remove('is-resetting'), 600)
    })
  })

  // View Original Artwork
  viewArtBtn.addEventListener('click', () => {
    const finalArtworkCard = originalCards.find(c => c.dataset.workId === '077') || originalCards[0]
    if (finalArtworkCard) {
      finalArtworkCard.click()
    } else {
      window.open('/portfolio-media/077.webp', '_blank')
    }
  })
}
