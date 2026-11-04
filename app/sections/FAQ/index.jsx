/**
 * FAQ - "Häufige Fragen"
 *
 * Source: prototype/js/sections.js -> SECTIONS.dfaq (26 nodes, 1920 x 1178)
 *         prototype/js/app.js:68-79 -> the accordion
 *         prototype/index.html:37   -> div.m-faq (native <details>)
 *         prototype/index.html:46   -> window.FAQ, the five answers
 *         prototype/tools/faq_answers.json (same five, pre-build)
 *
 * REBUILT 2026-11-04 from the flat `s_faq.jpg` slab. Hand-written semantic
 * responsive markup (approved Q1b).
 *
 * -- Animation ---------------------------------------------------------
 *   Accordion open/close - 0.45s, ease power3.out.
 *   SOURCE: prototype/js/app.js:75-78 (`gsap.to(..., {duration: .45,
 *   ease: 'power3.out'})` on every row, repeated for top / icon / divider /
 *   button, plus a 0.45s opacity tween on the answer).
 *
 *   The prototype tweens each row's `top` because its nodes are absolutely
 *   positioned. Here the rows sit in normal flow, so only the opening
 *   answer's height is animated and everything below follows - identical
 *   motion without tweening a layout coordinate per row.
 *
 *   ScrollTrigger.refresh() after each toggle, matching app.js:78, so the
 *   pinned sections below re-measure against the new page height.
 *
 *   Section reveal: start 'top 92%', once:true, y40->0, 0.8s power3.out,
 *   stagger 0.08 - SOURCE app.js:87. See app/lib/useRevealBatch.js.
 *
 * -- Accessibility ------------------------------------------------------
 *   Real <button> per row with aria-expanded + aria-controls, and the panel
 *   gets role="region" + aria-labelledby. The prototype's desktop rows are
 *   bare divs with an onclick (app.js:79) and no roles at all; its mobile
 *   markup uses native <details>, which is accessible. This build gives
 *   both breakpoints the accessible behaviour from one tree (approved Q2).
 *
 * -- Not yet functional -------------------------------------------------
 *   "Alle 19 Fragen anzeigen" is inert - the prototype wires no handler and
 *   ships only five answers.
 *   TODO: load the remaining 14 questions.
 *
 * Assets: none.
 */

import {useRef, useState, useCallback} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {useRevealBatch} from '~/lib/useRevealBatch';
import styles from './FAQ.module.css';

/* Questions: SECTIONS.dfaq text nodes.
   Answers:   prototype/index.html:46 window.FAQ, verbatim. */
