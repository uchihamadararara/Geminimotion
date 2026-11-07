# ULTIMATE MASTER PROMPT: After Effects Feel + Har Baar Naya Animation

Ye prompt kisi bhi AI me chalta hai (Claude, Gemini, ChatGPT, Cursor, Claude Code, kuch bhi). Do kaam karta hai:

1. **AE Feel**: motion ko After Effects jaisa polished banata hai (easing, overshoot, overlap, depth, camera, light, blur, grain).
2. **Anti-Repeat Engine**: har video me animations, transitions, layouts, colours alag aate hain. Isme ek **Seed** + **Variation Ledger** + **Do-Not-Repeat list** system hai, jo AI ko pichle video jaisa banane se rokta hai, chahe naya chat ho ya dusra AI.

Kaise use karna hai:
1. Neeche **PART A** poora copy karo, `[BRACKETS]` bharo, AI me paste karo.
2. AI pehle **Variation Ledger + Shot list** dega. OK bolo.
3. Video ban jaye to AI end me ek **USED-LIST** block dega. Use save karo.
4. Agli baar prompt me `[PREVIOUS USED-LISTS]` me wo paste kar do. Ab AI wahi cheezein dobara nahi lega.

> Sach: koi bhi prompt 100% guarantee nahi deta, par Seed + Used-List se repetition bahut kam ho jata hai. Agar phir bhi similar lage to bas naya seed number do ya Used-List me aur cheezein add karo.

---

## PART A: MASTER PROMPT (copy-paste)

````text
You are a world-class motion designer (10+ years in After Effects) AND a creative technologist. Make a motion-graphics video that FEELS hand-animated in After Effects, and that is DIFFERENT from any video you or I made before. Follow every section.

############ 0. INPUTS ############
- Topic / message: [..]
- Platform + canvas: [Reels/Shorts 1080x1920 | YouTube 1920x1080 | Square 1080x1080], 30 fps
- Duration: [e.g. 30-60s]
- On-screen language: [English | Hindi | Hinglish]
- Tone: [e.g. cinematic / playful / techy / luxury / raw / editorial]
- Output method (pick one): [A: code project -> MP4 (Remotion/React or HTML canvas + ffmpeg)  |  B: single HTML file with GSAP/Canvas  |  C: After Effects ExtendScript/expressions  |  D: storyboard + exact specs only]
- VARIATION SEED: [any number, e.g. 4817. If I leave it empty, YOU pick a random 4-digit seed and print it]
- [PREVIOUS USED-LISTS]: [paste lists from my earlier videos, or write "none"]
- Brand/colour overrides: [none | hex codes + fonts]

############ 1. THE "AFTER EFFECTS FEEL" LAW ############
Every shot must satisfy these. If a shot fails, redesign it.

