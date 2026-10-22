import { tinySurprises } from "../data/surprises.js";

/** Five-tap star game; surprise copy is editable in js/data/surprises.js. */
export function initMiniGames() {
  const button = document.getElementById("wishStarButton");
  const progress = document.getElementById("wishStarProgress");
  const message = document.getElementById("wishStarMessage");
  const anotherButton = document.getElementById("anotherSurpriseButton");
  if (!button || !progress || !message || !anotherButton) return () => {};

  let count = 0;
  let lastIndex = -1;
  const validSurprises = Array.isArray(tinySurprises) ? tinySurprises.filter((item) => typeof item === "string" && item.trim()) : [];
  const originalMessage = "A little magic, one tap at a time.";

  function showProgress() {
    progress.textContent = `${count} / 5 stars`;
    button.setAttribute("aria-label", `Collect a star, ${count} of 5`);
  }
  function unlockSurprise() {
    count = 0;
    showProgress();
    if (!validSurprises.length) {
      message.textContent = "Add a tiny surprise in js/data/surprises.js.";
      return;
    }
    let nextIndex = Math.floor(Math.random() * validSurprises.length);
    if (validSurprises.length > 1 && nextIndex === lastIndex) nextIndex = (nextIndex + 1) % validSurprises.length;
    lastIndex = nextIndex;
    message.textContent = validSurprises[nextIndex];
    anotherButton.hidden = false;
    button.classList.add("wish-star-unlocked");
  }
  function tapStar() {
    if (count >= 5) return;
    if (count === 0) {
      message.textContent = originalMessage;
      anotherButton.hidden = true;
    }
    count += 1;
    button.classList.remove("wish-star-unlocked");
    if (count >= 5) unlockSurprise();
    else showProgress();
  }
  function reset() {
    count = 0;
    showProgress();
    message.textContent = originalMessage;
    anotherButton.hidden = true;
    button.classList.remove("wish-star-unlocked");
  }
  button.addEventListener("click", tapStar);
  anotherButton.addEventListener("click", reset);
  showProgress();
  return () => {
    button.removeEventListener("click", tapStar);
    anotherButton.removeEventListener("click", reset);
  };
}
