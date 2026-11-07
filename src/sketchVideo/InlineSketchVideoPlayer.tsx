import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  Pencil,
  Film,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Eye,
  Upload,
  Sparkles,
  Check,
  Edit3,
  Layers,
} from 'lucide-react';
import {
  buildSketchSongProject,
  renderSketchFrame,
  renderSketchContactSheet,
  preloadSketchSceneImages,
  SKETCH_SCENE_IMAGE_URLS,
  DEFAULT_INAAM_LYRICS,
  KISI_GHAZAL_AUDIO_URL,
  KISI_GHAZAL_DURATION_SEC,
  DEVANAGARI_FONT_STACKS,
  DevanagariFontPreset,
  SketchSongProject,
  SketchVignetteType,
} from './sketchCanvasEngine';

interface InlineSketchVideoPlayerProps {
  onOpenFullStudio: () => void;
  onOpenKinetic916: () => void;
}

const SCENE_DESCRIPTIONS: Record<
  SketchVignetteType,
  { titleHi: string; descHi: string; promptSummary: string }
> = {
  window_boy: {
    titleHi: 'Scene 1: खिड़की के पास बैठा लड़का (0.05s – 4.58s)',
    descHi: 'शाम के वक्त पुरानी लकड़ी की खिड़की और चाय के कप के पास बैठकर सोचता हुआ लड़का।',
    promptSummary: 'Boy sitting pensively by wooden window at dusk with teacup on sill',
  },
  rain_lamp: {
    titleHi: 'Scene 2: तेरे घर की गली में चलता लड़का (4.70s – 9.75s)',
    descHi: 'शांत गली में स्ट्रीटलैंप और बालकनी वाले घर की तरफ़ रोज़ निकलता हुआ लड़का।',
    promptSummary: 'Walking down quiet cobbled lane toward balcony house and glowing streetlamp',
  },
  shop_counter: {
    titleHi: 'Scene 3: मोड़ से वापस मुड़ता लड़का (9.82s – 14.20s)',
    descHi: 'चाय की दुकान और गेट के पास रुक कर "अज्ज नहीं कल करांगा" कह कर पीछे मुड़ता लड़का।',
    promptSummary: 'Pausing and turning back wistfully near corner tea stall and iron gate',
  },
  night_room: {
    titleHi: 'Scene 4: रात की मेज़, शायरी की डायरी और रेडियो (14.30s – 16.56s)',
    descHi: 'टेबल लैंप की रोशनी में खुली ग़ज़ल की नोटबुक, फाउंटेन पेन और पुराना कैसेट रेडियो।',
    promptSummary: 'Desk lamp at night with open poetry notebook, fountain pen, and cassette player',
  },
  train_window: {
    titleHi: 'Scene 5: खिड़की के पास कानों में ग़ज़ल सुनता लड़का (16.60s – 19.12s)',
    descHi: 'बारिश की बूंदों वाली खिड़की के पास आँखें बंद करके ईयरफ़ोन में धुन सुनता लड़का।',
    promptSummary: 'Young man with eyes closed wearing earphones by rainy window smiling softly',
  },
  teacups_sill: {
    titleHi: 'Scene 6: बालकनी में गिटार और दो चाय के कुल्हड़ (19.18s – 24.03s)',
    descHi: 'धूप वाली खुली छत/बालकनी में अकूस्टिक गिटार और दो गरम चाय के कप — सारा दिन गुनगुनाते हुए।',
    promptSummary: 'Acoustic guitar beside two steaming kulhad chai cups on sunny balcony ledge',
  },
};

