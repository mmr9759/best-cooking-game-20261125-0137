// Wajan Panas! — the three screenshot scenes. Each one stages a real,
// reachable kitchen state (orders on the board, a pan on the stove, a dish
// mid-assembly on a plate, a plate ready to serve) and freezes the clock,
// so headless Chrome screenshots the game's own render, never a mockup.
import { resetRun, spawnOrder } from './state.js';

function stageCommon(state, overrides) {
  resetRun(state);
  state.screen = 'play';
  state.frozen = true;
  Object.assign(state, overrides);
}

function fillOrders(state, count, patienceRatio = 1) {
  while (state.orders.length < count) spawnOrder(state);
  for (const order of state.orders) {
    order.patience = order.maxPatience * patienceRatio;
  }
}

/** Set `state` to the named scene and return the screen to draw over it. */
export function stageShot(name, state) {
  if (name === 'mid') {
    stageCommon(state, {
      timeLeft: 121, coins: 18, score: 540, served: 2, streak: 1, hearts: 3, level: 1,
      hand: { ing: 'telur', kind: 'cooked' },
    });
    fillOrders(state, 2);
    state.board = { ing: 'sayur', chops: 1 };
    state.burners[0] = { ing: 'mie', kind: 'raw', progress: 0.4, state: 'cooking' };
    state.burners[1] = { ing: null, kind: null, progress: 0, state: 'empty' };
    state.plates[0] = { items: ['mie', 'ayam'] };
    state.plates[1] = { items: [] };
    state.message = 'Mie Goreng Pedas hampir jadi — tambah Sayur cincang!';
    state.messageUntil = 9999;
    return 'play';
  }
  if (name === 'rush') {
    stageCommon(state, {
      timeLeft: 34, coins: 86, score: 2410, served: 9, streak: 5, bestStreak: 5, hearts: 2, level: 3,
      hand: { ing: 'nasi', kind: 'cooked' },
    });
    fillOrders(state, 4, 0.35);
    state.orders[0].patience = state.orders[0].maxPatience * 0.12;
    state.board = { ing: 'cabai', chops: 2 };
    state.burners[0] = { ing: 'ayam', kind: 'raw', progress: 1, state: 'done' };
    state.burners[1] = { ing: 'nasi', kind: 'raw', progress: 0.8, state: 'cooking' };
    state.plates[0] = { items: ['ayam', 'cabai'] };
    state.plates[1] = { items: ['ayam', 'cabai', 'nasi'] };
    state.message = 'RUSH! Sajikan Ayam Geprek Bara sebelum pelanggan pergi!';
    state.messageUntil = 9999;
    return 'play';
  }
  // Default: the cover — the busiest, most complete frame.
  stageCommon(state, {
    timeLeft: 98, coins: 42, score: 1250, served: 5, streak: 3, bestStreak: 4, hearts: 3, level: 2,
    hand: { ing: 'cabai', kind: 'chopped' },
  });
  fillOrders(state, 4);
  state.board = { ing: 'ayam', chops: 2 };
  state.burners[0] = { ing: 'nasi', kind: 'raw', progress: 0.6, state: 'cooking' };
  state.burners[1] = { ing: 'telur', kind: 'raw', progress: 1, state: 'done' };
  state.plates[0] = { items: ['nasi', 'telur'] };
  state.plates[1] = { items: ['mie', 'ayam', 'sayur'] };
  state.message = 'Nasi Goreng Bara hampir jadi — tambah Cabai cincang!';
  state.messageUntil = 9999;
  return 'play';
}
