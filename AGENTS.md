# Firmware Foundation Studios — Repo Rules

Christian kids app factory. Small games, one reusable shell, scale winners. Public posture: public Christian. All ages.

## HARD RULE: test free before you build
**Every app MUST be testable in Expo Go (like Manna Catch) or as a development build BEFORE we ever spend an EAS preview/production build.** EAS builds cost credits and time — we never build to find out if it works.

Order of operations for any app change:
1. Runs in **Expo Go**: `EXPO_NO_DEPENDENCY_VALIDATION=1 REACT_NATIVE_PACKAGER_HOSTNAME=<tailscale-ip> npx expo start --go --port <free-port>` (one port per app).
2. Headless verify: `npx tsc --noEmit` clean AND `npx expo export --platform ios` clean.
3. CJ opens it on his phone and confirms look + feel.
4. ONLY then an EAS build (CJ-gated: his account, his device, real credits).

If a native module truly can't run in Expo Go, guard it with a JS fallback for Expo Go (see the Skia → expo-gl splash fallback), or ship ONE development build and iterate over the dev client.

## HARD RULE: one SDK across every app
Every app stays on the SAME Expo SDK so they all run in the one Expo Go on CJ's phone. **Standard is SDK 54.** Build new apps on 54. Move to 56 only when 56 is available in Expo Go, and migrate ALL apps together. Exception: Gosple shipped on 56 pre-rule — leave it until the coordinated 56 migration.

## HARD RULE: every app = its own EAS project + its own Expo Go dev server
Every app gets its own `eas init --force` EAS project (own `projectId`, no sharing) under `firmfoundationstudios`, and runs as its own Expo Go dev server on its own port so CJ can open it in Expo Go like Manna. Ports (one app = one port): **8081 Manna, 8082 Gosple, 8083 Shepherd's Trail, 8084 Noah**, next free for each new app. **Never take over another process's port** — that's the global port-discipline HARD RULE (`~/.claude/rules/port-discipline.md`): look before you bind, never kill a dev server you didn't start.

## Shell standard (LOCKED)
Every game ships the identical FFS splash (FFS logo + "Romans 8:28") and the canonical name-based onboarding with one per-game mascot. Spec + traps:
- `wiki/pages/app-shell-standard-splash-onboarding.md` — splash + onboarding contract, mascot roster, cut recipe.
- `wiki/pages/native-expo-testing-and-build.md` — Expo Go / EAS traps cheat sheet.

New game = copy the shell, swap game logic + per-game mascot + palette + name/slug/bundleId. Don't redesign the splash or onboarding per game.

Mirrored globally: `~/.claude/rules/app-build-testing.md`.
