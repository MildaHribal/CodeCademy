# Komponenty bez duplicit

:::check pretest
Jakou metodu pro znovupoužitelnost doporučuje Tailwind CSS nejvíce?
- Komponenty na úrovni JavaScriptu / frameworku (React, Vue) nebo šablon (Blade, Jinja). (správně)
- Používání direktivy `@apply` v CSS.
- Vytváření tříd pomocí JavaScript funkcí.
:::

Hlavní výtka vůči Tailwindu zní: *"Mám deset tlačítek a na každém musím kopírovat 15 tříd! To se nedá spravovat."* Mají pravdu. Kopírovat dlouhé řetězce tříd je špatně. Musíš to řešit, ale správným způsobem.

## 1. Šablony a komponenty (Doporučená cesta)

Nejlepší způsob, jak zabránit duplikaci kódu, je **neřešit ji v CSS, ale v HTML šabloně**.
Pokud pracuješ s Reactem, Vue, nebo i obyčejným PHP šablonovacím systémem, zabalíš tlačítko do znovupoužitelné komponenty.

```jsx
// Příklad v Reactu
function Button({ children }) {
  return (
    <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      {children}
    </button>
  );
}
```

Všude jinde pak použiješ jen `<Button>Odeslat</Button>`. Třídy máš na jednom místě, ale stále zachováváš výhody utility-first (vidíš na první pohled, jak tlačítko vypadá).

## 2. Direktivy @utility a @apply

Co když nepoužíváš framework a máš prosté HTML stránky? V Tailwind v4 můžeš snadno vytvořit vlastní třídu pomocí `@utility`.

```css
@import "tailwindcss";

@utility btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
}
```

Můžeš pak používat třídu `<button class="btn-primary">`. Toto funguje výborně.

> [!PITFALL]
> Tailwind nedoporučuje používat `@apply` pro "návrat k tradičnímu psaní CSS", kde máš stovky tříd jako `.card`, `.navbar`, `.footer-link`. Ztrácíš tím všechny výhody Tailwindu a začneš řešit zastaralé problémy pojmenovávání tříd (BEM) a bobtnání CSS souboru. `@apply` používej opravdu jen na nejmenší stavební bloky jako tlačítka nebo badge, pokud nemáš šablony.

## Kde to najdeš v MDN
- [Tailwind - Reusing Styles](https://tailwindcss.com/docs/reusing-styles)

# --questions--
Proč se nedoporučuje přepsat úplně vše do vlastních CSS tříd přes `@apply`?
- Protože pak ztrácíš výhodu utility-first přístupu a musíš vymýšlet sémantické názvy pro všechno. (správně)
- Protože `@apply` v Tailwind v4 nefunguje.
- Protože to výrazně zpomaluje načítání stránky v prohlížeči.
