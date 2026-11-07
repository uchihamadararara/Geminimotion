# MASTER PROMPT — Code-Generated Motion Graphics Video
Works with: Claude (Opus/Sonnet), Gemini (2.5 Pro / 3), Grok 4.
How to use: copy everything from `=== START ===` to `=== END ===`, fill the `{{...}}` slots in section 0, paste into the model.

---

=== START ===

# ROLE
You are a senior motion designer AND a senior React/TypeScript engineer.
You make cinematic, scroll-stopping motion-graphics videos entirely in code — no After Effects, no templates, no stock footage, no external image or video files.
Every frame must be a pure function of the frame number. The result must render to a real MP4 with sound.

# 0. MY BRIEF (fill before sending)
- TOPIC / MESSAGE: {{e.g. "Claude can make motion graphics with code, free"}}
- LANGUAGE OF ON-SCREEN TEXT: {{Hinglish / Hindi (Devanagari) / English}}
- FORMAT: {{9:16 1080x1920 (Reels/Shorts)  |  16:9 1920x1080  |  1:1 1080x1080}}
- DURATION: {{e.g. 45 s}}   FPS: {{30 or 60}}
- STYLE PRESET: {{A / B / C / D / E — see section 2}}
- VOICE-OVER SCRIPT (optional, with timings or an .srt): {{paste or "none — write one"}}
- HANDLE / CTA (last scene): {{e.g. "Comment MOTION" + @myhandle}}
- BRAND COLORS (optional): {{hex list or "use preset"}}

If any slot is empty, choose the best default yourself, state your assumption in ONE line, and continue. Do NOT ask me questions before building.

# 1. WHAT "GOOD" MEANS (the quality bar)
These are the traits of the reference videos I studied. Copy the principles, never the exact content.

1. **One idea per scene.** Each scene = one short phrase or one visual metaphor. Never two ideas fighting for attention.
2. **Hook in the first 1.5 s.** Open mid-motion with a hard-hitting 1–3 word line ("NO WAY.", "What if I told you…", "ONE."). No logo intro, no slow fade-in.
3. **Text IS the animation.** Kinetic typography: words slam in, stretch, split, slice, scale on beat, swap by masks. Text is never just "fade in".
4. **Rhythm over decoration.** Cuts and hits land on a beat grid (see section 4). Fast scenes (0.6–1.5 s) alternate with one breathing scene (2–3 s).
5. **Show the process, not only the result.** Include a scene where a prompt is typed into a box, code scrolls, a progress bar fills ("Rendering 11%"), then the payoff appears. This is the proof that it was made with code.
6. **Contrast & scale.** Huge type (30–45% of frame height for hero words) against tiny mono "HUD" labels. Big/small contrast = premium feel.
7. **Limited palette, one accent.** Max 3 colors + neutral. The accent color carries emphasis (keyword, underline, progress bar, stamp).
8. **Motion has physics.** Use springs/overshoot for entrances, ease-in-out for moves, ease-out for exits. Never linear except for scrolling code, marquees, and progress bars.
9. **Sound is half the video.** Every hit, wipe, type-on and stamp has a matching sfx; music bed sits under it (see section 5).
10. **End with a single CTA** held for 1.5–2 s with a stamp/pop and a "comment WORD" prompt.

# 2. STYLE PRESETS (pick one in section 0, or blend two)

**A — "Red Noir Kinetic" (dark, aggressive, creator-style)**
- BG `#050505` with subtle red scanline/grid band at the bottom, faint film grain, soft vignette.
- Accent `#FF2D1A` (red) + off-white `#F2EEE8`. Optional glossy 3D-looking red blobs/lips/orbs built with radial gradients + highlights (pure CSS/SVG, no images).
- Type: ultra-bold condensed or grotesk (Anton / Bebas Neue / Archivo Black / Bricolage Grotesque 800), ALL CAPS, tight leading.
- Signature moves: STRETCH (scaleX 1→2.2 with blur), LAYERS (stacked cards fanning in 3D), "NO THANKS." red stamp rotated −6°, whip-pan wipes, glitch shake on impact, fake "DONE" slam.
- Mix scene backgrounds: mostly black, with 2–3 full-bleed accent-color or light-paper scenes for rhythm.

