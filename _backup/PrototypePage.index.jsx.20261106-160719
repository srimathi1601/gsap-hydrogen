/**
 * PrototypePage — renders prototype/index.html verbatim.
 *
 * This replaces the hand-written React sections on the home route. Those
 * components are still on disk under app/sections/ (ProductGalleryBuybox,
 * KeyFeatures, Reviews, FAQ, TechnicalData, ServiceDelivery, Footer,
 * PromoBar, SubNav, StickyBuyBar, StreadPro3D, SportstechLive,
 * VideoShowcase) — they are simply no longer mounted.
 *
 * ── How the pieces fit ────────────────────────────────────────────────
 *
 *   body.html          the <body> of prototype/index.html with every
 *                      <script> stripped and every relative asset path
 *                      rewritten to an absolute one. Generated, committed.
 *   public/js/*        prototype/js/* copied verbatim, with three edits:
 *                        app.js      fig/ img/   -> /fig/ /img/
 *                        engine.js   fig/        -> /fig/
 *                        three3d.js  'three'     -> './three/three.module.js'
 *                                    js/three/draco/ -> /js/three/draco/
 *                                    models/...  -> /models/...
 *                      and the three addons' bare 'three' specifier
 *                      rewritten to '../../three.module.js'.
 *   public/js/faq.js   the window.FAQ block that was inline in
 *                      prototype/index.html — an inline <script> inside
 *                      injected HTML never executes, so it is a file now.
 *   app/styles/app.css prototype/css/site.css + mobile.css, appended.
 *
 * ── Why the scripts are loaded by hand ────────────────────────────────
 * innerHTML never executes <script> elements, so the markup alone is
 * inert. The chain below recreates prototype/index.html's own load order:
 *
 *   gsap → ScrollTrigger → lenis → sections → faq → engine → app
 *
 * gsap and ScrollTrigger come first because app.js calls
 * `gsap.registerPlugin(ScrollTrigger)` on its first line; sections.js
 * defines window.SECTIONS and engine.js defines window.buildStage /
 * window.mountPinned, both of which app.js consumes immediately.
 * three3d.js is an ES module and is loaded last, in parallel — nothing
 * else depends on it.
 *
 * ── Known constraint ──────────────────────────────────────────────────
 * The prototype scripts are global and not idempotent: they register
 * ScrollTriggers, a Lenis instance and window-level listeners with no
 * teardown. They therefore run ONCE per full page load. If you client-side
 * navigate away and back, the markup returns but the behaviour does not —
 * reload the page. Making that work would mean rewriting the prototype's
 * JS, which is the opposite of the point of this component.
 */

import {useEffect} from 'react';
import bodyHtml from './body.html?raw';

/* Classic scripts, in prototype/index.html's own order. */
const SCRIPTS = [
  '/js/gsap.min.js',
  '/js/ScrollTrigger.min.js',
  '/js/lenis.min.js',
  '/js/sections.js',
  '/js/faq.js',
  '/js/engine.js',
  '/js/app.js',
];

const MODULE_SCRIPT = '/js/three3d.js';

/** Appends one <script> and resolves when it has executed. */
function loadScript(src, {module = false} = {}) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-proto="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = false; // preserve execution order
    el.dataset.proto = src;
    if (module) el.type = 'module';
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(el);
  });
}

/**
 * The prototype's scripts run during initial parse, so they can register
 * one-shot lifecycle listeners and expect them to fire. Loaded from a React
 * effect they run much later, and `window.load` has usually gone already:
 *
 *   prototype/js/app.js, last line:
 *     document.fonts.ready.then(() => { fitTexts(); … ScrollTrigger.refresh() });
 *     addEventListener('load', () => ScrollTrigger.refresh());
 *
 * `document.fonts.ready` is a promise, so that half always resolves. The
 * `load` listener does not: if the event already fired, every pinned
 * ScrollTrigger keeps the start/end it measured at create() time — before
 * images and fonts settled — which shows up as pins engaging at the wrong
 * scroll offset and stretches of empty space, worst on mobile where
 * .m-sec heights depend most on reflow.
 *
 * So: if `load` has been and gone, call the refresh ourselves.
 */
function replayMissedLifecycleHooks() {
  // Share app.js's coalescing queue so these hooks, the webfont swap and the
  // accordion do not each force their own full re-measure of 240 triggers.
  const refresh = () =>
    window.stRefresh ? window.stRefresh() : window.ScrollTrigger?.refresh();
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, {once: true});
  // Belt and braces: refresh once more after webfonts have swapped in.
  document.fonts?.ready?.then(refresh);
}

/* Module scope, so the prototype boots exactly once per page load.
   `loadScript` is also idempotent (it checks for data-proto), so an HMR
   module re-evaluation that resets this flag still cannot double-load. */
let booted = false;

export function PrototypePage() {
  useEffect(() => {
    if (booted) return;
    booted = true;

    // NO cancellation flag here, deliberately.
    //
    // React 18 StrictMode runs an effect, tears it down, then runs it
    // again. An earlier version set `cancelled = true` in the cleanup and
    // checked it between links of the chain. The result was:
    //   run 1  -> booted = true, chain starts
    //   cleanup-> cancelled = true
    //   run 2  -> `booted` already true, returns immediately
    //   chain  -> every remaining .then() short-circuits
    // so only /js/gsap.min.js ever loaded, app.js never ran, and every
    // desktop section stayed an empty .pinbox — a white page.
    //
    // Booting the prototype is a one-shot global side effect on the
    // document, not component-scoped work, so there is nothing to cancel.
    SCRIPTS.reduce(
      (chain, src) => chain.then(() => loadScript(src)),
      Promise.resolve(),
    )
      .then(replayMissedLifecycleHooks)
      // ES module; nothing else depends on it, so it goes last.
      .then(() => loadScript(MODULE_SCRIPT, {module: true}))
      .catch((err) => {
        booted = false;
        console.error('[PrototypePage] script chain failed:', err);
      });
  }, []);

  return (
    <div
      className="proto-root"
      // prototype/js/app.js rewrites this subtree as soon as it runs
      // (buildStage/mountPinned replace the empty .pinbox hosts), so the
      // client DOM intentionally diverges from the server markup.
      suppressHydrationWarning
      // The markup is prototype/index.html's own <body>, read from disk at
      // build time — not user input.
      dangerouslySetInnerHTML={{__html: bodyHtml}}
    />
  );
}

export default PrototypePage;
