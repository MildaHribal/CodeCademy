# Scéna, kamera a render loop

:::check pretest
Do scény dáš kostku s materiálem `MeshStandardMaterial` a nepřidáš žádné světlo. Jak bude kostka vypadat?

### --answer--

Bílá, protože materiál má výchozí bílou barvu.

#### --why--

Výchozí barva materiálu opravdu je bílá. Jestli ji ale uvidíš, záleží na tom, jak materiál počítá osvětlení. Vysvětlí to část o materiálech.

### --correct--

Černá.

#### --why--

`MeshStandardMaterial` počítá barvu z dopadajícího světla. Bez světla nemá co odrazit. Proč to tak je, uvidíš v části o materiálech.

### --answer--

Nevykreslí se vůbec, canvas zůstane prázdný.

#### --why--

Kostka se vykreslí, geometrie i materiál jsou v pořádku. Rozdíl je jen v barvě, kterou materiál spočítá. Uvidíš v části o materiálech.
:::

:::check pretest
Kamera stojí na souřadnicích `(0, 0, 5)` a dívá se do středu scény. Kostku posuneš na `z = 2`. Bude na obrazovce větší, nebo menší než na `z = 0`?

### --answer--

Menší, protože se vzdálila.

#### --why--

Záleží na tom, kterým směrem osa z vede. Ukáže to část o souřadnicích.

### --correct--

Větší, protože je blíž ke kameře.

#### --why--

Osa z míří k divákovi. Kamera na `z = 5` je „před obrazovkou", takže kostka na `z = 2` je k ní blíž. Podrobnosti v části o scéně a kameře.

### --answer--

Stejně velká, posun po ose z velikost nemění.

#### --why--

To platí jen pro ortografickou kameru. Kamera, kterou použiješ na webu, má perspektivu. Vysvětlí to část o scéně a kameře.
:::

Otáčející se model tenisky na stránce e-shopu, planeta za nadpisem planetária, konfigurátor, kde si zákazník obarví židli. To všechno je 3D na webu. Prohlížeč na to má rozhraní WebGL, jenže v čistém WebGL nakreslíš jeden trojúhelník na sto řádků kódu. Knihovna Three.js ti dá objekty jako „kamera", „světlo" nebo „kostka" a WebGL ovládá za tebe.

> [!REMEMBER]
> **Three.js je divadlo: scéna s objekty, kamera, která se na ně dívá, a renderer, který každý snímek „vyfotí" do `<canvas>`.** Nic se neukáže, dokud renderer nezavolá `render(scene, camera)` — a aby se něco hýbalo, musí to volat pořád dokola.

## Kdy 3D na web patří

3D je drahé. Stáhne se knihovna (Three.js má zhruba 170 kB po kompresi), telefon zahřeje grafický čip a obsah v canvasu nepřečte čtečka obrazovky ani vyhledávač. Proto se nejdřív ptej, jestli to nejde jednodušeji:

| chceš | stačí |
|---|---|
| kartu, která se natočí za myší | CSS `perspective` a `rotateY` |
| smyčku s produktem, se kterou nikdo nic nedělá | video (`<video autoplay muted loop playsinline>`) |
| barevný přechod, který se pomalu přelévá | CSS gradient s animací |
| model, který si zákazník otočí a přebarví | **Three.js** |
| pozadí, které reaguje na myš a scroll a má hloubku | **Three.js** |

Rozhoduje **interakce a hloubka**. Když se uživatel na 3D jen dívá a nic neovládá, bývá video lehčí a hezčí.

:::live
```html
<div class="stage">
  <div class="card">Stolní lampa<br><strong>3 490 Kč</strong></div>
</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; }
.stage { perspective: var(--perspective); padding: 3rem; display: grid; place-items: center; }
.card {
  width: 220px; padding: 2rem; border-radius: 1rem; background: #fff; color: #0f172a;
  box-shadow: 0 20px 40px rgb(15 23 42 / 0.15);
  transform: rotateY(var(--angle));
}
```
```controls
--angle: range(-60, 60, 5, deg) = 25 | Natočení karty
--perspective: range(200, 1600, 100, px) = 600 | Perspektiva
```
:::

