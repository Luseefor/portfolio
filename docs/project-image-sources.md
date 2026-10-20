# Project image sources

Scope. Authentic pixels only: two screenshots reused byte-identical from public
repo docs, one captured from the live public demo, no generated or mock images.
No private user data. `public/images/projects/` holds 3 files, all under 1 MB each.
Parent Next.js image optimization handles delivery sizing; no visual edits made.

## 1. vinculum.png — Vinculum math editor

- File: `public/images/projects/vinculum.png` (PNG, 345,715 bytes, 1600x1000)
- Alt: "Vinculum editor showing a mathematical surface and its expression"
- Caption: Vinculum editor with a rendered 3D mathematical surface and its
  expression, as shown in the project README.
- Source: https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/media/editor.png
- Commit pin: `b5161fc3a07c5357a7ae6693b49102195f4c8437` on master
  (matches `docs/project-evidence.md`; README image added in `62442b9`).
- Provenance: downloaded from pinned-commit raw URL, md5-verified
  identical to the bytes served at that pin. Pixels preserved, unedited.

## 2. faredelta.png — FareDelta flight search

- File: `public/images/projects/faredelta.png` (PNG, 52,062 bytes, 1200x369)
- Alt: "FareDelta flexible-date search form with nearby-airport options"
- Caption: FareDelta public-beta search form with flexible-date and
  nearby-airport options, as shown in the project README.
- Source: https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/docs/media/search-form.png
- Commit pin: `edbc77102da6ef0af7902393bde99af4d4f1a645` on main
  (matches `docs/project-evidence.md`).
- Provenance: downloaded from pinned-commit raw URL, md5-verified
  identical to the bytes served at that pin. Pixels preserved, unedited.

## 3. synthex-ui.png — Synthex UI component gallery

- File: `public/images/projects/synthex-ui.png`, PNG, 1440×900.
- Alt: "Synthex UI component examples in the live preview".
- Caption: Component examples from the public Synthex UI preview.
- Source: https://synthex-ui.rijan.sh/components
- Capture: 2026-10-20, installed Playwright with Chrome, viewport 1440×900,
  deviceScaleFactor 1. Opened the public homepage, waited for Components,
  clicked its existing navigation item, and waited for network idle.
- Genuine rendered component gallery, with fields, selects, checkboxes,
  and switches. No data entered or submitted. Original pixels preserved.
- This replaces an initial dashboard capture whose statistics and chart
  were empty. No source commit is asserted for a live deployment.

## 4. LumaWall — no actual image available

- No file added. The LumaWall repo (`cca2e41` on main) contains no UI
  screenshots: full recursive tree lists only `AppIcon.icns` / `AppIcon.png`
  and source files. It is a native macOS app with no public web demo and no
  notarized download, so there is no authentic UI to capture. Per task rules,
  no LumaWall UI was fabricated; this project ships without an image rather
  than with a mockup.
- Reference: https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/README.md

## Remaining limit

- Assets on disk: 3 images (each under ~1 MB).
- No further screenshots collected; LumaWall intentionally imageless.
