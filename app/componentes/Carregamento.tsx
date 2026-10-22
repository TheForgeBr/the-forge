import { useEffect } from 'react';
import { marcarPronto } from '../carregamento';
import { useTraducao } from '../i18n/idioma';
import { MarteloEBigorna } from './MarteloEBigorna';

/**
 * Tela de carregamento (issue 6.4): o martelo élfico batendo na bigorna, com o
 * nome e o cargo já legíveis, como na tela do Stitch. Fica escondida no HTML e
 * só aparece com o atributo data-carregando no <html>, que o script do <head>
 * põe numa primeira visita lenta. Ao montar (o React hidratou), marca o site
 * como pronto e a tela some na hora. É só decoração: o conteúdo de verdade
 * está no HTML por baixo.
 */
export function Carregamento() {
  const t = useTraducao();

  useEffect(() => {
    marcarPronto(window);
  }, []);

  return (
    <div className="carregamento" aria-hidden="true">
      <MarteloEBigorna className="carregamento-martelo" />
      <p className="carregamento-nome">{t('sala.home.titulo')}</p>
      <p className="carregamento-cargo">{t('home.cargo')}</p>
    </div>
  );
}
