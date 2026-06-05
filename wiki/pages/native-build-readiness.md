# Native Build Readiness (App Store path)

**Summary:** How FFS games get onto phones as real native apps. Short version: it's **Capacitor, not Expo Go.** Phaser is a browser canvas/WebGL engine and cannot run in Expo Go (React Native). Capacitor wraps the existing web build into native iOS/Android apps, which is the correct fit and is already set up in this repo.
**Last Updated:** 2026-06-05
**Sources:** capacitor.config.ts, package.json, June 4 visual-upgrade session.
**Related:** [[visual-upgrade-pipeline]], [[phone-testing-workflow]], [[session-pickup-june-4-2026]]

---

## Why not Expo Go
- Expo Go runs **React Native** (native UI components). Our games are **Phaser** (DOM/Canvas/WebGL, browser-only). Phaser does not run in React Native.
- The only way to get them into an Expo shell is a WebView loading the web build, which is identical to just opening the dev URL in the phone browser. No benefit, more steps.
- The repo pivoted from Expo to web-first on June 1, 2026. Expo is gone.

## What's already in place (Capacitor 8.4.0)
- Deps: `@capacitor/core`, `/cli`, `/android`, `/ios` all `^8.4.0`.
- Platforms generated: `android/` and `ios/` both exist.
- `capacitor.config.ts`: appId `com.firmwarefoundation.studios`, appName `FFS Games`, `webDir: 'dist'`, iOS bg `#10100E`, Android bg `#10100E`.
- Scripts: `cap:build` (= `npm run build && npx cap sync`), `cap:ios`, `cap:android`, `cap:sync`.

## How to do a native test build
1. `npm run cap:build` — runs `tsc -b && vite build` into `dist/`, then `npx cap sync` copies web assets into the native projects.
2. iOS: `npm run cap:ios` opens Xcode. Needs a **Mac + Xcode + Apple Developer account** to install on a device. (The Mac Mini on Tailscale could host this.)
3. Android: `npm run cap:android` opens Android Studio. Needs Android Studio + an emulator or USB device.

## GOTCHA: test mode is OFF in native builds
`TEST_MODE = import.meta.env.DEV || localStorage 'ffs-test-mode'==='on'`. A Capacitor build uses `vite build` (production), so `import.meta.env.DEV` is **false** → the **paywall is active** in the native app.

To test all games free in a native build, either:
- Set the flag at runtime: in the app's webview, `localStorage.setItem('ffs-test-mode','on')` (hard to reach in a packaged app), OR
- **Better:** add a temporary build-time override before `cap:build` (e.g. an env var `VITE_TEST_MODE=on` read in `purchaseStore.ts`), then remove it before the real store build.

This is why **browser testing (dev URL) is the easy path** for now — test mode is automatic there. Save native builds for when you're actually preparing a store submission.

## Pre-submission checklist (when ready)
- Fix the stats-not-saved bug first (scores/badges save) — see session-pickup note.
- Confirm paywall + Stripe purchase flow works in a production build (test mode OFF).
- App icons + splash per platform (check `android/.../res` and iOS assets).
- Bump version in `capacitor.config.ts` / native projects.
- iOS: provisioning profile, App Store Connect listing. Android: signing key, Play Console listing.
