import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// O jsdom não calcula layout; estes testes guardam as regras que a passada da
// issue 4.7 mediu no navegador (320 a 1440 px), para que não voltem atrás.
const css = (arquivo: string) =>
  readFileSync(join(__dirname, arquivo), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

describe('responsividade (issue 4.7)', () => {
  it('os links das salas só ficam numa linha a partir de 64rem', () => {
    const layout = css('layout.css');
    const emLinha = /@media \(min-width: (\d+)rem\) \{\s*\.cabecalho \{/.exec(
      layout,
    );
    expect(emLinha?.[1]).toBe('64');
  });

  it('as grades usam minmax(0, 1fr): um cartão não alarga a página', () => {
    const salas = css('salas.css');
    expect(salas).not.toMatch(/repeat\(\d+, 1fr\)/);
    expect(salas).toMatch(
      /\.grade-projetos \{[^}]*grid-template-columns: minmax\(0, 1fr\)/,
    );
  });

  it('o título das salas encolhe no celular em vez de transbordar', () => {
    expect(css('salas.css')).toMatch(
      /\.sala-cabecalho h1 \{[^}]*font-size: clamp\(/,
    );
  });

  it('controles avulsos têm alvo de toque de pelo menos 44 px', () => {
    const regra = /([^{}]+)\{[^}]*min-height: 2\.75rem;/.exec(
      css('layout.css'),
    );
    const seletores = regra?.[1]?.split(',').map((s) => s.trim()) ?? [];
    expect(seletores).toEqual(
      expect.arrayContaining([
        '.pular',
        '.cabecalho a',
        '.cabecalho button',
        '.aviso-idioma a',
        '.aviso-idioma button',
        '.filtros button',
        '.links a',
        '.links-404 a',
      ]),
    );
  });
});

describe('contraste no topo (issue 4.7)', () => {
  it('o destaque ouro da sala atual não pega o botão Contato', () => {
    const layout = css('layout.css');
    expect(layout).not.toMatch(/\.cabecalho-salas a\[aria-current='page'\]/);
    expect(layout).toMatch(/\.cabecalho-salas li a\[aria-current='page'\]/);
  });
});