**B — "Swiss Geometric" (cream / vermilion / cobalt / black, 16:9 friendly)**
- BG cream `#F1EEE6`, accent vermilion `#F0391F`, cobalt `#2B2BFF`, black `#0E0E0E`.
- Type: heavy grotesk (Archivo Black / Inter Tight 900) + a mono for micro labels.
- Signature moves: giant word fills the frame then is sliced by bars; circles→square→triangle→bar shape morphs; stacked-ring spheres/cones (draw with offset ellipses); bar-waveform & radial bar charts that "play" like an audio visualizer; marquee text rows repeating a word (NEVER NEVER NEVER); a 4-beat count ("17", "19") in a circle.
- Hard cuts on the beat. Backgrounds flip color on each hit.

**C — "HUD / Technical Cinematic" (dark, thin lines, mono labels)**
- BG `#0D0D0F`, thin 1px lines, corner brackets, timecode `00:00:07:12`, tiny mono metadata at the frame edges (REC dot, FPS, scene index).
- One orange/red point-light glow that travels and "ignites" the scene; subtle grid; bokeh dust.
- Type: light grotesk for questions ("What if I told you…"), bold for answers, mono for code. Caret blink on typed text.
- Signature moves: easing-curve graph drawn live and a dot riding it ("Instead of controlling After Effects, you…"), pipeline diagram with 3 boxes connected by animated dashes (idea → model → code), typed prompt with highlighted keywords, code block scrolling beside the live result, film-strip row of frames.

**D — "Hand-Drawn Explainer" (paper white, doodle line, step-by-step)**
- BG `#FBFAF7`, ink `#2A2A33`, one warm accent (coral `#E8566A`), pastel fills.
- Type: chunky rounded display (e.g. Bangers/Baloo/Chewy-like) for the title, clean sans for step cards.
- Wobbly SVG strokes (apply feTurbulence displacement or jittered paths at 8 fps "boil").
- Layout: title top, illustration left, step card right, 6-dot stepper at bottom that ticks done. Objects arc in with a tiny rotation and settle. Counter in the card tweens (0.0 / 1 oz).
- Ends with a celebratory "that's a …!" card + spark lines.

**E — "UI Micro-Interactions" (light, soft shadows, product-demo feel)**
- BG `#EEEEEB` with soft top light, cards `#FFFFFF` and pills `#0A0A0A`, radius 24–999, shadows `0 20px 50px rgba(0,0,0,.12)`.
- Type: neutral grotesk (Inter Tight / Geist / Space Grotesk), tabular numbers.
- A fake cursor (arrow SVG) moves on bezier paths, hovers, clicks (scale .92 + ripple). Components morph into each other: button → music pill → player card; toggle; segmented control with sliding thumb; chart whose numbers count and line redraws when the tab changes; command palette that types, filters, selects.
- Every state change: 8–12 frame spring, number blur-in, 2 px parallax.

# 3. TECH STACK & HARD RULES (non-negotiable)

**Stack:** Remotion 4.x + React + TypeScript. One composition, id `Main`.
Allowed packages: `remotion`, `@remotion/transitions`, `@remotion/media`, `@remotion/shapes`, `@remotion/paths`, `@remotion/layout-utils`. No other runtime deps.

**Determinism**
- All animation via `useCurrentFrame()`, `interpolate()`, `spring()`, `Easing`. 
- FORBIDDEN: CSS `transition`, CSS `@keyframes`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `Math.random()` (use `random("seed")` from remotion), `Date.now()`.
- Always `extrapolateLeft/Right: "clamp"` on interpolate.
- Time is authored in SECONDS in `config.ts`; convert with `s2f(sec) = Math.round(sec*FPS)`.

**Assets**
- No external images, videos, or CDN fonts. Everything is SVG / CSS gradient / canvas-free DOM.
- FONTS MUST WORK OFFLINE. Load fonts from `public/fonts/*.woff2` using `FontFace` + `delayRender()/continueRender()`, with a robust system fallback stack (`"Arial Black", Impact, system-ui, sans-serif`). Do NOT rely on Google Fonts network calls. If you must use `@remotion/google-fonts`, ALSO provide the offline fallback and say how to switch.
- Hindi/Hinglish: if text is Devanagari, use Noto Sans Devanagari / Mukta / Hind (offline woff2) and make sure line-height ≥ 1.25 so matras are not clipped.

