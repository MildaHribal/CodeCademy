---
pass: 0.8
---

# --questions--

## --question--

Jaké přístupné jméno má tohle tlačítko? Napiš jen text jména.

```html
<button type="button" class="cart-item__remove">
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13"/></svg>
  <span class="visually-hidden">Odebrat Kolumbii Huila z košíku</span>
</button>
```

### --expected-- ignore-case

Odebrat Kolumbii Huila z košíku

### --why--

Tlačítko bere jméno z obsahu. Ikona má `aria-hidden="true"`, takže se nepočítá, a vizuálně skrytý text ve stromu přístupnosti zůstává. Na obrazovce je vidět jen křížek, čtečka řekne celou větu.

### --see--

html-pristupnost/aria-vzory#skryt-pro-oci-pro-ctecku-nebo-pro-oba

## --question--

Jaké přístupné jméno má pole v tomhle formuláři?

```html
<label for="city">Město</label>
<input id="town" name="city" autocomplete="address-level2">
```

### --answer--

„Město", protože `for="city"` odpovídá atributu `name` pole.

#### --why--

Myslíš si, že `for` hledá pole podle `name`? `name` je klíč pro odeslání dat na server. Popisek s polem spojuje jen shoda s `id`.

### --correct--

Žádné: `for` míří na `id="city"`, ale pole má `id="town"`, takže popisek s ním spojený není.

#### --why--

`for` hledá prvek podle `id`. Tady se neshodují, popisek visí na stránce sám a pole zůstane bez jména. Stačí sjednotit `for` a `id`.

### --answer--

„Město", protože popisek stojí hned před polem.

#### --why--

Myslíš si, že prohlížeč spojí popisek s polem podle pořadí? Spojuje je jen shoda `for` a `id`, nebo pole uvnitř `<label>`.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --question--

Na které prvky se dostaneš klávesou Tab a v jakém pořadí? Napiš jejich písmena oddělená mezerou.

```html
<a href="#akce">A</a>
<button type="button" tabindex="-1">B</button>
<span tabindex="0">C</span>
<a>D</a>
<input value="E" disabled>
```

### --expected-- ignore-case

A C

### --accept--

A, C
AC
A a C

### --why--

Odkaz s `href` fokus dostane. Tlačítko s `tabindex="-1"` jde zaměřit jen skriptem, `span` s `tabindex="0"` se do pořadí přidá. Odkaz bez `href` není interaktivní prvek a vypnuté pole z pořadí vypadne.

### --see--

html-pristupnost/klavesnice-a-fokus#tabindex-0-1-a-proc-ne-kladne

## --question--

Ve kterém z těchto případů ARIA doopravdy něco přidá?

### --answer--

`<nav role="navigation">` v hlavičce webu.

#### --why--

Myslíš si, že role „posílí" sémantický prvek? `nav` roli `navigation` už má, atribut jen opakuje totéž.

### --correct--

`<a href="/kosik" aria-current="page">Košík</a>` v menu na stránce košíku.

#### --why--

HTML nemá atribut, který by řekl „tohle je aktuální stránka". `aria-current="page"` přidá do stromu přístupnosti stav, který jinak vidí jen oči.

### --answer--

`<div role="button" onclick="addToCart()">Do košíku</div>`.

#### --why--

Myslíš si, že role udělá z `div` tlačítko? Změní jen hlášení čtečky, fokus ani ovládání klávesou nepřidá. `<button>` by to měl hotové.

### --answer--

`<span aria-label="Skladem" class="dot"></span>` u produktu.

#### --why--

Myslíš si, že `aria-label` funguje na každém prvku? `span` má roli `generic`, která jméno nedostává, a čtečky ho většinou ignorují. Slovo „Skladem" patří do textu.

### --see--

html-pristupnost/aria-vzory#problem-aria-jako-naplast

## --question--

Najdi v MDN stránku prvku `<output>` a v tabulce technického shrnutí (*Technical summary*) zjisti, jakou má implicitní roli ARIA. Napiš jen název role.

### --expected-- ignore-case

status

### --why--

`<output>` má implicitní roli `status`, takže je to zdvořilá živá oblast rovnou z HTML. Hodí se na výsledek výpočtu, třeba „Celkem 1 247 Kč" v košíku, který se mění podle zvoleného množství.

