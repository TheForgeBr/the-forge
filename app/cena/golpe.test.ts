import { describe, expect, it } from 'vitest';
import {
  ANGULO_LEVANTADO,
  CICLO,
  IMPACTO,
  anguloDoMartelo,
  avancarGolpe,
  criarGolpe,
} from './golpe';

describe('anguloDoMartelo', () => {
  it('fica levantado antes da batida e encosta na bigorna no impacto', () => {
    expect(anguloDoMartelo(1.8)).toBe(ANGULO_LEVANTADO);
    expect(anguloDoMartelo(IMPACTO)).toBeCloseTo(0);
  });

  it('a descida é bem mais rápida que a subida', () => {
    // Tempo para percorrer de 10% a 90% do caminho, amostrado a cada 1 ms.
    const instantes = Array.from({ length: CICLO * 1000 }, (_, i) => i / 1000);
    const quando = (de: number, condicao: (a: number) => boolean) =>
      instantes.find((t) => t >= de && condicao(anguloDoMartelo(t)))!;
    const sobe =
      quando(0.12, (a) => a <= 0.9 * ANGULO_LEVANTADO) -
      quando(0.12, (a) => a <= 0.1 * ANGULO_LEVANTADO);
    const desce =
      quando(2.2, (a) => a >= 0.1 * ANGULO_LEVANTADO) -
      quando(2.2, (a) => a >= 0.9 * ANGULO_LEVANTADO);
    expect(desce).toBeLessThan(0.2);
    expect(sobe).toBeGreaterThan(desce * 3);
  });

  it('o ciclo se repete', () => {
    expect(anguloDoMartelo(0.7 + CICLO)).toBeCloseTo(anguloDoMartelo(0.7));
  });
});

describe('avancarGolpe com relógio simulado', () => {
  it('conta uma batida no passo que cruza o impacto, e só nele', () => {
    const golpe = criarGolpe();
    const batidas: number[] = [];
    // 10 ciclos em passos de 1/30 s.
    const passos = Math.round((CICLO * 10) / (1 / 30));
    for (let i = 0; i < passos; i++)
      if (avancarGolpe(golpe, 1 / 30) > 0) batidas.push(i);
    expect(batidas).toHaveLength(10);
    // A primeira cai no passo em que o tempo passa de IMPACTO.
    expect(batidas[0]).toBe(Math.ceil(IMPACTO * 30) - 1);
  });

  it('um passo longo que atravessa dois ciclos conta as duas batidas', () => {
    const golpe = criarGolpe();
    expect(avancarGolpe(golpe, CICLO * 2)).toBe(2);
  });
});
