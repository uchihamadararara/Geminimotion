import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts, so rendering works offline (CI, sandbox, Termux)
const loadLocal = (family: string, file: string, weight: string, range?: string) => {
  if (typeof window === 'undefined' || !('fonts' in document)) return;
  let h: number | null = null;
  try {
    h = delayRender(`font ${file}`);
  } catch (e) {
    // delayRender may fail outside Remotion render context
  }
  try {
    const url = typeof staticFile === 'function' ? staticFile('fonts/' + file) : `/fonts/${file}`;
    const face = new FontFace(family, `url(${url}) format("woff2")`, {
      weight,
      style: 'normal',
      ...(range ? {unicodeRange: range} : {}),
    });
    face
      .load()
      .then((f) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
        if (h !== null) continueRender(h);
      })
      .catch((e) => {
        if (h !== null) continueRender(h);
      });
  } catch (e) {
    if (h !== null) continueRender(h);
  }
};
['500', '700', '900'].forEach((w) => {
  loadLocal('InterLocal', `inter-${w}.woff2`, w);
  loadLocal('InterLocal', `inter-ext-${w}.woff2`, w, 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF');
});
['500', '700'].forEach((w) => loadLocal('JBMLocal', `jbm-${w}.woff2`, w));

export const FONT = 'InterLocal, Arial, sans-serif';
export const FONT_MONO = 'JBMLocal, monospace';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const TOTAL = 1638; // 54.596s
export const BEAT = 15; // 120 BPM @ 30fps
export const SCENE = 150; // 5s = 10 beats
export const CX = 540;
export const CY = 740;

export const C = {
  bg: '#050505',
  card: '#121217',
  card2: '#1C1C24',
  line: '#2A2A35',
  ink: '#F2EEE8',
  paper: '#F2EEE8',
  mute: '#8A8A96',
  orange: '#FF3B1F', // Red-vermilion kinetic accent (#FF2D1A / #FF5B1F blend)
  orangeD: '#CC220A',
  red: '#FF2D1A',
  blue: '#3D5BFF',
  blueD: '#2C47D6',
  blueL: '#8FA2FF',
};

export const hexToRgb = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

// Convert seconds to frames at 30fps base
export const s2f = (sec: number) => Math.round(sec * FPS);

// Auto-fit hero display font size so ALL-CAPS words never overflow the 9:16 safe area (900px max width)
export const fitHero = (text: string, preferred: number, maxWidth = 900) => {
  const approxCharWidth = 0.64;
  const maxAllowed = Math.floor(maxWidth / Math.max(1, text.length * approxCharWidth));
  return Math.min(preferred, maxAllowed);
};

export const prog = (
  f: number,
  a: number,
  b: number,
  e: (t: number) => number = ease,
) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: e,
  });

// closed-form spring step response, starts at `delay`
export const sp = (f: number, delay = 0, damping = 14, stiffness = 220, mass = 0.7) =>
  spring({
    frame: Math.max(0, f - delay),
    fps: FPS,
    config: {damping, stiffness, mass},
  });

export const beatPulse = (f: number) => Math.exp(-(f % BEAT) / 4);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Major slam / impact hit frames across the 11 scenes (triggers 5-frame ±6px decaying camera shake + 1-frame 12% flash)
export const IMPACT_HITS = [
  0,   // S1: "NO WAY." frame-0 hook slam
  24,  // S1: "ANSWERS." slam
  44,  // S1: 3D Motion Player bloom
  178, // S2: "NO PLUGIN" strike
  232, // S2: "JUST CLAUDE." starburst slam
  354, // S3: Red Send [↑] button click
  366, // S3: "WHOLE THING." reveal
  454, // S4: "KINETIC TYPE." slam
  502, // S4: "3D CAMERA" tilt punch
  554, // S4: "STRETCH" elastic pull
  648, // S5: "TRANSITION" hit
  692, // S5: Red Portal burst ("PURE CODE")
  780, // S6: After Effects Window RIPS in half
  815, // S6: White Studio "LAYERS / GRAPH EDITOR" cut
  866, // S6: "[ NO THANKS. ]" red rubber stamp slam
  904, // S7: "01. IDEA." white flash slam
  938, // S7: "02. PROMPT." red flash slam
  972, // S7: "03. RENDER." dark slam
  1005,// S7: "04. DONE." 3D card stack cascade
  1102,// S8: Liquid switch snap to "100% FREE"
  1204,// S9: 3D Fly-through beat 1
  1262,// S9: 3D Fly-through beat 3
  1354,// S10: "THIS WHOLE VIDEO" node-map reveal
  1428,// S10: Node-map collapses into 3D Isometric Cube
  1510,// S11: Final CTA "COMMENT MOTION" hero slam
];

export const getImpactState = (f: number) => {
  let shakeX = 0;
  let shakeY = 0;
  let flash = 0;
  for (let i = 0; i < IMPACT_HITS.length; i++) {
    const dt = f - IMPACT_HITS[i];
    if (dt >= 0 && dt <= 6) {
      const decay = Math.pow(1 - dt / 6, 1.6);
      shakeX += Math.sin(dt * 4.2 + i) * 6.5 * decay;
      shakeY += Math.cos(dt * 5.1 + i * 2) * 5.5 * decay;
      if (dt < 1.4) {
        flash = Math.max(flash, 0.12 * (1 - dt / 1.4));
      }
    }
  }
  return {shakeX, shakeY, flash};
};

// Normalizes current frame to 30 FPS base scale so animations run at identical real-time speed at 30 or 60 FPS
export const useNormFrame = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (f * 30) / fps;
};

