/**
 * tools/sync-version2.mjs — re-sync version2/ into the Hydrogen app.
 *
 *   node tools/sync-version2.mjs
 *
 * version2/ is the source of truth and is NEVER edited; re-run this
 * script after it changes. It is idempotent (full wipe + recopy of
 * public/version2/ each run).
 *
 * ── 2026-11-10 20:18: switched to a verbatim static mirror ─────────────
 * /stread-pro-v2 now renders version2/index.html inside an <iframe>
 * (app/sections/StreadProV2/index.jsx), not injected as a React-owned
 * <body> string. An iframe is its own browsing context — none of
 * version2's CSS, JS, or markup ever touches the parent document, and
 * none of the parent's global stylesheets (reset.css, app.css,
 * tailwind.css) ever touch version2's. That's the whole point: it
 * sidesteps every CSS-leak / script-load-order / hydration-timing
 * mismatch the previous (body.html injection) approach kept running into
 * — there is nothing left to patch.
 *
 * So this script is now a PURE copy, no patching, no path rewriting, no
 * body.html extraction:
 *
 *   public/version2/index.html             version2/index.html, verbatim
 *   public/version2/{css,js,img,vid,fonts,models,draco}/   verbatim
 *   public/version2/studio.hdr             verbatim
 *
 * version2/index.html's own relative paths ('./css/style.css',
 * './js/main.js', and main.js's own './img/...', './models/...',
 * './draco/...', './studio.hdr') all resolve correctly as-is: once
 * index.html lives at public/version2/index.html, every sibling it
 * references via a relative path is still exactly where it expects it,
 * because the whole version2/ tree is mirrored flat under
 * public/version2/. No /version2/ prefix rewriting needed — that was
 * only necessary for the previous approach, where version2's markup was
 * injected into a page living at a completely different URL
 * (/stread-pro-v2, not /version2/index.html).
 *
 * app/sections/StreadProV2/body.html (from the retired approach) is no
 * longer generated or read. It's left on disk, unused — see
 * _backup/StreadProV2.body.html.20261110-201843 if you need the old
 * injection approach's reference copy.
 */
import fs from 'fs';

const log = (...a) => console.log(' ', ...a);

const SRC = 'version2';
const OUT = 'public/version2';

fs.mkdirSync(OUT, {recursive: true});
for (const d of ['css', 'js', 'img', 'vid', 'fonts', 'models', 'draco']) {
  fs.rmSync(`${OUT}/${d}`, {recursive: true, force: true});
  fs.cpSync(`${SRC}/${d}`, `${OUT}/${d}`, {recursive: true});
  const n = fs
    .readdirSync(`${OUT}/${d}`, {recursive: true})
    .filter((f) => fs.statSync(`${OUT}/${d}/${f}`).isFile()).length;
  log(`copied ${SRC}/${d} -> ${OUT}/${d}  (${n} files)`);
}
fs.copyFileSync(`${SRC}/studio.hdr`, `${OUT}/studio.hdr`);
log(`copied ${SRC}/studio.hdr -> ${OUT}/studio.hdr`);
fs.copyFileSync(`${SRC}/index.html`, `${OUT}/index.html`);
log(`copied ${SRC}/index.html -> ${OUT}/index.html`);
