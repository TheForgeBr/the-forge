import { describe, expect, it, vi } from 'vitest';
import {
  type Emissor,
  ajustarLimite,
  atualizar,
  capacidadePara,
  criarPool,
  emitir,
  iniciarFaiscas,
  vivas,
} from './particulas';

// Sorteio fixo: os testes não dependem de Math.random.
const meio = () => 0.5;

const emissor: Emissor = {
  x: 100,
  y: 200,
  largura: 0,
  velocidade: 100,
  espalhamento: 0,
  duracao: 1,
  cores: ['#F6A43A'],
};

describe('pool de partículas', () => {
  it('nasce com a capacidade pedida e nenhuma viva', () => {
    const pool = criarPool(10);
    expect(pool.particulas).toHaveLength(10);
    expect(vivas(pool)).toBe(0);
  });

  it('emitir acende partículas no emissor, sem passar da capacidade', () => {
    const pool = criarPool(3);
    expect(emitir(pool, emissor, 5, meio)).toBe(3);
    expect(vivas(pool)).toBe(3);
    const p = pool.particulas[0];
    expect(p).toMatchObject({ viva: true, x: 100, y: 200, vida: 1 });
  });

  it('respeita o limite ativo, menor que a capacidade', () => {
    const pool = criarPool(10);
    pool.limite = 4;
    emitir(pool, emissor, 10, meio);
    expect(vivas(pool)).toBe(4);
  });
});

describe('atualizar', () => {
  it('move pela velocidade e consome a vida com o tempo simulado', () => {
    const pool = criarPool(1);
    emitir(pool, emissor, 1, meio);
    const p = pool.particulas[0]!;
    const yAntes = p.y;
    atualizar(pool, 0.1);
    // Sobe (y menor) e perde 0,1 s de vida.
    expect(p.y).toBeLessThan(yAntes);
    expect(p.vida).toBeCloseTo(0.9);
  });

  it('apaga a partícula quando a vida acaba e reaproveita o lugar', () => {
    const pool = criarPool(1);
    emitir(pool, emissor, 1, meio);
    const original = pool.particulas[0];
    atualizar(pool, 1.01);
    expect(vivas(pool)).toBe(0);
    expect(emitir(pool, emissor, 1, meio)).toBe(1);
    // O mesmo objeto, sem alocar outro.
    expect(pool.particulas[0]).toBe(original);
    expect(pool.particulas[0]).toMatchObject({ viva: true, vida: 1 });
  });
});

describe('capacidade e desempenho', () => {
  it('telas maiores comportam mais faíscas, dentro de um teto', () => {
    const celular = capacidadePara(360, 740);
    const desktop = capacidadePara(1440, 900);
    expect(celular).toBeGreaterThan(0);
    expect(desktop).toBeGreaterThan(celular);
    expect(capacidadePara(7680, 4320)).toBeLessThanOrEqual(200);
  });

  it('reduz o limite quando os quadros demoram e não passa do mínimo', () => {
    const pool = criarPool(100);
    ajustarLimite(pool, 1 / 60);
    expect(pool.limite).toBe(100);
    ajustarLimite(pool, 1 / 20);
    expect(pool.limite).toBe(75);
    for (let i = 0; i < 50; i++) ajustarLimite(pool, 1 / 10);
    expect(pool.limite).toBe(10);
  });
});

describe('iniciarFaiscas', () => {
  it('sem contexto 2D não liga nada e devolve um parar inofensivo', () => {
    const canvas = { getContext: () => null } as unknown as HTMLCanvasElement;
    const raf = vi.fn();
    vi.stubGlobal('requestAnimationFrame', raf);
    const parar = iniciarFaiscas(canvas);
    expect(raf).not.toHaveBeenCalled();
    expect(() => parar()).not.toThrow();
    vi.unstubAllGlobals();
  });
});
