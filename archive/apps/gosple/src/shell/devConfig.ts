/**
 * Dev-only toggles. Each is gated on __DEV__ so it is automatically OFF in any
 * production / store build. Never hard-code one of these to `true`.
 *
 * FORCE_ONBOARDING: when true, the app always shows the onboarding flow on
 * launch, ignoring the saved `hasCompletedOnboarding` flag. Lets us review the
 * onboarding on every Expo Go test without clearing AsyncStorage. Auto-off in
 * production, so real users still only see onboarding once.
 */
export const FORCE_ONBOARDING = __DEV__;
