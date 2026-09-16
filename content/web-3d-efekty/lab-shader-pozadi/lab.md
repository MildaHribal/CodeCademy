---
title: Animované gradientní pozadí
see: web-3d-efekty/shadery#celoobrazovkove-pozadi
---

# --description--

Studio Mlha chce na úvodní stránku pozadí, které se pomalu přelévá jako mlha v barvách studia a za kurzorem jemně prosvítá. Pozadí nesmí zpomalit telefon, obtěžovat lidi s omezeným pohybem ani rozbít stránku, když WebGL chybí.

Stránka s textem je hotová. Pozadí napíšeš sám do `main.js` a `styles.css` — shader, uniformy i to, jak ho šetříš. **Téma, texty, barvy i vzhled přelévání jsou tvoje volba**, klidně stránku přepiš na vlastní portfolio. Kontrola hlídá jen chování.

Kontrola pozadí najde přes dva exporty z `main.js`: `renderer` (kreslí do canvasu `.background`, s `preserveDrawingBuffer: true`) a `material` (`ShaderMaterial` pozadí). Uniformy se musí jmenovat `uTime`, `uMouse`, `uColorA` a `uColorB`, ať je kontrola najde.

Co má pozadí umět:

- Pozadí vyplní celé okno za textem, i po změně jeho velikosti, a nepřekáží klikání na odkazy.
- Čtečky obrazovky canvas přeskočí, je jen dekorace.
- Barvy se přelévají v gradientu, který se v čase pomalu mění, a vychází ze dvou barev v CSS proměnných `--bg-a` a `--bg-b`.
- Když uživatel pohne myší, shader dostane její polohu od 0 do 1 (vlevo dole 0, vpravo nahoře 1) a na pozadí to je znát.
- Na displeji s vysokou hustotou pozadí kreslí nejvýš s poměrem pixelů 1,5 — rozmazané barvy ostřejší být nemusí.
- S omezeným pohybem se čas pozadí zastaví, na skryté kartě taky.
- Bez WebGL zůstane pod canvasem CSS gradient ze stejných barev.
- Při odchodu ze stránky se kreslení zastaví a geometrie s materiálem se uvolní.

# --hints--

Canvas `.background` je přišpendlený přes celé okno.

```js
const canvas = document.querySelector('.background');
const style = getComputedStyle(canvas);
const rect = canvas.getBoundingClientRect();
assert.equal(style.position, 'fixed', 'canvas .background má mít position: fixed');
assert.ok(Math.abs(rect.width - window.innerWidth) < 2 && Math.abs(rect.height - window.innerHeight) < 2 && Math.abs(rect.top) < 1 && Math.abs(rect.left) < 1, `canvas .background má zabírat celé okno ${window.innerWidth} × ${window.innerHeight}, zabírá ${Math.round(rect.width)} × ${Math.round(rect.height)}`);
```

Odkaz na stránce jde nad pozadím kliknout.

```js
const link = document.querySelector('main a');
assert.ok(link, 'na stránce má zůstat aspoň jeden odkaz v main');
const rect = link.getBoundingClientRect();
const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
assert.ok(link.contains(hit), 'na středu odkazu má být navrchu odkaz, ne canvas pozadí');
```

Canvas je pro čtečky obrazovky skrytý (`aria-hidden="true"`).

```js
assert.equal(document.querySelector('.background').getAttribute('aria-hidden'), 'true', 'dekorativní canvas .background má mít aria-hidden="true"');
```

`main.js` exportuje `renderer` pro `.background` s `preserveDrawingBuffer` a `material` typu `ShaderMaterial`.

```js
const { renderer, material } = await helpers.importFile('main.js');
assert.ok(renderer?.isWebGLRenderer, 'main.js má exportovat renderer (WebGLRenderer)');
assert.equal(renderer.domElement, document.querySelector('.background'), 'renderer má kreslit do canvasu .background');
assert.equal(renderer.getContext().getContextAttributes().preserveDrawingBuffer, true, 'renderer potřebuje preserveDrawingBuffer: true');
assert.ok(material?.isShaderMaterial, 'main.js má exportovat material (ShaderMaterial)');
```

Plátno kreslí v rozlišení okna, i po změně okna na 800 × 600 px.

