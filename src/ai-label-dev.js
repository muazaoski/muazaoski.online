import publishedLabels from './ai-labels.json'

const STORAGE_KEY = 'muazaoski-ai-work-ids-v2'
const BLEND_STORAGE_KEY = 'muazaoski-ai-badge-blend-v2'
const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'difference', 'luminosity']

function readLabels() {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY)
    const value = savedValue === null ? publishedLabels.aiWorkIds : JSON.parse(savedValue)
    return new Set(Array.isArray(value) ? value.map(String) : [])
  } catch {
    return new Set(publishedLabels.aiWorkIds.map(String))
  }
}

const labels = readLabels()
let badgeBlendMode = BLEND_MODES.includes(publishedLabels.aiBadgeBlendMode) ? publishedLabels.aiBadgeBlendMode : 'normal'
try {
  const savedBlendMode = localStorage.getItem(BLEND_STORAGE_KEY)
  if (BLEND_MODES.includes(savedBlendMode)) badgeBlendMode = savedBlendMode
} catch { /* The default remains available. */ }
document.documentElement.style.setProperty('--ai-badge-blend', badgeBlendMode)

export function isAiLabeled(id) {
  return labels.has(String(id))
}

function saveLabels() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...labels].sort())) } catch { /* Labels remain active for this visit. */ }
}

function escape(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

export function createAiLabelDev({ trigger, dialog, collections, getTitle, onChange }) {
  const entries = collections.flatMap(collection => collection.items.map(item => ({ item, section: collection.label })))
  const availableIds = new Set(entries.map(({ item }) => String(item.id)))
  for (const id of labels) if (!availableIds.has(id)) labels.delete(id)
  saveLabels()
  const sectionOptions = collections
    .filter(collection => collection.items.length)
    .map(collection => `<option value="${escape(collection.id)}">${escape(collection.label)}</option>`)
    .join('')

  dialog.innerHTML = `
    <div class="ai-dev-shell">
      <header class="ai-dev-header">
        <div><p>DEV TOOL / ARTWORK LABELS</p><h2 id="ai-dev-title">Mark work made with AI.</h2></div>
        <button class="ai-dev-close" type="button" aria-label="Close AI label tool">×</button>
      </header>
      <div class="ai-dev-toolbar">
        <label><span>Find a work</span><input class="ai-dev-search" type="search" placeholder="Search title or file…" autocomplete="off" /></label>
        <label><span>Section</span><select class="ai-dev-filter"><option value="">All sections</option>${sectionOptions}</select></label>
        <label><span>Badge blend</span><select class="ai-dev-blend">${BLEND_MODES.map(mode => `<option value="${mode}" ${mode === badgeBlendMode ? 'selected' : ''}>${mode.replace('-', ' ')}</option>`).join('')}</select></label>
      </div>
      <div class="ai-dev-summary"><strong><span class="ai-dev-selected">${labels.size}</span> labelled AI</strong><span class="ai-dev-visible">${entries.length} works shown</span></div>
      <div class="ai-dev-list" role="group" aria-label="Choose artwork to label as AI">
        ${entries.map(({ item, section }) => {
          const name = getTitle(item)
          const search = `${name} ${item.source} ${section}`.toLowerCase()
          return `<label class="ai-dev-item" data-section="${escape(collections.find(collection => collection.label === section)?.id || '')}" data-search="${escape(search)}">
            <input type="checkbox" value="${escape(item.id)}" ${isAiLabeled(item.id) ? 'checked' : ''} />
            <span class="ai-dev-thumb"><img src="${escape(item.poster || item.src)}" alt="" loading="lazy" decoding="async" /></span>
            <span class="ai-dev-meta"><strong>${escape(name)}</strong><small>${escape(section)} · ${escape(item.kind)}</small></span>
            <span class="ai-dev-chip" aria-hidden="true"><img src="/icon/ai-label.webp" alt="" /></span>
          </label>`
        }).join('')}
      </div>
      <footer class="ai-dev-footer">
        <p>Saved in this browser. Use “Copy config” when you want these labels added to the site source.</p>
        <div><button class="ai-dev-clear" type="button">Clear all</button><button class="ai-dev-copy" type="button">Copy config</button></div>
        <output class="ai-dev-status" aria-live="polite"></output>
      </footer>
    </div>`

  const search = dialog.querySelector('.ai-dev-search')
  const filter = dialog.querySelector('.ai-dev-filter')
  const blend = dialog.querySelector('.ai-dev-blend')
  const items = [...dialog.querySelectorAll('.ai-dev-item')]
  const selected = dialog.querySelector('.ai-dev-selected')
  const visible = dialog.querySelector('.ai-dev-visible')
  const status = dialog.querySelector('.ai-dev-status')

  const updateSummary = () => {
    selected.textContent = labels.size
    visible.textContent = `${items.filter(item => !item.hidden).length} works shown`
  }
  const applyFilters = () => {
    const query = search.value.trim().toLowerCase()
    items.forEach(item => { item.hidden = Boolean((filter.value && item.dataset.section !== filter.value) || (query && !item.dataset.search.includes(query))) })
    updateSummary()
  }
  const announce = message => {
    status.textContent = message
    clearTimeout(announce.timeout)
    announce.timeout = setTimeout(() => { status.textContent = '' }, 2400)
  }

  trigger.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal()
    requestAnimationFrame(() => search.focus())
  })
  dialog.querySelector('.ai-dev-close').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  search.addEventListener('input', applyFilters)
  filter.addEventListener('change', applyFilters)
  blend.addEventListener('change', () => {
    badgeBlendMode = BLEND_MODES.includes(blend.value) ? blend.value : 'normal'
    document.documentElement.style.setProperty('--ai-badge-blend', badgeBlendMode)
    try { localStorage.setItem(BLEND_STORAGE_KEY, badgeBlendMode) } catch { /* The setting remains active for this visit. */ }
    announce(`Badge blend mode: ${badgeBlendMode.replace('-', ' ')}.`)
  })
  dialog.querySelector('.ai-dev-list').addEventListener('change', event => {
    if (!event.target.matches('input[type="checkbox"]')) return
    if (event.target.checked) labels.add(event.target.value)
    else labels.delete(event.target.value)
    saveLabels()
    updateSummary()
    onChange()
  })
  dialog.querySelector('.ai-dev-clear').addEventListener('click', () => {
    labels.clear()
    items.forEach(item => { item.querySelector('input').checked = false })
    saveLabels()
    updateSummary()
    onChange()
    announce('All AI labels cleared.')
  })
  dialog.querySelector('.ai-dev-copy').addEventListener('click', async () => {
    const config = JSON.stringify({ aiWorkIds: [...labels].sort(), aiBadgeBlendMode: badgeBlendMode }, null, 2)
    try {
      await navigator.clipboard.writeText(config)
      announce('AI label config copied.')
    } catch {
      announce('Could not access the clipboard. Try again from localhost or HTTPS.')
    }
  })
}
