import { describe, expect, it } from 'vitest';
import { ErroDeMarkdown, inline, markdownParaHtml } from './markdown.mjs';

describe('markdownParaHtml', () => {
  it('converte títulos, parágrafos e linha horizontal', () => {
    const html = markdownParaHtml(
      '## Seção\n\nPrimeira linha\ncontinua aqui.\n\n---\n\n### Sub',
    );
    expect(html).toBe(
      '<h2>Seção</h2>\n<p>Primeira linha continua aqui.</p>\n<hr>\n<h3>Sub</h3>',
    );
  });

  it('recusa # porque o h1 vem do frontmatter, com o número da linha', () => {
    expect(() =>
      markdownParaHtml('texto\n\n# Título', { primeiraLinha: 8 }),
    ).toThrow('linha 10: use ## ou mais');
  });

  it('escapa HTML bruto em vez de deixá-lo passar', () => {
    const html = markdownParaHtml(
      '<script>alert(1)</script>\n\n<img src=x onerror="y">',
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('converte negrito, itálico, código e links, marcando os externos', () => {
    expect(
      inline(
        '**forte**, *leve*, _leve_, `a <b>` e [site](https://x.dev?a=1&b=2) ou [sala](/projetos)',
      ),
    ).toBe(
      '<strong>forte</strong>, <em>leve</em>, <em>leve</em>, <code>a &lt;b&gt;</code> e <a href="https://x.dev?a=1&amp;b=2" rel="noopener noreferrer">site</a> ou <a href="/projetos">sala</a>',
    );
  });

  it('não confunde snake_case nem asterisco solto com ênfase', () => {
    expect(inline('nome_do_arquivo e 2 * 3 * 4')).toBe(
      'nome_do_arquivo e 2 * 3 * 4',
    );
  });

  it('recusa link javascript:', () => {
    expect(() => markdownParaHtml('[x](javascript:alert(1))')).toThrow(
      ErroDeMarkdown,
    );
  });

  it('converte listas, com linha recuada continuando o item', () => {
    expect(
      markdownParaHtml('- um\n  e meio\n- dois\n\n1. primeiro\n2. segundo'),
    ).toBe(
      '<ul><li>um e meio</li><li>dois</li></ul>\n<ol><li>primeiro</li><li>segundo</li></ol>',
    );
  });

  it('converte citação com parágrafos dentro', () => {
    expect(markdownParaHtml('> uma ideia\n>\n> outra')).toBe(
      '<blockquote><p>uma ideia</p>\n<p>outra</p></blockquote>',
    );
  });

  it('mantém o código cercado sem formatar e com a linguagem na classe', () => {
    expect(markdownParaHtml('```ts\nconst a = **b** < c;\n```')).toBe(
      '<pre><code class="linguagem-ts">const a = **b** &lt; c;</code></pre>',
    );
    expect(() => markdownParaHtml('```\nsem fim')).toThrow(
      'linha 1: bloco de código sem o ``` de fechamento',
    );
  });

  it('imagem vira figure com medidas, legenda e carga preguiçosa', () => {
    const html = markdownParaHtml('![A forja](forja.webp "A *forja* acesa")', {
      imagem: (src) => ({ src: `/posts/x/${src}`, largura: 800, altura: 600 }),
    });
    expect(html).toBe(
      '<figure><img src="/posts/x/forja.webp" alt="A forja" width="800" height="600" loading="lazy" decoding="async"><figcaption>A <em>forja</em> acesa</figcaption></figure>',
    );
  });

  it('recusa imagem sem texto alternativo', () => {
    expect(() => markdownParaHtml('![](a.webp)')).toThrow(
      'precisa de texto alternativo',
    );
  });
});

describe('aspas', () => {
  it('aceita a legenda da imagem entre aspas simples, como o Prettier deixa', () => {
    expect(markdownParaHtml("![A forja](f.webp 'Legenda')")).toContain(
      '<figcaption>Legenda</figcaption>',
    );
  });
});
