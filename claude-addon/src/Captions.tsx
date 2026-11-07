import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FPS, TOTAL, prog, sp} from './lib';

// [start, end, text] in seconds — straight from the SRT
const CUES: [number, number, string][] = [
  [0, 5, 'Socho, agar tumhara AI sirf answers nahi, balki poori motion graphics video bhi create'],
  [5, 10, 'kar sake! Aur sabse interesting baat? Ye video maine Claude ke FREE plan ki help se'],
  [10, 15, 'banayi hai! Haan, bilkul free! Maine Claude Sonnet ko apna idea diya, aur usne'],
  [15, 20, 'code ke through motion graphics create karne mein meri help ki. Kinetic typography,'],
  [20, 25, 'animated graphics, smooth transitions aur sound effects. Ye sab code ke through possible hai.'],
  [25, 30, 'Na After Effects ki zaroorat, na manually har frame animate karne ka headache.'],
  [30, 35, 'Bas ek idea, Claude Sonnet, code aur rendering! Aur sabse khaas baat,'],
  [35, 40, 'maine ye experiment Claude ke free plan par kiya, bina kisi paid'],
  [40, 45, 'subscription ke. AI sirf content generate karne tak limited nahi hai.'],
  [45, 50, 'Sahi approach ke saath, ye tumhare ideas ko actual animations mein bhi badal sakta hai.'],
  [50, 54.596, 'Ab tum batao, agar tumhare paas aisi power ho, toh tum AI se kya create karoge?'],
];

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = CUES.findIndex(([a, b]) => frame >= Math.round(a * FPS) && frame < Math.round(b * FPS));
  if (idx < 0) return null;
  const [a, b, text] = CUES[idx];
  const s = Math.round(a * FPS);
  const e = Math.round(b * FPS);
  const words = text.split(' ');
  const span = (e - s) * 0.82;
  const out = prog(frame, e - 7, e - 1) ;
  const endFade = frame > TOTAL - 12 ? prog(frame, TOTAL - 12, TOTAL - 1) : 0;
  const opacity = idx === CUES.length - 1 ? 1 - endFade : 1 - out;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 1440,
        height: 380,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'center',
        columnGap: 16,
        rowGap: 6,
        opacity,
        translate: `0 ${-out * 14}px`,
      }}
    >
      {words.map((w, i) => {
        const t0 = s + 4 + Math.round((i * span) / words.length);
        const p = sp(frame, t0, 18, 160);
        const hot = frame >= t0 && frame < t0 + 14;
        return (
          <span
            key={i}
            style={{
              fontWeight: 700,
              fontSize: 48,
              lineHeight: 1.28,
              letterSpacing: '-0.01em',
              color: hot ? C.orange : C.ink,
              opacity: p,
              translate: `0 ${(1 - p) * 22}px`,
              visibility: frame < t0 ? 'hidden' : 'visible',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
