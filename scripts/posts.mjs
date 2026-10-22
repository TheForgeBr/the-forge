// Carregador dos posts (issue 5.1, ADR 0009). Lê conteudo/posts/<slug>.<idioma>.md
// no build, valida o frontmatter, converte o corpo com markdown.mjs e ordena
// do mais novo ao mais antigo. Quem usa: o loader das rotas de posts, o
// prerender (react-router.config.ts), o RSS, o sitemap e a verificação das rotas.
import fs from 'node:fs';
import path from 'node:path';
import { ErroDeMarkdown, markdownParaHtml } from './markdown.mjs';

export const PASTA_DOS_POSTS = 'conteudo/posts';
/** As imagens de cada post ficam em public/posts/<slug>/, servidas em /posts/<slug>/. */
export const PASTA_DAS_IMAGENS = 'public/posts';
/** Mesmo limite das imagens dos ambientes: o post abre rápido no 4G. */
export const LIMITE_DA_IMAGEM = 150 * 1024;

const NOME_DO_ARQUIVO = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(pt|en)\.md$/;
const CAMPOS = ['titulo', 'data', 'resumo', 'idioma', 'rascunho', 'tags'];
const PALAVRAS_POR_MINUTO = 200;

export class PostInvalidoError extends Error {
  name = 'PostInvalidoError';
}

export function caminhoDoPost(slug, idioma) {
  return idioma === 'en' ? `/en/posts/${slug}` : `/posts/${slug}`;
}

/** Rascunhos aparecem no servidor de desenvolvimento ou com RASCUNHOS=1. */
export function incluirRascunhos(env = process.env) {
  return env.RASCUNHOS === '1' || env.NODE_ENV === 'development';
}

/** Aspas duplas ou simples em volta do valor (o Prettier usa simples). */
function semAspas(valor) {
  return valor.replace(/^"(.*)"$|^'(.*)'$/, '$1$2');
}

function valorDoCampo(bruto) {
  const valor = bruto.trim();
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  if (valor.startsWith('[') && valor.endsWith(']'))
    return valor
      .slice(1, -1)
      .split(',')
      .map((item) => semAspas(item.trim()))
      .filter(Boolean);
  return semAspas(valor);
}

function lerFrontmatter(bloco, arquivo) {
  const campos = {};
  bloco.split(/\r?\n/).forEach((linha, i) => {
    if (!linha.trim() || linha.trim().startsWith('#')) return;
    const m = /^([a-z]+):(.*)$/.exec(linha);
    if (!m)
      throw new PostInvalidoError(
        `${arquivo}: linha ${i + 2} do frontmatter não está no formato "campo: valor"`,
      );
    const [, campo, valor] = m;
    if (!CAMPOS.includes(campo))
      throw new PostInvalidoError(
        `${arquivo}: campo "${campo}" desconhecido; os campos são ${CAMPOS.join(', ')}`,
      );
    if (campo in campos)
      throw new PostInvalidoError(`${arquivo}: campo "${campo}" repetido`);
    campos[campo] = valorDoCampo(valor);
  });
  return campos;
}

function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(texto);
}

function validar(campos, arquivo, idiomaDoNome) {
  const erro = (mensagem) => new PostInvalidoError(`${arquivo}: ${mensagem}`);
  for (const campo of ['titulo', 'data', 'resumo', 'idioma'])
    if (typeof campos[campo] !== 'string' || !campos[campo])
      throw erro(`falta o campo "${campo}"`);
  if (!dataValida(campos.data))
    throw erro(`o campo "data" precisa ser AAAA-MM-DD (veio "${campos.data}")`);
  if (campos.idioma !== idiomaDoNome)
    throw erro(
      `o campo "idioma" diz "${campos.idioma}", mas o nome do arquivo diz "${idiomaDoNome}"`,
    );
  if (campos.rascunho !== undefined && typeof campos.rascunho !== 'boolean')
    throw erro('o campo "rascunho" precisa ser true ou false');
  if (campos.tags !== undefined && !Array.isArray(campos.tags))
    throw erro('o campo "tags" precisa ser uma lista: [TypeScript, React]');
  return {
    titulo: campos.titulo,
    data: campos.data,
    resumo: campos.resumo,
    idioma: campos.idioma,
    rascunho: campos.rascunho ?? false,
    tags: campos.tags ?? [],
  };
}

