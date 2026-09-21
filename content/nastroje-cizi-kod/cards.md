## --card-- free

Stáhneš si cizí repozitář a máš v něm opravit chybu. Co uděláš jako úplně první, ještě než otevřeš kód?

### --back--

Rozběhnu projekt podle README: `npm ci`, spuštění aplikace a hlavně **`npm test`**.
Testy musí projít na čistě staženém repozitáři. Tím mám referenční zelený stav —
když později něco zčervená, vím, že to způsobila moje změna, a ne rozbité prostředí.
Když testy neprojdou hned, mám první otázku do týmu ještě před začátkem práce.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#1-rozbehni-projekt-nez-prectes-radku-kodu

## --card-- free

Proč `npm ci` a ne `npm install`, když pracuješ v cizím projektu?

### --back--

`npm ci` nainstaluje přesně ty verze, které jsou v `package-lock.json`. `npm install`
může závislosti povýšit a zámkový soubor přepsat — dostaneš jiné prostředí než zbytek
týmu a případné rozbití vidíš jen ty.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#1-rozbehni-projekt-nez-prectes-radku-kodu

## --card-- free

Máš zadání „tlačítko Přidat do košíku nic nedělá". Popiš postup, jak v neznámém repozitáři najdeš odpovídající kód.

### --back--

1. Vyhledám viditelný text v celém projektu (`rg "Přidat do košíku"`, `Ctrl+Shift+F`).
2. Z komponenty skočím na definici obslužné funkce (`Ctrl` + klik, `F12`).
3. U funkce, která mi nedává smysl, se zeptám „kdo to volá" — *Find All References*
   (`Shift+F12`).
4. Ověřím `console.log`em, že jsem opravdu na té cestě, po které kliknutí jde.

Když hledání textu selže, hledám klíč překladu (`cart.addButton`), třídu nebo
`data-testid` odkoukaný z DevTools.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#3-vystopuj-jeden-pozadavek-skrz-kod

## --card-- free

Jaký příkaz použiješ, když chceš vědět, kdy se v projektu poprvé objevila konstanta `MAX_RETRIES`?

### --back--

`git log -S "MAX_RETRIES"` — přepínač `-S` (pickaxe) najde commity, ve kterých se změnil
počet výskytů daného textu, tedy kde se přidal nebo zmizel. Doplňkové nástroje:
`git blame soubor` (kdo změnil který řádek naposledy) a `git log -p soubor` (historie
jednoho souboru i se změnami).

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#4-zeptej-se-historie

## --card-- free

Co je charakterizační test a kdy ho napíšeš?

### --back--

Test, který popisuje, **jak se kód chová dnes** — ne jak by se chovat měl. Píšeš ho
před zásahem do cizí funkce, která testy nemá: zafixuje současné chování, takže po
změně přesně vidíš, co se změnilo. U každého zčervenalého testu pak rozhodneš: záměrná
změna (uprav test a napiš to do popisu PR), nebo regrese (oprav kód).

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#6-bezpecna-zmena-charakterizacni-test

## --card-- free

V cizím projektu najdeš podmínku, která podle tebe nedává smysl. Co uděláš?

### --back--

Nesmažu ji. Najdu přes `git blame` commit, který ji přidal, a přečtu si jeho zprávu
a navázané issue. Divný kód má většinou důvod, který z kódu už není vidět — třeba
zákazníky převedené ze staršího systému. Buď najdu důvod, nebo najdu jistotu, že žádný
není.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#4-zeptej-se-historie

## --card-- free

Kde v projektu hledáš konvence, kterých se máš držet?

### --back--

Na dvou místech. **Psané:** `CONTRIBUTING.md`, `README.md`, konfigurace lintru
a formatteru. **Nepsané:** existující kód ze stejné vrstvy — jak se hlásí chyby, odkud
se čtou data, kde jsou typy, jak se jmenují testy. Když se psané pravidlo a kód
rozcházejí, zeptám se; nevybírám si sám.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#5-konvence-projektu-jsou-soucast-zadani

## --card-- output

Kolega napsal tuhle podmínku a řádek se vypisuje vždycky. Co vypíše kód?

```js
const price = { base: 32000, discount: 0, discountReason: null };
if (price.discountReason = 'promo') {
  console.log('sleva z kódu');
}
console.log(price.discountReason);
```

### --expected--

sleva z kódu
promo

### --why--

`=` je přiřazení, ne porovnání. Výrazem podmínky je přiřazená hodnota — neprázdný
řetězec je pravdivý, takže větev proběhne vždycky. Navíc se tím přepsal vstupní objekt.
Porovnání se píše `===`.

### --see--

nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum

## --card-- free

Než začneš opravovat chybu z issue, co musí být hotové?

### --back--

