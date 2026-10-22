import { winterPhrases } from "../data/winter.js";

/** The existing winter voice overlay, with clean open/close and animation lifecycles. */
export function initWinterScene() {
  const openButton = document.getElementById("winterVoiceBtn");
  const modal = document.getElementById("winterModal");
  const closeButton = document.getElementById("closeWinterBtn");
  const snowCanvas = document.getElementById("snowCanvas");
  const phraseBox = document.getElementById("winterPhraseBox");
  const phraseElement = document.getElementById("winterPhrase");
  const languageButton = document.getElementById("langToggleBtn");
  const context = snowCanvas?.getContext("2d");
  if (!openButton || !modal || !closeButton || !snowCanvas || !context || !phraseBox || !phraseElement || !languageButton) return () => {};

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let language = "en";
  let phraseIndex = 0;
  let snowflakes = [];
  let animationId = 0;
  let phraseInterval = 0;
  let phraseTimeout = 0;
  let isOpen = false;
  let disposed = false;

  function activePhrases() { return winterPhrases[language] || winterPhrases.en; }
  function resizeSnow() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    snowCanvas.width = Math.floor(window.innerWidth * dpr);
    snowCanvas.height = Math.floor(window.innerHeight * dpr);
    snowCanvas.style.width = `${window.innerWidth}px`;
    snowCanvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    snowflakes = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2.2 + 1,
      speedY: Math.random() * 1.2 + 0.4,
      speedX: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.6 + 0.4,
    }));
    if (reduceMotion) drawSnow(false);
  }
  function drawSnow(keepAnimating = true) {
    if (disposed || !isOpen) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const flake of snowflakes) {
      if (keepAnimating && !reduceMotion) {
        flake.y += flake.speedY;
        flake.x += flake.speedX;
      }
      if (flake.y > window.innerHeight) flake.y = -5;
      if (flake.x > window.innerWidth) flake.x = 0;
      if (flake.x < 0) flake.x = window.innerWidth;
      context.beginPath();
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      context.fill();
    }
    if (keepAnimating && !reduceMotion) animationId = requestAnimationFrame(() => drawSnow(true));
  }
  function showPhrase() {
    phraseElement.classList.remove("fade-in");
    window.clearTimeout(phraseTimeout);
    phraseTimeout = window.setTimeout(() => {
      if (!isOpen) return;
      const top = Math.floor(Math.random() * 55) + 18;
      const left = Math.floor(Math.random() * 45) + 10;
      phraseBox.style.top = `${top}%`;
      phraseBox.style.left = `${left}%`;
      const phrases = activePhrases();
      phraseElement.textContent = phrases[phraseIndex % phrases.length] || "♡";
      phraseElement.classList.add("fade-in");
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }, reduceMotion ? 0 : 350);
  }
  function openScene() {
    if (isOpen) return;
    isOpen = true;
    modal.classList.remove("hidden");
    modal.inert = false;
    modal.setAttribute("aria-hidden", "false");
    phraseIndex = 0;
    resizeSnow();
    drawSnow(!reduceMotion);
    showPhrase();
    phraseInterval = window.setInterval(showPhrase, reduceMotion ? 6500 : 5000);
    closeButton.focus({ preventScroll: true });
  }
  function closeScene() {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.add("hidden");
    modal.inert = true;
    modal.setAttribute("aria-hidden", "true");
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
    window.clearInterval(phraseInterval);
    window.clearTimeout(phraseTimeout);
    phraseInterval = 0;
    phraseTimeout = 0;
    openButton.focus({ preventScroll: true });
  }
  function toggleLanguage() {
    language = language === "en" ? "kk" : "en";
    languageButton.textContent = language === "en" ? "Қазақша" : "English";
    const phrases = activePhrases();
    const lastIndex = (phraseIndex - 1 + phrases.length) % phrases.length;
    phraseElement.textContent = phrases[lastIndex] || "♡";
  }
  function onKeydown(event) {
    if (event.key === "Escape" && isOpen) closeScene();
  }
  function onResize() {
    if (!isOpen) return;
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
    resizeSnow();
    if (!reduceMotion) drawSnow(true);
  }

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  openButton.addEventListener("click", openScene);
  closeButton.addEventListener("click", closeScene);
  languageButton.addEventListener("click", toggleLanguage);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    disposed = true;
    closeScene();
    openButton.removeEventListener("click", openScene);
    closeButton.removeEventListener("click", closeScene);
    languageButton.removeEventListener("click", toggleLanguage);
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", onResize);
  };
}
