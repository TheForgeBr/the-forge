import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { carregarFontesDoCartao } from './gerar-cartoes.mjs';
import { arquivosDoBanner, svgDoBanner } from './gerar-banner.mjs';

const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));
const fontes = carregarFontesDoCartao();
// Fundo de mentira: alguns bytes, para não depender do arquivo real.
const fundo = Buffer.from('fundo de teste');
const textos = {
  nome: 'Rhuan & <Marques>',
  cargo: 'Desenvolvedor full-stack',
  frase: 'Aplicações completas com agentes de IA, da especificação ao teste.',
};

describe('svgDoBanner', () => {
  const svg = svgDoBanner({ textos, cores, fontes, fundo });

  it('tem a proporção de README, 1280 x 320', () => {
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 1280 320"/);
  });

  it('usa só cores dos tokens', () => {
    const permitidas = new Set(
      Object.values(cores).map((c) => c.toUpperCase()),
    );
    for (const [hex] of svg.matchAll(/#[0-9A-Fa-f]{6}\b/g))
      expect(permitidas, hex).toContain(hex.toUpperCase());
  });

  it('não depende de nada externo: sem texto, fonte, script ou link que não seja data:', () => {
    expect(svg).not.toMatch(/<text|<script|<style|font-family|@import/);
    for (const [, href] of svg.matchAll(/href="([^"]+)"/g))
      expect(href.startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(svg).toContain(fundo.toString('base64'));
  });

  it('título e descrição acessíveis, com o texto escapado', () => {
    expect(svg).toContain(
      '<title id="titulo">Rhuan &amp; &lt;Marques&gt;</title>',
    );
    expect(svg).toContain('Desenvolvedor full-stack');
  });
});

describe('arquivosDoBanner', () => {
  it('um banner em português e outro em inglês', () => {
    const arquivos = arquivosDoBanner({
      cores,
      fontes,
      fundo,
      textos: { pt: textos, en: { ...textos, cargo: 'Full-stack developer' } },
    });
    expect(Object.keys(arquivos).sort()).toEqual([
      'public/banner/banner.en.svg',
      'public/banner/banner.svg',
    ]);
    expect(arquivos['public/banner/banner.en.svg']).toContain(
      'Full-stack developer',
    );
  });
});
