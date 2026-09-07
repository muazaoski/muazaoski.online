export function enableGreetingAutoplay(media, selector = '#greetings') {
  const section = document.querySelector(selector)
  const videos = []

  section.querySelectorAll('.comic-group .mix-card.video').forEach(card => {
    const item = media[Number(card.dataset.index)]
    if (!item) return
    card.classList.add('greeting-autoplay')
    const image = card.querySelector('img')
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
    video.autoplay = true
    video.preload = 'metadata'
    video.tabIndex = -1
    video.setAttribute('aria-hidden', 'true')
    image.replaceWith(video)
    videos.push(video)
  })

  let visible = false
  function sync() {
    for (const video of videos) {
      if (visible && !document.hidden) video.play().catch(() => {})
      else video.pause()
    }
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting
    sync()
  }, { rootMargin: '150px' }).observe(section)
  document.addEventListener('visibilitychange', sync)
}
