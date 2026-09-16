# Interakce, částice a výkon

:::check pretest
Canvas je široký 1000 px a myš je přesně v jeho pravém horním rohu. Jakou pozici myši potřebuje `Raycaster`?

### --answer--

`(1000, 0)` — pixely od levého horního rohu.

#### --why--

Tak pozici hlásí prohlížeč. Three.js ale pracuje s jinými souřadnicemi, které nezávisí na velikosti plátna. Uvidíš v první části.

### --correct--

`(1, 1)`.

#### --why--

Three.js chce souřadnice od −1 do 1, kde 1 je vpravo a nahoře. Proč nahoře, a ne dole, vysvětlí první část.

### --answer--

`(1, -1)`.

#### --why--

Vpravo je 1 správně. Jak je to s osou y, rozebírá první část.
:::

:::check pretest
Chceš na pozadí hvězdné nebe z 5000 hvězd. Co myslíš, kolik draw callů (příkazů „nakresli" pro grafickou kartu) je potřeba, když každá hvězda bude samostatný `Mesh`?

### --answer--

Jeden, Three.js je spojí sám.

#### --why--

Automaticky je nespojí, každý mesh je pro renderer samostatný objekt. Jak je spojit, ukáže část o částicích.

### --correct--

Přibližně 5000.

#### --why--

Každý viditelný mesh znamená aspoň jeden draw call. Proč je to pomalé a jak to udělat jedním voláním, uvidíš v části o částicích.

### --answer--

Záleží jen na počtu trojúhelníků, ne na počtu meshů.

#### --why--

Trojúhelníky hrají roli taky, ale počet samostatných objektů je u tisíců malých věcí mnohem dražší. Proč, vysvětlí část o částicích.
:::

Hero sekce, kde se 3D scéna jemně natočí za kurzorem. Galerie produktů, kde se model otočí, když stránku posuneš dolů. Pozadí s tisíci poletujících teček. Tohle dělá z 3D na webu zážitek — a zároveň je to místo, kde web nejčastěji zpomalí telefon tak, že se nedá scrollovat.

> [!REMEMBER]
> **Stránka posílá do scény jen čísla (poloha myši, průběh scrollu) a render smyčka se k nim plynule přibližuje. Tisíce stejných věcí kresli jedním objektem, a když scénu nikdo nevidí, nekresli vůbec.**

## Pozice myši od −1 do 1

Prohlížeč hlásí polohu myši v pixelech (`clientX`, `clientY`) od levého horního rohu, **y roste dolů**. Pro 3D scénu jsou pixely k ničemu — závisí na velikosti okna. Proto se převádějí na [[normalizované souřadnice]]: vlevo −1, vpravo 1, **dole −1, nahoře 1**.

```js
const pointer = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1; // mínus: y nahoru
});
```

U canvasu, který nezabírá celé okno, počítáš vůči jeho obdélníku: `event.clientX - rect.left` a `rect.width` z `canvas.getBoundingClientRect()`.

:::live dom predict
```html
<div class="pad">Jezdi myší po ploše</div>
<p class="out">x: 0, y: 0</p>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }
.pad { height: 220px; display: grid; place-items: center; background: #e0f2fe; color: #0c4a6e; }
.out { font-size: 1.5rem; text-align: center; font-variant-numeric: tabular-nums; }
```
```js
const pad = document.querySelector('.pad');
const out = document.querySelector('.out');

pad.addEventListener('pointermove', (event) => {
  const rect = pad.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  out.textContent = `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`;
});
```
--question-- Kolega zapomněl na mínus u `y`. Co ukáže výpis, když myš dojede do **pravého horního** rohu plochy?
--option-- `x: 1.00, y: 1.00`
--option*-- `x: 1.00, y: -1.00`
--option-- `x: -1.00, y: 1.00`
--why-- `clientY` roste směrem dolů, takže nahoře je nejmenší a vzorec bez mínusu dá −1. Scéna, která se má natočit „nahoru za myší", se pak natočí dolů. Mínus osu y převrátí, aby nahoře byla 1 jako ve 3D.
:::

Po odhalení přidej do výpočtu `y` mínus a zkontroluj všechny čtyři rohy.

:::check
Myš je přesně uprostřed canvasu. Jaké normalizované souřadnice `x, y` má?

### --expected--

0, 0

### --accept--

(0, 0)
0 0

### --why--

Střed je v polovině šířky i výšky: `0.5 * 2 - 1 = 0` pro obě osy.

### --see--

web-3d-efekty/interakce-a-castice#pozice-mysi-od-1-do-1
:::

## Plynulé natočení: lineární interpolace

Když scénu natočíš přímo podle myši (`group.rotation.y = pointer.x`), reaguje trhaně a na dotykových zařízeních skáče. Příjemnější je, když se scéna ke kurzoru **přibližuje**: v každém snímku ujde kus zbývající cesty. To je [[lineární interpolace]] (*lerp*):

```js
// hodnota = hodnota + (cíl - hodnota) * podíl
group.rotation.y += (pointer.x * 0.4 - group.rotation.y) * 0.08;
```

Three.js má na to `THREE.MathUtils.lerp(od, do, podíl)`. Menší podíl = pomalejší a měkčí dojezd.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #020617; }
.stage { display: block; width: 100%; height: 300px; --lerp: var(--smoothing); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 6;

const group = new THREE.Group();
scene.add(group);
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 160, 24), new THREE.MeshNormalMaterial());
group.add(knot);