```js
await helpers.importFile('main.js');
const canvas = document.querySelector('.background');
const fits = () => Math.abs(canvas.width - window.innerWidth) <= 1 && Math.abs(canvas.height - window.innerHeight) <= 1;
await helpers.waitFor(fits).catch(() => {});
assert.ok(fits(), `plátno má kreslit v rozlišení okna ${window.innerWidth} × ${window.innerHeight}, kreslí ${canvas.width} × ${canvas.height}`);
await helpers.resize(800, 600);
await helpers.waitFor(fits).catch(() => {});
assert.ok(fits(), `po změně okna na 800 × 600 px má plátno kreslit v rozlišení ${window.innerWidth} × ${window.innerHeight}, kreslí ${canvas.width} × ${canvas.height}`);
```

Na displeji s `devicePixelRatio` 3 kreslí pozadí s poměrem pixelů nejvýš 1,5.

```js
const { renderer } = await helpers.importFile('main.js');
Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 3 });
await helpers.resize(900, 700);
await helpers.wait(100);
assert.ok(renderer.getPixelRatio() >= 1 && renderer.getPixelRatio() <= 1.5, `při devicePixelRatio 3 má pozadí kreslit s poměrem 1 až 1,5, kreslí s ${renderer.getPixelRatio()}`);
```

Pozadí není jednobarevné: rohy plátna mají různé barvy.

```js
const { renderer } = await helpers.importFile('main.js');
await helpers.waitFor(() => renderer.info.render.frame > 3).catch(() => {});
const gl = renderer.getContext();
const canvas = renderer.domElement;
const read = (x, y) => {
  const pixel = new Uint8Array(4);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return [...pixel];
};
const corners = [read(2, 2), read(canvas.width - 3, 2), read(2, canvas.height - 3), read(canvas.width - 3, canvas.height - 3)];
let biggest = 0;
for (const a of corners) for (const b of corners) biggest = Math.max(biggest, Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]));
assert.ok(biggest > 12, `rohy pozadí mají skoro stejnou barvu (${JSON.stringify(corners)}) — shader má kreslit gradient, ne jednu barvu`);
```

Uniformy `uColorA` a `uColorB` mají barvy z CSS proměnných `--bg-a` a `--bg-b` a shader je používá.

