import { describe, expect, it } from 'vitest';
import { metaDaSala, URL_BASE } from './site';

describe('metaDaSala', () => {
  it('monta título, descrição e hreflang da sala no idioma da rota', () => {
    expect(metaDaSala('projetos', '/en/projects')).toEqual([
      { title: 'Projects | The Forge BR' },
      { name: 'description', content: 'Projects by Rhuan Marques.' },
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

  it('usa só o nome do site como título da Home', () => {
    expect(metaDaSala('home', '/')[0]).toEqual({ title: 'The Forge BR' });
    expect(metaDaSala('home', '/en')[2]).toMatchObject({
      href: `${URL_BASE}/`,
    });
  });
});
