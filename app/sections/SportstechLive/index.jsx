/**
 * SportstechLive — "Entdecke Sportstech Live, das Multimedia-Erlebnis"
 *
 * Source: prototype/js/sections.js → SECTIONS.dlive (1920×1080, 9 keyframes)
 *                                   SECTIONS.mlive (390×844, 9 keyframes)
 *         prototype/js/app.js — mountPinned(host, …, {fit:!MOB, per:.8, snap:false})
 *         prototype/fig/*.webp → public/images/sportstech-live/card-01..06.webp
 *
 * Pinning: CSS position:sticky (prototype/index.html .pinbox). ScrollTrigger
 * drives the timeline only — it never calls pin. Travel = (9-1) × 100vh × 0.8
 * = 640svh, set as --live-travel in the stylesheet.
 *
 * Animation: the prototype's engine diffs consecutive keyframe states and
 * tweens whatever changed with duration 1 / power2.inOut. The keyframe
 * matrices below are lifted verbatim from the dlive/mlive node data, and the
 * timeline is rebuilt the same way — one tween per changed property, placed
 * at timeline position (i - 1).
 * SOURCE: prototype/js/engine.js buildStage()
 *
 * Choreography:
 *   kf 0     intro — heading large, card 1 active
 *   kf 1     heading shrinks and docks to the top
 *   kf 2–6   track slides one card per keyframe; the active card loses its
 *            recede overlay, its title darkens and its description fades in
 *   kf 7     track slides away, progress fades out, big type rises in
 *   kf 8     everything dims to 0.3
 *
 * Reduced motion: the timeline is left at its final state and no
 * ScrollTrigger is created, matching engine.js (`if (RM) { tl.progress(1) }`).
 */

import {useRef, useState, useCallback} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './SportstechLive.module.css';

const INK = 'rgba(24,26,29,1)';
const INK_MUTED = 'rgba(74,79,87,1)';
const INK_FAINT = 'rgba(107,112,121,1)';

/** SOURCE: SECTIONS.dlive /Track/Card N/Title + /Description */
const CARDS = [
  {
    id: 'fitness-wellness',
    title: 'Fitness & Wellness',
    description:
      'Bringe Körper und Geist in Balance. Entdecke vielseitige Programme für Fitness, Regeneration und mehr Wohlbefinden.',
    image: '/images/sportstech-live/card-01-fitness-wellness.webp',
  },
  {
    id: 'landschaften',
    title: 'Landschaften',
    description:
      'Jede Strecke wird zur Reise. Erlebe beeindruckende Landschaften weltweit und mache jedes Training zu einer neuen Entdeckung.',
    image: '/images/sportstech-live/card-02-landschaften.webp',
  },
  {
    id: 'workouts',
    title: 'Workouts',
    description:
      'Entdecke unzählige Workouts unserer Heimtrainer, verfügbar für alle Fitnesslevel.',
    image: '/images/sportstech-live/card-03-workouts.webp',
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    description:
      'Dein Workout, dein Stream – trainiere und schaue dabei deine Lieblingsserie!',
    image: '/images/sportstech-live/card-04-entertainment.webp',
  },
  {
    id: 'gaming',
    title: 'Gaming',
    description:
      'Verbinde Bewegung mit Spiel und bring mehr Spaß und Motivation in dein Training.',
    image: '/images/sportstech-live/card-05-gaming.webp',
  },
  {
    id: 'ki-coach',
    title: 'KI-Coach',
    description:
      'Der KI-Coach analysiert deine Trainingsdaten und passt den Trainingsplan entsprechend an.',
    image: '/images/sportstech-live/card-06-ki-coach.webp',
  },
];

const KF = 9;

/* ── Keyframe matrices, lifted verbatim from the prototype node data ── */

const TRACK_X = {
  desktop: [0, -415, -1245, -2075, -2905, -3735, -4565, -6180, -6180],
  mobile: [0, -190, -516, -842, -1168, -1494, -1820, -2386, -2386],
};
const TRACK_O = [1, 1, 1, 1, 1, 1, 1, 1, 0.3];

