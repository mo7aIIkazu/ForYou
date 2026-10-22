import { readStorage, writeStorage } from "../utils/storage.js";

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

/** A gentle 24-hour check-in. State is local to this browser/device. */
export function initGarden() {
  const plant = document.getElementById("gardenPlant");
  const stage = document.getElementById("gardenStage");
  const bar = document.getElementById("gardenProgressBar");
  const progressText = document.getElementById("gardenProgressText");
  const button = document.getElementById("waterGardenButton");
  const countdown = document.getElementById("gardenCountdown");
  if (!plant || !stage || !bar || !progressText || !button || !countdown) return () => {};

  const saved = readStorage("daily-hello", { count: 0, lastCheckInAt: 0 });
  let count = Math.max(0, Number(saved?.count) || 0);
  let lastCheckInAt = Math.max(0, Number(saved?.lastCheckInAt) || 0);
  const stages = [
    { at: 0, emoji: "♡", label: "Our little story starts here." },
    { at: 1, emoji: "♥", label: "A tiny heart, just for us." },
    { at: 3, emoji: "💕", label: "Two hearts, growing closer." },
    { at: 7, emoji: "💗", label: "A week of little hellos." },
    { at: 14, emoji: "💖", label: "Our heart is glowing!" },
    { at: 30, emoji: "💞", label: "A whole month of showing up." },
    { at: 60, emoji: "💝", label: "A rare little treasure." },
  ];
  const stageFor = () => [...stages].reverse().find((item) => count >= item.at) || stages[0];
  const timeLeft = (ms) => {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  };
  function render() {
    const now = Date.now();
    const current = stageFor();
    const remaining = Math.max(0, DAY - (now - lastCheckInAt));
    const ready = !lastCheckInAt || remaining <= 0;
    const next = stages.find((item) => item.at > count);
    plant.textContent = current.emoji;
    plant.setAttribute("aria-label", current.label);
    plant.style.setProperty("--heart-scale", String(Math.min(1.5, 0.85 + Math.min(count, 30) * 0.02)));
    stage.textContent = current.label;
    const progress = next ? ((count - current.at) / (next.at - current.at)) * 100 : 100;
    bar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    bar.parentElement?.setAttribute("aria-valuenow", String(Math.round(progress)));
    progressText.textContent = `${count} ${count === 1 ? "daily hello" : "daily hellos"} so far`;
    button.disabled = !ready;
    button.textContent = ready ? (count ? "♡ Leave today's hello" : "♡ I'm here today") : "♡ Today's hello is saved";
    countdown.textContent = ready
      ? "You're all caught up — tap when you're ready to check in."
      : `Your next little hello unlocks in ${timeLeft(remaining)}.`;
  }
  function checkIn() {
    const now = Date.now();
    if (lastCheckInAt && now - lastCheckInAt < DAY) return;
    // A long gap simply starts a fresh growing streak; the message stays kind.
    if (lastCheckInAt && now - lastCheckInAt > DAY * 2) count = 0;
    count += 1;
    lastCheckInAt = now;
    writeStorage("daily-hello", { count, lastCheckInAt });
    render();
  }
  button.addEventListener("click", checkIn);
  const ticker = window.setInterval(render, 30000);
  render();
  return () => { button.removeEventListener("click", checkIn); window.clearInterval(ticker); };
}
