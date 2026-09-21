## Jak se v Akademii učit

| co dělat | proč |
|---|---|
| Než spustíš kód, **tipni si výsledek** | rozdíl mezi tipem a skutečností ukáže, kde máš chybný model |
| Než se podíváš do výkladu, **zkus si vzpomenout** | hledání v paměti učí víc než druhé přečtení |
| Řekni **jistotu před** odpovědí, ne po ní | měří [[kalibrace|kalibraci]] — jistý omyl je nejcennější signál |
| Nápovědy ber **po jedné** a až po vlastním pokusu | první stupeň je koncept, ne řešení |
| Nech si vrátit **Opakování** po dnech a týdnech | [[opakování s odstupem]] drží látku déle než jeden dlouhý blok |
| Po těžké části **vysvětli vlastními slovy** | formulace odhalí díry, které při čtení nevidíš |

## Učení s AI

- **Nejdřív vlastní pokus a hypotéza**, teprve pak otázka. Odpověď dřív ti sebere právě
  tu část, kvůli které se učíš.
- Ptej se **na vysvětlení**, ne na hotový kód: „proč moje verze vrací `undefined`",
  ne „napiš mi funkci, která…".
- Zadání, které funguje: *„Jsem začátečník. Neříkej mi řešení. Ptej se mě na otázky,
  dokud na to nepřijdu sám."*
- Co AI napíše, **ověř v MDN**. Sebejistý omyl vypadá úplně stejně jako správná odpověď.

## Dobrá otázka, když se zasekneš

1. Co jsem **čekal**.
2. Co se stalo **místo toho** (přesná hláška, ne „nejde to").
3. Co už jsem **zkusil**.
4. [[minimální příklad|Minimální příklad]] — nejkratší kód, na kterém se to pořád ukáže.

## Terminál: minimum

| příkaz | co udělá |
|---|---|
| `pwd` | vypíše, ve které složce stojíš |
| `ls` / `ls -a` | vypíše obsah složky / i skryté soubory s tečkou |
| `cd slozka` | vejde do složky |
| `cd ..` | o složku výš |
| `cd ../blog` | o složku výš a hned do `blog` |
| `cd ~` | do domovské složky |
| `mkdir nova` | založí složku |
| `cat soubor` | vypíše obsah souboru |

Cesta **s lomítkem na začátku** (`/home/karel`) je absolutní, **bez něj** (`weby/kemp`)
relativní k tomu, kde právě stojíš. Šipka nahoru vytáhne předchozí příkaz, Tab doplní
jméno souboru, Ctrl+C běžící příkaz ukončí.

## Git: běžný cyklus

```sh
git init -b main                    # jednou na začátku projektu
git status                          # co je nové, změněné, připravené
git add index.html styles.css       # připrav konkrétní soubory
git diff                            # co se změnilo a ještě není připravené
git diff --staged                   # co je připravené ke commitu
git commit -m "Patička s kontaktem" # ulož připravené jako jeden bod v historii
git log --oneline                   # historie, jeden commit na řádek
```

Nastavení, bez kterého Git první commit odmítne:

```sh
git config --global user.name "Jana Nováková"
git config --global user.email "jana.novakova@example.cz"
```

## Tři místa, kde soubor může být

```
pracovní složka  ──git add──►  staging area  ──git commit──►  historie
   (co vidíš)                 (co půjde do             (co je uložené
                               commitu)                  natrvalo)
```

`git status` řekne, **ve kterém patře** soubor je. `git diff` ukáže rozdíl mezi prvním
a druhým patrem, `git diff --staged` mezi druhým a třetím.

## `.gitignore`

```text
# Co Git nemá sledovat. Jeden vzor na řádek.
.DS_Store          # systémový soubor macOS
Thumbs.db          # systémový soubor Windows
node_modules/      # celá složka (lomítko na konci)
*.log              # všechno, co končí na .log
dist/              # výsledek buildu, dá se vyrobit znovu
```

Commituje se, aby platil pro celý tým. **Na soubor, který Git už sleduje, nezabere** —
sledování se ruší přes `git rm --cached <soubor>`.

## Vzdálený repozitář a nasazení

```sh
git remote add origin git@github.com:jmeno/projekt.git
git remote -v                       # co je pod jakým jménem připojené
git push -u origin main             # první push, -u si zapamatuje větev
git push                            # každý další
```

[[GitHub Pages]]: **Settings → Pages**, zdroj `main` a `/ (root)`. Adresa vznikne jako
`https://<jmeno>.github.io/<repozitar>/`. Výjimka: repozitář pojmenovaný
`<jmeno>.github.io` běží v kořeni.

**`git push` je nasazení** — co je ve sledované větvi, je za pár desítek vteřin na webu.

## VS Code

| zkratka | co udělá |
|---|---|
| Ctrl+P | otevři soubor podle jména |
| Ctrl+Shift+F | hledej ve všech souborech projektu |
| Ctrl+` | otevři/zavři integrovaný terminál |
| Alt+klik | další kurzor |
| Ctrl+D | vyber další stejné slovo |
| Ctrl+S | ulož (a naformátuj, když máš zapnuté [[formátování při uložení]]) |

Otevírej **celou složku projektu**, ne jednotlivé soubory — jinak nefunguje hledání,
terminál ani nastavení projektu.

## Pasti

- **`git add .` na začátku projektu** zapíše i to, co do repozitáře nepatří. Nejdřív
  `.gitignore`, pak přidávej.
- **`git add`, pak ještě úprava, pak commit** → v commitu je starší verze. Přidávej
  až po poslední změně.
- **Zprávy „oprava", „změny", „hotovo"** se v historii za měsíc nedají rozlišit.
- **Cesta začínající lomítkem** funguje lokálně a rozbije se na GitHub Pages.
- **Velká písmena v názvech souborů** projdou na Windows i macOS, ale ne na serveru Pages.
- **Chybějící `index.html`** v publikované složce → 404 na hlavní adrese.
- **API klíč v JavaScriptu** na veřejném webu si přečte kdokoli.
