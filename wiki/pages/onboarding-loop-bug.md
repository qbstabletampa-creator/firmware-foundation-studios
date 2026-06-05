# Onboarding Loop Bug (LIVE — blocking play)

**Summary:** On the live site, games loop on onboarding — finishing onboarding bounces you right back to it, so you can never reach the game. Root cause found June 5: `markGameOnboarded(gameId)` is only called during the profile-creation step, which is SKIPPED for any user who already has a profile. So the first game you onboard works, but every game after that loops forever. One-line fix identified, not yet applied.
**Last Updated:** 2026-06-05
**Sources:** Live testing (CJ), code read of GameOnboarding.tsx + profileStore.ts + App.tsx.
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

## The fix (one line)
In `GameOnboarding.tsx`, the `play` step button onClick (line ~387) must mark the game onboarded before navigating:
```ts
onClick={() => {
  SharedSFX.countdownGo();
  markGameOnboarded(gameId);   // <-- ADD THIS
  navigate(gamePath, { replace: true });
}}
```
(Optional hardening: also call `markGameOnboarded(gameId)` once on mount via useEffect, so any exit path marks it. But the play-button line is the minimum fix.)

## After fixing
1. `npm run dev`, test the loop is gone: onboard game A, then open game B/C/D — each should enter after onboarding, not loop. Use a fresh browser/incognito (clear `ffs-profile` in localStorage) to simulate new users, AND test the returning-user path (profile already set).
2. Rebuild + redeploy: `npm run build` then `wrangler pages deploy dist --project-name=firmware-foundation-studios --branch=main --commit-dirty=true` (needs `CLOUDFLARE_API_TOKEN` from ~/.env.integrations). See [[native-build-readiness]] / [[reference-ffs-cloudflare-deploy]].
3. PWA cache: after deploy, the live site is a PWA — phone may serve the old cached build. Pull-to-refresh or use the deploy-hash URL to verify fresh.

## Current live state
firmwarefoundation.com is deployed (commits f093c06 + 9f17606 + 08a93db) with: new AI worlds (Light Snake/BBB/Noah/Ark), paywalls OFF (PAYWALLS_OFF flag in purchaseStore.ts). The onboarding loop is the blocker preventing actual play.
