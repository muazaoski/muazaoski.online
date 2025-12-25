import './style.css'

const mainApps = [
  {
    name: 'Frog Online',
    icon: '🐸',
    url: 'https://frog.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Workout',
    icon: '💪',
    url: 'https://workout.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Size Chart',
    icon: '📏',
    url: 'https://chart.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Finance',
    icon: '💰',
    url: 'https://financeme.cc',
    target: '_blank'
  },
  {
    name: 'OCR',
    icon: '🔍',
    url: 'https://ocr.muazaoski.online',
    target: '_blank'
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

// Music Logic - Using a reliable public radio stream
const musicStreams = [
  'https://stream.zeno.fm/fyn8eh3h5f8uv', // Lofi Girl
  'https://usa9.fastcast4u.com/proxy/jamz?mp=/1', // Backup stream
];
let currentStreamIndex = 0;
let audio = new Audio(musicStreams[currentStreamIndex]);
audio.crossOrigin = 'anonymous';
let isPlaying = false;

const musicApp = document.getElementById('music-app');
const musicIcon = musicApp.querySelector('.icon-box');

// Icons
const playingIcon = '🎵';
const pausedIcon = '🔇';
const loadingIcon = '⏳';

// Try next stream if current fails
audio.addEventListener('error', () => {
  console.log('Stream failed, trying backup...');
  currentStreamIndex = (currentStreamIndex + 1) % musicStreams.length;
  audio.src = musicStreams[currentStreamIndex];
  if (isPlaying) {
    audio.play().catch(() => {
      musicIcon.innerText = pausedIcon;
      isPlaying = false;
    });
  }
});

musicApp.addEventListener('click', (e) => {
  e.preventDefault();

  if (isPlaying) {
    audio.pause();
    musicIcon.innerText = pausedIcon;
    musicIcon.classList.add('muted');
    isPlaying = false;
  } else {
    musicIcon.innerText = loadingIcon;
    audio.play()
      .then(() => {
        musicIcon.innerText = playingIcon;
        musicIcon.classList.remove('muted');
        isPlaying = true;
      })
      .catch(err => {
        console.error("Audio play failed:", err);
        musicIcon.innerText = pausedIcon;
        isPlaying = false;
      });
  }
});
