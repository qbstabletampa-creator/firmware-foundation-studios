import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type MenuScreenProps = {
  gameName: string;
  streak: number;
  totalGames: number;
  onPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onGiveback: () => void;
};

export default function MenuScreen({
  gameName,
  streak,
  totalGames,
  onPlay,
  onSettings,
  onAbout,
  onGiveback,
}: MenuScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.studio}>Firmware Foundation Studios</Text>
          <Text style={styles.gameName}>{gameName}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
            onPress={onPlay}
          >
            <Text style={styles.playButtonText}>Play</Text>
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={onSettings}
            >
              <Text style={styles.secondaryButtonText}>Settings</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={onAbout}
            >
              <Text style={styles.secondaryButtonText}>About</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={onGiveback}
            >
              <Text style={styles.secondaryButtonText}>Giveback</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalGames}</Text>
            <Text style={styles.statLabel}>Games</Text>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  studio: {
    color: '#D4C36A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  gameName: {
    color: '#1A1A1A',
    fontSize: 44,
    fontWeight: '800',
    marginTop: 8,
  },
  actions: {
    gap: 14,
    marginBottom: 32,
  },
  playButton: {
    backgroundColor: '#D4C36A',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  playButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '700',
  },
  statBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 'auto',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#4ECDC4',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#9A9A9A',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
