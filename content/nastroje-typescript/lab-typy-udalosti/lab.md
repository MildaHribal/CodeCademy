---
title: Systém událostí
runtime: node
timeoutMs: 30000
see: nastroje-typescript/zuzovani-a-genericita#generika-typ-jako-parametr
---

# --description--

Aplikace přehrávače podcastů se rozrostla a jednotlivé části o sobě nemají vědět:
přehrávač nemá volat statistiky ani notifikace. Místo toho bude rozhlašovat
události a kdo chce, ten si je poslechne.

Takový emitter se v JavaScriptu píše za pět minut. Problém je, že pak nikdo neví,
jaká data u které události chodí — a překlep v názvu události se pozná až
z prázdné obrazovky. Tvůj emitter to bude vědět: názvy událostí i tvar jejich dat
si vezme z mapy, kterou dostane jako typový parametr.

Mapa událostí přehrávače je v `udalosti.ts` a vypadá takhle — název události je
klíč, data jsou hodnota:

```ts
export type UdalostiPrehravace = {
  'dil:spusten': { id: number; nazev: string };
  'dil:pozastaven': { sekunda: number };
  'hlasitost:zmenena': number;
};
```

Svůj kód piš do `emitter.ts`. Testy si emitter vyrobí samy, nic nespouštěj ručně —
ale klidně si v `ukazka.ts` zkoušej, jak se chová, a pouštěj ji tlačítkem
**Spustit**.

## Co má emitter umět

- Když někdo zavolá `vytvorEmitter<UdalostiPrehravace>()`, dostane emitter, který
  zná právě události z téhle mapy.
- Když někdo zaregistruje posluchače přes `emitter.na('dil:spusten', posluchac)`
  a pak se ta událost pošle, posluchač se zavolá s daty té události.
- Když se pošle jiná událost, posluchač se nezavolá.
- Když je na jedné události víc posluchačů, zavolají se všichni v pořadí, v jakém
  se zaregistrovali.
- Když se pošle událost, na kterou nikdo neposlouchá, nestane se nic a nic
  nespadne.
- Když někdo zavolá funkci, kterou `na` vrátila, jeho posluchač se od té chvíle
  nevolá. Ostatní posluchači té události zůstávají.
- Když se stejná odhlašovací funkce zavolá podruhé, nic se nerozbije.
- Když se někdo zeptá `emitter.pocetPosluchacu('dil:spusten')`, dostane počet
  posluchačů té události — i nulu.
- Dva emittery vyrobené vedle sebe o sobě nevědí.

## Co má hlídat kontrola typů

- Posluchač dostane přesně data své události: u `dil:spusten` objekt s `id`
  a `nazev`, u `hlasitost:zmenena` číslo.
- Název události, který v mapě není, kontrola odmítne.
- Data, která k události nepatří, kontrola u `poslat` odmítne.
- `npx tsc --noEmit` projde bez jediné chyby a bez `any` v hlavičkách funkcí
  (uvnitř si dělej, co potřebuješ).

# --hints--

`emitter.ts` exportuje `vytvorEmitter`, která vrátí emitter s metodami `na`, `poslat` a `pocetPosluchacu`.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
assert.equal(typeof vytvorEmitter, 'function', 'emitter.ts má exportovat funkci vytvorEmitter');
const emitter = vytvorEmitter();
assert.equal(typeof emitter?.na, 'function', 'vytvorEmitter() má vrátit objekt s metodou na');
assert.equal(typeof emitter?.poslat, 'function', 'vytvorEmitter() má vrátit objekt s metodou poslat');
assert.equal(typeof emitter?.pocetPosluchacu, 'function', 'vytvorEmitter() má vrátit objekt s metodou pocetPosluchacu');
```

Poslaná událost zavolá svého posluchače s předanými daty.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
const prijato = [];
emitter.na('dil:spusten', (data) => prijato.push(data));
emitter.poslat('dil:spusten', { id: 3, nazev: 'Jak se dělá podcast' });
assert.deepEqual(prijato, [{ id: 3, nazev: 'Jak se dělá podcast' }], "po poslat('dil:spusten', …) se má posluchač zavolat přesně s předanými daty");
```

Posluchač jiné události se nezavolá.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
let spusteno = 0;
let pozastaveno = 0;
emitter.na('dil:spusten', () => { spusteno += 1; });
emitter.na('dil:pozastaven', () => { pozastaveno += 1; });
emitter.poslat('dil:spusten', { id: 1, nazev: 'První' });
assert.equal(spusteno, 1, "poslat('dil:spusten') má zavolat posluchače události dil:spusten");
assert.equal(pozastaveno, 0, "poslat('dil:spusten') nemá volat posluchače události dil:pozastaven");
```

Víc posluchačů téže události se zavolá v pořadí registrace.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
const poradi = [];
emitter.na('hlasitost:zmenena', () => poradi.push('prvni'));
emitter.na('hlasitost:zmenena', () => poradi.push('druhy'));
emitter.na('hlasitost:zmenena', () => poradi.push('treti'));
emitter.poslat('hlasitost:zmenena', 0.5);
assert.deepEqual(poradi, ['prvni', 'druhy', 'treti'], 'posluchači se mají volat v pořadí, v jakém se zaregistrovali');
```

