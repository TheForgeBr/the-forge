import { Link, useLocation } from 'react-router';
import {
  CHAVE_ESCOLHA,
  caminhoEquivalente,
  idiomaDoCaminho,
  LANG,
  outroIdioma,
  traduzir,
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
  const destino = outroIdioma(idiomaDoCaminho(pathname));
  return (
    <Link
      to={caminhoEquivalente(pathname)}
      lang={LANG[destino]}
      hrefLang={LANG[destino]}
      onClick={() => guardarEscolha(destino)}
    >
      {traduzir(destino, 'idioma.nome')}
    </Link>
  );
}
