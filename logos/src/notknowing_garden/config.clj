(ns notknowing-garden.config)

(def display-font "'Fraunces', 'Newsreader', Georgia, serif")
(def body-font "'Newsreader', Georgia, serif")

(def google-fonts-url
  (str "https://fonts.googleapis.com/css2"
       "?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800"
       "&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400"
       "&display=swap"))

(def ^:dynamic *config*
  "Marks are drawn in a 100 x 100 box. Weight is stroke width in that box."
  {:size   100
   :weight 6
   :attrs  {:fill            "none"
            :stroke-linecap  "round"
            :stroke-linejoin "round"}})
