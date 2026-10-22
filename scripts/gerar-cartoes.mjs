// Cartões SVG dos projetos (issue 7.2), para os READMEs do GitHub: um por
// projeto e por idioma em public/cartoes/<id>.svg (pt) e <id>.en.svg, a
// partir de app/conteudo/projetos.ts. Todo texto vira curva (opentype.js), sem
// fonte, script nem link externo, para renderizar no GitHub; só cores dos
// tokens. O nome leva o degradê de brasa do site, de baixo para cima.
//
//   npm run cartoes               gera os cartões
//   npm run verificar:cartoes     falha se algum estiver desatualizado
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

/**
 * Desenha o texto como um caminho, glifo por glifo, com kerning e sem
 * ligaduras: o Source Sans 3 tem uma substituição contextual que o
 * opentype.js não aplica, e os cartões não precisam dela. Devolve o caminho e
 * onde ele termina.
 */
export function caminhoDoTexto(fonte, texto, x, y, tamanho, espacamento) {
  const escala = tamanho / fonte.unitsPerEm;
  const glifos = Array.from(texto, (c) => fonte.charToGlyph(c));
  let cursor = x;
  let d = '';
  glifos.forEach((glifo, i) => {
    // Arredondado: o opentype.js formata certas posições com ruído de ponto
    // flutuante (como 324.6000000000001) como NaN, e o resto do texto some.
    const px = Math.round(cursor * 100) / 100;
    d += glifo.getPath(px, y, tamanho).toPathData(2);
    const proximo = glifos[i + 1];
    cursor += glifo.advanceWidth * escala + espacamento;
    if (proximo) cursor += fonte.getKerningValue(glifo, proximo) * escala;
  });
  return { d, fim: cursor - espacamento };
}

const LARGURA = 480;
const ALTURA = 200;
const MARGEM = 24;
const PASTA = 'public/cartoes';
/** Estados em atividade, destacados na cor da magia como no site. */
const ATIVOS = new Set(['em-andamento', 'em-producao']);

