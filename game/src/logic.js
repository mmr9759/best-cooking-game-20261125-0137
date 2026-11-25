// Wajan Panas! — every rule of the kitchen: what the hand may pick up, what
// the board chops, what the stove cooks, what a plate accepts, and what a
// served dish pays. Rendering never changes state; only these actions do.
import {
  CHOPS_NEEDED,
  INGREDIENTS,
  recipeFor,
  recipeById,
} from './config.js';
import {
  refreshLevel,
  tickClock,
  tickPatience,
  tickSpawning,
} from './state.js';
import { sfx } from './audio.js';

export function say(state, text, seconds = 2) {
  state.message = text;
  state.messageUntil = state.elapsed + seconds;
}

export function readyKind(ing) {
  const needs = INGREDIENTS[ing].needs;
  if (needs === 'chop') return 'chopped';
  return 'cooked';
}

function addFloater(state, x, y, text, colour) {
  state.floaters.push({ x, y, text, colour, life: 1.4 });
}

function burst(state, x, y, colour, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 140,
      vy: -40 - Math.random() * 90,
      life: 0.5 + Math.random() * 0.5,
      size: 3 + Math.random() * 4,
      colour,
    });
  }
}

export function pickFromBin(state, ing) {
  if (state.screen !== 'play' || state.paused) return;
  if (state.hand !== null) { say(state, 'Tanganmu penuh! Letakkan dulu.'); sfx.error(); return; }
  state.hand = { ing, kind: 'raw' };
  sfx.pick();
}

export function useBoard(state) {
  if (state.screen !== 'play' || state.paused) return;
  const board = state.board;
  if (board.ing === null) {
    if (state.hand === null) { say(state, 'Ambil bahan yang bisa dicincang dulu.'); return; }
    const needs = INGREDIENTS[state.hand.ing].needs;
    if (needs !== 'chop' && needs !== 'chopcook') {
      say(state, `${INGREDIENTS[state.hand.ing].name} tidak perlu dicincang.`);
      sfx.error();
      return;
    }
    if (state.hand.kind !== 'raw') { say(state, 'Bahan itu sudah dicincang.'); sfx.error(); return; }
    board.ing = state.hand.ing;
    board.chops = 0;
    state.hand = null;
    sfx.pick();
    return;
  }
  board.chops += 1;
  sfx.chop();
  burst(state, 440, 255, '#d7a86e', 5);
  if (board.chops >= CHOPS_NEEDED) {
    state.hand = { ing: board.ing, kind: 'chopped' };
    say(state, `${INGREDIENTS[board.ing].name} sudah tercincang!`);
    board.ing = null;
    board.chops = 0;
  }
}

export function useBurner(state, index) {
  if (state.screen !== 'play' || state.paused) return;
  const burner = state.burners[index];
  if (burner.state === 'empty') {
    if (state.hand === null) { say(state, 'Bawa bahan yang bisa dimasak ke kompor.'); return; }
    const def = INGREDIENTS[state.hand.ing];
    if (def.needs === 'chop') {
      say(state, `${def.name} tidak dimasak — langsung ke piring saja.`);
      sfx.error();
      return;
    }
    if (def.needs === 'chopcook' && state.hand.kind !== 'chopped') {
      say(state, `${def.name} harus dicincang dulu di talenan.`);
      sfx.error();
      return;
    }
    if (state.hand.kind === 'burnt') { say(state, 'Buang dulu ke tempat sampah.'); sfx.error(); return; }
    burner.ing = state.hand.ing;
    burner.kind = 'raw';
    burner.progress = 0;
    burner.state = 'cooking';
    state.hand = null;
    sfx.sizzle();
    return;
  }
  if (burner.state === 'cooking') {
    say(state, 'Masih dimasak... tunggu sampai matang!');
    return;
  }
  if (state.hand !== null) { say(state, 'Tanganmu penuh! Letakkan dulu.'); sfx.error(); return; }
  if (burner.state === 'done') {
    state.hand = { ing: burner.ing, kind: 'cooked' };
    sfx.pick();
  } else if (burner.state === 'burnt') {
    state.hand = { ing: burner.ing, kind: 'burnt' };
    say(state, 'Gosong! Buang ke tempat sampah.');
    sfx.burnt();
  }
  burner.ing = null;
  burner.kind = null;
  burner.progress = 0;
  burner.state = 'empty';
}

