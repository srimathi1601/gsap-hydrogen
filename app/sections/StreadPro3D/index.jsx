/**
 * StreadPro3D — "STREAD PRO IN 3D" pinned 5-step showcase
 *
 * Figma desktop: OI4fY2NSIR5YSdxxSIG6jY?node-id=34-2 / 34-54 / 34-106 / 34-159 / 34-211
 * Figma mobile:  OI4fY2NSIR5YSdxxSIG6jY?node-id=34-308 / 34-353 / 34-398 / 34-444 / 34-489
 * Dev notes:     OI4fY2NSIR5YSdxxSIG6jY?node-id=34-579 (desktop) / 34-587 (mobile)
 * Reference:     none supplied — every animation value below traces to a dev note.
 *
 * Animations:
 *   Section pin — CSS position:sticky, NOT ScrollTrigger pin
 *     trigger: section   start: "top top"   end: "bottom bottom"
 *     scrub: 0.6         pin: false (sticky owns it)
 *     travel: 500svh desktop / 400svh mobile, set via --sp3d-travel
 *     mobile: ignoreMobileResize: true
 *     SOURCE: Figma dev note 34:581 — "PIN: section pins at top:0 for 5 x 100vh
 *             scroll (ScrollTrigger pin:true, scrub:0.6). Header + stat pills
 *             stay; only Stage content changes."
 *     RETUNE: prototype/js/engine.js mountPinned() holds the stage with
 *             .pinbox{position:sticky} and never calls ScrollTrigger's pin,
 *             so this was switched from pin:true to match. Canvas height
 *             retuned 1471px (Figma frame) -> 1182px (SECTIONS.d3d.H).
 *
 *   Step switch (progress 0-1 mapped to 5 steps)
 *     image: crossfade + scale 1.04 -> 1 + y 40 -> 0
 *     title/body/tags: y 24 -> 0 + fade, stagger 0.06s
 *     duration 0.6s, ease power2.inOut, never hard-swap
 *     SOURCE: Figma dev note 34:582
 *
 *   Active tab pill
 *     translateX = stepIndex * 180px, 600ms power2.inOut
 *     inner bar fills 0 -> 100% with scroll progress through the step
 *     mobile: active dot stretches 10 -> 40px (CSS transition)
 *     SOURCE: Figma dev note 34:583
 *
 *   Reduced motion: fade only (no scale, no y, no stagger)
 *     SOURCE: Figma dev note 34:586
 *
 * Assets:
 *   ✅ step-01..05.png → /images/stread-pro-3d/  (1768x1116 source, ~2.5x the
 *      695x538 desktop slot; mobile reuses the identical source files)
 *   ✅ 7 icons → app/assets/icons/stread-pro-3d-*.svg (saved verbatim from
 *      Figma; inlined below with currentColor so the active tab can flip to
 *      white as the design specifies — path data is unchanged)
 *   ⬜ Transition clips not used — crossfade stands in (approved).
 *
 * Mobile: stacked per Figma mobile frame, stats 2x2, image 350x270,
 *         pin 4 x 100svh, ignoreMobileResize.
 */

import {useRef, useState, useCallback} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './StreadPro3D.module.css';

/* ── Icons — exact path data from Figma, stroke switched to currentColor ── */

