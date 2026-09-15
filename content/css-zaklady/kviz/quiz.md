---
pass: 0.8
---

# --questions--

## --question--

Kterým odkazům v menu dá tohle pravidlo barvu?

```html
<ul class="menu">
  <li><a href="/">Domů</a></li>
  <li><a href="/blog">Blog</a></li>
  <li><a href="/kontakt">Kontakt</a></li>
</ul>
```

```css
.menu a:first-child {
  color: #be123c;
}
```

### --answer--

Jen odkazu „Domů", protože je první v menu.

#### --why--

Myslíš si, že `:first-child` počítá pořadí v celém menu? Počítá pořadí mezi sourozenci uvnitř vlastního rodiče.

### --correct--

Všem třem.

#### --why--

Každý odkaz leží ve vlastním `<li>` a v něm je prvním (a jediným) dítětem. `:first-child` tedy platí pro všechny tři. První položku menu by vybral selektor `.menu li:first-child a`.

### --answer--

Žádnému, `:first-child` nejde použít na odkaz.

#### --why--

Pseudotřídy podle pozice fungují na jakémkoli prvku. Rozhoduje, kolikátým dítětem svého rodiče prvek je.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-podle-pozice

## --question--

Seznam má deset položek `<li>`. Kolik z nich vybere `li:nth-child(3n)`?

### --expected--

3

### --accept--

tři

### --why--

Za `n` se dosazuje 1, 2, 3…, takže vzorec dá pozice 3, 6, 9 a 12. Dvanáctá položka v seznamu není, zbudou tři.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-podle-pozice

## --question--

Stránka má výchozí písmo 16 px. Kolik pixelů bude vnitřní odsazení nadpisu vlevo?

```css
.card {
  font-size: 0.875rem;
}

.card__title {
  font-size: 2em;
  padding-inline: 1rem;
}
```

### --expected--

16

### --accept--

16px
16 px

### --why--

Nadpis má písmo 2 × 14 px = 28 px, ale odsazení je v `rem`, a to se počítá z kořene stránky, ne z písma nadpisu ani karty. `1rem` je pořád 16 px. Kdyby odsazení bylo `1em`, bylo by 28 px.

### --see--

css-zaklady/jednotky-a-hodnoty#rem-nasobek-korene-stranky

## --question--

Kontejner je široký 900 px a výchozí písmo stránky je 16 px. Kolik pixelů bude široký prvek s `width: calc(100% / 3 - 2rem)`?

### --expected--

268

### --accept--

268px
268 px

### --why--

Třetina z 900 px je 300 px a `2rem` je 32 px, takže 300 − 32 = 268 px. Dělení číslem v `calc()` smí být a kolem `-` jsou mezery, výraz je platný.

### --see--

css-zaklady/jednotky-a-hodnoty#calc-pocitani-s-ruznymi-jednotkami

## --question--

Odstavec má obě třídy `class="price price--big"` a leží přímo v `body` s výchozím písmem 16 px. Jakou hodnotu `font-size` ukáže u odstavce panel Computed?

```css
.price {
  font-size: 1.25rem;
}

.price--big {
  font-size: 150%;
}
```

### --expected--

24px

### --accept--

24 px
24

### --why--

Obě pravidla mají stejně silný selektor, takže vyhraje pozdější `150%`. Procenta u `font-size` se ale počítají z písma **rodiče** (16 px), ne z přebitých `1.25rem`: 1,5 × 16 = 24 px. V Computed je vidět převedená hodnota v pixelech.

### --see--

css-zaklady/devtools-pro-css#computed-spoctena-hodnota-a-odkud-prisla

## --question--

V panelu Styles je u odkazu `<a>` deklarace `width: 12rem` bledá s ikonou ⓘ. Co to znamená?

### --answer--

Hodnota `12rem` je neplatná a prohlížeč ji zahodil.

#### --why--

Neplatnou deklaraci DevTools přeškrtnou a dají k ní ikonu varování. Bledá deklarace s ⓘ je platná.

### --answer--

Jiné pravidlo nastavilo šířku odkazu a tahle deklarace prohrála.

#### --why--

Přebitá deklarace je přeškrtnutá a vítěz je vidět nad ní. Bledá s ⓘ nikomu neprohrála.

### --correct--

Deklarace platí, ale na řádkový prvek, jako je odkaz, nemá šířka účinek. Ikona napíše proč.

#### --why--

