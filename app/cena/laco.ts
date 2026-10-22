// Laço de animação da cena (issues 6.1 e 6.2): requestAnimationFrame com o
// tempo do quadro em segundos, pausa com a aba oculta e, se pedido, um
// intervalo mínimo entre passos para poupar CPU (o fogo roda a 30 por
// segundo). Quem decide se anima é o componente: com movimento reduzido, o
// laço nem começa.

/** Quadro mais longo que isso (aba voltando, travada) conta só 0,1 s. */
const DT_MAXIMO = 0.1;

export function iniciarLaco(
  passo: (dt: number) => void,
  { intervalo = 0 }: { intervalo?: number } = {},
): () => void {
  let quadro = 0;
  let anterior: number | null = null;
  let acumulado = 0;

  function tique(agora: number) {
    const dt =
      anterior === null ? 0 : Math.min((agora - anterior) / 1000, DT_MAXIMO);
    anterior = agora;
    acumulado += dt;
    if (acumulado >= intervalo) {
      passo(Math.min(acumulado, DT_MAXIMO));
      acumulado = 0;
    }
    quadro = requestAnimationFrame(tique);
  }

  function aoMudarVisibilidade() {
    cancelAnimationFrame(quadro);
    if (document.hidden) return;
    // Ao voltar, recomeça sem descontar o tempo em que a aba ficou oculta.
    anterior = null;
    quadro = requestAnimationFrame(tique);
  }

  document.addEventListener('visibilitychange', aoMudarVisibilidade);
  if (!document.hidden) quadro = requestAnimationFrame(tique);

  return () => {
    cancelAnimationFrame(quadro);
    document.removeEventListener('visibilitychange', aoMudarVisibilidade);
  };
}
