import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NOMES_DAS_RUNAS, Runa, RUNAS } from './Runa';

describe('Runa', () => {
  it('há um arquivo para cada nome, e nenhum arquivo sem nome', () => {
    expect(Object.keys(RUNAS).sort()).toEqual([...NOMES_DAS_RUNAS].sort());
  });

  it('é decorativa por padrão: some para o leitor de tela', () => {
    const { container } = render(<Runa nome="projetos" />);
    const span = container.querySelector('span.runa');
    expect(span).toHaveAttribute('aria-hidden', 'true');
    expect(span?.querySelector('svg')).toHaveAttribute('focusable', 'false');
    expect(span?.querySelector('title')).toBeNull();
  });

  it('com rótulo, vira imagem com nome acessível', () => {
    const { getByRole } = render(
      <Runa nome="baixar" rotulo="Baixar currículo" />,
    );
    expect(getByRole('img', { name: 'Baixar currículo' })).toBeInTheDocument();
  });
});
