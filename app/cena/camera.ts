import { SALAS, type NomeDaSala } from '../../scripts/rotas.mjs';

/** Onde a câmera para em cada sala: x em larguras de tela, y em alturas. */
export interface PosicaoDaCamera {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

// As salas ficam lado a lado na faixa da cena, na ordem de SALAS.
export const POSICOES: Readonly<Record<NomeDaSala, PosicaoDaCamera>> =
  Object.fromEntries(
    SALAS.map(({ sala }, i) => [sala, { x: i, y: 0, zoom: 1 }]),
  ) as Record<NomeDaSala, PosicaoDaCamera>;

/** Viagem entre salas (ADR 0003: de 600 a 900 ms). */
export const DURACAO_DA_VIAGEM = 0.75;

export function posicaoDaSala(sala: NomeDaSala | undefined) {
  return POSICOES[sala ?? 'home'];
}
