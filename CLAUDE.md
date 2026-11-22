# One Last Walk: Game Bible

## Concept
A short, emotional, story-driven 2D game. The player is **Barnaby**, a loyal dog, across three moments in his life with his human, **Maya**: puppyhood, young adulthood, and old age. The game is about love, time, and quiet goodbyes.

## Tone and writing
- Grounded, understated, human. No melodrama, no clichés.
- Short, specific lines. Long speeches are a mistake.
- Dialogue appears in a translucent text box with typewriter pacing. Tap, Space, or Enter advances it.

## Core design rules
- No game over, no timer, no fail state.
- Emotion comes from movement and controls, not just text.
- Scene 1: Barnaby is fast and bouncy.
- Scene 3: Barnaby walks slower. Maya slows down and waits when the player pauses.
- One contextual Action button. Its label changes: "Bark / Fetch" (Scene 1), "Nuzzle" (Scene 2), "Rest Head" (Scene 3).

## Scenes
1. **Year 1: The Meadow (Joy).** Bright morning, swaying grass, floating pollen. Barnaby fetches a red ball twice, then barks to celebrate.
2. **Year 8: The Rainy Bench (Comfort).** Soft rain, blue-grey twilight, a glowing streetlamp. Maya sits alone and looks defeated. Barnaby nuzzles her a couple of times while she opens up and thanks him.
3. **Year 14: The Sunset Hill (Goodbye).** Amber and violet sunset, drifting autumn leaves. Barnaby has grey around his muzzle. They walk uphill past 2 glowing memory markers, each with a one-line reflection from Maya. At the top, the player taps Rest Head. Maya says a quiet goodbye, the screen fades to warm light, and a minimal end screen appears with a Replay button.

## Technical rules
- Plain HTML5 Canvas, CSS, and JavaScript. Separate files for HTML, CSS, and JS.
- No external libraries or audio files. Everything works offline.
- The only image files are the app icons (PNG, plus the SVG they are made from). Phones need them to show the game on the home screen.
- Audio is synthesized with the Web Audio API: a soft music-box melody (brighter in Scene 1, softer in Scene 3), plus light sound effects and a Mute toggle.
- Audio starts only after the first tap on the title screen.
- Must work on phones: scales to the screen, no scrolling, no accidental zooming.
- Controls: touch zones or on-screen buttons on mobile, plus keyboard (Arrow keys or A/D, and Space or Enter).

## Working rules for Claude
- Write one file per reply.
- Keep each file under about 300 lines.
- Ask before starting a new file.
- Update `PROGRESS.md` after each completed step.
- Check changes against this document and list any mismatches.
