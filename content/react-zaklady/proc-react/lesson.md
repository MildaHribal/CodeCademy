# Proč React

Administrace, e-shop, dashboard, rezervační systém — když v inzerátu stojí „frontend", myslí se tím v devíti z deseti případů React. Tahle lekce vysvětlí, co React vlastně dělá, a naučí tě zápis, ve kterém se od teď budeš pohybovat: JSX.

:::check pretest
Stránka ukazuje seznam 200 filmů. Uživatel u jednoho klikne na **Viděl jsem**. Co s DOM udělá React? Tipni si.

### --answer--

Překreslí celou stránku znovu, proto se React na velké seznamy nehodí.

#### --why--

React tvoje funkce opravdu spustí znovu — to ale není totéž jako přepsat DOM. Co se ve stránce skutečně změní, řekne část o vykreslování.

### --correct--

Spočítá nový popis stránky a v DOM změní jen to, co se od minule liší.

#### --why--

Přesně tak. Jak se ten popis počítá a proč to stačí, uvidíš v části o vykreslování.

### --answer--

Nic — DOM si musíš upravit sám, React jen uklízí data.

#### --why--

To je práce, které se React snaží zbavit. Ruční úpravy DOM znáš z předchozí sekce; tady je psát nebudeš.
:::

:::check pretest
Komponenta je v Reactu obyčejná konstrukce JavaScriptu, kterou už umíš. Která? Napiš jedno slovo.

### --expected-- ignore-case

funkce

### --accept--

funkci
funkcí
obyčejná funkce

### --why--

Komponenta je funkce, která vrací značkování. Žádná třída, žádná magie — a proto o ní platí všechno, co víš o funkcích a jejich parametrech.
:::

## Problém: seznam, který musíš přepsat ručně

Máš seznam filmů a u každého tlačítko **Viděl jsem**. V hlavičce se ukazuje, kolik z nich už jsi viděl. V čistém DOM musíš po kliknutí sáhnout na **tři** místa: přidat řádku třídu, odstranit tlačítko a přepsat počítadlo.

:::live dom
```html
<h2>Viděno: <span id="count">1</span> z 3</h2>
<ul id="list">
  <li class="seen">Vlastníci<button hidden>Viděl jsem</button></li>
  <li>Bratři<button>Viděl jsem</button></li>
  <li>Deníček moderního fotra<button>Viděl jsem</button></li>
</ul>
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
li { display: flex; gap: .75rem; align-items: center; padding: .35rem 0; }
.seen { color: #16a34a; font-weight: 600; }
button { border: 1px solid #cbd5e1; background: #fff; border-radius: .5rem; padding: .2rem .6rem; }
```
```js
const list = document.querySelector('#list');
const count = document.querySelector('#count');

list.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const row = button.closest('li');
  row.classList.add('seen');          // 1. vzhled řádky
  button.hidden = true;               // 2. tlačítko už nemá smysl
  count.textContent = document.querySelectorAll('.seen').length;  // 3. počítadlo
});
```
:::

Zkus smazat řádek s `count.textContent` a pak si v náhledu odklikat dva filmy: seznam a hlavička si přestanou odpovídat. Nic nespadne, jen stránka lže. A takových míst je v každé aplikaci sto.

> [!REMEMBER]
> **V Reactu nepopisuješ změny, ale výsledek: napíšeš funkci, která z dat vrátí značkování, a React dopočítá, co v DOM změnit.** Tomu se říká [[deklarativní zápis]] — místo „přidej třídu, skryj tlačítko, přepiš číslo" napíšeš „takhle vypadá seznam pro tahle data".

Tady je totéž v Reactu. Počítadlo **nikde neuloženo není** — spočítá se z dat:

:::live react
```jsx
const movies = [
  { id: 1, title: 'Vlastníci', seen: true },
  { id: 2, title: 'Bratři', seen: false },
  { id: 3, title: 'Deníček moderního fotra', seen: false },
];

export default function MovieList() {
  const seenCount = movies.filter((movie) => movie.seen).length;

  return (
    <>
      <h2>Viděno: {seenCount} z {movies.length}</h2>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id} className={movie.seen ? 'seen' : ''}>
            {movie.title}
            {!movie.seen && <button>Viděl jsem</button>}
          </li>
        ))}
      </ul>
    </>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
li { display: flex; gap: .75rem; align-items: center; padding: .35rem 0; }
.seen { color: #16a34a; font-weight: 600; }
button { border: 1px solid #cbd5e1; background: #fff; border-radius: .5rem; padding: .2rem .6rem; }
```
:::

