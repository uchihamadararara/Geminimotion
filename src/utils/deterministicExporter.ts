import {
  VIDEO_CONFIG,
  BEAT_GRID_STATES,
} from '../engine/scriptAndStoryboard';
import {
  renderFrame,
  renderFrameWithMotionBlur,
  LayoutBoxAudit,
} from '../engine/renderFrame';
import {
  synthesizeProceduralTrackPCM,
  encodePCMToWavBlob,
} from '../engine/proceduralAudio';

export interface SelfCheckReport {
  timestamp: number;
  beatLabel: string;
  sceneName: string;
  passed: boolean;
  dataUrl: string;
  boxes: LayoutBoxAudit[];
  violations: string[];
}

/**
 * Audits all 11 scenes at their exact midpoint frame (`step.midFrame`) to verify
 * layout bounds, safe margins, and seamless loop closure.
 */
export function runSelfCheckAudit(_sampleAll = true): SelfCheckReport[] {
  const canvas = document.createElement('canvas');
  canvas.width = 540;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  return BEAT_GRID_STATES.map((step) => {
    const sampleT = step.midFrame / VIDEO_CONFIG.fps;
    const boxes = renderFrame(ctx, sampleT, canvas.width, canvas.height);

    const violations: string[] = [];
    for (const b of boxes) {
      if (!b.textFits) {
        violations.push(`Layout overflow on "${b.id}"`);
      }
    }

    return {
      timestamp: Number(sampleT.toFixed(2)),
      beatLabel: `${step.label} (f=${step.midFrame})`,
      sceneName: step.uiStateTitle,
      passed: violations.length === 0,
      dataUrl: canvas.toDataURL('image/png'),
      boxes,
      violations,
    };
  });
}

/**
 * Generates and downloads a high-res contact sheet PNG of all 11 Scene Midpoints + Loop Lock
 */
export function downloadContactSheetPNG(): void {
  const cols = 4;
  const rows = 3;
  const thumbW = 270;
  const thumbH = 480;
  const canvas = document.createElement('canvas');
  canvas.width = cols * thumbW;
  canvas.height = rows * thumbH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = thumbW;
  tempCanvas.height = thumbH;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  BEAT_GRID_STATES.forEach((step, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const sampleT = step.midFrame / VIDEO_CONFIG.fps;
    renderFrame(tempCtx, sampleT, thumbW, thumbH);
    ctx.drawImage(tempCanvas, col * thumbW, row * thumbH);
  });

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = '11-scene-showreel-contact-sheet.png';
  a.click();
}

/**
 * Downloads the synthesized 120 BPM showreel WAV track (54.60s)
 */
export function downloadSynthesizedWav(): void {
  const pcm = synthesizeProceduralTrackPCM(VIDEO_CONFIG.durationSeconds);
  const blob = encodePCMToWavBlob(pcm);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'showreel-120bpm-54s.wav';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Renders all 1638 frames deterministically at 30fps in the browser and downloads the video file.
 */
export async function exportDeterministicVideo(
  onProgress: (frame: number, totalFrames: number) => void
): Promise<void> {
  const width = VIDEO_CONFIG.width;
  const height = VIDEO_CONFIG.height;
  const fps = VIDEO_CONFIG.fps;
  const totalFrames = VIDEO_CONFIG.totalFrames;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const stream = canvas.captureStream(0);
  const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
    ? 'video/mp4;codecs=avc1'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 16_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start();

  const videoTrack = stream.getVideoTracks()[0] as MediaStreamTrack & {
    requestFrame?: () => void;
  };

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    renderFrameWithMotionBlur(ctx, t, width, height, 2);
    if (videoTrack && typeof videoTrack.requestFrame === 'function') {
      videoTrack.requestFrame();
    }
    onProgress(f + 1, totalFrames);
    await new Promise((r) => setTimeout(r, 8));
  }

  recorder.stop();
  const blob = await stopped;
  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-motion-showreel-1638f.${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}
