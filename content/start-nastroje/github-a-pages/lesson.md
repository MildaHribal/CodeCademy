# GitHub a GitHub Pages

:::check pretest
Repozitář máš na GitHubu a v něm `index.html`. Co se stane, když adresu repozitáře pošleš kamarádovi?

### --answer--
Uvidí web — GitHub HTML soubory vykresluje.

#### --why--
GitHub je úložiště kódu. Soubor mu servíruje jako text ke čtení, ne jako stránku.

### --correct--
Uvidí výpis souborů a zdrojový kód, ne vykreslenou stránku.

### --answer--
Neuvidí nic, dokud mu nedáš přístup.

#### --why--
To platí jen u privátního repozitáře. Veřejný si otevře kdokoli — jen uvidí soubory, ne stránku.
:::

## Problém: web, který vidíš jen ty

Stránku máš hotovou, leží v repozitáři, `git push` proběhl. Otevřeš adresu repozitáře a
uvidíš… seznam souborů. Kliknutím na `index.html` se ukáže **zdrojový kód**, ne stránka.

Je to tak správně: GitHub je úložiště kódu, ne webhosting. Soubor `index.html` je pro
něj text jako každý jiný. Aby se z něj stala stránka, musí ho někdo poslat prohlížeči
s hlavičkou `Content-Type: text/html` — a to je práce webserveru.

**GitHub Pages je ten webserver.** Zapneš ho v nastavení repozitáře a GitHub začne obsah
z vybrané větve servírovat na veřejné adrese.

:::check
Proč se `index.html` na GitHubu ukáže jako kód, i když je to platné HTML?

### --answer--
Protože soubor není v hlavní větvi.

#### --why--
Větev s tím nesouvisí. I v `main` by se soubor ukázal jako kód, dokud není zapnuté publikování.

### --correct--
Protože GitHub posílá soubory repozitáře jako text ke čtení, ne jako stránku k vykreslení.

### --answer--
Protože chybí `<!DOCTYPE html>`.

#### --why--
Doctype rozhoduje o režimu vykreslování, ale jen ve chvíli, kdy stránka opravdu vykresluje. Tady se ani nedostane na řadu.
:::

## Co jsou GitHub Pages

Hosting statických stránek přímo z repozitáře. Zdarma, bez serveru, bez FTP. Pravidla
jsou tři:

- **Jen statické soubory** — HTML, CSS, JavaScript, obrázky. Žádné PHP, žádná databáze,
  žádný kód, který by běžel na serveru.
- **Zdrojem je větev a složka** — vybereš, odkud se má publikovat (typicky `main` a kořen
  repozitáře, nebo `main` a složka `/docs`).
- **Publikuje se při každém pushi** — pushneš, GitHub spustí nasazení a za pár desítek
  vteřin je nová verze venku.

To poslední je důležité: **`git push` je nasazení**. Co je v sledované větvi, to je na
webu. Proto se do ní nepouští rozdělaná práce.

:::check
Chceš na GitHub Pages dát stránku s formulářem, který ukládá zprávy do databáze. Co z toho půjde?

### --answer--
Všechno, jen musíš databázi taky commitnout.

#### --why--
Databáze není soubor, který se dá poslat prohlížeči. Potřebuje program, který běží na serveru — a ten Pages nespustí.

### --correct--
Jen stránka s formulářem. Ukládání na server by potřebovalo kód, který na Pages neběží.

### --answer--
Nic — Pages neumí formuláře.

#### --why--
Formulář je obyčejné HTML, to Pages zvládnou. Problém je až s tím, kdo odeslaná data přijme.
:::

## Odkud se web publikuje

V repozitáři jdi do **Settings → Pages** a nastav zdroj:

| volba | co to znamená |
|---|---|
| Branch: `main`, folder: `/ (root)` | publikuje se celý repozitář z hlavní větve |
| Branch: `main`, folder: `/docs` | publikuje se jen složka `docs` |
| GitHub Actions | web se před publikováním sestaví (potřebné u Vite a spol.) |

Pro obyčejný web z HTML, CSS a JavaScriptu stačí první volba. Třetí tě čeká v sekci
o nasazení, až budeš mít projekt, který se musí nejdřív sestavit.

