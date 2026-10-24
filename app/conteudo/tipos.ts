// Tipos do conteúdo do site (ADR 0004). Todo texto existe em português e em
// inglês no mesmo objeto (ADR 0008): sem um dos idiomas, o item não compila.

export type Idioma = 'pt' | 'en';
export const IDIOMAS: readonly Idioma[] = ['pt', 'en'];

export type Localizado<T = string> = Readonly<Record<Idioma, T>>;

type MesDoAno =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12';
/** Mês no formato AAAA-MM, o mesmo das notas do vault. */
export type Mes = `${number}-${MesDoAno}`;

export interface Links {
  readonly repositorio?: string;
  readonly site?: string;
}

/**
 * `completo` mostra tudo; `papel-e-stack` mostra só o papel e a stack, sem
 * resumo nem links. O tipo impede os campos a mais.
 */
export type Privacidade = 'completo' | 'papel-e-stack';

interface Comum {
  /** Identificador em kebab-case, único na lista. */
  readonly id: string;
  readonly papel: Localizado;
  readonly stack: readonly string[];
  readonly destaque: boolean;
}

interface Completo {
  readonly privacidade: 'completo';
  readonly resumo: Localizado;
  readonly links?: Links;
}

interface PapelEStack {
  readonly privacidade: 'papel-e-stack';
  readonly resumo?: never;
  readonly links?: never;
}

/** Na sala Projetos, nesta ordem: em atividade primeiro, entregues por último. */
export const ESTADOS_DE_PROJETO = [
  'em-andamento',
  'em-producao',
  'pausado',
  'entregue',
] as const;
export type EstadoDeProjeto = (typeof ESTADOS_DE_PROJETO)[number];

/** Resumo de um projeto: cabe num cartão (issue 2.3). */
export const LIMITE_DO_RESUMO = 280;

export type Projeto = Comum & {
  readonly titulo: Localizado;
  readonly estado: EstadoDeProjeto;
} & (Completo | PapelEStack);

export interface Periodo {
  readonly inicio: Mes;
  readonly fim: Mes | 'atual';
}

/** De 2 a 4 entregas curtas por experiência (issue 2.4). */
export const ENTREGAS = { minimo: 2, maximo: 4 } as const;

export type Experiencia = Comum & {
  readonly empresa: string;
  readonly periodo: Periodo;
} & (
    | (Completo & { readonly entregas: Localizado<readonly string[]> })
    | (PapelEStack & { readonly entregas?: never })
  );

/** Grupos da sala Sobre e skills, nesta ordem. */
export const CATEGORIAS_DE_SKILL = [
  'linguagens',
  'frontend',
  'mobile',
  'backend',
  'dados',
  'ia',
  'testes',
  'infra',
  'plataformas',
  'processo',
] as const;
export type CategoriaSkill = (typeof CATEGORIAS_DE_SKILL)[number];

/** Do mais forte para o mais fraco: é a ordem em que aparecem. */
export const NIVEIS_DE_SKILL = ['avancado', 'intermediario', 'basico'] as const;
export type NivelSkill = (typeof NIVEIS_DE_SKILL)[number];

export interface Skill {
  readonly id: string;
  readonly nome: Localizado;
  readonly categoria: CategoriaSkill;
  readonly nivel: NivelSkill;
  /** Ano do primeiro uso; no mesmo nível, quem começou antes vem primeiro. */
  readonly desde: number;
  readonly destaque: boolean;
}
