# Co testovat a proč

:::check pretest
E-shop má pravidlo „doprava zdarma od 1 500 Kč". Kolega napsal `total > 1500 ? 0 : 89`. Na jaké částce v Kč by ses zeptal jako na první, abys chybu našel?

### --expected--
1500

### --accept--
1 500
1500 Kč

### --why--
Chyby se schovávají na hranici podmínky. Pro 1 499 a 1 501 Kč funkce vrátí správně,
jen přesně pro 1 500 Kč pošle 89 místo 0.
:::

Upravíš funkci, která formátuje cenu, protože v košíku chyběla mezera mezi tisíci.
V košíku to sedí, jenže stejnou funkci používá i e-mail s potvrzením objednávky
a ten teď ukazuje `1 290 KčKč`. Nikdo to nezkusil, protože nikoho nenapadlo, že
e-mail na funkci z košíku závisí. Přišel na to až zákazník.

Ruční proklikání nestačí, protože po každé změně bys musel znovu vyzkoušet
všechno. Test to udělá za tebe za pár milisekund, pokaždé stejně.

> [!REMEMBER]
> **Test je kód, který zavolá tvůj kód a ohlásí, když výsledek přestane odpovídat tomu, co jsi slíbil.** Nechrání tě před chybami, které máš teď, ale před tím, abys je potichu zavlekl znovu.

## Test je kód, který volá tvůj kód

Test nepotřebuje žádnou magii. Je to funkce, která připraví vstup, zavolá testovaný
kód a porovná výsledek s očekáváním. Když se liší, vyhodí chybu. Knihovny na
testy k tomu přidávají jen pohodlí: hezký výpis, spuštění všech souborů najednou
a jasnou hlášku, co se lišilo.

Tady je celý „testovací nástroj" v deseti řádcích. Běží v prohlížeči, žádnou
knihovnu nepotřebuje:

:::live js
```js
function shippingFee(total) {
  return total > 1500 ? 0 : 89;
}

function check(name, actual, expected) {
  const result = actual === expected ? '✔' : '✖';
  console.log(`${result} ${name}: čekám ${expected}, dostal jsem ${actual}`);
}

check('malý nákup platí dopravu', shippingFee(400), 89);
check('velký nákup má dopravu zdarma', shippingFee(2300), 0);
```
:::

Zkus přidat třetí řádek `check('přesně 1 500 Kč má dopravu zdarma', shippingFee(1500), 0)`
a sleduj, co se vypíše. Pak oprav porovnání ve funkci tak, aby prošly všechny tři.

:::check
Co přesně musí test udělat, aby měl smysl? Vyber nejlepší popis.

### --answer--
Zavolat funkci a ověřit, že nespadla.

#### --why--
Myslíš si, že stačí, když kód doběhne? Funkce, která vrátí špatnou cenu, nespadne,
a test by ji pustil dál.

### --answer--
Vypsat výsledek do konzole, ať ho člověk zkontroluje.

#### --why--
Myslíš si, že výpis je test? Výpis musí někdo číst a porovnávat v hlavě. Test
porovná sám a ozve se jen tehdy, když se výsledek liší.

### --correct--
Zavolat funkci s daným vstupem a porovnat výsledek s očekávanou hodnotou.

#### --why--
Očekávání je napsané v testu, porovnání dělá počítač. Proto jde test pouštět po
každé změně bez přemýšlení.
:::

## První test v node:test

Node má nástroj na testy vestavěný: modul `node:test` s funkcí `test` a modul
`node:assert/strict` s porovnáními. Nic se neinstaluje. Testy se píšou do souborů,
které končí `.test.js`, vedle kódu, který testují:

```js
// price.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shippingFee } from './price.js';

test('doprava je zdarma od 1 500 Kč', () => {
  assert.equal(shippingFee(1500), 0);
});
```

Příkaz `node --test` najde všechny soubory `*.test.js` ve složce a spustí je.
Když [[aserce]] (*assertion*) nesedí, vyhodí chybu a test skončí jako ✖:

```text
$ node --test
✖ doprava je zdarma od 1 500 Kč (0.4ms)
ℹ tests 1
ℹ pass 0
ℹ fail 1

test at price.test.js:6:1
✖ doprava je zdarma od 1 500 Kč (0.4ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  89 !== 0
```

Hlášku čti odspodu: `89 !== 0` znamená „funkce vrátila 89, test čekal 0". Nad tím
je jméno souboru a řádek testu. Proto dávej testům jména, která popisují chování
(„doprava je zdarma od 1 500 Kč"), ne „test 1" — ve výpisu hned víš, co se rozbilo.

Nejčastější aserce:

| aserce | kdy ji použiješ |
|---|---|
| `assert.equal(actual, expected)` | čísla, texty, `true`/`false` — porovnává přes `===` |
| `assert.deepEqual(actual, expected)` | objekty a pole — porovná obsah, ne odkaz |
| `assert.ok(value)` | stačí, že je hodnota pravdivá |
| `assert.match(text, /regex/)` | text obsahuje vzor |

:::check
Test `assert.equal(getCart(), { items: [] })` selže, i když `getCart()` vrací přesně `{ items: [] }`. Kterou aserci použiješ místo `equal`?

### --expected--
assert.deepEqual

### --accept--
deepEqual
assert.deepStrictEqual
deepStrictEqual

### --why--
`equal` porovnává přes `===`, a dva různé objekty nejsou `===`, i když mají stejný
obsah. `deepEqual` projde obsah vlastnost po vlastnosti.
:::

## Arrange, act, assert

Dobrý test se čte jako tři odstavce. Říká se tomu vzor [[AAA]]:

1. **Arrange (připrav)** — data a okolí, které test potřebuje.
2. **Act (proveď)** — jedno volání testovaného kódu.
3. **Assert (ověř)** — porovnání výsledku s očekáváním.

```js
test('přidání stejného zboží zvýší počet kusů', () => {
  // připrav
  const cart = [{ sku: 'KAVA-250', qty: 1 }];

  // proveď
  const updated = addToCart(cart, 'KAVA-250');

  // ověř
  assert.deepEqual(updated, [{ sku: 'KAVA-250', qty: 2 }]);
});
```

Když se ti v jednom testu střídá „proveď, ověř, proveď, ověř", testuješ víc věcí
najednou. Až takový test selže, nevíš, která z nich se rozbila. Rozděl ho.

:::check
Test přidá zboží do košíku, ověří počet, pak zboží odebere a ověří prázdný košík. Co s ním?

### --answer--
Nic, je to úsporné — jeden test pokryje dvě funkce.

#### --why--
Myslíš si, že méně testů je lepší? Až selže první ověření, druhé se vůbec nespustí
a o stavu odebírání se nic nedozvíš.

### --correct--
Rozdělit ho na dva testy, každý s jedním voláním a jedním ověřením.

#### --why--
Každý test pak hlídá jedno chování a jeho jméno řekne, co se rozbilo.

### --answer--
Přidat mezi kroky `console.log`, ať je vidět, kde spadl.

#### --why--
Myslíš si, že problém je ve výpisu? Problém je, že test míchá dvě chování. Výpis
by jen přidal šum.
:::

## Okrajové případy

Test s jednou „normální" hodnotou chytí málokterou chybu. Chyby bydlí na krajích:
na hranici podmínky, u nuly, u prázdného textu nebo pole, u jednoho prvku, u
diakritiky a u neviditelných znaků. Právě [[okrajové případy]] vyber jako první.

Tahle past potkala už hodně lidí. `toLocaleString('cs-CZ')` odděluje tisíce
**pevnou mezerou** (`\u00A0`), ne obyčejnou. Na obrazovce vypadají stejně:

:::live js predict
```js
function formatPrice(amount) {
  return `${amount.toLocaleString('cs-CZ')} Kč`;
}

console.log(formatPrice(990) === '990 Kč');
console.log(formatPrice(1290) === '1 290 Kč');
```
--question-- Co vypíšou dva řádky? Napiš oba výstupy pod sebe.
--expected--
```text
true
false
```
--why-- U 990 žádný oddělovač tisíců není, takže texty jsou shodné. U 1 290 vloží `toLocaleString` mezi `1` a `290` pevnou mezeru, kdežto v očekávaném textu je obyčejná. Test na „normální" malou cenu by tenhle rozdíl nikdy neukázal — proto do testu patří i částka s tisíci.
:::

Zkus v druhém řádku nahradit mezeru v očekávaném textu za `\u00A0` a sleduj, jak
se výsledek změní.

:::check
Funkce `initials(name)` vrací iniciály jména („Jana Nováková" → „JN"). Který vstup vybereš jako okrajový případ?

### --answer--
„Petr Svoboda"

#### --why--
Myslíš si, že jiné jméno je jiný případ? Je stejného tvaru jako první — dvě slova,
bez diakritiky na začátku. Nic nového neprověří.

### --correct--
„  Šárka   Dvořáková " (diakritika na začátku a víc mezer)

#### --why--
Prověří tři hrany najednou: mezery navíc, víc mezer mezi slovy a písmeno s háčkem.

### --answer--
„JANA NOVÁKOVÁ"

#### --why--
Myslíš si, že velká písmena něco změní? Iniciály jsou velká písmena i tak.
Skutečná hrana je v tom, jak funkce najde začátky slov.
:::

## Unit, integrační a end-to-end testy

Testy se liší tím, **kolik skutečného světa** zapojí:

| druh | co zapojí | rychlost | co chytí |
|---|---|---|---|
| [[unit test]] | jednu funkci nebo modul, bez sítě a databáze | milisekundy | chybu ve výpočtu, okrajové případy |
| [[integrační test]] | víc částí dohromady: API s databází, komponentu s daty | desítky ms až sekundy | špatně propojené části, špatný formát dat mezi nimi |
| [[end-to-end test]] (e2e) | celou aplikaci ve skutečném prohlížeči | sekundy | nefunkční tlačítko, rozbitou stránku, chybu v nasazení |

Čím víc světa test zapojí, tím víc ti o aplikaci řekne — a tím je pomalejší,
náchylnější k náhodnému selhání a hůř z něj poznáš, kde přesně je chyba.

Příklad z košíku:

- **unit:** `shippingFee(1500)` vrátí `0`.
- **integrační:** `POST /api/orders` s košíkem za 1 500 Kč uloží objednávku s dopravou 0 Kč.
- **e2e:** zákazník v prohlížeči přidá zboží, v souhrnu košíku vidí „Doprava zdarma" a objednávku odešle.

:::check
Po nasazení nefunguje tlačítko „Odeslat objednávku", protože skript se na produkci nenačte. Všechny funkce v košíku přitom počítají správně. Který druh testu to mohl zachytit?

### --expected-- ignore-case
end-to-end

### --accept--
e2e
end to end
end-to-end test
e2e test

### --why--
Unit testy volají funkce přímo, načítání skriptu ve stránce neprověří. Chybu
v tom, jak se aplikace poskládá a načte, uvidí jen test, který otevře skutečný
prohlížeč. K Playwrightu se dostaneš v lekci
[End-to-end v Playwrightu](see:nastroje-testovani/playwright).
:::

## Pyramida a trofej

Kolik jakých testů psát? Dvě známé odpovědi:

- **[[testovací pyramida]]** — hodně unit testů dole, méně integračních uprostřed,
  pár e2e nahoře. Vznikla v době, kdy byly integrační a e2e testy drahé a pomalé.
- **Testovací trofej** (*testing trophy*, Kent C. Dodds) — nejširší část tvoří
  integrační testy, protože ve webové aplikaci se nejvíc chyb rodí mezi částmi.
  Dole je „statická analýza" (TypeScript, ESLint), která zadarmo chytí překlepy
  a špatné typy.

Nejde o to, který obrázek je správný. Obě říkají totéž: **testuj na nejnižší
úrovni, na které se daná chyba ještě dá zachytit.** Výpočet ceny patří do unit
testu. Že formulář pošle data na API, patří do integračního. Že se zákazník
proklikne k zaplacení, patří do jednoho e2e testu, ne do padesáti.

> [!NOTE]
> Statickou analýzu už znáš: `npx tsc --noEmit` ze sekce
> [TypeScript](see:nastroje-typescript/proc-typescript) je nejlevnější test ze všech. Chybu
> najde, ještě než cokoli spustíš.

:::check
Chceš ověřit, že `formatDate` zobrazí 1. ledna jako „1. 1. 2026" a 31. prosince jako „31. 12. 2026". Na jaké úrovni to otestuješ?

### --answer--
E2e testem: otevřu stránku s objednávkou a přečtu datum.

#### --why--
Myslíš si, že skutečnější je vždy lepší? Kvůli dvěma datům bys spouštěl prohlížeč,
server i databázi. Test by byl pomalý a když selže, nevíš, jestli za to může
formát, nebo načítání stránky.

### --correct--
Unit testem, který zavolá `formatDate` s oběma daty.

#### --why--
Chyba se dá zachytit už na úrovni jedné funkce, tak ji tam chytej — test běží
milisekundy a selže přesně u formátu data.

### --answer--
Integračním testem API, které vrací objednávky.

#### --why--
Myslíš si, že datum musí přijít ze serveru? Formátování je čistá funkce. API test
by kontroloval hlavně odpovědi serveru a formát data by v něm zapadl.
:::

## Testuj chování, ne implementaci

Test má hlídat, **co** kód slibuje navenek, ne **jak** to uvnitř dělá. Porovnej
dva testy téže funkce `sortByPrice`:

```js
// A: hlídá výsledek
test('seřadí produkty od nejlevnějšího', () => {
  const products = [{ name: 'Mlýnek', price: 890 }, { name: 'Káva', price: 249 }];
  assert.deepEqual(sortByPrice(products).map((p) => p.name), ['Káva', 'Mlýnek']);
});

// B: hlídá, jak se to dělá
test('sortByPrice volá sort s porovnávací funkcí', () => {
  const source = sortByPrice.toString();
  assert.match(source, /\.sort\(\(a, b\) => a\.price - b\.price\)/);
});
```

Test B je [[křehký test]] (*brittle test*). Selže, když funkci přepíšeš na
`toSorted` nebo přejmenuješ parametry — přestože řadí pořád správně. A naopak
projde, i když funkce řadí správně jen proto, že volá `sort`, ale výsledek pak
omylem obrátí. Takový test tě zdržuje při každém refaktoringu a chybu nechytí.

Znaky křehkého testu:

- selže po změně, která chování nezměnila (přejmenování, přesun kódu),
- kontroluje, jaká vnitřní funkce se zavolala, místo toho, co vyšlo,
- kopíruje výpočet z implementace (`assert.equal(price(3), 3 * 249 * 1.21)`) —
  když je vzorec špatně, je špatně v obou,
- porovnává celý velký výstup (celé HTML, celý objekt), i když tě zajímá jedna věc.

:::explain
Vysvětli, proč je test B křehký a proč test A dává větší jistotu, i když B vypadá přesněji.

## --model--
Test B kontroluje zápis kódu, ne výsledek. Selže při každém přepsání, které chování
nezmění, takže tě brzdí při refaktoringu. Zároveň nepozná, když funkce vrátí špatné
pořadí, protože se na výsledek vůbec nedívá. Test A volá funkci jako kdokoli jiný
v aplikaci a ověří, co z ní vyjde — projde při každé správné implementaci a selže
při každé špatné.

## --checklist--
- Test B kontroluje, jak je kód napsaný, ne co vrací.
- Křehký test selže i po změně, která chování nezměnila.
- Křehký test může projít, i když je výsledek špatně.
- Test A ověřuje výsledek tak, jak ho vidí zbytek aplikace.
:::

:::check
Refaktoruješ funkci a nezměníš, co vrací. Selžou ti tři testy. Co to nejspíš znamená?

### --answer--
Refaktoring je špatně, vrať ho.

#### --why--
Myslíš si, že červený test vždycky znamená chybu v kódu? Tady výsledek zůstal stejný,
takže chyba je v tom, co testy hlídají.

### --correct--
Testy jsou křehké: kontrolují vnitřek funkce, ne její chování.

#### --why--
Test, který selže po změně bez změny chování, hlídá implementaci. Přepiš ho tak,
aby ověřoval výsledek.

### --answer--
Testů je moc, tři z nich smaž.

#### --why--
Myslíš si, že problém je v počtu? Počet nevadí, vadí, na co se testy dívají. Když
je smažeš, přijdeš i o ochranu, kterou dávaly.
:::

## Očekávaná chyba: throws a rejects

Někdy je správné chování vyhodit chybu. Na to má `assert` dvě aserce:

```js
test('záporná cena je chyba', () => {
  assert.throws(() => formatPrice(-5), RangeError);
});

test('neexistující objednávka se nenačte', async () => {
  await assert.rejects(loadOrder(999), { message: /nenalezena/ });
});
```

- `assert.throws` dostane **funkci**, kterou sám zavolá. Kdybys napsal
  `assert.throws(formatPrice(-5))`, zavolal bys ji ty — chyba vyletí dřív, než se
  `assert.throws` vůbec spustí, a test spadne na chybě, kterou chtěl hlídat.
- `assert.rejects` dostane Promise (nebo async funkci) a sám vrací Promise. Proto
  před ním **musí být `await`** a test musí být `async`.

> [!PITFALL]
> Bez `await` u `assert.rejects` doběhne test dřív, než se Promise vyhodnotí.
> Výpis ukáže u testu ✔ a pod ním
> `Error: Test "…" generated asynchronous activity after the test ended`.
> Když je kód v pořádku, neukáže nic — a test tak nic nehlídá. Oprava: `await assert.rejects(…)`.

:::check
Co je špatně na řádku `assert.throws(parseTime('25:99'), RangeError);`?

### --answer--
`RangeError` se píše v uvozovkách.

#### --why--
Myslíš si, že druhý argument je text? Je to třída chyby, kterou `assert.throws`
porovná s vyhozenou chybou. Uvozovky tam nepatří.

### --correct--
`parseTime` se zavolá dřív, než ho `assert.throws` dostane. Má tam být funkce `() => parseTime('25:99')`.

#### --why--
Argumenty se vyhodnotí před voláním. Chyba vyletí ještě mimo `assert.throws` a test
spadne místo toho, aby prošel.

### --answer--
Chybí `await`.

#### --why--
Myslíš si, že každá aserce na chybu potřebuje `await`? Jen `rejects`, protože
čeká na Promise. `throws` hlídá synchronní chybu.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Test bez aserce vždycky projde.** `test('spočítá dopravu', () => { shippingFee(1500); })`
> je ✔, i když funkce vrátí nesmysl. Příznak: test prošel hned napoprvé a nikdy neselhal.
> Oprava: každý test končí asercí — a jednou ho schválně rozbij, ať vidíš ✖.

> [!PITFALL]
> **Očekávaná hodnota spočítaná stejně jako v kódu.** `assert.equal(withVat(100), 100 * 1.21)`
> projde i tehdy, když má být sazba 12 %. Oprava: očekávanou hodnotu napiš jako číslo,
> které sis spočítal jinak (`121`).

> [!PITFALL]
> **Testy, které na sobě závisí.** Druhý test počítá s tím, že první přidal zboží do
> sdíleného košíku. Samotný projde, v jiném pořadí selže. Příznak: `node --test` projde,
> ale test spuštěný samostatně ne. Oprava: každý test si data připraví sám.

> [!PITFALL]
> **Test, který nikdy neselhal.** Nevíš, jestli něco hlídá. Než test uložíš, rozbij
> na chvíli kód (změň `>=` na `>`) a přesvědč se, že ✖ opravdu přijde.

:::check
Napsal jsi test, spustil ho a hned prošel. Co uděláš, než mu začneš věřit?

### --expected-- ignore-case
rozbiju kód

### --accept--
rozbít kód
schválně rozbít kód
schválně rozbiju kód
nechám ho selhat
rozbiju kód a uvidím, že selže
změním kód, aby test selhal

### --why--
Test, který jsi nikdy neviděl selhat, může procházet z úplně jiného důvodu (chybí
aserce, chybí `await`, testuje jinou funkci). Krátké rozbití kódu ukáže, že test
opravdu hlídá to, co si myslíš.
:::

## Kde to najdeš v MDN

MDN testovací nástroje nepopisuje, jsou to nástroje Node a knihoven. Oficiální
dokumentace v angličtině:

- [Node.js: Test runner](https://nodejs.org/api/test.html) — `test`, `describe`,
  `beforeEach`, přepínače `node --test`.
- [Node.js: Assert](https://nodejs.org/api/assert.html) — všechny aserce včetně
  `throws` a `rejects` a co přesně porovnávají.
- [MDN: `Number.prototype.toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString) —
  proč formátované číslo obsahuje pevnou mezeru.

Ve workshopu [Testy pro Běžecký deník](see:nastroje-testovani/workshop-unit-testy/001)
si tohle všechno napíšeš sám a tvoje testy budou muset chytit podstrčené chyby.

# --questions--

## --question--

Kolegyně tvrdí: „Máme 400 e2e testů, unit testy nepotřebujeme." Jaký problém jí nejspíš přijde jako první?

### --answer--
E2e testy nenajdou chyby v prohlížeči.

#### --why--
Myslíš si, že e2e testy prohlížeč obcházejí? Právě v něm běží, chyby v prohlížeči
najdou nejlíp.

### --correct--
Sada běží dlouho, občas selže náhodou a z červeného testu se špatně pozná, kde chyba je.

#### --why--
Každý e2e test spouští celou aplikaci. Čtyři sta takových testů trvá minuty, a když
jeden selže, hledáš chybu napříč serverem, databází i stránkou.

### --answer--
E2e testy nejdou napsat pro formuláře.

#### --why--
Myslíš si, že e2e testy neumí vyplnit pole? Umí — vyplnit formulář a odeslat ho je
jejich běžná práce.

### --see--
nastroje-testovani/proc-testovat#pyramida-a-trofej

## --question--

Funkce `vatAmount(price)` vrací DPH 21 % zaokrouhlené na koruny. Napiš očekávanou hodnotu pro `vatAmount(250)`, kterou bys dal do testu (jen číslo).

### --expected--
53

### --accept--
53 Kč

### --why--
250 × 0,21 = 52,5 a to se zaokrouhlí na 53. Právě půlka je okrajový případ
zaokrouhlení. Do testu napiš hotové číslo, ne `Math.round(250 * 0.21)` — to by
jen zopakovalo výpočet z implementace.

### --see--
nastroje-testovani/proc-testovat#typicke-chyby-a-pasti

## --question--

Proč test `assert.match(renderCard.toString(), /innerHTML/)` nepatří mezi dobré testy? Odpověz jedním slovem, jak se takovému testu říká.

### --expected-- ignore-case
křehký

### --accept--
křehký test
brittle
krehky

### --why--
Kontroluje, jak je funkce napsaná, ne co vykreslí. Selže po přepsání na
`textContent` a zároveň projde, i když karta vykreslí nesmysl.

### --see--
nastroje-testovani/proc-testovat#testuj-chovani-ne-implementaci
