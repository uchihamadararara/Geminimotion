/**
 * 11-Scene / 1638-Frame (54.60s @ 30fps, 120 BPM) Showreel Storyboard & SRT Captions
 * Built directly to the specification in SHOWREEL_KAISE_BANAYA.md:
 * - Size: 1080 x 1920 (vertical Reels)
 * - FPS: 30 (1 beat = 0.5s = 15 frames)
 * - Length: 1638 frames = 54.60s (10 scenes × 150 frames + Scene 11 × 138 frames)
 * - Palette: bg #0A0A0D, card #16161C, ink #F4F1EA, orange #FF5B1F, blue #3D5BFF
 */

export const VIDEO_CONFIG = {
  fps: 30,
  bpm: 120,
  beatDuration: 0.5, // 15 frames
  beatFrames: 15,
  barDuration: 2.0, // 60 frames
  sceneFrames: 150, // 5.0s = 10 beats per scene
  totalBars: 27,
  totalBeats: 11, // 11 major scenes for QA inspection
  durationSeconds: 54.6, // 1638 / 30 = 54.60s
  totalFrames: 1638,
  width: 1080,
  height: 1920,
  safeMarginPx: 64,
  subframesPerFrame: 2,
} as const;

export const PALETTE = {
  bg: '#0A0A0D',
  card: '#16161C',
  card2: '#22222B',
  terminal: '#0F0F14',
  ink: '#F4F1EA',
  muted: '#8A8A96',
  orange: '#FF5B1F',
  blue: '#3D5BFF',
  // Compatibility aliases
  canvasBg: '#0A0A0D',
  canvasEdge: '#060608',
  obsidianBg: '#0A0A0D',
  blueprintBg: '#0F0F14',
  inkBlack: '#0A0A0D',
  surfaceDark: '#16161C',
  pureWhite: '#F4F1EA',
  accentOrange: '#FF5B1F',
  textOnDark: '#F4F1EA',
  textMutedOnDark: '#8A8A96',
} as const;

export interface SrtCaptionCue {
  sceneNumber: number;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  text: string;
}

/**
 * 11 SRT Cues (5.0s each, last cue ends at frame 1622 so frame 1638 has zero caption for loop match)
 */
export const SRT_CAPTIONS: SrtCaptionCue[] = [
  {
    sceneNumber: 1,
    startSec: 0.2,
    endSec: 5.0,
    startFrame: 6,
    endFrame: 150,
    text: 'AI sirf answers dene ke liye nahi hai, ab wo poora motion video bana sakta hai.',
  },
  {
    sceneNumber: 2,
    startSec: 5.0,
    endSec: 10.0,
    startFrame: 150,
    endFrame: 300,
    text: 'Aur sabse badi baat? Ye sab bilkul FREE plan par possible hai.',
  },
  {
    sceneNumber: 3,
    startSec: 10.0,
    endSec: 15.0,
    startFrame: 300,
    endFrame: 450,
    text: 'Maine bas apna raw idea Claude ko diya, aur usne poora animation code likh diya.',
  },
  {
    sceneNumber: 4,
    startSec: 15.0,
    endSec: 20.0,
    startFrame: 450,
    endFrame: 600,
    text: 'Kinetic typography, smooth shapes, transitions aur sound effects — sab ek saath.',
  },
  {
    sceneNumber: 5,
    startSec: 20.0,
    endSec: 25.0,
    startFrame: 600,
    endFrame: 750,
    text: 'Ye poora video bina kisi video editor ke, seedha code se render hua hai.',
  },
  {
    sceneNumber: 6,
    startSec: 25.0,
    endSec: 30.0,
    startFrame: 750,
    endFrame: 900,
    text: 'Na After Effects kholna pada, na ghanton baith kar keyframes drag karne pade.',
  },
  {
    sceneNumber: 7,
    startSec: 30.0,
    endSec: 35.0,
    startFrame: 900,
    endFrame: 1050,
    text: 'Ek simple idea, Sonnet ka dimaag, thoda sa code — aur video aapke saamne hai.',
  },
  {
    sceneNumber: 8,
    startSec: 35.0,
    endSec: 40.0,
    startFrame: 1050,
    endFrame: 1200,
    text: 'Koi mehenga software nahi, koi paid plan nahi — bas pure creative control.',
  },
  {
    sceneNumber: 9,
    startSec: 40.0,
    endSec: 45.0,
    startFrame: 1200,
    endFrame: 1350,
    text: 'AI ab sirf content tak limited nahi hai — ye ek naya creative medium hai.',
  },
  {
    sceneNumber: 10,
    startSec: 45.0,
    endSec: 50.0,
    startFrame: 1350,
    endFrame: 1500,
    text: 'Apne ideas ko real, 3D aur cinematic animation me badalna ab aapke haath me hai.',
  },
  {
    sceneNumber: 11,
    startSec: 50.0,
    endSec: 54.0,
    startFrame: 1500,
    endFrame: 1620,
    text: 'Toh batao — ab tum AI se kya create karoge?',
  },
];

