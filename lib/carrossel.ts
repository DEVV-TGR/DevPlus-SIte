/** docs: docs/04-componentes-e-padroes.md — o carrossel glass dos projetos. */

/** Um índice qualquer, dobrado para dentro de `0 … count - 1`. */
export function wrapIndex(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

/**
 * A distância de `index` ao selecionado, num círculo: negativa à esquerda,
 * positiva à direita, nunca maior do que metade da volta. Com sete projetos
 * vai de −3 a 3, e o primeiro e o último são vizinhos.
 */
export function distanceFrom(index: number, selected: number, count: number) {
  const half = Math.floor(count / 2);
  return wrapIndex(index - selected + half, count) - half;
}
