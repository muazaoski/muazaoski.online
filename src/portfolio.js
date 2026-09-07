import './portfolio.css'
import media from './media.json'
import { enhanceDepth } from './depth.js'
import { createComicLoop } from './comic-loop.js'
import { enableVideoPreviews } from './video-previews.js'
import { enableStickerDragging } from './sticker-drag.js'
import { enableGreetingAutoplay } from './greeting-loop.js'
import { createCardShader } from './card-shader.js'

const themeToggle = document.querySelector('#theme-toggle')
const themeLabel = themeToggle.querySelector('.theme-label')
function syncThemeToggle() {
  const dark = document.documentElement.dataset.theme === 'dark'
  themeToggle.setAttribute('aria-pressed', String(dark))
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`)
  themeLabel.textContent = dark ? 'Light' : 'Dark'
}
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('portfolio-theme', next) } catch { /* Theme still works for this visit. */ }
  syncThemeToggle()
})
syncThemeToggle()

const aboutPortrait = document.querySelector('.about-portrait')
const aboutPerson = aboutPortrait.querySelector('.about-person')
const aboutPointer = matchMedia('(hover: hover) and (pointer: fine)')
const aboutReducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
let aboutShader = null
aboutPortrait.addEventListener('pointermove', event => {
  if (!document.body.classList.contains('depth-on') || !aboutPointer.matches || aboutReducedMotion.matches || event.pointerType === 'touch') return
  const rect = aboutPerson.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
  aboutShader ||= createCardShader()
  aboutShader.draw(aboutPerson, x, y)
})
aboutPortrait.addEventListener('pointerleave', () => aboutShader?.clear())
new MutationObserver(() => { if (!document.body.classList.contains('depth-on')) aboutShader?.clear() }).observe(document.body, { attributes: true, attributeFilter: ['class'] })

const collections = [
  { id: 'promo', label: 'Promo', categories: ['promo'] },
  { id: 'bulan-bintang-contest', label: 'Bulan Bintang Contest', categories: ['Bulan Bintang Contest'], logo: '/portfolio-media/bulan-bintang-logo.png' },
  { id: 'maybank-tiger', label: 'Maybank MyTiger', categories: ['Maybank Tiger'] },
  { id: 'vartcomp', label: 'vArtComp', categories: ['vartcomp'] },
  { id: 'visit-johor', label: 'Visit Johor Mascot', categories: ['Visit Johor Mascott', 'Character Trace back + add outfit + pose', 'add more pose'], logo: '/portfolio-media/visit-johor-logo.webp', logoAlt: 'Visit Johor logo' },
  { id: 'nft-vertikal', label: 'NFT · Vertikal', categories: ['NFT Project - Vertikal'] },
  { id: 'sampul-raya', label: 'Sampul Raya', categories: ['sampul raya design'] },
  { id: 'van-livery', label: 'Van Livery', categories: ['van livery design', '4x'] },
  { id: 'live-stickers', label: 'Live Stickers', categories: ['live deco sticker'] },
  { id: 'cny-stickers', label: 'CNY Stickers', categories: ['cnystickers'] },
  { id: 'raya-stickers', label: 'Raya Stickers', categories: ['rayastickers'] },
  { id: 'landscaping', label: '3D Landscaping', categories: ['3d landscaping sticker'] },
  { id: 'shop-deco', label: 'Shop Décor', categories: ['shop deco'] },
  { id: 'wedding-hafiz', label: 'Wedding Film', categories: ['wedding hafiz'] },
  { id: 'montages', label: 'Montages', categories: ['montage', 'collab'] },
  { id: 'shoe-films', label: 'Shoe films', categories: ['Shoes Promo'] },
  { id: 'motion', label: 'Motion + Wishing', categories: ['motion'] },
  { id: 'photography', label: 'Photography', categories: ['shoes photoshoot'] },
  { id: 'social-edits', label: 'Social edits', categories: ['meme'] },
  { id: 'comics', label: 'Comics', categories: ['comics'] },
  { id: 'ugc', label: 'UGC', categories: ['ugc edit'] },
  { id: 'live-clips', label: 'Live clips', categories: ['liveclipping'] }
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
    <div class="collection-bar"><span>${String(index + 1).padStart(2, '0')}</span>${collection.logo ? `<span class="collection-brand"><img src="${collection.logo}" alt="${collection.logoAlt || 'Bulan Bintang logo'}" width="120" height="94" /></span>` : ''}<h2 id="${collection.id}-title">${collection.label}</h2><span>${collection.items.length} ${collection.items.length === 1 ? 'piece' : 'pieces'}</span></div>
    <div class="collection-flow">${collection.items.map(renderPiece).join('')}</div>
  </section>`).join('')
let scrollFrame = 0
let activeCollection = ''
function highlightCollection() {
  scrollFrame = 0
  let current = collections[0].id
  for (const collection of collections) {
    if (document.getElementById(collection.id).getBoundingClientRect().top <= 150) current = collection.id
  }
  let activeLink = null
  sectionNav.querySelectorAll('a').forEach(link => {
    if (link.hash === `#${current}`) {
      link.setAttribute('aria-current', 'location')
      activeLink = link
    } else link.removeAttribute('aria-current')
  })
  if (current !== activeCollection) {
    activeCollection = current
    activeLink?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}
addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(highlightCollection)
}, { passive: true })
highlightCollection()

createComicLoop()
createComicLoop('#photography', 2)
createComicLoop('#motion')
enableGreetingAutoplay(mix, '#motion')