function IconDisplay(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M14.25 3H3.75C2.92157 3 2.25 3.67157 2.25 4.5V10.5C2.25 11.3284 2.92157 12 3.75 12H14.25C15.0784 12 15.75 11.3284 15.75 10.5V4.5C15.75 3.67157 15.0784 3 14.25 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 15H12M9 12V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLiveApp(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M6 3.75L14.25 9L6 14.25V3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSteigung(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M2.25 14.25L15.75 5.25M11.25 5.25H15.75V9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTempo(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconKlappbar(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M3 13.5H15M5.25 13.5L12.75 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowPrev(props) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M12.5 5L7.5 10L12.5 15"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowNext(props) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Content — verbatim from Figma ── */

const STATS = [
  {value: '20 km/h', label: 'Höchstgeschwindigkeit'},
  {value: '21,5″', label: 'Touch-Display, 360° drehbar'},
  {value: '12 %', label: 'Steigung in 15 Stufen'},
  {value: '150 × 50 cm', label: 'Lauffläche'},
];

const STEPS = [
  {
    id: 'display',
    tab: 'Display',
    Icon: IconDisplay,
    counter: '01 / 05',
    title: '360° drehbares 21,5″ Display',
    body: 'Mit dem 360 Grad schwenkbaren Touch-Display sind deine Workouts so flexibel wie nie!',
    tags: ['21,5" Touch-Display', '360° schwenkbar'],
    image: '/images/stread-pro-3d/step-01.png',
    alt: 'sTread Pro Laufband mit 360 Grad schwenkbarem 21,5 Zoll Touch-Display',
  },
  {
    id: 'live-app',
    tab: 'Live App',
    Icon: IconLiveApp,
    counter: '02 / 05',
    title: 'Dein Kurs ist direkt dabei',
    body: 'Workouts per Fingertipp in der integrierten Live App – mit Sound in Studioqualität.',
    tags: ['Kurse, Games & Streaming', 'Persönlicher KI-Coach'],
    image: '/images/stread-pro-3d/step-02.png',
    alt: 'sTread Pro Laufband von vorne mit laufendem Kurs in der Live App',
  },
  {
    id: 'steigung',
    tab: 'Steigung',
    Icon: IconSteigung,
    counter: '03 / 05',
    title: 'Bis 12 % Steigung',
    body: 'Mit 15 Steigungsstufen passt du dein Training individuell an und forderst dich immer wieder neu heraus.',
    tags: ['Automatisch in 15 Stufen', 'Per Drehregler'],
    image: '/images/stread-pro-3d/step-03.png',
    alt: 'sTread Pro Laufband seitlich mit aufgestellter Lauffläche bei 12 Prozent Steigung',
  },
  {
    id: 'tempo',
    tab: 'Tempo',
    Icon: IconTempo,
    counter: '04 / 05',
    title: 'Tempo in einer Drehung',
    body: '7-PS-Motor, bis 20 km/h: Das Tempo regelst du direkt am Speed Knob, ohne Tastensuche.',
    tags: ['7 PS', '20 km/h'],
    image: '/images/stread-pro-3d/step-04.png',
    alt: 'Nahaufnahme des Bedienfelds und Speed Knob am sTread Pro Laufband',
  },
  {
    id: 'klappbar',
    tab: 'Klappbar',
    Icon: IconKlappbar,
    counter: '05 / 05',
    title: 'Klein klappen, groß trainieren',
    body: 'Zusammengeklappt nur 114 cm tief und mit Transportrollen im Nu verstaut.',
    tags: ['Aufgebaut 182 × 87,5 cm', 'Eingeklappt 114 × 87,5 cm'],
    image: '/images/stread-pro-3d/step-05.png',
    alt: 'sTread Pro Laufband zusammengeklappt zum Verstauen',
  },
];

const TAB_STRIDE = 180; // 172px tab + 8px gap — Figma 36:8
const TAB_WIDTH = 172;

export function StreadPro3D() {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const copyRefs = useRef([]);
  const pillRef = useRef(null);
  const barRef = useRef(null);
  const triggerRef = useRef(null);
  const currentRef = useRef(0);

  const [active, setActive] = useState(0);

  /* Tab / dot / arrow click -> scrollTo that step's start.
     SOURCE: Figma dev note 34:583 — "Tab/dot click -> scrollTo step start;
     ‹ › -> prev/next." */
  const scrollToStep = useCallback((index) => {
    const st = triggerRef.current;
    if (!st) return;
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    const span = st.end - st.start;
    const target = st.start + (span * clamped) / STEPS.length + 2;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: target, behavior: reduced ? 'auto' : 'smooth'});
  }, []);

  const handleTabKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollToStep(currentRef.current + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollToStep(currentRef.current - 1);
      }
    },
    [scrollToStep],
  );

  useGSAP(
    () => {
      // ✅ Register inside useGSAP — SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const panels = panelRefs.current.filter(Boolean);
      const medias = mediaRefs.current.filter(Boolean);
      const copies = copyRefs.current.filter(Boolean);
      if (!panels.length) return;

      const DUR = 0.6; // SOURCE: dev note 34:582 — "600ms ease-in-out"
      const EASE = 'power2.inOut';

      /** Crossfade to a step. Never hard-swaps — dev note 34:582. */
      const goTo = (index) => {
        const previous = currentRef.current;
        if (index === previous) return;
        currentRef.current = index;
        setActive(index);

        panels.forEach((panel, i) => {
          gsap.killTweensOf(panel);
          if (i === index) {
            gsap.to(panel, {autoAlpha: 1, duration: DUR, ease: EASE});
          } else {
            gsap.to(panel, {autoAlpha: 0, duration: DUR, ease: EASE});
          }
        });

        const media = medias[index];
        const copyKids = copies[index]
          ? Array.from(copies[index].children)
          : [];

        if (prefersReduced) {
          // Fade only — dev note 34:586
          if (media) {
            gsap.killTweensOf(media);
            gsap.set(media, {scale: 1, y: 0});
          }
          if (copyKids.length) {
            gsap.killTweensOf(copyKids);
            gsap.set(copyKids, {y: 0, autoAlpha: 1});
          }
        } else {
          if (media) {
            gsap.killTweensOf(media);
            gsap.fromTo(
              media,
              {scale: 1.04, y: 40},
              {scale: 1, y: 0, duration: DUR, ease: EASE},
            );
          }
          if (copyKids.length) {
            gsap.killTweensOf(copyKids);
            gsap.fromTo(
              copyKids,
              {y: 24, autoAlpha: 0},
              {
                y: 0,
                autoAlpha: 1,
                duration: DUR,
                ease: EASE,
                stagger: 0.06,
              },
            );
          }
        }

        // Active pill slides under the tabs — dev note 34:583
        if (pillRef.current) {
          gsap.killTweensOf(pillRef.current);
          gsap.to(pillRef.current, {
            x: index * TAB_STRIDE,
            duration: prefersReduced ? 0 : DUR,
            ease: EASE,
          });
        }
      };

      /** Builds the scroll trigger for one breakpoint. */
      const build = ({isMobile}) => {
        // Initial state: step 01 shown, the rest hidden.
        gsap.set(panels, {autoAlpha: 0});
        gsap.set(panels[0], {autoAlpha: 1});
        gsap.set(medias, {scale: 1, y: 0});
        copies.forEach((copy) => {
          if (copy) gsap.set(Array.from(copy.children), {y: 0, autoAlpha: 1});
        });
        if (pillRef.current) gsap.set(pillRef.current, {x: 0});
        currentRef.current = 0;
        setActive(0);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            // Sticky (CSS) holds the composition in place, so ScrollTrigger
            // only drives the timeline — no pin, matching the prototype's
            // mountPinned(). The section is 100svh + travel tall, so
            // "top top" -> "bottom bottom" spans exactly --sp3d-travel.
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6, // smooth forward AND backward — dev note 34:581
            invalidateOnRefresh: true,
            ...(isMobile ? {ignoreMobileResize: true} : {}),
          },
          // Reading progress off the timeline (not the ScrollTrigger) means the
          // value is already scrub-smoothed, so step switches inherit the 0.6 lag.
          onUpdate: () => {
            const progress = timeline.progress();
            const raw = progress * STEPS.length;
            const index = Math.min(STEPS.length - 1, Math.floor(raw));
            const within = Math.min(1, Math.max(0, raw - index));

            if (barRef.current) {
              gsap.set(barRef.current, {width: within * TAB_WIDTH});
            }
            if (index !== currentRef.current) goTo(index);
          },
        });

        // Dummy tween gives the timeline length so `scrub` has a playhead to lag.
        timeline.to({}, {duration: STEPS.length});

        triggerRef.current = timeline.scrollTrigger;

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          triggerRef.current = null;
        };
      };

      const mm = gsap.matchMedia();

      // ── DESKTOP / TABLET ≥768 ── 5 x 100vh travel (CSS --sp3d-travel)
      mm.add('(min-width: 768px)', () => build({isMobile: false}));

      // ── MOBILE <768 ── shorter travel, 4 x 100svh — dev note 34:585
      mm.add('(max-width: 767px)', () => build({isMobile: true}));

      return () => mm.revert();
    },
    {scope: rootRef},
  );

  const activeStep = STEPS[active];

  return (
    <section
      ref={rootRef}
      className={styles.section}
      aria-labelledby="stread-pro-3d-heading"
    >
      <div className={styles.pin}>
        <div className={styles.composition}>
          {/* ── HEADER — Figma 34:5 ── */}
          <header className={styles.header}>
            <span className={styles.eyebrow}>STREAD PRO IN 3D</span>
            <h2 id="stread-pro-3d-heading" className={styles.heading}>
              Studio-Laufgefühl für zu Hause.
            </h2>
            <p className={styles.sub}>
              Scrolle durch Display, Live App, Steigung, Drehregler und
              Klappfunktion – am 3D-Modell, das du jederzeit selbst drehen
              kannst.
            </p>
          </header>

          {/* ── STATS — Figma 34:10 ── */}
          <ul className={styles.stats}>
            {STATS.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>

          {/* ── STAGE — Figma 34:27 — five panels stacked for crossfade ── */}
          <div className={styles.stage}>
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className={styles.panel}
                id={`stread-pro-3d-panel-${step.id}`}
                role="tabpanel"
                aria-labelledby={`stread-pro-3d-tab-${step.id}`}
                aria-hidden={i !== active}
              >
                <div
                  ref={(el) => {
                    mediaRefs.current[i] = el;
                  }}
                  className={styles.panelMedia}
                >
                  {/* SWAP: replace crossfade with MP4/canvas sequence when clip is ready */}
                  {/* TODO: swap to GLB when 3D model is ready */}
                  <img
                    src={step.image}
                    alt={step.alt}
                    width="695"
                    height="538"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>

                <p className={styles.panelCounter}>{step.counter}</p>

                <div
                  ref={(el) => {
                    copyRefs.current[i] = el;
                  }}
                  className={styles.panelCopy}
                >
                  <h3 className={styles.panelTitle}>{step.title}</h3>
                  <p className={styles.panelBody}>{step.body}</p>
                  <ul className={styles.tags}>
                    {step.tags.map((tag) => (
                      <li key={tag} className={styles.tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* ── NAVIGATOR — DESKTOP — Figma 36:2 ── */}
          <div className={styles.navDesktop}>
            <p className={styles.stepCount} aria-live="polite">
              Schritt {active + 1} von {STEPS.length}
            </p>
            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => scrollToStep(active - 1)}
                disabled={active === 0}
                aria-label="Vorheriger Schritt"
              >
                <IconArrowPrev />
              </button>

              <div
                className={styles.tabs}
                role="tablist"
                aria-label="sTread Pro in 3D – Schritte"
              >
                <div ref={pillRef} className={styles.activePill}>
                  <span ref={barRef} className={styles.activeProgress} />
                </div>

                {STEPS.map((step, i) => {
                  const Icon = step.Icon;
                  const isActive = i === active;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      id={`stread-pro-3d-tab-${step.id}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`stread-pro-3d-panel-${step.id}`}
                      tabIndex={isActive ? 0 : -1}
                      className={`${styles.tab} ${
                        isActive ? styles.tabActive : ''
                      }`}
                      style={{left: `${i * TAB_STRIDE}px`}}
                      onClick={() => scrollToStep(i)}
                      onKeyDown={handleTabKeyDown}
                    >
                      <Icon className={styles.tabIcon} />
                      {step.tab}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.navButton}
                onClick={() => scrollToStep(active + 1)}
                disabled={active === STEPS.length - 1}
                aria-label="Nächster Schritt"
              >
                <IconArrowNext />
              </button>
            </div>
          </div>

          {/* ── NAVIGATOR — MOBILE — Figma 36:36 ── */}
          <div className={styles.navMobile}>
            <div className={styles.navMobileRow}>
              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonMobile}`}
                onClick={() => scrollToStep(active - 1)}
                disabled={active === 0}
                aria-label="Vorheriger Schritt"
              >
                <IconArrowPrev />
              </button>

              <div className={styles.navCurrent}>
                <span
                  className={`${styles.stepCount} ${styles.stepCountMobile}`}
                  aria-live="polite"
                >
                  Schritt {active + 1} von {STEPS.length}
                </span>
                <span className={styles.navCurrentLabel}>
                  <activeStep.Icon className={styles.tabIcon} />
                  {activeStep.tab}
                </span>
              </div>

              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonMobile}`}
                onClick={() => scrollToStep(active + 1)}
                disabled={active === STEPS.length - 1}
                aria-label="Nächster Schritt"
              >
                <IconArrowNext />
              </button>
            </div>

            <div className={styles.dots}>
              {STEPS.map((step, i) => (
                <button
                  key={step.id}
                  type="button"
                  className={styles.dotHit}
                  onClick={() => scrollToStep(i)}
                  aria-label={`Schritt ${i + 1}: ${step.tab}`}
                  aria-current={i === active}
                >
                  <span
                    className={`${styles.dot} ${
                      i === active ? styles.dotActive : ''
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StreadPro3D;
