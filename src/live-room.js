import './live-room.css'

const ROOM_APIS = ['https://frog.muazaoski.site/api/radar', 'https://frog.muazaoski.online/api/radar', '/api/radar']

export function initLiveRoom(selector) {
  const section = document.querySelector(selector)
  if (!section) return
  const canvas = section.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const status = section.querySelector('[data-room-status]')
  const id = crypto.randomUUID()
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  let visitors = [{ id }]
  let endpoint = null
  let syncing = false
  let inView = false
  let frame = 0
  let lastDraw = 0
  const project = (u, v, height = 0) => [320 + (u - v) * 230, 110 + (u + v) * 100 - height]

  function polygon(points, fill) {
    ctx.beginPath()
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }
  function block(u, v, width, depth, height, colors) {
    const base = [project(u, v), project(u + width, v), project(u + width, v + depth), project(u, v + depth)]
    const top = base.map(([x, y]) => [x, y - height])
    polygon([base[1], base[2], top[2], top[1]], colors[1])
    polygon([base[2], base[3], top[3], top[2]], colors[2])
    polygon(top, colors[0])
  }
  function drawRoom() {
    const back = project(0, 0), right = project(1, 0), left = project(0, 1), front = project(1, 1)
    polygon([back, right, [right[0], right[1] - 85], [back[0], back[1] - 85]], '#121820')
    polygon([left, back, [back[0], back[1] - 85], [left[0], left[1] - 85]], '#1b242d')
    polygon([back, right, front, left], '#151b21')
    // Quiet floor seams, rather than a box around the whole section.
    ctx.strokeStyle = '#263039'
    ctx.lineWidth = .8
    for (let tile = 1; tile < 6; tile++) {
      for (const points of [[project(tile / 6, 0), project(tile / 6, 1)], [project(0, tile / 6), project(1, tile / 6)]]) {
        ctx.beginPath(); ctx.moveTo(...points[0]); ctx.lineTo(...points[1]); ctx.stroke()
      }
    }
    // Window and its pale blue light on the left wall.
    polygon([[158, 112], [244, 75], [244, 117], [158, 154]], '#71a8ce')
    polygon([[164, 117], [239, 84], [239, 91], [164, 124]], '#b6d6ec')
    polygon([project(.07, .47), project(.2, .12), project(.55, .45), project(.35, .78)], '#6cabdd0c')
    block(.12, .05, .32, .16, 28, ['#8c7965', '#453a31', '#5b4c40'])
    block(.22, .065, .11, .035, 49, ['#42505c', '#202b35', '#263947'])
    polygon([project(.23, .104, 48), project(.32, .104, 48), project(.32, .104, 34), project(.23, .104, 34)], '#6cabdd')
    block(.025, .58, .14, .3, 18, ['#647181', '#303b48', '#414e5f'])
    block(.025, .58, .035, .3, 30, ['#68788a', '#354150', '#4b5869'])
    block(.85, .06, .08, .08, 17, ['#aa8364', '#634c3c', '#785b43'])
    const plant = project(.89, .1, 19)
    ctx.strokeStyle = '#5e846c'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(...plant); ctx.lineTo(plant[0], plant[1] - 28); ctx.stroke()
    for (let leaf = 0; leaf < 4; leaf++) {
      ctx.fillStyle = leaf % 2 ? '#74937c' : '#476852'
      ctx.beginPath(); ctx.ellipse(plant[0] + (leaf % 2 ? 6 : -6), plant[1] - 8 - leaf * 6, 8, 4, leaf % 2 ? -.5 : .5, 0, Math.PI * 2); ctx.fill()
    }
  }
  function seedFor(value) {
    let seed = 2166136261
    for (const character of value) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619)
    return seed >>> 0
  }
  function waypoint(seed, step) {
    const random = n => {
      const value = Math.sin(seed * .001 + n * 127.1) * 43758.5453
      return value - Math.floor(value)
    }
    return [.28 + random(step * 2) * .52, .28 + random(step * 2 + 1) * .52]
  }
  function walker(visitor, time) {
    const seed = seedFor(visitor.id)
    const phase = (reducedMotion.matches ? seed % 1000 : time / 7500 + seed % 1000)
    const step = Math.floor(phase), amount = phase - step
    const from = waypoint(seed, step), to = waypoint(seed, step + 1)
    const u = from[0] + (to[0] - from[0]) * amount
    const v = from[1] + (to[1] - from[1]) * amount
    return { visitor, seed, u, v, point: project(u, v), stride: reducedMotion.matches ? 0 : Math.sin(time / 125 + seed) * 3 }
  }
  function drawPerson(person) {
    const [x, y] = person.point
    const own = person.visitor.id === id
    ctx.fillStyle = '#0006'; ctx.beginPath(); ctx.ellipse(x, y + 1, 10, 4, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#080a0e'; ctx.lineWidth = 4; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x - 3, y - 9); ctx.lineTo(x - 4 - person.stride, y); ctx.moveTo(x + 3, y - 9); ctx.lineTo(x + 4 + person.stride, y); ctx.stroke()
    ctx.strokeStyle = '#bdc7d0'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(x - 6, y - 24); ctx.lineTo(x - 7 + person.stride, y - 13); ctx.moveTo(x + 6, y - 24); ctx.lineTo(x + 7 - person.stride, y - 13); ctx.stroke()
    ctx.fillStyle = own ? '#6cabdd' : ['#b89680', '#92a992', '#b1a5c4', '#e0d5ba'][person.seed % 4]
    ctx.fillRect(x - 5, y - 26, 10, 16)
    ctx.fillStyle = '#ddbea6'; ctx.fillRect(x - 5, y - 38, 10, 11)
    ctx.fillStyle = '#25232a'; ctx.fillRect(x - 5, y - 39, 10, 4)
    ctx.fillStyle = '#16191d'; ctx.fillRect(x + 2, y - 33, 2, 2)
    if (own) {
      ctx.font = '700 13px "Pixelify Sans", monospace'
      ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 4
      ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff'
      ctx.strokeText('YOU', x, y - 47); ctx.fillText('YOU', x, y - 47)
    }
  }
  function draw(time = Date.now()) {
    ctx.clearRect(0, 0, 640, 370)
    drawRoom()
    visitors.map(visitor => walker(visitor, time)).sort((a, b) => a.u + a.v - b.u - b.v).forEach(drawPerson)
  }
  function animate(time) {
    frame = 0
    if (!inView || document.hidden) return
    if (time - lastDraw >= 33) { draw(); lastDraw = time }
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate)
  }
  function syncAnimation() {
    cancelAnimationFrame(frame); frame = 0
    if (inView && !document.hidden) { draw(); if (!reducedMotion.matches) frame = requestAnimationFrame(animate) }
  }
  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2)
    canvas.width = 640 * ratio; canvas.height = 370 * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    draw()
  }
  function leave() {
    if (endpoint) navigator.sendBeacon(`${endpoint}/room/leave`, JSON.stringify({ id }))
  }
  async function heartbeat() {
    if (document.hidden || syncing) return
    syncing = true
    try {
      for (const base of endpoint ? [endpoint] : ROOM_APIS) {
        try {
          const response = await fetch(`${base}/room`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }), signal: AbortSignal.timeout(3000)
          })
          if (!response.ok) continue
          const data = await response.json()
          if (!data.success || !Array.isArray(data.visitors)) continue
          endpoint = base
          visitors = data.visitors.filter(visitor => typeof visitor.id === 'string')
          if (!visitors.some(visitor => visitor.id === id)) visitors.push({ id })
          status.textContent = `${visitors.length} ${visitors.length === 1 ? 'person' : 'people'} here right now`
          canvas.setAttribute('aria-label', `Studio room with ${visitors.length} active visitors. Your avatar is labelled YOU.`)
          if (document.hidden) leave()
          draw()
          return
        } catch (_) {}
      }
      endpoint = null
      visitors = [{ id }]
      status.textContent = 'Just you · shared room offline'
      draw()
    } finally { syncing = false }
  }
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncAnimation() }).observe(section)
  new ResizeObserver(resize).observe(canvas)
  reducedMotion.addEventListener('change', syncAnimation)
  document.addEventListener('visibilitychange', () => { syncAnimation(); document.hidden ? leave() : heartbeat() })
  window.addEventListener('pagehide', leave)
  window.addEventListener('pageshow', () => { syncAnimation(); heartbeat() })
  document.fonts.ready.then(() => draw())
  resize()
  heartbeat()
  setInterval(heartbeat, 15000)
}