```js
const THREE = await import('three');
const { renderer, material } = await helpers.importFile('main.js');
await helpers.waitFor(() => renderer.info.render.frame > 1).catch(() => {});
const styles = getComputedStyle(document.documentElement);
for (const [uniform, variable] of [['uColorA', '--bg-a'], ['uColorB', '--bg-b']]) {
  const expected = new THREE.Color(styles.getPropertyValue(variable).trim()).getHexString();
  assert.equal(material?.uniforms?.[uniform]?.value?.getHexString?.(), expected, `uniforma ${uniform} má mít barvu z CSS proměnné ${variable} (#${expected})`);
}
const active = renderer.properties.get(material).currentProgram?.getUniforms().map ?? {};
assert.ok('uColorA' in active && 'uColorB' in active, 'shader má uColorA i uColorB deklarovat a použít — nepoužitou uniformu kompilátor zahodí');
```

Uniforma `uTime` v čase roste a shader ji používá.

```js
const { renderer, material } = await helpers.importFile('main.js');
assert.ok(material?.uniforms?.uTime, 'materiál má mít uniformu uTime');
await helpers.waitFor(() => renderer.info.render.frame > 1).catch(() => {});
const start = material.uniforms.uTime.value;
await helpers.waitFor(() => material.uniforms.uTime.value > start + 0.1).catch(() => {});
assert.ok(material.uniforms.uTime.value > start + 0.1, 'uTime má v každém snímku růst o čas snímku');
const active = renderer.properties.get(material).currentProgram?.getUniforms().map ?? {};
assert.ok('uTime' in active, 'shader má uTime deklarovat a použít');
```

Pohyb myši nastaví `uMouse` od 0 do 1 (vpravo nahoře 1, 1; vlevo dole 0, 0) a shader ji používá.

```js
const { renderer, material } = await helpers.importFile('main.js');
const mouse = material?.uniforms?.uMouse?.value;
assert.ok(mouse, 'materiál má mít uniformu uMouse');
document.body.dispatchEvent(new PointerEvent('pointermove', { clientX: window.innerWidth - 1, clientY: 0, bubbles: true }));
await helpers.flush();
assert.ok(mouse.x > 0.95 && mouse.y > 0.95, `myš v pravém horním rohu má dát uMouse ≈ (1, 1), je (${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)})`);
document.body.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY: window.innerHeight - 1, bubbles: true }));
await helpers.flush();
assert.ok(mouse.x < 0.05 && mouse.y < 0.05, `myš v levém dolním rohu má dát uMouse ≈ (0, 0), je (${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)})`);
await helpers.waitFor(() => renderer.info.render.frame > 1).catch(() => {});
const active = renderer.properties.get(material).currentProgram?.getUniforms().map ?? {};
assert.ok('uMouse' in active, 'shader má uMouse deklarovat a použít, jinak na pozadí pohyb myši znát není');
```

S omezeným pohybem se `uTime` nemění.

```js
const { material } = await helpers.importFile('main.js');
assert.ok(material?.uniforms?.uTime, 'materiál má mít uniformu uTime');
const matches = Object.getOwnPropertyDescriptor(MediaQueryList.prototype, 'matches');
Object.defineProperty(MediaQueryList.prototype, 'matches', { configurable: true, get() { return /prefers-reduced-motion:\s*reduce/.test(this.media) || matches.get.call(this); } });
await helpers.wait(100);
const start = material.uniforms.uTime.value;
await helpers.wait(400);
const end = material.uniforms.uTime.value;
Object.defineProperty(MediaQueryList.prototype, 'matches', matches);
assert.ok(Math.abs(end - start) < 0.001, `s omezeným pohybem se má čas pozadí zastavit, uTime se změnil o ${(end - start).toFixed(3)}`);
```

Na skryté kartě se `uTime` nemění.

```js
const { material } = await helpers.importFile('main.js');
assert.ok(material?.uniforms?.uTime, 'materiál má mít uniformu uTime');
await helpers.wait(100);
Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
document.dispatchEvent(new Event('visibilitychange'));
await helpers.wait(50);
const start = material.uniforms.uTime.value;
await helpers.wait(400);
assert.ok(Math.abs(material.uniforms.uTime.value - start) < 0.001, 'na skryté kartě se má čas pozadí zastavit (zastav smyčku, nebo připoj Timer k dokumentu)');
```

Pod canvasem je CSS gradient pro případ, že WebGL chybí.

```js
const images = [document.documentElement, document.body].map((element) => getComputedStyle(element).backgroundImage);
assert.ok(images.some((image) => /gradient/.test(image)), 'html nebo body má mít pozadí s CSS gradientem jako zálohu bez WebGL');
```

Při `pagehide` se kreslení zastaví a geometrie s materiálem se uvolní.

```js
const { renderer, material } = await helpers.importFile('main.js');
assert.ok(material, 'main.js má exportovat material');
await helpers.waitFor(() => renderer.info.render.frame > 2).catch(() => {});
let materialDisposed = false;
material.addEventListener('dispose', () => { materialDisposed = true; });
window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
await helpers.wait(50);
const frames = renderer.info.render.frame;
await helpers.wait(250);
assert.equal(renderer.info.render.frame, frames, 'po pagehide se má kreslení zastavit');
assert.ok(materialDisposed, 'po pagehide se má uvolnit materiál (material.dispose())');
assert.equal(renderer.info.memory.geometries, 0, 'po pagehide se má uvolnit i geometrie pozadí');
```

# --help--

## --tip--

Kostru celoobrazovkové plochy, uniformy z CSS a převod barev najdeš v částech [Celoobrazovkové pozadí](see:web-3d-efekty/shadery#celoobrazovkove-pozadi) a [Uniformy: vstup z JavaScriptu](see:web-3d-efekty/shadery#uniformy-vstup-z-javascriptu). Pauzy a úklid jsou ve [Výkon: kreslit méně a jen když je na co koukat](see:web-3d-efekty/interakce-a-castice#vykon-kreslit-mene-a-jen-kdyz-je-na-co-koukat).

## --tip--

Pro `uMouse` od 0 do 1 dělíš polohu myši velikostí okna. Na ose y myš roste dolů, kdežto `vUv` nahoru — hodnotu proto odečti od jedničky.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Studio Mlha — ilustrace a motion design</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <canvas class="background"></canvas>
    <main class="page">
      <p class="page__eyebrow">Ilustrace · motion design · Brno</p>
      <h1 class="page__title">Studio Mlha</h1>
      <p class="page__text">Kreslíme obaly desek, plakáty festivalů a animované úvody pro youtubové kanály. Každý projekt začíná skicou tužkou.</p>
      <a class="page__button" href="#portfolio">Prohlédnout portfolio</a>
    </main>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  /* Barvy pozadí — shader si je přečte odsud */
  --bg-a: #0b1026;
  --bg-b: #6d28d9;
  --color-text: #f5f3ff;
  --color-accent: #fbbf24;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--color-text);
}

body {
  margin: 0;
  min-height: 100svh;
}

.page {
  position: relative;
  max-width: 40rem;
  padding: 18vh 1.5rem 4rem;
}

.page__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.page__title {
  margin: 1rem 0;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 0.95;
}

.page__text {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.85;
}

.page__button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  background: var(--color-text);
  color: #1e1b4b;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s;
}

.page__button:hover {
  transform: translateY(-2px);
}

.page__button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```

