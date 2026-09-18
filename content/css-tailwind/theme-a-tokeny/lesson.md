# @theme a design tokeny

:::check pretest
Jak v čistém CSS definuješ globální proměnnou pro barvu?
- V `:root` pomocí `--color-primary: #f00;` (správně)
- Pomocí `$color-primary: #f00;`
- Pomocí `@define primary #f00;`
:::

Když tvoříš větší projekt, nechceš používat základní modrou z Tailwindu (`bg-blue-500`). Chceš svou vlastní firemní modrou. Od Tailwind v4 se všechno nastavení vzhledu zapisuje rovnou do CSS souboru přes direktivu `@theme`.

## Co jsou design tokeny

Design tokeny jsou tvé vlastní barvy, fonty nebo rozestupy, které pojmenuješ a pak používáš po celém projektu. Ve v4 zapisujeme design tokeny jednoduše pomocí CSS proměnných uvnitř `@theme`.

```css
@import "tailwindcss";

@theme {
  --color-primary: #4f46e5;
  --font-brand: "Comic Sans MS", cursive;
}
```

Tím Tailwind naučíš nové utility. Můžeš hned použít `bg-primary`, `text-primary` nebo `font-brand`. Tailwind si proměnnou načte a podle jejího názvu ví, co s ní má dělat (vše s `--color-*` vygeneruje barvové utility).

> [!REMEMBER]
> V Tailwind v4 nepotřebuješ složitý `tailwind.config.js`. Celý tvůj design systém leží přehledně v CSS pomocí `@theme`.

## Jak přepsat základní hodnoty

Někdy nechceš přidávat nové tokeny, ale chceš zrušit ty původní nebo je přepsat (například chceš odebrat standardní fonty). Slouží k tomu klíčové slovo `inline`. Zatím si pamatuj, že běžný blok `@theme` jen přidává *další* možnosti vedle těch zabudovaných.

:::live dom predict
Co se stane, když do `@theme` zadáš `--color-red-500: #00ff00;`? Zkus to.
```html
<style type="text/tailwindcss">
  @theme {
    --color-red-500: #00ff00;
  }
</style>
<div class="bg-red-500 text-white p-4">Jsem červený div! (nebo ne?)</div>
```
:::

> [!PITFALL]
> U vlastních barev se snadno stane, že do proměnné vložíš třeba formát `rgb(255, 0, 0)` bez klíčového slova a pak ti nebude fungovat změna průhlednosti pomocí lomítka (`bg-primary/50`). Ideálně drž barvy v hexadecimálním tvaru.

## Kde to najdeš v MDN
- [Tailwind - Theme Variables](https://tailwindcss.com/docs/theme)

# --questions--
Jak vytvoříš novou barvu "brand", aby fungovaly třídy `text-brand` a `bg-brand`?
- Přidáním `--color-brand: #ff0000;` dovnitř `@theme`. (správně)
- Vytvořením CSS třídy `.text-brand { color: #ff0000; }`.
- Přidáním `--brand-color: #ff0000;` dovnitř `:root`. (Tohle nevytvoří Tailwind utility, ale obyčejnou CSS proměnnou.)
