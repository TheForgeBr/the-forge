import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CenaForja } from './CenaForja';

// Um layout como o raiz: a cena fica fora do Outlet, que troca com a rota.
function montar(rota: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <CenaForja />
            <Link to="/projetos">Projetos</Link>
            <Link to="/contato">Contato</Link>
            <Outlet />
          </>
        ),
        children: [
          { index: true, element: <h1>Início</h1> },
          { path: 'projetos', element: <h1>Projetos</h1> },
          { path: 'contato', element: <h1>Contato</h1> },
        ],
      },
    ],
    { initialEntries: [rota] },
  );
  return render(<RouterProvider router={router} />);
}

describe('CenaForja', () => {
  it('é só decoração: aria-hidden e nada focável', () => {
    const { container } = montar('/');
    const cena = container.querySelector('.cena');
    expect(cena).toHaveAttribute('aria-hidden', 'true');
    expect(cena?.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
  });

  it('tem uma camada para cada uma das seis salas', () => {
    const { container } = montar('/');
    expect(
      [...container.querySelectorAll('.cena-sala')].map(
        (s) => (s as HTMLElement).dataset.ambiente,
      ),
    ).toEqual([
      'bigorna',
      'arsenal',
      'linha-do-tempo',
      'bancada',
      'biblioteca',
      'porta',
    ]);
  });

  it('não é remontada ao navegar: é o mesmo elemento antes e depois', async () => {
    const { container } = montar('/');
    const antes = container.querySelector('.cena');
    expect(antes).toHaveAttribute('data-sala', 'home');

    fireEvent.click(screen.getByRole('link', { name: 'Projetos' }));
    await screen.findByRole('heading', { name: 'Projetos' });
    expect(container.querySelector('.cena')).toBe(antes);
    expect(antes).toHaveAttribute('data-sala', 'projetos');

    fireEvent.click(screen.getByRole('link', { name: 'Contato' }));
    await screen.findByRole('heading', { name: 'Contato' });
    expect(container.querySelector('.cena')).toBe(antes);
  });

  it('entra direto na sala da rota, com a faixa na posição dela', () => {
    const { container } = montar('/contato');
    const faixa = container.querySelector<HTMLElement>('.cena-faixa');
    expect(faixa?.style.transform).toBe('translateX(-500vw)');
  });
});
