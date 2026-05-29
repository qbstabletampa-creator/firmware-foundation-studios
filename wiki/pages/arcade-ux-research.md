# Arcade Game UX Research

**Summary:** Deep research into UI/UX patterns from top mobile arcade games. Applies to all Firmware Foundation Studios games.
**Last Updated:** 2026-05-27
**Sources:** Scout intel from Subway Surfers, Fruit Ninja, Angry Birds, Temple Run, Crossy Road, Flappy Bird, Doodle Jump.
**Related:** [[app-factory-strategy]], [[game-build-order]], [[puzzle-app-ux-research]]

---

## Universal Rules

### 1 Tap to Gameplay
Every top arcade game gets you playing in 1-2 taps. Flappy Bird and Crossy Road: 1 tap. Fruit Ninja: 2 taps (mode select). Angry Birds: 3 taps (justified by level structure). For simple arcade games (Manna Catch, Light Snake, Bible Brick Breaker), target 1 tap.

### Warm Colors Win With Kids
Every game studied uses warm primaries (red, gold, amber, orange) as lead colors. Cool colors (blue, cyan) appear as contrast accents only. High saturation reads as playful and energetic. Do not mute the palette for kids. Go full saturation.

### Menu/Home Layout
- Single dominant CTA (PLAY) at visual center
- Currency/score in top corners
- Settings as a corner icon, no label
- Shop/characters as small secondary icons
- Zero hamburger menus across all seven games
- Tab bars only for games with multiple content pillars

### Game Over / Results
- Score shown large and first
- High score comparison immediate ("NEW BEST" banner)
- Replay as primary CTA (warm color, large button)
- Share as secondary
- Stars only if level-based (Angry Birds). Score games skip stars.
- Speed to replay is a KPI: under 2 seconds from death to playing again

### Onboarding
- No account required before first play
- Tutorial is baked into the first 30 seconds of real gameplay
- No separate tutorial screens
- Account creation prompted after first session, never at launch

---

## The Juice Checklist (all 10 required for polish)

1. Screen shake on impact (0.1-0.3 seconds, subtle)
2. Squash and stretch on all moving objects
3. Score counter animates up, never appears instantly (100-200ms count-up)
4. Coins/items fly in an arc toward the UI counter, counter bounces on receive
5. Button press: scale down 8-10%, spring back on release
6. Particle burst on success moments (collect, level complete, high score)
7. Idle animation on characters in menus (nothing static)
8. Sound on every interaction
9. Screen transitions slide or scale, never hard cut
10. New high score has its own unique celebration, distinct from level complete

---

## 5 Most Important Animations

1. **Hit feedback**: contact point emits visible burst (particles, flash, ring). Most important single animation.
2. **Death/fail**: character squash, screen shake, impact burst. Failure needs weight.
3. **Score reveal on game over**: large number counts up from 0 to final in 1-2 seconds.
4. **Collect/progress**: items have a visual path to the counter. Coins arc, stars fly.
5. **Victory/milestone**: confetti/particle burst on level complete or high score. Plays ONLY on these moments.

---

## Minimum Viable Fun (3 requirements)

1. The core action must feel good with no scoring. If it feels hollow without points, the mechanic is broken.
2. First session teaches all mechanics within 30 seconds without a tutorial screen.
3. Death must be fast and retry must be instant. 2 seconds max from fail to play-again.

---

## Separate Apps, Not a Hub

Every source confirms separate apps win:
- Each app gets its own App Store listing, search ranking, and reviews
- 500 reviews on one game looks stronger than 500 split across a hub
- Kids discover by game title, not studio name
- Each game can have its own price point
- Hub apps add download friction before playing

Strategy: separate apps with a "More Games from Firmware Foundation" button in each app's More/Settings screen for cross-promotion.

---

## The Doodle Jump Theme Model

One mechanic, many skins. Doodle Jump reskins character, platforms, enemies, and background per theme while keeping the same scrolling mechanic. This maps directly to our factory:

- Manna Catch: catch mechanic, skins for Elijah desert, Feeding 5000, manna in wilderness
- David Sling Shot: sling mechanic, skins for different Goliath encounters
- Bible Brick Breaker: breakout mechanic, skins for walls of Jericho, etc.

Characters and skins ARE the collection/metagame loop (Crossy Road model without gacha).

---

## Color Palettes from Top Games

### Subway Surfers
Electric Red #E31902, Mellow Apricot #F7BE76, Shandy Yellow #FFED6D, Diamond Cyan #C6FEFE, Electric Blue #6AEEFD, Pigment Blue #354093

### Angry Birds
Primary Red #D80026, Amber Gold #FDBB01, Sky Blue varies, Pig Green #4CAF50

### Candy Crush
Rich Purple #4A0080, Orange #FF6600, Gold #FFCC00

### Common thread
Warm dominant. High saturation. Cool as contrast accent only.

---

## Sound Design Rules

Sounds that exist in every game studied:
1. Button tap confirmation (click, pop, swoosh)
2. Core game action hit (slice, bounce, collect)
3. Score increment tick (coins clinking)
4. Success/level complete (ascending chime or fanfare)
5. Fail/death (descending tone or soft impact)
6. Combo/milestone escalation (pitch rises with streak)

For Christian kids: joyful, affirming soundscape. Major key, bright tones. Failure sounds should be soft and encouraging, not harsh or dissonant.

Haptic standard: light tap for buttons, medium impact for collision/fail, heavy impact for level complete/new high score.

---

## App Store Screenshots

- 6-8 screenshots (optimal for engagement)
- First screenshot is gameplay in action, not logo
- Device frames (iPhone Pro) on bright gradient backgrounds
- Bold text overlays describing the FEELING: "SLICE EVERYTHING" not "Fruit Slicing Mode"
- Progression story: gameplay > action moment > score celebration > character variety > theme element
- For us: screenshot 4 should prominently feature the Biblical theme
