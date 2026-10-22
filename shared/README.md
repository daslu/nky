# shared — what every story is built out of

Three stories now, and this is the part they have in common: one warm
vocabulary, one figure engine, two checkers. A new story writes its own
research, prose and drawings, and nothing else.

```
shared/
├── warm.scss        Bootstrap variables — teaches Quarto's chrome the palette
├── warm.css         the page's own look: stops, source blocks, figures, cards
├── ama.csl          numeric superscript citations, numbered by first appearance
├── figure-kit.js    the figure engine — layout, mounting, controls, redraw
└── tools/
    ├── check.js         content audit, every story, no browser
    └── layout-check.js  layout audit, one story, needs a built site + chrome
```

`warm.scss`, `warm.css` and `ama.csl` are wired in at **project level** in
`_quarto.yml`, so a story inherits them by existing. A story's own
`_metadata.yml` carries only what is genuinely its own: its `refs.bib`, and the
script tags for its figures.

The split between the two stylesheets is not cosmetic. Quarto's `cssVarsBlock`
step throws `SCSSParsingError` on quoted strings, negative numbers and `calc()`
inside an `scss:rules` block. It is non-fatal, so it prints on every render and
trains you to ignore render output — which is how a real error gets missed.
**`warm.scss` holds Bootstrap variables only; `warm.css` holds the page's own
rules.**

---

## Adding a story

```
new-journey/
├── _metadata.yml    bibliography + the script tags (copy an existing one)
├── _figures.html    the four <script> tags, in load order
├── refs.bib         first-citation order, see below
├── index.qmd  …     the pages
└── js/
    ├── figure-data.js   the numbers, with the source of each in a comment
    ├── scenes.js        the drawings
    └── figures.js       what each figure is called and what operates it
```

Then in `_quarto.yml`: add `new-journey/*.qmd` to `render`, add
`new-journey/js/**` to `resources`, and add a sidebar with an `id` listing that
story's pages. Quarto picks the sidebar whose `contents` contain the page being
rendered, which is how three stories share a site without any of them
advertising another's stops. **A story sidebar must not name the front door in
its `contents`** — that makes the front door a member of the sidebar, and it
renders wearing that story's stops. The navbar is the way home.

Finally add an entry to the journeys list on `writing/index.qmd`.

`check.js` finds the story on its own — a directory with `.qmd` files and a
`refs.bib` is a story. No configuration to update.

### The opening page

All three stories open the same way, and a fourth should. The shape settled on
2026-09-07, after two of them had quietly drifted into a second one:

```markdown
:::: {.hero}
[A reading journey for hands-on practitioners]{.eyebrow}

# The story's title

::: {.stand}
The standfirst, one or two paragraphs — the claim the story exists to make.
:::
::::

How long it is and how it is sourced. One paragraph.

One more thing worth knowing before starting. One paragraph.

:::: {.about}

::: {.ab}
[Who it is for]{.k}
The audience, and that no science background is assumed.
:::

::: {.ab}
[What is here]{.k}
**[One · the first part](first.qmd).** What it covers.
… one row per page, the closing page included, every one of them linked.
:::

::::

The disclaimer. One paragraph.

::: {.hands}
[Before you start]{.t}
If you take one thing from this: **the story in one sentence.**
:::
```

Four things about it are load-bearing:

- **`toc: false` in the front matter.** The opening page has no stops, so its
  only heading is the title, and a one-item table of contents beside it reads
  as a mistake.
- **The page writes its own `# heading`.** `#title-block-header` is hidden
  site-wide, because the opening page carries its title in the body. A page
  that does not write one therefore has no visible title at all — which is
  what happened to two stories, for as long as they existed, with both
  checkers green throughout.
- **The eyebrow names the audience, not the page.** It read "Start here" on
  two stories, which duplicated the sidebar entry beside it and borrowed
  `.part`, the component that elsewhere means *you are in part two*.
