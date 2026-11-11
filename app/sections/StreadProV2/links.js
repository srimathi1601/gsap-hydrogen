/**
 * StreadProV2's `links()` export — kept as an empty export so the route
 * file's `import {links as streadProV2Links} from '~/sections/StreadProV2/links'`
 * and `export const links = streadProV2Links` need no change.
 *
 * ── 2026-11-10 20:18: emptied, now that version2 loads in an <iframe> ──
 * Previously this linked /version2/css/style.css and a modulepreload for
 * /version2/js/main.js into the PARENT document, because version2's
 * markup was injected directly into this page. Now version2/index.html
 * loads inside an <iframe> as its own document — it brings its own
 * <link rel="stylesheet"> and <script type="module"> exactly as written
 * in version2/index.html itself. Nothing for the parent page to link.
 */

export function links() {
  return [];
}
