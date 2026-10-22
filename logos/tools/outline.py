"""Convert the text in lockup SVGs to outlines.

    python3 tools/outline.py svg/lockup-horizontal.svg ...

For each file this writes svg/<name>-outlined.svg, in which every <text> is
replaced by filled paths, so the file needs no fonts at all.

How: headless Chrome lays the text out (with the Google fonts loaded,
kerning and letter-spacing applied) and reports where each letter starts,
in what face, weight, optical size and colour. fontTools then cuts the same
variable font (downloaded from Google Fonts into temp/fonts/) at that weight
and optical size and draws each letter's outline at that spot. The result
matches Chrome's rendering of the live text; tools/outline.py --check
compares the two pixel by pixel.
"""
import json, os, re, subprocess, sys, tempfile, urllib.request, html as htmllib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/130.0 Safari/537.36')
FONT_DIR = os.path.join('temp', 'fonts')

JS = r"""
document.fonts.ready.then(() => setTimeout(() => {
  const out = [];
  document.querySelectorAll('svg text').forEach((t, ti) => {
    const chars = [];
    let i = 0;
    const walk = (node) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) {
          const cs = getComputedStyle(n.parentElement);
          for (const ch of n.data) {
            const p = t.getStartPositionOfChar(i);
            chars.push({ch, x: p.x, y: p.y, family: cs.fontFamily, weight: cs.fontWeight,
                        style: cs.fontStyle, size: parseFloat(cs.fontSize),
                        fvs: cs.fontVariationSettings, fill: cs.fill});
            i++;
          }
        } else if (n.nodeType === 1) walk(n);
      }
    };
    walk(t);
    out.push(chars);
  });
  const pre = document.createElement('pre');
  pre.id = 'out';
  pre.textContent = JSON.stringify(out);
  document.body.appendChild(pre);
}, 300));
"""

def chrome_layout(svg_text):
    page = ('<!doctype html><meta charset=utf-8><body style="margin:0">'
            + svg_text + '<script>' + JS + '</script>')
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False) as f:
        f.write(page)
        path = f.name
    try:
        dom = subprocess.run(['google-chrome', '--headless=new', '--virtual-time-budget=8000',
                              '--dump-dom', 'file://' + path],
                             check=True, capture_output=True, text=True).stdout
    finally:
        os.unlink(path)
    m = re.search(r'<pre id="out">(.*?)</pre>', dom, re.S)
    if not m:
        sys.exit('Chrome did not report the layout (fonts not loaded?)')
    return json.loads(htmllib.unescape(m.group(1)))

def font_css_url(svg_text):
    m = re.search(r"@import url\((?:'|&apos;)(.*?)(?:'|&apos;)\)", svg_text)
    return htmllib.unescape(m.group(1))

_files = {}
def font_file(css_url, family, style):
    """The latin variable font file Google serves to Chrome for this face."""
    key = (family, style)
    if key in _files:
        return _files[key]
    os.makedirs(FONT_DIR, exist_ok=True)
    css = urllib.request.urlopen(urllib.request.Request(css_url, headers={'User-Agent': UA})).read().decode()
    for block in re.findall(r'/\* latin \*/\s*@font-face\s*{(.*?)}', css, re.S):
        fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        sty = re.search(r'font-style:\s*(\w+)', block).group(1)
        if fam == family and sty == style:
            url = re.search(r'src:\s*url\(([^)]+)\)', block).group(1)
            dest = os.path.join(FONT_DIR, f"{family}-{style}.woff2")
            if not os.path.exists(dest):
                urllib.request.urlretrieve(url, dest)
            _files[key] = dest
            return dest
    sys.exit(f'no latin {family} {style} in the font CSS')

_instances = {}
def instance(path, wght, opsz):
    key = (path, wght, opsz)
    if key not in _instances:
        f = TTFont(path)
        axes = {a.axisTag: (a.minValue, a.maxValue) for a in f['fvar'].axes}
        loc = {}
        if 'wght' in axes: loc['wght'] = min(max(wght, axes['wght'][0]), axes['wght'][1])
        if 'opsz' in axes: loc['opsz'] = min(max(opsz, axes['opsz'][0]), axes['opsz'][1])
        _instances[key] = instancer.instantiateVariableFont(f, loc)
    return _instances[key]

def outline_text(chars, css_url):
    """Path elements for one <text>, one per run of the same colour."""
    paths = {}
    seen = set()
    for c in chars:
        if c['ch'].isspace():
            continue
        if (round(c['x'], 2), round(c['y'], 2)) in seen:
            print(f"  warning: two letters at one spot near {c['ch']!r} (a ligature?)", file=sys.stderr)
        seen.add((round(c['x'], 2), round(c['y'], 2)))
        family = c['family'].split(',')[0].strip().strip('"\'')
        m = re.search(r'"opsz"\s+([\d.]+)', c['fvs'])
        opsz = float(m.group(1)) if m else c['size']
        font = instance(font_file(css_url, family, c['style']), float(c['weight']), opsz)
        gs = font.getGlyphSet()
        name = font.getBestCmap()[ord(c['ch'])]
        k = c['size'] / font['head'].unitsPerEm
        pen = SVGPathPen(gs, ntos=lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
        gs[name].draw(TransformPen(pen, (k, 0, 0, -k, c['x'], c['y'])))
        paths.setdefault(c['fill'], []).append(pen.getCommands())
    return paths

def rgb_to_hex(s):
    m = re.match(r'rgb\((\d+),\s*(\d+),\s*(\d+)\)', s)
    return '#%02X%02X%02X' % tuple(map(int, m.groups())) if m else s

def outline_file(src):
    svg = open(src).read()
    css_url = font_css_url(svg)
    layout = chrome_layout(svg)
    texts = list(re.finditer(r'<text\b.*?</text>', svg, re.S))
    assert len(texts) == len(layout), 'text elements and layout disagree'
    out, last = [], 0
    for t, chars in zip(texts, layout):
        out.append(svg[last:t.start()])
        for fill, ds in outline_text(chars, css_url).items():
            out.append(f'<path fill="{rgb_to_hex(fill)}" d="{" ".join(ds)}"/>')
        last = t.end()
    out.append(svg[last:])
    res = ''.join(out)
    res = re.sub(r'<defs><style>@import[^<]*</style></defs>', '', res)
    dest = re.sub(r'\.svg$', '-outlined.svg', src)
    open(dest, 'w').write(res)
    return dest

def screenshot(svg_path, png):
    s = open(svg_path).read()
    w, h = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s).groups()
    subprocess.run(['google-chrome', '--headless=new', '--hide-scrollbars', '--virtual-time-budget=8000',
                    '--force-device-scale-factor=2', f'--window-size={int(float(w)+0.999)},{int(float(h)+0.999)}',
                    f'--screenshot={png}', 'file://' + os.path.abspath(svg_path)],
                   check=True, capture_output=True)

def check(src, dest):
    """Share of pixels that differ visibly between live text and outlines."""
    from PIL import Image, ImageChops
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, 'a.png'), os.path.join(d, 'b.png')
        screenshot(src, a); screenshot(dest, b)
        ia, ib = Image.open(a).convert('L'), Image.open(b).convert('L')
        diff = ImageChops.difference(ia, ib)
        n = sum(1 for v in diff.getdata() if v > 64)
        return n, ia.size[0] * ia.size[1], diff.getbbox()

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for src in args:
        dest = outline_file(src)
        msg = dest
        if '--check' in sys.argv:
            n, tot, box = check(src, dest)
            msg += f'  differing pixels at 2x: {n} of {tot}'
        print(msg)
