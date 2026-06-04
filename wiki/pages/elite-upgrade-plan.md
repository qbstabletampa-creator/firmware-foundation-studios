# FFS Elite Upgrade Plan

**Summary:** Master plan to transform FFS from functional to elite app factory. Covers tool installation, full audit, shared infrastructure, game upgrades, new game builds, and App Store submission.
**Last Updated:** 2026-06-03
**Sources:** CJ direction, codebase audit, Reve API research, GameLabs/Sprite Lab/Scenario AI research, arcade UX research, Macadam onboarding capture
**Related:** [[studio-decisions]], [[app-factory-strategy]], [[game-build-order]], [[sprite-system-build]]

---

## Context

CJ wants to transform Firmware Foundation Studios from "functional but inconsistent" to "elite app factory." The studio has 4 live games at firmwarefoundation.com but they have gaps: 3 of 4 games have no sound, 2 splash screens use emoji instead of PNG logos, onboarding is minimal (2 steps vs the 7-step Macadam pattern CJ wants), and visual worlds are mostly procedural gradients. CJ also wants to install new dev tools, evaluate Reve API for visual asset generation, build the remaining games in the pipeline, and eventually move everything to the App Store after the web versions are bulletproof.

---

## Phase 0: Tool Installation & Evaluation
**Estimated effort: 1.5 days**

### 0.1 Install OpusGameLabs Game Creator
- Install the Claude Code plugin from `OpusGameLabs/game-creator` repo
- Verify it loads with `claude plugins list`

### 0.2 Evaluate Phaser 4 Beta
- Clone `Yakoub-ai/phaser4-gamedev`, read README and examples
- Compare against current Phaser 3.87 patterns in `ArkHopperScene.ts`, `MannaCatchScene.ts`, `NoahAnimalMatchScene.ts`
- **Decision criteria:** Only migrate if Phaser 4 has stable Scene lifecycle, Canvas/WebGL, Tweens, and Input. If not, stay on 3.87.
- **Recommendation:** Stay on Phaser 3.87. The current games use no deprecated APIs and Phaser 4 is still beta. Record findings in wiki.
- Write: `wiki/pages/phaser-4-evaluation.md`

### 0.3 Evaluate Reve API for Visual World Generation
- Sign up for AIML API key (proxy for Reve)
- Test 3 generations via `POST https://api.aimlapi.com/v1/images/generations` with `model: "reve/create-image"`:
  1. Claymation background tile: `"soft 3D claymation desert sand ground, top-down view, warm tones, seamless tileable texture, game background, Pixar style, warm studio lighting"`
  2. Game icon composition (512x512 with title text embedded)
  3. Sprite transparency test (claymation lamb on transparent background)
- Compare quality against existing ChatGPT/Gemini sprites in `public/sprites/`
- **Decision framework:**
  - USE Reve for: backgrounds, icons, marketing assets, scene compositions (strengths: prompt adherence, typography, high resolution)
  - USE Reve edit-image for: iterating on backgrounds via natural language
  - KEEP ChatGPT/Gemini for: sprites needing transparency (proven pipeline, Reve transparency unconfirmed)
- Cost estimate: ~$0.04/image via AIML API
- Write: `wiki/pages/reve-api-evaluation.md`

### 0.4 Evaluate PartyKit
- Research PartyKit architecture and Cloudflare integration
- Determine if it fits future multiplayer titles or shared leaderboards
- **Decision:** Defer implementation. Record findings for future reference.
- Write: `wiki/pages/partykit-evaluation.md`

### 0.5 Install GameLabs Studio MCP
- GameLabs Studio (gamelabstudio.co) is an AI sprite/animation/tileset generator with Claude Code MCP integration
- Has features critical for FFS: sprite sheet generation with multi-angle consistency, seamless tileable textures, chroma key transparency pipeline (magenta bg to true alpha PNG), animation generation from static images, direct game engine exports
- They built a real production game with it (Age of Steam Tower Defence, 60K+ plays)
- **Install:** Add GameLabs MCP server to Claude Code settings. Get API key from gamelabstudio.co (20 free credits on signup)
- **Test:** Generate a claymation-style tileable grass texture and a sprite sheet from an existing FFS character sprite
- **Best use for FFS:**
  - Seamless tileable background textures (grass, water, wood, stone) for Phaser scenes
  - Sprite sheet generation (walk cycles, idle animations) from existing static sprites
  - Multi-angle character variants (front, back, side) for games that need them
  - Processing raw AI-generated sprites into clean transparent PNGs via chroma key pipeline

