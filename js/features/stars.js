/** Starfield background. Honors reduced-motion preferences and pauses off-screen. */
export function initStars() {
  const canvas = document.getElementById("stars");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return () => {};

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let stars = [];
  let frameId = 0;
  let active = !document.hidden;
  let disposed = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.4 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    }));
    draw(false);
  }

  function draw(animate = true) {
    if (disposed) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const star of stars) {
      star.phase += reduceMotion ? 0 : star.speed;
      const alpha = 0.2 + Math.abs(Math.sin(star.phase)) * 0.5;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.fill();
    }
    if (animate && active && !reduceMotion) frameId = requestAnimationFrame(() => draw(true));
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  }
  function handleVisibility() {
    active = !document.hidden;
    stop();
    if (active) draw(true);
  }
  function handleResize() {
    stop();
    resize();
    if (!reduceMotion && active) draw(true);
  }

  resize();
  if (!reduceMotion && active) draw(true);
  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  return () => {
    disposed = true;
    stop();
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
