const passcodeInput = document.getElementById('passcodeInput');
const enterButton = document.getElementById('enterButton');
const errorText = document.getElementById('errorText');
const lockScreen = document.getElementById('lockScreen');
const mainContent = document.getElementById('mainContent');
const showReveal = document.getElementById('showReveal');
const timelineSection = document.getElementById('timelineSection');
const openMessage = document.getElementById('openMessage');
const messageSection = document.getElementById('messageSection');
const heroImage = document.getElementById('heroImage');
const heroPlaceholder = document.getElementById('heroPlaceholder');
const timelineGrid = document.getElementById('timelineGrid');
const DB_NAME = 'birthdayTimelineDB';
const DB_STORE = 'images';
const MAX_TIMELINE_ENTRIES = 10;
const DEFAULT_TIMELINE_TITLES = Array.from({ length: MAX_TIMELINE_ENTRIES }, (_, index) => `Memory ${index + 1}`);
const DEFAULT_TIMELINE_TEXT = '';
const timelineRefs = [];
const confettiContainer = document.getElementById('confetti');

const PASSCODE = '30-05-2006';
let audioContext;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });
}

function getImageBlob(db, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readonly');
    const store = transaction.objectStore(DB_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error);
  });
}

async function getImageUrl(key) {
  try {
    const db = await openDatabase();
    const blob = await getImageBlob(db, key);
    return blob ? URL.createObjectURL(blob) : '';
  } catch (error) {
    console.warn('Unable to load image from IndexedDB', error);
    return '';
  }
}

enterButton.addEventListener('click', validatePasscode);
passcodeInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') validatePasscode();
});
document.addEventListener('DOMContentLoaded', loadTimelineFromStorage);
showReveal.addEventListener('click', () => {
  timelineSection.classList.remove('hidden');
  timelineSection.scrollIntoView({ behavior: 'smooth' });
  startConfetti();
});
openMessage.addEventListener('click', () => {
  messageSection.classList.remove('hidden');
  messageSection.scrollIntoView({ behavior: 'smooth' });
});

function validatePasscode() {
  const value = passcodeInput.value.trim();
  if (value === PASSCODE) {
    lockScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
    loadTimelineFromStorage();
    playHappyBirthday();
    startConfetti();
  } else {
    errorText.textContent = 'Passcode is incorrect. Try again!';
    setTimeout(() => (errorText.textContent = ''), 2400);
  }
}

async function loadTimelineFromStorage() {
  createTimelineCards();

  const stored = localStorage.getItem('birthdayTimelineData');
  if (!stored) {
    return;
  }

  let data;
  try {
    data = JSON.parse(stored);
  } catch (error) {
    return;
  }

  if (data.heroImageKey) {
    const url = await getImageUrl(data.heroImageKey);
    if (url) {
      heroImage.src = url;
      heroImage.classList.remove('hidden');
      heroPlaceholder.classList.add('hidden');
    } else {
      heroImage.classList.add('hidden');
      heroPlaceholder.classList.remove('hidden');
    }
  } else if (data.heroImage) {
    heroImage.src = data.heroImage;
    heroImage.classList.remove('hidden');
    heroPlaceholder.classList.add('hidden');
  } else {
    heroImage.classList.add('hidden');
    heroPlaceholder.classList.remove('hidden');
  }

  const entries = data.entries || [];
  await Promise.all(timelineRefs.map(async (ref, index) => {
    const entry = entries[index] || {};
    if (entry.imageKey) {
      const url = await getImageUrl(entry.imageKey);
      if (url) {
        ref.image.src = url;
        ref.image.classList.remove('hidden');
      } else {
        ref.image.classList.add('hidden');
      }
    } else if (entry.imageData) {
      ref.image.src = entry.imageData;
      ref.image.classList.remove('hidden');
    } else {
      ref.image.classList.add('hidden');
    }
    ref.title.textContent = entry.title || ref.title.textContent;
    ref.text.textContent = entry.text || ref.text.textContent;
  }));
}

function createTimelineCards() {
  if (timelineGrid.children.length === 0) {
    for (let i = 1; i <= MAX_TIMELINE_ENTRIES; i += 1) {
      const card = document.createElement('article');
      card.className = 'timeline-card';
      card.innerHTML = `
        <img id="timelineImage${i}" class="timeline-image hidden" src="" alt="Timeline image ${i}" />
        <h3 id="timelineTitle${i}">${DEFAULT_TIMELINE_TITLES[i - 1]}</h3>
        <p id="timelineText${i}">${DEFAULT_TIMELINE_TEXT}</p>
      `;
      timelineGrid.appendChild(card);
    }
  }

  timelineRefs.length = 0;
  for (let i = 1; i <= MAX_TIMELINE_ENTRIES; i += 1) {
    timelineRefs.push({
      image: document.getElementById(`timelineImage${i}`),
      title: document.getElementById(`timelineTitle${i}`),
      text: document.getElementById(`timelineText${i}`)
    });
  }
}

function playHappyBirthday() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  const notes = [
    264, 264, 297, 264, 352, 330,
    264, 264, 297, 264, 396, 352,
    264, 264, 528, 440, 352, 330, 297,
    466, 466, 440, 352, 396, 352
  ];
  const durations = [
    0.32, 0.32, 0.72, 0.72, 0.9, 1.2,
    0.32, 0.32, 0.72, 0.72, 0.9, 1.2,
    0.32, 0.32, 0.72, 0.72, 0.72, 0.72, 1.4,
    0.32, 0.32, 0.72, 0.72, 0.9, 1.4
  ];

  let time = audioContext.currentTime + 0.05;
  notes.forEach((frequency, index) => {
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, time);
    osc2.frequency.setValueAtTime(frequency * 2.001, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.18, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + durations[index] - 0.02);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContext.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + durations[index]);
    osc2.stop(time + durations[index]);

    time += durations[index];
  });
}

function startConfetti() {
  const colors = ['#ff6eb4', '#6f8bff', '#ffe27a', '#7be2ff', '#ff9e5c'];
  for (let i = 0; i < 80; i += 1) {
    const particle = document.createElement('div');
    particle.className = 'confetti-piece';
    const size = Math.random() * 10 + 6;
    particle.style.width = `${size}px`;
    particle.style.height = `${size * 0.35}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    particle.style.opacity = `${Math.random() * 0.7 + 0.5}`;
    confettiContainer.appendChild(particle);
  }
  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 9000);
}