### 0.6 Install Sprite Lab (boona13/sprite-lab)
- Browser-based tool for background removal + spritesheet slicing
- No AI, purely deterministic pixel processing on HTML Canvas
- Features: chroma key removal (magenta, green screen, solid backgrounds), multi-pass alpha matting (kills edge halos), pixel-based frame detection for spritesheet slicing, live animation preview, ZIP export with individual frames + JSON manifest
- **Install:** Clone repo, npm install, run locally
- **Best use for FFS:**
  - Process raw ChatGPT/Gemini claymation renders into clean transparent PNGs
  - Slice any future sprite sheets into individual frames
  - Quality check sprites for edge halos and transparency issues
  - Pairs with GameLabs: generate sprites in GameLabs, process in Sprite Lab if cleanup needed

### 0.7 Evaluate Scenario AI for Custom Style Training
- Scenario (scenario.com) lets you train a custom AI model on 10-20 reference images of your art style
- Trained model generates new assets that inherit consistent proportions, palette, and style
- Has API access, Unity/Godot/Unreal plugins, batch generation, workflow editor
- **Evaluation:** Upload 15-20 of our best existing claymation sprites as training data, train a custom "FFS Claymation" model, compare output consistency against ChatGPT/Gemini one-off generations
- **Decision criteria:** If trained model produces more consistent cross-game assets than our current prompt-by-prompt approach, adopt as primary sprite generator. If not, keep ChatGPT/Gemini.
- **Cost:** Subscription-based, needs evaluation
- Write: `wiki/pages/scenario-ai-evaluation.md`

### 0.8 Document 5-Agent Studio Model
- Define roles: Architect (designs systems), Builder (writes code), Art (generates assets), QA (tests flows), Ship (deploys)
- Write: `wiki/pages/five-agent-studio-model.md`

---

## Phase 1: Full Audit
**Estimated effort: 4 hours**
**Depends on: Phase 0 complete**

### 1.1 Splash Screen Audit

| Game | Logo Type | Status | Fix |
|------|-----------|--------|-----|
| Gosple | PNG `/logo.png` | GOLD STANDARD | None |
| Manna Catch | PNG `/manna-catch-icon.png` | Matches pattern | None |
| Noah Animal Match | Emoji via `motion.span` | BROKEN | Switch to `motion.img` with PNG |
| Ark Hopper | Emoji via `motion.span` + extra title text | BROKEN | Switch to `motion.img` with PNG, remove extra title |

### 1.2 Onboarding Audit
All 4 onboarding screens are copy-pasted with only title/path changed. Current 2-step flow (profile pick, name input) is missing 5 of 7 Macadam pattern items:
- No emotional opener
- No visual guide/anchor
- No clear promise
- No instant reward
- No streak/progress preview

### 1.3 Sound Audit

| Game | Sound | Status |
|------|-------|--------|
| Gosple | None | Needs: key tap, correct letter, wrong letter, puzzle solve |
| Manna Catch | `src/games/mannaCatch/sounds.ts` | Has 10 SFX, working. Needs refactor to shared engine |
| Noah Animal Match | None | Needs: card flip, match, mismatch, combo, level complete |
| Ark Hopper | None | Needs: hop, star collect, death, splash, level complete |

### 1.4 Visual World Audit

| Game | Background | Status |
|------|-----------|--------|
| Manna Catch | Procedural sky + stars + beam + clouds + hills | Good, cohesive |
| Ark Hopper | Procedural sky + clouds + grass + water + goal glow | Good, could use tiles |
| Noah Animal Match | Cream gradient + golden particles + wooden frame | Minimal, needs depth |
| Gosple | CSS background (no Phaser canvas) | N/A |

