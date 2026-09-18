import os

steps = [
    {
        "title": "Hero sekce uprostřed",
        "desc": "Hlavní sekce (hero) by měla zabrat celou výšku okna a vycentrovat obsah.\n\n**Úkol:** `<section class=\"hero\">` nahraď za Tailwind třídy tak, aby sekce měla minimální výšku obrazovky (`min-h-screen`), flexbox (`flex`), rozložení do sloupce (`flex-col`), obsah zarovnaný doprostřed svisle (`justify-center`) i vodorovně (`items-center`) a padding `p-6`.",
        "hints": "const sec = document.querySelector('section'); assert.ok(sec.classList.contains('min-h-screen') && sec.classList.contains('flex') && sec.classList.contains('flex-col'), 'Je to flex sloupec na celou obrazovku.'); assert.ok(sec.classList.contains('justify-center') && sec.classList.contains('items-center'), 'Zarovnáno na střed.');",
        "tip": "Použij třídy: `min-h-screen flex flex-col justify-center items-center p-6`.",
        "sol_add": "class=\"min-h-screen flex flex-col justify-center items-center p-6\"",
        "seed_tag": "section class=\"hero\"",
        "sol_tag": "section class=\"min-h-screen flex flex-col justify-center items-center p-6\""
    },
    {
        "title": "Barevný text nadpisu",
        "desc": "Velkým trendem je text vyplněný barevným přechodem. V Tailwindu na to existuje trik: nastavíš přechodové pozadí textu a samotný text zprůhledníš.\n\n**Úkol:** Vyměň `<h1 class=\"title\">` za `text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600`.",
        "hints": "const h1 = document.querySelector('h1'); assert.ok(h1.classList.contains('text-transparent'), 'Text je průhledný.'); assert.ok(h1.classList.contains('bg-clip-text'), 'Pozadí je oříznuté na text.');",
        "tip": "Napiš `text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600`.",
        "seed_tag": "h1 class=\"title\"",
        "sol_tag": "h1 class=\"text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center\""
    },
    {
        "title": "Tlačítko s hover efektem",
        "desc": "Přidáme hlavní tlačítko (Call to Action), které po najetí myší ztmavne a malinko se zvětší.\n\n**Úkol:** U tlačítka vyměň třídu `btn` za modré pozadí `bg-blue-600`, bílý text, padding `px-8 py-3`, zakulacení `rounded-full`, a přidej stavy pro najetí: `hover:bg-blue-700` a `hover:scale-105`. Nezapomeň na plynulost přes `transition`.",
        "hints": "const btn = document.querySelector('button'); assert.ok(btn.classList.contains('hover:bg-blue-700'), 'Má tmavší hover pozadí.'); assert.ok(btn.classList.contains('transition'), 'Má transition.');",
        "tip": "Použij: `bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 hover:scale-105 transition`.",
        "seed_tag": "button class=\"btn\"",
        "sol_tag": "button class=\"bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 hover:scale-105 transition mt-8\""
    },
    {
        "title": "Responzivní mřížka",
        "desc": "Pod hero sekcí bude přehled vlastností v mřížce. Na mobilu chceme 1 sloupec, na tabletu (`md:`) 2 a na počítači (`lg:`) 3 sloupce.\n\n**Úkol:** `<div class=\"features\">` změň na `grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mt-16`.",
        "hints": "const g = document.querySelectorAll('div')[0]; assert.ok(g.classList.contains('grid-cols-1') && g.classList.contains('md:grid-cols-2') && g.classList.contains('lg:grid-cols-3'), 'Mřížka je responzivní.');",
        "tip": "Použij breakpointy: `grid-cols-1`, `md:grid-cols-2` a `lg:grid-cols-3`.",
        "seed_tag": "div class=\"features\"",
        "sol_tag": "div class=\"grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mt-16\""
    },
    {
        "title": "Stylování jedné karty",
        "desc": "Každá výhoda dostane svoji kartu. Na světlém pozadí bude bílá, na tmavém tmavě šedá.\n\n**Úkol:** První `<article class=\"card\">` změň na `bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800`.",
        "hints": "const c = document.querySelector('article'); assert.ok(c.classList.contains('dark:bg-slate-900'), 'Má dark mode barvu pozadí.'); assert.ok(c.classList.contains('shadow-lg'), 'Má stín.');",
        "tip": "Nakombinuj světlé barvy a ty s předponou `dark:`.",
        "seed_tag": "article class=\"card\"",
        "sol_tag": "article class=\"bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800\""
    },
    {
        "title": "Kolegův hover (Ladění)",
        "kind": "debug",
        "desc": "## Hlášení\n\nKolega se pokusil přidat ke kartě z předchozího kroku hover efekt, který ji posune nahoru a zvětší stín. Jenže stín nefunguje.\n\n## Úkol\n\nOprav hover efekt. Třída `hover-shadow-xl` není platná. Najdi v kódu nesmyslnou třídu a změň ji na správný zápis (`hover:shadow-xl`).",
        "hints": "const c = document.querySelector('article'); assert.ok(c.classList.contains('hover:shadow-xl'), 'Karta má správný hover stín.');",
        "tip": "", # Debug step shouldn't need a tip
        "seed_tag": "article class=\"bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover-shadow-xl transition\"",
        "sol_tag": "article class=\"bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition\""
    },
    {
        "title": "Temný režim textu",
        "desc": "Tmavá karta má černý text, takže nejde přečíst. Musíme ho přepnout.\n\n**Úkol:** `<h3 class=\"feat-title\">` změň na `text-xl font-bold text-slate-900 dark:text-white` a `<p class=\"feat-text\">` na `text-slate-600 dark:text-slate-400`.",
        "hints": "const h3 = document.querySelector('h3'); assert.ok(h3.classList.contains('dark:text-white'), 'Nadpis je v tmavém režimu bílý.');",
        "tip": "Kombinuj běžný text a `dark:text-`.",
        "seed_tag": "h3 class=\"feat-title\"",
        "sol_tag": "h3 class=\"text-xl font-bold text-slate-900 dark:text-white mb-2\""
    },
    {
        "title": "Rozkopírování mřížky",
        "desc": "Máme krásnou komponentu vlastnosti. Teď stačí přidat další, ať mřížka není prázdná.\n\nTento krok máš jako **Udělej po svém**. Zkus přidat do divu mřížky další dva tagy `<article>` s podobnými třídami jako ten první.\n\n- Změň barvy tlačítek\n- Udělej tlačítko větší nebo menší.",
        "hints": "assert.ok(true);",
        "tip": "Udělej po svém",
        "seed_tag": "p class=\"feat-text\"",
        "sol_tag": "p class=\"text-slate-600 dark:text-slate-400\""
    }
]

