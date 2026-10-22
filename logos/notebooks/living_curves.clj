^:kindly/hide-code?
(ns living-curves
  "The two-curves mark, drawn to look more like something growing."
  (:require [notknowing-garden.living :as l]
            [notknowing-garden.marks :as m]
            [notknowing-garden.palette :refer [c]]
            [notknowing-garden.view :as view]
            [scicloj.kindly.v4.kind :as kind]))

^:kindly/hide-code?
(view/page-style)

;; # Living curves
;;
;; In the first sketches, two strokes, clay and sage, rise from one base to
;; one tip and cross on the way. Here we take that mark and try to make it
;; look more like a plant: thicker where it starts, finer where it ends,
;; less even, with tips that curl or open into a leaf.
;;
;; As before, every tile shows the mark at logo size, then at 32 and 16
;; pixels. The marks below come from `notknowing-garden.living/stems`,
;; which draws each stem as a filled band around a centre line, rather than
;; as a line of one width.
;;
;; ## The logo
;;
;; The one we chose: the tapered pair from section B, tips apart, with the
;; clay stem reaching higher and the sage stem stopping lower. It is
;; `notknowing-garden.living/logo`, and `clojure -M:build` writes it to
;; `svg/logo.svg`, `svg/logo-ink.svg` and two wordmarks.

^:kindly/hide-code?
(view/tiles 4 [["logo" (l/stems l/logo)]
               ["logo, ink" (l/stems (l/in l/logo (c :ink)))]])

^:kindly/hide-code?
(view/grid 1 [(view/wordmark-tile "logo, horizontal"
                                  (view/wordmark (l/stems l/logo) {:text-x 84}) 540)])

;; The rest of this notebook is how we got there.
;;
;; ## Where we start

(view/tiles 4 [["two-curves, twist 0.85, weight 8"
                (m/two-curves {:twist 0.85 :weight 8})]])

;; ## A. From lines to ribbons
;;
;; First we redraw the same two curves as filled bands. At one width the band
;; matches the line. Then we let the width fall from the base to the tip:
;; `w` is the width at the base, `tip-w` at the tip, and a larger `taper`
;; keeps the stem full for longer before it thins.

^:kindly/hide-code?
(view/tiles 4 [["one width, 8" (l/stems {})]
               ["12 to 1.2" (l/stems {:w 12 :tip-w 1.2})]
               ["13 to 1, taper 2" (l/stems {:w 13 :tip-w 1 :taper 2})]
               ["12 to 1, taper 1.6" (l/stems {:w 12 :tip-w 1 :taper 1.6})]])

;; Where the two stems leave the base, their full widths overlap in a lump.
;; `foot` narrows the very bottom, so each stem swells up out of a fine point,
;; the way a brush stroke does when it first touches the paper.

^:kindly/hide-code?
(view/tiles 4 (for [foot [1 0.7 0.45 0.2]]
                [(str "foot " foot) (l/stems {:w 12 :tip-w 1 :taper 1.6 :foot foot})]))

;; A tapered stroke already looks less like a diagram and more like a stem.
;; With both tips meeting at one point, though, it still closes like a
;; flame or a bulb.

;; ## B. Tips apart, and a lean
;;
;; Plants are rarely mirror images. Here each stem gets its own tip, so one
;; stops lower and the other reaches higher and further out.

^:kindly/hide-code?
(def ribbon {:w 12 :tip-w 1 :taper 1.6 :foot 0.2})

^:kindly/hide-code?
(view/tiles 4 (for [tips [[[50 10] [50 10]] [[56 8] [44 14]]
                          [[60 6] [38 20]] [[64 4] [34 26]]]]
                [(str "tips " (pr-str tips)) (l/stems (assoc ribbon :tips tips))]))

;; The tips apart make the mark open at the top. At the widest setting the
;; two stems look like a pair of horns, so we stay near the third.
;;
;; Two ways to lean. `lean` turns the whole drawing about its base;
;; `bow` bends it, a little low down and more toward the top.
;; The turned versions look tilted, like a sign hung crooked; the bowed
;; ones look more like a stem that grew toward one side.

^:kindly/hide-code?
(def apart (assoc ribbon :tips [[60 6] [38 20]]))

^:kindly/hide-code?
(view/tiles 4 [["lean -8°" (l/stems (assoc apart :lean -8))]
               ["lean 8°" (l/stems (assoc apart :lean 8))]
               ["bow -10" (l/stems (assoc apart :bow -10))]
               ["bow 10" (l/stems (assoc apart :bow 10))]])

