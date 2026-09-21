---
title: Kontaktní formulář
runtime: dom
see: html-formulare/jak-funguje-formular, html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy, html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy
---

# --description--

Kontaktní formulář má skoro každý web a skoro každý ho má aspoň trochu špatně: popisek
jen jako text vedle pole, `placeholder` místo popisku, povinná hvězdička, kterou čtečka
obrazovky nepřečte. Tenhle napíšeš pořádně — a bez jediného řádku JavaScriptu.

**Téma je tvoje.** Kadeřnictví, kapela, servis kol, herní server — cokoli, kde dává
smysl napsat majiteli zprávu. Texty, nadpis i barvy si uprav podle sebe; testy kontrolují
stavbu a chování, ne obsah.

## Co má formulář umět

- Odeslat se metodou `POST` na `/kontakt/odeslat` — **bez JavaScriptu**, jen HTML.
- Sbírat jméno, e-mail, telefon (nepovinně), předmět z nabídky, zprávu a souhlas
  se zpracováním údajů.
- Mít u každého pole popisek, na který se dá kliknout a fokus skočí do pole.
- Vyžadovat, co je povinné, a hlídat tvar e-mailu i délku zprávy.
- Obarvit vadné pole červeně, **ale až potom**, co do něj někdo sáhl nebo zkusil odeslat.
- Seskupit související pole tak, aby čtečka obrazovky ohlásila, k čemu skupina patří.

Stylopis `styles.css` máš připravený — barvy, rozestupy i stav `:focus-visible` v něm
jsou. Chybí v něm jen pravidlo pro vadné pole, to dopíšeš.

> [!TIP]
> Než začneš psát, projdi si formulář jen tabulátorem. Kam skáče fokus? Je poznat, kde
> je? Dá se formulář odeslat z klávesnice? Co nefunguje tobě, nebude fungovat nikomu.

# --hints--

Formulář se odesílá metodou POST na správnou adresu.

