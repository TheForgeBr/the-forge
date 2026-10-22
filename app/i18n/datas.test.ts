import { describe, expect, it } from 'vitest';
import { formatarData } from './datas';

describe('formatarData', () => {
  it('escreve a data no jeito de cada idioma, sem zero à esquerda no dia', () => {
    expect(formatarData('2026-10-22', 'pt')).toBe('22 out 2026');
    expect(formatarData('2026-01-05', 'pt')).toBe('5 jan 2026');
    expect(formatarData('2026-01-05', 'en')).toBe('Jan 5, 2026');
  });
});
