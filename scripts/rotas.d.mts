export type NomeDaSala =
  'home' | 'projetos' | 'experiencias' | 'sobre' | 'posts' | 'contato';

export interface Sala {
  sala: NomeDaSala;
  pt: string;
  en: string;
}

export declare const SALAS: Sala[];
export declare const ROTAS: string[];
export declare const PAGINAS_404: { pt: string; en: string };
