/** Existing heart-button interaction, separated from the rest of the application. */
export function initHeartSurprise() {
  const beginButton = document.getElementById("beginButton");
  const heartButton = document.getElementById("heartButton");
  const hiddenMessage = document.getElementById("hiddenMessage");
  const cleanups = [];

  if (beginButton) {
    const onClick = () => {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      window.scrollTo({ top: window.innerHeight, behavior: reduceMotion ? "auto" : "smooth" });
    };
    beginButton.addEventListener("click", onClick);
    cleanups.push(() => beginButton.removeEventListener("click", onClick));
  }

  function createHearts() {
    const count = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 20;
    for (let i = 0; i < count; i += 1) {
      const heart = document.createElement("span");
      heart.textContent = "♥";
      heart.className = "floating-heart";
      heart.setAttribute("aria-hidden", "true");
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.fontSize = `${15 + Math.random() * 20}px`;
      document.body.appendChild(heart);
      const duration = 2000 + Math.random() * 2000;
      heart.animate([
        { transform: "translateY(0) translateX(0)", opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translateY(-100vh) translateX(${Math.random() * 100 - 50}px)`, opacity: 0 },
      ], { duration, easing: "ease-out" });
      window.setTimeout(() => heart.remove(), duration);
    }
  }

  if (heartButton) {
    const onClick = () => {
      hiddenMessage?.classList.add("visible");
      heartButton.setAttribute("aria-pressed", "true");
      createHearts();
    };
    heartButton.setAttribute("aria-pressed", "false");
    heartButton.addEventListener("click", onClick);
    cleanups.push(() => heartButton.removeEventListener("click", onClick));
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}
