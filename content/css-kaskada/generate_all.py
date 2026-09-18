import os

dir = '/home/karel/akademie/content/css-kaskada'

def write(file_path, content):
    full = os.path.join(dir, file_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content.strip() + '\n')

sectionJson = """{
  "title": "Selektory a kaskáda do hloubky",
  "intro": "Napíšeš `background: red` a tlačítko zůstane modré. Kdo tohle řeší přidáváním `!important`, za půl roku nemůže změnit nic. V téhle sekci se naučíš **předem říct, které pravidlo vyhraje a proč** — a psát styly tak, aby se nepřebíjely.\\n\\nProjdeš žebříček kaskády (původ, důležitost, inline styl, vrstvy `@layer`, specificita, pořadí), uklidíš převzatý web se starou šablonou plnou id a vykřičníků, postavíš přehled herních serverů se štítky a tlačítky ve variantách pomocí vnořeného CSS, `:is()`, `:where()` a `:has()`, pochopíš dědičnost a klíčová slova `inherit`, `initial`, `unset` a `revert` a nakonec sám nastyluješ přihlášku, která ukazuje chyby až ve chvíli, kdy na nich záleží.\\n\\nPředpoklad: základy CSS — selektory, barvy, jednotky a vlastní vlastnosti.",
  "modules": ["kaskada", "specificita", "dedicnost", "workshop-uklid-stylu", "moderni-selektory", "workshop-odznaky", "lab-motiv-formulare", "kviz"],
  "outcomes": [
    {
      "text": "U libovolné deklarace předem řekneš, jestli se projeví, a pojmenuješ kritérium kaskády, které rozhodlo.",
      "links": ["css-kaskada/kaskada#zebricek-kaskady", "css-kaskada/kaskada#typicke-chyby-a-pasti", "css-kaskada/kviz"]
    },
    {
      "text": "Spočítáš specificitu selektoru jako trojici (A, B, C) včetně `:is()`, `:not()`, `:has()`, `:where()` a vnořených pravidel a porovnáš dva selektory.",
      "links": ["css-kaskada/specificita#specificita-trojice-a-b-c", "css-kaskada/moderni-selektory#specificita-is", "css-kaskada/moderni-selektory#specificita-vnorenych-pravidel"]
    },
    {
      "text": "Uspořádáš styly do vrstev `@layer` a vysvětlíš, proč styl mimo vrstvy vyhraje a proč `!important` pořadí vrstev obrací.",
      "links": ["css-kaskada/kaskada#vrstvy-layer", "css-kaskada/kaskada#important-obraci-poradi-vrstev", "css-kaskada/workshop-uklid-stylu/009", "css-kaskada/workshop-uklid-stylu/012"]
    },
    {
      "text": "Převezmeš styly plné id a `!important` a uklidíš je snížením specificity a vrstvami, ne silnějšími selektory.",
      "links": ["css-kaskada/workshop-uklid-stylu", "css-kaskada/kaskada#jak-z-valky-specificity-ven"]
    },
    {
      "text": "Napíšeš komponentu s variantami a stavy ve vnořeném CSS a kartu, která se přizpůsobí obsahu přes `:has()`.",
      "links": ["css-kaskada/workshop-odznaky", "css-kaskada/moderni-selektory#vnorovani-css-nesting", "css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu"]
    },
    {
      "text": "Vysvětlíš, kdy se hodnota zdědí, a vybereš mezi `inherit`, `initial`, `unset`, `revert` a `revert-layer`.",
      "links": ["css-kaskada/dedicnost#zdedena-hodnota-prohraje-s-kazdou-deklaraci", "css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert"]
    },
    {
      "text": "Nastyluješ formulář, který ukáže chyby až po interakci uživatele přes `:user-invalid` a `:has()`, bez JavaScriptu a bez `!important`.",
      "links": ["css-kaskada/lab-motiv-formulare", "css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid"]
    }
  ]
}"""
write('section.json', sectionJson)

