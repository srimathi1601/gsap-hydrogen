/**
 * /stread-pro-v2 — sTread Pro 3D scroll page, Version 2.
 *
 * Approach A (prototype folder exists): stread-pro-3d-source/ pre-built
 * with its own `vite build`, output copied to public/v2/, mounted here
 * verbatim. See app/sections/StreadProV2/index.jsx for the full build
 * pipeline and the CSS-scoping / path-prefixing decisions.
 *
 * No Shopify data needed — this is a static, pre-built page — so there is
 * no loader.
 *
 * STEP 4 perf (2026-11-06): the component is loaded via React.lazy(),
 * splitting its ~43KB inlined body.html string (and the component code
 * itself) out of this route's eager bundle and into its own chunk,
 * fetched only once this route actually renders. `links()` is imported
 * from its own tiny file (./links.js), NOT from index.jsx — importing it
 * from index.jsx here would force Vite to bundle the whole module
 * (body.html included) eagerly anyway, since a module both statically and
 * dynamically imported from the same entry point isn't split. See
 * app/sections/StreadProV2/links.js for the full reasoning.
 */
import {lazy, Suspense} from 'react';
import {links as streadProV2Links} from '~/sections/StreadProV2/links';

const StreadProV2 = lazy(() => import('~/sections/StreadProV2'));

export const links = streadProV2Links;

/**
 * FIX 3 (2026-11-06): this page brings its own fixed `.nav` and `#foot`
 * footer (body.html), which was rendering stacked on top of the global
 * SiteHeader/SiteFooter from app/components/PageLayout.jsx. root.jsx reads
 * this via useMatches() and tells PageLayout to skip both, leaving only
 * V2's own chrome. See app/root.jsx and app/components/PageLayout.jsx.
 */
export const handle = {noLayout: true};

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'sTread Pro 3D — V2'}];
};

export default function StreadProV2Route() {
  return (
    <Suspense fallback={<div style={{background: '#000', height: '100vh'}} />}>
      <StreadProV2 />
    </Suspense>
  );
}

/** @typedef {import('./+types/($locale).stread-pro-v2').Route} Route */
