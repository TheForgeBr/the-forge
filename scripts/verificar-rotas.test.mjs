import { describe, expect, it } from 'vitest';
import { problemasDoHtml } from './verificar-rotas.mjs';

const valido =
  '<!DOCTYPE html><html lang="pt-BR"><head><title>The Forge BR</title></head>' +
  '<body><main><h1>olá forja</h1></main></body></html>';

describe('problemasDoHtml', () => {
  it('aceita uma página com lang, title e h1', () => {
    expect(problemasDoHtml(valido)).toEqual([]);
  });

  it.each([
    ['sem lang', valido.replace(' lang="pt-BR"', ''), 'sem lang no <html>'],
    ['title vazio', valido.replace('The Forge BR', ''), 'sem <title>'],
    ['sem h1', valido.replace(/<h1>.*<\/h1>/, ''), 'sem <h1>'],
  ])('acusa página %s', (_caso, html, problema) => {
    expect(problemasDoHtml(html)).toContain(problema);
  });
});
