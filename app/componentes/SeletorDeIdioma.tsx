import { Link, useLocation } from 'react-router';
import {
  CHAVE_ESCOLHA,
  idiomaDoCaminho,
  LANG,
  outroIdioma,
  traduzir,
  useCaminhoEquivalente,
} from '../i18n/idioma';

export function guardarEscolha(idioma: string) {
  try {
    localStorage.setItem(CHAVE_ESCOLHA, idioma);
  } catch {
    // Navegação privada ou armazenamento bloqueado: o aviso pode voltar.
  }
}

/** Link real para a mesma sala no outro idioma (ADR 0008). */
export function SeletorDeIdioma() {
  const { pathname } = useLocation();
  const equivalente = useCaminhoEquivalente();
  const destino = outroIdioma(idiomaDoCaminho(pathname));
  return (
    <Link
      to={equivalente}
      lang={LANG[destino]}
      hrefLang={LANG[destino]}
      onClick={() => guardarEscolha(destino)}
    >
      {traduzir(destino, 'idioma.nome')}
    </Link>
  );
}
