// Faíscas da forja em canvas 2D próprio (ADR 0003, issue 6.1). O motor é
// puro e testável com tempo simulado: um pool fixo de partículas reaproveitadas
// (nada é alocado a cada quadro), emitir, atualizar e desenhar. O laço
// (iniciarFaiscas) é carregado por importação dinâmica pelo componente
// Faiscas, depois da primeira pintura, e nunca com movimento reduzido.
import { anguloDoMartelo, avancarGolpe, criarGolpe } from './golpe';
import { iniciarLaco } from './laco';

export interface Particula {
  viva: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Segundos que faltam; a partícula apaga em 0. */
  vida: number;
  duracao: number;
  cor: string;
}

export interface Pool {
  readonly particulas: readonly Particula[];
  /** Quantas podem estar vivas agora; cai quando os quadros demoram. */
  limite: number;
}

export interface Emissor {
  /** Centro da boca da forja, em px do canvas. */
  readonly x: number;
  readonly y: number;
  /** Largura da boca: as faíscas nascem espalhadas nela. */
  readonly largura: number;
  /** Velocidade média de saída, em px/s. */
  readonly velocidade: number;
  /** Abertura do leque em radianos, em volta da vertical. */
  readonly espalhamento: number;
  /** Vida média, em segundos. */
  readonly duracao: number;
  readonly cores: readonly string[];
}

/** Puxa as faíscas de volta para baixo, em px/s². */
const GRAVIDADE = 90;
/** Perda de velocidade por segundo, pelo ar. */
const ARRASTO = 0.8;
/** Quadro mais longo que isso (menos de 40 fps) reduz o limite. */
const QUADRO_LENTO = 1 / 40;
/** Quadro mais curto que isso (perto de 60 fps) recupera aos poucos. */
const QUADRO_BOM = 1 / 55;
const LIMITE_MINIMO = 10;
const CAPACIDADE = { minima: 20, maxima: 200, pxPorFaisca: 9000 };

export function criarPool(capacidade: number): Pool {
  const particulas = Array.from({ length: capacidade }, (): Particula => ({
    viva: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    vida: 0,
    duracao: 1,
    cor: '',
  }));
  return { particulas, limite: capacidade };
}

export function vivas(pool: Pool) {
  let n = 0;
  for (const p of pool.particulas) if (p.viva) n++;
  return n;
}

/** Acende até `quantas` partículas em lugares livres; devolve quantas acendeu. */
export function emitir(
  pool: Pool,
  emissor: Emissor,
  quantas: number,
  aleatorio: () => number = Math.random,
) {
  let acesas = 0;
  let ativas = vivas(pool);
  for (const p of pool.particulas) {
    if (acesas === quantas || ativas >= pool.limite) break;
    if (p.viva) continue;
    const angulo = -Math.PI / 2 + (aleatorio() - 0.5) * emissor.espalhamento;
    const velocidade = emissor.velocidade * (0.7 + 0.6 * aleatorio());
    p.viva = true;
    p.x = emissor.x + (aleatorio() - 0.5) * emissor.largura;
    p.y = emissor.y;
    p.vx = Math.cos(angulo) * velocidade;
    p.vy = Math.sin(angulo) * velocidade;
    p.duracao = emissor.duracao * (0.6 + 0.8 * aleatorio());
    p.vida = p.duracao;
    p.cor = emissor.cores[Math.floor(aleatorio() * emissor.cores.length)] ?? '';
    acesas++;
    ativas++;
  }
  return acesas;
}

