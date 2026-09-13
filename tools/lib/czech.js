// Skloňování podle počtu: plural(2, 'krok', 'kroky', 'kroků') → '2 kroky'.
export function plural(count, one, few, many) {
  const word = count === 1 ? one : count >= 2 && count <= 4 ? few : many;
  return `${count} ${word}`;
}
