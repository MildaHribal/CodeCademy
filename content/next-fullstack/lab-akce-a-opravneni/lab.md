---
title: Vrstva akcí pro redakci
runtime: node
timeoutMs: 45000
see: next-fullstack/data-a-server-actions#validace-a-autorizace-v-kazde-akci
---

# --description--

## Zadání

Malý online magazín o jídle přechází z Wordpressu na vlastní aplikaci v Next.js.
Frontend dělá kolegyně, databázi máš hotovou — od tebe chce **vrstvu akcí**:
funkce, které jako jediné smějí měnit články, a které samy rozhodnou, kdo co smí.

V redakci jsou tři role:

| role | co smí |
|---|---|
| `autor` | psát vlastní články a upravovat je, **dokud jsou v konceptu** |
| `editor` | upravovat kterýkoli článek a publikovat |
| `admin` | všechno, navíc jako jediný smí mazat |

Píšeš v TypeScriptu. Typy článku, uživatele a výsledku máš hotové v `typy.ts`,
paměťovou databázi v `databaze.ts` — v ostrém provozu by na jejím místě byl
Drizzle, rozhraní by ale zůstalo stejné. Tvoje práce je celá v `akce.ts`.

## Tvar výsledku

Každá akce vrací jeden ze tří tvarů (přesně tak, jak je popsaný v `typy.ts`):

- `{ ok: true, clanek }` — povedlo se, vrací se článek po změně,
- `{ ok: false, chyba: 'neprihlasen' | 'nenalezen' | 'bezopravneni' }` — nešlo to,
- `{ ok: false, chybyPoli: { titulek: ['…'], … } }` — data nesedí.

Chybu **vracíš**, neházíš výjimku. Výjimka patří na poruchu, ne na to, že uživatel
napsal krátký titulek.

## Uživatelské příběhy

- Když někdo zavolá akci bez přihlášení, dostane `chyba: 'neprihlasen'` a v databázi
  se nic nezmění. Platí to pro všechny čtyři akce.
- Když přihlášený autor odešle nový článek s platnými údaji, uloží se jako koncept
  a jeho autorem je ten, kdo je přihlášený — i kdyby ve formuláři bylo napsané cizí `autorId`.
- Když v novém článku chybí nebo nesedí údaje, vrátí akce chyby u jednotlivých polí
  s českými větami a nic se neuloží. Pravidla: titulek 3–120 znaků, tělo aspoň
  20 znaků, slug jen z malých písmen, číslic a pomlček (například `jak-na-kvasky`).
- Když už článek se stejným slugem existuje, akce ho nepřepíše a vrátí chybu
  u pole `slug`.
- Když někdo upravuje článek, který neexistuje, dostane `chyba: 'nenalezen'`.
- Když autor upravuje cizí článek nebo svůj už publikovaný, dostane
  `chyba: 'bezopravneni'` a v databázi se nic nezmění. Editor a admin upraví kterýkoli.
- Když autor upravuje cizí článek **a navíc pošle nesmysly**, dozví se jen to, že
  na to nemá právo — ne co je na datech špatně.
- Když článek publikuje editor nebo admin, změní se jeho stav na `publikovano`.
  Autorovi to akce nedovolí, i kdyby šlo o jeho vlastní článek.
- Když článek maže kdokoli jiný než admin, nic se nesmaže.
- Když je všechno v pořádku, `npx tsc --noEmit` projde bez jediné chyby a nikde
  v `akce.ts` není `any`.

## Co po tobě chce kolegyně navíc

Dvě rozhodovací pravidla chce mít jako **čisté funkce**, aby si je mohla zavolat
i v UI a schovat podle nich tlačítka:

- `smiUpravit(uzivatel, clanek)` — vrací `true`/`false`,
- `smiPublikovat(uzivatel)` — vrací `true`/`false`.

Obě musí zvládnout i to, že jim někdo pošle `null` nebo `undefined`.

> [!PITFALL]
> `clanek.autorId === uzivatel?.id` vypadá jako kontrola vlastníka. Když ale
> chybí obojí, porovnáváš `undefined` s `undefined` — a to je `true`.

## Jak to spustit

Kontrola si tvoje funkce zavolá sama. Když si chceš něco vyzkoušet ručně, napiš si
vlastní soubor a pusť ho tlačítkem **Spustit**; do `tsconfig.json` ho přidávat nemusíš.

# --hints--

`ClanekSchema` odmítne krátký titulek, špatný slug i krátké tělo a u každého pole vrátí českou větu.