- **The rows under "What is here" are links.** Without them the only way into
  the middle of a journey is the sidebar, and on a phone the sidebar is behind
  a menu button.

---

## The figure kit

A figure in a `.qmd` is a fenced div holding only its caption:

```markdown
::: {.journey-figure data-scene="resonance"}
The caption, as markdown. It stays in the document, where an editor and
check.js can both see it.
:::
```

and in `js/figures.js`:

```js
Fig.add("resonance", {
  controls: [
    {type:"range", key:"rate", label:"breaths a minute",
     min:3, max:24, step:0.1, fmt:v => `${v.toFixed(1)} a minute`}
  ],
  draw: sceneResonance
});
Fig.start({rate: 14});
```

The kit renders the controls above the drawing, leaves the caption underneath,
wires everything to state and redraws on change.

**Controls are declared, not wired**, and that is the main thing the kit buys.
Two of the error classes in the touch story's handoff come straight from
hand-wiring: a control that was never connected at all — the build passed,
because the file was still valid JavaScript, and only clicking it found the
problem — and a hint that went on saying *tap to take the hand away* after the
hand was already away. Neither mistake is available now: the kit renders the
label from the value.

Four kinds, and adding one here gives it to every story:

| type | what it is | keys it reads |
|---|---|---|
| `pills` | a row of mutually exclusive buttons | `key`, `options[{id,n}]`, `label?` |
| `toggle` | one button that flips, label included | `key`, `on`, `off`, `hint?{on,off}` |
| `range` | a slider with its value beside it | `key`, `min`, `max`, `step`, `fmt?`, `label?`, `aria?` |
| `action` | a button that holds no state | `key`, `n`, `run(state, api)`, `note?` |

A `key` may be a dotted path — `"f.threat"` reads and writes `state.f.threat` —
so a figure with five switches of the same kind keeps them together instead of
scattering five top-level keys through the state. Declaring `controls` as an
array of arrays renders them as two rows, for a figure whose controls are two
different kinds of thing and should not read as one set.

### The drawing helpers

`svgOpen(h, ariaLabel)` · `prose(x,y,w,h,html,opts)` · `track(x0,x1,y,opts)` ·
`fill(x0,x,y,colour,opts)` · `divider(y,text,opts)` · `esc` · `clamp` · `r2`

`svgOpen` asks for an `aria-label`, which is the cheapest way to make sure none
gets forgotten. `prose` is a `foreignObject`, because it is the only way to get
real line breaking inside an SVG.

### Two layouts

Scenes are drawn against `W`: **860 wide, 420 narrow**, and every scene must
branch on `NARROW`. Without a narrow branch a scene is drawn for an 860 canvas
inside a 420 one and most of it lands off-screen.

The choice is made from **the figure's own box width**, not the viewport. With
a sidebar and a margin table of contents the viewport stops predicting the
drawing box — at an 1100px window the reading column is about 560px, and an
860-unit scene puts its labels at 8.8px there. A `ResizeObserver` re-renders
when the decision flips, and only then.

---

## The two checkers

```bash
node shared/tools/check.js                    # every story
node shared/tools/check.js pain-journey       # one
quarto render                                 # layout-check reads the BUILD
node shared/tools/layout-check.js pain-journey
node shared/tools/layout-check.js pain-journey 390 1400 --page how-loose
```

**check.js** reads source. Every citation resolves to a `refs.bib` entry; every
stop has its year, lead, source block, figure and "for your hands" takeaway —
the closing reference list excepted, since it has no finding to translate; the
source block sits *above*
the figure, because a reader should not meet a claim before they meet its
source; every figure names a scene that is registered; stated counts match
reality; a `WEIGHTS` or `CLAIMS` array is still in descending order and its
weakest entry has not drifted upward; and a list of phrasings that have caused
trouble before does not appear.

**layout-check.js** renders the built pages in headless Chrome at six widths,
operates every control the kit can make — plus anything inside a drawing
carrying `data-fig-click` — and asserts that nothing leaves its viewBox and no
two labels overlap. Geometry comes from `getBBox()`, so results are independent
of display scale. It skips quietly with no chrome on PATH.

