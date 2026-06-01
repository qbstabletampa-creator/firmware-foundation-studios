import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type AboutScreenProps = {
  gameName: string;
  version: string;
  onBack: () => void;
};

export default function AboutScreen({ gameName, version, onBack }: AboutScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.studio}>Firmware Foundation Studios</Text>
        <Text style={styles.gameName}>{gameName}</Text>
        <Text style={styles.version}>Version {version}</Text>

        <Text style={styles.description}>
          Safe, joyful games rooted in Scripture for Christian families.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with love for families everywhere.
          </Text>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  studio: {
    color: '#D4C36A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  gameName: {
    color: '#1A1A1A',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  version: {
    color: '#9A9A9A',
    fontSize: 14,
    marginTop: 4,
  },
  description: {
    color: '#5A5A5A',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerText: {
    color: '#9A9A9A',
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
