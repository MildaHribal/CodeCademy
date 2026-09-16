---
title: Spline v Reactu
runtime: react
see: web-3d-efekty/spline#spline-v-reactu
---

# --description--

Studio Klapka přepisuje web do Reactu. Produktová stránka s klávesnicí K75 je v `App.jsx` hotová jako statické JSX: náhradní obrázek, panel s popisem a tlačítka, která zatím nic nedělají. Scénu ze Splinu do ní vložíš sám, tentokrát přes komponentu.

Soubor `react-spline.jsx` je offline náhrada balíčku `@splinetool/react-spline` se stejnými props (`scene`, `onLoad`, `onSplineMouseDown`…), `spline-runtime.js` je náhradní runtime z workshopu. Oba neupravuj. Scéna se jmenuje `./klapka-k75.splinecode`.

Vycházej z toho, co umíš z workshopu, a přelož to do Reactu: stav místo tříd, props místo `addEventListener`. Jak kód rozdělíš (vlastní hook, komponenta pro scénu, ref nebo stav pro aplikaci), je tvoje volba.

Co má stránka umět:

- Kód komponenty scény se stáhne zvlášť, až když je potřeba, a během čekání je místo něj vidět náhradní obrázek.
- Scéna se začne načítat, až sekce `.explore__stage` vjede do okna.
- Scéna kreslí do plochy `.explore__stage` přes celou plochu (wrapper komponenty dostane třídu `explore__canvas`).
- Náhradní obrázek zmizí (`.explore__stage` dostane `is-loaded`), až je scéna načtená.
- Tlačítka barev a podsvícení jsou do načtení scény vypnutá.
- Klik na knoflík, mezerník, Esc nebo Enter ve scéně ukáže v panelu jméno části a její text z `parts`. Klik jinam panel nezmění.
- Tlačítka barev přebarví objekt „Kloboučky kláves" a stisknuté je jen vybrané.
- Tlačítko Podsvícení přepíná proměnnou scény `podsviceni` a jeho `aria-pressed`.
- S omezeným pohybem se scéna po načtení zastaví, bez něj ne.
- V okně užším než 641 px se scéna nenačte, zůstane obrázek a `.explore__status` vysvětlí proč.

# --hints--

Komponenta scény se načítá líně přes `lazy` a dynamický import a je obalená do `Suspense`.

```js
const source = helpers.stripComments(files['App.jsx'], 'js');
assert.doesNotMatch(source, /import\s+[\w{}\s,]+\s+from\s+['"]\.\/react-spline/, 'react-spline.jsx nenačítej statickým importem nahoře — stáhl by se hned s aplikací');
assert.match(source, /lazy\s*\(\s*(async\s*)?\(\s*\)\s*=>\s*import\s*\(\s*['"]\.\/react-spline(\.jsx)?['"]\s*\)\s*\)/, 'komponentu scény načti přes lazy(() => import(\'./react-spline.jsx\'))');
assert.match(source, /<Suspense[\s>]/, 'líná komponenta potřebuje nad sebou <Suspense>');
```

Dokud sekce se scénou není v okně, žádná scéna nevznikne a náhradní obrázek je vidět.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
await helpers.wait(300);
assert.equal(Application.course.instances.length, 0, 'dokud .explore__stage není v okně, nemá vzniknout žádná scéna');
assert.ok(!document.querySelector('.explore__stage').classList.contains('is-loaded'), 'před načtením nemá .explore__stage mít is-loaded');
```

Po vjezdu sekce do okna se načte scéna `./klapka-k75.splinecode` přes celou plochu a obrázek zmizí.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
const stage = document.querySelector('.explore__stage');
stage.scrollIntoView();
await helpers.waitFor(() => stage.classList.contains('is-loaded'), 4000).catch(() => {});
assert.ok(stage.classList.contains('is-loaded'), 'po načtení scény má .explore__stage dostat třídu is-loaded');
assert.ok(!Application.course.log.some((entry) => entry.method === 'stop'), 'bez omezeného pohybu se scéna nemá zastavovat');
const load = Application.course.log.find((entry) => entry.method === 'load');
assert.match(String(load?.args[0]), /(^|\/)klapka-k75\.splinecode$/, 'scéna se má načíst z ./klapka-k75.splinecode');
const canvas = stage.querySelector('canvas');
assert.ok(canvas, 'canvas scény má být uvnitř .explore__stage');
const stageRect = stage.getBoundingClientRect();
const canvasRect = canvas.getBoundingClientRect();
assert.ok(Math.abs(stageRect.width - canvasRect.width) < 2 && Math.abs(stageRect.height - canvasRect.height) < 2, `canvas scény má zabírat celou plochu (${Math.round(stageRect.width)} × ${Math.round(stageRect.height)}), zabírá ${Math.round(canvasRect.width)} × ${Math.round(canvasRect.height)}`);
```

Tlačítka barev a podsvícení jsou vypnutá, dokud se scéna nenačte.

```js
const buttons = () => [...document.querySelectorAll('.swatch, .backlight')];
assert.equal(buttons().length, 4, 'na stránce mají zůstat tři tlačítka barev a tlačítko Podsvícení');
assert.ok(buttons().every((button) => button.disabled), 'před načtením scény mají být tlačítka vypnutá');
const stage = document.querySelector('.explore__stage');
stage.scrollIntoView();
await helpers.waitFor(() => stage.classList.contains('is-loaded'), 4000).catch(() => {});
await helpers.flush();
assert.ok(buttons().every((button) => !button.disabled), 'po načtení scény mají být tlačítka zapnutá');
```

