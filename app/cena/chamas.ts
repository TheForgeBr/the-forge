// Fogo da forja em canvas 2D (ADR 0003, issue 6.2), sem WebGL: uma grade de
// calor em baixa resolução onde o calor nasce na base, sobe e esfria com um
// pouco de ruído. Cada célula vira uma cor da paleta (tokens chama, brasa e
// ouro-forja) e o canvas pequeno é ampliado pelo CSS. Roda a 30 quadros por
// segundo pelo laço compartilhado; com movimento reduzido, desenha um quadro
// só. Carregado por importação dinâmica pelo componente Fogo.
import { iniciarLaco } from './laco';

export interface Campo {
  readonly largura: number;
  readonly altura: number;
  /** Calor de cada célula, de 0 a 1, linha a linha de cima para baixo. */
  readonly calor: Float32Array;
}

/** Colunas da grade; as linhas seguem a proporção do canvas. */
const COLUNAS = 96;
/**
 * Opacidade do fogo mais quente: o texto claro por cima mantém 4,5:1 (o
 * teste chamas.test.ts confere com a fórmula do WCAG).
 */
export const OPACIDADE_MAXIMA = 0.45;
/** Passos simulados antes do quadro estático, para o fogo já estar formado. */
const PASSOS_DO_QUADRO_ESTATICO = 80;
/** Quanto a intensidade anda por segundo rumo à da sala nova. */
const TRANSICAO = 1.5;

export function criarCampo(largura: number, altura: number): Campo {
  return { largura, altura, calor: new Float32Array(largura * altura) };
}

/** Um passo do fogo: acende a base pela intensidade e faz o calor subir. */
export function avancarFogo(
  campo: Campo,
  intensidade: number,
  aleatorio: () => number = Math.random,
) {
  const { largura: l, altura: a, calor } = campo;
  const base = (a - 1) * l;
  // A base muda devagar (70% do quadro anterior): manchas de calor que
  // duram alguns quadros viram as línguas da chama.
  for (let x = 0; x < l; x++) {
    const novo =
      calor[base + x]! * 0.7 + 0.3 * intensidade * (0.3 + 0.7 * aleatorio());
    // Sem o corte, a queda geométrica nunca chega a zero e a forja não apaga.
    calor[base + x] = novo < 0.01 ? 0 : novo;
  }
  // Cada célula herda a média das três de baixo e esfria um pouco. De cima
  // para baixo: a linha de baixo ainda é a do quadro anterior.
  for (let y = 0; y < a - 1; y++) {
    const abaixo = (y + 1) * l;
    for (let x = 0; x < l; x++) {
      const media =
        (calor[abaixo + Math.max(0, x - 1)]! +
          calor[abaixo + x]! +
          calor[abaixo + Math.min(l - 1, x + 1)]!) /
        3;
      const resfriamento = (aleatorio() * 2.2) / a;
      calor[y * l + x] = Math.max(0, media - resfriamento);
    }
  }
}

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Tabela de 256 cores RGBA, do frio (transparente) ao quente (a última cor).
 * `cores` vai da mais fria à mais quente.
 */
export function paletaDoFogo(cores: readonly string[]) {
  const paleta = new Uint8ClampedArray(256 * 4);
  const pontos = cores.map(rgb);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const posicao = t * (pontos.length - 1);
    const de = pontos[Math.floor(posicao)] ?? [0, 0, 0];
    const para = pontos[Math.ceil(posicao)] ?? de;
    const mistura = posicao - Math.floor(posicao);
    for (let c = 0; c < 3; c++)
      paleta[i * 4 + c] = de[c]! + (para[c]! - de[c]!) * mistura;
    // As células quase frias somem, para a chama ter borda.
    paleta[i * 4 + 3] =
      t < 0.08 ? 0 : Math.min(1, t * 1.4) * OPACIDADE_MAXIMA * 255;
  }
  return paleta;
}

function coresDosTokens() {
  const estilo = getComputedStyle(document.documentElement);
  return ['--cor-chama', '--cor-brasa', '--cor-ouro-forja']
    .map((v) => estilo.getPropertyValue(v).trim())
    .filter(Boolean);
}

export interface ControleDoFogo {
  definirIntensidade(intensidade: number): void;
  parar(): void;
}

/**
 * Liga o fogo no canvas. Com `estatico`, desenha um quadro e não anima. Sem
 * contexto 2D, não liga nada.
 */
export function iniciarFogo(
  canvas: HTMLCanvasElement,
  { estatico, intensidade }: { estatico: boolean; intensidade: number },
): ControleDoFogo {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { definirIntensidade: () => {}, parar: () => {} };

  const proporcao = canvas.clientHeight / Math.max(1, canvas.clientWidth);
  const linhas = Math.max(8, Math.round(COLUNAS * proporcao));
  canvas.width = COLUNAS;
  canvas.height = linhas;
  const campo = criarCampo(COLUNAS, linhas);
  const paleta = paletaDoFogo(coresDosTokens());
  const imagem = ctx.createImageData(COLUNAS, linhas);
  let atual = intensidade;
  let alvo = intensidade;

  function pintar() {
    const dados = imagem.data;
    for (let i = 0; i < campo.calor.length; i++) {
      const cor = Math.min(255, Math.floor(campo.calor[i]! * 255)) * 4;
      dados[i * 4] = paleta[cor]!;
      dados[i * 4 + 1] = paleta[cor + 1]!;
      dados[i * 4 + 2] = paleta[cor + 2]!;
      dados[i * 4 + 3] = paleta[cor + 3]!;
    }
    ctx!.putImageData(imagem, 0, 0);
  }

  function quadroEstatico() {
    for (let i = 0; i < PASSOS_DO_QUADRO_ESTATICO; i++)
      avancarFogo(campo, alvo);
    pintar();
  }

  if (estatico) {
    quadroEstatico();
    return {
      definirIntensidade(nova) {
        alvo = nova;
        quadroEstatico();
      },
      parar: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
    };
  }

  const pararLaco = iniciarLaco(
    (dt) => {
      // A troca de sala não é um corte: a chama cresce ou baixa aos poucos.
      atual += (alvo - atual) * Math.min(1, dt * TRANSICAO);
      avancarFogo(campo, atual);
      pintar();
    },
    { intervalo: 1 / 30 },
  );
  return {
    definirIntensidade(nova) {
      alvo = nova;
    },
    parar() {
      pararLaco();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
