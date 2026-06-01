import { useCallback, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { shadows } from '../theme';

type ParentGateProps = {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

const HOLD_DURATION = 2000;

export function ParentGate({
  visible,
  onSuccess,
  onCancel,
}: ParentGateProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const handlePressIn = useCallback(() => {
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        onSuccess();
      }
    });
  }, [progress, onSuccess]);

  const handlePressOut = useCallback(() => {
    animRef.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const ringSize = 80;
  const strokeWidth = 4;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.holdTitle}>Parent verification</Text>
          <Text style={styles.holdSubtitle}>Hold the button to continue</Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.holdButtonWrap}
          >
            <View style={[styles.holdButton, { width: ringSize, height: ringSize }]}>
              <Animated.View
                style={[
                  styles.holdRing,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                    borderWidth: strokeWidth,
                    borderColor: '#D4C36A',
                    opacity: progress.interpolate({
                      inputRange: [0, 0.1, 1],
                      outputRange: [0.3, 1, 1],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.holdFill,
                  {
                    width: ringSize - strokeWidth * 2,
                    height: ringSize - strokeWidth * 2,
                    borderRadius: (ringSize - strokeWidth * 2) / 2,
                    backgroundColor: '#D4C36A',
                    opacity: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    transform: [
                      {
                        scale: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.Text
                style={[
                  styles.holdIcon,
                  {
                    opacity: progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 0.8, 1],
                    }),
                  },
                ]}
              >
                {'🔒'}
              </Animated.Text>
            </View>
          </Pressable>

          <Pressable onPress={onCancel} style={styles.ghostButton}>
            <Text style={styles.ghostText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    ...shadows.card,
  },
  holdTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  holdSubtitle: {
    color: '#5A5A5A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  holdButtonWrap: {
    marginBottom: 16,
  },
  holdButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdRing: {
    position: 'absolute',
  },
  holdFill: {
    position: 'absolute',
  },
  holdIcon: {
    fontSize: 28,
  },
  ghostButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  ghostText: {
    color: '#5A5A5A',
    fontWeight: '800',
    fontSize: 16,
  },
});
