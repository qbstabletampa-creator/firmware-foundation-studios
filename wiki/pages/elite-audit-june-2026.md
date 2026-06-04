# FFS Elite Audit Report — June 2026

## Executive Summary

- **44 bugs total across all games:** 8 critical (game-breaking), 16 major (gameplay/performance), 20 minor (dead code, animation cleanup). 46 of 47 sprite PNGs had opaque backgrounds (fixed). Most gameplay bugs remain unfixed.
- **3 of 4 games have zero sound.** Only Manna Catch has a sounds.ts file, but it's dead code (never imported). All 4 settings screens have mute toggles that do nothing.
- **2 of 4 splash screens use emoji instead of PNG logos.** Noah Animal Match uses a dove emoji and Ark Hopper uses a lamb emoji. Both should use PNG images matching the Gosple/Manna Catch gold standard.
- **Onboarding is 2/7 Macadam pattern.** All 4 games use an identical 2-step flow (profile selection + name input). Missing: emotional opener, visual guide, clear promise, instant reward, streak preview.
- **~1,660+ lines of duplicated code** across splash screens (4x~145 lines), onboarding screens (4x~103 lines), splash CSS files (4x identical), home screens, settings screens, and game screen wrappers.

---

## 1. Splash Screens

| Game | Logo Type | Logo Source | WebGL Shader | Status | Fix Needed |
|------|-----------|-------------|--------------|--------|------------|
| Gosple | PNG | `/logo.png` | Yes (useRayCanvas) | GOLD STANDARD | None |
| Manna Catch | PNG | `/manna-catch-icon.png` | Yes (useRayCanvas) | MATCHES PATTERN | None |
| Noah Animal Match | Emoji | Dove via `motion.span` | Yes (useRayCanvas) | BROKEN | Replace emoji with PNG via `motion.img` |
| Ark Hopper | Emoji + Text | Lamb via `motion.span` + extra title | Yes (useRayCanvas) | BROKEN | Replace emoji with PNG via `motion.img`, remove duplicate title text |

**Verification:** Independently confirmed. Noah Animal Match and Ark Hopper both use `motion.span` with emoji text content. Gosple and Manna Catch both use `motion.img` with `src` pointing to PNG files.

**Shared code:** ~130 of ~145 lines per file are identical (WebGL shader strings VERT/FRAG, useRayCanvas hook, timer logic, fade animation). Only logo source, verse text, and navigation path differ.

**CSS:** All 4 splash CSS module files are identical.

---

## 2. Onboarding

**Current state: 2/7 Macadam pattern items**

| Macadam Step | Present? | Notes |
|---|---|---|
| 1. Emotional Opener | No | No full-screen intro with icon/tagline |
| 2. Visual Guide | No | No key sprite animation or game explanation |
| 3. Clear Promise | No | No "here's what you'll do" bullets |
| 4. Profile Selection | Yes | Kid/Parent toggle + name input |
| 5. Instant Reward | Partial | Shows "Hey [name]!" but no celebration particles |
| 6. Streak Preview | No | No calendar/streak visualization |
| 7. Play Button | No | No dedicated play CTA screen |

**All 4 onboarding files are nearly identical** (~95 of ~103 lines shared). They differ only in page title, navigation path, and game name references.

---

## 3. Sound

| Game | Has Sound | SFX Count | Sound File | Missing SFX |
|------|-----------|-----------|------------|-------------|
| Gosple | No | 0 | None | key tap, correct letter, wrong letter, puzzle solve, streak milestone |
| Manna Catch | Yes | 10+ | `src/games/mannaCatch/sounds.ts` | None (complete) |
| Noah Animal Match | No | 0 | None | card flip, match found, mismatch, combo, level complete, game complete |
| Ark Hopper | No | 0 | None | hop, star collect, death, water splash, level complete, game over, momentum chain |

**Preferences store** (`src/stores/preferencesStore.ts`): Does NOT have `soundEnabled` or `volume` fields. No global mute/volume control exists.

---

## 4. Visual Worlds

| Game | Background Type | Description | Sprite Count | Quality | Improvement |
|------|----------------|-------------|--------------|---------|-------------|
| Manna Catch | Procedural | Sky gradient + stars + divine beam + clouds + hills | 12 | Strong | Add Reve desert tile for depth |
| Ark Hopper | Procedural | Sky + clouds + flat-color lane backgrounds (grass/water/path) | 8 | Adequate | Replace flat colors with sprite tiles |
| Noah Animal Match | Procedural | Cream/warm gradient + golden particles + wooden card frames | 10 | Minimal | Add warm wooden table texture behind cards |
| Gosple | CSS-only | No Phaser canvas, CSS background styling | 0 (no sprites) | N/A (CSS game) | Consider subtle background pattern |

**Sprite directory structure:** `public/sprites/` contains per-game subdirectories with claymation-style PNG sprites generated via ChatGPT/Gemini pipeline.

