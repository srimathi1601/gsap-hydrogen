/**
 * SiteHeader - Sportstech main navigation
 *
 * REPLACED (2026-11-11): the original "/Header – main nav" build (Geräte /
 * Nach Ziel / Sportstech Live / Deals / Ratgeber + locale dropdown) has been
 * swapped for the /stread-pro-v2 landing page's own header — same markup
 * shape as app/sections/StreadProV2/body.html's <header class="nav"> block
 * and version2/index.html:14 (the sTread Pro V2 reference header: Shop /
 * Bundles / Über uns / Sale %, plain "DE | EN" text, no locale dropdown).
 * Old nav/locale markup is kept in _backup/SiteHeader.index.jsx.<ts> and
 * _backup/SiteHeader.module.css.<ts> if it's ever wanted back.
 *
 * Nav links point at the live sportstech.de pages (target="_blank",
 * rel="noopener"), exactly like the reference header and like this
 * project's logo link (see LogoLockup below) — this header isn't wired to
 * real Shopify routes for Shop/Bundles/Über uns/Sale.
 *
 * Account and cart stay internal React Router links (to /account, /cart):
 * those are real working Hydrogen routes, unlike the reference site's
 * plain non-navigating buttons, so keeping them functional here is not a
 * visual regression.
 *
 * Animations: none.
 */

import {Link} from 'react-router';
import {SearchIcon, UserIcon, BagIcon} from '~/components/icons/PdpIcons';
import styles from './SiteHeader.module.css';

/* FIX 1 (2026-11-06): swapped the hand-traced inline mark for V2's own
   logo file, /v2/img/logo-black.svg (the dark-on-light variant — this
   header's background is #ffffff). /v2/img/logo-white.svg is its
   counterpart and is unused here.

   FIX 5 (2026-11-11): re-pointed from /v2/img/logo-black.svg to
   /version2/img/logo-black.svg — the live V2 build's own logo asset,
   served from public/version2/img (mirrored from the version2/ source by
   tools/sync-version2.mjs), instead of the older /v2/img copy. Same
   dimensions, same file otherwise.

   FIX 6 (2026-11-11): resized to 154x24 and wrapped in an external link
   to https://www.sportstech.de/ (target="_blank", rel="noopener"), matching
   the "/Header – main nav" logo block from the sTread Pro V2 reference
   header (prototype/index.html, version2/index.html:14). Same image file
   — only the markup and link target changed, not the asset. */
const LogoLockup = () => (
  <img
    className={styles.logoImg}
    src="/version2/img/logo-black.svg"
    alt="Sportstech"
    width="154"
    height="24"
    decoding="async"
  />
);

/* Nav items — lifted from the /stread-pro-v2 reference header
   (app/sections/StreadProV2/body.html, version2/index.html:14). All four
   are external, exactly as in that header. `sale: true` marks the one
   styled in the accent/red color. */
const NAV = [
  {label: 'Shop', href: 'https://www.sportstech.de/collections/laufband'},
  {label: 'Bundles', href: 'https://www.sportstech.de/'},
  {label: 'Über uns', href: 'https://www.sportstech.de/pages/jobs-karriere'},
  {label: 'Sale %', href: 'https://www.sportstech.de/', sale: true},
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a
          className={styles.logo}
          href="https://www.sportstech.de/"
          target="_blank"
          rel="noopener"
          aria-label="Sportstech"
        >
          <LogoLockup />
        </a>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener"
              className={item.sale ? styles.navLinkSale : styles.navLink}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.tools}>
          <span className={styles.lang}>
            <b>DE</b> | EN
          </span>

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
