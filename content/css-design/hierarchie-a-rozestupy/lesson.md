# Hierarchie a rozestupy

Máš hotovou stránku se správnými barvami i písmem, a přesto vypadá jako školní projekt? Skoro vždycky za to nemůže barva, ale to, že je všechno stejně velké, stejně daleko od sebe a v rámečku. Tuhle lekci potkáš na každé kartě produktu, v přehledu objednávky i v nastavení aplikace.

:::check pretest
Ve formuláři je popisek „Příjmení" 16 px pod polem „Jméno" a zároveň 16 px nad polem „Příjmení". Ke kterému poli popisek na první pohled patří?

### --answer--
K poli „Příjmení", protože popisky se čtou shora dolů.

#### --why--
Tak to čte ten, kdo formulář zná. Oko nového uživatele ale soudí podle vzdálenosti, a ta je na obě strany stejná.

### --correct--
Nepozná se to — je stejně daleko od obou polí.

#### --why--
Oko spojuje věci, které jsou u sebe. Když je popisek stejně daleko od obou polí, nepatří vizuálně k žádnému. Proč a jak to opravit, je v první části lekce.

### --answer--
K poli „Jméno", protože je nad ním.

#### --why--
Pořadí shora dolů tu nerozhoduje. Rozhoduje vzdálenost, a ta je stejná.
:::

:::check pretest
Karta produktu má název, popis, cenu a tlačítko. Chceš, aby cena byla vidět hned. Co zabere nejspolehlivěji?

### --answer--
Cenu zvětšit, dát jí tučné písmo, červenou barvu a velká písmena.

#### --why--
Čtyři zvýraznění naráz působí křiklavě, a když to samé později dostane i sleva a štítek, nevyčnívá nic.

### --correct--
Cenu mírně zvětšit a popis naopak ztlumit světlejší barvou.

#### --why--
Vyčnívání je vždycky poměr: důležitá věc vyskočí, když ostatní ustoupí. K téhle myšlence se lekce vrátí u velikosti, váhy a barvy.

### --answer--
Dát cenu do rámečku.

#### --why--
Rámeček přidá další čáru, o kterou oko zakopne. Na kartě, kde už jsou rámečky, cenu spíš schová.
:::

## Problém: všechno je stejně důležité

Tady je souhrn objednávky tak, jak ho často postaví vývojář bez návrhu. Barvy jsou v pořádku, písmo taky, a přesto se v něm hledá.

:::live
```html
<article class="order">
  <h2>Objednávka č. 2026-0412</h2>
  <p>Stav: Odesláno</p>
  <p>Doručení: út 20. 10., Zásilkovna Brno, Údolní 15</p>
  <p>Kávovar Sage Bambino Plus: 9 490 Kč</p>
  <p>Mlýnek Baratza Encore ESP: 4 290 Kč</p>
  <p>Doprava: 79 Kč</p>
  <p>Celkem: 13 859 Kč</p>
  <button>Sledovat zásilku</button>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #f4f5f7; color: #1f2937; }

.order {
  max-width: 24rem;
  padding: 10px;
  border: 1px solid #9ca3af;
  background: #fff;
}

.order h2,
.order p {
  margin: 10px 0;
  padding: 6px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  font-weight: 700;
}

.order button {
  padding: 6px 12px;
  border: 1px solid #9ca3af;
  font-weight: 700;
}
```
:::

Zkus smazat v pravidle `.order h2, .order p` deklaraci `font-weight: 700` a pak i celý `border`. Sleduj, jak se najednou dá říct, co je nadpis a co jen údaj.

Stránku čteš očima v nějakém pořadí: nejdřív to, co vyskočí, pak skupiny, nakonec podrobnosti. Tomuhle pořadí se říká [[vizuální hierarchie]] (*visual hierarchy*). V ukázce žádné pořadí není — všechno má stejnou velikost, váhu, rámeček i vzdálenost, takže oko musí číst řádek po řádku.

