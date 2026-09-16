## --card-- output

Jaké přístupné jméno má tenhle odkaz? Napiš jen text jména.

```html
<a href="/kosik">
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.5"/></svg>
  Košík (3)
</a>
```

### --expected-- ignore-case

Košík (3)

### --why--

Odkaz bere jméno z obsahu. Ikona má `aria-hidden="true"`, takže se do jména nepočítá, a zbude text.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --card-- output

Jaké přístupné jméno má tlačítko `<button type="submit" aria-label="Hledat">Najít kávu</button>`? Napiš jen text jména.

### --expected-- ignore-case

Hledat

### --why--

`aria-label` stojí ve výpočtu jména výš než obsah, takže text „Najít kávu" prohraje. Hlasový příkaz „klikni na Najít kávu" pak nic neudělá.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --card-- output

Jakou roli má ve stromu přístupnosti `<a class="nav-link">Ceník</a>` bez atributu `href`? Napiš název role.

### --expected-- ignore-case

generic

### --why--

`a` je odkaz jen s `href`. Bez něj je to obyčejný text, na který nejde Tabem a který v seznamu odkazů chybí.

### --see--

html-pristupnost/strom-pristupnosti#role-cim-prvek-je

## --card-- output

V jakém pořadí projde klávesnice tyhle prvky? Napiš jejich písmena oddělená mezerou.

```html
<button type="button" tabindex="2">X</button>
<a href="#kurzy">Y</a>
<button type="button" tabindex="1">Z</button>
```

### --expected-- ignore-case

Z X Y

### --accept--

Z, X, Y
ZXY

### --why--

Kladné `tabindex` jdou vzestupně před vším ostatním: nejdřív 1, pak 2, a až potom prvky v pořadí DOM. Proto se kladné hodnoty nepoužívají.

### --see--

html-pristupnost/klavesnice-a-fokus#tabindex-0-1-a-proc-ne-kladne

## --card-- output

Který atribut s hodnotou dáš prvku `<html>`, aby čtečka četla stránku českým hlasem? Napiš celý atribut.

### --expected--

lang="cs"

### --accept--

lang='cs'
lang="cs-CZ"

### --why--

Čtečka podle `lang` vybírá hlas a výslovnost. Bez něj čte českou stránku hlasem podle nastavení systému, často anglicky.

### --see--

html-pristupnost/proc-pristupnost#sest-nejcastejsich-chyb

## --card-- output

Tlačítko „Filtry" právě otevřelo panel s filtry. Jakou hodnotu má teď mít jeho `aria-expanded`?

### --expected-- ignore-case

true

### --accept--

"true"

### --why--

`aria-expanded` popisuje, jestli je obsah, který tlačítko ovládá, právě rozbalený. Musí se měnit spolu s tím, co je vidět, jinak čtečka lže.

### --see--

html-pristupnost/strom-pristupnosti#stav-co-se-s-prvkem-prave-deje

## --card-- output

Pod nadpisem `<h2>Kurzy pro baristy</h2>` jsou názvy jednotlivých kurzů. Jakou značku nadpisu dostanou? Napiš jen název značky.

### --expected-- ignore-case

h3

### --accept--

<h3>

### --why--

Úrovně jdou po jedné dolů: pod `h2` patří `h3`. Jak velký nadpis bude, řeší CSS, ne číslo v značce.

### --see--

html-pristupnost/proc-pristupnost#jak-ctecka-stranku-cte

## --card-- output

Jaký atribut s hodnotou dáš odkazu v menu, který vede na právě otevřenou stránku? Napiš celý atribut.

### --expected--

aria-current="page"

### --accept--

aria-current='page'

### --why--

Zvýraznění barvou čtečka nevidí. `aria-current="page"` přidá stav „aktuální stránka" a CSS ho může použít i pro vzhled.

### --see--

html-pristupnost/aria-vzory#aria-current-kde-prave-jsem

## --card-- output

Jakou hodnotu `aria-live` má zpráva s `role="status"` implicitně? Napiš jen hodnotu.

### --expected-- ignore-case

polite

### --why--

`role="status"` je zdvořilá živá oblast: čtečka zprávu řekne, až dořekne, co právě čte. `role="alert"` odpovídá `assertive` a přeruší ji.

