import { describe, expect, it } from 'vitest';
import { dataRfc822, gerarRss, urlBase } from './rss.mjs';

const BASE = 'https://forja.test';

function post(slug, data, extra = {}) {
  return {
    slug,
    titulo: `Post ${slug}`,
    data,
    resumo: `Resumo de ${slug}`,
    idioma: 'pt',
    tags: [],
    caminho: `/posts/${slug}`,
    ...extra,
  };
}

// O DOMParser do jsdom acusa XML malformado com um <parsererror>.
function xml(texto) {
  const doc = new globalThis.DOMParser().parseFromString(
    texto,
    'application/xml',
  );
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return doc;
}

describe('gerarRss', () => {
  it('sem posts, gera um feed válido e vazio', () => {
    const doc = xml(gerarRss({ posts: [], idioma: 'pt', base: BASE }));
    expect(doc.querySelector('channel > title')?.textContent).toBe(
      'Posts | The Forge BR',
    );
    expect(doc.querySelector('channel > link')?.textContent).toBe(
      `${BASE}/posts`,
    );
    expect(doc.querySelector('channel > language')?.textContent).toBe('pt-BR');
    expect(doc.querySelectorAll('item')).toHaveLength(0);
  });

  it('um item por post do idioma, com link absoluto, guid e data', () => {
    const posts = [
      post('b', '2026-10-22', { tags: ['TypeScript'] }),
      post('a', '2026-01-05'),
      post('c', '2026-03-01', { idioma: 'en', caminho: '/en/posts/c' }),
    ];
    const doc = xml(gerarRss({ posts, idioma: 'pt', base: BASE }));
    const itens = [...doc.querySelectorAll('item')];
    expect(itens).toHaveLength(2);
    expect(itens[0]?.querySelector('link')?.textContent).toBe(
      `${BASE}/posts/b`,
    );
    expect(itens[0]?.querySelector('guid')?.textContent).toBe(
      `${BASE}/posts/b`,
    );
    expect(itens[0]?.querySelector('pubDate')?.textContent).toBe(
      'Thu, 22 Oct 2026 00:00:00 GMT',
    );
    expect(itens[0]?.querySelector('category')?.textContent).toBe('TypeScript');
    const en = xml(gerarRss({ posts, idioma: 'en', base: BASE }));
    expect(en.querySelectorAll('item')).toHaveLength(1);
    expect(en.querySelector('channel > link')?.textContent).toBe(
      `${BASE}/en/posts`,
    );
  });

  it('escapa & e < no título e no resumo', () => {
    const texto = gerarRss({
      posts: [post('x', '2026-10-22', { titulo: 'A & B', resumo: 'a < b' })],
      idioma: 'pt',
      base: BASE,
    });
    expect(texto).toContain('<title>A &amp; B</title>');
    expect(texto).toContain('<description>a &lt; b</description>');
    expect(xml(texto).querySelector('item title')?.textContent).toBe('A & B');
  });
});

describe('apoio', () => {
  it('data no formato RFC 822', () => {
    expect(dataRfc822('2026-01-05')).toBe('Mon, 05 Jan 2026 00:00:00 GMT');
  });

  it('URL base da variável de build, sem barra no fim', () => {
    expect(urlBase({ VITE_URL_BASE: 'https://x.dev/' })).toBe('https://x.dev');
    expect(urlBase({})).toBe('https://the-forge-96d7.onrender.com');
  });
});
