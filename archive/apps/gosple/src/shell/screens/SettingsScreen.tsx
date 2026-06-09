import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

type SettingsScreenProps = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  currentProfile: string;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onToggleNotifications: () => void;
  onChangeProfile: () => void;
  onBack: () => void;
};

type ToggleRowProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

function ToggleRow({ label, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D2D2D2', true: '#4CAF79' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function SettingsScreen({
  soundEnabled,
  hapticsEnabled,
  notificationsEnabled,
  currentProfile,
  onToggleSound,
  onToggleHaptics,
  onToggleNotifications,
  onChangeProfile,
  onBack,
}: SettingsScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.toggleCard}>
          <ToggleRow label="Sound" value={soundEnabled} onToggle={onToggleSound} />
          <ToggleRow label="Haptics" value={hapticsEnabled} onToggle={onToggleHaptics} />
          <ToggleRow label="Notifications" value={notificationsEnabled} onToggle={onToggleNotifications} />
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Name</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileValue}>{currentProfile}</Text>
            <Pressable
              onPress={onChangeProfile}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={styles.changeButton}>Change</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFBF0',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 14,
  },
  backButton: {
    paddingRight: 14,
  },
  backArrow: {
    color: '#D4C36A',
    fontSize: 24,
  },
  headerTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  headerSpacer: {
    width: 38,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DC',
  },
  toggleLabel: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileLabel: {
    color: '#9A9A9A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileValue: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  changeButton: {
    color: '#D4C36A',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
