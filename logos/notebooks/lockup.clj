^:kindly/hide-code?
(ns lockup
  "The mark with the name and the tagline."
  (:require [notknowing-garden.living :as l]
            [notknowing-garden.palette :refer [c]]
            [notknowing-garden.view :as view]))

^:kindly/hide-code?
(view/page-style)

^:kindly/hide-code?
(def mark (l/stems l/logo))

^:kindly/hide-code?
(def mark-ink (l/stems (l/in l/logo (c :ink))))

^:kindly/hide-code?
(def tile view/lockup-tile)

;; # The lockup
;;
;; Here we put the mark together with the name, **Notknowing Garden**, and
;; the tagline, **Bodymind, tantra, and movement**. The mark is the one
;; chosen in the living-curves notebook; we do not change it here.
;;
;; ## What we recommend
;;
;; **Horizontal**, for page headers, letterheads and anywhere wide. The mark
;; stands a little taller than the two lines of text: its tip rises well
;; above the capitals and its foot ends just below the tagline. The name is
;; Fraunces at a medium weight (520), cut for display sizes; the tagline is
;; Fraunces capitals, much smaller, at a book weight, spaced out, in the
;; site's second ink colour.

^:kindly/hide-code?
(view/grid 1 [(tile "horizontal — svg/lockup-horizontal.svg" 620 mark view/horizontal)])

;; **Stacked**, for square places: a profile picture, a poster, the foot of
;; a page. The name breaks into two lines, so the whole is close to square.

^:kindly/hide-code?
(view/grid 2 [(tile "stacked — svg/lockup-stacked.svg" 300 mark view/stacked)])

;; **Compact**, the mark and the name only, for small places where the
;; tagline would be too small to read. Here the name is cut for smaller
;; sizes, which makes its thin strokes a little sturdier.

^:kindly/hide-code?
(view/grid 1 [(tile "compact — svg/lockup-compact.svg" 440 mark view/compact)])

;; ## On other grounds
;;
;; On the dark ink colour the text turns light and the tagline uses the
;; third ink colour; the mark keeps its clay and sage. In one colour, for
;; stamps, embroidery or a one-colour print, everything is ink — the
;; tagline stays smaller only by size and spacing.

^:kindly/hide-code?
(view/grid 2 [(tile "horizontal, paper" 520 mark (assoc view/horizontal :background (c :paper)))
              (tile "horizontal, dark" 520 mark (view/on-dark view/horizontal))
              (tile "horizontal, one colour" 520 mark-ink (view/one-ink view/horizontal (c :ink)))
              (tile "compact, dark" 520 mark (view/on-dark view/compact))])

^:kindly/hide-code?
(view/grid 3 [(tile "stacked, paper" 260 mark (assoc view/stacked :background (c :paper)))
              (tile "stacked, dark" 260 mark (view/on-dark view/stacked))
              (tile "stacked, one colour" 260 mark-ink (view/one-ink view/stacked (c :ink)))])

;; The rest of this page is how we got there.
;;
;; ## A. The tagline
;;
;; We tried the tagline in the body face, Newsreader, and in Fraunces;
;; in sentence case, in italic, and in spaced capitals. Neither font comes
;; with true small capitals in the files Google serves, so we left small
;; capitals out: a browser would fake them by shrinking full capitals,
;; which makes their strokes too thin.

^:kindly/hide-code?
(def base (assoc view/horizontal :tag-face :newsreader :tag-upper? false
                 :tag-size 15 :tag-track 0 :tag-weight 400 :tag-opsz 15 :lead 24))

^:kindly/hide-code?
(view/grid 2 [(tile "Newsreader, sentence case" 520 mark base)
              (tile "Newsreader italic" 520 mark (assoc base :tag-italic? true :tag-size 16))
              (tile "Fraunces light, sentence case" 520 mark (assoc base :tag-face :fraunces :tag-weight 340))
              (tile "Fraunces light italic" 520 mark (assoc base :tag-face :fraunces :tag-weight 340 :tag-italic? true))
              (tile "Newsreader capitals, spaced 0.23 em" 520 mark
                    (assoc base :tag-upper? true :tag-size 10.5 :tag-track 2.4 :tag-opsz 10))
              (tile "Fraunces capitals, spaced 0.16 em (chosen)" 520 mark view/horizontal)
              (tile "Fraunces capitals in ink 3" 520 mark (assoc view/horizontal :tag-color (c :ink3)))
              (tile "Fraunces light capitals" 520 mark (assoc view/horizontal :tag-weight 300))])

