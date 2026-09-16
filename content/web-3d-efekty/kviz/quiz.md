---
pass: 0.8
---

# --questions--

## --question--

Kolega volá `camera.updateProjectionMatrix()` v render smyčce v každém snímku, i když se velikost okna nemění. Co to způsobí?

### --answer--

Obraz se bude třást, protože se projekce pořád mění.

#### --why--

Myslíš si, že přepočet projekci mění? Spočítá ji jen znovu ze stejných hodnot, takže vyjde stejná.

### --correct--

Obraz bude v pořádku, jen se v každém snímku zbytečně přepočítá stejná matice.

#### --why--

Přepočet ze stejného `fov`, `aspect`, `near` a `far` dá stejnou matici. Je to malá zbytečná práce; správné místo je obsluha změny velikosti.

### --answer--

Kamera přestane reagovat na změnu velikosti okna.

#### --why--

Právě naopak: přepočet v každém snímku by novou hodnotu `aspect` použil hned. Na změnu velikosti ale musí reagovat i `setSize`.

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna

## --question--

Scéna nemá žádné světlo. Který materiál ukáže kostku v barvě, kterou mu nastavíš: `MeshStandardMaterial`, `MeshBasicMaterial`, nebo `MeshPhysicalMaterial`?

### --expected--

MeshBasicMaterial

### --why--

`MeshBasicMaterial` světlo ignoruje a kreslí barvu tak, jak je. Standardní i fyzikální materiál počítají odražené světlo, a bez světla vyjdou černé.

### --see--

web-3d-efekty/threejs-zaklady#mesh-geometrie-a-material

## --question--

Na vánoční stránce e-shopu má padat 800 malých 3D dárků ve tvaru krabičky, každý se jinak otáčí. Čím je nakreslíš?

### --answer--

800 × `Mesh` se sdílenou geometrií a materiálem.

#### --why--

Sdílená geometrie šetří paměť, ale každý mesh je dál samostatný draw call. Na telefonu je 800 draw callů moc.

### --answer--

Jedním objektem `Points`.

#### --why--

`Points` kreslí body jako ploché čtverečky čelem ke kameře. Krabičky, které se otáčí ve 3D, z nich neuděláš.

### --correct--

Jedním `InstancedMesh` s geometrií krabičky.

#### --why--

Kopie jedné geometrie s vlastní polohou a rotací kreslí `InstancedMesh` jedním draw callem a každá zůstává skutečný 3D tvar.

### --see--

web-3d-efekty/interakce-a-castice#stovky-stejnych-objektu-instancedmesh

## --question--

Jak se v GLSL deklaruje proměnná, kterou vertex shader zapíše pro každý vrchol a fragment shader ji dostane plynule dopočítanou pro každý pixel? Napiš klíčové slovo.

### --expected--

varying

### --why--

`varying` spojuje vertex a fragment shader a grafika jeho hodnotu mezi vrcholy dopočítá. `uniform` je naopak stejná pro všechny vrcholy i pixely a přichází z JavaScriptu.

### --see--

web-3d-efekty/shadery#gradient-varying-vuv-mix-a-smoothstep

## --question--

Canvas je široký 800 px a začíná na levém okraji okna. Myš má `clientX` 600. Jakou hodnotu `x` od −1 do 1 předáš `Raycaster`?

### --expected--

0.5

### --why--

`600 / 800 = 0.75`, krát 2 je 1.5, minus 1 je 0.5. Tři čtvrtiny šířky jsou v polovině cesty od středu k pravému okraji.

### --see--

web-3d-efekty/interakce-a-castice#pozice-mysi-od-1-do-1

## --question--

Celoobrazovkové pozadí ve fragment shaderu se na novém telefonu seká, na starém notebooku běží plynule. Co je nejpravděpodobnější příčina?

### --answer--

Telefon nemá dost paměti na geometrii plochy.

#### --why--

Plocha přes obrazovku má čtyři vrcholy, paměť geometrie nehraje roli. Rozhoduje, kolikrát se spustí fragment shader.

### --correct--

Telefon má `devicePixelRatio` 3, takže shader počítá mnohem víc pixelů než na notebooku.

#### --why--

Fragment shader běží pro každý pixel. Poměr 3 znamená devětkrát víc pixelů než poměr 1, i když je displej fyzicky menší.

### --answer--

Uniformy se na telefonu posílají pomaleji.

#### --why--

Pár uniforem za snímek je zanedbatelná práce na jakémkoli zařízení.

### --see--

web-3d-efekty/shadery#vykon-fragment-shader-na-4k

## --question--

Co vrátí `app.findObjectByName('Hrnek')`, když ho zavoláš na aplikaci Splinu hned po `new Application(canvas)`, ještě před dokončením `load`?

### --expected--

