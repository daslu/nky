#!/usr/bin/env node
/* shared/tools/check.js — content audit, for any story.
 *
 *   node shared/tools/check.js pain-journey
 *   node shared/tools/check.js                 # every story it can find
 *
 * No dependencies, no browser, no render. Catches the failure modes these
 * pages have actually hit during authoring. Exit code 1 if anything is wrong,
 * so it can go in a pre-commit hook.
 *
 * What it does NOT catch (needs a browser — see shared/tools/layout-check.js):
 *   · figures whose drawing overflows its viewBox
 *   · labels that collide
 *   · anything about layout at all
 *
 * A story opts in simply by existing: a directory with .qmd files and a
 * refs.bib. Everything below is derived, so adding a story adds no
 * configuration.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repo = path.resolve(__dirname, "..", "..");

/* ── which stories ────────────────────────────────────────────────── */
const named = process.argv.slice(2).filter(a => !a.startsWith("-"));
const stories = (named.length ? named : fs.readdirSync(repo)
  .filter(d => !d.startsWith(".") && !d.startsWith("_") &&
    d !== "docs" && d !== "shared" &&
    fs.statSync(path.join(repo, d)).isDirectory() &&
    fs.existsSync(path.join(repo, d, "refs.bib"))))
  .sort();

if (!stories.length) { console.error("check: no stories found"); process.exit(2); }

let anyFailed = false;

