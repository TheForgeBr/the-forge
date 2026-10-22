import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
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
