/* scenes.js — the illustrations.
 *
 * Deliberately not charts. Rounded caps, soft fills, no gridlines, no axes
 * unless one is genuinely needed. Everything is drawn at 860 wide and
 * scales down.
 *
 * A small deterministic wobble is applied to the long "slow road" paths so
 * they read as drawn rather than plotted — the fast road stays straight,
 * which is also the point. */

/* W, NARROW, layout(), esc() and clamp() now come from ../shared/figure-kit.js,
   which every story shares. They used to be declared here; two copies of the
   same top-level const in one page is a redeclaration error, so the kit is the
   only place they live.
 *
 * The meaning of them is unchanged. Scenes are drawn in user units against W —
 * 860 wide, 420 narrow — and the SVG scales to fit its box, so what the reader
 * sees is (box px / W). At 860 on a phone that factor is about 0.36, which puts
 * a 13-unit label at 4.7px; hence the narrow layouts. The choice is made from
 * the figure's own box width rather than the viewport, because with a sidebar
 * and a margin table of contents the viewport stops predicting the drawing box.
 */

/* forearm shape used in several scenes */
function arm(x,y,w,h){
  return `<path d="M${x} ${y+h/2}
    q${w*0.06} ${-h/2} ${w*0.30} ${-h*0.44}
    q${w*0.34} ${-h*0.10} ${w*0.58} ${h*0.02}
    q${w*0.12} ${h*0.06} ${w*0.12} ${h*0.42}
    q0 ${h*0.36} ${-w*0.12} ${h*0.42}
    q${-w*0.24} ${h*0.12} ${-w*0.58} ${h*0.02}
    q${-w*0.24} ${h*0.06} ${-w*0.30} ${-h*0.44} Z"
    fill="var(--soft)" stroke="var(--rule)" stroke-width="2"/>`;
}

/* ══ 1. two roads ══════════════════════════════════════════════ */
/* Narrow: the destinations stack at the top and both roads climb the whole
   height, so the gap between them still reads as distance travelled. */
function roadsNarrow(){
  const H=430, sy=352, tx=62;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Two nerve routes leaving the skin: a fast straight one and a slow wandering one">`;
  s+=`<rect x="12" y="${sy}" width="${W-24}" height="26" rx="13" fill="var(--soft)"/>`;
  s+=`<text class="xs" x="18" y="${sy+44}">skin</text>`;
  s+=`<circle cx="${tx}" cy="${sy+13}" r="13" fill="var(--clay)" opacity=".25"/>`;
  s+=`<circle cx="${tx}" cy="${sy+13}" r="6" fill="var(--clay)"/>`;
  s+=`<text class="sm" x="${tx+28}" y="${sy+64}">a hand lands here</text>`;
  const box=(y,t1,t2,c)=>`<rect x="10" y="${y}" width="${W-20}" height="70" rx="18"
      fill="var(--card)" stroke="var(${c})" stroke-width="2"/>
    <text class="lab" x="28" y="${y+30}" style="fill:var(${c})">${esc(t1)}</text>
    <text class="sm" x="28" y="${y+54}">${esc(t2)}</text>`;
  s+=box(14,"what and where","texture, edges, exact spot","--blue");
  s+=box(108,"how it feels","pleasant, close, being cared for","--clay");
  s+=`<path id="fastPath" d="M${tx+10} ${sy+4}L${W-104} 92" stroke="var(--blue)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M${W-104} 92l-1 -17m1 17l-16 -6" stroke="var(--blue)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  s+=`<path id="slowPath" d="M${tx+6} ${sy+18}
    C${tx+140} ${sy+2} ${tx-34} 296 ${tx+124} 272
    S${W-186} 244 ${W-152} 190" stroke="var(--clay)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M${W-152} 190l3 -17m-3 17l-15 -8" stroke="var(--clay)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  s+=`<text class="xs" x="${W-14}" y="218" text-anchor="end" style="fill:var(--blue)">fast · arrives at once</text>`;
  s+=`<text class="xs" x="${W-14}" y="330" text-anchor="end" style="fill:var(--clay)">slow · about a second behind</text>`;
  s+=`<circle id="fastDot" cx="${tx+10}" cy="${sy+4}" r="8" fill="var(--blue)" opacity="0"/>`;
  s+=`<circle id="slowDot" cx="${tx+6}" cy="${sy+18}" r="8" fill="var(--clay)" opacity="0"/>`;
  s+=`<text class="xs" id="fastLand" x="${W-28}" y="32" text-anchor="end" opacity="0" style="fill:var(--blue)">arrived</text>`;
  s+=`<text class="xs" id="slowLand" x="${W-28}" y="126" text-anchor="end" opacity="0" style="fill:var(--clay)">arrived</text>`;
  return s+"</svg>";
}

