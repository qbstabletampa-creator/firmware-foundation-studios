import { Pressable, StyleSheet, Text } from 'react-native';
import { shadows } from '../theme';

type ShellButtonProps = {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost';
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

const variantStyles = {
  primary: {
    container: { backgroundColor: '#D4C36A', ...shadows.button },
    text: { color: '#1A1A1A' },
  },
  secondary: {
    container: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E4DC',
      ...shadows.button,
    },
    text: { color: '#1A1A1A' },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: '#D4C36A' },
  },
} as const;

export function ShellButton({
  label,
  variant,
  onPress,
  disabled = false,
  fullWidth = false,
}: ShellButtonProps) {
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        v.container,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, v.text]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontWeight: '800',
    fontSize: 16,
  },
});
