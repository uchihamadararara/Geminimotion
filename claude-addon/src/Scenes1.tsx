import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {C, FONT_MONO, BEAT, beatPulse, ease, easeIO, prog, sp} from './lib';
import {At, Check, Kin, Phase, Typed, box} from './ui';

const card = {border: `1px solid rgba(255,255,255,0.07)`};

// 1 — hook: answers -> motion video
export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const strike = prog(f, 50, 66);
  const t = prog(f, 44, 140, Easing.linear);
  const circ = prog(f, 44, 130, easeIO);
  const play = sp(f, 22) * (1 - prog(f, 40, 48));
  const b = box(860, 484);
  return (
    <Phase from={6} to={150}>
      <At y={-430}>
        <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
          <Kin text="AI =" size={104} delay={8} />
          <div style={{position: 'relative', opacity: 1 - 0.65 * prog(f, 66, 76)}}>
            <Kin text="ANSWERS" size={104} delay={14} />
            <div style={{position: 'absolute', left: 0, top: '52%', height: 12, width: `${strike * 100}%`, background: C.orange, borderRadius: 6}} />
          </div>
        </div>
      </At>
      <At w={860} h={484} style={{display: 'block', overflow: 'hidden', borderRadius: 44}}>
        {[-300, -150, 0, 150, 300].map((x) => (
          <div key={x} style={{...b(x, 0, 2, 484), background: 'rgba(255,255,255,0.05)'}} />
        ))}
        <div style={{...b(0, -10, 130, 130), borderRadius: 65, background: C.ink, scale: String(play), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="46" height="46" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={C.bg} /></svg>
        </div>
        {f > 44 && (
          <>
            <div
              style={{
                ...b(-280 + 560 * circ, -40 + 60 * Math.sin(circ * Math.PI * 2), 96, 96),
                background: C.orange,
                borderRadius: 48 - 36 * circ,
                rotate: `${200 * circ}deg`,
                scale: String(sp(f, 44)),
              }}
            />
            <div
              style={{
                ...b(0, -30, 190, 190),
                borderRadius: 95,
                border: `6px solid ${C.ink}`,
                opacity: 0.3,
                scale: String((0.3 + 0.7 * sp(f, 50)) * (1 + 0.06 * beatPulse(f))),
              }}
            />
            <div style={{position: 'absolute', left: 150, top: 242 + 112, width: 560 * prog(f, 60, 120, easeIO), height: 22, borderRadius: 11, background: C.blue}} />
          </>
        )}
        <div style={{...b(0, 195, 760, 8), background: 'rgba(255,255,255,0.12)', borderRadius: 4}} />
        <div style={{...b(-380 + 380 * t, 195, 760 * t, 8), left: 430 - 380, background: C.ink, borderRadius: 4}} />
        <div style={{...b(-380 + 760 * t, 195, 22, 22), borderRadius: 11, background: C.ink}} />
        <div style={{...b(-325, -205, 160, 30), fontFamily: FONT_MONO, fontSize: 26, color: C.mute}}>{`00:0${Math.floor(t * 5)}`}</div>
        <div style={{...b(340, -205, 16, 16), borderRadius: 8, background: C.orange, opacity: Math.floor(f / BEAT) % 2 ? 0.25 : 1}} />
      </At>
      <At y={400}>
        <Kin text="MOTION VIDEO" size={118} color={C.orange} delay={68} />
      </At>
    </Phase>
  );
};

// 2 — FREE plan
export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(999 * (1 - prog(f, 22, 74, easeIO)));
  const chk = prog(f, 86, 104);
  return (
    <Phase from={6} to={150}>
      <At y={-250}>
        <Kin text="FREE" size={230} color={C.bg} delay={8} stagger={3} />
      </At>
      <At y={-10} w={700} h={260}>
        <div style={{fontWeight: 900, fontSize: 250, letterSpacing: '-0.04em', color: C.bg, fontVariantNumeric: 'tabular-nums', scale: String(0.9 + 0.1 * sp(f, 20))}}>
          {`₹${n}`}
        </div>
      </At>
      <At x={-50} y={285} w={470} h={90} style={{background: C.bg, borderRadius: 45, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: C.ink, scale: String(sp(f, 60))}}>
        CLAUDE · FREE PLAN
      </At>
      <At x={290} y={285} w={90} h={90} style={{background: C.bg, borderRadius: 45, scale: String(sp(f, 82))}}>
        <Check p={chk} size={52} color={C.orange} stroke={3.2} />
      </At>
      <At x={330} y={-330} w={64} h={64} style={{background: C.blue, borderRadius: 32, translate: `0 ${Math.sin(f / 9) * 10}px`, scale: String(sp(f, 30))}} />
    </Phase>
  );
};

const KW = C.blueL;
const LINES: [string, string][][] = [
  [['import ', KW], ['{ spring }', C.ink], [' from ', KW], ['"remotion"', C.orange], [';', C.mute]],
  [['const ', KW], ['f = ', C.ink], ['useCurrentFrame', C.orange], ['();', C.mute]],
  [['const ', KW], ['s = ', C.ink], ['spring', C.orange], ['({ frame: f, fps });', C.ink]],
  [['<div ', KW], ['style', C.ink], ['={{ ', C.mute], ['scale: s', C.ink], [' }} />', C.mute]],
];

