import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
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
  createInitialState,
  flipCard,
  tick,
  type GameEvent,
} from '../src/game/gameEngine';
import { getLevelConfig } from '../src/game/collisionEngine';
import { GAME_CONSTANTS } from '../src/game/itemConfig';
import { createRng, seedFromDate } from '../src/game/prng';
import { useNoahGameStore } from '../src/game/stores/noahGameStore';
import type { GameState, LevelResult, StarRating } from '../src/game/types';
import { CARD_BACK, spriteForAnimal } from '../src/game/spriteMap';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import BadgeCelebration from '../src/shell/components/BadgeCelebration';
import { useBadgeStore } from '../src/shell/stores/badgeStore';
import { useStreakStore } from '../src/shell/stores/streakStore';
import { colors, radii, spacing, typography } from '../src/shell/theme';
import GameBackground, { NOAH_PALETTE } from '../src/shell/components/GameBackground';

const VERSE_THEMES: VerseTheme[] = ['animals', 'creation', 'nature', 'trust', 'obedience'];

type GameMode = 'daily' | 'freeplay';
type ScreenMode = 'select' | 'playing' | 'levelup' | 'gameover';

const MAX_BOARD_WIDTH = 460;
const BOARD_GAP = 8;

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatStars(stars: StarRating): string {
  return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
}

