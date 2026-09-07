# Touch is not one sense — source

A reading journey for hands-on practitioners.

A Quarto website on what is known about touch. Six pages of stops, about thirty
minutes, twelve figures of which eleven are interactive.

Counts are not stated in the prose — not the number of stops, not the number of
sources, not the number of closing rules. They drifted every time the story
grew, in six places at once. `check.js` prints the current numbers, and that is
where to read them.

```
index.qmd             start here — what this is, who it is for, how it is sourced
territory.qmd         One · the territory      two roads · the organ · how fine
second-system.qmd     Two · the second system  found · the proof · a speed · a warmth
what-touch-does.qmd   Three · what touch does  pain · where · how sure
being-honest.qmd      Four · being honest      corrections · meaning
carry-back.qmd        Closing                  what we carry back · every source
```

The opening page is written to be **self-contained**: someone arriving cold from
a link learns what it is, who it is for and how it is sourced before the first
stop. Three rows, deliberately short — it is orientation, not an introduction,
and anything that could live inside a stop does.

> **Continuing this?** This README covers the mechanics. The working notes are
> in `dev-notes/`, which is gitignored and local to a working copy:
> `dev-notes/touch-journey/HANDOFF.md` for what was decided and why, what is
> verified and how well, and the error classes that actually occurred;
> `dev-notes/touch-journey/TODO.md` for what is next; and
> `dev-notes/touch-journey/RESEARCH.md` for candidate papers assessed for new
> stops.

## Run it

From the **repository root**, not from here:

```
quarto render                          # -> docs/
quarto preview                         # live reload while editing
node shared/tools/check.js touch-journey      # content audit — run after every edit
node shared/tools/layout-check.js touch-journey   # layout audit — needs chrome/chromium
```

`shared/tools/check.js` has no dependencies and takes milliseconds. It verifies that
every `[@key]` resolves to an entry in `refs.bib`, that Wikipedia links are well
formed and point at English Wikipedia, that every stop has the parts a stop needs
**and carries its research block above its figure**, that every stop but the
closing reference list ends in a "for your hands" takeaway, that every figure names a
scene the figure layer defines, that any count still stated in prose matches the
pages, that the evidence figure keeps its descending shape, and that
phrasings which caused trouble before have not come back. It also fails on
leftover `[ref:]` and `{{Page|text}}` markup from before the Quarto conversion.
Exit code 1 on failure, so it drops into a pre-commit hook.

It cannot see layout. That is `shared/tools/layout-check.js`, which walks the **built**
pages in headless Chrome at six widths from 320 to 1400px, clicks every control,
and fails if anything leaves its viewBox or two labels overlap. It does not
render — run `quarto render` first or it audits a stale build. Exit 1 on failure;
skips quietly if there is no chrome on PATH.

## Where things live

```
_quarto.yml           at the repo root — project, sidebar, grid widths
index.html            at the repo root — the site shelf, copied verbatim

touch-journey/
  _metadata.yml       theme, bibliography and scripts, this subtree only
  (the look now lives in ../shared — see shared/README.md. warm.scss holds
   Bootstrap variables, warm.css the page's own rules, and both are wired in
   at project level so every story inherits one copy.)
  refs.bib            every source
  (ama.csl moved to ../shared too, and is set project-wide.)
  *.qmd               ALL prose, including figure captions
  _figures.html       the four <script> tags, injected after the body
  js/figure-data.js   CLAIMS and REVISIONS — data the figures draw
  js/scenes.js        twelve illustrations. Not charts — rounded caps, soft fills
  js/figures.js       mounts the figures and wires their controls

(the two checkers live in ../shared/tools/ and serve every story — see
 shared/README.md.)
```

**The dividing line between markdown and JavaScript:** if it is inside a figure
it stays in JS, if it is read as text it becomes markdown. So `CLAIMS` and
`REVISIONS` are data files; the prose, the closing rules and every figure
caption are all `.qmd`.

That last one matters. Captions used to live in `page.js`, outside everything
`check.js` looked at, and the old README had to warn "grep both before an editing
pass". They are auditable now.

## The shape of a stop

Fixed, so it is learnable and every claim is held to the same standard:

```markdown
## Your fingertips are fifteen times sharper than your back {#acuity .stop data-stop="acuity"}

::: {.year}
How fine
:::

::: {.lead}
The question this stop answers.
:::

::: {.src}
[The research]{.lbl}
The paper, named *before the reader meets the finding* [@weinstein68], with an
honest one-line assessment of how much weight it bears.
:::

::: {.journey-figure data-scene="acuity"}
The caption. Markdown, and audited.
:::

The body.

::: {.hands}
[For your hands]{.t}
What changes in practice.
:::
```

Three things about that are load-bearing:

- **The heading carries the classes**, because Pandoc excludes headings nested
  inside fenced divs from the page TOC. Quarto wraps each `##` in a `<section>`
  and copies the attributes onto it, which is what makes the stop a stop.
