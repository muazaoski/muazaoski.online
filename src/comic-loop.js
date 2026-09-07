export function createComicLoop(selector = '#comics', rows = 1) {
  const section = document.querySelector(selector)
  const viewport = section.querySelector('.collection-flow')
  viewport.classList.add('comic-viewport')
  viewport.setAttribute('aria-label', selector === '#comics' ? 'Looping comic strip' : selector === '#photography' ? 'Looping photography, two rows' : selector === '#nft-vertikal' ? 'Looping NFT animations, two rows' : 'Looping contest artwork')
  const cards = [...viewport.children]
  viewport.replaceChildren()
  for (let row = 0; row < rows; row++) {
  const lane = document.createElement('div')
  lane.className = 'comic-lane'
  const track = document.createElement('div')
  track.className = 'comic-track'
  const group = document.createElement('div')
  group.className = 'comic-group'
  cards.slice(Math.ceil(cards.length * row / rows), Math.ceil(cards.length * (row + 1) / rows)).forEach(card => group.append(card))
  const duplicate = group.cloneNode(true)
  duplicate.classList.add('comic-copy')
  duplicate.setAttribute('aria-hidden', 'true')
  duplicate.querySelectorAll('button').forEach(button => { button.tabIndex = -1 })
  track.append(group, duplicate)
  lane.append(track)
  viewport.append(lane)
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  function sync() {
    section.classList.toggle('comic-paused', reduced.matches)
  }
  reduced.addEventListener('change', sync)
  sync()
  new IntersectionObserver(entries => {
    section.classList.toggle('comic-offscreen', !entries[0].isIntersecting)
  }, { threshold: 0 }).observe(viewport)
  document.addEventListener('visibilitychange', () => {
    section.classList.toggle('comic-hidden', document.hidden)
  })
}
