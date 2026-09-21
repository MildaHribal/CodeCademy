---
title: "Kontrolní bod: nahlášená chyba"
runtime: node
timeoutMs: 60000
---

# --description--

Loděnice ve Vyšším Brodě půjčuje kanoe, rafty a paddleboardy na Vltavu. Ceny počítá
malý modul v TypeScriptu, který jsi nikdy neviděl. Ráno přišlo hlášení od provozní:
je v `ISSUE.md`.

Tohle je kontrolní bod celé části o nástrojích. Žádné tipy, žádné odkazy do lekcí.
Děláš to, co budeš dělat v práci první týden: **přečíst hlášení, zopakovat chybu
testem, opravit ji, dopsat, co chybí, a nechat si všechno pohlídat nástroji.**

## Co se po tobě chce

Nejdřív napiš do `rezervace.test.ts` test, který **selže** na dnešním kódu a popisuje
to, co provozní nahlásila. Teprve potom sáhni do `rezervace.ts`. Test, který jsi
neviděl červený, ti o opravě nic neřekne.

Pak dopiš do modulu souhrn dne, který loděnice potřebuje na večerní uzávěrku. Funkce
`souhrnDne` dostane pole rezervací a vrátí objekt s počtem rezervací, celkovým počtem
lodí a tržbou spočítanou z cen **po slevách**. Prázdný den vrátí samé nuly a pole
rezervací, které funkce dostane, nesmí změnit — jde dál do denního výkazu. K souhrnu
vyveze modul i typ `SouhrnDne`.

Nakonec musí projít obojí: `node --test rezervace.test.ts` i `npx tsc --noEmit`.
Typy nejsou dekorace, kontrola se na ně dívá.

## Ceník a slevy

| typ lodi | sazba za loď a hodinu |
|---|---|
| kanoe | 180 Kč |
| raft | 420 Kč |
| paddleboard | 150 Kč |

Základní cena je sazba × počet lodí × počet hodin. Z ní se počítá sleva:

| sleva | kolik |
|---|---|
| od pěti lodí | 10 % |
| od deseti lodí | 15 % (místo desetiprocentní, ne navíc) |
| člen klubu | 5 % navíc |
| dohromady nejvýš | 20 % |

Výsledná cena je celé číslo korun (půlka se zaokrouhluje nahoru).

## Na co se kontrola dívá

Kromě chování modulu zkouší kontrola i **tvoje testy**: pustí je proti třem schválně
rozbitým verzím `rezervace.ts` a čeká, že u každé sada zčervená. Rozbité verze posunou
hranici deseti lodí, hranici pěti lodí a spočítají tržbu z cen před slevou. Jinými
slovy: mezi tvými testy musí být případ přesně na obou hranicích a souhrn dne, ve
kterém je aspoň jedna zlevněná rezervace.

> [!TIP]
> Testy i kontrolu typů máš v `package.json` jako `npm test` a `npm run typecheck`.
> Při první červené sadě si přečti, co přesně `node --test` vypsal — hlášku čti odspodu.

# --hints--

Cena bez slevy je sazba krát počet lodí krát počet hodin.

```js
const { cenaRezervace } = await helpers.importFile('rezervace.ts');
const zaklad = { id: 'R-1', jmeno: 'Marek Bláha', typ: 'kanoe', pocetLodi: 2, hodiny: 3, clenKlubu: false };
assert.equal(cenaRezervace(zaklad), 1080, 'Dvě kanoe na tři hodiny bez slevy stojí 1080 Kč');
assert.equal(cenaRezervace({ ...zaklad, typ: 'raft', pocetLodi: 1, hodiny: 4 }), 1680, 'Jeden raft na čtyři hodiny stojí 1680 Kč');
assert.equal(cenaRezervace({ ...zaklad, typ: 'paddleboard', pocetLodi: 3, hodiny: 2 }), 900, 'Tři paddleboardy na dvě hodiny stojí 900 Kč');
```

Chyba z `ISSUE.md` je pryč: deset lodí má slevu 15 %.

```js
const { cenaRezervace, slevaVProcentech } = await helpers.importFile('rezervace.ts');
const skupina = { id: 'R-48', jmeno: 'Marek Bláha', typ: 'kanoe', pocetLodi: 10, hodiny: 3, clenKlubu: false };
assert.equal(slevaVProcentech(skupina), 15, 'Deset kanoí má mít slevu 15 %, ne 10 %');
assert.equal(cenaRezervace(skupina), 4590, 'Deset kanoí na tři hodiny stojí po slevě 4590 Kč, ne 4860 Kč');
```

Hranice slev platí včetně a pod nimi se nezlevňuje.

