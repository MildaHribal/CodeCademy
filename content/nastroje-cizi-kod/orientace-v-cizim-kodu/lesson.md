# Orientace v cizím kódu

:::check pretest
Stáhneš si repozitář, který vidíš poprvé, a máš v něm opravit jednu chybu. Co uděláš jako úplně první?

### --expected--
Spustím projekt a testy podle README.
:::

Na zelené louce začneš možná dvakrát za kariéru. Zbytek času otevíráš repozitář, který
psal někdo jiný, často několik lidí a několik let. Dobrá zpráva: **nemusíš mu rozumět
celý.** Potřebuješ jen bezpečně dojít k té části, která se týká tvého úkolu.

> [!REMEMBER]
> **Cizí kód se nečte, cizí kód se vyšetřuje.** Postupuješ od spuštěné aplikace ke
> konkrétnímu řádku, ne od prvního souboru abecedně dolů.

Celý postup má čtyři kroky a vždycky stejné pořadí:

1. **Rozběhnout** — ověřit, že projekt funguje, ještě než do něj sáhneš.
2. **Zmapovat** — zjistit, kde je co, v hrubých obrysech.
3. **Vystopovat** — projít jeden konkrétní požadavek od kliknutí až k datům.
4. **Zeptat se historie** — zjistit z Gitu, proč je kód takový, jaký je.

## 1. Rozběhni projekt, než přečteš řádku kódu

Cíl kroku: mít jistotu, že **výchozí stav je zelený**. Bez toho nikdy nepoznáš, jestli
chybu, na kterou narazíš, způsobuješ ty, nebo tu byla dřív.

1. **Přečti README.** Co projekt dělá, co potřebuje k běhu, jak se spouští.
2. **Otevři `package.json`, sekci `scripts`.** Tady je pravda o tom, jak se projekt
   opravdu spouští — README bývá o rok pozadu.
3. **Nainstaluj závislosti:** `npm ci` (přesně podle `package-lock.json`), ne `npm install`.
4. **Spusť aplikaci:** `npm run dev`. Když to padá, hledej `.env.example` — nejčastější
   příčinou je chybějící [[proměnná prostředí]].
5. **Spusť testy:** `npm test`. Musí projít. Když neprojdou na čistě staženém
   repozitáři, máš první otázku do týmu — ještě předtím, než začneš pracovat.

> [!PITFALL]
> `npm install` ti může tiše povýšit závislosti a rozbít build způsobem, který nikdo
> jiný v týmu nevidí. Na cizím projektu vždycky `npm ci`.

:::check
Proč se vyplatí spustit testovací sadu cizího projektu dřív, než v něm cokoli změníš?

### --answer--
Aby bylo vidět, kolik testů projekt má.

#### --why--
Počet testů je vedlejší. Jde o něco, co ti pomůže později při ladění.

### --correct--
Abych měl jistotu, že případné budoucí červené testy způsobila až moje změna.

#### --why--
Zelený výchozí stav je tvůj referenční bod. Bez něj ladíš dvě věci najednou — svou změnu i cizí rozbité prostředí.

### --see--
nastroje-testovani/proc-testovat
:::

## 2. Nakresli si hrubou mapu

Cíl kroku: umět do minuty odpovědět na otázku „kde by to asi tak mohlo být".
Hledáš pět věcí:

| Co hledáš | Kde to obvykle je |
|---|---|
| [[vstupní bod]] | `src/main.js`, `src/main.tsx`, `server.js`, `app/page.tsx` |
| směrování | `routes/`, `pages/`, `app/`, nebo jeden soubor s `app.get(...)` |
| doménová logika | `services/`, `lib/`, `domain/`, `core/` |
| přístup k datům | `db/`, `models/`, `repositories/`, `prisma/schema.prisma` |
| testy | vedle zdrojů (`*.test.js`) nebo v `tests/`, `__tests__/` |

Rychlý trik: **spusť `git log --oneline -20` a podívej se, které soubory se mění nejčastěji.**
Tam je živá část projektu. Složka, do které nikdo nesáhl tři roky, tě zpravidla nezajímá.

```bash
# Kam tým sahá nejčastěji (živé jádro projektu)
git log --pretty=format: --name-only | sort | uniq -c | sort -rn | head -20
```

> [!TIP]
> Hrubou mapu si vážně napiš — do poznámkového bloku, čtyři řádky. Za tři dny ti ušetří
> půl hodiny znovuhledání a při onboardingu dalšího kolegy z ní máš hotovou odpověď.

