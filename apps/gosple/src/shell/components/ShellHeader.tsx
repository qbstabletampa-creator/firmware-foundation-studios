import { Pressable, StyleSheet, Text, View } from 'react-native';

type ShellHeaderProps = {
  title: string;
  onBack?: () => void;
};

export function ShellHeader({ title, onBack }: ShellHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  backArrow: {
    color: '#D4C36A',
    fontSize: 24,
  },
  title: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