## --file-- main.js

```js
import * as THREE from 'three';

// Kontrola najde pozadí přes tyhle dva exporty:
// export const renderer = …  (WebGLRenderer do canvasu .background)
// export const material = …  (ShaderMaterial pozadí)
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Studio Mlha — ilustrace a motion design</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <canvas class="background" aria-hidden="true"></canvas>
    <main class="page">
      <p class="page__eyebrow">Ilustrace · motion design · Brno</p>
      <h1 class="page__title">Studio Mlha</h1>
      <p class="page__text">Kreslíme obaly desek, plakáty festivalů a animované úvody pro youtubové kanály. Každý projekt začíná skicou tužkou.</p>
      <a class="page__button" href="#portfolio">Prohlédnout portfolio</a>
    </main>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  /* Barvy pozadí — shader si je přečte odsud */
  --bg-a: #0b1026;
  --bg-b: #6d28d9;
  --color-text: #f5f3ff;
  --color-accent: #fbbf24;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--color-text);
}

body {
  margin: 0;
  min-height: 100svh;
  /* Záloha bez WebGL: stejné barvy jako shader */
  background: linear-gradient(135deg, var(--bg-a), var(--bg-b));
}

.background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.page {
  position: relative;
  max-width: 40rem;
  padding: 18vh 1.5rem 4rem;
}

.page__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.page__title {
  margin: 1rem 0;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 0.95;
}

.page__text {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.85;
}

.page__button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  background: var(--color-text);
  color: #1e1b4b;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s;
}

.page__button:hover {
  transform: translateY(-2px);
}

.page__button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```

## --file-- main.js

```js
import * as THREE from 'three';

const canvas = document.querySelector('.background');
const styles = getComputedStyle(document.documentElement);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, preserveDrawingBuffer: true });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uColorA: { value: new THREE.Color(styles.getPropertyValue('--bg-a').trim()) },
    uColorB: { value: new THREE.Color(styles.getPropertyValue('--bg-b').trim()) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uAspect;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
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
      for (int i = 0; i < 5; i++) {
        value += strength * noise(point);
        point *= 2.0;
        strength *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 point = vec2(vUv.x * uAspect, vUv.y);
      float flow = fbm(point * 2.5 + vec2(uTime * 0.05, uTime * 0.03));
      float gradient = smoothstep(0.15, 0.95, vUv.y * 0.7 + flow * 0.6);

      vec2 mouse = vec2(uMouse.x * uAspect, uMouse.y);
      float glow = 1.0 - smoothstep(0.0, 0.45, distance(point, mouse));

      vec3 color = mix(uColorA, uColorB, gradient) + glow * 0.06;
      gl_FragColor = vec4(color, 1.0);
      #include <colorspace_fragment>
    }
  `,
});

const background = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(background);

window.addEventListener('pointermove', (event) => {
  material.uniforms.uMouse.value.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
});

function resize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  material.uniforms.uAspect.value = window.innerWidth / Math.max(window.innerHeight, 1);
}
window.addEventListener('resize', resize);
resize();

const timer = new THREE.Timer();
timer.connect(document);

