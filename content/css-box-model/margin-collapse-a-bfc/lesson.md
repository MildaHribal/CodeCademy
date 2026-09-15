# Margin collapse a BFC

Mezera mezi sekcemi landing page je menší, než jsi napsal, nadpis v kartě posune celou kartu dolů místo aby se odsunul od jejího okraje, a po přepnutí na flexbox se všechny mezery zdvojnásobí. Za všemi třemi stojí jedno pravidlo normálního toku. Nejdřív odhad.

:::check pretest
Odstavec A má `margin-bottom: 24px`, hned pod ním je odstavec B s `margin-top: 16px`. Kolik pixelů bude mezi nimi?

### --expected--
24

### --accept--
24 px
24px

### --why--
Nesečte se to na 40 px. Svislé marginy sousedních bloků se slévají a zůstane jen ten větší. Proč a kdy přesně, je obsah lekce.
:::

:::check pretest
Karta s pozadím nemá padding. Její první prvek je nadpis `<h2>` s `margin-top: 32px`. Kde bude těch 32 px vidět?

### --answer--
Uvnitř karty, mezi horní hranou karty a nadpisem.

#### --why--
Tak by to bylo, kdyby karta měla horní padding nebo rámeček. Bez nich se stane něco jiného.

### --correct--
Nad kartou: celá karta se posune o 32 px dolů a nadpis bude nalepený na její horní hraně.

#### --why--
Margin nadpisu se slil s marginem karty a „utekl" ven. Za chvíli uvidíš, proč a jak ho udržet uvnitř.

### --answer--
Nikde, margin prvního dítěte prohlížeč zahodí.

#### --why--
Zahozený není, jen se objeví jinde, než čekáš. Podívej se na polohu celé karty.
:::

## Problém: mezera, která se nesčítá

Tady jsou dvě sekce landing page. Autor chtěl mezi nimi 64 px, a tak dal první sekci `margin-bottom: 32px` a druhé `margin-top: 32px`:

:::live
```html
<section class="band band--hero">
  <h1>Kurz keramiky pro začátečníky</h1>
</section>
<section class="band">
  <h2>Co se naučíš</h2>
</section>
<p class="ruler">↑ mezera mezi sekcemi má být 64 px</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.band {
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  background: #fef3c7;
}

.band h1, .band h2 { margin: 0; }

.band--hero {
  margin-bottom: 32px;
  background: #fde68a;
}

.band + .band {
  margin-top: 32px;
}

.ruler { color: #64748b; font-size: 0.875rem; }
```
:::

Mezera je jen 32 px. Zkus v `.band + .band` změnit `margin-top` na `48px` a pak na `8px`. Mezera bude vždycky ten **větší** z obou marginů.

Tomu se říká [[slévání marginů]] (*margin collapsing*):

> [!REMEMBER]
> **Svislé marginy, které se v normálním toku dotknou, se nesčítají, ale slijí: zůstane z nich jen ten největší.** Týká se to jen svislých marginů blokových boxů, vodorovné marginy se nikdy neslévají.

Proč to CSS dělá? Kvůli textu. Odstavce mají výchozí `margin-block: 1em`. Kdyby se marginy sčítaly, byla by mezi odstavci dvojnásobná mezera proti mezeře nad prvním odstavcem. Díky slévání je mezi odstavci pořád jedno `1em`.

:::check
Nadpis `h2` má `margin-bottom: 12px` a odstavec pod ním `margin-top: 20px`. Kolik pixelů je mezi nimi?

### --expected--
20

### --accept--
20 px
20px

### --why--
Marginy se dotýkají, takže se slijí a zůstane větší z nich: 20 px. Součet 32 px by vyšel ve flexboxu nebo gridu, tam se marginy neslévají.
:::

## Kdy se marginy slévají

Slévání nastane ve třech situacích. Všechny mají společné, že **mezi dvěma marginy nic není**: žádný padding, rámeček ani obsah.

1. **Sousední bloky** — spodní margin jednoho a horní margin dalšího.
2. **Rodič a první nebo poslední dítě** — horní margin rodiče s horním marginem prvního dítěte, spodní margin rodiče se spodním marginem posledního dítěte. Když rodič nemá margin žádný (je nulový), slije se s nulou a margin dítěte se objeví **vně** rodiče.
3. **Prázdný blok** — blok bez obsahu, paddingu, rámečku a výšky. Jeho horní a spodní margin se slijí do jednoho.

