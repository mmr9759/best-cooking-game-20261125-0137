// Wajan Panas! — every food icon and customer face is drawn with canvas
// shapes, so the game needs no image files. Each ingredient gets a small
// readable glyph: a mound of rice, wavy noodles, a fried egg, a drumstick,
// leafy greens and a chilli.
import { INGREDIENTS } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawIngredient(ctx, ing, cx, cy, size, kind = 'raw') {
  const def = INGREDIENTS[ing];
  const s = size;
  ctx.save();
  ctx.translate(cx, cy);
  if (kind === 'burnt') {
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.1);
    ctx.lineTo(s * 0.22, s * 0.12);
    ctx.moveTo(s * 0.22, -s * 0.1);
    ctx.lineTo(-s * 0.22, s * 0.12);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (ing === 'nasi') {
    ctx.fillStyle = kind === 'cooked' ? '#fff3c4' : '#fdf6e3';
    ctx.beginPath();
    ctx.arc(0, s * 0.08, s * 0.38, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = kind === 'cooked' ? '#e8c96a' : '#d9c48f';
    for (const [dx, dy] of [[-0.18, -0.02], [0, -0.14], [0.18, -0.02], [-0.08, 0.08], [0.1, 0.08]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
    if (kind === 'cooked') {
      ctx.fillStyle = '#ff8a65';
      ctx.fillRect(-s * 0.3, s * 0.22, s * 0.6, s * 0.06);
    }
  } else if (ing === 'mie') {
    ctx.strokeStyle = kind === 'cooked' ? '#f2b705' : '#ffd94d';
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    for (let row = -1; row <= 1; row += 1) {
      ctx.beginPath();
      for (let x = -s * 0.36; x <= s * 0.36; x += s * 0.06) {
        const y = row * s * 0.16 + Math.sin(x * 9 / s) * s * 0.07;
        if (x === -s * 0.36) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (ing === 'telur') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.42, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = kind === 'cooked' ? '#f2b705' : '#f7c948';
    ctx.beginPath();
    ctx.arc(s * 0.06, 0, s * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(s * 0.02, -s * 0.05, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing === 'ayam') {
    ctx.fillStyle = kind === 'cooked' ? '#b96a2e' : '#e8a06a';
    ctx.beginPath();
    ctx.ellipse(-s * 0.05, s * 0.02, s * 0.3, s * 0.24, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.arc(s * 0.3, s * 0.24, s * 0.07, 0, Math.PI * 2);
    ctx.arc(s * 0.36, s * 0.3, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fdf6e3';
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(s * 0.18, s * 0.12);
    ctx.lineTo(s * 0.3, s * 0.26);
    ctx.stroke();
    if (kind === 'chopped') {
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.12);
      ctx.lineTo(s * 0.08, s * 0.12);
      ctx.moveTo(s * 0.08, -s * 0.12);
      ctx.lineTo(-s * 0.2, s * 0.12);
      ctx.stroke();
    }
  } else if (ing === 'sayur') {
    ctx.fillStyle = kind === 'chopped' ? '#43a047' : '#7ed957';
    for (let i = 0; i < 3; i += 1) {
      const angle = -Math.PI / 2 + (i - 1) * 0.6;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * s * 0.16, Math.sin(angle) * s * 0.16, s * 0.2, s * 0.11, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.05);
    ctx.lineTo(0, s * 0.32);
    ctx.stroke();
    if (kind === 'chopped') {
      ctx.fillStyle = '#c8e6c9';
      for (const [dx, dy] of [[-0.2, 0.2], [0.15, 0.18], [0, 0.28]]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (ing === 'cabai') {
    ctx.strokeStyle = kind === 'chopped' ? '#e53935' : '#ff5252';
    ctx.lineWidth = s * 0.13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.3, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.ellipse(s * 0.22, -s * 0.3, s * 0.1, s * 0.05, 0.6, 0, Math.PI * 2);
    ctx.fill();
    if (kind === 'chopped') {
      ctx.fillStyle = '#e53935';
      for (const [dx, dy] of [[-0.2, 0.15], [0, 0.2], [0.2, 0.12]]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * 0.09, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// A served dish: the plate's ingredients drawn together on a white plate.
export function drawDish(ctx, items, cx, cy, size) {
  const s = size;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.52, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d7ccc8';
  ctx.lineWidth = Math.max(1, s * 0.03);
  ctx.stroke();
  const slots = [[-0.18, -0.08], [0.16, -0.1], [0, 0.12]];
  items.forEach((ing, index) => {
    const [dx, dy] = slots[index % slots.length];
    drawIngredient(ctx, ing, dx * s, dy * s, s * 0.52, ing === 'sayur' || ing === 'cabai' ? 'chopped' : 'cooked');
  });
  ctx.restore();
}

// A customer's face: skin circle, hair, eyes and a smile, from their colours.
export function drawFace(ctx, customer, cx, cy, radius) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = customer.skin;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = customer.hair;
  ctx.beginPath();
  ctx.arc(0, -radius * 0.25, radius * 0.95, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(-radius * 0.35, -radius * 0.05, radius * 0.09, 0, Math.PI * 2);
  ctx.arc(radius * 0.35, -radius * 0.05, radius * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = Math.max(1.5, radius * 0.08);
  ctx.beginPath();
  ctx.arc(0, radius * 0.15, radius * 0.42, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.fillStyle = customer.shirt;
  ctx.beginPath();
  ctx.arc(0, radius * 1.35, radius * 0.85, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

export function drawChip(ctx, text, x, y, w, h, fill, colour = '#3e2723') {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = colour;
  ctx.font = `bold ${Math.round(h * 0.52)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

export { roundRect };
