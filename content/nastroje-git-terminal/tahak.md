Běžné příkazy do terminálu:

| Příkaz | Popis |
|---|---|
| `ls -la` | Zobrazí všechny soubory (včetně skrytých) v seznamu |
| `grep "text" soubor` | Najde řádky obsahující "text" v souboru |
| `find . -name "*.js"` | Najde všechny `.js` soubory v aktuální složce a podsložkách |
| `lsof -i :3000` | Ukáže proces, který běží na portu 3000 |
| `kill -9 PID` | Natvrdo ukončí proces s daným ID (používej jako poslední záchranu) |
| `export VAR="hodnota"` | Nastaví proměnnou prostředí `VAR` na danou hodnotu |

Roury a přesměrování:

```bash
# Zápis výstupu do souboru (přepíše ho)
echo "Ahoj" > soubor.txt

# Přidání výstupu na konec souboru
echo "Světe" >> soubor.txt

# Poslání výstupu příkazu jako vstupu do jiného příkazu
ls -la | grep ".js"

# Přesměrování chybového výstupu (stderr) do standardního (stdout)
prikaz 2>&1
```

Záchrana v Gitu:

```bash
# Vrátí poslední commit, ale nechá soubory ve staged stavu
git reset --soft HEAD~1

# Zruší úpravy ve všech souborech na aktuální stav commitu
git restore .

# Ukáže historii všech tvých pohybů po Gitu (když se něco ztratí)
git reflog

# Vytvoří nový commit, který přesně zvrátí změny starého commitu
git revert <hash>

# Najde commit, který zavedl chybu
git bisect start
git bisect bad   # aktuální stav je rozbitý
git bisect good <hash> # tenhle historický commit fungoval
# ... testuješ a voláš git bisect good/bad dokud se nenajde viník
git bisect reset # konec vyhledávání
```

Práce s větvemi:

```bash
# Vytvoří a přepne na novou větev
git switch -c nova-vetev

# Sloučí změny z větve do aktuální
git merge jina-vetev

# "Přehraje" tvé lokální commity na aktuální vrchol hlavní větve
git rebase main

# Odloží aktuální necommitnuté změny stranou
git stash

# Vrátí odložené změny zpět
git stash pop
```

> [!PITFALL] Zlaté pravidlo přepisování historie
> Nikdy nepřepisuj (`reset`, `rebase`, `commit --amend`) commity, které jsi už nahrál na vzdálený server (GitHub) a které mohli použít ostatní kolegové. Přepisuj jen ty commity, které máš pouze na svém lokálním počítači.