Klik ve scéně na Otočný knoflík ukáže v panelu jeho jméno a text, klik na část bez popisu panel nezmění.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
const stage = document.querySelector('.explore__stage');
stage.scrollIntoView();
await helpers.waitFor(() => stage.classList.contains('is-loaded'), 4000).catch(() => {});
const app = Application.course.instances.at(-1);
assert.ok(app, 'scéna se má načíst');
Application.course.simulate(app, 'mouseDown', 'Otočný knoflík');
await helpers.flush();
assert.equal(document.querySelector('.explore__info-title').textContent.trim(), 'Otočný knoflík', 'po kliknutí na Otočný knoflík má nadpis panelu být „Otočný knoflík"');
assert.match(document.querySelector('.explore__info-text').textContent, /Frézovaný hliník/, 'po kliknutí na Otočný knoflík má panel ukázat jeho text');
Application.course.simulate(app, 'mouseDown', 'Klávesa Q');
await helpers.flush();
assert.equal(document.querySelector('.explore__info-title').textContent.trim(), 'Otočný knoflík', 'klik na Klávesa Q (nemá popis) nemá panel změnit');
```

Tlačítka barev přebarví kloboučky a stisknuté je jen vybrané.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
const stage = document.querySelector('.explore__stage');
stage.scrollIntoView();
await helpers.waitFor(() => stage.classList.contains('is-loaded'), 4000).catch(() => {});
await helpers.flush();
const app = Application.course.instances.at(-1);
assert.ok(app, 'scéna se má načíst');
const swatches = [...document.querySelectorAll('.swatch')];
await helpers.click(swatches[2]);
await helpers.flush();
assert.equal(app.findObjectByName('Kloboučky kláves').color, '#99f6e4', 'po kliknutí na Mátová mají mít kloboučky barvu #99f6e4');
assert.deepEqual([...document.querySelectorAll('.swatch')].map((swatch) => swatch.getAttribute('aria-pressed')), ['false', 'false', 'true'], 'stisknuté má být jen tlačítko Mátová');
await helpers.click(document.querySelectorAll('.swatch')[1]);
await helpers.flush();
assert.equal(app.findObjectByName('Kloboučky kláves').color, '#334155', 'po kliknutí na Grafitová mají mít kloboučky barvu #334155');
```

Tlačítko Podsvícení přepíná proměnnou scény `podsviceni` a `aria-pressed`.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
const stage = document.querySelector('.explore__stage');
stage.scrollIntoView();
await helpers.waitFor(() => stage.classList.contains('is-loaded'), 4000).catch(() => {});
await helpers.flush();
const app = Application.course.instances.at(-1);
assert.ok(app, 'scéna se má načíst');
await helpers.click(document.querySelector('.backlight'));
await helpers.flush();
assert.equal(app.getVariable('podsviceni'), true, 'po kliknutí na Podsvícení má být proměnná podsviceni true');
assert.equal(document.querySelector('.backlight').getAttribute('aria-pressed'), 'true', 'zapnuté podsvícení má aria-pressed="true"');
await helpers.click(document.querySelector('.backlight'));
await helpers.flush();
assert.equal(app.getVariable('podsviceni'), false, 'po druhém kliknutí má být podsviceni false');
assert.equal(document.querySelector('.backlight').getAttribute('aria-pressed'), 'false', 'vypnuté podsvícení má aria-pressed="false"');
```

S omezeným pohybem se scéna po načtení zastaví, bez něj ne.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
const matches = Object.getOwnPropertyDescriptor(MediaQueryList.prototype, 'matches');
Object.defineProperty(MediaQueryList.prototype, 'matches', { configurable: true, get() { return /prefers-reduced-motion:\s*reduce/.test(this.media) || matches.get.call(this); } });
try {
  const stage = document.querySelector('.explore__stage');
  stage.scrollIntoView();
  await helpers.waitFor(() => stage.classList.contains('is-loaded'), 4000).catch(() => {});
  await helpers.waitFor(() => Application.course.log.some((entry) => entry.method === 'stop')).catch(() => {});
  assert.ok(Application.course.log.some((entry) => entry.method === 'stop'), 's omezeným pohybem se má po načtení zavolat stop() na aplikaci z onLoad');
} finally {
  Object.defineProperty(MediaQueryList.prototype, 'matches', matches);
}
```

V okně širokém 375 px se scéna nenačte a stavový řádek vysvětlí proč.

```js
const { Application } = await helpers.importFile('spline-runtime.js');
await helpers.resize(375, 800);
const stage = document.querySelector('.explore__stage');
stage.scrollIntoView();
const status = document.querySelector('.explore__status');
await helpers.waitFor(() => status.textContent.trim().length > 0, 3000).catch(() => {});
await helpers.wait(200);
assert.equal(Application.course.instances.length, 0, 'v okně širokém 375 px nemá vzniknout žádná scéna');
assert.ok(status.textContent.trim().length > 0, 'v úzkém okně má .explore__status vysvětlit, proč je vidět jen obrázek');
```

# --help--

## --tip--