### --see--

html-pristupnost/aria-vzory#oznameni-role-status-a-role-alert

## --card-- output

Který atribut dáš obalu obsahu stránky pod otevřeným postranním košíkem, aby na obsah nešlo kliknout, dojít Tabem a aby ho čtečka neviděla? Napiš jen název atributu.

### --expected-- ignore-case

inert

### --why--

`inert` vypne celou část stránky najednou. `aria-hidden` by ji schoval jen čtečce a Tab by po jejích odkazech chodil dál.

### --see--

html-pristupnost/aria-vzory#past-aria-hidden-na-prvku-ktery-dostane-fokus

## --card-- output

Fotka produktu je uvnitř odkazu na detail a vedle ní v tomtéž odkazu je název „Etiopie Yirgacheffe". Jak má vypadat `alt` fotky? Napiš celý atribut.

### --expected--

alt=""

### --accept--

alt=''

### --why--

Název už odkaz pojmenoval. Popisný `alt` by se k němu přidal a čtečka by řekla totéž dvakrát, třeba „Etiopie Yirgacheffe Etiopie Yirgacheffe".

### --see--

html-pristupnost/proc-pristupnost#jaky-alt-napsat

## --card-- css

Napiš deklaraci obrysu fokusu: plná čára silná 3 px v barvě `#7c2d12`.

### --expected--

```css
outline: 3px solid #7c2d12;
```

### --accept--

```css
outline: #7c2d12 solid 3px;
```

```css
outline: solid 3px #7c2d12;
```

### --why--

Výrazný obrys musí jít vidět na každém pozadí. Tenká světlá čára uživateli klávesnice nestačí.

### --see--

html-pristupnost/klavesnice-a-fokus#viditelny-fokus

## --card-- css

Napiš deklaraci, která odsadí obrys fokusu o 2 px od okraje prvku.

### --expected--

```css
outline-offset: 2px;
```

### --why--

Odsazený obrys se nepřekrývá s rámečkem ani pozadím tlačítka, takže je vidět i na tlačítku v barvě obrysu.

### --see--

html-pristupnost/klavesnice-a-fokus#viditelny-fokus

## --card-- css

Napiš deklaraci z receptu `.visually-hidden`, která prvek ořízne tak, že z něj na obrazovce nic nezbude, ale ve stromu přístupnosti zůstane.

### --expected--

```css
clip-path: inset(50%);
```

### --why--

`clip-path: inset(50%)` ořízne prvek ze všech stran do středu. Na rozdíl od `display: none` prvek ze stromu přístupnosti nevyřadí.

### --see--

html-pristupnost/aria-vzory#skryt-pro-oci-pro-ctecku-nebo-pro-oba

## --card-- free

Co je strom přístupnosti a jaké tři údaje v něm má každý ovládací prvek?

### --back--

Strom přístupnosti staví prohlížeč vedle DOM a čtou z něj čtečky, hlasové ovládání i testovací nástroje. Vynechává, co nic nesděluje. Každý uzel má roli (tlačítko, odkaz, nadpis), přístupné jméno (text, podle kterého ho uživatel pozná) a stav (zaškrtnuto, rozbaleno, nedostupné). Když některý údaj chybí nebo lže, uživatel čtečky prvek nepozná nebo nepoužije. Prohlédnout si ho jde v DevTools na kartě Accessibility.

### --see--

html-pristupnost/strom-pristupnosti#problem-tri-tlacitka-ktera-vypadaji-stejne

## --card-- free

Proč na akci na stránce patří `<button>`, a ne `div` s `onclick`?

### --back--

`button` má roli tlačítka, dostane fokus z klávesnice, zmáčkne se Enterem i mezerníkem a čtečka ho ohlásí jako tlačítko se jménem z textu. `div` s `onclick` reaguje jen na myš: Tab ho přeskočí a čtečka přečte obyčejný text. Dohnat to jde `tabindex`, `role` a obsluhou kláves, ale je to pět věcí navíc, na které se snadno zapomene. Tlačítko se přitom dá nastylovat úplně stejně.

### --see--