```js
const { ClanekSchema } = await helpers.importFile('akce.ts');
const { z } = await import('zod');
const vysledek = ClanekSchema.safeParse({ titulek: 'ab', slug: 'Jak Na Kvásky', telo: 'krátké' });
assert.equal(vysledek.success, false, 'Neplatná data schématem projít nesmí');
const chyby = z.flattenError(vysledek.error).fieldErrors;
for (const pole of ['titulek', 'slug', 'telo']) {
  assert.ok(Array.isArray(chyby[pole]) && chyby[pole].length > 0, `U pole ${pole} má být chyba, přišlo: ${JSON.stringify(chyby)}`);
  assert.match(String(chyby[pole][0]), /[ěščřžýáíéúůťďňĚŠČŘŽÝÁÍÉÚŮ ]/, `Hláška u pole ${pole} má být česká věta, je: ${chyby[pole][0]}`);
}
```

`ClanekSchema` pustí platná data a ořízne mezery na okrajích.

```js
const { ClanekSchema } = await helpers.importFile('akce.ts');
const vysledek = ClanekSchema.safeParse({
  titulek: '  Jak na kvásky  ',
  slug: 'jak-na-kvasky',
  telo: '  Text o kváscích, který je určitě delší než dvacet znaků.  ',
});
assert.equal(vysledek.success, true, `Platná data mají projít, chyby: ${JSON.stringify(vysledek.error?.issues)}`);
assert.equal(vysledek.data.titulek, 'Jak na kvásky', 'Titulek se má uložit bez mezer na okrajích');
assert.equal(vysledek.data.telo, 'Text o kváscích, který je určitě delší než dvacet znaků.', 'Tělo se má uložit bez mezer na okrajích');
```

`smiUpravit` pustí admina i editora ke každému článku, autora jen k vlastnímu konceptu.

```js
const { smiUpravit } = await helpers.importFile('akce.ts');
const koncept = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const publikovany = { ...koncept, id: 'c2', slug: 'brnenske-pekarny', stav: 'publikovano' };
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const petr = { id: 'petr', jmeno: 'Petr', role: 'autor' };
const sarka = { id: 'sarka', jmeno: 'Šárka', role: 'editor' };
const tomas = { id: 'tomas', jmeno: 'Tomáš', role: 'admin' };

assert.equal(smiUpravit(eva, koncept), true, 'Autor smí upravit svůj koncept');
assert.equal(smiUpravit(eva, publikovany), false, 'Autor už nesmí upravit svůj publikovaný článek');
assert.equal(smiUpravit(petr, koncept), false, 'Autor nesmí upravit cizí článek');
assert.equal(smiUpravit(sarka, publikovany), true, 'Editor smí upravit kterýkoli článek');
assert.equal(smiUpravit(tomas, publikovany), true, 'Admin smí upravit kterýkoli článek');
```

`smiUpravit` vrátí `false`, i když chybí uživatel, článek nebo obojí.

```js
const { smiUpravit } = await helpers.importFile('akce.ts');
const koncept = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const bezAutora = { id: 'c9', slug: 'starý-import', titulek: 'Starý import', telo: 'Text bez autora, delší než dvacet znaků.', stav: 'koncept' };

assert.equal(smiUpravit(null, koncept), false, 'Nepřihlášený nesmí nic');
assert.equal(smiUpravit(eva, null), false, 'Neexistující článek nejde upravit');
assert.equal(smiUpravit(null, bezAutora), false, 'Nepřihlášený nesmí ani článek bez autora — pozor na undefined === undefined');
assert.equal(smiUpravit(undefined, undefined), false, 'Ani dvakrát undefined není povolení');
```

`smiPublikovat` pustí jen editora a admina.

```js
const { smiPublikovat } = await helpers.importFile('akce.ts');
assert.equal(smiPublikovat({ id: 'sarka', jmeno: 'Šárka', role: 'editor' }), true, 'Editor smí publikovat');
assert.equal(smiPublikovat({ id: 'tomas', jmeno: 'Tomáš', role: 'admin' }), true, 'Admin smí publikovat');
assert.equal(smiPublikovat({ id: 'eva', jmeno: 'Eva', role: 'autor' }), false, 'Autor publikovat nesmí');
assert.equal(smiPublikovat(null), false, 'Nepřihlášený publikovat nesmí');
```

