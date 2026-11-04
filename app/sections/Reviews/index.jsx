/**
 * Reviews - "Bewertungen"
 *
 * Source: prototype/js/sections.js -> SECTIONS.drev (319 nodes, 1920 x 2663)
 *         prototype/index.html:34-36 -> section.m-sec#rev
 *         prototype/fig/*.webp -> public/images/reviews/
 *
 * REBUILT 2026-11-04 from the flat `s_reviews.jpg` slab, which no longer has
 * a prototype source. Hand-written semantic responsive markup (approved Q1b).
 *
 * -- Animation ---------------------------------------------------------
 *   Staggered reveal of the section's direct children.
 *   start 'top 92%' - once: true - y 40 -> 0, opacity 0 -> 1
 *   duration 0.8 - ease power3.out - stagger 0.08
 *   SOURCE: prototype/js/app.js:87 (desktop) and app.js:95 (mobile) -
 *   both use the same numbers. Forward only; `once: true` means it does
 *   NOT reverse on scroll up, matching the prototype. See
 *   app/lib/useRevealBatch.js.
 *
 * -- Assets ------------------------------------------------------------
 *   review-photos.webp  <- fig/e9ac26fbf8d3.webp  (/IMG:review-photos)
 *   rv-liam.webp        <- fig/1da0e12d90e6.webp
 *   rv-waldemar.webp    <- fig/6553ef30682d.webp
 *   rv-niklas.webp      <- fig/421ce7dc3af1.webp
 *   rv-timoteo.webp     <- fig/f3583d38088c.webp
 *   rv-joris.webp       <- fig/e010ac35ab38.webp
 *   rv-lennox.webp      <- fig/baa7168159e9.webp
 *
 * -- Deliberate omissions ----------------------------------------------
 *   Review dates ("8. April 2026" etc.) are NOT rendered. They exist in the
 *   node data but prototype/js/app.js:38-39 hides every node whose key
 *   matches `\d+\. (Januar|...|Dezember) 20\d\d`, and the mobile markup at
 *   index.html:36 ships no <time> at all. Dropping them matches both and
 *   the no-time-bound-content rule (approved Q7).
 *   TODO: re-add dates from the real review feed once it is wired.
 *
 * -- Not yet functional -------------------------------------------------
 *   The filter chips, search field, sort select and "Mehr Bewertungen
 *   laden" are rendered but inert - the prototype wires no handler to any
 *   of them (nothing in app.js references .m-chip / .m-sort / .m-search /
 *   .m-pill, and drev's /Button nodes get none either). The chips do track
 *   a selected state so they are not silently dead to a keyboard user.
 *   TODO: wire filtering, search, sort and pagination to the review feed.
 */

import {useState} from 'react';
import {Stars} from '~/components/icons/Stars';
import {useRevealBatch} from '~/lib/useRevealBatch';
import styles from './Reviews.module.css';

/* /5 Sterne … /3 % — the three histogram rows present in the node data */
const DISTRIBUTION = [
  {label: '5 Sterne', percent: 87},
  {label: '4 Sterne', percent: 9},
  {label: '3 Sterne', percent: 3},
];

/* /Button / … — index.html:35 ships the same five */
const FILTERS = [
  {id: '5', label: '5 Sterne', count: 424},
  {id: '4', label: '4 Sterne', count: 44},
  {id: '3', label: '3 Sterne', count: 14},
  {id: 'photos', label: 'Mit Fotos', count: 25},
  {id: 'verified', label: 'Verifizierter Kauf', count: 482},
];

/* /Review card – … — copy verbatim from the node data */
const REVIEWS = [
  {
    name: 'Liam P.',
    title: 'Schön glatt, kraftvoll und smart',
    body: 'Ich bin wirklich beeindruckt von dem leisen Motor; er ist flüsterleise, selbst wenn ich die Höchstgeschwindigkeit von 20 km/h anstrebe. Die verschiedenen Neigungsstufen bieten genau die Herausforderung, die ich brauche, und der Speed Knob macht es so einfach, die Geschwindigkeit spontan anzupassen. Außerdem ist es eine sehr durchdachte Idee, mein Handy drahtlos aufzuladen, während ich laufe.',
    photo: '/images/reviews/rv-liam.webp',
  },
  {
    name: 'Waldemar B.',
    body: 'Ich benutze dieses Laufband jetzt seit etwa zwei Wochen, und die Dämpfung ist wirklich herausragend. Der Motor ist überraschend leise, selbst wenn ich Intervalltrainings bei höheren Geschwindigkeiten mache. Außerdem ist der Bildschirm riesig und super reaktionsschnell, was das Mitverfolgen von Trainern viel intensiver macht. Insgesamt ein solides Gerät, mit dem ich sehr zufrieden bin. Diese Marke bietet auch einen guten Service.',
    photo: '/images/reviews/rv-waldemar.webp',
  },
  {
    name: 'Niklas W.',
    body: 'Ehrlich gesagt hat mich dieses Produkt auf die beste Weise überrascht. Es läuft sehr glatt und es gibt keinen Lärm, selbst wenn wir mit höchster Geschwindigkeit und dem Neigungseffekt laufen. Ich bin mit der App zufrieden und die Online-Trainingsvideos sind sehr gut. Die gesamte Qualität dieses Laufbands ist top.',
    photo: '/images/reviews/rv-niklas.webp',
  },
  {
    name: 'Timoteo K.',
    body: 'Die Leistung ist hervorragend und es sieht fantastisch aus; es wackelt nicht, wenn ich mit hoher Geschwindigkeit laufe und die Steigung benutze. Die Funktionen, die die Sportstech-App bietet, sind extrem gut. Ich bin mehr als glücklich mit diesem Kauf!',
    photo: '/images/reviews/rv-timoteo.webp',
  },
  {
    name: 'Joris L.',
    body: 'Solide wie ein Felsen, selbst wenn ich 20 km/h erreiche oder die 15%-Steigung für Intervall-Sprints nutze. Es ist selten, ein klappbares Laufband zu finden, das nicht wackelt, aber dieses fühlt sich wie Geräte im Fitnessstudio an. Ich bin super begeistert von den Funktionen der Sportstech-App, da es mehr Spaß macht zu trainieren, ohne sich zu langweilen.',
    photo: '/images/reviews/rv-joris.webp',
  },
  {
    name: 'Lennox S.',
    body: 'Perfekt für meine "keine Ausreden"-Tage. Ich kann ein 5k-Lauf durchziehen und dann den Bildschirm 360 Grad drehen für eine Yoga-Session direkt daneben. Es ist super leise, sieht modern aus, und der einstellbare Geschwindigkeitsregler macht Anpassungen mitten im Lauf mühelos. Die Sportstech-App mit vielen Programmen und Online-Videos macht es noch angenehmer.',
    photo: '/images/reviews/rv-lennox.webp',
  },
];

