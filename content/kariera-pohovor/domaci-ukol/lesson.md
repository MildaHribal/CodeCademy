# Domácí úkol

:::check pretest
V zadání stojí „počítejte s časovou náročností zhruba 4 hodiny". Ty nad úkolem strávíš
dvanáct hodin a odevzdáš mnohem víc, než bylo potřeba. Pomůže ti to?

### --expected--
Spíš ne.
:::

[[Domácí úkol]] je dnes nejčastější druhé kolo náboru. Firma ti pošle zadání, dá ti
několik dní a čeká kód. Je to pro tebe nejlepší možná forma zkoušky — **nikdo ti nekouká
přes rameno, můžeš si všechno vyhledat a výsledek se posuzuje podle věcí, které máš plně
pod kontrolou.** Jen je potřeba vědět, co se na něm doopravdy měří.

> [!REMEMBER]
> **Domácí úkol se nehodnotí podle toho, kolik toho uděláš, ale podle toho, jak vypadá
> to, co uděláš.** Polovina zadání odevzdaná čistě porazí celé zadání odevzdané
> zmateně — a hodnotitel to pozná během deseti minut.

## Co domácí úkol doopravdy měří

Zadání zní „napiš seznam uživatelů s vyhledáváním". Hodnotitel se ale nedívá na to,
jestli seznam funguje — to čeká. Dívá se na tohle, obvykle v tomhle pořadí:

| Co hodnotí | Podle čeho to pozná |
|---|---|
| **Jde to spustit?** | `npm ci && npm run dev` podle README, napoprvé, bez doptávání. |
| **Umíš členit kód?** | Jde volání API, vykreslování a stav rozeznat od sebe, nebo je všechno v jedné funkci na 200 řádků? |
| **Myslíš na uživatele?** | Existují stavy načítání, chyby a prázdných dat. |
| **Umíš si vybrat rozsah?** | Co jsi vynechal a napsal jsi proč. |
| **Umíš komunikovat?** | README: co to dělá, jak se to spouští, co jsi vynechal a proč. |
| **Testy** | Že aspoň nějaké jsou a že testují chování, ne detail implementace. |

Skoro nikdy se nehodnotí originalita designu, počet funkcí navíc ani použití „nejmodernější"
knihovny. **Přidaná funkce, o kterou nikdo nežádal, ti může uškodit**, protože ukazuje,
že neumíš držet zadání.

:::check
Co je u odevzdaného domácího úkolu nejčastější důvod okamžitého vyřazení?

### --answer--
Nepoužití stavové knihovny jako Redux nebo Zustand.

#### --why--
Volba nástroje je věc názoru a u malého zadání ji nikdo nevyčítá.

### --correct--
Projekt se hodnotiteli nerozjede podle README napoprvé.

#### --why--
Je to první věc, kterou hodnotitel udělá. Když neprojde, zbytek kódu už mnohdy nikdo nečte.

### --see--
kariera-pohovor/domaci-ukol#co-domaci-ukol-doopravdy-meri
:::

## Přečti zadání jako smlouvu

Než napíšeš první řádek, přepiš si zadání do vlastního seznamu požadavků. Zabere to
deset minut a ušetří hodiny.

1. **Vypiš každý požadavek na samostatnou řádku.** Ze souvislého odstavce se dá snadno
   přehlédnout půlka vět.
2. **Označ, co je povinné a co „bonusové".** Bonusy dělej až úplně nakonec a jen když
   zbyde čas.
3. **Najdi nejednoznačnosti.** „Zobrazte uživatele" — všechny najednou, nebo po
   stránkách? „Vyhledávání" — na serveru, nebo v prohlížeči nad načtenými daty?
4. **Zeptej se.** Jedna krátká zpráva s dvěma konkrétními dotazy je plus, ne minus:
   ukazuje, že neděláš rozhodnutí za zákazníka potichu. Když odpověď nepřijde včas,
   rozhodni sám a **napiš rozhodnutí do README**.

> [!TIP]
> Zadání často obsahuje tichý test. Věta „API vrací stránkovaná data" je pozvánka ke
> stránkování; věta „dataset má 5 000 položek" je pozvánka k tomu, abys nevykresloval
> všechno najednou. Čti i to, co není napsané jako požadavek.