**Layout safety (9:16)**
- Keep important content inside the safe area: 8% left/right, top 12%, bottom 22% (Reels UI overlaps).
- Every text line must auto-fit: measure with `@remotion/layout-utils` `fitText` (or a manual width check) so nothing overflows or wraps unexpectedly.
- Minimum body size 44 px on 1080 wide. Hero words 200–380 px.

**Performance (the video must render on a weak 1-core machine)**
- Avoid heavy `filter: blur()` on full-screen layers every frame; blur small elements only. Prefer opacity + transform.
- Avoid > 300 animated DOM nodes per frame. Particles ≤ 60.
- Use `<Sequence premountFor={30}>` for scenes.
- Render config: `Config.setVideoImageFormat("jpeg")`, `Config.setOverwriteOutput(true)`.

**Code quality**
- Split by file: `config.ts`, `theme.ts`, `anim.ts` (helpers), `components/*`, `scenes/*`, `ClaudeMotion/Main.tsx`, `Root.tsx`, `index.ts`.
- Reusable primitives: `<Beat from to>`, `<KineticWord>`, `<TypeOn>`, `<Wipe>`, `<Stamp>`, `<Cursor>`, `<CodeBlock>`, `<ProgressBar>`, `<HudFrame>`, `<Grain>`.
- Strict TypeScript, zero `any`, zero unused imports, `tsc` and `eslint` pass.

# 4. TIMING GRAMMAR

- Choose a BPM (default 120 → 0.5 s per beat). All scene boundaries and text hits snap to the beat grid: `t = n * 60/BPM`.
- Scene length: hook 1.5–3 s · normal 1.5–3.5 s · "process" scene (typing + render bar) 4–6 s · CTA 3–4 s.
- Word timing: a word is readable in ≥ 0.45 s; a 3-word line needs ≥ 1.2 s on screen. Never remove text before it has been fully visible for 0.5 s.
- Entrance 8–14 frames (spring, damping 12–18). Exit 6–10 frames. Overlap the exit of scene N with the entrance of N+1 by 4–8 frames (use wipes/masks, not cross-fades, unless style C).
- Impact frame: on every strong hit add 3–6 frames of camera shake (±6 px, decaying), 1 frame white/accent flash at 12% opacity, and a boom/pop sfx at that exact frame.
- If I give an `.srt`, LOCK scene timings to it: each caption's start time = a text hit.

# 5. SOUND (must be included)

Create `scripts/generate_audio.py` (numpy + scipy only, no downloads) that synthesises royalty-free files into `public/audio/`:
`music.mp3` (or .wav bed: kick + sub bass + hat + soft pad, loopable, matches BPM, −18 LUFS-ish) and sfx: `whoosh`, `whip`, `pop`, `stamp`, `boom`, `riser`, `glitch`, `tick`, `typing`, `ding`, `sparkle`, `counter`.
In the timeline keep a `CUES` array `[{ t: seconds, file, volume }]` and render each as `<Sequence from={s2f(t)}><Audio src={staticFile(file)} volume={v}/></Sequence>`.
Mix rules: music 0.35–0.5, sfx 0.6–1.0, a riser 1 s before every big reveal, silence for 2–3 frames right before the biggest hit (it makes it feel heavier). Voice-over (if supplied) at 1.0 with music ducked to 0.25 while it plays.

# 6. SCRIPT & STRUCTURE (default storyboard — adapt to my topic)

| # | Scene | Purpose | Typical length |
|---|---|---|---|
| 1 | HOOK | Pattern interrupt: bold claim or question | 1.5–3 s |
| 2 | PROBLEM | The old/expensive/slow way (use a visual "X", a price, a wait bar) | 3–5 s |
| 3 | TURN | "But what if…" — the reveal of the tool/idea | 2–3 s |
| 4 | PROCESS | Prompt typed → code scrolls → progress bar → result | 4–6 s |
| 5 | PROOF | 3–5 rapid-fire showcase beats (kinetic type, 3D, charts, transitions) | 6–10 s |
| 6 | NO-BS | Kill objections ("No plugin. No template. No paid tool.") as stamped chips | 3–4 s |
| 7 | CTA | One action, one keyword to comment, handle | 3–4 s |

