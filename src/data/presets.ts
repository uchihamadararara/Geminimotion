import { ModelOption, ProceduralScene, ReelProject, SceneType } from '../types/motion';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-4-argon',
    label: 'Gemini 4 Argon',
    badge: 'Flagship Reasoning',
    description: 'Deep procedural choreography, 3D camera math, and multi-scene narrative timing.',
    thinkingMode: 'Thinking: HIGH',
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    badge: 'Balanced Studio',
    description: 'Fast, high-precision scene generation and natural-language procedural diffing.',
    thinkingMode: 'Thinking: HIGH',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Low Latency',
    description: 'Instant single-scene tweaks, color swaps, and rapid kinetic text iterations.',
    thinkingMode: 'Thinking: MINIMAL',
  },
];

export const SCENE_TYPE_CATALOG: {
  type: SceneType;
  label: string;
  category: string;
  description: string;
}[] = [
  {
    type: 'laser-blueprint-hook',
    label: 'Laser Blueprint & Flowchart',
    category: 'Reference Video 2',
    description: 'Dark coordinate grid with glowing orange comet trail, glowing text reveal, and node flowchart.',
  },
  {
    type: 'kinetic-blur-stack',
    label: 'Vertical Blur Kinetic Stack',
    category: 'Reference Video 2',
    description: 'Massive bold display typography slamming in with directional vertical motion blur and spring settle.',
  },
  {
    type: 'wireframe-3d-prompt',
    label: '3D Perspective Grid & Prompt',
    category: 'Reference Video 2',
    description: 'Tilted 3D floor wireframe with rotating geometric polyhedra and live prompt terminal typing.',
  },
  {
    type: 'strobe-impact-words',
    label: 'Orange Strobe Impact Cuts',
    category: 'Reference Video 2',
    description: 'Full-bleed solar orange and black frame-synced word flashes for maximum visual punch.',
  },
  {
    type: 'paper-form-cutaway',
    label: 'Paper Form 2-B / 9 Cutaway',
    category: 'Reference Video 2',
    description: 'Brutalist vintage technical form with typewriter text, red marker strikethrough, and live checkboxes.',
  },
  {
    type: 'code-math-inspector',
    label: 'Procedural Code & Math Split',
    category: 'Reference Video 2',
    description: 'Live mathematical easing code paired with real-time shape morphing, Bezier graph, and parameter diffs.',
  },
  {
    type: 'ui-3d-walkthrough',
    label: '3D Camera UI Walkthrough',
    category: 'Reference Video 1',
    description: 'Warm dark glowing prompt interface with 3D camera pan, animated model dropdown, and cursor click.',
  },
  {
    type: 'live-code-typing',
    label: 'Live IDE Code & Starburst',
    category: 'Reference Video 1',
    description: 'Syntax-highlighted C/TypeScript code typing with spinning starburst emblem and kinetic callouts.',
  },
];

export const PRESET_REELS: ReelProject[] = [
  {
    id: 'preset-procedural-explainer',
    title: 'Procedural Motion vs After Effects',
    subtitle: '9:16 Vertical Replica of Reference Video 2 (Blueprint + Laser + Form 2-B)',
    fps: 60,
    aspectRatio: '9:16',
    selectedModel: 'gemini-4-argon',
    globalAccent: '#FF5500',
    scenes: [
      {
        id: 's1-laser-hook',
        type: 'laser-blueprint-hook',
        title: '01. Laser Comet Hook',
        durationSec: 2.6,
        headline: 'What if I told you...',
        subheadline: 'you can create motion graphics without opening After Effects?',
        accentColor: '#FF5500',
        bgColor: '#08090D',
        easing: 'bezier-smooth',
        camera: { zoom: 1.04, rotateX: 4, rotateY: -3, rotateZ: 0, panX: 0, panY: 0 },
        items: ['AI ENGINE', 'PROCEDURAL CODE', 'AFTER EFFECTS'],
        codeSnippet: 'cubic-bezier(0.16, 1.0, 0.3, 1.0)',
        formHeader: 'SEQ_01 · LASER PATH EMITTER',
        strikeIndex: 2,
      },
      {
        id: 's2-kinetic-stack',
        type: 'kinetic-blur-stack',
        title: '02. Vertical Blur Impact',
        durationSec: 2.2,
        headline: 'MOTION GRAPHICS',
        subheadline: 'PROCEDURAL ENGINE 5.5',
        accentColor: '#FF5500',
        bgColor: '#08090D',
        easing: 'spring-snappy',
        camera: { zoom: 1.12, rotateX: 0, rotateY: 0, rotateZ: -1, panX: 0, panY: 0 },
        items: ['ZERO KEYFRAMES', 'PURE VECTOR MATH', '60 FPS DETERMINISTIC', 'INFINITE RESOLUTION'],
        codeSnippet: 'blurY = Math.abs(velocity) * 0.42;',
        formHeader: 'DIRECTIONAL VELOCITY BLUR',
      },
      {
        id: 's3-3d-prompt',
        type: 'wireframe-3d-prompt',
        title: '03. 3D Grid Prompt Terminal',
        durationSec: 2.8,
        headline: 'Tell the AI what you want:',
        subheadline: '3D PERSPECTIVE VIEWPORT',
        accentColor: '#FF5500',
        bgColor: '#07080C',
        easing: 'expo-out',
        camera: { zoom: 1.08, rotateX: 14, rotateY: -8, rotateZ: 0, panX: 0, panY: -10 },
        items: ['kinetic typography', 'smooth shape transitions', '3D elements', 'seamless camera'],
        codeSnippet:
          '> "Create a 15-second cinematic motion graphics sequence with kinetic typography, smooth shape transitions, 3D elements and seamless camera movement."',
        formHeader: 'PROMPT_TERMINAL · 3D_GRID',
      },
      {
        id: 's4-strobe-cuts',
        type: 'strobe-impact-words',
        title: '04. Orange Strobe Word Cuts',
        durationSec: 1.8,
        headline: 'AND WHERE IT GETS CRAZY.',
        subheadline: 'HIGH-CONTRAST FRAME CUTS',
        accentColor: '#FF5500',
        bgColor: '#FF5500',
        easing: 'linear',
        camera: { zoom: 1.0, rotateX: 0, rotateY: 0, rotateZ: 0, panX: 0, panY: 0 },
        items: ['AND', 'THIS IS', 'WHERE', 'IT GETS', 'CRAZY.'],
        codeSnippet: 'frame % 12 === 0 ? invertStrobe() : hold()',
        formHeader: '60FPS STROBE CUT',
      },
      {
        id: 's5-code-math',
        type: 'code-math-inspector',
        title: '05. Mathematical Code Split',
        durationSec: 3.0,
        headline: 'It writes the animation itself as code.',
        subheadline: 'Every visual element is defined mathematically over time.',
        accentColor: '#FF5500',
        bgColor: '#08090D',
        easing: 'bezier-smooth',
        camera: { zoom: 1.02, rotateX: 2, rotateY: 2, rotateZ: 0, panX: 0, panY: 0 },
        items: ['shapes', 'positions', 'particles', 'easing(t)'],
        codeSnippet: `export function renderFrame(t: number) {
  const ease = cubicBezier(0.16, 1, 0.3, 1)(t);
  const x = x0 + (x1 - x0) * ease;
  const morph = Math.sin(t * Math.PI);
  return drawProceduralStage({ x, morph, ease });
}`,
        formHeader: 'x(t) = x₀ + (x₁ - x₀) · ease(t)',
      },
      {
        id: 's6-paper-form',
        type: 'paper-form-cutaway',
        title: '06. Form 2-B Pipeline Cutaway',
        durationSec: 2.8,
        headline: 'FORM 2-B — PRODUCTION PIPELINE',
        subheadline: 'REVISED EDITION · PROCEDURAL MOTION WORKFLOW',
        accentColor: '#DC2626',
        bgColor: '#F4F1EA',
        easing: 'spring-snappy',
        camera: { zoom: 1.0, rotateX: 2, rotateY: -2, rotateZ: -0.5, panX: 0, panY: 0 },
        items: [
          'After Effects → Layers → Keyframes → Graph Editor',
          'Prompt → Procedural Code → 60fps Render → Video',
          '✓ Kinetic typography & diagrams',
          '✓ Procedural loops & live diffs',
        ],
        codeSnippet: 'STATUS: MANUAL KEYFRAMING ELIMINATED',
        formHeader: 'FORM 2-B · DEPT OF MOTION ENGINEERING',
        strikeIndex: 0,
      },
      {
        id: 's7-finale',
        type: 'kinetic-blur-stack',
        title: '07. Pretty Insane Finale',
        durationSec: 2.2,
        headline: 'PRETTY INSANE.',
        subheadline: 'FROM IDEA TO WORKING ANIMATION WITHOUT TOUCHING A TIMELINE',
        accentColor: '#FF5500',
        bgColor: '#08090D',
        easing: 'elastic-bounce',
        camera: { zoom: 1.15, rotateX: 0, rotateY: 0, rotateZ: 0, panX: 0, panY: 0 },
        items: ['IDEA → WORKING ANIMATION', 'PROCEDURAL DIFFS', 'LIVE 60FPS CODE', 'EXPORT READY'],
        codeSnippet: 'loopSeamless(sceneGraph, { fps: 60 });',
        formHeader: 'FINAL SEQUENCE · 9:16 REEL',
      },
    ],
  },
  {
    id: 'preset-ui-code-walkthrough',
    title: '3D UI & Live Code Launch Reel',
    subtitle: '9:16 Vertical Replica of Reference Video 1 (3D Camera UI + Dropdown + Live Code)',
    fps: 60,
    aspectRatio: '9:16',
    selectedModel: 'gemini-4-argon',
    globalAccent: '#E07A5F',
    scenes: [
      {
        id: 'v1-s1-ui-welcome',
        type: 'ui-3d-walkthrough',
        title: '01. 3D UI Welcome & Model Selector',
        durationSec: 3.2,
        headline: 'Welcome',
        subheadline: 'Help me in coding high-precision systems...',
        accentColor: '#E07A5F',
        bgColor: '#120C09',
        easing: 'bezier-smooth',
        camera: { zoom: 1.18, rotateX: 12, rotateY: -14, rotateZ: 1, panX: -12, panY: 8 },
        items: [
          'Argon 4.0 · Most capable for ambitious work',
          'Flash 3.8 · Most efficient for everyday tasks',
          'Flash Lite 3.1 · Fastest for quick answers',
          'Extended thinking · Think longer for complex tasks',
        ],
        codeSnippet: 'model.select("gemini-4-argon", { extendedThinking: true })',
        formHeader: '3D CAMERA RIG · UI WALKTHROUGH',
      },
      {
        id: 'v1-s2-live-code',
        type: 'live-code-typing',
        title: '02. Live Code Stream & Starburst',
        durationSec: 3.0,
        headline: 'Help me in coding',
        subheadline: 'REAL-TIME PROCEDURAL CODE SYNTHESIS',
        accentColor: '#E07A5F',
        bgColor: '#100A07',
        easing: 'expo-out',
        camera: { zoom: 1.06, rotateX: 6, rotateY: 10, rotateZ: 0, panX: 8, panY: 0 },
        items: ['struct User', 'generateScore()', 'displayUsers()', 'findTopUser()'],
        codeSnippet: `// Structure for user data
struct User {
  char name[50];
  int score;
};

// Function to generate random score
int generateScore() {
  return rand() % 100 + 1;
}

// Function to find highest score
void findTopUser(struct User users[], int count) {
  int maxIndex = 0;
  for (int i = 1; i < count; i++) {
    if (users[i].score > users[maxIndex].score)
      maxIndex = i;
  }
}`,
        formHeader: 'LIVE_COMPILER · 60FPS STREAM',
      },
      {
        id: 'v1-s3-beat-cuts',
        type: 'strobe-impact-words',
        title: '03. Rapid Beat Capability Cuts',
        durationSec: 2.0,
        headline: 'Writing analysis · coding · research',
        subheadline: 'BEAT-SYNCED CAPABILITY FLASH',
        accentColor: '#E07A5F',
        bgColor: '#0E0907',
        easing: 'spring-snappy',
        camera: { zoom: 1.05, rotateX: 0, rotateY: 0, rotateZ: 0, panX: 0, panY: 0 },
        items: ['Writing analysis', 'coding', 'architecture', 'research', 'shipped.'],
        codeSnippet: 'beatCut(60, ["Writing analysis", "coding", "research"])',
        formHeader: 'RHYTHM CUT SEQUENCE',
      },
      {
        id: 'v1-s4-outro',
        type: 'kinetic-blur-stack',
        title: '04. Starburst Kinetic Finale',
        durationSec: 2.2,
        headline: 'NEXT-GEN INTELLIGENCE',
        subheadline: 'BUILT ENTIRELY IN CODE · ZERO KEYFRAMES',
        accentColor: '#E07A5F',
        bgColor: '#0B0806',
        easing: 'elastic-bounce',
        camera: { zoom: 1.1, rotateX: 0, rotateY: 0, rotateZ: 0, panX: 0, panY: 0 },
        items: ['3D PERSPECTIVE RIG', 'SPRING PHYSICS', 'LIVE CODE TYPING', '9:16 REEL READY'],
        codeSnippet: 'renderStarburst({ blades: 12, spin: "cubic-bezier" })',
        formHeader: 'FINALE LOCKUP',
      },
    ],
  },
  {
    id: 'preset-ai-saas-launch',
    title: 'Autonomous AI Engineering Reel',
    subtitle: 'High-Velocity 9:16 Tech Storyteller Template',
    fps: 60,
    aspectRatio: '9:16',
    selectedModel: 'gemini-3.8-flash',
    globalAccent: '#FF5500',
    scenes: [
      {
        id: 'p3-s1',
        type: 'strobe-impact-words',
        title: '01. Hook Strobe',
        durationSec: 1.6,
        headline: 'STOP MOVING KEYFRAMES.',
        subheadline: 'PROCEDURAL REELS ENGINE',
        accentColor: '#FF5500',
        bgColor: '#FF5500',
        easing: 'linear',
        camera: { zoom: 1.0, rotateX: 0, rotateY: 0, rotateZ: 0, panX: 0, panY: 0 },
        items: ['STOP', 'DRAGGING', 'HUNDREDS', 'OF', 'KEYFRAMES.'],
        codeSnippet: 'keyframes.clearAll()',
        formHeader: 'HOOK_01',
      },
      {
        id: 'p3-s2',
        type: 'laser-blueprint-hook',
        title: '02. Laser Architecture Flow',
        durationSec: 2.5,
        headline: 'Prompt → Math → 60fps Video',
        subheadline: 'Every transition is solved by physics equations.',
        accentColor: '#FF5500',
        bgColor: '#08090D',
        easing: 'bezier-smooth',
        camera: { zoom: 1.06, rotateX: 6, rotateY: -6, rotateZ: 0, panX: 0, panY: 0 },
        items: ['NATURAL PROMPT', 'GEMINI 4 ARGON', 'MANUAL TIMELINE'],
        codeSnippet: 'spring({ stiffness: 320, damping: 24 })',
        formHeader: 'PIPELINE BLUEPRINT',
        strikeIndex: 2,
      },
      {
        id: 'p3-s3',
        type: 'code-math-inspector',
        title: '03. Live Diff & Curve Inspector',
        durationSec: 2.8,
        headline: 'Modify animations with plain language.',
        subheadline: 'Instant procedural code diffs without re-rendering pixels.',
        accentColor: '#FF5500',
        bgColor: '#08090D',
        easing: 'spring-snappy',
        camera: { zoom: 1.04, rotateX: 0, rotateY: 0, rotateZ: 0, panX: 0, panY: 0 },
        items: ['transition: smoother', 'accent: #FF5500', 'speed: 0.85x', 'loop: seamless'],
        codeSnippet: `- transition: easeLinear(t)
+ transition: cubicBezier(0.16, 1, 0.3, 1)(t)
- color: "#ffffff"
+ color: "#FF5500"`,
        formHeader: 'PROCEDURAL DIFF ENGINE',
      },
    ],
  },
];