> [!REMEMBER]
> **Hierarchie je pořadí, ve kterém oko čte stránku. Vytváříš ji rozdílem: důležité vyčnívá, protože vedlejší ustoupí.** Nástroje máš čtyři — vzdálenost, velikost, váhu a barvu.

:::check
V souhrnu objednávky mají všechny údaje `font-weight: 700`. Kolega navrhuje zvýraznit částku „Celkem" tím, že jí dá `font-weight: 900`. Proč to skoro nepomůže?

### --answer--
Protože `font-weight: 900` prohlížeč neumí a použije 700.

#### --why--
Systémové písmo váhu 900 většinou má. Problém by zůstal, i kdyby rozdíl 700 a 900 byl vidět dokonale.

### --correct--
Protože vyčnívání dělá rozdíl oproti okolí, a mezi 700 a 900 skoro žádný není, když je tučné všechno ostatní.

#### --why--
Hierarchie je poměr. Aby „Celkem" vyskočilo, musí ostatní údaje ustoupit — třeba na normální váhu.

### --answer--
Protože tučné písmo se na zvýraznění nepoužívá, jen barva.

#### --why--
Váha je jeden ze čtyř nástrojů hierarchie a funguje dobře. Jen potřebuje rozdíl.
:::

## Blízkost a seskupení

Nejsilnější nástroj hierarchie není velikost ani barva, ale **vzdálenost**. Oko automaticky spojuje věci, které jsou u sebe, a odděluje ty, mezi kterými je místo. V psychologii vnímání se tomu říká [[princip blízkosti]] (*law of proximity*).

Pro rozestupy z toho plyne jedno pravidlo: **mezera uvnitř skupiny musí být viditelně menší než mezera mezi skupinami.** Obvykle aspoň dvakrát. Popisek pole je blíž svému poli než poli nad ním, řádky jedné adresy jsou blíž sobě než dalšímu bloku.

Ukázka má dvě skupiny údajů. Posuvníky mění mezeru uvnitř skupiny (mezi popiskem a hodnotou) a mezeru mezi skupinami.

:::live
```html
<dl class="details">
  <div class="detail">
    <dt>Příjezd</dt>
    <dd>pá 9. 10. 2026, od 15:00</dd>
  </div>
  <div class="detail">
    <dt>Odjezd</dt>
    <dd>ne 11. 10. 2026, do 10:00</dd>
  </div>
  <div class="detail">
    <dt>Hosté</dt>
    <dd>4 dospělí, 1 pes</dd>
  </div>
</dl>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; }

.details {
  display: flex;
  flex-direction: column;
  gap: var(--outer);
  max-width: 20rem;
  margin: 0;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: var(--inner);
}

.detail dt { color: #6b7280; font-size: 0.875rem; }
.detail dd { margin: 0; font-weight: 600; }
```
```controls
--inner: range(0, 32, 4, px) = 16 | Mezera uvnitř skupiny
--outer: range(0, 48, 4, px) = 16 | Mezera mezi skupinami
```
:::

Ve výchozím stavu jsou obě mezery 16 px a popisky „visí" mezi hodnotami. Nastav uvnitř skupiny 4 px a mezi skupinami 24 px — údaje se samy rozpadnou do tří dvojic. Pak zkus opak, 24 px uvnitř a 4 px mezi, a sleduj, jak se popisky přilepí k cizí hodnotě.

:::check
Adresa v patičce e-shopu má tři řádky a pod ní je blok s otevírací dobou. Řádky adresy jsou od sebe 8 px. Jaká je nejmenší rozumná mezera mezi adresou a otevírací dobou v px, když se držíš pravidla „aspoň dvakrát víc"?

### --expected--
16

### --accept--
16 px
16px

### --why--
Uvnitř skupiny 8 px, mezi skupinami aspoň dvojnásobek, tedy 16 px. Na stupnici z další části by to bylo 16 nebo 24 px.
:::

