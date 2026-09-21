---
title: Profilová stránka
see: html-zaklady/anatomie-dokumentu, html-zaklady/semanticka-struktura
runtime: dom
---

# --description--

Vytvoř si jednoduchou osobní vizitku nebo profil na webu. Představ si, že tohle je první stránka tvého portfolia. Zatím sice nevypadá úchvatně, protože nemáme CSS, ale pod kapotou musí mít pevnou a správnou HTML strukturu, aby ji pochopil prohlížeč i čtečka obrazovky.

**Co má vizitka obsahovat:**

- Obrázek s tvou fotkou nebo avatarem. Pokud žádný nemáš po ruce, použij `https://picsum.photos/200`.
- Tvé jméno jako hlavní nadpis stránky.
- Krátký odstavec o tobě – co děláš, co tě baví nebo co se učíš.
- Seznam tvých dovedností, zájmů nebo oblíbených technologií (aspoň 3 položky).
- Kontaktní sekci s odkazem na tvůj e-mail a profil na sociální síti (třeba GitHub nebo LinkedIn).
- Všechny hlavní části stránky (hlavička profilu, hlavní obsah) by měly být zabalené ve správných sémantických značkách.

# --hints--

Stránka má hlavní nadpis (h1) s tvým jménem.

```js
const h1 = document.querySelector('h1');
assert.ok(h1, 'Stránka musí obsahovat element <h1>');
assert.ok(h1.textContent.trim().length > 0, 'Nadpis <h1> nesmí být prázdný');
```

Stránka obsahuje fotku nebo avatara (img) s alternativním textem.

```js
const img = document.querySelector('img');
assert.ok(img, 'Stránka musí obsahovat element <img>');
assert.ok(img.hasAttribute('alt') && img.getAttribute('alt').trim().length > 0, 'Obrázek musí mít neprázdný atribut alt, který ho popisuje');
```

Pod nadpisem je alespoň jeden odstavec textu (p) s tvým představením.

```js
assert.ok(document.querySelector('p'), 'Stránka musí obsahovat alespoň jeden odstavec <p>');
```

Stránka obsahuje neuspořádaný seznam (ul) s tvými dovednostmi nebo zájmy.

```js
const ul = document.querySelector('ul');
assert.ok(ul, 'Stránka musí obsahovat neuspořádaný seznam <ul>');
assert.ok(ul.querySelectorAll('li').length >= 3, 'Seznam by měl mít alespoň 3 položky <li>');
```

Sekce s kontakty obsahuje odkaz na e-mail (s `mailto:`).

```js
const emailLink = document.querySelector('a[href^="mailto:"]');
assert.ok(emailLink, 'Na stránce musí být odkaz <a> s href začínajícím na "mailto:"');
```

Kontaktní sekce obsahuje alespoň jeden další odkaz (např. na GitHub nebo LinkedIn).

```js
const otherLinks = [...document.querySelectorAll('a')].filter(a => !a.href.startsWith('mailto:'));
assert.ok(otherLinks.length >= 1, 'Kromě e-mailu přidej alespoň jeden další odkaz <a> (např. na sociální síť)');
```

Odkazy mají smysluplný text (ne jen "klikni zde" nebo URL adresu).

```js
const links = document.querySelectorAll('a');
assert.ok(links.length > 0, 'Stránka potřebuje odkazy');
links.forEach(link => {
  const text = link.textContent.trim().toLowerCase();
  assert.ok(!text.includes('klikni'), `Odkaz nesmí obsahovat slovo "klikni" (nalezeno: "${link.textContent}")`);
  assert.ok(!text.startsWith('http'), `Text odkazu by neměl být přímo URL adresa (nalezeno: "${link.textContent}")`);
});
```

Obsah je rozdělený do sémantických sekcí (`<header>`, `<main>`, případně `<footer>`).

```js
assert.ok(document.querySelector('main'), 'Stránka by měla mít hlavní obsah obalený ve značce <main>');
assert.ok(document.querySelector('header'), 'Základní info (fotka a jméno) by mělo být v hlavičce <header>');
```

Sekce mimo hlavičku (např. Dovednosti, Kontakt) mají své vlastní podnadpisy (`<h2>`).

```js
assert.ok(document.querySelectorAll('h2').length >= 2, 'Použij alespoň dva nadpisy <h2> pro oddělení sekcí (např. "O mně", "Dovednosti", "Kontakt")');
```

# --help--

## --tip--

Jdi po pořadí: nejdřív kostra dokumentu, pak obsah, nakonec sémantické obaly. Když
nevíš, jakou značku použít, zeptej se, **co ta část je** — ne jak má vypadat. Fotka
a jméno jsou uvození stránky, seznam dovedností je seznam, kontakty jsou vlastní
oddíl s vlastním nadpisem.

## --tip--

