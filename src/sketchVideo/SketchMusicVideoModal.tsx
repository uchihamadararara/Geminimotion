import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Pencil,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Grid,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Music,
  AlignLeft,
  Eye,
  Film,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  buildSketchSongProject,
  renderSketchFrame,
  renderSketchContactSheet,
  exportSketchMusicVideo,
  preloadSketchSceneImages,
  DEFAULT_INAAM_LYRICS,
  KISI_GHAZAL_AUDIO_URL,
  KISI_GHAZAL_DURATION_SEC,
  PRE_ROLL_SEC,
  SketchSongProject,
} from './sketchCanvasEngine';

interface SketchMusicVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialArtist?: string;
  initialLyrics?: string;
  initialAudioUrl?: string | null;
  initialAudioName?: string | null;
}

export const SketchMusicVideoModal: React.FC<SketchMusicVideoModalProps> = ({
  isOpen,
  onClose,
  initialTitle = 'जिवें किसी ग़ज़ल दी धुन',
  initialArtist = 'Sketchbook Acoustic Session',
  initialLyrics = DEFAULT_INAAM_LYRICS,
  initialAudioUrl = KISI_GHAZAL_AUDIO_URL,
  initialAudioName = 'kisigajal_26a21b29.mp3',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [artist, setArtist] = useState(initialArtist);
  const [lyricsText, setLyricsText] = useState(initialLyrics);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || KISI_GHAZAL_AUDIO_URL);
  const [audioFileName, setAudioFileName] = useState<string | null>(
    initialAudioName || 'kisigajal_26a21b29.mp3'
  );
  const [audioDuration, setAudioDuration] = useState<number>(KISI_GHAZAL_DURATION_SEC);
  const [imagesTick, setImagesTick] = useState(0);

  const [project, setProject] = useState<SketchSongProject>(() =>
    buildSketchSongProject({
      title: initialTitle,
      artist: initialArtist,
      lyricsText: initialLyrics,
      durationSec: KISI_GHAZAL_DURATION_SEC,
      audioUrl: initialAudioUrl || KISI_GHAZAL_AUDIO_URL,
    })
  );

  // Playback state — uses a direct mutable ref for 60fps zero-lag canvas rendering
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const liveTimeRef = useRef<number>(0);
  const lastUiSyncRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFramePerfRef = useRef<number>(0);

  // Contact sheet & workflow gates
  const [contactSheetStills, setContactSheetStills] = useState<
    Array<{ timeSec: number; label: string; dataUrl: string }>
  >([]);
  const [isGeneratingStills, setIsGeneratingStills] = useState(false);
  const [contactSheetApproved, setContactSheetApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'contact-sheet' | 'skill-md'>('contact-sheet');

  // Render & Overwrite protection state
  const [existingFiles, setExistingFiles] = useState<Record<string, boolean>>({});
  const [pendingOverwriteMode, setPendingOverwriteMode] = useState<
    '1080p-master' | '720p-whatsapp' | null
  >(null);
  const [isRendering, setIsRendering] = useState<'1080p-master' | '720p-whatsapp' | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [copiedSkillPath, setCopiedSkillPath] = useState(false);

  // Preload the 6 generated pencil-sketch illustrations
  useEffect(() => {
    preloadSketchSceneImages(() => {
      setImagesTick((t) => t + 1);
    });
  }, []);

  // Sync props when opened with slash command input
  useEffect(() => {
    if (!isOpen) return;
    if (initialTitle) setTitle(initialTitle);
    if (initialArtist) setArtist(initialArtist);
    if (initialLyrics) setLyricsText(initialLyrics);
    if (initialAudioUrl) {
      setAudioUrl(initialAudioUrl);
      setAudioFileName(initialAudioName || 'kisigajal_26a21b29.mp3');
    }
  }, [isOpen, initialTitle, initialArtist, initialLyrics, initialAudioUrl, initialAudioName]);

  // Rebuild project when inputs change
  useEffect(() => {
    const nextProj = buildSketchSongProject({
      title,
      artist,
      lyricsText,
      durationSec: audioDuration,
      audioUrl: audioUrl || KISI_GHAZAL_AUDIO_URL,
    });
    setProject(nextProj);
  }, [title, artist, lyricsText, audioDuration, audioUrl]);

  // Generate 6-Still Contact Sheet automatically when project or loaded sketch images change
  const generateStills = useCallback(() => {
    setIsGeneratingStills(true);
    window.setTimeout(() => {
      const stills = renderSketchContactSheet(project);
      setContactSheetStills(stills);
      setIsGeneratingStills(false);
    }, 30);
  }, [project]);

  useEffect(() => {
    if (isOpen) {
      generateStills();
    }
  }, [isOpen, generateStills, imagesTick]);

  // Helper to seek cleanly to a specific timestamp
  const seekToTime = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(project.durationSec, t));
      liveTimeRef.current = clamped;
      setCurrentTime(clamped);
      if (audioRef.current) {
        audioRef.current.currentTime = clamped;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          renderSketchFrame(
            ctx,
            project,
            clamped,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
    },
    [project]
  );

  // Draw current frame when paused or project/images change
  useEffect(() => {
    if (!isOpen || !canvasRef.current || isPlaying) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderSketchFrame(ctx, project, currentTime, canvas.width, canvas.height);
  }, [isOpen, project, currentTime, isPlaying, imagesTick]);

  // High-frame-rate 60fps direct canvas animation loop (ZERO React re-render lag!)
  useEffect(() => {
    if (!isPlaying || !isOpen) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    lastFramePerfRef.current = performance.now();
    if (audioRef.current && audioUrl) {
      if (Math.abs(audioRef.current.currentTime - liveTimeRef.current) > 0.15) {
        audioRef.current.currentTime = liveTimeRef.current;
      }
      audioRef.current.play().catch(() => {});
    }

    const tick = (now: number) => {
      const dt = (now - lastFramePerfRef.current) / 1000;
      lastFramePerfRef.current = now;

      let nextTime = liveTimeRef.current + dt;
      if (audioRef.current && audioUrl && !audioRef.current.paused) {
        nextTime = audioRef.current.currentTime;
      }

      if (nextTime >= project.durationSec) {
        liveTimeRef.current = project.durationSec;
        setCurrentTime(project.durationSec);
        setIsPlaying(false);
        return;
      }

      liveTimeRef.current = nextTime;

      // Render directly to HTML5 canvas at native 60fps without waiting for React state
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          renderSketchFrame(
            ctx,
            project,
            nextTime,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }

      // Throttle React UI scrubber state updates to ~12fps so DOM never lags the canvas
      if (now - lastUiSyncRef.current > 80) {
        lastUiSyncRef.current = now;
        setCurrentTime(nextTime);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, isOpen, audioUrl, project]);

  // Handle MP3 file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioFileName(file.name);

    const tempAudio = document.createElement('audio');
    tempAudio.preload = 'metadata';
    tempAudio.src = url;
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && isFinite(tempAudio.duration)) {
        const capped = Math.min(Math.max(6, tempAudio.duration), 90);
        setAudioDuration(Number(capped.toFixed(2)));
        seekToTime(0);
      }
    };
  };

  const getFileKey = (mode: '1080p-master' | '720p-whatsapp') => {
    const slug =
      (title || 'kisi-ghazal-sketch')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'kisi-ghazal-sketch';
    return mode === '1080p-master'
      ? `${slug}-1080p-master.mp4`
      : `${slug}-720p-whatsapp.mp4`;
  };

  // Trigger full video render with Contact Sheet + Overwrite gates
  const requestRender = (mode: '1080p-master' | '720p-whatsapp', forceOverwrite = false) => {
    if (!contactSheetApproved) {
      setActiveTab('contact-sheet');
      return;
    }

    const fileKey = getFileKey(mode);
    if (existingFiles[fileKey] && !forceOverwrite) {
      setPendingOverwriteMode(mode);
      return;
    }

    setPendingOverwriteMode(null);
    setIsPlaying(false);
    setIsRendering(mode);
    setRenderProgress(0);

    exportSketchMusicVideo({
      project,
      quality: mode,
      onProgress: (pct: number) => setRenderProgress(pct),
    })
      .then(() => {
        setExistingFiles((prev) => ({
          ...prev,
          [fileKey]: true,
        }));
      })
      .catch((err) => {
        console.error('Sketch render failed:', err);
      })
      .finally(() => {
        setIsRendering(null);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="none" className="hidden" />}

      <div className="w-full max-w-6xl max-h-[94vh] bg-[#141416] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-[#18181b] flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                  /sketch-music-video
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  -500ms Pre-Roll Lead
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Sustained Vocal Holds Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Synced to <code>kisigajal_26a21b29.mp3</code> (24.03s) • Words appear 500ms before vocal onset • Long-held words sustain with graphite wave
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              16:9 Sketch Studio
            </button>
            <button
              onClick={() => setActiveTab('contact-sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'contact-sheet'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Contact Sheet ({contactSheetStills.length} Stills)
              {contactSheetApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={() => setActiveTab('skill-md')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'skill-md'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              SKILL.md Spec
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overwrite Confirmation Prompt Banner */}
        {pendingOverwriteMode && (
          <div className="bg-amber-950/80 border-b border-amber-500/40 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Overwrite Confirmation Required:</strong>{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/40 font-mono">
                  {getFileKey(pendingOverwriteMode)}
                </code>{' '}
                already exists. Overwrite existing file?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => requestRender(pendingOverwriteMode, true)}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition"
              >
                Yes, Overwrite File
              </button>
              <button
                onClick={() => setPendingOverwriteMode(null)}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Song MP3 + Lyrics + Exact Word Hold Breakdown */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      1. Song Audio & Hand-Lettered Header
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      24.03s Exact Forced Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Song Title (Top-Left)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="जिवें किसी ग़ज़ल दी धुन"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Artist Name</label>
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="Sketchbook Acoustic Session"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-dashed border-zinc-700 hover:border-amber-500/50 text-xs text-zinc-200 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate font-mono">
                        {audioFileName ? `🎵 ${audioFileName}` : 'Attach Song MP3 / WAV'}
                      </span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="w-24">
                      <input
                        type="number"
                        step="0.01"
                        min={6}
                        max={180}
                        value={audioDuration}
                        onChange={(e) =>
                          setAudioDuration(Math.max(6, Number(e.target.value) || 24.03))
                        }
                        className="w-full px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono text-center"
                        title="Exact Audio Duration (seconds)"
                      />
                    </div>
                  </div>
                </div>

                {/* Lyrics & Sustained Vocal Holds Inspector */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <AlignLeft className="w-3.5 h-3.5 text-amber-400" />
                      2. Exact Lyrics (-{Math.round(PRE_ROLL_SEC * 1000)}ms Lead + Hold Sync)
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono">
                      {project.verses.length} Sketch Scenes
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={lyricsText}
                    onChange={(e) => setLyricsText(e.target.value)}
                    placeholder="Paste one sung lyric line per row..."
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-amber-500/50 resize-none"
                  />

                  {/* Verse & Sustained Word Hold Breakdown */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {project.verses.map((v) => {
                      const isActive =
                        currentTime >= v.visualStartSec && currentTime <= v.endSec;
                      return (
                        <div
                          key={v.verseIndex}
                          className={`p-2.5 rounded-lg border text-xs transition ${
                            isActive
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
                              : 'bg-zinc-950/70 border-zinc-800/70 text-zinc-300'
                          }`}
                        >
                          <div
                            onClick={() => seekToTime(v.visualStartSec)}
                            className="flex items-center justify-between cursor-pointer mb-1.5"
                          >
                            <span className="font-semibold truncate">
                              #{v.verseIndex + 1} · {v.lines[0]?.text}
                            </span>
                            <span className="font-mono text-[10px] text-amber-300 ml-2 shrink-0">
                              {v.startSec.toFixed(2)}s–{v.endSec.toFixed(2)}s
                            </span>
                          </div>
                          {/* Word pills with -500ms pre-roll & LONG HOLD tags */}
                          <div className="flex flex-wrap gap-1">
                            {v.lines[0]?.words.map((w, wIdx) => {
                              const isWordActive =
                                currentTime >= (w.visualStartSec ?? w.startSec - 0.5) &&
                                currentTime <= w.endSec;
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  onClick={() =>
                                    seekToTime(w.visualStartSec ?? Math.max(0, w.startSec - 0.5))
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition ${
                                    isWordActive
                                      ? 'bg-amber-400 text-black font-bold'
                                      : w.isLongHold
                                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                                  }`}
                                  title={`Audio: ${w.startSec}s–${w.endSec}s | Appears 500ms early at ${w.visualStartSec}s`}
                                >
                                  <span>{w.word}</span>
                                  {w.isLongHold && (
                                    <span className="font-mono text-[9px] opacity-90">
                                      〰{w.holdDurationSec}s
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live 60fps 16:9 HTML5 Sketchbook Canvas + Export Gate */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-3">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-700/70 shadow-inner bg-[#F6F2E9]">
                    <canvas
                      ref={canvasRef}
                      width={1280}
                      height={720}
                      className="w-full h-full object-contain block"
                    />
                  </div>

                  {/* Playback & Timeline Scrubber */}
                  <div className="flex items-center gap-3 px-1">
                    <button
                      onClick={() => {
                        if (liveTimeRef.current >= project.durationSec - 0.1) {
                          seekToTime(0);
                        }
                        setIsPlaying((p) => !p);
                      }}
                      className="px-3.5 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition shrink-0 shadow"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play Synced Song</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        seekToTime(0);
                      }}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="Reset to 0.00s"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={project.durationSec}
                      step={0.02}
                      value={currentTime}
                      onChange={(e) => {
                        setIsPlaying(false);
                        seekToTime(Number(e.target.value));
                      }}
                      className="flex-1 accent-amber-400 cursor-pointer"
                    />

                    <span className="text-xs font-mono text-zinc-300 w-28 text-right">
                      {currentTime.toFixed(2)}s / {project.durationSec.toFixed(2)}s
                    </span>
                  </div>
                </div>

                {/* Mandatory Workflow Gate: Contact Sheet Approval + Dual Render */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        3. Contact Sheet Stills & Dual Video Export (1080p + 720p WhatsApp)
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Click any still below to preview that moment on the page, or export the full 16:9 video with <code>kisigajal_26a21b29.mp3</code>.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('contact-sheet')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-300 font-medium flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Expand Contact Sheet
                    </button>
                  </div>

                  {/* Quick mini contact sheet bar */}
                  <div className="grid grid-cols-6 gap-2 pt-1">
                    {contactSheetStills.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          seekToTime(s.timeSec);
                        }}
                        className="group relative rounded overflow-hidden border border-zinc-700 hover:border-amber-400 transition"
                      >
                        <img
                          src={s.dataUrl}
                          alt={s.label}
                          className="w-full aspect-video object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-mono text-zinc-200 py-0.5 text-center">
                          {s.timeSec}s
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={contactSheetApproved}
                        onChange={(e) => setContactSheetApproved(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span>Contact Sheet Verified</span>
                    </label>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        disabled={Boolean(isRendering)}
                        onClick={() => requestRender('1080p-master')}
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 transition shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isRendering === '1080p-master'
                          ? `Rendering 1080p (${renderProgress}%)`
                          : 'Download 16:9 Master (1080p • 256k)'}
                      </button>

                      <button
                        disabled={Boolean(isRendering)}
                        onClick={() => requestRender('720p-whatsapp')}
                        className="px-3.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 disabled:opacity-50 text-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isRendering === '720p-whatsapp'
                          ? `Rendering 720p (${renderProgress}%)`
                          : 'Download 720p WhatsApp (<20 MB)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact-sheet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Pre-Render Contact Sheet of Stills (6 Keyframes)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Verify how each pencil vignette and handwritten lyric line fills the off-white sketchbook page over the 24.03s song. Earlier verses stay slightly faded (58% opacity).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateStills}
                    disabled={isGeneratingStills}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition"
                  >
                    Regenerate Stills
                  </button>
                  <button
                    onClick={() => {
                      setContactSheetApproved(true);
                      setActiveTab('studio');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Contact Sheet & Return to Studio
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contactSheetStills.map((still, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="aspect-video bg-[#F6F2E9] relative">
                      <img
                        src={still.dataUrl}
                        alt={still.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between text-xs border-t border-zinc-800">
                      <span className="font-medium text-zinc-200">{still.label}</span>
                      <button
                        onClick={() => {
                          seekToTime(still.timeSec);
                          setActiveTab('studio');
                        }}
                        className="text-amber-400 hover:underline font-mono text-[11px]"
                      >
                        Jump to {still.timeSec}s →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skill-md' && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Saved Claude Code Skill: <code>.claude/skills/sketch-music-video/SKILL.md</code>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configured with -500ms Pre-Roll Smooth Word Reveal & Sustained Vocal Hold Melisma Waves.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('.claude/skills/sketch-music-video/SKILL.md');
                    setCopiedSkillPath(true);
                    setTimeout(() => setCopiedSkillPath(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 transition"
                >
                  {copiedSkillPath ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedSkillPath ? 'Copied Path' : 'Copy Skill Path'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="font-semibold text-amber-300 mb-1">
                    1. -500ms Pre-Roll & Forced Alignment
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Every word begins its smooth cubic-bezier entrance exactly 500 milliseconds (<code>0.50s</code>) before its acoustic onset in <code>kisigajal_26a21b29.mp3</code> so there is zero reading lag.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="font-semibold text-amber-300 mb-1">
                    2. Sustained Vocal Hold Animation
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Long-held words (<code>करांगा</code> 1.42s, <code>वल्ल</code> 1.10s, <code>नूं</code> 0.91s, <code>धुन</code> 0.71s, <code>सुन</code> 0.87s, <code>गुन-गुनायी</code> 1.40s) stay active with a continuous graphite melisma wave (<code>〰</code>) and breathing scale.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="font-semibold text-amber-300 mb-1">
                    3. 60fps Direct Canvas + Dual MP4
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Renders directly to HTML5 Canvas at 60fps without React state overhead, and exports 16:9 1080p (AAC 256k) + 720p WhatsApp (&lt;20 MB).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
