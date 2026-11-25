// Wajan Panas! — every tunable number and every recipe lives here, so the
// kitchen can be rebalanced without touching the rules in logic.js.
export const VIEW = { width: 1280, height: 720 };
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const CHOPS_NEEDED = 3;
export const BURNER_COUNT = 2;
export const PLATE_COUNT = 2;
export const PLATE_SLOTS = 3;

// One ingredient: its id, its Indonesian name, whether it must be chopped or
// cooked before it can be plated, how long it cooks, and its colours.
export const INGREDIENTS = {
  nasi:  { id: 'nasi',  name: 'Nasi',  needs: 'cook', cookSeconds: 4, short: 'NS', base: '#fff6d8', dark: '#e8c96a' },
  mie:   { id: 'mie',   name: 'Mie',   needs: 'cook', cookSeconds: 4, short: 'MI', base: '#ffd94d', dark: '#d9a400' },
  telur: { id: 'telur', name: 'Telur', needs: 'cook', cookSeconds: 3, short: 'TL', base: '#fffdf5', dark: '#f2b705' },
  ayam:  { id: 'ayam',  name: 'Ayam',  needs: 'chopcook', cookSeconds: 5, short: 'AY', base: '#e8a06a', dark: '#a85c22' },
  sayur: { id: 'sayur', name: 'Sayur', needs: 'chop', cookSeconds: 0, short: 'SY', base: '#7ed957', dark: '#2f7d32' },
  cabai: { id: 'cabai', name: 'Cabai', needs: 'chop', cookSeconds: 0, short: 'CB', base: '#ff5252', dark: '#b71c1c' },
};
export const BIN_ORDER = ['nasi', 'mie', 'telur', 'ayam', 'sayur', 'cabai'];

// A dish is a set of ready ingredients. The plate only accepts an ingredient
// in its ready state (cooked, or chopped), so every dish forces a real route
// through the board and the stove.
export const RECIPES = [
  { id: 'nasi-goreng',  name: 'Nasi Goreng Bara',   needs: ['nasi', 'telur', 'cabai'], price: 18 },
  { id: 'mie-goreng',   name: 'Mie Goreng Pedas',   needs: ['mie', 'ayam', 'sayur'],  price: 22 },
  { id: 'ayam-geprek',  name: 'Ayam Geprek Bara',   needs: ['ayam', 'cabai', 'nasi'], price: 24 },
  { id: 'sup-sayur',    name: 'Sup Sayur Hangat',   needs: ['sayur', 'telur'],        price: 14 },
  { id: 'dadar-spesial', name: 'Dadar Sayur Pedas',  needs: ['telur', 'sayur', 'cabai'], price: 16 },
];

export function recipeFor(items) {
  const have = [...items].sort().join(',');
  for (const recipe of RECIPES) {
    if ([...recipe.needs].sort().join(',') === have) return recipe;
  }
  return null;
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) ?? null;
}

// How fast the rush grows: each level shortens the gap between new orders
// and the patience a ticket waits with.
export function levelFor(served) {
  return 1 + Math.floor(served / 4);
}

export function spawnGapSeconds(level) {
  return Math.max(6, 11 - level);
}

export function patienceSeconds(level) {
  return Math.max(26, 42 - level * 2);
}

// The regulars who queue at the pass. Faces are drawn from these colours.
export const CUSTOMERS = [
  { name: 'Mbak Sari', skin: '#f2c48d', hair: '#3e2723', shirt: '#e91e63' },
  { name: 'Pak Budi',  skin: '#e8b07d', hair: '#212121', shirt: '#1976d2' },
  { name: 'Dek Rani',  skin: '#f7d7a8', hair: '#4e342e', shirt: '#7b1fa2' },
  { name: 'Mas Joko',  skin: '#d9a066', hair: '#1a1a1a', shirt: '#00897b' },
  { name: 'Bu Tini',   skin: '#f2c48d', hair: '#616161', shirt: '#f57c00' },
  { name: 'Kak Dina',  skin: '#e8b07d', hair: '#5d4037', shirt: '#43a047' },
];
