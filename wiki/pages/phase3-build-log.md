# Phase 3 Build Log: Game Upgrades

**Date:** 2026-06-03
**Status:** Sound + juice complete. Visual polish blocked on art assets.
**Related:** [[phase2-build-log]], [[elite-audit-june-2026]]

---

## 3.1 Splash Screen Standardization
Completed in Phase 2. All 4 games use PNG logos via GameSplashScreen component.

## 3.2 Sound Integration (COMPLETE)

All 4 games now have working sound. Every game interaction produces audio.

**Ark Hopper** (ArkHopperScene.ts):
- hop, starCollect, deathObstacle (+ vibrate), deathWater (+ vibrate)
- levelComplete, gameOver, momentum chain
- Countdown: tick on 3/2/1, go on GO!
- Button taps on all overlay buttons
- unlockAudio() on create

**Noah Animal Match** (NoahAnimalMatchScene.ts):
- cardFlip, matchFound, mismatch, combo
- levelComplete, gameComplete, perfectClear
- Countdown sounds
- Button taps on all overlay buttons
- unlockAudio() on create

**Gosple** (GameScene.ts):
- keyTap on letter press and delete
- correctLetter with column-based combo pitch
- wrongLetter on absent/present tiles
- puzzleSolve fanfare on win
- rowSubmit on enter
- wrongLetter on incomplete row shake
- unlockAudio() on create

**Manna Catch** (MannaCatchScene.ts):
- catchGood with combo count, catchBad
- combo arpeggio, powerUp sparkle, powerUpEnd
- milestone fanfare, gameOver descending
- Countdown sounds
- Button taps on all overlay buttons
- unlockAudio() on create (was dead code, now wired)

**Note:** Manna Catch had sounds.ts since initial build but it was NEVER IMPORTED. 10 SFX were entirely dead code. Now properly wired through the shared engine.

## 3.3 Onboarding Upgrade
Completed in Phase 2. All 4 games use 7-step Macadam-pattern GameOnboarding.

## 3.4 Visual World Polish (BLOCKED)

These items need generated art assets:
- Ark Hopper: sprite-based lane tiles (grass, water, path) to replace flat colors
- Noah Animal Match: warm wooden table texture behind card grid
- Manna Catch: desert background tile beneath procedural sky
- Gosple: subtle background pattern

**Blocked on:** AIML API key for Reve image generation (Phase 0.3). Can also use ChatGPT/Gemini for these tiles. The code changes (loading and rendering tile sprites) are straightforward once assets exist.

## 3.5 Juice Pass (PARTIAL)

**Done:**
- Score counter animation: all 3 Phaser games pop the score text (scale 1.2x with Back.easeOut) when score changes
- Button springs: all 4 home screens have whileTap={{ scale: 0.97 }} on play buttons
- GameOnboarding play button has whileTap={{ scale: 0.95 }} with continuous pulse animation

**Remaining (nice-to-have, not blocking):**
- Home screen idle animation: subtle float/bob on game icon sprites
- New high score celebration: "NEW BEST!" banner with confetti
- These can be added incrementally and don't block Phase 4

---

## Files Modified in Phase 3

| File | Change |
|------|--------|
| src/games/arkHopper/ArkHopperScene.ts | +import sounds, +unlockAudio, +SFX calls on all events, +score tween |
| src/games/noahAnimalMatch/NoahAnimalMatchScene.ts | +import sounds, +unlockAudio, +SFX calls on all events, +score tween |
| src/games/gosple/GameScene.ts | +import sounds, +unlockAudio, +SFX calls on key/submit/solve |
| src/games/mannaCatch/MannaCatchScene.ts | +import sounds (was dead code), +unlockAudio, +SFX calls on all events, +score tween |
| src/screens/*HomeScreen.tsx (4 files) | +whileTap on play buttons |
