import { createCardShader } from './card-shader.js'
import { sheenConfig, sheenDefaults, sheenFields, sheenBlendModes, setSheen } from './sheen-config.js'

export function createSheenDevPanel() {
  const opener = document.createElement('button')
  opener.className = 'sheen-dev-open'
  opener.textContent = 'Sheen settings'
  opener.setAttribute('aria-expanded', 'false')
  opener.setAttribute('aria-controls', 'sheen-dev')
  const panel = document.createElement('section')
  panel.id = 'sheen-dev'
  panel.className = 'sheen-dev'
  panel.hidden = true
  panel.setAttribute('aria-label', 'Sheen developer settings')
  panel.innerHTML = `<div class="sheen-dev-heading"><strong>Card sheen / dev</strong><button type="button" data-close aria-label="Close sheen settings">×</button></div>
    <p>Hover the preview or your artwork. Changes save in this browser.</p>
    <div class="sheen-preview"></div>
    <label for="sheen-blend-mode">Blend mode</label><select id="sheen-blend-mode">${sheenBlendModes.map(mode => `<option value="${mode}">${mode.replaceAll('-', ' ')}</option>`).join('')}</select>
    ${sheenFields.map(([key, label, min, max, step]) => `<label for="sheen-${key}">${label}<output id="sheen-${key}-value"></output></label><input id="sheen-${key}" data-setting="${key}" type="range" min="${min}" max="${max}" step="${step}" />`).join('')}
    <label for="sheen-json">Shareable config</label><textarea id="sheen-json" spellcheck="false" rows="5"></textarea>
    <div class="sheen-dev-actions"><button type="button" data-copy>Copy config</button><button type="button" data-paste>Paste config</button><button type="button" data-apply>Apply JSON</button><button type="button" data-reset>Reset</button></div>
    <p class="sheen-status" role="status" aria-live="polite"></p>`
  document.body.append(opener, panel)
  const preview = panel.querySelector('.sheen-preview')
  const img = document.querySelector('#promo .mix-card img').cloneNode()
  img.loading = 'eager'
  preview.append(img)
  const shader = createCardShader()
  let pointer = { x: 0.55, y: 0.45 }
  const redraw = () => { if (!panel.hidden) shader.draw(preview, pointer.x, pointer.y) }
  img.addEventListener('load', redraw)
  preview.addEventListener('pointermove', event => {
    const rect = preview.getBoundingClientRect()
    pointer = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }
    redraw()
  })
  new ResizeObserver(() => { shader.clear(); redraw() }).observe(preview)
  const json = panel.querySelector('textarea')
  const status = panel.querySelector('.sheen-status')
  const blendMode = panel.querySelector('#sheen-blend-mode')
  blendMode.addEventListener('change', () => {
    setSheen({ ...sheenConfig, blendMode: blendMode.value }); sync(); status.textContent = 'Updated live.'
  })
  function sync() {
    blendMode.value = sheenConfig.blendMode
    panel.querySelectorAll('[data-setting]').forEach(input => {
      input.value = sheenConfig[input.dataset.setting]
      panel.querySelector(`#${input.id}-value`).textContent = input.value
    })
    json.value = JSON.stringify(sheenConfig, null, 2)
    redraw()
  }
  function close() { panel.hidden = true; shader.clear(); opener.setAttribute('aria-expanded', 'false'); opener.focus() }
  opener.addEventListener('click', () => {
    if (!panel.hidden) return close()
    panel.hidden = false
    opener.setAttribute('aria-expanded', 'true')
    sync()
  })
  panel.querySelector('[data-close]').addEventListener('click', close)
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') close() })
  panel.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('input', () => {
    setSheen({ ...sheenConfig, [input.dataset.setting]: Number(input.value) }); sync(); status.textContent = 'Updated live.'
  }))
  function apply(text) {
    try { setSheen(JSON.parse(text)); sync(); status.textContent = 'Config applied.' }
    catch (error) { status.textContent = error instanceof SyntaxError ? 'Invalid JSON. Paste the complete config object.' : error.message }
  }
  panel.querySelector('[data-apply]').addEventListener('click', () => apply(json.value))
  panel.querySelector('[data-copy]').addEventListener('click', async () => {
    sync()
    try { await navigator.clipboard.writeText(json.value); status.textContent = 'Copied. Paste it into our chat.' }
    catch { json.focus(); json.select(); status.textContent = 'Copy the selected config with Ctrl+C.' }
  })
  panel.querySelector('[data-paste]').addEventListener('click', async () => {
    try { const text = await navigator.clipboard.readText(); json.value = text; apply(text) }
    catch { json.focus(); status.textContent = 'Paste into the config box, then choose Apply JSON.' }
  })
  panel.querySelector('[data-reset]').addEventListener('click', () => { setSheen(sheenDefaults); sync(); status.textContent = 'Defaults restored.' })
}
