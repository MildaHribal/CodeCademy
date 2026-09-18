import os

steps = [
    {
        "title": "Firemní barva",
        "desc": "Dostali jsme z Figmy design manuál. Hlavní firemní barva je sytě fialová `#8b5cf6`. Zatím to není v Tailwindu pojmenované.\n\n**Úkol:** V souboru `style.css` najdi direktivu `@theme` a přidej dovnitř vlastnost `--color-primary` s odpovídajícím hex kódem. Pak v `index.html` změň tlačítku `bg-blue-500` na `bg-primary`.",
        "hints": "const btn = document.querySelector('button'); assert.ok(btn.classList.contains('bg-primary'), 'Tlačítko má bg-primary.'); assert.equal(getComputedStyle(btn).backgroundColor, 'rgb(139, 92, 246)', 'Barva odpovídá hex #8b5cf6.');",
        "tip": "V CSS vytvoř novou vlastnost s barvou. V HTML přepiš `bg-blue-500` na `bg-primary`.",
        "seed_css": "@theme {\n  \n}",
        "sol_css": "@theme {\n  --color-primary: #8b5cf6;\n}",
        "seed_html": "button class=\"bg-blue-500",
        "sol_html": "button class=\"bg-primary"
    },
    {
        "title": "Firemní font",
        "desc": "Firemní značka používá patkové písmo *Georgia* pro všechny nadpisy. Můžeme mu říkat `brand`.\n\n**Úkol:** Přidej do `@theme` definici `--font-brand: Georgia, serif;`. Pak nadpisu `<h1>` přidej utilitu `font-brand`.",
        "hints": "const h1 = document.querySelector('h1'); assert.ok(h1.classList.contains('font-brand'), 'Nadpis používá nový font.'); assert.ok(getComputedStyle(h1).fontFamily.includes('Georgia'), 'Font je skutečně Georgia.');",
        "tip": "V CSS použij `--font-brand`. V HTML dej `<h1>` třídu `font-brand`.",
        "seed_css": "@theme {\n  --color-primary: #8b5cf6;\n}",
        "sol_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n}",
        "seed_html": "h1 class=\"text-3xl font-bold\"",
        "sol_html": "h1 class=\"text-3xl font-bold font-brand\""
    },
    {
        "title": "Doplňková barva",
        "desc": "Ke kartám služeb chceme dát jemné oranžové pozadí. V manuálu je to secondary barva `#fb923c`.\n\n**Úkol:** Přidej do `@theme` barvu s názvem `--color-secondary` a daným hex kódem. Poté aplikuj na článek `<article>` třídu `bg-secondary`.",
        "hints": "const a = document.querySelector('article'); assert.ok(a.classList.contains('bg-secondary'), 'Článek má bg-secondary.'); assert.equal(getComputedStyle(a).backgroundColor, 'rgb(251, 146, 60)', 'Barva pozadí článku je správná.');",
        "tip": "V CSS zapiš proměnnou pro sekudnární barvu. A nezapomeň aplikovat `bg-secondary` v HTML.",
        "seed_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n}",
        "sol_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n  --color-secondary: #fb923c;\n}",
        "seed_html": "article class=\"p-6 rounded-lg shadow\"",
        "sol_html": "article class=\"bg-secondary p-6 rounded-lg shadow\""
    },
    {
        "title": "Vlastní velikost odsazení",
        "desc": "Máme v designu obrovskou mezeru, která se často opakuje a je přesně `5rem`. Abychom nepoužívali ošklivé hodnoty jako `gap-[5rem]`, můžeme si vytvořit vlastní rozestup na škále.\n\n**Úkol:** Do `@theme` přidej novou vzdálenost `--spacing-huge` a jako hodnotu jí dej `5rem`. Poté kontejneru `<main>` změň `gap-8` na `gap-huge`.",
        "hints": "const m = document.querySelector('main'); assert.ok(m.classList.contains('gap-huge'), 'Používá mezeru gap-huge.'); assert.equal(getComputedStyle(m).gap, '80px', 'Velikost odpovídá 5rem (80px).');",
        "tip": "Rozestupy ovládá `--spacing-*`. Vytvoř správnou vlastnost s příslušnou hodnotou a použij to přes `gap-huge`.",
        "seed_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n  --color-secondary: #fb923c;\n}",
        "sol_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n  --color-secondary: #fb923c;\n  --spacing-huge: 5rem;\n}",
        "seed_html": "main class=\"flex flex-col gap-8 p-12 max-w-lg mx-auto\"",
        "sol_html": "main class=\"flex flex-col gap-huge p-12 max-w-lg mx-auto\""
    },
    {
        "title": "Chybná barva (Ladění)",
        "kind": "debug",
        "desc": "## Hlášení\n\nKolega zkoušel přidat speciální `danger` barvu pro varování, ale Tailwind ji vůbec nenabízí a barva pozadí selhává.\n\n## Úkol\n\nNajdi a oprav chybu v definici proměnné v CSS. Pozor, nezapomeň, že u barev musíš Tailwindu říct, že jde opravdu o barvu, pomocí specifického jména proměnné.",
        "hints": "const err = document.querySelector('.error-box'); assert.ok(getComputedStyle(err).backgroundColor === 'rgb(225, 29, 72)', 'Varování je zbarveno růžově.');",
        "tip": "", # No tip for debug
        "seed_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n  --color-secondary: #fb923c;\n  --spacing-huge: 5rem;\n  --danger: #e11d48;\n}",
        "sol_css": "@theme {\n  --color-primary: #8b5cf6;\n  --font-brand: Georgia, serif;\n  --color-secondary: #fb923c;\n  --spacing-huge: 5rem;\n  --color-danger: #e11d48;\n}",
        "seed_html": "button class=\"bg-primary text-white px-4 py-2 rounded-md\">\n    Odeslat\n  </button>\n\n  <div class=\"bg-danger text-white p-4 rounded-md error-box\">\n    Pozor, akce nejde vzít zpět.\n  </div>\n</main>",
        "sol_html": "button class=\"bg-primary text-white px-4 py-2 rounded-md\">\n    Odeslat\n  </button>\n\n  <div class=\"bg-danger text-white p-4 rounded-md error-box\">\n    Pozor, akce nejde vzít zpět.\n  </div>\n</main>"
    },
    {
        "title": "Rozšíření po svém",
        "desc": "Tady tvoje tvorba design tokenů končí! Nyní máš v CSS jeden `theme` blok se sadou vlastních barev, písem a mezer.\n\nVyzkoušej si:\n- Změň barvy na své oblíbené.\n- Přidej nový font `--font-mono: monospace` a použij ho.",
        "hints": "assert.ok(document.querySelector('.moje-trida'), 'Byla pridana vlastni trida.');",
        "tip": "Neboj se experimentovat v `style.css`.",
        "seed_css": "inherit",
        "sol_css": "inherit",
        "seed_html": "inherit",
        "sol_html": "inherit"
    }
]

