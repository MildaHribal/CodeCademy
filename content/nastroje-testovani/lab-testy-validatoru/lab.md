---
title: Testy pro cizí kód
runtime: node
timeoutMs: 30000
see: nastroje-testovani/proc-testovat#okrajove-pripady
---

# --description--

Dům dětí a mládeže v Táboře přijímá přihlášky do kroužku robotiky přes web.
Kontrolu vyplněné přihlášky napsal loni Radek Vávra a od té doby se jí nikdo
nedotkl — až teď, když si vedoucí kroužku stěžuje. Tři rodiče se nemohli přihlásit,
přestože vyplnili všechno správně, a jednomu se u druhého dítěte objevily chyby,
které se týkaly toho prvního.

Dostals `prihlaska.js` a prázdný soubor `prihlaska.test.js`. Pravidla, podle kterých
se přihláška posuzuje, jsou dole. Kód je nezná — ty ano.

**Postupuj jako na skutečné opravě: nejdřív test, který chybu ukáže červeně, pak
oprava.** Test, který jsi nikdy neviděl selhat, ti o kódu neřekne nic.

## Jak se přihláška posuzuje

`zkontrolujPrihlasku(prihlaska)` vrátí objekt se dvěma klíči: `platna` (pravda,
nebo nepravda) a `chyby` (pole kódů chyb). Kódy jdou vždy v tomhle pořadí:
`'jmeno'`, `'email'`, `'vek'`, `'psc'`, `'souhlas'`.

| pravidlo | kód chyby | platí | neplatí |
|---|---|---|---|
| **jméno** — po oříznutí mezer aspoň tři znaky a mezera uvnitř (jméno i příjmení) | `jmeno` | `'Eva Němcová'` | `'Eva'`, `'  '`, chybějící klíč |
| **e-mail** — text ve tvaru `někdo@doména.tld`; mezery kolem a velikost písmen nevadí | `email` | `'  Eva.Nemcova@Seznam.CZ '` | `'eva@seznam'`, `'eva@@seznam.cz'` |
| **věk** — celé číslo od 6 do 18 **včetně** | `vek` | `6`, `18` | `5`, `19`, `'12'`, `12.5` |
| **PSČ** — text z pěti číslic, mezera po třetí číslici je povolená | `psc` | `'391 01'`, `'39101'` | `'3910'`, `'39 101'`, číslo `39101` |
| **souhlas rodiče** — dítě mladší 15 let musí mít `souhlasRodice: true` | `souhlas` | 14 let se souhlasem, 15 let bez něj | 14 let bez souhlasu |

Když je věk neplatný, souhlas se už neposuzuje — `vek` stačí.

## Co po tobě chce vedoucí kroužku

Když rodič odešle vyplněnou přihlášku, dostane zpátky `platna: true` a prázdné pole
chyb. Když v ní něco chybí nebo je špatně, dostane seznam kódů v pořadí pravidel,
a to i tehdy, když je přihláška prázdná — formulář nesmí spadnout.

Když rodič vyplní přihlášku pro druhé dítě, nesmí v ní vidět chyby toho prvního.
Kontrola také nesmí přihlášku, kterou dostane, jakkoli změnit — stejný objekt se
posílá dál na server.

A protože se pravidla kroužku každý rok mění, chce po tobě vedoucí i sadu testů:
takovou, která spadne, kdyby někdo příští rok posunul hranici věku, zakázal mezeru
v PSČ nebo si chyby omylem nechal mezi voláními. Pár testů proto kontrola pustí
proti schválně rozbitým verzím `prihlaska.js` a čeká, že je tvoje testy odhalí.

> [!TIP]
> Testy si pouštěj v terminálu příkazem `node --test prihlaska.test.js`, ať vidíš
> celý výpis. Tlačítko **Zkontrolovat** dělá totéž a navíc zkouší tvoje testy proti
> podstrčeným chybám.

Jak testy rozvrhneš, je na tobě: jeden test na pravidlo, nebo tabulka případů v cyklu.
Kontrola se dívá jen na to, co tvoje testy chytí.

# --hints--