### 1.5 Critical Bug
`src/screens/ArkHopperGameScreen.tsx` lines 15, 22, 42: Uses Manna Catch purchase/free-play logic instead of Ark Hopper's. Playing Ark Hopper consumes a Manna Catch free play.

### 1.6 Code Duplication
- 4 splash screen files: ~130/145 lines identical (WebGL shader, useRayCanvas, timer logic)
- 4 onboarding files: ~95/103 lines identical
- 4 splash CSS files: identical
- WebGL shader strings (VERT + FRAG) duplicated verbatim in all 4 splash files

Deliverable: Audit report saved to `wiki/pages/elite-audit-june-2026.md`

---

## Phase 2: Shared Infrastructure
**Estimated effort: 3-4 days**
**Depends on: Phase 1 audit complete**

### 2.1 Shared Splash Screen Component

Extract one reusable component from the Gosple splash screen (gold standard).

**Create:**
- `src/utils/rayShader.ts` -- Move WebGL VERT/FRAG strings and `useRayCanvas` hook here
- `src/components/GameSplashScreen.tsx` -- Reusable component accepting config: `{ logoSrc, verseText, homePath, onboardingPath }`
- `src/components/GameSplashScreen.module.css` -- Shared styles (identical to current SplashScreen.module.css)

**Modify (become thin wrappers, ~10 lines each):**
- `src/screens/SplashScreen.tsx`
- `src/screens/MannaCatchSplashScreen.tsx`
- `src/screens/NoahAnimalMatchSplashScreen.tsx` -- FIX: use PNG logo, not emoji
- `src/screens/ArkHopperSplashScreen.tsx` -- FIX: use PNG logo, remove extra title text

**Verify:** All 4 splash screens render identically: black background, WebGL gold rays, 160x160 PNG logo centered, verse text at 800ms, fade at 2200ms, navigate at 2500ms.

### 2.2 Shared Sound Engine

Generalize Manna Catch's sound system into a shared engine.

**Create:**
- `src/utils/soundEngine.ts` -- Core audio context, `unlockAudio()`, `playTone()`, and a `SharedSFX` library:
  - Positive: `collectGood(combo)`, `matchFound()`, `milestone()`, `levelComplete()`
  - Negative: `collectBad()`, `mismatch()`, `lifeLost()`, `gameOver()`
  - Movement: `hop()`, `splash()`, `land()`
  - UI: `buttonTap()`, `cardFlip()`, `countdown()`, `countdownGo()`
  - Power-ups: `powerUpActivate()`, `powerUpEnd()`
  - Combo: `combo(count)` -- ascending arpeggio scaled by count
  - Haptics: `vibrate(pattern)`
  - Volume/mute: `setMasterVolume()`, `setMuted()` reading from preferencesStore

**Create per-game sound configs:**
- `src/games/gosple/sounds.ts` -- Maps: keyTap to buttonTap, correctLetter to collectGood, wrongLetter to mismatch, puzzleSolve to milestone
- `src/games/noahAnimalMatch/sounds.ts` -- Maps: flip to cardFlip, match to matchFound, mismatch to mismatch, combo to combo, levelComplete to levelComplete
- `src/games/arkHopper/sounds.ts` -- Maps: hop to hop, starCollect to collectGood, death to lifeLost, waterDeath to splash, levelComplete to levelComplete

**Modify:**
- `src/games/mannaCatch/sounds.ts` -- Refactor to import from shared engine
- `src/stores/preferencesStore.ts` -- Add `soundEnabled: boolean` and `volume: number` fields

**Verify:** Play each game. Every interaction produces audio. Toggle mute in settings = silence.

### 2.3 Macadam-Pattern Onboarding Template

Replace the 2-step onboarding with a 7-step Macadam flow.

**Create:**
- `src/components/GameOnboarding.tsx` -- Reusable component accepting per-game config
- `src/components/GameOnboarding.module.css`

