# AI Motion Showreel: kaise banaya, kya kiya, kya NAHI kiya

Ye guide kisi bhi AI (Gemini, GPT, Claude, Cursor) ko deni hai taaki wo same style ka video bana sake. Isme exact formulas, timings aur code patterns hain.

**Pehle ek honest baat:** maine ye video render karke dekha nahi. Mere sandbox me Chrome download nahi hota tha. Code TypeScript check se pass hua hai, lekin visual quality "design ke hisaab se achhi hone ki ummeed" hai, "verified achhi" nahi. Neeche jahan "kyu achha hai" likha hai, wo design ke reasons hain, result ki guarantee nahi. Pehle GitHub Actions ka `stills` mode chalakar frames dekho.

---

## 1. Spec (fixed)

| Cheez | Value |
|---|---|
| Size | 1080 x 1920 (vertical, reels) |
| FPS | 30 |
| Length | 1638 frames = 54.596 s (SRT ke last timestamp se) |
| Tech | Remotion 4.0.528, React 18, TypeScript |
| Tempo | 120 BPM, 1 beat = 0.5 s = **15 frames** |
| Scene | 5 s = **150 frames = 10 beats**, 11 scenes (last 138 frames) |
| Fonts | Inter (text), JetBrains Mono (code/labels), `@remotion/google-fonts` se |
| Colors | bg `#0A0A0D`, card `#16161C`, ink (cream) `#F4F1EA`, orange `#FF5B1F`, blue `#3D5BFF`. Bas 2 accent + black/white |

Scene length SRT cue length se match karti hai. Har cue 5 s ka hai, to har scene ek caption ke saath badalti hai.

---

## 2. Sabse bada rule: har cheez frame ka pure function hai

Remotion me animation = `useCurrentFrame()` se value nikalo. Ye **nahi** use karna:

- CSS `transition` / `animation`
- `setTimeout`, `setInterval`
- `useState` jo frame ke saath badle
- Math.random() (har render me alag aayega). Randomness chahiye to `((i*7 + j*13) % 17) / 17` jaisa deterministic formula

Kyu: render me har frame alag process me banta hai. Agar kuch "pichle frame" par depend hua to video toota hua aayega.

### Helper functions (lib.ts)

```ts
// 0..1 progress, clamp, easing ke saath
prog(f, a, b, easing = bezier(0.16,1,0.3,1))
  = interpolate(f, [a,b], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp', easing})

// spring step response: frame `delay` se shuru, 0 se 1 jaata hai (halka overshoot)
sp(f, delay=0, damping=18, stiffness=140)
  = spring({frame: Math.max(0, f - delay), fps:30, config:{damping, stiffness, mass:0.9}})

beatPulse(f) = Math.exp(-(f % 15) / 4)   // har beat par 1 se girta hua
```

- **Entrance easing:** `bezier(0.16, 1, 0.3, 1)` (expo-out jaisa, tez shuru, narm ruk).
- **Move easing:** `bezier(0.65, 0, 0.35, 1)` (ease-in-out).
- **Spring:** damping 18-20, stiffness 130-150, mass 0.9. Isse damping ratio ~0.85 aata hai, yaani sirf ~1% overshoot. **Bouncy nahi.** Bouncy easing se video cheap/template lagta hai.

---

## 3. Core idea: "One Shape, Never Cut"

Poore video me ek hi orange dot hai jo morph hota rehta hai (size, radius, color, position). Scenes uske **upar** apna content rakhti hain. Isse cuts nahi lagte, har scene pichli se "nikalti" hai.

### Hero morph: sum-of-springs (sabse important trick)

Hero ki state ek keyframe list se aati hai. Har key = "is frame par naya target shuru karo".

