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
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route
        path="/home"
        element={<ProtectedRoute><HomeScreen /></ProtectedRoute>}
      />
      <Route
        path="/gosple"
        element={<ProtectedRoute><GospleScreen /></ProtectedRoute>}
      />
      <Route
        path="/manna-catch"
        element={<ProtectedRoute><MannaCatchScreen /></ProtectedRoute>}
      />
      <Route
        path="/stats"
        element={<ProtectedRoute><StatsScreen /></ProtectedRoute>}
      />
      <Route
        path="/more"
        element={<ProtectedRoute><MoreScreen /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>}
      />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/privacy" element={<PrivacyScreen />} />
      <Route path="/giveback" element={<GivebackScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
