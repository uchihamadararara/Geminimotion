import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {C, CX, CY, FONT_MONO, BEAT, beatPulse, easeIO, prog, sp} from './lib';
import {At, Check, Kin, Phase, Typed, box} from './ui';

const card = {border: `1px solid rgba(255,255,255,0.07)`};

// 5 — code -> render
export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const r = prog(f, 48, 120, easeIO);
  const cnt = Math.round(1638 * r);
  const done = prog(f, 122, 134);
  const thumbs = [
    <div key="a" style={{width: 54, height: 54, borderRadius: 27, background: C.orange}} />,
    <div key="b" style={{width: 54, height: 54, borderRadius: 10, background: C.blue}} />,
    <div key="c" style={{width: 58, height: 52, background: C.ink, clipPath: 'polygon(50% 0,100% 100%,0 100%)'}} />,
    <div key="d" style={{width: 54, height: 54, borderRadius: 27, border: `7px solid ${C.orange}`}} />,
    <div key="e" style={{width: 54, height: 40, background: `repeating-linear-gradient(90deg, ${C.blue} 0 10px, transparent 10px 20px)`}} />,
  ];
  return (
    <Phase from={6} to={150}>
      <At y={-495}>
        <div style={{display: 'flex', gap: 24}}>
          <Kin text="CODE" size={100} delay={8} />
          <svg width="90" height="60" viewBox="0 0 90 60" style={{alignSelf: 'center'}}><path d="M4 30h70M54 8l22 22-22 22" stroke={C.mute} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(f, 16, 32)} /></svg>
          <Kin text="VIDEO" size={100} color={C.orange} delay={22} />
        </div>
      </At>
      {[-420, -390, -360].map((x, i) => (
        <At key={x} x={x} y={-345} w={16} h={16} style={{background: [C.orange, C.ink, C.blue][i], borderRadius: 8}} />
      ))}
      <At y={-345} style={{fontFamily: FONT_MONO, fontSize: 24, color: C.mute}}>~/showreel — zsh</At>
      <At x={-460 + 60} y={-250} w={0} style={{translate: '0 -50%', left: CX - 410}}>
        <Typed tokens={[['$ ', C.orange], ['npx remotion render', C.ink]]} start={10} cps={0.8} size={36} />
      </At>
      <At x={-100} y={-170} style={{fontFamily: FONT_MONO, fontSize: 30, color: C.mute, translate: '-50% -50%'}}>
        {f > 46 ? `Rendering frame ${String(cnt).padStart(4, '0')} / 1638` : ''}
      </At>
      <At y={-110} w={800} h={30} style={{background: C.card2, borderRadius: 15, justifyContent: 'flex-start'}}>
        <div style={{width: `${r * 100}%`, height: '100%', background: C.orange, borderRadius: 15}} />
      </At>
      <At y={40} w={800} h={200}>
        <div style={{fontWeight: 900, fontSize: 190, letterSpacing: '-0.05em', color: C.ink, fontVariantNumeric: 'tabular-nums'}}>
          {Math.round(r * 100)}%
        </div>
      </At>
      {thumbs.map((t, i) => {
        const p = sp(f, 50 + i * 14);
        return (
          <At key={i} x={-328 + i * 164} y={225} w={150} h={84} style={{...card, background: C.card2, borderRadius: 14, scale: String(p), opacity: p}}>
            {t}
          </At>
        );
      })}
      <At y={340} w={560} h={70} style={{background: C.ink, borderRadius: 35, gap: 14, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: C.bg, scale: String(sp(f, 122)), opacity: done}}>
        <Check p={done} size={34} color={C.bg} stroke={3.4} />
        out/video.mp4
      </At>
    </Phase>
  );
};

