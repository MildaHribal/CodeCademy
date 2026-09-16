**Komponenta rozhoduje o vzhledu, volající o výjimkách, primitivum o chování.** Třídy skládej
přes `cn()`, varianty drž v mapě, stav vystav do DOM jako [[stavový atribut]] a přístupnost
(fokus, Escape, role) nech na primitivu.

## `cn()`: podmínky a konflikty

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

| nástroj | co řeší | příklad |
|---|---|---|
| `clsx` | podmíněné třídy, zahodí `false`/`null`/`undefined` | `clsx('px-4', { 'ring-2': aktivni })` |
| `tailwind-merge` | [[slučování tříd]] ze stejné skupiny, nechá poslední | `twMerge('px-4 px-8')` → `px-8` |
| `cn()` | obojí najednou, do každé komponenty | `cn(base, className)` |

> [!REMEMBER]
> `className` od volajícího dávej v `cn()` **jako poslední** — jinak ho vlastní třídy
> komponenty přebijí a props `className` bude vypadat rozbitě.

## Varianty přes `cva`

```tsx
const buttonVariants = cva('inline-flex items-center rounded-lg font-medium', {
  variants: {
    variant: { plna: 'bg-znacka text-white', ticha: 'bg-transparent text-slate-700' },
    size: { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm' },
  },
  defaultVariants: { variant: 'plna', size: 'md' },
});

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

- `VariantProps<typeof buttonVariants>` = typy props zdarma z mapy variant.
- `compoundVariants` pro kombinaci (malé nebezpečné tlačítko potřebuje jiný odstup).
- [[varianta komponenty]] se přidává, dokud se mění jen vzhled; jiné chování = nová komponenta.

> [!PITFALL]
> `` className={`bg-${tone}-500`} `` nikdy nefunguje. Tailwind čte zdrojové soubory a hledá
> **celé** názvy tříd; složený řetězec v nich není, takže pravidlo nevznikne. Ve stránce třída
> je, jen nic nedělá. Celé názvy patří do mapy.

## Stav v DOM

| zápis | kdy |
|---|---|
| `data-[state=open]:animate-vjezd` | atribut s hodnotou (`data-state`, `data-side`, vlastní `data-skryte`) |
| `data-[highlighted]:bg-znacka-svetla` | atribut bez hodnoty (položka pod kurzorem v menu) |
| `aria-invalid:border-nebezpeci` | `aria-*`, které stejně potřebuješ kvůli čtečce |
| `motion-safe:data-[state=open]:…` | varianty se řetězí zleva doprava |

Hodnotu spočtenou za běhu do třídy nedávej — pošli ji do CSS proměnné:

```tsx
<div style={{ '--podil': `${procenta}%` } as CSSProperties} className="w-[var(--podil)]" />
```

## Radix primitiva

```tsx
import { Dialog } from 'radix-ui';

<Dialog.Root open={otevreno} onOpenChange={setOtevreno}>
  <Dialog.Trigger asChild><Button>Zrušit předplatné</Button></Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-slate-900/50" />
    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 …">
      <Dialog.Title>Zrušit předplatné</Dialog.Title>
      <Dialog.Description>Hudbu si pustíš do konce období.</Dialog.Description>
      <Dialog.Close asChild><Button variant="ticha">Zpět</Button></Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

| primitivum | na co | co je jinak |
|---|---|---|
| `Dialog` | formulář, detail, vratná akce | `Close`, zavře ho i klik mimo a Escape |
| `AlertDialog` | nevratná akce | role `alertdialog`, `Cancel` + `Action`, klik mimo nezavírá |
| `DropdownMenu` | akce nad položkou | akce do `onSelect`, ne `onClick`; šipky a Escape zdarma |
| `Tabs` | přepínání sekcí | obálka zavřeného panelu zůstane v DOM s `hidden`, obsah se nevykreslí |
| `Select` | výběr z hodnot se vzhledem aplikace | `Value` ve spouštěči, `Viewport` uvnitř `Content` |
| `Switch` + `Label` | zapnout/vypnout | `htmlFor` = `id` přepínače, jinak nemá jméno |
| `Tooltip` | popis k ikoně | popis navíc, **nenahrazuje** `aria-label` |

