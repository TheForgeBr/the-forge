import { describe, expect, it } from 'vitest';
import {
  OPACIDADE_MAXIMA,
  avancarFogo,
  criarCampo,
  paletaDoFogo,
} from './chamas';
import { intensidadeDoFogo } from './intensidade';

const meio = () => 0.5;

describe('intensidadeDoFogo', () => {
  it('é maior na Home e em Contato e discreta em Posts', () => {
    const home = intensidadeDoFogo('home');
    const contato = intensidadeDoFogo('contato');
    const posts = intensidadeDoFogo('posts');
    for (const sala of ['projetos', 'experiencias', 'sobre'] as const) {
      expect(home).toBeGreaterThan(intensidadeDoFogo(sala));
      expect(contato).toBeGreaterThan(intensidadeDoFogo(sala));
      expect(intensidadeDoFogo(sala)).toBeGreaterThan(posts);
    }
    expect(posts).toBeGreaterThan(0);
  });

  it('fora das salas (a 404), a forja está apagada', () => {
    expect(intensidadeDoFogo(undefined)).toBe(0);
  });
});

describe('avancarFogo', () => {
  it('com intensidade, o calor nasce embaixo e diminui ao subir', () => {
    const campo = criarCampo(16, 12);
    for (let i = 0; i < 30; i++) avancarFogo(campo, 1, meio);
    const linha = (y: number) => {
      let soma = 0;
      for (let x = 0; x < campo.largura; x++)
        soma += campo.calor[y * campo.largura + x]!;
      return soma;
    };
    expect(linha(campo.altura - 1)).toBeGreaterThan(0);
    expect(linha(campo.altura - 1)).toBeGreaterThan(linha(0));
  });

  it('sem intensidade, o fogo esfria até apagar, no mesmo buffer', () => {
    const campo = criarCampo(16, 12);
    const buffer = campo.calor;
    for (let i = 0; i < 30; i++) avancarFogo(campo, 1, meio);
    for (let i = 0; i < 60; i++) avancarFogo(campo, 0, meio);
    expect(campo.calor).toBe(buffer);
    expect(Math.max(...campo.calor)).toBe(0);
  });
});

describe('paletaDoFogo', () => {
  it('frio é transparente e quente usa a última cor dos tokens', () => {
    const paleta = paletaDoFogo(['#D9381E', '#E8661E', '#F6A43A']);
    expect(paleta).toHaveLength(256 * 4);
    expect(paleta[3]).toBe(0);
    expect([...paleta.slice(255 * 4, 255 * 4 + 3)]).toEqual([246, 164, 58]);
    expect(paleta[255 * 4 + 3]).toBeGreaterThan(0);
  });
});

describe('contraste sobre o fogo', () => {
  // A cor mais quente com a opacidade máxima, sobre o fundo fuligem.
  function misturar(frente: string, fundo: string, alfa: number) {
    const [a, b] = [frente, fundo].map((h) =>
      [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16)),
    );
    return `#${a!
      .map((c, i) => Math.round(c * alfa + b![i]! * (1 - alfa)))
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  it('o texto pergaminho mantém 4,5:1 sobre o ponto mais quente', async () => {
    const { contraste } = await import('../../scripts/contraste.mjs');
    const tokens = (await import('../../marca/tokens.json')).default as {
      cores: Record<string, string>;
    };
    const { cores } = tokens;
    const fundo = misturar(
      cores['ouro-forja']!,
      cores['fuligem']!,
      OPACIDADE_MAXIMA,
    );
    expect(contraste(cores['pergaminho']!, fundo)).toBeGreaterThanOrEqual(4.5);
  });
});
