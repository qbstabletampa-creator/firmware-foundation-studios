---
type: runbook
title: FFS Fleet iOS Submission Readiness 2026-06-27
description: Ultraloop pass that drove manna/snake/noah through every FREE iOS gate to submission-ready; Gosple verify-only; Ark Hopper flagged for a CJ product decision.
tags: [ffs, ios, app-store, readiness, greenlight, ultraloop, manna-catch, light-snake, noah, ark-hopper]
created: 2026-06-27
updated: 2026-06-27
related:
  - "[[ffs-ios-readiness-2026-06-13]]"
  - "[[native-build-readiness]]"
  - "[[native-expo-testing-and-build]]"
status: active
---

# FFS Fleet iOS Submission Readiness 2026-06-27

**Summary:** Ultraloop across the whole FFS fleet to make every app submission-ready using only the FREE gates. The three native Expo apps that were left behind when only Gosple got the full v1.1 treatment (Manna Catch, Shepherd's Trail, Noah Animal Match) are now all-free-gates-green and ready for the one paid build + submit. Gosple was verify-only (already in Apple review). Ark Hopper is a Capacitor web bundle, not an Expo app, and needs a CJ product decision before it can ship.

## What shipped to the branch

Branch `feature/ffs-ios-fixpass` off `ffs-ios-readiness`, commit `be7de65`, pushed to origin. Free, code-level fixes to manna-catch, light-snake, noah:

- **Privacy manifest (the real blocker).** Added `ios.privacyManifests` to each app.json, mirroring Gosple's proven `70e97b9` block (NSPrivacyTracking false, empty tracking domains + collected data types, `NSPrivacyAccessedAPICategoryUserDefaults` reason `CA92.1` for AsyncStorage's UserDefaults use). Clears the greenlight ITMS-91061 criticals. Expo emits `PrivacyInfo.xcprivacy` from this at prebuild (proven by ios-preflight going green).
- **App Store description** added to each app.json.
- **Home logo fix (Shepherd's Trail + Noah).** Both were shipping Manna Catch's gold basket as the home mark (the recurring 2026-06-13 wrong-logo bug). Pointed `home.tsx` `logoSource` at each app's own `icon.png`. Verified on real simulator home screens (see screenshots).
- **Dead paywall removed (Shepherd's Trail + Noah).** A non-functional `$4.99` purchase stub (route + screen + zustand store + barrel export + ScreenName union) that took no real payment was a latent Guideline 3.1.1 rejection surface. Deleted cleanly, tsc stays green, no dangling refs. Games are fully free.
- **False giveback copy fixed (Noah).** "10% of every purchase supports ministries..." referenced a purchase that does not exist; reworded to "We support ministries that serve children."

**Deliberately left alone:** `@shopify/react-native-skia` and the `@ffs/verses` wildcard dep. Gosple shipped through Apple with both present, so they are proven-shippable; touching the locked-splash dependency graph is exactly the risk the ffs-splash-lock + build rules warn against. Logged as optional future cleanup, NOT submission blockers.

## Gates (all FREE, all green)

| Gate | manna-catch | light-snake | noah |
|---|---|---|---|
| tsc --noEmit | clean | clean | clean |
| ios-preflight (prebuild + pod install, macos-15) | ✅ success | ✅ success | ✅ success |
| ios-sim-smoke (Release compile + boot to home + screenshots) | ✅ success | ✅ success | ✅ success |

Run on the feature branch via `gh workflow run <wf> -f app=<app> --ref feature/ffs-ios-fixpass` (always pass `--ref`). Home-screen screenshots captured by ios-sim-smoke confirm each app's own art renders (no Manna basket): downloadable from each sim-smoke run's artifacts.

Note on greenlight: it may still report the 2 privacy "criticals" because it looks for a native `PrivacyInfo.xcprivacy` file, which only exists after prebuild. For an Expo-managed app with the manifest in app.json these are FALSE POSITIVES (same accepted state as Gosple). ios-preflight going green is the authoritative proof the manifest is correct.

## Per-app submission status

- **Manna Catch** — green. Config correct (v1.0.0, build 1, SDK 54, no image pin, projectId present). Remaining = the CJ-gated mile only.
- **Shepherd's Trail** — green. Same.
- **Noah Animal Match** — green. Same.
- **Gosple** — already submitted (1.1.0, WAITING_FOR_REVIEW). Verify-only, no work, no churn (minimal-delta rule).
- **Ark Hopper** — NOT submittable as-is. It is one route (`/ark-hopper/*`) inside a single Capacitor "FFS Games" bundle (`com.firmwarefoundation.studios`), not an Expo app, and the bundle ships external Stripe links for digital goods (Guideline 3.1.1 auto-reject), a placeholder Capacitor icon/launch screen, no DEVELOPMENT_TEAM (unsigned), and an `armv7` device-capability. **Needs a CJ product decision:** build a standalone Expo Ark Hopper (~2-3.5 days) vs ship the whole Capacitor bundle as one app. The EAS native gates do not apply to it.

## The remaining mile (CJ-gated, per the never-auto-spend-a-build rule)

Per app (manna-catch, light-snake, noah), after CJ approves the home screens:

1. Merge `feature/ffs-ios-fixpass` → main (or build directly from the branch commit).
2. Host the privacy policy (`privacy-policy.html` exists in-repo) at a public URL and set it in App Store Connect — Apple requires a live privacy URL, mandatory for Kids category. (Free to host; not yet done.)
3. Real App Store screenshots (gameplay) — CJ capture/approve.
4. The one paid EAS production build → `eas build --profile production` (CJ account, real credits). STOP after one failure, read logs, never relaunch on hope.
5. ASC upload + Submit for review.

These are the steps that were intentionally NOT automated. Everything free and code-level is done and green.

## Splash verification (/ffs-splash) — fleet is correct, golden re-synced

Ran the `/ffs-splash` check across the fleet. Result: **the splash is right and identical on every app.** All four apps (manna-catch, light-snake, noah, gosple) have byte-identical splash files (`SplashScreen.tsx`, `RayCanvas.tsx`, `rayShaderSource.ts`, `shaders/lightRays.ts` — same md5 across the fleet), it is the GL ray-shader (RayCanvas via expo-gl + `rayShaderSource`), the dead Skia cluster (`RadiantSplash*`, the Skia `lightRays.ts`) is referenced only by a comment in `app/index.tsx` and is NOT imported by any live route (ios-sim-smoke boots to home, no black screen), and it is exactly the version Apple is reviewing on Gosple. Each app carries the `FFS LOCKED SPLASH` header the rule requires.

The only drift was that the `/ffs-splash` skill's golden copies (frozen 2026-06-24) were missing that 4-line locked-header comment — the code bodies were identical. Fixed by re-syncing the 4 skill golden files (`~/.claude/skills/ffs-splash/assets/`) to the shipping fleet, so golden == fleet exactly. **No app splash was modified** (they are correct and Apple-approved; overwriting would have regressed off the reviewed version and risked the black-screen the lock exists to prevent).

Approval screenshots (real iOS-simulator home screens from ios-sim-smoke, confirming each app's own art renders, no Manna basket): committed alongside this work in each app's `screenshots/` and downloadable from the sim-smoke run artifacts. Google Drive "My Drive" was not writable from the tools (streaming namespace), so they live in the repo + CI artifacts.