undefined

### --why--

Dokud se scéna nenačte, aplikace žádné objekty nemá. Hledání patří až za `await app.load(…)`.

### --see--

web-3d-efekty/spline#ovladani-sceny-z-javascriptu

## --question--

Napiš media dotaz (jen podmínku v závorce), který v CSS zapne pravidla pro uživatele s omezeným pohybem.

### --expected--

(prefers-reduced-motion: reduce)

### --accept--

prefers-reduced-motion: reduce

### --why--

Stejnou podmínku předáš i do `window.matchMedia` v JavaScriptu, když podle ní zastavuješ 3D scénu.

### --see--

css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion

## --question--

Canvas s 3D pozadím celé stránky má být za obsahem i při scrollu. Proč dostane `position: fixed`, a ne `position: absolute` s `inset: 0` na `<body>`?

### --answer--

`absolute` na canvasu nefunguje.

#### --why--

`absolute` na canvasu funguje jako na každém prvku. Rozdíl je v tom, vůči čemu se pozicuje.

### --correct--

`fixed` se drží okna, takže canvas zůstane přes celou obrazovku, i když stránka odjede.

#### --why--

`absolute` s `inset: 0` se roztáhne přes obsahující blok a odscrolluje se s ním. `fixed` se pozicuje vůči oknu a pozadí zůstává na místě.

### --answer--

`fixed` automaticky nastaví `pointer-events: none`.

#### --why--

`position` s ukazatelem myši nesouvisí. Aby kliknutí prošla, musíš `pointer-events: none` napsat sám.

### --see--

css-pozicovani/position#fixed-prispendlene-k-oknu

## --question--

Nadpis nad 3D pozadím má při načtení vyjet zespodu. Kterými vlastnostmi animaci napíšeš, aby co nejméně zatížila stránku, na které už pracuje WebGL?

### --answer--

`top` a `opacity`.

#### --why--

`top` mění rozvržení, prohlížeč musí v každém snímku přepočítat polohy prvků. Hledej vlastnosti, které rozvržení nemění.

### --correct--

`transform` (nebo `translate`) a `opacity`.

#### --why--

Tyhle vlastnosti prohlížeč zvládne jen složením vrstev bez nového rozvržení a kreslení, takže se nepřetahují o čas s 3D scénou.

### --answer--

`margin-top` a `visibility`.

#### --why--

`margin-top` spouští přepočet rozvržení a `visibility` neumí plynulý přechod průhlednosti.

### --see--

css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

## --question--

Napiš výraz v JavaScriptu, který vrátí `true`, když má uživatel v systému zapnutý omezený pohyb.

### --expected--

window.matchMedia('(prefers-reduced-motion: reduce)').matches

### --accept--

matchMedia('(prefers-reduced-motion: reduce)').matches

### --why--

`matchMedia` vrátí objekt, jehož `matches` odpovídá aktuálnímu stavu. V render smyčce ho čti pokaždé, aby se změna nastavení projevila hned.

### --see--

css-responzivita/preference-uzivatele#omezeny-pohyb-prefers-reduced-motion
web-3d-efekty/interakce-a-castice#bez-webgl-a-s-omezenym-pohybem

## --question--

Najdi v MDN na stránce Page Visibility API: jak se jmenuje událost, kterou `document` pošle, když uživatel přepne na jinou kartu nebo se na ni vrátí?

### --expected--

visibilitychange

### --why--

Při `visibilitychange` přečteš `document.hidden` a podle toho zastavíš nebo spustíš render smyčku. `Timer` z Three.js ji po `connect(document)` hlídá sám.

### --see--

web-3d-efekty/interakce-a-castice#vykon-kreslit-mene-a-jen-kdyz-je-na-co-koukat

# --code-- Pozadí pražírny Zrnko

## --file-- background.js

