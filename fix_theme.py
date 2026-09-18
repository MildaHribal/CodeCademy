import os
import re

dir_path = "content/css-tailwind/workshop-motiv-znacky/steps"

def rep(fname, f, r):
    fp = os.path.join(dir_path, fname)
    with open(fp, "r") as fl: c = fl.read()
    c = c.replace(f, r)
    with open(fp, "w") as fl: fl.write(c)

# Fix T1 and W3 warnings
rep("001.md", "--color-primary: #8b5cf6;", "vlastnost `--color-primary` s hodnotou barvy")
rep("001.md", "V CSS zapiš `--color-primary: #8b5cf6;`. V HTML přepiš `bg-blue-500` na `bg-primary`.", "V CSS založ proměnnou a použij správný hex kód. V HTML pak změň třídu pozadí.")

rep("003.md", "--color-secondary: #fb923c;", "vlastnost `--color-secondary` se správným kódem")
rep("003.md", "V CSS zapiš `--color-secondary: #fb923c;`. A nezapomeň aplikovat `bg-secondary` v HTML.", "Nadefinuj v CSS další proměnnou a v HTML ji aplikuj pomocí třídy na pozadí.")

rep("004.md", "--spacing-huge: 5rem;", "vlastnost `--spacing-huge` a hodnotu `5rem`")
rep("004.md", "Napiš `--spacing-huge: 5rem;` a použij to přes `gap-huge`.", "Definuj mezeru do CSS bloku a pak v HTML využij třídu pro `gap` s novým jménem.")

# 006 Make it your own test
rep("006.md", "assert.ok(true, 'Dokončeno.');", "assert.ok(document.querySelector('.moje-trida'), 'Byla pridana vlastni trida.');")
# Add .moje-trida to solution
rep("006.md", '# --solution--\n## --file-- index.html\n```html\n<main class="flex flex-col gap-huge p-12 max-w-lg mx-auto">\n  <h1 class="text-3xl font-bold font-brand">Přizpůsobený motiv</h1>', '# --solution--\n## --file-- index.html\n```html\n<main class="flex flex-col gap-huge p-12 max-w-lg mx-auto moje-trida">\n  <h1 class="text-3xl font-bold font-brand">Přizpůsobený motiv</h1>')

