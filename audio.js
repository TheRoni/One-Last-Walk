// Sound for One Last Walk: a music box melody, soft rain, barks, and chimes.
// All of it is made with the Web Audio API, so there are no sound files to load.
(function () {
  'use strict';

  // C major pentatonic notes, from C4 upward. The melodies pick notes from this list by position.
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

  // Each mood has a tempo, a volume, a rain level, and a melody.
  // The melody lists scale positions, with -1 for a rest. It repeats over and over.
  // Scene 1 is bright and quick, Scene 2 is soft with rain, and Scene 3 is slow and quiet.
  const MOODS = {
    meadow: {
      bpm: 104,
      volume: 0.22,
      rain: 0,
      melody: [0, 2, 4, 2, 5, 4, 2, -1, 4, 5, 7, 5, 4, 2, 1, -1]
    },
    bench: {
      bpm: 66,
      volume: 0.16,
      rain: 0.1,
      melody: [4, -1, 2, 1, 0, -1, 1, 2, 4, 2, 1, -1, 0, 1, 2, -1]
    },
    hill: {
      bpm: 56,
      volume: 0.14,
      rain: 0,
      melody: [2, -1, 0, -1, 4, -1, 2, -1, 1, -1, 0, -1, 2, -1, -1, -1]
    }
  };

  const MASTER_LEVEL = 0.9;

  let context = null;      // the browser's sound system, created on the first tap
  let master = null;       // master volume, used for mute and the fade at the end
  let musicBus = null;     // the music box notes go here
  let rainGain = null;     // the rain's volume
  let started = false;     // true once the melody has begun playing
  let muted = false;
  let moodName = 'meadow';
  let nextNoteTime = 0;
  let step = 0;

  // Creates the sound system and starts the music. Phones only allow sound after a tap,
  // so this is called from the tap and key handlers.
  function unlock() {
    try {
      if (!context) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return;
        context = new AudioCtor();
        buildGraph();
      }
      if (context.state === 'suspended') context.resume();
      if (!started) {
        started = true;
        nextNoteTime = context.currentTime + 0.1;
        scheduleNotes();
      }
    } catch (error) {
      // If sound is not available, the game still works without it
    }
  }

  // Sets up the volume control, the music box echo, and the rain
  function buildGraph() {
    master = context.createGain();
    master.gain.value = muted ? 0 : MASTER_LEVEL;
    master.connect(context.destination);

    // Music box echo: a short delay that repeats a few times and fades
    const echo = context.createDelay(1.0);
    echo.delayTime.value = 0.32;
    const echoFeedback = context.createGain();
    echoFeedback.gain.value = 0.3;
    echo.connect(echoFeedback);
    echoFeedback.connect(echo);
    echo.connect(master);

    musicBus = context.createGain();
    musicBus.connect(master);
    musicBus.connect(echo);

    // Rain: white noise, filtered so it sounds soft, looping forever
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const rainFilter = context.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1400;
    rainFilter.Q.value = 0.4;

    rainGain = context.createGain();
    rainGain.gain.value = MOODS[moodName].rain;

    noise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);
    noise.start();
  }

  // One music box note: a clear tone with a quieter high overtone, fading out over about a second
  function playNote(frequency, when, volume, destination) {
    const note = context.createGain();
    note.gain.setValueAtTime(0.0001, when);
    note.gain.exponentialRampToValueAtTime(volume, when + 0.01);
    note.gain.exponentialRampToValueAtTime(0.0001, when + 1.4);
    note.connect(destination);

    const tone = context.createOscillator();
    tone.type = 'sine';
    tone.frequency.value = frequency;
    tone.connect(note);
    tone.start(when);
    tone.stop(when + 1.5);

    const overtone = context.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.value = frequency * 4;
    const overtoneGain = context.createGain();
    overtoneGain.gain.value = 0.2;
    overtone.connect(overtoneGain);
    overtoneGain.connect(note);
    overtone.start(when);
    overtone.stop(when + 0.5);
  }

  // Schedules the melody a little ahead of time, so the rhythm stays steady
  function scheduleNotes() {
    const LOOK_AHEAD = 0.15; // seconds
    try {
      if (nextNoteTime < context.currentTime) {
        nextNoteTime = context.currentTime + 0.05;
      }
      const mood = MOODS[moodName];
      while (nextNoteTime < context.currentTime + LOOK_AHEAD) {
        const degree = mood.melody[step % mood.melody.length];
        if (degree >= 0) {
          playNote(SCALE[degree], nextNoteTime, mood.volume, musicBus);
        }
        nextNoteTime += 60 / mood.bpm / 2; // eighth notes
        step += 1;
      }
    } catch (error) {
      // Ignore sound errors so the game keeps running
    }
    setTimeout(scheduleNotes, 40);
  }

  // Changes the music to a scene's mood. The rain fades in or out, and the volume comes back if it was faded.
  function setMood(name) {
    if (!MOODS[name]) return;
    moodName = name;
    if (master) {
      master.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, context.currentTime, 0.3);
    }
    if (rainGain) {
      rainGain.gain.setTargetAtTime(MOODS[name].rain, context.currentTime, 0.8);
    }
  }

  function setMuted(value) {
    muted = value;
    if (master) {
      master.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, context.currentTime, 0.05);
    }
  }

  function isMuted() {
    return muted;
  }

  // Fades all sound out over a few seconds, for the end of the game
  function fadeOut(seconds) {
    if (master) {
      master.gain.setTargetAtTime(0, context.currentTime, seconds / 3);
    }
  }

  // One short yappy bark
  function barkTone(when) {
    try {
      const osc = context.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, when);
      osc.frequency.exponentialRampToValueAtTime(260, when + 0.12);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(0.5, when + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);

      osc.connect(gain);
      gain.connect(master);
      osc.start(when);
      osc.stop(when + 0.18);
    } catch (error) {
      // Ignore sound errors so the game keeps running
    }
  }

  // Barnaby barks twice
  function bark() {
    if (!started) return;
    barkTone(context.currentTime);
    barkTone(context.currentTime + 0.22);
  }

  // A soft bell for a memory marker: two notes, one after the other
  function chime() {
    if (!started) return;
    const now = context.currentTime;
    playNote(1046.5, now, 0.2, master);
    playNote(1318.5, now + 0.25, 0.16, master);
  }

  window.GameAudio = {
    unlock: unlock,
    setMood: setMood,
    setMuted: setMuted,
    isMuted: isMuted,
    fadeOut: fadeOut,
    bark: bark,
    chime: chime
  };
})();