:::check
Kterým příkazem zjistíš, do kterých souborů tým v posledních commitech sahal nejčastěji?

### --expected--
git log --oneline -20

### --accept--
git log --oneline
git log

### --why--
Nejčerstvější commity ukážou živou část projektu. Složka, do které nikdo nesáhl tři roky, tě u tvého úkolu většinou nezajímá.
:::


## 3. Vystopuj jeden požadavek skrz kód

Cíl kroku: projít jednu jedinou funkci aplikace od okraje dovnitř. Tohle je dovednost,
která odlišuje „bloudím v repozitáři" od „vím, kde jsem".

Zadání zní: *„Tlačítko Přidat do košíku nic nedělá."*

1. **Najdi viditelný text.** `rg "Přidat do košíku"` — nebo `Ctrl+Shift+F` ve VS Code.
2. **Jdi na definici.** Z komponenty do obslužné funkce (`Ctrl` + klik, F12).
3. **Najdi volající.** Z funkce zpátky nahoru: „Find All References" (`Shift+F12`).
4. **Ověř si to `console.log`em.** Vlož výpis a klikni. Když se nevypíše, jsi jinde,
   než sis myslel — a to je cenná informace.

:::live js
```js
// Řetěz, který v cizím projektu sleduješ shora dolů.
// Klikni na "Spustit" a zkus podle výpisu určit, kde je chyba.
function formatPrice(cents) {
  return (cents / 100).toFixed(2) + ' Kč';
}

function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart(items) {
  console.log('položek:', items.length);
  console.log('celkem:', formatPrice(cartTotal(items)));
}

renderCart([
  { price: 4990, qty: 2 },
  { price: 12900, qty: 1 },
]);
```
:::

> [!PITFALL]
> Hledání podle textu selže, když je nápis složený z proměnných nebo jde přes překlady
> (i18n). Pak hledej **klíč překladu** (`cart.addButton`) nebo třídu či `data-testid`
> z DevTools.

:::check
Jsi v souboru u funkce `cartTotal` a potřebuješ zjistit, odkud všude se volá. Jak se
jmenuje funkce editoru, kterou na to použiješ?

### --expected-- ignore-case
Find All References
:::

## 4. Zeptej se historie

Cíl kroku: zjistit **proč** je kód takový, jaký je — než ho „zjednodušíš" a rozbiješ tím
něco, co jsi neviděl.

Dva příkazy, které tu odvedou většinu práce: [[git blame]] u každého řádku ukáže, kdo
jej naposledy změnil, a [[pickaxe|`git log -S`]] najde commit, ve kterém se hledaný text
objevil nebo zmizel.

```bash
# Kdo a kdy napsal každý řádek souboru
git blame src/cart.js

# Historie jednoho souboru i se změnami kódu
git log -p src/cart.js

# Commity, ve kterých se daný text objevil nebo zmizel
git log -S "DISCOUNT10"

# Půlením najdi commit, který rozbil test
git bisect start && git bisect bad && git bisect good v1.4.0
```

Typický scénář: narazíš na podivnou podmínku `if (user.legacyId)`. `git blame` ti ukáže
commit, jeho zpráva odkazuje na issue #482 a tam se píše, že zákazníci z původního
systému mají jiný formát ID. Podmínka není nepořádek — je to požadavek.

> [!REMEMBER]
> **Divný kód má většinou důvod, který už není vidět.** Než ho smažeš, najdi commit,
> který ho přidal. Buď najdeš důvod, nebo najdeš jistotu, že žádný není.

:::explain
Vysvětli vlastními slovy, proč se vyplatí vystopovat jeden konkrétní požadavek skrz
celou aplikaci, místo aby sis postupně přečetl všechny soubory.

## --model--
Čtení po souborech ti dá jména a žádné souvislosti — po hodině víš, že existuje
`cartService.js`, ale ne, kdy se volá. Průchod jedním požadavkem ti naopak ukáže
skutečné spojnice: kde je vstup, kudy tečou data, kde se ukládají a jak se vrací
odpověď. Tenhle jeden průchod pak funguje jako kostra, na kterou se další objevy samy
nabalují — a hlavně je to přesně ta cesta, kterou budeš potřebovat při svém úkolu.

## --checklist--
- Čtení po souborech dává jména bez souvislostí.
- Průchod požadavkem ukáže, jak spolu části mluví.
- Jeden průchod slouží jako kostra pro další poznatky.
- Sleduješ zrovna tu cestu, kterou se týká tvůj úkol.
:::