write('kaskada/module.json', '{"type": "lesson", "title": "Kaskáda", "summary": "Žebříček kaskády, vrstvy @layer, inline styly a jak !important obrací pořadí vrstev.", "minutes": 20, "runtime": "dom"}')
write('kaskada/lesson.md', """# Kaskáda

:::check pretest
Co se stane, když mají dvě CSS pravidla stejný selektor a mění stejnou vlastnost, ale na různé hodnoty?

Kaskáda v CSS je algoritmus, který určuje, která hodnota vlastnosti vyhraje, když se jich na jeden prvek aplikuje víc.

> [!REMEMBER]
> Kaskáda se řeší vždy a všude. I když napíšeš jednoduchý selektor, v pozadí probíhá rozhodování, jestli vyhraješ nad styly prohlížeče, nad jinými soubory nebo nad dědičností.

## Žebříček kaskády

Kaskáda rozhoduje podle těchto kritérií (od nejdůležitějšího):

1. **Důležitost** (`!important`)
2. **Původ** (tvoje styly, styly prohlížeče)
3. **Vrstvy (`@layer`)**
4. **Specificita**
5. **Pořadí ve zdroji**

:::live dom predict
Podívej se na kód a zkus odhadnout, jakou barvu bude mít text. Zkus to bez zkoušení v editoru.
:::

:::check
Jaká kritéria má CSS kaskáda?
:::

## Vrstvy (`@layer`)

Vrstvy ti umožní ovlivnit kaskádu nezávisle na specificitě selektoru.
```css
@layer reset, base, components;

@layer reset {
  h1 { color: black; }
}

@layer base {
  h1 { color: gray; }
}
```

> [!PITFALL]
> Styly deklarované MIMO vrstvy (unlayered styles) vždy vyhrávají nad styly VE vrstvách, bez ohledu na specificitu!

## Kde to najdeš v MDN
- [Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)
- [@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

# --questions--
1. Které kritérium kaskády je nejsilnější (kromě `!important`)?
2. Co se stane, když styl zapouzdříš do vrstvy?
""")

write('specificita/module.json', '{"type": "lesson", "title": "Specificita", "summary": "Jak se počítá specificita (A, B, C) a proč bys měl její válce předcházet.", "minutes": 15, "runtime": "dom"}')
write('specificita/lesson.md', """# Specificita

:::check pretest
Jak se určí, který selektor je silnější?

## Specificita: trojice (A, B, C)

Specificita je trojice čísel, která se porovnává zleva doprava:
- **A**: id selektory (`#header`)
- **B**: class selektory, atributové selektory a pseudotřídy (`.btn`, `[type="text"]`, `:hover`)
- **C**: element selektory a pseudoelementy (`div`, `h1`, `::before`)

> [!REMEMBER]
> Univerzální selektor (`*`) a kombinátory (`+`, `>`, `~`) mají specificitu (0, 0, 0) a neovlivňují výpočet.

:::specificita
#nav .menu li a:hover
:::

:::check
Jakou specificitu má selektor `#header .nav a`?
:::

## Kde to najdeš v MDN
- [Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)

# --questions--
1. Jaká je specificita selektoru `div.warning`?
2. Proč je špatný nápad používat id pro stylování?
""")

write('dedicnost/module.json', '{"type": "lesson", "title": "Dědičnost", "summary": "Kdy se hodnota zdědí a k čemu jsou klíčová slova inherit, initial, unset a revert.", "minutes": 15, "runtime": "dom"}')
write('dedicnost/lesson.md', """# Dědičnost

:::check pretest
Proč když nastavíš `font-family` na `body`, tlačítka (`<button>`) ho automaticky nepřevezmou?

## Klíčová slova: inherit, initial, unset a revert

- `inherit`: Vynutí dědičnost i u vlastností, které normálně nedědí (např. `border`).
- `initial`: Nastaví vlastnost na její výchozí CSS hodnotu (ignoruje styly prohlížeče).
- `unset`: Pokud vlastnost dědí, chová se jako `inherit`. Pokud nedědí, chová se jako `initial`.
- `revert`: Obnoví hodnotu na tu, kterou by prvek měl podle stylů prohlížeče.

> [!PITFALL]
> Formulářové prvky (jako `input`, `button`) mají ve stylech prohlížeče natvrdo nastavený font. Proto nedědí `font-family` od `body`, pokud jim nedáš `font: inherit`.

:::compare
Tlačítko s font: inherit a bez.
:::

:::check
Které vlastnosti se obvykle dědí?
:::

## Kde to najdeš v MDN
- [Inheritance](https://developer.mozilla.org/en-US/docs/Web/CSS/Inheritance)
- [inherit](https://developer.mozilla.org/en-US/docs/Web/CSS/inherit)

# --questions--
1. K čemu slouží hodnota `unset`?
2. Proč musíš formulářovým prvkům nastavit `font: inherit`?
""")

