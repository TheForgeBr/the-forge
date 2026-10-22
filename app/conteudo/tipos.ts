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
 * resumo nem links (regra do SETA-AI). O tipo impede os campos a mais.
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

export type Projeto = Comum & { readonly titulo: Localizado } & (
    Completo | PapelEStack
  );

export interface Periodo {
  readonly inicio: Mes;
  readonly fim: Mes | 'atual';
}

export type Experiencia = Comum & {
  readonly empresa: string;
  readonly periodo: Periodo;
} & (Completo | PapelEStack);

export type CategoriaSkill =
  | 'linguagens'
  | 'frontend'
  | 'mobile'
  | 'backend'
  | 'dados'
  | 'infra'
  | 'testes'
  | 'arquitetura'
  | 'ia';

export type NivelSkill = 'basico' | 'intermediario' | 'avancado';

export interface Skill {
  readonly id: string;
  readonly nome: Localizado;
  readonly categoria: CategoriaSkill;
  readonly nivel: NivelSkill;
  readonly destaque: boolean;
}