export interface BeatGridStep {
  beatIndex: number; // 0 .. 10 (11 Scenes)
  bar: number; // Scene number 1 .. 11
  beatInBar: number;
  label: string; // e.g. "S01"
  startTime: number; // Seconds
  endTime: number; // Seconds
  frameStart: number; // 0, 150, 300 ...
  frameEnd: number; // 149, 299 ...
  midFrame: number; // Midpoint frame for visual QA
  formatName: string;
  uiStateId: string;
  uiStateTitle: string;
  dimensionsLabel: string;
  cursorAction: string;
  springMechanism: string;
  soundCue: string;
}

export const BEAT_GRID_STATES: BeatGridStep[] = [
  {
    beatIndex: 0,
    bar: 1,
    beatInBar: 1,
    label: 'S01',
    startTime: 0.0,
    endTime: 5.0,
    frameStart: 0,
    frameEnd: 149,
    midFrame: 75,
    formatName: 'Scene 01 · Video Card + Circle-to-Square Morph',
    uiStateId: 'scene-01-video-card',
    uiStateTitle: '"AI = ANSWERS" Struck Out -> Video Card + Play Morph -> "MOTION VIDEO"',
    dimensionsLabel: 'Hero: 36×36 Dot -> 860×484 Card (r=44, #16161C)',
    cursorAction: 'Play button press + circle-to-square morph (r=48->12, rot 200°) + blue bar wipe',
    springMechanism: 'K(0)->K(14) sum-of-springs + Kin masked letters + orange strike bar',
    soundCue: 'Kick starts @ 1.0s + Beat Pulse Rings',
  },
  {
    beatIndex: 1,
    bar: 2,
    beatInBar: 1,
    label: 'S02',
    startTime: 5.0,
    endTime: 10.0,
    frameStart: 150,
    frameEnd: 299,
    midFrame: 225,
    formatName: 'Scene 02 · FREE Plan Orange Card (₹999 -> ₹0)',
    uiStateId: 'scene-02-free-card',
    uiStateTitle: 'Hero Morphs to 760×760 Orange Card · Tabular ₹999 -> ₹0 + Check',
    dimensionsLabel: 'Hero: 760×760 Square Card (r=120, #FF5B1F)',
    cursorAction: 'Tabular-nums price countdown (frames 22..74) + stroke checkmark draw',
    springMechanism: 'K(150) spring morph + easeInOut price counter + stroke-dashoffset check',
    soundCue: '5.0s Scene Boom + Offbeat Hats & Clap + Sub Bass',
  },
  {
    beatIndex: 2,
    bar: 3,
    beatInBar: 1,
    label: 'S03',
    startTime: 10.0,
    endTime: 15.0,
    frameStart: 300,
    frameEnd: 449,
    midFrame: 385,
    formatName: 'Scene 03 · Claude Prompt + Syntax-Colored Code Window',
    uiStateId: 'scene-03-code-window',
    uiStateTitle: 'Prompt Letter-by-Letter Type + Send Pulse + 4 Syntax Code Lines',
    dimensionsLabel: 'Hero: 900×720 Window (r=48, #16161C)',
    cursorAction: 'Types prompt -> Send button beat pulse -> 4 TypeScript lines (cps 1.7)',
    springMechanism: 'K(300) window morph + deterministic character-by-character typing',
    soundCue: '10.0s Scene Boom + A-Minor Pentatonic Plucks + Typing Foley',
  },
  {
    beatIndex: 3,
    bar: 4,
    beatInBar: 1,
    label: 'S04',
    startTime: 15.0,
    endTime: 20.0,
    frameStart: 450,
    frameEnd: 599,
    midFrame: 525,
    formatName: 'Scene 04 · 2×2 Bento Tiles (Type, Orbit, Wipe, SFX)',
    uiStateId: 'scene-04-bento-tiles',
    uiStateTitle: 'Hero Becomes Tile 1; Tiles 2–4 Spring Out with Live Math Demos',
    dimensionsLabel: 'Hero: 420×420 at (-225, -245) + 3 Sibling 420×420 Tiles',
    cursorAction: 'Every 25 frames highlights active tile (1: Wave, 2: Orbit, 3: Wipe, 4: SFX)',
    springMechanism: 'K(450) corner morph + staggered spring spawn from hero origin',
    soundCue: '15.0s Scene Boom + Tile Highlight Sync',
  },
  {
    beatIndex: 4,
    bar: 5,
    beatInBar: 1,
    label: 'S05',
    startTime: 20.0,
    endTime: 25.0,
    frameStart: 600,
    frameEnd: 749,
    midFrame: 695,
    formatName: 'Scene 05 · Remotion CLI Terminal Render (0 -> 1638)',
    uiStateId: 'scene-05-terminal',
    uiStateTitle: '`npx remotion render` + 0->1638 Frame Counter + 5 Film-Strip Thumbs',
    dimensionsLabel: 'Hero: 920×780 Terminal (r=40, #0F0F14)',
    cursorAction: 'Progress bar fills 0->100%, 5 film-strip thumbs light up, out/video.mp4 check',
    springMechanism: 'K(600) terminal morph + tabular frame counter + sequential thumb springs',
    soundCue: '20.0s Scene Boom + Rapid Render Progress Ticks',
  },
  {
    beatIndex: 5,
    bar: 6,
    beatInBar: 1,
    label: 'S06',
    startTime: 25.0,
    endTime: 30.0,
    frameStart: 750,
    frameEnd: 899,
    midFrame: 835,
    formatName: 'Scene 06 · After Effects Keyframe Timeline Struck Out',
    uiStateId: 'scene-06-ae-timeline',
    uiStateTitle: '7×6 Keyframe Diamonds + Diagonal Orange Strike -> "ZERO KEYFRAMES"',
    dimensionsLabel: 'Hero: 940×640 Timeline Panel (r=36, #16161C)',
    cursorAction: 'Diagonal orange line slashes 42 diamonds; each diamond scales to 0 after strike',
    springMechanism: 'K(750) panel morph + diagonal strike prog + staggered diamond pop-out',
    soundCue: '25.0s Scene Boom + 28–30s Tension Riser Sweep',
  },
  {
    beatIndex: 6,
    bar: 7,
    beatInBar: 1,
    label: 'S07',
    startTime: 30.0,
    endTime: 35.0,
    frameStart: 900,
    frameEnd: 1049,
    midFrame: 1015,
    formatName: 'Scene 07 · 4-Beat Equation Stack (IDEA + SONNET + CODE = VIDEO)',
    uiStateId: 'scene-07-equation-pills',
    uiStateTitle: '4 Equation Pills Spawn on Beats 15/45/75/105 -> "= VIDEO" + Ring',
    dimensionsLabel: 'Hero: 780×160 Pill 4 at y=+265 (#FF5B1F) + 3 Stack Pills',
    cursorAction: 'Pills emerge from Hero pill on exact beats; icons pulse every 15 frames',
    springMechanism: 'K(900) pill morph + beat-locked spring emergence + expanding shockwave ring',
    soundCue: '30.0s Scene Boom + Beat-Synced Pill Pops',
  },
  {
    beatIndex: 7,
    bar: 8,
    beatInBar: 1,
    label: 'S08',
    startTime: 35.0,
    endTime: 40.0,
    frameStart: 1050,
    frameEnd: 1199,
    midFrame: 1125,
    formatName: 'Scene 08 · Dual-Spring Liquid Toggle (Stiffness 85 vs 230)',
    uiStateId: 'scene-08-liquid-toggle',
    uiStateTitle: 'Two-Spring Liquid Knob Stretches Mid-Flip -> Orange Track + Check',
    dimensionsLabel: 'Hero: 640×330 Toggle Track (r=165, #22222B -> #FF5B1F)',
    cursorAction: 'Left edge (stiffness 85) lags right edge (stiffness 230) for liquid stretch',
    springMechanism: 'K(1050)->K(1110) color morph + dual-edge spring knob + stroke check',
    soundCue: '35.0s Scene Boom + Liquid Toggle Snap @ 37.0s',
  },
  {
    beatIndex: 8,
    bar: 9,
    beatInBar: 1,
    label: 'S09',
    startTime: 40.0,
    endTime: 45.0,
    frameStart: 1200,
    frameEnd: 1349,
    midFrame: 1285,
    formatName: 'Scene 09 · Dashed "LIMIT" Box Shattered + Beat Word Ticker',
    uiStateId: 'scene-09-break-limits',
    uiStateTitle: 'Hero Breaks Out of Dashed Limit Box @ Frame 54 + 15-Frame Word Ticker',
    dimensionsLabel: 'Hero: 700×500 -> 960×1140 Full-Stage Blue (#3D5BFF)',
    cursorAction: 'Dashed LIMIT box scales up & vanishes; ticker slams VIDEO/MOTION/SOUND/CODE/IDEAS',
    springMechanism: 'K(1200)->K(1254) breakout spring + 15-frame beat-synced word ticker',
    soundCue: '40.0s Scene Boom + Limit Breakout Impact @ 41.8s',
  },
  {
    beatIndex: 9,
    bar: 10,
    beatInBar: 1,
    label: 'S10',
    startTime: 45.0,
    endTime: 50.0,
    frameStart: 1350,
    frameEnd: 1499,
    midFrame: 1450,
    formatName: 'Scene 10 · 3 Spiraling Orbiters + Seamless 2D-to-3D Cube',
    uiStateId: 'scene-10-3d-cube',
    uiStateTitle: '3 Orbiters Spiral In -> Circle to Square -> 720° 3D Rotating Cube',
    dimensionsLabel: 'Hero: 300×300 (r=150 -> 70 -> 14) -> Seamless 3D Cube Swap',
    cursorAction: 'At f=1425, 2D square swaps seamlessly to 3D cube (rotY 720°, rotX 30°·sin)',
    springMechanism: 'K(1350..1405) radius morph + 3D perspective projection (f=1425..1495)',
    soundCue: '45.0s Scene Boom + 47.5–50.0s High-Energy Riser',
  },
  {
    beatIndex: 10,
    bar: 11,
    beatInBar: 1,
    label: 'S11',
    startTime: 50.0,
    endTime: 54.6,
    frameStart: 1500,
    frameEnd: 1637,
    midFrame: 1555,
    formatName: 'Scene 11 · Kinetic Finale ("TUM AI SE KYA CREATE KAROGE?") -> Dot Loop',
    uiStateId: 'scene-11-finale-loop',
    uiStateTitle: 'Cube Collapses to 36×36 Dot + Masked Kinetic Finale -> Frame 1638 === 0',
    dimensionsLabel: 'Hero: 36×36 Orange Dot (r=18, #FF5B1F) · Loop Identical',
    cursorAction: 'All letters exit upward by localFrame 94..122 leaving pure dot at f=1638',
    springMechanism: 'K(1500) dot collapse + Kin masked rise & exit (out=94) + cam=1, drift=0',
    soundCue: '50.0s Final Boom + 0.8s Master Loop Fade-Out',
  },
];

export function getBeatStepAtTime(t: number): BeatGridStep {
  const clampedFrame = Math.max(
    0,
    Math.min(VIDEO_CONFIG.totalFrames - 1, Math.floor(t * VIDEO_CONFIG.fps))
  );
  const idx = Math.min(
    BEAT_GRID_STATES.length - 1,
    Math.floor(clampedFrame / VIDEO_CONFIG.sceneFrames)
  );
  return BEAT_GRID_STATES[idx];
}
