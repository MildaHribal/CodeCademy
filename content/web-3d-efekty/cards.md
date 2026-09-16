## --card-- output

Co vypíše tenhle kód? Hodnota se v každém snímku přibližuje k cíli lineární interpolací.

```js
let rotation = 0;
const target = 8;
for (let frame = 0; frame < 2; frame++) {
  rotation += (target - rotation) * 0.5;
}
console.log(rotation);
```

### --expected--

6

### --why--

Myslíš si, že každý snímek ujde stejný kus? Ujde polovinu **zbývající** cesty: 0 → 4 → 6. Proto pohyb ke konci zpomaluje.

### --see--

web-3d-efekty/interakce-a-castice#plynule-natoceni-linearni-interpolace

## --card-- output

Plátno je vysoké 600 px a myš má `clientY` 150. Co vypíše převod na souřadnici y od −1 do 1?

```js
const clientY = 150;
const height = 600;
console.log(-(clientY / height) * 2 + 1);
```

### --expected--

0.5

### --why--

Myš je ve čtvrtině výšky shora, tedy v horní polovině. Bez mínusu by vyšlo −0.5, protože `clientY` roste dolů, kdežto osa y ve 3D nahoru.

### --see--

web-3d-efekty/interakce-a-castice#pozice-mysi-od-1-do-1

## --card-- output

Co vypíše tenhle kód?

```js
const stars = 1000;
const positions = new Float32Array(stars * 3);
console.log(positions.length);
```

### --expected--

3000

### --why--

Každý bod potřebuje tři čísla (x, y, z) za sebou. Proto `BufferAttribute(positions, 3)` — trojka říká, kolik čísel patří k jednomu bodu.

### --see--

web-3d-efekty/interakce-a-castice#castice-jeden-objekt-tisice-bodu

## --card-- output

Telefon hlásí `devicePixelRatio` 3 a renderer má strop 2. Kolikrát víc pixelů kreslí proti poměru 1?

```js
const ratio = Math.min(3, 2);
console.log(ratio * ratio);
```

### --expected--

4

### --why--

Poměr platí pro šířku i výšku. Se stropem 2 je to čtyřikrát víc pixelů, bez stropu by to bylo devětkrát.

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna

## --card-- output

Co vypíše tenhle výpočet průběhu sekce pro scénu řízenou scrollem?

```js
const viewportHeight = 800;
const sectionTop = -200;
const sectionHeight = 400;
const progress = (viewportHeight - sectionTop) / (viewportHeight + sectionHeight);
console.log(Math.min(Math.max(progress, 0), 1));
```

### --expected--

0.8333333333333334

### --accept--

0.83
0.833

### --why--

`(800 + 200) / 1200` je 0,83: sekce už z větší části odjela nahoru. Omezení na 0 až 1 se tu neuplatní, zasáhne až mimo okno.

### --see--

web-3d-efekty/spline#scroll-a-mys

## --card-- code js

Napiš funkci `toPointer(clientX, clientY, width, height)`, která převede polohu myši v plátně na souřadnice od −1 do 1 pro `Raycaster`: vlevo a dole −1, vpravo a nahoře 1. Vrátí objekt `{ x, y }`.

### --seed--

```js
function toPointer(clientX, clientY, width, height) {
}
```

### --test--

```js
assert.deepEqual(toPointer(400, 300, 800, 600), { x: 0, y: 0 }, 'toPointer(400, 300, 800, 600) — střed plátna — má vrátit { x: 0, y: 0 }');
assert.deepEqual(toPointer(800, 0, 800, 600), { x: 1, y: 1 }, 'toPointer(800, 0, 800, 600) — pravý horní roh — má vrátit { x: 1, y: 1 }');
assert.deepEqual(toPointer(200, 450, 800, 600), { x: -0.5, y: -0.5 }, 'toPointer(200, 450, 800, 600) má vrátit { x: -0.5, y: -0.5 }');
```

### --solution--

```js
function toPointer(clientX, clientY, width, height) {
  return {
    x: (clientX / width) * 2 - 1,
    y: -(clientY / height) * 2 + 1,
  };
}
```

