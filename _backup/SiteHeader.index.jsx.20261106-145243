/**
 * SiteHeader - Sportstech main navigation
 *
 * Source: prototype/js/sections.js -> SECTIONS.dtop /Header – main nav
 *                                     (30 nodes, 1920 x 98 at y 47)
 *         prototype/index.html:6-7  -> header.m-head / nav.m-nav (mobile)
 *
 * Replaces app/components/SportstechHeader.jsx (approved Q6). Backed up to
 * _backup/SportstechHeader.jsx.<ts> before removal.
 *
 * Layout: logo left, nav centred, locale + icons right - matching the
 * prototype. Hand-written semantic flow (approved Q1b): <header>/<nav>/<a>,
 * not absolutely-positioned divs.
 *
 * ONE responsive tree (approved Q2). Below 768px the inner row wraps and the
 * nav becomes a horizontally scrolling second row, mirroring .m-head/.m-nav.
 *
 * Animations: none. The prototype's header does not move or stick.
 *
 * Assets: all icons inline SVG, paths lifted verbatim from the node data and
 * from prototype/index.html:6. No image files.
 *
 * TODO: wire the links to real Shopify routes - every href is a placeholder,
 * exactly as in the prototype.
 */

import {Link} from 'react-router';
import {
  ChevronDownIcon,
  SearchIcon,
  UserIcon,
  BagIcon,
} from '~/components/icons/PdpIcons';
import styles from './SiteHeader.module.css';

/* /Header – main nav/Logo / SPORTSTECH/Logo mark/Vector, viewBox 257x26 in
   the prototype's mobile markup; the mark alone is 38x26 on desktop. */
const LogoMark = () => (
  <svg
    className={styles.logoMark}
    viewBox="0 0 38 26"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      transform="translate(2.29 0)"
      d="M9.28571 0L33.4286 0L28.7857 9.28571L4.64286 9.28571L9.28571 0ZM4.64286 16.7143L28.7857 16.7143L24.1429 26L0 26L4.64286 16.7143Z"
      fill="currentColor"
    />
  </svg>
);

/* Nav items - /Header – main nav text nodes at x 608 / 744 / 906 / 1103 / 1206.
   `menu: true` marks the two that carry a chevron in the node data.
   TODO: wire the links to real Shopify routes. */
const NAV = [
  {label: 'Geräte', menu: true},
  {label: 'Nach Ziel', menu: true},
  {label: 'Sportstech Live', menu: false},
  {label: 'Deals', menu: false},
  {label: 'Ratgeber', menu: false},
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="Sportstech – Startseite">
          <LogoMark />
          <span className={styles.logoWord}>SPORTSTECH</span>
        </Link>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {NAV.map((item) => (
            <Link key={item.label} to="/" className={styles.navLink}>
              {item.label}
              {item.menu ? <ChevronDownIcon className={styles.chevron} /> : null}
            </Link>
          ))}
        </nav>

        <div className={styles.tools}>
          <button type="button" className={styles.locale}>
            <span className={styles.flag} aria-hidden="true" />
            DE
            <ChevronDownIcon className={styles.chevron} />
          </button>

          <button type="button" className={styles.iconButton} aria-label="Suche">
            <SearchIcon className={styles.icon} />
          </button>

          <Link to="/account" className={styles.iconButton} aria-label="Konto">
            <UserIcon className={styles.icon} />
          </Link>

          <Link to="/cart" className={styles.iconButton} aria-label="Warenkorb">
            <BagIcon className={styles.icon} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
