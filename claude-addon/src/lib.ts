import {Easing, interpolate, spring} from 'remotion';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts, so rendering works offline (CI, sandbox, Termux)
const loadLocal = (family: string, file: string, weight: string, range?: string) => {
  const h = delayRender(`font ${file}`);
  const face = new FontFace(family, `url(${staticFile('fonts/' + file)}) format("woff2")`, {
    weight,
    style: 'normal',
    ...(range ? {unicodeRange: range} : {}),
  });
  face
    .load()
    .then((f) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
      continueRender(h);
    })
    .catch((e) => cancelRender(e));
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
  bg: '#0A0A0D',
  card: '#16161C',
  card2: '#22222B',
  line: '#2E2E39',
  ink: '#F4F1EA',
  mute: '#8C8C99',
  orange: '#FF5B1F',
  orangeD: '#E04A12',
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
export const sp = (f: number, delay = 0, damping = 18, stiffness = 140) =>
  spring({
    frame: Math.max(0, f - delay),
    fps: FPS,
    config: {damping, stiffness, mass: 0.9},
  });

export const beatPulse = (f: number) => Math.exp(-(f % BEAT) / 4);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