:::check
Který přepínač `git log` najde commit, ve kterém se v projektu objevil hledaný text?

### --expected--
-S

### --accept--
-S "text"
pickaxe
git log -S

### --why--
`-S` se přezdívá *pickaxe*. Hlídá změnu počtu výskytů řetězce, takže najde přidání i smazání.
:::


## 5. Konvence projektu jsou součást zadání

Cíl kroku: napsat změnu tak, aby vypadala, že ji psal někdo z týmu. Kód, který funguje,
ale je napsaný jinak než zbytek projektu, v review neprojde — a má to důvod: příští
člověk bude hledat podle vzoru, který zná.

[[konvence projektu|Konvence]] hledej na dvou místech:

1. **Psané** — [[CONTRIBUTING.md]], `README.md`, komentáře v konfiguraci lintru.
2. **Nepsané** — v kódu, který už existuje. Otevři dva soubory ze stejné vrstvy
   a všímej si: Jak se hlásí chyby? Odkud se čtou data? Kde jsou typy? Jak se jmenují
   testy?

> [!REMEMBER]
> **Existující kód je ta nejpřesnější dokumentace konvencí.** Když se psané pravidlo
> a kód rozcházejí, zeptej se — nevybírej si sám.

Typický rozpor, který stojí za dotaz: `CONTRIBUTING.md` říká „peníze v haléřích jako
celá čísla", ale v jednom starším modulu jsou koruny jako `number` s desetinami. Buď
se to čeká, že opravíš, nebo je to mina, do které nemáš šlápnout. Ptát se je levnější.

:::check
Proč se vyplatí držet konvencí projektu, i když bys stejný problém napsal jinak a podle
sebe lépe?

### --answer--
Protože jiný zápis by nefungoval.

#### --why--
Fungoval by. Problém je jinde než v běhu programu.

### --correct--
Protože kód čte a mění celý tým — jednotný zápis se hledá a opravuje mnohem rychleji než pět osobních stylů vedle sebe.

#### --why--
Nekonzistence stojí čas při každém dalším čtení. Tvoje úspora při psaní se zaplatí jen jednou.
:::

## 6. Bezpečná změna: charakterizační test

Cíl kroku: sáhnout na cizí funkci bez toho, aby ses modlil.

Když měníš kód, který nemá testy, chybí ti záchytná síť. Napsat testy „správného
chování" ale nejde — ty bys musel vědět, jaké správné chování je, a to právě nevíš.
Řešení je [[charakterizační test]]: test, který popisuje, **jak se kód chová dnes**.

```js
// Nevím, jestli je to správně. Vím, že to tak teď je.
test('večerní sazba platí od 17:00 včetně', () => {
  assert.equal(hourRate(kurt, 16), 24000);
  assert.equal(hourRate(kurt, 17), 32000);
});
```

Postup má tři kroky:

1. **Zafixuj** současné chování testem, i kdyby ti přišlo divné.
2. **Změň** kód. Test, který teď zčervená, ti přesně ukáže, co jsi změnil.
3. **Rozhodni** u každého červeného testu: je to zamýšlená změna (uprav test a napiš
   to do popisu pull requestu), nebo nechtěná [[regrese]] (oprav kód)?

> [!TIP]
> Charakterizační test se hodí i jako otázka do týmu. „Napsal jsem si, že se to teď
> chová takhle — je to záměr?" je mnohem lepší start rozhovoru než „nerozumím tomu".

:::check
Napsal jsi charakterizační test, změnil kód a jeden test zčervenal. Co to znamená?

### --answer--
Že je charakterizační test špatně napsaný.

#### --why--
Test dělá přesně to, k čemu je. Červená je informace, ne chyba testu.

### --correct--
Že se právě tohle chování změnilo — a teď musíš rozhodnout, jestli záměrně, nebo omylem.

#### --why--
Záměrná změna = uprav test a napiš to do popisu pull requestu. Nezáměrná = regrese, oprav kód.
:::


## 7. Typické chyby a pasti

Cíl kroku: poznat dopředu chyby, které v cizím projektu stojí nejvíc času.

> [!PITFALL]
> **Úklid při té příležitosti.** Přejmenování proměnných a přeformátování souboru
> udělá z desetiřádkového diffu pětisetřádkový a skutečná změna v něm zmizí. Úklid
> patří do samostatného pull requestu.

> [!PITFALL]
> **Nová závislost bez domluvy.** Balíček navíc je rozhodnutí na roky: bezpečnostní
> aktualizace, velikost balíku, další člověk, který se ho musí naučit. V cizím projektu
> se na to ptá, nepřidává.

