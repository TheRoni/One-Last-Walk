// Small helpers shared by the scene files.
(function () {
  'use strict';

  // A repeatable pseudo-random number from 0 to 1, so the scenery looks the same every time
  function rand(n) {
    const x = Math.sin(n * 91.345 + 17.13) * 43758.5453;
    return x - Math.floor(x);
  }

  // Keeps a number between 0 and 1
  function clamp01(t) {
    return Math.min(Math.max(t, 0), 1);
  }

  // A smooth curve from 0 to 1, slow at both ends
  function smoothstep(t) {
    return t * t * (3 - 2 * t);
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

  // A rounded rectangle path. Call fill or stroke after it.
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.Util = {
    rand: rand,
    clamp01: clamp01,
    smoothstep: smoothstep,
    drawRow: drawRow,
    roundRect: roundRect
  };
})();