```js
const form = document.querySelector('form');
assert.ok(form, 'Na stránce chybí <form>');
assert.equal(form.method.toUpperCase(), 'POST', `Metoda je ${form.method.toUpperCase()} — zpráva se má odesílat metodou POST`);
assert.equal(form.getAttribute('action'), '/kontakt/odeslat', `Cíl odeslání je „${form.getAttribute('action')}" — má být /kontakt/odeslat`);
```

Pole jméno je povinné, má vlastní jméno a popisek spárovaný přes `for` a `id`.

```js
const pole = document.querySelector('input[name="jmeno"]');
assert.ok(pole, 'Chybí pole s name="jmeno"');
assert.ok(pole.required, 'Pole jméno má být povinné (atribut required)');
assert.ok(pole.id, 'Pole jméno nemá id, takže se k němu nedá spárovat popisek');
const label = document.querySelector(`label[for="${pole.id}"]`);
assert.ok(label, 'K poli jméno chybí <label> s atributem for');
assert.ok(label.textContent.trim().length > 1, 'Popisek pole jméno je prázdný');
```

Pole e-mail má typ, který hlídá tvar adresy, a je povinné.

```js
const pole = document.querySelector('input[name="email"]');
assert.ok(pole, 'Chybí pole s name="email"');
assert.equal(pole.type, 'email', `Pole e-mail má type="${pole.type}" — má být email, aby prohlížeč hlídal tvar adresy`);
assert.ok(pole.required, 'Pole e-mail má být povinné');
assert.ok(document.querySelector(`label[for="${pole.id}"]`), 'K poli e-mail chybí <label> s atributem for');
```

Pole telefon má typ pro telefonní číslo a povinné není.

```js
const pole = document.querySelector('input[name="telefon"]');
assert.ok(pole, 'Chybí pole s name="telefon"');
assert.equal(pole.type, 'tel', `Pole telefon má type="${pole.type}" — má být tel, ať dostane uživatel na mobilu číselnou klávesnici`);
assert.ok(!pole.required, 'Telefon je nepovinný — atribut required na něm být nemá');
assert.ok(document.querySelector(`label[for="${pole.id}"]`), 'K poli telefon chybí <label> s atributem for');
```

Předmět se vybírá z nabídky aspoň tří možností a má popisek.

```js
const select = document.querySelector('select[name="predmet"]');
assert.ok(select, 'Chybí nabídka s name="predmet" (prvek <select>)');
const moznosti = [...select.querySelectorAll('option')].filter((o) => o.value !== '');
assert.ok(moznosti.length >= 3, `Nabídka má ${moznosti.length} možností s hodnotou — mají být aspoň tři`);
assert.ok(document.querySelector(`label[for="${select.id}"]`), 'K nabídce chybí <label> s atributem for');
```

Zpráva je víceřádkové pole, je povinná a má hlídanou minimální délku.

```js
const pole = document.querySelector('textarea[name="zprava"]');
assert.ok(pole, 'Chybí pole s name="zprava" — na delší text se používá <textarea>');
assert.ok(pole.required, 'Pole zpráva má být povinné');
const min = Number(pole.getAttribute('minlength'));
assert.ok(min >= 10, `Pole zpráva má minlength="${pole.getAttribute('minlength') ?? ''}" — dej mu aspoň 10, ať nechodí prázdné zprávy`);
assert.ok(document.querySelector(`label[for="${pole.id}"]`), 'K poli zpráva chybí <label> s atributem for');
```

Souhlas se zpracováním údajů je zaškrtávátko, je povinný a má popisek.

```js
const pole = document.querySelector('input[type="checkbox"][name="souhlas"]');
assert.ok(pole, 'Chybí zaškrtávátko s name="souhlas"');
assert.ok(pole.required, 'Souhlas má být povinný — bez něj se formulář odeslat nemá');
const label = document.querySelector(`label[for="${pole.id}"]`);
assert.ok(label, 'K souhlasu chybí <label> s atributem for');
assert.ok(label.textContent.trim().length > 10, 'Popisek souhlasu má říct, s čím uživatel souhlasí, ne jen „Souhlasím"');
```

Kontaktní údaje jsou seskupené a skupina má vlastní popis.

```js
const skupina = document.querySelector('form fieldset');
assert.ok(skupina, 'Pole nejsou seskupená — použij <fieldset>');
const legenda = skupina.querySelector('legend');
assert.ok(legenda, 'Skupina <fieldset> nemá <legend>, takže čtečka neřekne, k čemu pole patří');
assert.ok(legenda.textContent.trim().length > 2, '<legend> je prázdná');
assert.ok(skupina.querySelector('input[name="jmeno"]') && skupina.querySelector('input[name="email"]'), 'Do skupiny patří aspoň jméno a e-mail');
```

Žádný popisek není nahrazený atributem `placeholder`.

```js
for (const pole of document.querySelectorAll('input, select, textarea')) {
  if (pole.type === 'submit' || pole.type === 'hidden') continue;
  const label = pole.id ? document.querySelector(`label[for="${pole.id}"]`) : null;
  const uvnitr = pole.closest('label');
  assert.ok(label || uvnitr, `Pole ${pole.name || pole.type} nemá popisek. Placeholder ho nenahradí — zmizí, jakmile uživatel začne psát.`);
}
```

Formulář jde odeslat a odesílací tlačítko má smysluplný text.

```js
const tlacitko = document.querySelector('form button, form input[type="submit"]');
assert.ok(tlacitko, 'Ve formuláři chybí odesílací tlačítko');
const typ = tlacitko.getAttribute('type');
assert.ok(typ === null || typ === 'submit', `Tlačítko má type="${typ}" — odesílací tlačítko má být submit (nebo bez type, to je výchozí)`);
const text = (tlacitko.textContent || tlacitko.value).replace(/\s+/g, ' ').trim();
assert.ok(text.length >= 4, 'Text tlačítka je prázdný nebo moc krátký');
assert.ok(!/^(ok|odeslat)$/i.test(text), `Text „${text}" nic neříká — napiš, co se stane, třeba „Odeslat zprávu"`);
```

Vadné pole se obarví až poté, co do něj uživatel sáhl.

```js
const css = files['styles.css'];
assert.match(css, /:user-invalid/, 'V styles.css chybí pravidlo s pseudotřídou :user-invalid');
assert.ok(!/(^|[^-]):invalid\s*[,{]/m.test(css), 'V styles.css je pravidlo pro :invalid — to obarví prázdný formulář hned po načtení. Použij jen :user-invalid.');
const pravidlo = /([^{}]*:user-invalid[^{}]*)\{([^}]*)\}/.exec(css);
assert.ok(pravidlo, 'Pravidlo s :user-invalid se nepodařilo přečíst');
assert.match(pravidlo[1], /input|select|textarea/, `Pravidlo míří na „${pravidlo[1].trim()}" — má obarvit pole formuláře (input, select, textarea)`);
assert.match(pravidlo[2], /border-color|background|outline/, 'Pravidlo pro vadné pole nic viditelně nemění — nastav mu barvu rámečku nebo pozadí');
```

Stránka je v češtině, má titulek a hlavní nadpis.

```js
assert.match(document.documentElement.getAttribute('lang') ?? '', /^cs/i, '<html> má mít lang="cs"');
assert.ok(document.title.trim().length > 3, '<title> je prázdný nebo moc krátký');
assert.ok(document.title.trim() !== 'Napište nám', 'Titulek je ze šablony — napiš do něj, čí web to je');
const h1 = document.querySelectorAll('h1');
assert.equal(h1.length, 1, `Na stránce je ${h1.length} prvků <h1> — má být právě jeden`);
```

# --help--

## --tip--

Jak se popisek spáruje s polem a proč `placeholder` nestačí, je v lekci
[Jak funguje formulář](see:html-formulare/jak-funguje-formular).

## --tip--

Na obarvení vadného pole až po interakci je pseudotřída z části
[CSS a validace](see:html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy).
Pravidlo patří do `styles.css`, ne do HTML.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Napište nám</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>
      <h1>Napište nám</h1>
      <p class="lead">Ozveme se do dvou pracovních dnů.</p>

      <!-- Sem napiš formulář. Téma, texty i nabídku předmětů si uprav podle sebe. -->

    </main>
  </body>
</html>
```