base_html = """<main class="bg-slate-50 dark:bg-slate-950">
  <section class="hero">
    <h1 class="title">Tvoje nová aplikace</h1>
    <button class="btn">Začít zdarma</button>
    <div class="features">
      <article class="card">
        <h3 class="feat-title">Rychlost</h3>
        <p class="feat-text">Blesková odezva a načítání.</p>
      </article>
    </div>
  </section>
</main>"""

current_html = base_html

for i, s in enumerate(steps):
    step_num = i + 2
    filename = f"content/css-tailwind/workshop-landing-sekce/steps/{step_num:03d}.md"
    
    if s.get("kind") == "debug":
        # Introduce a bug into the seed explicitly for the debug step
        seed_html = current_html.replace(s["sol_tag"].replace("hover:shadow-xl", ""), s["seed_tag"])
        current_html = seed_html.replace(s["seed_tag"], s["sol_tag"])
    else:
        seed_html = current_html
        current_html = current_html.replace(s["seed_tag"], s["sol_tag"])
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"---\nlibs: tailwind\ntitle: \"{s['title']}\"\n")
        if "kind" in s:
            f.write(f"kind: {s['kind']}\n")
        f.write("---\n\n")
        
        f.write("# --description--\n" + s["desc"] + "\n\n")
        f.write("# --hints--\nSplněno.\n```js\n" + s["hints"] + "\n```\n\n")
        f.write("# --help--\n")
        if s["tip"]:
            f.write("## --tip--\n" + s["tip"] + "\n\n")
            
        f.write("# --seed--\n## --file-- index.html\n```html\n" + seed_html + "\n```\n\n")
        f.write("# --solution--\n## --file-- index.html\n```html\n" + current_html + "\n```\n")

print("Generated workshop-landing-sekce")
