---
pass: 0.8
---

# --questions--

## --question--

Co uděláš jako první po stažení neznámého repozitáře?

### --answer--

Otevřu si soubory a přečtu je popořadě, abych projekt pochopil.

#### --why--

Strávíš tím dny a bez souvislostí si stejně nic nezapamatuješ.

### --correct--

Podle README projekt nainstaluju, spustím a pustím testy — musí být zelené.

#### --why--

Zelený výchozí stav je referenční bod. Bez něj nepoznáš, jestli pozdější červený test způsobila tvoje změna.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#1-rozbehni-projekt-nez-prectes-radku-kodu

## --question--

Který příkaz nainstaluje přesně ty verze závislostí, které má zbytek týmu?

### --expected--

npm ci

### --why--

`npm ci` vychází z `package-lock.json` a nic nepovyšuje. `npm install` může zámek přepsat.

## --question--

Potřebuješ zjistit, kdy a proč se do projektu dostal řetězec `LEGACY_ID`. Co použiješ?

### --expected--

git log -S "LEGACY_ID"

### --accept--

git log -S LEGACY_ID
git log -S 'LEGACY_ID'

### --why--

Přepínač `-S` (pickaxe) najde commity, ve kterých se změnil počet výskytů daného textu.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#4-zeptej-se-historie

## --question--

K čemu slouží charakterizační test?

### --answer--

Popisuje, jak se kód chovat má, a tím definuje zadání.

#### --why--

Takhle funguje běžný test. Charakterizační test vzniká v situaci, kdy zadání neznáš.

### --correct--

Zafixuje současné chování cizího kódu, abys po změně přesně viděl, co se změnilo.

#### --why--

Píše se před zásahem do funkce bez testů — i když ti její chování přijde divné.

### --see--

nastroje-cizi-kod/orientace-v-cizim-kodu#6-bezpecna-zmena-charakterizacni-test

## --question--

Narazíš v cizím projektu na podmínku, která podle tebe nedává smysl. Co je správný první krok?

### --answer--

Smazat ji a spolehnout se na testy.

#### --why--

Testy pokrývají jen to, na co někdo myslel, a tahle podmínka nejspíš vznikla z něčeho, na co nikdo nemyslel.

### --correct--

Najít přes `git blame` commit, který ji přidal, a přečíst jeho zprávu a issue.

#### --why--

Divný kód má většinou důvod, který z kódu už není vidět.

### --answer--

Přepsat ji do čitelnější podoby, aby dávala smysl.

#### --why--

Dokud neznáš záměr, nemůžeš vědět, jestli ji přepisuješ, nebo rušíš.

## --question--

Co patří do popisu pull requestu podle běžné konvence?

### --answer--

Jen název úkolu z Jiry nebo issue trackeru.

#### --why--

Nutíš reviewera přepínat do jiného systému — obvykle to neudělá a review odloží.

### --correct--

Co se mění, proč (odkaz na issue) a jak si to reviewer ověří.

#### --why--

Tyhle tři věci rozhodují o tom, jak rychle se změna zreviduje.

### --see--

nastroje-cizi-kod/od-issue-k-pr#5-otevri-pull-request-ze-ktereho-je-videt-proc

## --question--

Jakým klíčovým slovem v popisu pull requestu zavřeš po začlenění issue číslo 482?

### --expected--

Fixes #482

### --accept--

Closes #482
Resolves #482
fixes #482
closes #482

### --why--

GitHub zná klíčová slova `Fixes`, `Closes` a `Resolves` následovaná číslem issue.

## --question--

Kterou z těchhle věcí **nemá** hledat člověk při code review?

### --answer--

Chování funkce nad prázdným polem.

#### --why--

Okrajové případy vyžadují znalost záměru — to je přesně lidská práce.

### --correct--

Chybějící mezery a nekonzistentní uvozovky.

#### --why--

Tohle je práce pro formatter a linter v CI. Každý komentář o formátování je komentář, který jsi nenapsal o logice.

### --answer--

Tajný klíč zapsaný přímo v kódu.

#### --why--

Bezpečnost je jedna z hlavních věcí, na které má reviewer koukat.

### --see--

nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum

## --question--

Jakou předponu má komentář v review, který nemá blokovat začlenění?

### --expected-- ignore-case

nit

### --accept--

nit:
nitpick
nitpick:

### --why--

Od slova *nitpick*. Autor hned ví, že si může vybrat, jestli to opraví teď, nebo vůbec.

## --question--

Proč se velký pull request často schválí bez pečlivého přečtení?

### --answer--

Protože velké změny píší zkušenější lidé, kterým se víc věří.

