import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ATRASO,
  CHAVE_VISITA,
  CORPO_DO_SCRIPT,
  SCRIPT_DO_CARREGAMENTO,
  TRAVA,
  marcarPronto,
  type JanelaDoCarregamento,
} from './carregamento';

// Janela de mentira: o <html> é um objeto com atributos, o armazenamento
// pode estar cheio, vazio ou bloqueado.
function janela({
  visitou = false,
  bloqueado = false,
}: { visitou?: boolean; bloqueado?: boolean } = {}) {
  const atributos = new Set<string>();
  const guardado = new Map<string, string>(
    visitou ? [[CHAVE_VISITA, '1']] : [],
  );
  const armazenamento = {
    getItem: (k: string) => {
      if (bloqueado) throw new Error('bloqueado');
      return guardado.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (bloqueado) throw new Error('bloqueado');
      guardado.set(k, v);
    },
  };
  const j = {
    document: {
      documentElement: {
        setAttribute: (n: string) => atributos.add(n),
        removeAttribute: (n: string) => atributos.delete(n),
      },
    },
    localStorage: armazenamento,
    setTimeout: (f: () => void, ms: number) => setTimeout(f, ms),
  } as unknown as JanelaDoCarregamento;
  return { j, mostrando: () => atributos.has('data-carregando'), guardado };
}

afterEach(() => vi.useRealTimers());

// Executa o mesmo texto que vai inline no <head>.
const iniciarCarregamento = (j: JanelaDoCarregamento) =>
  new Function('window', CORPO_DO_SCRIPT)(j) as void;

describe('carregamento (issue 6.4)', () => {
  it('primeira visita e carga lenta: a tela aparece depois de 300 ms', () => {
    vi.useFakeTimers();
    const { j, mostrando } = janela();
    iniciarCarregamento(j);
    vi.advanceTimersByTime(ATRASO - 1);
    expect(mostrando()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(mostrando()).toBe(true);
    // Pronto: some na hora e marca a visita.
    marcarPronto(j);
    expect(mostrando()).toBe(false);
  });

  it('carga rápida: pronto antes dos 300 ms, a tela nunca aparece', () => {
    vi.useFakeTimers();
    const { j, mostrando, guardado } = janela();
    iniciarCarregamento(j);
    vi.advanceTimersByTime(100);
    marcarPronto(j);
    vi.advanceTimersByTime(TRAVA);
    expect(mostrando()).toBe(false);
    expect(guardado.get(CHAVE_VISITA)).toBe('1');
  });

  it('segunda visita: não mostra, mesmo com carga lenta', () => {
    vi.useFakeTimers();
    const { j, mostrando } = janela({ visitou: true });
    iniciarCarregamento(j);
    vi.advanceTimersByTime(ATRASO * 3);
    expect(mostrando()).toBe(false);
  });

  it('localStorage bloqueado: não quebra e trata como primeira visita', () => {
    vi.useFakeTimers();
    const { j, mostrando } = janela({ bloqueado: true });
    expect(() => iniciarCarregamento(j)).not.toThrow();
    vi.advanceTimersByTime(ATRASO);
    expect(mostrando()).toBe(true);
    expect(() => marcarPronto(j)).not.toThrow();
    expect(mostrando()).toBe(false);
  });

  it('nunca fica preso: a trava tira a tela mesmo se o JS não terminar', () => {
    vi.useFakeTimers();
    const { j, mostrando } = janela();
    iniciarCarregamento(j);
    vi.advanceTimersByTime(ATRASO);
    expect(mostrando()).toBe(true);
    vi.advanceTimersByTime(TRAVA);
    expect(mostrando()).toBe(false);
  });

  it('o script do <head> chama o mesmo corpo com a janela', () => {
    expect(SCRIPT_DO_CARREGAMENTO).toBe(
      `(function(window){${CORPO_DO_SCRIPT}})(window);`,
    );
  });
});
