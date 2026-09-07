import './portfolio.css'
import media from './media.json'
import { enhanceDepth } from './depth.js'
import { createComicLoop } from './comic-loop.js'
import { enableVideoPreviews } from './video-previews.js'
import { enableStickerDragging } from './sticker-drag.js'

const collections = [
  { id: 'promo', label: 'Promo', categories: ['promo'] },
  { id: 'bulan-bintang-contest', label: 'Bulan Bintang Contest', categories: ['Bulan Bintang Contest'], logo: '/portfolio-media/bulan-bintang-logo.png' },
  { id: 'live-stickers', label: 'Live Stickers', categories: ['live deco sticker'] },
  { id: 'cny-stickers', label: 'CNY Stickers', categories: ['cnystickers'] },
  { id: 'raya-stickers', label: 'Raya Stickers', categories: ['rayastickers'] },
  { id: 'landscaping', label: '3D Landscaping', categories: ['3d landscaping sticker'] },
  { id: 'shop-deco', label: 'Shop Décor', categories: ['shop deco'] },
  { id: 'collaborations', label: 'Collaborations', categories: ['collab'] },
  { id: 'montages', label: 'Montages', categories: ['montage'] },
  { id: 'shoe-films', label: 'Shoe films', categories: ['Shoes Promo'] },
  { id: 'motion', label: 'Motion', categories: ['motion'] },
  { id: 'photography', label: 'Photography', categories: ['shoes photoshoot'] },
  { id: 'social-edits', label: 'Social edits', categories: ['meme'] },
  { id: 'comics', label: 'Comics', categories: ['comics'] },
  { id: 'ugc', label: 'UGC', categories: ['ugc edit'] },
  { id: 'live-clips', label: 'Live clips', categories: ['liveclipping'] },
  { id: 'greetings', label: 'Greetings', categories: ['Wishing'] }
].map(collection => ({ ...collection, items: media.filter(item => collection.categories.includes(item.category)) }))
const mix = collections.flatMap(collection => collection.items)
document.querySelector('.tape-label > span:nth-child(2)').textContent = `${mix.length} PIECES / KEEP SCROLLING ↓`
const names = { '014': 'New Arrivals', '034': '5.5 Sale', '008': 'Mother’s Day Sale', '009': 'Warehouse Sale', '007': 'Syukur Raya Sale' }
const title = item => names[item.id] || item.source.split('/').pop().replace(/\.[^.]+$/, '')
const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
function renderPiece(item) {
  const index = mix.indexOf(item)
  return `<button class="mix-card ${item.kind}" type="button" data-index="${index}" aria-label="${item.kind === 'video' ? 'Play' : 'Enlarge'} ${escape(title(item))}">
    <img src="${item.poster || item.src}" alt="${escape(title(item))}" width="${item.width}" height="${item.height}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" />
    ${item.kind === 'image' ? '<span class="card-action">↗ Take a closer look</span>' : ''}
  </button>`
}
const sectionNav = document.createElement('nav')
sectionNav.className = 'collection-nav'
sectionNav.setAttribute('aria-label', 'Artwork collections')
sectionNav.innerHTML = collections.map(collection => `<a href="#${collection.id}">${collection.label}</a>`).join('')
document.querySelector('#montage').before(sectionNav)
document.querySelector('#montage').innerHTML = collections.map((collection, index) => `
  <section id="${collection.id}" class="collection" aria-labelledby="${collection.id}-title">
    <div class="collection-bar"><span>${String(index + 1).padStart(2, '0')}</span>${collection.logo ? `<span class="collection-brand"><img src="${collection.logo}" alt="Bulan Bintang logo" width="120" height="94" /></span>` : ''}<h2 id="${collection.id}-title">${collection.label}</h2><span>${collection.items.length} ${collection.items.length === 1 ? 'piece' : 'pieces'}</span></div>
    <div class="collection-flow">${collection.items.map(renderPiece).join('')}</div>
  </section>`).join('')
