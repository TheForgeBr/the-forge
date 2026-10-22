import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { meta } from '../routes/nao-encontrada';
import { SalaNaoEncontrada } from './SalaNaoEncontrada';

const em = (rota: string) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <SalaNaoEncontrada />
    </MemoryRouter>,
  );

describe('SalaNaoEncontrada', () => {
  it('diz que a sala não existe e leva de volta à Home, a Projetos e a Contato', () => {
    em('/qualquer-coisa');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Esta sala não existe na forja.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar à forja' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'href',
      '/projetos',
    );
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute(
      'href',
      '/contato',
    );
  });

  it('em /en, fala inglês e volta para as salas em inglês', () => {
    em('/en/missing');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'This room does not exist in the forge.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to the forge' }),
    ).toHaveAttribute('href', '/en');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/en/contact',
    );
  });
});

describe('meta da 404', () => {
  it('pede para não indexar e traz o título no idioma', () => {
    const pt = meta({ location: { pathname: '/404' } });
    expect(pt).toContainEqual({ name: 'robots', content: 'noindex' });
    expect(pt).toContainEqual({
      title: 'Página não encontrada | The Forge BR',
    });
    expect(meta({ location: { pathname: '/en/404' } })).toContainEqual({
      title: 'Page not found | The Forge BR',
    });
  });
});