/** Avança `dt` segundos: move, freia, puxa para baixo e apaga as que acabaram. */
export function atualizar(pool: Pool, dt: number) {
  const freio = Math.max(0, 1 - ARRASTO * dt);
  for (const p of pool.particulas) {
    if (!p.viva) continue;
    p.vida -= dt;
    if (p.vida <= 0) {
      p.viva = false;
      continue;
    }
    p.vx *= freio;
    p.vy = p.vy * freio + GRAVIDADE * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

/** Quantas faíscas a tela comporta: mais área, mais faíscas, até um teto. */
export function capacidadePara(largura: number, altura: number) {
  const pela = Math.round((largura * altura) / CAPACIDADE.pxPorFaisca);
  return Math.min(CAPACIDADE.maxima, Math.max(CAPACIDADE.minima, pela));
}

/** Corta um quarto do limite num quadro lento e recupera devagar nos bons. */
export function ajustarLimite(pool: Pool, dt: number) {
  if (dt > QUADRO_LENTO)
    pool.limite = Math.max(LIMITE_MINIMO, Math.floor(pool.limite * 0.75));
  else if (dt < QUADRO_BOM)
    pool.limite = Math.min(pool.particulas.length, pool.limite + 1);
}

export function desenhar(
  ctx: CanvasRenderingContext2D,
  pool: Pool,
  escala: number,
) {
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineWidth = 2 * escala;
  for (const p of pool.particulas) {
    if (!p.viva) continue;
    ctx.globalAlpha = p.vida / p.duracao;
    ctx.strokeStyle = p.cor;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    // Um risco curto na direção do movimento, como faísca de verdade.
    ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** As cores vêm dos tokens (ADR 0006), lidas das variáveis CSS. */
function coresDosTokens() {
  const estilo = getComputedStyle(document.documentElement);
  return ['--cor-ouro-forja', '--cor-brasa', '--cor-chama']
    .map((v) => estilo.getPropertyValue(v).trim())
    .filter(Boolean);
}

/** O martelo da Home (issue 6.3): o grupo que gira e o ponto da batida. */
export interface Martelo {
  readonly cabeca: SVGGraphicsElement;
  readonly impacto: Element;
}

/** Faíscas por batida, saindo do ponto de impacto. */
const FAISCAS_POR_BATIDA = 18;
/** A forja mantém viva só esta fração do limite: o resto fica para as batidas. */
const FRACAO_DA_FORJA = 0.7;

/**
 * Liga as faíscas no canvas e devolve a função que para tudo. Sem contexto 2D,
 * não liga nada. Acompanha o tamanho da janela; o laço pausa com a aba oculta.
 * Com o `martelo`, o mesmo laço o faz bater e cada batida solta faíscas no
 * ponto de impacto, sempre em sincronia.
 */
export function iniciarFaiscas(
  canvas: HTMLCanvasElement,
  { martelo }: { martelo?: Martelo | null } = {},
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const escala = Math.min(window.devicePixelRatio || 1, 2);
  const pool = criarPool(capacidadePara(window.innerWidth, window.innerHeight));
  const cores = coresDosTokens();
  const golpe = criarGolpe();
  let emissor: Emissor;
  let acumulado = 0;

  function medir() {
    const largura = canvas.clientWidth * escala;
    const altura = canvas.clientHeight * escala;
    canvas.width = largura;
    canvas.height = altura;
    emissor = {
      x: largura / 2,
      y: altura * 0.92,
      largura: largura * 0.25,
      velocidade: altura * 0.45,
      espalhamento: 0.9,
      duracao: 1.4,
      cores,
    };
  }

  /** Estouro em leque no ponto de impacto, em px do canvas. */
  function bater(alvo: Element) {
    const ponto = alvo.getBoundingClientRect();
    const tela = canvas.getBoundingClientRect();
    emitir(
      pool,
      {
        x: (ponto.left - tela.left) * escala,
        y: (ponto.top - tela.top) * escala,
        largura: 4 * escala,
        velocidade: canvas.height * 0.35,
        espalhamento: 2.4,
        duracao: 0.7,
        cores,
      },
      FAISCAS_POR_BATIDA,
    );
  }

  function passo(dt: number) {
    ajustarLimite(pool, dt);
    // Uma vazão que mantém a forja em FRACAO_DA_FORJA do limite.
    acumulado += (dt * pool.limite * FRACAO_DA_FORJA) / emissor.duracao;
    const novas = Math.floor(acumulado);
    acumulado -= novas;
    emitir(pool, emissor, novas);
    if (martelo) {
      const batidas = avancarGolpe(golpe, dt);
      // No SVG o y cresce para baixo: o ângulo do ciclo (negativo sobe) entra
      // com o sinal trocado.
      martelo.cabeca.style.transform = `rotate(${-anguloDoMartelo(golpe.fase)}deg)`;
      if (batidas > 0) bater(martelo.impacto);
    }
    atualizar(pool, dt);
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    desenhar(ctx!, pool, escala);
  }

  medir();
  window.addEventListener('resize', medir);
  const pararLaco = iniciarLaco(passo);

  return () => {
    pararLaco();
    window.removeEventListener('resize', medir);
    // De volta à pose parada: martelo levantado.
    if (martelo) martelo.cabeca.style.transform = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
