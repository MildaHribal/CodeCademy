import os

fp = "content/css-tailwind/workshop-karta-v-utilitach/steps/004.md"
with open(fp, "r", encoding="utf-8") as f: c = f.read()

c = c.replace("assert.ok(parseInt(badgeStyles.borderRadius) >= 16, 'Štítek má zakulacené hrany (rounded-full).');", "")

# align seed with 003 solution
with open("content/css-tailwind/workshop-karta-v-utilitach/steps/003.md", "r") as f: c3 = f.read()
sol3 = c3.split("# --solution--")[1].split("```html")[1].split("```")[0].strip()

# wait, the --edit-- markers should be around the article in 004 seed.
# Actually I'll just write it.