## Stupnice rozestupů

Když rozestupy volíš od oka, vznikne na stránce 13 px, 15 px, 18 px a 22 px. Rozdíly jsou tak malé, že je nikdo nevidí jako záměr, a stránka působí neuspořádaně. Řešením je [[stupnice rozestupů]] (*spacing scale*): pevná sada hodnot, ze kterých vybíráš.

Nejčastější je stupnice na **násobcích 4 px** (u větších hodnot násobcích 8 px):

| token | rem | px | typicky |
|---|---|---|---|
| `--space-1` | 0.25 | 4 | ikona a text, popisek a hodnota |
| `--space-2` | 0.5 | 8 | řádky jedné skupiny |
| `--space-3` | 0.75 | 12 | vnitřek tlačítka, položky seznamu |
| `--space-4` | 1 | 16 | odstavce, pole formuláře |
| `--space-6` | 1.5 | 24 | vnitřek karty, skupiny v kartě |
| `--space-8` | 2 | 32 | bloky v sekci |
| `--space-12` | 3 | 48 | sekce na mobilu |
| `--space-16` | 4 | 64 | sekce stránky |

Všimni si, že kroky nejsou rovnoměrné: dole po 4 px, nahoře po 16 px. Mezi 48 a 52 px rozdíl nikdo nevidí, mezi 4 a 8 px ano. **Na stupnici volíš, jestli má být mezera o stupeň větší, a ne o kolik pixelů.** Méně rozhodování, stejné mezery na celé stránce.

Tokeny v `rem` se navíc zvětší, když si uživatel v prohlížeči zvětší výchozí písmo — rozestupy rostou spolu s textem.

:::compare
```html
<section class="profile">
  <h3>Tereza Nováková</h3>
  <p class="profile__role">Frontend vývojářka, Ostrava</p>
  <p class="profile__bio">Stavím přístupné webové aplikace a učím začátečníky, jak psát CSS, které vydrží.</p>
  <button>Napsat zprávu</button>
</section>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; background: #f4f5f7; }
.profile { max-width: 20rem; background: #fff; border-radius: 12px; }
.profile h3 { margin: 0; font-size: 1.25rem; }
.profile__role { color: #6b7280; }
.profile button { padding: 0.5rem 1rem; border: 0; border-radius: 8px; background: #1f2937; color: #fff; }
```
--variant-- Od oka
```css
.profile { padding: 19px 22px; }
.profile__role { margin: 3px 0 13px; }
.profile__bio { margin: 0 0 15px; }
```
--variant-- Na stupnici
```css
.profile { padding: 1.5rem; }
.profile__role { margin: 0.25rem 0 1rem; }
.profile__bio { margin: 0 0 1.5rem; }
```
:::

Rozdíl je malý, ale vpravo mají mezery jasný vztah: jméno a role tvoří dvojici (4 px), text je samostatný blok (16 px) a tlačítko má nad sebou stejně místa jako karta na krajích (24 px). Zkus ve variantě „Na stupnici" změnit `0.25rem` na `1rem` a sleduj, jak se role odtrhne od jména.

:::check
Používáš stupnici 4, 8, 12, 16, 24, 32, 48, 64 px. Mezera mezi nadpisem a textem je 24 px a působí pořád moc natěsno. Jakou hodnotu vezmeš jako další? Napiš číslo v px.

### --expected--
32

### --accept--
32 px
32px

### --why--
Na stupnici jdeš o jeden stupeň výš, tedy na 32 px. Hodnoty jako 26 nebo 28 px na stupnici nejsou a rozdíl oproti 24 px by nikdo neviděl.
:::

## Velikost, váha a barva

Když jsou skupiny oddělené vzdáleností, přijde na řadu zvýraznění uvnitř nich. Máš tři nástroje a každý dělá něco jiného:

