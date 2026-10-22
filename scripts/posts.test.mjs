import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  carregarPosts,
  caminhoDoPost,
  dimensoesDaImagem,
  incluirRascunhos,
  lerPost,
  PostInvalidoError,
} from './posts.mjs';

function post(campos, corpo = 'Texto.') {
  const linhas = Object.entries(campos).map(([k, v]) => `${k}: ${v}`);
  return `---\n${linhas.join('\n')}\n---\n${corpo}\n`;
}

const VALIDO = {
  titulo: 'Por que The Forge',
  data: '2026-10-20',
  resumo: 'O nome e a ideia.',
  idioma: 'pt',
  tags: '[TypeScript, "React Router"]',
};

// PNG mínimo: só a assinatura e o IHDR, que é o que o leitor de medidas usa.
function png(largura, altura) {
  const dados = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(dados);
  dados.write('IHDR', 12, 'ascii');
  dados.writeUInt32BE(largura, 16);
  dados.writeUInt32BE(altura, 20);
  return dados;
}

let raiz;
beforeEach(() => {
  raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-'));
  fs.mkdirSync(path.join(raiz, 'conteudo/posts'), { recursive: true });
});
afterEach(() => fs.rmSync(raiz, { recursive: true, force: true }));

function escrever(nome, texto) {
  fs.writeFileSync(path.join(raiz, 'conteudo/posts', nome), texto);
}

describe('lerPost', () => {
  it('lê o frontmatter, converte o corpo e calcula o caminho', () => {
    const p = lerPost(
      'por-que.pt.md',
      post(VALIDO, '## Início\n\nUm **texto**.'),
    );
    expect(p).toMatchObject({
      slug: 'por-que',
      titulo: 'Por que The Forge',
      data: '2026-10-20',
      idioma: 'pt',
      rascunho: false,
      tags: ['TypeScript', 'React Router'],
      caminho: '/posts/por-que',
      minutos: 1,
    });
    expect(p.html).toBe('<h2>Início</h2>\n<p>Um <strong>texto</strong>.</p>');
  });

  it.each(['titulo', 'data', 'resumo', 'idioma'])(
    'falha dizendo o arquivo e o campo quando falta "%s"',
    (campo) => {
      const resto = { ...VALIDO };
      delete resto[campo];
      expect(() => lerPost('x.pt.md', post(resto))).toThrow(
        `conteudo/posts/x.pt.md: falta o campo "${campo}"`,
      );
    },
  );

  it('recusa data inválida, idioma trocado e campo desconhecido', () => {
    expect(() =>
      lerPost('x.pt.md', post({ ...VALIDO, data: '2026-02-30' })),
    ).toThrow('o campo "data" precisa ser AAAA-MM-DD (veio "2026-02-30")');
    expect(() => lerPost('x.en.md', post(VALIDO))).toThrow(
      'o campo "idioma" diz "pt", mas o nome do arquivo diz "en"',
    );
    expect(() => lerPost('x.pt.md', post({ ...VALIDO, autor: 'eu' }))).toThrow(
      'campo "autor" desconhecido',
    );
  });

  it('recusa nome fora do padrão e arquivo sem frontmatter', () => {
    expect(() => lerPost('Meu Post.md', post(VALIDO))).toThrow(
      PostInvalidoError,
    );
    expect(() => lerPost('x.pt.md', 'só texto')).toThrow(
      'precisa começar com o frontmatter',
    );
  });

  it('aponta a linha certa do arquivo num erro do corpo', () => {
    // 7 linhas de frontmatter (5 campos e as duas ---): o corpo começa na 8.
    expect(() => lerPost('x.pt.md', post(VALIDO, 'ok\n\n# Título'))).toThrow(
      'conteudo/posts/x.pt.md: linha 10: use ## ou mais',
    );
  });

  it('resolve a imagem em public/posts/<slug>/ com as medidas do arquivo', () => {
    fs.mkdirSync(path.join(raiz, 'public/posts/x'), { recursive: true });
    fs.writeFileSync(
      path.join(raiz, 'public/posts/x/forja.png'),
      png(640, 360),
    );
    const p = lerPost('x.pt.md', post(VALIDO, '![A forja](forja.png)'), raiz);
    expect(p.html).toContain(
      '<img src="/posts/x/forja.png" alt="A forja" width="640" height="360"',
    );
    expect(() =>
      lerPost('x.pt.md', post(VALIDO, '![Falta](nao-existe.png)'), raiz),
    ).toThrow('a imagem public/posts/x/nao-existe.png não existe');
    expect(() =>
      lerPost('x.pt.md', post(VALIDO, '![Fora](https://x.dev/a.png)'), raiz),
    ).toThrow('precisa ser só o nome de um arquivo');
  });
});

describe('carregarPosts', () => {
  it('ordena do mais novo ao mais antigo e liga as traduções', () => {
    escrever('antigo.pt.md', post({ ...VALIDO, data: '2026-01-01' }));
    escrever('novo.pt.md', post({ ...VALIDO, data: '2026-10-01' }));
    escrever(
      'novo.en.md',
      post({ ...VALIDO, idioma: 'en', data: '2026-10-01' }),
    );
    escrever('.gitkeep', '');
    const posts = carregarPosts({ raiz });
    expect(posts.map((p) => `${p.slug}.${p.idioma}`)).toEqual([
      'novo.en',
      'novo.pt',
      'antigo.pt',
    ]);
    expect(posts[1]?.traducao).toBe('/en/posts/novo');
    expect(posts[2]?.traducao).toBeUndefined();
  });

  it('deixa os rascunhos de fora, a menos que peça', () => {
    escrever('pronto.pt.md', post(VALIDO));
    escrever('rascunho.pt.md', post({ ...VALIDO, rascunho: true }));
    expect(carregarPosts({ raiz }).map((p) => p.slug)).toEqual(['pronto']);
    expect(carregarPosts({ raiz, rascunhos: true })).toHaveLength(2);
  });

  it('sem posts, devolve lista vazia', () => {
    expect(carregarPosts({ raiz })).toEqual([]);
  });
});

describe('apoio', () => {
  it('caminho do post por idioma', () => {
    expect(caminhoDoPost('a', 'pt')).toBe('/posts/a');
    expect(caminhoDoPost('a', 'en')).toBe('/en/posts/a');
  });

  it('rascunhos só no desenvolvimento ou com RASCUNHOS=1', () => {
    expect(incluirRascunhos({ NODE_ENV: 'production' })).toBe(false);
    expect(incluirRascunhos({ NODE_ENV: 'development' })).toBe(true);
    expect(incluirRascunhos({ RASCUNHOS: '1' })).toBe(true);
  });

  it('lê as medidas de PNG e SVG', () => {
    expect(dimensoesDaImagem(png(10, 20), 'a.png')).toEqual({
      largura: 10,
      altura: 20,
    });
    expect(
      dimensoesDaImagem(Buffer.from('<svg viewBox="0 0 1280 320">'), 'a.svg'),
    ).toEqual({ largura: 1280, altura: 320 });
  });
});

describe('aspas no frontmatter', () => {
  it('aceita aspas simples e duplas no valor e na lista', () => {
    const p = lerPost(
      'x.pt.md',
      post({
        ...VALIDO,
        titulo: "'Título: com dois pontos'",
        tags: `['A', "B"]`,
      }),
    );
    expect(p.titulo).toBe('Título: com dois pontos');
    expect(p.tags).toEqual(['A', 'B']);
  });
});
