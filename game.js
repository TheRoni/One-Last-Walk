// One Last Walk: Stage 1 prototype
// Barnaby walks left and right. Hold a touch zone, or use the keyboard (Arrow keys or A and D).

(function () {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');

  const WALK_SPEED = 0.22;   // how far Barnaby walks per second, as a fraction of screen width
  const EDGE_MARGIN = 0.05;  // keeps Barnaby away from the screen edges, as a fraction of width
  const GROUND_LINE = 0.62;  // where the ground starts, as a fraction of screen height

  const KEY_DIRECTIONS = {
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right'
  };

  const input = { left: false, right: false };
  const barnaby = { x: 0, facing: 1, walking: false, legTime: 0 };

  let width = 0;
  let height = 0;
  let placed = false;
  let lastTime = 0;

  // Keeps a horizontal position inside the screen edges
  function clampX(x) {
    const margin = width * EDGE_MARGIN;
    return Math.min(Math.max(x, margin), width - margin);
  }

  // Sets the canvas size to match the screen, and keeps it sharp on high-density phone screens
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!placed) {
      barnaby.x = width / 2;
      placed = true;
    }
    barnaby.x = clampX(barnaby.x);
  }

  // Connects one on-screen zone to a direction. Holding the zone keeps Barnaby walking.
  function bindTouch(element, direction) {
    function press(event) {
      event.preventDefault();
      input[direction] = true;
      element.classList.add('active');
    }

    function release(event) {
      event.preventDefault();
      input[direction] = false;
      element.classList.remove('active');
    }

    element.addEventListener('pointerdown', press);
    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
    element.addEventListener('pointerleave', release);
    element.addEventListener('contextmenu', function (event) {
      event.preventDefault();
    });
  }

  bindTouch(btnLeft, 'left');
  bindTouch(btnRight, 'right');

  // Keyboard controls
  window.addEventListener('keydown', function (event) {
    const direction = KEY_DIRECTIONS[event.code];
    if (direction) {
      input[direction] = true;
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', function (event) {
    const direction = KEY_DIRECTIONS[event.code];
    if (direction) {
      input[direction] = false;
    }
  });

  // If the player switches apps, stop Barnaby from walking on his own
  window.addEventListener('blur', function () {
    input.left = false;
    input.right = false;
  });

  // Moves Barnaby each frame. dt is the time in seconds since the last frame.
  function update(dt) {
    const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    barnaby.walking = direction !== 0;

    if (barnaby.walking) {
      barnaby.facing = direction;
      barnaby.x = clampX(barnaby.x + direction * WALK_SPEED * width * dt);
      barnaby.legTime += dt;
    }
  }

  // Draws the sky, the ground, and Barnaby
  function draw() {
    const groundY = height * GROUND_LINE;

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#2c4a6b');
    sky.addColorStop(1, '#f2c7a0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#5f7f4a';
    ctx.fillRect(0, groundY, width, height - groundY);

    drawBarnaby(groundY);
  }

  // Draws Barnaby from simple shapes. His legs swing while he walks.
  function drawBarnaby(groundY) {
    const s = Math.min(width, height) * 0.14; // Barnaby's size, scaled to the screen
    const bodyColor = '#c8924f';
    const darkColor = '#7a5230';

    ctx.save();
    ctx.translate(barnaby.x, groundY);
    ctx.scale(barnaby.facing, 1); // flips him to face the direction he walks

    // Tail
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.9);
    ctx.quadraticCurveTo(-s * 0.85, -s * 1.2, -s * 0.75, -s * 1.35);
    ctx.stroke();

    // Legs
    const swing = barnaby.walking ? Math.sin(barnaby.legTime * 10) * s * 0.12 : 0;
    ctx.lineWidth = s * 0.12;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.5);
    ctx.lineTo(-s * 0.4 + swing, 0);
    ctx.moveTo(-s * 0.2, -s * 0.5);
    ctx.lineTo(-s * 0.2 - swing, 0);
    ctx.moveTo(s * 0.25, -s * 0.5);
    ctx.lineTo(s * 0.25 - swing, 0);
    ctx.moveTo(s * 0.45, -s * 0.5);
    ctx.lineTo(s * 0.45 + swing, 0);
    ctx.stroke();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.8, s * 0.6, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 1.2, s * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(s * 0.45, -s * 1.45, s * 0.12, s * 0.22, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye and nose
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(s * 0.66, -s * 1.25, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(s * 0.84, -s * 1.18, s * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // The game loop: update, then draw, about 60 times per second
  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  lastTime = performance.now();
  requestAnimationFrame(frame);
})();