- **Velikost** — nejhrubší nástroj. Rozhoduje, co se čte první (nadpis, cena, velké číslo v přehledu). Nepoužívej ji na všechno, jinak stránka „křičí".
- **Váha** — jemnější. Dvě váhy stačí skoro vždycky: normální (400) na text a tučnější (600 nebo 700) na nadpisy a důležité hodnoty.
- **Barva** — nejlépe se hodí k **ztlumení**. Vedlejší text (popisky, datum, nápověda) dostane světlejší barvu. Obvykle vystačíš se třemi barvami textu: hlavní, vedlejší a tlumená.

Nejčastější chyba je zvýrazňovat. Lepší výsledek dá **ztlumit to, co není důležité**: popisek „Celkem" světlejší a menší, částka zůstane normální barvou, jen větší a tučnější.

:::live
```html
<article class="stat">
  <p class="stat__label">Tržby za září</p>
  <p class="stat__value">184 250 Kč</p>
  <p class="stat__meta">o 12 % víc než v srpnu</p>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #111827; }

.stat { display: flex; flex-direction: column; gap: 0.25rem; max-width: 16rem; }
.stat p { margin: 0; }

.stat__label { font-size: 0.875rem; color: var(--muted); }
.stat__value { font-size: var(--value-size); font-weight: var(--weight); }
.stat__meta { font-size: 0.875rem; color: var(--muted); }
```
```controls
--value-size: range(1, 2.5, 0.25, rem) = 1 | Velikost hodnoty
--weight: select(400, 600, 700) = 400 | Váha hodnoty
--muted: toggle(#111827, #6b7280) | Barva popisků
```
:::

Nejdřív přepni jen barvu popisků na šedou. Pak přidej velikost 1.75rem a váhu 600. Všimni si, že po ztlumení popisků stačí hodnotě mnohem menší zvětšení, aby vyskočila.

:::check
Seznam e-mailů má u každé zprávy odesílatele, předmět a čas. Předmět je nejdůležitější. Kterou vlastnost změníš u času, aby předmět vyčníval, aniž bys na předmět sáhl?

### --answer--
`font-weight: 700`, aby čas byl dobře vidět.

#### --why--
Tím by čas vyčníval **víc**, a předmět by v řádku ztratil.

### --correct--
`color` na tlumenější odstín.

#### --why--
Ztlumení vedlejšího údaje vytvoří rozdíl, aniž bys přidával křiklavé zvýraznění důležitého.

### --answer--
`text-transform: uppercase`, aby se čas odlišil.

#### --why--
Velká písmena text zvýrazní a hůř se čtou. Čas by tím spíš přitáhl pozornost.
:::

## Zarovnání a bílé místo

Oko hledá hrany. Když prvky na stránce začínají každý jinde (nadpis vycentrovaný, text zleva, tlačítko vpravo), stránka působí rozházeně, i když je každý prvek hezký.

- **Zarovnávej k jedné hraně.** Texty v kartě začínají na stejné levé hraně, ikona se srovná s prvním řádkem textu.
- **Delší text zarovnej doleva.** Na střed jen krátký nadpis nebo tlačítko, tři řádky vycentrovaného textu se čtou špatně, protože každý řádek začíná jinde.
- **Čísla ve sloupci doprava a se stejně širokými číslicemi.** Deklarace `font-variant-numeric: tabular-nums` dá každé číslici stejnou šířku, takže se řády srovnají pod sebe.
- **Bílé místo** (*whitespace*) není prázdné místo, které je potřeba zaplnit. Odděluje skupiny a dává důležitým věcem prostor. Začni s víc místem, než se ti zdá potřeba, a uber, až to vypadá rozvolněně.

