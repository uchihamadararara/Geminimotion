/**
 * Deterministic 1080×1920 @ 30fps Render Engine (`renderFrame(ctx, t, width, height)`)
 * Implements the complete 11-Scene, 1638-Frame (54.60s) AI Motion Showreel from SHOWREEL_KAISE_BANAYA.md:
 * - "One Shape, Never Cut": 16-keyframe sum-of-springs Hero morph (`evaluateHeroMorph(f)`)
 * - `Phase` content swap wrapper (12-frame blur/slide enter, 10-frame exit, zero scene overlap)
 * - `Kin` letter-by-letter masked rise with stagger, tilt, strike-through, and clean exit
 * - True 3D perspective rotating cube in Scene 10 with pixel-identical 2D-to-3D swap
 * - Pre-laid-out SRT word-by-word spring captions (14-frame orange highlight -> cream)
 * - Exact Loop Closure: Frame 1638 === Frame 0 (36×36 orange dot, cam=1, drift=0)
 */

import {
  clamp,
  lerp,
  prog,
  sp,
  beatPulse,
  easeOutExpo,
  easeInOut,
  easeLinear,
  evaluateHeroMorph,
  computePhaseEnvelope,
  SHOWREEL_COLORS,
  hexToRgb,
  rgbToCss,
} from './mathAndSeed';
import {
  VIDEO_CONFIG,
  SRT_CAPTIONS,
} from './scriptAndStoryboard';

export interface RenderOptions {
  disableCameraZoom?: boolean;
}

export interface LayoutBoxAudit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  textFits: boolean;
}

const FONT_SANS =
  '"Plus Jakarta Sans", "Inter", "DejaVu Sans", "Liberation Sans", sans-serif';
const FONT_MONO =
  '"JetBrains Mono", "DejaVu Sans Mono", "Liberation Mono", monospace';

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) * 0.5));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Custom vector Indian Rupee symbol (`₹`) so it never renders as a missing-glyph box
 * on headless Linux environments.
 */
function drawVectorRupeeSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  heightPx: number,
  color: string
) {
  const w = heightPx * 0.58;
  const topY = centerY - heightPx * 0.46;
  const midBarY = topY + heightPx * 0.26;
  const bowlBottomY = topY + heightPx * 0.54;
  const botY = centerY + heightPx * 0.46;
  const strokeW = Math.max(4, heightPx * 0.12);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Top horizontal bar
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x + w, topY);
  ctx.stroke();

  // Second horizontal bar
  ctx.beginPath();
  ctx.moveTo(x, midBarY);
  ctx.lineTo(x + w * 0.92, midBarY);
  ctx.stroke();

  // Curved R-bowl + diagonal leg
  ctx.beginPath();
  ctx.moveTo(x + w * 0.15, topY);
  ctx.lineTo(x + w * 0.48, topY);
  ctx.bezierCurveTo(
    x + w * 0.95,
    topY,
    x + w * 0.95,
    bowlBottomY,
    x + w * 0.42,
    bowlBottomY
  );
  ctx.lineTo(x + w * 0.12, bowlBottomY);
  ctx.lineTo(x + w * 0.86, botY);
  ctx.stroke();
  ctx.restore();
}

/**
 * `Kin` Component equivalent on Canvas 2D:
 * Letter-by-letter masked rise (`overflow: hidden` per line), slight 7deg tilt on rise,
 * optional orange strike-through bar that dims text to 0.35, and clean upward exit.
 */