Se zápornými marginy se počítá takhle: největší kladný plus nejzápornější záporný. `24px` a `-8px` dají 16 px.

Druhá situace je ta, která dělá nejvíc potíží. Prohlédni si ji naživo:

:::live
```html
<p class="intro">Úvodní text nad kartou.</p>
<article class="card">
  <h2 class="card__title">Točení na kruhu</h2>
  <p class="card__text">Šest večerů, hlína a glazury v ceně.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.intro { margin: 0; color: #64748b; }

.card {
  display: var(--display);
  padding-inline: 1.25rem;
  border-radius: 0.75rem;
  background: #ccfbf1;
}

.card__title { margin-block: 1.5rem 0.5rem; }
.card__text { margin-block: 0 1.5rem; }
```
```controls
--display: toggle(block, flow-root) = block | display karty
```
:::

S `display: block` je nadpis nalepený na horní hraně tyrkysové karty a text na spodní. Margin nadpisu (24 px) utekl nad kartu a margin odstavce pod ni. Přepni na `flow-root`: marginy zůstanou uvnitř karty a karta se o ně zvětší. Co `flow-root` dělá, vysvětlí další část. Zkus ještě vrátit `block` a kartě dopsat `padding-block: 1px;` — i jeden pixel paddingu marginy od sebe oddělí.

:::check
Karta má `background` a `padding: 0 1rem`. Její poslední prvek je odstavec s `margin-bottom: 20px`. Pod kartou je další karta bez horního marginu. Kde bude mezera 20 px?

### --answer--
Uvnitř první karty, pod odstavcem.

#### --why--
Mezi marginem odstavce a spodní hranou karty nic není (padding je jen po stranách), takže margin v kartě nezůstane.

### --correct--
Mezi kartami, pod pozadím první karty.

#### --why--
Spodní margin posledního dítěte se slil se spodním marginem karty (nula) a objevil se pod ní. Pozadí první karty končí hned pod textem.

### --answer--
Nikde, poslední dítě margin ztratí.

#### --why--
Margin nezmizí, jen se přesune vně rodiče. Podívej se na mezeru mezi kartami.
:::

## Kdy se marginy neslévají

Stačí, aby mezi marginy něco stálo, nebo aby prvky nebyly obyčejné bloky v normálním toku:

| situace | slévá se? |
|---|---|
| vodorovné marginy (`margin-inline`) | nikdy |
| rodič má `padding-block` nebo `border-block` na té straně | ne |
| rodič je `display: flow-root`, `inline-block` nebo má `overflow: hidden`, `auto` či `scroll` | ne (s dětmi) |
| prvky jsou položky flexboxu nebo gridu | ne |
| plovoucí (`float`) a absolutně pozicované prvky | ne |
| obyčejné bloky pod sebou nebo rodič a dítě bez oddělení | **ano** |

Poslední řádek je výchozí stav celé stránky. Tipni si, co se stane, když kontejner přepneš na flexbox:

:::live predict
```html
<div class="list">
  <p class="item">Pondělí 18:00 — Točení na kruhu</p>
  <p class="item">Středa 18:00 — Glazování</p>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.list {
  display: flex;
  flex-direction: column;
}

.item {
  margin-block: 16px;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #e0e7ff;
}
```
--question-- Obě položky mají `margin-block: 16px` a kontejner je flexbox ve sloupci. Kolik pixelů bude mezi položkami?
--option-- 16 px, marginy se slijí.
--option*-- 32 px, ve flexboxu se marginy nesčítají do jednoho, ale leží vedle sebe.
--option-- 0 px, flexbox marginy položek ignoruje.
--why-- Slévání marginů je pravidlo normálního toku. Flex položky ho nemají, takže 16 + 16 = 32 px. Smaž `display: flex` a `flex-direction` a mezera spadne na 16 px. Proto se po přepnutí seznamu na flexbox nebo grid často „zdvojnásobí" mezery.
--see-- css-box-model/margin-collapse-a-bfc#kdy-se-marginy-neslevaji
:::

:::check
Dvě tlačítka s `display: inline-block` stojí v řádku vedle sebe. První má `margin-right: 12px`, druhé `margin-left: 8px`. Kolik pixelů marginu je mezi nimi (mezeru z HTML nepočítej)?

### --expected--
20

### --accept--
20 px
20px

