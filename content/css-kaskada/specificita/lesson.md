# Specificita

:::check pretest
Jak se určí, který selektor je silnější?

## Specificita: trojice (A, B, C)

Specificita je trojice čísel, která se porovnává zleva doprava:
- **A**: id selektory (`#header`)
- **B**: class selektory, atributové selektory a pseudotřídy (`.btn`, `[type="text"]`, `:hover`)
- **C**: element selektory a pseudoelementy (`div`, `h1`, `::before`)

> [!REMEMBER]
> Univerzální selektor (`*`) a kombinátory (`+`, `>`, `~`) mají specificitu (0, 0, 0) a neovlivňují výpočet.

:::specificita
#nav .menu li a:hover
:::

:::check
Jakou specificitu má selektor `#header .nav a`?
:::

## Kde to najdeš v MDN
- [Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)

# --questions--
1. Jaká je specificita selektoru `div.warning`?
2. Proč je špatný nápad používat id pro stylování?
