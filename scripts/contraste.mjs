// Contraste entre duas cores pela fórmula do WCAG 2.x (luminância relativa).

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(hexA, hexB) {
  const [clara, escura] = [luminancia(hexA), luminancia(hexB)].sort(
    (a, b) => b - a,
  );
  return (clara + 0.05) / (escura + 0.05);
}

// Devolve, em texto, os pares [texto, fundo] que não atingem o mínimo.
export function paresAbaixoDoMinimo(cores, pares, minimo) {
  return pares
    .map(([texto, fundo]) => [
      texto,
      fundo,
      contraste(cores[texto], cores[fundo]),
    ])
    .filter(([, , razao]) => razao < minimo)
    .map(
      ([texto, fundo, razao]) =>
        `${texto} sobre ${fundo}: ${razao.toFixed(2)}:1 (mínimo ${minimo}:1)`,
    );
}
