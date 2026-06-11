import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Modal,
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
import { spriteForFood, SHEPHERD, SHEEP, THORN } from '../src/game/spriteMap';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import { SoundManager } from '../src/shell/sound/SoundManager';
import BadgeCelebration from '../src/shell/components/BadgeCelebration';
import { useBadgeStore } from '../src/shell/stores/badgeStore';
import { useStreakStore } from '../src/shell/stores/streakStore';
import { colors, radii, spacing, typography } from '../src/shell/theme';
import GameBackground, { LIGHT_SNAKE_PALETTE } from '../src/shell/components/GameBackground';

const VERSE_THEMES: VerseTheme[] = ['light', 'truth', 'hope', 'faith', 'trust', 'wisdom'];

const GRID_COLS = 15;
const GRID_ROWS = 20;
const COUNTDOWN_FROM = 3;
const MIN_SWIPE = 26;
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
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // How-to-play first-run flag (persisted in the existing game store).
  const hasSeenHowToPlay = useLightSnakeGameStore((s) => s.hasSeenHowToPlay);
  const markHowToPlaySeen = useLightSnakeGameStore((s) => s.markHowToPlaySeen);

  const [sessionVerses, setSessionVerses] = useState<Verse[]>([]);
  const [shownVerseIndex, setShownVerseIndex] = useState(0);
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [celebratingBadge, setCelebratingBadge] =
    useState<typeof newlyUnlocked[number] | null>(null);

  // Per-run tallies (committed once on game over).
  const itemTally = useRef({ bread: 0, fish: 0, lamp: 0 });
  const thornsSeen = useRef(0);

  // Resume-from-background gate: when the app is sent to the background mid-run
  // we stop the loop and surface a "Tap to continue" overlay instead of
  // resuming instantly under the player's thumb.
  const [resumePending, setResumePending] = useState(false);

  const rngRef = useRef<() => number>(() => Math.random());
  const lastFrameTime = useRef(0);
  const isRunning = useRef(false);
  // Explicit pause gate. The loop advances ONLY when paused is false AND
  // isRunning is true. verse_milestone and AppState-background both set this,
  // so the freeze no longer depends on isRunning timing relative to handleEvents.
  const paused = useRef(false);
  const stateRef = useRef<GameState | null>(null);
  const committedRef = useRef(false);
  // Direction input is HARD-gated until the countdown fully finishes and the
  // engine is actually in 'playing'. Without this, a swipe/tap that lands during
  // the 3-2-1 pre-arms nextDirection, so the flock lurches off at GO with zero
  // intended input and can die at 0 points. Set true ONLY by the countdown
  // effect at the moment it flips to playing; reset on every (re)start.
  const inputEnabled = useRef(false);

  const verseOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const todayStr = getTodayDateString();
  const dailyAlreadyPlayed = store.hasDailyScore(todayStr);

  // --- start a run ----------------------------------------------------------
  const startGame = useCallback(
    (mode: GameMode) => {
      SoundManager.play('tap');
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
      inputEnabled.current = false; // no direction input until countdown finishes
      paused.current = false;
      setResumePending(false);
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
      inputEnabled.current = true; // countdown done -> direction input now allowed
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
            SoundManager.play('catch');
            itemTally.current[ev.item.type] += 1;
            break;
          }
          case 'combo': {
            // Haptic only on combo. The 'catch' SFX already fires on the same
            // eat tick (food_eaten) — a second chime here would stack on it.
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
              paused.current = true; // explicit freeze while the verse is shown
              isRunning.current = false;
              SoundManager.play('levelup');
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
            paused.current = false;
            HapticsManager.warning();
            SoundManager.play('gameover');
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
    SoundManager.play('verse');
    setActiveVerse(null);
    paused.current = false;
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
      if (paused.current || !isRunning.current || !stateRef.current) return;
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

  // --- background / foreground -------------------------------------------------
  // Leaving the app mid-run must not let the flock keep moving in the dark, and
  // returning must not drop the player straight back into motion. On background
  // we stop the loop; on foreground we show a "Tap to continue" resume gate
  // (only while an actual run is in progress, not on the verse/over overlays).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') return;
      const playingNow =
        isRunning.current &&
        stateRef.current?.phase === 'playing' &&
        !activeVerse;
      if (playingNow) {
        isRunning.current = false;
        paused.current = true;
        setResumePending(true);
      }
    });
    return () => sub.remove();
  }, [activeVerse]);

  const resumeFromBackground = useCallback(() => {
    SoundManager.play('tap');
    setResumePending(false);
    paused.current = false;
    if (stateRef.current && stateRef.current.phase === 'playing') {
      lastFrameTime.current = 0;
      isRunning.current = true;
    }
  }, []);

  // --- input ----------------------------------------------------------------
  const queueDirection = useCallback((dir: Direction) => {
    // Hard gate: ignore ALL direction input until the countdown has fully
    // finished AND the engine is in 'playing'. This blocks stray countdown
    // taps/swipes (d-pad isn't mounted yet, but swipes still reach here).
    if (!inputEnabled.current) return;
    if (!stateRef.current || stateRef.current.phase !== 'playing') return;
    const next = changeDirection(stateRef.current, dir);
    stateRef.current = next;
    setGameState(next);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Don't even claim the gesture during the countdown, so a stray swipe
        // can't pre-arm a direction before GO. queueDirection re-checks too.
        onStartShouldSetPanResponder: () => inputEnabled.current,
        onMoveShouldSetPanResponder: (_e, g) =>
          inputEnabled.current &&
          (Math.abs(g.dx) > MIN_SWIPE || Math.abs(g.dy) > MIN_SWIPE),
        onPanResponderRelease: (_e, g) => {
          if (!inputEnabled.current) return;
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
    SoundManager.play('tap');
    setScreenMode('select');
    setGameState(null);
    stateRef.current = null;
    isRunning.current = false;
    inputEnabled.current = false;
  }, []);

  // Badge celebration after game over.
  useEffect(() => {
    if (newlyUnlocked.length > 0 && screenMode === 'gameover' && !celebratingBadge) {
      const timer = setTimeout(() => setCelebratingBadge(newlyUnlocked[0]), 900);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, screenMode, celebratingBadge]);

  // Auto-show How to Play once, on the mode-select screen, on first run only.
  // Must wait for persist rehydration: before hydration the store holds the
  // default hasSeenHowToPlay=false, so evaluating it early re-opens the modal
  // on every cold launch for players who already dismissed it.
  const [howToStoreHydrated, setHowToStoreHydrated] = useState(
    () => useLightSnakeGameStore.persist.hasHydrated(),
  );
  useEffect(() => {
    const unsub = useLightSnakeGameStore.persist.onFinishHydration(() => setHowToStoreHydrated(true));
    return unsub;
  }, []);
  useEffect(() => {
    if (howToStoreHydrated && screenMode === 'select' && !hasSeenHowToPlay) {
      setShowHowToPlay(true);
    }
  }, [howToStoreHydrated, screenMode, hasSeenHowToPlay]);

  const dismissHowToPlay = useCallback(() => {
    SoundManager.play('tap');
    setShowHowToPlay(false);
    markHowToPlaySeen();
  }, [markHowToPlaySeen]);

  const openHowToPlay = useCallback(() => {
    SoundManager.play('tap');
    setShowHowToPlay(true);
  }, []);

  // --- SELECT screen --------------------------------------------------------
  if (screenMode === 'select') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.selectContainer}>
          <Pressable
            onPress={() => {
              SoundManager.play('tap');
              router.back();
            }}
            hitSlop={12}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.selectTitle}>Shepherd's Trail</Text>
          <Text style={styles.selectTagline}>Gather the flock. Avoid the thorns.</Text>

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
              <Text style={styles.modeDesc}>Grow your flock. Beat your high score.</Text>
            </Pressable>
          </View>

          {store.highScore > 0 && (
            <Text style={styles.highScoreText}>High Score: {store.highScore}</Text>
          )}

          <Pressable
            onPress={openHowToPlay}
            hitSlop={12}
            style={styles.howToLink}
            accessibilityRole="button"
            accessibilityLabel="How to play"
          >
            <Text style={styles.howToLinkText}>How to play</Text>
          </Pressable>
        </View>

        <HowToPlayModal visible={showHowToPlay} onDismiss={dismissHowToPlay} />
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
          <Text style={styles.hudItems}>{gs.itemsEaten} 🐑</Text>
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
            <Text style={styles.countdownHint}>Swipe to lead the flock</Text>
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

      {/* Resume-from-background overlay */}
      {resumePending && screenMode === 'playing' && (
        <Pressable
          style={styles.resumeOverlay}
          onPress={resumeFromBackground}
          accessibilityRole="button"
          accessibilityLabel="Tap to continue"
        >
          <Text style={styles.resumeTitle}>Paused</Text>
          <Text style={styles.resumeHint}>Tap to continue</Text>
        </Pressable>
      )}

      {/* Game over overlay */}
      {screenMode === 'gameover' && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>The flock scatters!</Text>
            <Text style={styles.resultSubline}>
              Eli never gives up. Round them up again!
            </Text>
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
              onPress={() => {
                SoundManager.play('tap');
                router.back();
              }}
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
// Memoized board cells.
//
// Each cell is a small React.memo component so a re-render of the Board only
// touches cells whose props actually changed. Combined with content-stable keys
// (grid position, not array index) this means growing the flock adds one new
// cell instead of re-keying and re-mounting the whole trail every tick.
// ---------------------------------------------------------------------------
const SpriteCell = memo(function SpriteCell({
  source,
  left,
  top,
  size,
  opacity,
  zIndex,
}: {
  source: ImageSourcePropType;
  left: number;
  top: number;
  size: number;
  opacity?: number;
  zIndex?: number;
}) {
  return (
    <Image
      source={source}
      style={[styles.cellItem, { left, top, width: size, height: size, opacity, zIndex }]}
      resizeMode="contain"
    />
  );
});

// A stray sheep waiting to be gathered. Rendered as the sheep sprite but pulsing
// and slightly smaller than a flock segment, so it reads as "not yet yours" —
// eating it grows the flock (the trail already grows on eat).
const StraySheep = memo(function StraySheep({
  source,
  left,
  top,
  size,
}: {
  source: ImageSourcePropType;
  left: number;
  top: number;
  size: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82, 0.96] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <Animated.View
      style={[
        styles.cellItem,
        styles.strayGlow,
        { left, top, width: size, height: size, opacity: glow, transform: [{ scale }] },
      ]}
      pointerEvents="none"
    >
      <Image source={source} style={styles.strayImage} resizeMode="contain" />
    </Animated.View>
  );
});

