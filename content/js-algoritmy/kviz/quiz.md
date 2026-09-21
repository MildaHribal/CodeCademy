---
pass: 0.8
---

# --questions--

## --question--

Co přesně popisuje zápis `O(n)`?

### --answer--

Kolik sekund kód poběží.

#### --why--

Sekundy závisí na stroji, jazyku i datech. Notace popisuje něco, co na nich nezávisí.

### --correct--

Jak rychle roste počet kroků s velikostí vstupu.

#### --why--

Je to popis růstu, ne měření. Proto se konstanty a méně významné členy zahazují.

### --answer--

Kolik paměti kód spotřebuje.

#### --why--

Paměti se říká prostorová složitost a zapisuje se zvlášť.

### --see--

js-algoritmy/big-o#pocitame-kroky-ne-sekundy

## --question--

Jakou složitost má tahle funkce?

```js
function maDuplicitu(pole) {
  for (const prvek of pole) {
    if (pole.indexOf(prvek) !== pole.lastIndexOf(prvek)) return true;
  }
  return false;
}
```

### --expected--

O(n^2)

### --accept--

O(n²)
kvadratická
n^2

### --why--

`indexOf` i `lastIndexOf` procházejí celé pole, a jsou uvnitř cyklu. Vypadá to jako
jeden cyklus, ale jsou to tři.

### --see--

js-algoritmy/big-o#skryte-n-v-metodach-pole

## --question--

Která z těchhle operací **není** `O(1)`?

### --answer--

`pole[5]`

#### --why--

Přístup podle indexu je konstantní, pole umí spočítat adresu rovnou.

### --answer--

`pole.push(x)`

#### --why--

Přidání na konec je amortizovaně konstantní.

### --correct--

`pole.unshift(x)`

#### --why--

Vložení na začátek musí posunout všechny ostatní prvky, takže je to `O(n)`.

### --answer--

`mapa.get(klic)`

#### --why--

Hledání v `Map` je v průměru konstantní.

### --see--

js-algoritmy/big-o#skryte-n-v-metodach-pole

## --question--

Seřaď od nejrychlejšího růstu k nejpomalejšímu — napiš jen prostřední ze tří:
`O(n²)`, `O(n log n)`, `O(log n)`.

### --expected--

O(n log n)

### --accept--

n log n
O(nlogn)

### --why--

Pořadí je `O(log n)` → `O(n log n)` → `O(n²)`. `O(n log n)` je typická složitost
dobrého řazení.

## --question--

Kdy má smysl vyměnit vnořený cyklus za `Set` nebo `Map`?

### --answer--

Vždycky, `Set` je rychlejší než pole.

#### --why--

Ne vždycky. U pěti prvků je režie vyšší než úspora a kód je delší.

### --correct--

Když se uvnitř cyklu opakovaně ptáš „viděl jsem už tuhle hodnotu?" a dat je hodně.

#### --why--

Tehdy se z `O(n²)` stane `O(n)` za cenu `O(n)` paměti — klasická výměna paměti za čas.

### --answer--

Jen když jsou v poli řetězce.

#### --why--

`Set` i `Map` zvládnou libovolné hodnoty, u `Map` dokonce i objekty jako klíče.

### --see--

js-algoritmy/datove-struktury#hledani-v-poli-je-pomale

## --question--

Čím nahradíš tenhle řádek, aby z pole zmizely duplicity?

```js
const unikatni = /* sem */;
```

### --expected--

[...new Set(pole)]

### --accept--

Array.from(new Set(pole))

### --why--

`Set` si každou hodnotu drží jen jednou a zachovává pořadí prvního vložení.

### --see--

js-algoritmy/datove-struktury#set-jen-unikatni-hodnoty

## --question--

Proč se na seskupování podle klíče z dat hodí `Map` líp než objekt?

### --answer--

Protože objekt neumí klíče s diakritikou.

#### --why--

Diakritika v klíči objektu funguje bez problémů.

### --correct--

Protože objekt dědí vlastnosti z prototypu, takže klíče jako `constructor` nebo `__proto__` se chovají divně.

#### --why--

Podmínka `if (!skupiny[klic])` u takového klíče selže — hodnota „existuje", ale není to pole.

### --answer--

Protože `Map` je vždycky rychlejší.

#### --why--

