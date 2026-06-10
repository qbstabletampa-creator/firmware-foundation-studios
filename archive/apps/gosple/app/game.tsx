import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { normalizeGuess, scoreGuess, TileScore } from '../src/game/wordleEngine';
import {
  getDayNumber,
  getDisplayDay,
  getTodayDateString,
  getTodayPuzzle,
} from '../src/game/dailyPuzzle';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import { SoundManager } from '../src/shell/sound/SoundManager';
import BadgeCelebration from '../src/shell/components/BadgeCelebration';
import { useBadgeStore } from '../src/shell/stores/badgeStore';
import { useStreakStore } from '../src/shell/stores/streakStore';
import { useDailyBoardStore } from '../src/shell/stores/dailyBoardStore';
import { colors, radii, spacing, typography } from '../src/shell/theme';

const MAX_ATTEMPTS = 6;
const MAX_WORD_LEN = 8;
const FLIP_MS = 300;
const FLIP_STAGGER_MS = 200;

type LetterStatus = 'correct' | 'present' | 'absent';
type GuessRow = { guess: string; scores: TileScore[] };

const KB_ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const KB_ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const KB_ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

function buildLetterMap(rows: GuessRow[]): Map<string, LetterStatus> {
  const map = new Map<string, LetterStatus>();
  for (const row of rows) {
    for (let i = 0; i < row.guess.length; i++) {
      const letter = row.guess[i];
      const score = row.scores[i];
      const current = map.get(letter);
      if (score === 'correct') {
        map.set(letter, 'correct');
      } else if (score === 'present' && current !== 'correct') {
        map.set(letter, 'present');
      } else if (score === 'absent' && current === undefined) {
        map.set(letter, 'absent');
      }
    }
  }
  return map;
}

const screenWidth = Dimensions.get('window').width;
const kbPadding = spacing.sm;
const kbGap = 5;
const maxKeysInRow = 10;
const keyWidth = Math.floor(
  (screenWidth - kbPadding * 2 - kbGap * (maxKeysInRow - 1)) / maxKeysInRow,
);
const keyHeight = 46;
const tileSize = Math.min(52, (screenWidth - spacing.xl * 2 - spacing.sm * 7) / 8);

