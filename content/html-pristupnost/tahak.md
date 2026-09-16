## Čtyři zkoušky před spuštěním

| zkouška | jak | co hledáš |
|---|---|---|
| klávesnice | odlož myš, Tab a Shift+Tab, Enter, mezerník, Escape | dostaneš se všude, fokus je vidět, pořadí dává smysl, nikde se nezasekneš |
| zvětšení | zoom 200 % a 400 % | nic se nepřekrývá, stránka nejde posouvat do strany |
| čtečka | NVDA, VoiceOver (Cmd+F5), Orca | nadpisy, oblasti, jména tlačítek a odkazů, ohlášení změn |
| DevTools | karta Accessibility, Contrast ratio u barvy | Name, Role, stav; kontrast 4,5 : 1 (velký text 3 : 1) |

## Který prvek

| potřebuješ | použij | ne |
|---|---|---|
| přejít jinam | `<a href="…">` | `div` s `onclick`, `a` bez `href` |
| akci na stránce | `<button type="button">` | `div`, `span`, `role="button"` |
| odeslat formulář | `<button>` ve formuláři (bez `type`) | odkaz nebo `div` s `requestSubmit()` |
| hlavní nadpis | jeden `<h1>`, pod ním `h2`, `h3` bez přeskakování | `div class="title"`, úroveň podle velikosti |
| oblasti stránky | `header`, `nav`, `main` (jen jeden), `footer` | `div class="header"` |
| rozbalení | `<details>` a `<summary>` | vlastní tlačítko, když nepotřebuješ vlastní chování |
| dialog | `<dialog>` a `showModal()` | `div role="dialog"` bez obsluhy fokusu |

## Odkud se bere přístupné jméno

Vyhrává první zdroj, který něco dá:

1. `aria-labelledby="id"` — text jiného prvku
2. `aria-label="…"`
3. nativní popisek: `<label for>`, `alt`, `<legend>`, `<caption>`
4. obsah prvku (tlačítko, odkaz, nadpis) včetně `alt` obrázků uvnitř
5. `title`, `placeholder` — jen poslední záchrana

## `alt` podle účelu obrázku

| obrázek | `alt` |
|---|---|
| nese informaci (produkt, graf, banner s textem) | co z něj má uživatel vědět |
| zdobí nebo opakuje text vedle | `alt=""` |
| jediný obsah odkazu nebo tlačítka | kam odkaz vede, co tlačítko udělá |

## `tabindex`

| hodnota | Tab | `focus()` | kdy |
|---|---|---|---|
| bez atributu | jen interaktivní prvky | jen interaktivní prvky | skoro vždy |
| `0` | ano, v pořadí DOM | ano | vlastní ovládací prvek (vzácně) |
| `-1` | ne | ano | cíl skriptu nebo odkazu „Přeskočit na obsah" |
| `1` a víc | před vším ostatním | ano | nikdy |

## Skrývání

| zápis | oči | čtečka | fokus |
|---|---|---|---|
| `hidden`, `display: none` | ne | ne | ne |
| `.visually-hidden` | ne | ano | ano |
| `aria-hidden="true"` | ano | ne | ano, proto ne na ovládací prvky |
| `inert` | ano | ne | ne |

## Vzory

Odkaz „Přeskočit na obsah":

```html
<body>
  <a class="skip-link" href="#main">Přeskočit na obsah</a>
  <header>…</header>
  <main id="main" tabindex="-1">…</main>
</body>
```

```css
.skip-link { position: absolute; top: -4rem; left: 1rem; }
.skip-link:focus { top: 0; }
```

Viditelný fokus:

```css
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```

Text jen pro čtečku:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

Ikonové tlačítko:

```html
<button type="button">
  <svg aria-hidden="true">…</svg>
  <span class="visually-hidden">Zavřít oznámení</span>
</button>
```

Rozbalovací tlačítko se stavem:

```js
toggle.addEventListener('click', () => {
  panel.hidden = !panel.hidden;
  toggle.setAttribute('aria-expanded', String(!panel.hidden));
});
```

Nápověda pole a oznámení:

```html
<label for="password">Heslo</label>
<input id="password" type="password" aria-describedby="password-hint">
<p id="password-hint">Aspoň 12 znaků.</p>

<p class="status" role="status"></p>
```

Aktuální stránka v menu:

```html
<nav aria-label="Hlavní menu">
  <a href="index.html" aria-current="page">Úvod</a>
  <a href="projekty.html">Projekty</a>
</nav>
```

## Pasti

- `outline: none` na `:focus` bez náhrady — uživatel klávesnice neví, kde je.
- Placeholder místo popisku — po prvním písmenu zmizí a nemá spolehlivé jméno.
- `aria-label`, který se liší od viditelného textu — hlasové ovládání prvek nenajde.
- `aria-label` na `div` nebo `span` — role `generic` jméno nedostává.
- Kladný `tabindex` — prvek předběhne celou stránku.
- `role="menu"` na navigaci webu — čtečka čeká šipky.
- `aria-hidden` na prvku s fokusem — Tab na něj dojde, čtečka mlčí.
- Živá oblast vložená až se zprávou — čtečka ji často neohlásí.
- `aria-expanded`, které se nemění — čtečka tvrdí „sbaleno", i když je otevřeno.
- Barva jako jediný nositel informace — k barvě patří text.
- Automatický audit bez ruční zkoušky — stroj najde jen část chyb.
