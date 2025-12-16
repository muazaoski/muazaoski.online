import './style.css'

const mainApps = [
  {
    name: 'Frog Online',
    icon: '🐸',
    url: 'http://localhost:5173', // Placeholder
    target: '_blank'
  },
  {
    name: 'Dash',
    icon: '⚡',
    url: 'https://dashboard.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Files',
    icon: '📂',
    url: '#',
    target: '_self'
  },
  {
    name: 'Terminal',
    icon: '📟',
    url: '#',
    target: '_self'
  }
]

const dockApps = [
  {
    name: 'Phone',
    icon: '📞',
    url: '#',
    target: '_self'
  },
  {
    name: 'Mail',
    icon: '✉️',
    url: '#',
    target: '_self'
  },
  {
    name: 'Safari',
    icon: '🧭',
    url: 'https://google.com',
    target: '_blank'
  },
  {
    name: 'Music',
    icon: '🎵',
    url: '#',
    target: '_self',
    id: 'music-app',
    isMusic: true
  }
]

const renderApp = (app) => `
  <a href="${app.url}" class="app-item ${app.isMusic ? 'music-trigger' : ''}" target="${app.target}" ${app.id ? `id="${app.id}"` : ''}>
    <div class="icon-box">${app.icon}</div>
    <span class="app-label">${app.name}</span>
  </a>
`

const updateTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

document.querySelector('#app').innerHTML = `
  <div class="status-bar">
    <div class="time" id="clock">--:--</div>
    <div class="status-icons">5G 📶 🔋 100%</div>
  </div>

  <div class="home-screen">
    ${mainApps.map(renderApp).join('')}
  </div>

  <div class="dock-container">
    ${dockApps.map(renderApp).join('')}
  </div>
`

// Real-time clock update
setInterval(() => {
  document.getElementById('clock').innerText = updateTime();
}, 1000);
document.getElementById('clock').innerText = updateTime();

// Music Logic
const musicUrl = 'https://audio1.syok.my/hitz';
const audio = new Audio(musicUrl);
let isPlaying = false;

const musicApp = document.getElementById('music-app');
const musicIcon = musicApp.querySelector('.icon-box');

// Muted icon (disabled state)
const activeIcon = '🎵';
const mutedIcon = '🔇';

musicApp.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent default anchor behavior

  if (isPlaying) {
    audio.pause();
    musicIcon.innerText = mutedIcon;
    musicIcon.classList.add('muted');
    isPlaying = false;
  } else {
    audio.play().catch(err => console.error("Audio play failed:", err));
    musicIcon.innerText = activeIcon;
    musicIcon.classList.remove('muted');
    isPlaying = true;
  }
});