Rozdíl v rychlosti je u řetězcových klíčů zanedbatelný. Jde o bezpečnost klíčů a pořadí.

### --see--

js-algoritmy/datove-struktury#map-klic-a-hodnota-s-rychlym-hledanim

## --question--

Co uděláš u tabule jako první, když dostaneš zadání?

### --answer--

Začnu psát nejlepší řešení, které mě napadne.

#### --why--

Hodnotí se postup. Mlčky psaný kód nedá tazateli šanci tě navést.

### --correct--

Přeformuluju zadání vlastními slovy, vymyslím příklady včetně ošklivých a zeptám se na omezení.

#### --why--

Tím zjistíš, jestli řešíš tu správnou úlohu — a ukážeš, jak přemýšlíš.

### --see--

js-algoritmy/postup-reseni#preformuluj-zadani-vlastnimi-slovy

## --question--

Co musí mít rekurzivní funkce, aby skončila?

### --expected--

základní případ

### --accept-- ignore-case

zakladni pripad
základní případ a krok
base case

### --why--

Základní případ říká, kdy se funkce už nevolá znovu. Bez něj se volá do vyčerpání zásobníku.

### --see--

js-algoritmy/razeni-a-rekurze#rekurze-zakladni-pripad-a-krok

## --question--

Co vrátí `[10, 9, 1].sort()`?

### --expected--

[1, 10, 9]

### --accept--

['1', '10', '9']
1,10,9

### --why--

`sort()` bez porovnávací funkce převede prvky na text. Pro čísla se píše `sort((a, b) => a - b)`.

### --see--

js-algoritmy/razeni-a-rekurze#razeni-porovnavaci-funkci

## --question--

Kolik kroků udělá binární hledání v seřazeném poli s milionem prvků?

### --answer--

Milion, v nejhorším případě projde všechny.

#### --why--

To by byl lineární průchod. Binární hledání interval půlí.

### --correct--

Zhruba dvacet.

#### --why--

`log₂(1 000 000) ≈ 20`. Každý krok zahodí polovinu zbývajících prvků.

### --answer--

Tisíc, tedy odmocninu z milionu.

#### --why--

Odmocninová složitost je něco jiného; půlení dává logaritmus.

### --see--

js-algoritmy/razeni-a-rekurze#binarni-vyhledavani-v-serazenem-poli

## --question--

Jaký je rozdíl mezi debounce a throttle jednou větou?

### --answer--

Debounce funkci zpomalí, throttle ji zrychlí.

#### --why--

Ani jedno nemění rychlost funkce samotné, obě mění, **kdy** se volá.

### --correct--

Debounce čeká na klid a zavolá funkci až po odmlce, throttle ji pouští nejvýš jednou za daný interval.

#### --why--

Proto je debounce na našeptávač a throttle na scroll.

## --question--

Proč `{ ...objekt }` nestačí jako kopie?

### --answer--

Protože nezkopíruje funkce.

#### --why--

Funkce se zkopírují stejně jako jiné hodnoty — jako odkaz.

### --correct--

Protože zkopíruje jen první úroveň a vnořené objekty zůstanou sdílené.

#### --why--

Změna vnořeného objektu v kopii se pak projeví i v originále. Na hlubokou kopii je potřeba rekurze nebo `structuredClone`.

## --question--

**Opakování z dřívějška.** Uvnitř `debounce` si vrácená funkce pamatuje identifikátor
časovače mezi voláními. Jak se říká mechanismu, díky kterému je to možné?

### --expected-- ignore-case

closure

### --accept--

uzávěr
uzáver
uzavření

### --why--

Funkce si nese prostředí, ve kterém vznikla — i po tom, co vnější funkce skončila.

### --see--

js-funkce-hloubka/closures

## --question--

**Opakování z dřívějška.** Chceš načíst pět nezávislých požadavků co nejrychleji
a potřebuješ všechny výsledky. Co použiješ?

### --answer--

`for…of` s `await` uvnitř.

#### --why--

Ten čeká na každý požadavek zvlášť, takže se doby sečtou.

### --correct--

`await Promise.all([...])`

#### --why--

Požadavky poběží souběžně a výsledek je pole hodnot v původním pořadí.

### --answer--

`Promise.race([...])`

#### --why--

`race` vrátí jen první hotový výsledek, ostatní zahodí.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any

