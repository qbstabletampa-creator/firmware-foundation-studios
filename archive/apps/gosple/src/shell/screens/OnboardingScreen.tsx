import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type Profile = 'Kid' | 'Teen' | 'Parent' | 'Family';

type OnboardingScreenProps = {
  gameName: string;
  onComplete: (profile: Profile) => void;
};

const PROFILES: { label: Profile; letter: string }[] = [
  { label: 'Kid', letter: 'K' },
  { label: 'Teen', letter: 'T' },
  { label: 'Parent', letter: 'P' },
  { label: 'Family', letter: 'F' },
];

export default function OnboardingScreen({ gameName, onComplete }: OnboardingScreenProps) {
  const [selected, setSelected] = useState<Profile | null>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome to {gameName}</Text>
          <Text style={styles.subtitle}>Pick your profile to get started.</Text>
        </View>

        <View style={styles.grid}>
          {PROFILES.map(({ label, letter }) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.card,
                selected === label && styles.cardSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => setSelected(label)}
            >
              <Text style={styles.cardLetter}>{letter}</Text>
              <Text style={styles.cardLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !selected && styles.buttonDisabled,
            pressed && selected ? styles.pressed : undefined,
          ]}
          onPress={() => selected && onComplete(selected)}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
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
  heading: {
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#5A5A5A',
    fontSize: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 32,
  },
  card: {
    width: '46%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E8E4DC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#D4C36A',
    shadowColor: '#D4C36A',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLetter: {
    color: '#D4C36A',
    fontSize: 36,
    fontWeight: '800',
  },
  cardLabel: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D4C36A',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
