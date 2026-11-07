# Continuous Single-Shape UI Morphing Reel (120 BPM · 7 Bars · 9:16 @ 30fps)

A Dribbble and After Effects-grade deterministic UI motion reel (`1080×1920`, `30fps`, `14.00s` / `420 frames` across `7 bars` at `120 BPM`) where a **single morphing surface** continuously transforms through 12 tactile UI states—driven by a realistic cursor with direct-manipulation drags, closed-form step-response springs, dual-spring liquid edges, kinetic typography, and peak-synced 120 BPM audio + UI foley.

## User Review & Confirmed Decisions

> [!IMPORTANT]
> Review the **28-Beat State Grid (7 Bars @ 120 BPM)** below before we write the deterministic `seek(t)` engine and render `out.mp4`. Every beat (`0.50s`) triggers a distinct physical cursor action, spring impulse, and UI transformation, looping seamlessly back to Beat 0.

- **Confirmed UI Morphing Sequence**: All 12 states in one unbroken element (`Button` → `Loader` → `Check` → `Dynamic Island` → `Music Player + Play/Pause Morph` → `Progress Bar Scrub` → `Over-Stretched Volume Slider` → `Liquid Toggle Switch` → `Liquid Tab Indicator` → `Self-Drawing Chart + Hover Tooltip` → `⌘K Command Palette + Live Typing` → `Toast` → `Button`).
- **Confirmed Color System**: Warm-gray studio canvas (`#F3F2EE`), stark jet-black (`#111111`) and pure white (`#FFFFFF`) UI surfaces, and Signature Orange (`#FF5A1F`) reserved strictly for focal interactive highlights (active scrubbers, chart line/tooltip, toggle active state, and primary CTA badge).
- **Confirmed Format & Frame Rate**: `9:16 Vertical (1080×1920)` at a locked `30fps` (`420 frames` over `14.00s`), rendered with **4 subframes per frame** blended for authentic shutter motion blur, plus dynamic camera zoom/pan framing so every UI state fills the vertical stage with editorial presence.
- **Confirmed Audio & Beat Grid**: Synthesized `120 BPM` crisp minimal house groove starting on the Beat 0 downbeat, with sample-accurate UI foley (cursor down/up clicks, scrub friction, toggle pop, chart tick, mechanical keystrokes, toast bell) placed at exact beat peaks.

---

## 1. The 28-Beat State Grid (120 BPM · 7 Bars · `0.50s` per Beat)

At `120 BPM`, each beat is exactly `0.50s` (`15 frames` @ `30fps`), and each 4-beat bar is `2.00s` (`60 frames`). Total duration: `14.00s` (`420 frames`).

