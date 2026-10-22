
import { songs } from "../data/songs.js";
import { readStorage, writeStorage } from "../utils/storage.js";

/** ForYou music player with sequential playback, seeking, and playlist controls. */
export function initMusicPlayer() {
  const audio = document.getElementById("music");
  const openButton = document.getElementById("musicButton");
  const drawer = document.getElementById("playlistDrawer");
  const playlist = document.getElementById("playlist");
  const toggleButton = document.getElementById("audioToggleButton");
  const currentTrackLabel = document.getElementById("currentTrackLabel");
  const status = document.getElementById("musicStatus");
  const seek = document.getElementById("musicSeek");
  const currentTimeLabel = document.getElementById("musicCurrentTime");
  const durationLabel = document.getElementById("musicDuration");
  const previousButton = document.getElementById("musicPreviousButton");
  const nextButton = document.getElementById("musicNextButton");
  const backButton = document.getElementById("musicBackButton");
  const forwardButton = document.getElementById("musicForwardButton");
  const stopButton = document.getElementById("musicStopButton");

  if (!audio || !openButton || !drawer || !playlist || !toggleButton) {
    return () => {};
  }

  const availableSongs = Array.isArray(songs)
    ? songs.filter((song) => song?.id && song?.title && song?.src)
    : [];

  if (!availableSongs.length) {
    toggleButton.disabled = true;
    if (status) {
      status.textContent = "Add songs in js/data/songs.js to use the player.";
    }
    return () => {};
  }

  const savedTrackId = readStorage("music-track", availableSongs[0].id);

  let currentSong =
    availableSongs.find((song) => song.id === savedTrackId) ||
    availableSongs[0];

  let disposed = false;
  let playRequest = 0;

  audio.loop = false;
  audio.preload = "metadata";

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const whole = Math.floor(seconds);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  };

  const currentIndex = () =>
    availableSongs.findIndex((song) => song.id === currentSong.id);

  function showStatus(message) {
    if (status) status.textContent = message;
  }

  function updatePlayButton() {
    toggleButton.textContent = audio.paused ? "▶ Play" : "Ⅱ Pause";
    toggleButton.setAttribute(
      "aria-label",
      audio.paused ? "Play music" : "Pause music"
    );
  }

  function updateTimeline() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

    if (seek) {
      seek.max = String(duration || 100);
      seek.value = String(Math.min(current, duration || 100));
      seek.disabled = duration <= 0;
      seek.style.setProperty(
        "--seek-progress",
        `${duration ? (current / duration) * 100 : 0}%`
      );
    }

    if (currentTimeLabel) {
      currentTimeLabel.textContent = formatTime(current);
    }

    if (durationLabel) {
      durationLabel.textContent = formatTime(duration);
    }
  }

  async function play() {
    if (disposed) return;

    const request = ++playRequest;

    try {
      await audio.play();

      // Ignore outdated play requests if the track changed meanwhile.
      if (disposed || request !== playRequest) return;

      updatePlayButton();
      showStatus(`Now playing: ${currentSong.title} ❤️`);
    } catch (error) {
      if (disposed || request !== playRequest) return;

      updatePlayButton();
      showStatus(
        `Couldn't play "${currentSong.title}". Check the file path and audio format.`
      );

      console.error("[ForYou] Audio playback failed:", error);
    }
  }

  function selectSong(song, shouldPlay = false) {
    if (!song || disposed) return;

    // Invalidate any pending play request for the previous track.
    playRequest++;
    currentSong = song;

    audio.pause();
    audio.src = song.src;
    audio.load();

    if (currentTrackLabel) {
      currentTrackLabel.textContent = song.title;
    }

    writeStorage("music-track", song.id);

    playlist.querySelectorAll("button[data-song-id]").forEach((button) => {
      const selected = button.dataset.songId === song.id;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });

    updatePlayButton();
    updateTimeline();

    showStatus(
      shouldPlay ? `Loading ${song.title}…` : "Ready when you are, sweetheart ❤️"
    );

    if (shouldPlay) void play();
  }

  async function togglePlayback() {
    if (audio.paused) {
      // Restart a finished track when the user presses Play.
      if (audio.ended) {
        try {
          audio.currentTime = 0;
        } catch {
          // Metadata may not be available yet.
        }
      }

      await play();
    } else {
      playRequest++;
      audio.pause();
      updatePlayButton();
      showStatus("Paused. Your song is right where you left it ❤️");
    }
  }

  function stepTrack(direction, shouldPlay = !audio.paused) {
    const index = currentIndex();
    const nextIndex =
      (index + direction + availableSongs.length) % availableSongs.length;

    selectSong(availableSongs[nextIndex], shouldPlay);
  }

  function seekBy(seconds) {
    if (!Number.isFinite(audio.duration)) return;

    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + seconds)
    );

    updateTimeline();
  }

  function stopAndRewind() {
    playRequest++;
    audio.pause();

    try {
      audio.currentTime = 0;
    } catch {
      // Metadata may not have loaded yet.
    }

    updatePlayButton();
    updateTimeline();
    showStatus("Stopped and rewound to the beginning.");
  }

  // Build the playlist from songs.js.
  playlist.replaceChildren();

  availableSongs.forEach((song) => {
    const li = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = song.title;
    button.dataset.songId = song.id;

    button.addEventListener("click", () => {
      selectSong(song, true);
    });

    li.appendChild(button);
    playlist.appendChild(li);
  });

  selectSong(currentSong);

  // Playlist drawer.
  const onOpen = () => {
    const willOpen = drawer.classList.contains("hidden");

    drawer.classList.toggle("hidden", !willOpen);
    drawer.inert = !willOpen;
    drawer.setAttribute("aria-hidden", String(!willOpen));
    openButton.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      toggleButton.focus({ preventScroll: true });
    }
  };

  const onToggle = () => void togglePlayback();
  const onPrevious = () => stepTrack(-1);
  const onNext = () => stepTrack(1);
  const onBack = () => seekBy(-10);
  const onForward = () => seekBy(10);
  const onStop = () => stopAndRewind();

  const onSeek = () => {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = Number(seek.value);
    }
  };

  const onTime = () => updateTimeline();
  const onPlay = () => updatePlayButton();

  const onPause = () => {
    if (!disposed) updatePlayButton();
  };

  // Automatically play the next song when the current one finishes.
  const onEnded = () => {
    if (disposed) return;

    const nextIndex = currentIndex() + 1;

    if (nextIndex >= availableSongs.length) {
      updatePlayButton();
      updateTimeline();
      showStatus("Playlist finished ❤️ Play any song to listen again.");
      return;
    }

    selectSong(availableSongs[nextIndex], true);
  };

  const onError = () => {
    if (disposed || !audio.currentSrc) return;

    updatePlayButton();
    showStatus(
      `Couldn't load "${currentSong.title}". Check this path: ${currentSong.src}`
    );

    console.error("[ForYou] Failed audio source:", currentSong.src);
  };

  const onKeydown = (event) => {
    if (event.key === "Escape" && !drawer.classList.contains("hidden")) {
      drawer.classList.add("hidden");
      drawer.inert = true;
      drawer.setAttribute("aria-hidden", "true");
      openButton.setAttribute("aria-expanded", "false");
      openButton.focus({ preventScroll: true });
    }
  };

  openButton.addEventListener("click", onOpen);
  toggleButton.addEventListener("click", onToggle);
  previousButton?.addEventListener("click", onPrevious);
  nextButton?.addEventListener("click", onNext);
  backButton?.addEventListener("click", onBack);
  forwardButton?.addEventListener("click", onForward);
  stopButton?.addEventListener("click", onStop);
  seek?.addEventListener("input", onSeek);

  audio.addEventListener("timeupdate", onTime);
  audio.addEventListener("loadedmetadata", updateTimeline);
  audio.addEventListener("durationchange", updateTimeline);
  audio.addEventListener("play", onPlay);
  audio.addEventListener("pause", onPause);
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("error", onError);

  window.addEventListener("keydown", onKeydown);

  return () => {
    disposed = true;
    playRequest++;
    audio.pause();

    openButton.removeEventListener("click", onOpen);
    toggleButton.removeEventListener("click", onToggle);
    previousButton?.removeEventListener("click", onPrevious);
    nextButton?.removeEventListener("click", onNext);
    backButton?.removeEventListener("click", onBack);
    forwardButton?.removeEventListener("click", onForward);
    stopButton?.removeEventListener("click", onStop);
    seek?.removeEventListener("input", onSeek);

    audio.removeEventListener("timeupdate", onTime);
    audio.removeEventListener("loadedmetadata", updateTimeline);
    audio.removeEventListener("durationchange", updateTimeline);
    audio.removeEventListener("play", onPlay);
    audio.removeEventListener("pause", onPause);
    audio.removeEventListener("ended", onEnded);
    audio.removeEventListener("error", onError);

    window.removeEventListener("keydown", onKeydown);
  };
}
