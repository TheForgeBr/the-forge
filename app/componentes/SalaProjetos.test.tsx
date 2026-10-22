import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { projetos } from '../conteudo/projetos';
import type { Projeto } from '../conteudo/tipos';
import { SalaProjetos, tecnologiasDosFiltros } from './SalaProjetos';

const emRota = (rota: string, lista?: readonly Projeto[]) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <SalaProjetos projetos={lista} />
    </MemoryRouter>,
  );

const cartoes = () => screen.getAllByRole('article');

describe('SalaProjetos', () => {
  it('mostra um cartão por projeto, na ordem de projetos.ts', () => {
    emRota('/projetos');
    expect(
      cartoes().map((c) => within(c).getByRole('heading').textContent),
    ).toEqual(projetos.map((p) => p.titulo.pt));
  });

  it('marca só o primeiro projeto em destaque', () => {
    emRota('/projetos');
    const marcados = cartoes().filter((c) =>
      c.classList.contains('em-destaque'),
    );
    expect(marcados).toHaveLength(1);
    expect(within(marcados[0]!).getByRole('heading')).toHaveTextContent(
      'Memento',
    );
  });

  it('links externos têm rel="noopener noreferrer"', () => {
    emRota('/projetos');
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links)
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sem repositório público, avisa que o código é privado', () => {
    emRota('/projetos');
    const memento = cartoes()[0]!;
    expect(within(memento).getByText('Código privado')).toBeInTheDocument();
    expect(within(memento).queryByRole('link')).toBeNull();
  });

  it('projeto papel-e-stack mostra só papel e stack, sem resumo nem links', () => {
    const restrito: Projeto = {
      id: 'restrito',
      titulo: { pt: 'Restrito', en: 'Restricted' },
      papel: { pt: 'Desenvolvedor', en: 'Developer' },
      stack: ['TypeScript'],
      estado: 'em-andamento',
      privacidade: 'papel-e-stack',
      destaque: false,
    };
    emRota('/projetos', [restrito]);
    const cartao = cartoes()[0]!;
    expect(cartao.querySelector('.resumo')).toBeNull();
    expect(within(cartao).queryByRole('link')).toBeNull();
    expect(within(cartao).queryByText('Código privado')).toBeNull();
    expect(cartao).toHaveTextContent('Desenvolvedor');
    expect(cartao).toHaveTextContent('TypeScript');
  });

  it('filtra por tecnologia e volta para todos', () => {
    emRota('/projetos');
    const filtro = screen.getByRole('button', { name: 'React Native' });
    fireEvent.click(filtro);
    expect(filtro).toHaveAttribute('aria-pressed', 'true');
    const esperados = projetos.filter((p) => p.stack.includes('React Native'));
    expect(cartoes()).toHaveLength(esperados.length);
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(cartoes()).toHaveLength(projetos.length);
  });

  it('em inglês, usa os textos em inglês', () => {
    emRota('/en/projects');
    expect(
      screen.getByRole('heading', { level: 1, name: /Projects/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(cartoes()[0]).toHaveTextContent('In progress');
  });
});

describe('tecnologiasDosFiltros', () => {
  it('só vira filtro a tecnologia de pelo menos 3 projetos, a mais usada primeiro', () => {
    const filtros = tecnologiasDosFiltros(projetos);
    expect(filtros[0]).toBe('TypeScript');
    for (const t of filtros)
      expect(
        projetos.filter((p) => p.stack.includes(t)).length,
      ).toBeGreaterThanOrEqual(3);
  });
});
