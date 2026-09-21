## Zadání, které vede k použitelnému výsledku

Čtyři části. Když některá chybí, doplní si ji model sám — a to je přesně ta odpověď,
která se ti nebude líbit.

| Část | Otázka, na kterou odpovídá | Příklad |
| --- | --- | --- |
| **Záměr** | Co má uživatel po změně umět? | „Zákazník si má filtrovat produkty podle kategorie." |
| **Kontext** | Kde to je a co už existuje? | „`ProductList.jsx`, data z `useProducts()`, kategorie jsou v `product.category`." |
| **Omezení** | Čeho se nesmí dotknout? | „Nepřidávej závislosti. Styluj Tailwindem jako zbytek. Neměň `useProducts`." |
| **Kritéria přijetí** | Podle čeho poznáme hotovo? | „`filtruj(produkty, 'hrnky')` vrátí jen hrnky; `filtruj(produkty, '')` vrátí všechny." |

```text
Záměr:     jednou větou, co má umět uživatel
Kontext:   soubory, funkce a data, kterých se to týká
Omezení:   co nepřidávat, nepřejmenovat, nepřepisovat
Kritéria:  2–5 konkrétních volání s konkrétní očekávanou hodnotou
```

## Z mlhavého kritéria udělej spustitelné

| Místo toho | Napiš |
| --- | --- |
| „ať to funguje" | `assert.equal(cenaSDph(249), 301.29, '249 Kč s 21% DPH')` |
| „ať to nespadne" | „`spocitej([])` vrátí `0`, ne `NaN` a ne výjimku" |
| „ať to je rychlé" | „vykreslení do 100 ms na 1 000 položkách" |
| „ať to je hezké" | „mezery ze škály `--space-*`, hover a `:focus-visible` jako u `Button`" |
| „doprava zdarma od 1 500" | „`cenaDopravy(1500) === 0` a `cenaDopravy(1499) === 89`" |

## Pět tichých chyb, které hledáš jako první

| Chyba | Jak vypadá | Čím ji odhalíš |
| --- | --- | --- |
| **Vymyšlené API** | `pole.clear()`, `Object.mapValues()` | Spustit to; hledat jméno v MDN, ne v chatu. |
| **Zastaralý zápis** | třídní komponenty, `componentWillMount`, `var` | Porovnat s tím, jak to má zbytek projektu. |
| **Chybějící okrajový případ** | funguje na tvých datech, `NaN` na prázdných | Pustit na `[]`, `null`, jednom prvku a špatném typu. |
| **Neošetřená chyba** | `await fetch(url)` bez kontroly `response.ok` | Vypnout síť v DevTools a kliknout. |
| **Bezpečnostní díra** | cizí text do `innerHTML`, vstup do SQL řetězce | Zeptat se u každého řetězce: odkud přišel? |

## Tři otázky, které v review najdou nejvíc

1. **Co se stane na prázdném vstupu?** (`[]`, `''`, `0`, `null`)
2. **Co se stane, když to selže?** (síť, chybějící soubor, neznámý klíč)
3. **Odkud pochází text, který se vypisuje?** (od uživatele → escapovat)

```js
// Vygenerovaný řádek                  // Co se s ním udělá v review
el.innerHTML = 'Ahoj ' + jmeno;        // cizí text → textContent
polozky.reduce((s, p) => s + p.cena);  // chybí počáteční hodnota → , 0
if (mezisoucet > 1500) return 0;       // hranice → >= a test na 1500
polozky.sort((a, b) => b.cena - a.cena); // mutace cizího pole → toSorted
db.query(`… WHERE id = '${id}'`);      // vstup do SQL → parametrizovat
```

## Ověření testu, který napsal model

```text
1. Rozbij implementaci schválně (otoč porovnání, vrať konstantu).
2. Spusť testy.
3. Zelené? Test nehlídá nic — patří přepsat, ne uklidnit.
```

Podezřelé je, když všechny testy projdou hned napoprvé bez jediné opravy kódu.

## Tutor místo generátoru

Do vlastních instrukcí (systémový prompt), ne do jedné zprávy — jinak se pravidlo
za pár zpráv ztratí:

```text
Jsi můj učitel programování, ne generátor kódu.
Kód mi nabídni, až o něj výslovně požádám.
Nejdřív se mě zeptej, kde si myslím, že je problém.
Koncept vysvětli na jiném příkladu než na mém.
Skonči návodnou otázkou, ne řešením.
```

Vyzkoušení po výkladu:

```text
Polož mi tři otázky na to, co jsme probrali, jednu po druhé.
Po každé mé odpovědi mi řekni, co v ní chybělo.
```

## Kdy nástroj zapnout a kdy vypnout

| Situace | Nástroj |
| --- | --- |
| Cvičná úloha, nová látka, příprava na pohovor | **vypnout** — trénuješ vybavení z hlavy |
| Boilerplate, testovací data, migrace známého vzoru na další soubor | zapnout |
| Průzkum neznámého repozitáře, první verze rozhraní | zapnout, výsledek číst |
| Změna na pár řádků tam, kde přesně víš co a kde | napsat sám — popis kontextu trvá déle |
| Úloha, u které neumíš posoudit, jestli je výsledek správně | **nezadávat** — nemáš jak poznat omyl |

## Co agentovi nedáš

- `.env`, produkční klíče, přístupy do databáze — **odeslané tajemství se musí otočit**,
  smazání commitu nestačí.
- Zákaznická data. Když potřebuješ reálný tvar, pošli anonymizovaný vzorek.
- Práva zapsat do repozitáře bez tvého přečtení diffu. Instrukce schovaná v issue nebo
  v README staženého balíčku se jinak provede jako příkaz.

## Práce s agentem v krocích

```text
1. Zadání se čtyřmi částmi (viz nahoru).
2. Nech ho udělat JEDEN krok, po kterém projdou testy.
3. git diff — přečti celý, i soubory, o kterých se nezmínil.
4. Commit.
5. Další krok.
```

Diff přes dvacet souborů se nereviduje, ale zahazuje a zadává znovu po částech. Deset
malých commitů navíc znamená, že ti `git bisect` řekne, který krok to rozbil.