/** Parallax inside each 750px window (mobile values scaled from mlive). */
const INNER_X = {
  desktop: [
    [-45, -45, -67, -90, -90, -90, -90, -90, -90],
    [-45, -22, -45, -67, -90, -90, -90, -90, -90],
    [-45, 0, -22, -45, -67, -90, -90, -90, -90],
    [-45, 0, 0, -22, -45, -67, -90, -90, -90],
    [-45, 0, 0, 0, -22, -45, -67, -90, -90],
    [-45, 0, 0, 0, 0, -22, -45, -67, -90],
  ],
  mobile: [
    [-18, -18, -27, -37, -37, -37, -37, -37, -37],
    [-18, -9, -18, -27, -37, -37, -37, -37, -37],
    [-18, 0, -9, -18, -27, -37, -37, -37, -37],
    [-18, 0, 0, -9, -18, -27, -37, -37, -37],
    [-18, 0, 0, 0, -9, -18, -27, -37, -37],
    [-18, 0, 0, 0, 0, -9, -18, -27, -37],
  ],
};

const OVERLAY_O = [
  [0, 0, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  [0.45, 0.45, 0, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  [0.45, 0.45, 0.45, 0, 0.45, 0.45, 0.45, 0.45, 0.45],
  [0.45, 0.45, 0.45, 0.45, 0, 0.45, 0.45, 0.45, 0.45],
  [0.45, 0.45, 0.45, 0.45, 0.45, 0, 0.45, 0.45, 0.45],
  [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0, 0.45, 0.45],
];

/** 1 = dark ink, 0 = muted. Doubles as the "is this card active" matrix. */
const TITLE_ON = [
  [1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0],
];
const DESC_O = TITLE_ON;

const HEADING_TOP = [300, 72, 72, 72, 72, 72, 72, 72, 72];
const HEADING_W = [780, 901, 901, 901, 901, 901, 901, 901, 901];
const HEADING_O = [1, 1, 1, 1, 1, 1, 1, 0, 0];
const HEAD_TEXT_TOP = [40, 28, 28, 28, 28, 28, 28, 28, 28];
const HEAD_TEXT_W = [760, 901, 901, 901, 901, 901, 901, 901, 901];
const HEAD_FS = [56, 40, 40, 40, 40, 40, 40, 40, 40];
const CAT_TOP = [200, 108, 108, 108, 108, 108, 108, 108, 108];
const CAT_C = [
  INK_MUTED,
  INK_FAINT,
  INK_FAINT,
  INK_FAINT,
  INK_FAINT,
  INK_FAINT,
  INK_FAINT,
  INK_MUTED,
  INK_MUTED,
];

const BIG_TOP = {
  desktop: [320, 320, 320, 320, 320, 320, 320, 220, 220],
  mobile: [360, 360, 360, 360, 360, 360, 360, 300, 300],
};
const BIG_O = [0, 0, 0, 0, 0, 0, 0, 1, 0.3];

const FILL_W = [12, 50, 100, 150, 200, 250, 300, 300, 300];
const PROG_O = [1, 1, 1, 1, 1, 1, 1, 0, 0];
const PROG_TXT = [
  '01 / 06',
  '01 / 06',
  '02 / 06',
  '03 / 06',
  '04 / 06',
  '05 / 06',
  '06 / 06',
  '06 / 06',
  '06 / 06',
];

/** Which card is "active" at a given keyframe, or -1. */
function activeAt(kf) {
  const i = TITLE_ON.findIndex((row) => row[kf] === 1);
  return i;
}

export function SportstechLive() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const headingRef = useRef(null);
  const headTextRef = useRef(null);
  const catRef = useRef(null);
  const bigTypeRef = useRef(null);
  const progressRef = useRef(null);
  const progTrackRef = useRef(null);
  const fillRef = useRef(null);
  const innerRefs = useRef([]);
  const overlayRefs = useRef([]);
  const titleRefs = useRef([]);
  const descRefs = useRef([]);
  const tlRef = useRef(null);

  const [kf, setKf] = useState(0);

  /** Jump to a keyframe (mobile ‹ › only). */
  const goToKeyframe = useCallback((next) => {
    const st = tlRef.current?.scrollTrigger;
    if (!st) return;
    const clamped = Math.max(0, Math.min(KF - 1, next));
    const span = st.end - st.start;
    const target = st.start + (span * clamped) / (KF - 1);
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({top: target, behavior: reduced ? 'auto' : 'smooth'});
  }, []);

  useGSAP(
    () => {
      // ✅ Register inside useGSAP — SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const build = (variant) => {
        const trackX = TRACK_X[variant];
        const innerX = INNER_X[variant];
        const bigTop = BIG_TOP[variant];

        const inners = innerRefs.current.filter(Boolean);
        const overlays = overlayRefs.current.filter(Boolean);
        const titles = titleRefs.current.filter(Boolean);
        const descs = descRefs.current.filter(Boolean);

        // ── Keyframe 0 ──
        gsap.set(trackRef.current, {x: trackX[0], opacity: TRACK_O[0]});
        inners.forEach((el, c) => gsap.set(el, {x: innerX[c][0]}));
        overlays.forEach((el, c) => gsap.set(el, {opacity: OVERLAY_O[c][0]}));
        titles.forEach((el, c) =>
          gsap.set(el, {color: TITLE_ON[c][0] ? INK : INK_MUTED}),
        );
        descs.forEach((el, c) => gsap.set(el, {opacity: DESC_O[c][0]}));
        gsap.set(headingRef.current, {
          top: HEADING_TOP[0],
          width: HEADING_W[0],
          opacity: HEADING_O[0],
        });
        gsap.set(headTextRef.current, {
          top: HEAD_TEXT_TOP[0],
          width: HEAD_TEXT_W[0],
          fontSize: HEAD_FS[0],
        });
        gsap.set(catRef.current, {top: CAT_TOP[0], color: CAT_C[0]});
        gsap.set(bigTypeRef.current, {top: bigTop[0], opacity: BIG_O[0]});
        gsap.set(fillRef.current, {width: FILL_W[0]});
        gsap.set([progressRef.current, progTrackRef.current], {
          opacity: PROG_O[0],
        });
        setKf(0);

        // Reduced motion: hold the final state, no ScrollTrigger — engine.js
        if (reduced) {
          const last = KF - 1;
          gsap.set(trackRef.current, {
            x: trackX[last],
            opacity: TRACK_O[last],
          });
          inners.forEach((el, c) => gsap.set(el, {x: innerX[c][last]}));
          overlays.forEach((el, c) =>
            gsap.set(el, {opacity: OVERLAY_O[c][last]}),
          );
          titles.forEach((el, c) =>
            gsap.set(el, {color: TITLE_ON[c][last] ? INK : INK_MUTED}),
          );
          descs.forEach((el, c) => gsap.set(el, {opacity: DESC_O[c][last]}));
          gsap.set(headingRef.current, {opacity: HEADING_O[last]});
          gsap.set(bigTypeRef.current, {
            top: bigTop[last],
            opacity: BIG_O[last],
          });
          gsap.set([progressRef.current, progTrackRef.current], {
            opacity: PROG_O[last],
          });
          setKf(last);
          return () => {};
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
            ...(variant === 'mobile' ? {ignoreMobileResize: true} : {}),
          },
          onUpdate: () => {
            const current = Math.round(tl.progress() * (KF - 1));
            setKf((prev) => (prev === current ? prev : current));
          },
        });

        const D = {duration: 1, ease: 'power2.inOut'};
        // One tween per changed property, at position i-1 — engine.js
        const step = (target, prop, values, i, map) => {
          if (!target) return;
          if (values[i] === values[i - 1]) return;
          tl.to(target, {[prop]: map ? map(values[i]) : values[i], ...D}, i - 1);
        };

        for (let i = 1; i < KF; i++) {
          const at = i - 1;
          step(trackRef.current, 'x', trackX, i);
          step(trackRef.current, 'opacity', TRACK_O, i);

          inners.forEach((el, c) => step(el, 'x', innerX[c], i));
          overlays.forEach((el, c) => step(el, 'opacity', OVERLAY_O[c], i));
          titles.forEach((el, c) =>
            step(el, 'color', TITLE_ON[c], i, (v) => (v ? INK : INK_MUTED)),
          );
          descs.forEach((el, c) => step(el, 'opacity', DESC_O[c], i));

          step(headingRef.current, 'top', HEADING_TOP, i);
          step(headingRef.current, 'width', HEADING_W, i);
          step(headingRef.current, 'opacity', HEADING_O, i);
          step(headTextRef.current, 'top', HEAD_TEXT_TOP, i);
          step(headTextRef.current, 'width', HEAD_TEXT_W, i);
          step(headTextRef.current, 'fontSize', HEAD_FS, i);
          step(catRef.current, 'top', CAT_TOP, i);
          step(catRef.current, 'color', CAT_C, i);

          step(bigTypeRef.current, 'top', bigTop, i);
          step(bigTypeRef.current, 'opacity', BIG_O, i);

          step(fillRef.current, 'width', FILL_W, i);
          step(progressRef.current, 'opacity', PROG_O, i);
          step(progTrackRef.current, 'opacity', PROG_O, i);

          // Keep the timeline at least 8 units long even if nothing changed.
          tl.to({}, {duration: 1}, at);
        }

        tlRef.current = tl;

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          tlRef.current = null;
        };
      };

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => build('desktop'));
      mm.add('(max-width: 767px)', () => build('mobile'));

      return () => mm.revert();
    },
    {scope: rootRef},
  );

  const active = activeAt(kf);

  return (
    <section
      ref={rootRef}
      className={styles.section}
      id="live"
      aria-labelledby="sportstech-live-heading"
    >
      <div className={styles.sticky}>
        <div className={styles.canvas}>
          <div ref={headingRef} className={styles.heading}>
            <span className={styles.badge}>SPORTSTECH LIVE</span>
            <h2
              ref={headTextRef}
              id="sportstech-live-heading"
              className={styles.headingText}
            >
              Entdecke Sportstech Live, das Multimedia-Erlebnis
            </h2>
            <p ref={catRef} className={styles.categories}>
              Fitness &amp; Wellness &nbsp;·&nbsp; Landschaften &nbsp;·&nbsp;
              Workouts &nbsp;·&nbsp; Entertainment &nbsp;·&nbsp; Gaming
              &nbsp;·&nbsp; KI-Coach
            </p>
          </div>

          <ul ref={trackRef} className={styles.track}>
            {CARDS.map((card, c) => (
              <li
                key={card.id}
                className={`${styles.card} ${
                  c === active ? styles.cardActive : ''
                }`}
                aria-current={c === active}
              >
                <div className={styles.cardImage}>
                  <div
                    ref={(el) => {
                      innerRefs.current[c] = el;
                    }}
                    className={styles.cardImageInner}
                    style={{backgroundImage: `url(${card.image})`}}
                    role="img"
                    aria-label={card.title}
                  />
                  <div
                    ref={(el) => {
                      overlayRefs.current[c] = el;
                    }}
                    className={styles.cardOverlay}
                  />
                </div>
                <h3
                  ref={(el) => {
                    titleRefs.current[c] = el;
                  }}
                  className={styles.cardTitle}
                >
                  {card.title}
                </h3>
                <p
                  ref={(el) => {
                    descRefs.current[c] = el;
                  }}
                  className={styles.cardDescription}
                >
                  {card.description}
                </p>
              </li>
            ))}
          </ul>

          <p ref={progressRef} className={styles.progress} aria-live="polite">
            {PROG_TXT[kf]}
          </p>
          <div ref={progTrackRef} className={styles.progressTrack}>
            <div ref={fillRef} className={styles.progressFill} />
          </div>

          <p ref={bigTypeRef} className={styles.bigType}>
            {'SPORTSTECH\nLIVE'}
          </p>

          {/* mlive /Prev and /Next — mobile only */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={() => goToKeyframe(kf - 1)}
            aria-label="Vorherige Kategorie"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={() => goToKeyframe(kf + 1)}
            aria-label="Nächste Kategorie"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default SportstechLive;
