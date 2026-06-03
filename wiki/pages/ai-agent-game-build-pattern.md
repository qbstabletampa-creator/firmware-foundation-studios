# AI Agent Game Build Pattern

**Summary:** Capture from Om Patel's X post about Jonny Gravity's AI built browser MOBA, LMAO. The useful point for Firmware Foundation Studios is not the hype. It is the build pattern: use AI agents like a small game studio, divide the game into systems and characters, generate placeholder art fast, keep IP clean, and turn prototypes into reusable factory lessons.
**Last Updated:** 2026-06-03
**Sources:** https://x.com/om_patel5/status/2062009696098083002?s=46&t=Ox-PkSy3jbzjSpZ1EUETsw, https://lmaomoba.com
**Related:** [[app-factory-strategy]], [[sprite-system-build]], [[game-build-order]]

---

## Notes

Om Patel's post breaks down a viral AI game build: LMAO, a browser based League of Legends style MOBA made by Jonny Gravity. The reported stack was TypeScript, React, Canvas, and PartyKit, with Claude Opus 4.8 handling large parts of the build through multi agent workflows.

The official site shows this is not just a mockup. It has a playable browser game, multiplayer rooms, bots, champion roster, fog of war, objectives, spells, a shop system, and no account or download gate.

Important build pattern:

- Treat the model like a small dev team, not a single prompt box.
- Give subagents narrow ownership, such as one champion, one system, one animation set, one bug class.
- Generate art and animation placeholders fast, then replace or polish later.
- Use a browser friendly stack for fast sharing and testing.
- Build bots early so the game can be played solo before a real player base exists.
- Keep names, characters, and visual identity original to avoid IP problems.

## Why It Matters

Firmware Foundation Studios is already moving toward an app factory: many small Christian kids games, one reusable shell, faster launches after the first game.

This capture supports that direction. The lesson is not to copy a MOBA. The lesson is to run agent builds in lanes:

- core mechanic
- art pack
- scene polish
- bot or solo play
- menu and onboarding
- sound and feedback
- testing and bug passes

That maps directly to Gosple, Ark Hopper, Noah Animal Match, and Manna Catch.

## Connections

- [[app-factory-strategy]]: proves why a reusable game factory matters.
- [[sprite-system-build]]: validates current sprite map and placeholder to polished asset workflow.
- [[game-build-order]]: future arcade games should be built as small agent lane builds, not one giant vague prompt.

## Possible Uses

- Create an FFS agent workflow template for each new game.
- Add bot or solo play thinking earlier for arcade games.
- Use placeholder assets to prove the game loop, then swap in ChatGPT claymation sprites.
- Keep a strict IP clean checklist before any public launch.

## Open Questions

- Should the next FFS build use a formal multi agent workflow with lanes for mechanic, assets, UI, testing, and release?
- Which game is the best pilot for this pattern after Gosple and the current arcade prototypes?
