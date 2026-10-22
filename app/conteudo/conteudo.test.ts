import { describe, expect, expectTypeOf, it } from 'vitest';
import { experiencias } from './experiencias';
import { projetos } from './projetos';
import { skills } from './skills';
import type { Experiencia, Localizado, Projeto, Skill } from './tipos';
import {
  problemasDasExperiencias,
  problemasDasSkills,
  problemasDosProjetos,
} from './validar';

const projeto: Projeto = {
  id: 'memento',
  titulo: { pt: 'Memento', en: 'Memento' },
  papel: { pt: 'Autor', en: 'Author' },
  resumo: { pt: 'Memória local para agentes.', en: 'Local memory for agents.' },
  stack: ['typescript', 'mcp'],
  links: { repositorio: 'https://github.com/TheForgeBr/Memento' },
  privacidade: 'completo',
  destaque: true,
};

const experiencia: Experiencia = {
  id: 'empresa-exemplo',
  empresa: 'Empresa Exemplo',
  papel: { pt: 'Desenvolvedor', en: 'Developer' },
  stack: ['react-native'],
  periodo: { inicio: '2021-03', fim: 'atual' },
  privacidade: 'papel-e-stack',
  destaque: false,
};

const skill: Skill = {
  id: 'typescript',
  nome: { pt: 'TypeScript', en: 'TypeScript' },
  categoria: 'linguagens',
  nivel: 'avancado',
  destaque: true,
};

describe('tipos do conteúdo', () => {
  it('exigem português e inglês em todo texto', () => {
    expectTypeOf<Localizado>().toEqualTypeOf<
      Readonly<{ pt: string; en: string }>
    >();
    // @ts-expect-error: falta o texto em inglês
    const semIngles: Localizado = { pt: 'Só português' };
    expect(semIngles).toBeDefined();
  });

  it('não deixam um item papel-e-stack ter resumo nem links', () => {
    const comResumo = {
      ...projeto,
      privacidade: 'papel-e-stack' as const,
      links: undefined,
    };
    // @ts-expect-error: resumo não existe em papel-e-stack
    const restrito: Projeto = comResumo;
    const permitido: Projeto = { ...comResumo, resumo: undefined };
    expect([restrito, permitido]).toHaveLength(2);
  });

  it('aceitam só meses no formato AAAA-MM', () => {
    expectTypeOf<'2021-03'>().toExtend<Experiencia['periodo']['inicio']>();
    expectTypeOf<'2021-13'>().not.toExtend<Experiencia['periodo']['inicio']>();
  });
});

describe('validação do conteúdo', () => {
  it('aceita itens de exemplo bem formados', () => {
    expect(problemasDosProjetos([projeto])).toEqual([]);
    expect(problemasDasExperiencias([experiencia])).toEqual([]);
    expect(problemasDasSkills([skill])).toEqual([]);
  });

  it('acusa texto vazio, id repetido e link sem https', () => {
    const ruim: Projeto = {
      ...projeto,
      resumo: { pt: 'ok', en: '  ' },
      links: { site: 'http://exemplo.com' },
    };
    expect(problemasDosProjetos([projeto, ruim])).toEqual([
      'projetos: id "memento" repetido',
      'projetos/memento: resumo.en está vazio',
      'projetos/memento: links.site "http://exemplo.com" deve usar https',
    ]);
  });

  it('acusa período invertido e id fora do padrão', () => {
    const invertida: Experiencia = {
      ...experiencia,
      id: 'Empresa_Exemplo',
      periodo: { inicio: '2024-05', fim: '2023-01' },
    };
    expect(problemasDasExperiencias([invertida])).toEqual([
      'experiencias: id "Empresa_Exemplo" deve ser kebab-case minúsculo',
      'experiencias/Empresa_Exemplo: periodo.fim 2023-01 vem antes de 2024-05',
    ]);
  });

  it('acusa nome de skill sem tradução', () => {
    expect(
      problemasDasSkills([{ ...skill, nome: { pt: 'TypeScript', en: '' } }]),
    ).toEqual(['skills/typescript: nome.en está vazio']);
  });

  it('o conteúdo real do site passa na validação', () => {
    expect(problemasDosProjetos(projetos)).toEqual([]);
    expect(problemasDasExperiencias(experiencias)).toEqual([]);
    expect(problemasDasSkills(skills)).toEqual([]);
  });
});
