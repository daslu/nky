"""Measure the ink box of lockups drawn with text.

`clojure -M -e "(require 'notknowing-garden.main) (notknowing-garden.main/write-measure-pages)"`
writes temp/measure/<name>.html: each lockup on a white page, drawn in a
known box [x0 y0 x1 y1] at `scale` pixels per unit (data attributes on the
<svg>). This script screenshots each page in headless Chrome, after the
fonts have loaded, finds the pixels that are not white, and prints the ink
box in lockup units, ready to paste as `:bounds`.

    python3 tools/measure.py temp/measure/*.html
"""
import re, subprocess, sys, tempfile, os
from PIL import Image

def measure(html):
    src = open(html).read()
    m = {k: float(v) for k, v in re.findall(r'data-(x0|y0|x1|y1|scale)="([-\d.]+)"', src)}
    w = int(round((m['x1'] - m['x0']) * m['scale']))
    h = int(round((m['y1'] - m['y0']) * m['scale']))
    with tempfile.TemporaryDirectory() as d:
        png = os.path.join(d, 'shot.png')
        subprocess.run(['google-chrome', '--headless=new', '--hide-scrollbars',
                        '--virtual-time-budget=8000', f'--window-size={w},{h}',
                        f'--screenshot={png}', 'file://' + os.path.abspath(html)],
                       check=True, capture_output=True)
        im = Image.open(png).convert('L')
    # anything noticeably darker than white is ink
    box = im.point(lambda v: 255 if v < 250 else 0).getbbox()
    if box is None:
        return None
    l, t, r, b = box
    if l == 0 or t == 0 or r >= w or b >= h:
        print(f'  warning: {html} ink touches the edge; widen the box', file=sys.stderr)
    s = m['scale']
    f = lambda v: round(v, 1)
    return [f(m['x0'] + l / s), f(m['y0'] + t / s), f(m['x0'] + r / s), f(m['y0'] + b / s)]

if __name__ == '__main__':
    for html in sys.argv[1:]:
        name = os.path.splitext(os.path.basename(html))[0]
        print(name, measure(html))
