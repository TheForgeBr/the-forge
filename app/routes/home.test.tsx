import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import Home from './home';

const homeEm = (rota: string) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Home />
    </MemoryRouter>,
  );

describe('Home', () => {
  it('apresenta quem é e o que faz, com um único h1', () => {
    homeEm('/');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Rhuan Marques' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Desenvolvedor full-stack')).toBeInTheDocument();
  });

  it('chama para Projetos e Contato no idioma da rota', () => {
    homeEm('/en');
    expect(
      screen.getByRole('link', { name: 'See the projects' }),
    ).toHaveAttribute('href', '/en/projects');
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
      'href',
      '/en/contact',
    );
  });

  it('os destaques usam os dados do conteúdo e a SETA-AI com o papel', () => {
    homeEm('/');
    const destaques = screen.getByRole('region', { name: 'Salas da forja' });
    const cartoes = within(destaques).getAllByRole('link');
    expect(cartoes.map((c) => c.getAttribute('href'))).toEqual([
      '/projetos',
      '/experiencias',
      '/posts',
    ]);
    expect(cartoes[0]).toHaveTextContent('Memento');
    expect(cartoes[1]).toHaveTextContent('SETA-AI');
    expect(cartoes[1]).toHaveTextContent('Desenvolvedor');
  });

  it('não sobrou o texto provisório "olá forja"', () => {
    const { container } = homeEm('/');
    expect(container.textContent).not.toMatch(/olá forja/i);
  });
});
