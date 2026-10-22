import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  arquivosDoLogo,
  caminhoDoTexto,
  carregarFontes,
} from './gerar-logo.mjs';

const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));
const fontes = carregarFontes();
const arquivos = arquivosDoLogo(cores, fontes);
const coresDoSvg = (svg) =>
  new Set(
    [...svg.matchAll(/#[0-9A-Fa-f]{3,6}\b/g)].map(([c]) => c.toUpperCase()),
  );

describe('caminhoDoTexto', () => {
  it('desenha o texto como caminho e avança da esquerda para a direita', () => {
    const { d, fim } = caminhoDoTexto(fontes[700], 'THE', 10, 50, 34, 2);
    expect(d).toMatch(/^M[\d.-]+ [\d.-]+/);
    expect(fim).toBeGreaterThan(10);
  });

  it('o espaçamento entre letras alarga o texto', () => {
    const junto = caminhoDoTexto(fontes[700], 'FORGE', 0, 0, 34, 0).fim;
    const solto = caminhoDoTexto(fontes[700], 'FORGE', 0, 0, 34, 2).fim;
    expect(solto - junto).toBeCloseTo(8, 5);
  });
});

describe.each(Object.keys(arquivos).filter((a) => a.endsWith('.svg')))(
  '%s',
  (arquivo) => {
    const svg = arquivos[arquivo];

    it('tem <title>, viewBox e nenhum texto que dependa de fonte', () => {
      expect(svg).toMatch(/<title id="titulo">The Forge BR<\/title>/);
      expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
      expect(svg).not.toMatch(/<text[\s>]|font-family/);
    });

    it('usa só cores da paleta', () => {
      const paleta = new Set(Object.values(cores).map((c) => c.toUpperCase()));
      expect([...coresDoSvg(svg)].filter((c) => !paleta.has(c))).toEqual([]);
    });
  },
);

// Largura e altura ficam nos bytes 16 a 23 do cabeçalho IHDR do PNG.
const dimensoes = (png) => [png.readUInt32BE(16), png.readUInt32BE(20)];

describe('PNG de ícone e Open Graph', () => {
  it.each([
    ['public/favicon-32.png', 32, 32],
    ['public/apple-touch-icon.png', 180, 180],
    ['public/og/padrao.png', 1200, 630],
  ])('%s tem %i x %i', (arquivo, largura, altura) => {
    const png = arquivos[arquivo];
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(dimensoes(png)).toEqual([largura, altura]);
  });
});

describe('versões para fundo escuro e claro', () => {
  it('o logo escuro usa ouro-forja e pergaminho', () => {
    expect(coresDoSvg(arquivos['marca/logo.svg'])).toEqual(
      new Set([cores['ouro-forja'], cores.pergaminho]),
    );
  });

  it('o logo claro usa fuligem e brasa', () => {
    expect(coresDoSvg(arquivos['marca/logo-claro.svg'])).toEqual(
      new Set([cores.fuligem, cores.brasa]),
    );
  });

  it('o favicon troca de cores com o tema do navegador', () => {
    expect(arquivos['public/favicon.svg']).toContain(
      '@media (prefers-color-scheme: dark)',
    );
  });
});