Událost bez posluchačů nic neudělá a nic neshodí.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
emitter.poslat('dil:pozastaven', { sekunda: 12 });
emitter.na('dil:spusten', () => {});
emitter.poslat('hlasitost:zmenena', 1);
assert.ok(true, 'poslat na událost bez posluchačů nemá vyhodit chybu');
```

Funkce vrácená z `na` posluchače odhlásí.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
let volani = 0;
const odhlas = emitter.na('dil:spusten', () => { volani += 1; });
assert.equal(typeof odhlas, 'function', 'na(…) má vrátit funkci, kterou jde posluchače odhlásit');
emitter.poslat('dil:spusten', { id: 1, nazev: 'První' });
odhlas();
emitter.poslat('dil:spusten', { id: 2, nazev: 'Druhý' });
assert.equal(volani, 1, 'po odhlášení se posluchač už nemá volat');
```

Odhlášení odebere jen toho jednoho posluchače.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
const volani = [];
const odhlas = emitter.na('dil:spusten', () => volani.push('prvni'));
emitter.na('dil:spusten', () => volani.push('druhy'));
odhlas();
emitter.poslat('dil:spusten', { id: 1, nazev: 'První' });
assert.deepEqual(volani, ['druhy'], 'odhlášení prvního posluchače nemá odebrat druhého');
```

Druhé zavolání odhlašovací funkce nic nerozbije.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
let volani = 0;
const odhlas = emitter.na('hlasitost:zmenena', () => { volani += 1; });
emitter.na('hlasitost:zmenena', () => { volani += 10; });
odhlas();
odhlas();
emitter.poslat('hlasitost:zmenena', 0.2);
assert.equal(volani, 10, 'dvojí odhlášení nemá odebrat cizího posluchače ani vyhodit chybu');
```

