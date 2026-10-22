// Banner dos perfis do GitHub (issue 7.3): public/banner/banner.svg (pt) e
// banner.en.svg, 1280 x 320. O fundo é um recorte da imagem do ambiente da
// Home (marca/banner-fundo.jpg), embutido no SVG e escurecido; por cima, o
// símbolo da marca, o nome com o degradê de brasa, o cargo e a frase da Home,
// tudo em curvas. Sem fonte, script nem link externo, e com fundo próprio:
// legível no GitHub claro e escuro.
//
//   npm run banner               gera os banners
//   npm run banner -- --fundo    refaz o recorte do fundo a partir da Home
//   npm run verificar:banner     falha se algum banner estiver desatualizado
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  caminhoDoTexto,
  carregarFontesDoCartao,
  escaparXml,
  quebrarLinhas,
} from './gerar-cartoes.mjs';
import { pecasDoSimbolo } from './gerar-logo.mjs';

const LARGURA = 1280;
const ALTURA = 320;
const PASTA = 'public/banner';
const FUNDO = 'marca/banner-fundo.jpg';
const ORIGEM_DO_FUNDO = 'app/imagens/salas/home/desktop.webp';
/** Onde começa o texto, à direita do símbolo. */
const X_TEXTO = 288;

const largura = (fonte, texto, tamanho, espacamento = 0) =>
  caminhoDoTexto(fonte, texto, 0, 0, tamanho, espacamento).fim;

/** O SVG do banner com os textos de um idioma. */
export function svgDoBanner({ textos, cores, fontes, fundo }) {
  const nome = caminhoDoTexto(
    fontes.titulo,
    textos.nome,
    X_TEXTO,
    150,
    64,
    1,
  ).d;
  const cargo = caminhoDoTexto(
    fontes.marca,
    textos.cargo,
    X_TEXTO,
    198,
    26,
    0.5,
  ).d;
  const linhas = quebrarLinhas(
    (t) => largura(fontes.texto, t, 20),
    textos.frase,
    LARGURA - X_TEXTO - 56,
    2,
  );
  const frase = linhas
    .map(
      (linha, i) =>
        caminhoDoTexto(fontes.texto, linha, X_TEXTO, 242 + i * 26, 20, 0).d,
    )
    .join('');
  const descricao = `${textos.cargo}. ${textos.frase}`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}" width="${LARGURA}" height="${ALTURA}" role="img" aria-labelledby="titulo descricao">` +
    `<title id="titulo">${escaparXml(textos.nome)}</title>` +
    `<desc id="descricao">${escaparXml(descricao)}</desc>` +
    `<defs>` +
    `<clipPath id="moldura"><rect width="${LARGURA}" height="${ALTURA}" rx="8"/></clipPath>` +
    // Escurece mais à esquerda, onde fica o texto.
    `<linearGradient id="veu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${cores.fuligem}" stop-opacity="0.94"/><stop offset="0.55" stop-color="${cores.fuligem}" stop-opacity="0.78"/><stop offset="1" stop-color="${cores.fuligem}" stop-opacity="0.35"/></linearGradient>` +
    `<linearGradient id="letras" gradientUnits="userSpaceOnUse" x1="0" y1="152" x2="0" y2="104"><stop offset="0" stop-color="${cores.brasa}"/><stop offset="0.5" stop-color="${cores['ouro-forja']}"/><stop offset="1" stop-color="${cores.magia}"/></linearGradient>` +
    `</defs>` +
    `<g clip-path="url(#moldura)">` +
    `<rect width="${LARGURA}" height="${ALTURA}" fill="${cores.fuligem}"/>` +
    `<image href="data:image/jpeg;base64,${fundo.toString('base64')}" width="${LARGURA}" height="${ALTURA}" preserveAspectRatio="xMidYMid slice"/>` +
    `<rect width="${LARGURA}" height="${ALTURA}" fill="url(#veu)"/>` +
    `</g>` +
    `<rect x="0.5" y="0.5" width="${LARGURA - 1}" height="${ALTURA - 1}" rx="8" fill="none" stroke="${cores.ferro}"/>` +
    `<g transform="translate(56 64) scale(3)">${pecasDoSimbolo({ forte: cores['ouro-forja'], leve: cores.pergaminho })}</g>` +
    `<path d="${nome}" fill="url(#letras)"/>` +
    `<path d="${cargo}" fill="${cores['ouro-forja']}"/>` +
    `<path d="${frase}" fill="${cores.pergaminho}"/>` +
    `</svg>\n`
  );
}

export function arquivosDoBanner({ textos, cores, fontes, fundo }) {
  return {
    [`${PASTA}/banner.svg`]: svgDoBanner({
      textos: textos.pt,
      cores,
      fontes,
      fundo,
    }),
    [`${PASTA}/banner.en.svg`]: svgDoBanner({
      textos: textos.en,
      cores,
      fontes,
      fundo,
    }),
  };
}

/** Recorta a imagem da Home no formato do banner, leve o bastante para embutir. */
async function gerarFundo() {
  const { default: sharp } = await import('sharp');
  const dados = await sharp(ORIGEM_DO_FUNDO)
    .resize(LARGURA, ALTURA, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 60, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(FUNDO, dados);
  process.stdout.write(`${FUNDO}: ${(dados.length / 1024).toFixed(1)} KB\n`);
}

async function main() {
  if (process.argv.includes('--fundo')) await gerarFundo();
  const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));
  // O Node 22 lê os .ts do app direto (remove os tipos).
  const { pt } = await import('../app/i18n/pt.ts');
  const { en } = await import('../app/i18n/en.ts');
  const textosDe = (d) => ({
    nome: d['sala.home.titulo'],
    cargo: d['home.cargo'],
    frase: d['sala.home.texto'],
  });
  const arquivos = arquivosDoBanner({
    textos: { pt: textosDe(pt), en: textosDe(en) },
    cores,
    fontes: carregarFontesDoCartao(),
    fundo: fs.readFileSync(FUNDO),
  });
  if (process.argv.includes('--verificar')) {
    const desatualizados = Object.entries(arquivos).filter(
      ([arquivo, conteudo]) =>
        !fs.existsSync(arquivo) ||
        fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n') !== conteudo,
    );
    for (const [arquivo] of desatualizados)
      process.stderr.write(
        `${arquivo} está desatualizado: rode \`npm run banner\`\n`,
      );
    if (desatualizados.length) process.exit(1);
    process.stdout.write(`${Object.keys(arquivos).length} banners em dia\n`);
    return;
  }
  fs.mkdirSync(PASTA, { recursive: true });
  for (const [arquivo, conteudo] of Object.entries(arquivos)) {
    fs.writeFileSync(arquivo, conteudo);
    process.stdout.write(
      `${arquivo}: ${(conteudo.length / 1024).toFixed(1)} KB\n`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
