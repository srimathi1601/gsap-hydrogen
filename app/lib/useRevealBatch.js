/**
 * useRevealBatch
 *
 * The staggered entrance the prototype applies to its static sections.
 *
 * SOURCE: prototype/js/app.js:87 — verbatim:
 *
 *   ScrollTrigger.batch(kids, {
 *     start: 'top 92%',
 *     once: true,
 *     onEnter: b => gsap.fromTo(b,
 *       {y: 40, opacity: 0},
 *       {y: 0, opacity: 1, duration: .8, ease: 'power3.out',
 *        stagger: .08, overwrite: 'auto', clearProps: 'transform'}),
 *   })
 *
 * and prototype/js/app.js:95 for the mobile equivalent, which uses the same
 * numbers on `.m-sec > *` / `.m-foot > *`.
 *
 * `once: true` means this plays forward only — it does NOT reverse on scroll
 * up. That is the prototype's behaviour, not an oversight.
 *
 * Disabled entirely under prefers-reduced-motion (app.js:87 guards with
 * `if (!RM && !QCM)`), in which case the elements are simply left alone and
 * stay at their natural opacity.
 *
 * Usage: pass a ref to the container whose DIRECT children should stagger in.
 *
 *   const ref = useRevealBatch();
 *   return <section ref={ref}>…</section>;
 */

import {useRef} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function useRevealBatch() {
  const ref = useRef(null);

  useGSAP(
    () => {
      // ✅ Register inside useGSAP — SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const host = ref.current;
      if (!host) return;

      const kids = Array.from(host.children);
      if (!kids.length) return;

      const batch = ScrollTrigger.batch(kids, {
        start: 'top 92%',
        once: true,
        onEnter: (targets) =>
          gsap.fromTo(
            targets,
            {y: 40, opacity: 0},
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.08,
              overwrite: 'auto',
              clearProps: 'transform',
            },
          ),
      });

      return () => batch.forEach((t) => t.kill());
    },
    {scope: ref},
  );

  return ref;
}

export default useRevealBatch;
