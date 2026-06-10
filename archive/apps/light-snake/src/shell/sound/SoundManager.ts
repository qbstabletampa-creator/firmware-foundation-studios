import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// ---------------------------------------------------------------------------
// SoundManager — small, dependency-light SFX layer for the FFS app shell.
//
// One AudioPlayer is created per sound at init() and reused for every play.
// play() rewinds to the start (seekTo 0) then plays, so rapid repeats (gather
// combos, button mashing) restart cleanly instead of being dropped.
//
// Everything is wrapped in try/catch and guarded so a missing/corrupt asset,
// or a platform without audio (web in Expo Go), never crashes the game.
// ---------------------------------------------------------------------------

export type SoundName =
  | 'catch'
  | 'thorn'
  | 'levelup'
  | 'verse'
  | 'gameover'
  | 'tap';

// Per-sound asset + volume. Volume is modest across the board (kids' app):
// the tap is quietest so menu navigation never feels loud, the chimes sit a
// touch higher so they read as rewards.
const SOUND_DEFS: Record<SoundName, { asset: number; volume: number }> = {
  catch: { asset: require('../../../assets/sfx/catch.m4a'), volume: 0.35 },
  thorn: { asset: require('../../../assets/sfx/thorn.m4a'), volume: 0.4 },
  levelup: { asset: require('../../../assets/sfx/levelup.m4a'), volume: 0.5 },
  verse: { asset: require('../../../assets/sfx/verse.m4a'), volume: 0.45 },
  gameover: { asset: require('../../../assets/sfx/gameover.m4a'), volume: 0.45 },
  tap: { asset: require('../../../assets/sfx/tap.m4a'), volume: 0.25 },
};

let enabled = true;
let initialized = false;
const players: Partial<Record<SoundName, AudioPlayer>> = {};

async function init(): Promise<void> {
  if (initialized) return;
  initialized = true;

  // Play SFX even when the ringer is on silent, and mix with (don't duck or
  // stop) any background audio the user has going. Best-effort — never throw.
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  } catch {
    // Audio mode is a nice-to-have; sounds still work without it.
  }

  for (const name of Object.keys(SOUND_DEFS) as SoundName[]) {
    try {
      const def = SOUND_DEFS[name];
      const player = createAudioPlayer(def.asset);
      player.volume = def.volume;
      players[name] = player;
    } catch {
      // Skip this one sound; the rest of the app keeps working.
    }
  }
}

function play(name: SoundName): void {
  if (!enabled) return;
  const player = players[name];
  if (!player) return;
  try {
    // Rewind so repeated triggers (combos, fast taps) always restart.
    player.seekTo(0);
    player.play();
  } catch {
    // A single failed play must never bubble up into the game loop.
  }
}

function setEnabled(value: boolean): void {
  enabled = value;
}

async function cleanup(): Promise<void> {
  for (const name of Object.keys(players) as SoundName[]) {
    try {
      players[name]?.remove();
    } catch {
      // ignore — we're tearing down anyway
    }
    delete players[name];
  }
  initialized = false;
}

export const SoundManager = { init, play, setEnabled, cleanup };
