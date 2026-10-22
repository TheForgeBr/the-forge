import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { IMAGEM_OG, metaDaSala, metaDoPost, URL_BASE } from './site';

type Meta = ReturnType<typeof metaDaSala>[number];
const conteudo = (meta: Meta[], chave: string) =>
  (
    meta.find(
      (m) =>
        ('property' in m && m.property === chave) ||
        ('name' in m && m.name === chave),
    ) as { content?: string } | undefined
  )?.content;

describe('metaDaSala', () => {
  const meta = metaDaSala('projetos', '/en/projects');

  it('monta título e descrição da sala no idioma da rota', () => {
    expect(meta[0]).toEqual({ title: 'Projects | The Forge BR' });
    expect(conteudo(meta, 'description')).toBe('Projects by Rhuan Marques.');
  });

  it('aponta a canônica e o hreflang dos dois idiomas', () => {
    // O link do feed tem teste próprio, abaixo.
    const links = meta.filter((m) => 'tagName' in m && !('type' in m));
    expect(links).toEqual([
      { tagName: 'link', rel: 'canonical', href: `${URL_BASE}/en/projects` },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'pt-BR',
        href: `${URL_BASE}/projetos`,
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'en',
        href: `${URL_BASE}/en/projects`,
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'x-default',
        href: `${URL_BASE}/projetos`,
      },
    ]);
  });

  it('tem Open Graph e Twitter completos, com a imagem de 1200 x 630', () => {
    expect(conteudo(meta, 'og:title')).toBe('Projects | The Forge BR');
    expect(conteudo(meta, 'og:description')).toBe('Projects by Rhuan Marques.');
    expect(conteudo(meta, 'og:type')).toBe('website');
    expect(conteudo(meta, 'og:url')).toBe(`${URL_BASE}/en/projects`);
    expect(conteudo(meta, 'og:locale')).toBe('en_US');
    expect(conteudo(meta, 'og:locale:alternate')).toBe('pt_BR');
    expect(conteudo(meta, 'og:image')).toBe(`${URL_BASE}/og/padrao.png`);
    expect(conteudo(meta, 'og:image:width')).toBe('1200');
    expect(conteudo(meta, 'og:image:height')).toBe('630');
    expect(conteudo(meta, 'twitter:card')).toBe('summary_large_image');
  });

  it('usa só o nome do site como título da Home', () => {
    const home = metaDaSala('home', '/');
    expect(home[0]).toEqual({ title: 'The Forge BR' });
    expect(conteudo(home, 'og:locale')).toBe('pt_BR');
    expect(conteudo(home, 'og:url')).toBe(`${URL_BASE}/`);
  });

  it('anuncia o feed RSS do idioma da página', () => {
    const feed = (caminho: string) =>
      metaDaSala('home', caminho).find(
        (m) => 'type' in m && m.type === 'application/rss+xml',
      );
    expect(feed('/')).toMatchObject({
      rel: 'alternate',
      href: `${URL_BASE}/rss.xml`,
      title: 'Posts | The Forge BR',
    });
    expect(feed('/en')).toMatchObject({ href: `${URL_BASE}/en/rss.xml` });
  });

  it('a imagem de compartilhamento existe em public/', () => {
    expect(fs.existsSync(`public${IMAGEM_OG.caminho}`)).toBe(true);
  });
});

describe('metaDoPost', () => {
  const post = {
    titulo: 'Por que The Forge',
    resumo: 'O nome e a ideia.',
    data: '2026-10-22',
    tags: ['TypeScript', 'React'],
    caminho: '/posts/por-que',
  };
  const hreflangs = (meta: Meta[]) =>
    meta.filter((m) => 'hrefLang' in m).map((m) => ('href' in m ? m.href : ''));

  it('é um artigo com título, descrição, canônica e data de publicação', () => {
    const meta = metaDoPost(post);
    expect(meta[0]).toEqual({ title: 'Por que The Forge | The Forge BR' });
    expect(conteudo(meta, 'description')).toBe('O nome e a ideia.');
    expect(conteudo(meta, 'og:type')).toBe('article');
    expect(conteudo(meta, 'og:url')).toBe(`${URL_BASE}/posts/por-que`);
    expect(conteudo(meta, 'article:published_time')).toBe('2026-10-22');
    expect(
      meta.filter((m) => 'property' in m && m.property === 'article:tag'),
    ).toHaveLength(2);
  });

  it('só aponta hreflang quando o post tem tradução', () => {
    expect(hreflangs(metaDoPost(post))).toEqual([]);
    expect(hreflangs(metaDoPost(post, '/en/posts/por-que'))).toEqual([
      `${URL_BASE}/posts/por-que`,
      `${URL_BASE}/en/posts/por-que`,
      `${URL_BASE}/posts/por-que`,
    ]);
  });
});
