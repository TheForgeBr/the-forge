import { describe, expect, it } from 'vitest';
import { SALAS } from './rotas.mjs';
import {
  esperadoDaRota,
  paginasEsperadas,
  problemasDoHtml,
} from './verificar-rotas.mjs';

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
    const { lang, alternativos } = esperadoDaRota(projetos, 'pt');
    expect(problemasDoHtml(valido, { lang, alternativos })).toEqual([]);
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

describe('HTML completo de uma sala (issue 3.7)', () => {
  const social =
    '<meta name="description" content="Projetos de Rhuan Marques."/>' +
    '<meta property="og:type" content="website"/>' +
    '<meta property="og:title" content="Projetos | The Forge BR"/>' +
    '<meta property="og:description" content="Projetos de Rhuan Marques."/>' +
    '<meta property="og:url" content="https://site.com/projetos"/>' +
    '<meta property="og:image" content="https://site.com/og/padrao.png"/>' +
    '<meta name="twitter:card" content="summary_large_image"/>';
  const completo = valido
    .replace('</head>', `${social}</head>`)
    .replace('<h1>Projetos</h1>', '<h1>Projetos</h1><p>Memento</p>');
  const esperado = esperadoDaRota(projetos, 'pt');

  it('aceita a sala com descrição, Open Graph e o texto-chave no <main>', () => {
    expect(problemasDoHtml(completo, esperado)).toEqual([]);
  });

  it.each([
    [
      'description',
      /<meta name="description"[^>]*>/,
      'sem <meta name="description">',
    ],
    [
      'og:title',
      /<meta property="og:title"[^>]*>/,
      'sem <meta property="og:title">',
    ],
    [
      'og:image',
      /<meta property="og:image"[^>]*>/,
      'sem <meta property="og:image">',
    ],
    [
      'twitter:card',
      /<meta name="twitter:card"[^>]*>/,
      'sem <meta name="twitter:card">',
    ],
  ])('acusa a sala sem %s', (_caso, tag, problema) => {
    expect(problemasDoHtml(completo.replace(tag, ''), esperado)).toContain(
      problema,
    );
  });

  it('acusa meta com content vazio', () => {
    const vazio = completo.replace(
      'content="Projetos de Rhuan Marques."/><meta property="og:type"',
      'content=""/><meta property="og:type"',
    );
    expect(problemasDoHtml(vazio, esperado)).toContain(
      'sem <meta name="description">',
    );
  });

  it('acusa <title> ou <h1> repetidos', () => {
    const doisTitulos = completo.replace(
      '</head>',
      '<title>Outro</title></head>',
    );
    const doisH1 = completo.replace('<p>Memento</p>', '<h1>Outro</h1>');
    expect(problemasDoHtml(doisTitulos, esperado)).toContain(
      '2 <title>, esperado 1',
    );
    expect(problemasDoHtml(doisH1, esperado)).toContain('2 <h1>, esperado 1');
  });

  it('acusa o conteúdo da sala fora do HTML', () => {
    const semConteudo = completo.replace('<p>Memento</p>', '');
    expect(problemasDoHtml(semConteudo, esperado)).toContain(
      'texto-chave "Memento" fora do <main>',
    );
  });

  it('acusa o texto provisório "olá forja"', () => {
    const provisorio = completo.replace(
      '<p>Memento</p>',
      '<p>Memento</p><p>Olá forja</p>',
    );
    expect(problemasDoHtml(provisorio, esperado)).toContain(
      'texto provisório "olá forja"',
    );
  });
});

describe('texto-chave', () => {
  it('cada sala tem um texto-chave', () => {
    for (const sala of SALAS)
      expect(esperadoDaRota(sala, 'pt').textoChave, sala.sala).toMatch(/\w/);
  });
});

describe('paginasEsperadas', () => {
  it('é a mesma lista do prerender: nenhuma rota escapa da verificação', async () => {
    const { default: config } = await import('../react-router.config');
    expect(
      paginasEsperadas()
        .map((p) => p.rota)
        .sort(),
    ).toEqual([...config.prerender].sort());
  });
});
