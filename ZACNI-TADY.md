# Začni tady

Akademie je kurz webového vývoje, který běží u tebe na počítači. Čteš výklad,
tipuješ, co kód udělá, píšeš kód přímo v prohlížeči a testy ti hned řeknou, co ještě
chybí. Větší projekty pak děláš ve VS Code jako skutečnou práci. Co ses naučil, se ti
vrací v opakování po dnech a týdnech, dokud to neumíš napsat sám.

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

## Jak se z Akademie učit nejefektivněji

Přečíst a opsat nestačí — to umí každý a za týden to zapomene. Tohle funguje:

1. **Každý den nejdřív opakování.** Otevři **Opakování** v horní liště a projdi, co je
   na dnešek (nejvýš 20 položek, obvykle 5–15 minut). Teprve pak pokračuj v nové látce.
   Odpovídej zpaměti, bez listování ve výkladu.
2. **Nejdřív tipni, pak spusť.** U předpovědí napiš tip dřív, než uvidíš výsledek.
   U vlastního kódu si před kliknutím na Zkontrolovat řekni, co se stane. Špatný tip není
   ostuda — přesně v tu chvíli se učíš nejvíc.
3. **10–15 minut vlastní snahy před nápovědou.** Přečti si chybovou hlášku, vypiš si
   hodnoty přes `console.log`, podívej se do výkladu. Nápovědu otevři, až když se
   opravdu točíš v kruhu — a jen jeden tip, ne všechny najednou.
4. **Po zobrazení řešení krok zopakuj naslepo.** Když ses podíval, jak to napsal autor,
   klikni na **Obnovit krok** a napiš to znovu sám, bez koukání. Druhý den se ti krok
   stejně vrátí v opakování.
5. **Vysvětluj vlastními slovy.** U úloh „Vysvětli vlastními slovy" opravdu piš celé
   věty, jako bys to vysvětloval kamarádovi nebo na pohovoru. Vysvětlení se uloží do
   poznámek a z nich si později uděláš tahák před pohovorem.
6. **Labů se neboj.** Lab je bez vedení schválně — ukáže, jestli workshop „sedl".
   Nejdřív si vyplň **Než začneš** (zadání vlastními slovy, postup v krocích), pak piš.
   Zasekneš se? To je normální, na to jsou tipy.
7. **Vlastní projekt souběžně.** Co se naučíš, hned použij na něčem svém (web pro
   kamaráda, vlastní appka). Kurz dává základy, projekt dává jistotu.
8. **AI jako učitel, ne jako autor kódu.** Když něčemu nerozumíš, nech si to od AI
   vysvětlit, nech se vyzkoušet otázkami, požádej o nápovědu bez hotového kódu. Kód
   do úloh ale piš sám — jinak se naučí jen ta AI.

## Jak kurz funguje

Na úvodní stránce je osnova: části → sekce → moduly. Přepínač **Po částech / Doporučená
trasa** ukáže pořadí, ve kterém se CSS a JavaScript střídají. Nic se nezamyká — každou
sekci, modul i krok můžeš otevřít kdykoli. Tlačítko **Začít** nebo **Pokračovat** tě
vrátí na první nesplněný krok tam, kde jsi skončil. Sekce označené „Připravuje se"
zatím nemají obsah.

Každá sekce má několik typů modulů:

| modul | co v něm děláš |
|---|---|
| **Lekce** | Výklad s živými ukázkami, předpověďmi a kontrolními otázkami. Viz níž. |
| **Workshop** | Stavíš jednu věc krok za krokem. Každý krok začíná připraveným kódem, takže chyba v jednom kroku nerozbije ty další. Pomoc se postupně ubírá: na začátku přesný návod, na konci jen požadované chování. |
| **Lab** | Samostatný úkol bez vedení — jen zadání a seznam požadavků. |
| **Kvíz** | Otázky na porozumění a čtení cizího kódu. Zkoušet ho můžeš kolikrát chceš. |
| **Projekt** | Větší úkol ve VS Code, viz níž. |

Na stránce sekce najdeš **Po sekci umíš** (co bys měl po sekci zvládnout, s odkazy,
kde se to učí), **Tahák** (jde vytisknout) a **Pojmy sekce**.

### Lekce

- **Co myslíš?** — otázka předem. Nehodnotí se, jen tě naladí na to, co přijde.
- **Předpověď** — nejdřív tipni, co kód udělá; výsledek se ukáže až potom. Pak si kód
  můžeš upravit a zkoušet dál.
- **Živá ukázka** — kód měníš a výsledek vidíš hned. Některé ukázky mají ovládací prvky
  (posuvníky, přepínače) a vedle nich řádek CSS, který z nastavení vzniká.
  **Obnovit** vrátí původní verzi.
