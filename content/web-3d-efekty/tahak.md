> [!REMEMBER]
> **Scéna, kamera, renderer a smyčka, která kreslí jen tehdy, když je na co koukat.** 3D je vylepšení: obsah zůstává v HTML, pod canvasem je záloha a omezený pohyb se respektuje.

## Kostra Three.js scény

```js
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 5;

scene.add(new THREE.AmbientLight('#ffffff', 0.4));
const sun = new THREE.DirectionalLight('#ffffff', 2);
sun.position.set(3, 5, 4);
scene.add(sun);

const timer = new THREE.Timer();
timer.connect(document);

function tick(time) {
  timer.update(time);
  mesh.rotation.y += 0.5 * timer.getDelta();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(tick);
```

## Změna velikosti

```js
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(container);
```

## Materiály a světla

| potřebuješ | použij |
|---|---|
| plochou barvu bez světla | `MeshBasicMaterial` |
| skutečný povrch | `MeshStandardMaterial` + světla (`roughness`, `metalness`) |
| leštěný kov | `metalness: 1` + `scene.environment` (např. `RoomEnvironment`) |
| světlo odevšad / ze směru / z bodu | `AmbientLight` / `DirectionalLight` / `PointLight` |
| průhlednou plochu viditelnou zespodu | `transparent: true`, `opacity`, `side: THREE.DoubleSide` |

## Myš, scroll a výběr objektu

```js
// souřadnice od -1 do 1, y nahoru
pointer.x = (event.clientX / width) * 2 - 1;
pointer.y = -(event.clientY / height) * 2 + 1;

// plynulý dojezd v každém snímku
value += (target - value) * 0.05;

// průběh sekce oknem 0 až 1
const progress = (innerHeight - rect.top) / (innerHeight + rect.height);

// na co myš ukazuje
raycaster.setFromCamera(pointer, camera);
const [hit] = raycaster.intersectObjects(group.children, true);
```

## Hodně objektů

| co kreslíš | objekt | draw calls |
|---|---|---|
| tisíce bodů (hvězdy, prach) | `Points` + `BufferGeometry` z `Float32Array` (3 čísla na bod) | 1 |
| stovky stejných 3D tvarů | `InstancedMesh` + `setMatrixAt` | 1 |
| pár různých objektů | `Mesh` | 1 na objekt |

Po změně dat: `geometry.attributes.position.needsUpdate = true`, u instancí `instanceMatrix.needsUpdate = true`.

## Shader

```js
const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#0ea5e9') } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(uColor * smoothstep(0.0, 1.0, vUv.y), 1.0);
      #include <colorspace_fragment>
    }
  `,
});
```

- `float x = 1.0;` — desetinná tečka povinná.
- `mix(a, b, t)` míchá, `smoothstep(od, do, x)` dělá plynulý přechod, fBm = vrstvy noise s dvojnásobnou hustotou a poloviční silou.
- Plocha `PlaneGeometry(2, 2)` a `gl_Position = vec4(position.xy, 0.0, 1.0)` vyplní celé plátno.

## Spline

```js
import { Application } from '@splinetool/runtime';

const observer = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  observer.disconnect();
  const app = new Application(canvas);
  try {
    await app.load('/scenes/produkt.splinecode');
  } catch {
    status.textContent = '3D model se nepodařilo načíst.';
    app.dispose();
    return;
  }
  stage.classList.add('is-loaded');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) app.stop();
  app.addEventListener('mouseDown', (event) => showDetail(event.target.name));
  app.findObjectByName('Kloboučky').color = '#334155';
  app.setVariable('podsviceni', true);
  app.emitEvent('mouseDown', 'Mezerník');
});
observer.observe(stage);
```

V Reactu: `const Spline = lazy(() => import('@splinetool/react-spline'))`, `<Suspense>` kolem a `<Spline scene="…" onLoad={…} onSplineMouseDown={…} />`.

## Výkon a přístupnost

- Pixel ratio nejvýš 2 (u pozadí klidně 1–1,5).
- Pauza mimo obrazovku (`IntersectionObserver`) a na skryté kartě (`Timer.connect(document)` nebo `visibilitychange`).
- Úklid: `setAnimationLoop(null)`, `dispose()` na geometriích, materiálech, texturách a rendereru.
- Omezený pohyb: `matchMedia('(prefers-reduced-motion: reduce)').matches` — nic se nehýbe samo, scéna zůstane vidět.
- Bez WebGL: `WebGL.isWebGL2Available()` a statické pozadí v CSS.
- Canvas pozadí: `position: fixed; inset: 0; pointer-events: none;` a `aria-hidden="true"`.

## Pasti

| příznak | příčina |
|---|---|
| prázdný canvas, konzole mlčí | kamera uvnitř objektu, chybí `render`, canvas bez výšky |
| černý objekt | `MeshStandardMaterial` bez světla, kov bez prostředí |
| roztažený obraz po změně okna | chybí `camera.updateProjectionMatrix()` |
| na 144Hz monitoru rychleji | pohyb bez času snímku |
| tlačítka pod pozadím nejdou kliknout | canvas bez `pointer-events: none` |
| `cannot convert from 'const int' to 'highp float'` | `1` místo `1.0` v shaderu |
| barvy shaderu tmavší než v CSS | chybí `#include <colorspace_fragment>` |
| scéna se načte hned i s observerem | callback bez kontroly `isIntersecting` |
| `Failed to fetch` u scény ze Splinu | scéna z cizího serveru, web offline |
| `Cannot set properties of undefined` u objektu ze Splinu | jiné jméno objektu nebo volání před `load` |