Tohle je CSS 3D, žádný WebGL. Zkus zmenšit perspektivu na 200 px a sleduj, jak se zkreslení zvětší — oko je blíž. Na natočení karty Three.js nepotřebuješ.

:::check
Klient chce na úvodní stránku kavárny smyčku, kde se z hrnku kouří. Nic se na ní neovládá. Co mu doporučíš jako první?

### --answer--

Three.js scénu s částicemi kouře.

#### --why--

Šlo by to, ale bez interakce platíš za knihovnu a výkon telefonu a nic tím nezískáš. Podívej se znovu na tabulku, co rozhoduje.

### --correct--

Krátké video bez zvuku ve smyčce.

#### --why--

Na nic se neklikne a nic se neotáčí. Video se stáhne a přehraje levněji a vypadá přesně tak, jak ho natočíš.

### --answer--

Spline scénu, protože je to rychlejší než psát Three.js.

#### --why--

Spline je taky WebGL runtime a stejně jako Three.js se vyplatí, když uživatel se scénou něco dělá. Tady nic nedělá.

### --see--

web-3d-efekty/threejs-zaklady#kdy-3d-na-web-patri
:::

## Scéna, kamera a renderer

Tři objekty, bez kterých se nic nevykreslí:

- **`Scene`** — kontejner, do kterého přidáváš objekty a světla (`scene.add(…)`). Tvoří strom, [[graf scény]].
- **`PerspectiveCamera(fov, aspect, near, far)`** — kamera s perspektivou jako oko. `fov` je svislý zorný úhel ve stupních, `aspect` poměr šířky a výšky plátna, `near` a `far` vymezují, co je moc blízko a moc daleko na vykreslení.
- **`WebGLRenderer({ canvas })`** — kreslí scénu z pohledu kamery do `<canvas>`.

Souřadnice: **x doprava, y nahoru, z k tobě** (ven z obrazovky). Kamera je na začátku v bodě `(0, 0, 0)` a dívá se do záporného z. Proto ji skoro vždycky odsuneš: `camera.position.z = 5`.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 320px; --camera-fov: var(--fov); --camera-distance: var(--distance); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial(),
);
scene.add(box);