Komponentu, `onLoad` a `lazy` se `Suspense` ukazuje část [Spline v Reactu](see:web-3d-efekty/spline#spline-v-reactu). Sledování prvku v Reactu je efekt s úklidem z [lekce o useEffect](see:react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi) a ref na prvek z [lekce o useRef](see:react-hloubka/useref-a-dom#ref-na-prvek-fokus-scroll-a-mereni).

## --tip--

Aplikaci z `onLoad` potřebuješ v obsluze tlačítek. Buď si ji ulož do `useRef` a scénu měň přímo v obsluze kliknutí, nebo do stavu a scénu synchronizuj efektem, který se spustí po každé změně volby.

# --seed--

## --file-- App.jsx

```jsx
// Popisky částí podle jmen objektů ve scéně ze Splinu
const parts = {
  'Otočný knoflík': 'Frézovaný hliník s jemnou aretací. Otočením ztlumíš hudbu, stiskem ji zastavíš.',
  'Mezerník': 'Stabilizátory promazané z výroby, takže neklape ani na krajích.',
  'Klávesa Esc': 'Oranžový klobouček z PBT plastu, potisk se neodře ani po letech.',
  'Klávesa Enter': 'Stejně oranžová jako Esc, aby ses trefil i v šeru bez podsvícení.',
};

const keycapColors = [
  { name: 'Mléčná', value: '#f1f5f9' },
  { name: 'Grafitová', value: '#334155' },
  { name: 'Mátová', value: '#99f6e4' },
];

const posterKeys = [
  [90, 115], [134, 115], [178, 115], [222, 115], [266, 115], [310, 115], [354, 115], [398, 115], [442, 115],
  [98, 155], [142, 155], [186, 155], [230, 155], [274, 155], [318, 155], [362, 155], [406, 155], [450, 155],
  [106, 195], [150, 195], [194, 195], [238, 195], [282, 195], [326, 195], [370, 195],
];

function Poster() {
  return (
    <svg className="explore__poster" viewBox="0 0 640 360" role="img" aria-label="Klávesnice Klapka K75 s mléčnými klávesami a oranžovým knoflíkem">
      <rect x="60" y="90" width="520" height="190" rx="22" fill="#1e293b" />
      {posterKeys.map(([x, y], index) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="36" height="32" rx="6" fill={index === 0 ? '#fb923c' : '#f1f5f9'} />
      ))}
      <rect x="414" y="195" width="80" height="32" rx="6" fill="#fb923c" />
      <rect x="180" y="235" width="230" height="30" rx="6" fill="#f1f5f9" />
      <circle cx="530" cy="131" r="20" fill="#fb923c" />
    </svg>
  );
}

export default function App() {
  return (
    <>
      <header className="hero">
        <p className="hero__eyebrow">Předprodej do 30. listopadu</p>
        <h1 className="hero__title">Klapka K75</h1>
        <p className="hero__text">Hliníkové tělo, tiché lineární spínače a otočný knoflík na hlasitost. Navržená a sestavená v Brně.</p>
        <a className="button" href="#objednat">Předobjednat za 3 290 Kč</a>
      </header>

      <section className="explore" aria-labelledby="explore-title">
        <h2 id="explore-title" className="explore__title">Prohlédni si ji zblízka</h2>
        <div className="explore__layout">
          <div className="explore__stage">
            <Poster />
            {/* Sem patří scéna ze Splinu */}
            <p className="explore__status" role="status"></p>
          </div>

          <div className="explore__panel">
            <div className="explore__info" aria-live="polite">
              <h3 className="explore__info-title">Klikni na část klávesnice</h3>
              <p className="explore__info-text">Na modelu zjistíš, z čeho je knoflík, mezerník nebo klávesa Esc.</p>
            </div>

            <fieldset className="picker">
              <legend className="picker__legend">Barva kloboučků</legend>
              {keycapColors.map((color, index) => (
                <button key={color.value} type="button" className="swatch" aria-pressed={index === 0} style={{ '--swatch': color.value }}>
                  {color.name}
                </button>
              ))}
            </fieldset>

            <div className="explore__actions">
              <button type="button" className="toggle backlight" aria-pressed="false">Podsvícení</button>
            </div>
          </div>
        </div>
      </section>

      <section className="specs" id="objednat">
        <h2>Parametry</h2>
        <dl className="specs__list">
          <div><dt>Rozložení</dt><dd>75 %, 84 kláves, český i anglický potisk</dd></div>
          <div><dt>Spínače</dt><dd>lineární, tiché, 45 g</dd></div>
          <div><dt>Připojení</dt><dd>USB-C a Bluetooth 5.1 pro tři zařízení</dd></div>
          <div><dt>Hmotnost</dt><dd>1,2 kg</dd></div>
        </dl>
      </section>
    </>
  );
}
```

## --file-- react-spline.jsx

```jsx
// Náhrada balíčku @splinetool/react-spline pro offline kurz.
//
// Má stejné props jako skutečná komponenta (scene, onLoad, onSplineMouseDown…)
// a uvnitř používá náhradní runtime ze spline-runtime.js. Ve vlastním projektu
// tenhle soubor smažeš a komponentu načteš z balíčku:
//
//   const Spline = lazy(() => import('@splinetool/react-spline'));
//
// Soubor neupravuj.
import { useEffect, useRef } from 'react';
import { Application } from './spline-runtime.js';

const EVENTS = {
  onSplineMouseDown: 'mouseDown',
  onSplineMouseUp: 'mouseUp',
  onSplineMouseHover: 'mouseHover',
  onSplineKeyDown: 'keyDown',
  onSplineKeyUp: 'keyUp',
  onSplineStart: 'start',
  onSplineLookAt: 'lookAt',
  onSplineFollow: 'follow',
  onSplineScroll: 'scroll',
};

export default function Spline({ scene, onLoad, renderOnDemand = true, className, style, id, ref, ...handlers }) {
  const canvasRef = useRef(null);
  const latest = useRef({});
  latest.current = { onLoad, ...handlers };

  useEffect(() => {
    const app = new Application(canvasRef.current, { renderOnDemand });
    let active = true;
    for (const [prop, eventName] of Object.entries(EVENTS)) {
      app.addEventListener(eventName, (event) => latest.current[prop]?.(event));
    }
    app
      .load(scene)
      .then(() => {
        if (active) latest.current.onLoad?.(app);
      })
      .catch((error) => console.error(error));
    return () => {
      active = false;
      app.dispose();
    };
  }, [scene, renderOnDemand]);

  return (
    <div ref={ref} className={className} style={style}>
      <canvas ref={canvasRef} id={id} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
```

## --file-- spline-runtime.js

```js
// Náhrada balíčku @splinetool/runtime pro offline kurz.
//
// Má stejné rozhraní jako skutečný runtime: Application, load, findObjectByName,
// addEventListener, emitEvent, setVariable, stop, play, dispose…
// Skutečný runtime stáhne a vykreslí export scény přes WebGL. Tahle náhrada
// místo toho nakreslí klávesnici Klapka K75 do 2D canvasu, aby kurz fungoval
// bez internetu. Ve vlastním projektu tenhle soubor smažeš a napíšeš:
//
//   import { Application } from '@splinetool/runtime';
//
// Zbytek kódu zůstane stejný. Soubory v tomhle kroku neupravuj.

const SCENE_FILE = 'klapka-k75.splinecode';

const KEY_ROWS = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'Del'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Enter'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class SplineObject {
  constructor(app, name, type, extra = {}) {
    this.app = app;
    this.name = name;
    this.id = `${type}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.type = type;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.visible = true;
    this.intensity = 1;
    this._color = extra.color ?? '#f1f5f9';
    this.pressedUntil = 0;
  }

  get color() {
    return this._color;
  }

  set color(value) {
    this._color = String(value);
  }

  emitEvent(eventName) {
    this.app.emitEvent(eventName, this.name);
  }

  emitEventReverse(eventName) {
    this.app.emitEventReverse(eventName, this.name);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

export class Application {
  /** Jen v kurzu: vytvořené aplikace a záznam volání, ze kterého čte kontrola kroku. */
  static course = {
    instances: [],
    log: [],
    failNextLoad: false,
    /** Vyvolá událost scény, jako by uživatel klikl na objekt v 3D modelu. */
    simulate(app, eventName, objectName) {
      app._fire(eventName, objectName);
    },
  };

  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('Application potřebuje jako první argument element <canvas>.');
    }
    this.canvas = canvas;
    this.renderOnDemand = options.renderOnDemand ?? true;
    this._listeners = new Map();
    this._variables = new Map();
    this._objects = [];
    this._keys = [];
    this._loaded = false;
    this._playing = true;
    this._disposed = false;
    this._frame = null;
    this._onPointer = (event) => this._handlePointer(event);
    canvas.addEventListener('pointerdown', this._onPointer);
    canvas.addEventListener('pointermove', this._onPointer);
    Application.course.instances.push(this);
    this._record('constructor', [canvas, options]);
  }

  _record(method, args) {
    Application.course.log.push({ app: this, method, args });
  }

  async load(path, variables = {}) {
    this._record('load', [path, variables]);
    if (this._disposed) throw new Error('Aplikace už byla uvolněná přes dispose().');
    await wait(60);
    if (Application.course.failNextLoad) {
      Application.course.failNextLoad = false;
      throw new TypeError('Failed to fetch');
    }
    if (/^(https?:)?\/\//.test(String(path))) {
      throw new TypeError('Failed to fetch');
    }
    const fileName = String(path).split('/').pop();
    if (fileName !== SCENE_FILE) {
      throw new Error(`Scéna ${path} nebyla nalezena (404). V kurzu je k dispozici ./${SCENE_FILE}.`);
    }
    this._buildScene();
    this._variables.set('podsviceni', false);
    for (const [name, value] of Object.entries(variables)) this._variables.set(name, value);
    this._loaded = true;
    this._startDrawing();
    this._fire('start', 'Klávesnice');
  }

  _buildScene() {
    const keyboard = new SplineObject(this, 'Klávesnice', 'group');
    const caps = new SplineObject(this, 'Kloboučky kláves', 'mesh', { color: '#f1f5f9' });
    const knob = new SplineObject(this, 'Otočný knoflík', 'mesh', { color: '#fb923c' });
    const space = new SplineObject(this, 'Mezerník', 'mesh');
    const light = new SplineObject(this, 'Podsvícení', 'light', { color: '#a78bfa' });
    this._objects = [keyboard, caps, knob, space, light];
    this._keys = [];
    KEY_ROWS.forEach((row, rowIndex) => {
      row.forEach((label, column) => {
        const key = new SplineObject(this, `Klávesa ${label}`, 'mesh');
        key.label = label;
        key.row = rowIndex;
        key.column = column;
        this._objects.push(key);
        this._keys.push(key);
      });
    });
    space.label = '';
    space.row = 4;
    space.column = 2;
    space.width = 6;
    this._keys.push(space);
  }

  _startDrawing() {
    const draw = () => {
      this._frame = null;
      if (this._disposed) return;
      this._draw();
      if (this._playing) this._frame = requestAnimationFrame(draw);
    };
    if (this._frame === null) this._frame = requestAnimationFrame(draw);
  }

  _layout() {
    const width = this.canvas.clientWidth || this.canvas.width;
    const height = this.canvas.clientHeight || this.canvas.height;
    const keyboard = this.findObjectByName('Klávesnice');
    const unit = Math.min(width / 15, height / 8);
    const skew = Math.sin(keyboard.rotation.y) * 0.35;
    const tilt = Math.cos(keyboard.rotation.x * 0.8);
    const originX = width / 2 - unit * 6.4;
    const originY = height / 2 - unit * 2.6 * tilt;
    return { width, height, unit, skew, tilt, originX, originY };
  }

  _keyRect(key, layout) {
    const { unit, skew, tilt, originX, originY } = layout;
    const x = originX + (key.column + (key.row === 4 ? 0 : key.row * 0.2)) * unit * 1.08;
    const y = originY + key.row * unit * 1.08 * tilt;
    return { x: x + (y - layout.height / 2) * skew, y, w: unit * (key.width ?? 1), h: unit * tilt };
  }

  _draw() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const { canvas } = this;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    if (!cssWidth || !cssHeight) return;
    if (canvas.width !== Math.round(cssWidth * ratio) || canvas.height !== Math.round(cssHeight * ratio)) {
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(cssHeight * ratio);
    }
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);
    const layout = this._layout();
    const backlight = this._variables.get('podsviceni') === true;
    const caps = this.findObjectByName('Kloboučky kláves');
    const light = this.findObjectByName('Podsvícení');
    const now = performance.now();

    const first = this._keyRect(this._keys[0], layout);
    const last = this._keyRect(this._keys[this._keys.length - 2], layout);
    context.fillStyle = '#1e293b';
    context.beginPath();
    context.roundRect(first.x - layout.unit * 0.6, first.y - layout.unit * 0.6, last.x + last.w - first.x + layout.unit * 2.4, layout.unit * 6.4 * layout.tilt, layout.unit * 0.5);
    context.fill();

    if (backlight) {
      context.shadowColor = light.color;
      context.shadowBlur = layout.unit * 0.8;
    }
    for (const key of this._keys) {
      const rect = this._keyRect(key, layout);
      const pressed = key.pressedUntil > now ? layout.unit * 0.12 : 0;
      context.fillStyle = key.label === 'Esc' || key.label === 'Enter' ? '#fb923c' : caps.color;
      context.beginPath();
      context.roundRect(rect.x, rect.y + pressed, rect.w, rect.h - pressed, layout.unit * 0.15);
      context.fill();
      if (key.label) {
        context.shadowBlur = 0;
        context.fillStyle = '#475569';
        context.font = `${Math.round(layout.unit * 0.28)}px system-ui, sans-serif`;
        context.fillText(key.label, rect.x + layout.unit * 0.18, rect.y + pressed + layout.unit * 0.42);
        if (backlight) context.shadowBlur = layout.unit * 0.8;
      }
    }
    context.shadowBlur = 0;

    const knob = this.findObjectByName('Otočný knoflík');
    const knobX = last.x + last.w + layout.unit * 0.9;
    const knobY = first.y + layout.unit * 0.5;
    context.fillStyle = knob.color;
    context.beginPath();
    context.arc(knobX, knobY, layout.unit * 0.5, 0, Math.PI * 2);
    context.fill();
    knob.hit = { x: knobX - layout.unit * 0.5, y: knobY - layout.unit * 0.5, w: layout.unit, h: layout.unit };
  }

  _handlePointer(event) {
    if (!this._loaded || this._disposed) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const layout = this._layout();
    const inside = (box) => box && x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
    const knob = this.findObjectByName('Otočný knoflík');
    const target = inside(knob.hit) ? knob : this._keys.find((key) => inside(this._keyRect(key, layout)));
    if (!target) return;
    this._fire(event.type === 'pointerdown' ? 'mouseDown' : 'mouseHover', target.name);
  }

  _fire(eventName, objectName) {
    const object = this.findObjectByName(objectName);
    if (!object) return;
    if (eventName === 'mouseDown') object.pressedUntil = performance.now() + 250;
    for (const callback of this._listeners.get(eventName) ?? []) {
      callback({ target: { name: object.name, id: object.id } });
    }
    this._startDrawing();
  }

  findObjectByName(name) {
    return this._objects.find((object) => object.name === name);
  }

  findObjectById(id) {
    return this._objects.find((object) => object.id === id);
  }

  getAllObjects() {
    return [...this._objects];
  }

  addEventListener(eventName, callback) {
    this._record('addEventListener', [eventName, callback]);
    if (!this._listeners.has(eventName)) this._listeners.set(eventName, new Set());
    this._listeners.get(eventName).add(callback);
  }

  removeEventListener(eventName, callback) {
    this._record('removeEventListener', [eventName, callback]);
    this._listeners.get(eventName)?.delete(callback);
  }

  emitEvent(eventName, nameOrUuid) {
    this._record('emitEvent', [eventName, nameOrUuid]);
    const object = this.findObjectByName(nameOrUuid) ?? this.findObjectById(nameOrUuid);
    if (object && eventName === 'mouseDown') object.pressedUntil = performance.now() + 400;
    this._startDrawing();
  }

  emitEventReverse(eventName, nameOrUuid) {
    this._record('emitEventReverse', [eventName, nameOrUuid]);
  }

  setVariable(name, value) {
    this._record('setVariable', [name, value]);
    this._variables.set(name, value);
    this._startDrawing();
  }

  setVariables(values) {
    for (const [name, value] of Object.entries(values)) this.setVariable(name, value);
  }

  getVariable(name) {
    return this._variables.get(name);
  }

  getVariables() {
    return Object.fromEntries(this._variables);
  }

  setZoom(value) {
    this._record('setZoom', [value]);
  }

  setBackgroundColor(color) {
    this._record('setBackgroundColor', [color]);
  }

  setSize(width, height) {
    this._record('setSize', [width, height]);
  }

  stop() {
    this._record('stop', []);
    this._playing = false;
  }

  play() {
    this._record('play', []);
    this._playing = true;
    this._startDrawing();
  }

  dispose() {
    this._record('dispose', []);
    this._disposed = true;
    this._playing = false;
    this._listeners.clear();
    this.canvas.removeEventListener('pointerdown', this._onPointer);
    this.canvas.removeEventListener('pointermove', this._onPointer);
    this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
```

## --file-- styles.css

```css
:root {
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #0f172a;
  --color-muted: #64748b;
  --color-accent: #ea580c;
  --radius: 1.25rem;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--color-text);
  background: var(--color-bg);
}

