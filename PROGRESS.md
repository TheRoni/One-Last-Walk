# One Last Walk: Progress

## Current stage
Stage 4: Polish (icon, offline support, and app details are done; a phone check is left)

## Stages
- [x] **Stage 0: Setup.** Repository, `CLAUDE.md`, `PROGRESS.md`.
- [x] **Stage 1: Prototype.** Barnaby moves on one screen with touch buttons. Plays on a phone. Files: `index.html`, `style.css`, `game.js`.
- [x] **Stage 2: Scene 1 vertical slice.** Parallax background, fetch, Bark button, dialogue, title card. Files: `barnaby.js`, `meadow-art.js`, `dialogue.js`, `meadow.js`.
- [x] **Stage 3: Scenes 2 and 3.** Scenes, transitions, end screen, music, and sound are done, and pass a full headless playthrough. Files: `util.js`, `maya-adult.js`, `bench.js`, `hill.js`, `audio.js`.
- [x] **Stage 4: Polish.** Mute button, title screen, offline support, home-screen icon, and app details are done. A pause menu and saving are not built, since the game is short.

## Next step
A phone playtest. Turn on GitHub Pages so the game can be installed and works offline, then fix anything from the playtest.

## Known issues
- GitHub Pages is not turned on yet. Until it is, the game cannot be installed on a phone or work offline. Phone testing uses a private claude.ai link, which must be republished after each change.

## Decisions log
- Plain HTML, CSS, and JavaScript. No libraries or external files.
- Orientation: landscape, set in the app details. The game also works in portrait.
- Icons: the three PNG icons stay, since phones need them for the home screen. The game bible now says so.
- Long files: `game.js` (417 lines), `meadow.js` (355), and `hill.js` (315) stay as they are, by the owner's decision. They are not split.
- Offline: `sw.js` saves the game's files on the phone. It uses the internet when available, and the saved copy when not. The app icons are PNG copies of `icon.svg`.
- Phone testing: private claude.ai test link for now. GitHub Pages can be turned on later.
- The level is three screens wide, with a camera that follows Barnaby. Scene positions are fractions of screen width.
- Scene scripts (`meadow.js`) and drawing (`meadow-art.js`) are separate, so each new scene can be its own pair of files.
- Barnaby runs (faster, bouncier) while the ball is in play. Scenes control this with `wantsRun`.
- Maya is a girl: pink dress, pigtails with bows.
- Sound is made with the Web Audio API (`audio.js`), with no sound files. The title screen waits for a tap, which starts the sound (phones require this). The Mute button is in the top-right corner.
