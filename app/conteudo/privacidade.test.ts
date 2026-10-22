import { describe, expect, it } from 'vitest';
import { experiencias } from './experiencias';
import type { Experiencia } from './tipos';

// Na SETA-AI, o site mostra só o papel e a stack (CLAUDE.md, issue 2.7).
const ehSetaAi = (e: Experiencia) => /seta[\s-]?ai/i.test(e.empresa);

function problemasDaSetaAi(lista: readonly Experiencia[]) {
  return lista
    .filter(ehSetaAi)
    .flatMap((e) =>
      e.privacidade === 'papel-e-stack' && !e.resumo && !e.links
        ? []
        : [
            `experiencias/${e.id}: SETA-AI precisa ser papel-e-stack, sem resumo nem links`,
          ],
    );
}

const setaAi: Experiencia = {
  id: 'seta-ai',
  empresa: 'SETA-AI',
  papel: { pt: 'Desenvolvedor', en: 'Developer' },
  stack: ['typescript'],
  periodo: { inicio: '2026-09', fim: 'atual' },
  privacidade: 'papel-e-stack',
  destaque: true,
};

describe('SETA-AI só com papel e stack', () => {
  it('aceita o item papel-e-stack', () => {
    expect(problemasDaSetaAi([setaAi])).toEqual([]);
  });

  it('acusa o item com privacidade completo', () => {
    const completo: Experiencia = {
      ...setaAi,
      privacidade: 'completo',
      resumo: { pt: 'detalhes', en: 'details' },
      entregas: { pt: ['a', 'b'], en: ['a', 'b'] },
    };
    expect(problemasDaSetaAi([completo])).toEqual([
      'experiencias/seta-ai: SETA-AI precisa ser papel-e-stack, sem resumo nem links',
    ]);
  });

  it('vale para as experiências reais do site', () => {
    expect(problemasDaSetaAi(experiencias)).toEqual([]);
  });
});
