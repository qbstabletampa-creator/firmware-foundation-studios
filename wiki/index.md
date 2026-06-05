# Firmware Foundation Studios Wiki

**Summary:** Dedicated vault for Firmware Foundation Studios, CJ's separate public Christian kids game studio.
**Last Updated:** 2026-06-03
**Sources:** CJ Telegram planning thread, Christian kids game factory capture, charity research.
**Related:** [[studio-decisions]], [[app-factory-strategy]], [[gosple-product-spec]], [[charity-options]]

---

## Hard Rules (ALL agents, ALL apps)

1. **Use installed autoskills on every task.** 19 skills are installed for Expo, React Native, React, TypeScript, Vitest, mobile design, accessibility, and deployment. Reference the relevant skill before writing code. No excuses.
2. Skills live at `~/.claude/skills/`. Key skills: expo/building-native-ui, expo/expo-deployment, vercel-labs/react-best-practices, antfu/vitest, sleekdotdesign/design-mobile-apps.
3. If a skill exists for the task, use it. If you skip it and the code is wrong, that's on you.

---

## Active Build

- [Elite Upgrade Plan](pages/elite-upgrade-plan.md) -- MASTER PLAN: 6-phase roadmap. Phases 0-4 done (Phase 0 partial), Phase 5 App Store not started.
- [Elite Audit - June 2026](pages/elite-audit-june-2026.md) -- 8-agent audit: 44 bugs (8 critical), 3/4 games silent, 2/4 emoji splash screens, 2/7 onboarding, ~1,660 duplicated lines.
- [Phase 2 Build Log](pages/phase2-build-log.md) -- Shared infrastructure: GameSplashScreen, soundEngine, GameOnboarding, rayShader extraction. ~1,436 duplicated lines eliminated.
- [Phase 3 Build Log](pages/phase3-build-log.md) -- Sound wired into all 4 games, score tweens, button springs. Visual polish blocked on art.
- [Phase 4 Build Log](pages/phase4-build-log.md) -- Light Snake + Bible Brick Breaker complete. 54-bug audit + fix pass. All code compiles clean.
- [Session 4 Notes](pages/ffs-elite-upgrade-session-notes.md) -- PICKUP NOTES: Session 4 state, remaining sprites, browser QA needed, iOS/App Store next steps.
- [Phase 0 Tool Setup](pages/phase0-tool-setup.md) -- AIML API configured, GameLabs/Sprite Lab/OpusGameLabs researched, Reve confirmed as primary sprite model.
- [Sprite System Build](pages/sprite-system-build.md) -- Full sprite infrastructure, scene refactors, environment polish. ChatGPT claymation style locked. 47/47 game sprites done, icons + tiles remain.
- [Gameplay Audit - June 2026](pages/gameplay-audit-june-2026.md) -- 6-agent audit of all 4 games. 8 critical, 16 major, 20 minor bugs found and fixed. Deployed June 3.
- [Visual Upgrade Pipeline](pages/visual-upgrade-pipeline.md) -- How we fix sprite alpha (rembg) and generate AI worlds/textures (Reve via AIML). Per-game art state, test mode, backups, costs. Jun 4 evening.
- [Native Build Readiness](pages/native-build-readiness.md) -- App Store path is Capacitor, NOT Expo Go (Phaser can't run in Expo). Cap 8.4 already set up. Build steps + the test-mode-off-in-prod gotcha.

## Core Pages

- [Studio Decisions](pages/studio-decisions.md) -- locked brand, audience, pricing, platform, content, and art direction.
- [App Factory Strategy](pages/app-factory-strategy.md) -- permanent strategy from the app factory capture: many small standalone apps, 40 plus app portfolio thinking, reusable template, scale winners.
- [Gosple Product Spec](pages/gosple-product-spec.md) -- first app direction for the pure daily Wordle style Bible word game.
- [Charity Options](pages/charity-options.md) -- researched charity candidates for the 10 percent tithe.
- [Game Build Order](pages/game-build-order.md) -- CJ's ranked first wave, second wave, and later world games.
- [Gosple Build Log](pages/gosple-build-log.md) -- running dev log with milestones, decisions, and technical notes.

## Research

- [Premium Mobile App Polish Capture](pages/premium-mobile-app-polish-capture.md) -- Beto Moedano X post on why premium apps feel right: press states, subtle motion, haptics, keyboard behavior, and loading or empty states. Use as a FFS polish checklist.
- [Macadam Onboarding Gamification Capture](pages/macadam-onboarding-gamification-capture.md) -- X video capture on premium mobile onboarding. Use this for FFS first win flow, mascot guidance, instant rewards, streaks, and reusable onboarding checklist.
- [AI Agent Game Build Pattern](pages/ai-agent-game-build-pattern.md) -- X capture on the LMAO browser MOBA build. Use this as a pattern for agent lane game builds, placeholder assets, bots, and IP clean prototypes.
- [Puzzle App UX Research](pages/puzzle-app-ux-research.md) -- Wordle, NYT Games, YouVersion, Bible App for Kids patterns. Applied to Gosple.
- [Arcade Game UX Research](pages/arcade-ux-research.md) -- Subway Surfers, Fruit Ninja, Angry Birds, Temple Run, Crossy Road, Flappy Bird, Doodle Jump. Applies to all factory games.
