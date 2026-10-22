// Gera o logo, os ícones e a imagem Open Graph de reserva a partir de
// marca/tokens.json e da Cinzel do @fontsource (issue 1.3, ADR 0006). O letreiro vira caminho: o SVG não depende de fonte
// instalada, como o GitHub exige. Com --verificar, só falha se algum arquivo
// estiver desatualizado.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import opentype from 'opentype.js';

const FONTES = 'node_modules/@fontsource/cinzel/files';

// Peças do símbolo, num quadrado de 64 x 64 (proposta A+C 2 aprovada).
export const ANEL = 'M45.5 8.6 A27 27 0 1 1 18.5 8.6';
export const CODIGO =
  'M26.5 3 L22 6.5 L26.5 10 M34 2 L30 11 M37.5 3 L42 6.5 L37.5 10';
export const ESTRELA =
  'M32 15 L34.4 21.6 L41 24 L34.4 26.4 L32 33 L29.6 26.4 L23 24 L29.6 21.6 Z';
export const BIGORNA =
  'M4 25 H54 V31 H48 Q42 33 40 39 V45 H46 V51 H18 V45 H24 V39 Q22 33 14 31 Q7 29 4 25 Z';

// Recebe os atributos de cor de cada papel: `traco` (anel e </>), `leve`
// (estrela) e `forte` (bigorna).
function pecas({ traco, leve, forte }) {
  return [
    `<path fill="none" ${traco} stroke-width="3.5" stroke-linecap="round" d="${ANEL}"/>`,
    `<path fill="none" ${traco} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="${CODIGO}"/>`,
    `<path ${leve} d="${ESTRELA}"/>`,
    `<path ${forte} transform="translate(14 19) scale(0.62)" d="${BIGORNA}"/>`,
  ].join('');
}

/** `forte` pinta a bigorna; `leve`, o anel, o </> e a estrela. */
export function pecasDoSimbolo({ forte, leve }) {
  return pecas({
    traco: `stroke="${leve}"`,
    leve: `fill="${leve}"`,
    forte: `fill="${forte}"`,
  });
}

export function variantes(cores) {
  return {
    escuro: {
      forte: cores['ouro-forja'],
      leve: cores.pergaminho,
      texto: cores.pergaminho,
      br: cores['ouro-forja'],
    },
    claro: {
      forte: cores.fuligem,
      leve: cores.brasa,
      texto: cores.fuligem,
      br: cores.brasa,
    },
  };
}

function carregarFonte(peso) {
  const buf = fs.readFileSync(`${FONTES}/cinzel-latin-${peso}-normal.woff`);
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
}

/** Desenha o texto como um único caminho; devolve o caminho e onde ele termina. */
export function caminhoDoTexto(fonte, texto, x, y, tamanho, espacamento) {
  const escala = tamanho / fonte.unitsPerEm;
  const glifos = fonte.stringToGlyphs(texto);
  let cursor = x;
  let d = '';
  glifos.forEach((glifo, i) => {
    d += glifo.getPath(cursor, y, tamanho).toPathData(2);
    const proximo = glifos[i + 1];
    cursor += glifo.advanceWidth * escala + espacamento;
    if (proximo) cursor += fonte.getKerningValue(glifo, proximo) * escala;
  });
  return { d, fim: cursor - espacamento };
}

