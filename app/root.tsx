import { useEffect, type ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import { CenaForja } from './cena/CenaForja';
import { AnuncioDeSala } from './componentes/AnuncioDeSala';
import { SalaNaoEncontrada } from './componentes/SalaNaoEncontrada';
import { AvisoDeIdioma } from './componentes/AvisoDeIdioma';
import { Cabecalho } from './componentes/Cabecalho';
import { Rodape } from './componentes/Rodape';
import { linksDasFontes } from './estilos/fontes';
import { caminhoDaSala, LANG, useIdioma, useTraducao } from './i18n/idioma';
import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/layout.css';
import './estilos/cena.css';
import './estilos/salas.css';

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'icon', href: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  ...linksDasFontes(),
];

export function Layout({ children }: { children: ReactNode }) {
  const lang = LANG[useIdioma()];
  // O __spa-fallback.html sai em português; numa rota /en/ inexistente,
  // o lang do <html> é corrigido depois de carregar.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <CenaForja />
        <AvisoDeIdioma />
        <Cabecalho />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <Rodape />
        <AnuncioDeSala />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

// Página de erro do site. Endereço desconhecido cai na rota * (a 404 da
// forja); a 404 aqui cobre um erro 404 lançado por uma rota.
export function ErroDaForja({ status }: { status: number }) {
  const t = useTraducao();
  const idioma = useIdioma();
  if (status === 404)
    return (
      <>
        <title>{`${t('erro.404.titulo')} | ${t('site.nome')}`}</title>
        <SalaNaoEncontrada />
      </>
    );
  return (
    <div className="sala">
      <title>{`${t('erro.rotulo')} | ${t('site.nome')}`}</title>
      <h1>{t('erro.outro.titulo')}</h1>
      <p>{t('erro.outro.texto')}</p>
      <Link to={caminhoDaSala('home', idioma)}>{t('erro.voltar')}</Link>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <ErroDaForja status={isRouteErrorResponse(error) ? error.status : 500} />
  );
}
