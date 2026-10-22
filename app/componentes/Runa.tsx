// Runas de marca/runas/ (issue 1.4). Os SVGs entram no build como texto: a
// cor vem do CSS por currentColor e o tamanho acompanha o texto (1em).
const ARQUIVOS = import.meta.glob('../../marca/runas/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const NOMES_DAS_RUNAS = [
  'home',
  'projetos',
  'experiencias',
  'sobre',
  'posts',
  'contato',
  'baixar',
  'idioma',
  'voltar',
] as const;
export type NomeDaRuna = (typeof NOMES_DAS_RUNAS)[number];

// O nome acessível fica no <span>; o <title> do arquivo é para quem abre o SVG.
function limpar(svg: string) {
  return svg
    .trim()
    .replace(/<title[^>]*>.*?<\/title>/, '')
    .replace(/\s(role|aria-labelledby)="[^"]*"/g, '')
    .replace('<svg ', '<svg focusable="false" ');
}

export const RUNAS: Partial<Record<string, string>> = Object.fromEntries(
  Object.entries(ARQUIVOS).map(([caminho, svg]) => [
    caminho.replace(/^.*\/|\.svg$/g, ''),
    limpar(svg),
  ]),
);

/** Decorativa por padrão; com `rotulo`, vira imagem com nome acessível. */
export function Runa({ nome, rotulo }: { nome: NomeDaRuna; rotulo?: string }) {
  const acessivel = rotulo
    ? { role: 'img', 'aria-label': rotulo }
    : { 'aria-hidden': true };
  return (
    <span
      className="runa"
      {...acessivel}
      dangerouslySetInnerHTML={{ __html: RUNAS[nome] ?? '' }}
    />
  );
}
