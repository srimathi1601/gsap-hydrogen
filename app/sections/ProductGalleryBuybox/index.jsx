/**
 * ProductGalleryBuybox - PDP gallery + buy box
 *
 * Source: prototype/js/sections.js -> SECTIONS.dtop
 *           /PDP – gallery + buy box (249 nodes, 1920 x 3113 at y 216)
 *             Frame 3 = gallery  [150, 71, 924, 1257]
 *             Frame 4 = buy box  [1129, 73, 688, 2911]
 *         prototype/index.html:9-23 -> the mobile markup
 *         prototype/js/app.js:45-57 -> gallery switching + the two toggles
 *         prototype/fig/*.webp, prototype/img/g*.webp
 *
 * REBUILT 2026-11-04. The previous build was a flat `s_top.jpg` slab; the
 * updated prototype replaces it with 249 real nodes, so this is now
 * hand-written semantic responsive markup (approved Q1b) with the node
 * coordinates as the spec.
 *
 * -- Animations --------------------------------------------------------
 *   Gallery crossfade - gsap.fromTo(layer, {opacity:.3}, {opacity:1,
 *   duration:.4})                                   SOURCE: app.js:49
 *   Nothing else moves. The active-thumb ring is a CSS class swap here,
 *   where the prototype tweens `left` on a single overlay (app.js:49) -
 *   same result, no layout tween.
 *
 * -- Sticky gallery ----------------------------------------------------
 *   CSS `position: sticky` (approved Q4). prototype/js/app.js:59-66 fakes
 *   it with a per-scroll-frame translateY + scale because its stage lives
 *   inside a CSS transform; that hack is not reproduced.
 *
 * -- Interactions ------------------------------------------------------
 *   thumb click / prev / next / mobile swipe -> goTo(i)   app.js:49-51
 *   Zustand   Neu | Refurbished   radiogroup             app.js:56
 *   Lieferung two options          radiogroup            app.js:57
 *   accessories                    checkboxes            index.html:15
 *
 * -- Deliberate omissions ----------------------------------------------
 *   * "Accessory card 4 (clipped – unreadable)" - a 75px sliver with no
 *     name, price or image; the capture cut it off. Dropped (approved Q5);
 *     prototype/index.html:15 also ships only three accessories.
 *     TODO: restore when real copy is available.
 *   * The "1/2" accessory pager and its two arrow circles - with the
 *     fourth card gone there is nothing to page to, and the prototype
 *     never wired them.
 *   * "Voraussichtl. Lieferdatum: 05.11.–09.11.2026" - time-bound,
 *     approved Q7; app.js:38-39 strips it at runtime under the same rule.
 *     TODO: add real delivery dates from Shopify metafields.
 *   The "Niedrigster Preis der letzten 30 Tage" line is KEPT - it is a
 *   required German price disclosure (PAngV), not a countdown.
 *
 * Mobile: one responsive tree (approved Q2). The slide track becomes a
 * native scroll-snap carousel exactly as prototype/css/mobile.css:12-13
 * does, and the same scroll handler keeps the counter and thumbs in sync.
 */

import {useRef, useState, useCallback, useEffect} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import {
  ZoomIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CubeIcon,
  TruckIcon,
  WrenchIcon,
  UndoIcon,
  ShieldIcon,
  UsersIcon,
  LockIcon,
  TrophyIcon,
} from '~/components/icons/PdpIcons';
import {Stars} from '~/components/icons/Stars';
import styles from './ProductGalleryBuybox.module.css';

const SLIDE_COUNT = 9;
const slideSrc = (i) => `/images/gallery/g${i + 1}.webp`;
const thumbSrc = (i) => `/images/gallery/thumbs/g${i + 1}-t.webp`;

/* Frame 4 /Accessory card – ... (the fourth card is dropped, see the header) */
const ACCESSORIES = [
  {
    id: 'live',
    name: 'Sportstech Live',
    desc: '1000+ Workouts & dein KI-Coach',
    term: '1 Jahr',
    price: '89,99 €',
    was: '139,99 €',
    img: '/images/product-gallery-buybox/acc-live.webp',
  },
  {
    id: 'mat',
    name: 'Bodenschutzmatte',
    desc: 'Dämpft Geräusche, rutschfest',
    price: '89,10 €',
    was: '128,99 €',
    img: '/images/product-gallery-buybox/acc-mat.webp',
  },
  {
    id: 'spulse',
    name: 'sPulse Pulsmesser',
    desc: 'Steuert die Puls-LED live mit',
    price: '67,50 €',
    img: '/images/product-gallery-buybox/acc-spulse.webp',
  },
];

