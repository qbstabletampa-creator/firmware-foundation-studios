# FFS Native Apps — State + Pickup (2026-06-09)

**Summary:** Snapshot of every FFS native Expo app after the 2026-06-09 session: what's done, EAS project IDs, dev-server ports, the install-link blocker, and the exact next actions. Read this first before touching the apps.
**Last Updated:** 2026-06-09
**Sources:** 2026-06-09 pmloop session (Stable). Repo: `C:/Users/rodge/projects/firmware-foundation-studios`.
**Related:** [[app-shell-standard-splash-onboarding]], [[native-expo-testing-and-build]], [[christian-kids-game-idea-bank]]

---

## Per-app status

| App | Dir (`archive/apps/`) | Display name | EAS projectId | SDK | Dev port | Shell standard | Notes |
|---|---|---|---|---|---|---|---|
| Manna Catch | `manna-catch` | Manna Catch | d5b4265a-aab0-461a-a76d-e91f0af94d24 | 54 | 8081 | done (Joy) | reference app; splash logo fixed this session |
| Gosple | `gosple` | Gosple | 919a2ce7-1a11-48fe-a5a7-ea7382682019 | **56** | 8082 | done (Scripture) | SHIPPED (App Store pending). SDK-56 outlier — exception to the SDK-54 rule |
| Shepherd's Trail | `light-snake` | Shepherd's Trail | a3000ec4-206d-41ca-b77c-928575419763 | 54 | 8083 | done (Eli) | **was Light Snake**; reskinned this session (see below) |
| Noah | `noah` | Noah Animal Match | 2b0ff349-a7bd-4ce1-b68f-ca0b0d63ced7 | 54 | 8084/8085 | done (Ari) | dev server currently on 8085 (8084 had a stale TIME_WAIT) |
| (play) | `play` | — | — | — | — | EXCLUDED | abandoned scratch, dup of Gosple, pivoted to web. Not a ship target. |

Owner account for all: **firmfoundationstudios** (eas-cli is logged in as this on the box).

## What got done this session (commits on `main`, local, NOT pushed)
- `48e5c77` — Light Snake + Noah finished to shell standard: Lumen + Ari mascots, name-based onboarding (ported off the old Kid/Teen/Parent/Family picker), splash logo fix (was loading `logo.png` = Manna basket icon; now `ffs-logo.png`) on light-snake/noah/manna, EAS Xcode-15 pin (`macos-sonoma-14.5-xcode-15.4`) on gosple/manna/light-snake/noah.
- `a12e79d` — **Light Snake → Shepherd's Trail** reskin: head sprite = shepherd, every trail segment = a glowing sheep (`assets/sprites/shepherd.png` + `sheep.png`), onboarding mascot = **Eli** the shepherd (`assets/shepherd-wave.png` + `shepherd-celebrate.png`), renamed all display strings + app.json identity (slug `shepherds-trail`, scheme `shepherdstrail`, bundle `com.firmwarefoundation.shepherdstrail`). Engine untouched — pure renderer + sprite swap. Internal dir/id/store-key stay `light-snake` (invisible).
- `f360276` — linked Shepherd's Trail EAS project.
- `1f19b8a` — new hard rules (see below) + linked Noah EAS project.
- All verified: `tsc --noEmit` clean + `expo export --platform ios` clean for both apps.

## New HARD RULES (locked this session, CJ)
1. **Expo Go / dev build BEFORE any EAS build.** Test free first.
2. **One SDK across every app** — standard is 54; move all to 56 together only when 56 is in Expo Go. (Gosple-on-56 is the grandfathered exception.)
3. **Every app = its own EAS project + its own Expo Go dev server on its own port.**
Written to: `~/.claude/rules/app-build-testing.md` (global), repo `AGENTS.md`, and `wiki/pages/native-expo-testing-and-build.md`. Port discipline (don't clobber others' localhost) already global at `~/.claude/rules/port-discipline.md`.

