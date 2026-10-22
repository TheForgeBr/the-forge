import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErroDaForja } from './root';

describe('ErroDaForja', () => {
  it('mostra a página de erro do site para rota inexistente', () => {
    render(<ErroDaForja status={404} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar à forja' }),
    ).toHaveAttribute('href', '/');
  });

  it('mostra um erro genérico para outros problemas', () => {
    render(<ErroDaForja status={500} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Algo deu errado na forja',
      }),
    ).toBeInTheDocument();
  });
});
