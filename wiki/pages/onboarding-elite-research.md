# Onboarding Elite Research -- Manna Catch

**Summary:** Research and concrete recommendations for redesigning Manna Catch's 7-step onboarding into a 3-step-or-fewer premium flow, plus a feasible in-game how-to-play mechanic. The best mobile games teach by doing, not reading. Apply the coached first-play pattern here.
**Last Updated:** 2026-06-08
**Sources:** Adrian Crook (mobile game onboarding), Udonis/Medium (tutorial design), mobilefreetoplay.com, Carl Sommer/Medium, AppSamurai (kids apps), Krasamo (Monument Valley), App Cues / VWO / UXCam (app onboarding roundups), braingineers.com (Duolingo neuromarketing study), direct product analysis.
**Related:** [[arcade-ux-research]], [[macadam-onboarding-gamification-capture]], [[elite-audit-june-2026]], [[onboarding-loop-bug]]

---

## A. Premium Minimal Onboarding -- What Top Games Actually Do

Six real examples with the specific thing they do right:

### 1. Duolingo
Drops you into your first lesson in under 30 seconds. Account creation is deferred until after you have already done something meaningful. You finish one round, get a reward animation, and only then does the signup screen appear. The mental shift: you already won, you don't want to lose the streak. This is the most proven deferred-signup technique in mobile.

**The principle:** Give value first. Ask for commitment second.

### 2. Candy Crush
Level 1 is the tutorial. There is no pre-game explainer screen. The animated finger hand appears over the board and shows you the exact move to make. You tap it. It works. You instantly understand. No text. No popups. The game teaches by having you play a guided version of the real game.

**The principle:** The tutorial IS the first play session, not a thing before it.

### 3. Monument Valley
Zero text tutorials. Zero instruction screens. The puzzle is simple enough that tapping the character to move her is obvious. Rotating a pillar is obvious because it looks rotatable. The game trusts you to poke things. Sound and visual feedback reward every correct interaction. Players learn through environmental responsiveness, not explanations.

**The principle:** Design the mechanic to be self-explaining. Trust the player.

### 4. Subway Surfers
Opens directly to a run in progress. The swipe direction matches the intuitive action (swipe right to go right). An animated hand briefly shows the gesture on the first run. No pause. No tutorial screen. The game is already happening around you as you learn.

**The principle:** Start the experience, then coach mid-action. Don't front-load instruction.

### 5. Toca Boca World
No reading required at any point. The first tutorial uses visual arrows and a character guide, no text. Kids who cannot read use it successfully. Every onboarding action is constrained to one thing: the app shows you exactly what to tap, you tap it, and the app celebrates. Parents trust it because it is clearly designed for the child, not the parent.

**The principle:** One action at a time. Celebrate every right move. Zero reading required.

### 6. Calm
Onboarding is 3 questions maximum. Each question is a visual choice (a picture or simple label), not a text field. The tone of the onboarding matches the product exactly: calm, spacious, unhurried. By the time you finish the 3 questions, you understand what the app is and you feel relaxed, not interrogated.

**The principle:** The onboarding experience should feel like a preview of the product, not a form to fill out.

---

### Distilled Principles

1. **Value first, ask second.** Let them play before you ask for anything.
2. **The tutorial is the first play session.** Don't front-load explanation screens.
3. **One thing at a time.** Never teach two mechanics simultaneously.
4. **Animate, don't explain.** A moving hand beats a paragraph of text.
5. **Celebrate every correct action.** Small wins build confidence and retention.
6. **Match the tone.** The onboarding must feel like the game, not a separate process.
7. **Trust the player.** Kids figure things out faster than you expect when the feedback is clear.
8. **Defer anything you can defer.** Account creation, permissions, preferences can all wait.

---

## B. Teaching Gameplay Without a Wall of Text

### The Ghost Hand (Animated Gesture Hint)
The single most effective technique for casual touch games. An animated semi-transparent hand appears over the play area and performs the gesture. The player mimics it. Used by Candy Crush, Merge Mansion, Temple Run, and dozens of other top-grossing casual games. In React Native this is a pure Animated component: an Animated.View with an opacity pulse and a translateX animation showing the swipe direction.

