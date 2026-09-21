Postup a příkazy pro práci v repozitáři, který jsi nenapsal.

## Čtyři kroky na začátku

| # | Krok | Co z něj máš |
|---|---|---|
| 1 | Rozběhni projekt podle README, spusť testy | zelený referenční stav |
| 2 | Nakresli si hrubou mapu | víš, kde asi hledat |
| 3 | Vystopuj jeden požadavek od vstupu k datům | znáš skutečné spojnice |
| 4 | Zeptej se historie Gitu | víš, **proč** je kód takový |

## Příkazy

```bash
npm ci                    # přesně ty verze, co má zbytek týmu (ne npm install)
npm test                  # musí být zelené ještě před tvou změnou

rg "Přidat do košíku"     # hledání viditelného textu
git blame src/cart.js     # kdo a kterým commitem změnil který řádek
git log -p src/cart.js    # historie jednoho souboru i se změnami
git log -S "DISCOUNT10"   # commity, kde se text přidal nebo zmizel (pickaxe)
git log --oneline -20     # co se v projektu děje teď

# Kam tým sahá nejčastěji = živé jádro projektu
git log --pretty=format: --name-only | sort | uniq -c | sort -rn | head -20

# Půlením najdi commit, který rozbil test
git bisect start && git bisect bad && git bisect good v1.4.0
```

Ve VS Code: `Ctrl+Shift+F` hledání v projektu · `F12` na definici · `Shift+F12`
*Find All References* · `Ctrl+P` rychlé otevření souboru.

## Cesta od issue k pull requestu

```bash
git switch main && git pull
git switch -c fix/482-sleva-z-celku
# 1) test, který kvůli chybě padá   →  git commit -m "test: …"
# 2) nejmenší možná oprava          →  git commit -m "fix: …"
git rebase main                      # konflikty řeš u sebe
git push -u origin fix/482-sleva-z-celku
```

| prefix větve | k čemu | prefix commitu |
|---|---|---|
| `fix/` | oprava chyby | `fix:` |
| `feat/` | nová funkce | `feat:` |
| `chore/` | údržba, závislosti | `chore:` |
| `docs/` | dokumentace | `docs:` |

**Popis pull requestu:** *Co* (problém a řešení) · *Proč* (`Fixes #482`) · *Jak
otestovat* (konkrétní kroky) · snímky, když se měnilo UI.

## Zkratky

| Zkratka | Co znamená |
|---|---|
| PR | pull request — žádost o začlenění větve |
| MR | merge request — totéž na GitLabu |
| DoD | Definition of Done — kdy je úkol hotový |
| nit | nitpick — drobnost, která nemá blokovat začlenění |
| LGTM | *looks good to me* — schváleno (u velkých PR často bez čtení) |
| WIP | *work in progress* — rozpracované, dnes spíš draft PR |
| IIRC / AFAIK | *pokud si dobře vzpomínám* / *pokud vím* — v komentářích běžné |

## Code review

**Hlídá člověk:** správnost a okrajové případy · architektura · čitelnost a názvy ·
testy · bezpečnost.
**Hlídá stroj:** formátování · mezery a uvozovky · nepoužité proměnné · pořadí importů.

| Váha komentáře | Předpona |
|---|---|
| drobnost, klidně ignoruj | `nit:` |
| nerozumím, vysvětli | `otázka:` |
| šlo by to i takhle | `návrh:` |
| tohle opravit před začleněním | bez předpony |

Velikost PR: do 50 řádků nejlepší review · 50–300 obvyklý cíl · 300–800 čte se
diagonálně · nad 800 „LGTM" bez přečtení.

## Komunikace

```text
Cíl:      Co se snažím udělat.
Zkusil:   Co jsem zkusil (konkrétně).
Chyba:    Co se stalo — přesná hláška.
Domněnka: Kde si myslím, že je problém.
```

- **Timebox 30–60 minut**, pak se jdi zeptat. Bez výčitek.
- **Odhaduj rozsahem** s pojmenovanou neznámou, ne bodem.
- **Celý kontext do první zprávy** — samotné „Ahoj" stojí hodinu čekání.
- **Standup:** co jsem dokončil · co dělám dnes · **co mě blokuje**.

## Pasti a časté chyby

- **Úklid při té příležitosti** — přeformátovaný soubor pohřbí skutečnou změnu v diffu.
- **Smazání divného kódu bez `git blame`** — většinou má důvod, který už není vidět.
- **Oprava bez testu** — nemáš důkaz, že chyba byla, ani pojistku proti návratu.
- **Nová závislost bez domluvy** — je to rozhodnutí na roky, ne na dnešek.
- **Osobní kritika v review** — ne „To máš špatně", ale „Při tisících položkách to bude
  pomalé, nehodila by se `Map`?".
- **Mlčení o zpoždění** — zpoždění, o kterém tým ví ve středu, se dá řešit.
