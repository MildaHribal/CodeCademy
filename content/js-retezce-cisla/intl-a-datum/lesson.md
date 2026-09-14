# Formátování a datum

:::check pretest
Jaký objekt bys použil na zformátování čísla `1500000` tak, aby vypadalo jako `1 500 000 Kč`?

### --answer--

`Math.format`

#### --why--

`Math` slouží k výpočtům, nemá metody na formátování textů a měn.

### --correct--

`Intl.NumberFormat`

#### --why--

`Intl` je mezinárodní API v prohlížečích (Internationalization API), které umí zformátovat čísla, data, měny i množná čísla podle pravidel různých jazyků.

### --answer--

`Number.format`

#### --why--

Objekt `Number` umí `toFixed`, ale na lokální měny nebo oddělování tisíců už sám nestačí.
:::

Sestavovat si české formáty čísel a dat ručně pomocí `slice` nebo `toFixed` je otrava. A co hůř, pro jiné jazyky budou tvoje ruční úpravy často špatně. K tomu tu máme globální objekt `Intl`.

## Intl.NumberFormat

K formátování čísel, peněz a procent slouží `Intl.NumberFormat`. Vytvoříš formátovač s daným jazykem (třeba `'cs-CZ'`) a nastavením a pak přes něj protáhneš číslo.

:::check
Jak správně nastavíš formátovač, aby vypsal cenu v korunách?

### --answer--

`new Intl.NumberFormat('cs-CZ', { type: 'money', currency: 'CZK' })`

#### --why--

Skoro, ale vlastnost se jmenuje `style`, ne `type`.

### --correct--

`new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' })`

#### --why--

Ano, `style: 'currency'` říká, že formátujeme měnu a `currency: 'CZK'` říká, o jakou měnu jde.

### --see--

js-retezce-cisla/intl-a-datum#intl-numberformat
:::

## DateTimeFormat a RelativeTimeFormat

Pro formátování data (např. *14. 9. 2026*) použiješ `Intl.DateTimeFormat`.
Pokud chceš zprávu typu *před 5 minutami* nebo *za 3 dny*, sáhni po `Intl.RelativeTimeFormat`.

## PluralRules

Čeština má pro množná čísla tři tvary: *1 položka*, *2 až 4 položky*, *5 a více položek*. `Intl.PluralRules` ti pomůže vybrat ten správný tvar podle čísla.

## Pasti Date

Základní objekt `Date` v JavaScriptu je nechvalně známý tím, že je plný chytáků.

> [!PITFALL]
> **Měsíce se v `Date` číslují od nuly.** Leden je `0`, únor `1` a prosinec `11`. Dny v měsíci se ale číslují normálně od jedničky.

:::live js predict
```js
const d = new Date(2026, 1, 30);
console.log(d.toLocaleDateString('cs-CZ'));
```
--question-- Co vypíše toto datum? Nezapomeň, že rok 2026 není přestupný (únor má 28 dní).
--expected--
```text
2. 3. 2026
```
--why-- Únor (index 1) má v roce 2026 jen 28 dní. Zadáme-li 30, `Date` automaticky "přeteče" do března a připočte dva dny k 28. únoru, takže vyjde 2. březen. Tomuto chování se říká "autocorrection" a často vede k chybám, které se těžko hledají.
:::

## Temporal

Protože objekt `Date` už nejde opravit, aniž by se rozbil starý web, vzniká moderní API jménem **`Temporal`** (na podzim 2026 čerstvě dostupné). Řeší problémy `Date` s časovými zónami a přetékáním.

- `Temporal.PlainDate` reprezentuje datum bez času (např. narozeniny).
- `Temporal.ZonedDateTime` umí datum, čas i přesnou časovou zónu (např. *Europe/Prague*).
- `Temporal.Duration` popisuje rozdíl v čase (např. *3 dny a 4 hodiny*).

Pokud to prohlížeče tvých uživatelů podporují (nebo použiješ polyfill), sáhni vždy po `Temporal`.

## Kde to najdeš v MDN

- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — nastavení měn, desetin, procent.
- [Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) — moderní alternativa pro práci s časem.

# --questions--

## --question--

Proč se hodnota `new Date(2025, 0, 1)` nevypíše jako 1. února, ale 1. ledna?

### --expected--

Protože měsíce se u konstruktoru Date indexují od nuly, takže `0` je leden.

### --why--

Na rozdíl od dnů v měsíci (kde jednička je prvního), u měsíců je nula leden, jednička únor atd. Zápis `Date(2025, 0, 1)` je tedy prvního ledna.

### --see--

js-retezce-cisla/intl-a-datum#pasti-date