### Contextual One-Line Prompts
Short text banners that appear in-context during gameplay. Eight words maximum (George Fan, Plants vs. Zombies creator). "Catch the bread!" is better than "Tilt or drag your device to move the basket left and right." The prompt disappears after a few seconds and does not block gameplay.

### Progressive Disclosure
Introduce one mechanic, let the player do it successfully, then introduce the next. Trainyard does this across 20 levels before allowing free play. For a shorter game like Manna Catch, this means: first 10 seconds teach catching. First bad item teaches dodging. First combo teaches the combo mechanic. No front-loading.

### Constraint-Based Learning
For the first few seconds, only one item falls at a time and it falls directly toward the basket. The player succeeds automatically on their first catch. This locks in the core mechanic with a guaranteed win. Then difficulty opens up.

### Show, Don't Tell
Research shows 80-90% of mobile players skip or ignore tutorial text. Visual cues (arrows, animated hands, glowing items) are processed faster and retained better. Never rely on text to teach a mechanic that can be shown through animation.

### Real Examples
- **Merge Mansion:** Small text banners during play, never a pre-game tutorial. New mechanics surface as contextual hints when the feature first appears.
- **Candy Crush Level 1:** Animated hand, one move, celebrate, next. The level is the tutorial.
- **Temple Run:** The game starts running immediately. A brief swipe indicator appears. You either react or you don't. The restart is the teacher.
- **Run Roo Run:** Entire game premise established visually in 10 seconds. No words needed.

---

## C. Recommended Onboarding Flow for Manna Catch

### Target: 2 real screens + 1 coached first game

Current state: 7-step flow before any gameplay. CJ's feedback: too many steps.

Recommended state: 2 pre-game screens, then immediately into a coached first play.

---

### Screen 1 -- Welcome (5 seconds max, skippable)

**What it does:** Establishes the vibe, not the rules. One image, one short phrase, a big START button. This is the emotional entry point, not an instruction screen.

**On-screen copy:**
```
[Manna catch logo / game visual]

God's goodness is falling.
Catch it.

[Big warm button: LET'S PLAY]
```

No text blocks. No bullet points. One image, one line, one button.

---

### Screen 2 -- Name (optional, can be skipped)

**What it does:** Personalizes the experience. One field. Pre-filled with "Player" so it is skippable with zero friction.

**On-screen copy:**
```
What should we call you?

[Text field: "Player"]

[Button: THAT'S ME]       [Small link: Skip]
```

Why include this: it sets up the Bible verse card address ("Great catch, Jordan!") which is a meaningful personalization moment. But it is not required.

If this adds too much friction: cut it entirely. The app still works without the name.

---

### Coached First Game (not a screen -- the actual game)

**What it does:** Replaces all other tutorial screens. The first 15 seconds of play are gently guided.

**Flow:**
1. Game starts. Basket appears. One item (bread) falls slowly, directly at the basket center.
2. A ghost hand animation (Animated.View with opacity 0.6) swipes left/right once to show the control.
3. Player catches the bread. Short celebration: bread glow + "Catch the manna!" text banner (4 words, fades in 1 second, fades out 1 second).
4. First thorn falls 3 seconds later. No new text. Player either dodges or loses a life. If they lose a life: contextual banner "Dodge the thorns!" appears for 2 seconds. Then continues.
5. Game proceeds normally from here.

**On-screen copy (banners, not screens):**
- `Catch the manna!` (appears on first catch, 2 seconds)
- `Dodge the thorns!` (appears on first thorn hit, 2 seconds)
- `Combo!` (appears on 3-catch streak, already in the game)

That is the entire tutorial. 2 items. 2 banners. 15 seconds.

---

### Step Count

| Old | New |
|-----|-----|
| 7 screens before play | 1 welcome screen + 1 optional name screen + coached first play |
| Earliest gameplay: step 8 | Earliest gameplay: step 2 (or step 1 if name is cut) |

---

## D. How to Play for Repeat Players

The coached first game only runs once (or on first install). But players who installed it months ago, or kids who borrowed a device, also need help. This needs a persistent mechanic.

### Recommended: "?" Button on Pause/Home Screen

