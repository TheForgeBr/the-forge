import { Sala } from '../componentes/Sala';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('projetos', location.pathname);
}

export default function Projetos() {
  return <Sala sala="projetos" />;
}
