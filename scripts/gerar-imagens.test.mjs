import { describe, expect, it } from 'vitest';
import { LIMITE, TAMANHOS, qualidadeQueCabe } from './gerar-imagens.mjs';

// Codificador de mentira: o tamanho cresce com a qualidade.
const codificar = async (q) => new Uint8Array(q * 1000);

describe('qualidadeQueCabe', () => {
  it('fica com a maior qualidade que cabe no limite', async () => {
    const achado = await qualidadeQueCabe(codificar, 52_000);
    expect(achado?.qualidade).toBe(50);
    expect(achado?.dados.length).toBe(50_000);
  });

  it('não baixa à toa quando a primeira já cabe', async () => {
    expect((await qualidadeQueCabe(codificar, 1_000_000))?.qualidade).toBe(70);
  });

  it('devolve null se nem a qualidade mínima couber', async () => {
    expect(await qualidadeQueCabe(codificar, 10_000)).toBeNull();
  });
});

describe('tamanhos', () => {
  it('celular em pé, desktop deitado, e o limite de 150 KB', () => {
    expect(TAMANHOS.celular.altura).toBeGreaterThan(TAMANHOS.celular.largura);
    expect(TAMANHOS.desktop.largura).toBeGreaterThan(TAMANHOS.desktop.altura);
    expect(LIMITE).toBe(150 * 1024);
  });
});
