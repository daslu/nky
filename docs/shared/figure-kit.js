/* figure-kit.js — the machinery every story's figures share.
 *
 * Extracted from the touch story, where the same code was written by hand for
 * each figure. What is here is everything that is not about a particular
 * subject: choosing a layout, mounting a drawing into the page, rendering the
 * controls, wiring them to state, and redrawing when something changes.
 *
 * A story supplies only the parts that are its own — the data and the drawing.
 *
 *     Fig.add("pacer", {
 *       controls: [
 *         {type:"range", key:"rate", label:"breaths a minute",
 *          min:4, max:20, step:0.5, fmt:v => v.toFixed(1)},
 *         {type:"pills", key:"depth", label:"how deep",
 *          options:[{id:"easy", n:"easy"}, {id:"full", n:"full"}]}
 *       ],
 *       draw: st => `<svg ...>`
 *     });
 *     Fig.start({rate:6, depth:"easy"});
 *
 * and in the .qmd:
 *
 *     ::: {.journey-figure data-scene="pacer"}
 *     The caption, as markdown.
 *     :::
 *
 * ── Why controls are declared rather than wired ───────────────────────────
 * In the touch story every control was hand-wired, and two of the error
 * classes its handoff records come straight from that: a control that was
 * never wired at all (the build passed, because the file was still valid
 * JavaScript), and a hint that kept saying "tap to take the hand away" after
 * the hand was already away. Declaring a control means the kit renders it,
 * wires it, keeps its label in step with its value and redraws — so neither
 * mistake is available.
 *
 * ── Two layouts ───────────────────────────────────────────────────────────
 * Scenes are drawn against W: 860 wide, 420 narrow. Every scene must branch on
 * NARROW. The choice is made from the figure's OWN box width, not the
 * viewport, because a sidebar and a margin table of contents mean the viewport
 * stops predicting the drawing box — at a 1100px window the reading column is
 * about 560px, and an 860-unit scene puts its labels at 8.8px there.
 */

/* ── drawing width ─────────────────────────────────────────────────────── */

const WIDE_W = 860, NARROW_W = 420;

/* A label is drawn at fontsize x (box px / W). At W=860 a 13-unit label needs
   about 600px of box to clear 9px, below which it stops being readable. */
const WIDE_MIN = 640;

let NARROW = false;
let W = WIDE_W;

function layout(narrow){
  NARROW = !!narrow;
  W = NARROW ? NARROW_W : WIDE_W;
  return NARROW;
}

/* ── small helpers every scene wants ───────────────────────────────────── */

const esc = s => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/* Round for output. SVG coordinates with sixteen decimal places make the
   markup unreadable and change nothing on screen. */
const r2 = n => Math.round(n * 100) / 100;

/* Wrapped prose inside an SVG. foreignObject is the only way to get real line
   breaking, and its declared height is what getBBox reports — so the height
   given here is what the layout checker measures, and it has to be enough for
   the text or the text spills past it silently. */
function prose(x, y, w, h, html, opts){
  const o = opts || {};
  return `<foreignObject x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Newsreader,serif;
      font-size:${o.size || 13}px;line-height:${o.leading || 1.45};
      text-align:${o.align || "left"};
      color:var(${o.color || "--ink2"})">${html}</div>
    </foreignObject>`;
}

/* A soft horizontal scale: the page's charts have no gridlines and no box, so
   an axis is a rounded track with the ends named. */
function track(x0, x1, y, opts){
  const o = opts || {};
  let s = `<line x1="${r2(x0)}" y1="${r2(y)}" x2="${r2(x1)}" y2="${r2(y)}"
    stroke="var(${o.color || "--soft"})" stroke-width="${o.weight || 7}" stroke-linecap="round"/>`;
  if(o.left)  s += `<text class="xs" x="${r2(x0)}" y="${r2(y + (o.labelDy || 26))}">${esc(o.left)}</text>`;
  if(o.right) s += `<text class="xs" x="${r2(x1)}" y="${r2(y + (o.labelDy || 26))}" text-anchor="end">${esc(o.right)}</text>`;
  return s;
}

