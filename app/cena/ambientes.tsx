import { SALAS, type NomeDaSala } from '../../scripts/rotas.mjs';

// Ambientes das salas (issue 6.6): a imagem pintada atrás do conteúdo de cada
// sala da faixa, como as telas do Stitch. Os arquivos ficam em
// app/imagens/salas/<sala>/ (e 404/ para a forja fria), em duas variantes
// (celular em pé e desktop deitado) e dois formatos (AVIF e WebP). Trocar o
// arquivo troca a imagem sem mudar código; sem arquivo, fica o degradê da sala.

export const VARIANTES = ['celular', 'desktop'] as const;
export const FORMATOS = ['avif', 'webp'] as const;
/** Peso máximo de cada arquivo (ADR 0003): a imagem não pode pesar a carga. */
export const LIMITE_POR_ARQUIVO = 150 * 1024;

type Variante = (typeof VARIANTES)[number];
type Formato = (typeof FORMATOS)[number];
export type Pasta = NomeDaSala | '404';
export type ImagensDoAmbiente = Record<
  Variante,
  Partial<Record<Formato, string>>
>;

const PASTAS: readonly string[] = [...SALAS.map((s) => s.sala), '404'];

const ARQUIVOS = import.meta.glob<string>('../imagens/salas/*/*.{avif,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Agrupa os arquivos encontrados por sala, variante e formato. */
export function ambientesDasSalas(
  arquivos: Readonly<Record<string, string>> = ARQUIVOS,
): Partial<Record<Pasta, ImagensDoAmbiente>> {
  const ambientes: Partial<Record<Pasta, ImagensDoAmbiente>> = {};
  for (const [caminho, url] of Object.entries(arquivos)) {
    const achado = /\/salas\/([^/]+)\/(celular|desktop)\.(avif|webp)$/.exec(
      caminho,
    );
    if (!achado || !PASTAS.includes(achado[1]!)) continue;
    const pasta = achado[1] as Pasta;
    const variante = achado[2] as Variante;
    const formato = achado[3] as Formato;
    const imagens = (ambientes[pasta] ??= { celular: {}, desktop: {} });
    imagens[variante][formato] = url;
  }
  return ambientes;
}

export interface PastaNoDisco {
  readonly pasta: string;
  readonly arquivos: readonly {
    readonly nome: string;
    readonly bytes: number;
  }[];
}

/** O que falta ou sobra nas pastas de imagens; vazio quando está tudo certo. */
export function problemasDosAmbientes(pastas: readonly PastaNoDisco[]) {
  const problemas: string[] = [];
  for (const { pasta, arquivos } of pastas) {
    if (!PASTAS.includes(pasta)) {
      problemas.push(
        `${pasta}: pasta que não é sala (use ${PASTAS.join(', ')})`,
      );
      continue;
    }
    const nomes = arquivos.map((a) => a.nome);
    for (const variante of VARIANTES)
      for (const formato of FORMATOS) {
        const nome = `${variante}.${formato}`;
        if (!nomes.includes(nome)) problemas.push(`${pasta}: falta ${nome}`);
      }
    for (const { nome, bytes } of arquivos)
      if (bytes > LIMITE_POR_ARQUIVO)
        problemas.push(
          `${pasta}/${nome}: ${(bytes / 1024).toFixed(1)} KB, acima de ${LIMITE_POR_ARQUIVO / 1024} KB`,
        );
  }
  return problemas;
}

/**
 * Imagem do ambiente, atrás do conteúdo. A sala atual carrega na hora; as
 * outras esperam o navegador (carregamento tardio), sem entrar no orçamento de
 * JavaScript. Sem imagem, não desenha nada e fica o degradê.
 */
export function Ambiente({
  imagens,
  carregarJa,
}: {
  imagens: ImagensDoAmbiente | undefined;
  carregarJa: boolean;
}) {
  if (!imagens) return null;
  const { celular, desktop } = imagens;
  const reserva = celular.webp ?? desktop.webp ?? celular.avif ?? desktop.avif;
  if (!reserva) return null;
  return (
    <picture className="ambiente">
      {desktop.avif && (
        <source
          media="(min-width: 48rem)"
          type="image/avif"
          srcSet={desktop.avif}
        />
      )}
      {desktop.webp && (
        <source
          media="(min-width: 48rem)"
          type="image/webp"
          srcSet={desktop.webp}
        />
      )}
      {celular.avif && <source type="image/avif" srcSet={celular.avif} />}
      <img
        src={reserva}
        alt=""
        loading={carregarJa ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}
