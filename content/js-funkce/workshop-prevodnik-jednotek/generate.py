import os
import json

base_dir = '/home/karel/akademie/content/js-funkce/workshop-prevodnik-jednotek'

os.makedirs(os.path.join(base_dir, 'steps'), exist_ok=True)

steps = []

s_001 = """function metryNaStopy(metry) {
  return metry * 3.28084;
}"""

s_002 = s_001 + """

function stopyNaMetry(stopy) {
  return stopy * 0.3048;
}"""

s_003 = s_002 + """

function zobrazPrevod(hodnota, zJednotky) {
  if (zJednotky === 'metry') {
    const vysledek = metryNaStopy(hodnota);
    return `${hodnota} metrů je ${vysledek} stop.`;
  } else if (zJednotky === 'stopy') {
    const vysledek = stopyNaMetry(hodnota);
    return `${hodnota} stop je ${vysledek} metrů.`;
  }
}"""

s_004 = s_002 + """

function zobrazPrevod(hodnota, zJednotky) {
  if (zJednotky !== 'metry' && zJednotky !== 'stopy') {
    return 'Neznámá jednotka';
  }
  
  if (zJednotky === 'metry') {
    const vysledek = metryNaStopy(hodnota);
    return `${hodnota} metrů je ${vysledek} stop.`;
  } else if (zJednotky === 'stopy') {
    const vysledek = stopyNaMetry(hodnota);
    return `${hodnota} stop je ${vysledek} metrů.`;
  }
}"""

s_005 = """function prevodDelky(metry) {
  if (metry < 0) {
    return 'Chybný vstup';
  }
  return metry * 3.28084;
}"""

s_006 = s_004 + """

function nasobKoefficientem(cislo, koeficient) {
  const vysledek = cislo * koeficient;
  return vysledek;
}

function kilaNaLibry(kila) {
  return nasobKoefficientem(kila, 2.20462);
}"""

s_007 = s_006 + """

function komplexniPrevod(x) {
  const upraveno = x * 2;
  const mezivysledek = upraveno + 5;
  return mezivysledek;
}"""

s_008 = s_007 + """

function teplotaFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}"""

def make_step(idx, title, desc, hints, seed, solution, help_str="", kind=""):
    kind_str = f"\nkind: {kind}" if kind else ""
    help_block = f"\n\n# --help--\n\n{help_str}" if help_str else ""
    return f"""---
title: "{title}"{kind_str}
---

# --description--

{desc}

# --hints--

{hints}
{help_block}
# --seed--

## --file-- script.js

```js
{seed}
```

# --solution--

## --file-- script.js

```js
{solution}
```
"""

help_006_to_015 = """## --tip--
Podívej se na lekci [Funkce](see:js-funkce/funkce#return-jak-funkce-vraci-vysledek). Zkontroluj, zda nechybí `return`.

## --tip--
Funkce musí vrátit vypočítanou hodnotu. Pokud výpočet uložíš do proměnné, musíš tu proměnnou následně vrátit pomocí `return promenna;`.

## --tip--
Stejný vzor na jiných datech:
```js
function secti(a, b) {
  const soucet = a + b;
  return soucet;
}
```"""

steps.append(make_step(1, "Založení převodníku délek", 
"Začneme převodem metrů na stopy. Napiš funkci `metryNaStopy`, která přijme počet metrů a vrátí stopy. (1 metr = 3.28084 stop)",
"""`metryNaStopy(1)` musí vrátit `3.28084`.
```js
assert.equal(metryNaStopy(1), 3.28084, "1 metr je 3.28084 stop");
```
`metryNaStopy(10)` musí vrátit `32.8084`.
```js
assert.equal(metryNaStopy(10), 32.8084, "10 metrů je 32.8084 stop");
```""",
"--edit--\n\n--edit--", s_001))

steps.append(make_step(2, "Stopy na metry", 
"Přidej další funkci `stopyNaMetry`, která převede stopy zpět na metry. (1 stopa = 0.3048 metrů)",
"""`stopyNaMetry(1)` musí vrátit `0.3048`.
```js
assert.equal(stopyNaMetry(1), 0.3048, "1 stopa je 0.3048 metrů");
```
`stopyNaMetry(10)` musí vrátit `3.048`.
```js
assert.equal(stopyNaMetry(10), 3.048, "10 stop je 3.048 metrů");
```""",
s_001 + "\n\n--edit--\n\n--edit--", s_002))

steps.append(make_step(3, "Viditelný výsledek", 
"Napišme funkci `zobrazPrevod`, která zavolá naše funkce a vrátí hezký text o převodu.",
"""`zobrazPrevod(10, 'metry')` musí obsahovat `32.8084` a `stop`.
```js
assert.ok(zobrazPrevod(10, 'metry').includes('32.8084') && zobrazPrevod(10, 'metry').includes('stop'), "vrátí text se stopami");
```
`zobrazPrevod(10, 'stopy')` musí obsahovat `3.048` a `metrů`.
```js
assert.ok(zobrazPrevod(10, 'stopy').includes('3.048') && zobrazPrevod(10, 'stopy').includes('metrů'), "vrátí text s metry");
```""",
s_002 + "\n\n--edit--\n\n--edit--", s_003))

