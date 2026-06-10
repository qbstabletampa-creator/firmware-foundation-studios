import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type Ministry = { name: string; description: string; url: string };

type GivebackScreenProps = {
  monthA: Ministry;
  monthB: Ministry;
  onBack: () => void;
};

function openUrl(url: string) {
  Linking.openURL(url).catch(() => {
    // Swallow — a missing browser / bad URL must never crash the screen.
  });
}

function MinistryCard({ label, ministry }: { label: string; ministry: Ministry }) {
  return (
    <Pressable
      onPress={() => openUrl(ministry.url)}
      accessibilityRole="link"
      accessibilityLabel={`${ministry.name}. ${ministry.description} Opens in your browser.`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.monthLabel}>{label}</Text>
      <Text style={styles.cardTitle}>{ministry.name}</Text>
      <Text style={styles.cardDescription}>{ministry.description}</Text>
      <Text style={styles.cardLink}>Learn more ↗</Text>
    </Pressable>
  );
}

export default function GivebackScreen({ monthA, monthB, onBack }: GivebackScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Giveback</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          {'❤️'} 10% of every purchase supports ministries that serve children.
        </Text>

        <MinistryCard label="Month A" ministry={monthA} />
        <MinistryCard label="Month B" ministry={monthB} />
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
    gap: 20,
  },
  intro: {
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  card: {
    backgroundColor: '#FFF8E7',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  monthLabel: {
    color: '#B8A94E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDescription: {
    color: '#5A5A5A',
    fontSize: 15,
    lineHeight: 22,
  },
  cardLink: {
    color: '#B8A94E',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
