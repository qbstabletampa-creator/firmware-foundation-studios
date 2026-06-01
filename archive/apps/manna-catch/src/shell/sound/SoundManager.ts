export type SoundName = 'tap' | 'correct' | 'celebrate' | 'buttonPress' | 'wrong';

let enabled = true;

async function init(): Promise<void> {
  // expo-av will be added when real sound assets are ready
}

async function play(_name: SoundName): Promise<void> {
  if (!enabled) return;
}

function setEnabled(value: boolean): void {
  enabled = value;
}

async function cleanup(): Promise<void> {
  // No-op until expo-av is added
}

function registerAsset(_name: SoundName, _asset: number): void {
  // No-op until expo-av is added
}

export const SoundManager = { init, play, setEnabled, cleanup, registerAsset };
