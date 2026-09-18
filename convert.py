import os
import yaml

dir_path = "content/css-tailwind/workshop-karta-v-utilitach/steps"

for filename in os.listdir(dir_path):
    if not filename.endswith(".md") or filename == "001.md":
        continue
    filepath = os.path.join(dir_path, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # parse yaml block
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_str = parts[1]
            rest = parts[2]
            
            fm = yaml.safe_load(fm_str)
            title = fm.get("title", "")
            seed_html = fm.get("seed", {}).get("index.html", "")
            sol_html = fm.get("solution", {}).get("index.html", "")
            tests_js = fm.get("tests", "")
            kind = fm.get("kind", "")
            
            # split rest into description and help
            # We had something like "Tady je text... \n\n<--help-->\n\ntip..."
            desc_part = rest
            help_part = ""
            if "<--help-->" in rest:
                desc_part, help_part = rest.split("<--help-->", 1)
            
            new_md = f"---\ntitle: \"{title}\""
            if kind:
                new_md += f"\nkind: {kind}"
            new_md += "\n---\n\n# --description--\n" + desc_part.strip() + "\n\n"
            
            new_md += "# --hints--\n\nSplněno.\n\n```js\n" + tests_js.strip() + "\n```\n\n"
            new_md += "# --help--\n\n"
            
            # Process help tips
            # Originally I wrote things like "Nadpis.\n## --tip-- 1\nTip..."
            # For each ## --tip--, we will just emit it properly.
            lines = help_part.strip().split("\n")
            for line in lines:
                if line.startswith("## --tip--"):
                    new_md += "## --tip--\n\n"
                elif line.strip() != "":
                    new_md += line.strip() + "\n\n"
                    
            new_md += "# --seed--\n\n## --file-- index.html\n\n```html\n" + seed_html.strip() + "\n```\n\n"
            new_md += "# --solution--\n\n## --file-- index.html\n\n```html\n" + sol_html.strip() + "\n```\n"
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_md)
print("Done")
