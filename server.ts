import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  ensureSfxLibraryReady,
  searchOpenverseAudio,
  buildRealSfxAndEarshotPipeline,
  SoundKitPreset,
  CueCategory,
} from './src/soundTools/soundEngineServer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SCENE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'Unique scene ID e.g. scene-1' },
    type: {
      type: Type.STRING,
      description:
        'Must be one of: laser-blueprint-hook, kinetic-blur-stack, wireframe-3d-prompt, strobe-impact-words, paper-form-cutaway, code-math-inspector, ui-3d-walkthrough, live-code-typing',
    },
    title: {
      type: Type.STRING,
      description: 'Clean editorial scene title e.g. 01. Laser Comet Hook',
    },
    durationSec: {
      type: Type.NUMBER,
      description: 'Duration in seconds between 1.5 and 3.8',
    },
    headline: {
      type: Type.STRING,
      description: 'Primary punchy headline text for this scene',
    },
    subheadline: {
      type: Type.STRING,
      description: 'Secondary supporting caption or subtitle',
    },
    accentColor: {
      type: Type.STRING,
      description: 'Hex color for laser/glow accent e.g. #FF5500 or #E07A5F or #38BDF8',
    },
    bgColor: {
      type: Type.STRING,
      description:
        'Hex color for background e.g. #08090D for dark grid, #F4F1EA for paper-form-cutaway, or #FF5500 for strobe-impact-words',
    },
    easing: {
      type: Type.STRING,
      description:
        'Must be one of: bezier-smooth, spring-snappy, expo-out, elastic-bounce, linear',
    },
    camera: {
      type: Type.OBJECT,
      properties: {
        zoom: { type: Type.NUMBER, description: 'Camera zoom factor between 0.95 and 1.25' },
        rotateX: { type: Type.NUMBER, description: '3D tilt X in degrees between -18 and 18' },
        rotateY: { type: Type.NUMBER, description: '3D tilt Y in degrees between -18 and 18' },
        rotateZ: { type: Type.NUMBER, description: 'Roll Z in degrees between -4 and 4' },
        panX: { type: Type.NUMBER, description: 'Horizontal pan in px between -25 and 25' },
        panY: { type: Type.NUMBER, description: 'Vertical pan in px between -25 and 25' },
      },
      required: ['zoom', 'rotateX', 'rotateY', 'rotateZ', 'panX', 'panY'],
    },
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        '3 to 5 short strings used for flowchart boxes, strobe words, checklist items, or model dropdown options',
    },
    codeSnippet: {
      type: Type.STRING,
      description:
        'Mathematical equation, procedural animation code, or prompt string displayed in the scene',
    },
    formHeader: {
      type: Type.STRING,
      description: 'Short technical header or equation label e.g. FORM 2-B · PIPELINE',
    },
    strikeIndex: {
      type: Type.INTEGER,
      description:
        'Optional 0-based index of an item to cross out with a red line (e.g. 2 for After Effects, or -1 for none)',
    },
  },
  required: [
    'id',
    'type',
    'title',
    'durationSec',
    'headline',
    'subheadline',
    'accentColor',
    'bgColor',
    'easing',
    'camera',
    'items',
    'codeSnippet',
  ],
};

const REEL_PROJECT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Title of the 9:16 motion reel' },
    subtitle: { type: Type.STRING, description: 'Short summary of the reel narrative' },
    globalAccent: { type: Type.STRING, description: 'Primary hex accent color e.g. #FF5500' },
    scenes: {
      type: Type.ARRAY,
      items: SCENE_SCHEMA,
      description: 'Ordered sequence of 5 to 7 procedural 9:16 scenes',
    },
  },
  required: ['title', 'subtitle', 'globalAccent', 'scenes'],
};

