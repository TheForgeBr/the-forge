import type { Idioma } from '../conteudo/tipos';

// Meses escritos à mão em vez de Intl: o pré-render (Node) e o navegador
// precisam gerar o mesmo texto, senão a hidratação falha.
export const MESES: Record<Idioma, readonly string[]> = {
  pt: 'jan fev mar abr mai jun jul ago set out nov dez'.split(' '),
  en: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
};

/** Data AAAA-MM-DD como aparece nos posts: "22 out 2026", "Oct 22, 2026". */
export function formatarData(data: string, idioma: Idioma) {
  const [ano, mes, dia] = data.split('-');
  const nome = MESES[idioma][Number(mes) - 1] ?? '';
  const d = String(Number(dia));
  return idioma === 'pt' ? `${d} ${nome} ${ano}` : `${nome} ${d}, ${ano}`;
}