;; ## C. Tendrils
;;
;; `curl` carries a stem on past its tip, turning more and more tightly,
;; as a pea tendril winds. `turn` is the total turn in degrees; its sign
;; sets the direction.

^:kindly/hide-code?
(view/tiles 4 [["sage, -300°" (l/stems (assoc apart :curl {:strand 1 :len 22 :turn -300}))]
               ["sage, +300°" (l/stems (assoc apart :curl {:strand 1 :len 22 :turn 300}))]
               ["clay, +360°" (l/stems (assoc apart :curl {:strand 0 :len 26 :turn 360}))]
               ["clay, -360°" (l/stems (assoc apart :curl {:strand 0 :len 26 :turn -360}))]])

;; Both stems curling. Curls of different sizes look more like growth than
;; a matched pair; when both turn inward the clay one becomes a hook,
;; close to a question mark.

^:kindly/hide-code?
(view/tiles 4 [["both, matched" (l/stems (assoc apart :curl [{:strand 1 :len 20 :turn -280}
                                                             {:strand 0 :len 20 :turn 280}]))]
               ["both, different" (l/stems (assoc apart :curl [{:strand 1 :len 16 :turn -260}
                                                               {:strand 0 :len 30 :turn 340}]))]
               ["both inward" (l/stems (assoc apart :curl [{:strand 1 :len 18 :turn 280}
                                                           {:strand 0 :len 26 :turn -320}]))]
               ["longer, tighter" (l/stems (assoc apart :curl [{:strand 1 :len 22 :turn -300}
                                                               {:strand 0 :len 28 :turn 330}]
                                                  :tips [[58 6] [38 16]]))]])

;; At 16 pixels the curls are gone: they are finer than a pixel.
;; We come back to small sizes in section H.

;; ## D. Leaves and buds
;;
;; A leaf can grow out of the side of a stem (`at` is how far along),
;; or the stem can open into a leaf at its end.

^:kindly/hide-code?
(def clay-curl {:strand 0 :len 30 :turn 340})

^:kindly/hide-code?
(view/tiles 4 [["leaf at the sage tip"
                (l/stems (assoc apart :curl clay-curl :tip-w 1.6 :tips [[60 6] [37 24]]
                                :leaves [{:strand 1 :at 1 :len 22 :width 7 :angle -4 :bend 0.07}]))]
               ["pale sage leaf"
                (l/stems (assoc apart :curl clay-curl :tip-w 1.6 :tips [[60 6] [37 24]]
                                :leaves [{:strand 1 :at 1 :len 22 :width 7 :angle -4 :bend 0.07
                                          :color (c :leaf2)}]))]
               ["side leaf, sage"
                (l/stems (assoc apart :curl [clay-curl {:strand 1 :len 16 :turn -260}]
                                :leaves [{:strand 1 :at 0.66 :len 16 :width 5.5 :angle -50 :bend 0.08}]))]
               ["two side leaves"
                (l/stems (assoc apart :curl [clay-curl {:strand 1 :len 16 :turn -260}]
                                :leaves [{:strand 1 :at 0.7 :len 13 :width 4.5 :angle -50 :bend 0.08}
                                         {:strand 0 :at 0.62 :len 13 :width 4.5 :angle 50 :bend -0.08}]))]])

;; The leaf at the end of the sage stem reads at once as a seedling. The
;; pale leaf separates from its stem and looks laid on top. Small side
;; leaves look like thorns or fins at this scale, so we drop them.
;;
;; We also tried a bud: the stem swells again near its end. It came out
;; looking like a spoon.

^:kindly/hide-code?
(view/tiles 4 [["bud on the clay stem" (l/stems (assoc apart :buds [{:strand 0 :from 0.72 :bw 9}]))]])

;; ## E. Over and under
;;
;; Where the stems cross, the one on top can cut a thin gap in the one
;; behind, as in a woven or plaited drawing. `over` picks which stem is on
;; top and `gap` sets the width of the cut. The gap is a mask, so the
;; ground shows through it, whatever the ground is.

^:kindly/hide-code?
(def tendril-pair (assoc apart :tips [[58 6] [38 16]]
                         :curl [{:strand 1 :len 22 :turn -300} {:strand 0 :len 28 :turn 330}]))

^:kindly/hide-code?
(view/tiles 4 [["no weave" (l/stems tendril-pair)]
               ["clay over, gap 1.4" (l/stems (assoc tendril-pair :weave {:gap 1.4 :over 0}))]
               ["sage over, gap 1.1" (l/stems (assoc tendril-pair :weave {:gap 1.1 :over 1}))]
               ["sage over, gap 2.2" (l/stems (assoc tendril-pair :weave {:gap 2.2 :over 1}))]])

