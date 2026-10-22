import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AnuncioDeSala } from './AnuncioDeSala';

function montar(rota: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <AnuncioDeSala />
            <Link to="/projetos">ir para Projetos</Link>
            <Link to="/en/contact">go to Contact</Link>
            <main>
              <Outlet />
            </main>
          </>
        ),
        children: [
          { index: true, element: <h1>olá forja</h1> },
          { path: 'projetos', element: <h1>Projetos</h1> },
          { path: 'en/contact', element: <h1>Contact</h1> },
        ],
      },
    ],
    { initialEntries: [rota] },
  );
  return render(<RouterProvider router={router} />);
}

const regiaoLive = (container: HTMLElement) =>
  container.querySelector('[aria-live="polite"]');

describe('AnuncioDeSala', () => {
  it('no primeiro carregamento não move o foco nem anuncia', () => {
    const { container } = montar('/');
    expect(document.activeElement).toBe(document.body);
    expect(regiaoLive(container)).toHaveTextContent('');
  });

  it('ao trocar de sala, foca o título e anuncia o nome da sala', async () => {
    const { container } = montar('/');
    fireEvent.click(screen.getByRole('link', { name: 'ir para Projetos' }));
    const titulo = await screen.findByRole('heading', { name: 'Projetos' });
    expect(document.activeElement).toBe(titulo);
    expect(titulo).toHaveAttribute('tabindex', '-1');
    expect(regiaoLive(container)).toHaveTextContent('Projetos');
  });

  it('uma nova renderização sem troca de rota não rouba o foco', async () => {
    montar('/');
    fireEvent.click(screen.getByRole('link', { name: 'ir para Projetos' }));
    await screen.findByRole('heading', { name: 'Projetos' });
    const link = screen.getByRole('link', { name: 'go to Contact' });
    link.focus();
    fireEvent.mouseOver(link);
    expect(document.activeElement).toBe(link);
  });

  it('anuncia no idioma da sala nova', async () => {
    const { container } = montar('/');
    fireEvent.click(screen.getByRole('link', { name: 'go to Contact' }));
    await screen.findByRole('heading', { name: 'Contact' });
    expect(regiaoLive(container)).toHaveTextContent('Contact');
  });
});
