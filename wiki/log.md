# Firmware Foundation Studios Log

## 2026-06-01

- Added Gosple `/play/` build lane as an exact copy for safe iteration.
- Source: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/apps/play/`.
- Working URL while SSL is pending: `http://firmwarefoundation.com/play/`.
- Target secure URL after GitHub Pages certificate issuance: `https://firmwarefoundation.com/play/`.
- Verified local tests and typecheck passed, GitHub Pages deployed, and the live `/play/` page renders the Gosple onboarding UI.
- Added `docs/.nojekyll` so GitHub Pages serves Expo `_expo` assets instead of dropping them through Jekyll.
- Investigated mobile link failure. Root cause is GitHub Pages SSL certificate missing, not the app code. DNS points to GitHub Pages and the root domain is HTTPS eligible. Next action is add or verify the `www` CNAME, wait for GitHub certificate issuance, then enforce HTTPS.

## 2026-05-31 -- Gosple live URL and code path confirmed
- Updated `pages/studio-decisions.md` with CJ's correction: keep the public URL on `/gosple` and treat Gosple as live.
- Confirmed current local source path: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/apps/gosple/`.
- Confirmed repo remote from that app folder: `https://github.com/qbstabletampa-creator/firmware-foundation-studios.git`.
- Confirmed Expo slug `gosple` and iOS bundle identifier `com.firmwarefoundation.gosple` in `app.json`.

## 2026-05-27 -- 40 plus app portfolio article added
- Updated `pages/app-factory-strategy.md` with CJ's capture/article about creating 40 plus apps.
- Clarified that the strategy is not random apps, it is one reusable Christian kids app factory, small focused launches, then scale winners.
- Updated `index.md` so Claude and future agents see the 40 plus app portfolio note first.

## 2026-05-27 -- Gosple Expo prototype started
- Created `apps/gosple` with Expo SDK 56 and TypeScript.
- Built the first playable daily puzzle shell with dark Bible card style.
- Added tested Wordle scoring logic for 4 to 8 letter words.
- Added 30 starter Bible word puzzles for the TestFlight content bank.
- Verified with `npm test` and `npm run typecheck`.
- Committed app repo: `40261c7 Start Gosple Expo prototype`.

## 2026-05-27 -- Giveback partners locked
- CJ chose Hope Children's Home, Tampa as the Month B local ministry.
- Locked rotation: Month A is Awana. Month B is Hope Children's Home, Tampa.
- Updated studio decisions, charity options, and Gosple product spec.

## 2026-05-27 -- Vault created
- Created dedicated project vault for Firmware Foundation Studios.
- Recorded studio decisions, app factory strategy, Gosple direction, build order, and charity research.
- Linked project back to main wiki and Mission Control.
