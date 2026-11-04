/**
 * PromoBar - "OKTOBER-FIT DAYS"
 *
 * Source: prototype/js/sections.js -> SECTIONS.dtop
 *           /Promo bar – OKTOBER-FIT DAYS (21 nodes, 1920 x 47)
 *         prototype/index.html:5 -> div.m-promo
 *
 * PDP route only (approved Q6) - mounted in app/routes/($locale)._index.jsx
 * above SiteHeader, matching the prototype's page order.
 *
 * Animations: none.
 * Assets: one inline SVG arrow. No image files.
 *
 * Time-bound content is deliberately NOT built (approved Q7):
 *   - the four countdown chips (/Countdown T | STD | MIN | SEK)
 *   - any estimated delivery date
 *   - any stock count
 * prototype/js/app.js:38-39 strips exactly these at runtime under the same
 * rule, and prototype/index.html:5 omits them from the mobile markup.
 * TODO: add real delivery dates from Shopify metafields.
 */

import {ArrowIcon} from '~/components/icons/PdpIcons';
import styles from './PromoBar.module.css';

export function PromoBar() {
  return (
    // NOT an <aside>: the Hydrogen scaffold styles the bare `aside`
    // element as its off-canvas drawer (app/styles/app.css:87 —
    // position:fixed, height:100vh, width:min(400px,100vw), right:-400px),
    // which turned this bar into a 400px navy column. A plain <div> with
    // an aria-label is the right element for a promo banner anyway.
    <div className={styles.bar} role="note" aria-label="Aktion">
      <div className={styles.inner}>
        <p className={styles.message}>
          <span className={styles.headline}>OKTOBER-FIT DAYS</span>
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
          <span className={styles.subline}>5 % SPAREN MIT CODE</span>
        </p>
        <span className={styles.code}>OKTOBER5</span>
        {/* Decorative: the prototype wires no handler to this arrow and
            there is only one promo message, so a <button> would be a dead
            control. See the note on .arrow in the module CSS. */}
        <ArrowIcon className={styles.arrow} />
      </div>
    </div>
  );
}

export default PromoBar;
