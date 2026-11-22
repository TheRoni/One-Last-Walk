// Maya as a young adult, drawn from simple shapes.
// Scene 2 uses the sitting pose on the bench. Scene 3 uses the standing pose.
(function () {
  'use strict';

  const SKIN = '#f1c9a5';
  const HAIR = '#3d2a20';
  const COAT = '#56708f';
  const JEANS = '#2f3e55';
  const SHOE = '#3a2a22';
  const SCARF = '#d9a441';
  const EYE = '#2b1d14';

  // Draws an arm from the shoulder to the hand, with a skin-coloured hand
  function drawArm(ctx, s, sx, sy, hx, hy) {
    ctx.strokeStyle = COAT;
    ctx.lineWidth = s * 0.14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.arc(hx, hy, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // The head, hair, and face. headY is the height of the centre of the head.
  // expression is 'sad' (closed eyes, a frown, and a falling tear) or anything else for a gentle smile.
  function drawHead(ctx, s, headY, expression, time) {
    const sad = expression === 'sad';

    // Long hair behind the head
    ctx.fillStyle = HAIR;
    ctx.beginPath();
    ctx.ellipse(0, headY + s * 0.08, s * 0.33, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.arc(0, headY, s * 0.27, 0, Math.PI * 2);
    ctx.fill();

    // Fringe across the top of the forehead
    ctx.fillStyle = HAIR;
    ctx.beginPath();
    ctx.arc(0, headY, s * 0.28, Math.PI, 0);
    ctx.fill();

    // Eyes: closed when sad, open otherwise
    const eyeY = headY + s * 0.02;
    ctx.strokeStyle = EYE;
    ctx.fillStyle = EYE;
    ctx.lineWidth = s * 0.025;
    ctx.lineCap = 'round';
    if (sad) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, eyeY);
      ctx.lineTo(-s * 0.05, eyeY);
      ctx.moveTo(s * 0.05, eyeY);
      ctx.lineTo(s * 0.14, eyeY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, eyeY, s * 0.03, s * 0.04, 0, 0, Math.PI * 2);
      ctx.ellipse(s * 0.1, eyeY, s * 0.03, s * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth: a frown when sad, a smile otherwise
    ctx.beginPath();
    if (sad) {
      ctx.arc(0, headY + s * 0.22, s * 0.07, Math.PI * 1.15, Math.PI * 1.85);
    } else {
      ctx.arc(0, headY + s * 0.1, s * 0.07, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();

    // A tear that keeps falling down her cheek while she is sad
    if (sad) {
      const fall = (time * 0.5) % 1;
      if (fall < 0.7) {
        ctx.fillStyle = '#9cc6ea';
        ctx.beginPath();
        ctx.arc(s * 0.14, headY + s * 0.06 + fall * s * 0.3, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Maya sitting on a bench. (x, seatY) is the middle of the seat.
  // opts: { time, wiping, patting }. wiping lifts a hand to her face. patting lifts a hand towards Barnaby.
  function drawSitting(ctx, x, seatY, s, opts) {
    const o = opts || {};
    ctx.save();
    ctx.translate(x, seatY);
    ctx.lineCap = 'round';

    // Shins and shoes: her feet reach the ground
    ctx.strokeStyle = JEANS;
    ctx.lineWidth = s * 0.2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, 0);
    ctx.lineTo(-s * 0.14, s * 0.5);
    ctx.moveTo(s * 0.14, 0);
    ctx.lineTo(s * 0.14, s * 0.5);
    ctx.stroke();

    ctx.fillStyle = SHOE;
    ctx.beginPath();
    ctx.ellipse(-s * 0.14, s * 0.52, s * 0.14, s * 0.07, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.14, s * 0.52, s * 0.14, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coat and scarf
    ctx.fillStyle = COAT;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.45, s * 0.32, s * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = SCARF;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.98, s * 0.24, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    drawHead(ctx, s, -s * 1.18, 'sad', o.time || 0);

    // Arms: resting in her lap, one hand on Barnaby, or one hand up to her face
    const left = o.patting ? [-s * 0.5, -s * 0.5] : [-s * 0.12, -s * 0.12];
    const right = o.wiping ? [s * 0.14, -s * 1.0] : [s * 0.12, -s * 0.12];
    drawArm(ctx, s, -s * 0.27, -s * 0.8, left[0], left[1]);
    drawArm(ctx, s, s * 0.27, -s * 0.8, right[0], right[1]);

    ctx.restore();
  }

  // Maya standing, as she walks. (x, groundY) is where her feet touch the ground.
  // opts: { time, walking, expression }.
  function drawStanding(ctx, x, groundY, s, opts) {
    const o = opts || {};
    const swing = o.walking ? Math.sin((o.time || 0) * 9) * s * 0.16 : 0;

    ctx.save();
    ctx.translate(x, groundY);
    ctx.lineCap = 'round';

    // Legs and shoes
    ctx.strokeStyle = JEANS;
    ctx.lineWidth = s * 0.18;
    ctx.beginPath();
    ctx.moveTo(-s * 0.13, -s * 0.6);
    ctx.lineTo(-s * 0.13 + swing, 0);
    ctx.moveTo(s * 0.13, -s * 0.6);
    ctx.lineTo(s * 0.13 - swing, 0);
    ctx.stroke();

    ctx.fillStyle = SHOE;
    ctx.beginPath();
    ctx.ellipse(-s * 0.1 + swing, -s * 0.02, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.16 - swing, -s * 0.02, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coat
    ctx.fillStyle = COAT;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.95, s * 0.3, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms swing gently with the walk
    drawArm(ctx, s, -s * 0.27, -s * 1.0, -s * 0.3 - swing * 0.5, -s * 0.5);
    drawArm(ctx, s, s * 0.27, -s * 1.0, s * 0.3 + swing * 0.5, -s * 0.5);

    // Scarf
    ctx.fillStyle = SCARF;
    ctx.beginPath();
    ctx.ellipse(0, -s * 1.26, s * 0.22, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    drawHead(ctx, s, -s * 1.5, o.expression || 'happy', o.time || 0);

    ctx.restore();
  }

  window.MayaAdult = { drawSitting: drawSitting, drawStanding: drawStanding };
})();
