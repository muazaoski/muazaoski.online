import './portfolio.css'
import './pixel-theme.css'
import './room-simulator.css'
import media from './media.json'
import mediaDescriptions from './media-descriptions.json'
import { enhanceDepth } from './depth.js'
import { createComicLoop } from './comic-loop.js'
import { enableVideoPreviews } from './video-previews.js'
import { initFestiveStickers } from './festive-stickers.js'
import { enableGreetingAutoplay } from './greeting-loop.js'
import { isAiLabeled, createAiLabelDev } from './ai-label-dev.js'
import { createFeaturedProjects } from './featured-projects.js'
import { initOrbitCreatives } from './orbit-creatives.js'
import { readPromoCategories, createPromoSorter } from './promo-sorter.js'
import { initRoomSimulator } from './room-simulator.js'
import { initVideoStudio } from './video-studio.js'
import { initVisitorRadar } from './visitor-radar.js'
import { initLiveRoom } from './live-room.js'
import { initVisitorMuseum } from './visitor-museum.js'

document.querySelectorAll('.ux-project').forEach(project => {
  const buttons = [...project.querySelectorAll('.ux-thumb')]
  const screen = project.querySelector('.ux-screen')
  const image = screen.querySelector('img')
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)))
      image.src = button.dataset.uxSrc
      image.alt = `${project.querySelector('h3').textContent} — ${button.dataset.uxCaption}`
      screen.href = button.dataset.uxSrc
      screen.setAttribute('aria-label', `Enlarge ${project.querySelector('h3').textContent}: ${button.dataset.uxTitle} (new tab)`)
      project.querySelector('.ux-screen-caption strong').textContent = button.dataset.uxTitle
      project.querySelector('.ux-screen-caption p').textContent = button.dataset.uxCaption
      project.querySelector('.ux-screen-origin').textContent = button.dataset.uxOrigin
      project.querySelector('.ux-screen-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(buttons.length).padStart(2, '0')}`
    })
  })
})

const uxGamePreview = document.querySelector('.ux-game-footage video')
new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) uxGamePreview.pause()
}).observe(uxGamePreview)
document.addEventListener('visibilitychange', () => { if (document.hidden) uxGamePreview.pause() })

document.querySelector('#back-to-top').addEventListener('click', event => {
  event.preventDefault()
  const previousScrollBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = 'auto'
  const jumpToTop = () => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
  jumpToTop()
  requestAnimationFrame(() => {
    jumpToTop()
    requestAnimationFrame(() => {
      jumpToTop()
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    })
  })
  history.replaceState(null, '', `${location.pathname}${location.search}`)
})

