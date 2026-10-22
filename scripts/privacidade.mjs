// Teste de privacidade do conteúdo publicado (issue 2.7): procura termos
// proibidos, hashes de nomes reservados, e-mails, telefones e caminhos de
// disco nos textos do site e no HTML do build. As regras ficam em
// Docs/conteudo/proibidos.json.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ARQUIVO_REGRAS = 'Docs/conteudo/proibidos.json';

/** Onde o conteúdo do site mora no código-fonte; testes ficam de fora. */
export const FONTES = ['app/conteudo', 'app/i18n', 'conteudo/posts'];

export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function sha256(texto) {
  return crypto.createHash('sha256').update(normalizar(texto)).digest('hex');
}

function escapar(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Um termo que começa ou termina em letra só vale como palavra inteira:
// "token" pega "token", mas não "tokens".
function regexDoTermo(texto) {
  const antes = /^\w/.test(texto) ? '(?<!\\w)' : '';
  const depois = /\w$/.test(texto) ? '(?!\\w)' : '';
  return new RegExp(antes + escapar(texto) + depois, 'i');
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const TELEFONE = /(?:\+55\s?)?\(?\b\d{2}\)?\s?9\d{4}[-\s]?\d{4}\b/g;
const CAMINHO = /\b[A-Za-z]:[\\/][^\s"'<>]*/g;

export function problemasDoTexto(texto, regras) {
  const problemas = [];
  for (const { texto: termo, motivo } of regras.termos)
    if (regexDoTermo(termo).test(texto))
      problemas.push(`termo proibido "${termo}" (${motivo})`);
  for (const { regex, motivo } of regras.padroes)
    if (new RegExp(regex).test(texto))
      problemas.push(`padrão proibido /${regex}/ (${motivo})`);

  const palavras = normalizar(texto).match(/[\p{L}\p{N}]+/gu) ?? [];
  for (const { sha256: alvo, palavras: n, motivo } of regras.hashes)
    for (let i = 0; i + n <= palavras.length; i++)
      if (sha256(palavras.slice(i, i + n).join(' ')) === alvo) {
        problemas.push(`termo reservado (${motivo}), guardado como hash`);
        break;
      }

  const aprovados = new Set(regras.contatosAprovados);
  for (const [tipo, regex] of [
    ['e-mail', EMAIL],
    ['telefone', TELEFONE],
    ['caminho de disco', CAMINHO],
  ])
    for (const [achado] of texto.matchAll(regex))
      if (!aprovados.has(achado))
        problemas.push(`${tipo} fora dos contatos aprovados: ${achado}`);
  return problemas;
}

function listar(dir, aceitar) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const caminho = path.join(dir, e.name);
    if (e.isDirectory()) return listar(caminho, aceitar);
    return aceitar(e.name) ? [caminho] : [];
  });
}

export function arquivosDoConteudo(raiz = '.') {
  return FONTES.flatMap((dir) =>
    listar(
      path.join(raiz, dir),
      (n) => /\.(ts|tsx|md)$/.test(n) && !/\.test\.tsx?$/.test(n),
    ),
  );
}

export function arquivosDoBuild(raiz = '.') {
  return listar(path.join(raiz, 'build/client'), (n) => n.endsWith('.html'));
}

export function problemasDosArquivos(arquivos, regras) {
  return arquivos.flatMap((arquivo) =>
    problemasDoTexto(fs.readFileSync(arquivo, 'utf8'), regras).map(
      (p) => `${path.relative(process.cwd(), arquivo)}: ${p}`,
    ),
  );
}

export function carregarRegras(arquivo = ARQUIVO_REGRAS) {
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

function main() {
  const i = process.argv.indexOf('--hash');
  if (i > -1) {
    const termo = process.argv[i + 1] ?? '';
    const n = normalizar(termo).split(' ').length;
    process.stdout.write(
      JSON.stringify({ sha256: sha256(termo), palavras: n, motivo: '' }) + '\n',
    );
    return;
  }
  const arquivos = [...arquivosDoConteudo(), ...arquivosDoBuild()];
  const problemas = problemasDosArquivos(arquivos, carregarRegras());
  for (const p of problemas) process.stderr.write(`${p}\n`);
  if (problemas.length) process.exit(1);
  process.stdout.write(
    `${arquivos.length} arquivos sem termos proibidos nem contatos fora da lista\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
