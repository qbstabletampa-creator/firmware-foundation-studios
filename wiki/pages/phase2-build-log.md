# Phase 2 Build Log: Shared Infrastructure

**Date:** 2026-06-03
**Status:** Complete, compiles clean (tsc --noEmit passes)
**Related:** [[elite-audit-june-2026]], [[elite-upgrade-plan]]

---

## What Was Built

### 2.5 Ark Hopper Purchase Bug Fix (CRITICAL)
- **File:** src/screens/ArkHopperGameScreen.tsx
- Fixed 4 references: `canPlayMannaCatchFree` -> `canPlayArkHopperFree`, `recordMannaCatchFree` -> `recordArkHopperFree`, `purchaseGame('mannaCatch')` -> `purchaseGame('arkHopper')`, dependency array ref
- Ark Hopper now correctly uses its own purchase store entries

### 2.1 Shared Splash Screen Component
**New files:**
- `src/utils/rayShader.ts` - WebGL VERT/FRAG shader strings + useRayCanvas hook (single source, was duplicated 4x)
- `src/components/GameSplashScreen.tsx` - Reusable component: accepts logoSrc, logoAlt, verseText, homePath, onboardingPath
- `src/components/GameSplashScreen.module.css` - Shared styles (replaces 4 identical CSS files)

**Converted to thin wrappers (~13 lines each):**
- src/screens/SplashScreen.tsx (Gosple, logo: /logo.png)
- src/screens/MannaCatchSplashScreen.tsx (logo: /manna-catch-icon.png)
- src/screens/NoahAnimalMatchSplashScreen.tsx (logo: /noah-animal-match-icon.png, was emoji)
- src/screens/ArkHopperSplashScreen.tsx (logo: /ark-hopper-icon.png, was emoji + extra title)

**Deleted:** 4 per-game splash CSS modules (100% identical, now replaced)

### 2.2 Shared Sound Engine
**New files:**
- `src/utils/soundEngine.ts` - SharedSFX library with 19 SFX functions + vibrate(). Reads mute/volume from preferencesStore. Single AudioContext.

**Per-game sound configs (new):**
- `src/games/gosple/sounds.ts` - GospleSFX: keyTap, correctLetter, wrongLetter, puzzleSolve, rowSubmit
- `src/games/noahAnimalMatch/sounds.ts` - NoahSFX: flip, match, mismatch, combo, levelComplete, gameComplete
- `src/games/arkHopper/sounds.ts` - ArkHopperSFX: hop, starCollect, deathObstacle, deathWater, levelComplete, gameOver, momentum

**Refactored:**
- `src/games/mannaCatch/sounds.ts` - Now imports from shared engine instead of own AudioContext. Same SFX export name preserved.

**Updated:**
- `src/stores/preferencesStore.ts` - Added `volume: number` field + `setVolume()` method

### 2.3 Macadam-Pattern Onboarding Template
**New files:**
- `src/components/GameOnboarding.tsx` - 7-step onboarding flow: emotional opener, visual guide, clear promise, profile selection, instant reward, streak preview, play button. Sound effects on transitions.
- `src/components/GameOnboarding.module.css` - Dark theme, gold accents, Framer Motion animations

**Converted to thin wrappers (~20 lines each):**
- src/screens/OnboardingScreen.tsx (Gosple)
- src/screens/MannaCatchOnboardingScreen.tsx
- src/screens/NoahAnimalMatchOnboardingScreen.tsx
- src/screens/ArkHopperOnboardingScreen.tsx

**Deleted:** 4 per-game onboarding CSS modules (100% identical, now replaced)

---

## Lines Changed

| Category | Before | After | Lines Saved |
|----------|--------|-------|-------------|
| Splash TSX (4 files) | ~580 | ~52 + 70 shared | ~458 |
| Splash CSS (4 files) | ~240 | 0 + 34 shared | ~206 |
| WebGL shader (4 copies) | ~336 | 0 + 84 shared | ~252 |
| Onboarding TSX (4 files) | ~412 | ~80 + 210 shared | ~122 |
| Onboarding CSS (4 files) | ~588 | 0 + 190 shared | ~398 |
| **Total** | **~2,156** | **~720** | **~1,436** |

---

## What's Next (Phase 3)

Phase 3 wires the sound engine into the actual game scenes and adds visual polish:
1. Wire GospleSFX into GameScene.ts
2. Wire NoahSFX into NoahAnimalMatchScene.ts
3. Wire ArkHopperSFX into ArkHopperScene.ts
4. Replace Ark Hopper flat-color lanes with sprite tiles
5. Add wooden table texture to Noah Animal Match
6. Juice pass: score tweens, button springs, idle animations, new high score celebration