Musím chybu **reprodukovat** — zopakovat ji u sebe podle kroků z issue. Bez toho nemám
měřítko a neumím rozlišit „opraveno" od „teď to zrovna nespadlo". Hned potom napíšu
test, který kvůli chybě padá; ten je zároveň důkazem, měřítkem i pojistkou proti
návratu.

### --see--

nastroje-cizi-kod/od-issue-k-pr#1-reprodukuj-nez-zacnes-opravovat

## --card-- free

Proč commitovat test **před** opravou, a ne spolu s ní?

### --back--

Commit s padajícím testem je důkaz, že chyba existuje a že ji test opravdu zachytí.
Reviewer si ho může vytáhnout a spustit. Test přidaný zároveň s opravou nejde ověřit —
mohl být napsaný tak, aby prošel, aniž by cokoli hlídal. Pořadí commitů je součást
argumentace: nejdřív problém, pak řešení.

### --see--

nastroje-cizi-kod/od-issue-k-pr#2-zajisti-si-to-testem

## --card-- free

Co musí obsahovat popis pull requestu?

### --back--

**Co** — jedna věta o problému a jedna o řešení, včetně změn nad rámec zadání.
**Proč** — odkaz na issue klíčovým slovem, které ho zavře (`Fixes #482`), a k čemu to je.
**Jak otestovat** — konkrétní kroky pro reviewera: příkaz, požadavek, očekávaná odpověď.
A u změn v UI snímky obrazovky.

### --see--

nastroje-cizi-kod/od-issue-k-pr#5-otevri-pull-request-ze-ktereho-je-videt-proc

## --card-- free

Proč je špatný nápad „při té příležitosti" přeformátovat celý soubor nebo přejmenovat proměnné?

### --back--

Diff se nafoukne o stovky mechanických řádků a skutečná změna se v nich ztratí.
Reviewer má omezenou pozornost — čím větší diff, tím menší šance, že si všimne
chybějícího okrajového případu. Úklid patří do samostatného pull requestu.

### --see--

nastroje-cizi-kod/od-issue-k-pr#3-zaloz-vetev-a-oprav-to-nejmensi-moznou-zmenou

## --card-- free

Co při code review kontroluješ ty a co má chytit stroj?

### --back--

**Člověk:** správnost a okrajové případy, architektura, čitelnost a názvy, pokrytí
testy, bezpečnost (vstup v dotazu do databáze, v HTML, tajné klíče v kódu).
**Stroj:** formátování, mezery, uvozovky, nepoužité proměnné, pořadí importů — od toho
je linter a formatter. Když se v review řeší formátování, chybí řádek v konfiguraci CI.

### --see--

nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum

## --card-- free

Jak napíšeš v review komentář, který se dá přijmout bez hádky?

### --back--

Konkrétně, s důvodem a otázkou místo příkazu. Místo „Tohle je pomalé" napíšu „Při
tisících položkách je `find` v cyklu kvadratický — nehodila by se `Map` postavená
předem?". Váhu komentáře označím prefixem: `nit:` (drobnost), `otázka:`, `návrh:`,
bez prefixu = tohle je podle mě potřeba opravit. A píšu i to, co je dobře.

### --see--

nastroje-cizi-kod/code-review#2-jak-napsat-komentar-ktery-se-da-prijmout

## --card-- free

Co znamená `nit:` na začátku komentáře v review?

### --back--

Od slova *nitpick*, hnidopich. Označuje drobnost — překlep v komentáři, lepší název —
která nemá blokovat začlenění. Autor ví, že si může vybrat, jestli to opraví hned, nebo
vůbec, a nevzniká zbytečné další kolo.

### --see--

nastroje-cizi-kod/code-review#2-jak-napsat-komentar-ktery-se-da-prijmout

## --card-- free

Proč velké pull requesty dostávají horší review než malé, i když obsahují stejný kód?

### --back--

Review limituje pozornost reviewera, ne velikost diffu. Do ~300 řádků se čte řádek po
řádku; nad 800 řádků reviewer přejde na prohlížení a napíše „LGTM", aniž by změnu
opravdu přečetl. Proto se práce dělí — nejdřív pull request s přípravou (refaktor bez
změny chování), pak pull request s novou funkcí.

### --see--

nastroje-cizi-kod/code-review#4-velikost-pull-requestu-rozhoduje-o-kvalite-review

## --card-- free

Dostal jsi na svůj pull request dvacet komentářů. Jak zareaguješ?

### --back--

Nejsi tvůj kód — komentáře míří na řádky, ne na tebe. Na každý odpovím, i kdyby jen
„opraveno" nebo „tohle bych nechal, tady je proč"; nezodpovězený komentář vypadá jako
přehlédnutý. Když nesouhlasím, ptám se na důvod místo obhajování. A když se po druhém
kole neshodneme, zavolám si — pět minut hovoru je rychlejší než deset komentářů.

