import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {C, CX, CY, FONT_MONO, prog, sp} from './lib';

// fade + short blur swap for a whole scene layer
export const Phase: React.FC<{from?: number; to?: number; children: React.ReactNode}> = ({
  from = 0,
  to = 1e9,
  children,
}) => {
  const f = useCurrentFrame();
  const inn = prog(f, from, from + 12);
  const out = prog(f, to - 10, to, Easing.in(Easing.cubic));
  const o = inn * (1 - out);
  if (o <= 0.002) return null;
  const blur = (1 - inn) * 10 + out * 10;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: o,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        translate: `0 ${(1 - inn) * 26 - out * 16}px`,
      }}
    >
      {children}
    </div>
  );
};

// place children by centre offset from the stage centre
export const At: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x = 0, y = 0, w = 0, h = 0, style, children}) => {
  if (!w) {
    return (
      <div
        style={{
          position: 'absolute',
          left: CX + x,
          top: CY + y,
          translate: '-50% -50%',
          whiteSpace: 'nowrap',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: CX + x - w / 2,
        top: CY + y - (h || 0) / 2,
        width: w,
        height: h || undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// local box helper for children inside a fixed-size container
export const box =
  (cw: number, ch: number) =>
  (x: number, y: number, w: number, h: number): React.CSSProperties => ({
    position: 'absolute',
    left: cw / 2 + x - w / 2,
    top: ch / 2 + y - h / 2,
    width: w,
    height: h,
  });

// kinetic type: masked per-letter rise with spring + blur
export const Kin: React.FC<{
  text: string;
  size: number;
  color?: string;
  delay?: number;
  stagger?: number;
  weight?: number;
  out?: number;
  ls?: number;
}> = ({text, size, color = C.ink, delay = 0, stagger = 2, weight = 900, out, ls = -0.03}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        display: 'inline-flex',
        whiteSpace: 'pre',
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: `${ls}em`,
        lineHeight: 1.05,
      }}
    >
      {text.split('').map((ch, i) => {
        const p = sp(f, delay + i * stagger, 17, 130);
        const o =
          out === undefined
            ? 0
            : prog(f, out + i * stagger, out + i * stagger + 10, Easing.in(Easing.cubic));
        const y = (1 - p) * 115 - o * 115;
        const glyph = ch === ' ' ? '\u00A0' : ch;
        return (
          <span
            key={i}
            style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em'}}
          >
            <span
              style={{
                display: 'inline-block',
                translate: `0 ${y}%`,
                rotate: `${(1 - Math.min(p, 1)) * 7 - o * 5}deg`,
                filter: Math.abs(y) > 8 ? `blur(${Math.min(6, Math.abs(y) / 18)}px)` : undefined,
              }}
            >
              {glyph}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// stroke-drawn check mark
export const Check: React.FC<{p: number; size: number; color?: string; stroke?: number}> = ({
  p,
  size,
  color = C.ink,
  stroke = 3,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);

// typed monospace text with coloured tokens
export const Typed: React.FC<{
  tokens: [string, string][];
  start: number;
  cps?: number;
  size: number;
  cursor?: boolean;
}> = ({tokens, start, cps = 1.5, size, cursor = true}) => {
  const f = useCurrentFrame();
  const total = tokens.reduce((a, t) => a + t[0].length, 0);
  let left = Math.max(0, Math.floor((f - start) * cps));
  const typing = f >= start && left < total;
  return (
    <div style={{fontFamily: FONT_MONO, fontWeight: 500, fontSize: size, whiteSpace: 'pre', color: C.ink, lineHeight: 1.2}}>
      {tokens.map(([t, col], i) => {
        const part = t.slice(0, left);
        left = Math.max(0, left - t.length);
        return (
          <span key={i} style={{color: col}}>
            {part}
          </span>
        );
      })}
      {cursor && typing ? (
        <span
          style={{
            display: 'inline-block',
            width: size * 0.55,
            height: size * 1.05,
            background: C.orange,
            verticalAlign: 'text-bottom',
            marginLeft: 2,
          }}
        />
      ) : null}
    </div>
  );
};