```js
const { cenaRezervace, slevaVProcentech } = await helpers.importFile('rezervace.ts');
const zaklad = { id: 'R-1', jmeno: 'Marek Bláha', typ: 'kanoe', pocetLodi: 2, hodiny: 3, clenKlubu: false };
assert.equal(slevaVProcentech({ ...zaklad, pocetLodi: 4 }), 0, 'Čtyři lodě slevu nemají');
assert.equal(slevaVProcentech({ ...zaklad, pocetLodi: 5 }), 10, 'Pět lodí má slevu 10 %');
assert.equal(slevaVProcentech({ ...zaklad, pocetLodi: 9 }), 10, 'Devět lodí má pořád slevu 10 %');
assert.equal(slevaVProcentech({ ...zaklad, pocetLodi: 11 }), 15, 'Jedenáct lodí má slevu 15 %');
assert.equal(cenaRezervace({ ...zaklad, pocetLodi: 5, hodiny: 2 }), 1620, 'Pět kanoí na dvě hodiny stojí 1620 Kč');
```

Členství přidá pět procent a dohromady se sleva zastaví na dvaceti.

```js
const { cenaRezervace, slevaVProcentech } = await helpers.importFile('rezervace.ts');
const clen = { id: 'R-2', jmeno: 'Hana Šimková', typ: 'kanoe', pocetLodi: 1, hodiny: 3, clenKlubu: true };
assert.equal(slevaVProcentech(clen), 5, 'Člen klubu má i u jedné lodi 5 %');
assert.equal(slevaVProcentech({ ...clen, pocetLodi: 5 }), 15, 'Pět lodí a členství dá dohromady 15 %');
assert.equal(slevaVProcentech({ ...clen, pocetLodi: 10 }), 20, 'Patnáct a pět procent se zastaví na dvaceti');
assert.equal(cenaRezervace({ ...clen, typ: 'raft', pocetLodi: 10, hodiny: 2 }), 6720, 'Deset raftů na dvě hodiny pro člena stojí 6720 Kč');
```

Cena je vždy celé číslo korun.

```js
const { cenaRezervace } = await helpers.importFile('rezervace.ts');
const clen = { id: 'R-3', jmeno: 'Hana Šimková', typ: 'paddleboard', pocetLodi: 7, hodiny: 1, clenKlubu: true };
assert.equal(cenaRezervace(clen), 893, 'Sedm paddleboardů na hodinu pro člena stojí 893 Kč (892,5 se zaokrouhlí nahoru)');
assert.equal(cenaRezervace({ ...clen, pocetLodi: 1 }), 143, 'Jeden paddleboard na hodinu pro člena stojí 143 Kč');
```

`souhrnDne` sečte počet rezervací, lodí a tržbu z cen po slevě.

```js
const { souhrnDne } = await helpers.importFile('rezervace.ts');
assert.equal(typeof souhrnDne, 'function', 'rezervace.ts má vyvézt funkci souhrnDne');
const den = [
  { id: 'R-48', jmeno: 'Marek Bláha', typ: 'kanoe', pocetLodi: 10, hodiny: 3, clenKlubu: false },
  { id: 'R-49', jmeno: 'Petra Vrbová', typ: 'raft', pocetLodi: 1, hodiny: 4, clenKlubu: false },
];
assert.deepEqual(souhrnDne(den), { pocetRezervaci: 2, lodiCelkem: 11, trzba: 6270 }, 'Tržba dne se počítá z cen po slevě: 4590 + 1680');
```

Prázdný den vrátí samé nuly.

```js
const { souhrnDne } = await helpers.importFile('rezervace.ts');
assert.deepEqual(souhrnDne([]), { pocetRezervaci: 0, lodiCelkem: 0, trzba: 0 }, 'Den bez rezervací má mít nulovou tržbu i nulový počet lodí');
```

`souhrnDne` nemění pole rezervací, které dostane.

```js
const { souhrnDne } = await helpers.importFile('rezervace.ts');
const den = [
  { id: 'R-50', jmeno: 'Marek Bláha', typ: 'kanoe', pocetLodi: 5, hodiny: 2, clenKlubu: false },
  { id: 'R-51', jmeno: 'Petra Vrbová', typ: 'paddleboard', pocetLodi: 2, hodiny: 1, clenKlubu: true },
];
const kopie = structuredClone(den);
souhrnDne(den);
assert.deepEqual(den, kopie, 'Pole rezervací jde dál do denního výkazu, souhrn ho nesmí změnit');
```

`node --test rezervace.test.ts` projde a spustí aspoň šest tvých testů.

```js
const beh = await helpers.run('node --test rezervace.test.ts');
assert.equal(beh.code, 0, `Tvoje testy musí nad opraveným modulem projít:\n${beh.stdout}${beh.stderr}`);
const pocet = Number(/^(?:#|\u2139)\s*tests\s+(\d+)/m.exec(beh.stdout)?.[1] ?? 0);
assert.ok(pocet >= 6, `V rezervace.test.ts se spustilo ${pocet} testů, čekám aspoň šest — ceník, obě hranice slev, členství, zaokrouhlení a souhrn dne`);
```

Tvoje testy zčervenají, když se chyba z `ISSUE.md` vrátí.

