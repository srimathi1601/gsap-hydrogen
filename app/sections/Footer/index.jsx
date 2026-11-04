/**
 * Footer - site footer
 *
 * Source: prototype/js/sections.js -> SECTIONS.dfoot (59 nodes, 1920 x 1331)
 *         prototype/index.html:42-44 -> footer.m-foot
 *         prototype/fig/ad0e262864c6.webp -> public/images/footer/pay-row.webp
 *         prototype/fig/6a4c6dc9f061.webp -> public/images/footer/social-row.webp
 *
 * REBUILT 2026-11-04 from the flat `s_footer.jpg` slab. Hand-written
 * semantic responsive markup (approved Q1b).
 *
 * -- Animation ---------------------------------------------------------
 *   Staggered reveal of the footer's direct children:
 *   start 'top 92%' - once:true - y 40 -> 0 - 0.8s power3.out - stagger .08
 *   SOURCE: prototype/js/app.js:87 (dfoot is in the reveal list) and
 *   app.js:95 for `.m-foot > *`. See app/lib/useRevealBatch.js.
 *
 * -- Structure ---------------------------------------------------------
 *   The desktop node data lays the categories out as two 8-item columns at
 *   x 150 and x 561 under a single "Kategorien" label; mobile
 *   (index.html:43) merges them into one 16-item <details>. Rendered here as
 *   one list that splits into two CSS columns on wide screens - identical
 *   on both, one source of truth.
 *
 *   On mobile the link columns become native <details>, matching
 *   .m-fcol (prototype/index.html:43, css/mobile.css:63). The same markup
 *   stays open and un-collapsible on desktop via `open` + CSS.
 *
 * -- Not yet functional -------------------------------------------------
 *   Every link is href="#" in the prototype (40 placeholders page-wide).
 *   TODO: wire the footer links to real routes.
 */

import {Stars} from '~/components/icons/Stars';
import {useRevealBatch} from '~/lib/useRevealBatch';
import styles from './Footer.module.css';

/* /Kategorien — the x 150 and x 561 columns, in reading order */
const CATEGORIES = [
  'Laufbänder',
  'Bikes & Ergometer',
  'Crosstrainer',
  'Vibrationsplatten',
  'Zubehör',
  'Kraftstationen',
  'Hanteln',
  'Speedbikes',
  'Walking Pads',
  'Rudergeräte',
  'Krafttraining',
  'Bundles',
  '2in1-Laufbänder',
  'Hantelbänke',
  'Klimmzugstangen',
  'Ergometer',
];

const HELP = ['Kundenservice', 'Versandarten'];
const COMPANY = ['Blog', 'Affiliate Programm', 'Jobs & Karriere'];

/* /Allgemeine Geschäftsbedingungen — one text node on desktop, six links in
   the mobile markup (index.html:44). The mobile split is used. */
const LEGAL = [
  'Allgemeine Geschäftsbedingungen',
  'Sportstech Live Datenschutzerklärung',
  'Datenschutzerklärung',
  'Widerrufsbelehrung',
  'Impressum',
  'Cookie Einstellungen',
];

function LinkColumn({title, links, wide}) {
  return (
    <details
      className={`${styles.column} ${wide ? styles.columnWide : ''}`}
      open
    >
      <summary className={styles.columnSummary}>{title}</summary>
      <p className={styles.columnTitle}>{title}</p>
      <ul
        className={`${styles.columnList} ${wide ? styles.columnListSplit : ''}`}
      >
        {links.map((l) => (
          <li key={l}>
            {/* TODO: wire the footer links to real routes. */}
            <a href="#top">{l}</a>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Footer() {
  const revealRef = useRevealBatch();

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.inner} ref={revealRef}>
        <div className={styles.top}>
          <div>
            <p className={styles.bigline}>
              Trainingstipps, neue
              <br />
              Geräte und Angebote –
              <br />
              einmal pro Woche
            </p>
            {/* TODO: wire the newsletter sign-up. */}
            <a className={styles.newsletter} href="#footer">
              Zum Newsletter anmelden
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div>
            <p className={styles.label}>Persönliche Beratung</p>
            <a className={styles.phone} href="tel:03088626444">
              030 88626444
            </a>
            <p className={styles.contactNote}>
              Wir helfen dir, das passende Gerät zu finden.
            </p>

            <div className={styles.trust}>
              <p className={styles.trustTitle}>Hervorragend</p>
              <Stars
                className={styles.trustStars}
                label="4,3 von 5 Sternen bei Trustpilot"
              />
              <p className={styles.trustMeta}>4,3 / 5 · 8.291 Bewertungen</p>
              <p className={styles.trustBrand}>★ Trustpilot</p>
            </div>
          </div>
        </div>

        <div className={styles.columns}>
          <LinkColumn title="Kategorien" links={CATEGORIES} wide />
          <LinkColumn title="Hilfe" links={HELP} />
          <LinkColumn title="Sportstech" links={COMPANY} />
        </div>

        <div className={styles.rows}>
          <div className={styles.payRow}>
            <p className={styles.label}>Sichere Zahlung</p>
            <img
              src="/images/footer/pay-row.webp"
              alt="Akzeptierte Zahlungsarten"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className={styles.socialRow}>
            <p className={styles.label}>Folge uns</p>
            <img
              src="/images/footer/social-row.webp"
              alt="Sportstech in sozialen Netzwerken"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className={styles.legal}>
          <p className={styles.copyright}>© 2026 Sportstech</p>
          {LEGAL.map((l) => (
            <a key={l} href="#footer">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;

// Named alias used by app/components/PageLayout.jsx, where this renders as
// site chrome next to <SiteHeader />.
export {Footer as SiteFooter};