Neaktivní deklarace je platná a vyhrála, jen ji prvek neumí použít. Odkaz je ve výchozím stavu řádkový a šířku nebere, k tomu se dostaneš v sekci o box modelu.

### --see--

css-zaklady/devtools-pro-css#panel-styles-co-plati-a-co-je-preskrtnute

## --question--

Kolik pixelů bude výška řádku mezititulku?

```css
.article {
  font-size: 16px;
  line-height: 150%;
}

.article h2 {
  font-size: 32px;
}
```

### --expected--

24

### --accept--

24px
24 px

### --why--

Procenta se u `line-height` spočítají na pixely už na `.article`: 150 % z 16 px = 24 px. Mezititulek zdědí hotových 24 px, i když má písmo 32 px, a jeho řádky se překrývají. S `line-height: 1.5` bez jednotky by zdědil násobek a měl 48 px.

### --see--

css-zaklady/workshop-vizitka/013

## --question--

Napiš zkratku `border`, která kolem prvku nakreslí plnou čáru širokou 2 px v barvě `#0f766e`.

### --expected--

border: 2px solid #0f766e

### --accept--

border: solid 2px #0f766e
border: 2px #0f766e solid
border: #0f766e 2px solid
border: #0f766e solid 2px
border: solid #0f766e 2px

### --why--

Zkratka bere tloušťku, styl a barvu v libovolném pořadí. Styl je povinný: bez `solid` má rámeček styl `none` a není vidět, i když tloušťka i barva jsou nastavené.

### --see--

css-zaklady/workshop-vizitka/005

## --question--

Nadpis má `font-size: clamp(1rem, 2.5vw, 1.5rem)` a okno je široké 800 px. Kolik pixelů bude mít písmo při výchozí velikosti písma?

### --expected--

20

### --accept--

20px
20 px

### --why--

2,5 % z 800 px je 20 px. To je víc než minimum 16 px a míň než maximum 24 px, takže `clamp()` použije prostřední hodnotu beze změny.

### --see--

css-zaklady/jednotky-a-hodnoty#min-max-a-clamp

## --question--

Odstavec s recenzí má na počítači dvanáct řádků a ty mu v Chromu dáš `text-wrap: balance`. Co se stane?

### --answer--

Všech dvanáct řádků bude stejně dlouhých.

#### --why--

Myslíš si, že vyrovnání funguje na jakkoli dlouhý text? Prohlížeče ho kvůli výkonu omezují na pár řádků.

### --correct--

Nic, Chrome vyrovnává jen text do šesti řádků a u delšího hodnotu tiše nepoužije.

#### --why--

`balance` je na krátké nadpisy a popisky. Na konec dlouhého odstavce bez osamoceného slova se hodí `text-wrap: pretty`.

### --answer--

Deklarace je neplatná a v DevTools bude přeškrtnutá.

#### --why--

Hodnota `balance` je platná a DevTools ji nepřeškrtnou. Omezení je v tom, na jak dlouhý text ji prohlížeč použije.

### --see--

css-zaklady/workshop-typografie/009

## --question--

Jedna deklarace v tomhle pravidle se zahodí. Napiš jméno její vlastnosti.

```css
.alert {
  color: #b91c1c;
  padding: 1rem 1.5rem;
  border-radius: .5 rem;
}
```

### --expected--

border-radius

### --why--

Mezi číslem a jednotkou nesmí být mezera. `.5 rem` jsou pro prohlížeč dva kousky — číslo bez jednotky a slovo `rem` — a to není platná délka. Zápis `.5rem` bez nuly před tečkou platný je.

### --see--

css-zaklady/jak-css-funguje#neplatna-deklarace-se-tise-zahodi

## --question--

Jakou barvu bude mít text odstavce v `<main>`?

```html
<header class="site-header">…</header>
<main>
  <p class="intro">Vítej na webu</p>
</main>
```

```css
.site-header {
  --brand: #1d4ed8;
}

.intro {
  color: var(--brand, crimson);
}
```

### --answer--

Modrou `#1d4ed8`, protože proměnná je definovaná ve stylopisu výš.

#### --why--

Myslíš si, že vlastní vlastnost platí všude, kde je napsaná ve stylopisu? Platí jen na prvku, kterému ji pravidlo nastaví, a u jeho potomků.

### --correct--

Karmínovou ze záložní hodnoty.

#### --why--

`<main>` není potomkem hlavičky, takže `--brand` pro odstavec definovaná není, a použije se záložní hodnota. Kdyby měla platit všude, patří na `:root`.

