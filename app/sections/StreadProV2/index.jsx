/**
 * StreadProV2 — renders version2/index.html inside an <iframe>.
 *
 * ── 2026-11-10 20:18: switched from body-injection to an iframe ────────
 * The previous approach (still in _backup/StreadProV2.index.jsx.
 * 20261110-173904) read version2/index.html's <body>, injected it into a
 * React-owned div via dangerouslySetInnerHTML, and manually re-created
 * version2's <script> tag in a useEffect (innerHTML never executes
 * <script> elements). That meant version2's CSS and markup shared the
 * PARENT document with the Hydrogen scaffold's own global stylesheets
 * (reset.css, app.css, tailwind.css) and React's hydration lifecycle —
 * which took three rounds of fixes (pdp-base.css scoping, modulepreload,
 * crossOrigin matching, shader pre-warm, scroll-tuning) to get close to
 * matching version2/index.html's own standalone behavior, and still
 * wasn't a guarantee.
 *
 * An <iframe> is its own browsing context: a real, separate `Window` and
 * `Document`. version2/index.html loads inside it exactly the way it
 * would in its own browser tab — same script execution timing, same
 * CSS cascade (nothing from the parent page can reach in), same Lenis/
 * ScrollTrigger/Three.js runtime, byte-identical files, zero patching.
 * public/version2/js/main.js and public/version2/css/style.css are now
 * verbatim copies of version2/'s own files (see tools/sync-version2.mjs)
 * — no path rewrites, no shader pre-warm, no scroll-tuning edits. There
 * is nothing left for this component to load, inject, or fix by hand.
 *
 * ── Why the iframe fills the viewport ───────────────────────────────
 * version2's own CSS uses 100vw/100vh on fixed-position elements (the
 * full-page #gl canvas, #bigtype, etc.), measured against the IFRAME's
 * own viewport. For those to match what opening version2/index.html
 * directly looks like, the iframe element itself must exactly fill the
 * real browser viewport — so its internal 100vh is the same 100vh a
 * standalone tab would have. `app/styles/pdp-base.css` cancels the
 * scaffold's `body > main` margin for `.v2-root` so this wrapper can
 * sit truly edge-to-edge with no gutter.
 *
 * Scrolling happens INSIDE the iframe's own document (that's where Lenis
 * and ScrollTrigger are listening) — not on the parent page. The iframe
 * is not given a `scrolling` attribute; its content scrolls itself,
 * exactly like a normal browser tab would.
 */

export {links} from './links.js';

export function StreadProV2() {
  return (
    <div className="v2-root">
      <iframe
        src="/version2/index.html"
        title="sTread Pro"
        style={{display: 'block', width: '100%', height: '100vh', border: 'none'}}
      />
    </div>
  );
}

export default StreadProV2;
