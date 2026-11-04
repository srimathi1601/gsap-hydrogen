/**
 * VideoShowcase — "Lerne das sTread Pro kennen!"
 *
 * Source: prototype/js/sections.js → SECTIONS.dvid (1920×1080, 4 keyframes)
 *                                   SECTIONS.mvid (390×844, 4 keyframes)
 *         prototype/js/app.js — the video IIFE
 *         prototype/fig/84d3f45f8f6b.webp → public/images/video-showcase/poster.webp
 *         prototype/fig/20a48257eb85.webp → public/images/video-showcase/sticky-thumb.webp
 *
 * ⚠️ There is NO <video> here, and none in the prototype either. The card is a
 * poster image with a presentational play/pause badge and a progress rail that
 * fills on scroll. Nothing plays.
 * TODO: swap poster.jpg with real MP4 — then promote the play/pause badge to a
 * real control bound to a <video>, and drive the rail off timeupdate.
 *
 * Pinning: CSS position:sticky (prototype/index.html .pinbox). ScrollTrigger
 * drives the timeline only. Travel = (4 - 1) × 100vh × 1 = 300svh.
 *
 * Choreography (SOURCE: dvid/mvid node data):
 *   kf 0  heading centred, card parked off-screen below, invisible
 *   kf 1  heading rises and fades out; card rises into frame
 *   kf 2  card grows 1440×808 → 1600×898 and docks near the top;
 *         play badge + progress rail fade in
 *   kf 3  play badge swaps to pause (as if playback started)
 *
 * Progress fill: SOURCE: prototype/js/app.js:32 onUpdate — verbatim —
 *   if (st.progress > .97 && !played) {
 *     played = true;
 *     gsap.to(fill, {width: (MOB ? 300 : 1376) * .35, duration: 4, ease: 'none'});
 *   }
 *   if (st.progress < .9 && played) { played = false; gsap.killTweensOf(fill) }
 *
 *   The target is an ABSOLUTE pixel width off the rail's *initial* width
 *   (desktop 1376, mobile 300), not 35% of the rail's final width:
 *     desktop 1376 × .35 = 481.6px   (NOT 1536 × .35 = 537.6)
 *     mobile   300 × .35 = 105px     (NOT  334 × .35 = 116.9)
 *   Earlier builds used width:'35%', which resolves against the grown rail
 *   and overshot by ~56px on desktop. Fixed to the literal px targets.
 *
 *   Note the prototype only kills the tween on the way back out — it never
 *   resets the width — so the fill keeps whatever it reached. We reset to 0
 *   so reversing past .9 and scrolling forward again replays identically.
 *
 * Reduced motion: timeline held at its final state, no ScrollTrigger, and
 * the 4s fill tween is skipped — matching engine.js's `if (RM)` branch.
 */

import {useRef} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './VideoShowcase.module.css';

const KF = 4;

/* ── Keyframe matrices, lifted verbatim from the prototype node data ── */

const HEADING_TOP = {
  desktop: [390.5, 270.5, 270.5, 270.5],
  mobile: [250, 150, 150, 150],
};
const HEADING_O = [1, 0, 0, 0];

const CARD = {
  desktop: {
    left: [240, 240, 160, 160],
    top: [1120, 560, 40, 40],
    width: [1440, 1440, 1600, 1600],
    height: [808, 808, 898, 898],
  },
  mobile: {
    left: [34, 34, 16, 16],
    top: [884, 520, 240, 240],
    width: [322, 322, 358, 358],
    height: [181, 181, 201, 201],
  },
};
const CARD_O = [0, 1, 1, 1];

/* Fake-playback target for the progress fill, in px.
   SOURCE: prototype/js/app.js:32 — (MOB ? 300 : 1376) * .35 */
const FILL_TARGET = {desktop: 481.6, mobile: 105};

const PLAY_O = [0, 0, 1, 0];
const PAUSE_O = [0, 0, 0, 1];
const RAIL_O = [0, 0, 1, 1];

