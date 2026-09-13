// Unikátní číslo pro id a name prvků otázek (víc otázek na stránce, víc typů otázek).
let uid = 0;

export const nextQuestionUid = () => ++uid;
