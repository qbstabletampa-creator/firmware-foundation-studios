import { Pressable, StyleSheet, Text, View } from 'react-native';
import { shadows } from '../theme';

type Profile = 'Kid' | 'Teen' | 'Parent' | 'Family';

type ProfilePickerProps = {
  selected: string | null;
  onSelect: (profile: Profile) => void;
};

const profileColors: Record<Profile, string> = {
  Kid: '#FF6B6B',
  Teen: '#4ECDC4',
  Parent: '#5BA4E6',
  Family: '#D4C36A',
};

const profiles: { name: Profile; letter: string }[] = [
  { name: 'Kid', letter: 'K' },
  { name: 'Teen', letter: 'T' },
  { name: 'Parent', letter: 'P' },
  { name: 'Family', letter: 'F' },
];

export function ProfilePicker({ selected, onSelect }: ProfilePickerProps) {
  return (
    <View style={styles.grid}>
      {profiles.map((profile) => (
        <Pressable
          key={profile.name}
          onPress={() => onSelect(profile.name)}
          style={[
            styles.card,
            selected === profile.name && styles.selectedCard,
          ]}
        >
          <Text style={[styles.letter, { color: profileColors[profile.name] }]}>
            {profile.letter}
          </Text>
          <Text style={styles.name}>{profile.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E4DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#D4C36A',
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  letter: {
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    color: '#1A1A1A',
    fontSize: 14,
    marginTop: 6,
  },
});