export function Reviews() {
  const revealRef = useRevealBatch();
  const [activeFilters, setActiveFilters] = useState([]);

  const toggleFilter = (id) =>
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  return (
    <section
      className={styles.section}
      id="rev"
      aria-labelledby="reviews-heading"
    >
      <div className={styles.inner} ref={revealRef}>
        <h2 id="reviews-heading" className={styles.heading}>
          Bewertungen
        </h2>

        <div className={styles.grid}>
          {/* ── Summary rail ─────────────────────────────────── */}
          <div className={styles.summary}>
            <p className={styles.score}>
              <span className={styles.scoreValue}>4,8</span>
              <span>
                <Stars
                  className={styles.scoreStars}
                  label="4,8 von 5 Sternen"
                />
                <span className={styles.scoreCount}>aus 489 Bewertungen</span>
              </span>
            </p>

            <ul className={styles.bars}>
              {DISTRIBUTION.map((d) => (
                <li key={d.label} className={styles.bar}>
                  <span>{d.label}</span>
                  <span className={styles.barTrack}>
                    <span
                      className={styles.barFill}
                      style={{width: `${d.percent}%`}}
                    />
                  </span>
                  <span className={styles.barPercent}>{d.percent} %</span>
                </li>
              ))}
            </ul>

            <p className={styles.source}>Bewertungen über REVIEWS.io</p>
          </div>

          {/* ── Review column ────────────────────────────────── */}
          <div className={styles.column}>
            <h3 className={styles.subheading}>Fotos von Kundinnen und Kunden</h3>
            <div className={styles.photos}>
              <img
                src="/images/reviews/review-photos.webp"
                alt="Fotos von Kundinnen und Kunden mit ihrem sTread Pro"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h3 className={styles.subheading} style={{marginTop: '52px'}}>
              Was Kundinnen und Kunden sagen
            </h3>

            {/* TODO: wire filtering to the review feed. */}
            <div className={styles.filters}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.chip} ${
                    activeFilters.includes(f.id) ? styles.chipOn : ''
                  }`}
                  aria-pressed={activeFilters.includes(f.id)}
                  onClick={() => toggleFilter(f.id)}
                >
                  {f.label}&nbsp;&nbsp;{f.count}
                </button>
              ))}
            </div>

            <div className={styles.tools}>
              {/* TODO: wire search + sort to the review feed. */}
              <input
                className={styles.search}
                type="search"
                placeholder="Suchen ..."
                aria-label="Bewertungen durchsuchen"
              />
              <select className={styles.sort} aria-label="Sortierung">
                <option>Mit Fotos zuerst</option>
              </select>
            </div>

            <div className={styles.cards}>
              {REVIEWS.map((r) => (
                <article key={r.name} className={styles.card}>
                  <div className={styles.cardHead}>
                    <h4 className={styles.cardName}>{r.name}</h4>
                  </div>
                  <p className={styles.cardMeta}>
                    <Stars
                      className={styles.cardStars}
                      label="5 von 5 Sternen"
                    />
                    <span className={styles.verified}>Verifizierter Kauf</span>
                  </p>
                  {r.title ? (
                    <p className={styles.cardTitle}>{r.title}</p>
                  ) : null}
                  <p className={styles.cardBody}>{r.body}</p>
                  <img
                    className={styles.cardPhoto}
                    src={r.photo}
                    alt={`Kundenfoto von ${r.name}`}
                    loading="lazy"
                    decoding="async"
                  />
                </article>
              ))}
            </div>

            {/* TODO: wire pagination to the review feed. */}
            <button type="button" className={styles.more}>
              Mehr Bewertungen laden
            </button>
            <p className={styles.shown}>6 von 482 angezeigt</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
