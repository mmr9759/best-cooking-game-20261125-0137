// Wajan Panas! — the whole kitchen in one plain object, plus the functions
// that grow it: new orders, the shift clock, the level ladder.
import {
  BURNER_COUNT,
  CUSTOMERS,
  MAX_HEARTS,
  MAX_ORDERS,
  PLATE_COUNT,
  RECIPES,
  SHIFT_SECONDS,
  levelFor,
  patienceSeconds,
  spawnGapSeconds,
} from './config.js';

let nextOrderId = 1;

export function createState() {
  return {
    screen: 'title', // 'title' | 'play' | 'over'
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    score: 0,
    served: 0,
    streak: 0,
    bestStreak: 0,
    hearts: MAX_HEARTS,
    level: 1,
    orders: [],
    spawnIn: 2.5,
    hand: null, // null | { ing, kind: 'raw' | 'chopped' | 'cooked' | 'burnt' }
    board: { ing: null, chops: 0 },
    burners: Array.from({ length: BURNER_COUNT }, () => ({
      ing: null, kind: null, progress: 0, state: 'empty', // 'empty' | 'cooking' | 'done' | 'burnt'
    })),
    plates: Array.from({ length: PLATE_COUNT }, () => ({ items: [] })),
    particles: [],
    floaters: [],
    message: '',
    messageUntil: 0,
    elapsed: 0,
    overReason: '',
    muted: false,
    paused: false,
    frozen: false, // demo scenes (?shot=) freeze the clock without the pause veil
    lastTickSecond: -1,
  };
}

function randomRecipe() {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)];
}

function randomCustomer() {
  return CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return false;
  const recipe = randomRecipe();
  const patience = patienceSeconds(state.level);
  state.orders.push({
    id: nextOrderId,
    recipeId: recipe.id,
    name: recipe.name,
    needs: [...recipe.needs],
    price: recipe.price,
    patience,
    maxPatience: patience,
    customer: randomCustomer(),
  });
  nextOrderId += 1;
  return true;
}

export function resetRun(state) {
  const fresh = createState();
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
  state.screen = 'play';
  spawnOrder(state);
  spawnOrder(state);
  state.spawnIn = spawnGapSeconds(1);
  state.message = 'Shift dimulai! Ambil bahan, masak, sajikan!';
  state.messageUntil = state.elapsed + 3;
}

export function tickClock(state, dt) {
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  const whole = Math.ceil(state.timeLeft);
  if (whole <= 10 && whole !== state.lastTickSecond && state.timeLeft > 0) {
    state.lastTickSecond = whole;
    return 'tick';
  }
  return null;
}

export function tickSpawning(state, dt) {
  state.spawnIn -= dt;
  if (state.spawnIn > 0) return;
  state.spawnIn = spawnGapSeconds(state.level);
  spawnOrder(state);
}

export function tickPatience(state, dt) {
  for (let index = state.orders.length - 1; index >= 0; index -= 1) {
    const order = state.orders[index];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(index, 1);
      state.hearts -= 1;
      state.streak = 0;
      state.message = `Pelanggan ${order.customer.name} pergi kecewa!`;
      state.messageUntil = state.elapsed + 2.5;
      if (state.hearts <= 0) {
        state.screen = 'over';
        state.overReason = 'Semua pelanggan pergi — dapur tutup!';
      }
      return 'expired';
    }
  }
  return null;
}

export function refreshLevel(state) {
  const level = levelFor(state.served);
  if (level !== state.level) {
    state.level = level;
    return true;
  }
  return false;
}