function svg(viewBox, titulo, corpo) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="titulo">` +
    `<title id="titulo">${titulo}</title>${corpo}</svg>\n`
  );
}

export function svgDoLogo(cores, fontes) {
  const { largura, corpo } = conteudoDoLogo(cores, fontes);
  return svg(`0 0 ${largura} 96`, 'The Forge BR', corpo);
}

function conteudoDoLogo(cores, fontes) {
  const nome = caminhoDoTexto(fontes[700], 'THE FORGE', 84, 58, 34, 2);
  const br = caminhoDoTexto(fontes[600], 'BR', nome.fim + 12, 58, 22, 2);
  return {
    largura: Math.ceil(br.fim + 4),
    corpo:
      `<g transform="translate(0 16)">${pecasDoSimbolo(cores)}</g>` +
      `<path fill="${cores.texto}" d="${nome.d}"/>` +
      `<path fill="${cores.br}" d="${br.d}"/>`,
  };
}

/** Símbolo sobre um quadrado de fundo, para os ícones em PNG. */
export function svgDoIcone(cores, fundo, raio) {
  return svg(
    '0 0 64 64',
    'The Forge BR',
    `<rect width="64" height="64" rx="${raio}" fill="${fundo}"/>` +
      `<g transform="translate(6 6) scale(0.8125)">${pecasDoSimbolo(cores)}</g>`,
  );
}

/** Imagem Open Graph de reserva (1200 x 630): o logo no centro, sobre fuligem. */
export function svgDaImagemOg(cores, fundo, fontes) {
  const { largura, corpo } = conteudoDoLogo(cores, fontes);
  const w = 880;
  const h = (w * 96) / largura;
  return svg(
    '0 0 1200 630',
    'The Forge BR',
    `<rect width="1200" height="630" fill="${fundo}"/>` +
      `<svg x="${(1200 - w) / 2}" y="${((630 - h) / 2).toFixed(2)}" width="${w}" height="${h.toFixed(2)}" viewBox="0 0 ${largura} 96">${corpo}</svg>`,
  );
}

export function png(svgTexto, largura) {
  return new Resvg(svgTexto, {
    fitTo: { mode: 'width', value: largura },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
}

export function svgDoSimbolo(cores) {
  return svg('0 0 64 64', 'The Forge BR', pecasDoSimbolo(cores));
}

/** Favicon que segue o tema do navegador: claro por padrão, escuro no tema escuro. */
export function svgDoFavicon({ escuro, claro }) {
  const estilo =
    `<style>.f{fill:${claro.forte}}.l{stroke:${claro.leve}}.e{fill:${claro.leve}}` +
    `@media (prefers-color-scheme: dark){.f{fill:${escuro.forte}}.l{stroke:${escuro.leve}}.e{fill:${escuro.leve}}}</style>`;
  return svg(
    '0 0 64 64',
    'The Forge BR',
    estilo +
      pecas({ traco: 'class="l"', leve: 'class="e"', forte: 'class="f"' }),
  );
}

export function arquivosDoLogo(cores, fontes) {
  const { escuro, claro } = variantes(cores);
  return {
    'marca/logo.svg': svgDoLogo(escuro, fontes),
    'marca/logo-claro.svg': svgDoLogo(claro, fontes),
    'marca/simbolo.svg': svgDoSimbolo(escuro),
    'marca/simbolo-claro.svg': svgDoSimbolo(claro),
    'public/favicon.svg': svgDoFavicon({ escuro, claro }),
    // PNG para navegadores sem favicon SVG e para a tela inicial do iPhone,
    // que arredonda os cantos sozinha.
    'public/favicon-32.png': png(svgDoIcone(escuro, cores.fuligem, 12), 32),
    'public/apple-touch-icon.png': png(
      svgDoIcone(escuro, cores.fuligem, 0),
      180,
    ),
    'public/og/padrao.png': png(
      svgDaImagemOg(escuro, cores.fuligem, fontes),
      1200,
    ),
  };
}

function igual(arquivo, conteudo) {
  if (!fs.existsSync(arquivo)) return false;
  return Buffer.isBuffer(conteudo)
    ? fs.readFileSync(arquivo).equals(conteudo)
    : fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n') === conteudo;
}

export function carregarFontes() {
  return { 600: carregarFonte(600), 700: carregarFonte(700) };
}

function main() {
  const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));
  const arquivos = arquivosDoLogo(cores, carregarFontes());
  if (process.argv.includes('--verificar')) {
    const desatualizados = Object.entries(arquivos).filter(
      ([arquivo, conteudo]) => !igual(arquivo, conteudo),
    );
    for (const [arquivo] of desatualizados)
      process.stderr.write(
        `${arquivo} está desatualizado em relação a marca/tokens.json: rode \`npm run logo\`\n`,
      );
    if (desatualizados.length) process.exit(1);
    process.stdout.write(
      `${Object.keys(arquivos).length} arquivos do logo em dia\n`,
    );
    return;
  }
  for (const [arquivo, conteudo] of Object.entries(arquivos)) {
    fs.mkdirSync(path.dirname(arquivo), { recursive: true });
    fs.writeFileSync(arquivo, conteudo);
    process.stdout.write(`${arquivo} gerado\n`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
