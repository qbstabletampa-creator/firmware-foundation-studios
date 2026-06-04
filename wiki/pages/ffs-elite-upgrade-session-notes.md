# FFS Elite Upgrade Session Notes

**Date:** 2026-06-04 session 4
**Purpose:** Pickup notes for continuing the elite upgrade plan after /clear

---

## Where We Are in the Plan

Phase 0: Tool Installation - PARTIAL (AIML API configured, GameLabs/Sprite Lab researched not installed)
Phase 1: Full Audit - DONE
Phase 2: Shared Infrastructure - DONE
Phase 3: Game Upgrades - 90% (3.4 visual tiles blocked on GameLabs, juice mostly done)
Phase 4: New Game Factory - DONE (Light Snake + Bible Brick Breaker, both compile clean)
Phase 5: App Store Prep - NOT STARTED

---

## Session 4 Work (June 4, 2026)

### Deep Audit (9 agents, 54 findings)
- 4 critical, 15 major, 35 minor across all Light Snake + shared infrastructure code
- All bugs fixed by 9 parallel fix agents

### Bible Brick Breaker Built (4,116 lines)
- Full game: paddle bounces ball to break bricks revealing Bible verse letters
- 8 game files (types, config, verses, spriteMap, sounds, badges, gameEngine 21KB, Scene 50KB)
- 13 screen files + 6 CSS modules
- Store, routes, catalog, purchase store integration
- 3 power-ups (wide paddle, multi-ball, slow ball), 10 levels, 10 badges, 10 verses

### Bug Fixes Applied
- soundEngine.ts: Safari AudioContext, volume=0 crash, oscillator leak, disposeAudio
- rayShader.ts: shader error checking, context-lost, GPU cleanup, highp
- LightSnakeScene.ts: recordGame persistence, shutdown lifecycle, verse card crash
- gameEngine.ts: spawnFood null safety
- types.ts: re-exports from gameEngine (fixed type landmine)
- phaserConfig.ts: deleted (duplicate)
- GameSplashScreen.tsx: per-game onboarding, unmount guard
- LightSnakeGameScreen.tsx: full purchase store + paywall
- App.tsx: ProtectedRoute, package.json tsx dep

### PWA/iOS Hardening
- viewport-fit=cover for notched iPhones
- PWA manifest: studio-wide (short_name FFS Games, start_url /)

### Sprite Generation (Reve API)
- AIML API key configured in .env
- Generated: light-snake-icon.png, bible-brick-breaker-icon.png
- Generated: 5/6 Light Snake sprites (lantern, light-trail, bread, fish, lamp)
- Failed: thorn.png (93 bytes, needs regen)
- Paused: 10 BBB game sprites (workflow stopped for closeout)

### Phase 0 Progress
- AIML API: $20 credit, key in .env, tested and working
- Reve: confirmed excellent for claymation ($0.03/gen)
- GameLabs MCP: researched, needs CJ signup at gamelabstudio.co
- Sprite Lab: researched, needs clone + npm install
- OpusGameLabs: researched, skills plugin install available
- Phaser 4: staying on 3.87 (correct decision)

---

## 96 Files Uncommitted

Everything from Phases 2-4 plus sprites. Need to commit before more work.

---

## What Needs to Be Done Next

### 1. Commit (highest priority)
96 files uncommitted. Stage and commit all Phase 2-4 work + sprites + fixes.

### 2. Finish Sprites (~2 min)
Regenerate thorn.png:
```bash
cd /c/Users/rodge/projects/firmware-foundation-studios
npx tsx scripts/reve-generate.ts --type icon --game light-snake --prompt "3D claymation style thorn bush, dark green with sharp brown thorns, slightly menacing but still cute, Bible themed obstacle, rounded base, solid dark navy background 0A0A1A, game sprite, front view, isolated single object centered, Pixar style" --output public/sprites/light-snake/thorn.png
```

Generate 10 BBB sprites (paddle, ball, brick-clay, brick-stone, brick-gold, powerup-wide, powerup-multi, powerup-slow, heart, star). Same pattern, prompts in audit synthesis output.

### 3. Browser QA
```bash
cd /c/Users/rodge/projects/firmware-foundation-studios && npm run dev
```
- Play Light Snake end-to-end (splash, onboarding, gameplay, game over, stats)
- Play Bible Brick Breaker end-to-end
- Check sound works on both
- Check purchase store / free play gate
- Test on mobile viewport

### 4. Phase 0 Remaining
- CJ: sign up at gamelabstudio.co for GameLabs API key (20 free credits)
- Clone Sprite Lab: git clone https://github.com/boona13/sprite-lab.git
- Install OpusGameLabs: npx skills add playableintelligence/game-creator

### 5. Phase 3.4 Visual World Tiles (needs GameLabs)
- Ark Hopper: grass tile, water tile, dirt path tile
- Noah Animal Match: warm wooden table texture
- Manna Catch: desert wilderness tile

### 6. Phase 5: App Store Prep (future)
- Capacitor wrapper for iOS/Android native shell
- Apple Developer account ($99/yr)
- Screenshots at iPhone 15 Pro resolution
- App Store metadata per game

---

## Key Files

- Project: C:\Users\rodge\projects\firmware-foundation-studios
- .env: AIML_API_KEY configured
- Reve script: scripts/reve-generate.ts
- Wiki: wiki/pages/ (this file + phase0-tool-setup.md + elite-upgrade-plan.md)
- Build: npm run dev (Vite), npx tsc --noEmit (type check)
- 6 games total: Gosple, Manna Catch, Noah Animal Match, Ark Hopper, Light Snake, Bible Brick Breaker
