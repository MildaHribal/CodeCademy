fp = "content/css-tailwind/workshop-karta-v-utilitach/steps/010.md"
with open(fp, "r", encoding="utf-8") as f: c = f.read()

parts = c.split("# --seed--")
head = parts[0]
seed_sol = parts[1].split("# --solution--")
sol = seed_sol[1]

# Revert seed to have opacity-50 and NOT bg-rose-600/50
seed = sol.replace('bg-rose-600/50', 'bg-rose-600 opacity-50')

with open(fp, "w", encoding="utf-8") as f:
    f.write(head + "# --seed--\n" + seed + "\n# --solution--" + sol)
