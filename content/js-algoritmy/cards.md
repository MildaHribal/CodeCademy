## --card-- free

Co znamená, že má algoritmus složitost `O(n)`, a co v ní znamená `n`?

### --back--

Že počet kroků roste **přímo úměrně** velikosti vstupu: dvakrát víc dat, dvakrát víc
práce. `n` je velikost vstupu — a u každé úlohy je potřeba říct, co přesně: počet
prvků pole, délka textu, počet uzlů stromu. Notace popisuje **růst**, ne sekundy;
konstanty i méně významné členy se zahazují.

### --see--

js-algoritmy/big-o#pocitame-kroky-ne-sekundy

## --card-- free

Jaká je časová složitost tohoto kódu a jak by šel zrychlit?

```js
function maNekdoStejneJmeno(lide) {
  for (const a of lide) {
    for (const b of lide) {
      if (a !== b && a.jmeno === b.jmeno) return true;
    }
  }
  return false;
}
```

### --back--

`O(n²)` — dva vnořené cykly přes totéž pole. Při tisíci lidech je to milion porovnání,
při deseti tisících sto milionů.

Zrychlí to jeden průchod s množinou už viděných jmen: `O(n)` času za `O(n)` paměti.

### --see--

js-algoritmy/big-o#z-kvadratu-na-linearni-pruchod

## --card-- free

Seřaď od nejrychlejšího k nejpomalejšímu: `O(n log n)`, `O(1)`, `O(n²)`, `O(log n)`, `O(n)`.

### --back--

`O(1)` → `O(log n)` → `O(n)` → `O(n log n)` → `O(n²)`.

Pro představu při milionu prvků: konstantní je jeden krok, logaritmická asi dvacet,
lineární milion, `n log n` dvacet milionů a kvadratická bilion — tedy řádově hodiny.

### --see--

js-algoritmy/big-o#nejcastejsi-tridy-slozitosti

## --card-- free

Který zápis skrývá vnořený cyklus, i když je na jednom řádku?

### --back--

Každé hledání v poli uvnitř cyklu: `pole.includes(x)`, `pole.indexOf(x)`,
`pole.find(...)`, `pole.filter(...)`. Samy o sobě jsou `O(n)`, ale uvnitř dalšího cyklu
z nich je `O(n²)`. Stejně tak `pole.unshift()` a `pole.splice(0, 1)` musí posunout
všechny prvky.

### --see--

js-algoritmy/big-o#skryte-n-v-metodach-pole

## --card-- code js

Přepiš funkci tak, aby běžela v lineárním čase. Má vrátit `true`, když se v poli
jmen nějaké jméno opakuje.

### --seed--

```js
function jsouDuplicity(jmena) {
  for (let i = 0; i < jmena.length; i++) {
    if (jmena.indexOf(jmena[i]) !== i) return true;
  }
  return false;
}
```

### --test--

```js
assert.equal(jsouDuplicity(['Eva', 'Petr', 'Eva']), true, 'Eva je dvakrát');
assert.equal(jsouDuplicity(['Eva', 'Petr']), false, 'Bez duplicit se vrací false');
assert.equal(jsouDuplicity([]), false, 'Prázdné pole nemá duplicity');

const velke = Array.from({ length: 60000 }, (_, i) => `jmeno${i}`);
const zacatek = Date.now();
assert.equal(jsouDuplicity(velke), false, 'Musí projít i velké pole');
assert.ok(Date.now() - zacatek < 300, 'Na 60 000 jménech to musí být otázka milisekund — indexOf v cyklu je O(n²)');
```

### --solution--

```js
function jsouDuplicity(jmena) {
  const videna = new Set();
  for (const jmeno of jmena) {
    if (videna.has(jmeno)) return true;
    videna.add(jmeno);
  }
  return false;
}
```

### --see--

js-algoritmy/datove-struktury#set-jen-unikatni-hodnoty

## --card-- free

Kdy sáhneš po `Map` místo obyčejného objektu?

### --back--

Když klíče přicházejí zvenčí (od uživatele, z dat), když potřebuješ jiné klíče než
řetězce, když tě zajímá počet záznamů nebo pořadí vkládání. Objekt dědí vlastnosti
z prototypu, takže klíče jako `constructor` nebo `__proto__` ho rozbijí; `Map` je
v tomhle bezpečná a má `has`, `get`, `set`, `size` a `delete`.

### --see--

js-algoritmy/datove-struktury#map-klic-a-hodnota-s-rychlym-hledanim

## --card-- code js

Doplň `frekvence(slova)` tak, aby vrátila `Map` slovo → počet výskytů.

### --seed--

```js
function frekvence(slova) {

}
```

### --test--

