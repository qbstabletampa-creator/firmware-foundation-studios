# Firmware Foundation Studios Log

## 2026-06-13 -- Ran all 4 apps through the gates; fixed a universal Release launch crash (Claude/CJ)

- Ran the free gates on branch ffs-ios-readiness for all 4 apps. ios-preflight (pod install) GREEN x4. ios-sim-smoke first pass FAILED x4: apps compiled but crashed ~1.2s after launch (screenshots = iOS springboard, never the app).
- Root cause via a one-off `ios-sim-debug.yml` (launch + process-filtered os_log, since the .ips carried no JS string): `Cannot find native module 'ExpoAsset'` -> Invariant "main" not registered -> RCTFatal -> expo-updates ErrorRecovery SIGABRT. Cause: `expo-audio@1.1.1` declares `expo-asset:*`; npm hoisted SDK56 `expo-asset@56.0.16` over SDK54 `12.0.13`. NOT new-arch (rejected that as a no-op). Full trap written to `pages/native-expo-testing-and-build.md`; memory `feedback_expo_transitive_wildcard_native_module`.
- FIX: `overrides {expo-asset ~12.0.13}` in archive/package.json + gosple/package.json; clean reinstall (npm 11 needed node_modules+lock nuke to honor it); verified 12.0.13 hoisted/deduped, zero 56.x in locks. Re-ran sim-smoke x4 -> all GREEN, all 4 render their real onboarding (verified by screenshots).
- Rulebook: added Step 6 "Publish to Expo Go for CJ test, before any paid build" to global rule + `pages/native-build-readiness.md` (now 8 steps).
- Published all 4 to Expo Go preview (SDK 54) for CJ. Step 6 immediately caught real bugs. Build lane PAUSED. Rolled ALL 4 previews back to their last PM-verified versions (manna bf3d816c, light-snake 029bef38, noah 35dcc345, gosple e697691e).
- ICON/LOGO AUDIT (visual, every asset): the iOS app icons (`assets/icon.png`) are ALL CORRECT + distinct (basket / shepherd+sheep / animals / Bible grid). The bug is the IN-APP HOME LOGO (`assets/logo.png`, used by `app/(tabs)/home.tsx` logoSource): 3 of 4 WRONG — light-snake AND noah both show Manna's basket, gosple shows the FFS company logo, only manna is correct. Root cause: apps scaffolded from Manna's template, `logo.png` never swapped per app. Correct per-app art exists as each app's `icon.png` (square w/ bg; home logo wants transparent bg like manna's). Native splash (`splash-icon.png`) = FFS company logo for all, which is BY DESIGN (ffs-splash-company-brand), not a bug. FIX (pending CJ art call): rebuild light-snake/noah/gosple `logo.png` from their own icon art, transparent bg, screenshot all 4 home screens, show CJ before republish. See MC card for the PICKUP.
- 2 self-inflicted workflow bugs hit + fixed: GNU `timeout` absent on macOS runners; a `.filter` precedence slip in a workflow script.

## 2026-06-13 -- Locked the canonical App Store ship pipeline (Claude/CJ)

- CJ wanted a permanent, error-proof way to take any app to "95% ready, just waiting on Apple." Codified it in two places (no duplication).
- GLOBAL RULE `~/.claude/rules/app-build-testing.md`: upgraded the pre-flight pipeline native gate to TWO free GitHub macOS gates (3a `ios-preflight` = pod install, 3b `ios-sim-smoke` = real Release compile + sim boot). Added new HARD RULE "build-ready is NOT Apple-approved": signing (ASC API verify, EAS capability display lies) + Apple Kids-category review are separate gates the free pipeline can't prove. Agents must never promise CJ "submit, zero problems."
- WIKI: rewrote stale `pages/native-build-readiness.md` (was "Capacitor not Expo" from 6/5, contradicted the now-native-Expo fleet) into the canonical 7-step ship pipeline table (5 free gates + paid build + Apple review) with the signing + Kids-category pre-submission checklist. Updated index.md line for it. Capacitor noted as superseded except for unsplit Arc Hopper/BBB.
- No code changed, no builds spent. Both gate workflows (`ios-preflight.yml`, `ios-sim-smoke.yml`) confirmed present in `.github/workflows/`.

## 2026-06-13 -- iOS readiness audit + fixes, 4 native apps (Claude)

