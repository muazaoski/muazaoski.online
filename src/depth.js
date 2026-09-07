import { createCardShader } from './card-shader.js'
import { createScrollAccents } from './scroll-accents.js'

export function enhanceDepth() {
  const accents = createScrollAccents()
  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'depth-toggle'
  document.querySelector('.tape-label').append(toggle)

  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const pointer = matchMedia('(hover: hover) and (pointer: fine)')
  let enabled = !reduced.matches
  let activeCard = null
  let frame = 0
  let pending = null
  let shader = null
  function resetCard() {
    shader?.clear()
    if (!activeCard) return
    activeCard.style.removeProperty('--tilt-x')
    activeCard.style.removeProperty('--tilt-y')
    activeCard.style.removeProperty('--skew')
    activeCard.style.removeProperty('--glow-x')
    activeCard.style.removeProperty('--glow-y')
    activeCard.classList.remove('tilting')
    activeCard = null
  }
  function sync() {
    document.body.classList.toggle('depth-on', enabled)
    accents.setEnabled(enabled && !reduced.matches)
    toggle.setAttribute('aria-pressed', String(enabled))
    toggle.textContent = enabled ? '3D motion on · Pause' : '3D motion off · Enable'
    resetCard()
  }
  toggle.addEventListener('click', () => { enabled = !enabled; sync() })
  reduced.addEventListener('change', () => { enabled = !reduced.matches; sync() })
  sync()
  const grid = document.querySelector('#montage')
  grid.addEventListener('pointermove', event => {
    if (!enabled || !pointer.matches || event.pointerType === 'touch') return
    const card = event.target.closest('.mix-card')
    if (!card || card.classList.contains('sticker-dragging')) { resetCard(); return }
    if (activeCard !== card) { resetCard(); activeCard = card; card.classList.add('tilting') }
    pending = { card, x: event.clientX, y: event.clientY }
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      if (!enabled || activeCard !== pending.card) return
      const rect = pending.card.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (pending.x - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (pending.y - rect.top) / rect.height))
      pending.card.style.setProperty('--tilt-x', `${(0.5 - y) * 24}deg`)
      pending.card.style.setProperty('--tilt-y', `${(x - 0.5) * 24}deg`)
      pending.card.style.setProperty('--skew', `${(x - 0.5) * 4}deg`)
      pending.card.style.setProperty('--glow-x', `${x * 100}%`)
      pending.card.style.setProperty('--glow-y', `${y * 100}%`)
      shader ||= createCardShader()
      shader.draw(pending.card, x, y)
    })
  })
  grid.addEventListener('pointerleave', resetCard)
  grid.addEventListener('focusout', resetCard)
  grid.addEventListener('click', event => {
    if (event.target.closest('.mix-card')) resetCard()
  })
}
