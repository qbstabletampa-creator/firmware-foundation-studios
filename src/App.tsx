import { Routes, Route, Navigate } from 'react-router-dom';
import { useProfileStore } from './stores/profileStore';
import { StudioScreen } from './screens/StudioScreen';
import { GospleListingScreen } from './screens/GospleListingScreen';
import { MannaCatchListingScreen } from './screens/MannaCatchListingScreen';
import { MannaCatchGameScreen } from './screens/MannaCatchGameScreen';
import { MannaCatchSplashScreen } from './screens/MannaCatchSplashScreen';
import { MannaCatchOnboardingScreen } from './screens/MannaCatchOnboardingScreen';
import { MannaCatchHomeScreen } from './screens/MannaCatchHomeScreen';
import { MannaCatchStatsScreen } from './screens/MannaCatchStatsScreen';
import { MannaCatchMoreScreen } from './screens/MannaCatchMoreScreen';
import { MannaCatchSettingsScreen } from './screens/MannaCatchSettingsScreen';
import { NoahAnimalMatchListingScreen } from './screens/NoahAnimalMatchListingScreen';
import { NoahAnimalMatchSplashScreen } from './screens/NoahAnimalMatchSplashScreen';
import { NoahAnimalMatchOnboardingScreen } from './screens/NoahAnimalMatchOnboardingScreen';
import { NoahAnimalMatchHomeScreen } from './screens/NoahAnimalMatchHomeScreen';
import { NoahAnimalMatchGameScreen } from './screens/NoahAnimalMatchGameScreen';
import { NoahAnimalMatchStatsScreen } from './screens/NoahAnimalMatchStatsScreen';
import { NoahAnimalMatchMoreScreen } from './screens/NoahAnimalMatchMoreScreen';
import { NoahAnimalMatchSettingsScreen } from './screens/NoahAnimalMatchSettingsScreen';
import { ArkHopperListingScreen } from './screens/ArkHopperListingScreen';
import { ArkHopperSplashScreen } from './screens/ArkHopperSplashScreen';
import { ArkHopperOnboardingScreen } from './screens/ArkHopperOnboardingScreen';
import { ArkHopperHomeScreen } from './screens/ArkHopperHomeScreen';
import { ArkHopperGameScreen } from './screens/ArkHopperGameScreen';
import { ArkHopperStatsScreen } from './screens/ArkHopperStatsScreen';
import { ArkHopperMoreScreen } from './screens/ArkHopperMoreScreen';
import { ArkHopperSettingsScreen } from './screens/ArkHopperSettingsScreen';
import { LightSnakeListingScreen } from './screens/LightSnakeListingScreen';
import { LightSnakeSplashScreen } from './screens/LightSnakeSplashScreen';
import { LightSnakeOnboardingScreen } from './screens/LightSnakeOnboardingScreen';
import { LightSnakeHomeScreen } from './screens/LightSnakeHomeScreen';
import { LightSnakeGameScreen } from './screens/LightSnakeGameScreen';
import { LightSnakeStatsScreen } from './screens/LightSnakeStatsScreen';
import { LightSnakeMoreScreen } from './screens/LightSnakeMoreScreen';
import { LightSnakeSettingsScreen } from './screens/LightSnakeSettingsScreen';
import { BibleBrickBreakerListingScreen } from './screens/BibleBrickBreakerListingScreen';
import { BibleBrickBreakerSplashScreen } from './screens/BibleBrickBreakerSplashScreen';
import { BibleBrickBreakerOnboardingScreen } from './screens/BibleBrickBreakerOnboardingScreen';
import { BibleBrickBreakerHomeScreen } from './screens/BibleBrickBreakerHomeScreen';
import { BibleBrickBreakerGameScreen } from './screens/BibleBrickBreakerGameScreen';
import { BibleBrickBreakerStatsScreen } from './screens/BibleBrickBreakerStatsScreen';
import { BibleBrickBreakerMoreScreen } from './screens/BibleBrickBreakerMoreScreen';
import { BibleBrickBreakerSettingsScreen } from './screens/BibleBrickBreakerSettingsScreen';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { StatsScreen } from './screens/StatsScreen';
import { MoreScreen } from './screens/MoreScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { GivebackScreen } from './screens/GivebackScreen';
import { GospleScreen } from './screens/GospleScreen';

