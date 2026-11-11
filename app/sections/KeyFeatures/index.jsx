/**
 * KeyFeatures - "sTread Pro - Key Features"
 *
 * Source: prototype/js/app.js:7-27   (the cover-flow IIFE - every constant
 *                                     below is lifted from it verbatim)
 *         prototype/js/sections.js   SECTIONS.dkf (1920x1126, 5 kf)
 *                                    SECTIONS.mkf (390x844,  5 kf)
 *         prototype/js/engine.js:24-34, 42-45
 *         prototype/css/site.css:6   .cf / .card primitives
 *         prototype/fig/*.webp -> public/images/key-features/card-0N.webp
 *                                 (app.js:12 REF array, in order)
 *
 * REBUILT 2026-11-04. The previous build was a click-only carousel with
 * three discrete depth slots; the updated prototype makes this a PINNED,
 * SCROLL-DRIVEN, SNAPPING cover-flow. Nothing of the old motion survives.
 *
 * -- Animation ---------------------------------------------------------
 *   Pin:      CSS position:sticky (see the module CSS) - the prototype
 *             never calls ScrollTrigger's pin.
 *   Trigger:  the section
 *   Start:    `top ${min(0, innerHeight - stageHeight)}`   app.js:10,18
 *   End:      `+=${4 * STEP}`, STEP = innerHeight * 0.7    app.js:9,18
 *             => 280vh of travel
 *   Scrub:    0.5                                          app.js:18
 *   onUpdate: render(progress * 4)                         app.js:18
 *   Forward + backward: yes, scrub-driven; the deck interpolates
 *             continuously so reversing retraces the same path.
 *   SOURCE:   prototype/js/app.js - not assumed.
 *
 * -- Depth curve (app.js:14-15) ----------------------------------------
 *   A 4-stop table interpolated continuously by distance-from-centre, then
 *   mirrored by sign. Neighbours at |d| >= 2 are fully transparent, so five
 *   cards are enough for an infinite-feeling loop.
 *
 * -- Interactions ------------------------------------------------------
 *   click card i      -> go(i)                             app.js:22
 *   Prev / Next       -> go(cur -+ 1)                      app.js:23
 *   Arrow keys        -> go(cur -+ 1)                      app.js:24
 *   horizontal drag   -> >50px pages                       app.js:25
 *   scroll idle 160ms -> snap to nearest step              app.js:21
 *
 * Mobile: same markup, re-coordinated by CSS (approved Q2 - one responsive
 * tree, no innerWidth branching at load; gsap.matchMedia drives the JS).
 *
 * Reduced motion: no ScrollTrigger, no travel, deck parked on card 1 and
 * driven only by the controls - matching app.js:10,18 (`RM ? h : ...`).
 */

import {useRef, useState, useCallback} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './KeyFeatures.module.css';

/* Tab icons - added 2026-11-11 alongside the tab menu below. No Figma node
   data for these (the tab menu itself isn't in SECTIONS.dkf/mkf — it was
   requested from a reference screenshot, not extracted from Figma), so
   these are plain generic glyphs, not vector-traced exports. */
const DisplayTabIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 13.5h5M8 11v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const LedTabIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <circle cx="8" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 1v1.3M8 13.7V15M2.6 7H1M15 7h-1.6M3.5 2.5l1 1M12.5 2.5l-1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const KnobTabIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 8l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const InclineTabIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path d="M2 13.5h12M4 13.5V9M8 13.5V5.5M12 13.5V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const FoldTabIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path d="M2 4l3 3-3 3M14 4l-3 3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Copy - verbatim from SECTIONS.dkf /Frame 18 + /Frame 19 */
const FEATURES = [
  {
    title: '21,5" Display',
    desc: 'Mit dem 360 Grad schwenkbaren Touch-Display sind deine Workouts so flexibel wie nie!',
    img: '/images/key-features/card-01.webp',
    icon: DisplayTabIcon,
  },
  {
    title: 'LED Lichter',
    desc: 'Die LED-Lichter passen sich deiner Leistung an und geben dir motivierendes Feedback.',
    img: '/images/key-features/card-02.webp',
    icon: LedTabIcon,
  },
  {
    title: 'Speed Knob',
    desc: 'Passe dein Tempo in Sekunden an – mit nur einer Drehbewegung.',
    img: '/images/key-features/card-03.webp',
    icon: KnobTabIcon,
  },
  {
    title: '15 Steigungsstufen',
    desc: 'Mit 15 Steigungsstufen passt du dein Training individuell an und forderst dich immer wieder neu heraus.',
    img: '/images/key-features/card-04.webp',
    icon: InclineTabIcon,
  },
  {
    title: 'Einfach klappen',
    desc: 'Dank Klappfunktion und Transportrollen lässt sich das Laufband schnell verstauen – ideal für dein Homegym mit wenig Platz.',
    img: '/images/key-features/card-05.webp',
    icon: FoldTabIcon,
  },
];

const COUNT = FEATURES.length; // 5
const STEPS = COUNT - 1; // 4 scroll steps

/* Depth table - prototype/js/app.js:14, verbatim */
const POSE = {
  desktop: [
    {x: 0, z: 0, r: 0, s: 1, o: 1},
    {x: 595, z: -20, r: 31, s: 0.72, o: 0.6},
    {x: 836, z: -200, r: 40, s: 0.45, o: 0},
    {x: 960, z: -300, r: 45, s: 0.4, o: 0},
  ],
  mobile: [
    {x: 0, z: 0, r: 0, s: 1, o: 1},
    {x: 210, z: -200, r: 55, s: 0.7, o: 0.55},
    {x: 360, z: -320, r: 62, s: 0.55, o: 0},
    {x: 480, z: -420, r: 62, s: 0.45, o: 0},
  ],
};

/* Mobile pagination dots - SECTIONS.mkf /Dot 1..5, x per keyframe */
const DOT_X = [
  [151, 183, 199, 215, 231],
  [151, 167, 199, 215, 231],
  [151, 167, 183, 215, 231],
  [151, 167, 183, 199, 231],
  [151, 167, 183, 199, 215],
];
const DOT_ON = 'rgba(31,31,31,1)';
const DOT_OFF = 'rgba(31,31,31,0.2)';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pad2 = (n) => String(n).padStart(2, '0');

