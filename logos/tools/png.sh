#!/bin/bash
# Screenshot SVGs to PNG at 2x in headless Chrome, after the fonts load,
# on a transparent ground: tools/png.sh svg/lockup-horizontal.svg ...
# Writes png/<name>@2x.png. Run from logos/.
mkdir -p png
for f in "$@"; do
  n=$(basename "$f" .svg)
  read w h < <(grep -o 'viewBox="0 0 [0-9.]* [0-9.]*"' "$f" | head -1 \
               | sed -E 's/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/\1 \2/' \
               | awk '{printf "%d %d", $1+0.999, $2+0.999}')
  google-chrome --headless=new --hide-scrollbars --virtual-time-budget=8000 \
    --default-background-color=00000000 --force-device-scale-factor=2 \
    --window-size=$w,$h --screenshot="png/$n@2x.png" "file://$PWD/$f" 2>/dev/null
  echo "png/$n@2x.png ${w}x${h} @2x"
done
