import { useSyncExternalStore } from 'react';

// Regra única de movimento do site (ADR 0003): toda animação consulta este
// hook e, com prefers-reduced-motion, troca de estado sem viajar.
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