export default function GameScreen() {
  const router = useRouter();
  const recordPlay = useStreakStore((s) => s.recordPlay);
  const processEvent = useBadgeStore((s) => s.processEvent);
  const newlyUnlocked = useBadgeStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useBadgeStore((s) => s.clearNewlyUnlocked);
  const noahStore = useNoahGameStore();

  const [screenMode, setScreenMode] = useState<ScreenMode>('select');
  const [gameMode, setGameMode] = useState<GameMode>('freeplay');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [level, setLevel] = useState(1);
  const [cumulativeScore, setCumulativeScore] = useState(0);

  const [sessionVerses, setSessionVerses] = useState<Verse[]>([]);
  const [shownVerseIndex, setShownVerseIndex] = useState(0);
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [lastResult, setLastResult] = useState<LevelResult | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<typeof newlyUnlocked[number] | null>(null);

  const rngRef = useRef<() => number>(() => Math.random());
  const lastFrameTime = useRef(0);
  const isRunning = useRef(false);
  const stateRef = useRef<GameState | null>(null);

  const verseOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const todayStr = getTodayDateString();
  const dailyAlreadyPlayed = noahStore.hasDailyScore(todayStr);

  const startLevel = useCallback(
    (lvl: number, rng: () => number) => {
      const initial = createInitialState(lvl, rng);
      stateRef.current = initial;
      setGameState(initial);
      setLevel(lvl);
      setActiveVerse(null);
      setScreenMode('playing');
      lastFrameTime.current = 0;
      isRunning.current = true;
      overlayOpacity.setValue(0);
      verseOpacity.setValue(0);
    },
    [overlayOpacity, verseOpacity],
  );

  const startGame = useCallback(
    (mode: GameMode) => {
      setGameMode(mode);
      setCumulativeScore(0);
      setShownVerseIndex(0);

      const seenIds = noahStore.seenVerseIds;
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
      startLevel(1, rng);
    },
    [noahStore, todayStr, startLevel],
  );

  // --- event handling -------------------------------------------------------
  const handleEvents = useCallback(
    (events: GameEvent[]) => {
      for (const ev of events) {
        switch (ev.type) {
          case 'card_flipped':
            HapticsManager.light();
            break;
          case 'match_found':
            HapticsManager.success();
            break;
          case 'mismatch':
            HapticsManager.medium();
            break;
          case 'combo':
            if (ev.count >= 3) HapticsManager.success();
            break;
          case 'quick_recall':
            HapticsManager.light();
            break;
          case 'verse_milestone': {
            const idx = ev.milestone - 1;
            if (idx < sessionVerses.length) {
              setActiveVerse(sessionVerses[idx]);
              setShownVerseIndex((prev) => Math.max(prev, idx + 1));
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
          case 'level_complete': {
            isRunning.current = false;
            HapticsManager.success();
            setLastResult(ev.result);
            break;
          }
          case 'game_complete': {
            isRunning.current = false;
            HapticsManager.success();
            break;
          }
        }
      }
    },
    [sessionVerses, verseOpacity],
  );

  const dismissVerse = useCallback(() => {
    setActiveVerse(null);
    // Only resume if the level is still in play.
    if (stateRef.current && stateRef.current.phase === 'playing') {
      isRunning.current = true;
    }
  }, []);

  // --- record results on level/game complete --------------------------------
  const commitResult = useCallback(
    (result: LevelResult, isGameComplete: boolean) => {
      const total = cumulativeScore + result.score;
      setCumulativeScore(total);

      recordPlay(true, todayStr);
      noahStore.recordScore(total);
      noahStore.recordCombo(gameState?.bestCombo ?? 0);
      noahStore.recordMatches(result.matches);
      noahStore.recordLevel(result.level);
      if (gameState) noahStore.addAnimals(gameState.animalsMatched);

      const verseIds = sessionVerses.slice(0, shownVerseIndex).map((v) => v.id);
      if (verseIds.length > 0) noahStore.addSeenVerseIds(verseIds);

      processEvent({ type: 'score_reached', score: total });
      processEvent({ type: 'combo_reached', combo: gameState?.bestCombo ?? 0 });
      processEvent({ type: 'verses_seen', count: noahStore.seenVerseIds.length });

      if (result.perfectClear) {
        processEvent({ type: 'no_damage_daily' });
      }

      if (isGameComplete) {
        noahStore.recordGamePlayed();
        processEvent({
          type: 'streak_reached',
          streak: useStreakStore.getState().currentStreak,
        });
        processEvent({ type: 'games_played', count: noahStore.totalGamesPlayed });
        if (gameMode === 'daily') noahStore.recordDailyScore(todayStr, total);
      }
    },
    [
      cumulativeScore,
      gameState,
      gameMode,
      sessionVerses,
      shownVerseIndex,
      todayStr,
      recordPlay,
      processEvent,
      noahStore,
    ],
  );

  // React to phase changes that end a level.
  useEffect(() => {
    if (!gameState || !lastResult) return;
    if (gameState.phase === 'level_complete' && screenMode === 'playing') {
      commitResult(lastResult, false);
      setScreenMode('levelup');
      overlayOpacity.setValue(0);
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else if (gameState.phase === 'game_complete' && screenMode === 'playing') {
      commitResult(lastResult, true);
      setScreenMode('gameover');
      overlayOpacity.setValue(0);
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [gameState, lastResult, screenMode, commitResult, overlayOpacity]);

  useEffect(() => {
    if (newlyUnlocked.length > 0 && screenMode === 'gameover' && !celebratingBadge) {
      const timer = setTimeout(() => setCelebratingBadge(newlyUnlocked[0]), 1000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, screenMode, celebratingBadge]);

  // --- game loop ------------------------------------------------------------
  const updateState = useCallback(
    (newState: GameState, events: GameEvent[]) => {
      setGameState(newState);
      if (events.length > 0) handleEvents(events);
    },
    [handleEvents],
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

      const result = tick(stateRef.current, deltaMs);
      stateRef.current = result.state;
      updateState(result.state, result.events);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [updateState]);

  const handleCardPress = useCallback(
    (cardIndex: number) => {
      if (!stateRef.current) return;
      if (stateRef.current.phase !== 'playing') return;
      const result = flipCard(stateRef.current, cardIndex);
      stateRef.current = result.state;
      setGameState(result.state);
      if (result.events.length > 0) handleEvents(result.events);
    },
    [handleEvents],
  );

  const nextLevel = useCallback(() => {
    setLastResult(null);
    startLevel(level + 1, rngRef.current);
  }, [level, startLevel]);

  const playAgain = useCallback(() => {
    setLastResult(null);
    setScreenMode('select');
    setGameState(null);
    stateRef.current = null;
  }, []);

  // --- SELECT screen --------------------------------------------------------
  if (screenMode === 'select') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.selectContainer}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.selectTitle}>Noah Animal Match</Text>
          <Text style={styles.selectTagline}>Match the pairs. Fill the Ark.</Text>

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
              <Text style={styles.modeIcon}>{'🐘'}</Text>
              <Text style={styles.modeLabel}>Free Play</Text>
              <Text style={styles.modeDesc}>5 levels. Beat your high score.</Text>
            </Pressable>
          </View>

          {noahStore.highScore > 0 && (
            <Text style={styles.highScoreText}>High Score: {noahStore.highScore}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const gs = gameState;
  if (!gs) return null;

  const cfg = getLevelConfig(gs.level);
  const showFaceUp = gs.phase === 'preview';

  return (
    <SafeAreaView style={styles.screen}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Text style={styles.hudScore}>{cumulativeScore + gs.score}</Text>
          {gs.combo >= 2 && <Text style={styles.hudCombo}>{gs.combo}x</Text>}
        </View>
        <View style={styles.hudCenter}>
          <Text style={styles.hudLevel}>Level {gs.level}</Text>
          <Text style={styles.hudLevelName}>{cfg.name}</Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.hudMatches}>
            {gs.matches}/{gs.totalPairs}
          </Text>
        </View>
      </View>

      {/* Board area */}
      <View style={styles.boardArea}>
        <GameBackground palette={NOAH_PALETTE} />
        <Board gs={gs} cfg={cfg} showFaceUp={showFaceUp} onPress={handleCardPress} />
        {gs.phase === 'preview' && (
          <View style={styles.previewBanner} pointerEvents="none">
            <Text style={styles.previewText}>Memorize!</Text>
          </View>
        )}
      </View>

      {/* Verse overlay */}
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

      {/* Level up overlay */}
      {screenMode === 'levelup' && lastResult && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Level {lastResult.level} Clear!</Text>
            <Text style={styles.resultStars}>{formatStars(lastResult.stars)}</Text>
            <Text style={styles.resultScore}>{lastResult.score}</Text>
            <Text style={styles.resultLabel}>Points</Text>
            <View style={styles.resultStats}>
              <ResultStat value={`${lastResult.moves}`} label="Moves" />
              <ResultStat value={`${lastResult.timeBonus}`} label="Time Bonus" />
              <ResultStat value={lastResult.perfectClear ? 'Yes' : 'No'} label="Perfect" />
            </View>
            <Pressable style={styles.primaryButton} onPress={nextLevel}>
              <Text style={styles.primaryButtonText}>Next Level</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Home</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Game over / complete overlay */}
      {screenMode === 'gameover' && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {gs.level >= GAME_CONSTANTS.TOTAL_LEVELS ? 'The Ark is Full!' : 'Game Over'}
            </Text>
            {lastResult && <Text style={styles.resultStars}>{formatStars(lastResult.stars)}</Text>}
            <Text style={styles.resultScore}>{cumulativeScore}</Text>
            <Text style={styles.resultLabel}>Total Points</Text>
            <View style={styles.resultStats}>
              <ResultStat value={`${gs.bestCombo}x`} label="Best Combo" />
              <ResultStat value={`${noahStore.animalsCollected.length}`} label="Animals" />
              <ResultStat value={`${shownVerseIndex}`} label="Verses" />
            </View>
            <Pressable style={styles.primaryButton} onPress={playAgain}>
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
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
// Board: lays out cards in the level grid and renders each card.
// ---------------------------------------------------------------------------
function Board({
  gs,
  cfg,
  showFaceUp,
  onPress,
}: {
  gs: GameState;
  cfg: ReturnType<typeof getLevelConfig>;
  showFaceUp: boolean;
  onPress: (i: number) => void;
}) {
  const [areaW, setAreaW] = useState(0);

  const boardWidth = Math.min(areaW - spacing.lg * 2, MAX_BOARD_WIDTH);
  const cardSize = useMemo(() => {
    if (boardWidth <= 0) return 0;
    return (boardWidth - BOARD_GAP * (cfg.cols - 1)) / cfg.cols;
  }, [boardWidth, cfg.cols]);

  return (
    <View style={styles.boardWrap} onLayout={(e) => setAreaW(e.nativeEvent.layout.width)}>
      {cardSize > 0 && (
        <View style={[styles.board, { width: boardWidth }]}>
          {gs.cards.map((card) => {
            const faceUp =
              showFaceUp || card.state === 'faceup' || card.state === 'matched';
            const sprite = spriteForAnimal(card.name);
            return (
              <Pressable
                key={card.id}
                onPress={() => onPress(card.id)}
                disabled={showFaceUp || card.state === 'matched'}
                style={[
                  styles.card,
                  {
                    width: cardSize,
                    height: cardSize,
                    marginRight: card.col === cfg.cols - 1 ? 0 : BOARD_GAP,
                    marginBottom: BOARD_GAP,
                  },
                  faceUp ? styles.cardFaceUp : styles.cardFaceDown,
                  card.state === 'matched' && styles.cardMatched,
                ]}
              >
                {faceUp ? (
                  sprite ? (
                    <Image
                      source={sprite}
                      style={{ width: cardSize * 0.78, height: cardSize * 0.78 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ fontSize: cardSize * 0.5 }}>{card.emoji}</Text>
                  )
                ) : (
                  <Image
                    source={CARD_BACK}
                    style={{ width: cardSize * 0.92, height: cardSize * 0.92 }}
                    resizeMode="contain"
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
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
    backgroundColor: 'rgba(6, 18, 43, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 220, 255, 0.18)',
  },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  hudScore: { color: colors.gold, ...typography.score },
  hudCombo: { color: colors.teal, ...typography.combo },
  hudCenter: { alignItems: 'center', flex: 1 },
  hudLevel: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  hudLevelName: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  hudRight: { flex: 1, alignItems: 'flex-end' },
  hudMatches: { color: colors.teal, fontSize: 18, fontWeight: '900' },

  // Board
  boardArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  card: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cardFaceDown: {
    backgroundColor: 'rgba(20, 59, 30, 0.55)',
    borderColor: 'rgba(120, 220, 255, 0.30)',
  },
  cardFaceUp: {
    backgroundColor: 'rgba(245, 245, 240, 0.96)',
    borderColor: colors.gold,
  },
  cardMatched: {
    backgroundColor: 'rgba(57, 197, 255, 0.18)',
    borderColor: colors.teal,
  },
  previewBanner: {
    position: 'absolute',
    top: spacing.md,
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 18, 43, 0.8)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  previewText: { color: colors.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Verse overlay
  verseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 18, 43, 0.9)',
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

  // Result overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 18, 43, 0.92)',
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
  resultStars: { fontSize: 28, marginBottom: spacing.sm },
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