# --code-- Cizí modul: statistiky z e-shopu

## --file-- statistiky.js

```js
// Modul, který někdo napsal před dvěma lety. Data jsou pole objednávek:
// { id, email, mesto, castka, polozky: [{ nazev, kusy }] }

export function unikatniZakaznici(objednavky) {
  const emaily = [];
  for (const objednavka of objednavky) {
    if (!emaily.includes(objednavka.email)) {
      emaily.push(objednavka.email);
    }
  }
  return emaily.length;
}

export function nejvetsiObjednavka(objednavky) {
  let nejvetsi = null;
  for (const objednavka of objednavky) {
    if (nejvetsi === null || objednavka.castka > nejvetsi.castka) {
      nejvetsi = objednavka;
    }
  }
  return nejvetsi;
}

export function trzbyPodleMest(objednavky) {
  const soucty = {};
  for (const objednavka of objednavky) {
    soucty[objednavka.mesto] = (soucty[objednavka.mesto] || 0) + objednavka.castka;
  }
  return soucty;
}

export function nejprodavanejsiPolozky(objednavky, k) {
  const pocty = [];
  for (const objednavka of objednavky) {
    for (const polozka of objednavka.polozky) {
      const nalezena = pocty.find((zaznam) => zaznam.nazev === polozka.nazev);
      if (nalezena) nalezena.kusy += polozka.kusy;
      else pocty.push({ nazev: polozka.nazev, kusy: polozka.kusy });
    }
  }
  return pocty.sort((a, b) => b.kusy - a.kusy).slice(0, k);
}

export function serazenePodleCastky(objednavky) {
  return objednavky.sort((a, b) => a.castka - b.castka);
}
```

## --question--

Jakou složitost má `unikatniZakaznici` a čím ji zrychlíš?

### --answer--

`O(n)`, protože má jeden cyklus.

#### --why--

Uvnitř cyklu je `includes`, a to je další průchod.

### --correct--

`O(n²)` kvůli `includes` v cyklu; jedním průchodem se `Set` je z toho `O(n)`.

#### --why--

`new Set(objednavky.map((o) => o.email)).size` dělá totéž lineárně.

### --answer--

`O(n log n)`, protože se pole prohledává půlením.

#### --why--

`includes` nepůlí, prochází pole od začátku.

### --see--

js-algoritmy/big-o#skryte-n-v-metodach-pole

## --question--

Která z funkcí v modulu má **chybu**, která se projeví u volajícího?

### --answer--

`nejvetsiObjednavka`, protože u prázdného pole spadne.

#### --why--

U prázdného pole vrátí `null`, což je korektní a ošetřitelné.

### --correct--

`serazenePodleCastky`, protože `sort` řadí na místě a přehází pole volajícímu.

#### --why--

Funkce, která vypadá jako čistá, tiše mění vstup. Oprava je `[...objednavky].sort(...)` nebo `toSorted`.

### --answer--

`trzbyPodleMest`, protože `||` špatně sčítá nuly.

#### --why--

Tady `|| 0` funguje — problém by nastal jen tehdy, kdyby byla platnou hodnotou nula, a součet od nuly začíná.

## --question--

`nejprodavanejsiPolozky` je nejpomalejší funkce modulu. Proč?

### --answer--

Kvůli `sort` na konci.

#### --why--

Řazení je `O(p log p)` nad počtem různých položek, a to není to nejdražší.

### --correct--

Kvůli `find` uvnitř dvou vnořených cyklů — hledání v poli se opakuje pro každou položku každé objednávky.

#### --why--

`Map` název → kusy sníží hledání na konstantní čas a celé to spadne na `O(celkový počet položek)`.

### --see--

js-algoritmy/datove-struktury#frekvencni-mapa-nejcastejsi-vzor-z-pohovoru

## --question--

Ve `trzbyPodleMest` se skupiny skládají do obyčejného objektu. Jaký klíč v datech by
funkci rozbil?

### --expected--

__proto__

### --accept--

constructor
toString
proto

### --why--

Zděděné vlastnosti z prototypu se tváří jako existující hodnoty. `Map` (nebo
`Object.create(null)`) tenhle problém nemá.

### --see--

js-algoritmy/datove-struktury#map-klic-a-hodnota-s-rychlym-hledanim
