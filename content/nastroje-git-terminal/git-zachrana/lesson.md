# Záchrana z průšvihů

:::check pretest
Omylem jsi spustil `git reset --hard HEAD~1` a z historie zmizel commit s hodinou práce. Dá se vrátit?

### --answer--
Ne, `--hard` commit smazal natrvalo.

#### --why--
Myslíš si, že reset maže commity? Posouvá jen štítek větve. Za chvíli uvidíš, kde commit zůstal.

### --answer--
Jen když byl předtím pushnutý na server.

#### --why--
Myslíš si, že jediná kopie je na serveru? Commit pořád leží i v tvém lokálním repozitáři.

### --correct--
Ano, commit v repozitáři zůstal a najdeš ho v záznamu o pohybech `HEAD`.

#### --why--
Reset přesunul jen štítek větve. Commit dál existuje a Git si pamatuje, kde `HEAD` předtím stál.
:::

Commitneš do `main` místo do větve. Pushneš soubor `.env` s klíčem k platební bráně.
Zjistíš, že formulář rezervací přestal fungovat „někdy minulý týden" a za tu dobu
přibylo čtyřicet commitů. Tohle potká každého a v týmu se nepozná podle toho, že se
to nestane, ale podle toho, jak rychle a bezpečně to opravíš.