const aboutPortrait = document.querySelector('.about-portrait')
let aboutRevealFrame = 0
let aboutRevealPoint = null
let aboutLensPoint = null
let aboutRevealTime = 0
let aboutRevealTrail = []
const aboutReducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
function drawAboutReveal(time) {
  aboutRevealFrame = 0
  if (!aboutRevealPoint) return
  const rect = aboutPortrait.getBoundingClientRect()
  const x = Math.max(0, Math.min(rect.width, aboutRevealPoint.x - rect.left))
  const y = Math.max(0, Math.min(rect.height, aboutRevealPoint.y - rect.top))
  const delta = aboutRevealTime ? Math.min(64, time - aboutRevealTime) : 16
  const blend = aboutReducedMotion.matches ? 1 : 1 - Math.exp(-delta / 38)
  aboutRevealTime = time
  if (!aboutLensPoint) aboutLensPoint = { x, y }
  const previous = { ...aboutLensPoint }
  aboutLensPoint.x += (x - aboutLensPoint.x) * blend
  aboutLensPoint.y += (y - aboutLensPoint.y) * blend
  // Store points along the smoothed path, not new copies of the artwork.
  const distance = Math.hypot(previous.x - aboutLensPoint.x, previous.y - aboutLensPoint.y)
  if (!aboutReducedMotion.matches && distance > .5) {
    const steps = Math.min(12, Math.ceil(distance / 18))
    for (let index = 0; index < steps; index++) {
      const point = {
        x: previous.x + (aboutLensPoint.x - previous.x) * index / steps,
        y: previous.y + (aboutLensPoint.y - previous.y) * index / steps,
        time
      }
      const last = aboutRevealTrail.at(-1)
      if (!last || Math.hypot(last.x - point.x, last.y - point.y) > 8) {
        aboutRevealTrail.push(point)
      }
    }
  }
  aboutRevealTrail = aboutReducedMotion.matches ? []
    : aboutRevealTrail.filter(point => time - point.time < 420).slice(-12)
  aboutPortrait.style.setProperty('--reveal-x', `${aboutLensPoint.x}px`)
  aboutPortrait.style.setProperty('--reveal-y', `${aboutLensPoint.y}px`)
  const skeletonMask = ['radial-gradient(circle var(--reveal-size) at var(--reveal-x) var(--reveal-y), #000 0 65%, transparent 100%)']
  const photoMask = ['radial-gradient(circle var(--reveal-size) at var(--reveal-x) var(--reveal-y), transparent 0 65%, #000 100%)']
  aboutRevealTrail.forEach(point => {
    const fade = (1 - (time - point.time) / 420) ** 2
    const radius = `calc(var(--reveal-size) * ${.55 + .3 * fade})`
    const position = `${point.x}px ${point.y}px`
    skeletonMask.push(`radial-gradient(circle ${radius} at ${position}, rgba(0,0,0,${fade}) 0 40%, transparent 100%)`)
    photoMask.push(`radial-gradient(circle ${radius} at ${position}, rgba(0,0,0,${1 - fade}) 0 40%, #000 100%)`)
  })
  aboutPortrait.style.setProperty('--skeleton-mask', skeletonMask.join(','))
  aboutPortrait.style.setProperty('--photo-mask', photoMask.join(','))
  aboutPortrait.classList.add('is-revealing')
  if (Math.hypot(x - aboutLensPoint.x, y - aboutLensPoint.y) > .1 || aboutRevealTrail.length) {
    aboutRevealFrame = requestAnimationFrame(drawAboutReveal)
  }
}
function queueAboutReveal(event) {
  aboutRevealPoint = { x: event.clientX, y: event.clientY }
  if (!aboutRevealFrame) aboutRevealFrame = requestAnimationFrame(drawAboutReveal)
}
aboutPortrait.addEventListener('pointerenter', queueAboutReveal)
aboutPortrait.addEventListener('pointermove', queueAboutReveal)
aboutPortrait.addEventListener('pointerdown', queueAboutReveal)
aboutPortrait.addEventListener('pointerleave', () => {
  aboutRevealPoint = null
  aboutLensPoint = null
  aboutRevealTime = 0
  aboutRevealTrail = []
  aboutPortrait.style.removeProperty('--skeleton-mask')
  aboutPortrait.style.removeProperty('--photo-mask')
  cancelAnimationFrame(aboutRevealFrame)
  aboutRevealFrame = 0
  aboutPortrait.classList.toggle('is-revealing', aboutPortrait.matches(':focus-visible'))
})
aboutPortrait.addEventListener('focus', () => {
  aboutPortrait.style.removeProperty('--skeleton-mask')
  aboutPortrait.style.removeProperty('--photo-mask')
  aboutPortrait.style.setProperty('--reveal-x', '50%')
  aboutPortrait.style.setProperty('--reveal-y', '48%')
  aboutPortrait.classList.add('is-revealing')
})
aboutPortrait.addEventListener('blur', () => {
  aboutPortrait.classList.remove('is-revealing')
})
const aboutSkeleton = aboutPortrait.querySelector('.about-person--reveal img')
aboutSkeleton.addEventListener('error', () => aboutPortrait.classList.add('skeleton-unavailable'))

initOrbitCreatives()

const savedPromoCategories = readPromoCategories()
const promoKeyVisualIds = savedPromoCategories['key-visuals']
const promoSocialWebIds = savedPromoCategories['social-web-ads']
const promoPrintPackagingIds = savedPromoCategories['print-packaging']

const videoCategoryOrder = ['Shoes Promo', 'motion', 'montage', 'collab', 'meme', 'ugc edit', 'wedding hafiz']
const videoCategoryHeroes = {
  'Shoes Promo': '048',
  'motion': '060',
  'montage': '186',
  'meme': '182',
  'ugc edit': '262'
}

function sortVideoFilms(a, b) {
  const catA = a.category === 'collab' ? 'montage' : a.category
  const catB = b.category === 'collab' ? 'montage' : b.category
  const orderA = videoCategoryOrder.indexOf(catA)
  const orderB = videoCategoryOrder.indexOf(catB)
  if (orderA !== orderB) return orderA - orderB
  const hero = videoCategoryHeroes[catA]
  if (hero) {
    if (String(a.id) === hero) return -1
    if (String(b.id) === hero) return 1
  }
  return 0
}