function ProtectedRoute({ children, redirectTo = '/gosple/onboarding' }: { children: React.ReactNode; redirectTo?: string }) {
  const onboarded = useProfileStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      {/* Studio homepage */}
      <Route path="/" element={<StudioScreen />} />

      {/* Gosple listing page (App Store style) */}
      <Route path="/gosple" element={<GospleListingScreen />} />

      {/* Gosple app routes */}
      <Route path="/gosple/app" element={<SplashScreen />} />
      <Route path="/gosple/onboarding" element={<OnboardingScreen />} />
      <Route
        path="/gosple/home"
        element={<ProtectedRoute><HomeScreen /></ProtectedRoute>}
      />
      <Route
        path="/gosple/play"
        element={<ProtectedRoute><GospleScreen /></ProtectedRoute>}
      />
      <Route
        path="/gosple/stats"
        element={<ProtectedRoute><StatsScreen /></ProtectedRoute>}
      />
      <Route
        path="/gosple/more"
        element={<ProtectedRoute><MoreScreen /></ProtectedRoute>}
      />
      <Route
        path="/gosple/settings"
        element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>}
      />
      <Route path="/gosple/about" element={<AboutScreen />} />
      <Route path="/gosple/privacy" element={<PrivacyScreen />} />
      <Route path="/gosple/giveback" element={<GivebackScreen />} />

      {/* Manna Catch listing page (App Store style) */}
      <Route path="/manna-catch" element={<MannaCatchListingScreen />} />

      {/* Manna Catch app routes */}
      <Route path="/manna-catch/app" element={<MannaCatchSplashScreen />} />
      <Route path="/manna-catch/onboarding" element={<MannaCatchOnboardingScreen />} />
      <Route path="/manna-catch/home" element={<ProtectedRoute redirectTo="/manna-catch/onboarding"><MannaCatchHomeScreen /></ProtectedRoute>} />
      <Route path="/manna-catch/play" element={<MannaCatchGameScreen />} />
      <Route path="/manna-catch/stats" element={<ProtectedRoute redirectTo="/manna-catch/onboarding"><MannaCatchStatsScreen /></ProtectedRoute>} />
      <Route path="/manna-catch/more" element={<ProtectedRoute redirectTo="/manna-catch/onboarding"><MannaCatchMoreScreen /></ProtectedRoute>} />
      <Route path="/manna-catch/settings" element={<ProtectedRoute redirectTo="/manna-catch/onboarding"><MannaCatchSettingsScreen /></ProtectedRoute>} />

      {/* Noah Animal Match listing page (App Store style) */}
      <Route path="/noah-animal-match" element={<NoahAnimalMatchListingScreen />} />

      {/* Noah Animal Match app routes */}
      <Route path="/noah-animal-match/app" element={<NoahAnimalMatchSplashScreen />} />
      <Route path="/noah-animal-match/onboarding" element={<NoahAnimalMatchOnboardingScreen />} />
      <Route path="/noah-animal-match/home" element={<ProtectedRoute redirectTo="/noah-animal-match/onboarding"><NoahAnimalMatchHomeScreen /></ProtectedRoute>} />
      <Route path="/noah-animal-match/play" element={<NoahAnimalMatchGameScreen />} />
      <Route path="/noah-animal-match/stats" element={<ProtectedRoute redirectTo="/noah-animal-match/onboarding"><NoahAnimalMatchStatsScreen /></ProtectedRoute>} />
      <Route path="/noah-animal-match/more" element={<ProtectedRoute redirectTo="/noah-animal-match/onboarding"><NoahAnimalMatchMoreScreen /></ProtectedRoute>} />
      <Route path="/noah-animal-match/settings" element={<ProtectedRoute redirectTo="/noah-animal-match/onboarding"><NoahAnimalMatchSettingsScreen /></ProtectedRoute>} />

      {/* Ark Hopper listing page (App Store style) */}
      <Route path="/ark-hopper" element={<ArkHopperListingScreen />} />

      {/* Ark Hopper app routes */}
      <Route path="/ark-hopper/app" element={<ArkHopperSplashScreen />} />
      <Route path="/ark-hopper/onboarding" element={<ArkHopperOnboardingScreen />} />
      <Route path="/ark-hopper/home" element={<ProtectedRoute redirectTo="/ark-hopper/onboarding"><ArkHopperHomeScreen /></ProtectedRoute>} />
      <Route path="/ark-hopper/play" element={<ArkHopperGameScreen />} />
      <Route path="/ark-hopper/stats" element={<ProtectedRoute redirectTo="/ark-hopper/onboarding"><ArkHopperStatsScreen /></ProtectedRoute>} />
      <Route path="/ark-hopper/more" element={<ProtectedRoute redirectTo="/ark-hopper/onboarding"><ArkHopperMoreScreen /></ProtectedRoute>} />
      <Route path="/ark-hopper/settings" element={<ProtectedRoute redirectTo="/ark-hopper/onboarding"><ArkHopperSettingsScreen /></ProtectedRoute>} />

      {/* Light Snake */}
      <Route path="/light-snake" element={<LightSnakeListingScreen />} />
      {/* Light Snake App */}
      <Route path="/light-snake/app" element={<LightSnakeSplashScreen />} />
      <Route path="/light-snake/onboarding" element={<LightSnakeOnboardingScreen />} />
      <Route path="/light-snake/home" element={<ProtectedRoute redirectTo="/light-snake/onboarding"><LightSnakeHomeScreen /></ProtectedRoute>} />
      <Route path="/light-snake/play" element={<ProtectedRoute redirectTo="/light-snake/onboarding"><LightSnakeGameScreen /></ProtectedRoute>} />
      <Route path="/light-snake/stats" element={<ProtectedRoute redirectTo="/light-snake/onboarding"><LightSnakeStatsScreen /></ProtectedRoute>} />
      <Route path="/light-snake/more" element={<ProtectedRoute redirectTo="/light-snake/onboarding"><LightSnakeMoreScreen /></ProtectedRoute>} />
      <Route path="/light-snake/settings" element={<ProtectedRoute redirectTo="/light-snake/onboarding"><LightSnakeSettingsScreen /></ProtectedRoute>} />

      {/* Bible Brick Breaker */}
      <Route path="/bible-brick-breaker" element={<BibleBrickBreakerListingScreen />} />
      {/* Bible Brick Breaker App */}
      <Route path="/bible-brick-breaker/app" element={<BibleBrickBreakerSplashScreen />} />
      <Route path="/bible-brick-breaker/onboarding" element={<BibleBrickBreakerOnboardingScreen />} />
      <Route path="/bible-brick-breaker/home" element={<ProtectedRoute redirectTo="/bible-brick-breaker/onboarding"><BibleBrickBreakerHomeScreen /></ProtectedRoute>} />
      <Route path="/bible-brick-breaker/play" element={<ProtectedRoute redirectTo="/bible-brick-breaker/onboarding"><BibleBrickBreakerGameScreen /></ProtectedRoute>} />
      <Route path="/bible-brick-breaker/stats" element={<ProtectedRoute redirectTo="/bible-brick-breaker/onboarding"><BibleBrickBreakerStatsScreen /></ProtectedRoute>} />
      <Route path="/bible-brick-breaker/more" element={<ProtectedRoute redirectTo="/bible-brick-breaker/onboarding"><BibleBrickBreakerMoreScreen /></ProtectedRoute>} />
      <Route path="/bible-brick-breaker/settings" element={<ProtectedRoute redirectTo="/bible-brick-breaker/onboarding"><BibleBrickBreakerSettingsScreen /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