export const InlineSketchVideoPlayer: React.FC<InlineSketchVideoPlayerProps> = ({
  onOpenFullStudio,
  onOpenKinetic916,
}) => {
  const [project] = useState<SketchSongProject>(() =>
    buildSketchSongProject({
      title: 'जिवें किसी ग़ज़ल दी धुन',
      artist: 'Sketchbook Acoustic Session',
      lyricsText: DEFAULT_INAAM_LYRICS,
      durationSec: KISI_GHAZAL_DURATION_SEC,
      audioUrl: KISI_GHAZAL_AUDIO_URL,
    })
  );

  // Default to 'storyboard-preview' so user ALWAYS reviews photos & full preview BEFORE video!
  const [stepMode, setStepMode] = useState<'storyboard-preview' | 'canvas' | 'mp4'>(
    'storyboard-preview'
  );
  const [approvedScenes, setApprovedScenes] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const [customSceneUrls, setCustomSceneUrls] = useState<Partial<Record<SketchVignetteType, string>>>({});
  const [customLoadedImages, setCustomLoadedImages] = useState<
    Partial<Record<SketchVignetteType, HTMLImageElement>>
  >({});
  const [selectedLightboxScene, setSelectedLightboxScene] = useState<number | null>(null);
  const [contactStills, setContactStills] = useState<
    Array<{ label: string; timeSec: number; dataUrl: string }>
  >([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'overview'>('follow');
  const [fontPreset, setFontPreset] = useState<DevanagariFontPreset>('amita');
  const [currentTime, setCurrentTime] = useState(1.2);
  const [imagesReadyTick, setImagesReadyTick] = useState(0);

  const liveTimeRef = useRef<number>(1.2);
  const lastUiSyncRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewFullPageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPerfRef = useRef<number>(0);

  // Preload the 6 generated pencil-sketch images and redraw canvas + contact sheet as soon as they load
  useEffect(() => {
    preloadSketchSceneImages(() => {
      setImagesReadyTick((t) => t + 1);
    });
  }, []);

  // Ensure web fonts trigger a fresh canvas redraw when ready
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        setImagesReadyTick((t) => t + 1);
      });
    }
  }, []);

  // Generate 6-frame contact sheet & full-page preview whenever images or fontPreset load
  useEffect(() => {
    const stills = renderSketchContactSheet(project);
    setContactStills(stills);

    if (previewFullPageCanvasRef.current) {
      const ctx = previewFullPageCanvasRef.current.getContext('2d');
      if (ctx) {
        renderSketchFrame(
          ctx,
          project,
          23.9,
          previewFullPageCanvasRef.current.width,
          previewFullPageCanvasRef.current.height,
          customLoadedImages,
          'overview',
          fontPreset
        );
      }
    }
  }, [project, imagesReadyTick, customLoadedImages, fontPreset]);

  // Handle custom image upload for any individual scene
  const handleReplaceSceneImage = (vignette: SketchVignetteType, file: File) => {
    const url = URL.createObjectURL(file);
    setCustomSceneUrls((prev) => ({ ...prev, [vignette]: url }));
    const img = new Image();
    img.onload = () => {
      setCustomLoadedImages((prev) => ({ ...prev, [vignette]: img }));
      setImagesReadyTick((t) => t + 1);
    };
    img.src = url;
  };

  // Seek helper
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
            canvasRef.current.height,
            customLoadedImages,
            cameraMode,
            fontPreset
          );
        }
      }
    },
    [project, customLoadedImages, cameraMode, fontPreset]
  );

  // Initial & paused frame draw
  useEffect(() => {
    if (!canvasRef.current || isPlaying || stepMode !== 'canvas') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    renderSketchFrame(
      ctx,
      project,
      currentTime,
      canvasRef.current.width,
      canvasRef.current.height,
      customLoadedImages,
      cameraMode,
      fontPreset
    );
  }, [project, currentTime, isPlaying, imagesReadyTick, stepMode, customLoadedImages, cameraMode, fontPreset]);

  // 60fps direct canvas loop while playing
  useEffect(() => {
    if (!isPlaying || stepMode !== 'canvas') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    lastPerfRef.current = performance.now();
    if (audioRef.current) {
      if (Math.abs(audioRef.current.currentTime - liveTimeRef.current) > 0.15) {
        audioRef.current.currentTime = liveTimeRef.current;
      }
      audioRef.current.play().catch(() => {});
    }

    const tick = (now: number) => {
      const dt = (now - lastPerfRef.current) / 1000;
      lastPerfRef.current = now;

      let nextTime = liveTimeRef.current + dt;
      if (audioRef.current && !audioRef.current.paused) {
        nextTime = audioRef.current.currentTime;
      }

      if (nextTime >= project.durationSec) {
        liveTimeRef.current = 0;
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        nextTime = 0;
      } else {
        liveTimeRef.current = nextTime;
      }

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          renderSketchFrame(
            ctx,
            project,
            nextTime,
            canvasRef.current.width,
            canvasRef.current.height,
            customLoadedImages,
            cameraMode,
            fontPreset
          );
        }
      }

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
  }, [isPlaying, project, stepMode, customLoadedImages, cameraMode, fontPreset]);

  const handleTogglePlay = () => {
    if (!isPlaying && liveTimeRef.current >= project.durationSec - 0.15) {
      seekToTime(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const activeVerse =
    project.verses.find(
      (v) => currentTime >= v.visualStartSec && currentTime <= v.endSec + 0.2
    ) || project.verses[0];

  const approvedCount = Object.values(approvedScenes).filter(Boolean).length;

  return (
    <div className="w-full rounded-2xl bg-[#1A1B1E] border-2 border-amber-500/45 shadow-[0_16px_50px_rgba(0,0,0,0.65)] overflow-hidden my-3">
      <audio
        ref={audioRef}
        src={KISI_GHAZAL_AUDIO_URL}
        preload="none"
        muted={isMuted}
        className="hidden"
      />

      {/* Top Navigation & Workflow Step Switcher */}
      <div className="px-4 py-3 bg-[#141518] border-b border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-white">
                जिवें किसी ग़ज़ल दी धुन — Sketch Storyboard &amp; Video Studio
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                Step 1: Photo &amp; Frame Review Gate
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Pehle 6 Pencil Photos aur Full Sketchbook Page Preview dekhein • Pasand aane par Video Play/Download karein
            </div>
          </div>
        </div>

        {/* 3 Clear Workflow Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepMode('storyboard-preview');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              stepMode === 'storyboard-preview'
                ? 'bg-amber-500 text-black border-amber-400 shadow'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-amber-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>1. Photos &amp; Preview ({approvedCount}/6)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStepMode('canvas');
              seekToTime(0);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              stepMode === 'canvas'
                ? 'bg-amber-500 text-black border-amber-400 shadow'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-neutral-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>2. Live Animated Preview</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepMode('mp4');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              stepMode === 'mp4'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>3. Ready MP4 Video</span>
          </button>
        </div>
      </div>

      {/* Attractive Calligraphic Devanagari Font Selector & Camera Focus Status Bar */}
      <div className="px-4 py-2 bg-[#17181C] border-b border-white/[0.07] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-amber-300 mr-1">
            देवनागरी Lyrics Font:
          </span>
          {(Object.keys(DEVANAGARI_FONT_STACKS) as DevanagariFontPreset[]).map((key) => {
            const item = DEVANAGARI_FONT_STACKS[key];
            const active = fontPreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFontPreset(key)}
                style={{ fontFamily: item.fontFamily }}
                className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                  active
                    ? 'bg-amber-500 text-black border-amber-300 font-bold shadow'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] text-amber-100 border-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
            ✓ Pure Sketch Reveal (No Pencil Icon)
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200">
            ✓ 1.85x Deep Camera Focus &amp; Word Follow
          </span>
        </div>
      </div>

      {/* =====================================================================
          STEP 1: PHOTOS & FULL SKETCHBOOK PREVIEW (REVIEW BEFORE VIDEO)
         ===================================================================== */}
      {stepMode === 'storyboard-preview' && (
        <div className="p-3 sm:p-4 space-y-4 bg-[#111214]">
          {/* Banner explaining how to review or request changes */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Step 1: Har Verse Ki Photo, Calligraphic Font &amp; Preview Check Karein</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Neeche gaane ki 6 lines ke liye banayi gayi <strong>6 Pencil-Sketch Photos</strong> aur <strong>Calligraphic Devanagari Lyrics</strong> hain. Upar se apna pasandida Devanagari font chunein aur Play दबाएं!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStepMode('canvas');
                seekToTime(0);
                setIsPlaying(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg transition shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Photos Pasand Hain → Play Animated Video</span>
            </button>
          </div>

          {/* 6 Large Scene Photo Cards (2-Column Grid on mobile/tablet, 3-Column on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.verses.map((v, idx) => {
              const imgUrl = customSceneUrls[v.vignette] || SKETCH_SCENE_IMAGE_URLS[v.vignette];
              const meta = SCENE_DESCRIPTIONS[v.vignette];
              const isApproved = approvedScenes[idx] ?? true;
              const heldWords = v.lines[0]?.words.filter((w) => w.isLongHold) || [];

              return (
                <div
                  key={v.verseIndex}
                  className={`rounded-xl overflow-hidden border transition-all flex flex-col justify-between ${
                    isApproved
                      ? 'bg-[#18191D] border-amber-500/35'
                      : 'bg-[#18191D] border-rose-500/50'
                  }`}
                >
                  {/* Large 4:3 Sketch Photo */}
                  <div>
                    <div
                      onClick={() => setSelectedLightboxScene(idx)}
                      className="aspect-[4/3] w-full bg-[#F6F2E9] relative overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={imgUrl}
                        alt={meta.titleHi}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                        Scene #{idx + 1} • {v.startSec.toFixed(2)}s – {v.endSec.toFixed(2)}s
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/75 text-white text-[10px] flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <Maximize2 className="w-3 h-3 text-amber-300" />
                        <span>Tap to Zoom</span>
                      </div>
                    </div>

                    {/* Scene Details & Exact Lyric Line */}
                    <div className="p-3 space-y-2">
                      <div className="text-xs font-bold text-amber-300">{meta.titleHi}</div>

                      {/* Exact Hindi Lyric Box with Calligraphic Devanagari Font */}
                      <div
                        style={{ fontFamily: DEVANAGARI_FONT_STACKS[fontPreset].fontFamily }}
                        className="p-2.5 rounded-lg bg-[#F6F2E9] text-[#1A1410] font-bold text-base leading-relaxed border border-amber-500/35 shadow-inner"
                      >
                        “{v.lines[0]?.text}”
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-relaxed">{meta.descHi}</p>

                      {/* Long Hold Words Info */}
                      {heldWords.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] font-mono text-amber-400">Long Hold:</span>
                          {heldWords.map((hw, hIdx) => (
                            <span
                              key={hIdx}
                              className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-200"
                            >
                              {hw.word} (〰{hw.holdDurationSec}s)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scene Card Actions: Approve / Change Photo / Preview Scene */}
                  <div className="px-3 py-2.5 bg-[#121316] border-t border-white/[0.06] flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setApprovedScenes((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isApproved ? 'Approved' : 'Needs Change'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Replace photo with custom upload */}
                      <label className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition">
                        <Upload className="w-3 h-3 text-amber-300" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleReplaceSceneImage(v.vignette, f);
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setStepMode('canvas');
                          seekToTime(Math.max(0, v.startSec - 0.5));
                          setIsPlaying(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/35 text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Test Scene</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FULL SKETCHBOOK PAGE PREVIEW (All 6 Photos + All Hindi Lyrics Together on Paper) */}
          <div className="rounded-xl bg-[#16171B] border border-amber-500/35 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Full Sketchbook Page Preview (Photos + Calligraphic Hindi Lyrics Combined)</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Video ke end (`24.03s`) tak poora sketchbook page aisa dikhega — saari 6 drawings aur unke samne calligraphic Hindi lyrics:
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenFullStudio}
                className="px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-amber-200 flex items-center gap-1.5 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open Full Studio &amp; 6-Still Contact Sheet</span>
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden border border-amber-500/30 shadow-xl bg-[#F6F2E9]">
              <canvas
                ref={previewFullPageCanvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain block"
              />
            </div>

            {/* 6 Time-Progress Contact Sheet Stills (16% -> 98%) */}
            {contactStills.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] font-semibold text-amber-300">
                  Timeline Contact Sheet (6 Stills from 3.8s to 23.6s — Tap any frame to play from there):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {contactStills.map((st, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        setStepMode('canvas');
                        seekToTime(st.timeSec);
                      }}
                      className="rounded-lg overflow-hidden border border-white/10 hover:border-amber-400 bg-[#121316] text-left group transition"
                    >
                      <div className="aspect-video w-full bg-[#F6F2E9] overflow-hidden">
                        <img
                          src={st.dataUrl}
                          alt={st.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="px-2 py-1 text-[10px] font-mono text-amber-200 truncate">
                        {st.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2 & 3: LIVE 60FPS ANIMATED CANVAS OR READY MP4 VIDEO PLAYER
         ===================================================================== */}
      {stepMode !== 'storyboard-preview' && (
        <div className="p-3 sm:p-4 space-y-3 bg-[#111214]">
          {stepMode === 'mp4' ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-[#F6F2E9]">
              <video
                src="/renders/kisi-ghazal-1080p-master.mp4?v=sketch4"
                controls
                playsInline
                className="w-full h-full object-contain bg-[#F6F2E9]"
              />
            </div>
          ) : (
            <div
              onClick={handleTogglePlay}
              className="relative aspect-video w-full rounded-xl overflow-hidden border border-amber-500/35 shadow-2xl cursor-pointer group bg-[#F6F2E9]"
            >
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain block"
              />

              {/* Center Big Play Button Overlay when paused */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.85)] transform group-hover:scale-105 transition">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-black/80 text-amber-200 text-xs font-semibold tracking-wide border border-amber-500/40 shadow">
                    ▶ Tap to Play: Pure Sketch Animation + Calligraphic Lyrics + Camera Focus (24.03s)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Transport & Scrubber Bar (for 60fps Canvas Mode) */}
          {stepMode === 'canvas' && (
            <div className="flex items-center gap-2 bg-[#18191C] px-3 py-2.5 rounded-xl border border-white/[0.07] flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-3.5 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 shadow transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  seekToTime(0);
                }}
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300"
                title="Restart from 0.00s"
              >
                <RotateCcw className="w-4 h-4" />
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
                className="flex-1 min-w-[110px] accent-amber-400 cursor-pointer"
              />

              <span className="text-xs font-mono text-amber-300 w-24 text-right shrink-0">
                {currentTime.toFixed(2)}s / 24.03s
              </span>

              <button
                type="button"
                onClick={() =>
                  setCameraMode((m) => (m === 'follow' ? 'overview' : 'follow'))
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border shrink-0 transition ${
                  cameraMode === 'follow'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                    : 'bg-white/[0.06] border-white/10 text-neutral-300'
                }`}
                title="Toggle Dynamic Camera Focus & Follow vs Full Page Overview"
              >
                {cameraMode === 'follow' ? '🎥 Cam: Focus & Follow' : '📄 Cam: Full Page'}
              </button>

              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            </div>
          )}

          {/* Live Word-by-Word -500ms Pre-Roll & Vocal Hold Bar */}
          <div className="px-3 py-2 rounded-xl bg-[#16171A] border border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 shrink-0 mr-1">
              Scene #{activeVerse.verseIndex + 1}:
            </span>
            {activeVerse.lines[0]?.words.map((w, idx) => {
              const preStart = w.visualStartSec ?? Math.max(0, w.startSec - 0.5);
              const isPreRoll = currentTime >= preStart && currentTime < w.startSec;
              const isSung = currentTime >= w.startSec && currentTime <= w.endSec;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStepMode('canvas');
                    seekToTime(preStart);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition ${
                    isSung
                      ? 'bg-amber-400 text-black font-bold shadow scale-105'
                      : isPreRoll
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
                        : w.isLongHold
                          ? 'bg-white/[0.07] text-amber-200 border border-amber-500/30'
                          : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1]'
                  }`}
                >
                  <span>{w.word}</span>
                  {w.isLongHold && (
                    <span className="text-[10px] font-mono opacity-85">〰{w.holdDurationSec}s</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Action & Download Bar */}
      <div className="px-4 py-3 bg-[#141518] border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setStepMode('storyboard-preview')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-amber-200 flex items-center gap-1.5 transition"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>View All 6 Scene Photos</span>
          </button>
          <button
            type="button"
            onClick={onOpenKinetic916}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-sky-300 flex items-center gap-1.5 transition"
          >
            <Film className="w-3.5 h-3.5" />
            <span>9:16 Reel View</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/renders/kisi-ghazal-1080p-master.mp4"
            download="kisi-ghazal-1080p-master.mp4"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Ready Video (MP4)</span>
          </a>

          <a
            href="/renders/kisi-ghazal-720p-whatsapp.mp4"
            download="kisi-ghazal-720p-whatsapp.mp4"
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>WhatsApp Copy (&lt;20MB)</span>
          </a>
        </div>
      </div>

      {/* Full-Resolution Photo Lightbox Modal when user taps any of the 6 photos */}
      {selectedLightboxScene !== null && project.verses[selectedLightboxScene] && (
        <div
          onClick={() => setSelectedLightboxScene(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full rounded-2xl bg-[#18191D] border border-amber-500/40 overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 bg-[#121316] border-b border-white/10 flex items-center justify-between">
              <div className="text-sm font-bold text-amber-300">
                {SCENE_DESCRIPTIONS[project.verses[selectedLightboxScene].vignette].titleHi}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLightboxScene(null)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="bg-[#F6F2E9] p-2">
              <img
                src={
                  customSceneUrls[project.verses[selectedLightboxScene].vignette] ||
                  SKETCH_SCENE_IMAGE_URLS[project.verses[selectedLightboxScene].vignette]
                }
                alt="Scene full preview"
                className="w-full max-h-[65vh] object-contain mx-auto rounded-lg"
              />
            </div>
            <div className="p-4 space-y-2 bg-[#18191D]">
              <div className="text-base font-bold text-white">
                Lyrics: “{project.verses[selectedLightboxScene].lines[0]?.text}”
              </div>
              <p className="text-xs text-neutral-300">
                {SCENE_DESCRIPTIONS[project.verses[selectedLightboxScene].vignette].descHi}
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedLightboxScene === 0}
                    onClick={() =>
                      setSelectedLightboxScene((s) => (s !== null && s > 0 ? s - 1 : s))
                    }
                    className="px-3 py-1.5 rounded-lg bg-white/10 disabled:opacity-40 text-xs text-white"
                  >
                    ← Prev Photo
                  </button>
                  <button
                    type="button"
                    disabled={selectedLightboxScene === project.verses.length - 1}
                    onClick={() =>
                      setSelectedLightboxScene((s) =>
                        s !== null && s < project.verses.length - 1 ? s + 1 : s
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-white/10 disabled:opacity-40 text-xs text-white"
                  >
                    Next Photo →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const v = project.verses[selectedLightboxScene];
                    setSelectedLightboxScene(null);
                    setStepMode('canvas');
                    seekToTime(Math.max(0, v.startSec - 0.5));
                    setIsPlaying(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  ▶ Play This Scene in Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
