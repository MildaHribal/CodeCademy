---
title: Závěrečný fullstack projekt
timeoutMs: 240000
---

# --description--

## Zadání

Tohle je poslední projekt kurzu — ten, na který budeš na pohovoru odkazovat. Postavíš
**celou aplikaci**: lidé v ní něco vypisují, prohlížejí a zakládají, přihlašují se
a mění jen to, co je jejich. Poběží na produkčním buildu, bude mít testy a nasazení.

**Téma si zvol sám.** Bazárek, evidence výdajů, přihlašování na kurzy, seznam
přečtených knih, servisní kniha kola, rozpis směn — cokoli, o čem něco víš a co ti
nepřijde nudné. Zadání proto nemluví o konkrétních entitách: pojmenuje **záznam**
a nechá na tobě, co to u tebe je.

> [!NOTE]
> Vybraná složka `starter/` má hotovou kostru: běžící aplikaci s layoutem, prázdné
> `lib/pravidla.ts` a `lib/schemata.ts`, nastavení TypeScriptu a Vitestu. Řešení
> v `solution/` je jedno z možných témat (sousedský bazárek) — otevři ho, až budeš
> hotový, ne dřív.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku ve VS Code (`code <cesta>`).
2. `npm install`, pak `npm run dev` a otevři `http://localhost:3000`.
3. Napiš si do `README.md` dvě věty o tom, co aplikace dělá a pro koho. Teprve pak
   začni psát kód — ty dvě věty ti pak rozhodnou každý spor sám se sebou.
4. Po každé etapě klikni na **Zkontrolovat**.

## Uživatelské příběhy

- Jako **návštěvník** chci vidět seznam záznamů a otevřít detail kteréhokoli z nich,
  aby mi aplikace dávala smysl ještě předtím, než se zaregistruju.
- Jako **návštěvník** chci u neexistující adresy dostat vlídnou stránku a stav 404,
  ne bílou obrazovku s výjimkou.
- Jako **přihlášený uživatel** chci založit nový záznam formulářem a hned potom ho
  vidět v seznamu.
- Jako **přihlášený uživatel** chci u špatně vyplněného formuláře dostat hlášku
  u konkrétního pole a neztratit to, co jsem už napsal.
- Jako **přihlášený uživatel** chci mít stránku „moje záznamy", kde je jen to moje.
- Jako **autor** chci svůj záznam smazat, ale ne když je už uzamčený — to už na něm
  visí něco cizího.
- Jako **admin** chci moct upravit i cizí záznam, protože po mně lidi chtějí opravy.
- Jako **kdokoli** nechci, aby mi někdo cizí smazal záznam tím, že si v prohlížeči
  přepíše skryté pole ve formuláři.
- Jako **provozovatel** chci aplikaci nasadit a spustit jedním příkazem a vědět,
  které proměnné prostředí potřebuje.

## Technické požadavky

**Datový model.** Jedna hlavní tabulka záznamů a tabulka uživatelů. Záznam má
vlastníka (`autorId`) a sloupec `stav`. Aspoň dvě hodnoty stavu: běžná a **`uzamceno`**
— u bazaru rezervováno, u výdajů schváleno, u kurzů uzavřeno. Jméno `uzamceno` drž,
kontrola s ním počítá. Úložištěm může být SQLite přes Drizzle, Postgres, nebo
i soubor JSON — ale skrz jednu datovou vrstvu, ne rozsypané dotazy po stránkách.

**Dva čisté moduly bez Next.js.** Tyhle dva soubory si kontrola spouští sama, takže
z nich nesmí vést import na `next/*` ani na databázi:

- `lib/pravidla.ts` — `smiUpravit(uzivatel, zaznam)` a `smiSmazat(uzivatel, zaznam)`.
  Admin smí ke každému záznamu. Ostatní jen ke svému. Smazat smí autor jen záznam,
  který není `uzamceno`. Chybějící uživatel nebo záznam znamená vždycky „nesmí".
- `lib/schemata.ts` — `ZaznamSchema` (zod), `ukazkovyZaznam` (platná data **jako
  řetězce**, tak jak přijdou z formuláře) a `chybyPoli(error)`, která vrátí hlášky
  ve tvaru `{ pole: ['Česká věta.'] }`. Aspoň čtyři pole, text se ořezává, nesmyslně
  dlouhý vstup se odmítá a každá hláška je česká věta s tečkou.