```js
const fs = await import('node:fs/promises');
assert.ok((files['rezervace.test.ts'] ?? '').trim().length > 0, 'Nejdřív napiš testy do rezervace.test.ts');
const beh = await helpers.run('node --test rezervace.test.ts');
assert.equal(beh.code, 0, `Nejdřív musí tvoje testy projít nad tvým vlastním modulem:\n${beh.stdout}${beh.stderr}`);
const slozka = `${helpers.dir}/mutant-deset`;
await fs.mkdir(slozka, { recursive: true });
for (const [jmeno, obsah] of Object.entries(files)) {
  if (jmeno !== 'rezervace.ts') await fs.writeFile(`${slozka}/${jmeno}`, obsah);
}
await fs.writeFile(`${slozka}/rezervace.ts`, [
  "export * from '../rezervace.ts';",
  "import { slevaVProcentech as puvodni } from '../rezervace.ts';",
  'const SAZBA = { kanoe: 180, raft: 420, paddleboard: 150 };',
  'export function slevaVProcentech(rezervace) {',
  '  if (rezervace.pocetLodi === 10) {',
  '    return Math.min((rezervace.clenKlubu ? 5 : 0) + 10, 20);',
  '  }',
  '  return puvodni(rezervace);',
  '}',
  'export function cenaRezervace(rezervace) {',
  '  const zaklad = SAZBA[rezervace.typ] * rezervace.pocetLodi * rezervace.hodiny;',
  '  return Math.round(zaklad * (1 - slevaVProcentech(rezervace) / 100));',
  '}',
].join('\n'));
const mutant = await helpers.run('node --test mutant-deset/rezervace.test.ts');
assert.notEqual(mutant.code, 0, 'Rozbitá verze dává u deseti lodí zase jen 10 %, a tvoje testy přesto prošly — chybí ti případ přesně na deseti lodích');
```

Tvoje testy zčervenají i při posunuté hranici pěti lodí.

```js
const fs = await import('node:fs/promises');
assert.ok((files['rezervace.test.ts'] ?? '').trim().length > 0, 'Nejdřív napiš testy do rezervace.test.ts');
const beh = await helpers.run('node --test rezervace.test.ts');
assert.equal(beh.code, 0, `Nejdřív musí tvoje testy projít nad tvým vlastním modulem:\n${beh.stdout}${beh.stderr}`);
const slozka = `${helpers.dir}/mutant-pet`;
await fs.mkdir(slozka, { recursive: true });
for (const [jmeno, obsah] of Object.entries(files)) {
  if (jmeno !== 'rezervace.ts') await fs.writeFile(`${slozka}/${jmeno}`, obsah);
}
await fs.writeFile(`${slozka}/rezervace.ts`, [
  "export * from '../rezervace.ts';",
  "import { slevaVProcentech as puvodni } from '../rezervace.ts';",
  'const SAZBA = { kanoe: 180, raft: 420, paddleboard: 150 };',
  'export function slevaVProcentech(rezervace) {',
  '  if (rezervace.pocetLodi === 5) {',
  '    return Math.min((rezervace.clenKlubu ? 5 : 0) + 0, 20);',
  '  }',
  '  return puvodni(rezervace);',
  '}',
  'export function cenaRezervace(rezervace) {',
  '  const zaklad = SAZBA[rezervace.typ] * rezervace.pocetLodi * rezervace.hodiny;',
  '  return Math.round(zaklad * (1 - slevaVProcentech(rezervace) / 100));',
  '}',
].join('\n'));
const mutant = await helpers.run('node --test mutant-pet/rezervace.test.ts');
assert.notEqual(mutant.code, 0, 'Rozbitá verze začíná zlevňovat až od šesti lodí, a tvoje testy přesto prošly — chybí ti případ přesně na pěti lodích');
```

Tvoje testy zčervenají, když souhrn spočítá tržbu z cen před slevou.

```js
const fs = await import('node:fs/promises');
assert.ok((files['rezervace.test.ts'] ?? '').trim().length > 0, 'Nejdřív napiš testy do rezervace.test.ts');
const beh = await helpers.run('node --test rezervace.test.ts');
assert.equal(beh.code, 0, `Nejdřív musí tvoje testy projít nad tvým vlastním modulem:\n${beh.stdout}${beh.stderr}`);
const slozka = `${helpers.dir}/mutant-souhrn`;
await fs.mkdir(slozka, { recursive: true });
for (const [jmeno, obsah] of Object.entries(files)) {
  if (jmeno !== 'rezervace.ts') await fs.writeFile(`${slozka}/${jmeno}`, obsah);
}
await fs.writeFile(`${slozka}/rezervace.ts`, [
  "export * from '../rezervace.ts';",
  'const SAZBA = { kanoe: 180, raft: 420, paddleboard: 150 };',
  'export function souhrnDne(rezervace) {',
  '  return {',
  '    pocetRezervaci: rezervace.length,',
  '    lodiCelkem: rezervace.reduce((soucet, jedna) => soucet + jedna.pocetLodi, 0),',
  '    trzba: rezervace.reduce((soucet, jedna) => soucet + SAZBA[jedna.typ] * jedna.pocetLodi * jedna.hodiny, 0),',
  '  };',
  '}',
].join('\n'));
const mutant = await helpers.run('node --test mutant-souhrn/rezervace.test.ts');
assert.notEqual(mutant.code, 0, 'Rozbitá verze sčítá do tržby ceny před slevou, a tvoje testy přesto prošly — v testu souhrnu musí být aspoň jedna zlevněná rezervace');
```

