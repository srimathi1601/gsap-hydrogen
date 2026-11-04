/**
 * SubNav - sticky product bar
 *
 * Source: prototype/js/sections.js -> SECTIONS.dtop
 *           /Sub-nav – sticky product bar (17 nodes, 1920 x 71 at y 145)
 *         prototype/index.html:8 -> nav.m-sub
 *
 * PDP route only (approved Q6) - mounted in app/routes/($locale)._index.jsx
 * directly under SiteHeader.
 *
 * Animations: none. Sticking is CSS `position: sticky; top: 0` (approved
 * Q4) - the prototype's per-frame translateY hack at app.js:60-66 exists
 * only because its stage is inside a CSS transform, and is not reproduced.
 *
 * Assets: none.
 *
 * DROPPED (approved Q5): the node after "Technische Daten" renders the
 * literal string "Se" - its Figma layer is named
 * `"Se…" (clipped in recording)`, i.e. the label was truncated when the
 * design was captured. prototype/index.html:8 ships no such item either.
 * TODO: restore when real copy is available.
 *
 * Anchor targets match the section ids on this route and the prototype's
 * own mobile sub-nav (prototype/index.html:8).
 */

import styles from './SubNav.module.css';

const LINKS = [
  {label: 'Features', href: '#kf'},
  {label: 'Sportstech Live', href: '#live'},
  {label: 'Bewertungen', href: '#rev'},
  {label: 'FAQ', href: '#faq'},
  {label: 'Technische Daten', href: '#tech'},
];

export function SubNav() {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <p className={styles.product}>sTread Pro Laufband</p>

        <nav className={styles.links} aria-label="Produktabschnitte">
          {LINKS.map((l) => (
            <a key={l.href} className={styles.link} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <p className={styles.prices}>
          <s className={styles.was}>2.758,80 €</s>
          <span className={styles.now}>2.179 €</span>
          <span className={styles.saving}>579,80 € gespart</span>
        </p>

        <button type="button" className={styles.cta}>
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}

export default SubNav;
