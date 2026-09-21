## Kostra dokumentu

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Název stránky — Jméno webu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>…</main>
  </body>
</html>
```

`charset` musí být v prvním kilobajtu souboru, proto stojí hned na začátku hlavičky.

## Z čeho se skládá adresa

```
https://eshop.cz:443/boty/panske?velikost=43#recenze
└─┬──┘  └───┬───┘└┬┘└─────┬────┘└──────┬───┘└───┬──┘
schéma   doména  port   cesta        query   fragment
```

| část | kdo ji používá |
|---|---|
| schéma | prohlížeč — jak zdroj získat (`https:`, `mailto:`, `tel:`) |
| doména | [[DNS]] ji přeloží na IP adresu serveru |
| cesta | server — který zdroj vrátit |
| query | server — čím odpověď upravit |
| fragment | **jen prohlížeč**, na server se neposílá |

## Adresy v odkazech

| zápis | kam vede |
|---|---|
| `https://jiny-web.cz/a.html` | cizí web, platí odkudkoli |
| `/kontakt.html` | od kořene vlastního webu |
| `kontakt.html` | ze složky, kde leží aktuální stránka |
| `../kontakt.html` | o složku výš |
| `#postup` | na prvek s `id="postup"` v téže stránce |
| `mailto:jitka@plotna.cz` | otevře psaní e-mailu |
| `tel:+420777123456` | vytočí číslo |

## Struktura stránky

```html
<body>
  <header>
    <a href="/">Logo</a>
    <nav aria-label="Hlavní navigace">…</nav>
  </header>

  <main>
    <h1>Jediný hlavní nadpis</h1>
    <article>
      <h2>Část s vlastním nadpisem</h2>
      <p>Odstavec s <strong>důležitou věcí</strong> a <em>důrazem</em>.</p>
    </article>
    <aside>Doplněk k hlavnímu obsahu</aside>
  </main>

  <footer>…</footer>
</body>
```

- `<main>` je na stránce **jeden** a nedává se do `header`, `footer`, `article` ani `nav`.
- [[sémantický prvek|Sémantický prvek]] vyber podle otázky „má ta část vlastní nadpis?".
  Když ano, není to `div`.

## Nadpisy

```html
<h1>Recept</h1>
  <h2>Suroviny</h2>
    <h3>Na těsto</h3>
    <h3>Na smažení</h3>
  <h2>Postup</h2>
```

Úroveň klesá **po jedné**. Velikost písma řeší CSS, ne číslo nadpisu.

## Obrázky a přílohy

```html
<figure>
  <img src="img/bramboraky.jpg"
       alt="Tři zlatavé bramboráky na talíři se zakysanou smetanou"
       width="800" height="533">
  <figcaption>Podávej hned z pánve, dokud jsou křupavé.</figcaption>
</figure>
```

- `alt` popisuje **obsah**, ne soubor. Bez slov „obrázek" a „fotka".
- `alt=""` jen u čisté ozdoby. Chybějící `alt` je vždy chyba.
- `width` a `height` bez jednotek → prohlížeč si nechá místo a stránka neposkakuje.

## Seznamy a tabulka

```html
<ul>                      <ol>                     <table>
  <li>na pořadí             <li>první krok</li>      <thead>
      nezáleží</li>         <li>druhý krok</li>        <tr><th>Živina</th><th>Na 1 porci</th></tr>
</ul>                     </ol>                      </thead>
                                                     <tbody>
                                                       <tr><td>Bílkoviny</td><td>9 g</td></tr>
                                                     </tbody>
                                                   </table>
```

Čísla kroků v `<ol>` **nepiš** — doplní je prohlížeč. `<th>` je záhlaví, `<td>` data.

## Entity

| zápis | znak | k čemu |
|---|---|---|
| `&nbsp;` | nezlomitelná mezera | `349&nbsp;Kč`, `J.&nbsp;Horáková` |
| `&lt;` `&gt;` | `<` `>` | aby to prohlížeč nebral jako značku |
| `&amp;` | `&` | samotný ampersand v textu |
| `&copy;` | © | podpis, patička |
| `&mdash;` | — | pomlčka |

## Pasti

- **Blokový prvek v `<p>`** (`<div>`, `<ul>`, `<h2>`) odstavec předčasně ukončí
  a ze zbylého `</p>` vznikne prázdný odstavec navíc. V souboru to nevidíš —
  koukej do DevTools do panelu **Elements**.
- **Přeskočená úroveň nadpisu** (`h2` → `h4`) udělá díru v osnově.
- **Text odkazu „klikni zde"** — čtečka umí odkazy vypsat zvlášť a takový seznam je
  k ničemu. Text má dávat smysl i vytržený z věty.
- **`id` dvakrát v jednom dokumentu** — odkaz `#…` pak skočí na první z nich
  a chování je nespolehlivé.
- **Celá adresa na odkaz uvnitř vlastního webu** — při stěhování na jinou doménu
  povede na starou.
- **Chybějící `<meta charset="utf-8">`** pozná podle `BramborÃ¡ky` místo `Bramboráky`.

## Jak číst MDN

1. Hledej `mdn` + jméno prvku nebo vlastnosti, ne celou otázku.
2. Nahoře je [[Baseline]] — `Widely available` = bezpečné, `Newly available` = ověř si to.
3. Dole je [[tabulka kompatibility]] po prohlížečích a verzích.
4. Značka **Deprecated** = nepoužívej, **Experimental** = za přepínačem, uživatelé to nemají.
