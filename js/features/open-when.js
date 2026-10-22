import { letters } from "../data/letters.js";
import { isDateReached, formatDate } from "../utils/date-utils.js";

/** Renders editable letters and respects optional unlock dates. */
export function initOpenWhen() {
  const grid = document.getElementById("lettersGrid");
  const empty = document.getElementById("lettersEmpty");
  const reveal = document.getElementById("letterReveal");
  const revealEyebrow = document.getElementById("letterRevealEyebrow");
  const revealTitle = document.getElementById("letterRevealTitle");
  const revealBody = document.getElementById("letterRevealBody");
  const revealSignature = document.getElementById("letterRevealSignature");
  const closeButton = document.getElementById("closeLetterButton");
  if (!grid || !empty || !reveal || !revealTitle || !revealBody || !closeButton) return () => {};

  let previousFocus = null;
  const validLetters = Array.isArray(letters) ? letters.filter((letter) => letter?.id && letter?.title) : [];
  grid.replaceChildren();
  empty.hidden = validLetters.length > 0;

  function closeLetter() {
    reveal.hidden = true;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  function openLetter(letter, button) {
    if (letter.unlockDate && !isDateReached(letter.unlockDate)) return;
    previousFocus = button;
    revealEyebrow.textContent = letter.unlockDate ? `a little note · ${formatDate(letter.unlockDate)}` : "a little note for you";
    revealTitle.textContent = letter.title;
    revealBody.replaceChildren();
    const paragraphs = Array.isArray(letter.body) ? letter.body : [letter.body || ""];
    paragraphs.filter(Boolean).forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      revealBody.appendChild(p);
    });
    revealSignature.textContent = letter.signature || "";
    reveal.hidden = false;
    reveal.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    closeButton.focus({ preventScroll: true });
  }

  validLetters.forEach((letter) => {
    const isUnlocked = isDateReached(letter.unlockDate);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter-card";
    button.disabled = !isUnlocked;
    const icon = document.createElement("span");
    icon.className = "letter-card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isUnlocked ? "✉" : "⌑";
    const title = document.createElement("strong");
    title.textContent = letter.title;
    const caption = document.createElement("small");
    caption.textContent = isUnlocked ? "tap to open" : `opens ${formatDate(letter.unlockDate)}`;
    button.append(icon, title, caption);
    button.addEventListener("click", () => openLetter(letter, button));
    grid.appendChild(button);
  });

  closeButton.addEventListener("click", closeLetter);
  const onKeydown = (event) => { if (event.key === "Escape" && !reveal.hidden) closeLetter(); };
  window.addEventListener("keydown", onKeydown);
  return () => {
    closeButton.removeEventListener("click", closeLetter);
    window.removeEventListener("keydown", onKeydown);
    grid.replaceChildren();
  };
}
