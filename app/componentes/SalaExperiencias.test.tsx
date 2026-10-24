import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { experiencias } from '../conteudo/experiencias';
import { formatarPeriodo, SalaExperiencias } from './SalaExperiencias';

const salaEm = (rota: string) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <SalaExperiencias />
    </MemoryRouter>,
  );

describe('formatarPeriodo', () => {
  it('junta o ano quando início e fim caem no mesmo ano', () => {
    expect(formatarPeriodo({ inicio: '2026-05', fim: '2026-09' }, 'pt')).toBe(
      'mai – set/2026',
    );
    expect(formatarPeriodo({ inicio: '2026-05', fim: '2026-09' }, 'en')).toBe(
      'May – Sep 2026',
    );
  });

  it('mostra os dois anos quando mudam, e "atual" no idioma', () => {
    expect(formatarPeriodo({ inicio: '2024-12', fim: '2026-04' }, 'pt')).toBe(
      'dez/2024 – abr/2026',
    );
    expect(formatarPeriodo({ inicio: '2026-09', fim: 'atual' }, 'pt')).toBe(
      'set/2026 – atual',
    );
    expect(formatarPeriodo({ inicio: '2026-09', fim: 'atual' }, 'en')).toBe(
      'Sep 2026 – present',
    );
  });
});

describe('SalaExperiencias', () => {
  it('é uma lista ordenada com as experiências na ordem do conteúdo', () => {
    salaEm('/experiencias');
    const lista = screen.getByRole('list', { name: 'Linha do tempo' });
    expect(lista.tagName).toBe('OL');
    const itens = within(lista).getAllByRole('listitem', { name: /./ });
    expect(itens.map((i) => i.getAttribute('aria-labelledby'))).toEqual(
      experiencias.map((e) => `experiencia-${e.id}`),
    );
  });

  it('marca só o cargo atual', () => {
    salaEm('/experiencias');
    const atuais = screen.getAllByText('Atual');
    expect(atuais).toHaveLength(1);
    expect(atuais[0]?.closest('li')).toHaveTextContent('SETA-AI');
  });

  it('período em <time> com datetime no formato AAAA-MM', () => {
    const { container } = salaEm('/experiencias');
    const nava = container.querySelector('#experiencia-nava')?.closest('li');
    const tempos = nava?.querySelectorAll('time') ?? [];
    expect([...tempos].map((t) => t.getAttribute('datetime'))).toEqual([
      '2026-05',
      '2026-09',
    ]);
  });

  it('a SETA-AI mostra papel, resumo, entregas e stack', () => {
    const { container } = salaEm('/experiencias');
    const seta = container.querySelector('#experiencia-seta-ai')?.closest('li');
    expect(seta?.querySelector('.resumo')).toHaveTextContent(
      'fábrica de software especializada em soluções com agentes',
    );
    expect(seta?.querySelectorAll('.entregas li')).toHaveLength(3);
    expect(seta).toHaveTextContent('Desenvolvedor');
    expect(seta).toHaveTextContent('GitHub Actions');
  });

  it('em inglês, textos e datas no idioma', () => {
    const { container } = salaEm('/en/experience');
    expect(
      screen.getByRole('heading', { level: 1, name: /Experience/ }),
    ).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('.periodo')].map((p) => p.textContent),
    ).toContain('Sep 2026 – present');
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});
