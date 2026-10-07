export const PROMO_STORAGE_KEY = 'muazaoski-promo-categories-v4'

export const defaultPromoCategories = {
  'key-visuals': ['106', '014', '115', '110', '101', '064', '114', '108'],
  'social-web-ads': ['096', '095', '100', '098', '104', '121'],
  'print-packaging': ['065', '067', '233', '066', '234', '116', '099', '235'],
  'deleted': []
}

export function readPromoCategories() {
  const validIds = new Set([
    ...defaultPromoCategories['key-visuals'],
    ...defaultPromoCategories['social-web-ads'],
    ...defaultPromoCategories['print-packaging']
  ])

  try {
    const raw = localStorage.getItem(PROMO_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return {
          'key-visuals': new Set((parsed['key-visuals'] || []).map(String).filter(id => validIds.has(id))),
          'social-web-ads': new Set((parsed['social-web-ads'] || []).map(String).filter(id => validIds.has(id))),
          'print-packaging': new Set((parsed['print-packaging'] || []).map(String).filter(id => validIds.has(id))),
          'deleted': new Set((parsed['deleted'] || []).map(String).filter(id => validIds.has(id)))
        }
      }
    }
  } catch {}
  return {
    'key-visuals': new Set(defaultPromoCategories['key-visuals']),
    'social-web-ads': new Set(defaultPromoCategories['social-web-ads']),
    'print-packaging': new Set(defaultPromoCategories['print-packaging']),
    'deleted': new Set(defaultPromoCategories['deleted'] || [])
  }
}

export function savePromoCategories(categoriesMap) {
  const serializable = {
    'key-visuals': [...categoriesMap['key-visuals']],
    'social-web-ads': [...categoriesMap['social-web-ads']],
    'print-packaging': [...categoriesMap['print-packaging']],
    'deleted': [...(categoriesMap['deleted'] || [])]
  }
  try {
    localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(serializable))
  } catch {}
}

const CATEGORY_META = [
  { id: 'key-visuals', label: 'Key Visuals', tag: 'KV' },
  { id: 'social-web-ads', label: 'Social & Web Ads', tag: 'WEB' },
  { id: 'print-packaging', label: 'Print & Packaging', tag: 'PRINT' },
  { id: 'deleted', label: '✕ Delete', tag: 'DEL', isDanger: true }
]