export function escaparXml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Quebra nas palavras; na última linha que cabe, corta com reticências. */
export function quebrarLinhas(medir, texto, largura, maxLinhas) {
  const linhas = [];
  let atual = '';
  const palavras = texto.split(/\s+/);
  for (let i = 0; i < palavras.length; i++) {
    const tentativa = atual ? `${atual} ${palavras[i]}` : palavras[i];
    if (medir(tentativa) <= largura || !atual) {
      atual = tentativa;
      continue;
    }
    linhas.push(atual);
    atual = palavras[i];
    if (linhas.length === maxLinhas) {
      atual = '';
      // Sobrou texto: a última linha ganha reticências, cortando se preciso.
      let ultima = `${linhas.pop()}…`;
      while (medir(ultima) > largura && ultima.length > 1)
        ultima = `${ultima.slice(0, -2)}…`;
      linhas.push(ultima);
      return linhas;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function carregar(arquivo) {
  const buf = fs.readFileSync(`node_modules/@fontsource/${arquivo}`);
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
}

export function carregarFontesDoCartao() {
  return {
    titulo: carregar('cinzel/files/cinzel-latin-700-normal.woff'),
    marca: carregar('cinzel/files/cinzel-latin-600-normal.woff'),
    texto: carregar('source-sans-3/files/source-sans-3-latin-400-normal.woff'),
    codigo: carregar(
      'jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
    ),
  };
}

function largura(fonte, texto, tamanho, espacamento = 0) {
  return caminhoDoTexto(fonte, texto, 0, 0, tamanho, espacamento).fim;
}

/** Caminho da runa de Projetos (Tiwaz), lido de marca/runas. */
function caminhoDaRuna() {
  const svg = fs.readFileSync('marca/runas/projetos.svg', 'utf8');
  return /<path d="([^"]+)"/.exec(svg)[1];
}

/** Chips da stack em até duas linhas; o que não couber vira "+N" no fim. */
function chips(fontes, cores, stack) {
  const tamanho = 11;
  const altura = 22;
  const folga = 8;
  const intervalo = 6;
  const limite = LARGURA - MARGEM;
  const topos = [132, 132 + altura + intervalo];
  const medida = (texto) => largura(fontes.codigo, texto, tamanho) + folga * 2;

  // Distribui todos os chips em linhas, sem limite.
  const linhas = [[]];
  let x = MARGEM;
  for (const nome of stack) {
    const w = medida(nome);
    if (x + w > limite && linhas.at(-1).length) {
      linhas.push([]);
      x = MARGEM;
    }
    linhas.at(-1).push({ nome, x, w });
    x += w + intervalo;
  }

  // Passou de duas linhas: tira do fim da segunda até o "+N" caber.
  const visiveis = linhas.slice(0, topos.length);
  const escondidos = linhas.slice(topos.length).flat().length;
  if (escondidos) {
    const ultima = visiveis.at(-1);
    let resto = escondidos;
    const fim = () => {
      const u = ultima.at(-1);
      return u ? u.x + u.w + intervalo : MARGEM;
    };
    while (ultima.length && fim() + medida(`+${resto}`) > limite) {
      ultima.pop();
      resto++;
    }
    const rotulo = `+${resto}`;
    ultima.push({ nome: rotulo, x: fim(), w: medida(rotulo) });
  }

  return visiveis
    .map((linha, i) =>
      linha
        .map(({ nome, x: xc, w }) =>
          chip(fontes, cores, nome, xc, topos[i], w, altura, tamanho, folga),
        )
        .join(''),
    )
    .join('');
}

function chip(fontes, cores, texto, x, y, w, altura, tamanho, folga) {
  const { d } = caminhoDoTexto(
    fontes.codigo,
    texto,
    x + folga,
    y + 15,
    tamanho,
    0,
  );
  return (
    `<rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="${altura}" rx="4" fill="${cores.fuligem}" stroke="${cores.ferro}"/>` +
    `<path d="${d}" fill="${cores.pergaminho}"/>`
  );
}

/** O SVG de um cartão, no idioma pedido. `rotulos` traz os nomes dos estados. */
export function svgDoCartao({ projeto, idioma, cores, fontes, rotulos }) {
  const titulo = projeto.titulo[idioma];
  const papel = projeto.papel[idioma];
  const estado = rotulos[`estado.${projeto.estado}`] ?? projeto.estado;
  const corDoEstado = ATIVOS.has(projeto.estado)
    ? cores.magia
    : cores['cinza-brasa'];

  // Estado no canto de cima, em fonte de código, como no site.
  const tamEstado = 10;
  const wEstado = largura(fontes.codigo, estado, tamEstado) + 16;
  const xEstado = LARGURA - MARGEM - wEstado;
  const textoEstado = caminhoDoTexto(
    fontes.codigo,
    estado,
    xEstado + 8,
    36,
    tamEstado,
    0,
  ).d;

  // Nome: até onde cabe antes do estado, encolhendo se for longo.
  let tamTitulo = 24;
  const espacoTitulo = xEstado - 12 - 58;
  while (
    largura(fontes.titulo, titulo, tamTitulo, 0.5) > espacoTitulo &&
    tamTitulo > 14
  )
    tamTitulo -= 1;
  const nome = caminhoDoTexto(fontes.titulo, titulo, 58, 42, tamTitulo, 0.5).d;

  const linhasDoPapel = quebrarLinhas(
    (t) => largura(fontes.texto, t, 14),
    papel,
    LARGURA - MARGEM * 2,
    2,
  );
  const papelCurvas = linhasDoPapel
    .map(
      (linha, i) =>
        caminhoDoTexto(fontes.texto, linha, MARGEM, 84 + i * 20, 14, 0).d,
    )
    .join('');

  const marca = caminhoDoTexto(fontes.marca, 'THE FORGE BR', 0, 0, 10, 1.5);
  const xMarca = LARGURA - MARGEM - marca.fim;
  const marcaCurvas = caminhoDoTexto(
    fontes.marca,
    'THE FORGE BR',
    xMarca,
    186,
    10,
    1.5,
  ).d;

  const descricao = `${papel} · ${projeto.stack.join(', ')} · ${estado}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}" width="${LARGURA}" height="${ALTURA}" role="img" aria-labelledby="titulo descricao">` +
    `<title id="titulo">${escaparXml(titulo)}</title>` +
    `<desc id="descricao">${escaparXml(descricao)}</desc>` +
    `<defs>` +
    `<linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cores.pedra}"/><stop offset="1" stop-color="${cores.fuligem}"/></linearGradient>` +
    `<radialGradient id="brilho" cx="0.5" cy="1" r="0.7"><stop offset="0" stop-color="${cores.brasa}" stop-opacity="0.22"/><stop offset="1" stop-color="${cores.brasa}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="letras" gradientUnits="userSpaceOnUse" x1="0" y1="44" x2="0" y2="20"><stop offset="0" stop-color="${cores.brasa}"/><stop offset="0.5" stop-color="${cores['ouro-forja']}"/><stop offset="1" stop-color="${cores.magia}"/></linearGradient>` +
    `</defs>` +
    `<rect x="0.5" y="0.5" width="${LARGURA - 1}" height="${ALTURA - 1}" rx="6" fill="url(#fundo)" stroke="${cores.ferro}"/>` +
    `<rect x="0.5" y="0.5" width="${LARGURA - 1}" height="${ALTURA - 1}" rx="6" fill="url(#brilho)"/>` +
    `<g transform="translate(${MARGEM} 22)" fill="none" stroke="${cores['ouro-forja']}" stroke-width="2" stroke-linecap="square"><path d="${caminhoDaRuna()}"/></g>` +
    `<path d="${nome}" fill="url(#letras)"/>` +
    `<rect x="${xEstado.toFixed(1)}" y="22" width="${wEstado.toFixed(1)}" height="20" rx="4" fill="none" stroke="${corDoEstado}"/>` +
    `<path d="${textoEstado}" fill="${corDoEstado}"/>` +
    `<path d="${papelCurvas}" fill="${cores.pergaminho}"/>` +
    chips(fontes, cores, projeto.stack) +
    `<path d="${marcaCurvas}" fill="${cores['cinza-brasa']}"/>` +
    `</svg>\n`
  );
}

