import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Search,
  Download,
  CheckCircle2,
  Sliders,
  Play,
  Pause,
  Sparkles,
  FileAudio,
  Radio,
  Layers,
} from 'lucide-react';
import { WordTimestamp, KineticScene } from '../showreel/KineticAudioComposition';

export type SoundKitPreset = 'launch' | 'crisp' | 'calm' | 'minimal';
export type CueCategory = 'whoosh' | 'pop' | 'click' | 'impact' | 'chime' | 'riser' | 'paper';

export interface OpenverseCreditItem {
  id: string;
  cueType: CueCategory;
  title: string;
  creator: string;
  license: string;
  sourceUrl: string;
  localFile: string;
  durationMs: number;
  sourceEngine: 'Openverse CC0' | 'Earshot Forge DSP';
}

export interface SoundCueItem {
  id: string;
  cueType: CueCategory;
  label: string;
  reason: string;
  timeSec: number;
  frame30: number;
  sfxFile: string;
  sfxTitle: string;
  creator: string;
  license: string;
  duckedUnderVoice: boolean;
  gainDb: number;
  linearVolume: number;
}

export interface EarshotMomentCheck {
  index: number;
  timeSec: number;
  timecode: string;
  frame30: number;
  cueType: CueCategory;
  description: string;
  verdict: string;
}

export interface EarshotCritiqueReport {
  preset: SoundKitPreset;
  syncScore: number;
  balanceScore: number;
  loudnessLufs: number;
  truePeakDb: number;
  voiceHeadroomDb: number;
  maxFrameDrift: number;
  totalCuesPlaced: number;
  duckedCueCount: number;
  sfxStemUrl: string;
  creditsJsonUrl: string;
  cuesJsonUrl: string;
  fiveMomentsToCheck: EarshotMomentCheck[];
  listeningTimeline: { second: string; event: string }[];
  fixesApplied: string[];
}

interface SoundToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordTimestamp[];
  kineticScenes: KineticScene[];
  durationSec: number;
  currentReport?: EarshotCritiqueReport;
  currentCues?: SoundCueItem[];
  currentCredits?: OpenverseCreditItem[];
  onApplySoundDesign: (data: {
    cues: SoundCueItem[];
    credits: OpenverseCreditItem[];
    report: EarshotCritiqueReport;
    sfxStemUrl: string;
  }) => void;
  onJumpToFrame?: (frame30: number) => void;
}

const CUE_CATEGORIES: { id: CueCategory; label: string; desc: string }[] = [
  { id: 'whoosh', label: 'Whoosh', desc: 'Scene cuts & 3D camera sweeps' },
  { id: 'pop', label: 'Soft Pop', desc: 'Cards & kinetic phrases appearing' },
  { id: 'click', label: 'UI Click', desc: 'Tactile switches & HUD locks' },
  { id: 'impact', label: 'Deep Impact', desc: 'Big reveals & emphasized words' },
  { id: 'chime', label: 'Chime', desc: 'Notifications & brand resolve' },
  { id: 'riser', label: 'Riser', desc: 'Pre-reveal tension swell' },
  { id: 'paper', label: 'Paper', desc: 'Editorial card slide foley' },
];

