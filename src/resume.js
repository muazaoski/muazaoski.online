import './resume.css'

const themeToggle = document.querySelector('#theme-toggle')
const themeLabel = themeToggle.querySelector('.theme-label')

function syncThemeToggle() {
  const dark = document.documentElement.dataset.theme === 'dark'
  themeToggle.setAttribute('aria-pressed', String(dark))
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`)
  themeLabel.textContent = dark ? 'Light' : 'Dark'
}

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('portfolio-theme', next) } catch { /* Theme still works for this visit. */ }
  syncThemeToggle()
})

syncThemeToggle()
