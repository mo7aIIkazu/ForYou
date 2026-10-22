import { siteConfig } from "./config.js";
import { initStars } from "./features/stars.js";
import { initMusicPlayer } from "./features/music.js";
import { initHeartSurprise } from "./features/heart-surprise.js";
import { initWinterScene } from "./features/winter-scene.js";
import { initMemoryGallery } from "./features/memory-gallery.js";
import { initOpenWhen } from "./features/open-when.js";
import { initDateQuest } from "./features/date-quest.js";
import { initGarden } from "./features/garden.js";
import { initMiniGames } from "./features/mini-games.js";
import { initHeartRush } from "./features/heart-rush.js";
import { initKombat } from "./features/kombat.js";

/** Each feature is isolated so one missing element doesn't stop the rest of the site. */
const initializers = {
  stars: initStars,
  music: initMusicPlayer,
  heartSurprise: initHeartSurprise,
  winterScene: initWinterScene,
  memoryGallery: initMemoryGallery,
  openWhen: initOpenWhen,
  dateQuest: initDateQuest,
  garden: initGarden,
  tinyArcade: initMiniGames,
  heartRush: initHeartRush,
  kombat: initKombat,
};

const cleanups = [];
const featureSections = {
  memoryGallery: "memoryArchive",
  openWhen: "openWhen",
  dateQuest: "dateQuest",
  garden: "littleGarden",
  tinyArcade: "tinyArcade",
  heartRush: "heartRushGame",
};

for (const [featureName, sectionId] of Object.entries(featureSections)) {
  if (siteConfig.features[featureName]) continue;
  const section = document.getElementById(sectionId);
  if (section) section.hidden = true;
  document.querySelectorAll(`.feature-nav-card[href="#${sectionId}"]`).forEach((link) => { link.hidden = true; });
}
if (!siteConfig.features.music) {
  document.querySelector(".music-widget")?.setAttribute("hidden", "");
  document.getElementById("music")?.setAttribute("hidden", "");
}
if (!siteConfig.features.winterScene) {
  const winterButton = document.getElementById("winterVoiceBtn");
  if (winterButton) winterButton.hidden = true;
}
if (!siteConfig.features.heartSurprise) {
  const heartButton = document.getElementById("heartButton");
  if (heartButton) heartButton.hidden = true;
}

for (const [featureName, initialize] of Object.entries(initializers)) {
  if (!siteConfig.features[featureName]) continue;
  try {
    const cleanup = initialize();
    if (typeof cleanup === "function") cleanups.push(cleanup);
  } catch (error) {
    console.error(`[ForYou] Feature "${featureName}" failed to initialize.`, error);
  }
}

// Useful for future in-page navigation or testing, without exposing feature internals.
window.addEventListener("pagehide", () => {
  cleanups.forEach((cleanup) => {
    try { cleanup(); } catch (error) { console.warn("[ForYou] Feature cleanup failed.", error); }
  });
}, { once: true });

console.info(`[ForYou] ${siteConfig.title} is ready.`);
