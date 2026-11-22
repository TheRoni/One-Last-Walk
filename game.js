// One Last Walk: the game engine.
// Handles the canvas, controls, camera, Barnaby's walking, fades, title cards, and the game loop.
// Each scene lives in its own file and is listed in the scenes table below.

(function () {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnAction = document.getElementById('btn-action');

  const WALK_SPEED = 0.22;   // how far Barnaby walks per second, as a fraction of screen width
  const RUN_SPEED = 0.4;     // how far Barnaby runs per second, as a fraction of screen width
  const EDGE_MARGIN = 0.03;  // keeps Barnaby off the very edges of the level, as a fraction of width
  const GROUND_LINE = 0.62;  // where the ground starts, as a fraction of screen height
  const WORLD_SCREENS = 3;   // each level is three screens wide

  const BLACK = '0, 0, 0';
  const WARM = '255, 226, 170';

  const KEY_DIRECTIONS = {
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right'
  };

  // Every scene, by name. Each one is defined in its own file.
  const scenes = {
    meadow: window.MeadowScene,
    bench: window.BenchScene,
    hill: window.HillScene
  };

  const input = { left: false, right: false };
  let actionQueued = false;

  // The fade overlay, used for title cards, scene changes, and the end screen
  const fade = {
    active: false,
    alpha: 0,
    color: BLACK,
    text: '',
    showText: false,
    steps: [],
    stepIndex: 0,
    stepTime: 0,
    onDone: null
  };

  const engine = {
    width: 0,
    height: 0,
    groundY: 0,
    size: 0,          // Barnaby's size in pixels
    worldWidth: 0,    // total width of the level in pixels
    camX: 0,          // how far the camera has moved into the level
    barnaby: { x: 0, facing: 1, walking: false, running: false, grey: false, legTime: 0 },
    scene: scenes.meadow,
    showTitle: showTitle,
    goTo: goTo,
    fadeToWarm: fadeToWarm
  };

  // Keeps a horizontal position inside the level
  function clampX(x) {
    const margin = engine.width * EDGE_MARGIN;
    return Math.min(Math.max(x, margin), engine.worldWidth - margin);
  }

  // The camera follows Barnaby, but never shows past the ends of the level
  function updateCamera() {
    const maxCam = engine.worldWidth - engine.width;
    engine.camX = Math.min(Math.max(engine.barnaby.x - engine.width / 2, 0), maxCam);
  }

  // The height of the ground at a level position. Scenes with hills can change it.
  function groundAt(x) {
    const scene = engine.scene;
    if (scene && scene.groundAt) return scene.groundAt(x, engine);
    return engine.groundY;
  }

  // Sets the canvas size to match the screen, and keeps it sharp on high-density phone screens
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const oldWidth = engine.width;
    engine.width = window.innerWidth;
    engine.height = window.innerHeight;
    engine.groundY = engine.height * GROUND_LINE;
    engine.size = Math.min(engine.width, engine.height) * 0.14;
    engine.worldWidth = engine.width * WORLD_SCREENS;

    canvas.width = Math.round(engine.width * dpr);
    canvas.height = Math.round(engine.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Keep Barnaby in the same place in the level when the screen size changes
    if (oldWidth) engine.barnaby.x *= engine.width / oldWidth;
    engine.barnaby.x = clampX(engine.barnaby.x);
    updateCamera();
  }

  function queueAction() {
    actionQueued = true;
  }

  // Connects one on-screen zone to a direction. Holding the zone keeps Barnaby walking.
  function bindHold(element, direction) {
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

  bindHold(btnLeft, 'left');
  bindHold(btnRight, 'right');

  // The action button, and taps on the game area, both press the action
  btnAction.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    if (!btnAction.classList.contains('disabled')) queueAction();
  });

  canvas.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    queueAction();
  });

  // Keyboard controls
  window.addEventListener('keydown', function (event) {
    const direction = KEY_DIRECTIONS[event.code];
    if (direction) {
      input[direction] = true;
      event.preventDefault();
    }
    if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
      queueAction();
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

  // Fades ---------------------------------------------------------------

  // Starts a fade step: sets its colour and text, and runs its onStart if it has one
  function beginStep() {
    const step = fade.steps[fade.stepIndex];
    fade.color = step.color || BLACK;
    fade.showText = !!step.showText;
    if (step.onStart) step.onStart();
  }

  // Runs fade steps one after another, then calls onDone
  function startFade(text, steps, onDone) {
    fade.active = true;
    fade.text = text;
    fade.steps = steps;
    fade.stepIndex = 0;
    fade.stepTime = 0;
    fade.onDone = onDone || null;
    beginStep();
  }

  function updateFade(dt) {
    if (!fade.active) return;

    const step = fade.steps[fade.stepIndex];
    fade.stepTime += dt;
    const k = Math.min(fade.stepTime / step.seconds, 1);
    fade.alpha = step.from + (step.to - step.from) * k;

    if (k >= 1) {
      fade.stepIndex += 1;
      fade.stepTime = 0;
      if (fade.stepIndex < fade.steps.length) {
        beginStep();
      } else {
        fade.active = false;
        const done = fade.onDone;
        fade.onDone = null;
        if (done) done();
      }
    }
  }

  // Title card: fade to black, show the text, then fade back to the game
  function showTitle(text, onDone) {
    startFade(text, [
      { from: 0, to: 1, seconds: 0.8 },
      { from: 1, to: 1, seconds: 2.2, showText: true },
      { from: 1, to: 0, seconds: 0.8 }
    ], onDone);
  }

  function switchScene(key) {
    engine.scene = scenes[key];
    engine.barnaby.grey = key === 'hill';
    engine.barnaby.walking = false;
    engine.barnaby.running = false;
  }

  // Fades to black with a title card. The new scene is switched in while the title is on screen,
  // and starts once the screen is clear again.
  function goTo(key, title) {
    startFade(title, [
      { from: fade.alpha, to: 1, seconds: 0.8 },
      { from: 1, to: 1, seconds: 2.2, showText: true, onStart: function () { switchScene(key); } },
      { from: 1, to: 0, seconds: 0.8 }
    ], function () {
      if (engine.scene && engine.scene.start) engine.scene.start(engine);
    });
  }

  // Fades to warm light and stays there, for the end screen
  function fadeToWarm(seconds, onDone) {
    startFade('', [{ from: fade.alpha, to: 1, seconds: seconds, color: WARM }], onDone);
  }

  function drawFade() {
    if (fade.alpha <= 0) return;

    ctx.fillStyle = 'rgba(' + fade.color + ', ' + fade.alpha + ')';
    ctx.fillRect(0, 0, engine.width, engine.height);

    if (fade.showText && fade.text) {
      ctx.fillStyle = 'rgba(245, 239, 230, ' + fade.alpha + ')';
      ctx.font = Math.round(Math.max(18, Math.min(engine.width * 0.055, 40))) + 'px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fade.text, engine.width / 2, engine.height / 2);
    }
  }

  // Moves Barnaby from the arrow keys or the touch buttons.
  // The scene can make him run, or slow him down, or stop him.
  function moveBarnaby(dt) {
    const b = engine.barnaby;
    const scene = engine.scene;
    const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const speedFactor = scene && scene.speedFactor ? scene.speedFactor(engine) : 1;

    b.walking = direction !== 0 && speedFactor > 0;
    b.running = b.walking && !!(scene && scene.wantsRun && scene.wantsRun(engine));

    if (b.walking) {
      b.facing = direction;
      const speed = (b.running ? RUN_SPEED : WALK_SPEED) * speedFactor;
      b.x = clampX(b.x + direction * speed * engine.width * dt);
      b.legTime += dt * (b.running ? 1.6 : 1);
    }
  }

  // Shows the right label on the action button: Next during dialogue, otherwise the scene's choice
  function updateActionButton() {
    let label = null;
    if (Dialogue.isActive()) {
      label = 'Next';
    } else if (engine.scene && !fade.active) {
      label = engine.scene.actionLabel(engine);
    }

    // When there is nothing to do, hide the button and clear its text
    const hidden = label === null;
    btnAction.classList.toggle('hidden', hidden);
    btnAction.classList.toggle('disabled', hidden);
    const text = label || '';
    if (btnAction.textContent !== text) {
      btnAction.textContent = text;
    }
  }

  // Draws the scene background, then the level, then the dialogue box, the fade, and any end screen
  function draw() {
    const scene = engine.scene;
    if (scene && scene.drawBackground) scene.drawBackground(ctx, engine);

    ctx.save();
    ctx.translate(-engine.camX, 0); // everything in the level moves with the camera
    const b = engine.barnaby;
    Barnaby.draw(ctx, b.x, groundAt(b.x), engine.size, b.facing, b.walking, b.legTime, b.running, b.grey);
    if (scene && scene.drawWorld) scene.drawWorld(ctx, engine);
    ctx.restore();

    Dialogue.draw(ctx, engine.width, engine.height);
    drawFade();
    if (scene && scene.drawOverlay) scene.drawOverlay(ctx, engine);
  }

  let lastTime = 0;

  // The game loop: about 60 times per second, read input, update, then draw
  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05); // seconds since last frame, capped
    lastTime = time;

    const pressed = actionQueued;
    actionQueued = false;

    updateFade(dt);

    const dialogueWasOpen = Dialogue.isActive();
    if (dialogueWasOpen) Dialogue.update(dt, pressed);

    if (Dialogue.isActive() || fade.active) {
      engine.barnaby.walking = false;
      engine.barnaby.running = false;
    } else {
      moveBarnaby(dt);
    }

    if (engine.scene) {
      engine.scene.update(dt, engine, dialogueWasOpen ? false : pressed);
    }

    updateCamera();
    updateActionButton();
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  lastTime = performance.now();
  showTitle('YEAR 1 — THE MEADOW', function () {
    engine.scene.start(engine);
  });
  requestAnimationFrame(frame);
})();
