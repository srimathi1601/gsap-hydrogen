# Skill: PDP Section Builder — Pixel Perfect + GSAP

<!--
  Loaded by CLAUDE.md via @guides/skills/pdp-builder.md
  Every rule here is enforced on every task. Never skip a step.
-->

---

## WHICH APPROACH?

| Situation | Use |
|-----------|-----|
| prototype/ folder exists with index.html | Approach A |
| Only Figma links given, no prototype | Approach B |
| Both exist | Approach A first, Figma as pixel-check only |

---

## APPROACH A — Prototype-to-React

Use this when a working prototype/ folder exists in the project.
Do NOT build from Figma. Do NOT rewrite anything.
Zero changes to HTML, CSS, JS, animations.
Exact copy — prototype must look identical in browser.

### A1. Copy assets to public/

```
prototype/img/           → public/img/
prototype/fig/           → public/fig/
prototype/fonts/         → public/fonts/
prototype/js/sections.js → public/js/sections.js
prototype/js/engine.js   → public/js/engine.js
prototype/js/app.js      → public/js/app.js
prototype/js/lenis.min.js → public/js/lenis.min.js
```

Keep exact same folder names and filenames. Do not rename anything.

### A2. Copy CSS into app styles

Append prototype/css/site.css and prototype/css/mobile.css
into app/styles/app.css.
Do not overwrite. Do not convert to CSS Modules.

### A3. Fix asset paths in public/js/app.js

Replace all relative paths:
```
img/  →  /img/
fig/  →  /fig/
fonts/ → /fonts/
```

### A4. Create one single component

File: app/sections/PrototypePage/index.jsx

```jsx
import { useEffect } from 'react'

// Full body HTML copied exactly from prototype/index.html
// Extract everything between <body> and </body>
const HTML = `PASTE_FULL_BODY_HTML_HERE`

export function PrototypePage() {
  useEffect(() => {
    // Load scripts in exact order — each waits for previous
    const load = (src) => new Promise((res) => {
      const s = document.createElement('script')
      s.src = src
      s.onload = res
      document.body.appendChild(s)
    })

    load('/js/lenis.min.js')
      .then(() => load('/js/sections.js'))
      .then(() => load('/js/engine.js'))
      .then(() => load('/js/app.js'))
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />
}
```

### A5. Mount in route

In app/routes/($locale)._index.jsx:
- Remove all existing section imports
- Import only PrototypePage
- Return only `<PrototypePage />`

```jsx
import { PrototypePage } from '~/sections/PrototypePage'

export default function Index() {
  return <PrototypePage />
}
```

### A6. Verify

```
npm run build → must pass
Open browser → must look identical to prototype/index.html
```

### A7. Rules for Approach A

- Zero changes to HTML structure
- Zero semantic conversion
- Zero CSS Modules
- Zero animation rewrites
- Do not rename any assets
- Do not add or remove any elements
- If something looks wrong in browser → fix paths or script order only

---

## APPROACH B — Figma-to-React

Use this when NO prototype exists. Only Figma links given.

---

## 1. ROLE

Build a full Shopify Hydrogen PDP page:
- Pixel-perfect match to Figma — every px, color, font, spacing exact
- Extract real images and videos from Figma — no placeholders unless truly missing
- GSAP scroll animations — forward AND backward, smooth, matching reference site exactly
- Mobile responsive — every section has a mobile layout
- Flow: Analyse → React component → place in correct files

---

## 2. INPUTS REQUIRED

| Input | Format | Required |
|-------|--------|----------|
| Figma desktop frame | URL + node-id | ✅ |
| Figma mobile frame | URL + node-id | ✅ |
| Reference site/prototype | URL | ✅ |
| Animation timeline | Written notes (if video) | ✅ if video |

> Never open the full Figma page — only the given node-ids.
> Never guess an animation. Every animation needs a SOURCE.

---

## 3. FLOW — NEVER SKIP

```
STEP 1 — ANALYSE      no code. Extract everything from Figma. List questions. STOP.
STEP 2 — REACT        build React component directly. Place in correct files.
STEP 3 — REPORT       built / missing / animation status. STOP.
STEP 4 — REVISE       change only what I ask. Repeat STEP 3.
```

If session stops → read PROGRESS.md → continue from last unfinished section.
Never start over.

---

