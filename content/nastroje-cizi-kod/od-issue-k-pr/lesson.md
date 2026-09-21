# Od issue k pull requestu

:::check pretest
Máš opravit chybu popsanou v issue. Kolik commitů by podle tebe měla mít výsledná větev — jeden velký, nebo několik malých?

### --expected--
Několik malých.
:::

Tvoje práce nekončí tím, že kód funguje na tvém počítači. Končí, když ho někdo jiný
přečte, schválí a začlení. Všechno mezi zadáním a začleněním — jméno větve, zprávy
commitů, popis [[pull request|pull requestu]] — je práce pro toho druhého člověka.

> [!REMEMBER]
> **Pull request je text, který se náhodou skládá z kódu.** Píšeš ho pro čtenáře, ne pro
> překladač. Čím míň musí reviewer hádat, tím dřív máš schváleno.

Cesta má pět kroků:

1. **Reprodukuj** — uvidíš chybu na vlastní oči.
2. **Zajisti** — napíšeš test, který kvůli chybě padá.
3. **Oprav** — uděláš nejmenší změnu, která test zezelená.
4. **Rozděl** — poskládáš historii do čitelných commitů.
5. **Popiš** — otevřeš pull request, ze kterého je vidět proč.

## 1. Reprodukuj, než začneš opravovat

Bez [[reprodukce chyby|reprodukce]] nevíš, jestli opravuješ tu chybu, kterou nahlásili, nebo jinou.

1. Najdi v issue kroky k reprodukci (*Steps to reproduce*).
2. Spusť aplikaci lokálně a zopakuj je.
3. Nejde to? Zeptej se v komentáři u issue — potřebuješ konkrétní data, prohlížeč,
   nebo verzi. Napiš přesně, co jsi zkusil a co jsi místo chyby viděl.

> [!PITFALL]
> „Mně to funguje" není závěr, ale začátek vyšetřování. Chyba se často projeví jen
> s konkrétním účtem, konkrétními daty, na pomalé síti nebo po půlnoci (časové zóny).

:::check
Proč nemá smysl začít psát opravu dřív, než se ti chybu podaří vyvolat na vlastním stroji?

### --answer--
Protože to zakazuje Git — nedovolí commit bez reprodukce.

#### --why--
Git nic takového nehlídá, tohle je pracovní postup, ne technické omezení.

### --correct--
Protože jinak nemám jak poznat, že jsem chybu opravdu odstranil — jen doufám.

#### --why--
Reprodukce je tvoje měřítko. Bez ní neumíš rozlišit „opraveno" od „teď to zrovna nespadlo".

### --see--
nastroje-cizi-kod/od-issue-k-pr#2-zajisti-si-to-testem
:::

## 2. Zajisti si to testem

Než sáhneš na kód, napiš test, který **teď padá** a po opravě projde.

```js
test('sleva se počítá z celkové ceny košíku, ne z jedné položky', () => {
  const kosik = [
    { cena: 200, pocet: 2 },
    { cena: 100, pocet: 1 },
  ];
  assert.equal(celkemSeSlevou(kosik, 'SLEVA10'), 450);
});
```

Tenhle test má tři role najednou: je to **důkaz**, že chyba existuje, **měřítko**, že je
opravená, a **pojistka**, že se nevrátí. V popisu pull requestu se na něj pak dá odkázat
místo dlouhého vysvětlování.

> [!TIP]
> Commitni test **samostatně a před opravou**. Reviewer si pak může commit s testem
> vytáhnout, spustit a na vlastní oči vidět, že padá.

:::check
Proč se commit s testem posílá zvlášť a před commitem s opravou?

### --answer--
Protože jinak by test neprošel.

#### --why--
Test má v tu chvíli naopak padat — o to jde.

### --correct--
Protože reviewer si ten commit může vytáhnout a na vlastní oči vidět, že test chybu opravdu zachytí.

#### --why--
Test přidaný spolu s opravou nejde ověřit — mohl být napsaný tak, aby prošel, aniž by cokoli hlídal.
:::


## 3. Založ větev a oprav to nejmenší možnou změnou

```bash
git switch main && git pull          # čerstvý výchozí bod
git switch -c fix/sleva-z-celku      # větev pojmenovaná podle úkolu
```

Prefixy, na kterých se většina týmů shodne:

| prefix | k čemu |
|---|---|
| `fix/` | oprava chyby |
| `feat/` | nová funkce |
| `chore/` | údržba, závislosti, konfigurace |
| `docs/` | dokumentace |

Při opravě platí jediné pravidlo: **měň jen to, co souvisí s issue.** Přejmenování
proměnných „při té příležitosti" udělá z diffu o dvaceti řádcích diff o dvou stech
a reviewer přestane vidět to podstatné.

> [!PITFALL]
> Nespouštěj v cizím projektu formatter na celý soubor, pokud to není přímo úkol. Diff
> pak obsahuje celý soubor a review se stane nemožným.

## 4. Rozděl práci do commitů, které dávají smysl

Commit není záloha práce, je to **krok v příběhu**. Většina týmů na to má dohodu jménem
[[konvenční commity]]:

```
test: test odhalující špatný výpočet slevy
fix: sleva se počítá z celkové částky košíku
docs: poznámka o slevách v README
```

Malé commity ti dají tři věci:

1. `git revert` vrátí jednu chybnou část, ne celý den práce.
2. Reviewer čte tvůj postup po krocích, ne jako jednu hromadu.
3. `git bisect` v budoucnu najde viníka regrese — s commitem „Hotovo" nenajde nic.

:::check
Jak se jmenuje standard pro zprávy commitů, který používá předpony `feat:`, `fix:` a `chore:`?

### --expected-- ignore-case
Conventional Commits

