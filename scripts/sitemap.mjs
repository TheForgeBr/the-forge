// Sitemap e robots.txt (issue 5.5): build/client/sitemap.xml com as salas nos
// dois idiomas e os posts publicados, cada página com o hreflang do par
// (ADR 0008); a 404 fica de fora. O robots.txt também sai no build, para
// apontar para o sitemap na mesma URL base do site. Roda depois do
// react-router build, como o RSS.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarPosts, incluirRascunhos } from './posts.mjs';
import { SALAS } from './rotas.mjs';
import { escaparXml, urlBase } from './rss.mjs';

const LANG = { pt: 'pt-BR', en: 'en' };

/** Cada página com o endereço, o par de idiomas (se houver) e a data. */
export function paginasDoSitemap(posts) {
  const salas = SALAS.flatMap(({ pt, en }) =>
    ['pt', 'en'].map((idioma) => ({
      caminho: idioma === 'pt' ? pt : en,
      alternativos: { pt, en },
    })),
  );
  const dosPosts = posts.map((post) => {
    const outro = post.idioma === 'pt' ? 'en' : 'pt';
    return {
      caminho: post.caminho,
      lastmod: post.data,
      alternativos: post.traducao
        ? { [post.idioma]: post.caminho, [outro]: post.traducao }
        : undefined,
    };
  });
  return [...salas, ...dosPosts];
}

export function gerarSitemap(paginas, base) {
  const url = (caminho) => escaparXml(`${base}${caminho}`);
  const entradas = paginas.map(({ caminho, lastmod, alternativos }) => {
    const linhas = [`    <loc>${url(caminho)}</loc>`];
    if (lastmod) linhas.push(`    <lastmod>${lastmod}</lastmod>`);
    if (alternativos) {
      for (const idioma of ['pt', 'en'])
        linhas.push(
          `    <xhtml:link rel="alternate" hreflang="${LANG[idioma]}" href="${url(alternativos[idioma])}"/>`,
        );
      linhas.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(alternativos.pt)}"/>`,
      );
    }
    return `  <url>\n${linhas.join('\n')}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entradas.join('\n')}
</urlset>
`;
}

export function gerarRobots(base) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

function main() {
  const base = urlBase();
  const paginas = paginasDoSitemap(
    carregarPosts({ rascunhos: incluirRascunhos() }),
  );
  const destino = 'build/client';
  fs.writeFileSync(
    path.join(destino, 'sitemap.xml'),
    gerarSitemap(paginas, base),
  );
  fs.writeFileSync(path.join(destino, 'robots.txt'), gerarRobots(base));
  process.stdout.write(
    `build/client/sitemap.xml: ${paginas.length} página(s); robots.txt aponta para ele\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