function buildAwardFeature(id, { result, title: featureTitle, description }) {
  const section = document.getElementById(id)
  const flow = section.querySelector('.collection-flow')
  const cards = [...flow.querySelectorAll('.mix-card')]
  const badge = cards.find(card => mix[Number(card.dataset.index)]?.source.toLowerCase().includes('award badge'))
  const feature = cards.find(card => card !== badge)
  if (!feature || !badge) return
  section.classList.add('award-collection')
  const details = document.createElement('aside')
  details.className = 'award-details'
  badge.querySelector('.card-action')?.remove()
  details.append(badge)
  details.insertAdjacentHTML('beforeend', `<div class="award-copy"><p class="award-result">${escape(result)}</p><h3>${escape(featureTitle)}</h3><p>${escape(description)}</p></div>`)
  flow.replaceChildren(feature, details)
}
buildAwardFeature('maybank-tiger', {
  result: 'MyTiger Values Art Competition 2022 · Top 8 selected',
  title: 'Values built into a pixel world.',
  description: 'A playful city scene that turns the MyTiger values into one connected world—ambition, progress and community, built one pixel at a time.'
})
buildAwardFeature('vartcomp', {
  result: 'vArtComp 2021 · Third place',
  title: 'Keep playing. Keep pushing.',
  description: '“Git Gut” follows a young player who dreams of becoming a professional esports athlete. Setbacks test him, but he keeps practising and refuses to give up on the goal.'
})

const weddingSection = document.getElementById('wedding-hafiz')
const weddingFlow = weddingSection.querySelector('.collection-flow')
weddingSection.classList.add('story-collection')
weddingFlow.insertAdjacentHTML('beforeend', `<aside class="story-copy"><p class="story-type">Wedding film · Cinematography + edit</p><h3>One day, held in motion.</h3><p>A warm record of the small looks, quiet pauses and joyful moments that make a wedding feel personal. I handled both the filming and the edit, shaping the celebration into one intimate story.</p></aside>`)

const vanSection = document.getElementById('van-livery')
const vanFlow = vanSection.querySelector('.collection-flow')
const vanHero = [...vanFlow.querySelectorAll('.mix-card')].find(card => mix[Number(card.dataset.index)]?.source.includes('/4x/'))
if (vanHero) {
  vanHero.remove()
  vanHero.classList.add('van-hero')
  vanHero.removeAttribute('data-index')
  vanHero.setAttribute('aria-label', 'Honk the van')
  vanHero.title = 'Click to honk'
  vanHero.querySelector('.card-action')?.remove()
  const vanHonk = new Audio('/portfolio-media/honk-honk-chen.mp3')
  vanHonk.preload = 'auto'
  vanHero.addEventListener('click', () => {
    vanHonk.currentTime = 0
    vanHonk.play().catch(() => { /* A later click can retry if playback is interrupted. */ })
  })
  const vanStage = document.createElement('div')
  vanStage.className = 'van-livery-stage'
  vanFlow.before(vanStage)
  vanStage.append(vanFlow, vanHero)
}

const johorSection = document.getElementById('visit-johor')
const johorFlow = johorSection.querySelector('.collection-flow')
const johorIntro = document.createElement('p')
johorIntro.className = 'collection-intro'
johorIntro.textContent = 'A character system for Visit Johor 2026—from retracing the mascots and designing their outfits to building expressive poses inspired by Johor’s food, culture and music.'
johorFlow.before(johorIntro)
const johorCards = [...johorFlow.querySelectorAll('.mix-card')]
const johorHeroes = johorCards.filter(card => mix[Number(card.dataset.index)]?.source.toLowerCase().endsWith('.webp'))
const johorLogo = johorCards.find(card => mix[Number(card.dataset.index)]?.source.includes('/LOGO-VJ-26.png'))
johorLogo?.remove()
johorHeroes.forEach(card => card.remove())
createComicLoop('#visit-johor', 2)
const johorStage = document.createElement('div')
johorStage.className = 'visit-johor-stage'
johorFlow.before(johorStage)
johorStage.append(johorFlow)
const johorShapes = document.createElement('div')
johorShapes.className = 'visit-johor-shapes'
johorShapes.setAttribute('aria-hidden', 'true')
johorShapes.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>'
johorStage.append(johorShapes)
const johorOverlay = document.createElement('div')
johorOverlay.className = 'visit-johor-heroes'
johorHeroes.forEach(card => {
  card.querySelector('.card-action')?.remove()
  johorOverlay.append(card)
})
johorStage.append(johorOverlay)
const nftFlow = document.querySelector('#nft-vertikal .collection-flow')
const nftFeatured = document.createElement('div')
nftFeatured.className = 'collection-flow nft-featured'
for (const card of [...nftFlow.querySelectorAll('.mix-card')]) {
  if (mix[Number(card.dataset.index)]?.source.includes('/feed (')) nftFeatured.append(card)
}
createComicLoop('#nft-vertikal', 2)
enableGreetingAutoplay(mix, '#nft-vertikal')
nftFlow.before(nftFeatured)

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
const contestModelLayout = document.createElement('div')
contestModelLayout.className = 'contest-model-layout'
contestModel.before(contestModelLayout)
contestModelLayout.append(contestModel)
contestModelLayout.insertAdjacentHTML('beforeend', `<aside class="contest-model-copy"><p class="project-type">Packaging concept · 3D visualisation</p><h3>A festive city in every direction.</h3><p>The artwork imagines a lively Malaysian city centred on the Bulan Bintang headquarters. Hari Raya celebrations spill into the surrounding streets, with neighbours, traffic and festive details turning the package into one continuous scene.</p><p>Drag the model to explore how the celebration wraps around the full object.</p></aside>`)
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

