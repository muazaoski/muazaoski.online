import './visitor-museum.css'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../vps-radar/avatar-options.mjs'
import { drawVisitorAvatar } from './visitor-avatar.js'

const APIS = ['https://frog.muazaoski.site/api/radar', 'https://frog.muazaoski.online/api/radar', '/api/radar']

export function initVisitorMuseum(selector) {
  const section = document.querySelector(selector)
  if (!section) return
  section.innerHTML = `
    <div class="museum-heading"><h2 id="museum-title">The visitor museum.</h2><button type="button" data-open aria-expanded="false" aria-controls="museum-composer">[ LEAVE A PORTRAIT + ]</button></div>
    <div class="museum-wall" data-wall aria-label="Visitor portrait wall"></div>
    <button type="button" data-more hidden>[ MORE PORTRAITS ↓ ]</button>
    <form id="museum-composer" class="museum-composer" hidden>
      <div class="museum-editor"><canvas class="museum-avatar-preview" width="96" height="96" role="img" aria-label="Your custom framed avatar"></canvas><div class="museum-options"></div></div>
      <label>Your name<input name="name" required maxlength="32" autocomplete="nickname" placeholder="What should we call you?"></label>
      <label>Your message<textarea name="message" required maxlength="400" placeholder="Leave something on the wall…"></textarea></label>
      <label class="museum-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <p class="museum-caption">Your name, portrait, message, date and approximate country will be public. No private details, please.</p>
      <div class="museum-actions"><button class="museum-submit" type="submit">HANG IT NOW!</button><button type="button" data-cancel>[ CANCEL ]</button></div>
    </form>
    <p class="museum-status" data-status role="status"></p>
    <dialog class="museum-detail" aria-labelledby="museum-comment-name"><canvas width="96" height="96" aria-hidden="true"></canvas><h3 id="museum-comment-name"></h3><p data-comment></p><p data-meta></p><button type="button">[ CLOSE × ]</button></dialog>`
  const form = section.querySelector('form'), preview = form.querySelector('canvas')
  const wall = section.querySelector('[data-wall]'), status = section.querySelector('[data-status]')
  const more = section.querySelector('[data-more]'), open = section.querySelector('[data-open]')
  const dialog = section.querySelector('dialog')
  const avatar = { ...DEFAULT_AVATAR }
  let entries = [], shown = 18, endpoint = null, loading = false, submitting = false
  let code = document.querySelector('#visitor-radar')?.dataset.countryCode || 'ZZ'
  window.addEventListener('visitor-country', event => { code = event.detail.code || 'ZZ' })
  const labels = { skin: 'Skin tone', eyes: 'Eyes', mouth: 'Mouth', hair: 'Hair', hat: 'Hat', misc: 'Extras', frame: 'Frame' }
  for (const [key, values] of Object.entries(AVATAR_OPTIONS)) {
    const label = document.createElement('label')
    label.textContent = labels[key]
    const select = document.createElement('select'); select.name = key
    values.forEach((value, index) => {
      const option = document.createElement('option'); option.value = value
      option.textContent = key === 'skin' ? ['Light', 'Warm', 'Tan', 'Brown', 'Deep', 'City blue'][index] : value[0].toUpperCase() + value.slice(1)
      select.append(option)
    })
    select.addEventListener('change', () => { avatar[key] = select.value; drawVisitorAvatar(preview, avatar) })
    label.append(select); form.querySelector('.museum-options').append(label)
  }
  drawVisitorAvatar(preview, avatar)
  function composer(visible) {
    form.hidden = !visible; open.setAttribute('aria-expanded', String(visible))
    if (visible) form.elements.name.focus(); else open.focus()
  }
  open.addEventListener('click', () => composer(form.hidden))
  section.querySelector('[data-cancel]').addEventListener('click', () => composer(false))
  dialog.querySelector('button').addEventListener('click', () => dialog.close())
  function showComment(entry) {
    drawVisitorAvatar(dialog.querySelector('canvas'), entry.avatar)
    dialog.querySelector('h3').textContent = entry.name
    dialog.querySelector('[data-comment]').textContent = entry.message
    const meta = dialog.querySelector('[data-meta]')
    meta.textContent = `${entry.country} · ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt))}`
    if (/^[A-Z]{2}$/.test(entry.code) && entry.code !== 'ZZ') {
      const flag = document.createElement('img'), countryCode = entry.code.toLowerCase()
      flag.src = ['my', 'sg', 'us', 'id', 'gb', 'jp', 'au', 'de', 'ca', 'fr', 'nl', 'kr'].includes(countryCode) ? `/flags/${countryCode}.svg` : `https://flagcdn.com/w80/${countryCode}.png`
      flag.alt = `${entry.country} flag`; flag.width = 24; flag.height = 16
      meta.prepend(flag, document.createTextNode(' '))
    }
    dialog.showModal()
  }
  function renderWall() {
    wall.replaceChildren()
    for (const entry of entries.slice(0, shown)) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'museum-portrait'
      button.setAttribute('aria-label', `Read ${entry.name}'s comment`)
      const canvas = document.createElement('canvas'); canvas.width = 96; canvas.height = 96
      canvas.setAttribute('aria-hidden', 'true'); drawVisitorAvatar(canvas, entry.avatar)
      button.append(canvas); button.addEventListener('click', () => showComment(entry)); wall.append(button)
    }
    if (!entries.length) {
      const empty = document.createElement('p'); empty.className = 'museum-empty'
      empty.textContent = endpoint ? 'An empty wall, waiting for its first face.' : 'The wall is taking a moment to open.'
      wall.append(empty)
    }
    more.hidden = entries.length <= shown
  }
  more.addEventListener('click', () => { shown += 18; renderWall() })
  async function load() {
    if (loading || submitting || document.hidden) return
    loading = true
    try {
      for (const base of endpoint ? [endpoint] : (section.dataset.api ? [section.dataset.api] : APIS)) {
        try {
          const response = await fetch(`${base}/guestbook`, { signal: AbortSignal.timeout(3000), cache: 'no-store' })
          if (!response.ok) continue
          const data = await response.json()
          if (!data.success || !Array.isArray(data.entries)) continue
          endpoint = base
          const changed = JSON.stringify(entries) !== JSON.stringify(data.entries)
          entries = data.entries
          if (changed || !wall.children.length) renderWall()
          if (!status.textContent.startsWith('Your portrait')) status.textContent = `${entries.length} ${entries.length === 1 ? 'portrait' : 'portraits'} hung on the wall.`
          return
        } catch (_) {}
      }
      if (!endpoint) renderWall()
    } finally { loading = false }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (submitting) return
    if (!form.elements.name.value.trim() || !form.elements.message.value.trim()) { status.textContent = 'Add your name and a message first.'; return }
    if (!endpoint) { await load(); if (!endpoint) { status.textContent = 'Could not connect. Please try again.'; return } }
    submitting = true
    const submit = form.querySelector('[type=submit]'); submit.disabled = true
    status.textContent = 'Hanging your portrait…'
    try {
      // Never retry POST across hosts: an interrupted response may already have saved.
      const response = await fetch(`${endpoint}/guestbook`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ name: form.elements.name.value, message: form.elements.message.value, avatar, code, website: form.elements.website.value })
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not save your portrait.')
      entries = [data.entry, ...entries.filter(entry => entry.id !== data.entry.id)]; renderWall()
      form.elements.message.value = ''; composer(false)
      status.textContent = 'Your portrait is on the wall. Thanks for leaving a little piece of you.'
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' || error.name === 'TypeError' ? 'Connection interrupted. Check the wall before trying again; your draft is still here.' : error.message
    } finally { submitting = false; submit.disabled = false }
  })
  load()
  setInterval(() => { if (section.isConnected) load() }, 20000)
}