### --see--

nastroje-cizi-kod/code-review#3-jak-review-prijimat

## --card-- free

Kolegyně tě požádá o odhad na úkol, který jsi nikdy nedělal. Co odpovíš?

### --back--

Rozpadnu úkol na kroky — při rozpadu mi dojde, na co bych zapomněl. Pak odhadnu
**rozsahem s pojmenovanou neznámou**: „den až tři dny, podle toho, jestli má to API
starý formát ID". Počítám i s režií: reálně programuju čtyři až pět hodin denně, ne
osm. Když někdo chce kratší odhad, neškrtám čas — ptám se, co vyhodíme z rozsahu.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#2-odhaduj-v-rozsahu-a-s-duvodem

## --card-- free

Co je timebox a proč chrání oběma směry?

### --back--

Předem daný čas (30–60 minut), po kterém se přestanu trápit sám a jdu se zeptat.
Chrání před tím, abych propálil celý den na problému, který kolega zná zpaměti —
i před tím, abych se ptal po pěti minutách a přenášel svoji práci na jiné. Navíc mi
těch třicet minut vlastního hledání dá materiál, se kterým je otázka odpověditelná
během minuty.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#3-timebox-kdy-prestat-bojovat-sam

## --card-- free

Zasekl ses a jdeš za zkušenějším kolegou. Co mu řekneš?

### --back--

Čtyři věci: **cíl** (čeho chci dosáhnout), **co jsem zkusil**, **co se stalo** (přesná
chybová hláška) a **moje domněnka**. Ne „ono to nefunguje". Zhruba třetina takových
zpráv se vyřeší sama ve chvíli, kdy je píšu — to je *rubber duck debugging*.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#3-timebox-kdy-prestat-bojovat-sam

## --card-- free

Proč se v chatu neposílá samotné „Ahoj" a nečeká na odpověď?

### --back--

Každá výměna v asynchronní komunikaci stojí minuty nebo hodiny čekání. Druhý člověk
musí odpovědět dřív, než se vůbec dozví, co potřebuju. Celý kontext patří do **první**
zprávy: co potřebuju, proč, co jsem zkusil, co je deadline.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#4-asynchronni-komunikace-cely-kontext-v-prvni-zprave

## --card-- free

Co je Definition of Done a proč se domlouvá předem?

### --back--

Seznam podmínek, které musí splnit každý úkol: review, zelené CI, nasazení na testovací
prostředí, zdokumentované změny. Bez ní se „hotovo" rozejde — mně funguje kód lokálně,
testerovi chybí data, produkťákovi texty. Zeptat se na začátku stojí minutu, zjistit to
na konci stojí den.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#5-definition-of-done-dohodni-si-co-znamena-hotovo

## --card-- code js

V rozpisu ceny se má řádek se slevou objevit jen tehdy, když sleva opravdu je — a její
částka má být záporná, ať součet sedí na celkovou cenu. Doplň `priceLines` tak, aby pro
`discountReason` `'member'` přidala řádek `Členská sleva`, pro `'promo'` řádek
`Sleva z kódu`, a pro `null` žádný.

### --seed--

```js
function priceLines(price) {
  const lines = [{ label: 'Základní cena', amount: price.base }];

  lines.push({ label: 'Celkem', amount: price.total });
  return lines;
}
```

### --test--

```js
assert.deepEqual(
  priceLines({ base: 32000, discount: 0, total: 32000, discountReason: null }).map((l) => l.label),
  ['Základní cena', 'Celkem'],
  'Bez slevy mají být jen dva řádky',
);
assert.deepEqual(
  priceLines({ base: 32000, discount: 3200, total: 28800, discountReason: 'member' })[1],
  { label: 'Členská sleva', amount: -3200 },
  "discountReason 'member' má přidat řádek Členská sleva se zápornou částkou",
);
assert.deepEqual(
  priceLines({ base: 48000, discount: 9600, total: 38400, discountReason: 'promo' })[1],
  { label: 'Sleva z kódu', amount: -9600 },
  "discountReason 'promo' má přidat řádek Sleva z kódu se zápornou částkou",
);
const price = { base: 48000, discount: 9600, total: 38400, discountReason: 'promo' };
priceLines(price);
assert.equal(price.discountReason, 'promo', 'priceLines nesmí měnit objekt, který dostane');
```

### --solution--

```js
function priceLines(price) {
  const lines = [{ label: 'Základní cena', amount: price.base }];
  if (price.discountReason === 'member') {
    lines.push({ label: 'Členská sleva', amount: -price.discount });
  } else if (price.discountReason === 'promo') {
    lines.push({ label: 'Sleva z kódu', amount: -price.discount });
  }
  lines.push({ label: 'Celkem', amount: price.total });
  return lines;
}
```

### --see--

nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum
