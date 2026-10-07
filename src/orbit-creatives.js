export function initOrbitCreatives() {
  const portrait = document.querySelector('.about-portrait')
  if (!portrait) return

  // Prevent multiple instantiations
  if (portrait.querySelector('.orbit-container')) return

  const tools = [
    {
      id: 'blender',
      name: 'Blender',
      src: '/creative-icons/blender.svg',
      glow: '#ea7600'
    },
    {
      id: 'photoshop',
      name: 'Adobe Photoshop',
      src: '/creative-icons/photoshop.svg',
      glow: '#31a8ff'
    },
    {
      id: 'illustrator',
      name: 'Adobe Illustrator',
      src: '/creative-icons/illustrator.svg',
      glow: '#ff9a00'
    },
    {
      id: 'after-effects',
      name: 'Adobe After Effects',
      src: '/creative-icons/after-effects.svg',
      glow: '#9999ff'
    },
    {
      id: 'premiere-pro',
      name: 'Adobe Premiere Pro',
      src: '/creative-icons/premiere-pro.svg',
      glow: '#ea77ff'
    },
    {
      id: 'figma',
      name: 'Figma',
      src: '/creative-icons/figma.svg',
      glow: '#a259ff'
    }
  ]

  const container = document.createElement('div')
  container.className = 'orbit-container'
  container.setAttribute('aria-label', 'Official creative software tools in 3D orbit')

  const items = tools.map(tool => {
    const el = document.createElement('div')
    el.className = `orbit-item orbit-item--${tool.id}`
    el.setAttribute('data-name', tool.name)
    el.style.setProperty('--tool-glow', tool.glow)

    const card = document.createElement('div')
    card.className = `orbit-card orbit-card--${tool.id}`

    const img = document.createElement('img')
    img.src = tool.src
    img.alt = tool.name
    img.className = `orbit-icon-img orbit-icon-img--${tool.id}`
    img.width = 48
    img.height = 48
    img.loading = 'eager'
    img.decoding = 'async'

    const label = document.createElement('span')
    label.className = 'orbit-label'
    label.textContent = tool.name

    card.append(img)
    el.append(card, label)
    container.append(el)
    return { el, tool }
  })

  portrait.append(container)

  let angle = 0
  let isHovered = false
  let isVisible = true
  let rafId = null
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

  container.addEventListener('pointerenter', () => { isHovered = true })
  container.addEventListener('pointerleave', () => { isHovered = false })

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting
    if (isVisible && !rafId && !reducedMotion.matches) {
      rafId = requestAnimationFrame(tick)
    }
  })
  observer.observe(portrait)

  function updatePositions() {
    const rect = portrait.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    if (!width || !height) return

    // Torso center at ~50% X and 61% Y
    const cx = width * 0.50
    const cy = height * 0.61

    // Radii: Rx covers shoulders/arms, Ry gives tilted perspective
    const rx = width * 0.39
    const ry = height * 0.13
    const tilt = -0.16 // slight diagonal tilt matching body posture

    items.forEach(({ el }, i) => {
      const phi = angle + (i * (Math.PI * 2) / items.length)
      const xNorm = Math.cos(phi)
      const zNorm = Math.sin(phi) // +1 is front, -1 is back
      const yNorm = (zNorm * 0.8) + (xNorm * tilt)

      const px = cx + (xNorm * rx)
      const py = cy + (yNorm * ry)

      const isFront = zNorm >= -0.05
      const scale = isFront
        ? 0.94 + 0.22 * zNorm
        : 0.78 + 0.16 * (zNorm + 1)

      const opacity = isFront
        ? 1
        : 0.62 + 0.38 * (zNorm + 1)

      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      el.style.opacity = opacity.toFixed(3)
      el.style.zIndex = isFront ? '4' : '0'

      if (isFront) {
        el.classList.add('is-front')
        el.classList.remove('is-back')
      } else {
        el.classList.add('is-back')
        el.classList.remove('is-front')
      }
    })
  }

  function tick() {
    if (!isVisible || document.hidden) {
      rafId = null
      return
    }

    if (!reducedMotion.matches) {
      const speed = isHovered ? 0.0025 : 0.0075
      angle = (angle + speed) % (Math.PI * 2)
      updatePositions()
      rafId = requestAnimationFrame(tick)
    } else {
      updatePositions()
      rafId = null
    }
  }

  // Initial position calculation
  updatePositions()
  if (!reducedMotion.matches) {
    rafId = requestAnimationFrame(tick)
  }

  window.addEventListener('resize', updatePositions, { passive: true })
}