### --why--
Vodorovné marginy se nikdy neslévají, sečtou se: 12 + 8 = 20 px. Slévají se jen svislé marginy bloků v normálním toku.
:::

## Blokový formátovací kontext

Proč `flow-root` udržel marginy v kartě? Protože založil [[blokový formátovací kontext]] (*block formatting context*, zkratka **BFC**). Je to oblast stránky, ve které se bloky rozvrhují podle pravidel normálního toku **nezávisle na okolí**:

- marginy dětí se neslijí s marginy prvku, který BFC zakládá — zůstanou uvnitř,
- prvek obalí i plovoucí (`float`) děti, takže z něj nevyčuhují (k `float` se dostaneš v lekci o přetečení),
- sám se nepřekrývá s plovoucími prvky vedle sebe.

BFC zakládá kořen stránky `<html>` a mimo jiné tyhle prvky:

| co | poznámka |
|---|---|
| `display: flow-root` | jediný účel: založit BFC, bez vedlejších efektů |
| `display: inline-block` | prvek přitom začne téct v řádku |
| `overflow: hidden`, `auto`, `scroll` | ořízne nebo posouvá obsah, viz pasti |
| `float`, `position: absolute` a `fixed` | vytáhnou prvek z normálního toku |
| flex a grid položky | položky rozvrhuje rodič |

> [!REMEMBER]
> **Chceš-li, aby rodič držel marginy dětí uvnitř, dej mu `display: flow-root`, nebo mezi marginy dej padding či rámeček.** `flow-root` nic jiného nemění, proto je lepší než staré triky s `overflow: hidden`.

:::explain
Vysvětli vlastními slovy, co je blokový formátovací kontext a proč `display: flow-root` na kartě zabránil tomu, aby margin nadpisu „utekl" nad kartu.

## --model--
Blokový formátovací kontext je oblast, ve které se bloky rozvrhují samostatně, bez vazby na okolí. Bez něj se horní margin prvního dítěte slije s marginem rodiče, protože mezi nimi nic není, a objeví se nad rodičem. `display: flow-root` založí na kartě nový BFC, takže se marginy dětí s marginem karty neslijí a zůstanou uvnitř. Stejně by pomohl padding nebo rámeček na horní straně karty.

## --checklist--
- BFC je oblast, kde se bloky rozvrhují nezávisle na okolí.
- Bez oddělení se margin prvního dítěte slije s marginem rodiče a objeví se vně.
- `display: flow-root` založí BFC a marginy dětí zůstanou uvnitř.
- Padding nebo rámeček rodiče slévání taky zabrání.
:::

:::check
Karta má `display: inline-block` a uvnitř nadpis s `margin-top: 20px`. Karta nemá padding. Kde bude těch 20 px?

### --answer--
Nad kartou, margin nadpisu uteče ven.

#### --why--
Uteče jen z obyčejného bloku. `inline-block` založí vlastní blokový formátovací kontext.

### --correct--
Uvnitř karty, mezi její horní hranou a nadpisem.

#### --why--
`inline-block` zakládá BFC, takže se margin dítěte s kartou nesleje a zůstane uvnitř.

### --answer--
Nikde, v `inline-block` se marginy nepoužijí.

#### --why--
Marginy dětí uvnitř `inline-block` fungují normálně. Jde jen o to, jestli se slijí s rodičem.
:::

## Mezery drží rodič: stack a `gap`

Slévání je předvídatelné, ale na komponentách, které se skládají z různých kusů, dělá z mezer loterii: mezera záleží na tom, kdo je vedle koho. Moderní CSS proto dává mezery **jen jedním směrem** a **nastavuje je na rodiči**.

Nejrozšířenější je vzor [[stack]]: rodič dětem vynuluje svislé marginy a každému dítěti kromě prvního dá horní margin.

```css
.stack > * {
  margin-block: 0;
}

.stack > * + * {
  margin-block-start: var(--space-m);
}
```

Selektor `* + *` znamená „prvek, před kterým je sourozenec" — tedy všichni kromě prvního. Kombinátor `+` a `>` znáš ze selektorů. Mezera je jen mezi dětmi, nad prvním a pod posledním nic není, takže nic neuteče z rodiče.

Druhá cesta je `gap`. Funguje ve flexboxu a gridu, kde se marginy neslévají. Na svislý seznam karet stačí:

```css
.cards {
  display: grid;
  gap: 1.5rem;
}
```