// ---------------------------------------------------------------------------
// Board: renders the grid, flock, stray sheep (food), and thorns.
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
          {/* Thorns — keyed by grid position so a thorn that stays put is stable. */}
          {gs.thorns.map((t) => (
            <SpriteCell
              key={`thorn-${t.pos.x}-${t.pos.y}`}
              source={THORN}
              left={t.pos.x * cell}
              top={t.pos.y * cell}
              size={cell}
            />
          ))}

          {/* Stray sheep to gather (food). Pulses + smaller so it stands apart
              from the flock; eating it grows your flock. */}
          {gs.food.map((f) => (
            <StraySheep
              key={`stray-${f.pos.x}-${f.pos.y}`}
              source={SHEEP}
              left={f.pos.x * cell}
              top={f.pos.y * cell}
              size={cell}
            />
          ))}

          {/* The flock: shepherd Eli leads (head, on top), each trailing segment
              is a glowing sheep. Keyed by grid position so growth only adds the
              new lead cell instead of re-keying the whole trail every tick. */}
          {gs.snake.map((seg, i) =>
            i === 0 ? (
              <SpriteCell
                key="head"
                source={SHEPHERD}
                left={seg.x * cell}
                top={seg.y * cell}
                size={cell}
                zIndex={5}
              />
            ) : (
              <SpriteCell
                key={`seg-${seg.x}-${seg.y}`}
                source={SHEEP}
                left={seg.x * cell}
                top={seg.y * cell}
                size={cell}
                opacity={Math.max(0.45, 1 - i * 0.035)}
              />
            ),
          )}
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