Its tolerance is **±0.6 user units**, tighter than the ±2 the touch story's own
checker used. That is not pedantry: text width in *user units* grows as the
drawing box shrinks — a CSS-pixel font divided by the scale factor — so a
right-anchored label in a fixed gutter can overrun the edge only at small
widths. One had been doing so by about a pixel for the life of the narrow
layout, and ±2 was exactly wide enough to hide it.

**What layout-check cannot catch, and you have to look for yourself: an opaque
shape drawn over a label.** The overlap test compares `<text>` with `<text>`; a
`<path>` or a `<foreignObject>` covering one is invisible to it. That has now
happened four times in this repository — a doorway painting over a condition
label, a note block landing on two markers, a curve drawn through its own axis
label, and a dashed guide line running through a heading. **After moving
anything in a scene, screenshot it.**

A related habit worth keeping: derive a canvas height from where the content
actually ends rather than typing a number. Every height bug so far has been a
guessed constant.

---

## refs.bib, and the order it is in

Entries are in **first-citation order across the pages**, not alphabetical,
because the AMA style numbers by order of appearance and each story's
`carry-back.qmd` pulls the whole file in with `nocite: @*`. That makes the
closing list read as a record of the route. A new entry goes in under the
section comment for the page that first cites it, at the point that page
reaches it — not appended at the end.

**Do not add an entry before its prose lands.** Because of the `nocite` pull it
would appear in the closing list uncited, and `check.js` only notes that rather
than failing.

House style: `@article{nameYY,`, given names as initials, diacritics in author
names as LaTeX escapes (`{\AA}`, `{\"o}`) while titles keep the published
characters as they stand, journal names spelled out in full, `--` page ranges,
and titles in double braces so citeproc reproduces them exactly. A published
title is a quoted record and is never reworded.

---

## The photographs

`shared/img/` holds the site's only images, cropped and graded from one walk
in a northern spruce-and-birch wood on 22 October 2026
(`images/leaves/photo_2026-10-22_*`), which is the brand's place. Nine are
bands, one per section page and one per retreat page; three are small
photographs beside the journeys on `/writing/`; the rest are the favicon and
the share card. The 8 October eucalyptus grove (`photo_2026-10-08_*`) is
retired from the site as of 2026-10-22: its last three bands (writing,
podcast, about) were re-cut from the wood so the site reads as one place. The
grove frames stay in `images/` untouched.

