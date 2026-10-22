import { SalaContato } from '../componentes/SalaContato';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('contato', location.pathname);
}

export default function Contato() {
  return <SalaContato />;
}