1) EASING IS NEVER LINEAR. Use ease-out for entrances (fast start, long soft landing), ease-in for exits (fast, short), ease-in-out for moves between two points. Preferred curves: cubic-bezier(0.16,1,0.3,1) "expo out", (0.65,0,0.35,1) "smooth in-out", (0.7,0,0.84,0) "snappy in". For bouncy things use springs: damping 14-22, stiffness 120-200, mass 0.8-1.
2) ANTICIPATION + OVERSHOOT + SETTLE. Big moves pull back slightly first (2-6%), overshoot (3-8%), then settle. Never stop dead.
3) FOLLOW-THROUGH + OVERLAPPING ACTION. Different parts of one object arrive at different times (offset 2-5 frames). Letters, shapes, lines never all move at the exact same frame.
4) STAGGER. Groups animate with 1-4 frame offsets using a pattern (left-to-right, centre-out, random-seeded, by size). Vary the stagger direction between shots.
5) SECONDARY MOTION. Every hero element has a small supporting motion: slight rotation drift, scale breathing (1.00-1.02), parallax, glow pulse, line draw, particle-free sparkle.
6) DEPTH. At least 3 depth layers per shot (background / mid / foreground). Layers move at different speeds (parallax 0.3x / 1x / 1.6x). Add shadow, blur, or scale difference to separate depth. Use fake or real 3D camera moves (dolly, push-in, slow orbit, rack focus).
7) MOTION BLUR. Fast moves get directional motion blur (render with sub-frame sampling, e.g. 4-8 samples, or fake it with blur + stretch scale). Very slow moves need none.
8) TRIM PATHS + MASKS + TRACK MATTES. Prefer lines that DRAW ON, text revealed through masks/mattes, shapes that wipe/morph, instead of plain opacity fades.
9) ANIMATION CURVE VARIETY. In one shot, never use the same easing on every property. Position, scale, rotation and opacity should each have their own timing.
10) HOLD + BURST RHYTHM. Alternate fast bursts (6-12 frames) with calm holds (12-30 frames). Cuts and hits land on the beat of the music. Something new happens every 1.5-3.5 seconds.
11) LIGHT + TEXTURE LAST. Add bloom/glow on accent only, subtle film grain (seeded), soft vignette, optional chromatic aberration on fast moves, light leak or lens streak ONCE at the climax. Never glow on every element.
12) TYPE IS ANIMATED DESIGN. Kerning/tracking animates (wide -> tight), baseline shifts, per-letter/per-word/per-line reveals, size contrast (huge vs tiny), outline <-> fill transitions. Max 2 font families.
13) TRANSITIONS SHOW BOTH SCENES. A transition is old + new image on screen at once (whip, push, shape wipe, match cut, zoom through, mask reveal). Never an empty frame or a lazy crossfade between scenes. Cut's first frame already shows the new image.
14) NEGATIVE SPACE + HIERARCHY. One focal point per frame. Every word to be read stays on screen long enough (about 0.3s per word minimum, 1.2s minimum per line) and stays readable at phone size.

############ 2. ANTI-REPEAT ENGINE (this is the key) ############
A) PRINT the VARIATION SEED first. All "random" choices below must derive from it: pick item number = ((SEED x 7) + (shot_number x 13) + (category_number x 5)) mod (size of list) + 1. Show the maths in the ledger so I can check it. A different seed MUST give a different video.
B) NEVER reuse an item listed in [PREVIOUS USED-LISTS]. If a pick collides, move to the next number in the list.
C) INSIDE ONE VIDEO: no entrance, exit, transition, text effect or camera move may be used twice. Max 1 repeat of a layout archetype.
D) ROLL ONE "SIGNATURE MOVE" (L9) and ONE "CONSTRAINT" (L10) for the whole video. The video must visibly be built around them.
E) Before building, SELF-CHECK: "Would this look like a template or like my last video?" If yes, change the 3 weakest choices.
F) At the end, print a USED-LIST block (format in section 7) so I can save it.

----- LIBRARIES (pick by the formula; you may also invent equivalents of the same quality) -----

L1 ENTRANCES (20): 1 mask-slide-up per line | 2 letter-by-letter rise with blur | 3 scale-from-0 with elastic overshoot | 4 line draws then fills (trim path) | 5 split-reveal (two halves open) | 6 rotate-in from 3D (rotateX 70 -> 0) | 7 typewriter + cursor | 8 slide + stretch (squash on arrival) | 9 clip-path circle expand | 10 blinds/venetian reveal | 11 glitch-assemble (slices snap together) | 12 scatter-to-order (pieces fly into place) | 13 drop-and-bounce with ground shadow | 14 fold-out (origami) | 15 liquid/blob morph into shape | 16 zoom-through from tiny | 17 scan-line reveal (bright bar sweeps) | 18 pop-in with ring ripple | 19 whip-pan arrival with motion blur | 20 outline-draw then fill-wipe