:::live
```html
<table class="receipt">
  <tr><td>Kávovar</td><td class="num">9 490 Kč</td></tr>
  <tr><td>Mlýnek</td><td class="num">4 290 Kč</td></tr>
  <tr><td>Odvápňovač</td><td class="num">189 Kč</td></tr>
  <tr><td>Doprava</td><td class="num">79 Kč</td></tr>
</table>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; }

.receipt { border-collapse: collapse; min-width: 16rem; }
.receipt td { padding: 0.25rem 0; }
.num {
  text-align: var(--align);
  font-variant-numeric: var(--digits);
}
```
```controls
--align: select(left, right) = left | Zarovnání částek
--digits: toggle(normal, tabular-nums) | Šířka číslic
```
:::

Přepni zarovnání částek doprava a pak zapni `tabular-nums`. Sleduj, jak se stovky a tisíce srovnají přesně pod sebe a částky jde porovnat jedním pohledem.

:::check
V tabulce faktur jsou ve sloupci částky 1 250 Kč a 980 Kč a jednotky ani po zarovnání doprava nejsou přesně pod sebou, protože jednička je užší než osmička. Napiš deklaraci, která to opraví.

### --expected--
font-variant-numeric: tabular-nums

### --why--
V proporcionálním písmu mají číslice různou šířku. `tabular-nums` jim dá stejnou, takže se řády srovnají.
:::

## Méně rámečků, víc rozestupů

Rámeček je nejhlasitější způsob, jak něco oddělit: přidá čáru, o kterou oko zakopne. Když má rámeček každý blok, stránka je plná čar a skupiny se v nich ztrácí. Na oddělení máš tišší nástroje, ve zhruba tomhle pořadí:

1. **Mezera** — nic nepřidává, jen odděluje.
2. **Rozdílné pozadí** — karta na šedém podkladu, zvýrazněný řádek.
3. **Stín** — karta se zvedne nad podklad.
4. **Jedna tenká a světlá čára** — až když nic z toho nestačí, třeba mezi položkami a součtem.

Obě varianty níž mají stejné HTML i text. Liší se jen tím, jak oddělují části.

:::compare
```html
<article class="plan">
  <p class="plan__name">Tarif Rodina</p>
  <p class="plan__price">549 Kč <span>/ měsíc</span></p>
  <ul class="plan__list">
    <li>5 profilů</li>
    <li>4K a HDR</li>
    <li>Stahování do 6 zařízení</li>
  </ul>
  <button class="plan__button">Vybrat tarif</button>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; background: #f1f3f6; }
.plan { max-width: 17rem; background: #fff; }
.plan p { margin: 0; }
.plan__name { color: #6b7280; font-size: 0.875rem; }
.plan__price { font-size: 1.75rem; font-weight: 700; }
.plan__price span { color: #6b7280; font-size: 1rem; font-weight: 400; }
.plan__list { margin: 0; padding-left: 1.25rem; }
.plan__button { width: 100%; padding: 0.625rem; border: 0; border-radius: 8px; background: #4338ca; color: #fff; font-weight: 600; }
```
--variant-- Rámečky
```css
.plan { padding: 8px; border: 2px solid #9ca3af; }
.plan__name, .plan__price, .plan__list { padding: 8px; border: 1px solid #d1d5db; margin-bottom: 8px; }
```
--variant-- Rozestupy a stín
```css
.plan { display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem; border-radius: 16px; box-shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 12px 32px -8px rgb(15 23 42 / 0.18); }
.plan__name { margin-bottom: -0.75rem; }
```
:::

Vpravo nezůstala jediná čára, a přesto je jasné, co k sobě patří. Záporný margin u názvu tarifu jen přitahuje název k ceně (dvojice), zatímco `gap` drží zbytek bloků dál od sebe. Zkus ve variantě „Rozestupy a stín" smazat `box-shadow` — karta od šedého podkladu pořád odliší, jen barvou pozadí.

:::check
Seznam notifikací má každou notifikaci v rámečku a mezi nimi 8 px. Kterou úpravou uděláš první krok k „méně rámečků" a přitom zachováš, že je každá notifikace samostatná?

