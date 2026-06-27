# Native Build Readiness (App Store ship pipeline)

**Summary:** The canonical, repeatable way every FFS app ships to iOS. Five FREE gates prove the build before you spend a single paid EAS build, then two paid/policy gates (signing + Apple review) finish it. Run this exact order for every app, every time. Goal: by the time you hit `eas build`, the only thing left is waiting on Apple.
**Last Updated:** 2026-06-13
**Sources:** 2026-06-13 ship-pipeline session (Stable/CJ). Supersedes the 2026-06-05 Capacitor version of this page.
**Related:** [[native-expo-testing-and-build]], [[ffs-ios-readiness-2026-06-13]], [[app-shell-standard-splash-onboarding]]

> **History note:** Until 2026-06-01 the games were Phaser/web wrapped in **Capacitor**. The fleet has since pivoted to **native Expo (SDK 54)** apps that run in Expo Go (Manna Catch, Noah, Light Snake, Gosple). Capacitor only still applies to the not-yet-split web games (Arc Hopper, Bible Brick Breaker) inside the old "FFS Games" bundle. For any native Expo app, use the pipeline below, not Capacitor.

---

## The locked flow (free until the very last line)

| # | Gate | Cost | What it proves | Command |
|---|------|------|----------------|---------|
| 1 | **Expo Go (dev loop)** | Free | JS, UI, gameplay, feel while building | dev server / `eas update` |
| 2 | **`tsc --noEmit`** | Free | Types clean | `npx tsc --noEmit` |
| 3 | **`expo export`** | Free | Bundling, imports, assets resolve | `npx expo export --platform ios` |
| 4 | **`ios-preflight`** | Free | prebuild + **pod install** (the phase EAS dies on) | `gh workflow run ios-preflight -f app=<dir>` → `gh run watch` |
| 5 | **`ios-sim-smoke`** | Free | **Real native Release compile** + sim boot + screenshots | `gh workflow run ios-sim-smoke -f app=<dir>` → `gh run watch` |
| 6 | **Publish to Expo Go for CJ test** | Free | CJ taps it on his phone + signs off BEFORE any paid build | `eas update --branch preview -m "msg"` (audit `.env` first) |
| 7 | **`eas build`** | **Paid** | Sign + archive + upload | `eas build --profile production` |
| 8 | **Submit** | Policy | Apple human review | ASC submit + metadata |

Steps 1-6 are free (FFS repo is public = unlimited GitHub macOS runners; Expo Go publish is free). They replicate everything EAS does **except** signing/upload. Get gates 1-5 green AND CJ approving in Expo Go (6), and step 7 succeeding is near-certain.

**Hard discipline:**
- Never run `eas build` until `ios-sim-smoke` is green.
- Never run `eas build` until **CJ has tested the Expo Go publish (step 6) and said build it.** Expo Go validates the game's JS/UX; sim-smoke (5) already proved native/Release. CJ's sign-off on 6 is the gate to spend money.

---

## Why this is ~95% but not 100%

The free gates make the **build** bulletproof. They cannot prove the two gates that come after compile:

### Gate A — Code signing (last 10% of the EAS build)
- Free gates compile with `CODE_SIGNING_ALLOWED=NO`. EAS still signs + archives with real Apple certs/provisioning.
- Can fail on entitlements, capability mismatch, or provisioning even when code compiles.
- **EAS's "synced capabilities" display lies** under ASC-key auth (see [[ffs-ios-readiness-2026-06-13]] and memory `feedback_eas_capability_sync_lie`). Verify capabilities via the **ASC API**, not EAS's UI.
- One-time setup per app, then stable. Not a per-build code risk.

### Gate B — Apple App Store review (human policy gate, after submit)
A perfectly compiled + signed build says nothing about approval. Pre-clear these BEFORE submit:

- [ ] **Privacy policy** live + linked in App Store Connect
- [ ] **Data collection** disclosed accurately (App Privacy "nutrition label")
- [ ] **Kids category compliance** (most FFS games are Christian kids apps):
  - [ ] No third-party tracking / analytics SDKs
  - [ ] No behavioral ads; any ads must be human-reviewed + kid-appropriate
  - [ ] **Parental gate** in front of external links, purchases, anything leaving the app
  - [ ] Age rating set correctly
- [ ] **No crash on the reviewer's device** (sim-smoke + real-device check first)
- [ ] **Metadata + screenshots** match the actual app, no placeholder content
- [ ] **IAP** (if any) configured + reviewable; restore-purchases works

The honest promise: *"the build compiles, signs, and uploads without surprises; the remaining risk is Apple's policy review, which we've pre-checked."* Never promise more.

---

## Phone testing per SDK

- **SDK 54 (fleet standard):** Expo Go on CJ's phone, free + instant, the full loop. This is why the whole fleet stays on 54 (see global rule `app-build-testing.md`).
- **SDK 56:** Expo Go can't load it yet. Build-validation (gates 4-5) still works for free on any SDK. For phone *feel* on 56, spend **one** development build to get a dev client, then iterate free into it. Don't put new apps on 56 until Expo Go supports it, or you throw away gate 1.

---

## Per-app readiness state
Live build IDs, SDK, channel status, and build-lane notes live in [[ffs-ios-readiness-2026-06-13]]. Check there before building any specific app (e.g. Gosple's live build has no update channel = no OTA, needs build #4).