function tick(time) {
  timer.update(time);
  if (!reducedMotion.matches) {
    material.uniforms.uTime.value += timer.getDelta();
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(tick);

document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : tick);
});

window.addEventListener('pagehide', () => {
  renderer.setAnimationLoop(null);
  background.geometry.dispose();
  material.dispose();
  renderer.dispose();
});
```

# --approaches--

## --approach-- Gradient a noise ve fragment shaderu

Plocha má jen čtyři vrcholy a veškerá práce běží pro každý pixel: fBm, gradient i záře kolem myši. Dá nejjemnější výsledek (skutečný noise v každém bodě), ale na velkém displeji je nejdražší — proto strop pixel ratio.

### --file-- main.js

```js
import * as THREE from 'three';

const canvas = document.querySelector('.background');
const styles = getComputedStyle(document.documentElement);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, preserveDrawingBuffer: true });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uColorA: { value: new THREE.Color(styles.getPropertyValue('--bg-a').trim()) },
    uColorB: { value: new THREE.Color(styles.getPropertyValue('--bg-b').trim()) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uAspect;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
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
      for (int i = 0; i < 5; i++) {
        value += strength * noise(point);
        point *= 2.0;
        strength *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 point = vec2(vUv.x * uAspect, vUv.y);
      float flow = fbm(point * 2.5 + vec2(uTime * 0.05, uTime * 0.03));
      float gradient = smoothstep(0.15, 0.95, vUv.y * 0.7 + flow * 0.6);

      vec2 mouse = vec2(uMouse.x * uAspect, uMouse.y);
      float glow = 1.0 - smoothstep(0.0, 0.45, distance(point, mouse));

      vec3 color = mix(uColorA, uColorB, gradient) + glow * 0.06;
      gl_FragColor = vec4(color, 1.0);
      #include <colorspace_fragment>
    }
  `,
});

const background = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(background);

window.addEventListener('pointermove', (event) => {
  material.uniforms.uMouse.value.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
});

function resize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  material.uniforms.uAspect.value = window.innerWidth / Math.max(window.innerHeight, 1);
}
window.addEventListener('resize', resize);
resize();

const timer = new THREE.Timer();
timer.connect(document);

function tick(time) {
  timer.update(time);
  if (!reducedMotion.matches) {
    material.uniforms.uTime.value += timer.getDelta();
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(tick);

document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : tick);
});

window.addEventListener('pagehide', () => {
  renderer.setAnimationLoop(null);
  background.geometry.dispose();
  material.dispose();
  renderer.dispose();
});
```

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Studio Mlha — ilustrace a motion design</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <canvas class="background" aria-hidden="true"></canvas>
    <main class="page">
      <p class="page__eyebrow">Ilustrace · motion design · Brno</p>
      <h1 class="page__title">Studio Mlha</h1>
      <p class="page__text">Kreslíme obaly desek, plakáty festivalů a animované úvody pro youtubové kanály. Každý projekt začíná skicou tužkou.</p>
      <a class="page__button" href="#portfolio">Prohlédnout portfolio</a>
    </main>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
:root {
  /* Barvy pozadí — shader si je přečte odsud */
  --bg-a: #0b1026;
  --bg-b: #6d28d9;
  --color-text: #f5f3ff;
  --color-accent: #fbbf24;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--color-text);
}

body {
  margin: 0;
  min-height: 100svh;
  /* Záloha bez WebGL: stejné barvy jako shader */
  background: linear-gradient(135deg, var(--bg-a), var(--bg-b));
}

.background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.page {
  position: relative;
  max-width: 40rem;
  padding: 18vh 1.5rem 4rem;
}

.page__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.page__title {
  margin: 1rem 0;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 0.95;
}

.page__text {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.85;
}

.page__button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  background: var(--color-text);
  color: #1e1b4b;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s;
}

.page__button:hover {
  transform: translateY(-2px);
}

.page__button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```

## --approach-- Barva spočítaná ve vrcholech

Hustá síť 96 × 96 dílků a vlnění i vliv myši počítá vertex shader pro necelých deset tisíc vrcholů. Fragment shader jen smíchá dvě barvy podle hodnoty, kterou grafika mezi vrcholy dopočítala. Je výrazně levnější a na rozmazané pozadí stačí, jen jemné detaily noise v síti nevzniknou.

### --file-- main.js

```js
import * as THREE from 'three';

