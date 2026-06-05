# Onboarding Loop Bug (RESOLVED — fixed + deployed + verified live Jun 5)

**Status:** RESOLVED Jun 5, 2026. Fix applied, built, deployed to Cloudflare Pages, and verified end-to-end on live firmwarefoundation.com. Commit `52372ee`, deployment `b8b0a696` (Production, bundle `index-Cc0Y7Wzl.js`).

**Summary:** Games looped on onboarding — finishing onboarding bounced right back to it, so you could never reach the game. Root cause: `markGameOnboarded(gameId)` was only called during the profile-creation step, which is SKIPPED for any user who already has a profile. First game onboarded worked, every game after looped. Fixed by adding `markGameOnboarded(gameId)` to the LET-S PLAY button onClick.
**Last Updated:** 2026-06-05
**Sources:** Live testing (CJ), code read of GameOnboarding.tsx + profileStore.ts + App.tsx, Playwright verification on live domain.
**Related:** [[visual-upgrade-pipeline]], [[native-build-readiness]], [[session-pickup-june-4-2026]]

---

## Symptom
Open a game on firmwarefoundation.com → splash → onboarding. Complete onboarding → it returns to onboarding instead of entering the game. Infinite loop. (First-ever game may work; subsequent games always loop.)

## Root cause
`src/components/GameOnboarding.tsx`:
- The route guard `ProtectedRoute` (App.tsx:56-58) redirects `/<game>/home` etc. to `/<game>/onboarding` when `isGameOnboarded(gameId)` is false.
- `markGameOnboarded(gameId)` is called in only TWO places:
  1. `handleProfileSubmit()` (line 69) — runs ONLY on the `profile` step.
  2. `next()` `if (isLastContentStep)` branch (line 54-55) — **dead code**: the last step is `play`, and the `play` button has its own `onClick` (line 387-390) that calls `navigate(gamePath)` directly, never `next()`.
- For a returning user, `hasProfile` is true (line 41), so STEPS drops `profile` and `reward` (line 42-44). The `profile` step never renders → `handleProfileSubmit` never runs → `markGameOnboarded` is NEVER called for that game.
- Result: navigate to `/<game>/home` → guard sees not onboarded → redirect to onboarding → loop.

gameIds are NOT the problem — they match between onboarding configs and routes (light-snake, manna-catch, noah-animal-match, ark-hopper, bible-brick-breaker, gosple).

## The fix (applied)
In `GameOnboarding.tsx`, the `play` step button onClick now marks the game onboarded before navigating:
```ts
onClick={() => {
  SharedSFX.countdownGo();
  markGameOnboarded(gameId);   // added Jun 5 — fixes the loop
  navigate(gamePath, { replace: true });
}}
```
The call is idempotent (the store dedupes gamesOnboarded), so the new-user path is unaffected — `handleProfileSubmit` already marks the first game, and this re-call is a no-op there.

## Verification (Jun 5, Playwright on live firmwarefoundation.com)
- **Returning user (the broken case):** seeded profile + `gamesOnboarded:['noah-animal-match']`, walked Light Snake onboarding → LET-S PLAY → landed on `/light-snake/home`, home screen rendered ("Good afternoon, Tester!" + PLAY NOW). No loop.
- **New user:** cleared `ffs-profile`, full Manna Catch onboarding incl. profile creation → LET-S PLAY → `/manna-catch/home`. Works.
- Zero console errors on both paths.

## Deploy notes / gotchas
- Deploy: `npm run build` then `wrangler pages deploy dist --project-name=firmware-foundation-studios --branch=main --commit-dirty=true` (needs `CLOUDFLARE_API_TOKEN` from ~/.env.integrations). See [[reference-ffs-cloudflare-deploy]].
- **Edge HTML cache:** right after deploy, firmwarefoundation.com briefly served the OLD bundle (`ux3m4joO.js`) on a plain load, while a cache-busted fetch already returned the new build (`Cc0Y7Wzl.js`). Confirm the live bundle hash matches your build before declaring done. `wrangler pages deployment list` shows which deployment is Production.
- **PWA service worker:** devices that opened the old build keep serving it from the SW cache until hard-refreshed (pull-to-refresh x2, or remove + re-add the home-screen icon). This is the #1 "it's still broken on my phone" cause.

## Current live state
firmwarefoundation.com is live and playable: new AI worlds (Light Snake/BBB/Noah/Ark), paywalls OFF (PAYWALLS_OFF flag in purchaseStore.ts), onboarding loop fixed. No known blockers.
