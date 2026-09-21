-- Schéma receptové databáze Vařečka.
-- Časy jsou v celých minutách, množství ingrediencí je desetinné číslo s jednotkou.

CREATE TABLE categories (
  id   INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
) STRICT;

CREATE TABLE recipes (
  id           INTEGER PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug         TEXT    NOT NULL UNIQUE,
  title        TEXT    NOT NULL,
  minutes      INTEGER NOT NULL CHECK (minutes > 0),
  servings     INTEGER NOT NULL CHECK (servings > 0),
  difficulty   TEXT    NOT NULL CHECK (difficulty IN ('snadne', 'stredni', 'narocne')),
  instructions TEXT    NOT NULL,
  created_at   TEXT    NOT NULL
) STRICT;

CREATE TABLE ingredients (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
) STRICT;

-- Spojovací tabulka vztahu M:N. Navíc nese množství, které patří k dvojici recept + ingredience.
CREATE TABLE recipe_ingredients (
  recipe_id     INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  amount        REAL    NOT NULL CHECK (amount > 0),
  unit          TEXT    NOT NULL,
  PRIMARY KEY (recipe_id, ingredient_id)
) STRICT;

CREATE TABLE ratings (
  id         INTEGER PRIMARY KEY,
  recipe_id  INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  author     TEXT    NOT NULL,
  stars      INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment    TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL,
  UNIQUE (recipe_id, author)
) STRICT;

-- Cizí klíč sám index nezakládá, a přitom se přes něj spojuje v každém výpisu.
CREATE INDEX recipes_category_idx ON recipes (category_id);
CREATE INDEX ratings_recipe_idx ON ratings (recipe_id);
