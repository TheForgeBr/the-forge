import { SalaNaoEncontrada } from '../componentes/SalaNaoEncontrada';
import { idiomaDoCaminho, traduzir } from '../i18n/idioma';

// Qualquer endereço fora das salas (issue 4.6). Pré-renderizada em /404 e
// /en/404, que o Render entrega para as rotas desconhecidas (render.yaml).
export function meta({ location }: { location: { pathname: string } }) {
  const idioma = idiomaDoCaminho(location.pathname);
  return [
    {
      title: `${traduzir(idioma, 'erro.404.titulo')} | ${traduzir(idioma, 'site.nome')}`,
    },
    { name: 'robots', content: 'noindex' },
  ];
}

export default function NaoEncontrada() {
  return <SalaNaoEncontrada />;
}
