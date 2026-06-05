# Vibe Fighter AI Game Build Capture

**Summary:** Shaun Yu shared a 19 minute tutorial for Vibe Fighter, a Street Fighter style browser fighting game built with AI generated code, sprites, animations, UI, and gameplay logic. The reusable lesson for Firmware Foundation Studios is the build method: do not ask AI for the whole game at once. Build concept art, sprite pipelines, a character gym, a mechanics playground, JSON tuned parameters, then wire the real game.
**Last Updated:** 2026-06-05
**Sources:** https://x.com/chongdashu/status/2062910713245667456?s=46&t=Ox-PkSy3jbzjSpZ1EUETsw, https://www.youtube.com/watch?v=en37mtF42eQ, https://www.vibegamedev.com/vibe-fighter-resources
**Related:** [[ai-agent-game-build-pattern]], [[visual-upgrade-pipeline]], [[app-factory-strategy]], [[elite-upgrade-plan]]

---

## Notes

Post by @chongdashu:

- VIBE FIGHTER is a Street Fighter style clone built with AI.
- Tools named: Cursor with Opus 4.8, GPT Image 2.0, Grok Imagine, and Codex for asset work.
- The video covers light hits, heavy hits, blocking, specials, UI, source code, prompts, and resources.
- Resource page offers sample project, fighter sprite assets, portraits, UI atlas, and Codex plus Cursor prompts.

Video workflow pulled from transcript:

1. Start with the game type and architecture, not the full final game prompt.
2. Generate concept art and mockups for the scene and characters.
3. Use an anchor image to keep character style consistent.
4. Generate animations for idle, walk, attacks, block, hit, jump, knockdown, and specials.
5. Use Grok Imagine to create animation video, then extract frames into sprite sheets.
6. Create a Character Gym before the game.
7. Create a Playground before the game.
8. Save tuned movement, scale, speed, and combat values into JSON config.
9. Build the actual combat loop after the gym and playground prove the pieces work.
10. Add UI polish: portraits, health bars, timer, energy meter, special effects, rounds, and AI opponent.

## Why It Matters

This is more useful than the final fighting game itself.

The big FFS takeaway is the intermediate tools:

- Character Gym: inspect animations, slow them down, pause frames, draw collision boxes, attack boxes, and guard boxes.
- Playground: tune speed, scale, timing, bounds, movement feel, and export JSON before wiring the real game.
- JSON config: lets the game load tuned values instead of hardcoding feel into scattered code.

That solves a real FFS problem. Games can compile and still feel wrong. The gym and playground give agents a controlled place to see and tune feel before shipping.

## Connections

- Visual Upgrade Pipeline: this extends art cleanup into animation testing and sprite sheet QA.
- AI Agent Game Build Pattern: same rule, build tools and test rigs first instead of one giant agent prompt.
- Elite Upgrade Plan: FFS already has reusable shared infrastructure. A gym or playground could become the next shared QA layer.
- Native Build Readiness: tuned JSON configs help keep browser, PWA, and Capacitor builds consistent.

## Possible Uses

- Build a small FFS Sprite Gym for one game first, probably Light Snake or Bible Brick Breaker.
- Add debug overlays for sprite bounds, collision boxes, pickup boxes, and danger zones.
- Add a tuning playground for speed, gravity, spawn rate, jump strength, hitbox size, and score pacing.
- Save per game tuning values into JSON or TypeScript config files instead of burying them in scene code.
- Use the tutorial as an AI Gameplan lesson: good AI builders make test rigs, not just final outputs.

## Guardrails

- Do not copy Street Fighter, Jujutsu, character likenesses, names, moves, or protected style.
- Borrow the workflow only: concept, sprite pipeline, gym, playground, JSON config, then game.
- Sandbox before adding this to the live FFS pipeline.
- Verify the resource license before using any downloaded assets.

## Open Questions

- Should FFS create one shared Sprite Gym route under `/dev` for all games?
- Should agents be required to create a playground before building any new game mechanic?
- Which current bug class would this catch fastest: sprite alignment, collision feel, mobile controls, or animation timing?
