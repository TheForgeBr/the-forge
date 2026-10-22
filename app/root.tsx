import { useEffect, type ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import { AvisoDeIdioma } from './componentes/AvisoDeIdioma';
import { Cabecalho } from './componentes/Cabecalho';
import { Rodape } from './componentes/Rodape';
import { linksDasFontes } from './estilos/fontes';
import { caminhoDaSala, LANG, useIdioma, useTraducao } from './i18n/idioma';
import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/layout.css';

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
        <AvisoDeIdioma />
        <Cabecalho />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <Rodape />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

// Página de erro do site. A 404 temática da forja chega na issue 4.6;
// até lá, esta versão simples evita a página genérica do React Router.
export function ErroDaForja({ status }: { status: number }) {
  const t = useTraducao();
  const idioma = useIdioma();
  const naoEncontrada = status === 404;
  return (
    <div className="sala">
      <title>
        {`${naoEncontrada ? t('erro.404.titulo') : t('erro.rotulo')} | ${t('site.nome')}`}
      </title>
      <h1>{naoEncontrada ? t('erro.404.titulo') : t('erro.outro.titulo')}</h1>
      <p>{naoEncontrada ? t('erro.404.texto') : t('erro.outro.texto')}</p>
      <a href={caminhoDaSala('home', idioma)}>{t('erro.voltar')}</a>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <ErroDaForja status={isRouteErrorResponse(error) ? error.status : 500} />
  );
}