- Pandoc copies those attributes onto **both** the `<section>` and the `<h2>`, so
  every block rule in `warm.css` says `section.stop`. Unscoped, each heading gets
  the stop's border and 54px of padding.
- **`.year` follows the heading in source and is lifted above it** with flex
  order, because the heading has to come first for the TOC. Source order stays
  title-then-year, which is the sensible reading order anyway.

`check.js` fails if a `.src` block sits below its figure. An early draft had the
citation in a card *after* the prose, which meant meeting a claim before knowing
where it came from.

## Citations

`[@vallbo99]` in the prose, entries in `refs.bib`, rendered by citeproc under
`ama.csl` — superscript numerals, numbered in order of first appearance, each
linked to an entry at the foot of the page it appears on.

`refs.bib` is **ordered in first-citation order across the six pages**, because
`carry-back.qmd` pulls the whole file in with `nocite: @*` and that makes the
complete list read in journey order rather than alphabetically. The
further-reading entries there link to papers directly rather than citing them,
for the same reason: citing would renumber the complete list.

Two entries are not ordinary papers and were handled deliberately:

- `weinstein68` is a book chapter, an `@incollection`.
- `standring` has no author and no year — it is a pointer to reference works, an
  `@misc`. The old `REFS` entry carried editorial commentary in its journal
  field, which citeproc cannot reproduce; that commentary now lives in the
  prose of the stop that cites it, which is where it belonged.

## Two layouts

Scenes are drawn in user units against `W`, and `W` has two values: **860** wide,
**420** narrow. Every scene branches on `NARROW`; side-by-side panels stack,
right-hand label columns move underneath the art, long annotations wrap into a
`foreignObject`.

This is not cosmetic. An SVG scales to its box, so a label's real size is
`fontsize x (box px / W)`. Drawing an 860-unit scene into a 560px column puts a
13u label at 8.8px, which is unreadable.

**The choice is made from the figure's own box, not the viewport.** The
single-file original could infer one from the other because the page was the
whole width. With a sidebar and a margin TOC it cannot: at a 1100px viewport the
reading column is about 560px. `js/figures.js` measures the figure and passes the
answer to `layout()` in `scenes.js`; below 640px of box it draws narrow, and a
`ResizeObserver` re-renders when the decision flips. `ST` is module-level, so
every control the reader has already touched keeps its value across the redraw.

**Adding a scene:** give it a `NARROW` branch, then run `shared/tools/layout-check.js`.
Without one it is drawn for an 860 canvas inside a 420 one and most of it lands
off-screen.

## Why it looks different

This is the odd one out in the family. Everything else here uses the same
strip-chart vocabulary: sage paper, Spectral and IBM Plex, muted traces on a
grid. That reads as *laboratory*, which is right for those and wrong for this.
So this one is a book rather than an instrument:

| | The instrument pieces | This |
|---|---|---|
| Paper | sage grey `#EDEEE9` | warm clay-white `#FAF5EF` |
| Type | Spectral + IBM Plex Sans | **Fraunces** + **Newsreader** |
| Shapes | rectangles, gridlines, axes | rounded, soft fills, almost no axes |
| Colour meaning | 13 trace hues | two: **blue** for the fast road, **clay** for the slow one |
| Body size | 15px | 19px |
| Theme | light and dark | light only, on purpose |

The two-colour scheme does real work: once the reader learns blue = fast/what and
clay = slow/how-it-feels in the first figure, every later figure reads without a
legend.

The look is kept in two files on purpose, and both now live in `../shared`.
**`warm.scss` holds Bootstrap variables only** and **`warm.css` holds the
page's own rules**, because Quarto's
`cssVarsBlock` step parses the compiled theme CSS and its parser cannot handle
quoted strings, negative numbers or `calc()` — any of which in an `scss:rules`
block throws `SCSSParsingError` on every render. The split sidesteps it, and is
honest anyway: one file teaches the chrome the palette, the other is the book.

`_metadata.yml` applies all of this to **this directory only**, so a future
instrument-style story keeps its own vocabulary under the same project.

## The figures

Twelve scenes, deliberately in different visual vocabularies so that no two stops
feel like the same chart twice. **Eleven of the twelve are interactive**, and the
rule for adding interaction is that it has to teach something the prose cannot.
Two of them are drawn twice — `context` and `revisions` are repeated on the
closing page as the thing to leave with, which is why the checker counts more
figures than there are scenes.

