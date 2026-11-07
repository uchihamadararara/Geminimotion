import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import { VIDEO_CONFIG, BEAT_GRID_STATES } from '../src/engine/scriptAndStoryboard';
import { renderFrame } from '../src/engine/renderFrame';
import {
  synthesizeProceduralTrackPCM,
  AUDIO_SAMPLE_RATE,
} from '../src/engine/proceduralAudio';

function writeWavFile(filePath: string, samples: Float32Array) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = AUDIO_SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(AUDIO_SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff);
    buffer.writeInt16LE(int16, offset);
    offset += 2;
  }

  fs.writeFileSync(filePath, buffer);
}

async function main() {
  const rootDir = process.cwd();
  const wavPath = path.join(rootDir, 'out-audio.wav');
  const mp4Path = path.join(rootDir, 'out.mp4');
  const publicMp4Path = path.join(rootDir, 'public', 'out.mp4');
  const qaDir = path.join(rootDir, 'public', 'qa-frames');

  if (!fs.existsSync(qaDir)) {
    fs.mkdirSync(qaDir, { recursive: true });
  } else {
    for (const f of fs.readdirSync(qaDir)) {
      fs.unlinkSync(path.join(qaDir, f));
    }
  }

  console.log(
    `[1/4] Synthesizing 120 BPM (54.60s, 1638 frames, 11 Scenes) soundtrack -> out-audio.wav...`
  );
  const pcm = synthesizeProceduralTrackPCM(VIDEO_CONFIG.durationSeconds);
  writeWavFile(wavPath, pcm);

  const width = VIDEO_CONFIG.width;
  const height = VIDEO_CONFIG.height;
  const mainCanvas = createCanvas(width, height);
  const mainCtx = mainCanvas.getContext('2d');

  console.log(
    `[2/4] Rendering midpoint QA frames for all 11 scenes (+ loop boundaries) to public/qa-frames/...`
  );
  for (const step of BEAT_GRID_STATES) {
    const sampleT = step.midFrame / VIDEO_CONFIG.fps;
    renderFrame(mainCtx as any, sampleT, width, height);
    const sceneNum = String(step.bar).padStart(2, '0');
    const fileName = `scene_${sceneNum}_mid_f${step.midFrame}.png`;
    fs.writeFileSync(path.join(qaDir, fileName), mainCanvas.toBuffer('image/png'));
  }

  // Verify exact loop closure at Frame 0 (t=0.00s) and Frame 1638 (t=54.60s)
  renderFrame(mainCtx as any, 0.0, width, height);
  const startBuf = mainCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(qaDir, 'loop_frame_0000.png'), startBuf);

  renderFrame(mainCtx as any, VIDEO_CONFIG.durationSeconds, width, height);
  const endBuf = mainCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(qaDir, 'loop_frame_1638.png'), endBuf);

  const loopIdentical = startBuf.equals(endBuf);
  console.log(
    `      Loop closure check (Frame 0 === Frame 1638): ${loopIdentical ? 'IDENTICAL ✓' : 'MISMATCH'}`
  );

  console.log(
    `[3/4] Rendering & muxing ${VIDEO_CONFIG.totalFrames} frames (1080x1920 @ 30fps, 54.60s) into out.mp4...`
  );

  const ffmpegArgs = [
    '-y',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${width}x${height}`,
    '-r',
    String(VIDEO_CONFIG.fps),
    '-i',
    '-',
    '-i',
    wavPath,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    'fast',
    '-crf',
    '18',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    mp4Path,
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['pipe', 'ignore', 'pipe'],
  });

  let stderrLog = '';
  ffmpeg.stderr.on('data', (chunk) => {
    stderrLog += chunk.toString();
  });

  const ffmpegDone = new Promise<void>((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderrLog}`));
    });
  });

  for (let f = 0; f < VIDEO_CONFIG.totalFrames; f++) {
    const t = f / VIDEO_CONFIG.fps;
    renderFrame(mainCtx as any, t, width, height);
    const rawRgba = mainCanvas.data();

    const canWrite = ffmpeg.stdin.write(rawRgba);
    if (!canWrite) {
      await new Promise<void>((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    if ((f + 1) % 300 === 0 || f + 1 === VIDEO_CONFIG.totalFrames) {
      console.log(
        `      Rendered frame ${f + 1} / ${VIDEO_CONFIG.totalFrames} (t = ${t.toFixed(2)}s)`
      );
    }
  }

  ffmpeg.stdin.end();
  await ffmpegDone;

  fs.copyFileSync(mp4Path, publicMp4Path);
  const stat = fs.statSync(mp4Path);
  console.log(
    `[4/4] Verified out.mp4 created (${(stat.size / (1024 * 1024)).toFixed(2)} MB) at ${mp4Path}`
  );
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
