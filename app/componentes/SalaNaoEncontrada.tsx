import { Link } from 'react-router';
import { caminhoDaSala, useIdioma, useTraducao } from '../i18n/idioma';
import { Runa } from './Runa';

/**
 * A forja apagada (issue 4.6, tela aprovada no Stitch): a página de qualquer
 * endereço que não é uma sala. Leva de volta à Home, a Projetos e a Contato.
 */
export function SalaNaoEncontrada() {
  const t = useTraducao();
  const idioma = useIdioma();
  return (
    <div className="sala sala-404">
      <p className="codigo-404" aria-hidden="true">
        404
      </p>
      <h1>{t('erro.404.chamada')}</h1>
      <p className="texto-404">{t('erro.404.texto')}</p>
      <p className="chamadas">
        <Link className="botao" to={caminhoDaSala('home', idioma)}>
          <Runa nome="voltar" /> {t('erro.voltar')}
        </Link>
      </p>
      <p className="links-404">
        <Link to={caminhoDaSala('projetos', idioma)}>{t('nav.projetos')}</Link>
        <Link to={caminhoDaSala('contato', idioma)}>{t('nav.contato')}</Link>
      </p>
    </div>
  );
}
