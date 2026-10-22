import { Sala } from '../componentes/Sala';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('experiencias', location.pathname);
}

export default function Experiencias() {
  return <Sala sala="experiencias" />;
}
