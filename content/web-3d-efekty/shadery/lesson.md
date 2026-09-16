# Shadery: uniformy, gradienty a noise

:::check pretest
Fragment shader počítá barvu jednoho pixelu. Může si při tom přečíst, jakou barvu právě dostal pixel vedle?

### --answer--

Ano, přes proměnnou s barvou sousedního pixelu.

#### --why--

Tak by to fungovalo v cyklu na procesoru. Grafická karta ale počítá jinak — uvidíš v první části.

### --correct--

Ne, každý pixel se počítá zvlášť a naráz s ostatními.

#### --why--

Pixely se počítají paralelně, takže soused ještě žádnou barvu mít nemusí. Co z toho plyne pro psaní shaderů, vysvětlí první část.

### --answer--

Jen když se pixely počítají zleva doprava.

#### --why--

Pořadí nikdo nezaručuje, grafika počítá tisíce pixelů současně. Podrobnosti v první části.
:::

:::check pretest
V shaderu napíšeš `float brightness = 1;`. Co se stane?

### --answer--

Nic zvláštního, `1` se převede na `1.0`.

#### --why--

V JavaScriptu by to tak bylo. Jazyk shaderů je v číslech přísnější — ukáže to část o GLSL.

### --correct--

Shader se nezkompiluje a objekt se nevykreslí.

#### --why--

`1` je celé číslo a GLSL ho sám do `float` nepřevede. Jak zní hláška a kde ji najdeš, uvidíš v části o GLSL.

### --answer--

Jas se zaokrouhlí na celé číslo.

#### --why--

Zaokrouhlení by potřebovalo, aby kód vůbec prošel. Jak přísné GLSL je, ukáže část o GLSL.
:::

Pozadí webu Stripe nebo Linear, kde se barvy pomalu přelévají jako polární záře. Hero sekce, na které se za kurzorem vlní světlo. CSS gradient s animací se jen posouvá, organický pohyb neumí. A spočítat barvu dvou milionů pixelů 60× za sekundu v JavaScriptu na procesoru nestihneš.

Grafická karta to zvládne, protože má tisíce malých jader, která počítají současně. Program, který na nich běží, je [[shader]].

> [!REMEMBER]
> **Shader je malá funkce, kterou grafická karta spustí pro každý vrchol a pro každý pixel zvlášť a naráz. Pixel nevidí sousedy ani minulý snímek — všechno, co potřebuje, mu pošleš jako vstup: uniformy z JavaScriptu a varying z vertex shaderu.**

## Vertex a fragment shader

Každý materiál v Three.js jsou ve skutečnosti dva shadery:

- **[[vertex shader]]** — běží pro každý vrchol geometrie. Vrátí, kde vrchol leží na obrazovce (`gl_Position`). Tady se dá geometrie deformovat.
- **[[fragment shader]]** — běží pro každý pixel, který trojúhelníky zakryjí. Vrátí jeho barvu (`gl_FragColor` jako `vec4` s červenou, zelenou, modrou a průhledností od 0 do 1).

Vlastní shadery napíšeš přes `THREE.ShaderMaterial`. Three.js do nich samo doplní matice kamery (`projectionMatrix`, `modelViewMatrix`) a atributy geometrie (`position`, `uv`).

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 280px; }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;