### --answer--
Rámečky smazat a mezeru mezi notifikacemi nechat 8 px.

#### --why--
Bez rámečku 8 px mezi notifikacemi splyne s mezerami uvnitř notifikace, takže se hranice ztratí.

### --correct--
Rámečky smazat a mezeru mezi notifikacemi zvětšit nad mezery uvnitř notifikace, případně přidat jemné oddělení pozadím.

#### --why--
Rámeček nahradí vzdálenost a rozdíl pozadí. Mezera mezi skupinami musí být větší než uvnitř nich.

### --answer--
Rámečky nechat a zesvětlit jim barvu na skoro bílou.

#### --why--
Světlejší čáry sice ruší méně, ale pořád je to rámeček u každého bloku. Oddělení vzdáleností se tím nezmění.
:::

## Hloubka: stín místo čáry

Stín dělá z plochého bloku předmět, který leží nad podkladem. Aby vypadal jako skutečný, a ne jako šmouha, skládá se ze **dvou vrstev**: malý ostrý stín těsně pod hranou (kontakt s podkladem) a velký rozmazaný stín posunutý dolů (světlo shora). Obě vrstvy jsou průhledné, takže fungují na jakémkoli světlém podkladu.

```css
.card {
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 12px 32px -8px rgb(15 23 42 / 0.18);
}
```

Hodnoty stínu jsou v pořadí: posun vodorovně, posun svisle, rozmazání, roztažení (záporné stín zúží, aby nevylezl do stran) a barva. Posuvník v ukázce mění, jak vysoko karta „leží".

:::live
```html
<article class="event">
  <p class="event__date">čt 15. 10. · 19:30</p>
  <h3 class="event__title">Jazz v Lucerně</h3>
  <p class="event__place">Lucerna Music Bar, Praha</p>
</article>
```
```css
body { margin: 2rem; font-family: system-ui, sans-serif; color: #1f2937; background: #eef1f5; }

.event {
  max-width: 18rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: #fff;
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 var(--lift) calc(var(--lift) * 2.5) calc(var(--lift) * -0.5) rgb(15 23 42 / 0.2);
  translate: 0 calc(var(--lift) * -0.25);
  transition: box-shadow 200ms ease, translate 200ms ease;
}

.event p, .event h3 { margin: 0; }
.event__date { color: #b45309; font-size: 0.875rem; font-weight: 600; }
.event__title { margin-block: 0.25rem; font-size: 1.25rem; }
.event__place { color: #6b7280; }
```
```controls
--lift: range(0, 24, 2, px) = 8 | Výška nad podkladem
```
:::

Posuň výšku na 0 a pak na 24 px. Plynulost změny zajišťuje `transition` — k přechodům se dostaneš v sekci o animacích, teď si jen všimni, že zvednutí karty při najetí myší je přesně tahle změna stínu. Zkus v kódu změnit barvu stínu na `rgb(0 0 0 / 0.6)` a uvidíš, proč se stíny dělají průhledné a jemné.

:::check
Máš stín `0 12px 32px -8px rgb(15 23 42 / 0.18)`. Co udělá záporné čtvrté číslo `-8px`?

### --answer--
Posune stín o 8 px nahoru.

#### --why--
Svislý posun je druhé číslo (`12px`). Čtvrté číslo s posunem nic nedělá.

### --correct--
Zmenší stín na všech stranách o 8 px, takže při velkém rozmazání nevyleze do stran.

#### --why--
Čtvrtá hodnota je roztažení (*spread*). Záporné stín zúží a velký rozmazaný stín pak zůstane hlavně pod kartou.

### --answer--
Zmenší průhlednost stínu.

#### --why--
Průhlednost je v barvě (`/ 0.18`). Čtvrté číslo mění velikost stínu.
:::

## Typické chyby a pasti

První past je v mezeře pod nadpisem. Nadpis má velké písmo a margin v jednotce `em`. Než odkryješ náhled, tipni si:

