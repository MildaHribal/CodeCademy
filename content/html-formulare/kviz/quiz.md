---
pass: 0.8
---

## --question--
Který atribut určuje, na jakou URL adresu se mají odeslat data z formuláře?

### --answer--
`method`
#### --why--
Atribut `method` určuje způsob odeslání (HTTP metodu jako GET nebo POST), ne cílovou URL.
### --correct--
`action`
#### --why--
Atribut `action` obsahuje cílovou adresu (endpoint), kam prohlížeč formulářová data předá.

### --see--
html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

## --question--
Co udělá tlačítko `<button>Zrušit</button>` vložené uvnitř formuláře, když na něj uživatel klikne?

### --answer--
Nic, protože nemá nastavený `type="submit"`.
#### --why--
Výchozí typ tlačítka v HTML je totiž právě `submit`.
### --correct--
Odešle formulář.
#### --why--
Značka `<button>` má výchozí typ `submit`. Pokud ho chceš použít jen jako klikátko pro JavaScript nebo zavírání modálu, musíš explicitně uvést `type="button"`.

### --see--
html-formulare/jak-funguje-formular#tlacitka-submit-button-a-reset

## --question--
Kde se objeví odesílaná data, pokud použijete `method="GET"`?

### --answer--
Skrytá v těle HTTP požadavku.
#### --why--
Do těla se data dávají při metodě POST.
### --correct--
Přímo v URL adrese (v adresním řádku).
#### --why--
Metoda GET připojí všechna data za otazník přímo do URL, např. `?jmeno=Karel`.

### --see--
html-formulare/jak-funguje-formular#get-nebo-post

## --question--
Co musíš udělat, abys v JavaScriptu zabránil odeslání formuláře a obnovení stránky?

### --answer--
Nastavit formuláři `action=""`.
#### --why--
To by znamenalo odeslání na stejnou URL. Stránka se stejně načte znovu.
### --correct--
Zachytit událost `submit` a zavolat `event.preventDefault()`.
#### --why--
Zabráníš tak výchozímu chování prohlížeče (což je právě odeslání na server) a celou logiku si převezme tvůj skript.

### --see--
html-formulare/validace-v-prohlizeci

## --question--
K čemu slouží HTML atribut `required` na poli `<input>`?

### --answer--
Označí ho červenou barvou a zablokuje jej pro úpravy.
#### --why--
To by dělaly atributy jako `readonly` nebo `disabled`.
### --correct--
Zakáže prohlížeči odeslat formulář, dokud pole nebude vyplněné.
#### --why--
A navíc při pokusu o odeslání ukáže uživateli vestavěnou bublinu s nápovědou.

### --see--
html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy


## --question--

Formulář má `<input type="text" id="mesto">` bez atributu `name`. Napiš, co o téhle položce server dostane.

### --expected--

nic

### --accept--
nedostane nic
nedorazí vůbec
nic se neodešle
žádnou hodnotu

### --why--

`name` je klíč, pod kterým hodnota dorazí. Pole bez `name` se do odesílaných dat vůbec
nedostane — `id` slouží k párování s popiskem a ke stylům, na odeslání nemá vliv. Je to
nejčastější důvod, proč „formulář nefunguje" a přitom v něm není chyba.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --question--

Kdy sáhneš po `method="GET"` a kdy po `method="POST"`?

### --correct--

`GET` na dotazy, které chci mít v adrese a jde je poslat odkazem; `POST` na cokoli, co mění stav nebo obsahuje citlivé údaje.

#### --why--

Výsledek hledání s `GET` jde poslat kamarádovi jako odkaz a prohlížeč ho může cacheovat.
Objednávku s `POST` naopak nechceš mít v historii ani v logu serveru — a nechceš, aby
se zopakovala obnovením stránky.

### --answer--

`GET` pro krátká data, `POST` pro dlouhá — rozhoduje délka.

#### --why--

Délka je jen vedlejší důsledek (adresa má praktický strop). Rozhoduje, jestli akce něco
mění a jestli mají data zůstat v adrese.

### --answer--

`POST` je bezpečný, `GET` ne — proto se hesla posílají přes `POST`.

#### --why--

Ani `POST` data nešifruje, to dělá až HTTPS. `POST` je jen nedá do adresy, historie
a logů — což je důvod dost dobrý, ale není to bezpečnost.

### --see--

html-formulare/jak-funguje-formular#get-nebo-post

## --question--

Napiš, jakým atributem spáruješ `<label>` s polem, které má `id="email"`.

### --expected--

for="email"

### --accept--
for
atribut for

### --why--

`<label for="email">` a `<input id="email">` patří k sobě. Kliknutí na popisek pak
zaostří pole (u zaškrtávátka ho rovnou přepne) a čtečka obrazovky popisek přečte, když
do pole uživatel vstoupí. Popisek vedle pole bez `for` je pro čtečku jen náhodný text.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --question--

Proč `placeholder` nenahradí `<label>`?

### --correct--

