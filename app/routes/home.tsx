import type { Route } from './+types/home';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'The Forge BR' },
    { name: 'description', content: 'Site pessoal de Rhuan Marques.' },
  ];
}

export default function Home() {
  return (
    <main>
      <h1>olá forja</h1>
    </main>
  );
}
