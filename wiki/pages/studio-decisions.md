# Studio Decisions

**Summary:** Locked product and brand decisions for Firmware Foundation Studios.
**Last Updated:** 2026-06-01
**Sources:** CJ Telegram planning thread, CJ Telegram correction on live Gosple URL, CJ Telegram direction for `/play` build lane.
**Related:** [[app-factory-strategy]], [[gosple-product-spec]], [[charity-options]]

---

## Locked Decisions

- Studio name: Firmware Foundation Studios
- Public posture: public Christian
- Relationship to CJ: CJ can promote it from his brand, but the studio stands separate
- Audience: all ages
- Category feel: Christian arcade
- First platform: iPhone
- First app: Gosple
- First app style: pure daily Wordle style app
- Bible translation preference: NIV
- Price target: $4.99
- Giveback: 10 percent tithe to charity, rotating month to month between Awana and Hope Children's Home, Tampa
- Audio: no narration at launch, sound effects only
- Offline: yes
- Jesus: okay to show Jesus
- Visual direction: clean 2D first, bright cartoon, premium 3D eventually

## Jesus Art Direction

Internal reference: warm friendly cartoon Jesus with the approachable feel CJ likes from The Chosen.

Public and production rule: do not copy an actor likeness, protected show styling, or protected character design.

Use this safer language in prompts and briefs:

> Warm, friendly, respectful cartoon Jesus. Kind eyes, gentle expression, soft robe, simple first century setting, approachable for children, bright and peaceful, not cheesy, not scary, not overly realistic.

## Open Decisions

- Final legal entity name
- Final legal copy for charity and tithe language
- NIV licensing path
- First app store title and subtitle
- Exact icon and color system

## Live URL Decision

- Keep Firmware Foundation Studios Gosple public URL on the `/gosple` path.
- Treat the app as live, not just a concept or prototype, when discussing current status.
- Current local source of truth for code: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/apps/gosple/`.
- Expo slug: `gosple`; iOS bundle identifier: `com.firmwarefoundation.gosple`.

## Play Build Lane

- `/play/` is CJ's owned build lane for iterating on Gosple without risking the live app path.
- Working URL while GitHub Pages SSL is pending: `http://firmwarefoundation.com/play/`.
- Target secure URL after certificate issuance: `https://firmwarefoundation.com/play/`.
- Source path: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/apps/play/`.
- Web export path: `/mnt/c/Users/rodge/projects/firmware-foundation-studios/docs/play/`.
- Starting point is an exact Gosple copy in play and format. Build future changes on this lane first.
- GitHub Pages requires `/mnt/c/Users/rodge/projects/firmware-foundation-studios/docs/.nojekyll` so Expo `_expo` assets serve correctly.
- Current security state: GitHub Pages serves the domain, DNS points to GitHub Pages, and the root domain is HTTPS eligible, but the certificate has not been issued yet. Add or verify `www` CNAME to `qbstabletampa-creator.github.io`, wait for GitHub certificate issuance, then enforce HTTPS.
