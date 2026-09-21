---
title: Profil na GitHubu
see: start-nastroje/github-a-pages#relativni-cesty-a-podslozka, start-nastroje/workshop-prvni-repozitar/006, start-nastroje/vs-code#slozka-projektu
---

# --description--

## Zadání

Tohle je první věc, kterou budeš mít na internetu pod vlastní adresou — a zároveň první
repozitář, který bude někdo jiný číst. Postav osobní stránku o sobě, veď ji v Gitu po
malých commitech a nasaď ji na GitHub Pages.

Obsah je tvůj: kdo jsi, co se učíš a na čem jsi zatím pracoval (klidně stránka receptu
a blog z minulé sekce). Nemá to být životopis na tři obrazovky — jedna stránka, kterou
někdo přečte za minutu.

Vzhled řešit nemusíš, základní styly máš v `styles.css` připravené. Hodnotí se HTML,
historie v Gitu a to, že web opravdu běží.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku ve VS Code.
2. V terminálu ve složce projektu založ repozitář a **hned udělej první commit** se
   startovní kostrou. Od té chvíle commituj po každé hotové části.
3. Napiš hlavičku se jménem a jednou větou o sobě. Zkontroluj, commitni.
4. Dopiš hlavní obsah: o mně, co se učím, na čem jsi pracoval. Commit.
5. Dopiš patičku s kontaktem. Commit.
6. Vyplň `README.md` a doplň vzory do `.gitignore`. Commit.
7. Založ na GitHubu repozitář, připoj ho jako vzdálený, pushni a v **Settings → Pages**
   zapni publikování z větve `main`.
8. Adresu, na které web běží, napiš do `README.md` a pushni znovu.

## Uživatelské příběhy

- Personalista otevře adresu na mobilu a za minutu ví, kdo jsi a co umíš.
- Kdo přijde na repozitář na GitHubu, přečte si `README.md` a hned ví, co projekt je,
  kde běží a jak si ho spustit u sebe.
- Kdo si stránku otevře čtečkou obrazovky, projde ji po nadpisech a pozná hlavičku,
  hlavní obsah i patičku.
- Ty sám se za tři měsíce podíváš do historie commitů a poznáš, co jsi kdy přidal.

## Technické požadavky

- `index.html` v kořeni projektu, sémantická kostra: hlavička, jeden hlavní obsah, patička.
  Jeden `h1` a podnadpisy `h2` bez přeskakování úrovní.
- **Všechny cesty relativní.** Žádná nesmí začínat lomítkem — na Pages leží web v podsložce
  s názvem repozitáře a cesta od kořene by mířila mimo něj.
- Názvy souborů malými písmeny, bez diakritiky a bez mezer. Server Pages běží na Linuxu
  a `Foto.JPG` je pro něj jiný soubor než `foto.jpg`.
- Aspoň dva odkazy ven (GitHub, e-mail) s textem, který dává smysl i vytržený z věty.
- `README.md` s nadpisem, adresou nasazeného webu a oddílem, co ses na projektu naučil.
- `.gitignore` aspoň se systémovými soubory (`.DS_Store`, `Thumbs.db`).

> [!TIP]
> Commituj dřív, než ti to přijde potřeba. Historie s osmi malými commity se čte líp než
> jeden commit „hotovo" — a při pohovoru se na ni někdo podívá.

# --hints--

Stránka má český jazyk, vlastní titulek a připojený stylopis.

```js
const page = new DOMParser().parseFromString(files['index.html'], 'text/html');
assert.match(page.documentElement.getAttribute('lang') ?? '', /^cs(-CZ)?$/i, '<html> má mít lang="cs"');
const title = page.title.trim();
assert.ok(title, '<title> je prázdný');
assert.ok(title !== 'Profil', 'Titulek „Profil" je ze šablony — napiš do něj svoje jméno a čím se zabýváš');
assert.ok(page.querySelector('link[rel="stylesheet"][href$="styles.css"]'), 'Stránka má připojit styles.css');
```

Stránka má hlavičku, právě jeden hlavní obsah a patičku.

