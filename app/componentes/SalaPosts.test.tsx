import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { URL_BASE } from '../site';
import { SalaPosts, type ResumoDoPost } from './SalaPosts';

const POSTS: ResumoDoPost[] = [
  {
    slug: 'novo',
    titulo: 'O post mais novo',
    data: '2026-10-22',
    resumo: 'Resumo do novo.',
    tags: ['TypeScript', 'React'],
    minutos: 6,
    caminho: '/posts/novo',
  },
  {
    slug: 'antigo',
    titulo: 'Um post antigo',
    data: '2026-01-05',
    resumo: 'Resumo do antigo.',
    tags: [],
    minutos: 1,
    caminho: '/posts/antigo',
  },
];

const salaEm = (rota: string, posts: ResumoDoPost[]) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <SalaPosts posts={posts} />
    </MemoryRouter>,
  );

describe('SalaPosts', () => {
  it('lista os posts na ordem recebida, com link, data, leitura e tags', () => {
    salaEm('/posts', POSTS);
    const lista = screen.getByRole('list', { name: 'Posts publicados' });
    const itens = within(lista).getAllByRole('article');
    expect(
      itens.map((a) => within(a).getByRole('heading').textContent),
    ).toEqual(['O post mais novo', 'Um post antigo']);
    const novo = itens[0]!;
    expect(within(novo).getByRole('link')).toHaveAttribute(
      'href',
      '/posts/novo',
    );
    expect(within(novo).getByText('22 out 2026')).toHaveAttribute(
      'dateTime',
      '2026-10-22',
    );
    expect(within(novo).getByText('6 min de leitura')).toBeInTheDocument();
    expect(
      within(within(novo).getByRole('list', { name: 'Tags' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(2);
    expect(within(itens[1]!).queryByRole('list')).toBeNull();
    expect(screen.queryByText(/ainda estão na bigorna/)).toBeNull();
  });

  it('sem posts, mostra o estado vazio com o RSS e a volta à Home', () => {
    salaEm('/posts', []);
    expect(screen.queryByRole('list', { name: 'Posts publicados' })).toBeNull();
    expect(
      screen.getByRole('heading', {
        name: 'Os primeiros textos ainda estão na bigorna.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assinar o RSS' })).toHaveAttribute(
      'href',
      '/rss.xml',
    );
    expect(
      screen.getByRole('link', { name: 'Voltar à forja' }),
    ).toHaveAttribute('href', '/');
  });

  it('em inglês, o RSS e as datas seguem o idioma', () => {
    salaEm('/en/posts', []);
    expect(
      screen.getByRole('link', { name: 'Subscribe via RSS' }),
    ).toHaveAttribute('href', '/en/rss.xml');
    salaEm('/en/posts', [{ ...POSTS[0]!, caminho: '/en/posts/novo' }]);
    expect(screen.getByText('Oct 22, 2026')).toBeInTheDocument();
    expect(screen.getByText('6 min read')).toBeInTheDocument();
  });
});

describe('botão do RSS', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('copia o endereço do feed e avisa, sem abrir o XML', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    salaEm('/posts', []);
    const link = screen.getByRole('link', { name: 'Assinar o RSS' });
    // fireEvent devolve false quando o clique teve preventDefault.
    expect(fireEvent.click(link)).toBe(false);
    expect(writeText).toHaveBeenCalledWith(`${URL_BASE}/rss.xml`);
    expect(await screen.findByRole('status')).toHaveTextContent(
      `Endereço copiado: ${URL_BASE}/rss.xml. Cole no seu leitor de RSS.`,
    );
  });

  it('em inglês, copia o feed em inglês', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    salaEm('/en/posts', []);
    fireEvent.click(screen.getByRole('link', { name: 'Subscribe via RSS' }));
    expect(writeText).toHaveBeenCalledWith(`${URL_BASE}/en/rss.xml`);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Paste it into your RSS reader.',
    );
  });

  it('sem área de transferência, o link abre o feed como antes', () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    salaEm('/posts', []);
    const link = screen.getByRole('link', { name: 'Assinar o RSS' });
    expect(fireEvent.click(link)).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
