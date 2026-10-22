(ns notknowing-garden.view
  "Helpers for showing marks in the notebook and writing them to files."
  (:require [clojure.string :as str]
            [notknowing-garden.config :as config]
            [notknowing-garden.palette :refer [c] :as pal]
            [scicloj.kindly.v4.kind :as kind]))

(defn svg
  "A standalone SVG element. `view-box` is [w h]; marks use [100 100]."
  ([content] (svg {} content))
  ([{:keys [width height view-box background]
     :or   {view-box [100 100]}} content]
   (let [[w h] view-box]
     [:svg (cond-> {:xmlns   "http://www.w3.org/2000/svg"
                    :viewBox (str "0 0 " w " " h)}
             width  (assoc :width width)
             height (assoc :height height))
      (when background
        [:rect {:width w :height h :fill background}])
      content])))

(defn mark-svg [mark size]
  (svg {:width size :height size} mark))

(defn page-style
  "Loads the two site fonts and sets the page in the site's colours."
  []
  (kind/hiccup
   [:div
    [:link {:rel "stylesheet" :href config/google-fonts-url}]
    [:style (str "body{background:" (c :paper) ";color:" (c :ink) ";"
                 "font-family:" config/body-font ";}"
                 "h1,h2,h3,h4{font-family:" config/display-font ";font-weight:600;}"
                 ".tile{background:" (c :card) ";border:1px solid " (c :rule) ";"
                 "border-radius:6px;padding:12px 8px 10px;}"
                 ".tile .label{font-size:14px;color:" (c :ink2) ";margin-top:6px;}"
                 ".tile .small{display:flex;gap:14px;justify-content:center;align-items:center;"
                 "margin-top:6px;}")]]))

(defn grid [n items]
  (kind/hiccup
   (into [:div {:style {:display               "grid"
                        :grid-template-columns (str "repeat(" n ", minmax(0, 1fr))")
                        :gap                   12
                        :align-items           "start"
                        :text-align            "center"}}]
         items)))

(defn tile
  "A mark at logo size, with the same drawing at 32 and 16 pixels below it."
  [label mark]
  [:div {:class "tile"}
   (mark-svg mark 120)
   [:div {:class "small"} (mark-svg mark 32) (mark-svg mark 16)]
   [:div {:class "label"} label]])

(defn tiles [n labelled-marks]
  (grid n (for [[label mark] labelled-marks] (tile label mark))))

(defn swatches []
  (grid 4 (for [[_ hex description text] pal/palette-descriptions]
            [:div {:style {:background hex :color text :padding 10
                           :border (str "1px solid " (c :rule)) :border-radius 6
                           :font-size 14}}
             [:div [:strong hex]]
             [:div description]])))

;; ## Wordmarks

(defn wordmark
  "The mark beside or above the name, set in Fraunces.
  `layout` is :horizontal or :stacked; `lower?` sets the name in lower case;
  `italic-garden?` sets the second word in italic, in the accent colour.
  `text-x` moves the name closer to a narrow mark (horizontal layout)."
  [mark {:keys [layout lower? italic-garden? weight text-x]
         :or   {layout :horizontal weight 560 text-x 108}}]
  (let [[w1 w2] (if lower? ["notknowing" "garden"] ["Notknowing" "Garden"])
        style   {:font-family "Fraunces" :font-weight weight :fill (c :ink)}
        second  (fn [attrs]
                  [:tspan (merge attrs
                                 (when italic-garden?
                                   {:font-style "italic" :fill (c :leaf)}))
                   w2])]
    (case layout
      :horizontal
      (svg {:view-box [540 100]}
           [:g mark
            [:text (merge style {:x text-x :y 64 :font-size 42})
             w1 " " (second {})]])
      :stacked
      (svg {:view-box [300 230]}
           [:g
            [:g {:transform "translate(110,0)"} mark]
            [:text (merge style {:x 150 :y 160 :font-size 40 :text-anchor "middle"}) w1]
            [:text (merge style {:x 150 :y 205 :font-size 40 :text-anchor "middle"})
             (second {})]]))))

(defn wordmark-tile [label wm width]
  [:div {:class "tile"}
   (assoc-in wm [1 :width] width)
   [:div {:class "label"} label]])

;; ## Lockups: mark, name and tagline

(def tagline "Bodymind, tantra, and movement")

