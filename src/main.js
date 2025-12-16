import './style.css'

const apps = [
  {
    name: 'Frog Multiplayer',
    icon: '🐸',
    desc: 'Chaos in the pond',
    url: 'http://localhost:5173', // Placeholder or local dev port for frog game if known
    target: '_blank'
  },
  {
    name: 'Freepik Dashboard',
    icon: '⚡',
    desc: 'Asset Command Center',
    url: 'http://dashboard.muazaoski.online', // Assuming this from previous conversations
    target: '_blank'
  },
  {
    name: 'System Status',
    icon: '🟢',
    desc: 'All systems operational',
    url: '#',
    target: '_self'
  }
]

document.querySelector('#app').innerHTML = `
  <header>
    <h1>MUAZAOSKI</h1>
    <div class="subtitle">/// ONLINE ///</div>
  </header>

  <div class="app-grid">
    ${apps.map(app => `
      <a href="${app.url}" class="app-card" target="${app.target}">
        <div class="app-icon">${app.icon}</div>
        <div class="app-name">${app.name}</div>
        <div class="app-desc">${app.desc}</div>
      </a>
    `).join('')}
  </div>

  <footer>
    [ SYSTEM READY ]
  </footer>
`
