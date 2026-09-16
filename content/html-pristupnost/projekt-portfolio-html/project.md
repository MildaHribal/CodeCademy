---
title: Osobní portfolio
see: html-pristupnost/proc-pristupnost#jak-ctecka-stranku-cte, html-pristupnost/klavesnice-a-fokus#odkaz-preskocit-na-obsah, html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita, html-pristupnost/lab-audit
---

# --description--

## Zadání

Když se budeš ucházet o první místo ve frontendu, personalista otevře tvoje portfolio dřív než CV. Vývojář, který ho po něm prohlíží, zmáčkne Tab, podívá se do DevTools na osnovu nadpisů a otevře historii commitů. Tohle portfolio proto nemá vypadat draze. Má být **bez chyby v HTML**, přístupné a poctivě postavené po malých krocích.

Postavíš web o sobě o třech stránkách: úvod, projekty a kontakt. Texty, projekty i barvy jsou tvoje. Jako projekty klidně použij, co jsi postavil v kurzu: e-shop pražírny, audit kliniky, vizitku. Rozvržení zatím neřeš, stačí základní styly, které znáš ze základů CSS. Portfolio budeš vylepšovat dál, v sekci o animacích z něj uděláš stránku s pohybem.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku ve VS Code.
2. V terminálu ve složce projektu založ repozitář (`git init`) a první commit udělej hned se startovní kostrou.
3. Napiš nejdřív celé HTML úvodní stránky: hlavičku s navigací, hlavní obsah, patičku. Zkontroluj ho tady a commitni.
4. Stejnou kostru použij pro projekty a kontakt. Po každé hotové stránce commit se zprávou, co přibylo („Stránka projektů se třemi projekty").
5. Styly přidávej až nakonec, opět po malých commitech.
6. Repozitář nahraj na GitHub a zapni GitHub Pages (Settings → Pages → větev `main`). Adresu napiš do `README.md`.

Náhled tady v Akademii ukazuje `index.html`. Na další stránky se v něm dostaneš přes navigaci; testy kontrolují všechny tři soubory.

## Uživatelské příběhy

- Personalista na první obrazovce úvodu pozná, kdo jsi a co děláš, a jedním odkazem se dostane k projektům.
- Uživatel čtečky slyší stránku českým hlasem, skáče po oblastech a po nadpisech a na každé stránce ví, kde je.
- Kdo ovládá web klávesnicí, přeskočí hlavičku jedním odkazem, vždycky vidí, kde je fokus, a projde všechny tři stránky.
- Na stránce projektů je každý projekt samostatný celek s nadpisem, popisem a odkazem, který řekne, kam vede.
- Kdo ti chce napsat, vyplní kontaktní formulář, u kterého ví, co do kterého pole patří, i když už začal psát.

## Technické požadavky

- Soubory `index.html`, `projekty.html` a `kontakt.html` ve stejné složce, všechny připojují `styles.css`. Odkazy mezi nimi jsou relativní (`projekty.html`), aby fungovaly i na GitHub Pages v podsložce.
- Žádný JavaScript ani knihovny. Všechno, co je potřeba, umí HTML.
- Obrázky jsou v projektu nebo vložené jako `data:`, ne z cizího webu.

> [!TIP]
> Po každé stránce klikni na **Zkontrolovat**. Požadavky, které se týkají všech tří stránek, ti řeknou, na které stránce je problém.

# --hints--

Všechny tři stránky mají český jazyk, vlastní neprázdný titulek a připojený `styles.css`.

```js
const titles = [];
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  assert.ok(files[name], `v projektu chybí soubor ${name}`);
  const page = new DOMParser().parseFromString(files[name], 'text/html');
  assert.match(page.documentElement.getAttribute('lang') ?? '', /^cs(-CZ)?$/i, `${name}: <html> má mít lang="cs"`);
  const title = page.title.trim();
  assert.ok(title, `${name}: <title> je prázdný`);
  titles.push(title);
  assert.ok(page.querySelector('link[rel="stylesheet"][href$="styles.css"]'), `${name}: stránka má připojit styles.css`);
}
assert.equal(new Set(titles).size, 3, `každá stránka má mít jiný titulek, teď mají: ${titles.join(' | ')}`);
```

Každá stránka má hlavičku, navigaci, právě jeden hlavní obsah a patičku; hlavní obsah je mimo hlavičku i patičku.

```js
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  const header = page.querySelector('header');
  const footer = page.querySelector('footer');
  const mains = page.querySelectorAll('main');
  assert.ok(header, `${name}: chybí prvek header`);
  assert.ok(page.querySelector('nav'), `${name}: chybí prvek nav`);
  assert.equal(mains.length, 1, `${name}: má mít právě jeden main, má ${mains.length}`);
  assert.ok(footer, `${name}: chybí prvek footer`);
  assert.ok(!mains[0].contains(header) && !mains[0].contains(footer) && !header.contains(mains[0]), `${name}: main nemá obsahovat header ani footer`);
}
```

Každá stránka má právě jeden nadpis `h1` a osnova nadpisů nepřeskočí žádnou úroveň.

```js
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  const levels = [...page.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => Number(heading.tagName[1]));
  assert.equal(levels.filter((level) => level === 1).length, 1, `${name}: má mít právě jeden h1, osnova nadpisů: ${levels.join(', ') || 'žádné nadpisy'}`);
  assert.equal(levels[0], 1, `${name}: první nadpis má být h1, osnova: ${levels.join(', ')}`);
  levels.forEach((level, i) => {
    if (i > 0) assert.ok(level <= levels[i - 1] + 1, `${name}: po h${levels[i - 1]} následuje h${level} — osnova: ${levels.join(', ')}`);
  });
}
```

Navigace na každé stránce odkazuje na všechny tři stránky a právě otevřenou stránku označuje `aria-current="page"`.

```js
const pages = ['index.html', 'projekty.html', 'kontakt.html'];
const target = (href) => (href ?? '').replace(/^\.\//, '').replace(/[#?].*$/, '');
for (const name of pages) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  const nav = page.querySelector('nav');
  assert.ok(nav, `${name}: chybí nav`);
  const links = [...nav.querySelectorAll('a[href]')];
  for (const other of pages) {
    assert.ok(links.some((link) => target(link.getAttribute('href')) === other), `${name}: navigace nemá odkaz na ${other}`);
  }
  const current = links.filter((link) => link.getAttribute('aria-current') === 'page');
  assert.equal(current.length, 1, `${name}: v navigaci má mít aria-current="page" právě jeden odkaz, má ${current.length}`);
  assert.equal(target(current[0].getAttribute('href')), name, `${name}: aria-current="page" má mít odkaz na ${name}, ne na ${current[0].getAttribute('href')}`);
}
```

Na každé stránce je první zastávkou Tabu odkaz „Přeskočit na obsah", který vede na `id` hlavního obsahu.

```js
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  const first = [...page.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
    .find((el) => el.tabIndex >= 0 && !el.disabled && !el.closest('[hidden]'));
  assert.ok(first?.tagName === 'A', `${name}: první zastávka Tabu má být odkaz „Přeskočit na obsah", je ${first ? first.outerHTML.slice(0, 60) : 'nic'}`);
  assert.match(first.textContent, /přeskočit/i, `${name}: první odkaz má mít text „Přeskočit na obsah", má „${first.textContent.trim()}"`);
  const main = page.querySelector('main');
  assert.ok(main?.id, `${name}: main potřebuje id, na které odkaz povede`);
  assert.equal(first.getAttribute('href'), `#${main.id}`, `${name}: odkaz má vést na #${main.id}`);
}
```

Úvod má obrázek, každý obrázek na všech stránkách má atribut `alt` a obrázek, který je jediným obsahem odkazu, má `alt` neprázdný.

```js
const home = new DOMParser().parseFromString(files['index.html'] ?? '', 'text/html');
assert.ok(home.querySelector('main img'), 'úvod má v hlavním obsahu aspoň jeden obrázek (fotku, avatar nebo ilustraci)');
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  for (const img of page.querySelectorAll('img')) {
    assert.ok(img.hasAttribute('alt'), `${name}: obrázek ${img.getAttribute('src')?.slice(0, 40)} nemá atribut alt`);
    const link = img.closest('a');
    if (link && !link.textContent.trim() && !link.getAttribute('aria-label')) {
      assert.ok(img.getAttribute('alt').trim(), `${name}: obrázek je jediným obsahem odkazu ${link.getAttribute('href')}, jeho alt má říct, kam odkaz vede`);
    }
  }
}
```

Stránka projektů ukazuje aspoň tři projekty, každý jako `article` s vlastním nadpisem a odkazem.

```js
const page = new DOMParser().parseFromString(files['projekty.html'] ?? '', 'text/html');
const projects = [...page.querySelectorAll('main article')];
assert.ok(projects.length >= 3, `projekty.html: v main mají být aspoň tři projekty jako article, je jich ${projects.length}`);
projects.forEach((project, i) => {
  assert.ok(project.querySelector('h2, h3, h4'), `projekty.html: projekt č. ${i + 1} nemá vlastní nadpis`);
  assert.ok(project.querySelector('a[href]'), `projekty.html: projekt č. ${i + 1} nemá odkaz (na kód, ukázku nebo popis)`);
});
```

Každý odkaz na všech stránkách má jméno, které dává smysl i vytržené ze stránky, a odkazy na stránky portfolia vedou na existující soubor.

```js
const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
const text = (node) => [...node.childNodes].map((child) => {
  if (child.nodeType === 3) return child.textContent;
  if (child.nodeType !== 1 || child.getAttribute('aria-hidden') === 'true') return '';
  return child.tagName === 'IMG' ? ` ${child.getAttribute('alt') ?? ''} ` : text(child);
}).join('');
const vague = /^(více|vice|zde|tady|sem|klikni( sem| zde)?|odkaz|více info|číst dál|čti dál|detail|link|here)$/i;
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  for (const link of page.querySelectorAll('a[href]')) {
    const label = clean(link.getAttribute('aria-label')) || clean(text(link));
    assert.ok(label, `${name}: odkaz na ${link.getAttribute('href')} nemá žádné jméno`);
    assert.doesNotMatch(label, vague, `${name}: odkaz „${label}" na ${link.getAttribute('href')} bez okolního textu nic neřekne`);
    const href = link.getAttribute('href').replace(/^\.\//, '').replace(/[#?].*$/, '');
    if (/\.html$/.test(href) && !/^[a-z]+:/i.test(href)) {
      assert.ok(files[href], `${name}: odkaz vede na ${href}, ale takový soubor v projektu není`);
    }
  }
}
```

Kontaktní formulář má pole pro jméno, e-mail typu `email` a zprávu, každé s propojeným popiskem, a tlačítko, které ho odešle.

```js
const page = new DOMParser().parseFromString(files['kontakt.html'] ?? '', 'text/html');
const form = page.querySelector('main form');
assert.ok(form, 'kontakt.html: v hlavním obsahu chybí formulář');
const fields = [...form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select')];
assert.ok(form.querySelector('input[type="email"]'), 'kontakt.html: formulář má mít pole typu email');
assert.ok(form.querySelector('textarea'), 'kontakt.html: formulář má mít pole pro zprávu (textarea)');
assert.ok(fields.length >= 3, `kontakt.html: formulář má mít aspoň tři pole (jméno, e-mail, zpráva), má ${fields.length}`);
for (const field of fields) {
  const labelText = [...field.labels].map((label) => label.textContent.trim()).join(' ');
  assert.ok(labelText || field.getAttribute('aria-labelledby'), `kontakt.html: pole ${field.outerHTML.slice(0, 70)} nemá propojený label`);
}
const submit = form.querySelector('button:not([type]), button[type="submit"], input[type="submit"]');
assert.ok(submit && (submit.textContent.trim() || submit.value), 'kontakt.html: formulář má mít odesílací tlačítko s textem');
```

Ovládací prvky jsou nativní: žádný kladný `tabindex`, žádné klikací `div` a `span` a žádné role `button` nebo `link` místo skutečných prvků.

```js
for (const name of ['index.html', 'projekty.html', 'kontakt.html']) {
  const page = new DOMParser().parseFromString(files[name] ?? '', 'text/html');
  for (const el of page.querySelectorAll('[tabindex]')) {
    assert.ok(Number(el.getAttribute('tabindex')) <= 0, `${name}: ${el.outerHTML.slice(0, 60)} má kladný tabindex`);
  }
  const clickable = page.querySelector('div[onclick], span[onclick], li[onclick], [role="button"], [role="link"]');
  assert.equal(clickable, null, `${name}: ${clickable?.outerHTML.slice(0, 70)} — použij skutečný odkaz nebo tlačítko`);
}
```

Styly mají vlastní pravidlo `:focus-visible` a odkaz na úvodu má s fokusem výrazný obrys.

```js
const css = helpers.stripComments(files['styles.css'] ?? '', 'css');
assert.match(css, /:focus-visible/, 'styles.css má obsahovat pravidlo s :focus-visible');
const link = document.querySelector('main a[href]') ?? document.querySelector('a[href]');
assert.ok(link, 'na úvodu není žádný odkaz, na kterém by šel fokus vyzkoušet');
link.focus();
const style = getComputedStyle(link);
assert.ok((style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2) || style.boxShadow !== 'none', `odkaz s fokusem má obrys ${style.outlineStyle} ${style.outlineWidth} — má být aspoň 2 px nebo stín`);
```

# --help--

## --tip-- 4

Navigaci napiš jednou a zkopíruj ji do všech tří stránek. Pak na každé stránce přesuň `aria-current` na odkaz, který vede na ni samotnou.

## --tip-- 5

Odkaz „Přeskočit na obsah" musí být v `body` před hlavičkou. Připomeň si [odkaz „Přeskočit na obsah"](see:html-pristupnost/klavesnice-a-fokus#odkaz-preskocit-na-obsah): kotva vede na `id` prvku `main`.

## --tip-- 8

Když odkaz v kartě projektu nedává smysl bez nadpisu nad ním, napiš do něj celou větu, třeba název projektu a kam vede. Jak se jméno odkazu skládá, ukazuje [přístupné jméno](see:html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita).

# --review--

Testy kontrolují strukturu HTML. Git, nasazení a to, jak se stránka doopravdy používá, zkontroluj sám.

## --rubric--

- Historie v Gitu má aspoň pět commitů, každý s jednou ucelenou změnou a zprávou, ze které je poznat, co přibylo.
- Portfolio běží na veřejné adrese (GitHub Pages) a odkazy mezi stránkami tam fungují.
- `README.md` obsahuje adresu nasazeného webu a oddíl „Přístupnost" s tím, jak jsi stránky ověřil.
- Všechny tři stránky jsem prošel jen klávesnicí: odkaz „Přeskočit na obsah" se při fokusu ukáže, fokus je všude vidět a nikde se nezaseknu.
- Se čtečkou (NVDA, VoiceOver nebo Orca) jsem prošel nadpisy, oblasti stránky a odeslal kontaktní formulář.
- Kontrast textu i tlačítek jsem ověřil v DevTools, všude je aspoň 4,5 : 1.
- Texty jsou moje a konkrétní: u projektů je napsané, co jsem udělal a co jsem se naučil.

## --extensions--

**Rozšíření bez testů**

- Napoj kontaktní formulář na službu, která zprávy posílá e-mailem, a otestuj, že dojdou.
- Přidej stránku s detailem jednoho projektu a vrať se z ní drobečkovou navigací (`nav` s `aria-label` a `aria-current="page"` u poslední položky).
- Přidej do hlavičky obrázek s logem nebo iniciálami a pohlídej jméno odkazu.

**Rozšíření do portfolia**

- Nahraj na GitHub i projekty, na které portfolio odkazuje, a odkazy veď na skutečné repozitáře.
- Spusť na nasazené stránce Lighthouse v DevTools, výsledek přístupnosti dej do README a pod něj napiš, co automat neověří.
- Nech portfolio projít kamaráda, který web ovládá jinak než ty (jen klávesnicí nebo se zvětšením na 200 %), a oprav, co najde.
