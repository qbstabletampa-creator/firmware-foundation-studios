import { type ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle, View } from 'react-native';
import { shadows } from '../theme';

type ShellCardProps = {
  variant: 'default' | 'warm';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ShellCard({ variant, children, style }: ShellCardProps) {
  return (
    <View style={[styles.base, variant === 'default' ? styles.default : styles.warm, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    padding: 18,
    ...shadows.card,
  },
  default: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  warm: {
    backgroundColor: '#FFF8E7',
  },
});
