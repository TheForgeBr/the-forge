import type { NomeDaSala } from '../../scripts/rotas.mjs';
import { useTraducao } from '../i18n/idioma';

/** Conteúdo provisório de uma sala, até a tela aprovada no Stitch. */
export function Sala({ sala }: { sala: NomeDaSala }) {
  const t = useTraducao();
  return (
    <main>
      <h1>{t(`sala.${sala}.titulo`)}</h1>
      <p>{t(`sala.${sala}.texto`)}</p>
    </main>
  );
}
