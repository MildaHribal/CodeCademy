import os
import re

dir_path = "content/css-tailwind/workshop-karta-v-utilitach/steps"

for filename in os.listdir(dir_path):
    if not filename.endswith(".md"):
        continue
    filepath = os.path.join(dir_path, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We want to replace everything in # --help-- so that any text before ## --tip-- is removed, or merged into the first tip.
    # Actually, in my original output:
    # <--help-->
    # Text
    # ## --tip-- 1
    # Tip1
    # ## --tip-- 2
    # Tip2
    
    parts = content.split("# --help--")
    if len(parts) == 2:
        help_and_rest = parts[1]
        seed_split = help_and_rest.split("# --seed--")
        help_part = seed_split[0]
        
        # fix help_part
        lines = help_part.strip().split("\n")
        new_help = ""
        current_tip = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith("## --tip--"):
                if current_tip:
                    new_help += "## --tip--\n\n" + "\n".join(current_tip) + "\n\n"
                    current_tip = []
            elif line.startswith("## Udělej po svém"):
                # oops, Udělej po svém was in help_part? No, Udělej po svém was in description. 
                # Wait, my previous script put it in help! Let's check if it's there.
                pass
            else:
                current_tip.append(line)
        if current_tip:
            new_help += "## --tip--\n\n" + "\n".join(current_tip) + "\n\n"
            
        # check if Udělej po svém is in new_help
        if "Udělej po svém" in new_help:
             # let's just rewrite step 11 manually
             pass

        new_content = parts[0] + "# --help--\n\n" + new_help + "# --seed--" + seed_split[1]
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

print("Done")
