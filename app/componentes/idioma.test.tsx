import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHAVE_ESCOLHA } from '../i18n/idioma';
import { AvisoDeIdioma } from './AvisoDeIdioma';
import { SeletorDeIdioma } from './SeletorDeIdioma';

function emRota(rota: string, elemento: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[rota]}>{elemento}</MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('SeletorDeIdioma', () => {
  it('leva a sala em português para a mesma sala em inglês', () => {
    emRota('/projetos', <SeletorDeIdioma />);
    const link = screen.getByRole('link', { name: 'English' });
    expect(link).toHaveAttribute('href', '/en/projects');
    expect(link).toHaveAttribute('lang', 'en');
    expect(link).toHaveAttribute('hreflang', 'en');
  });

  it('leva a sala em inglês de volta ao português e guarda a escolha', () => {
    emRota('/en/contact', <SeletorDeIdioma />);
    const link = screen.getByRole('link', { name: 'Português' });
    expect(link).toHaveAttribute('href', '/contato');
    expect(link).toHaveAttribute('lang', 'pt-BR');
    fireEvent.click(link);
    expect(localStorage.getItem(CHAVE_ESCOLHA)).toBe('pt');
  });
});

describe('AvisoDeIdioma', () => {
  const navegadorEm = (lang: string) =>
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(lang);

  it('oferece o inglês a quem tem o navegador em inglês, sem redirecionar', () => {
    navegadorEm('en-US');
    emRota('/sobre', <AvisoDeIdioma />);
    expect(
      screen.getByText('This page is also available in English.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Read in English' }),
    ).toHaveAttribute('href', '/en/about');
  });

  it('não aparece quando o navegador já está no idioma da página', () => {
    navegadorEm('pt-BR');
    emRota('/sobre', <AvisoDeIdioma />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('some ao fechar e não volta depois da escolha', () => {
    navegadorEm('en-US');
    const { unmount } = emRota('/', <AvisoDeIdioma />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(localStorage.getItem(CHAVE_ESCOLHA)).toBe('pt');
    unmount();
    emRota('/', <AvisoDeIdioma />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
});

describe('idioma num post', () => {
  const navegadorEm = (lang: string) =>
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(lang);

  it('post sem tradução: o aviso não oferece o outro idioma', () => {
    navegadorEm('en-US');
    emRota('/posts/so-em-portugues', <AvisoDeIdioma />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('post traduzido: o seletor e o aviso levam à tradução do loader', async () => {
    navegadorEm('en-US');
    const Pagina = () => (
      <>
        <SeletorDeIdioma />
        <AvisoDeIdioma />
      </>
    );
    const router = createMemoryRouter(
      [
        {
          path: '/posts/:slug',
          loader: () => ({ traducao: '/en/posts/why' }),
          Component: Pagina,
        },
      ],
      { initialEntries: ['/posts/por-que'] },
    );
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole('link', { name: 'English' }),
    ).toHaveAttribute('href', '/en/posts/why');
    expect(
      screen.getByRole('link', { name: 'Read in English' }),
    ).toHaveAttribute('href', '/en/posts/why');
  });
});
