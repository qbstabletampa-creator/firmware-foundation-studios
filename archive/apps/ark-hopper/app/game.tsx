import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Image,
  ImageSourcePropType,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { createInitialState, hop, tick } from '../src/game/gameEngine';
import { getAnimalForLevel } from '../src/game/itemConfig';
import type { Direction, GameEvent, GameState, Lane, LaneItem } from '../src/game/types';
import {
  getSprite,
  spriteForItemType,
  spriteForAnimal,
} from '../src/game/spriteMap';
import {
  initSound,
  playArkSound,
  setSoundEnabled,
  setHapticsEnabled,
  cleanupSound,
} from '../src/game/sound';
import { useArkHopperStore } from '../src/game/stores/arkHopperStore';
import { usePreferencesStore } from '../src/shell/stores/preferencesStore';
import GameBackground, { NOAH_PALETTE } from '../src/shell/components/GameBackground';
import { colors, radii, spacing, typography } from '../src/shell/theme';

// ---------------------------------------------------------------------------
// Ark Hopper -- FULL PLAYABLE render.
//
// This is the React-Native PRESENTATION + INPUT + LOOP over the pure engine.
// ALL game rules (collision, scoring, flood, riding, respawn, death, level
// complete) live in gameEngine.ts. This file never re-implements them: it
// calls hop()/tick(), applies the returned state, and reacts to returned
// events for sound, haptics, score tween, level advance, and NEW BEST.
//
// Coordinate model (inherited from the static milestone): engine row 0 is the
// bottom (start) lane and the goal lane is the top row; screen y grows down so
// rowToTop() flips. Lane items carry pixel x from the engine, placed against
// exactly the boardW/boardH passed into createInitialState -- so render coords
// line up with the engine's collision math.
// ---------------------------------------------------------------------------

const MAX_BOARD_WIDTH = 500;
const START_LEVEL = 1;
const MAX_LEVEL = 20;
const MIN_SWIPE = 26; // px; mirrors the fleet snake threshold / scene's 30px feel
const SCORE_TWEEN_MS = 200;
const HOP_ANIM_MS = 150;
const LEVEL_COMPLETE_HOLD_MS = 1300;
const DYING_HOLD_MS = 550;

// Terrain texture per lane type. Water/grass/path use the tex-* tiles; the
// start lane reads as grass and the goal lane as water (the ark sits on it).
const LANE_TEXTURE: Record<Lane['type'], string> = {
  start: 'tex-grass',
  grass: 'tex-grass',
  path: 'tex-path',
  water: 'tex-water',
  goal: 'tex-water',
};

const LANE_COLOR: Record<Lane['type'], string> = {
  start: '#2E5E3A',
  grass: '#2E5E3A',
  path: '#3A352E',
  water: '#0B3550',
  goal: '#103A5C',
};

const MOMENTUM_LABEL: Record<string, string> = {
  nice: 'Nice!',
  great: 'Great!',
  amazing: 'Amazing!',
  unstoppable: 'Unstoppable!',
};

