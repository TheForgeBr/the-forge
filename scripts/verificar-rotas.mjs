// Confere o HTML pré-renderizado em build/client: cada rota precisa existir
// e ter lang, <title> e <h1>, para ser lida sem JavaScript, e apontar para a
// mesma sala no outro idioma com hreflang (ADR 0008).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGINAS_404, SALAS } from './rotas.mjs';

const LANG = { pt: 'pt-BR', en: 'en' };

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

export function problemasDoHtml(html, esperado = {}) {
  const problemas = [];
  const lang = /<html[^>]*\slang="([^"]+)"/i.exec(html)?.[1];
  if (!lang) problemas.push('sem lang no <html>');
  else if (esperado.lang && lang !== esperado.lang)
    problemas.push(`lang="${lang}" no <html>, esperado "${esperado.lang}"`);
  if (!/<title>[^<]+<\/title>/i.test(html)) problemas.push('sem <title>');
  if (!/<h1[\s>]/i.test(html)) problemas.push('sem <h1>');
  if (
    esperado.noindex &&
    !/<meta\b(?=[^>]*\sname="robots")(?=[^>]*\scontent="noindex")[^>]*>/i.test(
      html,
    )
  )
    problemas.push('sem <meta name="robots" content="noindex">');
  for (const [hreflang, caminho] of Object.entries(esperado.alternativos ?? {}))
    if (!temAlternativo(html, hreflang, caminho))
      problemas.push(
        `sem <link rel="alternate" hreflang="${hreflang}"> para ${caminho}`,
      );
  return problemas;
}

export function esperadoDaRota(sala, idioma) {
  return {
    lang: LANG[idioma],
    alternativos: { 'pt-BR': sala.pt, en: sala.en, 'x-default': sala.pt },
  };
}

export function arquivoDaRota(dirBuild, rota) {
  return path.join(dirBuild, rota, 'index.html');
}

function main() {
  const dirBuild = path.resolve('build/client');
  let falhas = 0;
  let rotas = 0;
  for (const sala of SALAS)
    for (const idioma of ['pt', 'en']) {
      const rota = sala[idioma];
      const arquivo = arquivoDaRota(dirBuild, rota);
      const problemas = fs.existsSync(arquivo)
        ? problemasDoHtml(
            fs.readFileSync(arquivo, 'utf8'),
            esperadoDaRota(sala, idioma),
          )
        : [`não existe ${path.relative(process.cwd(), arquivo)}`];
      rotas++;
      for (const p of problemas) {
        process.stderr.write(`${rota}: ${p}\n`);
        falhas++;
      }
    }
  // A 404 de cada idioma (issue 4.6): sem hreflang, mas com noindex.
  for (const idioma of ['pt', 'en']) {
    const rota = PAGINAS_404[idioma];
    const arquivo = arquivoDaRota(dirBuild, rota);
    const problemas = fs.existsSync(arquivo)
      ? problemasDoHtml(fs.readFileSync(arquivo, 'utf8'), {
          lang: LANG[idioma],
          noindex: true,
        })
      : [`não existe ${path.relative(process.cwd(), arquivo)}`];
    rotas++;
    for (const p of problemas) {
      process.stderr.write(`${rota}: ${p}\n`);
      falhas++;
    }
  }
  if (falhas) process.exit(1);
  process.stdout.write(`${rotas} rota(s) com HTML completo\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
