import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { verseBank } from '@ffs/verses/verseBank';
import { getVersesForSession, getVersesForDaily } from '@ffs/verses/selectionEngine';
import type { Verse, VerseTheme } from '@ffs/verses/types';
import {
  changeDirection,
  createInitialState,
  tick,
  type Direction,
  type GameEvent,
  type GameState,
} from '../src/game/gameEngine';
import { createRng, seedFromDate } from '../src/game/prng';
import { useLightSnakeGameStore } from '../src/game/stores/lightSnakeGameStore';
import { spriteForFood, LANTERN, THORN } from '../src/game/spriteMap';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import BadgeCelebration from '../src/shell/components/BadgeCelebration';
import { useBadgeStore } from '../src/shell/stores/badgeStore';
import { useStreakStore } from '../src/shell/stores/streakStore';
import { colors, radii, spacing, typography } from '../src/shell/theme';
import GameBackground, { LIGHT_SNAKE_PALETTE } from '../src/shell/components/GameBackground';

const VERSE_THEMES: VerseTheme[] = ['light', 'truth', 'hope', 'faith', 'trust', 'wisdom'];

const GRID_COLS = 15;
const GRID_ROWS = 20;
const COUNTDOWN_FROM = 3;
const MIN_SWIPE = 18;
const MAX_BOARD_WIDTH = 460;

type GameMode = 'daily' | 'freeplay';
type ScreenMode = 'select' | 'playing' | 'gameover';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function speedLevel(speed: number): number {
  // Engine: speed = 1 + level * 0.5  ->  level = (speed - 1) / 0.5
  return Math.round((speed - 1) / 0.5) + 1;
}

