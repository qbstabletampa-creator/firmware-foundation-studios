# Roblox Studio MCP Game Build Capture

**Summary:** AzFlin shared a first pass through Roblox's core curriculum 3D platformer tutorial, then pointed out the bigger signal: Roblox Studio is already accessible, and official Roblox MCP control inside Claude Code can directly read and write to the standalone studio app. For FFS, the useful pattern is not moving to Roblox by default. It is treating no code and low code studios as faster prototype labs, especially when an agent can automate tedious object creation and scene setup.
**Last Updated:** 2026-06-05
**Sources:** https://x.com/azflin/status/2062912406175863071?s=46&t=Ox-PkSy3jbzjSpZ1EUETsw
**Related:** [[app-factory-strategy]], [[ai-agent-game-build-pattern]], [[vibe-fighter-ai-game-build-capture]], [[sorceress-ai-game-creation-suite-capture]], [[native-build-readiness]]

---

## Notes

Capture type: Reference, Pattern, Project context.

AzFlin completed Roblox's core curriculum 3D platformer tutorial. It was his first time in a game engine studio. He noticed that Roblox Studio's file system style GUI, drag in objects, and scene hierarchy felt different from writing everything in code.

He did most of the tutorial manually to understand the concepts. For tedious parts, he used the official Roblox MCP inside Claude Code. Example: one step required creating 17 platforms, and the MCP could create them quickly.

The key technical point: Roblox Studio is a standalone app, and the MCP can directly read and write to it. That means agent assisted game creation can move from code only work into live engine manipulation.

The attached video shows a simple 3D platformer: crowned Roblox avatar, green floating platforms over ocean, spinning coins, jump power upgrades, and bright third person gameplay. It is a basic progression loop, but it gets to playable fast.

He also notes that simple tycoon, idle grind, and progression games like Slime RNG and Ring Farm Simulator can hit around 100k concurrent users on Roblox. The lesson is that simple loops can win if progression and replay are strong.

## Why It Matters

FFS is building small Christian kids games, not Roblox experiences right now. Still, this is a strong signal for CJ's app factory thinking:

- Agent controlled game editors can speed up scene setup, asset placement, repeated level objects, and prototype iteration.
- Simple progression loops can outperform overbuilt game concepts.
- First playable matters. A basic platformer with coins and upgrades teaches more than a beautiful spec sitting in a doc.
- Roblox may be a sandbox lane for testing kid friendly mechanics before building a polished standalone PWA or mobile app.

## Connections

- [[app-factory-strategy]]: supports the many small games, fast prototype, scale winners model.
- [[ai-agent-game-build-pattern]]: same principle of using agents to build playable loops quickly.
- [[vibe-fighter-ai-game-build-capture]]: Vibe Fighter uses Character Gym and Playground first, Roblox Studio can become another sandbox environment.
- [[sorceress-ai-game-creation-suite-capture]]: both point toward visual game creation suites with agent assistance.
- [[native-build-readiness]]: keep FFS final path as Capacitor/PWA unless Roblox is chosen as a separate platform experiment.

## Possible Uses

- Prototype a Christian kids platformer loop in Roblox Studio as a learning sandbox only.
- Study official Roblox MCP for how agents manipulate a visual editor.
- Use the MCP pattern as inspiration for FFS browser editor tools: create platforms, place collectibles, tune level spacing, export JSON.
- Content seed: simple games win when the loop is clear, rewarding, and repeatable.

## Open Questions

- Does official Roblox MCP support enough reliable read/write actions to let an agent build full levels, or is it mainly useful for repetitive object setup?
- Should FFS run one Roblox sandbox test to learn kid game loops, without moving the brand or product strategy there?
- Which FFS games need a simple progression loop: coins, upgrades, streaks, unlocks, or levels?
