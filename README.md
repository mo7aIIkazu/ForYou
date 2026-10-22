# ForYou — growing little website

A no-build, vanilla HTML/CSS/JavaScript project. It uses native ES modules and is suitable for GitHub Pages.

## Run locally

**Important:** do not double-click `index.html` to open it as a `file://` URL. Native JavaScript modules are blocked by many browsers in that mode, which makes the winter, heart, and music buttons appear broken. Use a local server instead:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Theme

The site uses a burgundy-rose palette with wine-dark surfaces, rose accents, warm ivory text, and a romantic floating music player. Core theme tokens live in `css/themes.css`; feature-level theme details are at the end of `css/features.css`.

## Project map

- `index.html` — page structure and feature mount points.
- `css/style.css` — original site styles.
- `css/themes.css` — theme tokens, focus styles, reduced-motion support.
- `css/features.css` — new feature styles.
- `js/main.js` — app entry point; initializes features.
- `js/config.js` — central site settings and feature switches.
- `js/data/` — editable content only (memories, letters, music, winter phrases, date ideas, surprises).
- `js/features/` — UI and behavior for each feature, including the replayable Heart Rush score game and ForYou Kombat.
- `js/utils/` — safe local storage and date helpers.
- `js/legacy-script.js` — original monolithic script kept for reference; it is not loaded by the page. The current entry point is `js/main.js`.

## Add content

- Memories: add entries to `js/data/memories.js`; image paths are relative to `index.html`.
- Letters: add entries to `js/data/letters.js`. An optional `unlockDate` uses `YYYY-MM-DD`.
- Songs: copy each audio file into `assets/audio/`, then add one entry to `js/data/songs.js`. Use a unique `id` and a path relative to `index.html`; MP3 is the safest format. The burgundy-rose music player supports play/pause, stop-and-rewind, previous/next track, a seek bar, and 10-second rewind/forward. It automatically advances when a song ends.
- Date ideas: add entries to `js/data/date-ideas.js`.
- Tiny surprises: edit `js/data/surprises.js`.
- ForYou Kombat fighters: edit names, titles, colors, and emblems in `js/data/kombat.js`. The game supports Player vs AI and local two-player. Player 1 uses A/D/W/F/G/Space; Player 2 uses arrow keys/K/L/Down. Touch controls adapt to the selected mode. Fighters are intentionally compact, chunky pixel sprites with idle, walk, jump, articulated punch/kick poses, block, and hit reactions. Attacks have a visible wind-up/active/recovery sequence. Punch/kick cooldowns prevent held-button spam; synthesized arcade sound effects can be muted with the Sound button.
- Winter story: edit matching entries in both language arrays in `js/data/winter.js`.

## Persistence notes

The daily hello and date checklist save data to `localStorage` on the current browser/device. Daily hello unlocks 24 hours after the previous check-in; a long gap gently starts the growth count over. It is not synced between two people or between devices. The content in `js/data/` is part of the site files and is public when deployed to a public website. Do not put private credentials in this repository.

## Add a feature

1. Create `js/features/your-feature.js` and export an `initYourFeature()` function.
2. Add its markup to `index.html` and styles to `css/features.css`.
3. Import it in `js/main.js` and add it to the `initializers` map.
4. If it should be optional, add a flag under `siteConfig.features` in `js/config.js` and check that flag in `main.js`.
5. Return a cleanup function from the initializer to remove listeners/timers when the page is being torn down.

## Asset paths currently present

- `assets/images/photo1.jpg`
- `assets/audio/song.opus`
- `assets/audio/song-2.opus`
- `assets/audio/song-3.opus`
- `assets/audio/song-4.opus`
- `assets/audio/song-5.opus`
- `assets/backgrounds/snowy_night.gif`

More songs and memory images can be added later once you've picked what you want to use.
