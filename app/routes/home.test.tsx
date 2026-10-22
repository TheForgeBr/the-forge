import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './home';

describe('Home', () => {
  it('mostra o título da forja', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'olá forja' }),
    ).toBeInTheDocument();
  });
});