export function generateSceneCode(scene: ProceduralScene, index: number): string {
  return `// Scene ${String(index + 1).padStart(2, '0')}: ${scene.title} (${scene.type})
// Duration: ${scene.durationSec.toFixed(2)}s @ 60fps (${Math.round(scene.durationSec * 60)} frames)
import { motion } from "motion/react";

export function Scene_${index + 1}_Component({ progress }: { progress: number }) {
  // Mathematical Easing Solver (${scene.easing})
  const easeT = solveProceduralEase("${scene.easing}", progress);

  // 3D Camera Matrix Transform
  const cameraMatrix = {
    scale: ${scene.camera.zoom.toFixed(2)} + easeT * 0.06,
    rotateX: ${scene.camera.rotateX} * (1 - easeT * 0.35),
    rotateY: ${scene.camera.rotateY} * (1 - easeT * 0.35),
    rotateZ: ${scene.camera.rotateZ},
    x: ${scene.camera.panX},
    y: ${scene.camera.panY},
  };

  return (
    <motion.section
      style={{
        aspectRatio: "9 / 16",
        backgroundColor: "${scene.bgColor}",
        perspective: "1200px",
      }}
    >
      <motion.div style={cameraMatrix}>
        {/* Headline: "${scene.headline}" */}
        <h1 style={{ color: "${scene.accentColor}" }}>
          {renderKineticHeadline("${scene.headline.replace(/"/g, '\\"')}", easeT)}
        </h1>
        {/* Procedural Items: ${JSON.stringify(scene.items)} */}
      </motion.div>
    </motion.section>
  );
}`;
}