Vyplněná přihláška projde a vrátí prázdné pole chyb.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const eva = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
assert.deepEqual(zkontrolujPrihlasku(eva), { platna: true, chyby: [] }, 'Přihláška Evy Němcové (12 let, PSČ 391 01, souhlas rodiče) má být platná');
```

Jméno bez příjmení a e-mail bez tečky v doméně mají vlastní kód chyby.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const zaklad = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, jmeno: 'Eva' }).chyby, ['jmeno'], 'Jméno „Eva“ bez příjmení má dát chybu jmeno');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, jmeno: '   ' }).chyby, ['jmeno'], 'Jméno ze samých mezer má dát chybu jmeno');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, email: 'eva@seznam' }).chyby, ['email'], 'E-mail „eva@seznam“ nemá doménu s tečkou, má dát chybu email');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, email: 'eva@@seznam.cz' }).chyby, ['email'], 'E-mail se dvěma zavináči má dát chybu email');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, email: '  Eva.Nemcova@Seznam.CZ ' }).chyby, [], 'Mezery kolem e-mailu a velká písmena vadit nesmí');
```

Šest i osmnáct let přihláška přijme, pět a devatenáct odmítne.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const zaklad = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 6 }).chyby, [], 'Šestileté dítě se souhlasem rodiče má projít — hranice 6 let platí včetně');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 18, souhlasRodice: false }).chyby, [], 'Osmnáctiletý má projít i bez souhlasu rodiče — hranice 18 let platí včetně');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 5 }).chyby, ['vek'], 'Pětileté dítě má dát chybu vek');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 19 }).chyby, ['vek'], 'Devatenáctiletý má dát chybu vek');
```

Věk musí být celé číslo, ne text ani desetinné číslo.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const zaklad = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
for (const vek of ['12', 12.5, null, undefined, NaN]) {
  assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek }).chyby, ['vek'], `Věk ${String(vek)} má dát chybu vek`);
}
```

PSČ projde s mezerou po třetí číslici i bez ní, jiný tvar ne.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const zaklad = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, psc: '391 01' }).chyby, [], 'PSČ „391 01“ s mezerou má projít');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, psc: '39101' }).chyby, [], 'PSČ „39101“ bez mezery má projít');
for (const psc of ['3910', '39 101', '391011', '391 01 ', 39101, null]) {
  assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, psc }).chyby, ['psc'], `PSČ ${JSON.stringify(psc)} má dát chybu psc`);
}
```

Dítě mladší 15 let potřebuje souhlas rodiče, starší ne.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const zaklad = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 14, souhlasRodice: false }).chyby, ['souhlas'], 'Čtrnáctiletý bez souhlasu rodiče má dát chybu souhlas');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 14, souhlasRodice: undefined }).chyby, ['souhlas'], 'Chybějící souhlas je totéž jako nesouhlas');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 14, souhlasRodice: 'ano' }).chyby, ['souhlas'], 'Souhlas musí být přesně true, text „ano“ nestačí');
assert.deepEqual(zkontrolujPrihlasku({ ...zaklad, vek: 15, souhlasRodice: false }).chyby, [], 'Od 15 let se souhlas rodiče neposuzuje');
```

Prázdná přihláška nespadne a vrátí chyby v pořadí pravidel.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const vysledek = zkontrolujPrihlasku({});
assert.equal(vysledek.platna, false, 'Prázdná přihláška nemá být platná');
assert.deepEqual(vysledek.chyby, ['jmeno', 'email', 'vek', 'psc'], 'U prázdné přihlášky je neplatný i věk, takže se souhlas už neposuzuje');
```

Klíč `platna` odpovídá tomu, jestli je pole chyb prázdné.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const zaklad = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
const prihlasky = [
  zaklad,
  { ...zaklad, jmeno: 'Eva' },
  { ...zaklad, vek: 19, psc: '3910' },
  {},
];
for (const prihlaska of prihlasky) {
  const vysledek = zkontrolujPrihlasku(prihlaska);
  assert.ok(Array.isArray(vysledek.chyby), 'Klíč chyby má být pole');
  assert.equal(vysledek.platna, vysledek.chyby.length === 0, `Pro přihlášku ${JSON.stringify(prihlaska)} neodpovídá platna délce pole chyb`);
}
```

