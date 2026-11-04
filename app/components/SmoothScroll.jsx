/**
 * SmoothScroll
 *
 * Lenis smooth scrolling, wired into GSAP's ticker and ScrollTrigger.
 *
 * Source: prototype/js/app.js:3 — verbatim —
 *   lenis = new Lenis({
 *     duration: 1.1,
 *     easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
 *   });
 *   lenis.on('scroll', ScrollTrigger.update);
 *   gsap.ticker.add(t => lenis.raf(t * 1000));
 *   gsap.ticker.lagSmoothing(0);
 *
 * NOTE: duration + easing, NOT lerp. Lenis runs in duration mode here —
 * every wheel impulse eases to its target over 1.1s on an expo-out curve
 * (2^-10t, normalised by 1.001 so it lands exactly on 1). lerp mode would
 * instead chase the target by a fixed fraction per frame and never settle
 * on the same curve, so the two are not interchangeable: the scrub feel of
 * every pinned section below depends on this easing.
 *
 * Renders nothing. Mounted once at the root so every scroll-driven section
 * shares one scroller — do NOT instantiate Lenis inside individual sections.
 *
 * Disabled entirely under prefers-reduced-motion, matching the prototype
 * (`if (!RM)` guard), so the page falls back to native scrolling.
 */

import {useEffect} from 'react';

export function SmoothScroll() {
  useEffect(() => {
    // Bail out for users who asked for less motion — prototype/js/app.js L2.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lenis;
    let gsap;
    let ScrollTrigger;
    let tickerFn;
    let cancelled = false;

    // Dynamic import keeps Lenis and GSAP out of the SSR/worker bundle.
    (async () => {
      const [lenisMod, gsapMod, stMod] = await Promise.all([
        import('@studio-freight/lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      const Lenis = lenisMod.default;
      gsap = gsapMod.default ?? gsapMod.gsap;
      ScrollTrigger = stMod.default ?? stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      window.lenis = lenis;

      lenis.on('scroll', ScrollTrigger.update);
      tickerFn = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      if (gsap && tickerFn) gsap.ticker.remove(tickerFn);
      if (gsap) gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
      if (lenis) {
        lenis.destroy();
        if (window.lenis === lenis) delete window.lenis;
      }
    };
  }, []);

  return null;
}

export default SmoothScroll;