type Overlay = null | 'level_complete';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const soundOn = usePreferencesStore((s) => s.soundEnabled);
  const hapticsOn = usePreferencesStore((s) => s.hapticsEnabled);
  const recordGame = useArkHopperStore((s) => s.recordGame);
  const highScore = useArkHopperStore((s) => s.highScore);

  // Board is square-ish, capped, centered. These exact dims feed the engine.
  const boardWidth = Math.min(width - spacing.lg * 2, MAX_BOARD_WIDTH);

  // --- React state (drives render) ------------------------------------------
  const [state, setState] = useState<GameState | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [momentumText, setMomentumText] = useState<string | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [bestAtOver, setBestAtOver] = useState(0);

  // --- Loop refs (no re-render churn) ---------------------------------------
  const stateRef = useRef<GameState | null>(null);
  const lastFrameTime = useRef(0);
  const runningRef = useRef(false); // loop ticks only while true
  const committedRef = useRef(false); // recordGame fires exactly once per run
  const boardHeightRef = useRef(0);

  // --- Animations -----------------------------------------------------------
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);
  const lastScore = useRef(0);
  const hopScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current; // death flash
  const momentumTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Board height: keep the static milestone's pleasant aspect, but if the level
  // has many rows make sure cells stay reasonably square-ish.
  const boardHeight = useMemo(() => {
    const rows = state?.totalRows ?? 5;
    // ~1.35 aspect at 5 rows; scale gently with row count, capped so tall
    // levels still fit on screen.
    const h = Math.round(boardWidth * Math.min(1.6, 0.9 + rows * 0.05));
    return h;
  }, [boardWidth, state?.totalRows]);

  // ---------------------------------------------------------------------------
  // Audio init + settings sync + teardown.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    initSound();
    return () => {
      cleanupSound();
    };
  }, []);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    setHapticsEnabled(hapticsOn);
  }, [hapticsOn]);

  // ---------------------------------------------------------------------------
  // Start / restart a run.
  // ---------------------------------------------------------------------------
  const beginLevel = useCallback(
    (level: number, freshRun: boolean) => {
      // Engine needs the CURRENT board height for this level's layout. We size
      // by row count, so compute it before building state.
      const tmp = createInitialState(level, boardWidth, 1);
      const rows = tmp.totalRows;
      const h = Math.round(boardWidth * Math.min(1.6, 0.9 + rows * 0.05));
      boardHeightRef.current = h;

      const initial = createInitialState(level, boardWidth, h);
      // Engine starts in 'ready'; flip straight to 'playing' so the loop runs.
      const playing: GameState = { ...initial, phase: 'playing' };
      stateRef.current = playing;
      setState(playing);
      lastFrameTime.current = 0;
      runningRef.current = true;

      if (freshRun) {
        committedRef.current = false;
        setNewBest(false);
        lastScore.current = 0;
        setDisplayScore(0);
        scoreAnim.setValue(0);
      }
    },
    [boardWidth, scoreAnim],
  );

  const startGame = useCallback(() => {
    playArkSound('buttonTap');
    setOverlay(null);
    overlayOpacity.setValue(0);
    beginLevel(START_LEVEL, true);
  }, [beginLevel, overlayOpacity]);

  // ---------------------------------------------------------------------------
  // Score tween: animate the HUD number toward the engine score (~200ms).
  // ---------------------------------------------------------------------------
  const tweenScoreTo = useCallback(
    (target: number) => {
      if (target === lastScore.current) return;
      scoreAnim.stopAnimation();
      Animated.timing(scoreAnim, {
        toValue: target,
        duration: SCORE_TWEEN_MS,
        useNativeDriver: false,
      }).start();
      lastScore.current = target;
    },
    [scoreAnim],
  );

  useEffect(() => {
    const id = scoreAnim.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    return () => scoreAnim.removeListener(id);
  }, [scoreAnim]);

  // ---------------------------------------------------------------------------
  // Player hop animation: a quick squash/stretch pop on every successful hop.
  // ---------------------------------------------------------------------------
  const popHop = useCallback(() => {
    hopScale.stopAnimation();
    hopScale.setValue(0.78);
    Animated.spring(hopScale, {
      toValue: 1,
      speed: 20,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  }, [hopScale]);

  const showMomentum = useCallback((tier: string) => {
    const label = MOMENTUM_LABEL[tier];
    if (!label) return;
    setMomentumText(label);
    if (momentumTimer.current) clearTimeout(momentumTimer.current);
    momentumTimer.current = setTimeout(() => setMomentumText(null), 900);
  }, []);

  const deathFlash = useCallback(() => {
    flashOpacity.setValue(0.7);
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [flashOpacity]);

  // ---------------------------------------------------------------------------
  // Commit a finished run to the store EXACTLY once. Read best BEFORE writing
  // so NEW BEST compares against the prior record (the store's recordGame does
  // Math.max internally, which would otherwise hide a fresh record).
  // ---------------------------------------------------------------------------
  const commitRun = useCallback(
    (finished: GameState) => {
      if (committedRef.current) return;
      committedRef.current = true;

      const prevBest = useArkHopperStore.getState().highScore;
      const score = finished.score;

      recordGame({
        score,
        combo: finished.momentum,
        level: finished.level,
        hops: finished.totalHops,
        starsCollected: finished.totalStars,
      });

      setFinalScore(score);
      setBestAtOver(Math.max(prevBest, score));
      setNewBest(score > prevBest && score > 0);
    },
    [recordGame],
  );

  // ---------------------------------------------------------------------------
  // Advance to the next level after a level_complete celebration.
  // ---------------------------------------------------------------------------
  const advanceLevel = useCallback(
    (completed: GameState) => {
      const next = completed.level + 1;
      if (next > MAX_LEVEL) {
        // Beat the final level: treat as a win -> game over screen with score.
        runningRef.current = false;
        commitRun(completed);
        setOverlay(null);
        // Reuse the game_over surface by flipping phase.
        const won: GameState = { ...completed, phase: 'game_over' };
        stateRef.current = won;
        setState(won);
        overlayOpacity.setValue(0);
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }).start();
        return;
      }
      // Carry score/lives/stars forward into the next level's fresh layout.
      const tmp = createInitialState(next, boardWidth, 1);
      const h = Math.round(boardWidth * Math.min(1.6, 0.9 + tmp.totalRows * 0.05));
      boardHeightRef.current = h;
      const fresh = createInitialState(next, boardWidth, h);
      const carried: GameState = {
        ...fresh,
        phase: 'playing',
        score: completed.score,
        lives: completed.lives,
        totalHops: completed.totalHops,
        totalStars: completed.totalStars,
        verseMilestone: completed.verseMilestone,
      };
      stateRef.current = carried;
      setState(carried);
      setOverlay(null);
      overlayOpacity.setValue(0);
      lastFrameTime.current = 0;
      runningRef.current = true;
    },
    [boardWidth, commitRun, overlayOpacity],
  );

  // ---------------------------------------------------------------------------
  // Process engine events: sound, haptics, score tween, NEW BEST, transitions.
  // The engine OWNS all state changes; here we only react with presentation.
  // ---------------------------------------------------------------------------
  const handleEvents = useCallback(
    (events: GameEvent[], nextState: GameState) => {
      let levelCompleted: GameState | null = null;
      let died = false;
      let gameOver = false;
      let deathCause: 'obstacle' | 'water' | 'flood' | 'off_screen' | null = null;

      for (const ev of events) {
        switch (ev.type) {
          case 'hop':
            playArkSound('hop');
            popHop();
            break;
          case 'star_collected':
            playArkSound('collectGood');
            break;
          case 'momentum':
            if (ev.tier) {
              playArkSound('combo');
              showMomentum(ev.tier);
            }
            break;
          case 'player_died':
            died = true;
            deathCause = ev.cause;
            break;
          case 'level_complete':
            levelCompleted = nextState;
            break;
          case 'game_over':
            gameOver = true;
            break;
          // life_lost / respawn / flood_row / invincibility are presented
          // implicitly by re-rendering the engine state. No extra logic here:
          // the engine already decremented one life and respawned the player.
        }
      }

      if (died) {
        // Water/off-screen drowning -> splash; obstacle/flood -> life-lost cue.
        if (deathCause === 'water' || deathCause === 'off_screen') {
          playArkSound('splash');
        } else {
          playArkSound('lifeLost');
        }
        deathFlash();
      }

      // Always reflect the live score.
      tweenScoreTo(nextState.score);

      if (gameOver) {
        playArkSound('gameOver');
        runningRef.current = false;
        commitRun(nextState);
        setOverlay(null);
        overlayOpacity.setValue(0);
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }).start();
        return;
      }

      if (levelCompleted) {
        playArkSound('levelComplete');
        runningRef.current = false; // freeze the loop during celebration
        setOverlay('level_complete');
        overlayOpacity.setValue(0);
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
        const completed = levelCompleted;
        setTimeout(() => advanceLevel(completed), LEVEL_COMPLETE_HOLD_MS);
      }
    },
    [
      popHop,
      showMomentum,
      deathFlash,
      tweenScoreTo,
      commitRun,
      advanceLevel,
      overlayOpacity,
    ],
  );

  // ---------------------------------------------------------------------------
  // RAF loop -- TIME-BASED, frame-independent. dtMs is real elapsed time, so
  // the game runs the same on 60Hz and 120Hz displays. The loop is the single
  // place tick() is called; hop() is called only from input.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let rafId: number;
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (!runningRef.current || !stateRef.current) return;
      if (stateRef.current.phase !== 'playing') return;
      if (lastFrameTime.current === 0) {
        lastFrameTime.current = now;
        return;
      }
      const dtMs = now - lastFrameTime.current;
      lastFrameTime.current = now;

      const w = boardWidth;
      const h = boardHeightRef.current || boardHeight;
      const result = tick(stateRef.current, dtMs, w, h);
      stateRef.current = result.state;
      setState(result.state);
      if (result.events.length > 0) handleEvents(result.events, result.state);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [boardWidth, boardHeight, handleEvents]);

  // Pause the loop when the app backgrounds; resume cleanly (no dt spike).
  // A single listener handles both directions so nothing leaks on unmount.
  const wasRunningBeforeBg = useRef(false);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        // Resume only if we were genuinely mid-run and no overlay took over.
        if (wasRunningBeforeBg.current && stateRef.current?.phase === 'playing' && !overlay) {
          lastFrameTime.current = 0; // avoid a huge dt on resume
          runningRef.current = true;
        }
        wasRunningBeforeBg.current = false;
      } else {
        // Backgrounding: freeze the loop, remember we need to resume it.
        if (runningRef.current && stateRef.current?.phase === 'playing') {
          wasRunningBeforeBg.current = true;
          runningRef.current = false;
        }
      }
    });
    return () => sub.remove();
  }, [overlay]);

  // Cleanup pending timers on unmount.
  useEffect(() => {
    return () => {
      if (momentumTimer.current) clearTimeout(momentumTimer.current);
      runningRef.current = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Input: swipe -> direction -> hop(). Ignored unless actively playing.
  // ---------------------------------------------------------------------------
  const doHop = useCallback(
    (dir: Direction) => {
      const cur = stateRef.current;
      if (!cur || cur.phase !== 'playing' || !runningRef.current) return;
      const w = boardWidth;
      const h = boardHeightRef.current || boardHeight;
      const result = hop(cur, dir, w, h);
      stateRef.current = result.state;
      setState(result.state);
      if (result.events.length > 0) handleEvents(result.events, result.state);
    },
    [boardWidth, boardHeight, handleEvents],
  );

  const isPlaying = state?.phase === 'playing' && runningRef.current && overlay === null;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isPlaying,
        onMoveShouldSetPanResponder: (_e, g) =>
          isPlaying && (Math.abs(g.dx) > MIN_SWIPE || Math.abs(g.dy) > MIN_SWIPE),
        onPanResponderRelease: (_e, g) => {
          if (!isPlaying) return;
          const absX = Math.abs(g.dx);
          const absY = Math.abs(g.dy);
          if (absX < MIN_SWIPE && absY < MIN_SWIPE) {
            // A tap (no real swipe) hops up -- the natural "forward" move.
            doHop('up');
            return;
          }
          if (absX > absY) {
            doHop(g.dx > 0 ? 'right' : 'left');
          } else {
            // Screen-down drag means hop DOWN (toward start); the engine's
            // 'up' is toward the goal, which is the top of the screen.
            doHop(g.dy > 0 ? 'down' : 'up');
          }
        },
      }),
    [isPlaying, doHop],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const level = state?.level ?? START_LEVEL;
  const animal = getAnimalForLevel(level);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <GameBackground palette={NOAH_PALETTE} level={level} />

      {/* HUD */}
      <View style={styles.hud}>
        <Pressable
          onPress={() => {
            playArkSound('buttonTap');
            router.back();
          }}
          hitSlop={12}
        >
          <Text style={styles.back}>{'<'}</Text>
        </Pressable>
        <View style={styles.hudStats}>
          <HudStat label="Score" value={displayScore} gold />
          <HudStat label="Level" value={level} />
          <Lives count={state?.lives ?? 0} />
          <HudStat label="Stars" value={state?.totalStars ?? 0} />
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardWrap} {...panResponder.panHandlers}>
        {state ? (
          <Board
            state={state}
            boardWidth={boardWidth}
            boardHeight={boardHeightRef.current || boardHeight}
            hopScale={hopScale}
            playerSprite={spriteForAnimal(animal.name)}
          />
        ) : (
          <View
            style={[
              styles.board,
              { width: boardWidth, height: boardHeight, borderRadius: radii.lg },
            ]}
          />
        )}

        {/* Death flash */}
        <Animated.View
          pointerEvents="none"
          style={[styles.deathFlash, { opacity: flashOpacity }]}
        />

        {/* Momentum / combo indicator */}
        {momentumText && (
          <View style={styles.momentumWrap} pointerEvents="none">
            <Text style={styles.momentumText}>{momentumText}</Text>
          </View>
        )}
      </View>

      <Text style={styles.hint}>
        Swipe to hop {animal.name} to Noah's Ark before the flood.
      </Text>

      {/* READY overlay (start / how to play) */}
      {!state && (
        <ReadyOverlay onStart={startGame} onBack={() => router.back()} highScore={highScore} />
      )}

      {/* LEVEL COMPLETE celebration */}
      {overlay === 'level_complete' && state && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="none">
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateRainbow}>{'\u{1F308}'}</Text>
            <Text style={styles.celebrateTitle}>Level {state.level} Cleared!</Text>
            <Text style={styles.celebrateScore}>{state.score}</Text>
            <Text style={styles.celebrateLabel}>Next level...</Text>
          </View>
        </Animated.View>
      )}

      {/* GAME OVER */}
      {state?.phase === 'game_over' && (
        <GameOverOverlay
          opacity={overlayOpacity}
          score={finalScore}
          best={bestAtOver}
          newBest={newBest}
          onPlayAgain={startGame}
          onHome={() => {
            playArkSound('buttonTap');
            router.back();
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ===========================================================================
// Board -- renders one engine frame.
// ===========================================================================
const Board = memo(function Board({
  state,
  boardWidth,
  boardHeight,
  hopScale,
  playerSprite,
}: {
  state: GameState;
  boardWidth: number;
  boardHeight: number;
  hopScale: Animated.Value;
  playerSprite: ImageSourcePropType | undefined;
}) {
  const cellW = boardWidth / state.totalCols;
  const cellH = boardHeight / state.totalRows;

  // Engine row 0 is the bottom (start) lane; screen y grows down -> flip.
  const rowToTop = (row: number) => (state.totalRows - 1 - row) * cellH;

  const playerLeft = state.player.col * cellW;
  const playerTop = rowToTop(state.player.row);
  const invincible = state.invincibleMs > 0;

  return (
    <View
      style={[
        styles.board,
        { width: boardWidth, height: boardHeight, borderRadius: radii.lg },
      ]}
    >
      {/* Lane terrain bands */}
      {state.lanes.map((lane, row) => {
        const tex = getSprite(LANE_TEXTURE[lane.type]);
        const top = rowToTop(row);
        const flooded = row < state.floodedRows;
        return (
          <View
            key={`lane-${row}`}
            style={[
              styles.lane,
              { top, height: cellH, width: boardWidth, backgroundColor: LANE_COLOR[lane.type] },
            ]}
          >
            {tex ? (
              <Image
                source={tex}
                style={{ width: boardWidth, height: cellH }}
                resizeMode="repeat"
              />
            ) : null}
            {flooded ? <View style={styles.floodedTint} /> : null}
          </View>
        );
      })}

      {/* Lane items (obstacles, platforms, stars) */}
      {state.lanes.map((lane, row) =>
        lane.items.map((item: LaneItem) => {
          const sprite = spriteForItemType(item.itemType);
          if (!sprite) return null;
          const isStar = item.itemType === 'star';
          const h = isStar
            ? Math.min(item.width, cellH * 0.7)
            : Math.min(item.width, cellH * 0.9);
          return (
            <Image
              key={`item-${item.id}`}
              source={sprite}
              style={{
                position: 'absolute',
                left: item.x,
                top: rowToTop(row) + (cellH - h) / 2,
                width: item.width,
                height: h,
              }}
              resizeMode="contain"
            />
          );
        }),
      )}

      {/* Goal: Noah's Ark centered on the goal lane */}
      {state.lanes.map((lane, row) => {
        if (lane.type !== 'goal') return null;
        const ark = getSprite('noahs-ark');
        if (!ark) return null;
        const arkW = boardWidth * 0.85;
        const arkH = cellH * 0.95;
        return (
          <Image
            key={`ark-${row}`}
            source={ark}
            style={{
              position: 'absolute',
              left: (boardWidth - arkW) / 2,
              top: rowToTop(row) + (cellH - arkH) / 2,
              width: arkW,
              height: arkH,
            }}
            resizeMode="contain"
          />
        );
      })}

      {/* Rising flood overlay covering flooded rows from the bottom up */}
      {state.floodedRows > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: state.floodedRows * cellH,
            backgroundColor: 'rgba(11, 53, 80, 0.66)',
            borderTopWidth: 2,
            borderTopColor: 'rgba(120, 200, 255, 0.5)',
          }}
        />
      )}

      {/* Player */}
      <Animated.View
        style={{
          position: 'absolute',
          left: playerLeft,
          top: playerTop,
          width: cellW,
          height: cellH,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: invincible ? 0.55 : 1,
          transform: [{ scale: hopScale }],
          zIndex: 10,
        }}
      >
        {playerSprite ? (
          <Image
            source={playerSprite}
            style={{ width: cellW * 0.85, height: cellH * 0.85 }}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ fontSize: cellW * 0.7 }}>{state.player.emoji}</Text>
        )}
      </Animated.View>
    </View>
  );
});