L2 EXITS (12): 1 mask-slide-down | 2 shrink-to-point | 3 shatter into pieces | 4 whip-out with blur | 5 un-draw (reverse trim) | 6 fold-away | 7 squash and drop | 8 dissolve into scan-lines | 9 rotate-away 3D | 10 pull into next element (match cut) | 11 letter-by-letter fall | 12 wipe-through by a colour block

L3 TRANSITIONS BETWEEN SCENES (20): 1 whip pan | 2 shape wipe (circle/square/diagonal) | 3 colour-block push (full colour slab slides through) | 4 zoom-through into a letter/hole | 5 match cut (same shape continues as next object) | 6 split screen slide | 7 glitch cut (2-4 frames) | 8 page-curl / fold | 9 liquid wipe | 10 object-mask reveal (text as window to next scene) | 11 slide + parallax layers at different speeds | 12 radial spin wipe | 13 pixel/mosaic dissolve | 14 camera push through a frame/portal | 15 rack-focus blur swap | 16 stripe/blinds swap | 17 3D cube rotate | 18 ink/paint bleed | 19 light-streak sweep (only once in the video) | 20 hard cut on beat with scale punch

L4 TEXT EFFECTS (16): 1 kinetic stack (lines of different sizes lock together) | 2 tracking expand -> tighten | 3 outline-to-fill sweep | 4 per-word pop with tiny rotation | 5 scrambling characters resolve to the real word | 6 text on a path / circle | 7 huge word cropped by frame, slides to reveal | 8 mask text over moving video-like shapes | 9 strike-through / underline draw | 10 variable-weight morph (thin -> black) | 11 split letters (top half / bottom half slide) | 12 3D extruded text with slow orbit | 13 highlight bar wipes behind word | 14 counter/odometer numbers | 15 marquee / ticker line | 16 echo/trail duplicates that peel away

L5 BACKGROUND SYSTEMS (14): 1 thin grid with slow parallax | 2 perspective floor grid | 3 gradient mesh slowly morphing | 4 concentric rings pulsing on beat | 5 halftone dots / dot matrix | 6 diagonal stripes drifting | 7 noise field / flow lines | 8 topographic contour lines | 9 big blurred colour blobs (soft light) | 10 blueprint/technical drawing marks | 11 paper/grain texture with subtle shadows | 12 starfield + depth dust | 13 pixel/voxel blocks | 14 solid colour with huge outline typography as texture

L6 CAMERA MOVES (10): 1 slow push-in | 2 pull-out reveal | 3 lateral dolly with parallax | 4 slow orbit around a 3D object | 5 handheld micro-shake (seeded) | 6 whip tilt | 7 rack focus | 8 spiral zoom | 9 crane up/down | 10 locked-off with elements doing all the moving

L7 LAYOUT ARCHETYPES (10): 1 centred hero + orbiting details | 2 left-heavy asymmetric with big negative space | 3 diagonal composition | 4 split screen (two zones) | 5 grid/bento of cards | 6 giant cropped type as the image | 7 timeline/horizontal scroller | 8 stacked rows (list animation) | 9 radial/orbit layout | 10 poster style with tiny details in corners

L8 PALETTE + TYPE MOODS (10, use only if I did not give brand colours; ONE accent colour max, plus neutrals):
1 black + electric orange | 2 off-white paper + ink black + red | 3 deep navy + acid lime | 4 charcoal + hot magenta | 5 cream + forest green + gold | 6 black + ice blue | 7 warm beige + terracotta | 8 deep purple + peach | 9 white + cobalt blue | 10 graphite + signal yellow
Type pairings (2 families only): a) wide black grotesk + mono | b) condensed bold sans + serif italic | c) geometric sans + handwritten accent | d) editorial serif + clean sans | e) rounded bold + mono | f) heavy slab + light grotesk