renderer.setAnimationLoop(() => {
  // 1. hodnoty z ovládání pod ukázkou
  const styles = getComputedStyle(document.documentElement);
  camera.fov = Number(styles.getPropertyValue('--fov')) || 50;
  camera.position.z = Number(styles.getPropertyValue('--distance')) || 5;

  // 2. plátno podle velikosti v CSS
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // 3. pohyb a vykreslení
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
});
```
```controls
--fov: range(15, 120, 5) = 50 | Zorný úhel kamery (fov)
--distance: range(2, 12, 1) = 5 | Vzdálenost kamery (z)
```
:::

Zkus zvětšit `fov` na 120: kostka se zmenší a okraje obrazu se roztáhnou jako u širokoúhlého objektivu. Pak dej vzdálenost na 2 a `fov` na 15 — kostka se nevejde. Změna `fov` i posun kamery objekt zvětší nebo zmenší, ale jen posun mění perspektivu.

> [!NOTE]
> `MeshNormalMaterial` obarví každou stěnu podle směru, kam míří. Světlo nepotřebuje, proto se hodí na první pokusy.

:::check
Kostka je v bodě `(0, 0, 0)` a kameru jsi neposunul. Co uvidíš?

### --answer--

Kostku zepředu, jen hodně zblízka.

#### --why--

Kamera by musela stát před kostkou. Kde kamera na začátku stojí a kam se dívá?

### --correct--

Nic, kamera je uvnitř kostky a stěny zevnitř se nekreslí.

#### --why--

Kamera i kostka jsou v počátku. Stěny se standardně kreslí jen z vnější strany, takže zevnitř nevidíš nic. Proto `camera.position.z = 5`.

### --answer--

Chybu v konzoli, že kamera a objekt jsou na stejném místě.

#### --why--

Three.js tuhle situaci nehlídá, žádná hláška nepřijde. Proto je to past: canvas je prostě prázdný.

### --see--

web-3d-efekty/threejs-zaklady#scena-kamera-a-renderer
:::

## Mesh: geometrie a materiál

Viditelný objekt je [[mesh]] (*mesh*, síť trojúhelníků). Skládá se ze dvou částí:

- **geometrie** — tvar: `BoxGeometry(šířka, výška, hloubka)`, `SphereGeometry(poloměr, segmenty, segmenty)`, `CylinderGeometry(poloměrNahoře, poloměrDole, výška, segmenty)`,
- **materiál** — jak povrch vypadá: barva, lesk, průhlednost.

Dva materiály, které budeš používat nejčastěji:

| materiál | světlo | kdy |
|---|---|---|
| `MeshBasicMaterial` | ignoruje, barva je pořád stejná | ploché barvy, UI ve 3D, částice |
| `MeshStandardMaterial` | počítá z dopadajícího světla | skoro všechno, co má vypadat skutečně |

`MeshStandardMaterial` má dvě vlastnosti, které dělají „materiál": `roughness` (0 = zrcadlo, 1 = matný) a `metalness` (0 = plast nebo dřevo, 1 = kov).

:::live dom libs=three predict
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #e2e8f0; }
.stage { display: block; width: 100%; height: 260px; }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e2e8f0');
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 4;

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 1.4, 1.4),
  new THREE.MeshStandardMaterial({ color: '#f59e0b' }),
);
box.rotation.set(0.5, 0.7, 0);
scene.add(box);

renderer.setAnimationLoop(() => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
--question-- Kostka má oranžový `MeshStandardMaterial`. Jakou barvu uvidíš?
--option-- Oranžovou, stejnou na všech stěnách.
--option-- Oranžovou, každou stěnu jinak tmavou.
--option*-- Černou.
--why-- `MeshStandardMaterial` počítá, kolik světla povrch odrazí. Ve scéně žádné světlo není, takže odrazí nulu — z oranžové zbude černá. Stejně jednotnou oranžovou jako v první možnosti by ukázal `MeshBasicMaterial`, stíny na stěnách jako ve druhé možnosti potřebují světlo.
:::

Zkus v ukázce vyměnit materiál za `MeshBasicMaterial` a pak se vrať ke `MeshStandardMaterial` a přidej řádek ze další části: `scene.add(new THREE.AmbientLight('#ffffff', 1))`.

> [!PITFALL]
> **Leštěný kov (`metalness: 1`) je tmavý, i když scéna má světla.** Kov skoro nerozptyluje světlo, jen **odráží okolí** — a prázdná scéna žádné okolí nemá. Oprava: dej scéně prostředí k odrazu, třeba hotové studio z doplňků:
> `scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture`
> (`RoomEnvironment` importuješ z `three/addons/environments/RoomEnvironment.js`).

:::check
Model kovové lampy vypadá jako z plastu. Kterou vlastnost materiálu zvýšíš?

### --expected--

metalness

### --why--

`metalness` říká, jak moc se povrch chová jako kov (odráží okolí a barvu světla bere podle sebe). `roughness` mění jen to, jak je odraz rozmazaný.

### --see--

web-3d-efekty/threejs-zaklady#mesh-geometrie-a-material
:::

## Světla

Bez světla jsou „skutečné" materiály černé. Na většinu scén stačí dvě světla:

- **`AmbientLight(barva, intenzita)`** — rovnoměrné světlo odevšad. Nic nestíní, jen zabrání tomu, aby odvrácené strany byly úplně černé.
- **`DirectionalLight(barva, intenzita)`** — světlo z jednoho směru jako slunce. Směr určuje jeho `position` (svítí z té pozice do středu scény).

Další, které potkáš: `PointLight` (žárovka, svítí do všech stran z bodu), `SpotLight` (reflektor s kuželem), `HemisphereLight` (obloha nahoře, zem dole).

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 280px; --light-x: var(--sun-x); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 1, 5);
camera.lookAt(0, 0, 0);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 48, 24),
  new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.4 }),
);
scene.add(sphere);

scene.add(new THREE.AmbientLight('#ffffff', 0.2));
const sun = new THREE.DirectionalLight('#ffffff', 2.5);
scene.add(sun);

renderer.setAnimationLoop(() => {
  const x = Number(getComputedStyle(document.documentElement).getPropertyValue('--sun-x')) || 0;
  sun.position.set(x, 2, 3);

  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
```controls
--sun-x: range(-6, 6, 1) = 3 | Poloha slunce na ose x
```
:::

Posouvej slunce doleva a doprava a sleduj, kde je na kouli odlesk. Pak v kódu nastav intenzitu `AmbientLight` na `0` — odvrácená strana zčerná úplně.

:::check
Otočný model boty je ze strany od světla úplně černý a vypadá jako díra. Které světlo přidáš?

### --expected--

AmbientLight

### --accept--

HemisphereLight

### --why--

`DirectionalLight` svítí jen z jednoho směru, odvrácená strana od něj nedostane nic. Slabé `AmbientLight` (nebo `HemisphereLight`) dodá trochu světla odevšad.

### --see--

web-3d-efekty/threejs-zaklady#svetla
:::

## Skupiny: rodič nese své děti

Model se málokdy skládá z jednoho meshe. Lampa má podstavu, rameno a stínidlo; auto karoserii a čtyři kola. Části spojíš do `THREE.Group` — neviditelného objektu, který jen drží potomky. **Pozice, rotace a měřítko potomka se počítají vůči rodiči.** Když rodiče posuneš nebo otočíš, děti jdou s ním.

Druhé využití skupiny je **kloub**. Mesh se otáčí kolem svého středu. Když chceš rameno otáčet kolem jeho spodního konce, dáš ho do skupiny, skupinu postavíš do místa kloubu a rameno v ní posuneš o půl délky nahoru. Otáčíš pak skupinou.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 300px; }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 3, 7);
camera.lookAt(0, 0, 0);

const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshNormalMaterial());
scene.add(earth);

// 1. kloub ve středu Země
const moonOrbit = new THREE.Group();
earth.add(moonOrbit);

// 2. Měsíc posunutý od kloubu
const moon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 12), new THREE.MeshNormalMaterial());
moon.position.x = 2.2;
moonOrbit.add(moon);

renderer.setAnimationLoop(() => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  moonOrbit.rotation.y += 0.02;
  renderer.render(scene, camera);
});
```
:::

