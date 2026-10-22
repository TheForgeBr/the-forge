import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { caminhosDosPosts } from './posts.mjs';
import { ROTAS } from './rotas.mjs';

// Lê as regras de render.yaml na ordem em que aparecem.
function regras() {
  const yaml = fs.readFileSync('render.yaml', 'utf8');
  return [...yaml.matchAll(/source:\s*(\S+)\s*\n\s*destination:\s*(\S+)/g)].map(
    ([, origem, destino]) => ({ origem, destino }),
  );
}

describe('render.yaml', () => {
  it('cada rota pré-renderizada aponta para o próprio index.html', () => {
    const lista = regras();
    // Os posts publicados também: sem a regra, /posts/<slug> cairia na 404.
    const faltando = [...ROTAS, ...caminhosDosPosts()]
      .filter((r) => r !== '/')
      .filter(
        (r) =>
          !lista.some((g) => g.origem === r && g.destino === `${r}/index.html`),
      );
    expect(faltando).toEqual([]);
  });

  it('as rotas desconhecidas caem na 404 do idioma, nas últimas regras', () => {
    const lista = regras();
    expect(lista.slice(-2)).toEqual([
      { origem: '/en/*', destino: '/en/404/index.html' },
      { origem: '/*', destino: '/404/index.html' },
    ]);
  });
});
