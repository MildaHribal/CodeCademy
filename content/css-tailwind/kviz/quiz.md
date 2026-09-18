---
title: Kvíz
---

<--question-->
Který zápis nastaví elementu modré pozadí až na tabletu (`md`), zatímco na mobilu zůstane bílé?

### --answer--
`md:bg-white bg-blue-500`
#### --why--
Tailwind je mobile-first. Tohle by dalo modrou všem zařízením a na tabletu by ji přepsalo na bílou. Chtěli jsme opak.

### --correct--
`bg-white md:bg-blue-500`
#### --why--
Výborně. Třída bez prefixu nastaví bílé pozadí pro mobilní zobrazení, a jakmile displej dosáhne velikosti `md`, aplikuje se modrá barva.

### --see--
css-tailwind/responzivita-a-stavy#mobile-first-pristup


<--question-->
Jak do Tailwindu v4 přidáš vlastní barvu pod jménem `brand`?

### --answer--
V `tailwind.config.js` do objektu `theme.colors`.
#### --why--
Tohle platilo ve starších verzích Tailwindu. Verze 4 přináší konfiguraci přímo v CSS pomocí `@theme`.

### --correct--
V CSS souboru v bloku `@theme` definováním `--color-brand`.
#### --why--
Přesně tak. Tailwind v4 si proměnné definované ve `@theme` automaticky načte jako design tokeny a vygeneruje z nich utility (např. `text-brand`).

### --see--
css-tailwind/theme-a-tokeny#co-jsou-design-tokeny


<--question-->
Pokud chceš, aby podtržení odkazu vzniklo jen tehdy, když uživatel najede myší na obalovací kartu, použiješ:

### --answer--
`hover:underline` na odkazu a na kartu nedáš nic.
#### --why--
`hover:` se aktivuje, jen když najedeš myší přímo na ten konkrétní prvek (na odkaz).

### --correct--
Třídu `group` na kartu a `group-hover:underline` na odkaz.
#### --why--
Ano, třída `group` na obalovacím elementu propojí stav s potomky, kteří používají prefix `group-hover:`.

### --see--
css-tailwind/responzivita-a-stavy#skupiny-group-a-peer
