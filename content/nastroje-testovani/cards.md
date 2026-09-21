## --card-- output

Cena v přehledu vypadá správně, a test na ni přesto padá. Co vypíše kód?

```js
const cena = (12500).toLocaleString('cs-CZ');
console.log(cena === '12 500');
console.log(cena.length);
console.log(cena.split(' ').length);
```

### --expected--

false
6
1

### --why--

`toLocaleString('cs-CZ')` odděluje tisíce **pevnou mezerou** (` `), ne obyčejnou.
Text má šest znaků, ale obyčejnou mezeru v sobě nemá, takže `split(' ')` vrátí jediný
díl. V testu buď očekávanou hodnotu napiš s pevnou mezerou, nebo obě strany před
porovnáním normalizuj (`replace(/\s/g, ' ')`).

### --see--

nastroje-testovani/proc-testovat#okrajove-pripady

## --card-- output

Sazba DPH má být 21 %, v kódu je omylem 12 %. Co vypíše test, který si očekávanou hodnotu počítá stejně jako kód?

```js
function sDph(cena) {
  return Math.round(cena * 1.12);
}

console.log(sDph(2490) === Math.round(2490 * 1.12));
console.log(sDph(2490));
```

### --expected--

true
2789

### --why--

Očekávaná hodnota je opsaný výpočet z implementace, takže porovnává chybu se stejnou
chybou a vyjde vždy `true`. Do testu patří číslo, které sis spočítal jinak:
2 490 × 1,21 = 3 012,9, tedy `3013`.

### --see--

nastroje-testovani/proc-testovat#typicke-chyby-a-pasti

## --card-- output

Dva testy si sdílejí košík vytvořený nad nimi v souboru. Co vypíšou?

```js
const kosik = [];

function pridej(sku) {
  kosik.push(sku);
  return kosik.length;
}

console.log(pridej('KAVA-250'));
console.log(pridej('KAVA-250'));
```

### --expected--

1
2

### --why--

Druhé volání vidí data z prvního, takže dostane 2. Když testy sdílejí stav, projdou
jen v jednom pořadí — spuštěný samostatně se druhý test rozejde s očekáváním. Data si
má připravit každý test sám, uvnitř svého těla nebo v `beforeEach`.

### --see--

nastroje-testovani/proc-testovat#typicke-chyby-a-pasti

## --card-- output

Funkce má spočítat průměrný čas běhu. Testovaná je jen na dvou bězích. Co vypíše?

```js
function prumernyCas(behy) {
  const soucet = behy.reduce((sum, beh) => sum + beh.sekundy, 0);
  return (soucet / behy.length).toFixed(1);
}

console.log(prumernyCas([{ sekundy: 1800 }, { sekundy: 2100 }]));
console.log(prumernyCas([]));
```

### --expected--

1950.0
NaN

### --why--

Dělení nulou dá `NaN` a `toFixed` z něj udělá text `NaN`, který se pak objeví
v přehledu. Prázdné pole je první okrajový případ, na který se u každé funkce nad
kolekcí ptej — hned za ním je pole s jedinou položkou.

### --see--

nastroje-testovani/proc-testovat#okrajove-pripady

## --card-- output

Takhle vypadá test na odmítnutou Promise bez `await`. Co se vypíše a v jakém pořadí?

```js
async function nactiObjednavku(id) {
  throw new Error(`Objednávka ${id} nenalezena`);
}

function test() {
  nactiObjednavku(4711).catch((error) => console.log('zachyceno:', error.message));
  console.log('test skončil');
}

test();
```

### --expected--

test skončil
zachyceno: Objednávka 4711 nenalezena

### --why--

Tělo testu doběhne celé dřív, než se Promise vůbec vyhodnotí. Přesně tohle se stane
u `assert.rejects` bez `await`: test skončí zeleně, aniž by cokoli ověřil, a Node
hlásí `asynchronous activity after the test ended`. Oprava je `await assert.rejects(…)`
a `async` u testu.

### --see--

nastroje-testovani/proc-testovat#ocekavana-chyba-throws-a-rejects