const collections = [
  { id: 'key-visuals', label: 'Key Visuals', categories: [], filter: item => item.category === 'promo' && promoKeyVisualIds.has(item.id), order: promoKeyVisualIds },
  { id: 'social-web-ads', label: 'Social & Web Ads', categories: [], filter: item => item.category === 'promo' && promoSocialWebIds.has(item.id), order: promoSocialWebIds },
  { id: 'print-packaging', label: 'Print & Packaging', categories: [], filter: item => item.category === 'promo' && promoPrintPackagingIds.has(item.id), order: promoPrintPackagingIds },
  { id: 'bulan-bintang-contest', label: 'Bulan Bintang Contest', categories: ['Bulan Bintang Contest'], logo: '/portfolio-media/bulan-bintang-logo.png' },
  { id: 'maybank-tiger', label: 'Maybank MyTiger', categories: ['Maybank Tiger'], featuredSource: 'medias/images/Maybank Tiger/Maybank.jpeg' },
  { id: 'visit-johor', label: 'Visit Johor Mascot', categories: ['Visit Johor Mascott', 'Character Trace back + add outfit + pose', 'add more pose'], logo: '/portfolio-media/visit-johor-logo.webp', logoAlt: 'Visit Johor logo' },
  { id: 'nft-vertikal', label: 'NFT Project - Vertikal', categories: ['NFT Project - Vertikal'] },
  { id: 'festive-stickers', label: 'Raya & CNY Stickers Designs', categories: ['rayastickers', 'cnystickers'] },
  { id: 'landscaping', label: '3D Stickers Design', categories: ['3d landscaping sticker'] },
  { id: 'shop-deco', label: 'Uwalk Ecommerce Shop Decoration', categories: ['shop deco'] },
  { id: 'video-films', label: 'Video & Motion Projects', categories: ['Shoes Promo', 'motion', 'montage', 'collab', 'meme', 'ugc edit', 'wedding hafiz'], sort: sortVideoFilms },
  { id: 'photography', label: 'Product Photoshoot', categories: ['shoes photoshoot'] }
].map(collection => {
  const items = collection.filter
    ? media.filter(collection.filter)
    : media.filter(item => collection.categories.includes(item.category))
  if (collection.order) {
    const orderList = Array.from(collection.order)
    items.sort((a, b) => orderList.indexOf(String(a.id)) - orderList.indexOf(String(b.id)))
  }
  if (collection.sort) items.sort(collection.sort)
  if (collection.featuredSource) items.sort((a, b) => Number(b.source === collection.featuredSource) - Number(a.source === collection.featuredSource))
  return { ...collection, items }
})
const mix = collections.flatMap(collection => collection.items)
const collectionLabelByCategory = new Map(collections.flatMap(collection => (collection.categories || []).map(category => [category, collection.label])))
document.querySelector('.tape-label > span:nth-child(2)').textContent = `${mix.length} PIECES / KEEP SCROLLING ↓`
const names = { '014': 'New Arrivals', '034': '5.5 Sale', '008': 'Mother’s Day Sale', '009': 'Warehouse Sale', '007': 'Syukur Raya Sale' }
const collectionLabelByItem = new Map(collections.flatMap(collection => collection.items.map(item => [item.id, collection.label])))
const title = item => mediaDescriptions[item.id]?.title || names[item.id] || item.source.split('/').pop().replace(/\.[^.]+$/, '')
const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
function renderPiece(item) {
  const index = mix.indexOf(item)
  return `<button class="mix-card ${item.kind}${isAiLabeled(item.id) ? ' ai-labeled' : ''}" type="button" data-index="${index}" data-work-id="${escape(String(item.id))}" aria-label="${item.kind === 'video' ? 'Play' : 'Enlarge'} ${escape(title(item))}">
    <img src="${item.poster || item.src}" alt="${escape(title(item))}" width="${item.width}" height="${item.height}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${index < 3 ? 'high' : 'low'}" />
    ${isAiLabeled(item.id) ? '<span class="ai-label-badge" aria-label="AI-assisted"><img src="/icon/ai-label.webp" alt="" /></span>' : ''}
  </button>`
}
const sectionNav = document.createElement('nav')
sectionNav.className = 'collection-nav'
sectionNav.setAttribute('aria-label', 'Artwork collections')
sectionNav.innerHTML = collections.map(collection => `<a href="#${collection.id}">${collection.label}</a>`).join('') + '<a href="#ui-ux">UI & UX</a>'
document.querySelector('#montage').before(sectionNav)
document.querySelector('#montage').innerHTML = collections.map((collection, index) => `
  <section id="${collection.id}" class="collection" aria-labelledby="${collection.id}-title">
    <div class="collection-bar${collection.logo ? ' collection-bar--has-brand' : ''}"><span>${String(index + 1).padStart(2, '0')}</span>${collection.logo ? `<span class="collection-brand"><img src="${collection.logo}" alt="${collection.logoAlt || 'Bulan Bintang logo'}" width="120" height="94" loading="lazy" decoding="async" /></span>` : ''}<h2 id="${collection.id}-title">${collection.label}</h2><span class="collection-count">${collection.items.length} ${collection.items.length === 1 ? 'piece' : 'pieces'}</span><button class="section-share" type="button" data-share-section="${collection.id}" aria-label="Copy link to ${escape(collection.label)}"><span aria-hidden="true">↗</span><span>Share</span></button></div>
    <div class="collection-flow">${collection.items.map(renderPiece).join('')}</div>
  </section>`).join('')