body {
  margin: 0;
}

.hero {
  box-sizing: border-box;
  min-height: 100svh;
  max-width: 44rem;
  margin: 0 auto;
  padding: 18vh 1.5rem 12vh;
  text-align: center;
}

.hero__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-weight: 600;
}

.hero__title {
  margin: 0.75rem 0;
  font-size: clamp(3rem, 10vw, 6rem);
  line-height: 1;
}

.hero__text {
  color: var(--color-muted);
  font-size: 1.125rem;
  line-height: 1.6;
}

.button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 1rem 1.75rem;
  border-radius: 999px;
  background: var(--color-text);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, background-color 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  background: var(--color-accent);
}

.explore {
  max-width: 72rem;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.explore__title {
  font-size: 2rem;
}

.explore__layout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 2rem;
  align-items: start;
}

.explore__stage {
  position: relative;
  height: 460px;
  border-radius: var(--radius);
  background: radial-gradient(circle at 50% 40%, #ffffff, #e2e8f0);
  overflow: hidden;
}

.explore__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.4s;
}

.explore__stage.is-loaded .explore__poster {
  opacity: 0;
}

.explore__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.explore__status {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  margin: 0;
  color: var(--color-muted);
}

.explore__info {
  padding: 1.5rem;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: 0 10px 30px rgb(15 23 42 / 0.08);
}

