import './style.css'

const mainApps = [
  {
    name: 'Frog Online',
    icon: '/frog.svg',
    url: 'https://frog.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Workout',
    icon: '/workout.svg',
    url: 'https://workout.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Size Chart',
    icon: '/sizechart.svg',
    url: 'https://chart.muazaoski.online',
    target: '_blank'
  },
  {
    name: 'Finance',
    icon: '/financeme.svg',
    url: 'https://financeme.cc',
    target: '_blank'
  },
  {
    name: 'OCR',
    icon: '/ocr.svg',
    url: 'https://ocr.muazaoski.online',
    target: '_blank'
  }
]

const dockApps = [
  {
    name: 'Phone',
    icon: '📞',
    url: '#',
    target: '_self',
    id: 'phone-app'
  },
  {
    name: 'Mail',
    icon: '✉️',
    url: '#',
    target: '_self',
    id: 'mail-app'
  },
  {
    name: 'Browser',
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

const renderApp = (app) => {
  const isImageContainer = app.icon.includes('.') && (app.icon.endsWith('.svg') || app.icon.endsWith('.png'));
  const iconContent = isImageContainer
    ? `<img src="${app.icon}" alt="${app.name}" class="app-icon-img" />`
    : app.icon;

  return `
    <a href="${app.url}" class="app-item ${app.isMusic ? 'music-trigger' : ''}" target="${app.target}" ${app.id ? `id="${app.id}"` : ''}>
      <div class="icon-box ${isImageContainer ? 'has-img' : ''}">${iconContent}</div>
      <span class="app-label">${app.name}</span>
    </a>
  `;
}

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

  <!-- Modal Structure -->
  <div id="modal-container" class="modal-overlay">
    <div class="modal-content">
      <button id="modal-close" class="modal-close">&times;</button>
      <div id="modal-body"></div>
    </div>
  </div>
`

// Real-time clock update
setInterval(() => {
  document.getElementById('clock').innerText = updateTime();
}, 1000);
document.getElementById('clock').innerText = updateTime();

// Music Logic - Using a reliable public radio stream
const musicStreams = [
  'https://audio1.syok.my/hitz', // HITZ Radio
  'https://stream.zeno.fm/fyn8eh3h5f8uv', // Lofi Girl (fallback)
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

// Modal Logic
const modal = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

const showModal = (content) => {
  modalBody.innerHTML = content;
  modal.classList.add('active');
};

const hideModal = () => {
  modal.classList.remove('active');
};

modalClose.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) hideModal();
});

document.getElementById('mail-app').addEventListener('click', (e) => {
  e.preventDefault();
  showModal(`
    <div class="mail-modal">
      <div class="modal-icon">✉️</div>
      <h3>Email Me</h3>
      <p class="email-text">muazaoski@gmail.com</p>
      <a href="mailto:muazaoski@gmail.com" class="action-btn">Send Message</a>
    </div>
  `);
});

document.getElementById('phone-app').addEventListener('click', (e) => {
  e.preventDefault();
  showModal(`
    <div class="phone-modal">
      <div class="modal-icon">📞</div>
      <h3>Contact</h3>
      <div class="qr-container">
        <img src="/qrphone.png" alt="Phone QR" class="qr-image" />
      </div>
      <a href="https://wa.link/q0lcu2" target="_blank" class="action-btn">Chat me!</a>
    </div>
  `);
});
