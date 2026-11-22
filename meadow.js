// Scene 1: The Meadow. Maya throws the red ball, Barnaby fetches it twice, and he barks to celebrate.
(function () {
  'use strict';

  // Positions are fractions of the screen width, so the scene works on any phone
  const MAYA_X = 0.3;
  const START_X = 0.45;
  const FIRST_THROW_X = 0.95;
  const SECOND_THROW_X = 1.9;
  const THROW_SECONDS = 0.9;
  const PICKUP_RANGE = 0.06;  // how close Barnaby must be to pick up the ball
  const DROP_RANGE = 0.12;    // how close to Maya Barnaby must be to give her the ball

  const INTRO = [
    { speaker: 'Maya', text: 'Barnaby! Over here, boy.' },
    { speaker: 'Maya', text: 'Ready? Go get it!' }
  ];
  const AFTER_FIRST_FETCH = [
    { speaker: 'Maya', text: 'Good boy! Again!' }
  ];
  const OUTRO = [
    { speaker: 'Maya', text: 'You never get tired of this, do you?' },
    { speaker: 'Maya', text: "Come on. Let's go home." }
  ];

  // Phases: idle, intro, throwing, ready, carrying, between, outro, finished
  const state = { phase: 'idle', fetches: 0, barkTime: 0, cheerTime: 0 };
  // Ball modes: hidden, flying, ground, carried, held
  const ball = { mode: 'hidden', x: 0, toX: 0, t: 0 };
  let game = null; // the game engine, saved when the scene starts

  function start(engine) {
    game = engine;
    engine.barnaby.x = START_X * engine.width;
    state.phase = 'intro';
    state.fetches = 0;
    state.barkTime = 0;
    state.cheerTime = 0;
    ball.mode = 'hidden';
    Dialogue.say(INTRO, function () {
      throwBall(FIRST_THROW_X);
    });
  }

  function throwBall(toX) {
    ball.mode = 'flying';
    ball.toX = toX;
    ball.t = 0;
    state.phase = 'throwing';
  }

  function giveBallToMaya() {
    ball.mode = 'held';
    ball.x = MAYA_X;
    state.fetches += 1;

    if (state.fetches === 1) {
      state.phase = 'between';
      Dialogue.say(AFTER_FIRST_FETCH, function () {
        throwBall(SECOND_THROW_X);
      });
    } else {
      state.phase = 'outro';
      Dialogue.say(OUTRO, function () {
        state.phase = 'finished';
        game.goTo('bench', 'YEAR 8 — THE RAINY BENCH');
      });
    }
  }

  function canFetch() {
    if (state.phase !== 'ready' || ball.mode !== 'ground') return false;
    return Math.abs(game.barnaby.x / game.width - ball.x) < PICKUP_RANGE;
  }

  function bark() {
    state.barkTime = 1.0;
    state.cheerTime = 0.8;
    window.GameAudio.bark();
  }

  function update(dt, engine, pressed) {
    MeadowArt.update(dt);
    if (state.barkTime > 0) state.barkTime -= dt;
    if (state.cheerTime > 0) state.cheerTime -= dt;

    // Nothing happens before the title card ends, or while dialogue is on screen
    if (state.phase === 'idle' || Dialogue.isActive()) return;

    if (ball.mode === 'flying') {
      ball.t += dt;
      if (ball.t >= THROW_SECONDS) {
        ball.mode = 'ground';
        ball.x = ball.toX;
        if (state.phase === 'throwing') state.phase = 'ready';
      }
    }

    if (state.phase === 'carrying') {
      ball.x = engine.barnaby.x / engine.width;
      if (Math.abs(ball.x - MAYA_X) < DROP_RANGE) giveBallToMaya();
    }

    if (pressed) {
      if (canFetch()) {
        ball.mode = 'carried';
        state.phase = 'carrying';
      } else if (state.phase === 'throwing' || state.phase === 'ready' || state.phase === 'carrying') {
        bark();
      }
    }
  }

  // Barnaby runs while the ball is in play (thrown, waiting, or being carried back)
  function wantsRun() {
    return state.phase === 'throwing' || state.phase === 'ready' || state.phase === 'carrying';
  }

  // The action button label: Fetch when the ball is in reach, otherwise Bark
  function actionLabel() {
    const playing = state.phase === 'throwing' || state.phase === 'ready' || state.phase === 'carrying';
    if (!playing) return null;
    return canFetch() ? 'Fetch' : 'Bark';
  }

  // A small bow made from two loops and a knot
  function bow(ctx, x, y, s) {
    ctx.ellipse(x - s * 0.07, y, s * 0.08, s * 0.05, -0.4, 0, Math.PI * 2);
    ctx.ellipse(x + s * 0.07, y, s * 0.08, s * 0.05, 0.4, 0, Math.PI * 2);
    ctx.ellipse(x, y, s * 0.035, s * 0.035, 0, 0, Math.PI * 2);
  }

  // Maya as a girl: a pink dress with a belt, long brown hair in pigtails with bows, and rosy cheeks.
  // Her arms go up when she throws or cheers.
  function drawMaya(ctx, engine) {
    const s = engine.size * 0.9;
    const armsUp = state.cheerTime > 0 || (state.phase === 'throwing' && ball.t < 0.35);
    const handX = armsUp ? 0.35 * s : 0.3 * s;
    const handY = armsUp ? -1.85 * s : -0.8 * s;
    const skin = '#f1c9a5';
    const hair = '#5b3a29';
    const dress = '#f08fa8';
    const accent = '#e0457b';

    ctx.save();
    ctx.translate(MAYA_X * engine.width, engine.groundY);
    ctx.lineCap = 'round';

    // Legs and shoes
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * 0.13;
    ctx.beginPath();
    ctx.moveTo(-s * 0.13, -s * 0.6);
    ctx.lineTo(-s * 0.15, -s * 0.12);
    ctx.moveTo(s * 0.13, -s * 0.6);
    ctx.lineTo(s * 0.15, -s * 0.12);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(-s * 0.16, -s * 0.07, s * 0.13, s * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.16, -s * 0.07, s * 0.13, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back arm
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * 0.1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 1.1);
    ctx.lineTo(-s * 0.3, -s * 0.8);
    ctx.stroke();

    // Long hair and pigtails, behind the head
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.ellipse(-s * 0.3, -s * 1.3, s * 0.1, s * 0.24, 0.15, 0, Math.PI * 2);
    ctx.ellipse(s * 0.3, -s * 1.3, s * 0.1, s * 0.24, -0.15, 0, Math.PI * 2);
    ctx.ellipse(0, -s * 1.42, s * 0.3, s * 0.33, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dress: a fitted top that flares into a skirt
    ctx.fillStyle = dress;
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, -s * 1.15);
    ctx.lineTo(s * 0.18, -s * 1.15);
    ctx.lineTo(s * 0.2, -s * 0.9);
    ctx.lineTo(s * 0.38, -s * 0.42);
    ctx.quadraticCurveTo(0, -s * 0.32, -s * 0.38, -s * 0.42);
    ctx.lineTo(-s * 0.2, -s * 0.9);
    ctx.closePath();
    ctx.fill();

    // Belt
    ctx.fillStyle = accent;
    ctx.fillRect(-s * 0.2, -s * 0.93, s * 0.4, s * 0.05);

    // Front arm
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * 0.1;
    ctx.beginPath();
    ctx.moveTo(s * 0.18, -s * 1.08);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -s * 1.5, s * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Hair cap and fringe
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(0, -s * 1.55, s * 0.27, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 1.64, s * 0.09, 0, Math.PI * 2);
    ctx.arc(-s * 0.08, -s * 1.66, s * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheek
    ctx.fillStyle = 'rgba(240, 120, 130, 0.5)';
    ctx.beginPath();
    ctx.arc(s * 0.13, -s * 1.36, s * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Big eye with a highlight, and a small eyelash
    ctx.fillStyle = '#2b1d14';
    ctx.beginPath();
    ctx.ellipse(s * 0.1, -s * 1.47, s * 0.035, s * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 0.115, -s * 1.49, s * 0.012, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2b1d14';
    ctx.lineWidth = s * 0.02;
    ctx.beginPath();
    ctx.moveTo(s * 0.06, -s * 1.52);
    ctx.lineTo(s * 0.04, -s * 1.55);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = '#7a3b2e';
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.arc(s * 0.07, -s * 1.37, s * 0.05, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Bows on the pigtails
    ctx.fillStyle = accent;
    ctx.beginPath();
    bow(ctx, -s * 0.3, -s * 1.58, s);
    bow(ctx, s * 0.3, -s * 1.58, s);
    ctx.fill();

    ctx.restore();
  }

  // Where the ball is drawn right now, or null if it is not on screen
  function ballSpot(engine) {
    const s = engine.size;
    const g = engine.groundY;
    const w = engine.width;
    const r = s * 0.13;
    const mayaSize = s * 0.9;

    if (ball.mode === 'carried') {
      const b = engine.barnaby;
      const mouth = Barnaby.mouthPosition(b.x, g, s, b.facing);
      return { x: mouth.x, y: mouth.y, r: r };
    }

    if (ball.mode === 'held') {
      return { x: MAYA_X * w + 0.3 * mayaSize, y: g - 0.8 * mayaSize, r: r };
    }

    if (ball.mode === 'flying') {
      const k = Math.min(ball.t / THROW_SECONDS, 1);
      const fromX = MAYA_X * w + 0.35 * mayaSize;
      const fromY = g - 1.85 * mayaSize;
      const toX = ball.toX * w;
      const toY = g - r;
      return {
        x: fromX + (toX - fromX) * k,
        y: fromY + (toY - fromY) * k - Math.sin(k * Math.PI) * engine.height * 0.22,
        r: r
      };
    }

    if (ball.mode === 'ground') {
      return { x: ball.x * w, y: g - r, r: r };
    }

    return null;
  }

  function drawBall(ctx, engine) {
    const spot = ballSpot(engine);
    if (!spot) return;

    ctx.fillStyle = '#d64533';
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(spot.x - spot.r * 0.35, spot.y - spot.r * 0.35, spot.r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // The WOOF! bubble that appears above Barnaby for a moment after a bark
  function drawBarkBubble(ctx, engine) {
    if (state.barkTime <= 0) return;

    const b = engine.barnaby;
    const s = engine.size;
    const x = b.x + b.facing * s * 0.3;
    const y = engine.groundY - s * 2.1;

    ctx.save();
    ctx.globalAlpha = Math.min(1, state.barkTime * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.6, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold ' + Math.round(s * 0.3) + 'px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WOOF!', x, y);
    ctx.restore();
  }

  // Draws everything that sits in the level: Maya, the ball, and the bark bubble
  function drawWorld(ctx, engine) {
    drawMaya(ctx, engine);
    drawBall(ctx, engine);
    drawBarkBubble(ctx, engine);
  }

  window.MeadowScene = {
    start: start,
    update: update,
    actionLabel: actionLabel,
    wantsRun: wantsRun,
    drawBackground: function (ctx, engine) {
      MeadowArt.drawBackground(ctx, engine);
    },
    drawWorld: drawWorld
  };
})();
