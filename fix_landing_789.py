import os

dir_path = "content/css-tailwind/workshop-landing-sekce/steps"

def rep(fname, find_s, repl_s):
    fp = os.path.join(dir_path, fname)
    with open(fp, "r") as f: c = f.read()
    c = c.replace(find_s, repl_s)
    with open(fp, "w") as f: f.write(c)

rep("007.md", 'class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800"', 'class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover-shadow-xl transition"')
rep("007.md", '# --solution--\n## --file-- index.html\n```html\n<main class="bg-slate-50 dark:bg-slate-950">\n  <section class="min-h-screen flex flex-col justify-center items-center p-6">\n    <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center">Tvoje nová aplikace</h1>\n    <button class="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 hover:scale-105 transition mt-8">Začít zdarma</button>\n    <div class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mt-16">\n      <article class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover-shadow-xl transition">', '# --solution--\n## --file-- index.html\n```html\n<main class="bg-slate-50 dark:bg-slate-950">\n  <section class="min-h-screen flex flex-col justify-center items-center p-6">\n    <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center">Tvoje nová aplikace</h1>\n    <button class="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 hover:scale-105 transition mt-8">Začít zdarma</button>\n    <div class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mt-16">\n      <article class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition">')

rep("008.md", 'class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800"', 'class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition"')

rep("009.md", 'class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800"', 'class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition"')
rep("009.md", "assert.ok(true);", "assert.ok(true, 'Dokonceno.');")

# also fix 002 seed warning
rep("002.md", '<section class="hero">', '<section class="min-h-screen flex flex-col justify-center items-center p-6">')