#### --why--

S autorem to nesouvisí, souvisí to se čtenářem.

### --correct--

Protože pozornost reviewera je omezená a po několika stovkách řádků přejde z čtení na prohlížení.

#### --why--

Proto se práce dělí: nejdřív příprava bez změny chování, pak nová funkce.

### --see--

nastroje-cizi-kod/code-review#4-velikost-pull-requestu-rozhoduje-o-kvalite-review

## --question--

Zasekl ses na chybě. Jak se podle pravidla timeboxu zachováš?

### --answer--

Zeptám se hned, ať nezdržuju.

#### --why--

Tím přenášíš svoji práci na kolegu a připravuješ se o vlastní učení.

### --correct--

Dám si 30–60 minut vlastního hledání, a když to nevyřeším, jdu se zeptat s popisem toho, co jsem zkusil.

#### --why--

Timebox rozhodnutí odosobní a zároveň ti dá materiál, se kterým je otázka odpověditelná během minuty.

### --answer--

Budu na tom pracovat, dokud to nevyřeším — jinak to vypadá, že to neumím.

#### --why--

Propálený den na problému, který kolega zná zpaměti, stojí tým mnohem víc než dotaz.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#3-timebox-kdy-prestat-bojovat-sam

## --question--

Jak vypadá použitelný odhad úkolu, který jsi nikdy nedělal?

### --answer--

„Zítra ve dvě to bude."

#### --why--

Bod bez neznámé je slib, ne odhad.

### --correct--

„Den až tři dny — záleží, jestli má to API starý formát ID, o kterém mluvil Tomáš."

#### --why--

Rozsah s pojmenovanou neznámou nese informaci o riziku, se kterou se dá plánovat.

### --see--

nastroje-cizi-kod/odhad-a-komunikace#2-odhaduj-v-rozsahu-a-s-duvodem

## --question--

**Opakování z dřívějška.** Test v cizím projektu volá skutečné externí API. Proč to
v review označíš jako problém?

### --answer--

Protože takový test trvá déle než ostatní.

#### --why--

Pomalost je vedlejší. Hlavní problém je jinde.

### --correct--

Protože bude padat pokaždé, když je služba nedostupná nebo změní data — a přestane se mu věřit.

#### --why--

Test má zčervenat jen tehdy, když je chyba v kódu. Na cizí službu se používá mock.

### --see--

nastroje-testovani/mocky-cas-sit

## --question--

**Opakování z dřívějška.** V revidovaném kódu se hodnota od uživatele vkládá do SQL
dotazu skládáním řetězců. Co v komentáři navrhneš?

### --expected-- ignore-case

parametrizovaný dotaz

### --accept--

parametrizovany dotaz
prepared statement
parametrizované dotazy
placeholdery

### --why--

Hodnota se do dotazu nevkládá jako text, ale předává se zvlášť — databáze ji pak nikdy nepovažuje za kód.

### --see--

auth-bezpecnost/owasp-zranitelnosti

## --question--

**Opakování z dřívějška.** Na tvém pull requestu spadne v CI krok s lintem, testy
projdou. Co to znamená?

### --answer--

Nic zásadního, lint je jen doporučení.

#### --why--

Když je lint součástí CI, je to podmínka, na které se tým dohodl.

### --correct--

Pull request je červený a nemá se začleňovat, dokud lint neprojde.

#### --why--

Červená hlavní větev znamená, že všichni ostatní staví na rozbitém základu.

### --see--

nasazeni-provoz/ci-cd

# --code-- Pull request kolegy: sleva pro věrnostní program

## --file-- loyalty.js

```js
// Věrnostní program: zákazník sbírá body za objednávky a podle nich
// spadá do jedné ze tří úrovní. Sleva se počítá z částky v haléřích.
export const TIERS = [
  { name: 'bronz', minPoints: 0, percent: 0 },
  { name: 'stribro', minPoints: 500, percent: 5 },
  { name: 'zlato', minPoints: 2000, percent: 10 },
];

/** Vrátí úroveň odpovídající počtu bodů. */
export function tierFor(points) {
  let found = TIERS[0];
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].minPoints) {
      found = TIERS[i];
    }
  }
  return found;
}

/** Kolik bodů chybí do další úrovně (0, když je zákazník v nejvyšší). */
export function pointsToNextTier(points) {
  const current = tierFor(points);
  const index = TIERS.indexOf(current);
  if (index === TIERS.length - 1) {
    return 0;
  }
  return TIERS[index + 1].minPoints - points;
}

/** Sleva z věrnostního programu. */
export function loyaltyDiscount(amount, points) {
  const tier = tierFor(points);
  return (amount * tier.percent) / 100;
}

/** Body za objednávku: bod za každých celých 100 Kč. */
export function pointsForOrder(amount) {
  return Math.floor(amount / 10000);
}

/**
 * Výsledná cena objednávky.
 * @param {number} amount částka v haléřích
 * @param {number} points body zákazníka
 * @param {{ percent: number } | null} coupon kupón, nebo null
 */
export function finalPrice(amount, points, coupon) {
  let total = amount - loyaltyDiscount(amount, points);
  if (coupon) {
    total = total - (total * coupon.percent) / 100;
  }
  return total;
}

/** Rozpis pro účtenku. */
export function receipt(amount, points, coupon) {
  const total = finalPrice(amount, points, coupon);
  return {
    base: amount,
    tier: tierFor(points).name,
    discount: amount - total,
    total,
    earned: pointsForOrder(total),
  };
}
```