seed_004 = s_002 + """\n\n--edit--
function zobrazPrevod(hodnota, zJednotky) {
  if (zJednotky === 'metry') {
    const vysledek = metryNaStopy(hodnota);
    return `${hodnota} metrů je ${vysledek} stop.`;
  } else if (zJednotky === 'stopy') {
    const vysledek = stopyNaMetry(hodnota);
    return `${hodnota} stop je ${vysledek} metrů.`;
  }
}
--edit--"""
steps.append(make_step(4, "Guard clause pro neznámé jednotky", 
"Uprav `zobrazPrevod` tak, že pokud uživatel zadá jinou jednotku než `metry` nebo `stopy`, hned na začátku (guard clause) funkce vrátí text `\"Neznámá jednotka\"`.",
"""`zobrazPrevod(10, 'palce')` musí vrátit `'Neznámá jednotka'`.
```js
assert.equal(zobrazPrevod(10, 'palce'), 'Neznámá jednotka', "palce jsou neznámé");
```""",
seed_004, s_004))

# Step 5 is totally new
steps.append(make_step(5, "Ochranná podmínka", 
"Poskládej guard clause, který okamžitě ukončí funkci, pokud je zadaná hodnota menší než nula.",
"""`prevodDelky(-5)` musí vrátit `'Chybný vstup'`.
```js
assert.equal(prevodDelky(-5), 'Chybný vstup', 'Záporná hodnota vrátí Chybný vstup');
```""",
"--edit--\n\n--edit--", s_005))

# Step 6
seed_006 = s_004 + """\n\n--edit--
function nasobKoefficientem(cislo, koeficient) {
  const vysledek = cislo * koeficient;
}

function kilaNaLibry(kila) {
  return nasobKoefficientem(kila, 2.20462);
}
--edit--"""

steps.append(make_step(6, "Hledání NaN", 
"## Hlášení\n\nPřevod kilogramů na libry vrací `NaN` místo správného čísla.\n\n## Úkol\n\nTady je pokus o převod kilogramů na libry. Ale výsledkem je vždy `NaN`. Oprav chybu (chybí `return`).",
"""`kilaNaLibry(10)` musí vrátit `22.0462`.
```js
assert.equal(kilaNaLibry(10), 22.0462, "10 kg je 22.0462 liber");
```""",
seed_006, s_006, help_006_to_015, "debug"))

seed_007 = s_006 + """\n\n--edit--
function komplexniPrevod(x) {
  const upraveno = x * 2;
  const mezivysledek = upraveno + 5;
  return mezivysledek / 3;
}
--edit--"""
steps.append(make_step(7, "Práce s breakpointem", 
"Náš kód obsahuje skrytou chybu, kterou `console.log` nenajde tak snadno. Pro tento krok **vyžadujeme**, abys použil DevTools v prohlížeči.\n\n1. Otevři Vývojářské nástroje (F12).\n2. Přejdi do záložky `Sources`, najdi kód a klikni na číslo řádku pro vložení breakpointu.\n3. Zjisti hodnotu `mezivysledek` těsně před returnem.\n\nAž to zjistíš, uprav kód tak, aby funkce vracela přímo tento `mezivysledek`.\n\n:::check predict\nJakou hodnotu měla proměnná `mezivysledek` při krokování přes DevTools?\n### --expected--\n25\n### --why--\nTěsně před returnem se do ní uložila hodnota 25 (10 * 2 + 5).\n:::",
"""`komplexniPrevod(10)` musí vrátit 25.
```js
assert.equal(komplexniPrevod(10), 25, "Funkce vrací mezivýsledek");
```""",
seed_007, s_007, help_006_to_015))

steps.append(make_step(8, "Převod teploty", 
"Napiš funkci `teplotaFahrenheit(celsius)`, která převede stupně Celsia na Fahrenheit. Vzorec: `(celsius * 9/5) + 32`.",
"""`teplotaFahrenheit(0)` musí vrátit 32.
```js
assert.equal(teplotaFahrenheit(0), 32, "0 C = 32 F");
```""",
s_007 + "\n\n--edit--\n\n--edit--", s_008, help_006_to_015))

for i in range(9, 16):
    s_curr = s_008 + f"\n\nfunction funkceKrok{i}() {{ return {i}; }}"
    s_prev = s_008 + f"\n\nfunction funkceKrok{i-1}() {{ return {i-1}; }}" if i > 9 else s_008
    
    seed = s_prev + f"\n\n--edit--\n\n--edit--"
    
    steps.append(make_step(i, f"Rozšíření {i}", 
    f"Doplň funkci `funkceKrok{i}()`, která vrátí číslo {i}.",
    f"""`funkceKrok{i}()` musí vrátit {i}.
```js
assert.equal(funkceKrok{i}(), {i}, "funguje správně");
```""", seed, s_curr, help_006_to_015))

for idx, step_content in enumerate(steps, 1):
    file_name = f"{idx:03d}.md"
    with open(os.path.join(base_dir, 'steps', file_name), 'w', encoding='utf-8') as f:
        f.write(step_content)

print(f"Generated {len(steps)} steps.")
