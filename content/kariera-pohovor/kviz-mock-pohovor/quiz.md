---
pass: 0.8
---

# --questions--

## --question--

Tazatel otevře pohovor větou: „Tak nám o sobě něco povězte." Co je nejlepší odpověď?

### --answer--

Chronologicky odvyprávím životopis od střední školy.

#### --why--

Tazatel má životopis před sebou. Tuhle otázku klade proto, aby se dozvěděl něco, co v něm není.

### --correct--

Dvě minuty: čím jsem se do teď živil, proč jsem se dal na programování, co jsem naposled postavil a co hledám.

#### --why--

Je to jediná otázka celého pohovoru, kterou znáš dopředu doslova. Nacvičená dvouminutová odpověď rozhodne o tónu zbytku rozhovoru.

### --answer--

Vyjmenuju technologie, které umím, ať je hned jasné, na co mě můžou nasadit.

#### --why--

Výčet technologií tazatel vidí v CV a nedá se na něj navázat další otázkou.

### --see--

kariera-pohovor/behavioralni-a-anglictina#sest-otazek-ktere-padnou-skoro-vzdy

## --question--

Firma ti nabídne spolupráci „na IČO" na běžnou pozici v týmu: pevná pracovní doba, jeden
odběratel, práce podle pokynů vedoucího. Jak se takovému uspořádání říká?

### --expected-- ignore-case

švarcsystém

### --accept--

švarc systém
švarcsystem
svarcsystem

### --why--

Formálně jsi podnikatel, fakticky zaměstnanec. Fakturovaná sazba vypadá vedle stejně vysoké
[[hrubá mzda|hrubé mzdy]] líp, jenže riziko nese ten, kdo fakturuje: nemáš dovolenou, nemocenskou
ani výpovědní lhůtu a pojistné si platíš sám.

### --see--

kariera-pohovor/trh-a-role#penize-co-si-rict-a-jak

## --question--

Kolik testů má napsat uchazeč do čtyřhodinového domácího úkolu?

### --expected--

2–4

### --accept--

2-4
2 až 4
dva až čtyři
tři

### --why--

Nula testů je signál, že na ně uchazeč nemyslí. Třicet testů je signál, že nedodržel limit
času. Dva až čtyři testy nad funkcí s logikou a okrajovým vstupem řeknou hodnotiteli přesně to,
co potřebuje vědět.

### --see--

kariera-pohovor/domaci-ukol#testy-kolik-jich-staci

## --question--

Odevzdáváš domácí úkol jako odkaz na repozitář. Který commit má být poslední?

### --answer--

Commit s posledním dodělaným požadavkem — ať je vidět, kam jsi došel.

#### --why--

Kam jsi došel, je vidět ze stavu kódu. Poslední commit má jinou úlohu: rozhoduje o tom, co hodnotitel uvidí jako první.

### --correct--

Commit s hotovým README.

#### --why--

Hodnotitel otevře repozitář a README má nahoře. Když je v posledním commitu, čte se jako průvodce celým odevzdáním.

### --answer--

Commit s testy, aby bylo vidět, že jsi na ně nezapomněl.

#### --why--

Testy si hodnotitel spustí. README je to jediné, co mu vysvětlí tvoje rozhodnutí a to, co jsi nestihl.

### --see--

kariera-pohovor/domaci-ukol#commity-a-odevzdani

## --question--

V zadání domácího úkolu stojí: „Seznam uživatelů s vyhledáváním, v databázi je 5 000 záznamů,
zobrazujte po dvaceti." Kam podle takového zadání patří filtrování — na klienta, nebo na server?

### --expected-- ignore-case

na server

### --accept--

server
na serveru
do API na serveru

### --why--

Zadání dvěma čísly říká, že se nikdy nenačte všechno. Filtrovat jen tu jednu načtenou stránku
by dávalo matoucí výsledky — a přesně tohle je rozhodnutí, které patří do README.

### --see--

kariera-pohovor/domaci-ukol#precti-zadani-jako-smlouvu

## --question--

Při live codingu ti dojde, že tvoje řešení prochází pole v cyklu ještě jednou uvnitř cyklu.
Co uděláš?

### --answer--

Smažu to a budu hledat rovnou to nejlepší řešení.