.explore__info-title {
  margin-top: 0;
}

.explore__info-text {
  margin-bottom: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.5rem 0;
  padding: 0;
  border: 0;
}

.picker__legend {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.swatch,
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 999px;
  background: var(--color-surface);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.swatch::before {
  content: "";
  width: 1rem;
  height: 1rem;
  border: 1px solid #94a3b8;
  border-radius: 50%;
  background: var(--swatch);
}

.swatch[aria-pressed="true"],
.toggle[aria-pressed="true"] {
  border-color: var(--color-text);
}

.toggle[aria-pressed="true"] {
  background: #ede9fe;
}

.explore__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

:is(.button, .swatch, .toggle):focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.specs {
  max-width: 44rem;
  min-height: 80vh;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.specs__list div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.specs__list dd {
  margin: 0;
  color: var(--color-muted);
  text-align: right;
}

@media (max-width: 800px) {
  .explore__layout {
    grid-template-columns: 1fr;
  }

  .explore__stage {
    height: 320px;
  }
}
```

# --solution--

## --file-- App.jsx

```jsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Spline = lazy(() => import('./react-spline.jsx'));

// Popisky částí podle jmen objektů ve scéně ze Splinu
const parts = {
  'Otočný knoflík': 'Frézovaný hliník s jemnou aretací. Otočením ztlumíš hudbu, stiskem ji zastavíš.',
  'Mezerník': 'Stabilizátory promazané z výroby, takže neklape ani na krajích.',
  'Klávesa Esc': 'Oranžový klobouček z PBT plastu, potisk se neodře ani po letech.',
  'Klávesa Enter': 'Stejně oranžová jako Esc, aby ses trefil i v šeru bez podsvícení.',
};

const keycapColors = [
  { name: 'Mléčná', value: '#f1f5f9' },
  { name: 'Grafitová', value: '#334155' },
  { name: 'Mátová', value: '#99f6e4' },
];

const posterKeys = [
  [90, 115], [134, 115], [178, 115], [222, 115], [266, 115], [310, 115], [354, 115], [398, 115], [442, 115],
  [98, 155], [142, 155], [186, 155], [230, 155], [274, 155], [318, 155], [362, 155], [406, 155], [450, 155],
  [106, 195], [150, 195], [194, 195], [238, 195], [282, 195], [326, 195], [370, 195],
];

function Poster() {
  return (
    <svg className="explore__poster" viewBox="0 0 640 360" role="img" aria-label="Klávesnice Klapka K75 s mléčnými klávesami a oranžovým knoflíkem">
      <rect x="60" y="90" width="520" height="190" rx="22" fill="#1e293b" />
      {posterKeys.map(([x, y], index) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="36" height="32" rx="6" fill={index === 0 ? '#fb923c' : '#f1f5f9'} />
      ))}
      <rect x="414" y="195" width="80" height="32" rx="6" fill="#fb923c" />
      <rect x="180" y="235" width="230" height="30" rx="6" fill="#f1f5f9" />
      <circle cx="530" cy="131" r="20" fill="#fb923c" />
    </svg>
  );
}

export default function App() {
  const stageRef = useRef(null);
  const splineRef = useRef(null);
  const [showScene, setShowScene] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('');
  const [part, setPart] = useState(null);
  const [keycaps, setKeycaps] = useState(keycapColors[0].value);
  const [backlight, setBacklight] = useState(false);

  // Scénu začneme načítat, až sekce vjede do okna
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia('(max-width: 640px)').matches) {
        setStatus('Na malé obrazovce ukazujeme jen obrázek, šetříme data i baterii.');
        return;
      }
      setShowScene(true);
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  function handleLoad(splineApp) {
    splineRef.current = splineApp;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      splineApp.stop();
    }
    setLoaded(true);
  }

  function handleMouseDown(event) {
    if (parts[event.target.name]) {
      setPart(event.target.name);
    }
  }

  function chooseKeycaps(value) {
    splineRef.current.findObjectByName('Kloboučky kláves').color = value;
    setKeycaps(value);
  }

  function toggleBacklight() {
    const next = !backlight;
    splineRef.current.setVariable('podsviceni', next);
    setBacklight(next);
  }

  return (
    <>
      <header className="hero">
        <p className="hero__eyebrow">Předprodej do 30. listopadu</p>
        <h1 className="hero__title">Klapka K75</h1>
        <p className="hero__text">Hliníkové tělo, tiché lineární spínače a otočný knoflík na hlasitost. Navržená a sestavená v Brně.</p>
        <a className="button" href="#objednat">Předobjednat za 3 290 Kč</a>
      </header>

      <section className="explore" aria-labelledby="explore-title">
        <h2 id="explore-title" className="explore__title">Prohlédni si ji zblízka</h2>
        <div className="explore__layout">
          <div ref={stageRef} className={loaded ? 'explore__stage is-loaded' : 'explore__stage'}>
            <Poster />
            {showScene && (
              <Suspense fallback={null}>
                <Spline
                  scene="./klapka-k75.splinecode"
                  className="explore__canvas"
                  onLoad={handleLoad}
                  onSplineMouseDown={handleMouseDown}
                />
              </Suspense>
            )}
            <p className="explore__status" role="status">{status}</p>
          </div>

          <div className="explore__panel">
            <div className="explore__info" aria-live="polite">
              <h3 className="explore__info-title">{part ?? 'Klikni na část klávesnice'}</h3>
              <p className="explore__info-text">{part ? parts[part] : 'Na modelu zjistíš, z čeho je knoflík, mezerník nebo klávesa Esc.'}</p>
            </div>

            <fieldset className="picker">
              <legend className="picker__legend">Barva kloboučků</legend>
              {keycapColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className="swatch"
                  aria-pressed={keycaps === color.value}
                  style={{ '--swatch': color.value }}
                  disabled={!loaded}
                  onClick={() => chooseKeycaps(color.value)}
                >
                  {color.name}
                </button>
              ))}
            </fieldset>

            <div className="explore__actions">
              <button type="button" className="toggle backlight" aria-pressed={backlight} disabled={!loaded} onClick={toggleBacklight}>
                Podsvícení
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="specs" id="objednat">
        <h2>Parametry</h2>
        <dl className="specs__list">
          <div><dt>Rozložení</dt><dd>75 %, 84 kláves, český i anglický potisk</dd></div>
          <div><dt>Spínače</dt><dd>lineární, tiché, 45 g</dd></div>
          <div><dt>Připojení</dt><dd>USB-C a Bluetooth 5.1 pro tři zařízení</dd></div>
          <div><dt>Hmotnost</dt><dd>1,2 kg</dd></div>
        </dl>
      </section>
    </>
  );
}
```

# --approaches--

## --approach-- Aplikace v refu, scéna se mění v obsluze kliknutí

`onLoad` uloží aplikaci do `useRef` a obsluha tlačítka nejdřív změní scénu, pak stav. Přímočaré a blízko vanilla kódu z workshopu. Hlídat musíš, aby se na scénu nesáhlo před načtením — proto vypnutá tlačítka.

### --file-- App.jsx

```jsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Spline = lazy(() => import('./react-spline.jsx'));

