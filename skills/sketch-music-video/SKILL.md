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
