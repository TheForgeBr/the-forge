import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { Carregamento } from './Carregamento';

const em = (rota: string) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Carregamento />
    </MemoryRouter>,
  );

afterEach(() => {
  document.documentElement.removeAttribute('data-carregando');
  delete (window as { __forjaPronta?: boolean }).__forjaPronta;
});

describe('Carregamento', () => {
  it('mostra o martelo, o nome e o cargo, e é só decoração', () => {
    const { container } = em('/');
    const tela = container.querySelector('.carregamento');
    expect(tela).toHaveAttribute('aria-hidden', 'true');
    expect(tela).toHaveTextContent('Rhuan Marques');
    expect(tela).toHaveTextContent('Desenvolvedor full-stack');
    expect(tela?.querySelector('.martelo')).not.toBeNull();
  });

  it('ao hidratar, marca o site como pronto e a tela some', () => {
    document.documentElement.setAttribute('data-carregando', '');
    em('/en');
    expect(document.documentElement.hasAttribute('data-carregando')).toBe(
      false,
    );
    expect((window as { __forjaPronta?: boolean }).__forjaPronta).toBe(true);
  });
});

describe('estilos do carregamento', () => {
  const css = readFileSync(
    join(__dirname, '../estilos/carregamento.css'),
    'utf8',
  );

  it('a tela só aparece com o atributo data-carregando no <html>', () => {
    expect(css).toMatch(/\.carregamento \{\s*display: none;/);
    expect(css).toMatch(
      /html\[data-carregando\] \.carregamento \{[^}]*display: flex/,
    );
  });

  it('com movimento reduzido, o martelo fica parado no alto', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{[^@]*\.martelo,[^}]*animation: none/,
    );
  });
});

describe('desenho do martelo', () => {
  it('é élfico: curvas, face de bater em bloco e a folha de luz', () => {
    const { container } = em('/');
    expect(container.querySelectorAll('.martelo rect')).toHaveLength(0);
    const partes = container.querySelectorAll('.martelo .martelo-aco');
    expect(partes).toHaveLength(2);
    // A face vai de x 41 a 57: um bloco, não a lâmina larga de antes (33 a 65).
    expect(partes[1]?.getAttribute('d')).toContain('L41 62 L57 62');
    expect(container.querySelector('.martelo .martelo-luz')).not.toBeNull();
  });
});
