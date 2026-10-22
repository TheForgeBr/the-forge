import { useState } from 'react';
import { projetos as todosOsProjetos } from '../conteudo/projetos';
import type { Projeto } from '../conteudo/tipos';
import { useIdioma, useTraducao } from '../i18n/idioma';
import { useHidratado } from './hidratado';
import { Runa } from './Runa';

/** Tecnologias que viram filtro: as que aparecem em pelo menos `minimo` projetos. */
export function tecnologiasDosFiltros(
  projetos: readonly Projeto[],
  minimo = 3,
) {
  const contagem = new Map<string, number>();
  for (const p of projetos)
    for (const t of p.stack) contagem.set(t, (contagem.get(t) ?? 0) + 1);
  return [...contagem]
    .filter(([, n]) => n >= minimo)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

/**
 * Sala Projetos, o arsenal (issue 4.2, tela aprovada no Stitch). O primeiro
 * projeto em destaque abre a grade em tamanho maior; os outros seguem a ordem
 * de projetos.ts. Os filtros só aparecem com JavaScript: sem ele, tudo à vista.
 */
export function SalaProjetos({
  projetos = todosOsProjetos,
}: {
  projetos?: readonly Projeto[];
}) {
  const t = useTraducao();
  const hidratado = useHidratado();
  const [filtro, setFiltro] = useState<string | null>(null);
  const filtros = tecnologiasDosFiltros(projetos);
  const visiveis = filtro
    ? projetos.filter((p) => p.stack.includes(filtro))
    : projetos;
  const destaque = visiveis.find((p) => p.destaque);

  return (
    <div className="sala sala-projetos">
      <header className="sala-cabecalho">
        <h1>
          <Runa nome="projetos" /> {t('sala.projetos.titulo')}
        </h1>
        <p>{t('projetos.introducao')}</p>
      </header>

      {hidratado && (
        <div className="filtros" role="group" aria-label={t('projetos.filtro')}>
          {[null, ...filtros].map((tecnologia) => (
            <button
              key={tecnologia ?? 'todos'}
              type="button"
              aria-pressed={filtro === tecnologia}
              onClick={() => setFiltro(tecnologia)}
            >
              {tecnologia ?? t('projetos.todos')}
            </button>
          ))}
        </div>
      )}

      <p className="contagem" aria-live="polite">
        {visiveis.length} {t('projetos.quantos')}
      </p>

      {visiveis.length === 0 ? (
        <p>{t('projetos.nenhum')}</p>
      ) : (
        <ul className="grade-projetos">
          {visiveis.map((p) => (
            <li key={p.id}>
              <CartaoDeProjeto projeto={p} emDestaque={p === destaque} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CartaoDeProjeto({
  projeto: p,
  emDestaque,
}: {
  projeto: Projeto;
  emDestaque: boolean;
}) {
  const t = useTraducao();
  const idioma = useIdioma();
  return (
    <article
      className={`cartao-projeto${emDestaque ? ' em-destaque' : ''}`}
      aria-labelledby={`projeto-${p.id}`}
    >
      {emDestaque && <p className="selo-destaque">{t('projetos.destaque')}</p>}
      <div className="cartao-topo">
        <h2 id={`projeto-${p.id}`}>{p.titulo[idioma]}</h2>
        <span className={`estado estado-${p.estado}`}>
          {t(`estado.${p.estado}`)}
        </span>
      </div>
      {p.resumo && <p className="resumo">{p.resumo[idioma]}</p>}
      <p className="papel">
        <span>{t('projetos.papel')}:</span> {p.papel[idioma]}
      </p>
      <ul className="stack" aria-label="Stack">
        {p.stack.map((tecnologia) => (
          <li key={tecnologia}>{tecnologia}</li>
        ))}
      </ul>
      <p className="links">
        {p.links?.repositorio ? (
          <a href={p.links.repositorio} rel="noopener noreferrer">
            {t('projetos.codigo')}
          </a>
        ) : (
          p.privacidade === 'completo' && (
            <span className="privado">{t('projetos.privado')}</span>
          )
        )}
        {p.links?.site && (
          <a href={p.links.site} rel="noopener noreferrer">
            {t('projetos.site')}
          </a>
        )}
      </p>
    </article>
  );
}