1. **Two roads** *(interactive)* — the fast road is drawn dead straight, the slow road wanders. Press **send a touch** and both signals travel **in real time**: the fast one crosses in 0.06 s, the slow one takes a full second. The one-second gap is the stop's whole claim, and it is the difference between reading it and feeling it.
2. **Skin cross-section** *(interactive)* — five receptor types at their real depths, each drawn as its own shape. Tap to read what it does. The only anatomical figure.
3. **Two-point acuity** *(interactive)* — two dots at the true threshold, plus every body part as a comparison ruler. The most physical figure; readers can test it on themselves in a minute.
4. **Microneurography** *(interactive)* — swap the soft brush for a sharp point and the slow fibre goes quiet while the fast one keeps firing. That contrast is literally how the fibres were told apart from pain fibres.
5. **The patient** — two panels side by side, one with the fast road greyed and dashed. The design of the study *is* the illustration. The only static figure, and the only one with no caption.
6. **Speed** *(interactive)* — the tuning hill against the ramp, plus a dot stroking 15 cm of forearm at the true speed. Watch the dot, not the curve.
7. **Speed × warmth** *(interactive)* — the sweet spot as a region rather than a line, with a verdict that changes.
8. **The gate** *(interactive)* — take the hand away and the gate opens. A mechanism diagram, not a chart.
9. **Social touch topography** *(interactive)* — a body outline with permitted zones, beside the bond-against-area bars.
10. **How sure are we** *(interactive)* — the chart is **hidden until you guess**. You place your own estimate for "touch measurably raises oxytocin" first, then reveal; your marker stays on the chart next to the real position. Predict-then-reveal is the one interaction pattern with direct experimental support for improving recall, and this is the claim practitioners most reliably overrate.
11. **Corrections** *(interactive)* — four flip cards, each holding what the field used to say on the front and what it says now on the back. The only figure with no SVG in it.
12. **Meaning** *(interactive)* — three switches for consent, trust and warning, with the physical stroke held identical at 3 cm/s and 32°. The verdict moves from *welcome* through *endured* to *intrusive* while nothing about the touch changes. Labelled illustrative, because no study assigns those words.

## Honesty rules kept from the rest of the family

Lighter in tone, same standard underneath:

- Every stop names its paper, links it, and carries a one-sentence **grade** in plain English — "widely replicated as a group average", "strong, and a single case" — instead of a badge.
- Part four exists specifically so a reader does not leave quoting the 2014 version of a story the field has since revised.
- The closing rules are ordered by **how confident you can be**, and the last one says explicitly that safety, consent and relationship are doing more work than any number on the page.
- The closing note says the page cannot tell you what the person in front of you wants.

## The evidence-strength figure

`CLAIMS` in `js/figure-data.js` places seven claims on a 0–1 confidence line.
These are **judgements about how much weight a practitioner should give each
claim**, not effect sizes, and the caption says so. They are ordered
deliberately: the best-supported claims are the simplest and most physical, and
the two weakest are the hormone claims that circulate most confidently in
training rooms.

If you edit it, keep that shape honest. The point of the figure is the gradient,
and inflating the oxytocin line would destroy it. `check.js` fails if the
ordering breaks or the weakest claim drifts above 0.4.

## The class of error to watch for

The commonest way this page could go wrong is not a wrong number. It is a
**correct measurement carrying a conclusion it cannot support**. One got through
several drafts:

> "So fine, detailed work on a back is largely wasted as information — the
> resolution is not there."

Two-point discrimination measures one narrow thing: whether skin resolves two
*simultaneous* points. It says nothing about whether precise placement matters,
because (a) locating a single contact is more accurate than telling two apart,
(b) pressure reaches muscle, fascia and joints, which have their own sensory
supply, and (c) in manual work the precision often matters most to the
*practitioner*, whose fingertips resolve at 2–3 mm. A reader who works with
tissue rather than skin spotted it immediately.

The lesson for editing: when a sentence moves from *what was measured* to
*what you should therefore do*, that is the sentence to re-read. The handoff's §5
has four more of the same species.

## Known rough edges

- **`docs/` is Quarto's output directory and Quarto deletes what it does not
  know about.** It removed the published story once and replaced the shelf with
  a redirect stub. Anything that must exist in `docs/` has to be a project
  input — rendered from a `.qmd`, or listed under `project.resources`. The shelf
  is there now for exactly that reason.
- **The shelf is still hand-written HTML** at the repo root, copied verbatim.
  Converting it to `index.qmd` is the last piece of the Quarto move.
- **The stroking dot's travel span** comes from `STROKE_GEOM`, which `sceneSpeed`
  sets as it draws, because the arm sits in a different place in each layout.
  `stroke()` in `figures.js` reads it. If you change `arm()` or the speed-scene
  margins, that object is what to re-check.
- **No dark theme**, on purpose. Adding one means a second palette for the soft
  fills, which mostly rely on warmth to read at all.
- **Body zones in the topography figure are invented** — a simplification of the
  published maps. The bond-against-area bars beside them are the paper's actual
  finding. Do not present the body map as data.
- **The two-point figure is not drawn to scale.** The caption says "drawn larger
  than life … the proportions between body parts are the real ones", which is
  honest, but the figure still cannot be checked against a real ruler. Genuine
  1:1 is feasible and would make the "test it on yourself" promise real. Left
  undone deliberately: it is a content decision, not a bug.
- **Long-run link rot.** Two dozen external links. No checker for them.
