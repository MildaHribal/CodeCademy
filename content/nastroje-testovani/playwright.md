# End-to-end v Playwrightu

Playwright umožňuje automatizovat prohlížeč. Můžeš klikat na tlačítka, vyplňovat formuláře a kontrolovat, co se zobrazí, stejně jako reálný uživatel.

:::check pretest
Jakým způsobem bys měl vybírat prvky pro kliknutí v E2E testech?
1. Pomocí CSS tříd (např. .btn-primary)
2. Pomocí ID, která vývojář přiřadí
3. Pomocí role, kterou prvek plní pro uživatele (např. tlačítko "Odeslat")
:::

> [!REMEMBER]
> E2E testy by měly simulovat skutečného uživatele. Uživatelé nehledají ID nebo třídy, hledají texty, tlačítka a odkazy.

## Lokátory podle role

Nejspolehlivější způsob, jak najít prvek, je použít jeho roli přístupnosti.

```js
// Najde tlačítko s textem Přihlásit se
await page.getByRole('button', { name: 'Přihlásit se' }).click();
```

Tím testuješ i to, že jsi prvek správně označil pro čtečky obrazovky.

:::check
Jaká metoda Playwrightu zajišťuje nalezení prvku podle přístupné role?
:::

## Kontrola přístupnosti

Playwright se často kombinuje s axe-core, aby při E2E testu zároveň proběhl automatický audit přístupnosti dané stránky.

> [!TIP]
> Spouštěj E2E testy na konci CI/CD pipeline, protože jsou nejpomalejší.

## Kde to najdeš v MDN
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Axe Playwright](https://github.com/dequelabs/axe-core-npm/tree/master/packages/playwright)

# --questions--
- Proč je výběr prvku pomocí `getByRole` stabilnější než pomocí `page.locator('.btn-primary')`?
