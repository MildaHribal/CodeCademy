## --card-- code js
Jak vycentruješ text uvnitř divu v Tailwindu?
```html
<div>Nadpis</div>
```
### --expected--
```html
<div class="text-center">Nadpis</div>
```
### --why--
Třída `text-center` nastaví `text-align: center`.

## --card-- output
Co přesně znamená zápis `md:flex`?
```html
<div class="md:flex"></div>
```
### --expected--
Aplikuje `display: flex` na obrazovkách větších než breakpoint `md` (768px). Na menších bude element blokový (výchozí).
### --why--
Tailwind je mobile-first. Třídy bez prefixu platí vždy, prefixy (`md:`, `lg:`) je přidávají na větších displejích.

## --card-- free
Jaký je rozdíl mezi `group-hover:` a běžným `hover:`?
### --expected--
`hover:` se aktivuje jen při najetí na samotný element. `group-hover:` se aktivuje, pokud najedeš na obalovací element, který má na sobě třídu `group`.
### --why--
Pomocí `group` a `group-hover` vytváříme závislé hover stavy – typicky u karet, kde při najetí na kartu zčervená nadpis.
