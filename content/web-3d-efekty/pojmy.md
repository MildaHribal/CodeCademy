## --term-- graf scény

en: scene graph
aliases: grafu scény, grafem scény, graf scény Three.js
lekce: web-3d-efekty/threejs-zaklady#scena-kamera-a-renderer

Strom objektů, ze kterého Three.js skládá obraz: scéna je kořen, pod ní skupiny, meshe a světla. Posun nebo otočení rodiče se přenese na všechny jeho potomky.

## --term-- mesh

en: mesh
aliases: meshe, meshem, meshů, meshi
lekce: web-3d-efekty/threejs-zaklady#mesh-geometrie-a-material

Viditelný 3D objekt složený z geometrie (tvar z trojúhelníků) a materiálu (jak povrch vypadá). V Three.js `new THREE.Mesh(geometry, material)`.

## --term-- render smyčka

en: render loop
aliases: render smyčky, render smyčku, render smyčce, render smyčkou, vykreslovací smyčka
lekce: web-3d-efekty/threejs-zaklady#render-loop-a-cas-snimku

Funkce, kterou prohlížeč volá před každým snímkem obrazovky: posune objekty a scénu znovu vykreslí. V Three.js se spouští přes `renderer.setAnimationLoop(callback)` a zastavuje přes `setAnimationLoop(null)`.

## --term-- čas snímku

en: delta time
aliases: času snímku, časem snímku, delta time
lekce: web-3d-efekty/threejs-zaklady#render-loop-a-cas-snimku

Počet sekund od předchozího snímku. Pohyb vynásobený časem snímku je stejně rychlý na 60Hz i 144Hz monitoru.

## --term-- normalizované souřadnice

en: normalized device coordinates (NDC)
aliases: normalizovaných souřadnic, normalizovaných souřadnicích, normalizované souřadnice myši
lekce: web-3d-efekty/interakce-a-castice#pozice-mysi-od-1-do-1

Poloha na plátně nezávislá na jeho velikosti: vlevo −1, vpravo 1, dole −1, nahoře 1. V nich předáváš pozici myši do `Raycaster.setFromCamera`.

## --term-- lineární interpolace

en: linear interpolation (lerp)
aliases: lineární interpolaci, lineární interpolací, lerp
lekce: web-3d-efekty/interakce-a-castice#plynule-natoceni-linearni-interpolace

Posun hodnoty o zvolený podíl vzdálenosti k cíli: `value + (target - value) * t`. Volaná v každém snímku dá plynulý dojezd, který ke konci zpomaluje.

## --term-- draw call

en: draw call
aliases: draw callů, draw cally, draw callem, draw callu
lekce: web-3d-efekty/interakce-a-castice#castice-jeden-objekt-tisice-bodu

Jeden příkaz procesoru grafické kartě „nakresli tuhle geometrii s tímhle materiálem". Každý viditelný mesh znamená aspoň jeden, a na telefonu se scéna drží v desítkách.

## --term-- shader

en: shader
aliases: shaderu, shaderem, shadery, shaderů, shaderech
lekce: web-3d-efekty/shadery#vertex-a-fragment-shader

Malý program v jazyce GLSL, který běží na grafické kartě paralelně pro každý vrchol nebo pixel. Každý materiál v Three.js se skládá z vertex a fragment shaderu.

## --term-- vertex shader

en: vertex shader
aliases: vertex shaderu, vertex shaderem, vertex shadery
lekce: web-3d-efekty/shadery#vertex-a-fragment-shader

Shader, který běží pro každý vrchol geometrie a zapíše jeho polohu na obrazovce do `gl_Position`. Umí geometrii deformovat, třeba vlnit.

## --term-- fragment shader

en: fragment shader
aliases: fragment shaderu, fragment shaderem, fragment shadery
lekce: web-3d-efekty/shadery#vertex-a-fragment-shader

Shader, který běží pro každý pixel pokrytý trojúhelníky a vrátí jeho barvu. Nevidí sousední pixely ani minulý snímek.

## --term-- uniforma

en: uniform
aliases: uniformy, uniformu, uniformou, uniforem, uniformám
lekce: web-3d-efekty/shadery#uniformy-vstup-z-javascriptu

Vstup shaderu z JavaScriptu, stejný pro všechny vrcholy a pixely v jednom snímku: čas, poloha myši, barvy. V Three.js `uniforms: { uTime: { value: 0 } }` a v shaderu `uniform float uTime;`.

## --term-- varying

en: varying
aliases: varyingu, varyingem
lekce: web-3d-efekty/shadery#gradient-varying-vuv-mix-a-smoothstep

Proměnná, kterou vertex shader zapíše pro každý vrchol a grafická karta ji plynule dopočítá pro každý pixel mezi nimi. Typicky `varying vec2 vUv`.

## --term-- noise

en: noise
aliases: noisu, šum
lekce: web-3d-efekty/shadery#noise-nahoda-ktera-plyne

Funkce, která pro bod plochy vrátí pseudonáhodnou hodnotu 0 až 1 tak, že sousední body mají podobné hodnoty. Základ mraků, kouře a plynoucích gradientů.

## --term-- fBm

en: fractal Brownian motion
aliases: fbm, vrstvení noise
lekce: web-3d-efekty/shadery#noise-nahoda-ktera-plyne

Součet několika vrstev noise, každá s dvojnásobnou hustotou a poloviční silou. Hrubé tvary dají první vrstvy, jemné detaily další.

## --term-- Spline

en: Spline
aliases: Splinu, Splinem, Splině
lekce: web-3d-efekty/spline#kdy-spline-a-kdy-three-js

Webový editor 3D scén, ve kterém se scéna naklikne bez kódu a vyexportuje do souboru `.splinecode`. Na webu ji přehrává knihovna `@splinetool/runtime` (v Reactu `@splinetool/react-spline`).

## --term-- líné načítání

en: lazy loading
aliases: líného načítání, líným načítáním, líně načíst, lazy loading
mdn: https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading
lekce: web-3d-efekty/spline#vykon-velikost-sceny-line-nacitani-a-nahradni-obrazek

Odložení stažení a spuštění těžkého obsahu (obrázku, videa, 3D scény), dokud ho uživatel nepotřebuje — typicky dokud se neblíží k oknu prohlížeče.