const material = new THREE.ShaderMaterial({
  vertexShader: /* glsl */ `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    void main() {
      gl_FragColor = vec4(0.98, 0.45, 0.09, 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), material));

renderer.setAnimationLoop(() => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
:::

Zkus ve fragment shaderu změnit `vec4(0.98, 0.45, 0.09, 1.0)` na `vec4(0.2, 0.8, 0.5, 1.0)`. Pak ve vertex shaderu vyměň `vec4(position, 1.0)` za `vec4(position * 0.5, 1.0)` — obdélník se zmenší, protože se posunuly všechny vrcholy.

:::check
Chceš, aby se plocha vlnila jako vlajka. Do kterého shaderu napíšeš posun?

### --expected--

vertex shader

### --accept--

vertex
vertexShader
do vertex shaderu

### --why--

Tvar určují polohy vrcholů a ty počítá vertex shader. Fragment shader jen barví pixely uvnitř trojúhelníků, které už mají tvar hotový.

### --see--

web-3d-efekty/shadery#vertex-a-fragment-shader
:::

## GLSL minimum

Shadery se píšou v jazyce GLSL, který vypadá jako C. Pro začátek stačí pár věcí:

| typ | co drží | zápis |
|---|---|---|
| `float` | desetinné číslo | `float speed = 0.5;` |
| `int` | celé číslo | `int octaves = 5;` |
| `vec2`, `vec3`, `vec4` | 2, 3, 4 čísla (souřadnice, barvy) | `vec3 sand = vec3(0.85, 0.7, 0.5);` |

- **Desetinná tečka je povinná.** `1.0`, ne `1`. GLSL mezi `int` a `float` sám nepřevádí.
- Složky vektoru čteš přes `.x .y .z .w` nebo `.r .g .b .a`, i několik naráz: `color.rgb`, `uv.yx`.
- Matematika funguje po složkách: `vec3(0.2, 0.4, 0.6) * 2.0` je `vec3(0.4, 0.8, 1.2)`.
- Hotové funkce: `sin`, `cos`, `mix`, `smoothstep`, `clamp`, `fract`, `floor`, `length`, `distance`, `dot`.

:::live dom libs=three predict
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 240px; }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;

const material = new THREE.ShaderMaterial({
  vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    void main() {
      float green = 1;
      gl_FragColor = vec4(0.1, green, 0.4, 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), material));

renderer.setAnimationLoop(() => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
--question-- Ve fragment shaderu je `float green = 1;`. Co uvidíš v náhledu?
--option-- Zelený obdélník, `1` se převede na `1.0`.
--option-- Černý obdélník, protože `green` zůstane 0.
--option*-- Jen tmavé pozadí stránky, obdélník se nevykreslí vůbec.
--why-- GLSL celé číslo do `float` automaticky nepřevede, takže se fragment shader nezkompiluje. Three.js vypíše do konzole `THREE.WebGLProgram: Shader Error … ERROR: 0:57: '=' : cannot convert from 'const int' to 'highp float'` a objekt s tímhle materiálem přeskočí. Oprava: `float green = 1.0;`.
:::

Po odhalení otevři konzoli náhledu a najdi v hlášce řádek se šipkou `>` — to je místo chyby. Číslo řádku nesedí s tvým kódem, protože Three.js před shader přidá svoje definice. Pak chybu oprav na `1.0`.

> [!TIP]
> Komentář `/* glsl */` před šablonovým řetězcem nic nedělá, ale editory s rozšířením pro GLSL podle něj obarví kód shaderu.

:::check
Oprav řádek tak, aby se shader zkompiloval: `float glow = 2 * 0.5;`

### --expected--

float glow = 2.0 * 0.5;

### --accept--

float glow = 2. * 0.5;
float glow = 1.0;

### --why--

`2` je `int` a `0.5` je `float`. GLSL neumí násobit celé číslo desetinným, dokud jedno z nich výslovně nepřevedeš — stačí napsat `2.0`.

### --see--

web-3d-efekty/shadery#glsl-minimum
:::

## Uniformy: vstup z JavaScriptu

Shader sám neví, kolik je hodin, kde je myš ani jakou barvu má značka webu. Tyhle hodnoty mu posíláš jako [[uniforma|uniformy]] — proměnné, které jsou pro všechny vrcholy a pixely v jednom snímku stejné.

V JavaScriptu je předáš v `uniforms` materiálu jako objekty `{ value }`, v shaderu je deklaruješ se stejným jménem a typem:

```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#0ea5e9') },
  },
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorA;
    void main() { … }
  `,
});

// v render smyčce
material.uniforms.uTime.value = timer.getElapsed();
```

Předponu `u` používá většina kódu, abys na první pohled poznal, že hodnota přichází zvenku. Typy si odpovídají takto: číslo → `float`, `THREE.Vector2` → `vec2`, `THREE.Color` nebo `THREE.Vector3` → `vec3`.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 260px; --shader-speed: var(--speed); --shader-color: var(--color); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#f97316') },
  },
  vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    void main() {
      float pulse = 0.6 + 0.4 * sin(uTime * 3.0);
      gl_FragColor = vec4(uColor * pulse, 1.0);
      #include <colorspace_fragment>
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), material));