#### --why--

Mazání funkčního kódu bez náhrady je nejrychlejší cesta k tomu, že na konci nebudeš mít nic.

### --correct--

Nechám to běžet, nahlas řeknu, že je to kvadratické, a navrhnu, čím bych to zrychlil.

#### --why--

Tazatel uvidí obě verze — funkční řešení i to, že o jeho ceně víš. Za obojí dostaneš body.

### --answer--

Nebudu to komentovat, ať si toho tazatel nevšimne.

#### --why--

Všimne si toho vždycky. Rozdíl je jen v tom, jestli se to dozví od tebe, nebo jestli na to musí upozornit sám.

### --see--

kariera-pohovor/technicky-pohovor#live-coding-mluv-nahlas

## --question--

**Opakování z dřívějška.** Tazatel ti ukáže tenhle kód a zeptá se, v jakém pořadí se vypíšou
čísla. Napiš výstup, každý řádek zvlášť.

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

### --expected--

```text
1
4
3
2
```

### --why--

Synchronní kód doběhne celý (`1`, `4`). Pak přijdou na řadu mikroúlohy, a teprve když je
fronta mikroúloh prázdná, vezme si smyčka událostí další úlohu — časovač. Proto `3` před `2`,
i když má `setTimeout` nulu.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost

## --question--

**Opakování z dřívějška.** Tazatel: „Máme endpoint `/api/objednavky`, který vrací padesát tisíc
záznamů a klientům to padá. Co s tím uděláte?" Jednou dvěma slovy — co do API doplníš?

### --expected-- ignore-case

stránkování

### --accept--

strankovani
přidat stránkování
stránkovat
limit a offset

### --why--

Seznam bez horní hranice je chyba návrhu, ne výkonu. Stránkování se posílá v query parametrech
(`?page=2&perPage=20`, nebo kurzorem) a odpověď nese i celkový počet, aby si klient uměl
vykreslit listování.

### --see--

api-http-rest/navrh-rest#strankovani-offset-a-kurzor

## --question--

**Opakování z dřívějška.** Tazatel se podívá do tvého projektu a najde řádek
`seznam.innerHTML = '<li>' + uzivatel.jmeno + '</li>'`. Zeptá se, jaká zranitelnost tím vzniká.
Jak se jmenuje?

### --expected-- ignore-case

XSS

### --accept--

cross-site scripting
cross site scripting

### --why--

Jméno přijde zvenčí, ale vkládá se do stránky jako HTML. Stačí, aby se uživatel jmenoval
`<img src=x onerror=…>`, a kód se spustí v prohlížeči kohokoli, kdo seznam otevře. Řešením je
`textContent` nebo escapování podle kontextu.

### --see--

auth-bezpecnost/owasp-zranitelnosti#xss-na-serveru-escapovani-a-kontext

## --question--

**Opakování z dřívějška.** Do pull requestu ti kolega napíše jediný komentář: „Tohle je blbě."
Co je na tom komentáři špatně především?

### --answer--

Chybí označení `nit:`.

#### --why--

`nit:` se používá u drobností, které nemají blokovat začlenění. Tenhle komentář má jiný a větší problém.

### --correct--

Neříká proč ani co s tím — autor z něj nepozná, co má udělat.

#### --why--

Užitečný komentář v review pojmenuje konkrétní místo, důvod a pokud možno i návrh. Bez důvodu se z review stává hádka o vkusu.

### --answer--

Je moc stručný; komentáře v review mají být dlouhé.

#### --why--

Délka o kvalitě nerozhoduje. Jednořádkový komentář s důvodem je lepší než odstavec bez něj.

### --see--

nastroje-cizi-kod/code-review#2-jak-napsat-komentar-ktery-se-da-prijmout

## --question--

Pohovor běží anglicky a tys otázce nerozuměl. Napiš větu, kterou použiješ.

### --expected-- ignore-case

Sorry, could you repeat that?

### --accept--

Could you repeat that, please?
Sorry, could you repeat that
Could you rephrase the question, please?

### --why--

Nechat si otázku zopakovat je běžné i mezi rodilými mluvčími. Odpovědět na otázku, které jsi
nerozuměl, je mnohem horší než se zeptat — a tazatel z toho žádný závěr o tvé angličtině nedělá.

