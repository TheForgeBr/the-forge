export type IdiomaDoPost = 'pt' | 'en';

export interface Post {
  slug: string;
  titulo: string;
  /** AAAA-MM-DD */
  data: string;
  resumo: string;
  idioma: IdiomaDoPost;
  rascunho: boolean;
  tags: string[];
  /** Endereço do post no site, com o prefixo do idioma. */
  caminho: string;
  minutos: number;
  /** HTML do corpo, já escapado pelo conversor. */
  html: string;
  /** Endereço do mesmo post no outro idioma, se existir. */
  traducao?: string;
}

export interface OpcoesDosPosts {
  raiz?: string;
  rascunhos?: boolean;
}

export declare const PASTA_DOS_POSTS: string;
export declare const PASTA_DAS_IMAGENS: string;
export declare const LIMITE_DA_IMAGEM: number;
export declare class PostInvalidoError extends Error {}
export declare function caminhoDoPost(
  slug: string,
  idioma: IdiomaDoPost,
): string;
export declare function incluirRascunhos(
  env?: Record<string, string | undefined>,
): boolean;
export declare function dimensoesDaImagem(
  dados: Buffer,
  nome: string,
): { largura: number; altura: number } | undefined;
export declare function lerPost(
  nome: string,
  texto: string,
  raiz?: string,
): Post;
export declare function carregarPosts(opcoes?: OpcoesDosPosts): Post[];
export declare function caminhosDosPosts(opcoes?: OpcoesDosPosts): string[];
