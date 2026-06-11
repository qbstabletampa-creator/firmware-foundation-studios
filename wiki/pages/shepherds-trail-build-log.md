# Shepherd's Trail (light-snake) Build Log

**Summary:** Per-app build/polish history for Shepherd's Trail (dir `archive/apps/light-snake`, Expo SDK 54, expo-router). Snake-style game: shepherd Eli + flock on a 15x20 grid, d-pad + swipe. Distinct from the other FFS apps only in game logic, palette, and strings; everything else comes from the shared shell.
**Last Updated:** 2026-06-11
**Sources:** Engine polish round 2026-06-11 (CJ feedback); the live code in `archive/apps/light-snake`.
**Related:** [[app-shell-standard-splash-onboarding]], [[native-expo-testing-and-build]], [[gosple-build-log]], [[ffs-native-apps-state-2026-06-09]]

---

## 2026-06-11 -- Polish round (Engine): splash, how-to-play, countdown fix, background, stats

Five-item polish pass against the app-shell standard. All headless gates green (tsc 0, vitest 9/9, expo export web clean), visually verified in a browser (splash boots, twilight background, how-to-play modal).

1. **Splash adopted the house GL lightRays splash.** Copied `SplashScreen.tsx`, `RayCanvas.tsx`, `rayShaderSource.ts` BYTE-IDENTICAL from manna-catch (sha256 verified). Replaced the old AnimatedLogo-only splash. `manna's SplashScreen imports ONLY RayCanvas` (no AnimatedLogo), so that's all that was copied. Added `expo-gl@~16.0.10` (SDK 54). `app/index.tsx` + `app/splash.tsx` were already byte-identical to manna's and already reference only the GL splash (Trap-7 clean: no Skia at module top level). The leftover `RadiantSplash*` + `AnimatedLogo` files remain present but fully unreferenced.

2. **How-to-play modal (Gosple pattern).** `modalOverlay > modalCard > title/body/example rows/dismiss`, themed for Shepherd's Trail (icons 🐑 / 🌵 / 📖). Auto-shows on the mode-select screen on first run, gated by a NEW persisted flag `hasSeenHowToPlay` in the game store (`useLightSnakeGameStore`, not the generic profile store). Dismiss sets the flag. Always-visible underlined "How to play" link on mode-select re-opens it.

3. **Countdown stray-tap guard (verified bug fixed).** Before: a swipe/tap during the 3-2-1 pre-armed `nextDirection`, so the flock lurched off at GO with zero intended input and could die at 0 points. Fix: a single `inputEnabled` ref (false on every start/replay, flipped true ONLY when the countdown effect transitions the engine to `phase==='playing'`). Gates both `queueDirection` and the PanResponder (`onStartShouldSetPanResponder: () => inputEnabled.current` so a stray swipe is never even claimed). Don't rely on `stateRef.phase` timing alone for this — the ref is the single source of truth.

4. **Background reworked to TWILIGHT GREEN PASTURES.** `LIGHT_SNAKE_PALETTE` retuned: dusk-indigo sky -> teal-green horizon glow, dark-green hill silhouette, green-gold firefly motes. Added a third rolling-hill silhouette layer (`hillFar`) with rounder crowns so it reads as pasture, not desert dunes. Kept the `GamePalette` shape + both exports (`GameBackground` default `MANNA_PALETTE`, `LIGHT_SNAKE_PALETTE`) that `game.tsx` imports. Pure RN, no new native deps beyond expo-gl. Unmistakably distinct from Manna's golden-hour desert; board/sprites stay readable.

5. **Stats + badges aligned to manna's canonical format.** Replaced the cramped 4-box row with manna's 2-per-row layout (6 stat boxes), and matched every canonical style: `statBox` `minWidth:0` + `paddingHorizontal` + `justifyContent:center`, centered `statValue`/`statLabel`, badge `paddingHorizontal:4`, `badgeName` `numberOfLines={2}`+`adjustsFontSizeToFit`+`minimumFontScale={0.7}`+`lineHeight`+center, `badgeDesc` `lineHeight`. No overlap/truncation at 390px.

### Gotchas worth keeping
- **Hoisted monorepo, not a workspace.** `archive/apps/light-snake/node_modules` is empty (0 entries); deps resolve from `archive/node_modules`. `npx expo install expo-gl` updated package.json but said "up to date" and did NOT populate a local node_modules — that's correct, it hoisted to `archive/node_modules/expo-gl` (16.0.10). Verify a dep with `node -e "require.resolve('<pkg>/package.json')"` from the app dir, not by `ls node_modules`.
- **Serving the web export via a plain static server fails** with `Cannot use 'import.meta' outside a module`: Expo's exported `dist/index.html` loads the bundle as `<script defer>` (classic), but the SDK 54 bundle is ESM. Two ways to view `dist` statically: (a) patch the script tag to `type="module"`, then hit `/` (expo-router routes on URL path, so `/index-mod.html` shows "Unmatched Route" — use `/`); or (b) just use `expo start --web`. `expo export --platform web` exit 0 is the authoritative web gate; the static-serve quirk is not a code defect.
- **`expo start --web` first compile is slow** in this env and a stale metro cache throws a harmless `Unable to deserialize cloned data` warning; the dev server can also drop if its launcher process exits. For a quick visual, the patched-`dist` static-serve path is faster than waiting on metro's cold bundle.
- `dist/` is gitignored; on Windows the python static server holds a file lock briefly after stop, so `rm -rf dist` may report "Device or resource busy" — harmless, it's untracked.