```js
// Pozadí úvodní stránky pražírny Zrnko: kávová zrna poletují za nadpisem.
import * as THREE from 'three';

var canvas = document.getElementById('bg');
var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
var lamp = new THREE.DirectionalLight(0xffffff, 2);
lamp.position.set(2, 4, 3);
scene.add(lamp);

var beans = new THREE.Group();
scene.add(beans);

function makeBean() {
  var geometry = new THREE.SphereGeometry(0.3, 24, 12);
  var material = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.6 });
  var bean = new THREE.Mesh(geometry, material);
  bean.scale.set(1, 0.7, 0.55);
  bean.position.set(Math.random() * 10 - 5, Math.random() * 6 - 3, Math.random() * -4);
  bean.rotation.set(Math.random() * 3, Math.random() * 3, 0);
  return bean;
}

function fillBeans() {
  for (var i = 0; i < 400; i++) {
    beans.add(makeBean());
  }
}
fillBeans();

// Každých 10 sekund nová zrna, ať pozadí nevypadá pořád stejně
setInterval(function () {
  for (var i = beans.children.length - 1; i >= 0; i--) {
    beans.remove(beans.children[i]);
  }
  fillBeans();
}, 10000);

var mouseX = 0;
var mouseY = 0;
window.addEventListener('pointermove', function (e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
});

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

renderer.setAnimationLoop(function () {
  if (!reduceMotion.matches) {
    beans.rotation.y += 0.003;
    beans.rotation.x += (mouseY * 0.2 - beans.rotation.x) * 0.05;
  }
  renderer.render(scene, camera);
});

document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    renderer.setAnimationLoop(null);
  } else {
    renderer.setAnimationLoop(function () {
      if (!reduceMotion.matches) {
        beans.rotation.y += 0.003;
        beans.rotation.x += (mouseY * 0.2 - beans.rotation.x) * 0.05;
      }
      renderer.render(scene, camera);
    });
  }
});
```

## --question--

Na telefonu s `devicePixelRatio` 3 se stránka seká. Na kterém řádku `background.js` je nastavení, které to způsobuje?

### --expected--

6

### --why--

Řádek 6 předá rendereru poměr pixelů bez stropu. Poměr 3 znamená devětkrát víc pixelů než 1. Oprava: `Math.min(window.devicePixelRatio, 2)`.

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna

## --question--

Po otočení telefonu na šířku jsou zrna roztažená do šířky. Který řádek v obsluze `resize` chybí (napiš ho)?

### --expected--

camera.updateProjectionMatrix();

### --accept--

camera.updateProjectionMatrix()

### --why--

Řádek 55 změní `camera.aspect`, ale projekce kamery se nepřepočítá, dokud se nezavolá `updateProjectionMatrix()`.

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna

## --question--

Ředitelka pražírny má monitor 144 Hz a zrna se jí točí víc než dvakrát rychleji než na notebooku. Který řádek to způsobuje?

### --answer--

Řádek 49, výpočet `mouseX`.

#### --why--

Poloha myši na obnovovací frekvenci monitoru nezávisí. Hledej přírůstek, který se přičítá v každém snímku.

### --correct--

Řádek 62, `beans.rotation.y += 0.003` bez času snímku (a stejně řádek 74).

#### --why--

Pevný přírůstek za snímek dá na 144Hz monitoru 144 přírůstků za sekundu místo 60. Rychlost se má násobit časem snímku z `Timer`.

### --answer--

Řádek 15, poloha světla.

#### --why--

Světlo ovlivňuje barvu zrn, ne rychlost otáčení.

### --see--

web-3d-efekty/threejs-zaklady#render-loop-a-cas-snimku

## --question--

Když stránku necháš otevřenou hodinu, prohlížeč spotřebovává čím dál víc paměti grafické karty. Který blok kódu za to může a co v něm chybí?

### --answer--

Posluchač `pointermove` na řádcích 48–51, protože se registruje znovu při každém pohybu.

#### --why--

Posluchač se registruje jednou při načtení. Hledej kód, který opakovaně vytváří nové objekty.

### --correct--

Interval na řádcích 39–44: zrna odebere ze skupiny, ale jejich geometrie a materiály neuvolní přes `dispose()`.

#### --why--

`remove` objekt jen vyjme ze scény. Každých 10 sekund vznikne 400 nových geometrií a materiálů a staré zůstanou v paměti grafiky, protože je nikdo neuvolnil.

### --answer--

Funkce `makeBean` na řádcích 21–29, protože `Math.random()` zabírá paměť.

#### --why--

Náhodná čísla paměť nedrží. Problém je, co se s vytvořenými zrny stane, když se odeberou.

### --see--

web-3d-efekty/interakce-a-castice#vykon-kreslit-mene-a-jen-kdyz-je-na-co-koukat

## --question--

Kolik draw callů zhruba potřebuje jeden snímek téhle scény a kterým objektem Three.js bys je snížil na jeden?

### --answer--

Jeden, protože všechna zrna jsou v jedné skupině `beans`.

#### --why--

Skupina jen drží potomky a počet draw callů nemění. Každý mesh v ní se kreslí zvlášť.

### --correct--

Kolem 400, jeden na každé zrno. Snížil by je `InstancedMesh`.

#### --why--

Každý `Mesh` je samostatný draw call. Zrna mají stejnou geometrii i materiál, takže jde o učebnicový případ pro `InstancedMesh`.

### --answer--

Kolem 400. Snížilo by je použití `MeshBasicMaterial`.

#### --why--

Levnější materiál zlevní každé vykreslení, ale počet draw callů zůstane stejný.

### --see--

web-3d-efekty/interakce-a-castice#stovky-stejnych-objektu-instancedmesh
