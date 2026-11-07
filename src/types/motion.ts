export type GeminiModelId =
  | 'gemini-4-argon'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite';

export interface ModelOption {
  id: GeminiModelId;
  label: string;
  badge: string;
  description: string;
  thinkingMode: string;
}

export type SceneType =
  | 'laser-blueprint-hook'
  | 'kinetic-blur-stack'
  | 'wireframe-3d-prompt'
  | 'strobe-impact-words'
  | 'paper-form-cutaway'
  | 'code-math-inspector'
  | 'ui-3d-walkthrough'
  | 'live-code-typing';

export type EasingType =
  | 'bezier-smooth'
  | 'spring-snappy'
  | 'expo-out'
  | 'elastic-bounce'
  | 'linear';

export interface CameraRig {
  zoom: number;      // e.g. 0.85 to 1.6
  rotateX: number;   // -35 to 35 deg
  rotateY: number;   // -35 to 35 deg
  rotateZ: number;   // -15 to 15 deg
  panX: number;      // -120 to 120 px
  panY: number;      // -120 to 120 px
}

export interface ProceduralScene {
  id: string;
  type: SceneType;
  title: string;
  durationSec: number;
  headline: string;
  subheadline: string;
  accentColor: string;
  bgColor: string;
  easing: EasingType;
  camera: CameraRig;
  /** Words for strobe cuts, flowchart nodes, checklist items, or dropdown options */
  items: string[];
  /** Code snippet or mathematical formula displayed in code/inspector/3D prompt scenes */
  codeSnippet: string;
  /** Document header or secondary tag for paper form / blueprint scenes */
  formHeader?: string;
  /** Optional index of item to cross out in red (e.g. After Effects in flowchart/form) */
  strikeIndex?: number;
}

export interface CodeDiffItem {
  sceneTitle: string;
  parameter: string;
  before: string;
  after: string;
}

export interface ChatTweakEntry {
  id: string;
  timestamp: string;
  prompt: string;
  modelUsed: string;
  summary: string;
  diffs: CodeDiffItem[];
}

export interface ReelProject {
  id: string;
  title: string;
  subtitle: string;
  fps: number;
  aspectRatio: '9:16';
  selectedModel: GeminiModelId;
  globalAccent: string;
  scenes: ProceduralScene[];
}