Všechno v téhle lekci stojí na modelu z lekce [Jak Git myslí](see:nastroje-git-terminal/git-model#vetev-je-ukazatel):
commit je neměnný snímek a větev je štítek, který na commit ukazuje.

> [!REMEMBER]
> **Jednou vytvořený commit se jen tak neztratí — ztratí se nanejvýš štítek, který na něj ukazoval.**
> Než začneš opravovat, zeptej se: je ta historie už na serveru? Svoje nesdílené commity
> smíš přepsat (`--amend`, `reset`). Sdílené opravíš novým commitem (`revert`).

## Oprava posledního commitu: `--amend`

Nejčastější drobnost: překlep ve zprávě nebo zapomenutý soubor v commitu, který jsi
právě udělal. `git commit --amend` vezme obsah staging area a **nahradí** poslední
commit novým:

```sh
git commit --amend -m "Přidej ceník kurtů"   # jen nová zpráva

git add robots.txt
git commit --amend --no-edit                  # přidá soubor, zprávu nechá
```

Commity jsou neměnné, takže `--amend` starý commit nemění. Vyrobí nový se stejným
rodičem, novým hashem, a přesune na něj větev. Pro tebe to vypadá jako úprava, pro
kohokoli, kdo už starý commit má, je to jiná historie.

:::check
Poslední commit „Přidej rezervační formulář" neobsahuje soubor `form.css`, i když jsi ho upravil. Commit ještě není na serveru. Co je nejrychlejší čistá oprava?

### --answer--
`git revert HEAD` a pak nový commit se vším.

#### --why--
Myslíš si, že se nesdílená historie musí opravovat novými commity? Revert je pro sdílenou historii. Tady by přidal dva zbytečné commity.

### --answer--
`git commit --amend` bez `git add`.

#### --why--
Myslíš si, že `--amend` sám najde upravené soubory? Bere obsah staging area, takže bez `add` vznikne stejný commit.

### --correct--
`git add form.css` a potom `git commit --amend --no-edit`.

#### --why--
Soubor se dostane do staging area a `--amend` nahradí poslední commit novým, který ho obsahuje.
:::

## `reset`: posuň větev zpátky

`git reset <commit>` přesune **aktuální větev** na jiný commit. Commity „za" ním
přestanou být vidět v `git log`, ale v repozitáři zůstanou. Přepínač říká, co se
stane se staging area a pracovní složkou:

| příkaz | větev | staging area | pracovní složka | kdy |
|---|---|---|---|---|
| `git reset --soft HEAD~1` | o commit zpátky | změny z commitu zůstanou připravené | beze změny | chceš commit udělat znovu jinak |
| `git reset HEAD~1` (`--mixed`) | o commit zpátky | vyprázdní se | změny zůstanou v souborech | chceš změny rozdělit do víc commitů |
| `git reset --hard HEAD~1` | o commit zpátky | vyprázdní se | **přepíše se podle commitu** | chceš commit i změny zahodit |

`HEAD~1` znamená „rodič commitu, na kterém stojíš", `HEAD~3` o tři commity zpátky.

Vyzkoušej si předpověď. Repozitář má tři commity, poslední je „Přidej kontakt"
(přidal soubor `.env` a změnil `index.html`). Pak přijde `git reset --soft HEAD~1`
a hned `git status`:

:::live predict
```html
<pre class="terminal"><span class="prompt">$ git reset --soft HEAD~1
$ git status</span>
On branch main
Changes to be committed:
  (use "git restore --staged &lt;file&gt;..." to unstage)
	new file:   .env
	modified:   index.html

<span class="prompt">$ git log --oneline</span>
d702aad Přidej ceník
0a3745e Úvodní stránka</pre>
```
```css
body { margin: 0; background: #11161c; }
.terminal { margin: 0; padding: 1rem 1.25rem; color: #d7dde4; font: 0.95rem/1.5 ui-monospace, monospace; white-space: pre; tab-size: 4; }
.prompt { color: #7ee0a1; }
```
--question-- Co vypíše `git status` po `git reset --soft HEAD~1`?
--option-- `nothing to commit, working tree clean` — commit zmizel i se změnami.
--option*-- Změny z commitu „Přidej kontakt" jako připravené ke commitu (`Changes to be committed`).
--option-- Změny z commitu jen jako upravené soubory, které je potřeba znovu přidat (`Changes not staged for commit`).
--why-- `--soft` přesune jen větev. Staging area i pracovní složka zůstaly, jak byly před resetem, takže obsahují všechno z commitu „Přidej kontakt" — oproti novému `HEAD` jsou to připravené změny. Stačí napsat `git commit` znovu. Bez `--soft` (`--mixed`) by se staging area vyprázdnila a změny by zůstaly jen v souborech, `--hard` by je smazal.
:::

Zkus si to doma na cvičném repozitáři: po každém ze tří resetů spusť `git status`
a `git log --oneline` a porovnej s tabulkou.

> [!PITFALL]
> `git reset --hard` přepíše i **necommitnuté** úpravy v pracovní složce. Ty nebyly
> v žádném commitu, takže je nevrátí ani reflog. Před `--hard` se podívej do
> `git status`, a co chceš zachovat, commitni nebo odlož přes `git stash`.

:::check
Udělal jsi jeden velký commit „Rezervace a platby" a chceš ho rozdělit na dva. Commit není na serveru. Napiš příkaz, který větev vrátí o commit zpátky a změny nechá v souborech, ale ne ve staging area.

### --expected--
git reset HEAD~1

### --accept--
git reset --mixed HEAD~1
git reset HEAD~
git reset HEAD^
git reset --mixed HEAD~
git reset --mixed HEAD^

### --why--
`--mixed` je výchozí režim: větev se posune, staging area se vyprázdní a změny zůstanou v souborech. Pak je přidáváš po částech do dvou commitů.
:::

## `reflog`: kde byl `HEAD`

Git si lokálně zapisuje každý pohyb `HEAD` — commit, přepnutí, reset, merge. Ten
deník vypíše [[reflog]]:

```text
$ git reflog
d702aad HEAD@{0}: reset: moving to HEAD~1
5aac36d HEAD@{1}: commit: Přidej kontakt
d702aad HEAD@{2}: commit: Přidej ceník
```

Commit „Přidej kontakt" po `reset --hard` v `git log` nevidíš, ale reflog ví, že na
něm `HEAD` před chvílí stál. Stačí mu vrátit štítek:

:::memory
```sh
git reset --hard HEAD~1
git reflog
git branch zachrana 5aac36d
```
--step-- 1 | reset posune main zpátky, commit ztratí štítek
HEAD = 'main'
main -> @c2
@c3: 5aac36d Přidej kontakt (rodič @c2)
@c2: d702aad Přidej ceník
--step-- 2 | reflog nic nemění, jen ukáže hash ztraceného commitu
HEAD = 'main'
main -> @c2
@c3: 5aac36d Přidej kontakt (rodič @c2)
@c2: d702aad Přidej ceník
--step-- 3 | nová větev vrátí commitu štítek
HEAD = 'main'
main -> @c2
zachrana -> @c3
@c3: 5aac36d Přidej kontakt (rodič @c2)
@c2: d702aad Přidej ceník
:::

Místo hashe jde napsat i `HEAD@{1}` („kde byl `HEAD` před jedním pohybem"). Když
chceš `main` vrátit rovnou na ztracený commit, stačí `git reset --hard 5aac36d`.

> [!NOTE]
> Reflog je jen ve tvém repozitáři a na server se neposílá. Commity bez štítku Git
> časem uklidí (výchozí je 30 dní), takže záchrana má svůj čas, ale ne neomezený.

:::check
V `git reflog` vidíš řádek `9c1e4b2 HEAD@{3}: commit: Přidej platby kartou`. Napiš příkaz, který na tenhle commit vytvoří větev `feature/platby` (a nikam tě nepřepne).

### --expected--
git branch feature/platby 9c1e4b2

### --accept--
git branch feature/platby HEAD@{3}

### --why--
`git branch jméno commit` vytvoří štítek na zadaném commitu. Commit tím znovu uvidíš v `git log --all` a Git ho neuklidí.
:::

## `revert`: oprava bez přepisování historie

Reset přepisuje historii: commity po něm z větve zmizí. Na `main`, který už mají
kolegové, to nejde (proč, uvidíš v další části). Tam použiješ [[revert]]:

```sh
git revert 4f2a9c1
```

`revert` vytvoří **nový commit s opačnými změnami**. Co commit `4f2a9c1` přidal, nový
commit odebere, co odebral, vrátí. Historie jen přibude, nic se nepřepisuje, takže
kolegové si opravu stáhnou obyčejným `git pull`.

Kontrastní dvojice k zapamatování: ==reset== posouvá štítek zpátky a commity z větve
zmizí, ==revert== přidává nový commit dopředu a starý v historii zůstane.

:::check
Commit „Zjednoduš výpočet ceny" je na `main` už týden a mají ho všichni kolegové. Teď se ukázalo, že počítá špatně. Jak ho vrátíš?

### --answer--
`git reset --hard` na commit před ním a `git push`.

#### --why--
Myslíš si, že reset jde poslat na server? Kolegové mají commity, které by z tvého `main` zmizely, a server push odmítne.

### --answer--
`git commit --amend` s opraveným výpočtem.

#### --why--
Myslíš si, že `--amend` upraví libovolný commit? Nahrazuje jen poslední commit, a i ten by tím přepsal sdílenou historii.

### --correct--
`git revert` s hashem toho commitu a běžný `git push`.

#### --why--
Revert přidá nový commit, který změny vrátí. Historie se jen prodlouží, takže push projde a kolegové si opravu stáhnou.
:::

## Zlaté pravidlo: nepřepisuj sdílenou historii

Commit, který jsi pushnul, má kolega ve svém repozitáři a staví na něm další práci.
Když ho u sebe přepíšeš (`--amend`, `reset`, `rebase`), máš jinou historii než server.
Server takový push odmítne:

```text
$ git push
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'github.com:kurty/rezervace.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart.
```

Odmítnutí tě chrání. `git push --force` ho obejde a přepíše historii na serveru. Kolegovy
commity, které stavěly na té staré, pak na serveru nebudou, a jemu se při dalším `pull`
historie rozjede.

> [!REMEMBER]
> **Co je na serveru ve sdílené větvi, opravuj novým commitem.** Přepisovat smíš jen
> commity, které ještě nikdo jiný nemá — lokální, nebo ve své vlastní větvi.

Když přepisuješ vlastní pushnutou větev (třeba po rebase), použij místo `--force`
bezpečnější `git push --force-with-lease`: push odmítne, pokud na server mezitím
někdo přidal commit, o kterém nevíš.

:::check
Po `git commit --amend` hlásí `git push` chybu `! [rejected] main -> main (non-fast-forward)`. Proč?

### --answer--
Server je nedostupný, stačí to zkusit znovu.

#### --why--
Myslíš si, že jde o síť? Server odpověděl, jen tvůj push odmítl kvůli obsahu historie.

### --correct--
`--amend` nahradil commit, který už na serveru je, takže tvoje historie na serverovou nenavazuje.

#### --why--
Server přijme jen push, který historii prodlužuje. Nahrazený commit má jiný hash, takže by push starý commit zahodil.
:::

## Commit na špatné větvi: `cherry-pick`

Commit „Přidej platby kartou" jsi udělal na `main`, ale patří do `feature/platby`.
Když ještě není na serveru, oprava jsou dva štítky:

```sh
git branch feature/platby     # nová větev na aktuálním commitu, včetně plateb
git reset --hard HEAD~1       # main o commit zpátky, platby zůstanou jen ve větvi
```

Když větev `feature/platby` už existuje, commit do ní **zkopíruješ** přes
[[cherry-pick]]:

```sh
git switch feature/platby
git cherry-pick 9c1e4b2       # nový commit se stejnými změnami a zprávou
git switch main
git reset --hard HEAD~1
```

`cherry-pick` vytvoří nový commit se stejnými změnami na větvi, kde stojíš. Má jiný
hash, protože má jiného rodiče. Hodí se i pro přenesení jedné opravy do starší verze.

:::check
Po `git cherry-pick 9c1e4b2` na větvi `feature/platby` vypíše `git log --oneline -1` commit se stejnou zprávou. Bude mít hash `9c1e4b2`?

### --answer--
Ano, cherry-pick přesune původní commit.

#### --why--
Myslíš si, že commit jde přesunout? Commity jsou neměnné, cherry-pick vyrobí kopii.

### --correct--
Ne, je to nový commit s jiným rodičem, a proto s jiným hashem.

#### --why--
Hash se počítá i z rodiče. Stejné změny na jiném místě historie dají jiný commit.
:::

## Hledání chyby: `bisect`

Rezervace fungovaly ve verzi `v1.0`, teď nefungují a mezi tím je 40 commitů. Procházet je
po jednom je ztráta odpoledne. [[bisect]] je prochází **půlením**: přepne tě doprostřed,
ty řekneš „dobrý" nebo „špatný" a Git zahodí polovinu, kde chyba není. Na 40 commitů
stačí šest kroků.

```sh
git bisect start HEAD v1.0    # špatný commit, pak dobrý
# Git tě přepne doprostřed. Vyzkoušej aplikaci a řekni výsledek:
git bisect good               # nebo: git bisect bad
# … opakuješ, dokud Git nevypíše: <hash> is the first 'bad' commit
git bisect reset              # návrat na větev, kde jsi začal
```

Když chybu umí poznat skript (návratový kód 0 = dobrý, jiný = špatný), Git ho pustí
na každý krok sám:

```text
$ git bisect start HEAD v1.0
Bisecting: 3 revisions left to test after this (roughly 2 steps)
$ git bisect run node scripts/test-duration.mjs
running 'node' 'scripts/test-duration.mjs'
Bisecting: 1 revision left to test after this (roughly 1 step)
…
13dbe853970fe2f88fb58aa2924d21256fe37c00 is the first 'bad' commit
commit 13dbe853970fe2f88fb58aa2924d21256fe37c00
Author: Jana Nováková <jana@kurty.cz>

    Zjednoduš výpočet délky rezervace
```

Návratový kód z lekce [Terminál do hloubky](see:nastroje-git-terminal/terminal-do-hloubky#tri-proudy-a-navratovy-kod)
tu rozhoduje o všem: skript, který chybu vypíše, ale skončí kódem 0, pošle bisect špatným směrem.

> [!PITFALL]
> Během bisectu stojíš v odpojeném `HEAD` na starém commitu. Zapomeneš-li na
> `git bisect reset`, další commity vznikají mimo větev a `git status` hlásí
> `You are currently bisecting`.

:::check
Mezi funkční verzí a `HEAD` je 200 commitů. Kolik nejvýš kroků (odpovědí „dobrý/špatný") potřebuje bisect, aby našel první špatný commit?

### --expected--
8

### --why--
Každý krok rozpůlí zbývající commity: 200 → 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1. To je osm půlení, protože 2⁸ = 256 je první mocnina dvojky nad 200.
:::

## Commitnuté tajemství

Soubor `.env` s klíčem `PAYMENT_API_KEY` skončil v commitu a ten je na GitHubu. Pořadí
kroků je důležité:

1. **Klíč okamžitě zneplatni** (vygeneruj nový u poskytovatele platební brány). Každý,
   kdo repozitář naklonoval nebo prošel historii, ho má. Roboti prohledávají veřejné
   repozitáře po klíčích během minut.
2. Soubor přestaň sledovat, ale nech ho na disku: `git rm --cached .env`.
3. Přidej `.env` do `.gitignore`, ať se neobjeví znovu, a obojí commitni.

```sh
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Přestaň sledovat .env"
```

Starý klíč v historii zůstane — proto je krok 1 povinný. Nástroje na přepsání celé
historie (`git filter-repo`) existují, ale už stažené kopie nevymažou.

> [!PITFALL]
> `git rm .env` bez `--cached` soubor smaže **i z disku** a aplikace lokálně přestane
> fungovat. `--cached` ho odebere jen z Gitu.

:::check
Kolega pushnul `.env` s ostrým klíčem do veřejného repozitáře a hned poté commitem soubor smazal. Stačí to?

### --answer--
Ano, v aktuální verzi repozitáře už klíč není.

#### --why--
Myslíš si, že smazání v novém commitu odstraní soubor z historie? Starý commit je neměnný a klíč v něm zůstává.

### --correct--
Ne, klíč je v historii a v kopiích repozitáře. Je potřeba ho zneplatnit a vydat nový.

#### --why--
Cokoli, co bylo pushnuté, považuj za prozrazené. Jediná skutečná oprava je klíč zneplatnit.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Revert merge commitu.** `git revert` na merge commit skončí hláškou
> `error: commit 91b8792… is a merge but no -m option was given.` Git neví, ke kterému
> ze dvou rodičů se vracet. Obvykle chceš stav hlavní větve: `git revert -m 1 91b8792`.

> [!PITFALL]
> **`reset` místo `restore`.** Chceš zahodit úpravu jednoho souboru a napíšeš
> `git reset --hard` — tím zahodíš úpravy **všech** souborů. Na jeden soubor patří
> `git restore soubor`.

> [!PITFALL]
> **`--force` po rebase sdílené větve.** Push projde, ale kolegům pak `git pull` hlásí
> `fatal: Need to specify how to reconcile divergent branches` a jejich historie se
> s tvou rozešla. Sdílené větve nerebasuj; na vlastní větvi používej `--force-with-lease`.

> [!PITFALL]
> **Bisect s rozbitým testem.** Když skript selže i na dobrém commitu (třeba chybí
> soubor, který ve staré verzi nebyl), bisect označí za „první špatný" úplně jiný
> commit. Skript si nejdřív vyzkoušej ručně na obou koncích.

## Kde to najdeš v MDN

- MDN Git do hloubky nepopisuje; oficiální dokumentace je na git-scm.com.
- [Pro Git: Reset Demystified](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified) —
  obrázky tří stromů (HEAD, index, pracovní složka) pro `--soft`, `--mixed` a `--hard`.
- [Pro Git: Undoing Things](https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things) —
  `--amend`, `restore` a návrat změn v přehledu.
- [git-bisect](https://git-scm.com/docs/git-bisect) — všechny příkazy bisectu včetně `run`
  a speciálního kódu 125 („tenhle commit nejde otestovat").
- [git-reflog](https://git-scm.com/docs/git-reflog) — zápisy `HEAD@{n}` a jak dlouho reflog vydrží.

# --questions--

## --question--

Poslední dva commity na tvé lokální větvi (nepushnuté) chceš spojit do jednoho se stejným obsahem. Napiš příkaz, který větev vrátí o dva commity zpátky a všechny jejich změny nechá připravené ke commitu.

### --expected--
git reset --soft HEAD~2

### --accept--
git reset --soft HEAD^^

### --why--
`--soft` posune jen větev, staging area zůstane. Následný `git commit` vytvoří jeden commit se změnami z obou.

### --see--

nastroje-git-terminal/git-zachrana#reset-posun-vetev-zpatky

## --question--

Stojíš na `main`, který je shodný se serverem. Příkaz `git revert a1b2c3d` proběhl bez konfliktu. O kolik commitů je teď `main` napřed před serverem?

### --expected--
1

### --why--
Revert nic nemaže ani nepřepisuje, jen přidá jeden nový commit s opačnými změnami. Proto jde poslat obyčejným `git push`.

### --see--

nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie

## --question--

Po `git reset --hard HEAD~3` zjistíš, že jeden ze tří commitů potřebuješ. Kde najdeš jeho hash?

### --answer--
Nikde, `--hard` commity smazal.

#### --why--
Myslíš si, že reset maže commity? Posunul jen štítek větve. Commity v repozitáři zůstaly.

### --answer--
V `git log`, stačí sjet níž.

#### --why--
Myslíš si, že `git log` ukazuje všechno? Ukazuje historii od `HEAD` dozadu a ztracené commity už za `HEAD` nejsou.

### --correct--
V `git reflog`, který zapisuje každý pohyb `HEAD`.

#### --why--
Reflog si pamatuje, že `HEAD` na těch commitech stál, i když na ně žádná větev neukazuje.

### --see--

nastroje-git-terminal/git-zachrana#reflog-kde-byl-head

## --question--

Skript pro `git bisect run` při chybě vypíše „Chyba ve výpočtu", ale vždycky skončí kódem 0. Co bisect udělá?

### --answer--
Pozná chybu z výpisu a najde správný commit.

#### --why--
Myslíš si, že bisect čte výstup skriptu? Text je pro lidi, bisect se rozhoduje jen podle čísla, které skript vrátí.

### --answer--
Skončí chybou, protože skript nic neoznámil.

#### --why--
Myslíš si, že kód 0 je „žádná odpověď"? Kód 0 je jasná odpověď — úspěch.

### --correct--
Každý testovaný commit označí jako dobrý a za první špatný prohlásí commit, který jsi na začátku sám označil jako špatný.

#### --why--
Návratový kód 0 znamená „dobrý". Bisect tak postupně vyloučí všechny commity kromě toho, o kterém jsi mu řekl, že je špatný.

### --see--

nastroje-git-terminal/git-zachrana#hledani-chyby-bisect