| file | source frame | page | why this one |
|---|---|---|---|
| `front.jpg` | 10-22 `15-08-45` | `/` | Ground level in moss, one fallen toothed leaf sharp, everything else bokeh. A living ground for a site now called a garden; the dry eucalyptus litter it replaced read as the old name. Large quiet area left. |
| `community.jpg` | 10-22 `15-09-04` | `/community/` (Gatherings) | A sunlit clearing among pines, open ground and a low stone: a place people could meet. Replaced a canopy. |
| `fg.jpg` | 10-22 `15-08-32` | `/about/fg/` | A soft mound of moss close up, the wood blurred behind it: closeness and touch, without a person in it. Half the frame is quiet. |
| `ds.jpg` | 10-22 `15-08-33`, left 160px cut | `/about/ds/` | Spruces standing rooted in a moss floor, many trees behind them: upright, and among others. The cut removes a jacket at the left edge, so this one is 1120 wide. |
| `writing.jpg` | 10-22 `15-08-31`, y 60 | `/writing/` | Low in the grass, one seed stem sharp, the wood behind it all bokeh: close attention to one thing, the way the journeys read. The quietest band on the site. |
| `podcast.jpg` | 10-22 `15-08-34`, y 60, blur 7 | `/podcast/` | A narrow path running into the wood past a mossy boulder: two people walking and talking. Replaced (2026-10-22, round 2) the crowns-from-below crop of `15-08-37`, the only cool band and the only one looking up. |
| `about.jpg` | 10-22 `15-08-46`, y 90 | `/about/` | Near moss soft, beyond it pairs of birch trunks standing close on one mound: two of them, together, in the same wood as their own pages. |
| `practitioner.jpg` | 10-22 `15-08-35`, y 300, blur 9, q72 | `/community/practitioners-circle/` | A stand of spruces on one shared moss floor: peers, each upright, on common ground. Busy, so it takes a stronger artificial depth of field. |
| `moving.jpg` | 10-22 `15-08-57`, y 180, blur 7, sat 46, gold 16% | `/community/moving-together/` | Light and open ground seen between many kinds of trunk: room to move, a mixed group. The one airy band. Re-graded warmer in round 2 (its blue sky had drifted from the set); measures L 0.43, S 0.14. |
| `thumb-touch.jpg` | 10-22 `15-08-55` | `/writing/`, beside the touch journey | Frost on fine grass: filaments, like hair, which is what the second touch system lives in. |
| `thumb-pain.jpg` | 10-22 `15-08-50` | `/writing/`, beside the pain journey | Spotted aspen leaves floating on a puddle with the sky in it: what lies on a surface, and what shows through it. |
| `thumb-breath.jpg` | 10-22 `15-08-39` | `/writing/`, beside the breath journey | Looking straight up through spruce crowns to open sky. |
| `share.jpg` | 10-22 `15-08-45` | the Open Graph card, not yet wired | Rebuilt for the new name; the old card still said *not knowing, yet* and carried the old tagline. |

The 22 October frames that were looked at and left alone: the top-down moss,
leaf and gravel frames (`15-08-29`, `-30`, `-40`, `-48`, `-53`, `-54`, `-56`)
are flat all-over texture; the sunlit birch and hazel frames (`15-08-59` to
`15-09-03`) are bright, busy and carry a lens flare (`15-08-57`, the one
without, is now Moving Together); the mossy boulders and paths (`15-08-34`,
`-41` to `-43`) are sharp everywhere with no quiet area (`-34`, cropped high
with blur 7, became the podcast band in round 2). `15-08-35` has the
same fault and was used anyway for Practitioners' Circle, with a stronger
blur (9 rather than 6) outside the sharp strip; it is the busiest band on the
site and the first to replace if a better peers image turns up. Of the near/far moss frames, `15-08-45 (2)` and `-47` stay unused: both are
near-duplicates of the front door's `15-08-45`. `15-09-05` is the same
clearing and stone as Gatherings' `15-09-04`. `15-08-44` is the same spot as
`15-08-46`.

**Unused for now (2026-10-22).** While the journeys are hidden, `/writing/`
lists its posts without pictures, so the three `thumb-*.jpg` files and the
`.thumb` rules in `warm.css` are kept but unused. They come back when a
journey is linked again: put an empty `::: {.thumb .thumb-touch}` div
(or `-pain`, `-breath`) first inside its `.item`, as in commit `076757e`.

**The photographs beside the journeys are not inside them.** They sit on
`/writing/`, which is a section page, as CSS backgrounds on an empty
`.thumb` div — so they are not content, and say nothing. The journeys
themselves, opening pages included, still carry no photograph.

**The rule that keeps them from competing with the figures.** A figure is an
object *on* the page — card, border, radius, shadow — and everything in one
makes a claim the prose has to back. A photograph is the page *itself*: it
rises out of the paper and sinks back into it, with no frame of any kind. So a
band has no border, no radius and no shadow, and **no band ever appears inside
a journey**. On a journey page every visual element carries evidence, and a
decorative one would be the only thing there that does not.

**Where a band goes: between the standfirst and the body, never at the foot.**
They were built as closing bands first, and that was wrong — on the front door
the band began 1274px down a page with about 713px of window above it, so most
readers never saw it at all. Moved up, it starts at 461–564px on every section
page and is the second thing seen. The page is still closed by the footer.

