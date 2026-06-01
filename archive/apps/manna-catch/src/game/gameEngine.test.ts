import { describe, it, expect } from 'vitest';
import { createInitialState, tick } from './gameEngine';
import type { GameState, FallingItem, ActivePowerUp } from './types';
import { GAME_CONSTANTS } from './itemConfig';

// ---------------------------------------------------------------------------
// Deterministic RNG for reproducible tests
// ---------------------------------------------------------------------------

function makeRng(): () => number {
  let i = 0;
  const seq = [0.5, 0.3, 0.7, 0.1, 0.9, 0.2, 0.8, 0.4, 0.6, 0.15];
  return () => seq[i++ % seq.length];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GAME_WIDTH = 400;
const GAME_HEIGHT = 800;

/** Convenience: item size the engine will compute for our GAME_WIDTH. */
const ITEM_SIZE = Math.round(GAME_WIDTH * GAME_CONSTANTS.ITEM_SIZE_RATIO);

/** Build a basket-height value consistent with what the engine derives. */
const BASKET_HEIGHT = ITEM_SIZE * 0.6;
const BASKET_Y = GAME_HEIGHT - ITEM_SIZE - BASKET_HEIGHT;

/** Create a FallingItem positioned to collide with the basket. */
function makeGoodItemAtBasket(overrides: Partial<FallingItem> = {}): FallingItem {
  return {
    id: 'test_good',
    type: 'manna',
    category: 'good',
    x: 50,
    y: BASKET_Y + 1, // inside the basket zone
    speed: 120,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    points: 10,
    icon: '🍞',
    rotation: 0,
    ...overrides,
  };
}

/** Create a bad FallingItem positioned to collide with the basket. */
function makeBadItemAtBasket(overrides: Partial<FallingItem> = {}): FallingItem {
  return {
    id: 'test_bad',
    type: 'thorn',
    category: 'bad',
    x: 50,
    y: BASKET_Y + 1,
    speed: 120,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    points: 0,
    icon: '🌿',
    rotation: 0,
    ...overrides,
  };
}

/** Create a FallingItem that has gone off the bottom of the screen. */
function makeOffScreenItem(category: 'good' | 'bad'): FallingItem {
  return {
    id: `test_${category}_off`,
    type: category === 'good' ? 'manna' : 'thorn',
    category,
    x: 50,
    y: GAME_HEIGHT + 10, // past the screen bottom
    speed: 120,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    points: category === 'good' ? 5 : 0,
    icon: category === 'good' ? '🍞' : '🌿',
    rotation: 0,
  };
}

/** Create a playing state with the basket sized and positioned. */
function makePlayingState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState('freeplay');
  return {
    ...base,
    basket: { x: 40, width: Math.round(GAME_WIDTH * GAME_CONSTANTS.BASKET_WIDTH_RATIO) },
    // Push nextSpawnMs far into the future so spawning doesn't interfere with
    // collision-focused tests.
    nextSpawnMs: 999_999,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createInitialState', () => {
  it('returns correct defaults', () => {
    const state = createInitialState('daily');
    expect(state.lives).toBe(GAME_CONSTANTS.INITIAL_LIVES);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('playing');
    expect(state.items).toEqual([]);
    expect(state.combo).toBe(0);
    expect(state.bestCombo).toBe(0);
    expect(state.elapsedMs).toBe(0);
    expect(state.versesMilestone).toBe(0);
    expect(state.mode).toBe('daily');
  });

  it('accepts freeplay mode', () => {
    const state = createInitialState('freeplay');
    expect(state.mode).toBe('freeplay');
  });
});