### --see--

html-pristupnost/aria-vzory#oznameni-role-status-a-role-alert

## --question--

Pole pro e-mail s chybou ukáže formulář jen tak, že mu změní rámeček na červený. Kdo se o chybě nedozví?

### --answer--

Jen uživatel čtečky; kdo vidí, červenou barvu pozná.

#### --why--

Myslíš si, že barvu vidí každý, kdo vidí? Člověk s poruchou barvocitu červený a šedý rámeček neodliší a na displeji na slunci splynou.

### --correct--

Uživatel čtečky, člověk s poruchou barvocitu i kdokoli, kdo barvu na displeji nerozezná; chybu musí říct i text.

#### --why--

Barva nesmí být jediný nositel informace. Hláška „Zadej e-mail ve tvaru jana@example.cz" propojená s polem přes `aria-describedby` pomůže všem najednou.

### --answer--

Nikdo, prohlížeč u pole s červeným rámečkem sám ohlásí chybu.

#### --why--

Myslíš si, že prohlížeč čte styly? Barva rámečku je jen CSS a do stromu přístupnosti se nepromítne.

### --see--

html-pristupnost/proc-pristupnost#sest-nejcastejsich-chyb

## --question--

Stránka receptu má `h1` s názvem jídla. Nadpisy „Suroviny" a „Postup" jsou `h4`, protože `h2` se designérce zdálo moc velké. Co je správná oprava?

### --answer--

Nechat `h4`, velikost nadpisu je věc designu.

#### --why--

Myslíš si, že úroveň nadpisu je jen velikost? Čtečka z úrovní skládá osnovu a po `h1` rovnou `h4` zní, jako by dvě úrovně chyběly.

### --correct--

Změnit je na `h2` a velikost upravit v CSS.

#### --why--

Úroveň říká, kde v osnově nadpis stojí, velikost dělá CSS. Pod `h1` patří `h2`, a jak velký bude, rozhodne třída.

### --answer--

Změnit je na `strong`, aby nebyly tak velké a nepletly osnovu.

#### --why--

Myslíš si, že nadpis může nahradit tučný text? Uživatel čtečky, který skáče po nadpisech, by pak „Suroviny" ani „Postup" nenašel.

### --see--

html-pristupnost/proc-pristupnost#jak-ctecka-stranku-cte

## --question--

Napiš selektor, který vybere odkazy uvnitř prvku `nav`, jen když mají fokus a prohlížeč usoudil, že ho má ukázat (typicky při ovládání klávesnicí).

### --expected--

nav a:focus-visible

### --why--

`:focus-visible` platí jen tehdy, když má být fokus vidět, takže obrys se neukáže po kliknutí myší, ale z klávesnice ano. S `:focus` by se ukázal i po kliknutí a někdo by ho pak smazal.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-stav-prvku

## --question--

Popisek pole má `font-size: 0.875rem`. Kolik pixelů bude mít, když si uživatel se slabším zrakem nastaví v prohlížeči výchozí velikost písma na 20 px? Napiš jen číslo.

### --expected--

17.5

### --accept--

17,5
17.5px
17,5 px

### --why--

`rem` je násobek velikosti písma kořene stránky, a ta vychází z nastavení uživatele: 0,875 × 20 = 17,5 px. S `font-size: 14px` by text zůstal malý, ať si uživatel nastaví cokoli.

### --see--

css-zaklady/jednotky-a-hodnoty#rem-nasobek-korene-stranky

## --question--

Skupina přepínačů „Způsob dopravy" (Zásilkovna, PPL, osobní odběr v Olomouci) je obalená prvkem `fieldset`. Kterým prvkem jí dáš jméno, které čtečka řekne při vstupu do skupiny? Napiš jen název značky.

### --expected-- ignore-case

legend

### --accept--

<legend>

### --why--

