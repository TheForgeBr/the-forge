// Feed RSS dos posts (issue 5.4), um por idioma (ADR 0008): build/client/rss.xml
// em português e build/client/en/rss.xml em inglês. Roda depois do
// react-router build, a partir do mesmo carregador das rotas (ADR 0009).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../app/i18n/en.ts';
import { pt } from '../app/i18n/pt.ts';
import { carregarPosts, incluirRascunhos } from './posts.mjs';

const DICIONARIOS = { pt, en };
const LANG = { pt: 'pt-BR', en: 'en' };
const LISTA = { pt: '/posts', en: '/en/posts' };
export const ARQUIVO_DO_FEED = { pt: 'rss.xml', en: 'en/rss.xml' };

/** Mesma URL base do site.ts, lida da mesma variável de build. */
export function urlBase(env = process.env) {
  return (env.VITE_URL_BASE ?? 'https://the-forge-96d7.onrender.com').replace(
    /\/+$/,
    '',
  );
}

export function escaparXml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Data AAAA-MM-DD no formato do RSS (RFC 822), à meia-noite UTC. */
export function dataRfc822(data) {
  return new Date(`${data}T00:00:00Z`).toUTCString();
}

export function gerarRss({ posts, idioma, base }) {
  const t = DICIONARIOS[idioma];
  const lista = `${base}${LISTA[idioma]}`;
  const self = `${base}/${ARQUIVO_DO_FEED[idioma]}`;
  const itens = posts
    .filter((post) => post.idioma === idioma)
    .map((post) => {
      const link = `${base}${post.caminho}`;
      const categorias = post.tags
        .map((tag) => `\n      <category>${escaparXml(tag)}</category>`)
        .join('');
      return `    <item>
      <title>${escaparXml(post.titulo)}</title>
      <link>${escaparXml(link)}</link>
      <guid isPermaLink="true">${escaparXml(link)}</guid>
      <pubDate>${dataRfc822(post.data)}</pubDate>
      <description>${escaparXml(post.resumo)}</description>${categorias}
    </item>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escaparXml(`${t['sala.posts.titulo']} | ${t['site.nome']}`)}</title>
    <link>${escaparXml(lista)}</link>
    <description>${escaparXml(t['sala.posts.descricao'])}</description>
    <language>${LANG[idioma]}</language>
    <atom:link href="${escaparXml(self)}" rel="self" type="application/rss+xml"/>
${itens.length ? `${itens.join('\n')}\n` : ''}  </channel>
</rss>
`;
}

function main() {
  const posts = carregarPosts({ rascunhos: incluirRascunhos() });
  const base = urlBase();
  for (const idioma of ['pt', 'en']) {
    const destino = path.join('build/client', ARQUIVO_DO_FEED[idioma]);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, gerarRss({ posts, idioma, base }));
    const total = posts.filter((p) => p.idioma === idioma).length;
    process.stdout.write(`${destino}: ${total} post(s)\n`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