`pocetPosluchacu` vrací počet posluchačů dané události.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const emitter = vytvorEmitter();
assert.equal(emitter.pocetPosluchacu('dil:spusten'), 0, 'pocetPosluchacu u události bez posluchačů má vrátit 0');
const odhlas = emitter.na('dil:spusten', () => {});
emitter.na('dil:spusten', () => {});
emitter.na('dil:pozastaven', () => {});
assert.equal(emitter.pocetPosluchacu('dil:spusten'), 2, 'pocetPosluchacu má počítat jen posluchače té jedné události');
odhlas();
assert.equal(emitter.pocetPosluchacu('dil:spusten'), 1, 'po odhlášení má pocetPosluchacu vrátit o jedna míň');
```

Dva emittery se navzájem neovlivňují.

```js
const { vytvorEmitter } = await helpers.importFile('emitter.ts');
const prvni = vytvorEmitter();
const druhy = vytvorEmitter();
let volani = 0;
prvni.na('dil:spusten', () => { volani += 1; });
druhy.poslat('dil:spusten', { id: 1, nazev: 'První' });
assert.equal(volani, 0, 'posluchač zaregistrovaný na jednom emitteru se nemá volat z druhého — posluchače drž uvnitř vytvorEmitter, ne v modulu');
assert.equal(druhy.pocetPosluchacu('dil:spusten'), 0, 'druhý emitter nemá vidět posluchače prvního');
```

Kontrola typů dá posluchači data jeho události a odmítne neznámý název i špatná data.

```js
const kod = [
  "import { vytvorEmitter } from './emitter.ts';",
  "import type { UdalostiPrehravace } from './udalosti.ts';",
  "const emitter = vytvorEmitter<UdalostiPrehravace>();",
  "emitter.na('dil:spusten', (data) => { const nazev: string = data.nazev; const id: number = data.id; console.log(nazev, id); });",
  "emitter.na('hlasitost:zmenena', (data) => { const hlasitost: number = data; console.log(hlasitost.toFixed(2)); });",
  "const odhlas: () => void = emitter.na('dil:pozastaven', (data) => console.log(data.sekunda));",
  "emitter.poslat('dil:spusten', { id: 1, nazev: 'První' });",
  "emitter.poslat('hlasitost:zmenena', 0.5);",
  "const pocet: number = emitter.pocetPosluchacu('dil:spusten');",
  "// @ts-expect-error takováhle událost v mapě není",
  "emitter.na('dil:smazan', () => {});",
  "// @ts-expect-error hlasitost:zmenena posílá číslo, ne objekt",
  "emitter.poslat('hlasitost:zmenena', { hodnota: 0.5 });",
  "// @ts-expect-error data události dil:spusten nemají klíč sekunda",
  "emitter.na('dil:spusten', (data) => console.log(data.sekunda));",
  "console.log(odhlas, pocet);",
].join('\n');
await helpers.run(`cat > .kontrola.ts <<'KONEC'\n${kod}\nKONEC`);
const r = await helpers.run('npx tsc --noEmit --strict --target esnext --module nodenext --moduleResolution nodenext --types node --allowImportingTsExtensions --ignoreConfig .kontrola.ts');
assert.equal(r.code, 0, 'Emitter má být generický nad mapou událostí: posluchač dostane data své události a neznámý název ani cizí data neprojdou. Kontrola typů hlásí:\n' + r.stdout + r.stderr);
```

Kontrola typů celého projektu projde a v hlavičkách funkcí není `any`.

```js
const r = await helpers.run('npx tsc --noEmit');
assert.equal(r.code, 0, 'npx tsc --noEmit má projít bez chyby. Hlásí:\n' + r.stdout + r.stderr);
const zdroj = helpers.stripComments(files['emitter.ts'], 'js');
const hlavicky = zdroj.split('\n').filter((radek) => /\b(na|poslat|pocetPosluchacu)\s*[<(]/.test(radek) && /:\s*any\b/.test(radek));
assert.deepEqual(hlavicky, [], 'V hlavičkách na, poslat a pocetPosluchacu nemá být any — tím bys kontrolu vypnul přesně tam, kde má hlídat:\n' + hlavicky.join('\n'));
```

# --help--

## --tip--

Klíčem je typový parametr, který si funkce nechá předat od volajícího, a `keyof`
nad ním — viz [Generika](see:nastroje-typescript/zuzovani-a-genericita#generika-typ-jako-parametr)
a [keyof](see:nastroje-typescript/zuzovani-a-genericita#keyof-a-pomocne-typy).

## --tip--

Metoda `na` potřebuje vlastní typový parametr (ten název události), aby se od něj
dal odvodit typ dat. Data té události získáš indexováním typu: z mapy a klíče.

# --seed--

## --file-- emitter.ts

```ts
/**
 * Vytvoří emitter nad mapou událostí: klíče mapy jsou názvy událostí,
 * hodnoty jsou data, která se k dané události posílají.
 *
 * Emitter má metody:
 *   na(udalost, posluchac)  → zaregistruje posluchače, vrátí funkci na odhlášení
 *   poslat(udalost, data)   → zavolá všechny posluchače té události
 *   pocetPosluchacu(udalost) → počet posluchačů té události
 */
export function vytvorEmitter() {
  // Tvůj kód.
}
```

## --file-- udalosti.ts

```ts
// Události přehrávače podcastů: název události → data, která se k ní posílají.
export type UdalostiPrehravace = {
  'dil:spusten': { id: number; nazev: string };
  'dil:pozastaven': { sekunda: number };
  'hlasitost:zmenena': number;
};
```

## --file-- ukazka.ts

```ts
import { vytvorEmitter } from './emitter.ts';
import type { UdalostiPrehravace } from './udalosti.ts';

const emitter = vytvorEmitter<UdalostiPrehravace>();

emitter.na('dil:spusten', (data) => {
  console.log(`Spouštím díl ${data.id}: ${data.nazev}`);
});

emitter.poslat('dil:spusten', { id: 1, nazev: 'Jak se dělá podcast' });
console.log('Posluchačů na dil:spusten:', emitter.pocetPosluchacu('dil:spusten'));
```

## --file-- tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "noEmit": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true
  },
  "include": ["*.ts"]
}
```

## --file-- package.json

```json
{
  "name": "prehravac-udalosti",
  "type": "module"
}
```

# --solution--

## --file-- emitter.ts

```ts
export type Emitter<M> = {
  na<K extends keyof M>(udalost: K, posluchac: (data: M[K]) => void): () => void;
  poslat<K extends keyof M>(udalost: K, data: M[K]): void;
  pocetPosluchacu(udalost: keyof M): number;
};

type Posluchaci<M> = { [K in keyof M]?: Array<(data: M[K]) => void> };

/**
 * Vytvoří emitter nad mapou událostí: klíče mapy jsou názvy událostí,
 * hodnoty jsou data, která se k dané události posílají.
 */
export function vytvorEmitter<M>(): Emitter<M> {
  const posluchaci: Posluchaci<M> = {};

  return {
    na(udalost, posluchac) {
      const seznam = posluchaci[udalost] ?? [];
      seznam.push(posluchac);
      posluchaci[udalost] = seznam;

      return () => {
        posluchaci[udalost] = (posluchaci[udalost] ?? []).filter((jiny) => jiny !== posluchac);
      };
    },

    poslat(udalost, data) {
      for (const posluchac of posluchaci[udalost] ?? []) {
        posluchac(data);
      }
    },

    pocetPosluchacu(udalost) {
      return (posluchaci[udalost] ?? []).length;
    },
  };
}
```

# --approaches--

## --approach-- Mapa událostí v objektu

Posluchače drží obyčejný objekt, jehož typ vznikne z mapy událostí. Každý klíč
má pole posluchačů se správným typem dat, takže uvnitř emitteru není ani jedno
`any`. Cena za to je jeden složitější typ (`{ [K in keyof M]?: … }`).

### --file-- emitter.ts

```ts
export type Emitter<M> = {
  na<K extends keyof M>(udalost: K, posluchac: (data: M[K]) => void): () => void;
  poslat<K extends keyof M>(udalost: K, data: M[K]): void;
  pocetPosluchacu(udalost: keyof M): number;
};

type Posluchaci<M> = { [K in keyof M]?: Array<(data: M[K]) => void> };

export function vytvorEmitter<M>(): Emitter<M> {
  const posluchaci: Posluchaci<M> = {};

  return {
    na(udalost, posluchac) {
      const seznam = posluchaci[udalost] ?? [];
      seznam.push(posluchac);
      posluchaci[udalost] = seznam;

      return () => {
        posluchaci[udalost] = (posluchaci[udalost] ?? []).filter((jiny) => jiny !== posluchac);
      };
    },

    poslat(udalost, data) {
      for (const posluchac of posluchaci[udalost] ?? []) {
        posluchac(data);
      }
    },

    pocetPosluchacu(udalost) {
      return (posluchaci[udalost] ?? []).length;
    },
  };
}
```

## --approach-- Map a Set uvnitř, typy jen na hranici

Uvnitř se posluchači drží v `Map` a `Set`, kde se typ dat neřeší — hlídá ho
hlavička metod, kterou vidí volající. `Set` navíc zařídí, že se stejný posluchač
nezaregistruje dvakrát, a odhlášení je `delete` bez procházení pole. Nevýhoda:
uvnitř funkce je `any`, takže si tu chybu kontrola neodchytí.

### --file-- emitter.ts

```ts
export type Emitter<M> = {
  na<K extends keyof M>(udalost: K, posluchac: (data: M[K]) => void): () => void;
  poslat<K extends keyof M>(udalost: K, data: M[K]): void;
  pocetPosluchacu(udalost: keyof M): number;
};

export function vytvorEmitter<M>(): Emitter<M> {
  // Uvnitř emitteru už typ dat neřešíme — hlídá ho hlavička metod níž.
  const posluchaci = new Map<keyof M, Set<(data: any) => void>>();

  return {
    na(udalost, posluchac) {
      const sada = posluchaci.get(udalost) ?? new Set();
      sada.add(posluchac);
      posluchaci.set(udalost, sada);

      return () => {
        sada.delete(posluchac);
      };
    },

    poslat(udalost, data) {
      for (const posluchac of posluchaci.get(udalost) ?? []) {
        posluchac(data);
      }
    },

    pocetPosluchacu(udalost) {
      return posluchaci.get(udalost)?.size ?? 0;
    },
  };
}
```

## --approach-- Třída místo objektu

Stejná logika, jen zabalená do třídy. Hodí se, když emitter dědí nebo se z něj
dělá víc instancí s dalším stavem. Metody musí být šipkové funkce nebo se volat
na instanci, jinak si `this` neporadí s odhlášením.

### --file-- emitter.ts

```ts
type Posluchaci<M> = { [K in keyof M]?: Array<(data: M[K]) => void> };

export class Emitter<M> {
  #posluchaci: Posluchaci<M> = {};

  na<K extends keyof M>(udalost: K, posluchac: (data: M[K]) => void): () => void {
    const seznam = this.#posluchaci[udalost] ?? [];
    seznam.push(posluchac);
    this.#posluchaci[udalost] = seznam;

    return () => {
      this.#posluchaci[udalost] = (this.#posluchaci[udalost] ?? []).filter((jiny) => jiny !== posluchac);
    };
  }

  poslat<K extends keyof M>(udalost: K, data: M[K]): void {
    for (const posluchac of this.#posluchaci[udalost] ?? []) {
      posluchac(data);
    }
  }

  pocetPosluchacu(udalost: keyof M): number {
    return (this.#posluchaci[udalost] ?? []).length;
  }
}

export function vytvorEmitter<M>(): Emitter<M> {
  return new Emitter<M>();
}
```