const timer = new THREE.Timer();
let time = 0;

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const styles = getComputedStyle(document.documentElement);
  time += timer.getDelta() * (Number(styles.getPropertyValue('--speed')) || 1);
  material.uniforms.uTime.value = time;
  material.uniforms.uColor.value.set(styles.getPropertyValue('--color').trim() || '#f97316');

  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
```
```controls
--speed: range(0, 3, 0.25) = 1 | Rychlost času
--color: select(#f97316, #22c55e, #6366f1) = #f97316 | Barva
```
:::

Rychlost 0 čas zastaví — pulzování stojí, i když se scéna dál kreslí. Shader nemá žádnou paměť, jen přepočítá stejný vzorec se stejným časem.

> [!PITFALL]
> **Uniformu v JavaScriptu měníš, ale v obraze se nic neděje a konzole mlčí.** Jméno v `uniforms` a deklarace v shaderu se liší (`uTime` × `utime`), nebo ji shader deklaruje, ale nepoužije a kompilátor ji zahodí. Three.js v tom případě nic nehlásí. Oprava: zkontroluj přesné jméno a typ v obou místech.

:::check
V `uniforms` máš `uMouse: { value: new THREE.Vector2() }`. Jak uniformu deklaruješ ve fragment shaderu?

### --expected--

uniform vec2 uMouse;

### --why--

`THREE.Vector2` odpovídá typu `vec2` a jméno musí být přesně stejné včetně velikosti písmen.

### --see--

web-3d-efekty/shadery#uniformy-vstup-z-javascriptu
:::

## Gradient: `varying vUv`, `mix` a `smoothstep`

Aby barva závisela na tom, **kde** pixel na ploše je, potřebuje fragment shader souřadnici. Každý vrchol `PlaneGeometry` má atribut `uv` — dvojici od `(0, 0)` vlevo dole po `(1, 1)` vpravo nahoře. Vertex shader ji předá dál přes [[varying]]: proměnnou, kterou grafická karta mezi vrcholy **plynule dopočítá** pro každý pixel.

```glsl
// vertex shader
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// fragment shader
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
}
```

Dvě funkce, ze kterých složíš skoro každý gradient:

- `mix(a, b, t)` — lineární smíchání: při `t = 0` vrátí `a`, při `t = 1` vrátí `b`, mezi tím poměr. Funguje i s barvami.
- `smoothstep(od, do, x)` — pod `od` vrátí 0, nad `do` vrátí 1 a mezi tím plynulý oblouk. Zúží přechod na jen část plochy.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #0f172a; }
.stage { display: block; width: 100%; height: 260px; --edge-start: var(--from); --edge-end: var(--to); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const material = new THREE.ShaderMaterial({
  uniforms: {
    uFrom: { value: 0 },
    uTo: { value: 1 },
    uColorA: { value: new THREE.Color('#1e3a8a') },
    uColorB: { value: new THREE.Color('#f472b6') },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uFrom;
    uniform float uTo;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    void main() {
      float t = smoothstep(uFrom, uTo, vUv.x);
      gl_FragColor = vec4(mix(uColorA, uColorB, t), 1.0);
      #include <colorspace_fragment>
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

renderer.setAnimationLoop(() => {
  const styles = getComputedStyle(document.documentElement);
  material.uniforms.uFrom.value = Number(styles.getPropertyValue('--from'));
  material.uniforms.uTo.value = Number(styles.getPropertyValue('--to'));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.render(scene, camera);
});
```
```controls
--from: range(0, 1, 0.05) = 0 | Začátek přechodu (smoothstep od)
--to: range(0, 1, 0.05) = 1 | Konec přechodu (smoothstep do)
```
:::