(def mark-ink
  "The ink box of `(l/stems l/logo)` in its 100 x 100 drawing, [x0 y0 x1 y1],
  measured with getBBox in Chrome. The stems are fitted 6 units from the top
  and bottom, and are much narrower than they are tall."
  [31.7 6.0 68.3 94.0])

(def ^:private faces
  {:fraunces   "Fraunces"
   :newsreader "Newsreader"})

(defn- fvs
  "A style string pinning the optical size, so the letters do not change shape
  when the file is shown at another size or converted to outlines."
  [opsz]
  (str "font-variation-settings:'opsz' " opsz ";font-optical-sizing:none"))

(defn lockup
  "The mark with the name and, optionally, the tagline. Units are those of the
  name's font size (`:name-size`, 40 by default), with the name's baseline at
  y = 0 and the mark's left ink edge at x = 0.

  - `:layout` :horizontal (mark left, text stacked to its right) or :stacked
    (mark above, text centred below)
  - `:tagline` the tagline text, or nil for the name alone
  - `:name-weight` `:name-opsz` `:italic-garden?` the name; in the stacked
    layout `:name-lines` 2 breaks it after \"Notknowing\", `:line` apart
  - `:tag-face` :newsreader or :fraunces; `:tag-size` `:tag-weight`
    `:tag-opsz` `:tag-upper?` `:tag-italic?` `:tag-track` (letter-spacing,
    in units)
    `:tag-color` the tagline
  - `:lead` name baseline to tagline baseline
  - `:mark-h` the mark's ink height; `:mark-drop` how far its foot sits below
    the last baseline (horizontal) or `:mark-gap` above the name's cap line
    (stacked); `:gap` mark to text (horizontal)
  - `:ink` `:ink2` `:garden` `:colors` colours, for other grounds
  - `:bounds` the measured ink box [x0 y0 x1 y1] in these units; the viewBox
    is that box plus `:margin`. Without it the box is a rough estimate.
  - `:background` fills the viewBox; `:width` sets the SVG's width in
    pixels (one pixel per unit by default)"
  [mark {:keys [layout tagline name-size name-weight name-opsz italic-garden?
                tag-face tag-size tag-weight tag-opsz tag-upper? tag-italic? tag-track tag-color
                lead mark-h mark-drop mark-gap gap ink ink2 garden name-lines line
                bounds margin background width]
         :or   {layout :horizontal name-size 40 name-weight 560 name-opsz 40
                tag-face :newsreader tag-size 15 tag-weight 400 tag-opsz 15
                tag-upper? false tag-track 0 lead 24 mark-h 76 mark-drop 4
                mark-gap 14 gap 16 margin 8}}]
  (let [ink    (or ink (c :ink))
        ink2   (or ink2 (c :ink2))
        garden (or garden (c :leaf))
        [mx0 my0 mx1 my1] mark-ink
        k      (/ mark-h (- my1 my0))
        mw     (* k (- mx1 mx0))
        cap    (* 0.7 name-size)                 ; Fraunces cap height, 1400/2000
        tag    (when tagline (if tag-upper? (str/upper-case tagline) tagline))
        two-lines? (and (= layout :stacked) (= 2 name-lines))
        line   (or line (* 1.1 name-size))
        name-end (if two-lines? line 0)
        last-y (+ name-end (if tag lead 0))
        name-s {:font-family "Fraunces" :font-weight name-weight :font-size name-size
                :fill ink :style (fvs name-opsz)}
        tag-s  {:font-family (faces tag-face) :font-weight tag-weight :font-size tag-size
                :fill (or tag-color ink2) :letter-spacing tag-track :style (fvs tag-opsz)}
        tag-s  (cond-> tag-s tag-italic? (assoc :font-style "italic"))
        garden-span [:tspan (when italic-garden? {:font-style "italic" :fill garden}) "Garden"]
        place  (fn [x-left y-top]
                 ;; the mark, scaled so its ink box is mark-h tall, with its
                 ;; ink box's top left corner at x-left, y-top
                 [:g {:transform (format "translate(%.2f,%.2f) scale(%.4f) translate(%.2f,%.2f)"
                                         (double x-left) (double y-top) (double k)
                                         (double (- mx0)) (double (- my0)))}
                  mark])
        content
        (case layout
          :horizontal
          (let [tx (+ mw gap)]
            [:g
             (place 0 (- (+ last-y mark-drop) mark-h))
             [:text (merge name-s {:x tx :y 0}) "Notknowing " garden-span]
             (when tag [:text (merge tag-s {:x tx :y lead}) tag])])
          :stacked
          (let [top (- (+ cap mark-gap mark-h))]
            [:g
             (place (- (/ mw 2)) top)
             (if two-lines?
               (list [:text (merge name-s {:x 0 :y 0 :text-anchor "middle"}) "Notknowing"]
                     [:text (merge name-s {:x 0 :y line :text-anchor "middle"}) garden-span])
               [:text (merge name-s {:x 0 :y 0 :text-anchor "middle"}) "Notknowing " garden-span])
             ;; letter-spacing also follows the last letter; shift back by half
             (when tag [:text (merge tag-s {:x (/ tag-track 2) :y (+ name-end lead) :text-anchor "middle"}) tag])]))
        rough  (case layout
                 :horizontal [0 (- (+ last-y mark-drop) mark-h)
                              (+ mw gap (* 9.8 name-size))
                              (max (+ last-y mark-drop) (+ last-y (* 0.3 tag-size)))]
                 :stacked    [(* -4.4 name-size) (- (+ cap mark-gap mark-h))
                              (* 4.4 name-size) (+ last-y (* 0.3 tag-size))])
        [x0 y0 x1 y1] (or bounds rough)
        ;; whole units across and down, so a 1x or 2x PNG lands on pixels;
        ;; the extra fraction is shared out evenly on both sides
        vw (Math/ceil (+ (- x1 x0) (* 2 margin)))
        vh (Math/ceil (+ (- y1 y0) (* 2 margin)))
        vx (- x0 (/ (- vw (- x1 x0)) 2))
        vy (- y0 (/ (- vh (- y1 y0)) 2))
        r  (fn [v] (/ (Math/round (* 10.0 v)) 10.0))]
    [:svg (cond-> {:xmlns   "http://www.w3.org/2000/svg"
                   :viewBox (str "0 0 " (r vw) " " (r vh))}
            true (assoc :width (r (or width vw)) :height (r (* (or width vw) (/ vh vw)))))
     (when background [:rect {:width (r vw) :height (r vh) :fill background}])
     [:g {:transform (format "translate(%.2f,%.2f)" (double (- vx)) (double (- vy)))}
      content]]))

