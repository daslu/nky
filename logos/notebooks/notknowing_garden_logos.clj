^:kindly/hide-code?
(ns notknowing-garden-logos
  "First sketches of a mark for Notknowing Garden."
  (:require [notknowing-garden.marks :as m]
            [notknowing-garden.palette :refer [c]]
            [notknowing-garden.view :as view]
            [scicloj.kindly.v4.kind :as kind]))

^:kindly/hide-code?
(view/page-style)

;; # Notknowing Garden — logo sketches
;;
;; Notknowing Garden is where a tantra therapist and a yoga teacher make
;; spaces together, online and in person, for wellness and movement
;; communities. Here we sketch a few directions for its mark.
;;
;; Each mark is a small Clojure function that returns SVG.
;; Most take a parameter or two, so we can line up variants side by side.
;; Every tile shows the mark at logo size, then at 32 and 16 pixels,
;; which is roughly how a favicon appears in a browser tab.
;;
;; ## Where we start
;;
;; The site's palette comes from `shared/warm.scss`.
;; We add two sage greens for leaves; the rest are the site's own colours.

^:kindly/hide-code?
(view/swatches)

;; The current favicon is a comma set in Fraunces, from the old name,
;; "not knowing, yet".

^:kindly/hide-code?
(view/tiles 4 [["the current comma" (m/fraunces-comma {})]])

;; ## A. A sprout from an open seed
;;
;; An open circle, like a seed coat or a question not yet closed. Its line
;; carries on out of the opening as a stem. Here we vary the opening.

^:kindly/hide-code?
(view/tiles 4 (for [gap [30 60 90 130]]
                [(str "opening " gap "°") (m/sprout {:gap gap})]))

;; One leaf or two, and in the site's clay instead of green.

^:kindly/hide-code?
(view/tiles 4 [["one leaf" (m/sprout {:leaves 1})]
               ["two leaves" (m/sprout {:leaves 2})]
               ["clay leaves" (m/sprout {:accent (c :clay)})]
               ["heavier line" (m/sprout {:weight 9})]])

;; ## B. A comma that becomes a leaf
;;
;; We keep the comma of the old favicon and let its head draw up into a point.
;; At 0 it is a comma; at 1 it is closer to a leaf.

^:kindly/hide-code?
(view/tiles 4 (for [point [0 0.35 0.7 1]]
                [(str "point " point) (m/comma-leaf {:point point})]))

;; With a pale vein, and in colour.

^:kindly/hide-code?
(view/tiles 4 [["vein, ink" (m/comma-leaf {:point 0.7 :vein true})]
               ["leaf green" (m/comma-leaf {:point 0.7 :fill (c :leaf)})]
               ["green, vein" (m/comma-leaf {:point 1 :fill (c :leaf) :vein true})]
               ["clay" (m/comma-leaf {:point 0.35 :fill (c :clay)})]])

;; A related idea: an open circle whose end turns outward into a leaf.

^:kindly/hide-code?
(view/tiles 4 (for [[gap size] [[50 0.8] [70 1] [90 1.1] [120 1.2]]]
                [(str "opening " gap "°, leaf " size)
                 (m/open-circle-leaf {:gap gap :leaf-size size})]))

;; ## C. Two curves
;;
;; Two strokes, one clay and one green, share a base and a tip.
;; `twist` moves the upper half of each stroke across to the other side.
;; At 0 they are the two edges of one leaf; as the twist grows they cross,
;; so neither line is the whole shape alone.

^:kindly/hide-code?
(view/tiles 4 (for [twist [0 0.4 0.7 1]]
                [(str "twist " twist) (m/two-curves {:twist twist})]))

;; Narrower and wider, and in ink alone.

^:kindly/hide-code?
(view/tiles 4 [["narrow" (m/two-curves {:twist 0.7 :width 24})]
               ["wide" (m/two-curves {:twist 0.7 :width 44})]
               ["ink only" (m/two-curves {:twist 0.7 :warm (c :ink) :accent (c :ink)})]
               ["heavier line" (m/two-curves {:twist 0.7 :weight 9})]])

;; ## D. An enclosed garden
;;
;; A bed or a walled garden, open at the bottom so there is a way in,
;; with a sprout inside.

^:kindly/hide-code?
(view/tiles 4 [["arch" (m/garden-bed {:shape :arch})]
               ["rounded square" (m/garden-bed {:shape :square})]
               ["circle" (m/garden-bed {:shape :circle})]
               ["arch, wider gate" (m/garden-bed {:shape :arch :gap 30})]])

;; ## Favicon weights
;;
;; At 16 pixels a 6-unit line is under one pixel wide.
;; Here the strongest candidates are drawn heavier, at favicon size only.

^:kindly/hide-code?
(view/tiles 4 [["sprout, weight 11" (m/sprout {:weight 11 :leaves 1 :gap 70})]
               ["comma-leaf, filled" (m/comma-leaf {:point 0.7 :fill (c :leaf)})]
               ["two curves, weight 12" (m/two-curves {:twist 0.7 :weight 12})]
               ["arch, weight 11" (m/garden-bed {:shape :arch :weight 11 :gap 24})]])

;; ## E. With the name
;;
;; The name is set in Fraunces, the site's display face.

^:kindly/hide-code?
(view/grid 1
           [(view/wordmark-tile "sprout, horizontal"
                                (view/wordmark (m/sprout {}) {}) 540)
            (view/wordmark-tile "two curves, horizontal, italic Garden"
                                (view/wordmark (m/two-curves {:twist 0.7})
                                               {:italic-garden? true}) 540)
            (view/wordmark-tile "comma-leaf, lower case"
                                (view/wordmark (m/comma-leaf {:point 0.7 :fill (c :leaf)})
                                               {:lower? true}) 540)])

^:kindly/hide-code?
(view/grid 3
           [(view/wordmark-tile "arch, stacked"
                                (view/wordmark (m/garden-bed {:shape :arch})
                                               {:layout :stacked}) 260)
            (view/wordmark-tile "sprout, stacked, italic"
                                (view/wordmark (m/sprout {})
                                               {:layout :stacked :italic-garden? true}) 260)
            (view/wordmark-tile "two curves, stacked, lower case"
                                (view/wordmark (m/two-curves {:twist 0.7})
                                               {:layout :stacked :lower? true}) 260)])

;; ## Open questions
;;
;; - Text in these SVGs depends on Fraunces being loaded. A final logo would
;;   have its letters converted to outlines.
;; - None of these has been seen on a phone home screen or in print yet.
