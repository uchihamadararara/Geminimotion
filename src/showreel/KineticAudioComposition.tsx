import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface WordTimestamp {
  word: string;
  /** Visual start timestamp (already includes 500ms pre-roll lead if desired) */
  startSec: number;
  /** Sung audio end timestamp */
  endSec: number;
  /** Exact acoustic vocal onset timestamp (defaults to startSec) */
  audioStartSec?: number;
  /** True when singer holds/sustains this word for a long duration */
  isLongHold?: boolean;
  /** Duration in seconds of the vocal sustain */
  holdDurationSec?: number;
  emphasis?: boolean;
  accent?: string;
  scale?: number;
}

export interface KineticScene {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  headline: string;
  subheadline?: string;
  accentColor: string;
  cameraZoom?: number;
  cameraTilt?: number;
}

export interface KineticAudioCompositionProps {
  audioUrl?: string;
  sfxStemUrl?: string;
  sfxEnabled?: boolean;
  transcript?: string;
  detectedLanguage?: string;
  words?: WordTimestamp[];
  kineticScenes?: KineticScene[];
}

const FALLBACK_SCENE: KineticScene = {
  id: 'scene-1',
  title: 'Kinetic Motion',
  startSec: 0,
  endSec: 60,
  headline: 'WORD-SYNC STUDIO',
  subheadline: 'Frame-Accurate Speech & Typography Engine',
  accentColor: '#F59E0B',
  cameraZoom: 1.08,
  cameraTilt: 0,
};

/**
 * 500ms (0.50s) Lead-Time Pre-Roll so every word appears smoothly 500ms before its vocal onset!
 */
const LEAD_PRE_ROLL_SEC = 0.5;