- **Porovnání** — dvě varianty vedle sebe, které se liší jedinou věcí.
- **Stavy paměti** — krokuješ šipkami a vidíš, na co která proměnná ukazuje.
- **Kontrolní otázka** — po každé části. Psanou odpověď porovná aplikace chytře (mezery,
  uvozovky a středník na konci nevadí).
- Barevné rámečky: **Zapamatuj si** (to hlavní), **Pozor, past** (typická chyba a jak
  ji poznáš), **Tip** a **Poznámka**.
- Tečkovaně podtržený **pojem** — klikni a uvidíš krátkou definici s odkazem na MDN.
- Lekce je splněná, když vyřešíš kontrolní otázky a klikneš **Mám přečteno**.

### Otázky

- Před odesláním můžeš zvolit **Jsem si jistý** nebo **Tipuju**. Na stránce sekce pak
  uvidíš, jak často máš pravdu, když si jsi jistý — a otázky, ve kterých ses mýlil
  s jistotou, se ti vrátí hned zítra.
- Po špatné odpovědi se správná **neukáže** — vidíš jen, proč je tvoje volba špatně,
  a zkusíš to znovu. Správnou odpověď uvidíš po druhém neúspěchu nebo přes **Ukaž odpověď**.
- Kvíz na konci ukáže chybné otázky s odkazy, kde si látku zopakovat, a nabídne
  **Projít jen chybné**. U delšího cizího kódu je kód v panelu vedle otázek s čísly řádků.

### Editor a kontrola kódu

- Vlevo je zadání a požadavky, uprostřed editor se záložkami souborů, vpravo náhled
  stránky a konzole (u čistého JavaScriptu je konzole pod editorem).
- Zvýrazněný pruh v editoru ukazuje, kam máš psát. Kód z předchozích kroků je sbalený
  (rozbalíš ho kliknutím). Upravit můžeš celý soubor.
- **Zkontrolovat** nebo **Ctrl+Enter** spustí testy. Požadavky se označí zeleně nebo
  červeně. U červeného uvidíš česky, co se čekalo a co tvůj kód skutečně vrátil, a u
  chybové hlášky i vysvětlení s nejčastějšími příčinami.
- Když kód nejde spustit (syntaktická chyba), aplikace to řekne rovnou a tlačítko
  **Skočit na řádek** tě dovede k chybě. Chyby podtrhává i editor už při psaní.
- Když je krok splněný, další **Ctrl+Enter** tě pošle na další krok.
- Rozpracovaný kód se ukládá sám. **Obnovit krok** vrátí kód kroku do výchozího stavu.
- Napíšeš omylem nekonečnou smyčku? Nic se neděje — kontrola ji zastaví a řekne ti to.
- Nad náhledem je přepínač šířky **Jako testy · 768 · 375 · Panel** (jak stránka vypadá
  na tabletu a telefonu) a **Nová karta**, kde stránku prozkoumáš ve skutečných DevTools.
- U kódu pro Node.js se místo náhledu ukazuje výstup. **Spustit** pustí program; server
  běží, dokud ho nezastavíš, a v panelu **HTTP klient** mu pošleš požadavek (metoda,
  cesta, hlavičky, tělo) a uvidíš odpověď.

### Druhy kroků

- **Oprava chyby** — kód napsal „kolega" a je v něm chyba. Postupuj podle čtyř kroků
  ladění pod zadáním a změň co nejmenší kus kódu.
- **Seřaď řádky** — poskládáš hotové řádky do správného pořadí a odsazení (Enter přesune
  řádek, šipky mění pořadí, Tab odsazení). Pozor, některé řádky jsou navíc.
- **Opakování bez návodu** — zopakuješ starší látku bez nápovědy v zadání.
- **Vyber nástroj sám** — zadání schválně neříká, jakou metodu použít.
- **Vysvětli vlastními slovy** — po splnění kroku napíšeš proč to funguje, porovnáš se
  vzorem a zaškrtneš, co tvůj text obsahuje. Nezaškrtnuté body se ti vrátí v opakování.

### Když se zasekneš

- **Potřebuju nápovědu** otevírá tipy po jednom: nejdřív jaký koncept a kde je ve
  výkladu, pak kterou vlastnost nebo metodu použít, nakonec vzor na jiných datech.
  Po dvou neúspěšných kontrolách se tlačítko zvýrazní.
- Po posledním tipu můžeš **Porovnat s řešením** — uvidíš rozdíl mezi svým kódem
  a autorovým. Takový krok se ti za den vrátí v opakování, abys ho napsal sám.
- Po splnění je tu **Jak to napsal autor** (tvoje řešení je taky správné, jen se podívej
  na jinou cestu) a u labů **Jiné přístupy**. Když víš, že bys krok znovu nedal, klikni
  **Nezvládl bych to znovu** a vrátí se ti v opakování.
- Pod labem a projektem je **Než lab/projekt uzavřeš** — body kvality, které testy
  nekontrolují, a nápady na rozšíření.