export default function GameScreen() {
  const router = useRouter();
  const recordPlay = useStreakStore((s) => s.recordPlay);
  const processEvent = useBadgeStore((s) => s.processEvent);
  const newlyUnlocked = useBadgeStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useBadgeStore((s) => s.clearNewlyUnlocked);
  const store = useLightSnakeGameStore();

  const [screenMode, setScreenMode] = useState<ScreenMode>('select');
  const [gameMode, setGameMode] = useState<GameMode>('freeplay');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);

  const [sessionVerses, setSessionVerses] = useState<Verse[]>([]);
  const [shownVerseIndex, setShownVerseIndex] = useState(0);
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [celebratingBadge, setCelebratingBadge] =
    useState<typeof newlyUnlocked[number] | null>(null);

  // Per-run tallies (committed once on game over).
  const itemTally = useRef({ bread: 0, fish: 0, lamp: 0 });
  const thornsSeen = useRef(0);

  const rngRef = useRef<() => number>(() => Math.random());
  const lastFrameTime = useRef(0);
  const isRunning = useRef(false);
  const stateRef = useRef<GameState | null>(null);
  const committedRef = useRef(false);

  const verseOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const todayStr = getTodayDateString();
  const dailyAlreadyPlayed = store.hasDailyScore(todayStr);

  // --- start a run ----------------------------------------------------------
  const startGame = useCallback(
    (mode: GameMode) => {
      const seenIds = store.seenVerseIds;
      let verses: Verse[];
      let rng: () => number;

      if (mode === 'daily') {
        verses = getVersesForDaily(verseBank, VERSE_THEMES, 10, todayStr);
        rng = seedFromDate(todayStr);
      } else {
        verses = getVersesForSession(verseBank, VERSE_THEMES, 10, seenIds);
        rng = createRng(Date.now());
      }

      rngRef.current = rng;
      setSessionVerses(verses);
      setShownVerseIndex(0);
      setGameMode(mode);
      setActiveVerse(null);
      committedRef.current = false;
      itemTally.current = { bread: 0, fish: 0, lamp: 0 };
      thornsSeen.current = 0;

      const initial = createInitialState(GRID_COLS, GRID_ROWS, rng);
      stateRef.current = initial;
      setGameState(initial);
      setScreenMode('playing');
      setCountdown(COUNTDOWN_FROM);
      lastFrameTime.current = 0;
      isRunning.current = false; // engine stays in 'countdown' until countdown ends
      overlayOpacity.setValue(0);
      verseOpacity.setValue(0);
    },
    [store, todayStr, overlayOpacity, verseOpacity],
  );

  // --- countdown -> playing -------------------------------------------------
  useEffect(() => {
    if (screenMode !== 'playing') return;
    if (!stateRef.current || stateRef.current.phase !== 'countdown') return;
    if (countdown <= 0) {
      // Flip the engine into the playing phase and start the loop.
      const started: GameState = { ...stateRef.current, phase: 'playing' };
      stateRef.current = started;
      setGameState(started);
      lastFrameTime.current = 0;
      isRunning.current = true;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 750);
    return () => clearTimeout(t);
  }, [countdown, screenMode]);

  // --- commit results on game over ------------------------------------------
  const commitResult = useCallback(
    (finalState: GameState) => {
      if (committedRef.current) return;
      committedRef.current = true;

      const score = finalState.score;
      const length = finalState.snake.length;
      const lvl = speedLevel(finalState.speed);

      recordPlay(true, todayStr);
      store.recordScore(score);
      store.recordCombo(finalState.combo);
      store.recordLength(length);
      store.recordSpeedLevel(lvl);
      store.addItems(itemTally.current);
      store.addThornsPassed(thornsSeen.current);
      store.recordGamePlayed();
      if (gameMode === 'daily') store.recordDailyScore(todayStr, score);

      const verseIds = sessionVerses.slice(0, shownVerseIndex).map((v) => v.id);
      if (verseIds.length > 0) store.addSeenVerseIds(verseIds);

      // Badge events (reuses the generic RewardsEngine shape).
      processEvent({ type: 'score_reached', score });
      processEvent({ type: 'combo_reached', combo: finalState.combo });
      processEvent({ type: 'verses_seen', count: store.seenVerseIds.length });
      processEvent({
        type: 'streak_reached',
        streak: useStreakStore.getState().currentStreak,
      });
      processEvent({ type: 'games_played', count: store.totalGamesPlayed });
    },
    [
      gameMode,
      sessionVerses,
      shownVerseIndex,
      todayStr,
      recordPlay,
      processEvent,
      store,
    ],
  );

  // --- event handling -------------------------------------------------------
  const handleEvents = useCallback(
    (events: GameEvent[]) => {
      for (const ev of events) {
        switch (ev.type) {
          case 'food_eaten': {
            HapticsManager.light();
            itemTally.current[ev.item.type] += 1;
            break;
          }
          case 'combo': {
            if (ev.count >= 3) HapticsManager.success();
            break;
          }
          case 'speed_up':
            HapticsManager.medium();
            break;
          case 'thorn_hit':
          case 'wall_hit':
          case 'self_hit':
            HapticsManager.medium();
            break;
          case 'verse_milestone': {
            const idx = shownVerseIndex;
            if (idx < sessionVerses.length) {
              setActiveVerse(sessionVerses[idx]);
              setShownVerseIndex((prev) => prev + 1);
              isRunning.current = false;
              verseOpacity.setValue(0);
              Animated.timing(verseOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }).start();
            }
            break;
          }
          case 'game_over': {
            isRunning.current = false;
            HapticsManager.success();
            if (stateRef.current) commitResult(stateRef.current);
            setScreenMode('gameover');
            overlayOpacity.setValue(0);
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
            break;
          }
        }
      }
    },
    [sessionVerses, shownVerseIndex, verseOpacity, overlayOpacity, commitResult],
  );

  const dismissVerse = useCallback(() => {
    setActiveVerse(null);
    if (stateRef.current && stateRef.current.phase === 'playing') {
      lastFrameTime.current = 0;
      isRunning.current = true;
    }
  }, []);

  // Track the most thorns that ever coexisted with us this run.
  const trackThorns = useCallback((state: GameState) => {
    if (state.thorns.length > thornsSeen.current) {
      thornsSeen.current = state.thorns.length;
    }
  }, []);

  // --- game loop ------------------------------------------------------------
  const updateState = useCallback(
    (newState: GameState, events: GameEvent[]) => {
      setGameState(newState);
      trackThorns(newState);
      if (events.length > 0) handleEvents(events);
    },
    [handleEvents, trackThorns],
  );

  useEffect(() => {
    let rafId: number;
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (!isRunning.current || !stateRef.current) return;
      if (lastFrameTime.current === 0) {
        lastFrameTime.current = now;
        return;
      }
      const deltaMs = now - lastFrameTime.current;
      lastFrameTime.current = now;

      const result = tick(stateRef.current, deltaMs, rngRef.current);
      stateRef.current = result.state;
      updateState(result.state, result.events);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [updateState]);

  // --- input ----------------------------------------------------------------
  const queueDirection = useCallback((dir: Direction) => {
    if (!stateRef.current || stateRef.current.phase !== 'playing') return;
    const next = changeDirection(stateRef.current, dir);
    stateRef.current = next;
    setGameState(next);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > MIN_SWIPE || Math.abs(g.dy) > MIN_SWIPE,
        onPanResponderRelease: (_e, g) => {
          if (Math.abs(g.dx) > Math.abs(g.dy)) {
            queueDirection(g.dx > 0 ? 'right' : 'left');
          } else {
            queueDirection(g.dy > 0 ? 'down' : 'up');
          }
        },
      }),
    [queueDirection],
  );

  const playAgain = useCallback(() => {
    setScreenMode('select');
    setGameState(null);
    stateRef.current = null;
    isRunning.current = false;
  }, []);

  // Badge celebration after game over.
  useEffect(() => {
    if (newlyUnlocked.length > 0 && screenMode === 'gameover' && !celebratingBadge) {
      const timer = setTimeout(() => setCelebratingBadge(newlyUnlocked[0]), 900);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, screenMode, celebratingBadge]);

  // --- SELECT screen --------------------------------------------------------
  if (screenMode === 'select') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.selectContainer}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.selectTitle}>Light Snake</Text>
          <Text style={styles.selectTagline}>Carry the light. Avoid the thorns.</Text>

          <View style={styles.modeButtons}>
            <Pressable
              style={[styles.modeButton, dailyAlreadyPlayed && styles.modeButtonDisabled]}
              onPress={() => !dailyAlreadyPlayed && startGame('daily')}
              disabled={dailyAlreadyPlayed}
            >
              <Text style={styles.modeIcon}>{'📅'}</Text>
              <Text style={styles.modeLabel}>Daily Challenge</Text>
              <Text style={styles.modeDesc}>
                {dailyAlreadyPlayed ? 'Completed today!' : 'Same board for everyone'}
              </Text>
            </Pressable>

            <Pressable style={styles.modeButton} onPress={() => startGame('freeplay')}>
              <Text style={styles.modeIcon}>{'🔦'}</Text>
              <Text style={styles.modeLabel}>Free Play</Text>
              <Text style={styles.modeDesc}>Grow the light. Beat your high score.</Text>
            </Pressable>
          </View>

          {store.highScore > 0 && (
            <Text style={styles.highScoreText}>High Score: {store.highScore}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const gs = gameState;
  if (!gs) return null;

  return (
    <SafeAreaView style={styles.screen}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Text style={styles.hudScore}>{gs.score}</Text>
          {gs.combo >= 2 && <Text style={styles.hudCombo}>{gs.combo}x</Text>}
        </View>
        <View style={styles.hudCenter}>
          <Text style={styles.hudLevel}>Length {gs.snake.length}</Text>
          <Text style={styles.hudLevelName}>Speed {speedLevel(gs.speed)}</Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.hudItems}>{gs.itemsEaten} 🍞</Text>
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardArea} {...panResponder.panHandlers}>
        <GameBackground palette={LIGHT_SNAKE_PALETTE} />
        <Board gs={gs} />

        {/* Countdown overlay */}
        {gs.phase === 'countdown' && (
          <View style={styles.countdownOverlay} pointerEvents="none">
            <Text style={styles.countdownText}>
              {countdown > 0 ? countdown : 'GO!'}
            </Text>
            <Text style={styles.countdownHint}>Swipe to steer the light</Text>
          </View>
        )}
      </View>

      {/* On-screen D-pad (accessible alternative to swipe) */}
      {gs.phase === 'playing' && (
        <View style={styles.dpad}>
          <DpadButton label="↑" dir="up" onPress={queueDirection} />
          <View style={styles.dpadRow}>
            <DpadButton label="←" dir="left" onPress={queueDirection} />
            <DpadButton label="↓" dir="down" onPress={queueDirection} />
            <DpadButton label="→" dir="right" onPress={queueDirection} />
          </View>
        </View>
      )}

      {/* Verse overlay */}
      {activeVerse && (
        <Animated.View style={[styles.verseOverlay, { opacity: verseOpacity }]}>
          <View style={styles.verseCard}>
            <Text style={styles.verseRef}>{activeVerse.reference}</Text>
            <Text style={styles.verseText}>{activeVerse.text}</Text>
            <Text style={styles.versePrompt}>{activeVerse.kidPrompt}</Text>
            <Pressable
              style={styles.verseDismiss}
              onPress={dismissVerse}
              accessibilityRole="button"
              accessibilityLabel="Keep playing"
            >
              <Text style={styles.verseDismissText}>Keep Playing</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Game over overlay */}
      {screenMode === 'gameover' && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>The Light Fades</Text>
            <Text style={styles.resultScore}>{gs.score}</Text>
            <Text style={styles.resultLabel}>Points</Text>
            <View style={styles.resultStats}>
              <ResultStat value={`${gs.snake.length}`} label="Length" />
              <ResultStat value={`${gs.combo}x`} label="Best Combo" />
              <ResultStat value={`${shownVerseIndex}`} label="Verses" />
            </View>
            <Pressable
              style={styles.primaryButton}
              onPress={playAgain}
              accessibilityRole="button"
              accessibilityLabel="Play again"
            >
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Home"
            >
              <Text style={styles.secondaryButtonText}>Home</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

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

// ---------------------------------------------------------------------------
// Board: renders the grid, snake, food, and thorns.
// ---------------------------------------------------------------------------
function Board({ gs }: { gs: GameState }) {
  const [areaW, setAreaW] = useState(0);
  const [areaH, setAreaH] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setAreaW(e.nativeEvent.layout.width);
    setAreaH(e.nativeEvent.layout.height);
  };

  // Fit the grid into the available area while keeping square cells.
  const cell = useMemo(() => {
    if (areaW <= 0 || areaH <= 0) return 0;
    const maxW = Math.min(areaW - spacing.md * 2, MAX_BOARD_WIDTH);
    const byW = maxW / gs.gridCols;
    const byH = (areaH - spacing.md * 2) / gs.gridRows;
    return Math.floor(Math.min(byW, byH));
  }, [areaW, areaH, gs.gridCols, gs.gridRows]);

  const boardW = cell * gs.gridCols;
  const boardH = cell * gs.gridRows;

  return (
    <View style={styles.boardWrap} onLayout={onLayout}>
      {cell > 0 && (
        <View style={[styles.board, { width: boardW, height: boardH }]}>
          {/* Thorns */}
          {gs.thorns.map((t, i) => (
            <Image
              key={`thorn-${i}`}
              source={THORN}
              style={[
                styles.cellItem,
                { left: t.pos.x * cell, top: t.pos.y * cell, width: cell, height: cell },
              ]}
              resizeMode="contain"
            />
          ))}

          {/* Food */}
          {gs.food.map((f, i) => (
            <Image
              key={`food-${i}`}
              source={spriteForFood(f.type)}
              style={[
                styles.cellItem,
                { left: f.pos.x * cell, top: f.pos.y * cell, width: cell, height: cell },
              ]}
              resizeMode="contain"
            />
          ))}

          {/* Snake body (head drawn last / on top via zIndex) */}
          {gs.snake.map((seg, i) => {
            const isHead = i === 0;
            return isHead ? (
              <Image
                key="head"
                source={LANTERN}
                style={[
                  styles.cellItem,
                  {
                    left: seg.x * cell,
                    top: seg.y * cell,
                    width: cell,
                    height: cell,
                    zIndex: 5,
                  },
                ]}
                resizeMode="contain"
              />
            ) : (
              <View
                key={`seg-${i}`}
                style={[
                  styles.snakeSeg,
                  {
                    left: seg.x * cell + cell * 0.12,
                    top: seg.y * cell + cell * 0.12,
                    width: cell * 0.76,
                    height: cell * 0.76,
                    borderRadius: cell * 0.38,
                    opacity: Math.max(0.35, 1 - i * 0.04),
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

function DpadButton({
  label,
  dir,
  onPress,
}: {
  label: string;
  dir: Direction;
  onPress: (d: Direction) => void;
}) {
  return (
    <Pressable
      style={styles.dpadBtn}
      onPress={() => onPress(dir)}
      accessibilityRole="button"
      accessibilityLabel={`Move ${dir}`}
    >
      <Text style={styles.dpadLabel}>{label}</Text>
    </Pressable>
  );
}

function ResultStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.resultStatBox}>
      <Text style={styles.resultStatValue}>{value}</Text>
      <Text style={styles.resultStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Mode select
  selectContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: colors.gold, fontSize: 22, fontWeight: '700' },
  selectTitle: { color: colors.gold, fontSize: 38, fontWeight: '900', marginBottom: spacing.sm, textAlign: 'center' },
  selectTagline: { color: colors.textSecondary, ...typography.subtitle, marginBottom: spacing.xxl, textAlign: 'center' },
  modeButtons: { width: '100%', gap: spacing.md },
  modeButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modeButtonDisabled: { opacity: 0.4 },
  modeIcon: { fontSize: 36, marginBottom: spacing.sm },
  modeLabel: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  modeDesc: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs },
  highScoreText: { color: colors.gold, fontSize: 16, fontWeight: '700', marginTop: spacing.xl },

  // HUD
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    height: 60,
    backgroundColor: 'rgba(6, 10, 30, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 200, 255, 0.18)',
  },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  hudScore: { color: colors.gold, ...typography.score },
  hudCombo: { color: colors.teal, ...typography.combo },
  hudCenter: { alignItems: 'center', flex: 1 },
  hudLevel: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  hudLevelName: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  hudRight: { flex: 1, alignItems: 'flex-end' },
  hudItems: { color: colors.teal, fontSize: 16, fontWeight: '900' },

  // Board
  boardArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  board: {
    position: 'relative',
    backgroundColor: 'rgba(8, 12, 32, 0.55)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(120, 200, 255, 0.22)',
    overflow: 'hidden',
  },
  cellItem: { position: 'absolute' },
  snakeSeg: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 224, 130, 0.92)',
    shadowColor: '#FFE082',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: { color: colors.gold, fontSize: 96, fontWeight: '900' },
  countdownHint: { color: colors.textSecondary, fontSize: 15, fontWeight: '700', marginTop: spacing.md },

  // D-pad
  dpad: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'rgba(6, 10, 30, 0.6)',
  },
  dpadRow: { flexDirection: 'row', gap: spacing.sm },
  dpadBtn: {
    width: 64,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadLabel: { color: colors.gold, fontSize: 26, fontWeight: '900' },

  // Verse overlay
  verseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 10, 30, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  verseCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  verseRef: { color: colors.gold, ...typography.cardLabel, marginBottom: spacing.sm },
  verseText: { color: colors.textPrimary, ...typography.verse, lineHeight: 26 },
  versePrompt: { color: colors.textSecondary, ...typography.body, marginTop: spacing.md, fontStyle: 'italic' },
  verseDismiss: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  verseDismissText: { color: colors.background, fontSize: 16, fontWeight: '800' },

  // Result overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 10, 30, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  resultTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: spacing.sm, textAlign: 'center' },
  resultScore: { color: colors.gold, fontSize: 52, fontWeight: '900' },
  resultLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.lg },
  resultStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  resultStatBox: { alignItems: 'center', flex: 1 },
  resultStatValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '900' },
  resultStatLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: colors.background, fontSize: 17, fontWeight: '800' },
  secondaryButton: {
    borderRadius: radii.lg,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
});
