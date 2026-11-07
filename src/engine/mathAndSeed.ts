/**
 * Pure Functional Frame Math, Cubic-Bezier Easing, Closed-Form Spring Step Response,
 * and "One Shape, Never Cut" Sum-of-Springs Hero Morph Engine.
 *
 * Every animation value is a pure deterministic function of frame `f` (0 .. 1638).
 * Zero CSS transitions, zero timers, zero mutable state across frames.
 */

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Deterministic pseudo-random formula from guide: ((i*7 + j*13) % 17) / 17
 */
export function detRand(i: number, j = 0): number {
  return (((Math.abs(i) * 7 + Math.abs(j) * 13) % 17) + 17) % 17 / 17;
}

/**
 * Cubic-Bezier solver matching CSS / Remotion Easing.bezier(x1, y1, x2, y2)
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (t: number) => number {
  const sampleCurveX = (t: number) =>
    ((1 - 3 * x2 + 3 * x1) * t * t * t +
      (3 * x2 - 6 * x1) * t * t +
      3 * x1 * t);
  const sampleCurveY = (t: number) =>
    ((1 - 3 * y2 + 3 * y1) * t * t * t +
      (3 * y2 - 6 * y1) * t * t +
      3 * y1 * t);
  const sampleCurveDerivativeX = (t: number) =>
    3 * (1 - 3 * x2 + 3 * x1) * t * t + 2 * (3 * x2 - 6 * x1) * t + 3 * x1;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t2 = x;
    for (let i = 0; i < 8; i++) {
      const xEst = sampleCurveX(t2) - x;
      if (Math.abs(xEst) < 1e-6) break;
      const d = sampleCurveDerivativeX(t2);
      if (Math.abs(d) < 1e-6) break;
      t2 -= xEst / d;
    }
    return sampleCurveY(clamp(t2, 0, 1));
  };
}

// Guide standard easings:
// Entrance easing: bezier(0.16, 1, 0.3, 1) (fast start, soft landing)
export const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
// Move easing: bezier(0.65, 0, 0.35, 1) (smooth ease-in-out)
export const easeInOut = cubicBezier(0.65, 0, 0.35, 1);
// Linear easing
export const easeLinear = (t: number) => clamp(t, 0, 1);

/**
 * prog(f, a, b, easing) -> 0..1 clamped progress with easing
 */
export function prog(
  f: number,
  a: number,
  b: number,
  easing: (t: number) => number = easeOutExpo
): number {
  if (b <= a) return f >= b ? 1 : 0;
  const raw = clamp((f - a) / (b - a), 0, 1);
  return easing(raw);
}

/**
 * Closed-form damped harmonic oscillator step response matching Remotion's
 * `spring({ frame: Math.max(0, f - delay), fps: 30, config: { damping, stiffness, mass } })`
 *
 * With default damping=18, stiffness=140, mass=0.9:
 *   omega_0 = sqrt(140 / 0.9) = 12.472
 *   zeta = 18 / (2 * sqrt(140 * 0.9)) = 0.8018 (~1.4% subtle overshoot, never bouncy)
 */
export function sp(
  f: number,
  delay = 0,
  damping = 18,
  stiffness = 140,
  mass = 0.9,
  fps = 30
): number {
  const dtFrames = f - delay;
  if (dtFrames <= 0) return 0;
  const t = dtFrames / fps;

  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega0 * t);
    const val =
      1 -
      envelope *
        (Math.cos(omegaD * t) +
          ((zeta * omega0) / omegaD) * Math.sin(omegaD * t));
    return Math.abs(1 - val) < 0.0005 && t > 0.6 ? 1 : val;
  } else {
    const envelope = Math.exp(-omega0 * t);
    return 1 - envelope * (1 + omega0 * t);
  }
}

/**
 * beatPulse(f) = Math.exp(-(f % 15) / 4)
 * Peaks at 1.0 on every 15-frame beat (120 BPM @ 30fps) and decays smoothly.
 */
