# Session Pickup — June 4, 2026

> **UPDATE (June 4 evening — resolved):** Playwright MCP fixed and verified (all 8 agent browsers connected). Runtime visual audit done. Visual upgrade pass shipped: Light Snake sprites fixed (rembg) + AI night world; BBB AI temple world; Noah AI ark world + warmed cards (gameplay verified working); Ark Hopper AI lane textures; Manna confirmed working (kept animated bg). Dev/test mode added (all games free on dev server). See `visual-upgrade-pipeline.md`. **Still open:** the stats-not-saved bug below (Pattern 1) is NOT yet fixed.

Handoff note so we can resume after a session restart (restart is needed to fix Playwright MCP — see below).

## Where we are
CJ wanted to: audit the FFS games for errors, then test/improve them on his phone. Two things got established this session:

1. **Reality check on Expo Go.** FFS is NOT an Expo app anymore — it pivoted (June 1) to a web-first Vite + React + Phaser monorepo. Old Expo apps are dead in `archive/apps/`. So Expo Go can't run the current games. The goal behind it (test on phone, no wasted builds) is already solved better: these are web games, just open the dev URL on the phone. See `phone-testing-workflow.md`.

2. **Phone testing is wired up.** `vite.config.ts` now has `server: { host: true, port: 5173 }`. Phone URLs: `http://192.168.68.50:5173` (same Wi-Fi) or `http://100.103.56.38:5173` (Tailscale, stable). `npm run dev` from the repo root.