Zkus do smyčky přidat `earth.position.x = Math.sin(performance.now() / 1000)`. Země se kývá a Měsíc obíhá s ní, i když jeho `position` nikdo nemění. Pak přesuň `moonOrbit.rotation.y += 0.02` na `moon.rotation.y += 0.02` — Měsíc se začne točit na místě, protože se otáčí kolem vlastního středu.

:::check
Stínidlo lampy je potomek skupiny `armPivot`. Skupinu otočíš o 20° doprava. Co se stane se stínidlem, jehož `position` ani `rotation` jsi nezměnil?

### --answer--

Nic, jeho vlastní pozice a rotace se nezměnily.

#### --why--

Vlastní hodnoty zůstaly, ale jsou zapsané vůči rodiči. Kde je stínidlo ve scéně doopravdy, závisí i na rodiči.

### --correct--

Otočí se a posune spolu se skupinou.

#### --why--

Pozice a rotace potomka se počítají v souřadnicích rodiče. Otočení `armPivot` pohne celou jeho větví, stínidlo zůstane na konci ramene.

### --answer--

Otočí se na místě, ale neposune se.

#### --why--

Rodič nepředává jen rotaci. Otočí celý souřadnicový systém potomka, takže se změní i to, kde potomek leží.

### --see--

web-3d-efekty/threejs-zaklady#skupiny-rodic-nese-sve-deti
:::

