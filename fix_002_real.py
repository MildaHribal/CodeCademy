fp = "content/css-tailwind/workshop-landing-sekce/steps/002.md"
with open(fp, "r", encoding="utf-8") as f: c = f.read()

parts = c.split("# --solution--")
head = parts[0]
sol = parts[1]

# Make sure seed has <section class="hero">
head = head.replace('<section class="min-h-screen flex flex-col justify-center items-center p-6">', '<section class="hero">')
# Make sure solution has <section class="min-h-screen...">
sol = sol.replace('<section class="hero">', '<section class="min-h-screen flex flex-col justify-center items-center p-6">')

with open(fp, "w", encoding="utf-8") as f:
    f.write(head + "# --solution--" + sol)