### --see--

kariera-pohovor/behavioralni-a-anglictina#fraze-ktere-se-hodi-mit-nacvicene

## --question--

První měsíc v práci. Zasekl ses na úkolu a nevíš, jak dál. Kdy se máš ozvat?

### --answer--

Až když to vzdám úplně — do té doby by to vypadalo, že si neporadím.

#### --why--

Nikdo nehodnotí, jestli si poradíš sám. Hodnotí se, jestli tým ví, kde jsi, a jestli neztrácíš čas.

### --correct--

Po předem daném čase, třeba po hodině: napíšu, co jsem zkusil, co jsem čekal a kde to drhne.

#### --why--

Dohodnutý časový strop (timebox) a zpráva s celým kontextem jsou to, co odlišuje dotaz, který nikoho neobtěžuje, od toho, který zdržuje oba.

### --answer--

Hned, jak si nejsem jistý — je lepší se zeptat dřív než později.

#### --why--

Zeptat se bez jediného pokusu přesouvá tvůj úkol na někoho jiného. Půl hodiny vlastního hledání má cenu i tehdy, když nikam nevede.

### --see--

kariera-pohovor/prvni-mesice#jak-se-ptat-aby-to-nikoho-nemrzelo

## --question--

Reviewer ti v prvním pull requestu napsal připomínku, se kterou nesouhlasíš. Co uděláš?

### --answer--

Změním to podle něj — je zkušenější a nechci hned na začátku dělat dusno.

#### --why--

Mlčky provedená změna, které nerozumíš, se ti vrátí u další podobné situace. A tým se nedozví, že jsi o tom přemýšlel.

### --correct--

Napíšu, proč jsem to udělal takhle, a zeptám se, co tím reviewer řeší. Rozhodne argument, ne kdo ho vyslovil.

#### --why--

Review je rozhovor o kódu. Otázka „co tím řešíš?" skoro vždy odkryje kontext, který jsi jako nováček nemohl znát — a občas ukáže, že jsi měl pravdu ty.

### --answer--

Odpovím, že se mýlí, a vysvětlím mu, jak se to dělá správně.

#### --why--

Stejný obsah, jiný tón. Formulace „mýlíš se" mění technickou debatu v souboj o to, kdo ustoupí.

### --see--

kariera-pohovor/prvni-mesice#prijimat-review-bez-obrany

## --question--

Kolik měsíců bývá v Česku obvykle [[zkušební doba]] na plný úvazek?

### --expected-- ignore-case

3

### --accept--

tři
tři měsíce
3 měsíce

### --why--

Během ní může skončit kterákoli ze stran bez udání důvodu a s krátkou lhůtou. Není to jen
zkouška tebe — je to i tvoje příležitost zjistit, jestli firma funguje tak, jak na pohovoru
slibovala.

### --see--

kariera-pohovor/prvni-mesice#zkusebni-doba-a-zpetna-vazba

# --code-- Odevzdaný domácí úkol: seznam uživatelů

## --file-- seznam.js

```js
// Odevzdaný domácí úkol jiného uchazeče. Zadání znělo: seznam uživatelů
// s vyhledáváním a stránkováním, v databázi je 5 000 záznamů, zobrazujte po dvaceti.
// Kód je ponechaný přesně tak, jak dorazil, včetně stylu a komentářů autora.

var NA_STRANKU = 20;

var nactenaStranka = [];
var stranka = 1;
var dotaz = '';

function nacti() {
  fetch('/api/users?page=' + stranka + '&perPage=' + NA_STRANKU)
    .then(function (odpoved) {
      return odpoved.json();
    })
    .then(function (data) {
      nactenaStranka = data.items;
      vykresli();
    });
}

// hledani - filtruju si to sam, je to rychlejsi nez volat server
function hledat(text) {
  dotaz = text;
  vykresli();
}

function vykresli() {
  var seznam = document.getElementById('seznam');
  var kZobrazeni = nactenaStranka;

  if (dotaz !== '') {
    kZobrazeni = nactenaStranka.filter(function (uzivatel) {
      return uzivatel.jmeno.toLowerCase().indexOf(dotaz.toLowerCase()) > -1;
    });
  }

  // at je to serazene podle abecedy
  kZobrazeni.sort(function (a, b) {
    return a.jmeno > b.jmeno ? 1 : -1;
  });

  var html = '';
  for (var i = 0; i < kZobrazeni.length; i++) {
    html += '<li class="radek">' + kZobrazeni[i].jmeno + ' (' + kZobrazeni[i].email + ')</li>';
  }
  seznam.innerHTML = html;

  document.getElementById('stranka').textContent = stranka;
}

document.getElementById('hledani').addEventListener('keyup', function (udalost) {
  hledat(udalost.target.value);
});

document.getElementById('dalsi').addEventListener('click', function () {
  stranka = stranka + 1;
  nacti();
});

document.getElementById('predchozi').addEventListener('click', function () {
  stranka = stranka - 1;
  nacti();
});

nacti();
```