## 4. STEP 1 — ANALYSE (no code, no files)

### 4a. Figma Extraction — Every Section

Use Figma MCP to read ONLY the given node-ids.
For every section extract and write:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION [N]: <name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE: static | carousel | tabs | accordion | scroll-animation | video

── DESKTOP LAYOUT ──
  Container width:    <px>
  Container height:   <px or auto>
  Padding:            top <px>  right <px>  bottom <px>  left <px>
  Margin:             top <px>  bottom <px>
  Gap / spacing:      <px>
  Layout:             flex-row | flex-col | grid (<cols>)
  Alignment:          items-<value>  justify-<value>
  Background:         <hex> | image | video

── MOBILE LAYOUT ──
  Container width:    100%
  Padding:            top <px>  right <px>  bottom <px>  left <px>
  Layout:             <how it changes from desktop>
  Stack order:        <if columns collapse>

── TYPOGRAPHY ──
  Element         Font Family     Size    Weight   Line-height   Color (hex)
  ──────────────────────────────────────────────────────────────────────────
  H1/Heading      <family>        <px>    <wt>     <lh>          #<hex>
  H2/Subheading   <family>        <px>    <wt>     <lh>          #<hex>
  Body            <family>        <px>    <wt>     <lh>          #<hex>
  Label/Tag       <family>        <px>    <wt>     <lh>          #<hex>
  Button text     <family>        <px>    <wt>     <lh>          #<hex>

── COLORS ──
  Background:     #<hex>
  Text primary:   #<hex>
  Text secondary: #<hex>
  Accent:         #<hex>
  Border:         #<hex>
  Overlay:        rgba(<r>,<g>,<b>,<a>)

── ASSETS ──
  Type    Figma Layer Name    Dimensions    Export Format   Status
  ──────────────────────────────────────────────────────────────
  Image   <layer name>        <W>×<H>px     WebP 2×         extract
  Video   <layer name>        <W>×<H>px     MP4             extract
  Icon    <layer name>        <W>×<H>px     SVG             extract
  Logo    <layer name>        <W>×<H>px     SVG             extract

── ANIMATION ──
  Name:           <descriptive name>
  Element:        <what moves — CSS selector or description>
  Trigger:        scroll enters viewport | pin | scrub
  Direction:      forward only | forward + backward (reverse on scroll up)
  Start:          "<ScrollTrigger start value>"
  End:            "<ScrollTrigger end value>"
  Scrub:          true | false | <number>
  Pin:            true | false
  From state:     opacity:<v>  y:<px>  x:<px>  scale:<v>  rotation:<deg>
  To state:       opacity:<v>  y:<px>  x:<px>  scale:<v>  rotation:<deg>
  Ease:           <gsap ease string>
  Duration:       <seconds>
  Stagger:        <seconds | false>
  Mobile:         same | simplified (<describe>) | off
  SOURCE:         my note | reference URL | assumed ← FLAG assumed ones

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4b. STOP after analysis

Write exactly:
> "Analysis complete — [N] sections found. Questions below. Waiting for approval."

List all QUESTIONS. Do not write any code.

---

## 5. STEP 2 — REACT COMPONENT

Build directly as React. No HTML prototype step.

### 5a. File locations

```
app/sections/<SectionName>/
  index.jsx
  <SectionName>.module.css
```

### 5b. React Component Template

```jsx
/**
 * <SectionName>
 *
 * Figma desktop: <file-key>?node-id=<node-id>
 * Figma mobile:  <file-key>?node-id=<node-id>
 * Reference:     <URL>
 *
 * Animations:
 *   <name>
 *     trigger: <value>   start: <value>   end: <value>
 *     scrub: <value>     pin: <value>
 *     from: { opacity: <v>, y: <v> }
 *     to:   { opacity: <v>, y: <v> }
 *     SOURCE: <my note | reference URL>
 *
 * Assets:
 *   ✅ <filename>.webp → /images/<section-name>/
 *   ⬜ MISSING: <filename> — placeholder used
 *
 * Mobile: <same | simplified — description | off>
 */

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

export function <SectionName>() {
  const containerRef = useRef(null)

  useGSAP(
    () => {
      // ✅ Register inside useGSAP — SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger)

      // Reduced motion check
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReduced) return

      const mm = gsap.matchMedia()

      // ── DESKTOP ──
      mm.add('(min-width: 768px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: '<value>',
            end: '<value>',
            scrub: <number>,
            pin: <boolean>,
            anticipatePin: 1,
          },
        })

        tl.fromTo(
          '.element-class',
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 1 }
        )

        return () => mm.revert()
      })

      // ── MOBILE ──
      mm.add('(max-width: 767px)', () => {
        // same | simplified | off
        return () => mm.revert()
      })

      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="<tailwind or module.css class>">
      {/* exact Figma structure */}
    </section>
  )
}
```

