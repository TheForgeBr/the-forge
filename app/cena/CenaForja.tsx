import { useLocation } from 'react-router';
import { SALAS } from '../../scripts/rotas.mjs';
import { Runa } from '../componentes/Runa';
import { salaDoCaminho } from '../i18n/idioma';

// Ambiente de cada sala, na ordem da faixa (ADR 0002). Camadas estáticas por
// enquanto: a câmera animada chega na 3.4, e fogo e faíscas na Etapa 6.
const AMBIENTES = {
  home: 'bigorna',
  projetos: 'arsenal',
  experiencias: 'linha-do-tempo',
  sobre: 'bancada',
  posts: 'biblioteca',
  contato: 'porta',
} as const;

/**
 * Cena da forja: montada uma vez no layout raiz e nunca remontada entre as
 * rotas. Só decora (aria-hidden, sem foco); o conteúdo de cada sala é HTML
 * normal por cima, legível sem ela.
 */
export function CenaForja() {
  const { pathname } = useLocation();
  const atual = SALAS.findIndex(
    (s) => s.sala === (salaDoCaminho(pathname) ?? 'home'),
  );
  return (
    <div className="cena" aria-hidden="true" data-sala={SALAS[atual]?.sala}>
      <div
        className="cena-faixa"
        style={{ transform: `translateX(${-100 * atual}vw)` }}
      >
        {SALAS.map(({ sala }) => (
          <div
            key={sala}
            className={`cena-sala cena-sala-${AMBIENTES[sala]}`}
            data-ambiente={AMBIENTES[sala]}
          >
            <Runa nome={sala} />
          </div>
        ))}
      </div>
    </div>
  );
}