| Bar | Beat | Time (`s`) | Frame (`@30fps`) | Active UI State (Single Morphing Container) | Cursor Action & Closed-Form Spring Physics | Peak-Synced Audio & UI Foley |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bar 1** | **1.1** | `0.00s` | `0` | **State 01 · Tactile Pill Button** (`"Generate Reel"` · `340×96px`, `r=48px`, `#111111`) | Cursor glides in from `(680, 1140)` to button center `(540, 960)`; camera at `1.25×` zoom. | Downbeat kick + warm sub bass note. |
| **Bar 1** | **1.2** | `0.50s` | `15` | **Button Press -> Morph to Loader** (`96×96px` circle, `r=48px`) | Cursor presses (`scale: 0.92`); button width springs down to `96px` while label blurs/exits (`120ms`) and high-precision arc spinner enters. | Crisp tactile mouse-down click + hi-hat. |
| **Bar 1** | **1.3** | `1.00s` | `30` | **State 02/03 · Loader -> Checkmark Badge** (`112×112px`, `r=56px`, `#FF5A1F` fill) | Spinner arc completes `360°` and morphs its stroke into a sharp vector checkmark (`✓`) with tiny spring overshoot (`ζ=0.62`). | Snare/clap + crystalline check confirmation ping. |
| **Bar 1** | **1.4** | `1.50s` | `45` | **State 04 · Dynamic Island Expansion** (`720×140px`, `r=70px`, `#111111`) | Check badge expands horizontally into a dark Dynamic Island pill with live waveform bars & track metadata entering via vertical clip-mask. | Soft magnetic expansion swell. |
| **Bar 2** | **2.1** | `2.00s` | `60` | **State 05 · Full Music Player Card** (`860×440px`, `r=44px`, `#111111`) | Island unfolds vertically into a rich player card (album art geometry, kinetic title `"After Effects Study"`, timecode `01:14 / 02:30`, play button). | Downbeat kick + chord stab. |
| **Bar 2** | **2.2** | `2.50s` | `75` | **Play -> Pause Icon Morph** | Cursor clicks the Play triangle `(820, 1010)`; the 3 polygon vertices morph smoothly into 2 parallel Pause bars while waveform bars accelerate. | Tactile button click + bass groove. |
| **Bar 2** | **2.3** | `3.00s` | `90` | **State 06 · Direct-Manipulation Progress Scrub (Start)** | Cursor grabs the progress thumb at `32%` and drags rapidly right toward `84%`; timecode numerals roll with tabular spring momentum. | Subtle analog scrub tick sequence. |
| **Bar 2** | **2.4** | `3.50s` | `105` | **Progress Bar Isolates -> Morphs to Volume Slider** (`820×130px`, `r=65px`, `#FFFFFF`) | Surrounding player chrome blurs out and collapses vertically around the progress bar, turning the bar itself into a crisp white Volume Slider card. | Snare + smooth filter transition click. |
| **Bar 3** | **3.1** | `4.00s` | `120` | **State 07 · Volume Slider Rubber-Band Over-Stretch** (`100% -> 118%`) | Cursor drags the slider thumb **past maximum** (`x > rightEdge`); container width stretches elastically (`+68px`), height compresses (`-12px` squash), and `"118% MAX"` shakes subtly. | Downbeat + elastic rubber tension pitch rise. |
| **Bar 3** | **3.2** | `4.50s` | `135` | **Slider Release & Spring Snap-Back** (`820×130px`) | Cursor releases drag; closed-form spring (`ω=26, ζ=0.68`) snaps the stretched right edge back to `100%` with one crisp settle. | Crisp mouse-up release + elastic snap thud. |
| **Bar 3** | **3.3** | `5.00s` | `150` | **State 08 · Morph to Liquid Toggle Switch** (`420×180px`, `r=90px`, `#E4E2DD` -> `#FF5A1F`) | Slider compresses horizontally into a macro Toggle Switch; cursor clicks left side to flip the knob right. | Tactile toggle click. |
| **Bar 3** | **3.4** | `5.50s` | `165` | **Liquid Toggle Flip on Beat (Dual-Spring Knob)** | Knob's **leading right edge** rides a fast spring (`ω=32`) while **trailing left edge** rides a slower spring (`ω=18`), stretching like liquid mercury before settling circular as track turns `#FF5A1F`. | Deep wooden toggle pop on the beat. |
| **Bar 4** | **4.1** | `6.00s` | `180` | **State 09 · Knob Becomes Liquid Segmented Tabs** (`880×140px`, `r=36px`, `#FFFFFF`) | Toggle track widens into a 3-tab bar (`"Overview" · "Velocity" · "Retention"`); the orange toggle knob seamlessly becomes the active tab pill indicator. | Downbeat kick + subtle UI slide. |
| **Bar 4** | **4.2** | `6.50s` | `195` | **Liquid Tab Switch (`"Overview"` -> `"Velocity"`)** | Cursor clicks `"Velocity"`; tab pill's leading & trailing edges ride asymmetric springs to stretch across the gap, swapping label contrast mid-flight. | Soft mechanical tab click. |
| **Bar 4** | **4.3** | `7.00s` | `210` | **Liquid Tab Switch (`"Velocity"` -> `"Retention"`)** | Cursor clicks `"Retention"` on the beat; indicator stretches right again with dual-spring physics and settles cleanly. | Crisp tab click + hi-hat sync. |
| **Bar 4** | **4.4** | `7.50s` | `225` | **State 10 · Tabs Open Vertically into Analytics Chart Card** (`900×760px`, `r=44px`, `#FFFFFF`) | Tab bar stays docked at the top while the container expands downward into a high-contrast editorial Chart Stage (`+284.6%` kinetic counter). | Snare + card unfold harmonic. |
| **Bar 5** | **5.1** | `8.00s` | `240` | **Self-Drawing Spline Curve & Gradient Area Fill** | A smooth cubic-bezier spline draws from left to right (`0 -> 100%` path length) in `#FF5A1F` (`6px` stroke) with subtle vertical grid hairlines and rolling axis numbers. | Downbeat + ascending arpeggio ticks along curve. |
| **Bar 5** | **5.2** | `8.50s` | `255` | **Cursor Hover Scrub Along Chart Peak (`Peak 1`)** | Cursor glides over data point `04` (`x=520`); a vertical magnetic crosshair snaps to the curve and a crisp black Tooltip (`"94.2 fps · +42%"`) pops up via spring scale. | Magnetic detente tick. |
| **Bar 5** | **5.3** | `9.00s` | `270` | **Cursor Hover Scrub to Apex (`Peak 2`)** | Cursor drags horizontally to the chart apex (`x=760`); tooltip tracks cursor position with lagged spring inertia and updates readout (`"120.0 BPM · 99.8%"`). | Second magnetic detente tick. |
| **Bar 5** | **5.4** | `9.50s` | `285` | **State 11 · Chart Collapses into `⌘K` Command Pill** (`880×150px`, `r=36px`, `#111111`) | Chart lines fold inward and surface inverts to `#111111` as a sleek `⌘K` Command Palette header bar with blinking orange caret. | Snare + crisp command palette whoosh-click. |
| **Bar 6** | **6.1** | `10.00s` | `300` | **Command Palette Opens Result List + Live Keystrokes (`"re..."`)** (`880×560px`, `r=40px`) | Container expands down to show 4 command rows; `"render 30fps"` types in character-by-character as non-matching rows blur/collapse out in real time. | Downbeat + 3 tactile mechanical keystrokes. |
| **Bar 6** | **6.2** | `10.50s` | `315` | **Live Keystroke Filtering Isolates Top Match** | Typing completes `"render 30fps reel"`; list filters down to a single highlighted row (`"Export 1080×1920 Master MP4"` with `↵ Enter` keycap badge). | 3 mechanical keystrokes + filter lock tick. |
| **Bar 6** | **6.3** | `11.00s` | `330` | **Enter Key Press Impulse** | Cursor clicks the `↵ Enter` action (or keycap depresses with `scale: 0.88` spring); the highlighted row flashes `#FF5A1F` and compresses upward. | Satisfying mechanical Return key thunk. |
| **Bar 6** | **6.4** | `11.50s` | `345` | **State 12 · Morph into Floating Toast Notification** (`740×148px`, `r=74px`, `#111111`) | Command palette snaps into a compact pill Toast (`"✓ Master Reel Exported · 30fps"` with an animated circular progress ring & `"Undo"` action). | Warm two-note notification chime. |
| **Bar 7** | **7.1** | `12.00s` | `360` | **Toast Hold & Camera Framing Pull-Back** | Toast floats with subtle spring breathing while the virtual camera zooms smoothly (`1.08×` → `1.25×`) preparing the loop return. | Downbeat kick + warm resolution chord. |
| **Bar 7** | **7.2** | `12.50s` | `375` | **Cursor Clicks Toast Dismiss / Action** | Cursor moves to the right side of the Toast and clicks `"Done"` at `(760, 960)`. | Crisp tactile click. |
| **Bar 7** | **7.3** | `13.00s` | `390` | **Toast Compresses Back into Initial Pill Button** (`340×96px`, `r=48px`, `#111111`) | Toast content blurs/exits (`110ms`) while `"Generate Reel"` label enters via vertical mask and container springs back to exact `340×96px` button geometry. | Soft spring settle sound. |
| **Bar 7** | **7.4** | `13.50s` | `405–420` | **Seamless Loop Lock (`Frame 420 === Frame 0`)** | Cursor glides back to exact starting coordinates `(680, 1140)` with matching velocity vector so `t = 14.00s` is bit-identical to `t = 0.00s`. | Final bar turnaround into Beat 1.1 downbeat. |

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Color System
- **Dribbble-Grade Tactile UI Motion**: Inspired by Apple Dynamic Island choreography, Linear command palettes, and Rauno Freiberg interaction design studies.
- **Strict 60-30-10 Palette**:
  - **60% Warm-Gray Studio Canvas (`#F3F2EE`)**: Soft architectural background with subtle radial vignette (`#E8E6E0` at edges) and crisp contrast for both white and jet-black morphing surfaces.
  - **30% Monochrome UI Surfaces (`#111111` & `#FFFFFF`)**: High-contrast surface swaps with `1px` specular borders (`rgba(0,0,0,0.08)` on white, `rgba(255,255,255,0.12)` on black) and multi-layered realistic elevation shadows (`0 24px 60px rgba(17,17,17,0.14)`).
  - **10% Signature Orange Accent (`#FF5A1F`)**: Focused strictly on the active interaction focal point (check badge, active scrubber fill, over-stretched slider tension bar, flipped toggle track, liquid tab pill, chart spline/dot, and command keycap).