**Onboarding flow (7 screens):**

1. **Emotional Opener** -- Full-screen dark bg, game icon PNG scale-in, game tagline fade-in, verse reference. Tap to continue.
2. **Visual Guide** -- Game's key sprite (basket, card, lamb, puzzle grid) with gentle bob animation + one-liner explaining the game.
3. **Clear Promise** -- "Here's what you'll do:" + 3 bullet points with icons, staggered animation. Each bullet describes a game mechanic.
4. **Profile Selection** -- Same as current: "Who's playing?" Kid/Parent cards + "What should we call you?" name input. This is the only step requiring user input.
5. **Instant Reward** -- "Welcome, [name]!" with celebration particles + star sprite scale-pop + milestone SFX fanfare.
6. **Streak Preview** -- 7-day calendar row (Mon-Sun), today highlighted in gold, "Play every day to build your streak!" First day already filled.
7. **Play Button** -- Large "LET'S PLAY!" gold button, full-width, pulse animation. One tap into the game.

**Per-game configs:**
- **Manna Catch:** opener=basket sprite + "Catch the blessings from heaven" + Exodus 16:15; guide=manna falling; promise="Catch holy food / Dodge thorns / Unlock verses"
- **Noah Animal Match:** opener=card flip + "Match animals two by two" + Genesis 7:9; guide=matching cards; promise="Flip cards / Race the clock / Meet all animals"
- **Ark Hopper:** opener=lamb hop + "Help them reach the Ark!" + Genesis 6:14; guide=lamb on path; promise="Hop rivers / Collect stars / Reach Noah's Ark"
- **Gosple:** opener=puzzle grid + "A daily Bible word puzzle" + Romans 8:28; guide=tiles spelling FAITH; promise="Solve daily / Discover verses / Build your streak"

**Verify:** Walk through each game's onboarding start to finish. All 7 screens render. Profile saves. Final tap navigates to correct game.

### 2.4 Complete Asset Pipeline

Build the full art production pipeline using multiple tools, each for what it does best.

**Asset Pipeline Architecture:**
```
Concept/Prompt
    |-- Reve API ------> Backgrounds, icons, marketing assets (high-res, typography)
    |-- GameLabs MCP --> Tileable textures, sprite sheets, animations
    |-- ChatGPT/Gemini -> Individual sprites (proven transparency pipeline)
    |-- Scenario AI ----> Style-consistent batch sprites from trained model (if eval passes)
    |-- Sprite Lab -----> Post-processing (bg removal, sheet slicing, edge cleanup)
```

**When to use which tool:**

| Need | Tool | Why |
|------|------|-----|
| Background tiles (seamless, tileable) | GameLabs Studio | Purpose-built seamless tile generation, edge-aware |
| Background scenes (composed, atmospheric) | Reve API | Best prompt adherence, high-res, natural language editing |
| Individual sprites (transparent PNG) | ChatGPT/Gemini | Proven claymation pipeline, reliable transparency |
| Sprite sheets (animation frames) | GameLabs Studio | Multi-frame generation with consistency |
| Game icons with title text | Reve API | Best typography rendering in AI image gen |
| Batch sprites (consistent style) | Scenario AI (if trained model passes eval) | Custom model trained on FFS art style |
| Sprite cleanup (edge halos, bg removal) | Sprite Lab | Deterministic, no AI, pixel-perfect |
| Marketing assets | Reve API | Highest quality, natural language iteration |

**Create:**
- `scripts/reve-generate.ts` -- CLI tool for Reve API (backgrounds, icons, marketing)
  - `npx tsx scripts/reve-generate.ts --type bg --game manna-catch --prompt "..." --output public/sprites/manna-catch/bg-sky.png`
  - Uses AIML API proxy, reads key from `.env` (`AIML_API_KEY`)
  - Supports `--type bg` (background), `--type icon` (game icon), `--type edit` (edit existing image)