`<legend>` je nativní popisek `fieldset`. Čtečka ho řekne, jakmile uživatel vstoupí do skupiny („Způsob dopravy, skupina, Zásilkovna, přepínač"), takže ví, k čemu přepínače patří.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --question--

Obrys fokusu má v CSS barvu `outline: 3px solid var(--focus-color, #7c2d12);`, ale vlastnost `--focus-color` nikde na stránce definovaná není. Jakou barvu obrys bude mít? Napiš hodnotu barvy.

### --expected-- ignore-case

#7c2d12

### --why--

Když vlastní vlastnost neexistuje, `var()` použije záložní hodnotu za čárkou. Obrys tedy zůstane vidět v tmavě hnědé. Bez záložní hodnoty by celá deklarace `outline` neplatila a obrys by zmizel.

### --see--

css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

## --question--

Napiš selektor, který vybere odkaz uvnitř `nav` s atributem `aria-current` s hodnotou `page`, aby aktuální stránka v menu byla zvýrazněná z téhož atributu, který čte čtečka.

### --expected--

nav a[aria-current="page"]

### --accept--

nav a[aria-current=page]
nav [aria-current="page"]

### --why--

Atributový selektor `[aria-current="page"]` vybere prvek podle atributu a hodnoty. Když zvýraznění stojí na něm místo na třídě, obrazovka a čtečka se nikdy nerozejdou.

### --see--

css-zaklady/selektory-zaklad#atributove-selektory

# --code-- Kolegova rezervace stolu v bistru

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bistro Na Rohu — rezervace stolu</title>
  <link rel="stylesheet" href="bistro.css">
</head>
<body>
  <header class="top">
    <a href="/" class="top__brand">Bistro Na Rohu</a>
    <button class="top__burger" aria-expanded="false" aria-controls="main-menu">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
    <nav>
      <ul id="main-menu" class="top__menu" role="menu" hidden>
        <li role="menuitem"><a href="/menu">Jídelní lístek</a></li>
        <li role="menuitem"><a href="/rezervace" class="is-current">Rezervace</a></li>
        <li role="menuitem"><a href="/kontakt">Kontakt</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <h1>Rezervace stolu</h1>
    <p>Stůl podržíme 15 minut. Na víc než 8 osob volejte 777 204 118.</p>

    <form id="booking" novalidate>
      <label for="guest-name">Jméno</label>
      <input id="name" name="name" autocomplete="name">

      <label for="guests">Počet osob</label>
      <input id="guests" name="guests" type="number" min="1" max="8" aria-label="Počet">

      <span id="date-label">Datum návštěvy</span>
      <input id="date" name="date" type="date" aria-labelledby="date-label">

      <fieldset>
        <legend>Kde chcete sedět</legend>
        <label><input type="radio" name="place" value="inside" checked> Uvnitř</label>
        <label><input type="radio" name="place" value="garden"> Na zahrádce</label>
      </fieldset>

      <input name="note" placeholder="Poznámka (alergie, dětská židlička)">

      <span class="btn" onclick="submitBooking()">Rezervovat</span>
    </form>
    <div id="messages"></div>
  </main>

  <footer>
    <p>Bistro Na Rohu, Pekařská 3, Opava · Po–So 11–22</p>
  </footer>

  <script>
    const burger = document.querySelector('.top__burger');
    const menu = document.querySelector('#main-menu');

    burger.addEventListener('click', function () {
      menu.hidden = !menu.hidden;
    });

    function submitBooking() {
      const form = document.querySelector('#booking');
      const messages = document.querySelector('#messages');
      const fields = form.elements;
      const guests = Number(fields.guests.value);

      if (!fields.name.value || !fields.date.value) {
        messages.innerHTML = '<p role="alert">Vyplňte jméno a datum.</p>';
        return;
      }

      if (guests > 8) {
        fields.guests.style.borderColor = 'red';
        return;
      }

      messages.innerHTML = '';
      var summary = document.createElement('p');
      summary.textContent = 'Stůl pro ' + guests + ' je zarezervovaný.';
      messages.appendChild(summary);
    }
  </script>
</body>
</html>
```

## --question--

Jaké přístupné jméno má pole na řádku 35? Napiš jen text jména.

### --expected-- ignore-case

Počet

### --why--

Pole má propojený `<label>` „Počet osob" (řádek 34) i `aria-label="Počet"`. `aria-label` je ve výpočtu jména výš, takže vyhraje a na obrazovce je přitom vidět něco jiného.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --question--

Jaké přístupné jméno má pole na řádku 32? Když žádné nemá, napiš „žádné".

### --expected-- ignore-case

žádné

### --accept--

zadne
nic
žádné jméno

### --why--

Popisek na řádku 31 míří přes `for` na `id="guest-name"`, ale pole má `id="name"`. Popisek tak s polem spojený není a pole nemá ani `aria-label`, ani `placeholder`.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --question--

Na kterém řádku je ovládací prvek, na který se uživatel klávesnice vůbec nedostane? Napiš číslo řádku.

### --expected--

48

### --why--

„Rezervovat" je `span` s `onclick`. Nemá roli ani fokus, takže Tab ho přeskočí a Enter nic neudělá. Formulář tak klávesnicí nejde odeslat. Patří tam `<button type="submit">` a odeslání v posluchači `submit` formuláře.

### --see--

html-pristupnost/klavesnice-a-fokus#button-a-nebo-klikaci-div

## --question--

Uživatel čtečky zmáčkne tlačítko na řádku 12 a menu se otevře. Co o tlačítku uslyší, když se na něj vrátí?

### --answer--

„Menu, tlačítko, rozbaleno".

#### --why--

Myslíš si, že tlačítko má jméno a stav se změní sám? Ikona uvnitř nemá žádný text a skript na řádku 62 mění jen `menu.hidden`.

### --correct--

Jen „tlačítko, sbaleno": tlačítko nemá jméno a `aria-expanded` zůstane `"false"`, i když je menu otevřené.

#### --why--

SVG na řádcích 13–15 nedává žádný text, takže tlačítko je beze jména. A řádek 62 přepne viditelnost menu, ale `aria-expanded` nenastaví, takže stav lže.

### --answer--

„Jídelní lístek, odkaz", protože fokus po otevření skočí do menu.

#### --why--

Myslíš si, že otevření menu přesune fokus? Nic takového skript nedělá, fokus zůstane na tlačítku.

### --see--

html-pristupnost/strom-pristupnosti#stav-co-se-s-prvkem-prave-deje

## --question--

Po úspěšné rezervaci se pod formulářem objeví „Stůl pro 4 je zarezervovaný." (řádky 81–84). Uživatel čtečky ale nic neuslyší. Proč?

### --answer--

Protože text se nastavuje přes `textContent`, a ten čtečky nečtou.

#### --why--

Myslíš si, že záleží na tom, jak se text do stránky dostal? Čtečka pracuje s výsledným stromem, `textContent` i `innerHTML` do něj text dají stejně.

### --correct--

Protože `#messages` (řádek 50) není živá oblast, takže změnu v něm čtečka neohlásí.

#### --why--

Čtečka čte tam, kde je uživatel. Aby ohlásila zprávu jinde, musí být `#messages` od načtení `role="status"` nebo `aria-live="polite"` a skript má měnit jen jeho obsah.

### --answer--

Protože na řádku 82 je `var` místo `const`.

#### --why--

Myslíš si, že způsob deklarace proměnné ovlivní čtečku? `var` je jen starší zápis, na tom, co se ve stránce objeví, nic nemění.

### --see--

html-pristupnost/aria-vzory#oznameni-role-status-a-role-alert

## --question--

Co udělat s rolemi na řádcích 18–21?

### --answer--

Přidat položkám `li` atribut `tabindex="0"`, aby šly zaměřit.

#### --why--

Myslíš si, že chybí jen fokus? Odkazy uvnitř fokus už mají. Potíž je v tom, že role `menu` slibuje ovládání šipkami, které nikdo nenapsal.

### --correct--

Role smazat: navigace webu je `nav` se seznamem odkazů a aktuální stránku řekne `aria-current="page"` místo třídy `is-current`.

#### --why--

`role="menu"` patří menu aplikace ovládanému šipkami. Na navigaci webu přepne čtečku do režimu, ve kterém odkazy nefungují, jak uživatel čeká. Seznam odkazů v `nav` je správně bez ARIA a jediné, co HTML nemá, je stav aktuální stránky.

### --answer--

Změnit `role="menu"` na `role="menubar"`, protože menu je vodorovné.

#### --why--

Myslíš si, že jde o směr menu? `menubar` je taky vzor aplikace se šipkami a stejnou prací navíc. Navigace webu žádnou roli z menu nepotřebuje.

### --see--

html-pristupnost/aria-vzory#vzory-z-apg-a-kdy-je-html-uz-ma