describe('tick', () => {
  it('with no items just advances elapsedMs', () => {
    const state = makePlayingState();
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.elapsedMs).toBe(16);
    expect(next.score).toBe(0);
    expect(next.lives).toBe(GAME_CONSTANTS.INITIAL_LIVES);
    // No collision events when there are no items.
    const collisionEvents = events.filter(
      (e) => e.type === 'item_caught' || e.type === 'item_missed' || e.type === 'bad_item_caught',
    );
    expect(collisionEvents).toHaveLength(0);
  });

  it('good item caught increases score and combo', () => {
    const item = makeGoodItemAtBasket({ points: 10 });
    const state = makePlayingState({ items: [item] });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.score).toBe(10);
    expect(next.combo).toBe(1);
    expect(events.some((e) => e.type === 'item_caught')).toBe(true);
    // The caught item is removed from the items array.
    expect(next.items.filter((i) => i.id === item.id)).toHaveLength(0);
  });

  it('bad item caught decreases lives and resets combo', () => {
    const item = makeBadItemAtBasket();
    const state = makePlayingState({ combo: 5, items: [item] });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.lives).toBe(GAME_CONSTANTS.INITIAL_LIVES - 1);
    expect(next.combo).toBe(0);
    expect(events.some((e) => e.type === 'bad_item_caught')).toBe(true);
    expect(events.some((e) => e.type === 'life_lost')).toBe(true);
  });

  it('good item missed (off screen) resets combo but does not lose life', () => {
    const item = makeOffScreenItem('good');
    const state = makePlayingState({ combo: 4, items: [item] });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.lives).toBe(GAME_CONSTANTS.INITIAL_LIVES);
    expect(next.combo).toBe(0);
    expect(events.some((e) => e.type === 'item_missed')).toBe(true);
  });

  it('bad item falling off screen is harmless', () => {
    const item = makeOffScreenItem('bad');
    const state = makePlayingState({ combo: 3, items: [item] });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.lives).toBe(GAME_CONSTANTS.INITIAL_LIVES);
    expect(next.combo).toBe(3); // combo unchanged
    // No item_missed or life_lost events.
    expect(events.some((e) => e.type === 'item_missed')).toBe(false);
    expect(events.some((e) => e.type === 'life_lost')).toBe(false);
  });

  it('game over when lives reach 0', () => {
    const items = [
      makeBadItemAtBasket({ id: 'bad1' }),
    ];
    const state = makePlayingState({ lives: 1, items });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.lives).toBe(0);
    expect(next.phase).toBe('gameover');
    expect(events.some((e) => e.type === 'game_over')).toBe(true);
  });

  it('does not process ticks when phase is gameover', () => {
    const state = makePlayingState({ phase: 'gameover' });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next).toBe(state); // exact same reference
    expect(events).toHaveLength(0);
  });

  it('verse milestone fires at 50, 100, 150 points', () => {
    // Score is 45. Catching a 10-point item brings it to 55, crossing the 50 milestone.
    const item = makeGoodItemAtBasket({ points: 10 });
    const state = makePlayingState({ score: 45, items: [item], versesMilestone: 0 });
    const { state: next, events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.score).toBe(55);
    expect(next.versesMilestone).toBe(1);
    expect(events.some((e) => e.type === 'verse_milestone' && e.milestone === 1)).toBe(true);

    // Now cross 100. Score is 95, catch a 10-pointer for 105.
    const item2 = makeGoodItemAtBasket({ id: 'good2', points: 10 });
    const state2 = makePlayingState({
      score: 95,
      items: [item2],
      versesMilestone: 1,
    });
    const { state: next2, events: events2 } = tick(state2, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next2.score).toBe(105);
    expect(next2.versesMilestone).toBe(2);
    expect(events2.some((e) => e.type === 'verse_milestone' && e.milestone === 2)).toBe(true);

    // Cross 150: score 145 + 10 = 155.
    const item3 = makeGoodItemAtBasket({ id: 'good3', points: 10 });
    const state3 = makePlayingState({
      score: 145,
      items: [item3],
      versesMilestone: 2,
    });
    const { state: next3, events: events3 } = tick(state3, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next3.score).toBe(155);
    expect(next3.versesMilestone).toBe(3);
    expect(events3.some((e) => e.type === 'verse_milestone' && e.milestone === 3)).toBe(true);
  });

  it('combo event fires at 3+', () => {
    // Build a state with combo 2 and catch a good item to reach combo 3.
    const item = makeGoodItemAtBasket({ points: 5 });
    const state = makePlayingState({ combo: 2, items: [item] });
    const { events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(events.some((e) => e.type === 'combo' && e.count === 3)).toBe(true);
  });

  it('combo event does not fire at combo 2 or less', () => {
    // combo is 1 before catch, becomes 2 after.
    const item = makeGoodItemAtBasket({ points: 5 });
    const state = makePlayingState({ combo: 1, items: [item] });
    const { events } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(events.some((e) => e.type === 'combo')).toBe(false);
  });

  it('power-up timers decrement and expire', () => {
    const powerUp: ActivePowerUp = {
      type: 'slow_mo',
      remainingMs: 50,
      icon: '🐢',
      color: '#B388FF',
    };
    const state = makePlayingState({ activePowerUps: [powerUp] });
    // Tick with 16ms: remaining drops to 34ms.
    const { state: next1, events: events1 } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());
    expect(next1.activePowerUps).toHaveLength(1);
    expect(next1.activePowerUps[0].remainingMs).toBe(34);
    expect(events1.some((e) => e.type === 'powerup_expired')).toBe(false);

    // Now tick with 40ms: remaining 34 - 40 = -6, should expire.
    const { state: next2, events: events2 } = tick(next1, 40, GAME_WIDTH, GAME_HEIGHT, makeRng());
    expect(next2.activePowerUps).toHaveLength(0);
    expect(events2.some((e) => e.type === 'powerup_expired' && e.type_ === 'slow_mo')).toBe(true);
  });

  it('slow-mo halves item speed', () => {
    // Create an item high above the basket so it will NOT collide or go off
    // screen. We just measure how far it falls.
    const item: FallingItem = {
      id: 'speed_test',
      type: 'manna',
      category: 'good',
      x: 50,
      y: 100,
      speed: 200, // 200 px/s
      width: ITEM_SIZE,
      height: ITEM_SIZE,
      points: 5,
      icon: '🍞',
      rotation: 0,
    };

    // Without slow-mo: 200 px/s * 0.1s = 20px fall.
    const stateNormal = makePlayingState({ items: [item] });
    const { state: nextNormal } = tick(stateNormal, 100, GAME_WIDTH, GAME_HEIGHT, makeRng());
    const normalItem = nextNormal.items.find((i) => i.id === 'speed_test');
    expect(normalItem).toBeDefined();
    const normalDrop = normalItem!.y - item.y;

    // With slow-mo: 200 px/s * 0.5 * 0.1s = 10px fall (half).
    const powerUp: ActivePowerUp = {
      type: 'slow_mo',
      remainingMs: 5000,
      icon: '🐢',
      color: '#B388FF',
    };
    const stateSlowMo = makePlayingState({ items: [item], activePowerUps: [powerUp] });
    const { state: nextSlowMo } = tick(stateSlowMo, 100, GAME_WIDTH, GAME_HEIGHT, makeRng());
    const slowItem = nextSlowMo.items.find((i) => i.id === 'speed_test');
    expect(slowItem).toBeDefined();
    const slowDrop = slowItem!.y - item.y;

    // Slow-mo drop should be half of normal drop.
    expect(slowDrop).toBeCloseTo(normalDrop / 2, 5);
  });

  it('delta is clamped to 100ms max', () => {
    const state = makePlayingState();
    // Pass a huge delta (500ms) but elapsedMs should only advance by 100ms.
    const { state: next } = tick(state, 500, GAME_WIDTH, GAME_HEIGHT, makeRng());
    expect(next.elapsedMs).toBe(100);
  });

  it('bestCombo tracks the highest combo reached', () => {
    const item = makeGoodItemAtBasket({ points: 5 });
    const state = makePlayingState({ combo: 4, bestCombo: 4, items: [item] });
    const { state: next } = tick(state, 16, GAME_WIDTH, GAME_HEIGHT, makeRng());

    expect(next.combo).toBe(5);
    expect(next.bestCombo).toBe(5);
  });
});