### --answer--

Výchozí černou, protože `var()` s nedefinovanou proměnnou deklaraci zneplatní.

#### --why--

Právě pro nedefinovanou proměnnou je tu druhý argument `var()`. Zneplatní se jen deklarace s definovanou proměnnou, jejíž hodnota do vlastnosti nepasuje.

### --see--

css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

## --question--

Grafikovi vadí obrys kolem tlačítka po kliknutí myší. Co je správná odpověď?

### --answer--

Přidat `button:focus { outline: none; }`.

#### --why--

`:focus` platí i při ovládání klávesnicí. Obrys by zmizel i lidem, kteří podle něj poznají, kde na stránce jsou.

### --answer--

Obrys nechat úplně bez úprav, ukazovat se musí vždycky.

#### --why--

Vlastní vzhled obrysu je v pořádku. Jde jen o to, aby se ukázal tehdy, když ho uživatel potřebuje.

### --correct--

Výrazný vlastní obrys napsat do `:focus-visible`, který prohlížeč použije hlavně při ovládání klávesnicí.

#### --why--

`:focus-visible` platí, když prohlížeč usoudí, že je fokus potřeba ukázat — u tlačítka typicky z klávesnice, ne po kliknutí myší. Uživatel myši obrys neuvidí a uživatel klávesnice ano.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-stav-prvku

## --question--

Najdi v MDN stránku vlastnosti `text-transform`. Napiš hodnotu, která převede **první písmeno každého slova** na velké.

### --expected-- ignore-case

capitalize

### --why--

`text-transform: capitalize` mění první písmeno každého slova, `uppercase` všechna písmena. Stejně jako u popisků ve vizitce se text v HTML nemění, jen jeho vzhled.

### --see--

css-zaklady/workshop-vizitka/022

# --code-- Kolegova stránka akce na hvězdárně

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>Noc s astronomy — Hvězdárna Ondřejov</title>
  <link rel="stylesheet" href="event.css">
</head>
<body>
  <main id="event">
    <p class="date">Sobota 17. října · 19:00</p>
    <h1>Noc s astronomy</h1>
    <p>Pozorování Saturnu, přednášky a prohlídka největšího dalekohledu v Česku.</p>

    <section class="speakers">
      <h2>Přednášející</h2>
      <p class="speaker">Mgr. Jana Nováková <small>Astronomický ústav AV ČR</small></p>
      <p class="speaker">Petr Horák <small>Česká astronomická společnost</small></p>
    </section>

    <section>
      <h2>Program</h2>
      <ol class="program">
        <li><strong>19:00</strong> Úvodní slovo</li>
        <li>19:30 Jak se fotí mlhoviny</li>
        <li>20:30 Prohlídka kopule</li>
        <li>21:15 Pozorování Saturnu</li>
        <li>22:30 Závěr u ohně</li>
      </ol>
    </section>

    <a id="buy" class="btn" href="/vstupenky">Koupit vstupenku za 150 Kč</a>
    <p class="note">Za oblačnosti se pozorování nahradí přednáškou v sále.</p>
  </main>

  <footer class="footer">
    <p>Astronomický ústav AV ČR, Fričova 298, Ondřejov</p>
    <p>Parkování u hlavní brány, od autobusu 5 minut pěšky.</p>
  </footer>
</body>
</html>
```

## --file-- event.css

```css
:root {
  --accent: #7c2d12;
  --accent-light: #ffedd5;
  --space: 12;
  --radius: 10px;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  font-size: 16px;
  color: #292524;
  background: #fafaf9;
}

#event {
  max-width: 640px;
  margin: 40px auto;
  padding: 24px;
  background: white;
  border-radius: var(--radius);
}

#event h1 {
  font-size: 2.25rem;
  line-height: 1.1;
  color: var(--accent);
}

.date {
  display: inline-block;
  padding: var(--space)px;
  background: var(--accent-light);
  border-radius: var(--radius);
}

.speakers {
  font-size: 0.9em;
}

.speaker {
  font-size: 1.25em;
}

.speaker small {
  font-size: 0.8em;
  color: #78716c;
}

.program li:nth-child(odd) {
  background: #f5f5f4;
}

.btn {
  display: inline-block;
  padding: 12px 20px;
  border-radius: 999px;
  background: #57534e;
  color: white;
  text-decoration: none;
}

#buy {
  background: var(--accent);
}

.btn:hover {
  background: #292524;
}