**Stránky.** Layout s `metadata`, seznam, detail v dynamickém segmentu s `notFound()`
a vlastní `not-found.tsx`, `loading.tsx` a `error.tsx` (ten je klientský a nabízí
`reset`). Chráněná stránka „moje záznamy", která nepřihlášeného pošle na přihlášení.

**Změny dat.** Formulář volá serverovou akci. Akce ověří přihlášení, prožene vstup
schématem, teprve potom zapíše — a vlastníka bere ze session, nikdy z formuláře.
Na konci zneplatní cache. Formulář je klientská komponenta se stavem akce: umí
ukázat chyby u polí a zablokovat tlačítko během odesílání.

**Cache.** Veřejné čtení uloženo pod značkou, osobní data bez cache. Ve funkci
s `'use cache'` nesmí být `cookies()` ani `headers()`.

**Bezpečnost.** `proxy.ts` s `matcher` na chráněné adresy jako rychlá výhybka.
Žádné tajemství v souboru s `'use client'` — do prohlížeče smí jen proměnná
s prefixem `NEXT_PUBLIC_`. `.env` v `.gitignore`, vzor v `.env.example`.

**Kvalita a provoz.** Vlastní testy ve Vitestu nad `lib/` (aspoň šest případů),
`npm run lint`, `npm run typecheck`, `npm run build` a nasazení: `Dockerfile`
nebo workflow v `.github/workflows/`.

**README.** Jak to spustit, co kde je, jaké proměnné prostředí to chce — a hlavně
oddíl **Rozhodnutí**, kde u tří voleb napíšeš, proč jsi to udělal takhle a co by
bylo tou druhou cestou. Na pohovoru se ptají přesně na tohle.

> [!PITFALL]
> Nejčastější způsob, jak si tenhle projekt pokazit, je začít od vzhledu. Začni
> od `lib/pravidla.ts` a `lib/schemata.ts` — jsou to dva malé soubory, dají se
> otestovat za vteřinu a rozhodují o tom, jestli je aplikace bezpečná. Vzhled
> doděláš, až bude jasné, co aplikace dělá.

## Než to uzavřeš

Pusť `npm run build` a přečti si výpis: u každé routy uvidíš, jestli je statická,
nebo se vyrábí při požadavku. Potom aplikaci spusť přes `npm run start` a proklikej
ji jako cizí člověk — nepřihlášený, přihlášený, s prázdným seznamem i se špatně
vyplněným formulářem.

# --hints--

`smiUpravit` pustí vlastníka a admina, cizího ne.

```js
const { smiUpravit } = await helpers.importFile('lib/pravidla.ts');
const eva = { id: 'eva', role: 'uzivatel' };
const petr = { id: 'petr', role: 'uzivatel' };
const admin = { id: 'sarka', role: 'admin' };
const zaznamEvy = { autorId: 'eva', stav: 'aktivni' };

assert.equal(smiUpravit(eva, zaznamEvy), true, 'Autor smí upravit svůj záznam');
assert.equal(smiUpravit(petr, zaznamEvy), false, 'Cizí uživatel nesmí upravit záznam Evy');
assert.equal(smiUpravit(admin, zaznamEvy), true, 'Admin smí upravit i cizí záznam');
```

`smiUpravit` vrátí `false`, kdykoli chybí uživatel nebo záznam.

```js
const { smiUpravit } = await helpers.importFile('lib/pravidla.ts');
const eva = { id: 'eva', role: 'uzivatel' };

assert.equal(smiUpravit(null, { autorId: 'eva' }), false, 'Nepřihlášený nesmí upravit nic');
assert.equal(smiUpravit(eva, null), false, 'Neexistující záznam nejde upravit');
assert.equal(smiUpravit(undefined, undefined), false, 'Dvakrát undefined není shoda vlastníka');
assert.equal(smiUpravit(eva, { stav: 'aktivni' }), false, 'Záznam bez autora nepatří nikomu');
assert.equal(smiUpravit({ id: undefined, role: 'uzivatel' }, { stav: 'aktivni' }), false, 'Chybějící id se nesmí rovnat chybějícímu autorovi');
```

