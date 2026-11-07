import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {C, CX, CY, easeIO, ease, prog, sp} from './lib';
import {At, Kin, Phase} from './ui';

// 9 — break out of the limit
const WORDS = ['VIDEO', 'MOTION', 'SOUND', 'CODE', 'IDEAS'];
export const S9: React.FC = () => {
  const f = useCurrentFrame();
  const burst = prog(f, 54, 82);
  return (
    <Phase from={6} to={150}>
      <At w={780} h={580} style={{scale: String(1 + 0.9 * burst), opacity: (1 - burst) * sp(f, 4)}}>
        <svg width="780" height="580" style={{position: 'absolute', inset: 0}}>
          <rect x="10" y="10" width="760" height="560" rx="70" fill="none" stroke={C.ink} strokeOpacity="0.55" strokeWidth="4" strokeDasharray="16 14" strokeDashoffset={-f * 0.8} />
        </svg>
        <div style={{position: 'absolute', left: 40, top: -22, padding: '8px 22px', background: C.bg, border: `2px solid ${C.ink}`, borderRadius: 30, fontWeight: 700, fontSize: 24, color: C.ink, letterSpacing: '0.12em'}}>LIMIT</div>
      </At>
      <At y={0}><Kin text="CONTENT" size={124} delay={8} out={50} /></At>
      <At y={-300} style={{opacity: prog(f, 70, 82), fontWeight: 700, fontSize: 36, letterSpacing: '0.35em', color: C.ink}}>BEYOND</At>
      {WORDS.map((w, i) => {
        const s = 72 + i * 15;
        const inn = prog(f, s, s + 9);
        const out = i < 4 ? prog(f, s + 11, s + 15, Easing.in(Easing.cubic)) : 0;
        if (inn <= 0 || out >= 1) return null;
        const y = (1 - inn) * 90 - out * 90;
        const bl = (1 - inn) * 10 + out * 10;
        return (
          <At key={w} y={y} style={{fontWeight: 900, fontSize: 200, letterSpacing: '-0.04em', color: C.ink, opacity: inn * (1 - out), filter: bl > 0.3 ? `blur(${bl}px)` : undefined}}>
            {w}
          </At>
        );
      })}
      <At y={230} w={600} h={10} style={{background: 'rgba(255,255,255,0.22)', borderRadius: 5, justifyContent: 'flex-start', opacity: prog(f, 70, 82)}}>
        <div style={{width: `${prog(f, 72, 147, Easing.linear) * 100}%`, height: '100%', background: C.ink, borderRadius: 5}} />
      </At>
    </Phase>
  );
};

// 10 — 2D -> 3D (hero square becomes the front face of the cube)
const FACES: {t: string; bg: string; g: string}[] = [
  {t: 'translateZ(150px)', bg: C.orange, g: ''},
  {t: 'rotateY(90deg) translateZ(150px)', bg: C.blue, g: 'ring'},
  {t: 'rotateY(180deg) translateZ(150px)', bg: C.ink, g: 'tri'},
  {t: 'rotateY(-90deg) translateZ(150px)', bg: C.orangeD, g: 'sq'},
  {t: 'rotateX(90deg) translateZ(150px)', bg: C.blueD, g: 'dot'},
  {t: 'rotateX(-90deg) translateZ(150px)', bg: C.card2, g: 'bars'},
];
const Glyph: React.FC<{g: string}> = ({g}) => {
  const base: React.CSSProperties = {position: 'absolute', left: 90, top: 90, width: 120, height: 120};
  if (g === 'ring') return <div style={{...base, borderRadius: 60, border: `14px solid ${C.ink}`}} />;
  if (g === 'tri') return <div style={{...base, background: C.orange, clipPath: 'polygon(50% 0,100% 100%,0 100%)'}} />;
  if (g === 'sq') return <div style={{...base, background: C.ink, borderRadius: 12, rotate: '45deg', width: 100, height: 100, left: 100, top: 100}} />;
  if (g === 'dot') return <div style={{...base, borderRadius: 60, background: C.ink}} />;
  if (g === 'bars') return <div style={{...base, background: `repeating-linear-gradient(90deg, ${C.orange} 0 18px, transparent 18px 36px)`}} />;
  return null;
};

export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const cp = prog(f, 75, 145, Easing.bezier(0.16, 1, 0.3, 1));
  const cube = f >= 75 && f < 145;
  const R = 330 * (1 - prog(f, 25, 75, easeIO));
  return (
    <>
      <Phase from={6} to={150}>
        <At y={-440}>
          <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
            <Kin text="IDEA" size={84} delay={6} />
            <svg width="70" height="50" viewBox="0 0 90 60"><path d="M4 30h70M54 8l22 22-22 22" stroke={C.mute} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(f, 12, 28)} /></svg>
            <Kin text="ANIMATION" size={84} color={C.orange} delay={22} />
          </div>
        </At>
        {[0, 1, 2].map((k) => {
          const a = f * 0.12 + k * 2.094;
          const s = sp(f, 12 + k * 4) * (R > 1 ? 1 : 0);
          return (
            <At key={k} x={Math.cos(a) * R} y={Math.sin(a) * R * 0.9} style={{scale: String(s * (0.4 + R / 330 * 0.6)), translate: '-50% -50%'}}>
              {k === 0 && <div style={{width: 60, height: 60, borderRadius: 30, background: C.blue}} />}
              {k === 1 && <div style={{width: 52, height: 52, background: C.ink, rotate: `${f * 4}deg`, borderRadius: 8}} />}
              {k === 2 && <div style={{width: 60, height: 60, borderRadius: 30, border: `8px solid ${C.ink}`}} />}
            </At>
          );
        })}
      </Phase>
      {cube && (
        <div style={{position: 'absolute', left: CX - 150, top: CY - 150, width: 300, height: 300, perspective: 1500}}>
          <div style={{width: 300, height: 300, position: 'relative', transformStyle: 'preserve-3d', transform: `scale(${1 + 0.3 * Math.sin(Math.PI * cp)}) rotateX(${30 * Math.sin(Math.PI * cp)}deg) rotateY(${720 * cp}deg)`}}>
            {FACES.map((fc, i) => (
              <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 14, background: fc.bg, transform: fc.t}}>
                <Glyph g={fc.g} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// 11 — end title
export const S11: React.FC = () => {
  const o = 94; // all letters must be gone before frame 138 so the last frame == first frame
  return (
    <>
      <At y={-455}><Kin text="TUM AI SE" size={60} weight={700} color={C.mute} delay={10} out={o} /></At>
      <At y={-330}><Kin text="KYA CREATE" size={150} delay={16} out={o + 6} /></At>
      <At y={-170}><Kin text="KAROGE?" size={176} color={C.orange} delay={24} out={o + 12} /></At>
    </>
  );
};
