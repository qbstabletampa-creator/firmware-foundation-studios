# Premium Mobile App Polish Capture

**Summary:** Beto Moedano's X post explains that premium mobile apps do not feel premium because of flashy animation. They feel premium because of many small, quiet choices: press states, subtle motion, haptics, keyboard behavior, and loading or empty states. This is a useful polish checklist for Firmware Foundation Studios and future iOS or PWA packaging.
**Last Updated:** 2026-06-04
**Sources:** https://x.com/betomoedano/status/2062532323573203088?s=46&t=Ox-PkSy3jbzjSpZ1EUETsw
**Related:** [[macadam-onboarding-gamification-capture]], [[gosple-product-spec]], [[app-factory-strategy]], [[elite-upgrade-plan]]

---

## Notes

Capture type: Reference, UX pattern, build checklist.

Beto's core point:

> Most developers think premium means flashy. It doesn't. Premium apps feel right.

The post breaks that feeling into 5 details:

1. **Press states and spring physics**
   - Buttons should feel alive immediately.
   - Tiny scale down and spring response during the touch window matters.
   - Dead buttons make an app feel cheap before the action even fires.

2. **Subtle animations**
   - Motion should answer a question the user just asked.
   - Keep it short, roughly 150 to 300ms.
   - Avoid animation that exists only to show off.

3. **Haptics**
   - Haptics build physical trust when used for meaningful state changes.
   - Do not buzz on everything.
   - Use them for moments like completed action, reward, selection, or important transition.

4. **Keyboard behavior**
   - Inputs should never feel like a fight.
   - Submit buttons should stay visible.
   - Drag to dismiss should feel intentional.
   - This matters for sign in, naming, feedback, parent email capture, and future account flows.

5. **Loading and empty states**
   - Never show a blank screen when the app is thinking.
   - Skeletons, shimmer, and useful messages make waiting feel shorter.
   - Empty states should tell the kid or parent what to do next.

## Why It Matters

This maps directly to the FFS quality bar.

Kids games do not need luxury UI. They need trust, clarity, warmth, and responsiveness. Parents need the app to feel safe and cared for. Small polish decisions can make a simple web game feel like a real product without adding noise.

For Gosple and the wider FFS arcade, the lesson is:

- Do not chase flashy effects.
- Make every tap respond.
- Make waiting feel intentional.
- Make empty screens explain the next step.
- Use gentle feedback, not manipulative dopamine loops.

## Connections

### Firmware Foundation Studios

Use this as a polish checklist before App Store or PWA release:

- Tap response on all primary buttons.
- Button down state within the first touch moment.
- 150 to 300ms transition timing.
- Haptic moments only where they mean something.
- Loading and empty states for every async screen.
- Keyboard safe forms for parent email, account, name, or feedback.

### Gosple

Possible Gosple polish targets:

- Key press feedback on the game board.
- Gentle success haptic on solved word.
- Small miss feedback when a guess is invalid.
- Loading copy for daily puzzle fetch.
- Empty state if puzzle fails: clear message, retry button, no dead screen.

### AI Gameplan

Good lesson example:

> Premium is not one big AI generated design. It is 50 small human decisions stacked together.

This fits the agent lesson around review loops: an agent can build the screen, but the human taste checklist decides whether it feels right.

## Possible Uses

- Add a FFS "premium feel" QA pass.
- Turn this into a reusable checklist for app review.
- Use it in Reagan's AI Gameplan as a lesson on product taste.
- Ask Codex or Claude to audit current FFS games against these 5 details.

## Open Questions

- Should FFS add haptics now for mobile web, or wait until native packaging?
- Which games need press state polish first?
- Should the Elite Upgrade Plan get a formal Phase 6: feel pass?
