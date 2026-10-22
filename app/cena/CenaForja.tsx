import { useAnimate } from 'motion/react-mini';
import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { SALAS } from '../../scripts/rotas.mjs';
import { Runa } from '../componentes/Runa';
import { salaDoCaminho } from '../i18n/idioma';
import {
  DURACAO_DA_VIAGEM,
  posicaoDaSala,
  type PosicaoDaCamera,
} from './camera';
import { useMovimentoReduzido } from './movimento';

// Ambiente de cada sala, na ordem da faixa (ADR 0002). Camadas estáticas por
// enquanto: fogo e faíscas chegam na Etapa 6.
const AMBIENTES = {
  home: 'bigorna',
  projetos: 'arsenal',
  experiencias: 'linha-do-tempo',
  sobre: 'bancada',
  posts: 'biblioteca',
  contato: 'porta',
} as const;

export function transformDaCamera({ x, y, zoom }: PosicaoDaCamera) {
  return `translate(${-100 * x}vw, ${-100 * y}vh) scale(${zoom})`;
}

/**
 * Cena da forja: montada uma vez no layout raiz e nunca remontada entre as
 * rotas. Só decora (aria-hidden, sem foco); o conteúdo de cada sala é HTML
 * normal por cima, legível sem ela.
 *
 * Câmera (3.4): o React já põe a faixa na posição da sala nova, e o Motion
 * (versão mini, pela Web Animations API) só anima a passagem da posição
 * antiga para ela. A navegação não espera: URL, foco e conteúdo mudam na hora.
 * Quem entra direto numa sala já começa nela, sem animar.
 */
export function CenaForja() {
  const { pathname } = useLocation();
  const sala = salaDoCaminho(pathname) ?? 'home';
  const destino = transformDaCamera(posicaoDaSala(sala));
  const reduzido = useMovimentoReduzido();
  const [faixa, animar] = useAnimate<HTMLDivElement>();
  const anterior = useRef(destino);

  useLayoutEffect(() => {
    const origem = anterior.current;
    anterior.current = destino;
    // Sem a Web Animations API (navegador antigo), a câmera só troca de sala.
    if (origem === destino || reduzido || !faixa.current?.animate) return;
    animar(
      faixa.current,
      { transform: [origem, destino] },
      { duration: DURACAO_DA_VIAGEM, ease: [0.65, 0, 0.35, 1] },
    );
  }, [destino, reduzido, animar, faixa]);

  return (
    <div className="cena" aria-hidden="true" data-sala={sala}>
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
            <Runa nome={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
