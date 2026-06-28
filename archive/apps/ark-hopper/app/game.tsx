import { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { createInitialState } from '../src/game/gameEngine';
import { getAnimalForLevel } from '../src/game/itemConfig';
import type { GameState, Lane, LaneItem } from '../src/game/types';
import { getSprite, spriteForItemType, spriteForAnimal } from '../src/game/spriteMap';
import GameBackground, { NOAH_PALETTE } from '../src/shell/components/GameBackground';
import { colors, radii, spacing, typography } from '../src/shell/theme';

// ---------------------------------------------------------------------------
// Ark Hopper -- STATIC board render (foundation milestone).
//
// This proves the ported pure engine state renders to real PNG sprites in
// React Native: lanes as terrain bands, lane items + the player positioned from
// engine coordinates. There is NO input handler and NO RAF loop yet -- those
// arrive in the next loop. The board is a frozen snapshot of level 1's initial
// state.
// ---------------------------------------------------------------------------

const MAX_BOARD_WIDTH = 500;
const START_LEVEL = 1;

// Terrain texture per lane type. Water/grass/path use the tex-* tiles; the
// start lane reads as grass and the goal lane as water (the ark sits on it).
const LANE_TEXTURE: Record<Lane['type'], string> = {
  start: 'tex-grass',
  grass: 'tex-grass',
  path: 'tex-path',
  water: 'tex-water',
  goal: 'tex-water',
};

// Fallback band color if a texture is missing, so a lane never renders empty.
const LANE_COLOR: Record<Lane['type'], string> = {
  start: '#2E5E3A',
  grass: '#2E5E3A',
  path: '#3A352E',
  water: '#0B3550',
  goal: '#103A5C',
};

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Board is square-ish, capped, centered.
  const boardWidth = Math.min(width - spacing.lg * 2, MAX_BOARD_WIDTH);
  const boardHeight = Math.round(boardWidth * 1.35);

  // Build the initial engine state at this board size. The engine lays out lane
  // items in pixel space using exactly these dimensions, so render coords match.
  const state: GameState = useMemo(
    () => createInitialState(START_LEVEL, boardWidth, boardHeight),
    [boardWidth, boardHeight],
  );

  const cellW = boardWidth / state.totalCols;
  const cellH = boardHeight / state.totalRows;

  // Engine row 0 is the bottom (start) lane; screen y grows downward, so flip.
  const rowToTop = (row: number) => (state.totalRows - 1 - row) * cellH;

  const animal = getAnimalForLevel(state.level);
  const playerSprite = spriteForAnimal(animal.name);
  const playerLeft = state.player.col * cellW;
  const playerTop = rowToTop(state.player.row);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <GameBackground palette={NOAH_PALETTE} level={state.level} />

      <View style={styles.hud}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>{'←'}</Text>
        </Pressable>
        <View style={styles.hudStats}>
          <HudStat label="Score" value={state.score} />
          <HudStat label="Level" value={state.level} />
          <HudStat label="Lives" value={state.lives} />
        </View>
      </View>

      <View style={styles.boardWrap}>
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
              </View>
            );
          })}

          {/* Lane items (obstacles, platforms, stars) */}
          {state.lanes.map((lane, row) =>
            lane.items.map((item: LaneItem) => {
              const sprite = spriteForItemType(item.itemType);
              if (!sprite) return null;
              return (
                <Image
                  key={`item-${item.id}`}
                  source={sprite}
                  style={{
                    position: 'absolute',
                    left: item.x,
                    top: rowToTop(row) + (cellH - item.width) / 2,
                    width: item.width,
                    height: Math.min(item.width, cellH * 0.9),
                  }}
                  resizeMode="contain"
                />
              );
            }),
          )}

          {/* Goal: Noah's Ark sprite centered on the goal lane */}
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

          {/* Player */}
          <View
            style={{
              position: 'absolute',
              left: playerLeft,
              top: playerTop,
              width: cellW,
              height: cellH,
              alignItems: 'center',
              justifyContent: 'center',
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
          </View>
        </View>
      </View>

      <Text style={styles.hint}>
        Help {animal.name} hop to Noah's Ark before the flood.
      </Text>
    </SafeAreaView>
  );
}

function HudStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.hudStat}>
      <Text style={styles.hudValue}>{value}</Text>
      <Text style={styles.hudLabel}>{label}</Text>
    </View>
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
    gap: spacing.lg,
  },
  hudStat: {
    alignItems: 'center',
  },
  hudValue: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '900',
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
  hint: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
});
