import os
import json

base_dir = "/home/karel/akademie/content/js-retezce-cisla/workshop-kosik-ceny"
os.makedirs(os.path.join(base_dir, "steps"), exist_ok=True)

with open(os.path.join(base_dir, "module.json"), "w") as f:
    json.dump({"type": "workshop", "title": "Nákupní košík a ceny"}, f, indent=2)

steps = {
    "001.md": """<Úvod a příprava>
Vítej ve workshopu! Postavíme si nákupní košík, který umí počítat DPH, slevy, dopravu a formátovat ceny i datum doručení.
Připravme si základní proměnné a strukturu.
</Úvod a příprava>
<--help-->
- Začni definováním proměnných pro cenu a množství v `index.js`.
</--help-->
<--files-->
```html index.html
<div id="cart"></div>
```
```js index.js
const pricePerItem = 19.99;
const quantity = 3;
```
</--files-->""",

    "002.md": """<Základní součet>
Spočítej celkovou cenu bez DPH vynásobením ceny za kus a množství. Ulož ji do proměnné `subtotal`.
</Základní součet>
<--help-->
- Použij operátor násobení `*`.
</--help-->
<--files-->
```js index.js
const pricePerItem = 19.99;
const quantity = 3;
// Tady spočítej subtotal
```
</--files-->""",

    "003.md": """<Zobrazení v košíku>
První viditelná změna! Vypiš vypočítanou celkovou cenu do elementu `#cart` v HTML.
</Zobrazení v košíku>
<--help-->
- Použij `document.getElementById('cart').innerText` k úpravě obsahu elementu.
</--help-->
<--files-->
```js index.js
const pricePerItem = 19.99;
const quantity = 3;
const subtotal = pricePerItem * quantity;
// Zobraz subtotal v DOMu
```
</--files-->""",

    "004.md": """<Výpočet DPH>
Přidej výpočet DPH. Sazba je 21%. Spočítej hodnotu DPH a celkovou cenu s DPH.
</Výpočet DPH>
<--help-->
- Vynásob `subtotal` číslem `0.21` pro zjištění hodnoty DPH.
</--help-->
<--files-->
```js index.js
const pricePerItem = 19.99;
const quantity = 3;
const subtotal = pricePerItem * quantity;
// Spočítej vat (DPH) a total (celkem)
document.getElementById('cart').innerText = `Cena bez DPH: ${subtotal}, Celkem s DPH: ${total}`;
```
</--files-->""",

    "005.md": """<Problém s desetinnými čísly>
kind: debug

Podívej se na výsledek `19.99 * 3`. Místo `59.97` vidíš `59.96999999999999`. Zjisti, proč se to děje a jak by se to dalo řešit.
</Problém s desetinnými čísly>
<--help-->
- V JavaScriptu (a mnoha dalších jazycích) jsou čísla reprezentována jako floating-point (s plovoucí desetinnou čárkou), což způsobuje tyto nepřesnosti.
</--help-->
<--files-->
```js index.js
console.log(19.99 * 3); // Očekáváme 59.97
```
</--files-->""",

    "006.md": """<Řešení přes haléře>
Tento krok vysvětluje koncept výpočtu v haléřích (nebo centech). Místo desetinných čísel budeme počítat s celými čísly a na konci výsledek vydělíme 100. Převeď `pricePerItem` na haléře.
</Řešení přes haléře>
<--help-->
- Vynásob původní cenu 100 a zaokrouhli ji pomocí `Math.round()`.
</--help-->
<--files-->
```js index.js
const pricePerItem = 19.99; // Změň na haléře (1999)
const quantity = 3;
```
</--files-->""",

    "007.md": """<Výpočet v haléřích>
Uprav výpočet `subtotal`, aby probíhal v haléřích a výsledek byl přesný.
</Výpočet v haléřích>
<--help-->
- Násobíš `pricePerItemInCents` a `quantity`. Celkový výsledek drž v haléřích.
</--help-->
<--files-->
```js index.js
const pricePerItemCents = 1999;
const quantity = 3;
// Spočítej subtotalCents
```
</--files-->""",

    "008.md": """<DPH pomocí Math.round>
kind: parsons

Poskládej správně výpočet DPH v haléřích. Výsledek DPH je nutné před přičtením k základu zaokrouhlit na celé haléře, abychom nepřišli o halíře při zobrazení.
</DPH pomocí Math.round>
<--help-->
- Výpočet DPH (21%) aplikuj na `subtotalCents`. Nezapomeň použít `Math.round()`.
</--help-->
<--files-->
```js index.js
const subtotalCents = 5997;
// Sestav výpočet vatCents = Math.round(subtotalCents * 0.21);
// totalCents = subtotalCents + vatCents;
```
</--files-->""",

    "009.md": """<Výpočet slevy>
Zákazník má slevový kód na 10%. Vypočítej hodnotu slevy a odečti ji od základu ceny (před DPH). Nezapomeň na zaokrouhlení haléřů!
</Výpočet slevy>
<--help-->
- Sleva se počítá jako `Math.round(subtotalCents * 0.10)`.
</--help-->
<--files-->
```js index.js
const subtotalCents = 5997;
// Spočítej discountCents a odečti ho od subtotalCents
```
</--files-->""",

    "010.md": """<Cena za dopravu>
Přidej k objednávce cenu dopravy. Doprava stojí 99 Kč (9900 haléřů), ale pokud je celková cena po slevě (bez DPH) vyšší než 1000 Kč, je doprava zdarma (0).
</Cena za dopravu>
<--help-->
- Použij podmínku (např. if nebo ternární operátor). Pokud je základ >= 100000, doprava je 0.
</--help-->
<--files-->
```js index.js
// Přidej výpočet shippingCents
```
</--files-->""",

    "011.md": """<Formátování měny pomocí Intl.NumberFormat>
Všechny částky máme v haléřích. Pro zobrazení zákazníkovi je musíme převést na koruny (vydělit 100) a správně naformátovat do české měny pomocí `Intl.NumberFormat`.
</Formátování měny pomocí Intl.NumberFormat>
<--help-->
- Použij `new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(totalCents / 100)`.
</--help-->
<--files-->
```js index.js
const totalCents = 6500;
// Naformátuj částku
```
</--files-->""",

    "012.md": """<Více položek v košíku>
Nahraď samostatné proměnné pro cenu a množství polem objektů představujícím různé produkty v košíku.
</Více položek v košíku>
<--help-->
- Vytvoř pole `cartItems = [{ name: 'Kniha', priceCents: 1999, quantity: 3 }, { name: 'Sešit', priceCents: 499, quantity: 5 }]`.
</--help-->
<--files-->
```js index.js
// Definuj pole položek košíku
```
</--files-->""",

    "013.md": """<Cyklus pro výpočet košíku>
Použij cyklus (např. `reduce` nebo `for...of`), abys prošel všechny položky v košíku a sečetl celkovou hodnotu `subtotalCents`.
</Cyklus pro výpočet košíku>
<--help-->
- Metoda `reduce` je ideální pro sečtení hodnot pole do jednoho výsledku.
</--help-->
<--files-->
```js index.js
const cartItems = [
  { name: 'Kniha', priceCents: 1999, quantity: 3 },
  { name: 'Sešit', priceCents: 499, quantity: 5 }
];
// Spočítej subtotalCents pro všechny položky
```
</--files-->""",

    "014.md": """<Správné skloňování počtu položek>
Použij `Intl.PluralRules` s lokalizací 'cs-CZ' pro správné zobrazení textu počtu položek v košíku ("1 položka", "2 položky", "5 položek").
</Správné skloňování počtu položek>
<--help-->
- `new Intl.PluralRules('cs-CZ').select(count)` vrací klíče jako "one", "few", "many", "other". Mapuj tyto klíče na odpovídající texty.
</--help-->
<--files-->
```js index.js
const totalQuantity = 3; // Součet množství všech položek
const pr = new Intl.PluralRules('cs-CZ');
// Zjisti správné slovo a vypiš "V košíku máte 3 položky"
```
</--files-->""",

    "015.md": """<Výpočet data doručení>
Objednávka bude doručena za 3 dny od dneška. Získej aktuální datum a přičti k němu 3 dny.
</Výpočet data doručení>
<--help-->
- Vytvoř `new Date()` a použij metody `getDate()` a `setDate(den + 3)`.
</--help-->
<--files-->
```js index.js
// Vypočítej datum doručení
```
</--files-->""",

    "016.md": """<Formátování data doručení>
Datum doručení zformátuj do hezké podoby pomocí `Intl.DateTimeFormat`.
</Formátování data doručení>
<--help-->
- Použij `new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'full' }).format(deliveryDate)`.
</--help-->
<--files-->
```js index.js
const deliveryDate = new Date();
deliveryDate.setDate(deliveryDate.getDate() + 3);
// Zformátuj datum
```
</--files-->""",

    "017.md": """<Sestavení celého přehledu košíku>
Všechny části spoj do jednoho bloku. Zobraz HTML přehled objednávky s rozpisem (Základní cena, Sleva, DPH, Doprava, Celkem) a datem doručení do elementu `#cart`.
</Sestavení celého přehledu košíku>
<--help-->
- Vytvoř HTML string pomocí template literals (zpětných uvozovek) a ten vlož přes `innerHTML` do `#cart`.
</--help-->
<--files-->
```js index.js
// Sestav summary HTML s formátovanými měnami a datem
```
</--files-->""",

    "018.md": """<Ošetření krajních případů slevy>
Může se stát, že slevový kód převýší celkovou cenu položek? Zabezpeč, aby hodnota slevy nemohla být větší než samotný `subtotalCents`.
</Ošetření krajních případů slevy>
<--help-->
- Použij `Math.min(discountCents, subtotalCents)` nebo `if` k omezení maximální výše slevy.
</--help-->
<--files-->
```js index.js
const subtotalCents = 1500;
let discountCents = 2000;
// Omez výši slevy, aby nebyla větší než subtotalCents
```
</--files-->"""
}

for filename, content in steps.items():
    with open(os.path.join(base_dir, "steps", filename), "w") as f:
        f.write(content)

print("Workshop created successfully.")
