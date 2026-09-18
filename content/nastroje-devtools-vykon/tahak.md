## Panely v DevTools

| Panel | K čemu slouží |
|---|---|
| **Elements** | Úprava HTML/CSS, sledování změn v DOMu (break on subtree modifications). |
| **Console** | Čtení logů, spouštění JS. K vybranému prvku v Elements přistoupíš přes `$0`. |
| **Sources** | Breakpointy, procházení souborů, úpravy skrze Local Overrides. |
| **Network** | Měření vodopádu sítě, simulace pomalého připojení (throttling), blokování requestů. |
| **Memory** | Hledání úniků paměti přes Heap snapshot. |
| **Application** | Local Storage, Cookies, IndexedDB. |
| **Performance** | Zkoumání dlouhých úloh (Long Tasks), vykreslování a paměťových výkyvů. |
| **Lighthouse** | Automatizovaný audit výkonu a přístupnosti. |

## Core Web Vitals (Metriky)

| Metrika | Zkratka | Co měří | Cíl | Jak to zhoršit |
|---|---|---|---|---|
| **Largest Contentful Paint** | LCP | Za jak dlouho se načte největší vizuální prvek na obrazovce. | < 2.5s | Blokující JS, obří nestlačené obrázky, pomalý server. |
| **Interaction to Next Paint** | INP | Jak rychle web vizuálně zareaguje na kliknutí či stisk klávesy. | < 200ms | Dlouhé úlohy (Long tasks) blokující hlavní vlákno. |
| **Cumulative Layout Shift** | CLS | O kolik se obsah stránky vizuálně posune po načtení. | < 0.1 | Obrázky bez určených rozměrů, zpožděné webfonty. |

## Zrychlení stránky

### Skripty a styly

- Obyčejný `<script src="...">` blokuje vykreslování stránky.
- `defer` se stahuje paralelně s HTML a spustí se až na konci. **To je dnešní standard.**
- CSS musíš umístit do hlavičky (`<head>`). CSS blokuje vykreslení stránky záměrně, aby uživatel neviděl chvíli neostylovaný web.

### Obrázky

```html
<!-- Důležitý obrázek (zlepšuje LCP) -->
<img src="hero.webp" fetchpriority="high" width="800" height="400" alt="Záhlaví">

<!-- Obyčejný obrázek níže na stránce (šetří data) -->
<img src="foto.webp" loading="lazy" width="800" height="400" alt="Fotka">
```

Rozměry `width` a `height` zabraňují zhoršení CLS, protože prohlížeč rovnou vytvoří prázdný rámeček správné velikosti.

### Přednačtení (Preload)

Když víš jistě, že nějaký zdroj (např. font) budeš brzy potřebovat:

```html
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

## Úniky paměti (Memory leaks)

Tři nejčastější důvody, proč se paměť neuvolní:

1. **Neodstraněné posluchače** – zavolal jsi `addEventListener`, prvek jsi pak z DOMu smazal, ale zapomněl jsi zavolat `removeEventListener`.
2. **Časovače** – `setInterval`, který se neodhlásil přes `clearInterval` a dál běží na pozadí.
3. **Odpojené uzly (Detached DOM)** – uložil sis prvek do proměnné (`const el = document.getElementById('x')`), prvek zmizel z HTML, ale proměnná ho pořád drží v paměti JS.

> [!PITFALL]
> Nejhůře odhalitelný únik je, když ti na webu postupně roste spotřeba paměti (např. po opakovaném překlikávání stránek). Zkontroluj, jestli neodkládáš události na globální `window` nebo `document` bez odhlášení.