const copyText = async value => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)
  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.append(field)
  field.select()
  document.execCommand('copy')
  field.remove()
}
document.querySelector('#montage').addEventListener('click', async event => {
  const button = event.target.closest('[data-share-section]')
  if (!button) return
  const url = new URL(location.href)
  url.hash = button.dataset.shareSection
  const label = button.querySelector('span:last-child')
  try {
    await copyText(url.href)
    label.textContent = 'Copied'
    button.classList.add('copied')
  } catch {
    label.textContent = 'Copy failed'
  }
  clearTimeout(button._resetLabel)
  button._resetLabel = setTimeout(() => {
    label.textContent = 'Share'
    button.classList.remove('copied')
  }, 1800)
})
function scrollToSharedSection() {
  let id = decodeURIComponent(location.hash.slice(1))
  if (id === 'promo') id = 'key-visuals'
  if (id === 'sampul-raya') id = 'print-packaging'
  if (['montages', 'wedding-hafiz', 'shoe-films', 'motion', 'social-edits', 'ugc'].includes(id)) id = 'video-films'
  const target = document.getElementById(id)
  if (!target?.matches('.collection, .featured-section, .ux-section')) return
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
}
addEventListener('hashchange', scrollToSharedSection)
const sharedScrollTimers = [0, 120, 450, 1000, 2000].map(delay => setTimeout(scrollToSharedSection, delay))
const stopSharedScrollSettling = () => sharedScrollTimers.forEach(clearTimeout)
addEventListener('pointerdown', stopSharedScrollSettling, { once: true, passive: true })
addEventListener('touchstart', stopSharedScrollSettling, { once: true, passive: true })
addEventListener('wheel', stopSharedScrollSettling, { once: true, passive: true })
addEventListener('keydown', stopSharedScrollSettling, { once: true })
addEventListener('load', scrollToSharedSection, { once: true })
let scrollFrame = 0
let activeCollection = ''
function highlightCollection() {
  scrollFrame = 0
  let current = collections[0].id
  for (const collection of [...collections, { id: 'ui-ux' }]) {
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
    if (activeLink) sectionNav.scrollTo({ left: activeLink.offsetLeft - sectionNav.clientWidth / 2 + activeLink.clientWidth / 2, behavior: 'smooth' })
  }
}
addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(highlightCollection)
}, { passive: true })
highlightCollection()

createComicLoop('#photography', 2)

const getItemByCard = card => (card?.dataset?.workId ? media.find(m => String(m.id) === card.dataset.workId) : null) || mix[Number(card?.dataset?.index)]

function buildAwardFeature(id, { result, title: featureTitle, description }) {
  const section = document.getElementById(id)
  if (!section) return
  const flow = section.querySelector('.collection-flow')
  if (!flow) return
  const cards = [...flow.querySelectorAll('.mix-card')]
  const badge = cards.find(card => getItemByCard(card)?.source.toLowerCase().includes('award badge'))
  const feature = cards.find(card => card !== badge)
  if (!feature || !badge) return
  section.classList.add('award-collection')
  const details = document.createElement('aside')
  details.className = 'award-details'
  details.append(badge)
  details.insertAdjacentHTML('beforeend', `<div class="award-copy"><p class="award-result">${escape(result)}</p><h3>${escape(featureTitle)}</h3><p>${escape(description)}</p></div>`)
  flow.replaceChildren(feature, details)
}
buildAwardFeature('maybank-tiger', {
  result: 'MyTiger Values Art Competition 2022 · Top 8 selected',
  title: 'Values built into a pixel world.',
  description: 'A playful city scene that turns the MyTiger values into one connected world—ambition, progress and community, built one pixel at a time.'
})