Zkus u druhého filmu změnit `seen: false` na `seen: true` a sleduj, co se všechno v náhledu změní: barva řádky, zmizelé tlačítko **i** počítadlo v hlavičce. Ty jsi změnil jen data.

> [!NOTE]
> Tlačítko v Reactové verzi zatím nic nedělá — data v ní jsou konstanta. Aby šla měnit i kliknutím, potřebuješ [[stav]], a k tomu se dostaneme v lekci *Stav jako snímek*. Do té doby budeš vykreslovat hotová data, a i to je práce na dva workshopy.

:::check
V reactové verzi je počet viděných filmů spočítaný z pole `movies`. Kolik míst musíš upravit, když v datech přidáš čtvrtý film?

### --answer--

Dvě: pole `movies` a text v hlavičce.

#### --why--

Text v hlavičce žádné číslo neobsahuje — je v něm výraz `{movies.length}`, který se spočítá znovu při každém vykreslení.

### --correct--

Jedno: jen pole `movies`.

#### --why--

Hlavička i seznam si svoje hodnoty počítají z pole. To je celý rozdíl proti ruční práci s DOM.

### --answer--

Tři: pole, hlavičku a seznam `<ul>`.

#### --why--

Seznam se z pole vyrábí přes `map`, takže o novou řádku se starat nemusíš. Hlavička si číslo taky počítá sama.

### --see--

react-zaklady/proc-react#problem-seznam-ktery-musis-prepsat-rucne
:::

## Komponenta je funkce, která vrací JSX

[[Komponenta]] je funkce, která vrací značkování. Dvě pravidla, která React vyžaduje:

- **Jméno začíná velkým písmenem** (`MovieList`, ne `movieList`). Podle velkého písmene React pozná komponentu od obyčejné HTML značky.
- **Vrací jeden kus značkování** — jeden prvek, nebo [[fragment]] `<>…</>`, když potřebuješ vrátit víc prvků vedle sebe.

Komponentu použiješ, jako by to byla nová HTML značka: `<Header />`. Tomu, že komponenta obsahuje další komponenty, se říká [[kompozice komponent]] — velká stránka je strom malých funkcí.

:::live react
```jsx
function Header() {
  return <h1>Kino Aero</h1>;
}

function Screening() {
  return (
    <p className="screening">
      Dnes ve 20.30 · <strong>Vlastníci</strong>
    </p>
  );
}

export default function Page() {
  return (
    <div className="page">
      <Header />
      <Screening />
      <Screening />
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 0; background: #f8fafc; color: #1f2937; }
.page { max-width: 32rem; margin: 2rem auto; padding: 1.5rem; background: #fff; border-radius: 1rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
h1 { margin: 0 0 1rem; font-size: 1.5rem; }
.screening { margin: .25rem 0; padding: .6rem .9rem; background: #f1f5f9; border-radius: .6rem; }
```
:::

Zkus přidat třetí `<Screening />` a pak přejmenovat `Screening` na `screening` (i v použití) — a přečti si v konzoli náhledu, co ti React řekne.

> [!PITFALL]
> **Komponenta s malým počátečním písmenem se vykreslí jako neznámá HTML značka.** Příznak: na stránce není nic vidět a v konzoli stojí `The tag <screening> is unrecognized in this browser`. Oprava: `PascalCase` u jména i u použití.

:::check
Napiš, jak v JSX použiješ komponentu `Footer`, která nemá žádný obsah.

### --expected--

<Footer />

### --accept--

<Footer></Footer>

### --why--

Komponenta se používá jako značka s velkým počátečním písmenem. JSX vyžaduje uzavření, takže samostatná značka končí `/>`.

### --see--

react-zaklady/proc-react#komponenta-je-funkce-ktera-vraci-jsx
:::

## JSX: značkování jako výraz

