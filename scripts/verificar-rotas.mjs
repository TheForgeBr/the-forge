// Confere o HTML pré-renderizado em build/client (issues 0.3 e 3.7): cada rota
// precisa existir, ter lang, um <title> e um <h1>, descrição e Open Graph,
// apontar para a mesma sala no outro idioma com hreflang (ADR 0008) e trazer o
// conteúdo da sala no próprio HTML, para ser lida sem JavaScript. As rotas vêm
// de scripts/rotas.mjs, a mesma lista do prerender: uma rota nova não escapa.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGINAS_404, SALAS } from './rotas.mjs';

const LANG = { pt: 'pt-BR', en: 'en' };

/**
 * Texto que só existe no HTML se o conteúdo da sala foi pré-renderizado. É o
 * mesmo nos dois idiomas (nomes próprios e de tecnologias).
 */
const TEXTO_CHAVE = {
  home: 'Rhuan Marques',
  projetos: 'Memento',
  experiencias: 'SETA-AI',
  sobre: 'TypeScript',
  posts: 'Posts',
  contato: 'WhatsApp',
};

/** Metas que toda sala precisa para aparecer bem em buscas e no LinkedIn. */
const METAS_SOCIAIS = [
  ['name', 'description'],
  ['property', 'og:type'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:url'],
  ['property', 'og:image'],
  ['name', 'twitter:card'],
];

function temAlternativo(html, hreflang, caminho) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].some(([tag]) => {
    const href = /\shref="([^"]+)"/i.exec(tag)?.[1] ?? '';
    return (
      /\srel="alternate"/i.test(tag) &&
      new RegExp(`\\shreflang="${hreflang}"`, 'i').test(tag) &&
      new URL(href, 'https://x').pathname === caminho
    );
  });
}

function temMeta(html, atributo, valor) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(
    ([tag]) =>
      new RegExp(`\\s${atributo}="${valor}"`, 'i').test(tag) &&
      /\scontent="[^"]+"/i.test(tag),
  );
}

function contar(html, regex) {
  return html.match(regex)?.length ?? 0;
}

function textoDoMain(html) {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? '';
  return main.replace(/<[^>]+>/g, ' ');
}

export function problemasDoHtml(html, esperado = {}) {
  const problemas = [];
  const lang = /<html[^>]*\slang="([^"]+)"/i.exec(html)?.[1];
  if (!lang) problemas.push('sem lang no <html>');
  else if (esperado.lang && lang !== esperado.lang)
    problemas.push(`lang="${lang}" no <html>, esperado "${esperado.lang}"`);

  // Só o <head> conta: um SVG no corpo pode ter o próprio <title>.
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? html;
  const titulos = contar(head, /<title>[^<]+<\/title>/gi);
  if (titulos === 0) problemas.push('sem <title>');
  else if (titulos > 1) problemas.push(`${titulos} <title>, esperado 1`);
  const h1s = contar(html, /<h1[\s>]/gi);
  if (h1s === 0) problemas.push('sem <h1>');
  else if (h1s > 1) problemas.push(`${h1s} <h1>, esperado 1`);

  if (esperado.noindex && !/content="noindex"/i.test(head))
    problemas.push('sem <meta name="robots" content="noindex">');
  if (esperado.social)
    for (const [atributo, valor] of METAS_SOCIAIS)
      if (!temMeta(head, atributo, valor))
        problemas.push(`sem <meta ${atributo}="${valor}">`);
  for (const [hreflang, caminho] of Object.entries(esperado.alternativos ?? {}))
    if (!temAlternativo(html, hreflang, caminho))
      problemas.push(
        `sem <link rel="alternate" hreflang="${hreflang}"> para ${caminho}`,
      );

  const texto = textoDoMain(html);
  if (esperado.textoChave && !texto.includes(esperado.textoChave))
    problemas.push(`texto-chave "${esperado.textoChave}" fora do <main>`);
  if (/olá forja/i.test(html)) problemas.push('texto provisório "olá forja"');
  return problemas;
}

export function esperadoDaRota(sala, idioma) {
  return {
    lang: LANG[idioma],
    alternativos: { 'pt-BR': sala.pt, en: sala.en, 'x-default': sala.pt },
    social: true,
    textoChave: TEXTO_CHAVE[sala.sala],
  };
}

/** A 404 de cada idioma (issue 4.6): sem hreflang nem Open Graph, com noindex. */
export function esperadoDa404(idioma) {
  return { lang: LANG[idioma], noindex: true };
}

export function arquivoDaRota(dirBuild, rota) {
  return path.join(dirBuild, rota, 'index.html');
}

/** Todas as páginas que o build precisa ter, com o que se espera de cada uma. */
export function paginasEsperadas() {
  const idiomas = ['pt', 'en'];
  return [
    ...SALAS.flatMap((sala) =>
      idiomas.map((idioma) => ({
        rota: sala[idioma],
        esperado: esperadoDaRota(sala, idioma),
      })),
    ),
    ...idiomas.map((idioma) => ({
      rota: PAGINAS_404[idioma],
      esperado: esperadoDa404(idioma),
    })),
  ];
}

function main() {
  const dirBuild = path.resolve('build/client');
  const paginas = paginasEsperadas();
  let falhas = 0;
  for (const { rota, esperado } of paginas) {
    const arquivo = arquivoDaRota(dirBuild, rota);
    const problemas = fs.existsSync(arquivo)
      ? problemasDoHtml(fs.readFileSync(arquivo, 'utf8'), esperado)
      : [
          `não existe ${path.relative(process.cwd(), arquivo)} (a rota saiu do prerender?)`,
        ];
    for (const p of problemas) {
      process.stderr.write(`${rota}: ${p}\n`);
      falhas++;
    }
  }
  if (falhas) process.exit(1);
  process.stdout.write(`${paginas.length} rota(s) com HTML completo\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
