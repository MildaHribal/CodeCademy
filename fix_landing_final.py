import os

dir_path = "content/css-tailwind/workshop-landing-sekce/steps"

def rep(fname, find_s, repl_s):
    fp = os.path.join(dir_path, fname)
    with open(fp, "r") as f: c = f.read()
    c = c.replace(find_s, repl_s)
    with open(fp, "w") as f: f.write(c)

# 002 revert seed
rep("002.md", '<section class="min-h-screen flex flex-col justify-center items-center p-6">', '<section class="hero">')

# 009 fix test
rep("009.md", "assert.ok(true, 'Dokonceno.');", "assert.ok(document.querySelectorAll('article').length > 1, 'Pridana dalsi karta.');")

# 009 add a card to solution
sol_card = '<article class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition">\n        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Spolehlivost</h3>\n        <p class="text-slate-600 dark:text-slate-400">Neboj se výpadků.</p>\n      </article>'

rep("009.md", '<article class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition">\n        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Rychlost</h3>\n        <p class="text-slate-600 dark:text-slate-400">Blesková odezva a načítání.</p>\n      </article>\n    </div>', '<article class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition">\n        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Rychlost</h3>\n        <p class="text-slate-600 dark:text-slate-400">Blesková odezva a načítání.</p>\n      </article>\n' + sol_card + '\n    </div>')