[[JSX]] není HTML a není to ani text. Je to **výraz JavaScriptu**, který se před spuštěním přeloží na volání funkce. Tenhle zápis:

```jsx
const badge = <span className="badge">Novinka</span>;
```

se přeloží přibližně na:

```js
const badge = jsx('span', { className: 'badge', children: 'Novinka' });
```

Proto můžeš JSX uložit do proměnné, vrátit z funkce nebo dát do pole — je to hodnota jako každá jiná. A proto v něm platí pravidla JavaScriptu, ne HTML.

### Výrazy v `{}`

Do složených závorek patří **jakýkoli výraz**, který něco vrací: proměnná, volání funkce, ternární operátor, `&&`. Nepatří tam příkaz — `if`, `for` ani `const` uvnitř `{}` nenapíšeš.

:::live react
```jsx
const film = { title: 'Bratři', minutes: 128, rating: 84 };

export default function FilmCard() {
  return (
    <article className="card">
      <h2>{film.title}</h2>
      <p>
        {film.minutes} minut · hodnocení {film.rating} %
      </p>
      <p>{film.rating >= 80 ? 'Doporučujeme' : 'Průměr'}</p>
      <p>Cena: {(249 / 2).toFixed(0)} Kč pro studenty</p>
    </article>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 0; background: #f8fafc; }
.card { max-width: 26rem; margin: 2rem auto; padding: 1.25rem 1.5rem; background: #fff; border-radius: 1rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); color: #1f2937; }
h2 { margin: 0 0 .5rem; }
p { margin: .25rem 0; }
```
:::

Zkus změnit `rating` na `62` a sleduj, který odstavec se přepíše. Pak zkus místo `{film.title}` napsat `film.title` bez závorek — na stránce se objeví doslovný text.

### Atributy se jmenují jako v JavaScriptu