;; ### The chosen lockups
;;
;; Option maps for `lockup`, shared by the notebook and the SVG export.
;; `:bounds` is the ink box of each, measured in Chrome after the fonts had
;; loaded (`tools/measure.py`); measure again if anything here changes.

(def tagline-caps
  "The tagline as the site sets its small labels: Fraunces capitals at a
  book weight, letter-spaced 0.16 em, in ink 2."
  {:tagline tagline :tag-face :fraunces :tag-weight 420 :tag-upper? true
   :tag-size 11 :tag-track 1.76 :tag-opsz 11})

(def horizontal
  "Mark left, name and tagline stacked to its right."
  (merge tagline-caps
         {:layout :horizontal :name-weight 520 :name-opsz 72 :lead 25
          :mark-h 92 :mark-drop 5 :gap 16
          :bounds [0.0 -62.0 410.0 30.0]}))

(def stacked
  "Mark above, the name in two lines, the tagline below, all centred."
  (merge tagline-caps
         {:layout :stacked :name-weight 520 :name-opsz 72 :name-lines 2 :line 42
          :lead 25 :mark-h 112 :mark-gap 13
          :tag-size 10 :tag-track 1.2 :tag-opsz 10
          :bounds [-114.8 -153.0 115.0 68.8]}))

(def compact
  "Mark and name only, for small places such as a page header. A lower
  optical size and a little more weight keep the letters sturdy when small."
  {:layout :horizontal :name-weight 540 :name-opsz 24 :mark-h 76 :mark-drop 11
   :gap 12 :bounds [0.0 -65.0 427.5 11.0]})

(defn on-dark
  "Light text on the ink ground; the mark keeps its colours."
  [opts]
  (merge opts {:background (c :ink) :ink (c :paper) :ink2 (c :ink3)}))

(defn one-ink
  "Everything in one colour: pass the mark drawn in that colour too."
  [opts colour]
  (merge opts {:ink colour :ink2 colour}))

(defn lockup-tile
  "A lockup at `width` pixels, with a label below it."
  [label width mark opts]
  [:div {:class "tile"}
   (update (lockup mark (assoc opts :width width)) 1
           assoc :style "max-width:100%;height:auto")
   [:div {:class "label"} label]])
