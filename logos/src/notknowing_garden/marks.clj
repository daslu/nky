(ns notknowing-garden.marks
  "Logo marks. Each mark is a function of an options map and returns an SVG
  hiccup group drawn in a 100 x 100 box."
  (:require [notknowing-garden.geometry :as g]
            [notknowing-garden.palette :refer [c]]))

(def defaults
  {:weight 6
   :ink    (c :ink)
   :accent (c :leaf)
   :warm   (c :clay)})

(defn- stroke [color weight]
  {:fill "none" :stroke color :stroke-width weight
   :stroke-linecap "round" :stroke-linejoin "round"})

;; ## A. Sprout from an open seed

(defn sprout
  "An open circle (a seed coat, a question) whose line carries on out of the
  opening as a stem. `gap` is the opening in degrees; `leaves` is 1 or 2."
  [opts]
  (let [{:keys [gap weight ink accent leaves]} (merge defaults {:gap 60 :leaves 2} opts)
        centre [48 66]
        r      24
        from   (+ -90 (/ gap 2))
        to     (- 270 (/ gap 2))
        end    (g/polar centre r to)
        a      (Math/toRadians to)
        ;; direction of travel at the end of the arc
        dir    [(- (Math/sin a)) (Math/cos a)]
        top    [56 20]
        stem   (str (g/arc centre r from to)
                    " C " (g/p (g/v+ end (g/v* dir 16))) " " (g/p (g/v+ top [-4 14])) " " (g/p top))]
    [:g
     [:path (merge (stroke ink weight) {:d stem})]
     [:path {:d (g/leaf [55 23] [76 12] 9 0.15 0) :fill accent}]
     (when (= leaves 2)
       [:path {:d (g/leaf [53 34] [36 24] 7.5 -0.15 0) :fill accent}])]))

;; ## B. A comma that becomes a leaf

(defn comma-path
  "A comma outline. `point` 0 gives the round head of a comma; 1 draws the
  top up into the pointed tip of a leaf."
  [point]
  (let [k     0.5523
        r     18
        [cx cy] [50 40]
        p1    [(+ cx r) cy]
        top   [cx (- cy (* r (+ 1 (* 0.45 point))))]
        pl    [(- cx r) cy]
        p2    (g/polar [cx cy] r 110)
        h     (* 0.42 r)
        tip   [41 88]
        dir   (fn [sx] (g/unit (g/lerp [sx 0] [(* sx 0.55) 1] point)))
        hk    (* k r (+ 1 (* 0.4 point)))]
    (str "M " (g/p tip)
         " C " (g/p (g/v+ tip [19 -9])) " " (g/p (g/v+ p1 [0 24])) " " (g/p p1)
         " C " (g/p (g/v+ p1 [0 (- (* k r))])) " " (g/p (g/v+ top (g/v* (dir 1) hk))) " " (g/p top)
         " C " (g/p (g/v+ top (g/v* (dir -1) hk))) " " (g/p (g/v+ pl [0 (- (* k r))])) " " (g/p pl)
         " C " (g/p (g/v+ pl [0 h])) " " (g/p (g/v- p2 [(* 0.94 h) (* 0.34 h)])) " " (g/p p2)
         " C " (g/p (g/v+ p2 [9 4])) " " (g/p (g/v+ tip [7 -13])) " " (g/p tip)
         " Z")))

(defn comma-leaf
  "The comma outline, filled. With `vein`, a pale centre line runs up from
  the tail, which reads as a leaf's midrib."
  [opts]
  (let [{:keys [point fill vein weight]} (merge defaults {:point 0.5 :fill (c :ink)} opts)]
    [:g
     [:path {:d (comma-path point) :fill fill}]
     (when vein
       [:path (merge (stroke (if (= fill (c :ink)) (c :paper) (c :leaf2)) (* 0.35 weight))
                     {:d "M 47 72 Q 54 56 50 34"})])]))

(defn open-circle-leaf
  "An open circle whose end turns outward into a leaf."
  [opts]
  (let [{:keys [gap weight ink accent leaf-size]} (merge defaults {:gap 70 :leaf-size 1} opts)
        centre [46 56]
        r      28
        start  (+ -90 (/ gap 2))
        base   (g/polar centre r start)
        tip    (g/v+ base (g/v* [16 -24] leaf-size))]
    [:g
     [:path (merge (stroke ink weight) {:d (g/arc centre r start (- 270 (/ gap 2)))})]
     [:path {:d (g/leaf base tip (* 10 leaf-size) 0.2 0.05) :fill accent}]]))

;; ## C. Two curves

(defn two-curves
  "Two strokes from a shared base to a shared tip. `twist` 0 gives the two
  sides of one leaf; at 1 each stroke crosses over to the other side."
  [opts]
  (let [{:keys [twist width weight warm accent]} (merge defaults {:twist 0.5 :width 34} opts)
        base [50 90]
        tip  [50 10]
        cx   (fn [s] [[(- 50 (* s width)) 68]
                      [(+ (- 50 (* s width)) (* 2 s width twist)) 32]])
        path (fn [s] (let [[a b] (cx s)]
                       (str "M " (g/p base) " C " (g/p a) " " (g/p b) " " (g/p tip))))]
    [:g
     [:path (merge (stroke warm weight) {:d (path 1)})]
     [:path (merge (stroke accent weight) {:d (path -1)})]]))

;; ## D. An enclosed garden

(defn- bed-outline [shape gap]
  (let [g (/ gap 2)]
    (case shape
      :circle (g/arc [50 52] 36 (+ 90 (/ (* gap 1.6) 2)) (- 450 (/ (* gap 1.6) 2)))
      :square (let [r 18]
                (str "M " (g/n (+ 50 g)) " 86 H " (g/n (- 86 r))
                     " A " r " " r " 0 0 0 86 " (g/n (- 86 r))
                     " V " (g/n (+ 16 r))
                     " A " r " " r " 0 0 0 " (g/n (- 86 r)) " 16"
                     " H " (g/n (+ 14 r))
                     " A " r " " r " 0 0 0 14 " (g/n (+ 16 r))
                     " V " (g/n (- 86 r))
                     " A " r " " r " 0 0 0 " (g/n (+ 14 r)) " 86"
                     " H " (g/n (- 50 g))))
      :arch   (str "M " (g/n (+ 50 g)) " 88 H 82 V 46"
                   " A 32 32 0 0 0 18 46 V 88 H " (g/n (- 50 g))))))

(defn garden-bed
  "A bed or walled garden with a way in at the bottom, and a sprout inside."
  [opts]
  (let [{:keys [shape gap weight ink accent]} (merge defaults {:shape :arch :gap 16} opts)]
    [:g
     [:path (merge (stroke ink weight) {:d (bed-outline shape gap)})]
     [:path (merge (stroke ink (* 0.8 weight)) {:d "M 50 80 Q 48 62 51 44"})]
     [:path {:d (g/leaf [51 48] [67 36] 8 0.15 0) :fill accent}]
     [:path {:d (g/leaf [49.5 60] [34 50] 7 -0.15 0) :fill accent}]]))

;; ## The current favicon, for reference

(defn fraunces-comma [opts]
  (let [{:keys [ink]} (merge defaults opts)]
    [:text {:x 50 :y 66 :text-anchor "middle" :font-size 120
            :font-family "Fraunces" :font-weight 600 :fill ink} ","]))