Dej začátek na 0.45 a konec na 0.55 — z pozvolného přechodu je ostrá hrana uprostřed. Plocha 2 × 2 s `gl_Position = vec4(position.xy, 0.0, 1.0)` vyplní celé plátno bez ohledu na kameru, k tomu se vrátíš u pozadí.

:::check
Jakou barvu vrátí `mix(vec3(0.0), vec3(1.0), 0.25)`?

### --expected--

vec3(0.25)

### --accept--

vec3(0.25, 0.25, 0.25)
0.25

### --why--

`mix` vezme 25 % cesty od černé k bílé v každé složce: `0.0 + (1.0 - 0.0) * 0.25 = 0.25`.

### --see--

web-3d-efekty/shadery#gradient-varying-vuv-mix-a-smoothstep
:::

## Vlnění vrcholů

Ve vertex shaderu můžeš polohu vrcholu před promítnutím změnit. Jen plocha musí mít **dost vrcholů** — `PlaneGeometry(2, 2)` má čtyři, a čtyři rohy se vlnit nedají. `PlaneGeometry(2, 2, 64, 64)` jich má přes čtyři tisíce.

```glsl
uniform float uTime;
varying float vWave;

void main() {
  vec3 moved = position;
  moved.z += sin(position.x * 4.0 + uTime * 2.0) * 0.15;
  vWave = moved.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(moved, 1.0);
}
```

Výšku vlny poslanou přes `varying` pak fragment shader použije k obarvení: hřebeny světlejší, údolí tmavší. Počet vlnek určuje číslo u `position.x`, výšku číslo za `sin`, rychlost číslo u `uTime`.

:::check
Plocha `PlaneGeometry(2, 2)` se i s vlnícím vertex shaderem jen celá naklání, místo aby se vlnila. Proč?

### --answer--

`sin` v GLSL nefunguje s časem.

#### --why--

`sin` funguje s jakýmkoli `float`. Podívej se, pro kolik bodů se vertex shader vůbec spouští.

### --correct--

Geometrie má jen čtyři rohové vrcholy, mezi kterými není co vlnit.

#### --why--

Vertex shader posouvá jen vrcholy a trojúhelníky mezi nimi zůstávají rovné. Pro vlnu potřebuješ dělení, třeba `PlaneGeometry(2, 2, 64, 64)`.

### --answer--

Posun musí být ve fragment shaderu.

#### --why--

Fragment shader tvar měnit neumí, jen barví pixely hotových trojúhelníků.

### --see--

web-3d-efekty/shadery#vlneni-vrcholu
:::

## Noise: náhoda, která plyne

Organický pohyb (mraky, kouř, polární záře) dělá [[noise]]: funkce, která pro každý bod plochy vrátí pseudonáhodné číslo 0 až 1, jenže **plynule** — sousední body mají podobnou hodnotu. Nemusíš ji psát sám, funkce se kopírují z osvědčených zdrojů. Tady jednoduchý „value noise":

```glsl
float random(vec2 point) {
  return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  float a = random(cell);
  float b = random(cell + vec2(1.0, 0.0));
  float c = random(cell + vec2(0.0, 1.0));
  float d = random(cell + vec2(1.0, 1.0));
  vec2 blend = local * local * (3.0 - 2.0 * local);
  return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
}
```

Jedna vrstva noise vypadá jako rozmazané skvrny. Přirozený vzhled dá **vrstvení** ([[fBm]], *fractal Brownian motion*): sečteš několik vrstev, každou s dvojnásobnou hustotou a poloviční silou. Hrubé tvary dají první vrstvy, jemné detaily ty další.

