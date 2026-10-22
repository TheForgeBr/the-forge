/**
 * Martelo élfico e bigorna, em SVG (issues 6.3 e 6.4), hoje na tela de
 * carregamento. À moda dos Noldor de Fëanor (Docs/design/referencias-elficas.md):
 * curvas longas em vez de blocos. Cabo fino com gancho no punho e um filete;
 * cabeça com a face de bater em bloco e filete (um martelo, não uma lâmina),
 * garra em crescente no alto e um arco vazado até o cabo; no pescoço, uma folha
 * de luz azul, como a das Silmarils. A batida e o brilho do impacto são
 * animações CSS (carregamento.css), paradas com movimento reduzido.
 */
export function MarteloEBigorna({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="20 28 92 62"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="aco-do-martelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="aco-claro" />
          <stop offset="1" className="aco-escuro" />
        </linearGradient>
      </defs>
      <path
        className="bigorna"
        transform="translate(22 37)"
        d="M4 25 H54 V31 H48 Q42 33 40 39 V45 H46 V51 H18 V45 H24 V39 Q22 33 14 31 Q7 29 4 25 Z"
      />
      {/* Onde a cabeça encosta na bigorna: o brilho da batida. */}
      <circle className="impacto" cx="49" cy="62" r="5" />
      <g className="martelo">
        <path
          className="martelo-aco"
          d="M52 54 L100 55 C103 55.1 105 56 106.5 58.5 C105 57.9 103.4 57.5 101 57.3 L52 58 Z"
        />
        <path className="martelo-filete" d="M68 56 C76 55.4 86 56.5 96 56" />
        <path
          className="martelo-aco"
          d="M44 54 C43.6 56.5 42.6 58.5 41 59.3 L41 62 L57 62 L57 59.3 C55.4 58.5 54.4 56.5 54 54 Z M44 54 C43 49 44 43 47 39 C49.5 35.5 54 33.5 59 34 C55 35.5 52.5 38.5 52 43 L52 54 Z M55.5 36.2 C59 40 60.5 47 65 54.6 L62.5 54.7 C58.8 48.5 57 41.5 54 37.5 Z"
        />
        <path className="martelo-filete" d="M41.6 60.2 H56.4" />
        <path
          className="martelo-luz"
          d="M46.6 51 C45.9 47.5 46.8 44.5 49.2 42.6 C49.1 45.8 48.8 48.8 46.6 51 Z"
        />
      </g>
    </svg>
  );
}
