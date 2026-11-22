// Scene 2: The Rainy Bench (Year 8). Maya sits alone on a bench, having a hard day.
// Barnaby walks up to her and nuzzles her twice, and she opens up to him.
(function () {
  'use strict';

  const rand = window.Util.rand;
  const drawRow = window.Util.drawRow;

  const MAYA_X = 1.3;          // Maya's bench, as a fraction of screen width
  const LAMP_X = 0.8;          // the streetlamp, as a fraction of screen width
  const START_X = 0.15;        // where Barnaby starts
  const NEAR_RANGE = 0.2;      // how close Barnaby must be to Maya
  const NUZZLE_OFFSET = 0.16;  // how far from Maya Barnaby stands when he nuzzles her

  const ARRIVE = [
    { speaker: 'Maya', text: 'Hey, buddy. Come here.' },
    { speaker: 'Maya', text: '...Long day.' }
  ];
  const AFTER_NUZZLE_1 = [
    { speaker: 'Maya', text: "I didn't get the job." },
    { speaker: 'Maya', text: 'They said I was almost good enough. Almost.' }
  ];
  const AFTER_NUZZLE_2 = [
    { speaker: 'Maya', text: "Sorry. I'm okay. Really." },
    { speaker: 'Maya', text: 'Thanks for always being there, Barnaby.' }
  ];
  const CLOSING = [
    { speaker: 'Maya', text: 'Come on. Walk me home.' }
  ];

  // Phases: idle, walk, talk (any dialogue is on screen), nuzzle1, nuzzle2
  let game = null;
  const state = { phase: 'idle', rainTime: 0, patTime: 0, wipeTime: 0 };

  // Rain drops, as fractions of the screen
  const drops = [];
  for (let i = 0; i < 90; i++) {
    drops.push({
      x: rand(i),
      y: rand(i + 300),
      speed: 0.9 + rand(i + 600) * 0.6,
      len: 0.02 + rand(i + 900) * 0.03
    });
  }

  // Puddle ripples on the ground. x is a fraction of the level width, y a fraction of the ground depth.
  const ripples = [];
  for (let i = 0; i < 16; i++) {
    ripples.push({ x: rand(i + 1000) * 3, y: rand(i + 1100), phase: rand(i + 1200) * 1.5 });
  }

  function isNear() {
    return Math.abs(game.barnaby.x / game.width - MAYA_X) < NEAR_RANGE;
  }

  function start(engine) {
    game = engine;
    engine.barnaby.x = START_X * engine.width;
    state.phase = 'walk';
    state.patTime = 0;
    state.wipeTime = 0;
  }

  function update(dt, engine, pressed) {
    state.rainTime += dt;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y += d.speed * dt;
      d.x -= d.speed * dt * 0.08;
      if (d.y > 1.05) d.y -= 1.1;
      if (d.x < -0.05) d.x += 1.1;
    }
    if (state.patTime > 0) state.patTime -= dt;
    if (state.wipeTime > 0) state.wipeTime -= dt;

    if (state.phase === 'idle' || Dialogue.isActive()) return;

    // Barnaby arrives: Maya speaks first
    if (state.phase === 'walk' && isNear()) {
      state.phase = 'talk';
      Dialogue.say(ARRIVE, function () {
        state.phase = 'nuzzle1';
      });
      return;
    }

    // Barnaby nuzzles her
    if (pressed && isNear() && (state.phase === 'nuzzle1' || state.phase === 'nuzzle2')) {
      engine.barnaby.x = (MAYA_X - NUZZLE_OFFSET) * engine.width;
      state.patTime = 1.2;

      if (state.phase === 'nuzzle1') {
        state.phase = 'talk';
        Dialogue.say(AFTER_NUZZLE_1, function () {
          state.phase = 'nuzzle2';
        });
      } else {
        state.phase = 'talk';
        state.wipeTime = 4;
        Dialogue.say(AFTER_NUZZLE_2, function () {
          Dialogue.say(CLOSING, function () {
            game.goTo('hill', 'YEAR 14 — THE SUNSET HILL');
          });
        });
      }
    }
  }

  function actionLabel() {
    if (state.phase === 'nuzzle1' || state.phase === 'nuzzle2') return 'Nuzzle';
    return null;
  }

  // Lights on the street: a rainy-street sky, buildings with lit windows, and trees
  function drawBuildings(ctx, engine) {
    drawRow(ctx, engine, 0.3, engine.width * 0.55, function (x, i) {
      const bw = engine.width * (0.18 + rand(i + 10) * 0.1);
      const bh = engine.height * (0.28 + rand(i + 20) * 0.2);
      const top = engine.groundY - bh;
      ctx.fillStyle = '#3a4a5e';
      ctx.fillRect(x, top, bw, bh);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          if (rand(i * 13 + row * 3 + col) > 0.45) {
            ctx.fillStyle = 'rgba(255, 214, 138, 0.7)';
            ctx.fillRect(x + bw * (0.15 + col * 0.28), top + bh * (0.1 + row * 0.2), bw * 0.12, bh * 0.08);
          }
        }
      }
    });
  }

  function drawTrees(ctx, engine) {
    drawRow(ctx, engine, 0.6, engine.width * 0.4, function (x, i) {
      const r = engine.height * (0.05 + rand(i + 30) * 0.03);
      const base = engine.groundY;
      ctx.fillStyle = '#2d3f3b';
      ctx.fillRect(x - r * 0.08, base - r * 1.2, r * 0.16, r * 1.2);
      ctx.beginPath();
      ctx.arc(x, base - r * 1.5, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Puddle ripples that grow and fade, over and over
  function drawRipples(ctx, engine) {
    ctx.strokeStyle = 'rgba(190, 210, 225, 0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      const life = ((state.rainTime + r.phase) % 1.5) / 1.5;
      const x = r.x * engine.width - engine.camX;
      const y = engine.groundY + (0.1 + r.y * 0.85) * (engine.height - engine.groundY);
      ctx.globalAlpha = 1 - life;
      ctx.beginPath();
      ctx.ellipse(x, y, engine.width * 0.03 * life + 2, engine.width * 0.008 * life + 1, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Soft slanted rain
  function drawRain(ctx, engine) {
    ctx.strokeStyle = 'rgba(200, 215, 230, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const x = d.x * engine.width;
      const y = d.y * engine.height;
      ctx.moveTo(x, y);
      ctx.lineTo(x - d.len * engine.height * 0.15, y + d.len * engine.height);
    }
    ctx.stroke();
  }

  // The streetlamp: a pole, a warm glow, and a light pool on the ground. Drawn in level coordinates.
  function drawLamp(ctx, engine) {
    const s = engine.size;
    const x = LAMP_X * engine.width;
    const g = engine.groundY;
    const flicker = 0.92 + Math.sin(state.rainTime * 7) * 0.05;

    ctx.save();
    ctx.translate(x, g);
    ctx.scale(1, 0.3);
    const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 3);
    pool.addColorStop(0, 'rgba(255, 210, 130, ' + 0.35 * flicker + ')');
    pool.addColorStop(1, 'rgba(255, 210, 130, 0)');
    ctx.fillStyle = pool;
    ctx.fillRect(-s * 3, -s * 3, s * 6, s * 6);
    ctx.restore();

    ctx.fillStyle = '#263241';
    ctx.fillRect(x - s * 0.05, g - s * 3, s * 0.1, s * 3);
    ctx.fillRect(x - s * 0.2, g - s * 3.12, s * 0.4, s * 0.12);

    const glow = ctx.createRadialGradient(x, g - s * 3, 0, x, g - s * 3, s * 1.6);
    glow.addColorStop(0, 'rgba(255, 220, 150, ' + 0.6 * flicker + ')');
    glow.addColorStop(1, 'rgba(255, 220, 150, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, g - s * 3, s * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // The bench, drawn behind Maya and Barnaby
  function drawBench(ctx, engine) {
    const s = engine.size;
    const x = MAYA_X * engine.width;
    const g = engine.groundY;
    const seatY = g - s * 0.5;

    ctx.fillStyle = '#4a3324';
    ctx.fillRect(x - s * 0.95, seatY - s * 0.7, s * 0.1, s * 0.7);
    ctx.fillRect(x + s * 0.85, seatY - s * 0.7, s * 0.1, s * 0.7);
    ctx.fillRect(x - s * 0.9, seatY + s * 0.12, s * 0.09, g - seatY - s * 0.12);
    ctx.fillRect(x + s * 0.81, seatY + s * 0.12, s * 0.09, g - seatY - s * 0.12);

    ctx.fillStyle = '#6b4a31';
    ctx.fillRect(x - s * 0.98, seatY - s * 0.7, s * 1.96, s * 0.1);
    ctx.fillRect(x - s * 0.98, seatY - s * 0.45, s * 1.96, s * 0.08);

    ctx.fillStyle = '#7a5536';
    ctx.fillRect(x - s * 0.98, seatY, s * 1.96, s * 0.12);
  }

  function drawBackground(ctx, engine) {
    const w = engine.width;
    const h = engine.height;
    const g = engine.groundY;

    const sky = ctx.createLinearGradient(0, 0, 0, g);
    sky.addColorStop(0, '#2c3a4f');
    sky.addColorStop(0.6, '#56677f');
    sky.addColorStop(1, '#8e9db2');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, g + 2);

    drawBuildings(ctx, engine);
    drawTrees(ctx, engine);

    ctx.fillStyle = '#4a5f58';
    ctx.fillRect(0, g, w, h - g);
    drawRipples(ctx, engine);

    ctx.save();
    ctx.translate(-engine.camX, 0);
    drawLamp(ctx, engine);
    drawBench(ctx, engine);
    ctx.restore();

    drawRain(ctx, engine);
  }

  // Maya, sitting on the bench in front of Barnaby
  function drawWorld(ctx, engine) {
    const s = engine.size;
    const x = MAYA_X * engine.width;
    const seatY = engine.groundY - s * 0.5;
    window.MayaAdult.drawSitting(ctx, x, seatY, s, {
      time: state.rainTime,
      wiping: state.wipeTime > 0,
      patting: state.patTime > 0
    });
  }

  window.BenchScene = {
    start: start,
    update: update,
    actionLabel: actionLabel,
    drawBackground: drawBackground,
    drawWorld: drawWorld
  };
})();