:::live dom libs=three
```html
<canvas class="stage"></canvas>
```
```css
body { margin: 0; background: #020617; }
.stage { display: block; width: 100%; height: 280px; --noise-layers: var(--octaves); }
```
```js
import * as THREE from 'three';

const canvas = document.querySelector('.stage');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uOctaves: { value: 5 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform int uOctaves;
    varying vec2 vUv;

    float random(vec2 point) {
      return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      float a = random(cell);
      float b = random(cell + vec2(1.0, 0.0));
      float c = random(cell + vec2(0.0, 1.0));
      float d = random(cell + vec2(1.0, 1.0));
      vec2 blend = local * local * (3.0 - 2.0 * local);
      return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
    }

    float fbm(vec2 point) {
      float value = 0.0;
      float strength = 0.5;
      for (int i = 0; i < 8; i++) {
        if (i >= uOctaves) break;
        value += strength * noise(point);
        point *= 2.0;
        strength *= 0.5;
      }
      return value;
    }

    void main() {
      float cloud = fbm(vUv * 4.0 + vec2(uTime * 0.15, uTime * 0.05));
      vec3 color = mix(vec3(0.02, 0.05, 0.2), vec3(0.3, 0.9, 0.7), cloud);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

const timer = new THREE.Timer();
renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  material.uniforms.uTime.value = timer.getElapsed();
  material.uniforms.uOctaves.value = Number(getComputedStyle(document.documentElement).getPropertyValue('--octaves')) || 1;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.render(scene, camera);
});
```
```controls
--octaves: range(1, 8, 1) = 5 | Počet vrstev noise
```
:::

Posouvej počet vrstev od 1 do 8. Po pěti vrstvách už rozdíl skoro nevidíš, ale grafika počítá každou vrstvu pro každý pixel — tady je místo, kde se šetří výkon.

:::check
fBm sčítá vrstvy noise. Jak se od jedné vrstvy k další mění hustota a síla?

### --answer--

Hustota i síla se zdvojnásobí.

#### --why--

Kdyby se síla zvyšovala, jemné detaily by přebily hrubé tvary a vznikl by šum jako na starém televizoru.

### --correct--

Hustota se zdvojnásobí a síla se sníží na polovinu.

#### --why--

Každá další vrstva přidá dvakrát jemnější detail s poloviční vahou, takže hrubý tvar zůstane čitelný a detaily ho jen zjemní.

### --answer--

Hustota zůstává, mění se jen posun v čase.

#### --why--

Se stejnou hustotou by vrstvy vypadaly podobně a výsledek by byl jen jedna rozmazaná vrstva.

### --see--

web-3d-efekty/shadery#noise-nahoda-ktera-plyne
:::

## Celoobrazovkové pozadí

Na pozadí stránky nepotřebuješ perspektivu ani kameru, která se pohybuje. Stačí plocha přes celé plátno:

1. `PlaneGeometry(2, 2)` — souřadnice vrcholů od −1 do 1, přesně rozsah obrazovky ve WebGL,
2. ve vertex shaderu `gl_Position = vec4(position.xy, 0.0, 1.0)` — žádné matice, plocha vždy vyplní plátno,
3. kamera jen proto, že ji `renderer.render` chce — třeba `new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)`.

`vUv` jde vždy od 0 do 1 v obou osách, i když je okno široké. Kruh by se proto roztáhl do elipsy. Když na tom záleží, pošli shaderu poměr stran jako uniformu a `vUv.x` jím vynásob.

Barvy z webu nechceš psát do shaderu natvrdo. Přečti je z CSS proměnných a pošli jako uniformy:

```js
const styles = getComputedStyle(document.documentElement);
material.uniforms.uColorA.value.set(styles.getPropertyValue('--brand-dark').trim());
```

`THREE.Color.set` přijme hex zápis, `rgb()` i `hsl()`. Novější zápisy jako `oklch()` nezná — pro proměnné, které čte shader, použij hex.

> [!PITFALL]
> **Barvy z CSS vypadají v shaderu tmavší a sytější než na zbytku stránky.** `THREE.Color` si barvu převede do lineárního prostoru, ve kterém Three.js počítá světlo. Vestavěné materiály ji před vykreslením vrátí do sRGB, tvůj `ShaderMaterial` ne. Oprava: na konec `main` ve fragment shaderu, za zápis `gl_FragColor`, přidej řádek `#include <colorspace_fragment>` — Three.js ho nahradí převodem do barevného prostoru rendereru.