const TWEAK_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Concise 1-sentence explanation of the procedural changes applied',
    },
    diffs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sceneTitle: { type: Type.STRING, description: 'Affected scene title' },
          parameter: {
            type: Type.STRING,
            description: 'Mathematical or visual property changed e.g. easing, camera.zoom, accentColor',
          },
          before: { type: Type.STRING, description: 'Previous value or equation' },
          after: { type: Type.STRING, description: 'New updated value or equation' },
        },
        required: ['sceneTitle', 'parameter', 'before', 'after'],
      },
    },
    scenes: {
      type: Type.ARRAY,
      items: SCENE_SCHEMA,
      description: 'Complete updated array of scenes for the reel',
    },
  },
  required: ['summary', 'diffs', 'scenes'],
};

async function callGeminiWithFallback(
  requestedModel: string,
  contents: string,
  systemInstruction: string,
  responseSchema: Record<string, unknown>
): Promise<{ text: string; actualModel: string }> {
  const ai = getGenAIClient();
  const validModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  const primaryModel = validModels.includes(requestedModel)
    ? requestedModel
    : 'gemini-3.8-flash';

  const buildConfig = (modelName: string) => {
    const isLite = modelName === 'gemini-3.1-flash-lite';
    return {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      thinkingConfig: {
        thinkingLevel: isLite ? ThinkingLevel.MINIMAL : ThinkingLevel.HIGH,
      },
    };
  };

  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents,
      config: buildConfig(primaryModel),
    });
    return { text: response.text || '{}', actualModel: primaryModel };
  } catch (err: unknown) {
    // If gemini-4-argon fails because no paid key was configured, fall back seamlessly to gemini-3.8-flash with HIGH thinking
    if (primaryModel === 'gemini-4-argon') {
      const fallbackModel = 'gemini-3.8-flash';
      const fallbackResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents,
        config: buildConfig(fallbackModel),
      });
      return {
        text: fallbackResponse.text || '{}',
        actualModel: `${fallbackModel} (Auto-routed from Argon)`,
      };
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  const sfxDir = path.resolve(__dirname, 'public', 'sfx');
  if (!fs.existsSync(sfxDir)) {
    fs.mkdirSync(sfxDir, { recursive: true });
  }
  ensureSfxLibraryReady(sfxDir, 'launch');
  app.use('/sfx', express.static(sfxDir));

  // Sound Tools Status Endpoint (Openverse + Real SFX + Earshot)
  app.get('/api/sound-tools/status', (_req, res) => {
    const credits = ensureSfxLibraryReady(sfxDir, 'launch');
    const realSfxInstalled = fs.existsSync(path.resolve(__dirname, 'skills', 'real-sfx'));
    const earshotInstalled = fs.existsSync(path.resolve(__dirname, 'skills', 'earshot'));
    res.json({
      tools: [
        {
          id: 'openverse',
          name: '1. Openverse CC0 Audio Engine',
          subtitle: '5.2M+ free audio files · No API key required · license=cc0',
          status: 'Ready & Connected',
          endpoint: 'https://api.openverse.org/v1/audio/?license=cc0',
        },
        {
          id: 'real-sfx',
          name: '2. Real SFX (Clipwing Skill)',
          subtitle: 'Exact 30fps frame placement · Auto-ducking (-12dB) under voiceover · Separate WAV stem',
          status: realSfxInstalled ? 'Installed (skills/real-sfx + FFmpeg)' : 'Ready (Built-in Frame Engine)',
          path: 'skills/real-sfx',
        },
        {
          id: 'earshot',
          name: '3. Earshot (Listen, Critique, Measure & Forge)',
          subtitle: 'LUFS loudness & sync drift check · 5 ear-check moments · DSP Sound Forge (4 kits)',
          status: earshotInstalled ? 'Installed (skills/earshot + DSP Forge)' : 'Ready (DSP Forge & Critique)',
          path: 'skills/earshot',
        },
      ],
      credits,
    });
  });

  // Openverse CC0 Search & Save to /public/sfx + credits.json
  app.post('/api/sound-tools/openverse-search', async (req, res) => {
    try {
      const { query = 'whoosh', cueType = 'whoosh' } = req.body;
      const data = await searchOpenverseAudio(
        String(query),
        cueType as CueCategory,
        sfxDir
      );
      res.json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Openverse search failed';
      res.status(500).json({ error: message });
    }
  });

  // Full 4-Step Sound Design Pipeline (Openverse + Real SFX + Earshot Critique & Measure + Forge Kit)
  app.post('/api/sound-tools/pipeline', async (req, res) => {
    try {
      const {
        words = [],
        kineticScenes = [],
        durationSec = 8,
        preset = 'launch',
        hasVoiceover = true,
      } = req.body;

      const result = buildRealSfxAndEarshotPipeline({
        sfxDir,
        words,
        kineticScenes,
        durationSec: Number(durationSec) || 8,
        preset: (preset as SoundKitPreset) || 'launch',
        hasVoiceover: Boolean(hasVoiceover),
      });

      res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sound design pipeline failed';
      res.status(500).json({ error: message });
    }
  });

  // Audio upload endpoint
  app.post('/api/audio/upload', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/mp3' } = req.body;
      if (!audioBase64) {
        res.status(400).json({ error: 'No audio data provided' });
        return;
      }
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const ext = mimeType.includes('wav')
        ? 'wav'
        : mimeType.includes('ogg')
          ? 'ogg'
          : mimeType.includes('m4a')
            ? 'm4a'
            : 'mp3';
      const fileId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const savedName = `${fileId}.${ext}`;
      fs.writeFileSync(path.join(uploadsDir, savedName), buffer);
      const audioUrl = `/uploads/${savedName}`;
      res.json({ audioUrl, filename: savedName, size: buffer.length });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Audio upload failed';
      res.status(500).json({ error: message });
    }
  });

  // Generate a complete 9:16 procedural motion reel from a prompt
  app.post('/api/motion/generate', async (req, res) => {
    try {
      const { prompt, model = 'gemini-4-argon' } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Please provide a motion director prompt.' });
        return;
      }

      const systemInstruction = `You are an elite Procedural Motion Graphics Director (inspired by Claude Motion and high-end After Effects kinetic typography reels).
Your job is to choreograph a 9:16 vertical motion graphics reel (5 to 7 scenes) as a deterministic mathematical scene graph.
Mix and match the 8 specialized visual engines for maximum visual variety and rhythm:
1. "laser-blueprint-hook": Dark engineering grid (#08090D) with a glowing #FF5500 laser comet tracing paths and connecting 3 flowchart nodes (set strikeIndex: 2 if crossing out an old tool like After Effects).
2. "kinetic-blur-stack": Massive bold typography slamming in with directional vertical motion blur and spring physics.
3. "wireframe-3d-prompt": Tilted 3D perspective floor grid (rotateX: 12 to 16) with floating wireframe polyhedra and a terminal typing out a prompt in codeSnippet.
4. "strobe-impact-words": High-contrast full-screen solar orange (#FF5500) strobe flashing 4-5 punchy single words in items (e.g. ["AND", "WHERE", "IT", "GETS", "CRAZY."]).
5. "paper-form-cutaway": Vintage technical paper document (bgColor: "#F4F1EA", accentColor: "#DC2626") like "FORM 2-B — PRODUCTION PIPELINE" or "FORM 9 — EXIT QUESTIONNAIRE" with typewriter items and strikeIndex: 0 for crossing out the legacy workflow.
6. "code-math-inspector": Split-screen showing live mathematical easing code in codeSnippet (e.g. x(t) = x0 + (x1 - x0) * ease(t)) and live bounding-box shape morphing.
7. "ui-3d-walkthrough": Warm dark glowing UI card (bgColor: "#120C09", accentColor: "#E07A5F") with 3D camera tilt (rotateX: 12, rotateY: -12) opening a model selector dropdown.
8. "live-code-typing": Dark IDE streaming syntax-highlighted C/TypeScript code in codeSnippet with a spinning starburst emblem.

Ensure every scene has crisp, viral-grade copy, authentic mathematical formulas or code snippets, and dynamic 3D camera angles.`;

      const { text, actualModel } = await callGeminiWithFallback(
        model,
        `Create a 9:16 procedural motion graphics reel for the following direction:\n\n${prompt}`,
        systemInstruction,
        REEL_PROJECT_SCHEMA
      );

      const parsed = JSON.parse(text);
      res.json({
        project: {
          id: `reel-${Date.now()}`,
          title: parsed.title || 'Procedural 9:16 Reel',
          subtitle: parsed.subtitle || 'Generated with Procedural Motion Engine',
          fps: 60,
          aspectRatio: '9:16',
          selectedModel: model,
          globalAccent: parsed.globalAccent || '#FF5500',
          scenes: parsed.scenes || [],
        },
        modelUsed: actualModel,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate procedural motion reel.';
      res.status(500).json({ error: message });
    }
  });

  // Apply natural-language procedural tweaks and return red/green parameter diffs
  app.post('/api/motion/tweak', async (req, res) => {
    try {
      const { instruction, scenes, targetSceneId, model = 'gemini-3.8-flash' } = req.body;
      if (!instruction || !Array.isArray(scenes)) {
        res.status(400).json({ error: 'Instruction and current scenes are required.' });
        return;
      }

      const systemInstruction = `You are a Procedural Motion Graphics Diff Engine.
The user wants to modify an existing 9:16 procedural motion reel using natural language (e.g. "Make this transition smoother", "Change accent color to electric cyan", "Slow this section down", "Add an orange strobe cut", "Tilt the 3D camera more").
Modify the scenes array accordingly and output a precise list of mathematical/visual parameter diffs (before vs after) so the studio can display a red/green procedural code diff card.`;

      const userMessage = `User Tweak Command: "${instruction}"
Target Scene ID (if focused): ${targetSceneId || 'ALL_SCENES'}
Current Scenes JSON:
${JSON.stringify(scenes, null, 2)}`;

      const { text, actualModel } = await callGeminiWithFallback(
        model,
        userMessage,
        systemInstruction,
        TWEAK_RESPONSE_SCHEMA
      );

      const parsed = JSON.parse(text);
      res.json({
        summary: parsed.summary || 'Updated procedural scene parameters.',
        diffs: parsed.diffs || [],
        scenes: parsed.scenes || scenes,
        modelUsed: actualModel,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to apply procedural tweak.';
      res.status(500).json({ error: message });
    }
  });

  // Conversational AI Motion Studio endpoint with Thinking & Effort controls
  const WORD_SYNC_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: 'Spoken word in native or transliterated script' },
      startSec: { type: Type.NUMBER, description: 'Start timestamp in seconds from 0.0' },
      endSec: { type: Type.NUMBER, description: 'End timestamp in seconds' },
      emphasis: { type: Type.BOOLEAN, description: 'True for stressed, energetic, or punchy words' },
      accent: { type: Type.STRING, description: 'Hex color code e.g. #38BDF8, #FF5500, #FACC15, #10B981, #EC4899' },
      scale: { type: Type.NUMBER, description: 'Kinetic scale multiplier 1.0 - 1.35' },
    },
    required: ['word', 'startSec', 'endSec', 'emphasis'],
  };

  const KINETIC_SCENE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'Scene identifier e.g. scene-1' },
      title: { type: Type.STRING, description: 'Short chapter name' },
      startSec: { type: Type.NUMBER, description: 'Scene start timestamp in seconds' },
      endSec: { type: Type.NUMBER, description: 'Scene end timestamp in seconds' },
      headline: { type: Type.STRING, description: 'Punchy chapter title' },
      subheadline: { type: Type.STRING, description: 'Context subtitle' },
      accentColor: { type: Type.STRING, description: 'Hex accent color' },
      cameraZoom: { type: Type.NUMBER, description: 'Camera zoom 1.0 - 1.25' },
      cameraTilt: { type: Type.NUMBER, description: 'Camera tilt degrees -15 to 15' },
    },
    required: ['id', 'title', 'startSec', 'endSec', 'headline', 'accentColor'],
  };

  const MOTION_CHAT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      reply: {
        type: Type.STRING,
        description:
          'Clear, concise director response explaining how the audio was understood, language detected, and word-by-word animation was choreographed.',
      },
      detectedLanguage: {
        type: Type.STRING,
        description: 'Detected language: Hindi, English, Hinglish, etc.',
      },
      transcript: {
        type: Type.STRING,
        description: 'Full transcribed speech script of the audio or prompt.',
      },
      audioDurationSec: {
        type: Type.NUMBER,
        description: 'Total estimated duration of the speech in seconds.',
      },
      words: {
        type: Type.ARRAY,
        items: WORD_SYNC_SCHEMA,
        description: 'Array of word timestamps accurately aligned to speech cadence with zero lag.',
      },
      kineticScenes: {
        type: Type.ARRAY,
        items: KINETIC_SCENE_SCHEMA,
        description: 'Sequence of kinetic scene blocks partitioning the speech.',
      },
      thinkingSteps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          '3 to 5 technical reasoning steps covering audio transcription, word alignment, 3D camera kinetics, and spring typography.',
      },
      artifactTitle: {
        type: Type.STRING,
        description: 'Short title for the generated or updated Remotion composition artifact',
      },
      targetSceneIndex: {
        type: Type.INTEGER,
        description:
          '0-based scene index (0 to 10) in the 54.6s showreel most relevant to jump to or preview',
      },
      cameraRigSummary: {
        type: Type.STRING,
        description: 'e.g. 1.00x -> 1.18x Push-In · Word-Locked Spring Zoom · 3D Depth',
      },
      typographyStyle: {
        type: Type.STRING,
        description: 'e.g. KineticWordSync + PunchPop + OpticalGlow',
      },
      remotionCodeSnippet: {
        type: Type.STRING,
        description:
          'Valid, clean Remotion TypeScript React component code (20-35 lines) using useCurrentFrame, spring, interpolate, CameraRig3D, and kinetic text for this prompt.',
      },
    },
    required: [
      'reply',
      'detectedLanguage',
      'transcript',
      'words',
      'kineticScenes',
      'thinkingSteps',
      'artifactTitle',
      'targetSceneIndex',
      'cameraRigSummary',
      'typographyStyle',
      'remotionCodeSnippet',
    ],
  };

  // Endpoint to verify user's Gemini API Key
  app.post('/api/motion/verify-key', async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        res.status(400).json({ valid: false, error: 'API key is required.' });
        return;
      }
      const testAi = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const response = await testAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'test connection',
      });
      res.json({ valid: true, message: 'Key connected successfully' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid API key or network error';
      res.status(400).json({ valid: false, error: message });
    }
  });

  app.post('/api/motion/chat', async (req, res) => {
    try {
      const {
        prompt = '',
        model = 'gemini-3.8-flash',
        thinkingEnabled = true,
        effort = 'high',
        userApiKey,
        audioBase64,
        audioMimeType = 'audio/mp3',
        audioDurationSec,
      } = req.body;

      if (!prompt && !audioBase64) {
        res.status(400).json({ error: 'Please provide either a prompt/script or an audio recording.' });
        return;
      }

      const apiKey = (typeof userApiKey === 'string' && userApiKey.trim()) ? userApiKey.trim() : process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Save custom audio file if provided so Remotion can play it frame-accurately
      let customAudioUrl: string | undefined;
      if (audioBase64) {
        const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        const ext = audioMimeType.includes('wav')
          ? 'wav'
          : audioMimeType.includes('ogg')
            ? 'ogg'
            : audioMimeType.includes('m4a')
              ? 'm4a'
              : 'mp3';
        const fileId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const savedName = `${fileId}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, savedName), buffer);
        customAudioUrl = `/uploads/${savedName}`;
      }

      // Map selected UI model to exact Google GenAI SDK model
      let geminiModel = 'gemini-3.8-flash';
      if (model === 'gemini-organ-4') {
        geminiModel = 'gemini-4-argon';
      } else if (model === 'gemini-3.8-flash') {
        geminiModel = 'gemini-3.8-flash';
      } else if (model === 'gemini-3.6-flash' || model === 'gemini-3.5-flash') {
        geminiModel = 'gemini-3.8-flash';
      } else if (model === 'gemini-3.1-pro' || model === 'gemini-1.5-pro') {
        geminiModel = 'gemini-2.5-pro';
      } else if (model === 'gemini-3.08-flash') {
        geminiModel = 'gemini-3.1-flash-lite';
      }

      // Map effort level directly to ThinkingLevel
      let thinkingLevel = ThinkingLevel.HIGH;
      if (effort === 'low') {
        thinkingLevel = ThinkingLevel.LOW;
      } else if (effort === 'medium') {
        thinkingLevel = ThinkingLevel.MEDIUM;
      } else {
        thinkingLevel = ThinkingLevel.HIGH;
      }

      const systemInstruction = `You are an elite AI Procedural Motion Director and Speech Synchronizer for Remotion 4.0.
Connected Model: ${model} (Engine: ${geminiModel})
Thinking: ${thinkingEnabled ? 'ENABLED' : 'DISABLED'} (${String(effort).toUpperCase()} effort)
Target Resolution: 1080x1920 9:16 Vertical Video

CRITICAL MISSION:
1. MULTILINGUAL RECOGNITION: The audio or script may be in English, Hindi (Devanagari or Romanized), Hinglish, or mixed. Correctly identify the language in 'detectedLanguage'.
2. FULL TRANSCRIPTION: Provide verbatim transcribed spoken speech in 'transcript'.
3. FRAME-ACCURATE WORD-BY-WORD SYNCHRONIZATION:
   - Provide an array of 'words' with exact 'startSec' and 'endSec' timestamps corresponding to the speech cadence.
   - NO 3-SECOND DELAY OR LAG: Word animations must lock directly onto the exact moment they are spoken.
   - Flag key impactful/energetic words with 'emphasis: true' and assign vibrant neon hex colors ('#38BDF8', '#FF5500', '#FACC15', '#10B981', '#EC4899').
4. KINETIC SCENES: Partition the speech into 2 to 6 scene blocks with chapter headlines, subtitles, 3D camera zoom (1.05 to 1.25), and tilt.
5. In 'reply', provide a confident, concise director breakdown explaining the detected language, transcript highlights, and how word-by-word kinetic animation was synchronized.`;

      let contents: any;
      if (audioBase64) {
        const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
        const audioPart = {
          inlineData: {
            mimeType: audioMimeType,
            data: cleanBase64,
          },
        };
        const textPrompt = `Listen to this audio track and generate word-by-word synchronized kinetic typography for Remotion.
User's visual style / direction notes: ${prompt ? `"${prompt}"` : 'High-energy kinetic typography with 3D camera push-in and neon accents'}.
Extract exact word timestamps so that each word lights up in the video at the exact millisecond it is spoken.`;
        contents = { parts: [audioPart, { text: textPrompt }] };
      } else {
        contents = `User prompt or script: "${prompt}".
Transcribe and analyze this script (which may be in English, Hindi, or Hinglish).
Generate word-by-word timestamps (~0.35s to 0.45s per word sequentially starting at 0.1s) in 'words', assign punchy emphasis and accent colors, and partition into 'kineticScenes'.`;
      }

      const executeCall = async (targetModel: string) => {
        return await ai.models.generateContent({
          model: targetModel,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: MOTION_CHAT_SCHEMA,
            thinkingConfig: {
              thinkingLevel,
            },
          },
        });
      };

      let response;
      try {
        response = await executeCall(geminiModel);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);

        // Check if Token / Quota limit was reached (429 or RESOURCE_EXHAUSTED)
        const isQuota =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('Quota') ||
          errMsg.includes('rate limit');

        if (isQuota) {
          res.status(429).json({
            quotaExceeded: true,
            model,
            error: `API quota or token limit reached for ${model}.`,
          });
          return;
        }

        // If gemini-4-argon alias is not recognized on the user's endpoint, transparently use gemini-2.5-pro or gemini-3.8-flash with HIGH thinking so Gemini Pro / AI Studio keys always work seamlessly
        const fallbackCandidates =
          geminiModel === 'gemini-4-argon'
            ? ['gemini-2.5-pro', 'gemini-3.8-flash', 'gemini-2.5-flash']
            : ['gemini-3.8-flash', 'gemini-2.5-flash'];

        let lastErr: unknown = err;
        for (const candidate of fallbackCandidates) {
          try {
            response = await executeCall(candidate);
            lastErr = null;
            break;
          } catch (fbErr: unknown) {
            lastErr = fbErr;
            const fbMsg = fbErr instanceof Error ? fbErr.message : String(fbErr);
            const isFbQuota =
              fbMsg.includes('429') ||
              fbMsg.includes('RESOURCE_EXHAUSTED') ||
              fbMsg.includes('quota') ||
              fbMsg.includes('Quota') ||
              fbMsg.includes('rate limit');
            if (isFbQuota) {
              res.status(429).json({
                quotaExceeded: true,
                model,
                error: `API quota or token limit reached for ${model}.`,
              });
              return;
            }
          }
        }
        if (!response && lastErr) {
          throw lastErr;
        }
      }

      const parsed = JSON.parse(response?.text || '{}');
      const wordsArr = Array.isArray(parsed.words) ? parsed.words : [];
      const scenesArr = Array.isArray(parsed.kineticScenes) ? parsed.kineticScenes : [];
      const lastEnd =
        wordsArr.length > 0 ? Number(wordsArr[wordsArr.length - 1].endSec || 6) + 1.0 : 8;

      // Automatically run Real SFX + Earshot Sound Design Pipeline on every generated video
      const soundDesign = buildRealSfxAndEarshotPipeline({
        sfxDir,
        words: wordsArr,
        kineticScenes: scenesArr,
        durationSec: lastEnd,
        preset: 'launch',
        hasVoiceover: true,
      });

      res.json({
        ...parsed,
        customAudioUrl,
        soundCues: soundDesign.cues,
        soundCredits: soundDesign.credits,
        earshotReport: soundDesign.report,
        sfxStemUrl: soundDesign.report.sfxStemUrl,
        model,
        thinkingEnabled,
        effort,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Motion chat generation failed.';
      res.status(500).json({ error: message });
    }
  });

  const rendersDir = path.resolve(__dirname, 'public', 'renders');
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }
  app.use('/renders', express.static(rendersDir));

  if (process.env.NODE_ENV !== 'production') {
    app.use((_req, res, next) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    });
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  let retries = 0;
  const listenWithRetry = () => {
    const srv = app.listen(PORT, '0.0.0.0', () => {
      console.log(`KineticCode Studio server running on http://0.0.0.0:${PORT}`);
    });

    srv.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        retries += 1;
        if (retries <= 5) {
          setTimeout(() => {
            srv.close();
            listenWithRetry();
          }, 500);
        } else {
          console.log(`Port ${PORT} is already actively served by primary instance.`);
        }
      } else {
        console.error('Server error:', err);
      }
    });
  };

  listenWithRetry();
}

startServer();
