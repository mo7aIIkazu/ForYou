/* =========================
   AUTOPLAY & AUDIO CONTROL
========================= */

const music = document.getElementById("music");
let audioStarted = false;

async function startAudio() {
  if (audioStarted || !music) return;
  try {
    music.muted = false;
    await music.play();
    audioStarted = true;
    removeAudioListeners();
  } catch (err) {
    console.log("Waiting for user interaction to play audio.");
  }
}

function removeAudioListeners() {
  window.removeEventListener("pointerdown", startAudio);
  window.removeEventListener("keydown", startAudio);
  window.removeEventListener("scroll", startAudio);
  window.removeEventListener("touchstart", startAudio);
}

// Global user interaction triggers to bypass browser autoplay restrictions
window.addEventListener("pointerdown", startAudio, { once: true });
window.addEventListener("keydown", startAudio, { once: true });
window.addEventListener("scroll", startAudio, { once: true });
window.addEventListener("touchstart", startAudio, { once: true });

// Attempt initial muted playback on load
window.addEventListener("DOMContentLoaded", () => {
  if (music) {
    music.muted = true;
    music.play().catch(() => {
      console.log("Autoplay waiting for interaction.");
    });
  }
});

/* =========================
   MAIN BACKGROUND: STARS ONLY
========================= */

const canvas = document.getElementById("stars");
const ctx = canvas ? canvas.getContext("2d") : null;

let stars = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  stars = [];
  for (let i = 0; i < 110; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4,
      opacity: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function animateMainBackground() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    star.opacity += star.speed;
    const alpha = 0.2 + Math.abs(Math.sin(star.opacity)) * 0.5;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  });

  requestAnimationFrame(animateMainBackground);
}

animateMainBackground();

/* =========================
   SCROLL & HEART BUTTONS
========================= */

const beginButton = document.getElementById("beginButton");
if (beginButton) {
  beginButton.addEventListener("click", () => {
    startAudio();
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  });
}

const heartButton = document.getElementById("heartButton");
const hiddenMessage = document.getElementById("hiddenMessage");

if (heartButton) {
  heartButton.addEventListener("click", () => {
    startAudio();
    if (hiddenMessage) hiddenMessage.classList.add("visible");
    createHearts();
  });
}

function createHearts() {
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement("div");
    heart.innerHTML = "♥";
    heart.style.position = "fixed";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.bottom = "-20px";
    heart.style.color = "#ff789f";
    heart.style.fontSize = (15 + Math.random() * 20) + "px";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "100";
    document.body.appendChild(heart);

    const duration = 2000 + Math.random() * 2000;
    heart.animate([
      { transform: "translateY(0)", opacity: 0 },
      { opacity: 1 },
      { transform: `translateY(-100vh) translateX(${Math.random() * 100 - 50}px)`, opacity: 0 }
    ], { duration, easing: "ease-out" });

    setTimeout(() => heart.remove(), duration);
  }
}

/* =========================
   MUSIC PLAYLIST WIDGET
========================= */

const musicButton = document.getElementById("musicButton");
const playlistDrawer = document.getElementById("playlistDrawer");
const playlistItems = document.querySelectorAll("#playlist li");

if (musicButton && playlistDrawer) {
  musicButton.addEventListener("click", () => {
    startAudio();
    playlistDrawer.classList.toggle("hidden");
  });
}

playlistItems.forEach(item => {
  item.addEventListener("click", () => {
    playlistItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    if (music) {
      music.src = item.dataset.src;
      startAudio();
    }
  });
});

/* =========================
   SECONDARY PAGE: WINTER VOICE
========================= */

const winterVoiceBtn = document.getElementById("winterVoiceBtn");
const winterModal = document.getElementById("winterModal");
const closeWinterBtn = document.getElementById("closeWinterBtn");
const snowCanvas = document.getElementById("snowCanvas");
const sCtx = snowCanvas ? snowCanvas.getContext("2d") : null;

const winterPhraseBox = document.getElementById("winterPhraseBox");
const winterPhrase = document.getElementById("winterPhrase");
const langToggleBtn = document.getElementById("langToggleBtn"); // Kazakh/English toggle button

let snowAnimId;
let snowflakes = [];
let phraseIndex = 0;
let phraseInterval;
let currentLang = "en"; // Options: 'en' or 'kk'