export function createPromoSorter({ trigger, promoMedia, getTitle, onUpdate }) {
  const dialog = document.createElement('dialog')
  dialog.className = 'ai-dev promo-sorter-dialog'
  dialog.setAttribute('aria-labelledby', 'promo-sorter-title')

  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

  const categories = readPromoCategories()

  dialog.innerHTML = `
    <div class="ai-dev-shell">
      <header class="ai-dev-header">
        <div>
          <p>DEV CONSOLE / PROMO CATEGORIZER</p>
          <h2 id="promo-sorter-title">Organize Promo Artworks.</h2>
        </div>
        <button class="ai-dev-close" type="button" aria-label="Close sorter">×</button>
      </header>

      <div class="ai-dev-toolbar">
        <label>
          <span>Search artwork</span>
          <input class="promo-sorter-search" type="search" placeholder="Search title or filename..." autocomplete="off" />
        </label>
        <label>
          <span>Category Filter</span>
          <select class="promo-sorter-filter">
            <option value="">All Artworks (${promoMedia.length})</option>
            <option value="active">Active Only</option>
            <option value="key-visuals">Key Visuals</option>
            <option value="social-web-ads">Social & Web Ads</option>
            <option value="print-packaging">Print & Packaging</option>
            <option value="deleted">Marked to Delete / Hidden</option>
          </select>
        </label>
      </div>

      <div class="ai-dev-summary">
        <strong class="promo-sorter-counts">Calculating...</strong>
        <span class="promo-sorter-visible">${promoMedia.length} works shown</span>
      </div>

      <div class="ai-dev-list promo-sorter-list" role="group" aria-label="Assign categories to promo artworks">
        ${promoMedia.map(item => {
          const id = String(item.id)
          const filename = item.source.split('/').pop()
          const title = getTitle(item)
          const currentCat = categories['key-visuals'].has(id)
            ? 'key-visuals'
            : categories['social-web-ads'].has(id)
            ? 'social-web-ads'
            : categories['print-packaging'].has(id)
            ? 'print-packaging'
            : categories['deleted']?.has(id)
            ? 'deleted'
            : 'key-visuals'

          return `
            <div class="ai-dev-item promo-item-card ${currentCat === 'deleted' ? 'is-deleted' : ''}" data-id="${id}" data-cat="${currentCat}" data-search="${escape(`${title} ${filename} ${id}`.toLowerCase())}">
              <a class="ai-dev-thumb" href="${escape(item.src)}" target="_blank" rel="noopener noreferrer" title="View full artwork in new tab">
                <img src="${escape(item.poster || item.src)}" alt="${escape(title)}" loading="lazy" decoding="async" />
                <span class="promo-deleted-overlay" aria-hidden="true">DELETED</span>
              </a>
              <div class="ai-dev-meta">
                <div class="promo-meta-title-row">
                  <strong>${escape(title)}</strong>
                  <span class="promo-deleted-chip">MARKED TO DELETE</span>
                </div>
                <small>${escape(filename)} · ID #${id}</small>
                <div class="promo-cat-pills" role="radiogroup" aria-label="Category for ${escape(title)}">
                  ${CATEGORY_META.map(cat => `
                    <button
                      type="button"
                      class="promo-cat-btn ${cat.isDanger ? 'promo-cat-btn--danger' : ''} ${currentCat === cat.id ? 'is-active' : ''}"
                      data-target-cat="${cat.id}"
                      data-item-id="${id}"
                    >
                      ${cat.label}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>

      <footer class="ai-dev-footer">
        <p>Live changes are saved to browser storage. Click "Copy Config" to export your mapping into code.</p>
        <div>
          <button class="promo-sorter-reset" type="button">Reset Defaults</button>
          <button class="promo-sorter-copy-del" type="button">Copy Deleted List</button>
          <button class="ai-dev-copy promo-sorter-copy" type="button">Copy Config</button>
          <button class="promo-sorter-done" type="button">Done</button>
        </div>
        <output class="ai-dev-status promo-sorter-status" aria-live="polite"></output>
      </footer>
    </div>
  `

  document.body.append(dialog)

  const search = dialog.querySelector('.promo-sorter-search')
  const filter = dialog.querySelector('.promo-sorter-filter')
  const cards = [...dialog.querySelectorAll('.promo-item-card')]
  const counts = dialog.querySelector('.promo-sorter-counts')
  const visible = dialog.querySelector('.promo-sorter-visible')
  const status = dialog.querySelector('.promo-sorter-status')

  function updateCounts() {
    const kvCount = categories['key-visuals'].size
    const swCount = categories['social-web-ads'].size
    const ppCount = categories['print-packaging'].size
    const delCount = categories['deleted']?.size || 0
    counts.innerHTML = `KV: <b>${kvCount}</b> | Web: <b>${swCount}</b> | Print: <b>${ppCount}</b> | <span class="promo-count-del">✕ Deleted: <b>${delCount}</b></span>`
  }

  function applyFilters() {
    const q = search.value.trim().toLowerCase()
    const cat = filter.value
    let shown = 0

    cards.forEach(card => {
      let matchCat = true
      if (cat === 'active') {
        matchCat = card.dataset.cat !== 'deleted'
      } else if (cat) {
        matchCat = card.dataset.cat === cat
      }
      const matchQ = !q || card.dataset.search.includes(q)
      const isVisible = matchCat && matchQ
      card.hidden = !isVisible
      if (isVisible) shown++
    })

    visible.textContent = `${shown} works shown`
  }

  function assignCategory(itemId, targetCat) {
    const id = String(itemId)
    CATEGORY_META.forEach(cat => categories[cat.id]?.delete(id))
    if (!categories[targetCat]) categories[targetCat] = new Set()
    categories[targetCat].add(id)

    savePromoCategories(categories)

    const card = dialog.querySelector(`.promo-item-card[data-id="${id}"]`)
    if (card) {
      card.dataset.cat = targetCat
      card.classList.toggle('is-deleted', targetCat === 'deleted')
      card.querySelectorAll('.promo-cat-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.targetCat === targetCat)
      })
    }

    updateCounts()
    applyFilters()

    status.textContent = targetCat === 'deleted' ? `Marked #${id} for deletion` : `Moved #${id} to ${targetCat}`
    setTimeout(() => { if (status.textContent.includes(id)) status.textContent = '' }, 2500)

    if (typeof onUpdate === 'function') {
      onUpdate(categories)
    }
  }

  function toggleDeleted(itemId) {
    const id = String(itemId)
    const isCurrentlyDeleted = categories['deleted']?.has(id)
    if (isCurrentlyDeleted) {
      const restoredCat = defaultPromoCategories['social-web-ads'].includes(id)
        ? 'social-web-ads'
        : defaultPromoCategories['print-packaging'].includes(id)
        ? 'print-packaging'
        : 'key-visuals'
      assignCategory(id, restoredCat)
      return { isDeleted: false, category: restoredCat }
    } else {
      assignCategory(id, 'deleted')
      return { isDeleted: true, category: 'deleted' }
    }
  }

  // Event Listeners
  dialog.querySelector('.promo-sorter-list').addEventListener('click', e => {
    const btn = e.target.closest('.promo-cat-btn')
    if (!btn) return
    assignCategory(btn.dataset.itemId, btn.dataset.targetCat)
  })

  search.addEventListener('input', applyFilters)
  filter.addEventListener('change', applyFilters)

  dialog.querySelector('.promo-sorter-reset').addEventListener('click', () => {
    CATEGORY_META.forEach(cat => {
      categories[cat.id] = new Set(defaultPromoCategories[cat.id] || [])
    })
    savePromoCategories(categories)

    cards.forEach(card => {
      const id = card.dataset.id
      const cat = categories['key-visuals'].has(id)
        ? 'key-visuals'
        : categories['social-web-ads'].has(id)
        ? 'social-web-ads'
        : categories['print-packaging'].has(id)
        ? 'print-packaging'
        : 'deleted'
      card.dataset.cat = cat
      card.classList.toggle('is-deleted', cat === 'deleted')
      card.querySelectorAll('.promo-cat-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.targetCat === cat)
      })
    })

    updateCounts()
    applyFilters()
    status.textContent = 'Reset to default categories.'
    if (typeof onUpdate === 'function') onUpdate(categories)
  })

  const copyText = async value => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value)
        return true
      } catch {}
    }
    const field = document.createElement('textarea')
    field.value = value
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()
    const success = document.execCommand('copy')
    field.remove()
    return success
  }

  dialog.querySelector('.promo-sorter-copy-del').addEventListener('click', async () => {
    const deletedIds = [...(categories['deleted'] || [])]
    if (deletedIds.length === 0) {
      status.textContent = 'No artworks currently marked for deletion.'
      setTimeout(() => { if (status.textContent.includes('No artworks')) status.textContent = '' }, 2500)
      return
    }
    const deletedItems = promoMedia.filter(item => deletedIds.includes(String(item.id)))
    const lines = [
      `Marked for deletion (${deletedItems.length} artworks):`,
      ...deletedItems.map(item => `- ID #${item.id} | ${getTitle(item)} | ${item.source}`)
    ]
    const text = lines.join('\n')
    const ok = await copyText(text)
    status.textContent = ok ? `Copied ${deletedItems.length} deleted items to clipboard!` : 'Logged deleted items to console.'
    console.log(text)
    setTimeout(() => { if (status.textContent.includes('deleted items')) status.textContent = '' }, 3500)
  })

  dialog.querySelector('.promo-sorter-copy').addEventListener('click', async () => {
    const config = {
      'key-visuals': [...categories['key-visuals']],
      'social-web-ads': [...categories['social-web-ads']],
      'print-packaging': [...categories['print-packaging']],
      'deleted': [...(categories['deleted'] || [])]
    }
    const json = JSON.stringify(config, null, 2)
    const success = await copyText(json)
    if (success) {
      status.textContent = 'Config copied to clipboard!'
    } else {
      status.textContent = 'Config logged to DevTools console.'
    }
    console.log('Promo Categories Config:\n', json)
    setTimeout(() => { if (status.textContent.includes('Config')) status.textContent = '' }, 3500)
  })

  dialog.querySelector('.ai-dev-close').addEventListener('click', () => dialog.close())
  dialog.querySelector('.promo-sorter-done').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close() })

  updateCounts()
  applyFilters()

  const open = () => {
    updateCounts()
    applyFilters()
    if (!dialog.open) dialog.showModal()
    search.focus()
  }

  if (trigger) trigger.addEventListener('click', open)

  return { open, categories, assignCategory, toggleDeleted }
}
