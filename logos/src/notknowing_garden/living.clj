(ns notknowing-garden.living
  "Two stems that grow from one base, drawn as filled ribbons rather than
  constant-width lines. Every part of a mark is built as a polygon (a vector
  of points), so the whole mark can be fitted to the 100 x 100 box at the end."
  (:require [notknowing-garden.geometry :as g]
            [notknowing-garden.palette :refer [c]]))

;; ## Sampling curves

(defn cubic
  "Point at `t` on the cubic Bezier p0 p1 p2 p3."
  [[p0 p1 p2 p3] t]
  (let [u (- 1 t)]
    (reduce g/v+ [(g/v* p0 (* u u u))
                  (g/v* p1 (* 3 u u t))
                  (g/v* p2 (* 3 u t t))
                  (g/v* p3 (* t t t))])))

(defn sample-cubic [ctrls n]
  (mapv #(cubic ctrls (/ % (double n))) (range (inc n))))

(defn rotate
  "Rotate point `q` by `deg` degrees about `o` (positive is clockwise on screen)."
  [o q deg]
  (let [a (Math/toRadians deg)
        [x y] (g/v- q o)]
    (g/v+ o [(- (* x (Math/cos a)) (* y (Math/sin a)))
             (+ (* x (Math/sin a)) (* y (Math/cos a)))])))

(defn heading [[x y]] (Math/toDegrees (Math/atan2 y x)))

(defn wind
  "Carries a polyline on past its last point, turning ever more tightly, the
  way a tendril winds. `len` is the added length, `turn` the total turn in
  degrees (negative turns the other way)."
  [pts {:keys [len turn steps] :or {steps 40}}]
  (let [[a b] (take-last 2 pts)
        h0    (heading (g/v- b a))
        ds    (/ len steps)
        ;; curvature grows along the tendril, so the total turn comes mostly
        ;; at the end: d(heading)/ds ~ s^2, integrating to `turn`.
        dh    (fn [i] (* turn (- (Math/pow (/ (inc i) steps) 3)
                                 (Math/pow (/ i steps) 3))))]
    (loop [i 0 h h0 q b acc pts]
      (if (= i steps)
        acc
        (let [h' (+ h (dh i))
              q' (g/polar q ds h')]
          (recur (inc i) h' q' (conj acc q')))))))

(defn cum-length
  "Cumulative arc length along `pts`."
  [pts]
  (vec (reductions + 0 (map (fn [a b] (g/len (g/v- b a))) pts (rest pts)))))

(defn fractions
  "Cumulative arc length along `pts`, scaled to 0..1."
  [pts]
  (let [cum (cum-length pts)
        tot (peek cum)]
    (mapv #(/ % tot) cum)))

(defn resample
  "`n`+1 points evenly spaced along the polyline `pts`."
  [pts n]
  (let [fs (fractions pts)]
    (mapv (fn [k]
            (let [t (/ k (double n))
                  j (min (- (count pts) 2) (max 0 (dec (count (take-while #(<= % t) fs)))))
                  a (fs j) b (fs (inc j))
                  u (if (= a b) 0 (/ (- t a) (- b a)))]
              (g/lerp (pts j) (pts (inc j)) (min 1.0 (max 0.0 u)))))
          (range (inc n)))))

(defn tangents [pts]
  (let [n (count pts)]
    (mapv (fn [i]
            (g/unit (g/v- (pts (min (dec n) (inc i))) (pts (max 0 (dec i))))))
          (range n))))

;; ## Smooth, seeded variation

(defn noise
  "A smooth function of t in 0..1, about -1..1, from a few slow sines with
  phases drawn from `seed`. The same seed always gives the same curve."
  [seed]
  (let [r      (java.util.Random. (long seed))
        waves  (vec (for [f [1.0 1.7 2.9]]
                      [f (* 2 Math/PI (.nextDouble r)) (/ 1.0 f)]))
        norm   (reduce + (map #(nth % 2) waves))]
    (fn [t]
      (/ (reduce + (for [[f ph a] waves]
                     (* a (Math/sin (+ ph (* 2 Math/PI f t))))))
         norm))))

(defn wobble
  "Moves each point sideways by up to `amp`, smoothly, and not at all at the
  two ends."
  [pts seed amp]
  (if (zero? amp)
    pts
    (let [nz (noise seed)
          fs (fractions pts)
          ts (tangents pts)]
      (mapv (fn [q t d]
              (g/v+ q (g/v* (g/normal d) (* amp (nz t) (Math/sin (* Math/PI t))))))
            pts fs ts))))

;; ## Ribbons

(defn curvature
  "Curvature at each point of `pts` (1 / radius), taking the largest value
  within a few points either side, so a width limit based on it eases in."
  [pts]
  (let [n  (count pts)
        ts (tangents pts)
        cl (cum-length pts)
        k  (mapv (fn [i]
                   (let [a (max 0 (dec i)) b (min (dec n) (inc i))
                         da (Math/abs (Math/toRadians
                                       (let [x (- (heading (ts b)) (heading (ts a)))]
                                         (- (mod (+ x 180) 360) 180))))
                         ds (- (cl b) (cl a))]
                     (if (pos? ds) (/ da ds) 0)))
                 (range n))]
    (mapv (fn [i] (apply max (map k (range (max 0 (- i 4)) (min n (+ i 5)))))) (range n))))

(defn ribbon
  "Outline of a band of varying width along `pts`. `width` is a function of
  the arc-length fraction t. Ends get a round cap of the end width.
  Where the line bends more tightly than half the width, the inner edge
  folds back over itself; `stamps` covers those places."
  [pts width]
  (let [fs    (fractions pts)
        ts    (tangents pts)
        ws    (mapv width fs)
        ;; an edge point that would step backwards along the line is part of a
        ;; fold; leaving it out keeps the outline from growing ears
        side  (fn [k] (let [es (mapv (fn [q d w] (g/v+ q (g/v* (g/normal d) (* k 0.5 w)))) pts ts ws)
                            n  (count es)]
                        (reduce (fn [acc j]
                                  (let [[px py] (g/v- (es j) (peek acc))
                                        [tx ty] (ts j)]
                                    (if (or (= j (dec n)) (pos? (+ (* px tx) (* py ty))))
                                      (conj acc (es j))
                                      acc)))
                                [(es 0)] (range 1 n))))
        cap   (fn [q d w from]
                (for [a (range 20 180 20)]
                  (g/v+ q (g/v* (rotate [0 0] (g/normal d) (+ from a)) (* 0.5 w)))))
        left  (side 1)
        right (side -1)]
    (vec (concat left
                 (cap (peek pts) (peek ts) (peek ws) 180)
                 (rseq right)
                 (cap (first pts) (first ts) (first ws) 0)))))

(defn stamps
  "Discs along `pts` wherever the band is wide for the bend, as
  [centre radius] pairs. Painted under the outline, they fill the gaps a
  folded inner edge leaves."
  [pts width]
  (let [pts (resample pts (* 3 (dec (count pts))))
        fs  (fractions pts)
        ks  (curvature pts)]
    (vec (for [[q t k] (map vector pts fs ks)
               :let [r (* 0.5 (width t))]
               :when (> (* k r) 0.6)]
           [q r]))))

(defn discs-d [discs]
  (apply str (for [[[x y] r] discs]
               (format "M %.1f %.1f a %.1f %.1f 0 1 0 %.1f 0 a %.1f %.1f 0 1 0 %.1f 0 "
                       (- x r) y r r (* 2 r) r r (* -2 r)))))

(defn profile
  "Width along a stem: `w` near the base, easing to `tip` at the end.
  `taper` above 1 keeps the stem full for longer before it thins.
  `foot` below 1 narrows the very base, so the stem swells up out of it,
  as a brush stroke does when it first touches the paper."
  [{:keys [w tip taper foot] :or {tip 0.6 taper 1.4 foot 1}}]
  (fn [t]
    (let [e (min 1.0 (/ t 0.3))
          s (+ foot (* (- 1 foot) e e (- 3 (* 2 e))))]
      (* s (+ tip (* (- w tip) (- 1 (Math/pow t taper))))))))

(defn leaf-polygon
  "The `g/leaf` shape (two quadratics, pointed at both ends) as points."
  [base tip width asym bend]
  (let [axis (g/v- tip base)
        nrm  (g/unit (g/normal axis))
        mid  (g/v+ (g/lerp base tip 0.5) (g/v* nrm (* bend (g/len axis))))
        c1   (g/v+ mid (g/v* nrm (* width (+ 1 asym))))
        c2   (g/v- mid (g/v* nrm (* width (- 1 asym))))
        quad (fn [a ctl b] (for [i (range 21)]
                             (let [t (/ i 20.0) u (- 1 t)]
                               (reduce g/v+ [(g/v* a (* u u)) (g/v* ctl (* 2 u t)) (g/v* b (* t t))]))))]
    (vec (concat (quad base c1 tip) (rest (quad tip c2 base))))))

;; ## Crossings

(defn- seg-cross [[p1 p2] [p3 p4]]
  (let [[dx1 dy1] (g/v- p2 p1)
        [dx2 dy2] (g/v- p4 p3)
        den (- (* dx1 dy2) (* dy1 dx2))]
    (when-not (zero? den)
      (let [[ex ey] (g/v- p3 p1)
            s (/ (- (* ex dy2) (* ey dx2)) den)
            u (/ (- (* ex dy1) (* ey dx1)) den)]
        (when (and (<= 0 s 1) (<= 0 u 1)) [s u])))))

(defn crossings
  "Indices [i j] where segment i of `a` crosses segment j of `b`, ignoring
  the first and last `skip` fraction of each line."
  [a b skip]
  (let [fa (fractions a) fb (fractions b)]
    ;; a crossing at a shared vertex shows up twice; keep one
    (reduce (fn [acc [i j]]
              (if (some (fn [[i' _]] (< (Math/abs (- i i')) 4)) acc) acc (conj acc [i j])))
            []
            (for [i (range (dec (count a)))
                  :when (< skip (fa i) (- 1 skip))
                  j (range (dec (count b)))
                  :when (< skip (fb j) (- 1 skip))
                  :when (seg-cross [(a i) (a (inc i))] [(b j) (b (inc j))])]
              [i j]))))

;; ## Fitting to the box

(defn- bbox [polys]
  (let [ps (apply concat polys)
        xs (map first ps) ys (map second ps)]
    [(apply min xs) (apply min ys) (apply max xs) (apply max ys)]))

(defn fitter
  "A function that maps points so `polys` fit the 100 box with `margin`,
  centred, and the scale it uses."
  [polys margin]
  (let [[x0 y0 x1 y1] (bbox polys)
        k  (/ (- 100 (* 2 margin)) (max (- x1 x0) (- y1 y0)))
        ox (- 50 (* k (/ (+ x0 x1) 2)))
        oy (- 50 (* k (/ (+ y0 y1) 2)))]
    [(fn [[x y]] [(+ ox (* k x)) (+ oy (* k y))]) k]))

(defn d
  "Path data for a closed polygon, smoothed: quadratic curves through the
  midpoints, with the points themselves as controls."
  [pts]
  (let [f   (fn [[x y]] (format "%.1f %.1f" (double x) (double y)))
        mid (fn [a b] (g/lerp a b 0.5))
        n   (count pts)
        ms  (mapv #(mid (pts %) (pts (mod (inc %) n))) (range n))]
    (apply str "M " (f (peek ms))
           (concat (for [i (range n)] (str " Q " (f (pts i)) " " (f (ms i))))
                   [" Z"]))))

;; ## The mark

(def defaults
  {:base    [50 90]
   :tips    [[50 10] [50 10]]
   :twist   0.85
   :width   34
   :spread  [1 1]
   :lean    0
   :w       8
   :tip-w   8
   :taper   1.4
   :foot    1
   :wobble  0
   :seed    7
   :curl    nil
   :leaves  []
   :buds    []
   :weave   nil
   :ground  nil
   :colors  [(c :clay) (c :leaf)]
   :blend   nil
   :margin  6
   :fit?    true})

(defn- twine-line
  "Strand `i` winding about the straight line from the base to its tip:
  `twine` half-turns, swinging out at most `width`, and narrowing toward
  the top by `narrow` (0 keeps the swing even)."
  [{:keys [base tips width spread twine narrow] :or {narrow 0.5}} i]
  (let [s   (if (zero? i) 1 -1)
        tip (tips i)
        ax  (g/v- tip base)
        nrm (g/unit (g/normal ax))]
    (mapv (fn [k]
            (let [t   (/ k 60.0)
                  env (* (Math/pow (Math/sin (* Math/PI (min 1.0 (* 1.15 t)))) 0.6)
                         (- 1 (* narrow t)))
                  off (* s width 0.5 (spread i) env (Math/sin (* Math/PI twine t)))]
              (g/v+ (g/v+ base (g/v* ax t)) (g/v* nrm off))))
          (range 61))))

(defn- centreline
  "Strand `i` (0 is the clay one, curving out left first; 1 curves out right)."
  [{:keys [base tips twist width spread twine] :as o} i]
  (if twine
    (twine-line o i)
    (let [s     (if (zero? i) 1 -1)
          tip   (tips i)
          w     (* width (spread i))
          [bx by] base
          [tx ty] tip
          y-at  (fn [k] (+ by (* k (- ty by))))]
      (sample-cubic [base
                     [(- bx (* s w)) (y-at 0.275)]
                     [(- tx (* s w (- 1 (* 2 twist)))) (y-at 0.725)]
                     tip]
                    60))))

(defn- item [poly attrs] {:poly poly :attrs attrs})

(defn stems
  "Two stems from one base, as filled ribbons. See `defaults` for options.
  - `:tips` one tip per stem, so they can stop at different heights
  - `:w` `:tip-w` `:taper` the width profile (one value, or a pair)
  - `:bow` bends the stems sideways, more toward the top, in units
  - `:lean` turns the whole plant about its base, in degrees
  - `:wobble` `:seed` smooth sideways drift, in units
  - `:roots` {:len l :bend deg} carries each stem on below the base
  - `:grain` a few percent of smooth, seeded variation in width
  - `:twine` n winds the stems about each other n half-turns instead
  - `:curl` {:strand i :len l :turn deg} (or several) winds the end of a stem
  - `:buds` [{:strand i :from t :bw w}] the stem swells into a bud at its end
  - `:leaves` [{:strand i :at t :len l :width w :angle deg :color c}]
  - `:weave` {:gap g :over i} cuts a gap in the stem that passes behind
  - `:ground` {:w w :len l :dy y} a short tapered line under the base
  - `:stroke?` draws each stem as short stroked runs instead of an outline,
    which stays clean when the stem is heavy for its bends (favicon sizes)
  - `:colors` a pair; `:blend` \"multiply\" lets the overlap darken"
  [opts]
  (let [{:keys [base lean w tip-w taper seed curl leaves weave ground colors
                blend margin fit?] :as o} (merge defaults opts)
        pair   (fn [v i] (if (sequential? v) (v i) v))
        roots  (:roots o)
        built  (vec (for [i [0 1]]
                      (let [pts (centreline o i)
                            ;; a root carries the first stretch of the stem on
                            ;; down past the base, so the two stems cross there
                            rl  (if roots (pair (:len roots) i) 0)
                            pts (if (pos? rl)
                                  (let [dir (g/unit (g/v- (pts 0) (pts 3)))
                                        bend (* (if (zero? i) 1 -1) (:bend roots 0))]
                                    (into (vec (for [k (range 12 0 -1)]
                                                 (let [u (/ k 12.0)]
                                                   (g/v+ (pts 0) (g/v* (rotate [0 0] dir (* bend u)) (* rl u))))))
                                          pts))
                                  pts)
                            r0  (if (pos? rl) (/ rl (+ rl (peek (cum-length (centreline o i))))) 0)
                            pts (wobble pts (+ seed i) (pair (:wobble o) i))
                            ;; a bow bends the stems over to one side, more toward the top
                            pts (if-let [bw (:bow o)]
                                  (let [[_ by] base]
                                    (mapv (fn [[x y]] (let [h (/ (- by y) 80.0)]
                                                        [(+ x (* bw h h)) y]))
                                          pts))
                                  pts)
                            pts (reduce (fn [pts cl] (if (= i (:strand cl)) (wind pts cl) pts))
                                        pts (if (map? curl) [curl] curl))
                            ;; the curl lengthens the line, so the root's share shrinks
                            r0  (* r0 (/ (+ rl (peek (cum-length (centreline o i))))
                                         (peek (cum-length pts))))]
                        {:pts (resample (mapv #(rotate base % lean) pts) 90) :r0 r0})))
        lines  (mapv :pts built)
        widths (vec (for [i [0 1]]
                      (let [f  (profile {:w (pair w i) :tip (pair tip-w i) :taper (pair taper i)
                                         :foot (pair (:foot o) i)})
                            r0 (:r0 (built i))
                            nz (noise (+ seed 20 i))
                            gr (:grain o 0)]
                        (fn [t]
                          (* (+ 1 (* gr (nz t)))
                             (if (< t r0)
                               (* (f 0) (:root-w roots 0.8) (+ 0.1 (* 0.9 (Math/pow (/ t r0) 0.8))))
                               (f (/ (- t r0) (- 1 r0)))))))))
        ;; a bud: the stem swells again near its end and closes to a point
        widths (reduce (fn [ws {:keys [strand from bw] :or {from 0.75 bw 8}}]
                         (update ws strand
                                 (fn [f] (fn [t] (if (< t from)
                                                   (f t)
                                                   (+ (f t) (* bw (Math/pow (Math/sin (* Math/PI (/ (- t from) (- 1 from)))) 0.9))))))))
                       widths (:buds o))
        bodies (mapv #(ribbon (lines %) (widths %)) [0 1])
        lvs    (vec (for [{:keys [strand at len width angle asym bend color] :or {asym 0.1 bend 0}} leaves]
                      (let [pts (lines strand)
                            fs  (fractions pts)
                            k   (count (take-while #(< % at) fs))
                            q   (pts (min k (dec (count pts))))
                            dir (nth (tangents pts) (min k (dec (count pts))))
                            tip (g/v+ q (g/v* (rotate [0 0] dir angle) len))]
                        (item (leaf-polygon q tip width asym bend)
                              {:fill (or color (colors strand))}))))
        gnd    (when ground
                 (let [{gw :w gl :len dy :dy gx :dx :or {gw 3 gl 34 dy 4 gx 0}} ground
                       [bx by] base
                       pts (sample-cubic [[(+ bx gx (- (/ gl 2))) (+ by dy 1)]
                                          [(+ bx gx (- (/ gl 6))) (+ by dy -1)]
                                          [(+ bx gx (/ gl 6)) (+ by dy -1)]
                                          [(+ bx gx (/ gl 2)) (+ by dy 1)]] 30)]
                   (item (ribbon pts #(+ 0.3 (* gw (Math/sin (* Math/PI %)))))
                         {:fill (or (:color ground) (c :ink2))})))
        ;; for each crossing, the stem on top hides a band of the other
        cuts   (when weave
                 (let [{:keys [gap over] :or {gap 2.2 over 0}} weave]
                   (map-indexed
                    (fn [n [i j]]
                      (let [top    (if (even? n) over (- 1 over))
                            idx    (if (zero? top) i j)
                            pts    (lines top)
                            fs     (fractions pts)
                            cl     (cum-length pts)
                            ;; long enough to run clear across the other stem
                            reach  (+ 4 (* 1.5 (pair w (- 1 top))) (* 2 gap))
                            near   (fn [k] (< (Math/abs (- (cl k) (cl idx))) reach))
                            lo     (max 0 (dec (count (take-while (complement near) (range (count pts))))))
                            hi     (min (count pts) (+ 2 (last (filter near (range (count pts))))))
                            sub    (subvec pts lo hi)
                            f0     (fs lo) f1 (fs (dec hi))
                            sw     (fn [t] (+ (* 2 gap)
                                              ((widths top) (+ f0 (* t (- f1 f0))))))]
                        {:under (- 1 top) :poly (ribbon sub sw)}))
                    (crossings (lines 0) (lines 1) 0.06))))
        all    (concat bodies (map :poly lvs) (when gnd [(:poly gnd)]))
        [tf k] (if fit? (fitter all margin) [identity 1])
        mid    (str "nkg-" (Integer/toHexString (hash opts)))
        mask-of (fn [i] (str mid "-" i))
        masks  (for [i [0 1]
                     :let [cs (filter #(= i (:under %)) cuts)]
                     :when (seq cs)]
                 [:mask {:id (mask-of i) :maskUnits "userSpaceOnUse"
                         :x -10 :y -10 :width 120 :height 120}
                  [:rect {:x -10 :y -10 :width 120 :height 120 :fill "white"}]
                  (for [{:keys [poly]} cs]
                    [:path {:d (d (mapv tf poly)) :fill "black"}])])
        masked (set (map :under cuts))
        runs   (fn [pts width n]
                 ;; the line cut into `n` short runs, each stroked at the
                 ;; width of its middle; round caps join them
                 (let [fs (fractions pts)
                       m  (count pts)]
                   (for [r (range n)
                         :let [a (quot (* r (dec m)) n)
                               b (min (dec m) (inc (quot (* (inc r) (dec m)) n)))]]
                     [(subvec pts a (inc b)) (width (/ (+ (fs a) (fs b)) 2))])))
        poly-d (fn [pts] (apply str "M " (interpose " L " (map (fn [[x y]] (format "%.1f %.1f" (double x) (double y))) pts))))
        stroke-body
        (fn [i]
          [:g (cond-> {:fill "none" :stroke (colors i) :stroke-linecap "round" :stroke-linejoin "round"}
                (masked i) (assoc :mask (str "url(#" (mask-of i) ")")))
           (for [[pts wd] (runs (lines i) (widths i) 30)]
             [:path {:d (poly-d (mapv tf pts)) :stroke-width (format "%.2f" (double (* k wd)))}])])
        body   (fn [i]
                 (let [ds (for [[q r] (stamps (lines i) (widths i))] [(tf q) (* k r)])]
                   [:g (cond-> {:fill (colors i)}
                         blend (assoc :style (str "mix-blend-mode:" blend))
                         (masked i) (assoc :mask (str "url(#" (mask-of i) ")")))
                    (when (seq ds) [:path {:d (discs-d ds)}])
                    [:path {:d (d (mapv tf (bodies i)))}]]))]
    [:g
     (when (seq masks) (into [:defs] masks))
     (when gnd [:path (merge (:attrs gnd) {:d (d (mapv tf (:poly gnd)))})])
     (for [{:keys [poly attrs]} lvs]
       [:path (merge attrs {:d (d (mapv tf poly))})])
     (if (:stroke? o) (stroke-body 0) (body 0))
     (if (:stroke? o) (stroke-body 1) (body 1))]))

;; ## The logo
;;
;; Chosen 2026-10-22: the plain tapered pair from section B of the notebook,
;; with the tips apart — clay reaching higher, sage stopping lower.

(def logo
  {:w 12 :tip-w 1 :taper 1.6 :foot 0.2 :tips [[60 6] [38 20]]})

;; ## Candidates
;;
;; Named option maps, shared by the notebook and the SVG export.

(def tendrils
  "Two tapered stems, woven once, each ending in a tendril; the clay one
  reaches higher."
  {:w 12 :tip-w 1 :taper 1.6 :foot 0.2 :tips [[58 6] [38 16]]
   :spread [1.1 0.9] :bow 4 :wobble 1.5 :seed 9 :grain 0.1
   :curl [{:strand 1 :len 22 :turn -300} {:strand 0 :len 28 :turn 330}]
   :weave {:gap 1.1 :over 1}})

(def leaf-and-tendril
  "The sage stem stops lower and opens into a leaf; the clay stem winds."
  {:w 12 :tip-w 1.6 :taper 1.6 :foot 0.2 :tips [[58 6] [37 22]] :bow 4 :grain 0.1
   :curl {:strand 0 :len 28 :turn 330}
   :leaves [{:strand 1 :at 1 :len 24 :width 7.5 :angle -4 :bend 0.07}]
   :weave {:gap 1.1 :over 1}})

(def favicon
  "Shorter, wider and heavier, drawn as stroked runs, for 32 and 16 pixels."
  {:stroke? true :w 18 :tip-w 7 :taper 1.3 :foot 0.4 :tips [[62 24] [38 32]]
   :width 44 :margin 3
   :curl [{:strand 1 :len 10 :turn -170} {:strand 0 :len 14 :turn 210}]})

(defn in
  "The same mark in other colours: one colour, or a pair [clay-stem sage-stem]."
  [opts colour-or-pair]
  (assoc opts :colors (if (string? colour-or-pair)
                        [colour-or-pair colour-or-pair]
                        colour-or-pair)))