const pointer = { x: 0, y: 0 };
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

renderer.setAnimationLoop(() => {
  const factor = Number(getComputedStyle(document.documentElement).getPropertyValue('--smoothing')) || 0.08;
  group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, pointer.x * 0.8, factor);
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -pointer.y * 0.5, factor);

  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
```controls
--smoothing: range(0.01, 1, 0.01) = 0.08 | Podíl cesty za snímek
```
:::

Jezdi myší po plátně s podílem 0.08, pak ho dej na 1 — uzel skáče přesně za myší. Na 0.01 se sotva hýbe.

> [!NOTE]
> Lerp s pevným podílem závisí na počtu snímků, na 144Hz dojede rychleji. Na jemné natočení za myší to nevadí. Kde to vadit má, použij `THREE.MathUtils.damp(od, do, rychlost, delta)`, který počítá s časem snímku.

:::check
Rotace je `0`, cíl je `1` a podíl `0.5`. Jaká bude rotace po dvou snímcích?

### --expected--

0.75

### --why--

První snímek: `0 + (1 - 0) * 0.5 = 0.5`. Druhý: `0.5 + (1 - 0.5) * 0.5 = 0.75`. Každý snímek ujde polovinu **zbývající** cesty, proto pohyb ke konci zpomaluje.

### --see--

web-3d-efekty/interakce-a-castice#plynule-natoceni-linearni-interpolace
:::

## Raycaster: na co ukazuje myš

Chceš vědět, na který objekt uživatel klikl. `Raycaster` vystřelí z kamery paprsek skrz bod na obrazovce a vrátí pole zásahů seřazené od nejbližšího:

```js
const raycaster = new THREE.Raycaster();

canvas.addEventListener('click', (event) => {
  // pointer už obsahuje normalizované souřadnice
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  if (hits.length > 0) {
    console.log(hits[0].object.name, hits[0].point);
  }
});
```

- `intersectObjects(pole, true)` — `true` znamená prohledat i potomky skupin. Bez něj skupina nic „nezasáhne", protože sama nemá geometrii.
- Zásah obsahuje `object` (zasažený mesh), `point` (bod ve scéně) a `distance`.
- Raycaster počítá na procesoru s trojúhelníky. Na `pointermove` nad modelem s milionem trojúhelníků zpomalí stránku — testuj jen objekty, na které jde klikat, ne celou scénu.

:::check
Model židle je skupina `chair` se čtyřmi meshi uvnitř. Kód volá `raycaster.intersectObjects([chair])` a nevrací nic, ani když myš je přímo na sedáku. Co chybí?

### --expected--

true

### --accept--

druhý argument true
intersectObjects([chair], true)

### --why--

Bez druhého argumentu `true` se testuje jen skupina `chair`, která nemá geometrii. S `true` se prohledají i meshe uvnitř.

### --see--

web-3d-efekty/interakce-a-castice#raycaster-na-co-ukazuje-mys
:::

## Scroll jako vstup

Scroll je pro scénu jen další číslo. Nejužitečnější je **průběh od 0 do 1** — kolik ze stránky (nebo z jedné sekce) už uživatel prošel:

```js
let scrollProgress = 0;

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
}, { passive: true });
```

V render smyčce ho pak přepočítáš na hodnotu scény, třeba vzdálenost kamery `camera.position.z = 5 + scrollProgress * 6`. Posluchač jen uloží číslo, práci dělá smyčka — scroll tak zůstane plynulý i s náročnou scénou.

> [!TIP]
> U scroll efektů navázaných na konkrétní sekci (začni, až je sekce v půlce okna, a skonči na jejím konci) se hodí ScrollTrigger z knihovny GSAP. Pro jedno číslo pro celou stránku stačí výpočet výš.

:::check
Stránka je vysoká 3000 px, okno 1000 px a uživatel je na `scrollY` 500. Jaký je průběh scrollu?

### --expected--

0.25

### --why--

Odscrollovat jde nejvýš `3000 - 1000 = 2000` px. `500 / 2000 = 0.25`. Kdybys dělil celou výškou stránky, dojel by průběh jen na 0,67.

### --see--

web-3d-efekty/interakce-a-castice#scroll-jako-vstup
:::

## Částice: jeden objekt, tisíce bodů

Každý `Mesh` znamená pro grafickou kartu aspoň jeden [[draw call]] — samostatný příkaz „nakresli tohle". Příprava draw callu stojí procesor čas, takže tisíce meshů zahltí procesor, i když je grafika zvládne levou zadní. Hvězdy, sníh, jiskry nebo prach se proto kreslí jako **jeden objekt `Points`**: jedna geometrie, ve které je poloha každého bodu.

Polohy se ukládají do `BufferGeometry` jako dlouhé pole čísel `Float32Array` — tři čísla (x, y, z) na bod:

```js
const count = 3000;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;     // x
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ size: 0.05, color: '#bae6fd' });
const stars = new THREE.Points(geometry, material);
scene.add(stars);
```