```js
const page = new DOMParser().parseFromString(files['index.html'], 'text/html');
for (const [tag, jmeno] of [['header', 'hlavička <header>'], ['main', 'hlavní obsah <main>'], ['footer', 'patička <footer>']]) {
  assert.ok(page.querySelector(tag), `Stránce chybí ${jmeno}`);
}
assert.equal(page.querySelectorAll('main').length, 1, 'Prvek <main> má být na stránce právě jeden');
const main = page.querySelector('main');
assert.ok(!main.contains(page.querySelector('header')) && !main.contains(page.querySelector('footer')), '<header> ani <footer> nepatří dovnitř <main>');
```

Osnova nadpisů má jeden `h1` a nepřeskakuje úroveň.

```js
const page = new DOMParser().parseFromString(files['index.html'], 'text/html');
const h1s = page.querySelectorAll('h1');
assert.equal(h1s.length, 1, `Na stránce je ${h1s.length} prvků <h1> — má být právě jeden`);
assert.ok(h1s[0].textContent.trim().length > 2, '<h1> je prázdný — patří do něj tvoje jméno');
const levels = [...page.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((el) => Number(el.localName[1]));
assert.ok(levels.length >= 3, `Stránka má ${levels.length} nadpisy — rozděl obsah aspoň do dvou oddílů s <h2>`);
for (let i = 1; i < levels.length; i += 1) {
  assert.ok(levels[i] <= levels[i - 1] + 1, `Z úrovně h${levels[i - 1]} se skáče rovnou na h${levels[i]} — osnova má klesat po jedné`);
}
```

Žádná cesta v projektu nezačíná lomítkem.

```js
const page = new DOMParser().parseFromString(files['index.html'], 'text/html');
const bad = [];
for (const el of page.querySelectorAll('[href], [src]')) {
  const value = el.getAttribute('href') ?? el.getAttribute('src');
  if (value.startsWith('/') && !value.startsWith('//')) bad.push(`<${el.localName}> → ${value}`);
}
assert.deepEqual(bad, [], `Na Pages leží web v podsložce, takže cesta od kořene míří mimo něj. Oprav na relativní: ${bad.join(', ')}`);
assert.ok(!/href=["']file:/i.test(files['index.html']), 'V odkazu je cesta file:// — ta funguje jen na tvém počítači');
```

Stránka má aspoň dva odkazy ven a jejich text dává smysl sám o sobě.