> [!PITFALL]
> **Soubor se musí jmenovat `index.html`.** Server, který dostane požadavek na `/`,
> hledá přesně tohle jméno. `Index.html` s velkým I ani `home.html` mu nestačí a
> dostaneš 404.

:::check
Máš repozitář, kde je web ve složce `web/`. Co uděláš, aby se publikoval?

### --expected--
přesunu ho do docs

### --accept--
přejmenuju složku na docs
dám ho do kořene repozitáře
přesunu obsah do kořene
:::

## Adresa, na které web poběží

Adresa vznikne z tvého uživatelského jména a jména repozitáře:

```text
https://<jmeno>.github.io/<repozitar>/
```

Pro uživatele `karelnovak` a repozitář `portfolio` je to
`https://karelnovak.github.io/portfolio/`.

Jedna výjimka: repozitář pojmenovaný přesně `<jmeno>.github.io` se publikuje **v kořeni**,
tedy na `https://karelnovak.github.io/`. Takový repozitář může mít každý jeden a bývá
z něj hlavní osobní stránka.

:::check
Uživatel `tereza-d` má repozitář `kolo-blog` s Pages. Napiš adresu, na které web poběží.

### --expected--
https://tereza-d.github.io/kolo-blog/

### --accept--
tereza-d.github.io/kolo-blog/
https://tereza-d.github.io/kolo-blog
:::

## Relativní cesty a podsložka

Tady vzniká chyba, se kterou se potká skoro každý. Lokálně otevíráš `index.html` jako
`file:///…/portfolio/index.html`, takže stránka je **v kořeni**. Na GitHub Pages je ale
v podsložce `/portfolio/`, a absolutní cesty od kořene se najednou trefí vedle.

:::live js predict
```js
// Stránka běží na https://karelnovak.github.io/portfolio/o-mne.html
const stranka = 'https://karelnovak.github.io/portfolio/o-mne.html';
console.log(new URL('/kontakt.html', stranka).href);
```
--question-- Kam povede odkaz `<a href="/kontakt.html">`?
--expected-- https://karelnovak.github.io/kontakt.html
--why-- Lomítko na začátku znamená kořen domény, ne kořen tvého webu. Složka `/portfolio/` se z adresy vypustí.
:::

Lomítko na začátku znamená **od kořene domény**, ne od kořene tvého webu. A v kořeni
`karelnovak.github.io` je úplně jiný repozitář (nebo nic). Proto:

- uvnitř webu piš **relativní** cesty bez lomítka: `kontakt.html`, `obrazky/logo.svg`,
  `../styles.css`,
- lokálně i na Pages se pak trefí stejně,
- a kdybys web později přestěhoval na vlastní doménu, taky nic nepřepisuješ.

:::live
```html
<p>Stránka: <code>/portfolio/clanky/prvni.html</code></p>
<ul>
  <li><code>/img/foto.jpg</code> → <span class="c" data-href="/img/foto.jpg"></span></li>
  <li><code>img/foto.jpg</code> → <span class="c" data-href="img/foto.jpg"></span></li>
  <li><code>../img/foto.jpg</code> → <span class="c" data-href="../img/foto.jpg"></span></li>
</ul>
```
```js
const base = 'https://karelnovak.github.io/portfolio/clanky/prvni.html';
for (const el of document.querySelectorAll('.c')) {
  el.textContent = new URL(el.dataset.href, base).pathname;
}
```
:::

> [!REMEMBER]
> Na GitHub Pages leží web v podsložce. Cesta začínající lomítkem míří mimo něj —
> uvnitř projektu piš cesty relativně.

:::check
Proč odkaz `/styles.css` funguje lokálně, ale na GitHub Pages ne?

### --correct--
Lokálně je stránka v kořeni, na Pages v podsložce s názvem repozitáře — lomítko míří nad ni.

### --answer--
GitHub Pages nepodporuje absolutní cesty.

#### --why--
Podporuje je jako každý server. Jen se počítají od kořene domény, kde tvůj web není.