export const SoundToolsModal: React.FC<SoundToolsModalProps> = ({
  isOpen,
  onClose,
  words,
  kineticScenes,
  durationSec,
  currentReport,
  currentCues = [],
  currentCredits = [],
  onApplySoundDesign,
  onJumpToFrame,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'openverse' | 'real-sfx' | 'earshot'>(
    'overview'
  );
  const [selectedPreset, setSelectedPreset] = useState<SoundKitPreset>(
    currentReport?.preset || 'launch'
  );
  const [searchQuery, setSearchQuery] = useState('whoosh');
  const [selectedCueCategory, setSelectedCueCategory] = useState<CueCategory>('whoosh');
  const [isSearchingOpenverse, setIsSearchingOpenverse] = useState(false);
  const [openverseResults, setOpenverseResults] = useState<
    Array<{
      id: string;
      title: string;
      creator: string;
      license: string;
      url: string;
      durationMs: number;
      source: string;
    }>
  >([]);
  const [credits, setCredits] = useState<OpenverseCreditItem[]>(currentCredits);
  const [cues, setCues] = useState<SoundCueItem[]>(currentCues);
  const [report, setReport] = useState<EarshotCritiqueReport | undefined>(currentReport);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentReport) setReport(currentReport);
    if (currentCues && currentCues.length > 0) setCues(currentCues);
    if (currentCredits && currentCredits.length > 0) setCredits(currentCredits);
  }, [currentReport, currentCues, currentCredits]);

  useEffect(() => {
    if (!isOpen) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setPlayingPreviewUrl(null);
      }
      return;
    }
    // Load initial tool status & credits when modal opens
    fetch('/api/sound-tools/status')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.credits)) {
          setCredits(data.credits);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlaySound = (url: string) => {
    if (playingPreviewUrl === url && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPlayingPreviewUrl(null);
      return;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const audio = new Audio(url);
    previewAudioRef.current = audio;
    setPlayingPreviewUrl(url);
    audio.onended = () => setPlayingPreviewUrl(null);
    audio.onerror = () => setPlayingPreviewUrl(null);
    audio.play().catch(() => setPlayingPreviewUrl(null));
  };

  const handleSearchOpenverse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchingOpenverse(true);
    try {
      const res = await fetch('/api/sound-tools/openverse-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery || selectedCueCategory,
          cueType: selectedCueCategory,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.results)) {
        setOpenverseResults(data.results);
      }
      if (Array.isArray(data.creditsUpdated)) {
        setCredits(data.creditsUpdated);
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingOpenverse(false);
    }
  };

  const handleRunFullSoundPipeline = async (presetToUse: SoundKitPreset = selectedPreset) => {
    setIsRunningPipeline(true);
    try {
      const res = await fetch('/api/sound-tools/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words,
          kineticScenes,
          durationSec,
          preset: presetToUse,
          hasVoiceover: true,
        }),
      });
      const data = await res.json();
      if (data.report && data.cues) {
        setCues(data.cues);
        setCredits(data.credits || credits);
        setReport(data.report);
        onApplySoundDesign({
          cues: data.cues,
          credits: data.credits || credits,
          report: data.report,
          sfxStemUrl: data.report.sfxStemUrl,
        });
      }
    } catch {
      // ignore
    } finally {
      setIsRunningPipeline(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#18191C] border-t sm:border border-white/[0.12] overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#141518]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <span>Real Sound Studio (Openverse · Real SFX · Earshot)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  3 Tools Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                CC0 recordings, frame-exact SFX placement (-12dB voice ducking), and Earshot LUFS critique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center text-neutral-400 hover:text-white bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 border-b border-white/[0.07] bg-[#16171A] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'overview', label: 'All 3 Sound Tools' },
              { id: 'openverse', label: '1. Openverse CC0' },
              { id: 'real-sfx', label: `2. Real SFX Cues (${cues.length})` },
              { id: 'earshot', label: '3. Earshot Critique & Forge' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-[#38BDF8] text-black shadow'
                  : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 3 Tools Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setActiveTab('openverse')}
                  className="p-3.5 rounded-2xl bg-[#121316] border border-white/[0.08] hover:border-[#38BDF8]/40 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">TOOL 01</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                      Connected
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Openverse CC0 API</div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    5.2M+ free audio files, no API key needed (`license=cc0`). Saves to `/sfx/credits.json`.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('real-sfx')}
                  className="p-3.5 rounded-2xl bg-[#121316] border border-white/[0.08] hover:border-[#38BDF8]/40 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-amber-400 font-bold">TOOL 02</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                      skills/real-sfx
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Real SFX Frame Placer</div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Places recordings on exact 30fps frames (`cues.json`), ducks -12dB under voice, exports WAV stem.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('earshot')}
                  className="p-3.5 rounded-2xl bg-[#121316] border border-white/[0.08] hover:border-[#38BDF8]/40 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-purple-400 font-bold">TOOL 03</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                      skills/earshot
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Earshot Critique & Forge</div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Measures LUFS loudness, frame sync drift, 5 ear-check moments, and forges custom sounds.
                  </p>
                </div>
              </div>

              {/* 1-Click Full 4-Step Pipeline Runner (From Page 2 of PDF) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#38BDF8]/15 via-[#16181D] to-emerald-500/10 border border-[#38BDF8]/30 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                      <span>Automated 4-Step Sound Design Workflow</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      1) Builds `cues.json` → 2) Loads CC0 `/sfx` + `credits.json` → 3) Places frame-locked SFX ducked under voice → 4) Runs Earshot `critique` & `measure`.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunFullSoundPipeline(selectedPreset)}
                    disabled={isRunningPipeline}
                    className="min-h-[42px] px-4 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-95 text-black font-semibold text-xs flex items-center gap-2 shadow-md shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>
                      {isRunningPipeline
                        ? 'Running Real SFX + Earshot...'
                        : 'Run Sound Design on Video'}
                    </span>
                  </button>
                </div>

                {/* Preset Selector (Earshot Kit Presets: launch, crisp, calm, minimal) */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-neutral-300 font-medium">
                    Earshot Sound Kit Preset:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['launch', 'crisp', 'calm', 'minimal'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(p);
                          handleRunFullSoundPipeline(p);
                        }}
                        className={`min-h-[32px] px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                          selectedPreset === p
                            ? 'bg-white text-black shadow'
                            : 'bg-white/[0.07] text-neutral-300 hover:bg-white/[0.12]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Sound Library & Downloads */}
              <div className="p-4 rounded-2xl bg-[#121316] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Ready `/sfx` Library ({credits.length} CC0 / Forged Sounds)
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="/sfx/sfx-stem-mix.wav"
                      download="sfx-stem-mix.wav"
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>SFX WAV Stem</span>
                    </a>
                    <a
                      href="/sfx/credits.json"
                      download="credits.json"
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 border border-white/[0.08] font-mono"
                    >
                      credits.json
                    </a>
                    <a
                      href="/sfx/cues.json"
                      download="cues.json"
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 border border-white/[0.08] font-mono"
                    >
                      cues.json
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {credits.map((item) => {
                    const isPlaying = playingPreviewUrl === item.localFile;
                    return (
                      <div
                        key={item.cueType}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => togglePlaySound(item.localFile)}
                            className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 hover:bg-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center shrink-0"
                            title="Listen to SFX"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {item.cueType.toUpperCase()} · {item.title}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              {item.license} · {item.durationMs}ms
                            </div>
                          </div>
                        </div>
                        <a
                          href={item.localFile}
                          download={`${item.cueType}.wav`}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-white shrink-0"
                          title="Download WAV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'openverse' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#121316] border border-white/[0.08] space-y-3">
                <div className="text-xs font-semibold text-white">
                  Search Openverse API (`https://api.openverse.org/v1/audio/?license=cc0`)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CUE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCueCategory(cat.id);
                        setSearchQuery(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedCueCategory === cat.id
                          ? 'bg-[#38BDF8] text-black font-semibold'
                          : 'bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearchOpenverse} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. whoosh, pop, click, impact, chime..."
                    className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-black/40 border border-white/[0.12] text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingOpenverse}
                    className="min-h-[42px] px-4 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] text-black font-semibold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSearchingOpenverse ? 'Searching...' : 'Search CC0'}</span>
                  </button>
                </form>
              </div>

              {openverseResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-300">
                    CC0 Results for `{selectedCueCategory}` (Saved to `/sfx/credits.json`)
                  </div>
                  {openverseResults.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{r.title}</div>
                        <div className="text-[11px] text-neutral-400">
                          Creator: {r.creator} · License: <span className="text-emerald-400 font-mono">{r.license}</span> · {r.durationMs}ms
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePlaySound(`/sfx/${selectedCueCategory}.wav`)}
                        className="min-h-[34px] px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs text-white flex items-center gap-1.5 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Preview</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'real-sfx' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Real SFX Frame-Accurate Cue List (`cues.json`)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Every sound is placed on its exact 30fps frame and ducked -12.0 dB under spoken words
                  </div>
                </div>
                <a
                  href="/sfx/sfx-stem-mix.wav"
                  download="sfx-stem-mix.wav"
                  className="min-h-[36px] px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SFX WAV Stem (Premiere / AE)</span>
                </a>
              </div>

              {cues.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#121316] border border-white/[0.07] text-center space-y-3">
                  <p className="text-xs text-neutral-400">
                    Click below to generate frame-accurate SFX cues for your video:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRunFullSoundPipeline(selectedPreset)}
                    className="min-h-[40px] px-4 rounded-xl bg-[#38BDF8] text-black font-semibold text-xs"
                  >
                    Generate Frame-Locked Cues Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cues.map((cue) => (
                    <div
                      key={cue.id}
                      onClick={() => {
                        if (onJumpToFrame) onJumpToFrame(cue.frame30);
                      }}
                      className="p-3 rounded-xl bg-[#121316] hover:bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlaySound(cue.sfxFile);
                          }}
                          className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {cue.label}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">
                            {cue.reason} · <span className="text-emerald-400">{cue.license}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-[#38BDF8]">
                          Frame {cue.frame30} ({cue.timeSec.toFixed(2)}s)
                        </div>
                        <div className="text-[10px] font-mono text-amber-300">
                          {cue.duckedUnderVoice ? `Ducked ${cue.gainDb}dB under voice` : `${cue.gainDb}dB`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earshot' && (
            <div className="space-y-4">
              {report ? (
                <>
                  {/* Scorecard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#121316] border border-white/[0.08]">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        Sync Score
                      </div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        {report.syncScore}/100
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {report.maxFrameDrift} frames drift
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#121316] border border-white/[0.08]">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        Mix Balance
                      </div>
                      <div className="text-lg font-bold text-[#38BDF8] mt-0.5">
                        {report.balanceScore}/100
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        -{report.voiceHeadroomDb}dB voice ducking
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#121316] border border-white/[0.08]">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        Loudness
                      </div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {report.loudnessLufs} LUFS
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Peak {report.truePeakDb} dBTP
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#121316] border border-white/[0.08]">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        Ducked Cues
                      </div>
                      <div className="text-lg font-bold text-amber-300 mt-0.5">
                        {report.duckedCueCount} / {report.totalCuesPlaced}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Zero voice masking
                      </div>
                    </div>
                  </div>

                  {/* 5 Moments to Check by Ear */}
                  <div className="p-3.5 rounded-2xl bg-[#121316] border border-white/[0.08] space-y-2.5">
                    <div className="text-xs font-semibold text-white">
                      5 Moments to Check by Ear (Earshot & Real SFX Report)
                    </div>
                    <div className="space-y-1.5">
                      {report.fiveMomentsToCheck.map((m) => (
                        <div
                          key={m.index}
                          onClick={() => {
                            if (onJumpToFrame) onJumpToFrame(m.frame30);
                          }}
                          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] flex items-center justify-between gap-2 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {m.index}
                            </span>
                            <span className="text-white font-medium truncate">
                              {m.description}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                            {m.verdict}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Second-by-Second Listening Timeline */}
                  {report.listeningTimeline.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#121316] border border-white/[0.08] space-y-2">
                      <div className="text-xs font-semibold text-white">
                        Earshot Second-by-Second Listening Transcript (`earshot timeline`)
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-[11px]">
                        {report.listeningTimeline.map((row, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-neutral-300">
                            <span className="text-[#38BDF8] shrink-0">{row.second}</span>
                            <span>{row.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 rounded-2xl bg-[#121316] border border-white/[0.07] text-center space-y-3">
                  <p className="text-xs text-neutral-400">
                    Run Earshot Critique & Measure on your video to inspect LUFS loudness, frame sync, and 5 ear-check moments.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRunFullSoundPipeline(selectedPreset)}
                    className="min-h-[40px] px-4 rounded-xl bg-[#38BDF8] text-black font-semibold text-xs"
                  >
                    Run Earshot Critique & Measure
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
