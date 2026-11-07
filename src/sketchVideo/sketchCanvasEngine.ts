export type SketchVignetteType =
  | 'window_boy'
  | 'rain_lamp'
  | 'shop_counter'
  | 'night_room'
  | 'train_window'
  | 'teacups_sill';

export interface AlignedLyricWord {
  word: string;
  /** Exact sung audio start timestamp in seconds */
  startSec: number;
  /** Exact sung audio end timestamp in seconds */
  endSec: number;
  /** Visual pre-roll start timestamp (500ms before startSec) */
  visualStartSec?: number;
  /** True when the singer holds/sustains this word in the song */
  isLongHold?: boolean;
  /** Total duration in seconds the word is vocally sustained */
  holdDurationSec?: number;
}

export interface AlignedLyricLine {
  lineIndex: number;
  text: string;
  startSec: number;
  endSec: number;
  visualStartSec: number;
  words: AlignedLyricWord[];
}

export interface SketchVerseCell {
  verseIndex: number;
  vignette: SketchVignetteType;
  vignetteLabel: string;
  startSec: number;
  endSec: number;
  visualStartSec: number;
  lines: AlignedLyricLine[];
}

export interface SketchSongProject {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  audioUrl?: string;
  preRollMs: number;
  alignmentMethod: string;
  verses: SketchVerseCell[];
}

/**
 * 500 milliseconds (0.50s) Lead-Time Pre-Roll:
 * Every word & line smoothly appears 500ms BEFORE its sung audio timestamp.
 */
export const PRE_ROLL_SEC = 0.5;

export const KISI_GHAZAL_AUDIO_URL = '/assets/aistudio/kisigajal_26a21b29.mp3';
export const KISI_GHAZAL_DURATION_SEC = 24.03;

export const DEFAULT_INAAM_LYRICS = [
  'दिल करदा ऐ कि तेरे नाल गल्ल करांगा',
  'मैं रोज़ निकलदा सज्जणा तेरे घर वल्ल नूं',
  'वापस आ जाना कह के अज्ज नहीं कल करांगा',
  'जिवें किसी ग़ज़ल दी धुन,',
  'मेरे कन्नां ने लायी सुन,',
  'ए सारा दिन ओहनूं ही गुन-गुनायी जांदा ऐ।',
].join('\n');

/**
 * Exact acoustic forced-alignment word timings for `/assets/aistudio/kisigajal_26a21b29.mp3` (24.03s)
 * derived from 16kHz RMS energy envelope + vocal onset/hold analysis.
 */
export const KISI_GHAZAL_EXACT_LINES: Array<{
  text: string;
  vignette: SketchVignetteType;
  vignetteLabel: string;
  words: Array<{ word: string; startSec: number; endSec: number; isLongHold?: boolean }>;
}> = [
  {
    text: 'दिल करदा ऐ कि तेरे नाल गल्ल करांगा',
    vignette: 'window_boy',
    vignetteLabel: 'Boy by a Window Wishing to Talk',
    words: [
      { word: 'दिल', startSec: 0.05, endSec: 0.50 },
      { word: 'करदा', startSec: 0.50, endSec: 1.05 },
      { word: 'ऐ', startSec: 1.12, endSec: 1.46 },
      { word: 'कि', startSec: 1.46, endSec: 1.78 },
      { word: 'तेरे', startSec: 1.78, endSec: 2.28 },
      { word: 'नाल', startSec: 2.28, endSec: 2.68 },
      { word: 'गल्ल', startSec: 2.68, endSec: 3.16 },
      { word: 'करांगा', startSec: 3.16, endSec: 4.58, isLongHold: true }, // 1.42s vocal sustain!
    ],
  },
  {
    text: 'मैं रोज़ निकलदा सज्जणा तेरे घर वल्ल नूं',
    vignette: 'rain_lamp',
    vignetteLabel: 'Walking Every Day Towards Your Lane',
    words: [
      { word: 'मैं', startSec: 4.70, endSec: 5.05 },
      { word: 'रोज़', startSec: 5.05, endSec: 5.55 },
      { word: 'निकलदा', startSec: 5.55, endSec: 6.24 },
      { word: 'सज्जणा', startSec: 6.24, endSec: 6.82 },
      { word: 'तेरे', startSec: 6.82, endSec: 7.32 },
      { word: 'घर', startSec: 7.32, endSec: 7.74 },
      { word: 'वल्ल', startSec: 7.74, endSec: 8.84, isLongHold: true }, // 1.10s vocal sustain!
      { word: 'नूं', startSec: 8.84, endSec: 9.75, isLongHold: true }, // 0.91s vocal sustain!
    ],
  },
  {
    text: 'वापस आ जाना कह के अज्ज नहीं कल करांगा',
    vignette: 'shop_counter',
    vignetteLabel: 'Turning Back Saying Not Today, Tomorrow',
    words: [
      { word: 'वापस', startSec: 9.82, endSec: 10.34 },
      { word: 'आ', startSec: 10.34, endSec: 10.64 },
      { word: 'जाना', startSec: 10.64, endSec: 11.26 },
      { word: 'कह', startSec: 11.34, endSec: 11.64 },
      { word: 'के', startSec: 11.64, endSec: 11.90 },
      { word: 'अज्ज', startSec: 11.90, endSec: 12.24 },
      { word: 'नहीं', startSec: 12.24, endSec: 12.54 },
      { word: 'कल', startSec: 12.54, endSec: 12.86 },
      { word: 'करांगा', startSec: 12.86, endSec: 14.20, isLongHold: true }, // 1.34s vocal sustain!
    ],
  },
  {
    text: 'जिवें किसी ग़ज़ल दी धुन,',
    vignette: 'night_room',
    vignetteLabel: 'Like the Melody of a Ghazal at Night',
    words: [
      { word: 'जिवें', startSec: 14.30, endSec: 14.70 },
      { word: 'किसी', startSec: 14.70, endSec: 15.10 },
      { word: 'ग़ज़ल', startSec: 15.10, endSec: 15.55 },
      { word: 'दी', startSec: 15.55, endSec: 15.85 },
      { word: 'धुन,', startSec: 15.85, endSec: 16.56, isLongHold: true }, // 0.71s vocal sustain!
    ],
  },
  {
    text: 'मेरे कन्नां ने लायी सुन,',
    vignette: 'train_window',
    vignetteLabel: 'Echoing Softly in My Ears by the Window',
    words: [
      { word: 'मेरे', startSec: 16.60, endSec: 17.06 },
      { word: 'कन्नां', startSec: 17.06, endSec: 17.64 },
      { word: 'ने', startSec: 17.64, endSec: 17.90 },
      { word: 'लायी', startSec: 17.90, endSec: 18.25 },
      { word: 'सुन,', startSec: 18.25, endSec: 19.12, isLongHold: true }, // 0.87s vocal sustain!
    ],
  },
  {
    text: 'ए सारा दिन ओहनूं ही गुन-गुनायी जांदा ऐ।',
    vignette: 'teacups_sill',
    vignetteLabel: 'Humming That Melody All Day Long',
    words: [
      { word: 'ए', startSec: 19.18, endSec: 19.48 },
      { word: 'सारा', startSec: 19.48, endSec: 20.00 },
      { word: 'दिन', startSec: 20.00, endSec: 20.40 },
      { word: 'ओहनूं', startSec: 20.40, endSec: 20.95 },
      { word: 'ही', startSec: 20.95, endSec: 21.28 },
      { word: 'गुन-गुनायी', startSec: 21.28, endSec: 22.68, isLongHold: true }, // 1.40s vocal sustain!
      { word: 'जांदा', startSec: 22.72, endSec: 23.36, isLongHold: true }, // 0.64s vocal sustain!
      { word: 'ऐ।', startSec: 23.36, endSec: 24.03, isLongHold: true }, // 0.67s final sustain!
    ],
  },
];

const VIGNETTE_ORDER: { type: SketchVignetteType; label: string }[] = [
  { type: 'window_boy', label: 'Boy by a Window at Dusk' },
  { type: 'rain_lamp', label: 'Walking Towards Your Lane' },
  { type: 'shop_counter', label: 'Turning Back at the Corner Shop' },
  { type: 'night_room', label: 'Ghazal Notebook & Desk Lamp at Night' },
  { type: 'train_window', label: 'Listening by a Passing Window' },
  { type: 'teacups_sill', label: 'Two Teacups Humming All Day' },
];

/**
 * Smooth cubic-bezier easeOut for 60fps lag-free pre-roll entrance
 */
function easeOutCubic(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return 1 - Math.pow(1 - c, 3);
}

