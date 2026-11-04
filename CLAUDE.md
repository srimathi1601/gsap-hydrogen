# CLAUDE.md — gsap-hydrogen

<!--
  Auto-read by Claude Code at the start of every session.
  Every rule here is enforced on every task.
  Lines marked ⚠️ are non-negotiable — never override.
-->

## Skills
@guides/skills/pdp-builder.md

---

## ⚠️ Safety Rules

- Work ONLY inside this project folder and the test Shopify store
- Push to Shopify → ONLY as a NEW unpublished draft theme. Never overwrite live.
- Never print, log, or save tokens/passwords inside any file
- Never touch navbar-clone/ or reference/ — design scratch only
- Before editing ANY existing file → copy to _backup/<filename>.<timestamp>

---

## Project

- Type: Hydrogen headless Shopify — PDP page
- Goal: Pixel-perfect Figma match + GSAP scroll animations (forward + backward)
- Store: TEST store only

---

## Stack

| Layer | Tool |
|-------|------|
| Framework | Hydrogen + React Router |
| Imports | `from 'react-router'` only — see .cursor/rules/hydrogen-react-router.mdc |
| Path alias | `~/` → `app/` — in jsconfig.json AND vite.config.js |
| CSS | Tailwind utility classes with arbitrary values e.g. text-[18px] |
| Animation | GSAP + ScrollTrigger — register inside useGSAP() never module scope |
| GraphQL | Two-schema .graphqlrc.js — run codegen after any .graphql change |

---

## Build Flow (every session)

```
1. Read this file + skill file
2. Check PROGRESS.md — continue last unfinished section
3. ANALYSE → HTML prototype → verify → React → REPORT
4. Never start over
```

---

## Known State

- `($locale)._index.jsx` imports ScrollShowcase but doesn't render it — leave as-is
- `jsconfig.json` has lint warning — do not change
- `package-lock.json` untracked — do not commit
- `navbar-clone/` and `reference/` — scratch dirs, not build input