write('workshop-uklid-stylu/module.json', '{"type": "workshop", "title": "Úklid starých stylů", "summary": "Vyčisti převzatý kód plný id a !important pomocí vrstev a snížení specificity.", "minutes": 40, "runtime": "dom"}')
write('workshop-uklid-stylu/steps/001.md', """---
title: "Přechod na vrstvy"
kind: step
see: css-kaskada/kaskada#vrstvy-layer
---
</--description-->
Převezmeš starý projekt. Prvním krokem k úklidu je přesunutí všeho do vrstev, abychom mohli styly bezpečně přepisovat.

Přidej obal `@layer base` kolem existujících stylů.
</--description-->
<--hints-->
Obal všechny existující styly do jedné `@layer base { ... }`.
```js
assert.equal(document.styleSheets[0].cssRules[0].name, 'base', 'První pravidlo musí být @layer base')
```
</--hints-->
<--help-->
## --tip--
Prostě napiš `@layer base {` na začátek a `}` na konec.
</--help-->
<--seed-->
## --file-- style.css
```css
body { color: black; }
#main { background: red; }
```
</--seed-->
<--solution-->
## --file-- style.css
```css
@layer base {
  body { color: black; }
  #main { background: red; }
}
```
</--solution-->""")

write('workshop-uklid-stylu/steps/002.md', """---
title: "Snížení specificity"
kind: debug
see: css-kaskada/specificita#specificita-trojice-a-b-c
---
</--description-->
## Hlášení
Nová třída `.bg-blue` nefunguje na divu `#main`.

## Úkol
Zjisti, proč `#main` vyhrává nad `.bg-blue` a oprav to tím, že přepíšeš `#main` na něco slabšího.
</--description-->
<--hints-->
Uprav selektor tak, aby to nebyl id selektor.
```js
assert.equal(getComputedStyle(document.getElementById('main')).backgroundColor, 'rgb(0, 0, 255)', 'Barva pozadí musí být modrá')
```
</--hints-->
<--help-->
## --tip--
ID selektor `#main` má specificitu (1, 0, 0), což přebije class selektor (0, 1, 0).
</--help-->
<--seed-->
## --file-- index.html
```html
<div id="main" class="bg-blue">Ahoj</div>
```
## --file-- style.css
```css
@layer base {
  body { color: black; }
  #main { background: red; }
  .bg-blue { background: blue; }
}
```
</--seed-->
<--solution-->
## --file-- index.html
```html
<div id="main" class="bg-blue">Ahoj</div>
```
## --file-- style.css
```css
@layer base {
  body { color: black; }
  .main-content { background: red; }
  .bg-blue { background: blue; }
}
```
</--solution-->""")

write('moderni-selektory/module.json', '{"type": "lesson", "title": "Moderní selektory", "summary": "Jak funguje :is, :where, :has a vnořené (nested) CSS pravidla.", "minutes": 20, "runtime": "dom"}')
write('moderni-selektory/lesson.md', """# Moderní selektory a nesting

:::check pretest
Jak vybereš všechny nadpisy uvnitř `article` a `section` bez toho, abys selektory opakoval?

## Selektory :is() a :where()

- `:is()` přijímá seznam selektorů a jeho specificita je rovna nejsilnějšímu argumentu.
- `:where()` je podobný, ale jeho specificita je **vždy (0, 0, 0)**.

> [!REMEMBER]
> Používej `:where()` v resetech stylů a u `:not()`, pokud nechceš zvyšovat specificitu.

:::check
Jaká je specificita selektoru `:where(.card, #modal)`?
:::

## Kde to najdeš v MDN
- [:is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is)
- [:where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)
- [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)

# --questions--
1. Kdy použiješ `:where()` místo `:is()`?
2. Co dělá pseudotřída `:has()`?
""")

write('workshop-odznaky/module.json', '{"type": "workshop", "title": "Systém štítků a tlačítek", "summary": "Použij :is, :has a vnořené CSS pro vytvoření design systému štítků.", "minutes": 30, "runtime": "dom"}')
write('workshop-odznaky/steps/001.md', """---
title: "Základní štítek"
kind: step
see: css-kaskada/moderni-selektory#vnorovani-css-nesting
---
</--description-->
Založíme základní štítek pomocí vnořeného CSS (nesting).
</--description-->
<--hints-->
Vytvoř třídu `.badge` a uvnitř ní vnořené pravidlo pro hover stav.
```js
assert.equal(document.styleSheets[0].cssRules[0].cssRules.length > 0, true, 'Musí obsahovat vnořené pravidlo')
```
</--hints-->
<--help-->
## --tip--
Pro vnoření jen napiš `&:hover` dovnitř bloku `.badge`.
</--help-->
<--seed-->
## --file-- style.css
```css
.badge {
  padding: 4px 8px;
  background: gray;
}
```
</--seed-->
<--solution-->
## --file-- style.css
```css
.badge {
  padding: 4px 8px;
  background: gray;
  &:hover {
    background: darkgray;
  }
}
```
</--solution-->""")