Two spacing traps came with that move. The band's own top and bottom thirds are
transparent, which supplies most of its breathing room, so it needs far less
margin than it looks — but not none: a negative bottom margin left over from
the closing-band layout dropped the next paragraph straight onto the faded
leaves, on three pages at once.

**What makes a usable band.** A wide shallow crop needs a large quiet area —
bokeh, sky, or a smooth trunk. Flat all-over texture fails at any zoom: three
litter crops were tried on `/writing/` and `/about/` and all three read as
static against the type. The images that work have a near and a far.

**How they are made.** Crop a 3.2:1 strip, grade the family together
(`-modulate 100,78,100 +level 12%,97% -brightness-contrast -3x-14`, plus about
10% gold colorize on anything that runs cool against cream paper), resize to
1600 wide, then composite a blurred copy through a vertical gradient so only a
horizontal strip stays sharp. That last step is an artificial depth of field,
and it is what makes a texture legible at band height.

The 22 October frames are brighter and far greener than the eucalyptus set,
so they take more: saturation 52 rather than 78, hue 96 (greens turned a few
degrees toward olive), `-brightness-contrast -6x-6`, and 10–12% gold colorize.
Measured against the older bands they then land in the same range — mean HSL
saturation 0.13–0.17 against 0.10–0.15, mean lightness 0.42–0.50 against
0.45–0.53. The five bands cut on the afternoon of 2026-10-22 (writing,
podcast, about and the two retreats) are greyer frames — bokeh, sky, spruce
bark — so they take saturation 56–70 instead of 52 to reach the family. They
measure saturation 0.10–0.13, lightness 0.39–0.53. The round-2 re-cuts
(podcast from `15-08-34`, saturation 60 and 12% gold; Moving Together at
saturation 46 and 16% gold, `-brightness-contrast 0x-6`) measure S 0.13–0.14,
L 0.43. They are cut at the source's native width (1280, or 1120 for
`ds.jpg`) rather than resized to 1600 — the source is 1280 wide, and an
upscale in the file only costs bytes. The browser scales either way. The
thumbnails are 480x360 crops with the same grade and no artificial depth of
field.

**The share card** is an HTML page screenshotted by headless Chrome at
1200x630, so the type is the site's own Fraunces and Newsreader: the graded
photograph across the top 430px, masked to paper over its lower half, the
name at 86px and the front door's first sentence beneath it.

