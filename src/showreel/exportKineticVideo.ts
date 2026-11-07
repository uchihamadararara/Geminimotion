import { WordTimestamp, KineticScene } from './KineticAudioComposition';

export interface ExportKineticVideoOptions {
  words: WordTimestamp[];
  kineticScenes?: KineticScene[];
  detectedLanguage?: string;
  audioUrl?: string;
  sfxStemUrl?: string;
  onProgress?: (pct: number) => void;
}

export async function exportKineticVideoToFile({
  words,
  kineticScenes = [],
  detectedLanguage = 'Multilingual Speech',
  audioUrl,
  sfxStemUrl,
  onProgress,
}: ExportKineticVideoOptions): Promise<void> {
  const width = 1080;
  const height = 1920;
  const fps = 30;

  const lastWordEnd =
    words && words.length > 0 ? words[words.length - 1].endSec : 6;
  const durationSec = Math.max(4, Math.min(60, lastWordEnd + 1.0));
  const totalFrames = Math.ceil(durationSec * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Group words into phrases (4-5 words per chunk) matching KineticAudioComposition
  const phrases: WordTimestamp[][] = [];
  let currentChunk: WordTimestamp[] = [];
  for (let i = 0; i < words.length; i++) {
    currentChunk.push(words[i]);
    const text = words[i].word;
    const isBreak =
      text.endsWith('.') ||
      text.endsWith('!') ||
      text.endsWith('?') ||
      text.endsWith('।') ||
      text.endsWith(',') ||
      currentChunk.length >= 5;
    if (isBreak || i === words.length - 1) {
      phrases.push(currentChunk);
      currentChunk = [];
    }
  }

  const drawFrame = (frame: number) => {
    const currentTimeSec = frame / fps;

    // Find active word
    let activeWordIdx = -1;
    for (let i = 0; i < words.length; i++) {
      if (currentTimeSec >= words[i].startSec && currentTimeSec < words[i].endSec) {
        activeWordIdx = i;
        break;
      }
    }
    if (activeWordIdx === -1) {
      for (let i = words.length - 1; i >= 0; i--) {
        if (
          currentTimeSec >= words[i].endSec &&
          currentTimeSec < words[i].endSec + 0.35
        ) {
          activeWordIdx = i;
          break;
        }
      }
    }
    const activeWord = activeWordIdx >= 0 ? words[activeWordIdx] : null;

    // Active scene
    let activeScene: KineticScene = {
      id: 'scene-1',
      title: 'Kinetic Motion',
      startSec: 0,
      endSec: durationSec,
      headline: 'WORD-SYNC STUDIO',
      subheadline: 'Frame-Accurate Speech & Typography Engine',
      accentColor: '#38BDF8',
    };
    for (const s of kineticScenes) {
      if (currentTimeSec >= s.startSec && currentTimeSec < s.endSec) {
        activeScene = s;
        break;
      }
    }

    const currentAccent =
      activeWord?.accent || activeScene.accentColor || '#38BDF8';

    // 1. Background
    ctx.fillStyle = '#090A0F';
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center Radial Glow
    const grad = ctx.createRadialGradient(
      width / 2,
      height * 0.42,
      20,
      width / 2,
      height * 0.42,
      460
    );
    grad.addColorStop(0, `${currentAccent}33`);
    grad.addColorStop(1, 'rgba(9, 10, 15, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Top HUD
    ctx.fillStyle = 'rgba(20, 22, 30, 0.85)';
    ctx.beginPath();
    ctx.roundRect(48, 72, 420, 54, 27);
    ctx.fill();

    ctx.fillStyle = currentAccent;
    ctx.beginPath();
    ctx.arc(76, 99, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(detectedLanguage.toUpperCase().slice(0, 26), 96, 99);

    // 3. Scene Eyebrow
    ctx.fillStyle = activeScene.accentColor || '#38BDF8';
    ctx.font = '700 24px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${activeScene.title} · ${activeScene.headline}`.toUpperCase(),
      width / 2,
      height * 0.34
    );

    // 4. Hero Active Word Pop
    if (activeWord) {
      const isEmp = !!activeWord.emphasis;
      const fontSize = isEmp ? 104 : 84;
      ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
      const textWidth = ctx.measureText(activeWord.word).width;
      const boxW = Math.min(width - 96, textWidth + 90);
      const boxH = fontSize + 56;
      const boxX = (width - boxW) / 2;
      const boxY = height * 0.44 - boxH / 2;

      ctx.fillStyle = isEmp ? `${currentAccent}26` : 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = isEmp ? currentAccent : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isEmp ? currentAccent : '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(activeWord.word, width / 2, height * 0.44);
    }

    // 5. Active Phrase Stream
    let activePhrase: WordTimestamp[] = phrases[0] || [];
    for (const phrase of phrases) {
      const pStart = phrase[0].startSec;
      const pEnd = phrase[phrase.length - 1].endSec;
      if (currentTimeSec >= pStart - 0.2 && currentTimeSec <= pEnd + 0.6) {
        activePhrase = phrase;
        break;
      }
    }

    if (activePhrase.length > 0) {
      ctx.font = '700 42px Inter, system-ui, sans-serif';
      const phraseY = height * 0.58;
      const wordSpacings = activePhrase.map(
        (w) => ctx.measureText(w.word).width + 32
      );
      const totalRowWidth = wordSpacings.reduce((a, b) => a + b, 0);
      let cursorX = (width - totalRowWidth) / 2;

      activePhrase.forEach((w, idx) => {
        const wWidth = wordSpacings[idx];
        const isCurrent =
          currentTimeSec >= w.startSec && currentTimeSec < w.endSec;
        const isPast = currentTimeSec >= w.endSec;

        if (isCurrent) {
          ctx.fillStyle = w.accent || currentAccent;
          ctx.beginPath();
          ctx.roundRect(cursorX + 4, phraseY - 34, wWidth - 8, 68, 16);
          ctx.fill();
          ctx.fillStyle = '#000000';
        } else if (isPast) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w.word, cursorX + wWidth / 2, phraseY);
        cursorX += wWidth;
      });
    }

    // Subheadline
    if (activeScene.subheadline) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '500 24px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeScene.subheadline, width / 2, height * 0.66);
    }

    // 6. Bottom EQ Visualizer + Timecode
    const eqBaseY = height - 160;
    const barCount = 28;
    const barGap = 14;
    const totalBarsW = barCount * barGap;
    const startBarX = (width - totalBarsW) / 2;
    for (let b = 0; b < barCount; b++) {
      const seed = (b * 7.3 + frame * 0.45) % Math.PI;
      const barH = activeWord ? 16 + Math.abs(Math.sin(seed + b)) * 42 : 8;
      ctx.fillStyle = b % 3 === 0 ? currentAccent : 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.roundRect(startBarX + b * barGap, eqBaseY - barH, 8, barH, 4);
      ctx.fill();
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${currentTimeSec.toFixed(2)}s / ${durationSec.toFixed(1)}s · ${words.length} WORDS SYNCED`,
      width / 2,
      height - 90
    );
  };

  // Capture Canvas Stream
  const canvasStream = canvas.captureStream(fps);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  // Optional audio mixing (Voiceover + Real SFX Ducked Stem)
  const audioElements: HTMLAudioElement[] = [];
  let audioCtx: AudioContext | null = null;
  const urlsToMix = [audioUrl, sfxStemUrl].filter(Boolean) as string[];

  if (urlsToMix.length > 0) {
    try {
      audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();

      for (const u of urlsToMix) {
        try {
          const el = new Audio(u);
          el.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            el.oncanplaythrough = () => resolve();
            el.onerror = () => reject(new Error('Audio load error'));
            el.load();
          });
          const source = audioCtx.createMediaElementSource(el);
          source.connect(dest);
          audioElements.push(el);
        } catch {
          // continue if one track fails
        }
      }

      if (dest.stream.getAudioTracks().length > 0) {
        combinedTracks.push(...dest.stream.getAudioTracks());
      }
    } catch {
      // Proceed with video track if audio context fails
    }
  }

  const finalStream = new MediaStream(combinedTracks);
  const mimeType = MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

  const recorder = new MediaRecorder(finalStream, {
    mimeType,
    videoBitsPerSecond: 6_000_000,
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
  for (const el of audioElements) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }

  for (let f = 0; f <= totalFrames; f++) {
    drawFrame(f);
    if (onProgress) {
      onProgress(Math.min(99, Math.round((f / totalFrames) * 100)));
    }
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  for (const el of audioElements) {
    el.pause();
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
  }
  recorder.stop();

  const videoBlob = await recordingFinished;
  if (onProgress) onProgress(100);

  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kinetic-motion-${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}