Dvě věci, na které se u téhle úlohy nejčastěji zapomíná: obrázek musí mít `alt`, který
ho popisuje (ne „obrázek" ani prázdný řetězec), a text odkazu má říct, kam vede —
„napiš mi" nebo „můj GitHub", ne „klikni zde" a ne vypsaná adresa.

# --approaches--

## --approach-- Kontakty v patičce

Jméno a fotka do `<header>`, text a dovednosti do `<main>`, kontakty do `<footer>`.
Rozvržení, které má většina skutečných webů: patička je místo, kde lidé kontakty
hledají. Testy ji nevyžadují, ale nevadí jí.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Karel Novák — profil</title>
</head>
<body>
  <header>
    <img src="https://picsum.photos/200" alt="Portrét Karla Nováka před panelákem v Brně" width="200" height="200">
    <h1>Karel Novák</h1>
    <p>Začínající webový vývojář z Brna</p>
  </header>

  <main>
    <h2>O mně</h2>
    <p>Rok si po večerech stavím vlastní weby a teď se učím pořádně od základů. Nejvíc mě baví, když z prázdného souboru vznikne něco, co jde poslat kamarádům.</p>

    <h2>Co se učím</h2>
    <ul>
      <li>HTML a sémantická struktura</li>
      <li>CSS a rozvržení stránky</li>
      <li>JavaScript v prohlížeči</li>
      <li>Git a práce s terminálem</li>
    </ul>
  </main>

  <footer>
    <h2>Kontakt</h2>
    <p><a href="mailto:karel.novak@example.com">Napiš mi e-mail</a></p>
    <p><a href="https://github.com/karelnovak">Moje projekty na GitHubu</a></p>
  </footer>
</body>
</html>
```

## --approach-- Sekce místo patičky

Všechno kromě hlavičky leží v `<main>`, rozdělené do `<section>` s vlastními nadpisy,
a kontakty jsou seznam. Hodí se, když je stránka jediná a patička by na ní nic
neoddělovala. Čtečka obrazovky u seznamu předem ohlásí, kolik kontaktů čeká.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Karel Novák — profil</title>
</head>
<body>
  <header>
    <img src="https://picsum.photos/200" alt="Portrét Karla Nováka před panelákem v Brně" width="200" height="200">
    <h1>Karel Novák</h1>
  </header>

  <main>
    <section>
      <h2>O mně</h2>
      <p>Rok si po večerech stavím vlastní weby a teď se učím pořádně od základů. Nejvíc mě baví, když z prázdného souboru vznikne něco, co jde poslat kamarádům.</p>
    </section>

    <section>
      <h2>Co se učím</h2>
      <ul>
        <li>HTML a sémantická struktura</li>
        <li>CSS a rozvržení stránky</li>
        <li>JavaScript v prohlížeči</li>
      </ul>
    </section>

    <section>
      <h2>Kontakt</h2>
      <ul>
        <li><a href="mailto:karel.novak@example.com">Napiš mi e-mail</a></li>
        <li><a href="https://github.com/karelnovak">Moje projekty na GitHubu</a></li>
      </ul>
    </section>
  </main>
</body>
</html>
```

# --review--

## --rubric--

- HTML dokument má správnou hlavičku (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
- Máš nastavený jazyk dokumentu v atributu `<html lang="cs">`.
- Obrázek má výstižný `alt` (např. „Portrét Karla Nováka“, ne „obrázek“ nebo prázdný).
- Odkazy přímo popisují, kam vedou („Můj GitHub profil“, „Napiš mi e-mail“).
- Všechny tagy jsou správně zanořené a uzavřené.

## --extensions--

Klidně si přidej další sekce, například `<table>` se seznamem škol nebo pracovních zkušeností, nebo `<dl>` (description list) pro dvojice „Jazyk“ – „Úroveň“.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Můj profil</title>
</head>
<body>
  <!-- Sem doplň svůj profil -->
</body>
</html>
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Můj profil</title>
</head>
<body>
  <header>
    <img src="https://picsum.photos/200" alt="Portrét Karla Nováka, usmívajícího se vývojáře">
    <h1>Karel Novák</h1>
  </header>
  
  <main>
    <section>
      <h2>O mně</h2>
      <p>Ahoj! Jsem začínající webový vývojář. Baví mě tvořit užitečné aplikace a učit se nové technologie. Mým cílem je stát se full-stack programátorem.</p>
    </section>

    <section>
      <h2>Moje dovednosti</h2>
      <ul>
        <li>HTML5 a sémantika</li>
        <li>Základy CSS</li>
        <li>Tvorba přístupných webů</li>
        <li>Příprava výborné kávy</li>
      </ul>
    </section>
    
    <section>
      <h2>Kontakt</h2>
      <p>Rádi byste se spojili? Napište mi nebo se podívejte na mou práci!</p>
      <ul>
        <li><a href="mailto:karel.novak@example.com">Napiš mi e-mail</a></li>
        <li><a href="https://github.com/karelnovak">Můj GitHub</a></li>
        <li><a href="https://linkedin.com/in/karelnovak">Můj LinkedIn</a></li>
      </ul>
    </section>
  </main>
</body>
</html>
```