```ts
const KEYS = [
  K(0,    0,0,  36,36,   18, ORANGE),   // dot
  K(14,   0,0, 860,484,  44, CARD),     // video card
  K(150,  0,0, 760,760, 120, ORANGE),   // FREE card
  K(300,  0,0, 900,720,  48, CARD),     // chat/code window
  K(450,-225,-225, 420,420,56, CARD),   // tile 1 of 4
  K(600,  0,0, 920,780,  40, '#0F0F14'),// terminal
  K(750,  0,0, 940,640,  36, CARD),     // timeline panel
  K(900,  0,285,780,160, 80, ORANGE),   // equation row 4
  K(1050, 0,0, 640,330, 165, CARD2),    // toggle track
  K(1110, 0,0, 640,330, 165, ORANGE),   // toggle flips color
  K(1200, 0,0, 700,500,  48, BLUE),
  K(1260, 0,20,1200,1280,64, BLUE),     // breaks out of the box
  K(1350, 0,0, 300,300, 150, ORANGE),   // circle
  K(1380, 0,0, 300,300,  70, ORANGE),
  K(1405, 0,0, 300,300,  14, ORANGE),   // square = cube front face
  K(1500, 0,0,  36,36,   18, ORANGE),   // back to dot
];

value(f) = key0 + Σ_i  sp(f, key_i.at) * (key_i - key_{i-1})
```

Ye formula har property (x, y, w, h, radius, rotation, R, G, B) par lagta hai. Fayde:

- Key beech me aaye to bhi smooth, kyunki springs ek doosre par **jod** hote hain (superposition).
- Koi state yaad nahi rakhni, seedha `f` se value. Isliye render-safe.
- Naya morph = list me ek line.

Color bhi RGB array ki tarah isi tarah interpolate hota hai (0-255 clamp karke).

Hero par sirf ek subtle beat pulse hai: `scale = 1 + 0.012 * beatPulse(f)`, sirf jab width > 100 (dot par nahi, taaki loop frame match rahe).

---

## 4. Content swap: blur ke saath, overlap nahi

Scene ka content `Phase` component me hota hai:

- Enter: pehle 12 frame me opacity 0 se 1, blur 10px se 0, 26px neeche se upar.
- Exit: aakhri 10 frame me ulta (opacity 1 se 0, blur, thoda upar).
- Isse hero morph ho rahi hoti hai aur content ek chhota blur-swap leta hai. Do scene ka text kabhi ek saath overlap nahi hota.

Hero morph spring ko settle hone me ~25-30 frame lagte hain. Isliye Phase ka `from={6}` rakha hai, content shape ke aane ke saath uthta hai.

---

## 5. Kinetic text (Kin component)

Har letter alag span me, **mask** ke andar (`overflow:hidden`) rise hota hai:

```
letter i:  p = sp(f, delay + i*stagger, 17, 130)
           translateY = (1-p) * 115%       // neeche se utha
           rotate     = (1-p) * 7deg       // halka tilt
           blur       = |y|/18 px (max 6)  // motion blur jaisa
exit:      o = prog(f, out + i*stagger, +10)  -> translateY -= o*115%
```

- Stagger 1.5 se 3 frame (lambe text me kam, bade words me zyada).
- Padding-bottom `0.12em` + negative margin taaki descender clip na ho.
- Strike-through: ek orange `div` jiski `width = prog(...)*100%`, text ke upar. Phir text ki opacity 0.35 par.

---

## 6. Scene by scene recipe (local frame, har scene 0-149)

