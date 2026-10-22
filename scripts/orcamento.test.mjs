import zlib from 'node:zlib';
import { describe, expect, it } from 'vitest';
import {
  arquivosDaPrimeiraCarga,
  avaliarOrcamento,
  tamanhoGzip,
} from './orcamento.mjs';

const build = {
  '/assets/entry.client-a.js':
    'import{j as e}from"./jsx-runtime-b.js";import"./chunk-c.js";',
  '/assets/jsx-runtime-b.js': 'export const j=1;',
  '/assets/chunk-c.js': 'import"./jsx-runtime-b.js";export{}',
  '/assets/home-d.js': 'import{j}from"./jsx-runtime-b.js";',
  '/assets/sem-uso-e.js': 'console.log("nunca carregado")',
};
const ler = (url) => build[url];

const html =
  '<link rel="modulepreload" href="/assets/entry.client-a.js"/>' +
  '<script type="module">import("/assets/home-d.js");</script>';

describe('arquivosDaPrimeiraCarga', () => {
  it('junta os JS do HTML e os imports estáticos de cada um, sem repetir', () => {
    expect(arquivosDaPrimeiraCarga(html, ler).sort()).toEqual([
      '/assets/chunk-c.js',
      '/assets/entry.client-a.js',
      '/assets/home-d.js',
      '/assets/jsx-runtime-b.js',
    ]);
  });
});

describe('tamanhoGzip', () => {
  it('mede o conteúdo comprimido, não o original', () => {
    const repetido = 'a'.repeat(10_000);
    expect(tamanhoGzip(repetido)).toBe(
      zlib.gzipSync(repetido, { level: 9 }).length,
    );
    expect(tamanhoGzip(repetido)).toBeLessThan(200);
  });
});

describe('avaliarOrcamento', () => {
  const tamanhos = [
    { url: '/assets/pequeno.js', bytes: 10 * 1024 },
    { url: '/assets/grande.js', bytes: 100 * 1024 },
  ];

  it('passa no limite exato e ordena os maiores primeiro', () => {
    const r = avaliarOrcamento(tamanhos, 110);
    expect(r.total).toBe(110 * 1024);
    expect(r.estourou).toBe(false);
    expect(r.maiores.map((t) => t.url)).toEqual([
      '/assets/grande.js',
      '/assets/pequeno.js',
    ]);
  });

  it('estoura com um byte acima do limite', () => {
    const r = avaliarOrcamento(
      [...tamanhos, { url: '/assets/a-mais.js', bytes: 1 }],
      110,
    );
    expect(r.estourou).toBe(true);
  });
});