html-pristupnost/klavesnice-a-fokus#button-a-nebo-klikaci-div

## --card-- free

Co říká první pravidlo ARIA a proč se tvrdí, že žádná ARIA je lepší než špatná?

### --back--

Když má HTML prvek nebo atribut s rolí, stavem a chováním, které potřebuješ, použij ho místo ARIA. ARIA mění jen strom přístupnosti: `role="button"` slíbí čtečce tlačítko, ale nepřidá fokus ani ovládání klávesou. Špatná ARIA tak uživatele aktivně klame, třeba `role="menu"` na navigaci přepne čtečku do režimu, ve kterém odkazy nefungují. Bez ARIA by stejný prvek aspoň zůstal tím, čím je.

### --see--

html-pristupnost/strom-pristupnosti#prvni-pravidlo-aria

## --card-- free

Jaký je rozdíl mezi `hidden`, třídou `.visually-hidden`, `aria-hidden="true"` a `inert`?

### --back--

`hidden` schová prvek všem: očím, čtečce i klávesnici. `.visually-hidden` ho schová jen očím a čtečka ho přečte, hodí se na jméno ikony. `aria-hidden="true"` ho schová jen čtečce, oči ho vidí a pokud jde zaměřit, Tab na něj dál dojde, proto nikdy ne na ovládací prvky. `inert` nechá obsah vidět, ale vypne ho: bez fokusu, bez kliknutí a bez čtečky, typicky obsah pod dialogem.

### --see--

html-pristupnost/aria-vzory#skryt-pro-oci-pro-ctecku-nebo-pro-oba

## --card-- free

Jak ověříš přístupnost stránky, než ji pustíš ven?

### --back--

Nejdřív automat, třeba Lighthouse nebo axe v DevTools: najde chybějící `alt`, popisky a nízký kontrast. Pak stránku projdu jen klávesnicí, jestli se dostanu všude, vidím fokus a pořadí dává smysl. Na kartě Accessibility zkontroluju jména a role ovládacích prvků. Zapnu čtečku a projdu nadpisy, oblasti a hlavní úkol stránky. Nakonec zoom na 200 a 400 %, aby nic nepřeteklo.

### --see--

html-pristupnost/proc-pristupnost#vyzkousej-si-to-sam

## --card-- free

Proč by CSS nemělo měnit pořadí ovládacích prvků oproti HTML?

### --back--

Klávesnice i čtečka jdou v pořadí DOM, CSS (`order`, `row-reverse`, umístění v gridu) mění jen to, kde prvek vidíš. Když se obě pořadí rozejdou, fokus skáče po obrazovce sem a tam a uživatel, který vidí a ovládá stránku klávesnicí, se ztratí. Řešení je uspořádat HTML v pořadí čtení a CSS přesuny používat jen tam, kde pořadí interaktivních prvků nemění.

### --see--

html-pristupnost/klavesnice-a-fokus#poradi-fokusu-je-poradi-v-html

## --card-- free

Kdy použiješ `role="status"` a kdy `role="alert"`?

### --back--

Obě role dělají živou oblast, u které čtečka sama ohlásí změnu textu. `status` je zdvořilá: počká, až čtečka dořekne, co čte, a hodí se na potvrzení („Přidáno do košíku") nebo počet výsledků. `alert` přeruší všechno hned, takže patří jen na to, co nepočká, třeba chybu, která brání pokračovat. Oblast má být na stránce od načtení a skript mění jen její text.

### --see--

html-pristupnost/aria-vzory#oznameni-role-status-a-role-alert

## --card-- free

Podle čeho se rozhodneš, jestli obrázek dostane popisný `alt`, nebo `alt=""`?

### --back--

Podle toho, co obrázek na stránce dělá, ne co je na něm. Když nese informaci (fotka produktu, graf, banner s textem), `alt` řekne, co z něj má uživatel vědět. Když jen zdobí nebo opakuje text vedle, dostane `alt=""` a čtečka ho přeskočí. Když je jediným obsahem odkazu nebo tlačítka, `alt` popíše, kam odkaz vede nebo co tlačítko udělá. Atribut nikdy nechybí úplně.

### --see--

html-pristupnost/proc-pristupnost#jaky-alt-napsat
