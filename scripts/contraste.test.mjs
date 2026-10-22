import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contraste, paresAbaixoDoMinimo } from './contraste.mjs';

const { cores } = JSON.parse(fs.readFileSync('marca/tokens.json', 'utf8'));

// Pares de texto normal da issue 1.1: precisam de 4,5:1 (WCAG AA).
const PARES_DE_TEXTO = [
  ['pergaminho', 'fuligem'],
  ['pergaminho', 'pedra'],
  ['cinza-brasa', 'fuligem'],
  ['ouro-forja', 'fuligem'],
];

describe('contraste', () => {
  it('dá 21:1 entre preto e branco e 1:1 entre cores iguais', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contraste('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contraste('#E8661E', '#E8661E')).toBe(1);
  });

  it('dá 4,54:1 para #767676 sobre branco, o cinza mínimo do AA', () => {
    expect(contraste('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  it('lista os pares que ficam abaixo do mínimo', () => {
    const exemplo = { claro: '#FFFFFF', medio: '#777777', escuro: '#000000' };
    expect(
      paresAbaixoDoMinimo(
        exemplo,
        [
          ['claro', 'escuro'],
          ['medio', 'claro'],
        ],
        4.5,
      ),
    ).toEqual(['medio sobre claro: 4.48:1 (mínimo 4.5:1)']);
  });
});

describe('paleta da marca', () => {
  it('atinge 4,5:1 nos pares de texto normal', () => {
    expect(paresAbaixoDoMinimo(cores, PARES_DE_TEXTO, 4.5)).toEqual([]);
  });
});