## --card-- output

Souhrn týdne vrací objekt. Co vypíše porovnání dvou objektů se stejným obsahem?

```js
const ocekavano = { pocet: 3, km: 24.5 };
const vysledek = { pocet: 3, km: 24.5 };

console.log(vysledek === ocekavano);
console.log(JSON.stringify(vysledek) === JSON.stringify(ocekavano));
```

### --expected--

false
true

### --why--

`===` u objektů porovnává odkaz, ne obsah — a to je přesně to, co dělá `assert.equal`.
Proto na objekty a pole patří `assert.deepEqual`, která projde obsah vlastnost po
vlastnosti. Porovnávat přes `JSON.stringify` se nevyplatí: záleží na pořadí klíčů
a hláška při selhání je nečitelná.

### --see--

nastroje-testovani/proc-testovat#prvni-test-v-node-test

## --card-- output

Funkce řadila podle `price`, po přejmenování pole řadí podle `cena` a chová se pořád stejně. Co vypíše kód?

```js
function seradPodleCeny(produkty) {
  const kopie = [...produkty];
  kopie.sort((a, b) => a.cena - b.cena);
  return kopie;
}

const zbozi = [{ nazev: 'Mlýnek', cena: 890 }, { nazev: 'Káva', cena: 249 }];
console.log(seradPodleCeny(zbozi)[0].nazev);
console.log(/sort\(\(a, b\) => a\.price - b\.price\)/.test(seradPodleCeny.toString()));
```

### --expected--

Káva
false

### --why--

Řazení je správné, a přesto je druhá kontrola červená: dívá se na zdrojový text funkce,
ne na výsledek. Takový test selže po každém přejmenování a naopak projde i tehdy, když
funkce vrátí špatné pořadí. Testuj, co z funkce vyjde.

### --see--

nastroje-testovani/proc-testovat#testuj-chovani-ne-implementaci

## --card-- output

Takhle zjednodušeně fungují falešné časovače. Co vypíše kód?

```js
const naplanovane = [];
const falesnyTimeout = (ukol, ms) => naplanovane.push({ ukol, ms });
const tick = (ms) => naplanovane.filter((zaznam) => zaznam.ms <= ms).forEach((zaznam) => zaznam.ukol());

let hledani = 0;
falesnyTimeout(() => { hledani += 1; }, 300);

console.log(hledani);
tick(299);
console.log(hledani);
tick(300);
console.log(hledani);
```

### --expected--

0
0
1

### --why--

Falešný čas se sám neposouvá. Dokud test nezavolá `tick`, nic naplánovaného neproběhne
a `tick(299)` na naplánovaných 300 ms nestačí. Stejně se chová `t.mock.timers`
v `node:test`: `enable` čas zastaví, `tick(ms)` ho posune a spustí všechno, co do té
doby mělo proběhnout.

### --see--

nastroje-testovani/mocky-cas-sit#falesne-casovace

## --card-- code js

Poplatek za pozdě vrácenou knihu je `sazba` Kč za každý den po termínu, nejvýš ale 200 Kč. Pro nulový a záporný počet dnů je poplatek nulový. Doplň `poplatek`.

### --seed--

```js
function poplatek(dnuPoTerminu, sazba) {
}
```

### --test--

```js
assert.equal(poplatek(3, 5), 15, 'poplatek(3, 5) má vrátit 15');
assert.equal(poplatek(0, 5), 0, 'poplatek(0, 5) má vrátit 0');
assert.equal(poplatek(-2, 5), 0, 'poplatek(-2, 5) má vrátit 0');
assert.equal(poplatek(40, 5), 200, 'poplatek(40, 5) má narazit na strop 200');
assert.equal(poplatek(41, 5), 200, 'poplatek(41, 5) má zůstat na stropu 200');
```

### --solution--

```js
function poplatek(dnuPoTerminu, sazba) {
  if (dnuPoTerminu <= 0) return 0;
  return Math.min(dnuPoTerminu * sazba, 200);
}
```

### --why--