;; In sentence case the tagline reads like a subtitle and pulls the eye
;; away from the name; in italic it reads like a quotation. Spaced capitals
;; sit quietly under the name, and they are how the site already sets its
;; small labels (Fraunces capitals, spaced about 0.1 to 0.16 em), so we
;; chose those. The third ink colour is too pale on paper for letters this
;; small, and the lightest weight starts to break up, so we kept ink 2 and
;; a book weight.
;;
;; ## B. How tall the mark is
;;
;; The mark is more than twice as tall as it is wide, and its ends are fine
;; points, so it looks smaller than its box. Here the same lockup with the
;; mark at four heights; the text is the same in each.

^:kindly/hide-code?
(view/grid 2 (for [[h drop] [[72 2] [84 4] [92 5] [108 10]]]
               (tile (str "mark " h " units tall" (when (= h 92) " (chosen)")) 520 mark
                     (assoc view/horizontal :mark-h h :mark-drop drop :bounds [0 -80 420 36]))))

;; At 72 the mark looks like a bullet point beside the name. At 108 it
;; towers over the text. At 92 the place where the stems cross sits level
;; with the name, the clay tip rises well above it, and the foot ends just
;; under the tagline.
;;
;; ## C. The name
;;
;; Fraunces changes its letter shapes with size: cut for small text it is
;; wider and plainer, cut for display it is narrower, with more contrast
;; between thick and thin. We also tried the weight, and "Garden" in
;; italic, in green or in ink.

^:kindly/hide-code?
(view/grid 2 [(tile "cut for size 40, weight 560" 520 mark (assoc view/horizontal :name-opsz 40 :name-weight 560 :bounds [0 -62 440 30]))
              (tile "cut for size 72, weight 520 (chosen)" 520 mark (assoc view/horizontal :bounds [0 -62 440 30]))
              (tile "italic Garden, green" 520 mark (assoc view/horizontal :italic-garden? true :bounds [0 -62 440 30]))
              (tile "italic Garden, ink" 520 mark (assoc view/horizontal :italic-garden? true :garden (c :ink) :bounds [0 -62 440 30]))])

;; The display cut, with its thin strokes, echoes the way the stems taper.
;; At 560 the name is heavier than the mark; 520 is closer to it. The
;; italic "Garden" is lovely on its own, but in green it adds a third colour
;; beside the mark's two, and even in ink it gives the name two voices.
;; We kept the name plain.
;;
;; ## D. Stacked: one line or two
;;
;; With the name in one line the stacked lockup is as wide as the
;; horizontal one. In two lines it is close to square, which is what a
;; stacked lockup is for.

^:kindly/hide-code?
(view/grid 3 [(tile "one line" 300 mark (assoc view/stacked :name-lines 1 :mark-h 124 :mark-gap 14 :tag-size 11 :tag-track 1.76 :tag-opsz 11 :bounds [-182 -180 182 28]))
              (tile "two lines, tagline 11" 240 mark (assoc view/stacked :tag-size 11 :tag-track 1.76 :tag-opsz 11 :bounds [-136 -153 136 69]))
              (tile "two lines, tagline 10 (chosen)" 240 mark view/stacked)])

;; With the tagline at 11 it is much wider than the name above it; at 10,
;; spaced a little less, it is about as wide as "Notknowing".
;;
;; ## E. Small
;;
;; The same files at the sizes they might be used. Below about 330 pixels
;; wide (horizontal) or 210 pixels (stacked) the tagline's capitals are
;; under 6 pixels tall and hard to read; that is where the compact version
;; takes over.

^:kindly/hide-code?
(view/grid 2 [(tile "horizontal at 330 px" 330 mark view/horizontal)
              (tile "stacked at 210 px" 210 mark view/stacked)
              (tile "compact at 200 px" 200 mark view/compact)
              (tile "compact at 160 px" 160 mark view/compact)])

;; ## Files
;;
;; `clojure -M:build` writes `svg/lockup-horizontal.svg`,
;; `svg/lockup-stacked.svg` and `svg/lockup-compact.svg`, each also with
;; `-dark` and `-ink`. Their text needs Fraunces from Google Fonts. The
;; `-outlined` files have the letters turned into shapes and need no font
;; (`tools/outline.py`); the PNGs in `png/` are drawn at twice size
;; (`tools/png.sh`). See the README.