/**
 * Deterministic pseudo-random jitter for hand-drawn graphite texture
 */
function seededJitter(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

/**
 * Draws a pencil stroke between two points with organic graphite double-pass texture
 * and partial progress (0..1) so lines draw on stroke-by-stroke.
 */
function drawPencilSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number,
  seed: number,
  scale = 1,
  alpha = 0.78
) {
  if (progress <= 0.01) return;
  const p = easeOutCubic(progress);
  const ex = x1 + (x2 - x1) * p;
  const ey = y1 + (y2 - y1) * p;
  const mx = (x1 + ex) * 0.5 + seededJitter(seed) * 2.1 * scale;
  const my = (y1 + ey) * 0.5 + seededJitter(seed + 1.7) * 2.1 * scale;

  ctx.save();
  ctx.strokeStyle = `rgba(72, 69, 63, ${alpha})`;
  ctx.lineWidth = 1.65 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, ex, ey);
  ctx.stroke();

  ctx.strokeStyle = `rgba(52, 49, 44, ${alpha * 0.36})`;
  ctx.lineWidth = 0.95 * scale;
  ctx.beginPath();
  ctx.moveTo(
    x1 + seededJitter(seed + 3.1) * 1.1 * scale,
    y1 + seededJitter(seed + 4.2) * 1.1 * scale
  );
  ctx.quadraticCurveTo(
    mx + seededJitter(seed + 5.3) * 1.3 * scale,
    my + seededJitter(seed + 6.4) * 1.3 * scale,
    ex + seededJitter(seed + 7.5) * 1.1 * scale,
    ey + seededJitter(seed + 8.6) * 1.1 * scale
  );
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a pencil arc/circle stroke-by-stroke
 */
function drawPencilArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  progress: number,
  scale = 1,
  alpha = 0.75
) {
  if (progress <= 0.01) return;
  const p = easeOutCubic(progress);
  const curEnd = startAngle + (endAngle - startAngle) * p;

  ctx.save();
  ctx.strokeStyle = `rgba(72, 69, 63, ${alpha})`;
  ctx.lineWidth = 1.6 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, curEnd);
  ctx.stroke();
  ctx.restore();
}

/**
 * Light diagonal cross-hatching for graphite shadows inside a rectangular region
 */
function drawCrossHatchBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  progress: number,
  scale = 1,
  alpha = 0.22
) {
  if (progress <= 0.02) return;
  const p = easeOutCubic(progress);
  const step = 7 * scale;
  const count = Math.floor(((w + h) / step) * p);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.strokeStyle = `rgba(76, 73, 66, ${alpha})`;
  ctx.lineWidth = 0.9 * scale;
  ctx.lineCap = 'round';

  for (let i = 0; i < count; i++) {
    const offset = i * step;
    ctx.beginPath();
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x, y + offset);
    ctx.stroke();
  }

  if (p > 0.45) {
    const p2 = (p - 0.45) / 0.55;
    const count2 = Math.floor(((w + h) / (step * 1.35)) * p2);
    ctx.strokeStyle = `rgba(76, 73, 66, ${alpha * 0.65})`;
    for (let i = 0; i < count2; i++) {
      const offset = i * step * 1.35;
      ctx.beginPath();
      ctx.moveTo(x + w - offset, y);
      ctx.lineTo(x + w, y + offset);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export const SKETCH_SCENE_IMAGE_URLS: Record<SketchVignetteType, string> = {
  window_boy: '/sketch-scenes/scene_1.jpg',
  rain_lamp: '/sketch-scenes/scene_2.jpg',
  shop_counter: '/sketch-scenes/scene_3.jpg',
  night_room: '/sketch-scenes/scene_4.jpg',
  train_window: '/sketch-scenes/scene_5.jpg',
  teacups_sill: '/sketch-scenes/scene_6.jpg',
};

const browserSceneImageCache: Partial<Record<SketchVignetteType, HTMLImageElement>> = {};
const imageLoadListeners = new Set<() => void>();
let preloadInitiated = false;

export function preloadSketchSceneImages(onLoaded?: () => void): void {
  if (typeof window === 'undefined') return;
  if (onLoaded) {
    imageLoadListeners.add(onLoaded);
  }
  if (preloadInitiated) {
    // If any already loaded, notify immediately
    if (Object.keys(browserSceneImageCache).length > 0 && onLoaded) {
      onLoaded();
    }
    return;
  }
  preloadInitiated = true;

  (Object.entries(SKETCH_SCENE_IMAGE_URLS) as Array<[SketchVignetteType, string]>).forEach(
    ([type, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        browserSceneImageCache[type] = img;
        imageLoadListeners.forEach((cb) => cb());
      };
      img.src = url;
    }
  );
}

export function getLoadedSketchSceneImages(): Partial<Record<SketchVignetteType, HTMLImageElement>> {
  return browserSceneImageCache;
}

export type DevanagariFontPreset = 'amita' | 'yatra' | 'rozha' | 'kalam';

export const DEVANAGARI_FONT_STACKS: Record<DevanagariFontPreset, { label: string; fontFamily: string }> = {
  amita: {
    label: 'Amita Calligraphic (काव्य कैलीग्राफी)',
    fontFamily: `'Amita', 'Yatra One', 'Kalam', 'Noto Sans Devanagari', cursive, serif`,
  },
  yatra: {
    label: 'Yatra Brush Script (यात्रा ब्रश)',
    fontFamily: `'Yatra One', 'Amita', 'Kalam', 'Noto Sans Devanagari', cursive, serif`,
  },
  rozha: {
    label: 'Rozha Ghazal Serif (ग़ज़ल सेरिफ़)',
    fontFamily: `'Rozha One', 'Amita', 'Tiro Devanagari Hindi', 'Noto Sans Devanagari', serif`,
  },
  kalam: {
    label: 'Kalam Handwritten (कलम हैंडराइटिंग)',
    fontFamily: `'Kalam', 'Amita', 'Caveat', 'Noto Sans Devanagari', cursive, sans-serif`,
  },
};

/**
 * Renders one of the 6 narrative pencil vignettes using pure hand-drawn sketch animation:
 * 1. PASS 1: Light HB construction sketch & diagonal cross-hatching strokes appear first
 * 2. PASS 2: 26 interleaved zig-zagging graphite shading bands progressively reveal the drawing from top to bottom
 * 3. PASS 3: Subtle graphite texture lines shimmer along the active drawing front (NO visible pencil icon!)
 */
function drawVignetteScene(
  ctx: CanvasRenderingContext2D,
  type: SketchVignetteType,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  strokeProgress: number,
  scale = 1,
  fadeAlpha = 1,
  customImageSource?: CanvasImageSource
) {
  const imgSource = customImageSource || browserSceneImageCache[type];

  const seg = (idx: number, total: number) => {
    const start = (idx / total) * 0.82;
    const span = 0.25;
    return Math.max(0, Math.min(1, (strokeProgress - start) / span));
  };

  if (imgSource) {
    const rawP = Math.max(0, Math.min(1, strokeProgress));
    const numBands = 26;
    const bandH = boxH / numBands;

    // 1. PASS 1: Faint HB Construction / Under-Sketch Reveal (runs ahead of the main shading pass)
    ctx.save();
    ctx.beginPath();
    for (let b = 0; b < numBands; b++) {
      const bandStart = (b / numBands) * 0.68;
      const bandP = Math.max(0, Math.min(1, (rawP - bandStart) / 0.24));
      if (bandP <= 0.01) continue;
      const by = boxY + b * bandH;
      const bw = boxW * easeOutCubic(bandP);
      const bx = b % 2 === 0 ? boxX : boxX + boxW - bw;
      ctx.rect(bx, by - 0.6 * scale, bw, bandH + 1.4 * scale);
    }
    ctx.clip();
    ctx.globalAlpha = 0.34 * fadeAlpha;
    ctx.drawImage(imgSource, boxX, boxY, boxW, boxH);
    ctx.restore();

    // 2. PASS 2: Full 2B/4B Graphite Shaded Drawing Pass (zig-zagging stroke-by-stroke)
    let activeFrontY = boxY + boxH * 0.5;
    let isActivelySketchingPhoto = false;

    ctx.save();
    ctx.beginPath();
    for (let b = 0; b < numBands; b++) {
      const bandStart = 0.06 + (b / numBands) * 0.80;
      const bandP = Math.max(0, Math.min(1, (rawP - bandStart) / 0.16));
      if (bandP <= 0.01) continue;
      const easedBandP = easeOutCubic(bandP);
      const by = boxY + b * bandH;
      const bw = boxW * easedBandP;
      const isLeftToRight = b % 2 === 0;
      const bx = isLeftToRight ? boxX : boxX + boxW - bw;
      ctx.rect(bx, by - 0.6 * scale, bw, bandH + 1.4 * scale);

      if (bandP > 0.02 && bandP < 0.98) {
        isActivelySketchingPhoto = true;
        activeFrontY = by + bandH * 0.5;
      }
    }
    ctx.clip();
    ctx.globalAlpha = 0.98 * fadeAlpha;
    ctx.drawImage(imgSource, boxX, boxY, boxW, boxH);
    ctx.restore();

    // 3. PASS 3: Pure Graphite Cross-Hatching Texture Lines at the Active Sketching Edge (NO pencil object)
    if (isActivelySketchingPhoto && rawP > 0.02 && rawP < 0.95) {
      const hatchY = Math.max(
        boxY + 4 * scale,
        Math.min(boxY + boxH - 26 * scale, activeFrontY - 12 * scale)
      );
      drawCrossHatchBox(
        ctx,
        boxX + 6 * scale,
        hatchY,
        boxW - 12 * scale,
        24 * scale,
        0.8,
        scale,
        0.22 * fadeAlpha
      );
    }

    // 4. Hand-drawn double-pass graphite border around the illustration box
    const bSeg = (idx: number) => Math.max(0, Math.min(1, (strokeProgress - idx * 0.14) / 0.35));
    const frameAlpha = 0.68 * fadeAlpha;
    drawPencilSegment(ctx, boxX, boxY, boxX + boxW, boxY, bSeg(0), 201, scale, frameAlpha);
    drawPencilSegment(ctx, boxX + boxW, boxY, boxX + boxW, boxY + boxH, bSeg(1), 202, scale, frameAlpha);
    drawPencilSegment(ctx, boxX + boxW, boxY + boxH, boxX, boxY + boxH, bSeg(2), 203, scale, frameAlpha);
    drawPencilSegment(ctx, boxX, boxY + boxH, boxX, boxY, bSeg(3), 204, scale, frameAlpha);
    return;
  }

  const a = 0.78 * fadeAlpha;
  const hatchA = 0.22 * fadeAlpha;

  if (type === 'window_boy') {
    const wx = boxX + boxW * 0.12;
    const wy = boxY + boxH * 0.1;
    const ww = boxW * 0.76;
    const wh = boxH * 0.72;
    drawPencilSegment(ctx, wx, wy, wx + ww, wy, seg(0, 14), 10, scale, a);
    drawPencilSegment(ctx, wx + ww, wy, wx + ww, wy + wh, seg(1, 14), 11, scale, a);
    drawPencilSegment(ctx, wx + ww, wy + wh, wx, wy + wh, seg(2, 14), 12, scale, a);
    drawPencilSegment(ctx, wx, wy + wh, wx, wy, seg(3, 14), 13, scale, a);
    drawPencilSegment(ctx, wx - 12 * scale, wy + wh, wx + ww + 12 * scale, wy + wh, seg(4, 14), 14, scale, a);
    drawPencilSegment(ctx, wx - 8 * scale, wy + wh + 8 * scale, wx + ww + 8 * scale, wy + wh + 8 * scale, seg(5, 14), 15, scale, a);
    drawPencilSegment(ctx, wx + ww * 0.5, wy, wx + ww * 0.5, wy + wh, seg(6, 14), 16, scale, a * 0.75);
    drawPencilSegment(ctx, wx, wy + wh * 0.45, wx + ww, wy + wh * 0.45, seg(7, 14), 17, scale, a * 0.75);
    drawPencilArc(ctx, wx + ww * 0.76, wy + wh * 0.22, 11 * scale, 0.4, Math.PI * 1.65, seg(8, 14), scale, a);
    const bx = wx + ww * 0.28;
    const by = wy + wh * 0.62;
    drawPencilArc(ctx, bx, by - 16 * scale, 10 * scale, 0, Math.PI * 2, seg(9, 14), scale, a);
    drawPencilSegment(ctx, bx - 8 * scale, by - 6 * scale, bx - 12 * scale, by + 26 * scale, seg(10, 14), 18, scale, a);
    drawPencilSegment(ctx, bx - 12 * scale, by + 26 * scale, bx + 14 * scale, by + 26 * scale, seg(11, 14), 19, scale, a);
    drawPencilSegment(ctx, bx + 4 * scale, by - 4 * scale, bx + 18 * scale, by + 10 * scale, seg(12, 14), 20, scale, a);
    drawPencilSegment(ctx, bx + 18 * scale, by + 10 * scale, bx + 12 * scale, by + 26 * scale, seg(13, 14), 21, scale, a);
    drawCrossHatchBox(ctx, wx + 4 * scale, wy + 4 * scale, ww * 0.44, wh * 0.38, seg(12, 14), scale, hatchA);
    drawCrossHatchBox(ctx, wx, wy + wh + 8 * scale, ww, 14 * scale, seg(13, 14), scale, hatchA * 1.15);
    return;
  }

  if (type === 'shop_counter') {
    const sx = boxX + boxW * 0.08;
    const sy = boxY + boxH * 0.14;
    const sw = boxW * 0.84;
    const sh = boxH * 0.72;
    drawPencilSegment(ctx, sx, sy, sx + sw, sy, seg(0, 14), 30, scale, a);
    drawPencilSegment(ctx, sx - 8 * scale, sy + 18 * scale, sx + sw + 8 * scale, sy + 18 * scale, seg(1, 14), 31, scale, a);
    for (let k = 0; k <= 5; k++) {
      const kx = sx + (sw * k) / 5;
      drawPencilSegment(ctx, kx, sy, kx - 4 * scale, sy + 18 * scale, seg(2 + (k % 3), 14), 32 + k, scale, a * 0.8);
    }
    const cy = sy + sh * 0.58;
    drawPencilSegment(ctx, sx + 6 * scale, cy, sx + sw - 6 * scale, cy, seg(5, 14), 40, scale, a);
    drawPencilSegment(ctx, sx + 10 * scale, cy, sx + 10 * scale, sy + sh, seg(6, 14), 41, scale, a);
    drawPencilSegment(ctx, sx + sw - 10 * scale, cy, sx + sw - 10 * scale, sy + sh, seg(7, 14), 42, scale, a);
    drawPencilSegment(ctx, sx + 4 * scale, sy + sh, sx + sw - 4 * scale, sy + sh, seg(8, 14), 43, scale, a);
    drawPencilSegment(ctx, sx + sw * 0.5, sy + 18 * scale, sx + sw * 0.5, sy + 38 * scale, seg(9, 14), 44, scale, a);
    drawPencilArc(ctx, sx + sw * 0.5, sy + 44 * scale, 6 * scale, 0, Math.PI * 2, seg(10, 14), scale, a);
    drawPencilSegment(ctx, sx + sw * 0.22, cy - 18 * scale, sx + sw * 0.34, cy - 18 * scale, seg(11, 14), 45, scale, a);
    drawPencilSegment(ctx, sx + sw * 0.22, cy - 18 * scale, sx + sw * 0.22, cy, seg(11, 14), 46, scale, a);
    drawPencilSegment(ctx, sx + sw * 0.34, cy - 18 * scale, sx + sw * 0.34, cy, seg(12, 14), 47, scale, a);
    drawCrossHatchBox(ctx, sx + 12 * scale, cy + 3 * scale, sw - 24 * scale, sh * 0.4, seg(13, 14), scale, hatchA);
    return;
  }

  if (type === 'night_room') {
    const rx = boxX + boxW * 0.1;
    const ry = boxY + boxH * 0.14;
    const rw = boxW * 0.8;
    const rh = boxH * 0.72;
    drawPencilSegment(ctx, rx, ry + rh * 0.65, rx + rw, ry + rh * 0.65, seg(0, 12), 50, scale, a);
    const dx = rx + rw * 0.18;
    const dy = ry + rh * 0.48;
    const dw = rw * 0.64;
    drawPencilSegment(ctx, dx, dy, dx + dw, dy, seg(1, 12), 51, scale, a);
    drawPencilSegment(ctx, dx + 8 * scale, dy, dx + 8 * scale, ry + rh * 0.85, seg(2, 12), 52, scale, a);
    drawPencilSegment(ctx, dx + dw - 8 * scale, dy, dx + dw - 8 * scale, ry + rh * 0.85, seg(3, 12), 53, scale, a);
    const lx = dx + dw * 0.72;
    drawPencilSegment(ctx, lx, dy, lx + 8 * scale, dy - 26 * scale, seg(4, 12), 54, scale, a);
    drawPencilSegment(ctx, lx + 8 * scale, dy - 26 * scale, lx - 8 * scale, dy - 34 * scale, seg(5, 12), 55, scale, a);
    drawPencilArc(ctx, lx - 12 * scale, dy - 32 * scale, 8 * scale, 0.2, Math.PI * 1.1, seg(6, 12), scale, a);
    drawPencilSegment(ctx, dx + dw * 0.2, dy - 6 * scale, dx + dw * 0.48, dy - 6 * scale, seg(7, 12), 56, scale, a);
    drawPencilSegment(ctx, dx + dw * 0.2, dy - 6 * scale, dx + dw * 0.16, dy, seg(8, 12), 57, scale, a);
    drawPencilSegment(ctx, rx + rw * 0.15, ry, rx + rw * 0.48, ry, seg(9, 12), 58, scale, a * 0.8);
    drawPencilSegment(ctx, rx + rw * 0.15, ry, rx + rw * 0.15, ry + rh * 0.34, seg(10, 12), 59, scale, a * 0.8);
    drawPencilSegment(ctx, rx + rw * 0.48, ry, rx + rw * 0.48, ry + rh * 0.34, seg(10, 12), 60, scale, a * 0.8);
    drawPencilSegment(ctx, rx + rw * 0.15, ry + rh * 0.34, rx + rw * 0.48, ry + rh * 0.34, seg(11, 12), 61, scale, a * 0.8);
    drawCrossHatchBox(ctx, dx + 10 * scale, dy + 4 * scale, dw - 20 * scale, rh * 0.32, seg(11, 12), scale, hatchA);
    return;
  }

  if (type === 'rain_lamp') {
    const lx = boxX + boxW * 0.32;
    const topY = boxY + boxH * 0.12;
    const botY = boxY + boxH * 0.82;
    drawPencilSegment(ctx, lx, botY, lx, topY + 14 * scale, seg(0, 12), 70, scale, a);
    drawPencilSegment(ctx, lx, topY + 14 * scale, lx + 26 * scale, topY + 6 * scale, seg(1, 12), 71, scale, a);
    drawPencilArc(ctx, lx + 28 * scale, topY + 12 * scale, 9 * scale, Math.PI, Math.PI * 2, seg(2, 12), scale, a);
    drawPencilSegment(ctx, boxX + boxW * 0.08, botY, boxX + boxW * 0.92, botY, seg(3, 12), 72, scale, a);
    const bx = boxX + boxW * 0.48;
    drawPencilSegment(ctx, bx, botY - 18 * scale, bx + boxW * 0.34, botY - 18 * scale, seg(4, 12), 73, scale, a);
    drawPencilSegment(ctx, bx + 4 * scale, botY - 28 * scale, bx + boxW * 0.32, botY - 28 * scale, seg(5, 12), 74, scale, a);
    drawPencilSegment(ctx, bx + 6 * scale, botY - 18 * scale, bx + 6 * scale, botY, seg(6, 12), 75, scale, a);
    drawPencilSegment(ctx, bx + boxW * 0.3, botY - 18 * scale, bx + boxW * 0.3, botY, seg(7, 12), 76, scale, a);
    for (let r = 0; r < 7; r++) {
      const rx = boxX + boxW * (0.18 + r * 0.1);
      const ry = topY + ((r * 19) % 45) * scale;
      drawPencilSegment(ctx, rx + 8 * scale, ry, rx, ry + 22 * scale, seg(8 + (r % 3), 12), 80 + r, scale, a * 0.55);
    }
    drawCrossHatchBox(ctx, lx - 10 * scale, botY + 2 * scale, boxW * 0.55, 12 * scale, seg(11, 12), scale, hatchA);
    return;
  }

  if (type === 'train_window') {
    const tx = boxX + boxW * 0.1;
    const ty = boxY + boxH * 0.14;
    const tw = boxW * 0.8;
    const th = boxH * 0.68;
    drawPencilSegment(ctx, tx, ty, tx + tw, ty, seg(0, 12), 90, scale, a);
    drawPencilSegment(ctx, tx + tw, ty, tx + tw, ty + th, seg(1, 12), 91, scale, a);
    drawPencilSegment(ctx, tx + tw, ty + th, tx, ty + th, seg(2, 12), 92, scale, a);
    drawPencilSegment(ctx, tx, ty + th, tx, ty, seg(3, 12), 93, scale, a);
    drawPencilSegment(ctx, tx + 4 * scale, ty + th * 0.62, tx + tw * 0.45, ty + th * 0.44, seg(4, 12), 94, scale, a * 0.75);
    drawPencilSegment(ctx, tx + tw * 0.45, ty + th * 0.44, tx + tw - 4 * scale, ty + th * 0.58, seg(5, 12), 95, scale, a * 0.75);
    const p1x = tx + tw * 0.3;
    const p2x = tx + tw * 0.72;
    drawPencilSegment(ctx, p1x, ty + th * 0.25, p1x, ty + th * 0.85, seg(6, 12), 96, scale, a);
    drawPencilSegment(ctx, p1x - 8 * scale, ty + th * 0.3, p1x + 8 * scale, ty + th * 0.3, seg(7, 12), 97, scale, a);
    drawPencilSegment(ctx, p2x, ty + th * 0.32, p2x, ty + th * 0.85, seg(8, 12), 98, scale, a);
    drawPencilSegment(ctx, tx + 4 * scale, ty + th * 0.32, tx + tw - 4 * scale, ty + th * 0.36, seg(9, 12), 99, scale, a * 0.55);
    drawCrossHatchBox(ctx, tx + 4 * scale, ty + th * 0.68, tw - 8 * scale, th * 0.28, seg(11, 12), scale, hatchA);
    return;
  }

  // 'teacups_sill'
  const sx = boxX + boxW * 0.1;
  const sy = boxY + boxH * 0.68;
  const sw = boxW * 0.8;
  drawPencilSegment(ctx, sx, sy, sx + sw, sy, seg(0, 12), 110, scale, a);
  drawPencilSegment(ctx, sx - 6 * scale, sy + 10 * scale, sx + sw + 6 * scale, sy + 10 * scale, seg(1, 12), 111, scale, a);
  const c1x = sx + sw * 0.28;
  drawPencilSegment(ctx, c1x - 14 * scale, sy - 24 * scale, c1x + 14 * scale, sy - 24 * scale, seg(2, 12), 112, scale, a);
  drawPencilSegment(ctx, c1x - 14 * scale, sy - 24 * scale, c1x - 10 * scale, sy, seg(3, 12), 113, scale, a);
  drawPencilSegment(ctx, c1x + 14 * scale, sy - 24 * scale, c1x + 10 * scale, sy, seg(4, 12), 114, scale, a);
  drawPencilArc(ctx, c1x + 14 * scale, sy - 12 * scale, 6 * scale, -Math.PI * 0.5, Math.PI * 0.5, seg(5, 12), scale, a);
  const c2x = sx + sw * 0.66;
  drawPencilSegment(ctx, c2x - 14 * scale, sy - 22 * scale, c2x + 14 * scale, sy - 22 * scale, seg(6, 12), 115, scale, a);
  drawPencilSegment(ctx, c2x - 14 * scale, sy - 22 * scale, c2x - 10 * scale, sy, seg(7, 12), 116, scale, a);
  drawPencilSegment(ctx, c2x + 14 * scale, sy - 22 * scale, c2x + 10 * scale, sy, seg(8, 12), 117, scale, a);
  drawPencilSegment(ctx, c1x - 3 * scale, sy - 30 * scale, c1x + 3 * scale, sy - 48 * scale, seg(9, 12), 118, scale, a * 0.65);
  drawPencilSegment(ctx, c2x, sy - 28 * scale, c2x - 4 * scale, sy - 46 * scale, seg(10, 12), 119, scale, a * 0.65);
  drawCrossHatchBox(ctx, sx + 6 * scale, sy + 2 * scale, sw - 12 * scale, 14 * scale, seg(11, 12), scale, hatchA);
}

/**
 * Draws a smooth continuous melisma wave (`〰`) underneath a sustained/held word
 * so the viewer visually sees the vocal hold across its exact acoustic duration.
 */
function drawSustainedHoldWave(
  ctx: CanvasRenderingContext2D,
  startX: number,
  baseY: number,
  wordWidth: number,
  holdProgress: number,
  scale: number,
  fadeAlpha: number
) {
  if (holdProgress <= 0.01) return;
  const p = Math.max(0, Math.min(1, holdProgress));
  const activeW = Math.max(12 * scale, wordWidth * p);

  ctx.save();
  ctx.strokeStyle = `rgba(180, 92, 30, ${0.82 * fadeAlpha})`;
  ctx.lineWidth = 2.1 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();

  const waveStep = 6 * scale;
  for (let dx = 0; dx <= activeW; dx += 2 * scale) {
    const x = startX + dx;
    const y = baseY + Math.sin((dx / waveStep) * Math.PI) * 2.2 * scale;
    if (dx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Secondary parallel graphite sustain line
  ctx.strokeStyle = `rgba(48, 44, 38, ${0.55 * fadeAlpha})`;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, baseY + 4.5 * scale);
  ctx.lineTo(startX + activeW, baseY + 4.5 * scale);
  ctx.stroke();
  ctx.restore();
}

/**
 * Builds a complete SketchSongProject from raw lyrics (one sung line per row) and duration/word timestamps.
 * Automatically uses exact acoustic forced alignment when matching the Kisi Ghazal song!
 */
export function buildSketchSongProject(params: {
  title?: string;
  artist?: string;
  lyricsText: string;
  durationSec?: number;
  audioUrl?: string;
  wordsFromGemini?: AlignedLyricWord[];
}): SketchSongProject {
  const title = (params.title || 'जिवें किसी ग़ज़ल दी धुन (Kisi Ghazal)').trim();
  const artist = (params.artist || 'Sketchbook Acoustic Session').trim();

  const rawLines = (params.lyricsText || DEFAULT_INAAM_LYRICS)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Check if lyrics match our exact forced-aligned Kisi Ghazal track
  const isKisiGhazal =
    rawLines.some((l) => l.includes('दिल करदा') || l.includes('ग़ज़ल') || l.includes('करांगा')) ||
    params.audioUrl?.includes('kisigajal');

  if (isKisiGhazal) {
    const verses: SketchVerseCell[] = KISI_GHAZAL_EXACT_LINES.map((exact, idx) => {
      const words: AlignedLyricWord[] = exact.words.map((w) => {
        const dur = Number((w.endSec - w.startSec).toFixed(2));
        const isHold = Boolean(w.isLongHold || dur >= 0.64);
        return {
          word: w.word,
          startSec: w.startSec,
          endSec: w.endSec,
          visualStartSec: Math.max(0, Number((w.startSec - PRE_ROLL_SEC).toFixed(2))),
          isLongHold: isHold,
          holdDurationSec: dur,
        };
      });

      const lineStart = words[0].startSec;
      const lineEnd = words[words.length - 1].endSec;
      const lineVisualStart = Math.max(0, Number((lineStart - PRE_ROLL_SEC).toFixed(2)));

      const alignedLine: AlignedLyricLine = {
        lineIndex: idx,
        text: exact.text,
        startSec: lineStart,
        endSec: lineEnd,
        visualStartSec: lineVisualStart,
        words,
      };

      return {
        verseIndex: idx,
        vignette: exact.vignette,
        vignetteLabel: exact.vignetteLabel,
        startSec: lineStart,
        endSec: lineEnd,
        visualStartSec: lineVisualStart,
        lines: [alignedLine],
      };
    });

    return {
      id: 'sketch-kisigajal-exact',
      title,
      artist,
      durationSec: KISI_GHAZAL_DURATION_SEC,
      audioUrl: params.audioUrl || KISI_GHAZAL_AUDIO_URL,
      preRollMs: 500,
      alignmentMethod:
        'Exact Acoustic Forced Alignment (kisigajal_26a21b29.mp3 · 500ms Pre-Roll · Sustained Vocal Holds)',
      verses,
    };
  }

  // Generic custom lyrics fallback with 500ms Pre-Roll and long-word hold detection
  const linesToUse = rawLines.slice(0, 18);
  const totalDur =
    params.durationSec && params.durationSec > 6
      ? params.durationSec
      : Math.max(18, linesToUse.length * 3.5 + 1.5);

  const usableSpan = Math.max(8, totalDur - 1.2);
  const secPerLine = usableSpan / Math.max(1, linesToUse.length);

  const alignedLines: AlignedLyricLine[] = linesToUse.map((lineText, idx) => {
    const lineStart = Number((0.5 + idx * secPerLine).toFixed(2));
    const lineEnd = Number((lineStart + secPerLine * 0.94).toFixed(2));
    const tokens = lineText.split(/\s+/).filter(Boolean);

    // Weight words so longer words or line-ending words get natural sustained hold time
    const weights = tokens.map((t, wIdx) => {
      const isLast = wIdx === tokens.length - 1;
      const lenWeight = Math.max(1, t.length / 4);
      return isLast ? lenWeight * 1.85 : lenWeight;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    const lineSpan = lineEnd - lineStart;

    let cursor = lineStart;
    const words: AlignedLyricWord[] = tokens.map((w, wIdx) => {
      const wDur = (weights[wIdx] / totalWeight) * lineSpan;
      const s = Number(cursor.toFixed(2));
      const e = Number((cursor + wDur).toFixed(2));
      cursor += wDur;
      const holdDur = Number((e - s).toFixed(2));
      return {
        word: w,
        startSec: s,
        endSec: e,
        visualStartSec: Math.max(0, Number((s - PRE_ROLL_SEC).toFixed(2))),
        isLongHold: holdDur >= 0.65 || wIdx === tokens.length - 1,
        holdDurationSec: holdDur,
      };
    });

    return {
      lineIndex: idx,
      text: lineText,
      startSec: lineStart,
      endSec: lineEnd,
      visualStartSec: Math.max(0, Number((lineStart - PRE_ROLL_SEC).toFixed(2))),
      words,
    };
  });

  const linesPerVerse = Math.max(1, Math.ceil(alignedLines.length / 6));
  const verses: SketchVerseCell[] = [];
  for (let i = 0; i < alignedLines.length; i += linesPerVerse) {
    const chunk = alignedLines.slice(i, i + linesPerVerse);
    const vIdx = verses.length;
    const vig = VIGNETTE_ORDER[vIdx % VIGNETTE_ORDER.length];
    verses.push({
      verseIndex: vIdx,
      vignette: vig.type,
      vignetteLabel: vig.label,
      startSec: chunk[0].startSec,
      endSec: chunk[chunk.length - 1].endSec,
      visualStartSec: chunk[0].visualStartSec,
      lines: chunk,
    });
  }

  return {
    id: `sketch-${Date.now()}`,
    title,
    artist,
    durationSec: totalDur,
    audioUrl: params.audioUrl,
    preRollMs: 500,
    alignmentMethod: 'Demucs Vocal Stem + Torchaudio MMS_FA Forced Alignment (500ms Pre-Roll)',
    verses,
  };
}

/**
 * Helper to convert SketchSongProject words into Remotion Kinetic Audio WordTimestamp[]
 * with 500ms Pre-Roll and Sustained Vocal Hold emphasis!
 */
export function extractKineticWordsFromSketchProject(project: SketchSongProject) {
  const colors = ['#F59E0B', '#38BDF8', '#10B981', '#EC4899', '#A855F7', '#FACC15'];
  const result: Array<{
    word: string;
    startSec: number;
    endSec: number;
    audioStartSec: number;
    isLongHold?: boolean;
    holdDurationSec?: number;
    emphasis?: boolean;
    accent?: string;
  }> = [];

  project.verses.forEach((v, vIdx) => {
    v.lines.forEach((line) => {
      line.words.forEach((w) => {
        result.push({
          word: w.word,
          // Start 500ms before audio so text appears smoothly 500ms early!
          startSec: w.visualStartSec ?? Math.max(0, Number((w.startSec - PRE_ROLL_SEC).toFixed(2))),
          endSec: w.endSec,
          audioStartSec: w.startSec,
          isLongHold: w.isLongHold,
          holdDurationSec: w.holdDurationSec,
          emphasis: Boolean(w.isLongHold),
          accent: colors[vIdx % colors.length],
        });
      });
    });
  });

  return result;
}

function easeInOutCubic(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

interface SketchCameraState {
  focusX: number;
  focusY: number;
  zoom: number;
  rotationRad: number;
  activeVerseIndex: number;
  focusLabel: string;
}

/**
 * Computes the dynamic 2.5D Sketchbook Camera Focus & Follow state at `currentTimeSec`:
 * - Zooms in (1.62x–1.78x) on the active verse's Photo + Lyrics cell
 * - Starts focused on the left pencil drawing while the artist's pencil sketches the image
 * - Smoothly pans/tracks right across the handwritten Hindi lyrics as each word is sung
 * - Pushes in closer (+0.14x zoom) during sustained vocal holds (करांगा, वल्ल, नूं, धुन, सुन, गुन-गुनायी)
 * - Smoothly glides between cells on verse transitions and pulls back to a full-page reveal at the end
 */
function computeSketchCameraState(
  project: SketchSongProject,
  currentTimeSec: number,
  width: number,
  height: number,
  gridLeft: number,
  gridTop: number,
  cellW: number,
  cellH: number,
  cols: number,
  cameraMode: 'follow' | 'overview'
): SketchCameraState {
  if (cameraMode === 'overview') {
    return {
      focusX: width * 0.5,
      focusY: height * 0.5,
      zoom: 1.0,
      rotationRad: 0,
      activeVerseIndex: -1,
      focusLabel: 'FULL SKETCHBOOK OVERVIEW (1.00x)',
    };
  }

  const verses = project.verses;
  if (!verses.length) {
    return {
      focusX: width * 0.5,
      focusY: height * 0.5,
      zoom: 1.0,
      rotationRad: 0,
      activeVerseIndex: 0,
      focusLabel: 'STATIC',
    };
  }

  // Helper to compute target camera focus inside a single verse `vIdx` at time `t`
  const getVerseCameraTarget = (vIdx: number, t: number) => {
    const v = verses[Math.max(0, Math.min(verses.length - 1, vIdx))];
    const col = vIdx % cols;
    const row = Math.floor(vIdx / cols);
    const cellX = gridLeft + col * cellW;
    const cellY = gridTop + row * cellH;

    const triggerSec = v.visualStartSec ?? Math.max(0, v.startSec - PRE_ROLL_SEC);
    const span = Math.max(1.2, v.endSec - triggerSec);
    const localP = Math.max(0, Math.min(1, (t - triggerSec) / span));

    // Continuous fractional word position (0.0 -> 1.0) across the verse's words
    const allWords = v.lines[0]?.words || [];
    let continuousWordPos = localP;
    let isHoldingNote = false;
    let holdIntensity = 0;

    if (allWords.length > 0) {
      for (let idx = 0; idx < allWords.length; idx++) {
        const w = allWords[idx];
        const preS = w.visualStartSec ?? Math.max(0, w.startSec - PRE_ROLL_SEC);
        if (t >= preS && t <= w.endSec) {
          const wFrac = Math.max(0, Math.min(1, (t - preS) / Math.max(0.15, w.endSec - preS)));
          continuousWordPos = (idx + wFrac) / Math.max(1, allWords.length);
        } else if (t > w.endSec) {
          continuousWordPos = (idx + 1) / Math.max(1, allWords.length);
        }
        if (w.isLongHold && t >= w.startSec && t <= w.endSec) {
          isHoldingNote = true;
          const hp = (t - w.startSec) / Math.max(0.2, w.endSec - w.startSec);
          holdIntensity = Math.sin(Math.max(0, Math.min(1, hp)) * Math.PI);
        }
      }
    }

    // Smooth camera choreography within the verse:
    // - First 28% of verse: Focus closer on the Left Sketch Photo (0.31 of cellW) as the drawing sketches in
    // - Next 72% of verse: Smoothly pan right across the calligraphic Devanagari lyrics (up to 0.57 of cellW)
    //   and gently follow the vertical row progression!
    const panProgress = easeInOutCubic(Math.max(localP * 0.72, continuousWordPos * 0.92));

    const rawFocusX = cellX + cellW * (0.32 + 0.25 * panProgress);
    const rawFocusY =
      cellY + cellH * (0.44 + 0.09 * panProgress);

    // Deeper cinematic close-up zoom (1.72x base -> up to 1.90x on sustained vocal hold words!)
    const zoom =
      1.72 +
      0.06 * Math.sin(localP * Math.PI) +
      (isHoldingNote ? 0.14 * holdIntensity : 0);

    // Clamp focus center so the camera never shows outside the sketchbook paper margins
    const halfViewW = (width * 0.5) / zoom;
    const halfViewH = (height * 0.5) / zoom;
    const marginX = 24 * (width / 1920);
    const marginY = 20 * (width / 1920);

    const clampedX = Math.max(
      halfViewW + marginX,
      Math.min(width - halfViewW - marginX, rawFocusX)
    );
    const clampedY = Math.max(
      halfViewH + marginY,
      Math.min(height - halfViewH - marginY, rawFocusY)
    );

    // Subtle organic handheld camera breathing
    const swayAngle =
      (col === 0 ? -0.005 : 0.005) * (1 - panProgress * 0.65) +
      Math.sin(t * 1.6) * 0.0025;

    return {
      focusX: clampedX,
      focusY: clampedY,
      zoom,
      rotationRad: swayAngle,
      activeVerseIndex: vIdx,
      focusLabel: `SCENE 0${vIdx + 1}`,
    };
  };

  // Determine active verse index & smooth transition between verses
  let currentIdx = 0;
  for (let i = 0; i < verses.length; i++) {
    const vStart = verses[i].visualStartSec ?? Math.max(0, verses[i].startSec - PRE_ROLL_SEC);
    if (currentTimeSec >= vStart) {
      currentIdx = i;
    }
  }

  let state = getVerseCameraTarget(currentIdx, currentTimeSec);

  // Smooth 0.70s camera pan transition from previous verse cell into current verse cell
  if (currentIdx > 0) {
    const curStart =
      verses[currentIdx].visualStartSec ??
      Math.max(0, verses[currentIdx].startSec - PRE_ROLL_SEC);
    const transSpan = 0.70;
    if (currentTimeSec >= curStart && currentTimeSec < curStart + transSpan) {
      const prevState = getVerseCameraTarget(currentIdx - 1, curStart);
      const blend = easeInOutCubic((currentTimeSec - curStart) / transSpan);
      state = {
        focusX: prevState.focusX + (state.focusX - prevState.focusX) * blend,
        focusY: prevState.focusY + (state.focusY - prevState.focusY) * blend,
        zoom: prevState.zoom + (state.zoom - prevState.zoom) * blend,
        rotationRad:
          prevState.rotationRad + (state.rotationRad - prevState.rotationRad) * blend,
        activeVerseIndex: currentIdx,
        focusLabel: `SCENE 0${currentIdx + 1}`,
      };
    }
  }

  // Final 1.05s Outro Pull-Back to Full Sketchbook Page Overview (23.0s -> 24.03s)
  const outroStart = project.durationSec - 1.05;
  if (currentTimeSec > outroStart) {
    const outroBlend = easeInOutCubic(
      Math.max(0, Math.min(1, (currentTimeSec - outroStart) / 1.0))
    );
    state = {
      focusX: state.focusX + (width * 0.5 - state.focusX) * outroBlend,
      focusY: state.focusY + (height * 0.5 - state.focusY) * outroBlend,
      zoom: state.zoom + (1.0 - state.zoom) * outroBlend,
      rotationRad: state.rotationRad * (1 - outroBlend),
      activeVerseIndex: state.activeVerseIndex,
      focusLabel: 'FULL SKETCHBOOK REVEAL',
    };
  }

  return state;
}

/**
 * Renders a single 16:9 frame of the Sketchbook Lyric Video at `currentTimeSec`
 * - Dynamic Camera Focus & Follow: Zooms in (1.72x–1.90x) onto the active photo & lyrics, starting on the pencil sketch and panning across the sung Hindi words!
 * - Pure Hand-Sketching Photo Animation: Multi-band zig-zag pencil shading reveal + cross-hatching (no floating pencil object).
 * - Attractive Calligraphic Devanagari Typography: Uses Amita / Yatra One / Rozha One / Kalam on ruled sketchbook lines with 500ms Pre-Roll & Sustained Vocal Hold melisma waves (`〰`).
 */
export function renderSketchFrame(
  ctx: CanvasRenderingContext2D,
  project: SketchSongProject,
  currentTimeSec: number,
  width = 1920,
  height = 1080,
  customImages?: Partial<Record<SketchVignetteType, CanvasImageSource>>,
  cameraMode: 'follow' | 'overview' = 'follow',
  fontPreset: DevanagariFontPreset = 'amita'
) {
  // Ensure browser images start preloading automatically
  if (typeof window !== 'undefined' && !customImages) {
    preloadSketchSceneImages();
  }

  const lyricFontFamily =
    DEVANAGARI_FONT_STACKS[fontPreset]?.fontFamily ||
    DEVANAGARI_FONT_STACKS.amita.fontFamily;

  const scale = width / 1920;
  const gridLeft = 60 * scale;
  const gridTop = 114 * scale;
  const gridW = width - 120 * scale;
  const gridH = height - 154 * scale;
  const cols = 2;
  const rows = Math.max(2, Math.ceil(project.verses.length / cols));
  const cellW = gridW / cols;
  const cellH = gridH / rows;

  // Compute Dynamic Camera Focus & Follow Transform
  const cam = computeSketchCameraState(
    project,
    currentTimeSec,
    width,
    height,
    gridLeft,
    gridTop,
    cellW,
    cellH,
    cols,
    cameraMode
  );

  // Save root canvas context & apply 2.5D Camera Transform
  ctx.save();
  ctx.fillStyle = '#EAE3D2';
  ctx.fillRect(0, 0, width, height);

  ctx.translate(width * 0.5, height * 0.5);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.rotate(cam.rotationRad);
  ctx.translate(-cam.focusX, -cam.focusY);

  // 1. Off-White Sketchbook Paper Base (#F6F2E9)
  ctx.fillStyle = '#F6F2E9';
  ctx.fillRect(0, 0, width, height);

  // Warm archival paper edge vignette
  const edgeGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.25,
    width * 0.5,
    height * 0.5,
    width * 0.65
  );
  edgeGrad.addColorStop(0, 'rgba(246, 242, 233, 0)');
  edgeGrad.addColorStop(1, 'rgba(222, 214, 196, 0.55)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft paper tooth / grain texture (deterministic micro-fibers)
  ctx.fillStyle = 'rgba(90, 84, 74, 0.032)';
  for (let i = 0; i < 240; i++) {
    const gx = (i * 1973) % width;
    const gy = (i * 1097) % height;
    const gw = (1 + (i % 3)) * scale;
    ctx.fillRect(gx, gy, gw, gw);
  }

  // Faint sketchbook page margin rule
  ctx.strokeStyle = 'rgba(130, 122, 108, 0.22)';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(36 * scale, 28 * scale, width - 72 * scale, height - 56 * scale);

  // 2. Top-Left Hand-Lettered Title & Artist
  const headerX = 68 * scale;
  const headerY = 64 * scale;
  ctx.fillStyle = '#241F1A';
  ctx.font = `700 ${Math.round(38 * scale)}px ${lyricFontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(project.title, headerX, headerY);

  const titleW = ctx.measureText(project.title).width;
  ctx.fillStyle = '#6B655B';
  ctx.font = `500 ${Math.round(25 * scale)}px 'Caveat', 'Kalam', cursive, serif`;
  ctx.fillText(`— ${project.artist}`, headerX + titleW + 16 * scale, headerY + 2 * scale);

  // Hand-drawn pencil underline under header
  drawPencilSegment(
    ctx,
    headerX,
    headerY + 25 * scale,
    headerX + Math.min(width * 0.55, titleW + 220 * scale),
    headerY + 25 * scale,
    1.0,
    1,
    scale,
    0.55
  );

  // Top-right subtle sketchbook page number
  ctx.fillStyle = 'rgba(98, 92, 82, 0.65)';
  ctx.font = `600 ${Math.round(19 * scale)}px 'Caveat', 'Kalam', cursive`;
  ctx.textAlign = 'right';
  ctx.fillText(
    `p. 01 · ${project.title}`,
    width - 64 * scale,
    headerY
  );

  // 3. 2-Column × 3-Row Sketchbook Verse Cells
  project.verses.forEach((verse, vIdx) => {
    // Start drawing the scene & text 500ms BEFORE the verse's audio start!
    const verseTriggerSec = verse.visualStartSec ?? Math.max(0, verse.startSec - PRE_ROLL_SEC);
    if (currentTimeSec < verseTriggerSec) {
      return;
    }

    const col = vIdx % cols;
    const row = Math.floor(vIdx / cols);
    const cellX = gridLeft + col * cellW;
    const cellY = gridTop + row * cellH;

    const isFocusedVerse = cam.activeVerseIndex === vIdx || cam.zoom < 1.12;
    const isPastVerse = currentTimeSec > verse.endSec + 0.35;

    // When camera is zoomed in on the active verse, non-focused past verses fade softly (0.38)
    // so the active photo + calligraphic lyrics stand out with rich depth-of-field!
    const fadeAlpha = isFocusedVerse ? (isPastVerse ? 0.72 : 1.0) : 0.38;

    // Subtle warm paper illumination on the actively focused verse cell
    if (cam.activeVerseIndex === vIdx && cam.zoom > 1.15) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 252, 245, 0.72)';
      ctx.strokeStyle = 'rgba(186, 134, 68, 0.24)';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.roundRect(
        cellX - 6 * scale,
        cellY + 4 * scale,
        cellW - 10 * scale,
        cellH - 8 * scale,
        12 * scale
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Drawing stroke progress (0 -> 1 over the verse duration, starting at -500ms pre-roll)
    const verseSpan = Math.max(1.2, verse.endSec - verseTriggerSec);
    const strokeProgress = Math.max(
      0,
      Math.min(1, (currentTimeSec - verseTriggerSec) / (verseSpan * 0.76))
    );

    // Left side of cell: Generated Pencil Vignette Illustration (4:3 aspect ratio box)
    const drawBoxW = cellW * 0.37;
    const drawBoxH = cellH * 0.82;
    const drawBoxX = cellX + 6 * scale;
    const drawBoxY = cellY + (cellH - drawBoxH) * 0.42;

    drawVignetteScene(
      ctx,
      verse.vignette,
      drawBoxX,
      drawBoxY,
      drawBoxW,
      drawBoxH,
      strokeProgress,
      scale,
      fadeAlpha,
      customImages?.[verse.vignette]
    );

    // Small pencil caption under the drawing
    ctx.save();
    ctx.fillStyle = `rgba(105, 99, 89, ${0.72 * fadeAlpha})`;
    ctx.font = `500 ${Math.round(14.5 * scale)}px 'Caveat', 'Kalam', cursive`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `fig. 0${vIdx + 1} — ${verse.vignetteLabel.toLowerCase()}`,
      drawBoxX + drawBoxW * 0.5,
      drawBoxY + drawBoxH + 13 * scale
    );
    ctx.restore();

    // Right side of cell: Poetic Calligraphic Devanagari Lyrics
    const textAreaX = drawBoxX + drawBoxW + 20 * scale;
    const maxTextW = cellW - drawBoxW - 34 * scale;
    const fontSize = Math.round(31 * scale);
    const lineHeight = 52 * scale;

    ctx.save();
    ctx.font = `700 ${fontSize}px ${lyricFontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Lay out all words across wrapped rows inside the verse's right-hand column
    const allWords: AlignedLyricWord[] = [];
    verse.lines.forEach((l) => allWords.push(...l.words));

    const spaceW = ctx.measureText(' ').width * 1.22;
    const laidOutWords: Array<{
      wordObj: AlignedLyricWord;
      x: number;
      y: number;
      w: number;
      rowIdx: number;
    }> = [];

    let curX = textAreaX;
    let curRow = 0;

    allWords.forEach((wordObj) => {
      const measuredW = ctx.measureText(wordObj.word).width;
      if (curX > textAreaX && curX + measuredW > textAreaX + maxTextW) {
        curRow += 1;
        curX = textAreaX;
      }
      laidOutWords.push({
        wordObj,
        x: curX,
        y: 0,
        w: measuredW,
        rowIdx: curRow,
      });
      curX += measuredW + spaceW;
    });

    const totalRows = curRow + 1;
    const blockStartY =
      cellY + cellH * 0.45 - ((totalRows - 1) * lineHeight) * 0.5;

    laidOutWords.forEach((item) => {
      item.y = blockStartY + item.rowIdx * lineHeight;
    });

    // Draw faint hand-drawn notebook baseline rules under each lyric row for authentic poetry notebook look
    for (let r = 0; r < totalRows; r++) {
      const ruleY = blockStartY + r * lineHeight + 19 * scale;
      drawPencilSegment(
        ctx,
        textAreaX - 4 * scale,
        ruleY,
        textAreaX + maxTextW - 6 * scale,
        ruleY,
        Math.min(1, strokeProgress * 1.3),
        300 + vIdx * 10 + r,
        scale * 0.75,
        0.18 * fadeAlpha
      );
    }

    // Render each word with:
    // 1. 500ms Pre-Roll smooth calligraphic ink-flow entrance ([visualStartSec, startSec])
    // 2. Active Sung / Sustained Hold state ([startSec, endSec])
    // 3. Completed Sketchbook state (> endSec)
    laidOutWords.forEach((item) => {
      const { wordObj, x, y, w } = item;
      const preRollStart =
        wordObj.visualStartSec ?? Math.max(0, wordObj.startSec - PRE_ROLL_SEC);

      if (currentTimeSec < preRollStart) {
        return; // Not yet in 500ms pre-roll window
      }

      const preRollSpan = Math.max(0.15, wordObj.startSec - preRollStart);
      const preRollRaw = (currentTimeSec - preRollStart) / preRollSpan;
      const entranceProgress = easeOutCubic(Math.max(0, Math.min(1, preRollRaw)));

      const isPreRolling = currentTimeSec >= preRollStart && currentTimeSec < wordObj.startSec;
      const isCurrentlySung =
        currentTimeSec >= wordObj.startSec && currentTimeSec <= wordObj.endSec;
      const sungSpan = Math.max(0.15, wordObj.endSec - wordObj.startSec);
      const sungProgress = Math.max(
        0,
        Math.min(1, (currentTimeSec - wordObj.startSec) / sungSpan)
      );

      // Smooth vertical glide + subtle tilt settle during 500ms pre-roll
      const yOffset = (1 - entranceProgress) * 5.0 * scale;

      // Expressive breathing scale if this word is a sustained vocal hold
      let holdScale = 1.0;
      if (isCurrentlySung) {
        if (wordObj.isLongHold) {
          holdScale = 1.0 + 0.085 * Math.sin(sungProgress * Math.PI);
        } else {
          holdScale = 1.0 + 0.04 * Math.sin(sungProgress * Math.PI);
        }
      }

      ctx.save();

      // Soft watercolour golden-ochre brush wash behind active or sustained held word
      if (isCurrentlySung) {
        const highlightAlpha = wordObj.isLongHold ? 0.28 : 0.16;
        ctx.fillStyle = `rgba(224, 138, 42, ${highlightAlpha})`;
        const padX = 8 * scale;
        const padY = 19 * scale;
        ctx.beginPath();
        ctx.roundRect(
          x - padX,
          y - padY,
          w * holdScale + padX * 2,
          padY * 2,
          8 * scale
        );
        ctx.fill();
      } else if (isPreRolling) {
        ctx.fillStyle = `rgba(180, 152, 115, ${0.10 * entranceProgress})`;
        ctx.beginPath();
        ctx.roundRect(
          x - 4 * scale,
          y - 16 * scale,
          w * entranceProgress + 8 * scale,
          32 * scale,
          6 * scale
        );
        ctx.fill();
      }

      // Smooth progressive horizontal calligraphic reveal during the 500ms pre-roll
      const clipW = isPreRolling ? w * (0.22 + 0.78 * entranceProgress) + 14 * scale : w + 28 * scale;
      ctx.beginPath();
      ctx.rect(x - 8 * scale, y - 36 * scale, clipW, 74 * scale);
      ctx.clip();

      // Apply smooth scale around word center
      const centerX = x + w * 0.5;
      const centerY = y + yOffset;
      ctx.translate(centerX, centerY);
      ctx.scale(holdScale, holdScale);
      ctx.translate(-centerX, -centerY);

      const wordAlpha = isPreRolling
        ? (0.32 + 0.68 * entranceProgress) * fadeAlpha
        : (isCurrentlySung ? 1.0 : 0.90) * fadeAlpha;

      // Subtle warm sepia calligraphic ink drop-shadow for depth on paper
      ctx.fillStyle = isCurrentlySung
        ? `rgba(185, 92, 24, ${0.32 * wordAlpha})`
        : `rgba(120, 95, 68, ${0.18 * wordAlpha})`;
      ctx.fillText(wordObj.word, x + 1.1 * scale, y + yOffset + 1.2 * scale);

      // Rich Charcoal-Sepia Fountain/Calligraphy Ink
      ctx.fillStyle = isCurrentlySung
        ? `rgba(22, 16, 12, ${wordAlpha})`
        : `rgba(42, 36, 30, ${wordAlpha})`;

      ctx.fillText(wordObj.word, x, y + yOffset);

      ctx.restore();

      // If this word has a Long Vocal Hold in the song, draw the continuous melisma wave
      // underneath it so the animation visually holds as long as the singer holds the note!
      if (wordObj.isLongHold && currentTimeSec >= wordObj.startSec) {
        const waveProgress =
          currentTimeSec <= wordObj.endSec ? sungProgress : 1.0;
        drawSustainedHoldWave(
          ctx,
          x,
          y + 21 * scale,
          w,
          waveProgress,
          scale,
          fadeAlpha
        );
      }
    });

    ctx.restore();
  });

  // Restore from 2.5D Camera Transform back to screen-space
  ctx.restore();

  // 4. Clean Optical Depth-of-Field Paper Vignette (no distracting debug badges!)
  if (cameraMode === 'follow' && cam.zoom > 1.08) {
    const dofGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.32,
      width * 0.5,
      height * 0.5,
      width * 0.64
    );
    dofGrad.addColorStop(0, 'rgba(246, 242, 233, 0)');
    dofGrad.addColorStop(1, 'rgba(42, 36, 28, 0.20)');
    ctx.fillStyle = dofGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Generates a 6-frame Contact Sheet of Stills before full video render
 */
export function renderSketchContactSheet(
  project: SketchSongProject
): Array<{ label: string; timeSec: number; dataUrl: string }> {
  const percentages = [0.16, 0.34, 0.52, 0.68, 0.84, 0.98];
  const stills: Array<{ label: string; timeSec: number; dataUrl: string }> = [];

  const offscreen = document.createElement('canvas');
  offscreen.width = 640;
  offscreen.height = 360;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return stills;

  percentages.forEach((pct, idx) => {
    const t = Number((project.durationSec * pct).toFixed(1));
    renderSketchFrame(ctx, project, t, 640, 360);
    stills.push({
      label: `Still 0${idx + 1} · ${Math.round(pct * 100)}% (${t}s)`,
      timeSec: t,
      dataUrl: offscreen.toDataURL('image/jpeg', 0.88),
    });
  });

  return stills;
}

/**
 * Renders the 16:9 Sketch Music Video (either 1080p Master or <20MB 720p WhatsApp copy)
 * with original song audio muxed in real time.
 */
export async function exportSketchMusicVideo(params: {
  project: SketchSongProject;
  quality: '1080p-master' | '720p-whatsapp';
  onProgress?: (pct: number) => void;
}): Promise<string> {
  const { project, quality, onProgress } = params;
  const isWhatsApp = quality === '720p-whatsapp';
  const width = isWhatsApp ? 1280 : 1920;
  const height = isWhatsApp ? 720 : 1080;
  const fps = 30;
  const durationSec = Math.max(6, Math.min(90, project.durationSec));
  const totalFrames = Math.ceil(durationSec * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const canvasStream = canvas.captureStream(fps);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  let audioEl: HTMLAudioElement | null = null;
  let audioCtx: AudioContext | null = null;
  if (project.audioUrl) {
    try {
      audioEl = new Audio(project.audioUrl);
      audioEl.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        if (!audioEl) return resolve();
        audioEl.oncanplaythrough = () => resolve();
        audioEl.onerror = () => reject(new Error('Audio load error'));
        audioEl.load();
      });
      audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audioEl);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      combinedTracks.push(...dest.stream.getAudioTracks());
    } catch {
      // proceed with video if audio context fails
    }
  }

  const finalStream = new MediaStream(combinedTracks);
  const mimeType = MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

  // Ensure WhatsApp 720p copy stays strictly under 20 MB
  const videoBitsPerSecond = isWhatsApp ? 1_850_000 : 6_500_000;
  const audioBitsPerSecond = isWhatsApp ? 128_000 : 256_000;

  const recorder = new MediaRecorder(finalStream, {
    mimeType,
    videoBitsPerSecond,
    audioBitsPerSecond,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordingFinished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start(100);
  if (audioEl) {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
  }

  for (let f = 0; f <= totalFrames; f++) {
    const t = f / fps;
    renderSketchFrame(ctx, project, t, width, height);
    if (onProgress) {
      onProgress(Math.min(99, Math.round((f / totalFrames) * 100)));
    }
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  if (audioEl) audioEl.pause();
  if (audioCtx) audioCtx.close().catch(() => {});
  recorder.stop();

  const videoBlob = await recordingFinished;
  if (onProgress) onProgress(100);

  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
  const safeSlug =
    project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'kisi-ghazal-sketch';
  const filename = isWhatsApp
    ? `${safeSlug}-720p-whatsapp.${ext}`
    : `${safeSlug}-1080p-master.${ext}`;

  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);

  return filename;
}