`smiSmazat` pustí autora jen u záznamu, který není `uzamceno`.

```js
const { smiSmazat } = await helpers.importFile('lib/pravidla.ts');
const eva = { id: 'eva', role: 'uzivatel' };
const petr = { id: 'petr', role: 'uzivatel' };
const admin = { id: 'sarka', role: 'admin' };

assert.equal(smiSmazat(eva, { autorId: 'eva', stav: 'aktivni' }), true, 'Autor smí smazat svůj běžný záznam');
assert.equal(smiSmazat(eva, { autorId: 'eva', stav: 'uzamceno' }), false, 'Autor nesmí smazat uzamčený záznam');
assert.equal(smiSmazat(admin, { autorId: 'eva', stav: 'uzamceno' }), true, 'Admin smí smazat i uzamčený záznam');
assert.equal(smiSmazat(petr, { autorId: 'eva', stav: 'aktivni' }), false, 'Cizí uživatel nesmí mazat');
assert.equal(smiSmazat(null, { autorId: 'eva', stav: 'aktivni' }), false, 'Nepřihlášený nesmí mazat');
```

Schéma přijme `ukazkovyZaznam`, má aspoň čtyři pole a ořezává mezery.

```js
const { ZaznamSchema, ukazkovyZaznam } = await helpers.importFile('lib/schemata.ts');

const pole = Object.keys(ZaznamSchema.shape ?? {});
assert.ok(pole.length >= 4, `Záznam má mít aspoň čtyři pole, schéma jich má ${pole.length}: ${pole.join(', ')}`);

const vysledek = ZaznamSchema.safeParse(ukazkovyZaznam);
assert.ok(vysledek.success, `ukazkovyZaznam má schématem projít, hlásí: ${JSON.stringify(vysledek.error?.issues ?? [])}`);

const textove = Object.keys(ukazkovyZaznam).filter((klic) => typeof vysledek.data[klic] === 'string');
assert.ok(textove.length >= 1, 'Aspoň jedno pole má po parsování zůstat text');
const klic = textove[0];
const smezerami = ZaznamSchema.safeParse({ ...ukazkovyZaznam, [klic]: `   ${ukazkovyZaznam[klic]}   ` });
assert.equal(smezerami.data?.[klic], vysledek.data[klic], `Pole „${klic}" má mezery kolem textu oříznout (trim)`);
```

Prázdný formulář schéma odmítne a `chybyPoli` popíše každé pole českou větou.

```js
const { ZaznamSchema, chybyPoli } = await helpers.importFile('lib/schemata.ts');

const vysledek = ZaznamSchema.safeParse({});
assert.equal(vysledek.success, false, 'Prázdný formulář nesmí schématem projít');

const chyby = chybyPoli(vysledek.error);
const klice = Object.keys(chyby).filter((klic) => (chyby[klic] ?? []).length > 0);
assert.ok(klice.length >= 3, `chybyPoli má vrátit hlášku aspoň u tří polí, vrátilo: ${JSON.stringify(chyby)}`);

for (const klic of klice) {
  const hlaska = chyby[klic][0];
  assert.ok(hlaska.length >= 8, `Hláška u pole „${klic}" je příliš krátká: ${JSON.stringify(hlaska)}`);
  assert.ok(/[.!?]$/.test(hlaska.trim()), `Hláška u pole „${klic}" má být věta zakončená tečkou, je: ${JSON.stringify(hlaska)}`);
  assert.ok(!/required|expected|invalid/i.test(hlaska), `Hláška u pole „${klic}" je výchozí anglická hláška zodu: ${JSON.stringify(hlaska)}`);
}
```

Schéma odmítne nesmyslně dlouhý text i hodnotu mimo povolený seznam.

```js
const { ZaznamSchema, ukazkovyZaznam } = await helpers.importFile('lib/schemata.ts');
const puvodni = ZaznamSchema.safeParse(ukazkovyZaznam);

const textove = Object.keys(ukazkovyZaznam).filter((klic) => typeof puvodni.data[klic] === 'string');
const klic = textove[0];
const dlouhy = ZaznamSchema.safeParse({ ...ukazkovyZaznam, [klic]: 'a'.repeat(5000) });
assert.equal(dlouhy.success, false, `Pole „${klic}" má mít horní mez délky — 5000 znaků projít nesmí`);

