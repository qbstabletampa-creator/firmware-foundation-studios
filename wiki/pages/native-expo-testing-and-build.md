# Native Expo Testing + Build (gotchas)

**Summary:** The current FFS games (Manna Catch, Noah, Light Snake, and Gosple's native app) are native Expo (SDK 54/56) apps that DO run in Expo Go. Getting them onto a phone for testing, and through an EAS build, has several non-obvious traps that cost a full session on 2026-06-08. This page is the cheat sheet so we never re-derive them.
**Last Updated:** 2026-06-10
**Sources:** 2026-06-08 Manna/Gosple session (Stable).
**Related:** [[app-shell-standard-splash-onboarding]], [[native-build-readiness]], [[phone-testing-workflow]]

---

## HARD RULE (CJ, 2026-06-09): Expo Go / dev build BEFORE any EAS build
Every FFS app must be testable in **Expo Go** (like Manna Catch) or as a **development build** so CJ can open it on his phone and test for FREE before we ever spend an EAS preview/production build. We never build-to-find-out. Order: runs in Expo Go -> `tsc` + `expo export` clean -> CJ opens it on his phone -> only then an EAS build. Mirrored in the global rules: `~/.claude/rules/app-build-testing.md`.

---

## Expo Go on CJ's phone (LAN is broken on the box -> use Tailscale)

**AUTOMATED 2026-06-09.** All dev servers are now managed by the launcher at the repo root:
- **Registry (source of truth for ports):** `dev-servers.json` — 8081 Manna, 8082 Gosple, 8083 Shepherd's Trail, **8085 Noah** (8084 abandoned to a stale TIME_WAIT).
- **Launcher:** `start-ffs-dev-servers.ps1` — resolves the Tailscale IP fresh each run, skips ports already serving (port discipline), starts the rest hidden/detached, then probes every manifest and asserts it advertises the Tailscale IP. Logs to `.pmloop/dev-servers.log` + per-app logs.
- **Reboot-proof:** Task Scheduler logon task **`FFS-DevServers-Logon`** (1 min delay so Tailscale is up) runs the launcher at every logon. Nobody restarts servers by hand anymore.
- **New app = one command:** `.\start-ffs-dev-servers.ps1 -Add -Name <app> -Dir archive/apps/<app>` — picks the next free 808x port, writes the registry, starts the server. After that it's permanent. (First-ever start of a brand-new EAS project must be online so Expo caches the dev codesigning cert under `~/.expo/codesigning/<projectId>/`.)
- **`-Restart`** stops only the registry's own node servers (never other processes on a port) and relaunches — use after a Tailscale IP change or dependency install.

Manual fallback (what the launcher does per app, from the app dir):
```
EXPO_NO_DEPENDENCY_VALIDATION=1 REACT_NATIVE_PACKAGER_HOSTNAME=$(tailscale ip -4 | head -1) npx expo start --go --port <PORT>
```
- Every app must have its OWN EAS project (`eas init --force` under firmfoundationstudios) so Expo Go can load it — Manna, Shepherd's Trail, Noah all have their own projectId. Gosple too. An app with no projectId can't be opened cleanly in Expo Go.
- Phone needs Tailscale connected. iOS Expo Go has NO manual-URL field (Android only): the games appear in the **Development servers** list on the Home tab (pull to refresh) because the phone shares the tailnet, or scan the QR / tap an `exp://` link.

## Trap 1: monorepo metro config (Expo Go "Unable to resolve ./node_modules/expo-router/entry")
node_modules is hoisted to `archive/node_modules` (npm workspace). Each app's `metro.config.js` MUST add the monorepo resolution or the Expo Go dev server can't find the entry point:
```js
const monorepoRoot = path.resolve(__dirname, '../..');
config.watchFolders = [...(config.watchFolders ?? []), monorepoRoot];
config.resolver.nodeModulesPaths = [path.resolve(__dirname,'node_modules'), path.resolve(monorepoRoot,'node_modules')];
```
Manna/Noah/Light Snake have it (copied from manna). Gosple's was the bare default and failed in Expo Go until fixed 2026-06-08. EAS build + `expo export` resolve fine WITHOUT this, so it only bites the dev server.

## Trap 2: dev code-signing cert (Expo Go "unable to sign manifest")
A new app must fetch its dev signing cert once via an ONLINE `expo start`. Offline mode (`EXPO_OFFLINE=1`) can't sign without a cached cert (`~/.expo/codesigning/<easProjectId>/`). The cert is per-EAS-project and scoped (cannot copy another app's cert; scopeKey mismatch). Manna works offline only because its cert cached earlier. So: first run of a new app = online.

## Trap 3: online `expo start` crashes intermittently ("Body has already been read")
`expo start` (online) sometimes crashes during dependency validation with `TypeError: Body is unusable: Body has already been read` in `getNativeModuleVersions` (an undici/expo-cli bug on a flaky response). Workaround: `EXPO_NO_DEPENDENCY_VALIDATION=1` skips that call and starts clean while staying online (so it can still sign). Use it for every Expo Go start.

## Trap 4: EAS iOS build fails "'weak' must be a mutable variable"
A native pod uses `weak let`, which EAS's now-newer Xcode/Swift rejects (×15). Gosple built fine in May; EAS's default Xcode image updated since. Fix: pin the build `image` in `eas.json` (preview + production) to the Xcode 15 image that the May builds used, so it compiles with the known-good toolchain. (Alternative: find + patch the offending pod.) This will hit Manna's build too.

