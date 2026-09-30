export function createFeaturedPicker({ trigger, collections, getTitle, featured }) {
  const dialog = document.createElement('dialog')
  dialog.className = 'ai-dev featured-picker'
  dialog.setAttribute('aria-labelledby', 'featured-picker-title')
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const entries = collections.flatMap(collection => collection.items.map(item => ({ item, collection })))
  dialog.innerHTML = `<div class="ai-dev-shell">
    <header class="ai-dev-header"><div><p>DEV TOOL / FEATURED PROJECT 05</p><h2 id="featured-picker-title">Pick Raya Store Deco.</h2></div><button class="ai-dev-close" type="button" aria-label="Close artwork picker">×</button></header>
    <div class="ai-dev-toolbar"><label><span>Find artwork</span><input type="search" placeholder="Search title or file…" /></label><label><span>Section</span><select><option value="">All sections</option>${collections.map(collection => `<option value="${escape(collection.id)}">${escape(collection.label)}</option>`).join('')}</select></label></div>
    <div class="ai-dev-summary"><strong class="picker-count"></strong><span>First checked artwork becomes the cover.</span></div>
    <div class="ai-dev-list" role="group" aria-label="Choose Raya Store Deco artwork">${entries.map(({item, collection}) => `<label class="ai-dev-item" data-section="${escape(collection.id)}" data-search="${escape(`${getTitle(item)} ${item.source} ${collection.label}`.toLowerCase())}"><input type="checkbox" value="${escape(item.id)}" /><span class="ai-dev-thumb"><img src="${escape(item.poster || item.src)}" alt="" loading="lazy" decoding="async" /></span><span class="ai-dev-meta"><strong>${escape(getTitle(item))}</strong><small>${escape(collection.label)} · WORK ${escape(item.id)}</small></span></label>`).join('')}</div>
    <footer class="ai-dev-footer"><p>Preview saved in this browser only. Copy the config and send it to me to publish your picks for everyone.</p><div><button class="picker-clear" type="button">Clear picks</button><button class="ai-dev-copy" type="button">Copy config</button><button class="picker-done" type="button">Done</button></div><output class="ai-dev-status" aria-live="polite"></output></footer>
  </div>`
  document.body.append(dialog)
  const search = dialog.querySelector('input[type="search"]')
  const filter = dialog.querySelector('select')
  const labels = [...dialog.querySelectorAll('.ai-dev-item')]
  const status = dialog.querySelector('output')
  const refresh = () => {
    const selected = featured.getSelection()
    labels.forEach(label => { label.querySelector('input').checked = selected.includes(label.querySelector('input').value) })
    dialog.querySelector('.picker-count').textContent = `${selected.length} selected`
  }
  const applyFilters = () => {
    const query = search.value.trim().toLowerCase()
    labels.forEach(label => { label.hidden = Boolean((filter.value && label.dataset.section !== filter.value) || (query && !label.dataset.search.includes(query))) })
  }
  // Start broad: Raya assets may be filed under promo, stickers or shop decor.
  const open = () => { refresh(); if (!dialog.open) dialog.showModal(); search.focus() }
  trigger.addEventListener('click', open)
  featured.setPicker(open)
  search.addEventListener('input', applyFilters)
  filter.addEventListener('change', applyFilters)
  dialog.querySelector('.ai-dev-list').addEventListener('change', event => {
    const input = event.target
    if (!input.matches('input[type="checkbox"]')) return
    const ids = featured.getSelection().filter(id => id !== input.value)
    if (input.checked) ids.push(input.value)
    featured.setSelection(ids)
    refresh()
    status.textContent = 'Preview saved in this browser.'
  })
  dialog.querySelector('.picker-clear').addEventListener('click', () => { featured.setSelection([]); refresh(); status.textContent = 'Picks cleared.' })
  dialog.querySelector('.ai-dev-copy').addEventListener('click', async () => {
    const config = JSON.stringify({ project: 'Raya Store Deco', itemIds: featured.getSelection() }, null, 2)
    try { await navigator.clipboard.writeText(config); status.textContent = 'Config copied. Send it to me to publish.' }
    catch { status.textContent = config }
  })
  dialog.querySelector('.ai-dev-close').addEventListener('click', () => dialog.close())
  dialog.querySelector('.picker-done').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
}