// 3 — idea -> code
export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const send = sp(f, 56) * (1 + 0.15 * Math.sin(prog(f, 56, 66) * Math.PI));
  return (
    <Phase from={6} to={150}>
      <At y={-450}>
        <div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
          <Kin text="IDEA" size={110} delay={8} />
          <svg width="90" height="60" viewBox="0 0 90 60"><path d="M4 30h70M54 8l22 22-22 22" stroke={C.mute} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(f, 18, 34)} /></svg>
          <Kin text="CODE" size={110} color={C.orange} delay={22} />
        </div>
      </At>
      {[-410, -380, -350].map((x, i) => (
        <At key={x} x={x} y={-322} w={16} h={16} style={{background: C.ink, opacity: 0.25 + i * 0.05, borderRadius: 8}} />
      ))}
      <At y={-322} style={{fontFamily: FONT_MONO, fontSize: 24, color: C.mute}}>claude.ai / new chat</At>
      <At y={-215} w={800} h={120} style={{...card, background: C.card2, borderRadius: 30, justifyContent: 'flex-start', paddingLeft: 34, scale: String(0.9 + 0.1 * sp(f, 8))}}>
        <Typed tokens={[['Ek motion graphics video banao...', C.ink]]} start={14} cps={0.85} size={30} />
      </At>
      <At x={330} y={-215} w={64} h={64} style={{background: C.orange, borderRadius: 32, scale: String(send)}}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke={C.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </At>
      <At y={85} w={800} h={420} style={{...card, background: '#0B0B10', borderRadius: 30, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 34, paddingLeft: 40, scale: String(0.9 + 0.1 * sp(f, 58)), opacity: sp(f, 58)}}>
        {LINES.map((tk, i) => (
          <div key={i} style={{display: 'flex', gap: 22}}>
            <span style={{fontFamily: FONT_MONO, fontSize: 24, color: '#4A4A58', width: 22, paddingTop: 4}}>{i + 1}</span>
            <Typed tokens={tk} start={64 + i * 20} cps={1.7} size={29} />
          </div>
        ))}
      </At>
      <At y={330} style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_MONO, fontSize: 24, color: C.mute, opacity: sp(f, 100)}}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: C.orange}} />
        claude-sonnet
      </At>
    </Phase>
  );
};

// 4 — four tiles
const TILE = 420;
const POS: [number, number][] = [[-225, -225], [225, -225], [-225, 225], [225, 225]];
const TBG = [C.card, C.ink, C.blue, C.orange];
const TFG = [C.ink, C.bg, C.ink, C.bg];
const LBL = ['KINETIC TYPE', 'GRAPHICS', 'TRANSITIONS', 'SOUND FX'];

const TileInner: React.FC<{i: number; f: number}> = ({i, f}) => {
  const b = box(TILE, TILE);
  if (i === 0)
    return (
      <>
        {'TYPE'.split('').map((ch, k) => {
          const cyc = (f - k * 4) % 40;
          const y = -50 * Math.sin(Math.PI * Math.min(1, Math.max(0, cyc / 20)));
          return (
            <div key={k} style={{...b(-120 + k * 80, -10 + y, 80, 100), fontWeight: 900, fontSize: 96, color: cyc >= 8 && cyc <= 14 ? C.orange : C.ink, textAlign: 'center'}}>
              {ch}
            </div>
          );
        })}
      </>
    );
  if (i === 1) {
    const a = f / 14;
    return (
      <>
        <div style={{...b(0, -20, 90, 90), background: C.orange, rotate: `${f * 3}deg`, borderRadius: 14}} />
        <div style={{...b(Math.cos(a) * 110, -20 + Math.sin(a) * 110, 60, 60), background: C.bg, borderRadius: 30}} />
        <div style={{...b(Math.cos(a + 3.14) * 110, -20 + Math.sin(a + 3.14) * 110, 60, 56), background: C.blue, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', rotate: `${-f * 4}deg`}} />
      </>
    );
  }
  if (i === 2)
    return (
      <>
        {[0, 1, 2].map((k) => {
          const c = (f - k * 6) % 60;
          const a0 = prog(c, 0, 24, easeIO);
          const a1 = prog(c, 30, 54, easeIO);
          return <div key={k} style={{position: 'absolute', left: 50 + 320 * a1, top: 110 + k * 62, width: 320 * (a0 - a1), height: 40, background: C.ink, borderRadius: 8}} />;
        })}
      </>
    );
  return (
    <>
      {Array.from({length: 9}).map((_, k) => {
        const h = 26 + 130 * Math.abs(Math.sin(f / 6 + k * 0.9) * Math.sin(f / 11 + k));
        return <div key={k} style={{...b(-128 + k * 32, -15, 18, h), background: C.bg, borderRadius: 9}} />;
      })}
    </>
  );
};

export const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Phase from={6} to={150}>
      {POS.map(([x, y], i) => {
        const p = i === 0 ? 1 : sp(f, 10 + i * 6);
        const px = i === 0 ? x : POS[0][0] + (x - POS[0][0]) * p;
        const py = i === 0 ? y : POS[0][1] + (y - POS[0][1]) * p;
        const s0 = 40 + 25 * i;
        const act = prog(f, s0, s0 + 8) - prog(f, s0 + 25, s0 + 33);
        return (
          <At key={i} x={px} y={py} w={TILE} h={TILE} style={{display: 'block', scale: String((i === 0 ? 1 : 0.6 + 0.4 * p) * (1 + 0.05 * act)), opacity: i === 0 ? 1 : p}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 56, background: i === 0 ? 'transparent' : TBG[i], overflow: 'hidden', ...(i ? card : {})}}>
              <TileInner i={i} f={f} />
            </div>
            <div style={{position: 'absolute', inset: -4, borderRadius: 60, border: `5px solid ${i === 3 ? C.bg : C.ink}`, opacity: act * 0.9}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: act > 0.5 && i === 0 ? C.orange : TFG[i]}}>
              {LBL[i]}
            </div>
          </At>
        );
      })}
    </Phase>
  );
};