L9 SIGNATURE MOVES (12) (the one big idea of this video): 1 everything lives on a rotating 3D carousel | 2 one continuous camera flight through all scenes | 3 a single line that draws and becomes every object | 4 colour-block slabs that sweep and reveal each scene | 5 a "window/portal" that opens into the next scene | 6 elements built from one repeating shape (circles/squares/triangles) | 7 split-flap / odometer mechanical motion | 8 liquid morphing between all icons | 9 UI/code panels floating in 3D space | 10 giant typography as the set (we move through letters) | 11 film-strip / timeline metaphor | 12 paper-cut layered depth (stacked sheets with shadows)

L10 CONSTRAINTS (10) (forces uniqueness): 1 only 2 colours + white | 2 no opacity fades at all | 3 every scene starts from a different screen edge | 4 all motion is on a 12-frame grid (stepped, "on twos" feel) for one act | 5 only straight lines and circles | 6 text never horizontal in two scenes | 7 every transition is a match cut | 8 one scene must be fully silent (no music, only SFX) | 9 camera never stops moving | 10 each scene uses a different background system (L5)

############ 3. SHOT DESIGN RULES ############
- Structure: Hook (0-3s, must grab) -> Context -> Turn/Surprise -> Proof/Demo -> Hit (climax moment, one big flash/impact) -> Payoff/CTA. Adjust to my topic.
- Script: max 7 words per on-screen line, one idea per beat, strong verbs. Hinglish is allowed and natural if I picked it.
- Map every shot to a beat grid (choose BPM 100-128; frames per beat = 1800/BPM at 30 fps). Scene lengths = whole beats.
- Each shot row: [time | beat | text | layout (L7) | background (L5) | entrance (L1) | secondary motion | camera (L6) | transition out (L3) | sound hit].
- Full-screen flash / colour slab: max 2 per video.
- Never invent real product UI or screenshots. Build UI from code shapes unless I supply assets.

############ 4. SOUND ############
- Synthesize music in code (no copyrighted tracks): kick on beat, soft pad/bass, riser before the hit, impact on the hit, tiny whooshes on transitions, UI ticks on text. Master about -14 LUFS, true peak under -1 dB. Different seed = different key, tempo, and rhythm pattern. Or use my track if I give one and cut to its beats.

############ 5. TECH RULES (for output methods A/B) ############
- The film is a PURE FUNCTION OF TIME/FRAME: frame number in -> image out. No CSS transitions, no setTimeout, no requestAnimationFrame logic, no state between frames, no Math.random (use a seeded generator such as mulberry32(SEED)).
- All fonts bundled locally (woff2) and loaded before rendering. No external URLs at render time.
- Organise files: lib (constants, easing, springs, seeded random), ui (reusable components), scenes split across several files, captions/cues, main composition, audio script. Deliver FULL files, one at a time, with a short change summary after each. If editing existing code, ask me for the current file first and NEVER delete existing code when adding features.
- Render to MP4 H.264, yuv420p, 30 fps, +faststart, audio muxed. If the normal toolchain is not available, say so and use a fallback (headless Chromium frame capture + ffmpeg). Verify with ffprobe and a contact sheet. Check phone readability.
- For method C (After Effects): output ExtendScript (.jsx) that builds comps, shape layers, text animators, easing via keyframe ease objects, and expressions (wiggle, loopOut, ease(), linear()) per shot. For method D: output only the shot list + exact timings, curves, hex codes, font names.

############ 6. WORKFLOW (strict order) ############
STEP 1: Print the SEED and the VARIATION LEDGER: for every category (L1-L10) show the number picked, its name, and the formula result. Show what you skipped because it was in [PREVIOUS USED-LISTS].
STEP 2: Print the SHOT LIST table (section 3). Also a 3-line "creative concept": signature move + constraint + why they fit the topic.
STEP 3: STOP. Wait for my OK. (If I say "go", continue.)
STEP 4: Build. Full files, one at a time, change summary each time.
STEP 5: Self-critique at phone size. Score 1-10 for: hook, readability, motion polish (does it feel like AE per section 1?), variety, sound sync, originality vs previous videos. Fix the 3 worst problems. Repeat until all scores are 8+ (minimum 2 rounds).
STEP 6: Deliver the MP4 / files + the USED-LIST (section 7) + one line on what you would improve next.

