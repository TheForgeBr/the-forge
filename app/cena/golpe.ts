// Ciclo do martelo na bigorna da Home (issue 6.3), em segundos e graus. É
// puro: o laço das faíscas (particulas.ts) avança o relógio, gira o martelo
// e solta um estouro de faíscas a cada batida. Sem som.

/** Duração de um golpe completo. */
export const CICLO = 2.6;
/** Instante em que a cabeça do martelo encosta na bigorna. */
export const IMPACTO = 2.4;
/** Martelo no alto; é também a pose parada, com movimento reduzido. */
export const ANGULO_LEVANTADO = -35;

const QUIQUE = { fim: 0.12, angulo: -6 };
const SUBIDA_FIM = 1.5;
const DESCIDA_INICIO = 2.2;

const saida = (u: number) => 1 - (1 - u) ** 3;
const entrada = (u: number) => u ** 3;

/** Ângulo do martelo no instante `t` do ciclo: 0 encosta, negativo sobe. */
export function anguloDoMartelo(t: number) {
  const fase = ((t % CICLO) + CICLO) % CICLO;
  if (fase < QUIQUE.fim)
    return QUIQUE.angulo * Math.sin((Math.PI * fase) / QUIQUE.fim);
  if (fase < SUBIDA_FIM)
    return (
      ANGULO_LEVANTADO * saida((fase - QUIQUE.fim) / (SUBIDA_FIM - QUIQUE.fim))
    );
  if (fase < DESCIDA_INICIO) return ANGULO_LEVANTADO;
  if (fase < IMPACTO)
    return (
      ANGULO_LEVANTADO *
      (1 - entrada((fase - DESCIDA_INICIO) / (IMPACTO - DESCIDA_INICIO)))
    );
  return 0;
}

export interface Golpe {
  /** Tempo dentro do ciclo, de 0 a CICLO. */
  fase: number;
}

export function criarGolpe(): Golpe {
  return { fase: 0 };
}

/** Avança `dt` segundos e devolve quantas batidas aconteceram nesse passo. */
export function avancarGolpe(golpe: Golpe, dt: number) {
  let antes = golpe.fase;
  let depois = antes + dt;
  let batidas = 0;
  while (depois >= CICLO) {
    if (antes < IMPACTO) batidas++;
    depois -= CICLO;
    antes = 0;
  }
  if (antes < IMPACTO && depois >= IMPACTO) batidas++;
  golpe.fase = depois;
  return batidas;
}
