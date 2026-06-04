# Phase 4 Build Log: Light Snake

**Date:** 2026-06-04
**Status:** COMPLETE. All code written, compiles clean. Needs browser QA + sprite PNGs.
**Related:** [[phase3-build-log]], [[elite-upgrade-plan]]

---

## Game Files (9 files in src/games/lightSnake/)
- gameEngine.ts - Pure engine: grid, snake movement, food spawning, thorns, collision, scoring, combos
- LightSnakeScene.ts - Full Phaser scene: dark gradient bg, grid, snake rendering (lantern head + light trail), food bob, thorns, HUD, swipe/keyboard input, countdown, verse cards, game over, pause
- phaserConfig.ts - Phaser game config (750x1334, AUTO renderer)
- config.ts - Constants: GRID_COLS=15, GRID_ROWS=20, BASE_MOVE_INTERVAL=300ms
- types.ts - Re-exported types
- verses.ts - 10 Bible verses about light
- spriteMap.ts - 6 sprite mappings with emoji fallbacks
- sounds.ts - LightSnakeSFX mapped to shared sound engine
- badges.ts - 10 badges

## Store
- src/stores/lightSnakeStore.ts - Zustand persist store (highScore, bestCombo, totalGamesPlayed, etc.)

## Screen Files (14 files in src/screens/)
- LightSnakeSplashScreen.tsx - GameSplashScreen wrapper
- LightSnakeOnboardingScreen.tsx - 7-step Macadam GameOnboarding wrapper
- LightSnakeGameScreen.tsx + .module.css - Phaser mount
- LightSnakeHomeScreen.tsx + .module.css - Home with greeting, play button, stats
- LightSnakeStatsScreen.tsx + .module.css - Stats + badges display
- LightSnakeMoreScreen.tsx + .module.css - Nav links
- LightSnakeSettingsScreen.tsx + .module.css - Sound/haptics/notification toggles
- LightSnakeListingScreen.tsx + .module.css - Game catalog card

## Integration
- src/App.tsx - 8 imports + 8 routes added (all /light-snake/* paths)
- src/data/gameCatalog.ts - Light Snake entry added (id: "light-snake", category: "Arcade")
- src/stores/purchaseStore.ts - lightSnake fields added (boolean, lastFreeDate, record/canPlay functions)

## Remaining
1. **Browser QA** - Run dev server, play through end-to-end, verify all screens and gameplay
2. **Sprite PNGs** - Currently using emoji fallbacks. Need claymation PNGs:
   - public/light-snake-icon.png (512x512)
   - public/sprites/light-snake/lantern.png, light-trail.png, bread.png, fish.png, lamp.png, thorn.png

---

## What's Next After Light Snake

### Bible Brick Breaker (Phase 4.3)
- Core mechanic: Paddle bounces ball to break bricks revealing verse letters
- Hook: "Break through to God's Word"
- Same template: engine + scene + 8 screens + sound config + badges + store
- Estimated 2-3 days

### Visual World Polish (Phase 3.4, blocked on art)
- Ark Hopper: sprite tiles for lanes (replace flat colors)
- Noah Animal Match: wooden table texture
- Manna Catch: desert tile under procedural sky

### Reve API Script (Phase 2.4)
- scripts/reve-generate.ts for generating backgrounds and icons
- Needs AIML API key signup