// How to Play modal — Gosple's pattern (overlay > card > title/body/example
// rows/dismiss), themed for Shepherd's Trail. Auto-shows on first run and is
// always reachable from the mode-select screen.
function HowToPlayModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>How to Play</Text>
          <Text style={styles.modalBody}>
            Swipe or tap the arrows to lead Eli the shepherd around the field.
          </Text>
          <View style={styles.exampleSection}>
            <View style={styles.exampleRow}>
              <Text style={styles.exIcon}>🐑</Text>
              <Text style={styles.exLabel}>Gather the flock and food (bread, fish, lamp)</Text>
            </View>
            <View style={styles.exampleRow}>
              <Text style={styles.exIcon}>🌵</Text>
              <Text style={styles.exLabel}>Avoid the walls, thorns, and your own flock line</Text>
            </View>
            <View style={styles.exampleRow}>
              <Text style={styles.exIcon}>📖</Text>
              <Text style={styles.exLabel}>Every 50 points reveals a Bible verse</Text>
            </View>
          </View>
          <Text style={styles.modalHint}>Round up the whole flock. Don't let it scatter!</Text>
          <Pressable
            style={styles.modalButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Got it"
          >
            <Text style={styles.modalButtonText}>Let's Go!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  howToLink: { marginTop: spacing.lg, paddingVertical: spacing.xs },
  howToLinkText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // How to Play modal (Gosple pattern, Shepherd's Trail theme)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalBody: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  exampleSection: { gap: spacing.md, marginBottom: spacing.lg },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exIcon: { fontSize: 26, width: 34, textAlign: 'center' },
  exLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 19 },
  modalHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: { color: colors.background, fontSize: 17, fontWeight: '800' },

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
  strayGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFE082',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  strayImage: { width: '100%', height: '100%' },

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

  // Resume overlay
  resumeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 10, 30, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeTitle: { color: colors.gold, fontSize: 34, fontWeight: '900', marginBottom: spacing.sm },
  resumeHint: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },

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
  resultTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: spacing.xs, textAlign: 'center' },
  resultSubline: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: spacing.md, textAlign: 'center' },
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