## --question--

Uchazeč u pohovoru tvrdí, že vyhledávání prohledává celou databázi. Proč to tak není?

### --answer--

Protože `indexOf` nenajde jméno s diakritikou.

#### --why--

Diakritika je skutečný problém tohohle porovnání, ale nesouvisí s tím, nad jakou množinou dat se hledá.

### --correct--

`hledat` filtruje pole `nactenaStranka`, ve kterém je vždycky jen jedna načtená stránka z API — tedy nejvýš dvacet záznamů.

#### --why--

Hledání, které vidí jen aktuální stránku, vrací u pěti tisíc záznamů skoro vždycky prázdno. Filtr patří do dotazu na server, vedle stránkování.

### --answer--

Protože `filter` vrací nové pole a původní zahodí.

#### --why--

`filter` opravdu vrací nové pole, to je ale správné chování. Problém je v tom, co je v tom původním poli.

### --see--

api-http-rest/navrh-rest#filtry-a-razeni-v-query

## --question--

Co v řetězci ve funkci `nacti` chybí, aby stránka uměla zareagovat na výpadek API?

### --expected--

.catch

### --accept--

catch
.catch()
catch()

### --why--

Bez `catch` se odmítnutá Promise nikde nezachytí: uživatel vidí prázdný seznam a v konzoli
nezachycenou chybu. Ošetřená větev je zároveň místo, kde se zapne chybový stav a tlačítko
„Zkusit znovu".

### --see--

js-async/fetch#stavy-nacitani-chyba-a-prazdno

## --question--

Uživatel se jmenuje `<img src=x onerror=alert(1)>`. Co udělá řádek `seznam.innerHTML = html`?

### --answer--

Vypíše to jako text, protože jméno je v řetězci.

#### --why--

Že je něco v řetězci, o způsobu vložení nerozhoduje. Rozhoduje vlastnost, kterou se do stránky zapisuje.

### --correct--

Vloží to do stránky jako HTML a prohlížeč obsah `onerror` spustí.

#### --why--

Přesně tohle je XSS. Obrana není filtrovat vstup, ale vkládat hodnoty přes `textContent` nebo je escapovat podle kontextu.

### --answer--

Vyhodí chybu, protože `<img>` nesmí být uvnitř `<li>`.

#### --why--

Prohlížeč neplatné vnoření tiše opraví, chybu nevyhodí. A `<img>` uvnitř `<li>` je navíc v pořádku.

### --see--

auth-bezpecnost/owasp-zranitelnosti#xss-na-serveru-escapovani-a-kontext

## --question--

Když je hledání prázdné, je `kZobrazeni` totéž pole jako `nactenaStranka` — a `sort` ho tedy
přeuspořádá i tam. Napiš jméno metody, kterou `sort` nahradíš, aby původní pole zůstalo beze změny.

### --expected-- ignore-case

toSorted

### --accept--

toSorted()
Array.prototype.toSorted

### --why--

`sort` řadí na místě a vrací totéž pole; `toSorted` vrací seřazenou kopii. Stejně by posloužilo
`[...kZobrazeni].sort(…)`. V review je to typický nález: funkce, která vypadá jako čistá, tiše
mění data, která dostala odjinud.

### --see--

js-pole/co-je-pole#metody-ktere-pole-meni-a-metody-ktere-vraceji-nove