Zmizí, jakmile uživatel začne psát, takže po vyplnění už není poznat, co v poli je.

#### --why--

Navíc má obvykle slabý kontrast a čtečky obrazovky ho čtou nespolehlivě. `placeholder`
je na **příklad hodnoty** („např. 602 00"), ne na popis pole.

### --answer--

Protože ho starší prohlížeče neumí.

#### --why--

Umí ho všechny. Problém není v podpoře, ale v tom, že mizí.

### --answer--

Protože se nedá nastylovat.

#### --why--

Dá, přes `::placeholder`. Ale ani nastylovaný placeholder nepřestane po vyplnění mizet.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --question--

Ve formuláři je jedno textové pole a uživatel v něm zmáčkne Enter. Co se stane?

### --correct--

Formulář se odešle, i když uživatel na žádné tlačítko neklikl.

#### --why--

Je to standardní chování a lidé ho čekají — u vyhledávacího pole je to hlavní způsob
odeslání. Právě proto je nebezpečné mít ve formuláři tlačítko „Zrušit" bez
`type="button"`: Enter i klik pak formulář odešlou.

### --answer--

Nic — bez kliknutí na tlačítko se formulář neodešle.

#### --why--

Odešle. Enter v textovém poli je zkratka pro odeslání formuláře.

### --answer--

Vloží se nový řádek.

#### --why--

To dělá Enter v `<textarea>`. Jednořádkové `<input>` nový řádek nepojme.

### --see--

html-formulare/jak-funguje-formular#odeslani-enterem

## --question--

Skupina přepínačů (`type="radio"`) se chová divně: dají se zaškrtnout všechny naráz. Napiš, co je špatně.

### --expected--

mají různé name

### --accept--
nemají stejný name
chybí stejné name
každý má jiný name
musí mít stejný name

### --why--

Přepínače tvoří skupinu podle **shodného `name`** — teprve pak se navzájem vylučují
a do odeslaných dat jde jedna hodnota. Rozlišuje je `value`, ne `name`. Stejný `name`
u zaškrtávátek naopak znamená, že se odešlou všechna zaškrtnutá pod jedním klíčem.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --question--

K čemu je ve formuláři `<fieldset>` a `<legend>`?

### --correct--

Seskupí související pole a `<legend>` skupinu pojmenuje — čtečka obrazovky ten název ohlásí u každého pole ve skupině.

#### --why--

Nejvíc je to znát u přepínačů: bez `<legend>` uživatel slyší jen „Ano" a „Ne" a netuší,
na co odpovídá. Rámeček kolem skupiny je jen výchozí styl, dá se přebarvit.

### --answer--

Jen nakreslí rámeček kolem polí, význam nemá.

#### --why--

Rámeček je výchozí styl prohlížeče. Význam nese `<legend>`, a ten čtečka používá.

### --answer--

Odešle pole ve skupině jako jeden objekt.

#### --why--

Data se odesílají po jednotlivých polích podle `name`. `<fieldset>` odeslání nijak nemění.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --question--

V minulé sekci jsi psal HTML. Napiš, kolik prvků `<h1>` má mít jedna stránka.

### --expected--

jeden

### --accept--
1
právě jeden

### --why--

Hlavní nadpis říká, o čem stránka je — víc jich znamená, že si čtenář ani čtečka
obrazovky nevyberou. Podnadpisy jsou `h2` až `h6` a úroveň klesá po jedné.

### --see--

html-zaklady/semanticka-struktura#osnova-nadpisu

## --question--

Taky z minulé sekce: formulář je v podsložce `/kontakt/` a odkazuje na `/styles.css`. Kde prohlížeč soubor hledá?

### --correct--

V kořeni domény, tedy `https://web.cz/styles.css` — ne v podsložce `/kontakt/`.

#### --why--

Lomítko na začátku znamená „od kořene webu". Když web běží v podsložce (typicky na
GitHub Pages), trefí se taková cesta vedle. Relativní `styles.css` se počítá od stránky
a sedne lokálně i na serveru.

### --answer--

V podsložce `/kontakt/`, protože se cesty počítají od stránky.

#### --why--

Od stránky se počítají cesty **bez** lomítka na začátku. S lomítkem se počítá od kořene.

### --answer--

Podle toho, jestli je stránka na HTTPS.

#### --why--

Schéma na vyhodnocení cesty nemá vliv.

### --see--

html-zaklady/jak-funguje-web#relativni-a-absolutni-adresa

## --question--

Pole má `type="number"` a `step="5"` bez `min`. Napiš nejmenší kladnou hodnotu, kterou prohlížeč přijme.

### --expected--

5

### --accept--
5 (nula je taky násobek)
0

### --why--

Bez `min` se násobky počítají od nuly, takže povolené hodnoty jsou 0, 5, 10, 15… Kdyby
bylo `min="2"`, počítalo by se od dvojky: 2, 7, 12. `step` tedy neomezuje počet
desetinných míst, ale posun od počátku.

### --see--

html-formulare/validace-v-prohlizeci#validace-podle-typu-type
