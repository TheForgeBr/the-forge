import { describe, expect, it } from 'vitest';
import { experiencias } from './experiencias';
import type { Experiencia } from './tipos';

// Na SETA-AI, o site mostra só o que o currículo já publica: papel, resumo,
// entregas e stack, nunca links para o código ou o produto (CLAUDE.md,
// decisão de 2026-10-24; antes era só papel e stack, issue 2.7).
const ehSetaAi = (e: Experiencia) => /seta[\s-]?ai/i.test(e.empresa);

function problemasDaSetaAi(lista: readonly Experiencia[]) {
  return lista
    .filter(ehSetaAi)
    .flatMap((e) =>
      e.links ? [`experiencias/${e.id}: SETA-AI não pode ter links`] : [],
    );
}

const setaAi: Experiencia = {
  id: 'seta-ai',
  empresa: 'SETA-AI',
  papel: { pt: 'Desenvolvedor', en: 'Developer' },
  resumo: { pt: 'resumo', en: 'summary' },
  entregas: { pt: ['a', 'b'], en: ['a', 'b'] },
  stack: ['typescript'],
  periodo: { inicio: '2026-09', fim: 'atual' },
  privacidade: 'completo',
  destaque: true,
};

describe('SETA-AI sem links', () => {
  it('aceita o item com resumo e entregas', () => {
    expect(problemasDaSetaAi([setaAi])).toEqual([]);
  });

  it('acusa o item com links', () => {
    const comLinks: Experiencia = {
      ...setaAi,
      links: { site: 'https://exemplo.test' },
    };
    expect(problemasDaSetaAi([comLinks])).toEqual([
      'experiencias/seta-ai: SETA-AI não pode ter links',
    ]);
  });

  it('vale para as experiências reais do site', () => {
    expect(problemasDaSetaAi(experiencias)).toEqual([]);
  });
});
