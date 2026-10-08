/* =========================
   STAR & SNOW BACKGROUND
========================= */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let snowflakes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  stars = [];
  snowflakes = [];

  for (let i = 0; i < 110; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4,
      opacity: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }

  for (let i = 0; i < 40; i++) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: Math.random() * 0.4 - 0.2
    });
  }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function animateBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render Stars
  stars.forEach(star => {
    star.opacity += star.speed;
    const alpha = 0.2 + Math.abs(Math.sin(star.opacity)) * 0.5;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });

  // Render Background Snowflakes
  snowflakes.forEach(flake => {
    flake.y += flake.speedY;
    flake.x += flake.speedX;

    if (flake.y > canvas.height) flake.y = -5;
    if (flake.x > canvas.width) flake.x = 0;
    if (flake.x < 0) flake.x = canvas.width;

    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();
  });

  requestAnimationFrame(animateBackground);
}

animateBackground();

/* =========================
   SCROLL & HEART BUTTONS
========================= */

const beginButton = document.getElementById("beginButton");
if (beginButton) {
  beginButton.addEventListener("click", () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  });
}

const heartButton = document.getElementById("heartButton");
const hiddenMessage = document.getElementById("hiddenMessage");

if (heartButton) {
  heartButton.addEventListener("click", () => {
    hiddenMessage.classList.add("visible");
    createHearts();
    heartButton.style.transform = "scale(0.9)";
    setTimeout(() => { heartButton.style.transform = "scale(1)"; }, 150);
  });
}

function createHearts() {
  for (let i = 0; i < 25; i++) {
    const heart = document.createElement("div");
    heart.innerHTML = Math.random() > 0.5 ? "♥" : "♡";
    heart.style.position = "fixed";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.bottom = "-30px";
    heart.style.color = Math.random() > 0.5 ? "#ff789f" : "#ffb6ca";
    heart.style.fontSize = 15 + Math.random() * 25 + "px";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "100";
    document.body.appendChild(heart);

    const duration = 2500 + Math.random() * 2500;
    heart.animate([
      { transform: "translateY(0) rotate(0deg)", opacity: 0 },
      { opacity: 1 },
      { transform: `translateY(-110vh) translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 180}deg)`, opacity: 0 }
    ], { duration, easing: "ease-out" });

    setTimeout(() => heart.remove(), duration);
  }
}

/* =========================
   PLAYLIST MUSIC WIDGET
========================= */

const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");
const playlistDrawer = document.getElementById("playlistDrawer");
const playlistItems = document.querySelectorAll("#playlist li");

let isPlaying = false;

musicButton.addEventListener("click", () => {
  playlistDrawer.classList.toggle("hidden");
  if (!isPlaying) {
    playAudio();
  }
});

async function playAudio() {
  try {
    await music.play();
    isPlaying = true;
    musicButton.textContent = "♫";
  } catch (err) {
    alert("Add your songs under the assets/ directory ❤️");
  }
}

playlistItems.forEach(item => {
  item.addEventListener("click", () => {
    playlistItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    music.src = item.dataset.src;
    playAudio();
  });
});

/* =========================
   DECEMBER SNOWY MINI-GAME
========================= */

const secretGameBtn = document.getElementById("secretGameBtn");
const gameModal = document.getElementById("gameModal");
const closeGameBtn = document.getElementById("closeGameBtn");
const gCanvas = document.getElementById("gameCanvas");
const gCtx = gCanvas.getContext("2d");

const dialogueBox = document.getElementById("dialogueBox");
const dialogueSpeaker = document.getElementById("dialogueSpeaker");
const dialogueText = document.getElementById("dialogueText");
const dialogueNextBtn = document.getElementById("dialogueNextBtn");

let gameAnimationId;
let playerX = 80;
const playerYRatio = 0.72; // Ground height placement
let isDialogueActive = false;
let currentDialogueIdx = 0;

