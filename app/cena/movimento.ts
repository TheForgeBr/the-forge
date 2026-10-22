import { useAnimate } from 'motion/react-mini';
import { useCallback, useSyncExternalStore } from 'react';

// Regra única de movimento do site (ADR 0003, issue 3.6). Toda animação passa
// por useAnimacao, que é o único lugar que importa o Motion: com
// prefers-reduced-motion, ou sem a Web Animations API, nada viaja e o estado
// final já vale. O teste movimento.test.ts falha se outro arquivo importar o
// Motion direto.
const CONSULTA = '(prefers-reduced-motion: reduce)';

function lista() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(CONSULTA)
    : null;
}

function assinar(avisar: () => void) {
  const mq = lista();
  mq?.addEventListener('change', avisar);
  return () => mq?.removeEventListener('change', avisar);
}

/** true quando o sistema pede movimento reduzido; reage se a pessoa mudar. */
export function useMovimentoReduzido(): boolean {
  return useSyncExternalStore(
    assinar,
    () => lista()?.matches ?? false,
    // No pré-render não há animação, então o valor não importa.
    () => false,
  );
}

export interface OpcoesDaAnimacao {
  readonly duration: number;
  readonly ease?: readonly [number, number, number, number];
}

/**
 * Anima o elemento do `ref` pela Web Animations API (motion/react-mini).
 * `animar` não faz nada com movimento reduzido ou num navegador sem a API.
 */
export function useAnimacao<T extends HTMLElement>() {
  const reduzido = useMovimentoReduzido();
  const [ref, animate] = useAnimate<T>();
  const animar = useCallback(
    (quadros: Record<string, string[]>, opcoes: OpcoesDaAnimacao) => {
      const elemento = ref.current;
      if (reduzido || !elemento?.animate) return;
      animate(elemento, quadros, {
        duration: opcoes.duration,
        ease: opcoes.ease ? [...opcoes.ease] : undefined,
      });
    },
    [reduzido, animate, ref],
  );
  return { ref, animar, reduzido };
}
