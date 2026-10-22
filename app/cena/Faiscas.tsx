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
        <g ref={cabeca} className="martelo">
          <rect
            className="martelo-cabo"
            x="60"
            y="53"
            width="46"
            height="5"
            rx="2.5"
          />
          <rect
            className="martelo-cabeca"
            x="38"
            y="48"
            width="22"
            height="14"
            rx="1.5"
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
