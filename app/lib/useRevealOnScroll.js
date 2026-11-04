/**
 * useRevealOnScroll
 *
 * The prototype's `.rv` reveal, shared by the static slab sections.
 *
 * Source: prototype/js/app.js (last line before the load handler) —
 *   document.querySelectorAll('.rv').forEach(el => {
 *     if (RM) return;
 *     gsap.from(el, {y:60, opacity:0, duration:1, ease:'power3.out',
 *       scrollTrigger:{trigger: el, start:'top 88%'}});
 *   });
 *
 * Note: no `scrub` and no `toggleActions`, so this plays once on the way
 * down and does NOT reverse on the way back up. That matches the prototype.
 * Skipped entirely under prefers-reduced-motion.
 *
 * @param {import('react').RefObject<HTMLElement>} ref element to reveal
 */

import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function useRevealOnScroll(ref) {
  useGSAP(
    () => {
      // ✅ Register inside useGSAP — SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!ref.current) return;

      gsap.from(ref.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {trigger: ref.current, start: 'top 88%'},
      });
    },
    {scope: ref},
  );
}
