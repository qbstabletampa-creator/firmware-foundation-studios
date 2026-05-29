# Gosple Product Spec

**Summary:** First Firmware Foundation Studios app. A pure daily Wordle style Bible word game for all ages.
**Last Updated:** 2026-05-27
**Sources:** CJ ranking and Christian kids game factory notes.
**Related:** [[studio-decisions]], [[app-factory-strategy]], [[game-build-order]]

---

## Product

Name: Gosple

Format: daily Bible word puzzle with Bible words from 4 to 8 letters.

Platform: iPhone first.

Audience: family/all ages, kid safe.

Positioning:

> A daily Bible word puzzle from Firmware Foundation Studios. Built for Christian families. Offline, simple, and parent trusted.

## Core Loop

1. Open the app.
2. Solve one Bible themed word puzzle.
3. Reveal the word meaning.
4. Show verse options based on the player's selected profile.
5. Save streak locally.
6. Unlock a simple verse card or badge.
7. Come back tomorrow.

## Prototype Content Rule

NIV is preferred long term, but public app or website use appears to require written permission.

Prototype and v1 should use a public domain/open Bible translation until licensing is resolved.

Best current candidates:
- Berean Standard Bible, public domain as of 2023 per Berean licensing page
- World English Bible, public domain and modern English
- Open English Bible, CC0/public domain style

Keep the content layer translation aware so NIV can be added later if licensed.

## Locked MVP Decisions

- Audience: family/all ages
- Word length: Bible words from 4 to 8 letters
- Launch content path: build test content first, then build the full word/verse bank
- Verse experience: show both verse/reference and kid friendly options based on profile
- Sharing: adult gated sharing only, no child social features
- Character direction: no mascot in v1, keep visual system clean with Bible cards, light, scrolls, and word tiles

## MVP Screens

- Splash
- Daily puzzle
- Result screen
- Verse card
- Streak screen
- Archive or practice mode, optional
- Settings
- About
- Privacy
- Giveback info

## Monetization

Target price: $4.99.

Giveback: 10 percent tithe, rotating month to month between Awana and Hope Children's Home, Tampa.

No ads.

No chat.

No child social features.

## Sound

No narration at launch.

Use simple sound effects:

- tile tap
- correct letter
- word solved
- soft celebration
- button press

## Locked May 27 2026

- Monetization: paid up front at $4.99. No freemium, no in-app purchases.
- Profiles: all ship in v1 (Kid, Teen, Parent, Family)
- TestFlight content: 30 puzzles (already built in starterPuzzles.ts)
- Apple Developer account: existing under QB Stable, may rename to Firmware Foundation Studios later
