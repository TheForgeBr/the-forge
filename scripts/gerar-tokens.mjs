// Gera app/estilos/tokens.css a partir de marca/tokens.json (ADR 0006).
// Com --verificar, não escreve nada: só falha se o CSS estiver desatualizado.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ARQUIVO_TOKENS = 'marca/tokens.json';
export const ARQUIVO_CSS = 'app/estilos/tokens.css';

const FAMILIAS_GENERICAS = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'cursive',
  'fantasy',
]);
const NOME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX = /^#[0-9A-Fa-f]{6}$/;

function conferirNome(grupo, nome) {
  if (!NOME.test(nome))
    throw new Error(
      `${grupo}.${nome}: o nome deve ter só minúsculas, números e hífen`,
    );
}

function pilhaDeFontes(familias) {
  return familias
    .map((f) => (FAMILIAS_GENERICAS.has(f) ? f : `'${f}'`))
    .join(', ');
}

export function cssDosTokens(tokens) {
  const linhas = [];
  for (const [nome, valor] of Object.entries(tokens.cores)) {
    conferirNome('cores', nome);
    if (!HEX.test(valor))
      throw new Error(`cores.${nome}: "${valor}" não é uma cor #RRGGBB`);
    linhas.push(`  --cor-${nome}: ${valor};`);
  }
  for (const [nome, familias] of Object.entries(tokens.fontes)) {
    conferirNome('fontes', nome);
    linhas.push(`  --fonte-${nome}: ${pilhaDeFontes(familias)};`);
  }
  for (const [nome, valor] of Object.entries(tokens.tamanhos)) {
    conferirNome('tamanhos', nome);
    linhas.push(`  --tamanho-${nome}: ${valor};`);
  }
  for (const [nome, valor] of Object.entries(tokens.espacos)) {
    conferirNome('espacos', nome);
    linhas.push(`  --espaco-${nome}: ${valor};`);
  }
  return (
    `/* Gerado por scripts/gerar-tokens.mjs a partir de ${ARQUIVO_TOKENS}.\n` +
    '   Não edite à mão: mude o JSON e rode `npm run tokens`. */\n' +
    `:root {\n${linhas.join('\n')}\n}\n`
  );
}

export function cssDesatualizado(cssAtual, tokens) {
  if (cssAtual === null) return true;
  return cssAtual.replace(/\r\n/g, '\n') !== cssDosTokens(tokens);
}

function main() {
  const tokens = JSON.parse(fs.readFileSync(ARQUIVO_TOKENS, 'utf8'));
  const esperado = cssDosTokens(tokens);
  if (process.argv.includes('--verificar')) {
    const atual = fs.existsSync(ARQUIVO_CSS)
      ? fs.readFileSync(ARQUIVO_CSS, 'utf8')
      : null;
    if (cssDesatualizado(atual, tokens)) {
      process.stderr.write(
        `${ARQUIVO_CSS} está desatualizado em relação a ${ARQUIVO_TOKENS}: rode \`npm run tokens\`\n`,
      );
      process.exit(1);
    }
    process.stdout.write(`${ARQUIVO_CSS} está em dia com ${ARQUIVO_TOKENS}\n`);
    return;
  }
  fs.mkdirSync(path.dirname(ARQUIVO_CSS), { recursive: true });
  fs.writeFileSync(ARQUIVO_CSS, esperado);
  const total = esperado.match(/^ {2}--/gm).length;
  process.stdout.write(`${ARQUIVO_CSS} gerado com ${total} variáveis\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
