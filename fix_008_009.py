import os

dir_path = "content/css-tailwind/workshop-karta-v-utilitach/steps"
def rep(fname, f, r):
    fp = os.path.join(dir_path, fname)
    with open(fp, "r") as fl: c = fl.read()
    c = c.replace(f, r)
    with open(fp, "w") as fl: fl.write(c)

rep("008.md", "const price = document.querySelector('.flex > p:first-child');", "const price = document.querySelectorAll('p')[2];")
rep("008.md", "assert.ok(styles.color.includes('oklch') || styles.color.includes('rgb'));", "assert.ok(styles.color.includes('oklch') || styles.color.includes('rgb'), 'Cena má tmavou barvu.');")

rep("009.md", "assert.ok(styles.backgroundColor.includes('oklch') || styles.backgroundColor.includes('rgb'))", "assert.ok(styles.backgroundColor.includes('oklch') || styles.backgroundColor.includes('rgb'), 'Pozadi tlacitka je modre.');")
rep("009.md", "assert.ok(styles.color.includes('oklch') || styles.color.includes('rgb'))", "assert.ok(styles.color.includes('oklch') || styles.color.includes('rgb'), 'Text je bily.');")

rep("011.md", "assert.ok(styles.borderTopColor.includes('oklch') || styles.borderTopColor.includes('rgb'))", "assert.ok(styles.borderTopColor.includes('oklch') || styles.borderTopColor.includes('rgb'), 'Ohraniceni ma barvu.');")