// Popisky částí podle jmen objektů ve scéně ze Splinu
const parts = {
  'Otočný knoflík': 'Frézovaný hliník s jemnou aretací. Otočením ztlumíš hudbu, stiskem ji zastavíš.',
  'Mezerník': 'Stabilizátory promazané z výroby, takže neklape ani na krajích.',
  'Klávesa Esc': 'Oranžový klobouček z PBT plastu, potisk se neodře ani po letech.',
  'Klávesa Enter': 'Stejně oranžová jako Esc, aby ses trefil i v šeru bez podsvícení.',
};

const keycapColors = [
  { name: 'Mléčná', value: '#f1f5f9' },
  { name: 'Grafitová', value: '#334155' },
  { name: 'Mátová', value: '#99f6e4' },
];

const posterKeys = [
  [90, 115], [134, 115], [178, 115], [222, 115], [266, 115], [310, 115], [354, 115], [398, 115], [442, 115],
  [98, 155], [142, 155], [186, 155], [230, 155], [274, 155], [318, 155], [362, 155], [406, 155], [450, 155],
  [106, 195], [150, 195], [194, 195], [238, 195], [282, 195], [326, 195], [370, 195],
];

function Poster() {
  return (
    <svg className="explore__poster" viewBox="0 0 640 360" role="img" aria-label="Klávesnice Klapka K75 s mléčnými klávesami a oranžovým knoflíkem">
      <rect x="60" y="90" width="520" height="190" rx="22" fill="#1e293b" />
      {posterKeys.map(([x, y], index) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="36" height="32" rx="6" fill={index === 0 ? '#fb923c' : '#f1f5f9'} />
      ))}
      <rect x="414" y="195" width="80" height="32" rx="6" fill="#fb923c" />
      <rect x="180" y="235" width="230" height="30" rx="6" fill="#f1f5f9" />
      <circle cx="530" cy="131" r="20" fill="#fb923c" />
    </svg>
  );
}

