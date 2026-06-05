# Visual Upgrade Pipeline (FFS games)

Last updated: June 4, 2026 (evening session)

How we made the games look good, and the state of each game's art.

## The two problems we found
1. **Sprite transparency/sizing.** Some Reve-generated sprites exported on solid backgrounds (no alpha) at wrong dimensions, so they showed as colored boxes in-game. Worst: Light Snake (6 sprites, solid navy, 1248x832). Bible Brick Breaker had 10 RGB/oversized too but draws bricks/paddle/ball as graphics primitives, so it looked fine anyway.
2. **Flat backgrounds.** Game worlds were solid colors or code-drawn gradients. The art assets themselves (soft-3D storybook) were already good; the worlds around them were bare.

## The fix pipeline
- **Background removal / resize:** `rembg` (Python, `pip install rembg onnxruntime`, u2net model auto-downloads to `~/.u2net/`). Cut to alpha, crop to content bbox, center on 256x256 transparent canvas with ~12px pad. Handles soft shadows/glow that naive chroma-key can't (e.g. the glowing lantern).
- **World/texture generation:** `scripts/reve-generate.ts` (Reve via AIML, `reve/create-image`, 1:1, ~$0.04/image). `--type bg`. Rate limit is 100/min — don't fire more than ~2-3 parallel gens or you get `PARTNER_API_TOKEN_RATE_LIMIT_EXCEEDED` (500).
- **Wiring pattern (single-bg games):** preload `this.load.image('bg-world', '/sprites/<game>/bg-world.png')`, then in the scene's background builder use the image if `this.textures.exists('bg-world')`, else fall back to the original gradient. Cover-fit: `scale = Math.max(W/bg.width, H/bg.height)`.
- **Wiring pattern (lane-based, Ark Hopper):** tiled textures via `this.add.tileSprite(...).setTileScale(0.2, 0.2)`, keyed by lane type (`LANE_TEXTURES` map), with flat-color fallback.

## Per-game state
| Game | Sprites | World | Notes |
|---|---|---|---|
| Light Snake | Fixed (rembg, transparent 256) | `bg-night.png` night sky | Done |
| Bible Brick Breaker | RGB/oversized but drawn as graphics (cosmetic only) | `bg-world.png` starry temple | Done |
| Noah Animal Match | OK | `bg-world.png` ark interior | Card colors warmed (0x6b4a2f) to match wood. Gameplay verified working. |
| Ark Hopper | OK (render small, left alone to avoid hitbox regressions) | `tex-grass/water/path.png` tiled lanes | Sky lane still gradient |
| Manna Catch | OK | Kept animated procedural heavenly-light bg (`renderBackground.ts`) | `bg-world.png` desert dawn generated, available as alt |
| Gosple | Clean | Minimal (unchanged) | No work needed |

## Test mode
`src/stores/purchaseStore.ts` — `TEST_MODE = import.meta.env.DEV || localStorage 'ffs-test-mode'==='on'`. Every `canPlay*Free()` returns true under TEST_MODE. So all games are free on the dev server (`npm run dev`), paywall intact in production builds. Phone testing: `http://192.168.68.50:5173` (same Wi-Fi) or Tailscale `http://100.103.56.38:5173`.

## Backups & cost
- Originals backed up at `.sprite-backups/light-snake-2026-06-04/`.
- AIML spend this session: ~$0.24 (6 successful generations).

## Known open bug (not visual)
Stats-not-saved at game end (Pattern 1 from the static code audit) still affects Noah, Manna Catch, Ark Hopper — `complete` handler never calls store `recordGame()`. Non-crashing; progression/badges stay 0. See `session-pickup-june-4-2026.md` for the full bug list.
