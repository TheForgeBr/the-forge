import { describe, expect, it } from 'vitest';
import { fontesDoCss, problemasDasFontes } from './verificar-fontes.mjs';

const face = (familia, peso, arquivo, estilo = 'normal') =>
  `@font-face{font-family:"${familia}";font-style:${estilo};font-display:swap;` +
  `font-weight:${peso};src:url(/assets/${arquivo}) format("woff2"),` +
  `url(/assets/${arquivo.replace('woff2', 'woff')}) format("woff")}`;

describe('fontesDoCss', () => {
  it('lê família, peso, estilo e arquivos de cada @font-face', () => {
    const css = face(
      'Source Sans 3',
      400,
      'source-sans-3-latin-400-normal-a1B2.woff2',
    );
    expect(fontesDoCss(css)).toEqual([
      {
        face: 'Source Sans 3 400 normal',
        arquivos: [
          'source-sans-3-latin-400-normal-a1B2.woff2',
          'source-sans-3-latin-400-normal-a1B2.woff',
        ],
      },
    ]);
  });

  it('entende o nome escapado que o minificador pode gerar', () => {
    const css =
      '@font-face{font-family:Source Sans\\ 3;font-weight:600;src:url(/assets/source-sans-3-latin-600-normal-x.woff2)}';
    expect(fontesDoCss(css)[0].face).toBe('Source Sans 3 600 normal');
  });
});

describe('problemasDasFontes', () => {
  it('aceita só os pesos permitidos no subconjunto latino', () => {
    const css = [
      face('Cinzel', 600, 'cinzel-latin-600-normal-a.woff2'),
      face('Cinzel', 700, 'cinzel-latin-700-normal-b.woff2'),
      face('Source Sans 3', 400, 'source-sans-3-latin-400-normal-c.woff2'),
      face('Source Sans 3', 600, 'source-sans-3-latin-600-normal-d.woff2'),
      face('JetBrains Mono', 400, 'jetbrains-mono-latin-400-normal-e.woff2'),
    ].join('');
    expect(problemasDasFontes(fontesDoCss(css))).toEqual([]);
  });

  it.each([
    [
      'peso a mais',
      face('Cinzel', 900, 'cinzel-latin-900-normal-a.woff2'),
      'Cinzel 900 normal: peso ou estilo fora da lista permitida',
    ],
    [
      'itálico não usado',
      face(
        'Source Sans 3',
        400,
        'source-sans-3-latin-400-italic-a.woff2',
        'italic',
      ),
      'Source Sans 3 400 italic: peso ou estilo fora da lista permitida',
    ],
    [
      'subconjunto latin-ext',
      face('Cinzel', 600, 'cinzel-latin-ext-600-normal-a.woff2'),
      'Cinzel 600 normal: cinzel-latin-ext-600-normal-a.woff2 não é do subconjunto latino',
    ],
  ])('acusa %s', (_caso, css, problema) => {
    expect(problemasDasFontes(fontesDoCss(css))).toContain(problema);
  });
});
