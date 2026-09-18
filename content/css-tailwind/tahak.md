Nejčastější vzory v Tailwind CSS v4.

| Úkol | Ukázka kódu |
|---|---|
| Flexbox s mezerami | `<div class="flex gap-4 items-center">` |
| Responzivita (mobile-first) | `<div class="grid grid-cols-1 md:grid-cols-2">` |
| Hover a Focus stavy | `<button class="bg-blue-500 hover:bg-blue-600 focus-visible:ring">` |
| Vlastní barva v @theme | `@theme { --color-primary: #ff0000; }` |
| Libovolná hodnota (arbitrary) | `<div class="mt-[17px]">` |
| Interakce v rámci skupiny | `<div class="group"><span class="group-hover:text-red-500">` |

### Časté chyby
- **Dynamické generování názvu třídy:** Tailwind nevidí `<div class="bg-${color}-500">`. Musíš napsat plný název, nebo použít proměnné.
- **Prefix v responzivitě:** Třída s prefixem `md:` platí pro tablet *a širší*. Na mobilu se aplikuje třída *bez prefixu*. Nikdy nepoužívej `sm:` pro definici výchozího stavu na mobilu.