## Build/test status
- `npx tsc -b` → clean, 0 errors.
- `npx vitest run` → failures are NOISE from the `archive/` folder (old Expo tsconfig extends `expo/tsconfig.base` which isn't installed). Only 1 real failure, in the archived verses package. Live games are fine at type level. The "errors on the app" are RUNTIME, not build.

## THE AUDIT — 6 games, code-level (static). 7 critical, 11 high, 5 medium.
Engines are solid. Damage is in the screen-wiring layer (React components connecting games to stores/routes). Shallow, repetitive, fast to fix. Three copy-paste patterns cause most of it:

### Pattern 1 — Progression broken: stats/badges never save (CRITICAL ×3)
`complete` event handler only records free-play + navigates; never calls store `recordGame()`. Scores/combos/levels/streaks/badges stay 0.
- Manna Catch — `src/screens/MannaCatchGameScreen.tsx:45-48`
- Noah Animal Match — `src/screens/NoahAnimalMatchGameScreen.tsx:45-48` (also the scene's `complete` emit at `NoahAnimalMatchScene.ts:1509-1513` is missing fields: matches, time, perfect)
- Ark Hopper — `src/screens/ArkHopperGameScreen.tsx:41-43`
- ✅ Gosple, Light Snake, Bible Brick Breaker do it right — copy their pattern.

### Pattern 2 — Paywall open: `canPlay` hardcoded `true` (CRITICAL + HIGH)
Unlimited free plays, purchase never required. Fix: `const canPlay = purchased || canPlayXxxFree();`
- Gosple — `src/screens/GospleScreen.tsx:26` (critical)
- Manna Catch — `src/screens/MannaCatchGameScreen.tsx:31` (high)

### Pattern 3 — "More" menu links to wrong game (HIGH ×2+)
About/Privacy/Giveback hardcoded to `/gosple/...` instead of own routes.
- Light Snake — `src/screens/LightSnakeMoreScreen.tsx:11-13`
- Bible Brick Breaker — `src/screens/BibleBrickBreakerMoreScreen.tsx:11-13`
- CHECK Noah + Ark More screens for same copy-paste.

### Per-game specifics
| Game | Crit | High | Med | Standout |
|---|---|---|---|---|
| Gosple | 1 | 2 | 2 | Paywall open; daily-puzzle timezone bug (`GameScene.ts:31-33` puzzle pick vs UTC streak tracking in stores disagree across midnight); tile null access `GameScene.ts:189,206,226` |
| Manna Catch | 2 | 2 | 0 | Stats not saved; paywall open; `/play` unprotected `App.tsx:105` (profile may be uninitialized → crash); spawn crash if item pool empty `spawnEngine.ts:33-43` |
| Noah Animal Match | 1 | 2 | 0 | Stats not saved; incomplete complete-event; cursor OOB after last match `NoahAnimalMatchScene.ts:346-372` |
| Ark Hopper | 2 | 1 | 2 | Stats not saved; free play consumed on early back-out `ArkHopperGameScreen.tsx:41-42`; star hitbox 2× obstacle hitbox `collisionEngine.ts:120-122`; respawn-into-flood edge `gameEngine.ts:638-649` |
| Light Snake | 1 | 1 | 0 | `SPRITE_MAP['lantern'/'light-trail'/'thorn'].emoji` no optional chaining → crash `LightSnakeScene.ts:287,328,429`; More-menu wrong routes |
| Bible Brick Breaker | 0 | 3 | 1 | Cleanest. 3 badges never unlock (store missing `totalPowerUpsCaught`, `totalStoneBricksBroken`, `completedLevelWithoutLosingLife` — `bibleBrickBreakerStore.ts` vs `badges.ts:49,77,105`); More-menu wrong routes; dead `charIdx` in `gameEngine.ts:522-574` (word-reveal heuristic may be unreliable) |

### Suggested fix order
1. Stats wiring (3 games) — restores progression/badges
2. Paywall (2 games) — stops revenue leak
3. More-menu routes (2+ games)
4. Light Snake sprite crash guard
5. Game-specific: Gosple timezone, Ark Hopper early-exit + hitbox, Noah cursor, BBB badge fields

## PLAYWRIGHT — why it failed, how to fix
9 Playwright MCP servers registered at user scope as legacy **SSE** (`http://localhost:320X/sse`).
- Processes ARE alive (ports 3200-3208 listening); `/sse` responds healthy to curl.
- But Claude's MCP health check fails ALL 9 ("Failed to connect"), so zero Playwright tools loaded → audit had to be code-only.
- Cause: legacy SSE transport (modern `/mcp` streamable endpoint returns 400 on these) + MCP servers only attach at session start, so a stale startup handshake stays failed all session.
- `~/.claude.json` also has a separate stdio `playwright` entry (`npx @playwright/mcp@latest --port 3200`).
- **DO NOT TOUCH port 3200** — that's CJ's personal browser (hard rule).
- **FIX APPLIED June 4 (pending restart verify):** Converted the 8 agent instances in `C:\WINDOWS\System32\.mcp.json` from `type:http`/`/sse` → stdio `npx -y @playwright/mcp@latest --isolated --headless`. Backup at `C:\Users\rodge\.claude.json.bak-2026-06-04-playwright` (note: the 8 SSE entries were actually in System32\.mcp.json, not .claude.json; the .claude.json entry is just the personal stdio 3200). Flags verified valid. Browser binaries already present (old SSE procs were running @playwright/mcp fine). Personal stdio `playwright` (port 3200) left untouched.
- **NEXT (after restart):** run `claude mcp list` → expect `playwright-testing-N: ✓ Connected`. If Claude prompts to approve the changed .mcp.json servers on startup, approve them. If still failing, the old SSE server processes (PIDs on 3201-3208) may be holding ports — but stdio doesn't use ports, so they're harmless; can be killed (NOT 3200).

## NEXT STEPS (resume here)
1. Fix Playwright (restart session; verify `claude mcp list` shows playwright-testing-N connected).
2. Run the VISUAL audit — drive each game's `/play` route in a real browser (use playwright-testing-N, ports 3201-3204), capture console errors + screenshots, confirm which static findings actually bite.
3. Then fix bugs in order above. All work on this repo; test on phone via dev URL.

## Routes reference (src/App.tsx)
Each game: `/<game>` (listing), `/<game>/app` (splash), `/onboarding`, `/home`*, `/play`, `/stats`*, `/more`*, `/settings`* (* = ProtectedRoute, redirects to `/<game>/onboarding`). Games: gosple, manna-catch, noah-animal-match, ark-hopper, light-snake, bible-brick-breaker. Note most `/play` routes render directly (not protected).
