import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PaginaDoPost, type PostCompleto } from './PaginaDoPost';

const POST: PostCompleto = {
  slug: 'a',
  titulo: 'Um post de verdade',
  data: '2026-10-22',
  resumo: 'Resumo.',
  tags: ['TypeScript'],
  minutos: 4,
  caminho: '/posts/a',
  html: '<h2>Seção</h2>\n<p>Corpo com <code>código</code>.</p>',
};

const paginaEm = (rota: string, post = POST) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <PaginaDoPost post={post} />
    </MemoryRouter>,
  );

describe('PaginaDoPost', () => {
  it('mostra título, data, leitura, tags e o corpo convertido', () => {
    paginaEm('/posts/a');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Um post de verdade' }),
    ).toBeInTheDocument();
    expect(screen.getByText('22 out 2026')).toHaveAttribute(
      'dateTime',
      '2026-10-22',
    );
    expect(screen.getByText('4 min de leitura')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Tags' })).toHaveTextContent(
      'TypeScript',
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Seção' }),
    ).toBeInTheDocument();
    expect(screen.getByText('código').tagName).toBe('CODE');
  });

  it('volta para a lista de posts do idioma, no topo e no fim', () => {
    paginaEm('/en/posts/a', { ...POST, caminho: '/en/posts/a' });
    const voltar = screen.getAllByRole('link', { name: '← All posts' });
    expect(voltar).toHaveLength(2);
    for (const link of voltar)
      expect(link).toHaveAttribute('href', '/en/posts');
  });
});
