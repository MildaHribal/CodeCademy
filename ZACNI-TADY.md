# Začni tady

Akademie je kurz webového vývoje, který běží u tebe na počítači. Čteš výklad,
píšeš kód přímo v prohlížeči a testy ti hned řeknou, co ještě chybí. Větší
projekty pak děláš ve VS Code jako skutečnou práci.

## Spuštění

V terminálu ve složce `akademie`:

```sh
./start.sh
```

Pak otevři v prohlížeči **http://localhost:4300**.

- Při prvním spuštění (a po aktualizaci aplikace) se nejdřív sestaví, chvilku to trvá.
- Ukončení: v terminálu `Ctrl+C`. Postup zůstane uložený.
- Port 4300 je obsazený? Spusť `PORT=4301 ./start.sh` a otevři http://localhost:4301.

Potřebuješ Node.js 22 nebo novější.

## Jak kurz funguje

Na úvodní stránce je osnova: části → sekce → moduly. Tlačítko **Začít** nebo
**Pokračovat** tě vždycky vrátí tam, kde jsi skončil. Sekce označené „Připravuje se"
zatím nemají obsah.

Každá sekce má několik typů modulů:

| modul | co v něm děláš |
|---|---|
| **Lekce** | Výklad s živými ukázkami. Kód v ukázce můžeš měnit a výsledek vidíš hned; **Obnovit** vrátí původní verzi. Na konci odpovíš na kontrolní otázky. |
| **Workshop** | Stavíš jednu věc krok za krokem. Každý krok má zadání, požadavky a editor. Každý krok začíná připraveným kódem, takže chyba v jednom kroku nerozbije ty další. |
| **Lab** | Samostatný úkol bez vedení — jen zadání a seznam požadavků. |
| **Kvíz** | Otázky na porozumění. Po vyhodnocení u každé odpovědi uvidíš, proč je správně nebo špatně. Zkoušet ho můžeš kolikrát chceš. |
| **Projekt** | Větší úkol ve VS Code, viz níž. |

### Editor

- Vlevo je zadání a požadavky, uprostřed editor se záložkami souborů, vpravo náhled stránky a konzole.
- Zvýrazněný pruh v editoru ukazuje, kam máš psát. Upravit můžeš ale celý soubor.
- **Zkontrolovat** nebo **Ctrl+Enter** spustí testy. Požadavky se označí zeleně (splněno)
  nebo červeně; u červeného si rozbal „Proč to neprošlo".
- Když je krok splněný, další **Ctrl+Enter** tě pošle na další krok.
- Rozpracovaný kód se ukládá sám. **Obnovit krok** vrátí kód kroku do výchozího stavu.
- Napíšeš omylem nekonečnou smyčku? Nic se neděje — kontrola ji po chvíli zastaví a řekne ti to.
- U kódu pro Node.js (server) se místo náhledu ukazuje výstup; program pustíš tlačítkem **Spustit**.

### Projekty ve VS Code

1. V projektu klikni na **Začít projekt**. Výchozí soubory se zkopírují do složky
   `moje-projekty/<sekce>--<projekt>/`.
2. Aplikace ti ukáže cestu ke složce a příkaz `code <cesta>`, kterým projekt otevřeš ve VS Code.
3. Pracuj ve VS Code a soubory ukládej. Zadání ti řekne, jak projekt spustit.
4. Když chceš vědět, jak na tom jsi, klikni v aplikaci na **Zkontrolovat** — testy
   čtou soubory přímo z disku.

Do složky projektu kurz nikdy nic nepřepíše, je jen tvoje.

## Kde je tvůj postup

- `data/progress.json` — co máš splněné, výsledky kvízů a rozpracovaný kód.
- `moje-projekty/` — tvoje projekty.

Obě složky patří jen tobě a do gitu se neukládají.

### Jak začít znovu

- **Jeden krok nebo lab:** tlačítko **Obnovit krok** / **Obnovit zadání**.
- **Kvíz:** tlačítko **Zkusit znovu**.
- **Projekt:** smaž (nebo přejmenuj) jeho složku v `moje-projekty/` a klikni znovu na **Začít projekt**.
- **Celý kurz od nuly:** ukonči aplikaci (`Ctrl+C`), smaž soubor `data/progress.json` a spusť ji znovu.

---

## Pro autory obsahu

Obsah kurzu je v `content/` jako Markdown a JSON.

- [docs/kontrakt.md](docs/kontrakt.md) — formát souborů (kroky, lekce, kvízy, projekty) a jak běží testy.
- [docs/styl-obsahu.md](docs/styl-obsahu.md) — jak psát zadání, nápovědy a testy.
- `npm run overit` — ověří celý obsah: že jde načíst, že výchozí kód testy neprojde
  a řešení ano. Jen jednu sekci: `npm run overit -- content/css-flexbox`.
- `npm test` — testy platformy; `node tools/e2e.js` — průchod celou aplikací v prohlížeči
  (snímky obrazovky uloží do `.e2e/`).