export function usePlate(state, index) {
  if (state.screen !== 'play' || state.paused) return;
  const plate = state.plates[index];
  if (state.hand !== null) {
    const item = state.hand;
    if (item.kind === 'burnt') { say(state, 'Yang gosong tidak bisa disajikan!'); sfx.error(); return; }
    if (item.kind === 'raw') { say(state, `${INGREDIENTS[item.ing].name} masih mentah! Olah dulu.`); sfx.error(); return; }
    if (item.kind !== readyKind(item.ing)) { say(state, `${INGREDIENTS[item.ing].name} belum siap!`); sfx.error(); return; }
    if (plate.items.includes(item.ing)) { say(state, 'Sudah ada di piring.'); sfx.error(); return; }
    if (plate.items.length >= 3) { say(state, 'Piring sudah penuh!'); sfx.error(); return; }
    plate.items.push(item.ing);
    state.hand = null;
    sfx.pick();
    const done = recipeFor(plate.items);
    if (done) { say(state, `${done.name} siap disajikan! Klik piring untuk antar.`, 2.5); sfx.ding(); }
    return;
  }
  if (plate.items.length === 0) { say(state, 'Piring kosong — taruh bahan yang sudah siap.'); return; }
  const done = recipeFor(plate.items);
  if (done) { servePlate(state, index); return; }
  const taken = plate.items.pop();
  state.hand = { ing: taken, kind: readyKind(taken) };
  sfx.pick();
}

export function useTrash(state) {
  if (state.screen !== 'play' || state.paused) return;
  if (state.hand === null) { say(state, 'Tidak ada yang dibuang.'); return; }
  say(state, `${INGREDIENTS[state.hand.ing].name} dibuang.`);
  state.hand = null;
  sfx.chop();
}

export function servePlate(state, index) {
  const plate = state.plates[index];
  const done = recipeFor(plate.items);
  if (!done) return false;
  const orderIndex = state.orders.findIndex((order) => order.recipeId === done.id);
  if (orderIndex === -1) {
    say(state, 'Tidak ada yang memesan itu sekarang.');
    sfx.error();
    return false;
  }
  const order = state.orders[orderIndex];
  state.orders.splice(orderIndex, 1);
  const timeBonus = Math.round((order.patience / order.maxPatience) * 10);
  const streakBonus = Math.floor(state.streak / 3) * 2;
  const earned = done.price + timeBonus + streakBonus;
  state.coins += earned;
  state.score += earned * 10;
  state.served += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  plate.items = [];
  addFloater(state, 1120, 260, `+${earned} koin`, '#ffd94d');
  burst(state, 1120, 280, '#ffd94d', 14);
  burst(state, 1120, 280, '#ff8a65', 8);
  say(state, `${done.name} untuk ${order.customer.name}! +${earned} koin.`, 2.5);
  sfx.serve();
  if (refreshLevel(state)) {
    say(state, `Level ${state.level}! Pesanan datang lebih cepat!`, 3);
    sfx.levelUp();
  }
  return true;
}

export function serveFirstReady(state) {
  for (let index = 0; index < state.plates.length; index += 1) {
    if (recipeFor(state.plates[index].items)) return servePlate(state, index);
  }
  say(state, 'Belum ada piring yang siap disajikan.');
  sfx.error();
  return false;
}

export function updateKitchen(state, dt) {
  if (state.screen !== 'play' || state.paused || state.frozen) return;
  const clockEvent = tickClock(state, dt);
  if (clockEvent === 'tick') sfx.tick();
  if (state.timeLeft <= 0) {
    state.screen = 'over';
    state.overReason = 'Shift selesai! Dapur tutup.';
    return;
  }
  tickSpawning(state, dt);
  const patienceEvent = tickPatience(state, dt);
  if (patienceEvent === 'expired') sfx.burnt();
  for (const burner of state.burners) {
    if (burner.state === 'cooking') {
      burner.progress += dt / INGREDIENTS[burner.ing].cookSeconds;
      if (burner.progress >= 1) {
        burner.state = 'done';
        burner.progress = 1;
        sfx.ding();
      }
    } else if (burner.state === 'done') {
      burner.progress += dt / 4;
      if (burner.progress >= 2) {
        burner.state = 'burnt';
        say(state, `${INGREDIENTS[burner.ing].name} gosong di kompor!`, 2.5);
        sfx.burnt();
      }
    }
  }
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 60 * dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  for (const floater of state.floaters) {
    floater.life -= dt;
    floater.y -= 34 * dt;
  }
  state.floaters = state.floaters.filter((floater) => floater.life > 0);
}

export function dishForPlate(plate) {
  return recipeFor(plate.items);
}

export { recipeById };
