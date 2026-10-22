import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  arquivosDosCartoes,
  carregarFontesDoCartao,
  escaparXml,
  quebrarLinhas,
  svgDoCartao,
} from './gerar-cartoes.mjs';

const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));
const fontes = carregarFontesDoCartao();
const rotulos = { 'estado.em-andamento': 'Em andamento' };

const projeto = {
  id: 'exemplo',
  titulo: { pt: 'A & B <C>', en: 'A & B <C>' },
  papel: { pt: 'Autor e desenvolvedor', en: 'Author and developer' },
  resumo: { pt: 'Resumo secreto do projeto', en: 'Secret summary' },
  stack: ['TypeScript', 'React'],
  estado: 'em-andamento',
  privacidade: 'completo',
  destaque: false,
};

describe('escaparXml', () => {
  it('escapa os caracteres especiais do XML', () => {
    expect(escaparXml(`a & b < c > d " e ' f`)).toBe(
      'a &amp; b &lt; c &gt; d &quot; e &apos; f',
    );
  });
});

describe('quebrarLinhas', () => {
  // Medida de mentira: cada caractere ocupa 1.
  const medir = (texto) => texto.length;

  it('quebra nas palavras dentro da largura', () => {
    expect(quebrarLinhas(medir, 'um dois tres quatro', 8, 3)).toEqual([
      'um dois',
      'tres',
      'quatro',
    ]);
  });

  it('corta com reticências quando passa do limite de linhas', () => {
    expect(quebrarLinhas(medir, 'um dois tres quatro', 8, 2)).toEqual([
      'um dois',
      'tres…',
    ]);
  });
});

describe('svgDoCartao', () => {
  const svg = svgDoCartao({
    projeto,
    idioma: 'pt',
    cores,
    fontes,
    rotulos,
  });

  it('tem tamanho fixo e texto escapado no título e na descrição', () => {
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 480 200"/);
    expect(svg).toContain('<title id="titulo">A &amp; B &lt;C&gt;</title>');
    expect(svg).toContain('Autor e desenvolvedor');
    expect(svg).not.toContain('<C>');
  });

  it('usa só cores dos tokens e nenhuma fonte, script ou link externo', () => {
    const permitidas = new Set(
      Object.values(cores).map((c) => c.toUpperCase()),
    );
    for (const [hex] of svg.matchAll(/#[0-9A-Fa-f]{6}\b/g))
      expect(permitidas, hex).toContain(hex.toUpperCase());
    expect(svg).not.toMatch(/<text|<script|<style|font-family|href=|@import/);
  });

  it('não mostra o resumo: o cartão leva só nome, papel, stack e estado', () => {
    expect(svg).not.toContain('Resumo secreto');
  });
});

describe('arquivosDosCartoes', () => {
  it('um cartão por projeto em cada idioma, e só eles', () => {
    const outro = { ...projeto, id: 'outro' };
    const arquivos = arquivosDosCartoes([projeto, outro], {
      cores,
      fontes,
      rotulos: { pt: rotulos, en: { 'estado.em-andamento': 'In progress' } },
    });
    expect(Object.keys(arquivos).sort()).toEqual([
      'public/cartoes/exemplo.en.svg',
      'public/cartoes/exemplo.svg',
      'public/cartoes/outro.en.svg',
      'public/cartoes/outro.svg',
    ]);
  });
});

describe('chips da stack', () => {
  it('stack longa cabe em duas linhas, com "+N" para o resto', () => {
    const longa = {
      ...projeto,
      stack: Array.from({ length: 30 }, (_, i) => `Tecnologia${i}`),
    };
    const svg = svgDoCartao({
      projeto: longa,
      idioma: 'pt',
      cores,
      fontes,
      rotulos,
    });
    const ys = new Set(
      [
        ...svg.matchAll(
          /<rect x="[\d.]+" y="(\d+)" width="[\d.]+" height="22"/g,
        ),
      ].map((m) => m[1]),
    );
    expect([...ys]).toEqual(['132', '160']);
    // A descrição acessível continua com a stack inteira.
    expect(svg).toContain('Tecnologia29');
  });
});

describe('cartões dos projetos reais', () => {
  it('nenhum caminho sai com NaN (defeito do opentype.js com floats como 324.6000000000001)', async () => {
    const { projetos } = await import('../app/conteudo/projetos.ts');
    const { pt } = await import('../app/i18n/pt.ts');
    const { en } = await import('../app/i18n/en.ts');
    const arquivos = arquivosDosCartoes(projetos, {
      cores,
      fontes,
      rotulos: { pt, en },
    });
    const comNaN = Object.entries(arquivos)
      .filter(([, svg]) => svg.includes('NaN'))
      .map(([arquivo]) => arquivo);
    expect(comNaN).toEqual([]);
  });
});
