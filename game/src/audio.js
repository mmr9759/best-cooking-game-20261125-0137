// Wajan Panas! — every sound is synthesised with WebAudio, so the game ships
// no audio files at all. The context is created lazily on the first gesture,
// which keeps browsers happy about autoplay.
let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audioContext() {
  if (context === null) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(frequency, seconds, type, volume, when = 0) {
  const audio = audioContext();
  if (audio === null || muted) return;
  const start = audio.currentTime + when;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + seconds + 0.02);
}

function noiseBurst(seconds, volume, lowpass) {
  const audio = audioContext();
  if (audio === null || muted) return;
  const length = Math.floor(audio.sampleRate * seconds);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const gain = audio.createGain();
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
}

export const sfx = {
  // Unlock the context on a real gesture, even when no sound plays yet.
  unlock() { audioContext(); },
  pick() { tone(520, 0.07, 'triangle', 0.12); },
  chop() { noiseBurst(0.08, 0.25, 1800); tone(180, 0.06, 'square', 0.08); },
  sizzle() { noiseBurst(0.25, 0.10, 5200); },
  ding() { tone(880, 0.12, 'sine', 0.16); tone(1318, 0.2, 'sine', 0.12, 0.09); },
  serve() {
    tone(523, 0.1, 'triangle', 0.16);
    tone(659, 0.1, 'triangle', 0.16, 0.08);
    tone(784, 0.18, 'triangle', 0.16, 0.16);
  },
  error() { tone(160, 0.16, 'sawtooth', 0.10); },
  burnt() { tone(220, 0.25, 'sawtooth', 0.10); tone(147, 0.3, 'sawtooth', 0.10, 0.12); },
  tick() { tone(980, 0.05, 'square', 0.06); },
  levelUp() {
    tone(392, 0.1, 'triangle', 0.14);
    tone(523, 0.1, 'triangle', 0.14, 0.09);
    tone(659, 0.16, 'triangle', 0.14, 0.18);
  },
};