Writing rules for on-screen copy: 1–6 words per line, verbs first, no filler. In Hinglish keep it conversational ("Maine Claude ko sirf idea diya"). Highlight 1 keyword per line with the accent color.

# 7. OUTPUT FORMAT (how you must answer)

1. One-line assumptions (format, fps, BPM, preset, fonts).
2. A FILE TREE of the project.
3. EVERY file in full, each in its own fenced code block with the path as the first line comment. No "…rest remains same", no placeholders, no TODOs. The project must run after copy-paste.
4. `package.json` with exact versions, scripts: `dev`, `render`, `audio`.
5. Exact commands:
```
npm install
python3 scripts/generate_audio.py
npx remotion render Main out/video.mp4 --codec=h264 --crf=18
```
6. A short "tweak guide": where to change text, timings, colors, and how to add a voice-over file.

If the answer would be too long for one message, split into numbered parts (PART 1/3 …), never truncate a file mid-way, and end each part with the exact name of the next file you will send.

# 8. SELF-CHECK BEFORE YOU ANSWER (silently verify, then fix)
- [ ] Does frame 0 already show something striking (no blank/black start)?
- [ ] Is every animation derived from `useCurrentFrame()`?
- [ ] Any CSS transition/keyframes/random/Date left? (must be zero)
- [ ] Any network font/image/URL? (must be zero)
- [ ] Is all text inside the safe area and auto-fitted?
- [ ] Do total scene durations add up exactly to the target duration?
- [ ] Do sfx cues match visual hit frames?
- [ ] Does the last scene hold the CTA for ≥ 1.5 s without motion clutter?
- [ ] Do `tsc` and `eslint` pass logically (imports, types, unused vars)?

=== END ===

---

# MODEL-SPECIFIC ADD-ONS (append under the master prompt)

## Claude (claude.ai with file creation / Claude Code)
```
You can run code. Build the project in /home/claude, run `npm install`, render with
`--concurrency=1` if the machine has 1 core, then check 6–8 frames across the timeline
(contact sheet) before delivering the MP4. If Chrome or fonts cannot download, use a local
Chromium via --browser-executable and the offline fonts in public/fonts. Deliver the .mp4
and the zipped source.
```

## Gemini (2.5 Pro / 3 / AI Studio)
```
You cannot render. Output the complete project as separate code blocks, one per file, and nothing
else between them except the file path headers. Use only the packages listed. Do not shorten any
file. If you hit the output limit, stop at a file boundary and write "CONTINUE: <next file path>".
Prefer simple DOM + SVG over WebGL/three.js so the project renders on any laptop.
```

## Grok 4
```
Think step by step about timing first: print the beat grid and the scene table (start, end, text, sfx)
in a compact table, THEN write the code. Keep each file complete. Avoid third-party packages beyond
the allowed list. If browsing is available, do NOT browse — all required knowledge is in this prompt.
```

---

# QUICK "SHORT VERSION" (when you only want a fast result)
```
Make a {{DURATION}}s {{FORMAT}} cinematic kinetic-typography motion video in Remotion 4 (TypeScript) about:
"{{TOPIC}}". Style preset {{A–E}}. All animation frame-driven (no CSS transitions, no random, no network assets),
offline fonts, synthesized music + sfx via a Python script, beat-synced at {{BPM}} BPM, hook in the first 1.5 s,
a prompt→code→render-progress scene in the middle, 3–5 rapid showcase beats, final CTA "Comment {{WORD}}".
Return every file in full + package.json + render commands. No placeholders.
```

---

# LESSONS FROM REAL RENDERS (keep these in mind)
1. Network can be blocked → never depend on Google Fonts / CDNs at render time.
2. On a 1-core machine use `--concurrency=1`; a 55 s 1080×1920 video takes roughly 12–15 minutes.
3. Use `--crf=16–18` for sharp text; ~30 MB for 55 s is normal.
4. Always preview a contact sheet of frames before calling the video "done": empty frames usually mean a wipe transition caught mid-way, but verify it.
5. Voice-over: record last, then lock the scene timings to the `.srt`, not the other way round.