`npx tsc --noEmit` projde bez jediné chyby.

```js
const beh = await helpers.run('npx tsc --noEmit', { timeoutMs: 45000 });
assert.equal(beh.code, 0, `Kontrola typů musí projít, i pro soubor s testy:\n${beh.stdout}${beh.stderr}`);
```

# --seed--

## --file-- rezervace.test.ts

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cenaRezervace, slevaVProcentech } from './rezervace.ts';
import type { Rezervace } from './rezervace.ts';

--edit--

--edit--
```

## --file-- ISSUE.md

```md
# #48 — Skupina z Tábora dostala menší slevu, než měla

**Nahlásila:** Jitka Marešová, provozní půjčovny
**Kdy:** 14. 9. 2026, 9:40

Marek Bláha objednal pro tábor 10 kanoí na 3 hodiny. Není člen klubu.

V ceníku je od deseti lodí sleva 15 %. Systém mu ale vystavil 4860 Kč, což je
5400 Kč minus 10 %. Museli jsme mu na místě vracet 270 Kč v hotovosti.

| co | částka |
|---|---|
| čekali jsme | 4590 Kč |
| systém vystavil | 4860 Kč |

Zkoušela jsem to i s jiným počtem lodí. Při devíti lodích to vychází správně
(10 %) a při jedenácti taky (15 %). Vypadá to, že to dělá jen přesně u deseti.

Prosím opravte to do soboty, jede nám další velká skupina.
```

## --file-- rezervace.ts

```ts
// Loděnice Vyšší Brod — ceny rezervací lodí na Vltavu.
// Ceník a pravidla slev jsou v README.md.

export type TypLodi = 'kanoe' | 'raft' | 'paddleboard';

export type Rezervace = {
  id: string;
  jmeno: string;
  typ: TypLodi;
  pocetLodi: number;
  hodiny: number;
  clenKlubu: boolean;
};

export const SAZBA: Record<TypLodi, number> = {
  kanoe: 180,
  raft: 420,
  paddleboard: 150,
};

export function slevaVProcentech(rezervace: Rezervace): number {
  let sleva = 0;
  if (rezervace.pocetLodi > 10) {
    sleva += 15;
  } else if (rezervace.pocetLodi >= 5) {
    sleva += 10;
  }
  if (rezervace.clenKlubu) {
    sleva += 5;
  }
  return Math.min(sleva, 20);
}

export function cenaRezervace(rezervace: Rezervace): number {
  const zaklad = SAZBA[rezervace.typ] * rezervace.pocetLodi * rezervace.hodiny;
  return Math.round(zaklad * (1 - slevaVProcentech(rezervace) / 100));
}
```

## --file-- README.md

```md
# Loděnice Vyšší Brod — ceny rezervací

Spuštění testů: `npm test`. Kontrola typů: `npm run typecheck`.

## Ceník

| typ lodi | sazba za loď a hodinu |
|---|---|
| kanoe | 180 Kč |
| raft | 420 Kč |
| paddleboard | 150 Kč |

## Slevy

Základní cena je sazba × počet lodí × počet hodin.

| sleva | kolik |
|---|---|
| od pěti lodí | 10 % |
| od deseti lodí | 15 % (místo desetiprocentní, ne navíc) |
| člen klubu | 5 % navíc |
| dohromady nejvýš | 20 % |

Výsledná cena je celé číslo korun, půlka se zaokrouhluje nahoru.
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
    "rewriteRelativeImportExtensions": true
  },
  "include": ["*.ts"]
}
```

## --file-- package.json

```json
{
  "name": "lodenice-rezervace",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test rezervace.test.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

# --solution--

## --file-- rezervace.ts

```ts
// Loděnice Vyšší Brod — ceny rezervací lodí na Vltavu.
// Ceník a pravidla slev jsou v README.md.

export type TypLodi = 'kanoe' | 'raft' | 'paddleboard';

export type Rezervace = {
  id: string;
  jmeno: string;
  typ: TypLodi;
  pocetLodi: number;
  hodiny: number;
  clenKlubu: boolean;
};

export type SouhrnDne = {
  pocetRezervaci: number;
  lodiCelkem: number;
  trzba: number;
};

export const SAZBA: Record<TypLodi, number> = {
  kanoe: 180,
  raft: 420,
  paddleboard: 150,
};

export function slevaVProcentech(rezervace: Rezervace): number {
  let sleva = 0;
  if (rezervace.pocetLodi >= 10) {
    sleva += 15;
  } else if (rezervace.pocetLodi >= 5) {
    sleva += 10;
  }
  if (rezervace.clenKlubu) {
    sleva += 5;
  }
  return Math.min(sleva, 20);
}

export function cenaRezervace(rezervace: Rezervace): number {
  const zaklad = SAZBA[rezervace.typ] * rezervace.pocetLodi * rezervace.hodiny;
  return Math.round(zaklad * (1 - slevaVProcentech(rezervace) / 100));
}

export function souhrnDne(rezervace: readonly Rezervace[]): SouhrnDne {
  return {
    pocetRezervaci: rezervace.length,
    lodiCelkem: rezervace.reduce((soucet, jedna) => soucet + jedna.pocetLodi, 0),
    trzba: rezervace.reduce((soucet, jedna) => soucet + cenaRezervace(jedna), 0),
  };
}
```

## --file-- rezervace.test.ts

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cenaRezervace, slevaVProcentech, souhrnDne } from './rezervace.ts';
import type { Rezervace } from './rezervace.ts';

