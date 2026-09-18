# Od issue k pull requestu

:::check pretest
1. Co to znamená "reprodukovat" chybu z issue?
2. Proč je dobré posílat menší commity (a menší pull requesty) místo jednoho velkého?
:::

Dostal jsi za úkol opravit chybu nahlášenou uživatelem. Nebo chceš přidat novou funkci. Než napíšeš první řádek kódu, podívejme se, jaká je celá cesta od zadání (issue) k začlenění tvé změny do hlavního kódu (pull request).

> [!REMEMBER]
> Tvá práce nekončí tím, že kód funguje tobě na počítači. Končí ve chvíli, kdy ho ostatní vývojáři zkontrolují, schválí a začlení. Všechno, co děláš (názvy větví, commity, popisy PR), by mělo tento proces usnadnit.

## Reprodukce problému

Pokud opravuješ chybu (bug), první krok je **vždy** chybu reprodukovat. Znamená to zopakovat postup uživatele tak dlouho, dokud se chyba neprojeví i u tebe.

1. Najdi v issue kroky pro reprodukci (Steps to reproduce).
2. Spusť aplikaci lokálně a zkus chybu vyvolat.
3. Nejde to? Možná potřebuješ specifická data v databázi, nebo se chyba projevuje jen na určitém operačním systému. Ptej se v komentářích u issue.

:::check
Proč bys neměl začít opravovat chybu dřív, než se ti ji podaří na tvém stroji zopakovat?
:::

## Příprava na práci

Už víš, co chceš udělat. Před psaním kódu si vytvoř oddělený prostor: novou větev (branch).

1. Zkontroluj, že jsi na aktuální větvi `main` (nebo `master`): `git checkout main` a `git pull`.
2. Vytvoř novou větev: `git checkout -b fix/discount-calculation`.
3. Název větve by měl naznačovat, co děláš. Často se používají prefixy:
   - `fix/` pro opravy chyb.
   - `feat/` pro nové funkce (features).
   - `chore/` pro údržbu, aktualizace balíčků atd.

> [!TIP]
> Pokud má projekt soubor `CONTRIBUTING.md`, přečti si ho. Často obsahuje pravidla pro názvy větví a formát zpráv v commitech.

## Malé commity

Při práci tvoř "malé" commity. Nemusí to být jeden řádek, ale jeden logický celek.

- Místo jednoho obřího commitu `Oprava všeho` raději:
  - `test: přidán test odhalující chybu ve slevách`
  - `fix: upraven výpočet slev pro košík s více položkami`
  - `refactor: vyčištění starého kódu po opravě`

Výhody malých commitů:
1. Lépe se vracejí zpět (`git revert`), když něco rozbiješ.
2. Usnadňují reviewerům (kolegům) pochopit tvůj myšlenkový postup.
3. Umožňují používat `git bisect` pro hledání chyby v historii.

:::check
Jaká je nevýhoda jednoho velkého commitu se zprávou "Hotovo" na konci celodenní práce?
:::

## Rebase a Pull Request

Jakmile je tvoje větev hotová:

1. **Stáhni si nejnovější změny z `main`:** Zkontroluj, jestli zatím někdo nezměnil kód, který jsi upravoval. Často se dělá `git rebase main` (nebo `git merge main`). Vyřeš případné konflikty lokálně.
2. **Pushni větev na server:** `git push -u origin fix/discount-calculation`.
3. **Vytvoř Pull Request (PR):** Na GitHubu/GitLabu klikni na tlačítko "New Pull Request".

### Jak napsat dobrý popis PR

Reviewer bude číst tvůj kód a potřebuje vědět, *proč* ho čte. Dobrý popis PR by měl obsahovat:

- **Co dělá?** Krátké shrnutí problému a řešení.
- **Proč?** (Odkaz na issue, např. `Fixes #123`).
- **Jak otestovat?** (Kroky pro reviewera, jak ověří, že to funguje).
- **Snímky obrazovky:** (Pokud se měnilo UI).

> [!PITFALL]
> Nikdy do popisu PR nepiš jen "Opravuje chybu" nebo jméno úkolu z Jiry. Reviewer nemá čas hledat v jiných systémech, co přesně chyba dělala.

Pokud na úkolu ještě pracuješ, ale chceš už ukázat, jak to jde, vytvoř **Draft PR** (koncept). Dáš tím najevo: "Zatím neschvalovat, ještě to není hotové, ale můžete se podívat."

## Kde to najdeš v MDN a jinde

- [GitHub: About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) - Oficiální vysvětlení pull requestů na GitHubu.
- [Conventional Commits](https://www.conventionalcommits.org/) - Standard pro psaní zpráv u commitů.

# --questions--

1. K čemu slouží konvence pro pojmenování větví (např. `fix/...`, `feat/...`)?
2. Jaký je rozdíl mezi běžným PR a Draft PR?
3. Jaké informace nesmí chybět v popisu (description) Pull Requestu?
