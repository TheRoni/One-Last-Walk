// Barnaby's drawing. Made from simple shapes, so there are no image files.
(function () {
  'use strict';

  // Draws Barnaby. (x, groundY) is the spot where his paws touch the ground.
  // s is his size in pixels. facing is 1 for right, -1 for left.
  function draw(ctx, x, groundY, s, facing, walking, legTime, running) {
    const bodyColor = '#c8924f';
    const darkColor = '#7a5230';

    ctx.save();
    // Running bounces him up and down and leans him forward
    const bounce = running ? Math.abs(Math.sin(legTime * 10)) * s * 0.06 : 0;
    ctx.translate(x, groundY - bounce);
    ctx.scale(facing, 1); // flips him to face the way he walks
    ctx.rotate(running ? 0.08 : 0);
    ctx.lineCap = 'round';

    // Tail
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.9);
    ctx.quadraticCurveTo(-s * 0.85, -s * 1.2, -s * 0.75, -s * 1.35);
    ctx.stroke();

    // Legs swing while he walks
    const swingSize = running ? 0.22 : 0.12;
    const swing = walking ? Math.sin(legTime * 10) * s * swingSize : 0;
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

  // The spot where Barnaby's mouth is, used when he carries the ball
  function mouthPosition(x, groundY, s, facing) {
    return { x: x + facing * s * 0.9, y: groundY - s * 1.12 };
  }

  window.Barnaby = { draw: draw, mouthPosition: mouthPosition };
})();
