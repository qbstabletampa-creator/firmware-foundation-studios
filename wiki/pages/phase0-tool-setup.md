# Phase 0: Tool Installation and Evaluation

**Summary:** Art pipeline tools researched and partially configured. AIML API key live, Reve confirmed as primary sprite model. GameLabs and Sprite Lab ready to install.
**Last Updated:** 2026-06-04
**Sources:** Scout research, AIML API docs, GameLabs docs, GitHub repos
**Related:** [[elite-upgrade-plan]], [[sprite-system-build]]

---

## AIML API (Reve Image Generation) -- CONFIGURED

- Account: aimlapi.com, $20 credit loaded
- API key in `.env` at project root (AIML_API_KEY)
- Models: `reve/create-image` ($0.031/gen), `reve/edit-image` ($0.052/gen)
- Script: `scripts/reve-generate.ts` (complete, tested, works)
- Quality: Confirmed excellent for claymation style. Light Snake icon and 5 game sprites generated successfully.
- Run: `npx tsx scripts/reve-generate.ts --type icon --game GAME --prompt "..." --output PATH`

## GameLabs Studio MCP -- RESEARCHED, NOT INSTALLED

- Purpose: Seamless tileable textures, sprite sheets, animations, chroma key transparency
- Setup: Sign up at gamelabstudio.co (20 free credits, no card)
- MCP config (add to settings after getting key):
  ```
  claude mcp add --transport sse gamelab-mcp http://api.gamelabstudio.co:8765/sse --header "X-API-Key: YOUR_KEY"
  ```
- Note: SSE transport may be deprecated in favor of streamable HTTP. Try `"type": "http"` if SSE fails.
- Blocker: CJ needs to sign up for API key.

## Sprite Lab -- RESEARCHED, NOT INSTALLED

- Purpose: Browser-based background removal + spritesheet slicing. No AI, deterministic pixel processing.
- Repo: https://github.com/boona13/sprite-lab
- Install: `git clone`, `npm install`, `npm run dev` (opens at localhost:5173)
- Use: Post-process Reve/GameLabs output. Strip backgrounds, clean edges, slice sheets.

## OpusGameLabs game-creator -- RESEARCHED, NOT INSTALLED

- Purpose: Full game scaffolding plugin for Claude Code (Phaser 3 + Three.js)
- Install: `npx skills add playableintelligence/game-creator`
- Note: Generates code-only pixel art, NOT production sprites. Good for prototyping new games, not art pipeline.

## Phaser 4 Evaluation -- DECIDED

- Decision: Stay on Phaser 3.87
- Reason: Phaser 4 still beta, our games use zero deprecated 3.x APIs, migration cost high for zero user value
- Revisit: When Phaser 4 hits stable and offers features we actually need

## Other AIML Models Available

Best alternatives to Reve if needed:
- FLUX.1 dev ($0.033/gen) -- good all-rounder for sprites
- Recraft V3 ($0.052/gen) -- best for icons and illustrations
- FLUX.2 pro ($0.039/megapixel) -- highest quality ceiling
- Seedream 4 ($0.032/gen) -- sleeper pick for cartoon style

No AIML model outputs true alpha PNGs. Transparency pipeline: generate on solid dark bg + rembg or Sprite Lab for cleanup.
