# Native Expo Testing + Build (gotchas)

**Summary:** The current FFS games (Manna Catch, Noah, Light Snake, and Gosple's native app) are native Expo (SDK 54/56) apps that DO run in Expo Go. Getting them onto a phone for testing, and through an EAS build, has several non-obvious traps that cost a full session on 2026-06-08. This page is the cheat sheet so we never re-derive them.
**Last Updated:** 2026-06-08
**Sources:** 2026-06-08 Manna/Gosple session (Stable).
**Related:** [[app-shell-standard-splash-onboarding]], [[native-build-readiness]], [[phone-testing-workflow]]

---

## Expo Go on CJ's phone (LAN is broken on the box -> use Tailscale)

Run from the app dir (e.g. `archive/apps/gosple`):
```
EXPO_NO_DEPENDENCY_VALIDATION=1 REACT_NATIVE_PACKAGER_HOSTNAME=<tailscale-ip> npx expo start --go --port <PORT>
```
- Get the CURRENT tailscale IP first: `tailscale ip -4` (it changes; was 100.103.56.37 on 2026-06-08). The OLD .38 in CLAUDE.md is stale.
- Ports: 8081 manna, 8082 gosple, 8083 light-snake, etc. One per app; check the port is free first (see [[app-shell-standard-splash-onboarding]] / port-discipline rule).
- Phone needs Tailscale connected. Load `exp://<ip>:<port>` (Enter URL manually in Expo Go) or scan the QR.

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

**DONE 2026-06-09:** pinned `"image": "macos-sonoma-14.5-xcode-15.4"` (highest Xcode 15.x EAS still offers; aliases sdk-49/50/51) on the `preview`, `production`, and `development-device` iOS profiles of gosple, manna-catch, light-snake, and noah `eas.json`. NOT yet build-tested (a build is an EAS credit + CJ's account/device) — confirm at the next `eas build`. If 15.4 is gone/fails, fall back to `macos-sonoma-14.4-xcode-15.3`. Full valid list: https://docs.expo.dev/build-reference/infrastructure/

## Trap 5: in-app splash route loaded the per-game logo, not the FFS logo
`app/index.tsx` (cold start) correctly used `ffs-logo.png`, but `app/splash.tsx` (the in-app splash route) loaded `../assets/logo.png`. In manna/light-snake/noah, `logo.png` is the **Manna basket game icon** (hash 90a8df…) copied across apps, NOT the FFS shield (ffs-logo.png, hash 085390…). So the splash route showed the wrong logo, violating the locked "same FFS splash" standard. Fixed 2026-06-09: splash.tsx → `ffs-logo.png` on manna, light-snake, noah. (Gosple was fine: its `logo.png` IS the FFS logo.) When cloning a new app, make splash.tsx + index.tsx both point at `ffs-logo.png`.

## Build basics
- `preview` profile = internal distribution (installs on registered devices via link). CJ's iPhone UDID is registered.
- `eas build --local` would avoid an EAS credit but needs a Mac (Xcode) -> not possible on the Windows box; Mac Mini only.
- Account: firmfoundationstudios. ~30 builds/month free tier.

## Box health note
Repeated `expo start`/restart churn piled up TIME_WAIT sockets (6500+) and node processes (200+), causing intermittent "fetch failed". If online starts keep failing: stop hammering, let TIME_WAIT drain, kill stray firmware/expo node processes (NOT MC/services), retry.
