import { Routes, Route, Navigate } from 'react-router-dom';
import { useProfileStore } from './stores/profileStore';
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
import { MannaCatchScreen } from './screens/MannaCatchScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const onboarded = useProfileStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/gosple/onboarding" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      {/* Gosple app routes */}
      <Route path="/gosple" element={<SplashScreen />} />
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

      {/* Manna Catch app routes */}
      <Route path="/manna-catch" element={<MannaCatchScreen />} />

      {/* Studio landing page (TODO) */}
      <Route path="/" element={<Navigate to="/gosple" replace />} />
      <Route path="*" element={<Navigate to="/gosple" replace />} />
    </Routes>
  );
}
