// Confere o HTML pré-renderizado em build/client: cada rota precisa existir
// e ter lang, <title> e <h1>, para ser lida sem JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROTAS } from './rotas.mjs';

export function problemasDoHtml(html) {
  const problemas = [];
  if (!/<html[^>]*\slang="[^"]+"/i.test(html))
    problemas.push('sem lang no <html>');
  if (!/<title>[^<]+<\/title>/i.test(html)) problemas.push('sem <title>');
  if (!/<h1[\s>]/i.test(html)) problemas.push('sem <h1>');
  return problemas;
}

export function arquivoDaRota(dirBuild, rota) {
  return path.join(dirBuild, rota, 'index.html');
}

function main() {
  const dirBuild = path.resolve('build/client');
  let falhas = 0;
  for (const rota of ROTAS) {
    const arquivo = arquivoDaRota(dirBuild, rota);
    const problemas = fs.existsSync(arquivo)
      ? problemasDoHtml(fs.readFileSync(arquivo, 'utf8'))
      : [`não existe ${path.relative(process.cwd(), arquivo)}`];
    for (const p of problemas) {
      process.stderr.write(`${rota}: ${p}\n`);
      falhas++;
    }
  }
  if (falhas) process.exit(1);
  process.stdout.write(`${ROTAS.length} rota(s) com HTML completo\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