export const KineticAudioComposition: React.FC<KineticAudioCompositionProps> = ({
  audioUrl,
  sfxStemUrl,
  sfxEnabled = true,
  detectedLanguage = 'Punjabi / Hindi Ghazal Sync',
  words = [],
  kineticScenes = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSec = frame / fps;

  // Identify active word with 500ms pre-roll lead window and full sustained hold duration
  const activeWordIdx = useMemo(() => {
    if (!words || words.length === 0) return -1;
    // First priority: word currently being sung in the audio ([audioStart, endSec])
    for (let i = 0; i < words.length; i++) {
      const vocalStart = words[i].audioStartSec ?? words[i].startSec;
      if (currentTimeSec >= vocalStart && currentTimeSec <= words[i].endSec) {
        return i;
      }
    }
    // Second priority: word in its 500ms pre-roll anticipation window ([vocalStart - 0.50s, vocalStart])
    for (let i = 0; i < words.length; i++) {
      const vocalStart = words[i].audioStartSec ?? words[i].startSec;
      const preRollStart = Math.max(0, vocalStart - LEAD_PRE_ROLL_SEC);
      if (currentTimeSec >= preRollStart && currentTimeSec < vocalStart) {
        return i;
      }
    }
    // Third priority: brief tail after word ends
    for (let i = words.length - 1; i >= 0; i--) {
      if (currentTimeSec >= words[i].endSec && currentTimeSec < words[i].endSec + 0.35) {
        return i;
      }
    }
    return -1;
  }, [words, currentTimeSec]);

  const activeWord = activeWordIdx >= 0 ? words[activeWordIdx] : null;

  // Group words into natural sung lines/phrases
  const phrases = useMemo(() => {
    if (!words || words.length === 0) return [];
    const chunks: WordTimestamp[][] = [];
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
        Boolean(words[i].isLongHold && currentChunk.length >= 4) ||
        currentChunk.length >= 8;
      if (isBreak || i === words.length - 1) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    }
    return chunks;
  }, [words]);

  // Find which phrase chunk is currently visible (starting 500ms early!)
  const activePhrase = useMemo(() => {
    if (phrases.length === 0) return [];
    for (const phrase of phrases) {
      const firstVocalStart = phrase[0].audioStartSec ?? phrase[0].startSec;
      const phrasePreRollStart = Math.max(0, firstVocalStart - LEAD_PRE_ROLL_SEC);
      const phraseEnd = phrase[phrase.length - 1].endSec;
      if (currentTimeSec >= phrasePreRollStart && currentTimeSec <= phraseEnd + 0.45) {
        return phrase;
      }
    }
    if (currentTimeSec < phrases[0][0].startSec) return phrases[0];
    return phrases[phrases.length - 1];
  }, [phrases, currentTimeSec]);

  // Current kinetic scene
  const activeScene = useMemo(() => {
    if (!kineticScenes || kineticScenes.length === 0) return FALLBACK_SCENE;
    for (const scene of kineticScenes) {
      if (currentTimeSec >= Math.max(0, scene.startSec - LEAD_PRE_ROLL_SEC) && currentTimeSec < scene.endSec) {
        return scene;
      }
    }
    return kineticScenes[kineticScenes.length - 1] || FALLBACK_SCENE;
  }, [kineticScenes, currentTimeSec]);

  const isLongHoldWord = Boolean(
    activeWord &&
      (activeWord.isLongHold ||
        (activeWord.endSec - (activeWord.audioStartSec ?? activeWord.startSec)) >= 0.64)
  );

  // Smooth camera zoom and tilt responding to emphasis and long holds
  const targetZoom = isLongHoldWord
    ? 1.15
    : activeWord?.emphasis
      ? 1.11
      : activeScene.cameraZoom || 1.05;
  const targetTilt = activeWord?.emphasis
    ? activeWordIdx % 2 === 0
      ? 3
      : -3
    : activeScene.cameraTilt || 0;

  const cameraSpring = spring({
    frame: frame % 120,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const zoomFactor = 1.0 + (targetZoom - 1.0) * cameraSpring;
  const currentAccent = activeWord?.accent || activeScene.accentColor || '#F59E0B';

  // Compute smooth 500ms pre-roll entrance + sustained vocal hold progress
  const vocalStartSec = activeWord ? (activeWord.audioStartSec ?? activeWord.startSec) : 0;
  const preRollStartSec = Math.max(0, vocalStartSec - LEAD_PRE_ROLL_SEC);
  const preRollStartFrame = Math.round(preRollStartSec * fps);
  const framesSincePreRoll = Math.max(0, frame - preRollStartFrame);

  const wordEntranceSpring = spring({
    frame: framesSincePreRoll,
    fps,
    config: { damping: 16, stiffness: 140 },
  });

  const holdSpanSec = activeWord ? Math.max(0.2, activeWord.endSec - vocalStartSec) : 0.5;
  const holdProgress = activeWord
    ? Math.max(0, Math.min(1, (currentTimeSec - vocalStartSec) / holdSpanSec))
    : 0;

  // Smooth breathing scale during sustained vocal holds
  const holdBreath = isLongHoldWord && currentTimeSec >= vocalStartSec
    ? 0.08 * Math.sin(holdProgress * Math.PI)
    : 0;
  const wordScale = 0.88 + 0.12 * wordEntranceSpring + holdBreath;
  const wordTranslateY = (1 - wordEntranceSpring) * 18;

  if (!words || words.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#090A0F',
          color: '#FFFFFF',
          fontFamily: "'Kalam', 'Noto Sans Devanagari', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, color: '#94A3B8' }}>
          Send a prompt or upload audio in chat to generate your video.
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#12110E',
        color: '#F6F2E9',
        fontFamily: "'Kalam', 'Noto Sans Devanagari', 'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* 1. Synchronized Song Audio & Real SFX Stem */}
      {audioUrl ? <Audio src={audioUrl} pauseWhenBuffering={false} /> : null}
      {sfxStemUrl && sfxEnabled ? (
        <Audio src={sfxStemUrl} pauseWhenBuffering={false} />
      ) : null}

      {/* 2. Warm Sketchbook Charcoal & Graphite Grid Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.12) 0%, transparent 65%), linear-gradient(to right, rgba(246,242,233,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(246,242,233,0.035) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          opacity: 0.95,
        }}
      />

      {/* Dynamic Ambient Glow reacting to sustained vocal hold */}
      <div
        style={{
          position: 'absolute',
          top: '34%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isLongHoldWord ? 720 : 560,
          height: isLongHoldWord ? 720 : 560,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentAccent}2E 0%, transparent 70%)`,
          filter: 'blur(55px)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Top HUD: -500ms Pre-Roll & Sustained Hold Status */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 48,
          right: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(26, 24, 20, 0.82)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 9999,
            padding: '8px 18px',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: currentAccent,
              boxShadow: `0 0 12px ${currentAccent}`,
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: '#F6F2E9',
            }}
          >
            {detectedLanguage}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 9999,
            padding: '8px 16px',
            fontFamily: 'monospace',
            fontSize: 19,
            color: '#34D399',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
            }}
          />
          <span>-500ms LEAD • HOLD SYNC</span>
        </div>
      </div>

      {/* 4. Main 3D Camera Stage */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 54px',
          transform: `perspective(1200px) scale(${zoomFactor.toFixed(3)}) rotateX(${targetTilt}deg)`,
          transformOrigin: 'center center',
          zIndex: 10,
        }}
      >
        {/* Scene Chapter Eyebrow */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: currentAccent,
            textTransform: 'uppercase',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ width: 28, height: 2, backgroundColor: currentAccent }} />
          <span>
            {activeScene.title} · {activeScene.headline}
          </span>
          <span style={{ width: 28, height: 2, backgroundColor: currentAccent }} />
        </div>

        {/* HERO ACTIVE WORD WITH 500MS PRE-ROLL & SUSTAINED HOLD BAR */}
        <div
          style={{
            minHeight: 250,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px 0',
          }}
        >
          {activeWord ? (
            <div
              style={{
                transform: `translateY(${wordTranslateY.toFixed(1)}px) scale(${wordScale.toFixed(3)})`,
                opacity: Math.min(1, 0.35 + wordEntranceSpring * 0.65),
                transformOrigin: 'center center',
                textAlign: 'center',
                padding: '22px 44px',
                borderRadius: 28,
                background: isLongHoldWord
                  ? `linear-gradient(135deg, ${currentAccent}33 0%, rgba(28,25,20,0.92) 100%)`
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${
                  isLongHoldWord ? currentAccent : 'rgba(246,242,233,0.18)'
                }`,
                boxShadow: isLongHoldWord
                  ? `0 24px 60px ${currentAccent}40, 0 0 36px ${currentAccent}30`
                  : '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              <span
                style={{
                  fontSize: isLongHoldWord ? 104 : 84,
                  fontWeight: 800,
                  color: isLongHoldWord ? currentAccent : '#F6F2E9',
                  textShadow: isLongHoldWord
                    ? `0 0 28px ${currentAccent}88, 0 4px 12px rgba(0,0,0,0.8)`
                    : '0 4px 12px rgba(0,0,0,0.6)',
                  lineHeight: 1.15,
                  display: 'inline-block',
                }}
              >
                {activeWord.word}
              </span>

              {/* Sustained Hold Melisma Bar when singer holds the note */}
              {isLongHoldWord && (
                <div
                  style={{
                    marginTop: 14,
                    width: '100%',
                    minWidth: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      height: 8,
                      width: '100%',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.12)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(holdProgress * 100)}%`,
                        background: `linear-gradient(90deg, ${currentAccent}, #FDE047)`,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      fontFamily: 'monospace',
                      color: '#FDE047',
                      letterSpacing: '0.08em',
                    }}
                  >
                    〰 VOCAL HOLD ({holdSpanSec.toFixed(2)}s)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ opacity: 0.3, fontSize: 32, color: '#94A3B8' }}>• • •</div>
          )}
        </div>

        {/* FULL PHRASE STREAM WITH 500MS EARLY PRE-ROLL */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '14px 18px',
            maxWidth: 960,
            padding: '26px 36px',
            background: 'rgba(24, 22, 18, 0.82)',
            backdropFilter: 'blur(20px)',
            borderRadius: 28,
            border: '1px solid rgba(246, 242, 233, 0.12)',
            marginTop: 16,
          }}
        >
          {activePhrase.map((w, idx) => {
            const wVocalStart = w.audioStartSec ?? w.startSec;
            const wPreRollStart = Math.max(0, wVocalStart - LEAD_PRE_ROLL_SEC);
            const isPreRoll = currentTimeSec >= wPreRollStart && currentTimeSec < wVocalStart;
            const isSungNow = currentTimeSec >= wVocalStart && currentTimeSec <= w.endSec;
            const isPast = currentTimeSec > w.endSec;

            const preRollAlpha = isPreRoll
              ? 0.45 + 0.55 * ((currentTimeSec - wPreRollStart) / LEAD_PRE_ROLL_SEC)
              : 1;

            let wordColor = 'rgba(246, 242, 233, 0.25)';
            let wordBg = 'transparent';
            let scaleVal = 1.0;

            if (isSungNow) {
              wordColor = '#12110E';
              wordBg = w.accent || currentAccent;
              scaleVal = w.isLongHold ? 1.15 : 1.08;
            } else if (isPreRoll) {
              wordColor = `rgba(253, 224, 71, ${preRollAlpha.toFixed(2)})`;
              wordBg = 'rgba(245, 158, 11, 0.14)';
              scaleVal = 1.03;
            } else if (isPast) {
              wordColor = 'rgba(246, 242, 233, 0.9)';
            }

            return (
              <span
                key={`${w.word}-${w.startSec}-${idx}`}
                style={{
                  fontSize: 42,
                  fontWeight: isSungNow || isPreRoll ? 800 : 600,
                  color: wordColor,
                  backgroundColor: wordBg,
                  padding: isSungNow || isPreRoll ? '6px 18px' : '6px 8px',
                  borderRadius: 16,
                  transform: `scale(${scaleVal})`,
                  display: 'inline-block',
                  boxShadow: isSungNow ? `0 0 24px ${wordBg}` : 'none',
                  borderBottom:
                    w.isLongHold && (isSungNow || isPast)
                      ? `3px solid ${w.accent || currentAccent}`
                      : 'none',
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom HUD: Animated Audio Waveform EQ & Timecode */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          left: 48,
          right: 48,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 6,
            height: 48,
            padding: '0 20px',
          }}
        >
          {Array.from({ length: 32 }).map((_, barIdx) => {
            const seed = (barIdx * 7.3 + frame * 0.4) % Math.PI;
            const isSpeaking = activeWord !== null;
            const baseHeight = isSpeaking ? 16 + Math.abs(Math.sin(seed + barIdx)) * 32 : 6;
            const barAccent = barIdx % 3 === 0 ? currentAccent : '#F6F2E9';

            return (
              <div
                key={barIdx}
                style={{
                  width: 6,
                  height: baseHeight,
                  borderRadius: 3,
                  backgroundColor: barAccent,
                  opacity: isSpeaking ? (barIdx % 2 === 0 ? 0.9 : 0.6) : 0.25,
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'rgba(26, 24, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 18,
            border: '1px solid rgba(246, 242, 233, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, color: '#A8A29E' }}>Audio Time:</span>
            <span
              style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 700, color: '#F59E0B' }}
            >
              {currentTimeSec.toFixed(2)}s / 24.03s
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, color: '#A8A29E' }}>Pre-Roll:</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#34D399' }}>
              -500ms Smooth Lead
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
