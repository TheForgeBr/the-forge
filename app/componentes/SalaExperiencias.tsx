import { experiencias as todasAsExperiencias } from '../conteudo/experiencias';
import type { Experiencia, Idioma, Mes, Periodo } from '../conteudo/tipos';
import { MESES } from '../i18n/datas';
import { useIdioma, useTraducao } from '../i18n/idioma';
import { Runa } from './Runa';

const ATUAL: Record<Idioma, string> = { pt: 'atual', en: 'present' };

function partes(mes: Mes, idioma: Idioma) {
  const [ano, numero] = mes.split('-');
  return { ano: ano ?? '', mes: MESES[idioma][Number(numero) - 1] ?? '' };
}

function comAno(mes: Mes, idioma: Idioma) {
  const p = partes(mes, idioma);
  return idioma === 'pt' ? `${p.mes}/${p.ano}` : `${p.mes} ${p.ano}`;
}

/** Texto de cada ponta do período; no mesmo ano, o início fica só com o mês. */
function pontas(periodo: Periodo, idioma: Idioma) {
  const { inicio, fim } = periodo;
  if (fim === 'atual') return [comAno(inicio, idioma), ATUAL[idioma]] as const;
  const mesmoAno = inicio.slice(0, 4) === fim.slice(0, 4);
  return [
    mesmoAno ? partes(inicio, idioma).mes : comAno(inicio, idioma),
    comAno(fim, idioma),
  ] as const;
}

/** Período como aparece na linha do tempo: "mai – set/2026", "Sep 2026 – present". */
export function formatarPeriodo(periodo: Periodo, idioma: Idioma) {
  return pontas(periodo, idioma).join(' – ');
}

/**
 * Sala Experiências, o corredor das crônicas (issue 4.3, tela aprovada no
 * Stitch). Lista ordenada da mais recente à mais antiga, na ordem de
 * experiencias.ts; a SETA-AI aparece só com papel e stack.
 */
export function SalaExperiencias({
  experiencias = todasAsExperiencias,
}: {
  experiencias?: readonly Experiencia[];
}) {
  const t = useTraducao();
  return (
    <div className="sala sala-experiencias">
      <header className="sala-cabecalho">
        <h1>
          <Runa nome="experiencias" /> {t('sala.experiencias.titulo')}
        </h1>
        <p>{t('sala.experiencias.texto')}</p>
      </header>

      <ol className="linha-do-tempo" aria-label={t('experiencias.linha')}>
        {experiencias.map((e) => (
          <ItemDaLinha key={e.id} experiencia={e} />
        ))}
      </ol>
    </div>
  );
}

function ItemDaLinha({ experiencia: e }: { experiencia: Experiencia }) {
  const t = useTraducao();
  const idioma = useIdioma();
  const atual = e.periodo.fim === 'atual';
  const [inicio, fim] = pontas(e.periodo, idioma);
  return (
    <li
      className={`marco${atual ? ' marco-atual' : ''}`}
      aria-labelledby={`experiencia-${e.id}`}
    >
      <div className="cartao-experiencia">
        <div className="cartao-topo">
          <p className="periodo">
            <time dateTime={e.periodo.inicio}>{inicio}</time> –{' '}
            {e.periodo.fim === 'atual' ? (
              fim
            ) : (
              <time dateTime={e.periodo.fim}>{fim}</time>
            )}
          </p>
          {atual && (
            <span className="selo-atual">{t('experiencias.atual')}</span>
          )}
        </div>
        <h2 id={`experiencia-${e.id}`}>{e.empresa}</h2>
        <p className="papel">{e.papel[idioma]}</p>
        {e.resumo && <p className="resumo">{e.resumo[idioma]}</p>}
        {e.entregas && (
          <ul className="entregas">
            {e.entregas[idioma].map((entrega) => (
              <li key={entrega}>{entrega}</li>
            ))}
          </ul>
        )}
        <ul className="stack" aria-label="Stack">
          {e.stack.map((tecnologia) => (
            <li key={tecnologia}>{tecnologia}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}
