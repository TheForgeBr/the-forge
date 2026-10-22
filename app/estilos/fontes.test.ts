import { describe, expect, it } from 'vitest';
import { linksDasFontes } from './fontes';

describe('linksDasFontes', () => {
  it('pré-carrega só o texto principal e o título da Home, em woff2', () => {
    const links = linksDasFontes();
    expect(links.map((l) => l.href)).toEqual([
      expect.stringContaining('source-sans-3-latin-400-normal'),
      expect.stringContaining('cinzel-latin-700-normal'),
    ]);
    for (const link of links)
      expect(link).toMatchObject({
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      });
  });
});