:::live predict
```html
<article class="post">
  <h2 class="post__title">Jak jsme zrychlili web o 40 %</h2>
  <p class="post__text">Za dva měsíce jsme zmenšili obrázky, odložili skripty a přestali načítat písma z cizích serverů.</p>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; }

.post__title {
  margin: 0 0 1em;
  font-size: 2rem;
  line-height: 1.2;
  outline: 1px dashed #f97316;
}

.post__text {
  margin: 0;
  outline: 1px dashed #0ea5e9;
}
```
--question-- Kořen stránky má výchozí písmo 16 px. Jak velká bude mezera mezi nadpisem a odstavcem?
--option-- 16 px, protože `1em` je 16 px.
--option*-- 32 px, protože `em` se u nadpisu počítá z jeho vlastního písma.
--option-- 24 px, protože se použije průměr písma nadpisu a odstavce.
--why-- `em` u marginu se počítá z `font-size` **téhož prvku**. Nadpis má `2rem` = 32 px, takže `1em` je u něj 32 px. Mezera, kterou jsi chtěl mít na stupnici 16 px, se tiše zdvojnásobí, a když nadpis zvětšíš, poroste s ním. Rozestupy piš v `rem` nebo tokenech stupnice.
--see-- css-design/hierarchie-a-rozestupy#stupnice-rozestupu
:::

> [!PITFALL] Mezera v `em` u velkého písma
> *Příznak:* pod nadpisem s `font-size: 2rem` a `margin-bottom: 1em` je 32 px místo 16 px a mezery na stránce nesedí na stupnici.
>
> *Oprava:* rozestupy piš v `rem` nebo přes tokeny (`margin-block-end: var(--space-4)`). `em` nech na věci, které mají růst s písmem prvku, třeba vnitřek tlačítka.

> [!PITFALL] Stejná mezera nad i pod popiskem
> *Příznak:* popisek pole nebo mezititulek „visí" mezi dvěma bloky a uživatel neví, ke kterému patří.
>
> *Oprava:* mezera k vlastnímu obsahu menší (4–8 px), mezera k předchozí skupině aspoň dvojnásobná.

> [!PITFALL] Zvýrazněné všechno
> *Příznak:* cena, sleva, štítek i název mají tučné písmo a výraznou barvu a nic z nich nevyčnívá.
>
> *Oprava:* vyber jednu věc, která se má číst první, a všechno kolem ztlum barvou nebo menší velikostí.

> [!PITFALL] Šedý text na barevném pozadí
> *Příznak:* tlumený text `#6b7280` na modrém tlačítku nebo tmavém banneru vypadá špinavě a špatně se čte.
>
> *Oprava:* na barevném pozadí ztlum text průhledností bílé (`rgb(255 255 255 / 0.8)`) nebo odstínem stejné barvy, jako je pozadí. Jak to spočítat přesně, ukáže lekce o barvách.

:::explain
Vysvětli vlastními slovy, proč karta s rozestupy a jedním stínem působí přehledněji než stejná karta s rámečkem kolem každé části.

## --model--
Oko spojuje věci, které jsou u sebe, takže vzdálenost sama vytvoří skupiny a nepotřebuje čáry. Každý rámeček je další čára, o kterou oko zakopne, a když ho má každá část, žádná hranice nevyčnívá. Menší mezera uvnitř skupin a větší mezi nimi rozdělí kartu tiše a stín ji jako celek oddělí od podkladu.

## --checklist--
- Oko seskupuje podle vzdálenosti (princip blízkosti).
- Mezera uvnitř skupiny je menší než mezi skupinami.
- Každý rámeček přidává čáru, která ruší a přestane něco odlišovat, když je všude.
- Stín nebo rozdílné pozadí oddělí celou kartu bez čar uvnitř.
:::

