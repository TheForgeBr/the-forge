import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { skills } from '../conteudo/skills';
import { skillsOrdenadas } from '../conteudo/validar';
import { ImagemDoSobre, SalaSobre, varianteDaImagem } from './SalaSobre';

const em = (rota: string, ui: React.ReactNode) =>
  render(<MemoryRouter initialEntries={[rota]}>{ui}</MemoryRouter>);

describe('varianteDaImagem', () => {
  it('prefere a montagem, depois o encapuzado, depois a marca', () => {
    const montagem = { './sobre/montagem.webp': '/m.webp' };
    const encapuzado = { './sobre/encapuzado.webp': '/e.webp' };
    expect(varianteDaImagem({ ...encapuzado, ...montagem })).toEqual({
      nome: 'montagem',
      src: '/m.webp',
    });
    expect(varianteDaImagem(encapuzado)).toEqual({
      nome: 'encapuzado',
      src: '/e.webp',
    });
    expect(varianteDaImagem({})).toEqual({ nome: 'marca' });
  });
});

describe('ImagemDoSobre', () => {
  it.each([
    [{ './sobre/montagem.avif': '/m.avif' }, 'montagem'],
    [{ './sobre/encapuzado.jpg': '/e.jpg' }, 'encapuzado'],
    [{}, 'marca'],
  ])('cada variante tem alt e dimensões (%#)', (arquivos, nome) => {
    em('/sobre', <ImagemDoSobre arquivos={arquivos} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('data-variante', nome);
    expect(img.getAttribute('alt')).toMatch(/\w/);
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
  });

  it('o alt muda com o idioma', () => {
    em('/en/about', <ImagemDoSobre arquivos={{}} />);
    expect(screen.getByRole('img').getAttribute('alt')).toMatch(/anvil/i);
  });
});

describe('SalaSobre', () => {
  it('os grupos principais aparecem e o resto fica em "Ver todas as skills"', () => {
    em('/sobre', <SalaSobre />);
    const principais = screen.getByRole('region', { name: 'Skills' });
    for (const titulo of [
      'Linguagens',
      'Frontend',
      'Mobile',
      'Backend',
      'IA e agentes',
    ])
      expect(
        within(principais).getByRole('heading', { level: 3, name: titulo }),
      ).toBeInTheDocument();
    const todas = screen.getByText('Ver todas as skills').closest('details');
    expect(todas).not.toBeNull();
    expect(todas).toHaveTextContent('Testes');
  });

  it('as skills de cada grupo seguem skillsOrdenadas, com o nível em texto', () => {
    em('/sobre', <SalaSobre />);
    const grupo = screen
      .getByRole('heading', { level: 3, name: 'Linguagens' })
      .closest('section');
    const nomes = within(grupo as HTMLElement)
      .getAllByRole('listitem')
      .map((li) => li.querySelector('.nome')?.textContent);
    expect(nomes).toEqual(
      skillsOrdenadas(skills, 'linguagens').map((s) => s.nome.pt),
    );
    expect(grupo).toHaveTextContent('avançado');
  });

  it('todas as 48 skills aparecem uma vez', () => {
    const { container } = em('/sobre', <SalaSobre />);
    expect(container.querySelectorAll('.skills li')).toHaveLength(
      skills.length,
    );
  });
});

describe('arquivos de app/imagens/sobre', () => {
  it('cada imagem tem menos de 150 KB', () => {
    const pasta = join(__dirname, '../imagens/sobre');
    const imagens = readdirSync(pasta).filter((f) =>
      /\.(avif|webp|jpe?g|png)$/.test(f),
    );
    for (const f of imagens)
      expect(statSync(join(pasta, f)).size, f).toBeLessThan(150 * 1024);
  });
});