### --see--

web-3d-efekty/interakce-a-castice#pozice-mysi-od-1-do-1

## --card-- code js

Napiš funkci `sectionProgress(innerHeight, top, height)`, která vrátí průběh sekce oknem od 0 (horní okraj sekce je u spodku okna) do 1 (spodní okraj sekce odjel nad okno), omezený na rozsah 0 až 1.

### --seed--

```js
function sectionProgress(innerHeight, top, height) {
}
```

### --test--

```js
assert.equal(sectionProgress(800, 800, 400), 0, 'sectionProgress(800, 800, 400) — sekce u spodku okna — má vrátit 0');
assert.equal(sectionProgress(800, 200, 400), 0.5, 'sectionProgress(800, 200, 400) má vrátit 0.5');
assert.equal(sectionProgress(800, -400, 400), 1, 'sectionProgress(800, -400, 400) — sekce odjela nahoru — má vrátit 1');
assert.equal(sectionProgress(800, 2000, 400), 0, 'sectionProgress(800, 2000, 400) — sekce hluboko pod oknem — má vrátit 0, ne záporné číslo');
assert.equal(sectionProgress(800, -3000, 400), 1, 'sectionProgress(800, -3000, 400) má vrátit 1, ne víc');
```

### --solution--

```js
function sectionProgress(innerHeight, top, height) {
  const progress = (innerHeight - top) / (innerHeight + height);
  return Math.min(Math.max(progress, 0), 1);
}
```

### --see--

web-3d-efekty/spline#scroll-a-mys

## --card-- code js

Napiš funkci `writeStar(positions, index, x, y, z)`, která zapíše souřadnice hvězdy číslo `index` do pole `positions` (tři čísla na hvězdu za sebou) a pole vrátí.

### --seed--

```js
function writeStar(positions, index, x, y, z) {
}
```

### --test--

```js
const positions = new Float32Array(9);
writeStar(positions, 0, 1, 2, 3);
writeStar(positions, 2, 7, 8, 9);
assert.deepEqual([...positions], [1, 2, 3, 0, 0, 0, 7, 8, 9], 'writeStar pro hvězdy 0 a 2 má zapsat [1, 2, 3, 0, 0, 0, 7, 8, 9] — hvězda číslo index začíná na index * 3');
assert.equal(writeStar(new Float32Array(3), 0, 5, 5, 5)[1], 5, 'writeStar má vrátit pole s pozicemi');
```

### --solution--

```js
function writeStar(positions, index, x, y, z) {
  positions[index * 3] = x;
  positions[index * 3 + 1] = y;
  positions[index * 3 + 2] = z;
  return positions;
}
```

### --see--

web-3d-efekty/interakce-a-castice#castice-jeden-objekt-tisice-bodu

## --card-- code js

Napiš funkci `pixelRatioFor(devicePixelRatio)`, která vrátí poměr pixelů pro renderer: stejný jako zařízení, ale nejvýš 2.

### --seed--

```js
function pixelRatioFor(devicePixelRatio) {
}
```

### --test--

```js
assert.equal(pixelRatioFor(1), 1, 'pixelRatioFor(1) má vrátit 1');
assert.equal(pixelRatioFor(1.5), 1.5, 'pixelRatioFor(1.5) má vrátit 1.5');
assert.equal(pixelRatioFor(3), 2, 'pixelRatioFor(3) má vrátit strop 2');
```

### --solution--

```js
function pixelRatioFor(devicePixelRatio) {
  return Math.min(devicePixelRatio, 2);
}
```

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna

## --card-- code js

Napiš funkci `shouldLoadScene(entry, windowWidth)`, která rozhodne v callbacku `IntersectionObserver`, jestli načíst 3D scénu: jen když je prvek v okně (`entry.isIntersecting`) a okno je široké aspoň 641 px.

### --seed--

```js
function shouldLoadScene(entry, windowWidth) {
}
```

### --test--

