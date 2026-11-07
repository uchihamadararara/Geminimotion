import { ProceduralScene, ReelProject } from '../types/motion';
import { clamp, solveEasing } from './mathEasing';

/**
 * Renders a deterministic 9:16 frame (720x1280) to an HTML5 2D Canvas
 * for high-speed WebM/MP4 video export via MediaRecorder.
 */
export function drawReelFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: ProceduralScene,
  sceneProgress: number,
  globalTimeSec: number,
  sceneIndex: number
) {
  const t = clamp(sceneProgress, 0, 1);
  const ease = solveEasing(scene.easing, clamp(t * 1.4, 0, 1));

  ctx.save();

  // 1. Background fill
  if (scene.type === 'strobe-impact-words') {
    const words = scene.items.length > 0 ? scene.items : ['AND', 'WHERE', 'IT', 'GETS', 'CRAZY.'];
    const wordIdx = Math.min(words.length - 1, Math.floor(t * words.length));
    const isInverted = wordIdx % 2 === 0;
    ctx.fillStyle = isInverted ? scene.accentColor : '#08090D';
    ctx.fillRect(0, 0, width, height);

    // Corner frame markers
    ctx.fillStyle = isInverted ? '#08090D' : scene.accentColor;
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(`SEQ_0${sceneIndex + 1} // STROBE`, 48, 72);
    ctx.fillText(`FRM ${String(Math.floor(globalTimeSec * 60)).padStart(4, '0')}`, width - 170, 72);

    // Massive Strobe Word
    const activeWord = words[wordIdx] || scene.headline;
    ctx.font = '800 96px "Bricolage Grotesque", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(activeWord.toUpperCase(), width / 2, height / 2);
    ctx.restore();
    return;
  }

  // Standard background
  ctx.fillStyle = scene.bgColor || '#08090D';
  ctx.fillRect(0, 0, width, height);

  // Blueprint Grid for dark scenes
  if (scene.type !== 'paper-form-cutaway') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 36;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Header metadata
  const isPaper = scene.type === 'paper-form-cutaway';
  ctx.fillStyle = isPaper ? '#1E293B' : 'rgba(248, 250, 252, 0.55)';
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(scene.formHeader || `SCENE 0${sceneIndex + 1} · ${scene.type.toUpperCase()}`, 48, 76);

  // Laser comet trail
  const cometX = 48 + (width - 96) * clamp(t * 1.25, 0, 1);
  const cometY = 220;
  const grad = ctx.createLinearGradient(48, cometY, cometX, cometY);
  grad.addColorStop(0, 'rgba(255, 85, 0, 0)');
  grad.addColorStop(1, scene.accentColor);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(48, cometY);
  ctx.lineTo(cometX, cometY);
  ctx.stroke();

  ctx.fillStyle = scene.accentColor;
  ctx.beginPath();
  ctx.arc(cometX, cometY, 7, 0, Math.PI * 2);
  ctx.fill();

  // Headline
  ctx.fillStyle = isPaper ? '#0F172A' : '#F8FAFC';
  ctx.font = '800 54px "Bricolage Grotesque", sans-serif';
  wrapText(ctx, scene.headline, 48, 310 + (1 - ease) * 40, width - 96, 64);

  // Subheadline
  ctx.fillStyle = isPaper ? '#475569' : '#94A3B8';
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  wrapText(ctx, scene.subheadline, 48, 490 + (1 - ease) * 30, width - 96, 34);

  // Items / Nodes
  scene.items.forEach((item, idx) => {
    const itemReveal = clamp((t - idx * 0.14) * 2.5, 0, 1);
    if (itemReveal <= 0) return;
    const boxY = 630 + idx * 105;
    ctx.fillStyle = isPaper ? '#FFFFFF' : 'rgba(17, 19, 26, 0.9)';
    ctx.strokeStyle = idx === scene.strikeIndex ? '#DC2626' : scene.accentColor;
    ctx.lineWidth = 2;
    ctx.fillRect(48, boxY, (width - 96) * itemReveal, 78);
    ctx.strokeRect(48, boxY, (width - 96) * itemReveal, 78);

    ctx.fillStyle = isPaper ? '#0F172A' : '#F8FAFC';
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillText(item, 72, boxY + 46);

    if (idx === scene.strikeIndex && t > 0.45) {
      const strikeProgress = clamp((t - 0.45) * 2.5, 0, 1);
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(60, boxY + 39);
      ctx.lineTo(60 + (width - 120) * strikeProgress, boxY + 39);
      ctx.stroke();
    }
  });

  // Bottom Code / Equation Box
  if (scene.codeSnippet) {
    ctx.fillStyle = isPaper ? '#E2E8F0' : '#0D1017';
    ctx.fillRect(48, height - 210, width - 96, 130);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.strokeRect(48, height - 210, width - 96, 130);

    ctx.fillStyle = scene.accentColor;
    ctx.font = '500 18px "JetBrains Mono", monospace';
    const snippetLine = scene.codeSnippet.split('\n')[0].slice(0, 48);
    ctx.fillText(snippetLine, 70, height - 135);
  }

  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, currY);
      line = words[n] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currY);
}

export async function exportReelToVideo(
  project: ReelProject,
  onProgress: (percent: number) => void
): Promise<{ url: string; filename: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for export.');
  }

  const stream = canvas.captureStream(60);
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  const selectedMime =
    mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const totalDurationSec = project.scenes.reduce((acc, s) => acc + s.durationSec, 0);
  const fps = 30;
  const totalFrames = Math.max(1, Math.round(totalDurationSec * fps));

  return new Promise((resolve, reject) => {
    recorder.onerror = () => reject(new Error('Video recording failed.'));
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
      const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      resolve({ url, filename: `${safeTitle}-9x16.${ext}` });
    };

    recorder.start();

    let currentFrame = 0;
    const renderNextFrame = () => {
      if (currentFrame >= totalFrames) {
        recorder.stop();
        onProgress(100);
        return;
      }

      const globalSec = currentFrame / fps;
      let accumulated = 0;
      let activeScene = project.scenes[0];
      let activeIdx = 0;
      let localProgress = 0;

      for (let i = 0; i < project.scenes.length; i++) {
        const s = project.scenes[i];
        if (globalSec <= accumulated + s.durationSec || i === project.scenes.length - 1) {
          activeScene = s;
          activeIdx = i;
          localProgress = clamp((globalSec - accumulated) / Math.max(0.1, s.durationSec), 0, 1);
          break;
        }
        accumulated += s.durationSec;
      }

      drawReelFrameToCanvas(
        ctx,
        canvas.width,
        canvas.height,
        activeScene,
        localProgress,
        globalSec,
        activeIdx
      );

      currentFrame++;
      onProgress(Math.round((currentFrame / totalFrames) * 100));
      setTimeout(renderNextFrame, 1000 / fps);
    };

    renderNextFrame();
  });
}