export default function App() {
  const stageRef = useRef(null);
  const splineRef = useRef(null);
  const [showScene, setShowScene] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('');
  const [part, setPart] = useState(null);
  const [keycaps, setKeycaps] = useState(keycapColors[0].value);
  const [backlight, setBacklight] = useState(false);

  // Scénu začneme načítat, až sekce vjede do okna
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia('(max-width: 640px)').matches) {
        setStatus('Na malé obrazovce ukazujeme jen obrázek, šetříme data i baterii.');
        return;
      }
      setShowScene(true);
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  function handleLoad(splineApp) {
    splineRef.current = splineApp;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      splineApp.stop();
    }
    setLoaded(true);
  }

  function handleMouseDown(event) {
    if (parts[event.target.name]) {
      setPart(event.target.name);
    }
  }

  function chooseKeycaps(value) {
    splineRef.current.findObjectByName('Kloboučky kláves').color = value;
    setKeycaps(value);
  }

  function toggleBacklight() {
    const next = !backlight;
    splineRef.current.setVariable('podsviceni', next);
    setBacklight(next);
  }

  return (
    <>
      <header className="hero">
        <p className="hero__eyebrow">Předprodej do 30. listopadu</p>
        <h1 className="hero__title">Klapka K75</h1>
        <p className="hero__text">Hliníkové tělo, tiché lineární spínače a otočný knoflík na hlasitost. Navržená a sestavená v Brně.</p>
        <a className="button" href="#objednat">Předobjednat za 3 290 Kč</a>
      </header>

      <section className="explore" aria-labelledby="explore-title">
        <h2 id="explore-title" className="explore__title">Prohlédni si ji zblízka</h2>
        <div className="explore__layout">
          <div ref={stageRef} className={loaded ? 'explore__stage is-loaded' : 'explore__stage'}>
            <Poster />
            {showScene && (
              <Suspense fallback={null}>
                <Spline
                  scene="./klapka-k75.splinecode"
                  className="explore__canvas"
                  onLoad={handleLoad}
                  onSplineMouseDown={handleMouseDown}
                />
              </Suspense>
            )}
            <p className="explore__status" role="status">{status}</p>
          </div>

          <div className="explore__panel">
            <div className="explore__info" aria-live="polite">
              <h3 className="explore__info-title">{part ?? 'Klikni na část klávesnice'}</h3>
              <p className="explore__info-text">{part ? parts[part] : 'Na modelu zjistíš, z čeho je knoflík, mezerník nebo klávesa Esc.'}</p>
            </div>

            <fieldset className="picker">
              <legend className="picker__legend">Barva kloboučků</legend>
              {keycapColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className="swatch"
                  aria-pressed={keycaps === color.value}
                  style={{ '--swatch': color.value }}
                  disabled={!loaded}
                  onClick={() => chooseKeycaps(color.value)}
                >
                  {color.name}
                </button>
              ))}
            </fieldset>

            <div className="explore__actions">
              <button type="button" className="toggle backlight" aria-pressed={backlight} disabled={!loaded} onClick={toggleBacklight}>
                Podsvícení
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="specs" id="objednat">
        <h2>Parametry</h2>
        <dl className="specs__list">
          <div><dt>Rozložení</dt><dd>75 %, 84 kláves, český i anglický potisk</dd></div>
          <div><dt>Spínače</dt><dd>lineární, tiché, 45 g</dd></div>
          <div><dt>Připojení</dt><dd>USB-C a Bluetooth 5.1 pro tři zařízení</dd></div>
          <div><dt>Hmotnost</dt><dd>1,2 kg</dd></div>
        </dl>
      </section>
    </>
  );
}
```

## --approach-- Vlastní hook a scéna synchronizovaná efektem

Viditelnost řeší znovupoužitelný hook `useSeenOnce`, aplikace je ve stavu a jeden efekt přenáší zvolenou barvu a podsvícení do scény po načtení i po každé změně. Tlačítka mění jen stav Reactu. Čistší oddělení, a když se scéna načte později, dostane rovnou aktuální volby.

### --file-- App.jsx

```jsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Spline = lazy(() => import('./react-spline.jsx'));

// Popisky částí podle jmen objektů ve scéně ze Splinu
const parts = {
  'Otočný knoflík': 'Frézovaný hliník s jemnou aretací. Otočením ztlumíš hudbu, stiskem ji zastavíš.',
  'Mezerník': 'Stabilizátory promazané z výroby, takže neklape ani na krajích.',
  'Klávesa Esc': 'Oranžový klobouček z PBT plastu, potisk se neodře ani po letech.',
  'Klávesa Enter': 'Stejně oranžová jako Esc, aby ses trefil i v šeru bez podsvícení.',
};