/** Todos os cartões: caminho do arquivo → conteúdo. */
export function arquivosDosCartoes(projetos, { cores, fontes, rotulos }) {
  const arquivos = {};
  for (const projeto of projetos)
    for (const idioma of ['pt', 'en']) {
      const nome =
        idioma === 'pt' ? `${projeto.id}.svg` : `${projeto.id}.en.svg`;
      arquivos[`${PASTA}/${nome}`] = svgDoCartao({
        projeto,
        idioma,
        cores,
        fontes,
        rotulos: rotulos[idioma],
      });
    }
  return arquivos;
}

async function main() {
  const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));
  // O Node 22 lê os .ts do app direto (remove os tipos).
  const { projetos } = await import('../app/conteudo/projetos.ts');
  const { pt } = await import('../app/i18n/pt.ts');
  const { en } = await import('../app/i18n/en.ts');
  const arquivos = arquivosDosCartoes(projetos, {
    cores,
    fontes: carregarFontesDoCartao(),
    rotulos: { pt, en },
  });
  const existentes = fs.existsSync(PASTA)
    ? fs.readdirSync(PASTA).map((f) => `${PASTA}/${f}`)
    : [];
  const sobrando = existentes.filter((f) => !(f in arquivos));

  if (process.argv.includes('--verificar')) {
    const desatualizados = Object.entries(arquivos).filter(
      ([arquivo, conteudo]) =>
        !fs.existsSync(arquivo) ||
        fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n') !== conteudo,
    );
    for (const [arquivo] of desatualizados)
      process.stderr.write(
        `${arquivo} está desatualizado: rode \`npm run cartoes\`\n`,
      );
    for (const arquivo of sobrando)
      process.stderr.write(
        `${arquivo} não é de nenhum projeto: rode \`npm run cartoes\`\n`,
      );
    if (desatualizados.length || sobrando.length) process.exit(1);
    process.stdout.write(`${Object.keys(arquivos).length} cartões em dia\n`);
    return;
  }
  fs.mkdirSync(PASTA, { recursive: true });
  for (const arquivo of sobrando) fs.rmSync(arquivo);
  for (const [arquivo, conteudo] of Object.entries(arquivos))
    fs.writeFileSync(arquivo, conteudo);
  process.stdout.write(
    `${Object.keys(arquivos).length} cartões gerados em ${PASTA}\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
