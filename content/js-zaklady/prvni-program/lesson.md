# První program

:::check pretest
Co myslíš, že se stane, když do konzole prohlížeče napíšeš `2 + 3` a stiskneš Enter?

### --expected--

5

### --why--

Konzole funguje jako kalkulačka — výraz vyhodnotí a výsledek ukáže. JavaScript umí počítat, ale umí i mnohem víc. Po téhle lekci budeš vědět, kde všude tvůj kód běží a jak ho spustit.
:::

> [!REMEMBER]
> **JavaScript je jazyk, kterým dáváš stránce chování.** HTML je struktura, CSS je vzhled a JavaScript je to, co se stane, když uživatel klikne, zadá text nebo přijdou data ze serveru.

## Kde JavaScript běží

Když otevřeš libovolný web — třeba e-shop, mapu nebo sociální síť — prohlížeč stáhne HTML, CSS a JavaScript. Tvůj kód běží **v prohlížeči uživatele**, ne na serveru. Každý prohlížeč má vestavěný JavaScript engine: Chrome a Edge používají V8, Firefox má SpiderMonkey.

JavaScript ale nemusí běžet jen v prohlížeči. Program zvaný **Node.js** vezme stejný engine V8 a spustí JavaScript na počítači bez prohlížeče — můžeš s ním psát servery, nástroje a skripty. K Node.js se dostaneme v sekci `node-zaklady`.

:::check
Kde běží JavaScript, který napíšeš do stránky?

### --answer--

Na serveru

#### --why--

Server stránku odešle, ale JavaScript ze `<script>` běží v prohlížeči uživatele, ne na serveru.

### --correct--

V prohlížeči uživatele

### --answer--

V editoru VS Code

#### --why--

Editor je jen nástroj na psaní kódu. Spouštění zajistí prohlížeč nebo Node.js.
:::

## Konzole a `console.log`

Konzole je tvůj nejrychlejší nástroj. Otevřeš ji v DevTools klávesou **F12** (nebo Ctrl+Shift+J) a můžeš do ní psát JavaScript přímo — prohlížeč ho hned vyhodnotí.

V programu výpisy do konzole vypadají takhle:

:::live js
```js
console.log('Ahoj, světe!');
console.log(2 + 3);
console.log('Cena:', 150, 'Kč');
```
:::

Zkus změnit text v uvozovkách nebo čísla a sleduj, jak se výstup mění.

`console.log` vypíše hodnotu do konzole a pokračuje dál. Můžeš mu dát víc hodnot oddělených čárkou — vypíše je vedle sebe s mezerou.

:::check
Co vypíše `console.log('Věk:', 25)`?

### --expected--

Věk: 25

### --why--

`console.log` vypíše všechny hodnoty oddělené mezerou. Řetězec `'Věk:'` a číslo `25` se spojí do výstupu `Věk: 25`.
:::

## Příkazy a středníky

Program je posloupnost **příkazů** (*statements*). Každý příkaz říká: „udělej tohle." Příkazy se oddělují **středníkem** nebo novým řádkem.

:::live js
```js
let x = 10;
let y = 20;
console.log(x + y);
```
:::

JavaScript má funkci zvanou **automatické vkládání středníků** (ASI — *automatic semicolon insertion*). Když na konci řádku chybí středník, engine ho zkusí doplnit sám. Většinou to funguje, ale existují pasti, kde ASI udělá něco jiného, než čekáš:

:::live js predict
```js
let a = 1
let b = 2
console.log(a + b)
```
--question-- Co vypíše kód bez středníků?
--expected-- 3
--why-- Tady ASI funguje správně — každý řádek je jasný příkaz. Ale spoléhat na to u složitějšího kódu je riskantní. Piš středníky vždy.
:::

> [!TIP]
> **Piš středníky vždy.** Ušetříš si překvapení u řádků začínajících `(`, `[` nebo šablonovým řetězcem. Editor (ESLint, Prettier) ti s tím pomůže.

:::check
Proč je bezpečnější psát středníky explicitně, i když je JavaScript doplní sám?

### --expected--

