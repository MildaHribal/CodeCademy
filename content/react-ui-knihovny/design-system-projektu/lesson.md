# Design systém projektu

Po třech měsících projektu najdeš v kódu `rounded-md`, `rounded-lg`, `rounded-[10px]`
a `rounded-xl` — všechno na tlačítkách. Modrou máš v šesti odstínech, tlačítko
`Button` a vedle něj `PrimaryButton`, `BigButton` a `ButtonWithIcon`, a každé pole
formuláře propojuje popisek s chybou trochu jinak (nebo vůbec). Nic z toho není
chyba, kterou by ohlásil linter. Je to jen stav, kdy o vzhledu rozhoduje každý
soubor zvlášť. Tahle lekce je o tom, jak to rozhodnutí sebrat na jedno místo.

:::check pretest
V projektu je `bg-blue-600` na čtyřiceti místech. Grafička změní barvu značky
na zelenou. Kolik souborů upravíš?

### --answer--
Jeden — stačí v konfiguraci Tailwindu přepsat `blue-600` na zelenou.

#### --why--
Jde to, ale pak se v kódu jmenuje `blue` něco, co je zelené, a přestane to sedět
i u míst, kde modrá značku neznamenala (odkaz, informační hláška). Barva
v názvu třídy popisuje odstín, ne účel.

### --correct--
Všechny, kde je `bg-blue-600` — třída říká odstín, ne k čemu barva slouží.
:::

:::check pretest
Pole formuláře má `aria-describedby="email-chyba"`, ale prvek s tímhle `id` na
stránce není. Co se stane?

### --answer--
Prohlížeč vypíše do konzole varování o neexistujícím `id`.

#### --why--
Prohlížeč neplatný odkaz v ARIA atributu tiše ignoruje. Konzole, validátor
v editoru ani React nic nehlásí.

### --correct--
Nic viditelného — čtečka popis prostě nepřečte a nikdo tě neupozorní.
:::

## Problém: rozhoduje každý soubor zvlášť

Tailwind ti dává stovky hotových hodnot: 36 velikostí mezer, 13 velikostí písma,
22 odstínů pro každou z dvaceti barev. To je výhoda při psaní a past při údržbě.
Když má každá obrazovka volnou ruku, vznikne rozhraní, které vypadá „skoro stejně"
— a to oko pozná dřív než úplně jiný styl.

Design systém projektu není Figma knihovna ani balíček na npm. Je to **krátký seznam
rozhodnutí**, které komponenty jen čtou:

- jaké barvy existují a k čemu slouží,
- jaké mezery, velikosti písma a zaoblení se smí použít,
- jak se jmenují varianty a velikosti komponent,
- jak vypadá fokus, vypnutý stav a chyba — u všech komponent stejně.

> [!REMEMBER]
> **Design systém = rozhodnutí na jednom místě, komponenty je jen čtou.** Když chceš
> změnit vzhled, měníš token nebo variantu, nikdy jednotlivou obrazovku.

:::check
Proč je `rounded-[10px]` na jednom tlačítku problém, i když vypadá dobře?

### --expected--
je to hodnota mimo škálu, kterou nikdo jiný nepoužívá

### --accept--
obchází společnou škálu zaoblení
je to rozhodnutí o vzhledu mimo design systém
při změně zaoblení se na něj zapomene
:::

## Vrstvy: tokeny, primitivy, komponenty, vzory

Design systém v React projektu má čtyři patra. Každé smí používat jen patra pod
sebou:

| patro | co tam je | kde to žije |
|---|---|---|
| tokeny | barvy, mezery, písmo, zaoblení, stíny | `@theme` v `styles.css` |
| primitivy | chování bez vzhledu: fokus, klávesnice, ARIA | `radix-ui` (nebo nativní HTML) |
| komponenty | `Button`, `Input`, `Card`, `Dialog` se vzhledem z tokenů | `components/ui/` |
| vzory | formulářové pole, prázdný stav, karta s akcemi | `components/` |