// 6 — no After Effects
const rnd = (i: number, j: number) => ((i * 7 + j * 13 + i * j * 3) % 17) / 17;
export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const strike = prog(f, 50, 70);
  const lineO = 1 - prog(f, 98, 108);
  const b = box(940, 640);
  const head = 0.25 + 0.75 * (1 - prog(f, 60, 70));
  return (
    <Phase from={6} to={150}>
      <At y={-450}>
        <Kin text="NO AFTER EFFECTS" size={86} delay={6} stagger={1.5} />
      </At>
      <At w={940} h={640} style={{display: 'block', overflow: 'hidden', borderRadius: 36}}>
        <div style={{...b(-380, -258, 72, 72), background: C.blue, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 34, color: C.ink, scale: String(sp(f, 8) * (1 - prog(f, 66, 76)))}}>
          Ae
        </div>
        <div style={{...b(-170, -258, 300, 30), fontFamily: FONT_MONO, fontSize: 24, color: C.mute, opacity: head}}>Comp 1 · 0:00:05</div>
        {Array.from({length: 7}).map((_, i) => {
          const y = -170 + i * 62;
          const bw = (120 + ((i * 37) % 80)) * (1 - prog(f, 82 + i * 2, 94 + i * 2));
          return (
            <React.Fragment key={i}>
              <div style={{...b(-330 + bw / 2 - 60, y, bw, 14), background: C.line, borderRadius: 7}} />
              <div style={{...b(80, y, 680, 2), background: 'rgba(255,255,255,0.06)'}} />
              {Array.from({length: 6}).map((_, j) => {
                const x = -170 + 560 * rnd(i, j);
                const born = sp(f, 10 + i * 3 + j * 2);
                const die = prog(f, 56 + (i * 6 + j) * 0.7, 66 + (i * 6 + j) * 0.7);
                return <div key={j} style={{...b(x + 80, y, 20, 20), background: (i + j) % 3 ? C.orange : C.ink, rotate: '45deg', scale: String(born * (1 - die)), borderRadius: 3}} />;
              })}
            </React.Fragment>
          );
        })}
        <div style={{...b(-380 + 760 * prog(f, 10, 60, Easing.linear), 0, 3, 640), background: C.ink, opacity: 0.5 * (1 - prog(f, 56, 62))}} />
        <svg width="940" height="640" style={{position: 'absolute', inset: 0, opacity: lineO}}>
          <path d="M60 50L880 590" stroke={C.orange} strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
        </svg>
      </At>
      <At y={-70}><Kin text="ZERO" size={190} delay={100} stagger={3} /></At>
      <At y={90}><Kin text="KEYFRAMES" size={118} color={C.orange} delay={106} stagger={2} /></At>
      <At y={450}><Kin text="NO HEADACHE." size={80} color={C.mute} delay={92} stagger={1.5} /></At>
    </Phase>
  );
};

// 7 — equation
const ROWS = [-285, -95, 95, 285];
const TXT = ['IDEA', '+ CLAUDE SONNET', '+ CODE', ''];
const Icon: React.FC<{i: number; dark: boolean}> = ({i, dark}) => {
  const c = dark ? C.bg : C.ink;
  if (i === 0) return <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="6" stroke={c} strokeWidth="2.4" /><path d="M9.5 19h5M10 22h4" stroke={c} strokeWidth="2.4" strokeLinecap="round" /></svg>;
  if (i === 1) return <svg width="46" height="46" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill={c} /></svg>;
  if (i === 2) return <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: c}}>{'</>'}</div>;
  return <svg width="40" height="40" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={c} /></svg>;
};
export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const ring = prog(f, 105, 128);
  return (
    <Phase from={4} to={150}>
      <At y={-455}><Kin text="BAS ITNA:" size={104} delay={4} /></At>
      {ROWS.map((y, i) => {
        const hero = i === 3;
        const start = i * 30 + 15;
        const p = hero ? 1 : sp(f, start);
        const pulse = f >= start ? 1 + 0.16 * beatPulse(f) : 1;
        const label = hero ? (f >= 105 ? '= VIDEO' : '= ?') : TXT[i];
        return (
          <At key={i} y={y + (hero ? 0 : (285 - y) * (1 - p))} w={780} h={160}
            style={hero ? {justifyContent: 'flex-start', paddingLeft: 40} : {...card, background: C.card, borderRadius: 80, justifyContent: 'flex-start', paddingLeft: 40, opacity: Math.min(1, p * 1.5)}}>
            <div style={{width: 96, height: 96, borderRadius: 48, background: hero ? C.bg : C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(pulse * (hero ? 1 : 0.4 + 0.6 * p)), flexShrink: 0}}>
              <Icon i={i} dark={false} />
            </div>
            <div style={{marginLeft: 34, fontWeight: 900, fontSize: 56, letterSpacing: '-0.03em', color: hero ? C.bg : C.ink, opacity: hero && f < 105 ? 0.35 : 1}}>{label}</div>
          </At>
        );
      })}
      <At y={285} w={780} h={160} style={{borderRadius: 80, border: `6px solid ${C.orange}`, scale: String(1 + 0.4 * ring), opacity: ring > 0 ? 1 - ring : 0}} />
    </Phase>
  );
};

// 8 — toggle: paid -> free
export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const FL = 60;
  const pL = sp(f, FL + 2, 17, 85);
  const pR = sp(f, FL, 20, 230);
  const left = -290 + 310 * pL;
  const right = -20 + 310 * pR;
  const chk = prog(f, 90, 108);
  return (
    <Phase from={6} to={150}>
      <At y={-330}>
        <div style={{position: 'relative', opacity: 1 - 0.65 * prog(f, 78, 88)}}>
          <Kin text="PAID PLAN" size={104} delay={6} />
          <div style={{position: 'absolute', left: 0, top: '52%', height: 12, width: `${prog(f, 64, 80) * 100}%`, background: C.orange, borderRadius: 6}} />
        </div>
      </At>
      <At x={(left + right) / 2} y={0} w={right - left} h={270} style={{background: C.ink, borderRadius: 135, display: 'flex'}}>
        <Check p={chk} size={110} color={C.orange} stroke={3.4} />
      </At>
      <At y={330}><Kin text="FREE PLAN" size={130} color={C.orange} delay={FL + 12} /></At>
    </Phase>
  );
};
