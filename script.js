/* =========================
   STAR BACKGROUND
========================= */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  stars = [];

  for (let i = 0; i < 130; i++) {
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

function animateStars() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  stars.forEach(star => {

    star.opacity += star.speed;

    const alpha =
      0.2 +
      Math.abs(Math.sin(star.opacity)) * 0.5;

    ctx.beginPath();

    ctx.arc(
      star.x,
      star.y,
      star.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;

    ctx.fill();
  });

  requestAnimationFrame(animateStars);
}

animateStars();


/* =========================
   BEGIN BUTTON
========================= */

const beginButton =
  document.getElementById("beginButton");

beginButton.addEventListener("click", () => {

  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth"
  });

});


/* =========================
   HEART BUTTON
========================= */

const heartButton =
  document.getElementById("heartButton");

const hiddenMessage =
  document.getElementById("hiddenMessage");

heartButton.addEventListener("click", () => {

  hiddenMessage.classList.add("visible");

  createHearts();

  heartButton.style.transform =
    "scale(0.9)";

  setTimeout(() => {
    heartButton.style.transform =
      "scale(1)";
  }, 150);

});


/* =========================
   FLOATING HEARTS
========================= */

function createHearts() {

  for (let i = 0; i < 25; i++) {

    const heart =
      document.createElement("div");

    heart.innerHTML =
      Math.random() > 0.5
        ? "♥"
        : "♡";

    heart.style.position = "fixed";
    heart.style.left =
      Math.random() * 100 + "vw";

    heart.style.bottom = "-30px";

    heart.style.color =
      Math.random() > 0.5
        ? "#ff789f"
        : "#ffb6ca";

    heart.style.fontSize =
      15 + Math.random() * 25 + "px";

    heart.style.pointerEvents = "none";

    heart.style.zIndex = "100";

    document.body.appendChild(heart);

    const duration =
      2500 + Math.random() * 2500;

    heart.animate(
      [
        {
          transform:
            "translateY(0) rotate(0deg)",
          opacity: 0
        },
        {
          opacity: 1
        },
        {
          transform:
            `translateY(-110vh)
             translateX(${Math.random() * 200 - 100}px)
             rotate(${Math.random() * 180}deg)`,
          opacity: 0
        }
      ],
      {
        duration,
        easing: "ease-out"
      }
    );

    setTimeout(() => {
      heart.remove();
    }, duration);
  }
}


/* =========================
   MUSIC
========================= */

const music =
  document.getElementById("music");

const musicButton =
  document.getElementById("musicButton");

let playing = false;

musicButton.addEventListener("click", async () => {

  if (!playing) {

    try {
      await music.play();

      playing = true;
      musicButton.textContent = "♫";
    }

    catch {
      alert(
        "Add your song as assets/song.mp3 first ❤️"
      );
    }

  } else {

    music.pause();

    playing = false;

    musicButton.textContent = "♪";
  }

});