const prazdny = ZaznamSchema.safeParse({ ...ukazkovyZaznam, [klic]: '   ' });
assert.equal(prazdny.success, false, `Pole „${klic}" nesmí projít, když jsou v něm jen mezery`);
```

Vlastní testy v `lib/` projdou a je jich aspoň šest.

```js
const testy = Object.keys(files).filter((jmeno) => /^lib\/.*\.test\.ts$/.test(jmeno));
assert.ok(testy.length >= 1, 'V lib/ má být aspoň jeden soubor s testy (například lib/pravidla.test.ts)');

const pripady = testy.reduce((soucet, jmeno) => soucet + (files[jmeno].match(/\b(it|test)\s*\(/g) ?? []).length, 0);
assert.ok(pripady >= 6, `Testů má být aspoň šest, napsal jsi ${pripady}`);

const vysledek = await helpers.run('npx vitest run', { timeoutMs: 120000 });
assert.equal(vysledek.code, 0, `npm test má projít bez chyby:\n${vysledek.stdout}${vysledek.stderr}`);
```

Kontrola typů čisté logiky projde a `lib/pravidla.ts` nezávisí na Next.js ani na databázi.

```js
for (const jmeno of ['lib/pravidla.ts', 'lib/schemata.ts']) {
  assert.ok(typeof files[jmeno] === 'string', `Chybí soubor ${jmeno}`);
  const zdroj = helpers.stripComments(files[jmeno], 'js');
  assert.ok(!/from\s+['"]next\//.test(zdroj), `${jmeno} nesmí importovat z next/* — je to čistá logika`);
  assert.ok(!/drizzle|better-sqlite3|['"]\.\/db/.test(zdroj), `${jmeno} nesmí sahat na databázi`);
}

const vysledek = await helpers.run('npx tsc --noEmit -p tsconfig.lib.json', { timeoutMs: 90000 });
assert.equal(vysledek.code, 0, `npm run typecheck:lib má projít bez chyby:\n${vysledek.stdout}${vysledek.stderr}`);
```

Aplikace má layout s metadaty, seznam a detail v dynamickém segmentu.

```js
const layout = files['app/layout.tsx'] ?? files['app/layout.jsx'];
assert.ok(typeof layout === 'string', 'Chybí app/layout.tsx');
assert.match(layout, /export\s+default/, 'Layout potřebuje výchozí export');
assert.match(layout, /export\s+(const|async\s+function|function)\s+(metadata|generateMetadata)/, 'Layout má exportovat metadata s titulkem a popisem');

const stranky = Object.keys(files).filter((jmeno) => /^app\/.+\/page\.(tsx|jsx)$/.test(jmeno));
assert.ok(stranky.length >= 2, `Aplikace má mít aspoň dvě vlastní stránky pod app/, našel jsem: ${stranky.join(', ') || 'žádnou'}`);

const detail = stranky.filter((jmeno) => /\[[^\]]+\]\/page\.(tsx|jsx)$/.test(jmeno));
assert.ok(detail.length >= 1, `Detail patří do dynamického segmentu app/…/[slug]/page.tsx, našel jsem: ${stranky.join(', ')}`);

const zdroj = helpers.stripComments(files[detail[0]], 'js');
assert.match(zdroj, /await\s+params/, `params je slib, takže ho v ${detail[0]} počkej`);
assert.match(zdroj, /notFound\s*\(\s*\)/, `Neznámý záznam má v ${detail[0]} skončit voláním notFound()`);
```

Větev s detailem má vlastní 404, stav načítání i hranici chyby.

```js
const najdi = (jmeno) => Object.keys(files).filter((cesta) => cesta.startsWith('app/') && cesta.split('/').pop().startsWith(jmeno));

assert.ok(najdi('not-found').length >= 1, 'Chybí not-found.tsx — neznámý záznam má mít vlídnou stránku');
assert.ok(najdi('loading').length >= 1, 'Chybí loading.tsx se stavem načítání');

const chyby = najdi('error');
assert.ok(chyby.length >= 1, 'Chybí error.tsx s hranicí chyby');
const zdroj = files[chyby[0]];
assert.match(zdroj.trimStart(), /^['"]use client['"]/, `Hranice chyby má stav, takže ${chyby[0]} začíná direktivou "use client"`);
assert.match(helpers.stripComments(zdroj, 'js'), /reset/, `${chyby[0]} dostane funkci reset — nabídni ji tlačítkem`);
```

Serverová akce ověří přihlášení, prožene vstup schématem a na konci zneplatní cache.

```js
const akce = Object.keys(files).filter((jmeno) => /\.(ts|tsx)$/.test(jmeno) && /['"]use server['"]/.test(files[jmeno]));
assert.ok(akce.length >= 1, 'Nenašel jsem soubor se serverovou akcí (direktiva "use server")');

const zdroj = helpers.stripComments(akce.map((jmeno) => files[jmeno]).join('\n'), 'js');
assert.match(zdroj, /safeParse|\.parse\s*\(/, 'Akce má vstup z formuláře prohnat schématem, ne mu věřit');
assert.match(zdroj, /(prihlasenyUzivatel|vyzadujUzivatele|getSession)\s*\(/, 'Akce má na začátku zjistit, kdo je přihlášený');
assert.match(zdroj, /(updateTag|revalidateTag|revalidatePath)\s*\(/, 'Akce má po zápisu zneplatnit cache, jinak uživatel svoji změnu neuvidí');
assert.ok(!/(autorId|autorid|userId|ownerId)\s*[:=]\s*(String\s*\()?\s*(formData|data)\.get/.test(zdroj), 'Vlastníka ber ze session, ne z formuláře — skryté pole si kdokoli přepíše');
```

Formulář je klientská komponenta se stavem akce a stavem odesílání.

```js
const klientske = Object.keys(files).filter((jmeno) => /\.(tsx|jsx)$/.test(jmeno) && /^['"]use client['"]/.test(files[jmeno].trimStart()));
assert.ok(klientske.length >= 1, 'Nenašel jsem klientskou komponentu (soubor začínající direktivou "use client")');

const formulare = klientske.filter((jmeno) => /<form[\s>]/.test(files[jmeno]));
assert.ok(formulare.length >= 1, `Formulář patří do klientské komponenty, aby uměl ukázat chyby u polí. Klientské soubory: ${klientske.join(', ')}`);

const zdroj = helpers.stripComments(formulare.map((jmeno) => files[jmeno]).join('\n'), 'js');
assert.match(zdroj, /useActionState|useFormState/, 'Chyby od serveru drž ve stavu akce (useActionState)');
assert.match(zdroj, /useFormStatus|pending|disabled/, 'Během odesílání zablokuj tlačítko, ať se formulář neodešle dvakrát');
```

Chráněná stránka pošle nepřihlášeného na přihlášení a `proxy.ts` má `matcher`.

```js
const proxy = files['proxy.ts'] ?? files['proxy.js'];
assert.ok(typeof proxy === 'string', 'Chybí proxy.ts v kořeni projektu');
assert.match(helpers.stripComments(proxy, 'js'), /export\s+(async\s+)?(function|const)\s+proxy/, 'proxy.ts má exportovat funkci proxy');
assert.match(proxy, /matcher/, 'proxy.ts má omezit matcherem, na kterých adresách běží');

const stranky = Object.keys(files).filter((jmeno) => /^app\/.+\/page\.(tsx|jsx)$/.test(jmeno));
const chranene = stranky.filter((jmeno) => /vyzadujUzivatele|redirect\s*\(|prihlasenyUzivatel|getSession/.test(helpers.stripComments(files[jmeno], 'js')));
assert.ok(chranene.length >= 1, `Aspoň jedna stránka má být chráněná i sama o sobě — proxy.ts je jen výhybka. Stránky: ${stranky.join(', ')}`);
```

Veřejné čtení je v cache pod značkou, osobní data v ní nejsou.

```js
const ulozene = Object.keys(files).filter((jmeno) => /\.(ts|tsx)$/.test(jmeno) && /['"]use cache['"]/.test(files[jmeno]));
assert.ok(ulozene.length >= 1, 'Veřejné čtení ulož do cache direktivou "use cache" — jinak se seznam počítá při každém požadavku');

const znacky = ulozene.map((jmeno) => files[jmeno]).join('\n');
assert.match(znacky, /cacheTag\s*\(/, 'Uložená funkce potřebuje cacheTag, jinak ji nemáš jak zneplatnit');

for (const jmeno of ulozene) {
  const zdroj = helpers.stripComments(files[jmeno], 'js');
  assert.ok(!/\bcookies\s*\(/.test(zdroj), `${jmeno} má "use cache" a čte cookies() — uložená kopie by se nabídla i cizímu uživateli`);
  assert.ok(!/\bheaders\s*\(/.test(zdroj), `${jmeno} má "use cache" a čte headers() — to je údaj o jednom konkrétním požadavku`);
}
```

Do prohlížeče nejde žádné tajemství a `.env` není v repozitáři.

```js
const klientske = Object.keys(files).filter((jmeno) => /\.(ts|tsx|js|jsx)$/.test(jmeno) && /^['"]use client['"]/.test(files[jmeno].trimStart()));
for (const jmeno of klientske) {
  const promenne = files[jmeno].match(/process\.env\.([A-Z0-9_]+)/g) ?? [];
  for (const promenna of promenne) {
    assert.ok(promenna.includes('NEXT_PUBLIC_'), `${jmeno} je klientský a čte ${promenna} — do prohlížeče smí jen proměnná s prefixem NEXT_PUBLIC_`);
  }
}

assert.ok(typeof files['.env.example'] === 'string', 'Chybí .env.example se vzorem proměnných prostředí');
assert.ok(!Object.keys(files).some((jmeno) => jmeno === '.env' || jmeno === '.env.local'), 'Soubor .env do repozitáře nepatří — patří do .gitignore');
assert.match(files['.gitignore'] ?? '', /\.env/, '.gitignore má ignorovat .env');
```

`package.json` má skripty na kontrolu a projekt má nasazení.

```js
const balicek = JSON.parse(files['package.json'] ?? '{}');
for (const skript of ['dev', 'build', 'start', 'lint', 'typecheck', 'test']) {
  assert.ok(balicek.scripts?.[skript], `package.json nemá skript "${skript}" (mám: ${Object.keys(balicek.scripts ?? {}).join(', ')})`);
}
assert.ok(balicek.dependencies?.next, 'package.json nemá závislost na next');

const nasazeni = Object.keys(files).filter((jmeno) => jmeno === 'Dockerfile' || /^\.github\/workflows\/.+\.(yml|yaml)$/.test(jmeno));
assert.ok(nasazeni.length >= 1, 'Chybí nasazení: buď Dockerfile, nebo workflow v .github/workflows/');
```

README popisuje spuštění, proměnné prostředí a tvoje rozhodnutí.

```js
const readme = files['README.md'] ?? '';
assert.ok(readme.length >= 800, `README má ${readme.length} znaků — na pohovoru z něj má být jasné, co aplikace dělá a proč je udělaná takhle (aspoň 800)`);
assert.match(readme, /npm (run )?(install|dev)/, 'README má říct, jak projekt spustit');
assert.match(readme, /npm run build/, 'README má zmínit produkční build');
assert.match(readme, /^#{1,3} .*[Rr]ozhodnut/m, 'README má mít oddíl „Rozhodnutí" s tím, proč jsi to udělal takhle');
assert.ok(!/TODO|doplň sem|napiš sem/i.test(readme), 'V README zůstal nedodělaný text ze šablony');

const rozhodnuti = readme.split(/^#{1,3} .*[Rr]ozhodnut.*$/m)[1] ?? '';
assert.ok(rozhodnuti.trim().length >= 250, `Oddíl „Rozhodnutí" má ${rozhodnuti.trim().length} znaků — popiš tři volby a druhou cestu u každé`);
```

# --help--

## --tip-- 1

Začni od `lib/pravidla.ts`. Obě funkce dostanou uživatele a záznam a vrátí `true`
nebo `false` — žádná databáze, žádný `await`. Nejdřív odbav případy, kdy něco
chybí, a teprve potom se ptej na roli a na vlastníka. Past je v tom, že dvě
chybějící hodnoty se sobě rovnají; proč, je v lekci
[Přihlášení v Next.js](see:next-fullstack/auth-v-nextu#ochrana-stranky-a-akce).

## --tip-- 2

Ke každé funkci v `lib/` si rovnou napiš případ ve Vitestu. Vrátí se ti to hned:
celá sada doběhne za pár set milisekund, takže si můžeš dovolit zkoušet i divné
vstupy — chybějícího uživatele, záznam bez autora, dvakrát `undefined`.
Jak se testy píšou, je v lekci
[Testy a nasazení](see:next-fullstack/testy-a-nasazeni-nextu#vitest-na-logiku).

## --tip-- 3

Hlášky u polí drž **v schématu**, ne ve formuláři. Zod bere text hlášky jako
druhý argument u každého pravidla a `z.flattenError` z výsledku udělá objekt
`{ pole: [hlášky] }` — přesně ten tvar, který pak formulář jen vypíše.

## --tip-- 4

Formulář potřebuje tři věci: stav akce (co server vrátil), předvyplněné hodnoty
(aby uživatel nepřišel o to, co napsal) a stav odesílání (aby šlo zablokovat
tlačítko). První dvě si nes ve stavu akce, třetí umí React sám — hook z `react-dom`,
který se ptá na nejbližší formulář nad sebou. Vzor je v kroku 12 workshopu
[Formulář se serverovou akcí](see:next-fullstack/workshop-formular-akce/010).

## --tip-- 5

Když se ti po odeslání formuláře seznam nemění, nehledej chybu v zápisu do
databáze. Zápis proběhl; stránka jen čte uloženou kopii. V akci chybí zneplatnění
značky — které ze tří a proč, je v lekci
[Data a server actions](see:next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna).

## --tip-- 6

Kontrola typů čisté logiky má vlastní `tsconfig.lib.json`, který schválně nevidí
Node API ani Next.js. Když ti pod ním něco nejde přeložit, je to signál, že se
do těch dvou souborů zatoulala závislost, která tam nepatří — ne že je konfigurace
špatně.

# --review--

Testy hlídají, že aplikace dělá, co má. Tohle si projdi sám, protože právě na tohle
se na pohovoru ptají.

## --rubric--

- Aplikace jde spustit podle README na cizím počítači bez doptávání.
- Veřejnou část si projdeš odhlášený a nikde nespadne ani nesvítí prázdné místo.
- Ve zdrojovém kódu seznamu (bez spuštěného JavaScriptu) jsou vidět názvy záznamů.
- Neexistující adresa vrací stav 404, ne výjimku a ne prázdno.
- Klientská je jen ta část, která potřebuje stav — ne celá stránka.
- Zkusil jsi v DevTools přepsat skryté pole ve formuláři a akce tě odmítla.
- Cizí účet ti neukáže ani nesmaže tvoje záznamy; zkusil jsi to ve dvou oknech.
- Jména funkcí a proměnných říkají, co dělají, bez komentáře.
- `npm run lint`, `npm run typecheck`, `npm test` i `npm run build` projdou.
- V README je u tří rozhodnutí napsané i to, co bylo tou druhou cestou.
- Víš, co bys na projektu udělal jinak, kdybys ho psal znovu.

## --extensions--

**Rozšíření bez testů**

- Úprava záznamu druhou akcí, která volá `smiUpravit` a předvyplní formulář.
- Hledání a filtr v adrese (`?q=`), aby šel výsledek poslat odkazem.
- Stránkování seznamu, ať stránka nezačne s tisícem záznamů zlobit.
- Optimistický výsledek: záznam se v seznamu objeví dřív, než server odpoví.
- Náhledový obrázek `opengraph-image.tsx` a `sitemap.ts` generovaná z dat.

**Rozšíření do portfolia**

- Nasaď to na veřejnou adresu a dej odkaz do README. Bez odkazu si projekt nikdo
  neotevře.
- Playwright test celé cesty „přihlásit se → založit záznam → vidět ho v seznamu"
  proti produkčnímu buildu, spuštěný v CI.
- Role `admin` s vlastní stránkou a auditním záznamem, kdo co změnil.
- Nahrávání obrázku k záznamu do úložiště souborů a jeho zobrazení přes `next/image`.