**Background tiles to generate (Phase 3):**
- Manna Catch: desert wilderness night sky tile (1024x1024) via GameLabs seamless tile
- Ark Hopper: grass tile, water tile, dirt path tile (1024x1024 each) via GameLabs
- Noah Animal Match: warm wooden table/surface tile (1024x1024) via GameLabs

**Game icons to generate (Phase 5):**
- All 6 games: composed 512x512 scenes with game elements + title text via Reve API

### 2.5 Fix Ark Hopper Purchase Bug

**File:** `src/screens/ArkHopperGameScreen.tsx`

**Changes:**
- Line 15: `canPlayMannaCatchFree` to `canPlayArkHopperFree`, `recordMannaCatchFree` to `recordArkHopperFree`, `mannaCatch: purchased` to `arkHopper: purchased`
- Line 22: `purchaseGame('mannaCatch')` to `purchaseGame('arkHopper')`
- Line 42: `recordMannaCatchFree()` to `recordArkHopperFree()`

**Verify:** Play Ark Hopper, check localStorage `ffs-purchases` key. Confirm Ark Hopper free plays decrement independently from Manna Catch.

---

## Phase 3: Upgrade Current Games to Elite
**Estimated effort: 4-5 days**
**Depends on: All of Phase 2**

### 3.1 Splash Screen Standardization
Convert all 4 games to use `GameSplashScreen` component. See Phase 2.1 for details.

### 3.2 Sound Integration
Wire shared sound engine into all 4 games:

**Manna Catch:** Refactor existing sound calls to use shared engine imports.

**Noah Animal Match** (`NoahAnimalMatchScene.ts`): Wire events:
- Card flipped to `cardFlip()`
- Match found to `matchFound(combo)` + `vibrate(50)`
- Mismatch to `mismatch()`
- Level complete to `levelComplete()`
- Game complete to `milestone()`

**Ark Hopper** (`ArkHopperScene.ts`): Wire events:
- Hop to `hop()`
- Star collected to `collectGood(stars)`
- Death (water) to `splash()` + `vibrate([100,50,100])`
- Death (obstacle) to `lifeLost()` + `vibrate(200)`
- Level complete to `levelComplete()`
- Game over to `gameOver()`
- Momentum chain to `combo(chain)`

**Gosple** (`GameScene.ts`): Wire events:
- Key press to `buttonTap()`
- Correct letter to `collectGood(1)`
- Wrong letter to `mismatch()`
- Puzzle solved to `milestone()`

**All home/menu screens:** Add `buttonTap()` to every interactive button via onClick handler.

### 3.3 Onboarding Upgrade
Replace all 4 onboarding screens with Macadam-pattern `GameOnboarding`. See Phase 2.3 for configs.

### 3.4 Visual World Polish

**Manna Catch:** Already strongest visually. Add Reve-generated desert background tile beneath procedural sky for more depth.

**Ark Hopper:** Replace flat-color `LANE_COLORS` rectangles with sprite-based tiles:
- Modify `buildLaneBackgrounds()` in `ArkHopperScene.ts`
- Grass lanes to grass tile sprite (seamless, claymation)
- Water lanes to water tile sprite with shimmer
- Path lanes to dirt/stone tile sprite

**Noah Animal Match:** Add warm wooden table texture behind card grid:
- Generate via Reve or GameLabs
- Render as background layer in `NoahAnimalMatchScene.ts`

**Gosple:** CSS-only game. Review `GospleScreen.module.css` for visual warmth. Consider subtle background pattern.

### 3.5 Juice Pass
Add missing "juice" effects from the arcade UX research checklist:

1. **Score counter animation** -- All Phaser games: tween displayed score number from old to new over 200ms
2. **Button spring** -- All React screens: ensure every Framer Motion button has `whileTap={{ scale: 0.95 }}`
3. **Home screen idle animation** -- Subtle float/bob on game icon sprites on home screens
4. **New high score celebration** -- Detect new record in game-over overlay, show "NEW BEST!" banner with confetti particles and milestone SFX

**Verify:** Record screen captures of all 4 games. Cross-reference juice checklist. Every item present.

---

## Phase 4: New Game Factory
**Estimated effort: 5-7 days**
**Depends on: Phase 3 complete**