## --file-- loyalty.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tierFor,
  pointsToNextTier,
  pointsForOrder,
  finalPrice,
  receipt,
} from './loyalty.js';

test('bronzová úroveň od nuly bodů', () => {
  assert.equal(tierFor(0).name, 'bronz');
  assert.equal(tierFor(499).name, 'bronz');
});

test('stříbrná úroveň od 500 bodů', () => {
  assert.equal(tierFor(500).name, 'stribro');
});

test('zlatá úroveň od 2000 bodů', () => {
  assert.equal(tierFor(2500).name, 'zlato');
});

test('do další úrovně chybí rozdíl bodů', () => {
  assert.equal(pointsToNextTier(300), 200);
  assert.equal(pointsToNextTier(2500), 0);
});

test('body za objednávku po stokorunách', () => {
  assert.equal(pointsForOrder(100000), 10);
  assert.equal(pointsForOrder(19900), 1);
});

test('cena se slevou', () => {
  assert.equal(finalPrice(100000, 2500, null), 90000);
});

test('rozpis pro účtenku', () => {
  const vysledek = receipt(100000, 2500, null);
  assert.equal(vysledek.tier, 'zlato');
  assert.equal(vysledek.total, 90000);
});
```

## --question--

V projektu platí konvence „peníze jsou v haléřích jako celá čísla". Co na tom v review
upozorníš u funkce `loyaltyDiscount`?

### --answer--

Že by měla brát procento parametrem místo z úrovně.

#### --why--

To je návrhová preference, ne porušení konvence.

### --correct--

Že dělení stem může vrátit desetinné číslo, takže výsledek není celý počet haléřů — patří tam zaokrouhlení, nebo sdílený pomocník na procenta.

#### --why--

`(amount * percent) / 100` u 333 haléřů a 5 % vrátí 16.65. Dál se s tím počítá jako s penězi.

### --see--

nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum

## --question--

Zadání říká, že se slevy **nesčítají** — platí vyšší z věrnostní a kupónové. Dělá to
`finalPrice`?

### --answer--

Ano, kupón se aplikuje až po věrnostní slevě, takže vyhrává ta vyšší.

#### --why--

Postupné odečítání není totéž co výběr vyšší slevy.

### --correct--

Ne, slevy se řetězí za sebou — z 10 000 udělá věrnostních 10 % a pak kupón 20 % částku 7 200, ne 8 000.

#### --why--

Chování odporuje zadání a žádný test to nechytí. Přesně tohle má review najít.

## --question--

Co v tomhle pull requestu chybí z pohledu testů?

### --answer--

Nic, obě funkce mají test.

#### --why--

Testy jsou dva, ale pokrývají jen šťastnou cestu.

### --correct--

Chybí test kombinace věrnostní slevy s kupónem — tedy přesně toho pravidla, které je v kódu rozbité.

#### --why--

Testy pokrývají jen to, na co autor myslel. Reviewer má hlídat i to, na co nemyslel.

### --see--

nastroje-testovani/proc-testovat

## --question--

Cyklus v `tierFor` prochází všechny úrovně a nechává poslední vyhovující. Jaký komentář
k němu do review napíšeš?

### --answer--

„Tohle je špatně napsané, přepiš to."

#### --why--

Komentář bez důvodu a bez návrhu vyvolá jen obranu.

### --correct--

`nit:` s návrhem — funguje to jen díky tomu, že je pole seřazené vzestupně; stálo by za to to napsat do komentáře nebo najít úroveň od konce.

#### --why--

Konkrétní, s důvodem, a označené jako drobnost, protože kód je funkční.

### --see--

nastroje-cizi-kod/code-review#2-jak-napsat-komentar-ktery-se-da-prijmout
