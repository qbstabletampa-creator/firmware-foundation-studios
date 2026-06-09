import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HapticsManager } from '../sound/HapticsManager';

type OnboardingScreenProps = {
  gameName: string;
  onComplete: (name: string) => void;
};

const MASCOT_NAME = 'Joy';
const JOY_WAVE = require('../../../assets/joy-wave.png');
const JOY_CELEBRATE = require('../../../assets/joy-celebrate.png');

// Warm light theme (Macadam-style bright onboarding). Cream bg means Joy's
// white body blends in cleanly with no transparency fringe.
const CREAM = '#FBF5E8';
const INK = '#221C10';
const INK2 = '#6B5E45';
const GOLD = '#D4C36A';
const GOLD_DEEP = '#B8993A';
const CARD = '#FFFFFF';
const BORDER = '#E8DEC4';

const DECOR = ['🍞', '🍯', '🍇', '⭐', '📜', '🍎'];
const { height: SCREEN_H } = Dimensions.get('window');

function FallingDecor() {
  const items = useMemo(
    () =>
      DECOR.map((icon, i) => ({
        icon,
        left: `${8 + i * 15}%`,
        delay: i * 900,
        duration: 7000 + i * 600,
        size: 24 + (i % 3) * 6,
      })),
    [],
  );
  const values = useRef(items.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(items[i].delay),
          Animated.timing(v, { toValue: 1, duration: items[i].duration, easing: Easing.linear, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [items, values]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((it, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.decor,
            {
              left: it.left as `${number}%`,
              fontSize: it.size,
              transform: [{ translateY: values[i].interpolate({ inputRange: [0, 1], outputRange: [-50, SCREEN_H + 50] }) }],
            },
          ]}
        >
          {it.icon}
        </Animated.Text>
      ))}
    </View>
  );
}

// Warm sunny glow behind Joy for the celebration (reads on cream, unlike gold rays).
function WarmGlow() {
  const discs = [
    { r: 170, o: 0.16 },
    { r: 120, o: 0.22 },
    { r: 70, o: 0.32 },
  ];
  return (
    <View style={styles.glowWrap} pointerEvents="none">
      {discs.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: d.r,
            backgroundColor: GOLD,
            opacity: d.o,
          }}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen({ gameName, onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Player');

  const stepOpacity = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const cheer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    stepOpacity.setValue(0);
    Animated.timing(stepOpacity, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [step, stepOpacity]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  useEffect(() => {
    if (step === 2) {
      cheer.setValue(0);
      HapticsManager.success();
      Animated.spring(cheer, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }
  }, [step, cheer]);

  const joyFloat = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const cheerScale = cheer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  const displayName = name.trim() || 'Player';
  const goName = () => { HapticsManager.light(); setStep(1); };
  const goCelebrate = () => { setStep(2); };
  const finish = () => { HapticsManager.success(); onComplete(displayName); };

  return (
    <SafeAreaView style={styles.screen}>
      <FallingDecor />

      <View style={styles.dots}>
        {[0, 1, 2].map((d) => (
          <View key={d} style={[styles.dot, d === step && styles.dotActive]} />
        ))}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.content, { opacity: stepOpacity }]}>
          {step === 0 && (
            <View style={styles.center}>
              <Animated.Image source={JOY_WAVE} style={[styles.joyBig, { transform: [{ translateY: joyFloat }] }]} resizeMode="contain" />
              <Text style={styles.welcome}>Welcome to</Text>
              <Text style={styles.title}>{gameName}</Text>
              <Text style={styles.promise}>Catch the blessings.{'\n'}Learn God's Word.{'\n'}Grow your streak.</Text>
            </View>
          )}

          {step === 1 && (
            <View style={styles.center}>
              <Animated.Image source={JOY_WAVE} style={[styles.joyMid, { transform: [{ translateY: joyFloat }] }]} resizeMode="contain" />
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>Hi! I'm {MASCOT_NAME}. What can I call you?</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                selectTextOnFocus
                maxLength={16}
                returnKeyType="done"
                onSubmitEditing={goCelebrate}
                placeholder="Player"
                placeholderTextColor={INK2}
                autoCapitalize="words"
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.center}>
              <View style={styles.celebrateWrap}>
                <WarmGlow />
                <Animated.Image source={JOY_CELEBRATE} style={[styles.joyBig, { transform: [{ scale: cheerScale }] }]} resizeMode="contain" />
              </View>
              <Text style={styles.welcomeName}>Welcome, {displayName}!</Text>
              <Text style={styles.welcomeSub}>Let's catch some blessings.</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.footer}>
          {step === 0 && (
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={goName}>
              <Text style={styles.buttonText}>Let's Go</Text>
            </Pressable>
          )}
          {step === 1 && (
            <>
              <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={goCelebrate}>
                <Text style={styles.buttonText}>That's Me</Text>
              </Pressable>
              <Pressable hitSlop={12} onPress={goCelebrate} style={styles.skip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            </>
          )}
          {step === 2 && (
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={finish}>
              <Text style={styles.buttonText}>Start Playing</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CREAM },
  flex: { flex: 1 },
  decor: { position: 'absolute', top: 0, opacity: 0.22 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER },
  dotActive: { backgroundColor: GOLD_DEEP, width: 22 },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  center: { alignItems: 'center', width: '100%' },

  joyBig: { width: 210, height: 210, marginBottom: 12 },
  joyMid: { width: 140, height: 140, marginBottom: 12 },

  celebrateWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  glowWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  welcome: { color: INK2, fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  title: { color: INK, fontSize: 46, fontWeight: '900', marginTop: 2, marginBottom: 20, textAlign: 'center' },
  promise: { color: INK, fontSize: 20, fontWeight: '700', lineHeight: 32, textAlign: 'center' },

  bubble: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 24,
    maxWidth: 320,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  bubbleText: { color: INK, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 60,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: GOLD,
    color: INK,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  welcomeName: { color: GOLD_DEEP, fontSize: 40, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  welcomeSub: { color: INK, fontSize: 18, fontWeight: '700', marginTop: 8, textAlign: 'center' },

  footer: { paddingHorizontal: 28, paddingBottom: 28 },
  button: {
    backgroundColor: GOLD,
    borderRadius: 18,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD_DEEP,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: { color: '#221C10', fontSize: 18, fontWeight: '900' },
  skip: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  skipText: { color: INK2, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
