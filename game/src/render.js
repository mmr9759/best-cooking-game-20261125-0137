// Wajan Panas! — draws the whole kitchen on one canvas: the wall and floor,
// the header with the shift clock, the order board, the bins, the board, the
// stove, the plates, the serving hatch, the hand and the message toast.
// Click zones live in LAYOUT, which main.js reads for input.
import { BIN_ORDER, INGREDIENTS, MAX_HEARTS, recipeById, recipeFor } from './config.js';
import { drawChip, drawDish, drawFace, drawIngredient, roundRect } from './drawfood.js';

export const LAYOUT = {
  bins: BIN_ORDER.map((ing, i) => ({ ing, x: 16 + (i % 3) * 136, y: 212 + Math.floor(i / 3) * 106, w: 128, h: 96 })),
  board: { x: 440, y: 212, w: 240, h: 118 },
  burners: [0, 1].map((i) => ({ x: 452 + i * 122, y: 392, w: 110, h: 150 })),
  plates: [0, 1].map((i) => ({ x: 716 + i * 168, y: 216, w: 150, h: 190 })),
  serve: { x: 1036, y: 212, w: 228, h: 198 },
  trash: { x: 1036, y: 430, w: 228, h: 112 },
  startButton: { x: 490, y: 470, w: 300, h: 64 },
  restartButton: { x: 490, y: 480, w: 300, h: 64 },
  muteButton: { x: 1212, y: 664, w: 52, h: 40 },
};

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawFlame(ctx, x, y, size, time) {
  const flicker = 1 + Math.sin(time * 9 + x) * 0.12;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flicker, flicker);
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.7, -size * 0.2, size * 0.35, size * 0.4);
  ctx.quadraticCurveTo(0, size * 0.7, -size * 0.35, size * 0.4);
  ctx.quadraticCurveTo(-size * 0.7, -size * 0.2, 0, -size);
  ctx.fill();
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.1, size * 0.2, size * 0.35);
  ctx.quadraticCurveTo(0, size * 0.55, -size * 0.2, size * 0.35);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.1, 0, -size * 0.5);
  ctx.fill();
  ctx.restore();
}

function drawHeader(ctx, state) {
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(0, 0, 1280, 56);
  ctx.fillStyle = '#ffca28';
  drawFlame(ctx, 40, 34, 16, state.elapsed);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WAJAN PANAS!', 62, 30);
  ctx.fillStyle = '#ffcc80';
  ctx.font = '15px sans-serif';
  ctx.fillText('Kitchen Rush', 312, 30);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`Koin  ${state.coins}`, 470, 29);
  ctx.fillText(`Skor  ${state.score}`, 640, 29);
  ctx.fillStyle = state.streak >= 3 ? '#ffd54f' : '#ffcc80';
  ctx.fillText(`Streak x${state.streak}`, 800, 29);
  for (let i = 0; i < MAX_HEARTS; i += 1) {
    ctx.fillStyle = i < state.hearts ? '#ff5252' : '#6d4c41';
    ctx.beginPath();
    ctx.arc(930 + i * 28, 29, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Level ${state.level}`, 1030, 29);
  const urgent = state.timeLeft <= 15;
  ctx.fillStyle = urgent && Math.floor(state.elapsed * 2) % 2 === 0 ? '#ff5252' : '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(state.timeLeft), 1264, 30);
  ctx.textAlign = 'left';
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('PESANAN', 16, 82);
  ctx.fillStyle = '#ffcc80';
  ctx.font = '13px sans-serif';
  ctx.fillText('Sajikan sebelum kesabaran pelanggan habis!', 110, 82);
  for (let slot = 0; slot < 4; slot += 1) {
    const x = 16 + slot * 304;
    const y = 90;
    const w = 296;
    const h = 78;
    const order = state.orders[slot];
    ctx.fillStyle = order ? '#fffdf5' : 'rgba(255,253,245,0.35)';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = order ? '#d7a86e' : '#bcaaa4';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!order) {
      ctx.fillStyle = '#a1887f';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('— menunggu pesanan —', x + w / 2, y + h / 2 + 5);
      ctx.textAlign = 'left';
      continue;
    }
    drawFace(ctx, order.customer, x + 28, y + 30, 18);
    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(order.name, x + 54, y + 24);
    ctx.fillStyle = '#8d6e63';
    ctx.font = '12px sans-serif';
    ctx.fillText(order.customer.name, x + 54, y + 42);
    ctx.fillStyle = '#f57c00';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${order.price} koin`, x + w - 10, y + 24);
    ctx.textAlign = 'left';
    let chipX = x + 54;
    for (const ing of order.needs) {
      drawChip(ctx, INGREDIENTS[ing].short, chipX, y + 50, 30, 20, INGREDIENTS[ing].base);
      chipX += 34;
    }
    const ratio = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = '#e0e0e0';
    roundRect(ctx, x + 10, y + h - 12, w - 20, 7, 3);
    ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#43a047' : ratio > 0.25 ? '#fb8c00' : '#e53935';
    roundRect(ctx, x + 10, y + h - 12, (w - 20) * ratio, 7, 3);
    ctx.fill();
  }
}