Grid a flexbox dostanou vlastní sekce. Teď si zapamatuj jen tohle: **`gap` dělá mezeru jen mezi položkami a sčítá se s jejich marginy.** Když položkám marginy nevynuluješ, mezera bude větší, než čekáš.

:::live
```html
<article class="lesson stack">
  <h2>Točení na kruhu</h2>
  <p>Hlínu nejdřív pořádně prohněteš, aby v ní nezůstaly bubliny.</p>
  <p>Pak ji vystředíš na kruhu. Tohle je nejtěžší část prvního večera.</p>
  <ul>
    <li>zástěra a ručník s sebou</li>
    <li>nehty radši krátké</li>
  </ul>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.lesson {
  max-width: 26rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: #f5f3ff;
}

.stack > * {
  margin-block: 0;
}

.stack > * + * {
  margin-block-start: var(--space);
}
```
```controls
--space: range(0, 2.5, 0.25, rem) = 1 | mezera stacku
```
:::

Posuň mezeru stacku a sleduj, že se mění všechny mezery najednou a nad nadpisem ani pod seznamem nic nepřibude. Zkus v HTML smazat třídu `stack`: vrátí se výchozí marginy prohlížeče, mezery budou každá jiná a nad nadpisem i pod seznamem přibude místo navíc.

:::check
Seznam `.tickets` má `display: grid; gap: 16px`. Každá položka `li` má `margin-block: 8px`. Kolik pixelů bude mezi dvěma položkami?

### --expected--
32

### --accept--
32 px
32px

### --why--
Grid marginy položek neslévá a `gap` se k nim přičte: 8 + 16 + 8 = 32 px. Proto se v gridu a flexboxu položkám marginy nulují a mezeru drží jen `gap`.
:::

## Typické chyby a pasti

> [!PITFALL] Mezery v obou směrech
> *Příznak:* sekce má `margin-bottom: 40px`, další `margin-top: 24px` a mezera je 40 px. Někdo „opraví" druhou na 64 px a mezera se změní, ale jinde na stránce zase nesedí.
>
> *Oprava:* dávej svislé mezery jen jedním směrem (třeba vždy `margin-block-start`), nebo je nech na rodiči přes stack či `gap`.

> [!PITFALL] Nadpis posune celou kartu
> *Příznak:* karta s pozadím a bez horního paddingu má nahoře nadpis s marginem. Nadpis je nalepený na horní hraně karty a nad kartou je mezera navíc.
>
> *Oprava:* `display: flow-root` na kartě, `padding-block` na kartě, nebo prvnímu dítěti vynuluj horní margin (stack to dělá sám).

Poslední past vzniká, když někdo slévání opraví starým trikem. Tipni si:

:::live predict
```html
<article class="card">
  <img class="card__avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Ccircle cx='28' cy='28' r='28' fill='%23be185d'/%3E%3Ccircle cx='28' cy='22' r='10' fill='%23fbcfe8'/%3E%3Cpath d='M10 48a18 14 0 0 1 36 0Z' fill='%23fbcfe8'/%3E%3C/svg%3E" width="56" height="56" alt="Lektorka Eva Malá">
  <h2 class="card__title">Glazování pro pokročilé</h2>
  <p class="card__text">Pět večerů s Evou Malou, od 14. října.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 3rem 1rem; }

.card {
  overflow: hidden;
  max-width: 18rem;
  padding-inline: 1rem;
  border-radius: 0.75rem;
  background: #fce7f3;
}

.card__avatar {
  display: block;
  margin-block-start: -28px;
  border: 3px solid #fff;
  border-radius: 50%;
}

.card__title { margin-block: 0.75rem 0.25rem; }
.card__text { margin-block: 0 1rem; }
```
--question-- Kulatý avatar lektorky má `margin-block-start: -28px`, aby napůl přesahoval nad kartu. Autor dal kartě `overflow: hidden`, aby marginy zůstaly uvnitř. Jak bude avatar vypadat?
--option-- Celý kulatý, horní polovinou nad růžovou kartou.
--option*-- Useknutý: vidět bude jen spodní polovina kolečka.
--option-- Celý kulatý uvnitř karty, protože `overflow: hidden` záporný margin zruší.
--why-- `overflow: hidden` založí BFC, takže marginy opravdu zůstanou uvnitř. Jenže taky ořízne všechno, co z karty vyčuhuje: tady avatar posunutý záporným marginem nad kartu, jindy stín nebo obrys fokusu odkazu u okraje. Změň `overflow: hidden` na `display: flow-root` a marginy zůstanou uvnitř bez ořezání.
--see-- css-box-model/margin-collapse-a-bfc#typicke-chyby-a-pasti
:::

