(ns notknowing-garden.geometry
  "Small helpers for building SVG path strings.")

(defn n [x] (format "%.2f" (double x)))
(defn p [[x y]] (str (n x) " " (n y)))

(defn v+ [[a b] [c d]] [(+ a c) (+ b d)])
(defn v- [[a b] [c d]] [(- a c) (- b d)])
(defn v* [[a b] k] [(* a k) (* b k)])
(defn len [[a b]] (Math/sqrt (+ (* a a) (* b b))))
(defn unit [v] (v* v (/ 1.0 (len v))))
(defn normal [[a b]] [(- b) a])
(defn lerp [u v t] (v+ u (v* (v- v u) t)))

(defn polar
  "Point at angle `deg` (0 = right, 90 = down, SVG convention) on a circle."
  [[cx cy] r deg]
  (let [a (Math/toRadians deg)]
    [(+ cx (* r (Math/cos a))) (+ cy (* r (Math/sin a)))]))

(defn arc
  "Path for a circular arc from angle `from` to `to`, drawn clockwise
  (increasing angle) when to > from."
  [c r from to]
  (let [sweep (if (> to from) 1 0)
        large (if (> (Math/abs (double (- to from))) 180) 1 0)]
    (str "M " (p (polar c r from))
         " A " (n r) " " (n r) " 0 " large " " sweep " " (p (polar c r to)))))

(defn leaf
  "Closed leaf from `base` to `tip`: two quadratic curves, pointed at both ends.
  `width` is the leaf's widest point; `asym` in -1..1 shifts it to one side;
  `bend` moves the whole leaf sideways at its middle, so the leaf curls."
  ([base tip width] (leaf base tip width 0 0))
  ([base tip width asym bend]
   (let [axis (v- tip base)
         nrm  (unit (normal axis))
         mid  (v+ (lerp base tip 0.5) (v* nrm (* bend (len axis))))
         ;; a quadratic's control sits twice as far out as the curve reaches
         c1   (v+ mid (v* nrm (* width (+ 1 asym))))
         c2   (v- mid (v* nrm (* width (- 1 asym))))]
     (str "M " (p base) " Q " (p c1) " " (p tip) " Q " (p c2) " " (p base) " Z"))))

(defn midrib
  "Centre line of the `leaf` with the same arguments, drawn from the base
  for fraction `frac` of its length (a de Casteljau split of the quadratic)."
  [base tip width asym bend frac]
  (let [axis (v- tip base)
        nrm  (unit (normal axis))
        mid  (v+ (lerp base tip 0.5) (v* nrm (* bend (len axis))))
        ctrl (v+ mid (v* nrm (* width asym)))
        c'   (lerp base ctrl frac)
        end  (lerp c' (lerp ctrl tip frac) frac)]
    (str "M " (p base) " Q " (p c') " " (p end))))
