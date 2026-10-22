import { SalaHome } from '../componentes/SalaHome';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('home', location.pathname);
}

export default function Home() {
  return <SalaHome />;
}
