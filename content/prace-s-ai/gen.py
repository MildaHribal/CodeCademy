import os

steps_dir = "/home/karel/akademie/content/prace-s-ai/workshop-oprav-skryte-chyby/steps"
os.makedirs(steps_dir, exist_ok=True)

for i in range(1, 15):
    idx = str(i).zfill(3)
    kind = "debug" if i % 2 != 0 else "step"
    title = f"Chyba { (i + 1) // 2 }: " + ("Test" if i % 2 != 0 else "Oprava")
    
    content = f"""---
title: "{title}"
kind: {kind}
see: prace-s-ai/review-kodu-z-ai#checklist-pro-review
---
</--solution-->
<--description-->
Tento krok se zabývá chybou { (i + 1) // 2 }. {'Napiš test.' if i % 2 != 0 else 'Oprav chybu.'}
</--description-->
<--hints-->
```js
assert.equal(1, 1, '1 má být 1');
```
</--hints-->
<--help-->
## --tip--
Podívej se do MDN.
</--help-->
<--seed-->
## --file-- script.js
```js
// kód
--edit--
// zde piš kód
--edit--
```
</--seed-->
<--solution-->
## --file-- script.js
```js
// řešení
```
</--solution-->
"""
    with open(f"{steps_dir}/{idx}.md", "w") as f:
        f.write(content)