## Mascot art recipe (codified)
`python scripts/cut-mascot.py <in> <out> [thresh=130]` = rembg + alpha<130 + autocrop. Generate via `scripts/reve-generate.ts` (AIML/Reve). Family style = soft 2D cartoon, warm dark outline, gold halo ring, rosy cheeks, little white hands (match Joy/Scripture, NOT 3D-clay). Generate on a mid-tone bg (mint) for a clean cut. Source art in `.pmloop/mascot/`.

## Dev servers (running on the box, over Tailscale 100.103.56.37)
Manna 8081, Shepherd's Trail 8083, Noah 8085. They die on reboot. Restart any with:
```
cd archive/apps/<app> && EXPO_NO_DEPENDENCY_VALIDATION=1 REACT_NATIVE_PACKAGER_HOSTNAME=$(tailscale ip -4 | head -1) npx expo start --go --port <port>
```
**iOS Expo Go has NO "enter URL" field** (Android only). On iPhone you open a dev server via the **Development servers** list (Home tab, pull to refresh — same place Manna shows) or a scanned QR / tapped `exp://` link. This friction is why CJ wants the install-link path instead (below).

## THE OPEN BLOCKER — install-link builds (what CJ actually wants)
CJ wants the **Coach Room delivery model**: an EAS internal-distribution build → he opens a link on his iPhone → taps Install → opens the app. No Expo Go. Each app gets its OWN unique install link.

Attempted `eas build -p ios --profile preview --non-interactive --no-wait` for Shepherd's Trail → **FAILED at credentials** ("couldn't find any credentials suitable for internal distribution. Run again in interactive mode"). **NO build credit was consumed** (failed before queueing).

**Why:** Shepherd's Trail + Noah are brand-new bundle IDs with no iOS signing set up. Internal distribution needs a dist cert + ad-hoc provisioning profile with CJ's registered device UDID, which requires an **interactive Apple login (Apple ID + 2FA)** that can't run headless.

### PICKUP — exact next action
CJ must choose ONE (asked, awaiting answer):
- **(A) CJ runs it interactively:** `cd archive/apps/light-snake && eas build -p ios --profile preview` — log into Apple when prompted (2FA to his devices). Then it builds (~15 min, 1 credit) and produces the install link. Email it to him.
- **(B) CJ provides an app-specific Apple password** (appleid.apple.com) → set `EXPO_APPLE_ID` + `EXPO_APPLE_APP_SPECIFIC_PASSWORD` and run `eas build -p ios --profile preview --non-interactive` headless, then email the link.
The Xcode-15 image pin is already in each `eas.json`, so the `weak let` Swift error should be gone — but the build is UNVERIFIED (this would be the first build with the pin). If it still fails on `weak let`, fall back image `macos-sonoma-14.4-xcode-15.3`.

## Other open items / decisions for CJ
- **Mascot names**: Eli (shepherd), Ari (Noah lion), are Stable's picks — CJ to confirm/rename (change `MASCOT_NAME` + 2 requires + asset filenames).
- **Ari** mane-style mismatch resolved 2026-06-10: both poses regenerated from the same base (ari-base-v5-raw.png) via Reve EDIT. Wave = ari-wave-v5b, celebrate = ari-celebrate-v5d, both cut and installed. Consistent mane, halo, cheeks confirmed.
- **Folder rename**: Shepherd's Trail still lives in `archive/apps/light-snake` internally (invisible to users). Optional cleanup = `git mv` + path fixes; leave unless CJ asks.
- **Push**: all session commits are LOCAL on `main`, not pushed. CJ to decide.
- **Noah onboarding** done but never opened on a phone yet.

## Emails sent this session (from stable account to qbstabletampa@gmail.com)
- "Expo Go game links" — exp:// dev-server links (may not be tappable in Gmail; custom scheme).
- "Coach Room install link" — the working https install link for coach-room-app.
