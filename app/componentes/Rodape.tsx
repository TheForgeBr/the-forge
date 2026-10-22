import { useTraducao } from '../i18n/idioma';

/** Rodapé de todas as salas, com THE FORGE escrito em runas (ᚦᛖ ᚠᛟᚱᚷᛖ). */
export function Rodape() {
  const t = useTraducao();
  return (
    <footer className="rodape">
      <p>{t('rodape.texto')}</p>
      <p className="rodape-runas" role="img" aria-label={t('rodape.runas')}>
        ᚦᛖ ᚠᛟᚱᚷᛖ
      </p>
    </footer>
  );
}
