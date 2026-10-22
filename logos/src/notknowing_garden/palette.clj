(ns notknowing-garden.palette
  "The site's colours, from shared/warm.scss, plus one green for leaves.")

(def palette-descriptions
  ;; key hex description text-colour
  [[:paper  "#FAF5EF" "paper — page ground"      "#33291F"]
   [:paper2 "#F2E9DE" "paper 2 — bands"          "#33291F"]
   [:card   "#FFFCF8" "card"                     "#33291F"]
   [:rule   "#E7DACA" "rule — hairlines"         "#33291F"]
   [:ink    "#33291F" "ink — text"               "#FAF5EF"]
   [:ink2   "#6B5D4E" "ink 2"                    "#FAF5EF"]
   [:ink3   "#9E8F7D" "ink 3"                    "#FAF5EF"]
   [:clay   "#C0603F" "clay — links, accent"     "#FAF5EF"]
   [:dis    "#B0755F" "dis"                      "#FAF5EF"]
   [:blue   "#4E7CA6" "blue"                     "#FAF5EF"]
   [:leaf   "#6F8559" "leaf — new, a muted sage" "#FAF5EF"]
   [:leaf2  "#A9B48C" "leaf 2 — new, pale sage"  "#33291F"]])

(def colors
  (into {} (map (juxt first second)) palette-descriptions))

(defn c
  "Colour by key, e.g. (c :clay)."
  [k]
  (or (colors k) (throw (ex-info "no such colour" {:k k}))))