A small question mark icon in a corner of the game home screen. Tapping it opens a single-screen overlay with 3 visuals (no text paragraphs). Each visual shows a sprite + one verb:

```
[Basket icon]  Catch  -- bread, honey, grapes, stars
[Thorn icon]   Dodge  -- thorns, stones
[Wide basket icon]  Power-ups  -- catch 3 in a row
```

No scrolling. One screen. A close button (X) in the corner. Works as well for a 6-year-old as it does for a parent checking the app.

**React Native implementation:** A plain `Modal` component with `transparent` prop and a semi-dark overlay. No native modules. Three `View` rows with an icon and a one-word label each. A close button. Total: roughly 40 lines of JSX. Works in Expo Go with zero additional dependencies.

### Also: Coached First Game Replays

Add a small option in Settings or in the "?" modal: "Show me the tutorial again." This re-triggers the coached first game flags in AsyncStorage. Players who want a reminder can get one. Parents who hand the device to a younger sibling can reset the tutorial. Simple, useful, low cost.

---

## E. Anti-Patterns -- What NOT to Do

These are patterns that hurt retention and feel cheap. Avoid all of them.

1. **Text walls before gameplay.** If you have more than one sentence per screen, you have a text wall. Cut it.
2. **Forced account creation before playing.** Never. Not for a kids game. Not for any game. Always defer.
3. **Permission requests on launch.** Push notifications, location, contacts -- do not ask on first open. Ask after the player has had a win. Apple and Google both penalize apps that front-load permission dialogs.
4. **Tutorial screens that look like a different app.** If the tutorial UI doesn't match the game's visual style, it feels cheap. The coached first game approach avoids this entirely because the tutorial IS the game.
5. **Skippable tooltips with no fallback.** If the only way to learn is to not skip onboarding, repeat players are permanently stuck. Always have the "?" button or a settings reset.
6. **Condescending tone.** "Great job, you tapped the screen!" reads as patronizing to a 10-year-old. Keep praise short and natural. "Catch the manna!" is excitement, not instruction.
7. **Blocking gameplay to deliver info.** The moment the game freezes and an overlay appears, you have broken flow. Banners that overlay live gameplay (Merge Mansion style) are fine. Full-screen stops are not.
8. **Multiple permissions or marketing asks stacked in onboarding.** Each added ask in the flow (rate us, share this, subscribe) cuts completion rates. Save those for after the first session.
9. **COPPA/GDPR violations.** Do not collect birth dates, real names, email addresses, or any PII from the onboarding flow without a parent gate. For Manna Catch: the name field (optional) should be presented as a nickname, not a real name. Store it locally only.

---

## Implementation Notes for React Native / Expo Go

All recommendations are pure RN Animated, no native modules needed.

- **Ghost hand:** `Animated.View` with `opacity` (0 to 0.6 pulse) and `translateX` animation looping once. Stop after first catch.
- **One-line banners:** `Animated.Text` with `opacity` fade-in/fade-out. Position absolute at top of game canvas. Z-index above game elements.
- **"?" modal:** `Modal` with `transparent={true}` and a semi-dark backdrop `View`. Three rows with a small sprite image and a single text label. Close button as a plain `TouchableOpacity`.
- **First-play tracking:** `AsyncStorage.setItem('hasPlayedBefore', 'true')` on first successful game completion. Check this on game load. If not set, trigger coached mode. If set, skip.
- **Tutorial reset option:** `AsyncStorage.removeItem('hasPlayedBefore')` from a Settings button. One line.

Total estimated new code: roughly 80-120 lines across 2 components (CoachingOverlay and HowToPlayModal). No new dependencies.

---

*Sources: adriancrook.com/best-practices-for-mobile-game-onboarding/, medium.com/udonis/how-to-design-a-mobile-game-tutorial, mobilefreetoplay.com/mobile-tutorials-storytelling/, medium.com/@csommer828/tutorial-design-for-casual-mobile-games, appsamurai.com/blog/building-a-kid-friendly-app-onboarding/, krasamo.com/game-design-inspiration-monument-valley-i-and-ii/, uxcam.com/blog/10-apps-with-great-user-onboarding/, vwo.com/blog/mobile-app-onboarding-guide/ -- researched June 8, 2026*
