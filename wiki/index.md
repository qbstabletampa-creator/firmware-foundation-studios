# Firmware Foundation Studios Wiki

**Summary:** Dedicated vault for Firmware Foundation Studios, CJ's separate public Christian kids game studio.
**Last Updated:** 2026-06-10
**Sources:** CJ Telegram planning thread, Christian kids game factory capture, charity research.
**Related:** [[studio-decisions]], [[app-factory-strategy]], [[gosple-product-spec]], [[charity-options]]

---

## Hard Rules (ALL agents, ALL apps)

1. **Use installed autoskills on every task.** 19 skills are installed for Expo, React Native, React, TypeScript, Vitest, mobile design, accessibility, and deployment. Reference the relevant skill before writing code. No excuses.
2. Skills live at `~/.claude/skills/`. Key skills: expo/building-native-ui, expo/expo-deployment, vercel-labs/react-best-practices, antfu/vitest, sleekdotdesign/design-mobile-apps.
3. If a skill exists for the task, use it. If you skip it and the code is wrong, that's on you.

---

## Standards (LOCKED -- every app inherits these)

- [App Shell Standard: Splash + Onboarding](pages/app-shell-standard-splash-onboarding.md) -- CANONICAL. The EXACT splash (full-screen lightRays shader, FFS logo, white italic "Romans 8:28") and onboarding (Joy mascot, cream 3-beat flow, FORCE_ONBOARDING) every FFS game must ship. Do not redesign per game. Matches deployed iOS Gosple.

## Active Build