## --file-- styles.css

```css
/* Vzhled máš hotový. Chybí jen pravidlo pro vadné pole — to dopiš na konec souboru. */
:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --ink: #17212b;
  --ink-soft: #5a6674;
  --accent: #1f6f8b;
  --line: #d7dde3;
  --chyba: #c62828;
  --chyba-bg: #fdecea;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 2.5rem 1.25rem 4rem;
  font-family: system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--ink);
  background: var(--bg);
}

main { max-width: 34rem; margin-inline: auto; }
h1 { margin: 0 0 0.35rem; font-size: clamp(1.75rem, 5vw, 2.25rem); line-height: 1.15; }
.lead { margin: 0 0 1.75rem; color: var(--ink-soft); }

form {
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}

fieldset { margin: 0 0 1.25rem; padding: 1rem 1.15rem 1.25rem; border: 1px solid var(--line); border-radius: 0.5rem; }
legend { padding-inline: 0.4rem; font-weight: 700; }

label { display: block; margin-bottom: 0.3rem; font-weight: 600; }
input, select, textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--line);
  border-radius: 0.4rem;
  background: #fff;
  font: inherit;
  color: inherit;
  transition: border-color 0.15s, background-color 0.15s;
}
textarea { min-height: 8rem; resize: vertical; }
input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}

.pole { margin-bottom: 1rem; }
.napoveda { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.875rem; }

/* Zaškrtávátko má popisek vedle sebe, ne nad sebou. */
.souhlas { display: flex; gap: 0.6rem; align-items: start; margin-bottom: 1.25rem; }
.souhlas input { width: auto; margin-top: 0.3rem; }
.souhlas label { margin: 0; font-weight: 400; }

button {
  padding: 0.6rem 1.4rem;
  border: 0;
  border-radius: 0.4rem;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: #185a71; }
button:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }

/* --- Sem přijde pravidlo pro vadné pole --- */
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Napište nám — Servis kol Řetěz</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>
      <h1>Napište nám</h1>
      <p class="lead">Ozveme se do dvou pracovních dnů.</p>

      <form action="/kontakt/odeslat" method="post">
        <fieldset>
          <legend>Kontakt na vás</legend>

          <div class="pole">
            <label for="jmeno">Jméno a příjmení</label>
            <input type="text" id="jmeno" name="jmeno" autocomplete="name" required>
          </div>

          <div class="pole">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" autocomplete="email" required>
            <p class="napoveda">Na tuhle adresu vám pošleme odpověď.</p>
          </div>

          <div class="pole">
            <label for="telefon">Telefon (nepovinné)</label>
            <input type="tel" id="telefon" name="telefon" autocomplete="tel">
          </div>
        </fieldset>

        <div class="pole">
          <label for="predmet">Čeho se zpráva týká</label>
          <select id="predmet" name="predmet" required>
            <option value="">Vyberte…</option>
            <option value="servis">Objednání do servisu</option>
            <option value="bazar">Kolo z bazaru</option>
            <option value="reklamace">Reklamace</option>
            <option value="jine">Něco jiného</option>
          </select>
        </div>

        <div class="pole">
          <label for="zprava">Zpráva</label>
          <textarea id="zprava" name="zprava" minlength="20" required></textarea>
          <p class="napoveda">Napište aspoň pár vět — čím víc víme, tím líp poradíme.</p>
        </div>

        <div class="souhlas">
          <input type="checkbox" id="souhlas" name="souhlas" required>
          <label for="souhlas">Souhlasím se zpracováním uvedených údajů za účelem odpovědi na tuto zprávu.</label>
        </div>

        <button>Odeslat zprávu</button>
      </form>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
/* Vzhled máš hotový. Chybí jen pravidlo pro vadné pole — to dopiš na konec souboru. */
:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --ink: #17212b;
  --ink-soft: #5a6674;
  --accent: #1f6f8b;
  --line: #d7dde3;
  --chyba: #c62828;
  --chyba-bg: #fdecea;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 2.5rem 1.25rem 4rem;
  font-family: system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--ink);
  background: var(--bg);
}

main { max-width: 34rem; margin-inline: auto; }
h1 { margin: 0 0 0.35rem; font-size: clamp(1.75rem, 5vw, 2.25rem); line-height: 1.15; }
.lead { margin: 0 0 1.75rem; color: var(--ink-soft); }

form {
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}

fieldset { margin: 0 0 1.25rem; padding: 1rem 1.15rem 1.25rem; border: 1px solid var(--line); border-radius: 0.5rem; }
legend { padding-inline: 0.4rem; font-weight: 700; }

label { display: block; margin-bottom: 0.3rem; font-weight: 600; }
input, select, textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--line);
  border-radius: 0.4rem;
  background: #fff;
  font: inherit;
  color: inherit;
  transition: border-color 0.15s, background-color 0.15s;
}
textarea { min-height: 8rem; resize: vertical; }
input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}

.pole { margin-bottom: 1rem; }
.napoveda { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.875rem; }

/* Zaškrtávátko má popisek vedle sebe, ne nad sebou. */
.souhlas { display: flex; gap: 0.6rem; align-items: start; margin-bottom: 1.25rem; }
.souhlas input { width: auto; margin-top: 0.3rem; }
.souhlas label { margin: 0; font-weight: 400; }

button {
  padding: 0.6rem 1.4rem;
  border: 0;
  border-radius: 0.4rem;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: #185a71; }
button:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }

/* --- Sem přijde pravidlo pro vadné pole --- */
input:user-invalid,
select:user-invalid,
textarea:user-invalid {
  border-color: var(--chyba);
  background: var(--chyba-bg);
}
```

