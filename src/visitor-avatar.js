import { DEFAULT_AVATAR } from '../vps-radar/avatar-options.mjs'

export function drawVisitorAvatar(canvas, options) {
  const a = { ...DEFAULT_AVATAR, ...options }
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 96, 96)
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h) }
  const frames = { oak: ['#9e7650', '#513b2c'], gold: ['#dfbb67', '#856c35'], blue: ['#6cabdd', '#284f70'], pink: ['#d69dbb', '#724e63'] }
  const [light, dark] = frames[a.frame] || frames.oak
  rect(0, 0, 96, 96, dark); rect(4, 4, 88, 88, light); rect(9, 9, 78, 78, '#18232c')
  rect(11, 11, 74, 2, '#0005'); rect(26, 72, 44, 15, '#6cabdd'); rect(40, 62, 16, 14, a.skin)
  rect(26, 25, 44, 38, a.skin); rect(30, 63, 36, 8, a.skin); rect(22, 41, 4, 12, a.skin); rect(70, 41, 4, 12, a.skin)
  if (a.hair !== 'none') {
    rect(24, 21, 48, 9, '#242027'); rect(26, 30, 7, 9, '#242027')
    if (a.hair === 'bob') { rect(22, 29, 7, 36, '#242027'); rect(68, 29, 7, 36, '#242027') }
    if (a.hair === 'curly') for (let i = 0; i < 5; i++) rect(23 + i * 10, 17 + i % 2 * 3, 12, 12, '#242027')
  }
  for (const x of [35, 55]) {
    if (a.eyes === 'happy') { rect(x, 43, 8, 3, '#201d23'); rect(x + 2, 40, 4, 3, '#201d23') }
    else if (a.eyes === 'sleepy' || (a.eyes === 'wink' && x === 55)) rect(x, 44, 8, 3, '#201d23')
    else rect(x + 2, 41, 4, 7, '#201d23')
  }
  if (a.mouth === 'smile') { rect(40, 58, 16, 3, '#713e36'); rect(37, 55, 3, 3, '#713e36'); rect(56, 55, 3, 3, '#713e36') }
  if (a.mouth === 'grin') { rect(37, 54, 22, 9, '#713e36'); rect(39, 55, 18, 4, '#fff8e8') }
  if (a.mouth === 'neutral') rect(40, 57, 16, 3, '#713e36')
  if (a.mouth === 'surprised') rect(44, 54, 8, 9, '#713e36')
  if (a.misc === 'glasses') { ctx.strokeStyle = '#18191d'; ctx.lineWidth = 2; ctx.strokeRect(31, 38, 16, 13); ctx.strokeRect(51, 38, 16, 13); rect(47, 43, 4, 2, '#18191d') }
  if (a.misc === 'blush') { rect(29, 50, 9, 4, '#d88589'); rect(59, 50, 9, 4, '#d88589') }
  if (a.misc === 'earrings') { rect(22, 53, 3, 7, '#efcd6e'); rect(71, 53, 3, 7, '#efcd6e') }
  if (a.hat === 'cap') { rect(24, 17, 48, 12, '#6cabdd'); rect(21, 27, 59, 5, '#345d7c') }
  if (a.hat === 'beanie') { rect(28, 14, 40, 17, '#c78296'); rect(23, 27, 50, 6, '#a9637a'); rect(43, 9, 10, 6, '#c78296') }
  if (a.hat === 'crown') { rect(28, 18, 40, 11, '#dfbb67'); for (const x of [28, 44, 60]) rect(x, 11, 8, 10, '#dfbb67') }
}
