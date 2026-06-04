# Gameplay Audit - June 3, 2026

**Summary:** Full gameplay audit of all 4 FFS games. 6-agent workflow (469K tokens, 248 tool calls). Found and fixed 8 critical, 16 major, 20 minor issues. Deployed same day.
**Last Updated:** 2026-06-03
**Sources:** 6-agent audit workflow, manual browser testing, commit e47c828
**Related:** [[sprite-system-build]], [[game-build-order]], [[ai-agent-game-build-pattern]]

---

## Audit Scope

All 4 released games audited for:
- Sprite transparency and rendering issues
- Gameplay-breaking bugs (crashes, infinite loops, dead UI)
- Race conditions and state management
- Performance (frame rate, memory, browser crashes)
- Visual polish (HUD readability, animations, hitboxes)
- Level progression and difficulty balance

## Critical Fixes (8)

### All Games
1. **Sprite transparency broken on 46/47 PNGs.** Gemini returned RGB with opaque backgrounds instead of transparent. Built flood-fill background removal script, resized all to 256x256. Every sprite in every game was affected.

### Noah Animal Match
2. **"View Results" button dead after Level 5.** Handler didn't destroy the overlay or call showGameComplete(). Players hit a wall after beating the game.

### Ark Hopper
3. **Infinite death loop on flooded rows.** Player respawned into already-flooded rows and immediately died again forever. Fixed findRespawnRow to search from floodedRows+2.
4. **Double flood-kill (2 lives lost per death).** Duplicate flood check in tick() drained lives twice per frame. Removed the duplicate.

### Manna Catch
5. **Game over + level complete race condition.** Both could fire on the same frame. Moved game over check before level completion so they can't collide.
6. **Power-up stacking bug.** Duplicate check used local array instead of current state, so the same power-up could stack infinitely. Fixed to read from live state.
7. **Browser crash from basket redraw.** Basket graphics redrawn every frame at 60fps with no guard. Added width cache so it only redraws when size actually changes.

### Homepage
8. **Missing game icons for Ark Hopper and Noah Match.** Homepage cards showed broken images. Generated icons from existing sprites.

## Major Fixes (16)

### Ark Hopper (4)
- **Momentum score inflation.** Score awarded on every hop instead of only on tier-crossing hops. Fixed to tier-crossing only.
- **Player sprite desync after respawn.** Sprite position didn't update on respawn because the else branch was missing. Added it.
- **Water platform detection padding.** Player fell through logs/lily pads at the edges. Widened collision padding.
- **Tween conflicts on rapid death.** Dying twice quickly stacked tweens and corrupted animation state. Added tween cleanup on death.

### Noah Animal Match (4)
- **HUD text unreadable.** Dark text on cream background. Switched to high-contrast dark colors.
- **Keyboard listener accumulation on restart.** Every restart added another keyboard listener without removing the old one. Memory leak, ghost inputs.
- **Overlay/tween leak on restart.** Overlays and tweens from previous rounds not destroyed. Accumulated over multiple plays.
- **Mismatch combo state.** Combo counter didn't reset on mismatch, inflating scores.

### Manna Catch (8)
- **Frame-rate dependent LERP.** Item movement tied to frame count instead of elapsed time. Game ran faster on high refresh rate screens. Fixed to time-based delta.
- **Speed ramp using total time.** Difficulty scaled based on total play time across all levels instead of per-level time. Level 1 replay was as hard as level 5. Fixed to per-level.
- **Slow-mo tint destroyed on wrong power-up.** Activating Wide Basket or Magnet killed the blue slow-mo screen tint early.
- **Overlay double-alpha.** Semi-transparent overlays rendered twice, making them nearly opaque.
- **Item spawn overlap.** Multiple items could spawn at the exact same X position on the same frame. Added minimum spacing.
- **Level 5+ exponential scaling.** Difficulty curve went exponential after level 5, making it unplayable. Changed to linear scaling.
- **Star pickup radius too small.** Stars required pixel-perfect collision. Unified to a more forgiving radius.
- **Collision hitbox inconsistency.** Good items and bad items used different hitbox sizes. Unified across all item types.

## Minor Fixes (20)

- Redundant error suppression removed from 3 scenes (was hiding real bugs)
- Dead code bounds check removed
- Star pickup radius unified across games
- Collision hitbox consistency pass
- Combo state reset fixes
- Various animation cleanup on scene transitions

## What the Audit Did NOT Cover

- Sound system (no sound implemented in any game yet)
- Badge system wiring (badges are built but not connected to gameplay triggers)
- Background tile art (procedural environments only, no sprite-based tiles yet)
- Game icons (basic sprite-on-color, not proper 512x512 composed scenes)
- Ark Hopper dead code: olive branch collectible, dying/paused phases defined but unused
- Level 20+ difficulty tuning (only tested through ~level 10)
- Accessibility (no screen reader support, no colorblind mode, no reduced motion)
- PWA offline behavior
- Stripe payment flow (paywalls exist but are bypassed with canPlay=true)

## Deploy

- 161 files committed, 16,820 lines changed
- Commit: e47c828 on main
- Deployed to Cloudflare Pages via wrangler CLI
- Live at firmwarefoundation.com
- All 4 games set to free (canPlay = true, price = "Free")

## Next Priorities (from audit gaps)

1. Visual polish: proper 2D world layouts, lane rendering with sprite tiles for Ark Hopper
2. Game icons: real 512x512 composed scenes, not basic sprite-on-color
3. Background tiles: sky, water, grass tileable sets (Batch 5 in docs/sprite-prompts.md)
4. Sound system across all games
5. Wire badge systems into gameplay triggers
6. Level 20+ difficulty tuning for Ark Hopper
