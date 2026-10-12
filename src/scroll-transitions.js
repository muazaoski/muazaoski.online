/**
 * Continuous Scroll-Synced In & Out Transitions
 * Supports native CSS ViewTimeline / Scroll-Driven Animations
 * with high-performance IntersectionObserver & scroll-sync fallback.
 */

export function initScrollTransitions() {
  const hasNative = window.CSS &&
    typeof CSS.supports === 'function' &&
    CSS.supports('(animation-timeline: view()) and (animation-range: entry)')

  const selectors = [
    '.scroll-reveal',
    '.about-section',
    '.career-grid > .experience-card',
    '.featured-heading',
    '.featured-spotlight-container',
    '.featured-browse',
    '.tape-label',
    '#montage > .collection',
    '.digital-heading',
    '#projects > .app-card',
    '.ux-heading',
    '.ux-project',
    '.visitor-radar-section',
    '.live-room-section',
    '.visitor-museum',
    '.contact-section',
    'footer',
    '.resume-summary',
    '.document-heading',
    '.resume-pages > figure',
    '.contact'
  ]

  const getTargetElements = () => {
    return Array.from(document.querySelectorAll(selectors.join(',')))
  }

  // If browser natively supports compositor-driven view timelines,
  // ensure elements are tagged with .scroll-reveal class for any future style hooks.
  if (hasNative) {
    const markElements = () => {
      getTargetElements().forEach(el => el.classList.add('scroll-reveal'))
    }
    markElements()
    // Re-check after async mounts (montage, projects, etc.)
    setTimeout(markElements, 100)
    setTimeout(markElements, 600)
    return
  }

  // --- Fallback for browsers without native view() timeline (e.g., Firefox) ---
  document.documentElement.classList.add('no-scroll-timeline')

  const observed = new WeakSet()
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target
      const rect = entry.boundingClientRect

      if (entry.isIntersecting) {
        el.classList.add('is-in-view')
        el.classList.remove('is-exited-top', 'is-exited-bottom')
      } else {
        el.classList.remove('is-in-view')
        if (rect.top < 0) {
          el.classList.add('is-exited-top')
          el.classList.remove('is-exited-bottom')
        } else {
          el.classList.add('is-exited-bottom')
          el.classList.remove('is-exited-top')
        }
      }
    })
  }, {
    threshold: [0, 0.1, 0.2],
    rootMargin: '10px 0px 10px 0px'
  })

  const attachFallback = () => {
    const elements = getTargetElements()
    elements.forEach(el => {
      el.classList.add('scroll-reveal')
      if (!observed.has(el)) {
        observed.add(el)
        observer.observe(el)

        // Initial check for elements already in viewport on load
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight || document.documentElement.clientHeight
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add('is-in-view')
        } else if (rect.top < 0) {
          el.classList.add('is-exited-top')
        } else {
          el.classList.add('is-exited-bottom')
        }
      }
    })
  }

  attachFallback()
  setTimeout(attachFallback, 150)
  setTimeout(attachFallback, 600)

  // Listen for scroll to handle dynamic changes
  window.addEventListener('scroll', () => {
    // Handled by IntersectionObserver passively
  }, { passive: true })
}
