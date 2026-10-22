import { useTraducao } from '../i18n/idioma';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('home', location.pathname);
}

export default function Home() {
  const t = useTraducao();
  return (
    <div className="sala">
      <h1>{t('sala.home.titulo')}</h1>
      <p>{t('sala.home.texto')}</p>
      <p>
        <code>git commit -m &quot;olá forja&quot;</code>
      </p>
    </div>
  );
}
