import { useEffect, useRef } from 'react';
import { useMovimentoReduzido } from './movimento';

/** Espera depois da primeira pintura antes de baixar o motor (issue 6.1). */
const ATRASO_DA_CARGA = 300;

/**
 * Canvas das faíscas na sala da bigorna (issue 6.1). O motor
 * (particulas.ts) chega por importação dinâmica, fora da primeira carga, e só
 * roda com a câmera na sala (`ativo`). Com movimento reduzido, nada anima e o
 * motor nem é baixado.
 */
export function Faiscas({ ativo }: { ativo: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    if (!ativo || reduzido) return;
    let parar: (() => void) | undefined;
    let cancelado = false;
    const espera = setTimeout(() => {
      void import('./particulas').then(({ iniciarFaiscas }) => {
        if (cancelado || !canvas.current) return;
        parar = iniciarFaiscas(canvas.current);
      });
    }, ATRASO_DA_CARGA);
    return () => {
      cancelado = true;
      clearTimeout(espera);
      parar?.();
    };
  }, [ativo, reduzido]);

  return <canvas ref={canvas} className="faiscas" aria-hidden="true" />;
}
