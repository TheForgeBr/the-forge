// Gera as imagens de um ambiente de sala (issues 6.6 a 6.13) a partir de duas
// imagens de origem (em pé para o celular, deitada para o desktop): recorta no
// tamanho da faixa e grava AVIF e WebP em app/imagens/salas/<pasta>/,
// baixando a qualidade até cada arquivo caber no limite de 150 KB.
//
//   npm run imagens -- <pasta> <origem-celular> <origem-desktop>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Mesmo limite de app/cena/ambientes.tsx (ADR 0003). */
export const LIMITE = 150 * 1024;

export const TAMANHOS = {
  celular: { largura: 780, altura: 1688 },
  desktop: { largura: 1920, altura: 1200 },
};

const PASTAS = [
  'home',
  'projetos',
  'experiencias',
  'sobre',
  'posts',
  'contato',
  '404',
];

/**
 * A maior qualidade (de `inicio` para baixo, de `passo` em `passo`) cujo
 * resultado cabe no limite. Devolve null se nem a `minima` couber.
 */
export async function qualidadeQueCabe(
  codificar,
  limite,
  { inicio = 70, minima = 30, passo = 5 } = {},
) {
  for (let q = inicio; q >= minima; q -= passo) {
    const dados = await codificar(q);
    if (dados.length <= limite) return { qualidade: q, dados };
  }
  return null;
}

async function gerar(pasta, origens) {
  const { default: sharp } = await import('sharp');
  const destino = path.resolve('app/imagens/salas', pasta);
  fs.mkdirSync(destino, { recursive: true });
  for (const [variante, origem] of Object.entries(origens)) {
    const { largura, altura } = TAMANHOS[variante];
    const base = sharp(origem).resize(largura, altura, { fit: 'cover' });
    for (const formato of ['avif', 'webp']) {
      const achado = await qualidadeQueCabe(
        (quality) => base.clone()[formato]({ quality }).toBuffer(),
        LIMITE,
      );
      if (!achado)
        throw new Error(
          `${pasta}/${variante}.${formato} não cabe em ${LIMITE / 1024} KB nem com qualidade 30: simplifique a imagem`,
        );
      fs.writeFileSync(
        path.join(destino, `${variante}.${formato}`),
        achado.dados,
      );
      process.stdout.write(
        `${pasta}/${variante}.${formato}: ${(achado.dados.length / 1024).toFixed(1)} KB (qualidade ${achado.qualidade})\n`,
      );
    }
  }
}

function main() {
  const [pasta, celular, desktop] = process.argv.slice(2);
  if (!pasta || !celular || !desktop || !PASTAS.includes(pasta)) {
    process.stderr.write(
      `uso: npm run imagens -- <${PASTAS.join('|')}> <origem-celular> <origem-desktop>\n`,
    );
    process.exit(1);
  }
  gerar(pasta, { celular, desktop }).catch((erro) => {
    process.stderr.write(`${erro.message}\n`);
    process.exit(1);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