// English phrases
const phrasesEN = [
  "hey",
  "i know it might be hard",
  "i know it hurts.",
  "but.",
  "i know you are strong",
  "i belive in you.",
  "life might be very tough.",
  "but i know...deep down..",
  "You can do it.",
  "...",
  "love is beautiful isnt it?",
  "so u are too..in my eyes.",
  "dont let life steals your smile.",
  "Dayana?.. i see nothing wrong with that name.",
  "yana?.. even better..",
  "sometimes...being honest with ourselfs.",
  "is the key to relif.",
  "so i want to be honest too.",
  "...",
  "i cant stop thinking about you.",
  "even when im busy.",
  "allways before i sleep.",
  "i fall in imagination world.",
  "a very deep world. full of thoghts.",
  "thoughts i want to acomplish,with you..",
  "keep working hard..",
  "I love you.sincerly..",
];

// Coherent Kazakh translations
const phrasesKK = [
  "сәлем",
  "қиын болып жүргенін білемін",
  "жаныңа батып жүргенін түсінемін.",
  "бірақ.",
  "сенің мықты екеніңді білемін",
  "саған сенемін.",
  "өмір кейде өте қиын болуы мүмкін...",
  "бірақ жүрегімнің түбінде білемін...",
  "Қолыңнан келеді!",
  "...",
  "махаббат қандай әдемі, ә?",
  "сен де менің көзімде дәл сондай әдемісің.",
  "өмірдің күлкіңді ұрлауына жол берме.",
  "Даяна?.. Бұл есімде тұрған ештеңе жоқ.",
  "Яна?.. Тіпті жақсы..",
  "кейде... өзіңе шыншыл болу — жан тыныштығының кілті.",
  "сондықтан мен де ашық айтқым келеді.",
  "...",
  "сені ойлауды тоқтата алар емеспін.",
  "тіпті қолым тимей жатса да.",
  "әрқашан ұйықтар алдында.",
  "қиял әлеміне сүңгимін.",
  "ойларға толы шетсіз-шексіз әлем.",
  "сенімен бірге орындағым келетін армандар..",
  "тек берілме, алға ұмтыла бер..",
  "Сені сүйемін. Шын жүректен.."
];

function getActivePhrases() {
  return currentLang === "kk" ? phrasesKK : phrasesEN;
}

function initSnow() {
  if (!snowCanvas) return;
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;
  snowflakes = [];

  for (let i = 0; i < 70; i++) {
    snowflakes.push({
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      radius: Math.random() * 2.2 + 1,
      speedY: Math.random() * 1.2 + 0.4,
      speedX: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.6 + 0.4
    });
  }
}

function animateSnow() {
  if (!sCtx) return;
  sCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

  snowflakes.forEach(flake => {
    flake.y += flake.speedY;
    flake.x += flake.speedX;

    if (flake.y > snowCanvas.height) flake.y = -5;
    if (flake.x > snowCanvas.width) flake.x = 0;
    if (flake.x < 0) flake.x = snowCanvas.width;

    sCtx.beginPath();
    sCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    sCtx.fill();
  });

  snowAnimId = requestAnimationFrame(animateSnow);
}

function setRandomPosition() {
  if (!winterPhraseBox) return;
  const randomTop = Math.floor(Math.random() * 55) + 18;
  const randomLeft = Math.floor(Math.random() * 45) + 10;

  winterPhraseBox.style.top = `${randomTop}%`;
  winterPhraseBox.style.left = `${randomLeft}%`;
}

function cyclePhrases() {
  if (!winterPhrase) return;
  
  winterPhrase.classList.remove("fade-in");

  setTimeout(() => {
    setRandomPosition();
    const currentPhrases = getActivePhrases();
    winterPhrase.textContent = currentPhrases[phraseIndex];
    winterPhrase.classList.add("fade-in");
    phraseIndex = (phraseIndex + 1) % currentPhrases.length;
  }, 1200);
}

// Toggle language dynamically
if (langToggleBtn) {
  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "kk" : "en";
    langToggleBtn.textContent = currentLang === "en" ? "Қазақша" : "English";
    
    // Refresh phrase currently displayed
    const currentPhrases = getActivePhrases();
    if (winterPhrase) {
      winterPhrase.textContent = currentPhrases[(phraseIndex - 1 + currentPhrases.length) % currentPhrases.length];
    }
  });
}

if (winterVoiceBtn && winterModal) {
  winterVoiceBtn.addEventListener("click", () => {
    startAudio();
    winterModal.classList.remove("hidden");
    initSnow();
    animateSnow();

    phraseIndex = 0;
    cyclePhrases();
    phraseInterval = setInterval(cyclePhrases, 5000);
  });
}

if (closeWinterBtn && winterModal) {
  closeWinterBtn.addEventListener("click", () => {
    winterModal.classList.add("hidden");
    cancelAnimationFrame(snowAnimId);
    clearInterval(phraseInterval);
  });
}

window.addEventListener("resize", () => {
  if (winterModal && !winterModal.classList.contains("hidden")) {
    initSnow();
  }
});
