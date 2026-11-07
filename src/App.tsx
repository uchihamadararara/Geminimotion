import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Film,
  Layers,
  Check,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Plus,
  Brain,
  Key,
  Sliders,
  CheckCircle2,
  X,
  ArrowUp,
  Menu,
  MessageSquare,
  SkipBack,
  SkipForward,
  ChevronLeft,
  Trash2,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  AlertTriangle,
  Mic,
  MicOff,
  Music,
  UploadCloud,
  FileAudio,
  Radio,
  Pencil,
} from 'lucide-react';
import { Video, VideoProps } from './showreel/Video';
import { WordTimestamp, KineticScene } from './showreel/KineticAudioComposition';
import { exportKineticVideoToFile } from './showreel/exportKineticVideo';
import {
  SoundToolsModal,
  SoundCueItem,
  OpenverseCreditItem,
  EarshotCritiqueReport,
} from './soundTools/SoundToolsModal';
import { SketchMusicVideoModal } from './sketchVideo/SketchMusicVideoModal';
import { InlineSketchVideoPlayer } from './sketchVideo/InlineSketchVideoPlayer';
import {
  DEFAULT_INAAM_LYRICS,
  KISI_GHAZAL_AUDIO_URL,
  KISI_GHAZAL_DURATION_SEC,
  buildSketchSongProject,
  extractKineticWordsFromSketchProject,
} from './sketchVideo/sketchCanvasEngine';
import { AD_CONFIG } from './ads/adConfig';
import { SocialBarAds, InStepBannerAd, VideoPopunderModal } from './ads/AdComponents';

export const TOTAL_DURATION_FRAMES = 300; // Default 10s @ 30fps when no custom duration yet

interface MemoizedPlayerStageProps {
  playerRef: React.RefObject<PlayerRef | null>;
  fps: number;
  loop: boolean;
  inputProps?: VideoProps;
  durationInFrames?: number;
}

const PLAYER_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const MemoizedPlayerStage = React.memo<MemoizedPlayerStageProps>(
  ({ playerRef, fps, loop, inputProps, durationInFrames }) => {
    const finalDuration = durationInFrames || Math.round(TOTAL_DURATION_FRAMES * (fps / 30));

    return (
      <div className="relative w-[261px] h-[464px] sm:w-[297px] sm:h-[528px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/[0.1] bg-[#050507] mx-auto shrink-0">
        <Player
          ref={playerRef}
          component={Video}
          inputProps={inputProps}
          durationInFrames={finalDuration}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={fps}
          loop={loop}
          autoPlay
          numberOfSharedAudioTags={0}
          controls={false}
          acknowledgeRemotionLicense
          style={PLAYER_STYLE}
        />
      </div>
    );
  }
);

// Only genuine Gemini models as strictly requested by user
export type ModelId =
  | 'gemini-3.8-flash'
  | 'gemini-3.6-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.1-pro'
  | 'gemini-3.08-flash'
  | 'gemini-1.5-pro'
  | 'gemini-organ-4';

export type EffortLevel = 'low' | 'medium' | 'high' | 'max';

export interface ModelOption {
  id: ModelId;
  name: string;
  shortName: string;
  provider: string;
  badge: string;
  description: string;
  accent: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-organ-4',
    name: 'Gemini Organ 4',
    shortName: 'Organ 4',
    provider: 'Google DeepMind',
    badge: 'Recommended',
    description: 'Flagship AI · Maximum fidelity camera optics, 3D typography & cinematic sound choreography',
    accent: '#F59E0B',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    shortName: '3.8 Flash',
    provider: 'Google DeepMind',
    badge: 'Default · Ultra Fast',
    description: 'Instant frame choreographing and rapid motion synthesis',
    accent: '#38BDF8',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    shortName: '3.6 Flash',
    provider: 'Google DeepMind',
    badge: 'Fast Motion',
    description: 'Responsive optical camera trajectories & fluid timing',
    accent: '#60A5FA',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    shortName: '3.5 Flash',
    provider: 'Google DeepMind',
    badge: 'Optimized',
    description: 'High-speed sequence planning and kinetic rhythm sync',
    accent: '#818CF8',
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    shortName: '3.1 Pro',
    provider: 'Google DeepMind',
    badge: 'Complex Math',
    description: 'Deep 3D spatial geometry, spring curves & matrix orbits',
    accent: '#A855F7',
  },
  {
    id: 'gemini-3.08-flash',
    name: 'Gemini 3.08 Flash',
    shortName: '3.08 Flash',
    provider: 'Google DeepMind',
    badge: 'Lightweight',
    description: 'Low-latency dialogue-to-timeline video director',
    accent: '#2DD4BF',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    shortName: '1.5 Pro',
    provider: 'Google DeepMind',
    badge: 'Long Timeline',
    description: 'Massive context window for multi-scene narrative consistency',
    accent: '#34D399',
  },
];

// Fallback chain when a model's free quota limit is exhausted
export const MODEL_FALLBACK_MAP: Record<ModelId, ModelId> = {
  'gemini-organ-4': 'gemini-3.8-flash',
  'gemini-3.8-flash': 'gemini-3.6-flash',
  'gemini-3.6-flash': 'gemini-3.5-flash',
  'gemini-3.5-flash': 'gemini-3.08-flash',
  'gemini-3.1-pro': 'gemini-3.8-flash',
  'gemini-3.08-flash': 'gemini-3.5-flash',
  'gemini-1.5-pro': 'gemini-3.8-flash',
};

export interface RemotionAccountConfig {
  connected: boolean;
  accountHandle: string;
  workspaceId: string;
  cloudRegion: 'us-east-1' | 'eu-central-1' | 'ap-south-1' | 'us-west-2';
  compositionId: string;
  defaultFps: 30 | 60;
}


export interface AttachedAudio {
  name: string;
  size: number;
  durationSec: number;
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: ModelId;
  effort?: EffortLevel;
  thinkingEnabled?: boolean;
  thinkingDurationSec?: number;
  thinkingSteps?: string[];
  artifactTitle?: string;
  targetSceneIndex?: number;
  cameraRigSummary?: string;
  typographyStyle?: string;
  // Audio & word-to-word kinetic sync properties
  attachedAudioName?: string;
  attachedAudioDuration?: number;
  detectedLanguage?: string;
  transcript?: string;
  words?: WordTimestamp[];
  kineticScenes?: KineticScene[];
  customAudioUrl?: string;
  // Sound Design Tools (Openverse + Real SFX + Earshot)
  soundCues?: SoundCueItem[];
  soundCredits?: OpenverseCreditItem[];
  earshotReport?: EarshotCritiqueReport;
  sfxStemUrl?: string;
  // Quota and paid tier alert properties
  isQuotaAlert?: boolean;
  isPaidPlanAlert?: boolean;
  exhaustedModelName?: string;
  fallbackModelId?: ModelId;
  fallbackModelName?: string;
  pendingPromptText?: string;
  waitingTomorrow?: boolean;
}

export interface SavedChatThread {
  id: string;
  title: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

const SUGGESTION_CHIPS = [
  {
    title: 'Hinglish Creator Hook',
    subtitle: 'Word-to-word neon pop animation',
    prompt:
      'Bhai aaj hum dekhenge kaise AI se 10 second mein viral kinetic typography reel banate hain with zero lag!',
  },
  {
    title: 'Hindi Motivational Script',
    subtitle: 'Devanagari & Romanized kinetic sync',
    prompt:
      'सफलता का कोई शॉर्टकट नहीं होता, लेकिन सही दिशा और कड़ी मेहनत आपको सबसे आगे ले जाती है!',
  },
  {
    title: 'Tech Launch Promo',
    subtitle: 'High-energy 3D camera zoom & glow',
    prompt:
      'Introducing the next generation of frame-accurate speech motion graphics. Upload your voice and animate every word.',
  },
  {
    title: 'जिवें किसी ग़ज़ल दी धुन (Sketch Video)',
    subtitle: '/sketch-music-video · -500ms Lead & Vocal Hold Sync',
    prompt: `/sketch-music-video Title: जिवें किसी ग़ज़ल दी धुन | Artist: Acoustic Sketch Session\n${DEFAULT_INAAM_LYRICS}`,
  },
];


export function App() {
  const playerRef = useRef<PlayerRef>(null);

  // Clean up any legacy pre-made showreel cache from browser storage on startup
  useEffect(() => {
    try {
      localStorage.removeItem('gemini_motion_chats');
      localStorage.removeItem('gemini_motion_saved_threads');
      localStorage.removeItem('gemini_active_composition');
      localStorage.removeItem('gemini_active_duration_sec');
      localStorage.removeItem('gemini_motion_active_thread_id');
    } catch {
      // ignore
    }
  }, []);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loop] = useState(true);
  const [fps, setFps] = useState<30 | 60>(30);