.btn:focus {
  outline: none;
}

.note {
  font-size: 14px;
  color: #a8a29e
  font-style: italic;
}
```

## --question--

Kolik pixelů má písmo textu „Astronomický ústav AV ČR" (řádek 16 v `index.html`)? Pravidla, která ho ovlivňují, najdeš na řádcích 11, 37–48 v `event.css`.

### --expected--

14.4

### --accept--

14,4
14.4px
14.4 px
14,4 px

### --why--

Hodnoty v `em` u `font-size` se násobí po celé cestě dolů: `body` 16 px, `.speakers` 0,9 × 16 = 14,4 px, `.speaker` 1,25 × 14,4 = 18 px a `small` 0,8 × 18 = 14,4 px. Každé `em` počítá z písma rodiče, ne z `body`.

### --see--

css-zaklady/jednotky-a-hodnoty#em-nasobek-pisma-prvku

## --question--

Kolik pixelů je vnitřní odsazení štítku s datem `.date` (řádek 32 v `event.css`)?

### --expected--

0

### --accept--

0px
0 px

### --why--

`var(--space)` dosadí `12` a `px` za závorkou se k němu nepřilepí — vznikne `12 px`, a to není délka. Deklarace s `var()` se tím nezahodí při čtení, stane se neplatnou až při výpočtu, a `padding` pak dostane výchozí hodnotu 0. Oprava je `--space: 12px` na řádku 4.

### --see--

css-zaklady/vlastni-vlastnosti#typicke-chyby-a-pasti

## --question--

Při najetí myší na tlačítko „Koupit vstupenku" (řádek 31 v `index.html`) se jeho pozadí nezmění, přestože `.btn:hover` na řádku 67 v `event.css` tmavé pozadí nastavuje. Proč?

### --answer--

Pravidlo `:hover` musí být ve stylopisu před pravidlem `#buy`.

#### --why--

Pořadí ve stylopisu rozhoduje jen mezi selektory se stejnou prioritou. Tady je `.btn:hover` dokonce až za `#buy`, a stejně prohrává.

### --correct--

Pravidlo `#buy` na řádku 63 má selektor s id, a ten přebije selektor s třídou a stavem bez ohledu na pořadí.

#### --why--

Id má vyšší prioritu než jakýkoli počet tříd a pseudotříd. Pozadí tlačítka proto pořád určuje `#buy`. Řešení je stylovat tlačítko třídou, třeba `.btn--primary`.

### --answer--

Odkaz `<a>` stav `:hover` nemá, ten mají jen tlačítka `<button>`.

#### --why--

`:hover` funguje na jakémkoli prvku, odkazy nevyjímaje. Příčina je v tom, které pravidlo s pozadím vyhraje.

### --see--

css-zaklady/selektory-zaklad#typ-trida-a-id

## --question--

Poznámka dole (řádek 32 v `index.html`) měla být šedá a v kurzívě, ale nemá ani jedno. Pravidlo `.note` je na řádcích 75–79 v `event.css`. Napiš jméno vlastnosti, která se kromě `color` také neprojeví.

### --expected--

font-style

### --why--

Na konci řádku 77 chybí středník. Prohlížeč čte `color: #a8a29e font-style: italic` jako jednu deklaraci s nesmyslnou hodnotou a zahodí ji celou — přijde o barvu i o kurzívu. `font-size` na řádku 76 platí.

### --see--

css-zaklady/jak-css-funguje#neplatna-deklarace-se-tise-zahodi

## --question--

Co je špatně na pravidle `.btn:focus` na řádcích 71–73 v `event.css`?

### --answer--

Nic, obrys po kliknutí na tlačítko je jen kosmetická vada.

#### --why--

Pravidlo nemaže obrys jen po kliknutí. `:focus` platí i při ovládání klávesnicí.

### --correct--

Kdo stránku ovládá klávesnicí, nevidí, že je na tlačítku, protože obrys chybí i při fokusu z klávesnice.

#### --why--

`outline: none` bez náhrady je chyba přístupnosti. Výrazný obrys patří do `.btn:focus-visible`, který prohlížeč použije hlavně při ovládání klávesnicí.

### --answer--

`outline` na odkazu nefunguje, pravidlo nic nedělá.

#### --why--

Obrys se kreslí u jakéhokoli prvku s fokusem, včetně odkazů. Pravidlo ho opravdu smaže.

### --see--

css-zaklady/workshop-vizitka/020
