---
name: sketch-music-video
description: Create a 16:9 pencil-sketch lyric music video (inspired by Anuv Jain's "Inaam") from a song MP3 and line-by-line lyrics. Separates vocals with demucs, force-aligns every word with torchaudio MMS_FA, draws stroke-by-stroke graphite scenes with cross-hatched shadows and letter-by-letter handwritten lyrics on off-white sketchbook paper via headless Chrome HTML5 Canvas, previews a contact sheet before rendering, and encodes a 1080p master MP4 (AAC 256k) plus a <20 MB 720p WhatsApp copy.
---

# `/sketch-music-video` — Pencil-Sketch Lyric Video Skill

Generates a deterministic, code-drawn pencil-sketch lyric video in the style of Anuv Jain's *"Inaam"*: soft graphite illustrations of the song's story draw stroke by stroke onto textured off-white sketchbook paper while lyrics are handwritten letter by letter next to their verse illustration at the exact sung timestamp. Earlier verses remain on the page, slightly faded, so the sketchbook page fills up organically by the end of the song.

---

## Core Rules (Non-Negotiable)

1. **100% Code-Drawn on HTML5 Canvas**:
   - Render every frame deterministically using an HTML5 `<canvas>` driven frame-by-frame in headless Chrome (Puppeteer / Playwright) and piped into `ffmpeg`.
   - **Never** use stock footage, external raster illustrations, or AI image generators. Every paper fiber, pencil stroke, cross-hatch shadow, and handwritten character is procedural so the look is consistent every time.
2. **Exact Forced Alignment (`demucs` + `torchaudio.pipelines.MMS_FA`)**:
   - **Never guess or evenly space lyric timings.**
   - Step 1 separates the isolated vocal stem (`vocals.wav`) using `demucs --two-stems=vocals`.
   - Step 2 force-aligns every sung line and word against `vocals.wav` using `torchaudio.pipelines.MMS_FA` (or `ctc-forced-aligner`) to produce `alignment.json` with exact `startSec` and `endSec` for every word and character.
3. **Contact Sheet First + Overwrite Confirmation**:
   - Before running the full frame-by-frame video encode, render a **Contact Sheet (`contact-sheet.png`)** of 6–8 key timestamps across the song showing the progressive sketchbook layout.
   - Show the contact sheet to the user and **ask for confirmation before full render or before overwriting any existing `.mp4` output files**.
4. **Dual 16:9 Deliverables**:
   - **Master Render (`output-1080p.mp4`)**: `1920x1080` (16:9), 30 fps, H.264 (`-crf 18 -pix_fmt yuv420p`), original song audio encoded as **AAC 256k** (`-c:a aac -b:a 256k`).
   - **WhatsApp Copy (`output-720p-whatsapp.mp4`)**: `1280x720` (16:9), 30 fps, two-pass / constrained bitrate H.264 + AAC 128k guaranteed **under 20 MB**.

---

## Step-by-Step Execution Workflow

### Step 1: Vocal Separation (`demucs`) & Forced Alignment (`torchaudio MMS_FA`)

Given `<song.mp3>` and `<lyrics.txt>` (one sung line per row):

```bash
# 1. Isolate clean vocals with Demucs
python3 -m demucs --two-stems=vocals -o ./build/demucs "<song.mp3>"

# 2. Convert vocal stem to 16kHz mono WAV for MMS_FA forced alignment
ffmpeg -y -i ./build/demucs/htdemucs/*/vocals.wav -ac 1 -ar 16000 ./build/vocals_16k.wav
```

Run `./scripts/align_lyrics_mms.py` using `torchaudio.pipelines.MMS_FA`:

```python
# build/align_lyrics_mms.py
import json, re, sys, torch, torchaudio

bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).to("cpu")
LABELS = bundle.get_labels(star=None)
DICTIONARY = bundle.get_dict(star=None)

waveform, sr = torchaudio.load(sys.argv[1])
assert sr == bundle.sample_rate

with open(sys.argv[2], "r", encoding="utf-8") as f:
    raw_lines = [line.strip() for line in f.readlines() if line.strip()]

# Romanize/normalize tokens for MMS dictionary lookup while keeping original display text
words_original = []
words_clean = []
line_map = []
for line_idx, line in enumerate(raw_lines):
    for w in line.split():
        clean = re.sub(r"[^a-z']", "", w.lower())
        if clean:
            words_original.append(w)
            words_clean.append(clean)
            line_map.append(line_idx)

with torch.inference_mode():
    emission, _ = model(waveform)

tokens = [DICTIONARY[c] for w in words_clean for c in w if c in DICTIONARY]
trellis_spans = torchaudio.functional.forced_align(emission, torch.tensor([tokens], dtype=torch.int32))
# Map frame spans to seconds (stride = waveform.size(1) / emission.size(1) / sr)
```

Save the resulting JSON to `./build/alignment.json` containing:
- `title`, `artist`, `durationSec`
- `verses`: grouped into sketchbook cells (4 lines per verse), each paired with a scene vignette (`window_boy`, `shop_counter`, `night_room`, `rain_lamp`, `train_window`, `teacups_sill`, `notebook_guitar`, `paper_boat`), exact `startSec`, `endSec`, and per-word / per-letter timestamps.

---

### Step 2: Off-White Sketchbook Paper & Top-Left Hand-Lettered Header

- **Canvas Resolution**: `1920x1080` (16:9 landscape sketchbook page).
- **Paper Base**: Warm off-white archival sketchbook paper (`#F6F2E9`) with:
  - Subtle procedural tooth/grain noise (`0.035` alpha stipple matrix),
  - Soft warm vignette around the page edges (`#E5DEC9`),
  - Top-left hand-lettered **Song Title** and **Artist Name** in dark graphite (`#2C2A27`, font `'Caveat'`, `'Kalam'`, or `'Architects Daughter'`) with a delicate hand-drawn double-ruled pencil underline that wobbles slightly via 1D Perlin/sine jitter.

---

### Step 3: Stroke-by-Stroke Graphite Vignettes & Cross-Hatching

For each verse cell on the sketchbook grid (up to 6–8 cells arranged organically across the page):
- **Thin Grey Pencil Lines (`#524F4A`, `lineWidth: 1.4px–2.1px`)**:
  - Every path is rendered using a **Double-Pass Graphite Stroke** (primary stroke at `0.78` alpha + secondary jittered hair-line stroke offset by `±0.8px` at `0.28` alpha) to mimic real HB/2B pencil lead on textured paper.
- **Progressive Stroke Reveal**:
  - As the verse starts (`verse.startSec` → `verse.endSec`), paths draw on **stroke by stroke** in sequential order using path arc-length parameterization.
- **Cross-Hatching for Shadows**:
  - Shadow regions (windowpane corners, under the shop counter overhang, lamp shadow cone, folds of a curtain) fill in after the main outlines using parallel diagonal hatch lines (`45°` at `0.18` alpha, followed by `-35°` counter-hatching at `0.12` alpha).
- **Built-in Narrative Scene Archetypes**:
  1. `window_boy`: A boy sitting by a paned window looking out at distant rooftops and crescent moon.
  2. `shop_counter`: A quiet tea/old shop counter with hanging bulbs, glass jars, and a warm awning.
  3. `night_room`: A small room at night with a desk lamp, open notebook, bed corner, and slanted moonlight.
  4. `rain_lamp`: A solitary streetlamp casting diagonal rain streaks and cross-hatched puddle reflections.
  5. `train_window`: A train compartment window framing passing telegraph poles and distant hills.
  6. `teacups_sill`: Two steaming cups of chai resting on a stone sill beside a fallen leaf.

---

### Step 4: Smooth -500ms Pre-Roll Handwritten Lyrics & Sustained Vocal Holds

- Each lyric line belonging to a verse is placed directly **to the right of (or below) its companion pencil drawing**.
- **500 Milliseconds (`0.50s`) Smooth Pre-Roll Lead Time**:
  - Every word starts appearing smoothly **500ms (`0.50s`) BEFORE** its sung audio onset (`visualStartSec = Math.max(0, word.startSec - 0.50)`) using a 60fps `easeOutCubic` horizontal clip reveal + soft vertical settle (`+4.5px -> 0px`) so the viewer can read the word without lag right as the vocal hits.
  - Never slice Devanagari words character-by-character mid-ligature; reveal whole typographic words smoothly via progressive horizontal clip masks.
- **Sustained Vocal Hold Animation (`isLongHold`)**:
  - Whenever a word is held/sustained in the song (e.g., `>= 0.64s` duration), keep that word highlighted in rich dark 4B graphite across its entire acoustic hold duration, accompanied by a gentle breathing scale (`1.00 -> 1.065`) and a **continuous double-graphite melisma wave (`〰`)** drawn underneath the word from `0%` to `100%` of the hold duration.

---

### Step 5: Persistent Sketchbook Page Memory (Slight Fade on Earlier Verses)

- Never clear the page between verses.
- Earlier verses and their companion drawings remain visible in their position on the sketchbook page, smoothly fading from `1.0` opacity (active verse) to `0.56` opacity (completed verses) so that by the final chorus, the entire 16:9 page looks like a completed, lived-in artist's sketchbook.

---

### Step 6: Contact Sheet Preview & Dual FFmpeg Encode (1080p AAC 256k + 720p WhatsApp)

1. **Generate Contact Sheet (`./build/contact-sheet.png`)**:
   - Render 6 evenly spaced timestamps into a `3x2` grid image (`1920x1080`) and present it to the user.
   - Ask for user confirmation before starting the full render or overwriting existing `.mp4` files.
2. **Encode 16:9 1080p Master (`AAC 256k`)**:
   ```bash
   ffmpeg -y \
     -f image2pipe -framerate 30 -i - \
     -i "<song.mp3>" \
     -map 0:v:0 -map 1:a:0 \
     -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
     -c:a aac -b:a 256k -ar 48000 \
     -shortest "./output-1080p.mp4"
   ```
3. **Encode 720p WhatsApp Copy (`< 20 MB`)**:
   ```bash
   # Calculate max video bitrate so total size is strictly < 18.5 MB
   ffmpeg -y \
     -i "./output-1080p.mp4" \
     -vf "scale=1280:720:flags=lanczos" \
     -c:v libx264 -preset slow -crf 24 -maxrate 2200k -bufsize 4400k -pix_fmt yuv420p \
     -c:a aac -b:a 128k \
     -movflags +faststart \
     "./output-720p-whatsapp.mp4"
   ```