export default function GameScreen() {
  const router = useRouter();
  const recordPlay = useStreakStore((s) => s.recordPlay);
  const processEvent = useBadgeStore((s) => s.processEvent);
  const newlyUnlocked = useBadgeStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useBadgeStore((s) => s.clearNewlyUnlocked);
  const [celebratingBadge, setCelebratingBadge] = useState<typeof newlyUnlocked[number] | null>(null);

  // One source of truth for "today": day number, puzzle, and date string all
  // come from the same local-calendar helper, so the word, hasPlayedToday, and
  // streak agree and roll over together at LOCAL midnight.
  const today = useMemo(() => getTodayDateString(), []);
  const dayNumber = useMemo(() => getDayNumber(), []);
  const displayDay = useMemo(() => getDisplayDay(), []);
  const puzzle = useMemo(() => getTodayPuzzle(), []);
  const wordLength = puzzle.answer.length;

  const loadForDay = useDailyBoardStore((s) => s.loadForDay);
  const saveBoard = useDailyBoardStore((s) => s.save);

  // Restore today's board ONCE on mount. If today is already completed we lock
  // the solved/locked board (verse + share state) instead of dealing a fresh one.
  const restored = useRef(loadForDay(dayNumber)).current;

  const [currentGuess, setCurrentGuess] = useState('');
  const [rows, setRows] = useState<GuessRow[]>(restored.rows);
  const [message, setMessage] = useState('');
  const [gameRecorded, setGameRecorded] = useState(restored.completed);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Tiles in restored rows are already revealed (no flip replay on resume).
  const [revealedTiles, setRevealedTiles] = useState<boolean[][]>(
    restored.rows.map((r) => r.guess.split('').map(() => true)),
  );

  const flipAnims = useRef(
    Array.from({ length: MAX_ATTEMPTS }, () =>
      Array.from({ length: MAX_WORD_LEN }, () => new Animated.Value(0)),
    ),
  ).current;

  const bounceAnims = useRef(
    Array.from({ length: MAX_ATTEMPTS }, () =>
      Array.from({ length: MAX_WORD_LEN }, () => new Animated.Value(0)),
    ),
  ).current;

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const popAnims = useRef(
    Array.from({ length: MAX_WORD_LEN }, () => new Animated.Value(1)),
  ).current;

  // Verse is already visible on a restored completed board (no fade replay).
  const verseOpacity = useRef(new Animated.Value(restored.completed ? 1 : 0)).current;

  const solved = rows.some((row) => row.guess === puzzle.answer);
  const gameOver = solved || rows.length >= MAX_ATTEMPTS;
  const letterMap = useMemo(() => buildLetterMap(rows), [rows]);

  useEffect(() => {
    // Don't pop the how-to modal over an already-completed board on resume.
    if (restored.completed) return;
    AsyncStorage.getItem('@ffs/howtoplay').then((val) => {
      if (val !== 'seen') setShowHowToPlay(true);
    });
  }, [restored.completed]);

  // Persist the board on every change so killing the app mid-game never loses
  // progress. Keyed by day number; a new day resets via loadForDay on mount.
  useEffect(() => {
    saveBoard(dayNumber, rows, currentGuess, solved, gameOver);
  }, [saveBoard, dayNumber, rows, currentGuess, solved, gameOver]);

  const dismissHowToPlay = useCallback(() => {
    setShowHowToPlay(false);
    AsyncStorage.setItem('@ffs/howtoplay', 'seen');
  }, []);

  const triggerShake = useCallback(() => {
    HapticsManager.medium();
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const animateFlip = useCallback(
    (rowIndex: number, onDone: () => void) => {
      setIsAnimating(true);
      const anims = flipAnims[rowIndex];
      for (let i = 0; i < wordLength; i++) {
        const delay = i * FLIP_STAGGER_MS;
        setTimeout(() => {
          Animated.timing(anims[i], {
            toValue: 1, duration: FLIP_MS, easing: Easing.linear, useNativeDriver: true,
          }).start();
        }, delay);
        setTimeout(() => {
          setRevealedTiles((prev) => {
            const next = prev.map((r) => [...r]);
            if (next[rowIndex]) next[rowIndex][i] = true;
            return next;
          });
        }, delay + FLIP_MS / 2);
      }
      const totalMs = (wordLength - 1) * FLIP_STAGGER_MS + FLIP_MS;
      setTimeout(() => { setIsAnimating(false); onDone(); }, totalMs);
    },
    [flipAnims, wordLength],
  );

  const triggerBounce = useCallback(
    (rowIndex: number) => {
      const anims = bounceAnims[rowIndex];
      for (let i = 0; i < wordLength; i++) {
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(anims[i], { toValue: -18, duration: 200, useNativeDriver: true }),
            Animated.spring(anims[i], { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 12 }),
          ]).start();
        }, i * 100);
      }
    },
    [bounceAnims, wordLength],
  );

  const triggerVerseReveal = useCallback(() => {
    SoundManager.play('verse');
    Animated.timing(verseOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [verseOpacity]);

  const submitCurrentGuess = useCallback(() => {
    const normalized = normalizeGuess(currentGuess);
    if (normalized.length !== wordLength) {
      setMessage(`Use ${wordLength} letters`);
      SoundManager.play('thorn'); // soft uh-oh on invalid word
      triggerShake();
      return;
    }
    HapticsManager.medium();
    const scores = scoreGuess(puzzle.answer, normalized);
    const newRow: GuessRow = { guess: normalized, scores };
    const nextRows = [...rows, newRow];
    const didWin = normalized === puzzle.answer;
    const rowIndex = rows.length;
    setRows(nextRows);
    setRevealedTiles((prev) => [...prev, Array(wordLength).fill(false)]);
    setCurrentGuess('');
    animateFlip(rowIndex, () => {
      if (didWin) {
        // subtle correct-row ding, then the win celebration chime.
        SoundManager.play('catch');
        SoundManager.play('levelup');
        HapticsManager.success();
        setMessage('You got it!');
        triggerBounce(rowIndex);
        setTimeout(triggerVerseReveal, 400);
      } else if (nextRows.length >= MAX_ATTEMPTS) {
        SoundManager.play('gameover'); // gentle loss
        setMessage(`The word was ${puzzle.answer}`);
        setTimeout(triggerVerseReveal, 300);
      } else {
        setMessage('');
      }
    });
  }, [currentGuess, wordLength, puzzle.answer, rows, animateFlip, triggerBounce, triggerShake, triggerVerseReveal]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || isAnimating) return;
      if (key === 'BACKSPACE') {
        SoundManager.play('tap');
        HapticsManager.light();
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }
      if (key === 'ENTER') { submitCurrentGuess(); return; }
      SoundManager.play('tap'); // quiet key tap
      HapticsManager.light();
      setCurrentGuess((prev) => {
        if (prev.length >= wordLength) return prev;
        const tileIdx = prev.length;
        popAnims[tileIdx].setValue(1.15);
        Animated.spring(popAnims[tileIdx], { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }).start();
        return prev + key;
      });
    },
    [gameOver, isAnimating, wordLength, submitCurrentGuess, popAnims],
  );

  useEffect(() => {
    if (gameOver && !gameRecorded) {
      // recordPlay returns the updated totals so badge events read consistent
      // values (no fragile getState() right after set()).
      const result = recordPlay(solved, today);
      if (solved) {
        processEvent({ type: 'game_won' });
        processEvent({ type: 'game_won_in', guesses: rows.length });
      }
      processEvent({ type: 'games_played', count: result.totalGamesPlayed });
      if (solved) processEvent({ type: 'games_won', count: result.totalGamesWon });
      processEvent({ type: 'streak_reached', streak: result.currentStreak });
      setGameRecorded(true);
    }
  }, [gameOver, gameRecorded, solved, rows.length, recordPlay, processEvent, today]);

  useEffect(() => {
    if (newlyUnlocked.length > 0 && gameRecorded && !celebratingBadge) {
      const timer = setTimeout(() => {
        setCelebratingBadge(newlyUnlocked[0]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, gameRecorded, celebratingBadge]);

  const currentLetters = currentGuess.split('');
  const attemptsLeft = MAX_ATTEMPTS - rows.length;
  const emptyRowCount = gameOver ? 0 : Math.max(0, attemptsLeft - 1);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Gosple</Text>
        <Text style={styles.headerDay}>Day {displayDay}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.board}>
          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.guess.split('').map((letter, i) => {
                const isRevealed = revealedTiles[rowIndex]?.[i] ?? false;
                const scaleY = flipAnims[rowIndex][i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 1] });
                const translateY = bounceAnims[rowIndex][i];
                return (
                  <Animated.View key={`tile-${rowIndex}-${i}`} style={[styles.tile, isRevealed ? scoredTileBg(row.scores[i]) : styles.activeTile, { transform: [{ scaleY }, { translateY }] }]}>
                    <Text style={[styles.tileText, isRevealed && row.scores[i] !== 'absent' ? styles.tileTextWhite : styles.tileTextDark]}>{letter}</Text>
                  </Animated.View>
                );
              })}
            </View>
          ))}
          {!gameOver && (
            <Animated.View style={[styles.row, { transform: [{ translateX: shakeAnim }] }]}>
              {Array.from({ length: wordLength }, (_, i) => (
                <Animated.View key={`current-${i}`} style={[styles.tile, currentLetters[i] ? styles.activeTile : styles.emptyTile, { transform: [{ scale: popAnims[i] }] }]}>
                  <Text style={[styles.tileText, styles.tileTextDark]}>{currentLetters[i] ?? ''}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}
          {Array.from({ length: emptyRowCount }, (_, ri) => (
            <View key={`empty-${ri}`} style={styles.row}>
              {Array.from({ length: wordLength }, (_, i) => (
                <View key={`empty-tile-${ri}-${i}`} style={[styles.tile, styles.emptyTile]} />
              ))}
            </View>
          ))}
        </View>
        {message !== '' && (
          <View style={styles.messageBubble}><Text style={styles.messageText}>{message}</Text></View>
        )}
        {gameOver && (
          <Animated.View style={[styles.verseCard, { opacity: verseOpacity }]}>
            <Text style={styles.cardLabel}>{puzzle.reference}</Text>
            <Text style={styles.verse}>{puzzle.verse}</Text>
            <Text style={styles.prompt}>{puzzle.kidPrompt}</Text>
          </Animated.View>
        )}
      </ScrollView>

      {!gameOver && (
        <View style={styles.keyboard}>
          <View style={styles.kbRow}>
            {KB_ROW_1.map((l) => <KeyButton key={l} label={l} status={letterMap.get(l)} onPress={handleKeyPress} />)}
          </View>
          <View style={styles.kbRow}>
            {KB_ROW_2.map((l) => <KeyButton key={l} label={l} status={letterMap.get(l)} onPress={handleKeyPress} />)}
          </View>
          <View style={styles.kbRow}>
            <WideKeyButton label="ENTER" value="ENTER" variant="enter" onPress={handleKeyPress} />
            {KB_ROW_3.map((l) => <KeyButton key={l} label={l} status={letterMap.get(l)} onPress={handleKeyPress} />)}
            <WideKeyButton label={'⌫'} value="BACKSPACE" variant="default" onPress={handleKeyPress} />
          </View>
        </View>
      )}

      <Modal visible={showHowToPlay} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>How to Play</Text>
            <Text style={styles.modalBody}>Guess the Bible word in 6 tries. Each guess must use all {wordLength} letters.</Text>
            <View style={styles.exampleSection}>
              <View style={styles.exampleRow}>
                <View style={[styles.exTile, { backgroundColor: colors.correct }]}><Text style={styles.exTileText}>F</Text></View>
                <Text style={styles.exLabel}>Green = correct spot</Text>
              </View>
              <View style={styles.exampleRow}>
                <View style={[styles.exTile, { backgroundColor: colors.present }]}><Text style={[styles.exTileText, { color: colors.textPrimary }]}>A</Text></View>
                <Text style={styles.exLabel}>Gold = wrong spot</Text>
              </View>
              <View style={styles.exampleRow}>
                <View style={[styles.exTile, { backgroundColor: colors.absent }]}><Text style={[styles.exTileText, { color: colors.textPrimary }]}>X</Text></View>
                <Text style={styles.exLabel}>Gray = not in word</Text>
              </View>
            </View>
            <Text style={styles.modalHint}>Solve it to reveal a Bible verse and a question to think about today.</Text>
            <Pressable style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]} onPress={dismissHowToPlay}>
              <Text style={styles.modalButtonText}>Let's Go!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <BadgeCelebration
        badge={celebratingBadge}
        onDismiss={() => {
          setCelebratingBadge(null);
          clearNewlyUnlocked();
        }}
      />
    </SafeAreaView>
  );
}