Tokeny už znáš z CSS: [primitivní a sémantické tokeny](see:css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny)
i [pojmenování a škálu](see:css-zaklady/vlastni-vlastnosti#design-tokeny-pojmenovani-a-skala).
Primitivy a zkopírované komponenty znáš z [lekce o shadcn/ui](see:react-ui-knihovny/shadcn-a-radix#shadcn-ui-kod-v-repozitari-ne-zavislost).
Nové je poslední patro: [[vzor rozhraní]] je složení několika komponent, které se
v aplikaci opakuje a má vlastní pravidla (popisek je vždy nad polem, chyba vždy pod
ním).

Pravidlo „jen patra pod sebou" má praktický důsledek: obrazovka `pages/Checkout.tsx`
nepíše `bg-blue-700`, ale `<Button>`. A `Button` nepíše `#1d4ed8`, ale `bg-primary`.

:::check
Na stránce objednávky je `<button className="rounded-lg bg-primary px-4 py-2 text-white">`.
Které patro tím obrazovka přeskočila?

### --expected--
komponenty

### --accept--
komponentu Button
patro komponent, měla použít Button
:::

## Tokeny a škály v `@theme`

V Tailwindu 4 jsou tokeny proměnné v bloku `@theme`. Z každé proměnné vznikne
utilita: `--color-primary` dá `bg-primary`, `text-primary` i `border-primary`,
`--radius-control` dá `rounded-control`. Stejně jako v čistém CSS máš dvě patra:

```css
@theme {
  /* primitivní: jaký je to odstín */
  --color-blue-700: #1d4ed8;
  --color-blue-300: #93c5fd;

  /* sémantické: k čemu slouží */
  --color-primary: var(--color-blue-700);
  --color-surface: #ffffff;
  --color-muted: #64748b;
  --radius-control: 0.5rem;
}
```

Komponenty používají **jen sémantická jména**. Tmavý motiv pak nepotřebuje v JSX
ani jedno `dark:` — stačí přepsat sémantické tokeny:

```css
.dark {
  --color-primary: var(--color-blue-300);
  --color-surface: #0f172a;
}
```

Utilita `bg-primary` je ve vygenerovaném CSS `background-color: var(--color-primary)`,
takže uvnitř `.dark` si vezme přepsanou hodnotu.

:::live react libs=tailwind
```jsx
import { useState } from 'react';

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-page p-8 text-ink">
        <button
          onClick={() => setDark((value) => !value)}
          className="mb-6 rounded-control border border-line px-3 py-1.5 text-sm"
        >
          {dark ? 'Světlý motiv' : 'Tmavý motiv'}
        </button>
        <article className="max-w-sm rounded-card bg-surface p-6 shadow-sm">
          <p className="text-sm text-muted">Lezecký kurz · Labák</p>
          <h2 className="mt-1 text-xl font-semibold">Víkend na skalách pro začátečníky</h2>
          <p className="mt-2 text-sm text-muted">sobota 12. 6. · 8 míst · 2 400 Kč</p>
          <button className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-primary">
            Přihlásit se
          </button>
        </article>
      </div>
    </div>
  );
}
```
```css
@import "tailwindcss";

@theme {
  --color-slate-950: #020617;
  --color-emerald-300: #6ee7b7;
  --color-emerald-700: #047857;

  --color-page: #f1f5f9;
  --color-surface: #ffffff;
  --color-ink: #0f172a;
  --color-muted: #64748b;
  --color-line: #cbd5e1;
  --color-primary: var(--color-emerald-700);
  --color-on-primary: #ffffff;

  --radius-control: 0.5rem;
  --radius-card: 1rem;
}

.dark {
  --color-page: var(--color-slate-950);
  --color-surface: #1e293b;
  --color-ink: #f1f5f9;
  --color-muted: #94a3b8;
  --color-line: #475569;
  --color-primary: var(--color-emerald-300);
  --color-on-primary: var(--color-slate-950);
}
```
:::

Zkus změnit `--radius-control` na `9999px` a sleduj, že se zaoblí obě tlačítka naráz.
Pak přepiš `--color-primary` v `.dark` na `#fbbf24`.

### Omezená škála

Škála je seznam hodnot, ze kterých se vybírá. Tailwind ji už má (`p-2`, `p-4`, `p-6`),
tvoje práce je **zúžit ji** na to, co projekt opravdu používá, a hodnoty mimo ni
nepouštět: `p-[13px]`, `text-[15px]` a `rounded-[10px]` jsou v revizi kódu otázka
„proč tady neplatí škála?".

| škála | typický výběr pro aplikaci |
|---|---|
| mezery | 1, 2, 3, 4, 6, 8, 12 (4–48 px) |
| písmo | `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` |
| zaoblení | `rounded-control` (pole, tlačítka), `rounded-card` (karty, dialogy), `rounded-full` |
| stín | jeden pro karty, jeden pro plovoucí prvky (menu, dialog) |

Zaoblení a stíny dávej do vlastních jmen podle účelu (`control`, `card`). Mezery
a písmo nech číselné — tam je důležitý poměr hodnot, ne účel.

Rozdíl vidíš nejlíp vedle sebe. Obě varianty mají stejné HTML, liší se jen tím, odkud
berou hodnoty:

:::compare
```html
<form class="panel">
  <label>Jméno a příjmení <input value="Tereza Nováková"></label>
  <label>E-mail <input value="tereza@seznam.cz"></label>
  <div class="actions">
    <button class="secondary" type="button">Zpět</button>
    <button class="primary" type="button">Pokračovat</button>
  </div>
</form>
```
```css
body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; }
label { display: grid; }
input { border: 1px solid #cbd5e1; font: inherit; }
button { border: 0; font: inherit; cursor: pointer; }
.actions { display: flex; justify-content: flex-end; }
```
--variant-- Hodnoty od oka
```css
.panel { background: #fff; padding: 22px; border-radius: 14px; display: grid; gap: 13px; max-width: 360px; }
label { gap: 5px; font-size: 13px; }
input { padding: 9px 11px; border-radius: 7px; font-size: 15px; }
.actions { gap: 10px; }
.secondary { padding: 8px 14px; border-radius: 10px; background: #e2e8f0; font-size: 14px; }
.primary { padding: 11px 18px; border-radius: 6px; background: #1e40af; color: #fff; font-size: 16px; }
```
--variant-- Hodnoty ze škály
```css
:root { --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --radius-control: 8px; --radius-card: 16px; --text-sm: 14px; --color-primary: #1d4ed8; }
.panel { background: #fff; padding: var(--space-6); border-radius: var(--radius-card); display: grid; gap: var(--space-4); max-width: 360px; }
label { gap: var(--space-2); font-size: var(--text-sm); }
input, .secondary, .primary { padding: var(--space-2) var(--space-3); border-radius: var(--radius-control); font-size: var(--text-sm); }
.actions { gap: var(--space-2); }
.secondary { background: #e2e8f0; }
.primary { background: var(--color-primary); color: #fff; }
```
:::

Vlevo nic není „špatně", a přesto obě tlačítka vypadají, jako by je psali dva lidé.
Vpravo mají pole i tlačítka stejnou výšku a zaoblení, protože berou hodnoty ze
stejného místa.

:::check
Proč komponenta `Button` používá `bg-primary` a ne `bg-emerald-700`, i když je
výsledná barva stejná?

### --expected--
bg-primary říká účel, takže změna značky nebo tmavý motiv je změna tokenu

### --accept--
sémantický token jde přepsat pro tmavý motiv bez úpravy komponenty
emerald-700 je odstín, primary je účel
:::

## Pojmenování variant napříč sadou

Varianty přes `cva` už umíš z [lekce o Tailwindu v komponentách](see:react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid).
V design systému jde o to, aby **stejná jména znamenala totéž ve všech komponentách**:

| prop | co vybírá | hodnoty |
|---|---|---|
| `variant` | míru důrazu | `default`, `secondary`, `outline`, `ghost` |
| `tone` | význam barvy | `neutral`, `success`, `warning`, `danger` |
| `size` | rozměr | `sm`, `md`, `lg` |

Když má `Button` `size="sm"` a `Badge` `size="small"`, každý, kdo sadu používá, si to
musí pamatovat zvlášť. Když má `Button` `variant="danger"` a `Alert` `type="error"`,
jsou to dvě jména pro stejné rozhodnutí.

```tsx
const buttonVariants = cva('inline-flex items-center justify-center rounded-control font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-on-primary hover:bg-primary/90',
      outline: 'border border-line bg-surface hover:bg-page',
      ghost: 'hover:bg-page',
    },
    tone: {
      neutral: '',
      danger: '',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  compoundVariants: [
    { variant: 'default', tone: 'danger', className: 'bg-danger hover:bg-danger/90' },
    { variant: 'outline', tone: 'danger', className: 'border-danger text-danger' },
  ],
  defaultVariants: { variant: 'default', tone: 'neutral', size: 'md' },
});
```

Rozdělení `variant` × `tone` ušetří kombinace: místo `danger`, `dangerOutline`
a `dangerGhost` máš dvě nezávislé osy. Pro malou sadu klidně stačí jen `variant`
s hodnotou `destructive` jako v shadcn/ui — důležité je, aby to platilo všude.

> [!TIP]
> Jména variant piš podle **účelu**, ne podle vzhledu: `danger`, ne `red`. Za rok
> může být nebezpečná akce oranžová a `variant="red"` s oranžovým tlačítkem je lež
> v kódu.

:::check
`Button` má `size="sm" | "md" | "lg"`, kolega přidal `Badge` se `size="small" | "large"`.
Co mu v revizi napíšeš?

### --expected--
ať použije stejná jména velikostí jako Button: sm, md, lg

### --accept--
sjednotit na sm a lg
stejná prop má mít v celé sadě stejné hodnoty
:::

## Varianta, nová komponenta, nebo `children`

Každý nový požadavek na vzhled vede ke stejné otázce. Tři možné odpovědi:

- **Varianta**, když jde o **stejnou věc s jiným důrazem nebo velikostí**. Tlačítko
  „Smazat" je pořád tlačítko → `variant="default" tone="danger"`.
- **Nová komponenta**, když se liší **chování nebo struktura**. Přepínač vypadá
  trochu jako tlačítko, ale má stav zapnuto/vypnuto a roli `switch` → `Switch`,
  ne `Button variant="toggle"`.
- **Skládání přes `children`**, když se liší **obsah a jeho pořadí**. Karta někdy
  má obrázek, někdy akce dole, někdy štítek u nadpisu. Tomu se říká
  [[složená komponenta]]: `Card`, `CardHeader`, `CardContent`, `CardFooter`
  a volající si poskládá, co potřebuje.

Poznáš to podle props. Komponenta, která dostává `showImage`, `showFooter`,
`footerAlign`, `hasBadge` a `badgeText`, se snaží předvídat každé použití. Každá
nová obrazovka přidá další boolean a uvnitř komponenty roste strom podmínek.

```tsx
// Boolean props: komponenta hádá, co budeš chtít
<CourseCard
  title="Víkend na skalách"
  showBadge
  badgeText="Poslední 2 místa"
  showPrice
  showFooter
  footerAlign="end"
/>
```

```tsx
// Složená komponenta: volající skládá, komponenta dodá vzhled
<Card>
  <CardHeader>
    <CardTitle>Víkend na skalách</CardTitle>
    <Badge tone="warning">Poslední 2 místa</Badge>
  </CardHeader>
  <CardContent>2 400 Kč</CardContent>
  <CardFooter className="justify-end">
    <Button>Přihlásit se</Button>
  </CardFooter>
</Card>
```

:::live react libs=tailwind
```jsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

function Card({ className, ...props }) {
  return <article className={cn('rounded-2xl bg-white shadow-sm', className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-3 p-5 pb-0', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold text-slate-900', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-5 text-sm text-slate-600', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn('flex gap-2 border-t border-slate-100 px-5 py-3', className)} {...props} />;
}

export default function App() {
  return (
    <div className="grid min-h-screen content-start gap-4 bg-slate-100 p-8 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Víkend na skalách</CardTitle>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Poslední 2 místa</span>
        </CardHeader>
        <CardContent>Labák · 12.–13. 6. · 2 400 Kč</CardContent>
        <CardFooter className="justify-end">
          <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white">Přihlásit se</button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lezení na stěně pro děti</CardTitle>
        </CardHeader>
        <CardContent>Boulder Bar Brno · každé úterý · 180 Kč</CardContent>
      </Card>
    </div>
  );
}
```
```css
@import "tailwindcss";
```
:::

:::explain
Vysvětli, proč sada komponent skládá kartu z `Card`, `CardHeader`, `CardContent`
a `CardFooter` místo jedné komponenty s props `showBadge`, `showFooter` a `footerAlign`.

## --model--
Boolean props se snaží předem vyjmenovat všechna použití, a každá nová obrazovka
přidá další prop a další podmínku uvnitř komponenty. Složená komponenta dodá jen
vzhled jednotlivých částí a o obsahu a pořadí rozhoduje volající přes `children`.
Nové použití pak nevyžaduje změnu komponenty a každý díl zůstane malý a čitelný.

## --checklist--
- Boolean props musí předvídat každé použití komponenty.
- Každý nový případ přidá prop a podmínku uvnitř komponenty.
- Ve složené komponentě rozhoduje o obsahu a pořadí volající přes `children`.
- Nové použití složené komponenty nevyžaduje úpravu komponenty samotné.
:::

:::check
Na stránce kurzu potřebuješ tlačítko „Zrušit přihlášku" v červené. Přidáš variantu,
novou komponentu, nebo to složíš přes `children`?

### --answer--
Novou komponentu `CancelButton`, protože má jiný text a jinou barvu.

#### --why--
Text je obsah, ne vzhled, a jiná barva se stejným chováním je přesně případ pro
variantu. Z komponenty na každou akci vznikne `SaveButton`, `DeleteButton`…
a sjednotit je pak nejde.

### --answer--
Poskládat přes `children`: `<Button><span className="text-red-600">Zrušit přihlášku</span></Button>`.

#### --why--
Pozadí, rámeček a hover by zůstaly z výchozí varianty a barva by visela jen na textu.
`children` se hodí na obsah a pořadí, ne na styl celé komponenty.

### --correct--
Variantu, třeba `tone="danger"` — je to pořád tlačítko, liší se jen důrazem.
:::

## Formulářové pole jako vzor

Pole formuláře je nejčastější vzor v aplikaci a nejčastější místo, kde se rozbije
přístupnost. Skládá se ze čtyř částí a **všechny musí být propojené přes `id`**:

| část | propojení |
|---|---|
| popisek | `<label htmlFor={id}>` — klik na popisek zaostří pole, čtečka ho přečte jako název |
| pole | `id={id}`, `aria-invalid` při chybě |
| nápověda | `id={descriptionId}`, pole má `aria-describedby` |
| chyba | `id={errorId}`, taky v `aria-describedby` |

Komponenta pole se na stránce objeví víckrát, takže `id` nesmí být napsané natvrdo.
Na to je hook `useId()`: vrátí řetězec jedinečný pro každou instanci komponenty,
na serveru i v prohlížeči stejný.

:::live react libs=tailwind
```jsx
import { useId, useState } from 'react';

function FormField({ label, description, error, ...inputProps }) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(' ');

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-900">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-emerald-700 aria-invalid:border-red-600"
        {...inputProps}
      />
      {description && (
        <p id={descriptionId} className="text-xs text-slate-500">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [phone, setPhone] = useState('603 12');
  const error = /^\d{3} ?\d{3} ?\d{3}$/.test(phone) ? '' : 'Telefon má devět číslic, třeba 603 123 456.';

  return (
    <form className="grid min-h-screen max-w-sm content-start gap-5 bg-slate-100 p-8">
      <FormField label="Jméno a příjmení" autoComplete="name" defaultValue="Tereza Nováková" />
      <FormField
        label="Telefon"
        type="tel"
        description="Zavoláme jen při změně termínu kurzu."
        error={error}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />
    </form>
  );
}
```
:::

Otevři si DevTools, najdi pole Telefon a podívej se na `aria-describedby`: obsahuje
obě `id`, v pořadí nápověda, chyba. Dopiš číslo do devíti číslic a sleduj, že
`aria-invalid` i `id` chyby z pole zmizí.

:::live react libs=tailwind predict
```jsx
import { useId } from 'react';

function FormField({ label, error }) {
  const id = useId();

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} aria-invalid="true" aria-describedby="email-error" className="h-10 rounded-lg border border-red-600 px-3" />
      <p id={`${id}-error`} className="text-xs text-red-700">{error}</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="max-w-sm p-8">
      <FormField label="E-mail" error="E-mail musí obsahovat zavináč." />
    </div>
  );
}
```
--question-- Chyba pod polem je vidět. Co ohlásí čtečka obrazovky, když uživatel zaostří pole?
--option-- „E-mail, neplatná hodnota, E-mail musí obsahovat zavináč."
--option-- Nic nepřečte a v konzoli bude varování o neexistujícím `id`.
--option*-- „E-mail, neplatná hodnota" — text chyby vynechá a konzole mlčí.
--why-- `aria-describedby="email-error"` odkazuje na `id`, které na stránce není: skutečné `id` odstavce vyrobil `useId()`. Prohlížeč takový odkaz tiše přeskočí, takže čtečka ohlásí název a neplatnost, ale ne důvod. React ani prohlížeč nic nehlásí — past odhalíš jen v DevTools (Accessibility → Description) nebo čtečkou.
:::

> [!PITFALL]
> **`id` natvrdo v komponentě pole.** Příznak: dvě pole na stránce, klik na popisek
> druhého zaostří první. V konzoli nic, v HTML dvakrát `id="email"`. Oprava:
> `const id = useId()` uvnitř komponenty a všechna odvozená `id` skládej z něj.

> [!PITFALL]
> **`id` z `Math.random()`.** Příznak: v prohlížeči to funguje, ale jakmile se
> stránka vykresluje i na serveru, React hlásí
> `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`.
> Na serveru a v prohlížeči vyjde jiné číslo. K vykreslování na serveru se dostaneme
> v sekci o Next.js, teď stačí vědět, že `useId()` tuhle chybu nemá.

:::check
Pole má nápovědu s `id="r1-description"` a chybu s `id="r1-error"`. Jak bude vypadat
atribut `aria-describedby` na poli, když se mají přečíst obě?

### --expected--
aria-describedby="r1-description r1-error"

### --accept--
r1-description r1-error
obě id oddělená mezerou
:::

## Nativní prvek, nebo Radix

Radix má `Checkbox`, `RadioGroup` i `Select`, a přesto nejsou vždycky lepší volba.
Nativní prvky mají zadarmo věci, které Radix musí dohánět: odeslání ve formuláři,
automatické vyplňování, systémový výběr na telefonu a funkci i bez JavaScriptu.

| prvek | nativní stačí, když | Radix, když |
|---|---|---|
| zaškrtávací pole | vzhled zvládne `accent-color` nebo `appearance-none` s vlastním rámečkem | potřebuješ stav „částečně" s vlastní ikonou nebo složitý obsah |
| přepínače (radio) | volíš z textových možností | možnosti jsou karty s obrázkem a cenou a mají se ovládat šipkami jako skupina |
| výběr (`select`) | jde o seznam textů a na telefonu chceš systémový výběr | položky mají ikony, skupiny, popisky nebo vlastní vzhled seznamu |
| přepínač zapnuto/vypnuto | — (nativní prvek není) | vždycky `Switch`, nebo `<input type="checkbox" role="switch">` |

Pro design systém z toho plyne: komponenta `Select` v `components/ui/` smí být
postavená nad nativním `<select>`. Volající to nepozná a zajímá ho jen jednotné API
(`size`, `aria-invalid`, `className`).

> [!NOTE]
> Radix `Select` vykresluje tlačítko s rolí `combobox`, ne `<select>`. Do formuláře
> ho dostaneš přes props `name` — Radix k němu přidá skrytý nativní prvek. Bez `name`
> ve `FormData` hodnota chybí.

:::check
Přihláška na kurz se má vybrat z pěti termínů a většina lidí ji vyplňuje na telefonu.
Nativní `select`, nebo Radix `Select`, a proč?

### --expected--
nativní select, protože na telefonu otevře systémový výběr a stačí text

### --accept--
nativní — jde jen o texty a mobilní výběr je pohodlnější
nativní select, Radix tu nic nepřidá
:::

## Stavy jednotně: hover, fokus, vypnuto, chyba

Uživatel se v rozhraní orientuje podle toho, že **stejný stav vypadá všude stejně**.
Když má tlačítko fokus jako modrý prstenec a pole jako černý rámeček, klávesnicí
se hůř hledá, kde zrovna jsi. Stavové třídy proto patří do základu každé
interaktivní komponenty a mají stejný tvar:

| stav | třídy v celé sadě |
|---|---|
| hover | `hover:bg-…/90` (ztmavení o 10 %) |
| fokus z klávesnice | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` |
| vypnuto | `disabled:pointer-events-none disabled:opacity-50` |
| chyba | `aria-invalid:border-danger` |

`focus-visible` a ne `focus`: prstenec se ukáže při ovládání klávesnicí, ne po kliknutí
myší. Barvu prstence ber z tokenu, aby v tmavém motivu nezmizel.

Tyhle řádky se opakují v `Button`, `Input`, `Select` i `Switch`. Někteří si je vytáhnou
do konstanty `const focusRing = 'focus-visible:outline-2 …'` a vloží do `cn()` každé
komponenty. Hlavní je, aby existovaly na jednom místě a nikdo je nepsal od ruky.

:::check
Proč se v sadě komponent používá `focus-visible:` a ne `focus:`?

### --expected--
focus-visible ukáže prstenec jen při ovládání klávesnicí, ne po kliknutí myší

### --accept--
aby se fokus nezobrazoval po kliknutí myší
focus se ukáže i po kliknutí, focus-visible jen z klávesnice
:::

## Stránka ukázek a údržba zkopírovaných komponent

Design systém bez místa, kde je vidět celý, se rozpadne. Nejlevnější řešení je
**stránka ukázek**: jedna trasa (`/ukazky`), která vykreslí každou komponentu ve
všech variantách, velikostech a stavech, ve světlém i tmavém motivu. Když upravíš
token, projdeš jednu stránku místo celé aplikace.

```tsx
const variants = ['default', 'secondary', 'outline', 'ghost'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export function ButtonShowcase() {
  return (
    <section>
      <h2>Button</h2>
      {variants.map((variant) => (
        <div key={variant} className="flex gap-3">
          {sizes.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
          <Button variant={variant} disabled>vypnuté</Button>
        </div>
      ))}
    </section>
  );
}
```

Větší týmy na to mají Storybook: každá komponenta má soubor s „příběhy" (stavy)
a Storybook z nich postaví katalog s dokumentací. Pro vlastní projekt stačí stránka
ukázek.

### Údržba komponent z shadcn/ui

Komponenty z shadcn/ui jsou [kód v tvém repozitáři](see:react-ui-knihovny/shadcn-a-radix#shadcn-ui-kod-v-repozitari-ne-zavislost),
takže aktualizace nepřijde sama. Tři pravidla, se kterými to zůstane zvládnutelné:

- **Úpravy dělej v tokenech a variantách**, ne přepisováním tříd uvnitř komponenty.
  Změna `--radius-control` přežije aktualizaci, přepsaný řetězec tříd ne.
- **Novou verzi stáhni do čistého stavu Gitu.** `npx shadcn@latest add button`
  soubor přepíše, `git diff` ti ukáže, co se změnilo v knihovně a co byla tvoje
  úprava, a ty ji vrátíš.
- **Nekopíruj komponentu pod jiným jménem.** `Button2` nebo `NewButton` znamená dvě
  sady pravidel. Chybí-li varianta, přidej ji do původní komponenty.

:::check
Kolega potřeboval tlačítko s větším zaoblením, zkopíroval `button.tsx` do
`rounded-button.tsx` a změnil jednu třídu. Co mu navrhneš místo toho?

### --expected--
přidat variantu nebo prop do původního Button, ne kopírovat komponentu

### --accept--
novou hodnotu varianty v Button
upravit variantu nebo token v původní komponentě
:::

## Typické chyby a pasti

> [!PITFALL]
> **Token v `:root`, ale ne v `@theme`.** Příznak: `bg-primary` nic nedělá a třída
> v DevTools nemá žádné pravidlo. Proměnná `--color-primary` v `:root { … }` je obyčejná
> CSS proměnná, utilitu z ní Tailwind nevyrobí. Oprava: token patří do `@theme`
> (nebo do `:root` a v `@theme inline` na něj odkaz, jak to dělá shadcn/ui).

> [!PITFALL]
> **Tmavý motiv přes `dark:` v každé komponentě.** Příznak: `bg-white dark:bg-slate-900`
> na dvaceti místech a v jednom zapomenutém zůstane bílá karta na tmavém pozadí.
> Oprava: sémantický token (`bg-surface`) a přepsání tokenu pod `.dark`.

> [!PITFALL]
> **Chyba pole jen barvou.** Příznak: pole zčervená, ale čtečka nic neohlásí
> a barvoslepý uživatel nic nepozná. Oprava: `aria-invalid` na poli, text chyby
> v prvku s `id` a to `id` v `aria-describedby`.

> [!PITFALL]
> **Boolean props místo variant.** Příznak: `<Button primary small danger>` a uvnitř
> `if (primary && danger)`. Dvě pravdivé props, které si odporují
> (`primary` i `secondary`), nikdo nezakáže. Oprava: jedna prop `variant` s výčtem
> hodnot — vybrat jde vždycky jen jednu.

:::check
`<p className="bg-surface">` v tmavém motivu zůstane bílý, přestože `.dark` přepisuje
`--color-surface`. Proměnná je definovaná jen v `:root`. Co chybí?

### --expected--
token v @theme, aby z něj Tailwind vyrobil utilitu bg-surface

### --accept--
--color-surface musí být v @theme
definice v @theme nebo odkaz přes @theme inline
:::

## Kde to najdeš v MDN

- [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby) — seznam `id` oddělených mezerou a pořadí, ve kterém se popisy čtou.
- [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) — kdy ho nastavit a proč ne hned při načtení prázdného formuláře.
- [`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) — jak prohlížeč rozhoduje, jestli ukázat fokus.
- [`accent-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color) — nabarvení nativního zaškrtávacího pole a přepínačů bez náhrady prvku.
- [`useId`](https://react.dev/reference/react/useId) — anglicky, dokumentace Reactu: proč ne `Math.random()` a jak z jednoho `id` odvodit další.

# --questions--

## --question--

Kolega napsal komponentu pole takhle:

```tsx
function PhoneField({ error }: { error?: string }) {
  return (
    <>
      <label htmlFor="phone">Telefon</label>
      <input id="phone" aria-invalid={!!error} aria-describedby="phone-error" />
      {error && <p id="phone-error">{error}</p>}
    </>
  );
}
```

Na stránce jsou dvě pole: telefon účastníka a telefon zákonného zástupce. Napiš,
co tu přestane fungovat a čím `id` nahradíš.

### --expected--

obě pole mají stejné id, klik na druhý popisek zaostří první pole; id z useId

### --accept--

duplicitní id — popisky i chyby se propojí s prvním polem, oprava přes useId
stejné id dvakrát na stránce, nahradit useId()

### --why--

`id` musí být na stránce jedinečné. Při dvou instancích komponenty najde prohlížeč
pro `htmlFor="phone"` i `aria-describedby="phone-error"` vždycky první prvek, takže
druhé pole ukazuje popisek i chybu prvního. `useId()` dá každé instanci vlastní
základ a z něj se odvodí `id` pole i chyby.

### --see--

react-ui-knihovny/design-system-projektu#formularove-pole-jako-vzor

## --question--

V sadě přibývá požadavek: karta kurzu má mít někdy fotku, někdy seznam lektorů
a někdy dvě tlačítka dole. Co zvolíš?

### --correct--

Složenou komponentu `Card` s díly, ze kterých si obrazovka kartu poskládá přes `children`.

#### --why--

Liší se obsah a jeho pořadí, ne důraz ani chování. Díly dodají vzhled a volající
rozhodne, co v kartě je.

### --answer--

Props `showPhoto`, `showLecturers` a `footerButtons` na komponentě `CourseCard`.

#### --why--

Myslíš si, že vyjmenovat všechny případy předem je jednodušší. Jenže každá další
obrazovka přidá další prop a uvnitř komponenty poroste strom podmínek.

### --answer--

Variantu `variant="photo" | "lecturers" | "actions"`.

#### --why--

Varianta vybírá jednu hodnotu z výčtu, takže kartu s fotkou **i** tlačítky nepopíše.
Varianty jsou na důraz a velikost, ne na to, co komponenta obsahuje.

### --see--

react-ui-knihovny/design-system-projektu#varianta-nova-komponenta-nebo-children

## --question--

Napiš, jak zařídíš tmavý motiv v sadě komponent, aby se v JSX komponent nemuselo
nic měnit.

### --expected--

komponenty používají sémantické tokeny a pod .dark se přepíší jejich hodnoty

### --accept--

sémantické tokeny v @theme a jejich přepsání ve třídě dark
přepsat --color-* proměnné pro .dark, komponenty používají bg-surface a podobně

### --why--

Utilita z tokenu je ve vygenerovaném CSS odkaz na proměnnou
(`background-color: var(--color-surface)`). Když prvek leží uvnitř `.dark`, která
proměnnou přepisuje, dostane novou hodnotu bez jediné změny v komponentě.

### --see--

react-ui-knihovny/design-system-projektu#tokeny-a-skaly-v-theme
