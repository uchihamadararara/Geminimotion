/**
 * Pure Cinematic & AI-Tech Sound Design Foley Synthesizer (Zero Music Loop / Zero Repetitive Beats)
 * Every sound effect is custom-sculpted to match the exact visual animations across all 11 scenes (0.00s – 54.60s).
 */

import { VIDEO_CONFIG } from './scriptAndStoryboard';

export const AUDIO_SAMPLE_RATE = 44100;

function detNoise(seedIndex: number): number {
  let x = (seedIndex ^ 0x6d2b79f5) >>> 0;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 2147483648 - 1;
}

export function synthesizeProceduralTrackPCM(
  durationSeconds: number = VIDEO_CONFIG.durationSeconds
): Float32Array {
  const SR = AUDIO_SAMPLE_RATE;
  const totalSamples = Math.floor(durationSeconds * SR);
  const pcm = new Float32Array(totalSamples);

  const add = (t0: number, len: number, fn: (dt: number, idx: number) => number) => {
    const s0 = Math.max(0, Math.floor(t0 * SR));
    const count = Math.floor(len * SR);
    for (let i = 0; i < count && s0 + i < totalSamples; i++) {
      pcm[s0 + i] += fn(i / SR, s0 + i);
    }
  };

  // 1. Warm Felted Sub-Bass Cinema Pulse (Soft 18ms mallet attack, low-passed < 130Hz)
  const addWarmSubPulse = (t0: number, dur = 0.95, startHz = 62, endHz = 31, gain = 0.48) => {
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
      brown = brown * 0.96 + detNoise(idx * 3) * 0.04;
      const feltThump = brown * Math.exp(-28 * dt) * 0.35;
      return (fundamental * subEnv + feltThump) * attack * gain;
    });
  };

  // 2. Silk Low-Passed Camera Lens Air Movement (Warm Brownian air < 380Hz)
  const addSilkCameraAir = (t0: number, dur = 0.55, peakHz = 280, gain = 0.24) => {
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
  const addMatteShutter = (t0: number, bodyHz = 240, gain = 0.34) => {
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

  // 4. Warm Felt Acoustic Chord Swell (Used ONLY 3 times in 54.6s)
  const addWarmFeltSwell = (t0: number, dur: number, notesHz: number[], gain = 0.22) => {
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

  // 5. Deep Velvet Riser into Portal/Cube
  const addVelvetRiser = (t0: number, dur: number, startHz = 55, endHz = 165, gain = 0.32) => {
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

  // 14 Sparse, Intentional Studio Foley Moments
  addWarmSubPulse(0.72, 1.1, 58, 30, 0.46);
  addWarmFeltSwell(0.74, 1.65, [130.81, 196.0, 246.94, 293.66], 0.24);
  addSilkCameraAir(2.05, 0.55, 240, 0.25);
  addWarmSubPulse(2.13, 0.85, 54, 29, 0.42);

  addWarmSubPulse(7.63, 0.85, 56, 30, 0.40);
  addSilkCameraAir(8.55, 0.45, 260, 0.22);
  addMatteShutter(8.84, 260, 0.42);

  addSilkCameraAir(11.75, 0.6, 250, 0.24);
  addMatteShutter(12.20, 290, 0.30);
  addWarmFeltSwell(12.22, 1.35, [146.83, 220.0, 261.63, 329.63], 0.22);
  addWarmSubPulse(13.73, 0.95, 60, 29, 0.48);

  addSilkCameraAir(16.58, 0.75, 290, 0.28);
  addWarmSubPulse(16.67, 0.85, 52, 28, 0.42);

  addVelvetRiser(22.45, 0.62, 50, 145, 0.32);
  addWarmSubPulse(23.07, 1.1, 64, 28, 0.52);

  addSilkCameraAir(25.72, 0.65, 220, 0.26);
  addSilkCameraAir(26.86, 0.55, 260, 0.24);
  addWarmSubPulse(29.10, 0.95, 68, 28, 0.52);
  addMatteShutter(29.10, 195, 0.38);

  addWarmSubPulse(30.03, 0.65, 54, 30, 0.40);
  addWarmSubPulse(31.17, 0.65, 58, 31, 0.42);
  addWarmSubPulse(32.37, 0.65, 62, 32, 0.44);

  addSilkCameraAir(36.68, 0.55, 270, 0.26);
  addMatteShutter(37.02, 280, 0.36);
  addWarmSubPulse(37.04, 0.8, 56, 30, 0.42);

  addSilkCameraAir(40.02, 0.7, 260, 0.25);
  addWarmSubPulse(40.06, 0.75, 55, 29, 0.40);
  addSilkCameraAir(42.90, 0.7, 280, 0.25);

  addVelvetRiser(47.00, 0.60, 52, 150, 0.32);
  addWarmSubPulse(47.60, 1.05, 62, 28, 0.50);

  addWarmSubPulse(50.20, 1.15, 58, 28, 0.48);
  addWarmFeltSwell(50.22, 2.2, [130.81, 196.0, 246.94, 329.63], 0.25);

  // Master 0.45s Clean Tail Fade + Peak Normalization (0.85 ceiling)
  const fadeStartSample = Math.floor((durationSeconds - 0.45) * SR);
  let maxPeak = 0.01;
  for (let i = 0; i < totalSamples; i++) {
    if (i >= fadeStartSample) {
      const fade = Math.max(0, 1 - (i - fadeStartSample) / (totalSamples - fadeStartSample));
      pcm[i] *= fade;
    }
    const abs = Math.abs(pcm[i]);
    if (abs > maxPeak) maxPeak = abs;
  }

  const normGain = 0.85 / maxPeak;
  for (let i = 0; i < totalSamples; i++) {
    pcm[i] = Math.tanh(pcm[i] * normGain);
  }

  return pcm;
}

export function encodePCMToWavBlob(samples: Float32Array): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = AUDIO_SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, AUDIO_SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
