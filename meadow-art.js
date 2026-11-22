// Scene 1 (The Meadow): the sky, hills, bushes, grass, and floating pollen. Shapes only.
(function () {
  'use strict';

  let time = 0;

  // A repeatable pseudo-random number from 0 to 1, so the scenery looks the same every time
  function rand(n) {
    const x = Math.sin(n * 91.345 + 17.13) * 43758.5453;
    return x - Math.floor(x);
  }

  // Floating pollen grains. Positions are fractions of the screen.
  const pollen = [];
  for (let i = 0; i < 36; i++) {
    pollen.push({
      x: rand(i),
      y: rand(i + 50),
      drift: 0.01 + rand(i + 100) * 0.02,
      bob: rand(i + 150) * Math.PI * 2,
      size: 1.5 + rand(i + 200) * 2.5
    });
  }

  function update(dt) {
    time += dt;
    for (let i = 0; i < pollen.length; i++) {
      pollen[i].x += pollen[i].drift * dt;
      if (pollen[i].x > 1.05) pollen[i].x -= 1.1;
    }
  }

  // Repeats a shape across the level. factor sets the parallax speed:
  // 0 keeps it fixed on screen, 1 moves it exactly with the ground.
  function drawRow(ctx, engine, factor, spacing, drawOne) {
    const offset = engine.camX * factor;
    const first = Math.floor(offset / spacing) - 1;
    const last = Math.ceil((offset + engine.width) / spacing) + 1;
    for (let i = first; i <= last; i++) {
      drawOne(i * spacing - offset, i);
    }
  }

  function drawSky(ctx, engine) {
    const sky = ctx.createLinearGradient(0, 0, 0, engine.groundY);
    sky.addColorStop(0, '#8ccbe9');
    sky.addColorStop(0.7, '#d7f0f5');
    sky.addColorStop(1, '#fff1d0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, engine.width, engine.groundY + 2);

    // A soft morning sun
    const sx = engine.width * 0.78;
    const sy = engine.height * 0.2;
    const sr = engine.height * 0.22;
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    glow.addColorStop(0, 'rgba(255, 250, 225, 0.95)');
    glow.addColorStop(0.35, 'rgba(255, 245, 200, 0.45)');
    glow.addColorStop(1, 'rgba(255, 245, 200, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, engine.width, engine.groundY);
  }

  // Far hills: they move slowly, so they look far away
  function drawHills(ctx, engine) {
    const spacing = engine.width * 0.75;
    drawRow(ctx, engine, 0.25, spacing, function (x, i) {
      const peak = engine.height * (0.22 + rand(i + 300) * 0.08);
      ctx.fillStyle = '#a6cfa2';
      ctx.beginPath();
      ctx.ellipse(x + spacing / 2, engine.groundY, spacing * 0.6, peak, 0, Math.PI, 0);
      ctx.fill();
    });
  }

  // Bushes in the middle distance
  function drawBushes(ctx, engine) {
    const spacing = engine.width * 0.42;
    drawRow(ctx, engine, 0.5, spacing, function (x, i) {
      const r = engine.height * (0.035 + rand(i + 400) * 0.02);
      const base = engine.groundY;
      const shift = rand(i + 500) * spacing * 0.3;
      ctx.fillStyle = '#7fb27a';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(x + shift + (k - 1) * r, base - r * 0.7, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawGround(ctx, engine) {
    ctx.fillStyle = '#8dbd69';
    ctx.fillRect(0, engine.groundY, engine.width, engine.height - engine.groundY);
  }

  // Swaying grass blades, and a few flowers. These move with the ground.
  function drawGrass(ctx, engine) {
    const step = 11;
    const first = Math.floor(engine.camX / step) - 1;
    const last = Math.ceil((engine.camX + engine.width) / step) + 1;
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;

    for (let i = first; i <= last; i++) {
      const worldX = i * step;
      const x = worldX - engine.camX;
      const h = engine.height * (0.03 + rand(i) * 0.04);
      const sway = Math.sin(time * 1.7 + worldX * 0.02) * h * 0.35;
      const tipX = x + sway;
      const tipY = engine.groundY - h;

      ctx.strokeStyle = rand(i + 9) > 0.5 ? '#6fa452' : '#7fb85c';
      ctx.beginPath();
      ctx.moveTo(x, engine.groundY + 2);
      ctx.quadraticCurveTo(x + sway * 0.3, engine.groundY - h * 0.6, tipX, tipY);
      ctx.stroke();

      if (rand(i + 77) > 0.93) {
        ctx.fillStyle = '#fff6c9';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawPollen(ctx, engine) {
    ctx.fillStyle = 'rgba(255, 246, 200, 0.85)';
    for (let i = 0; i < pollen.length; i++) {
      const p = pollen[i];
      const x = p.x * engine.width;
      const y = p.y * engine.groundY * 0.95 + Math.sin(time * 0.8 + p.bob) * 8;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draws everything behind Barnaby, from the back layers to the front
  function drawBackground(ctx, engine) {
    drawSky(ctx, engine);
    drawHills(ctx, engine);
    drawBushes(ctx, engine);
    drawGround(ctx, engine);
    drawGrass(ctx, engine);
    drawPollen(ctx, engine);
  }

  window.MeadowArt = { update: update, drawBackground: drawBackground };
})();