### 4.1 Document Game Template
Write `docs/new-game-template.md` with:

**Required directory structure per game:**
```
src/games/[gameName]/
  [GameName]Scene.ts, config.ts, gameEngine.ts, spriteMap.ts,
  sounds.ts, badges.ts, verses.ts, types.ts

src/screens/
  [GameName]{Splash,Onboarding,Home,Game,Stats,More,Settings,Listing}Screen.tsx

src/stores/[gameName]Store.ts

public/sprites/[game-slug]/
```

**Shared dependencies every game imports:**
- `GameSplashScreen`, `GameOnboarding`, `ScreenShell` from `src/components/`
- `soundEngine` from `src/utils/`
- `spriteHelper` from `src/utils/`
- `profileStore`, `purchaseStore`, `preferencesStore` from `src/stores/`

**New game launch checklist (15 steps):**
1. Define core mechanic and 30-second hook
2. Generate sprite pack (12-20 sprites, Gemini/ChatGPT claymation pipeline)
3. Generate background tiles (GameLabs for seamless, Reve for composed scenes)
4. Generate game icon (512x512, Reve API for typography)
5. Write game engine (pure logic, no rendering)
6. Write Phaser scene (rendering + input + animations)
7. Create game-specific sound config mapping to shared engine
8. Configure onboarding (7-step Macadam pattern)
9. Configure splash screen (PNG logo + verse)
10. Build home, stats, more, settings, listing screens
11. Create Zustand store with persist
12. Add to `gameCatalog.ts`
13. Add routes to `App.tsx`
14. Add to `purchaseStore.ts`
15. Full flow test: listing to splash to onboarding to home to play to stats to settings

### 4.2 Build Light Snake (First Wave #4)
- Core mechanic: Snake eats Bible-themed items to grow
- Hook: "Guide the light through darkness"
- Sprites: snake head, body segments, food items (bread, fish, lamp), obstacles (thorns)
- Sound: eat to collectGood, turn to buttonTap, grow to combo, death to lifeLost, milestone to milestone
- Estimated: 2-3 days

### 4.3 Build Bible Brick Breaker (First Wave #5)
- Core mechanic: Paddle bounces ball to break bricks revealing verse letters
- Hook: "Break through to God's Word"
- Sprites: paddle, ball, brick types (stone, gold, glow), power-up items
- Sound: bounce to hop, brickBreak to collectGood(combo), powerUp to powerUpActivate, allCleared to milestone
- Estimated: 2-3 days

### 4.4 Second Wave Games (after First Wave ships)
Build order: David Sling Shot to Shepherd Maze to Little Light Runner to Parable Pinball
Each follows the same template. Estimated 2-3 days per game.

---

## Phase 5: App Store Preparation
**Estimated effort: 5-7 days**
**Depends on: Phase 3 (current games elite), can overlap Phase 4**

### 5.1 Game Icons
Generate via Reve API (512x512 + 1024x1024):
- Composed scene with game elements + title text, claymation style
- One per game, stored in `public/icons/`

### 5.2 Screenshots
- 6-8 per game at iPhone 15 Pro resolution (393x852)
- Key moments: gameplay, verse card, score popup, game over, home screen
- Add device frames + bold text overlays
- Export at 1284x2778 (iPhone 15 Pro Max)

### 5.3 PWA Manifest Update
- Update `vite.config.ts` manifest from Gosple-specific to studio-level
- `short_name: 'FFS Games'`, `start_url: '/'`

### 5.4 App Store Metadata Per Game
- App name (max 30 chars)
- Subtitle (max 30 chars)
- Description (max 4000 chars) -- never say "Christian game", let reviewers say it
- Keywords (max 100 chars)
- Category: Games > Puzzle / Games > Arcade
- Age rating: 4+
- Privacy policy URL (already exists at /privacy)

### 5.5 Native Wrapper
- Wrap PWA with Capacitor (iOS + Android) or TWA (Android only)
- Test WebGL splash shader on physical devices
- Configure TestFlight (iOS) and Google Play Internal Testing (Android)