- New page `pages/ffs-ios-readiness-2026-06-13.md`; linked top of Active Build in `index.md`.
- Read-only audit of all 5 games, then fix pass on the 4 native apps. Branch `ffs-ios-readiness` (pushed, not merged), commit `aa82ea3`. No EAS builds or OTA publishes spent.
- KEY FINDING: Gosple live App Store build `546cdf31` is SDK 56, build #3, NO update channel = cannot take OTA. Fixes need a new build + review. The 2 errored SDK-54 builds died at pod install on the old Xcode-15.4 image pin (already removed).
- Gosple: channel bindings + GOSPLE_EPOCH=2026-06-13 + deleted dead MenuScreen. Manna: badgeDesc 2-line cap + channels. Shepherd's Trail: centered glowRing, gold -> Vegas #D4C36A, channels. Noah: 3-strikes-per-level (HUD hearts) + verse after every level incl. final + tests 19/19, adversarially re-verified.
- All 4: tsc clean + expo export ios clean. Arc Hopper + Bible Brick Breaker confirmed web-only (in src/games/, old Capacitor "FFS Games" bundle at firmwarefoundation.com/play/), never split into native apps.

## 2026-06-11 -- Shepherd's Trail (light-snake) polish round (Engine)

- New page `pages/shepherds-trail-build-log.md`; linked under Active Build in `index.md`.
- Five-item polish vs the app-shell standard, all in `archive/apps/light-snake` only:
  1. Adopted the house GL lightRays splash (SplashScreen + RayCanvas + rayShaderSource copied BYTE-IDENTICAL from manna, sha256 verified; added expo-gl ~16.0.10). Routing already GL-only / Trap-7 clean.
  2. How-to-play modal (Gosple pattern), auto-shows first run via NEW persisted `hasSeenHowToPlay` flag in the game store, plus always-visible "How to play" link on mode-select.
  3. Countdown stray-tap bug FIXED: `inputEnabled` ref gates queueDirection + PanResponder until countdown ends and phase==='playing'.
  4. Background reworked to twilight green pastures (dusk indigo -> teal-green horizon, rolling hill bands, fireflies). Kept GamePalette API + both exports.
  5. Stats + badges aligned to manna's canonical format (2-per-row stat boxes, centered, badge numberOfLines/adjustsFontSizeToFit). No truncation at 390px.
- Gates: tsc 0, vitest 9/9, expo export web clean. Visually verified in browser (splash boots, twilight bg, modal).
- Gotchas captured: hoisted (non-workspace) monorepo dep resolution; static-serve `import.meta` ESM quirk on Expo web exports.

## 2026-06-10 -- Christian App Store hook screenshot growth format expanded

- Updated `pages/christian-app-store-hook-screenshot-growth-format.md` with Adrià Martinez's longer article capture on AI influencer slideshow marketing.
- Kept the FFS translation tight: borrow the hook plus real screenshot format, not fake influencer account farms.
- Added guardrails for manual review, disclosure, and parent trusted Christian brand fit.

## 2026-06-10 -- INCIDENT: install builds black-screened; root causes fixed; sim-smoke rig (Stable, pt 3)

- CJ tested the 3 install builds: ALL black-screened at launch, Noah had Manna's icon, native splashes wrong. Four distinct bugs found:
  1. **Skia splash never ran anywhere before these builds.** app/index.tsx picked RadiantSplashScreen (Skia) for standalone builds, plain GL SplashScreen for Expo Go -- every phone test was Expo Go, so the EAS path was untested and crashed. FIX: GL splash is now the ONLY splash in manna/light-snake/noah. LESSON: Expo Go passing does NOT validate the EAS build's code paths; never ship a branch only standalone builds execute.
  2. Noah icon.png was a byte-copy of Manna's (1376296 bytes). FIX: real Ari+animals icon (641080 bytes) + adaptive.
  3. Noah + light-snake splash-icon.png (native launch splash) were the Manna BASKET; standard is the FFS logo (manna had it right). FIX: copied the logo splash to both.
  4. Gosple preview build died at npm ci EUSAGE: gosple is STANDALONE (not in archive workspaces, own package-lock.json) and the 6/9 sound commit added expo-audio without updating gosple's lockfile. FIX: npm install in gosple, lockfile synced, npm ci --dry-run green.
- NEW free verification rig: `.github/workflows/ios-sim-smoke.yml` -- compiles Release for iOS simulator on free macOS runners, boots sim, launches app, screenshots t+4/10/20s, fails if process dies, uploads crash logs. Run 1 failed on the harness itself (xcodebuild exit masked by pipe) -- fixed with pipefail + Pods-scheme exclusion + log artifact. Run 27295328567 (manna) IN FLIGHT at closeout.
- RULE for pickup: NO rebuilds until sim-smoke screenshots show splash -> home alive. Then rebuild all 4 headless and resend links.
- Credits: Starter $19/mo, 600/4500 used (13%), errored builds were not billed.


## 2026-06-10 -- Christian Roblox safe kids market scan