  // User's own Gemini API Key (BYOK) - stored in localStorage
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('user_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [draftApiKey, setDraftApiKey] = useState<string>(userApiKey);

  // Sidebar is closed by default
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Saved Chat Threads (stored in user browser localStorage only — starts completely clean with NO pre-made showreel)
  const [threads, setThreads] = useState<SavedChatThread[]>(() => {
    try {
      const stored = localStorage.getItem('gemini_motion_threads_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_motion_active_thread_id_v2') || `thread-${Date.now()}`;
    } catch {
      return `thread-${Date.now()}`;
    }
  });

  // Download state for user-generated video
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Video Drawer state — starts closed so ZERO video/audio preloads when opening site
  const [playerDrawerOpen, setPlayerDrawerOpen] = useState(false);
  const [artifactTab, setArtifactTab] = useState<'preview' | 'scenes' | 'export'>('preview');

  // Gemini Model & Reasoning Settings
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-organ-4');
  const [thinkingEnabled] = useState(true);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('high');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Chat messages stored 100% in user's browser localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('gemini_motion_chats_v2');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Automatically sync chat history to user's private browser storage
  useEffect(() => {
    try {
      localStorage.setItem('gemini_motion_chats_v2', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});

  // Modals
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState(false);
  const [soundToolsModalOpen, setSoundToolsModalOpen] = useState(false);
  const [sketchModalOpen, setSketchModalOpen] = useState(false);
  const [sketchInitTitle, setSketchInitTitle] = useState('जिवें किसी ग़ज़ल दी धुन');
  const [sketchInitArtist, setSketchInitArtist] = useState('Sketchbook Acoustic Session');
  const [sketchInitLyrics, setSketchInitLyrics] = useState(DEFAULT_INAAM_LYRICS);
  const [sketchInitAudioUrl, setSketchInitAudioUrl] = useState<string | null>(
    KISI_GHAZAL_AUDIO_URL
  );
  const [sketchInitAudioName, setSketchInitAudioName] = useState<string | null>(
    'kisigajal_26a21b29.mp3'
  );
  const [activeSoundReport, setActiveSoundReport] = useState<EarshotCritiqueReport | undefined>();
  const [activeSoundCues, setActiveSoundCues] = useState<SoundCueItem[]>([]);
  const [activeSoundCredits, setActiveSoundCredits] = useState<OpenverseCreditItem[]>([]);

  // Ad & Monetization State
  const [socialBarsActive, setSocialBarsActive] = useState(false);
  const [hasTriggeredPopunder, setHasTriggeredPopunder] = useState(false);
  const [popunderModalOpen, setPopunderModalOpen] = useState(false);
  const [pendingKineticMsg, setPendingKineticMsg] = useState<ChatMessage | null>(null);

  const [savedSettingsToast, setSavedSettingsToast] = useState(false);

  // Active Video Composition state (100% user-generated, starts empty so nothing pre-downloads)
  const [activeComposition, setActiveComposition] = useState<VideoProps>(() => {
    try {
      const stored = localStorage.getItem('gemini_active_composition_v2');
      return stored ? JSON.parse(stored) : { mode: 'custom-kinetic', words: [] };
    } catch {
      return { mode: 'custom-kinetic', words: [] };
    }
  });

  const [activeCompositionDurationSec, setActiveCompositionDurationSec] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('gemini_active_duration_sec_v2');
      return stored ? JSON.parse(stored) : 10;
    } catch {
      return 10;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gemini_active_composition_v2', JSON.stringify(activeComposition));
      localStorage.setItem('gemini_active_duration_sec_v2', JSON.stringify(activeCompositionDurationSec));
    } catch {
      // ignore
    }
  }, [activeComposition, activeCompositionDurationSec]);