```js
const page = new DOMParser().parseFromString(files['index.html'], 'text/html');
const links = [...page.querySelectorAll('a[href]')];
const ven = links.filter((a) => /^(https?:|mailto:)/i.test(a.getAttribute('href')));
assert.ok(ven.length >= 2, `Odkazů ven je ${ven.length} — doplň aspoň dva (třeba GitHub a e-mail)`);
for (const a of links) {
  const text = a.textContent.replace(/\s+/g, ' ').trim();
  assert.ok(text.length >= 3, `Odkaz na „${a.getAttribute('href')}" nemá text`);
  assert.ok(!/^(klikni|tady|zde|sem|více|link)/i.test(text), `Text odkazu „${text}" nedává smysl vytržený z věty — napiš, kam vede`);
  assert.ok(!/^https?:/i.test(text), `Text odkazu „${text}" je adresa — napiš místo ní, kam vede`);
}
```

Obrázky mají alternativní text, který je popisuje.

```js
const page = new DOMParser().parseFromString(files['index.html'], 'text/html');
for (const img of page.querySelectorAll('img')) {
  const alt = img.getAttribute('alt');
  assert.ok(alt !== null, `Obrázku ${img.getAttribute('src')} chybí atribut alt`);
  if (alt.trim() === '') continue;
  assert.ok(!/^(obrázek|fotka|foto|image|img)$/i.test(alt.trim()), `alt „${alt}" nic neříká — popiš, co je na obrázku`);
  assert.ok(!/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(alt.trim()), `alt „${alt}" je jméno souboru, ne popis obsahu`);
}
```

Názvy souborů jsou malými písmeny, bez diakritiky a bez mezer.

```js
const spatne = Object.keys(files).filter((name) => name !== 'README.md' && (/[A-Z]/.test(name) || /\s/.test(name) || /[^\u0000-\u007f]/.test(name)));
assert.deepEqual(spatne, [], `Server GitHub Pages běží na Linuxu a rozlišuje velikost písmen. Přejmenuj: ${spatne.join(', ')}`);
```

`README.md` má nadpis, adresu nasazeného webu a to, co ses naučil.

```js
const readme = files['README.md'] ?? '';
assert.match(readme, /^#\s+\S/m, 'README.md má začínat nadpisem');
const url = /https:\/\/[a-z0-9-]+\.github\.io\/[^\s)>]*/i.exec(readme);
assert.ok(url, 'V README.md chybí adresa, na které web běží (https://<jmeno>.github.io/<repozitar>/)');
assert.ok(!/<jmeno>|<repozitar>|jmeno\.github\.io\/repozitar/i.test(url[0]), `V README je pořád vzorová adresa „${url[0]}" — napiš tam tu svoji`);
assert.ok(!/<!--/.test(readme), 'V README.md zůstaly komentáře ze šablony — přepiš je vlastním textem');
assert.ok(readme.replace(/[#\s]/g, '').length > 200, 'README.md je skoro prázdné — dopiš, co projekt je, kde běží a co ses naučil');
```

`.gitignore` má aspoň systémové soubory.

```js
const lines = (files['.gitignore'] ?? '').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
assert.ok(lines.length >= 2, `V .gitignore jsou ${lines.length} vzory — doplň aspoň systémové soubory obou hlavních systémů`);
assert.ok(lines.some((l) => /DS_Store/i.test(l)), 'V .gitignore chybí .DS_Store (systémový soubor macOS)');
assert.ok(lines.some((l) => /Thumbs\.db/i.test(l)), 'V .gitignore chybí Thumbs.db (systémový soubor Windows)');
```

# --help--

## --tip--

Cesty na Pages jsou nejčastější zádrhel — proč se rozbijí až tam, je v části
[Relativní cesty a podsložka](see:start-nastroje/github-a-pages#relativni-cesty-a-podslozka).

## --tip--

Zprávu commitu piš v přítomném čase a o projektu, ne o sobě: „Patička s kontaktem",
ne „přidal jsem patičku". Vzor máš v kroku
[První commit](see:start-nastroje/workshop-prvni-repozitar/006).

# --review--

Testy kontrolují soubory. Git, nasazení a to, jestli se to dá číst, zkontroluj sám.

## --rubric--

- Historie má aspoň šest commitů a u každého je ze zprávy poznat, co přibylo.
- Žádný commit se nejmenuje „oprava", „změny" ani „hotovo".
- Web běží na veřejné adrese a otevřel jsem ho i na mobilu.
- Otevřel jsem adresu v anonymním okně — načte se všechno, nic nechybí kvůli mezipaměti.
- `README.md` bych dal přečíst kamarádovi a pochopil by z něj, co projekt je.
- Text o mně je konkrétní: je z něj poznat, co dělám a co mě k tomu přivedlo.
- V repozitáři není nic, co tam nepatří (systémové soubory, poznámky, hesla).

## --extensions--

**Rozšíření bez testů**

- Přidej druhou stránku (třeba `projekty.html`) a propoj je navigací v hlavičce.
- Dej repozitáři popis a štítky na GitHubu, ať je poznat, co to je, ještě před otevřením.
- Nastav si ve VS Code formátování při uložení a commitni výsledek zvlášť, ať je v historii
  poznat, že šlo jen o formát.

**Rozšíření do portfolia**

- Pojmenuj repozitář `<tvoje-jmeno>.github.io` — takový web běží rovnou v kořeni
  a adresa je o dost hezčí.
- Odkazuj z profilu na svoje skutečné repozitáře a do každého dopiš README.
- Až projdeš sekci o CSS, vrať se sem a stránku si nastyluj po svém. Historie commitů
  pak ukáže, jak ses posunul.
