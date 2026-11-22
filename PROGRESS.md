# One Last Walk: Progress

## Current stage
Stage 3: Scenes 2 and 3 (scenes and transitions done; music and sound still to do)

## Stages
- [x] **Stage 0: Setup.** Repository, `CLAUDE.md`, `PROGRESS.md`.
- [x] **Stage 1: Prototype.** Barnaby moves on one screen with touch buttons. Plays on a phone. Files: `index.html`, `style.css`, `game.js`.
- [x] **Stage 2: Scene 1 vertical slice.** Parallax background, fetch, Bark button, dialogue, title card. Files: `barnaby.js`, `meadow-art.js`, `dialogue.js`, `meadow.js`.
- [ ] **Stage 3: Scenes 2 and 3.** Scenes, transitions, and the end screen are done and pass a full headless playthrough. Music and sound are still to do. Files: `util.js`, `maya-adult.js`, `bench.js`, `hill.js`.
- [ ] **Stage 4: Polish.** Menu, mute, saving, offline support, icon.

## Next step
Stage 3 (rest): music and sound. A soft music-box melody, the bark, rain, memory chimes, and a Mute button. Then a title screen that starts the sound on the first tap.

## Known issues
- GitHub Pages is not turned on yet. Phone testing uses a private claude.ai link, which must be republished after each change.

## Decisions log
- Plain HTML, CSS, and JavaScript. No libraries or external files.
- Landscape or portrait: not decided yet.
- Phone testing: private claude.ai test link for now. GitHub Pages can be turned on later.
- The level is three screens wide, with a camera that follows Barnaby. Scene positions are fractions of screen width.
- Scene scripts (`meadow.js`) and drawing (`meadow-art.js`) are separate, so each new scene can be its own pair of files.
- Barnaby runs (faster, bouncier) while the ball is in play. Scenes control this with `wantsRun`.
- Maya is a girl: pink dress, pigtails with bows.
