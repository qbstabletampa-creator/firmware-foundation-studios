import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ParentGate } from '../../src/shell/components/ParentGate';
import { useParentGateStore } from '../../src/shell/stores/parentGateStore';
import { useProfileStore } from '../../src/shell/stores/profileStore';
import { colors, radii, shadows, spacing, typography } from '../../src/shell/theme';

type MoreItem = {
  icon: string;
  label: string;
  route: '/settings' | '/about' | '/privacy' | '/giveback';
  gated: boolean;
};

const ITEMS: MoreItem[] = [
  { icon: '⚙️', label: 'Settings', route: '/settings', gated: true },
  { icon: 'ℹ️', label: 'About', route: '/about', gated: false },
  { icon: '🔒', label: 'Privacy', route: '/privacy', gated: false },
  { icon: '💛', label: 'Giveback', route: '/giveback', gated: false },
];

export default function MoreTab() {
  const router = useRouter();
  const currentProfile = useProfileStore((s) => s.currentProfile);
  const unlock = useParentGateStore((s) => s.unlock);

  const [gateVisible, setGateVisible] = useState(false);

  const handleGateSuccess = useCallback(() => {
    setGateVisible(false);
    unlock();
    router.push('/settings');
  }, [unlock, router]);

  const handleGateCancel = useCallback(() => {
    setGateVisible(false);
  }, []);

  const handlePress = useCallback(
    (item: MoreItem) => {
      if (item.gated) {
        setGateVisible(true);
        return;
      }
      router.push(item.route);
    },
    [router],
  );

  const handleChangeProfile = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.heading}>More</Text>

          <Pressable
            style={({ pressed }) => [styles.profileCard, pressed && styles.pressed]}
            onPress={handleChangeProfile}
          >
            <View style={styles.profileLeft}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {(currentProfile ?? 'F')[0]}
                </Text>
              </View>
              <View>
                <Text style={styles.profileName}>{currentProfile ?? 'Family'}</Text>
                <Text style={styles.profileHint}>Tap to change</Text>
              </View>
            </View>
            <Text style={styles.arrow}>{'›'}</Text>
          </Pressable>

          <View style={styles.list}>
            {ITEMS.map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => handlePress(item)}
              >
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.arrow}>{'›'}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ParentGate
        visible={gateVisible}
        onSuccess={handleGateSuccess}
        onCancel={handleGateCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heading: {
    color: colors.textPrimary,
    ...typography.heading,
    marginBottom: spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '800',
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  profileHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '400',
  },
  pressed: {
    opacity: 0.7,
  },
});