function rezervace(zmeny: Partial<Rezervace> = {}): Rezervace {
  return {
    id: 'R-1',
    jmeno: 'Marek Bláha',
    typ: 'kanoe',
    pocetLodi: 2,
    hodiny: 3,
    clenKlubu: false,
    ...zmeny,
  };
}

test('cena bez slevy je sazba krát lodě krát hodiny', () => {
  assert.equal(cenaRezervace(rezervace()), 1080, 'Dvě kanoe na tři hodiny stojí 1080 Kč');
  assert.equal(cenaRezervace(rezervace({ typ: 'raft', pocetLodi: 1, hodiny: 4 })), 1680, 'Jeden raft na čtyři hodiny stojí 1680 Kč');
  assert.equal(cenaRezervace(rezervace({ typ: 'paddleboard', pocetLodi: 3, hodiny: 2 })), 900, 'Tři paddleboardy na dvě hodiny stojí 900 Kč');
});

test('desátá loď už zlevňuje o patnáct procent (ISSUE #48)', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 10 })), 15, 'Deset lodí má mít slevu 15 %');
  assert.equal(cenaRezervace(rezervace({ pocetLodi: 10 })), 4590, 'Deset kanoí na tři hodiny stojí po slevě 4590 Kč');
});

test('hranice objemové slevy platí včetně', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 4 })), 0, 'Čtyři lodě slevu nemají');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 5 })), 10, 'Pět lodí má slevu 10 %');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 9 })), 10, 'Devět lodí má pořád slevu 10 %');
  assert.equal(cenaRezervace(rezervace({ pocetLodi: 5, hodiny: 2 })), 1620, 'Pět kanoí na dvě hodiny stojí 1620 Kč');
});

test('členství přidá pět procent, dohromady nejvýš dvacet', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 1, clenKlubu: true })), 5, 'Člen klubu má i u jedné lodi 5 %');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 5, clenKlubu: true })), 15, 'Pět lodí a členství dá 15 %');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 10, clenKlubu: true })), 20, 'Patnáct a pět procent se zastaví na dvaceti');
  assert.equal(cenaRezervace(rezervace({ typ: 'raft', pocetLodi: 10, hodiny: 2, clenKlubu: true })), 6720, 'Deset raftů na dvě hodiny pro člena stojí 6720 Kč');
});

test('cena je vždy celé číslo korun', () => {
  assert.equal(cenaRezervace(rezervace({ typ: 'paddleboard', pocetLodi: 7, hodiny: 1, clenKlubu: true })), 893, 'Sedm paddleboardů na hodinu pro člena stojí 893 Kč');
  assert.equal(cenaRezervace(rezervace({ typ: 'paddleboard', pocetLodi: 1, hodiny: 1, clenKlubu: true })), 143, 'Jeden paddleboard na hodinu pro člena stojí 143 Kč');
});

test('souhrn dne sečte rezervace, lodě a tržbu po slevách', () => {
  const den = [
    rezervace({ id: 'R-48', pocetLodi: 10, hodiny: 3 }),
    rezervace({ id: 'R-49', jmeno: 'Petra Vrbová', typ: 'raft', pocetLodi: 1, hodiny: 4 }),
  ];
  assert.deepEqual(souhrnDne(den), { pocetRezervaci: 2, lodiCelkem: 11, trzba: 6270 }, 'Tržba dne se počítá z cen po slevě: 4590 + 1680');
});

test('souhrn prázdného dne vrátí samé nuly', () => {
  assert.deepEqual(souhrnDne([]), { pocetRezervaci: 0, lodiCelkem: 0, trzba: 0 }, 'Den bez rezervací má mít nulovou tržbu');
});

