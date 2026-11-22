// Dialogue: a text box with typewriter text. Tap, press Space or Enter, or tap Next to move on.
(function () {
  'use strict';

  const CHARS_PER_SECOND = 36;

  const dialogue = { active: false, lines: [], index: 0, shown: 0, onDone: null };

  function isActive() {
    return dialogue.active;
  }

  // Starts a conversation. lines is a list of { speaker, text }. onDone runs when the last line is closed.
  function say(lines, onDone) {
    dialogue.active = true;
    dialogue.lines = lines;
    dialogue.index = 0;
    dialogue.shown = 0;
    dialogue.onDone = onDone || null;
  }

  function finish() {
    dialogue.active = false;
    dialogue.lines = [];
    const done = dialogue.onDone;
    dialogue.onDone = null;
    if (done) done();
  }

  // Types out the text. A press first shows the whole line, then moves to the next one.
  function update(dt, pressed) {
    if (!dialogue.active) return;
    const line = dialogue.lines[dialogue.index];
    if (!line) {
      finish();
      return;
    }

    if (dialogue.shown < line.text.length) {
      dialogue.shown = Math.min(line.text.length, dialogue.shown + CHARS_PER_SECOND * dt);
    }

    if (pressed) {
      if (Math.floor(dialogue.shown) < line.text.length) {
        dialogue.shown = line.text.length;
      } else {
        dialogue.index += 1;
        dialogue.shown = 0;
        if (dialogue.index >= dialogue.lines.length) finish();
      }
    }
  }

  // Splits text into lines that fit inside maxWidth. The font must already be set.
  function wrap(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (let i = 0; i < words.length; i++) {
      const test = current ? current + ' ' + words[i] : words[i];
      if (current && ctx.measureText(test).width > maxWidth) {
        lines.push(current);
        current = words[i];
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Draws the box near the top of the screen, so it stays clear of the touch buttons
  function draw(ctx, width, height) {
    if (!dialogue.active) return;
    const line = dialogue.lines[dialogue.index];
    if (!line) return;

    const fontSize = Math.round(Math.max(16, Math.min(width * 0.045, 24)));
    const lineHeight = fontSize * 1.45;
    const padding = fontSize * 0.9;
    const boxWidth = Math.min(width * 0.9, 620);
    const textWidth = boxWidth - padding * 2;
    const x = (width - boxWidth) / 2;
    const y = height * 0.06;

    // The box is sized for the full line, so it does not jump while the text types out
    ctx.font = fontSize + 'px Georgia, serif';
    const fullLines = wrap(ctx, line.text, textWidth);
    const boxHeight = padding * 2 + lineHeight * (fullLines.length + 1);

    ctx.fillStyle = 'rgba(12, 18, 28, 0.66)';
    roundRect(ctx, x, y, boxWidth, boxHeight, 14);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Speaker name
    ctx.font = 'bold ' + Math.round(fontSize * 0.75) + 'px Georgia, serif';
    ctx.fillStyle = '#e9c98f';
    ctx.fillText(line.speaker.toUpperCase(), x + padding, y + padding);

    // The text, typed out so far
    ctx.font = fontSize + 'px Georgia, serif';
    ctx.fillStyle = '#f5efe6';
    const shownLines = wrap(ctx, line.text.slice(0, Math.floor(dialogue.shown)), textWidth);
    for (let i = 0; i < shownLines.length; i++) {
      ctx.fillText(shownLines[i], x + padding, y + padding + lineHeight * (i + 1));
    }

    // Hint, shown once the whole line is visible
    if (Math.floor(dialogue.shown) >= line.text.length) {
      ctx.font = Math.round(fontSize * 0.7) + 'px Georgia, serif';
      ctx.fillStyle = 'rgba(245, 239, 230, 0.6)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('tap to continue', x + boxWidth - padding, y + boxHeight - padding * 0.4);
    }
  }

  window.Dialogue = { isActive: isActive, say: say, update: update, draw: draw };
})();
