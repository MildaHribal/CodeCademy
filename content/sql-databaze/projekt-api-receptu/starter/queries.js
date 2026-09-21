// Dotazy nad databází Vařečky. Sem patří SQL, do server.js HTTP a kontrola vstupů.
// Každá funkce dostane jako první argument otevřenou databázi.
// Hodnoty z požadavku nikdy nelep do textu dotazu — patří do vázaných parametrů (?).

/** Chyba, kterou server umí přeložit na stavový kód a tělo { error: { code, message } }. */
export class ApiError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

/**
 * Stránka výpisu receptů s filtry (kterýkoli filtr může být null).
 * @param {object} filtr `{ category, maxMinutes, q, page, perPage }`
 * @returns {{ total: number, items: object[] }} celkový počet po filtrech a jedna stránka
 */
export function listRecipes(db, { category = null, maxMinutes = null, q = null, page = 1, perPage = 5 } = {}) {

}

/** Souhrn hodnocení jednoho receptu: `{ rating_avg, rating_count }`. */
export function ratingSummary(db, recipeId) {

}

/** Recept podle slugu i s ingrediencemi a hodnoceními, nebo null. */
export function recipeDetail(db, slug) {

}

/** Id receptu podle slugu, nebo null. */
export function recipeIdBySlug(db, slug) {

}

/**
 * Založí recept i jeho ingredience v jedné transakci.
 * Když cokoli neprojde, nesmí po pokusu zůstat ani řádek.
 * @returns {number} id nového receptu
 */
export function createRecipe(db, data) {

}

/** Přidá hodnocení receptu a vrátí jeho id. */
export function addRating(db, recipeId, { author, stars, comment }) {

}

/** Jedno hodnocení podle id: `{ id, author, stars, comment, created_at }`. */
export function ratingById(db, id) {

}

/** Ingredience a počet receptů, ve kterých jsou — od nejpoužívanější. */
export function ingredientUsage(db) {

}

/** Nejlépe hodnocené recepty v každé kategorii i s pořadím uvnitř kategorie. */
export function categoryRankings(db, perCategory = 2) {

}

/** Souhrn za každou kategorii, i za tu, která zatím žádný recept nemá. */
export function categoryStats(db) {

}
