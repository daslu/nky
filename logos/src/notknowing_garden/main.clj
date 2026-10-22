(ns notknowing-garden.main
  "Writes the main marks to svg/ and renders the notebook with Clay."
  (:require [clojure.java.io :as io]
            [hiccup2.core :as hiccup2]
            [notknowing-garden.config :as config]
            [notknowing-garden.living :as l]
            [notknowing-garden.marks :as m]
            [notknowing-garden.palette :refer [c]]
            [notknowing-garden.view :as view]
            [scicloj.clay.v2.api :as clay]))

(def marks
  (array-map
   "sprout"              (m/sprout {})
   "sprout-favicon"      (m/sprout {:weight 11 :leaves 1 :gap 70})
   "comma-leaf"          (m/comma-leaf {:point 0.7 :fill (c :leaf)})
   "comma-leaf-vein"     (m/comma-leaf {:point 0.7 :vein true})
   "open-circle-leaf"    (m/open-circle-leaf {:gap 70})
   "two-curves"          (m/two-curves {:twist 0.7})
   "two-curves-favicon"  (m/two-curves {:twist 0.7 :weight 12})
   "garden-arch"         (m/garden-bed {:shape :arch})
   "garden-arch-favicon" (m/garden-bed {:shape :arch :weight 11 :gap 24})
   ;; the chosen logo (living/logo)
   "logo"                      (l/stems l/logo)
   "logo-ink"                  (l/stems (l/in l/logo (c :ink)))
   ;; living curves (notebooks/living_curves.clj)
   "living-tendrils"           (l/stems l/tendrils)
   "living-leaf-and-tendril"   (l/stems l/leaf-and-tendril)
   "living-tendrils-sages"     (l/stems (l/in l/tendrils [(c :leaf2) (c :leaf)]))
   "living-tendrils-ink"       (l/stems (l/in l/tendrils (c :ink)))
   "living-favicon"            (l/stems l/favicon)
   "living-favicon-ink"        (l/stems (l/in (assoc l/favicon :weave {:gap 3.5 :over 1}) (c :ink)))))

(def wordmarks
  (array-map
   "wordmark-sprout"         (view/wordmark (m/sprout {}) {})
   "wordmark-two-curves"     (view/wordmark (m/two-curves {:twist 0.7}) {:italic-garden? true})
   "wordmark-arch-stacked"   (view/wordmark (m/garden-bed {:shape :arch}) {:layout :stacked})
   "wordmark-logo"            (view/wordmark (l/stems l/logo) {:text-x 84})
   "wordmark-logo-stacked"    (view/wordmark (l/stems l/logo) {:layout :stacked})
   "wordmark-living-tendrils" (view/wordmark (l/stems l/tendrils) {:italic-garden? true :text-x 84})
   "wordmark-living-leaf"     (view/wordmark (l/stems l/leaf-and-tendril) {:text-x 84})))

(def mark-colour (l/stems l/logo))
(def mark-ink (l/stems (l/in l/logo (c :ink))))

(def lockups
  "The chosen lockups (see notebooks/lockup.clj), by file name."
  (array-map
   "lockup-horizontal"      (view/lockup mark-colour view/horizontal)
   "lockup-horizontal-dark" (view/lockup mark-colour (view/on-dark view/horizontal))
   "lockup-horizontal-ink"  (view/lockup mark-ink (view/one-ink view/horizontal (c :ink)))
   "lockup-stacked"         (view/lockup mark-colour view/stacked)
   "lockup-stacked-dark"    (view/lockup mark-colour (view/on-dark view/stacked))
   "lockup-stacked-ink"     (view/lockup mark-ink (view/one-ink view/stacked (c :ink)))
   "lockup-compact"         (view/lockup mark-colour view/compact)
   "lockup-compact-dark"    (view/lockup mark-colour (view/on-dark view/compact))
   "lockup-compact-ink"     (view/lockup mark-ink (view/one-ink view/compact (c :ink)))))

(def measure-box
  "A box roomy enough for every lockup, for measuring their ink."
  {:horizontal [-20 -110 460 50] :stacked [-170 -190 170 100]})

(defn write-measure-pages
  "Pages for tools/measure.py: each lockup on white, in a known box, at 4
  pixels per unit."
  []
  (doseq [[nm opts] {"horizontal" view/horizontal "stacked" view/stacked "compact" view/compact}]
    (let [[x0 y0 x1 y1 :as box] (measure-box (:layout opts))
          scale 4
          [tag attrs & body] (view/lockup mark-colour (assoc opts :bounds box :margin 0
                                                            :width (* scale (- x1 x0))))]
      (spit (doto (io/file "temp" "measure" (str nm ".html")) io/make-parents)
            (str "<!doctype html><meta charset=utf-8>"
                 "<link rel=stylesheet href='" config/google-fonts-url "'>"
                 "<style>body{margin:0;background:#fff}svg{display:block}</style>"
                 (hiccup2/html (into [tag (assoc attrs :data-x0 x0 :data-y0 y0
                                                 :data-x1 x1 :data-y1 y1 :data-scale scale)]
                                     body)))))))

(defn- with-fonts
  "Adds an @import of the Google fonts, for SVGs that contain text.
  It takes effect when the file is opened directly, not through <img>."
  [[tag attrs & children]]
  (into [tag attrs [:defs [:style (str "@import url('" config/google-fonts-url "');")]]]
        children))

(defn write-svgs []
  (doseq [[nm mark] marks]
    (spit (doto (io/file "svg" (str nm ".svg")) io/make-parents)
          (str (hiccup2/html (view/svg {:width 256 :height 256} mark)))))
  (doseq [[nm wm] (concat wordmarks lockups)]
    (spit (io/file "svg" (str nm ".svg"))
          (str (hiccup2/html (with-fonts wm))))))

(defn -main [& _args]
  (write-svgs)
  (clay/make! {:show false})
  (shutdown-agents)
  (System/exit 0))

(comment
  (write-svgs)
  (clay/make! {}))
