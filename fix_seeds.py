import os

dir_path = "content/css-tailwind/workshop-karta-v-utilitach/steps"

steps = sorted([f for f in os.listdir(dir_path) if f.endswith(".md")])

for i in range(1, len(steps)):
    prev_path = os.path.join(dir_path, steps[i-1])
    curr_path = os.path.join(dir_path, steps[i])
    
    with open(prev_path, "r", encoding="utf-8") as f:
        prev_content = f.read()
    with open(curr_path, "r", encoding="utf-8") as f:
        curr_content = f.read()
        
    prev_sol = prev_content.split("# --solution--")[1].strip()
    
    curr_parts = curr_content.split("# --seed--")
    curr_seed_and_rest = curr_parts[1].split("# --solution--")
    
    # We replace the seed of current step with solution of previous step + --edit-- markers where needed.
    # Actually, the user's --edit-- markers are just removed by parse.js before K3 comparison.
    # But let's just make the seed EXACTLY the previous solution, and just wrap the whole thing in --edit--?
    # Wait, the K3 warning only cares about the textual content without --edit--.
    # If they differ, it's because I changed something inadvertently.
    
    curr_sol = curr_seed_and_rest[1]
    
    new_curr = curr_parts[0] + "# --seed--\n\n" + prev_sol + "\n\n# --solution--\n" + curr_sol
    with open(curr_path, "w", encoding="utf-8") as f:
        f.write(new_curr)
        
print("Seeds aligned")