### 5c. Tailwind — Exact Figma Values

```jsx
// Padding  → p-[<px>px] or pt-[<px>px] pr-[<px>px] etc.
// Margin   → mt-[<px>px]
// Gap      → gap-[<px>px]
// Font     → font-[<family>] text-[<px>px] font-[<weight>]
// Color    → text-[#<hex>] bg-[#<hex>]
// Width    → w-[<px>px] max-w-[<px>px]
```

---

## 6. FIGMA ASSET EXTRACTION

```
1. Use figma MCP → get_image_fills on the node
2. Images  → WebP 2× → public/images/<section-name>/<layer-name>.webp
3. Videos  → MP4     → public/videos/<section-name>/<video-name>.mp4
4. Icons   → SVG     → app/assets/icons/<icon-name>.svg
5. Fonts   → identify exact family and weight — never substitute
```

---

## 7. GSAP ANIMATION RULES

### Smooth Forward + Backward

```js
gsap.timeline({
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1,  // reverses smoothly on scroll up
  }
})
```

### CSS Sticky (not ScrollTrigger pin)

```js
// When prototype uses position:sticky — match it exactly
// Section host: height = canvas + travel
// Sticky child: position:sticky; top:0; height:100svh
// ScrollTrigger only drives the timeline — no pin:true
scrollTrigger: {
  trigger: section,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.6,
  invalidateOnRefresh: true,
}
```

### Animate ONLY

```js
// ✅ OK — transform and opacity only
opacity, x, y, scale, rotation, transformOrigin

// ❌ NEVER animate — causes layout shift
width, height, padding, margin, top, left, fontSize
```

### Stagger

```js
tl.fromTo('.card',
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, stagger: 0.15, ease: 'power2.out' }
)
```

### Reduced Motion

```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReduced) return // show final state only
```

---

## 8. PIXEL PERFECT CHECKLIST

```
Layout
  ☐ Container max-width matches Figma exactly
  ☐ Padding top/right/bottom/left exact
  ☐ Gap between elements exact
  ☐ Alignment (flex/grid) matches

Typography
  ☐ Font family exact (no substitution)
  ☐ Font size exact (px)
  ☐ Font weight exact
  ☐ Line height exact
  ☐ Letter spacing exact
  ☐ Color hex exact

Color & Theme
  ☐ Background color exact
  ☐ Text colors exact
  ☐ Border color and width exact

Assets
  ☐ Image dimensions match Figma
  ☐ No placeholder where real asset exists

Animation
  ☐ Matches reference site feel
  ☐ Forward scroll → animates in
  ☐ Backward scroll → reverses smoothly
  ☐ No layout shift during animation
  ☐ prefers-reduced-motion respected

Mobile
  ☐ Padding/spacing matches Figma mobile frame
  ☐ Font sizes match Figma mobile frame
  ☐ No horizontal overflow
```

---

## 9. PROGRESS.md UPDATE (after each section)

```markdown
## Section [N]: <SectionName>

Status: ✅ done | 🔶 partial | ⬜ not started
Approach: A (prototype) | B (Figma)

React Component: app/sections/<SectionName>/index.jsx ✅

Assets:
  ✅ <filename>.webp
  ⬜ MISSING: <filename> — placeholder at line <N>

Animations:
  ✅ <name> — scrub:1 start:"top 80%" end:"bottom 20%"
  🔶 <name> — partial: <reason>

Open Points:
  - <anything>

Next: Section [N+1] — <name>
```

---

## 10. SAFETY

- Never edit files I did not create (unless asked)
- Before editing existing file → _backup/<file>.<timestamp> first
- Never invent copy, prices, or product claims
- Never invent animations (SOURCE required)
- Never publish to live theme
- Never commit .env or tokens
- Never overwrite prototype/ files