// ===========================================================================
// HUD pieces
// ===========================================================================
function HudStat({ label, value, gold }: { label: string; value: number; gold?: boolean }) {
  return (
    <View style={styles.hudStat}>
      <Text style={[styles.hudValue, gold && { color: colors.gold }]}>{value}</Text>
      <Text style={styles.hudLabel}>{label}</Text>
    </View>
  );
}

function Lives({ count }: { count: number }) {
  return (
    <View style={styles.hudStat}>
      <Text style={styles.hearts}>{count > 0 ? '❤'.repeat(count) : '—'}</Text>
      <Text style={styles.hudLabel}>Lives</Text>
    </View>
  );
}

// ===========================================================================
// Overlays
// ===========================================================================
function ReadyOverlay({
  onStart,
  onBack,
  highScore,
}: {
  onStart: () => void;
  onBack: () => void;
  highScore: number;
}) {
  return (
    <View style={styles.overlay}>
      <View style={styles.readyCard}>
        <Text style={styles.readyTitle}>Ark Hopper</Text>
        <Text style={styles.readySubtitle}>Hop to Noah's Ark before the flood</Text>

        <View style={styles.legend}>
          <LegendRow icon={'⭐'} text="Collect golden stars" />
          <LegendRow icon={'\u{1FAB5}'} text="Ride logs and lily pads across water" />
          <LegendRow icon={'\u{1F40F}'} text="Avoid sheep, goats, chickens & carts" />
          <LegendRow icon={'\u{1F30A}'} text="Don't fall in the water or get caught by the flood" />
        </View>

        <Text style={styles.readyControls}>Swipe up, down, left, right to hop. Tap to hop forward.</Text>

        {highScore > 0 && (
          <Text style={styles.readyBest}>Best: {highScore}</Text>
        )}

        <Pressable style={styles.primaryButton} onPress={onStart} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Start</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onBack} accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LegendRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.legendRow}>
      <Text style={styles.legendIcon}>{icon}</Text>
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

