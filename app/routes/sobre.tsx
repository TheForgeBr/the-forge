import { Sala } from '../componentes/Sala';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('sobre', location.pathname);
}

export default function Sobre() {
  return <Sala sala="sobre" />;
}
