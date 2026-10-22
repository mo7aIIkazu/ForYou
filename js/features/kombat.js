import { kombatFighters } from "../data/kombat.js";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function initKombat() {
  const root = document.getElementById("forYouKombat");
  const canvas = document.getElementById("kombatCanvas");
  if (!root || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Deliberately tiny internal resolution: CSS scales it with nearest-neighbour pixels.
  const W = canvas.width = 480, H = canvas.height = 210, FLOOR = 171;
  const $ = (id) => root.querySelector(`#${id}`);
  const ui = {
    mode: $("kombatMode"), start: $("kombatStart"), reset: $("kombatReset"),
    p1Name: $("kombatP1Name"), p2Name: $("kombatP2Name"), p1Health: $("kombatP1Health"),
    p2Health: $("kombatP2Health"), p1Label: $("kombatP1Label"), p2Label: $("kombatP2Label"),
    status: $("kombatStatus"), controls: [...root.querySelectorAll("[data-kombat-control]")],
  };
  let running = false, raf = 0, last = 0, elapsed = 0, winner = "", muted = false, audioCtx = null;
  const held = new Set(), pressed = new Set(), touchKeyCounts = new Map();
  const validKeys = new Set(["a","d","w","f","g","ArrowLeft","ArrowRight","ArrowUp","k","l"," ","ArrowDown"]);
  const actionMap = { left:"a", right:"d", jump:"w", punch:"f", kick:"g", block:" ", p2left:"ArrowLeft", p2right:"ArrowRight", p2jump:"ArrowUp", p2punch:"k", p2kick:"l", p2block:"ArrowDown" };
  const fighter = (side, data) => ({ side, data, x: side === 1 ? 116 : 364, y: FLOOR, vx: 0, vy: 0, hp: 100, face: side === 1 ? 1 : -1, action: "idle", actionTime: 0, cooldown: 0, stun: 0, block: false, grounded: true, jumpLock: false, hitDone: false, walkTime: 0, aiThink: .3 });
  let p1 = fighter(1, kombatFighters.playerOne), p2 = fighter(2, kombatFighters.playerTwo);

  function sound(kind) {
    if (muted) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      const presets = {
        jump: [260, 420, .08, "square"], punch: [190, 95, .07, "square"], kick: [135, 55, .12, "sawtooth"],
        hit: [115, 48, .11, "triangle"], block: [340, 240, .06, "square"], land: [90, 60, .05, "triangle"], win: [420, 760, .24, "square"]
      };
      const [from, to, duration, wave] = presets[kind] || presets.punch;
      osc.type = wave; osc.frequency.setValueAtTime(from, now); osc.frequency.exponentialRampToValueAtTime(Math.max(35, to), now + duration);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(kind === "win" ? .12 : .075, now + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.start(now); osc.stop(now + duration + .01);
    } catch { /* Sound is a progressive enhancement; the game still works if audio is unavailable. */ }
  }
  function updateUI() {
    ui.p1Health.style.width = `${p1.hp}%`; ui.p2Health.style.width = `${p2.hp}%`;
    ui.p1Health.parentElement?.setAttribute("aria-valuenow", String(p1.hp)); ui.p2Health.parentElement?.setAttribute("aria-valuenow", String(p2.hp));
    ui.p1Label.textContent = ui.p1Name.value.trim() || p1.data.name;
    ui.p2Label.textContent = ui.p2Name.value.trim() || p2.data.name;
    ui.p2Label.parentElement?.classList.toggle("is-ai", ui.mode.value === "ai");
    root.querySelectorAll(".kombat-touch-player").forEach((el, i) => { el.hidden = i === 1 && ui.mode.value === "ai"; });
    const soundBtn = $("kombatMute"); if (soundBtn) { soundBtn.textContent = muted ? "♪ SOUND OFF" : "♪ SOUND ON"; soundBtn.setAttribute("aria-pressed", String(!muted)); }
  }
  function reset() {
    p1 = fighter(1, kombatFighters.playerOne); p2 = fighter(2, kombatFighters.playerTwo);
    elapsed = 0; winner = ""; held.clear(); pressed.clear(); touchKeyCounts.clear(); updateUI(); draw();
  }
  function rect(x,y,w,h,color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function drawFighter(f, now) {
    const c = f.data.colors;
    const bob = f.grounded && f.action === "idle" ? Math.round(Math.sin(now / 145 + f.side) * 1) : 0;
    const walking = f.action === "walk" ? Math.sin(f.walkTime * 17) : 0;
    const x = Math.round(f.x), base = Math.round(f.y + bob), dir = f.face;
    const isPunch = f.action === "punch";
    const isKick = f.action === "kick";
    const attackDuration = isKick ? .34 : .28;
    const progress = (isPunch || isKick) ? clamp(1 - f.actionTime / attackDuration, 0, 1) : 0;
    // Compact sprite proportions; integer rectangles stay crisp when scaled by CSS.
    ctx.save(); ctx.translate(x, base); ctx.scale(dir * .82, .82);
    ctx.fillStyle = "rgba(8,4,18,.42)"; ctx.fillRect(-14, 1, 28, 4);
    const legA = f.grounded && f.action === "walk" ? Math.round(walking * 3) : 0;
    rect(-9, -12 + legA, 6, 9, c.dark); rect(3, -12 - legA, 6, 9, c.dark);
    rect(-11, -4 + legA, 8, 4, "#21152b"); rect(2, -4 - legA, 9, 4, "#21152b");
    // Tiny hoodie/tunic with belt and chest emblem.
    rect(-11, -29, 22, 18, c.body); rect(-12, -29, 24, 4, c.light); rect(-11, -16, 22, 4, c.dark);
    rect(-4, -25, 8, 7, c.dark); rect(-2, -23, 4, 3, c.light);
    // Rear arm stays tucked; the front arm has distinct shoulder, forearm and fist frames.
    rect(-15, -27, 6, 10, c.dark); rect(-15, -26, 5, 8, c.body);
    if (f.block) {
      rect(7, -33, 7, 10, c.body); rect(7, -38, 8, 7, c.light);
      rect(-14, -28, 7, 10, c.body);
    } else if (isPunch) {
      // Wind-up -> extension -> follow-through makes the arm visibly travel outwards.
      const reach = progress < .25 ? 7 + progress * 12 : progress < .72 ? 10 + (progress - .25) * 34 : 26 - (progress - .72) * 18;
      const lift = progress < .3 ? 1 : -1;
      rect(7, -27, 6, 6, c.dark); // shoulder
      rect(10, -27 + lift, Math.max(4, Math.round(reach - 5)), 5, c.body);
      rect(8 + reach, -29 + lift, 7, 8, c.light); // fist
      rect(9 + reach, -28 + lift, 4, 4, c.body);
      if (progress > .28 && progress < .82) {
        rect(15 + reach, -29, 4, 3, "#fff0a8"); rect(18 + reach, -32, 3, 3, "#fff0a8");
      }
      rect(-15, -27, 6, 9, c.body);
    } else if (isKick) {
      rect(8, -26, 6, 8, c.body); rect(-14, -27, 6, 9, c.body);
      const legReach = progress < .3 ? 7 + progress * 18 : progress < .75 ? 12 + (progress - .3) * 30 : 25 - (progress - .75) * 18;
      rect(1, -13, 7, 5, c.dark); rect(6, -13, Math.max(5, Math.round(legReach)), 6, c.body);
      rect(6 + legReach, -14, 7, 7, c.light);
      if (progress > .3 && progress < .8) rect(14 + legReach, -16, 4, 3, "#fff0a8");
    } else {
      rect(8, -27, 6, 9, c.body); rect(7, -19, 7, 4, c.light);
    }
    // Big square head, tiny fringe, pixel eyes and smile.
    rect(-10, -46, 20, 17, c.light); rect(-12, -48, 24, 7, c.hair);
    rect(-12, -43, 4, 8, c.hair); rect(8, -43, 4, 7, c.hair);
    rect(-6, -40, 3, 3, "#21152b"); rect(3, -40, 3, 3, "#21152b"); rect(-2, -34, 5, 2, c.dark);
    if (f.side === 1) { rect(-3, -26, 3, 3, "#fff1f7"); rect(0, -26, 3, 3, "#fff1f7"); rect(-3, -23, 6, 3, "#fff1f7"); rect(-1, -20, 2, 2, "#fff1f7"); }
    else { rect(-2, -25, 4, 4, c.light); rect(-1, -24, 2, 2, c.body); }
    if (f.stun > 0) { rect(-13, -52, 3, 3, "#fff0a8"); rect(11, -54, 3, 3, "#fff0a8"); }
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#17132c"; ctx.fillRect(0,0,W,H);
    // Low-res stars and simple skyline
    for (let i=0;i<32;i++) rect((i*67+19)%W, (i*31+9)%105, 2, 2, i%3===0?"#ff9fc5":"#b4c8ff");
    for (let i=0;i<10;i++) { const x=i*51-3, h=22+(i*19)%43; rect(x,FLOOR-h,39,h,"#28203f"); for(let wy=FLOOR-h+7;wy<FLOOR-5;wy+=10) for(let wx=x+6;wx<x+34;wx+=10) rect(wx,wy,3,3,"#a9548c"); }
    rect(0,FLOOR,W,H-FLOOR,"#28172d"); rect(0,FLOOR,W,3,"#ff8fc1");
    for(let x=0;x<W;x+=16) rect(x,FLOOR+14,8,1,"#533052");
    ctx.textAlign="center"; ctx.font="bold 12px monospace"; ctx.fillStyle="#ffd6e6"; ctx.fillText("♡  LOVE IS THE FINAL BOSS  ♡",W/2,16);
    drawFighter(p1, last); drawFighter(p2, last);
    if (!running && !winner) { ctx.fillStyle="rgba(8,6,18,.46)"; ctx.fillRect(0,0,W,H); ctx.fillStyle="#fff0f7"; ctx.textAlign="center"; ctx.font="bold 10px monospace"; ctx.fillText("PRESS START TO FIGHT!",W/2,100); }
    if (winner) { ctx.fillStyle="rgba(8,6,18,.72)"; ctx.fillRect(0,0,W,H); ctx.textAlign="center"; ctx.fillStyle="#ffb3d0"; ctx.font="bold 19px monospace"; ctx.fillText("K.O.!",W/2,89); ctx.fillStyle="#fff0f7"; ctx.font="bold 9px monospace"; ctx.fillText(`${winner.toUpperCase()} STOLE YOUR HEART!`,W/2,109); ctx.font="9px monospace"; ctx.fillText("♡ LOVE FATALITY: HEART CAPTURED ♡",W/2,125); }
  }
  const label = (f) => (f.side === 1 ? ui.p1Name.value.trim() : ui.p2Name.value.trim()) || f.data.name;
  function attack(f, type) {
    if (!running || f.cooldown > 0 || f.stun > 0 || f.block || !f.grounded) return;
    f.action = type; f.actionTime = type === "kick" ? .34 : .28; f.attackElapsed = 0; f.cooldown = type === "kick" ? .72 : .52; f.hitDone = false; sound(type);
  }
  function tryHit(f, other) {
    if (!f.actionTime || f.hitDone || !["punch","kick"].includes(f.action)) return;
    const activeStart = f.action === "kick" ? .10 : .075;
    const activeEnd = f.action === "kick" ? .25 : .205;
    if (f.attackElapsed < activeStart || f.attackElapsed > activeEnd) return;
    const range = f.action === "kick" ? 37 : 29;
    const dx = other.x - f.x;
    if (Math.abs(dx) > range || Math.sign(dx) !== f.face || Math.abs(other.y-f.y)>20) return;
    f.hitDone = true;
    const damage = other.block ? (f.action === "kick" ? 3 : 2) : (f.action === "kick" ? 12 : 8);
    other.hp = clamp(other.hp-damage,0,100); other.stun = other.block ? .07 : .2;
    other.x = clamp(other.x + f.face * (other.block ? 2 : 8), 18, W-18);
    if (other.block) sound("block"); else sound("hit");
    if (other.hp <= 0) { running = false; winner = label(f); ui.status.textContent = `${winner} wins! ♡ HEART CAPTURED ♡`; sound("win"); }
    updateUI();
  }
  function consumePressed(key) { if (!pressed.has(key)) return false; pressed.delete(key); return true; }
  function controlsFor(f, dt) {
    const ai = f.side === 2 && ui.mode.value === "ai";
    let left=false,right=false,jump=false,block=false,punch=false,kick=false;
    if (ai) {
      const dx = p1.x-f.x, dist=Math.abs(dx); f.face = dx >= 0 ? -1 : 1;
      left = dx < -34; right = dx > 34;
      f.aiThink -= dt;
      if (f.aiThink <= 0) {
        f.aiThink = .22 + Math.random()*.35;
        if (dist < 43 && f.cooldown <= 0) {
          if (p1.actionTime > 0 && Math.random() < .38) block = true;
          else if (Math.random() < .58) punch = true; else kick = true;
        } else if (dist < 52 && Math.random() < .2) block = true;
        else if (dist > 110 && Math.random() < .2) jump = true;
      }
    } else if (f.side === 1) {
      left=held.has("a"); right=held.has("d"); block=held.has(" ");
      jump=consumePressed("w"); punch=consumePressed("f"); kick=consumePressed("g");
    } else {
      left=held.has("ArrowLeft"); right=held.has("ArrowRight"); block=held.has("ArrowDown");
      jump=consumePressed("ArrowUp"); punch=consumePressed("k"); kick=consumePressed("l");
    }
    f.block = block && f.stun <= 0;
    if (f.stun > 0) { f.stun = Math.max(0,f.stun-dt); f.vx=0; }
    else {
      if (!f.block && f.actionTime <= 0) f.vx = left === right ? 0 : left ? -88 : 88;
      else f.vx = 0;
      if (jump && f.grounded && !f.block) { f.vy=-190; f.grounded=false; f.action="jump"; sound("jump"); }
      if (punch) attack(f,"punch"); if (kick) attack(f,"kick");
    }
    f.x=clamp(f.x+f.vx*dt,20,W-20);
    if (f.vx && f.actionTime <= 0 && !f.block && f.grounded) { f.action="walk"; f.walkTime+=dt; }
    else if (f.actionTime <= 0 && f.stun <= 0 && f.grounded) f.action=f.block?"block":"idle";
    if (!f.grounded) { f.vy+=470*dt; f.y+=f.vy*dt; if(f.y>=FLOOR){f.y=FLOOR;f.vy=0;f.grounded=true;sound("land");} }
    if (f.actionTime > 0) { f.actionTime=Math.max(0,f.actionTime-dt); f.attackElapsed = (f.attackElapsed || 0) + dt; if (f.actionTime===0 && f.stun<=0) f.action="idle"; }
    f.cooldown=Math.max(0,f.cooldown-dt);
  }
  function frame(now) {
    if (!running) return;
    const dt=Math.min((now-last)/1000 || 0,.033); last=now; elapsed+=dt;
    controlsFor(p1,dt); controlsFor(p2,dt);
    p1.face=p1.x<=p2.x?1:-1; p2.face=-p1.face;
    tryHit(p1,p2); tryHit(p2,p1);
    if (Math.abs(p1.x-p2.x)<25) { const mid=(p1.x+p2.x)/2; p1.x=mid-12.5; p2.x=mid+12.5; }
    updateUI(); draw();
    if (elapsed>=60 && running) { running=false; winner=p1.hp===p2.hp?"LOVE":p1.hp>p2.hp?label(p1):label(p2); ui.status.textContent=`Time's up — ${winner} wins!`; draw(); return; }
    if (running) raf=requestAnimationFrame(frame);
  }
  function start() {
    cancelAnimationFrame(raf); reset(); running=true; last=performance.now();
    ui.status.textContent=ui.mode.value==="ai"?"Beat the Love-Bot! Tap attacks once to swing.":"Local versus: Player 1 left, Player 2 right.";
    // AudioContext is created after this user gesture, so mobile browsers allow it.
    if (!muted) { try { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch {} }
    raf=requestAnimationFrame(frame);
  }
  function keyName(e) { return e.key.length===1 ? e.key.toLowerCase() : e.key; }
  function onDown(e) { const k=keyName(e); if (!validKeys.has(k)) return; e.preventDefault(); if (!held.has(k)) pressed.add(k); held.add(k); }
  function onUp(e) { held.delete(keyName(e)); }
  window.addEventListener("keydown",onDown); window.addEventListener("keyup",onUp);
  window.addEventListener("blur",()=>{held.clear();pressed.clear();});
  ui.mode.addEventListener("change",()=>{updateUI();ui.status.textContent=ui.mode.value==="ai"?"Player 2 is the Love-Bot. Touch controls are ready.":"Two players share the screen or keyboard.";});
  ui.p1Name.addEventListener("input",updateUI); ui.p2Name.addEventListener("input",updateUI);
  ui.start.addEventListener("click",start);
  ui.reset.addEventListener("click",()=>{running=false;cancelAnimationFrame(raf);reset();ui.status.textContent="Round reset. Ready when you are.";});
  ui.controls.forEach(button=>{
    const key=actionMap[button.dataset.kombatControl]; if(!key) return;
    const down=e=>{e.preventDefault();try{button.setPointerCapture(e.pointerId);}catch{};if(!held.has(key)) pressed.add(key);held.add(key);};
    const up=e=>{e.preventDefault();held.delete(key);};
    button.addEventListener("pointerdown",down); button.addEventListener("pointerup",up); button.addEventListener("pointercancel",up); button.addEventListener("lostpointercapture",up); button.addEventListener("contextmenu",e=>e.preventDefault());
  });
  const mute = $("kombatMute");
  if (mute) mute.addEventListener("click",()=>{muted=!muted;updateUI();if(!muted && audioCtx) audioCtx.resume();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){held.clear();pressed.clear();}});
  updateUI(); draw();
  return ()=>{running=false;cancelAnimationFrame(raf);window.removeEventListener("keydown",onDown);window.removeEventListener("keyup",onUp);};
}
