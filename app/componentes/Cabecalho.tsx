import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router';
import { SALAS, type NomeDaSala } from '../../scripts/rotas.mjs';
import logo from '../../marca/logo.svg?url';
import {
  caminhoDaSala,
  salaDoCaminho,
  useIdioma,
  useTraducao,
} from '../i18n/idioma';
import { Runa } from './Runa';
import { SeletorDeIdioma } from './SeletorDeIdioma';

const semAssinatura = () => () => {};

/**
 * Topo fixo de todas as salas (issue 3.2): pular para o conteúdo, logo,
 * links das salas com a atual marcada, seletor de idioma e Contato. No
 * celular, o menu abre e fecha; sem JavaScript, os links ficam sempre à vista.
 */
export function Cabecalho() {
  const t = useTraducao();
  const idioma = useIdioma();
  const { pathname } = useLocation();
  const salaAtual = salaDoCaminho(pathname);
  // false no pré-render: o HTML sai com o menu aberto, para quem lê sem JS.
  const hidratado = useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
  const [aberto, setAberto] = useState(false);

  // Fecha o menu ao trocar de sala.
  const [caminhoAnterior, setCaminhoAnterior] = useState(pathname);
  if (caminhoAnterior !== pathname) {
    setCaminhoAnterior(pathname);
    setAberto(false);
  }

  useEffect(() => {
    if (!aberto) return;
    const fecharComEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('keydown', fecharComEsc);
    return () => document.removeEventListener('keydown', fecharComEsc);
  }, [aberto]);

  const estadoDoMenu = !hidratado ? 'sem-js' : aberto ? 'aberto' : 'fechado';

  return (
    <header className="cabecalho" data-menu={estadoDoMenu}>
      <a className="pular" href="#conteudo">
        {t('nav.pular')}
      </a>
      <a
        className="cabecalho-logo"
        href={caminhoDaSala('home', idioma)}
        aria-label={t('nav.inicio')}
      >
        <img src={logo} alt="" width="147" height="40" />
      </a>
      {hidratado && (
        <button
          type="button"
          className="cabecalho-menu"
          aria-expanded={aberto}
          aria-controls="salas"
          onClick={() => setAberto((a) => !a)}
        >
          {aberto ? t('nav.fechar') : t('nav.abrir')}
        </button>
      )}
      <nav
        id="salas"
        className="cabecalho-salas"
        aria-label={t('nav.principal')}
      >
        <ul>
          {SALAS.filter(({ sala }) => sala !== 'contato').map(({ sala }) => (
            <li key={sala}>
              <LinkDaSala sala={sala} atual={sala === salaAtual} />
            </li>
          ))}
        </ul>
        <div className="cabecalho-acoes">
          <SeletorDeIdioma />
          <a
            className="botao-contato"
            href={caminhoDaSala('contato', idioma)}
            aria-current={salaAtual === 'contato' ? 'page' : undefined}
          >
            <Runa nome="contato" /> {t('nav.contato')}
          </a>
        </div>
      </nav>
    </header>
  );
}

function LinkDaSala({ sala, atual }: { sala: NomeDaSala; atual: boolean }) {
  const t = useTraducao();
  const idioma = useIdioma();
  return (
    <a
      href={caminhoDaSala(sala, idioma)}
      aria-current={atual ? 'page' : undefined}
    >
      <Runa nome={sala} /> {t(`nav.${sala as Exclude<NomeDaSala, 'contato'>}`)}
    </a>
  );
}