**REVERSED 2026-06-10:** the 15.4 pins burned 3 builds (SDK 54 RN needs Xcode >= 16.1) and were removed in `3e676cc`/`8406bbf`. Standing rule (agent-ops): NEVER pin `ios.image` unless a build with that exact pin already succeeded. Default = no pin, EAS picks the SDK-matched image.

## Trap 5: in-app splash route loaded the per-game logo, not the FFS logo
`app/index.tsx` (cold start) correctly used `ffs-logo.png`, but `app/splash.tsx` (the in-app splash route) loaded `../assets/logo.png`. In manna/light-snake/noah, `logo.png` is the **Manna basket game icon** (hash 90a8df…) copied across apps, NOT the FFS shield (ffs-logo.png, hash 085390…). So the splash route showed the wrong logo, violating the locked "same FFS splash" standard. Fixed 2026-06-09: splash.tsx → `ffs-logo.png` on manna, light-snake, noah. (Gosple was fine: its `logo.png` IS the FFS logo.) When cloning a new app, make splash.tsx + index.tsx both point at `ffs-logo.png`.

## Build basics
- `preview` profile = internal distribution (installs on registered devices via link). CJ's iPhone UDID is registered.
- `eas build --local` would avoid an EAS credit but needs a Mac (Xcode) -> not possible on the Windows box; Mac Mini only.
- Account: firmfoundationstudios. ~30 builds/month free tier.

## Box health note
Repeated `expo start`/restart churn piled up TIME_WAIT sockets (6500+) and node processes (200+), causing intermittent "fetch failed". If online starts keep failing: stop hammering, let TIME_WAIT drain, kill stray firmware/expo node processes (NOT MC/services), retry.

## Trap 6: sim-smoke scheme picker built a pod, not the app (2026-06-10)
The ios-sim-smoke Action picked the first workspace scheme not starting with "Pods" — that matched `EXConstants`, so it "built" a pod in 2 min, BUILD SUCCEEDED, and the launch step found no .app. A suspiciously fast green xcodebuild = wrong scheme. Fix: the app scheme is always the workspace basename (`MannaCatch.xcworkspace` -> `MannaCatch`); expo prebuild guarantees it.

## Trap 7: expo-router evaluates EVERY route module at launch in production
Killing the Skia splash in `app/index.tsx` was not enough. `app/splash.tsx` (leftover route) still did a module-level `require()` of the Skia RadiantSplashScreen, and expo-router's production import mode is sync: all route files are evaluated at startup. The untested Skia path was still loading in every Release build. Also: gosple's `app/index.tsx` never got the 6/10 GL-only fix at all (its lockfile build failure masked it). All killed in `3f879ed` — GL splash is the only splash, in index.tsx AND splash.tsx, all 4 apps. Rule: when removing a "never navigate to it" code path, grep the whole `app/` dir; a route file's top-level requires run at launch whether or not anyone navigates there.

## Trap 8: SDK 56 (gosple) needs Swift tools 6.2 -> newer Xcode than SDK 54 apps
Gosple sim-smoke died in the ExpoModulesJSI xcframework script: "package 'apple' is using Swift tools version 6.2.0 but the installed version is 6.1.0". GH macos-15 default Xcode 16.4 = Swift 6.1. The workflow now runs `sudo xcode-select -s $(ls -d /Applications/Xcode_*.app | sort -V | tail -1)` for gosple only; SDK 54 apps stay on the default (matches their EAS image). When the fleet migrates to SDK 56, that select becomes unconditional.

## THE WAY (CJ hard rule, 2026-06-10): EAS Update publish lane
Every app is published to Expo's servers and lives in Expo Go permanently. Test loop = `eas update` -> CJ opens Expo Go -> fix -> republish. No preview builds for testing, no install links. ONE production EAS build per app, at store submission. Full rule: `~/.claude/rules/app-build-testing.md`.

Per app (already configured in app.json: runtimeVersion sdkVersion policy + updates.url):
```
cd archive/apps/<app>
npx eas-cli update --branch preview --message "<what changed>" --non-interactive
npx eas-cli channel:create preview   # one-time per app (manna done 6/10)
```
Verify Expo serves it before telling CJ ready (createdAt must match the publish):
```
curl -s "https://u.expo.dev/<projectId>?channel-name=preview" -H "expo-runtime-version: exposdk:54.0.0" -H "expo-platform: ios" -H "expo-protocol-version: 1" -H "accept: multipart/mixed" | grep -o "\"createdAt\":\"[^\"]*\""
```
ProjectIds: manna `d5b4265a-aab0-461a-a76d-e91f0af94d24` | gosple `919a2ce7-1a11-48fe-a5a7-ea7382682019` (SDK 56 -> runtime exposdk:56.0.0) | light-snake `a3000ec4-206d-41ca-b77c-928575419763` | noah `2b0ff349-a7bd-4ce1-b68f-ca0b0d63ced7`.
Updates apply on the NEXT launch: force-close Expo Go, open the app, close, open again. Expo Go shares AsyncStorage between dev-server and published variants of the same project (CJ kept his 720 high score + completed-onboarding flag).

## Trap 9: onLayout on a view whose size depends on the measurement (zero-width deadlock)
Manna `app/game.tsx` set the game area `width` from `areaSize.w`, measured by that same view's `onLayout`. Width starts 0 -> onLayout reports 0 -> locked at 0 forever: black play field, HUD alive, score stuck at 0 (engine early-returns on gameWidth 0). Shipped in `a827be5` when select/game layout handlers were split (select screen used to seed the size). Caught by CJ's first Expo Go published-update test, fixed in `2ffb600`: a full-width WRAPPER carries onLayout, the inner game box gets the measured width. Pattern rule: never attach the measuring onLayout to the view being sized by the measurement.
