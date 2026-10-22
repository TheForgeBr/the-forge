import { useLocation } from 'react-router';
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
