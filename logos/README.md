# Notknowing Garden — logo sketches

A small Clojure project for exploring a mark for Notknowing Garden.
It follows the layout of [scicloj/graphic-design](https://github.com/scicloj/graphic-design):
marks are functions that return SVG as hiccup, and a [Clay](https://scicloj.github.io/clay/)
notebook shows them side by side.

- `src/notknowing_garden/` — palette, path helpers (`geometry`), the marks, the living stems (`living`), display helpers (`view`), and `main`
- `notebooks/notknowing_garden_logos.clj` — the first sketches
- `notebooks/living_curves.clj` — the two-curves mark redrawn as tapered,
  woven stems with tendrils and a leaf (`src/notknowing_garden/living.clj`)
- `notebooks/lockup.clj` — the mark with the name and the tagline
  (`view/lockup`; the chosen settings are `view/horizontal`, `view/stacked`
  and `view/compact`)
- `svg/` — exported SVGs of the main candidates (written by `main`)
- `png/` — the two main lockups at twice size (written by `tools/png.sh`)
- `tools/` — small scripts that need headless Chrome: `measure.py`,
  `outline.py`, `png.sh` (see "Lockups" below)
- `docs/` — the notebook rendered to HTML (written by Clay)

## Run it

Everything below runs from this directory (`logos/`).

Render once, without a REPL:

```sh
clojure -M:build
```

This writes `svg/*.svg`, `docs/notknowing_garden_logos.html`,
`docs/living_curves.html` and `docs/lockup.html`.

Work interactively:

```sh
clojure -M:nrepl          # starts nREPL and writes .nrepl-port
```

Connect your editor, then:

```clojure
(require '[scicloj.clay.v2.api :as clay])
(clay/make! {})            ; serves the notebook at http://localhost:1971 and reloads on re-make
(require 'notknowing-garden.main)
(notknowing-garden.main/write-svgs)
```

Clay's editor integrations (CIDER, Calva, Cursive) can also show the current
file or form directly; see the Clay docs.

The wordmarks use Fraunces from Google Fonts, so they need a network
connection to show in the right face. Exported wordmark SVGs `@import` the
font, which works when the file is opened directly but not through `<img>`.

## Lockups

`clojure -M:build` writes the lockups — the mark with **Notknowing Garden**
and the tagline **Bodymind, tantra, and movement**:

- `svg/lockup-horizontal.svg`, `svg/lockup-stacked.svg` — the two main ones
- `svg/lockup-compact.svg` — mark and name only, for small places
- each also as `-dark` (light text on ink #33291F) and `-ink` (one colour)

Their text is live text in Fraunces, loaded from Google Fonts by an
`@import` inside the file. It shows in the right face only when the fonts
can load: opened directly in a browser, or inlined into a page that loads
them. Through `<img>`, in most design tools, or offline it falls back to
Georgia or another serif, and the spacing will be wrong. For those uses
take the `-outlined` files, or the PNGs.

**Outlined versions** (`svg/lockup-*-outlined.svg`) have every letter turned
into a filled shape, so they need no font. They are made from the SVGs
above, and are not rewritten by the build, so run this again after the
lockups change:

```sh
python3 tools/outline.py --check $(ls svg/lockup-*.svg | grep -v outlined)
```

Headless Chrome lays the text out and reports where each letter sits;
fontTools (with brotli, for the `.woff2` files) cuts the same variable font
at the same weight and optical size and draws the letters there. The fonts
are downloaded into `temp/fonts/`. `--check` screenshots the live and the
outlined file and counts pixels that differ; the differences we saw were
only along the edges of letters, from anti-aliasing.

**PNGs** at twice size, on a transparent ground:

```sh
tools/png.sh svg/lockup-horizontal.svg svg/lockup-stacked.svg
```

**Sizes of the boxes.** Each lockup's viewBox is its measured ink box plus
a margin of 8 units, rounded up to whole units. Text widths depend on the
font, so the ink boxes (`:bounds` in `view/horizontal` and friends) were
measured, not computed; after changing a lockup, measure again and paste
the numbers in:

```sh
clojure -M -e "(require 'notknowing-garden.main) (notknowing-garden.main/write-measure-pages)"
python3 tools/measure.py temp/measure/*.html
```

**Smallest sizes.** Below about 330 px wide (horizontal) or 210 px
(stacked), the tagline's capitals are under 6 px tall; use the compact
lockup there.
