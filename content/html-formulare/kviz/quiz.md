---
title: "Kvíz: Formuláře"
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

