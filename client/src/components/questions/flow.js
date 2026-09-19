// Pravidla (kontrakt kap. 4.5, „otázky neprozradí odpověď"):

export const FAILURES_BEFORE_ANSWER = 2;

export function createQuestionFlow() {
  let evaluations = 0;
  let failures = 0;
  let correct = null;
  let answerShown = false;
  let solved = false;
  let round = 0;

  return {
    record(isCorrect) {
      evaluations++;
      correct = Boolean(isCorrect);
      if (!correct) failures++;
      const showAnswer = correct || failures >= FAILURES_BEFORE_ANSWER;
      if (showAnswer) answerShown = true;
      if (correct || showAnswer) solved = true;
      return { correct, showAnswer, failures, evaluations };
    },

    revealAnswer() {
      answerShown = true;
      solved = true;
    },

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
