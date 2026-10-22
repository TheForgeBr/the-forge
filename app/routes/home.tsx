export function meta() {
  return [
    { title: 'The Forge BR' },
    { name: 'description', content: 'Site pessoal de Rhuan Marques.' },
  ];
}

export default function Home() {
  return (
    <main>
      <h1>olá forja</h1>
      <p>
        A forja está acendendo: cada sala deste site vai mostrar uma parte do
        meu trabalho.
      </p>
      <p>
        <code>git commit -m &quot;olá forja&quot;</code>
      </p>
    </main>
  );
}
