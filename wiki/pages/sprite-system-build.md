# Sprite System Build
**Summary:** Complete sprite loading infrastructure, scene refactors, and environment polish for all 3 games (Ark Hopper, Noah Animal Match, Manna Catch).
**Last Updated:** 2026-06-03
**Sources:** CJ art direction decision, Leonardo.AI + ChatGPT style tests, 7-agent workflow build.
**Related:** [[studio-decisions]], [[game-build-order]]

---

## Art Direction Decision

CJ tested both Leonardo.AI and ChatGPT for claymation game sprites. ChatGPT won:
- Better wool/fur texture detail, reads clearly at small sizes
- More "animal" proportions (Leonardo's were too humanoid)
- Transparent PNG backgrounds work natively with "transparent background, PNG" in prompt
- Leonardo.AI free tier (150 credits/day) is viable but ChatGPT output was higher quality

**Locked style:** Soft 3D claymation, Pixar-like, rounded shapes, warm lighting, gentle shadows. All sprites 512x512 transparent PNG.

**Base prompt template:**
```
soft 3D claymation [SUBJECT], [DESCRIPTION], Pixar style, smooth clay texture, warm studio lighting, soft shadows, game sprite, centered, isolated subject, transparent background, PNG
```

## Sprite System Architecture

### Shared Helper (src/utils/spriteHelper.ts)
- `GameSprite` type = `Phaser.GameObjects.Image | Phaser.GameObjects.Text`
- `preloadSprites(scene, spriteMap)` loads all PNGs, silently skips missing files
- `createGameSprite(scene, x, y, key, fallbackEmoji, w, h)` creates Image if texture exists, falls back to emoji Text if not
- `setSpriteSize()` and `setSpritePosition()` helpers for the union type

### Sprite Maps (one per game)
- `src/games/arkHopper/spriteMap.ts` (25 entries)
- `src/games/noahAnimalMatch/spriteMap.ts` (19 entries including card-back)
- `src/games/mannaCatch/spriteMap.ts` (14 entries)

Shared sprites (animals common to multiple games) point to `sprites/shared/`. Game-specific sprites point to `sprites/[game-name]/`.

### Sprite Directories
```
public/sprites/
  ark-hopper/      -- obstacles, platforms, ark, effects, decorations
  noah-animal-match/ -- card-back, game-specific animals
  manna-catch/     -- food items, bad items, power-ups, basket
  shared/          -- animals used across multiple games (lamb, dove, lion, etc.)
```

## Scene Refactors

### Ark Hopper (ArkHopperScene.ts)
- Player, lane items (obstacles/platforms), stars, ark goal all use `createGameSprite()`
- `ITEM_TYPE_TO_SPRITE_KEY` lookup converts engine camelCase to kebab-case sprite keys
- `spriteKeyForAnimal()` maps level animal names to sprite keys
- All hop/squash/stretch tween animations work with both Image and Text
- HUD elements remain as Text (score, lives, level, momentum)

### Noah Animal Match (NoahAnimalMatchScene.ts)
- Card faces use `createGameSprite()` with animal name as key
- Card backs use `card-back` sprite key
- `setCardVisual()` destroys old sprite and creates new one (needed for flip animation)
- Flip tweens re-read sprite reference after visual swap

### Manna Catch (MannaCatchScene.ts + renderItems.ts + renderBasket.ts)
- Falling items in `renderItems.ts` use `createGameSprite()` with item type as key
- Basket in `renderBasket.ts` has dual path: sprite basket vs procedural graphics basket
- Power-up activation icons use `createGameSprite()`

## Environment Effects (Procedural, No External Art)

### Ark Hopper
1. **Gradient sky** at DEPTH_BG - 1, sky blue to warm peach
2. **4 animated clouds** (white circle groups, parallax speeds, wrap-around)
3. **Water shimmer** (thin white lines sliding across water lanes)
4. **Grass detail** (small green triangles on grass/start lanes)
5. **Goal glow** (concentric gold circles behind ark, pulsing scale tween)

### Noah Animal Match
1. **Warm gradient** background (cream to sage green)
2. **Golden particles** (6-8 small dots drifting down, respawn at top)
3. **Wooden frame** border (brown rounded rect, board game feel)

## Sprite Generation Progress

ALL game sprites complete (47 total). Only icons and background tiles remain.

| Category | Count | Source | Status |
|----------|-------|--------|--------|
| Shared animals | 12 | ChatGPT (5) + Gemini (7) | Complete |
| Ark Hopper | 14 | ChatGPT (3) + Gemini (11) | Complete |
| Noah Animal Match | 9 | Gemini | Complete |
| Manna Catch | 14 | ChatGPT (1) + Gemini (13) | Complete |
| Game icons (512x512) | 0/3 | Not started | Needed |
| Background tiles | 0/3 | Not started | Needed |

Full prompt sheet: `docs/sprite-prompts.md` in project root.
Batch generation script: `scripts/generate-sprites.py`.

## Image Generation Tools

### HuggingFace FLUX (RETIRED for this project)
- MCP server `mcp-hfspace` configured with FLUX.1-schnell
- Free tier GPU queue too congested, tool hangs at 5%
- `api-inference.huggingface.co` DNS does not resolve on CJ's machine
- HF Spaces domain (`*.hf.space`) resolves fine but queue is still the bottleneck

### Gemini REST API Direct (ACTIVE, PROVEN)
- Model: `gemini-2.5-flash-image` (free tier, hundreds of images/day)
- Key: `GEMINI_API_KEY` in `~/.claude/settings.json` env block and `~/.env.integrations`
- Batch script: `scripts/generate-sprites.py` (38 sprites in one run, 0 failures after retry)
- Plugin `media-pipeline@media-pipeline-marketplace` is installed but MCP server doesn't connect. Skip the plugin, use REST API directly via curl or the Python script.

## Build Status

- TypeScript: 0 errors
- Vite build: clean (13s, 2.3MB bundle)
- All games functional with emoji fallback
- 7-agent workflow, 4 phases, ~7 minutes total

## How to Add Sprites

1. Generate PNG via Gemini REST API (see `scripts/generate-sprites.py` for pattern) or ChatGPT
2. Save as `[name].png` (kebab-case, matching sprite map keys)
3. Drop into the correct `public/sprites/` subdirectory
4. Refresh game. Sprite auto-replaces emoji. No code changes needed.

## Critical Path Fix (June 3)

Sprite map paths must be absolute (start with `/`). Relative paths like `sprites/shared/lamb.png` resolve wrong from nested routes (e.g., `/ark-hopper/play/sprites/...` returns index.html). All three sprite maps were updated to use `/sprites/` prefix.

## Pricing Status

All 4 games set to Free (June 3). `gameCatalog.ts` price field = "Free". `canPlay = true` in all game screens. Paywall UI still exists in code but is unreachable.