/* A filled portion of a track, for a value read against it. */
function fill(x0, x, y, colour, opts){
  const o = opts || {};
  return `<line x1="${r2(x0)}" y1="${r2(y)}" x2="${r2(x)}" y2="${r2(y)}"
    stroke="var(${colour})" stroke-width="${o.weight || 7}" stroke-linecap="round"
    opacity="${o.opacity == null ? 0.55 : o.opacity}"/>`;
}

/* A divider with a heading, for a figure that holds two kinds of thing at
   once — an illustration above it and a measured result below, say. Whenever
   a figure does that, the reader has to be told which is which. */
function divider(y, text, opts){
  const o = opts || {};
  const pad = o.pad == null ? (NARROW ? 12 : 70) : o.pad;
  let s = `<line x1="${r2(NARROW ? 12 : 0)}" y1="${r2(y)}" x2="${r2(NARROW ? W - 12 : W)}" y2="${r2(y)}"
    stroke="var(--rule)" stroke-width="1.5"/>`;
  if(text) s += `<text class="lab" x="${r2(pad)}" y="${r2(y + 30)}"
    style="fill:var(${o.colour || "--clay"})">${esc(text)}</text>`;
  return s;
}

/* Open an SVG. Every scene needs the same header, and every scene needs an
   aria-label, so asking for one here means none gets forgotten. */
function svgOpen(h, label){
  return `<svg viewBox="0 0 ${W} ${r2(h)}" role="img" aria-label="${esc(label)}">`;
}

/* A control's key may be a dotted path — "f.threat" reads and writes
   state.f.threat. It lets a figure with five switches of the same kind keep
   them together instead of scattering five top-level keys through the state,
   and costs two small functions. */
function getPath(obj, path){
  return path.split(".").reduce((a, k) => a == null ? a : a[k], obj);
}
function setPath(obj, path, value){
  const keys = path.split("."), last = keys.pop();
  const target = keys.reduce((a, k) => (a[k] = a[k] || {}), obj);
  target[last] = value;
}

/* ── the figure registry ───────────────────────────────────────────────── */