test('souhrn nemění pole rezervací, které dostane', () => {
  const den = [rezervace({ id: 'R-50', pocetLodi: 5 }), rezervace({ id: 'R-51', pocetLodi: 2 })];
  const kopie = structuredClone(den);
  souhrnDne(den);
  assert.deepEqual(den, kopie, 'Pole rezervací se souhrnem nesmí změnit');
});
```

# --approaches--

## --approach-- Hranice slev jako seřazená tabulka

Objemové slevy jsou data, ne kaskáda `if`ů: pole seřazené od nejvyšší hranice
a `find`, který vybere první, na kterou počet lodí dosáhne. Nová hranice pak znamená
jeden řádek v tabulce. Testy jsou psané stejně — tabulka případů, ze které se
v cyklu vyrobí jednotlivé testy.

### --file-- rezervace.ts

```ts
// Loděnice Vyšší Brod — ceny rezervací lodí na Vltavu.
// Objemové slevy jsou v tabulce seřazené od nejvyšší hranice.

export type TypLodi = 'kanoe' | 'raft' | 'paddleboard';

export type Rezervace = {
  id: string;
  jmeno: string;
  typ: TypLodi;
  pocetLodi: number;
  hodiny: number;
  clenKlubu: boolean;
};

export type SouhrnDne = {
  pocetRezervaci: number;
  lodiCelkem: number;
  trzba: number;
};

export const SAZBA: Record<TypLodi, number> = {
  kanoe: 180,
  raft: 420,
  paddleboard: 150,
};

const OBJEMOVE_SLEVY = [
  { odLodi: 10, procent: 15 },
  { odLodi: 5, procent: 10 },
];

const SLEVA_CLENA = 5;
const MAXIMALNI_SLEVA = 20;

export function slevaVProcentech(rezervace: Rezervace): number {
  const objem = OBJEMOVE_SLEVY.find((stupen) => rezervace.pocetLodi >= stupen.odLodi);
  const zaObjem = objem ? objem.procent : 0;
  const zaClenstvi = rezervace.clenKlubu ? SLEVA_CLENA : 0;
  return Math.min(zaObjem + zaClenstvi, MAXIMALNI_SLEVA);
}

export function cenaRezervace(rezervace: Rezervace): number {
  const zaklad = SAZBA[rezervace.typ] * rezervace.pocetLodi * rezervace.hodiny;
  return Math.round(zaklad * (1 - slevaVProcentech(rezervace) / 100));
}

export function souhrnDne(rezervace: readonly Rezervace[]): SouhrnDne {
  return {
    pocetRezervaci: rezervace.length,
    lodiCelkem: rezervace.reduce((soucet, jedna) => soucet + jedna.pocetLodi, 0),
    trzba: rezervace.reduce((soucet, jedna) => soucet + cenaRezervace(jedna), 0),
  };
}
```

### --file-- rezervace.test.ts

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cenaRezervace, slevaVProcentech, souhrnDne } from './rezervace.ts';
import type { Rezervace } from './rezervace.ts';

const zaklad: Rezervace = {
  id: 'R-1',
  jmeno: 'Marek Bláha',
  typ: 'kanoe',
  pocetLodi: 2,
  hodiny: 3,
  clenKlubu: false,
};

const slevy: { nazev: string; zmena: Partial<Rezervace>; procent: number }[] = [
  { nazev: 'čtyři lodě bez slevy', zmena: { pocetLodi: 4 }, procent: 0 },
  { nazev: 'pět lodí je hranice desetiprocentní slevy', zmena: { pocetLodi: 5 }, procent: 10 },
  { nazev: 'devět lodí má pořád deset procent', zmena: { pocetLodi: 9 }, procent: 10 },
  { nazev: 'deset lodí je hranice patnáctiprocentní slevy', zmena: { pocetLodi: 10 }, procent: 15 },
  { nazev: 'jedna loď pro člena klubu', zmena: { pocetLodi: 1, clenKlubu: true }, procent: 5 },
  { nazev: 'pět lodí pro člena klubu', zmena: { pocetLodi: 5, clenKlubu: true }, procent: 15 },
  { nazev: 'deset lodí pro člena klubu se zastaví na dvaceti', zmena: { pocetLodi: 10, clenKlubu: true }, procent: 20 },
];

for (const { nazev, zmena, procent } of slevy) {
  test(`sleva: ${nazev}`, () => {
    assert.equal(slevaVProcentech({ ...zaklad, ...zmena }), procent, `Případ „${nazev}“ má mít slevu ${procent} %`);
  });
}

const ceny: { nazev: string; zmena: Partial<Rezervace>; cena: number }[] = [
  { nazev: 'dvě kanoe na tři hodiny', zmena: {}, cena: 1080 },
  { nazev: 'jeden raft na čtyři hodiny', zmena: { typ: 'raft', pocetLodi: 1, hodiny: 4 }, cena: 1680 },
  { nazev: 'tři paddleboardy na dvě hodiny', zmena: { typ: 'paddleboard', pocetLodi: 3, hodiny: 2 }, cena: 900 },
  { nazev: 'deset kanoí na tři hodiny (ISSUE #48)', zmena: { pocetLodi: 10 }, cena: 4590 },
  { nazev: 'pět kanoí na dvě hodiny', zmena: { pocetLodi: 5, hodiny: 2 }, cena: 1620 },
  { nazev: 'deset raftů na dvě hodiny pro člena', zmena: { typ: 'raft', pocetLodi: 10, hodiny: 2, clenKlubu: true }, cena: 6720 },
  { nazev: 'sedm paddleboardů na hodinu pro člena se zaokrouhlí nahoru', zmena: { typ: 'paddleboard', pocetLodi: 7, hodiny: 1, clenKlubu: true }, cena: 893 },
];

for (const { nazev, zmena, cena } of ceny) {
  test(`cena: ${nazev}`, () => {
    assert.equal(cenaRezervace({ ...zaklad, ...zmena }), cena, `Případ „${nazev}“ má stát ${cena} Kč`);
  });
}

test('souhrn dne počítá tržbu z cen po slevě', () => {
  const den: Rezervace[] = [
    { ...zaklad, id: 'R-48', pocetLodi: 10, hodiny: 3 },
    { ...zaklad, id: 'R-49', jmeno: 'Petra Vrbová', typ: 'raft', pocetLodi: 1, hodiny: 4 },
  ];
  assert.deepEqual(souhrnDne(den), { pocetRezervaci: 2, lodiCelkem: 11, trzba: 6270 }, 'Tržba dne je 4590 + 1680');
});

test('souhrn prázdného dne vrátí samé nuly', () => {
  assert.deepEqual(souhrnDne([]), { pocetRezervaci: 0, lodiCelkem: 0, trzba: 0 }, 'Den bez rezervací má mít nulovou tržbu');
});

test('souhrn nemění pole rezervací, které dostane', () => {
  const den: Rezervace[] = [{ ...zaklad, pocetLodi: 5 }, { ...zaklad, id: 'R-2', pocetLodi: 2 }];
  const kopie = structuredClone(den);
  souhrnDne(den);
  assert.deepEqual(den, kopie, 'Pole rezervací se souhrnem nesmí změnit');
});
```

