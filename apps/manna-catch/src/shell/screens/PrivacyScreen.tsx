import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type PrivacyScreenProps = {
  onBack: () => void;
};

const STATEMENTS = [
  'We believe kids deserve privacy.',
  'This app collects no personal data.',
  'No analytics. No ads. No social features.',
  'All game data is stored locally on your device.',
  'Nothing leaves your phone. Ever.',
];

export default function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {STATEMENTS.map((statement) => (
          <View key={statement} style={styles.card}>
            <Text style={styles.statement}>{statement}</Text>
          </View>
        ))}
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
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statement: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  pressed: {
    opacity: 0.7,
  },
});
