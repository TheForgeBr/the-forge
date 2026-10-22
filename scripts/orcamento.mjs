// Soma o JavaScript gzip que a Home carrega (ADR 0003) e falha acima do
// limite de marca/orcamento.json. Parte do HTML pré-renderizado e segue os
// imports estáticos de cada chunk, para não depender só dos modulepreload.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const JS_NO_HTML = /["'](\/assets\/[^"']+\.js)["']/g;
const IMPORT_ESTATICO =
  /(?:\bfrom\s*|\bimport\s*)["'](\.{1,2}\/[^"']+\.js)["']/g;

export function tamanhoGzip(conteudo) {
  return zlib.gzipSync(conteudo, { level: 9 }).length;
}

// `ler(caminho)` devolve o conteúdo de um arquivo de build/client, com o
// caminho começando em /assets/.
export function arquivosDaPrimeiraCarga(html, ler) {
  const vistos = new Set();
  const fila = [...html.matchAll(JS_NO_HTML)].map(([, url]) => url);
  while (fila.length) {
    const atual = fila.shift();
    if (vistos.has(atual)) continue;
    vistos.add(atual);
    for (const [, relativo] of ler(atual).matchAll(IMPORT_ESTATICO))
      fila.push(path.posix.join(path.posix.dirname(atual), relativo));
  }
  return [...vistos];
}

export function avaliarOrcamento(tamanhos, limiteKB) {
  const total = tamanhos.reduce((soma, t) => soma + t.bytes, 0);
  const maiores = [...tamanhos].sort((a, b) => b.bytes - a.bytes);
  return {
    total,
    limite: limiteKB * 1024,
    estourou: total > limiteKB * 1024,
    maiores,
  };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function main() {
  const dirBuild = path.resolve('build/client');
  const { jsGzipPrimeiraCargaKB } = JSON.parse(
    fs.readFileSync('marca/orcamento.json', 'utf8'),
  );
  const html = fs.readFileSync(path.join(dirBuild, 'index.html'), 'utf8');
  const ler = (url) => fs.readFileSync(path.join(dirBuild, url), 'utf8');
  const tamanhos = arquivosDaPrimeiraCarga(html, ler).map((url) => ({
    url,
    bytes: tamanhoGzip(ler(url)),
  }));
  const { total, limite, estourou, maiores } = avaliarOrcamento(
    tamanhos,
    jsGzipPrimeiraCargaKB,
  );
  const saida = estourou ? process.stderr : process.stdout;
  saida.write(
    `JS gzip na primeira carga da Home: ${kb(total)} de ${kb(limite)} (${tamanhos.length} arquivos)\n`,
  );
  for (const { url, bytes } of maiores.slice(0, 5))
    saida.write(`  ${kb(bytes).padStart(9)}  ${url}\n`);
  if (estourou) {
    saida.write(
      `Orçamento estourado em ${kb(total - limite)}: veja os maiores arquivos acima.\n`,
    );
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
