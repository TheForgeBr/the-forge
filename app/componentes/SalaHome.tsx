import { Link } from 'react-router';
import type { NomeDaSala } from '../../scripts/rotas.mjs';
import { experiencias } from '../conteudo/experiencias';
import { projetos } from '../conteudo/projetos';
import { skills } from '../conteudo/skills';
import type { Chave } from '../i18n/pt';
import { caminhoDaSala, useIdioma, useTraducao } from '../i18n/idioma';
import { Runa } from './Runa';

/**
 * Sala Home, a bigorna (issue 4.1, tela aprovada no Stitch): quem é, o que
 * faz, a stack principal e as chamadas para Projetos e Contato. Os três
 * cartões levam às salas e usam só os dados de app/conteudo.
 */
export function SalaHome() {
  const t = useTraducao();
  const idioma = useIdioma();
  const projeto = projetos.find((p) => p.destaque) ?? projetos[0];
  const atual = experiencias.find((e) => e.periodo.fim === 'atual');
  const principais = skills.filter((s) => s.destaque);

  return (
    <div className="sala sala-home">
      <section className="apresentacao" aria-labelledby="titulo-home">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 id="titulo-home">{t('sala.home.titulo')}</h1>
        <p className="cargo">{t('home.cargo')}</p>
        <p className="frase">{t('sala.home.texto')}</p>
        <ul className="stack" aria-label="Stack">
          {principais.map((s) => (
            <li key={s.id}>{s.nome[idioma]}</li>
          ))}
        </ul>
        <p className="chamadas">
          <Link className="botao" to={caminhoDaSala('projetos', idioma)}>
            {t('home.projetos')}
          </Link>
          <Link
            className="botao botao-secundario"
            to={caminhoDaSala('contato', idioma)}
          >
            {t('home.contato')}
          </Link>
        </p>
      </section>

      <section aria-labelledby="titulo-destaques">
        <h2 id="titulo-destaques" className="titulo-secao">
          {t('home.destaques')}
        </h2>
        <ul className="destaques">
          {projeto && (
            <Destaque
              sala="projetos"
              rotulo="home.destaque.projeto"
              titulo={projeto.titulo[idioma]}
              texto={projeto.resumo?.[idioma] ?? projeto.papel[idioma]}
            />
          )}
          {atual && (
            <Destaque
              sala="experiencias"
              rotulo="home.destaque.experiencia"
              titulo={atual.empresa}
              texto={atual.papel[idioma]}
            />
          )}
          <Destaque
            sala="posts"
            rotulo="home.destaque.posts"
            titulo={t('sala.posts.titulo')}
            texto={t('sala.posts.texto')}
          />
        </ul>
      </section>
    </div>
  );
}

function Destaque({
  sala,
  rotulo,
  titulo,
  texto,
}: {
  sala: NomeDaSala;
  rotulo: Chave;
  titulo: string;
  texto: string;
}) {
  const t = useTraducao();
  const idioma = useIdioma();
  return (
    <li>
      <Link className="cartao-destaque" to={caminhoDaSala(sala, idioma)}>
        <Runa nome={sala} />
        <span className="rotulo">{t(rotulo)}</span>
        <span className="titulo">{titulo}</span>
        <span className="texto">{texto}</span>
      </Link>
    </li>
  );
}
