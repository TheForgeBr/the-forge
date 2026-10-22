import { describe, expect, it } from 'vitest';
import { cssDesatualizado, cssDosTokens } from './gerar-tokens.mjs';

const exemplo = {
  cores: { 'ouro-forja': '#F6A43A', fuligem: '#0E0B0A' },
  fontes: { titulo: ['Cinzel', 'Georgia', 'serif'] },
  tamanhos: { base: '1rem' },
  espacos: { 4: '1rem' },
};

describe('cssDosTokens', () => {
  it('gera uma variável por token, com prefixo do grupo', () => {
    const css = cssDosTokens(exemplo);
    expect(css).toContain(':root {');
    expect(css).toContain('  --cor-ouro-forja: #F6A43A;');
    expect(css).toContain('  --cor-fuligem: #0E0B0A;');
    expect(css).toContain("  --fonte-titulo: 'Cinzel', 'Georgia', serif;");
    expect(css).toContain('  --tamanho-base: 1rem;');
    expect(css).toContain('  --espaco-4: 1rem;');
  });

  it('marca o arquivo como gerado', () => {
    expect(cssDosTokens(exemplo)).toMatch(
      /^\/\* Gerado por scripts\/gerar-tokens\.mjs/,
    );
  });

  it('muda o CSS quando uma cor muda no JSON', () => {
    const outra = {
      ...exemplo,
      cores: { ...exemplo.cores, fuligem: '#000000' },
    };
    expect(cssDosTokens(outra)).toContain('  --cor-fuligem: #000000;');
  });

  it.each([
    [
      'cor fora do formato',
      { brasa: 'laranja' },
      'cores.brasa: "laranja" não é uma cor #RRGGBB',
    ],
    [
      'nome com maiúscula',
      { OuroForja: '#F6A43A' },
      'cores.OuroForja: o nome deve ter só minúsculas, números e hífen',
    ],
  ])('recusa %s com mensagem que aponta o token', (_caso, cores, mensagem) => {
    expect(() => cssDosTokens({ ...exemplo, cores })).toThrow(mensagem);
  });
});

describe('cssDesatualizado', () => {
  it('aceita o CSS gerado dos mesmos tokens, com LF ou CRLF', () => {
    const css = cssDosTokens(exemplo);
    expect(cssDesatualizado(css, exemplo)).toBe(false);
    expect(cssDesatualizado(css.replace(/\n/g, '\r\n'), exemplo)).toBe(false);
  });

  it('acusa o CSS quando o JSON mudou depois da geração', () => {
    const css = cssDosTokens(exemplo);
    const mudado = {
      ...exemplo,
      cores: { ...exemplo.cores, fuligem: '#000000' },
    };
    expect(cssDesatualizado(css, mudado)).toBe(true);
  });

  it('acusa quando o arquivo CSS não existe', () => {
    expect(cssDesatualizado(null, exemplo)).toBe(true);
  });
});