```js
const pocty = frekvence(['káva', 'čaj', 'káva']);
assert.ok(pocty instanceof Map, 'Vrací se Map');
assert.equal(pocty.get('káva'), 2, 'káva je dvakrát');
assert.equal(pocty.get('čaj'), 1, 'čaj je jednou');
assert.equal(pocty.get('mléko'), undefined, 'Co tam není, není');
assert.equal(frekvence([]).size, 0, 'Prázdný vstup dá prázdnou Map');
assert.equal(frekvence(['constructor', 'constructor']).get('constructor'), 2, 'Klíč constructor musí fungovat jako každý jiný');
```

### --solution--

```js
function frekvence(slova) {
  const pocty = new Map();
  for (const slovo of slova) {
    pocty.set(slovo, (pocty.get(slovo) ?? 0) + 1);
  }
  return pocty;
}
```

### --see--

js-algoritmy/datove-struktury#frekvencni-mapa-nejcastejsi-vzor-z-pohovoru

## --card-- output

Co vypíše tenhle kód?

```js
const mnozina = new Set([1, 2, 2, 3, 3, 3]);
console.log(mnozina.size);
console.log([...mnozina].join(','));
```

### --expected--

3
1,2,3

### --why--

`Set` si každou hodnotu drží jen jednou a zachovává pořadí prvního vložení. Odtud
jednořádková deduplikace `[...new Set(pole)]`.

### --see--

js-algoritmy/datove-struktury#set-jen-unikatni-hodnoty

## --card-- free

Jaké čtyři kroky uděláš, než u tabule napíšeš první řádek kódu?

### --back--

1. **Přeformuluju zadání** vlastními slovy a nechám si ho potvrdit.
2. **Vymyslím příklady**, hlavně ošklivé: prázdný vstup, jeden prvek, duplicity,
   záporná čísla.
3. **Zeptám se na omezení**: jak velké je `n`, můžou být hodnoty stejné, co se má stát
   při neplatném vstupu.
4. **Popíšu hrubou sílu** a její složitost — až pak hledám lepší řešení.

Mlčet a psát je nejhorší možná strategie: hodnotí se postup, ne rychlost psaní.

### --see--

js-algoritmy/postup-reseni#preformuluj-zadani-vlastnimi-slovy

## --card-- free

Proč se vyplatí říct hrubou sílu nahlas, i když víš, že je pomalá?

### --back--

Protože ukazuje, že zadání chápeš, a dává společný výchozí bod, ze kterého se dá
zlepšovat. Navíc máš jistotu, že skončíš aspoň s **nějakým** funkčním řešením. Postup
„nejdřív správně, pak rychle" je i v běžné práci lepší než hledat optimum naprázdno.

### --see--

js-algoritmy/postup-reseni#nejdriv-hruba-sila-pak-zlepseni

## --card-- css

Kolik kroků udělá binární hledání v seřazeném poli s milionem prvků? Napiš řádově.

### --expected--

20

### --accept--

asi 20
~20
log2(1000000)

### --why--

Každý krok interval půlí, takže jich je `log₂(1 000 000) ≈ 20`. Lineární průchod by
udělal milion.

### --see--

js-algoritmy/razeni-a-rekurze#binarni-vyhledavani-v-serazenem-poli

## --card-- code js

Doplň binární hledání: vrátí index hodnoty v seřazeném poli, jinak `-1`.

### --seed--

```js
function najdi(serazene, hledane) {

}
```

### --test--

```js
const pole = [2, 4, 6, 8, 10, 12];
assert.equal(najdi(pole, 8), 3, 'Osmička je na indexu 3');
assert.equal(najdi(pole, 2), 0, 'První prvek');
assert.equal(najdi(pole, 12), 5, 'Poslední prvek');
assert.equal(najdi(pole, 7), -1, 'Co tam není, vrací -1');
assert.equal(najdi([], 1), -1, 'Prázdné pole');

const milion = Array.from({ length: 1000000 }, (_, i) => i * 2);
const zacatek = Date.now();
for (let i = 0; i < 5000; i++) najdi(milion, 1999998);
assert.ok(Date.now() - zacatek < 400, 'Musí to být půlení, ne průchod');
```

### --solution--

```js
function najdi(serazene, hledane) {
  let zleva = 0;
  let zprava = serazene.length - 1;
  while (zleva <= zprava) {
    const stred = Math.floor((zleva + zprava) / 2);
    if (serazene[stred] === hledane) return stred;
    if (serazene[stred] < hledane) zleva = stred + 1;
    else zprava = stred - 1;
  }
  return -1;
}
```

### --see--

js-algoritmy/razeni-a-rekurze#binarni-vyhledavani-v-serazenem-poli

## --card-- output

Co vypíše tenhle kód?

```js
const cisla = [10, 9, 1, 100];
console.log(cisla.sort().join(','));
```