### --answer--
Protože se CSS musí načítat přes `https://`.

#### --why--
Celá adresa u vlastních souborů není potřeba a nic neřeší — cesta by pořád mířila do kořene domény.
:::

## Co GitHub Pages neumí

- **Kód na serveru** — žádné PHP, Node ani databáze. Formulář můžeš odeslat jen na cizí
  službu, která to za tebe přijme.
- **Tajemství** — všechno v repozitáři je veřejné. API klíč vložený do JavaScriptu si
  přečte kdokoli.
- **Okamžité nasazení** — mezi pushnutím a novou verzí je zpravidla 20–60 vteřin a
  prohlížeč si navíc drží starou verzi v mezipaměti. Než začneš hledat chybu, zkus
  tvrdé načtení (Ctrl+Shift+R).

:::check
Do JavaScriptu na GitHub Pages napíšeš klíč k placenému API. Co se stane?

### --correct--
Kdokoli si ho přečte ve zdrojovém kódu stránky i v repozitáři a může ho použít na tvůj účet.

### --answer--
Nic, prohlížeč klíče v JavaScriptu skrývá.

#### --why--
Neskrývá nic. Celý skript si kdokoli otevře v DevTools na kartě Sources.

### --answer--
GitHub klíč automaticky zašifruje.

#### --why--
GitHub umí šifrovaná tajemství pro GitHub Actions, ne pro soubory ve veřejném repozitáři.
:::

## Typické chyby a pasti

- **Zapomenutý `index.html`** v kořeni publikované složky → 404 na hlavní adrese.
- **Cesty s lomítkem na začátku** → styly a obrázky se nenačtou, ale jen na Pages.
- **Velká písmena v názvech souborů.** Tvůj počítač jim nejspíš nevadí, server Pages
  rozlišuje: `Foto.JPG` a `foto.jpg` jsou dva různé soubory.
- **Publikovaná větev, do které pushuješ rozdělanou práci.** Co je ve větvi, je na webu.
- **Stará verze v mezipaměti.** Než začneš hledat chybu, načti tvrdě.
- **Privátní repozitář** na bezplatném účtu Pages nepublikuje.

> [!PITFALL]
> Nejčastější past je ta nejnenápadnější: **web funguje lokálně a rozbije se až na Pages**.
> Skoro vždycky za to může cesta začínající lomítkem nebo velké písmeno v názvu souboru.
> Obojí tvůj počítač odpustí, server ne.

:::check
Web funguje lokálně, na Pages se načte stránka bez stylů. Co zkontroluješ jako první?

### --expected--
cestu k css

### --accept--
jestli cesta začíná lomítkem
relativní cestu k souboru se styly
odkaz na styles.css
:::

## Kde to najdeš v MDN

