import fs from 'node:fs';
import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { VIDEO_CONFIG, BEAT_GRID_STATES } from '../src/engine/scriptAndStoryboard';
import { renderFrame } from '../src/engine/renderFrame';

async function main() {
  const rootDir = process.cwd();
  const qaDir = path.join(rootDir, 'public', 'qa-frames');

  if (!fs.existsSync(qaDir)) {
    fs.mkdirSync(qaDir, { recursive: true });
  }

  const width = VIDEO_CONFIG.width;
  const height = VIDEO_CONFIG.height;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  console.log('Rendering 11 scene midpoint QA frames...');
  for (const step of BEAT_GRID_STATES) {
    const sampleT = step.midFrame / VIDEO_CONFIG.fps;
    renderFrame(ctx as any, sampleT, width, height);
    const sceneNum = String(step.bar).padStart(2, '0');
    const fileName = `scene_${sceneNum}_mid_f${step.midFrame}.png`;
    fs.writeFileSync(path.join(qaDir, fileName), canvas.toBuffer('image/png'));
    console.log(`✓ Saved ${fileName}`);
  }

  // Loop closure check at Frame 0 and Frame 1638
  renderFrame(ctx as any, 0.0, width, height);
  const startBuf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(qaDir, 'loop_frame_0000.png'), startBuf);

  renderFrame(ctx as any, VIDEO_CONFIG.durationSeconds, width, height);
  const endBuf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(qaDir, 'loop_frame_1638.png'), endBuf);

  const loopIdentical = startBuf.equals(endBuf);
  console.log(`Loop closure check (Frame 0 === Frame 1638): ${loopIdentical ? 'IDENTICAL ✓' : 'MISMATCH'}`);
}

main().catch(console.error);