const keycapColors = [
  { name: 'Mléčná', value: '#f1f5f9' },
  { name: 'Grafitová', value: '#334155' },
  { name: 'Mátová', value: '#99f6e4' },
];

const posterKeys = [
  [90, 115], [134, 115], [178, 115], [222, 115], [266, 115], [310, 115], [354, 115], [398, 115], [442, 115],
  [98, 155], [142, 155], [186, 155], [230, 155], [274, 155], [318, 155], [362, 155], [406, 155], [450, 155],
  [106, 195], [150, 195], [194, 195], [238, 195], [282, 195], [326, 195], [370, 195],
];

function Poster() {
  return (
    <svg className="explore__poster" viewBox="0 0 640 360" role="img" aria-label="Klávesnice Klapka K75 s mléčnými klávesami a oranžovým knoflíkem">
      <rect x="60" y="90" width="520" height="190" rx="22" fill="#1e293b" />
      {posterKeys.map(([x, y], index) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="36" height="32" rx="6" fill={index === 0 ? '#fb923c' : '#f1f5f9'} />
      ))}
      <rect x="414" y="195" width="80" height="32" rx="6" fill="#fb923c" />
      <rect x="180" y="235" width="230" height="30" rx="6" fill="#f1f5f9" />
      <circle cx="530" cy="131" r="20" fill="#fb923c" />
    </svg>
  );
}

// Vrátí true, jakmile prvek poprvé vjede do okna
function useSeenOnce(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return seen;
}

export default function App() {
  const stageRef = useRef(null);
  const seen = useSeenOnce(stageRef);
  const isSmallScreen = seen && window.innerWidth <= 640;
  const showScene = seen && !isSmallScreen;
  const status = isSmallScreen ? 'Na telefonu je místo 3D modelu obrázek.' : '';
  const [splineApp, setSplineApp] = useState(null);
  const loaded = splineApp !== null;
  const [part, setPart] = useState(null);
  const [keycaps, setKeycaps] = useState(keycapColors[0].value);
  const [backlight, setBacklight] = useState(false);

  // Scéna se řídí stavem Reactu: po načtení i po každé změně volby
  useEffect(() => {
    if (!splineApp) return;
    splineApp.findObjectByName('Kloboučky kláves').color = keycaps;
    splineApp.setVariable('podsviceni', backlight);
  }, [splineApp, keycaps, backlight]);

  function handleLoad(app) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) app.stop();
    setSplineApp(app);
  }

  function handleMouseDown(event) {
    const name = event.target.name;
    if (name in parts) setPart(name);
  }

  function chooseKeycaps(value) {
    setKeycaps(value);
  }

  function toggleBacklight() {
    setBacklight((current) => !current);
  }

  return (
    <>
      <header className="hero">
        <p className="hero__eyebrow">Předprodej do 30. listopadu</p>
        <h1 className="hero__title">Klapka K75</h1>
        <p className="hero__text">Hliníkové tělo, tiché lineární spínače a otočný knoflík na hlasitost. Navržená a sestavená v Brně.</p>
        <a className="button" href="#objednat">Předobjednat za 3 290 Kč</a>
      </header>

      <section className="explore" aria-labelledby="explore-title">
        <h2 id="explore-title" className="explore__title">Prohlédni si ji zblízka</h2>
        <div className="explore__layout">
          <div ref={stageRef} className={loaded ? 'explore__stage is-loaded' : 'explore__stage'}>
            <Poster />
            {showScene && (
              <Suspense fallback={null}>
                <Spline
                  scene="./klapka-k75.splinecode"
                  className="explore__canvas"
                  onLoad={handleLoad}
                  onSplineMouseDown={handleMouseDown}
                />
              </Suspense>
            )}
            <p className="explore__status" role="status">{status}</p>
          </div>

          <div className="explore__panel">
            <div className="explore__info" aria-live="polite">
              <h3 className="explore__info-title">{part ?? 'Klikni na část klávesnice'}</h3>
              <p className="explore__info-text">{part ? parts[part] : 'Na modelu zjistíš, z čeho je knoflík, mezerník nebo klávesa Esc.'}</p>
            </div>

            <fieldset className="picker">
              <legend className="picker__legend">Barva kloboučků</legend>
              {keycapColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className="swatch"
                  aria-pressed={keycaps === color.value}
                  style={{ '--swatch': color.value }}
                  disabled={!loaded}
                  onClick={() => chooseKeycaps(color.value)}
                >
                  {color.name}
                </button>
              ))}
            </fieldset>

            <div className="explore__actions">
              <button type="button" className="toggle backlight" aria-pressed={backlight} disabled={!loaded} onClick={toggleBacklight}>
                Podsvícení
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="specs" id="objednat">
        <h2>Parametry</h2>
        <dl className="specs__list">
          <div><dt>Rozložení</dt><dd>75 %, 84 kláves, český i anglický potisk</dd></div>
          <div><dt>Spínače</dt><dd>lineární, tiché, 45 g</dd></div>
          <div><dt>Připojení</dt><dd>USB-C a Bluetooth 5.1 pro tři zařízení</dd></div>
          <div><dt>Hmotnost</dt><dd>1,2 kg</dd></div>
        </dl>
      </section>
    </>
  );
}
```

# --review--

Testy kontrolují chování. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Obsluha tlačítek nesahá na scénu, která ještě neexistuje (ani při rychlém klikání během načítání).
- Efekt s `IntersectionObserver` po sobě uklízí a v StrictMode nevzniknou dvě scény.
- Texty v panelu a stavovém řádku dávají smysl i bez 3D (čtečka, úzký displej).
- Komponenta `App` není přeplněná: sledování viditelnosti nebo scéna jsou v samostatném hooku či komponentě.

## --extensions--

Rozšíření bez testů: přepínání barvy i na náhradním obrázku, když se scéna nenačte; `rootMargin` pro načtení s rezervou; skeleton s textem „Načítám model…" místo `fallback={null}`; vlastní komponenta `ProductScene` s props pro jméno scény a popisky.