:::check
V zadání není napsané, jestli má vyhledávání běžet na serveru, nebo v prohlížeči.
Co je nejlepší postup?

### --answer--
Udělat obě varianty a nechat volbu na hodnotiteli.

#### --why--
Dvojí implementace stojí dvakrát tolik času a ukazuje neschopnost rozhodnout se.

### --correct--
Zeptat se; když odpověď včas nepřijde, rozhodnout se sám a rozhodnutí i jeho důvod napsat do README.

#### --why--
Nejednoznačnost v zadání je běžná i v práci. Hodnotí se, jestli ji umíš pojmenovat, ne jestli ji uhodneš.

### --see--
kariera-pohovor/domaci-ukol#precti-zadani-jako-smlouvu
:::

## Rozpočet času: čtyři hodiny a ani minutu víc

Časový odhad v zadání je součást zkoušky. Odevzdat po dvanácti hodinách práci na
čtyři hodiny znamená tohle:

- Hodnotitel buď pozná, že jsi limit nedodržel (a dodržování odhadu je přesně to, co
  v práci potřebuje), **nebo nepozná** — a pak posuzuje tvoji čtyřhodinovou rychlost
  podle dvanáctihodinového výsledku a čeká to od tebe i dál.
- Ostatní uchazeči limit dodrželi a ty se srovnáváš s jejich výsledkem, ne se svým.

Rozpočet, který funguje na čtyřhodinové zadání:

| Fáze | Čas | Co v ní děláš |
|---|---|---|
| Čtení a plán | 20 min | Seznam požadavků, náčrt komponent, jedno velké rozhodnutí. |
| Kostra a data | 45 min | Projekt běží, data se načtou a vypíšou se syrově na obrazovku. |
| Hlavní funkce | 90 min | To, co je v zadání jádrem: hledání, stránkování, detail. |
| Stavy a okrajové případy | 45 min | Načítání, chyba, prázdno, neplatný vstup. |
| Testy | 20 min | Dva až čtyři, na to, co se nejsnáz rozbije. |
| README a úklid | 20 min | Popis, spuštění, rozhodnutí, co chybí. |

**Nejčastější chyba v rozpočtu: vzhled.** Junioři na něj utratí hodinu z jádra zadání.
Úkol má vypadat čistě (čitelné písmo, rozestupy, nic nepřeteče), ne hezky.

A ještě jedna položka, kterou rozpočet nesmí rozhodit: úprava, která vypadá jako
jednořádková, ale není. Typicky řazení výsledků.

:::live js predict
```js
const pocty = [10, 9, 1, 100];
console.log(pocty.sort().join(','));
```
--question-- Co vypíše `console.log`?
--expected-- 1,10,100,9
--why-- `sort()` bez porovnávací funkce převede položky na řetězce a řadí je podle znaků, takže „10" je menší než „9". Čísla se řadí přes `sort((a, b) => a - b)` a české texty přes `sort((a, b) => a.localeCompare(b, 'cs'))`. V domácím úkolu se tahle chyba pozná okamžitě a stojí víc bodů než chybějící funkce.
:::

> [!PITFALL]
> Když ti čas dojde, **neodevzdávej nedodělek potichu**. Napiš do README oddíl
> „Co chybí a jak bych to dodělal": tři odrážky s konkrétním postupem. Hodnotí se skoro
> stejně jako hotová funkce a je to nejlevnější body, jaké v úkolu dostaneš.

## README je součást odevzdání

Platí totéž co u portfolia, jen ve zkrácené podobě — a s jednou částí navíc. README
k domácímu úkolu má čtyři bloky a jeden z nich většina uchazečů vynechá:

```md
# Seznam uživatelů — domácí úkol

## Spuštění
npm ci
npm run dev      # http://localhost:5173
npm test

## Co je hotové
Seznam s vyhledáváním (na serveru), stránkování po 10, detail uživatele,
stavy načítání / chyba / prázdný výsledek.

## Rozhodnutí
- Hledání posílám na server, ne filtruju načtenou stránku — v zadání je 5 000 záznamů
  a filtrovat jen aktuální stránku by dávalo matoucí výsledky.
- Psaní do hledání odesílám se zpožděním 300 ms, aby se neposílal požadavek na každý znak.
- Bez stavové knihovny; stav je jen v jedné komponentě a předávám ho o úroveň níž.

## Co chybí a jak bych to dodělal
- Zrušení předchozího požadavku (AbortController) — při rychlém psaní může starší
  odpověď přepsat novější. Řešil bych to uložením posledního signálu.
- Testy k detailu uživatele; stihl jsem jen seznam a vyhledávání.
- Přístupnost: seznamu chybí oznamování počtu výsledků pro čtečku (`role="status"`).
```

Ten poslední blok je jediné místo v celém odevzdání, kde **můžeš ukázat, že víš víc, než
jsi stihl napsat**. Uchazeč, který ví o soubězích odpovědí a nestihl to, je pro firmu
lepší než uchazeč, který o nich neví.

:::check
Proč se vyplatí do README napsat, co jsi nestihl?

### --answer--
Protože hodnotitel nemusí sám hledat, které části chybí.

#### --why--
Pravda, ale hlavní důvod je jiný a týká se toho, jak tě hodnotitel zařadí.

### --correct--
Protože tím ukážeš znalost, kterou jsi v čase nestihl proměnit v kód — a to se hodnotí skoro stejně.

#### --why--
Hodnotitel odhaduje tvůj strop, ne jen tvůj výsledek. Popsaný plán dodělání je doklad o stropu.

### --see--
kariera-pohovor/domaci-ukol#readme-je-soucast-odevzdani
:::

## Testy: kolik jich stačí

Nula testů je pro hodnotitele signál. Třicet testů na čtyřhodinový úkol je jiný signál —
že jsi limit nedodržel. **Dva až čtyři dobré testy jsou správné číslo.**

Co testovat:

- **Funkci, kde je logika**, ne komponentu, která jen vykresluje. Formátování ceny,
  skládání parametrů dotazu, filtrování dat, výpočet stránek.
- **Okrajové případy**, ne šťastnou cestu. Prázdné pole, neplatný vstup, chybná odpověď.
- **Chování, ne implementaci.** Test, který kontroluje, že se zavolala konkrétní vnitřní
  funkce, se rozbije při každém přejmenování a nic nedokládá.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery } from '../src/api.js';

test('prázdné hledání se do dotazu nedostane', () => {
  assert.equal(buildQuery({ hledani: '', stranka: 1 }), '?page=1');
});

