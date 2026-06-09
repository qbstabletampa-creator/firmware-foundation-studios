import { StyleSheet, Switch, Text, View } from 'react-native';

type ToggleRowProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleRow({ label, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E8E4DC', true: '#4CAF79' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DC',
  },
  label: {
    color: '#1A1A1A',
    fontSize: 16,
  },
});
