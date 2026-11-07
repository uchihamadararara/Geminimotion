import React from 'react';
import { ProceduralScene } from '../types/motion';
import { clamp, solveEasing, solveVelocity } from '../utils/mathEasing';

interface ReelCanvas916Props {
  scene: ProceduralScene;
  sceneIndex: number;
  totalScenes: number;
  /** Normalized progress within the active scene: 0.0 to 1.0 */
  progress: number;
  globalTimeSec: number;
  showSafeZones: boolean;
}

export const ReelCanvas916: React.FC<ReelCanvas916Props> = ({
  scene,
  sceneIndex,
  totalScenes,
  progress,
  globalTimeSec,
  showSafeZones,
}) => {
  const t = clamp(progress, 0, 1);
  const ease = solveEasing(scene.easing, clamp(t * 1.45, 0, 1));
  const velocity = solveVelocity(scene.easing, clamp(t * 1.45, 0, 1));

  // 3D Camera interpolation over scene lifetime
  const camZoom = scene.camera.zoom + t * 0.06;
  const camRotX = scene.camera.rotateX * (1 - t * 0.4);
  const camRotY = scene.camera.rotateY * (1 - t * 0.4);
  const camRotZ = scene.camera.rotateZ;
  const camPanX = scene.camera.panX * (1 - t * 0.5);
  const camPanY = scene.camera.panY * (1 - t * 0.5);

  const cameraTransform = `perspective(950px) translate3d(${camPanX}px, ${camPanY}px, 0px) scale(${camZoom}) rotateX(${camRotX}deg) rotateY(${camRotY}deg) rotateZ(${camRotZ}deg)`;

  const isPaperScene = scene.type === 'paper-form-cutaway';
  const isStrobeScene = scene.type === 'strobe-impact-words';

  // Strobe frame computation
  const strobeWords =
    scene.items.length > 0 ? scene.items : ['AND', 'THIS IS', 'WHERE', 'IT GETS', 'CRAZY.'];
  const activeStrobeIndex = Math.min(
    strobeWords.length - 1,
    Math.floor(t * strobeWords.length)
  );
  const isStrobeOrange = isStrobeScene && activeStrobeIndex % 2 === 0;

  const containerBg = isStrobeScene
    ? isStrobeOrange
      ? scene.accentColor
      : '#08090D'
    : scene.bgColor || '#08090D';

  const currentFrameNumber = Math.floor(globalTimeSec * 60);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none rounded-xl border border-white/15 shadow-2xl"
      style={{
        aspectRatio: '9 / 16',
        backgroundColor: containerBg,
      }}
    >
      {/* 1. Background Grid & Ambient Glows */}
      {!isPaperScene && !isStrobeScene && (
        <>
          <div className="absolute inset-0 bg-blueprint-grid opacity-90 pointer-events-none" />
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ background: scene.accentColor }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25"
            style={{ background: scene.accentColor }}
          />
        </>
      )}

      {/* Corner Registration Crosshairs (Reference Video 2 style) */}
      <div
        className={`absolute inset-3 pointer-events-none flex flex-col justify-between z-20 ${
          isPaperScene
            ? 'text-slate-800/70'
            : isStrobeOrange
            ? 'text-black/80'
            : 'text-white/45'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums tracking-wider">
          <span>
            ┌ {scene.formHeader || `SEQ_0${sceneIndex + 1}/${totalScenes}`}
          </span>
          <span>t = {globalTimeSec.toFixed(2)}s ┐</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums tracking-wider">
          <span>└ 9:16 · 60FPS</span>
          <span>FRM {String(currentFrameNumber).padStart(4, '0')} ┘</span>
        </div>
      </div>

      {/* 2. 3D Camera Stage */}
      <div
        className="relative w-full h-full flex flex-col justify-between p-6 z-10 will-change-transform"
        style={{
          transform: cameraTransform,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ENGINE 1: LASER BLUEPRINT HOOK & FLOWCHART */}
        {scene.type === 'laser-blueprint-hook' && (
          <div className="flex flex-col justify-between h-full py-6">
            {/* Top Laser Comet Reveal */}
            <div className="space-y-3 mt-4">
              <div className="relative h-6 flex items-center">
                {/* Laser Beam */}
                <div
                  className="h-[2px] rounded-full relative"
                  style={{
                    width: `${clamp(t * 1.4, 0, 1) * 100}%`,
                    background: `linear-gradient(90deg, transparent 0%, ${scene.accentColor} 80%, #FFFFFF 100%)`,
                    boxShadow: `0 0 16px ${scene.accentColor}`,
                  }}
                >
                  {/* Glowing Comet Head */}
                  <div
                    className="absolute -right-2 -top-1.5 w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: '#FFFFFF',
                      boxShadow: `0 0 18px 6px ${scene.accentColor}`,
                    }}
                  />
                </div>
              </div>

              <h2
                className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight text-white"
                style={{
                  opacity: clamp(t * 2.2, 0, 1),
                  transform: `translateY(${(1 - ease) * 18}px)`,
                  textShadow: `0 0 24px ${scene.accentColor}66`,
                }}
              >
                {scene.headline}
              </h2>
              <p
                className="text-xs sm:text-sm text-slate-300 leading-relaxed"
                style={{
                  opacity: clamp((t - 0.15) * 2.2, 0, 1),
                }}
              >
                {scene.subheadline}
              </p>
            </div>

            {/* Middle Procedural Flowchart Nodes (CLAUDE -> PROCEDURAL -> AFTER EFFECTS crossed out) */}
            <div className="my-auto space-y-2.5 py-2">
              {scene.items.map((node, idx) => {
                const nodeProgress = clamp((t - 0.12 * idx) * 2.4, 0, 1);
                const isStruck = scene.strikeIndex === idx && t > 0.48;
                return (
                  <React.Fragment key={idx}>
                    <div
                      className="relative px-3.5 py-2.5 rounded border bg-[#0D1018]/90 flex items-center justify-between overflow-hidden"
                      style={{
                        borderColor: isStruck
                          ? '#EF4444'
                          : nodeProgress > 0.8
                          ? scene.accentColor
                          : 'rgba(255,255,255,0.16)',
                        opacity: nodeProgress,
                        transform: `translateX(${(1 - nodeProgress) * -20}px)`,
                        boxShadow:
                          nodeProgress > 0.8 && !isStruck
                            ? `0 0 18px -4px ${scene.accentColor}55`
                            : 'none',
                      }}
                    >
                      <span className="font-mono text-[11px] font-semibold tracking-wider text-white">
                        {node}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                        NODE_0{idx + 1}
                      </span>

                      {/* Red laser crossout if strikeIndex matches */}
                      {isStruck && (
                        <div
                          className="absolute left-2 right-2 top-1/2 h-[2.5px] bg-red-500 origin-left"
                          style={{
                            transform: `scaleX(${clamp((t - 0.48) * 3, 0, 1)}) rotate(-2deg)`,
                            boxShadow: '0 0 12px #EF4444',
                          }}
                        />
                      )}
                    </div>

                    {idx < scene.items.length - 1 && (
                      <div className="flex justify-center">
                        <div
                          className="w-[2px] h-3.5"
                          style={{
                            backgroundColor: scene.accentColor,
                            opacity: clamp((t - 0.15 * idx) * 3, 0, 1),
                            boxShadow: `0 0 8px ${scene.accentColor}`,
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Bottom Live Bezier Graph Editor (Reference Video 2 at 0:15) */}
            <div className="p-3 rounded border border-white/15 bg-[#0B0D14]/90">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                <span>GRAPH EDITOR</span>
                <span style={{ color: scene.accentColor }}>{scene.codeSnippet}</span>
              </div>
              <svg viewBox="0 0 240 64" className="w-full h-14 overflow-visible">
                <line x1="10" y1="54" x2="230" y2="54" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <line x1="10" y1="10" x2="10" y2="54" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                {/* Handle control lines */}
                <line x1="10" y1="54" x2="55" y2="12" stroke="rgba(255,85,0,0.4)" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="230" y1="10" x2="140" y2="10" stroke="rgba(255,85,0,0.4)" strokeDasharray="3 3" strokeWidth="1" />
                {/* Bezier Curve */}
                <path
                  d="M 10 54 C 55 12, 140 10, 230 10"
                  fill="none"
                  stroke={scene.accentColor}
                  strokeWidth="2.5"
                  strokeDasharray="260"
                  strokeDashoffset={260 * (1 - clamp(t * 1.3, 0, 1))}
                />
                {/* Moving keyframe particle along curve */}
                <circle
                  cx={10 + 220 * t}
                  cy={54 - 44 * ease}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke={scene.accentColor}
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        )}

        {/* ENGINE 2: VERTICAL MOTION-BLUR KINETIC STACK */}
        {scene.type === 'kinetic-blur-stack' && (
          <div className="flex flex-col justify-between h-full py-8">
            <div className="text-[11px] font-mono tracking-widest uppercase" style={{ color: scene.accentColor }}>
              {scene.subheadline}
            </div>

            {/* Center Massive Motion-Blur Typography */}
            <div className="my-auto space-y-2 relative">
              {/* Ghost velocity blur echo when moving fast */}
              {velocity > 0.6 && (
                <div
                  className="font-display font-black text-4xl sm:text-5xl tracking-tight leading-none uppercase pointer-events-none select-none opacity-35"
                  style={{
                    color: scene.accentColor,
                    transform: `translateY(${-velocity * 14}px) scaleY(${1 + velocity * 0.25})`,
                    filter: `blur(${Math.min(8, velocity * 3)}px)`,
                  }}
                >
                  {scene.headline}
                </div>
              )}

              <h1
                className="font-display font-black text-4xl sm:text-5xl tracking-tight leading-[0.95] uppercase"
                style={{
                  color: '#FFFFFF',
                  textShadow: `0 0 32px ${scene.accentColor}88`,
                  transform: `translateY(${(1 - ease) * 48}px) scaleY(${1 + Math.max(0, (1 - ease) * 0.35)})`,
                  filter: `blur(${Math.max(0, (1 - ease) * 5)}px)`,
                }}
              >
                {scene.headline}
              </h1>

              {/* Glowing laser underline */}
              <div
                className="h-1 rounded-full mt-3"
                style={{
                  width: `${clamp(ease * 100, 0, 100)}%`,
                  backgroundColor: scene.accentColor,
                  boxShadow: `0 0 20px ${scene.accentColor}`,
                }}
              />
            </div>

            {/* Staggered Timeline Tracks / Kinetic Rows */}
            <div className="space-y-2">
              {scene.items.map((item, idx) => {
                const rowProgress = clamp((t - idx * 0.12) * 2.2, 0, 1);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded bg-white/[0.04] border border-white/10 font-mono text-[11px]"
                    style={{
                      opacity: rowProgress,
                      transform: `translateX(${(1 - rowProgress) * 28}px)`,
                    }}
                  >
                    <span className="text-white font-medium">{item}</span>
                    <span className="text-[10px] tabular-nums" style={{ color: scene.accentColor }}>
                      {(rowProgress * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ENGINE 3: 3D WIREFRAME PERSPECTIVE GRID & PROMPT TERMINAL */}
        {scene.type === 'wireframe-3d-prompt' && (
          <div className="relative flex flex-col justify-between h-full py-6 overflow-hidden">
            {/* Floating 3D Polyhedra SVG in upper space */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: scene.accentColor }}>
                  {scene.subheadline}
                </div>
                <h2 className="font-display font-bold text-xl text-white">
                  {scene.headline}
                </h2>
              </div>

              {/* Rotating Wireframe Polyhedron */}
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 shrink-0"
                style={{
                  transform: `rotate(${globalTimeSec * 45}deg)`,
                }}
              >
                <polygon
                  points="50,8 90,30 90,70 50,92 10,70 10,30"
                  fill="none"
                  stroke={scene.accentColor}
                  strokeWidth="1.8"
                />
                <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <line x1="10" y1="30" x2="90" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <line x1="90" y1="30" x2="10" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
              </svg>
            </div>

            {/* Center Prompt Terminal Box with Live Typing & Highlighted Keywords */}
            <div
              className="my-auto p-4 rounded-lg border bg-[#0B0E17]/95 shadow-2xl relative z-10"
              style={{
                borderColor: scene.accentColor,
                boxShadow: `0 0 28px -6px ${scene.accentColor}55`,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 mb-2 border-b border-white/10">
                <span>PROMPT // TO // SCENE_GRAPH</span>
                <span style={{ color: scene.accentColor }}>ACTIVE</span>
              </div>
              <p className="font-mono text-xs sm:text-sm leading-relaxed text-white">
                {scene.codeSnippet.slice(
                  0,
                  Math.max(12, Math.floor(scene.codeSnippet.length * clamp(t * 1.35, 0, 1)))
                )}
                <span
                  className="inline-block w-2 h-4 ml-1 align-middle"
                  style={{ backgroundColor: scene.accentColor }}
                />
              </p>

              {/* Highlighted tokens */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/10">
                {scene.items.map((token, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border"
                    style={{
                      borderColor: `${scene.accentColor}88`,
                      backgroundColor: `${scene.accentColor}22`,
                      color: '#FFFFFF',
                      opacity: clamp((t - idx * 0.15) * 3, 0, 1),
                    }}
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Tilted 3D Perspective Floor Grid */}
            <div
              className="h-32 -mx-6 -mb-6 border-t"
              style={{
                borderColor: `${scene.accentColor}66`,
                backgroundImage: `
                  linear-gradient(to right, ${scene.accentColor}33 1px, transparent 1px),
                  linear-gradient(to bottom, ${scene.accentColor}33 1px, transparent 1px)
                `,
                backgroundSize: '28px 28px',
                transform: 'perspective(300px) rotateX(62deg) scale(1.35)',
                transformOrigin: 'top center',
              }}
            />
          </div>
        )}

        {/* ENGINE 4: ORANGE STROBE IMPACT WORD CUTS */}
        {isStrobeScene && (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <div
              className={`text-[11px] font-mono uppercase tracking-widest mb-4 ${
                isStrobeOrange ? 'text-black/80' : 'text-white/60'
              }`}
            >
              {scene.subheadline}
            </div>
            <div
              className="font-display font-black text-5xl sm:text-6xl tracking-tighter uppercase leading-none"
              style={{
                color: isStrobeOrange ? '#08090D' : '#FFFFFF',
                transform: `scale(${0.92 + ((t * strobeWords.length) % 1) * 0.16})`,
              }}
            >
              {strobeWords[activeStrobeIndex]}
            </div>
            <div className="mt-8 flex items-center gap-1.5">
              {strobeWords.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: idx === activeStrobeIndex ? '24px' : '6px',
                    backgroundColor: isStrobeOrange ? '#08090D' : scene.accentColor,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ENGINE 5: PAPER FORM 2-B / FORM 9 CUTAWAY */}
        {isPaperScene && (
          <div className="flex flex-col justify-between h-full py-6 text-slate-900">
            {/* Brutalist Form Header */}
            <div className="border-b-2 border-slate-900 pb-3 mt-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                <span>DEPT. OF PROCEDURAL MOTION</span>
                <span>REV 2026.4</span>
              </div>
              <h2 className="font-mono font-black text-xl sm:text-2xl tracking-tight text-slate-950 mt-1">
                {scene.headline}
              </h2>
              <p className="font-mono text-[10px] text-slate-600 mt-0.5">
                {scene.subheadline}
              </p>
            </div>

            {/* Form Sections with Red Hand-Drawn Strikethrough & Animated Checkboxes */}
            <div className="my-auto space-y-3 py-3">
              {scene.items.map((item, idx) => {
                const itemAppear = clamp((t - idx * 0.14) * 2.5, 0, 1);
                const isStruck = scene.strikeIndex === idx && t > 0.35;
                return (
                  <div
                    key={idx}
                    className="relative p-3 border border-slate-900/80 bg-white/80 font-mono text-xs"
                    style={{
                      opacity: itemAppear,
                      transform: `translateY(${(1 - itemAppear) * 12}px)`,
                    }}
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                      <span>SECTION {idx + 1}.0</span>
                      <span>{isStruck ? 'DEPRECATED' : 'VERIFIED'}</span>
                    </div>
                    <div className="font-semibold text-slate-900 leading-snug">
                      {item}
                    </div>

                    {/* Hand-drawn red marker strikethrough (Reference Video 2 at 1:00) */}
                    {isStruck && (
                      <div
                        className="absolute left-2 right-2 top-1/2 h-1 bg-red-600 origin-left"
                        style={{
                          transform: `scaleX(${clamp((t - 0.35) * 2.4, 0, 1)}) rotate(-1.5deg)`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Official Stamp */}
            <div className="border-t-2 border-slate-900 pt-2.5 flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold text-red-700">{scene.codeSnippet}</span>
              <span className="px-2 py-0.5 border border-slate-900 font-bold">
                APPROVED
              </span>
            </div>
          </div>
        )}

        {/* ENGINE 6: CODE & MATHEMATICAL INSPECTOR SPLIT-SCREEN */}
        {scene.type === 'code-math-inspector' && (
          <div className="flex flex-col justify-between h-full py-6 gap-3">
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white leading-snug">
                {scene.headline}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{scene.subheadline}</p>
            </div>

            {/* Top Half: Mathematical Code / Procedural Diffs */}
            <div className="p-3 rounded-lg border border-white/15 bg-[#0B0E16] font-mono text-[11px] leading-relaxed overflow-hidden">
              <div className="flex items-center justify-between text-[9px] text-slate-400 pb-1.5 mb-1.5 border-b border-white/10">
                <span>scene.ts — procedural solver</span>
                <span style={{ color: scene.accentColor }}>60 FPS</span>
              </div>
              <pre className="whitespace-pre-wrap text-[10.5px] leading-relaxed">
                {scene.codeSnippet.split('\n').map((line, i) => {
                  const isRemoved = line.trim().startsWith('-');
                  const isAdded = line.trim().startsWith('+');
                  return (
                    <div
                      key={i}
                      className={`px-1 rounded ${
                        isRemoved
                          ? 'bg-red-500/20 text-red-300'
                          : isAdded
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'text-slate-200'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* Bottom Half: Live Bounding-Box Viewport with Morphing Shape & Equation */}
            <div className="flex-1 rounded-lg border border-white/15 bg-[#07090E] p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>VIEWPORT // BOUNDING_BOX</span>
                <span className="tabular-nums" style={{ color: scene.accentColor }}>
                  ease(t) = {ease.toFixed(3)}
                </span>
              </div>

              {/* Morphing Shape + Orbiting Vector */}
              <div className="my-auto flex items-center justify-center relative h-28">
                <div
                  className="w-20 h-20 border-2 flex items-center justify-center transition-none"
                  style={{
                    borderColor: scene.accentColor,
                    backgroundColor: `${scene.accentColor}26`,
                    borderRadius: `${12 + Math.sin(t * Math.PI) * 38}%`,
                    transform: `translateX(${(ease - 0.5) * 70}px) rotate(${t * 90}deg)`,
                    boxShadow: `0 0 28px ${scene.accentColor}66`,
                  }}
                >
                  <span className="font-mono text-[10px] text-white font-semibold">
                    x(t)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-1 border-t border-white/10">
                <span>{scene.formHeader || 'x(t) = x₀ + (x₁ - x₀) · ease(t)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 7: 3D CAMERA UI WALKTHROUGH & MODEL DROPDOWN (Reference Video 1) */}
        {scene.type === 'ui-3d-walkthrough' && (
          <div className="flex flex-col justify-between h-full py-6">
            {/* Warm Starburst Brand Lockup */}
            <div className="flex flex-col items-center text-center mt-4">
              <div className="flex items-center gap-2.5">
                <svg
                  viewBox="0 0 48 48"
                  className="w-8 h-8"
                  style={{
                    transform: `rotate(${globalTimeSec * 40}deg)`,
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line
                      key={i}
                      x1="24"
                      y1="24"
                      x2={24 + 18 * Math.cos((i * Math.PI) / 6)}
                      y2={24 + 18 * Math.sin((i * Math.PI) / 6)}
                      stroke={scene.accentColor}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <span className="font-display font-bold text-2xl tracking-tight text-[#F5EBE6]">
                  {scene.headline}
                </span>
              </div>
            </div>

            {/* Prompt Input Box + Animated Model Dropdown */}
            <div className="my-auto space-y-2.5">
              <div
                className="p-3.5 rounded-xl border bg-[#1A120E]/95 shadow-xl"
                style={{ borderColor: `${scene.accentColor}55` }}
              >
                <div className="text-xs text-[#E8D8D0] font-sans min-h-[32px]">
                  {scene.subheadline.slice(
                    0,
                    Math.max(6, Math.floor(scene.subheadline.length * clamp(t * 1.6, 0, 1)))
                  )}
                  <span
                    className="inline-block w-1.5 h-3.5 ml-0.5 align-middle"
                    style={{ backgroundColor: scene.accentColor }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#C8B2A6]">
                  <span>+ Attach context</span>
                  <span
                    className="px-2 py-0.5 rounded border font-semibold"
                    style={{
                      borderColor: scene.accentColor,
                      color: '#FFFFFF',
                      backgroundColor: `${scene.accentColor}33`,
                    }}
                  >
                    Argon 4.0 ▾
                  </span>
                </div>
              </div>

              {/* Model Selector Dropdown Card */}
              <div
                className="p-2.5 rounded-xl border border-white/15 bg-[#1F1612]/95 shadow-2xl space-y-1.5"
                style={{
                  opacity: clamp((t - 0.18) * 2.5, 0, 1),
                  transform: `translateY(${(1 - clamp((t - 0.18) * 2.5, 0, 1)) * 14}px)`,
                }}
              >
                {scene.items.map((opt, idx) => {
                  const isSelected = idx === 0;
                  return (
                    <div
                      key={idx}
                      className="px-2.5 py-2 rounded-lg flex items-center justify-between text-[11px]"
                      style={{
                        backgroundColor: isSelected
                          ? `${scene.accentColor}30`
                          : 'transparent',
                        border: isSelected
                          ? `1px solid ${scene.accentColor}66`
                          : '1px solid transparent',
                      }}
                    >
                      <span className="text-[#F5EBE6] font-medium leading-tight">
                        {opt}
                      </span>
                      {isSelected && (
                        <span
                          className="text-[10px] font-mono font-bold ml-2 shrink-0"
                          style={{ color: scene.accentColor }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center font-mono text-[10px] text-[#A89286]">
              {scene.codeSnippet}
            </div>
          </div>
        )}

        {/* ENGINE 8: LIVE IDE CODE TYPING & STARBURST (Reference Video 1 at 0:07) */}
        {scene.type === 'live-code-typing' && (
          <div className="flex flex-col justify-between h-full py-6">
            {/* Top Callout */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 48 48"
                  className="w-6 h-6"
                  style={{
                    transform: `rotate(${globalTimeSec * 60}deg)`,
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line
                      key={i}
                      x1="24"
                      y1="24"
                      x2={24 + 17 * Math.cos((i * Math.PI) / 6)}
                      y2={24 + 17 * Math.sin((i * Math.PI) / 6)}
                      stroke={scene.accentColor}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <span className="font-mono text-[11px] text-slate-300">
                  {scene.subheadline}
                </span>
              </div>
              <span className="text-xs font-medium text-white px-2.5 py-1 rounded bg-white/10">
                {scene.headline}
              </span>
            </div>

            {/* Streaming Code Editor */}
            <div className="my-auto p-3.5 rounded-xl border border-white/15 bg-[#0C0908]/95 font-mono text-[10.5px] leading-relaxed text-[#F5E6DC] shadow-2xl overflow-hidden">
              <pre className="whitespace-pre-wrap">
                {scene.codeSnippet.slice(
                  0,
                  Math.max(24, Math.floor(scene.codeSnippet.length * clamp(t * 1.25, 0, 1)))
                )}
                <span
                  className="inline-block w-2 h-3.5 ml-0.5 align-middle"
                  style={{ backgroundColor: scene.accentColor }}
                />
              </pre>
            </div>

            {/* Bottom Symbol Strip */}
            <div className="flex flex-wrap gap-1.5">
              {scene.items.map((fnName, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10"
                >
                  {fnName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Optional Reels Safe-Zone Overlay */}
      {showSafeZones && (
        <div className="absolute inset-0 pointer-events-none z-30 border-x-[18px] border-t-[36px] border-b-[64px] border-amber-500/20">
          <div className="w-full h-full border border-dashed border-amber-400/50 flex flex-col justify-between p-2 text-[9px] font-mono text-amber-300/80">
            <span>REELS / SHORTS 9:16 SAFE TITLE AREA</span>
            <span className="self-end">CAPTION / UI OVERLAY ZONE</span>
          </div>
        </div>
      )}
    </div>
  );
};
