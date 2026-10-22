import { SalaProjetos } from '../componentes/SalaProjetos';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('projetos', location.pathname);
}

export default function Projetos() {
  return <SalaProjetos />;
}