### --expected--

1,10,100,9

### --why--

`sort()` bez porovnávací funkce převádí prvky na text a řadí je abecedně. Na čísla je
potřeba `cisla.sort((a, b) => a - b)`. A pozor: `sort` řadí pole **na místě**, takže
původní pořadí je pryč.

### --see--

js-algoritmy/razeni-a-rekurze#razeni-porovnavaci-funkci

## --card-- free

Co musí mít každá rekurzivní funkce, aby neskončila přetečením zásobníku?

### --back--

**Základní případ** (situace, kdy se už nevolá znovu) a **krok**, který se k němu
prokazatelně blíží — menší pole, kratší text, nižší úroveň zanoření. Když si nejsi
jistý, napiš si, jak vypadá nejmenší možný vstup a co se s ním stane.

### --see--

js-algoritmy/razeni-a-rekurze#rekurze-zakladni-pripad-a-krok

## --card-- free

Co znamená „rozděl a panuj" a na jakých úlohách ho poznáš?

### --back--

Úloha se rozdělí na menší úlohy **stejného tvaru**, ty se vyřeší a výsledky se spojí.
Typicky merge sort (rozděl pole napůl, seřaď obě, slij dohromady), binární hledání,
procházení stromu. Poznáš to podle toho, že řešení menší části jde použít beze změny.

### --see--

js-algoritmy/razeni-a-rekurze#rozdel-a-panuj-merge-sort

## --card-- free

Kdy použiješ debounce a kdy throttle?

### --back--

**Debounce čeká na klid:** funkce se zavolá až po odmlce. Hodí se na našeptávač,
automatické ukládání konceptu nebo validaci při psaní.
**Throttle drží tempo:** funkce projde nejvýš jednou za daný interval. Hodí se na
scroll, resize, sledování pozice myši.

Jednou větou: debounce zajímá **poslední** událost, throttle **pravidelné** vzorky.

### --see--

js-algoritmy/workshop-pohovorove-utility/002

## --card-- code js

Doplň `once(fn)`: zavolá `fn` jen jednou a další volání vrací uložený výsledek.
Pozor na funkce, které vrací `0` nebo `false`.

### --seed--

```js
function once(fn) {

}
```

### --test--

```js
let volani = 0;
const pripoj = once(() => { volani += 1; return 'připojeno'; });
assert.equal(pripoj(), 'připojeno', 'První volání vrátí výsledek');
assert.equal(pripoj(), 'připojeno', 'Druhé volání vrátí ten samý výsledek');
assert.equal(volani, 1, 'fn se volá právě jednou');

let nulovani = 0;
const nula = once(() => { nulovani += 1; return 0; });
nula(); nula(); nula();
assert.equal(nulovani, 1, 'Výsledek 0 je taky výsledek — fn se nesmí volat znovu');
```

### --solution--

```js
function once(fn) {
  let hotovo = false;
  let vysledek;
  return (...args) => {
    if (!hotovo) {
      vysledek = fn(...args);
      hotovo = true;
    }
    return vysledek;
  };
}
```

## --card-- free

Proč `{ ...objekt }` nestačí jako kopie a co se stane s vnořeným objektem?

### --back--

Spread zkopíruje jen **první úroveň**. Vnořený objekt se zkopíruje jako odkaz, takže ho
kopie sdílí s originálem — změna v jednom se projeví ve druhém. Na hlubokou kopii je
potřeba rekurze, nebo `structuredClone(hodnota)`, které navíc zvládne i cykly, `Map`
a `Set`.

### --see--

js-algoritmy/workshop-pohovorove-utility/006

## --card-- free

Jaká je prostorová složitost řešení, které si při průchodu polem ukládá viděné hodnoty
do `Set`?

### --back--

`O(n)` — v nejhorším případě skončí v množině všechny prvky. To je ta obvyklá výměna:
**platíš pamětí za čas.** Z kvadratického času se stane lineární, ale místo konstantní
paměti potřebuješ lineární. Na pohovoru se vyplatí tu výměnu pojmenovat nahlas.

### --see--

js-algoritmy/big-o#prostorova-slozitost

## --card-- free

Máš pole objednávek a potřebuješ je rozdělit podle města. Proč `Map` a ne objekt?

### --back--

Klíče přicházejí z dat, takže se mezi nimi může objevit `constructor`, `toString` nebo
`__proto__`. U objektu podmínka `if (!skupiny[klic])` u takového klíče selže, protože
hodnota „už existuje" (zděděná z prototypu) — a `push` na ni spadne. `Map` žádný
prototyp klíčů nemá a navíc zachovává pořadí vkládání.

### --see--

js-algoritmy/datove-struktury#map-klic-a-hodnota-s-rychlym-hledanim
