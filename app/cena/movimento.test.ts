import { act, renderHook } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMovimentoReduzido } from './movimento';

// matchMedia de mentira, com o estado e os ouvintes à mão do teste.
function sistemaCom(reduzido: boolean) {
  const ouvintes = new Set<() => void>();
  const mq = {
    matches: reduzido,
    addEventListener: (_: string, f: () => void) => ouvintes.add(f),
    removeEventListener: (_: string, f: () => void) => ouvintes.delete(f),
  };
  vi.stubGlobal('matchMedia', () => mq);
  return {
    mudar(valor: boolean) {
      mq.matches = valor;
      ouvintes.forEach((f) => f());
    },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('useMovimentoReduzido', () => {
  it.each([true, false])('lê o sistema com reduzir movimento = %s', (v) => {
    sistemaCom(v);
    expect(renderHook(() => useMovimentoReduzido()).result.current).toBe(v);
  });

  it('reage quando a pessoa muda a configuração com a página aberta', () => {
    const sistema = sistemaCom(false);
    const { result } = renderHook(() => useMovimentoReduzido());
    expect(result.current).toBe(false);
    act(() => sistema.mudar(true));
    expect(result.current).toBe(true);
  });

  it('sem matchMedia (navegador antigo), considera movimento normal', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(renderHook(() => useMovimentoReduzido()).result.current).toBe(false);
  });
});

// A regra só vale se nenhuma animação contornar o utilitário.
function arquivos(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const caminho = path.join(dir, e.name);
    if (e.isDirectory()) return arquivos(caminho);
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)
      ? [caminho]
      : [];
  });
}

describe('uso do Motion', () => {
  it('só app/cena/movimento.ts importa o Motion', () => {
    const diretos = arquivos('app')
      .filter((f) =>
        /from\s+['"](motion|framer-motion)(\/[^'"]*)?['"]/.test(
          fs.readFileSync(f, 'utf8'),
        ),
      )
      .map((f) => f.split(path.sep).join('/'));
    expect(diretos).toEqual(['app/cena/movimento.ts']);
  });
});
