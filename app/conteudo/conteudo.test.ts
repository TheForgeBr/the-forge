import { describe, expect, expectTypeOf, it } from 'vitest';
import { experiencias } from './experiencias';
import { projetos } from './projetos';
import { skills } from './skills';
import {
  CATEGORIAS_DE_SKILL,
  type Experiencia,
  type Localizado,
  type Projeto,
  type Skill,
} from './tipos';
import {
  problemasDasExperiencias,
  problemasDasSkills,
  problemasDosProjetos,
  skillsOrdenadas,
} from './validar';

const projeto: Projeto = {
  id: 'memento',
  titulo: { pt: 'Memento', en: 'Memento' },
  papel: { pt: 'Autor', en: 'Author' },
  resumo: { pt: 'Memória local para agentes.', en: 'Local memory for agents.' },
  stack: ['typescript', 'mcp'],
  links: { repositorio: 'https://github.com/TheForgeBr/Memento' },
  estado: 'em-andamento',
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
  desde: 2022,
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

describe('projetos', () => {
  it('acusa resumo acima de 280 caracteres', () => {
    const longo: Projeto = {
      ...projeto,
      resumo: { pt: 'a'.repeat(281), en: 'ok' },
    };
    expect(problemasDosProjetos([longo])).toEqual([
      'projetos/memento: resumo.pt tem 281 caracteres (máximo 280)',
    ]);
  });

  it('acusa projeto entregue antes de um em andamento', () => {
    const entregue: Projeto = { ...projeto, id: 'antigo', estado: 'entregue' };
    expect(problemasDosProjetos([entregue, projeto])).toEqual([
      'projetos/memento: estado "em-andamento" vem depois de "entregue" (antigo); a ordem é em-andamento, em-producao, pausado, entregue',
    ]);
  });

  it('o site tem exatamente os 10 projetos aprovados na 2.2', () => {
    expect(projetos.map((p) => p.id).sort()).toEqual(
      [
        'memento',
        'morpheus',
        'rumo',
        'sakura-shop',
        'the-forge-br',
        'healthyview',
        'jobzin',
        'pawhub',
        'fitloop',
        'conecta-ensina',
      ].sort(),
    );
  });
});

describe('experiências', () => {
  const completa: Experiencia = {
    ...experiencia,
    id: 'completa',
    privacidade: 'completo',
    resumo: { pt: 'Produto.', en: 'Product.' },
    entregas: { pt: ['Uma.', 'Duas.'], en: ['One.', 'Two.'] },
  };

  it('aceita de 2 a 4 entregas com a mesma quantidade nos dois idiomas', () => {
    expect(problemasDasExperiencias([completa])).toEqual([]);
  });

  it('acusa entrega a menos e idiomas com quantidades diferentes', () => {
    const curta: Experiencia = {
      ...completa,
      entregas: { pt: ['Uma.'], en: ['One.', 'Two.'] },
    };
    expect(problemasDasExperiencias([curta])).toEqual([
      'experiencias/completa: entregas.pt tem 1 itens (de 2 a 4)',
      'experiencias/completa: entregas têm 1 itens em pt e 2 em en',
    ]);
  });

  it('acusa a lista fora da ordem cronológica reversa', () => {
    const antiga: Experiencia = {
      ...completa,
      id: 'antiga',
      periodo: { inicio: '2021-04', fim: '2021-09' },
    };
    expect(problemasDasExperiencias([antiga, experiencia])).toEqual([
      'experiencias/empresa-exemplo: vem depois de antiga, mas é mais recente; a ordem é cronológica reversa',
    ]);
  });

  it('a linha do tempo real vai de 2021 até hoje, com a atual primeiro', () => {
    expect(experiencias[0]?.periodo.fim).toBe('atual');
    expect(experiencias.at(-1)?.periodo.inicio.startsWith('2021')).toBe(true);
    expect(
      experiencias.find((e) => e.id === 'seta-ai')?.entregas?.pt,
    ).toHaveLength(3);
  });
});

describe('skills', () => {
  it('acusa ano de início fora da faixa', () => {
    expect(problemasDasSkills([{ ...skill, desde: 2030 }], 2026)).toEqual([
      'skills/typescript: desde 2030 fora de 2015 a 2026',
    ]);
  });

  it('ordena por nível e, no mesmo nível, por quem começou antes', () => {
    const lista: Skill[] = [
      { ...skill, id: 'b', nivel: 'basico', desde: 2018 },
      { ...skill, id: 'a-nova', nivel: 'avancado', desde: 2024 },
      { ...skill, id: 'a-antiga', nivel: 'avancado', desde: 2020 },
      { ...skill, id: 'i', nivel: 'intermediario', desde: 2019 },
    ];
    expect(skillsOrdenadas(lista, 'linguagens').map((s) => s.id)).toEqual([
      'a-antiga',
      'a-nova',
      'i',
      'b',
    ]);
  });

  it('as 48 skills marcadas usam só categorias conhecidas', () => {
    expect(skills).toHaveLength(48);
    expect(
      skills.filter((s) => !CATEGORIAS_DE_SKILL.includes(s.categoria)),
    ).toEqual([]);
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