export function VideoShowcase() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const cardRef = useRef(null);
  const playRef = useRef(null);
  const pauseRef = useRef(null);
  const railRef = useRef(null);
  const fillRef = useRef(null);

  useGSAP(
    () => {
      // ✅ Register inside useGSAP — SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const build = (variant) => {
        const headTop = HEADING_TOP[variant];
        const card = CARD[variant];

        const applyKeyframe = (i) => {
          gsap.set(headingRef.current, {top: headTop[i], opacity: HEADING_O[i]});
          gsap.set(cardRef.current, {
            left: card.left[i],
            top: card.top[i],
            width: card.width[i],
            height: card.height[i],
            opacity: CARD_O[i],
          });
          gsap.set(playRef.current, {opacity: PLAY_O[i]});
          gsap.set(pauseRef.current, {opacity: PAUSE_O[i]});
          gsap.set(railRef.current, {opacity: RAIL_O[i]});
        };

        applyKeyframe(0);
        gsap.set(fillRef.current, {width: 0});

        // Reduced motion: hold the final state, no ScrollTrigger — engine.js
        if (reduced) {
          applyKeyframe(KF - 1);
          gsap.set(fillRef.current, {width: FILL_TARGET[variant]});
          return () => {};
        }

        let played = false;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
            ...(variant === 'mobile' ? {ignoreMobileResize: true} : {}),
            // SOURCE: prototype/js/app.js — the fake playback tween
            onUpdate: (self) => {
              if (self.progress > 0.97 && !played) {
                played = true;
                gsap.to(fillRef.current, {
                  width: FILL_TARGET[variant],
                  duration: 4,
                  ease: 'none',
                });
              }
              if (self.progress < 0.9 && played) {
                played = false;
                gsap.killTweensOf(fillRef.current);
                gsap.set(fillRef.current, {width: 0});
              }
            },
          },
        });

        const D = {duration: 1, ease: 'power2.inOut'};
        const step = (target, prop, values, i) => {
          if (!target) return;
          if (values[i] === values[i - 1]) return;
          tl.to(target, {[prop]: values[i], ...D}, i - 1);
        };

        for (let i = 1; i < KF; i++) {
          step(headingRef.current, 'top', headTop, i);
          step(headingRef.current, 'opacity', HEADING_O, i);

          step(cardRef.current, 'left', card.left, i);
          step(cardRef.current, 'top', card.top, i);
          step(cardRef.current, 'width', card.width, i);
          step(cardRef.current, 'height', card.height, i);
          step(cardRef.current, 'opacity', CARD_O, i);

          step(playRef.current, 'opacity', PLAY_O, i);
          step(pauseRef.current, 'opacity', PAUSE_O, i);
          step(railRef.current, 'opacity', RAIL_O, i);

          // Keep every segment one unit long even when nothing changed.
          tl.to({}, {duration: 1}, i - 1);
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.killTweensOf(fillRef.current);
        };
      };

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => build('desktop'));
      mm.add('(max-width: 767px)', () => build('mobile'));

      return () => mm.revert();
    },
    {scope: rootRef},
  );

  return (
    <section
      ref={rootRef}
      className={styles.section}
      id="vid"
      aria-labelledby="video-showcase-heading"
    >
      <div className={styles.sticky}>
        <div className={styles.canvas}>
          <div ref={headingRef} className={styles.headingBlock}>
            <h2 id="video-showcase-heading" className={styles.heading}>
              Lerne das sTread Pro kennen!
            </h2>
            <p className={styles.subtext}>
              Unser Trainer Patricio zeigt dir, was das sTread pro draufhat –
              alle Highlights und Features auf einen Blick.
            </p>
          </div>

          <div ref={cardRef} className={styles.card}>
            {/* TODO: swap poster.jpg with real MP4 */}
            <img
              className={styles.poster}
              src="/images/video-showcase/poster.webp"
              alt="Trainer Patricio stellt das sTread Pro Laufband vor"
              loading="lazy"
              decoding="async"
            />

            {/* Presentational only — there is no video to control yet. */}
            <div ref={playRef} className={styles.control} aria-hidden="true">
              <svg
                className={styles.playIcon}
                viewBox="0 0 20.48 23.04"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0L20.48 11.52L0 23.04Z" fill="#ffffff" />
              </svg>
            </div>

            <div ref={pauseRef} className={styles.control} aria-hidden="true">
              <span className={styles.pauseBars}>
                <span className={styles.pauseBar} />
                <span className={styles.pauseBar} />
              </span>
            </div>

            <div ref={railRef} className={styles.progressTrack}>
              <div ref={fillRef} className={styles.progressFill} />
            </div>
          </div>

          <div className={styles.buyBar}>
            <span className={styles.buyThumbRing} />
            <img
              className={styles.buyThumb}
              src="/images/video-showcase/sticky-thumb.webp"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <p className={styles.buyTitle}>
              sTread Pro Laufband · 21,5&quot; Display / Neu
            </p>
            <p className={styles.buyPrice}>2.179 € · Oder ab 181,58 €/Monat</p>
            <button type="button" className={styles.buyCta}>
              Jetzt auswählen &nbsp;›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VideoShowcase;