- [[řízený režim]] (`open` + `onOpenChange`) ber, až když stav potřebuje někdo další;
  jinak stačí `defaultOpen` / `defaultValue`.
- `asChild` předá props a ref jedinému potomkovi — tak se ze spouštěče stane tvůj `Button`
  nebo `<a>` bez neplatného vnoření prvků.
- Obsah v `Portal` končí na konci `<body>`, mimo tvůj layout: v testu ho hledej nad
  `document`, ne uvnitř kontejneru.

> [!PITFALL]
> Řízený dialog bez `Dialog.Trigger` po zavření **nevrátí fokus**: `Dialog.Content` výchozí
> návrat zruší a zaostří `Trigger`, který neexistuje, takže fokus spadne na `<body>`.
> Otevírej dialog z `Trigger`u, nebo si v `onCloseAutoFocus` zavolej `event.preventDefault()`
> a zaostři spouštěč sám.

## Přístupnost, kterou primitivum nevyřeší

- **Jméno prvku**: ikonové tlačítko potřebuje `aria-label`, dialog `Title`, přepínač `Label`.
- **Volbu primitiva**: nevratná akce patří do `AlertDialog`, ne do `Dialog`.
- **Viditelný fokus**: `focus-visible:ring-2 focus-visible:ring-znacka` na každém interaktivním prvku.
- **Kontrast a velikost cíle**: [[past na fokus]] nepomůže, když je stav vidět jen o odstín.

## Motion for React

| prop / hook | k čemu |
|---|---|
| `initial`, `animate`, `transition` | odkud, kam a jak (pružina `stiffness`/`damping` × tween `duration`/`ease`) |
| `exit` | odchod z DOM, jen uvnitř `AnimatePresence` |
| `variants` + `staggerChildren` | pojmenované stavy, rodič je rozdá potomkům postupně |
| `layout` | doanimuje změnu pozice a velikosti z layoutu |
| `layoutId` | přelet mezi dvěma prvky (podtržítko aktivní záložky) |
| `whileHover`, `whileTap`, `whileFocus`, `drag` | gesta, `onDragEnd(event, info)` s `info.offset` |
| `useScroll` → `useTransform` / `useSpring` | hodnota řízená scrollem, do `style`, ne do `animate` |
| `MotionConfig reducedMotion="user"` | při omezeném pohybu zahodí posuny, průhlednost nechá |

```jsx
<AnimatePresence mode="popLayout">
  {rentals.map((rental) => (
    <motion.li key={rental.id} layout exit={{ opacity: 0 }}>
      {rental.bike}
    </motion.li>
  ))}
</AnimatePresence>
```

> [!PITFALL]
> **Pasti `AnimatePresence`:** podmínka stojí nad ní místo uvnitř (odchod skokem);
> `key={index}` (odejde poslední řádek místo smazaného); Radix `Dialog` bez
> `forceMount` (obsah odmontuje Radix dřív, než Motion doanimuje).

## Pasti v testech a v náhledu

| příznak | příčina | oprava |
|---|---|---|
| test čte DOM před překreslením | chybí `await helpers.flush()` | flush po každé akci |
| druhá šipka v menu nic neudělá | událost míří pořád na `[role="menu"]` | posílej ji na `document.activeElement` |
| `getComputedStyle` vrátí `oklch(…)` | barva z palety Tailwindu | testuj vlastní barvu z `@theme`, nebo rozměry |
| `transform` zůstává `none` | `translate-x-5` v Tailwindu 4 píše `translate` | měř posun přes `getBoundingClientRect()` |
