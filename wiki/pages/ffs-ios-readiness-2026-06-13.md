# FFS iOS Readiness Audit + Fixes (2026-06-13)

**Summary:** Full read-only audit of all five FFS games against iOS-submission readiness, then a fix pass on the four native apps. Goal (CJ): every app error-free, tested, and store-ready so the only remaining step is "say build it." No EAS builds or OTA publishes were spent this session. All work is on branch `ffs-ios-readiness` (pushed, not merged), commit `aa82ea3`.
**Last Updated:** 2026-06-13
**Sources:** 2026-06-13 closeout session (Claude/Fable). Two workflows: read-only audit (5 agents) + fix pass (4 apps + adversarial Noah verify). EAS build:list / channel:list queried live.
**Related:** [[ffs-native-apps-state-2026-06-09]], [[native-expo-testing-and-build]], [[app-shell-standard-splash-onboarding]], [[gosple-build-log]]

---

## The Gosple OTA truth (the question that started this)

CJ asked if Gosple's content fixes could go out over the air without a build. Answer: **no, not to the current live build.**

- Live App Store build = EAS `546cdf31`, **SDK 56**, build #3, commit `a491a79`, finished 5/28, store distribution, **no update channel attached**. It physically cannot pull OTA updates.
- `expo-updates` / `updates.url` and the `preview` channel were added 6/10, AFTER this build shipped. The repo is now SDK 54 (runtime `exposdk:54.0.0`); the live build is SDK 56. Mismatched runtimes even if it had a channel.
- Net: the Gosple fixes need a **new build + App Store review**, not an OTA patch. Going forward, the channel bindings added this session mean the NEXT build CAN be patched OTA.

The two SDK-54 builds that errored (`a533cf23` 6/10, `8728abe3` 6/8) both died at **pod install** because of the old `macos-sonoma-14.5-xcode-15.4` image pin (RN 0.81 / SDK 54 needs Xcode >= 16.1). That pin is already removed; the SDK-54 line is clear to build.

## Audit verdict (all five)

| App | Native app | tsc | Onboarding | How-to-play | Stat page | Notes |
|---|---|---|---|---|---|---|
| Manna Catch | yes | clean | elite | yes | centered, no overlap | already has a finished preview build (`3aac33e1`) |
| Shepherd's Trail (light-snake) | yes | clean | elite | yes | centered | 2 cosmetic fixes |
| Gosple | yes | clean | elite | yes | centered | config only; content fixes already in repo |
| Noah / Animal Match | yes | clean | elite | yes | centered | 2 real gameplay gaps |
| Arc Hopper (arkHopper) | **no** | n/a | n/a | n/a | n/a | web-only, never nativized |
| Bible Brick Breaker | **no** | n/a | n/a | n/a | n/a | web-only, same as Arc Hopper |

**Where Arc Hopper "went":** it was never lost. The original FFS was one web app ("FFS Games", React + Vite + Phaser) bundling every game, deployed at `firmwarefoundation.com/play/` and Capacitor-wrapped (`com.firmwarefoundation.studios`, repo `ios/` + `dist/`). CJ tested Arc Hopper there. The pivot to standalone per-game Expo apps split out Manna/Gosple/Noah/Shepherd's, but Arc Hopper and Bible Brick Breaker stayed in the old bundle.

## Fixes shipped (commit aa82ea3)

- **Gosple:** `eas.json` preview + production channel bindings; `GOSPLE_EPOCH` set to `2026-06-13` (Day 1 = relaunch, per CJ); deleted unused legacy `MenuScreen.tsx`. The four content fixes (mixed word-length daily shuffle, epoch logic, onboarding, how-to-play) were already present in the SDK-54 repo.
- **Manna Catch:** `badgeDesc` capped at `numberOfLines={2}`; channel bindings. Otherwise already build-ready.
- **Shepherd's Trail:** centered the `BadgeCelebration` glowRing (was anchored to the card's left edge); primary gold token `#FFD700` -> Vegas Gold `#D4C36A` (matches shell standard + onboarding); channel bindings.
- **Noah / Animal Match (the substantive one):**
  - Replaced the unlosable moves-budget with a **3-strikes-per-level** system. `STRIKES_PER_LEVEL = 3` in `itemConfig.ts`; `strikes` field on `GameState`; increment on each mismatch; level fails at 3; strikes reset every level (and on retry). `getMovesBudget()` returns Infinity so moves still score but never limit. HUD shows 3 hearts where the moves pill was. Fail -> retry same level (board reshuffled), cumulative score preserved.
  - **Verse after every level, including the final one.** Level 5 previously jumped straight to game-over; now `showFinalVerse()` shows the verse first, then routes to the game-complete card. Sessions request 10 verses for 5 levels so the final level always has one.
  - How-to-play copy updated to the strikes framing.
  - Engine tests rewritten, 19/19 pass. A second agent adversarially re-verified all five claims against the code and re-ran the gates: confirmed real, no bugs, player genuinely cannot play forever anymore.

Every native app gated green: `tsc --noEmit` clean + `expo export --platform ios` clean (Noah also `vitest` 19/19).

## What's left before "say build it"

1. **Free pre-flight (not run yet):** `gh workflow run ios-preflight -f app=<gosple|manna-catch|light-snake|noah>` then `gh run watch`. Proves pod install on current Xcode before any paid build.
2. **Publish to Expo Go for CJ phone test:** `cd archive/apps/<app> && eas update --branch preview -m "<msg>"`, then curl the channel to confirm it serves. Audit local `.env` for `EXPO_PUBLIC_*` overrides first (eas update bakes them in).
3. **Merge** `ffs-ios-readiness` after CJ approves in Expo Go (FFS uses main directly).
4. **Build lane (CJ-gated):** one production EAS build per app (SDK 54, no image pins, autoIncrement handles build number; Gosple -> build #4), then ASC submit + metadata.
5. **Arc Hopper decision (pending CJ):** Option 1 = standalone Expo app (recommended; engine/sprites/levels/verses all exist in `src/games/arkHopper`, pure-logic files port verbatim, only the Phaser `ArkHopperScene.ts` render+input needs a React Native `game.tsx` rewrite like Manna; ~2-3.5 days). Option 2 = ship the existing Capacitor "FFS Games" bundle as one app. Bible Brick Breaker is the same situation, higher render risk (continuous ball/paddle physics).
