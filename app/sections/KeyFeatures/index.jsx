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

/* Copy - verbatim from SECTIONS.dkf /Frame 18 + /Frame 19 */
const FEATURES = [
  {
    title: '21,5" Display',
    desc: 'Mit dem 360 Grad schwenkbaren Touch-Display sind deine Workouts so flexibel wie nie!',
    img: '/images/key-features/card-01.webp',
  },
  {
    title: 'LED Lichter',
    desc: 'Die LED-Lichter passen sich deiner Leistung an und geben dir motivierendes Feedback.',
    img: '/images/key-features/card-02.webp',
  },
  {
    title: 'Speed Knob',
    desc: 'Passe dein Tempo in Sekunden an – mit nur einer Drehbewegung.',
    img: '/images/key-features/card-03.webp',
  },
  {
    title: '15 Steigungsstufen',
    desc: 'Mit 15 Steigungsstufen passt du dein Training individuell an und forderst dich immer wieder neu heraus.',
    img: '/images/key-features/card-04.webp',
  },
  {
    title: 'Einfach klappen',
    desc: 'Dank Klappfunktion und Transportrollen lässt sich das Laufband schnell verstauen – ideal für dein Homegym mit wenig Platz.',
    img: '/images/key-features/card-05.webp',
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

/* `expand_circle_right` - SECTIONS.dkf /Prev|/Next, path verbatim.
   Rendered with currentColor so the module CSS sets Prev vs Next fill. */
const ARROW_PATH =
  'M20.773 18L15.2925 23.481C15.1052 23.6617 15.0115 23.8875 15.0115 24.1585C15.0115 24.4298 15.1052 24.6628 15.2925 24.8575C15.4872 25.0782 15.725 25.182 16.006 25.169C16.2867 25.1563 16.5243 25.0525 16.719 24.8575L22.446 19.131C22.7693 18.8077 22.931 18.4307 22.931 18C22.931 17.5693 22.7693 17.1923 22.446 16.869L16.7075 11.131C16.5128 10.936 16.277 10.834 16 10.825C15.723 10.816 15.4872 10.9218 15.2925 11.1425C15.1052 11.3372 15.016 11.573 15.025 11.85C15.034 12.127 15.136 12.3628 15.331 12.5575L20.773 18ZM18.0065 36C15.5175 36 13.1773 35.5277 10.986 34.583C8.795 33.6383 6.889 32.3563 5.268 30.737C3.647 29.1177 2.36383 27.2133 1.4185 25.024C0.472833 22.835 0 20.4958 0 18.0065C0 15.5175 0.472333 13.1773 1.417 10.986C2.36167 8.795 3.64367 6.889 5.263 5.268C6.88233 3.647 8.78666 2.36383 10.976 1.4185C13.165 0.472833 15.5042 0 17.9935 0C20.4825 0 22.8227 0.472335 25.014 1.417C27.205 2.36167 29.111 3.64367 30.732 5.263C32.353 6.88234 33.6362 8.78667 34.5815 10.976C35.5272 13.165 36 15.5042 36 17.9935C36 20.4825 35.5277 22.8227 34.583 25.014C33.6383 27.205 32.3563 29.111 30.737 30.732C29.1177 32.353 27.2133 33.6362 25.024 34.5815C22.835 35.5272 20.4958 36 18.0065 36Z';

const ArrowIcon = () => (
  <svg
    className={styles.navIcon}
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d={ARROW_PATH} fill="currentColor" fillRule="nonzero" />
  </svg>
);

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pad2 = (n) => String(n).padStart(2, '0');

export function KeyFeatures() {
  const rootRef = useRef(null);
  const deckRef = useRef(null);
  const cardRefs = useRef([]);
  const nameRef = useRef(null);
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
          swap(nameRef.current, i);
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

          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            onClick={() => go(Math.round(posRef.current) - 1)}
            onKeyDown={onArrowKeys}
            aria-label="Vorheriges Feature"
          >
            <ArrowIcon />
          </button>

          <p ref={nameRef} className={styles.name}>
            {feature.title}
          </p>

          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            onClick={() => go(Math.round(posRef.current) + 1)}
            onKeyDown={onArrowKeys}
            aria-label="Nächstes Feature"
          >
            <ArrowIcon />
          </button>

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
