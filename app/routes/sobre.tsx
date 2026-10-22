import { SalaSobre } from '../componentes/SalaSobre';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('sobre', location.pathname);
}

export default function Sobre() {
  return <SalaSobre />;
}