## --approach-- Jeden průchod dnem a pojmenované mezivýsledky

Kaskáda `if`ů zůstane, protože pravidla jsou dvě a čtou se jako ceník. Souhrn
ale neprochází pole třikrát: jeden cyklus `for…of` nasčítá všechno naráz, takže
u velkého dne stačí jeden průchod. Testy jsou psané jmenovitě, jeden na pravidlo.

### --file-- rezervace.ts

```ts
// Loděnice Vyšší Brod — ceny rezervací lodí na Vltavu.
// Souhrn dne se počítá jedním průchodem, ať se pole neprochází třikrát.

export type TypLodi = 'kanoe' | 'raft' | 'paddleboard';

export type Rezervace = {
  id: string;
  jmeno: string;
  typ: TypLodi;
  pocetLodi: number;
  hodiny: number;
  clenKlubu: boolean;
};

export type SouhrnDne = {
  pocetRezervaci: number;
  lodiCelkem: number;
  trzba: number;
};

export const SAZBA: Record<TypLodi, number> = {
  kanoe: 180,
  raft: 420,
  paddleboard: 150,
};

export function slevaVProcentech(rezervace: Rezervace): number {
  let sleva = 0;
  if (rezervace.pocetLodi >= 10) {
    sleva += 15;
  } else if (rezervace.pocetLodi >= 5) {
    sleva += 10;
  }
  if (rezervace.clenKlubu) {
    sleva += 5;
  }
  return Math.min(sleva, 20);
}

export function zakladniCena(rezervace: Rezervace): number {
  return SAZBA[rezervace.typ] * rezervace.pocetLodi * rezervace.hodiny;
}

export function cenaRezervace(rezervace: Rezervace): number {
  const sleva = slevaVProcentech(rezervace);
  return Math.round(zakladniCena(rezervace) * (1 - sleva / 100));
}

export function souhrnDne(rezervace: readonly Rezervace[]): SouhrnDne {
  const souhrn: SouhrnDne = { pocetRezervaci: 0, lodiCelkem: 0, trzba: 0 };
  for (const jedna of rezervace) {
    souhrn.pocetRezervaci += 1;
    souhrn.lodiCelkem += jedna.pocetLodi;
    souhrn.trzba += cenaRezervace(jedna);
  }
  return souhrn;
}
```

### --file-- rezervace.test.ts

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cenaRezervace, slevaVProcentech, souhrnDne, zakladniCena } from './rezervace.ts';
import type { Rezervace } from './rezervace.ts';

function rezervace(zmeny: Partial<Rezervace> = {}): Rezervace {
  return {
    id: 'R-1',
    jmeno: 'Marek Bláha',
    typ: 'kanoe',
    pocetLodi: 2,
    hodiny: 3,
    clenKlubu: false,
    ...zmeny,
  };
}