const storyDialogue = [
  { speaker: "Me", text: "Hey... I didn't think you'd walk all the way down this snowy path." },
  { speaker: "Her", text: "It's December 11th... of course I came." },
  { speaker: "Me", text: "Happy Birthday. I made all of this just to put a smile on your face." },
  { speaker: "Me", text: "Happy Birthday! ❤️" }
];

secretGameBtn.addEventListener("click", () => {
  gameModal.classList.remove("hidden");
  initGame();
});

closeGameBtn.addEventListener("click", () => {
  gameModal.classList.add("hidden");
  cancelAnimationFrame(gameAnimationId);
});

// Keyboard Input
const keys = { left: false, right: false };
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
});

function initGame() {
  gCanvas.width = window.innerWidth;
  gCanvas.height = window.innerHeight;
  playerX = 80;
  isDialogueActive = false;
  currentDialogueIdx = 0;
  dialogueBox.classList.add("hidden");
  
  gameLoop();
}

function gameLoop() {
  gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

  const groundY = gCanvas.height * playerYRatio;
  const targetX = gCanvas.width * 0.75;

  // Draw Snowy Background Path
  gCtx.fillStyle = "#0c0a14";
  gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

  // Ground / Snow
  gCtx.fillStyle = "#1e1b2e";
  gCtx.fillRect(0, groundY + 20, gCanvas.width, gCanvas.height - groundY);

  // Lamp Post Light Glow
  const grad = gCtx.createRadialGradient(targetX, groundY - 80, 10, targetX, groundY - 80, 180);
  grad.addColorStop(0, "rgba(255, 214, 153, 0.3)");
  grad.addColorStop(1, "rgba(255, 214, 153, 0)");
  gCtx.fillStyle = grad;
  gCtx.beginPath();
  gCtx.arc(targetX, groundY - 80, 180, 0, Math.PI * 2);
  gCtx.fill();

  // Lamp Post
  gCtx.strokeStyle = "#4a4560";
  gCtx.lineWidth = 4;
  gCtx.beginPath();
  gCtx.moveTo(targetX, groundY + 20);
  gCtx.lineTo(targetX, groundY - 80);
  gCtx.stroke();

  // Player Movement (Her)
  if (!isDialogueActive) {
    if (keys.right && playerX < gCanvas.width - 50) playerX += 3.5;
    if (keys.left && playerX > 30) playerX -= 3.5;
  }

  // Draw Character 1: Her (Walking Character - Soft Pink Glow)
  gCtx.fillStyle = "#ff789f";
  gCtx.beginPath();
  gCtx.arc(playerX, groundY, 14, 0, Math.PI * 2); // Head
  gCtx.fill();
  gCtx.fillRect(playerX - 8, groundY + 14, 16, 22); // Body

  // Draw Character 2: Me (Waiting by Lamp Post - Soft Violet Glow)
  gCtx.fillStyle = "#c084fc";
  gCtx.beginPath();
  gCtx.arc(targetX - 30, groundY, 14, 0, Math.PI * 2); // Head
  gCtx.fill();
  gCtx.fillRect(targetX - 38, groundY + 14, 16, 22); // Body

  // Trigger Dialogue Meeting
  if (Math.abs(playerX - (targetX - 70)) < 15 && !isDialogueActive) {
    isDialogueActive = true;
    showDialogue();
  }

  gameAnimationId = requestAnimationFrame(gameLoop);
}

function showDialogue() {
  dialogueBox.classList.remove("hidden");
  renderCurrentDialogue();
}

function renderCurrentDialogue() {
  const current = storyDialogue[currentDialogueIdx];
  dialogueSpeaker.textContent = current.speaker;
  dialogueText.textContent = current.text;
}

dialogueNextBtn.addEventListener("click", () => {
  currentDialogueIdx++;
  if (currentDialogueIdx < storyDialogue.length) {
    renderCurrentDialogue();
  } else {
    dialogueBox.classList.add("hidden");
    createHearts(); // Trigger floating hearts on completion
  }
});