function scoredTileBg(score: TileScore) {
  if (score === 'correct') return styles.correctTile;
  if (score === 'present') return styles.presentTile;
  return styles.absentTile;
}

function KeyButton({ label, status, onPress }: { label: string; status: LetterStatus | undefined; onPress: (k: string) => void }) {
  const bgStyle = status === 'correct' ? styles.keyCorrect : status === 'present' ? styles.keyPresent : status === 'absent' ? styles.keyAbsent : styles.keyDefault;
  return (
    <Pressable onPress={() => onPress(label)} style={({ pressed }) => [styles.key, bgStyle, pressed && styles.pressed]}>
      <Text style={[styles.keyLabel, status === 'correct' ? styles.keyTextWhite : styles.keyTextDark]}>{label}</Text>
    </Pressable>
  );
}

function WideKeyButton({ label, value, variant, onPress }: { label: string; value: string; variant: 'enter' | 'default'; onPress: (k: string) => void }) {
  return (
    <Pressable onPress={() => onPress(value)} style={({ pressed }) => [styles.wideKey, variant === 'enter' ? styles.keyEnter : styles.keyDefault, pressed && styles.pressed]}>
      <Text style={[styles.keyLabel, variant === 'enter' ? styles.keyTextWhite : styles.keyTextDark, variant === 'enter' && { fontSize: 12, fontWeight: '800' as const }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  backArrow: { color: colors.gold, fontSize: 24, fontWeight: '700' },
  headerTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 1, flex: 1 },
  headerDay: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  board: { gap: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: { width: tileSize, height: tileSize, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emptyTile: { borderWidth: 1.5, borderColor: colors.surfaceBorder, backgroundColor: colors.surface },
  activeTile: { borderWidth: 2, borderColor: colors.gold, backgroundColor: colors.surface },
  correctTile: { backgroundColor: colors.correct },
  presentTile: { backgroundColor: colors.present },
  absentTile: { backgroundColor: colors.absent },
  tileText: { ...typography.tileText },
  tileTextDark: { color: colors.textPrimary },
  tileTextWhite: { color: '#FFFFFF' },
  messageBubble: { marginTop: spacing.md, alignSelf: 'center', backgroundColor: colors.textPrimary, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  messageText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  verseCard: { marginTop: spacing.xl, borderRadius: radii.xl, backgroundColor: colors.verseCard, padding: spacing.lg, borderWidth: 1, borderColor: colors.surfaceBorder },
  cardLabel: { color: colors.goldMuted, ...typography.cardLabel },
  verse: { color: colors.verseCardText, ...typography.verse, marginTop: spacing.sm + 2 },
  prompt: { color: colors.verseCardText, ...typography.body, marginTop: spacing.sm + 2, opacity: 0.7, fontStyle: 'italic' },
  keyboard: { paddingHorizontal: kbPadding, paddingBottom: spacing.md, gap: kbGap },
  kbRow: { flexDirection: 'row', justifyContent: 'center', gap: kbGap },
  key: { width: keyWidth, height: keyHeight, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  wideKey: { flex: 1.5, height: keyHeight, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  keyDefault: { backgroundColor: '#E8E4DC' },
  keyEnter: { backgroundColor: colors.correct },
  keyCorrect: { backgroundColor: colors.correct },
  keyPresent: { backgroundColor: colors.present },
  keyAbsent: { backgroundColor: '#BDBDBD' },
  keyLabel: { fontSize: 15, fontWeight: '700' },
  keyTextWhite: { color: '#FFFFFF' },
  keyTextDark: { color: colors.textPrimary },
  pressed: { opacity: 0.7 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, width: '100%', maxWidth: 340 },
  modalTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: spacing.md },
  modalBody: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  exampleSection: { gap: spacing.md, marginBottom: spacing.lg },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exTile: { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  exTileText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  exLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  modalHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 },
  modalButton: { backgroundColor: colors.gold, borderRadius: radii.lg, height: 52, alignItems: 'center', justifyContent: 'center' },
  modalButtonText: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
});
