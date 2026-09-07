export function enableVideoPreviews(media) {
  const grid = document.querySelector('#montage')
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let video = null
  let activeCard = null
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.target === activeCard && !entry.isIntersecting)) stop()
  })
  function stop() {
    if (!activeCard) return
    observer.unobserve(activeCard)
    activeCard.classList.remove('preview-playing')
    activeCard = null
    video.pause()
    video.removeAttribute('src')
    video.load()
    video.remove()
  }
  grid.addEventListener('pointerover', event => {
    if (!finePointer.matches || reduced.matches || event.pointerType === 'touch' || document.querySelector('#media-viewer').open) return
    const card = event.target.closest('.mix-card.video')
    if (!card || card === activeCard) return
    stop()
    const item = media[Number(card.dataset.index)]
    if (!item || item.kind !== 'video') return
    video ||= document.createElement('video')
    video.className = 'hover-preview'
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.playsInline = true
    video.tabIndex = -1
    video.setAttribute('aria-hidden', 'true')
    video.poster = item.poster
    video.src = `${item.src}?audio=1`
    activeCard = card
    card.append(video)
    card.classList.add('preview-playing')
    observer.observe(card)
    video.play().catch(() => { if (activeCard === card) stop() })
  })
  grid.addEventListener('pointerout', event => {
    if (activeCard && !activeCard.contains(event.relatedTarget)) stop()
  })
  grid.addEventListener('pointerleave', stop)
  window.addEventListener('blur', stop)
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop() })
  reduced.addEventListener('change', stop)
  finePointer.addEventListener('change', stop)
  return stop
}