Všechny čtyři akce bez přihlášení vrátí `chyba: 'neprihlasen'` a databázi nechají být.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const akce = await helpers.importFile('akce.ts');
const clanky = [{ id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' }];
const db = vytvorDatabazi(clanky.map((clanek) => ({ ...clanek })));
const data = (hodnoty) => {
  const formular = new FormData();
  for (const [klic, hodnota] of Object.entries(hodnoty)) formular.set(klic, String(hodnota));
  return formular;
};

for (const jmeno of ['vytvorClanek', 'upravClanek', 'publikujClanek', 'smazClanek']) {
  assert.equal(typeof akce[jmeno], 'function', `akce.ts má exportovat funkci ${jmeno}`);
  const vysledek = await akce[jmeno](db, null, data({ id: 'c1', titulek: 'Nový titulek', slug: 'novy', telo: 'Text, který je delší než dvacet znaků.' }));
  assert.equal(vysledek.ok, false, `${jmeno} bez přihlášení nesmí projít`);
  assert.equal(vysledek.chyba, 'neprihlasen', `${jmeno} bez přihlášení má vrátit chyba: 'neprihlasen', vrátilo: ${JSON.stringify(vysledek)}`);
}
assert.deepEqual(db.vsechny(), clanky, 'Bez přihlášení se v databázi nesmí nic změnit');
```

`vytvorClanek` s neplatnými daty vrátí chyby u polí a nic neuloží.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { vytvorClanek } = await helpers.importFile('akce.ts');
const db = vytvorDatabazi([]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const formular = new FormData();
formular.set('titulek', 'ab');
formular.set('slug', 'Jak Na Kvásky');
formular.set('telo', 'krátké');

const vysledek = await vytvorClanek(db, eva, formular);
assert.equal(vysledek.ok, false, 'Neplatný článek se uložit nesmí');
assert.ok(vysledek.chybyPoli, `Výsledek má mít chybyPoli, vrátilo: ${JSON.stringify(vysledek)}`);
for (const pole of ['titulek', 'slug', 'telo']) {
  assert.ok(vysledek.chybyPoli[pole]?.length, `V chybyPoli má být klíč ${pole}, je tam: ${JSON.stringify(vysledek.chybyPoli)}`);
}
assert.deepEqual(db.vsechny(), [], 'Do databáze se nesmí nic uložit');
```

`vytvorClanek` uloží platný článek jako koncept a autorem je přihlášený uživatel.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { vytvorClanek } = await helpers.importFile('akce.ts');
const db = vytvorDatabazi([]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const formular = new FormData();
formular.set('titulek', '  Jak na kvásky  ');
formular.set('slug', 'jak-na-kvasky');
formular.set('telo', 'Text o kváscích, který je určitě delší než dvacet znaků.');
formular.set('autorId', 'tomas');
formular.set('stav', 'publikovano');

const vysledek = await vytvorClanek(db, eva, formular);
assert.equal(vysledek.ok, true, `Platný článek se má uložit, vrátilo: ${JSON.stringify(vysledek)}`);
assert.equal(vysledek.clanek.titulek, 'Jak na kvásky', 'Titulek se má uložit oříznutý');
assert.equal(vysledek.clanek.autorId, 'eva', 'Autorem je přihlášený uživatel, ne autorId z formuláře');
assert.equal(vysledek.clanek.stav, 'koncept', 'Nový článek vzniká jako koncept, i když formulář tvrdí něco jiného');
assert.ok(vysledek.clanek.id, 'Uložený článek má mít id');
assert.equal(db.vsechny().length, 1, 'V databázi má být jeden článek');
assert.equal(db.najdi(vysledek.clanek.id)?.slug, 'jak-na-kvasky', 'Článek má jít najít podle svého id');
```

`vytvorClanek` nepřepíše článek se stejným slugem a vrátí chybu u pole `slug`.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { vytvorClanek } = await helpers.importFile('akce.ts');
const existujici = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'petr', stav: 'publikovano' };
const db = vytvorDatabazi([{ ...existujici }]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const formular = new FormData();
formular.set('titulek', 'Jiný článek o kváscích');
formular.set('slug', 'jak-na-kvasky');
formular.set('telo', 'Jiný text o kváscích, delší než dvacet znaků.');

const vysledek = await vytvorClanek(db, eva, formular);
assert.equal(vysledek.ok, false, 'Článek se zabraným slugem projít nesmí');
assert.ok(vysledek.chybyPoli?.slug?.length, `Chyba má být u pole slug, vrátilo: ${JSON.stringify(vysledek)}`);
assert.equal(db.vsechny().length, 1, 'V databázi má zůstat jediný článek');
assert.deepEqual(db.najdi('c1'), existujici, 'Původní článek se nesmí přepsat');
```

`upravClanek` vrátí `nenalezen` u neznámého id a `bezopravneni` u cizího článku.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { upravClanek } = await helpers.importFile('akce.ts');
const puvodni = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const db = vytvorDatabazi([{ ...puvodni }]);
const petr = { id: 'petr', jmeno: 'Petr', role: 'autor' };
const data = (hodnoty) => {
  const formular = new FormData();
  for (const [klic, hodnota] of Object.entries(hodnoty)) formular.set(klic, String(hodnota));
  return formular;
};

const neznamy = await upravClanek(db, petr, data({ id: 'neexistuje', titulek: 'Nový titulek', telo: 'Text, který je delší než dvacet znaků.' }));
assert.equal(neznamy.chyba, 'nenalezen', `Neznámé id má vrátit 'nenalezen', vrátilo: ${JSON.stringify(neznamy)}`);

const cizi = await upravClanek(db, petr, data({ id: 'c1', titulek: 'Ukradený titulek', telo: 'Text, který je delší než dvacet znaků.' }));
assert.equal(cizi.chyba, 'bezopravneni', `Cizí článek má vrátit 'bezopravneni', vrátilo: ${JSON.stringify(cizi)}`);
assert.deepEqual(db.najdi('c1'), puvodni, 'Cizí článek se nesmí změnit');
```

U cizího článku s nesmyslnými daty se uživatel dozví jen `bezopravneni`, ne co je na datech špatně.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { upravClanek } = await helpers.importFile('akce.ts');
const db = vytvorDatabazi([{ id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' }]);
const petr = { id: 'petr', jmeno: 'Petr', role: 'autor' };
const formular = new FormData();
formular.set('id', 'c1');
formular.set('titulek', 'x');
formular.set('telo', 'y');

const vysledek = await upravClanek(db, petr, formular);
assert.equal(vysledek.chyba, 'bezopravneni', `Oprávnění se kontroluje dřív než data, vrátilo: ${JSON.stringify(vysledek)}`);
assert.ok(!vysledek.chybyPoli, 'Uživateli bez oprávnění se chyby polí posílat nemají');
```

`upravClanek` uloží změny u vlastního konceptu a odmítne je u vlastního publikovaného článku.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { upravClanek } = await helpers.importFile('akce.ts');
const koncept = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const publikovany = { id: 'c2', slug: 'brnenske-pekarny', titulek: 'Brněnské pekárny', telo: 'Text o pekárnách, delší než dvacet znaků.', autorId: 'eva', stav: 'publikovano' };
const db = vytvorDatabazi([{ ...koncept }, { ...publikovany }]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const sarka = { id: 'sarka', jmeno: 'Šárka', role: 'editor' };
const data = (hodnoty) => {
  const formular = new FormData();
  for (const [klic, hodnota] of Object.entries(hodnoty)) formular.set(klic, String(hodnota));
  return formular;
};

const vlastni = await upravClanek(db, eva, data({ id: 'c1', titulek: 'Jak na kvásky podruhé', telo: 'Opravený text o kváscích, delší než dvacet znaků.' }));
assert.equal(vlastni.ok, true, `Vlastní koncept má jít upravit, vrátilo: ${JSON.stringify(vlastni)}`);
assert.equal(vlastni.clanek.titulek, 'Jak na kvásky podruhé', 'Uložený článek má mít nový titulek');
assert.equal(vlastni.clanek.slug, 'jak-na-kvasky', 'Slug se úpravou nemění');
assert.equal(vlastni.clanek.autorId, 'eva', 'Autor zůstává stejný');
assert.equal(db.najdi('c1')?.titulek, 'Jak na kvásky podruhé', 'Změna se má propsat do databáze');

const uzVenku = await upravClanek(db, eva, data({ id: 'c2', titulek: 'Přepsané pekárny', telo: 'Přepsaný text o pekárnách, delší než dvacet znaků.' }));
assert.equal(uzVenku.chyba, 'bezopravneni', `Publikovaný vlastní článek už autor upravit nesmí, vrátilo: ${JSON.stringify(uzVenku)}`);

const editorem = await upravClanek(db, sarka, data({ id: 'c2', titulek: 'Pekárny po korektuře', telo: 'Zkontrolovaný text o pekárnách, delší než dvacet znaků.' }));
assert.equal(editorem.ok, true, 'Editor smí upravit i publikovaný cizí článek');
```

`upravClanek` s neplatnými daty vlastního článku vrátí chyby polí a nic neuloží.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { upravClanek } = await helpers.importFile('akce.ts');
const puvodni = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const db = vytvorDatabazi([{ ...puvodni }]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const formular = new FormData();
formular.set('id', 'c1');
formular.set('titulek', 'x');
formular.set('telo', 'krátké');

const vysledek = await upravClanek(db, eva, formular);
assert.equal(vysledek.ok, false, 'Neplatná úprava projít nesmí');
assert.ok(vysledek.chybyPoli?.titulek?.length, `U titulku má být chyba, vrátilo: ${JSON.stringify(vysledek)}`);
assert.ok(vysledek.chybyPoli?.telo?.length, 'U těla má být chyba');
assert.deepEqual(db.najdi('c1'), puvodni, 'V databázi má zůstat původní článek');
```

`publikujClanek` pustí editora a admina, autora ani u vlastního článku ne.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { publikujClanek } = await helpers.importFile('akce.ts');
const koncept = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const db = vytvorDatabazi([{ ...koncept }]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const sarka = { id: 'sarka', jmeno: 'Šárka', role: 'editor' };
const data = (hodnoty) => {
  const formular = new FormData();
  for (const [klic, hodnota] of Object.entries(hodnoty)) formular.set(klic, String(hodnota));
  return formular;
};

const autorem = await publikujClanek(db, eva, data({ id: 'c1' }));
assert.equal(autorem.chyba, 'bezopravneni', `Autor publikovat nesmí ani vlastní článek, vrátilo: ${JSON.stringify(autorem)}`);
assert.equal(db.najdi('c1')?.stav, 'koncept', 'Stav článku se nesmí změnit');

const neznamy = await publikujClanek(db, sarka, data({ id: 'neexistuje' }));
assert.equal(neznamy.chyba, 'nenalezen', 'Neznámé id má vrátit nenalezen');

const editorem = await publikujClanek(db, sarka, data({ id: 'c1' }));
assert.equal(editorem.ok, true, `Editor publikovat smí, vrátilo: ${JSON.stringify(editorem)}`);
assert.equal(editorem.clanek.stav, 'publikovano', 'Vrácený článek má mít stav publikovano');
assert.equal(db.najdi('c1')?.stav, 'publikovano', 'Změna stavu se má propsat do databáze');
```

`smazClanek` pustí jen admina; ostatním článek zůstane.

```js
const { vytvorDatabazi } = await helpers.importFile('databaze.ts');
const { smazClanek } = await helpers.importFile('akce.ts');
const clanek = { id: 'c1', slug: 'jak-na-kvasky', titulek: 'Jak na kvásky', telo: 'Text o kváscích, delší než dvacet znaků.', autorId: 'eva', stav: 'koncept' };
const db = vytvorDatabazi([{ ...clanek }]);
const eva = { id: 'eva', jmeno: 'Eva', role: 'autor' };
const sarka = { id: 'sarka', jmeno: 'Šárka', role: 'editor' };
const tomas = { id: 'tomas', jmeno: 'Tomáš', role: 'admin' };
const data = (hodnoty) => {
  const formular = new FormData();
  for (const [klic, hodnota] of Object.entries(hodnoty)) formular.set(klic, String(hodnota));
  return formular;
};

for (const uzivatel of [eva, sarka]) {
  const vysledek = await smazClanek(db, uzivatel, data({ id: 'c1' }));
  assert.equal(vysledek.chyba, 'bezopravneni', `Role ${uzivatel.role} mazat nesmí, vrátilo: ${JSON.stringify(vysledek)}`);
}
assert.equal(db.vsechny().length, 1, 'Článek má v databázi zůstat');

const adminem = await smazClanek(db, tomas, data({ id: 'c1' }));
assert.equal(adminem.ok, true, `Admin mazat smí, vrátilo: ${JSON.stringify(adminem)}`);
assert.equal(adminem.clanek.id, 'c1', 'Vrací se smazaný článek');
assert.equal(db.najdi('c1'), undefined, 'Smazaný článek už v databázi být nemá');
```

`npx tsc --noEmit` projde bez chyby a v `akce.ts` není `any`.

```js
const vysledek = await helpers.run('npx tsc --noEmit', { timeoutMs: 40000 });
assert.equal(vysledek.code, 0, `Kontrola typů má projít bez chyby:\n${vysledek.stdout}${vysledek.stderr}`);
const zdroj = helpers.stripComments(files['akce.ts'], 'js');
assert.ok(!/\bany\b/.test(zdroj), 'V akce.ts nemá být any — když typ nevíš, popiš ho, nebo použij unknown');
```

# --help--

## --tip--

Než začneš psát, rozmysli si **pořadí kontrol**. V každé akci je stejné: kdo to je,
co to je, smí to — a teprve pak, jestli data sedí. Proč zrovna takhle, je v lekci
[Data a server actions](see:next-fullstack/data-a-server-actions#validace-a-autorizace-v-kazde-akci).

## --tip--

Hlášky u polí ti ze Zodu vytáhne `z.flattenError(vysledek.error).fieldErrors`.
Vrací objekt, kde klíč je jméno pole a hodnota pole vět — přesně tvar, který
kolegyně v UI čeká.

# --seed--

## --file-- package.json

```json
{
  "name": "redakce-akce",
  "private": true,
  "type": "module"
}
```

## --file-- tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["es2023", "dom"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "noEmit": true,
    "types": []
  },
  "include": ["typy.ts", "databaze.ts", "akce.ts"]
}
```

## --file-- typy.ts

```ts
export type Role = 'autor' | 'editor' | 'admin';

export type Uzivatel = {
  id: string;
  jmeno: string;
  role: Role;
};

export type Stav = 'koncept' | 'publikovano';

export type Clanek = {
  id: string;
  slug: string;
  titulek: string;
  telo: string;
  autorId: string;
  stav: Stav;
};

export type Chyba = 'neprihlasen' | 'nenalezen' | 'bezopravneni';

/** Hlášky u jednotlivých polí, jak je vrací z.flattenError(...).fieldErrors */
export type ChybyPoli = Record<string, string[] | undefined>;

export type Vysledek =
  | { ok: true; clanek: Clanek }
  | { ok: false; chyba: Chyba }
  | { ok: false; chybyPoli: ChybyPoli };
```

## --file-- databaze.ts

```ts
import type { Clanek } from './typy.ts';

export type Databaze = {
  vsechny(): Clanek[];
  najdi(id: string): Clanek | undefined;
  uloz(clanek: Clanek): Clanek;
  smaz(id: string): boolean;
};

/**
 * Paměťová „databáze" článků. V ostrém provozu by tu byl Drizzle nad SQLite,
 * rozhraní by ale zůstalo stejné — a akce by se nemusely měnit.
 */
export function vytvorDatabazi(pocatecni: Clanek[] = []): Databaze {
  const clanky = new Map<string, Clanek>(pocatecni.map((clanek) => [clanek.id, clanek]));

  return {
    vsechny: () => [...clanky.values()],
    najdi: (id) => clanky.get(id),
    uloz(clanek) {
      clanky.set(clanek.id, { ...clanek });
      return { ...clanek };
    },
    smaz: (id) => clanky.delete(id),
  };
}
```

## --file-- akce.ts

```ts
import { z } from 'zod';

import type { Databaze } from './databaze.ts';
import type { Clanek, Uzivatel, Vysledek } from './typy.ts';

/**
 * Schéma článku. Doplň pravidla pro titulek (3–120 znaků), slug (malá písmena,
 * číslice a pomlčky) a tělo (aspoň 20 znaků) — a ke každému českou hlášku.
 */
export const ClanekSchema = z.object({});

/**
 * Smí uživatel upravit článek? Admin a editor kterýkoli, autor jen svůj
 * a jen dokud je v konceptu. Chybějící uživatel nebo článek znamená „nesmí".
 */
export function smiUpravit(uzivatel: Uzivatel | null | undefined, clanek: Clanek | null | undefined): boolean {
  return false;
}

/** Smí uživatel publikovat? Jen editor a admin. */
export function smiPublikovat(uzivatel: Uzivatel | null | undefined): boolean {
  return false;
}

/**
 * Vytvoří nový článek jako koncept. Autorem je přihlášený uživatel.
 * Slug musí být v databázi jedinečný.
 */
export async function vytvorClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  return { ok: false, chyba: 'nenalezen' };
}

/** Upraví titulek a tělo článku podle `id` z formuláře. Slug se nemění. */
export async function upravClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  return { ok: false, chyba: 'nenalezen' };
}

/** Přepne článek do stavu `publikovano`. */
export async function publikujClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  return { ok: false, chyba: 'nenalezen' };
}

/** Smaže článek z databáze a vrátí ten smazaný. */
export async function smazClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  return { ok: false, chyba: 'nenalezen' };
}
```

# --solution--

## --file-- akce.ts

```ts
import { z } from 'zod';

import type { Databaze } from './databaze.ts';
import type { Clanek, Uzivatel, Vysledek } from './typy.ts';

export const ClanekSchema = z.object({
  titulek: z
    .string()
    .trim()
    .min(3, 'Titulek musí mít aspoň 3 znaky.')
    .max(120, 'Titulek může mít nejvýš 120 znaků.'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug smí mít jen malá písmena bez diakritiky, číslice a pomlčky.'),
  telo: z.string().trim().min(20, 'Tělo článku musí mít aspoň 20 znaků.'),
});

const UpravaSchema = ClanekSchema.pick({ titulek: true, telo: true });

export function smiUpravit(uzivatel: Uzivatel | null | undefined, clanek: Clanek | null | undefined): boolean {
  if (!uzivatel || !clanek) return false;
  if (uzivatel.role === 'admin' || uzivatel.role === 'editor') return true;
  return clanek.autorId === uzivatel.id && clanek.stav === 'koncept';
}

export function smiPublikovat(uzivatel: Uzivatel | null | undefined): boolean {
  if (!uzivatel) return false;
  return uzivatel.role === 'editor' || uzivatel.role === 'admin';
}

export async function vytvorClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const vysledek = ClanekSchema.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) return { ok: false, chybyPoli: z.flattenError(vysledek.error).fieldErrors };

  const { titulek, slug, telo } = vysledek.data;
  if (db.vsechny().some((clanek) => clanek.slug === slug)) {
    return { ok: false, chybyPoli: { slug: ['Článek s tímhle slugem už existuje.'] } };
  }

  const clanek = db.uloz({
    id: `clanek-${slug}`,
    slug,
    titulek,
    telo,
    autorId: session.id,
    stav: 'koncept',
  });

  return { ok: true, clanek };
}

export async function upravClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (!smiUpravit(session, clanek)) return { ok: false, chyba: 'bezopravneni' };

  const vysledek = UpravaSchema.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) return { ok: false, chybyPoli: z.flattenError(vysledek.error).fieldErrors };

  return { ok: true, clanek: db.uloz({ ...clanek, ...vysledek.data }) };
}

export async function publikujClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (!smiPublikovat(session)) return { ok: false, chyba: 'bezopravneni' };

  return { ok: true, clanek: db.uloz({ ...clanek, stav: 'publikovano' }) };
}

export async function smazClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (session.role !== 'admin') return { ok: false, chyba: 'bezopravneni' };

  db.smaz(clanek.id);
  return { ok: true, clanek };
}
```

# --approaches--

## --approach-- Jedna společná stráž

Čtyři akce začínají skoro stejně: session, načtení článku, kontrola práva. Když
tu trojici vytáhneš do jedné funkce, akce samotné zůstanou o tom, co dělají —
a kontrolu nejde zapomenout, protože bez ní se článek nedá získat.

Hodí se, jakmile akcí přibývá. Daň za to je jedna vrstva navíc a typ, který musí
umět říct „buď článek, nebo chyba".

### --file-- akce.ts

```ts
import { z } from 'zod';

import type { Databaze } from './databaze.ts';
import type { Clanek, Uzivatel, Vysledek } from './typy.ts';

export const ClanekSchema = z.object({
  titulek: z
    .string()
    .trim()
    .min(3, 'Titulek musí mít aspoň 3 znaky.')
    .max(120, 'Titulek může mít nejvýš 120 znaků.'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug smí mít jen malá písmena bez diakritiky, číslice a pomlčky.'),
  telo: z.string().trim().min(20, 'Tělo článku musí mít aspoň 20 znaků.'),
});

const UpravaSchema = ClanekSchema.pick({ titulek: true, telo: true });

type Straz = { ok: true; clanek: Clanek } | { ok: false; chyba: 'neprihlasen' | 'nenalezen' | 'bezopravneni' };

export function smiUpravit(uzivatel: Uzivatel | null | undefined, clanek: Clanek | null | undefined): boolean {
  if (!uzivatel || !clanek) return false;
  if (uzivatel.role === 'admin' || uzivatel.role === 'editor') return true;
  return clanek.autorId === uzivatel.id && clanek.stav === 'koncept';
}

export function smiPublikovat(uzivatel: Uzivatel | null | undefined): boolean {
  if (!uzivatel) return false;
  return uzivatel.role === 'editor' || uzivatel.role === 'admin';
}

/** Session, existence článku a právo na jednom místě. */
function nactiClanek(
  db: Databaze,
  session: Uzivatel | null,
  formData: FormData,
  smi: (uzivatel: Uzivatel, clanek: Clanek) => boolean,
): Straz {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (!smi(session, clanek)) return { ok: false, chyba: 'bezopravneni' };

  return { ok: true, clanek };
}

export async function vytvorClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const vysledek = ClanekSchema.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) return { ok: false, chybyPoli: z.flattenError(vysledek.error).fieldErrors };

  const { titulek, slug, telo } = vysledek.data;
  if (db.vsechny().some((clanek) => clanek.slug === slug)) {
    return { ok: false, chybyPoli: { slug: ['Článek s tímhle slugem už existuje.'] } };
  }

  return {
    ok: true,
    clanek: db.uloz({ id: `clanek-${slug}`, slug, titulek, telo, autorId: session.id, stav: 'koncept' }),
  };
}

export async function upravClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  const straz = nactiClanek(db, session, formData, smiUpravit);
  if (!straz.ok) return straz;

  const vysledek = UpravaSchema.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) return { ok: false, chybyPoli: z.flattenError(vysledek.error).fieldErrors };

  return { ok: true, clanek: db.uloz({ ...straz.clanek, ...vysledek.data }) };
}

export async function publikujClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  const straz = nactiClanek(db, session, formData, (uzivatel) => smiPublikovat(uzivatel));
  if (!straz.ok) return straz;

  return { ok: true, clanek: db.uloz({ ...straz.clanek, stav: 'publikovano' }) };
}

export async function smazClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  const straz = nactiClanek(db, session, formData, (uzivatel) => uzivatel.role === 'admin');
  if (!straz.ok) return straz;

  db.smaz(straz.clanek.id);
  return { ok: true, clanek: straz.clanek };
}
```

## --approach-- Tabulka pravidel

Práva popíšeš jako data: jedna tabulka role → co smí. Kód akcí se pak neptá
„je to admin nebo editor", ale „má tahle role právo publikovat". Nové pravidlo
znamená změnu v tabulce, ne v pěti podmínkách.

Hodí se, když rolí přibývá nebo když má být seznam práv vidět na jednom místě
(třeba v administraci). Za to zaplatíš tím, že pravidla, která závisejí na
konkrétním záznamu — „jen dokud je v konceptu" — do tabulky nevejdou a zůstanou v kódu.

### --file-- akce.ts

```ts
import { z } from 'zod';

import type { Databaze } from './databaze.ts';
import type { Clanek, Role, Uzivatel, Vysledek } from './typy.ts';

export const ClanekSchema = z.object({
  titulek: z
    .string()
    .trim()
    .min(3, 'Titulek musí mít aspoň 3 znaky.')
    .max(120, 'Titulek může mít nejvýš 120 znaků.'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug smí mít jen malá písmena bez diakritiky, číslice a pomlčky.'),
  telo: z.string().trim().min(20, 'Tělo článku musí mít aspoň 20 znaků.'),
});

const UpravaSchema = ClanekSchema.pick({ titulek: true, telo: true });

type Pravo = 'upravitCizi' | 'upravitPublikovany' | 'publikovat' | 'mazat';

const PRAVA: Record<Role, Pravo[]> = {
  autor: [],
  editor: ['upravitCizi', 'upravitPublikovany', 'publikovat'],
  admin: ['upravitCizi', 'upravitPublikovany', 'publikovat', 'mazat'],
};

function ma(uzivatel: Uzivatel | null | undefined, pravo: Pravo): boolean {
  if (!uzivatel) return false;
  return PRAVA[uzivatel.role].includes(pravo);
}

export function smiUpravit(uzivatel: Uzivatel | null | undefined, clanek: Clanek | null | undefined): boolean {
  if (!uzivatel || !clanek) return false;
  if (clanek.autorId !== uzivatel.id && !ma(uzivatel, 'upravitCizi')) return false;
  return clanek.stav === 'koncept' || ma(uzivatel, 'upravitPublikovany');
}

export function smiPublikovat(uzivatel: Uzivatel | null | undefined): boolean {
  return ma(uzivatel, 'publikovat');
}

export async function vytvorClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const vysledek = ClanekSchema.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) return { ok: false, chybyPoli: z.flattenError(vysledek.error).fieldErrors };

  const { titulek, slug, telo } = vysledek.data;
  if (db.vsechny().some((clanek) => clanek.slug === slug)) {
    return { ok: false, chybyPoli: { slug: ['Článek s tímhle slugem už existuje.'] } };
  }

  return {
    ok: true,
    clanek: db.uloz({ id: `clanek-${slug}`, slug, titulek, telo, autorId: session.id, stav: 'koncept' }),
  };
}

export async function upravClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (!smiUpravit(session, clanek)) return { ok: false, chyba: 'bezopravneni' };

  const vysledek = UpravaSchema.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) return { ok: false, chybyPoli: z.flattenError(vysledek.error).fieldErrors };

  return { ok: true, clanek: db.uloz({ ...clanek, ...vysledek.data }) };
}

export async function publikujClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (!ma(session, 'publikovat')) return { ok: false, chyba: 'bezopravneni' };

  return { ok: true, clanek: db.uloz({ ...clanek, stav: 'publikovano' }) };
}

export async function smazClanek(db: Databaze, session: Uzivatel | null, formData: FormData): Promise<Vysledek> {
  if (!session) return { ok: false, chyba: 'neprihlasen' };

  const clanek = db.najdi(String(formData.get('id') ?? ''));
  if (!clanek) return { ok: false, chyba: 'nenalezen' };
  if (!ma(session, 'mazat')) return { ok: false, chyba: 'bezopravneni' };

  db.smaz(clanek.id);
  return { ok: true, clanek };
}
```

# --review--

Testy hlídají chování. Tohle si zkontroluj sám — přesně na to se ptá kolega
u code review a tazatel na pohovoru.

## --rubric--

- Pořadí kontrol je ve všech akcích stejné: kdo → co → smí → data.
- Identita a autorství se berou výhradně ze `session`, nikde z `formData`.
- Rozhodovací pravidla jsou čisté funkce (`smiUpravit`, `smiPublikovat`), ne rozkopírované podmínky.
- Hlášky u polí jsou české věty, ze kterých uživatel pozná, co má opravit.
- Očekávané chyby se vracejí, výjimka zůstala jen na skutečnou poruchu.
- Kdyby zítra přibyla role „korektor", víš přesně, kolik míst musíš změnit.

## --extensions--

**Rozšíření bez testů**

- Přidej akci `vratDoKonceptu` (jen editor a admin) a domysli, kdo smí článek
  upravit potom.
- Doplň k článku `upraveno: Date` a nastavuj ho při každé úpravě.
- Napiš si k akcím vlastní testy ve Vitestu (`npx vitest run`) a zkus najít případ,
  který zadání neřeší.
- Vyměň paměťovou databázi za Drizzle nad SQLite. Akce se nesmí změnit ani o řádek —
  to je ta zkouška, jestli jsi vrstvu oddělil dobře.