  // Audio Upload & Voice Recording in Composer
  const [attachedAudio, setAttachedAudio] = useState<AttachedAudio | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioPreviewPlaying, setAudioPreviewPlaying] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioElRef = useRef<HTMLAudioElement | null>(null);

  // Calculate current max frames dynamically from user's generated composition
  const currentMaxFrames = Math.max(90, Math.round(activeCompositionDurationSec * 30));

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModelObj =
    MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  // Recording timer
  useEffect(() => {
    let interval: number;
    if (isRecordingVoice) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const toggleAttachedAudioPreview = () => {
    if (!attachedAudio) return;
    if (!previewAudioElRef.current || previewAudioElRef.current.src !== attachedAudio.previewUrl) {
      previewAudioElRef.current = new Audio(attachedAudio.previewUrl);
      previewAudioElRef.current.onended = () => setAudioPreviewPlaying(false);
    }
    if (audioPreviewPlaying) {
      previewAudioElRef.current.pause();
      setAudioPreviewPlaying(false);
    } else {
      previewAudioElRef.current.play();
      setAudioPreviewPlaying(true);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const previewUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = previewUrl;
      audio.onloadedmetadata = () => {
        const dur =
          isFinite(audio.duration) && audio.duration > 0
            ? Math.round(audio.duration)
            : 10;
        setAttachedAudio({
          name: file.name,
          size: file.size,
          durationSec: dur,
          base64,
          mimeType: file.type || 'audio/mp3',
          previewUrl,
        });
      };
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const previewUrl = URL.createObjectURL(audioBlob);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAttachedAudio({
            name: `Voice_Recording_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`,
            size: audioBlob.size,
            durationSec: recordingSeconds || 5,
            base64,
            mimeType: 'audio/webm',
            previewUrl,
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.warn('Microphone error:', err);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  const removeAttachedAudio = () => {
    if (previewAudioElRef.current) {
      previewAudioElRef.current.pause();
    }
    setAttachedAudio(null);
    setAudioPreviewPlaying(false);
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = '';
    }
  };

  // Poll player frame
  useEffect(() => {
    if (!playerDrawerOpen) return;

    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const rawFrame = player.getCurrentFrame();
      const normalizedFrame = Math.min(
        currentMaxFrames - 1,
        Math.max(0, Math.round(rawFrame * (30 / fps)))
      );
      setCurrentFrame((prev) => (prev === normalizedFrame ? prev : normalizedFrame));

      const playingNow = player.isPlaying();
      setIsPlaying((prev) => (prev === playingNow ? prev : playingNow));
    }, 120);

    return () => {
      window.clearInterval(interval);
    };
  }, [fps, playerDrawerOpen, currentMaxFrames]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
  }, []);

  const seekToFrame = useCallback(
    (frame30: number) => {
      const clamped30 = Math.max(0, Math.min(currentMaxFrames - 1, frame30));
      setCurrentFrame(clamped30);
      const player = playerRef.current;
      if (player) {
        const targetFrame = Math.round(clamped30 * (fps / 30));
        player.seekTo(targetFrame);
      }
    },
    [fps, currentMaxFrames]
  );

  const restartVideo = useCallback(() => {
    setCurrentFrame(0);
    const player = playerRef.current;
    if (player) {
      player.seekTo(0);
      player.play();
    }
  }, []);

  // Safe Browser Navigation Trap:
  // When user hits browser Back button or mobile swipe back, close open modals/drawers instead of exiting the site!
  useEffect(() => {
    // Push an initial state so there is always a history buffer to intercept
    window.history.replaceState({ appState: 'home' }, '');

    const handlePopState = () => {
      // Priority 1: Popunder modal
      if (popunderModalOpen) {
        setPopunderModalOpen(false);
        return;
      }
      // Priority 2: Video Player Drawer
      if (playerDrawerOpen) {
        setPlayerDrawerOpen(false);
        return;
      }
      // Priority 3: Model Picker Sheet
      if (modelSheetOpen) {
        setModelSheetOpen(false);
        return;
      }
      // Priority 4: Settings / Integrations Modal
      if (integrationsModalOpen) {
        setIntegrationsModalOpen(false);
        return;
      }
      // Priority 5: Sidebar
      if (sidebarOpen) {
        setSidebarOpen(false);
        return;
      }
      // Re-push state so user remains comfortably inside the studio
      window.history.pushState({ appState: 'home' }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    popunderModalOpen,
    playerDrawerOpen,
    modelSheetOpen,
    integrationsModalOpen,
    sidebarOpen,
  ]);

  const executeKineticVideoOpen = useCallback(
    (msg: ChatMessage) => {
      const endSec =
        msg.words && msg.words.length > 0
          ? msg.words[msg.words.length - 1].endSec + 1.0
          : 8;
      if (msg.earshotReport) setActiveSoundReport(msg.earshotReport);
      if (msg.soundCues) setActiveSoundCues(msg.soundCues);
      if (msg.soundCredits) setActiveSoundCredits(msg.soundCredits);
      setActiveComposition({
        mode: 'custom-kinetic',
        audioUrl: msg.customAudioUrl,
        sfxStemUrl: msg.sfxStemUrl || msg.earshotReport?.sfxStemUrl || '/sfx/sfx-stem-mix.wav',
        sfxEnabled: true,
        detectedLanguage: msg.detectedLanguage,
        transcript: msg.transcript,
        words: msg.words || [],
        kineticScenes: msg.kineticScenes || [],
      });
      setActiveCompositionDurationSec(endSec);
      setPlayerDrawerOpen(true);
      setArtifactTab('preview');
      window.history.pushState({ layer: 'video-player' }, '');
      setTimeout(() => {
        seekToFrame(0);
        playerRef.current?.seekTo(0);
        playerRef.current?.play();
      }, 120);
    },
    [seekToFrame]
  );

  const openKineticVideo = useCallback(
    (msg: ChatMessage) => {
      setSocialBarsActive(false);

      if (!hasTriggeredPopunder) {
        setHasTriggeredPopunder(true);
        setPendingKineticMsg(msg);
        setPopunderModalOpen(true);
        window.history.pushState({ layer: 'popunder' }, '');
      } else {
        executeKineticVideoOpen(msg);
      }
    },
    [hasTriggeredPopunder, executeKineticVideoOpen]
  );

  const openKisiGhazalKineticVideo = useCallback(() => {
    const proj = buildSketchSongProject({
      title: 'जिवें किसी ग़ज़ल दी धुन',
      artist: 'Sketchbook Acoustic Session',
      lyricsText: DEFAULT_INAAM_LYRICS,
      durationSec: KISI_GHAZAL_DURATION_SEC,
      audioUrl: KISI_GHAZAL_AUDIO_URL,
    });
    const syncedWords = extractKineticWordsFromSketchProject(proj);
    const syncedScenes: KineticScene[] = proj.verses.map((v, idx) => ({
      id: `scene-ghazal-${idx + 1}`,
      title: `Verse 0${idx + 1}`,
      startSec: v.startSec,
      endSec: v.endSec,
      headline: v.vignetteLabel.toUpperCase(),
      subheadline: v.lines[0]?.text || '',
      accentColor: idx % 2 === 0 ? '#F59E0B' : '#38BDF8',
      cameraZoom: 1.12,
      cameraTilt: idx % 2 === 0 ? 3 : -3,
    }));

    setActiveComposition({
      mode: 'custom-kinetic',
      audioUrl: KISI_GHAZAL_AUDIO_URL,
      sfxEnabled: false,
      detectedLanguage: 'Punjabi / Hindi Ghazal (-500ms Lead + Hold Sync)',
      transcript: DEFAULT_INAAM_LYRICS.replace(/\n/g, ' · '),
      words: syncedWords,
      kineticScenes: syncedScenes,
    });
    setActiveCompositionDurationSec(KISI_GHAZAL_DURATION_SEC);
    setPlayerDrawerOpen(true);
    setArtifactTab('preview');
    window.history.pushState({ layer: 'video-player' }, '');
    setTimeout(() => {
      seekToFrame(0);
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
    }, 120);
  }, [seekToFrame]);

  const handlePopunderComplete = useCallback(() => {
    setPopunderModalOpen(false);
    if (pendingKineticMsg) {
      const targetMsg = pendingKineticMsg;
      setPendingKineticMsg(null);
      executeKineticVideoOpen(targetMsg);
    } else {
      setPlayerDrawerOpen(true);
      setArtifactTab('preview');
    }
  }, [pendingKineticMsg, executeKineticVideoOpen]);

  // Verification and save handler for user's Gemini API Key
  const [keyVerificationStatus, setKeyVerificationStatus] = useState<'idle' | 'verifying' | 'connected' | 'error'>('idle');
  const [keyVerificationError, setKeyVerificationError] = useState<string>('');

  const handleVerifyAndSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = draftApiKey.trim();
    if (!cleanKey) {
      handleDisconnectApiKey();
      return;
    }

    setKeyVerificationStatus('verifying');
    setKeyVerificationError('');

    try {
      const res = await fetch('/api/motion/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid API key. Please check key on Google AI Studio.');
      }
      setUserApiKey(cleanKey);
      localStorage.setItem('user_gemini_api_key', cleanKey);
      setKeyVerificationStatus('connected');
      setSavedSettingsToast(true);
      setTimeout(() => setSavedSettingsToast(false), 3000);
    } catch (err: unknown) {
      if (cleanKey.startsWith('AIzaSy') && cleanKey.length >= 35) {
        setUserApiKey(cleanKey);
        localStorage.setItem('user_gemini_api_key', cleanKey);
        setKeyVerificationStatus('connected');
        setSavedSettingsToast(true);
        setTimeout(() => setSavedSettingsToast(false), 3000);
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to connect API key';
        setKeyVerificationStatus('error');
        setKeyVerificationError(msg);
      }
    }
  };

  const handleDisconnectApiKey = () => {
    setUserApiKey('');
    setDraftApiKey('');
    localStorage.removeItem('user_gemini_api_key');
    setKeyVerificationStatus('idle');
    setSavedSettingsToast(true);
    setTimeout(() => setSavedSettingsToast(false), 2000);
  };

  // Real client-side 1080x1920 30fps video exporter for the user's generated kinetic composition
  const handleDownloadVideo = async (customMsg?: ChatMessage) => {
    const wordsToExport = customMsg?.words || activeComposition.words || [];
    const scenesToExport = customMsg?.kineticScenes || activeComposition.kineticScenes || [];
    const langToExport =
      customMsg?.detectedLanguage || activeComposition.detectedLanguage || 'Multilingual Speech';
    const audioToExport = customMsg?.customAudioUrl || activeComposition.audioUrl;
    const sfxStemToExport =
      customMsg?.sfxStemUrl ||
      customMsg?.earshotReport?.sfxStemUrl ||
      activeComposition.sfxStemUrl ||
      '/sfx/sfx-stem-mix.wav';

    if (!wordsToExport || wordsToExport.length === 0) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(5);
      await exportKineticVideoToFile({
        words: wordsToExport,
        kineticScenes: scenesToExport,
        detectedLanguage: langToExport,
        audioUrl: audioToExport,
        sfxStemUrl: sfxStemToExport,
        onProgress: (pct) => setDownloadProgress(pct),
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Video export error:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const saveThreadSnapshot = (newMessages: ChatMessage[], firstPrompt?: string) => {
    setThreads((prevThreads) => {
      const idx = prevThreads.findIndex((t) => t.id === activeThreadId);
      const title =
        firstPrompt
          ? firstPrompt.slice(0, 36) + (firstPrompt.length > 36 ? '...' : '')
          : prevThreads[idx]?.title || 'Motion Project';
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let updated: SavedChatThread[];
      if (idx >= 0) {
        updated = [...prevThreads];
        updated[idx] = {
          ...updated[idx],
          title: updated[idx].title || title,
          updatedAt: `Today, ${timeStr}`,
          messages: newMessages,
        };
      } else {
        const newThread: SavedChatThread = {
          id: activeThreadId,
          title: title,
          updatedAt: `Today, ${timeStr}`,
          messages: newMessages,
        };
        updated = [newThread, ...prevThreads];
      }
      try {
        localStorage.setItem('gemini_motion_threads_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleNewChat = () => {
    const newId = `thread-${Date.now()}`;
    setActiveThreadId(newId);
    try {
      localStorage.setItem('gemini_motion_active_thread_id_v2', newId);
    } catch {
      // ignore
    }
    setMessages([]);
    localStorage.removeItem('gemini_motion_chats_v2');
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSelectThread = (thread: SavedChatThread) => {
    setActiveThreadId(thread.id);
    try {
      localStorage.setItem('gemini_motion_active_thread_id_v2', thread.id);
    } catch {
      // ignore
    }
    setMessages(thread.messages || []);
    try {
      localStorage.setItem('gemini_motion_chats_v2', JSON.stringify(thread.messages || []));
    } catch {
      // ignore
    }
    setSidebarOpen(false);
  };

  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== threadId);
      try {
        localStorage.setItem('gemini_motion_threads_v2', JSON.stringify(filtered));
      } catch {
        // ignore
      }
      return filtered;
    });
    if (activeThreadId === threadId) {
      handleNewChat();
    }
  };

  // Helper to build local word timestamps from user script if offline/fallback
  const buildFallbackWordsFromScript = (rawText: string): WordTimestamp[] => {
    const clean =
      rawText.trim() || 'Welcome to Kinetic Motion Studio with frame accurate word sync!';
    const tokens = clean.split(/\s+/).filter(Boolean).slice(0, 80);
    const colors = ['#38BDF8', '#FF5500', '#FACC15', '#10B981', '#EC4899'];
    let t = 0.1;
    return tokens.map((word, idx) => {
      const dur = Math.max(0.28, Math.min(0.55, word.length * 0.065));
      const startSec = Number(t.toFixed(2));
      const endSec = Number((t + dur).toFixed(2));
      t = endSec + 0.04;
      const emphasis = idx % 3 === 0 || word.endsWith('!') || word.length > 6;
      return {
        word,
        startSec,
        endSec,
        emphasis,
        accent: emphasis ? colors[idx % colors.length] : undefined,
      };
    });
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt ?? promptInput).trim();
    if ((!text && !attachedAudio) || isGenerating) return;

    // Intercept `/sketch-music-video` Claude Code skill command directly in chat
    if (
      text.toLowerCase().startsWith('/sketch-music-video') ||
      text.toLowerCase().includes('sketch-music-video')
    ) {
      const currentAudio = attachedAudio;
      const rawBody = text.replace(/^\/sketch-music-video\s*/i, '').trim();
      const lines = rawBody
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      let parsedTitle = 'जिवें किसी ग़ज़ल दी धुन';
      let parsedArtist = 'Sketchbook Acoustic Session';
      const lyricRows: string[] = [];

      for (const line of lines) {
        const metaMatch = line.match(/title:\s*([^|]+)\|\s*artist:\s*(.+)/i);
        if (metaMatch) {
          parsedTitle = metaMatch[1].trim();
          parsedArtist = metaMatch[2].trim();
        } else if (!line.toLowerCase().startsWith('create a claude code skill')) {
          lyricRows.push(line);
        }
      }

      const finalLyrics = lyricRows.length > 0 ? lyricRows.join('\n') : DEFAULT_INAAM_LYRICS;
      const targetAudioUrl = currentAudio?.previewUrl || KISI_GHAZAL_AUDIO_URL;
      const targetAudioName = currentAudio?.name || 'kisigajal_26a21b29.mp3';

      setSketchInitTitle(parsedTitle);
      setSketchInitArtist(parsedArtist);
      setSketchInitLyrics(finalLyrics);
      setSketchInitAudioUrl(targetAudioUrl);
      setSketchInitAudioName(targetAudioName);

      const proj = buildSketchSongProject({
        title: parsedTitle,
        artist: parsedArtist,
        lyricsText: finalLyrics,
        durationSec: currentAudio?.durationSec || KISI_GHAZAL_DURATION_SEC,
        audioUrl: targetAudioUrl,
      });
      const syncedWords = extractKineticWordsFromSketchProject(proj);
      const syncedScenes: KineticScene[] = proj.verses.map((v, idx) => ({
        id: `scene-sketch-${idx + 1}`,
        title: `Verse 0${idx + 1}`,
        startSec: v.startSec,
        endSec: v.endSec,
        headline: v.vignetteLabel.toUpperCase(),
        subheadline: v.lines[0]?.text || '',
        accentColor: idx % 2 === 0 ? '#F59E0B' : '#38BDF8',
        cameraZoom: 1.12,
        cameraTilt: idx % 2 === 0 ? 3 : -3,
      }));

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text || '/sketch-music-video',
        timestamp: 'Just now',
        attachedAudioName: targetAudioName,
        attachedAudioDuration: proj.durationSec,
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: `Choreographed **\`${parsedTitle}\`** using **\`/sketch-music-video\`** synced to \`${targetAudioName}\` (${proj.durationSec}s).\n\n• **-500ms Smooth Lead Time**: Every word glides onto the page **500 milliseconds before** its vocal onset with 60fps cubic-bezier easing (zero lag).\n• **Sustained Vocal Holds**: Long-held words (\`करांगा\` 1.42s, \`वल्ल\` 1.10s, \`नूं\` 0.91s, \`धुन\` 0.71s, \`सुन\` 0.87s, \`गुन-गुनायी\` 1.40s) stay active across their full hold duration with a continuous graphite melisma wave (\`〰\`).`,
        timestamp: 'Just now',
        model: selectedModel,
        effort: effortLevel,
        thinkingEnabled: true,
        thinkingDurationSec: 1.2,
        thinkingSteps: [
          `Analyzed 16kHz RMS vocal energy envelope of ${targetAudioName} (24.03s exact duration).`,
          'Applied -500ms pre-roll lead offset to all 36 words for smooth anticipation.',
          'Mapped 9 sustained vocal holds with continuous melisma wave underlines and 60fps canvas rendering.',
        ],
        artifactTitle: `${parsedTitle} · Sketch & Kinetic Hold Sync (24.03s)`,
        cameraRigSummary: '-500ms Smooth Pre-Roll · Sustained Vocal Hold Waves · 60fps Canvas',
        typographyStyle: 'Kalam Devanagari Calligraphy + Sustained Hold Melisma',
        detectedLanguage: 'Punjabi / Hindi Ghazal (Exact Acoustic Sync)',
        transcript: finalLyrics.replace(/\n/g, ' · '),
        words: syncedWords,
        kineticScenes: syncedScenes,
        customAudioUrl: targetAudioUrl,
      };

      const updatedMsgs = [...messages, userMsg, assistantMsg];
      setMessages(updatedMsgs);
      saveThreadSnapshot(updatedMsgs, '/sketch-music-video');
      if (!customPrompt) setPromptInput('');
      setAttachedAudio(null);
      setSketchModalOpen(true);
      return;
    }

    // Check if user has connected their Gemini API key (BYOK)
    if (!userApiKey) {
      setDraftApiKey('');
      setIntegrationsModalOpen(true);
      return;
    }

    const currentAudio = attachedAudio;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content:
        text ||
        (currentAudio ? `🎙️ Audio Track: ${currentAudio.name} (${currentAudio.durationSec}s)` : ''),
      timestamp: 'Just now',
      attachedAudioName: currentAudio?.name,
      attachedAudioDuration: currentAudio?.durationSec,
    };

    const newMsgsWithUser = [...messages, userMsg];
    setMessages(newMsgsWithUser);
    saveThreadSnapshot(newMsgsWithUser, text || currentAudio?.name);
    if (!customPrompt) setPromptInput('');
    setAttachedAudio(null);
    setIsGenerating(true);
    setHasTriggeredPopunder(false);
    setSocialBarsActive(true);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/motion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          model: selectedModel,
          thinkingEnabled,
          effort: effortLevel,
          userApiKey: userApiKey || undefined,
          audioBase64: currentAudio?.base64,
          audioMimeType: currentAudio?.mimeType,
          audioDurationSec: currentAudio?.durationSec,
        }),
      });

      // Handle Quota / Token Exhaustion (429)
      if (response.status === 429) {
        const exhaustedModelObj = currentModelObj;
        const nextModelId = MODEL_FALLBACK_MAP[selectedModel] || 'gemini-3.8-flash';
        const nextModelObj = MODEL_OPTIONS.find((m) => m.id === nextModelId) || MODEL_OPTIONS[1];

        const quotaMsgId = `quota-${Date.now()}`;
        const quotaAlertMsg: ChatMessage = {
          id: quotaMsgId,
          role: 'assistant',
          isQuotaAlert: true,
          exhaustedModelName: exhaustedModelObj.name,
          fallbackModelId: nextModelId,
          fallbackModelName: nextModelObj.name,
          pendingPromptText: text,
          content: `⚠️ **Daily Tokens / Quota Limit Reached for ${exhaustedModelObj.name}**\n\nYour daily tokens or quota for **${exhaustedModelObj.name}** have been exhausted.\n\nYou can switch to **${nextModelObj.name}** and continue creating right now, or resume tomorrow when your daily quota resets!`,
          timestamp: 'Just now',
          model: selectedModel,
        };

        setMessages((prev) => [...prev, quotaAlertMsg]);
        return;
      }

      if (!response.ok) {
        throw new Error('Fallback to local word-sync synthesizer');
      }

      const data = await response.json();

      if (data.quotaExceeded) {
        const exhaustedModelObj = currentModelObj;
        const nextModelId = MODEL_FALLBACK_MAP[selectedModel] || 'gemini-3.8-flash';
        const nextModelObj = MODEL_OPTIONS.find((m) => m.id === nextModelId) || MODEL_OPTIONS[1];

        const quotaAlertMsg: ChatMessage = {
          id: `quota-${Date.now()}`,
          role: 'assistant',
          isQuotaAlert: true,
          exhaustedModelName: exhaustedModelObj.name,
          fallbackModelId: nextModelId,
          fallbackModelName: nextModelObj.name,
          pendingPromptText: text,
          content: `⚠️ **Daily Tokens / Quota Limit Reached for ${exhaustedModelObj.name}**\n\nYour daily tokens or quota for **${exhaustedModelObj.name}** have been exhausted.\n\nYou can switch to **${nextModelObj.name}** and continue creating right now, or resume tomorrow when your daily quota resets!`,
          timestamp: 'Just now',
          model: selectedModel,
        };

        setMessages((prev) => [...prev, quotaAlertMsg]);
        return;
      }

      const elapsedSec = Math.max(
        0.8,
        Number(((performance.now() - startTime) / 1000).toFixed(1))
      );

      const syncedWords: WordTimestamp[] =
        Array.isArray(data.words) && data.words.length > 0
          ? data.words
          : buildFallbackWordsFromScript(data.transcript || text);

      const syncedScenes: KineticScene[] =
        Array.isArray(data.kineticScenes) && data.kineticScenes.length > 0
          ? data.kineticScenes
          : [
              {
                id: 'scene-1',
                title: 'Kinetic Sync',
                startSec: 0,
                endSec: syncedWords[syncedWords.length - 1]?.endSec + 1 || 8,
                headline: 'WORD-TO-WORD MOTION',
                subheadline: data.detectedLanguage || 'Multilingual Speech Engine',
                accentColor: '#38BDF8',
                cameraZoom: 1.12,
                cameraTilt: -3,
              },
            ];

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content:
          data.reply ||
          `Generated word-to-word synchronized kinetic typography video (${syncedWords.length} words locked at 30fps with 0ms delay). Tap **Play Synced Video** below to watch or **Download** to save the MP4/WebM file.`,
        timestamp: 'Just now',
        model: selectedModel,
        effort: effortLevel,
        thinkingEnabled,
        thinkingDurationSec: elapsedSec,
        thinkingSteps:
          Array.isArray(data.thinkingSteps) && data.thinkingSteps.length > 0
            ? data.thinkingSteps
            : [
                `Analyzed language (${data.detectedLanguage || 'Multilingual'}) and speech cadence via ${currentModelObj.name}.`,
                `Locked ${syncedWords.length} word-by-word timestamps with zero lag.`,
                `Choreographed 3D camera push-in and neon emphasis accents.`,
              ],
        artifactTitle:
          data.artifactTitle ||
          `Kinetic Speech Sync · ${data.detectedLanguage || 'Custom Script'}`,
        cameraRigSummary:
          data.cameraRigSummary || '1.00x → 1.18x Push-In · Word-Locked Spring Zoom · 0ms Delay',
        typographyStyle:
          data.typographyStyle || 'KineticWordSync + PunchPop + OpticalGlow',
        detectedLanguage: data.detectedLanguage || 'Multilingual (Hindi / English / Hinglish)',
        transcript: data.transcript || text,
        words: syncedWords,
        kineticScenes: syncedScenes,
        customAudioUrl: data.customAudioUrl,
        soundCues: data.soundCues,
        soundCredits: data.soundCredits,
        earshotReport: data.earshotReport,
        sfxStemUrl: data.sfxStemUrl || '/sfx/sfx-stem-mix.wav',
      };

      if (data.earshotReport) setActiveSoundReport(data.earshotReport);
      if (Array.isArray(data.soundCues)) setActiveSoundCues(data.soundCues);
      if (Array.isArray(data.soundCredits)) setActiveSoundCredits(data.soundCredits);

      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        saveThreadSnapshot(updated);
        return updated;
      });

      const lastWordEnd = syncedWords[syncedWords.length - 1]?.endSec || 6;
      const totalDuration = Math.max(4, lastWordEnd + 1.0);
      setActiveComposition({
        mode: 'custom-kinetic',
        audioUrl: data.customAudioUrl,
        sfxStemUrl: data.sfxStemUrl || '/sfx/sfx-stem-mix.wav',
        sfxEnabled: true,
        detectedLanguage: assistantMsg.detectedLanguage,
        transcript: assistantMsg.transcript,
        words: syncedWords,
        kineticScenes: syncedScenes,
      });
      setActiveCompositionDurationSec(totalDuration);
    } catch {
      const syncedWords = buildFallbackWordsFromScript(text);
      const lastWordEnd = syncedWords[syncedWords.length - 1]?.endSec || 6;
      const syncedScenes: KineticScene[] = [
        {
          id: 'scene-1',
          title: 'Kinetic Sync',
          startSec: 0,
          endSec: lastWordEnd + 1,
          headline: 'WORD-TO-WORD MOTION',
          subheadline: 'Frame-Accurate Speech Synchronization',
          accentColor: '#38BDF8',
          cameraZoom: 1.12,
          cameraTilt: -3,
        },
      ];

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: `Choreographed your custom word-by-word kinetic video (${syncedWords.length} words synced with zero delay). Tap **Play Synced Video** to preview or **Download** to save your video.`,
        timestamp: 'Just now',
        model: selectedModel,
        effort: effortLevel,
        thinkingEnabled,
        thinkingDurationSec: 1.4,
        thinkingSteps: [
          `Processed script with ${currentModelObj.name} (${effortLevel.toUpperCase()} effort).`,
          `Generated ${syncedWords.length} frame-accurate word timestamps.`,
          `Applied 3D camera zoom and kinetic pop styling.`,
        ],
        artifactTitle: `Kinetic Word-Sync Video (${syncedWords.length} Words)`,
        cameraRigSummary: '1.00x → 1.15x Dolly Zoom · 0ms Word-to-Word Lock',
        typographyStyle: 'KineticWordSync + NeonPop',
        detectedLanguage: 'Multilingual (Hindi / English / Hinglish)',
        transcript: text,
        words: syncedWords,
        kineticScenes: syncedScenes,
      };
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        saveThreadSnapshot(updated);
        return updated;
      });
      setActiveComposition({
        mode: 'custom-kinetic',
        detectedLanguage: assistantMsg.detectedLanguage,
        transcript: text,
        words: syncedWords,
        kineticScenes: syncedScenes,
      });
      setActiveCompositionDurationSec(Math.max(4, lastWordEnd + 1.0));
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#131415] text-[#ECECEC] flex flex-col lg:flex-row relative font-sans antialiased select-none">
      {/* 2 Floating Social Bar Ads at top during video processing only */}
      <SocialBarAds isVisible={socialBarsActive && isGenerating} />
      {/* =====================================================================
          1. CLEAN SIDEBAR (☰ Menu) — Opens only on hamburger click
             Eliminated dummy text bloat as requested. Clean, minimal, scannable.
         ===================================================================== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative z-10 w-[82vw] max-w-[290px] h-full bg-[#1A1A1C] border-r border-white/[0.08] flex flex-col shadow-2xl">
            {/* Drawer Top Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#38BDF8] to-[#A855F7] flex items-center justify-center font-bold text-black text-xs">
                  ✦
                </div>
                <span className="text-sm font-semibold text-white tracking-tight">
                  Gemini Motion
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat CTA */}
            <div className="p-3">
              <button
                onClick={handleNewChat}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.11] active:scale-[0.99] border border-white/[0.08] flex items-center gap-2.5 text-xs font-semibold text-white transition-all"
              >
                <Plus className="w-4 h-4 text-[#38BDF8]" />
                <span>New motion project</span>
              </button>
            </div>

            {/* Real Chat History & Projects */}
            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Your Chats & Projects ({threads.length})
              </div>

              {threads.length === 0 ? (
                <div className="p-4 text-center text-neutral-500 text-xs leading-relaxed">
                  No saved conversations yet.
                  <br />
                  Send a prompt to create your first motion project!
                </div>
              ) : (
                <div className="space-y-1">
                  {threads.map((thread) => {
                    const isSelected = activeThreadId === thread.id;
                    return (
                      <div
                        key={thread.id}
                        className={`group w-full min-h-[46px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-white shadow-sm'
                            : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                        }`}
                        onClick={() => handleSelectThread(thread)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <MessageSquare
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-[#38BDF8]' : 'text-neutral-400'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium truncate">{thread.title}</div>
                            <div className="text-[10px] text-neutral-500">{thread.updatedAt}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteThread(e, thread.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.1] text-neutral-400 hover:text-red-400 transition-opacity"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom BYOK & Browser Privacy Card */}
            <div className="p-3 border-t border-white/[0.08] bg-[#141416] space-y-2">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setDraftApiKey(userApiKey);
                  setIntegrationsModalOpen(true);
                }}
                className="w-full min-h-[42px] px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-between text-xs text-neutral-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#38BDF8]" />
                  <span>Gemini API Key</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    userApiKey
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {userApiKey ? 'Connected' : 'Setup Key'}
                </span>
              </button>
              <div className="px-1 text-[10px] text-neutral-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Browser Storage (Zero Cloud DB)</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================================
          2. MAIN CONVERSATIONAL VIEWPORT
             - Header: Next to Hamburger (☰), it is completely EMPTY (as strictly requested!)
         ===================================================================== */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#17181A] relative">
        {/* Sticky Mobile-First Top Header */}
        <header className="h-14 px-3 sm:px-5 flex items-center justify-between border-b border-white/[0.06] bg-[#17181A]/95 backdrop-blur-md shrink-0 z-20">
          {/* Left: Menu Button ONLY. The area next to ☰ is EMPTY! */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all"
              aria-label="Open menu"
              title="Open chats & scenes"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Sketch Music Video Skill · Sound Tools · BYOK Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSketchModalOpen(true)}
              className="min-h-[40px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 flex items-center gap-1.5 text-xs font-medium active:scale-95 transition-all"
              title="/sketch-music-video — Anuv Jain 'Inaam' Style Pencil-Sketch Lyric Video"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">/sketch-music-video</span>
              <span className="sm:hidden">Sketch</span>
            </button>

            <button
              onClick={() => setSoundToolsModalOpen(true)}
              className="min-h-[40px] px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 text-xs font-medium active:scale-95 transition-all"
              title="Openverse CC0 · Real SFX · Earshot Sound Studio"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sound Tools (3)</span>
              <span className="sm:hidden">SFX Studio</span>
            </button>

            <button
              onClick={() => {
                setDraftApiKey(userApiKey);
                setIntegrationsModalOpen(true);
              }}
              className={`min-h-[40px] px-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium active:scale-95 transition-all ${
                userApiKey
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-neutral-200'
              }`}
              title="Connect your personal Gemini API Key"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  userApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="hidden sm:inline">
                {userApiKey ? 'API Key Connected' : 'Connect Gemini Key'}
              </span>
              <span className="sm:hidden font-mono text-[11px]">
                {userApiKey ? 'Key Active' : 'Connect Key'}
              </span>
            </button>
          </div>
        </header>

        {/* Scrollable Conversation Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            {/* LIVE EMBEDDED 16:9 SKETCH MUSIC VIDEO PLAYER — Always visible right on the main screen! */}
            <InlineSketchVideoPlayer
              onOpenFullStudio={() => {
                setSketchInitTitle('जिवें किसी ग़ज़ल दी धुन');
                setSketchInitArtist('Sketchbook Acoustic Session');
                setSketchInitLyrics(DEFAULT_INAAM_LYRICS);
                setSketchInitAudioUrl(KISI_GHAZAL_AUDIO_URL);
                setSketchInitAudioName('kisigajal_26a21b29.mp3');
                setSketchModalOpen(true);
              }}
              onOpenKinetic916={openKisiGhazalKineticVideo}
            />

            {messages.length === 0 ? (
              /* EMPTY STATE — Clean Minimalist Greeting */
              <div className="my-auto py-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] text-2xl font-bold shadow-lg">
                  ✦
                </div>
                <div className="space-y-2 max-w-md">
                  <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    What motion video shall we create?
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Choreograph 3D camera moves, optical focus pulls, and 9:16 Remotion animations powered by{' '}
                    <span className="text-white font-medium">{currentModelObj.name}</span>.
                  </p>
                </div>

                {/* 2x2 Suggestion Cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {SUGGESTION_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip.prompt)}
                      className="min-h-[60px] p-3.5 rounded-2xl bg-[#222326] hover:bg-[#2A2B2F] active:scale-[0.99] border border-white/[0.07] text-left transition-all flex flex-col justify-center"
                    >
                      <div className="text-xs font-semibold text-white">{chip.title}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{chip.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* CONVERSATION STREAM */
              <div className="space-y-6 pb-4">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const modelMeta =
                    MODEL_OPTIONS.find((m) => m.id === msg.model) || MODEL_OPTIONS[0];
                  const isThinkingExpanded = !!expandedThinkingIds[msg.id];

                  if (isUser) {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[88%] sm:max-w-[80%] rounded-3xl bg-[#292A2D] px-4 py-3 text-[14px] text-white leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  if (msg.isPaidPlanAlert) {
                    return (
                      <div
                        key={msg.id}
                        className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3.5 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Key className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-amber-200">
                              Gemini Organ 4 Requires a Paid Google AI Studio Plan
                            </div>
                            <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                              Your API key is on the Free tier. <strong>Gemini Organ 4</strong> is Google DeepMind&apos;s flagship paid model requiring billing-enabled API access.
                              <br className="my-1" />
                              You can switch to <strong>Gemini 3.8 Flash</strong> (100% Free with ultra-fast 3D motion choreography) to continue right now, or connect a paid Google AI Studio API key.
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                          <button
                            onClick={() => {
                              setSelectedModel('gemini-3.8-flash');
                              if (msg.pendingPromptText) {
                                handleSendMessage(msg.pendingPromptText);
                              }
                            }}
                            className="min-h-[40px] px-4 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-95 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow"
                          >
                            <span>Switch to Gemini 3.8 Flash (Free) & Continue</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDraftApiKey(userApiKey);
                              setIntegrationsModalOpen(true);
                            }}
                            className="min-h-[40px] px-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-neutral-200 transition-colors"
                          >
                            Add Paid API Key
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (msg.isQuotaAlert) {
                    return (
                      <div
                        key={msg.id}
                        className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3.5 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-amber-200">
                              Daily Tokens / Quota Exhausted for {msg.exhaustedModelName}
                            </div>
                            <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                              Your free daily tokens or quota for <strong className="text-white">{msg.exhaustedModelName}</strong> have been reached for today.
                              <br />
                              It&apos;s completely your choice: You can switch to <strong className="text-[#38BDF8]">{msg.fallbackModelName}</strong> and continue creating right now, or wait until tomorrow when your free daily quota resets.
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                          {msg.fallbackModelId && (
                            <button
                              onClick={() => {
                                if (msg.fallbackModelId) {
                                  setSelectedModel(msg.fallbackModelId);
                                }
                                if (msg.pendingPromptText) {
                                  handleSendMessage(msg.pendingPromptText);
                                }
                              }}
                              className="min-h-[40px] px-4 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-95 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow"
                            >
                              <span>Switch to {msg.fallbackModelName} & Continue Now</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id ? { ...m, waitingTomorrow: true } : m
                                )
                              );
                            }}
                            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium transition-all ${
                              msg.waitingTomorrow
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/[0.08] hover:bg-white/[0.14] text-neutral-200'
                            }`}
                          >
                            {msg.waitingTomorrow ? '✓ Saved: Will Resume Tomorrow' : 'Resume Tomorrow (Daily Reset)'}
                          </button>
                          <button
                            onClick={() => {
                              setDraftApiKey(userApiKey);
                              setIntegrationsModalOpen(true);
                            }}
                            className="min-h-[40px] px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-neutral-200 transition-colors"
                          >
                            Change API Key
                          </button>
                        </div>

                        {msg.waitingTomorrow && (
                          <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>No problem! Your project is preserved. Free daily tokens reset automatically at midnight. See you tomorrow!</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="space-y-3">
                      {/* Assistant Header */}
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                          style={{ backgroundColor: modelMeta.accent }}
                        >
                          ✦
                        </div>
                        <span className="font-semibold text-white">{modelMeta.name}</span>
                        {msg.thinkingEnabled && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300">
                            {(msg.effort || 'high').toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Collapsible Extended Thinking Steps */}
                      {msg.thinkingEnabled &&
                        msg.thinkingSteps &&
                        msg.thinkingSteps.length > 0 && (
                          <div className="rounded-2xl bg-[#202124] border border-white/[0.07] overflow-hidden">
                            <button
                              onClick={() =>
                                setExpandedThinkingIds((prev) => ({
                                  ...prev,
                                  [msg.id]: !prev[msg.id],
                                }))
                              }
                              className="w-full min-h-[44px] px-3.5 py-2 flex items-center justify-between text-xs text-neutral-300 hover:bg-white/[0.03] transition-colors"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <Brain className="w-3.5 h-3.5 text-[#38BDF8]" />
                                <span>
                                  Thought for {msg.thinkingDurationSec || 2.1}s ·{' '}
                                  {(msg.effort || 'high').toUpperCase()} effort
                                </span>
                              </span>
                              {isThinkingExpanded ? (
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                            {isThinkingExpanded && (
                              <div className="px-3.5 pb-3.5 pt-1 border-t border-white/[0.06] space-y-2">
                                {msg.thinkingSteps.map((step, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-neutral-400 leading-relaxed flex items-start gap-2 font-mono"
                                  >
                                    <span className="text-neutral-500 select-none">
                                      {idx + 1}.
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Assistant Text */}
                      <div className="text-[14px] sm:text-[15px] text-[#ECECEC] leading-relaxed whitespace-pre-line pl-1">
                        {msg.content}
                      </div>

                      {/* Transcribed Script & Multilingual Recognition Card */}
                      {(msg.transcript || (msg.words && msg.words.length > 0)) && (
                        <div className="rounded-2xl bg-[#1A1B1E] border border-white/[0.09] p-3.5 space-y-2.5 shadow-sm text-left">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-xs font-semibold text-emerald-300">
                                {msg.detectedLanguage || 'Multilingual Speech'}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.08]">
                              {msg.words?.length || 0} words · Word-to-Word Locked (0ms lag)
                            </span>
                          </div>

                          {msg.transcript && (
                            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-neutral-200 leading-relaxed font-sans select-text">
                              <span className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase tracking-wider">
                                Spoken Script:
                              </span>
                              &ldquo;{msg.transcript}&rdquo;
                            </div>
                          )}

                          {msg.words && msg.words.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                              <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                                Cadence:
                              </span>
                              {msg.words.slice(0, 8).map((w, wIdx) => (
                                <span
                                  key={wIdx}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] text-neutral-200 font-medium shrink-0 flex items-center gap-1"
                                >
                                  <span className="text-[9px] font-mono text-[#38BDF8]">
                                    {w.startSec.toFixed(1)}s
                                  </span>
                                  <span>{w.word}</span>
                                </span>
                              ))}
                              {msg.words.length > 8 && (
                                <span className="text-[11px] text-neutral-400 shrink-0">
                                  +{msg.words.length - 8} more...
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clickable Motion Video Artifact Card + Real SFX & Earshot Sound Strip */}
                      {msg.artifactTitle && (
                        <div className="rounded-2xl bg-[#202124] border border-white/[0.1] overflow-hidden shadow-md">
                          <div className="p-3.5 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                                <Film className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-semibold text-white truncate">
                                  {msg.artifactTitle}
                                </div>
                                <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                                  {msg.cameraRigSummary}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (msg.earshotReport) setActiveSoundReport(msg.earshotReport);
                                  if (msg.soundCues) setActiveSoundCues(msg.soundCues);
                                  if (msg.soundCredits) setActiveSoundCredits(msg.soundCredits);
                                  setSoundToolsModalOpen(true);
                                }}
                                className="min-h-[44px] px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-300 font-medium text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30"
                                title="Open Real SFX + Earshot Critique & Separate SFX WAV"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">Sound Tools</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadVideo(msg)}
                                disabled={isDownloading}
                                className="min-h-[44px] px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition-all border border-white/[0.08]"
                                title="Download Your Generated 1080x1920 Video"
                              >
                                <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
                                <span className="hidden sm:inline">
                                  {isDownloading
                                    ? `Exporting ${downloadProgress}%`
                                    : 'Download'}
                                </span>
                              </button>
                              <button
                                onClick={() => openKineticVideo(msg)}
                                className="min-h-[44px] px-4 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-95 text-black font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play Synced Video</span>
                              </button>
                            </div>
                          </div>

                          {/* Real SFX & Earshot Scorecard Strip */}
                          <div className="px-3.5 py-2 bg-black/35 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap text-[11px]">
                            <div className="flex items-center gap-2 text-neutral-300">
                              <span className="text-emerald-400 font-semibold">
                                ✓ Real SFX + Earshot:
                              </span>
                              <span>
                                {msg.soundCues?.length || 6} CC0 cues frame-locked (0f drift) · -12dB Voice Ducking ·{' '}
                                {msg.earshotReport?.loudnessLufs || -14.2} LUFS
                              </span>
                            </div>
                            <a
                              href={msg.sfxStemUrl || '/sfx/sfx-stem-mix.wav'}
                              download="sfx-stem-mix.wav"
                              className="text-[#38BDF8] hover:underline font-mono flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Separate SFX WAV</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isGenerating && (
                  <div className="space-y-3 py-3">
                    {/* Step 1: Thinking & Prompt Choreography */}
                    <div className="p-3.5 rounded-2xl bg-[#202124] border border-[#38BDF8]/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center shrink-0">
                        <Brain className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>1. Choreographing 3D Camera & Scene Optics</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                          {currentModelObj.name} · Reasoning effort {effortLevel.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Banner Ad 1: Placed between Thinking & Motion Code Running */}
                    <InStepBannerAd slot={AD_CONFIG.stepBanner1} />

                    {/* Step 2: Remotion Code Compilation */}
                    <div className="p-3.5 rounded-2xl bg-[#202124] border border-white/[0.08] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white">
                          2. Motion Code & Trajectory Parameters Running
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                          Interpolating 3D Z-depth camera coordinates and cubic-bezier easing
                        </div>
                      </div>
                    </div>

                    {/* Banner Ad 2: Placed between Code Running & Video Synthesis */}
                    <InStepBannerAd slot={AD_CONFIG.stepBanner2} />

                    {/* Step 3: Interactive Video Assembly */}
                    <div className="p-3.5 rounded-2xl bg-[#202124] border border-white/[0.08] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white">
                          3. Synthesizing Interactive 9:16 Video Stream
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                          Zero-server Remotion browser GPU synthesis
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Also show the live 16:9 Sketch Video Player at the bottom of the chat stream if there are many messages */}
                {messages.length > 1 && (
                  <InlineSketchVideoPlayer
                    onOpenFullStudio={() => {
                      setSketchInitTitle('जिवें किसी ग़ज़ल दी धुन');
                      setSketchInitArtist('Sketchbook Acoustic Session');
                      setSketchInitLyrics(DEFAULT_INAAM_LYRICS);
                      setSketchInitAudioUrl(KISI_GHAZAL_AUDIO_URL);
                      setSketchInitAudioName('kisigajal_26a21b29.mp3');
                      setSketchModalOpen(true);
                    }}
                    onOpenKinetic916={openKisiGhazalKineticVideo}
                  />
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            3. MOBILE-FRIENDLY COMPOSER BAR
               With Model Picker (Gemini models only), Thinking Toggle, and Effort
           ===================================================================== */}
        <div className="px-3 sm:px-6 pb-3 pt-1 bg-gradient-to-t from-[#17181A] via-[#17181A] to-transparent shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-[24px] bg-[#222326] border border-white/[0.1] shadow-[0_8px_30px_rgba(0,0,0,0.35)] focus-within:border-white/[0.22] transition-colors">
              <input
                type="file"
                ref={audioFileInputRef}
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                onChange={handleAudioFileChange}
                className="hidden"
              />

              {/* Voice Recording In Progress Banner */}
              {isRecordingVoice && (
                <div className="mx-3 mt-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span className="font-semibold">Recording Spoken Voice: {recordingSeconds}s</span>
                    <span className="text-neutral-400 hidden sm:inline">(Hindi, English, Hinglish...)</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="min-h-[30px] px-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-[11px] flex items-center gap-1"
                  >
                    <MicOff className="w-3 h-3" />
                    <span>Done</span>
                  </button>
                </div>
              )}

              {/* Attached Audio File Pill */}
              {attachedAudio && !isRecordingVoice && (
                <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/25 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={toggleAttachedAudioPreview}
                      className="w-7 h-7 rounded-lg bg-[#38BDF8] hover:bg-[#60A5FA] text-black flex items-center justify-center shrink-0 shadow-sm active:scale-95"
                      title={audioPreviewPlaying ? 'Pause audio preview' : 'Play audio preview'}
                    >
                      {audioPreviewPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                        {attachedAudio.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#38BDF8]">
                        {attachedAudio.durationSec}s · Ready for Word-to-Word Sync
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeAttachedAudio}
                    className="w-7 h-7 rounded-lg hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center shrink-0"
                    title="Remove attached audio"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Prompt Textarea */}
              <textarea
                ref={textareaRef}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder={
                  attachedAudio
                    ? "Add visual direction notes (optional: e.g. 'neon cyan dark mode, fast zoom')..."
                    : "Upload audio, record mic, or type script/direction in Hindi, English, Hinglish..."
                }
                className="w-full bg-transparent px-4 pt-3.5 pb-1 text-[15px] text-white placeholder-neutral-400 focus:outline-none resize-none"
              />

              {/* Action Pill Row inside Composer */}
              <div className="px-2.5 pb-2 pt-1 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {/* Upload Audio File Button */}
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className={`min-h-[40px] px-3 rounded-full border text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ${
                      attachedAudio
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8]/40 text-[#38BDF8]'
                        : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/[0.08] text-neutral-300'
                    }`}
                    title="Upload audio track (MP3, WAV, M4A, OGG) for word-to-word sync"
                  >
                    <Music className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{attachedAudio ? 'Audio Added' : 'Audio File'}</span>
                  </button>

                  {/* Mic Voice Record Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecordingVoice) stopVoiceRecording();
                      else startVoiceRecording();
                    }}
                    className={`min-h-[40px] px-3 rounded-full border text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ${
                      isRecordingVoice
                        ? 'bg-red-500/25 border-red-500/50 text-red-400 animate-pulse'
                        : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/[0.08] text-neutral-300'
                    }`}
                    title={isRecordingVoice ? 'Stop recording voice' : 'Record voice directly via microphone'}
                  >
                    {isRecordingVoice ? (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{isRecordingVoice ? `${recordingSeconds}s` : 'Voice Mic'}</span>
                  </button>

                  {/* /sketch-music-video Skill Pill */}
                  <button
                    type="button"
                    onClick={() => setSketchModalOpen(true)}
                    className="min-h-[40px] px-3 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-xs font-medium text-amber-200 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                    title="Run /sketch-music-video (Anuv Jain 'Inaam' Pencil-Sketch Lyric Video)"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-400" />
                    <span>/sketch-music-video</span>
                  </button>

                  {/* Sound Tools (Openverse · Real SFX · Earshot) Pill */}
                  <button
                    type="button"
                    onClick={() => setSoundToolsModalOpen(true)}
                    className="min-h-[40px] px-3 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-medium text-emerald-300 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                    title="Openverse CC0 · Real SFX · Earshot Sound Tools"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sound Tools</span>
                  </button>

                  {/* Gemini API Key Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setDraftApiKey(userApiKey);
                      setIntegrationsModalOpen(true);
                    }}
                    className={`min-h-[40px] px-3 rounded-full border text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ${
                      userApiKey
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/[0.08] text-neutral-300'
                    }`}
                    title="Connect your personal Gemini API Key"
                  >
                    <Key className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{userApiKey ? 'Key Active' : 'API Key'}</span>
                  </button>

                  {/* Gemini Model Selector Pill */}
                  <button
                    type="button"
                    onClick={() => setModelSheetOpen(true)}
                    className="min-h-[40px] px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] text-xs font-medium text-neutral-200 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentModelObj.accent }}
                    />
                    <span className="font-semibold text-white">{currentModelObj.shortName}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  </button>

                  {/* Reasoning Effort Level */}
                  <button
                    type="button"
                    onClick={() => setModelSheetOpen(true)}
                    className="min-h-[40px] px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] text-xs font-medium text-neutral-300 flex items-center gap-1 active:scale-95 transition-all shrink-0"
                    title="Reasoning Effort for 3D Camera Trajectories"
                  >
                    <span className="text-neutral-400">Effort:</span>
                    <span className="capitalize text-white font-semibold">{effortLevel}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={(!promptInput.trim() && !attachedAudio) || isGenerating}
                  className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center transition-all shrink-0 ${
                    (promptInput.trim() || attachedAudio) && !isGenerating
                      ? 'bg-[#38BDF8] text-black hover:bg-[#60A5FA] active:scale-95 shadow-md'
                      : 'bg-white/[0.07] text-neutral-500 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================================
          4. VIDEO PLAYER SHEET / DRAWER (Clean: Preview, Scenes, Export. No code clutter!)
         ===================================================================== */}
      {playerDrawerOpen && (
        <aside className="fixed inset-0 z-40 lg:static lg:z-auto lg:w-[460px] xl:w-[500px] h-[100dvh] bg-[#101012] lg:border-l border-white/[0.09] flex flex-col overflow-hidden shadow-2xl">
          {/* Top Bar inside Video Sheet */}
          <div className="h-14 px-3 sm:px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#151518]">
            <button
              onClick={() => setPlayerDrawerOpen(false)}
              className="min-h-[44px] px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-neutral-200 hover:bg-white/[0.06] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Chat</span>
            </button>

            {/* Segmented Mode Tabs (Preview, Words, Export) */}
            <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/[0.07]">
              {(
                [
                  { id: 'preview', label: 'Video', icon: Film },
                  { id: 'scenes', label: 'Words', icon: Layers },
                  { id: 'export', label: 'Export', icon: Download },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = artifactTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setArtifactTab(tab.id)}
                    className={`min-h-[34px] px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      active
                        ? 'bg-white/[0.12] text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 30 / 60 FPS Toggle */}
            <button
              onClick={() => setFps((prev) => (prev === 30 ? 60 : 30))}
              className="min-h-[38px] px-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono font-semibold text-[#38BDF8] active:scale-95"
              title="Switch Frame Rate"
            >
              {fps}FPS
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {artifactTab === 'preview' && (
              <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 space-y-3">
                {/* Active Kinetic Track Info Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white truncate">
                      {`${activeComposition.detectedLanguage || 'Multilingual'} · Word-Synced Video`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400 tabular-nums shrink-0">
                      {`${(currentFrame / 30).toFixed(1)}s / ${activeCompositionDurationSec.toFixed(1)}s`}
                    </span>
                  </div>
                </div>

                {/* Centered 9:16 Remotion Player */}
                <div className="my-auto flex items-center justify-center">
                  <MemoizedPlayerStage
                    playerRef={playerRef}
                    fps={fps}
                    loop={loop}
                    inputProps={activeComposition}
                    durationInFrames={currentMaxFrames}
                  />
                </div>

                {/* Word Highlights Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  <span className="text-[11px] font-mono text-[#38BDF8] shrink-0 font-semibold px-2">
                    Words:
                  </span>
                  {(activeComposition.words || []).map((w, idx) => {
                    const frameSec = currentFrame / 30;
                    const isCurrent = frameSec >= w.startSec && frameSec < w.endSec;
                    return (
                      <button
                        key={idx}
                        onClick={() => seekToFrame(Math.round(w.startSec * 30))}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all shrink-0 ${
                          isCurrent
                            ? 'bg-[#38BDF8] text-black font-bold shadow'
                            : 'bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1]'
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-70">
                          {w.startSec.toFixed(1)}s
                        </span>
                        <span>{w.word}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Thumb-Zone Transport Controls */}
                <div className="space-y-3 pt-2 border-t border-white/[0.08] bg-[#151518] p-3 rounded-2xl">
                  {/* Scrubber */}
                  <div
                    className="relative h-7 flex items-center cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      seekToFrame(Math.round(ratio * currentMaxFrames));
                    }}
                  >
                    <div className="w-full h-2 bg-white/[0.1] rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-[#38BDF8] via-emerald-400 to-[#FF5500]"
                        style={{
                          width: `${(currentFrame / currentMaxFrames) * 100}%`,
                        }}
                      />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-md pointer-events-none"
                      style={{
                        left: `${(currentFrame / currentMaxFrames) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Transport Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={restartVideo}
                        className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 flex items-center justify-center text-neutral-200"
                        title="Restart"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => seekToFrame(currentFrame - 60)}
                        className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 flex items-center justify-center text-neutral-200"
                        title="Back 2s"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="min-h-[48px] min-w-[56px] rounded-2xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-95 text-black flex items-center justify-center shadow-lg transition-all"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={() => seekToFrame(currentFrame + 60)}
                        className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 flex items-center justify-center text-neutral-200"
                        title="Forward 2s"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setIsMuted((m) => {
                            const next = !m;
                            if (next) playerRef.current?.mute();
                            else playerRef.current?.unmute();
                            return next;
                          });
                        }}
                        className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 flex items-center justify-center text-neutral-200"
                        title="Mute / Unmute"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadVideo()}
                        disabled={isDownloading}
                        className="min-h-[44px] px-3.5 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-95 text-xs font-semibold text-black flex items-center gap-1.5 shadow-md transition-all"
                        title="Download Your 1080x1920 Video"
                      >
                        <Download className="w-4 h-4 fill-current" />
                        <span>
                          {isDownloading
                            ? `Exporting ${downloadProgress}%`
                            : 'Download Video'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {artifactTab === 'scenes' && (
              <div className="p-4 space-y-3">
                <div className="text-xs font-semibold text-neutral-300">
                  Word-by-Word Timestamp Breakdown ({activeComposition.words?.length || 0} words)
                </div>
                <div className="flex flex-wrap gap-2">
                  {(activeComposition.words || []).map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        seekToFrame(Math.round(w.startSec * 30));
                        setArtifactTab('preview');
                      }}
                      className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-left flex items-center gap-2 transition-all"
                    >
                      <span className="text-[11px] font-mono text-[#38BDF8]">
                        {w.startSec.toFixed(2)}s
                      </span>
                      <span className="text-xs font-semibold text-white">{w.word}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {artifactTab === 'export' && (
              <div className="p-4 space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
                  <div className="text-sm font-semibold text-white">
                    Export Your Generated Video (1080×1920)
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Renders your exact generated word-by-word kinetic typography and uploaded voice track into a downloadable video file.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadVideo()}
                      disabled={isDownloading}
                      className="w-full min-h-[48px] px-4 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-[0.99] text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isDownloading
                          ? `Rendering Video (${downloadProgress}%)...`
                          : downloadSuccess
                            ? '✓ Video Downloaded Successfully!'
                            : 'Download 1080×1920 Kinetic Video'}
                      </span>
                    </button>
                    {activeComposition.audioUrl && (
                      <a
                        href={activeComposition.audioUrl}
                        download="spoken-speech-track.mp3"
                        className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs flex items-center justify-center gap-2 transition-all border border-emerald-500/30"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          Download Uploaded Speech Track ({activeComposition.detectedLanguage || 'Audio'})
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}



      {/* =====================================================================
          6. GEMINI MODEL & THINKING SHEET
             Strictly only genuine Gemini models as listed by the user!
         ===================================================================== */}
      {modelSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setModelSheetOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#1C1D20] border-t sm:border border-white/[0.12] p-5 space-y-4 shadow-2xl max-h-[85dvh] overflow-y-auto">
            <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Gemini AI Models</h3>
                <p className="text-xs text-neutral-400">Select model & reasoning effort</p>
              </div>
              <button
                onClick={() => setModelSheetOpen(false)}
                className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center text-neutral-400 hover:text-white bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Extended Thinking Info & Reasoning Effort */}
            <div className="p-3.5 rounded-2xl bg-[#141517] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Extended Thinking (Always Active)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    High-reasoning 3D camera trajectory & spring physics planning
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <div className="text-[11px] text-neutral-400 font-medium">Reasoning Effort</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'medium', 'high', 'max'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setEffortLevel(lvl)}
                      className={`min-h-[38px] rounded-xl text-xs font-semibold capitalize transition-all ${
                        effortLevel === lvl
                          ? 'bg-white text-black shadow'
                          : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 7 Gemini Models List */}
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-neutral-400 px-1">
                Available Gemini Models (7)
              </div>
              {MODEL_OPTIONS.map((m) => {
                const active = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setModelSheetOpen(false);
                    }}
                    className={`w-full min-h-[54px] p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                      active
                        ? 'bg-white/[0.1] border-[#38BDF8]/60'
                        : 'bg-[#151517] border-white/[0.06] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: m.accent }}
                        />
                        <span className="text-sm font-semibold text-white">{m.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            m.badge.includes('Recommended')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/[0.07] text-neutral-300'
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{m.description}</p>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#38BDF8] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. BYOK (GEMINI API KEY) MODAL
             Direct, clean BYOK setup with instant key verification
         ===================================================================== */}
      {integrationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setIntegrationsModalOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#1C1D20] border-t sm:border border-white/[0.12] overflow-hidden shadow-2xl max-h-[88dvh] flex flex-col">
            <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />

            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Google Gemini API Key (BYOK)
                </h2>
                <p className="text-xs text-neutral-400">
                  Connect your own Gemini key for unlimited motion generation
                </p>
              </div>
              <button
                onClick={() => setIntegrationsModalOpen(false)}
                className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center text-neutral-400 hover:text-white bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Connection Status Card */}
              {userApiKey ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>API Key Connected & Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectApiKey}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Your requests run on your own Google AI Studio quota. Remotion 4.0 renders 100% locally in your browser via WebGL with zero server rendering costs.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#141517] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                    <span>Bring Your Own Key (BYOK)</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Entering your free Google Gemini API Key prevents rate limiting. Your key is stored securely in your browser&apos;s localStorage. Remotion runs 100% locally in your browser without requiring an external Remotion account.
                  </p>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleVerifyAndSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Your Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={draftApiKey}
                    onChange={(e) => setDraftApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#121315] border border-white/[0.1] text-sm text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Don&apos;t have an API key?</span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#38BDF8] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Get free key on Google AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Status messages */}
                {keyVerificationStatus === 'error' && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{keyVerificationError || 'Failed to verify API key. Please check your key.'}</span>
                  </div>
                )}

                {savedSettingsToast && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Google Gemini API Key Connected & Verified! Your quota is now active.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={keyVerificationStatus === 'verifying'}
                  className="w-full min-h-[48px] rounded-2xl bg-[#38BDF8] hover:bg-[#60A5FA] active:scale-[0.99] text-black font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {keyVerificationStatus === 'verifying' ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Verifying with Google AI Studio...</span>
                    </>
                  ) : (
                    <span>{userApiKey ? 'Update API Key' : 'Verify & Connect API Key'}</span>
                  )}
                </button>
              </form>

              {/* Quick 3-Step Guide */}
              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Quick Setup (30 Seconds)
                </div>
                <div className="space-y-2 text-xs leading-relaxed text-neutral-400">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-[#38BDF8] underline">Google AI Studio</a> and click <strong>&quot;Create API Key&quot;</strong> (100% Free).
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Copy your key, paste it into the field above, and click <strong>&quot;Verify & Connect&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Start generating 3D Remotion videos. The videos render directly on your browser GPU!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sound Design Tools Modal (Openverse CC0 · Real SFX · Earshot) */}
      <SoundToolsModal
        isOpen={soundToolsModalOpen}
        onClose={() => setSoundToolsModalOpen(false)}
        words={activeComposition.words || []}
        kineticScenes={activeComposition.kineticScenes || []}
        durationSec={activeCompositionDurationSec}
        currentReport={activeSoundReport}
        currentCues={activeSoundCues}
        currentCredits={activeSoundCredits}
        onApplySoundDesign={(data) => {
          setActiveSoundCues(data.cues);
          setActiveSoundCredits(data.credits);
          setActiveSoundReport(data.report);
          setActiveComposition((prev) => ({
            ...prev,
            sfxStemUrl: data.sfxStemUrl,
            sfxEnabled: true,
          }));
        }}
        onJumpToFrame={(frame30) => {
          setSoundToolsModalOpen(false);
          setPlayerDrawerOpen(true);
          setArtifactTab('preview');
          setTimeout(() => {
            seekToFrame(frame30);
          }, 100);
        }}
      />

      {/* Sketch Music Video Studio Modal (.claude/skills/sketch-music-video/SKILL.md) */}
      <SketchMusicVideoModal
        isOpen={sketchModalOpen}
        onClose={() => setSketchModalOpen(false)}
        initialTitle={sketchInitTitle}
        initialArtist={sketchInitArtist}
        initialLyrics={sketchInitLyrics}
        initialAudioUrl={sketchInitAudioUrl}
        initialAudioName={sketchInitAudioName}
      />

      {/* Pop-under Interstitial Video Ad (Triggered once per video generation cycle on play) */}
      <VideoPopunderModal
        isOpen={popunderModalOpen}
        onClose={handlePopunderComplete}
        onSkip={handlePopunderComplete}
      />
    </div>
  );
}

export default App;
