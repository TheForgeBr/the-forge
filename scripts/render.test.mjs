import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
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
    const faltando = ROTAS.filter((r) => r !== '/').filter(
      (r) =>
        !lista.some((g) => g.origem === r && g.destino === `${r}/index.html`),
    );
    expect(faltando).toEqual([]);
  });

  it('o fallback geral vem por último, depois das regras das rotas', () => {
    const lista = regras();
    expect(lista.at(-1)).toEqual({
      origem: '/*',
      destino: '/__spa-fallback.html',
    });
  });
});
