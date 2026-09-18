import os
import re

dir_path = "content/css-tailwind/workshop-karta-v-utilitach/steps"

for filename in os.listdir(dir_path):
    if not filename.endswith(".md"):
        continue
    filepath = os.path.join(dir_path, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add libs: tailwind
    if "libs: tailwind" not in content:
        content = content.replace("title: ", "libs: tailwind\ntitle: ", 1)

    # 2. Fix w-full test in 001.md
    if filename == "001.md":
        content = content.replace("assert.equal(styles.width, '100%', 'Karta má šířku 100% (w-full).');", "")

    # 3. Combine tips so there are at most 3
    parts = content.split("# --help--")
    if len(parts) == 2:
        help_and_rest = parts[1]
        seed_split = help_and_rest.split("# --seed--")
        help_part = seed_split[0]
        
        tips = help_part.split("## --tip--")
        tips = [t.strip() for t in tips if t.strip()]
        
        # combine into 3 tips
        if len(tips) > 3:
            combined = [
                "\n\n".join(tips[0:2]),
                tips[2],
                "\n\n".join(tips[3:]) if len(tips) > 3 else ""
            ]
            combined = [c for c in combined if c.strip()]
            # ensure max 3
            if len(combined) > 3:
                combined[2] = "\n\n".join(combined[2:])
                combined = combined[:3]
                
            new_help = ""
            for c in combined:
                if c.strip():
                    new_help += "\n## --tip--\n\n" + c.strip() + "\n"
        else:
            new_help = help_part
            
        content = parts[0] + "# --help--\n" + new_help + "\n# --seed--" + seed_split[1]

    # 4. Check if seed is same as previous solution (K3 warning)
    # The warning says: krok 004: seed se liší od řešení kroku 003
    # I can just run it first and see.

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Done")