- Added `pages/christian-roblox-safe-kids-market-scan-2026-06-10.md` from CJ's capture asking whether anyone is building safe Christian Roblox for kids.
- Direct answer: fragments exist, but no clean public match for a parent trusted Christian Roblox ecosystem.
- Connected it to app factory strategy, Roblox Studio MCP, game build order, and studio decisions.

## 2026-06-10 -- Headless Apple lane + install builds delivered + preflight Action (Stable pmloop, pt 2)

- HEADLESS APPLE LANE PROVEN end to end. App-specific passwords CANNOT create signing credentials (Apple restriction) -- ASC API key can: `eas-headless` 7ZF97YMSGA, .p8 at ~/.apple-keys/, EXPO_ASC_* + EXPO_APPLE_TEAM_ID=4M8ZQ6KADQ (COMPANY_OR_ORGANIZATION, The Qb Stable LLC) in ~/.env.integrations. First-time credential prompts (cert reuse, device pick) still need a TTY: built a remote-control PTY rig at C:/Users/rodge/.eas-pty/driver.js (node-pty; answers via in.txt, output via out.log). After one-time setup, builds are pure --non-interactive.
- BURNED 3 BUILDS on the 6/9 Xcode-15.4 image pin: SDK 54 RN requires Xcode >= 16.1, pod install dies. Pins removed from ALL 4 apps. NEVER pin ios.image without a successful build proving it.
- NEW: `.github/workflows/ios-preflight.yml` -- prebuild + pod install on free GitHub macOS runners (repo is PUBLIC = unlimited). Proven green on light-snake AND gosple. Run before every EAS build: `gh workflow run ios-preflight -f app=<dir>`. Mandatory pipeline (phone -> headless gates -> preflight -> EAS) written into ~/.claude/rules/app-build-testing.md.
- DELIVERED: ShepTrail b5f3d6fb / Noah 48b4968f / Manna 3aac33e1 preview builds FINISHED on EAS default images. Install links emailed (subject: FFS install links) + texted.
- Gosple: SDK 56 builds fine on default image (preflight green); pin removed; cleared for App Store UPDATE build (sounds, daily-puzzle fix, board persistence, price-from-config) -- awaiting CJ go. Clarified: App Store accepts any SDK; only Expo Go is pinned to SDK 54.
- Mac Mini ruled out as build box (2014 Intel i5, macOS 12 max, no Xcode 16).


## 2026-06-10 -- Art completion pass + dev-server CI fix (Stable pmloop)