| # | Time | Caption ka matlab | Kya hota hai |
|---|---|---|---|
| 1 | 0-5s | AI sirf answers nahi, video bhi | dot, video card ban jaata hai. "AI = ANSWERS" par orange strike draw hoti hai. Play button dabta hai, andar circle square me morph (`radius 48 to 12`, rotate 200deg), ring har beat pulse karta hai, blue bar wipe, timeline playhead. Neeche "MOTION VIDEO" |
| 2 | 5-10s | FREE plan | Orange card. "₹999 to ₹0" count (`prog` 22-74 easeIO), `tabular-nums` taaki digits hilein nahi. Check mark stroke se draw hota hai |
| 3 | 10-15s | Idea Claude ko diya | Prompt letter-by-letter type, send button pulse, phir 4 code lines syntax colors ke saath type hoti hain (`Typed` component, cps 1.7) |
| 4 | 15-20s | Kinetic type, graphics, transitions, SFX | Hero tile 1 ban jaata hai, baaki 3 tiles hero ki jagah se spring karke nikalte hain. Har tile ki alag live animation (letter wave, orbit shapes, wipe bars, waveform). Har 25 frame me ek tile highlight |
| 5 | 20-25s | Ye sab code se possible | Terminal: `npx remotion render` type, frame counter 0 to 1638, progress bar, bada % number, 5 film-strip thumbnails, last me "out/video.mp4" check |
| 6 | 25-30s | After Effects nahi | After Effects jaisa dense keyframe timeline (7 rows x 6 diamonds). Diagonal orange strike draw. Diamonds strike ke baad ek-ek karke scale 0. "ZERO KEYFRAMES" |
| 7 | 30-35s | Idea + Sonnet + code + render | 4 pills, har ek beat par (frame 15/45/75/105) hero wali pill se nikalti hai. Icons har beat pulse. Last par "= ?" se "= VIDEO" aur expanding ring |
| 8 | 35-40s | Free plan, paid nahi | Toggle. Knob ke **do edges alag spring par**: left edge slow (stiffness 85), right edge fast (stiffness 230). Isse knob flip karte waqt stretch hota hai (liquid feel). Track orange ho jaata hai, check draw |
| 9 | 40-45s | AI sirf content tak limited nahi | Dashed "LIMIT" box, hero uske andar. Frame 54 par hero box tod ke poori screen le leta hai, dashed box scale up hokar gayab. Words ticker: VIDEO, MOTION, SOUND, CODE, IDEAS (har word 15 frame = 1 beat) |
| 10 | 45-50s | Ideas ko animation me badalna | 3 orbiters spiral andar. Square cube ka front face ban jaata hai (2D to 3D), 720deg ghoomta hai (expo-out se ruk-ta hai) |
| 11 | 50-54.6s | Tum kya create karoge? | Cube wapas dot me. "TUM AI SE / KYA CREATE / KAROGE?" kinetic, phir sab bahar, sirf dot |

### 2D to 3D cube: seamless swap

- Hero 300x300, radius 14, orange, pe pahunchta hai (frame 1405).
- Frame 1425 par hero **hide**, cube **show**. Cube ka front face bhi 300x300, radius 14, wahi orange, `rotate = 0`. Isliye swap dikhta nahi.
- Cube: 6 faces `position:absolute`, transform `rotateY(90deg) translateZ(150px)` etc, parent `transform-style: preserve-3d`, `perspective: 1500`.
- Rotation: `rotY = 720 * cp`, `rotX = 30 * sin(pi*cp)`, `scale = 1 + 0.3*sin(pi*cp)`. `cp` expo-out hai, aur end par rotX = 0, rotY = 720 (= 0), to rukte waqt front face wapas seedha. Frame 1495 par hero wapas aa jaata hai.

---

## 7. Camera aur background

- **Camera:** poore stage par `scale = 1 + 0.035 * sin(pi * frame / 1638)`, origin hero ke center par. Dheere zoom-in phir zoom-out, 0 par start aur end (loop safe).
- **Background:** dot-grid (`radial-gradient`, 60px) jo `50 * sin(pi*f/1638)` px drift karta hai, plus halka vignette.
- **Scene hit line:** har scene change par 3px orange line upar se neeche 14 frame me. Ye audio ke "boom" ke saath sync hai.
- `will-change` kahin nahi lagaya (scale ke saath text blurry ho jaata hai).

---

## 8. Captions (SRT se)

- 11 cues ka array `[startSec, endSec, text]`. Emoji hata diye (render machine par emoji font nahi bhi ho sakta).
- Har word ka apna spring: `t0 = start + 4 + i * (duration*0.82 / wordCount)`.
- Naya word 14 frame orange, phir cream. Hidden words `visibility:hidden` hain taaki line breaks jump na karein.
- Cue ke last 7 frame me fade-out. Last cue video ke aakhri 12 frame me fade, taaki last frame me caption na ho.
- Safe area: caption `top:1440`, hero/visuals ~y 135-1280 me. Font 48px (phone par padhne layak).