> [!PITFALL] `overflow: hidden` jako oprava slévání
> *Příznak:* po „opravě" marginů je useknutý avatar nebo štítek přesahující přes okraj, stín nebo obrys fokusu u odkazu uvnitř karty.
>
> *Oprava:* na zadržení marginů používej `display: flow-root`. `overflow: hidden` patří jen tam, kde opravdu chceš obsah oříznout.

> [!PITFALL] Mezery se po přepnutí na flexbox zdvojnásobí
> *Příznak:* seznam, který měl mezi položkami 16 px, má po `display: flex` nebo `grid` mezery 32 px.
>
> *Oprava:* flex a grid položky marginy neslévají. Položkám marginy vynuluj a mezeru nastav přes `gap` na kontejneru.

:::check
Karta s `display: flow-root` má uvnitř odstavec s `margin-bottom: 24px` jako poslední prvek a pod kartou je další blok s `margin-top: 16px`. Kolik pixelů bude mezi spodní hranou pozadí karty a dalším blokem?

### --expected--
16

### --accept--
16 px
16px

### --why--
`flow-root` drží 24 px marginu odstavce uvnitř karty, pozadí se o ně prodlouží. S okolím se slévá jen vlastní margin karty (nula) s marginem dalšího bloku, takže mezi nimi je 16 px.
:::

V dalším workshopu s tím dáš do pořádku stránku receptu: mezery ze stupnice, stack, karty a marginy, které utíkají z rámečků.

## Kde to najdeš v MDN

- [Mastering margin collapsing](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Mastering_margin_collapsing) — všechny tři situace slévání a počítání se zápornými marginy.
- [Block formatting context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Block_formatting_context) — úplný seznam toho, co zakládá BFC, a ukázky s `float`.
- [gap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap) — kde `gap` funguje (flexbox, grid, víc sloupců) a jeho dvouhodnotový zápis.

# --questions--

## --question--

Prázdný `<div class="spacer">` bez obsahu, paddingu a rámečku má `margin-top: 20px` a `margin-bottom: 30px`. Nad ním i pod ním jsou odstavce s nulovými marginy. Kolik pixelů bude mezi odstavci?

### --expected--

30

### --accept--

30 px
30px

### --why--

Horní a spodní margin prázdného bloku se dotýkají, protože mezi nimi nic není, a slijí se na větší z nich. Zbude 30 px, ne 50.

### --see--

css-box-model/margin-collapse-a-bfc#kdy-se-marginy-slevaji

## --question--

Modální okno `.dialog` má bílé pozadí a `padding-inline: 2rem`. Jeho první prvek je `<h2>` s výchozím horním marginem a nad nadpisem v okně žádná mezera není, zato nad celým oknem ano. Která oprava marginy udrží uvnitř a nic jiného nezmění?

### --answer--

`.dialog { overflow: hidden; }`

#### --why--

Marginy uvnitř sice zůstanou, ale `overflow: hidden` ořízne i všechno, co z okna vyčuhuje, například stín nebo obrys fokusu u tlačítka zavřít.

### --correct--

`.dialog { display: flow-root; }`

#### --why--

`flow-root` založí blokový formátovací kontext a jiný vedlejší efekt nemá. Margin nadpisu zůstane uvnitř okna.

### --answer--

`.dialog h2 { margin-top: 2rem; }`

#### --why--

Větší margin uteče stejně jako ten menší. Dokud mezi marginem nadpisu a hranou okna nic nestojí, slije se s okolím.

### --see--

css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext

## --question--

Sekce `.faq` má svislý stack: `.faq > * + * { margin-block-start: 12px; }`. Uvnitř je nadpis a pět otázek. Kolik deklarací `margin-block-start` se na děti sekce použije?

### --expected--

5

### --accept--

pět

### --why--

`* + *` vybere každé dítě, před kterým je sourozenec. Nadpis je první a margin nedostane, pět otázek za ním ano.

### --see--

css-box-model/margin-collapse-a-bfc#mezery-drzi-rodic-stack-a-gap
