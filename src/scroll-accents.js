export function createScrollAccents() {
  const scene = document.createElement('div')
  scene.className = 'scroll-accents'
  scene.setAttribute('aria-hidden', 'true')
  scene.innerHTML = [0, 1].map(index => `<div class="scroll-orbit orbit-${index}"><div class="orbit-core"><i></i><i></i><i></i><b></b></div></div>`).join('')
  document.body.prepend(scene)
  const orbits = [...scene.querySelectorAll('.orbit-core')]
  let enabled = true
  let frame = 0
  function draw() {
    frame = 0
    if (!enabled || document.hidden) return
    const position = scrollY
    orbits.forEach((orbit, index) => {
      const direction = index ? -1 : 1
      orbit.style.transform = `translateY(${Math.sin(position / 650 + index) * 55}px) rotateX(${35 + Math.sin(position / 800) * 30}deg) rotateY(${position * 0.075 * direction}deg) rotateZ(${position * 0.025 * direction}deg)`
    })
  }
  function schedule() { if (enabled && !frame) frame = requestAnimationFrame(draw) }
  addEventListener('scroll', schedule, { passive: true })
  document.addEventListener('visibilitychange', schedule)
  return { setEnabled(value) {
    enabled = value
    scene.hidden = !value
    if (value) schedule()
  } }
}
