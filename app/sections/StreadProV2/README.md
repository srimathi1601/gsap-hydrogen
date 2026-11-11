# StreadProV2 — video assets are not committed

`/stread-pro-v2` is built from `version2/` (a pre-built Vite/Three.js
ES-module package — see the header comment in `tools/sync-version2.mjs`
for the full shape) via `node tools/sync-version2.mjs`.

`public/version2/vid/` is in `.gitignore` (~29 MB, mostly `live/15.mp4`
at 13.9 MB) — too large to commit. Everything else under
`public/version2/` (images, fonts, the GLB model, the HDR environment,
the patched JS bundle, the stylesheet) **is** committed.

After cloning, restore the videos before `/stread-pro-v2` will show the
PDP gallery's video slides and the `#vid` testimonial section correctly:

```
version2/vid/  →  public/version2/vid/
```

(`version2/` itself ships with its own `vid/` already — no rebuild
needed for this step, just a copy; or re-run
`node tools/sync-version2.mjs`, which copies it as part of its normal
sync.)

Without this, the gallery's video slides and the `#vid` section will
404 on their `.mp4`/poster `.jpg` sources; every other section is
unaffected.

## Previous build (retired 2026-11-10)

Until 2026-11-10 16:26, `version2/` was a different, classic-script
prototype variant, and this component loaded it as seven separate
`<script>` tags. That build is documented in
`_backup/StreadProV2.index.jsx.20261110-165909` and
`_backup/sync-version2.mjs.20261110-165909`. The unrelated earlier
`stread-pro-3d-source/` → `public/v2/` build (retired 2026-11-06) is
still untouched on disk but no longer referenced by this route.
