import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { verseBank } from '@ffs/verses/verseBank';
import { getVersesForSession, getVersesForDaily } from '@ffs/verses/selectionEngine';
import type { Verse } from '@ffs/verses/types';
import { createInitialState, tick, type GameEvent } from '../src/game/gameEngine';
import { GAME_CONSTANTS } from '../src/game/itemConfig';
import { createRng, seedFromDate } from '../src/game/prng';
import { useCatchGameStore } from '../src/game/stores/catchGameStore';
import type { GameMode, GameState } from '../src/game/types';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import BadgeCelebration from '../src/shell/components/BadgeCelebration';
import { useBadgeStore } from '../src/shell/stores/badgeStore';
import { useStreakStore } from '../src/shell/stores/streakStore';
import { colors, radii, spacing, typography } from '../src/shell/theme';

const VERSE_THEMES = ['provision', 'bread', 'manna', 'blessing', 'honey'] as const;

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type ScreenMode = 'select' | 'playing' | 'gameover';

const MAX_GAME_WIDTH = 500;

export default function GameScreen() {
  const router = useRouter();
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });
  const recordPlay = useStreakStore((s) => s.recordPlay);
  const processEvent = useBadgeStore((s) => s.processEvent);
  const newlyUnlocked = useBadgeStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useBadgeStore((s) => s.clearNewlyUnlocked);
  const catchStore = useCatchGameStore();

  const [screenMode, setScreenMode] = useState<ScreenMode>('select');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('freeplay');
  const [sessionVerses, setSessionVerses] = useState<Verse[]>([]);
  const [shownVerseIndex, setShownVerseIndex] = useState(0);
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<typeof newlyUnlocked[number] | null>(null);
  const [itemsCaughtThisGame, setItemsCaughtThisGame] = useState(0);
  const [tookDamage, setTookDamage] = useState(false);

  const rngRef = useRef<() => number>(() => Math.random());
  const lastFrameTime = useRef(0);
  const isRunning = useRef(false);
  const stateRef = useRef<GameState | null>(null);

  const verseOpacity = useRef(new Animated.Value(0)).current;
  const gameOverOpacity = useRef(new Animated.Value(0)).current;

  const gameWidth = Math.min(areaSize.w, MAX_GAME_WIDTH);
  const gameHeight = areaSize.h;
  const gameOffsetX = (areaSize.w - gameWidth) / 2;
  const basketWidth = gameWidth * GAME_CONSTANTS.BASKET_WIDTH_RATIO;
  const basketHeight = gameWidth * GAME_CONSTANTS.BASKET_HEIGHT_RATIO;

  const onAreaLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setAreaSize({ w: width, h: height });
  }, []);

  const todayStr = getTodayDateString();
  const dailyAlreadyPlayed = catchStore.hasDailyScore(todayStr);

  const startGame = useCallback((mode: GameMode) => {
    setGameMode(mode);

    const seenIds = catchStore.seenVerseIds;
    let verses: Verse[];
    let rng: () => number;

    if (mode === 'daily') {
      verses = getVersesForDaily(verseBank, [...VERSE_THEMES], 10, todayStr);
      rng = seedFromDate(todayStr);
    } else {
      verses = getVersesForSession(verseBank, [...VERSE_THEMES], 10, seenIds);
      rng = createRng(Date.now());
    }

    rngRef.current = rng;
    setSessionVerses(verses);
    setShownVerseIndex(0);
    setActiveVerse(null);
    setItemsCaughtThisGame(0);
    setTookDamage(false);

    const initial = createInitialState(mode);
    initial.basket.width = basketWidth;
    initial.basket.x = (gameWidth - basketWidth) / 2;

    stateRef.current = initial;
    setGameState(initial);
    setScreenMode('playing');
    lastFrameTime.current = 0;
    isRunning.current = true;

    gameOverOpacity.setValue(0);
    verseOpacity.setValue(0);
  }, [catchStore, todayStr, basketWidth, gameWidth]);

  const handleEvents = useCallback((events: GameEvent[]) => {
    for (const ev of events) {
      switch (ev.type) {
        case 'item_caught':
          HapticsManager.light();
          setItemsCaughtThisGame((c) => c + 1);
          break;
        case 'bad_item_caught':
          HapticsManager.medium();
          setTookDamage(true);
          break;
        case 'life_lost':
          HapticsManager.medium();
          break;
        case 'combo':
          if (ev.count === 5 || ev.count === 10) HapticsManager.success();
          break;
        case 'powerup_activated':
          HapticsManager.success();
          break;
        case 'verse_milestone': {
          const idx = ev.milestone - 1;
          if (idx < sessionVerses.length) {
            setActiveVerse(sessionVerses[idx]);
            setShownVerseIndex(idx + 1);
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
          HapticsManager.medium();
          Animated.timing(gameOverOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
          setScreenMode('gameover');
          break;
        }
      }
    }
  }, [sessionVerses, verseOpacity, gameOverOpacity]);

  const dismissVerse = useCallback(() => {
    setActiveVerse(null);
    isRunning.current = true;
  }, []);

  const handleGameOver = useCallback(() => {
    if (!gameState) return;

    recordPlay(true, todayStr);
    catchStore.recordScore(gameState.score);
    catchStore.recordCombo(gameState.bestCombo);
    catchStore.recordItemsCaught(itemsCaughtThisGame);
    catchStore.recordGamePlayed();

    if (gameMode === 'daily') {
      catchStore.recordDailyScore(todayStr, gameState.score);
    }

    const verseIds = sessionVerses.slice(0, shownVerseIndex).map((v) => v.id);
    if (verseIds.length > 0) {
      catchStore.addSeenVerseIds(verseIds);
    }

    processEvent({ type: 'score_reached', score: gameState.score });
    processEvent({ type: 'combo_reached', combo: gameState.bestCombo });
    processEvent({ type: 'streak_reached', streak: useStreakStore.getState().currentStreak });
    processEvent({ type: 'games_played', count: catchStore.totalGamesPlayed });
    processEvent({ type: 'verses_seen', count: catchStore.seenVerseIds.length });

    if (gameMode === 'daily' && !tookDamage) {
      processEvent({ type: 'no_damage_daily' });
    }
  }, [gameState, gameMode, todayStr, itemsCaughtThisGame, tookDamage, sessionVerses, shownVerseIndex, recordPlay, processEvent, catchStore]);

  useEffect(() => {
    if (screenMode === 'gameover' && gameState) {
      handleGameOver();
    }
  }, [screenMode, handleGameOver, gameState]);

  useEffect(() => {
    if (newlyUnlocked.length > 0 && screenMode === 'gameover' && !celebratingBadge) {
      const timer = setTimeout(() => {
        setCelebratingBadge(newlyUnlocked[0]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, screenMode, celebratingBadge]);

  const updateState = useCallback((newState: GameState, events: GameEvent[]) => {
    setGameState(newState);
    if (events.length > 0) handleEvents(events);
  }, [handleEvents]);

  useEffect(() => {
    let rafId: number;
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (!isRunning.current || !stateRef.current) return;
      if (gameWidth === 0 || gameHeight === 0) return;

      if (lastFrameTime.current === 0) {
        lastFrameTime.current = now;
        return;
      }

      const deltaMs = now - lastFrameTime.current;
      lastFrameTime.current = now;

      const result = tick(
        stateRef.current,
        deltaMs,
        gameWidth,
        gameHeight,
        rngRef.current,
      );

      stateRef.current = result.state;
      updateState(result.state, result.events);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameWidth, gameHeight, updateState]);

  const claimResponder = useCallback(() => true, []);
  const denyTermination = useCallback(() => false, []);

  const handleTouch = useCallback((evt: { nativeEvent: { locationX: number } }) => {
    if (!stateRef.current || stateRef.current.phase !== 'playing') return;
    const touchX = evt.nativeEvent.locationX;
    const bw = stateRef.current.basket.width;
    const newX = Math.max(0, Math.min(gameWidth - bw, touchX - bw / 2));
    stateRef.current = {
      ...stateRef.current,
      basket: { ...stateRef.current.basket, x: newX },
    };
  }, [gameWidth]);

  if (screenMode === 'select') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.selectContainer} onLayout={onAreaLayout}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.selectTitle}>Manna Catch</Text>
          <Text style={styles.selectTagline}>Catch the blessings, dodge the thorns.</Text>

          <View style={styles.modeButtons}>
            <Pressable
              style={[styles.modeButton, dailyAlreadyPlayed && styles.modeButtonDisabled]}
              onPress={() => !dailyAlreadyPlayed && startGame('daily')}
              disabled={dailyAlreadyPlayed}
            >
              <Text style={styles.modeIcon}>{'📅'}</Text>
              <Text style={styles.modeLabel}>Daily Challenge</Text>
              <Text style={styles.modeDesc}>
                {dailyAlreadyPlayed ? 'Completed today!' : 'Same puzzle for everyone'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.modeButton}
              onPress={() => startGame('freeplay')}
            >
              <Text style={styles.modeIcon}>{'🎮'}</Text>
              <Text style={styles.modeLabel}>Free Play</Text>
              <Text style={styles.modeDesc}>Endless. Beat your high score.</Text>
            </Pressable>
          </View>

          {catchStore.highScore > 0 && (
            <Text style={styles.highScoreText}>
              High Score: {catchStore.highScore}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const gs = gameState;
  if (!gs) return null;

  const wideBasketActive = gs.activePowerUps.some((p) => p.type === 'wide_basket');
  const currentBasketWidth = wideBasketActive ? gs.basket.width * 2 : gs.basket.width;

  return (
    <SafeAreaView style={styles.screen}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Text style={styles.hudScore}>{gs.score}</Text>
          {gs.combo >= 3 && (
            <Text style={styles.hudCombo}>{gs.combo}x</Text>
          )}
        </View>
        <View style={styles.hudCenter}>
          {gs.activePowerUps.map((pu) => (
            <View key={pu.type} style={[styles.powerUpBadge, { borderColor: pu.color }]}>
              <Text style={styles.powerUpIcon}>{pu.icon}</Text>
              <Text style={[styles.powerUpTimer, { color: pu.color }]}>
                {Math.ceil(pu.remainingMs / 1000)}s
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.hudRight}>
          {Array.from({ length: GAME_CONSTANTS.INITIAL_LIVES }, (_, i) => (
            <Text
              key={i}
              style={[styles.heart, i < gs.lives ? styles.heartActive : styles.heartEmpty]}
            >
              {'♥'}
            </Text>
          ))}
        </View>
      </View>

      {/* Game Area */}
      <View
        style={[
          styles.gameArea,
          {
            width: gameWidth,
            marginLeft: gameOffsetX,
          },
        ]}
        onLayout={onAreaLayout}
        onStartShouldSetResponder={claimResponder}
        onMoveShouldSetResponder={claimResponder}
        onResponderTerminationRequest={denyTermination}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        {/* Ground glow */}
        <View style={styles.groundGlow} />

        {/* Falling Items */}
        {gs.items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.fallingItem,
              {
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
              },
            ]}
          >
            <Text style={[styles.itemIcon, { fontSize: item.width * 0.75 }]}>
              {item.icon}
            </Text>
          </View>
        ))}

        {/* Basket */}
        <View
          style={[
            styles.basket,
            {
              left: gs.basket.x,
              bottom: GAME_CONSTANTS.BASKET_BOTTOM_OFFSET,
              width: currentBasketWidth,
              height: basketHeight,
            },
          ]}
        >
          <Text style={[styles.basketIcon, { fontSize: currentBasketWidth * 0.5 }]}>
            {'🧺'}
          </Text>
        </View>
      </View>

      {/* Verse Overlay */}
      {activeVerse && (
        <Animated.View style={[styles.verseOverlay, { opacity: verseOpacity }]}>
          <View style={styles.verseCard}>
            <Text style={styles.verseRef}>{activeVerse.reference}</Text>
            <Text style={styles.verseText}>{activeVerse.text}</Text>
            <Text style={styles.versePrompt}>{activeVerse.kidPrompt}</Text>
            <Pressable style={styles.verseDismiss} onPress={dismissVerse}>
              <Text style={styles.verseDismissText}>Keep Playing</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Game Over */}
      {screenMode === 'gameover' && (
        <Animated.View style={[styles.gameOverOverlay, { opacity: gameOverOpacity }]}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Game Over</Text>
            <Text style={styles.gameOverScore}>{gs.score}</Text>
            <Text style={styles.gameOverLabel}>Points</Text>

            <View style={styles.gameOverStats}>
              <View style={styles.goStatBox}>
                <Text style={styles.goStatValue}>{gs.bestCombo}x</Text>
                <Text style={styles.goStatLabel}>Best Combo</Text>
              </View>
              <View style={styles.goStatBox}>
                <Text style={styles.goStatValue}>{itemsCaughtThisGame}</Text>
                <Text style={styles.goStatLabel}>Caught</Text>
              </View>
              <View style={styles.goStatBox}>
                <Text style={styles.goStatValue}>{shownVerseIndex}</Text>
                <Text style={styles.goStatLabel}>Verses</Text>
              </View>
            </View>

            <Pressable
              style={styles.playAgainButton}
              onPress={() => {
                setScreenMode('select');
                setGameState(null);
                stateRef.current = null;
              }}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={styles.homeButton}
              onPress={() => router.back()}
            >
              <Text style={styles.homeButtonText}>Home</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Mode Select
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
  selectTitle: { color: colors.gold, ...typography.title, marginBottom: spacing.sm },
  selectTagline: { color: colors.textSecondary, ...typography.subtitle, marginBottom: spacing.xxl },
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
    backgroundColor: 'rgba(16, 16, 14, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.12)',
  },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  hudScore: { color: colors.gold, ...typography.score },
  hudCombo: { color: colors.teal, ...typography.combo },
  hudCenter: { flexDirection: 'row', gap: spacing.sm },
  hudRight: { flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'flex-end' },
  heart: { fontSize: 22 },
  heartActive: { color: colors.hearts },
  heartEmpty: { color: colors.surfaceBorder },

  powerUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  powerUpIcon: { fontSize: 14 },
  powerUpTimer: { fontSize: 12, fontWeight: '700' },

  // Game Area
  gameArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  groundGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.08)',
  },
  fallingItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  itemIcon: { textAlign: 'center' },

  basket: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  basketIcon: { fontSize: 40 },

  // Verse Overlay
  verseOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16, 16, 14, 0.85)',
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

  // Game Over
  gameOverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16, 16, 14, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  gameOverCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  gameOverTitle: { color: colors.textPrimary, fontSize: 28, fontWeight: '900', marginBottom: spacing.md },
  gameOverScore: { color: colors.gold, fontSize: 56, fontWeight: '900' },
  gameOverLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.lg },
  gameOverStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  goStatBox: { alignItems: 'center', flex: 1 },
  goStatValue: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
  goStatLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  playAgainButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  playAgainText: { color: colors.background, fontSize: 17, fontWeight: '800' },
  homeButton: {
    borderRadius: radii.lg,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  homeButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
});