# --approaches--

## --approach-- Popisek jako obal pole

Popisek nemusí mít `for` — když pole leží **uvnitř** `<label>`, spárují se samy. Ušetří
to `id` u každého pole, ale hůř se stylují (text a pole jsou v jednom prvku) a u složených
popisků se hůř hledá, co k čemu patří. Testy obě varianty berou.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Napište nám — Kadeřnictví Vlna</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>
      <h1>Napište nám</h1>
      <p class="lead">Ozveme se do dvou pracovních dnů.</p>

      <form action="/kontakt/odeslat" method="post">
        <fieldset>
          <legend>Kontakt na vás</legend>

          <div class="pole">
            <label for="jmeno">Jméno a příjmení</label>
            <input type="text" id="jmeno" name="jmeno" autocomplete="name" required>
          </div>

          <div class="pole">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" autocomplete="email" required>
          </div>

          <div class="pole">
            <label for="telefon">Telefon (nepovinné)</label>
            <input type="tel" id="telefon" name="telefon" autocomplete="tel">
          </div>
        </fieldset>

        <div class="pole">
          <label for="predmet">Čeho se zpráva týká</label>
          <select id="predmet" name="predmet" required>
            <option value="">Vyberte…</option>
            <option value="objednani">Objednání termínu</option>
            <option value="zmena">Změna termínu</option>
            <option value="ceny">Dotaz na ceny</option>
          </select>
        </div>

        <div class="pole">
          <label for="zprava">Zpráva</label>
          <textarea id="zprava" name="zprava" minlength="20" required></textarea>
        </div>

        <div class="souhlas">
          <input type="checkbox" id="souhlas" name="souhlas" required>
          <label for="souhlas">Souhlasím se zpracováním uvedených údajů za účelem odpovědi na tuto zprávu.</label>
        </div>

        <button>Odeslat zprávu</button>
      </form>
    </main>
  </body>