### Opakování

**Opakování** v horní liště (číslo ukazuje, kolik položek čeká) skládá dohromady otázky
z lekcí a kvízů, karty sekcí (co vypíše kód, napiš deklaraci, pohovorové otázky), kroky
k napsání znovu od začátku a body z vysvětlování. Co víš, se vrátí za delší dobu
(3, 7, 16, 35, 90 dní), co nevíš, hned zítra. **Už to umím, nezobrazovat** položku
vyřadí nadobro.

### Poznámky a „Nerozumím"

- V lekci i na pracovní ploše je tlačítko **Poznámka** (nebo klávesa `N`) — panel
  s poznámkami k sekci.
- Nerozumíš odstavci? Najeď na něj myší (nebo označ kus textu) a klikni na otazník
  vlevo. Citace se uloží do poznámek a můžeš k ní připsat, co přesně ti není jasné.
- Všechno najdeš v **Poznámky** v horní liště, po sekcích. Jsou to obyčejné markdown
  soubory v `data/poznamky/`, takže je můžeš upravit i v editoru.

### Další drobnosti

- **Motiv** v horní liště přepíná světlý, tmavý a systémový vzhled.
- **Statistiky** ukážou, kde ses nejvíc zasekával, které otázky ti nejdou a kolik času
  jsi strávil v jednotlivých sekcích.
- **Hledat** zatím jen připravuje místo, vyhledávání přijde později.
- Klávesové zkratky (přehled ukáže klávesa `?`):

| zkratka | co udělá |
|---|---|
| `Ctrl+Enter` | zkontroluje kód; po splnění přejde na další krok |
| `Alt+←` / `Alt+→` | předchozí / další krok workshopu (jinde modul) |
| `N` | poznámka k tomuhle místu |
| `?` | přehled zkratek |
| `Esc` | zavře panel nebo přehled |

Písmenové zkratky nefungují, když píšeš do editoru nebo do pole.

### Projekty ve VS Code

1. V projektu klikni na **Začít projekt**. Výchozí soubory se zkopírují do složky
   `moje-projekty/<sekce>--<projekt>/`.
2. Aplikace ti ukáže cestu ke složce a příkaz `code <cesta>`, kterým projekt otevřeš ve VS Code.
3. Pracuj ve VS Code a soubory ukládej. Zadání ti řekne, jak projekt spustit. U serveru
   v Node.js ho můžeš pustit i přímo v aplikaci a zkoušet přes HTTP klienta.
4. Když chceš vědět, jak na tom jsi, klikni v aplikaci na **Zkontrolovat** — testy
   čtou soubory přímo z disku.

Do složky projektu kurz nikdy nic nepřepíše, je jen tvoje.

## Kde je tvůj postup

Všechno leží ve složce `data/`:

- `progress.json` — co máš splněné, výsledky kvízů a rozpracovaný kód,
- `pokusy.json` — neúspěšné kontroly, otevřené tipy a čas (pro nápovědy a statistiky),
- `opakovani.json` — fronta opakování,
- `jistota.json` — jak často máš pravdu, když si jsi jistý,
- `nastaveni.json` — motiv a šířka náhledu,
- `poznamky/` — tvoje poznámky po sekcích.

A `moje-projekty/` — tvoje projekty. Obě složky patří jen tobě a do gitu se neukládají.

### Jak začít znovu

- **Jeden krok nebo lab:** tlačítko **Obnovit krok** / **Obnovit zadání**.
- **Kvíz:** tlačítko **Zkusit celý kvíz znovu**.
- **Projekt:** smaž (nebo přejmenuj) jeho složku v `moje-projekty/` a klikni znovu na **Začít projekt**.
- **Celý kurz od nuly:** ukonči aplikaci (`Ctrl+C`), smaž soubory `data/progress.json`,
  `data/pokusy.json` a `data/opakovani.json` a spusť ji znovu. Poznámky zůstanou.

---

## Pro autory obsahu

Obsah kurzu je v `content/` jako Markdown a JSON.

- [docs/kontrakt.md](docs/kontrakt.md) — formát souborů (kroky, lekce, kvízy, projekty, karty, pojmy) a jak běží testy.
- [docs/styl-obsahu.md](docs/styl-obsahu.md) — jak psát výklad, zadání, nápovědy a testy.
- [docs/platforma.md](docs/platforma.md) — vnitřní stavba aplikace a jak do ní přidat nástroj.
- `npm run overit` — ověří celý obsah: že jde načíst, že výchozí kód testy neprojde
  a řešení ano, odkazy, pojmy a pravidla příručky. Jen jednu sekci:
  `npm run overit -- content/css-flexbox`; i s doporučeními: `npm run overit -- --doporuceni`.
- `npm test` — testy platformy; `node tools/e2e.js` — průchod celou aplikací v prohlížeči
  (snímky obrazovky uloží do `.e2e/`).