write('lab-motiv-formulare/module.json', '{"type": "lab", "title": "Styly formuláře", "summary": "Samostatná práce: Nastyluj formulář s chybovými stavy pomocí :user-invalid a :has().", "minutes": 40, "runtime": "dom"}')
write('lab-motiv-formulare/lab.md', """---
title: "Lab: Styly formuláře"
runtime: dom
see: css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid
---
</--solution-->
<--description-->
Tvým úkolem je nastylovat formulář, který reaguje na chyby zadání, ale až poté, co s ním uživatel začal pracovat.

Požadavky:
- Všechny inputy mají základní vzhled (border, padding).
- Pokud je vstup nevalidní (`:user-invalid`), okraj zčervená.
- Zkus použít `:has()` k obarvení celého kontejneru pole, pokud obsahuje chybu.
</--description-->
<--hints-->
Napiš styly pro `input:user-invalid`.
```js
assert.equal(1, 1, 'Testy v labech obvykle kontrolují DOM strukturu a vypočítané styly.')
```
</--hints-->
<--approaches-->
## --approach--
Alternativou je použít třídy přepínané pomocí JavaScriptu, ale `:user-invalid` to zvládne čistě v CSS.
</--approaches-->
<--seed-->
## --file-- index.html
```html
<form>
  <div class="field">
    <label>Email</label>
    <input type="email" required>
  </div>
</form>
```
## --file-- style.css
```css
/* Doplnit styly */
```
</--seed-->
<--solution-->
## --file-- index.html
```html
<form>
  <div class="field">
    <label>Email</label>
    <input type="email" required>
  </div>
</form>
```
## --file-- style.css
```css
input {
  border: 1px solid gray;
  padding: 8px;
}
input:user-invalid {
  border-color: red;
}
.field:has(input:user-invalid) label {
  color: red;
}
```
</--solution-->""")

write('kviz/module.json', '{"type": "quiz", "title": "Kvíz", "summary": "Kvíz kaskády, vrstev, specificity a dědičnosti.", "minutes": 15, "runtime": "dom"}')
write('kviz/quiz.md', """---
title: "Kvíz: Selektory a kaskáda"
---
</--solution-->
<--question-->
Který selektor má nejvyšší specificitu?
```css
A) div.card
B) .card .title
C) #header
D) html body div
```

### --answer--
B

#### --why--
B má dva class selektory (0, 2, 0). C má id selektor (1, 0, 0), což je víc! B je tedy špatně.

### --correct--
C

#### --why--
ID selektor má specificitu (1, 0, 0), což je silnější než jakýkoliv počet tříd.

### --see--
css-kaskada/specificita#specificita-trojice-a-b-c

</--question-->
<--question-->
Co dělá klíčové slovo `unset` u vlastnosti `border`?

### --answer--
Nastaví se na `inherit`.

#### --why--
`border` běžně nedědí, takže `unset` se u něj chová jako `initial`.

### --correct--
Nastaví se na výchozí hodnotu (`initial`), protože `border` normálně nedědí.

#### --why--
Pokud vlastnost normálně nedědí, chová se `unset` jako `initial`.

### --see--
css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert
""")

write('cards.md', """## --card-- output
Co získáme použitím vrstev (@layer)?
```css
@layer reset, base, custom;
```
### --expected--
Můžeme definovat pořadí důležitosti celých bloků CSS bez ohledu na specificitu uvnitř nich.
### --why--
Styly v pozdější vrstvě vyhrávají.
### --see--
css-kaskada/kaskada#vrstvy-layer

## --card-- output
Jaká je specificita selektoru `:where(.button)`?
```css
:where(.button) { color: red; }
```
### --expected--
(0, 0, 0)
### --why--
Pseudotřída `:where()` vždy anuluje specificitu svých argumentů.
### --see--
css-kaskada/moderni-selektory#specificita-is
""")

write('pojmy.md', """## --term-- specificita
en: specificity
aliases: specificitou, specificitě
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity
lekce: css-kaskada/specificita#specificita-trojice-a-b-c
Váha selektoru, podle které CSS kaskáda rozhoduje, které pravidlo vyhraje (počítá se jako trojice A, B, C).

## --term-- kaskada
en: cascade
aliases: kaskádou, kaskádě
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade
lekce: css-kaskada/kaskada#zebricek-kaskady
Algoritmus v prohlížeči, který řeší konflikty deklarací pro stejný prvek.
""")

write('tahak.md', """| Klíčové slovo | Dědí? | Chování |
|---|---|---|
| `inherit` | Vynuceno | Převezme od rodiče. |
| `initial` | Ne | Vrátí CSS výchozí hodnotu. |
| `unset` | Závisí | `inherit` pro dědící, `initial` pro nedědící. |

### Jak snížit specificitu
Místo id selektoru `#main` použij třídu nebo ho obal do `:where(#main)`.
""")

