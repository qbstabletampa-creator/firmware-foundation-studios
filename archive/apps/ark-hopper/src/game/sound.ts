// ---------------------------------------------------------------------------
// Ark Hopper -- sound + haptics facade
//
// The web build used a Web Audio soundEngine; that does NOT port to native.
// Instead this is a thin mapping of Ark Hopper gameplay events onto the shared
// FFS native managers (SoundManager = expo-audio SFX, HapticsManager =
// expo-haptics). Both managers are no-op-safe: a missing asset or a platform
// without audio never throws.
//
// SoundManager ships a fixed SFX set shared across the fleet
// (catch / thorn / levelup / verse / gameover / tap). Ark Hopper has no
// dedicated hop/splash SFX yet, so each event is wired to the closest existing
// cue. TODO: when Ark-Hopper-specific SFX assets land (hop.m4a, splash.m4a,
// star.m4a), add them to SoundManager.SOUND_DEFS and repoint the mappings here.
// ---------------------------------------------------------------------------

import { SoundManager } from '../shell/sound/SoundManager';
import { HapticsManager } from '../shell/sound/HapticsManager';

export type ArkSoundEvent =
  | 'hop'
  | 'collectGood' // star / olive branch pickup
  | 'splash'      // drowned in water
  | 'lifeLost'    // hit an obstacle
  | 'levelComplete'
  | 'gameOver'
  | 'combo'       // momentum tier reached
  | 'buttonTap';

/** Initialize the shared audio layer. Safe to call more than once. */
export async function initSound(): Promise<void> {
  await SoundManager.init();
}

/** Enable/disable SFX (mirrors the settings toggle). */
export function setSoundEnabled(enabled: boolean): void {
  SoundManager.setEnabled(enabled);
}

/** Enable/disable haptics (mirrors the settings toggle). */
export function setHapticsEnabled(enabled: boolean): void {
  HapticsManager.setEnabled(enabled);
}

/** Tear down audio players. */
export async function cleanupSound(): Promise<void> {
  await SoundManager.cleanup();
}

/**
 * Play the SFX + haptic for an Ark Hopper gameplay event. Each event picks the
 * closest available shared cue. TODO: swap to dedicated Ark Hopper SFX once
 * recorded (see header).
 */
export function playArkSound(event: ArkSoundEvent): void {
  switch (event) {
    case 'hop':
      // TODO: dedicated 'hop' SFX. For now a soft tap + light haptic.
      SoundManager.play('tap');
      HapticsManager.light();
      break;
    case 'collectGood':
      // TODO: dedicated 'star' SFX. 'catch' is the existing pickup chime.
      SoundManager.play('catch');
      HapticsManager.success();
      break;
    case 'splash':
      // TODO: dedicated 'splash' SFX. 'thorn' is the existing failure cue.
      SoundManager.play('thorn');
      HapticsManager.medium();
      break;
    case 'lifeLost':
      SoundManager.play('thorn');
      HapticsManager.medium();
      break;
    case 'levelComplete':
      SoundManager.play('levelup');
      HapticsManager.success();
      break;
    case 'gameOver':
      SoundManager.play('gameover');
      HapticsManager.medium();
      break;
    case 'combo':
      // TODO: dedicated 'combo' SFX. 'verse' reads as a positive flourish.
      SoundManager.play('verse');
      HapticsManager.light();
      break;
    case 'buttonTap':
      SoundManager.play('tap');
      HapticsManager.light();
      break;
  }
}
