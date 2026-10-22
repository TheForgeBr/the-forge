import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contraste } from '../../scripts/contraste.mjs';
import tokens from '../../marca/tokens.json';

const css = readFileSync(join(__dirname, 'brasa.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

describe('brasa viva', () => {
  it('o degradê usa só cores dos tokens', () => {
    const degrade = /--degrade-brasa: ([^;]+);/.exec(css)?.[1] ?? '';
    expect(degrade).not.toMatch(/#[0-9a-f]{3,8}/i);
    const cores = [...degrade.matchAll(/var\(--cor-([a-z-]+)\)/g)].map(
      (m) => m[1],
    );
    expect(cores.length).toBeGreaterThan(0);
  });

  it('cada cor do degradê tem 4,5:1 sobre a fuligem', () => {
    const degrade = /--degrade-brasa: ([^;]+);/.exec(css)?.[1] ?? '';
    const cores = tokens.cores as Record<string, string>;
    for (const [, nome] of degrade.matchAll(/var\(--cor-([a-z-]+)\)/g))
      expect(
        contraste(cores[nome!]!, cores.fuligem!),
        nome,
      ).toBeGreaterThanOrEqual(4.5);
  });

  it('as letras em brasa dos botões têm 4,5:1 sobre o fundo de pedra', () => {
    const degrade = /--degrade-brasa: ([^;]+);/.exec(css)?.[1] ?? '';
    const cores = tokens.cores as Record<string, string>;
    for (const [, nome] of degrade.matchAll(/var\(--cor-([a-z-]+)\)/g))
      expect(
        contraste(cores[nome!]!, cores.pedra!),
        nome,
      ).toBeGreaterThanOrEqual(4.5);
  });

  it('o brilho da respiração só sobe a partir do normal', () => {
    const brilhos = [...css.matchAll(/brightness\(([\d.]+)\)/g)].map((m) =>
      Number(m[1]),
    );
    expect(brilhos.length).toBeGreaterThan(0);
    expect(Math.min(...brilhos)).toBeGreaterThanOrEqual(1);
  });

  it('o fogo fica dentro das letras: sem brilho vazando do texto', () => {
    expect(css).not.toMatch(/drop-shadow|text-shadow/);
    expect(css).toMatch(/background-clip: text/);
  });

  it('a chama vai de baixo para cima e também está nos links das salas', () => {
    expect(css).toMatch(/--degrade-brasa: linear-gradient\(\s*to top/);
    expect(css).toContain('.cabecalho-salas li a');
  });

  it('com movimento reduzido, nada cintila', () => {
    const reduzido =
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*)\}\s*$/.exec(
        css,
      )?.[1];
    expect(reduzido).toMatch(/animation: none/);
    for (const seletor of [
      'main h1',
      '.botao',
      '.cabecalho .botao-contato',
      '.cartao-projeto::after',
      '.cabecalho-salas li a',
    ])
      expect(reduzido).toContain(seletor);
  });
});
