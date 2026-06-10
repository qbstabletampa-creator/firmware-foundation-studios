import * as Haptics from 'expo-haptics';

let enabled = true;

function light(): void {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function medium(): void {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

function success(): void {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

function warning(): void {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

function setEnabled(value: boolean): void {
  enabled = value;
}

export const HapticsManager = { light, medium, success, warning, setEnabled };
