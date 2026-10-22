import { Sala } from '../componentes/Sala';
import { metaDaSala } from '../site';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('posts', location.pathname);
}

export default function Posts() {
  return <Sala sala="posts" />;
}