test('základní cena nezná slevy', () => {
  assert.equal(zakladniCena(rezervace()), 1080, 'Dvě kanoe na tři hodiny mají základ 1080 Kč');
  assert.equal(zakladniCena(rezervace({ typ: 'raft', pocetLodi: 1, hodiny: 4 })), 1680, 'Jeden raft na čtyři hodiny má základ 1680 Kč');
  assert.equal(zakladniCena(rezervace({ pocetLodi: 10 })), 5400, 'Deset kanoí na tři hodiny má základ 5400 Kč i přes slevu');
});

test('deset lodí zlevňuje o patnáct procent (ISSUE #48)', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 10 })), 15, 'Deset lodí má slevu 15 %');
  assert.equal(cenaRezervace(rezervace({ pocetLodi: 10 })), 4590, 'Deset kanoí na tři hodiny stojí 4590 Kč');
});

test('pod pěti loděmi se nezlevňuje, od pěti o deset procent', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 4 })), 0, 'Čtyři lodě slevu nemají');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 5 })), 10, 'Pět lodí má slevu 10 %');
  assert.equal(cenaRezervace(rezervace({ pocetLodi: 5, hodiny: 2 })), 1620, 'Pět kanoí na dvě hodiny stojí 1620 Kč');
});

test('devět lodí ještě nedosáhne na patnáct procent', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 9 })), 10, 'Devět lodí má pořád 10 %');
});

test('členství přidá pět procent, strop je dvacet', () => {
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 1, clenKlubu: true })), 5, 'Člen má i u jedné lodi 5 %');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 5, clenKlubu: true })), 15, 'Pět lodí a členství dá 15 %');
  assert.equal(slevaVProcentech(rezervace({ pocetLodi: 10, clenKlubu: true })), 20, 'Nad dvacet procent sleva nejde');
});

test('cena vychází v celých korunách', () => {
  assert.equal(cenaRezervace(rezervace({ typ: 'paddleboard', pocetLodi: 7, hodiny: 1, clenKlubu: true })), 893, 'Sedm paddleboardů pro člena stojí 893 Kč');
  assert.equal(cenaRezervace(rezervace({ typ: 'raft', pocetLodi: 10, hodiny: 2, clenKlubu: true })), 6720, 'Deset raftů na dvě hodiny pro člena stojí 6720 Kč');
});

test('souhrn dne sečte tržbu z cen po slevě', () => {
  const den = [
    rezervace({ id: 'R-48', pocetLodi: 10, hodiny: 3 }),
    rezervace({ id: 'R-49', jmeno: 'Petra Vrbová', typ: 'raft', pocetLodi: 1, hodiny: 4 }),
  ];
  assert.deepEqual(souhrnDne(den), { pocetRezervaci: 2, lodiCelkem: 11, trzba: 6270 }, 'Tržba dne je 4590 + 1680');
});

test('souhrn prázdného dne a neměnnost vstupu', () => {
  assert.deepEqual(souhrnDne([]), { pocetRezervaci: 0, lodiCelkem: 0, trzba: 0 }, 'Den bez rezervací má nulovou tržbu');
  const den = [rezervace({ pocetLodi: 5 }), rezervace({ id: 'R-2', pocetLodi: 2 })];
  const kopie = structuredClone(den);
  souhrnDne(den);
  assert.deepEqual(den, kopie, 'Pole rezervací se souhrnem nesmí změnit');
});
```

# --review--

Kontrola ověřila, že modul počítá správně a že tvoje testy chybu opravdu chytnou.
Zbytek je na tobě — a přesně na tohle se dívá kolega, když mu přijde tvoje oprava.

## --rubric--

- Test na nahlášenou chybu jsi **nejdřív viděl červený** a teprve potom opravil kód.
- Jméno testu odkazuje na chování („deset lodí zlevňuje o patnáct procent"),
  ne na číslo issue samotné.
- Oprava je co nejmenší: v `rezervace.ts` se změnilo to, co bylo špatně, a nic dalšího.
- V testech je obě hranice každého pravidla, ne jen hodnota uprostřed rozsahu.
- Typy `SouhrnDne` a `Rezervace` popisují data, ne „nějaký objekt" — `any` v modulu není.
- Aserce mají české zprávy, ze kterých poznáš vstup i očekávání bez čtení kódu.
- Kdybys po roce dostal stejné hlášení znovu, testy ti řeknou, jestli je to regrese,
  nebo nové chování.

## --extensions--

Rozšíření bez testů:

- Přidej sezónní příplatek (červenec a srpen +20 %) a rozmysli si, jestli se počítá
  před slevou, nebo po ní. Napiš si napřed test, který tvoje rozhodnutí zapíše.
- Nech `souhrnDne` vracet i rozpad tržby podle typu lodi a ohlídej testem, že součet
  částí sedí s celkem.
- Zkus modul rozbít sám: změň v `rezervace.ts` `Math.round` na `Math.floor` a podívej
  se, které z tvých testů zčervenají. Když žádný, víš, kde máš díru.
- Vezmi `ISSUE.md` a napiš pod něj odpověď provozní ve dvou větách: co bylo špatně
  a od kdy to platí správně. Psát srozumitelně o chybě je stejná dovednost jako ji najít.
