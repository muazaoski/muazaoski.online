export function enableStickerDragging(selector = '#live-stickers') {
  const stage = document.querySelector(`${selector} .collection-flow`)
  const positions = new Map()
  let drag = null
  let suppressClick = false
  let layer = 10

  function move(card, x, y) {
    // Keep the artwork reachable inside its composition, including after resizing.
    x = Math.max(-card.offsetLeft, Math.min(stage.clientWidth - card.offsetLeft - card.offsetWidth, x))
    y = Math.max(-card.offsetTop, Math.min(stage.clientHeight - card.offsetTop - card.offsetHeight, y))
    positions.set(card, { x, y })
    card.style.setProperty('--drag-x', `${x}px`)
    card.style.setProperty('--drag-y', `${y}px`)
  }

  stage.querySelectorAll('.mix-card').forEach(card => {
    card.querySelector('img').draggable = false
    card.title = 'Drag to rearrange · Click to enlarge · Arrow keys to move'
  })
  stage.addEventListener('pointerdown', event => {
    const card = event.target.closest('.mix-card')
    if (!card || !event.isPrimary || event.button !== 0) return
    suppressClick = false
    drag = { card, id: event.pointerId, startX: event.clientX, startY: event.clientY,
      ...positions.get(card) || { x: 0, y: 0 }, moved: false }
    card.setPointerCapture(event.pointerId)
  })
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < 6) return
    if (!drag.moved) {
      drag.moved = true
      drag.card.classList.add('sticker-dragging')
      drag.card.style.zIndex = String(++layer)
    }
    move(drag.card, drag.x + dx, drag.y + dy)
  })
  function finish(event) {
    if (!drag || event.pointerId !== drag.id) return
    suppressClick = drag.moved
    const { card, id } = drag
    drag = null
    card.classList.remove('sticker-dragging')
    if (card.hasPointerCapture(id)) card.releasePointerCapture(id)
  }
  stage.addEventListener('pointerup', finish)
  stage.addEventListener('pointercancel', finish)
  stage.addEventListener('lostpointercapture', finish)
  stage.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return
    suppressClick = false
    event.preventDefault()
    event.stopImmediatePropagation()
  }, true)
  stage.addEventListener('keydown', event => {
    const card = event.target.closest('.mix-card')
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]
    if (!card || !direction) return
    event.preventDefault()
    const { x, y } = positions.get(card) || { x: 0, y: 0 }
    const step = event.shiftKey ? 30 : 10
    card.style.zIndex = String(++layer)
    move(card, x + direction[0] * step, y + direction[1] * step)
  })
  let previousWidth = 0
  function layout() {
    if (stage.clientWidth === previousWidth) return
    previousWidth = stage.clientWidth
    const columns = previousWidth < 600 ? 2 : 4
    const rowHeight = previousWidth < 600 ? 230 : 280
    const cards = [...stage.querySelectorAll('.mix-card')]
    stage.style.height = `${Math.ceil(cards.length / columns) * rowHeight + 40}px`
    cards.forEach((card, index) => {
      const img = card.querySelector('img')
      const ratio = Number(img.getAttribute('width')) / Number(img.getAttribute('height'))
      const cellWidth = previousWidth / columns
      const width = Math.min(cellWidth * 0.93, rowHeight * 0.98 * ratio)
      const row = Math.floor(index / columns)
      const column = index % columns
      const countInRow = Math.min(columns, cards.length - row * columns)
      const inset = (columns - countInRow) * cellWidth / 2
      card.style.setProperty('--sticker-x', `${inset + column * cellWidth + (cellWidth - width) / 2}px`)
      card.style.setProperty('--sticker-y', `${20 + row * rowHeight + (index % 3) * 9}px`)
      card.style.setProperty('--sticker-width', `${width}px`)
      card.style.setProperty('--sticker-angle', `${[-11, 8, -5, 12, 4, -9][index % 6]}deg`)
    })
    positions.forEach(({ x, y }, card) => move(card, x, y))
  }
  new ResizeObserver(layout).observe(stage)
  layout()
}
