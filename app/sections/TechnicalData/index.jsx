/**
 * TechnicalData - "Technische Daten"
 *
 * Source: prototype/js/sections.js -> SECTIONS.dtech (46 nodes, 1920 x 1230)
 *         prototype/index.html:38 -> section.m-sec#tech
 *         prototype/fig/45ba2bc9cb7d.webp
 *           -> public/images/technical-data/spec-image.webp
 *
 * REBUILT 2026-11-04 from the flat `s_tech.jpg` slab. Hand-written semantic
 * responsive markup (approved Q1b) - a real <table> with <th>/<td>, which
 * the engine-rendered original could not express.
 *
 * -- Animation ---------------------------------------------------------
 *   Staggered reveal of the section's direct children:
 *   start 'top 92%' - once:true - y 40 -> 0 - 0.8s power3.out - stagger .08
 *   SOURCE: prototype/js/app.js:87. See app/lib/useRevealBatch.js.
 *   Nothing else moves.
 *
 * -- Copy note ---------------------------------------------------------
 *   The desktop node data reads "1 km" / "20 km" for the two speed rows,
 *   which is a unit slip - these are speeds. prototype/index.html:38 has
 *   the correct "1 km/h" / "20 km/h", and the 3D section's own stat block
 *   (SECTIONS.d3d) says "20 km/h" too. The mobile wording is used here.
 *   Likewise the node labels "minimale/maximale Geschwindigkeit" and
 *   "kompatibel mit Pulsgurt" are sentence-cased on mobile; mobile wins.
 *
 * -- Not yet functional -------------------------------------------------
 *   "Alle technischen Daten" is inert - the prototype wires no handler.
 *   TODO: link to the full spec sheet.
 */

import {useRevealBatch} from '~/lib/useRevealBatch';
import styles from './TechnicalData.module.css';

/* /Spec card … — the six highlight tiles */
const SPECS = [
  {value: 'Ja', label: 'Transportrollen'},
  {value: '177 x 93 x 32.5 cm', label: 'Verpackungsmaße'},
  {value: '60,5 x 10,5 x 52,4 cm', label: 'Verpackungsmaße Display'},
  {value: '182 x 87.5 x 177 cm', label: 'Produktmaße - aufgebaut'},
  {value: '114 x 87.5 x 177 cm', label: 'Produktmaße - eingeklappt'},
  {value: 'Ja, via Bluetooth', label: 'Kompatibel mit Pulsgurt'},
];

/* The eight-row table — labels and values verbatim, units per the note above */
const ROWS = [
  ['Nettogewicht', 'Laufband (90 kg) + Display (5kg)'],
  ['Handpulsmessung', 'Nein'],
  ['Extras', 'Induktionsladefläche'],
  ['Minimale Geschwindigkeit', '1 km/h'],
  ['Maximale Geschwindigkeit', '20 km/h'],
  ['Lauffläche', '150 x 50 cm'],
  ['Maximales Benutzergewicht', '180 kg'],
  ['Selbstschmierfunktion', 'Manuelles Schmiersystem'],
];

export function TechnicalData() {
  const revealRef = useRevealBatch();

  return (
    <section className={styles.section} id="tech" aria-labelledby="tech-heading">
      <div className={styles.inner} ref={revealRef}>
        <h2 id="tech-heading" className={styles.heading}>
          Technische Daten
        </h2>

        <ul className={styles.specs}>
          {SPECS.map((s) => (
            <li key={s.label} className={styles.spec}>
              <b className={styles.specValue}>{s.value}</b>
              <span className={styles.specLabel}>{s.label}</span>
            </li>
          ))}
        </ul>

        <div className={styles.detail}>
          <img
            className={styles.image}
            src="/images/technical-data/spec-image.webp"
            alt="sTread Pro Laufband mit Bemaßung"
            loading="lazy"
            decoding="async"
          />

          <table className={styles.table}>
            <caption className="sr-only">
              Technische Daten des sTread Pro Laufbands
            </caption>
            <tbody>
              {ROWS.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TODO: link to the full spec sheet — the prototype wires no
            handler to this button. */}
        <button type="button" className={styles.cta}>
          Alle technischen Daten
        </button>
      </div>
    </section>
  );
}

export default TechnicalData;