</html>
```

### --file-- styles.css

```css
/* Vzhled máš hotový. Chybí jen pravidlo pro vadné pole — to dopiš na konec souboru. */
:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --ink: #17212b;
  --ink-soft: #5a6674;
  --accent: #1f6f8b;
  --line: #d7dde3;
  --chyba: #c62828;
  --chyba-bg: #fdecea;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 2.5rem 1.25rem 4rem;
  font-family: system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--ink);
  background: var(--bg);
}

main { max-width: 34rem; margin-inline: auto; }
h1 { margin: 0 0 0.35rem; font-size: clamp(1.75rem, 5vw, 2.25rem); line-height: 1.15; }
.lead { margin: 0 0 1.75rem; color: var(--ink-soft); }

form {
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}

fieldset { margin: 0 0 1.25rem; padding: 1rem 1.15rem 1.25rem; border: 1px solid var(--line); border-radius: 0.5rem; }
legend { padding-inline: 0.4rem; font-weight: 700; }

label { display: block; margin-bottom: 0.3rem; font-weight: 600; }
input, select, textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--line);
  border-radius: 0.4rem;
  background: #fff;
  font: inherit;
  color: inherit;
  transition: border-color 0.15s, background-color 0.15s;
}
textarea { min-height: 8rem; resize: vertical; }
input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}

.pole { margin-bottom: 1rem; }
.napoveda { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.875rem; }

/* Zaškrtávátko má popisek vedle sebe, ne nad sebou. */
.souhlas { display: flex; gap: 0.6rem; align-items: start; margin-bottom: 1.25rem; }
.souhlas input { width: auto; margin-top: 0.3rem; }
.souhlas label { margin: 0; font-weight: 400; }

button {
  padding: 0.6rem 1.4rem;
  border: 0;
  border-radius: 0.4rem;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: #185a71; }
button:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }

/* --- Sem přijde pravidlo pro vadné pole --- */
input:user-invalid,
select:user-invalid,
textarea:user-invalid {
  border-color: var(--chyba);
  background: var(--chyba-bg);
}
```

## --approach-- Dvě skupiny místo jedné

Formulář se dá rozdělit na dvě skupiny — „kdo píše" a „o co jde". Na delších formulářích
(objednávka, registrace) je to čitelnější a čtečka obrazovky u každého pole ohlásí,
do které části patří. U šesti polí je to na hranici; u dvanácti už to má smysl vždy.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Napište nám — Herní server Kostka</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>
      <h1>Napište nám</h1>
      <p class="lead">Ozveme se do dvou pracovních dnů.</p>

      <form action="/kontakt/odeslat" method="post">
        <fieldset>
          <legend>Kdo píše</legend>

          <div class="pole">
            <label for="jmeno">Jméno nebo přezdívka ve hře</label>
            <input type="text" id="jmeno" name="jmeno" autocomplete="name" required>
          </div>

          <div class="pole">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" autocomplete="email" required>
          </div>

          <div class="pole">
            <label for="telefon">Telefon (nepovinné)</label>
            <input type="tel" id="telefon" name="telefon" autocomplete="tel">
          </div>
        </fieldset>

        <fieldset>
          <legend>O co jde</legend>

          <div class="pole">
            <label for="predmet">Čeho se zpráva týká</label>
            <select id="predmet" name="predmet" required>
              <option value="">Vyberte…</option>
              <option value="ban">Odvolání proti banu</option>
              <option value="chyba">Nahlášení chyby</option>
              <option value="napad">Nápad na server</option>
            </select>
          </div>

          <div class="pole">
            <label for="zprava">Zpráva</label>
            <textarea id="zprava" name="zprava" minlength="20" required></textarea>
          </div>
        </fieldset>

        <div class="souhlas">
          <input type="checkbox" id="souhlas" name="souhlas" required>
          <label for="souhlas">Souhlasím se zpracováním uvedených údajů za účelem odpovědi na tuto zprávu.</label>
        </div>

        <button>Odeslat zprávu</button>
      </form>
    </main>
  </body>
</html>
```

