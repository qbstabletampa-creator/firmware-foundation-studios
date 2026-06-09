# FFS App Shell Standard: Splash + Onboarding (CANONICAL)

**Status:** LOCKED standard. Every Firmware Foundation Studios game ships with this EXACT splash and this onboarding system. Do not redesign per game. New games copy the shell and only swap the game logic + per-game palette.
**Last Updated:** 2026-06-08
**Source of truth (deployed iOS Gosple):** `archive/apps/gosple/src/shell/` — RadiantSplash.tsx, RadiantSplashScreen.tsx, shaders/lightRays.ts. Reference implementation lives in `archive/apps/manna-catch/src/shell/`.
**Related:** [[app-factory-strategy]], [[macadam-onboarding-gamification-capture]], [[onboarding-elite-research]], [[native-build-readiness]]

---

## 1. SPLASH SCREEN (identical for every game)

The splash is a COMPANY splash, not a game splash: FFS logo + "Romans 8:28" on a radiant gold sunburst. Same on Gosple, Manna Catch, Noah, Light Snake, Ark Hopper, Bible Brick Breaker, and every future app.

### Visual spec
- **Background:** `#10100E` (near-black).
- **Rays:** full-screen radiant gold sunburst from a light-rays shader.
  - `uRayCount = 14` -> `sin(angle*14)` = 28 sharp rays. (Do NOT use the web `angle*7` = 14 rays; that is the web build, not the deployed iOS look.)
  - `uCenter = (0.5, 0.42)` (42% from top).
  - `uColor = #D4C36A` = `vec3(0.831, 0.765, 0.416)` (Vegas Gold).
  - Secondary rays at half frequency, `*0.3`. Bloom `exp(-dist^2*18) * glowRadius * 1.5`. Glow `smoothstep(glowRadius,0,dist)^1.8`.
  - Animated: `rayIntensity` 0->1 over 400-1200ms; `glowRadius` 0->0.5 over 100-500ms then gentle pulse 0.45-0.55; slow rotation via `uTime`.
- **Logo:** the FFS company logo (`ffs-logo.png`), 160x160, centered at 0.42. Fades in 200-700ms (opacity 0->1), scale `0.85 -> 1` (by 700ms) `-> 1.15` (slow grow to 2500ms). The logo image is the FFS shield/cross/circuit logo on its own dark square.
- **Verse text:** `Romans 8:28` — color `#FFFFFF` (white), `fontStyle: italic`, fontSize 16, fontWeight 600, letterSpacing 2, **mixed case (NOT uppercase)**, `textAlign center`, positioned `bottom: 30%`. Fades in + slides up (translateY 10->0) at 800ms.
- **Timing:** rays @300ms, logo @200ms, verse @800ms, whole splash fades out @ (duration-300), complete/navigate @ duration (2500ms).

### Implementation (two render paths, identical look)
- **Production / EAS build (Skia):** `RadiantSplash.tsx` (Skia `Canvas` absoluteFill + `getLightRaysShader()` from `shaders/lightRays.ts`) wrapped by `RadiantSplashScreen.tsx`. This is what ships to the App Store.
- **Expo Go testing (no Skia):** `SplashScreen.tsx` + `RayCanvas.tsx` (expo-gl `GLView`, full-screen `absoluteFill`) running the SAME shader ported to GLSL in `rayShaderSource.ts`. Requires `expo-gl` (in package.json; bundled in Expo Go).
- `app/index.tsx` and `app/splash.tsx` pick the path: plain `SplashScreen` when `Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient'` (Expo Go/web), else Skia `RadiantSplashScreen`.
- Both paths take: `logoSource = require('../assets/ffs-logo.png')`, `studioName = "Romans 8:28"`, `duration = 2500`.

### Hard rules
- Splash is the SAME for every game. Only the FFS logo + "Romans 8:28". Never a game-specific splash.
- Rays MUST be full-screen (absoluteFill), never boxed.
- Verse is white italic mixed-case, never gold/uppercase (that was the web variant and is wrong for the app).

---

## 2. ONBOARDING (high-level system, every game)

Premium, fun, fast. It should feel "legit," like a top app, not a form. (Reference: Macadam + the onboarding research. Teach by playing, instant win, personalized.)

