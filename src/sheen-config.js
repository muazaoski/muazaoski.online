export const sheenDefaults = Object.freeze({ intensity: 1, bandWidth: 1, glowSize: 1, rainbow: 1, angle: 30, frequency: 2, blendMode: 'normal', edgeIntensity: 1, edgeWidth: 3 })
export const sheenBlendModes = ['normal', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'multiply', 'lighten', 'darken', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
export const sheenFields = [
  ['intensity', 'Intensity', 0, 4, 0.05],
  ['bandWidth', 'Sheen width', 0.2, 4, 0.05],
  ['glowSize', 'Glow size', 0.2, 4, 0.05],
  ['rainbow', 'Rainbow color', 0, 1, 0.05],
  ['angle', 'Sheen angle', -180, 180, 1],
  ['frequency', 'Color bands', 0.2, 6, 0.1],
  ['edgeIntensity', 'Edge intensity', 0, 3, 0.05],
  ['edgeWidth', 'Edge width (px)', 1, 12, 0.5]
]
export function validateSheen(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Paste a sheen config object.')
  if (Object.keys(value).some(key => !Object.hasOwn(sheenDefaults, key))) throw new Error('Config contains an unknown setting.')
  const result = {}
  for (const [key, label, min, max] of sheenFields) {
    const setting = value[key] === undefined && key.startsWith('edge') ? sheenDefaults[key] : value[key]
    if (typeof setting !== 'number' || !Number.isFinite(setting) || setting < min || setting > max) {
      throw new Error(`${label} must be a number from ${min} to ${max}.`)
    }
    result[key] = setting
  }
  // Older shared configs retain their original normal blending.
  result.blendMode = value.blendMode === undefined ? sheenDefaults.blendMode : value.blendMode
  if (!sheenBlendModes.includes(result.blendMode)) throw new Error('Choose a supported blend mode.')
  return result
}
export const sheenConfig = { ...sheenDefaults }
if (import.meta.env.DEV) {
  try { Object.assign(sheenConfig, validateSheen(JSON.parse(localStorage.getItem('portfolio-sheen')))) } catch { /* Use defaults. */ }
}
export function setSheen(value) {
  Object.assign(sheenConfig, validateSheen(value))
  try { localStorage.setItem('portfolio-sheen', JSON.stringify(sheenConfig)) } catch { /* Session settings still work. */ }
  dispatchEvent(new Event('sheen-change'))
}