```js
assert.equal(shouldLoadScene({ isIntersecting: false }, 1280), false, 'první zavolání s isIntersecting: false nemá scénu načíst');
assert.equal(shouldLoadScene({ isIntersecting: true }, 1280), true, 'prvek v okně a šířka 1280 má scénu načíst');
assert.equal(shouldLoadScene({ isIntersecting: true }, 375), false, 'na šířce 375 px se scéna nenačítá');
assert.equal(shouldLoadScene({ isIntersecting: true }, 641), true, 'na šířce 641 px se scéna načte');
```

### --solution--

```js
function shouldLoadScene(entry, windowWidth) {
  return entry.isIntersecting && windowWidth >= 641;
}
```

### --see--

web-3d-efekty/spline#vykon-velikost-sceny-line-nacitani-a-nahradni-obrazek

## --card-- css

Napiš deklaraci, díky které kliknutí projdou průhledným canvasem 3D pozadí k tlačítkům pod ním.

### --expected--

```css
pointer-events: none;
```

### --why--

Průhledný canvas přes obsah zachytí všechna kliknutí. S `pointer-events: none` je vidět, ale myš jím projde. Pohyb myši pro scénu pak posloucháš na `window`.

### --see--

web-3d-efekty/threejs-zaklady#canvas-za-obsahem-a-otaceni-mysi

## --card-- css

Napiš dvě deklarace, které canvas přišpendlí přes celé okno tak, aby zůstal na místě i při scrollu.

### --expected--

```css
position: fixed;
inset: 0;
```

### --accept--

```css
position: fixed;
top: 0;
right: 0;
bottom: 0;
left: 0;
```

### --why--

`fixed` pozicuje vůči oknu, takže pozadí neodjede se stránkou. `inset: 0` ho roztáhne ke všem čtyřem okrajům.

### --see--

css-pozicovani/position#fixed-prispendlene-k-oknu

## --card-- free

Kdy na web 3D scénu (Three.js nebo Spline) nedáš a co použiješ místo ní?

### --back--

Když se uživatel na 3D jen dívá a nic neovládá, bývá lehčí a hezčí video nebo obrázek. Natočení karty za myší zvládne CSS `perspective` a `rotateY`, přelévající se barvy CSS gradient. 3D taky nepatří tam, kde by neslo hlavní obsah (text, ceny, navigaci), protože ho nepřečte čtečka ani vyhledávač, a na weby, kam chodí hlavně lidé s levnými telefony. 3D se vyplatí u interakce a hloubky: konfigurátor, otáčení produktu, pozadí reagující na myš.

### --see--

web-3d-efekty/threejs-zaklady#kdy-3d-na-web-patri

## --card-- free

Proč se pohyb v render smyčce násobí časem snímku?

### --back--

Render smyčka se volá tak často, kolik zvládne monitor: 60× za sekundu na běžném, 144× na herním. Pevný přírůstek za snímek by na rychlejším monitoru točil objektem víc než dvakrát rychleji. Když rychlost vynásobím časem od minulého snímku (`Timer.getDelta()`), zapisuju ji v jednotkách za sekundu a pohyb je všude stejně rychlý, jen na rychlejším monitoru plynulejší.

### --see--

web-3d-efekty/threejs-zaklady#render-loop-a-cas-snimku

## --card-- free

Proč je objekt s `MeshStandardMaterial` černý a proč může být černý i leštěný kov ve scéně se světly?

### --back--

`MeshStandardMaterial` počítá barvu z dopadajícího světla, takže bez světla nemá co odrazit a vyjde černý. Oprava je přidat `AmbientLight` a `DirectionalLight`, nebo pro plochou barvu použít `MeshBasicMaterial`. Kov s `metalness: 1` skoro nerozptyluje světlo, odráží okolí — a prázdná scéna okolí nemá. Potřebuje prostředí v `scene.environment`, třeba z `RoomEnvironment`.

### --see--

web-3d-efekty/threejs-zaklady#mesh-geometrie-a-material

## --card-- free

Jaký je rozdíl mezi tisícem `Mesh`, jedním `InstancedMesh` a jedním `Points`, a kdy který použiješ?

### --back--