export function KeyFeatures() {
  const rootRef = useRef(null);
  const deckRef = useRef(null);
  const cardRefs = useRef([]);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const counterRef = useRef(null);
  const dotRefs = useRef([]);

  /* Continuous carousel position, 0..4. Mirrors `let f = 0` in app.js:17.
     Kept in a ref, not state - it updates every scroll frame. */
  const posRef = useRef(0);
  const goRef = useRef(() => {});

  /* The only value React re-renders on: which copy is showing. The engine
     does the same with `setTexts` snapping to round(progress * (N-1))
     (prototype/js/engine.js:36). */
  const [copyIndex, setCopyIndex] = useState(0);

  const go = useCallback((n) => goRef.current(n), []);

  useGSAP(
    () => {
      // Register inside useGSAP - SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const build = (variant) => {
        const isMobile = variant === 'mobile';
        const P = POSE[variant];
        const cards = cardRefs.current.filter(Boolean);

        /* pose(d) - app.js:15, verbatim.
           Interpolates the 4-stop table by |d|, mirrors by sign. */
        const pose = (d) => {
          const sg = d < 0 ? -1 : 1;
          const m = Math.min(3, Math.abs(d));
          const i = Math.floor(m);
          const f = m - i;
          const A = P[i];
          const B = P[Math.min(3, i + 1)];
          const L = (a, b) => a + (b - a) * f;
          return {
            x: sg * L(A.x, B.x),
            z: L(A.z, B.z),
            rotationY: sg * L(A.r, B.r),
            scale: L(A.s, B.s),
            opacity: L(A.o, B.o),
            filter: `brightness(${1 + Math.min(1, m) * 0.08})`,
            zIndex: 10 - Math.round(m * 3),
          };
        };

        /* wrap(d) - app.js:16, verbatim. Folds the index delta into
           [-2.5, 2.5) so the deck loops without duplicate cards. */
        const wrap = (d) => (((d % COUNT) + 7.5) % COUNT) - 2.5;

        /* Stage timeline.
           The prototype drives SECTIONS.dkf's own engine timeline with
           `K.tl.progress(v / 4)` (app.js:17). Hand-written here with the
           engine's exact tween semantics (prototype/js/engine.js:31):
           text out 0.35s power2.in, content swap at the midpoint, in 0.4s
           power2.out. Duration 4 = one unit per keyframe step. */
        const tl = gsap.timeline({paused: true});

        const swap = (el, i) => {
          if (!el) return;
          tl.to(
            el,
            {opacity: 0, y: -14, duration: 0.35, ease: 'power2.in'},
            i - 1 + 0.1,
          );
          tl.set(el, {y: 16}, i - 0.5);
          tl.to(
            el,
            {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'},
            i - 0.5,
          );
        };

        for (let i = 1; i <= STEPS; i++) {
          swap(titleRef.current, i);
          swap(descRef.current, i);

          if (isMobile) {
            swap(counterRef.current, i);
            // Dots: x + width + colour, engine geometry tween (engine.js:30)
            dotRefs.current.forEach((dot, j) => {
              if (!dot) return;
              const D = {duration: 1, ease: 'power2.inOut'};
              if (DOT_X[i][j] !== DOT_X[i - 1][j]) {
                tl.to(dot, {left: DOT_X[i][j], ...D}, i - 1);
              }
              if ((j === i) !== (j === i - 1)) {
                tl.to(
                  dot,
                  {
                    width: j === i ? 24 : 8,
                    backgroundColor: j === i ? DOT_ON : DOT_OFF,
                    ...D,
                  },
                  i - 1,
                );
              }
            });
          }
          // Keep every segment exactly one unit long even when idle.
          tl.to({}, {duration: 1}, i - 1);
        }

        /* render(v) - app.js:17 */
        const render = (v) => {
          posRef.current = v;
          cards.forEach((el, i) => gsap.set(el, pose(wrap(i - v))));
          tl.progress(clamp(v / STEPS, 0, 1));
          const ci = clamp(Math.round(v), 0, COUNT - 1);
          setCopyIndex((prev) => (prev === ci ? prev : ci));
        };

        // Initial state before any scrolling - app.js:17 `render(0)`
        if (isMobile) {
          dotRefs.current.forEach((dot, j) => {
            if (!dot) return;
            gsap.set(dot, {
              left: DOT_X[0][j],
              width: j === 0 ? 24 : 8,
              backgroundColor: j === 0 ? DOT_ON : DOT_OFF,
            });
          });
        }
        render(0);

        /* ScrollTrigger - app.js:18 */
        const STEP = () => window.innerHeight * 0.7;
        const stageH = () =>
          (isMobile ? 844 : 1126) *
          (window.innerWidth / (isMobile ? 390 : 1920));
        const stickyTop = () => Math.min(0, window.innerHeight - stageH());

        let st = null;
        if (!reduced) {
          st = ScrollTrigger.create({
            trigger: rootRef.current,
            start: () => `top ${stickyTop()}`,
            end: () => `+=${STEPS * STEP()}`,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => render(self.progress * STEPS),
          });
        }

        /* go(n) - app.js:19 */
        goRef.current = (n) => {
          const target = clamp(n, 0, STEPS);
          const {lenis} = window;
          if (!st || !lenis) {
            // No scroller to drive - tween the position directly.
            // Instant under reduced motion (the prototype still eased here).
            gsap.to(posRef, {
              current: target,
              duration: reduced ? 0 : 0.7,
              ease: 'power3.inOut',
              overwrite: true,
              onUpdate() {
                render(posRef.current);
              },
            });
            return;
          }
          lenis.scrollTo(st.start + target * STEP(), {duration: 0.9});
        };

        /* Snap after the scroll settles - app.js:21 */
        let timer;
        const onScroll = () => {
          const {lenis} = window;
          if (!st || !lenis) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            const y = lenis.scroll;
            if (y > st.start + 2 && y < st.end - 2) {
              const n = Math.round((y - st.start) / STEP());
              const t = st.start + n * STEP();
              if (Math.abs(t - y) > 3) lenis.scrollTo(t, {duration: 0.5});
            }
          }, 160);
        };
        window.lenis?.on?.('scroll', onScroll);

        /* Drag to page - app.js:25 */
        let startX = null;
        const deck = deckRef.current;
        const onDown = (e) => {
          startX = e.clientX;
        };
        const onUp = (e) => {
          if (startX !== null && Math.abs(e.clientX - startX) > 50) {
            goRef.current(
              Math.round(posRef.current) + (e.clientX < startX ? 1 : -1),
            );
          }
          startX = null;
        };
        deck?.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);

        return () => {
          clearTimeout(timer);
          window.lenis?.off?.('scroll', onScroll);
          deck?.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointerup', onUp);
          st?.kill();
          tl.kill();
        };
      };

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => build('desktop'));
      mm.add('(max-width: 767px)', () => build('mobile'));

      return () => mm.revert();
    },
    {scope: rootRef},
  );

  // Arrow keys - app.js:24. Bound to the interactive children rather than
  // the section, so the handler always sits on a focusable control.
  const onArrowKeys = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(Math.round(posRef.current) + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(Math.round(posRef.current) - 1);
    }
  };

  const feature = FEATURES[copyIndex];

  return (
    <section
      ref={rootRef}
      className={styles.section}
      id="kf"
      aria-labelledby="kf-heading"
    >
      <div className={styles.pin}>
        <div className={styles.stage}>
          <p className={styles.badge}>ENTDECKE EINIGE DER</p>

          <h2 id="kf-heading" className={styles.title}>
            sTread Pro - Key Features
          </h2>

          <div className={styles.tabs} role="tablist" aria-label="Feature auswählen">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const active = i === copyIndex;
              return (
                <button
                  key={f.title}
                  type="button"
                  role="tab"
                  id={`kf-tab-${i}`}
                  aria-selected={active}
                  className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                  onClick={() => go(i)}
                  onKeyDown={onArrowKeys}
                >
                  <Icon className={styles.tabIcon} />
                  {f.title}
                </button>
              );
            })}
          </div>

          <div ref={deckRef} className={styles.deck}>
            {FEATURES.map((f, i) => (
              <button
                key={f.title}
                type="button"
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={styles.card}
                style={{backgroundImage: `url(${f.img})`}}
                onClick={() => go(i)}
                onKeyDown={onArrowKeys}
                aria-label={`Feature ${i + 1}: ${f.title}`}
                aria-current={i === copyIndex ? 'true' : undefined}
              />
            ))}
          </div>

          <div className={styles.copy}>
            <p ref={titleRef} className={styles.featTitle}>
              {feature.title}
            </p>
            <p ref={descRef} className={styles.featDesc}>
              {feature.desc}
            </p>
          </div>

          <p ref={counterRef} className={styles.counter} aria-live="polite">
            {pad2(copyIndex + 1)} / {pad2(COUNT)}
          </p>

          <div className={styles.dots} aria-hidden="true">
            {FEATURES.map((f, i) => (
              <span
                key={f.title}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className={styles.dot}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default KeyFeatures;