function drawKinText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  baselineY: number,
  localFrame: number,
  options: {
    fontSize: number;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    delay?: number;
    stagger?: number;
    outFrame?: number;
    strikeStartFrame?: number;
    strikeDuration?: number;
  }
) {
  const {
    fontSize,
    fontWeight = '800',
    fontFamily = FONT_SANS,
    color = SHOWREEL_COLORS.ink,
    delay = 0,
    stagger = 2.0,
    outFrame,
    strikeStartFrame,
    strikeDuration = 22,
  } = options;

  ctx.save();
  ctx.font = `${fontWeight} ${Math.round(fontSize)}px ${fontFamily}`;
  ctx.textBaseline = 'alphabetic';

  const chars = Array.from(text);
  const charWidths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth = charWidths.reduce((acc, w) => acc + w, 0);
  const startX = centerX - totalWidth * 0.5;

  // Strike-through progress if enabled
  const strikeP =
    strikeStartFrame !== undefined
      ? prog(
          localFrame,
          strikeStartFrame,
          strikeStartFrame + strikeDuration,
          easeOutExpo
        )
      : 0;
  const textDimAlpha = strikeP > 0 ? lerp(1, 0.35, strikeP) : 1;

  // Clip mask box (`overflow: hidden` with 0.22em bottom padding so descenders never clip)
  const maskTop = baselineY - fontSize * 1.12;
  const maskHeight = fontSize * 1.38;
  ctx.beginPath();
  ctx.rect(
    startX - fontSize * 0.4,
    maskTop,
    totalWidth + fontSize * 0.8,
    maskHeight
  );
  ctx.clip();

  let cursorX = startX;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cw = charWidths[i];
    if (ch !== ' ') {
      const pIn = sp(localFrame, delay + i * stagger, 17, 130, 0.9);
      const pOut =
        outFrame !== undefined
          ? prog(
              localFrame,
              outFrame + i * stagger,
              outFrame + i * stagger + 10,
              easeInOut
            )
          : 0;

      const yOffset = (1 - pIn) * fontSize * 1.18 - pOut * fontSize * 1.18;
      const rotRad = (1 - pIn) * ((7 * Math.PI) / 180);
      const charAlpha = clamp(pIn * (1 - pOut), 0, 1) * textDimAlpha;

      if (charAlpha > 0.01) {
        ctx.save();
        ctx.translate(cursorX + cw * 0.5, baselineY + yOffset);
        ctx.rotate(rotRad);
        ctx.fillStyle = color;
        ctx.globalAlpha *= charAlpha;
        ctx.textAlign = 'center';
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      }
    }
    cursorX += cw;
  }

  ctx.restore();

  // Draw orange strike-through bar over text if active
  if (strikeP > 0.01) {
    ctx.save();
    const strikeW = totalWidth * 1.06 * strikeP;
    const strikeH = Math.max(6, fontSize * 0.13);
    const strikeX = centerX - totalWidth * 0.53;
    const strikeY = baselineY - fontSize * 0.34 - strikeH * 0.5;
    ctx.fillStyle = SHOWREEL_COLORS.orange;
    traceRoundedRect(ctx, strikeX, strikeY, strikeW, strikeH, strikeH * 0.5);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Self-drawing stroke checkmark (`Check` component in guide)
 */
function drawStrokeCheck(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  progress: number,
  color: string,
  lineWidth: number
) {
  const p = clamp(progress, 0, 1);
  if (p <= 0.01) return;

  const p1 = { x: cx - size * 0.42, y: cy + size * 0.04 };
  const p2 = { x: cx - size * 0.08, y: cy + size * 0.38 };
  const p3 = { x: cx + size * 0.46, y: cy - size * 0.32 };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  if (p <= 0.4) {
    const k = p / 0.4;
    ctx.lineTo(lerp(p1.x, p2.x, k), lerp(p1.y, p2.y, k));
  } else {
    ctx.lineTo(p2.x, p2.y);
    const k = (p - 0.4) / 0.6;
    ctx.lineTo(lerp(p2.x, p3.x, k), lerp(p2.y, p3.y, k));
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * True 3D Perspective Cube renderer for Scene 10 (`f = 1425..1495`)
 * At rotY = 0 (or 720) and rotX = 0, the front face is an exact 300×300 orange square
 * so the swap from/to the 2D Hero shape is 100% seamless.
 */
function drawSeamless3DCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotYDeg: number,
  rotXDeg: number,
  scale: number,
  s: number
) {
  const half = (size * scale) / 2;
  const radY = (rotYDeg * Math.PI) / 180;
  const radX = (rotXDeg * Math.PI) / 180;
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);

  // 8 vertices of cube in [-half, +half]^3
  const rawVerts = [
    [-1, -1, 1], // 0: front-top-left
    [1, -1, 1], // 1: front-top-right
    [1, 1, 1], // 2: front-bottom-right
    [-1, 1, 1], // 3: front-bottom-left
    [-1, -1, -1], // 4: back-top-left
    [1, -1, -1], // 5: back-top-right
    [1, 1, -1], // 6: back-bottom-right
    [-1, 1, -1], // 7: back-bottom-left
  ];

  const fov = 1500 * s;
  const transformed = rawVerts.map(([vx, vy, vz]) => {
    const x0 = vx * half;
    const y0 = vy * half;
    const z0 = vz * half;
    // Rotate around Y first, then tilt forward around X so top face is visible
    const x1 = x0 * cosY + z0 * sinY;
    const z1 = -x0 * sinY + z0 * cosY;
    const y2 = y0 * cosX + z1 * sinX;
    const z2 = -y0 * sinX + z1 * cosX;

    // Perspective projection normalized so z2 = +half (front face at rest) has perspective factor === 1.0
    const persp = (fov - half) / Math.max(200, fov - z2);
    return {
      x: cx + x1 * persp,
      y: cy + y2 * persp,
      z: z2,
    };
  });

  const faces = [
    { indices: [0, 1, 2, 3], color: SHOWREEL_COLORS.orange, label: '3D' }, // Front
    { indices: [1, 5, 6, 2], color: SHOWREEL_COLORS.blue, label: 'UI' }, // Right
    { indices: [5, 4, 7, 6], color: '#FF7844', label: 'AI' }, // Back
    { indices: [4, 0, 3, 7], color: '#2842CC', label: 'FX' }, // Left
    { indices: [4, 5, 1, 0], color: '#FF8552', label: 'TOP' }, // Top
    { indices: [3, 2, 6, 7], color: '#1B1B24', label: '' }, // Bottom
  ];

  // Painter's algorithm + back-face culling
  const visibleFaces = faces
    .map((face) => {
      const pts = face.indices.map((idx) => transformed[idx]);
      const avgZ = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) / 4;
      const ux = pts[1].x - pts[0].x;
      const uy = pts[1].y - pts[0].y;
      const vx = pts[2].x - pts[1].x;
      const vy = pts[2].y - pts[1].y;
      const cross = ux * vy - uy * vx;
      return { ...face, pts, avgZ, cross };
    })
    .filter((f) => f.cross > 0)
    .sort((a, b) => a.avgZ - b.avgZ);

  for (const face of visibleFaces) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(face.pts[0].x, face.pts[0].y);
    ctx.lineTo(face.pts[1].x, face.pts[1].y);
    ctx.lineTo(face.pts[2].x, face.pts[2].y);
    ctx.lineTo(face.pts[3].x, face.pts[3].y);
    ctx.closePath();
    ctx.fillStyle = face.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 241, 234, 0.35)';
    ctx.lineWidth = 3.5 * s;
    ctx.stroke();

    if (
      face.label &&
      face.label !== 'TOP' &&
      Math.abs(rotYDeg % 360) > 12
    ) {
      const fcx =
        (face.pts[0].x + face.pts[1].x + face.pts[2].x + face.pts[3].x) * 0.25;
      const fcy =
        (face.pts[0].y + face.pts[1].y + face.pts[2].y + face.pts[3].y) * 0.25;
      ctx.fillStyle = 'rgba(244, 241, 234, 0.92)';
      ctx.font = `800 ${Math.round(52 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(face.label, fcx, fcy);
    }
    ctx.restore();
  }
}

/**
 * Word-by-word SRT Caption Renderer (Section 8)
 */
function drawSrtCaptions(
  ctx: CanvasRenderingContext2D,
  f: number,
  width: number,
  s: number
) {
  const activeCue = SRT_CAPTIONS.find(
    (c) => f >= c.startFrame && f < c.endFrame
  );
  if (!activeCue) return;

  const cueDuration = activeCue.endFrame - activeCue.startFrame;
  const cueFadeOut =
    1 - prog(f, activeCue.endFrame - 7, activeCue.endFrame, easeInOut);
  if (cueFadeOut <= 0.01) return;

  ctx.save();
  const fontSize = Math.round(46 * s);
  const lineHeight = Math.round(64 * s);
  const maxWidth = 910 * s;
  ctx.font = `700 ${fontSize}px ${FONT_SANS}`;
  ctx.textBaseline = 'alphabetic';

  const words = activeCue.text.split(' ');
  const spaceWidth = ctx.measureText(' ').width;

  interface LaidOutWord {
    word: string;
    index: number;
    x: number;
    y: number;
    w: number;
  }

  const lines: {
    words: { word: string; index: number; w: number }[];
    totalW: number;
  }[] = [];
  let currentLine: { word: string; index: number; w: number }[] = [];
  let currentW = 0;

  words.forEach((word, idx) => {
    const ww = ctx.measureText(word).width;
    if (currentLine.length > 0 && currentW + spaceWidth + ww > maxWidth) {
      lines.push({ words: currentLine, totalW: currentW });
      currentLine = [{ word, index: idx, w: ww }];
      currentW = ww;
    } else {
      if (currentLine.length > 0) currentW += spaceWidth;
      currentLine.push({ word, index: idx, w: ww });
      currentW += ww;
    }
  });
  if (currentLine.length > 0) {
    lines.push({ words: currentLine, totalW: currentW });
  }

  const baseTopY = 1495 * s;
  const laidOut: LaidOutWord[] = [];
  lines.forEach((line, lineIdx) => {
    let curX = (width - line.totalW) * 0.5;
    const curY = baseTopY + lineIdx * lineHeight;
    line.words.forEach((item) => {
      laidOut.push({
        word: item.word,
        index: item.index,
        x: curX,
        y: curY,
        w: item.w,
      });
      curX += item.w + spaceWidth;
    });
  });

  const boxPadX = 36 * s;
  const boxPadY = 26 * s;
  const maxLineW = Math.max(...lines.map((l) => l.totalW));
  const bgW = maxLineW + boxPadX * 2;
  const bgH = lines.length * lineHeight + boxPadY * 1.4;
  const bgX = (width - bgW) * 0.5;
  const bgY = baseTopY - fontSize - boxPadY * 0.5;

  ctx.globalAlpha = cueFadeOut * 0.88;
  ctx.fillStyle = 'rgba(22, 22, 28, 0.82)';
  traceRoundedRect(ctx, bgX, bgY, bgW, bgH, 24 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 241, 234, 0.08)';
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  const orangeRgb = hexToRgb(SHOWREEL_COLORS.orange);
  const creamRgb = hexToRgb(SHOWREEL_COLORS.ink);

  for (const item of laidOut) {
    const t0 =
      activeCue.startFrame +
      4 +
      item.index * ((cueDuration * 0.82) / Math.max(1, words.length));
    const wp = sp(f, t0, 18, 150, 0.9);
    if (wp <= 0.01) continue;

    const age = f - t0;
    const colorBlend = clamp((age - 8) / 6, 0, 1);
    const r = lerp(orangeRgb.r, creamRgb.r, colorBlend);
    const g = lerp(orangeRgb.g, creamRgb.g, colorBlend);
    const b = lerp(orangeRgb.b, creamRgb.b, colorBlend);

    const yPop = (1 - wp) * 16 * s;
    ctx.save();
    ctx.globalAlpha = clamp(wp, 0, 1) * cueFadeOut;
    ctx.fillStyle = rgbToCss({ r, g, b });
    ctx.textAlign = 'left';
    ctx.fillText(item.word, item.x, item.y + yPop);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Master Deterministic Frame Renderer (`renderFrame`)
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  width: number = VIDEO_CONFIG.width,
  height: number = VIDEO_CONFIG.height,
  options: RenderOptions = {}
): LayoutBoxAudit[] {
  const audits: LayoutBoxAudit[] = [];
  const s = width / 1080;

  const rawFrame = t * VIDEO_CONFIG.fps;
  const f = clamp(rawFrame, 0, VIDEO_CONFIG.totalFrames);
  const loopF = f >= VIDEO_CONFIG.totalFrames - 0.0001 ? 0 : f;

  const centerX = width * 0.5;
  const centerY = 790 * s;

  // 1. Background (#0A0A0D) + Drifting 60px Dot Grid + Vignette
  ctx.save();
  ctx.fillStyle = SHOWREEL_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const driftPx =
    50 * Math.sin((Math.PI * loopF) / VIDEO_CONFIG.totalFrames) * s;
  const gridSpacing = 60 * s;
  ctx.fillStyle = 'rgba(244, 241, 234, 0.075)';
  const startGridY = ((driftPx % gridSpacing) + gridSpacing) % gridSpacing;
  for (let gx = gridSpacing * 0.5; gx < width; gx += gridSpacing) {
    for (let gy = startGridY; gy < height; gy += gridSpacing) {
      ctx.beginPath();
      ctx.arc(gx, gy, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const vig = ctx.createRadialGradient(
    centerX,
    centerY,
    200 * s,
    centerX,
    centerY,
    1100 * s
  );
  vig.addColorStop(0, 'rgba(10, 10, 13, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  // 2. Camera Transform
  const camScale = options.disableCameraZoom
    ? 1
    : 1 + 0.035 * Math.sin((Math.PI * loopF) / VIDEO_CONFIG.totalFrames);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(camScale, camScale);
  ctx.translate(-centerX, -centerY);

  // 3. Evaluate Persistent Hero Shape ("One Shape, Never Cut")
  const hero = evaluateHeroMorph(loopF);
  const heroCx = centerX + hero.x * s;
  const heroCy = centerY + hero.y * s;
  const heroW = hero.w * s;
  const heroH = hero.h * s;
  const heroR = hero.radius * s;

  const is3DCubeActive = loopF >= 1425 && loopF <= 1495;

  if (!is3DCubeActive) {
    ctx.save();
    ctx.translate(heroCx, heroCy);
    ctx.scale(hero.beatScale, hero.beatScale);
    if (Math.abs(hero.rotate) > 0.01) {
      ctx.rotate((hero.rotate * Math.PI) / 180);
    }

    if (hero.w > 80) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.48)';
      ctx.shadowBlur = 44 * s;
      ctx.shadowOffsetY = 20 * s;
      ctx.fillStyle = hero.cssColor;
      traceRoundedRect(ctx, -heroW * 0.5, -heroH * 0.5, heroW, heroH, heroR);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = hero.cssColor;
      traceRoundedRect(ctx, -heroW * 0.5, -heroH * 0.5, heroW, heroH, heroR);
      ctx.fill();
    }

    if (hero.w > 120) {
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.1)';
      ctx.lineWidth = 2 * s;
      traceRoundedRect(ctx, -heroW * 0.5, -heroH * 0.5, heroW, heroH, heroR);
      ctx.stroke();
    }
    ctx.restore();
  }

  audits.push({
    id: 'hero-shape',
    x: heroCx - heroW * 0.5,
    y: heroCy - heroH * 0.5,
    w: heroW,
    h: heroH,
    textFits: true,
  });

  const sceneIndex = Math.min(10, Math.floor(loopF / 150));
  const localFrame = loopF - sceneIndex * 150;
  const sceneDuration = sceneIndex === 10 ? 138 : 150;
  const phase = computePhaseEnvelope(localFrame, sceneDuration, 6);

  // ============================================================================
  // SCENE 1 (0 - 5s, frames 0..149): "AI = ANSWERS" struck out -> Video Card -> "MOTION VIDEO"
  // ============================================================================
  if (sceneIndex === 0 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'AI = ANSWERS', centerX, 360 * s, localFrame, {
      fontSize: 76 * s,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
      strikeStartFrame: 24,
      strikeDuration: 18,
    });

    const cardLeft = heroCx - heroW * 0.5;
    const cardTop = heroCy - heroH * 0.5;

    ctx.save();
    traceRoundedRect(ctx, cardLeft, cardTop, heroW, heroH, heroR);
    ctx.clip();

    const wipeP = prog(localFrame, 32, 92, easeInOut);
    if (wipeP > 0.01) {
      ctx.fillStyle = 'rgba(61, 91, 255, 0.16)';
      ctx.fillRect(cardLeft, cardTop, heroW * wipeP, heroH);
      ctx.fillStyle = SHOWREEL_COLORS.blue;
      ctx.fillRect(cardLeft + heroW * wipeP - 4 * s, cardTop, 4 * s, heroH);
    }

    const pulseR = (108 + 26 * beatPulse(loopF)) * s;
    ctx.strokeStyle = 'rgba(255, 91, 31, 0.35)';
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.arc(heroCx, heroCy - 24 * s, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    const morphP = prog(localFrame, 28, 86, easeOutExpo);
    const shapeSize = 104 * s;
    const shapeR = lerp(52, 14, morphP) * s;
    const shapeRot = (lerp(0, 200, morphP) * Math.PI) / 180;

    ctx.save();
    ctx.translate(heroCx, heroCy - 24 * s);
    ctx.rotate(shapeRot);
    ctx.fillStyle = SHOWREEL_COLORS.orange;
    traceRoundedRect(
      ctx,
      -shapeSize * 0.5,
      -shapeSize * 0.5,
      shapeSize,
      shapeSize,
      shapeR
    );
    ctx.fill();

    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.beginPath();
    ctx.moveTo(-12 * s, -18 * s);
    ctx.lineTo(20 * s, 0);
    ctx.lineTo(-12 * s, 18 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const barX = cardLeft + 56 * s;
    const barW = heroW - 112 * s;
    const barY = cardTop + heroH - 64 * s;
    const playheadP = prog(localFrame, 12, 136, easeLinear);

    ctx.fillStyle = 'rgba(244, 241, 234, 0.14)';
    traceRoundedRect(ctx, barX, barY, barW, 10 * s, 5 * s);
    ctx.fill();

    ctx.fillStyle = SHOWREEL_COLORS.orange;
    traceRoundedRect(ctx, barX, barY, barW * playheadP, 10 * s, 5 * s);
    ctx.fill();

    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.beginPath();
    ctx.arc(barX + barW * playheadP, barY + 5 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    drawKinText(ctx, 'MOTION VIDEO', centerX, 1185 * s, localFrame, {
      fontSize: 96 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 30,
      stagger: 1.8,
      outFrame: 122,
    });

    ctx.restore();
  }

  // ============================================================================
  // SCENE 2 (5 - 10s, frames 150..299): FREE Card ("₹999 -> ₹0" vector Rupee + Check)
  // ============================================================================
  if (sceneIndex === 1 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'ZERO COST PLAN', centerX, 315 * s, localFrame, {
      fontSize: 72 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
    });

    const countP = prog(localFrame, 14, 56, easeInOut);
    const priceVal = Math.round(lerp(999, 0, countP));
    const priceStr = String(priceVal);

    // Top dark pill badge inside orange card
    const pillW = 390 * s;
    const pillH = 60 * s;
    ctx.fillStyle = SHOWREEL_COLORS.bg;
    traceRoundedRect(
      ctx,
      heroCx - pillW * 0.5,
      heroCy - 275 * s,
      pillW,
      pillH,
      30 * s
    );
    ctx.fill();

    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.font = `700 ${Math.round(24 * s)}px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLAUDE FREE TIER', heroCx, heroCy - 245 * s);

    // Giant Tabular Price Counter with Vector Rupee (`₹`) + Numeral (`999 -> 0`)
    const numFontSize = 196 * s;
    ctx.font = `900 ${Math.round(numFontSize)}px ${FONT_SANS}`;
    const numW = ctx.measureText(priceStr).width;
    const rupeeH = 136 * s;
    const rupeeW = rupeeH * 0.58;
    const gap = 22 * s;
    const totalPriceW = rupeeW + gap + numW;
    const startPriceX = heroCx - totalPriceW * 0.5;
    const priceCy = heroCy - 40 * s;

    drawVectorRupeeSymbol(
      ctx,
      startPriceX,
      priceCy,
      rupeeH,
      SHOWREEL_COLORS.ink
    );

    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceStr, startPriceX + rupeeW + gap, priceCy + 6 * s);

    // Subtitle under price
    ctx.fillStyle = 'rgba(10, 10, 13, 0.85)';
    ctx.font = `800 ${Math.round(32 * s)}px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('PER MONTH · FOREVER FREE', heroCx, heroCy + 108 * s);

    // Self-drawing Checkmark inside dark circular badge at bottom of card
    const checkCircleY = heroCy + 232 * s;
    const badgeScale = sp(localFrame, 46, 17, 150, 0.9);
    if (badgeScale > 0.01) {
      ctx.save();
      ctx.translate(heroCx, checkCircleY);
      ctx.scale(badgeScale, badgeScale);
      ctx.fillStyle = SHOWREEL_COLORS.bg;
      ctx.beginPath();
      ctx.arc(0, 0, 62 * s, 0, Math.PI * 2);
      ctx.fill();

      const checkDrawP = prog(localFrame, 50, 72, easeOutExpo);
      drawStrokeCheck(
        ctx,
        0,
        0,
        60 * s,
        checkDrawP,
        SHOWREEL_COLORS.ink,
        11 * s
      );
      ctx.restore();
    }

    ctx.restore();
  }

  // ============================================================================
  // SCENE 3 (10 - 15s, frames 300..449): Prompt Type + Send Pulse + 4 Code Lines
  // ============================================================================
  if (sceneIndex === 2 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'IDEA TO CODE', centerX, 325 * s, localFrame, {
      fontSize: 74 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
    });

    const winLeft = heroCx - heroW * 0.5;
    const winTop = heroCy - heroH * 0.5;

    ctx.save();
    traceRoundedRect(ctx, winLeft, winTop, heroW, heroH, heroR);
    ctx.clip();

    const promptX = winLeft + 44 * s;
    const promptY = winTop + 44 * s;
    const promptW = heroW - 88 * s;
    const promptH = 108 * s;

    ctx.fillStyle = SHOWREEL_COLORS.card2;
    traceRoundedRect(ctx, promptX, promptY, promptW, promptH, 26 * s);
    ctx.fill();

    const promptText = 'Make a 120 BPM motion video in React...';
    const typedPromptChars = Math.floor(
      clamp((localFrame - 6) * 2.2, 0, promptText.length)
    );
    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.font = `600 ${Math.round(30 * s)}px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      promptText.slice(0, typedPromptChars),
      promptX + 32 * s,
      promptY + promptH * 0.5
    );

    const sendScale = 1 + 0.14 * beatPulse(loopF);
    const sendCx = promptX + promptW - 58 * s;
    const sendCy = promptY + promptH * 0.5;
    ctx.save();
    ctx.translate(sendCx, sendCy);
    ctx.scale(sendScale, sendScale);
    ctx.fillStyle = SHOWREEL_COLORS.orange;
    ctx.beginPath();
    ctx.arc(0, 0, 34 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = SHOWREEL_COLORS.ink;
    ctx.lineWidth = 4.5 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-10 * s, 4 * s);
    ctx.lineTo(0, -10 * s);
    ctx.lineTo(10 * s, 4 * s);
    ctx.moveTo(0, -10 * s);
    ctx.lineTo(0, 12 * s);
    ctx.stroke();
    ctx.restore();

    const codeX = winLeft + 44 * s;
    const codeY = promptY + promptH + 32 * s;
    const codeW = heroW - 88 * s;
    const codeH = heroH - promptH - 120 * s;

    ctx.fillStyle = SHOWREEL_COLORS.terminal;
    traceRoundedRect(ctx, codeX, codeY, codeW, codeH, 28 * s);
    ctx.fill();

    const codeLines = [
      {
        startF: 22,
        kw: 'const ',
        id: 'hero ',
        op: '= ',
        fn: 'sumOfSprings',
        arg: '(f, KEYS);',
      },
      {
        startF: 36,
        kw: 'const ',
        id: 'text ',
        op: '= ',
        fn: 'KinMasked',
        arg: '({ stagger: 2 });',
      },
      {
        startF: 50,
        kw: 'const ',
        id: 'cube ',
        op: '= ',
        fn: 'rotate3D',
        arg: '(720 * ease(f));',
      },
      {
        startF: 64,
        kw: 'export ',
        id: 'default ',
        op: '',
        fn: 'renderReel',
        arg: '(1080, 1920);',
      },
    ];

    ctx.font = `600 ${Math.round(27 * s)}px ${FONT_MONO}`;
    ctx.textBaseline = 'middle';

    codeLines.forEach((line, idx) => {
      const fullStr = `${line.kw}${line.id}${line.op}${line.fn}${line.arg}`;
      const charsToShow = Math.floor(
        clamp((localFrame - line.startF) * 2.2, 0, fullStr.length)
      );
      if (charsToShow <= 0) return;

      const rowY = codeY + 78 * s + idx * 96 * s;
      ctx.fillStyle = 'rgba(138, 138, 150, 0.45)';
      ctx.textAlign = 'left';
      ctx.fillText(`0${idx + 1}`, codeX + 32 * s, rowY);

      const segments = [
        { text: line.kw, color: SHOWREEL_COLORS.orange },
        { text: line.id, color: SHOWREEL_COLORS.ink },
        { text: line.op, color: SHOWREEL_COLORS.muted },
        { text: line.fn, color: SHOWREEL_COLORS.blue },
        { text: line.arg, color: SHOWREEL_COLORS.ink },
      ];

      let rem = charsToShow;
      let curX = codeX + 96 * s;
      for (const seg of segments) {
        if (rem <= 0) break;
        const slice = seg.text.slice(0, rem);
        ctx.fillStyle = seg.color;
        ctx.fillText(slice, curX, rowY);
        curX += ctx.measureText(slice).width;
        rem -= slice.length;
      }

      if (charsToShow < fullStr.length) {
        ctx.fillStyle = SHOWREEL_COLORS.orange;
        ctx.fillRect(curX + 4 * s, rowY - 16 * s, 12 * s, 32 * s);
      }
    });

    ctx.restore();
    ctx.restore();
  }

  // ============================================================================
  // SCENE 4 (15 - 20s, frames 450..599): 2×2 Bento Grid (Type, Shapes, Wipe, SFX)
  // ============================================================================
  if (sceneIndex === 3 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'ALL IN ONE ENGINE', centerX, 275 * s, localFrame, {
      fontSize: 68 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
    });

    const tileSlots = [
      { dx: -225, dy: -245, title: '01 · KINETIC TYPE' },
      { dx: 225, dy: -245, title: '02 · ORBIT SHAPES' },
      { dx: -225, dy: 205, title: '03 · TRANSITIONS' },
      { dx: 225, dy: 205, title: '04 · SOUND SFX' },
    ];

    const activeTileIdx = Math.floor(clamp(localFrame - 10, 0, 139) / 30) % 4;
    const tileSize = 420 * s;
    const tileR = 56 * s;

    tileSlots.forEach((slot, idx) => {
      const spawnP = idx === 0 ? 1 : sp(localFrame, 8 + idx * 6, 18, 140, 0.9);
      const tx = centerX + lerp(-225, slot.dx, spawnP) * s;
      const ty = centerY + lerp(-245, slot.dy, spawnP) * s;
      const left = tx - tileSize * 0.5;
      const top = ty - tileSize * 0.5;

      if (idx > 0) {
        ctx.save();
        ctx.fillStyle = SHOWREEL_COLORS.card;
        traceRoundedRect(ctx, left, top, tileSize, tileSize, tileR);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      traceRoundedRect(ctx, left, top, tileSize, tileSize, tileR);
      ctx.clip();

      ctx.fillStyle =
        idx === activeTileIdx ? SHOWREEL_COLORS.orange : SHOWREEL_COLORS.muted;
      ctx.font = `700 ${Math.round(22 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(slot.title, left + 36 * s, top + 48 * s);

      if (idx === 0) {
        const waveChars = ['M', 'O', 'T', 'I', 'O', 'N'];
        ctx.font = `900 ${Math.round(58 * s)}px ${FONT_SANS}`;
        ctx.textAlign = 'center';
        waveChars.forEach((ch, cIdx) => {
          const wx = tx + (cIdx - 2.5) * 56 * s;
          const wy =
            ty + 24 * s + Math.sin(localFrame * 0.22 + cIdx * 0.85) * 32 * s;
          ctx.fillStyle =
            cIdx % 2 === 0 ? SHOWREEL_COLORS.ink : SHOWREEL_COLORS.orange;
          ctx.fillText(ch, wx, wy);
        });
      } else if (idx === 1) {
        const orbCy = ty + 24 * s;
        ctx.strokeStyle = 'rgba(244, 241, 234, 0.16)';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.arc(tx, orbCy, 105 * s, 0, Math.PI * 2);
        ctx.stroke();

        const ang1 = localFrame * 0.08;
        const ang2 = -localFrame * 0.11 + 1.8;
        ctx.save();
        ctx.translate(tx, orbCy);
        ctx.rotate(ang1);
        ctx.fillStyle = SHOWREEL_COLORS.blue;
        traceRoundedRect(ctx, -28 * s, -28 * s, 56 * s, 56 * s, 12 * s);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = SHOWREEL_COLORS.orange;
        ctx.beginPath();
        ctx.arc(
          tx + Math.cos(ang1) * 105 * s,
          orbCy + Math.sin(ang1) * 105 * s,
          20 * s,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = SHOWREEL_COLORS.ink;
        ctx.beginPath();
        ctx.arc(
          tx + Math.cos(ang2) * 105 * s,
          orbCy + Math.sin(ang2) * 105 * s,
          14 * s,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (idx === 2) {
        for (let b = 0; b < 4; b++) {
          const phaseW = 0.5 + 0.42 * Math.sin(localFrame * 0.14 + b * 0.9);
          const barW = (tileSize - 88 * s) * phaseW;
          const barY = top + 115 * s + b * 64 * s;
          ctx.fillStyle =
            b % 2 === 0 ? SHOWREEL_COLORS.orange : SHOWREEL_COLORS.blue;
          traceRoundedRect(ctx, left + 44 * s, barY, barW, 38 * s, 19 * s);
          ctx.fill();
        }
      } else if (idx === 3) {
        const numBars = 9;
        const baseCy = ty + 30 * s;
        for (let b = 0; b < numBars; b++) {
          const wave = Math.abs(
            Math.sin(localFrame * 0.24 + b * 0.65) * 0.75 +
              beatPulse(loopF) * 0.25
          );
          const bh = (32 + wave * 165) * s;
          const bx = tx + (b - (numBars - 1) * 0.5) * 34 * s;
          ctx.fillStyle =
            b % 2 === 0 ? SHOWREEL_COLORS.orange : SHOWREEL_COLORS.ink;
          traceRoundedRect(
            ctx,
            bx - 10 * s,
            baseCy - bh * 0.5,
            20 * s,
            bh,
            10 * s
          );
          ctx.fill();
        }
      }

      ctx.restore();

      ctx.save();
      ctx.strokeStyle =
        idx === activeTileIdx
          ? SHOWREEL_COLORS.orange
          : 'rgba(244, 241, 234, 0.1)';
      ctx.lineWidth = (idx === activeTileIdx ? 5 : 2) * s;
      traceRoundedRect(ctx, left, top, tileSize, tileSize, tileR);
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }

  // ============================================================================
  // SCENE 5 (20 - 25s, frames 600..749): Terminal `npx remotion render` + 5 Film-Strip Thumbs
  // ============================================================================
  if (sceneIndex === 4 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'RENDERED BY CODE', centerX, 295 * s, localFrame, {
      fontSize: 72 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
    });

    const termLeft = heroCx - heroW * 0.5;
    const termTop = heroCy - heroH * 0.5;

    ctx.save();
    traceRoundedRect(ctx, termLeft, termTop, heroW, heroH, heroR);
    ctx.clip();

    const dotColors = [
      SHOWREEL_COLORS.orange,
      SHOWREEL_COLORS.blue,
      SHOWREEL_COLORS.ink,
    ];
    dotColors.forEach((dc, i) => {
      ctx.fillStyle = dc;
      ctx.beginPath();
      ctx.arc(
        termLeft + 52 * s + i * 32 * s,
        termTop + 48 * s,
        9 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    const cmdStr = '$ npx remotion render Showreel out/video.mp4';
    const cmdChars = Math.floor(
      clamp((localFrame - 6) * 2.4, 0, cmdStr.length)
    );
    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.font = `600 ${Math.round(26 * s)}px ${FONT_MONO}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cmdStr.slice(0, cmdChars), termLeft + 52 * s, termTop + 124 * s);

    const renderP = prog(localFrame, 18, 76, easeInOut);
    const curRenderedFrame = Math.round(renderP * 1638);
    const pct = Math.round(renderP * 100);

    ctx.fillStyle = SHOWREEL_COLORS.orange;
    ctx.font = `800 ${Math.round(112 * s)}px ${FONT_SANS}`;
    ctx.fillText(`${pct}%`, termLeft + 52 * s, termTop + 265 * s);

    ctx.fillStyle = SHOWREEL_COLORS.muted;
    ctx.font = `700 ${Math.round(28 * s)}px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(
      `FRAME ${String(curRenderedFrame).padStart(4, '0')} / 1638`,
      termLeft + heroW - 52 * s,
      termTop + 275 * s
    );

    const barX = termLeft + 52 * s;
    const barY = termTop + 345 * s;
    const barW = heroW - 104 * s;
    ctx.fillStyle = SHOWREEL_COLORS.card2;
    traceRoundedRect(ctx, barX, barY, barW, 28 * s, 14 * s);
    ctx.fill();

    if (renderP > 0.01) {
      ctx.fillStyle = SHOWREEL_COLORS.orange;
      traceRoundedRect(ctx, barX, barY, barW * renderP, 28 * s, 14 * s);
      ctx.fill();
    }

    const thumbW = 148 * s;
    const thumbH = 112 * s;
    const thumbGap = 18 * s;
    const thumbRowY = termTop + 425 * s;
    for (let i = 0; i < 5; i++) {
      const thumbAppear = sp(localFrame, 22 + i * 10, 18, 140, 0.9);
      const tx = barX + i * (thumbW + thumbGap);
      ctx.save();
      ctx.translate(tx + thumbW * 0.5, thumbRowY + thumbH * 0.5);
      ctx.scale(thumbAppear, thumbAppear);
      ctx.fillStyle =
        renderP >= (i + 1) * 0.19 ? SHOWREEL_COLORS.card2 : '#14141A';
      traceRoundedRect(
        ctx,
        -thumbW * 0.5,
        -thumbH * 0.5,
        thumbW,
        thumbH,
        18 * s
      );
      ctx.fill();
      ctx.strokeStyle =
        renderP >= (i + 1) * 0.19
          ? SHOWREEL_COLORS.orange
          : 'rgba(244, 241, 234, 0.12)';
      ctx.lineWidth = 2.5 * s;
      ctx.stroke();

      ctx.fillStyle =
        i % 2 === 0 ? SHOWREEL_COLORS.orange : SHOWREEL_COLORS.blue;
      ctx.beginPath();
      ctx.arc(0, 0, 22 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const doneP = sp(localFrame, 74, 18, 150, 0.9);
    if (doneP > 0.01) {
      ctx.save();
      const badgeY = termTop + 645 * s;
      ctx.globalAlpha *= clamp(doneP, 0, 1);
      ctx.fillStyle = 'rgba(255, 91, 31, 0.16)';
      traceRoundedRect(ctx, barX, badgeY - 40 * s, barW, 80 * s, 22 * s);
      ctx.fill();

      drawStrokeCheck(
        ctx,
        barX + 48 * s,
        badgeY,
        34 * s,
        prog(localFrame, 76, 92, easeOutExpo),
        SHOWREEL_COLORS.orange,
        6 * s
      );

      ctx.fillStyle = SHOWREEL_COLORS.ink;
      ctx.font = `700 ${Math.round(28 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'left';
      ctx.fillText('out/video.mp4 · 1080×1920 @ 30fps', barX + 86 * s, badgeY);
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  // ============================================================================
  // SCENE 6 (25 - 30s, frames 750..899): After Effects Keyframe Timeline Struck Out
  // ============================================================================
  if (sceneIndex === 5 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'NO MANUAL TIMELINES', centerX, 310 * s, localFrame, {
      fontSize: 64 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.6,
      outFrame: 122,
    });

    const tlLeft = heroCx - heroW * 0.5;
    const tlTop = heroCy - heroH * 0.5;

    ctx.save();
    traceRoundedRect(ctx, tlLeft, tlTop, heroW, heroH, heroR);
    ctx.clip();

    const layerNames = [
      'Position.X',
      'Position.Y',
      'Scale.XY',
      'Rotation.Z',
      'Radius.Px',
      'Opacity',
      'Blur.Sigma',
    ];

    const strikeP = prog(localFrame, 24, 68, easeOutExpo);
    const trackStartX = tlLeft + 245 * s;
    const trackEndX = tlLeft + heroW - 52 * s;

    for (let rIdx = 0; rIdx < 7; rIdx++) {
      const rowY = tlTop + 82 * s + rIdx * 76 * s;

      ctx.fillStyle = SHOWREEL_COLORS.muted;
      ctx.font = `600 ${Math.round(22 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(layerNames[rIdx], tlLeft + 42 * s, rowY);

      ctx.strokeStyle = 'rgba(244, 241, 234, 0.1)';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(trackStartX, rowY);
      ctx.lineTo(trackEndX, rowY);
      ctx.stroke();

      for (let cIdx = 0; cIdx < 6; cIdx++) {
        const dx = lerp(trackStartX + 36 * s, trackEndX - 36 * s, cIdx / 5);
        const killFrame = 28 + rIdx * 4 + cIdx * 4.5;
        const killP = sp(localFrame, killFrame, 18, 180, 0.9);
        const diaScale = clamp(1 - killP, 0, 1);

        if (diaScale > 0.02) {
          const dSize = 16 * s * diaScale;
          ctx.save();
          ctx.translate(dx, rowY);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle =
            (rIdx + cIdx) % 2 === 0
              ? SHOWREEL_COLORS.blue
              : SHOWREEL_COLORS.ink;
          ctx.fillRect(-dSize, -dSize, dSize * 2, dSize * 2);
          ctx.restore();
        }
      }
    }

    // Diagonal Orange Strike across the diamond keyframe area (keeping track names legible)
    if (strikeP > 0.01) {
      const x1 = trackStartX + 12 * s;
      const y1 = tlTop + 58 * s;
      const x2 = lerp(x1, trackEndX - 12 * s, strikeP);
      const y2 = lerp(y1, tlTop + heroH - 58 * s, strikeP);

      ctx.strokeStyle = SHOWREEL_COLORS.orange;
      ctx.lineWidth = 14 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();

    drawKinText(ctx, 'ZERO KEYFRAMES', centerX, 1215 * s, localFrame, {
      fontSize: 88 * s,
      color: SHOWREEL_COLORS.orange,
      delay: 32,
      stagger: 1.4,
      outFrame: 122,
    });

    ctx.restore();
  }

  // ============================================================================
  // SCENE 7 (30 - 35s, frames 900..1049): 4 Equation Pills on Beats (IDEA+SONNET+CODE=VIDEO)
  // ============================================================================
  if (sceneIndex === 6 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'THE WORKFLOW', centerX, 240 * s, localFrame, {
      fontSize: 68 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
    });

    const pillRows = [
      {
        beatFrame: 15,
        targetY: -305,
        label: '01 · RAW IDEA',
        tag: 'INPUT',
      },
      {
        beatFrame: 45,
        targetY: -115,
        label: '+ CLAUDE SONNET',
        tag: 'MODEL',
      },
      {
        beatFrame: 75,
        targetY: 75,
        label: '+ PURE CODE',
        tag: 'ENGINE',
      },
    ];

    const pillW = 780 * s;
    const pillH = 160 * s;
    const pillR = 80 * s;
    const iconPulse = 1 + 0.14 * beatPulse(loopF);

    pillRows.forEach((row, idx) => {
      const emergeP = sp(localFrame, row.beatFrame, 18, 140, 0.9);
      if (emergeP <= 0.01) return;

      const py = centerY + lerp(265, row.targetY, emergeP) * s;
      const px = centerX - pillW * 0.5;

      ctx.save();
      ctx.globalAlpha *= clamp(emergeP, 0, 1);
      ctx.fillStyle = SHOWREEL_COLORS.card;
      traceRoundedRect(ctx, px, py - pillH * 0.5, pillW, pillH, pillR);
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.12)';
      ctx.lineWidth = 2 * s;
      ctx.stroke();

      ctx.save();
      ctx.translate(px + 84 * s, py);
      ctx.scale(iconPulse, iconPulse);
      ctx.fillStyle =
        idx % 2 === 0 ? SHOWREEL_COLORS.blue : SHOWREEL_COLORS.orange;
      ctx.beginPath();
      ctx.arc(0, 0, 44 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = SHOWREEL_COLORS.ink;
      ctx.font = `800 ${Math.round(44 * s)}px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.label, px + 156 * s, py);

      ctx.fillStyle = SHOWREEL_COLORS.muted;
      ctx.font = `700 ${Math.round(22 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'right';
      ctx.fillText(row.tag, px + pillW - 56 * s, py);

      ctx.restore();
    });

    const revealVideo = localFrame >= 105;
    const flipScale = revealVideo
      ? 0.88 + 0.12 * sp(localFrame, 105, 16, 170, 0.9)
      : 1;

    if (localFrame >= 105) {
      const ringP = prog(localFrame, 105, 136, easeOutExpo);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 91, 31, ${(1 - ringP) * 0.75})`;
      ctx.lineWidth = 6 * s;
      traceRoundedRect(
        ctx,
        heroCx - (pillW * 0.5 + ringP * 90 * s),
        heroCy - (pillH * 0.5 + ringP * 55 * s),
        pillW + ringP * 180 * s,
        pillH + ringP * 110 * s,
        pillR + ringP * 40 * s
      );
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(heroCx, heroCy);
    ctx.scale(flipScale, flipScale);
    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.font = `900 ${Math.round(56 * s)}px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(revealVideo ? '= MOTION VIDEO' : '= ?', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  // ============================================================================
  // SCENE 8 (35 - 40s, frames 1050..1199): Dual-Spring Liquid Toggle (Stiffness 85 vs 230)
  // ============================================================================
  if (sceneIndex === 7 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    drawKinText(ctx, 'PURE CREATIVE CONTROL', centerX, 420 * s, localFrame, {
      fontSize: 68 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 1.8,
      outFrame: 122,
    });

    const pad = 28 * s;
    const knobH = heroH - pad * 2;
    const leftRestL = heroCx - heroW * 0.5 + pad;
    const leftRestR = leftRestL + knobH;
    const rightRestR = heroCx + heroW * 0.5 - pad;
    const rightRestL = rightRestR - knobH;

    const pLeft = sp(localFrame, 60, 17, 85, 0.9);
    const pRight = sp(localFrame, 60, 19, 230, 0.9);

    const curL = lerp(leftRestL, rightRestL, pLeft);
    const curR = lerp(leftRestR, rightRestR, pRight);
    const knobW = Math.max(knobH * 0.85, curR - curL);
    const knobX = Math.min(curL, curR);
    const knobY = heroCy - knobH * 0.5;

    ctx.save();
    ctx.fillStyle = SHOWREEL_COLORS.ink;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 24 * s;
    ctx.shadowOffsetY = 10 * s;
    traceRoundedRect(ctx, knobX, knobY, knobW, knobH, knobH * 0.5);
    ctx.fill();
    ctx.restore();

    if (localFrame >= 64) {
      const checkP = prog(localFrame, 66, 96, easeOutExpo);
      drawStrokeCheck(
        ctx,
        knobX + knobW * 0.5,
        heroCy,
        84 * s,
        checkP,
        SHOWREEL_COLORS.orange,
        12 * s
      );
    }

    const isFlipped = localFrame >= 60;
    ctx.fillStyle = isFlipped ? SHOWREEL_COLORS.orange : SHOWREEL_COLORS.muted;
    ctx.font = `700 ${Math.round(32 * s)}px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      isFlipped ? 'FREE PLAN · UNLIMITED MOTION' : 'PAID SUBSCRIPTION · OFF',
      centerX,
      1115 * s
    );

    ctx.restore();
  }

  // ============================================================================
  // SCENE 9 (40 - 45s, frames 1200..1349): Dashed "LIMIT" Box Broken + Beat Word Ticker
  // ============================================================================
  if (sceneIndex === 8 && phase.visible) {
    ctx.save();
    ctx.globalAlpha = phase.opacity;
    ctx.translate(0, phase.translateY * s);

    const breakP = prog(localFrame, 54, 72, easeOutExpo);
    if (breakP < 0.99) {
      const boxScale = 1 + breakP * 0.45;
      const limitW = 790 * s * boxScale;
      const limitH = 590 * s * boxScale;
      ctx.save();
      ctx.globalAlpha *= 1 - breakP;
      ctx.strokeStyle = SHOWREEL_COLORS.orange;
      ctx.lineWidth = 5 * s;
      ctx.setLineDash([18 * s, 14 * s]);
      traceRoundedRect(
        ctx,
        heroCx - limitW * 0.5,
        heroCy - limitH * 0.5,
        limitW,
        limitH,
        56 * s
      );
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = SHOWREEL_COLORS.orange;
      ctx.font = `800 ${Math.round(28 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'TEXT-ONLY LIMIT',
        heroCx,
        heroCy - limitH * 0.5 - 24 * s
      );
      ctx.restore();
    }

    ctx.save();
    traceRoundedRect(
      ctx,
      heroCx - heroW * 0.5,
      heroCy - heroH * 0.5,
      heroW,
      heroH,
      heroR
    );
    ctx.clip();

    if (localFrame < 54) {
      ctx.fillStyle = SHOWREEL_COLORS.ink;
      ctx.font = `800 ${Math.round(68 * s)}px ${FONT_SANS}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BEYOND CHAT', heroCx, heroCy);
    } else {
      const tickerWords = ['VIDEO', 'MOTION', 'SOUND', 'CODE', 'IDEAS'];
      const wordIdx = Math.min(
        tickerWords.length - 1,
        Math.floor((localFrame - 54) / 15)
      );
      const activeWord = tickerWords[wordIdx];
      const wordLocalF = (localFrame - 54) % 15;
      const wordPop = sp(wordLocalF, 0, 17, 180, 0.9);

      ctx.fillStyle = 'rgba(244, 241, 234, 0.78)';
      ctx.font = `700 ${Math.round(28 * s)}px ${FONT_MONO}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `CREATIVE MEDIUM · 0${wordIdx + 1} / 05`,
        heroCx,
        heroCy - 220 * s
      );

      ctx.save();
      ctx.translate(heroCx, heroCy);
      ctx.scale(0.84 + 0.16 * wordPop, 0.84 + 0.16 * wordPop);
      ctx.fillStyle = SHOWREEL_COLORS.ink;
      ctx.font = `900 ${Math.round(168 * s)}px ${FONT_SANS}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(activeWord, 0, 0);
      ctx.restore();

      for (let i = 0; i < tickerWords.length; i++) {
        const dotX = heroCx + (i - 2) * 76 * s;
        const dotY = heroCy + 240 * s;
        ctx.fillStyle =
          i === wordIdx ? SHOWREEL_COLORS.orange : 'rgba(244, 241, 234, 0.25)';
        traceRoundedRect(
          ctx,
          dotX - 28 * s,
          dotY - 8 * s,
          56 * s,
          16 * s,
          8 * s
        );
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.restore();
  }

  // ============================================================================
  // SCENE 10 (45 - 50s, frames 1350..1499): 3 Spiraling Orbiters -> 2D Square -> 3D Cube
  // ============================================================================
  if (sceneIndex === 9) {
    const spiralP = prog(localFrame, 4, 56, easeInOut);
    if (spiralP < 0.99) {
      const orbitRadius = (1 - spiralP) * 390 * s;
      const orbColors = [
        SHOWREEL_COLORS.ink,
        SHOWREEL_COLORS.blue,
        SHOWREEL_COLORS.orange,
      ];
      for (let i = 0; i < 3; i++) {
        const ang = localFrame * 0.15 + (i * Math.PI * 2) / 3;
        const ox = heroCx + Math.cos(ang) * orbitRadius;
        const oy = heroCy + Math.sin(ang) * orbitRadius;
        const oSize = (1 - spiralP * 0.6) * 34 * s;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(ang);
        ctx.fillStyle = orbColors[i];
        if (i === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, oSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (i === 1) {
          traceRoundedRect(
            ctx,
            -oSize,
            -oSize,
            oSize * 2,
            oSize * 2,
            8 * s
          );
          ctx.fill();
        } else {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-oSize, -oSize, oSize * 2, oSize * 2);
        }
        ctx.restore();
      }
    }

    if (is3DCubeActive) {
      const cp = prog(loopF, 1425, 1495, easeOutExpo);
      const rotY = 720 * cp;
      const rotX = 30 * Math.sin(Math.PI * cp);
      const cubeScale = 1 + 0.3 * Math.sin(Math.PI * cp);
      drawSeamless3DCube(
        ctx,
        heroCx,
        heroCy,
        300 * s,
        rotY,
        rotX,
        cubeScale,
        s
      );
    }

    if (phase.visible) {
      ctx.save();
      ctx.globalAlpha = phase.opacity;
      drawKinText(ctx, 'IDEAS INTO 3D', centerX, 340 * s, localFrame, {
        fontSize: 76 * s,
        color: SHOWREEL_COLORS.ink,
        delay: 8,
        stagger: 2.0,
        outFrame: 122,
      });
      ctx.restore();
    }
  }

  // ============================================================================
  // SCENE 11 (50 - 54.6s, frames 1500..1637): Kinetic Finale -> Pure Dot Loop Lock
  // ============================================================================
  if (sceneIndex === 10) {
    drawKinText(ctx, 'TUM AI SE', centerX, 490 * s, localFrame, {
      fontSize: 102 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 6,
      stagger: 2.0,
      outFrame: 94,
    });
    drawKinText(ctx, 'KYA CREATE', centerX, 625 * s, localFrame, {
      fontSize: 102 * s,
      color: SHOWREEL_COLORS.orange,
      delay: 16,
      stagger: 2.0,
      outFrame: 94,
    });
    drawKinText(ctx, 'KAROGE?', centerX, 1045 * s, localFrame, {
      fontSize: 112 * s,
      color: SHOWREEL_COLORS.ink,
      delay: 26,
      stagger: 2.0,
      outFrame: 94,
    });
  }

  // End Camera Transform
  ctx.restore();

  // 4. Scene Hit Line
  if (loopF >= 150 && loopF < 1620) {
    const modScene = loopF % 150;
    if (modScene < 14) {
      const hitP = prog(modScene, 0, 14, easeOutExpo);
      const hitY = lerp(120 * s, 1800 * s, hitP);
      const hitAlpha = Math.sin(hitP * Math.PI);
      ctx.save();
      ctx.fillStyle = SHOWREEL_COLORS.orange;
      ctx.globalAlpha = hitAlpha * 0.9;
      ctx.fillRect(0, hitY, width, 4 * s);
      ctx.restore();
    }
  }

  // 5. Word-by-Word SRT Captions in Safe Area
  drawSrtCaptions(ctx, loopF, width, s);

  ctx.restore();
  return audits;
}

/**
 * Multi-Subframe Motion Blur Wrapper
 */
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

export function renderFrameWithMotionBlur(
  ctx: CanvasRenderingContext2D,
  t: number,
  width: number = VIDEO_CONFIG.width,
  height: number = VIDEO_CONFIG.height,
  subframes: number = VIDEO_CONFIG.subframesPerFrame,
  options: RenderOptions = {}
): LayoutBoxAudit[] {
  if (subframes <= 1 || typeof document === 'undefined') {
    return renderFrame(ctx, t, width, height, options);
  }

  if (
    !offscreenCanvas ||
    offscreenCanvas.width !== width ||
    offscreenCanvas.height !== height
  ) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    offscreenCtx = offscreenCanvas.getContext('2d');
  }

  if (!offscreenCtx) {
    return renderFrame(ctx, t, width, height, options);
  }

  const shutterWindow = (1 / VIDEO_CONFIG.fps) * 0.5;
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  let lastAudits: LayoutBoxAudit[] = [];
  for (let i = 0; i < subframes; i++) {
    const offset =
      -shutterWindow * 0.5 + (shutterWindow * i) / (subframes - 1);
    const sampleT =
      (t + offset + VIDEO_CONFIG.durationSeconds) %
      VIDEO_CONFIG.durationSeconds;

    lastAudits = renderFrame(offscreenCtx, sampleT, width, height, options);
    ctx.globalAlpha = 1 / (i + 1);
    ctx.drawImage(offscreenCanvas, 0, 0);
  }

  ctx.restore();
  return lastAudits;
}
