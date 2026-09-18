Nástroje a postupy pro orientaci v cizím kódu a komunikaci.

| Zkratka | Co znamená |
|---|---|
| PR | Pull Request - žádost o začlenění větve s kódem do hlavní větve. |
| DoD | Definition of Done - seznam kritérií nutných k dokončení úkolu. |
| nit | Nitpick - drobná připomínka v code review, která nemusí blokovat schválení. |

## Příkazy pro Git archeologii

```bash
# Vyhledání textu v repozitáři
rg "hledaný_text"

# Zobrazení autora a času posledních úprav na každém řádku
git blame cesta/k/souboru.js

# Zobrazení historie commitů daného souboru (včetně diffů)
git log -p cesta/k/souboru.js

# Nalezení commitu, kde se dané slovo objevilo/zmizelo
git log -S "HledanyText"
```

## Pasti a časté chyby

- **Neptej se hned:** Zkus problém řešit nejdřív sám s timeboxem.
- **Neposílej obří commity:** Piš commity jako malé logické celky, aby šly případně revertovat a revieweři je snadno přečetli.
- **Osobní kritika v review:** Kod je kód, člověk je člověk. Nepiš „To máš špatně“, ale spíše „Tento kód bude pomalý při velkém poli, co použít Set?“
