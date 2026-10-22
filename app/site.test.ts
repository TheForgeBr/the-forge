import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { IMAGEM_OG, metaDaSala, URL_BASE } from './site';

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
    const links = meta.filter((m) => 'tagName' in m);
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

  it('a imagem de compartilhamento existe em public/', () => {
    expect(fs.existsSync(`public${IMAGEM_OG.caminho}`)).toBe(true);
  });
});
