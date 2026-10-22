import { describe, expect, it } from 'vitest';
import { gerarRobots, gerarSitemap, paginasDoSitemap } from './sitemap.mjs';

const BASE = 'https://forja.test';

function xml(texto) {
  const doc = new globalThis.DOMParser().parseFromString(
    texto,
    'application/xml',
  );
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return doc;
}

const locs = (doc) =>
  [...doc.getElementsByTagName('loc')].map((l) => l.textContent);

describe('sitemap', () => {
  it('sem posts, lista as 6 salas nos dois idiomas e deixa a 404 de fora', () => {
    const doc = xml(gerarSitemap(paginasDoSitemap([]), BASE));
    const todas = locs(doc);
    expect(todas).toHaveLength(12);
    expect(todas).toContain(`${BASE}/`);
    expect(todas).toContain(`${BASE}/en/projects`);
    expect(todas.some((l) => l.includes('404'))).toBe(false);
  });

  it('cada sala aponta o par de idiomas e o x-default em português', () => {
    const doc = xml(gerarSitemap(paginasDoSitemap([]), BASE));
    const url = [...doc.getElementsByTagName('url')].find(
      (u) =>
        u.getElementsByTagName('loc')[0]?.textContent === `${BASE}/en/about`,
    );
    const links = [
      ...(url?.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link') ??
        []),
    ].map((l) => `${l.getAttribute('hreflang')} ${l.getAttribute('href')}`);
    expect(links).toEqual([
      `pt-BR ${BASE}/sobre`,
      `en ${BASE}/en/about`,
      `x-default ${BASE}/sobre`,
    ]);
  });

  it('posts entram com lastmod; hreflang só com tradução', () => {
    const posts = [
      {
        idioma: 'pt',
        caminho: '/posts/a',
        data: '2026-10-22',
        traducao: '/en/posts/a',
      },
      { idioma: 'pt', caminho: '/posts/b', data: '2026-10-01' },
    ];
    const texto = gerarSitemap(paginasDoSitemap(posts), BASE);
    const doc = xml(texto);
    expect(locs(doc)).toHaveLength(14);
    const doPost = (loc) =>
      [...doc.getElementsByTagName('url')].find(
        (u) => u.getElementsByTagName('loc')[0]?.textContent === loc,
      );
    const a = doPost(`${BASE}/posts/a`);
    expect(a?.getElementsByTagName('lastmod')[0]?.textContent).toBe(
      '2026-10-22',
    );
    expect(texto).toContain(`hreflang="en" href="${BASE}/en/posts/a"`);
    const b = doPost(`${BASE}/posts/b`);
    expect(
      b?.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link'),
    ).toHaveLength(0);
  });

  it('o robots.txt aponta para o sitemap', () => {
    expect(gerarRobots(BASE)).toContain(`Sitemap: ${BASE}/sitemap.xml`);
  });
});
