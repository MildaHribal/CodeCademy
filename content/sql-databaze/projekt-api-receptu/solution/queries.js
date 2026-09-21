// Dotazy nad databází Vařečky. Všechno, co jde do SQL, jde přes vázané parametry (?).

/** Chyba, kterou server umí přeložit na stavový kód a tělo { error: { code, message } }. */
export class ApiError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

const toRecipe = (radek) => ({
  id: radek.id,
  slug: radek.slug,
  title: radek.title,
  minutes: radek.minutes,
  servings: radek.servings,
  difficulty: radek.difficulty,
  category: { slug: radek.category_slug, name: radek.category_name },
  rating_avg: radek.rating_avg ?? null,
  rating_count: radek.rating_count,
});

/**
 * Stránka výpisu receptů s filtry.
 * @returns {{ total: number, items: object[] }}
 */
export function listRecipes(db, { category = null, maxMinutes = null, q = null, page = 1, perPage = 5 } = {}) {
  const podminky = [];
  const parametry = [];
  if (category !== null) {
    podminky.push('c.slug = ?');
    parametry.push(category);
  }
  if (maxMinutes !== null) {
    podminky.push('r.minutes <= ?');
    parametry.push(maxMinutes);
  }
  if (q !== null) {
    podminky.push("r.title LIKE '%' || ? || '%'");
    parametry.push(q);
  }
  const kde = podminky.length > 0 ? `WHERE ${podminky.join(' AND ')}` : '';

  const { total } = db.prepare(`
    SELECT COUNT(*) AS total
    FROM recipes r
    JOIN categories c ON c.id = r.category_id
    ${kde}
  `).get(...parametry);

  const radky = db.prepare(`
    SELECT r.id, r.slug, r.title, r.minutes, r.servings, r.difficulty,
           c.slug AS category_slug, c.name AS category_name,
           ROUND(AVG(h.stars), 1) AS rating_avg,
           COUNT(h.id)             AS rating_count
    FROM recipes r
    JOIN categories c ON c.id = r.category_id
    LEFT JOIN ratings h ON h.recipe_id = r.id
    ${kde}
    GROUP BY r.id
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT ? OFFSET ?
  `).all(...parametry, perPage, (page - 1) * perPage);

  return { total, items: radky.map(toRecipe) };
}

/** Souhrn hodnocení jednoho receptu. */
export function ratingSummary(db, recipeId) {
  const radek = db.prepare(`
    SELECT ROUND(AVG(stars), 1) AS rating_avg, COUNT(*) AS rating_count
    FROM ratings
    WHERE recipe_id = ?
  `).get(recipeId);
  return { rating_avg: radek.rating_avg ?? null, rating_count: radek.rating_count };
}

/** Recept podle slugu i s ingrediencemi a hodnoceními, nebo null. */
export function recipeDetail(db, slug) {
  const radek = db.prepare(`
    SELECT r.id, r.slug, r.title, r.minutes, r.servings, r.difficulty, r.instructions, r.created_at,
           c.slug AS category_slug, c.name AS category_name
    FROM recipes r
    JOIN categories c ON c.id = r.category_id
    WHERE r.slug = ?
  `).get(slug);
  if (!radek) return null;

  const ingredients = db.prepare(`
    SELECT i.name, s.amount, s.unit
    FROM recipe_ingredients s
    JOIN ingredients i ON i.id = s.ingredient_id
    WHERE s.recipe_id = ?
    ORDER BY i.name
  `).all(radek.id);

  const ratings = db.prepare(`
    SELECT id, author, stars, comment, created_at
    FROM ratings
    WHERE recipe_id = ?
    ORDER BY created_at DESC, id DESC
  `).all(radek.id);

  return {
    ...toRecipe(radek),
    instructions: radek.instructions,
    created_at: radek.created_at,
    ingredients,
    ratings,
    ...ratingSummary(db, radek.id),
  };
}

/** Id receptu podle slugu, nebo null. */
export function recipeIdBySlug(db, slug) {
  const radek = db.prepare('SELECT id FROM recipes WHERE slug = ?').get(slug);
  return radek ? radek.id : null;
}

/**
 * Založí recept i jeho ingredience v jedné transakci.
 * Když cokoli neprojde, nezůstane po pokusu ani řádek.
 * @returns {number} id nového receptu
 */