function GameOverOverlay({
  opacity,
  score,
  best,
  newBest,
  onPlayAgain,
  onHome,
}: {
  opacity: Animated.Value;
  score: number;
  best: number;
  newBest: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={styles.resultCard}>
        {newBest && (
          <View style={styles.newBestBanner}>
            <Text style={styles.newBestText}>NEW BEST!</Text>
          </View>
        )}
        <Text style={styles.resultTitle}>The waters rise</Text>
        <Text style={styles.resultScore}>{score}</Text>
        <Text style={styles.resultLabel}>Points</Text>
        <Text style={styles.resultBest}>Best: {best}</Text>

        <Pressable style={styles.primaryButton} onPress={onPlayAgain} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Play Again</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onHome} accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Home</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  back: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  hudStats: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  hudStat: {
    alignItems: 'center',
    minWidth: 44,
  },
  hudValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  hearts: {
    color: colors.hearts,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hudLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    overflow: 'hidden',
    backgroundColor: '#0B2547',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  lane: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
  },
  floodedTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 53, 80, 0.5)',
  },
  deathFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FF3D3D',
  },
  momentumWrap: {
    position: 'absolute',
    top: '14%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  momentumText: {
    color: colors.gold,
    fontSize: 30,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  hint: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },

  // Overlays (shared)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 12, 32, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Ready
  readyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  readyTitle: {
    color: colors.gold,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  readySubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  legend: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  legendIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  legendText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 19,
  },
  readyControls: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  readyBest: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  // Level complete celebration
  celebrateCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
    minWidth: 260,
  },
  celebrateRainbow: { fontSize: 48, marginBottom: spacing.sm },
  celebrateTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  celebrateScore: {
    color: colors.gold,
    fontSize: 44,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  celebrateLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },

  // Game over
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  newBestBanner: {
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  newBestText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resultScore: { color: colors.gold, fontSize: 52, fontWeight: '900' },
  resultLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultBest: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
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
    marginTop: spacing.sm,
  },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
});