/** Largura e altura lidas do cabeçalho do arquivo (PNG, WebP ou SVG). */
export function dimensoesDaImagem(dados, nome) {
  const ext = path.extname(nome).toLowerCase();
  if (ext === '.png' && dados.length >= 24)
    return { largura: dados.readUInt32BE(16), altura: dados.readUInt32BE(20) };
  if (ext === '.webp' && dados.toString('ascii', 8, 12) === 'WEBP') {
    const tipo = dados.toString('ascii', 12, 16);
    if (tipo === 'VP8X')
      return {
        largura: 1 + dados.readUIntLE(24, 3),
        altura: 1 + dados.readUIntLE(27, 3),
      };
    if (tipo === 'VP8 ')
      return {
        largura: dados.readUInt16LE(26) & 0x3fff,
        altura: dados.readUInt16LE(28) & 0x3fff,
      };
    if (tipo === 'VP8L') {
      const bits = dados.readUInt32LE(21);
      return {
        largura: 1 + (bits & 0x3fff),
        altura: 1 + ((bits >> 14) & 0x3fff),
      };
    }
  }
  if (ext === '.svg') {
    const caixa =
      /viewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/.exec(
        dados.toString('utf8'),
      );
    if (caixa)
      return {
        largura: Math.round(Number(caixa[1])),
        altura: Math.round(Number(caixa[2])),
      };
  }
  return undefined;
}

function resolverImagem(raiz, slug, arquivo) {
  return (src, linha) => {
    const erro = (mensagem) =>
      new PostInvalidoError(`${arquivo}: linha ${linha}: ${mensagem}`);
    if (!/^[\w.-]+$/.test(src) || src.startsWith('.'))
      throw erro(
        `a imagem "${src}" precisa ser só o nome de um arquivo em ${PASTA_DAS_IMAGENS}/${slug}/`,
      );
    const local = path.join(raiz, PASTA_DAS_IMAGENS, slug, src);
    if (!fs.existsSync(local))
      throw erro(`a imagem ${PASTA_DAS_IMAGENS}/${slug}/${src} não existe`);
    const dados = fs.readFileSync(local);
    if (dados.length > LIMITE_DA_IMAGEM)
      throw erro(
        `a imagem ${src} tem ${Math.round(dados.length / 1024)} KB; o limite é ${LIMITE_DA_IMAGEM / 1024} KB`,
      );
    const medidas = dimensoesDaImagem(dados, src);
    if (!medidas)
      throw erro(
        `não consegui ler as medidas de ${src}; use .webp, .png ou .svg`,
      );
    return { src: `/posts/${slug}/${src}`, ...medidas };
  };
}

function minutosDeLeitura(corpo) {
  const palavras = corpo
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO));
}

/** Lê um post a partir do nome do arquivo e do texto. */
export function lerPost(nome, texto, raiz = '.') {
  const arquivo = `${PASTA_DOS_POSTS}/${nome}`;
  const partes = NOME_DO_ARQUIVO.exec(nome);
  if (!partes)
    throw new PostInvalidoError(
      `${arquivo}: o nome precisa ser <slug>.<pt|en>.md, com o slug em kebab-case`,
    );
  const [, slug, idiomaDoNome] = partes;
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/.exec(texto);
  if (!frontmatter)
    throw new PostInvalidoError(
      `${arquivo}: o arquivo precisa começar com o frontmatter entre duas linhas ---`,
    );
  const campos = validar(
    lerFrontmatter(frontmatter[1], arquivo),
    arquivo,
    idiomaDoNome,
  );
  const corpo = texto.slice(frontmatter[0].length);
  let html;
  try {
    html = markdownParaHtml(corpo, {
      imagem: resolverImagem(raiz, slug, arquivo),
      primeiraLinha: frontmatter[0].split('\n').length,
    });
  } catch (e) {
    if (e instanceof ErroDeMarkdown)
      throw new PostInvalidoError(`${arquivo}: ${e.message}`);
    throw e;
  }
  return {
    slug,
    ...campos,
    caminho: caminhoDoPost(slug, idiomaDoNome),
    minutos: minutosDeLeitura(corpo),
    html,
  };
}

/**
 * Todos os posts, do mais novo ao mais antigo. Sem `rascunhos`, os rascunhos
 * ficam de fora. Cada post sabe o caminho da tradução, se ela existir.
 */
export function carregarPosts({ raiz = '.', rascunhos = false } = {}) {
  const pasta = path.join(raiz, PASTA_DOS_POSTS);
  const nomes = fs.existsSync(pasta)
    ? fs.readdirSync(pasta).filter((n) => n.endsWith('.md'))
    : [];
  const posts = nomes
    .map((nome) =>
      lerPost(nome, fs.readFileSync(path.join(pasta, nome), 'utf8'), raiz),
    )
    .filter((post) => rascunhos || !post.rascunho)
    .sort((a, b) =>
      a.data === b.data
        ? a.slug.localeCompare(b.slug)
        : a.data < b.data
          ? 1
          : -1,
    );
  return posts.map((post) => {
    const outro = post.idioma === 'pt' ? 'en' : 'pt';
    const traducao = posts.find(
      (p) => p.slug === post.slug && p.idioma === outro,
    );
    return { ...post, traducao: traducao?.caminho };
  });
}

/** Caminhos de todos os posts publicados, para o prerender e o render.yaml. */
export function caminhosDosPosts(opcoes) {
  return carregarPosts(opcoes).map((post) => post.caminho);
}