- **Typography & Content Swaps**:
  - **Clean UI Sans (`Plus Jakarta Sans` / `Inter Tight` / system geometric sans)** for crisp interface labels, titles, and buttons, paired with **`JetBrains Mono` (`tabular-nums`)** for rolling timecodes, percentage counters, and beat/frame readouts.
  - **De-Overlapped Content Cross-Blur**: Whenever the single container morphs between states, outgoing inner content scales to `0.94` with a short motion blur/opacity exit over `110ms` *before* incoming content unmasks from `scale: 1.04` over `140ms`, preventing any text collision or overlap.

---

## 3. Key Technical & Mathematical Decisions

1. **Pure Closed-Form Step-Response Spring Summation (`seek(t)`)**
   - *Chosen Approach*: Every continuous property (`width`, `height`, `borderRadius`, `bgColor`, `cameraZoom`, `cameraX`, `cameraY`, `cursorX`, `cursorY`) is modeled as a base value plus the sum of closed-form damped harmonic oscillator step responses:
     $$x(t) = x_0 + \sum_{i} \Delta x_i \cdot S(t - t_i, \omega_i, \zeta_i)$$
     where $S(\tau, \omega, \zeta) = 1 - e^{-\zeta \omega \tau}\left(\cos(\omega_d \tau) + \frac{\zeta \omega}{\omega_d}\sin(\omega_d \tau)\right)$ for $\tau > 0$ (and $0$ for $\tau \le 0$).
   - *Why*: Zero state is carried between frames. Scrubbing to any random timestamp `t` or rendering subframes out-of-order produces the exact same physical position and velocity with subtle, realistic overshoot (`ζ = 0.68–0.82`).

