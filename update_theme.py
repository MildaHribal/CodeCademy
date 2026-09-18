import os

fp = "generate_theme.py"
with open(fp, "r") as f: c = f.read()

c = c.replace('"desc": "Dostali jsme z Figmy design manuál. Hlavní firemní barva je sytě fialová `#8b5cf6`. Zatím to není v Tailwindu pojmenované.\\n\\n**Úkol:** V souboru `style.css` najdi direktivu `@theme` a přidej dovnitř definici `--color-primary: #8b5cf6;`. Pak v `index.html` změň tlačítku `bg-blue-500` na `bg-primary`."',
'"desc": "Dostali jsme z Figmy design manuál. Hlavní firemní barva je sytě fialová `#8b5cf6`. Zatím to není v Tailwindu pojmenované.\\n\\n**Úkol:** V souboru `style.css` najdi direktivu `@theme` a přidej dovnitř vlastnost `--color-primary` s odpovídajícím hex kódem. Pak v `index.html` změň tlačítku `bg-blue-500` na `bg-primary`."')

c = c.replace('"tip": "V CSS zapiš `--color-primary: #8b5cf6;`. V HTML přepiš `bg-blue-500` na `bg-primary`."',
'"tip": "V CSS vytvoř novou vlastnost s barvou. V HTML přepiš `bg-blue-500` na `bg-primary`."')

c = c.replace('"desc": "Ke kartám služeb chceme dát jemné oranžové pozadí. V manuálu je to secondary barva `#fb923c`.\\n\\n**Úkol:** Přidej do `@theme` barvu `--color-secondary: #fb923c;`. Poté aplikuj na článek `<article>` třídu `bg-secondary`."',
'"desc": "Ke kartám služeb chceme dát jemné oranžové pozadí. V manuálu je to secondary barva `#fb923c`.\\n\\n**Úkol:** Přidej do `@theme` barvu s názvem `--color-secondary` a daným hex kódem. Poté aplikuj na článek `<article>` třídu `bg-secondary`."')

c = c.replace('"tip": "V CSS zapiš `--color-secondary: #fb923c;`. A nezapomeň aplikovat `bg-secondary` v HTML."',
'"tip": "V CSS zapiš proměnnou pro sekudnární barvu. A nezapomeň aplikovat `bg-secondary` v HTML."')

c = c.replace('"desc": "Máme v designu obrovskou mezeru, která se často opakuje a je přesně `5rem`. Abychom nepoužívali ošklivé hodnoty jako `gap-[5rem]`, můžeme si vytvořit vlastní rozestup na škále.\\n\\n**Úkol:** Do `@theme` přidej `--spacing-huge: 5rem;`. Poté kontejneru `<main>` změň `gap-8` na `gap-huge`."',
'"desc": "Máme v designu obrovskou mezeru, která se často opakuje a je přesně `5rem`. Abychom nepoužívali ošklivé hodnoty jako `gap-[5rem]`, můžeme si vytvořit vlastní rozestup na škále.\\n\\n**Úkol:** Do `@theme` přidej novou vzdálenost `--spacing-huge` a jako hodnotu jí dej `5rem`. Poté kontejneru `<main>` změň `gap-8` na `gap-huge`."')

c = c.replace('"tip": "Rozestupy ovládá `--spacing-*`. Napiš `--spacing-huge: 5rem;` a použij to přes `gap-huge`."',
'"tip": "Rozestupy ovládá `--spacing-*`. Vytvoř správnou vlastnost s příslušnou hodnotou a použij to přes `gap-huge`."')

c = c.replace('assert.ok(true, \'Dokončeno.\');', 'assert.ok(document.querySelector(\'.moje-trida\'), \'Byla pridana vlastni trida.\');')

c = c.replace('sol_html = s["sol_html"] if s["sol_html"] != "inherit" else html',
'sol_html = s["sol_html"] if s["sol_html"] != "inherit" else html.replace(\'<main class="flex flex-col gap-huge p-12 max-w-lg mx-auto">\', \'<main class="flex flex-col gap-huge p-12 max-w-lg mx-auto moje-trida">\')')

with open(fp, "w") as f: f.write(c)
