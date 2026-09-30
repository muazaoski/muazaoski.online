import projects from './featured-projects.json'

export const FEATURED_STORAGE_KEY = 'muazaoski-featured-raya-ids-v1'

export function createFeaturedProjects({ media, openMedia, devMode, isAiLabeled }) {
  const grid = document.querySelector('.featured-grid')
  const byId = new Map(media.map(item => [String(item.id), item]))
  let rayaIds = projects[4].itemIds
  if (devMode) {
    try {
      const saved = JSON.parse(localStorage.getItem(FEATURED_STORAGE_KEY))
      if (Array.isArray(saved)) rayaIds = saved.filter(id => byId.has(String(id))).map(String)
    } catch { /* Published selection remains the default. */ }
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  function render() {
    grid.innerHTML = projects.map((project, index) => {
      const ids = index === 4 ? rayaIds : project.itemIds
      const cover = byId.get(project.coverId || ids?.[0])
      const covers = project.coverIds ? project.coverIds.map(id => byId.get(id)).filter(Boolean) : cover ? [cover] : []
      const action = project.collectionId ? 'Explore project' : cover?.kind === 'video' ? 'Play film' : cover ? 'View artwork' : 'Selection coming soon'
      const tag = project.collectionId ? 'a' : cover || devMode ? 'button' : 'div'
      const attributes = project.collectionId ? `href="#${project.collectionId}"` : tag === 'button' ? `type="button" data-featured-index="${index}"` : ''
      const copy = index === 4 && cover ? `${rayaIds.length} selected ${rayaIds.length === 1 ? 'piece' : 'pieces'} from the Hari Raya store decoration project.` : project.description
      return `<li class="featured-slot featured-slot--project${index === 0 ? ' featured-slot--lead' : ''}${cover ? '' : ' featured-slot--pending'}">
        <${tag} class="featured-project" ${attributes} aria-label="${escape(cover || project.collectionId ? `${action}: ${project.title}` : devMode ? 'Pick Raya Store Deco artwork' : project.title)}">
          <div class="featured-project-visual${covers.length > 1 ? ' featured-project-visual--grid' : ''}">${cover ? `${covers.map(item => `<img src="${escape(item.poster || item.src)}" alt="" width="${item.width}" height="${item.height}" loading="lazy" decoding="async" />`).join('')}${cover.kind === 'video' && !project.collectionId ? '<span class="featured-play" aria-hidden="true">▶</span>' : ''}${isAiLabeled(cover.id) ? '<span class="ai-label-badge" aria-label="AI-assisted"><img src="/icon/ai-label.webp" alt="" /></span>' : ''}` : '<span class="featured-pending-number" aria-hidden="true">05</span>'}</div>
          <div class="featured-project-details"><div class="featured-slot-top"><span>${String(index + 1).padStart(2, '0')} / ${project.category}</span>${!cover ? '<span>Selection pending</span>' : ''}</div><h3>${escape(project.title)}</h3><p>${escape(copy)}</p><span class="featured-project-action">${!cover && devMode ? 'Pick artwork' : action}<span aria-hidden="true">${cover || project.collectionId ? '↗' : '+'}</span></span></div>
        </${tag}>
      </li>`
    }).join('')
  }
  let openPicker = () => {}
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-featured-index]')
    if (!button) return
    const index = Number(button.dataset.featuredIndex)
    const ids = index === 4 ? rayaIds : projects[index].itemIds
    const items = ids.map(id => byId.get(id)).filter(Boolean)
    if (items.length) openMedia(items)
    else if (devMode) openPicker()
  })
  render()
  return {
    render,
    getSelection: () => [...rayaIds],
    setSelection(ids) {
      rayaIds = [...new Set(ids.map(String))].filter(id => byId.has(id))
      try { localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(rayaIds)) } catch { /* Preview works without storage. */ }
      render()
    },
    setPicker(callback) { openPicker = callback }
  }
}