---

## 9. Loop: last frame = first frame

Frame 0: sirf orange dot, koi caption nahi, `cam = 1`, `drift = 0`.
Last frame: same. Isliye:
- Hero aakhri key par dot.
- Camera/drift `sin(pi*f/TOTAL)` se 0 par wapas.
- End title ke saare letters frame 138 se pehle bahar (`out = 94`). Ye ek bug tha jo maine baad me theek kiya (pehle `out=108`, aakhri letters 138 tak nahi nikalte the).
- Caption last frames me fade.

---

## 10. Sound (code se, koi download nahi)

`scripts/gen-audio.mjs` pure Node me WAV banata hai (44.1 kHz, mono):

| Layer | Kab | Kaise |
|---|---|---|
| Kick | har beat, t >= 1s | sine, pitch `46 + 120*exp(-30t)` Hz, decay `exp(-8t)` |
| Hat | off-beat, t >= 2.5s | noise ka high-pass (n - prev), decay `exp(-90t)` |
| Clap | beat 2 aur 4, t >= 5s | low-passed noise + double envelope |
| Bass | off-beat, t >= 5s | sine 55/55/65.4/49 Hz, har 8 beat chord change |
| Pluck | t >= 10s | A-minor pentatonic triangle wave, 8th notes |
| Boom | har 5s (scene change) | sine 55 Hz sweep down + noise burst |
| Riser | 28-30s aur 47.5-50s | sine sweep 200 to 2000 Hz + noise, `k^2` volume |

End me 0.8 s fade, peak 0.9 par normalize. Audio ki timing seedha seconds se hai (120 BPM), isliye video ki beat-grid se matched hai.

---

## 11. Kya KIYA (ye sab design choices hain)

- Ek hi shape morph, cuts nahi.
- Sab kuch frame ka pure function.
- Spring/expo easing, bouncy nahi, sirf ~1% overshoot.
- Beat par kuch na kuch: icons pulse, ticker words, equation pills, scene hit.
- Palette sirf 2 accent + black/white. Ek typeface family + ek mono.
- Shapes, 3D cube, UI (toggle, terminal, timeline), kinetic type, data count, sab milakar range.
- Har tile/animation ke piche real math: sine wave, orbit (`cos/sin`), wipe (`prog`), waveform.
- Soundtrack khud generate.

## 12. Kya NAHI kiya (honest list)

- **Render karke dekha nahi.** Spacing ya timing me galti ho sakti hai.
- **Beat detection nahi chalayi.** Ye 120 BPM maan ke chalta hai (kyunki music khud code se bana hai, to exact match hai). Agar user apna gaana laaye to numpy/librosa se beat grid nikalni padegi.
- **Real motion blur nahi.** Sirf CSS `filter: blur` letters aur phase swap par. Remotion ka `@remotion/motion-blur` ya subframe-blend (tmix) nahi use kiya.
- **UI sounds (click, typing) per-event nahi.** Audio generic beat-based hai, har on-screen event ke peak par placed nahi.
- **Cursor/drag interaction nahi.** Pehle prompt wale "cursor se click aur drag" style ka UI morph nahi banaya. Toggle ek spring se flip hota hai, cursor nahi dikhta.
- **Images, Lottie, video clips, Spline/Three.js nahi.** Sab CSS/SVG shapes. 3D sirf CSS cube.
- **Particles, glow, lens flare, RGB split, shake nahi.** Jaan-boojh ke.
- **Emoji nahi.**
- **Remotion Studio me live test nahi.**
- **Font Geist nahi, Inter use kiya** (Remotion google-fonts me pakka milta hai).

---

## 13. Kyu ye design achha banna chahiye

1. **Continuity.** Ek shape ka hamesha screen par rehna eye ko track karne deta hai. Cuts se "slideshow" feel aata hai, morph se "designed" feel.
2. **Har beat par kuch.** Dead time nahi, isliye reels style me retention.
3. **Closed-form motion.** Spring aur expo-out se motion natural lagta hai, linear/bouncy se nahi.
4. **Limited palette + type.** Pro motion design me restraint hi "template nahi" feel deta hai.
5. **Safe layout.** Vertical me top ~135px aur bottom caption zone chhoda, phone par text padhne layak (48px+ captions, 80-230px titles).
6. **Loop.** Reels par auto-replay seamless.