JSX nastavuje **vlastnosti prvku**, ne HTML atributy, takže se drží jmen z DOM API, které znáš z [práce s prvky](see:js-dom/strom-dom#atributy-a-vlastnosti-classlist-dataset-a-spol):

| v HTML | v JSX | proč |
|---|---|---|
| `class="card"` | `className="card"` | `class` je v JavaScriptu klíčové slovo |
| `for="email"` | `htmlFor="email"` | `for` je taky klíčové slovo |
| `style="color: red"` | `style={{ color: 'red' }}` | vnitřní `{}` je obyčejný objekt |
| `onclick="…"` | `onClick={handleClick}` | jméno v camelCase, hodnota je funkce |
| `<br>` | `<br />` | každá značka musí být uzavřená |

Vlastní atributy (`data-testid`, `aria-label`) se naopak píšou přesně jako v HTML.

:::check
Přepiš tenhle HTML atribut do JSX: `<label for="email" class="field">`.

### --expected--

<label htmlFor="email" className="field">

### --accept--

<label className="field" htmlFor="email">

### --why--

`for` a `class` jsou klíčová slova JavaScriptu, proto se v JSX jmenují `htmlFor` a `className`. Atributy `data-*` a `aria-*` si jména zachovávají.

### --see--

react-zaklady/proc-react#atributy-se-jmenuji-jako-v-javascriptu
:::

### Co se z `{}` vykreslí a co ne

Text a čísla se vypíšou. `null`, `undefined`, `true` a `false` se nevykreslí **vůbec nic** — a právě to dělá z `&&` obvyklý způsob, jak něco zobrazit podmíněně. Pole se vykreslí položka po položce, bez čárek.

:::live react predict
```jsx
const tags = ['Komedie', 'Drama'];

export default function Tags() {
  return <p data-testid="tags">{tags}</p>;
}
```
--question-- Co se objeví v odstavci?
--option-- `Komedie,Drama` — pole se vypíše jako text
--option*-- `KomedieDrama` — položky za sebou bez oddělovače
--option-- `['Komedie', 'Drama']` — celé pole včetně závorek
--why-- Pole není text: React vykreslí každou položku samostatně a nic mezi ně nedává. Oddělovač si musíš dodat sám, třeba `{tags.join(', ')}`. Přesně na tomhle stojí vykreslování seznamů přes `map`.
:::

:::check
Co se vykreslí z výrazu `{null}`?

### --expected-- ignore-case

nic

### --accept--

nevykreslí se nic
prázdno

### --why--

`null`, `undefined` a logické hodnoty React tiše zahodí. Díky tomu jde napsat `{user && <p>{user.name}</p>}` a při chybějícím uživateli se nevykreslí nic.

### --see--

react-zaklady/proc-react#co-se-z-vykresli-a-co-ne
:::

## Text z dat se nikdy nestane HTML

Z předchozí sekce víš, že `innerHTML` s cizím textem je [[XSS]] past. V JSX tenhle problém nemáš: **všechno, co vložíš do `{}`, se vykreslí jako text.**

:::live react
```jsx
const comment = 'Skvělý film <img src="x" onerror="alert(1)">';

export default function Comment() {
  return (
    <blockquote>
      <p>{comment}</p>
      <footer>— uživatel, který zkouší, co vydržíš</footer>
    </blockquote>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
blockquote { margin: 0; padding: 1rem 1.25rem; border-left: 4px solid #6366f1; background: #eef2ff; border-radius: 0 .75rem .75rem 0; }
p { margin: 0 0 .5rem; }
footer { font-size: .85rem; color: #64748b; }
```
:::

Značka `<img>` se objevila jako text a žádný `onerror` se nespustil. Zkus do `comment` přidat `<strong>tohle</strong>` — taky se vypíše doslova.

HTML z dat jde vložit jen tak, že si o to výslovně řekneš atributem `dangerouslySetInnerHTML={{ __html: text }}`. Jméno je dlouhé a nepříjemné schválně: děláš tím přesně to, co `innerHTML`, včetně rizika.

:::check
Do komponenty přijde od uživatele text `<b>sleva</b>` a ty ho vypíšeš jako `<p>{text}</p>`. Co uvidí uživatel na stránce?

### --answer--

Tučné slovo „sleva".

#### --why--

Tučně by to bylo v případě, že bys HTML vložil přes `dangerouslySetInnerHTML`. Obyčejný výraz v `{}` se vykreslí jako text.

### --correct--

Doslova `<b>sleva</b>`.

#### --why--

Výraz v `{}` je vždycky text. React sám nahradí `<` a `>` bezpečnou podobou, takže se z dat nikdy nestane značkování.

### --answer--

Nic, React text se značkou zahodí.

#### --why--

Nic se nezahazuje — text se vypíše celý, jen se nevykreslí jako HTML.

### --see--

react-zaklady/proc-react#text-z-dat-se-nikdy-nestane-html
:::

## Jak React vykreslí stránku

Ve skutečném projektu (Vite, `npm create vite@latest`) najdeš tři soubory, které to celé spojují:

```html
<!-- index.html -->
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

```jsx
// src/main.jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
```

Prázdný `<div id="root">` je jediné místo, kam React sahá. `createRoot(...).render(<App />)` mu řekne: „tenhle strom komponent vykresli sem". Odtud dál už jen voláš komponenty.

Co se stane při každé změně dat:

1. **[[Render]]** — React zavolá tvoje komponenty a dostane popis stránky (strom prvků, žádný DOM).
2. **Porovnání** — nový popis srovná s tím předchozím.
3. **Commit** — v DOM provede jen ty rozdíly, které našel.

Proto je render „levný": tvoje funkce se spustí znovu celá, ale v DOM se změní třeba jen jedno číslo. A proto v komponentě nesmíš sahat do DOM ručně — React o tvých úpravách neví a při příštím renderu je přepíše.

> [!REMEMBER]
> **Render je jen výpočet popisu stránky. Nic v DOM ještě nenastane.** Že React zavolal tvou funkci, neznamená, že se v prohlížeči něco změnilo.

> [!NOTE]
> Vue a Svelte řeší totéž jinak: Vue má šablony v `.vue` souborech a reaktivní proměnné, Svelte kód přeloží do adresných úprav DOM už při buildu. Myšlenka „data → popis stránky" je ve všech stejná, a proto se druhý framework učí rychle (na konci části na to je rozšíření o Vue a Nuxt). React 19 k tomu přidal **React Compiler**, který za tebe řeší zbytečná překreslení — o tom až v *React do hloubky*, protože nejdřív musíš vědět, co se překresluje a proč.

:::explain
Vysvětli vlastními slovy, proč v Reactu nemusíš hlídat, aby se po změně dat upravilo počítadlo, třída řádky i tlačítko — a proč to v čistém DOM hlídat musíš.

## --model--

V čistém DOM popisuju změny: každé místo na stránce musím po změně dat najít a přepsat sám, takže na jedno zapomenu a stránka si přestane odpovídat. V Reactu popisuju výsledek — funkce z dat vrátí, jak má stránka vypadat celá. Když se data změní, React tu funkci zavolá znovu, nový popis porovná se starým a v DOM změní jen rozdíly. Počítadlo si číslo počítá z dat při každém renderu, takže nemůže zůstat staré.

## --checklist--

- V čistém DOM popisuju změny, v Reactu výsledek pro daná data.
- Každé místo na stránce si svoji hodnotu spočítá z dat znovu při renderu.
- React nový popis stránky porovná s předchozím a do DOM zapíše jen rozdíl.
- Když je hodnota spočítaná z dat, nemůže se rozejít se zbytkem stránky.
:::

:::check
Render v Reactu znamená, že se zavolají tvoje komponenty a vznikne popis stránky. Co se v tu chvíli stane v DOM?

### --expected-- ignore-case

nic

### --accept--

zatím nic
nic, DOM se mění až v commitu

### --why--

Render je výpočet. Do DOM se zapisuje až v commitu, a to jen rozdíly proti předchozímu popisu. Proto se dá render spustit i několikrát, než se něco vykreslí.

### --see--

react-zaklady/proc-react#jak-react-vykresli-stranku
:::

## Typické chyby a pasti

### Nula, která se vykreslí

`&&` vrací **levou** hodnotu, když je nepravdivá — a `0` se, na rozdíl od `false`, vykreslí.

:::live react predict
```jsx
const items = [];

export default function Cart() {
  return (
    <div data-testid="cart">
      Košík: {items.length && <strong>{items.length} položek</strong>}
    </div>
  );
}
```
--question-- Co bude v `<div>` u prázdného košíku?
--option-- `Košík:` a nic dalšího
--option*-- `Košík: 0`
--option-- `Košík: 0 položek`
--why-- `items.length` je `0`, takže `&&` vrátí rovnou `0` a vůbec nesáhne na pravou stranu. A nula je číslo, takže ji React vypíše. Opravy jsou dvě: `items.length > 0 && …`, nebo ternární operátor s `null` ve druhé větvi.
:::

> [!PITFALL]
> **`{pole.length && <X />}` vypíše u prázdného pole nulu.** Příznak: v UI se objeví osamocená `0` tam, kde nemá být nic. Oprava: `{pole.length > 0 && <X />}`. Stejnou past má `{count && …}` u počítadel.

### Dva prvky vedle sebe bez obalu

> [!PITFALL]
> **Komponenta nesmí vrátit dva prvky vedle sebe.** Příznak: kód nejde spustit a hlášení mluví o JSX —
> `Adjacent JSX elements must be wrapped in an enclosing tag`. Oprava: obal je `<div>`, když ho potřebuješ i ve stylech, nebo [[fragment]] `<>…</>`, když nechceš do stránky přidávat nic.

### Značka bez uzavření

> [!PITFALL]
> **JSX nezná nepárové značky.** `<img src="…">` nebo `<input>` skončí hláškou `Unterminated JSX contents` nebo `Expected corresponding JSX closing tag`. Oprava: `<img src="…" />`, `<input />`, `<br />`.

### `class` místo `className`

> [!PITFALL]
> **`class="karta"` React ignoruje** a do konzole napíše `Invalid DOM property 'class'. Did you mean 'className'?` Příznak: prvek je ve stránce, ale bez jediného stylu. Oprava: `className`. Stejně na tom je `for` u `<label>`.

### `style` jako text

> [!PITFALL]
> **`style="color: red"` v JSX spadne.** Hláška zní `The style prop expects a mapping from style properties to values, not a string`. Oprava: objekt s camelCase klíči — `style={{ color: 'red', marginTop: '1rem' }}`. Čísla u rozměrů React doplní `px` sám (`{{ width: 320 }}`).

:::check
Komponenta má vrátit obrázek a pod ním titulek. Co je na tomhle návratu špatně?

```jsx
return (
  <img src={poster} alt="">
  <p class="caption">{title}</p>
);
```

### --answer--

Jen to, že `class` se v JSX jmenuje `className`.

#### --why--

`className` je potřeba opravit, ale kód by nešel ani spustit — kromě jména třídy je tu ještě problém se samotnou strukturou návratu.

### --correct--

Tři věci: `<img>` není uzavřený, prvky nemají společný obal a `class` se jmenuje `className`.

#### --why--

Nepárové značky se v JSX zavírají (`<img … />`), dva prvky vedle sebe potřebují obal nebo fragment a `class` je klíčové slovo JavaScriptu.

### --answer--

Nic, takhle se JSX píše.

#### --why--

Takhle se píše HTML. JSX je výraz JavaScriptu a má vlastní pravidla: uzavřené značky, jeden korunní prvek, jména vlastností z DOM API.

### --see--

react-zaklady/proc-react#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer) — objekt v `style={{ … }}` je obyčejný literál objektu, včetně zkrácených zápisů.
- [Logical AND (&&)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) — sekce *Short-circuit evaluation* vysvětlí, proč `0 && …` vrátí nulu.
- [Element.className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) — proč se vlastnost nejmenuje `class` už v samotném DOM.
- [Element.innerHTML — Security considerations](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations) — čemu se vyhneš tím, že JSX vkládá text.

> [!NOTE]
> React na MDN není. Jeho dokumentace je na [react.dev](https://react.dev/learn) — anglicky, s příklady, které jdou hned upravovat. Referenci hooku najdeš vždycky na `react.dev/reference/react/<jméno>`.

# --questions--

## --question--

Kolik prvků se vykreslí z tohoto výrazu?

```jsx
const rows = [1, 2, 3];

<div>
  {rows}
  {false}
  {null}
</div>
```

### --expected--

3

### --accept--

tři

### --why--

Pole vykreslí každou položku (tři čísla), `false` a `null` se nevykreslí vůbec. Uvnitř `<div>` tedy skončí text `123`.

### --see--

react-zaklady/proc-react#co-se-z-vykresli-a-co-ne

## --question--

Co se objeví na stránce?

```jsx
const votes = 0;

<p>Hlasy: {votes || 'zatím žádné'}</p>
```

### --expected--

Hlasy: zatím žádné

### --why--

`0` je nepravdivá hodnota, takže `||` vrátí pravou stranu. Tohle je rozdíl proti `&&`: s `||` se nula schová, s `&&` se naopak vypíše. Když chceš, aby nula prošla, použij `??`, které reaguje jen na `null` a `undefined`.

### --see--

react-zaklady/proc-react#nula-ktera-se-vykresli

## --question--

Komponenta `Price` má v JSX vypsat cenu a vedle ní tučnou poznámku „s DPH". Který návrat je správný?

### --answer--

`return <span>{price} Kč</span> <strong>s DPH</strong>;`

#### --why--

Dvě značky vedle sebe komponenta vrátit nemůže — kód nejde ani spustit. Potřebují společný obal.

### --correct--

`return <>{price} Kč <strong>s DPH</strong></>;`

#### --why--

Fragment `<>…</>` obalí obojí, aniž by do stránky přidal další prvek.

### --answer--

`return '{price} Kč <strong>s DPH</strong>';`

#### --why--

Tohle je obyčejný text v uvozovkách. Vypsal by se doslova, včetně složených závorek a značky — JSX není řetězec.

### --see--

react-zaklady/proc-react#komponenta-je-funkce-ktera-vraci-jsx

## --question--

Napiš, jak v JSX nastavíš prvku vnitřní odsazení 12 px přes vlastnost `style`.

### --expected--

style={{ padding: 12 }}

### --accept--

style={{ padding: '12px' }}
style={{padding: 12}}
style={{padding: '12px'}}

### --why--

Vnější `{}` znamená „tady je výraz JavaScriptu", vnitřní `{}` je objekt. U rozměrů doplní React `px` za tebe, takže `12` i `'12px'` dávají stejný výsledek.

### --see--

react-zaklady/proc-react#atributy-se-jmenuji-jako-v-javascriptu