const FAQS = [
  {
    q: 'Was ist das sTread Pro Laufband?',
    a: 'Das sTread Pro ist unsere neueste Profi Laufband Generation – innovativ, grenzenlos, mitreißend. Erlebe ein neues Laufabenteuer. Ausgestattet mit einem kraftvollen 7 PS Motor und einer Maximalgeschwindigkeit bis 20 km/h, eignet es sich perfekt für Anfänger und Fortgeschrittene. Die 15 Steigungsstufen sorgen für eine effektive Steigerung der Trainingsintensität, während das moderne Dämpfungssystem Ihre Gelenke schont. Mit praktischer Klappfunktion und smarter Steuerung ist das sTread Pro ideal für Ihre Homegym.',
  },
  {
    q: 'Welche Vorteile bietet das sTread Pro gegenüber anderen Modellen?',
    a: 'Das sTread Pro zeichnet durch vielfältige Trainingsprogramme, hervorragende Qualität, LED-Farben Stufen und App-Integration aus. Visuell sehr gut dargestellt auf dem 21,5" Display.',
  },
  {
    q: 'Welche Funktionen bietet das Display und wie kann ich damit trainieren?',
    a: 'Auf dem großen 21,5" Display haben Sie alle wichtigen Werte immer im Blick. Doch bei uns sehen sie mehr als nur die Standardwerte wie Geschwindigkeit, Trainingszeit, Laufstrecke, Steigung, Kalorienverbrauch und Pulsfrequenz. In dem Display ist die Sportstech Live App mit allen Features voll integriert. Sie sind nass kaltes Wetter satt. Kein Problem. Entdecken Sie zahlreiche Landscape Videos und lernen sie dabei ferne Orte besser kennen. Sie möchten eine gezielte Anleitung beim Training. Mit den Live Workouts Videos pushen unsere Trainer Ihre Kordination, Ausdauer und Vitalität. Sie haben nicht viel Zeit und sind sich unsicher, ob Sie Sport treiben oder Ihre TV-Serie weiterschauen möchten. Mit dem sTread Pro können Sie beides tun – dank der Integration von Streaming-Diensten wie YouTube, Netflix, Disney+ und Amazon Prime. Sie wünschen sich mehr Abwechslung? Mit dem Fitness-Game PulseBeat bringen Sie spielerisch Spaß und Motivation in Ihr Training – weitere Games folgen. Sie möchten auch andere Übungen außer Laufen machen. Das Display ist 360 Grad drehbar. Sie können es in die gewünschte Position drehen und neben dem Laufband viele andere spannende Übungen wie Yoga ausführen.',
  },
  {
    q: 'Werden Distanzen in Kilometern oder Meilen angezeigt?',
    a: 'Die Distanzangabe auf dem Laufband ist in Kilometern.',
  },
  {
    q: 'Wann muss ich die Laufmatte schmieren?',
    a: 'Bitte schmieren Sie Ihre Laufmatte regelmäßig. Nach 25 Betriebsstunden oder 2-3 Monaten sollte Silikon-Öl nachgefüllt werden, spätestens jedoch nach 50 Betriebsstunden oder 5-8 Monaten. Wenn Sie sich unsicher sind, können Sie auch mit dem Finger über die Oberseite des Laufdecks unter dem Laufgurt entlanggehen. Wichtig, stellen Sie sicher, dass der Netzstecker des Gerätes gezogen ist. Sollte sich das Laufdeck trocken anfühlen, müssen Sie Silikon-Öl nachfüllen.',
  },
];

/* app.js:73 — `let open = 0`, i.e. the first row starts expanded, and
   index.html:37 ships `<details open>` on the first question too. */
const INITIAL_OPEN = 0;

export function FAQ() {
  const revealRef = useRevealBatch();
  const panelRefs = useRef([]);
  const [open, setOpen] = useState(INITIAL_OPEN);

  const toggle = useCallback(
    (i) => setOpen((prev) => (prev === i ? -1 : i)),
    [],
  );

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const duration = reduced ? 0 : 0.45;

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const isOpen = i === open;
        gsap.to(panel, {
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
          duration,
          ease: 'power3.out',
          overwrite: 'auto',
          // app.js:78 refreshes every trigger once the height settles, so
          // the pinned sections below re-measure against the new page size.
          onComplete: () => ScrollTrigger.refresh(),
        });
      });
    },
    {dependencies: [open]},
  );

  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-heading">
      <div className={styles.inner} ref={revealRef}>
        <h2 id="faq-heading" className={styles.heading}>
          Häufige Fragen
        </h2>

        <div className={styles.list}>
          {FAQS.map((f, i) => (
            <div key={f.q} className={styles.item}>
              <button
                type="button"
                className={styles.question}
                aria-expanded={open === i}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => toggle(i)}
              >
                {f.q}
                <span
                  className={`${styles.marker} ${
                    open === i ? styles.markerOpen : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                className={styles.answerWrap}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                <p className={styles.answer}>{f.a}</p>
              </div>
            </div>
          ))}

          {/* TODO: load the remaining 14 questions — the prototype ships
              five answers and wires no handler to this button. */}
          <button type="button" className={styles.all}>
            Alle 19 Fragen anzeigen
          </button>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