- Finished the three art items the rebooted-killed agent owed: Ari (Noah lion) wave+celebrate regenerated from one base via Reve edit (structurally consistent, 5 gens); Joy (Manna dove) wave pose regenerated from celebrate source to kill the style drift (1 gen) + on-dark previews refreshed; Shepherd's Trail bread/fish/lamp rethemed to family style + real 1024 opaque app icon (shepherd + lantern + glowing sheep on navy, adaptive-icon too; 5 gens). Gosple joy-*.png finding: never referenced by code, already deleted in 0a78c81, no action.
- Lamp needed a reject + re-brief (first version had no dark outline; redone to match bread/fish). PM gate: every image visually reviewed before accept.
- Subagent lesson: parallel AIML generations can hang forever on Reve CDN stalls (first Shepherd's Trail agent froze 46 min, 0 output, killed). Rule for art briefs: generate SEQUENTIALLY with a hard timeout per call, retry once, then FLUX/schnell fallback.
- ROOT CAUSE + FIX, dev servers dead after every reboot: PS7 `$env:CI = ''` CREATES an empty-string var (PS5.1 deleted it); expo getenv throws GetEnv.NoBoolean at metro boot, so the logon task silently killed all servers. Launcher now uses `Remove-Item Env:CI`. All 4 servers up + advertising Tailscale (8081 Manna, 8082 Gosple, 8083 Shepherd's Trail, 8085 Noah). Saved to global memory (ps7-empty-env-var).
- Verified: tsc --noEmit + expo export --platform ios clean for noah, manna-catch, light-snake. Gosple untouched this pass (art-free).
- Gosple price: CJ confirmed ASC tier $2.99; config already reads $2.99. Item closed.
- archive/package-lock.json committed: legit leftover recording last night's expo-audio install.


## 2026-06-08 -- Session close: committed everything; EAS build + Expo Go traps

- Committed all session work to git main (7895cca): Manna polish, Joy + Scripture mascots, locked splash/onboarding standard, Gosple Scripture onboarding + daily changes (web + native), Noah + Light Snake ports.
- Manna Catch = ship-ready. Gosple native = Scripture onboarding + mixed-letter/Day-1 daily changes done.
- EAS preview build of Gosple iOS FAILED: Xcode Swift `'weak' must be a mutable variable` (toolchain newer than May). Fix = pin eas.json image to Xcode 15. Used 1 build.
- Gosple Expo Go: fixed real bug (metro.config.js missing monorepo resolution). Online `expo start` crashes intermittently on undici "Body already read" in dep validation -> use `EXPO_NO_DEPENDENCY_VALIDATION=1`. New cheat sheet: [[native-expo-testing-and-build]].
- INFRA: MC projects.json wiped to [] by a test suite hitting LIVE data (recovered 147->163). Box socket exhaustion from expo churn.

## 2026-06-08 -- Per-game mascots: Scripture (Gosple) + standard refined

- CJ direction: every game keeps the SAME onboarding structure but gets its OWN mascot (unique spin), not one universal buddy. Manna -> Joy (dove). Gosple -> Scripture (gold-haloed leather Bible with a gold cross, waving).
- Generated Scripture via AIML: FLUX-pro base (.pmloop/mascot/scripture-v1) then reve edit added an embossed gold cross (scripture-v3 approved) + a celebrate pose (scripture-celebrate). Cut transparent via rembg + alpha threshold; installed archive/apps/gosple/assets/scripture-wave.png + scripture-celebrate.png.
- Wired into gosple OnboardingScreen.tsx via generic constants MASCOT_NAME/MASCOT_WAVE/MASCOT_CELEBRATE (so only 3 lines change per game). tsc clean.
- Updated [[app-shell-standard-splash-onboarding]]: mascot section now "ONE PER GAME, same structure, unique spin" with the generic-constants pattern.

## 2026-06-08 -- LOCKED: App Shell Standard (splash + onboarding) for every game

- Added `pages/app-shell-standard-splash-onboarding.md` -- the CANONICAL, locked spec every FFS game must inherit. CJ directive: identical splash, look, feel, and onboarding across all apps.
- Splash spec (matches deployed iOS Gosple exactly): full-screen `lightRays` shader (uRayCount 14, center 0.42, gold #D4C36A, animated intensity/glow), FFS logo 160px at 0.42 (scale 0.85->1->1.15), verse "Romans 8:28" WHITE ITALIC mixed-case at bottom 30%. Two render paths: Skia RadiantSplash (EAS build) + expo-gl RayCanvas/rayShaderSource (Expo Go), same shader.
- Onboarding spec: mascot Joy (dove) on cream bg, 3 fun beats (Welcome -> meet Joy + optional name -> "Welcome [Name]!" celebration), FORCE_ONBOARDING=__DEV__, CATCH/AVOID legend. Per-game only changes: game logic, GameBackground palette, names/badges, app.json id.
- Reference impl: archive/apps/manna-catch/src/shell/. Deployed source: archive/apps/gosple/src/shell/.

## 2026-06-08 -- Onboarding UI inspiration research (Mobbin + supplements)

- Added `pages/onboarding-ui-inspiration-mobbin.md` with findings from Appcues, Userpilot, Purchasely, PageFlows, and direct app analysis.
- Mobbin fully blocked unauthenticated -- documented in the page. All 7 patterns sourced from public alternatives.
- Covers: 7 specific app patterns (Duolingo, Fastic, Canva, Headspace, Photoroom, Toca Boca, Wise), visual upgrade checklist, celebration spec, kids UI rules, confetti implementation options.
- Updated wiki index with new page entry.

## 2026-06-08 -- Onboarding elite research for Manna Catch

- Added `pages/onboarding-elite-research.md` with full research and concrete recommendations.
- Covers: 6 real game examples (Duolingo, Candy Crush, Monument Valley, Subway Surfers, Toca Boca, Calm), distilled principles, recommended 2-screen + coached-first-play flow, exact on-screen copy, "?" help modal spec, RN/Expo Go implementation notes, and anti-patterns.
- Triggered by CJ feedback: 7-step onboarding is too many steps, game never teaches controls to returning players.

## 2026-06-07 -- Christian App Store hook screenshot growth format

- Added `pages/christian-app-store-hook-screenshot-growth-format.md` after CJ clarified the Adrià Martinez X capture belongs to the Christian App Store and Firmware Foundation Studios, not QB Stable.
- Captured the reusable format: slide 1 parent or kid benefit hook, slide 2 real game screen, store catalog, App Store listing, or parent trust proof.
- Guardrail: do not copy fake AI influencer spam. Use real product, real mission, real trust.

## 2026-06-05 -- Roblox Studio MCP game build capture

- Added `pages/roblox-studio-mcp-game-build-capture.md` from AzFlin's X post on Roblox Studio, official Roblox MCP, and a 3D platformer tutorial.
- Captured the FFS lesson: agents controlling visual game editors can speed up object placement, scene setup, and first playable prototypes.
- Guardrail: use Roblox as a sandbox signal only unless CJ chooses a separate Roblox platform lane. FFS main path stays PWA and Capacitor.

## 2026-06-05 -- Deployed visual upgrade to live + paywalls OFF + found onboarding loop bug

- Removed paywalls entirely (commit 08a93db): PAYWALLS_OFF flag in purchaseStore.ts makes every canPlay*Free() return true (dev + prod).
- Built + deployed to Cloudflare Pages via wrangler (manual; auto-deploy broken). Live at firmwarefoundation.com with new AI worlds + paywalls off. Verified Light Snake loads into gameplay on live, no paywall.
- CJ reported games loop on onboarding on live. ROOT CAUSE FOUND (new page `pages/onboarding-loop-bug.md`): markGameOnboarded(gameId) only fires on the profile-creation step, which is skipped for users who already have a profile -> game never marked onboarded -> ProtectedRoute bounces back to onboarding -> loop. First game works, every game after loops. One-line fix documented (add markGameOnboarded(gameId) to the play-button onClick in GameOnboarding.tsx ~line 387). NOT yet applied per CJ (wants fresh session).

## 2026-06-05 -- Vibe Fighter AI game build capture

- Added `pages/vibe-fighter-ai-game-build-capture.md` from @chongdashu X post, YouTube tutorial transcript, and Vibe Game Dev resources page.
- Captured the reusable FFS workflow: concept art, anchor image, AI sprite animation, Character Gym, Playground, JSON tuning, then combat loop.
- Guardrail: borrow the workflow only. Do not copy protected fighting game IP, characters, names, moves, or style.

## 2026-06-05 -- Sorceress AI game creation suite capture

- Added `pages/sorceress-ai-game-creation-suite-capture.md` from sorceress.games.
- Captured the useful FFS patterns: asset creation studio, WizardGenie browser game engine, sprite, 3D, voxel, tileset, audio, material, publishing, and layout preview lanes.
- Guardrail: study and sandbox first. Do not move the FFS pipeline into Sorceress without testing license clarity, export ownership, quality, cost, and speed.

## 2026-06-05 -- Committed visual upgrade + documented native (Capacitor) path

- Committed the visual upgrade work (commit f093c06). gitignored .sprite-backups/ and stray root test-*.png.
- Clarified Expo Go is NOT viable (Phaser can't run in React Native). Confirmed repo uses Capacitor 8.4 (android+ios platforms present, config ready). New page `pages/native-build-readiness.md` with build steps + the test-mode-off-in-prod gotcha.
- CJ chose: browser testing now (dev URL), Capacitor build later for App Store.

## 2026-06-04 (evening) -- Visual upgrade pass: AI worlds + sprite alpha fix + test mode

- Fixed Playwright MCP (8 agent instances flipped SSE -> stdio, all connected). Enabled the runtime visual audit.
- Ran in-browser visual audit of all 6 games. Found the real issues: some sprites exported without alpha (solid bg boxes), and game worlds were flat colors/gradients. The soft-3D art itself was already good.
- Built the fix pipeline (new page: `pages/visual-upgrade-pipeline.md`): rembg for background removal/resize, Reve-via-AIML for world/texture generation, scene wiring with gradient fallback.
- Light Snake: 6 sprites bg-removed + resized to transparent 256x256; new AI night-sky world wired.
- Bible Brick Breaker: new AI starry-temple world.
- Noah Animal Match: new AI ark-interior world; card colors warmed (CARD_DOWN_COLOR 0x2a4a5e -> 0x6b4a2f, stroke -> 0x9a763d) to match wood. Gameplay verified working in browser (cards flip/reveal, 0 errors).
- Ark Hopper: AI tiled lane textures (grass/water/path) replacing flat color lanes. Sprite sizes left alone to avoid hitbox regressions.
- Manna Catch: confirmed working (earlier "blank screen" was a transient init frame). Kept its animated procedural heavenly-light bg. Desert dawn image generated as an alt.
- Added dev/test mode in `src/stores/purchaseStore.ts`: all games free on dev server, paywall intact in prod. Phone testing at http://192.168.68.50:5173.
- All games verified 0 console errors, `tsc -b` clean. Originals backed up at `.sprite-backups/`. AIML cost ~$0.24.
- OPEN: stats-not-saved bug (Pattern 1 static audit) still affects Noah/Manna/Ark -- non-crashing, scores/badges stay 0.

## 2026-06-04 -- Premium mobile app polish capture

- Added `pages/premium-mobile-app-polish-capture.md` from Beto Moedano's X post on why premium apps feel right.
- Captured the reusable FFS checklist: press states, subtle motion, haptics, keyboard behavior, loading states, and empty states.
- Connected it to Gosple polish, FFS QA, Elite Upgrade Plan, and AI Gameplan product taste lessons.

## 2026-06-04 -- Session 5: Sprites, QA Fixes, Splash Unification, Navigation Bug Found

- Committed 120 files from session 4 (was sitting uncommitted on main).
- Generated all 16 game sprites (6 Light Snake + 10 BBB). 13 via Reve, 3 via FLUX/schnell as fallback when Reve CDN timed out repeatedly. Total cost ~$0.60.
- Ran 14-agent QA workflow across both games. Found 6 bugs, all fixed:
  1. Double recordGame() in both games (stats inflated 2x every play)
  2. Light Snake "NEW BEST" celebration never triggered (highScore read after store update)
  3. Shutdown not wired to Phaser events in either game (memory leak on restart)
  4. BBB powerup ghost sprites from unstable array index tracking (added stable IDs to engine)
  5. BBB dead code in word-reveal logic removed
- All 10 BBB Bible verses verified accurate (NIV references).
- All routes + all 16 sprites serve 200. tsc clean.
- Dropped GameLabs dependency. Kenney.nl (free CC0) + Reve/FLUX covers world tiles.
- Unified all 6 splash screens: FFS company logo + Romans 8:28 (CJ family verse). Splash is the company intro, not per-game branding.
- Removed ProtectedRoute from /play routes for Light Snake and BBB (was blocking first-time users, inconsistent with other 4 games).
- Fixed deprecated apple-mobile-web-app-capable meta tag in index.html.
- BLOCKER FOUND: Splash screen navigation bug. Playwright confirmed splash NEVER navigates away from /app URL. Root cause: React StrictMode double-mounting kills the mounted ref (first cleanup sets mounted.current=false, second mount timers check it and bail). Fix: remove mounted.current guards from setTimeout callbacks in GameSplashScreen.tsx, or reset ref at top of useEffect. Affects ALL 6 games.
- Key learning: Reve via AIML CDN silently fails ~25% of generations. FLUX/schnell delivers instantly via different CDN path. Use FLUX as fallback.

## 2026-06-04 -- Elite Upgrade Session 4: Audit + BBB Build + Sprites + iOS

- Ran 9-agent deep audit of all Light Snake + shared infrastructure code. Found 54 issues (4 critical, 15 major).
- Fixed all bugs via 9 parallel fix agents: iOS audio, stats persistence, memory leaks, paywall bypass, type landmine, WebGL cleanup, verse card crash, shutdown lifecycle.
- Built Bible Brick Breaker end-to-end (4,116 lines, 25 files). Paddle bounces ball to break bricks revealing Bible verse letters. 3 power-ups, 10 levels, 10 badges, 10 verses about strength.
- PWA/iOS hardened: viewport-fit=cover, studio-wide manifest (FFS Games, start_url /).
- AIML API configured ($20 credit). Reve confirmed excellent for claymation sprites at $0.03/gen.
- Generated 7 sprites via Reve (2 app icons + 5 Light Snake game sprites). Thorn failed, 10 BBB sprites paused.
- Phase 0 partially done: AIML key live, GameLabs/Sprite Lab/OpusGameLabs researched.
- tsc: zero errors. 96 files uncommitted.
- Created pages/phase0-tool-setup.md. Updated session notes, index, phase 4 build log entry.

## 2026-06-03 -- Macadam onboarding gamification capture

- Added `pages/macadam-onboarding-gamification-capture.md` from César Álvarez's X video and Macadam app listings.
- Captured the reusable FFS pattern: onboarding should feel like first play, with a warm guide, one tiny choice, instant reward, streak preview, and fast jump into the real game.
- Linked it to app factory strategy, puzzle UX research, arcade UX research, and Gosple product spec.

## 2026-06-03 -- Gameplay audit wiki page created

- Created `pages/gameplay-audit-june-2026.md` with full breakdown of all 44 issues found and fixed.
- Added to vault index under Active Build.

## 2026-06-03 -- Full gameplay audit, 24 bug fixes, production deploy

- Ran 6-agent workflow (469K tokens, 248 tool calls) auditing all 3 new games for transparency, gameplay bugs, and visual glitches.
- Found 8 critical, 16 major, 20 minor issues.
- Fixed all 8 criticals: sprite transparency (46 PNGs flood-fill bg removal + resize to 256px), Noah Match dead "View Results" button, Ark Hopper infinite death loop + double flood-kill, Manna Catch game over race condition + power-up stacking + browser crash, missing homepage icons.
- Fixed 11 majors: momentum score inflation, player sprite desync, water platform detection, HUD text contrast, keyboard listener accumulation, overlay/tween leaks, frame-rate LERP, speed ramp per-level, slow-mo tint bug, overlay double-alpha, item spawn overlap, level scaling.
- Fixed minors: redundant error suppression, dead code, collision hitbox consistency, combo state.
- Committed 161 files (16,820 lines) to main. Deployed to Cloudflare Pages via wrangler.
- Live at firmwarefoundation.com. All 4 games free and playable.
- Updated pages/sprite-system-build.md.

## 2026-06-03 -- All 47 sprites generated, path bug fixed, games made free

- claude-image-gen plugin MCP server not connecting (tool missing from deferred tools). Debugged, works manually but Claude Code plugin system doesn't surface it.
- Pivoted to Gemini REST API direct (gemini-2.5-flash-image). Free tier. Tested with rabbit sprite, perfect.
- Built scripts/generate-sprites.py. Generated all 38 remaining sprites in one batch run. $0 spent.
- Fixed critical sprite loading bug: relative paths in sprite maps resolved wrong from nested SPA routes. Prefixed all paths with / in all 3 sprite maps.
- Made all 4 games free: gameCatalog.ts price=Free, canPlay=true in all game screens.
- Renamed bread.png to manna.png (matching sprite map key).
- Browser tested: Ark Hopper and Manna Catch load sprites correctly, 0 console errors.
- Updated pages/sprite-system-build.md with generation progress, path fix, pricing status.

## 2026-06-03 -- Sprite generation pipeline: HF failed, Gemini plugin installed

- HuggingFace FLUX.1-schnell MCP tool hangs at 5% on free tier (GPU queue congestion). Direct API also fails (DNS does not resolve for api-inference.huggingface.co on this machine).
- Attempted 40-agent workflow to batch generate 38 sprites. All agents blocked on same HF timeout.
- Researched alternatives: game-asset-mcp, claude-image-gen, banana-claude, pixel-plugin, AutoSprite MCP.
- Installed claude-image-gen plugin (guinacio/claude-image-gen). Uses Google Gemini API (free tier, 20-500 images/day).
- Found existing GEMINI_API_KEY in autoagent/crons/.env. Added to ~/.claude/settings.json env block.
- Plugin installed as media-pipeline@media-pipeline-marketplace. Needs session restart to load.
- 8 sprites still in place from June 2 ChatGPT session. 38 remaining.
- Found Hermes captures HTML (Downloads/cj-captures-last-few-weeks.html): 19 cards including AI Agent Game Build Pattern.

## 2026-06-03 -- AI agent game build pattern captured

- Added `pages/ai-agent-game-build-pattern.md` from Om Patel's X post and the LMAO official site.
- Captured the useful pattern for Firmware Foundation Studios: agent lane builds, placeholder assets, bots for solo play, browser friendly prototypes, and IP clean public releases.
- Linked it to app factory strategy, sprite system build, and game build order.

## 2026-06-02 -- Sprite system built, art style locked

- Built full sprite loading infrastructure via 7-agent workflow (4 phases, ~7 min).
- Created spriteHelper.ts with GameSprite union type, createGameSprite() with emoji fallback, preloadSprites() with silent error handling.
- Created sprite maps for all 3 games (arkHopper, noahAnimalMatch, mannaCatch).
- Created sprite directories at public/sprites/ (ark-hopper, noah-animal-match, manna-catch, shared).
- Refactored ArkHopperScene.ts: player, lane items, stars, ark goal use createGameSprite(). All animations preserved.
- Refactored NoahAnimalMatchScene.ts: card faces/backs use sprites with destroy/recreate on flip.
- Refactored MannaCatchScene.ts + renderItems.ts + renderBasket.ts: falling items and basket support sprites.
- Added environment polish to Ark Hopper: gradient sky, 4 animated clouds, water shimmer, grass detail, goal glow.
- Added environment polish to Noah Animal Match: warm gradient, golden particles, wooden frame border.
- TypeScript: 0 errors. Vite build: clean (13s).
- Art style test: CJ compared Leonardo.AI vs ChatGPT for lamb sprite. ChatGPT won (better texture, better proportions, cleaner transparency).
- Style locked: soft 3D claymation, Pixar-like, 512x512 transparent PNG via ChatGPT.
- Lamb and Lion sprites approved. Remaining 6 test batch sprites in progress.
- Full prompt sheet saved at docs/sprite-prompts.md.
- Ops Wiki (D:/Google Drive/Ops Wiki/firmware-foundation-studios.md) updated with art direction and sprite system sections.

## 2026-06-01

- Added Gosple `/play/` build lane as an exact copy for safe iteration.
- Source: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/apps/play/`.
- Working URL while SSL is pending: `http://firmwarefoundation.com/play/`.
- Target secure URL after GitHub Pages certificate issuance: `https://firmwarefoundation.com/play/`.
- Verified local tests and typecheck passed, GitHub Pages deployed, and the live `/play/` page renders the Gosple onboarding UI.
- Added `docs/.nojekyll` so GitHub Pages serves Expo `_expo` assets instead of dropping them through Jekyll.
- Investigated mobile link failure. Root cause is GitHub Pages SSL certificate missing, not the app code. DNS points to GitHub Pages and the root domain is HTTPS eligible. Next action is add or verify the `www` CNAME, wait for GitHub certificate issuance, then enforce HTTPS.

## 2026-05-31 -- Gosple live URL and code path confirmed
- Updated `pages/studio-decisions.md` with CJ's correction: keep the public URL on `/gosple` and treat Gosple as live.
- Confirmed current local source path: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/apps/gosple/`.
- Confirmed repo remote from that app folder: `https://github.com/qbstabletampa-creator/firmware-foundation-studios.git`.
- Confirmed Expo slug `gosple` and iOS bundle identifier `com.firmwarefoundation.gosple` in `app.json`.

## 2026-05-27 -- 40 plus app portfolio article added
- Updated `pages/app-factory-strategy.md` with CJ's capture/article about creating 40 plus apps.
- Clarified that the strategy is not random apps, it is one reusable Christian kids app factory, small focused launches, then scale winners.
- Updated `index.md` so Claude and future agents see the 40 plus app portfolio note first.

## 2026-05-27 -- Gosple Expo prototype started
- Created `apps/gosple` with Expo SDK 56 and TypeScript.
- Built the first playable daily puzzle shell with dark Bible card style.
- Added tested Wordle scoring logic for 4 to 8 letter words.
- Added 30 starter Bible word puzzles for the TestFlight content bank.
- Verified with `npm test` and `npm run typecheck`.
- Committed app repo: `40261c7 Start Gosple Expo prototype`.

## 2026-05-27 -- Giveback partners locked
- CJ chose Hope Children's Home, Tampa as the Month B local ministry.
- Locked rotation: Month A is Awana. Month B is Hope Children's Home, Tampa.
- Updated studio decisions, charity options, and Gosple product spec.

## 2026-05-27 -- Vault created
- Created dedicated project vault for Firmware Foundation Studios.
- Recorded studio decisions, app factory strategy, Gosple direction, build order, and charity research.
- Linked project back to main wiki and Mission Control.

## 2026-06-09 -- Finish native apps + Shepherd's Trail reskin + Expo Go / install-link
- Finished Light Snake + Noah to the locked shell standard: Lumen + Ari mascots, name-based onboarding, splash logo bug fixed (was Manna basket), EAS Xcode-15 pin on all 4 apps. (commit 48e5c77)
- PIVOT: Light Snake -> **Shepherd's Trail** -- shepherd leads a glowing flock of sheep; mascot Eli; full rename (slug/scheme/bundle). Engine untouched. (a12e79d, f360276)
- New hard rules: Expo Go/dev-build before EAS builds; one SDK (54) across all apps; every app its own EAS project + Expo Go dev server on its own port. Written to ~/.claude/rules/app-build-testing.md, AGENTS.md, native-expo-testing-and-build.md. (1f19b8a)
- Created EAS projects: shepherds-trail (a3000ec4), noah-animal-match (2b0ff349). Dev servers live: Manna 8081, Shepherd's Trail 8083, Noah 8085 (Tailscale 100.103.56.37).
- Codified scripts/cut-mascot.py (rembg+alpha130+autocrop). Added wiki/pages/native-expo-testing-and-build.md traps + wiki/pages/ffs-native-apps-state-2026-06-09.md pickup.
- BLOCKER: install-link (EAS preview build) needs interactive Apple login for new bundle IDs; non-interactive attempt failed at credentials (NO build consumed). Awaiting CJ choice (run interactive vs app-specific password). See pickup page.
- Pages: ffs-native-apps-state-2026-06-09 (new), native-expo-testing-and-build (updated), app-shell-standard-splash-onboarding (Lumen+Ari added).

## 2026-06-10 (PM) — Stable
- Sim-smoke harness fixed (scheme picker, gosple standalone deps, gosple Xcode/Swift 6.2). All 4 apps GREEN: compile + boot to home in simulator on 3f879ed.
- Killed all remaining Skia splash paths (gosple index.tsx + app/splash.tsx in all 4 apps). GL splash is the only splash, verified live on CJ's phone.
- NEW HARD RULE: EAS Update publish lane = the testing loop (no build-to-test, no install links). Manna published + channel created; CJ's first test caught the zero-width game-area deadlock (Trap 9), fixed + republished same hour.
- Pages: native-expo-testing-and-build.md (Traps 6-9, publish lane, stale Trap 4 pin note corrected).