function drawBins(ctx, state) {
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('BAHAN  (klik / tombol 1-6)', 16, 200);
  for (const bin of LAYOUT.bins) {
    const def = INGREDIENTS[bin.ing];
    const inHand = state.hand !== null && state.hand.ing === bin.ing;
    ctx.fillStyle = inHand ? '#ffe082' : '#a1887f';
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.fill();
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, bin.x + 4, bin.y + 4, bin.w - 8, bin.h - 8, 8);
    ctx.fill();
    drawIngredient(ctx, bin.ing, bin.x + bin.w / 2, bin.y + 38, 62, 'raw');
    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(def.name, bin.x + bin.w / 2, bin.y + 84);
    ctx.textAlign = 'left';
  }
}

function drawBoard(ctx, state) {
  const zone = LAYOUT.board;
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('TALENAN  (klik 3x untuk cincang)', 440, 200);
  ctx.fillStyle = '#d7a86e';
  roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 10);
  ctx.fill();
  ctx.fillStyle = '#b98a4e';
  roundRect(ctx, zone.x + 6, zone.y + 6, zone.w - 12, zone.h - 12, 8);
  ctx.fill();
  if (state.board.ing !== null) {
    drawIngredient(ctx, state.board.ing, zone.x + zone.w / 2, zone.y + 52, 70, 'raw');
    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Cincang: ${state.board.chops}/3`, zone.x + zone.w / 2, zone.y + 104);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = '#8d6e63';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Taruh Ayam / Sayur / Cabai di sini', zone.x + zone.w / 2, zone.y + 60);
    ctx.textAlign = 'left';
  }
}

function drawStove(ctx, state) {
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('KOMPOR', 440, 372);
  ctx.fillStyle = '#5d4037';
  roundRect(ctx, 440, 380, 240, 160, 10);
  ctx.fill();
  LAYOUT.burners.forEach((zone, index) => {
    const burner = state.burners[index];
    const cx = zone.x + zone.w / 2;
    const cy = zone.y + 52;
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();
    if (burner.state === 'cooking') {
      drawFlame(ctx, cx - 18, cy + 26, 9, state.elapsed);
      drawFlame(ctx, cx + 18, cy + 26, 9, state.elapsed + 1.3);
    }
    if (burner.ing !== null) {
      ctx.fillStyle = burner.state === 'burnt' ? '#3e2723' : '#9e9e9e';
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();
      drawIngredient(ctx, burner.ing, cx, cy, 52, burner.state === 'burnt' ? 'burnt' : burner.state === 'done' ? 'cooked' : 'raw');
    }
    ctx.fillStyle = '#eceff1';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const label = burner.state === 'empty' ? 'kosong' : burner.state === 'cooking' ? 'memasak...' : burner.state === 'done' ? 'MATANG!' : 'GOSONG!';
    ctx.fillText(label, cx, zone.y + 128);
    if (burner.state === 'cooking' || burner.state === 'done') {
      const ratio = burner.state === 'done' ? 1 : Math.min(1, burner.progress);
      ctx.fillStyle = '#263238';
      roundRect(ctx, zone.x + 8, zone.y + 134, zone.w - 16, 8, 4);
      ctx.fill();
      ctx.fillStyle = burner.state === 'done' ? '#43a047' : '#fb8c00';
      roundRect(ctx, zone.x + 8, zone.y + 134, (zone.w - 16) * ratio, 8, 4);
      ctx.fill();
    }
    ctx.textAlign = 'left';
  });
}

function drawPlates(ctx, state) {
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('PIRING SAJI  (klik piring jadi untuk antar)', 716, 200);
  LAYOUT.plates.forEach((zone, index) => {
    const plate = state.plates[index];
    const cx = zone.x + zone.w / 2;
    const cy = zone.y + 78;
    const done = recipeFor(plate.items);
    const glow = done && Math.floor(state.elapsed * 3) % 2 === 0;
    ctx.fillStyle = '#8d6e63';
    roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 12);
    ctx.fill();
    if (glow) {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 5;
      roundRect(ctx, zone.x - 2, zone.y - 2, zone.w + 4, zone.h + 4, 14);
      ctx.stroke();
    }
    if (plate.items.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 58, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d7ccc8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#a1887f';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('piring kosong', cx, cy + 72);
    } else {
      drawDish(ctx, plate.items, cx, cy, 120);
      ctx.fillStyle = '#3e2723';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      if (done) {
        ctx.fillStyle = '#3e2723';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(done.name, cx, cy + 68);
        ctx.fillStyle = '#2e7d32';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('— SIAP! —', cx, cy + 88);
      } else {
        ctx.fillText(plate.items.map((ing) => INGREDIENTS[ing].name).join(' + '), cx, cy + 78);
      }
    }
    ctx.textAlign = 'left';
  });
}

function drawServeAndTrash(ctx, state) {
  const serve = LAYOUT.serve;
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('JENDELA ANTAR', 1036, 200);
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  roundRect(ctx, serve.x + 10, serve.y + 10, serve.w - 20, 110, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.arc(serve.x + serve.w / 2, serve.y + 78, 26, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(serve.x + serve.w / 2 - 32, serve.y + 76, 64, 6);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DING! Pesanan diantar di sini', serve.x + serve.w / 2, serve.y + 146);
  ctx.fillText(`Tersaji: ${state.served} piring`, serve.x + serve.w / 2, serve.y + 170);
  ctx.textAlign = 'left';
  const trash = LAYOUT.trash;
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('TEMPAT SAMPAH', 1036, 420);
  ctx.fillStyle = '#607d8b';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 12);
  ctx.fill();
  ctx.fillStyle = '#455a64';
  roundRect(ctx, trash.x + 10, trash.y + 8, trash.w - 20, trash.h - 16, 8);
  ctx.fill();
  ctx.fillStyle = '#eceff1';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Klik untuk membuang isi tangan', trash.x + trash.w / 2, trash.y + trash.h / 2 + 5);
  ctx.textAlign = 'left';
}

function drawHandBar(ctx, state) {
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(0, 648, 1280, 72);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('TANGAN:', 16, 686);
  if (state.hand === null) {
    ctx.fillStyle = '#ffcc80';
    ctx.font = '15px sans-serif';
    ctx.fillText('(kosong)', 100, 686);
  } else {
    const def = INGREDIENTS[state.hand.ing];
    drawIngredient(ctx, state.hand.ing, 150, 684, 44, state.hand.kind);
    ctx.fillStyle = '#fff3e0';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`${def.name} (${state.hand.kind === 'raw' ? 'mentah' : state.hand.kind === 'chopped' ? 'cincang' : state.hand.kind === 'cooked' ? 'matang' : 'gosong'})`, 180, 686);
  }
  ctx.fillStyle = '#ffcc80';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('1-6 bahan  •  klik talenan untuk cincang  •  klik kompor untuk masak  •  klik piring untuk rakit  •  P jeda  •  M suara', 700, 686);
  ctx.textAlign = 'left';
  ctx.fillStyle = state.muted ? '#ff5252' : '#8d6e63';
  roundRect(ctx, LAYOUT.muteButton.x, LAYOUT.muteButton.y, LAYOUT.muteButton.w, LAYOUT.muteButton.h, 8);
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.muted ? 'MUTE' : 'SUARA', LAYOUT.muteButton.x + 26, LAYOUT.muteButton.y + 26);
  ctx.textAlign = 'left';
  if (state.message && state.elapsed < state.messageUntil) {
    ctx.fillStyle = 'rgba(62,39,35,0.92)';
    const width = Math.min(900, 40 + state.message.length * 8.4);
    roundRect(ctx, 640 - width / 2, 600, width, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#fff3e0';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, 640, 623);
    ctx.textAlign = 'left';
  }
}

function drawBackground(ctx, state) {
  const wall = ctx.createLinearGradient(0, 0, 0, 176);
  wall.addColorStop(0, '#ff9d5c');
  wall.addColorStop(1, '#ffb74d');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 56, 1280, 120);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let x = 0; x < 1280; x += 64) {
    for (let y = 56; y < 176; y += 40) {
      ctx.fillRect(x + ((y / 40) % 2) * 32, y, 60, 36);
    }
  }
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(0, 176, 1280, 472);
  ctx.fillStyle = '#efdfba';
  for (let x = 0; x < 1280; x += 80) {
    for (let y = 176; y < 648; y += 80) {
      if (((x + y) / 80) % 2 === 0) ctx.fillRect(x, y, 80, 80);
    }
  }
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(0, 176, 1280, 8);
}

// Steam, sparks and floating score text draw last, above the counters.
function drawEffects(ctx, state) {
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.colour;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  for (const floater of state.floaters) {
    ctx.globalAlpha = Math.min(1, floater.life);
    ctx.fillStyle = floater.colour;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(floater.text, floater.x, floater.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(43,26,18,0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  drawFlame(ctx, 300, 150, 34, state.elapsed);
  drawFlame(ctx, 980, 150, 34, state.elapsed + 2);
  ctx.fillText('WAJAN PANAS!', 640, 170);
  ctx.fillStyle = '#ffcc80';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Kitchen Rush di Dapur Bara — masak cepat, sajikan tepat waktu!', 640, 214);
  ctx.fillStyle = '#fff3e0';
  ctx.font = '18px sans-serif';
  const lines = [
    'Ambil bahan di counter, cincang di talenan, masak di kompor,',
    'rakit di piring, lalu antar sebelum pelanggan kehabisan sabar.',
    'Nasi Goreng Bara • Mie Goreng Pedas • Ayam Geprek Bara • Sup Sayur • Dadar Sayur Pedas',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 268 + i * 30));
  ctx.fillStyle = '#ffb74d';
  roundRect(ctx, LAYOUT.startButton.x, LAYOUT.startButton.y, LAYOUT.startButton.w, LAYOUT.startButton.h, 12);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('MULAI MASAK', 640, LAYOUT.startButton.y + 42);
  ctx.fillStyle = '#ffcc80';
  ctx.font = '15px sans-serif';
  ctx.fillText('Mouse + tombol 1-6  •  Shift 2,5 menit  •  3 hati', 640, 580);
  ctx.textAlign = 'left';
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(43,26,18,0.85)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAPUR TUTUP!', 640, 170);
  ctx.fillStyle = '#ffcc80';
  ctx.font = '22px sans-serif';
  ctx.fillText(state.overReason, 640, 214);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`Koin: ${state.coins}    Skor: ${state.score}    Piring tersaji: ${state.served}`, 640, 300);
  ctx.font = '22px sans-serif';
  ctx.fillText(`Streak terbaik: x${state.bestStreak}    Level tercapai: ${state.level}`, 640, 340);
  ctx.fillStyle = '#ffb74d';
  roundRect(ctx, LAYOUT.restartButton.x, LAYOUT.restartButton.y, LAYOUT.restartButton.w, LAYOUT.restartButton.h, 12);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('MAIN LAGI  (R)', 640, LAYOUT.restartButton.y + 41);
  ctx.textAlign = 'left';
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(43,26,18,0.6)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JEDA  —  tekan P untuk lanjut', 640, 360);
  ctx.textAlign = 'left';
}

export function render(ctx, state) {
  drawBackground(ctx, state);
  drawHeader(ctx, state);
  drawOrderBoard(ctx, state);
  drawBins(ctx, state);
  drawBoard(ctx, state);
  drawStove(ctx, state);
  drawPlates(ctx, state);
  drawServeAndTrash(ctx, state);
  drawHandBar(ctx, state);
  drawEffects(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'over') drawGameOver(ctx, state);
  if (state.paused && state.screen === 'play') drawPaused(ctx);
}

export { recipeById };
