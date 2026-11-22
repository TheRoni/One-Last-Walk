// Scene 3: The Sunset Hill (Year 14). Barnaby is older, with grey around his muzzle.
// They walk up the hill together, pass two memory markers, and watch the sun go down.
(function () {
  'use strict';

  const rand = window.Util.rand;
  const drawRow = window.Util.drawRow;
  const clamp01 = window.Util.clamp01;
  const smoothstep = window.Util.smoothstep;

  const START_X = 0.12;          // where Barnaby starts, as a fraction of screen width
  const CREST_X = 1.9;           // the top of the hill, as a fraction of screen width
  const RISE_FRACTION = 0.1;     // how high the hill rises, as a fraction of screen height
  const WALKING_OFFSET = 0.22;   // how far ahead of Barnaby Maya walks
  const RESTING_OFFSET = 0.16;   // how far ahead of Barnaby Maya stands at the top
  const MARKER_RANGE = 0.06;     // how close Barnaby must be to a memory marker
  const SLOW = 0.6;              // Barnaby walks slowly up the hill

  const MARKERS = [
    { x: 0.7, done: false, lines: [{ speaker: 'Maya', text: 'We used to walk this way every morning.' }] },
    { x: 1.35, done: false, lines: [{ speaker: 'Maya', text: 'You always made me stop here to catch my breath.' }] }
  ];

  const BUSHES = [0.4, 1.0, 1.6, 2.2];
  const LEAF_COLORS = ['#d9822b', '#b5523b', '#e0a84f'];

  const GOODBYE = [
    { speaker: 'Maya', text: 'Look at that sky. It is gold tonight.' },
    { speaker: 'Maya', text: 'Thank you for every single walk, Barnaby.' },
    { speaker: 'Maya', text: 'I love you, buddy. Rest now.' }
  ];

  // Phases: idle, walk, crest (Barnaby is at the top), goodbye, ended
  let game = null;
  const state = { phase: 'idle', time: 0, mayaX: 0, mayaWalking: false };

  // Falling autumn leaves, as fractions of the screen
  const leaves = [];
  for (let i = 0; i < 28; i++) {
    leaves.push({
      x: rand(i + 2000),
      y: rand(i + 2100),
      speed: 0.03 + rand(i + 2200) * 0.05,
      sway: rand(i + 2300) * Math.PI * 2,
      size: 0.008 + rand(i + 2400) * 0.008,
      color: LEAF_COLORS[i % LEAF_COLORS.length]
    });
  }

  // The hill: the ground rises from the left and levels off at the crest
  function groundAt(x, engine) {
    const t = clamp01((x / engine.width - 0.2) / (CREST_X - 0.2));
    return engine.groundY - engine.height * RISE_FRACTION * smoothstep(t);
  }

  // How far up the hill Barnaby is, from 0 to 1. The sun sets as this grows.
  function progress(engine) {
    return clamp01(engine.barnaby.x / (CREST_X * engine.width));
  }

  function start(engine) {
    game = engine;
    engine.barnaby.x = START_X * engine.width;
    state.mayaX = START_X + WALKING_OFFSET;
    state.phase = 'walk';
    state.time = 0;
    for (let i = 0; i < MARKERS.length; i++) {
      MARKERS[i].done = false;
    }
  }

  function updateLeaves(dt) {
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      leaf.y += leaf.speed * dt;
      leaf.sway += dt * 1.5;
      if (leaf.y > 1.05) leaf.y -= 1.1;
    }
  }

  function update(dt, engine, pressed) {
    state.time += dt;
    updateLeaves(dt);

    if (state.phase === 'idle' || Dialogue.isActive()) return;

    const b = engine.barnaby;
    const crest = CREST_X * engine.width;
    if (b.x > crest) b.x = crest;
    const atCrest = b.x >= crest - 1;
    if (state.phase === 'walk' || state.phase === 'crest') {
      state.phase = atCrest ? 'crest' : 'walk';
    }

    // Maya walks ahead of Barnaby. She eases in, so she slows down and waits when he stops.
    const before = state.mayaX;
    const target = b.x / engine.width + (atCrest ? RESTING_OFFSET : WALKING_OFFSET);
    state.mayaX += (target - state.mayaX) * Math.min(1, dt * 3);
    state.mayaWalking = Math.abs(state.mayaX - before) > 0.0002;

    // Passing a memory marker: Maya says one warm line
    for (let i = 0; i < MARKERS.length; i++) {
      const m = MARKERS[i];
      if (!m.done && Math.abs(b.x / engine.width - m.x) < MARKER_RANGE) {
        m.done = true;
        Dialogue.say(m.lines);
        return;
      }
    }

    // Rest Head at the top: Maya says goodbye, then the screen fades to warm light
    if (state.phase === 'crest' && pressed) {
      state.phase = 'goodbye';
      Dialogue.say(GOODBYE, function () {
        game.fadeToWarm(3, function () {
          state.phase = 'ended';
        });
      });
    } else if (state.phase === 'ended' && pressed) {
      state.phase = 'idle';
      game.goTo('meadow', 'YEAR 1 — THE MEADOW');
    }
  }

  // Barnaby walks slowly up the hill, and cannot move during the goodbye or on the end screen
  function speedFactor() {
    if (state.phase === 'goodbye' || state.phase === 'ended' || state.phase === 'idle') return 0;
    return SLOW;
  }

  function actionLabel() {
    if (state.phase === 'crest') return 'Rest Head';
    if (state.phase === 'ended') return 'Replay';
    return null;
  }

  function drawSun(ctx, engine) {
    const p = progress(engine);
    const x = engine.width * 0.7;
    const startY = engine.height * 0.22;
    const endY = engine.groundY - engine.height * 0.04;
    const y = startY + (endY - startY) * p;
    const r = engine.height * 0.07;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    glow.addColorStop(0, 'rgba(255, 220, 150, 0.55)');
    glow.addColorStop(1, 'rgba(255, 180, 110, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffe2a8';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLeaves(ctx, engine) {
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      const x = (leaf.x + Math.sin(leaf.sway) * 0.02) * engine.width;
      const y = leaf.y * engine.height;
      const r = leaf.size * engine.width;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(leaf.sway);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBackground(ctx, engine) {
    const w = engine.width;
    const h = engine.height;
    const g = engine.groundY;

    // Sky: violet at the top, amber near the horizon
    const sky = ctx.createLinearGradient(0, 0, 0, g);
    sky.addColorStop(0, '#3b2f5c');
    sky.addColorStop(0.45, '#8e4f72');
    sky.addColorStop(0.8, '#e8895a');
    sky.addColorStop(1, '#ffc27a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, g + 2);

    drawSun(ctx, engine);

    // Distant hills hide the sun as it sets
    drawRow(ctx, engine, 0.15, w * 0.8, function (x, i) {
      const peak = h * (0.25 + rand(i + 3000) * 0.06);
      ctx.fillStyle = '#6e4f80';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.4, g, w * 0.48, peak, 0, Math.PI, 0);
      ctx.fill();
    });
    drawRow(ctx, engine, 0.35, w * 0.6, function (x, i) {
      const peak = h * (0.16 + rand(i + 3100) * 0.05);
      ctx.fillStyle = '#523a6e';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.3, g, w * 0.36, peak, 0, Math.PI, 0);
      ctx.fill();
    });

    // The hill itself, following the slope
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let sx = 0; sx <= w + 8; sx += 8) {
      ctx.lineTo(sx, groundAt(sx + engine.camX, engine));
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = '#7b6a3c';
    ctx.fill();

    // Orange bushes on the slope, in level coordinates
    const s = engine.size;
    ctx.save();
    ctx.translate(-engine.camX, 0);
    for (let i = 0; i < BUSHES.length; i++) {
      const x = BUSHES[i] * w;
      const y = groundAt(x, engine);
      ctx.fillStyle = i % 2 === 0 ? '#c4642f' : '#d98a3a';
      ctx.beginPath();
      ctx.arc(x - s * 0.5, y - s * 0.3, s * 0.5, 0, Math.PI * 2);
      ctx.arc(x, y - s * 0.55, s * 0.6, 0, Math.PI * 2);
      ctx.arc(x + s * 0.5, y - s * 0.3, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    drawLeaves(ctx, engine);
  }

  // Memory markers and Maya, in level coordinates. Barnaby is drawn just before this.
  function drawWorld(ctx, engine) {
    const s = engine.size;
    const w = engine.width;

    for (let i = 0; i < MARKERS.length; i++) {
      const m = MARKERS[i];
      const x = m.x * w;
      const y = groundAt(x, engine) - s * 1.1;
      const pulse = 0.8 + 0.2 * Math.sin(state.time * 2 + i);
      const strength = m.done ? 0.35 : 0.8;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 0.9);
      glow.addColorStop(0, 'rgba(255, 236, 180, ' + strength * pulse + ')');
      glow.addColorStop(1, 'rgba(255, 236, 180, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, s * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff6dc';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }

    const mx = state.mayaX * w;
    window.MayaAdult.drawStanding(ctx, mx, groundAt(mx, engine), s * 0.95, {
      walking: state.mayaWalking,
      time: state.time,
      expression: 'happy'
    });
  }

  // The end screen: the title and a Replay button, drawn over the warm light
  function drawOverlay(ctx, engine) {
    if (state.phase !== 'ended') return;
    const w = engine.width;
    const h = engine.height;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4a3324';
    ctx.font = 'italic ' + Math.round(Math.max(22, Math.min(w * 0.075, 48))) + 'px Georgia, serif';
    ctx.fillText('One Last Walk', w / 2, h * 0.4);

    const bw = Math.min(w * 0.5, 220);
    const bh = 56;
    const bx = w / 2 - bw / 2;
    const by = h * 0.55;
    window.Util.roundRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fillStyle = 'rgba(74, 51, 36, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(74, 51, 36, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#4a3324';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Replay', w / 2, by + bh / 2);
    ctx.restore();
  }

  window.HillScene = {
    start: start,
    update: update,
    actionLabel: actionLabel,
    speedFactor: speedFactor,
    groundAt: groundAt,
    drawBackground: drawBackground,
    drawWorld: drawWorld,
    drawOverlay: drawOverlay
  };
})();