ASI ne vždy doplní středník tam, kde čekáš.

### --accept--

Automatické vkládání středníků nemusí fungovat správně.
ASI může udělat chybu.

### --why--

ASI většinou funguje, ale u řádků začínajících `(` nebo `[` může spojit dva příkazy do jednoho a program se zachová jinak, než čekáš.
:::

## Komentáře

Komentáře engine přeskočí. Slouží tobě a kolegům — vysvětlují **proč**, ne **co** kód dělá:

:::live js
```js
// Maximální počet pokusů před zablokováním účtu
const maxAttempts = 5;

/*
  Poznámka: cena je v haléřích, abychom se vyhnuli
  chybám při zaokrouhlování (viz sekce js-retezce-cisla)
*/
const priceInHalere = 4990;
console.log(priceInHalere / 100, 'Kč');
```
:::

- `//` — jednořádkový komentář, platí do konce řádku.
- `/* … */` — víceřádkový komentář.

> [!PITFALL]
> **Komentář „co kód dělá" je šum.** `// přičti 1` u `count += 1` nikomu nepomůže. Komentuj **proč**: proč haléře místo korun, proč právě 5 pokusů, proč ten workaround.

:::check
Jaký komentář je užitečnější u řádku `const timeout = 3000`?

### --answer--

`// nastavení timeoutu na 3000`

#### --why--

Tohle říká to samé, co kód. Lepší je vysvětlit, proč právě 3 sekundy.

### --correct--

`// 3 sekundy stačí i na pomalé 3G připojení`
:::

## `<script>` v HTML

Když píšeš JavaScript pro stránku, vložíš ho do souboru s příponou `.js` a odkážeš na něj ze stránky:

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Můj první skript</title>
</head>
<body>
  <h1>Ahoj</h1>
  <script src="script.js"></script>
</body>
</html>
```

`<script>` patří na konec `<body>`, aby se HTML zobrazilo dřív, než se skript začne stahovat a spouštět. V Akademii se o tohle nemusíš starat — editor spouští tvůj `script.js` automaticky.

:::check
Kam v HTML patří `<script src="script.js"></script>` a proč?

### --expected--

Na konec body.

### --accept--

Před </body>.
Na konec <body>, aby se stránka zobrazila dřív.

### --why--

Prohlížeč čte HTML shora dolů. Skript na konci `<body>` nechá nejdřív zobrazit obsah stránky a teprve pak spustí JavaScript.
:::

## Kde to najdeš v MDN

- [JavaScript basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Adding_interactivity) — úvod do JavaScriptu na stránce.
- [console.log()](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static) — referenční stránka `console.log`, její parametry a příklady.
- [Lexical grammar — automatic semicolon insertion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#automatic_semicolon_insertion) — přesná pravidla, kdy ASI funguje a kdy ne.
- [`<script>`: The Script element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) — atributy `src`, `type`, `defer` a `async`.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
console.log('a');
console.log('b');
```

### --expected--

a
b

### --why--

`console.log` vypíše hodnotu a skončí. Příkazy se provádějí shora dolů, takže se nejdřív vypíše `a`, pak `b` — každý na vlastní řádek.

### --see--

js-zaklady/prvni-program#konzole-a-console-log

## --question--

Který způsob zápisu komentáře v JavaScriptu je správný?

### --answer--

`<!-- komentář -->`

#### --why--

Tohle je HTML komentář, ne JavaScript.

### --correct--

`// komentář`

### --answer--

`# komentář`

#### --why--

`#` je komentář v Pythonu nebo Bashe, ne v JavaScriptu.

### --see--

js-zaklady/prvni-program#komentare

## --question--

Co se stane, když ve skriptu napíšeš `console.log(10 * 3)`, ale stránka nemá `<script>` na ten soubor?

### --expected--

Nic se nevypíše.

### --accept--

Nic.
Skript se nespustí.

### --why--

Prohlížeč spustí jen skripty, na které odkazuje HTML. Soubor bez `<script>` prohlížeč nevidí.

### --see--

js-zaklady/prvni-program#script-v-html