Čtyři z pěti případů jsou okraje: nula, záporné číslo, přesný strop a den za stropem.
Právě na nich se kód láme, když ho někdo později přepíše.

### --see--

nastroje-testovani/proc-testovat#okrajove-pripady

## --card-- code js

`jePoSplatnosti` se ptá na skutečné datum, takže ji nejde otestovat. Uprav ji tak, aby šel čas předat zvenku a volání `jePoSplatnosti(objednavka)` v aplikaci zůstalo beze změny.

### --seed--

```js
function jePoSplatnosti(objednavka) {
  return new Date() > objednavka.splatnost;
}
```

### --test--

```js
const objednavka = { id: 4711, splatnost: new Date(2026, 0, 10) };
assert.equal(jePoSplatnosti(objednavka, new Date(2026, 0, 9)), false, '9. ledna ještě není po splatnosti 10. ledna');
assert.equal(jePoSplatnosti(objednavka, new Date(2026, 0, 10)), false, 'v den splatnosti (10. ledna) ještě není po splatnosti');
assert.equal(jePoSplatnosti(objednavka, new Date(2026, 0, 11)), true, '11. ledna už je po splatnosti 10. ledna');
assert.equal(typeof jePoSplatnosti(objednavka), 'boolean', 'jePoSplatnosti(objednavka) bez druhého parametru má dál vracet true/false');
```

### --solution--

```js
function jePoSplatnosti(objednavka, now = new Date()) {
  return now > objednavka.splatnost;
}
```

### --why--

Výchozí hodnota parametru je celá změna: aplikace volá funkci dál bez druhého argumentu
a test si čas určí sám. Stejně se předává `fetch`, odesílání e-mailu nebo generátor
náhodných čísel.

### --see--

nastroje-testovani/mocky-cas-sit#vlozeni-zavislosti-predej-ji-zvenku

## --card-- code js

Knihovna rozesílá upomínky. Doplň `posliUpominky(ctenari, posli)` tak, aby zavolala `posli(email, dluh)` jen pro čtenáře s dluhem větším než nula a vrátila počet odeslaných upomínek.

### --seed--

```js
function posliUpominky(ctenari, posli) {
}
```

### --test--

```js
const volani = [];
const posli = (email, castka) => { volani.push({ email, castka }); };
const ctenari = [
  { email: 'jana@knihovnakh.cz', dluh: 45 },
  { email: 'petr@knihovnakh.cz', dluh: 0 },
  { email: 'ivana@knihovnakh.cz', dluh: 120 },
];

assert.equal(posliUpominky(ctenari, posli), 2, 'posliUpominky má u dvou dlužníků ze tří vrátit 2');
assert.equal(volani.length, 2, 'posli se má zavolat dvakrát, čtenáři s dluhem 0 upomínka nechodí');
assert.deepEqual(volani[0], { email: 'jana@knihovnakh.cz', castka: 45 }, 'první volání má dostat jana@knihovnakh.cz a částku 45');
```

### --solution--

```js
function posliUpominky(ctenari, posli) {
  const dluznici = ctenari.filter((ctenar) => ctenar.dluh > 0);
  dluznici.forEach((ctenar) => posli(ctenar.email, ctenar.dluh));
  return dluznici.length;
}
```

### --why--

Pole `volani` je ruční špeh: zapisuje si každé volání, takže test může číst počet
i argumenty. Přesně tohle za tebe dělá `t.mock.fn()`: počet volání přečteš přes
`fn.mock.callCount()`, argumenty přes `fn.mock.calls[0].arguments`.

### --see--

nastroje-testovani/mocky-cas-sit#mock-funkce-a-speh

## --card-- code js

Formulář vrací délku výpůjčky ve dnech. Doplň `dnyVypujcky(text)` tak, aby z textu udělala číslo, a pro text, který číslo není, nebo pro záporný počet dnů vyhodila `RangeError`.

### --seed--

```js
function dnyVypujcky(text) {
}
```

### --test--

