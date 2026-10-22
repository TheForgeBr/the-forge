import { useEffect, useRef } from 'react';
import { useMovimentoReduzido } from './movimento';

/** Espera depois da primeira pintura antes de baixar o motor (issue 6.1). */
const ATRASO_DA_CARGA = 300;

/**
 * Sala da bigorna: o martelo, a bigorna e o canvas das faíscas (issues 6.1 e
 * 6.3). O motor (particulas.ts) chega por importação dinâmica, fora da
 * primeira carga, e só roda com a câmera na sala (`ativo`): ele faz o martelo
 * bater e solta faíscas a cada batida. Com movimento reduzido, nada anima, o
 * motor nem é baixado e o martelo fica parado no alto (a pose do CSS).
 */
export function Faiscas({ ativo }: { ativo: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cabeca = useRef<SVGGElement>(null);
  const impacto = useRef<SVGCircleElement>(null);
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    if (!ativo || reduzido) return;
    let parar: (() => void) | undefined;
    let cancelado = false;
    const espera = setTimeout(() => {
      void import('./particulas').then(({ iniciarFaiscas }) => {
        if (cancelado || !canvas.current) return;
        const martelo =
          cabeca.current && impacto.current
            ? { cabeca: cabeca.current, impacto: impacto.current }
            : null;
        parar = iniciarFaiscas(canvas.current, { martelo });
      });
    }, ATRASO_DA_CARGA);
    return () => {
      cancelado = true;
      clearTimeout(espera);
      parar?.();
    };
  }, [ativo, reduzido]);

  return (
    <>
      <svg
        className="bigorna-martelo"
        viewBox="0 0 120 90"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="bigorna"
          transform="translate(22 37)"
          d="M4 25 H54 V31 H48 Q42 33 40 39 V45 H46 V51 H18 V45 H24 V39 Q22 33 14 31 Q7 29 4 25 Z"
        />
        <defs>
          <linearGradient id="aco-do-martelo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="aco-claro" />
            <stop offset="1" className="aco-escuro" />
          </linearGradient>
        </defs>
        {/* Martelo élfico, à moda dos Noldor de Fëanor: curvas longas em vez
            de blocos. Cabo fino com gancho no punho e um filete; cabeça com a
            face de abas varridas embaixo (é ela que bate), garra em crescente
            no alto e um arco vazado até o cabo; no pescoço, uma folha de luz
            azul, como a das Silmarils. */}
        <g ref={cabeca} className="martelo">
          <path
            className="martelo-aco"
            d="M52 54 L100 55 C103 55.1 105 56 106.5 58.5 C105 57.9 103.4 57.5 101 57.3 L52 58 Z"
          />
          <path className="martelo-filete" d="M68 56 C76 55.4 86 56.5 96 56" />
          <path
            className="martelo-aco"
            d="M44 54 C42 57 37 59.5 33 59.6 C37 61 40 62 44 62 L54 62 C58 62 61 61 65 59.6 C61 59.5 56 57 54 54 Z M44 54 C43 49 44 43 47 39 C49.5 35.5 54 33.5 59 34 C55 35.5 52.5 38.5 52 43 L52 54 Z M55.5 36.2 C59 40 60.5 47 65 54.6 L62.5 54.7 C58.8 48.5 57 41.5 54 37.5 Z"
          />
          <path
            className="martelo-luz"
            d="M46.6 51 C45.9 47.5 46.8 44.5 49.2 42.6 C49.1 45.8 48.8 48.8 46.6 51 Z"
          />
        </g>
        {/* Onde a cabeça encosta na bigorna: daqui saem as faíscas da batida. */}
        <circle
          ref={impacto}
          className="ponto-de-impacto"
          cx="49"
          cy="62"
          r="0.5"
        />
      </svg>
      <canvas ref={canvas} className="faiscas" aria-hidden="true" />
    </>
  );
}