---

## 5. Bugs

### Total: 44 bugs (8 critical, 16 major, 20 minor)

### Critical Bugs (8) — Game-Breaking

| # | Game | Bug | Status |
|---|------|-----|--------|
| 1 | All Games | 46 of 47 sprite PNGs had opaque backgrounds (Gemini export bug) | Fixed |
| 2 | Ark Hopper | Purchase logic references Manna Catch store. Playing Ark Hopper consumes Manna Catch free plays. (`ArkHopperGameScreen.tsx` lines ~15, ~22, ~42) | Confirmed, unfixed |
| 3 | Noah Match | "View Results" button completely dead after beating the game | Unfixed |
| 4 | Ark Hopper | Infinite death loop: respawning into flooded rows + double life drain per death | Unfixed |
| 5 | Manna Catch | Game over and level complete firing on the same frame | Unfixed |
| 6 | Manna Catch | Power-ups stacking infinitely | Unfixed |
| 7 | Manna Catch | Browser crashing from 60fps basket redraws | Unfixed |
| 8 | Homepage | Two game cards showing broken images | Unfixed |

### Major Bugs (16) — Gameplay/Performance

**Ark Hopper (4):**
- Score inflation on every hop
- Sprite position wrong after respawn
- Falling through log edges
- Animation corruption on rapid deaths

**Noah Animal Match (4):**
- Unreadable HUD
- Keyboard listeners stacking on restart
- Overlay memory leaks
- Combo counter never resetting

**Manna Catch (8):**
- Game speed tied to screen refresh rate (not frame-independent)
- Difficulty based on total playtime, not per-level
- Power-ups killing each other's effects
- Double-rendered overlays
- Items spawning on top of each other
- Exponential difficulty spike at level 5+
- Tiny star hitboxes
- Inconsistent collision boxes

### Minor Bugs (20)
- Dead code across multiple files
- Redundant error suppression hiding real bugs
- Animation cleanup issues

### Not Yet Tested
- Sound (none exists in 3 of 4 games)
- Badge wiring
- Payment flow
- Accessibility
- Level 20+ balance
- PWA offline behavior

---

## 6. Code Duplication

| Category | Files | Lines/File | Identical | Duplication % | What Varies |
|----------|-------|------------|-----------|---------------|-------------|
| Splash Screens | 4 | ~145 | ~130 | ~90% | Logo source, verse text, nav path |
| Splash CSS | 4 | ~60 | ~60 | 100% | Nothing |
| Onboarding Screens | 4 | ~103 | ~95 | ~92% | Title, nav path, game name |
| Home Screens | 4 | ~90-120 | ~70 | ~65% | Game-specific content, routes |
| Settings Screens | 4 | ~80 | ~65 | ~81% | Game name, theme colors |
| Game Screen Wrappers | 4 | ~50 | ~35 | ~70% | Store imports, game component |
| WebGL Shaders | 4 copies | ~40 | 40 | 100% | Nothing |

**Total estimated duplicated lines: ~1,660+**

**Extraction targets:**
- `GameSplashScreen` component -> replaces 4 splash files + 4 CSS files
- `rayShader.ts` -> single WebGL shader module
- `GameOnboarding` component -> replaces 4 onboarding files
- Shared settings/home screen patterns -> template components

---

## 7. Priority Action Items

### Immediate (Phase 2 blockers)
1. **Fix Ark Hopper purchase bug** - 3 line changes in ArkHopperGameScreen.tsx. Prevents real money/free-play accounting errors.
2. **Extract shared splash screen component** - Eliminates ~520 duplicated lines + 4 identical CSS files.
3. **Extract shared ray shader module** - Single source for WebGL VERT/FRAG strings.
4. **Build shared sound engine** - Generalize Manna Catch's proven sound system.
5. **Add soundEnabled/volume to preferencesStore** - Required before sound engine integration.

### High Priority (Phase 3)
6. **Fix Noah Animal Match splash** - Replace dove emoji with PNG logo.
7. **Fix Ark Hopper splash** - Replace lamb emoji with PNG logo, remove extra title text.
8. **Wire sound into Gosple, Noah Animal Match, Ark Hopper** - 3 games completely silent.
9. **Build Macadam onboarding template** - Current 2-step flow missing 5 of 7 engagement hooks.
10. **Extract shared onboarding component** - Eliminates ~380 duplicated lines.

### Medium Priority (Phase 3 polish)
11. **Ark Hopper visual upgrade** - Replace flat-color lane backgrounds with sprite tiles.
12. **Noah Animal Match visual upgrade** - Add wooden table texture behind card grid.
13. **Juice pass** - Score tweens, button springs, idle animations, new high score celebration.
14. **Generate PNG logos** - Noah Animal Match and Ark Hopper need proper game icons for splash screens.

---

*Audit conducted June 3, 2026. 6 parallel auditors + 2 adversarial verifiers.*