**A thumbnail's edge is two linear fades intersected** (`mask-composite:
intersect`), a soft rectangle. A radial mask was tried first and read as an
oval vignette — a frame, which is what a photograph here must not have. On a
phone the thumbnail becomes a 120px strip above the title with the band's own
vertical fade.

**The fade is a CSS mask, not baked into the JPEG.** A gradient to a flat
colour is exactly where JPEG banding shows worst, and a mask lets one asset
serve more than one band height.

**Two traps.** `warm.css` reaches these with a `url()`, and **Quarto's resource
scan does not see inside CSS** — so `shared/img/**` is listed in
`project.resources`, without which the files never reach `docs/` and anything
already there is deleted. And the bands bleed to `100vw`, which includes the
scrollbar: `html{overflow-x:clip}` absorbs that. It must be `clip` and not
`hidden`, because `hidden` would make `html` a scroll container and break both
the sticky page TOC and the smooth scrolling set at the top of the stylesheet.

A third, found by screenshot on 2026-10-22: `50% - 50vw` is exact only when
the content column is centred in the viewport, and at desktop widths Quarto's
grid is not — with overlay scrollbars the band stopped about 8px short of the
left edge. Above 700px the band now bleeds 24px past the viewport on each side
and `clip` takes the excess. Not on phones, where the column is centred and
overflow is best avoided.

**The source photographs are not originals.** No EXIF, quality 72, 4:2:0
subsampling, every file capped at 1280 on the long edge — a messaging-app
re-encode. They are soft at full-bleed on a high-density screen. Re-cut the
bands from camera originals if they can be found.

## docs/ is output only

`docs/` is what GitHub Pages serves and it is Quarto's `output-dir`. Quarto
**deletes anything in there that the project does not know about** — it removed
a published story once and replaced the front door with a redirect stub. Anything that has to exist there must be a project input: rendered from a
`.qmd`, or listed under `resources`. Never hand-edit `docs/`.

---

## The render workflow

Everything runs from the **repository root**.

```bash
# 1. build the whole site — every section plus all three stories
quarto render

# 2. content audit — every story, no browser, milliseconds
node shared/tools/check.js

# 3. layout audit — reads the BUILD, so it goes after the render
node shared/tools/layout-check.js touch-journey
node shared/tools/layout-check.js pain-journey
node shared/tools/layout-check.js breath-journey
```

Every story uses the same two tools; the touch story had its own until it was
migrated onto the kit (2026-09-07), and there is no exception left.

**Read the `clicks` column.** It is how many controls the checker actually
operated, and a zero there on a story with figures means it is auditing them
at rest and telling you nothing about any other state. It refuses rather than
reporting "clean" in that case — that failure is exactly how the touch
migration started.

While drafting, the useful loop is narrower:

```bash
quarto render                                                   # or scope it:
quarto render breath-journey                                    # one story
node shared/tools/check.js breath-journey
node shared/tools/layout-check.js breath-journey 390 1400        # two widths
node shared/tools/layout-check.js breath-journey --page why-slow # one page
```

`check.js` reads source and needs no render. `layout-check.js` reads
`docs/`, so **render first or it audits a stale build** — that has caught
people out.

And the step neither tool can do: **screenshot the figure you changed.** The
layout checker compares `<text>` with `<text>`, so an opaque shape drawn over a
label is invisible to it. Four such bugs have shipped past a green checker in
this repository.

```bash
google-chrome --headless --disable-gpu --no-sandbox \
  --allow-file-access-from-files --window-size=1400,7000 \
  --virtual-time-budget=6000 --screenshot=/tmp/page.png \
  "file://$PWD/docs/breath-journey/why-slow.html"
```

## Fonts and colour tokens

Fraunces and Newsreader are **self-hosted** (`shared/fonts/`, OFL, variable
woff2, latin and latin-ext), declared by `@font-face` at the top of
`warm.css` and listed under `resources` in `_quarto.yml`. Do not reintroduce
a Google Fonts link: it sends every visitor's IP to Google, which a German
court has held unlawful without consent. `$web-font-path: false` in
`warm.scss` stops Cosmo's own `@import` of Source Sans Pro.

Fraunces is the **full upstream cut** (google/fonts `ofl/fraunces`), not the
Fonts API file, because the API drops the `SOFT` axis. It was cut with
fontTools: `WONK` pinned at 1, weight 300-700, then subset to the same two
unicode ranges. At SOFT 0 it draws exactly what the API file drew.

**The type system** (2026-10-22; the rules are at the top of `warm.css`).
Fraunces sets headings and the name, and nothing else. Headings use
`SOFT` 100, rounded for the garden. The navbar name stays at SOFT 0 to
match the outlined lockup. Everything read, labelled or clicked is
Newsreader. Sizes: 60/30/24 for h1/h2/h3 (26/22 on phones), 21.5 for the
standfirst, 19 for body, 17 for secondary, 15 for fine print. Text colours on
the brand pages: ink, ink2, and clay for links. No capitals except the
lockup's tagline, and sentence case for nav and links. Section labels are
real `##` headings, not `.eyebrow` spans. The journeys still use their
older labels (`.eyebrow`, `.year`, `.part`, `.src .lbl`, flip cards); they
have not had this pass yet.

Text uses the darker tokens: `--clay-text`, `--dis-text`, `--ink3-text`
(on paper2, use `--ink2`) and `--blue-text`. These meet WCAG AA (4.5:1). The
original `--clay`, `--dis`, `--ink3` and `--blue` stay for fills, rules and
figure drawings. `--leaf` is the mark's green.