/* Frame 4 /Delivery option – selected + /Delivery option */
const DELIVERY = [
  {
    id: 'standard',
    Icon: TruckIcon,
    name: 'Kostenlose Lieferung',
    note: 'Per Spedition bis zur Bordsteinkante, Termin nach Absprache.',
    price: 'Kostenlos',
    free: true,
  },
  {
    id: 'assembly',
    Icon: WrenchIcon,
    name: 'Lieferung & Aufbau am Wunschort',
    note: 'Hermes liefert bis in den Raum und baut auf.',
    price: '+ 299 €',
    priceNote: 'Im Warenkorb wählbar',
  },
];

/* Frame 4 USP row */
const USPS = [
  {Icon: TruckIcon, label: 'Kostenloser Versand'},
  {Icon: UndoIcon, label: '30 Tage testen'},
  {Icon: ShieldIcon, label: '2 Jahre Garantie'},
  {Icon: UsersIcon, label: '4 Millionen Kunden'},
];

export function ProductGalleryBuybox() {
  const trackRef = useRef(null);
  const slideRefs = useRef([]);

  const [active, setActive] = useState(0);
  const [condition, setCondition] = useState('neu');
  const [delivery, setDelivery] = useState('standard');
  const [extras, setExtras] = useState({});

  /* app.js:49 `show(i)` - wraps both ways across all nine images. */
  const goTo = useCallback((i) => {
    const next = (i + SLIDE_COUNT) % SLIDE_COUNT;
    setActive(next);
    const track = trackRef.current;
    // No-op on desktop, where the track does not scroll.
    if (track && track.scrollWidth > track.clientWidth + 1) {
      track.scrollTo({left: next * track.clientWidth, behavior: 'smooth'});
    }
  }, []);

  /* Mobile scroll-snap -> state. prototype/js/app.js:91 does the same with
     `Math.round(tr.scrollLeft / tr.clientWidth)`. Inert on desktop. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onScroll = () => {
      if (track.scrollWidth <= track.clientWidth + 1) return;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      setActive((prev) => (prev === i ? prev : i));
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  /* Crossfade - app.js:49, verbatim timing. */
  useGSAP(
    () => {
      const el = slideRefs.current[active];
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(el, {opacity: 0.3}, {opacity: 1, duration: 0.4});
    },
    {dependencies: [active]},
  );

  const toggleExtra = (id) =>
    setExtras((prev) => ({...prev, [id]: !prev[id]}));

  return (
    <section className={styles.section} id="top">
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Brotkrumen">
          <a href="/">Startseite</a>
          <span aria-hidden="true">/</span>
          <a href="/collections/laufbaender">Laufbänder</a>
          <span aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">
            sTread Pro Laufband
          </span>
        </nav>

        <div className={styles.grid}>
          {/* ── Gallery ─────────────────────────────────────────── */}
          <div className={styles.galleryCol}>
            <div className={styles.stageBox}>
              <ul className={styles.track} ref={trackRef}>
                {Array.from({length: SLIDE_COUNT}, (_, i) => (
                  <li
                    key={slideSrc(i)}
                    ref={(el) => {
                      slideRefs.current[i] = el;
                    }}
                    className={`${styles.slide} ${
                      i === active ? styles.slideActive : ''
                    }`}
                  >
                    <img
                      src={slideSrc(i)}
                      alt={`sTread Pro Laufband – Ansicht ${i + 1} von ${SLIDE_COUNT}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </li>
                ))}
              </ul>

              {/* TODO: wire a lightbox - the prototype has no zoom handler. */}
              <button
                type="button"
                className={styles.zoom}
                aria-label="Bild vergrößern"
              >
                <ZoomIcon className={styles.zoomIcon} />
              </button>

              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={() => goTo(active - 1)}
                aria-label="Vorheriges Bild"
              >
                <ChevronLeftIcon className={styles.arrowIcon} />
              </button>

              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={() => goTo(active + 1)}
                aria-label="Nächstes Bild"
              >
                <ChevronRightIcon className={styles.arrowIcon} />
              </button>

              <p className={styles.counter} aria-live="polite">
                {active + 1} / {SLIDE_COUNT}
              </p>

              {/* The prototype leaves this button dead; anchoring it to the
                  3D section is the only honest destination on this page. */}
              <a className={styles.view3d} href="#s3d">
                <CubeIcon className={styles.view3dIcon} />
                3D ansehen
              </a>
            </div>

            <div className={styles.thumbs}>
              {Array.from({length: SLIDE_COUNT}, (_, i) => (
                <button
                  key={thumbSrc(i)}
                  type="button"
                  className={`${styles.thumb} ${
                    i === active ? styles.thumbOn : ''
                  }`}
                  onClick={() => goTo(i)}
                  aria-label={`Bild ${i + 1} anzeigen`}
                  aria-current={i === active ? 'true' : undefined}
                >
                  <img src={thumbSrc(i)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Buy box ─────────────────────────────────────────── */}
          <div className={styles.buybox}>
            <p className={styles.eyebrow}>PROFI-LAUFBAND</p>
            <h1 className={styles.productTitle}>sTread Pro</h1>

            <p className={styles.rating}>
              <Stars className={styles.stars} />
              <span className={styles.ratingScore}>4,8</span>
              <span>· 489 Bewertungen</span>
            </p>

            <p className={styles.lede}>
              Studio-Laufgefühl mit bis zu 20 km/h, 7-PS-Motor und 15
              Steigungsstufen – Trainer-Workouts auf dem 360° drehbaren 21,5&quot;
              Touchdisplay, danach einfach hochgeklappt.
            </p>

            <p className={styles.priceRow}>
              <span className={styles.price}>2.179 €</span>
              <s className={styles.priceWas}>2.758,80 €</s>
              <span className={styles.saving}>579,80 € gespart</span>
            </p>

            <p className={styles.fineprint}>
              Inkl. MwSt. · Lieferung im Preis enthalten
              <br />
              Niedrigster Preis der letzten 30 Tage: 1.899,95 €
              <br />
              Preis für Lieferung nach: Deutschland · <a href="#top">ändern</a>
            </p>

            <div className={styles.linkCard}>
              {/* TODO: Highlights has no destination in the prototype. */}
              <a className={styles.linkRow} href="#top">
                Highlights
                <ChevronDownIcon className={styles.rowIcon} />
              </a>
              <a className={styles.linkRow} href="#tech">
                Technische Daten
                <ChevronRightIcon className={styles.rowIcon} />
              </a>
              <a className={styles.linkRow} href="#svc">
                Lieferung, Garantie &amp; Service
                <ChevronRightIcon className={styles.rowIcon} />
              </a>
            </div>

            {/* 01 Zustand */}
            <div className={styles.step}>
              <span className={styles.stepNum}>01</span>
              <h2 className={styles.stepTitle}>Zustand</h2>
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Zustand">
              {[
                {id: 'neu', label: 'Neu'},
                {id: 'refurbished', label: 'Refurbished'},
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={condition === o.id}
                  className={`${styles.option} ${
                    condition === o.id ? styles.optionOn : ''
                  }`}
                  onClick={() => setCondition(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* 02 Beliebtes Zubehör */}
            <div className={styles.step}>
              <span className={styles.stepNum}>02</span>
              <h2 className={styles.stepTitle}>Beliebtes Zubehör</h2>
            </div>
            <p className={styles.stepSub}>Perfekt kombiniert, clever gespart.</p>
            <div className={styles.accessories}>
              {ACCESSORIES.map((a) => (
                <label key={a.id} className={styles.accessory}>
                  <input
                    type="checkbox"
                    checked={Boolean(extras[a.id])}
                    onChange={() => toggleExtra(a.id)}
                  />
                  <span className={styles.accessoryBox} aria-hidden="true" />
                  <img
                    className={styles.accessoryImage}
                    src={a.img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.accessoryName}>{a.name}</span>
                  <span className={styles.accessoryDesc}>{a.desc}</span>
                  {a.term ? (
                    <span className={styles.accessoryTerm}>{a.term}</span>
                  ) : null}
                  <span className={styles.accessoryPrice}>
                    <b>{a.price}</b>
                    {a.was ? <s>{a.was}</s> : null}
                  </span>
                </label>
              ))}
            </div>

            {/* 03 Lieferung */}
            <div className={styles.step}>
              <span className={styles.stepNum}>03</span>
              <h2 className={styles.stepTitle}>Lieferung</h2>
            </div>
            <p className={styles.stepSub}>Wie soll es zu dir kommen?</p>
            <div
              className={styles.delivery}
              role="radiogroup"
              aria-label="Lieferung"
            >
              {DELIVERY.map(({id, Icon, name, note, price, free, priceNote}) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={delivery === id}
                  className={`${styles.deliveryOption} ${
                    delivery === id ? styles.deliveryOptionOn : ''
                  }`}
                  onClick={() => setDelivery(id)}
                >
                  <span className={styles.deliveryTile} aria-hidden="true">
                    <Icon />
                  </span>
                  <span>
                    <span className={styles.deliveryName}>{name}</span>
                    <span className={styles.deliveryNote}>{note}</span>
                  </span>
                  <span className={styles.deliveryPrice}>
                    <span className={free ? styles.deliveryPriceFree : undefined}>
                      {price}
                    </span>
                    {priceNote ? (
                      <span className={styles.deliveryPriceNote}>{priceNote}</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <a className={styles.inlineLink} href="#svc">
              Mehr zu Lieferung &amp; Aufbau
              <ChevronRightIcon className={styles.rowIcon} />
            </a>

            {/* 04 Bezahlung */}
            <div className={styles.step}>
              <span className={styles.stepNum}>04</span>
              <h2 className={styles.stepTitle}>Bezahlung</h2>
            </div>
            <p className={styles.stepSub}>Auf einmal oder in Raten.</p>
            <div className={styles.financing}>
              <p className={styles.financingAmount}>
                Ab <b>181,58 €</b> pro Monat
                <span className={styles.financingNote}>
                  0 % Finanzierung über 12 Monate
                </span>
              </p>
              <a className={styles.inlineLink} href="#top">
                Mehr erfahren
                <ChevronRightIcon className={styles.rowIcon} />
              </a>
            </div>

            {/* Total price box */}
            <div className={styles.total}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Gesamtpreis</span>
                <span className={styles.totalValue}>2.179 €</span>
              </div>
              <p className={styles.totalMeta}>
                <span className={styles.totalSave}>Du sparst 579,80 €</span>
                <span className={styles.totalMonthly}>
                  Oder ab 181,58 €/Monat
                </span>
              </p>
              {/* TODO: recompute the total from the selected accessories and
                  delivery option once cart lines are wired to Shopify. */}
              <button type="button" className={styles.cart}>
                In den Warenkorb
              </button>
            </div>

            <ul className={styles.usps}>
              {USPS.map(({Icon, label}) => (
                <li key={label} className={styles.usp}>
                  <Icon />
                  {label}
                </li>
              ))}
            </ul>

            <p className={styles.secure}>
              <LockIcon />
              Sicher bezahlen mit PayPal, Klarna, Kreditkarte oder Ratenkauf
            </p>

            <div className={styles.trustpilot}>
              <div className={styles.trustHead}>
                <span className={styles.trustTile} aria-hidden="true">
                  <TrophyIcon />
                </span>
                <span>
                  <span className={styles.trustTitle}>
                    Bei Trustpilot auf Platz 1 gelistet
                  </span>
                  <span className={styles.trustSub}>
                    Nr. 1 im Fachhandel für Sport- und Fitnessgeräte · DE
                  </span>
                </span>
              </div>
              <p className={styles.trustFoot}>
                <Stars className={styles.stars} />
                <span className={styles.trustScore}>4,3</span>
                <span>Über 8.000 Bewertungen</span>
                <span className={styles.trustBrand}>★ Trustpilot</span>
              </p>
            </div>

            {/* Static in the prototype - the Figma frame has no inputs and the
                mobile <details> opens onto an empty body (index.html:23).
                TODO: build the room-fit calculator when fields are specified. */}
            <div className={styles.roomfit}>
              <span className={styles.roomTile} aria-hidden="true">
                <CubeIcon />
              </span>
              <span>
                <span className={styles.roomTitle}>Passt es in meinen Raum?</span>
                <span className={styles.roomSub}>
                  Gib deine Raumhöhe und Körpergröße ein – wir prüfen die
                  wichtigsten Maße.
                </span>
              </span>
            </div>

            <p className={styles.advice}>
              Beratung <a href="tel:03088626444">030 88626444</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductGalleryBuybox;
