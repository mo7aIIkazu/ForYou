import { readStorage, writeStorage } from "../utils/storage.js";

/** A short score-chasing game. No streaks or penalties; best score is local to this browser. */
export function initHeartRush() {
  const arena = document.getElementById("heartRushArena");
  const target = document.getElementById("heartRushTarget");
  const startButton = document.getElementById("heartRushStart");
  const prompt = document.getElementById("heartRushPrompt");
  const scoreLabel = document.getElementById("heartRushScore");
  const timeLabel = document.getElementById("heartRushTime");
  const bestLabel = document.getElementById("heartRushBest");
  const result = document.getElementById("heartRushResult");
  if (!arena || !target || !startButton || !prompt || !scoreLabel || !timeLabel || !bestLabel || !result) return () => {};

  const BEST_KEY = "heart-rush-best";
  let score = 0;
  let seconds = 20;
  let timer = 0;
  let running = false;
  let disposed = false;
  let best = Number(readStorage(BEST_KEY, 0)) || 0;
  bestLabel.textContent = String(best);

  function moveTarget() {
    const maxX = Math.max(0, arena.clientWidth - target.offsetWidth);
    const maxY = Math.max(0, arena.clientHeight - target.offsetHeight);
    target.style.left = `${Math.floor(Math.random() * (maxX + 1))}px`;
    target.style.top = `${Math.floor(Math.random() * (maxY + 1))}px`;
  }
  function finishGame() {
    running = false;
    window.clearInterval(timer);
    timer = 0;
    target.hidden = true;
    prompt.hidden = false;
    prompt.textContent = score > 0 ? `Time! You caught ${score} ${score === 1 ? "heart" : "hearts"}.` : "Time! Give it another try.";
    startButton.textContent = "play again";
    if (score > best) {
      best = score;
      writeStorage(BEST_KEY, best);
      bestLabel.textContent = String(best);
      result.textContent = "New personal best! That's a lot of love. ♡";
    } else {
      result.textContent = `Final score: ${score}. Your best is ${best}. Want another round?`;
    }
  }
  function startGame() {
    window.clearInterval(timer);
    score = 0;
    seconds = 20;
    running = true;
    scoreLabel.textContent = "0";
    timeLabel.textContent = "20";
    prompt.hidden = true;
    target.hidden = false;
    startButton.textContent = "playing…";
    result.textContent = "Catch the heart as quickly as you can!";
    moveTarget();
    timer = window.setInterval(() => {
      if (disposed || !running) return;
      seconds -= 1;
      timeLabel.textContent = String(seconds);
      if (seconds <= 0) finishGame();
    }, 1000);
  }
  function catchHeart() {
    if (!running) return;
    score += 1;
    scoreLabel.textContent = String(score);
    moveTarget();
    if (score > 0 && score % 5 === 0) result.textContent = `${score} hearts! You're on a roll ♡`;
  }
  startButton.addEventListener("click", startGame);
  target.addEventListener("click", catchHeart);
  const onVisibility = () => { if (document.hidden && running) finishGame(); };
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    disposed = true;
    running = false;
    window.clearInterval(timer);
    startButton.removeEventListener("click", startGame);
    target.removeEventListener("click", catchHeart);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
