import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Cabecalho } from './Cabecalho';
import { Rodape } from './Rodape';

const emRota = (rota: string) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Cabecalho />
    </MemoryRouter>,
  );

describe('Cabecalho', () => {
  it('tem o link de pular para o conteúdo antes de tudo', () => {
    emRota('/');
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveTextContent('Pular para o conteúdo');
    expect(links[0]).toHaveAttribute('href', '#conteudo');
  });

  it('liga as seis salas em português e marca a atual', () => {
    emRota('/projetos');
    const nav = screen.getByRole('navigation', { name: 'Salas da forja' });
    const esperado = [
      ['Início', '/'],
      ['Projetos', '/projetos'],
      ['Experiências', '/experiencias'],
      ['Sobre', '/sobre'],
      ['Posts', '/posts'],
      ['Contato', '/contato'],
    ];
    for (const [nome, href] of esperado)
      expect(within(nav).getByRole('link', { name: nome })).toHaveAttribute(
        'href',
        href,
      );
    expect(within(nav).getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      within(nav).getByRole('link', { name: 'Início' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('em inglês, liga as salas pelos caminhos em inglês', () => {
    emRota('/en/about');
    const nav = screen.getByRole('navigation', { name: 'Rooms of the forge' });
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/en/contact',
    );
  });

  it('abre e fecha o menu no celular, inclusive com Esc', () => {
    const { container } = emRota('/');
    const cabecalho = container.querySelector('header');
    const botao = screen.getByRole('button', { name: 'Abrir menu' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(cabecalho).toHaveAttribute('data-menu', 'fechado');

    fireEvent.click(botao);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(cabecalho).toHaveAttribute('data-menu', 'aberto');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(cabecalho).toHaveAttribute('data-menu', 'fechado');
  });
});

describe('Rodape', () => {
  it('escreve THE FORGE em runas, com nome acessível', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Rodape />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('img', { name: 'The Forge, em runas' }),
    ).toHaveTextContent('ᚦᛖ ᚠᛟᚱᚷᛖ');
  });
});
