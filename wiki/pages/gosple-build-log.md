# Gosple Build Log

**Summary:** Running log of Gosple development milestones and technical decisions.
**Last Updated:** 2026-06-08
**Related:** [[gosple-product-spec]], [[app-factory-strategy]], [[studio-decisions]], [[app-shell-standard-splash-onboarding]]

---

## 2026-06-08 -- Daily puzzle: mixed letter count + Day 1 reset (CJ request)

File: `src/games/gosple/GameScene.ts` (web build). Typecheck clean. NOT yet deployed (CJ approval + redeploy needed; native `archive/apps/gosple` needs the same change applied before its next EAS build).

- **Mixed letter count per day.** Before: daily puzzle = `starterPuzzles[day % N]`, sequential. Since `starterPuzzles` is grouped by length (26 five-letter words, then six, then seven, eight...), the first ~26 days were ALL 5-letter, then all 6-letter, etc. Now: a deterministic Fisher-Yates shuffle of the puzzle order (fixed seed `0x60591e28`, mulberry32) -> `DAILY_ORDER`, and daily puzzle = `starterPuzzles[DAILY_ORDER[day % N]]`. Same sequence for every player (Wordle-style), but word LENGTH now varies day to day. Engine already supports 5-8 letters.
- **Day 1 reset.** `GOSPLE_EPOCH` moved `2026-06-02` -> `2026-06-08` so the counter restarts at Day 1. Extracted to one constant used by both `getTodayPuzzle()` and the "Day N" display (was duplicated). NOTE at launch: set `GOSPLE_EPOCH` to the actual App Store launch date so players start on Day 1 on release day.
- **Elite onboarding:** requested for Gosple too; pending (web `GameOnboarding.tsx` vs native `archive/apps/gosple` onboarding). Must follow the locked [[app-shell-standard-splash-onboarding]] standard (Joy mascot, 3 fun beats, cream theme).

## 2026-05-27 -- Shared shell template + Gosple wiring + EAS prep

### What was built

Shared app shell template (31 files), reusable across all future Firmware Foundation games:

- Theme system: colors, typography, spacing, radii at `src/shell/theme.ts`
- GameConfig type system at `src/shell/config.ts` with Gosple config at `src/shell/configs/gosple.config.ts`
- Expo Router: 10 routes (splash, onboarding, menu, play, settings, about, privacy, giveback, purchase)
- 5 Zustand stores with AsyncStorage persistence: profile, preferences, streak, purchase, parentGate
- 8 shared screen components: SplashScreen, OnboardingScreen, MenuScreen, SettingsScreen, AboutScreen, PrivacyScreen, GivebackScreen, PurchaseScreen
- 6 UI components: ShellButton, ShellCard, ShellHeader, ToggleRow, ParentGate (math gate), ProfilePicker
- SoundManager (expo-av, safe no-ops until audio assets added) + HapticsManager (expo-haptics)
- RewardsEngine with badge definitions (first_win, week_warrior, faithful, dedicated)
- 14 tests passing, typecheck clean

Gosple game wired into the shell:

- Daily puzzle picker (rotates 30 puzzles by date)
- On-screen QWERTY keyboard with color-coded letter states (correct/present/absent)
- Streak tracking persisted via Zustand + AsyncStorage
- Verse card reveal on game completion
- Haptic feedback on taps, submits, wins
- Old App.tsx and index.ts deleted (migrated into Expo Router)

EAS build config:

- eas.json with dev/preview/production profiles
- App icon and splash screen from logo
- Export compliance flag (ITSAppUsesNonExemptEncryption: false)
- metro.config.js for Expo Router
- build:ios and submit:ios npm scripts

### Key decisions

- Used 4 parallel Engine agents to build the shell template (core, stores, screens, components/sound/rewards), then 1 agent to wire Gosple in, then 1 agent for EAS prep.
- Parent gate uses random multiplication (4-12 range), 3 attempts max, 5 minute expiry.
- Sound system uses registerAsset pattern so it's safe without audio files.
- Daily puzzle index: `Math.floor((Date.now() - epoch) / 86400000) % puzzles.length` where epoch is 2026-01-01.
- Keyboard letter state priority: correct > present > absent (never downgrades).

### Next steps

1. CJ runs `eas login`, `eas init`, `npm run build:ios`
2. Replace icon.png with opaque 1024x1024 before production
3. Fill in ascAppId and appleTeamId in eas.json
4. Add real sound effect assets to assets/sounds/
5. Test full flow on device via TestFlight
