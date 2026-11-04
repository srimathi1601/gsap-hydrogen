/**
 * StickyBuyBar - the global #gbar buy bar
 *
 * Source: prototype/js/app.js:81-85 (desktop) and app.js:93-94 (mobile)
 *         prototype/js/sections.js -> SECTIONS.dvid /Sticky buy bar
 *         prototype/css/site.css:11-12, prototype/css/mobile.css:65-68
 *         prototype/fig/20a48257eb85.webp
 *           -> public/images/video-showcase/sticky-thumb.webp
 *
 * NEW 2026-11-04 - not present in the earlier build.
 *
 * The prototype builds the desktop bar by CLONING the dvid sticky-bar nodes
 * into #gbar (app.js:81), and injects entirely different markup for mobile
 * (app.js:93). Rebuilt here as ONE responsive component (approved Q2); the
 * CSS swaps the geometry at 768px.
 *
 * -- Visibility --------------------------------------------------------
 *   Desktop, SOURCE prototype/js/app.js:83-85:
 *     pastBuy  - ScrollTrigger on #top, start 'top top', end 'bottom 30%':
 *                onLeave -> true, onEnterBack -> false
 *     inVid    - ScrollTrigger on #vid, start 'top bottom',
 *                end 'bottom top', onToggle -> isActive
 *     shown    = pastBuy && !inVid
 *   The bar hides over the video section because that section carries its
 *   own identical bar inside its composition.
 *
 *   Mobile, SOURCE prototype/js/app.js:94:
 *     ScrollTrigger on #buybox, start 'bottom top', end '+=1e6'
 *   #buybox is the mobile buy-box id; here the same element is
 *   ProductGalleryBuybox's `#top`, so the desktop rule covers both and the
 *   mobile branch only differs in dropping the video exclusion.
 *
 * -- Transition --------------------------------------------------------
 *   CSS transform 0.5s cubic-bezier(.16, 1, .3, 1) - prototype/css/site.css:12.
 *   Not a GSAP tween in the prototype either.
 *
 * -- Accessibility -----------------------------------------------------
 *   The prototype marks the wrapper `aria-hidden="true"` (index.html:45)
 *   and then injects a real <button> into it - focusable content inside an
 *   aria-hidden subtree, which is a WCAG 4.1.2 violation. Fixed here with
 *   `inert` while the bar is off-screen, so the CTA leaves the tab order
 *   and the accessibility tree together, and rejoins both when shown.
 */

import {useRef, useState} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './StickyBuyBar.module.css';

export function StickyBuyBar() {
  const rootRef = useRef(null);
  const [shown, setShown] = useState(false);

  useGSAP(
    () => {
      // Register inside useGSAP - SSR / Hydrogen worker safe
      gsap.registerPlugin(ScrollTrigger);

      // `shown = pastBuy && !inVid` - app.js:83
      let pastBuy = false;
      let inVid = false;
      const update = () => setShown(pastBuy && !inVid);

      const triggers = [];

      const top = document.getElementById('top');
      if (top) {
        triggers.push(
          ScrollTrigger.create({
            trigger: top,
            start: 'top top',
            end: 'bottom 30%',
            onLeave: () => {
              pastBuy = true;
              update();
            },
            onEnterBack: () => {
              pastBuy = false;
              update();
            },
          }),
        );
      }

      const vid = document.getElementById('vid');
      if (vid) {
        triggers.push(
          ScrollTrigger.create({
            trigger: vid,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              inVid = self.isActive;
              update();
            },
          }),
        );
      }

      return () => triggers.forEach((t) => t.kill());
    },
    {scope: rootRef},
  );

  return (
    <div
      ref={rootRef}
      className={`${styles.bar} ${shown ? styles.barShown : ''}`}
      // Keeps the CTA out of the tab order AND the a11y tree while parked
      // off-screen. See the note in the header about the prototype's bug.
      inert={shown ? undefined : ''}
    >
      <div className={styles.inner}>
        <span className={styles.thumbRing}>
          <img
            className={styles.thumb}
            src="/images/video-showcase/sticky-thumb.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>

        <span className={styles.copy}>
          <span className={styles.title}>
            sTread Pro Laufband · 21,5&quot; Display / Neu
          </span>
          <span className={styles.price}>2.179 € · Oder ab 181,58 €/Monat</span>
        </span>

        {/* TODO: wire to the Shopify cart. */}
        <button type="button" className={styles.cta}>
          Jetzt auswählen &nbsp;›
        </button>
      </div>
    </div>
  );
}

export default StickyBuyBar;