Druhá kontrola nevidí chyby z té první.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const eva = { jmeno: 'Eva Němcová', email: 'eva.nemcova@seznam.cz', vek: 12, psc: '391 01', souhlasRodice: true };
zkontrolujPrihlasku({});
zkontrolujPrihlasku({ ...eva, vek: 3 });
assert.deepEqual(zkontrolujPrihlasku(eva), { platna: true, chyby: [] }, 'Po dvou neplatných přihláškách musí platná přihláška pořád vyjít jako platná');
const prvni = zkontrolujPrihlasku({ ...eva, jmeno: 'Eva' });
const druha = zkontrolujPrihlasku({ ...eva, psc: '3910' });
assert.notEqual(prvni.chyby, druha.chyby, 'Každé volání má vrátit vlastní pole chyb, ne pořád totéž');
assert.deepEqual(druha.chyby, ['psc'], 'Druhé volání má hlásit jen svou vlastní chybu');
```

Kontrola nemění přihlášku, kterou dostane.

```js
const { zkontrolujPrihlasku } = await helpers.importFile('prihlaska.js');
const vstup = { jmeno: '  Eva Němcová  ', email: '  Eva.Nemcova@Seznam.CZ ', vek: 12, psc: '391 01', souhlasRodice: true };
const kopie = structuredClone(vstup);
zkontrolujPrihlasku(vstup);
assert.deepEqual(vstup, kopie, 'Přihláška se po kontrole nesmí změnit — stejný objekt jde dál na server');
```

`node --test prihlaska.test.js` projde a spustí aspoň osm tvých testů.

```js
const beh = await helpers.run('node --test prihlaska.test.js');
assert.equal(beh.code, 0, `Tvoje testy musí nad opraveným kódem projít:\n${beh.stdout}${beh.stderr}`);
const pocet = Number(/^(?:#|\u2139)\s*tests\s+(\d+)/m.exec(beh.stdout)?.[1] ?? 0);
assert.ok(pocet >= 8, `V prihlaska.test.js se spustilo ${pocet} testů, čekám aspoň osm — jedno pravidlo si zaslouží aspoň jeden test`);
```

Tvoje testy odhalí posunutou hranici věku.

```js
const fs = await import('node:fs/promises');
assert.ok((files['prihlaska.test.js'] ?? '').trim().length > 0, 'Nejdřív napiš testy do prihlaska.test.js');
const beh = await helpers.run('node --test prihlaska.test.js');
assert.equal(beh.code, 0, `Nejdřív musí tvoje testy projít nad tvým vlastním kódem:\n${beh.stdout}${beh.stderr}`);
const slozka = `${helpers.dir}/mutant-vek`;
await fs.mkdir(slozka, { recursive: true });
for (const [jmeno, obsah] of Object.entries(files)) {
  if (jmeno !== 'prihlaska.js') await fs.writeFile(`${slozka}/${jmeno}`, obsah);
}
await fs.writeFile(`${slozka}/prihlaska.js`, [
  "import { zkontrolujPrihlasku as puvodni } from '../prihlaska.js';",
  'export function zkontrolujPrihlasku(prihlaska) {',
  '  const vysledek = puvodni(prihlaska);',
  '  if (prihlaska.vek === 6 || prihlaska.vek === 18) {',
  "    return { platna: false, chyby: [...new Set([...vysledek.chyby, 'vek'])] };",
  '  }',
  '  return vysledek;',
  '}',
].join('\n'));
const mutant = await helpers.run('node --test mutant-vek/prihlaska.test.js');
assert.notEqual(mutant.code, 0, 'Podstrčená verze odmítá šestileté i osmnáctileté děti, a tvoje testy přesto prošly — chybí ti případ přesně na obou hranicích věku');
```

Tvoje testy odhalí zakázanou mezeru v PSČ.

```js
const fs = await import('node:fs/promises');
assert.ok((files['prihlaska.test.js'] ?? '').trim().length > 0, 'Nejdřív napiš testy do prihlaska.test.js');
const beh = await helpers.run('node --test prihlaska.test.js');
assert.equal(beh.code, 0, `Nejdřív musí tvoje testy projít nad tvým vlastním kódem:\n${beh.stdout}${beh.stderr}`);
const slozka = `${helpers.dir}/mutant-psc`;
await fs.mkdir(slozka, { recursive: true });
for (const [jmeno, obsah] of Object.entries(files)) {
  if (jmeno !== 'prihlaska.js') await fs.writeFile(`${slozka}/${jmeno}`, obsah);
}
await fs.writeFile(`${slozka}/prihlaska.js`, [
  "import { zkontrolujPrihlasku as puvodni } from '../prihlaska.js';",
  'export function zkontrolujPrihlasku(prihlaska) {',
  '  const vysledek = puvodni(prihlaska);',
  "  if (typeof prihlaska.psc === 'string' && prihlaska.psc.includes(' ')) {",
  "    return { platna: false, chyby: [...new Set([...vysledek.chyby, 'psc'])] };",
  '  }',
  '  return vysledek;',
  '}',
].join('\n'));
const mutant = await helpers.run('node --test mutant-psc/prihlaska.test.js');
assert.notEqual(mutant.code, 0, 'Podstrčená verze odmítá PSČ s mezerou, a tvoje testy přesto prošly — chybí ti případ s PSČ zapsaným jako „391 01“');
```

Tvoje testy odhalí chyby, které se přenášejí mezi voláními.

```js
const fs = await import('node:fs/promises');
assert.ok((files['prihlaska.test.js'] ?? '').trim().length > 0, 'Nejdřív napiš testy do prihlaska.test.js');
const beh = await helpers.run('node --test prihlaska.test.js');
assert.equal(beh.code, 0, `Nejdřív musí tvoje testy projít nad tvým vlastním kódem:\n${beh.stdout}${beh.stderr}`);
const slozka = `${helpers.dir}/mutant-sdilene`;
await fs.mkdir(slozka, { recursive: true });
for (const [jmeno, obsah] of Object.entries(files)) {
  if (jmeno !== 'prihlaska.js') await fs.writeFile(`${slozka}/${jmeno}`, obsah);
}
await fs.writeFile(`${slozka}/prihlaska.js`, [
  "import { zkontrolujPrihlasku as puvodni } from '../prihlaska.js';",
  'const sdilene = [];',
  'export function zkontrolujPrihlasku(prihlaska) {',
  '  const vysledek = puvodni(prihlaska);',
  '  for (const kod of vysledek.chyby) {',
  '    if (!sdilene.includes(kod)) sdilene.push(kod);',
  '  }',
  '  return { platna: sdilene.length === 0, chyby: sdilene };',
  '}',
].join('\n'));
const mutant = await helpers.run('node --test mutant-sdilene/prihlaska.test.js');
assert.notEqual(mutant.code, 0, 'Podstrčená verze si chyby nechává mezi voláními, a tvoje testy přesto prošly — potřebuješ test, který po neplatné přihlášce zkontroluje platnou');
```

# --help--

## --tip--

Tohle je úloha o okrajových případech — chyby v cizím kódu sedí na hranicích pravidel,
ne uprostřed rozsahu. Připomeň si
[Okrajové případy](see:nastroje-testovani/proc-testovat#okrajove-pripady) a přístup
„nejdřív test, který selže" z lekce
[Typické chyby a pasti](see:nastroje-testovani/proc-testovat#typicke-chyby-a-pasti).

## --tip-- 12

U pravidla s rozsahem zkoušej čtveřici hodnot: těsně pod dolní hranicí, na dolní
hranici, na horní hranici a těsně nad ní. Že hranice platí včetně, pozná jen test,
který se na tu hranici zeptá — test s hodnotou uprostřed projde tak i tak.

# --seed--

## --file-- prihlaska.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { zkontrolujPrihlasku } from './prihlaska.js';

--edit--

--edit--
```

## --file-- prihlaska.js

```js
// Kontrola přihlášky do kroužku robotiky (DDM Tábor).
// Napsal Radek Vávra v září 2026. Pravidla si pamatoval z hlavy.

const chyby = [];

export function zkontrolujPrihlasku(prihlaska) {
  const jmeno = typeof prihlaska.jmeno === 'string' ? prihlaska.jmeno.trim() : '';
  if (jmeno.length < 3 || !jmeno.includes(' ')) {
    chyby.push('jmeno');
  }

  const email = typeof prihlaska.email === 'string' ? prihlaska.email.trim().toLowerCase() : '';
  if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[a-z]{2,}$/.test(email)) {
    chyby.push('email');
  }

  const vek = prihlaska.vek;
  const vekPlatny = Number.isInteger(vek) && vek > 6 && vek < 18;
  if (!vekPlatny) {
    chyby.push('vek');
  }

  const psc = prihlaska.psc;
  if (typeof psc !== 'string' || !/^\d{5}$/.test(psc)) {
    chyby.push('psc');
  }

  if (vekPlatny && vek < 15 && prihlaska.souhlasRodice !== true) {
    chyby.push('souhlas');
  }

  return { platna: chyby.length === 0, chyby };
}
```

## --file-- package.json

```json
{
  "name": "prihlasky-krouzek",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test prihlaska.test.js"
  }
}
```

# --solution--

## --file-- prihlaska.js

```js
// Kontrola přihlášky do kroužku robotiky (DDM Tábor).
// Pravidla kroužku: věk 6–18 včetně, souhlas rodiče do 15 let, PSČ i s mezerou.

export function zkontrolujPrihlasku(prihlaska) {
  const chyby = [];

  const jmeno = typeof prihlaska.jmeno === 'string' ? prihlaska.jmeno.trim() : '';
  if (jmeno.length < 3 || !jmeno.includes(' ')) {
    chyby.push('jmeno');
  }

  const email = typeof prihlaska.email === 'string' ? prihlaska.email.trim().toLowerCase() : '';
  if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[a-z]{2,}$/.test(email)) {
    chyby.push('email');
  }

  const vek = prihlaska.vek;
  const vekPlatny = Number.isInteger(vek) && vek >= 6 && vek <= 18;
  if (!vekPlatny) {
    chyby.push('vek');
  }

  const psc = prihlaska.psc;
  if (typeof psc !== 'string' || !/^\d{3} ?\d{2}$/.test(psc)) {
    chyby.push('psc');
  }

  if (vekPlatny && vek < 15 && prihlaska.souhlasRodice !== true) {
    chyby.push('souhlas');
  }

  return { platna: chyby.length === 0, chyby };
}
```

## --file-- prihlaska.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { zkontrolujPrihlasku } from './prihlaska.js';

function prihlaska(zmeny = {}) {
  return {
    jmeno: 'Eva Němcová',
    email: 'eva.nemcova@seznam.cz',
    vek: 12,
    psc: '391 01',
    souhlasRodice: true,
    ...zmeny,
  };
}

const chybyPro = (zmeny) => zkontrolujPrihlasku(prihlaska(zmeny)).chyby;

test('úplná přihláška projde bez chyb', () => {
  assert.deepEqual(zkontrolujPrihlasku(prihlaska()), { platna: true, chyby: [] }, 'Přihláška Evy Němcové má být platná');
});

test('jméno bez příjmení neprojde', () => {
  assert.deepEqual(chybyPro({ jmeno: 'Eva' }), ['jmeno'], 'Jméno „Eva“ bez příjmení nemá projít');
  assert.deepEqual(chybyPro({ jmeno: '   ' }), ['jmeno'], 'Jméno ze samých mezer nemá projít');
});

test('e-mail bez domény s tečkou neprojde, velikost písmen a mezery nevadí', () => {
  assert.deepEqual(chybyPro({ email: 'eva@seznam' }), ['email'], 'eva@seznam nemá projít');
  assert.deepEqual(chybyPro({ email: '  Eva.Nemcova@Seznam.CZ ' }), [], 'Mezery a velká písmena v e-mailu vadit nesmí');
});

test('šest i osmnáct let přihláška přijme', () => {
  assert.deepEqual(chybyPro({ vek: 6 }), [], 'Šestileté dítě se souhlasem rodiče má projít');
  assert.deepEqual(chybyPro({ vek: 18, souhlasRodice: false }), [], 'Osmnáctiletý má projít i bez souhlasu rodiče');
});

test('pět a devatenáct let přihláška odmítne', () => {
  assert.deepEqual(chybyPro({ vek: 5 }), ['vek'], 'Pětileté dítě nemá projít');
  assert.deepEqual(chybyPro({ vek: 19 }), ['vek'], 'Devatenáctiletý nemá projít');
});

test('věk musí být celé číslo', () => {
  assert.deepEqual(chybyPro({ vek: '12' }), ['vek'], 'Text „12“ není věk');
  assert.deepEqual(chybyPro({ vek: 12.5 }), ['vek'], '12,5 roku není celé číslo');
});

test('PSČ projde s mezerou po třetí číslici i bez ní', () => {
  assert.deepEqual(chybyPro({ psc: '391 01' }), [], 'PSČ 391 01 má projít');
  assert.deepEqual(chybyPro({ psc: '39101' }), [], 'PSČ 39101 má projít');
});

test('jiný tvar PSČ neprojde', () => {
  for (const psc of ['3910', '39 101', '391011', '391 01 ', 39101]) {
    assert.deepEqual(chybyPro({ psc }), ['psc'], `PSČ ${JSON.stringify(psc)} nemá projít`);
  }
});

test('dítě do 15 let potřebuje souhlas rodiče', () => {
  assert.deepEqual(chybyPro({ vek: 14, souhlasRodice: false }), ['souhlas'], 'Čtrnáctiletý bez souhlasu rodiče neprojde');
  assert.deepEqual(chybyPro({ vek: 14, souhlasRodice: 'ano' }), ['souhlas'], 'Souhlas musí být přesně true');
  assert.deepEqual(chybyPro({ vek: 15, souhlasRodice: false }), [], 'Od 15 let se souhlas rodiče neposuzuje');
});

test('prázdná přihláška vrátí chyby v pořadí pravidel', () => {
  assert.deepEqual(zkontrolujPrihlasku({}).chyby, ['jmeno', 'email', 'vek', 'psc'], 'U prázdné přihlášky je neplatný i věk, takže se souhlas neposuzuje');
});

test('kontrola po neplatné přihlášce vrátí platný výsledek', () => {
  zkontrolujPrihlasku({});
  assert.deepEqual(zkontrolujPrihlasku(prihlaska()), { platna: true, chyby: [] }, 'Druhé volání nesmí vidět chyby z prvního');
});

test('kontrola nemění vstupní objekt', () => {
  const vstup = prihlaska({ jmeno: '  Eva Němcová  ' });
  const kopie = structuredClone(vstup);
  zkontrolujPrihlasku(vstup);
  assert.deepEqual(vstup, kopie, 'Přihláška se po kontrole nesmí změnit');
});
```

# --approaches--

## --approach-- Jeden test na pravidlo, kontrola postupnými ify

Testy jdou stejně za sebou jako pravidla v zadání a jsou seskupené do `describe`.
Ve výpisu `node --test` pak hned vidíš, které pravidlo se rozbilo. Hodí se, dokud
je pravidel pár a každé má jiný tvar.

### --file-- prihlaska.js

```js
// Kontrola přihlášky do kroužku robotiky (DDM Tábor).
// Pravidla kroužku: věk 6–18 včetně, souhlas rodiče do 15 let, PSČ i s mezerou.

export function zkontrolujPrihlasku(prihlaska) {
  const chyby = [];

  const jmeno = typeof prihlaska.jmeno === 'string' ? prihlaska.jmeno.trim() : '';
  if (jmeno.length < 3 || !jmeno.includes(' ')) {
    chyby.push('jmeno');
  }

  const email = typeof prihlaska.email === 'string' ? prihlaska.email.trim().toLowerCase() : '';
  if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[a-z]{2,}$/.test(email)) {
    chyby.push('email');
  }

  const vek = prihlaska.vek;
  const vekPlatny = Number.isInteger(vek) && vek >= 6 && vek <= 18;
  if (!vekPlatny) {
    chyby.push('vek');
  }

  const psc = prihlaska.psc;
  if (typeof psc !== 'string' || !/^\d{3} ?\d{2}$/.test(psc)) {
    chyby.push('psc');
  }

  if (vekPlatny && vek < 15 && prihlaska.souhlasRodice !== true) {
    chyby.push('souhlas');
  }

  return { platna: chyby.length === 0, chyby };
}
```

### --file-- prihlaska.test.js

```js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { zkontrolujPrihlasku } from './prihlaska.js';

function prihlaska(zmeny = {}) {
  return {
    jmeno: 'Eva Němcová',
    email: 'eva.nemcova@seznam.cz',
    vek: 12,
    psc: '391 01',
    souhlasRodice: true,
    ...zmeny,
  };
}

const chybyPro = (zmeny) => zkontrolujPrihlasku(prihlaska(zmeny)).chyby;

describe('jméno a e-mail', () => {
  test('úplná přihláška projde bez chyb', () => {
    assert.deepEqual(zkontrolujPrihlasku(prihlaska()), { platna: true, chyby: [] }, 'Přihláška Evy Němcové má být platná');
  });

  test('jméno bez příjmení neprojde', () => {
    assert.deepEqual(chybyPro({ jmeno: 'Eva' }), ['jmeno'], 'Jméno „Eva“ bez příjmení nemá projít');
  });

  test('e-mail bez tečky v doméně neprojde', () => {
    assert.deepEqual(chybyPro({ email: 'eva@seznam' }), ['email'], 'eva@seznam nemá projít');
  });

  test('velká písmena a mezery v e-mailu nevadí', () => {
    assert.deepEqual(chybyPro({ email: '  Eva.Nemcova@Seznam.CZ ' }), [], 'E-mail se porovnává po oříznutí a bez ohledu na velikost písmen');
  });
});

describe('věk', () => {
  test('šest i osmnáct let přihláška přijme', () => {
    assert.deepEqual(chybyPro({ vek: 6 }), [], 'Šestileté dítě se souhlasem rodiče má projít');
    assert.deepEqual(chybyPro({ vek: 18, souhlasRodice: false }), [], 'Osmnáctiletý má projít i bez souhlasu rodiče');
  });

  test('pět a devatenáct let přihláška odmítne', () => {
    assert.deepEqual(chybyPro({ vek: 5 }), ['vek'], 'Pětileté dítě nemá projít');
    assert.deepEqual(chybyPro({ vek: 19 }), ['vek'], 'Devatenáctiletý nemá projít');
  });

  test('věk musí být celé číslo', () => {
    assert.deepEqual(chybyPro({ vek: '12' }), ['vek'], 'Text „12“ není věk');
    assert.deepEqual(chybyPro({ vek: 12.5 }), ['vek'], '12,5 roku není celé číslo');
  });
});

describe('PSČ a souhlas rodiče', () => {
  test('PSČ projde s mezerou i bez ní', () => {
    assert.deepEqual(chybyPro({ psc: '391 01' }), [], 'PSČ 391 01 má projít');
    assert.deepEqual(chybyPro({ psc: '39101' }), [], 'PSČ 39101 má projít');
  });

  test('jiný tvar PSČ neprojde', () => {
    for (const psc of ['3910', '39 101', '391011', 39101]) {
      assert.deepEqual(chybyPro({ psc }), ['psc'], `PSČ ${JSON.stringify(psc)} nemá projít`);
    }
  });

  test('dítě do 15 let potřebuje souhlas rodiče', () => {
    assert.deepEqual(chybyPro({ vek: 14, souhlasRodice: false }), ['souhlas'], 'Čtrnáctiletý bez souhlasu rodiče neprojde');
    assert.deepEqual(chybyPro({ vek: 15, souhlasRodice: false }), [], 'Od 15 let se souhlas rodiče neposuzuje');
  });
});

describe('výsledek kontroly', () => {
  test('prázdná přihláška vrátí chyby v pořadí pravidel', () => {
    assert.deepEqual(zkontrolujPrihlasku({}).chyby, ['jmeno', 'email', 'vek', 'psc'], 'U prázdné přihlášky je neplatný i věk, takže se souhlas neposuzuje');
  });

  test('kontrola po neplatné přihlášce vrátí platný výsledek', () => {
    zkontrolujPrihlasku({});
    assert.deepEqual(zkontrolujPrihlasku(prihlaska()), { platna: true, chyby: [] }, 'Druhé volání nesmí vidět chyby z prvního');
  });

  test('kontrola nemění vstupní objekt', () => {
    const vstup = prihlaska({ jmeno: '  Eva Němcová  ' });
    const kopie = structuredClone(vstup);
    zkontrolujPrihlasku(vstup);
    assert.deepEqual(vstup, kopie, 'Přihláška se po kontrole nesmí změnit');
  });
});
```

## --approach-- Tabulka pravidel a tabulka případů

Pravidla i testovací případy jsou data. Nové pravidlo znamená jeden řádek v poli,
nový případ taky — a jmenovité testy zůstanou jen na to, co se do tabulky nevejde
(pořadí chyb, dvě volání za sebou, neměnnost vstupu). Hodí se, jakmile pravidel
přibývá a mají stejný tvar.

### --file-- prihlaska.js

```js
// Kontrola přihlášky do kroužku robotiky (DDM Tábor).
// Každé pravidlo je jeden řádek tabulky: kód chyby a podmínka, která musí platit.

const EMAIL = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[a-z]{2,}$/;
const PSC = /^\d{3} ?\d{2}$/;

const vekPlatny = (vek) => Number.isInteger(vek) && vek >= 6 && vek <= 18;
const text = (hodnota) => (typeof hodnota === 'string' ? hodnota.trim() : '');

const PRAVIDLA = [
  { kod: 'jmeno', splneno: (p) => text(p.jmeno).length >= 3 && text(p.jmeno).includes(' ') },
  { kod: 'email', splneno: (p) => EMAIL.test(text(p.email).toLowerCase()) },
  { kod: 'vek', splneno: (p) => vekPlatny(p.vek) },
  { kod: 'psc', splneno: (p) => typeof p.psc === 'string' && PSC.test(p.psc) },
  { kod: 'souhlas', splneno: (p) => !vekPlatny(p.vek) || p.vek >= 15 || p.souhlasRodice === true },
];

export function zkontrolujPrihlasku(prihlaska) {
  const chyby = PRAVIDLA
    .filter((pravidlo) => !pravidlo.splneno(prihlaska))
    .map((pravidlo) => pravidlo.kod);
  return { platna: chyby.length === 0, chyby };
}
```

### --file-- prihlaska.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { zkontrolujPrihlasku } from './prihlaska.js';

const zaklad = {
  jmeno: 'Eva Němcová',
  email: 'eva.nemcova@seznam.cz',
  vek: 12,
  psc: '391 01',
  souhlasRodice: true,
};

const pripady = [
  { nazev: 'úplná přihláška projde', zmena: {}, chyby: [] },
  { nazev: 'šest let se souhlasem rodiče projde', zmena: { vek: 6 }, chyby: [] },
  { nazev: 'osmnáct let projde i bez souhlasu rodiče', zmena: { vek: 18, souhlasRodice: false }, chyby: [] },
  { nazev: 'patnáct let projde bez souhlasu rodiče', zmena: { vek: 15, souhlasRodice: false }, chyby: [] },
  { nazev: 'PSČ bez mezery projde', zmena: { psc: '39101' }, chyby: [] },
  { nazev: 'e-mail s velkými písmeny a mezerami projde', zmena: { email: '  Eva.Nemcova@Seznam.CZ ' }, chyby: [] },
  { nazev: 'jméno bez příjmení neprojde', zmena: { jmeno: 'Eva' }, chyby: ['jmeno'] },
  { nazev: 'e-mail bez tečky v doméně neprojde', zmena: { email: 'eva@seznam' }, chyby: ['email'] },
  { nazev: 'pět let neprojde', zmena: { vek: 5 }, chyby: ['vek'] },
  { nazev: 'devatenáct let neprojde', zmena: { vek: 19 }, chyby: ['vek'] },
  { nazev: 'věk jako text neprojde', zmena: { vek: '12' }, chyby: ['vek'] },
  { nazev: 'PSČ o čtyřech číslicích neprojde', zmena: { psc: '3910' }, chyby: ['psc'] },
  { nazev: 'PSČ s mezerou po druhé číslici neprojde', zmena: { psc: '39 101' }, chyby: ['psc'] },
  { nazev: 'PSČ jako číslo neprojde', zmena: { psc: 39101 }, chyby: ['psc'] },
  { nazev: 'čtrnáct let bez souhlasu rodiče neprojde', zmena: { vek: 14, souhlasRodice: false }, chyby: ['souhlas'] },
];

for (const { nazev, zmena, chyby } of pripady) {
  test(nazev, () => {
    const vysledek = zkontrolujPrihlasku({ ...zaklad, ...zmena });
    assert.deepEqual(vysledek.chyby, chyby, `Případ „${nazev}“ má vrátit chyby ${JSON.stringify(chyby)}`);
    assert.equal(vysledek.platna, chyby.length === 0, `Případ „${nazev}“ má mít platna === ${chyby.length === 0}`);
  });
}

test('prázdná přihláška vrátí chyby v pořadí pravidel', () => {
  assert.deepEqual(zkontrolujPrihlasku({}).chyby, ['jmeno', 'email', 'vek', 'psc'], 'U prázdné přihlášky je neplatný i věk, takže se souhlas neposuzuje');
});

test('kontrola po neplatné přihlášce vrátí platný výsledek', () => {
  zkontrolujPrihlasku({});
  assert.deepEqual(zkontrolujPrihlasku({ ...zaklad }), { platna: true, chyby: [] }, 'Druhé volání nesmí vidět chyby z prvního');
});

test('kontrola nemění vstupní objekt', () => {
  const vstup = { ...zaklad, jmeno: '  Eva Němcová  ' };
  const kopie = structuredClone(vstup);
  zkontrolujPrihlasku(vstup);
  assert.deepEqual(vstup, kopie, 'Přihláška se po kontrole nesmí změnit');
});
```

# --review--

Kontrola hlídá, co tvoje testy chytí. Jestli je z nich za půl roku někdo moudrý,
zkontroluj sám — přesně na tohle se dívá kolega při code review.

## --rubric--

- Jméno testu popisuje chování („šest let přihláška přijme"), ne pořadí („test 3").
- Každý test má jedno téma; když v jeho jméně musí být „a", jsou to dva testy.
- Každá aserce má českou zprávu, ze které poznáš vstup i očekávání, aniž bys otevřel kód.
- Testovací data jsou česká a konkrétní (Eva Němcová, PSČ 391 01), ne `test1` a `aaa`.
- U každého pravidla s rozsahem je v testech obě hranice, ne jen hodnota uprostřed.
- Aspoň jeden test jsi viděl selhat dřív, než jsi opravil `prihlaska.js`.
- Kontrola se dá přečíst shora dolů a pořadí pravidel v kódu odpovídá pořadí kódů chyb.

## --extensions--

Rozšíření bez testů:

- Přidej pravidlo pro telefon (`+420` nepovinné, devět číslic, mezery se ignorují)
  a rozšiř o něj testy dřív, než ho napíšeš.
- Nech kontrolu vracet vedle kódu i českou větu pro rodiče („Vyplň prosím jméno
  i příjmení.") a ohlídej testem, že věta u každého kódu existuje.
- Zkus si, jak se sada chová, když dvě pravidla selžou naráz: doplň případy se dvěma
  a třemi chybami a ověř jejich pořadí.
- Vezmi svoje testy a zkus podstrčit vlastní chybu do `prihlaska.js` (třeba změň
  `>=` na `>`). Když sada zůstane zelená, víš, kde máš díru.