```js
assert.equal(dnyVypujcky('21'), 21, "dnyVypujcky('21') má vrátit číslo 21");
assert.equal(dnyVypujcky('0'), 0, "dnyVypujcky('0') má vrátit 0");
assert.throws(() => dnyVypujcky('tři'), RangeError, "dnyVypujcky('tři') má vyhodit RangeError");
assert.throws(() => dnyVypujcky('-5'), RangeError, "dnyVypujcky('-5') má vyhodit RangeError");
```

### --solution--

```js
function dnyVypujcky(text) {
  const dny = Number(text);
  if (!Number.isFinite(dny) || dny < 0) {
    throw new RangeError(`Neplatný počet dnů: ${text}`);
  }
  return dny;
}
```

### --why--

Vyhozená chyba je chování jako každé jiné, takže se testuje. Všimni si, že
`assert.throws` dostává **funkci** `() => dnyVypujcky('tři')` — kdybys jí předal rovnou
volání, chyba by vyletěla dřív, než se aserce spustí.

### --see--

nastroje-testovani/proc-testovat#ocekavana-chyba-throws-a-rejects

## --card-- free

Napsal jsi test, spustil ho a hned byl zelený. Proč to ještě nic neznamená a co s tím uděláš?

### --back--

Zelená může znamenat, že test nic nehlídá: chybí v něm aserce, chybí `await` u aserce,
která vrací Promise, nebo volá jinou funkci, než si myslíš. Než testu začnu věřit, na
chvíli rozbiju kód — změním `>=` na `>`, vrátím jinou hodnotu — a přesvědčím se, že
test zčervená a že hláška ukazuje na to, co jsem čekal. Pak opravu vrátím. Test, který
jsem nikdy neviděl selhat, je jen řádek navíc v souboru.

### --see--

nastroje-testovani/proc-testovat#typicke-chyby-a-pasti

## --card-- free

Čím se liší testovací pyramida a [[testovací trofej]] a co z toho plyne pro tvůj projekt?

### --back--

Pyramida říká: nejvíc unit testů dole, méně integračních, pár e2e nahoře — vznikla
v době, kdy byly vyšší vrstvy drahé a pomalé. Trofej má nejširší část uprostřed,
u integračních testů, protože ve webové aplikaci vzniká nejvíc chyb mezi částmi; dole
je statická analýza, která zadarmo chytí překlepy a špatné typy. Obě odpovědi ale říkají
totéž pravidlo: testuj na nejnižší úrovni, na které se daná chyba ještě dá zachytit.
Výpočet ceny patří do unit testu, odeslání formuláře na API do integračního a cesta
k zaplacení do jednoho e2e testu, ne do padesáti.

### --see--

nastroje-testovani/proc-testovat#pyramida-a-trofej

## --card-- free

V review vidíš lokátor `page.locator('.btn.btn-primary')`. Co navrhneš a proč?

### --back--

Navrhnu `page.getByRole('button', { name: 'Objednat' })`. Třídy jsou implementační
detail vzhledu: stačí změna designu a test spadne, aniž by se chování změnilo. Role
a přístupný název jsou to, co na stránce vnímá uživatel i čtečka obrazovky, takže test
se rozbije jen tehdy, když tlačítko opravdu zmizí nebo se přejmenuje. Navíc když
lokátor podle role prvek nenajde, je to samo o sobě nález: prvek nemá přístupný název.
Pořadí voleb je `getByRole`, `getByLabel`, `getByText` a teprve jako nouzovka
`getByTestId`.

### --see--

nastroje-testovani/playwright#lokatory-podle-role-a-popisku

## --card-- free

Proč je lepší zachytit síť přes MSW než v testu přepsat `globalThis.fetch`?

### --back--

Náhradní `fetch` váže test na to, **jak** kód síť volá: jakou funkcí, s jakými
parametry, kolikrát. Po přepsání na jinou knihovnu test spadne, i když se chování
nezměnilo. MSW popisuje jen adresu a odpověď, takže kód smí volat síť jakkoli. Přiřazení
do `globalThis.fetch` navíc platí pro celý proces a bez vrácení ovlivní další testy
v souboru. A tytéž handlery použiju i v prohlížeči při vývoji proti API, které ještě
neexistuje. K nastavení patří `server.listen({ onUnhandledRequest: 'error' })`, ať
požadavek bez handleru tiše neodejde na internet.

