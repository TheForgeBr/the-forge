import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import { linksDasFontes } from './estilos/fontes';
import './estilos/tokens.css';
import './estilos/base.css';

export const links: Route.LinksFunction = () => linksDasFontes();

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
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
  const naoEncontrada = status === 404;
  return (
    <main>
      <title>
        {naoEncontrada
          ? 'Página não encontrada | The Forge BR'
          : 'Erro | The Forge BR'}
      </title>
      <h1>
        {naoEncontrada ? 'Página não encontrada' : 'Algo deu errado na forja'}
      </h1>
      <p>
        {naoEncontrada
          ? 'Esta sala não existe na forja.'
          : 'Tente recarregar a página em instantes.'}
      </p>
      <a href="/">Voltar à forja</a>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <ErroDaForja status={isRouteErrorResponse(error) ? error.status : 500} />
  );
}
