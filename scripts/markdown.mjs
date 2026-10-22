// Conversor de Markdown dos posts (ADR 0009). Roda só no build: o HTML sai
// pronto no pré-render e não pesa no JavaScript do visitante. Cobre o que um
// post precisa (títulos, parágrafos, ênfase, links, listas, citações, código,
// imagens e linha horizontal) e escapa todo o resto: HTML escrito no arquivo
// aparece como texto, nunca como marcação.

export class ErroDeMarkdown extends Error {
  name = 'ErroDeMarkdown';
  constructor(mensagem, linha) {
    super(`linha ${linha}: ${mensagem}`);
    this.linha = linha;
  }
}

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapar(texto) {
  return texto.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

// Links só para a web, e-mail, o próprio site ou uma âncora: nada de javascript:.
const ESQUEMAS_PERMITIDOS = /^(https?:\/\/|mailto:|\/|#)/i;

function urlSegura(url, linha) {
  if (!ESQUEMAS_PERMITIDOS.test(url))
    throw new ErroDeMarkdown(
      `o link "${url}" precisa começar com https://, http://, mailto:, / ou #`,
      linha,
    );
  return url;
}

function enfase(html) {
  return html
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?=\S)(.+?)(?<=\S)\*(?![\w*])/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '$1<em>$2</em>');
}

function textoComLinks(texto, linha) {
  let html = '';
  let ultimo = 0;
  for (const m of texto.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    html += enfase(escapar(texto.slice(ultimo, m.index)));
    const url = urlSegura(m[2], linha);
    const externo = /^https?:/i.test(url);
    html += `<a href="${escapar(url)}"${externo ? ' rel="noopener noreferrer"' : ''}>${enfase(escapar(m[1]))}</a>`;
    ultimo = m.index + m[0].length;
  }
  return html + enfase(escapar(texto.slice(ultimo)));
}

/** Formatação dentro de uma linha; o código entre crases fica intocado. */
export function inline(texto, linha = 1) {
  return texto
    .split(/(`[^`]+`)/)
    .map((parte, i) =>
      i % 2
        ? `<code>${escapar(parte.slice(1, -1))}</code>`
        : textoComLinks(parte, linha),
    )
    .join('');
}

const CERCA = /^```\s*([\w-]*)\s*$/;
const TITULO = /^(#{1,6})\s+(.*)$/;
const LINHA_HORIZONTAL = /^(-{3,}|\*{3,})\s*$/;
const IMAGEM = /^!\[([^\]]*)\]\((\S+?)(?:\s+(?:"([^"]*)"|'([^']*)'))?\)\s*$/;
const CITACAO = /^>\s?/;
const ITEM = { ul: /^[-*]\s+/, ol: /^\d+\.\s+/ };

function inicioDeBloco(linha) {
  return [
    CERCA,
    TITULO,
    LINHA_HORIZONTAL,
    IMAGEM,
    CITACAO,
    ITEM.ul,
    ITEM.ol,
  ].some((r) => r.test(linha));
}

/**
 * Converte o corpo de um post em HTML. `imagem(src, linha)` resolve cada
 * imagem e devolve `{ src, largura, altura }`; `primeiraLinha` acerta o número
 * da linha nas mensagens quando o corpo vem depois do frontmatter.
 */
export function markdownParaHtml(markdown, opcoes = {}) {
  const { imagem, primeiraLinha = 1 } = opcoes;
  const linhas = markdown.replace(/\r\n?/g, '\n').split('\n');
  const numero = (i) => primeiraLinha + i;
  const html = [];
  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];
    if (!linha.trim()) {
      i++;
      continue;
    }

    const cerca = CERCA.exec(linha);
    if (cerca) {
      const inicio = i++;
      const corpo = [];
      while (i < linhas.length && !/^```\s*$/.test(linhas[i]))
        corpo.push(linhas[i++]);
      if (i >= linhas.length)
        throw new ErroDeMarkdown(
          'bloco de código sem o ``` de fechamento',
          numero(inicio),
        );
      i++;
      const classe = cerca[1] ? ` class="linguagem-${cerca[1]}"` : '';
      html.push(
        `<pre><code${classe}>${escapar(corpo.join('\n'))}</code></pre>`,
      );
      continue;
    }

    const titulo = TITULO.exec(linha);
    if (titulo) {
      const nivel = titulo[1].length;
      if (nivel === 1)
        throw new ErroDeMarkdown(
          'use ## ou mais: o título principal (h1) vem do frontmatter',
          numero(i),
        );
      if (nivel > 4) throw new ErroDeMarkdown('use no máximo ####', numero(i));
      html.push(
        `<h${nivel}>${inline(titulo[2].trim(), numero(i))}</h${nivel}>`,
      );
      i++;
      continue;
    }

    if (LINHA_HORIZONTAL.test(linha)) {
      html.push('<hr>');
      i++;
      continue;
    }

    const img = IMAGEM.exec(linha);
    if (img) {
      const [, alt, src, duplas, simples] = img;
      const legenda = duplas ?? simples;
      if (!alt.trim())
        throw new ErroDeMarkdown(
          `a imagem "${src}" precisa de texto alternativo: ![descrição](${src})`,
          numero(i),
        );
      const dados = imagem ? imagem(src, numero(i)) : { src };
      const medidas =
        dados.largura && dados.altura
          ? ` width="${dados.largura}" height="${dados.altura}"`
          : '';
      const figcaption = legenda
        ? `<figcaption>${inline(legenda, numero(i))}</figcaption>`
        : '';
      html.push(
        `<figure><img src="${escapar(dados.src)}" alt="${escapar(alt)}"${medidas} loading="lazy" decoding="async">${figcaption}</figure>`,
      );
      i++;
      continue;
    }

    if (CITACAO.test(linha)) {
      const inicio = i;
      const corpo = [];
      while (i < linhas.length && CITACAO.test(linhas[i]))
        corpo.push(linhas[i++].replace(CITACAO, ''));
      const dentro = markdownParaHtml(corpo.join('\n'), {
        imagem,
        primeiraLinha: numero(inicio),
      });
      html.push(`<blockquote>${dentro}</blockquote>`);
      continue;
    }

    const tipo = ITEM.ul.test(linha) ? 'ul' : ITEM.ol.test(linha) ? 'ol' : '';
    if (tipo) {
      const itens = [];
      while (i < linhas.length && ITEM[tipo].test(linhas[i])) {
        const linhaDoItem = numero(i);
        let texto = linhas[i++].replace(ITEM[tipo], '');
        // Linha recuada logo abaixo continua o mesmo item.
        while (i < linhas.length && /^\s{2,}\S/.test(linhas[i]))
          texto += ` ${linhas[i++].trim()}`;
        itens.push(`<li>${inline(texto, linhaDoItem)}</li>`);
      }
      html.push(`<${tipo}>${itens.join('')}</${tipo}>`);
      continue;
    }

    const inicio = i;
    const paragrafo = [];
    while (
      i < linhas.length &&
      linhas[i].trim() &&
      (i === inicio || !inicioDeBloco(linhas[i]))
    )
      paragrafo.push(linhas[i++].trim());
    html.push(`<p>${inline(paragrafo.join(' '), numero(inicio))}</p>`);
  }
  return html.join('\n');
}