;; In two colours the weave adds a fine paper line; without it the colours
;; alone tell the stems apart. In one colour the weave is what tells them
;; apart, which matters for a logo that has to print in one ink.

^:kindly/hide-code?
(view/tiles 4 [["ink, no weave" (l/stems (l/in tendril-pair (c :ink)))]
               ["ink, weave" (l/stems (l/in (assoc tendril-pair :weave {:gap 1.4 :over 1}) (c :ink)))]
               ["sage, no weave" (l/stems (l/in tendril-pair (c :leaf)))]
               ["sage, weave" (l/stems (l/in (assoc tendril-pair :weave {:gap 1.4 :over 1}) (c :leaf)))]])

;; With one crossing, whichever stem passes behind looks cut in two.
;; Sage over clay keeps the lower sage lobe whole, which balances the
;; longer clay stem, so we keep that.

;; ## F. Irregularity
;;
;; `wobble` moves the centre line sideways by a few units, smoothly and not
;; at the ends; `grain` varies the width by a few percent. Both come from
;; slow sine waves with phases drawn from a `seed`, so the same seed always
;; gives the same drawing. `spread` lets one lower lobe be wider than the
;; other.

^:kindly/hide-code?
(def woven (assoc tendril-pair :weave {:gap 1.1 :over 1} :bow 4))

^:kindly/hide-code?
(view/tiles 4 (for [[sp wb sd] [[[1 1] 0 7] [[1.1 0.9] 1.5 3] [[1.1 0.9] 1.5 9] [[1.1 0.9] 1.5 21]]]
                [(str "spread " sp ", wobble " wb ", seed " sd)
                 (l/stems (assoc woven :spread sp :wobble wb :seed sd))]))

^:kindly/hide-code?
(view/tiles 4 (for [gr [0 0.08 0.15 0.3]]
                [(str "grain " gr) (l/stems (assoc woven :grain gr :seed 4))]))

;; At 0.3 the grain turns lumpy. Around 0.1 the edges get a slight
;; unevenness, like a brush stroke, without drawing the eye.

;; ## G. Tried and set aside
;;
;; Roots: each stem carries on a little below the base, so the two cross
;; there too. Ground: a short tapered line under the base. Twining: the two
;; stems wind around each other several times. A multiply blend, so the
;; overlap darkens.

^:kindly/hide-code?
(view/tiles 4 [["roots" (l/stems (assoc tendril-pair :foot 1 :roots {:len 18 :bend -40 :root-w 0.6}))]
               ["ground" (l/stems (assoc apart :ground {:w 3 :len 40 :dy 3}))]
               ["twining, 3 half-turns"
                (l/stems (assoc ribbon :twine 3 :width 30 :tips [[54 8] [46 12]] :weave {:gap 2}))]
               ["multiply blend" (l/stems (assoc tendril-pair :blend "multiply"))]])

;; The roots look like legs or tentacles, and the ground makes a small
;; mound that reads as an illustration rather than a sign. Twining looks
;; like rope or a chain, and its many cuts turn to noise when small. Clay
;; multiplied by sage is nearly black, so the overlap becomes a dark spot.

;; ## H. Small sizes
;;
;; The tall mark is less than half as wide as it is high, so at 16 pixels
;; it is about seven pixels wide, and its thin tips vanish. For small sizes
;; we draw a shorter, wider and heavier version.
;;
;; Heavy bands bring a problem: where a stem bends more tightly than half
;; its width, the inner edge of the band folds back over itself. We cover
;; the holes this leaves with discs, but the outline still grows ears at the
;; tips and base. Drawing each stem as thirty short stroked runs, each at its
;; own width with round ends, avoids the folding, at the cost of slightly
;; scalloped edges, which do not show at 32 pixels.

^:kindly/hide-code?
(view/tiles 4 [["heavy, as an outline" (l/stems (dissoc l/favicon :stroke?))]
               ["heavy, as stroked runs" (l/stems l/favicon)]
               ["runs, no curls" (l/stems (assoc l/favicon :curl nil))]
               ["runs, weight 22" (l/stems (assoc l/favicon :w 22 :tip-w 8))]])