### 5.6 Submission
**iOS:** Apple Developer ($99/yr) to App Store Connect to Screenshots to Build via Xcode to App Review
**Android:** Google Play ($25 one-time) to Play Console to Feature graphic to AAB to Internal to Production

---

## Full Asset Toolchain Assessment

### Reve API
- **What:** #1 ranked AI image gen. Text-to-image + natural language editing. ~$0.04/image via AIML API proxy.
- **API:** `POST https://api.aimlapi.com/v1/images/generations` with `model: "reve/create-image"` or `"reve/edit-image"`
- **Strengths:** Best prompt adherence, excellent typography, 2048x2048 native with 4K upscaling, conversational image editing via edit endpoint
- **FFS use:** Backgrounds, icons with title text, marketing assets, App Store visuals, iterating on images via natural language
- **Not for:** Sprites needing transparency (unconfirmed), seamless tiles (no tile-aware generation)
- **Aspect ratios:** 16:9, 9:16, 3:2, 2:3, 4:3, 3:4, 1:1

### GameLabs Studio
- **What:** AI sprite/animation/tileset generator with Claude Code MCP integration
- **Strengths:** Seamless tileable textures (edge-aware), sprite sheet generation, multi-angle consistency, chroma key transparency pipeline, animation from static images
- **FFS use:** Tileable background textures for Phaser scenes, sprite sheet animations, processing sprites to clean transparent PNGs
- **Proven:** Built Age of Steam Tower Defence (60K+ plays) with their own pipeline
- **Cost:** 20 free credits, subscription after

### Sprite Lab (boona13/sprite-lab)
- **What:** Browser-based background removal + spritesheet slicing. No AI, deterministic pixel processing.
- **Strengths:** Multi-pass alpha matting (kills edge halos), pixel-based frame detection, ZIP export with JSON manifest
- **FFS use:** Post-processing for any sprite with edge artifacts, slicing sprite sheets into frames, QA pass on all sprite assets

### Scenario AI (evaluation pending)
- **What:** Train custom AI model on 10-20 reference images. All subsequent generations inherit style.
- **Strengths:** Strongest style consistency across batches, API + engine plugins, workflow editor
- **FFS use:** If eval passes, train "FFS Claymation" model for batch sprite generation across all games
- **Risk:** Subscription cost, training time, may not match ChatGPT quality for individual sprites

### ChatGPT / Gemini (existing, proven)
- **What:** Current sprite generation pipeline. ChatGPT for best quality, Gemini for free batch via API.
- **Strengths:** Proven transparent PNG claymation output, 47 sprites already generated
- **FFS use:** Primary for individual sprites until Scenario evaluation complete. Gemini batch script at `scripts/generate-sprites.py`

---

## Verification Plan

After each phase, verify with browser testing at firmwarefoundation.com:

1. **Phase 2 verification:** All 4 splash screens identical except logo/verse. Sound plays in all games. Onboarding walks through all 7 steps. Ark Hopper uses its own purchase store.
2. **Phase 3 verification:** Full playthrough of each game checking: sound on every interaction, visual consistency, juice effects, new onboarding flow, splash screen uniformity.
3. **Phase 4 verification:** Light Snake and Bible Brick Breaker pass the same quality checklist as upgraded games.
4. **Phase 5 verification:** TestFlight/internal testing builds install and run on physical iOS + Android devices. WebGL shader renders correctly in native wrapper.

---

## Total Timeline Estimate

| Phase | Effort | Running Total |
|-------|--------|--------------|
| Phase 0: Tools & Eval | 1.5 days | 1.5 days |
| Phase 1: Audit | 0.5 day | 2 days |
| Phase 2: Shared Infrastructure | 3-4 days | 6 days |
| Phase 3: Upgrade Current Games | 4-5 days | 10 days |
| Phase 4: New Games (2 games) | 5-7 days | 17 days |
| Phase 5: App Store Prep | 5-7 days | 24 days |

**Total: ~3-4 weeks for full execution**
