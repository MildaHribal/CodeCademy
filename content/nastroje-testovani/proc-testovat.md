# Co testovat a proč

Většina kódu nepotřebuje test na každý řádek. Testy stojí čas na napsání a hlavně na údržbu. Pokud se systém změní, musíš měnit i testy. Proto testujeme to nejdůležitější.

:::check pretest
Který kód bys otestoval jako první?
1. Výpočet celkové ceny v košíku včetně DPH a slev
2. Funkci, která mění nadpis stránky
3. Komponentu tlačítka, která má jen CSS třídy
:::

> [!REMEMBER]
> Testy jsou tvoje záchranná síť při refaktoringu. Dobrý test ti dodá odvahu měnit vnitřní strukturu kódu, aniž by ses bál, že ho rozbiješ.

## Testovací pyramida

Testy dělíme podle toho, kolik kódu najednou ověřují.

1. **Unit testy**: Testují izolovanou funkci nebo třídu. Jsou rychlé, úzce zaměřené, ale neověří, jestli systém funguje jako celek.
2. **Integrační testy**: Testují propojení více částí, třeba databázi s API.
3. **E2E testy** (End-to-end): Testují celou aplikaci skrz prohlížeč od začátku do konce. Zjistí, jestli se uživatel zvládne přihlásit a nakoupit. Jsou ale pomalé a křehké.

:::live node
// Zkus změnit slevu na 20 a sleduj, jak test spadne
const assert = require('node:assert');
const vypocitejCenu = (cena, sleva) => cena - sleva;
assert.equal(vypocitejCenu(100, 10), 90, 'vypocitejCenu(100, 10) má vrátit 90');
:::

:::check
Jaká úroveň testů je nejrychlejší na spuštění?
:::

## Křehké testy

Křehký test je takový, který spadne i při správné změně kódu (např. při refaktoringu). To se stává, když testujeme implementační detaily (jak něco děláme) místo chování (co to dělá).

:::live node predict
const assert = require('node:assert');
function add(a, b) {
  return a + b;
}
assert.equal(add.toString().includes('+'), true, 'funkce by mela obsahovat operator +');
:::

> [!PITFALL]
> Nepiš testy na vnitřní stav nebo soukromé metody. Testuj jen to, co funkce vrací nebo jak se navenek projevuje.

## Kde to najdeš v MDN
- [Node.js test runner](https://nodejs.org/api/test.html)

# --questions--
- Proč E2E testy tvoří špičku pyramidy, nikoli základ?
- Jaký je rozdíl mezi chováním a implementačním detailem v kontextu testů?
