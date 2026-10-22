import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import type { NomeDaSala } from '../../scripts/rotas.mjs';
import { idiomaDoCaminho, salaDoCaminho, traduzir } from '../i18n/idioma';

type NomeNoMenu = Exclude<NomeDaSala, 'contato'>;

/**
 * Navegação de SPA não avisa a troca de página (issue 3.5). Ao mudar de sala,
 * o foco vai para o <h1> da sala nova e uma região aria-live anuncia o nome
 * dela. No primeiro carregamento nada muda: o leitor já lê a página do topo.
 * Não espera a câmera: acontece logo depois da troca de rota.
 */
export function AnuncioDeSala() {
  const { pathname } = useLocation();
  const [anuncio, setAnuncio] = useState('');
  const primeiro = useRef(true);

  useEffect(() => {
    if (primeiro.current) {
      primeiro.current = false;
      return;
    }
    const sala = salaDoCaminho(pathname);
    const idioma = idiomaDoCaminho(pathname);
    const titulo = document.querySelector<HTMLElement>('main h1');
    if (titulo) {
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    }
    setAnuncio(
      sala === 'contato'
        ? traduzir(idioma, 'nav.contato')
        : sala
          ? traduzir(idioma, `nav.${sala as NomeNoMenu}`)
          : (titulo?.textContent ?? ''),
    );
    // Só a troca de rota move o foco; outras renderizações (abrir o menu) não.
  }, [pathname]);

  return (
    <p className="so-leitor" aria-live="polite" aria-atomic="true">
      {anuncio}
    </p>
  );
}
