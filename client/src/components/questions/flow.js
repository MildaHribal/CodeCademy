// Průběh jedné otázky: kolik pokusů, kdy ukázat správnou odpověď, kdy je vyřešená.
// Čistá logika bez DOM (testuje ji tools/reviews-unit.test.js), UI je v question.js.
//
// Pravidla (kontrakt kap. 4.5, „otázky neprozradí odpověď"):
// - po prvním špatném pokusu se správná odpověď NEUKÁŽE (jen ✗ a vysvětlení zvolené odpovědi),
// - po druhém neúspěchu nebo po kliknutí „Ukaž odpověď" se ukáže,
// - otázka je vyřešená, když ji uživatel zodpověděl správně nebo si odpověď nechal ukázat,
// - když uživatel správnou odpověď už viděl, další pokus volby zamíchá jinak.

/** Kolikátý neúspěch už ukáže správnou odpověď. */
export const FAILURES_BEFORE_ANSWER = 2;

export function createQuestionFlow() {
  let evaluations = 0; // všechna vyhodnocení
  let failures = 0; // z toho špatně
  let correct = null; // výsledek posledního vyhodnocení (null = zatím žádné)
  let answerShown = false; // uživatel viděl správnou odpověď
  let solved = false; // jednou vyřešená zůstává vyřešená
  let round = 0; // kolikrát se volby míchaly znovu

  return {
    /**
     * Zapíše vyhodnocení. Vrací, co má UI ukázat:
     * showAnswer = ukázat správnou odpověď (správně, nebo už druhý neúspěch).
     */
    record(isCorrect) {
      evaluations++;
      correct = Boolean(isCorrect);
      if (!correct) failures++;
      const showAnswer = correct || failures >= FAILURES_BEFORE_ANSWER;
      if (showAnswer) answerShown = true;
      if (correct || showAnswer) solved = true;
      return { correct, showAnswer, failures, evaluations };
    },

    /** Uživatel klikl „Ukaž odpověď". */
    revealAnswer() {
      answerShown = true;
      solved = true;
    },

    /**
     * Další pokus. Když uživatel správnou odpověď viděl, volby se zamíchají jinak
     * (reshuffle: true, round = nové číslo kola pro míchání).
     */
    retry() {
      const reshuffle = answerShown;
      if (reshuffle) round++;
      answerShown = false;
      correct = null;
      return { reshuffle, round };
    },

    state: () => ({ evaluations, failures, correct, answerShown, solved, round }),
  };
}
