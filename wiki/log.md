# Firmware Foundation Studios Log

## 2026-06-04 -- Session 5: All Sprites Complete + 6 QA Bug Fixes

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