### --file-- styles.css

```css
/* Vzhled máš hotový. Chybí jen pravidlo pro vadné pole — to dopiš na konec souboru. */
:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --ink: #17212b;
  --ink-soft: #5a6674;
  --accent: #1f6f8b;
  --line: #d7dde3;
  --chyba: #c62828;
  --chyba-bg: #fdecea;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 2.5rem 1.25rem 4rem;
  font-family: system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--ink);
  background: var(--bg);
}

main { max-width: 34rem; margin-inline: auto; }
h1 { margin: 0 0 0.35rem; font-size: clamp(1.75rem, 5vw, 2.25rem); line-height: 1.15; }
.lead { margin: 0 0 1.75rem; color: var(--ink-soft); }

form {
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}

fieldset { margin: 0 0 1.25rem; padding: 1rem 1.15rem 1.25rem; border: 1px solid var(--line); border-radius: 0.5rem; }
legend { padding-inline: 0.4rem; font-weight: 700; }

label { display: block; margin-bottom: 0.3rem; font-weight: 600; }
input, select, textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--line);
  border-radius: 0.4rem;
  background: #fff;
  font: inherit;
  color: inherit;
  transition: border-color 0.15s, background-color 0.15s;
}
textarea { min-height: 8rem; resize: vertical; }
input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}

.pole { margin-bottom: 1rem; }
.napoveda { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.875rem; }

/* Zaškrtávátko má popisek vedle sebe, ne nad sebou. */
.souhlas { display: flex; gap: 0.6rem; align-items: start; margin-bottom: 1.25rem; }
.souhlas input { width: auto; margin-top: 0.3rem; }
.souhlas label { margin: 0; font-weight: 400; }

button {
  padding: 0.6rem 1.4rem;
  border: 0;
  border-radius: 0.4rem;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: #185a71; }
button:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }

/* --- Sem přijde pravidlo pro vadné pole --- */
input:user-invalid,
select:user-invalid,
textarea:user-invalid {
  border-color: var(--chyba);
  background: var(--chyba-bg);
}
```

# --review--

Testy kontrolují stavbu. Jestli se formulář dá **použít**, zkontroluj sám.

## --rubric--

- Prošel jsem formulář jen tabulátorem: fokus jde v rozumném pořadí, všude je vidět
  a z posledního pole se dostanu na tlačítko.
- Kliknul jsem na každý popisek — fokus pokaždé skočil do správného pole.
- Odeslal jsem prázdný formulář: prohlížeč zastavil u prvního vadného pole a řekl proč.
- Po načtení stránky nesvítí červeně nic.
- Popisky říkají, co do pole patří, a ne jen jméno pole („Jméno a příjmení",
  ne „jmeno"). U souhlasu je napsané, s čím uživatel souhlasí.
- Na šířce 375 px se formulář vejde, nikde se nic nepřekrývá a nemusím rolovat do stran.
- Texty jsou moje a dávají dohromady smysl pro jeden konkrétní web.

## --extensions--

- Přidej k telefonu atribut `pattern` na český formát a napiš k němu srozumitelnou
  nápovědu, co se od uživatele čeká.
- Doplň pole pro přílohu (`type="file"`) a omez, jaké typy souborů přijme.
- Přidej výběr, jak se má zákazník ozvat zpátky (e-mail / telefon) přes skupinu
  přepínačů `type="radio"` ve vlastním `<fieldset>` s `<legend>`.
- Doplň `autocomplete` i u zbylých polí a vyzkoušej, jestli ti prohlížeč formulář
  vyplní sám — na mobilu to je rozdíl mezi „odeslal" a „vzdal to".