for (const story of stories) {
  const root = path.join(repo, story);
  const read = f => fs.readFileSync(path.join(root, f), "utf8");
  const problems = [], notes = [];
  const fail = m => problems.push(m);
  const note = m => notes.push(m);

  /* ── sources ───────────────────────────────────────────────────── */
  const QMD = fs.readdirSync(root).filter(f => f.endsWith(".qmd")).sort();
  if (!QMD.length) { fail("no .qmd files"); }
  const pages = QMD.map(f => ({ file: f, text: read(f) }));

  const bib = fs.existsSync(path.join(root, "refs.bib")) ? read("refs.bib") : "";
  const bibKeys = new Set([...bib.matchAll(/^@\w+\{([^,]+),/gm)].map(m => m[1].trim()));

  /* Figure names come from the story's own figures.js, read rather than run:
     the file calls Fig.start() and expects a browser, so it is scanned for
     Fig.add("name") instead of evaluated. */
  const figJs = fs.existsSync(path.join(root, "js/figures.js")) ? read("js/figures.js") : "";
  const knownScenes = new Set([...figJs.matchAll(/\.add\(\s*["'`]([\w-]+)["'`]/g)].map(m => m[1]));

  /* Figure data is plain JavaScript and can be evaluated, which lets the
     shape checks below look at the real arrays rather than at source text. */
  let DATA = {};
  const dataPath = path.join(root, "js/figure-data.js");
  if (fs.existsSync(dataPath)) {
    const ctx = vm.createContext({});
    try {
      vm.runInContext(read("js/figure-data.js"), ctx, { filename: "figure-data.js" });
      DATA = vm.runInContext(
        "(() => { const o = {}; for (const k of Object.keys(globalThis)) o[k] = globalThis[k]; return o; })()",
        ctx);
      /* top-level const/let are lexical, so collect them by name instead */
      const names = [...read("js/figure-data.js").matchAll(/^const\s+([A-Z_][A-Z0-9_]*)\s*=/gm)].map(m => m[1]);
      names.forEach(n => { try { DATA[n] = vm.runInContext(n, ctx); } catch {} });
    } catch (e) { fail(`figure-data.js does not evaluate: ${e.message}`); }
  }

  /* prose with the fence lines stripped, so a fence attribute never counts as text */
  const proseOf = s => s.split("\n").filter(l => !/^:::/.test(l)).join("\n");
  const prose = pages.map(p => [p.file, proseOf(p.text)]);
  const allText = pages.map(p => p.text).join("\n");

  /* ── 1. every citation resolves ────────────────────────────────── */
  const cited = new Set();
  prose.forEach(([where, s]) => {
    [...s.matchAll(/\[@([\w-]+)\]|(?:^|\s)@([\w-]+)/g)].forEach(m => {
      const key = m[1] || m[2];
      if (!key || key === "*") return;
      if (!bibKeys.has(key)) fail(`${where}: citation @${key} has no entry in refs.bib`);
      else cited.add(key);
    });
  });
  /* An entry reaches a reader two ways: cited in the prose, or linked by URL
     from a further-reading list, which is how a story surfaces something it
     recommends without quoting. Both count as alive. */
  const bibUrls = {};
  [...bib.matchAll(/^@\w+\{([^,]+),([\s\S]*?)\n\}/gm)].forEach(m => {
    const u = m[2].match(/url\s*=\s*\{([^}]+)\}/);
    if (u) bibUrls[m[1].trim()] = u[1].trim();
  });
  bibKeys.forEach(k => {
    const linked = bibUrls[k] && allText.includes(bibUrls[k]);
    if (!cited.has(k) && !linked && !allText.includes(k))
      note(`refs.bib has "${k}" but nothing cites or links it — dead entry?`);
  });

  /* ── 2. the pre-Quarto markup is really gone ───────────────────── */
  /* Ported from the touch story's own checker when it was retired. These are
     the two hand-rolled notations that predate citeproc and the .wiki class;
     a leftover one renders as literal text rather than failing. */
  prose.forEach(([where, s]) => {
    if (/\[ref:/.test(s)) fail(`${where}: leftover [ref:] markup — should be [@key] now`);
    if (/\{\{[^}]*\|/.test(s)) fail(`${where}: leftover {{Page|text}} markup — should be a .wiki link now`);
  });

  /* ── 3. wikipedia links are well formed ────────────────────────── */
  prose.forEach(([where, s]) => {
    (s.match(/\[[^\]]*\]\([^)]*\)\{\.wiki\}/g) || []).forEach(tok => {
      const m = tok.match(/^\[([^\]]*)\]\(([^)]*)\)/);
      if (!m[1].trim()) fail(`${where}: empty wiki link text: ${tok}`);
      if (!/^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/.test(m[2]))
        fail(`${where}: .wiki link does not point at English Wikipedia: ${m[2]}`);
      if (/\s/.test(m[2])) fail(`${where}: wiki URL contains a space: ${m[2]}`);
    });
  });

  /* ── 4. every stop has the parts a stop needs ──────────────────── */
  const STOP_RE = /^## (.+?) \{#([\w-]+) \.stop data-stop="([\w-]+)"\}\s*$/gm;
  const stops = [];
  pages.forEach(p => {
    const heads = [...p.text.matchAll(/^## .*$/gm)];
    [...p.text.matchAll(STOP_RE)].forEach(m => {
      const start = m.index;
      const next = heads.find(h => h.index > start);
      stops.push({ file: p.file, title: m[1], id: m[2], stop: m[3],
        block: p.text.slice(start, next ? next.index : undefined) });
    });
  });

  const seenId = new Set(), seenStop = new Set();
  stops.forEach(s => {
    if (s.id !== s.stop) note(`stop "${s.stop}" (${s.file}) has heading id "${s.id}"`);
    if (seenId.has(s.id)) fail(`duplicate heading id "${s.id}"`);
    seenId.add(s.id);
    if (seenStop.has(s.stop)) fail(`duplicate data-stop "${s.stop}"`);
    seenStop.add(s.stop);

    [[/:::+ \{\.year\}/, "a .year eyebrow"],
     [/:::+ \{\.lead\}/, "a .lead"],
     [/:::+ \{\.src\}/, "a .src research block"],
     [/:::+ \{\.journey-figure/, "a figure"]
    ].forEach(([re, what]) => {
      if (!re.test(s.block)) fail(`stop "${s.stop}" (${s.file}) is missing ${what}`);
    });
    /* The takeaway is what the whole site is for, so a stop without one is a
       failure rather than a note. The single exception is the closing
       reference list, which has no finding and therefore nothing to translate
       into what changes in the room.

       This was a note until 2026-09-07, and all three stories tripped it on
       every run — three lines of known noise above the real output. That is
       the "a checker rule that fired on correct prose" error class in
       dev-notes/HANDOFF.md §5, in its quieter form: a warning that is always
       present is a warning nobody reads. */
    if (s.stop !== "sources" && !/:::+ \{\.hands\}/.test(s.block))
      fail(`stop "${s.stop}" (${s.file}) has no "for your hands" takeaway`);

    /* the research block must sit above the figure — a reader should not meet
       a claim before they meet its source. This ordering was a real bug once. */
    const src = s.block.search(/:::+ \{\.src\}/);
    const fig = s.block.search(/:::+ \{\.journey-figure/);
    if (src > -1 && fig > -1 && src > fig)
      fail(`stop "${s.stop}": the .src block sits below the figure — it belongs above it`);
  });

  /* ── 5. figures name a scene that exists ───────────────────────── */
  let figureCount = 0;
  pages.forEach(({ file: where, text: s }) => {
    (s.match(/data-scene="([\w-]+)"/g) || []).forEach(tok => {
      figureCount++;
      const name = tok.match(/"([\w-]+)"/)[1];
      if (knownScenes.size && !knownScenes.has(name))
        fail(`${where}: figure wants scene "${name}", which figures.js does not register`);
    });
    (s.match(/:::+ \{\.journey-figure(?![^}]*data-scene)/g) || []).forEach(() =>
      fail(`${where}: a .journey-figure has no data-scene`));
  });
  knownScenes.forEach(n => {
    if (!allText.includes(`data-scene="${n}"`))
      note(`figures.js registers "${n}" but no page uses it`);
  });

  /* ── 6. judgement figures keep their shape ─────────────────────── */
  /* A story may export WEIGHTS or CLAIMS: an ordered gradient whose whole
     value is the ordering. If it stops descending, the figure stops meaning
     anything, and nothing else would notice. */
  ["WEIGHTS", "CLAIMS"].forEach(name => {
    const arr = DATA[name];
    if (!Array.isArray(arr)) return;
    if (!arr.every((c, i, a) => i === 0 || a[i - 1].s >= c.s))
      fail(`${name} is not in descending order — the figure reads as a gradient and depends on it`);
    if (arr[arr.length - 1].s > 0.4)
      fail(`${name}: the weakest entry has drifted above 0.4, which is the point of the figure`);
  });

  /* ── 7. counts stated in prose match reality ───────────────────── */
  const words = {twelve:12, eleven:11, ten:10, nine:9, eight:8, seven:7, six:6,
                 five:5, four:4, three:3, two:2};
  const claim = (re, actual, what) => {
    const m = allText.match(re);
    if (m && words[m[1].toLowerCase()] !== undefined && words[m[1].toLowerCase()] !== actual)
      fail(`the text says "${m[1]} ${what}" but there are ${actual}`);
  };
  claim(/\b(\w+) short stops\b/, stops.length, "short stops");
  claim(/\b(\w+) stops\b/, stops.length, "stops");
  claim(/\b(\w+) things we came away with\b/,
    ((allText.split(/:::+ \{\.rules\}/)[1] || "").split(/^:::+\s*$/m)[0].match(/^- \*\*/gm) || []).length,
    "things we came away with");
  claim(/\b(\w+) sources\b/, bibKeys.size, "sources");
  if (Array.isArray(DATA.REVISIONS))
    claim(/\b(\w+) corrections from the last decade\b/, DATA.REVISIONS.length, "corrections");

  /* ── 8. phrasings that have caused trouble before ──────────────── */
  const risky = [
    [/\bproves?\b/i, "'proves' — almost nothing here proves anything"],
    [/\bwhat you learned\b/i, "assumes the reader was taught anatomy"],
    [/\bas you know\b/i, "assumes prior knowledge"],
    [/\bobviously\b/i, "'obviously'"],
    [/\bproportional to\b/i, "'proportional to' — check the paper says proportional"],
    [/\bcontents rail\b/i, "the contents rail is gone; navigation is Quarto's sidebar"],
    [/\bis wasted\b/i, "a measurement carrying a practice conclusion"],
    [/\bglabrous\b/i, "'glabrous' — say 'hairless' for a reader with no science background"],
    [/\bneuropathy\b/i, "'neuropathy' — say 'nerve disease'"],
    [/\bcures?\b/i, "'cure' — nothing on these pages cures anything"]
    /* There was a "diagnose" rule here. It fired on "not something anyone can
       diagnose from a treatment room", which is the page warning against
       exactly the thing the rule was for. A checker that flags correct prose
       trains you to skim its output, and that is how a real failure gets
       missed — so the rule went rather than the sentence. */
  ];
  prose.forEach(([where, s]) => risky.forEach(([re, why]) => {
    if (re.test(s)) fail(`${where}: ${why}`);
  }));

  /* ── report ────────────────────────────────────────────────────── */
  const wikiLinks = (allText.match(/\{\.wiki\}/g) || []).length;
  console.log(`${story}: pages ${QMD.length} · stops ${stops.length} · figures ${figureCount} · ` +
    `references ${bibKeys.size} · cited ${cited.size} · wiki links ${wikiLinks}`);
  notes.forEach(n => console.log("  note  " + n));
  problems.forEach(p => console.log("  FAIL  " + p));
  if (problems.length) anyFailed = true;
}

console.log(anyFailed ? "\nsomething is wrong." : "\nall checks pass.");
process.exit(anyFailed ? 1 : 0);
