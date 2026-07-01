---
type: runbook
title: Ark Hopper Native Build (web to Expo port)
description: Nativized the web-only Ark Hopper into its own Expo SDK54 app — engine ported, Phaser scene rewritten to RN, real AIML art, boots clean, published to Expo Go.
tags: [ffs, ark-hopper, native, expo, port, phaser, eas-update, aiml]
created: 2026-06-27
updated: 2026-06-27
related:
  - "[[ffs-ios-readiness-2026-06-13]]"
  - "[[native-build-readiness]]"
  - "[[native-expo-testing-and-build]]"
project_id: ffs-app-factory-finish-native-apps
status: active
---

# Ark Hopper Native Build (web to Expo port)

**Summary:** Ark Hopper existed only as a web/Phaser game inside the arcade and was never nativized (CJ remembered it "in Expo Go" — it never was; verified across git/disk/all 7 EAS projects/wiki). This build ported it into its own Expo SDK54 app on the FFS shell: pure engine ported byte-identical, the 2098-line Phaser scene rewritten into a React Native render, real art generated via /aiml, all free gates green, published to Expo Go. Gameplay feel still needs a real CJ play-test; elite-polish + paid build/submit remain.

## Where it lives
- **Worktree:** `C:/Users/rodge/projects/ffs-arkhopper`, branch `feature/ark-hopper-native` (HEAD `019d7b5`), pushed to origin. App dir `archive/apps/ark-hopper`.
- **EAS project:** `@firmfoundationstudios/ark-hopper`, projectId `10d6557f-c3c5-4448-8a95-aff0c1ca61f0`, bundleId `com.firmwarefoundation.arkhopper`, SDK 54.
- **Expo Go:** preview channel, update group `c11943c1-9ad0-4f1f-a672-c7b8ef87e8e2`, runtime `exposdk:54.0.0`. Open via Expo Go (firmfoundationstudios) → Projects → Ark Hopper, or the EAS dashboard update URL.

## Architecture / port plan (scouted, verified)
The fleet renders gameplay with PLAIN React Native (Views + sprites over a RAF tick loop), NOT Skia/GL. Ark Hopper is a Frogger/Crossy-style lane hopper with real PNG sprites.
- **Ported verbatim (pure, Phaser-free):** `gameEngine.ts` (createInitialState/hop/tick, pure `{state,events}`), `collisionEngine.ts`, `itemConfig.ts`, `prng.ts`, `types.ts`, `verses.ts`, `badges.ts` → `src/game/`.
- **Discarded (Phaser):** `ArkHopperScene.ts`, `config.ts`.
- **Rewritten:** `app/game.tsx` = full playable RN render (frame-independent RAF `tick`, `PanResponder` swipe→`hop`, lane terrain, moving sprites, ride logic, death/respawn, level flow, phase overlays, HUD, NEW BEST read-before-write, sound/haptics). `src/game/spriteMap.ts` rebased web paths → `require()`. `src/game/stores/arkHopperStore.ts` = own zustand+persist (`ffs-ark-hopper`, AsyncStorage), never shares Manna/Noah state. `src/game/sound.ts` = facade to shell SoundManager/HapticsManager.

## Assets (via /aiml, FLUX-pro, each reviewed)
Locked FFS storybook family (warm brown outline, gold halo, rosy cheeks). Hero = a lamb ("Woolly").
- `assets/icon.png` — lamb mid-hop across lily-pads to Noah's Ark + rainbow (opaque 1024 RGB, iOS-safe).
- `assets/logo.png` — transparent lamb + halo home mark.
- `assets/woolly-wave.png` + `assets/woolly-celebrate.png` — mascot poses (rembg transparent, halo preserved), wired into the 3-beat onboarding (OnboardingScreen MASCOT_NAME='Woolly'). Removed Noah's ari-* placeholders.
- Splash keeps `ffs-logo.png` (company) per the splash lock — correct, untouched.
- Gotcha: FLUX put a human child in icon v1 (regenerated lamb-only); the outline-ring halo kept a gray fill on rembg (fixed with a desaturated-gray alpha pass). Raw art in the session scratchpad `arkhopper-art/`.

## The launch crash (root-caused + fixed)
First `ios-sim-smoke` crashed ~t+20s: `Cannot find native module 'ExpoAsset'` → expo-updates ErrorRecovery → SIGABRT. Static analysis (agent + PM) was clean because it is a native/Release-only trap the compile gates can't see. Captured the real JS error via `ios-sim-debug` (os_log). Cause = the documented [[feedback_expo_transitive_wildcard_native_module]] trap: `expo-audio@1.1.1` (correct SDK54) declares `expo-asset` at an SDK56 version; the standalone install kept the nested `expo-asset@56.0.17` beside expo@54's `12.0.13` → native ExpoAsset pod mismatch. **Fix:** `overrides.expo-asset ~12.0.13` in package.json + nuke node_modules/lock + clean reinstall → single deduped 12.0.13. Also added the missing `eas.json` preview/production channels.

## Gates (all free, all green)
tsc clean · `ios-preflight` GREEN (native scaffold compiles) · `ios-sim-smoke` GREEN (boots clean, branded onboarding renders with the mascot) · `/ffs-splash` matches golden exactly (GL, company logo + Romans 8:28, no Skia in any route) · `/greenlight` clean (its 2 privacy CRITICALs are the known managed-Expo false positives — the manifest IS declared in `app.json ios.privacyManifests`; ASC privacy-policy URL is the only real remaining metadata item, CJ-gated).

## Remaining
- **CJ play-test in Expo Go** — sim-smoke verified boot + onboarding only, NOT the actual hop loop. Confirm gameplay feel.
- **Elite-polish pass** (informed by the play-test): full SFX assets (sound.ts currently maps to nearest shared cues with TODOs), sprite-tile lane polish, difficulty tuning to L20+, How-to-Play modal, juice verification against the elite checklist.
- **Icon/splash art**: `splash-icon.png` + `favicon.png` are still Noah's company-logo art (splash is correct per lock; favicon is web-only).
- **Paid build + ASC submit** — CJ-gated, last mile.