Lekin: ye sab **design reasons** hain. Asli quality tabhi pata chalegi jab frames dekhoge.

---

## 14. Dusre AI ko dene ke liye prompt (copy-paste)

```
Tumhe Remotion 4 (React + TypeScript) me 1080x1920, 30fps, 1638 frames ka vertical motion-graphics video banana hai.

Rules:
1. Har cheez useCurrentFrame() ka pure function. CSS transition/animation, setTimeout, Math.random, useState-over-time BAN.
2. Easing: entrance bezier(0.16,1,0.3,1), move bezier(0.65,0,0.35,1). Spring damping 18-20, stiffness 130-150, mass 0.9 (halka overshoot, bouncy nahi).
3. EK persistent "hero" shape poore video me. State = key0 + sum_i spring(f - key_i.at) * (key_i - key_{i-1}) har property par (x,y,w,h,radius,rotation,r,g,b). Scenes uske upar content rakhein. Koi hard cut nahi.
4. Scene content ek Phase wrapper me: 12 frame blur+fade+slide enter, aakhri 10 frame exit.
5. Text: letter-by-letter masked rise (overflow hidden, translateY 115% to 0, spring per letter, stagger 2 frames, halka rotate+blur).
6. 120 BPM = 15 frame/beat. Har 150 frame ek scene (10 beats). Har beat par kuch hona chahiye (pulse, tick, naya element).
7. Palette: bg #0A0A0D, card #16161C, cream #F4F1EA, orange #FF5B1F, blue #3D5BFF. Font Inter + JetBrains Mono.
8. Pehla aur aakhri frame identical (sirf orange dot, caption nahi, camera scale 1) taaki loop ho. Camera = 1 + 0.035*sin(pi*f/TOTAL).
9. Banned: particles, glow, lens flare, RGB split, camera shake, bouncy easing, crossfade, stock sounds.
10. Captions SRT se, word-by-word spring reveal, 48px, top:1440 (safe area).
11. 3D moment: hero square (300px, radius 14) ke baad CSS 3D cube (preserve-3d) jiska front face hero se pixel-identical ho, swap seamless.
12. Sound: Node script se WAV (kick sine sweep, noise hats, clap, bass, pluck, boom per scene, riser).

Scenes: (1) video card + shapes (2) FREE count 999 to 0 (3) chat prompt type + code type (4) 2x2 tiles live animations (5) terminal render progress (6) After Effects keyframe timeline struck out (7) IDEA+SONNET+CODE=VIDEO pills on beats (8) toggle with two-spring liquid knob (9) dashed limit box broken, word ticker (10) shapes to 3D cube (11) end title + collapse to dot.

Pehle storyboard dikhao, phir code do. Render ke baad har scene ka midpoint frame dekho aur clipping/overlap theek karo.
```

---

## 15. Files ka map

```
showreel/
  package.json          dependencies (Remotion 4.0.528 exact)
  remotion.config.ts
  scripts/gen-audio.mjs soundtrack generator
  public/music.wav      generated audio
  src/index.ts          registerRoot
  src/Root.tsx          Composition 1080x1920, 30fps, 1638
  src/lib.ts            colors, fonts, prog(), sp(), beatPulse()
  src/ui.tsx            Phase, At, box, Kin, Check, Typed
  src/Video.tsx         hero KEYS + camera + background + sweeps + audio
  src/Captions.tsx      11 SRT cues, word reveal
  src/Scenes1.tsx       scenes 1-4
  src/Scenes2.tsx       scenes 5-8
  src/Scenes3.tsx       scenes 9-11 (cube yahin hai)
```

Kuch badalna ho: caption text `Captions.tsx` me, timing/colors `lib.ts` me, morph points `Video.tsx` ke `KEYS` me.