### --accept--
conventional commits
konvenční commity
:::

:::check
Jak pojmenuješ větev, na které opravuješ chybu s výpočtem slevy?

### --expected--
fix/sleva

### --accept--
fix/vypocet-slevy
fix/sleva-z-celku
fix/482-sleva

### --why--
Prefix `fix/` říká druh práce, zbytek jména úkol. Přesné znění si projekty řídí v `CONTRIBUTING.md`.
:::


## 5. Otevři pull request, ze kterého je vidět proč

```bash
git switch main && git pull
git switch fix/sleva-z-celku && git rebase main   # vyřeš konflikty u sebe
git push -u origin fix/sleva-z-celku
```

Popis pull requestu má čtyři části a zabere tři minuty:

- **Co** — jedna věta o problému a jedna o řešení.
- **Proč** — odkaz na issue (`Fixes #482`), takže se issue zavře samo po začlenění.
- **Jak to ověřit** — kroky pro reviewera, ať nemusí hádat.
- **Snímky obrazovky** — vždycky, když se měnilo UI.

> [!PITFALL]
> Popis „Opravuje chybu" nebo jen kód úkolu z Jiry je pro reviewera prázdný. Nutíš ho
> přepínat do jiného systému — a on to neudělá, jen review odloží.

Ještě nejsi hotový, ale chceš zpětnou vazbu na směr? Otevři [[draft pull request]].
Říká týmu: *dívejte se, ale neschvalujte.*

:::explain
Vysvětli vlastními slovy, proč se commit s testem vyplatí udělat dřív než commit s opravou.

## --model--
Commit s padajícím testem je důkaz. Reviewer si ho může vytáhnout, spustit a vidět na
vlastní oči, že chyba existuje a že tvůj test ji opravdu zachytí. Když test přidáš až
spolu s opravou, nedá se to nijak rozlišit — test může být napsaný tak, aby prošel
s tvým kódem, aniž by cokoli hlídal. Pořadí commitů je tedy součástí argumentace:
nejdřív problém, pak řešení.

## --checklist--
- Test před opravou je důkaz, že chyba existuje.
- Reviewer si může commit vytáhnout a test spustit.
- Test přidaný spolu s opravou nejde ověřit.
- Pořadí commitů vypráví příběh: problém, pak řešení.
:::

## Kde to najdeš v MDN a jinde

- [GitHub: About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) — jak pull requesty fungují.
- [Conventional Commits](https://www.conventionalcommits.org/) — standard pro zprávy commitů.
- [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) — klíčová slova jako `Fixes #482`.

# --questions--

## --question--

K čemu slouží prefixy ve jménech větví (`fix/`, `feat/`, `chore/`)?

### --answer--
Git podle nich rozhoduje, kam se větev sloučí.

#### --why--
Git jména větví nijak nevyhodnocuje, je to čistě lidská dohoda.

### --correct--
Dávají na první pohled najevo, o jaký druh práce jde — v seznamu větví i v CI.

#### --why--
Je to konvence pro lidi (a někdy pro automatizaci), ne vlastnost Gitu.

## --question--

Jaký je rozdíl mezi běžným a draft pull requestem?

### --answer--
Draft se nedá spustit v CI.

#### --why--
CI na draftech běžně běží, často právě proto, aby autor viděl výsledek co nejdřív.

### --correct--
Draft říká „ještě na tom dělám, nechci schválení" — nejde ho začlenit a automaticky nežádá nikoho o review.

#### --why--
Je to signál pro tým, ne technické omezení kódu.

### --see--
nastroje-cizi-kod/od-issue-k-pr#5-otevri-pull-request-ze-ktereho-je-videt-proc

## --question--

Co napíšeš do popisu pull requestu, aby se po začlenění automaticky zavřelo issue číslo 482?

### --expected--
Fixes #482

### --accept--
Closes #482
Resolves #482
fixes #482

### --why--
GitHub rozumí klíčovým slovům `Fixes`, `Closes` a `Resolves` následovaným číslem issue.

## --question--

Proč je špatný nápad spustit v opravném pull requestu formatter na celý soubor?

### --answer--
Formatter může rozbít funkčnost kódu.

#### --why--
Formatter mění jen bílé znaky a zápis, chování zůstává. Problém je jinde.

### --correct--
Diff se nafoukne o stovky přeformátovaných řádků a skutečná oprava se v nich ztratí.

#### --why--
Reviewer má omezenou pozornost. Čím větší diff, tím menší šance, že si všimne toho podstatného.

## --question--

**Opakování z dřívějška.** Tvůj pull request změnil chování API: pole `total` teď vrací
částku v haléřích místo v korunách. Jakým způsobem se taková změna v REST API správně
zavádí, aby nerozbila existující klienty?

### --answer--
Stačí to napsat do popisu pull requestu.

#### --why--
Popis přečte reviewer, ne nasazení klienti.

### --correct--
Novou podobou odpovědi ve verzované cestě (`/v2/...`) nebo novým polem vedle starého, se starým označeným jako zastaralé.

#### --why--
Klient, který zná jen starý tvar, musí dál fungovat, dokud nepřejde na nový.

### --see--
api-http-rest/navrh-rest

## --question--

**Opakování z dřívějška.** Na pull request se pustí CI a spadne krok `npm run lint`,
i když testy projdou. Co to znamená pro začlenění?

### --answer--
Nic, lint je jen doporučení — PR jde začlenit.

#### --why--
Když je lint součástí CI, je to podmínka, ne doporučení.

### --correct--
Pull request je červený a nemá se začleňovat, dokud lint neprojde — CI je smluvená laťka pro celý tým.

#### --why--
Červená větev v CI znamená, že další lidé staví na rozbitém základu.

### --see--
nasazeni-provoz/ci-cd
