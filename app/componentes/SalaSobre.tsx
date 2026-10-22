import simbolo from '../../marca/simbolo.svg?url';
import { skills } from '../conteudo/skills';
import {
  CATEGORIAS_DE_SKILL,
  NIVEIS_DE_SKILL,
  type CategoriaSkill,
  type NivelSkill,
} from '../conteudo/tipos';
import { skillsOrdenadas } from '../conteudo/validar';
import { useIdioma, useTraducao } from '../i18n/idioma';
import { Runa } from './Runa';

/** Grupos sempre à vista; os outros ficam em "Ver todas as skills". */
const PRINCIPAIS: readonly CategoriaSkill[] = [
  'linguagens',
  'frontend',
  'mobile',
  'backend',
  'ia',
];

// A imagem do Sobre vem do arquivo presente em app/imagens/sobre (issue 4.4):
// trocar o arquivo troca a variante, sem mudar o código.
const ARQUIVOS = import.meta.glob<string>(
  '../imagens/sobre/*.{avif,webp,jpg,jpeg,png}',
  { eager: true, query: '?url', import: 'default' },
);

type Variante =
  { nome: 'montagem' | 'encapuzado'; src: string } | { nome: 'marca' };

/** Montagem com as fotos; senão o ferreiro encapuzado; senão a marca. */
export function varianteDaImagem(
  arquivos: Readonly<Record<string, string>>,
): Variante {
  for (const nome of ['montagem', 'encapuzado'] as const) {
    const achado = Object.keys(arquivos)
      .sort()
      .find((caminho) => new RegExp(`/${nome}\\.\\w+$`).test(caminho));
    if (achado) return { nome, src: arquivos[achado] as string };
  }
  return { nome: 'marca' };
}

/** Quadrada, 480 px: as imagens da pasta seguem esse tamanho. */
const LADO = 480;

export function ImagemDoSobre({
  arquivos = ARQUIVOS,
}: {
  arquivos?: Readonly<Record<string, string>>;
}) {
  const t = useTraducao();
  const variante = varianteDaImagem(arquivos);
  const marca = variante.nome === 'marca';
  return (
    <img
      className={`imagem-sobre${marca ? ' imagem-marca' : ''}`}
      data-variante={variante.nome}
      src={marca ? simbolo : variante.src}
      alt={t(marca ? 'sobre.imagem.alt' : 'sobre.imagem.ferreiro')}
      width={LADO}
      height={LADO}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Sala Sobre e skills, a bancada (issue 4.4, tela aprovada no Stitch): quem
 * é, em três parágrafos, e as skills por grupo, na ordem de skillsOrdenadas.
 * "Ver todas as skills" é um <details>: abre sem JavaScript.
 */
export function SalaSobre() {
  const t = useTraducao();
  const outras = CATEGORIAS_DE_SKILL.filter((c) => !PRINCIPAIS.includes(c));

  return (
    <div className="sala sala-sobre">
      <header className="sala-cabecalho">
        <h1>
          <Runa nome="sobre" /> {t('sala.sobre.titulo')}
        </h1>
        <p>{t('sala.sobre.texto')}</p>
      </header>

      <section className="perfil" aria-labelledby="titulo-perfil">
        <ImagemDoSobre />
        <div>
          <h2 id="titulo-perfil">{t('sala.home.titulo')}</h2>
          <p className="cargo">{t('home.cargo')}</p>
        </div>
        <div className="perfil-texto">
          <p>{t('sobre.p1')}</p>
          <p>{t('sobre.p2')}</p>
          <p>{t('sobre.p3')}</p>
        </div>
      </section>

      <section aria-labelledby="titulo-skills">
        <h2 id="titulo-skills" className="titulo-secao">
          {t('sobre.skills')}
        </h2>
        <ul className="legenda" aria-label={t('sobre.legenda')}>
          {NIVEIS_DE_SKILL.map((nivel) => (
            <li key={nivel}>
              <Marcas nivel={nivel} /> {t(`nivel.${nivel}`)}
            </li>
          ))}
        </ul>
        <div className="grupos">
          {PRINCIPAIS.map((c) => (
            <GrupoDeSkills key={c} categoria={c} />
          ))}
        </div>
        <details className="todas-as-skills">
          <summary>{t('sobre.todas')}</summary>
          <div className="grupos">
            {outras.map((c) => (
              <GrupoDeSkills key={c} categoria={c} />
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}

function GrupoDeSkills({ categoria }: { categoria: CategoriaSkill }) {
  const t = useTraducao();
  const idioma = useIdioma();
  const lista = skillsOrdenadas(skills, categoria);
  return (
    <section
      className={`grupo-skills grupo-${categoria}`}
      aria-labelledby={`grupo-${categoria}`}
    >
      <h3 id={`grupo-${categoria}`}>{t(`categoria.${categoria}`)}</h3>
      <ul className="skills">
        {lista.map((s) => (
          <li key={s.id} className={`nivel-${s.nivel}`}>
            <span className="nome">{s.nome[idioma]}</span>{' '}
            <Marcas nivel={s.nivel} />
            <span className="so-leitor"> ({t(`nivel.${s.nivel}`)})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Três marcas: cheias = avançado, duas = intermediário, uma = básico. */
function Marcas({ nivel }: { nivel: NivelSkill }) {
  const cheias = NIVEIS_DE_SKILL.length - NIVEIS_DE_SKILL.indexOf(nivel);
  return (
    <span className="marcas" aria-hidden="true">
      {NIVEIS_DE_SKILL.map((_, i) => (
        <span key={i} className={i < cheias ? 'cheia' : undefined} />
      ))}
    </span>
  );
}
