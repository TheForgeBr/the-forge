import { useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import type { Idioma } from '../conteudo/tipos';
import {
  CHAVE_ESCOLHA,
  caminhoDaSala,
  idiomaDoCaminho,
  LANG,
  outroIdioma,
  traduzir,
  useCaminhoEquivalente,
} from '../i18n/idioma';
import { guardarEscolha } from './SeletorDeIdioma';

function idiomaDoNavegador(): Idioma {
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

// O idioma do navegador e a escolha guardada não avisam quando mudam.
const semAssinatura = () => () => {};

function escolhaGuardada() {
  try {
    return localStorage.getItem(CHAVE_ESCOLHA);
  } catch {
    return null;
  }
}

/**
 * Na primeira visita, se o navegador estiver no outro idioma, oferece a mesma
 * sala nele, sem redirecionar (ADR 0008). Só roda no navegador, depois do
 * pré-render, e não volta depois de uma escolha.
 */
export function AvisoDeIdioma() {
  const { pathname } = useLocation();
  const equivalente = useCaminhoEquivalente();
  const idiomaDaPagina = idiomaDoCaminho(pathname);
  const [fechado, setFechado] = useState(false);
  // No pré-render e na hidratação vale o null do servidor; no navegador,
  // o aviso aparece logo depois, sem quebrar a hidratação.
  const idiomaDoAviso = useSyncExternalStore(
    semAssinatura,
    () => {
      const doNavegador = idiomaDoNavegador();
      return !escolhaGuardada() && doNavegador !== idiomaDaPagina
        ? doNavegador
        : null;
    },
    () => null,
  );

  // Um post sem tradução não existe no outro idioma: o aviso mentiria.
  const postSemTraducao =
    /\/posts\/[^/]+\/?$/.test(pathname) &&
    equivalente === caminhoDaSala('posts', outroIdioma(idiomaDaPagina));
  if (fechado || !idiomaDoAviso || postSemTraducao) return null;
  const fechar = () => {
    guardarEscolha(idiomaDaPagina);
    setFechado(true);
  };
  return (
    <aside
      className="aviso-idioma"
      lang={LANG[idiomaDoAviso]}
      aria-label={traduzir(idiomaDoAviso, 'idioma.ler')}
    >
      <p>{traduzir(idiomaDoAviso, 'aviso.texto')}</p>
      <Link
        to={equivalente}
        hrefLang={LANG[idiomaDoAviso]}
        onClick={() => guardarEscolha(idiomaDoAviso)}
      >
        {traduzir(idiomaDoAviso, 'idioma.ler')}
      </Link>
      <button type="button" onClick={fechar}>
        {traduzir(idiomaDoAviso, 'aviso.fechar')}
      </button>
    </aside>
  );
}
