import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type GivebackScreenProps = {
  onBack: () => void;
};

export default function GivebackScreen({ onBack }: GivebackScreenProps) {
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

        <View style={styles.card}>
          <Text style={styles.monthLabel}>Month A</Text>
          <Text style={styles.cardTitle}>Awana</Text>
          <Text style={styles.cardDescription}>
            Helping kids learn the gospel and grow in lifelong discipleship.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.monthLabel}>Month B</Text>
          <Text style={styles.cardTitle}>Hope Children's Home</Text>
          <Text style={styles.cardDescription}>
            A Florida Christian home serving children who need stability, care, and family structure.
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
  pressed: {
    opacity: 0.7,
  },
});
