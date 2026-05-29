# Puzzle App UX Research

**Summary:** UI/UX research from Wordle, NYT Games, YouVersion, Bible App for Kids, Candy Crush, and Christian kids apps. Applied to Gosple redesign.
**Last Updated:** 2026-05-27
**Sources:** Scout intel from NYT Wordle, NYT Games app, YouVersion Bible App, Candy Crush, Minno, Bible App for Kids, Superbook.
**Related:** [[app-factory-strategy]], [[gosple-product-spec]], [[arcade-ux-research]]

---

## Key Finding: Light Backgrounds Win

Every major puzzle/family app defaults to white or warm cream:
- Wordle: pure white #FFFFFF
- NYT Games: white
- YouVersion: white/warm cream
- Bible App for Kids: illustrated warm backgrounds
- Only Candy Crush goes dark (arcade, not puzzle)

Dark mode is an adult puzzle trend. For families and kids, light = approachable, warm, trustworthy.

---

## Wordle Design Reference

### Color Palette (Light Mode)
- Background: #FFFFFF
- Empty tile border: #D3D6DA
- Correct: #6CA965
- Present/wrong position: #C8B653
- Absent: #787C7F
- Black text: #000000

### Dark Mode
- Background: #121213
- Muted versions of same palette

### Game Screen
- Full-width header bar: logo left, icons right
- 6x5 tile grid, centered
- 3-row QWERTY keyboard below
- Zero clutter. Grid and keyboard only.
- 0 taps to play (opens directly to active board)

### Tile Animations (the standard)
- Submit: 3D Y-axis flip, sequential left to right, ~300ms delay between tiles
- Color reveals at flip midpoint
- Invalid word: horizontal shake
- Win: upward bounce in sequence
- Toast notification: "Genius!" / "Magnificent!" based on guess count

### Stats Screen
- 4 stats horizontal: Games Played, Win %, Current Streak, Max Streak
- Guess distribution bar chart
- Countdown timer for next word
- Share button prominent

### Onboarding
- One "How to Play" modal with 3 example tiles
- Under 30 seconds to dismiss, then play

---

## NYT Games App Navigation

- Bottom tab bar: 3 tabs (Games, Stats, Leaderboard)
- Simplified from 5 to 3 in March 2024 redesign
- Game cards in vertical scroll, not grid
- 2 taps to play: home > tap card > game loads
- Personalized greeting by time of day

---

## YouVersion Bible App

- Primary brand: red #F33A49
- Background: white (light mode default)
- "Today" tab as primary landing
- 5-item bottom tab bar
- Warm, not cold. Photography heavy.
- Soft shadows and white space
- Personalized greeting by time of day

---

## Bible App for Kids

- Target: ages 4-8
- Full-bleed illustrated scenes
- Warm saturated palette: sky blues, earth greens, sunset oranges, golden yellows
- Giant tap targets, swipe between pages
- Touch-activated animations on every scene
- 41 illustrated story cards in grid

---

## Gosple Design Decisions (from this research)

1. Light warm cream background (#FFFBF0), not dark
2. Our own tile colors: green #4CAF79, amber #F5A623, gray #D2D2D2
3. Tile flip animation with 200ms stagger (Wordle standard)
4. Shake on invalid, bounce on win
5. Bottom tab bar, 3 tabs (Play, Stats, More)
6. One-modal onboarding, then straight to game
7. Win state = verse card reveal with meaning (our differentiator)
8. Bold rounded sans-serif typography
9. Pops of coral #FF6B6B, teal #4ECDC4 for fun
10. Gold #D4C36A as studio brand accent
