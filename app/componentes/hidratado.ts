import { useSyncExternalStore } from 'react';

const semAssinatura = () => () => {};

/**
 * false no pré-render e na hidratação, true depois. Controles que só
 * funcionam com JavaScript (abrir o menu, filtrar) só aparecem com true; sem
 * JavaScript, o HTML mostra tudo aberto.
 */
export function useHidratado() {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
}