:::check
Proč vertex shader celoobrazovkového pozadí nepotřebuje `projectionMatrix` a `modelViewMatrix`?

### --answer--

Protože pozadí používá `OrthographicCamera`, která matice nemá.

#### --why--

I ortografická kamera má projekční matici. Rozhodující je, v jakých souřadnicích už jsou vrcholy plochy.

### --correct--

Vrcholy plochy 2 × 2 už leží v rozsahu −1 až 1, což je přímo souřadnicový systém obrazovky.

#### --why--

`gl_Position` čeká polohu v rozsahu −1 až 1 na obou osách. Plocha 2 × 2 kolem středu tam leží celá, takže ji stačí předat beze změny.

### --answer--

Matice se počítají automaticky i bez zápisu.

#### --why--

Automaticky se matice jen do shaderu doplní jako uniformy. Jestli se použijí, rozhoduje kód, a tady nejsou potřeba.

### --see--

web-3d-efekty/shadery#celoobrazovkove-pozadi
:::

## Výkon: fragment shader na 4K

Fragment shader běží pro **každý pixel v každém snímku**. Monitor 4K má přes 8 milionů pixelů, s pixel ratio 2 na MacBooku podobně. fBm s osmi vrstvami je tedy 8 × 8 milionů noise funkcí, 60× za sekundu.

Jak pozadí zlevnit, aniž by to bylo vidět:

- **Nižší rozlišení plátna.** Rozmazané barevné pozadí vypadá stejně i s `setPixelRatio(1)` nebo dokonce s plátnem v polovičním rozlišení roztaženým přes CSS.
- **Méně vrstev noise.** 4–5 stačí, další jsou pod hranicí viditelnosti.
- **Nekreslit, když nejde o nic.** Pauza mimo obrazovku, v kartě na pozadí a s omezeným pohybem — pomalu se měnící pozadí může stát úplně.
- **Nejvíc práce ve vertex shaderu**, když jde. Vrcholů je tisíce, pixelů miliony. Barva spočítaná pro vrchol a předaná přes `varying` se mezi vrcholy dopočítá zadarmo.

:::explain
Vysvětli vlastními slovy, proč fragment shader nemůže přečíst barvu sousedního pixelu a co z toho plyne pro to, jak shader píšeš.

## --model--

Grafická karta počítá fragment shader pro všechny pixely současně na tisících jader, takže soused v tu chvíli ještě žádnou výslednou barvu mít nemusí a pořadí nikdo nezaručuje. Každý pixel proto musí barvu spočítat jen ze svých vstupů: z polohy, z varying a z uniforem. Shader tak píšu jako vzorec „z polohy a času na barvu", ne jako postup, který si něco pamatuje nebo se dívá kolem.

## --checklist--

- Pixely se počítají paralelně, ne postupně.
- Soused výsledek ještě mít nemusí a pořadí není zaručené.
- Barva vzniká jen ze vstupů pixelu: poloha, varying, uniformy.
- Shader je vzorec bez paměti mezi pixely i snímky.
:::

:::check
Pozadí s fBm se na MacBooku seká, na notebooku s Full HD běží plynule. Co zkusíš jako první?

### --answer--

Přepsat noise do JavaScriptu, aby to počítal procesor.

#### --why--

Procesor by miliony pixelů za snímek nestihl vůbec. Grafika je na tuhle práci správné místo, jen jí dáváš moc pixelů.

### --correct--

Snížit pixel ratio plátna na 1 a ubrat vrstvy noise.

#### --why--

MacBook má pixel ratio 2, tedy čtyřikrát víc pixelů. Rozmazané pozadí v nižším rozlišení vypadá stejně a každá ubraná vrstva ušetří jeden výpočet noise na pixel.

### --answer--

Přidat `antialias: true` do rendereru.

#### --why--

Vyhlazování hran práci naopak přidá, a plocha přes celé plátno žádné hrany k vyhlazení nemá.

### --see--

web-3d-efekty/shadery#vykon-fragment-shader-na-4k
:::

## Typické chyby a pasti

