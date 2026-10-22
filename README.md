# Notknowing Garden

The website of Notknowing Garden, run by FG and DS: spaces, online and in
person, for wellness and movement communities. The name
is provisional.

Alongside the gatherings, the site carries long-form reading journeys through
what is known — and not known — about how bodies work. Each story is
self-contained, sourced in the open, and built to be **operated**
rather than only read. Every claim names its source before you meet it, and
says how much that source can carry.

Live at **[daslu.github.io/nky](https://daslu.github.io/nky)**, and `noindex`
while it is being drafted.

```
nky/
├── _quarto.yml       the site: what renders, the theme, navbar, sidebars
├── index.qmd         the front door
├── writing/          one list of posts, journeys included
├── podcast/          the show                     placeholder
├── community/        gatherings, in person and online  placeholder
├── about/            the two of us                placeholder
├── logos/            Clojure notebooks for exploring a mark — not rendered by Quarto
├── shared/           theme, figure kit and checkers — see shared/README.md
├── touch-journey/    Touch is not one sense       ┐ not yet moved under
├── pain-journey/     Pain is not a damage report  │ writing/ —
├── breath-journey/   Breathing is not a switch    ┘ see dev-notes/HANDOFF.md
├── docs/             OUTPUT ONLY — Quarto deletes what it does not own here
└── dev-notes/        working notes — gitignored, local to a working copy
```

## Working on it

```bash
quarto render                                    # from the repo root
node shared/tools/check.js                       # content audit, all stories
node shared/tools/layout-check.js pain-journey   # layout audit, needs a build
```

Both checkers are cheap. Run them after every edit; `layout-check` reads the
built pages, so render first.

**[shared/README.md](shared/README.md)** covers the machinery — the figure kit,
the two layouts, the checkers, how citations are ordered, and how to add a
story.

Alongside it, a working copy keeps notes in **`dev-notes/`**, which is
gitignored and so is not part of what this repository publishes:
`dev-notes/HANDOFF.md` for where the site stands and what was decided, and one
per story for what was verified and how well. If you have cloned this and the
directory is not there, that is expected — the notes live only on the machine
they were written on.

## The standard

These are not style preferences. Each one exists because breaking it produced a
real error.

- **Every stop names its source before the reader meets the finding**, and
  every source carries an honest one-sentence weight assessment. Write that
  sentence before writing the prose; it disciplines what the prose may say.
- **Say when researchers disagree**, and when the evidence is thin. Every story
  ends with a figure ranking how much its own sources can carry.
- **Never let a measurement carry a conclusion it cannot support.** When a
  sentence moves from what was measured to what you should therefore do,
  re-read it.
- **Humility is calibrated, not uniform.** Hedging everything equally destroys
  the most useful thing these pages do — separating a replicated finding from a
  shaky one.
- **Nothing biological is described as having a purpose.** Say what things do
  and what they respond to, because that is what the studies measured.
- **Plain words**, except where the real name is the point — and then it is
  introduced, linked, and glossed beside.
- **The narrator is "we", and it observes rather than instructs.** These are a
  record of what two readers found, not a protocol.
- **Counts are not stated in prose.** Not the number of stops, not the number
  of sources, not the number of closing rules — "a series of short stops", not
  "twelve". Every such count lived in five or six places at once and drifted
  the moment a story grew. `check.js` still guards any number that does appear.
