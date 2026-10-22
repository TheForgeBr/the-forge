// Confere as fontes do build em build/client/assets: só os pesos e o
// subconjunto latino permitidos, e mostra o peso total dos arquivos woff2.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PERMITIDAS = [
  'Cinzel 600 normal',
  'Cinzel 700 normal',
  'Source Sans 3 400 normal',
  'Source Sans 3 600 normal',
  'JetBrains Mono 400 normal',
];

function propriedade(bloco, nome) {
  const achado = new RegExp(`${nome}\\s*:\\s*([^;]+)`).exec(bloco);
  return achado ? achado[1].replace(/["'\\]/g, '').trim() : '';
}

export function fontesDoCss(css) {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, bloco]) => ({
    face: [
      propriedade(bloco, 'font-family'),
      propriedade(bloco, 'font-weight'),
      propriedade(bloco, 'font-style') || 'normal',
    ].join(' '),
    arquivos: [...bloco.matchAll(/url\(\s*["']?([^"')]+)/g)].map(([, url]) =>
      path.posix.basename(url),
    ),
  }));
}

export function problemasDasFontes(fontes) {
  const problemas = [];
  for (const { face, arquivos } of fontes) {
    if (!PERMITIDAS.includes(face))
      problemas.push(`${face}: peso ou estilo fora da lista permitida`);
    for (const arquivo of arquivos)
      if (!/-latin-\d/.test(arquivo))
        problemas.push(`${face}: ${arquivo} não é do subconjunto latino`);
  }
  return problemas;
}

function main() {
  const dirAssets = path.resolve('build/client/assets');
  const nomes = fs.existsSync(dirAssets) ? fs.readdirSync(dirAssets) : [];
  const fontes = nomes
    .filter((n) => n.endsWith('.css'))
    .flatMap((n) =>
      fontesDoCss(fs.readFileSync(path.join(dirAssets, n), 'utf8')),
    );
  const problemas = problemasDasFontes(fontes);
  if (!fontes.length)
    problemas.push(
      'nenhum @font-face em build/client/assets (rode o build antes)',
    );
  for (const p of problemas) process.stderr.write(`${p}\n`);
  if (problemas.length) process.exit(1);
  const bytes = nomes
    .filter((n) => n.endsWith('.woff2'))
    .reduce((total, n) => total + fs.statSync(path.join(dirAssets, n)).size, 0);
  process.stdout.write(
    `${fontes.length} @font-face permitidos; woff2: ${(bytes / 1024).toFixed(1)} KB\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
