import { useContext } from 'react';
import {
  UNSAFE_DataRouterStateContext as EstadoDoRouter,
  useLocation,
} from 'react-router';
import { SALAS, type NomeDaSala } from '../../scripts/rotas.mjs';
import type { Idioma } from '../conteudo/tipos';
import { en } from './en';
import { pt, type Chave } from './pt';

const DICIONARIOS = { pt, en } as const;

export const LANG: Record<Idioma, string> = { pt: 'pt-BR', en: 'en' };

/** Guarda a escolha de idioma do visitante; com ela, o aviso não volta. */
export const CHAVE_ESCOLHA = 'forja:idioma';

export function outroIdioma(idioma: Idioma): Idioma {
  return idioma === 'pt' ? 'en' : 'pt';
}

function normalizar(caminho: string) {
  return caminho.length > 1 ? caminho.replace(/\/+$/, '') : caminho;
}

export function idiomaDoCaminho(caminho: string): Idioma {
  const limpo = normalizar(caminho);
  return limpo === '/en' || limpo.startsWith('/en/') ? 'en' : 'pt';
}

export function salaDoCaminho(caminho: string): NomeDaSala | undefined {
  const limpo = normalizar(caminho);
  // Um post (/posts/<slug> ou /en/posts/<slug>) fica na sala Posts.
  if (/^(\/en)?\/posts\/[^/]+$/.test(limpo)) return 'posts';
  return SALAS.find((s) => s.pt === limpo || s.en === limpo)?.sala;
}

export function caminhoDaSala(sala: NomeDaSala, idioma: Idioma) {
  const encontrada = SALAS.find((s) => s.sala === sala);
  if (!encontrada) throw new Error(`sala "${sala}" não está em SALAS`);
  return encontrada[idioma];
}

/** O mesmo lugar no outro idioma; fora das salas (404), a Home do outro. */
export function caminhoEquivalente(caminho: string) {
  const destino = outroIdioma(idiomaDoCaminho(caminho));
  return caminhoDaSala(salaDoCaminho(caminho) ?? 'home', destino);
}

/**
 * O mesmo lugar no outro idioma, para o seletor e o aviso. Um post traduzido
 * informa a tradução pelo loader (campo `traducao`); sem tradução, vale
 * caminhoEquivalente, que leva à lista de posts do outro idioma (ADR 0008).
 */
export function useCaminhoEquivalente() {
  const { pathname } = useLocation();
  // O estado do router vem pelo contexto, que é nulo fora de um data router
  // (os testes com MemoryRouter), em vez do useMatches, que lança erro.
  const estado = useContext(EstadoDoRouter);
  const traducao = Object.values(estado?.loaderData ?? {})
    .map((dados) => (dados as { traducao?: unknown } | null)?.traducao)
    .find((t): t is string => typeof t === 'string');
  return traducao ?? caminhoEquivalente(pathname);
}

export function traduzir(idioma: Idioma, chave: Chave): string {
  const dicionario: Partial<Record<string, string>> = DICIONARIOS[idioma];
  return dicionario[chave] ?? chave;
}

export function useIdioma(): Idioma {
  return idiomaDoCaminho(useLocation().pathname);
}

export function useTraducao() {
  const idioma = useIdioma();
  return (chave: Chave) => traduzir(idioma, chave);
}
