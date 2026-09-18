# Responzivita a stavy

:::check pretest
Jak v CSS zajistíš, že styly platí jen pro širší obrazovky?
- Pomocí `@media (min-width: 768px)` (správně)
- Pomocí `@media (max-width: 768px)`
- Pomocí `:hover`
:::

V předchozích modulech jsi nastavoval vzhled staticky. Teď přidáme interaktivitu a responzivitu. Místo psaní složitých `@media` queries nebo pseudotříd jako `:hover` v CSS souboru přidáme k utilitám předpony, tzv. **varianty**.

## Mobile-first přístup

Tailwind je od základu "mobile-first". Znamená to, že **třídy bez předpony definují vzhled pro mobily**. Pokud chceš design změnit na tabletu, přidáš variantu `md:` (medium, min-width 768px). Na ještě větším displeji `lg:` (large, min-width 1024px).

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- Na mobilu 1 sloupec, na tabletu 2 sloupce, na PC 4 sloupce -->
</div>
```

> [!PITFALL]
> Častá chyba je definovat třídy pro velký displej bez předpony a pak se snažit přidávat varianty pro mobil. Neexistuje žádný zabudovaný prefix `mobile:`. Mobil je vždy výchozí (třída bez prefixu).

## Stavy (hover, focus, active)

Stejným způsobem jako breakpointy fungují i interaktivní stavy. Potřebuješ změnit barvu po najetí myší? Použij `hover:`.

```html
<button class="bg-blue-500 hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-blue-700">
  Koupit
</button>
```

:::live dom
Zkus změnit barvu tlačítka při najetí z modré na červenou (`hover:bg-red-500`).
```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
  Klikni na mě
</button>
```
:::

## Skupiny (group a peer)

Někdy potřebuješ změnit vzhled prvku podle toho, jestli uživatel najel na *jeho rodiče*.
K tomu slouží třída `group` na obalujícím prvku a varianta `group-hover:` na jeho potomcích.

```html
<a href="#" class="group block p-4 border rounded hover:border-blue-500">
  <h3 class="group-hover:text-blue-500">Odkaz na článek</h3>
  <p>Najedeš-li kamkoli na kartu, nadpis zmodrá.</p>
</a>
```

Varianta `peer` funguje podobně, ale pro sourozenecké prvky (např. styl labelu podle toho, jestli je checkbox checked: `peer-checked:text-blue-500`).

## Kde to najdeš v MDN
- [Tailwind - Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind - Hover, Focus, and Other States](https://tailwindcss.com/docs/hover-focus-and-other-states)

# --questions--
Chceš, aby měl div na mobilu padding 4 a na tabletu (md) padding 8. Jak to napíšeš?
- `class="p-4 md:p-8"` (správně)
- `class="md:p-4 lg:p-8"`
- `class="sm:p-4 md:p-8"` (Tohle by nechalo mobil bez paddingu, `sm:` je až od 640px nahoru.)