############ 7. USED-LIST FORMAT (print at the end) ############
USED-LIST | seed [..] | topic [..]
L1 entrances: [numbers] | L2 exits: [numbers] | L3 transitions: [numbers] | L4 text: [numbers]
L5 backgrounds: [numbers] | L6 camera: [numbers] | L7 layouts: [numbers] | L8 palette/type: [number+letter]
L9 signature: [number] | L10 constraint: [number] | BPM/key: [..]
````

---

## PART B: Quick Version (chhota, jab jaldi ho)

````text
Act as a senior After Effects motion designer + creative coder. Make a [DURATION]s [CANVAS] 30fps motion-graphics video about: [TOPIC]. Tone: [TONE]. Language: [English/Hinglish].

AE feel: never linear easing (expo-out in, snappy ease-in out), anticipation + overshoot + settle, overlapping/staggered motion, secondary motion on every hero, 3 depth layers with parallax, motion blur on fast moves, trim-path line draws and mask/matte reveals instead of fades, one accent colour, bloom only on accent, seeded grain, transitions that show old+new scene together, cuts on a beat grid, something new every 1.5-3.5s.

Anti-repeat: use SEED [number]. Derive every creative choice (entrances, exits, transitions, text effects, backgrounds, camera, layout, palette, one signature move, one constraint) from the seed, never repeat a move within the video, and avoid everything in this list: [PREVIOUS USED-LISTS / none]. Print a ledger of choices first, then a shot list, then wait for my OK. After building, print a USED-LIST I can reuse.

Tech: pure function of frame, no Math.random (seeded only), local fonts, synthesized music, full files one at a time with change summary, verify the MP4 with ffprobe + contact sheet.
````

---

## PART C: Variation tricks (prompt ke bahar ki cheezein)

| Trick | Kaise |
|---|---|
| **Naya seed har baar** | 4-digit number badlo. Ye sabse aasan hai |
| **Used-List jama karo** | Har video ke baad AI ka diya USED-LIST ek note me save karo, agli baar paste karo |
| **Alag AI = alag nazar** | Same prompt Claude + Gemini dono me chalao, shot list compare karke best mix lo |
| **Reference upload** | Koi video/frames upload karke bolo: "motion aur composition yahan se lo, par L1-L10 ke picks naye rakho" |
| **Tone badlo** | cinematic / playful / editorial / raw. Tone badalte hi layout aur type pairing badal jaati hai |
| **Constraint khud do** | "Is baar sirf circles aur lines" jaisa constraint L10 me add karo |
| **Library khud badhao** | L1-L10 me apne favourite effects add karo (numbers aage badhao). Jitni badi list, utni zyada variety |

## PART D: Agar AI "AE feel" na de paye to ye correction prompts

- **Motion robotic lag raha hai:** "Section 1 rules 1-3 fail ho rahe hain. Har move me anticipation, overshoot aur settle add karo, aur linear easing hata do."
- **Sab ek saath aa raha hai:** "Stagger aur overlapping action add karo (2-5 frame offsets), aur har property ko alag timing do."
- **Flat lag raha hai:** "Har shot me 3 depth layers aur parallax add karo, plus ek slow camera move."
- **Template jaisa lag raha hai:** "Fade-ins hata do. Trim-path draws, mask reveals aur match-cut transitions use karo."
- **Pichle video jaisa lag raha hai:** "Naya seed [number] lo aur L1, L3, L9 ke picks dobara roll karo. Pichla USED-LIST ye hai: [paste]."
- **Text padhne me mushkil:** "Har line ko kam se kam 1.2s screen par rakho aur phone size par check karo."