2. **Dual-Spring Asymmetric Edges (Liquid Toggle & Liquid Tabs)**
   - *Chosen Approach*: For the Toggle Knob (Beats `3.3–3.4`) and Segmented Tab Indicator (Beats `4.1–4.3`), the left edge $x_L(t)$ and right edge $x_R(t)$ are driven by two independent springs with different natural frequencies ($\omega_{\text{lead}} = 34$, $\omega_{\text{trail}} = 19$).
   - *Why*: When moving right, $x_R(t)$ leaps ahead while $x_L(t)$ lags behind, naturally stretching the pill width mid-flight without ad-hoc keyframes, then settling back to exact width on arrival.

3. **Direct-Manipulation Cursor Drags & Rubber-Band Over-Stretch**
   - *Chosen Approach*: During Beat `2.3` (Progress Scrub) and Beat `3.1` (Volume Over-Stretch), while `cursorPressed(t)` is true, the slider value and container right edge are computed directly from `cursorX(t)` (with logarithmic resistance past `100%` max). At the exact release timestamp `t = 4.50s` (Beat `3.2`), a step-response spring impulse cancels the over-stretch back to `100%`.

4. **4× Subframe Motion Blur & Beat-Per-Frame QA Inspection**
   - *Chosen Approach*: Both the live preview and the `npm run render` MP4 pipeline evaluate `renderFrame(ctx, t + subOffset)` across 4 sub-frame shutter samples per frame (`subOffset ∈ [-0.375/fps, -0.125/fps, +0.125/fps, +0.375/fps]`), blending them into each `1080×1920` output frame. Before rendering all 420 frames into `out.mp4`, the build script outputs **1 QA frame per beat (28 beat frames)** to verify grid alignment, typography legibility, and zero clipping.

---

## 4. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   DETERMINISTIC TIME ENGINE: seek(t)                       │
│  t ∈ [0.00s, 14.00s) · 120 BPM (0.50s/beat) · 30 FPS (420 frames + 4x blur)│
└───────────────────┬────────────────────────────────────┬───────────────────┘
                    │                                    │
                    ▼                                    ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│   CLOSED-FORM SPRING SUMMATION CORE   │  │ 120 BPM HOUSE + FOLEY SYNTH     │
│ • sumSprings(t, impulses[])           │  │ • Beat-grid kick, bass, chords  │
│ • dualEdgeSpring(t, targets[])        │  │ • Peak-aligned clicks, snaps,   │
│ • directDragWithRubberBand(t, cursor) │  │   keystrokes, toggle pop, chime │
│ • cameraFraming(t) & cursorPath(t)    │  │ • 44.1kHz WAV -> ffmpeg AAC mux │
└───────────────────┬───────────────────┘  └─────────────────┬───────────────┘
                    │                                        │
                    ▼                                        ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│   SINGLE-SHAPE MORPHING RENDERER      │  │ STUDIO UI & STANDALONE EXPORT   │
│ • 1 Container morphing W, H, R, Color │  │ • Interactive 9:16 Stage +      │
│ • 12 UI States with de-overlapped     │  │   28-Beat Scrubber & Beat Grid  │
│   enter/exit blur envelopes           │  │ • Rendered out.mp4 Player       │
│ • Realistic Vector Cursor + Click Ring│  │ • Self-contained index.html     │
│ • 4-Subframe Shutter Accumulator      │  │   generator + 28 Beat QA Sheet  │
└───────────────────────────────────────┘  └─────────────────────────────────┘
```