Každý `Mesh` je aspoň jeden draw call, takže tisíc meshů zahltí procesor přípravou příkazů pro grafiku. `InstancedMesh` kreslí kopie jedné geometrie s jedním materiálem jedním draw callem a každá kopie má vlastní polohu a rotaci — hodí se pro stovky stejných 3D tvarů. `Points` kreslí body jako čtverečky čelem ke kameře, taky jedním draw callem — na hvězdy, prach nebo jiskry, kde tvar nepotřebuješ.

### --see--

web-3d-efekty/interakce-a-castice#stovky-stejnych-objektu-instancedmesh

## --card-- free

Co je uniforma a varying v shaderu a proč fragment shader nevidí sousední pixely?

### --back--

Uniforma je vstup z JavaScriptu, stejný pro všechny vrcholy a pixely v jednom snímku: čas, poloha myši, barvy. Varying zapíše vertex shader pro každý vrchol a grafika ho plynule dopočítá pro pixely mezi nimi, typicky souřadnice `vUv`. Fragment shader běží pro všechny pixely naráz na tisících jader, takže soused ještě výsledek mít nemusí; barvu proto počítá jen ze svých vstupů, jako vzorec bez paměti.

### --see--

web-3d-efekty/shadery#uniformy-vstup-z-javascriptu

## --card-- free

Kdy zvolíš Spline a kdy napíšeš scénu ručně v Three.js?

### --back--

Spline se vyplatí, když scénu navrhuje designér, vzhled se mění častěji než chování a stačí pár interakcí — klik, najetí, scroll. Při změně vzhledu stačí nový export a kód zůstane. Three.js se vyplatí, když je 3D řízené daty nebo kódem (konfigurátor s cenami, vizualizace, hra), když potřebuju plnou kontrolu nad výkonem nebo vlastní shadery a částice, nebo když je scéna tak jednoduchá, že by byl runtime Splinu těžší než ona.

### --see--

web-3d-efekty/spline#kdy-spline-a-kdy-three-js

## --card-- free

Jak vložíš scénu ze Splinu na web, aby nezpomalila stránku a nevyřadila část návštěvníků?

### --back--

Soubor exportu dám k vlastnímu webu, ne na server Splinu. Pod canvas dám náhradní obrázek, který zmizí až po úspěšném `load`, a chybu načtení obsloužím. Scénu vytvořím líně přes `IntersectionObserver` (kontrola `isIntersecting` a `disconnect`) a na úzkých obrazovkách ji třeba nenačtu vůbec. S omezeným pohybem zavolám `app.stop()` a nenapojím scroll ani myš. Obsah a ovládání (texty, výběr barvy) nechám v HTML, protože canvas nepřečte čtečka ani vyhledávač.

### --see--

web-3d-efekty/spline#vykon-velikost-sceny-line-nacitani-a-nahradni-obrazek

## --card-- free

Proč musíš u Three.js ručně volat `dispose()`, když má JavaScript garbage collector?

### --back--

Geometrie, materiály a textury mají data v paměti grafické karty. Garbage collector uklízí jen objekty v paměti JavaScriptu a o bufferech na grafice neví. Když scénu odstraním (odchod ze stránky v aplikaci s routováním, zavření dialogu) bez `dispose()` a zastavení smyčky, paměť grafiky s každým vytvořením roste, až prohlížeč hlásí příliš mnoho WebGL kontextů.

### --see--

web-3d-efekty/interakce-a-castice#vykon-kreslit-mene-a-jen-kdyz-je-na-co-koukat

## --card-- free

Proč 3D pozadí zastavuješ, když není vidět, a jak to poznáš?

### --back--

Render smyčka kreslí každý snímek, i když plátno nikdo nevidí, a zbytečně zatěžuje grafiku a baterii. Když sekce odjede z okna, pozná to `IntersectionObserver` a smyčku zastavím přes `setAnimationLoop(null)`; při návratu ji spustím znovu. Skrytou kartu prohlížeč pozastaví sám, ale kvůli skoku po návratu připojím `Timer` k dokumentu přes `connect(document)`, nebo smyčku zastavím při `visibilitychange`.

### --see--

web-3d-efekty/interakce-a-castice#vykon-kreslit-mene-a-jen-kdyz-je-na-co-koukat
