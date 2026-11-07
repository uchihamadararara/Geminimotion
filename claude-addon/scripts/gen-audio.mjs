// Sparse, Warm Apple/Linear-Grade Studio Sound Design -> public/sfx-studio-v2.wav
// Zero repetitive blips, zero laser zaps, zero background music loop — only 14 intentional, warm, low-passed cinema foley moments across 54.6s.
import fs from 'fs';

const SR = 44100;
const DUR = 54.6;
const N = Math.floor(SR * DUR);
const pcm = new Float32Array(N);

function detNoise(seedIndex) {
  let x = (seedIndex ^ 0x6d2b79f5) >>> 0;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 2147483648 - 1;
}

const add = (t0, len, fn) => {
  const s0 = Math.max(0, Math.floor(t0 * SR));
  const count = Math.floor(len * SR);
  for (let i = 0; i < count && s0 + i < N; i++) {
    pcm[s0 + i] += fn(i / SR, s0 + i);
  }
};

// 1. Warm Felted Sub-Bass Cinema Pulse (Soft 18ms mallet attack, low-passed < 130Hz, warm & deep)
const addWarmSubPulse = (t0, dur = 0.95, startHz = 62, endHz = 31, gain = 0.48) => {
  let phase = 0;
  let phase2 = 0;
  let brown = 0;
  add(t0, dur, (dt, idx) => {
    const attack = Math.min(1, dt / 0.018);
    const freq = endHz + (startHz - endHz) * Math.exp(-9.5 * dt);
    phase += (2 * Math.PI * freq) / SR;
    phase2 += (2 * Math.PI * freq * 1.5) / SR;
    const subEnv = Math.exp(-3.8 * dt);
    const fundamental = Math.sin(phase) * 0.82 + Math.sin(phase2) * 0.18 * Math.exp(-8 * dt);
    // Soft Brownian low-end room warmth
    brown = brown * 0.96 + detNoise(idx * 3) * 0.04;
    const feltThump = brown * Math.exp(-28 * dt) * 0.35;
    return (fundamental * subEnv + feltThump) * attack * gain;
  });
};

// 2. Silk Low-Passed Camera Lens Air Movement (Warm Brownian air < 380Hz, never harsh or hissy)
const addSilkCameraAir = (t0, dur = 0.55, peakHz = 280, gain = 0.24) => {
  let lp1 = 0;
  let lp2 = 0;
  let subPh = 0;
  add(t0, dur, (dt, idx) => {
    const k = dt / dur;
    const env = Math.sin(k * Math.PI) ** 2.2;
    const cutoff = 90 + peakHz * Math.sin(k * Math.PI);
    const alpha = Math.min(0.25, (2 * Math.PI * cutoff) / SR);
    const n = detNoise(idx * 5);
    lp1 += alpha * (n - lp1);
    lp2 += alpha * (lp1 - lp2);
    subPh += (2 * Math.PI * (44 + 18 * Math.sin(k * Math.PI))) / SR;
    const subWeight = Math.sin(subPh) * 0.25;
    return (lp2 * 1.8 + subWeight) * env * gain;
  });
};

// 3. Matte Wooden / Leica Shutter Slate Click (Warm, natural, zero high-pitched beep)
const addMatteShutter = (t0, bodyHz = 240, gain = 0.34) => {
  let lp = 0;
  add(t0, 0.065, (dt, idx) => {
    const n = detNoise(idx * 7);
    lp = lp * 0.82 + n * 0.18;
    const wood =
      (Math.sin(2 * Math.PI * bodyHz * dt) * 0.7 +
        Math.sin(2 * Math.PI * (bodyHz * 1.62) * dt) * 0.3) *
      Math.exp(-85 * dt);
    const impulse = lp * Math.exp(-190 * dt) * 0.65;
    return (wood + impulse) * Math.min(1, dt / 0.002) * gain;
  });
};

// 4. Warm Felt Acoustic Chord Swell (Used ONLY 3 times in the entire 54.6s video for luxury emotional depth)
const addWarmFeltSwell = (t0, dur, notesHz, gain = 0.22) => {
  const phases = notesHz.map(() => 0);
  let lp = 0;
  add(t0, dur, (dt) => {
    const attack = Math.min(1, dt / 0.08);
    const decay = Math.exp(-2.2 * dt);
    let sum = 0;
    for (let i = 0; i < notesHz.length; i++) {
      phases[i] += (2 * Math.PI * notesHz[i]) / SR;
      sum += Math.sin(phases[i]) + 0.22 * Math.sin(phases[i] * 2) * Math.exp(-4 * dt);
    }
    sum /= notesHz.length;
    lp = lp * 0.88 + sum * 0.12;
    return lp * attack * decay * gain;
  });
};

// 5. Deep Velvet Riser into Portal/Cube (Warm low-mid swell, zero screechy high frequencies)
const addVelvetRiser = (t0, dur, startHz = 55, endHz = 165, gain = 0.32) => {
  let ph1 = 0;
  let ph2 = 0;
  let lp = 0;
  add(t0, dur, (dt, idx) => {
    const k = dt / dur;
    const env = k * k * Math.sin((1 - k) * Math.PI * 0.5 + 0.25);
    const hz = startHz + (endHz - startHz) * (k * k);
    ph1 += (2 * Math.PI * hz) / SR;
    ph2 += (2 * Math.PI * (hz * 1.498)) / SR;
    const n = detNoise(idx * 11);
    lp = lp * 0.92 + n * 0.08;
    const tone = Math.sin(ph1) * 0.7 + Math.sin(ph2) * 0.3;
    return (tone * 0.75 + lp * 0.5) * env * gain;
  });
};

