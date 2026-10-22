import { useEffect, useRef } from 'react';
import type { ControleDoFogo } from './chamas';
import { useMovimentoReduzido } from './movimento';

/** Espera depois da primeira pintura antes de baixar o motor (issue 6.2). */
const ATRASO_DA_CARGA = 300;

/**
 * Fogo da forja na base da cena (issue 6.2). O motor (chamas.ts) chega por
 * importação dinâmica, fora da primeira carga. A intensidade vem da sala e
 * muda sem religar o fogo. Com movimento reduzido, há um quadro estático.
 */
export function Fogo({ intensidade }: { intensidade: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controle = useRef<ControleDoFogo | null>(null);
  const alvo = useRef(intensidade);
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    alvo.current = intensidade;
    controle.current?.definirIntensidade(intensidade);
  }, [intensidade]);

  useEffect(() => {
    let cancelado = false;
    const espera = setTimeout(() => {
      void import('./chamas').then(({ iniciarFogo }) => {
        if (cancelado || !canvas.current) return;
        controle.current = iniciarFogo(canvas.current, {
          estatico: reduzido,
          intensidade: alvo.current,
        });
      });
    }, ATRASO_DA_CARGA);
    return () => {
      cancelado = true;
      clearTimeout(espera);
      controle.current?.parar();
      controle.current = null;
    };
  }, [reduzido]);

  return <canvas ref={canvas} className="fogo" aria-hidden="true" />;
}