const Fig = (function(){
  const defs  = {};        /* name -> {controls, draw, wire, aria} */
  let   state = {};
  let   started = false;

  /* --- controls -------------------------------------------------------- */

  /* Each kind knows how to render itself, read its value out of an event and
     say what its own readout should be. Adding a kind here makes it available
     to every story. */
  const KINDS = {
    /* a row of mutually exclusive buttons */
    pills: (c, st) => `${c.label ? `<span>${esc(c.label)}</span>` : ""}
      ${c.options.map(o => `<button class="pill" data-fig-set="${esc(c.key)}"
        data-fig-val="${esc(o.id)}"
        aria-pressed="${String(getPath(st, c.key)) === String(o.id)}">${esc(o.n)}</button>`).join("")}`,

    /* one button that flips between two states, label included — the label is
       rendered from the value, so it cannot fall out of step with it */
    toggle: (c, st) => `<button class="pill" data-fig-toggle="${esc(c.key)}"
        aria-pressed="${!!getPath(st, c.key)}">${esc(getPath(st, c.key) ? c.on : c.off)}</button>
      ${c.hint ? `<span style="color:var(--ink3-text)" data-fig-hint="${esc(c.key)}">${
        esc(getPath(st, c.key) ? c.hint.on : c.hint.off)}</span>` : ""}`,

    /* A slider, with its value beside it when there is one to show. The label
       wrapper and the readout are each rendered only if asked for: the
       controls row is a flex row, so an empty <b> or an empty <label> still
       takes a gap and moves everything after it. */
    range: (c, st) => {
      const input = `<input type="range" data-fig-range="${esc(c.key)}"
          min="${c.min}" max="${c.max}" step="${c.step == null ? 1 : c.step}"
          value="${getPath(st, c.key)}" aria-label="${esc(c.aria || c.label || c.key)}">`;
      /* The space after the label text is deliberate: without it the slider
         butts against its own label. It is also what the hand-written markup
         this replaced happened to produce, which is how it was noticed. */
      return (c.label ? `<label>${esc(c.label)} ${input}</label>` : input) +
        (c.fmt ? `<b data-fig-out="${esc(c.key)}">${esc(c.fmt(getPath(st, c.key)))}</b>` : "");
    },

    /* a button that does not hold state — reveals an answer, replays a motion */
    action: (c, st) => `<button class="pill" data-fig-act="${esc(c.key)}">${esc(c.n)}</button>
      ${c.note ? `<span style="color:var(--ink3-text)" data-fig-note="${esc(c.key)}">${esc(c.note)}</span>` : ""}`,

    /* Author-written words in a control row — a question the buttons answer,
       say. Its `html` is NOT escaped, because it is written here rather than
       coming from anywhere a reader can reach. */
    text: (c, st) => `<span>${typeof c.html === "function" ? c.html(st) : c.html}</span>`
  };

  const fmtOf = c => c.fmt || (v => String(v));

  /* `controls` may be an array, or a function of state returning one. The
     second form is for a figure whose control row itself changes with state —
     a predict-then-reveal swaps its slider for a "hide it again" button once
     the answer is out. */
  const controlsOf = (def, st) =>
    typeof def.controls === "function" ? def.controls(st) : def.controls;

  function controlsHtml(def, st){
    const declared = controlsOf(def, st);
    const def2 = {controls: declared};
    if(!declared || !declared.length) return "";
    /* Controls declared in one array render as one row. A story that wants two
       rows declares an array of arrays — used where a figure has two kinds of
       control that should not read as one set. */
    const rows = Array.isArray(declared[0]) ? declared : [declared];
    return rows.map(row => `<div class="controls">${
      row.map(c => KINDS[c.type](c, st)).join("")}</div>`).join("");
  }

  /* --- mounting -------------------------------------------------------- */

  /* The caption is whatever the .qmd put inside the div. Captured once and put
     back on every redraw, so a layout flip does not eat it. */
  const CAPTIONS = new WeakMap();

  function hosts(){ return document.querySelectorAll(".journey-figure[data-scene]"); }

  function mountOne(el){
    const name = el.dataset.scene;
    const def  = defs[name];
    if(!def){ console.warn(`figure-kit: no figure named "${name}"`); return; }
    if(!CAPTIONS.has(el)) CAPTIONS.set(el, el.innerHTML.trim());
    const cap = CAPTIONS.get(el);
    el.innerHTML =
      controlsHtml(def, state) +
      `<div data-fig-draw="${esc(name)}">${def.draw(state)}</div>` +
      (cap ? `<div class="cap">${cap}</div>` : "");
    afterDraw(name);
  }

  /* Runs after every draw — the first one included. A figure with clickable
     parts inside its own drawing, or with an animation, has to re-attach
     after each draw, because redrawing replaces the drawing and takes its
     listeners with it. Anything in `after` must therefore be safe to run
     repeatedly. */
  function afterDraw(name){
    const def = defs[name];
    if(def && def.after) def.after(state, {redraw: () => redraw(name),
                                           refresh: () => refresh(name)});
  }

  /* Redraw one figure's drawing without rebuilding its controls, so a slider
     keeps focus and keyboard control while it is being dragged. */
  function redraw(name){
    const def = defs[name];
    document.querySelectorAll(`[data-fig-draw="${name}"]`)
      .forEach(d => { d.innerHTML = def.draw(state); });
    afterDraw(name);
  }

  /* Rebuild a figure completely — needed when a control's own appearance
     depends on state that another control changed. */
  function refresh(name){
    hosts().forEach(el => { if(el.dataset.scene === name){ mountOne(el); wireOne(el); } });
  }

  /* --- wiring ---------------------------------------------------------- */

  function defOf(el){
    const host = el.closest(".journey-figure[data-scene]");
    return host ? [host.dataset.scene, defs[host.dataset.scene]] : [null, null];
  }

  function wireOne(root){
    root.querySelectorAll("[data-fig-set]").forEach(b => b.onclick = () => {
      const [name, def] = defOf(b);
      const key = b.dataset.figSet;
      /* A DOM attribute is always a string. A figure whose option ids are
         numbers — three temperatures, say — compares them with === in its
         drawing code and would never match, so `coerce: "number"` on the
         control says to store what the scene expects. */
      const c = findControl(def, key);
      const raw = b.dataset.figVal;
      setPath(state, key, c && c.coerce === "number" ? +raw : raw);
      root.querySelectorAll(`[data-fig-set="${key}"]`).forEach(z =>
        z.setAttribute("aria-pressed", z.dataset.figVal === String(getPath(state, key))));
      redraw(name);
    });

    root.querySelectorAll("[data-fig-toggle]").forEach(b => b.onclick = () => {
      const [name, def] = defOf(b);
      const key = b.dataset.figToggle;
      setPath(state, key, !getPath(state, key));
      const val = getPath(state, key);
      b.setAttribute("aria-pressed", !!val);
      /* the button's own label and its hint both follow the value, which is
         the whole reason interface text here cannot go stale */
      const c = findControl(def, key);
      b.textContent = val ? c.on : c.off;
      const hint = root.querySelector(`[data-fig-hint="${key}"]`);
      if(hint && c.hint) hint.textContent = val ? c.hint.on : c.hint.off;
      redraw(name);
    });

    root.querySelectorAll("[data-fig-range]").forEach(inp => inp.oninput = () => {
      const [name, def] = defOf(inp);
      const key = inp.dataset.figRange;
      setPath(state, key, +inp.value);
      const c = findControl(def, key);
      const out = root.querySelector(`[data-fig-out="${key}"]`);
      if(out) out.textContent = fmtOf(c)(getPath(state, key));
      redraw(name);
    });

    root.querySelectorAll("[data-fig-act]").forEach(b => b.onclick = () => {
      const [name, def] = defOf(b);
      const c = findControl(def, b.dataset.figAct);
      if(c && c.run) c.run(state, {
        redraw: () => redraw(name),
        refresh: () => refresh(name),
        note: t => {
          const n = root.querySelector(`[data-fig-note="${c.key}"]`);
          if(n) n.textContent = t;
        }
      });
    });

    const [name, def] = [root.dataset.scene, defs[root.dataset.scene]];
    if(def && def.wire) def.wire(state, {redraw: () => redraw(name), root});
  }

  const flat = cs => !cs ? [] : (Array.isArray(cs[0]) ? [].concat.apply([], cs) : cs);
  const findControl = (def, key) => flat(controlsOf(def, state)).find(z => z.key === key);

  /* --- layout ---------------------------------------------------------- */

  function boxWidth(){
    const f = document.querySelector(".journey-figure");
    if(!f) return window.innerWidth;
    const cs = getComputedStyle(f);
    return f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  let lastNarrow = null;

  function render(){
    const narrow = boxWidth() < WIDE_MIN;
    lastNarrow = narrow;
    layout(narrow);
    hosts().forEach(el => {
      el.classList.toggle("is-narrow", narrow);
      mountOne(el);
      wireOne(el);
    });
  }

  return {
    add(name, def){ defs[name] = def; return this; },

    start(initial){
      state = Object.assign({}, initial);
      if(started) return;
      started = true;
      render();
      /* Re-render only when the decision actually flips, not on every tick. */
      const recheck = () => { if((boxWidth() < WIDE_MIN) !== lastNarrow) render(); };
      if(typeof ResizeObserver === "function"){
        const t = document.querySelector(".journey-figure");
        if(t) new ResizeObserver(recheck).observe(t);
      }
    },

    get state(){ return state; },
    redraw, refresh,
    /* every declared figure name, so a checker can compare against the pages */
    names(){ return Object.keys(defs); }
  };
})();

/* Node can require this file to read the registry without a browser; the
   checkers use that to audit figure names without rendering anything. */
if(typeof module !== "undefined" && module.exports)
  module.exports = {Fig, layout, esc, clamp, r2, prose, track, fill, divider, svgOpen,
    getPath, setPath,
    WIDE_W, NARROW_W, WIDE_MIN};