MDN má k publikování stránek návod [Publishing your website](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Publishing_your_website),
který srovnává GitHub Pages s hostingem a vlastní doménou. Vlastní dokumentace Pages je
na [docs.github.com/pages](https://docs.github.com/en/pages) — tam hledej nastavení,
vlastní doménu a řešení, když se stránka nepublikuje.

# --questions--

## --question--

Napiš adresu, na které poběží GitHub Pages uživatele `milda` z repozitáře `akademie-portfolio`.

### --expected--

https://milda.github.io/akademie-portfolio/

### --accept--

milda.github.io/akademie-portfolio/
https://milda.github.io/akademie-portfolio

### --why--

Adresa se skládá z uživatelského jména jako subdomény `github.io` a jména repozitáře jako
podsložky. Výjimka je jen repozitář pojmenovaný `milda.github.io` — ten by běžel v kořeni.

### --see--

start-nastroje/github-a-pages#adresa-na-ktere-web-pobezi

## --question--

Stránka na Pages leží na `https://milda.github.io/blog/clanky/kolo.html` a odkazuje na `../styles.css`. Napiš celou adresu, na kterou odkaz vede.

### --expected--

https://milda.github.io/blog/styles.css

### --accept--

milda.github.io/blog/styles.css

### --why--

`../` znamená o složku výš. Ze složky `clanky/` se jde do `blog/`, a tam soubor je.
Kdyby odkaz zněl `/styles.css`, mířil by na `https://milda.github.io/styles.css` — mimo
tvůj web.

### --see--

start-nastroje/github-a-pages#relativni-cesty-a-podslozka

## --question--

Co ze seznamu na GitHub Pages **nepoběží**?

### --answer--

Stránka, která si přes `fetch` stahuje data z cizího veřejného API.

#### --why--

To je kód v prohlížeči, ne na serveru. Poběží, pokud cizí API povolí CORS.

### --correct--

Přihlašovací formulář, který si ověřuje hesla proti vlastní databázi.

#### --why--

Ověřování hesel je kód na serveru a databáze je server. Pages umí jen posílat hotové
soubory. Tohle budeš potřebovat až v části o backendu.

### --answer--

Galerie, která obrázky načítá JavaScriptem ze složky v repozitáři.

#### --why--

Obrázky jsou statické soubory a JavaScript běží v prohlížeči — to Pages zvládnou.

### --see--

start-nastroje/github-a-pages#co-github-pages-neumi

## --question--

Pushnul jsi opravu, ale na adrese je pořád stará verze. Napiš, co zkusíš **první**.

### --expected--

tvrdé načtení

### --accept--

ctrl+shift+r
hard refresh
načíst stránku znovu bez cache
počkat a načíst tvrdě

### --why--

Nasazení trvá desítky vteřin a prohlížeč si navíc drží starou verzi v mezipaměti.
Tvrdé načtení je práce na dvě vteřiny a vyřeší to nejčastější případ. Teprve pak se
vyplatí koukat, jestli nasazení vůbec proběhlo.

### --see--

start-nastroje/github-a-pages#co-github-pages-neumi

## --question--

Proč se na GitHub Pages nevyplatí psát cesty začínající lomítkem?

### --correct--

Lomítko znamená kořen domény, ale web leží v podsložce s názvem repozitáře — cesta pak míří mimo něj.

#### --why--

Lokálně je stránka v kořeni, takže se rozdíl neprojeví. Na Pages se web přestěhuje do
`/<repozitar>/` a všechny cesty od kořene se trefí vedle. Relativní cesty fungují v obou
případech.

### --answer--

GitHub Pages absolutní cesty blokuje z bezpečnostních důvodů.

#### --why--

Nic neblokuje. Cesta se prostě vyhodnotí od kořene domény, kde tvůj web není.

### --answer--

Protože prohlížeč u lomítka vyžaduje `https://`.

#### --why--

Nevyžaduje. Cesta s lomítkem je běžný zápis, jen se počítá od jiného místa, než si myslíš.

### --see--

start-nastroje/github-a-pages#relativni-cesty-a-podslozka

## --question--

Jak se na GitHub Pages nasazuje nová verze webu?

### --correct--

Pushnutím do sledované větve — GitHub si toho všimne a web sám přepublikuje.

#### --why--

Proto se do sledované větve nepouští rozdělaná práce: co je v ní, je na webu. Až budeš
mít projekt, který se musí sestavit, přibude mezi push a nasazení ještě build.

### --answer--

Kliknutím na Deploy v nastavení repozitáře.

#### --why--

Takové tlačítko tam není. Nasazení spouští push.

### --answer--

Nahráním souborů přes FTP.

#### --why--

Žádné FTP tu nefiguruje — jediná cesta na server vede přes Git.

### --see--

start-nastroje/github-a-pages#co-jsou-github-pages

## --question--

Soubor s fotkou se jmenuje `Foto.JPG` a v HTML je `<img src="foto.jpg">`. Napiš, na jakém prostředí se to rozbije.

### --expected--

na github pages

### --accept--

na serveru
na pages
na linuxu
na github pages, lokálně ne

### --why--

Windows i macOS zpravidla velikost písmen v názvech nerozlišují, takže lokálně se obrázek
načte. Server Pages běží na Linuxu, kde `Foto.JPG` a `foto.jpg` jsou dva různé soubory —
a dostaneš 404. Proto se soubory pojmenovávají malými písmeny bez diakritiky.

### --see--

start-nastroje/github-a-pages#typicke-chyby-a-pasti