- [FFS iOS Readiness Audit + Fixes (2026-06-13)](pages/ffs-ios-readiness-2026-06-13.md) -- LATEST. Audit of all 5 games + fix pass on the 4 native apps (branch ffs-ios-readiness, commit aa82ea3). Gosple live build = SDK56, no channel, CANNOT take OTA (needs new build). Noah 3-strikes-per-level + verse-every-level. Arc Hopper + BBB still web-only. PICKUP: ios-preflight, Expo Go publish, merge, build lane, Arc Hopper Opt1 vs Opt2.
- [Elite Upgrade Plan](pages/elite-upgrade-plan.md) -- MASTER PLAN: 6-phase roadmap. Phases 0-4 done (Phase 0 partial), Phase 5 App Store not started.
- [Elite Audit - June 2026](pages/elite-audit-june-2026.md) -- 8-agent audit: 44 bugs (8 critical), 3/4 games silent, 2/4 emoji splash screens, 2/7 onboarding, ~1,660 duplicated lines.
- [Phase 2 Build Log](pages/phase2-build-log.md) -- Shared infrastructure: GameSplashScreen, soundEngine, GameOnboarding, rayShader extraction. ~1,436 duplicated lines eliminated.
- [Phase 3 Build Log](pages/phase3-build-log.md) -- Sound wired into all 4 games, score tweens, button springs. Visual polish blocked on art.
- [Phase 4 Build Log](pages/phase4-build-log.md) -- Light Snake + Bible Brick Breaker complete. 54-bug audit + fix pass. All code compiles clean.
- [Shepherd's Trail Build Log](pages/shepherds-trail-build-log.md) -- per-app log for light-snake. 2026-06-11 polish: GL splash adopted (byte-identical to manna + expo-gl), Gosple how-to-play modal, countdown stray-tap fix, twilight-green-pasture background, stats aligned to canonical format. Monorepo dep-hoist + static-serve gotchas.
- [Session 4 Notes](pages/ffs-elite-upgrade-session-notes.md) -- PICKUP NOTES: Session 4 state, remaining sprites, browser QA needed, iOS/App Store next steps.
- [Phase 0 Tool Setup](pages/phase0-tool-setup.md) -- AIML API configured, GameLabs/Sprite Lab/OpusGameLabs researched, Reve confirmed as primary sprite model.
- [Sprite System Build](pages/sprite-system-build.md) -- Full sprite infrastructure, scene refactors, environment polish. ChatGPT claymation style locked. 47/47 game sprites done, icons + tiles remain.
- [Gameplay Audit - June 2026](pages/gameplay-audit-june-2026.md) -- 6-agent audit of all 4 games. 8 critical, 16 major, 20 minor bugs found and fixed. Deployed June 3.
- [Visual Upgrade Pipeline](pages/visual-upgrade-pipeline.md) -- How we fix sprite alpha (rembg) and generate AI worlds/textures (Reve via AIML). Per-game art state, test mode, backups, costs. Jun 4 evening.
- [Native Build Readiness (App Store ship pipeline)](pages/native-build-readiness.md) -- CANONICAL ship flow for every app: 5 FREE gates (Expo Go, tsc, expo export, ios-preflight, ios-sim-smoke) prove the build before any paid `eas build`, then signing + Apple-review gates. Includes the Kids-category pre-submission checklist. REWRITTEN 2026-06-13 (old Capacitor version superseded).
- [Native Expo Testing + Build (gotchas)](pages/native-expo-testing-and-build.md) -- CHEAT SHEET for the native Expo apps (Manna/Noah/Light Snake/Gosple): Tailscale Expo Go command, monorepo metro config, dev-cert online fetch, EXPO_NO_DEPENDENCY_VALIDATION for the undici crash, EAS 'weak must be mutable' Xcode-image pin. Cost us a full session 6/8.
- [Onboarding Loop Bug](pages/onboarding-loop-bug.md) -- LIVE BLOCKER (Jun 5). Games loop on onboarding for returning users. Root cause + one-line fix documented. Not yet applied.

## Core Pages

- [Studio Decisions](pages/studio-decisions.md) -- locked brand, audience, pricing, platform, content, and art direction.
- [App Factory Strategy](pages/app-factory-strategy.md) -- permanent strategy from the app factory capture: many small standalone apps, 40 plus app portfolio thinking, reusable template, scale winners.
- [Gosple Product Spec](pages/gosple-product-spec.md) -- first app direction for the pure daily Wordle style Bible word game.
- [Charity Options](pages/charity-options.md) -- researched charity candidates for the 10 percent tithe.
- [Game Build Order](pages/game-build-order.md) -- CJ's ranked first wave, second wave, and later world games.
- [Gosple Build Log](pages/gosple-build-log.md) -- running dev log with milestones, decisions, and technical notes.

## Research

- [Christian Roblox Safe Kids Market Scan](pages/christian-roblox-safe-kids-market-scan-2026-06-10.md) - CJ asked whether anyone is building safe Christian Roblox for kids. Market scan found scattered faith adjacent Roblox experiences, but no clean parent trusted ecosystem.
- [Christian App Store Hook Screenshot Growth Format](pages/christian-app-store-hook-screenshot-growth-format.md) -- Adrià Martinez X capture adapted to Firmware Foundation Studios: slide 1 parent or kid hook, slide 2 real app/game screenshot or store listing proof.
- [Roblox Studio MCP Game Build Capture](pages/roblox-studio-mcp-game-build-capture.md) -- AzFlin X capture on completing Roblox core curriculum and using official Roblox MCP in Claude Code to automate tedious Studio work. Useful for FFS prototype labs, agent controlled editors, and simple progression loop thinking.
- [Vibe Fighter AI Game Build Capture](pages/vibe-fighter-ai-game-build-capture.md) -- X and YouTube capture on building a Street Fighter style game with AI. Best FFS takeaway is not the clone, it is the workflow: concept art, sprite pipeline, Character Gym, Playground, JSON tuning, then game.
- [Sorceress AI Game Creation Suite Capture](pages/sorceress-ai-game-creation-suite-capture.md) -- Website capture for Sorceress, an AI game creation suite and WizardGenie browser game engine. Study for FFS art pipelines, asset packaging, pricing, and tool catalog structure. Sandbox before using it in production.
- [Premium Mobile App Polish Capture](pages/premium-mobile-app-polish-capture.md) -- Beto Moedano X post on why premium apps feel right: press states, subtle motion, haptics, keyboard behavior, and loading or empty states. Use as a FFS polish checklist.
- [Macadam Onboarding Gamification Capture](pages/macadam-onboarding-gamification-capture.md) -- X video capture on premium mobile onboarding. Use this for FFS first win flow, mascot guidance, instant rewards, streaks, and reusable onboarding checklist.
- [AI Agent Game Build Pattern](pages/ai-agent-game-build-pattern.md) -- X capture on the LMAO browser MOBA build. Use this as a pattern for agent lane game builds, placeholder assets, bots, and IP clean prototypes.
- [Puzzle App UX Research](pages/puzzle-app-ux-research.md) -- Wordle, NYT Games, YouVersion, Bible App for Kids patterns. Applied to Gosple.
- [Arcade Game UX Research](pages/arcade-ux-research.md) -- Subway Surfers, Fruit Ninja, Angry Birds, Temple Run, Crossy Road, Flappy Bird, Doodle Jump. Applies to all factory games.
- [Onboarding Elite Research](pages/onboarding-elite-research.md) -- Manna Catch specific. 6 real game examples (Duolingo, Candy Crush, Monument Valley, Subway Surfers, Toca Boca, Calm), distilled principles, recommended 2-screen + coached-first-play flow, "?" help modal spec, and anti-patterns. Jun 8 2026.
- [Onboarding UI Inspiration -- Mobbin Research](pages/onboarding-ui-inspiration-mobbin.md) -- 7 specific app patterns (Duolingo, Fastic, Canva, Headspace, Photoroom, Toca Boca, Wise) with exact Manna Catch application notes. Visual upgrade checklist: typography, gradients, motion, button styling, celebration spec, kids tap targets. Mobbin access note. Jun 8 2026.
- [FFS Native Apps — State + Pickup (2026-06-09)](pages/ffs-native-apps-state-2026-06-09.md) -- Snapshot of every native app: EAS projectIds, dev-server ports, the install-link blocker (Apple credential setup), mascot names, and exact next actions. READ FIRST before touching the apps.