os.makedirs("content/css-tailwind/workshop-motiv-znacky/steps", exist_ok=True)

html = """<main class="flex flex-col gap-8 p-12 max-w-lg mx-auto">
  <h1 class="text-3xl font-bold">Přizpůsobený motiv</h1>
  
  <article class="p-6 rounded-lg shadow">
    <h2 class="text-xl font-semibold mb-2">Naše nabídka</h2>
    <p class="text-slate-800">Chtěli bychom, aby tato část byla krásně oranžová.</p>
  </article>

  <button class="bg-blue-500 text-white px-4 py-2 rounded-md">
    Odeslat
  </button>
</main>"""

css = """@theme {
  
}"""

for i, s in enumerate(steps):
    step_num = i + 1
    filename = f"content/css-tailwind/workshop-motiv-znacky/steps/{step_num:03d}.md"
    
    if s.get("kind") == "debug":
        seed_html = s["seed_html"] if s["seed_html"] != "inherit" else html
        sol_html = s["sol_html"] if s["sol_html"] != "inherit" else html.replace('<main class="flex flex-col gap-huge p-12 max-w-lg mx-auto">', '<main class="flex flex-col gap-huge p-12 max-w-lg mx-auto moje-trida">')
        seed_css = s["seed_css"]
        sol_css = s["sol_css"]
        # Update state with solution for next step
        html = sol_html
        css = sol_css
    else:
        if s["seed_html"] != "inherit":
            seed_html = html
            html = html.replace(s["seed_html"], s["sol_html"])
            sol_html = html
            seed_css = css
            css = s["sol_css"]
            sol_css = css
        else:
            seed_html = html
            sol_html = html
            seed_css = css
            sol_css = css

    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"---\nlibs: tailwind\ntitle: \"{s['title']}\"\n")
        if "kind" in s:
            f.write(f"kind: {s['kind']}\n")
        f.write("---\n\n")
        f.write("# --description--\n" + s["desc"] + "\n\n")
        f.write("# --hints--\nSplněno.\n```js\n" + s["hints"] + "\n```\n\n")
        
        f.write("# --help--\n")
        if s.get("tip"):
            f.write("## --tip--\n" + s["tip"] + "\n\n")
            
        f.write("# --seed--\n## --file-- index.html\n```html\n" + seed_html + "\n```\n")
        f.write("\n## --file-- style.css\n```css\n" + seed_css + "\n```\n\n")
        f.write("# --solution--\n## --file-- index.html\n```html\n" + sol_html + "\n```\n")
        f.write("\n## --file-- style.css\n```css\n" + sol_css + "\n```\n")

print("Generated workshop-motiv-znacky")
