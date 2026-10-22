import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SALAS } from '../../scripts/rotas.mjs';
import { POSICOES } from './camera';

// O jsdom não tem a Web Animations API: o useAnimate do Motion vira um espião
// que registra cada viagem pedida, e a faixa ganha um animate de mentira.
const viagens = vi.hoisted(() => vi.fn());
vi.mock('motion/react-mini', async () => {
  const { createRef } = await import('react');
  return { useAnimate: () => [createRef(), viagens] };
});
HTMLElement.prototype.animate ??= (() => ({})) as never;
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
          { path: '*', element: <h1>404</h1> },
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
    expect(faixa?.style.transform).toBe('translate(-500vw, 0vh) scale(1)');
  });
});

describe('câmera', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    viagens.mockClear();
  });

  it('tem uma posição para cada sala, cada uma num lugar diferente', () => {
    expect(Object.keys(POSICOES).sort()).toEqual(
      SALAS.map((s) => s.sala).sort(),
    );
    const lugares = Object.values(POSICOES).map((p) => `${p.x},${p.y}`);
    expect(new Set(lugares).size).toBe(SALAS.length);
  });

  it('a navegação não espera a viagem: conteúdo e destino mudam na hora', async () => {
    const { container } = montar('/');
    const inicio = Date.now();
    fireEvent.click(screen.getByRole('link', { name: 'Contato' }));
    await screen.findByRole('heading', { name: 'Contato' }, { timeout: 300 });
    expect(Date.now() - inicio).toBeLessThan(750);
    expect(
      container.querySelector<HTMLElement>('.cena-faixa')?.style.transform,
    ).toBe('translate(-500vw, 0vh) scale(1)');
    expect(viagens).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      {
        transform: [
          'translate(0vw, 0vh) scale(1)',
          'translate(-500vw, 0vh) scale(1)',
        ],
      },
      expect.objectContaining({ duration: 0.75 }),
    );
  });

  it('entrar direto numa sala não pede viagem', () => {
    montar('/contato');
    expect(viagens).not.toHaveBeenCalled();
  });

  it('com movimento reduzido no sistema, a câmera não viaja', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const { container } = montar('/');
    expect(container.querySelector('.cena-faixa')).toHaveAttribute(
      'data-movimento',
      'reduzido',
    );
    fireEvent.click(screen.getByRole('link', { name: 'Projetos' }));
    await screen.findByRole('heading', { name: 'Projetos' });
    expect(viagens).not.toHaveBeenCalled();
  });
});

describe('forja apagada', () => {
  it('numa rota fora das salas, a cena fica na bigorna e apagada', () => {
    const { container } = montar('/nao-existe');
    const cena = container.querySelector('.cena');
    expect(cena).toHaveAttribute('data-sala', 'home');
    expect(cena).toHaveAttribute('data-apagada');
  });

  it('numa sala, a cena não fica apagada', () => {
    const { container } = montar('/projetos');
    expect(container.querySelector('.cena')).not.toHaveAttribute(
      'data-apagada',
    );
  });
});

describe('ambientes das salas (6.6)', () => {
  const imagem = (sala: string) => ({
    celular: { webp: `/${sala}-c.webp` },
    desktop: { webp: `/${sala}-d.webp` },
  });
  const imagens = { home: imagem('home'), projetos: imagem('projetos') };

  function montarComImagens(rota: string) {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <>
              <CenaForja imagens={imagens} />
              <Link to="/projetos">Projetos</Link>
              <Outlet />
            </>
          ),
          children: [
            { index: true, element: <h1>Início</h1> },
            { path: 'projetos', element: <h1>Projetos</h1> },
          ],
        },
      ],
      { initialEntries: [rota] },
    );
    return render(<RouterProvider router={router} />);
  }

  const urls = (container: HTMLElement) =>
    [...container.querySelectorAll('.ambiente img')].map((i) =>
      i.getAttribute('src'),
    );

  it('na entrada, só a imagem da sala atual entra no HTML', () => {
    const { container } = montarComImagens('/');
    expect(urls(container)).toEqual(['/home-c.webp']);
  });

  it('a imagem de outra sala só é pedida quando a câmera vai até ela, e fica', async () => {
    const { container } = montarComImagens('/');
    fireEvent.click(screen.getByRole('link', { name: 'Projetos' }));
    await screen.findByRole('heading', { name: 'Projetos' });
    expect(urls(container)).toEqual(['/home-c.webp', '/projetos-c.webp']);
  });

  it('sala sem imagem fica só com o degradê', () => {
    const { container } = montarComImagens('/projetos');
    const experiencias = container.querySelector(
      '[data-ambiente="linha-do-tempo"]',
    );
    expect(experiencias?.querySelector('.ambiente')).toBeNull();
  });
});