function sceneRoads(){
  if(NARROW) return roadsNarrow();
  const H=330, sx=90, sy=252;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Two nerve routes leaving the skin: a fast straight one and a slow wandering one">`;
  /* skin */
  s+=`<rect x="60" y="${sy}" width="${W-120}" height="26" rx="13" fill="var(--soft)"/>`;
  s+=`<text class="xs" x="72" y="${sy+43}">skin</text>`;
  /* the touch */
  s+=`<circle cx="${sx+58}" cy="${sy+13}" r="13" fill="var(--clay)" opacity=".25"/>`;
  s+=`<circle cx="${sx+58}" cy="${sy+13}" r="6" fill="var(--clay)"/>`;
  s+=`<text class="sm" x="${sx+58}" y="${sy+62}" text-anchor="middle">a hand lands here</text>`;
  /* fast road — dead straight */
  s+=`<path id="fastPath" d="M${sx+70} ${sy+6}L${W-300} 74" stroke="var(--blue)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M${W-300} 74l-16 -2m16 2l-6 15" stroke="var(--blue)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  /* slow road — wanders */
  s+=`<path id="slowPath" d="M${sx+66} ${sy+20}
    C${sx+220} ${sy+30} ${sx+180} 200 ${sx+330} 196
    S${W-430} 168 ${W-300} 174" stroke="var(--clay)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M${W-300} 174l-15 -5m15 5l-8 13" stroke="var(--clay)" stroke-width="4"
    fill="none" stroke-linecap="round"/>`;
  /* destinations */
  const box=(x,y,t1,t2,c)=>`<rect x="${x}" y="${y}" width="248" height="66" rx="18"
      fill="var(--card)" stroke="var(${c})" stroke-width="2"/>
    <text class="lab" x="${x+20}" y="${y+28}" style="fill:var(${c})">${esc(t1)}</text>
    <text class="sm" x="${x+20}" y="${y+50}">${esc(t2)}</text>`;
  s+=box(W-288, 42, "what and where", "texture, edges, exact spot", "--blue");
  s+=box(W-288, 142, "how it feels", "pleasant, close, being cared for", "--clay");
  /* speed annotations */
  s+=`<text class="sm" x="${sx+250}" y="150" style="fill:var(--blue)">fast · arrives at once</text>`;
  s+=`<text class="sm" x="${sx+250}" y="${sy-24}" style="fill:var(--clay)">slow · arrives about a second behind</text>`;
  /* the two travellers, parked at the skin until a touch is sent */
  s+=`<circle id="fastDot" cx="${sx+70}" cy="${sy+6}" r="8" fill="var(--blue)" opacity="0"/>`;
  s+=`<circle id="slowDot" cx="${sx+66}" cy="${sy+20}" r="8" fill="var(--clay)" opacity="0"/>`;
  s+=`<text class="xs" id="fastLand" x="${W-288}" y="34" opacity="0" style="fill:var(--blue)">arrived</text>`;
  s+=`<text class="xs" id="slowLand" x="${W-288}" y="134" opacity="0" style="fill:var(--clay)">arrived</text>`;
  return s+"</svg>";
}

/* ══ 2. microneurography ═══════════════════════════════════════ */
function sceneMicro(st){
  const sharp = st && st.stim === "sharp";
  /* Narrow: the arm sits above the recording panel instead of beside it. */
  const H  = NARROW ? 486 : 272;
  const bx = NARROW ? 20 : 540;
  const by = NARROW ? 254 : 88;
  const bw = NARROW ? W-16 : W-bx-52;
  const bh = NARROW ? 172 : 150;
  const sx = NARROW ? 150 : 250;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Listening to single nerve fibres while the skin is ${sharp?"prodded":"brushed"}">`;
  s+= NARROW ? arm(16, 62, 300, 100) : arm(70, 60, 420, 120);
  if(sharp){
    s+=`<path d="M${sx} ${NARROW?32:40}l0 26" stroke="var(--ink3)" stroke-width="5" stroke-linecap="round"/>`;
    s+=`<path d="M${sx-6} ${NARROW?58:66}l6 12l6 -12Z" fill="var(--ink2)"/>`;
    s+=`<text class="xs" x="${sx}" y="${NARROW?22:30}" text-anchor="middle">a sharp point</text>`;
  }else{
    s+=`<path d="M${sx} ${NARROW?36:44}l0 30" stroke="var(--ink3)" stroke-width="5" stroke-linecap="round"/>`;
    s+=`<path d="M${sx-12} ${NARROW?66:74}q12 16 24 0" fill="var(--clay)" opacity=".5"/>`;
    s+=`<text class="xs" x="${sx}" y="${NARROW?26:34}" text-anchor="middle">a soft brush</text>`;
  }
  if(NARROW){
    s+=`<path d="M340 186L296 128" stroke="var(--ink3)" stroke-width="3" stroke-linecap="round"/>`;
    s+=`<circle cx="296" cy="128" r="5" fill="var(--ink3)"/>`;
    s+=`<text class="xs" x="14" y="206">a very fine electrode, in an awake person</text>`;
  }else{
    s+=`<path d="M470 196L400 132" stroke="var(--ink3)" stroke-width="3" stroke-linecap="round"/>`;
    s+=`<circle cx="400" cy="132" r="5" fill="var(--ink3)"/>`;
    /* anchored left of the recording panel: at x=478 it ran under the
       "the slow one" label inside the panel at the same y. */
    s+=`<text class="xs" x="460" y="214" text-anchor="end">a very fine electrode, in an awake person</text>`;
  }
  s+=`<rect x="${bx-12}" y="${by-40}" width="${bw}" height="${bh}" rx="16" fill="var(--paper2)"/>`;
  s+=`<text class="xs" x="${bx+4}" y="${by-18}">what the electrode hears</text>`;
  const right = NARROW ? W-30 : W-76;
  const spikes=(y,seed,n,col)=>{
    if(n===0) return `<line x1="${bx}" y1="${y}" x2="${right}" y2="${y}" stroke="var(${col})"
      stroke-width="2" stroke-linecap="round" opacity=".45"/>`;
    let d=`M${bx} ${y}`;
    for(let i=0;i<n;i++){
      const x=bx+8+(i*(right-bx-24)/n)+((seed*(i+3))%7);
      d+=`L${x} ${y}L${x+2} ${y-22}L${x+4} ${y}`;
    }
    return `<path d="${d}L${right} ${y}" fill="none" stroke="var(${col})" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  s+=spikes(by+26, 3, sharp?20:26, "--blue");
  s+=`<text class="xs" x="${bx+4}" y="${by+44}" style="fill:var(--blue)">a fast fibre — answers to both</text>`;
  s+=spikes(by+96, 5, sharp?1:9, "--clay");
  s+=`<text class="xs" x="${bx+4}" y="${by+114}" style="fill:var(--clay)">${sharp
    ? "the slow one — almost nothing"
    : "the slow one — new, and not rare"}</text>`;
  if(NARROW){
    s+=`<text class="big" x="14" y="428">${sharp?"quiet":"27 of 38"}</text>`;
    s+=`<text class="sm" x="14" y="454">${sharp
      ? "these fibres barely answer a sharp stimulus —"
      : "units selected for answering gentle touch"}</text>`;
    s+=`<text class="sm" x="14" y="474">${sharp
      ? "which is how they were told apart"
      : "were of this slow kind"}</text>`;
  }else{
    s+=`<text class="big" x="118" y="240">${sharp?"quiet":"27 of 38"}</text>`;
    s+=`<text class="sm" x="${sharp?238:290}" y="234">${sharp
      ? "these fibres barely answer a sharp"
      : "units selected for answering gentle"}</text>`;
    s+=`<text class="sm" x="${sharp?238:290}" y="254">${sharp
      ? "stimulus — which is how they were told apart"
      : "touch were of this slow kind"}</text>`;
  }
  return s+"</svg>";
}

/* ══ 3. the patient ════════════════════════════════════════════ */
function scenePatient(){
  /* Narrow: the two panels stack instead of sitting side by side. */
  const PW = NARROW ? W-20 : 360;
  const H  = NARROW ? 604 : 300;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="With the fast road missing, gentle touch still arrives — at a different place">`;
  const panel=(x,y,title,fastOn)=>{
    let g=`<text class="lab" x="${x+8}" y="${y+26}">${esc(title)}</text>`;
    g+=`<rect x="${x}" y="${y+44}" width="${PW}" height="228" rx="20"
      fill="${fastOn?"var(--paper2)":"var(--card)"}" stroke="var(--rule)" stroke-width="${fastOn?0:2}"/>`;
    g+=`<rect x="${x+24}" y="${y+228}" width="${PW-48}" height="20" rx="10" fill="var(--soft)"/>`;
    g+=`<circle cx="${x+70}" cy="${y+238}" r="8" fill="var(--clay)" opacity=".6"/>`;
    g+=`<path d="M${x+78} ${y+232}L${x+PW-118} ${y+96}" stroke="var(--blue)" stroke-width="4"
      fill="none" stroke-linecap="round" opacity="${fastOn?1:.16}"
      ${fastOn?"":'stroke-dasharray="7 8"'}/>`;
    g+=`<path d="M${x+76} ${y+242}C${x+150} ${y+246} ${x+130} ${y+190} ${x+PW-118} ${y+184}"
      stroke="var(--clay)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    g+=`<rect x="${x+PW-114}" y="${y+76}" width="106" height="40" rx="14" fill="var(--card)"
      stroke="var(--blue)" stroke-width="2" opacity="${fastOn?1:.2}"/>`;
    g+=`<text class="xs" x="${x+PW-61}" y="${y+94}" text-anchor="middle"
      opacity="${fastOn?1:.35}" style="fill:var(--blue)">touch map</text>`;
    g+=`<text class="xs" x="${x+PW-61}" y="${y+109}" text-anchor="middle"
      opacity="${fastOn?1:.35}" style="fill:var(--blue)">what &amp; where</text>`;
    g+=`<rect x="${x+PW-114}" y="${y+164}" width="106" height="40" rx="14" fill="var(--card)"
      stroke="var(--clay)" stroke-width="2"/>`;
    g+=`<text class="xs" x="${x+PW-61}" y="${y+182}" text-anchor="middle" style="fill:var(--clay)">insula</text>`;
    g+=`<text class="xs" x="${x+PW-61}" y="${y+197}" text-anchor="middle" style="fill:var(--clay)">body feeling</text>`;
    if(!fastOn){
      g+=`<text class="sm" x="${x+90}" y="${y+140}" style="fill:var(--ink3)">this road is gone</text>`;
      g+=`<text class="sm" x="${x+96}" y="${y+212}" style="fill:var(--clay)">this one still works</text>`;
    }
    return g;
  };
  if(NARROW){ s+=panel(10, 0, "Most people", true); s+=panel(10, 300, "This patient", false); }
  else { s+=panel(20, 0, "Most people", true); s+=panel(468, 0, "This patient", false); }
  return s+"</svg>";
}

/* ══ 4. the speed dial ═════════════════════════════════════════ */
const SPEEDS=[0.3,1,3,10,30];
const CT   =[0.20,0.66,0.92,0.72,0.24];   // slow fibres — a hill
const AB   =[0.12,0.26,0.44,0.70,0.96];   // fast fibres — a ramp
/* Where the stroking dot travels. page.js animates it, so the geometry has to
   be readable from outside — it differs between the two layouts. */
let STROKE_GEOM={x:132, span:598};

function sceneSpeed(st){
  /* Narrow: the plot takes the full width, its two label blocks move below it
     as a pair of columns, and the forearm goes underneath those. */
  const H  = NARROW ? 452 : 340;
  const L  = NARROW ? 44 : 92;
  const R  = NARROW ? 14 : 210;
  const T  = NARROW ? 44 : 34;
  const PH = NARROW ? 130 : 140;
  const lv=v=>Math.log(v)/Math.LN10;
  const x=v=>L+(lv(v)-lv(0.25))/(lv(40)-lv(0.25))*(W-L-R);
  const y=v=>T+PH-v*PH;
  const at=arr=>{
    const v=st.vel;
    if(v<=SPEEDS[0])return arr[0]; if(v>=SPEEDS[4])return arr[4];
    let i=0; while(SPEEDS[i+1]<v) i++;
    const t=(lv(v)-lv(SPEEDS[i]))/(lv(SPEEDS[i+1])-lv(SPEEDS[i]));
    return arr[i]+(arr[i+1]-arr[i])*t;
  };
  const smooth=arr=>{
    let d="";
    for(let i=0;i<=70;i++){
      const v=Math.pow(10, lv(0.3)+(lv(30)-lv(0.3))*i/70);
      let j=0; while(j<3 && SPEEDS[j+1]<v) j++;
      const t=(lv(v)-lv(SPEEDS[j]))/(lv(SPEEDS[j+1])-lv(SPEEDS[j]));
      d+=(i?"L":"M")+x(v).toFixed(1)+" "+y(arr[j]+(arr[j+1]-arr[j])*t).toFixed(1);
    }
    return d;
  };
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Slow fibres respond most at middling speeds; fast fibres just track speed">`;
  s+=`<rect x="${x(1)}" y="${T-6}" width="${x(10)-x(1)}" height="${PH+12}" rx="14"
    fill="var(--clay)" opacity=".08"/>`;
  s+=`<text class="xs" x="${(x(1)+x(10))/2}" y="${T-14}" text-anchor="middle" style="fill:var(--dis)">the hill · 1–10 cm a second</text>`;
  s+=`<path d="${smooth(AB)}" fill="none" stroke="var(--blue)" stroke-width="3.5"
    stroke-linecap="round"/>`;
  s+=`<path d="${smooth(CT)}" fill="none" stroke="var(--clay)" stroke-width="4"
    stroke-linecap="round"/>`;
  SPEEDS.forEach(v=>{
    s+=`<circle cx="${x(v)}" cy="${y(CT[SPEEDS.indexOf(v)])}" r="4" fill="var(--clay)"/>`;
    s+=`<text class="xs" x="${x(v)}" y="${T+PH+22}" text-anchor="middle">${v}</text>`;
  });
  s+=`<text class="xs" x="${L-14}" y="${T+8}" text-anchor="end">more</text>`;
  s+=`<text class="xs" x="${L-14}" y="${T+PH+4}" text-anchor="end">less</text>`;
  s+=`<text class="xs" x="${(L+W-R)/2}" y="${T+PH+44}" text-anchor="middle">centimetres a second</text>`;
  s+=`<line x1="${x(st.vel)}" y1="${T-6}" x2="${x(st.vel)}" y2="${T+PH+6}"
    stroke="var(--ink)" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;
  s+=`<circle cx="${x(st.vel)}" cy="${y(at(CT))}" r="7" fill="var(--clay)"
    stroke="var(--card)" stroke-width="2.5"/>`;
  /* the two label blocks */
  if(NARROW){
    const LY=T+PH+82;
    s+=`<text class="sm" x="14" y="${LY}" style="fill:var(--blue)">fast fibres</text>`;
    s+=`<text class="xs" x="14" y="${LY+19}">faster brush,</text>`;
    s+=`<text class="xs" x="14" y="${LY+35}">more firing</text>`;
    s+=`<text class="sm" x="216" y="${LY}" style="fill:var(--clay)">slow fibres</text>`;
    s+=`<text class="xs" x="216" y="${LY+19}">and the pleasantness</text>`;
    s+=`<text class="xs" x="216" y="${LY+35}">ratings agreed</text>`;
  }else{
    let ya=y(AB[4])+5, yc=y(CT[2])+5;
    if(Math.abs(ya-yc)<62){ if(ya<yc){ yc=ya+62; } else { ya=yc+62; } }
    s+=`<text class="sm" x="${W-R+12}" y="${ya.toFixed(1)}" style="fill:var(--blue)">fast fibres</text>`;
    s+=`<text class="xs" x="${W-R+12}" y="${(ya+19).toFixed(1)}">faster brush,</text>`;
    s+=`<text class="xs" x="${W-R+12}" y="${(ya+35).toFixed(1)}">more firing</text>`;
    s+=`<text class="sm" x="${W-R+12}" y="${yc.toFixed(1)}" style="fill:var(--clay)">slow fibres</text>`;
    s+=`<text class="xs" x="${W-R+12}" y="${(yc+19).toFixed(1)}">and the pleasantness</text>`;
    s+=`<text class="xs" x="${W-R+12}" y="${(yc+35).toFixed(1)}">ratings agreed</text>`;
  }
  /* the real-speed stroke */
  const AY = NARROW ? T+PH+184 : T+PH+72;
  const AX = NARROW ? 14 : L;
  const AW = NARROW ? W-28 : W-L-R+120;
  s+=arm(AX, AY, AW, NARROW?58:66);
  STROKE_GEOM={x:AX+40, span:AW-80};
  s+=`<circle id="stroker" cx="${AX+40}" cy="${AY+(NARROW?29:33)}" r="11" fill="var(--clay)" opacity=".85"/>`;
  if(NARROW){
    s+=`<text class="xs" x="14" y="${AY-10}">fifteen centimetres of forearm at ${st.vel.toFixed(1)} cm a second</text>`;
    s+=`<text class="xs" x="14" y="${AY+80}">watch the dot, not the curve · ${(15/st.vel).toFixed(1)} seconds for one pass</text>`;
  }else{
    s+=`<text class="xs" x="${L}" y="${AY-10}">fifteen centimetres of forearm, stroked at ${st.vel.toFixed(1)} cm a second — watch the dot, not the curve</text>`;
    s+=`<text class="sm" x="${W-R+12}" y="${AY+38}">${(15/st.vel).toFixed(1)} seconds</text>`;
    s+=`<text class="xs" x="${W-R+12}" y="${AY+56}">for one pass</text>`;
  }
  return s+"</svg>";
}

/* ══ 5. speed × warmth ═════════════════════════════════════════ */
function sceneWarmth(st){
  /* Narrow: the plot keeps the width and the verdict moves underneath it. */
  const H  = NARROW ? 376 : 300;
  /* The left gutter holds a right-anchored label whose width in USER UNITS
     grows as the drawing box shrinks — a CSS-pixel font size divided by the
     scale factor. "skin warm" is the longest of the three and overran the left
     edge by about one pixel at every narrow width, for the life of this
     layout. The old checker's ±2-unit tolerance let it through; the shared one
     uses ±0.6 and caught it. Four more units of gutter is the whole fix. */
  const L  = NARROW ? 74 : 100;
  const R  = NARROW ? 14 : 190;
  const T  = 26;
  const PH = NARROW ? 150 : 196;
  const lv=v=>Math.log(v)/Math.LN10;
  const x=v=>L+(lv(v)-lv(0.25))/(lv(40)-lv(0.25))*(W-L-R);
  const temps=[{t:18,n:"cool",y:T+22},{t:32,n:"skin warm",y:T+PH/2},{t:42,n:"hot",y:T+PH-22}];
  const sel=temps.find(z=>z.t===st.temp);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="The sweet spot needs the right speed and the right warmth">`;
  s+=`<ellipse cx="${(x(1)+x(10))/2}" cy="${T+PH/2}" rx="${(x(10)-x(1))/2+26}" ry="${NARROW?38:46}"
    fill="var(--clay)" opacity=".16"/>`;
  s+=`<ellipse cx="${(x(1)+x(10))/2}" cy="${T+PH/2}" rx="${(x(10)-x(1))/2}" ry="${NARROW?24:28}"
    fill="var(--clay)" opacity=".2"/>`;
  /* Clear of the 18° guide line at y = T+22. At narrow the old offset of 48
     put this label's baseline at 53 with the line at 48, so the dashes ran
     through the words — the shape-over-label class again, and again invisible
     to a checker that compares text with text. */
  s+=`<text class="lab" x="${(x(1)+x(10))/2}" y="${T+PH/2-(NARROW?60:56)}" text-anchor="middle" style="fill:var(--dis)">the sweet spot</text>`;
  temps.forEach(z=>{
    const on=z.t===st.temp;
    s+=`<line x1="${L}" y1="${z.y}" x2="${W-R}" y2="${z.y}" stroke="var(--rule)"
      stroke-width="${on?0:1.5}" stroke-dasharray="${on?"none":"3 6"}"/>`;
    s+=`<text class="sm" x="${L-14}" y="${z.y+5}" text-anchor="end" style="fill:var(${on?"--ink":"--ink3"})">${z.t}°</text>`;
    s+=`<text class="xs" x="${L-14}" y="${z.y+21}" text-anchor="end">${esc(z.n)}</text>`;
  });
  SPEEDS.forEach(v=> s+=`<text class="xs" x="${x(v)}" y="${T+PH+24}" text-anchor="middle">${v}</text>`);
  s+=`<text class="xs" x="${(L+W-R)/2}" y="${T+PH+46}" text-anchor="middle">centimetres a second</text>`;
  s+=`<circle cx="${x(st.vel2)}" cy="${sel.y}" r="12" fill="var(--clay)"
    stroke="var(--card)" stroke-width="3"/>`;
  const inSpeed = st.vel2>=1 && st.vel2<=10, inTemp = st.temp===32;
  const verdict = inSpeed&&inTemp ? ["In the spot.","Right speed, right warmth."]
    : inTemp ? ["Warmth is right.","The speed is off the hill."]
    : inSpeed ? ["Speed is right.","Every speed rates lower away from skin temperature."]
    : ["Both are off.","This is the corner the research says is least pleasant."];
  if(NARROW){
    const VY=T+PH+86;
    s+=`<text class="lab" x="14" y="${VY}" style="fill:var(${inSpeed&&inTemp?"--clay":"--ink2"})">${esc(verdict[0])}</text>`;
    s+=`<foreignObject x="14" y="${VY+10}" width="${W-28}" height="60">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:Newsreader,serif;font-size:15px;line-height:1.45;color:var(--ink2)">${esc(verdict[1])}</div>
      </foreignObject>`;
    s+=`<text class="xs" x="14" y="${VY+92}">People rated every speed more pleasant at</text>`;
    s+=`<text class="xs" x="14" y="${VY+108}">skin temperature than at 18° or 42°.</text>`;
  }else{
    /* verdict[1] wraps: the "Both are off." variant is 308u of text in a
       158u column and used to run off the right edge of the canvas. */
    s+=`<text class="lab" x="${W-R+16}" y="${T+82}" style="fill:var(${inSpeed&&inTemp?"--clay":"--ink2"})">${esc(verdict[0])}</text>`;
    s+=`<foreignObject x="${W-R+16}" y="${T+90}" width="${R-32}" height="72">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:Newsreader,serif;font-size:15px;line-height:1.4;color:var(--ink2)">${esc(verdict[1])}</div>
      </foreignObject>`;
    s+=`<text class="xs" x="${W-R+16}" y="${T+196}">People rated every speed</text>`;
    s+=`<text class="xs" x="${W-R+16}" y="${T+212}">more pleasant at skin</text>`;
    s+=`<text class="xs" x="${W-R+16}" y="${T+228}">temperature than at 18°</text>`;
    s+=`<text class="xs" x="${W-R+16}" y="${T+244}">or 42°.</text>`;
  }
  return s+"</svg>";
}

/* ══ 12. the same stroke, four contexts ════════════════════════ */
const CTX=[
 {id:"consent", n:"they agreed to it", off:"they did not agree to it"},
 {id:"known",   n:"someone they trust", off:"a stranger"},
 {id:"warned",  n:"they knew it was coming", off:"it arrived unannounced"}
];
/* The measured half of the meaning figure — Gazzola 2012, drawn below the
 * illustrative half and labelled as measured, because the two must not be read
 * as the same kind of thing. Everything above the divider is nobody's data;
 * everything below it is.
 *
 * Called from sceneContext for both layouts. `top` is where the divider goes;
 * the caller has already reserved room for what this returns. Geometry is
 * derived from W so the same code serves 860 and 420.
 *
 * Colour: the active marker is clay — the page's feeling colour — and the
 * inactive one fades to ink3. Only the rating VALUE is coloured by sign. The
 * markers are deliberately not coloured good/bad by which person was believed;
 * the axis position already carries that, and tinting a person is not something
 * this figure should do. */
/* One source for the panel's geometry, so the drawing and the canvas height
   cannot disagree. The first version set H by hand from these offsets and got
   both layouts short by about 40 units; layout-check.js found it, which is the
   argument for deriving the number rather than typing it in two places. */
function beliefGeom(top){
  const PAD   = NARROW ? 12 : 70;
  const noteH = NARROW ? 150 : 110;
  /* Both marker labels sit ABOVE the axis and both scale anchors below it, so
     no row has to share a line with another. The first version put the marker
     names below at axis+50 and started the note at axis+46, which overlapped —
     invisibly to layout-check.js, whose overlap test compares <text> against
     <text> and does not see a <foreignObject> landing on one. Screenshot the
     figure after moving anything here; the checker will not catch this class. */
  const axis = top + (NARROW ? 168 : 156);
  const y = {
    rule:  top,
    head:  top + 30,
    intro: top + 42,
    name:  axis - 38,
    value: axis - 18,
    axis,
    anchor: axis + 26,
    note:  axis + 46
  };
  return {
    PAD, noteH, y,
    introH: NARROW ? 62 : 44,
    AX0: PAD, AX1: W - PAD,
    bottom: y.note + noteH + 10        /* the 10 is breathing room under the text */
  };
}

function believePanel(S, top){
  const chosen = (S && S.belief) || "woman";
  const g = beliefGeom(top);
  const { PAD, AX0, AX1, y, introH } = g;
  const MID  = (AX0 + AX1) / 2;
  const U    = (AX1 - AX0) / 10;          /* user units per rating point, −5..+5 */
  const x    = v => MID + v * U;

  let s = `<line x1="${NARROW?12:0}" y1="${y.rule}" x2="${NARROW?W-12:W}" y2="${y.rule}"
    stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<text class="lab" x="${PAD}" y="${y.head}" style="fill:var(--clay)">measured, not illustrative</text>`;
  s += `<foreignObject x="${PAD}" y="${y.intro}" width="${AX1-AX0}" height="${introH}">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="font-family:Newsreader,serif;font-size:13px;line-height:1.4;color:var(--ink3)">Eighteen
      men rated the same caress. Every one was given by the same woman, who could not see which
      video was playing. Only the belief changed.</div>
    </foreignObject>`;

  /* the scale */
  s += `<line x1="${AX0}" y1="${y.axis}" x2="${AX1}" y2="${y.axis}"
    stroke="var(--soft)" stroke-width="7" stroke-linecap="round"/>`;
  s += `<line x1="${MID}" y1="${y.axis-11}" x2="${MID}" y2="${y.axis+11}"
    stroke="var(--rule)" stroke-width="2"/>`;
  s += `<text class="xs" x="${AX0}" y="${y.anchor}">−5 unpleasant</text>`;
  s += `<text class="xs" x="${AX1}" y="${y.anchor}" text-anchor="end">pleasant +5</text>`;

  BELIEF.forEach(b => {
    const on  = b.id === chosen;
    const col = on ? "--clay" : "--ink3";
    const sgn = b.m >= 0 ? "--sage" : "--neg";
    /* ± one SD, so the spread is visible rather than implied by a bare dot */
    s += `<line x1="${x(b.m-b.sd)}" y1="${y.axis}" x2="${x(b.m+b.sd)}" y2="${y.axis}"
      stroke="var(${col})" stroke-width="3" stroke-linecap="round" opacity="${on?.55:.28}"/>`;
    s += `<circle cx="${x(b.m)}" cy="${y.axis}" r="${on?9:6}" fill="var(${col})"
      opacity="${on?1:.45}"/>`;
    s += `<text class="xs" x="${x(b.m)}" y="${y.name}" text-anchor="middle"
      style="fill:var(${on?"--ink2":"--ink3"})">believed ${esc(b.n)}</text>`;
    s += `<text class="sm" x="${x(b.m)}" y="${y.value}" text-anchor="middle"
      style="fill:var(${on?sgn:"--ink3"});font-weight:${on?600:400}">${b.m>0?"+":"−"}${Math.abs(b.m).toFixed(2)}</text>`;
  });

  /* The two things that must travel with the numbers. A figure gets screenshotted
     away from its caption, so neither of these lives only in the caption. */
  s += `<foreignObject x="${PAD}" y="${y.note}" width="${AX1-AX0}" height="${g.noteH}">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="font-family:Newsreader,serif;font-size:13px;line-height:1.45;color:var(--ink2)">
      <b>Primary somatosensory cortex</b> — the fast road from the first stop, the one carrying
      &#8220;just information&#8221; — responded more strongly to the caress they believed came
      from a woman.
      <div style="color:var(--ink3);margin-top:5px">The woman in the video also behaved warmly and
      the man distantly, so this is belief about a person, not about sex alone. All eighteen were
      heterosexual men.</div></div>
    </foreignObject>`;
  return s;
}

function sceneContext(st){
  const S = st || {ctx:{consent:true,known:true,warned:true}};
  const on = k => S.ctx ? S.ctx[k] : true;
  const score = (on("consent")?2:0)+(on("known")?1:0)+(on("warned")?1:0);
  const verdicts=[
   ["Intrusive","Physically identical. Experienced as a violation."],
   ["Intrusive","Physically identical. Experienced as a violation."],
   ["Endured","Tolerated rather than received. The nerves are firing the same way."],
   ["Neutral","It lands, but it is not doing much."],
   ["Welcome","The same stroke, and now it is worth something."]
  ];
  const v=verdicts[score];
  /* Narrow: the conditions become a bulleted list above the doorway, and the
     verdict moves underneath it — the arcs have nowhere to go at this width.
     Both heights grew when the measured panel was added below; believePanel()
     draws it and reports where it ends, so the two numbers stay in one place. */
  const PANEL_TOP = NARROW ? 492 : 300;
  const H = beliefGeom(PANEL_TOP).bottom;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="The same stroke read as ${esc(v[0].toLowerCase())}">`;
  if(NARROW){
    s+=`<text class="xs" x="12" y="22">the physical touch, unchanged in every case</text>`;
    s+=`<rect x="12" y="30" width="250" height="34" rx="17" fill="var(--soft)"/>`;
    s+=`<circle cx="86" cy="47" r="10" fill="var(--clay)" opacity=".85"/>`;
    s+=`<text class="sm" x="12" y="88">3 cm/s · 32° · on a forearm</text>`;
    CTX.forEach((c,i)=>{
      const yy=124+i*26, ok=on(c.id);
      s+=`<circle cx="18" cy="${yy-5}" r="5" fill="var(${ok?"--sage":"--neg"})" opacity=".8"/>`;
      s+=`<text class="sm" x="34" y="${yy}" style="fill:var(${ok?"--ink":"--ink3"})">${esc(ok?c.n:c.off)}</text>`;
    });
    /* The arch apex sits at DTOP+38-DW/2, not at DTOP — an easy thing to get
       wrong, and it was wrong: with DW=176 and DTOP=210 the apex reached y=160,
       above the third condition label at y=176, and the path's opaque fill is
       drawn after the labels, so it painted over "…was coming". Narrower and
       lower clears it. layout-check.js cannot see this: it compares <text> with
       <text> and a <path> covering a label is not an overlap to it. */
    const DX=140, DW=140, DTOP=218, DBASE=336;
    s+=`<path d="M${DX} ${DBASE}V${DTOP+38}a${DW/2} ${DW/2} 0 0 1 ${DW} 0V${DBASE}"
      fill="var(--paper2)" stroke="var(--clay)" stroke-width="3"/>`;
    s+=`<text class="sm" x="${DX+DW/2}" y="${DTOP+84}" text-anchor="middle" style="fill:var(--dis)">the fibres</text>`;
    s+=`<text class="xs" x="${DX+DW/2}" y="${DTOP+104}" text-anchor="middle">a doorway</text>`;
    s+=`<rect x="${DX-24}" y="${DBASE}" width="${DW+48}" height="12" rx="6" fill="var(--soft)"/>`;
    s+=`<text class="big" x="12" y="${DBASE+62}" style="font-size:31px"
      fill="var(${score>=4?"--sage":score<=1?"--neg":"--ink2"})">${esc(v[0])}</text>`;
    s+=`<foreignObject x="12" y="${DBASE+74}" width="${W-24}" height="70">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:Newsreader,serif;font-size:15px;line-height:1.45;color:var(--ink2)">${esc(v[1])}</div>
      </foreignObject>`;
    s+=believePanel(S, PANEL_TOP);
    return s+"</svg>";
  }
  /* the identical physical stroke, always the same, clear of everything else */
  s+=`<text class="xs" x="60" y="26">the physical touch, unchanged in every case</text>`;
  s+=`<rect x="60" y="34" width="330" height="34" rx="17" fill="var(--soft)"/>`;
  s+=`<circle cx="150" cy="51" r="10" fill="var(--clay)" opacity=".85"/>`;
  s+=`<text class="sm" x="402" y="56">3 cm/s · 32° · on a forearm</text>`;
  /* the doorway, moved right and down so nothing lands on it */
  const DX=442, DW=176, DTOP=118, DBASE=272;
  s+=`<path d="M${DX} ${DBASE}V${DTOP+38}a${DW/2} ${DW/2} 0 0 1 ${DW} 0V${DBASE}"
    fill="var(--paper2)" stroke="var(--clay)" stroke-width="3"/>`;
  s+=`<text class="sm" x="${DX+DW/2}" y="${DTOP+96}" text-anchor="middle" style="fill:var(--dis)">the fibres</text>`;
  s+=`<text class="xs" x="${DX+DW/2}" y="${DTOP+116}" text-anchor="middle">a doorway</text>`;
  s+=`<rect x="${DX-24}" y="${DBASE}" width="${DW+48}" height="12" rx="6" fill="var(--soft)"/>`;
  /* what is arriving with it */
  CTX.forEach((c,i)=>{
    const yy=142+i*40, ok=on(c.id);
    s+=`<text class="sm" x="392" y="${yy}" text-anchor="end" style="fill:var(${ok?"--ink":"--ink3"})">${esc(ok?c.n:c.off)}</text>`;
    s+=`<path d="M400 ${yy-5}q20 0 34 ${(DTOP+70-yy)/2}" fill="none"
      stroke="var(${ok?"--sage":"--neg"})" stroke-width="2" opacity=".55"/>`;
  });
  /* the verdict */
  s+=`<text class="big" x="656" y="152" style="font-size:31px"
    fill="var(${score>=4?"--sage":score<=1?"--neg":"--ink2"})">${esc(v[0])}</text>`;
  s+=`<foreignObject x="656" y="166" width="${W-686}" height="110">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="font-family:Newsreader,serif;font-size:15px;line-height:1.5;color:var(--ink2)">${esc(v[1])}</div>
    </foreignObject>`;
  s+=believePanel(S, PANEL_TOP);
  return s+"</svg>";
}

const SCENES = {roads:sceneRoads, micro:sceneMicro, patient:scenePatient,
  speed:sceneSpeed, warmth:sceneWarmth, context:sceneContext};

/* ══ 7. skin cross-section ═════════════════════════════════════ */
const RECEPTORS=[
 {id:"merkel", n:"Merkel cells", d:.30, x:.22, c:"--blue", job:"edges, texture, fine detail",
  say:"Shallow and densely packed in fingertips. These are the ones reading the raised dots of braille, or the grain of a fabric. They keep firing as long as pressure is held."},
 {id:"meissner", n:"Meissner corpuscles", d:.22, x:.42, c:"--blue", job:"slip and flutter",
  say:"Also shallow, but they only answer to change. They are why you tighten your grip on a glass a fraction of a second before you consciously notice it sliding."},
 {id:"ruffini", n:"Ruffini endings", d:.72, x:.62, c:"--sage", job:"skin stretch",
  say:"Deep, and tuned to skin being pulled rather than pressed. Part of how you know where your hand is in the dark, and the receptor most engaged by a slow drag across tissue."},
 {id:"pacinian", n:"Pacinian corpuscles", d:.86, x:.80, c:"--sage", job:"fast vibration",
  say:"Deep, large, and extremely sensitive to rapid vibration. They are how you feel the texture of a surface through the end of a tool rather than through your own skin."},
 {id:"ct", n:"Free nerve endings", d:.16, x:.10, c:"--clay", job:"slow, affectionate contact",
  say:"No capsule, no structure, wandering in the upper layers of hairy skin. Poor at what and where. These are the C-tactile fibres, and the rest of this page is about them."}
];
function sceneSkin(st){
  const sel=RECEPTORS.find(r=>r.id===st.rec)||RECEPTORS[0];
  /* Narrow: the cross-section keeps the full width and the description moves
     underneath it instead of sitting in a right-hand column. */
  const H = NARROW ? 442 : 330;
  const L = NARROW ? 14 : 60;
  const R = NARROW ? 14 : 272;
  const T = NARROW ? 56 : 40;
  const SH = NARROW ? 172 : 190;
  const bw=W-L-R;
  const y=d=>T+22+d*(SH-40);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Where the touch receptors sit in the skin">`;
  /* layers */
  s+=`<rect x="${L}" y="${T}" width="${bw}" height="34" rx="10" fill="var(--soft)"/>`;
  s+=`<rect x="${L}" y="${T+34}" width="${bw}" height="${SH-34}" rx="10" fill="var(--paper2)"/>`;
  s+=`<text class="xs" x="${L+10}" y="${T+22}">epidermis · the surface</text>`;
  s+=`<text class="xs" x="${L+10}" y="${T+SH-12}">dermis · deeper tissue</text>`;
  /* a hair, because it matters which skin */
  s+=`<path d="M${L+52} ${T+6}q-8 -30 6 -34" stroke="var(--ink3)" stroke-width="2"
    fill="none" stroke-linecap="round"/>`;
  s+=`<text class="xs" x="${L+64}" y="${T-16}">hairy skin</text>`;
  RECEPTORS.forEach(r=>{
    const cx=L+r.x*bw, cy=y(r.d), on=r.id===sel.id;
    s+=`<g data-rec="${r.id}" data-fig-click="rec-${r.id}" style="cursor:pointer">
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${T+SH+2}" stroke="var(${r.c})"
        stroke-width="${on?2.5:1.5}" opacity="${on?.6:.28}"/>`;
    if(r.id==="ct")
      s+=`<path d="M${cx-14} ${cy}q7 -12 14 0t14 0" stroke="var(${r.c})" stroke-width="${on?4:3}"
        fill="none" stroke-linecap="round"/>`;
    else if(r.id==="pacinian")
      s+=`<ellipse cx="${cx}" cy="${cy}" rx="${on?15:12}" ry="${on?11:9}" fill="none"
        stroke="var(${r.c})" stroke-width="${on?3:2}"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${on?8:6}" ry="${on?6:5}" fill="var(${r.c})" opacity=".4"/>`;
    else if(r.id==="ruffini")
      s+=`<path d="M${cx-14} ${cy}h28M${cx-10} ${cy-7}h20M${cx-10} ${cy+7}h20"
        stroke="var(${r.c})" stroke-width="${on?3:2}" stroke-linecap="round"/>`;
    else
      s+=`<circle cx="${cx}" cy="${cy}" r="${on?10:8}" fill="var(${r.c})" opacity="${on?.85:.5}"/>`;
    s+=`</g>`;
  });
  /* Only the selected receptor is named under the diagram. Five job labels
     side by side collide at any width — "edges, texture, fine detail" and
     "slow, affectionate contact" are 150u wide in a 528u band. */
  s+=`<text class="sm" x="${L+bw/2}" y="${T+SH+26}" text-anchor="middle"
    style="fill:var(${sel.c})">${esc(sel.job)}</text>`;
  /* the panel */
  const RX = NARROW ? L : W-R+22;
  const PY = NARROW ? T+SH+58 : T+16;
  const PW = NARROW ? bw : R-52;
  s+=`<text class="lab" x="${RX}" y="${PY}" style="fill:var(${sel.c})">${esc(sel.n)}</text>`;
  s+=`<foreignObject x="${RX}" y="${PY+10}" width="${PW}" height="${NARROW?118:180}">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="font-family:Newsreader,serif;font-size:15px;line-height:1.5;color:var(--ink2)">${esc(sel.say)}</div>
    </foreignObject>`;
  s+=`<text class="xs" x="${L}" y="${H-8}">tap any receptor</text>`;
  return s+"</svg>";
}

/* ══ 8. two-point acuity, drawn to scale ═══════════════════════ */
const PARTS=[
 {id:"finger", n:"fingertip", mm:2.5}, {id:"lip", n:"lips", mm:5},
 {id:"palm", n:"palm", mm:10}, {id:"forehead", n:"forehead", mm:15},
 {id:"forearm", n:"forearm", mm:35}, {id:"back", n:"back", mm:39},
 {id:"calf", n:"calf", mm:45}
];
function sceneAcuity(st){
  const p=PARTS.find(z=>z.id===st.part)||PARTS[0];
  /* Narrow: the header wraps to two lines, the comparison rows get room to
     breathe, and the mm scale drops just enough that a 45mm calf still fits. */
  const H  = NARROW ? 392 : 324;
  const L  = NARROW ? 10 : 64;
  const R  = NARROW ? 10 : 64;
  const T  = NARROW ? 76 : 52;
  const px = mm => mm * (NARROW ? 7.0 : 7.4);
  const cx=(L+W-R)/2;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Two points ${p.mm} millimetres apart, as felt on the ${p.n}">`;
  const part=`<tspan style="font-family:Fraunces,serif" fill="var(--clay)">${esc(p.n)}</tspan>`;
  if(NARROW){
    s+=`<text class="sm" x="${L}" y="${T-46}">the closest two points that can</text>`;
    s+=`<text class="sm" x="${L}" y="${T-24}">still feel like two, on the ${part}</text>`;
  } else {
    s+=`<text class="sm" x="${L}" y="${T-16}">the closest two points can be on the ${part} and still feel like two</text>`;
  }
  /* the gap, to scale */
  const gap=px(p.mm), y0=NARROW?T+40:T+58;
  s+=`<line x1="${cx-gap/2}" y1="${y0}" x2="${cx+gap/2}" y2="${y0}" stroke="var(--rule)" stroke-width="2"/>`;
  s+=`<circle cx="${cx-gap/2}" cy="${y0}" r="9" fill="var(--clay)"/>`;
  s+=`<circle cx="${cx+gap/2}" cy="${y0}" r="9" fill="var(--clay)"/>`;
  s+=`<text class="big" x="${cx}" y="${y0+58}" text-anchor="middle">${p.mm} mm</text>`;
  /* every part, as a faint comparison row */
  const RY=y0+96, GAP=NARROW?22:13, BX=NARROW?78:L+96;
  s+=`<text class="xs" x="${L}" y="${RY-14}">all of them, same scale</text>`;
  PARTS.forEach((q,i)=>{
    const yy=RY+i*GAP, on=q.id===p.id, g=px(q.mm);
    s+=`<line x1="${BX}" y1="${yy}" x2="${BX+g}" y2="${yy}"
      stroke="var(${on?"--clay":"--rule"})" stroke-width="${on?4:3}" stroke-linecap="round"/>`;
    s+=`<text class="xs" x="${BX-8}" y="${yy+4}" text-anchor="end" style="fill:var(${on?"--ink":"--ink3"})">${esc(q.n)}</text>`;
  });
  const note="a fingertip is about fifteen times finer than a back";
  if(NARROW) s+=`<text class="xs" x="${L}" y="${H-10}">${note}</text>`;
  else s+=`<text class="xs" x="${W-R}" y="${RY+PARTS.length*GAP-4}" text-anchor="end">${note}</text>`;
  return s+"</svg>";
}

/* ══ 9. the gate ═══════════════════════════════════════════════ */
function sceneGate(st){
  /* Narrow: the modulating inputs move to the top as their own two lines,
     and the whole flow shifts left so "less pain" still fits on the right. */
  const H  = NARROW ? 286 : 270;
  const cx = NARROW ? 230 : 430;
  const cy = NARROW ? 170 : 150;
  const IX = NARROW ? 10 : 120;
  const open = st.gateTouch ? 0.34 : 1;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Touch partly closes the gate that pain signals pass through">`;
  /* from above */
  if(NARROW){
    s+=`<text class="xs" x="10" y="20">attention, expectation, mood, safety</text>`;
    s+=`<text class="xs" x="10" y="36">— can open or close it too</text>`;
    s+=`<path d="M${cx} 46V${cy-62}" stroke="var(--sage)" stroke-width="3"
      fill="none" stroke-linecap="round" stroke-dasharray="6 6"/>`;
  }else{
    s+=`<path d="M${cx} 26V${cy-62}" stroke="var(--sage)" stroke-width="3"
      fill="none" stroke-linecap="round" stroke-dasharray="6 6"/>`;
    s+=`<text class="sm" x="${cx+12}" y="26">attention, expectation, mood, safety</text>`;
    s+=`<text class="xs" x="${cx+12}" y="44">— can open or close it too</text>`;
  }
  const TY = NARROW ? 84 : 34;
  s+=`<text class="sm" x="${IX}" y="${TY}">a knock, a burn, a strain</text>`;
  s+=`<path d="M${IX} ${TY+26}C${IX+120} ${TY+26} ${cx-180} ${cy-8} ${cx-58} ${cy-6}" stroke="var(--clay)"
    stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s+=`<text class="sm" x="${IX}" y="${cy+66}">touch on the same patch of skin</text>`;
  s+=`<path d="M${IX} ${cy+40}C${cx-180} ${cy+40} ${cx-180} ${cy+14} ${cx-58} ${cy+12}"
    stroke="var(--blue)" stroke-width="4" fill="none" stroke-linecap="round"
    opacity="${st.gateTouch?1:.22}"/>`;
  /* the gate */
  s+=`<rect x="${cx-52}" y="${cy-58}" width="104" height="118" rx="20"
    fill="var(--paper2)" stroke="var(--rule)" stroke-width="2"/>`;
  s+=`<text class="xs" x="${cx}" y="${cy+80}" text-anchor="middle">the gate</text>`;
  const w=8+open*56;
  s+=`<rect x="${cx-w/2}" y="${cy-30}" width="${w}" height="62" rx="7"
    fill="var(--clay)" opacity=".28"/>`;
  s+=`<line x1="${cx-34}" y1="${cy-34}" x2="${cx-34}" y2="${cy+36}" stroke="var(--ink3)" stroke-width="3" stroke-linecap="round"/>`;
  s+=`<line x1="${cx+34}" y1="${cy-34}" x2="${cx+34}" y2="${cy+36}" stroke="var(--ink3)" stroke-width="3" stroke-linecap="round"/>`;
  /* out the other side */
  const out = st.gateTouch ? .38 : 1;
  const OX = NARROW ? W-80 : W-190;
  s+=`<path d="M${cx+58} ${cy}H${OX}" stroke="var(--clay)"
    stroke-width="${1.5+out*4}" fill="none" stroke-linecap="round" opacity="${.35+out*.6}"/>`;
  s+=`<text class="lab" x="${OX+8}" y="${cy+5}">${st.gateTouch?"less pain":"pain"}</text>`;
  return s+"</svg>";
}

/* ══ 10. who may touch you where ═══════════════════════════════ */
const ZONES=[
 {id:"head", n:"head", x:.50, y:.09, r:.075},
 {id:"chest", n:"chest", x:.50, y:.28, r:.10},
 {id:"arm",  n:"upper arms", x:.245, y:.26, r:.072},
 {id:"arm2", n:"", x:.755, y:.26, r:.072},
 {id:"hand", n:"hands", x:.16, y:.44, r:.055},
 {id:"hand2",n:"", x:.84, y:.44, r:.055},
 {id:"torso",n:"torso", x:.50, y:.45, r:.095},
 {id:"hips", n:"hips", x:.50, y:.60, r:.085},
 {id:"legs", n:"legs", x:.395, y:.79, r:.075},
 {id:"legs2",n:"", x:.605, y:.79, r:.075},
 {id:"feet", n:"feet", x:.50, y:.95, r:.048}
];
const BONDS=[
 {id:"partner", n:"partner", area:1.0, allow:{head:1,chest:1,arm:1,hand:1,torso:1,hips:1,legs:1,feet:.9}},
 {id:"parent",  n:"parent",  area:.62, allow:{head:.9,chest:.5,arm:1,hand:1,torso:.5,hips:.15,legs:.5,feet:.4}},
 {id:"sibling", n:"sibling", area:.55, allow:{head:.7,chest:.4,arm:1,hand:1,torso:.4,hips:.1,legs:.4,feet:.35}},
 {id:"friend",  n:"close friend", area:.45, allow:{head:.5,chest:.3,arm:.95,hand:1,torso:.25,hips:.05,legs:.25,feet:.2}},
 {id:"acq",     n:"acquaintance", area:.22, allow:{head:.12,chest:.06,arm:.6,hand:.95,torso:.05,hips:0,legs:.05,feet:.05}},
 {id:"stranger",n:"stranger", area:.10, allow:{head:.03,chest:0,arm:.25,hand:.85,torso:0,hips:0,legs:0,feet:0}}
];
function sceneTopo(st){
  /* Narrow: the body sits above the bars instead of beside them. */
  const H  = NARROW ? 640 : 356;
  const BX = NARROW ? 135 : 150;
  const BY = NARROW ? 16 : 22;
  const BW = 150;
  const BH = NARROW ? 250 : 290;
  const b=BONDS.find(z=>z.id===st.bond)||BONDS[0];
  const key=id=>id.replace(/2$/,"");
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Where a ${esc(b.n)} may touch you, and how the total area compares">`;
  s+=`<path d="M${BX+75} ${BY+6}a20 20 0 1 1 -.1 0
    M${BX+75} ${BY+30}c-30 0 -46 12 -46 34v58c0 8 -12 44 -14 62h14c4 -16 12 -40 12 -40
    v46c0 24 -6 60 -8 88h20c2 -28 8 -56 8 -80h28c0 24 6 52 8 80h20c-2 -28 -8 -64 -8 -88
    v-46s8 24 12 40h14c-2 -18 -14 -54 -14 -62v-58c0 -22 -16 -34 -46 -34Z"
    fill="var(--paper2)" stroke="var(--rule)" stroke-width="1.5"
    transform="translate(${BX} ${BY}) scale(1 ${(BH/290).toFixed(3)}) translate(${-BX} ${-BY})"/>`;
  ZONES.forEach(z=>{
    const a=b.allow[key(z.id)]||0;
    if(a<=0.02) return;
    s+=`<ellipse cx="${BX+z.x*BW}" cy="${BY+z.y*BH}" rx="${z.r*BW*1.5}" ry="${z.r*BH*0.62}"
      fill="var(--clay)" opacity="${(0.12+a*0.42).toFixed(2)}"/>`;
  });
  s+=`<text class="lab" x="${BX+BW/2}" y="${BY+BH+26}" text-anchor="middle">${esc(b.n)}</text>`;
  /* the reliable finding: total area against bond */
  const CX = NARROW ? 12 : 420;
  const TY = NARROW ? BY+BH+64 : BY+26;
  const CW = NARROW ? W-CX-12 : W-CX-70;
  const LW = NARROW ? 98 : 104;
  const ROW = NARROW ? 30 : 36;
  if(NARROW){
    s+=`<text class="sm" x="${CX}" y="${TY}">the finding that held across five countries</text>`;
    s+=`<text class="xs" x="${CX}" y="${TY+20}">total area you would allow, by how close the bond is</text>`;
  }else{
    s+=`<text class="sm" x="${CX}" y="${TY}">the finding that held across five countries</text>`;
    s+=`<text class="xs" x="${CX}" y="${TY+20}">total area you would allow, by how close the bond is</text>`;
  }
  BONDS.forEach((z,i)=>{
    const yy=TY+44+i*ROW, on=z.id===b.id;
    s+=`<text class="sm" x="${CX+LW}" y="${yy+5}" text-anchor="end" style="fill:var(${on?"--ink":"--ink3"})">${esc(z.n)}</text>`;
    s+=`<rect x="${CX+LW+10}" y="${yy-11}" width="${(CW-LW-20)*z.area}" height="20" rx="10"
      fill="var(--clay)" opacity="${on?.72:.24}" data-bond="${z.id}" data-fig-click="bond-${z.id}" style="cursor:pointer"/>`;
  });
  const note="Zones here are a simplification. The published maps are finer, and the solid result is the relationship between bond and area.";
  if(NARROW){
    s+=`<foreignObject x="${CX}" y="${TY+44+BONDS.length*ROW+2}" width="${W-CX-12}" height="60">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:Newsreader,serif;font-size:13px;line-height:1.4;color:var(--ink3)">${esc(note)}</div>
      </foreignObject>`;
  }else{
    /* was a single 694u line at x=420 on an 860 canvas — it ran off the edge */
    s+=`<foreignObject x="${CX}" y="${TY+44+BONDS.length*ROW-16}" width="${W-CX-40}" height="56">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:Newsreader,serif;font-size:13px;line-height:1.4;color:var(--ink3)">${esc(note)}</div>
      </foreignObject>`;
  }
  return s+"</svg>";
}

/* ══ 11. how sure are we ═══════════════════════════════════════ */
function sceneClaims(st){
  const shown = !st || st.claimsShown;
  /* Narrow: each claim reads as a line of text with its bar underneath,
     rather than a right-hand label column against a shared axis. */
  const ROW = NARROW ? 96 : 60;
  const H  = NARROW ? 44+CLAIMS.length*ROW+30 : 54+CLAIMS.length*ROW;
  const L  = NARROW ? 12 : 56;
  const R  = NARROW ? 12 : 64;
  const BX = NARROW ? 12 : L+392;
  const x=v=>BX+v*(W-BX-R);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="How well supported each claim about touch is">`;
  s+=`<text class="xs" x="${BX}" y="24">less sure</text>`;
  s+=`<text class="xs" x="${W-R}" y="24" text-anchor="end">more sure</text>`;
  s+=`<line x1="${BX}" y1="34" x2="${W-R}" y2="34" stroke="var(--rule)" stroke-width="1.5"/>`;
  CLAIMS.forEach((c,i)=>{
    const top = NARROW ? 44+i*ROW : 0;
    const yy  = NARROW ? top+68 : 62+i*ROW;
    const col = c.s>.7 ? "--sage" : c.s>.5 ? "--gold" : "--clay";
    s+=`<line x1="${BX}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="var(--soft)" stroke-width="7"
      stroke-linecap="round"/>`;
    if(shown) s+=`<line x1="${BX}" y1="${yy}" x2="${x(c.s)}" y2="${yy}" stroke="var(${col})"
      stroke-width="7" stroke-linecap="round" opacity=".55"/>`;
    if(shown) s+=`<circle cx="${x(c.s)}" cy="${yy}" r="8" fill="var(${col})"/>`;
    if(!shown && i===CLAIMS.length-1){
      s+=`<circle cx="${x(st.claimGuess)}" cy="${yy}" r="8" fill="none"
        stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="4 3"/>`;
      s+=`<text class="xs" x="${x(st.claimGuess)}" y="${yy-16}" text-anchor="middle">your guess</text>`;
    }
    if(shown && i===CLAIMS.length-1 && st && st.claimGuess!=null && Math.abs(st.claimGuess-c.s)>.02){
      s+=`<circle cx="${x(st.claimGuess)}" cy="${yy}" r="8" fill="none"
        stroke="var(--ink3)" stroke-width="2" stroke-dasharray="4 3"/>`;
      s+=`<text class="xs" x="${x(st.claimGuess)}" y="${yy+24}" text-anchor="middle">you said</text>`;
    }
    s+=`<foreignObject x="${L}" y="${NARROW?top:yy-26}" width="${NARROW?W-24:BX-L-26}" height="${NARROW?52:56}">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:Newsreader,serif;font-size:15px;line-height:1.35;color:var(--ink);text-align:${NARROW?"left":"right"}">
        ${esc(c.t)}<div style="font-size:13px;color:var(--ink3);line-height:1.3">${esc(c.n)}</div></div>
      </foreignObject>`;
  });
  return s+"</svg>";
}

Object.assign(SCENES, {skin:sceneSkin, acuity:sceneAcuity, gate:sceneGate,
  topography:sceneTopo, claims:sceneClaims});
