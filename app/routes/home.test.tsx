import { render, screen } from '@testing-library/react';
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
  it('mostra o título da forja em português na raiz', () => {
    homeEm('/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'olá forja' }),
    ).toBeInTheDocument();
  });

  it('mostra o título em inglês em /en', () => {
    homeEm('/en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'hello, forge' }),
    ).toBeInTheDocument();
  });

  it('tem texto corrido e código, para usar as três famílias de fonte', () => {
    const { container } = homeEm('/');
    expect(container.querySelector('p')).toHaveTextContent(
      'A forja está acendendo',
    );
    expect(container.querySelector('code')).toHaveTextContent('git commit');
  });
});
