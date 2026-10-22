import { describe, expect, it } from 'vitest';
import { ROTAS, SALAS } from '../../scripts/rotas.mjs';
import { en } from './en';
import {
  caminhoEquivalente,
  idiomaDoCaminho,
  salaDoCaminho,
  traduzir,
} from './idioma';
import { pt, type Chave } from './pt';

describe('traduzir', () => {
  it('devolve o texto da chave em cada idioma', () => {
    expect(traduzir('pt', 'erro.voltar')).toBe('Voltar à forja');
    expect(traduzir('en', 'erro.voltar')).toBe('Back to the forge');
  });

  it('devolve a própria chave quando ela não existe, sem quebrar a página', () => {
    expect(traduzir('en', 'nao.existe' as Chave)).toBe('nao.existe');
  });

  it('o inglês tem texto para toda chave do português', () => {
    const vazias = Object.keys(pt).filter((c) => !en[c as Chave]?.trim());
    expect(vazias).toEqual([]);
  });
});

describe('caminhos por idioma', () => {
  it('descobre o idioma pelo prefixo /en', () => {
    expect(idiomaDoCaminho('/')).toBe('pt');
    expect(idiomaDoCaminho('/projetos')).toBe('pt');
    expect(idiomaDoCaminho('/en')).toBe('en');
    expect(idiomaDoCaminho('/en/projects/')).toBe('en');
    expect(idiomaDoCaminho('/enigma')).toBe('pt');
  });

  it.each(SALAS.map((s) => [s.sala, s.pt, s.en]))(
    'leva a sala %s ao outro idioma e volta',
    (sala, caminhoPt, caminhoEn) => {
      expect(salaDoCaminho(caminhoPt)).toBe(sala);
      expect(caminhoEquivalente(caminhoPt)).toBe(caminhoEn);
      expect(caminhoEquivalente(caminhoEn)).toBe(caminhoPt);
    },
  );

  it('fora das salas, leva à Home do outro idioma', () => {
    expect(caminhoEquivalente('/nao-existe')).toBe('/en');
    expect(caminhoEquivalente('/en/missing')).toBe('/');
  });

  it('pré-renderiza as 6 salas nos dois idiomas', () => {
    expect(ROTAS).toHaveLength(12);
    expect(new Set(ROTAS).size).toBe(12);
  });
});