const johorSection = document.getElementById('visit-johor')
const johorFlow = johorSection.querySelector('.collection-flow')
const johorIntro = document.createElement('p')
johorIntro.className = 'collection-intro'
johorIntro.textContent = 'A character system for Visit Johor 2026—from retracing the mascots and designing their outfits to building expressive poses inspired by Johor’s food, culture and music.'
johorFlow.before(johorIntro)
const johorCards = [...johorFlow.querySelectorAll('.mix-card')]
const johorHeroes = johorCards.filter(card => getItemByCard(card)?.source.toLowerCase().endsWith('.webp'))
const johorLogo = johorCards.find(card => getItemByCard(card)?.source.includes('/LOGO-VJ-26.png'))
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
  johorOverlay.append(card)
})
johorStage.append(johorOverlay)
const nftFlow = document.querySelector('#nft-vertikal .collection-flow')
const nftFeatured = document.createElement('div')
nftFeatured.className = 'collection-flow nft-featured'
for (const card of [...nftFlow.querySelectorAll('.mix-card')]) {
  if (getItemByCard(card)?.source.includes('/feed (')) nftFeatured.append(card)
}
createComicLoop('#nft-vertikal', 2)
enableGreetingAutoplay(mix, '#nft-vertikal')
const nftIntro = document.createElement('p')
nftIntro.className = 'collection-intro'
nftIntro.textContent = 'At the height of the 2022 NFT wave, I created Vertikal—a collection of bald characters strapped into jetpacks, rocketing toward the moon. Minted on Pentas.io, the entire collection successfully sold out.'
nftFlow.before(nftIntro)
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
let modelViewerPromise = null
const modelFailed = () => { contestModel.querySelector('.model-status').textContent = '3D preview unavailable' }
const loadModelViewer = () => {
  modelViewerPromise ||= import('@google/model-viewer').catch(error => { modelFailed(); throw error })
  return modelViewerPromise
}
const warmModelViewer = () => { loadModelViewer().catch(() => {}) }
const modelNavLink = sectionNav.querySelector('a[href="#bulan-bintang-contest"]')
modelNavLink.addEventListener('pointerenter', warmModelViewer, { once: true })
modelNavLink.addEventListener('focus', warmModelViewer, { once: true })
modelNavLink.addEventListener('touchstart', warmModelViewer, { once: true, passive: true })
const modelObserver = new IntersectionObserver(async entries => {
  if (!entries.some(entry => entry.isIntersecting)) return
  modelObserver.disconnect()
  const model = contestModel.querySelector('model-viewer')
  model.addEventListener('error', modelFailed)
  try { await loadModelViewer() } catch { /* The inline status explains the failure. */ }
}, { rootMargin: '300px' })
modelObserver.observe(contestModel)
initFestiveStickers('#festive-stickers')
initRoomSimulator('#landscaping')
const shopSection = document.getElementById('shop-deco')
if (shopSection) {
  const shopFlow = shopSection.querySelector('.collection-flow')
  const shopIntro = document.createElement('p')
  shopIntro.className = 'collection-intro'
  shopIntro.textContent = 'Digital storefront decorations designed for Uwalk across Shopee and Lazada—framing brand banners, campaign vouchers, and product categories into a vibrant online shopping experience.'
  shopFlow?.before(shopIntro)
}
const photoSection = document.getElementById('photography')
if (photoSection) {
  const photoFlow = photoSection.querySelector('.collection-flow')
  const photoIntro = document.createElement('p')
  photoIntro.className = 'collection-intro'
  photoIntro.textContent = 'Studio product photography created for e-commerce listings—capturing footwear silhouettes, material textures, and key angles under clean commercial lighting.'
  photoFlow?.before(photoIntro)
}
initVideoStudio('#video-films', { mediaDescriptions, showMedia, mix })
initVisitorRadar('#visitor-radar')
initLiveRoom('#live-room')
initVisitorMuseum('#visitor-museum')
enhanceDepth()
const viewer = document.querySelector('#media-viewer')
const stopPreview = enableVideoPreviews(mix)
const content = document.querySelector('#viewer-content')
let currentIndex = 0
let viewerItems = mix
function syncViewerAiBadge(item = viewerItems[currentIndex]) {
  content.querySelector('.viewer-ai-badge')?.remove()
  if (!item || !isAiLabeled(item.id)) return
  const badge = document.createElement('span')
  badge.className = 'ai-label-badge viewer-ai-badge'
  badge.setAttribute('aria-label', 'AI-assisted')
  badge.innerHTML = '<img src="/icon/ai-label.webp" alt="" />'
  ;(content.querySelector('.viewer-media') || content).append(badge)
}
function showMedia(index) {
  stopPreview()
  content.querySelector('video')?.pause()
  content.classList.remove('image-zoomed')
  currentIndex = (index + viewerItems.length) % viewerItems.length
  const item = viewerItems[currentIndex]
  document.querySelector('#viewer-position').textContent = `${currentIndex + 1} / ${viewerItems.length}`
  content.replaceChildren()
  const mediaStage = document.createElement('div')
  mediaStage.className = 'viewer-media'
  const element = document.createElement(item.kind === 'video' ? 'video' : 'img')
  if (item.kind === 'video') {
    element.controls = true
    element.playsInline = true
    element.preload = 'metadata'
    element.poster = item.poster
    element.src = `${item.src}?audio=1`
    if (item.width && item.height) {
      element.style.aspectRatio = `${item.width} / ${item.height}`
    }
    element.setAttribute('aria-label', `Film ${currentIndex + 1} of ${viewerItems.length}`)
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
      const zoomed = mediaStage.classList.contains('image-zoomed')
      const rect = element.getBoundingClientRect()
      const x = event.type === 'click' && event.detail ? (event.clientX - rect.left) / rect.width : 0.5
      const y = event.type === 'click' && event.detail ? (event.clientY - rect.top) / rect.height : 0.5
      mediaStage.classList.toggle('image-zoomed', !zoomed)
      if (zoomed) {
        element.style.removeProperty('width')
        element.style.removeProperty('height')
        mediaStage.scrollTo(0, 0)
      } else {
        element.style.width = `${rect.width * 2.5}px`
        element.style.height = `${rect.height * 2.5}px`
        mediaStage.scrollTo(Math.max(0, x * rect.width * 2.5 - mediaStage.clientWidth / 2), Math.max(0, y * rect.height * 2.5 - mediaStage.clientHeight / 2))
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
  mediaStage.append(element)
  const copy = mediaDescriptions[item.id]
  const details = document.createElement('aside')
  details.className = 'viewer-details'
  const kicker = document.createElement('p')
  kicker.className = 'viewer-kicker'
  kicker.textContent = `${collectionLabelByItem.get(item.id) || collectionLabelByCategory.get(item.category) || item.category} · ${item.kind === 'video' ? 'Film' : 'Artwork'} ${currentIndex + 1}`
  const heading = document.createElement('h2')
  heading.textContent = copy?.title || title(item)
  const description = document.createElement('p')
  description.className = 'viewer-description'
  description.textContent = copy?.description || 'A selected piece from this portfolio collection.'
  const workId = document.createElement('span')
  workId.className = 'viewer-work-id'
  workId.textContent = `WORK ${item.id}`
  details.append(kicker, heading, description, workId)

  if (devMode && promoSorterInstance && item.category === 'promo') {
    const isDeleted = promoSorterInstance.categories['deleted']?.has(String(item.id))
    const devActions = document.createElement('div')
    devActions.className = 'viewer-dev-actions'
    devActions.innerHTML = `
      <button type="button" class="viewer-delete-toggle ${isDeleted ? 'is-deleted' : ''}">
        ${isDeleted ? '↺ Restore Artwork' : '✕ Mark to Delete'}
      </button>
    `
    const toggleBtn = devActions.querySelector('.viewer-delete-toggle')
    toggleBtn.addEventListener('click', () => {
      const result = promoSorterInstance.toggleDeleted(item.id)
      toggleBtn.classList.toggle('is-deleted', result.isDeleted)
      toggleBtn.textContent = result.isDeleted ? '↺ Restore Artwork' : '✕ Mark to Delete'
    })
    details.append(devActions)
  }

  content.append(mediaStage, details)
  syncViewerAiBadge(item)
  if (!viewer.open) viewer.showModal()
  if (item.kind === 'video') element.play().catch(() => { /* Native controls remain available. */ })
}
document.querySelector('#montage').addEventListener('click', event => {
  const button = event.target.closest('[data-work-id], [data-index]')
  if (button) {
    viewerItems = mix
    const idx = button.dataset.workId
      ? mix.findIndex(item => String(item.id) === button.dataset.workId)
      : Number(button.dataset.index)
    if (idx !== -1) showMedia(idx)
  }
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

let promoSorterInstance = null
const devMode = false
const featured = createFeaturedProjects({
  media: mix,
  devMode,
  isAiLabeled,
  openMedia(items) { viewerItems = items; showMedia(0) }
})
if (devMode) {
  const tools = document.createElement('aside')
  tools.className = 'portfolio-dev-tools'
  tools.setAttribute('aria-label', 'Portfolio developer tools')
  tools.innerHTML = '<span>DEV</span><button type="button" data-promo-sorter>Sort Promos</button><button type="button" data-picker>Raya picker</button><button type="button" data-ai-labels>AI labels</button>'
  async function enableDevTools() {
    const { createFeaturedPicker } = await import('./featured-picker.js')
    document.body.append(tools)
    const getTitle = item => mediaDescriptions[item.id]?.title || title(item)
    createFeaturedPicker({ trigger: tools.querySelector('[data-picker]'), collections, getTitle, featured })

    const promoMedia = media.filter(item => item.category === 'promo')
    promoSorterInstance = createPromoSorter({
      trigger: tools.querySelector('[data-promo-sorter]'),
      promoMedia,
      getTitle,
      onUpdate(updatedCategories) {
        promoKeyVisualIds.clear()
        updatedCategories['key-visuals'].forEach(id => promoKeyVisualIds.add(id))

        promoSocialWebIds.clear()
        updatedCategories['social-web-ads'].forEach(id => promoSocialWebIds.add(id))

        promoPrintPackagingIds.clear()
        updatedCategories['print-packaging'].forEach(id => promoPrintPackagingIds.add(id))

        collections[0].items = [...promoKeyVisualIds].map(id => media.find(m => String(m.id) === id)).filter(Boolean)
        collections[1].items = [...promoSocialWebIds].map(id => media.find(m => String(m.id) === id)).filter(Boolean)
        collections[2].items = [...promoPrintPackagingIds].map(id => media.find(m => String(m.id) === id)).filter(Boolean)

        mix.length = 0
        mix.push(...collections.flatMap(c => c.items))

        for (let i = 0; i < 3; i++) {
          const col = collections[i]
          const section = document.getElementById(col.id)
          if (section) {
            const flow = section.querySelector('.collection-flow')
            const count = section.querySelector('.collection-count')
            if (flow) {
              flow.innerHTML = col.items.map(renderPiece).join('')
            }
            if (count) {
              count.textContent = `${col.items.length} ${col.items.length === 1 ? 'piece' : 'pieces'}`
            }
          }
        }

        const tapeLabel = document.querySelector('.tape-label > span:nth-child(2)')
        if (tapeLabel) tapeLabel.textContent = `${mix.length} PIECES / KEEP SCROLLING ↓`

        collectionLabelByItem.clear()
        collections.forEach(col => {
          col.items.forEach(item => collectionLabelByItem.set(item.id, col.label))
        })

        // Re-sync data-index attributes on all mix cards across all collections
        document.querySelectorAll('.mix-card[data-work-id]').forEach(card => {
          const idx = mix.findIndex(item => String(item.id) === card.dataset.workId)
          if (idx !== -1) card.dataset.index = idx
        })
      }
    })

    const aiDialog = document.createElement('dialog')
    aiDialog.className = 'ai-dev'
    aiDialog.setAttribute('aria-labelledby', 'ai-dev-title')
    document.body.append(aiDialog)
    const aiTrigger = tools.querySelector('[data-ai-labels]')
    createAiLabelDev({ trigger: aiTrigger, dialog: aiDialog, collections, getTitle, onChange() {
      document.querySelectorAll('.mix-card[data-work-id]').forEach(card => {
        const labeled = isAiLabeled(card.dataset.workId)
        card.classList.toggle('ai-labeled', labeled)
        card.querySelector('.ai-label-badge')?.remove()
        if (labeled) card.insertAdjacentHTML('beforeend', '<span class="ai-label-badge" aria-label="AI-assisted"><img src="/icon/ai-label.webp" alt="" /></span>')
      })
      featured.render()
      syncViewerAiBadge()
    } })
    const oldWordmark = document.querySelector('.wordmark')
    const wordmark = document.createElement('button')
    wordmark.type = 'button'
    wordmark.className = 'wordmark'
    wordmark.innerHTML = oldWordmark.innerHTML
    wordmark.setAttribute('aria-label', 'Open AI label developer tool')
    wordmark.addEventListener('click', () => aiTrigger.click())
    oldWordmark.replaceWith(wordmark)
  }
  enableDevTools().catch(error => console.error('Could not open portfolio developer tools', error))
}

const projects = [
  {
    name: 'Unfrog',
    icon: '/frog.svg',
    url: 'https://frog.muazaoski.site',
    category: '3D WEBGL GAME',
    description: 'A 3D multiplayer frog arena featuring hop mechanics, tongue combat, and chaotic real-time physics. Hop into Frogstead, customize frog colors, and battle with players directly in your browser.',
    action: 'Launch Game',
    video: '/app-previews/unfrog.mp4',
    poster: '/app-previews/unfrog-poster.webp',
    tag: 'FEATURED APP',
    tech: 'THREE.JS / WEBSOCKETS / CANNON-ES'
  },
  {
    name: 'Workout',
    icon: '/workout.svg',
    url: 'https://workout.muazaoski.site',
    category: 'FITNESS TRACKER',
    description: 'A minimal, focused workout tracker for logging training sessions, tracking sets and reps, and hitting fitness milestones.',
    action: 'Open Tracker'
  },
  {
    name: 'Size Chart',
    icon: '/sizechart.svg',
    url: 'https://chart.muazaoski.site',
    category: 'ECOMMERCE TOOL',
    description: 'Instantly convert messy size chart photos into clean, editable, high-res charts ready for e-commerce store listings.',
    action: 'Create Chart'
  },
  {
    name: 'OCR',
    icon: '/ocr.svg',
    url: 'https://ocr.muazaoski.site',
    category: 'AI UTILITY',
    description: 'Optical character recognition engine that extracts clear text and structured tabular data from images with AI.',
    action: 'Try OCR'
  },
  {
    name: 'FinanceMe',
    icon: '/financeme-02.svg',
    url: 'https://financeme.cc',
    category: 'PERSONAL FINANCE',
    description: 'A comprehensive personal financial management platform for monthly budgeting, freelance invoices, and goals.',
    action: 'View Project',
    discontinued: true
  }
]

const [featuredApp, ...otherApps] = projects

document.querySelector('#projects').innerHTML = `
  <div class="apps-featured-hero">
    <a class="app-hero-card" href="${featuredApp.url}" target="_blank" rel="noopener noreferrer" aria-label="Play ${featuredApp.name}, 3D multiplayer arena (new tab)">
      <div class="app-hero-monitor">
        <video src="${featuredApp.video}" poster="${featuredApp.poster}" muted loop playsinline preload="metadata"></video>
        <div class="app-hero-hud">
          <span class="app-hud-tag"><span class="app-hud-pulse"></span>LIVE ARENA</span>
          <span class="app-hud-sub">MULTIPLAYER 3D</span>
        </div>
        <div class="app-hero-scanlines" aria-hidden="true"></div>
      </div>
      <div class="app-hero-content">
        <div class="app-hero-header">
          <div class="app-hero-badges">
            <span class="app-hero-index">[ 01 // ${featuredApp.tag} ]</span>
            <span class="app-hero-status"><span class="app-status-dot"></span>ONLINE ↗</span>
          </div>
          <div class="app-hero-title-row">
            <div class="app-hero-icon">
              <img src="${featuredApp.icon}" alt="" width="56" height="56" loading="lazy" decoding="async" />
            </div>
            <div>
              <h3 class="app-hero-title">${featuredApp.name}</h3>
              <p class="app-hero-url">${featuredApp.url.replace('https://', '')}</p>
            </div>
          </div>
        </div>
        <p class="app-hero-desc">${featuredApp.description}</p>
        <div class="app-hero-footer">
          <div class="app-hero-btn">
            <span>${featuredApp.action.toUpperCase()}</span>
            <span aria-hidden="true">↗</span>
          </div>
          <span class="app-hero-tech">${featuredApp.tech}</span>
        </div>
      </div>
    </a>
  </div>
  <div class="apps-subgrid">
    ${otherApps.map((app, idx) => {
      const index = idx + 2
      const isArchived = Boolean(app.discontinued)
      return `
        <a class="app-subcard${isArchived ? ' app-subcard--archived' : ''}" href="${app.url}" target="_blank" rel="noopener noreferrer" aria-label="${isArchived ? `View ${app.name}, archived project` : `Open ${app.name}`} (new tab)">
          <div class="app-subcard-top">
            <span class="app-subcard-tag">[ ${String(index).padStart(2, '0')} // ${app.category} ]</span>
            <span class="app-subcard-badge">${isArchived ? 'ARCHIVED' : 'ACTIVE'}</span>
          </div>
          <div class="app-subcard-icon">
            <img src="${app.icon}" alt="" width="44" height="44" loading="lazy" decoding="async" />
          </div>
          <div class="app-subcard-body">
            <h3>${app.name}</h3>
            <p>${app.description}</p>
          </div>
          <div class="app-subcard-action">
            <span>${app.action}</span>
            <span aria-hidden="true">↗</span>
          </div>
        </a>
      `
    }).join('')}
  </div>
`

const heroCard = document.querySelector('.app-hero-card')
if (heroCard) {
  const video = heroCard.querySelector('video')
  const playPreview = () => {
    video.muted = true
    video.play().catch(() => {})
    heroCard.classList.add('is-previewing')
  }
  const stopPreview = () => {
    video.pause()
    video.currentTime = 0
    heroCard.classList.remove('is-previewing')
  }
  heroCard.addEventListener('mouseenter', playPreview)
  heroCard.addEventListener('mouseleave', () => {
    if (document.activeElement !== heroCard) stopPreview()
  })
  heroCard.addEventListener('focus', playPreview)
  heroCard.addEventListener('blur', () => {
    if (!heroCard.matches(':hover')) stopPreview()
  })
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) stopPreview()
  }).observe(heroCard)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPreview()
  })
}