## Render loop a čas snímku

Aby se kostka točila, musíš ji v každém snímku trochu pootočit a scénu znovu vykreslit. Tohle opakování je [[render smyčka]]. Three.js na ni má `renderer.setAnimationLoop(callback)` — uvnitř je `requestAnimationFrame` z [lekce o API prohlížeče](see:js-dom/prohlizecova-api#plynule-zmeny-requestanimationframe-a-cteni-layoutu), jen se dá snadno zastavit: `renderer.setAnimationLoop(null)`.

Háček: prohlížeč volá smyčku tak často, kolik monitor zvládne. Na běžném monitoru 60× za sekundu, na herním 144×. Kód `box.rotation.y += 0.01` pak na herním monitoru točí víc než dvakrát rychleji. Řešení: pohyb násob [[čas snímku|časem snímku]] (*delta time*) — kolik sekund uběhlo od minulého snímku.

```js
import { Timer } from 'three';

const timer = new Timer();
timer.connect(document); // po návratu na kartu nezačne obří skok

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = timer.getDelta(); // sekundy od minulého snímku

  box.rotation.y += 1.2 * delta; // 1,2 radiánu za sekundu na každém monitoru
  renderer.render(scene, camera);
});
```

Rychlost teď zapisuješ v jednotkách **za sekundu**. Na 60Hz je `delta` asi 0,0167, na 144Hz asi 0,0069 — snímků je víc, ale každý posune míň.

> [!NOTE]
> Ve starších návodech uvidíš `THREE.Clock`. Od verze r183 je zastaralý a nahrazuje ho `Timer`, který navíc umí přes `connect(document)` hlídat skrytí karty.

:::explain
Vysvětli vlastními slovy, proč se rotace v render smyčce násobí časem snímku.

## --model--

Smyčka se volá tak často, kolik zvládne monitor, třeba 60× nebo 144× za sekundu. Kdybych přičítal pevné číslo, na rychlejším monitoru by se objekt točil rychleji. Když rychlost násobím časem od minulého snímku, zapisuju ji za sekundu a pohyb je stejně rychlý všude, jen na rychlejším monitoru plynulejší.

## --checklist--

- Smyčka běží tak často, kolik zvládne monitor, ne pevně.
- Pevný přírůstek za snímek zrychlí pohyb na rychlejším monitoru.
- Čas snímku převede rychlost na jednotky za sekundu.
:::

:::check
Rotace je `planet.rotation.y += 0.5 * delta` a `delta` je v sekundách. O kolik radiánů se planeta otočí za 4 sekundy?

### --expected--

2

### --why--

0,5 radiánu za sekundu × 4 sekundy = 2 radiány. Nezáleží na tom, jestli to bylo 240, nebo 576 snímků.

### --see--

web-3d-efekty/threejs-zaklady#render-loop-a-cas-snimku
:::

## Změna velikosti plátna

Canvas má dvě velikosti: **v CSS** (kolik místa zabírá na stránce) a **v pixelech** (kolik bodů renderer kreslí). Když nesouhlasí, obraz je rozmazaný nebo roztažený. Renderer se proto při každé změně velikosti musí dozvědět tři věci:

```js
function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer.setSize(width, height, false); // false = CSS velikost nech na stylech
  camera.aspect = width / height;         // nový poměr stran
  camera.updateProjectionMatrix();        // bez tohle kamera o změně neví
}
```

- `setSize(…, false)` nastaví počet pixelů plátna a nechá CSS, ať určuje, kolik místa canvas zabírá.
- `camera.aspect` a hned `updateProjectionMatrix()` — kamera si projekci počítá jen na požádání. Bez druhého řádku je nový poměr stran uložený, ale nepoužitý.
- Kdy `resize()` volat: u canvasu přes celé okno stačí událost `resize` na `window`. U canvasu v kartě nebo v mřížce použij `ResizeObserver` na jeho rodiče.

Displeje s vysokou hustotou (telefony, MacBooky) mají `devicePixelRatio` 2 nebo 3. `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` zapne ostré kreslení, ale strop 2 hlídá výkon: poměr 3 znamená 9× víc pixelů než poměr 1, a rozdíl mezi 2 a 3 okem skoro nevidíš.

> [!PITFALL]
> **Po změně šířky okna je model zdeformovaný** (koule je vajíčko), i když kód nastavuje `camera.aspect`. Chybí `camera.updateProjectionMatrix()` hned za ním. Žádná hláška nepřijde, obraz je jen roztažený.

:::check
Uživatel otočí telefon na šířku. Plátno se zvětšilo, ale model je natažený do šířky. Který řádek v obsluze změny velikosti nejspíš chybí?

### --expected--

camera.updateProjectionMatrix()

### --accept--

updateProjectionMatrix()
updateProjectionMatrix

### --why--

Plátno se zvětšilo, takže `setSize` proběhl. Deformace znamená, že kamera pořád promítá se starým poměrem stran — `aspect` se změnil, ale projekce se nepřepočítala.

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna
:::

## Canvas za obsahem a otáčení myší

3D pozadí za nadpisem je canvas přišpendlený přes celé okno pod obsahem:

```css
.background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none; /* kliknutí projdou k tlačítkům nad ním */
}
```

S `alpha: true` v `WebGLRenderer` je pozadí plátna průhledné a prosvítá barva stránky. Jak `fixed` a `z-index` fungují, víš z [lekce o pozicování](see:css-pozicovani/position#fixed-prispendlene-k-oknu).

U náhledu produktu chceš opak: aby si uživatel model otočil myší. Na to má Three.js hotový doplněk `OrbitControls`:

:::live dom libs=three
```html
<canvas class="viewer" aria-label="3D náhled kostky, otáčí se tažením myší"></canvas>
```
```css
body { margin: 0; background: #f8fafc; }
.viewer { display: block; width: 100%; height: 300px; cursor: grab; touch-action: none; }
```
```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('.viewer');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(3, 2, 4);

scene.add(new THREE.AmbientLight('#ffffff', 0.6));
const sun = new THREE.DirectionalLight('#ffffff', 2);
sun.position.set(3, 5, 2);
scene.add(sun);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1, 1),
  new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.5 }),
);
scene.add(box);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;     // setrvačnost po puštění myši
controls.maxPolarAngle = Math.PI / 2; // kamera nesjede pod podlahu

renderer.setAnimationLoop(() => {
  controls.update(); // s enableDamping povinné v každém snímku
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
:::

Táhni myší a zkus kolečkem přiblížit. Pak smaž řádek `controls.update()` — setrvačnost přestane fungovat, protože ji počítá právě `update`.

> [!PITFALL]
> **Tlačítka nad 3D pozadím nejdou kliknout.** Canvas přes celé okno zachytí všechna kliknutí, i když je průhledný. Oprava: `pointer-events: none` na canvasu pozadí. Pozor, u náhledu s `OrbitControls` naopak `pointer-events` vypnout nesmíš — ovládání by nedostalo žádnou událost.

:::check
Tvoje 3D pozadí má `pointer-events: none` a vedle něj chceš, aby se scéna natáčela za myší. Na čem budeš poslouchat `pointermove`?

### --expected--

window

### --accept--

document
document.body

### --why--

Canvas s `pointer-events: none` žádnou událost myši nedostane. Pohyb myši ale slyší `window` (nebo `document`) nad celou stránkou.

### --see--

web-3d-efekty/threejs-zaklady#canvas-za-obsahem-a-otaceni-mysi
:::

## Typické chyby a pasti

> [!PITFALL]
> **Canvas je prázdný, konzole mlčí.** Nejčastější příčiny: kamera stojí uvnitř objektu (zapomenuté `camera.position.z = 5`), `renderer.render` se nikdy nezavolá, nebo má plátno výšku 0, protože rodič nemá výšku a canvas `height: 100%` z nuly nic neudělá. Oprava: odsuň kameru, zkontroluj volání v smyčce a v DevTools velikost canvasu.

> [!PITFALL]
> **Objekt je černý.** `MeshStandardMaterial` (i `MeshPhysicalMaterial`, `MeshLambertMaterial`) bez světla. Oprava: přidej `AmbientLight` a `DirectionalLight`, nebo pro plochou barvu použij `MeshBasicMaterial`.

> [!PITFALL]
> **Na herním monitoru se všechno točí rychleji.** Pohyb v smyčce bez času snímku (`rotation.y += 0.01`). Oprava: `rotation.y += speed * delta` s `delta` z `Timer`.

> [!PITFALL]
> **Scéna je v náhledu nakreslená do malého čtverečku nebo vůbec.** Kód přečte `canvas.clientWidth` jen jednou při načtení, kdy stránka ještě nemusí mít rozvržení (šířka 0). Oprava: velikost nastavuj v obsluze `resize` nebo v `ResizeObserver`, ne jen jednou na začátku.

:::check
Kolega přečetl šířku okna jen jednou na začátku skriptu a v náhledu je canvas nakreslený v rozlišení 300 × 150 bodů, přestože zabírá celé okno. Co je výchozí velikost canvasu, kterou vidí?

### --expected--

300 × 150

### --accept--

300x150
300 x 150
300×150

### --why--

`<canvas>` bez nastavené velikosti kreslí 300 × 150 bodů. `setSize` se zavolal s nulovou šířkou (rozvržení ještě nebylo hotové), nebo vůbec, a CSS jen tenhle malý obraz roztáhlo. Proto se velikost nastavuje při každé změně.

### --see--

web-3d-efekty/threejs-zaklady#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) — co je `<canvas>` a proč má velikost v CSS a v pixelech zvlášť.
- [WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) — rozhraní, které Three.js ovládá za tebe.
- [Window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) — poměr fyzických a CSS pixelů a ukázka ostrého canvasu.
- [Window.requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — na čem stojí `setAnimationLoop` a proč se volá podle monitoru.

Příště z těchhle kousků složíš konfigurátor stolní lampy, kterou si zákazník otočí myší a přebarví.

# --questions--

## --question--

Kamera má `fov` 50 a stojí na `z = 5`. Kostku chceš na obrazovce dvakrát větší a perspektivu nechat stejnou. Co změníš?

### --answer--

`fov` na 100.

#### --why--

Větší zorný úhel ukáže víc scény, takže kostka bude naopak menší. A změna `fov` perspektivu mění.

### --correct--

Kameru přisunu blíž ke kostce.

#### --why--

Menší vzdálenost zvětší objekt a pohled zůstává stejný „objektiv". Přesný poměr závisí na velikosti kostky, ale směr je správný.

### --answer--

`camera.aspect` na dvojnásobek.

#### --why--

`aspect` je poměr šířky a výšky plátna. Když neodpovídá plátnu, obraz se jen zdeformuje do šířky.

### --see--

web-3d-efekty/threejs-zaklady#scena-kamera-a-renderer

## --question--

Napiš volání, které zastaví render smyčku spuštěnou přes `renderer.setAnimationLoop(tick)`.

### --expected--

renderer.setAnimationLoop(null)

### --why--

`setAnimationLoop` s `null` smyčku odpojí. Hodí se, když je scéna mimo obrazovku nebo když ji ze stránky odstraňuješ.

### --see--

web-3d-efekty/threejs-zaklady#render-loop-a-cas-snimku

## --question--

Na telefonu s `devicePixelRatio` 3 kreslí renderer s `setPixelRatio(window.devicePixelRatio)`. Kolikrát víc pixelů musí grafika spočítat než s poměrem 1?

### --expected--

9

### --accept--

9×
9x

### --why--

Poměr platí pro šířku i výšku: 3 × 3 = 9. Proto se poměr omezuje na 2 (4× víc než 1), na telefonu to znamená o dost chladnější a delší baterii.

### --see--

web-3d-efekty/threejs-zaklady#zmena-velikosti-platna
