import { afterEach, describe, expect, it, vi } from 'vitest';
import { iniciarLaco } from './laco';

// requestAnimationFrame à mão: o teste decide quando cada quadro acontece.
function quadrosManuais() {
  let proximo: ((t: number) => void) | null = null;
  vi.stubGlobal('requestAnimationFrame', (f: (t: number) => void) => {
    proximo = f;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    proximo = null;
  });
  return {
    rodar(t: number) {
      const f = proximo;
      proximo = null;
      f?.(t);
    },
    pendente: () => proximo !== null,
  };
}

function ocultar(oculta: boolean) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => oculta,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

afterEach(() => {
  ocultar(false);
  vi.unstubAllGlobals();
});

describe('iniciarLaco', () => {
  it('chama o passo com o tempo do quadro em segundos', () => {
    const quadros = quadrosManuais();
    const passo = vi.fn();
    iniciarLaco(passo);
    quadros.rodar(1000);
    quadros.rodar(1016);
    expect(passo).toHaveBeenNthCalledWith(1, 0);
    expect(passo.mock.calls[1]?.[0]).toBeCloseTo(0.016);
  });

  it('respeita o intervalo mínimo entre passos', () => {
    const quadros = quadrosManuais();
    const passo = vi.fn();
    iniciarLaco(passo, { intervalo: 1 / 30 });
    for (const t of [0, 16, 32, 48]) quadros.rodar(t);
    // 0 s não alcança 1/30; 32 ms alcança e zera; 48 ms acumula só 16 ms.
    expect(passo).toHaveBeenCalledTimes(1);
  });

  it('pausa com a aba oculta e volta sem um salto de tempo', () => {
    const quadros = quadrosManuais();
    const passo = vi.fn();
    iniciarLaco(passo);
    quadros.rodar(0);
    ocultar(true);
    expect(quadros.pendente()).toBe(false);
    ocultar(false);
    quadros.rodar(60_000);
    expect(passo).toHaveBeenLastCalledWith(0);
  });

  it('parar cancela o próximo quadro', () => {
    const quadros = quadrosManuais();
    const parar = iniciarLaco(vi.fn());
    parar();
    expect(quadros.pendente()).toBe(false);
  });
});
