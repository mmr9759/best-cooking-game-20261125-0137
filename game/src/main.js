// Wajan Panas! — boots the kitchen: canvas, input (mouse + keys), the frame
// loop, and the ?shot= scenes used for the entry's screenshots.
import { BIN_ORDER, VIEW } from './config.js';
import { createState, resetRun } from './state.js';
import {
  pickFromBin,
  serveFirstReady,
  updateKitchen,
  useBoard,
  useBurner,
  usePlate,
  useTrash,
} from './logic.js';
import { LAYOUT, render } from './render.js';
import { stageShot } from './shots.js';
import { setMuted, sfx } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createState();
let lastTime = performance.now();

function inside(x, y, zone) {
  return x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
    y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
  };
}

function handleClick(point) {
  sfx.unlock();
  if (state.screen === 'title') {
    if (inside(point.x, point.y, LAYOUT.startButton)) resetRun(state);
    return;
  }
  if (state.screen === 'over') {
    if (inside(point.x, point.y, LAYOUT.restartButton)) resetRun(state);
    return;
  }
  if (inside(point.x, point.y, LAYOUT.muteButton)) {
    state.muted = !state.muted;
    setMuted(state.muted);
    return;
  }
  for (const bin of LAYOUT.bins) {
    if (inside(point.x, point.y, bin)) { pickFromBin(state, bin.ing); return; }
  }
  if (inside(point.x, point.y, LAYOUT.board)) { useBoard(state); return; }
  for (let index = 0; index < LAYOUT.burners.length; index += 1) {
    if (inside(point.x, point.y, LAYOUT.burners[index])) { useBurner(state, index); return; }
  }
  for (let index = 0; index < LAYOUT.plates.length; index += 1) {
    if (inside(point.x, point.y, LAYOUT.plates[index])) { usePlate(state, index); return; }
  }
  if (inside(point.x, point.y, LAYOUT.serve)) { serveFirstReady(state); return; }
  if (inside(point.x, point.y, LAYOUT.trash)) { useTrash(state); return; }
}

canvas.addEventListener('click', (event) => handleClick(canvasPoint(event)));

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (state.screen === 'title' && (key === 'enter' || key === ' ')) { resetRun(state); return; }
  if (state.screen === 'over' && key === 'r') { resetRun(state); return; }
  if (state.screen !== 'play') return;
  const binIndex = ['1', '2', '3', '4', '5', '6'].indexOf(key);
  if (binIndex !== -1) { pickFromBin(state, BIN_ORDER[binIndex]); return; }
  if (key === 'b') useBoard(state);
  else if (key === 'p') serveFirstReady(state);
  else if (key === 'm') {
    state.muted = !state.muted;
    setMuted(state.muted);
  } else if (key === ' ') {
    state.paused = !state.paused;
    event.preventDefault();
  }
});

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (state.screen === 'play') updateKitchen(state, dt);
  state.elapsed += dt;
  render(ctx, state);
  requestAnimationFrame(frame);
}

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot !== null) {
  stageShot(shot, state);
  state.elapsed = 2;
}
render(ctx, state);
requestAnimationFrame(frame);
