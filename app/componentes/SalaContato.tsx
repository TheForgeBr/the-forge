import { type Canal, CONTATOS, CURRICULO } from '../conteudo/contato';
import { useTraducao } from '../i18n/idioma';
import { type NomeDaRuna, Runa } from './Runa';

// Ordem e runa de cada canal; as runas só decoram.
const CANAIS: readonly { canal: Canal; runa: NomeDaRuna }[] = [
  { canal: 'whatsapp', runa: 'contato' },
  { canal: 'email', runa: 'posts' },
  { canal: 'linkedin', runa: 'sobre' },
  { canal: 'github', runa: 'projetos' },
];

/**
 * Sala Contato, o portão (issue 4.5, tela aprovada no Stitch): um botão por
 * canal, com os dados de app/conteudo/contato.ts, e o currículo em destaque.
 */
export function SalaContato() {
  const t = useTraducao();
  return (
    <div className="sala sala-contato">
      <header className="sala-cabecalho">
        <h1>
          <Runa nome="contato" /> {t('sala.contato.titulo')}
        </h1>
        <p>{t('contato.convite')}</p>
      </header>

      <ul className="canais">
        {CANAIS.map(({ canal, runa }) => {
          const href = CONTATOS[canal];
          return (
            <li key={canal}>
              <a
                className="canal"
                href={href}
                rel={
                  href.startsWith('http') ? 'noopener noreferrer' : undefined
                }
              >
                <Runa nome={runa} />
                <span className="nome">{t(`contato.${canal}`)}</span>
                <span className="detalhe">{t(`contato.${canal}.detalhe`)}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p>
        <a className="botao botao-curriculo" href={CURRICULO} download>
          <Runa nome="baixar" /> {t('contato.curriculo')}
        </a>
      </p>
      <p className="idiomas">{t('contato.idiomas')}</p>
    </div>
  );
}
