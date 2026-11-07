import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import {
  buildSketchSongProject,
  renderSketchFrame,
  DEFAULT_INAAM_LYRICS,
  KISI_GHAZAL_AUDIO_URL,
  KISI_GHAZAL_DURATION_SEC,
  SketchVignetteType,
} from '../src/sketchVideo/sketchCanvasEngine';

async function main() {
  const rootDir = process.cwd();
  const rendersDir = path.join(rootDir, 'public', 'renders');
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  // Register attractive Calligraphic Devanagari fonts from public/fonts/
  const customFonts: Array<{ file: string; family: string }> = [
    { file: path.join(rootDir, 'public', 'fonts', 'Amita-Bold.ttf'), family: 'Amita' },
    { file: path.join(rootDir, 'public', 'fonts', 'Amita-Regular.ttf'), family: 'Amita' },
    { file: path.join(rootDir, 'public', 'fonts', 'YatraOne-Regular.ttf'), family: 'Yatra One' },
    { file: path.join(rootDir, 'public', 'fonts', 'RozhaOne-Regular.ttf'), family: 'Rozha One' },
    { file: path.join(rootDir, 'public', 'fonts', 'Kalam-Bold.ttf'), family: 'Kalam' },
    { file: '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf', family: 'Noto Sans Devanagari' },
  ];
  for (const cf of customFonts) {
    if (fs.existsSync(cf.file)) {
      try {
        GlobalFonts.registerFromPath(cf.file, cf.family);
        console.log(`Registered font [${cf.family}]:`, path.basename(cf.file));
      } catch {
        // ignore
      }
    }
  }

  console.log('[1/4] Loading the 6 generated pencil-sketch illustrations from public/sketch-scenes/...');
  const sceneFiles: Record<SketchVignetteType, string> = {
    window_boy: path.join(rootDir, 'public', 'sketch-scenes', 'scene_1.jpg'),
    rain_lamp: path.join(rootDir, 'public', 'sketch-scenes', 'scene_2.jpg'),
    shop_counter: path.join(rootDir, 'public', 'sketch-scenes', 'scene_3.jpg'),
    night_room: path.join(rootDir, 'public', 'sketch-scenes', 'scene_4.jpg'),
    train_window: path.join(rootDir, 'public', 'sketch-scenes', 'scene_5.jpg'),
    teacups_sill: path.join(rootDir, 'public', 'sketch-scenes', 'scene_6.jpg'),
  };

  const loadedImages: Partial<Record<SketchVignetteType, any>> = {};
  for (const [key, filePath] of Object.entries(sceneFiles) as Array<[SketchVignetteType, string]>) {
    if (fs.existsSync(filePath)) {
      loadedImages[key] = await loadImage(filePath);
      console.log(`      Loaded ${key} -> ${path.basename(filePath)} (${loadedImages[key].width}x${loadedImages[key].height})`);
    } else {
      console.warn(`      Missing scene image: ${filePath}`);
    }
  }

  const project = buildSketchSongProject({
    title: 'जिवें किसी ग़ज़ल दी धुन',
    artist: 'Sketchbook Acoustic Session',
    lyricsText: DEFAULT_INAAM_LYRICS,
    durationSec: KISI_GHAZAL_DURATION_SEC,
    audioUrl: KISI_GHAZAL_AUDIO_URL,
  });

  const audioFilePath = path.join(rootDir, 'public', 'assets', 'aistudio', 'kisigajal_26a21b29.mp3');
  const masterMp4Path = path.join(rendersDir, 'kisi-ghazal-1080p-master.mp4');
  const whatsappMp4Path = path.join(rendersDir, 'kisi-ghazal-720p-whatsapp.mp4');

  const width = 1280;
  const height = 720;
  const fps = 30;
  const totalFrames = Math.ceil(project.durationSec * fps);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  console.log(`[2/4] Rendering ${totalFrames} frames (${width}x${height} @ ${fps}fps, ${project.durationSec}s) with generated sketch images + -500ms synced lyrics...`);

  const ffmpegArgs = [
    '-y',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${width}x${height}`,
    '-r',
    String(fps),
    '-i',
    '-',
    '-i',
    audioFilePath,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    'veryfast',
    '-crf',
    '19',
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-shortest',
    '-movflags',
    '+faststart',
    masterMp4Path,
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

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    renderSketchFrame(ctx as any, project, t, width, height, loadedImages);
    const rawRgba = canvas.data();

    const canWrite = ffmpeg.stdin.write(rawRgba);
    if (!canWrite) {
      await new Promise<void>((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    if ((f + 1) % 180 === 0 || f + 1 === totalFrames) {
      console.log(`      Frame ${f + 1} / ${totalFrames} (t = ${t.toFixed(2)}s)`);
    }
  }

  ffmpeg.stdin.end();
  await ffmpegDone;

  console.log('[3/4] Creating 720p WhatsApp copy (<20 MB) with original audio...');
  execSync(
    `ffmpeg -y -i "${masterMp4Path}" -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 23 -c:a aac -b:a 160k -movflags +faststart "${whatsappMp4Path}"`
  );

  const masterStat = fs.statSync(masterMp4Path);
  const waStat = fs.statSync(whatsappMp4Path);
  console.log(
    `[4/4] Done! Master MP4: ${(masterStat.size / (1024 * 1024)).toFixed(2)} MB | WhatsApp MP4: ${(waStat.size / (1024 * 1024)).toFixed(2)} MB`
  );
}

main().catch((err) => {
  console.error('Sketch MP4 render failed:', err);
  process.exit(1);
});
