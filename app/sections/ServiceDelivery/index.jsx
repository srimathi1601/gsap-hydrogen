/**
 * ServiceDelivery - "Lieferung, Garantie & Service"
 *
 * Source: prototype/js/sections.js -> SECTIONS.dsvc (55 nodes, 1920 x 1125)
 *         prototype/index.html:39-41 -> section.m-sec#svc
 *
 * REBUILT 2026-11-04 from the flat `s_service.jpg` slab. Hand-written
 * semantic responsive markup (approved Q1b).
 *
 * -- Animation ---------------------------------------------------------
 *   Staggered reveal of the section's direct children:
 *   start 'top 92%' - once:true - y 40 -> 0 - 0.8s power3.out - stagger .08
 *   SOURCE: prototype/js/app.js:87. See app/lib/useRevealBatch.js.
 *   Nothing else moves.
 *
 * -- Deliberate omission ------------------------------------------------
 *   The first item's body reads, in the node data:
 *     "Voraussichtl. Lieferdatum: 05.11.–09.11.2026 · Per Spedition bis zur
 *      Bordsteinkante, Termin nach Absprache."
 *   The date prefix is dropped (approved Q7). prototype/js/app.js:39 does
 *   exactly this at runtime - it strips the leading
 *   `Voraussichtl. Lieferdatum: … · ` and re-capitalises the remainder -
 *   and prototype/index.html:40 ships no date either.
 *   TODO: add real delivery dates from Shopify metafields.
 *
 * Assets: none - all icons are inline SVG from app/components/icons.
 */

import {
  TruckIcon,
  UndoIcon,
  ShieldIcon,
  HeadsetIcon,
  DocIcon,
} from '~/components/icons/PdpIcons';
import {useRevealBatch} from '~/lib/useRevealBatch';
import styles from './ServiceDelivery.module.css';

export function ServiceDelivery() {
  const revealRef = useRevealBatch();

  return (
    <section className={styles.section} id="svc" aria-labelledby="svc-heading">
      <div className={styles.inner} ref={revealRef}>
        <div className={styles.head}>
          <h2 id="svc-heading" className={styles.heading}>
            Lieferung, Garantie &amp; Service
          </h2>
          <p className={styles.lede}>Alles Wichtige rund um deine Bestellung.</p>
        </div>

        {/* Card – INKLUSIVE */}
        <div className={styles.card}>
          <span className={`${styles.badge} ${styles.badgeTinted}`}>
            INKLUSIVE
          </span>

          <div className={`${styles.items} ${styles.itemsDivided}`}>
            <div className={styles.item}>
              <span className={styles.tile} aria-hidden="true">
                <TruckIcon />
              </span>
              <div>
                <h3 className={styles.itemTitle}>Kostenlose Lieferung</h3>
                {/* Date prefix stripped — see the header note (Q7). */}
                <p className={styles.itemBody}>
                  Per Spedition bis zur Bordsteinkante, Termin nach Absprache.
                </p>

                <div className={styles.optional}>
                  <p className={styles.optionalLabel}>Optional im Checkout:</p>
                  <p className={styles.optionalRow}>
                    <span>Lieferung &amp; Aufbau am Wunschort</span>
                    <span>+ 299 €</span>
                  </p>
                  <p className={styles.optionalNote}>
                    Hermes liefert bis in den Raum und baut auf.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.item}>
              <span className={styles.tile} aria-hidden="true">
                <UndoIcon />
              </span>
              <div>
                <h3 className={styles.itemTitle}>30 Tage zu Hause ausprobieren</h3>
                <p className={styles.itemBody}>
                  Gefällt&apos;s dir nicht? Kostenlos zurückschicken. 30 statt
                  der gesetzlichen 14 Tage Widerrufsrecht ab Lieferung.
                  Rückversand bzw. Abholung kostenlos.
                </p>
                {/* TODO: link to the real Widerrufsbelehrung page. */}
                <a className={styles.itemLink} href="#svc">
                  Widerrufsbelehrung
                </a>
              </div>
            </div>

            <div className={styles.item}>
              <span className={styles.tile} aria-hidden="true">
                <ShieldIcon />
              </span>
              <div>
                <h3 className={styles.itemTitle}>2 Jahre Garantie</h3>
                <p className={styles.itemBody}>
                  Dein Sportstech Gerät ist 2 Jahre abgesichert.
                </p>
              </div>
            </div>

            <div className={styles.item}>
              <span className={styles.tile} aria-hidden="true">
                <ShieldIcon />
              </span>
              <div>
                <h3 className={styles.itemTitle}>12 Monate Garantie</h3>
                <p className={styles.itemBody}>Für geprüfte Refurbished-Geräte.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card – SERVICE NACH DEM KAUF */}
        <div className={styles.card}>
          <span className={`${styles.badge} ${styles.badgeTinted}`}>
            SERVICE NACH DEM KAUF
          </span>

          <div className={styles.items}>
            <div className={styles.item}>
              <span className={styles.tile} aria-hidden="true">
                <HeadsetIcon />
              </span>
              <div>
                <h3 className={styles.itemTitle}>Seit 15 Jahren für dich da</h3>
                <p className={styles.itemBody}>
                  Direkt aus Berlin: Service auf Deutsch und in weiteren
                  Sprachen, plus Ersatzteilversorgung.
                </p>
              </div>
            </div>

            <div className={styles.item}>
              <span className={styles.tile} aria-hidden="true">
                <DocIcon />
              </span>
              <div>
                <h3 className={styles.itemTitle}>Bedienungsanleitung</h3>
                <p className={styles.itemBody}>
                  PDF mit Aufbau, Pflege und Sicherheitshinweisen.
                </p>
                {/* TODO: point both links at the real PDFs. */}
                <a className={styles.itemLink} href="#svc">
                  Bedienungsanleitung (PDF)
                </a>
                <a className={styles.itemLink} href="#svc">
                  Sicherheitshinweise
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceDelivery;