// ============================================================================
// SPARSE, INTENTIONAL 14-MOMENT STUDIO FOLEY TIMELINE (0.00s – 54.60s)
// Silence between moments makes each focal transition feel genuinely cinematic!
// ============================================================================

// 1. S1 (0.73s): Moon morphs into ✳ Claude Symbol + 3D Camera Focus Push
addWarmSubPulse(0.72, 1.1, 58, 30, 0.46);
addWarmFeltSwell(0.74, 1.65, [130.81, 196.0, 246.94, 293.66], 0.24); // Warm Cmaj9 felt chord

// 2. S1 (2.13s): 60FPS 3D Motion Viewport Card blooms open
addSilkCameraAir(2.05, 0.55, 240, 0.25);
addWarmSubPulse(2.13, 0.85, 54, 29, 0.42);

// 3. S2 (7.63s): "JUST CLAUDE." 3D Hinge Flip
addWarmSubPulse(7.63, 0.85, 56, 30, 0.40);

// 4. S2 (8.83s): 3D Camera Focus Zoom + Blue Video Clapperboard Slate Snap
addSilkCameraAir(8.55, 0.45, 260, 0.22);
addMatteShutter(8.84, 260, 0.42);

// 5. S3 (11.80s – 12.20s): 3D Camera Macro Zoom into Opus 4.7 Dropdown Selection
addSilkCameraAir(11.75, 0.6, 250, 0.24);
addMatteShutter(12.20, 290, 0.30);
addWarmFeltSwell(12.22, 1.35, [146.83, 220.0, 261.63, 329.63], 0.22); // Warm Dm9 Opus lock

// 6. S3 (13.73s): "IT BUILDS THE WHOLE THING." Emerald 3D Payoff
addWarmSubPulse(13.73, 0.95, 60, 29, 0.48);

// 7. S4 (16.67s): "3D CAMERA" Perspective Orbit & Focus Pull
addSilkCameraAir(16.58, 0.75, 290, 0.28);
addWarmSubPulse(16.67, 0.85, 52, 28, 0.42);

// 8. S5 (23.07s): Royal Sapphire Portal Burst ("PURE CODE / NO LIMITS.")
addVelvetRiser(22.45, 0.62, 50, 145, 0.32);
addWarmSubPulse(23.07, 1.1, 64, 28, 0.52);

// 9. S6 (25.75s): After Effects Window Rips + (26.90s) 3D Layers Camera Push + (29.10s) [ NO THANKS. ] Stamp
addSilkCameraAir(25.72, 0.65, 220, 0.26);
addSilkCameraAir(26.86, 0.55, 260, 0.24);
addWarmSubPulse(29.10, 0.95, 68, 28, 0.52);
addMatteShutter(29.10, 195, 0.38);

// 10. S7 (30.03s, 31.17s, 32.37s): "01. IDEA -> PROMPT -> RENDER" 3 Clean Deep Pulses
addWarmSubPulse(30.03, 0.65, 54, 30, 0.40);
addWarmSubPulse(31.17, 0.65, 58, 31, 0.42);
addWarmSubPulse(32.37, 0.65, 62, 32, 0.44);

// 11. S8 (36.73s): Macro 3D Camera Push + Liquid Emerald Toggle Switch Flip
addSilkCameraAir(36.68, 0.55, 270, 0.26);
addMatteShutter(37.02, 280, 0.36);
addWarmSubPulse(37.04, 0.8, 56, 30, 0.42);

// 12. S9 (40.06s & 42.00s): Sparse 3D Spatial Fly-Through Deep Camera Air (Only 2 smooth passes, not 5 repeats!)
addSilkCameraAir(40.02, 0.7, 260, 0.25);
addWarmSubPulse(40.06, 0.75, 55, 29, 0.40);
addSilkCameraAir(42.90, 0.7, 280, 0.25);

// 13. S10 (47.60s): Node-Map Collapses into Spinning 3D Isometric Cube + Camera Orbit
addVelvetRiser(47.00, 0.60, 52, 150, 0.32);
addWarmSubPulse(47.60, 1.05, 62, 28, 0.50);

// 14. S11 (50.20s): Final CTA ("TUM AI SE KYA CREATE KAROGE?") Warm Resolution
addWarmSubPulse(50.20, 1.15, 58, 28, 0.48);
addWarmFeltSwell(50.22, 2.2, [130.81, 196.0, 246.94, 329.63], 0.25);

// Master 0.45s Clean Tail Fade + Gentle Peak Normalization (0.85 ceiling for warm headroom)
const fadeStart = Math.floor((DUR - 0.45) * SR);
let peak = 0.01;
for (let i = 0; i < N; i++) {
  if (i >= fadeStart) {
    pcm[i] *= Math.max(0, 1 - (i - fadeStart) / (N - fadeStart));
  }
  peak = Math.max(peak, Math.abs(pcm[i]));
}
const g = 0.85 / peak;
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0);
out.writeUInt32LE(36 + N * 2, 4);
out.write('WAVE', 8);
out.write('fmt ', 12);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(1, 22);
out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28);
out.writeUInt16LE(2, 32);
out.writeUInt16LE(16, 34);
out.write('data', 36);
out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) {
  const s = Math.tanh(pcm[i] * g);
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(s * 32767))), 44 + i * 2);
}
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/sfx-studio-v2.wav', out);
fs.writeFileSync('public/sfx-cinematic.wav', out);
fs.writeFileSync('public/music.wav', out);
fs.writeFileSync('out-audio.wav', out);
console.log('Sparse, warm studio foley written to public/sfx-studio-v2.wav');

