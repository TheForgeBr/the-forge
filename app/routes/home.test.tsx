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

  it('tem texto corrido e código, para usar as três famílias de fonte', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('p')).toHaveTextContent(
      'A forja está acendendo',
    );
    expect(container.querySelector('code')).toHaveTextContent('git commit');
  });
});