let scrollFrame = 0
function highlightCollection() {
  scrollFrame = 0
  let current = collections[0].id
  for (const collection of collections) {
    if (document.getElementById(collection.id).getBoundingClientRect().top <= 150) current = collection.id
  }
  sectionNav.querySelectorAll('a').forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}
addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(highlightCollection)
}, { passive: true })
highlightCollection()

createComicLoop()
createComicLoop('#photography', 2)

const contestFlow = document.querySelector('#bulan-bintang-contest .collection-flow')
const contestFeatured = document.createElement('div')
contestFeatured.className = 'collection-flow contest-featured'
for (const filename of ['Design-01.jpg', 'Design-06.jpg']) {
  const index = mix.findIndex(item => item.category === 'Bulan Bintang Contest' && item.source.endsWith(`/${filename}`))
  const card = contestFlow.querySelector(`[data-index="${index}"]`)
  if (card) contestFeatured.append(card)
}
// Build the smaller loop before inserting the featured row above it.
createComicLoop('#bulan-bintang-contest')
contestFlow.before(contestFeatured)
const contestModel = document.createElement('figure')
contestModel.className = 'contest-model'
contestModel.innerHTML = `<model-viewer src="/portfolio-media/kotak.glb" alt="Bulan Bintang contest packaging in 3D" camera-controls touch-action="pan-y" camera-orbit="30deg 75deg auto" shadow-intensity="1" exposure="1" interaction-prompt="none"><span slot="poster" class="model-status">Loading 3D artwork…</span></model-viewer><figcaption>Drag to explore · Pinch to zoom</figcaption>`
contestFeatured.before(contestModel)
const kotak = contestModel.querySelector('model-viewer')
kotak.setAttribute('rotation-per-second', '6deg')
kotak.setAttribute('auto-rotate-delay', '2000')
const modelReducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const syncModelMotion = () => kotak.toggleAttribute('auto-rotate', !modelReducedMotion.matches && document.body.classList.contains('depth-on'))
modelReducedMotion.addEventListener('change', syncModelMotion)
new MutationObserver(syncModelMotion).observe(document.body, { attributes: true, attributeFilter: ['class'] })
syncModelMotion()
const modelObserver = new IntersectionObserver(async entries => {
  if (!entries.some(entry => entry.isIntersecting)) return
  modelObserver.disconnect()
  const model = contestModel.querySelector('model-viewer')
  const failed = () => { contestModel.querySelector('.model-status').textContent = '3D preview unavailable'; }
  model.addEventListener('error', failed)
  try { await import('@google/model-viewer') } catch { failed() }
}, { rootMargin: '300px' })
modelObserver.observe(contestModel)
for (const id of ['live-stickers', 'cny-stickers', 'raya-stickers']) {
  document.getElementById(id).classList.add('sticker-collection')
  enableStickerDragging(`#${id}`)
}
enhanceDepth()
if (import.meta.env.DEV) import('./sheen-dev.js').then(({ createSheenDevPanel }) => createSheenDevPanel())
const viewer = document.querySelector('#media-viewer')
const stopPreview = enableVideoPreviews(mix)
const content = document.querySelector('#viewer-content')
let currentIndex = 0
function showMedia(index) {
  stopPreview()
  content.querySelector('video')?.pause()
  content.classList.remove('image-zoomed')
  currentIndex = (index + mix.length) % mix.length
  const item = mix[currentIndex]
  document.querySelector('#viewer-position').textContent = `${currentIndex + 1} / ${mix.length}`
  content.replaceChildren()
  const element = document.createElement(item.kind === 'video' ? 'video' : 'img')
  if (item.kind === 'video') {
    element.controls = true
    element.playsInline = true
    element.preload = 'metadata'
    element.poster = item.poster
    element.src = `${item.src}?audio=1`
    element.setAttribute('aria-label', `Film ${currentIndex + 1} of ${mix.length}`)
  } else {
    element.src = item.src
    element.alt = `Artwork ${currentIndex + 1} of ${mix.length}`
    element.tabIndex = 0
    element.setAttribute('role', 'button')
    element.setAttribute('aria-label', 'Zoom in on artwork')
    element.setAttribute('aria-pressed', 'false')
    element.title = 'Click to zoom in'
    element.draggable = false
    function toggleZoom(event) {
      const zoomed = content.classList.contains('image-zoomed')
      const rect = element.getBoundingClientRect()
      const x = event.type === 'click' && event.detail ? (event.clientX - rect.left) / rect.width : 0.5
      const y = event.type === 'click' && event.detail ? (event.clientY - rect.top) / rect.height : 0.5
      content.classList.toggle('image-zoomed', !zoomed)
      if (zoomed) {
        element.style.removeProperty('width')
        element.style.removeProperty('height')
        content.scrollTo(0, 0)
      } else {
        element.style.width = `${rect.width * 2.5}px`
        element.style.height = `${rect.height * 2.5}px`
        content.scrollTo(Math.max(0, x * rect.width * 2.5 - content.clientWidth / 2), Math.max(0, y * rect.height * 2.5 - content.clientHeight / 2))
      }
      element.setAttribute('aria-pressed', String(!zoomed))
      element.setAttribute('aria-label', zoomed ? 'Zoom in on artwork' : 'Zoom out of artwork')
      element.title = zoomed ? 'Click to zoom in' : 'Click to zoom out · Scroll to explore'
    }
    element.addEventListener('click', toggleZoom)
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleZoom(event) }
    })
  }
  content.append(element)
  if (!viewer.open) viewer.showModal()
  if (item.kind === 'video') element.play().catch(() => { /* Native controls remain available. */ })
}
document.querySelector('#montage').addEventListener('click', event => {
  const button = event.target.closest('[data-index]')
  if (button) showMedia(Number(button.dataset.index))
})
document.querySelector('#viewer-close').addEventListener('click', () => viewer.close())
document.querySelector('#previous-media').addEventListener('click', () => showMedia(currentIndex - 1))
document.querySelector('#next-media').addEventListener('click', () => showMedia(currentIndex + 1))
viewer.addEventListener('close', () => { content.querySelector('video')?.pause(); content.replaceChildren(); content.classList.remove('image-zoomed') })
viewer.addEventListener('click', event => { if (event.target === viewer || event.target === content) viewer.close() })
viewer.addEventListener('keydown', event => {
  if (event.target.tagName === 'VIDEO') return
  if (event.key === 'ArrowRight') { event.preventDefault(); showMedia(currentIndex + 1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showMedia(currentIndex - 1) }
})

const projects = [
  ['Frog Online', '/frog.svg', 'https://frog.muazaoski.online', 'PLAY', 'An online game from the library.'],
  ['Workout', '/workout.svg', 'https://workout.muazaoski.online', 'FITNESS', 'A dedicated space for workouts.'],
  ['Size Chart', '/sizechart.svg', 'https://chart.muazaoski.online', 'TOOLS', 'A size chart tool, ready in your browser.'],
  ['Finance', '/financeme-02.svg', 'https://financeme.cc', 'FINANCE', 'A finance app in the collection.'],
  ['OCR', '/ocr.svg', 'https://ocr.muazaoski.online', 'TOOLS', 'An optical character recognition tool.']
]

document.querySelector('#projects').innerHTML = projects.map(([name, icon, url, category, description], index) => `
  <a class="project" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${name} (new tab)">
    <div class="project-top"><img src="${icon}" alt="" width="64" height="64" /><span class="number">0${index + 1}</span></div>
    <p class="category">${category}</p>
    <h3>${name}<span aria-hidden="true">↗</span></h3>
    <p class="description">${description}</p>
    <span class="visit">Open project <span aria-hidden="true">→</span></span>
  </a>
`).join('')