export function beatPulse(f: number): number {
  const mod = ((f % 15) + 15) % 15;
  return Math.exp(-mod / 4);
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToCss(rgb: RGB, alpha = 1): string {
  const r = clamp(Math.round(rgb.r), 0, 255);
  const g = clamp(Math.round(rgb.g), 0, 255);
  const b = clamp(Math.round(rgb.b), 0, 255);
  if (alpha >= 0.999) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
}

/**
 * Hero Keyframe specification from Section 3 ("One Shape, Never Cut")
 */
export interface HeroKeyframe {
  at: number; // Frame index (0 .. 1638)
  x: number; // Offset from stage center X (540)
  y: number; // Offset from stage center Y (810)
  w: number; // Width in px
  h: number; // Height in px
  radius: number; // Corner radius in px
  rotate: number; // Rotation in degrees
  color: string; // Hex color
}

function K(
  at: number,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  color: string,
  rotate = 0
): HeroKeyframe {
  return { at, x, y, w, h, radius, color, rotate };
}

export const SHOWREEL_COLORS = {
  bg: '#0A0A0D',
  card: '#16161C',
  card2: '#22222B',
  terminal: '#0F0F14',
  ink: '#F4F1EA',
  muted: '#8A8A96',
  orange: '#FF5B1F',
  blue: '#3D5BFF',
} as const;

/**
 * Exact 16 Hero Morph Keyframes (`KEYS`) across the 11 Scenes (1638 frames)
 */
export const HERO_KEYS: HeroKeyframe[] = [
  K(0, 0, 0, 36, 36, 18, SHOWREEL_COLORS.orange), // Frame 0: dot
  K(14, 0, -20, 860, 484, 44, SHOWREEL_COLORS.card), // Scene 1: video card
  K(150, 0, -20, 760, 760, 120, SHOWREEL_COLORS.orange), // Scene 2: FREE card
  K(300, 0, -20, 900, 720, 48, SHOWREEL_COLORS.card), // Scene 3: chat/code window
  K(450, -225, -245, 420, 420, 56, SHOWREEL_COLORS.card), // Scene 4: tile 1 of 4
  K(600, 0, -20, 920, 780, 40, SHOWREEL_COLORS.terminal), // Scene 5: terminal
  K(750, 0, -40, 940, 640, 36, SHOWREEL_COLORS.card), // Scene 6: timeline panel
  K(900, 0, 265, 780, 160, 80, SHOWREEL_COLORS.orange), // Scene 7: equation row 4
  K(1050, 0, -20, 640, 330, 165, SHOWREEL_COLORS.card2), // Scene 8: toggle track
  K(1110, 0, -20, 640, 330, 165, SHOWREEL_COLORS.orange), // Scene 8: toggle flips orange
  K(1200, 0, -20, 700, 500, 48, SHOWREEL_COLORS.blue), // Scene 9: inside dashed limit box
  K(1254, 0, 0, 960, 1140, 64, SHOWREEL_COLORS.blue), // Scene 9: breaks out of the box
  K(1350, 0, -20, 300, 300, 150, SHOWREEL_COLORS.orange), // Scene 10: circle
  K(1380, 0, -20, 300, 300, 70, SHOWREEL_COLORS.orange), // Scene 10: rounded square
  K(1405, 0, -20, 300, 300, 14, SHOWREEL_COLORS.orange), // Scene 10: square = cube front face
  K(1500, 0, 0, 36, 36, 18, SHOWREEL_COLORS.orange), // Scene 11: back to dot (loop lock)
];

export interface EvaluatedHeroState {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  rotate: number;
  rgb: RGB;
  cssColor: string;
  beatScale: number;
}

/**
 * Superposition of springs formula:
 * value(f) = key0 + Σ_i sp(f, key_i.at) * (key_i - key_{i-1})
 */
export function evaluateHeroMorph(f: number): EvaluatedHeroState {
  const k0 = HERO_KEYS[0];
  let x = k0.x;
  let y = k0.y;
  let w = k0.w;
  let h = k0.h;
  let radius = k0.radius;
  let rotate = k0.rotate;
  const rgb0 = hexToRgb(k0.color);
  let r = rgb0.r;
  let g = rgb0.g;
  let b = rgb0.b;

  for (let i = 1; i < HERO_KEYS.length; i++) {
    const prev = HERO_KEYS[i - 1];
    const curr = HERO_KEYS[i];
    if (f <= curr.at) continue;
    const sVal = sp(f, curr.at, 18, 140, 0.9);
    x += sVal * (curr.x - prev.x);
    y += sVal * (curr.y - prev.y);
    w += sVal * (curr.w - prev.w);
    h += sVal * (curr.h - prev.h);
    radius += sVal * (curr.radius - prev.radius);
    rotate += sVal * (curr.rotate - prev.rotate);

    const prevRgb = hexToRgb(prev.color);
    const currRgb = hexToRgb(curr.color);
    r += sVal * (currRgb.r - prevRgb.r);
    g += sVal * (currRgb.g - prevRgb.g);
    b += sVal * (currRgb.b - prevRgb.b);
  }

  // Guide rule: subtle beat pulse `1 + 0.012 * beatPulse(f)` ONLY when width > 100
  // so that Frame 0 and Frame 1638 (when w === 36) have beatScale === 1.0 (exact loop match).
  const pulseBlend = clamp((w - 60) / 80, 0, 1);
  const beatScale = 1 + 0.012 * beatPulse(f) * pulseBlend;

  const rgb = { r, g, b };
  return {
    x,
    y,
    w: Math.max(12, w),
    h: Math.max(12, h),
    radius: Math.max(0, radius),
    rotate,
    rgb,
    cssColor: rgbToCss(rgb),
    beatScale,
  };
}

/**
 * Phase wrapper envelope (Section 4: "Content swap: blur ke saath, overlap nahi")
 * - Starts at localFrame = `from` (default 6)
 * - Enter: 12 frames (opacity 0 -> 1, blur 10px -> 0, translateY 26px -> 0)
 * - Exit: last 10 frames (opacity 1 -> 0, blur 0 -> 10px, translateY 0 -> -20px)
 */
export interface PhaseEnvelope {
  opacity: number;
  blurPx: number;
  translateY: number;
  visible: boolean;
}

export function computePhaseEnvelope(
  localFrame: number,
  sceneDuration = 150,
  from = 6
): PhaseEnvelope {
  const enterEnd = from + 12;
  const exitStart = sceneDuration - 10;

  if (localFrame < from || localFrame >= sceneDuration) {
    return { opacity: 0, blurPx: 10, translateY: 26, visible: false };
  }

  const pIn = prog(localFrame, from, enterEnd, easeOutExpo);
  const pOut = prog(localFrame, exitStart, sceneDuration, easeInOut);

  const opacity = clamp(pIn * (1 - pOut), 0, 1);
  const blurPx = (1 - pIn) * 10 + pOut * 10;
  const translateY = (1 - pIn) * 26 - pOut * 20;

  return {
    opacity,
    blurPx,
    translateY,
    visible: opacity > 0.01,
  };
}