const canvas = document.querySelector('.background');
const styles = getComputedStyle(document.documentElement);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, preserveDrawingBuffer: true });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: new THREE.Color(styles.getPropertyValue('--bg-a').trim()) },
    uColorB: { value: new THREE.Color(styles.getPropertyValue('--bg-b').trim()) },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform vec2 uMouse;
    varying float vMix;

    void main() {
      vec2 uvPoint = position.xy * 0.5 + 0.5;
      float wave = sin(uvPoint.x * 5.0 + uTime * 0.4) * cos(uvPoint.y * 4.0 - uTime * 0.3);
      float nearMouse = 1.0 - smoothstep(0.0, 0.5, distance(uvPoint, uMouse));
      vMix = clamp(uvPoint.y * 0.8 + wave * 0.2 + nearMouse * 0.25, 0.0, 1.0);

      vec2 warped = position.xy + vec2(wave, -wave) * 0.03;
      gl_Position = vec4(warped, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vMix;

    void main() {
      gl_FragColor = vec4(mix(uColorA, uColorB, vMix), 1.0);
      #include <colorspace_fragment>
    }
  `,
});

// Hustá síť vrcholů: barvu počítá vertex shader a mezi vrcholy ji dopočítá grafika
const background = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2, 96, 96), material);
scene.add(background);

window.addEventListener('pointermove', (event) => {
  material.uniforms.uMouse.value.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
});

function resize() {
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}
window.addEventListener('resize', resize);
resize();

const timer = new THREE.Timer();
timer.connect(document);

renderer.setAnimationLoop((time) => {
  timer.update(time);
  if (!reducedMotion.matches) material.uniforms.uTime.value += timer.getDelta();
  renderer.render(scene, camera);
});

window.addEventListener('pagehide', () => {
  renderer.setAnimationLoop(null);
  background.geometry.dispose();
  material.dispose();
  renderer.dispose();
});
```

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Studio Mlha — ilustrace a motion design</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <canvas class="background" aria-hidden="true"></canvas>
    <main class="page">
      <p class="page__eyebrow">Ilustrace · motion design · Brno</p>
      <h1 class="page__title">Studio Mlha</h1>
      <p class="page__text">Kreslíme obaly desek, plakáty festivalů a animované úvody pro youtubové kanály. Každý projekt začíná skicou tužkou.</p>
      <a class="page__button" href="#portfolio">Prohlédnout portfolio</a>
    </main>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
:root {
  /* Barvy pozadí — shader si je přečte odsud */
  --bg-a: #0b1026;
  --bg-b: #6d28d9;
  --color-text: #f5f3ff;
  --color-accent: #fbbf24;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--color-text);
}

body {
  margin: 0;
  min-height: 100svh;
  /* Záloha bez WebGL: stejné barvy jako shader */
  background: linear-gradient(135deg, var(--bg-a), var(--bg-b));
}

.background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.page {
  position: relative;
  max-width: 40rem;
  padding: 18vh 1.5rem 4rem;
}

.page__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.page__title {
  margin: 1rem 0;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 0.95;
}

.page__text {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.85;
}

.page__button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  background: var(--color-text);
  color: #1e1b4b;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s;
}

.page__button:hover {
  transform: translateY(-2px);
}

.page__button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```

# --review--

Testy kontrolují chování. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Pozadí na telefonu nezahřeje ruku: zkus v DevTools zpomalit procesor a sleduj, jestli se scroll netrhá.
- Text nad pozadím má dostatečný kontrast ve všech místech přelévání, i kolem záře u myši.
- Pohyb je pomalý a klidný — pozadí nemá odvádět pozornost od obsahu.
- Barvy shaderu a CSS zálohy vypadají stejně (bez `#include <colorspace_fragment>` by shader byl tmavší).
- Shader je čitelný: uniformy mají předponu `u`, varying `v` a magická čísla mají jméno nebo komentář.

## --extensions--

Rozšíření bez testů: přechod barev při scrollu stránky (třetí barva dole), jiná paleta pro tmavý a světlý režim přes `prefers-color-scheme`, nebo pozadí jen za hero sekcí s pauzou mimo obrazovku.
