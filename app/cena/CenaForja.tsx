import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { SALAS } from '../../scripts/rotas.mjs';
import { Runa } from '../componentes/Runa';
import { salaDoCaminho } from '../i18n/idioma';
import {
  DURACAO_DA_VIAGEM,
  posicaoDaSala,
  type PosicaoDaCamera,
} from './camera';
import {
  Ambiente,
  ambientesDasSalas,
  type ImagensDoAmbiente,
  type Pasta,
} from './ambientes';
import { Faiscas } from './Faiscas';
import { Fogo } from './Fogo';
import { intensidadeDoFogo } from './intensidade';
import { useAnimacao } from './movimento';

// Ambiente de cada sala, na ordem da faixa (ADR 0002). Camadas estáticas por
// enquanto, com as faíscas (6.1) na bigorna. O fogo (6.2) fica fora da
// faixa, fixo na base, e muda de intensidade com a sala.
const AMBIENTES = {
  home: 'bigorna',
  projetos: 'arsenal',
  experiencias: 'linha-do-tempo',
  sobre: 'bancada',
  posts: 'biblioteca',
  contato: 'porta',
} as const;

/** Imagens dos ambientes (6.6), lidas uma vez: os arquivos vêm do build. */
const IMAGENS = ambientesDasSalas();

export function transformDaCamera({ x, y, zoom }: PosicaoDaCamera) {
  return `translate(${-100 * x}vw, ${-100 * y}vh) scale(${zoom})`;
}

/**
 * Cena da forja: montada uma vez no layout raiz e nunca remontada entre as
 * rotas. Só decora (aria-hidden, sem foco); o conteúdo de cada sala é HTML
 * normal por cima, legível sem ela.
 *
 * Câmera (3.4): o React já põe a faixa na posição da sala nova, e
 * useAnimacao (o Motion mini, pela Web Animations API) só anima a passagem da
 * posição antiga para ela; com movimento reduzido, não anima (3.6). A
 * navegação não espera: URL, foco e conteúdo mudam na hora. Quem entra
 * direto numa sala já começa nela, sem animar.
 */
export function CenaForja({
  imagens = IMAGENS,
}: {
  imagens?: Partial<Record<Pasta, ImagensDoAmbiente>>;
} = {}) {
  const { pathname } = useLocation();
  // Fora das salas (a 404), a câmera fica na bigorna, com a forja apagada.
  const naSala = salaDoCaminho(pathname);
  const sala = naSala ?? 'home';
  // Só as salas por onde a câmera já passou montam a imagem (6.6): o
  // loading=lazy do navegador baixaria a sala vizinha da faixa logo na entrada.
  const [visitadas, setVisitadas] = useState(() => new Set([sala]));
  if (!visitadas.has(sala)) setVisitadas(new Set(visitadas).add(sala));
  const destino = transformDaCamera(posicaoDaSala(sala));
  const { ref: faixa, animar, reduzido } = useAnimacao<HTMLDivElement>();
  const anterior = useRef(destino);

  useLayoutEffect(() => {
    const origem = anterior.current;
    anterior.current = destino;
    if (origem === destino) return;
    animar(
      { transform: [origem, destino] },
      { duration: DURACAO_DA_VIAGEM, ease: [0.65, 0, 0.35, 1] },
    );
  }, [destino, animar]);

  return (
    <div
      className="cena"
      aria-hidden="true"
      data-sala={sala}
      data-apagada={naSala ? undefined : ''}
    >
      <div
        ref={faixa}
        className="cena-faixa"
        style={{ transform: destino }}
        data-movimento={reduzido ? 'reduzido' : 'normal'}
      >
        {SALAS.map(({ sala: s }) => (
          <div
            key={s}
            className={`cena-sala cena-sala-${AMBIENTES[s]}`}
            data-ambiente={AMBIENTES[s]}
          >
            {visitadas.has(s) && (
              <Ambiente
                imagens={
                  // Na 404, a bigorna mostra a forja fria, se houver.
                  s === 'home' && !naSala
                    ? (imagens['404'] ?? imagens.home)
                    : imagens[s]
                }
                carregarJa={s === sala}
              />
            )}
            {s === 'home' ? (
              <Faiscas ativo={sala === 'home' && !!naSala} />
            ) : (
              <Runa nome={s} />
            )}
          </div>
        ))}
      </div>
      <Fogo intensidade={intensidadeDoFogo(naSala)} />
    </div>
  );
}