^:kindly/hide-code?
(view/tiles 4 [["reference, weight 12" (m/two-curves {:twist 0.85 :weight 12})]
               ["small, woven" (l/stems (assoc l/favicon :weave {:gap 3 :over 1}))]
               ["small, ink, woven" (l/stems (l/in (assoc l/favicon :weave {:gap 3.5 :over 1}) (c :ink)))]
               ["small, clay, woven" (l/stems (l/in (assoc l/favicon :weave {:gap 3.5 :over 1}) (c :clay)))]])

;; ## I. Colour
;;
;; The tendril pair and the leaf pair in four pairings of the site's
;; colours. (The one-colour versions are in section E.)

^:kindly/hide-code?
(def colourings [["clay + sage" [(c :clay) (c :leaf)]]
                 ["two sages" [(c :leaf2) (c :leaf)]]
                 ["clay + pale sage" [(c :clay) (c :leaf2)]]
                 ["ink + clay" [(c :ink) (c :clay)]]])

^:kindly/hide-code?
(view/tiles 4 (for [[nm cs] colourings] [nm (l/stems (l/in l/tendrils cs))]))

^:kindly/hide-code?
(view/tiles 4 (for [[nm cs] colourings] [nm (l/stems (l/in l/leaf-and-tendril cs))]))

;; Two sages are the calmest; clay and sage keep the two people distinct.
;; Ink and clay look heavier and more formal.

^:kindly/hide-code?
(kind/hiccup
 (into [:div {:style {:display "grid" :grid-template-columns "repeat(4, minmax(0, 1fr))"
                      :gap 12 :text-align "center" :background (c :ink)
                      :padding 12 :border-radius 6}}]
       (for [[nm mk] [["paper" (l/stems (l/in l/tendrils (c :paper)))]
                      ["clay + pale sage" (l/stems (l/in l/tendrils [(c :clay) (c :leaf2)]))]
                      ["paper, leaf" (l/stems (l/in l/leaf-and-tendril (c :paper)))]
                      ["clay + pale sage, leaf" (l/stems (l/in l/leaf-and-tendril [(c :clay) (c :leaf2)]))]]]
         [:div (view/mark-svg mk 120)
          [:div {:style {:display "flex" :gap 14 :justify-content "center" :margin-top 6}}
           (view/mark-svg mk 32) (view/mark-svg mk 16)]
          [:div {:style {:color (c :rule) :font-size 14 :margin-top 6}} nm]])))

;; On the dark ground the woven gap shows the dark through it, since it is
;; a mask rather than a paper-coloured line.

;; ## J. Candidates
;;
;; Our strongest few. The first three are for logo sizes, the first two in
;; clay and sage and the third in two sages. The fourth and fifth are
;; small-size versions, in colour and in one ink. The last is the tendril
;; pair in one ink.

^:kindly/hide-code?
(view/tiles 3 [["1. tendrils, clay + sage" (l/stems l/tendrils)]
               ["2. leaf and tendril, clay + sage" (l/stems l/leaf-and-tendril)]
               ["3. tendrils, two sages" (l/stems (l/in l/tendrils [(c :leaf2) (c :leaf)]))]
               ["4. small, clay + sage" (l/stems l/favicon)]
               ["5. small, ink, woven" (l/stems (l/in (assoc l/favicon :weave {:gap 3.5 :over 1}) (c :ink)))]
               ["6. tendrils, ink" (l/stems (l/in l/tendrils (c :ink)))]])

;; The option maps are `l/tendrils`, `l/leaf-and-tendril` and `l/favicon`
;; in `src/notknowing_garden/living.clj`.
;;
;; With the name, for the first two:

^:kindly/hide-code?
(view/grid 1
           [(view/wordmark-tile "tendrils, horizontal, italic Garden"
                                (view/wordmark (l/stems l/tendrils)
                                               {:italic-garden? true :text-x 84}) 540)
            (view/wordmark-tile "leaf and tendril, horizontal"
                                (view/wordmark (l/stems l/leaf-and-tendril) {:text-x 84}) 540)])

^:kindly/hide-code?
(view/grid 3
           [(view/wordmark-tile "tendrils, stacked"
                                (view/wordmark (l/stems l/tendrils) {:layout :stacked}) 260)
            (view/wordmark-tile "leaf and tendril, stacked, italic"
                                (view/wordmark (l/stems l/leaf-and-tendril)
                                               {:layout :stacked :italic-garden? true}) 260)])

;; ## Open questions
;;
;; - The small version is a separate drawing; we have not yet seen the two
;;   side by side in a browser tab next to the wordmark on the page.
;; - At 32 pixels and below the tendril tips of the tall marks do not show;
;;   we have not checked the sizes in between.
;; - None of these has been printed.
