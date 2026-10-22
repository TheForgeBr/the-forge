import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ErroDaForja } from './root';

const erroEm = (rota: string, status: number) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <ErroDaForja status={status} />
    </MemoryRouter>,
  );

describe('ErroDaForja', () => {
  it('mostra a página de erro do site para rota inexistente', () => {
    erroEm('/nao-existe', 404);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Esta sala não existe na forja.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar à forja' }),
    ).toHaveAttribute('href', '/');
  });

  it('fala inglês numa rota /en inexistente e volta para a Home em inglês', () => {
    erroEm('/en/missing', 404);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'This room does not exist in the forge.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to the forge' }),
    ).toHaveAttribute('href', '/en');
  });

  it('mostra um erro genérico para outros problemas', () => {
    erroEm('/', 500);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Algo deu errado na forja',
      }),
    ).toBeInTheDocument();
  });
});
