import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Ambiente,
  LIMITE_POR_ARQUIVO,
  ambientesDasSalas,
  problemasDosAmbientes,
} from './ambientes';

const completo = (sala: string) => ({
  [`../imagens/salas/${sala}/celular.avif`]: `/${sala}-c.avif`,
  [`../imagens/salas/${sala}/celular.webp`]: `/${sala}-c.webp`,
  [`../imagens/salas/${sala}/desktop.avif`]: `/${sala}-d.avif`,
  [`../imagens/salas/${sala}/desktop.webp`]: `/${sala}-d.webp`,
});

describe('ambientesDasSalas', () => {
  it('agrupa os arquivos por sala, variante e formato', () => {
    const ambientes = ambientesDasSalas({
      ...completo('home'),
      ...completo('404'),
    });
    expect(ambientes.home?.desktop.avif).toBe('/home-d.avif');
    expect(ambientes.home?.celular.webp).toBe('/home-c.webp');
    expect(ambientes['404']?.celular.avif).toBe('/404-c.avif');
    expect(ambientes.projetos).toBeUndefined();
  });
});

describe('problemasDosAmbientes', () => {
  const kb = (n: number) => n * 1024;

  it('aceita uma sala com as quatro variantes dentro do limite', () => {
    const arquivos = [
      'celular.avif',
      'celular.webp',
      'desktop.avif',
      'desktop.webp',
    ];
    expect(
      problemasDosAmbientes([
        {
          pasta: 'home',
          arquivos: arquivos.map((nome) => ({ nome, bytes: kb(90) })),
        },
      ]),
    ).toEqual([]);
  });

  it('acusa variante faltando, pasta desconhecida e arquivo pesado', () => {
    const problemas = problemasDosAmbientes([
      {
        pasta: 'home',
        arquivos: [
          { nome: 'celular.avif', bytes: kb(90) },
          { nome: 'celular.webp', bytes: kb(90) },
          { nome: 'desktop.avif', bytes: kb(90) },
          { nome: 'desktop.webp', bytes: LIMITE_POR_ARQUIVO + 1 },
        ],
      },
      { pasta: 'cozinha', arquivos: [] },
      { pasta: 'sobre', arquivos: [{ nome: 'celular.webp', bytes: kb(10) }] },
    ]);
    expect(problemas).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^home\/desktop\.webp: .* acima de 150 KB/),
        expect.stringMatching(/^cozinha: pasta que não é sala/),
        expect.stringMatching(/^sobre: falta celular\.avif/),
        expect.stringMatching(/^sobre: falta desktop\.webp/),
      ]),
    );
  });

  it('as pastas de app/imagens/salas estão completas e leves', () => {
    const raiz = join(__dirname, '../imagens/salas');
    const pastas = readdirSync(raiz, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => ({
        pasta: e.name,
        arquivos: readdirSync(join(raiz, e.name)).map((nome) => ({
          nome,
          bytes: statSync(join(raiz, e.name, nome)).size,
        })),
      }));
    expect(problemasDosAmbientes(pastas)).toEqual([]);
  });
});

describe('Ambiente', () => {
  it('sem imagem, não desenha nada: fica o degradê da sala', () => {
    const { container } = render(<Ambiente imagens={undefined} carregarJa />);
    expect(container.innerHTML).toBe('');
  });

  it('com imagem, usa AVIF e WebP por largura e é só decoração', () => {
    const imagens = ambientesDasSalas(completo('home')).home;
    const { container } = render(
      <Ambiente imagens={imagens} carregarJa={false} />,
    );
    const fontes = [...container.querySelectorAll('source')].map((s) => [
      s.getAttribute('media'),
      s.getAttribute('type'),
      s.getAttribute('srcset'),
    ]);
    expect(fontes).toEqual([
      ['(min-width: 48rem)', 'image/avif', '/home-d.avif'],
      ['(min-width: 48rem)', 'image/webp', '/home-d.webp'],
      [null, 'image/avif', '/home-c.avif'],
    ]);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/home-c.webp');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('a sala atual carrega na hora', () => {
    const imagens = ambientesDasSalas(completo('home')).home;
    const { container } = render(<Ambiente imagens={imagens} carregarJa />);
    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
  });
});
