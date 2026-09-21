-- Schéma receptové databáze Vařečka.
-- Časy jsou v celých minutách, množství ingrediencí je desetinné číslo s jednotkou.
--
-- Tabulka categories je hotová jako vzor, zbylé čtyři dopiš. Jména a pořadí sloupců
-- si přečti z příkazů INSERT v seed.sql, pravidla ze zadání v Akademii.

CREATE TABLE categories (
  id   INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
) STRICT;

-- CREATE TABLE recipes (...)            id, category_id, slug, title, minutes, servings, difficulty, instructions, created_at
-- CREATE TABLE ingredients (...)        id, name
-- CREATE TABLE recipe_ingredients (...) recipe_id, ingredient_id, amount, unit
-- CREATE TABLE ratings (...)            id, recipe_id, author, stars, comment, created_at

-- A nakonec indexy tam, kde se přes ně spojuje v každém výpisu.