export function createRecipe(db, data) {
  db.exec('BEGIN');
  try {
    const kategorie = db.prepare('SELECT id FROM categories WHERE slug = ?').get(data.category);
    if (!kategorie) {
      throw new ApiError(400, 'UNKNOWN_CATEGORY', `Kategorie „${data.category}" v databázi není.`);
    }
    if (db.prepare('SELECT id FROM recipes WHERE slug = ?').get(data.slug)) {
      throw new ApiError(409, 'SLUG_TAKEN', `Recept se slugem „${data.slug}" už existuje.`);
    }

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO recipes (category_id, slug, title, minutes, servings, difficulty, instructions, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(kategorie.id, data.slug, data.title, data.minutes, data.servings, data.difficulty, data.instructions, dnes());
    const recipeId = Number(lastInsertRowid);

    const najdiSurovinu = db.prepare('SELECT id FROM ingredients WHERE name = ?');
    const vlozSurovinu = db.prepare('INSERT INTO ingredients (name) VALUES (?)');
    const vlozDvojici = db.prepare(`
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit)
      VALUES (?, ?, ?, ?)
    `);
    for (const polozka of data.ingredients) {
      const nalezena = najdiSurovinu.get(polozka.name);
      const ingredientId = nalezena ? nalezena.id : Number(vlozSurovinu.run(polozka.name).lastInsertRowid);
      vlozDvojici.run(recipeId, ingredientId, polozka.amount, polozka.unit);
    }

    db.exec('COMMIT');
    return recipeId;
  } catch (chyba) {
    db.exec('ROLLBACK');
    if (chyba instanceof ApiError) throw chyba;
    throw new ApiError(400, 'INVALID_BODY', `Recept nejde uložit: ${chyba.message}`);
  }
}

/** Přidá hodnocení receptu a vrátí jeho id. */
export function addRating(db, recipeId, { author, stars, comment }) {
  if (db.prepare('SELECT id FROM ratings WHERE recipe_id = ? AND author = ?').get(recipeId, author)) {
    throw new ApiError(409, 'ALREADY_RATED', `Autor „${author}" už tenhle recept hodnotil.`);
  }
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO ratings (recipe_id, author, stars, comment, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(recipeId, author, stars, comment, dnes());
  return Number(lastInsertRowid);
}

/** Jedno hodnocení podle id. */
export function ratingById(db, id) {
  return db.prepare('SELECT id, author, stars, comment, created_at FROM ratings WHERE id = ?').get(id);
}

/** Ingredience a počet receptů, ve kterých jsou — od nejpoužívanější. */
export function ingredientUsage(db) {
  return db.prepare(`
    SELECT i.id, i.name, COUNT(s.recipe_id) AS recipes_count
    FROM ingredients i
    LEFT JOIN recipe_ingredients s ON s.ingredient_id = i.id
    GROUP BY i.id
    ORDER BY recipes_count DESC, i.name
  `).all();
}

/** Nejlépe hodnocené recepty v každé kategorii — pořadí počítá okenní funkce. */
export function categoryRankings(db, perCategory = 2) {
  const radky = db.prepare(`
    WITH hodnocene AS (
      SELECT r.id, r.slug, r.title,
             c.slug AS category_slug, c.name AS category_name,
             ROUND(AVG(h.stars), 1) AS rating_avg,
             COUNT(h.id)            AS rating_count
      FROM recipes r
      JOIN categories c ON c.id = r.category_id
      JOIN ratings h ON h.recipe_id = r.id
      GROUP BY r.id
    ),
    zebricek AS (
      SELECT hodnocene.*,
             ROW_NUMBER() OVER (
               PARTITION BY category_slug
               ORDER BY rating_avg DESC, rating_count DESC, id
             ) AS poradi
      FROM hodnocene
    )
    SELECT * FROM zebricek
    WHERE poradi <= ?
    ORDER BY category_name, poradi
  `).all(perCategory);

  return radky.map((radek) => ({
    category: { slug: radek.category_slug, name: radek.category_name },
    rank: radek.poradi,
    slug: radek.slug,
    title: radek.title,
    rating_avg: radek.rating_avg,
    rating_count: radek.rating_count,
  }));
}

/** Souhrn za každou kategorii, i za tu bez receptů. */
export function categoryStats(db) {
  return db.prepare(`
    SELECT c.slug, c.name,
           (SELECT COUNT(*)              FROM recipes r WHERE r.category_id = c.id) AS recipes_count,
           (SELECT ROUND(AVG(r.minutes), 1) FROM recipes r WHERE r.category_id = c.id) AS avg_minutes,
           (SELECT ROUND(AVG(h.stars), 1)
              FROM ratings h
              JOIN recipes r ON r.id = h.recipe_id
             WHERE r.category_id = c.id) AS rating_avg
    FROM categories c
    ORDER BY c.name
  `).all().map((radek) => ({
    slug: radek.slug,
    name: radek.name,
    recipes_count: radek.recipes_count,
    avg_minutes: radek.avg_minutes ?? null,
    rating_avg: radek.rating_avg ?? null,
  }));
}

/** Dnešní datum ve tvaru RRRR-MM-DD. */
function dnes() {
  return new Date().toISOString().slice(0, 10);
}