:::check
Tlačítko má `font-size: 1.125rem` a `padding: 0.5em 1em`. Kořen stránky má písmo 16 px. Kolik px je vnitřní odsazení tlačítka vlevo a vpravo?

### --expected--
18

### --accept--
18 px
18px

### --why--
`1.125rem` je 18 px a `em` v paddingu se počítá z písma tlačítka, takže `1em` = 18 px. Tady je to záměr: větší tlačítko dostane úměrně větší vnitřek. U mezer mezi bloky by stejné chování stupnici rozbilo.
:::

Ve workshopu, který následuje, tyhle nástroje použiješ na potvrzení rezervace chaty: z karty plné rámečků uděláš souhrn, který se čte na první pohled.

## Kde to najdeš v MDN

- [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) — pořadí hodnot stínu, víc vrstev oddělených čárkou a klíčové slovo `inset`.
- [gap](https://developer.mozilla.org/en-US/docs/Web/CSS/gap) — mezery mezi položkami ve flexu i gridu, na kterých stojí rozestupy uvnitř komponent.
- [font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric) — `tabular-nums` a další varianty číslic pro tabulky a ceny.
- [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — jak zapsat stupnici rozestupů jako proměnné a použít ji přes `var()`.

# --questions--

## --question--

Karta článku má `padding: 16px`, mezi nadpisem a perexem 16 px a mezi perexem a řádkem „autor · datum" taky 16 px. Karta působí rozsypaně. Kterou jednu mezeru změníš jako první a na kolik px, když chceš, aby nadpis a perex tvořily dvojici? Napiš jen číslo nové mezery mezi nadpisem a perexem.

### --expected--

8

### --accept--

8 px
8px
4
4 px
4px

### --why--

Nadpis a perex patří k sobě, takže mezera mezi nimi má být viditelně menší než ostatní: 8 px (nebo 4 px). Mezery 16 px ke kraji a k řádku s autorem pak oddělují skupiny.

### --see--

css-design/hierarchie-a-rozestupy#blizkost-a-seskupeni

## --question--

Stupnice rozestupů má hodnoty 4, 8, 12, 16, 24, 32, 48 a 64 px. Kolega napsal `padding: 20px` a zdůvodnil to tím, že 16 je málo a 24 moc. Jak zareaguješ?

### --answer--

Přidáme 20 px do stupnice, když ho potřebuje.

#### --why--

Každá hodnota navíc je další rozhodnutí u každé příští mezery a stupnice se postupně rozpadne zpátky na hodnoty od oka.

### --correct--

Vybereme 16 nebo 24 px; když ani jedno nesedí, problém je spíš v okolních mezerách než v chybějícím stupni.

#### --why--

Rozdíl 4 px na takové velikosti skoro nikdo nevidí. Stupnice funguje, jen když z ní nevybočuješ — a když nic nesedí, obvykle se hierarchie rozbila jinde, třeba mezera uvnitř skupiny je příliš velká.

### --answer--

Necháme 20 px, protože na jedné kartě na tom nezáleží.

#### --why--

Jedna výjimka se kopíruje do dalších komponent. Za měsíc jsou na stránce zase mezery od oka.

### --see--

css-design/hierarchie-a-rozestupy#stupnice-rozestupu

## --question--

Stín karty je `0 16px 40px rgb(0 0 0 / 0.5)` a karta vypadá jako obklopená tmavou šmouhou. Napiš, kterou část hodnoty změníš jako první, aby stín působil jemně. Stačí jedno slovo: posun, rozmazání, nebo barva.

### --expected-- ignore-case

barva

### --accept--

barvu
průhlednost
průhlednost barvy

### --why--

Alfa 0.5 je na stín na světlém podkladu příliš tmavá. Jemné stíny mají průhlednost kolem 0.06–0.2, případně se skládají ze dvou slabých vrstev.

### --see--

css-design/hierarchie-a-rozestupy#hloubka-stin-misto-cary