`PointsMaterial` má `size` (velikost bodu), `sizeAttenuation` (vzdálené body menší, výchozí `true`) a `blending: THREE.AdditiveBlending` — překrývající se body se sčítají a září. S aditivním mícháním nastav i `depthWrite: false`, jinak body vpředu zakrývají zadní čtverečkem.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #020617; }
.stage { display: block; width: 100%; height: 300px; --stars: var(--count); --star-size: var(--size); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.z = 6;

const maxCount = 20000;
const positions = new Float32Array(maxCount * 3);
for (let i = 0; i < positions.length; i++) {
  positions[i] = (Math.random() - 0.5) * 14;
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ color: '#bae6fd', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
const stars = new THREE.Points(geometry, material);
scene.add(stars);

renderer.setAnimationLoop(() => {
  const styles = getComputedStyle(document.documentElement);
  geometry.setDrawRange(0, Number(styles.getPropertyValue('--count')) || 3000);
  material.size = Number(styles.getPropertyValue('--size')) || 0.05;

  stars.rotation.y += 0.001;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
```controls
--count: range(500, 20000, 500) = 3000 | Počet hvězd
--size: range(0.01, 0.3, 0.01) = 0.05 | Velikost bodu
```
:::

Posuň počet na 20 000 — scéna se pořád točí plynule, protože je to jeden draw call. Pak zvětši body na 0.3 a sleduj, jak se jejich záře sčítá.

Pohyb částic dělej **rotací nebo posunem celého objektu** (`stars.rotation.y += speed * delta`), ne přepisováním tisíců souřadnic v každém snímku. Když už souřadnice měnit musíš, po změně nastav `geometry.attributes.position.needsUpdate = true`, jinak grafická karta dostane stará data.

:::check
Po změně polí v `positions` se body v náhledu nepohnou, konzole mlčí. Který řádek chybí?

### --expected--

geometry.attributes.position.needsUpdate = true

### --accept--

needsUpdate = true
geometry.attributes.position.needsUpdate = true;

### --why--

Data atributu jsou v paměti grafické karty. Three.js je tam znovu nahraje, až když mu řekneš, že se změnila.

### --see--

web-3d-efekty/interakce-a-castice#castice-jeden-objekt-tisice-bodu
:::

## Stovky stejných objektů: `InstancedMesh`

Body jsou čtverečky. Když potřebuješ stovky skutečných 3D tvarů (kostky v mřížce, stromy v krajině, konfety), použij `InstancedMesh(geometrie, materiál, počet)`: jedna geometrie a jeden materiál, ke každé kopii jen její matice (poloha, rotace, měřítko). Grafická karta pak nakreslí všechny kopie jedním draw callem.

:::compare
```html
<canvas class="stage"></canvas>
<p class="calls"></p>
```
```css
body { margin: 0; background: #0f172a; color: #e2e8f0; font-family: system-ui, sans-serif; }
.stage { display: block; width: 100%; height: 220px; }
.calls { margin: 0.5rem; font-size: 1.25rem; }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 14;
scene.add(new THREE.AmbientLight('#ffffff', 1));
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshStandardMaterial({ color: '#f472b6' });
const count = 1000;
const place = (object, i) => object.position.set((i % 40) * 0.5 - 10, Math.floor(i / 40) * 0.3 - 3.6, 0);
```
--variant-- 1000 × Mesh
```js
for (let i = 0; i < count; i++) {
  const box = new THREE.Mesh(geometry, material);
  place(box, i);
  scene.add(box);
}
renderer.setAnimationLoop(() => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  document.querySelector('.calls').textContent = `Draw calls: ${renderer.info.render.calls}`;
});
```
--variant-- 1 × InstancedMesh
```js
const boxes = new THREE.InstancedMesh(geometry, material, count);
const helper = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  place(helper, i);
  helper.updateMatrix();
  boxes.setMatrixAt(i, helper.matrix);
}
scene.add(boxes);
renderer.setAnimationLoop(() => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  document.querySelector('.calls').textContent = `Draw calls: ${renderer.info.render.calls}`;
});
```
:::

Obraz je v obou variantách stejný, počet draw callů ne. `renderer.info.render.calls` je nejrychlejší kontrola výkonu, kterou máš — vypiš si ji při vývoji do rohu stránky. Na telefonu drž celou scénu v desítkách draw callů.

:::check
V `InstancedMesh` změníš polohu jedné kopie přes `setMatrixAt`, ale kopie zůstane na místě. Co musíš nastavit?

### --expected--

instanceMatrix.needsUpdate = true

### --accept--

boxes.instanceMatrix.needsUpdate = true
mesh.instanceMatrix.needsUpdate = true

### --why--

Stejně jako u atributu geometrie: matice kopií jsou v paměti grafické karty a Three.js je nahraje znovu, až když je označíš jako změněné.

### --see--

web-3d-efekty/interakce-a-castice#stovky-stejnych-objektu-instancedmesh
:::

## Výkon: kreslit méně a jen když je na co koukat

Čtyři pravidla, která udrží 3D plynulé i na telefonu:

1. **Pixel ratio nejvýš 2**: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`. Na slabých zařízeních klidně 1,5.
2. **Málo draw callů**: sloučit, instancovat, částice jako `Points`. Kontroluj `renderer.info.render.calls`.
3. **Pauza, když scénu nikdo nevidí.** Canvas pod ohybem stránky nebo v kartě na pozadí nemá kreslit. `IntersectionObserver` na canvasu nebo jeho sekci přepíná smyčku:

```js
function tick() { /* pohyb a render */ }

new IntersectionObserver(([entry]) => {
  renderer.setAnimationLoop(entry.isIntersecting ? tick : null);
}).observe(canvas);
```

`requestAnimationFrame` v kartě na pozadí prohlížeč pozastaví sám. Po návratu je ale čas snímku obrovský a scéna poskočí — proto `timer.connect(document)` z lekce o základech, který skrytí karty hlídá přes událost `visibilitychange`.

4. **Úklid.** Geometrie, materiály a textury zabírají paměť grafické karty a JavaScript je sám neuvolní. Když scénu odstraňuješ (odchod ze stránky v aplikaci s routováním, zavření dialogu s náhledem), zastav smyčku a zavolej `dispose()`:

```js
function destroyScene() {
  renderer.setAnimationLoop(null);
  scene.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose();
  });
  renderer.dispose();
}
```

Kolik toho v paměti je, ukáže `renderer.info.memory` (`geometries`, `textures`).

> [!PITFALL]
> **Po několika návštěvách stránky s 3D náhledem se aplikace zpomaluje a nakonec prohlížeč hlásí `WARNING: Too many active WebGL contexts. Oldest context will be lost.`** Každé otevření vytvoří nový renderer a starý nikdo neuklidil. Oprava: při odchodu zastav smyčku a zavolej `dispose()` na geometriích, materiálech, texturách a rendereru.

:::check
Hero sekce s 3D pozadím je nahoře na stránce. Uživatel odscrolluje k patičce. Co má scéna dělat?

### --answer--

Kreslit dál, aby byla po návratu hned připravená.

#### --why--

Scéna je připravená i po zastavení smyčky, objekty zůstávají v paměti. Kreslení mimo obrazovku jen pálí baterii.

### --correct--

Zastavit render smyčku, dokud se sekce nevrátí do okna.

#### --why--

`IntersectionObserver` pozná, že sekce odjela, a `setAnimationLoop(null)` kreslení zastaví. Při návratu se smyčka zase spustí.

### --answer--

Zavolat `dispose()` na všem, aby uvolnila paměť.

#### --why--

`dispose` je na odstranění scény natrvalo. Po návratu by nebylo co kreslit a vše by se muselo vytvořit znovu.

### --see--

web-3d-efekty/interakce-a-castice#vykon-kreslit-mene-a-jen-kdyz-je-na-co-koukat
:::

## Bez WebGL a s omezeným pohybem

3D je vylepšení, ne obsah. Nadpis, text a tlačítko musí fungovat i bez něj:

- **Bez WebGL** (starý telefon, vypnutá hardwarová akcelerace, firemní počítač): `canvas.getContext('webgl2')` vrátí `null` a `new THREE.WebGLRenderer()` vyhodí chybu. Zjisti to předem (Three.js má `WebGL.isWebGL2Available()` v `three/addons/capabilities/WebGL.js`), přidej třídu jako `no-webgl` a v CSS ukaž záložní obrázek nebo gradient.
- **S [[omezený pohyb|omezeným pohybem]]** (`prefers-reduced-motion: reduce`): scéna se nemá sama točit ani se hýbat za myší a scrollem. Nakresli jeden statický snímek. Stav čti v render smyčce přes `matchMedia` — uživatel může nastavení změnit i během návštěvy. Proč na tom záleží, víš z [lekce o animacích](see:css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion).

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

renderer.setAnimationLoop((time) => {
  timer.update(time);
  if (!reducedMotion.matches) {
    planet.rotation.y += 0.2 * timer.getDelta();
  }
  renderer.render(scene, camera);
});
```

> [!NOTE]
> Hotové modely (`.glb`) načítá `GLTFLoader` z `three/addons/loaders/GLTFLoader.js`. Na výkon platí totéž co u primitiv, jen hlídáš ještě velikost souboru a textur — textura 4096 × 4096 zabere v grafické paměti přes 60 MB, i když má soubor 2 MB.

:::check
Proč se stav `prefers-reduced-motion` čte v render smyčce, a ne jednou při načtení stránky?

### --answer--

Protože `matchMedia` jde zavolat jen uvnitř `setAnimationLoop`.

#### --why--

`matchMedia` jde zavolat kdykoli. Otázka je, jestli se hodnota může během návštěvy změnit.

### --correct--

Uživatel může nastavení změnit, zatímco má stránku otevřenou.

#### --why--

Objekt z `matchMedia` má živou vlastnost `matches`. Když ji čteš v každém snímku (nebo posloucháš jeho `change`), scéna se zastaví hned po přepnutí v systému.

### --answer--

Protože při načtení stránky prohlížeč ještě preference nezná.

#### --why--

Preference jsou známé od začátku, CSS media dotazy fungují hned při prvním vykreslení.

### --see--

web-3d-efekty/interakce-a-castice#bez-webgl-a-s-omezenym-pohybem
:::

## Typické chyby a pasti

> [!PITFALL]
> **Scéna se za myší natáčí obráceně nahoru a dolů.** Chybí mínus u `y` v převodu na souřadnice −1 až 1. `clientY` roste dolů, 3D osa y nahoru.

> [!PITFALL]
> **Stránka s 3D pozadím se na telefonu trhá při scrollu.** Obvyklé příčiny: pixel ratio 3, tisíce meshů místo `Points` nebo `InstancedMesh`, `raycaster` nad celou scénou při každém `pointermove`. Otevři DevTools → Performance a hledej dlouhé úlohy ve snímku, `renderer.info.render.calls` ukáže počet draw callů.

> [!PITFALL]
> **Body částic mají kolem sebe černé čtverečky.** Aditivní míchání bez `depthWrite: false` (nebo průhledná textura bez `transparent: true`). Body vpředu zapíšou hloubku a zadní body za nimi se nevykreslí.

> [!PITFALL]
> **Na počítači bez WebGL je místo hero sekce bílá plocha a v konzoli `Error creating WebGL context.`** Kód nezkontroloval podporu a spadl dřív, než se stránka dokreslila. Oprava: podporu zjisti předem a záložní vzhled dej do CSS, ne až do JavaScriptu za 3D kódem.

:::check
Kolega na `pointermove` volá `raycaster.intersectObjects(scene.children, true)` nad scénou s 200 000 trojúhelníky a hvězdami. Co mu poradíš?

### --answer--

Přepnout scénu na `InstancedMesh`.

#### --why--

`InstancedMesh` šetří draw cally při kreslení. Raycaster ale počítá na procesoru s trojúhelníky, draw cally ho nezajímají.

### --correct--

Testovat jen objekty, na které jde klikat, třeba pole `[product]`.

#### --why--

Raycaster prochází trojúhelníky všeho, co mu předáš. Menší seznam = méně práce při každém pohybu myši.

### --answer--

Zvětšit `PointsMaterial.size`, aby se hvězdy trefovaly snáz.

#### --why--

Velikost bodu na výkon raycasteru nemá vliv, hvězdy v seznamu vůbec nemají být.

### --see--

web-3d-efekty/interakce-a-castice#raycaster-na-co-ukazuje-mys
:::

## Kde to najdeš v MDN

- [Element: pointermove event](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointermove_event) — `clientX`, `clientY` a proč pointer události fungují pro myš i dotyk.
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — jak zjistit, že je prvek v okně, bez počítání při scrollu.
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) — `document.hidden` a `visibilitychange` pro karty na pozadí.
- [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) — proč méně draw callů a menší textury pomáhají.

Příště z toho postavíš hero sekci planetária s hvězdným polem, které se natáčí za myší a odjíždí při scrollu.

# --questions--

## --question--

V hero sekci se scéna natáčí za myší a na dotykovém telefonu, kde myš není, stojí. Kam budeš posílat souřadnice na telefonu, aby se scéna aspoň trochu hýbala, a přitom respektovala omezený pohyb?

### --answer--

Na telefonu nic, `pointermove` tam nikdy nepřijde.

#### --why--

Pointer události přicházejí i z dotyku, ale jen během tažení prstem. Otázka je, co dělat, když uživatel jen scrolluje.

### --correct--

Z průběhu scrollu, a jen když není zapnutý omezený pohyb.

#### --why--

Scroll na telefonu je hlavní pohyb uživatele. Průběh od 0 do 1 dá scéně vstup, a kontrola `prefers-reduced-motion` ho vypne těm, kterým pohyb vadí.

### --answer--

Z `deviceorientation` naklánění telefonu, vždycky.

#### --why--

Senzory na iOS vyžadují povolení a „vždycky" ignoruje uživatele s omezeným pohybem.

### --see--

web-3d-efekty/interakce-a-castice#scroll-jako-vstup
web-3d-efekty/interakce-a-castice#bez-webgl-a-s-omezenym-pohybem

## --question--

Scéna má 1200 stejných stromů jako samostatné meshe a `renderer.info.render.calls` ukazuje 1200. Který objekt Three.js použiješ, aby stromy zůstaly 3D tvary a draw call byl jeden?

### --expected--

InstancedMesh

### --why--

`InstancedMesh` kreslí kopie jedné geometrie s jedním materiálem jedním draw callem. `Points` by udělaly jen čtverečky.

### --see--

web-3d-efekty/interakce-a-castice#stovky-stejnych-objektu-instancedmesh

## --question--

Hodnota je `10`, cíl `0` a v každém snímku se volá `value = THREE.MathUtils.lerp(value, 0, 0.1)`. Jaká je hodnota po prvním snímku?

### --expected--

9

### --why--

`10 + (0 - 10) * 0.1 = 9`. Každý snímek ujde desetinu zbývající cesty, takže se k nule blíží čím dál pomaleji.

### --see--

web-3d-efekty/interakce-a-castice#plynule-natoceni-linearni-interpolace