test('hledaný text se zakóduje do URL', () => {
  assert.equal(buildQuery({ hledani: 'Nový Jičín', stranka: 2 }), '?q=Nov%C3%BD%20Ji%C4%8D%C3%ADn&page=2');
});
```

Do README napiš jednou větou, **co testy pokrývají a co ne**. „Testy pokrývají skládání
dotazu a formátování; vykreslování jsem netestoval, na to by byla potřeba Testing
Library a nevešlo se to do limitu" je odpověď na otázku, kterou by jinak hodnotitel musel
položit.

:::check
Který test má v krátkém domácím úkolu největší hodnotu?

### --answer--
Test, který ověří, že se komponenta vykreslí bez pádu.

#### --why--
Takzvaný smoke test dokládá jen to, že kód nespadne. Nic o chování neříká.

### --correct--
Test funkce s logikou na okrajovém vstupu — prázdné hledání, neplatná hodnota, nula výsledků.

#### --why--
Okrajové případy jsou místo, kde se kód nejčastěji láme, a hodnotitel podle nich pozná, že na ně myslíš.

### --see--
kariera-pohovor/domaci-ukol#testy-kolik-jich-staci
:::

## Commity a odevzdání

Odevzdání je obvykle odkaz na veřejný repozitář (někdy zip, když firma nechce mít zadání
na GitHubu — v tom případě do archivu **nepřikládej `node_modules`**).

- **Commituj průběžně po smysluplných celcích.** Jeden commit „solution" se 40 soubory
  vypadá přesně jako stažené cizí řešení, i když není.
- **První commit ať je prázdná kostra**, ne hotová aplikace. Z historie má být vidět
  postup.
- **Nekomituj `.env`, klíče ani `node_modules`.** `.gitignore` řeš dřív než první commit.
- **Poslední commit ať je README.** Hodnotitel ho uvidí nahoře.
- **Napiš průvodní e-mail se třemi větami**: odkaz, kolik času to zabralo, na co se má
  hodnotitel podívat jako první.

> [!PITFALL]
> Neodevzdávej v den deadlinu ve 23:58, když jsi měl týden. Není to samo o sobě chyba,
> ale spolu s chaotickou historií commitů se to čte jako „dělal to na poslední chvíli".

:::check
Jak má vypadat první commit v repozitáři s domácím úkolem?

### --answer--
Hotová aplikace — historie se stejně nehodnotí.

#### --why--
Historie se prohlíží běžně a jediný velký commit vyvolá otázku, odkud se kód vzal.

### --correct--
Prázdná kostra projektu; hotová aplikace vzniká postupně dalšími commity.

#### --why--
Z postupné historie je vidět, jak jsi úkol členil — a to je informace, kterou samotný výsledný kód nenese.

### --see--
kariera-pohovor/domaci-ukol#commity-a-odevzdani
:::

:::explain
Vysvětli vlastními slovy, proč odevzdaná polovina zadání s čistým kódem a README bývá
hodnocená lépe než celé zadání odevzdané ve zmatku.

## --model--
Hodnotitel z úkolu odhaduje, jaké to bude s tebou pracovat každý den, ne kolik funkcí
umíš naskládat za víkend. V týmu se skoro nikdy nedodělá všechno — práce se dělí,
odkládá a vysvětluje, takže schopnost odevzdat srozumitelný kus a popsat, co zbývá, je
přesně ta dovednost, kterou potřebuje. Celé zadání ve zmatku naopak vyrábí práci navíc:
někdo tomu musí rozumět, někdo to musí opravit a nikdo z toho nepozná, co jsi vlastně
uměl a co jsi jen nějak zprovoznil. Navíc čistá polovina se dá poctivě posoudit — je
z ní vidět členění kódu, ošetřené stavy i to, jak přemýšlíš o rozsahu.

## --checklist--
- Hodnotí se každodenní spolupráce, ne množství odvedených funkcí.
- V práci se rozsah škrtá běžně, takže umět ho škrtnout je dovednost.
- Zmatené odevzdání vyrábí práci navíc tomu, kdo ho čte.
- Z čistého kusu jde poznat kvalita, ze zmatku ne.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Knihovna navíc na všechno.** Pro seznam s hledáním nepotřebuješ stavovou knihovnu ani
> UI framework. Každá závislost je rozhodnutí, které musíš obhájit.

> [!PITFALL]
> **Konzolové výpisy a zakomentovaný kód v odevzdání.** Deset minut úklidu před odesláním.
> `console.log('tady')` v odevzdaném kódu je drobnost, kterou si ale všimne každý.

> [!PITFALL]
> **Klíč k API v repozitáři úkolu.** Platí dvojnásob: hodnotitel to bere jako ukázku
> toho, jak budeš zacházet s jejich klíči.

> [!PITFALL]
> **Vysvětlování v e-mailu místo v README.** E-mail se ztratí, README zůstává
> u kódu — a kolegové hodnotitele uvidí jen ten repozitář.

## Kde to najdeš dál

- [Take home assignment guide (Robert Heaton)](https://robertheaton.com/2017/08/28/programming-projects-for-advanced-beginners/) — sbírka zadání, na kterých se dá trénovat.
- [Testing Library — o testování chování](https://testing-library.com/docs/guiding-principles/) — princip „testuj jako uživatel".
- [Conventional Commits](https://www.conventionalcommits.org/cs/) — formát commitů, který v historii úkolu vypadá dobře.

# --questions--

## --question--

Zadání odhaduje 4 hodiny. Tobě se to nepovede stihnout a chybí ti detail uživatele.
Co uděláš?

### --answer--
Dodělám to a odevzdám po osmi hodinách kompletní.

#### --why--
Překročený limit zkresluje představu o tvé rychlosti a ostatní uchazeči ho dodrželi.

### --correct--
Odevzdám hotovou část a do README napíšu oddíl „Co chybí a jak bych to dodělal" s konkrétním postupem.

#### --why--
Popsaný plán dodělání se hodnotí skoro jako hotová funkce, protože dokládá znalost i schopnost držet rozsah.

### --see--
kariera-pohovor/domaci-ukol#rozpocet-casu-ctyri-hodiny-a-ani-minutu-vic

## --question--

Kolik testů je v čtyřhodinovém domácím úkolu rozumné množství?

### --expected--
Dva až čtyři.

### --accept--
2-4
2 až 4
dva až čtyři dobré testy

### --why--
Nula je signál, že testy neumíš; třicet je signál, že jsi nedodržel limit. Pár testů na místech s logikou dokládá obojí správně.

### --see--
kariera-pohovor/domaci-ukol#testy-kolik-jich-staci

## --question--

Co patří do bloku „Rozhodnutí" v README k domácímu úkolu?

### --answer--
Seznam funkcí, které aplikace umí.

#### --why--
To je blok „Co je hotové". Rozhodnutí odpovídají na jinou otázku.

### --correct--
Volby, u kterých byla víc než jedna rozumná možnost, a věta proč jsi zvolil tu svoji.

#### --why--
Hodnotitel se u každé takové volby ptá „proč takhle?". Když je odpověď v README, neptá se a rovnou počítá plus.

### --see--
kariera-pohovor/domaci-ukol#readme-je-soucast-odevzdani

## --question--

Které čtyři bloky má mít README k domácímu úkolu? Napiš je oddělené čárkou.

### --expected-- ignore-case
Spuštění, Co je hotové, Rozhodnutí, Co chybí a jak bych to dodělal

### --accept--
spuštění, hotové, rozhodnutí, co chybí
jak to spustit, co je hotové, rozhodnutí a kompromisy, co chybí

### --why--
První tři čekají všichni. Čtvrtý blok většina uchazečů vynechá, a přitom je to jediné místo, kde ukážeš znalost, kterou jsi nestihl proměnit v kód.

### --see--
kariera-pohovor/domaci-ukol#readme-je-soucast-odevzdani

## --question--

Proč může přidaná funkce navíc, o kterou zadání nežádalo, uškodit?

### --answer--
Protože hodnotitel nemá čas ji projít.

#### --why--
Čas na ni najde. Problém je v tom, co z její přítomnosti vyčte.

### --correct--
Protože ukazuje, že neumíš držet zadaný rozsah — a to je v práci dražší než chybějící funkce.

#### --why--
Práce navíc, o kterou nikdo nežádal, stojí tým čas na review i údržbu. Firmy to sledují záměrně.

### --see--
kariera-pohovor/domaci-ukol#co-domaci-ukol-doopravdy-meri

## --question--

**Opakování z dřívějška.** V úkolu voláš `fetch('/api/users?q=Ostrava')`. Server
odpoví stavem 404. Spadne kvůli tomu `await fetch(...)` do `catch`?

### --answer--
Ano, 404 je chyba, takže se promise odmítne.

#### --why--
Pro `fetch` je 404 běžná, úspěšně doručená odpověď — chyba je až z pohledu tvé aplikace.

### --correct--
Ne. `fetch` odmítne promise jen při selhání sítě; stav 404 musíš ošetřit sám kontrolou `response.ok`.

#### --why--
Proto do každé funkce, která volá API, patří `if (!response.ok) throw new Error(...)`. Bez toho se chybová odpověď pokusí zpracovat jako data.

### --see--
js-async/fetch#404-a-500-nejsou-pro-fetch-chyba

## --question--

**Opakování z dřívějška.** Při psaní do vyhledávacího pole posíláš požadavek na každý
znak. Jak se jmenuje technika, kterou se odeslání odloží, dokud uživatel na chvíli
nepřestane psát?

### --expected-- ignore-case
debounce

### --accept--
debouncing
odložení odeslání (debounce)

### --why--
Debounce spustí akci až po uplynutí klidové doby od poslední události. Příbuzný throttle naproti tomu akci pouští nejvýš jednou za daný interval.

### --see--
js-dom/udalosti#klavesnice