### --see--

nastroje-testovani/mocky-cas-sit#sit-msw-misto-nahrazeneho-fetch

## --card-- free

Test v Playwrightu spadne s hláškou `strict mode violation: getByRole('link', { name: 'Detail' }) resolved to 12 elements`. Co se stalo a jak to opravíš?

### --back--

Lokátor sedí na dvanáct odkazů, ale akce jako `click` potřebují právě jeden prvek —
tomu se říká [[strict mode lokátoru]]. Jméno se navíc porovnává jako podřetězec bez
ohledu na velikost písmen, takže „Detail" sedí i na „Detail objednávky". Opravím to
zúžením na rodiče, ve kterém prvek hledám:
`page.getByRole('listitem').filter({ hasText: 'Espresso' }).getByRole('link', { name: 'Detail' })`,
nebo přesnou shodou `{ name: 'Detail', exact: true }`. Co neopravím pořadím
(`nth(1)`) — to se rozbije, jakmile někdo změní řazení seznamu.

### --see--

nastroje-testovani/playwright#typicke-chyby-a-pasti

## --card-- free

Kolega opravil nestabilní test tím, že před kontrolu výsledků přidal `await page.waitForTimeout(3000)`. Proč je to dvojí prohra a čím to nahradíš?

### --back--

[[pevné čekání|Pevné čekání]] test zpomalí — tři sekundy ve stovce testů jsou pět minut
navíc — a nestabilitu neodstraní, protože na vytíženém CI přijde odpověď i za 3,1 s.
Čekat se má na stav stránky, ne na čas. Aserce nad lokátorem kontrolu opakuje až do
limitu, takže napíšu `await expect(page.getByRole('listitem')).toHaveCount(3)` nebo
`await expect(page.getByText('Objednávka odeslána')).toBeVisible()`. Pozor na zápis
`expect(await locator.textContent()).toBe(…)` — ten přečte hodnotu jednou a čeká stejně
málo jako pevná pauza.

### --see--

nastroje-testovani/playwright#proc-ne-waitfortimeout

## --card-- free

E2e test spadl na CI, u tebe na počítači prochází. Jak zjistíš, co se stalo?

### --back--

Otevřu [[trace]] z toho běhu. S nastavením `trace: 'on-first-retry'` Playwright při
opakování selhaného testu nahraje snímky stránky před každou akcí i po ní, síťové
požadavky, konzoli a zdroják testu; na CI si ho uložím jako artefakt běhu a otevřu
příkazem `npx playwright show-trace trace.zip`. Projdu test krok po kroku a vidím, jak
stránka vypadala ve chvíli selhání — typicky že přes tlačítko ležela cookie lišta nebo
že seznam ještě nebyl načtený. Hádání z jedné chybové hlášky tím končí.

### --see--

nastroje-testovani/playwright#trace-viewer-co-se-stalo-na-ci

## --card-- free

Máš přepsat funkci, která nemá jediný test. Jak postupuješ, aby ses cestou nedozvěděl, že jsi něco rozbil, až od uživatelů?

### --back--

Nejdřív spustím, co funkce dělá dnes, a její skutečné výstupy zamknu testy — nehodnotím,
jestli je chování správné, jen že je dnešní. Doplním případy na hranicích, protože přesně
tam se při přepisování nejvíc láme. Teprve pak refaktoruji, a to po malých krocích:
jedna změna, spustit testy, zelená. Když některý test zčervená, rozhodnu, jestli jde
o nechtěnou změnu chování (opravím kód), nebo o změnu, kterou chci (upravím test a napíšu
to do popisu pull requestu). Změnu chování a refaktoring nikdy nemíchám do jednoho kroku.

### --see--

nastroje-testovani/workshop-refaktoring/002
