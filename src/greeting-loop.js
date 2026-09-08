export function enableGreetingAutoplay(media, selector = '#greetings') {
  const section = document.querySelector(selector)
  const videos = new Set()
  const visibleVideos = new Set()
  const cardVideos = new WeakMap()

  function createVideo(card) {
    const existing = cardVideos.get(card)
    if (existing) return existing
    const item = media[Number(card.dataset.index)]
    const image = card.querySelector('img')
    if (!item || !image) return null
    const video = document.createElement('video')
    video.className = 'greeting-video'
    video.src = item.src
    video.poster = item.poster
    video.width = item.width
    video.height = item.height
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'metadata'
    video.tabIndex = -1
    video.setAttribute('aria-hidden', 'true')
    image.replaceWith(video)
    card.classList.add('greeting-autoplay')
    cardVideos.set(card, video)
    videos.add(video)
    return video
  }

  function syncVideo(video, visible) {
    if (visible && !document.hidden) video.play().catch(() => {})
    else video.pause()
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.isIntersecting ? createVideo(entry.target) : cardVideos.get(entry.target)
      if (!video) continue
      if (entry.isIntersecting) visibleVideos.add(video)
      else visibleVideos.delete(video)
      syncVideo(video, entry.isIntersecting)
    }
  }, { rootMargin: '200px 15%' })

  section.querySelectorAll('.comic-group .mix-card.video').forEach(card => observer.observe(card))
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause())
    else visibleVideos.forEach(video => syncVideo(video, true))
  })
}