> [!PITFALL]
> **Kopírování vzoru, který je v projektu už zastaralý.** Když existují dva styly vedle
> sebe, řiď se tím novějším — pomůže `git log` na oba soubory.

> [!PITFALL]
> **Oprava chyby bez testu.** Bez testu nemáš jak ukázat, že chyba byla, ani jistotu,
> že se nevrátí. Padající test napsaný před opravou je nejlevnější důkaz, jaký máš.

## Kde to najdeš v MDN a jinde

- [VS Code: Code Navigation](https://code.visualstudio.com/docs/editor/editingevolved) — jak se hýbat v kódu bez myši.
- [git log](https://git-scm.com/docs/git-log) — dokumentace `git log`, včetně `-S` a `-p`.
- [git bisect](https://git-scm.com/docs/git-bisect) — půlení historie při hledání regrese.

# --questions--

## --question--

Proč je `npm ci` na cizím projektu lepší volba než `npm install`?

### --answer--
Je to jen zkratka, dělají přesně totéž.

#### --why--
Liší se v tom, jak zacházejí se zámkovým souborem.

### --correct--
Nainstaluje přesně ty verze, které jsou v `package-lock.json`, takže máš stejné prostředí jako zbytek týmu.

#### --why--
`npm install` může závislosti povýšit a zapsat do zámku nové verze — rozbití pak vidíš jen ty.

### --see--
nastroje-cizi-kod/orientace-v-cizim-kodu#1-rozbehni-projekt-nez-prectes-radku-kodu

## --question--

Který příkaz použiješ, když chceš najít commit, ve kterém se v projektu poprvé objevil
text `DISCOUNT10`?

### --expected--
git log -S "DISCOUNT10"

### --accept--
git log -S DISCOUNT10
git log -S 'DISCOUNT10'

### --why--
`-S` (pickaxe) hledá commity, kde se počet výskytů daného řetězce změnil — tedy kde se přidal nebo zmizel.

## --question--

Narazíš ve funkci na podmínku, která podle tebe nedává smysl. Co uděláš dřív, než ji smažeš?

### --answer--
Smažu ji a počkám, jestli spadnou testy.

#### --why--
Testy pokrývají jen to, na co někdo myslel. Existuje levnější způsob, jak zjistit záměr.

### --correct--
Najdu přes `git blame` commit, který ji přidal, a přečtu si jeho zprávu a navázané issue.

#### --why--
Historie nese důvod, který z kódu už není vidět — třeba zákazníky z původního systému.

### --answer--
Nechám ji být, cizí kód se nikdy nemá měnit.

#### --why--
Cizí kód měnit budeš, to je tvoje práce. Jen ne naslepo.

## --question--

Proč může selhat vyhledání nápisu z tlačítka v celém projektu?

### --answer--
Protože `rg` neumí hledat diakritiku.

#### --why--
S diakritikou `rg` problém nemá.

### --correct--
Protože text může pocházet z překladového souboru nebo být složený z proměnných.

#### --why--
Ve zdrojáku pak není řetězec „Přidat do košíku", ale klíč jako `cart.addButton`.

### --see--
nastroje-cizi-kod/orientace-v-cizim-kodu#3-vystopuj-jeden-pozadavek-skrz-kod

## --question--

**Opakování z dřívějška.** V sekci o testování jsi psal testy na vlastní kód. Jak se
říká testu, který nejdřív zaznamená **současné** chování cizí funkce (i když je možná
špatné), aby bylo při refaktoru vidět, co se změnilo?

### --expected-- ignore-case
charakterizační test

### --accept--
charakterizacni test
characterization test

### --why--
Charakterizační test nepopisuje, jak se má kód chovat, ale jak se chová teď. Je to záchytná síť při změnách v kódu, kterému ještě nerozumíš.

### --see--
nastroje-testovani/proc-testovat

## --question--

**Opakování z dřívějška.** V cizím projektu najdeš v kódu přímo zapsaný klíč k platební
bráně. Proč je to problém i v případě, že je repozitář soukromý?

### --answer--
Protože se klíč v produkci načte pomaleji než z proměnné prostředí.

#### --why--
O rychlost tady vůbec nejde.

### --correct--
Protože klíč zůstane navždy v historii Gitu a vidí ho každý, kdo kdy dostane přístup k repozitáři.

#### --why--
Smazání klíče dalším commitem ho z historie neodstraní — jediná správná reakce je klíč zneplatnit a vydat nový.

### --see--
auth-bezpecnost/hesla
