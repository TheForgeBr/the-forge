import { describe, expect, it } from 'vitest';
import { esperadoDaRota, problemasDoHtml } from './verificar-rotas.mjs';

const valido =
  '<!DOCTYPE html><html lang="pt-BR"><head><title>The Forge BR</title>' +
  '<link rel="alternate" hrefLang="pt-BR" href="https://site.com/projetos"/>' +
  '<link rel="alternate" hrefLang="en" href="https://site.com/en/projects"/>' +
  '<link rel="alternate" hrefLang="x-default" href="https://site.com/projetos"/>' +
  '</head><body><main><h1>Projetos</h1></main></body></html>';

const projetos = { sala: 'projetos', pt: '/projetos', en: '/en/projects' };

describe('problemasDoHtml', () => {
  it('aceita uma página com lang, title e h1', () => {
    expect(problemasDoHtml(valido)).toEqual([]);
  });

  it('aceita a sala com o lang e os hreflang esperados', () => {
    expect(problemasDoHtml(valido, esperadoDaRota(projetos, 'pt'))).toEqual([]);
  });

  it.each([
    ['sem lang', valido.replace(' lang="pt-BR"', ''), 'sem lang no <html>'],
    ['title vazio', valido.replace('The Forge BR', ''), 'sem <title>'],
    ['sem h1', valido.replace(/<h1>.*<\/h1>/, ''), 'sem <h1>'],
  ])('acusa página %s', (_caso, html, problema) => {
    expect(problemasDoHtml(html)).toContain(problema);
  });

  it('acusa lang do idioma errado', () => {
    expect(problemasDoHtml(valido, esperadoDaRota(projetos, 'en'))).toContain(
      'lang="pt-BR" no <html>, esperado "en"',
    );
  });

  it('acusa hreflang que falta ou aponta para a sala errada', () => {
    const semIngles = valido.replace(/<link[^>]*hrefLang="en"[^>]*>/, '');
    const salaErrada = valido.replace('/en/projects', '/en/about');
    const problema =
      'sem <link rel="alternate" hreflang="en"> para /en/projects';
    expect(
      problemasDoHtml(semIngles, esperadoDaRota(projetos, 'pt')),
    ).toContain(problema);
    expect(
      problemasDoHtml(salaErrada, esperadoDaRota(projetos, 'pt')),
    ).toContain(problema);
  });
});

describe('páginas 404', () => {
  const pagina404 = valido.replace(
    '</head>',
    '<meta name="robots" content="noindex"/></head>',
  );

  it('aceita a 404 com noindex', () => {
    expect(problemasDoHtml(pagina404, { noindex: true })).toEqual([]);
  });

  it('acusa a 404 sem noindex', () => {
    expect(problemasDoHtml(valido, { noindex: true })).toContain(
      'sem <meta name="robots" content="noindex">',
    );
  });
});