> [!PITFALL]
> **`cannot convert from 'const int' to 'highp float'`** a objekt se nevykreslí. Celé číslo tam, kde má být `float`: `float x = 1;`, `x * 2`, `pow(x, 2)`. Oprava: `1.0`, `2.0`.

> [!PITFALL]
> **`'vUv' : undeclared identifier`** ve fragment shaderu. Varying je deklarovaný jen ve vertex shaderu. Musí být v obou shaderech se stejným typem a jménem.

> [!PITFALL]
> **Pozadí je celé jednobarevné, i když shader počítá gradient z `vUv`.** Vertex shader nezapsal `vUv = uv;`, takže varying má všude 0. Kompilátor nic nehlásí.

> [!PITFALL]
> **Kruh v celoobrazovkovém pozadí je elipsa.** `vUv` jde od 0 do 1 v obou osách bez ohledu na poměr stran okna. Oprava: pošli poměr stran jako uniformu a vynásob jím `vUv.x` před výpočtem vzdálenosti.

:::check
Konzole hlásí `ERROR: 0:62: 'uColorB' : undeclared identifier`, přitom v `uniforms` materiálu `uColorB` je. Co chybí?

### --expected--

uniform vec3 uColorB;

### --accept--

deklarace uniformy v shaderu
uniform vec3 uColorB

### --why--

Objekt `uniforms` jen posílá hodnotu. Shader o ní ví, až když ji sám deklaruje řádkem `uniform vec3 uColorB;`.

### --see--

web-3d-efekty/shadery#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [GLSL shaders](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders) — vertex a fragment shader na jednoduché ukázce s Three.js.
- [WebGL model view projection](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection) — proč `gl_Position` leží v rozsahu −1 až 1 a co dělají matice.
- [Data in WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Data) — rozdíl mezi atributy, uniformami a varying.
- [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) — kolik stojí fragment shader na velkém plátně a jak ho zlevnit.

V následujícím labu z toho sám složíš animované gradientní pozadí stránky.

# --questions--

## --question--

Chceš, aby se gradient pozadí za kurzorem rozjasnil. Jak dostaneš polohu myši do fragment shaderu?

### --answer--

Fragment shader si ji přečte z `window` sám.

#### --why--

Shader běží na grafické kartě a o stránce, oknu ani událostech neví nic. Všechno zvenku musí dostat jako vstup.

### --correct--

Posluchač `pointermove` uloží polohu do uniformy typu `vec2`, kterou shader deklaruje.

#### --why--

Uniforma je jediná cesta, jak shaderu poslat hodnotu z JavaScriptu. Shader pak spočítá vzdálenost pixelu od myši.

### --answer--

Přes `varying`, který nastavíš v JavaScriptu.

#### --why--

`varying` posílá hodnotu z vertex shaderu do fragment shaderu. Z JavaScriptu se do něj zapsat nedá.

### --see--

web-3d-efekty/shadery#uniformy-vstup-z-javascriptu

## --question--

Napiš výraz v GLSL, který z `vUv.y` udělá hodnotu 0 v dolní polovině plochy a plynule přejde do 1 mezi 60 % a 80 % výšky.

### --expected--

smoothstep(0.6, 0.8, vUv.y)

### --why--

`smoothstep` pod první hranicí vrací 0, nad druhou 1 a mezi nimi plynulý přechod. Dolní polovina je pod 0.6, takže tam je 0.

### --see--

web-3d-efekty/shadery#gradient-varying-vuv-mix-a-smoothstep

## --question--

Pozadí má fBm s osmi vrstvami přes celé okno 2560 × 1440 s pixel ratio 1. Kolikrát se v jednom snímku zavolá funkce `noise`?

### --expected--

29491200

### --accept--

29 491 200
2560 * 1440 * 8

### --why--

Fragment shader běží pro každý pixel: 2560 × 1440 = 3 686 400 pixelů, v každém 8 vrstev noise, tedy přes 29 milionů volání za snímek. Proto se ubírají vrstvy a rozlišení.

### --see--

web-3d-efekty/shadery#vykon-fragment-shader-na-4k