### Mascot: ONE PER GAME (same structure, unique spin)
Every game has the SAME onboarding structure but its OWN mascot character, generated in the same warm studio art family (gold halo, rosy cheeks, friendly eyes, premium app-mascot style). Mascots so far:
- **Manna Catch -> Joy** (a chubby gold-haloed dove with an olive branch).
- **Gosple -> Scripture** (a gold-haloed leather Bible with a gold cross on the cover, waving).
- **Light Snake -> Lumen** (a cute glowing cream-white cartoon snake coiled up, gold halo, waving). Added 2026-06-09.
- **Noah Animal Match -> Ari** (a friendly golden lion cub with a little gold mane, gold halo, waving). Added 2026-06-09.
- **Art family (LOCKED look):** soft 2D storybook cartoon, gentle warm dark-brown outline, soft cel shading, thin floating gold halo ring, rosy pink cheeks, big friendly eyes, little rounded white cartoon hands. Joy + Scripture define it. (NOTE: a first Lumen pass came out 3D-clay and was rejected for not matching the 2D family — match Joy/Scripture, not a glossy 3D render.)
- **Mascot names Lumen + Ari are Stable's picks (2026-06-09), easy to rename:** change `MASCOT_NAME` + the two `MASCOT_*` requires + the asset filenames. Flagged to CJ.
- **Cut recipe is now a script:** `python scripts/cut-mascot.py <in> <out> [thresh=130]` (rembg + alpha<130 + autocrop). Generate the mascot on a flat MID-TONE bg (pale mint works) so rembg gets a clean edge; a white bg leaves a white fringe and a black bg leaves dark crud near the halo.
- New games get their own themed mascot (generate via the `/aiml` skill or `scripts/reve-generate.ts`, cut transparent with rembg, threshold alpha <130 to kill the halo haze).
- Each app holds two transparent poses in its `assets/`: `<mascot>-wave.png` (greeting) + `<mascot>-celebrate.png` (arms up). In `OnboardingScreen.tsx` use generic constants `MASCOT_NAME`, `MASCOT_WAVE`, `MASCOT_CELEBRATE` so only those three lines change per game. Source art lives in `.pmloop/mascot/`.
- Mascots are white/light-bodied, so ALWAYS show them on the LIGHT cream onboarding background (no transparency fringe).

### Flow (3 fun beats, never a form) — identical across every game
1. **Welcome:** mascot waving (gentle float), "Welcome to [Game]", a 3-line promise, "Let's Go".
2. **Meet [Mascot] + name:** mascot + speech bubble "Hi! I'm [Mascot]. What can I call you?" + optional name field (pre-filled "Player", "That's Me" + "Skip for now").
3. **"Welcome, [Name]!"** celebration: mascot celebrating (spring pop + success haptic) over a warm gold glow, a game-fitting subtitle, "Start Playing".

### Theme + rules
- **Cream onboarding background** `#FBF5E8`, dark ink text `#221C10`, gold accents `#D4C36A` / `#B8993A`, white cards.
- **FORCE_ONBOARDING = `__DEV__`** (`src/shell/devConfig.ts`): onboarding shows on EVERY launch in dev/Expo Go, auto-off in production. Gate `index.tsx` + `splash.tsx` with it.
- Profile is just an optional NAME (no Kid/Teen/Parent/Family picker). Shown in Settings + More.
- **How to play:** a CATCH / AVOID legend on the play screen (good icons vs bad icons) so players learn the rules first play.
- Reuse the shared shell: splash, onboarding, settings, giveback, privacy, about, (tabs) home/stats/more, ParentGate, stores, `@ffs/verses`, GameBackground.

### Per-game variation (the ONLY things that change)
- Game logic + renderer (`app/game.tsx`, `src/game/*`).
- `GameBackground` palette (each game its own scene set; Manna uses LEVEL_PALETTES that cycle per level).
- Game name/tagline strings, badge names/icons (keep badge IDs stable), score thresholds.
- Unique `app.json` slug/scheme/bundleId, no shared EAS projectId.

---

## Why this exists
2026-06-08: spent a long session getting Manna Catch's splash to EXACTLY match the deployed iOS Gosple (full-screen `lightRays` shader, white italic verse, logo at 0.42). CJ's directive: every game must share the identical splash, look, feel, and onboarding. This page is the contract so we never re-derive it per game.
